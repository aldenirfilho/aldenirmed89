"""Fixtures only: never access the user's iCloud image collection."""

import csv
import hashlib
import io
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts_admin"))
import organize_icloud_images as organize


class OrganizationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.source = self.root / "IMAGENS"
        self.source.mkdir()
        self.inventory = self.root / "inventory.json"
        self.ocr = self.root / "ocr.jsonl"
        self.plan = self.root / "private" / "plan.json"

    def tearDown(self):
        self.temp.cleanup()

    def fixture(self, names=None, failures=()):
        names = names or ["01-dpoc.png", "IMAGENS TDAH/gerada.png", "IMAGENS PDD/002.png", "histórico/antiga.jpg", "generica.png"]
        images = []
        records = []
        for name in names:
            path = self.source / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(("fixture-original:" + name).encode())
            info = path.stat()
            images.append({"relativePath": name, "size": info.st_size, "modifiedNs": info.st_mtime_ns})
            records.append({"schema": "icloud-image-ocr-v1", "id": organize._fingerprint(name, info.st_size, info.st_mtime_ns),
                            "relativePath": name, "size": info.st_size, "modifiedNs": info.st_mtime_ns,
                            "ok": name not in failures, "lines": [] if name in failures else [
                                {"text": "Pneumonia", "confidence": 0.98, "x": 0.1, "y": 0.85, "width": 0.8, "height": 0.1}
                            ] if name == "generica.png" else []})
        self.inventory.write_text(json.dumps({"schema": "cardfeed-icloud-private-inventory-v1", "sourceName": "IMAGENS",
            "truncated": False, "errors": [], "summary": {"images": len(images), "unreadable": 0},
            "eligibleExtensions": [".png", ".jpg"], "images": images}), encoding="utf-8")
        self.ocr.write_text("".join(json.dumps(record, ensure_ascii=False) + "\n" for record in records), encoding="utf-8")
        return images, records

    def original_snapshot(self, images):
        return {item["relativePath"]: (hashlib.sha256((self.source / item["relativePath"]).read_bytes()).hexdigest(),
                (self.source / item["relativePath"]).stat().st_mtime_ns) for item in images}

    def apply(self):
        return organize.run(self.source, self.inventory, self.ocr, self.plan, apply=True)

    def test_default_only_writes_private_plan(self):
        images, _ = self.fixture()
        before = self.original_snapshot(images)
        result = organize.run(self.source, self.inventory, self.ocr, self.plan)
        self.assertFalse(result["applied"])
        self.assertTrue(self.plan.is_file())
        self.assertFalse((self.source / organize.MANIFEST_NAME).exists())
        self.assertFalse((self.source / organize.CATALOG_NAME).exists())
        self.assertEqual(before, self.original_snapshot(images))
        document = json.loads(self.plan.read_text())
        self.assertEqual(document["imageCount"], len(images))
        self.assertNotIn("Pneumonia", self.plan.read_text())

    def test_apply_preserves_originals_symlinks_and_history(self):
        images, _ = self.fixture()
        outside = self.root / "outside.png"
        outside.write_bytes(b"outside unchanged")
        (self.source / "external.png").symlink_to(outside)
        (self.source / "historico-link").symlink_to(self.source / "histórico", target_is_directory=True)
        before = self.original_snapshot(images)
        result = self.apply()
        self.assertTrue(result["applied"])
        self.assertEqual(result["verifiedLinks"], len(images))
        self.assertEqual(before, self.original_snapshot(images))
        self.assertTrue((self.source / "external.png").is_symlink())
        self.assertEqual(outside.read_bytes(), b"outside unchanged")
        self.assertTrue((self.source / "historico-link").is_symlink())
        manifest = json.loads((self.source / organize.MANIFEST_NAME).read_text())
        self.assertEqual(manifest["schema"], "cardfeed-icloud-themes-v1")
        self.assertEqual(manifest["sourceName"], "IMAGENS")
        self.assertEqual(len(manifest["entries"]), len(images))
        for entry in manifest["entries"]:
            self.assertEqual(set(entry), set(organize.ENTRY_FIELDS))
            original = self.source / entry["path"]
            self.assertEqual(entry["modifiedMs"], original.stat().st_mtime_ns // 1_000_000)
        links = [p for p in (self.source / organize.CATALOG_NAME).rglob("*") if p.is_symlink()]
        self.assertEqual(len(links), len(images))
        self.assertTrue(all(not os.path.isabs(os.readlink(p)) and p.exists() for p in links))
        self.assertFalse(any(p.name.startswith(".360x-") for p in self.source.iterdir()))

    def test_failures_and_missing_ocr_still_account_for_every_image(self):
        images, records = self.fixture(failures=("generica.png",))
        self.ocr.write_text("".join(json.dumps(r) + "\n" for index, r in enumerate(records) if index != 2))
        plan = organize.prepare(self.source, self.inventory, self.ocr)
        self.assertEqual(len(plan["manifest"]["entries"]), len(images))
        self.assertEqual(plan["summary"]["ocr"]["notProcessed"], 1)
        self.assertEqual(plan["summary"]["ocr"]["failed"], 1)
        self.assertEqual(plan["manifest"]["entries"][-1]["theme"], "a-classificar")

    def test_last_ocr_retry_wins_without_echoing_private_text(self):
        _, records = self.fixture(["generica.png"], failures=("generica.png",))
        success = {**records[0], "ok": True, "lines": [{"text": "Pneumonia do identificador PRIVADO-XYZ", "confidence": 0.99, "y": 0.9}]}
        with self.ocr.open("a") as stream:
            stream.write(json.dumps(success) + "\n")
        self.apply()
        self.assertNotIn("PRIVADO-XYZ", (self.source / organize.MANIFEST_NAME).read_text())
        self.assertNotIn("PRIVADO-XYZ", (self.source / organize.CATALOG_NAME / "index.html").read_text())
        self.assertNotIn("PRIVADO-XYZ", self.plan.read_text())

    def test_refuses_overwrite_of_directory_file_or_dangling_link(self):
        self.fixture()
        for name in (organize.MANIFEST_NAME, organize.CATALOG_NAME):
            target = self.source / name
            for kind in ("file", "dir", "symlink"):
                if kind == "file": target.write_text("human-original")
                elif kind == "dir": target.mkdir()
                else: target.symlink_to("nonexistent")
                with self.assertRaises(organize.OrganizationError):
                    organize.prepare(self.source, self.inventory, self.ocr)
                self.assertTrue(target.exists() or target.is_symlink())
                if kind == "dir": target.rmdir()
                else: target.unlink()

    def test_changed_original_fingerprint_is_rejected(self):
        self.fixture()
        (self.source / "01-dpoc.png").write_bytes(b"changed")
        with self.assertRaises(organize.OrganizationError):
            organize.prepare(self.source, self.inventory, self.ocr)

    def test_ocr_fingerprint_mismatch_is_rejected(self):
        _, records = self.fixture()
        records[0]["size"] += 1
        self.ocr.write_text("".join(json.dumps(r) + "\n" for r in records))
        with self.assertRaises(organize.OrganizationError):
            organize.prepare(self.source, self.inventory, self.ocr)

    def test_uninventoried_image_stops_partial_organization(self):
        self.fixture()
        (self.source / "new.png").write_bytes(b"new")
        with self.assertRaises(organize.OrganizationError):
            organize.prepare(self.source, self.inventory, self.ocr)

    def test_inventory_path_traversal_and_symlink_target_are_rejected(self):
        self.fixture(["ok.png"])
        document = json.loads(self.inventory.read_text())
        document["images"][0]["relativePath"] = "../outside.png"
        self.inventory.write_text(json.dumps(document))
        with self.assertRaises(organize.OrganizationError):
            organize.prepare(self.source, self.inventory, self.ocr)
        self.fixture(["ok.png"])
        (self.source / "ok.png").unlink()
        outside = self.root / "outside.png"
        outside.write_bytes(b"private")
        (self.source / "ok.png").symlink_to(outside)
        with self.assertRaises(organize.OrganizationError):
            organize.prepare(self.source, self.inventory, self.ocr)

    def test_csv_escapes_formula_names(self):
        self.fixture(["=HYPERLINK(1).png", "+cmd.png", "@sum.png", "-2.png"])
        self.apply()
        text = (self.source / organize.CATALOG_NAME / "catalogo.csv").read_text(encoding="utf-8-sig")
        rows = list(csv.DictReader(io.StringIO(text)))
        self.assertEqual(len(rows), 4)
        self.assertTrue(all(row["path"].startswith("'") for row in rows))

    def test_catalog_json_cannot_close_script_and_links_are_encoded(self):
        self.fixture(['evil<script>alert(1).png', 'x & espaços.png'])
        self.apply()
        html = (self.source / organize.CATALOG_NAME / "index.html").read_text()
        self.assertNotIn('evil<script>', html)
        self.assertIn('evil\\u003cscript\\u003e', html)
        self.assertIn("textContent", html)
        self.assertNotIn("innerHTML", html)
        self.assertIn("image.loading='lazy'", html)
        self.assertIn("pageSize=24", html)
        self.assertIn("connect-src 'none'", html)
        self.assertEqual(organize._safe_json('</script><script>'), '"\\u003c/script\\u003e\\u003cscript\\u003e"')

    def test_bounded_collision_safe_names(self):
        self.fixture(["a" * 179 + "-um.png", "a" * 179 + "-dois.png"])
        plan = organize.prepare(self.source, self.inventory, self.ocr)
        names = [Path(link["link"]).name for link in plan["links"]]
        self.assertEqual(len(set(names)), 2)
        self.assertTrue(all(len(name) < 110 for name in names))

    def test_private_plan_must_stay_outside_source_and_repo(self):
        self.fixture()
        for target in (self.source / "plan.json", organize.REPO_ROOT / "private-test-plan.json"):
            with self.assertRaises(organize.OrganizationError):
                organize.run(self.source, self.inventory, self.ocr, target)
            self.assertFalse(target.exists())

    def test_rollback_only_removes_new_outputs(self):
        images, _ = self.fixture()
        before = self.original_snapshot(images)
        marker = self.source / "human.txt"
        marker.write_text("keep me")
        with patch.object(organize, "_verify_written", side_effect=organize.OrganizationError("fixture verification failure")):
            with self.assertRaises(organize.OrganizationError):
                self.apply()
        self.assertEqual(before, self.original_snapshot(images))
        self.assertEqual(marker.read_text(), "keep me")
        self.assertFalse((self.source / organize.MANIFEST_NAME).exists())
        self.assertFalse((self.source / organize.CATALOG_NAME).exists())
        self.assertFalse(any(p.name.startswith(".360x-") for p in self.source.iterdir()))

    def test_source_change_after_plan_before_commit_rolls_back_stage(self):
        self.fixture()
        plan = organize.prepare(self.source, self.inventory, self.ocr)
        (self.source / "generica.png").write_bytes(b"modified after plan")
        with self.assertRaises(organize.OrganizationError):
            organize.apply_prepared(plan)
        self.assertFalse((self.source / organize.MANIFEST_NAME).exists())
        self.assertFalse((self.source / organize.CATALOG_NAME).exists())

    def test_new_source_image_after_plan_is_rejected(self):
        self.fixture()
        plan = organize.prepare(self.source, self.inventory, self.ocr)
        (self.source / "new.png").write_bytes(b"new image")
        with self.assertRaises(organize.OrganizationError):
            organize.apply_prepared(plan)
        self.assertFalse((self.source / organize.CATALOG_NAME).exists())

    def test_concurrent_destination_is_not_overwritten_or_rolled_back(self):
        self.fixture()
        plan = organize.prepare(self.source, self.inventory, self.ocr)
        original_rename = organize._rename_exclusive
        def create_human_destination(stage, target):
            if target.name == organize.MANIFEST_NAME:
                target.write_text("human concurrent file")
            return original_rename(stage, target)
        with patch.object(organize, "_rename_exclusive", side_effect=create_human_destination):
            with self.assertRaises(OSError):
                organize.apply_prepared(plan)
        self.assertEqual((self.source / organize.MANIFEST_NAME).read_text(), "human concurrent file")
        self.assertFalse((self.source / organize.CATALOG_NAME).exists())

    def test_colon_directory_and_nfc_paths_are_supported(self):
        self.fixture(["07:06/atenção clínica.png"])
        self.apply()
        entry = json.loads((self.source / organize.MANIFEST_NAME).read_text())["entries"][0]
        self.assertEqual(entry["path"], "07:06/atenção clínica.png")

    def test_local_catalog_has_all_images_and_review_subset(self):
        images, _ = self.fixture()
        self.apply()
        directory = self.source / organize.CATALOG_NAME
        rows = list(csv.DictReader(io.StringIO((directory / "catalogo.csv").read_text(encoding="utf-8-sig"))))
        review = list(csv.DictReader(io.StringIO((directory / "revisao.csv").read_text(encoding="utf-8-sig"))))
        self.assertEqual(len(rows), len(images))
        self.assertEqual(len(review), sum(r["needsReview"] == "sim" for r in rows))


if __name__ == "__main__":
    unittest.main()
