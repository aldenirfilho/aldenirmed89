#!/usr/bin/env python3
"""Monta o artefato público Antigravity a partir de uma allowlist explícita.

O builder falha se uma entrada obrigatória estiver ausente, nunca copia o
espelho legado ``public_site/`` e ignora staging privado, scripts de operação e
arquivos internos. A sanitização/validação final continua a cargo de
``publication_guard.py`` como defesa em profundidade.
"""

from __future__ import annotations

import argparse
import hashlib
import html as html_lib
import json
import posixpath
import re
import shutil
import stat
import sys
import unicodedata
import zipfile
from collections import Counter
from pathlib import Path, PurePosixPath
from typing import NamedTuple
from urllib.parse import quote

try:
    from svg_safety import validate_svg_file
except ModuleNotFoundError:  # import via unittest/importlib a partir da raiz
    from scripts_admin.svg_safety import validate_svg_file

try:
    from editorial_gate import scan_file as scan_editorial_file
except ModuleNotFoundError:  # import via unittest/importlib a partir da raiz
    from scripts_admin.editorial_gate import scan_file as scan_editorial_file


REQUIRED = (
    "index.html",
    "404.html",
    "assets",
    "data",
    "01_UpDown_Hub",
    "02_Biblioteca_IA_Engine",
    "03_Calculadoras_E_Apps",
    "04_Ebooks_Intensiva_Clinica",
    "05_Midia_E_Feed",
    "07_Questoes_Comentadas",
    "08_Transcricoes",
    "09_POCUS_Hub",
    "10_DESAFIOS",
    "11_MNEMONICOS",
    "15_Radar_Cientifico",
    "16_Diretorio_Medico",
    "17_Portal_Vivo",
    "18_Centro_Tripulacao",
    "19_Integridade_Editorial",
    "20_Conheca_Aldenir",
    "21_Central_Ativacao",
    "22_Microparticulas_Ativas_ACRA",
    "01_Modulos_Clinicos",
    "en",
    "questoes",
    "apps",
    "desafios",
)

OPTIONAL = (
    ".nojekyll",
    "favicon.ico",
    "manifest.json",
    "manifest.webmanifest",
    "offline.html",
    "sw.js",
    "robots.txt",
    "sitemap.xml",
    "docs_usuario",
    "06_Infra_Site_E_Assets",
    "css",
    "js",
    "imagens",
    "admin",
    "03_Calculadoras_UTI",
    "05_Biblioteca_IA",
    "06_Card_Feed_Medico",
    "07_Estudos_Markdown",
    "13_RenalDose_Antimicrobianos",
    "14_SAPS3_Calculator",
    "02_Banco_Questoes_TEMI",
    "les-autoanticorpos",
    "respirasense-icu",
    "biblioteca",
    "updown",
    "calculadoras",
    "card-feed",
)

BLOCKED_SUFFIXES = (".bak", ".tmp", ".command", ".py", ".pyc", ".sh")
LIBRARY_ACERVO_PREFIX = "02_Biblioteca_IA_Engine/acervo/"
LIBRARY_ROOT_PREFIX = "02_Biblioteca_IA_Engine/"
LIBRARY_PREVIEW_INDEX = (
    "02_Biblioteca_IA_Engine/data/biblioteca_previews.json"
)
LIBRARY_PREVIEW_INDEX_VERSION = "library-previews-v5"
LIBRARY_PREVIEW_EXTENSIONS = {"docx", "pdf", "pages"}
LIBRARY_DIRECT_TEXT_EXTENSIONS = {"csv", "md", "markdown", "txt"}
PUBLIC_EMPTY_CANDIDATE_INDEXES = (
    "02_Biblioteca_IA_Engine/data/biblioteca_card_candidates.json",
    "02_Biblioteca_IA_Engine/data/biblioteca_temi_question_candidates.json",
    "05_Midia_E_Feed/data/cards_patch_biblioteca.json",
)
LIBRARY_PRIVATE_PARTS = {"juridico-financeiro", "_private", "inbox"}
CARD_PUBLIC_PREFIX = "05_Midia_E_Feed/assets/cards/public/"
CARD_PUBLIC_INDEX = "05_Midia_E_Feed/data/public.json"
CARD_ASSET_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp", ".svg"}
NON_PUBLIC_ADMIN_NAMES = {".gitkeep"}
EDITORIAL_DATA_PREFIX = "data/editorial/"
EDITORIAL_PUBLIC_FILES = {
    "data/editorial/editorial-provenance.json",
}
PUBLIC_BUILD_EXCLUSIONS = frozenset(
    {
        "01_Modulos_Clinicos/Almanaque_ECG/module.manifest.json",
        "01_Modulos_Clinicos/Almanaque_ECG/data/visual-assets.json",
        "01_Modulos_Clinicos/Dermatologia_Critica/module.manifest.json",
        "01_UpDown_Hub/content/reumatologia/les-manifestacoes/metadata.json",
        "05_Midia_E_Feed/data/recovery_manifest.json",
    }
)
PUBLIC_DOWNLOADS = (
    "downloads/Antigravity-Consultas-macOS.zip",
    "downloads/Antigravity-Consultas-Windows.zip",
    "downloads/Antigravity-Consultas-iPhone-Icones.zip",
    "downloads/SHA256SUMS.txt",
)
DOWNLOAD_ARCHIVE_LIMIT = 512
DOWNLOAD_UNCOMPRESSED_LIMIT = 64 * 1024 * 1024
PUBLIC_BASE_URL = "https://aldenirfilho.github.io/antigravity-consultas/"
PUBLIC_HOST = "aldenirfilho.github.io"
ANALYTICS_CONFIG_PATH = "data/site-analytics.json"
PUBLIC_METADATA_MARKER = "antigravity-public-metadata:v1"


class LibraryPublicationPlan(NamedTuple):
    public_acervo_allowlist: frozenset[str]
    excluded_repository_paths: frozenset[str]
    blocked_source_paths: frozenset[str]
    blocked_document_ids: frozenset[str]
    preview_only_source_paths: frozenset[str]


