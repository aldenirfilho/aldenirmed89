#!/usr/bin/env python3
"""Plan, then optionally create a local thematic index without moving originals.

Inputs and OCR remain on this computer. No image bytes are read by this script.
Default mode only creates the requested private plan outside the source/repo.
--apply also creates exactly two new outputs inside the source: the CardFeed
manifest and 00_ORGANIZADAS_POR_TEMA (relative links, CSVs and a local catalog).
"""

from __future__ import annotations

import argparse
from collections import Counter
import csv
import ctypes
from datetime import datetime, timezone
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import stat
import sys
import tempfile
import unicodedata
from urllib.parse import quote

from image_theme_classifier import CLASSIFIER_VERSION, THEMES, classify_image


MANIFEST_NAME = "cardfeed-temas-360x.json"
CATALOG_NAME = "00_ORGANIZADAS_POR_TEMA"
ENTRY_FIELDS = (
    "path", "size", "modifiedMs", "theme", "themeLabel", "confidence",
    "method", "matchedTerms", "secondaryThemes", "needsReview", "reason",
)
REPO_ROOT = Path(__file__).resolve().parents[1]


class OrganizationError(ValueError):
    """An integrity or destination check stopped a reversible operation."""


def _inside(path, root):
    try:
        path.relative_to(root)
        return True
    except ValueError:
        return False


def _exists(path):
    # Path.exists() alone misses dangling symlinks, which must not be replaced.
    return path.exists() or path.is_symlink()


def _integer(value, label):
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        raise OrganizationError("Metadado inteiro inválido: " + label)
    return value


def _relative(value):
    if not isinstance(value, str) or not value or "\\" in value or any(ord(c) < 32 for c in value):
        raise OrganizationError("Caminho relativo inválido no inventário/OCR.")
    parts = value.split("/")
    if value.startswith("/") or any(part in {"", ".", ".."} for part in parts):
        raise OrganizationError("Caminho relativo inseguro no inventário/OCR.")
    if PurePosixPath(value).is_absolute():
        raise OrganizationError("Caminho absoluto não permitido.")
    return unicodedata.normalize("NFC", value)


