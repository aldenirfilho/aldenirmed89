"""Regressões de integridade das prévias no artefato público final."""

import hashlib
import json
import tempfile
import unittest
from pathlib import Path

from scripts_admin.audit_public_links import audit


class PublicLinkAuditTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.library = self.root / "02_Biblioteca_IA_Engine"
        self.preview_path = "previews/docx-0123456789abcdef0123.html"
        self.preview = self.library / self.preview_path
        self.preview.parent.mkdir(parents=True)
        self.index = self.library / "data/biblioteca_previews.json"
        self.index.parent.mkdir()
        self.preview_bytes = (
            '<!doctype html><html lang="pt-BR"><head>'
            '<meta charset="utf-8"><title>Prévia de teste</title>'
            '</head><body><p>Conteúdo preservado.</p></body></html>'
        ).encode("utf-8")
        self.preview.write_bytes(self.preview_bytes)
        self.entry = {
            "documentId": "documento-de-teste",
            "status": "ready",
            "previewPath": self.preview_path,
            "previewSha256": hashlib.sha256(self.preview_bytes).hexdigest(),
        }
        self.write_index()

    def write_index(self):
        self.index.write_text(
            json.dumps({"items": [self.entry]}), encoding="utf-8"
        )

    def test_matching_preview_bytes_and_index_pass(self):
        result = audit(self.root)

        self.assertEqual(result["previewsCheckedBySha256"], 1)
        self.assertEqual(result["previewIntegrityErrors"], [])
        self.assertEqual(result["brokenLocalReferences"], [])
        self.assertEqual(result["accessibilityFindings"], [])

    def test_html_changed_after_index_generation_fails_integrity(self):
        self.preview.write_bytes(
            self.preview_bytes.replace(b"</head>", b"<meta name=changed></head>")
        )

        result = audit(self.root)

        self.assertEqual(result["previewsCheckedBySha256"], 1)
        self.assertEqual(result["brokenLocalReferences"], [])
        self.assertEqual(result["previewIntegrityErrors"], [{
            "documentId": "documento-de-teste",
            "path": self.preview_path,
            "error": "published-preview-hash-mismatch",
        }])

    def test_malformed_path_or_hash_is_rejected_before_hash_check(self):
        for field, value in (
            ("previewPath", "previews/../../index.html"),
            ("previewSha256", "not-a-sha256"),
        ):
            with self.subTest(field=field):
                original = self.entry[field]
                self.entry[field] = value
                self.write_index()

                result = audit(self.root)

                self.assertEqual(result["previewsCheckedBySha256"], 0)
                self.assertEqual(result["previewIntegrityErrors"], [{
                    "documentId": "documento-de-teste",
                    "error": "invalid-preview-identity",
                }])
                self.entry[field] = original

    def test_ready_preview_missing_from_artifact_fails_integrity(self):
        self.entry["previewPath"] = "previews/pdf-aaaaaaaaaaaaaaaaaaaa.html"
        self.write_index()

        result = audit(self.root)

        self.assertEqual(result["previewsCheckedBySha256"], 1)
        self.assertEqual(result["previewIntegrityErrors"], [{
            "documentId": "documento-de-teste",
            "path": self.entry["previewPath"],
            "error": "published-preview-hash-mismatch",
        }])


if __name__ == "__main__":
    unittest.main()