def is_within(child: Path, parent: Path) -> bool:
    return child == parent or parent in child.parents


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def canonical_relative(value: str) -> str:
    """Compara paths em NFC sem depender da normalização do macOS/iCloud."""

    return unicodedata.normalize("NFC", value)


def should_skip(root: Path, candidate: Path) -> bool:
    relative = candidate.relative_to(root).as_posix()
    normalized = relative.lower()
    name = candidate.name.lower()

    if candidate.is_symlink():
        return True
    # Cópias de conflito criadas por sincronização (ex.: ``index 2.html``)
    # não são fontes canônicas e podem carregar versões obsoletas ou privadas.
    if candidate.suffix and candidate.stem.endswith(" 2"):
        return True
    if (
        relative.startswith(CARD_PUBLIC_PREFIX)
        and candidate.suffix
        and re.search(r" [2-9]\d*$", candidate.stem)
    ):
        return True
    if any(part.lower() in {"inbox", "juridico-financeiro"} for part in candidate.parts):
        return True
    if name in {".ds_store", "thumbs.db", *NON_PUBLIC_ADMIN_NAMES} or name.endswith(BLOCKED_SUFFIXES):
        return True
    if any(part.lower() == "_private" for part in candidate.parts):
        return True
    if normalized.startswith(EDITORIAL_DATA_PREFIX) and relative not in EDITORIAL_PUBLIC_FILES:
        return True
    if "antigravity_repo_pack" in normalized:
        return True
    if "_privad" in name:
        return True
    if "prompt" in name and ("antigravity" in name or "rules" in name):
        return True
    if name.startswith("instrucoes-antigravity") or name.startswith("patch_"):
        return True
    if "antigravity" in name and "instruc" in name:
        return True
    return False


def load_library_acervo_allowlist(root: Path) -> set[str]:
    manifest_path = root / "02_Biblioteca_IA_Engine/data/biblioteca_documentos_manifest.json"
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError("Manifesto canônico da Biblioteca ausente ou inválido.") from exc

    allowlist: set[str] = set()
    for item in manifest.get("files", []):
        if not isinstance(item, dict) or not isinstance(item.get("path"), str):
            raise ValueError("Manifesto da Biblioteca contém entrada inválida.")
        relative = canonical_relative(f"02_Biblioteca_IA_Engine/{item['path']}")
        if not relative.startswith(LIBRARY_ACERVO_PREFIX) or relative in allowlist:
            raise ValueError(f"Caminho inválido ou duplicado no manifesto: {relative}")
        allowlist.add(relative)
    return allowlist


def _load_json_object(path: Path, label: str) -> dict:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ValueError(f"{label} ausente ou inválido.") from exc
    if not isinstance(payload, dict):
        raise ValueError(f"{label} precisa ser um objeto JSON.")
    return payload


