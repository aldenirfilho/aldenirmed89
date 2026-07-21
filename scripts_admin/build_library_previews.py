#!/usr/bin/env python3
"""Gera previews HTML locais para DOCX, PDF e Pages públicos da Biblioteca IA.

DOCX são lidos como pacotes ZIP/OOXML, sem executar macros ou relacionamentos
externos. PDF recebe uma capa rasterizada e texto extraído quando Poppler ou
``pypdf`` estão disponíveis. O HTML resultante é same-origin, funciona sem o
plugin PDF do navegador e nunca executa conteúdo ativo do documento.

Uso:
    python3 scripts_admin/build_library_previews.py
    python3 scripts_admin/build_library_previews.py --check

O modo ``--check`` não cria diretórios nem altera arquivos. Ele reconstrói os
artefatos esperados em memória e exige cobertura exata, hashes atuais e ausência
de previews obsoletos.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import html
import json
import os
import re
import shutil
import subprocess
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
MAX_PDF_TEXT_PAGES = 80
MAX_PDF_TEXT_CHARS = 1_500_000
MAX_PDF_COVER_BYTES = 3 * 1024 * 1024
PDF_COMMAND_TIMEOUT_SECONDS = 90
INDEX_RENDERER_VERSION = "library-safe-html-v2"
DOCX_RENDERER_VERSION = "docx-stdlib-xml-v1"
PDF_RENDERER_VERSION = "pdf-local-cover-text-v1"
PAGES_RENDERER_VERSION = "pages-quicklook-image-v1"
PREVIEW_EXTENSIONS = {"docx", "pdf", "pages"}

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


def canonical_preview_path(raw_path: object, expected_extension: str) -> PurePosixPath:
    label = expected_extension.upper()
    if not isinstance(raw_path, str) or not raw_path.strip():
        raise PreviewBuildError(f"Registro {label} sem caminho válido.")
    value = raw_path.strip()
    if "\\" in value:
        raise PreviewBuildError(f"Caminho {label} usa separador não canônico: {raw_path!r}")
    if value != unicodedata.normalize("NFC", value):
        raise PreviewBuildError(f"Caminho {label} fora de NFC: {raw_path!r}")
    path = PurePosixPath(value)
    parts = path.parts
    if (
        path.is_absolute()
        or not parts
        or path.as_posix() != value
        or parts[0] != "acervo"
        or any(part in {"", ".", ".."} for part in parts)
        or any(part.casefold() in PRIVATE_SEGMENTS for part in parts)
        or path.suffix.casefold() != f".{expected_extension}"
    ):
        raise PreviewBuildError(
            f"Caminho {label} inseguro ou fora do acervo público: {raw_path!r}"
        )
    return path


def source_file(library_root: Path, relative: PurePosixPath) -> Path:
    root = library_root.resolve()
    candidate = library_root.joinpath(*relative.parts)
    try:
        resolved = candidate.resolve(strict=True)
    except OSError as exc:
        raise PreviewBuildError(f"Documento ausente: {relative.as_posix()}") from exc
    if root != resolved and root not in resolved.parents:
        raise PreviewBuildError(f"Documento escapou da Biblioteca: {relative.as_posix()}")
    if not resolved.is_file() or candidate.is_symlink():
        raise PreviewBuildError(
            f"Documento não é arquivo público regular: {relative.as_posix()}"
        )
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


def available_command(name: str) -> str | None:
    """Resolve uma ferramenta opcional sem depender de shell."""

    return shutil.which(name)


def pdf_page_count(source: Path) -> int | None:
    command = available_command("pdfinfo")
    if not command or not available_command("pdftotext"):
        return None
    try:
        result = subprocess.run(
            [command, str(source)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
            timeout=PDF_COMMAND_TIMEOUT_SECONDS,
        )
    except (OSError, subprocess.TimeoutExpired):
        return None
    if result.returncode != 0:
        return None
    output = result.stdout.decode("utf-8", errors="replace")
    match = re.search(r"^Pages:\s*(\d+)\s*$", output, flags=re.MULTILINE)
    return int(match.group(1)) if match else None


def pdf_cover(source: Path) -> tuple[str, int]:
    """Rasteriza somente a primeira página; falhas geram fallback textual."""

    command = available_command("pdftoppm")
    # A distribuição oficial de Poppler fornece as duas ferramentas. Alguns
    # runtimes mínimos expõem um wrapper isolado de pdftoppm sem fontconfig
    # funcional; nesse caso a extração pypdf evita travamentos locais.
    if not command or not available_command("pdftotext"):
        return "", 0
    try:
        with tempfile.TemporaryDirectory(prefix="library-pdf-cover-") as temporary:
            prefix = Path(temporary) / "cover"
            result = subprocess.run(
                [
                    command,
                    "-f", "1",
                    "-l", "1",
                    "-singlefile",
                    "-jpeg",
                    "-jpegopt", "quality=76",
                    "-r", "96",
                    str(source),
                    str(prefix),
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=False,
                timeout=PDF_COMMAND_TIMEOUT_SECONDS,
            )
            cover_path = prefix.with_suffix(".jpg")
            if result.returncode != 0 or not cover_path.is_file():
                return "", 0
            data = cover_path.read_bytes()
    except (OSError, subprocess.TimeoutExpired):
        return "", 0
    if not data or len(data) > MAX_PDF_COVER_BYTES:
        return "", 0
    encoded = base64.b64encode(data).decode("ascii")
    return f"data:image/jpeg;base64,{encoded}", len(data)


def extract_pdf_text(source: Path, page_count: int | None) -> tuple[str, int, str]:
    """Extrai texto limitado; a capa continua disponível quando não houver OCR."""

    last_page = min(page_count or MAX_PDF_TEXT_PAGES, MAX_PDF_TEXT_PAGES)
    command = available_command("pdftotext")
    if command:
        try:
            result = subprocess.run(
                [
                    command,
                    "-f", "1",
                    "-l", str(max(last_page, 1)),
                    "-layout",
                    "-enc", "UTF-8",
                    str(source),
                    "-",
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=False,
                timeout=PDF_COMMAND_TIMEOUT_SECONDS,
            )
            if result.returncode == 0:
                text = result.stdout.decode("utf-8", errors="replace").replace("\x00", "")
                return text[:MAX_PDF_TEXT_CHARS], last_page, "poppler-pdftotext"
        except (OSError, subprocess.TimeoutExpired):
            pass

    # O runtime de documentos do Codex fornece pypdf localmente. O import é
    # opcional para que o build continue com uma capa visível em ambientes sem
    # essa biblioteca; o workflow oficial instala Poppler explicitamente.
    try:
        from pypdf import PdfReader  # type: ignore[import-not-found]

        reader = PdfReader(str(source), strict=False)
        if reader.is_encrypted:
            try:
                reader.decrypt("")
            except Exception:
                return "", 0, "unavailable"
        page_limit = min(len(reader.pages), MAX_PDF_TEXT_PAGES)
        pages: list[str] = []
        for page in reader.pages[:page_limit]:
            pages.append((page.extract_text() or "").replace("\x00", ""))
            if sum(len(value) for value in pages) >= MAX_PDF_TEXT_CHARS:
                break
        return "\f".join(pages)[:MAX_PDF_TEXT_CHARS], len(pages), "pypdf"
    except Exception:
        return "", 0, "unavailable"


def render_pdf_content(source: Path) -> tuple[str, dict[str, object], bool]:
    pages = pdf_page_count(source)
    cover_uri, cover_bytes = pdf_cover(source)
    raw_text, text_pages, extractor = extract_pdf_text(source, pages)

    blocks: list[str] = []
    if cover_uri:
        blocks.append(
            '<figure class="pdf-cover"><img src="'
            + cover_uri
            + '" alt="Primeira página renderizada do PDF"><figcaption>'
            "Página 1 renderizada localmente</figcaption></figure>"
        )

    text_sections = []
    for page_number, page_text in enumerate(raw_text.split("\f"), start=1):
        cleaned = page_text.strip()
        if not cleaned:
            continue
        text_sections.append(
            f'<section class="pdf-text-page"><h2>Página {page_number} — texto extraído</h2>'
            f"<pre>{html.escape(cleaned)}</pre></section>"
        )
    if text_sections:
        blocks.extend(text_sections)
    elif cover_uri:
        blocks.append(
            '<p class="empty">Este PDF não forneceu texto extraível. A primeira página '
            "renderizada acima confirma o conteúdo visual; o original integral permanece disponível.</p>"
        )
    else:
        blocks.append(
            '<p class="empty">Este PDF não forneceu texto nem capa extraíveis neste ambiente. '
            "O original integral permanece preservado e disponível para download.</p>"
        )

    stats: dict[str, object] = {
        "pages": pages,
        "previewTextPages": text_pages,
        "characters": len(raw_text),
        "words": len(re.findall(r"\S+", raw_text)),
        "coverBytes": cover_bytes,
        "textExtractor": extractor,
        "textPageLimit": MAX_PDF_TEXT_PAGES,
    }
    return "\n".join(blocks), stats, bool(cover_uri or text_sections)


def render_pages_content(source: Path) -> tuple[str, dict[str, object], bool]:
    """Usa apenas a imagem Quick Look já embutida no pacote Apple Pages."""

    candidates = ("preview-web.jpg", "preview.jpg", "preview-micro.jpg")
    selected = ""
    data = b""
    try:
        with zipfile.ZipFile(source) as archive:
            for candidate in candidates:
                try:
                    info = archive.getinfo(candidate)
                except KeyError:
                    continue
                if 0 < info.file_size <= MAX_PDF_COVER_BYTES:
                    value = archive.read(info)
                    if value.startswith(b"\xff\xd8\xff"):
                        selected = candidate
                        data = value
                        break
    except (zipfile.BadZipFile, RuntimeError, OSError):
        data = b""

    if data:
        encoded = base64.b64encode(data).decode("ascii")
        content = (
            '<figure class="pdf-cover"><img src="data:image/jpeg;base64,'
            + encoded
            + '" alt="Prévia Quick Look do documento Apple Pages"><figcaption>'
            "Imagem de pré-visualização preservada no arquivo Pages</figcaption></figure>"
        )
        return content, {"previewAsset": selected, "previewBytes": len(data)}, True

    content = (
        '<p class="empty">Este pacote Apple Pages não contém uma imagem Quick Look '
        "compatível. O original permanece disponível para abrir ou baixar.</p>"
    )
    return content, {"previewAsset": None, "previewBytes": 0}, False


def render_page(
    *,
    title: str,
    source_path: str,
    source_sha256: str,
    content: str,
    format_label: str,
    notice: str,
    content_label: str,
) -> bytes:
    safe_title = html.escape(title or Path(source_path).stem)
    safe_source = html.escape(source_path)
    safe_notice = html.escape(notice)
    safe_content_label = html.escape(content_label)
    original_href = "../" + quote(source_path, safe="/")
    page = f"""<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
  <title>{safe_title} — prévia local</title>
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
    .pdf-cover{{margin:0 auto 2rem;text-align:center}}
    .pdf-cover img{{display:block;max-width:100%;height:auto;margin:auto;border:1px solid var(--line);border-radius:8px;box-shadow:0 12px 30px #0007}}
    .pdf-cover figcaption{{color:var(--muted);font-size:.82rem;margin-top:.55rem}}
    .pdf-text-page{{border-top:1px solid var(--line);padding-top:.5rem;margin-top:1.5rem}}
    .pdf-text-page pre{{white-space:pre-wrap;overflow-wrap:anywhere;font:14px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace}}
    @media(max-width:600px){{main{{padding:1rem}}article{{border-radius:12px;padding:1rem}}}}
    @media(prefers-reduced-motion:reduce){{*{{scroll-behavior:auto!important}}}}
  </style>
</head>
<body>
  <main>
    <div class="notice" role="note">⚠️ {safe_notice}</div>
    <h1>{safe_title}</h1>
    <p class="meta">Fonte: {safe_source}<br>SHA-256: {source_sha256}</p>
    <p><a class="download" href="{original_href}" download>⬇️ Baixar o {html.escape(format_label)} original</a></p>
    <article aria-label="{safe_content_label}">
      {content}
    </article>
  </main>
</body>
</html>
"""
    return page.encode("utf-8")


def preview_name(source_path: str, extension: str) -> str:
    digest = hashlib.sha256(source_path.encode("utf-8")).hexdigest()[:20]
    return f"{extension}-{digest}.html"


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
        if extension not in PREVIEW_EXTENSIONS and path_suffix not in {
            f".{value}" for value in PREVIEW_EXTENSIONS
        }:
            continue
        if extension not in PREVIEW_EXTENSIONS or path_suffix != f".{extension}":
            raise PreviewBuildError(f"Extensão divergente para preview: {raw_path!r}")
        relative = canonical_preview_path(raw_path, extension)
        source_path = relative.as_posix()
        document_id = str(record.get("id") or "").strip()
        if not document_id:
            raise PreviewBuildError(f"Documento sem ID no manifesto: {source_path}")
        if source_path in seen_paths:
            raise PreviewBuildError(f"Caminho duplicado no manifesto: {source_path}")
        if document_id in seen_ids:
            raise PreviewBuildError(f"ID duplicado no manifesto: {document_id}")
        seen_paths.add(source_path)
        seen_ids.add(document_id)

        source = source_file(library_root, relative)
        source_sha = sha256_file(source)
        declared_sha = str(record.get("sourceSha256") or "").casefold()
        if declared_sha and declared_sha != source_sha:
            raise PreviewBuildError(f"SHA-256 divergente no manifesto: {source_path}")

        if extension == "docx":
            content, stats = render_document_xml(docx_document_xml(source))
            renderer = DOCX_RENDERER_VERSION
            status = "ready"
            text_only = True
            notice = (
                "Prévia textual segura. Layout, imagens, equações, notas e paginação "
                "podem diferir do Word original."
            )
            content_label = "Conteúdo textual extraído do documento Word"
        elif extension == "pdf":
            content, stats, rendered = render_pdf_content(source)
            renderer = PDF_RENDERER_VERSION
            status = "ready" if rendered else "degraded"
            text_only = False
            if stats["coverBytes"] and stats["characters"]:
                preview_detail = "primeira página renderizada e até 80 páginas de texto"
            elif stats["coverBytes"]:
                preview_detail = "primeira página renderizada; não foi encontrado texto extraível"
            elif stats["characters"]:
                preview_detail = "até 80 páginas de texto extraído"
            else:
                preview_detail = "fallback explícito; este arquivo não forneceu capa nem texto"
            notice = (
                "Prévia local independente do leitor PDF do navegador: "
                f"{preview_detail}. O original integral não foi alterado."
            )
            content_label = "Prévia local do documento PDF"
        else:
            content, stats, rendered = render_pages_content(source)
            renderer = PAGES_RENDERER_VERSION
            status = "ready" if rendered else "degraded"
            text_only = False
            notice = (
                "Prévia local da imagem Quick Look embutida no arquivo Apple Pages. "
                "O documento original integral não foi alterado."
            )
            content_label = "Prévia local do documento Apple Pages"

        filename = preview_name(source_path, extension)
        page = render_page(
            title=str(record.get("title") or record.get("name") or source.stem),
            source_path=source_path,
            source_sha256=source_sha,
            content=content,
            format_label=extension.upper(),
            notice=notice,
            content_label=content_label,
        )
        preview_path = (PREVIEW_DIR_RELATIVE / filename).as_posix()
        metadata: dict[str, object] = {
            "documentId": document_id,
            "sourcePath": source_path,
            "sourceSha256": source_sha,
            "previewPath": preview_path,
            "previewSha256": sha256_bytes(page),
            "renderer": renderer,
            "previewFormat": extension,
            "status": status,
            "textOnly": text_only,
            "browserIndependent": True,
            "stats": stats,
        }
        artifacts.append(PreviewArtifact(filename=filename, html_bytes=page, metadata=metadata))

    artifacts.sort(key=lambda item: str(item.metadata["sourcePath"]).casefold())
    generated_by_extension = {
        extension: sum(
            1 for artifact in artifacts if artifact.metadata["previewFormat"] == extension
        )
        for extension in sorted(PREVIEW_EXTENSIONS)
    }
    index = {
        "version": "library-previews-v2",
        "renderer": INDEX_RENDERER_VERSION,
        "sourceManifest": MANIFEST_RELATIVE.as_posix(),
        "sourceManifestSha256": sha256_bytes(manifest_bytes),
        "sourceManifestUpdatedAt": manifest.get("updatedAt"),
        "manifestDocuments": len(raw_files),
        "previewableDocuments": len(artifacts),
        "generatedPreviews": len(artifacts),
        "generatedByExtension": generated_by_extension,
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
        raise PreviewBuildError("Cobertura de previews divergente: " + ", ".join(details))

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
            print(
                f"✅ Cobertura validada: {len(artifacts)} preview(s) DOCX/PDF/Pages atuais, sem escrita."
            )
        else:
            write_outputs(library_root, artifacts, index)
            check_outputs(library_root, artifacts, index)
            print(
                f"✅ Previews gerados: {len(artifacts)} DOCX/PDF/Pages com cobertura integral."
            )
        return 0
    except (PreviewBuildError, OSError) as exc:
        print(f"❌ {exc}", file=sys.stderr)
        return 1


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Gera previews HTML locais para DOCX, PDF e Pages públicos da Biblioteca IA."
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
