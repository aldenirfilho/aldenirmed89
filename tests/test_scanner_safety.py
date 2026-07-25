#!/usr/bin/env python3
"""Regressões P0: check sem escrita e preservação de assets."""

from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class LibraryScannerSafetyTests(unittest.TestCase):
    def configured_scanner(self, temporary: str):
        scanner = load_module(
            "library_scanner_safety",
            ROOT / "02_Biblioteca_IA_Engine/scan_biblioteca.py",
        )
        library = Path(temporary) / "02_Biblioteca_IA_Engine"
        data = library / "data"
        acervo = library / "acervo/uti-geral"
        acervo.mkdir(parents=True)
        data.mkdir(parents=True)
        (acervo / "resumo.md").write_text("conteudo autoral", encoding="utf-8")

        scanner.ROOT = library
        scanner.DATA_DIR = data
        scanner.PUBLICATION_BASELINE = data / "biblioteca_publication_baseline.json"
        scanner.SCAN_DIRS = [library / "acervo"]

        files = scanner.collect_files()
        assets = scanner.collect_public_assets()
        scanner.PUBLICATION_BASELINE.write_text(
            json.dumps(
                {
                    "corpusFingerprint": scanner.corpus_fingerprint(assets),
                    "publicAssetCount": len(assets),
                    "documentCount": len(files),
                    "approvedChanges": [],
                }
            ),
            encoding="utf-8",
        )
        return scanner, data

    def test_check_is_strict_and_does_not_rewrite_manifests(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            scanner, data = self.configured_scanner(temporary)
            self.assertEqual(scanner.main([]), 0)
            generated = sorted(path for path in data.glob("*.json") if path != scanner.PUBLICATION_BASELINE)
            before = {path: (path.read_bytes(), path.stat().st_mtime_ns) for path in generated}

            self.assertEqual(scanner.main(["--check"]), 0)
            after = {path: (path.read_bytes(), path.stat().st_mtime_ns) for path in generated}
            self.assertEqual(after, before)

            with self.assertRaises(SystemExit) as raised:
                scanner.parse_args(["--nao-existe"])
            self.assertEqual(raised.exception.code, 2)

    def test_divergent_manifest_fails_check_without_rewriting_it(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            scanner, data = self.configured_scanner(temporary)
            self.assertEqual(scanner.main([]), 0)
            catalog = data / "biblioteca_catalogo.json"
            payload = json.loads(catalog.read_text(encoding="utf-8"))
            payload["totalFiles"] = 999
            catalog.write_text(json.dumps(payload), encoding="utf-8")
            corrupted = catalog.read_bytes()

            self.assertEqual(scanner.main(["--check"]), 1)
            self.assertEqual(catalog.read_bytes(), corrupted)


class CardFeedScannerSafetyTests(unittest.TestCase):
    def configured_scanner(self, temporary: str):
        scanner = load_module(
            "card_feed_scanner_safety",
            ROOT / "scripts_admin/scan_card_feed.py",
        )
        base = Path(temporary)
        public_dir = base / "public/recovered/uti-geral"
        public_dir.mkdir(parents=True)
        scanner.PUBLIC_DIR = base / "public"
        scanner.OUTPUT = base / "data/public.json"
        canonical = public_dir / "card-a1b2c3.webp"
        conflict = public_dir / "card-a1b2c3 2.webp"
        canonical.write_bytes(b"same-image")
        conflict.write_bytes(b"same-image")
        return scanner, canonical, conflict

    def test_identical_conflict_is_preserved_excluded_and_check_does_not_write(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            scanner, canonical, conflict = self.configured_scanner(temporary)
            self.assertEqual(scanner.main([]), 0)
            payload = json.loads(scanner.OUTPUT.read_text(encoding="utf-8"))
            self.assertEqual(payload["files"], ["recovered/uti-geral/card-a1b2c3.webp"])
            self.assertEqual(payload["totalBytes"], canonical.stat().st_size)
            self.assertTrue(conflict.is_file())

            before = (scanner.OUTPUT.read_bytes(), scanner.OUTPUT.stat().st_mtime_ns)
            self.assertEqual(scanner.main(["--check"]), 0)
            self.assertEqual(
                (scanner.OUTPUT.read_bytes(), scanner.OUTPUT.stat().st_mtime_ns),
                before,
            )

    def test_divergent_or_orphan_conflict_fails_without_touching_output(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            scanner, canonical, conflict = self.configured_scanner(temporary)
            self.assertEqual(scanner.main([]), 0)
            before = scanner.OUTPUT.read_bytes()

            conflict.write_bytes(b"different-image")
            self.assertEqual(scanner.main([]), 1)
            self.assertEqual(scanner.OUTPUT.read_bytes(), before)
            self.assertTrue(conflict.is_file())

            canonical.unlink()
            self.assertEqual(scanner.main(["--check"]), 1)
            self.assertEqual(scanner.OUTPUT.read_bytes(), before)
            self.assertTrue(conflict.is_file())


class HistoricalRecoverySafetyTests(unittest.TestCase):
    def test_unexpected_recovery_output_fails_closed_and_is_preserved(self) -> None:
        recovery = load_module(
            "historical_recovery_safety",
            ROOT / "scripts_admin/prepare_card_feed_recovery.py",
        )
        with tempfile.TemporaryDirectory() as temporary:
            recovered = Path(temporary) / "recovered"
            recovered.mkdir()
            canonical = recovered / "card.webp"
            conflict = recovered / "card 2.webp"
            canonical.write_bytes(b"canonical")
            conflict.write_bytes(b"canonical")

            with self.assertRaisesRegex(ValueError, "nenhuma exclusão"):
                recovery.validate_recovered_root(recovered, {canonical})
            self.assertEqual(canonical.read_bytes(), b"canonical")
            self.assertEqual(conflict.read_bytes(), b"canonical")

        source = (ROOT / "scripts_admin/prepare_card_feed_recovery.py").read_text(
            encoding="utf-8"
        )
        self.assertNotIn(".unlink(", source)
        self.assertNotIn(".rmdir(", source)


class GenericContentScannerSafetyTests(unittest.TestCase):
    def configured_scanner(self, temporary: str):
        scanner = load_module(
            "generic_content_scanner_safety",
            ROOT / "scripts_admin/scan_content_module.py",
        )
        base = Path(temporary)
        module = base / "Hub_Publico"
        (module / "public").mkdir(parents=True)
        (module / "links").mkdir()
        (module / "public/resumo.md").write_text("conteúdo", encoding="utf-8")
        (module / "module.json").write_text(
            json.dumps({"title": "Hub Público"}), encoding="utf-8"
        )
        (module / "links/links.json").write_text("[]", encoding="utf-8")
        scanner.ROOT = base
        scanner.ALLOWED_HUBS = {"Hub_Publico"}
        return scanner, module

    def test_rejects_unknown_target_and_supports_check_without_writing(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            scanner, module = self.configured_scanner(temporary)
            self.assertEqual(scanner.main(["../fora"]), 2)
            self.assertFalse((Path(temporary).parent / "fora/data/catalogo.json").exists())

            self.assertEqual(scanner.main(["Hub_Publico"]), 0)
            catalog = module / "data/catalogo.json"
            before = (catalog.read_bytes(), catalog.stat().st_mtime_ns)
            self.assertEqual(scanner.main(["Hub_Publico", "--check"]), 0)
            self.assertEqual((catalog.read_bytes(), catalog.stat().st_mtime_ns), before)


if __name__ == "__main__":
    unittest.main()
