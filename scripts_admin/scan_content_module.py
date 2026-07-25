#!/usr/bin/env python3
"""Scanner de conteúdo aprovado para hubs estáticos do Antigravity.

Arquivos em ``inbox/`` são staging local ignorado pelo Git. Somente itens
promovidos para ``public/`` entram no catálogo e no GitHub Pages.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Sequence


ROOT = Path(__file__).resolve().parents[1]
ALLOWED_HUBS = {
    "04_Ebooks_Intensiva_Clinica",
    "07_Questoes_Comentadas",
    "08_Transcricoes",
    "09_POCUS_Hub",
}


SUPPORTED = {
    ".pdf",
    ".epub",
    ".mobi",
    ".azw3",
    ".doc",
    ".docx",
    ".rtf",
    ".pages",
    ".xls",
    ".xlsx",
    ".numbers",
    ".csv",
    ".tsv",
    ".md",
    ".markdown",
    ".ppt",
    ".pptx",
    ".key",
    ".keynote",
    ".txt",
    ".srt",
    ".vtt",
    ".html",
    ".htm",
    ".apkg",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif",
    ".svg",
    ".heic",
    ".tif",
    ".tiff",
    ".mp4",
    ".mov",
    ".webm",
    ".m4v",
    ".mkv",
    ".avi",
    ".mp3",
    ".m4a",
    ".wav",
    ".zip",
    ".rar",
    ".7z",
}

FORMAT_META = {
    "pdf": {"label": "PDF / artigo / ebook", "emoji": "📄"},
    "ebook": {"label": "Ebook / EPUB", "emoji": "📘"},
    "word": {"label": "Word / DOC", "emoji": "📝"},
    "spreadsheet": {"label": "Planilha", "emoji": "📊"},
    "markdown": {"label": "Markdown", "emoji": "⬇️"},
    "csv": {"label": "CSV / TSV", "emoji": "📈"},
    "presentation": {"label": "Slides", "emoji": "📽️"},
    "text": {"label": "Texto", "emoji": "📃"},
    "anki": {"label": "Anki / flashcards", "emoji": "🃏"},
    "html": {"label": "HTML interativo", "emoji": "🌐"},
    "image": {"label": "Imagem", "emoji": "🖼️"},
    "video": {"label": "Video / aula", "emoji": "🎬"},
    "audio": {"label": "Audio", "emoji": "🎧"},
    "archive": {"label": "Arquivo compactado", "emoji": "🗜️"},
    "link": {"label": "Link externo", "emoji": "🔗"},
    "file": {"label": "Arquivo", "emoji": "📦"},
}


def slug(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-") or "item"


def title_from_name(path: Path) -> str:
    return path.stem.replace("_", " ").replace("-", " ").strip().title()


def format_for(path: Path) -> str:
    ext = path.suffix.lower()
    name = path.name.lower()
    if ext in {".doc", ".docx", ".rtf", ".pages"}:
        return "word"
    if ext == ".pdf":
        return "pdf"
    if ext in {".epub", ".mobi", ".azw3"}:
        return "ebook"
    if ext in {".xls", ".xlsx", ".numbers"}:
        return "spreadsheet"
    if ext in {".md", ".markdown"}:
        return "markdown"
    if ext in {".csv", ".tsv"}:
        return "anki" if any(k in name for k in ["anki", "flashcard", "flashcards"]) else "csv"
    if ext in {".ppt", ".pptx", ".key", ".keynote"}:
        return "presentation"
    if ext in {".txt", ".srt", ".vtt"}:
        return "text"
    if ext in {".html", ".htm"}:
        return "html"
    if ext == ".apkg":
        return "anki"
    if ext in {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".heic", ".tif", ".tiff"}:
        return "image"
    if ext in {".mp4", ".mov", ".webm", ".m4v", ".mkv", ".avi"}:
        return "video"
    if ext in {".mp3", ".m4a", ".wav"}:
        return "audio"
    if ext in {".zip", ".rar", ".7z"}:
        return "archive"
    return "file"


def read_json(path: Path, fallback):
    if not path.exists():
        return fallback
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return fallback


def scan_files(module: Path) -> list[dict]:
    public_dir = module / "public"
    items = []
    if not public_dir.exists():
        return items

    for path in sorted(public_dir.rglob("*")):
        if not path.is_file() or path.name.startswith(".") or path.name.lower() == "readme.md":
            continue
        ext = path.suffix.lower()
        if ext not in SUPPORTED:
            continue
        rel = path.relative_to(module).as_posix()
        fmt = format_for(path)
        meta = FORMAT_META[fmt]
        stat = path.stat()
        items.append(
            {
                "id": slug(rel),
                "source": "file",
                "title": title_from_name(path),
                "filename": path.name,
                "path": rel,
                "extension": ext.lstrip("."),
                "format": fmt,
                "formatLabel": meta["label"],
                "formatEmoji": meta["emoji"],
                "sizeBytes": stat.st_size,
                "updatedAt": datetime.fromtimestamp(stat.st_mtime).isoformat(timespec="seconds"),
                "tags": [fmt, ext.lstrip(".")],
                "description": "Arquivo aprovado para publicação neste módulo.",
            }
        )
    return items


def scan_links(module: Path) -> list[dict]:
    links_file = module / "links" / "links.json"
    raw = read_json(links_file, [])
    links_updated_at = (
        datetime.fromtimestamp(links_file.stat().st_mtime).isoformat(timespec="seconds")
        if links_file.is_file()
        else ""
    )
    items = []
    if isinstance(raw, dict):
        raw = raw.get("links", [])
    for idx, link in enumerate(raw):
        url = (link.get("url") or "").strip()
        title = (link.get("title") or url or f"Link {idx + 1}").strip()
        if not url:
            continue
        fmt = link.get("format") or "link"
        meta = FORMAT_META.get(fmt, FORMAT_META["link"])
        items.append(
            {
                "id": link.get("id") or slug(title),
                "source": "link",
                "title": title,
                "url": url,
                "path": url,
                "format": fmt,
                "formatLabel": link.get("formatLabel") or meta["label"],
                "formatEmoji": link.get("formatEmoji") or meta["emoji"],
                "tags": link.get("tags") or [fmt, "link"],
                "description": link.get("description") or "Link externo ou HTML interativo anexado ao modulo.",
                "updatedAt": link.get("updatedAt") or links_updated_at,
            }
        )
    return items


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Gera ou valida o catálogo de um hub público aprovado."
    )
    parser.add_argument(
        "module",
        help="Um dos quatro hubs públicos permitidos.",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Compara o catálogo canônico sem gravar arquivos.",
    )
    return parser.parse_args(argv)


def resolve_module(value: str) -> Path:
    root = ROOT.resolve()
    candidate = Path(value)
    module = candidate.resolve() if candidate.is_absolute() else (root / candidate).resolve()
    try:
        relative = module.relative_to(root)
    except ValueError as exc:
        raise ValueError("O hub precisa estar dentro do repositório.") from exc
    if len(relative.parts) != 1 or relative.as_posix() not in ALLOWED_HUBS:
        allowed = ", ".join(sorted(ALLOWED_HUBS))
        raise ValueError(f"Hub não permitido. Use um destes: {allowed}.")
    if not module.is_dir() or not (module / "module.json").is_file():
        raise ValueError(f"Hub inexistente ou sem module.json: {relative}")
    return module


def comparable(catalog: dict) -> dict:
    return {key: value for key, value in catalog.items() if key != "updatedAt"}


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        module = resolve_module(args.module)
    except ValueError as exc:
        print(f"❌ {exc}", file=sys.stderr)
        return 2

    config = read_json(module / "module.json", {})
    files = scan_files(module)
    links = scan_links(module)
    items = files + links

    format_counts = {}
    for item in items:
        fmt = item["format"]
        format_counts[fmt] = format_counts.get(fmt, 0) + 1

    catalog = {
        "updatedAt": datetime.now().isoformat(timespec="seconds"),
        "module": config,
        "totalItems": len(items),
        "totalFiles": len(files),
        "totalLinks": len(links),
        "formats": [
            {**FORMAT_META.get(fmt, FORMAT_META["file"]), "id": fmt, "count": count}
            for fmt, count in sorted(format_counts.items())
        ],
        "items": items,
    }

    data_dir = module / "data"
    output = data_dir / "catalogo.json"
    if args.check:
        try:
            current = json.loads(output.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            print(f"❌ Catálogo ausente ou inválido: {output.relative_to(ROOT.resolve())}", file=sys.stderr)
            return 1
        if comparable(current) != comparable(catalog):
            print(f"❌ Catálogo desatualizado: {output.relative_to(ROOT.resolve())}", file=sys.stderr)
            return 1
        print(f"✅ Catálogo válido sem escrita: {output.relative_to(ROOT.resolve())}")
        return 0

    data_dir.mkdir(parents=True, exist_ok=True)
    output = data_dir / "catalogo.json"
    output.write_text(
        json.dumps(catalog, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"✅ {config.get('title', module.name)}: {len(files)} arquivo(s), {len(links)} link(s)")
    print(f"📄 Manifesto salvo em: {output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
