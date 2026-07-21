#!/usr/bin/env python3
"""Valida ou atualiza, com atestações explícitas, o baseline público da Biblioteca.

Este comando não move nem publica arquivos. Ele apenas registra a impressão
digital do conjunto que já foi revisado fora da automação. Atualizar o baseline
sem realizar as revisões declaradas constitui uso incorreto do portão.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import sys
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCANNER_PATH = ROOT / "02_Biblioteca_IA_Engine/scan_biblioteca.py"
BASELINE_PATH = ROOT / "02_Biblioteca_IA_Engine/data/biblioteca_publication_baseline.json"


def load_scanner():
    spec = importlib.util.spec_from_file_location("library_scanner_for_baseline", SCANNER_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("Scanner da Biblioteca indisponível.")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def current_snapshot() -> tuple[str, int, int, list[dict], list[dict]]:
    scanner = load_scanner()
    assets = scanner.collect_public_assets()
    files = scanner.collect_files()
    unexpected = scanner.unexpected_public_assets(files, assets)
    if unexpected:
        sample = ", ".join(unexpected[:3])
        raise RuntimeError(
            "O acervo contém arquivo(s) sem suporte no catálogo: "
            f"{sample}. Mova-os para o staging privado ou implemente o formato."
        )
    return scanner.corpus_fingerprint(assets), len(assets), len(files), assets, files


def read_baseline() -> dict:
    try:
        return json.loads(BASELINE_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise RuntimeError("Baseline ausente ou inválido.") from exc


def check() -> int:
    fingerprint, asset_count, document_count, _, _ = current_snapshot()
    baseline = read_baseline()
    if (
        baseline.get("corpusFingerprint") != fingerprint
        or baseline.get("publicAssetCount") != asset_count
        or baseline.get("documentCount") != document_count
    ):
        print("❌ Acervo divergiu do baseline de publicação.", file=sys.stderr)
        return 1
    print(
        f"✅ Baseline público confere: {document_count} documento(s), "
        f"{asset_count} arquivo(s) fisicamente publicável(is)."
    )
    return 0


def approve(args: argparse.Namespace) -> int:
    required = (
        args.attest_authorship_license,
        args.attest_privacy,
        args.attest_clinical_review,
    )
    if not all(required):
        print("❌ As três atestações são obrigatórias; o baseline não foi alterado.", file=sys.stderr)
        return 2
    reviewer = args.reviewer.strip()
    change_note = args.change_note.strip()
    if len(reviewer) < 3 or len(change_note) < 12:
        print("❌ Informe revisor e descrição objetiva da mudança.", file=sys.stderr)
        return 2

    fingerprint, asset_count, document_count, assets, files = current_snapshot()
    try:
        previous_manifest = json.loads(
            (ROOT / "02_Biblioteca_IA_Engine/data/biblioteca_documentos_manifest.json").read_text(encoding="utf-8")
        )
    except (OSError, json.JSONDecodeError) as exc:
        raise RuntimeError("Manifesto anterior inválido; não é possível identificar o lote.") from exc
    previous = {
        item.get("path"): item.get("sourceSha256")
        for item in previous_manifest.get("files", [])
        if isinstance(item, dict) and item.get("path")
    }
    current = {item["path"]: item["sourceSha256"] for item in assets}
    reviewed_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    approved_changes = [
        {
            "path": path,
            "sourceSha256": digest,
            "changeType": "added" if path not in previous else "modified",
            "reviewedAt": reviewed_at,
        }
        for path, digest in sorted(current.items())
        if previous.get(path) != digest
    ]
    removed_paths = sorted(set(previous) - set(current))
    if not approved_changes and not removed_paths:
        print("❌ Nenhuma mudança física foi detectada; o baseline não foi alterado.", file=sys.stderr)
        return 2
    payload = {
        "schemaVersion": 1,
        "corpusFingerprint": fingerprint,
        "publicAssetCount": asset_count,
        "documentCount": document_count,
        "recordedAt": reviewed_at,
        "approvalMode": "explicit-corpus-attestation",
        "reviewer": reviewer,
        "changeNote": change_note,
        "attestations": {
            "authorshipAndLicenseReviewed": True,
            "privacyAndPatientDataReviewed": True,
            "clinicalSafetyReviewed": True,
        },
        "approvedChanges": approved_changes,
        "removedPaths": removed_paths,
        "warning": "A atestação registra a revisão declarada; não substitui prova documental de licença ou auditoria clínica.",
    }
    BASELINE_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(
        f"✅ Novo baseline registrado para {document_count} documento(s) e "
        f"{asset_count} arquivo(s) publicável(is). Revise e commite o diff."
    )
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Portão explícito do acervo público da Biblioteca.")
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true")
    mode.add_argument("--approve", action="store_true")
    parser.add_argument("--reviewer", default="")
    parser.add_argument("--change-note", default="")
    parser.add_argument("--attest-authorship-license", action="store_true")
    parser.add_argument("--attest-privacy", action="store_true")
    parser.add_argument("--attest-clinical-review", action="store_true")
    args = parser.parse_args(argv)
    try:
        return check() if args.check else approve(args)
    except (OSError, RuntimeError, ValueError) as exc:
        print(f"❌ {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
