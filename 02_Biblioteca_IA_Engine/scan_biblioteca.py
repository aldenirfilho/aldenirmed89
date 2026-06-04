#!/usr/bin/env python3
"""Gera manifestos da Biblioteca IA por formato, origem e particao virtual."""

from __future__ import annotations

import json
import re
from datetime import date, datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
SCAN_DIRS = [ROOT / "inbox", ROOT / "acervo"]

SUPPORTED = {
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".csv",
    ".tsv",
    ".md",
    ".markdown",
    ".ppt",
    ".pptx",
    ".txt",
    ".html",
    ".htm",
    ".apkg",
}

FORMAT_META = {
    "doc-ia": {
        "label": "DOC/DOCX gerados por IA",
        "shortLabel": "Word IA",
        "emoji": "📝",
        "description": "Protocolos, sínteses e documentos Word produzidos com apoio de IA.",
        "extensions": ["doc", "docx"],
    },
    "pdf-artigos": {
        "label": "PDF / Artigos científicos",
        "shortLabel": "PDF",
        "emoji": "📄",
        "description": "Artigos científicos originais, guidelines e PDFs de referência.",
        "extensions": ["pdf"],
    },
    "planilhas-xls": {
        "label": "Planilhas XLS/XLSX",
        "shortLabel": "Planilha",
        "emoji": "📊",
        "description": "Planilhas de apoio, dados tabulares e controles operacionais.",
        "extensions": ["xls", "xlsx"],
    },
    "markdown-md": {
        "label": "Markdown MD",
        "shortLabel": "Markdown",
        "emoji": "⬇️",
        "description": "Notas em Markdown, sínteses e fontes textuais estruturadas.",
        "extensions": ["md", "markdown"],
    },
    "csv-dados": {
        "label": "CSV / dados tabulares",
        "shortLabel": "CSV",
        "emoji": "📈",
        "description": "Arquivos CSV com dados, listas e tabelas exportáveis.",
        "extensions": ["csv"],
    },
    "pptx-aulas": {
        "label": "PPT/PPTX apresentações",
        "shortLabel": "Slides",
        "emoji": "📽️",
        "description": "Aulas, apresentações e decks para ensino.",
        "extensions": ["ppt", "pptx"],
    },
    "txt-textos": {
        "label": "TXT textos simples",
        "shortLabel": "TXT",
        "emoji": "📃",
        "description": "Textos simples, prompts, listas e rascunhos.",
        "extensions": ["txt"],
    },
    "anki-flashcards": {
        "label": "Flashcards estilo Anki",
        "shortLabel": "Anki",
        "emoji": "🃏",
        "description": "Arquivos para criação/importação de flashcards e repetição espaçada.",
        "extensions": ["apkg", "tsv", "csv"],
    },
    "html-interativos": {
        "label": "HTML interativos",
        "shortLabel": "HTML",
        "emoji": "🌐",
        "description": "Páginas HTML e ferramentas interativas publicáveis.",
        "extensions": ["html", "htm"],
    },
}

ORIGIN_META = {
    "gerada-por-ia": {
        "label": "Gerada por IA / curadoria própria",
        "emoji": "🤖",
        "description": "Material autoral, síntese, protocolo ou documento produzido com apoio de IA.",
    },
    "artigo-cientifico-original": {
        "label": "Artigo científico original",
        "emoji": "🔬",
        "description": "PDF de artigo, guideline ou referência científica primária/externa.",
    },
    "dados-planilha": {
        "label": "Dados / planilha",
        "emoji": "📊",
        "description": "Arquivo tabular, planilha ou base estruturada.",
    },
    "flashcards-anki": {
        "label": "Flashcards Anki",
        "emoji": "🃏",
        "description": "Material destinado a flashcards, memória espaçada ou importação Anki.",
    },
}

IA_HINTS = [
    "protocolo",
    "manual",
    "guia",
    "sintese",
    "síntese",
    "modelo",
    "modelos",
    "prontuario",
    "prontuário",
    "relatorio",
    "relatório",
    "aula",
    "prompt",
    "claude",
    "gpt",
    "gemini",
    "dr aldenir",
    "draldenir",
    "uti",
    "temi",
    "checklist",
    "cards",
    "projeto",
    "configuracao",
    "configuração",
    "notas",
    "notes",
]

ARTICLE_HINTS = [
    "nejm",
    "jama",
    "lancet",
    "s13054",
    "advpub",
    "jetem",
    "reference",
    "trial",
    "trials",
    "paper",
    "article",
    "artigo",
    "guideline",
]

ANKI_HINTS = ["anki", "flashcard", "flashcards", "memorycard", "memorycards", "cards"]


