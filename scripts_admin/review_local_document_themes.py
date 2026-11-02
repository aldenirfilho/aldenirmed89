#!/usr/bin/env python3
"""Revisa apenas os documentos pendentes e preserva originais e catálogo anterior.

As decisões são privadas e usam o contrato estrito do manifesto local. O modo
padrão só prepara um plano. --apply substitui somente os artefatos gerados,
mantendo duas cópias anteriores ocultas ao lado deles, com rollback em falha.
Não extrai texto nem lê bytes de documentos e não faz chamadas de rede.
"""
from __future__ import annotations

import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import sys
import tempfile
import time

import organize_icloud_documents as organize

SCHEMA = "360x-document-topic-review-v1"
CATALOG_FILES = {"index.html", "catalogo.csv", "revisao.csv", "LEIA-ME.txt"}


def _digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _json(path):
    if path.is_symlink() or path.stat().st_size > 8 * 1024 * 1024:
        raise organize.OrganizationError("Artefato de revisão inválido.")
    return json.loads(path.read_text(encoding="utf-8"))


def _text(value, limit):
    return isinstance(value, str) and 0 < len(value) <= limit and not any(ord(c) < 32 or ord(c) == 127 for c in value)


def _contains_url(value):
    if isinstance(value, str):
        return bool(re.search(r"(?:\b(?:https?|ftps?|file|data|blob|javascript|mailto|tel|sms|smb|ssh|about):|[a-z][a-z0-9+.-]*://|(?:^|\s)(?:www\.|//))", value, re.I))
    if isinstance(value, list):
        return any(_contains_url(item) for item in value)
    return False


def _validate_entry(entry):
    if not isinstance(entry, dict) or set(entry) != set(organize.ENTRY_FIELDS):
        raise organize.OrganizationError("Campos de classificação fora do contrato.")
    if organize._native_relative(entry["path"]) != entry["path"]:
        raise organize.OrganizationError("Caminho não normalizado.")
    if type(entry["size"]) is not int or entry["size"] <= 0 or type(entry["modifiedMs"]) is not int or entry["modifiedMs"] < 0:
        raise organize.OrganizationError("Fingerprint inválido.")
    if (entry["theme"] not in organize.THEMES or entry["themeLabel"] != organize.THEMES[entry["theme"]]
            or entry["confidence"] not in {"alta", "media", "baixa"}
            or entry["method"] not in {"nome", "pasta", "titulo", "texto", "revisao"}
            or type(entry["needsReview"]) is not bool or not _text(entry["reason"], 500)):
        raise organize.OrganizationError("Classificação inválida.")
    if (not isinstance(entry["matchedTerms"], list) or len(entry["matchedTerms"]) > 100
            or any(not _text(t, 120) for t in entry["matchedTerms"])
            or not isinstance(entry["secondaryThemes"], list) or len(entry["secondaryThemes"]) > 32
            or any(t not in organize.THEMES or t == entry["theme"] for t in entry["secondaryThemes"])):
        raise organize.OrganizationError("Assuntos de busca inválidos.")
    if (entry["confidence"] == "baixa" or entry["theme"] == "inbox-revisar") and not entry["needsReview"]:
        raise organize.OrganizationError("Incerteza deve permanecer sinalizada.")
    if any(_contains_url(value) for key, value in entry.items() if key != "path"):
        raise organize.OrganizationError("A revisão contém URLs fora do contrato local.")


def _catalog_entries(source):
    catalog = source / organize.CATALOG_NAME
    if catalog.is_symlink() or not catalog.is_dir():
        raise organize.OrganizationError("Catálogo original indisponível.")
    html = catalog / "index.html"
    if html.is_symlink() or html.stat().st_size > 12 * 1024 * 1024:
        raise organize.OrganizationError("Catálogo inválido.")
    match = re.search(r'<script id="catalog-data" type="application/json">(.*?)</script>', html.read_text(), re.S)
    if not match:
        raise organize.OrganizationError("Catálogo gerado não reconhecido.")
    data = json.loads(match.group(1))
    if data.get("sourceName") != source.name or data.get("complete") is not True:
        raise organize.OrganizationError("Revisão exige catálogo completo da origem.")
    return [{key: item[key] for key in organize.ENTRY_FIELDS} for item in data["items"]]


