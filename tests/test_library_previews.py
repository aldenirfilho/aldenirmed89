#!/usr/bin/env python3
"""Testes isolados do gerador de previews DOCX da Biblioteca IA."""

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
