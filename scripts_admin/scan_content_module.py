#!/usr/bin/env python3
"""Scanner de conteúdo aprovado para hubs estáticos do Antigravity.

Arquivos em ``inbox/`` são staging local ignorado pelo Git. Somente itens
promovidos para ``public/`` entram no catálogo e no GitHub Pages.
"""

from __future__ import annotations

import json
import re
import sys
from datetime import datetime
from pathlib import Path


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
                "updatedAt": datetime.now().isoformat(timespec="seconds"),
            }
        )
    return items


def main() -> None:
    module = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    data_dir = module / "data"
    data_dir.mkdir(parents=True, exist_ok=True)

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

    output = data_dir / "catalogo.json"
    output.write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"✅ {config.get('title', module.name)}: {len(files)} arquivo(s), {len(links)} link(s)")
    print(f"📄 Manifesto salvo em: {output}")


if __name__ == "__main__":
    main()
