#!/usr/bin/env python3
"""Contratos da expansão acessível, plugável e instalável."""

from __future__ import annotations

import hashlib
import importlib.util
import json
import struct
import unicodedata
import unittest
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def load_json(relative: str) -> dict:
    return json.loads((ROOT / relative).read_text(encoding="utf-8"))


def png_size(relative: str) -> tuple[int, int]:
    payload = (ROOT / relative).read_bytes()
    if payload[:8] != b"\x89PNG\r\n\x1a\n" or payload[12:16] != b"IHDR":
        raise AssertionError(f"PNG inválido: {relative}")
    return struct.unpack(">II", payload[16:24])


def load_builder():
    path = ROOT / "scripts_admin/build_public_site.py"
    spec = importlib.util.spec_from_file_location("build_public_site_expansion", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("Não foi possível carregar o builder público.")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class AccessiblePwaTests(unittest.TestCase):
    def test_root_manifest_icons_and_service_worker_are_integrated(self) -> None:
        manifest = load_json("manifest.webmanifest")
        home = (ROOT / "index.html").read_text(encoding="utf-8")
        worker = (ROOT / "sw.js").read_text(encoding="utf-8")

        self.assertEqual(manifest["start_url"], "./")
        self.assertEqual(manifest["scope"], "./")
        self.assertIn('rel="manifest" href="./manifest.webmanifest"', home)
        self.assertIn('rel="apple-touch-icon"', home)
        self.assertIn("navigator.serviceWorker.register('./sw.js')", home)
        self.assertIn('const CACHE_PREFIX = "antigravity-root-"', worker)
        self.assertIn("const SHELL_ASSETS", worker)
        self.assertIn("Promise.allSettled", worker)

        self.assertEqual(png_size("assets/icons/antigravity-consultas-192.png"), (192, 192))
        self.assertEqual(png_size("assets/icons/antigravity-consultas-512.png"), (512, 512))
        self.assertEqual(png_size("assets/icons/apple-touch-icon.png"), (180, 180))

    def test_home_accessibility_and_untrusted_content_contracts(self) -> None:
        home = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn('class="skip-link"', home)
        self.assertIn('id="a11yPanel"', home)
        self.assertIn('data-a11y="contrast"', home)
        self.assertIn("@media(prefers-reduced-motion:reduce)", home)
        self.assertIn('role="dialog" aria-modal="true"', home)
        self.assertIn("let h = escHtml(md)", home)
        self.assertIn("${escHtml(t)}</span>", home)
        self.assertIn("${escH(stripTags(v))}</span>", home)
        self.assertIn('<a class="dsf-card reveal"', home)
        self.assertNotIn('<div class="dsf-card reveal"', home)

    def test_public_builder_copies_installation_assets_and_checks_review_gate(self) -> None:
        builder = load_builder()
        for relative in ("sw.js", "downloads", "docs_usuario"):
            self.assertIn(relative, builder.OPTIONAL)
        decomposed = unicodedata.normalize("NFD", "avaliação-clínica.pdf")
        self.assertEqual(
            builder.canonical_relative(decomposed),
            "avaliação-clínica.pdf",
        )
        builder.validate_clinical_publication(ROOT)

        for module in ("Hematologia_Critica", "Reumatologia_Critica"):
            manifest = load_json(f"01_Modulos_Clinicos/{module}/module.manifest.json")
            self.assertEqual(manifest["status"], "em-revisao-medica")
            self.assertEqual(manifest["publication"]["mode"], "public-preview")
            self.assertTrue(manifest["publication"]["clinicalReviewOngoing"])


class OperationalPackageTests(unittest.TestCase):
    def test_dock_package_is_complete_and_matches_checksum(self) -> None:
        archive = ROOT / "downloads/Antigravity-Consultas-macOS.zip"
        checksum_line = (ROOT / "downloads/SHA256SUMS.txt").read_text(
            encoding="utf-8"
        ).strip()
        expected, filename = checksum_line.split(maxsplit=1)
        self.assertEqual(filename, archive.name)
        self.assertEqual(hashlib.sha256(archive.read_bytes()).hexdigest(), expected)

        with zipfile.ZipFile(archive) as package:
            names = package.namelist()
        self.assertTrue(any(name.endswith("/Contents/Info.plist") for name in names))
        self.assertTrue(any(name.endswith("/Contents/Resources/AntigravityConsultas.icns") for name in names))
        self.assertTrue(any(name.endswith("/Contents/MacOS/AntigravityConsultas") for name in names))

    def test_guides_cover_feed_library_apps_privacy_and_deploy(self) -> None:
        operation = (ROOT / "docs_usuario/OPERACAO_CONTINUA.md").read_text(
            encoding="utf-8"
        )
        dock = (ROOT / "docs_usuario/ACESSO_DOCK_MAC.md").read_text(encoding="utf-8")
        for expected in (
            "05_Midia_E_Feed/assets/cards/public",
            "update_library_publication_baseline.py --approve",
            "scan_biblioteca.py",
            "module.manifest.json",
            "publication_guard.py",
            "zero dados identificáveis",
        ):
            self.assertIn(expected, operation)
        self.assertIn("Safari", dock)
        self.assertIn("Dock", dock)
        self.assertIn("Gatekeeper", dock)

    def test_corrected_canonical_routes_exist(self) -> None:
        connections = load_json("data/connections.json")
        by_id = {node["id"]: node for node in connections["nodes"]}
        expected = {
            "lupus-uti": "01_Modulos_Clinicos/Reumatologia_Critica/index.html",
            "UPDOWN_001_LES_Manifestacoes_Diagnostico":
                "01_UpDown_Hub/content/reumatologia/les-manifestacoes/reader/index.html",
            "updown-002-les-manejo-prognostico":
                "01_UpDown_Hub/content/reumatologia/les-manejo/index.html",
        }
        for node_id, route in expected.items():
            self.assertEqual(by_id[node_id]["url"], route)
            self.assertTrue((ROOT / route).is_file(), route)

        apps = (ROOT / "03_Calculadoras_E_Apps/index.html").read_text(encoding="utf-8")
        self.assertIn('<a href="../questoes/index.html">🏆 Banco TEMI', apps)


if __name__ == "__main__":
    unittest.main()
