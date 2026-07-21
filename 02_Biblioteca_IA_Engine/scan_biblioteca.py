#!/usr/bin/env python3
"""Gera manifestos públicos da Biblioteca IA por formato e origem.

O diretório ``inbox/`` é staging local e nunca entra nos manifestos públicos.
Documentos só passam a ser catalogados apó revisão e movimentação para
``acervo/<tema>/``. A categoria jurídico-financeira permanece sempre privada.
"""

from __future__ import annotations

import json
import hashlib
import re
import unicodedata
from datetime import date, datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
PUBLICATION_BASELINE = DATA_DIR / "biblioteca_publication_baseline.json"
SCAN_DIRS = [ROOT / "acervo"]
PRIVATE_THEMES = {"juridico-financeiro"}
NON_PUBLIC_ADMIN_NAMES = {".gitkeep"}

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
    ".pages",
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
    "download-only": {
        "label": "Download (formato nativo)",
        "shortLabel": "Download",
        "emoji": "📦",
        "description": "Formato preservado para download e abertura no aplicativo nativo.",
        "extensions": ["pages"],
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
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii").lower()
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
    if ext == "pages":
        return "download-only"
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
        "download-only": "download",
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


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def canonical_path(value: str) -> str:
    return unicodedata.normalize("NFC", str(value or "").replace("\\", "/").lstrip("./"))


def preview_mode(extension: str) -> str:
    if extension == "pdf":
        return "pdf-native"
    if extension == "docx":
        return "generated-html"
    if extension in {"md", "markdown", "txt"}:
        return "safe-text"
    if extension in {"csv", "tsv"}:
        return "safe-table"
    if extension in {"html", "htm"}:
        return "sandboxed-html"
    return "download-only"


def load_editorial_overlays() -> dict[str, dict]:
    """Indexa somente metadados editoriais de catálogo por path canônico.

    O arquivo físico é sempre a fonte de verdade. IDs, paths, nomes, hashes,
    formatos e origem nunca são restaurados do catálogo legado.
    """

    catalog_path = DATA_DIR / "biblioteca_catalogo.json"
    if not catalog_path.exists():
        return {}
    try:
        payload = json.loads(catalog_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}

    grouped: dict[str, list[dict]] = {}
    for item in payload.get("items", []):
        if not isinstance(item, dict) or not item.get("path"):
            continue
        grouped.setdefault(canonical_path(item["path"]), []).append(item)

    allowed = {
        "title",
        "resumo",
        "tags",
        "ia_origem",
        "data",
        "createdAt",
        "authorshipStatus",
        "authorshipEvidence",
        "license",
        "privacyReviewStatus",
        "clinicalReviewStatus",
        "reviewedAt",
    }
    overlays: dict[str, dict] = {}
    for path, candidates in grouped.items():
        # Ambiguidade no legado deve falhar fechada, nunca escolher o primeiro.
        if len(candidates) != 1:
            continue
        overlays[path] = {key: candidates[0][key] for key in allowed if key in candidates[0]}
    return overlays


def load_gate_attestations() -> dict[str, dict]:
    try:
        baseline = json.loads(PUBLICATION_BASELINE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    result: dict[str, dict] = {}
    for item in baseline.get("approvedChanges", []):
        if not isinstance(item, dict) or not item.get("path") or not item.get("sourceSha256"):
            continue
        result[canonical_path(item["path"])] = item
    return result


def collect_files() -> list[dict]:
    files: list[dict] = []
    seen_paths: set[str] = set()
    seen_ids: set[str] = set()
    overlays = load_editorial_overlays()
    gate_attestations = load_gate_attestations()

    for directory in SCAN_DIRS:
        if not directory.exists():
            continue
        for path in sorted(directory.rglob("*")):
            if not path.is_file():
                continue
            if any(part.lower() in PRIVATE_THEMES for part in path.relative_to(ROOT).parts):
                continue
            if path.name == ".DS_Store" or path.name.lower() == "readme.md":
                continue
            ext = path.suffix.lower()
            if ext not in SUPPORTED:
                continue

            rel = canonical_path(path.relative_to(ROOT).as_posix())
            if rel in seen_paths:
                continue
            seen_paths.add(rel)

            stat = path.stat()
            partition = partition_for(path)
            origin = origin_for(path, partition)
            fmt = FORMAT_META.get(partition, {"label": "Outros", "emoji": "📦"})
            org = ORIGIN_META.get(origin, {"label": origin, "emoji": "📦"})
            extension = ext.lstrip(".")
            document_id = slug(rel)
            if document_id in seen_ids:
                document_id = f"{document_id}-{hashlib.sha256(rel.encode('utf-8')).hexdigest()[:10]}"
            seen_ids.add(document_id)

            editorial = overlays.get(rel, {})
            if editorial.get("title") in {path.name, path.stem}:
                editorial = {key: value for key, value in editorial.items() if key != "title"}
            default_authorship = (
                "terceiro-referencia" if origin == "artigo-cientifico-original" else "a-confirmar"
            )
            canonical = {
                "id": document_id,
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
                "sourceSha256": sha256_file(path),
                "previewMode": preview_mode(extension),
                "authorshipStatus": default_authorship,
                "authorshipEvidence": "",
                "license": "a-confirmar",
                "privacyReviewStatus": "publicado",
                "clinicalReviewStatus": "nao-revisado",
                "updatedAt": datetime.fromtimestamp(stat.st_mtime).isoformat(timespec="seconds"),
                "addedAt": date.fromtimestamp(stat.st_mtime).isoformat(),
            }

            # A camada editorial pode enriquecer, mas jamais redirecionar o arquivo.
            canonical.update(editorial)
            if editorial.get("tags"):
                canonical["tags"] = list(dict.fromkeys([*canonical["tags"], *editorial["tags"]]))

            # A atestação explícita e vinculada ao hash sempre vence metadados
            # editoriais herdados de uma versão anterior do mesmo caminho.
            attestation = gate_attestations.get(rel)
            if attestation and attestation.get("sourceSha256") == canonical["sourceSha256"]:
                canonical.update(
                    {
                        "authorshipEvidence": "Autoria/licença atestadas no gate; conservar a prova documental externa.",
                        "license": "revisada-no-gate-de-publicacao",
                        "privacyReviewStatus": "revisado-no-gate-de-publicacao",
                        "clinicalReviewStatus": "revisado-no-gate-de-publicacao",
                        "reviewedAt": attestation.get("reviewedAt", ""),
                    }
                )

            files.append(canonical)

    return files


def grouped_counts(files: list[dict], key: str) -> dict[str, int]:
    counts: dict[str, int] = {}
    for item in files:
        counts[item[key]] = counts.get(item[key], 0) + 1
    return counts


def build_duplicate_report(files: list[dict]) -> dict:
    """Separa duplicata binária de versões/renditions da mesma obra.

    O relatório é apenas diagnóstico. Nenhuma ocorrência autoriza exclusão.
    """

    by_hash: dict[str, list[dict]] = {}
    by_work: dict[str, list[dict]] = {}
    for item in files:
        by_hash.setdefault(item["sourceSha256"], []).append(item)
        work_key = slug(Path(item["filename"]).stem)
        by_work.setdefault(work_key, []).append(item)

    exact = []
    for digest, matches in sorted(by_hash.items()):
        if len(matches) < 2:
            continue
        exact.append(
            {
                "groupId": f"sha256-{digest[:12]}",
                "sha256": digest,
                "count": len(matches),
                "items": [
                    {"id": item["id"], "path": item["path"], "extension": item["extension"]}
                    for item in sorted(matches, key=lambda value: value["path"])
                ],
                "recommendedAction": "preservar-e-revisar-manualmente",
            }
        )

    renditions = []
    for work_key, matches in sorted(by_work.items()):
        if len(matches) < 2:
            continue
        extensions = sorted({item["extension"] for item in matches})
        paths = {item["path"] for item in matches}
        if len(paths) < 2 or len(extensions) < 2:
            continue
        renditions.append(
            {
                "workId": work_key,
                "count": len(matches),
                "extensions": extensions,
                "items": [
                    {"id": item["id"], "path": item["path"], "extension": item["extension"]}
                    for item in sorted(matches, key=lambda value: value["path"])
                ],
                "recommendedAction": "agrupar-como-versoes-da-mesma-obra",
            }
        )

    return {
        "updatedAt": datetime.now().isoformat(timespec="seconds"),
        "description": "Diagnóstico canônico por SHA-256 e família de obra; não autoriza exclusão automática.",
        "summary": {
            "publicDocuments": len(files),
            "exactDuplicateGroups": len(exact),
            "renditionFamilies": len(renditions),
        },
        "exactDuplicates": exact,
        "renditionFamilies": renditions,
    }


def collect_public_assets() -> list[dict]:
    """Inventaria todos os arquivos fisicamente publicáveis do acervo.

    Diferente do catálogo, esta lista não filtra por extensão. Assim, uma
    imagem, ZIP ou outro arquivo inesperado nunca consegue chegar ao artefato
    público sem ser detectado. Marcadores ``.gitkeep`` não são publicáveis e o
    builder também os ignora explicitamente.
    """

    assets: list[dict] = []
    for directory in SCAN_DIRS:
        if not directory.exists():
            continue
        for path in sorted(directory.rglob("*")):
            if path.is_symlink():
                raise RuntimeError(f"Link simbólico não permitido no acervo público: {path}")
            if not path.is_file():
                continue
            relative = path.relative_to(ROOT)
            if any(part.lower() in PRIVATE_THEMES for part in relative.parts):
                continue
            if path.name.lower() in NON_PUBLIC_ADMIN_NAMES:
                continue
            assets.append(
                {
                    "path": canonical_path(relative.as_posix()),
                    "sourceSha256": sha256_file(path),
                }
            )
    return assets


def unexpected_public_assets(files: list[dict], assets: list[dict]) -> list[str]:
    catalogued = {item["path"] for item in files}
    return sorted(item["path"] for item in assets if item["path"] not in catalogued)


def corpus_fingerprint(files: list[dict]) -> str:
    canonical = [
        {"path": item["path"], "sourceSha256": item["sourceSha256"]}
        for item in sorted(files, key=lambda value: value["path"])
    ]
    payload = json.dumps(
        canonical,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def verify_publication_baseline(files: list[dict], assets: list[dict] | None = None) -> None:
    """Bloqueia qualquer alteração física não atestada no acervo público."""

    assets = collect_public_assets() if assets is None else assets
    unexpected = unexpected_public_assets(files, assets)
    if unexpected:
        sample = ", ".join(unexpected[:3])
        raise RuntimeError(
            "Arquivo(s) não catalogado(s) no acervo público: "
            f"{sample}. Mova-os para o staging privado ou implemente o formato antes de publicar."
        )

    try:
        baseline = json.loads(PUBLICATION_BASELINE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise RuntimeError(
            "Baseline de publicação ausente/inválida; nenhum acervo será reindexado."
        ) from exc
    expected = str(baseline.get("corpusFingerprint") or "")
    actual = corpus_fingerprint(assets)
    expected_document_count = baseline.get("documentCount")
    expected_asset_count = baseline.get("publicAssetCount")
    if (
        expected != actual
        or not isinstance(expected_document_count, int)
        or isinstance(expected_document_count, bool)
        or expected_document_count != len(files)
        or not isinstance(expected_asset_count, int)
        or isinstance(expected_asset_count, bool)
        or expected_asset_count != len(assets)
    ):
        raise RuntimeError(
            "Acervo físico divergiu do baseline aprovado. Mantenha o arquivo privado e "
            "execute update_library_publication_baseline.py somente após autoria/licença, "
            "privacidade e revisão clínica serem atestadas."
        )


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    assets = collect_public_assets()
    files = collect_files()
    verify_publication_baseline(files, assets)
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
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    # Catálogo público canônico: uma entrada por arquivo físico validado.
    (DATA_DIR / "biblioteca_catalogo.json").write_text(
        json.dumps(
            {
                "updatedAt": manifest["updatedAt"],
                "project": "Biblioteca IA — Enciclopédia Médica Intensiva",
                "totalFiles": len(files),
                "items": files,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    (DATA_DIR / "biblioteca_duplicados.json").write_text(
        json.dumps(build_duplicate_report(files), ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    # Compatibilidade segura: o staging não é serializado em arquivo público.
    inbox_files: list[dict] = []
    (DATA_DIR / "inbox.json").write_text(
        json.dumps(
            {
                "description": "Staging local não publicado. Revise e mova para acervo/<tema>/.",
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
                "totalFiles": len(inbox_files),
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
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
        )
        + "\n",
        encoding="utf-8",
    )

    print(f"✅ Manifesto geral: {len(files)} arquivo(s)")
    print(f"📄 Arquivo: {DATA_DIR / 'biblioteca_documentos_manifest.json'}")
    print(f"📥 Inbox: {len(inbox_files)} arquivo(s)")


if __name__ == "__main__":
    main()