def _fingerprint(relative_path, size, modified_ns):
    payload = json.dumps([unicodedata.normalize("NFC", relative_path), size, modified_ns],
                         ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def _source_file(source, relative_path):
    path = source
    for part in relative_path.split("/"):
        path = path / part
        if path.is_symlink():
            raise OrganizationError("Inventário referencia um link simbólico; originais não serão seguidos.")
    try:
        info = path.stat(follow_symlinks=False)
    except OSError as exc:
        raise OrganizationError("Original do inventário indisponível.") from exc
    if not stat.S_ISREG(info.st_mode) or not _inside(path.resolve(), source):
        raise OrganizationError("Original fora da origem ou não é arquivo regular.")
    return path, info


def _check_originals(source, originals):
    for original in originals:
        _, info = _source_file(source, original["rawPath"])
        if info.st_size != original["size"] or info.st_mtime_ns != original["modifiedNs"]:
            raise OrganizationError("Fingerprint do original mudou; gere novo inventário/OCR.")


def _scan_image_paths(source, extensions):
    found = set()
    errors = []
    for base, dirs, files in os.walk(source, followlinks=False, onerror=errors.append):
        dirs[:] = [d for d in dirs if not d.startswith(".") and not (Path(base) / d).is_symlink()
                   and d != CATALOG_NAME]
        for filename in files:
            path = Path(base) / filename
            if filename.startswith(".") or path.is_symlink() or path.suffix.lower() not in extensions:
                continue
            if not path.is_file():
                raise OrganizationError("Arquivo de imagem não regular na origem.")
            found.add(_relative(path.relative_to(source).as_posix()))
    if errors:
        raise OrganizationError("Há diretórios sem acesso; inventário não pode ser validado integralmente.")
    return found


def _load_inventory(source, path):
    try:
        document = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        raise OrganizationError("Não foi possível ler o inventário JSON.") from exc
    if not isinstance(document, dict) or document.get("schema") != "cardfeed-icloud-private-inventory-v1":
        raise OrganizationError("Schema de inventário não reconhecido.")
    if document.get("sourceName") != "IMAGENS" or document.get("truncated") is not False:
        raise OrganizationError("Origem inesperada ou inventário truncado.")
    summary = document.get("summary")
    if not isinstance(summary, dict):
        raise OrganizationError("Resumo de inventário inválido.")
    if document.get("errors") or summary.get("unreadable", 0):
        raise OrganizationError("Inventário contém erros de acesso; não aplicar organização parcial.")
    images = document.get("images")
    if not isinstance(images, list) or summary.get("images") != len(images):
        raise OrganizationError("Contagem de imagens do inventário inconsistente.")
    extensions = document.get("eligibleExtensions")
    if not isinstance(extensions, list) or not extensions or any(not isinstance(e, str) or not e.startswith(".") for e in extensions):
        raise OrganizationError("Extensões do inventário inválidas.")
    extensions = {e.lower() for e in extensions}
    originals = []
    by_path = {}
    for item in images:
        if not isinstance(item, dict):
            raise OrganizationError("Entrada inválida no inventário.")
        raw_path = item.get("relativePath")
        normalized = _relative(raw_path)
        if normalized in by_path:
            raise OrganizationError("Caminhos duplicados após normalização Unicode.")
        size = _integer(item.get("size"), "size")
        modified_ns = _integer(item.get("modifiedNs"), "modifiedNs")
        if Path(raw_path).suffix.lower() not in extensions:
            raise OrganizationError("Imagem fora das extensões previstas pelo inventário.")
        record = {"path": normalized, "rawPath": raw_path, "size": size,
                  "modifiedNs": modified_ns, "id": _fingerprint(normalized, size, modified_ns)}
        originals.append(record)
        by_path[normalized] = record
    _check_originals(source, originals)
    if _scan_image_paths(source, extensions) != set(by_path):
        raise OrganizationError("A origem e o inventário têm conjuntos de imagens diferentes.")
    return originals, by_path, extensions


def _load_ocr(path, by_path):
    latest = {}
    try:
        stream = path.open(encoding="utf-8")
    except OSError as exc:
        raise OrganizationError("Não foi possível abrir o OCR JSONL local.") from exc
    with stream:
        for number, text in enumerate(stream, 1):
            if not text.strip():
                continue
            try:
                item = json.loads(text)
            except ValueError as exc:
                raise OrganizationError("Linha JSONL inválida no OCR: " + str(number)) from exc
            if not isinstance(item, dict) or item.get("schema") != "icloud-image-ocr-v1":
                raise OrganizationError("Schema de OCR não reconhecido.")
            normalized = _relative(item.get("relativePath"))
            original = by_path.get(normalized)
            if original is None:
                raise OrganizationError("OCR contém caminho ausente do inventário atual.")
            size = _integer(item.get("size"), "OCR size")
            modified_ns = _integer(item.get("modifiedNs"), "OCR modifiedNs")
            if (size, modified_ns, item.get("id")) != (original["size"], original["modifiedNs"], original["id"]):
                raise OrganizationError("Fingerprint OCR diferente do inventário atual.")
            if type(item.get("ok")) is not bool or not isinstance(item.get("lines"), list):
                raise OrganizationError("Resultado OCR inválido.")
            # Append-only retries: the last record for the same intact image wins.
            latest[normalized] = item
    return latest


def _link_filename(relative_path, index):
    name = PurePosixPath(relative_path).stem
    slug = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("ascii")
    slug = "-".join(re.findall(r"[a-z0-9]+", slug.lower()))[:54].strip("-") or "imagem"
    digest = hashlib.sha256(relative_path.encode("utf-8")).hexdigest()[:20]
    extension = PurePosixPath(relative_path).suffix.lower()
    return f"{index:05d}-{slug}-{digest}{extension}"


def _new_targets(source):
    for name in (MANIFEST_NAME, CATALOG_NAME):
        if _exists(source / name):
            raise OrganizationError("Destino já existe; nada será sobrescrito: " + name)


def prepare(source, inventory_path, ocr_path):
    """Build an in-memory plan, always revalidating actual source metadata."""
    if source.is_symlink():
        raise OrganizationError("A pasta de origem não pode ser um link simbólico.")
    source = source.resolve(strict=True)
    if not source.is_dir():
        raise OrganizationError("A origem deve ser uma pasta.")
    _new_targets(source)
    originals, by_path, extensions = _load_inventory(source, inventory_path)
    ocr = _load_ocr(ocr_path, by_path)
    entries = []
    links = []
    used = set()
    for index, original in enumerate(originals, 1):
        result = ocr.get(original["path"])
        lines = result["lines"] if result and result["ok"] else []
        classification = classify_image(original["path"], lines)
        entry = {"path": original["path"], "size": original["size"],
                 "modifiedMs": original["modifiedNs"] // 1_000_000, **classification}
        if set(entry) != set(ENTRY_FIELDS):
            raise OrganizationError("O classificador retornou campos inesperados.")
        name = _link_filename(original["path"], index)
        relative_link = PurePosixPath(entry["theme"]) / name
        if relative_link.as_posix() in used:
            raise OrganizationError("Colisão inesperada em nomes de atalhos.")
        used.add(relative_link.as_posix())
        entries.append(entry)
        links.append({"link": relative_link.as_posix(), "original": original})
    manifest = {"schema": "cardfeed-icloud-themes-v1", "sourceName": "IMAGENS", "entries": entries}
    snapshot = hashlib.sha256("\n".join(sorted(i["id"] for i in originals)).encode("ascii")).hexdigest()
    summary = {
        "schema": "360x-private-image-organization-plan-v1",
        "state": "planned", "createdAt": datetime.now(timezone.utc).isoformat(),
        "classifierVersion": CLASSIFIER_VERSION, "source": str(source),
        "imageCount": len(entries), "originalMetadataSnapshotSha256": snapshot,
        "themes": dict(sorted(Counter(e["theme"] for e in entries).items())),
        "confidence": dict(sorted(Counter(e["confidence"] for e in entries).items())),
        "needsReview": sum(e["needsReview"] for e in entries),
        "ocr": {"successful": sum(item["ok"] for item in ocr.values()),
                "failed": sum(not item["ok"] for item in ocr.values()),
                "notProcessed": len(originals) - len(ocr)},
        "targets": [str(source / MANIFEST_NAME), str(source / CATALOG_NAME)],
        "originalsMoved": False, "originalImageBytesRead": False, "fullOcrIncluded": False,
    }
    return {"source": source, "originals": originals, "extensions": extensions, "manifest": manifest,
            "links": links, "summary": summary}


def _csv_safe(value):
    if isinstance(value, list):
        value = " | ".join(str(v) for v in value)
    if isinstance(value, bool):
        value = "sim" if value else "não"
    value = str(value)
    if value.startswith(("\t", "\r", "\n")) or value.lstrip().startswith(("=", "+", "-", "@")):
        return "'" + value
    return value


def _csv_text(entries):
    stream = io.StringIO(newline="")
    writer = csv.writer(stream)
    writer.writerow(ENTRY_FIELDS)
    for entry in entries:
        writer.writerow([_csv_safe(entry[field]) for field in ENTRY_FIELDS])
    return "\ufeff" + stream.getvalue()


def _safe_json(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), allow_nan=False).replace("<", "\\u003c").replace(">", "\\u003e").replace("&", "\\u0026")


def _catalog_html(entries, links):
    data = []
    for entry, link in zip(entries, links):
        data.append({**entry, "title": PurePosixPath(entry["path"]).name,
                     "src": "./" + "/".join(quote(part, safe="") for part in link["link"].split("/"))})
    payload = _safe_json({"themes": THEMES, "items": data})
    return _HTML.replace("__CATALOG_DATA__", payload)


_HTML = r'''<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self' file: data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'none'; base-uri 'none'; form-action 'none'">
<title>Imagens por tema · Turbo TEMI 360X</title>
<style>
:root{color-scheme:dark;font:17px/1.5 system-ui,sans-serif;background:#0a1020;color:#e9f3ff}*{box-sizing:border-box}body{max-width:1500px;margin:auto;padding:24px}h1{font-size:clamp(1.7rem,4vw,2.5rem);line-height:1.15;margin:.6rem 0}h2{font-size:1rem;margin:.6rem 0}.eyebrow{color:#7debe3;letter-spacing:.06em}p{max-width:80ch}.muted{color:#c2d0e2}a{color:#99f6e4}label{display:block;font-weight:650}input,select,button{font:inherit;padding:12px;border:1px solid #7889a9;border-radius:10px;background:#141f36;color:inherit}input[type=search],select{width:100%}button{cursor:pointer;min-height:48px}button:disabled{opacity:.45;cursor:default}:focus-visible{outline:3px solid #ffe082;outline-offset:4px}.controls{display:grid;grid-template-columns:2fr 1fr;gap:16px;padding:18px;background:#111b30;border-radius:18px}.review{grid-column:1/-1;display:flex;gap:12px;align-items:center}.review input{width:24px;height:24px}.toolbar{display:flex;gap:16px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin:20px 0}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:18px}.card{border:1px solid #405375;background:#111b30;border-radius:16px;overflow:hidden;display:flex;flex-direction:column}.card img{width:100%;aspect-ratio:16/10;object-fit:contain;background:#070d18}.body{padding:16px}.title{overflow-wrap:anywhere}.meta{font-size:.85rem;color:#c4d3ea}.badge{display:inline-block;border:1px solid #5e759b;padding:3px 8px;border-radius:20px;font-size:.8rem;margin-bottom:8px}.badge.review{border-color:#ffd478;color:#ffe4a0}nav{display:flex;gap:16px;align-items:center;justify-content:center;margin:24px 0}.skip{position:absolute;left:-9999px}.skip:focus{position:static}footer{border-top:1px solid #405375;margin-top:28px;padding:16px 0}@media(max-width:640px){body{padding:14px}.controls{grid-template-columns:1fr}.grid{grid-template-columns:1fr}}
</style></head><body>
<a class="skip" href="#results">Ir para as imagens</a><header><span class="eyebrow">TURBO TEMI 360X · ACERVO LOCAL</span><h1>🗂️ Imagens por tema</h1><p class="muted">Um tema por vez. Busque nomes e assuntos reconhecidos, filtre o que precisa de revisão e abra a imagem original pelo atalho.</p></header>
<section class="controls" aria-label="Filtros"><label>🔎 Buscar texto<input id="search" type="search" placeholder="Ex.: DPOC, sepse, POCUS, IgG4" autocomplete="off"></label><label>📚 Tema<select id="theme"><option value="">Todos os temas</option></select></label><label class="review"><input id="review" type="checkbox"> Mostrar somente imagens que precisam de revisão</label></section>
<div class="toolbar"><p id="count" role="status" aria-live="polite"></p><a href="./revisao.csv">📋 Lista de revisão (CSV)</a><a href="./catalogo.csv">📄 Catálogo completo (CSV)</a></div>
<main id="results" tabindex="-1"><div id="grid" class="grid"></div><p id="empty" hidden>Nenhuma imagem com esses filtros. Tente outro termo ou escolha todos os temas.</p></main>
<nav aria-label="Páginas"><button id="prev" type="button">← Anterior</button><span id="page" aria-live="polite"></span><button id="next" type="button">Próximas 24 →</button></nav>
<footer class="muted">🔒 Catálogo local, sem rede ou envio de imagens. Os originais foram preservados. A classificação é temática e pode exigir revisão; não faz diagnóstico. O texto integral do OCR não está neste catálogo. Se a imagem estiver apenas no iCloud, sua abertura pode solicitar o download pelo próprio macOS.</footer>
<script id="catalog-data" type="application/json">__CATALOG_DATA__</script>
<script>
'use strict';
const {themes,items}=JSON.parse(document.getElementById('catalog-data').textContent);
const $=id=>document.getElementById(id), pageSize=24;let current=1;
const normalize=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
for(const [id,label] of Object.entries(themes)){const option=document.createElement('option');option.value=id;option.textContent=label;$('theme').append(option);}
const filtered=()=>{const query=normalize($('search').value.trim());return items.filter(item=>(!$('theme').value||item.theme===$('theme').value||item.secondaryThemes.includes($('theme').value))&&(!$('review').checked||item.needsReview)&&(!query||normalize([item.title,item.path,item.themeLabel,...item.matchedTerms,...item.secondaryThemes.map(t=>themes[t]||t)].join(' ')).includes(query)));};
function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
function render(){const list=filtered(),pages=Math.max(1,Math.ceil(list.length/pageSize));current=Math.min(current,pages);$('grid').replaceChildren();for(const item of list.slice((current-1)*pageSize,current*pageSize)){const card=element('article','card'),image=element('img');image.loading='lazy';image.decoding='async';image.alt=item.title;image.src=item.src;card.append(image);const body=element('div','body');body.append(element('span','badge',item.themeLabel));if(item.needsReview)body.append(element('span','badge review','Conferir classificação'));body.append(element('h2','title',item.title));body.append(element('p','meta','Confiança '+item.confidence+' · método '+item.method));if(item.secondaryThemes.length)body.append(element('p','meta','Também: '+item.secondaryThemes.map(t=>themes[t]||t).join(' · ')));body.append(element('p','meta',item.reason));const link=element('a','', 'Abrir imagem ↗');link.href=item.src;link.target='_blank';link.rel='noopener';body.append(link);card.append(body);$('grid').append(card);}$('count').textContent=list.length+' de '+items.length+' imagens · até 24 por página';$('page').textContent='Página '+current+' de '+pages;$('prev').disabled=current===1;$('next').disabled=current===pages;$('empty').hidden=list.length>0;}
for(const id of ['search','theme','review'])$(id).addEventListener(id==='search'?'input':'change',()=>{current=1;render();});
$('prev').addEventListener('click',()=>{current--;render();$('results').focus();});$('next').addEventListener('click',()=>{current++;render();$('results').focus();});render();
</script></body></html>'''


def _rename_exclusive(source, target):
    """Atomic no-replace rename on the supported macOS/Linux workspaces."""
    libc = ctypes.CDLL(None, use_errno=True)
    if sys.platform == "darwin" and hasattr(libc, "renamex_np"):
        function = libc.renamex_np
        function.argtypes = [ctypes.c_char_p, ctypes.c_char_p, ctypes.c_uint]
        result = function(os.fsencode(source), os.fsencode(target), 0x00000004)  # RENAME_EXCL
    elif hasattr(libc, "renameat2"):
        function = libc.renameat2
        function.argtypes = [ctypes.c_int, ctypes.c_char_p, ctypes.c_int, ctypes.c_char_p, ctypes.c_uint]
        result = function(-100, os.fsencode(source), -100, os.fsencode(target), 1)  # RENAME_NOREPLACE
    else:
        raise OrganizationError("Sistema sem rename atômico exclusivo; aplicação recusada com segurança.")
    if result:
        code = ctypes.get_errno()
        raise OSError(code, os.strerror(code), str(target))


def _identity(path):
    info = path.lstat()
    return info.st_dev, info.st_ino


def _remove_owned(path, identity):
    """Rollback only a new object that is still the same inode we created."""
    if _exists(path) and _identity(path) == identity:
        if path.is_dir() and not path.is_symlink():
            shutil.rmtree(path)
        else:
            path.unlink()


def _verify_written(plan):
    source = plan["source"]
    _check_originals(source, plan["originals"])
    if _scan_image_paths(source, plan["extensions"]) != {item["path"] for item in plan["originals"]}:
        raise OrganizationError("O conjunto de originais mudou durante a organização.")
    actual = json.loads((source / MANIFEST_NAME).read_text(encoding="utf-8"))
    if actual != plan["manifest"]:
        raise OrganizationError("Manifest gravado divergiu do plano em memória.")
    for link in plan["links"]:
        path = source / CATALOG_NAME / link["link"]
        original = source / link["original"]["rawPath"]
        if not path.is_symlink() or os.path.isabs(os.readlink(path)) or path.resolve(strict=True) != original.resolve(strict=True):
            raise OrganizationError("Atalho criado não corresponde ao original previsto.")
        info = path.stat()
        if info.st_size != link["original"]["size"] or info.st_mtime_ns != link["original"]["modifiedNs"]:
            raise OrganizationError("Fingerprint do alvo do atalho divergiu do inventário.")


def apply_prepared(plan):
    """Apply only this process's freshly constructed and verified in-memory plan."""
    source = plan["source"]
    _new_targets(source)
    _check_originals(source, plan["originals"])
    if _scan_image_paths(source, plan["extensions"]) != {item["path"] for item in plan["originals"]}:
        raise OrganizationError("O conjunto de originais mudou desde a preparação.")
    stage = Path(tempfile.mkdtemp(prefix=".360x-organize-stage-", dir=source))
    stage_identity = _identity(stage)
    created = []
    try:
        for link in plan["links"]:
            staged_link = stage / link["link"]
            staged_link.parent.mkdir(exist_ok=True)
            final_link = source / CATALOG_NAME / link["link"]
            original = source / link["original"]["rawPath"]
            os.symlink(os.path.relpath(original, final_link.parent), staged_link)
        entries = plan["manifest"]["entries"]
        (stage / "catalogo.csv").write_text(_csv_text(entries), encoding="utf-8", newline="")
        (stage / "revisao.csv").write_text(_csv_text([e for e in entries if e["needsReview"]]), encoding="utf-8", newline="")
        (stage / "index.html").write_text(_catalog_html(entries, plan["links"]), encoding="utf-8")
        (stage / "LEIA-ME.txt").write_text(
            "IMAGENS ORGANIZADAS POR TEMA — CATÁLOGO LOCAL 360X\n\n"
            "Abra index.html para buscar e filtrar. Os arquivos nas pastas temáticas são links relativos; "
            "os originais não foram movidos nem renomeados.\n"
            "catalogo.csv contém todas as imagens; revisao.csv contém as classificações a conferir.\n"
            "O manifesto na raiz é usado pelo CardFeed após reconectar a pasta IMAGENS.\n"
            "Não há upload nem texto OCR integral nestes artefatos. Classificação temática não é validação clínica.\n",
            encoding="utf-8")
        staged_manifest = stage / ".manifest-prepared.json"
        staged_manifest.write_text(json.dumps(plan["manifest"], ensure_ascii=False, indent=2, allow_nan=False) + "\n", encoding="utf-8")
        # The stage lives at the same depth as the final directory, so relative
        # symlinks already resolve correctly and can be checked before commit.
        for link in plan["links"]:
            if (stage / link["link"]).resolve(strict=True) != (source / link["original"]["rawPath"]).resolve(strict=True):
                raise OrganizationError("Atalho em staging não corresponde ao original.")
        _check_originals(source, plan["originals"])
        if _scan_image_paths(source, plan["extensions"]) != {item["path"] for item in plan["originals"]}:
            raise OrganizationError("O conjunto de originais mudou durante o staging.")
        _new_targets(source)
        destination = source / CATALOG_NAME
        _rename_exclusive(stage, destination)
        created.append((destination, stage_identity))
        final_staged_manifest = destination / staged_manifest.name
        # The same atomic no-replace primitive handles the manifest. No hard
        # links are required on a cloud-backed filesystem.
        manifest_path = source / MANIFEST_NAME
        manifest_identity = _identity(final_staged_manifest)
        _rename_exclusive(final_staged_manifest, manifest_path)
        created.append((manifest_path, manifest_identity))
        _verify_written(plan)
        return {"applied": True, "imageCount": len(entries), "verifiedLinks": len(plan["links"]),
                "targets": plan["summary"]["targets"]}
    except BaseException:
        for path, identity in reversed(created):
            _remove_owned(path, identity)
        raise
    finally:
        _remove_owned(stage, stage_identity)


def _write_private_plan(path, summary, source):
    resolved = path.resolve(strict=False)
    if _inside(resolved, source) or _inside(resolved, REPO_ROOT):
        raise OrganizationError("O plano privado deve ficar fora da origem e do repositório.")
    if _exists(path):
        raise OrganizationError("O arquivo do plano já existe; escolha um nome novo.")
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(descriptor, "w", encoding="utf-8") as stream:
        json.dump(summary, stream, ensure_ascii=False, indent=2, allow_nan=False)
        stream.write("\n")


def run(source, inventory_path, ocr_path, plan_output, apply=False):
    """No existing saved plan is accepted as authority for an application."""
    plan = prepare(Path(source), Path(inventory_path), Path(ocr_path))
    plan["summary"]["applyRequested"] = bool(apply)
    _write_private_plan(Path(plan_output), plan["summary"], plan["source"])
    if apply:
        return apply_prepared(plan)
    return {"applied": False, "imageCount": len(plan["manifest"]["entries"]), "planOutput": str(Path(plan_output).resolve())}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument("--inventory", required=True, type=Path)
    parser.add_argument("--ocr-jsonl", required=True, type=Path)
    parser.add_argument("--plan-output", required=True, type=Path)
    parser.add_argument("--apply", action="store_true", help="Criar somente os dois destinos novos; nunca mover originais")
    args = parser.parse_args(argv)
    try:
        result = run(args.source, args.inventory, args.ocr_jsonl, args.plan_output, args.apply)
    except (OrganizationError, OSError) as exc:
        print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False), file=sys.stderr)
        return 1
    print(json.dumps({"ok": True, **result}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
