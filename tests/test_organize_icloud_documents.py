"""Fixtures isoladas: não acessa PDF, DOC2026 ou documentos reais do iCloud."""
import csv
import hashlib
import io
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
from document_theme_classifier import classify_document as actual_classifier


class DocumentOrganizationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="documents-360x-test-")
        self.root = Path(self.temp.name)
        self.source = self.root / "PDF"
        self.source.mkdir()
        self.inventory = self.root / "inventory.json"
        self.texts = self.root / "texts.jsonl"
        self.plan = self.root / "private" / "plan.json"
        self.classification = {"theme": "inbox-revisar", "themeLabel": organize.THEMES["inbox-revisar"],
            "confidence": "baixa", "method": "revisao", "matchedTerms": [], "secondaryThemes": [],
            "needsReview": True, "reason": "Revisão temática necessária."}
        self.classifier = patch.object(organize, "classify_document", return_value=self.classification)
        self.classifier.start()

    def tearDown(self):
        self.classifier.stop()
        self.temp.cleanup()

    def fixture(self, names=None, complete=True, extracted=True):
        documents, records = [], []
        for name in names or ["DPOC.pdf", "curso/pneumonia.docx", "texto.md"]:
            file = self.source / name
            file.parent.mkdir(parents=True, exist_ok=True)
            file.write_bytes(("original-fixture:" + name).encode())
            info = file.stat()
            row = {"relativePath": name, "size": info.st_size, "modifiedNs": info.st_mtime_ns,
                   "dataless": False, "extension": file.suffix.lower()}
            documents.append(row)
            records.append({"schema": "360x-document-text-v1", "id": organize._fingerprint(name, info.st_size, info.st_mtime_ns),
                **row, "ok": True, "title": "TÍTULO PRIVADO SENTINELA", "text": "TEXTO PRIVADO SENTINELA", "method": "fixture", "partial": False})
        payload = {"schema": "360x-private-documents-inventory-v1", "sourceName": self.source.name,
                   "complete": complete, "eligibleExtensions": sorted(organize.SUPPORTED_EXTENSIONS),
                   "documents": documents, "errors": [], "summary": {"documents": len(documents)}}
        self.inventory.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
        if extracted:
            self.texts.write_text("".join(json.dumps(r, ensure_ascii=False) + "\n" for r in records), encoding="utf-8")
        return documents, records

    def snapshot(self, documents):
        return {d["relativePath"]: (hashlib.sha256((self.source / d["relativePath"]).read_bytes()).hexdigest(),
                (self.source / d["relativePath"]).stat().st_mtime_ns) for d in documents}

    def apply(self, text_path=True, **kwargs):
        return organize.run(self.source, self.inventory, self.texts if text_path else None, self.plan, apply=True, **kwargs)

    def test_word_owner_files_are_preserved_but_not_offered_as_readable_documents(self):
        self.fixture(["~$draft.docx", "~$legacy.doc", "~$ordinary.pdf", "ordinary.docx"])
        self.assertTrue(organize._word_owner_file("folder/~$draft.docx"))
        self.assertTrue(organize._word_owner_file("~$legacy.DOC"))
        self.assertFalse(organize._word_owner_file("~$ordinary.pdf"))
        self.assertFalse(organize._word_owner_file("ordinary.docx"))
        self.apply()
        html = (self.source / organize.CATALOG_NAME / "index.html").read_text()
        import re
        data = json.loads(re.search(r'<script id="catalog-data" type="application/json">(.*?)</script>', html, re.S).group(1))
        self.assertEqual(sum(item["auxiliary"] for item in data["items"]), 2)
        links = [p for p in (self.source / organize.CATALOG_NAME).rglob("*") if p.is_symlink()]
        self.assertEqual(len(links), 4)
        self.assertTrue(all(p.exists() for p in links))

    def test_default_only_creates_private_plan_with_no_document_text(self):
        documents, _ = self.fixture()
        before = self.snapshot(documents)
        result = organize.run(self.source, self.inventory, self.texts, self.plan)
        self.assertFalse(result["applied"])
        self.assertEqual(before, self.snapshot(documents))
        self.assertFalse((self.source / organize.MANIFEST_NAME).exists())
        self.assertFalse((self.source / organize.CATALOG_NAME).exists())
        self.assertEqual(stat.S_IMODE(self.plan.stat().st_mode), 0o600)
        self.assertNotIn("PRIVADO SENTINELA", self.plan.read_text())

    def test_apply_preserves_bytes_and_related_assets_and_writes_strict_manifest(self):
        documents, _ = self.fixture()
        asset = self.source / "related.png"
        asset.write_bytes(b"related image unchanged")
        command = self.source / "script.command"
        command.write_bytes(b"related command unchanged")
        before = self.snapshot(documents)
        result = self.apply()
        self.assertEqual((result["documentCount"], result["verifiedLinks"]), (3, 3))
        self.assertEqual(before, self.snapshot(documents))
        self.assertEqual(asset.read_bytes(), b"related image unchanged")
        self.assertEqual(command.read_bytes(), b"related command unchanged")
        manifest = json.loads((self.source / organize.MANIFEST_NAME).read_text())
        self.assertEqual(set(manifest), {"schema", "sourceName", "entries"})
        self.assertEqual(manifest["schema"], "library-local-themes-v1")
        self.assertEqual(manifest["sourceName"], "PDF")
        for entry in manifest["entries"]:
            self.assertEqual(set(entry), set(organize.ENTRY_FIELDS))
        links = [p for p in (self.source / organize.CATALOG_NAME).rglob("*") if p.is_symlink()]
        self.assertEqual(len(links), 3)
        self.assertTrue(all(not os.path.isabs(os.readlink(p)) and p.exists() for p in links))
        for name in ("index.html", "catalogo.csv", "revisao.csv"):
            self.assertNotIn("PRIVADO SENTINELA", (self.source / organize.CATALOG_NAME / name).read_text())

    def test_no_document_bytes_or_asset_stat_during_prepare_and_apply(self):
        self.fixture()
        image = self.source / "asset.png"
        image.write_bytes(b"not a real image")
        original_lstat, original_read = Path.lstat, Path.read_bytes
        def safe_lstat(path, *args, **kwargs):
            if path.suffix.lower() in {".png", ".jpg"}:
                raise AssertionError("Related image stat is forbidden")
            return original_lstat(path, *args, **kwargs)
        def safe_read(path, *args, **kwargs):
            if path.suffix.lower() in organize.SUPPORTED_EXTENSIONS:
                raise AssertionError("Original document bytes must not be read")
            return original_read(path, *args, **kwargs)
        with patch.object(Path, "lstat", safe_lstat), patch.object(Path, "read_bytes", safe_read):
            self.apply()

    def test_partial_inventory_requires_explicit_flag_and_remains_honest(self):
        self.fixture(["one.pdf"], complete=False)
        (self.source / "unindexed.doc").write_bytes(b"unindexed preserved")
        with self.assertRaises(organize.OrganizationError):
            organize.prepare(self.source, self.inventory, self.texts)
        plan = organize.prepare(self.source, self.inventory, self.texts, allow_partial=True)
        self.assertFalse(plan["complete"])
        self.assertEqual(plan["summary"]["unindexedDocuments"], 1)
        result = self.apply(allow_partial=True)
        self.assertFalse(result["complete"])
        self.assertIn("Catálogo parcial", (self.source / organize.CATALOG_NAME / "index.html").read_text())
        self.assertEqual((self.source / "unindexed.doc").read_bytes(), b"unindexed preserved")

    def test_missing_extraction_is_supported_and_all_files_accounted_for(self):
        self.fixture(extracted=False)
        plan = organize.prepare(self.source, self.inventory)
        self.assertEqual(plan["summary"]["extraction"]["notProcessed"], 3)
        self.assertEqual(self.apply(text_path=False)["documentCount"], 3)

    def test_last_extraction_retry_wins(self):
        _, records = self.fixture(["generic.pdf"])
        failed = {**records[0], "ok": False}
        self.texts.write_text(json.dumps(failed) + "\n" + json.dumps(records[0]) + "\n")
        plan = organize.prepare(self.source, self.inventory, self.texts)
        self.assertEqual(plan["summary"]["extraction"]["successful"], 1)
        self.assertEqual(plan["summary"]["extraction"]["failed"], 0)

    def test_scheme_and_literal_posix_names_get_local_links_but_no_web_entry(self):
        documents, _ = self.fixture(["scheme:document.pdf", "literal\\document.docx", "line\nbreak.pdf", "ordinary.pdf"])
        before = self.snapshot(documents)
        result = self.apply()
        self.assertEqual((result["documentCount"], result["manifestEntries"], result["excludedWebPaths"]), (4, 1, 3))
        self.assertEqual(before, self.snapshot(documents))
        entries = json.loads((self.source / organize.MANIFEST_NAME).read_text())["entries"]
        self.assertEqual(entries[0]["path"], "ordinary.pdf")
        links = [p for p in (self.source / organize.CATALOG_NAME).rglob("*") if p.is_symlink()]
        self.assertEqual(len(links), 4)
        self.assertTrue(all(p.name.isascii() and p.exists() for p in links))
        rows = list(csv.DictReader(io.StringIO((self.source / organize.CATALOG_NAME / "catalogo.csv").read_text(encoding="utf-8-sig"))))
        self.assertEqual(sum(r["webEligible"] == "não" for r in rows), 3)
        self.assertTrue(all(r["needsReview"] == "sim" for r in rows))

    def test_traversal_absolute_and_symlinks_are_rejected(self):
        self.fixture(["one.pdf"])
        original = json.loads(self.inventory.read_text())
        for value in ("../one.pdf", "/one.pdf", "a/../one.pdf", "a//one.pdf"):
            payload = json.loads(json.dumps(original))
            payload["documents"][0]["relativePath"] = value
            self.inventory.write_text(json.dumps(payload))
            with self.subTest(value=value), self.assertRaises(organize.OrganizationError):
                organize.prepare(self.source, self.inventory)
        self.inventory.write_text(json.dumps(original))
        (self.source / "one.pdf").unlink()
        target = self.root / "outside.pdf"
        target.write_bytes(b"outside")
        (self.source / "one.pdf").symlink_to(target)
        with self.assertRaises(organize.OrganizationError):
            organize.prepare(self.source, self.inventory)

    def test_nfc_collisions_are_rejected(self):
        self.fixture(["café.pdf"])
        payload = json.loads(self.inventory.read_text())
        payload["documents"].append({**payload["documents"][0], "relativePath": "cafe\u0301.pdf"})
        payload["summary"]["documents"] = 2
        self.inventory.write_text(json.dumps(payload))
        with self.assertRaises(organize.OrganizationError):
            organize.prepare(self.source, self.inventory)

    def test_changed_original_and_extraction_fingerprints_fail_closed(self):
        self.fixture(["one.pdf"])
        (self.source / "one.pdf").write_bytes(b"changed")
        with self.assertRaises(organize.OrganizationError):
            organize.prepare(self.source, self.inventory, self.texts)
        _, records = self.fixture(["one.pdf"])
        records[0]["modifiedNs"] += 1
        self.texts.write_text(json.dumps(records[0]))
        with self.assertRaises(organize.OrganizationError):
            organize.prepare(self.source, self.inventory, self.texts)

    def test_new_document_stops_complete_inventory_but_related_outputs_are_excluded(self):
        self.fixture(["one.pdf"])
        (self.source / "00_ORGANIZACAO_360X").mkdir()
        (self.source / "00_ORGANIZACAO_360X" / "legacy.pdf").write_bytes(b"legacy preserved")
        organize.prepare(self.source, self.inventory)
        (self.source / "new.pdf").write_bytes(b"new")
        with self.assertRaises(organize.OrganizationError):
            organize.prepare(self.source, self.inventory)

    def test_csv_formulas_and_html_script_breakout_are_neutralized(self):
        self.fixture(["=HYPERLINK(1).pdf", "+cmd.docx", "@sum.txt", "-2.md", "evil<script>.pdf", "x & espaços.pdf"])
        self.apply()
        rows = list(csv.DictReader(io.StringIO((self.source / organize.CATALOG_NAME / "catalogo.csv").read_text(encoding="utf-8-sig"))))
        self.assertTrue(all(row["path"].startswith("'") for row in rows[:4]))
        html = (self.source / organize.CATALOG_NAME / "index.html").read_text()
        self.assertNotIn("evil<script>", html)
        self.assertIn("evil\\u003cscript\\u003e", html)
        self.assertIn("textContent", html)
        self.assertNotIn("innerHTML", html)
        self.assertNotIn("<iframe", html)
        self.assertNotIn("<object", html)
        self.assertIn("pageSize=24", html)
        self.assertIn("connect-src 'none'", html)
        self.assertIn("a.download=i.title", html)

    def test_existing_targets_and_plan_are_never_overwritten(self):
        self.fixture()
        for name in (organize.MANIFEST_NAME, organize.CATALOG_NAME):
            target = self.source / name
            for kind in ("file", "directory", "dangling"):
                if kind == "file": target.write_text("human content")
                elif kind == "directory": target.mkdir()
                else: target.symlink_to("nonexistent")
                with self.assertRaises(organize.OrganizationError):
                    organize.prepare(self.source, self.inventory)
                if kind == "directory": target.rmdir()
                else: target.unlink()
        self.plan.parent.mkdir()
        self.plan.write_text("existing private plan")
        with self.assertRaises(organize.OrganizationError):
            organize.run(self.source, self.inventory, None, self.plan)
        self.assertEqual(self.plan.read_text(), "existing private plan")

    def test_private_plan_cannot_be_in_source_or_repo(self):
        self.fixture()
        for target in (self.source / "plan.json", organize.REPO_ROOT / "private-document-plan.json"):
            with self.assertRaises(organize.OrganizationError):
                organize.run(self.source, self.inventory, None, target)
            self.assertFalse(target.exists())

    def test_rollback_preserves_human_files_and_removes_only_owned_outputs(self):
        documents, _ = self.fixture()
        before = self.snapshot(documents)
        marker = self.source / "human.txt"
        marker.write_text("preserved")
        # Atualizar inventário: txt também é documento elegível.
        payload = json.loads(self.inventory.read_text())
        s = marker.stat()
        payload["documents"].append({"relativePath": marker.name, "size": s.st_size, "modifiedNs": s.st_mtime_ns, "extension": ".txt"})
        payload["summary"]["documents"] += 1
        self.inventory.write_text(json.dumps(payload))
        with patch.object(organize, "_verify_written", side_effect=organize.OrganizationError("fixture failure")):
            with self.assertRaises(organize.OrganizationError):
                self.apply()
        self.assertEqual(before, self.snapshot(documents))
        self.assertEqual(marker.read_text(), "preserved")
        self.assertFalse((self.source / organize.MANIFEST_NAME).exists())
        self.assertFalse((self.source / organize.CATALOG_NAME).exists())
        self.assertFalse(any(p.name.startswith(".360x-documents-stage-") for p in self.source.iterdir()))

    def test_concurrent_manifest_is_never_overwritten_or_rolled_back(self):
        self.fixture()
        plan = organize.prepare(self.source, self.inventory, self.texts)
        original_rename = organize._rename_exclusive
        def concurrent(stage, target):
            if target.name == organize.MANIFEST_NAME:
                target.write_text("human concurrent manifest")
            return original_rename(stage, target)
        with patch.object(organize, "_rename_exclusive", side_effect=concurrent):
            with self.assertRaises(OSError):
                organize.apply_prepared(plan)
        self.assertEqual((self.source / organize.MANIFEST_NAME).read_text(), "human concurrent manifest")
        self.assertFalse((self.source / organize.CATALOG_NAME).exists())

    def test_invalid_classifier_theme_cannot_escape_staging(self):
        self.fixture()
        with patch.object(organize, "classify_document", return_value={**self.classification, "theme": "../escape"}):
            with self.assertRaises(organize.OrganizationError):
                organize.prepare(self.source, self.inventory)

    def test_doc2026_source_name_is_preserved(self):
        self.source = self.root / "DOC 2026"
        self.source.mkdir()
        self.fixture(["one.docx"])
        self.apply()
        manifest = json.loads((self.source / organize.MANIFEST_NAME).read_text())
        self.assertEqual(manifest["sourceName"], "DOC 2026")

    def test_existing_file_links_and_pages_bundles_are_preserved_and_excluded(self):
        self.fixture(["one.pdf"])
        outside = self.root / "outside.pdf"
        outside.write_bytes(b"external untouched")
        existing = self.source / "existing.pdf"
        existing.symlink_to(outside)
        bundle = self.source / "existing.pages"
        bundle.mkdir()
        (bundle / "preview.pdf").write_bytes(b"bundle asset untouched")
        self.apply()
        self.assertTrue(existing.is_symlink())
        self.assertEqual(outside.read_bytes(), b"external untouched")
        self.assertEqual((bundle / "preview.pdf").read_bytes(), b"bundle asset untouched")

    def test_colons_and_domains_inside_relative_paths_remain_web_eligible(self):
        self.assertTrue(organize._web_eligible("curso/07:06.pdf"))
        self.assertTrue(organize._web_eligible("my.document.example.com.pdf"))
        self.assertFalse(organize._web_eligible("scheme:document.pdf"))

    def test_real_classifier_contract_and_private_text_redaction_integrate(self):
        self.fixture(["GOLD DPOC.pdf", "pneumonia comunitaria.docx"])
        with patch.object(organize, "classify_document", new=actual_classifier):
            self.apply()
        manifest_text = (self.source / organize.MANIFEST_NAME).read_text()
        manifest = json.loads(manifest_text)
        self.assertTrue(any(e["theme"] != "inbox-revisar" for e in manifest["entries"]))
        self.assertTrue(all(e["theme"] in organize.THEMES for e in manifest["entries"]))
        self.assertNotIn("PRIVADO SENTINELA", manifest_text)


if __name__ == "__main__":
    unittest.main()
