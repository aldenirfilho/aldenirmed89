"""Escopo do validador: fonte ativa obrigatória e espelho histórico opt-in."""

from __future__ import annotations

import contextlib
import importlib.util
import io
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]


class StaticManifestScopeTests(unittest.TestCase):
    def setUp(self):
        spec = importlib.util.spec_from_file_location(
            "static_manifest_scope_validator",
            ROOT / "scripts_admin/check_static_manifests.py",
        )
        self.validator = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.validator)
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.root_patch = patch.object(self.validator, "PROJECT_ROOT", str(self.root))
        self.root_patch.start()
        self.addCleanup(self.root_patch.stop)
        self.active = {
            "version": "current",
            "canonicalRoutes": {"home": "index.html"},
            "modules": [{"id": "home", "path": "index.html", "label": "Home"}],
            "legacyRoutes": [{"from": "old.html", "to": "index.html"}],
            "dataSources": {"topics": "data/topics.json"},
        }
        self.aliases = {"aliases": [{"from": "old.html", "to": "index.html", "status": "redirect"}]}
        self.write_json("data/site_manifest.json", self.active)
        self.write_json("data/route_aliases.json", self.aliases)
        self.write_json("data/topics.json", {})
        self.write_json(
            "06_Infra_Site_E_Assets/data/home-manifest.json",
            {"mainLinks": [{"title": "Home", "href": "index.html"}]},
        )
        (self.root / "index.html").write_text("<!doctype html><title>Home</title>")
        (self.root / "old.html").write_text("<!doctype html><title>Redirect</title>")

    def write_json(self, relative, payload):
        path = self.root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(payload), encoding="utf-8")

    def run_validator(self, *arguments):
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            result = self.validator.main(list(arguments))
        return result, output.getvalue()

    def test_default_accepts_active_manifests_without_legacy_mirror(self):
        result, output = self.run_validator()
        self.assertEqual(result, 0, output)
        self.assertNotIn("public_site/data/", output)

    def test_default_ignores_divergent_or_invalid_historical_mirror(self):
        self.write_json(
            "public_site/data/site_manifest.json",
            {"version": "obsolete", "canonicalRoutes": {"home": "retired.html"}},
        )
        self.write_json("public_site/data/route_aliases.json", self.aliases)
        result, output = self.run_validator()
        self.assertEqual(result, 0, output)

        # An invalid archive must also remain outside the default validation scope.
        mirror = self.root / "public_site/data/site_manifest.json"
        mirror.write_text("{invalid", encoding="utf-8")
        result, output = self.run_validator()
        self.assertEqual(result, 0, output)
        self.assertNotIn("public_site/data/", output)

    def test_missing_active_route_still_blocks_by_default(self):
        self.active["canonicalRoutes"]["new-module"] = "missing-module/index.html"
        self.write_json("data/site_manifest.json", self.active)
        result, output = self.run_validator()
        self.assertEqual(result, 1)
        self.assertIn("new-module: missing-module/index.html → NÃO EXISTE", output)

    def test_missing_active_manifest_still_blocks_by_default(self):
        (self.root / "data/route_aliases.json").unlink()
        result, output = self.run_validator()
        self.assertEqual(result, 1)
        self.assertIn("Arquivo não encontrado: data/route_aliases.json", output)

    def test_explicit_legacy_audit_detects_missing_mirror(self):
        result, output = self.run_validator("--include-legacy-mirror")
        self.assertEqual(result, 1)
        self.assertIn("Arquivo não encontrado: public_site/data/site_manifest.json", output)

    def test_explicit_legacy_audit_detects_drift_and_accepts_matching_archive(self):
        self.write_json(
            "public_site/data/site_manifest.json",
            {"version": "obsolete", "canonicalRoutes": {"home": "retired.html"}},
        )
        self.write_json("public_site/data/route_aliases.json", self.aliases)
        result, output = self.run_validator("--include-legacy-mirror")
        self.assertEqual(result, 1)
        self.assertIn("site_manifest versão diverge", output)
        self.assertIn("canonicalRoutes DIVERGEM", output)

        self.write_json("public_site/data/site_manifest.json", self.active)
        result, output = self.run_validator("--include-legacy-mirror")
        self.assertEqual(result, 0, output)
        self.assertIn("canonicalRoutes idênticas", output)

    def test_public_builder_preserves_archive_and_copies_only_active_sources(self):
        spec = importlib.util.spec_from_file_location(
            "static_manifest_scope_public_builder",
            ROOT / "scripts_admin/build_public_site.py",
        )
        builder = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(builder)
        entries = (*builder.REQUIRED, *builder.OPTIONAL)
        self.assertNotIn("public_site", entries)
        archived = self.root / "public_site/index.html"
        archived.parent.mkdir()
        archived.write_text("<!doctype html><title>Historical archive</title>")
        output = self.root / "site"
        for relative in entries:
            if (self.root / relative).exists():
                builder.copy_entry(self.root, output, relative, set(), set())
        self.assertTrue((output / "index.html").is_file())
        self.assertTrue((output / "data/site_manifest.json").is_file())
        self.assertFalse((output / "public_site").exists())
        self.assertTrue(archived.is_file(), "A auditoria/build não remove o arquivo histórico")


if __name__ == "__main__":
    unittest.main()