def load_library_publication_plan(
    root: Path,
    manifest_allowlist: set[str],
) -> LibraryPublicationPlan:
    """Deriva a allowlist pública dos resultados fail-closed dos previews."""

    index = _load_json_object(root / LIBRARY_PREVIEW_INDEX, "Índice de previews")
    if index.get("version") != LIBRARY_PREVIEW_INDEX_VERSION:
        raise ValueError(
            "Índice de previews sem revisão editorial atual; execute "
            "scripts_admin/build_library_previews.py antes do builder público."
        )
    items = index.get("items")
    if not isinstance(items, list):
        raise ValueError("Índice de previews precisa conter a lista 'items'.")

    manifest = _load_json_object(
        root / "02_Biblioteca_IA_Engine/data/biblioteca_documentos_manifest.json",
        "Manifesto canônico da Biblioteca",
    )
    policy = _load_json_object(
        root / "data/editorial/policy.json",
        "Política editorial",
    )
    text_extensions = {
        str(value).casefold()
        for value in policy.get("scanning", {}).get("textExtensions", [])
        if isinstance(value, str)
    }
    manifest_by_source: dict[str, dict] = {}
    expected_preview_sources: set[str] = set()
    public_originals: set[str] = set()
    preview_only_sources: set[str] = set()
    blocked_sources: set[str] = set()
    blocked_ids: set[str] = set()
    excluded: set[str] = set()
    for record in manifest.get("files", []):
        if not isinstance(record, dict) or not isinstance(record.get("path"), str):
            raise ValueError("Manifesto canônico contém registro inválido.")
        source_path = canonical_relative(record["path"])
        manifest_by_source[source_path] = record
        extension = str(record.get("extension", "")).casefold()
        repository_path = canonical_relative(LIBRARY_ROOT_PREFIX + source_path)
        declared_sha = str(record.get("sourceSha256") or "").casefold()
        source_file = root / repository_path
        if (
            repository_path not in manifest_allowlist
            or source_file.is_symlink()
            or not source_file.is_file()
            or not re.fullmatch(r"[0-9a-f]{64}", declared_sha)
        ):
            raise ValueError(f"Fonte canônica inválida: {source_path}")
        if sha256_file(source_file) != declared_sha:
            raise ValueError(f"SHA-256 físico divergente: {source_path}")

        if extension in LIBRARY_PREVIEW_EXTENSIONS:
            expected_preview_sources.add(source_path)
            # Binários Office/PDF/Pages nunca integram o artefato público. Um
            # DOCX aprovado pode publicar apenas a prévia HTML auditada.
            excluded.add(repository_path)
            continue

        # Formatos sem preview só podem sair quando o próprio arquivo textual
        # pertence à allowlist do gate e não produz nenhum alerta crítico.
        directly_gateable = (
            extension in LIBRARY_DIRECT_TEXT_EXTENSIONS
            and f".{extension}" in text_extensions
        )
        direct_issues = (
            scan_editorial_file(
                root,
                source_file,
                policy,
                None,
                require_registration=False,
            )
            if directly_gateable
            else []
        )
        if not directly_gateable or direct_issues:
            blocked_sources.add(source_path)
            blocked_ids.add(str(record.get("id") or ""))
            excluded.add(repository_path)
        else:
            public_originals.add(repository_path)

    seen_sources: set[str] = set()
    seen_previews: set[str] = set()
    preview_pattern = re.compile(
        r"^previews/(?:docx|pdf|pages)-[0-9a-f]{20}\.html$"
    )
    risk_pattern = re.compile(r"^[A-Z][A-Z0-9_]{2,}$")

    for item in items:
        if not isinstance(item, dict):
            raise ValueError("Índice de previews contém registro inválido.")
        source_path = canonical_relative(str(item.get("sourcePath") or ""))
        preview_path = canonical_relative(str(item.get("previewPath") or ""))
        source_sha = str(item.get("sourceSha256") or "").casefold()
        preview_sha = str(item.get("previewSha256") or "").casefold()
        record = manifest_by_source.get(source_path)
        if (
            record is None
            or source_path in seen_sources
            or preview_path in seen_previews
            or not preview_pattern.fullmatch(preview_path)
            or source_sha != str(record.get("sourceSha256") or "").casefold()
            or not re.fullmatch(r"[0-9a-f]{64}", preview_sha)
        ):
            raise ValueError("Índice de previews diverge do manifesto canônico.")
        preview_file = root / LIBRARY_ROOT_PREFIX / preview_path
        if (
            preview_file.is_symlink()
            or not preview_file.is_file()
            or hashlib.sha256(preview_file.read_bytes()).hexdigest() != preview_sha
        ):
            raise ValueError(f"Preview ausente ou adulterado: {preview_path}")
        seen_sources.add(source_path)
        seen_previews.add(preview_path)

        status = str(item.get("status") or "").casefold()
        preview_format = str(item.get("previewFormat") or "").casefold()
        source_extension = str(record.get("extension") or "").casefold()
        identity_matches = str(item.get("documentId") or "") == str(
            record.get("id") or ""
        )
        explicitly_approved_preview = (
            identity_matches
            and source_extension == "docx"
            and preview_format == "docx"
            and status == "ready"
        )
        # PDFs e Pages permanecem bloqueados independentemente da prévia. Todo
        # formato, status ou identidade desconhecida/mismatched falha fechado.
        unsafe_preview = (
            source_extension in {"pdf", "pages"}
            or not explicitly_approved_preview
        )
        if not unsafe_preview:
            approved_html = preview_file.read_text(encoding="utf-8")
            if re.search(r"(?i)<a\b|href\s*=", approved_html):
                raise ValueError(
                    f"Preview DOCX aprovado contém link para original: {preview_path}"
                )
            preview_only_sources.add(source_path)
            continue
        if status == "review-blocked":
            risk_codes = item.get("riskCodes")
            if (
                not isinstance(risk_codes, list)
                or not risk_codes
                or risk_codes != sorted(set(risk_codes))
                or any(
                    not isinstance(code, str) or not risk_pattern.fullmatch(code)
                    for code in risk_codes
                )
            ):
                raise ValueError(f"Preview bloqueado sem riskCodes válidos: {preview_path}")
            placeholder = preview_file.read_text(encoding="utf-8")
            if re.search(r"(?i)<a\b|href\s*=", placeholder):
                raise ValueError(f"Placeholder bloqueado contém link: {preview_path}")
        blocked_sources.add(source_path)
        blocked_ids.add(str(record.get("id") or ""))
        excluded.add(canonical_relative(LIBRARY_ROOT_PREFIX + source_path))
        excluded.add(canonical_relative(LIBRARY_ROOT_PREFIX + preview_path))

    if seen_sources != expected_preview_sources:
        raise ValueError("Cobertura editorial dos previews está incompleta.")

    public_acervo = frozenset(manifest_allowlist & public_originals)
    return LibraryPublicationPlan(
        public_acervo_allowlist=public_acervo,
        excluded_repository_paths=frozenset(excluded),
        blocked_source_paths=frozenset(blocked_sources),
        blocked_document_ids=frozenset(value for value in blocked_ids if value),
        preview_only_source_paths=frozenset(preview_only_sources),
    )


def validate_library_acervo(root: Path, allowlist: set[str]) -> None:
    """Falha fechado se o acervo físico contém algo fora do manifesto."""

    acervo = root / "02_Biblioteca_IA_Engine/acervo"
    if not acervo.is_dir():
        raise ValueError("Diretório público da Biblioteca ausente.")

    physical: set[str] = set()
    for candidate in sorted(acervo.rglob("*")):
        relative_to_acervo = candidate.relative_to(acervo)
        if any(part.lower() in LIBRARY_PRIVATE_PARTS for part in relative_to_acervo.parts):
            continue
        if candidate.is_symlink():
            raise ValueError(f"Link simbólico não permitido no acervo: {candidate}")
        if not candidate.is_file() or candidate.name.lower() in NON_PUBLIC_ADMIN_NAMES:
            continue
        physical.add(canonical_relative(candidate.relative_to(root).as_posix()))

    unexpected = sorted(physical - allowlist)
    missing = sorted(allowlist - physical)
    blocked_allowlisted = sorted(
        relative for relative in allowlist if should_skip(root, root / relative)
    )
    if unexpected:
        raise ValueError(
            "Arquivo físico fora do manifesto da Biblioteca: " + ", ".join(unexpected[:3])
        )
    if missing:
        raise ValueError(
            "Arquivo do manifesto ausente no acervo da Biblioteca: " + ", ".join(missing[:3])
        )
    if blocked_allowlisted:
        raise ValueError(
            "Arquivo aprovado seria omitido pelo filtro público: "
            + ", ".join(blocked_allowlisted[:3])
        )


