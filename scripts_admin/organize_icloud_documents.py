#!/usr/bin/env python3
"""Cria um catálogo temático local de PDF/DOC2026 sem mover originais.

Modo padrão: somente plano privado. --apply cria dois destinos novos, sem
sobrescrever: biblioteca-temas-360x.json e 00_ORGANIZADOS_POR_TEMA. A extração
local é opcional; nenhum byte de documento ou imagem é lido por este script.
Um inventário incompleto exige --allow-partial e produz identificação explícita
de cobertura parcial. Texto integral nunca entra em HTML, CSV ou manifesto.
"""
from __future__ import annotations

import argparse
from collections import Counter
import csv
from datetime import datetime, timezone
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import stat
import sys
import tempfile
import unicodedata
from urllib.parse import quote

from document_theme_classifier import CLASSIFIER_VERSION, THEMES, classify_document
# Apenas primitivas genéricas já verificadas; nenhuma rotina de imagens é chamada.
from organize_icloud_images import (OrganizationError, _csv_safe, _exists, _identity,
                                   _inside, _remove_owned, _rename_exclusive, _safe_json)

MANIFEST_NAME = "biblioteca-temas-360x.json"
CATALOG_NAME = "00_ORGANIZADOS_POR_TEMA"
EXCLUDED_DIRECTORIES = {CATALOG_NAME, "00_ORGANIZACAO_360X"}
SUPPORTED_EXTENSIONS = frozenset({".pdf", ".doc", ".docx", ".odt", ".rtf", ".txt", ".md", ".markdown", ".csv", ".pages"})
ENTRY_FIELDS = ("path", "size", "modifiedMs", "theme", "themeLabel", "confidence",
                "method", "matchedTerms", "secondaryThemes", "needsReview", "reason")
CLASSIFICATION_FIELDS = set(ENTRY_FIELDS) - {"path", "size", "modifiedMs"}
REPO_ROOT = Path(__file__).resolve().parents[1]
WEB_PATH_REASON = "Caminho original não suportado na biblioteca web; use o atalho local e confira a classificação."


def _integer(value, label):
    if type(value) is not int or value < 0:
        raise OrganizationError("Metadado inteiro inválido: " + label)
    return value


def _native_relative(value):
    # Em POSIX, ':' e '\\' podem ser nomes reais; nunca viram URLs ou escapes.
    if not isinstance(value, str) or not value or "\x00" in value:
        raise OrganizationError("Caminho nativo relativo inválido.")
    parts = value.split("/")
    if value.startswith("/") or any(part in {"", ".", ".."} for part in parts):
        raise OrganizationError("Caminho absoluto ou traversal no inventário.")
    return unicodedata.normalize("NFC", value)


