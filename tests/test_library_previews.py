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
            self.assertNotRegex(preview.casefold(), r"<a\b|href\s*=")
            self.assertEqual(BUILDER.sha256_file(preview_path), item["previewSha256"])
            self.assertEqual(execute_quiet(library, check=True)[0], 0)

    def test_editorial_issue_replaces_preview_with_unlinked_placeholder(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            library, source = make_library(Path(temporary))
            write_docx(
                source,
                marker=(
                    "Aldenir Rocha de Oliveira Filho médico mestre "
                    "CRM-CE 12345"
                ),
            )

            code, _, error = execute_quiet(library, check=False)
            self.assertEqual(code, 0, error)
            index = json.loads(
                (library / "data/biblioteca_previews.json").read_text(
                    encoding="utf-8"
                )
            )
            item = index["items"][0]
            preview = (library / item["previewPath"]).read_text(encoding="utf-8")

            self.assertEqual(index["version"], "library-previews-v5")
            self.assertEqual(item["status"], "review-blocked")
            self.assertEqual(
                item["riskCodes"],
                ["PROFESSIONAL_CLAIM_UNVERIFIED"],
            )
            self.assertEqual(
                item["renderer"],
                "editorial-review-placeholder-v1",
            )
            self.assertIn("Conteúdo em revisão editorial", preview)
            self.assertNotRegex(preview.casefold(), r"<a\b|href\s*=")
            self.assertNotIn("Documento_Autoral.docx", preview)
            self.assertNotIn("CRM-CE 12345", preview)
            self.assertTrue(source.is_file())
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
            self.assertNotIn("<iframe", preview.casefold())
            self.assertIn("default-src 'none'", preview)
            if pdf_item["status"] == "review-blocked":
                self.assertIn(
                    "PDF_FULL_CONTENT_NOT_AUDITED",
                    pdf_item["riskCodes"],
                )
                if (
                    int(pdf_item["stats"].get("nativeVisibleCharacters") or 0) <= 0
                    and not bool(pdf_item["stats"].get("ocrReady"))
                ):
                    self.assertIn(
                        "PREVIEW_TEXT_EXTRACTION_UNAVAILABLE",
                        pdf_item["riskCodes"],
                    )
                self.assertIn("Conteúdo em revisão editorial", preview)
                self.assertNotRegex(preview.casefold(), r"<a\b|href\s*=")
            if (
                pdf_item["status"] != "review-blocked"
                and BUILDER.available_command("pdftoppm")
                and BUILDER.available_command("pdftotext")
            ):
                self.assertIn("data:image/jpeg;base64,", preview)
                self.assertGreater(pdf_item["stats"]["coverBytes"], 0)
            self.assertEqual(execute_quiet(library, check=True)[0], 0)

    def test_pdf_with_extractable_text_is_still_structurally_blocked(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            library, _ = make_library(Path(temporary))
            add_pdf_to_library(library)
            stats = {
                "coverBytes": 0,
                "nativeVisibleCharacters": 240,
                "nativeTextPages": 1,
                "ocrRequired": False,
                "ocrReady": False,
            }
            with mock.patch.object(
                BUILDER,
                "render_pdf_content",
                return_value=(
                    "<p>Texto integralmente extraível nesta prévia.</p>",
                    stats,
                    True,
                ),
            ):
                code, _, error = execute_quiet(library, check=False)

            self.assertEqual(code, 0, error)
            index = json.loads(
                (library / "data/biblioteca_previews.json").read_text(
                    encoding="utf-8"
                )
            )
            pdf_item = next(
                item for item in index["items"] if item["previewFormat"] == "pdf"
            )
            preview = (library / pdf_item["previewPath"]).read_text(encoding="utf-8")
            self.assertEqual(pdf_item["status"], "review-blocked")
            self.assertEqual(
                pdf_item["riskCodes"],
                ["PDF_FULL_CONTENT_NOT_AUDITED"],
            )
            self.assertNotRegex(preview.casefold(), r"<a\b|href\s*=")

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

            self.assertEqual(index["version"], "library-previews-v5")
            self.assertEqual(index["ocrRequiredDocuments"], 1)
            self.assertEqual(index["ocrUniqueJobs"], 1)
            self.assertEqual(index["ocrReadyDocuments"], 0)
            self.assertEqual(index["ocrFailedDocuments"], 1)
            self.assertEqual(pdf_item["status"], "review-blocked")
            self.assertEqual(
                pdf_item["riskCodes"],
                [
                    "PDF_FULL_CONTENT_NOT_AUDITED",
                    "PREVIEW_OCR_REQUIRED",
                    "PREVIEW_TEXT_EXTRACTION_UNAVAILABLE",
                ],
            )
            self.assertTrue(pdf_item["stats"]["ocrRequired"])
            self.assertFalse(pdf_item["stats"]["ocrReady"])
            self.assertIn("Conteúdo em revisão editorial", preview)
            self.assertNotRegex(preview.casefold(), r"<a\b|href\s*=")
            self.assertNotIn("OCR necessário", preview)

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

    def test_persistent_ocr_cache_reuses_build_result_in_check(self) -> None:
        recognized = "Choque séptico por OCR\fNoradrenalina, perfusão e lactato"
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            library, _ = make_library(root)
            add_pdf_to_library(library)
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
                self.assertEqual(execute_quiet(library, check=False)[0], 0)
                cache_files = sorted(
                    (root / ".cache/library-ocr-v1").glob("*.json")
                )
                self.assertEqual(len(cache_files), 1)
                before = cache_files[0].read_bytes()
                before_mtime = cache_files[0].stat().st_mtime_ns

                with mock.patch.object(
                    BUILDER,
                    "write_persistent_ocr_cache",
                    wraps=BUILDER.write_persistent_ocr_cache,
                ) as write_cache:
                    code, _, error = execute_quiet(library, check=True)

                self.assertEqual(code, 0, error)
                write_cache.assert_not_called()

            self.assertEqual(run_ocr.call_count, 1)
            self.assertEqual(cache_files[0].read_bytes(), before)
            self.assertEqual(cache_files[0].stat().st_mtime_ns, before_mtime)
            payload = json.loads(before.decode("utf-8"))
            self.assertEqual(
                set(payload),
                {
                    "schema",
                    "key",
                    "sourceSha256",
                    "config",
                    "result",
                    "resultSha256",
                },
            )
            self.assertNotIn("sourcePath", before.decode("utf-8"))
            self.assertNotIn("Documento_PDF_Autoral.pdf", before.decode("utf-8"))

    def test_check_without_cache_does_not_create_or_write_cache(self) -> None:
        recognized = "OCR determinístico para validar modo somente leitura"
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            library, _ = make_library(root)
            add_pdf_to_library(library)
            patches = (
                mock.patch.object(BUILDER, "pdf_page_count", return_value=1),
                mock.patch.object(BUILDER, "pdf_cover", return_value=("", 0)),
                mock.patch.object(
                    BUILDER,
                    "extract_pdf_text",
                    return_value=("", 1, "poppler-pdftotext"),
                ),
                mock.patch.object(
                    BUILDER,
                    "run_pdf_ocr",
                    return_value=(recognized, 1, "tesseract-por+eng", None),
                ),
            )
            with patches[0], patches[1], patches[2], patches[3]:
                self.assertEqual(execute_quiet(library, check=False)[0], 0)

            cache_root = root / ".cache/library-ocr-v1"
            for cache_file in cache_root.iterdir():
                cache_file.unlink()
            cache_root.rmdir()
            cache_root.parent.rmdir()
            self.assertFalse(cache_root.exists())

            with (
                mock.patch.object(BUILDER, "pdf_page_count", return_value=1),
                mock.patch.object(BUILDER, "pdf_cover", return_value=("", 0)),
                mock.patch.object(
                    BUILDER,
                    "extract_pdf_text",
                    return_value=("", 1, "poppler-pdftotext"),
                ),
                mock.patch.object(
                    BUILDER,
                    "run_pdf_ocr",
                    return_value=(recognized, 1, "tesseract-por+eng", None),
                ) as run_ocr,
            ):
                code, _, error = execute_quiet(library, check=True)

            self.assertEqual(code, 0, error)
            self.assertEqual(run_ocr.call_count, 1)
            self.assertFalse(cache_root.exists())

    def test_ocr_cache_key_invalidates_on_source_and_render_config(self) -> None:
        first_source = "a" * 64
        second_source = "b" * 64
        base_key = BUILDER.ocr_cache_key(first_source)

        self.assertNotEqual(base_key, BUILDER.ocr_cache_key(second_source))
        with mock.patch.object(BUILDER, "OCR_RENDER_DPI", BUILDER.OCR_RENDER_DPI + 1):
            self.assertNotEqual(base_key, BUILDER.ocr_cache_key(first_source))
        with mock.patch.object(BUILDER, "MAX_OCR_PAGES", BUILDER.MAX_OCR_PAGES - 1):
            self.assertNotEqual(base_key, BUILDER.ocr_cache_key(first_source))
        with mock.patch.object(BUILDER, "OCR_PIPELINE_VERSION", "tesseract-local-v2"):
            self.assertNotEqual(base_key, BUILDER.ocr_cache_key(first_source))

    def test_invalid_mismatched_and_symlinked_cache_entries_are_ignored(self) -> None:
        result = ("Texto OCR válido com caracteres suficientes", 1, "tesseract-por+eng", None)
        source_sha = "c" * 64
        with tempfile.TemporaryDirectory() as temporary:
            cache_root = Path(temporary) / ".cache/library-ocr-v1"
            self.assertTrue(
                BUILDER.write_persistent_ocr_cache(cache_root, source_sha, result)
            )
            key = BUILDER.ocr_cache_key(source_sha)
            cache_path = cache_root / f"{key}.json"
            valid_payload = json.loads(cache_path.read_text(encoding="utf-8"))

            cache_path.write_text("{json inválido", encoding="utf-8")
            self.assertIsNone(
                BUILDER.load_persistent_ocr_cache(cache_root, source_sha)
            )

            mismatched = dict(valid_payload)
            mismatched["key"] = "d" * 64
            cache_path.write_text(json.dumps(mismatched), encoding="utf-8")
            self.assertIsNone(
                BUILDER.load_persistent_ocr_cache(cache_root, source_sha)
            )

            external = Path(temporary) / "external-cache.json"
            external.write_text(json.dumps(valid_payload), encoding="utf-8")
            cache_path.unlink()
            cache_path.symlink_to(external)
            self.assertIsNone(
                BUILDER.load_persistent_ocr_cache(cache_root, source_sha)
            )
            self.assertEqual(
                json.loads(external.read_text(encoding="utf-8")),
                valid_payload,
            )

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

            self.assertEqual(
                pages_item["renderer"],
                "editorial-review-placeholder-v1",
            )
            self.assertEqual(pages_item["status"], "review-blocked")
            self.assertEqual(
                pages_item["riskCodes"],
                ["PAGES_FULL_CONTENT_NOT_AUDITED"],
            )
            self.assertEqual(pages_item["stats"]["previewAsset"], "preview-web.jpg")
            self.assertNotIn("data:image/jpeg;base64,", preview)
            self.assertNotRegex(preview.casefold(), r"<a\b|href\s*=")
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
