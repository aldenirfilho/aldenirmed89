#!/usr/bin/env python3
"""Acesso externo estritamente limitado aos sete anexos autorizados."""

from __future__ import annotations

import hashlib
import importlib.util
import json
import shutil
import subprocess
import unittest
from pathlib import Path
from urllib.parse import quote


ROOT = Path(__file__).resolve().parents[1]
LIBRARY = ROOT / "02_Biblioteca_IA_Engine"


class ExternalLibraryOriginalTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        spec = importlib.util.spec_from_file_location(
            "external_original_builder", ROOT / "scripts_admin/build_public_site.py"
        )
        cls.builder = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.builder)
        cls.intake = json.loads(
            (LIBRARY / "data/biblioteca_ingestao_20260911.json").read_text()
        )["items"]
        cls.records = json.loads(
            (LIBRARY / "data/biblioteca_documentos_manifest.json").read_text()
        )["files"]
        cls.allowed_paths = {item["path"] for item in cls.intake}

    def test_only_the_seven_verified_payloads_receive_pinned_github_links(self) -> None:
        output = [
            self.builder.sanitize_library_public_record(item, self.allowed_paths)
            for item in self.records
        ]
        linked = [item for item in output if "externalOriginalUrl" in item]
        self.assertEqual(len(linked), 7)
        self.assertEqual({item["path"] for item in linked}, self.allowed_paths)
        for item in linked:
            with self.subTest(path=item["path"]):
                original = LIBRARY / item["path"]
                self.assertEqual(hashlib.sha256(original.read_bytes()).hexdigest(), item["sourceSha256"])
                self.assertEqual(item["publicationMode"], "preview-only")
                self.assertIs(item["originalPublic"], False)
                self.assertEqual(
                    item["externalOriginalUrl"],
                    "https://github.com/aldenirfilho/aldenirmed89/blob/"
                    "7af0e0c680cd988952a7a886b8b2c8f856e69d41/"
                    + quote("02_Biblioteca_IA_Engine/" + item["path"], safe="/"),
                )
                preview = {"documentId": item["id"], "sourcePath": item["path"], "sourceSha256": item["sourceSha256"]}
                self.assertEqual(
                    self.builder.sanitize_library_public_record(preview, self.allowed_paths, "sourcePath")["externalOriginalUrl"],
                    item["externalOriginalUrl"],
                )

    def test_changed_hash_or_identity_cannot_reuse_an_approval(self) -> None:
        for item in self.intake:
            for field, value in (("sourceSha256", "0" * 64), ("id", "another-document")):
                with self.subTest(path=item["path"], field=field):
                    with self.assertRaisesRegex(ValueError, "Identidade do original externo divergente"):
                        self.builder.sanitize_library_public_record({**item, field: value}, self.allowed_paths)
            wrong_path = {**item, "path": "acervo/other.docx", "externalOriginalUrl": "https://evil.example/file.docx"}
            self.assertNotIn("externalOriginalUrl", self.builder.sanitize_library_public_record(wrong_path, {wrong_path["path"]}))

    def test_catalog_urls_are_discarded_and_non_approved_items_stay_unlinked(self) -> None:
        for item in self.records:
            supplied = {**item, "externalOriginalUrl": "https://evil.example/file.docx"}
            sanitized = self.builder.sanitize_library_public_record(supplied, self.allowed_paths)
            self.assertNotEqual(sanitized.get("externalOriginalUrl"), supplied["externalOriginalUrl"])
            if item["path"] not in self.allowed_paths:
                self.assertNotIn("externalOriginalUrl", sanitized)
        for item in self.intake:
            self.assertNotIn("externalOriginalUrl", self.builder.sanitize_library_public_record(item, set()))

    def test_reader_rejects_arbitrary_or_mismatched_urls(self) -> None:
        node = shutil.which("node")
        if not node:
            self.skipTest("Node.js indisponível para executar a validação do leitor")
        source = (LIBRARY / "index.html").read_text()
        functions = "\n".join(
            "function " + name + source.split("function " + name, 1)[1].split("\nfunction ", 1)[0]
            for name in ("isPreviewOnlyItem", "externalOriginalUrl")
        )
        # Dependências isoladas: a identidade do preview já foi validada pelo leitor.
        script = """
const assert = require('node:assert/strict');
const normalizePath = path => path || '';
const safeEncodePath = path => path.split('/').map(encodeURIComponent).join('/');
let entry;
const findGeneratedPreviewEntry = () => entry;
const validateTrustedPreview = value => value;
""" + functions + "\nconst fixtures = " + json.dumps(self.intake) + ";\n" + """
for (const fixture of fixtures) {
  const url = 'https://github.com/aldenirfilho/aldenirmed89/blob/7af0e0c680cd988952a7a886b8b2c8f856e69d41/02_Biblioteca_IA_Engine/' + safeEncodePath(fixture.path);
  const item = {...fixture, publicationMode:'preview-only', originalPublic:false, externalOriginalUrl:url};
  entry = {externalOriginalUrl:url};
  assert.equal(externalOriginalUrl(item), url);
  assert.equal(externalOriginalUrl({...item, externalOriginalUrl:'https://evil.example/file.docx'}), '');
  assert.equal(externalOriginalUrl({...item, externalOriginalUrl:url.replace('/blob/7af0e0c680cd988952a7a886b8b2c8f856e69d41/', '/blob/main/')}), '');
  assert.equal(externalOriginalUrl({...item, originalPublic:true}), '');
  assert.equal(externalOriginalUrl({...item, path:'acervo/another.docx'}), '');
  entry = {externalOriginalUrl:'https://evil.example/file.docx'};
  assert.equal(externalOriginalUrl(item), '');
  entry = null;
  assert.equal(externalOriginalUrl(item), '');
}
"""
        result = subprocess.run([node, "-e", script], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)


if __name__ == "__main__":
    unittest.main()