def _web_eligible(value):
    return not ("\\" in value or any(ord(char) < 32 or ord(char) == 127 for char in value)
                or re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", value))


def _fingerprint(relative_path, size, modified_ns):
    material = json.dumps([unicodedata.normalize("NFC", relative_path), size, modified_ns],
                          ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(material.encode("utf-8")).hexdigest()


def _source_file(source, raw_path):
    _native_relative(raw_path)
    current = source
    try:
        for part in raw_path.split("/"):
            current = current / part
            info = current.lstat()
            if stat.S_ISLNK(info.st_mode):
                raise OrganizationError("Link simbólico em caminho de documento; operação recusada.")
        if not stat.S_ISREG(info.st_mode) or not _inside(current.resolve(strict=True), source):
            raise OrganizationError("Documento fora da origem ou não regular.")
    except OSError as exc:
        raise OrganizationError("Original do inventário indisponível.") from exc
    return current, info


def _check_originals(source, originals):
    for original in originals:
        _, info = _source_file(source, original["rawPath"])
        if (info.st_size, info.st_mtime_ns) != (original["size"], original["modifiedNs"]):
            raise OrganizationError("Fingerprint do documento mudou; gere novo inventário/extração.")


def _scan_document_paths(source, extensions, allow_partial=False):
    found, errors = set(), []
    for base, dirs, files in os.walk(source, followlinks=False, onerror=errors.append):
        dirs[:] = [name for name in dirs if not name.startswith(".") and name not in EXCLUDED_DIRECTORIES
                   and Path(name).suffix.lower() != ".pages"
                   and not (Path(base) / name).is_symlink()]
        for filename in files:
            # Filtrar extensão ANTES de stat: assets PNG/JPG não são consultados.
            if filename.startswith(".") or Path(filename).suffix.lower() not in extensions:
                continue
            file = Path(base) / filename
            if file.is_symlink():
                continue  # Atalhos preexistentes são preservados, nunca inventariados.
            relative = file.relative_to(source).as_posix()
            normalized = _native_relative(relative)
            _source_file(source, relative)
            if normalized in found:
                raise OrganizationError("Colisão Unicode entre documentos na origem.")
            found.add(normalized)
    if errors and not allow_partial:
        raise OrganizationError("Varredura incompleta por erro de acesso; não aplicar como completa.")
    return found, len(errors)


def _load_inventory(source, inventory_path, allow_partial):
    try:
        payload = json.loads(inventory_path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        raise OrganizationError("Não foi possível ler o inventário de documentos.") from exc
    if not isinstance(payload, dict) or payload.get("schema") != "360x-private-documents-inventory-v1":
        raise OrganizationError("Schema de inventário não reconhecido.")
    source_name = payload.get("sourceName")
    if source_name not in {"PDF", "DOC2026", "DOC 2026"} or source.name != source_name:
        raise OrganizationError("Nome da origem não corresponde a PDF/DOC2026.")
    complete = payload.get("complete")
    if type(complete) is not bool or (not complete and not allow_partial):
        raise OrganizationError("Inventário incompleto exige --allow-partial explícito.")
    errors = payload.get("errors")
    summary, documents = payload.get("summary"), payload.get("documents")
    if not isinstance(errors, list) or not isinstance(summary, dict) or not isinstance(documents, list):
        raise OrganizationError("Estrutura de inventário inválida.")
    if complete and errors:
        raise OrganizationError("Inventário declarado completo contém erros.")
    if "documents" in summary and summary["documents"] != len(documents):
        raise OrganizationError("Contagem de documentos inconsistente.")
    extensions = payload.get("eligibleExtensions", sorted(SUPPORTED_EXTENSIONS))
    if not isinstance(extensions, list) or not extensions or any(e not in SUPPORTED_EXTENSIONS for e in extensions):
        raise OrganizationError("Extensões de documento não suportadas.")
    if set(extensions) != SUPPORTED_EXTENSIONS:
        raise OrganizationError("Inventário deve abranger as dez extensões de documentos previstas.")
    originals, by_path = [], {}
    for item in documents:
        if not isinstance(item, dict):
            raise OrganizationError("Entrada de documento inválida.")
        raw = item.get("relativePath")
        normalized = _native_relative(raw)
        if normalized in by_path:
            raise OrganizationError("Caminhos duplicados após normalização NFC.")
        extension = PurePosixPath(raw).suffix.lower()
        if extension not in extensions or item.get("extension", extension) != extension:
            raise OrganizationError("Extensão do documento diverge do inventário.")
        size = _integer(item.get("size"), "size")
        modified_ns = _integer(item.get("modifiedNs"), "modifiedNs")
        original = {"path": normalized, "rawPath": raw, "size": size, "modifiedNs": modified_ns,
                    "id": _fingerprint(normalized, size, modified_ns), "webEligible": _web_eligible(normalized)}
        originals.append(original)
        by_path[normalized] = original
    _check_originals(source, originals)
    scanned, scan_errors = _scan_document_paths(source, set(extensions), allow_partial and not complete)
    if (complete and scanned != set(by_path)) or not set(by_path).issubset(scanned):
        raise OrganizationError("A origem e o inventário têm conjuntos de documentos diferentes.")
    return payload, originals, by_path, set(extensions), scanned, scan_errors


def _load_text(text_path, by_path):
    latest = {}
    if text_path is None:
        return latest
    try:
        stream = text_path.open(encoding="utf-8")
    except OSError as exc:
        raise OrganizationError("Não foi possível abrir a extração JSONL local.") from exc
    with stream:
        for number, line in enumerate(stream, 1):
            if not line.strip():
                continue
            try:
                item = json.loads(line)
            except ValueError as exc:
                raise OrganizationError("Linha de extração JSONL inválida: " + str(number)) from exc
            if not isinstance(item, dict) or item.get("schema") != "360x-document-text-v1":
                raise OrganizationError("Schema de extração não reconhecido.")
            normalized = _native_relative(item.get("relativePath"))
            original = by_path.get(normalized)
            if original is None:
                raise OrganizationError("Extração contém documento ausente deste inventário.")
            size, modified_ns = _integer(item.get("size"), "size extraído"), _integer(item.get("modifiedNs"), "mtime extraído")
            if (size, modified_ns, item.get("id")) != (original["size"], original["modifiedNs"], original["id"]):
                raise OrganizationError("Fingerprint da extração diverge do inventário.")
            if type(item.get("ok")) is not bool or not isinstance(item.get("title", ""), str) or not isinstance(item.get("text", ""), str):
                raise OrganizationError("Resultado de extração inválido.")
            if "partial" in item and type(item["partial"]) is not bool:
                raise OrganizationError("Indicador partial inválido.")
            latest[normalized] = item
    return latest


def _classification(original, extracted):
    title = extracted.get("title", "") if extracted and extracted["ok"] else ""
    text = extracted.get("text", "") if extracted and extracted["ok"] else ""
    result = classify_document(original["path"], title=title, text=text,
                               original_folder=PurePosixPath(original["path"]).parent.as_posix())
    if not isinstance(result, dict) or set(result) != CLASSIFICATION_FIELDS:
        raise OrganizationError("O classificador retornou campos inesperados.")
    if (result["theme"] not in THEMES or result["themeLabel"] != THEMES[result["theme"]]
        or result["confidence"] not in {"alta", "media", "baixa"}
        or result["method"] not in {"nome", "pasta", "titulo", "texto", "revisao"}
        or type(result["needsReview"]) is not bool):
        raise OrganizationError("Classificação temática inválida.")
    if (not isinstance(result["matchedTerms"], list) or any(not isinstance(t, str) for t in result["matchedTerms"])
        or not isinstance(result["secondaryThemes"], list) or len(result["secondaryThemes"]) > 2
        or any(t not in THEMES for t in result["secondaryThemes"]) or not isinstance(result["reason"], str)):
        raise OrganizationError("Metadados temáticos inválidos.")
    result = dict(result)
    if not original["webEligible"]:
        result.update(needsReview=True, reason=WEB_PATH_REASON)
    return result


def _link_filename(original, index):
    stem = PurePosixPath(original["path"]).stem
    ascii_name = unicodedata.normalize("NFKD", stem).encode("ascii", "ignore").decode()
    slug = "-".join(re.findall(r"[a-z0-9]+", ascii_name.lower()))[:54].strip("-") or "documento"
    digest = hashlib.sha256(original["path"].encode()).hexdigest()[:20]
    return f"{index:05d}-{slug}-{digest}{PurePosixPath(original['path']).suffix.lower()}"


def _new_targets(source):
    for name in (MANIFEST_NAME, CATALOG_NAME):
        if _exists(source / name):
            raise OrganizationError("Destino já existe; nada será sobrescrito: " + name)


def prepare(source, inventory_path, text_path=None, allow_partial=False):
    source = Path(source)
    if source.is_symlink():
        raise OrganizationError("A origem não pode ser um link simbólico.")
    source = source.resolve(strict=True)
    if not source.is_dir():
        raise OrganizationError("A origem deve ser uma pasta.")
    _new_targets(source)
    payload, originals, by_path, extensions, scanned, scan_errors = _load_inventory(source, Path(inventory_path), allow_partial)
    extracted = _load_text(Path(text_path) if text_path is not None else None, by_path)
    entries, catalog, links = [], [], []
    for index, original in enumerate(originals, 1):
        entry = {"path": original["path"], "size": original["size"], "modifiedMs": original["modifiedNs"] // 1_000_000,
                 **_classification(original, extracted.get(original["path"]))}
        if set(entry) != set(ENTRY_FIELDS):
            raise OrganizationError("Entrada de manifesto fora do contrato.")
        if original["webEligible"]:
            entries.append(entry)
        catalog.append({**entry, "webEligible": original["webEligible"]})
        links.append({"link": (PurePosixPath(entry["theme"]) / _link_filename(original, index)).as_posix(), "original": original})
    summary = {"schema": "360x-private-document-organization-plan-v1", "state": "planned",
        "createdAt": datetime.now(timezone.utc).isoformat(), "classifierVersion": CLASSIFIER_VERSION,
        "source": str(source), "sourceName": payload["sourceName"], "complete": payload["complete"],
        "allowPartial": bool(allow_partial), "documentCount": len(originals), "manifestEntries": len(entries),
        "excludedWebPaths": len(catalog) - len(entries), "observedDocuments": len(scanned),
        "unindexedDocuments": len(scanned) - len(originals), "scanErrors": scan_errors,
        "inventoryErrors": len(payload["errors"]), "themes": dict(Counter(e["theme"] for e in catalog)),
        "needsReview": sum(e["needsReview"] for e in catalog),
        "originalMetadataSnapshotSha256": hashlib.sha256("\n".join(sorted(o["id"] for o in originals)).encode()).hexdigest(),
        "extraction": {"successful": sum(r["ok"] for r in extracted.values()), "failed": sum(not r["ok"] for r in extracted.values()),
                       "notProcessed": len(originals) - len(extracted), "partial": sum(r.get("partial", False) for r in extracted.values())},
        "targets": [str(source / MANIFEST_NAME), str(source / CATALOG_NAME)], "originalsMoved": False,
        "originalDocumentBytesRead": False, "relatedAssetBytesRead": False, "fullTextIncluded": False}
    return {"source": source, "originals": originals, "extensions": extensions, "scanPaths": scanned,
            "allowPartial": allow_partial, "complete": payload["complete"], "links": links,
            "catalog": catalog, "summary": summary,
            "manifest": {"schema": "library-local-themes-v1", "sourceName": payload["sourceName"], "entries": entries}}


def _csv_text(entries):
    fields = ENTRY_FIELDS + ("webEligible",)
    stream = io.StringIO(newline="")
    writer = csv.writer(stream)
    writer.writerow(fields)
    for entry in entries:
        writer.writerow([_csv_safe(entry[field]) for field in fields])
    return "\ufeff" + stream.getvalue()


def _catalog_html(plan):
    items = [{**entry, "title": PurePosixPath(entry["path"]).name,
              "extension": PurePosixPath(entry["path"]).suffix.lower(),
              "src": "./" + "/".join(quote(p, safe="") for p in link["link"].split("/"))}
             for entry, link in zip(plan["catalog"], plan["links"])]
    data = {"themes": THEMES, "items": items, "sourceName": plan["manifest"]["sourceName"], "complete": plan["complete"]}
    return _HTML.replace("__CATALOG_DATA__", _safe_json(data))


_HTML = r'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'none'; object-src 'none'; frame-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'none'; base-uri 'none'; form-action 'none'">
<title>Biblioteca por tema · Turbo TEMI 360X</title><style>
:root{color-scheme:dark;font:17px/1.5 system-ui,sans-serif;background:#0a1020;color:#e9f3ff}*{box-sizing:border-box}body{max-width:1400px;margin:auto;padding:24px}h1{font-size:clamp(1.7rem,4vw,2.5rem);line-height:1.15}h2{font-size:1rem;overflow-wrap:anywhere}p{max-width:80ch}.muted{color:#c2d0e2}a{color:#99f6e4}label{font-weight:650;display:block}input,select,button{font:inherit;padding:12px;border:1px solid #7889a9;border-radius:10px;background:#141f36;color:inherit}input[type=search],select{width:100%}button{min-height:48px;cursor:pointer}button:disabled{opacity:.45}:focus-visible{outline:3px solid #ffe082;outline-offset:4px}.controls{display:grid;grid-template-columns:2fr 1fr;gap:16px;background:#111b30;padding:18px;border-radius:16px}.review{grid-column:1/-1;display:flex;gap:12px;align-items:center}.review input{width:24px;height:24px}.toolbar,nav{display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin:20px 0}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:18px}.card{padding:18px;background:#111b30;border:1px solid #405375;border-radius:16px}.badge{display:inline-block;border:1px solid #5e759b;padding:3px 8px;border-radius:20px;font-size:.8rem}.warning{color:#ffe4a0}.meta{font-size:.85rem;color:#c4d3ea}nav{justify-content:center}.skip{position:absolute;left:-9999px}.skip:focus{position:static}footer{border-top:1px solid #405375;margin-top:28px;padding:16px 0}@media(max-width:640px){body{padding:14px}.controls,.grid{grid-template-columns:1fr}}
</style></head><body><a class="skip" href="#results">Ir para os documentos</a><header><p>📚 TURBO TEMI 360X · BIBLIOTECA LOCAL</p><h1>Documentos por tema</h1><p id="coverage" class="muted"></p><p>Um tema por vez. Busque nomes e assuntos, filtre a revisão e abra o original pelo atalho local.</p></header>
<section class="controls" aria-label="Filtros"><label>🔎 Buscar nome ou tema<input id="search" type="search" placeholder="Ex.: DPOC, sepse, POCUS, IgG4" autocomplete="off"></label><label>📚 Tema<select id="theme"><option value="">Todos os temas</option></select></label><label class="review"><input id="review" type="checkbox"> Somente documentos para revisão</label></section>
<div class="toolbar"><p id="count" role="status" aria-live="polite"></p><a href="./revisao.csv">📋 Revisão (CSV)</a><a href="./catalogo.csv">📄 Catálogo completo (CSV)</a></div><main id="results" tabindex="-1"><div id="grid" class="grid"></div><p id="empty" hidden>Nenhum documento com esses filtros.</p></main><nav aria-label="Páginas"><button id="prev" type="button">← Anterior</button><span id="page" aria-live="polite"></span><button id="next" type="button">Próximos 24 →</button></nav>
<footer class="muted">🔒 Catálogo local, sem envio de documentos. Originais e arquivos relacionados preservados. PDF abre pelo link; outros formatos são baixados para abrir no aplicativo escolhido. Não há texto integral ou visualizador embutido. A classificação temática exige conferência e não valida conteúdo clínico. O próprio macOS pode baixar um arquivo do iCloud ao abri-lo.</footer>
<script id="catalog-data" type="application/json">__CATALOG_DATA__</script><script>
'use strict';const {themes,items,sourceName,complete}=JSON.parse(document.getElementById('catalog-data').textContent);const $=id=>document.getElementById(id),pageSize=24;let current=1;
$('coverage').textContent=sourceName+' · '+(complete?'Inventário completo.':'⚠️ Catálogo parcial: somente os documentos inventariados estão incluídos.');
const norm=v=>String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');for(const [id,label]of Object.entries(themes)){const o=document.createElement('option');o.value=id;o.textContent=label;$('theme').append(o);}
const filtered=()=>{const q=norm($('search').value.trim());return items.filter(i=>(!$('theme').value||i.theme===$('theme').value||i.secondaryThemes.includes($('theme').value))&&(!$('review').checked||i.needsReview)&&(!q||norm([i.title,i.path,i.themeLabel,...i.matchedTerms,...i.secondaryThemes.map(t=>themes[t]||t)].join(' ')).includes(q)));};
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function render(){const list=filtered(),pages=Math.max(1,Math.ceil(list.length/pageSize));current=Math.min(current,pages);$('grid').replaceChildren();for(const i of list.slice((current-1)*pageSize,current*pageSize)){const card=el('article','card');card.append(el('span','badge',i.themeLabel));card.append(el('h2','',i.title));card.append(el('p','meta',i.extension.toUpperCase().slice(1)+' · '+Math.ceil(i.size/1024)+' KB · confiança '+i.confidence+' · '+i.method));if(i.needsReview)card.append(el('p','warning','⚑ Conferir classificação'));if(!i.webEligible)card.append(el('p','warning','Disponível pelo atalho local; caminho não compatível com a biblioteca web.'));if(i.secondaryThemes.length)card.append(el('p','meta','Também: '+i.secondaryThemes.map(t=>themes[t]||t).join(' · ')));card.append(el('p','meta',i.reason));const a=el('a','',i.extension==='.pdf'?'Abrir PDF original ↗':'Baixar documento original ↓');a.href=i.src;a.rel='noopener';if(i.extension==='.pdf')a.target='_blank';else a.download=i.title;card.append(a);$('grid').append(card);}$('count').textContent=list.length+' de '+items.length+' documentos · até 24 por página';$('page').textContent='Página '+current+' de '+pages;$('prev').disabled=current===1;$('next').disabled=current===pages;$('empty').hidden=list.length>0;}
for(const id of ['search','theme','review'])$(id).addEventListener(id==='search'?'input':'change',()=>{current=1;render();});$('prev').addEventListener('click',()=>{current--;render();$('results').focus();});$('next').addEventListener('click',()=>{current++;render();$('results').focus();});render();
</script></body></html>'''


def _check_scan(plan):
    _check_originals(plan["source"], plan["originals"])
    found, _ = _scan_document_paths(plan["source"], plan["extensions"], plan["allowPartial"] and not plan["complete"])
    if found != plan["scanPaths"]:
        raise OrganizationError("O conjunto de documentos mudou desde a preparação.")


def _verify_written(plan):
    _check_scan(plan)
    if json.loads((plan["source"] / MANIFEST_NAME).read_text(encoding="utf-8")) != plan["manifest"]:
        raise OrganizationError("Manifesto gravado divergiu do plano em memória.")
    for link in plan["links"]:
        alias = plan["source"] / CATALOG_NAME / link["link"]
        original = plan["source"] / link["original"]["rawPath"]
        if not alias.is_symlink() or os.path.isabs(os.readlink(alias)) or alias.resolve(strict=True) != original.resolve(strict=True):
            raise OrganizationError("Atalho não corresponde ao original previsto.")


def apply_prepared(plan):
    source = plan["source"]
    _new_targets(source)
    _check_scan(plan)
    stage = Path(tempfile.mkdtemp(prefix=".360x-documents-stage-", dir=source))
    stage_identity = _identity(stage)
    created = []
    try:
        for link in plan["links"]:
            alias = stage / link["link"]
            alias.parent.mkdir(exist_ok=True)
            final = source / CATALOG_NAME / link["link"]
            original = source / link["original"]["rawPath"]
            os.symlink(os.path.relpath(original, final.parent), alias)
            if alias.resolve(strict=True) != original.resolve(strict=True):
                raise OrganizationError("Atalho em staging divergiu do original.")
        (stage / "catalogo.csv").write_text(_csv_text(plan["catalog"]), encoding="utf-8", newline="")
        (stage / "revisao.csv").write_text(_csv_text([e for e in plan["catalog"] if e["needsReview"]]), encoding="utf-8", newline="")
        (stage / "index.html").write_text(_catalog_html(plan), encoding="utf-8")
        (stage / "LEIA-ME.txt").write_text("BIBLIOTECA POR TEMA — TURBO TEMI 360X\n\nAbra index.html para buscar e filtrar. Os atalhos são links relativos; originais e arquivos relacionados não foram movidos ou renomeados.\nO manifesto na raiz contém somente caminhos compatíveis com a biblioteca web. Nomes incompatíveis permanecem no catálogo local e na revisão.\nNão há texto integral nos artefatos. A extração foi usada somente para classificação temática.\nCobertura: " + ("completa" if plan["complete"] else "PARCIAL, somente documentos inventariados") + ".\n", encoding="utf-8")
        staged_manifest = stage / ".manifest-prepared.json"
        staged_manifest.write_text(json.dumps(plan["manifest"], ensure_ascii=False, indent=2, allow_nan=False) + "\n", encoding="utf-8")
        _check_scan(plan)
        _new_targets(source)
        destination = source / CATALOG_NAME
        _rename_exclusive(stage, destination)
        created.append((destination, stage_identity))
        pending_manifest = destination / staged_manifest.name
        manifest_identity = _identity(pending_manifest)
        manifest_path = source / MANIFEST_NAME
        _rename_exclusive(pending_manifest, manifest_path)
        created.append((manifest_path, manifest_identity))
        _verify_written(plan)
        return {"applied": True, "documentCount": len(plan["catalog"]), "manifestEntries": len(plan["manifest"]["entries"]),
                "excludedWebPaths": plan["summary"]["excludedWebPaths"], "verifiedLinks": len(plan["links"]), "complete": plan["complete"]}
    except BaseException:
        for target, identity in reversed(created):
            _remove_owned(target, identity)
        raise
    finally:
        _remove_owned(stage, stage_identity)


def _write_private_plan(target, summary, source):
    resolved = target.resolve(strict=False)
    if _inside(resolved, source) or _inside(resolved, REPO_ROOT):
        raise OrganizationError("O plano privado deve ficar fora da origem e do repositório.")
    if _exists(target):
        raise OrganizationError("O plano já existe; escolha um nome novo.")
    target.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    descriptor = os.open(target, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(descriptor, "w", encoding="utf-8") as stream:
        json.dump(summary, stream, ensure_ascii=False, indent=2, allow_nan=False)
        stream.write("\n")


def run(source, inventory_path, text_path, plan_output, apply=False, allow_partial=False):
    plan = prepare(Path(source), Path(inventory_path), Path(text_path) if text_path is not None else None, allow_partial)
    plan["summary"]["applyRequested"] = bool(apply)
    _write_private_plan(Path(plan_output), plan["summary"], plan["source"])
    if apply:
        return apply_prepared(plan)
    return {"applied": False, "documentCount": len(plan["catalog"]), "manifestEntries": len(plan["manifest"]["entries"]),
            "excludedWebPaths": plan["summary"]["excludedWebPaths"], "complete": plan["complete"]}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument("--inventory", required=True, type=Path)
    parser.add_argument("--text-jsonl", type=Path)
    parser.add_argument("--plan-output", required=True, type=Path)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--allow-partial", action="store_true")
    args = parser.parse_args(argv)
    try:
        result = run(args.source, args.inventory, args.text_jsonl, args.plan_output, args.apply, args.allow_partial)
    except (OrganizationError, OSError) as exc:
        # Nenhum nome de documento, caminho interno ou texto extraído no terminal.
        print(json.dumps({"ok": False, "error": type(exc).__name__, "message": "Organização recusada; confira inventário, fingerprints e destinos privados."}), file=sys.stderr)
        return 1
    print(json.dumps({"ok": True, **result}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
