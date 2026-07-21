#!/usr/bin/env python3
"""Gera conexoes deterministicas entre Biblioteca, temas e documentos públicos.

O builder usa somente metadados do manifesto público. Não abre PDF/DOCX nem
staging privado. IDs de documento derivam do caminho normalizado para evitar as
colisões históricas do catálogo legado.
"""

from __future__ import annotations

import hashlib
import json
import sys
from datetime import datetime
from pathlib import Path
from urllib.parse import quote


ROOT = Path(__file__).resolve().parents[1]
LIBRARY = ROOT / "02_Biblioteca_IA_Engine"
MANIFEST = LIBRARY / "data/biblioteca_documentos_manifest.json"
TAXONOMY = LIBRARY / "data/biblioteca_taxonomia_temas.json"
OUTPUT = LIBRARY / "data/biblioteca_brain_connections.json"
PRIVATE_SEGMENTS = {"inbox", "_private", "juridico-financeiro"}


def load_json(path: Path) -> dict:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"JSON inválido ou ausente: {path}") from exc
    if not isinstance(data, dict):
        raise ValueError(f"A raiz precisa ser objeto JSON: {path}")
    return data


def normalized_path(value: str) -> str:
    return str(value or "").replace("\\", "/").lstrip("./")


def is_public_path(value: str) -> bool:
    path = normalized_path(value)
    parts = [part.casefold() for part in path.split("/") if part]
    return bool(path) and not any(part in PRIVATE_SEGMENTS for part in parts) and ".." not in parts


def document_id(path: str) -> str:
    digest = hashlib.sha256(path.casefold().encode("utf-8")).hexdigest()[:16]
    return f"doc-{digest}"


def main() -> int:
    try:
        manifest = load_json(MANIFEST)
        taxonomy = load_json(TAXONOMY)
    except ValueError as exc:
        print(f"❌ {exc}")
        return 1

    files = manifest.get("files")
    themes = taxonomy.get("themes")
    if not isinstance(files, list) or not isinstance(themes, list):
        print("❌ Manifesto ou taxonomia sem listas válidas.")
        return 1

    theme_index = {
        str(theme.get("id")): theme
        for theme in themes
        if isinstance(theme, dict) and theme.get("id")
    }
    missing_files = []
    public_files = []
    for item in files:
        if not isinstance(item, dict):
            continue
        path = normalized_path(item.get("path"))
        theme = str(item.get("theme") or "uti-geral")
        if not is_public_path(path):
            continue
        if theme not in theme_index:
            print(f"❌ Tema ausente da taxonomia: {theme} ({path})")
            return 1
        if not (LIBRARY / path).is_file():
            missing_files.append(path)
            continue
        public_files.append({**item, "path": path, "theme": theme})

    if missing_files:
        print(f"❌ Manifesto aponta para {len(missing_files)} arquivo(s) ausente(s).")
        for path in missing_files[:20]:
            print(f"   - {path}")
        return 1

    hub = {
        "id": "biblioteca-ia",
        "label": "📚 Biblioteca IA",
        "type": "module",
        "theme": "projeto",
        "path": "02_Biblioteca_IA_Engine/index.html",
    }
    nodes = [hub]
    edges = []

    for theme_id, theme in theme_index.items():
        nodes.append({
            "id": theme_id,
            "label": f"{theme.get('emoji') or '📂'} {theme.get('label') or theme_id}",
            "type": "theme",
            "theme": theme_id,
            "path": f"02_Biblioteca_IA_Engine/index.html?theme={quote(theme_id)}",
        })
        edges.append({"from": "biblioteca-ia", "to": theme_id, "relation": "tema"})

    seen_document_ids = set()
    for item in sorted(public_files, key=lambda value: value["path"].casefold()):
        node_id = document_id(item["path"])
        if node_id in seen_document_ids:
            print(f"❌ Colisão inesperada de hash para: {item['path']}")
            return 1
        seen_document_ids.add(node_id)
        nodes.append({
            "id": node_id,
            "sourceId": item.get("id"),
            "label": item.get("title") or item.get("name") or Path(item["path"]).stem,
            "type": "document",
            "theme": item["theme"],
            "path": f"02_Biblioteca_IA_Engine/{item['path']}",
            "format": item.get("format"),
            "origin": item.get("origin"),
            "status": item.get("status") or "catalogado",
        })
        edges.append({"from": item["theme"], "to": node_id, "relation": "documento"})

    payload = {
        "updatedAt": datetime.now().isoformat(timespec="seconds"),
        "version": "library-brain-v2",
        "description": "Conexões públicas da Biblioteca IA por tema e documento.",
        "nodes": nodes,
        "edges": edges,
        "stats": {
            "themes": len(theme_index),
            "documents": len(public_files),
            "nodes": len(nodes),
            "edges": len(edges),
        },
    }
    temporary = OUTPUT.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(OUTPUT)
    print(
        f"✅ Biblioteca conectada: {len(public_files)} documento(s), "
        f"{len(theme_index)} tema(s), {len(edges)} aresta(s)."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