def _json_bytes(payload: object) -> bytes:
    return (json.dumps(payload, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


def _write_public_json(site: Path, relative: str, payload: object) -> None:
    destination = site / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(_json_bytes(payload))


def write_public_library_metadata(
    root: Path,
    site: Path,
    plan: LibraryPublicationPlan,
) -> None:
    """Publica somente metadados que apontam para documentos liberados."""

    blocked_paths = set(plan.blocked_source_paths)
    blocked_ids = set(plan.blocked_document_ids)
    preview_only_paths = set(plan.preview_only_source_paths)

    def sanitize_record(item: dict, path_key: str = "path") -> dict:
        record = dict(item)
        source_path = canonical_relative(str(record.get(path_key) or ""))
        preview_only = source_path in preview_only_paths
        record["publicationMode"] = (
            "preview-only" if preview_only else "original-public"
        )
        record["originalPublic"] = not preview_only
        return record

    manifest_relative = (
        "02_Biblioteca_IA_Engine/data/biblioteca_documentos_manifest.json"
    )
    manifest = _load_json_object(root / manifest_relative, "Manifesto da Biblioteca")
    all_files = [
        item for item in manifest.get("files", []) if isinstance(item, dict)
    ]
    files = [
        sanitize_record(item)
        for item in all_files
        if item.get("path") not in blocked_paths
    ]
    manifest["files"] = files
    manifest["totalFiles"] = len(files)
    origin_counts = Counter(str(item.get("origin") or "") for item in files)
    for partition in manifest.get("partitions", []):
        if isinstance(partition, dict):
            extensions = {
                str(extension).casefold()
                for extension in partition.get("extensions", [])
                if isinstance(extension, str)
            }
            partition["count"] = sum(
                str(item.get("extension") or "").casefold() in extensions
                for item in files
            )
    for origin in manifest.get("origins", []):
        if isinstance(origin, dict):
            origin["count"] = origin_counts[str(origin.get("id") or "")]
    manifest_bytes = _json_bytes(manifest)
    manifest_destination = site / manifest_relative
    manifest_destination.parent.mkdir(parents=True, exist_ok=True)
    manifest_destination.write_bytes(manifest_bytes)

    for relative, list_key, count_key in (
        (
            "02_Biblioteca_IA_Engine/data/biblioteca_catalogo.json",
            "items",
            "totalFiles",
        ),
        (
            "02_Biblioteca_IA_Engine/data/biblioteca_inbox_manifest_auto.json",
            "files",
            "totalFiles",
        ),
    ):
        payload = _load_json_object(root / relative, Path(relative).name)
        records = [
            sanitize_record(item)
            for item in payload.get(list_key, [])
            if isinstance(item, dict) and item.get("path") not in blocked_paths
        ]
        payload[list_key] = records
        payload[count_key] = len(records)
        _write_public_json(site, relative, payload)

    previews_relative = LIBRARY_PREVIEW_INDEX
    previews = _load_json_object(root / previews_relative, "Índice de previews")
    preview_items = [
        sanitize_record(item, "sourcePath")
        for item in previews.get("items", [])
        if isinstance(item, dict)
        and item.get("status") != "review-blocked"
        and item.get("sourcePath") not in blocked_paths
    ]
    previews["items"] = preview_items
    previews["sourceManifestSha256"] = hashlib.sha256(manifest_bytes).hexdigest()
    previews["sourceManifestUpdatedAt"] = manifest.get("updatedAt")
    previews["manifestDocuments"] = len(files)
    previews["previewableDocuments"] = len(preview_items)
    previews["generatedPreviews"] = len(preview_items)
    previews["generatedByExtension"] = {
        extension: sum(
            item.get("previewFormat") == extension for item in preview_items
        )
        for extension in ("docx", "pages", "pdf")
    }
    ocr_items = [
        item
        for item in preview_items
        if item.get("previewFormat") == "pdf"
        and isinstance(item.get("stats"), dict)
        and bool(item["stats"].get("ocrRequired"))
    ]
    unique_ocr = {
        str(item.get("sourceSha256")): item["stats"] for item in ocr_items
    }
    previews["ocrRequiredDocuments"] = len(ocr_items)
    previews["ocrUniqueJobs"] = len(unique_ocr)
    previews["ocrReadyDocuments"] = sum(
        bool(item["stats"].get("ocrReady")) for item in ocr_items
    )
    previews["ocrFailedDocuments"] = sum(
        not bool(item["stats"].get("ocrReady")) for item in ocr_items
    )
    previews["ocrPages"] = sum(
        int(stats.get("ocrPages") or 0)
        for stats in unique_ocr.values()
        if bool(stats.get("ocrReady"))
    )
    _write_public_json(site, previews_relative, previews)

    brain_relative = (
        "02_Biblioteca_IA_Engine/data/biblioteca_brain_connections.json"
    )
    brain = _load_json_object(root / brain_relative, "Índice de conexões")
    removed_node_ids = {
        str(node.get("id"))
        for node in brain.get("nodes", [])
        if isinstance(node, dict)
        and (
            node.get("sourceId") in blocked_ids
            or str(node.get("path") or "").removeprefix(LIBRARY_ROOT_PREFIX)
            in blocked_paths
        )
    }
    nodes = [
        node
        for node in brain.get("nodes", [])
        if isinstance(node, dict) and str(node.get("id")) not in removed_node_ids
    ]
    edges = [
        edge
        for edge in brain.get("edges", [])
        if isinstance(edge, dict)
        and str(edge.get("from")) not in removed_node_ids
        and str(edge.get("to")) not in removed_node_ids
    ]
    brain["nodes"] = nodes
    brain["edges"] = edges
    brain["stats"] = {
        "themes": sum(node.get("type") == "theme" for node in nodes),
        "documents": sum(node.get("type") == "document" for node in nodes),
        "nodes": len(nodes),
        "edges": len(edges),
    }
    _write_public_json(site, brain_relative, brain)

    duplicates_relative = (
        "02_Biblioteca_IA_Engine/data/biblioteca_duplicados.json"
    )
    duplicates = _load_json_object(root / duplicates_relative, "Índice de duplicados")
    for key in ("exactDuplicates", "renditionFamilies"):
        groups = []
        for group in duplicates.get(key, []):
            if not isinstance(group, dict):
                continue
            remaining = [
                item
                for item in group.get("items", [])
                if isinstance(item, dict)
                and item.get("id") not in blocked_ids
                and item.get("path") not in blocked_paths
            ]
            if len(remaining) < 2:
                continue
            group["items"] = remaining
            group["count"] = len(remaining)
            if key == "renditionFamilies":
                group["extensions"] = sorted(
                    {
                        str(item.get("extension"))
                        for item in remaining
                        if item.get("extension")
                    }
                )
            groups.append(group)
        duplicates[key] = groups
    duplicates["summary"] = {
        "publicDocuments": len(files),
        "exactDuplicateGroups": len(duplicates.get("exactDuplicates", [])),
        "renditionFamilies": len(duplicates.get("renditionFamilies", [])),
    }
    _write_public_json(site, duplicates_relative, duplicates)

    # Estes três arquivos são filas de candidatos incompletos, não catálogos
    # homologados. A lista vazia preserva o schema/consumidores sem publicar
    # conteúdo derivado ainda não aprovado.
    for relative in PUBLIC_EMPTY_CANDIDATE_INDEXES:
        try:
            candidates = json.loads((root / relative).read_text(encoding="utf-8"))
        except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise ValueError(f"Índice derivado ausente ou inválido: {relative}") from exc
        if not isinstance(candidates, list):
            raise ValueError(f"Índice derivado precisa ser uma lista: {relative}")
        _write_public_json(site, relative, [])


def load_card_public_allowlist(root: Path) -> set[str]:
    index_path = root / CARD_PUBLIC_INDEX
    try:
        payload = json.loads(index_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError("Índice público dos cards ausente ou inválido.") from exc

    files = payload.get("files")
    if not isinstance(files, list):
        raise ValueError("Índice público dos cards precisa conter a lista 'files'.")

    allowlist: set[str] = set()
    for value in files:
        if not isinstance(value, str) or not value.strip() or "\\" in value:
            raise ValueError("Índice público dos cards contém caminho inválido.")
        relative_asset = PurePosixPath(value)
        if (
            relative_asset.is_absolute()
            or relative_asset.as_posix() != value
            or any(part in {"", ".", ".."} for part in relative_asset.parts)
            or relative_asset.suffix.casefold() not in CARD_ASSET_SUFFIXES
        ):
            raise ValueError(f"Asset público de card inseguro: {value!r}")
        relative = canonical_relative(CARD_PUBLIC_PREFIX + value)
        if relative in allowlist:
            raise ValueError(f"Asset público de card duplicado: {value}")
        allowlist.add(relative)
    return allowlist


def validate_card_public_assets(root: Path, allowlist: set[str]) -> list[str]:
    """Aceita cópias de conflito conhecidas, mas nunca as publica."""

    public_root = root / CARD_PUBLIC_PREFIX
    if not public_root.is_dir():
        raise ValueError("Diretório público dos cards ausente.")

    physical = {
        canonical_relative(path.relative_to(root).as_posix())
        for path in public_root.rglob("*")
        if path.is_file() and path.suffix.casefold() in CARD_ASSET_SUFFIXES
    }
    missing = sorted(allowlist - physical)
    if missing:
        raise ValueError("Asset aprovado de card ausente: " + ", ".join(missing[:3]))

    # Defesa em profundidade: mesmo que o builder seja executado sem o scanner
    # anterior, nenhum SVG ativo presente na allowlist chega ao artefato.
    for relative in sorted(allowlist):
        if PurePosixPath(relative).suffix.casefold() != ".svg":
            continue
        try:
            validate_svg_file(root / relative)
        except ValueError as exc:
            raise ValueError(f"SVG aprovado inseguro bloqueado ({relative}): {exc}") from exc

    conflicts: list[str] = []
    unexpected: list[str] = []
    for relative in sorted(physical - allowlist):
        candidate = PurePosixPath(relative)
        canonical_name = re.sub(
            r" [2-9]\d*(\.(?:png|jpe?g|webp|svg))$", r"\1", candidate.name, flags=re.IGNORECASE
        )
        canonical = candidate.with_name(canonical_name).as_posix()
        if canonical != relative and canonical in allowlist:
            conflicts.append(relative)
        else:
            unexpected.append(relative)
    if unexpected:
        raise ValueError(
            "Asset físico de card fora do índice público: " + ", ".join(unexpected[:3])
        )
    return conflicts


def validate_clinical_publication(root: Path) -> None:
    """Exige autorização explícita para publicar módulos ainda em revisão."""

    modules_root = root / "01_Modulos_Clinicos"
    for manifest_path in sorted(modules_root.rglob("module.manifest.json")):
        try:
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            raise ValueError(f"Manifesto clínico inválido: {manifest_path}") from exc

        status = str(manifest.get("status", "")).strip().casefold()
        if status in {"privado", "private", "rascunho", "revisar"}:
            raise ValueError(
                f"Módulo clínico não publicável ({status}): "
                f"{manifest_path.relative_to(root)}"
            )
        if status != "em-revisao-medica":
            continue

        publication = manifest.get("publication")
        explicit_preview = (
            isinstance(publication, dict)
            and publication.get("mode") == "public-preview"
            and publication.get("publicPreview") is True
            and publication.get("clinicalReviewOngoing") is True
        )
        index_path = manifest_path.parent / str(manifest.get("entrypoint", "index.html"))
        try:
            index_html = index_path.read_text(encoding="utf-8").casefold()
        except OSError as exc:
            raise ValueError(f"Entrypoint clínico ausente: {index_path}") from exc
        visible_review_notice = (
            "review-strip" in index_html
            and ("revisão médica" in index_html or "revisao medica" in index_html)
        )
        if not explicit_preview or not visible_review_notice:
            raise ValueError(
                "Módulo em revisão só pode sair como prévia pública explícita, "
                f"com aviso visível: {manifest_path.relative_to(root)}"
            )


def validate_public_downloads(root: Path) -> None:
    """Publica somente pacotes declarados, íntegros e sem membros inseguros."""

    downloads_root = root / "downloads"
    expected_names = {PurePosixPath(relative).name for relative in PUBLIC_DOWNLOADS}
    physical_names = {
        path.name for path in downloads_root.iterdir() if path.is_file()
    }
    unexpected = sorted(physical_names - expected_names)
    missing = sorted(expected_names - physical_names)
    if unexpected:
        raise ValueError(
            "Download fora da allowlist pública: " + ", ".join(unexpected)
        )
    if missing:
        raise ValueError("Download público ausente: " + ", ".join(missing))

    checksum_path = downloads_root / "SHA256SUMS.txt"
    checksums: dict[str, str] = {}
    for line_number, raw_line in enumerate(
        checksum_path.read_text(encoding="utf-8").splitlines(), start=1
    ):
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        match = re.fullmatch(r"([0-9a-f]{64})  ([^/\\]+)", line)
        if not match:
            raise ValueError(
                f"Linha inválida em downloads/SHA256SUMS.txt:{line_number}"
            )
        digest, filename = match.groups()
        if filename in checksums:
            raise ValueError(f"Checksum duplicado para download: {filename}")
        checksums[filename] = digest

    archive_names = expected_names - {"SHA256SUMS.txt"}
    if set(checksums) != archive_names:
        raise ValueError("SHA256SUMS.txt não corresponde à allowlist de downloads.")

    for filename in sorted(archive_names):
        archive_path = downloads_root / filename
        digest = hashlib.sha256()
        with archive_path.open("rb") as package:
            for chunk in iter(lambda: package.read(1024 * 1024), b""):
                digest.update(chunk)
        if digest.hexdigest() != checksums[filename]:
            raise ValueError(f"Checksum divergente para download: {filename}")

        try:
            with zipfile.ZipFile(archive_path) as archive:
                members = archive.infolist()
                if not members or len(members) > DOWNLOAD_ARCHIVE_LIMIT:
                    raise ValueError(
                        f"Quantidade insegura de membros no ZIP: {filename}"
                    )
                total_size = 0
                for member in members:
                    member_path = PurePosixPath(member.filename)
                    total_size += member.file_size
                    if (
                        member.filename.startswith("/")
                        or "\\" in member.filename
                        or any(part in {"", ".", ".."} for part in member_path.parts)
                        or member.flag_bits & 0x1
                        or stat.S_ISLNK(member.external_attr >> 16)
                    ):
                        raise ValueError(
                            f"Membro inseguro em {filename}: {member.filename!r}"
                        )
                if total_size > DOWNLOAD_UNCOMPRESSED_LIMIT:
                    raise ValueError(f"ZIP público excede o limite: {filename}")
                damaged = archive.testzip()
                if damaged:
                    raise ValueError(
                        f"Membro corrompido em {filename}: {damaged}"
                    )
        except zipfile.BadZipFile as exc:
            raise ValueError(f"Download ZIP inválido: {filename}") from exc


def copy_entry(
    root: Path,
    site: Path,
    relative: str,
    library_allowlist: set[str],
    card_allowlist: set[str],
    dynamic_exclusions: frozenset[str] = frozenset(),
) -> None:
    canonical = canonical_relative(relative)
    if canonical in PUBLIC_BUILD_EXCLUSIONS or canonical in dynamic_exclusions:
        return

    source = root / relative
    destination = site / relative
    if should_skip(root, source):
        return

    if source.is_dir():
        destination.mkdir(parents=True, exist_ok=True)
        for child in sorted(source.iterdir(), key=lambda path: path.name.casefold()):
            if not should_skip(root, child):
                copy_entry(
                    root,
                    site,
                    child.relative_to(root).as_posix(),
                    library_allowlist,
                    card_allowlist,
                    dynamic_exclusions,
                )
    elif source.is_file():
        if canonical.startswith(LIBRARY_ACERVO_PREFIX) and canonical not in library_allowlist:
            raise ValueError(f"Arquivo da Biblioteca fora da allowlist: {relative}")
        if canonical.startswith(CARD_PUBLIC_PREFIX) and canonical not in card_allowlist:
            return
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)


def normalize_permissions(site: Path) -> None:
    for path in site.rglob("*"):
        mode = 0o755 if path.is_dir() else 0o644
        path.chmod(mode)


EDITORIAL_ATTRIBUTION_MARKER = "antigravity-editorial-attribution:v1"
EDITORIAL_ATTRIBUTION_EXCLUSIONS = frozenset(
    {
        "01_Modulos_Clinicos/Dermatologia_Critica/index.html",
    }
)


def inject_editorial_attribution(site: Path) -> int:
    """Acrescenta atribuição editorial discreta em todo HTML do artefato.

    A injeção acontece somente no artefato público. Assim, páginas antigas e
    módulos independentes recebem a mesma referência sem uma reescrita massiva
    dos arquivos-fonte. O bloco distingue a plataforma/curadoria das obras de
    terceiros e aponta para os dois canais de transparência.
    """

    updated = 0
    for html_path in sorted(site.rglob("*.html")):
        relative = html_path.relative_to(site)
        if relative.as_posix() in EDITORIAL_ATTRIBUTION_EXCLUSIONS:
            continue
        try:
            html = html_path.read_text(encoding="utf-8")
        except UnicodeDecodeError as exc:
            raise ValueError(
                f"HTML público sem codificação UTF-8: {html_path.relative_to(site)}"
            ) from exc
        if EDITORIAL_ATTRIBUTION_MARKER in html:
            continue

        parent = relative.parent.as_posix()
        root_prefix = posixpath.relpath(".", start=parent or ".")
        if root_prefix == ".":
            root_prefix = ""
        else:
            root_prefix += "/"

        integrity_href = f"{root_prefix}19_Integridade_Editorial/"
        profile_href = f"{root_prefix}20_Conheca_Aldenir/"
        css_href = f"{root_prefix}assets/editorial-attribution.css"
        block = f"""
<!-- {EDITORIAL_ATTRIBUTION_MARKER} -->
<link rel="stylesheet" href="{css_href}">
<footer class="antigravity-editorial-attribution" data-editorial-attribution="ATV-ALD-360">
  <p class="antigravity-editorial-attribution__mark">ATV · TURBO TEMI · ALD 360</p>
  <p>
    Idealização da plataforma e responsabilidade editorial:
    <strong>Aldenir Rocha de Oliveira Filho</strong> · editor, criador,
    codificador, produtor, atualizador e patrocinador independente.
    <a href="{integrity_href}">Integridade editorial</a> ·
    <a href="{profile_href}">Conheça o idealizador</a>
  </p>
  <p class="antigravity-editorial-attribution__scope">
    A atribuição refere-se à plataforma e à curadoria original; fontes,
    marcas e obras de terceiros permanecem creditadas aos respectivos titulares.
  </p>
</footer>"""
        closing_body = re.search(r"</body\s*>", html, flags=re.IGNORECASE)
        if closing_body:
            html = html[: closing_body.start()] + block + "\n" + html[closing_body.start() :]
        else:
            html = html.rstrip() + "\n" + block + "\n"
        html_path.write_text(html, encoding="utf-8")
        updated += 1
    return updated


def load_site_analytics_config(root: Path) -> dict:
    """Valida a configuração pública sem aceitar credenciais ou URLs arbitrárias."""

    config = _load_json_object(
        root / ANALYTICS_CONFIG_PATH,
        "Configuração pública de métricas",
    )
    if config.get("schemaVersion") != "antigravity-analytics-v1":
        raise ValueError("Configuração pública de métricas com versão inválida.")
    if config.get("provider") != "goatcounter":
        raise ValueError("Provedor público de métricas não homologado.")
    if not isinstance(config.get("enabled"), bool):
        raise ValueError("Campo enabled das métricas precisa ser booleano.")
    if not isinstance(config.get("visitorCounterEnabled"), bool):
        raise ValueError(
            "Campo visitorCounterEnabled das métricas precisa ser booleano."
        )
    if config.get("publicHost") != PUBLIC_HOST:
        raise ValueError("Host público das métricas não corresponde ao site oficial.")
    if config.get("publicPathPrefix") != "/antigravity-consultas/":
        raise ValueError("Prefixo público das métricas não corresponde ao GitHub Pages.")

    site_code = config.get("siteCode")
    if not isinstance(site_code, str) or (
        site_code and re.fullmatch(r"[a-z0-9][a-z0-9-]{0,62}[a-z0-9]", site_code) is None
    ):
        raise ValueError("Código público GoatCounter ausente ou inválido.")
    if config["enabled"] and not site_code:
        raise ValueError("Métricas ativas exigem um código público GoatCounter.")

    routes = config.get("routes")
    if not isinstance(routes, list) or not routes:
        raise ValueError("Configuração de métricas precisa declarar rotas públicas.")
    seen: set[str] = set()
    for route in routes:
        if not isinstance(route, dict):
            raise ValueError("Rota de métrica precisa ser um objeto.")
        path = route.get("path")
        label = route.get("label")
        if (
            not isinstance(path, str)
            or not path
            or path.startswith(("/", "http://", "https://"))
            or "\\" in path
            or any(part in {"", ".", ".."} for part in PurePosixPath(path).parts)
            or path in seen
            or not isinstance(label, str)
            or not label.strip()
        ):
            raise ValueError("Rota pública inválida na configuração de métricas.")
        seen.add(path)
    return config


def canonical_url_for_html(relative: PurePosixPath) -> str:
    """Converte o caminho do artefato na URL pública preferencial."""

    path = relative.as_posix()
    if path == "index.html":
        return PUBLIC_BASE_URL
    if path.endswith("/index.html"):
        path = path[: -len("index.html")]
    return PUBLIC_BASE_URL + quote(path, safe="/:-._~")


def validate_goatcounter_csp(html: str, site_code: str, relative: PurePosixPath) -> None:
    """Falha fechado: CSP externa só pode ser alterada em revisão explícita."""

    match = re.search(
        r'<meta\s+http-equiv=["\']Content-Security-Policy["\']\s+content=["\'](.*?)["\']\s*/?>',
        html,
        flags=re.IGNORECASE,
    )
    if not match:
        return
    content = match.group(1)
    endpoint = f"https://{site_code}.goatcounter.com"
    required = {
        "script-src": "https://gc.zgo.at",
        "connect-src": endpoint,
        "img-src": endpoint,
    }
    compatible = True
    for directive, source in required.items():
        directive_match = re.search(
            rf"(?:^|;)\s*{re.escape(directive)}\s+([^;]*)",
            content,
        )
        values = directive_match.group(1).split() if directive_match else []
        if source not in values or "'none'" in values:
            compatible = False
            break
    if not compatible:
        raise ValueError(
            "Métricas ativas bloqueadas pela CSP de "
            f"{relative.as_posix()}; autorize apenas os endpoints GoatCounter "
            "em uma revisão de segurança separada."
        )


def inject_public_metadata(site: Path, analytics: dict) -> int:
    """Injeta canonical e o carregador local de métricas em todo HTML público."""

    updated = 0
    enabled = analytics["enabled"]
    site_code = analytics["siteCode"]
    counter_enabled = analytics["visitorCounterEnabled"]
    for html_path in sorted(site.rglob("*.html")):
        relative = PurePosixPath(html_path.relative_to(site).as_posix())
        try:
            html = html_path.read_text(encoding="utf-8")
        except UnicodeDecodeError as exc:
            raise ValueError(
                f"HTML público sem codificação UTF-8: {relative.as_posix()}"
            ) from exc
        if PUBLIC_METADATA_MARKER in html:
            continue

        parent = relative.parent.as_posix()
        root_prefix = posixpath.relpath(".", start=parent or ".")
        root_prefix = "" if root_prefix == "." else root_prefix + "/"
        css_href = f"{root_prefix}assets/site-analytics.css"
        js_src = f"{root_prefix}assets/site-analytics.js"
        config_href = f"{root_prefix}{ANALYTICS_CONFIG_PATH}"

        head_lines = [f"<!-- {PUBLIC_METADATA_MARKER} -->"]
        if relative.as_posix() == "404.html":
            head_lines.append('<meta name="robots" content="noindex,follow">')
        elif re.search(r'<link\s+rel=["\']canonical["\']', html, flags=re.IGNORECASE) is None:
            canonical = html_lib.escape(canonical_url_for_html(relative), quote=True)
            head_lines.append(f'<link rel="canonical" href="{canonical}">')
        head_lines.append(f'<link rel="stylesheet" href="{css_href}">')
        head_block = "\n".join(head_lines)
        closing_head = re.search(r"</head\s*>", html, flags=re.IGNORECASE)
        if closing_head:
            html = html[: closing_head.start()] + head_block + "\n" + html[closing_head.start() :]
        else:
            html = head_block + "\n" + html

        script = (
            f'<script defer src="{js_src}" data-antigravity-analytics '
            f'data-enabled="{str(enabled).lower()}" '
            f'data-counter-enabled="{str(counter_enabled).lower()}" '
            f'data-site-code="{html_lib.escape(site_code, quote=True)}" '
            f'data-public-host="{PUBLIC_HOST}" '
            f'data-config="{config_href}"></script>'
        )
        closing_body = re.search(r"</body\s*>", html, flags=re.IGNORECASE)
        if closing_body:
            html = html[: closing_body.start()] + script + "\n" + html[closing_body.start() :]
        else:
            html = html.rstrip() + "\n" + script + "\n"

        if enabled:
            validate_goatcounter_csp(html, site_code, relative)
        html_path.write_text(html, encoding="utf-8")
        updated += 1
    return updated


def write_search_discovery(root: Path, site: Path) -> tuple[int, int]:
    """Gera sitemap e robots a partir das rotas canônicas homologadas."""

    manifest = _load_json_object(root / "data/site_manifest.json", "Manifesto do site")
    routes = manifest.get("canonicalRoutes")
    if not isinstance(routes, dict):
        raise ValueError("Manifesto do site sem rotas canônicas.")
    html_paths = {"index.html"}
    for path in routes.values():
        if isinstance(path, str) and path.endswith(".html"):
            html_paths.add(path)
    urls = sorted(
        {
            canonical_url_for_html(PurePosixPath(path))
            for path in html_paths
            if (site / path).is_file()
        }
    )
    if PUBLIC_BASE_URL not in urls:
        raise ValueError("Homepage canônica ausente do artefato público.")
    lastmod = manifest.get("updatedAt")
    if not isinstance(lastmod, str) or re.fullmatch(r"\d{4}-\d{2}-\d{2}", lastmod) is None:
        raise ValueError("Manifesto do site sem data editorial válida.")

    entries = "\n".join(
        "  <url>\n"
        f"    <loc>{html_lib.escape(url)}</loc>\n"
        f"    <lastmod>{lastmod}</lastmod>\n"
        "  </url>"
        for url in urls
    )
    sitemap = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{entries}\n"
        "</urlset>\n"
    )
    (site / "sitemap.xml").write_text(sitemap, encoding="utf-8")
    robots = (
        "User-agent: *\n"
        "Allow: /\n\n"
        f"Sitemap: {PUBLIC_BASE_URL}sitemap.xml\n"
    )
    (site / "robots.txt").write_text(robots, encoding="utf-8")
    return len(urls), len(robots.splitlines())


def build(root: Path, site: Path) -> int:
    root = root.resolve()
    site = site.resolve()
    if not root.is_dir() or root == Path(root.anchor):
        raise ValueError(f"Raiz insegura ou inexistente: {root}")
    if not is_within(site, root) or site == root:
        raise ValueError(f"Destino deve ser uma subpasta da raiz: {site}")

    missing = [relative for relative in REQUIRED if not (root / relative).exists()]
    if missing:
        print(f"❌ Entradas públicas obrigatórias ausentes: {len(missing)}")
        for relative in missing:
            print(f"   - {relative}")
        return 1

    library_manifest_allowlist = load_library_acervo_allowlist(root)
    validate_library_acervo(root, library_manifest_allowlist)
    library_plan = load_library_publication_plan(root, library_manifest_allowlist)
    library_allowlist = set(library_plan.public_acervo_allowlist)
    card_allowlist = load_card_public_allowlist(root)
    card_conflicts = validate_card_public_assets(root, card_allowlist)
    analytics_config = load_site_analytics_config(root)
    validate_clinical_publication(root)
    validate_public_downloads(root)

    if site.exists():
        shutil.rmtree(site)
    site.mkdir(parents=True)

    for relative in REQUIRED:
        copy_entry(
            root,
            site,
            relative,
            library_allowlist,
            card_allowlist,
            library_plan.excluded_repository_paths,
        )
    for relative in OPTIONAL:
        if (root / relative).exists():
            copy_entry(
                root,
                site,
                relative,
                library_allowlist,
                card_allowlist,
                library_plan.excluded_repository_paths,
            )
    for relative in PUBLIC_DOWNLOADS:
        copy_entry(
            root,
            site,
            relative,
            library_allowlist,
            card_allowlist,
            library_plan.excluded_repository_paths,
        )
    for logo in sorted(root.glob("logo_concept*.png")):
        copy_entry(
            root,
            site,
            logo.name,
            library_allowlist,
            card_allowlist,
            library_plan.excluded_repository_paths,
        )

    write_public_library_metadata(root, site, library_plan)
    (site / ".nojekyll").touch(exist_ok=True)
    attributed = inject_editorial_attribution(site)
    enriched = inject_public_metadata(site, analytics_config)
    indexed_urls, _ = write_search_discovery(root, site)
    normalize_permissions(site)
    total = sum(path.stat().st_size for path in site.rglob("*") if path.is_file())
    count = sum(1 for path in site.rglob("*") if path.is_file())
    print(f"✅ Artefato montado: {count} arquivo(s), {total / 1024 / 1024:.1f} MiB.")
    print(f"🛡️ Atribuição editorial aplicada a {attributed} página(s) HTML.")
    print(f"🔎 Canonical e métricas preparados em {enriched} página(s) HTML.")
    print(f"🗺️ Sitemap público gerado com {indexed_urls} URL(s) canônicas.")
    if analytics_config["enabled"]:
        print("📊 Métricas públicas habilitadas com contador de visitas registradas.")
    else:
        print("📊 Métricas públicas preparadas e desativadas até cadastro humano do provedor.")
    if card_conflicts:
        print(
            f"🛡️ Cópias de conflito preservadas localmente e excluídas do site: "
            f"{len(card_conflicts)}."
        )
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Monta o site público por allowlist.")
    parser.add_argument("root", type=Path, nargs="?", default=Path.cwd())
    parser.add_argument("site", type=Path, nargs="?", default=Path("site"))
    args = parser.parse_args()

    root = args.root.resolve()
    site = args.site if args.site.is_absolute() else root / args.site
    try:
        return build(root, site)
    except (OSError, ValueError) as exc:
        print(f"❌ Falha segura ao montar artefato: {exc}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