def _artifact_snapshot(source):
    """Somente arquivos gerados; links são registrados sem ler seus destinos."""
    catalog = source / organize.CATALOG_NAME
    snapshot = {}
    for path in catalog.rglob("*"):
        relative = path.relative_to(catalog).as_posix()
        if path.is_symlink():
            snapshot[relative] = ["link", os.readlink(path)]
        elif path.is_dir():
            snapshot[relative] = ["directory"]
        elif path.is_file() and relative in CATALOG_FILES:
            snapshot[relative] = ["file", _digest(path)]
        else:
            raise organize.OrganizationError("Conteúdo não gerado no catálogo; preserve e confira antes de revisar.")
    return snapshot


def prepare(source, inventory_path, decisions_path):
    source = Path(source)
    if source.is_symlink():
        raise organize.OrganizationError("Origem simbólica recusada.")
    source = source.resolve(strict=True)
    payload, originals, by_path, extensions, scanned, _ = organize._load_inventory(source, Path(inventory_path), False)
    manifest_path = source / organize.MANIFEST_NAME
    manifest = _json(manifest_path)
    if set(manifest) != {"schema", "sourceName", "entries"} or manifest["schema"] != "library-local-themes-v1" or manifest["sourceName"] != source.name:
        raise organize.OrganizationError("Manifesto local não reconhecido.")
    existing = _catalog_entries(source)
    previous = {}
    for entry in existing:
        _validate_entry(entry)
        path = entry["path"]
        if path in previous or path not in by_path:
            raise organize.OrganizationError("Documento duplicado ou fora do inventário.")
        original = by_path[path]
        if (entry["size"], entry["modifiedMs"]) != (original["size"], original["modifiedNs"] // 1_000_000):
            raise organize.OrganizationError("Documento mudou desde a organização anterior.")
        previous[path] = entry
    if set(previous) != set(by_path):
        raise organize.OrganizationError("Catálogo e inventário não cobrem os mesmos documentos.")
    if manifest["entries"] != [e for e in existing if by_path[e["path"]]["webEligible"]]:
        raise organize.OrganizationError("Catálogo e manifesto anterior divergem.")
    decisions = _json(Path(decisions_path))
    if set(decisions) != {"schema", "sourceName", "entries"} or decisions["schema"] != SCHEMA or decisions["sourceName"] != source.name or not isinstance(decisions["entries"], list):
        raise organize.OrganizationError("Contrato de revisão inválido.")
    pending = {path for path, e in previous.items() if e["theme"] == "inbox-revisar"}
    reviewed = {}
    for entry in decisions["entries"]:
        _validate_entry(entry)
        path = entry["path"]
        if path not in pending or path in reviewed:
            raise organize.OrganizationError("Revisão deve conter somente os pendentes, sem duplicatas.")
        if any(entry[field] != previous[path][field] for field in ("size", "modifiedMs")):
            raise organize.OrganizationError("Fingerprint da decisão diverge do documento.")
        reviewed[path] = entry
    if set(reviewed) != pending:
        raise organize.OrganizationError("A revisão deve cobrir todos os documentos pendentes.")
    entries = [reviewed.get(e["path"], e) for e in existing]
    catalog, links = [], []
    for index, entry in enumerate(entries, 1):
        original = by_path[entry["path"]]
        catalog.append({**entry, "webEligible": original["webEligible"]})
        links.append({"link": (PurePosixPath(entry["theme"]) / organize._link_filename(original, index)).as_posix(), "original": original})
    plan = {"source": source, "originals": originals, "extensions": extensions, "scanPaths": scanned,
            "allowPartial": False, "complete": True, "links": links, "catalog": catalog,
            "manifest": {**manifest, "entries": [e for e in entries if by_path[e["path"]]["webEligible"]]},
            "priorManifestSha256": _digest(manifest_path), "priorArtifacts": _artifact_snapshot(source)}
    # Verifica cada atalho anterior antes de preparar qualquer substituição.
    for index, entry in enumerate(existing, 1):
        original = by_path[entry["path"]]
        alias = source / organize.CATALOG_NAME / entry["theme"] / organize._link_filename(original, index)
        if not alias.is_symlink() or os.path.isabs(os.readlink(alias)) or alias.resolve(strict=True) != (source / original["rawPath"]).resolve(strict=True):
            raise organize.OrganizationError("Atalho anterior ausente ou diferente do original.")
    plan["summary"] = {"schema": "360x-private-document-review-plan-v1", "sourceName": payload["sourceName"],
        "createdAt": datetime.now(timezone.utc).isoformat(), "documents": len(entries), "reviewed": len(reviewed),
        "reclassified": sum(e["theme"] != "inbox-revisar" for e in reviewed.values()),
        "stillUnclassified": sum(e["theme"] == "inbox-revisar" for e in reviewed.values()),
        "classifiedEntriesPreserved": len(entries) - len(reviewed),
        "needsReview": sum(e["needsReview"] for e in entries), "themes": dict(Counter(e["theme"] for e in entries)),
        "priorManifestSha256": plan["priorManifestSha256"], "originalsModified": False, "privateDocumentsPublished": False}
    return plan


def _check_prior(plan):
    organize._check_scan(plan)
    if _digest(plan["source"] / organize.MANIFEST_NAME) != plan["priorManifestSha256"] or _artifact_snapshot(plan["source"]) != plan["priorArtifacts"]:
        raise organize.OrganizationError("Artefatos mudaram após a preparação; revisão recusada.")


def apply_prepared(plan):
    _check_prior(plan)
    source = plan["source"]
    stage = Path(tempfile.mkdtemp(prefix=".360x-review-stage-", dir=source))
    stage_identity = organize._identity(stage)
    stamp = str(time.time_ns())
    catalog = source / organize.CATALOG_NAME
    manifest = source / organize.MANIFEST_NAME
    backup_catalog = source / (".360x-catalog-before-review-" + stamp)
    backup_manifest = source / (".360x-manifest-before-review-" + stamp + ".json")
    moved = []
    installed = []
    try:
        for link in plan["links"]:
            alias = stage / link["link"]
            alias.parent.mkdir(exist_ok=True)
            target = source / link["original"]["rawPath"]
            os.symlink(os.path.relpath(target, (catalog / link["link"]).parent), alias)
            if alias.resolve(strict=True) != target.resolve(strict=True):
                raise organize.OrganizationError("Novo atalho divergiu do original.")
        (stage / "index.html").write_text(organize._catalog_html(plan), encoding="utf-8")
        (stage / "catalogo.csv").write_text(organize._csv_text(plan["catalog"]), encoding="utf-8", newline="")
        (stage / "revisao.csv").write_text(organize._csv_text([e for e in plan["catalog"] if e["needsReview"]]), encoding="utf-8", newline="")
        (stage / "LEIA-ME.txt").write_text("BIBLIOTECA 360X — REVISÃO TEMÁTICA\n\nOriginais preservados. A revisão altera somente catálogo, manifesto e atalhos relativos.\nAs versões anteriores permanecem em pastas/arquivos ocultos .360x-*-before-review-* na mesma origem.\nClassificação de assunto não equivale à validação clínica. Itens incertos continuam sinalizados.\nAbra index.html para busca e filtros; reconecte a pasta na Biblioteca IA para atualizar.\n", encoding="utf-8")
        pending = stage / ".manifest-prepared.json"
        pending.write_text(json.dumps(plan["manifest"], ensure_ascii=False, indent=2, allow_nan=False) + "\n", encoding="utf-8")
        os.chmod(pending, 0o600)
        _check_prior(plan)
        for current, backup in ((catalog, backup_catalog), (manifest, backup_manifest)):
            identity = organize._identity(current)
            organize._rename_exclusive(current, backup)
            moved.append((current, backup, identity))
        organize._rename_exclusive(stage, catalog)
        installed.append((catalog, stage_identity))
        pending = catalog / pending.name
        pending_identity = organize._identity(pending)
        organize._rename_exclusive(pending, manifest)
        installed.append((manifest, pending_identity))
        organize._verify_written(plan)
        return {**plan["summary"], "applied": True, "verifiedLinks": len(plan["links"]),
                "backupCatalog": str(backup_catalog), "backupManifest": str(backup_manifest)}
    except BaseException:
        for path, identity in reversed(installed):
            organize._remove_owned(path, identity)
        for current, backup, identity in reversed(moved):
            if organize._identity(backup) != identity or organize._exists(current):
                raise organize.OrganizationError("Conflito ao restaurar artefatos; cópias anteriores preservadas.")
            organize._rename_exclusive(backup, current)
        raise
    finally:
        organize._remove_owned(stage, stage_identity)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--inventory", type=Path, required=True)
    parser.add_argument("--decisions", type=Path, required=True)
    parser.add_argument("--plan-output", type=Path, required=True)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args(argv)
    try:
        plan = prepare(args.source, args.inventory, args.decisions)
        organize._write_private_plan(args.plan_output, plan["summary"], plan["source"])
        result = apply_prepared(plan) if args.apply else {**plan["summary"], "applied": False}
    except (organize.OrganizationError, OSError, ValueError, KeyError, TypeError):
        print(json.dumps({"ok": False, "message": "Revisão recusada; confira decisões, inventário e artefatos anteriores."}), file=sys.stderr)
        return 1
    print(json.dumps({"ok": True, **result}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
