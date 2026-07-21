#!/usr/bin/env python3
"""Testes isolados do gerador de previews DOCX/PDF da Biblioteca IA."""

from __future__ import annotations

import importlib.util
import io
import json
import sys
import tempfile
import unittest
import zipfile
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]


def load_builder():
    path = ROOT / "scripts_admin/build_library_previews.py"
    spec = importlib.util.spec_from_file_location("build_library_previews", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("Não foi possível carregar build_library_previews.py")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


BUILDER = load_builder()


def execute_quiet(library: Path, *, check: bool) -> tuple[int, str, str]:
    stdout = io.StringIO()
    stderr = io.StringIO()
    with redirect_stdout(stdout), redirect_stderr(stderr):
        code = BUILDER.execute(library, check=check)
    return code, stdout.getvalue(), stderr.getvalue()


def write_docx(path: Path, marker: str = "Conduta segura") -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    document_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
      <w:r><w:t>Resumo &lt;script&gt;alert(1)&lt;/script&gt;</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:b/></w:rPr><w:t>{marker}</w:t></w:r>
    </w:p>
    <w:tbl>
      <w:tr><w:tc><w:p><w:r><w:t>Dado A</w:t></w:r></w:p></w:tc></w:tr>
    </w:tbl>
    <w:sectPr/>
  </w:body>
</w:document>
"""
    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("word/document.xml", document_xml)


def write_pdf(path: Path, marker: str = "Conteudo PDF local") -> None:
    """Cria um PDF 1.4 mínimo sem depender de bibliotecas externas."""

    path.parent.mkdir(parents=True, exist_ok=True)
    stream = f"BT /F1 18 Tf 72 720 Td ({marker}) Tj ET".encode("ascii")
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
        b"/Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
        b"<< /Length " + str(len(stream)).encode("ascii") + b" >>\nstream\n" + stream + b"\nendstream",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ]
    payload = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = [0]
    for number, value in enumerate(objects, start=1):
        offsets.append(len(payload))
        payload.extend(f"{number} 0 obj\n".encode("ascii"))
        payload.extend(value)
        payload.extend(b"\nendobj\n")
    xref = len(payload)
    payload.extend(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    payload.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        payload.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    payload.extend(
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\n"
        f"startxref\n{xref}\n%%EOF\n".encode("ascii")
    )
    path.write_bytes(payload)


def make_library(root: Path) -> tuple[Path, Path]:
    library = root / "02_Biblioteca_IA_Engine"
    source = library / "acervo/uti-geral/Documento_Autoral.docx"
    write_docx(source)
    data_dir = library / "data"
    data_dir.mkdir(parents=True)
    manifest = {
        "updatedAt": "2026-07-21T12:00:00",
        "totalFiles": 1,
        "files": [
            {
                "id": "acervo-uti-geral-documento-autoral-docx",
                "title": "Documento <Autoral>",
                "path": "acervo/uti-geral/Documento_Autoral.docx",
                "extension": "docx",
            }
        ],
    }
    (data_dir / "biblioteca_documentos_manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return library, source


def add_pdf_to_library(library: Path) -> Path:
    source = library / "acervo/uti-geral/Documento_PDF_Autoral.pdf"
    write_pdf(source)
    manifest_path = library / "data/biblioteca_documentos_manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    manifest["files"].append(
        {
            "id": "acervo-uti-geral-documento-pdf-autoral-pdf",
            "title": "Documento PDF Autoral",
            "path": "acervo/uti-geral/Documento_PDF_Autoral.pdf",
            "extension": "pdf",
        }
    )
    manifest["totalFiles"] = len(manifest["files"])
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return source


def add_pages_to_library(library: Path) -> Path:
    source = library / "acervo/uti-geral/Documento_Autoral.pages"
    source.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(source, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("preview-web.jpg", b"\xff\xd8\xff\xd9")
        archive.writestr("Index/Document.iwa", b"fixture")
    manifest_path = library / "data/biblioteca_documentos_manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    manifest["files"].append(
        {
            "id": "acervo-uti-geral-documento-autoral-pages",
            "title": "Documento Apple Pages Autoral",
            "path": "acervo/uti-geral/Documento_Autoral.pages",
            "extension": "pages",
        }
    )
    manifest["totalFiles"] = len(manifest["files"])
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return source


class LibraryPreviewBuilderTests(unittest.TestCase):
    def test_generates_escaped_semantic_preview_and_exact_index(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            library, _ = make_library(Path(temporary))

            self.assertEqual(execute_quiet(library, check=False)[0], 0)
            index_path = library / "data/biblioteca_previews.json"
            index = json.loads(index_path.read_text(encoding="utf-8"))
            self.assertEqual(index["previewableDocuments"], 1)
            self.assertEqual(index["generatedPreviews"], 1)
            item = index["items"][0]
            preview_path = library / item["previewPath"]
            preview = preview_path.read_text(encoding="utf-8")

            self.assertIn("<h1>Resumo &lt;script&gt;alert(1)&lt;/script&gt;</h1>", preview)
            self.assertIn("<strong>Conduta segura</strong>", preview)
            self.assertIn("<table>", preview)
            self.assertNotIn("<script>", preview.casefold())
            self.assertIn("default-src 'none'", preview)
            self.assertEqual(BUILDER.sha256_file(preview_path), item["previewSha256"])
            self.assertEqual(execute_quiet(library, check=True)[0], 0)

    def test_generates_browser_independent_pdf_preview(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            library, _ = make_library(Path(temporary))
            add_pdf_to_library(library)

            code, _, error = execute_quiet(library, check=False)
            self.assertEqual(code, 0, error)
            index = json.loads(
                (library / "data/biblioteca_previews.json").read_text(encoding="utf-8")
            )
            self.assertEqual(
                index["generatedByExtension"], {"docx": 1, "pages": 0, "pdf": 1}
            )
            pdf_item = next(item for item in index["items"] if item["previewFormat"] == "pdf")
            preview = (library / pdf_item["previewPath"]).read_text(encoding="utf-8")

            self.assertTrue(pdf_item["browserIndependent"])
            self.assertIn("Prévia local independente do leitor PDF do navegador", preview)
            self.assertIn("Baixar o PDF original", preview)
            self.assertNotIn("<iframe", preview.casefold())
            self.assertIn("default-src 'none'", preview)
            if BUILDER.available_command("pdftoppm") and BUILDER.available_command("pdftotext"):
                self.assertIn("data:image/jpeg;base64,", preview)
                self.assertGreater(pdf_item["stats"]["coverBytes"], 0)
            self.assertEqual(execute_quiet(library, check=True)[0], 0)

    def test_pdf_native_metrics_ignore_page_separators_and_require_ocr(self) -> None:
        source = Path("Imagem_sem_texto.pdf")
        with (
            mock.patch.object(BUILDER, "pdf_page_count", return_value=3),
            mock.patch.object(
                BUILDER,
                "pdf_cover",
                return_value=("data:image/jpeg;base64,/9j/", 3),
            ),
            mock.patch.object(
                BUILDER,
                "extract_pdf_text",
                return_value=("\f\f", 3, "pypdf"),
            ),
        ):
            content, stats, rendered = BUILDER.render_pdf_content(source)

        self.assertTrue(rendered)
        self.assertEqual(stats["characters"], 0)
        self.assertEqual(stats["previewTextPages"], 0)
        self.assertEqual(stats["nativeVisibleCharacters"], 0)
        self.assertEqual(stats["nativeTextPages"], 0)
        self.assertEqual(stats["nativeTextCoverage"], 0.0)
        self.assertTrue(stats["ocrRequired"])
        self.assertEqual(stats["ocrReason"], "no-native-text")
        self.assertIn("OCR necessário", content)
        self.assertNotIn("texto extraído</h2>", content)

    def test_pdf_native_metrics_measure_text_pages_and_coverage(self) -> None:
        source = Path("Documento_misto.pdf")
        raw_text = "Página um com texto\f \t\n\fPágina três com texto"
        with (
            mock.patch.object(BUILDER, "pdf_page_count", return_value=3),
            mock.patch.object(BUILDER, "pdf_cover", return_value=("", 0)),
            mock.patch.object(
                BUILDER,
                "extract_pdf_text",
                return_value=(raw_text, 3, "poppler-pdftotext"),
            ),
        ):
            content, stats, rendered = BUILDER.render_pdf_content(source)

        self.assertTrue(rendered)
        self.assertEqual(stats["analyzedPages"], 3)
        self.assertEqual(stats["nativeTextPages"], 2)
        self.assertEqual(stats["previewTextPages"], 2)
        self.assertEqual(stats["nativeTextCoverage"], 0.6667)
        self.assertGreater(stats["nativeVisibleCharacters"], 0)
        self.assertEqual(stats["characters"], stats["nativeVisibleCharacters"])
        self.assertFalse(stats["ocrRequired"])
        self.assertIsNone(stats["ocrReason"])
        self.assertIn("Página 1 — texto extraído", content)
        self.assertIn("Página 3 — texto extraído", content)
        self.assertNotIn("Página 2 — texto extraído", content)

    def test_build_labels_rasterized_pdf_without_claiming_extracted_text(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            library, _ = make_library(Path(temporary))
            add_pdf_to_library(library)
            with (
                mock.patch.object(BUILDER, "pdf_page_count", return_value=2),
                mock.patch.object(
                    BUILDER,
                    "pdf_cover",
                    return_value=("data:image/jpeg;base64,/9j/", 3),
                ),
                mock.patch.object(
                    BUILDER,
                    "extract_pdf_text",
                    return_value=("\f", 2, "poppler-pdftotext"),
                ),
                mock.patch.object(
                    BUILDER,
                    "run_pdf_ocr",
                    return_value=("", 0, "unavailable", "engine-unavailable"),
                ),
            ):
                code, _, error = execute_quiet(library, check=False)

            self.assertEqual(code, 0, error)
            index = json.loads(
                (library / "data/biblioteca_previews.json").read_text(encoding="utf-8")
            )
            pdf_item = next(item for item in index["items"] if item["previewFormat"] == "pdf")
            preview = (library / pdf_item["previewPath"]).read_text(encoding="utf-8")

            self.assertEqual(index["version"], "library-previews-v4")
            self.assertEqual(index["ocrRequiredDocuments"], 1)
            self.assertEqual(index["ocrUniqueJobs"], 1)
            self.assertEqual(index["ocrReadyDocuments"], 0)
            self.assertEqual(index["ocrFailedDocuments"], 1)
            self.assertEqual(pdf_item["status"], "ocr-required")
            self.assertTrue(pdf_item["stats"]["ocrRequired"])
            self.assertFalse(pdf_item["stats"]["ocrReady"])
            self.assertIn("OCR necessário", preview)
            self.assertNotIn("páginas de texto extraído", preview)

    def test_ocr_makes_rasterized_pdf_searchable_and_reuses_sha_cache(self) -> None:
        cache = {}
        recognized = "Choque séptico reconhecido por OCR\fNoradrenalina e perfusão"
        with (
            mock.patch.object(BUILDER, "pdf_page_count", return_value=2),
            mock.patch.object(BUILDER, "pdf_cover", return_value=("", 0)),
            mock.patch.object(
                BUILDER,
                "extract_pdf_text",
                return_value=("\f", 2, "poppler-pdftotext"),
            ),
            mock.patch.object(
                BUILDER,
                "run_pdf_ocr",
                return_value=(recognized, 2, "tesseract-por+eng", None),
            ) as run_ocr,
        ):
            first, first_stats, first_rendered = BUILDER.render_pdf_content(
                Path("rasterizado.pdf"), source_sha256="a" * 64, ocr_cache=cache
            )
            second, second_stats, _ = BUILDER.render_pdf_content(
                Path("duplicata.pdf"), source_sha256="a" * 64, ocr_cache=cache
            )

        self.assertEqual(run_ocr.call_count, 1)
        self.assertTrue(first_rendered)
        self.assertTrue(first_stats["ocrRequired"])
        self.assertTrue(first_stats["ocrReady"])
        self.assertEqual(first_stats["ocrPages"], 2)
        self.assertEqual(first_stats["ocrEngine"], "tesseract-por+eng")
        self.assertEqual(first_stats["ocrLanguages"], ["por", "eng"])
        self.assertIn("texto OCR (confira no original)", first)
        self.assertIn("Choque séptico reconhecido por OCR", first)
        self.assertEqual(second, first)
        self.assertEqual(second_stats["ocrVisibleCharacters"], first_stats["ocrVisibleCharacters"])

    def test_unavailable_extractor_does_not_guess_ocr_requirement(self) -> None:
        stats = BUILDER.pdf_native_text_metrics("", 0, "unavailable")

        self.assertEqual(stats["nativeVisibleCharacters"], 0)
        self.assertEqual(stats["nativeTextPages"], 0)
        self.assertEqual(stats["nativeTextCoverage"], 0.0)
        self.assertFalse(stats["ocrRequired"])
        self.assertIsNone(stats["ocrReason"])

    def test_generates_pages_quicklook_preview_without_executing_package(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            library, _ = make_library(Path(temporary))
            add_pages_to_library(library)

            code, _, error = execute_quiet(library, check=False)
            self.assertEqual(code, 0, error)
            index = json.loads(
                (library / "data/biblioteca_previews.json").read_text(encoding="utf-8")
            )
            pages_item = next(
                item for item in index["items"] if item["previewFormat"] == "pages"
            )
            preview = (library / pages_item["previewPath"]).read_text(encoding="utf-8")

            self.assertEqual(pages_item["renderer"], "pages-quicklook-image-v1")
            self.assertEqual(pages_item["stats"]["previewAsset"], "preview-web.jpg")
            self.assertIn("data:image/jpeg;base64,", preview)
            self.assertIn("Baixar o PAGES original", preview)
            self.assertNotIn("Index/Document.iwa", preview)
            self.assertEqual(execute_quiet(library, check=True)[0], 0)

    def test_check_is_read_only_and_detects_stale_source(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            library, source = make_library(Path(temporary))
            self.assertEqual(execute_quiet(library, check=False)[0], 0)
            tracked = [
                library / "data/biblioteca_previews.json",
                *sorted((library / "previews").glob("*.html")),
            ]
            before = {path: path.read_bytes() for path in tracked}

            self.assertEqual(execute_quiet(library, check=True)[0], 0)
            self.assertEqual(before, {path: path.read_bytes() for path in tracked})

            write_docx(source, marker="Fonte modificada")
            code, _, error = execute_quiet(library, check=True)
            self.assertEqual(code, 1)
            self.assertIn("desatualizado", error)
            self.assertEqual(before, {path: path.read_bytes() for path in tracked})

    def test_rejects_private_and_non_nfc_manifest_paths(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            library, _ = make_library(Path(temporary))
            manifest_path = library / "data/biblioteca_documentos_manifest.json"
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            manifest["files"][0]["path"] = "acervo/_private/Documento_Autoral.docx"
            manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
            with self.assertRaises(BUILDER.PreviewBuildError):
                BUILDER.build_plan(library)

            manifest["files"][0]["path"] = "acervo/uti-geral/Avaliac\u0327a\u0303o.docx"
            manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
            with self.assertRaises(BUILDER.PreviewBuildError):
                BUILDER.build_plan(library)


if __name__ == "__main__":
    unittest.main()