def slug(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-") or "arquivo"


def pretty_title(path: Path) -> str:
    return path.stem.replace("_", " ").replace("-", " ").strip().title()


def partition_for(path: Path) -> str:
    ext = path.suffix.lower().lstrip(".")
    name = path.name.lower()
    if ext in {"apkg", "tsv"} or any(h in name for h in ANKI_HINTS):
        return "anki-flashcards"
    if ext in {"doc", "docx"}:
        return "doc-ia"
    if ext == "pdf":
        return "pdf-artigos"
    if ext in {"xls", "xlsx"}:
        return "planilhas-xls"
    if ext in {"md", "markdown"}:
        return "markdown-md"
    if ext == "csv":
        return "csv-dados"
    if ext in {"ppt", "pptx"}:
        return "pptx-aulas"
    if ext == "txt":
        return "txt-textos"
    if ext in {"html", "htm"}:
        return "html-interativos"
    return "outros"


def tipo_for(partition: str) -> str:
    return {
        "doc-ia": "word",
        "pdf-artigos": "pdf",
        "planilhas-xls": "spreadsheet",
        "markdown-md": "markdown",
        "csv-dados": "csv",
        "pptx-aulas": "presentation",
        "txt-textos": "text",
        "anki-flashcards": "anki",
        "html-interativos": "html",
    }.get(partition, "file")


def origin_for(path: Path, partition: str) -> str:
    name = path.name.lower()
    rel = str(path.relative_to(ROOT)).lower()
    if partition == "anki-flashcards":
        return "flashcards-anki"
    if partition in {"planilhas-xls", "csv-dados"}:
        return "dados-planilha"
    if partition in {"doc-ia", "markdown-md", "pptx-aulas", "txt-textos", "html-interativos"}:
        return "gerada-por-ia"
    if "acervo/artigos-cientificos/" in rel or any(h in name for h in ARTICLE_HINTS):
        return "artigo-cientifico-original"
    if any(h in name for h in IA_HINTS):
        return "gerada-por-ia"
    return "artigo-cientifico-original" if partition == "pdf-artigos" else "gerada-por-ia"


def theme_for(path: Path) -> str:
    rel_parts = path.relative_to(ROOT).parts
    if rel_parts[0] == "acervo" and len(rel_parts) > 2:
        return rel_parts[1]
    return "inbox-revisar"


def collect_files() -> list[dict]:
    files: list[dict] = []
    seen_paths: set[str] = set()

    for directory in SCAN_DIRS:
        if not directory.exists():
            continue
        for path in sorted(directory.rglob("*")):
            if not path.is_file():
                continue
            if path.name == ".DS_Store" or path.name.lower() == "readme.md":
                continue
            ext = path.suffix.lower()
            if ext not in SUPPORTED:
                continue

            rel = path.relative_to(ROOT).as_posix()
            if rel in seen_paths:
                continue
            seen_paths.add(rel)

            stat = path.stat()
            partition = partition_for(path)
            origin = origin_for(path, partition)
            fmt = FORMAT_META.get(partition, {"label": "Outros", "emoji": "📦"})
            org = ORIGIN_META.get(origin, {"label": origin, "emoji": "📦"})
            extension = ext.lstrip(".")

            files.append(
                {
                    "id": slug(rel),
                    "name": path.name,
                    "filename": path.name,
                    "title": pretty_title(path),
                    "path": rel,
                    "extension": extension,
                    "format": partition,
                    "formatLabel": fmt["label"],
                    "formatShortLabel": fmt.get("shortLabel", fmt["label"]),
                    "formatEmoji": fmt["emoji"],
                    "tipo": tipo_for(partition),
                    "origin": origin,
                    "originLabel": org["label"],
                    "originEmoji": org["emoji"],
                    "theme": theme_for(path),
                    "tags": [extension, partition, origin],
                    "status": "revisar" if theme_for(path) == "inbox-revisar" else "catalogado",
                    "sizeBytes": stat.st_size,
                    "updatedAt": datetime.fromtimestamp(stat.st_mtime).isoformat(timespec="seconds"),
                    "addedAt": date.today().isoformat(),
                }
            )

    return files


def grouped_counts(files: list[dict], key: str) -> dict[str, int]:
    counts: dict[str, int] = {}
    for item in files:
        counts[item[key]] = counts.get(item[key], 0) + 1
    return counts


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    files = collect_files()
    format_counts = grouped_counts(files, "format")
    origin_counts = grouped_counts(files, "origin")

    partitions = []
    for key, meta in FORMAT_META.items():
        partitions.append({**meta, "id": key, "count": format_counts.get(key, 0)})

    origins = []
    for key, meta in ORIGIN_META.items():
        origins.append({**meta, "id": key, "count": origin_counts.get(key, 0)})

    manifest = {
        "updatedAt": datetime.now().isoformat(timespec="seconds"),
        "totalFiles": len(files),
        "description": "Manifesto automatico da Biblioteca IA por formato, origem e particao virtual.",
        "partitions": partitions,
        "origins": origins,
        "files": files,
    }

    (DATA_DIR / "biblioteca_documentos_manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    inbox_files = [item for item in files if item["path"].startswith("inbox/")]
    (DATA_DIR / "inbox.json").write_text(
        json.dumps(
            {
                "description": "Arquivos no inbox aguardando classificação",
                "updatedAt": date.today().isoformat(),
                "files": [
                    {
                        "filename": item["name"],
                        "tipo": item["tipo"],
                        "format": item["format"],
                        "origin": item["origin"],
                    }
                    for item in inbox_files
                ],
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    # Compatibilidade com a pagina atual.
    (DATA_DIR / "biblioteca_inbox_manifest_auto.json").write_text(
        json.dumps(
            {
                "updatedAt": datetime.now().isoformat(timespec="seconds"),
                "totalFiles": len(files),
                "files": files,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    print(f"✅ Manifesto geral: {len(files)} arquivo(s)")
    print(f"📄 Arquivo: {DATA_DIR / 'biblioteca_documentos_manifest.json'}")
    print(f"📥 Inbox: {len(inbox_files)} arquivo(s)")


if __name__ == "__main__":
    main()
