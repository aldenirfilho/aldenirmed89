#!/usr/bin/env python3
"""Gera previews textuais seguros para os DOCX públicos da Biblioteca IA.

O gerador usa somente a biblioteca padrão do Python. Arquivos DOCX são lidos
como pacotes ZIP/OOXML; nenhum macro, relacionamento externo ou conteúdo HTML
do documento é executado. O resultado é uma representação textual útil para
consulta rápida, não uma reprodução fiel do layout do Word.

Uso:
    python3 scripts_admin/build_library_previews.py
    python3 scripts_admin/build_library_previews.py --check

O modo ``--check`` não cria diretórios nem altera arquivos. Ele reconstrói os
artefatos esperados em memória e exige cobertura exata, hashes atuais e ausência
de previews obsoletos.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import os
import re
import sys
import tempfile
import unicodedata
import zipfile
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from urllib.parse import quote
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_LIBRARY_ROOT = ROOT / "02_Biblioteca_IA_Engine"
MANIFEST_RELATIVE = Path("data/biblioteca_documentos_manifest.json")
INDEX_RELATIVE = Path("data/biblioteca_previews.json")
PREVIEW_DIR_RELATIVE = Path("previews")
PRIVATE_SEGMENTS = {"_private", "inbox", "juridico-financeiro"}
MAX_DOCUMENT_XML_BYTES = 64 * 1024 * 1024
RENDERER_VERSION = "docx-stdlib-xml-v1"

WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
NS = {"w": WORD_NS}
W_VAL = f"{{{WORD_NS}}}val"
W_TAG = lambda name: f"{{{WORD_NS}}}{name}"


class PreviewBuildError(RuntimeError):
    """Erro controlado de geração ou validação dos previews."""


@dataclass(frozen=True)
class PreviewArtifact:
    filename: str
    html_bytes: bytes
    metadata: dict[str, object]


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def atomic_write(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary_name = ""
    try:
        with tempfile.NamedTemporaryFile(
            mode="wb",
            dir=path.parent,
            prefix=f".{path.name}.",
            suffix=".tmp",
            delete=False,
        ) as handle:
            temporary_name = handle.name
            handle.write(data)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary_name, path)
    finally:
        if temporary_name:
            Path(temporary_name).unlink(missing_ok=True)


def load_manifest(library_root: Path) -> tuple[dict, bytes]:
    manifest_path = library_root / MANIFEST_RELATIVE
    try:
        raw = manifest_path.read_bytes()
        payload = json.loads(raw.decode("utf-8"))
    except OSError as exc:
        raise PreviewBuildError(f"Manifesto ausente ou ilegível: {manifest_path}") from exc
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise PreviewBuildError(f"Manifesto JSON inválido: {manifest_path}") from exc
    if not isinstance(payload, dict) or not isinstance(payload.get("files"), list):
        raise PreviewBuildError("O manifesto precisa conter uma lista 'files'.")
    return payload, raw


def canonical_docx_path(raw_path: object) -> PurePosixPath:
    if not isinstance(raw_path, str) or not raw_path.strip():
        raise PreviewBuildError("Registro DOCX sem caminho válido.")
    value = raw_path.strip()
    if "\\" in value:
        raise PreviewBuildError(f"Caminho DOCX usa separador não canônico: {raw_path!r}")
    if value != unicodedata.normalize("NFC", value):
        raise PreviewBuildError(f"Caminho DOCX fora de NFC: {raw_path!r}")
    path = PurePosixPath(value)
    parts = path.parts
    if (
        path.is_absolute()
        or not parts
        or path.as_posix() != value
        or parts[0] != "acervo"
        or any(part in {"", ".", ".."} for part in parts)
        or any(part.casefold() in PRIVATE_SEGMENTS for part in parts)
        or path.suffix.casefold() != ".docx"
    ):
        raise PreviewBuildError(f"Caminho DOCX inseguro ou fora do acervo público: {raw_path!r}")
    return path


def source_file(library_root: Path, relative: PurePosixPath) -> Path:
    root = library_root.resolve()
    candidate = library_root.joinpath(*relative.parts)
    try:
        resolved = candidate.resolve(strict=True)
    except OSError as exc:
        raise PreviewBuildError(f"DOCX ausente: {relative.as_posix()}") from exc
    if root != resolved and root not in resolved.parents:
        raise PreviewBuildError(f"DOCX escapou da Biblioteca: {relative.as_posix()}")
    if not resolved.is_file() or candidate.is_symlink():
        raise PreviewBuildError(f"DOCX não é arquivo público regular: {relative.as_posix()}")
    return resolved


def normalized_style(value: str) -> str:
    decomposed = unicodedata.normalize("NFKD", value)
    return "".join(char for char in decomposed if not unicodedata.combining(char)).casefold()


def paragraph_style(paragraph: ET.Element) -> tuple[int | None, bool]:
    style_node = paragraph.find("./w:pPr/w:pStyle", NS)
    style = normalized_style(style_node.attrib.get(W_VAL, "")) if style_node is not None else ""
    heading = re.search(r"(?:heading|titulo)\s*([1-6])", style)
    if heading:
        return int(heading.group(1)), False
    if style in {"title", "titulo"}:
        return 1, False
    if style in {"subtitle", "subtitulo"}:
        return 2, False
    return None, paragraph.find("./w:pPr/w:numPr", NS) is not None


def run_html(run: ET.Element) -> tuple[str, str]:
    plain_parts: list[str] = []
    rendered_parts: list[str] = []
    for node in run.iter():
        if node.tag == W_TAG("t"):
            value = node.text or ""
            plain_parts.append(value)
            rendered_parts.append(html.escape(value))
        elif node.tag == W_TAG("tab"):
            plain_parts.append("\t")
            rendered_parts.append("\t")
        elif node.tag in {W_TAG("br"), W_TAG("cr")}:
            plain_parts.append("\n")
            rendered_parts.append("<br>")

    plain = "".join(plain_parts)
    rendered = "".join(rendered_parts)
    if not rendered:
        return "", plain

    properties = run.find("./w:rPr", NS)
    if properties is not None:
        if properties.find("./w:b", NS) is not None:
            rendered = f"<strong>{rendered}</strong>"
        if properties.find("./w:i", NS) is not None:
            rendered = f"<em>{rendered}</em>"
        if properties.find("./w:u", NS) is not None:
            rendered = f"<u>{rendered}</u>"
    return rendered, plain


def paragraph_html(paragraph: ET.Element) -> tuple[str, str, bool]:
    rendered_parts: list[str] = []
    plain_parts: list[str] = []
    for run in paragraph.iter(W_TAG("r")):
        rendered, plain = run_html(run)
        rendered_parts.append(rendered)
        plain_parts.append(plain)

    rendered = "".join(rendered_parts).strip()
    plain = "".join(plain_parts).strip()
    if not rendered and plain:
        rendered = html.escape(plain)
    if not rendered:
        return "", "", False

    heading_level, is_list = paragraph_style(paragraph)
    if heading_level is not None:
        return f"<h{heading_level}>{rendered}</h{heading_level}>", plain, False
    if is_list:
        return f"<li>{rendered}</li>", plain, True
    return f"<p>{rendered}</p>", plain, False


def table_html(table: ET.Element) -> tuple[str, str]:
    rendered_rows: list[str] = []
    plain_rows: list[str] = []
    for row in table.findall("./w:tr", NS):
        rendered_cells: list[str] = []
        plain_cells: list[str] = []
        for cell in row.findall("./w:tc", NS):
            cell_texts: list[str] = []
            for paragraph in cell.findall("./w:p", NS):
                _, plain, _ = paragraph_html(paragraph)
                if plain:
                    cell_texts.append(plain)
            plain_cell = "\n".join(cell_texts)
            plain_cells.append(plain_cell)
            rendered_cells.append(f"<td>{html.escape(plain_cell).replace(chr(10), '<br>')}</td>")
        if rendered_cells:
            rendered_rows.append("<tr>" + "".join(rendered_cells) + "</tr>")
            plain_rows.append("\t".join(plain_cells))
    if not rendered_rows:
        return "", ""
    return "<div class=\"table-wrap\"><table><tbody>" + "".join(rendered_rows) + "</tbody></table></div>", "\n".join(plain_rows)


def render_document_xml(document_xml: bytes) -> tuple[str, dict[str, int]]:
    if len(document_xml) > MAX_DOCUMENT_XML_BYTES:
        raise PreviewBuildError(
            f"word/document.xml excede o limite seguro de {MAX_DOCUMENT_XML_BYTES} bytes."
        )
    try:
        document = ET.fromstring(document_xml)
    except ET.ParseError as exc:
        raise PreviewBuildError("word/document.xml inválido.") from exc
    body = document.find("./w:body", NS)
    if body is None:
        raise PreviewBuildError("DOCX sem corpo OOXML reconhecível.")

    blocks: list[str] = []
    plain_blocks: list[str] = []
    pending_list: list[str] = []
    paragraph_count = 0
    table_count = 0

    def flush_list() -> None:
        if pending_list:
            blocks.append("<ul>" + "".join(pending_list) + "</ul>")
            pending_list.clear()

    for child in body:
        if child.tag == W_TAG("p"):
            rendered, plain, is_list = paragraph_html(child)
            if not rendered:
                continue
            paragraph_count += 1
            plain_blocks.append(plain)
            if is_list:
                pending_list.append(rendered)
            else:
                flush_list()
                blocks.append(rendered)
        elif child.tag == W_TAG("tbl"):
            flush_list()
            rendered, plain = table_html(child)
            if rendered:
                table_count += 1
                blocks.append(rendered)
                plain_blocks.append(plain)
    flush_list()

    plain_text = "\n".join(part for part in plain_blocks if part)
    stats = {
        "paragraphs": paragraph_count,
        "tables": table_count,
        "characters": len(plain_text),
        "words": len(re.findall(r"\S+", plain_text)),
    }
    content = "\n".join(blocks) or '<p class="empty">Nenhum texto extraível foi encontrado neste DOCX.</p>'
    return content, stats


def docx_document_xml(source: Path) -> bytes:
    try:
        with zipfile.ZipFile(source) as archive:
            try:
                info = archive.getinfo("word/document.xml")
            except KeyError as exc:
                raise PreviewBuildError(f"DOCX sem word/document.xml: {source.name}") from exc
            if info.file_size > MAX_DOCUMENT_XML_BYTES:
                raise PreviewBuildError(
                    f"word/document.xml excede o limite seguro em {source.name}."
                )
            return archive.read(info)
    except zipfile.BadZipFile as exc:
        raise PreviewBuildError(f"DOCX/ZIP inválido: {source.name}") from exc
    except RuntimeError as exc:
        raise PreviewBuildError(f"DOCX protegido ou ilegível: {source.name}") from exc


def render_page(
    *,
    title: str,
    source_path: str,
    source_sha256: str,
    content: str,
) -> bytes:
    safe_title = html.escape(title or Path(source_path).stem)
    safe_source = html.escape(source_path)
    original_href = "../" + quote(source_path, safe="/")
    page = f"""<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
  <title>{safe_title} — prévia textual</title>
  <style>
    :root{{color-scheme:dark;--bg:#0b1220;--card:#111c30;--text:#e5edf8;--muted:#9fb0c8;--line:#263750;--accent:#38bdf8;--warn:#fbbf24}}
    *{{box-sizing:border-box}}
    body{{margin:0;background:var(--bg);color:var(--text);font:16px/1.68 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}}
    main{{width:min(920px,100%);margin:auto;padding:clamp(1rem,4vw,2.5rem)}}
    .notice{{border:1px solid #6b5310;background:#2a2109;color:#fde68a;border-radius:12px;padding:.8rem 1rem;margin-bottom:1.5rem}}
    .meta{{color:var(--muted);font-size:.82rem;overflow-wrap:anywhere}}
    article{{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:clamp(1rem,4vw,2.4rem);box-shadow:0 16px 45px #0005}}
    h1,h2,h3,h4,h5,h6{{line-height:1.25;color:#f8fbff;scroll-margin-top:1rem}}
    h1{{font-size:clamp(1.55rem,5vw,2.25rem);border-bottom:2px solid var(--accent);padding-bottom:.65rem}}
    h2{{font-size:1.45rem;border-bottom:1px solid var(--line);padding-bottom:.4rem}}
    h3{{font-size:1.2rem;color:#a5b4fc}}
    p,li,td{{white-space:pre-wrap;overflow-wrap:anywhere}}
    ul{{padding-left:1.4rem}}
    .table-wrap{{overflow:auto;margin:1rem 0;border:1px solid var(--line);border-radius:10px}}
    table{{border-collapse:collapse;width:100%;min-width:420px}}
    td{{border:1px solid var(--line);padding:.65rem;vertical-align:top}}
    a{{color:var(--accent)}}
    .download{{display:inline-block;margin-top:.7rem;padding:.65rem .9rem;border:1px solid var(--accent);border-radius:9px;text-decoration:none;font-weight:700}}
    .empty{{color:var(--muted);font-style:italic}}
    @media(max-width:600px){{main{{padding:1rem}}article{{border-radius:12px;padding:1rem}}}}
    @media(prefers-reduced-motion:reduce){{*{{scroll-behavior:auto!important}}}}
  </style>
</head>
<body>
  <main>
    <div class="notice" role="note">⚠️ Prévia textual segura. Layout, imagens, equações, notas e paginação podem diferir do Word original.</div>
    <h1>{safe_title}</h1>
    <p class="meta">Fonte: {safe_source}<br>SHA-256: {source_sha256}</p>
    <p><a class="download" href="{original_href}" download>⬇️ Baixar o DOCX original</a></p>
    <article aria-label="Conteúdo textual extraído do documento">
      {content}
    </article>
  </main>
</body>
</html>
"""
    return page.encode("utf-8")


def preview_name(source_path: str) -> str:
    digest = hashlib.sha256(source_path.encode("utf-8")).hexdigest()[:20]
    return f"docx-{digest}.html"


def build_plan(library_root: Path) -> tuple[list[PreviewArtifact], dict]:
    library_root = library_root.resolve()
    manifest, manifest_bytes = load_manifest(library_root)
    raw_files = manifest["files"]
    artifacts: list[PreviewArtifact] = []
    seen_paths: set[str] = set()
    seen_ids: set[str] = set()

    for record in raw_files:
        if not isinstance(record, dict):
            raise PreviewBuildError("Manifesto contém registro que não é objeto.")
        raw_path = record.get("path")
        path_suffix = PurePosixPath(str(raw_path or "")).suffix.casefold()
        extension = str(record.get("extension") or path_suffix.lstrip(".")).casefold().lstrip(".")
        if extension != "docx" and path_suffix != ".docx":
            continue
        if extension != "docx" or path_suffix != ".docx":
            raise PreviewBuildError(f"Extensão divergente para DOCX: {raw_path!r}")
        relative = canonical_docx_path(raw_path)
        source_path = relative.as_posix()
        document_id = str(record.get("id") or "").strip()
        if not document_id:
            raise PreviewBuildError(f"DOCX sem ID no manifesto: {source_path}")
        if source_path in seen_paths:
            raise PreviewBuildError(f"Caminho DOCX duplicado no manifesto: {source_path}")
        if document_id in seen_ids:
            raise PreviewBuildError(f"ID DOCX duplicado no manifesto: {document_id}")
        seen_paths.add(source_path)
        seen_ids.add(document_id)

        source = source_file(library_root, relative)
        source_sha = sha256_file(source)
        content, stats = render_document_xml(docx_document_xml(source))
        filename = preview_name(source_path)
        page = render_page(
            title=str(record.get("title") or record.get("name") or source.stem),
            source_path=source_path,
            source_sha256=source_sha,
            content=content,
        )
        preview_path = (PREVIEW_DIR_RELATIVE / filename).as_posix()
        metadata: dict[str, object] = {
            "documentId": document_id,
            "sourcePath": source_path,
            "sourceSha256": source_sha,
            "previewPath": preview_path,
            "previewSha256": sha256_bytes(page),
            "renderer": RENDERER_VERSION,
            "status": "ready",
            "textOnly": True,
            "stats": stats,
        }
        artifacts.append(PreviewArtifact(filename=filename, html_bytes=page, metadata=metadata))

    artifacts.sort(key=lambda item: str(item.metadata["sourcePath"]).casefold())
    index = {
        "version": "library-previews-v1",
        "renderer": RENDERER_VERSION,
        "sourceManifest": MANIFEST_RELATIVE.as_posix(),
        "sourceManifestSha256": sha256_bytes(manifest_bytes),
        "sourceManifestUpdatedAt": manifest.get("updatedAt"),
        "manifestDocuments": len(raw_files),
        "previewableDocuments": len(artifacts),
        "generatedPreviews": len(artifacts),
        "items": [artifact.metadata for artifact in artifacts],
    }
    return artifacts, index


def expected_index_bytes(index: dict) -> bytes:
    return (json.dumps(index, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


def check_outputs(library_root: Path, artifacts: list[PreviewArtifact], index: dict) -> None:
    preview_dir = library_root / PREVIEW_DIR_RELATIVE
    index_path = library_root / INDEX_RELATIVE
    expected_names = {artifact.filename for artifact in artifacts}

    if not preview_dir.is_dir():
        raise PreviewBuildError(f"Diretório de previews ausente: {preview_dir}")
    actual_names = {
        path.name
        for path in preview_dir.iterdir()
        if path.is_file() and path.suffix.casefold() == ".html"
    }
    missing = sorted(expected_names - actual_names)
    stale = sorted(actual_names - expected_names)
    if missing or stale:
        details = []
        if missing:
            details.append(f"ausentes={len(missing)}")
        if stale:
            details.append(f"obsoletos={len(stale)}")
        raise PreviewBuildError("Cobertura DOCX divergente: " + ", ".join(details))

    for artifact in artifacts:
        path = preview_dir / artifact.filename
        if path.is_symlink() or not path.is_file():
            raise PreviewBuildError(f"Preview não é arquivo regular: {artifact.filename}")
        if path.read_bytes() != artifact.html_bytes:
            raise PreviewBuildError(f"Preview desatualizado ou adulterado: {artifact.filename}")

    if not index_path.is_file() or index_path.is_symlink():
        raise PreviewBuildError(f"Índice de previews ausente: {index_path}")
    if index_path.read_bytes() != expected_index_bytes(index):
        raise PreviewBuildError("biblioteca_previews.json está ausente ou desatualizado.")


def write_outputs(library_root: Path, artifacts: list[PreviewArtifact], index: dict) -> None:
    preview_dir = library_root / PREVIEW_DIR_RELATIVE
    preview_dir.mkdir(parents=True, exist_ok=True)
    expected_names = {artifact.filename for artifact in artifacts}

    for artifact in artifacts:
        atomic_write(preview_dir / artifact.filename, artifact.html_bytes)

    for path in preview_dir.iterdir():
        if path.is_file() and path.suffix.casefold() == ".html" and path.name not in expected_names:
            path.unlink()

    atomic_write(library_root / INDEX_RELATIVE, expected_index_bytes(index))


def execute(library_root: Path, *, check: bool) -> int:
    try:
        artifacts, index = build_plan(library_root)
        if check:
            check_outputs(library_root, artifacts, index)
            print(f"✅ Cobertura validada: {len(artifacts)} preview(s) DOCX atuais, sem escrita.")
        else:
            write_outputs(library_root, artifacts, index)
            check_outputs(library_root, artifacts, index)
            print(f"✅ Previews gerados: {len(artifacts)} DOCX com cobertura integral.")
        return 0
    except (PreviewBuildError, OSError) as exc:
        print(f"❌ {exc}", file=sys.stderr)
        return 1


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Gera previews textuais seguros para DOCX públicos da Biblioteca IA."
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Valida cobertura e hashes sem criar ou alterar arquivos.",
    )
    parser.add_argument(
        "--library-root",
        type=Path,
        default=DEFAULT_LIBRARY_ROOT,
        help=argparse.SUPPRESS,
    )
    args = parser.parse_args(argv)
    return execute(args.library_root, check=args.check)


if __name__ == "__main__":
    sys.exit(main())
