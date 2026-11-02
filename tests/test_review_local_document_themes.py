"""Revisão seletiva em origens sintéticas; nenhum documento real é acessado."""
import hashlib
import json
import os
from pathlib import Path
import stat
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts_admin"))
import organize_icloud_documents as organize
import review_local_document_themes as review


class ReviewDocumentThemesTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="review-documents-test-")
        self.root = Path(self.temp.name)
        self.source = self.root / "PDF"
        self.source.mkdir()
        self.inventory = self.root / "inventory.json"
        documents = []
        for name in ("opaco.pdf", "sepse.pdf", "scheme:local.pdf"):
            path = self.source / name
            path.write_bytes(("original privado " + name).encode())
            info = path.stat()
            documents.append({"relativePath": name, "size": info.st_size, "modifiedNs": info.st_mtime_ns})
        self.inventory.write_text(json.dumps({"schema": "360x-private-documents-inventory-v1", "sourceName": "PDF",
            "complete": True, "documents": documents, "errors": [], "summary": {"documents": 3}}))
        organize.apply_prepared(organize.prepare(self.source, self.inventory))
        manifest = json.loads((self.source / organize.MANIFEST_NAME).read_text())
        pending = next(e for e in manifest["entries"] if e["path"] == "opaco.pdf")
        self.entry = {**pending, "theme": "infectologia", "themeLabel": organize.THEMES["infectologia"],
            "confidence": "alta", "method": "titulo", "matchedTerms": ["Tuberculose pulmonar"],
            "secondaryThemes": ["pneumologia"], "needsReview": False,
            "reason": "Revisão temática do título; conteúdo clínico não validado."}
        # O caminho local-only também é pendente e deve constar na cobertura.
        local = next(e for e in review._catalog_entries(self.source) if e["path"] == "scheme:local.pdf")
        self.decisions = self.root / "decisions.json"
        self.write_decisions([self.entry, local])

    def tearDown(self):
        self.temp.cleanup()

    def write_decisions(self, entries):
        self.decisions.write_text(json.dumps({"schema": review.SCHEMA, "sourceName": "PDF", "entries": entries}))

    def plan(self):
        return review.prepare(self.source, self.inventory, self.decisions)

    def original_snapshot(self):
        return {p.name: (hashlib.sha256(p.read_bytes()).hexdigest(), p.stat().st_mtime_ns)
                for p in self.source.glob("*.pdf")}

    def test_prepare_is_read_only_and_preserves_classified_entries(self):
        before = self.original_snapshot()
        old = (self.source / organize.MANIFEST_NAME).read_bytes()
        plan = self.plan()
        self.assertEqual(plan["summary"]["reviewed"], 2)
        self.assertEqual(plan["summary"]["reclassified"], 1)
        self.assertEqual(plan["summary"]["stillUnclassified"], 1)
        self.assertEqual(before, self.original_snapshot())
        self.assertEqual(old, (self.source / organize.MANIFEST_NAME).read_bytes())
        original = json.loads(old)
        self.assertEqual(next(e for e in original["entries"] if e["path"] == "sepse.pdf"),
                         next(e for e in plan["manifest"]["entries"] if e["path"] == "sepse.pdf"))

    def test_apply_replaces_only_generated_outputs_and_keeps_restorable_backups(self):
        before = self.original_snapshot()
        old = (self.source / organize.MANIFEST_NAME).read_bytes()
        result = review.apply_prepared(self.plan())
        self.assertEqual(result["verifiedLinks"], 3)
        self.assertEqual(Path(result["backupManifest"]).read_bytes(), old)
        self.assertEqual(before, self.original_snapshot())
        self.assertEqual(stat.S_IMODE((self.source / organize.MANIFEST_NAME).stat().st_mode), 0o600)
        links = [p for p in (self.source / organize.CATALOG_NAME).rglob("*") if p.is_symlink()]
        self.assertEqual(len(links), 3)
        self.assertTrue(all(p.exists() and not os.path.isabs(os.readlink(p)) for p in links))
        self.assertTrue(all(p.exists() for p in Path(result["backupCatalog"]).rglob("*") if p.is_symlink()))
        new = json.loads((self.source / organize.MANIFEST_NAME).read_text())
        self.assertEqual(next(e for e in new["entries"] if e["path"] == "opaco.pdf")["theme"], "infectologia")
        self.assertEqual(len(new["entries"]), 2)  # local-only segue só no catálogo

    def test_rejects_incomplete_coverage_duplicates_and_nonpending_changes(self):
        baseline = json.loads(self.decisions.read_text())["entries"]
        classified = next(e for e in json.loads((self.source / organize.MANIFEST_NAME).read_text())["entries"] if e["path"] == "sepse.pdf")
        for entries in ([self.entry], baseline + [self.entry], baseline + [classified]):
            with self.subTest(entries=len(entries)):
                self.write_decisions(entries)
                with self.assertRaises(organize.OrganizationError):
                    self.plan()

    def test_rejects_wrong_fingerprint_unknown_theme_and_payload_fields(self):
        baseline = json.loads(self.decisions.read_text())["entries"]
        for change in ({"size": 999}, {"modifiedMs": 0}, {"theme": "unknown"}, {"url": "https://example.test"},
                       {"secondaryThemes": ["unknown"]}, {"matchedTerms": ["x" * 121]}, {"reason": "x\ny"},
                       {"matchedTerms": ["https://example.test"]}, {"reason": "x\x7fy"}):
            self.write_decisions([{**self.entry, **change}, baseline[1]])
            with self.subTest(change=change), self.assertRaises(organize.OrganizationError):
                self.plan()

    def test_uncertainty_cannot_be_hidden(self):
        baseline = json.loads(self.decisions.read_text())["entries"]
        self.write_decisions([{**self.entry, "confidence": "baixa", "needsReview": False}, baseline[1]])
        with self.assertRaises(organize.OrganizationError):
            self.plan()

    def test_modified_original_or_new_document_stops_apply(self):
        for add in (False, True):
            plan = self.plan()
            if add:
                target = self.source / "new.pdf"
                target.write_bytes(b"new untouched")
            else:
                target = self.source / "opaco.pdf"
                info = target.stat()
                os.utime(target, ns=(info.st_atime_ns, info.st_mtime_ns + 1))
            try:
                with self.assertRaises(organize.OrganizationError):
                    review.apply_prepared(plan)
            finally:
                if add:
                    target.unlink()
                else:
                    os.utime(target, ns=(info.st_atime_ns, info.st_mtime_ns))

    def test_changed_generated_catalog_stops_apply_without_overwriting(self):
        plan = self.plan()
        html = self.source / organize.CATALOG_NAME / "index.html"
        html.write_text(html.read_text() + "<!-- human change -->")
        with self.assertRaises(organize.OrganizationError):
            review.apply_prepared(plan)
        self.assertTrue(html.read_text().endswith("<!-- human change -->"))

    def test_unrecognized_files_in_catalog_are_not_overwritten(self):
        note = self.source / organize.CATALOG_NAME / "my-notes.txt"
        note.write_text("preserve")
        with self.assertRaises(organize.OrganizationError):
            self.plan()
        self.assertEqual(note.read_text(), "preserve")

    def test_missing_or_redirected_old_links_are_rejected(self):
        alias = next((self.source / organize.CATALOG_NAME).rglob("*opaco*"))
        alias.unlink()
        with self.assertRaises(organize.OrganizationError):
            self.plan()
        alias.symlink_to(self.source / "sepse.pdf")
        with self.assertRaises(organize.OrganizationError):
            self.plan()

    def test_catalog_and_manifest_must_agree(self):
        target = self.source / organize.MANIFEST_NAME
        data = json.loads(target.read_text())
        data["entries"][0]["reason"] = "Another value"
        target.write_text(json.dumps(data))
        with self.assertRaises(organize.OrganizationError):
            self.plan()

    def test_failure_after_install_restores_both_old_artifacts(self):
        plan = self.plan()
        old_manifest = (self.source / organize.MANIFEST_NAME).read_bytes()
        old_artifacts = review._artifact_snapshot(self.source)
        before = self.original_snapshot()
        with patch.object(organize, "_verify_written", side_effect=OSError("fixture failure")):
            with self.assertRaises(OSError):
                review.apply_prepared(plan)
        self.assertEqual(old_manifest, (self.source / organize.MANIFEST_NAME).read_bytes())
        self.assertEqual(old_artifacts, review._artifact_snapshot(self.source))
        self.assertEqual(before, self.original_snapshot())

    def test_no_original_document_bytes_are_read(self):
        original_read = Path.read_bytes
        def guarded(path):
            if path.suffix.lower() == ".pdf":
                raise AssertionError("original bytes were read")
            return original_read(path)
        with patch.object(Path, "read_bytes", guarded):
            review.apply_prepared(self.plan())

    def test_reapplying_same_review_is_refused(self):
        review.apply_prepared(self.plan())
        with self.assertRaises(organize.OrganizationError):
            self.plan()


if __name__ == "__main__":
    unittest.main()
