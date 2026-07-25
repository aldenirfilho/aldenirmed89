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


def load_download_checksums() -> dict[str, str]:
    result: dict[str, str] = {}
    manifest = ROOT / "downloads/SHA256SUMS.txt"
    for line_number, raw_line in enumerate(
        manifest.read_text(encoding="utf-8").splitlines(), start=1
    ):
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split(maxsplit=1)
        if len(parts) != 2 or len(parts[0]) != 64:
            raise AssertionError(
                f"Linha inválida em SHA256SUMS.txt:{line_number}: {raw_line!r}"
            )
        checksum, filename = parts
        if filename in result:
            raise AssertionError(f"Checksum duplicado para {filename}")
        result[filename] = checksum
    return result


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
        for size in (120, 152, 167, 180, 1024):
            self.assertEqual(
                png_size(f"assets/icons/ios/apple-touch-icon-{size}.png"),
                (size, size),
            )
        self.assertIn("assets/icons/ios/apple-touch-icon-167.png", home)
        self.assertIn("assets/icons/ios/apple-touch-icon-152.png", home)
        self.assertIn("assets/icons/ios/apple-touch-icon-120.png", home)
        self.assertIn('name="apple-mobile-web-app-capable" content="yes"', home)
        self.assertIn('name="apple-mobile-web-app-title" content="Antigravity"', home)
        self.assertIn('const CACHE_NAME = `${CACHE_PREFIX}v3`', worker)
        self.assertIn('new URL("./downloads/", self.registration.scope)', worker)
        self.assertIn('cache: "no-store"', worker)
        self.assertIn("networkOnlyDownload(request)", worker)
        self.assertIn('id="installPwaBtn"', home)
        self.assertIn("beforeinstallprompt", home)
        self.assertIn("Antigravity-Consultas-Windows.zip", home)
        self.assertIn("Antigravity-Consultas-iPhone-Icones.zip", home)

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
        for relative in ("sw.js", "docs_usuario"):
            self.assertIn(relative, builder.OPTIONAL)
        for relative in (
            "downloads/Antigravity-Consultas-macOS.zip",
            "downloads/Antigravity-Consultas-Windows.zip",
            "downloads/Antigravity-Consultas-iPhone-Icones.zip",
            "downloads/SHA256SUMS.txt",
        ):
            self.assertIn(relative, builder.PUBLIC_DOWNLOADS)
        decomposed = unicodedata.normalize("NFD", "avaliação-clínica.pdf")
        self.assertEqual(
            builder.canonical_relative(decomposed),
            "avaliação-clínica.pdf",
        )
        builder.validate_clinical_publication(ROOT)
        builder.validate_public_downloads(ROOT)

        for module in ("Hematologia_Critica", "Reumatologia_Critica"):
            manifest = load_json(f"01_Modulos_Clinicos/{module}/module.manifest.json")
            self.assertEqual(manifest["status"], "em-revisao-medica")
            self.assertEqual(manifest["publication"]["mode"], "public-preview")
            self.assertTrue(manifest["publication"]["clinicalReviewOngoing"])


class OperationalPackageTests(unittest.TestCase):
    def test_dock_package_is_complete_and_matches_checksum(self) -> None:
        archive = ROOT / "downloads/Antigravity-Consultas-macOS.zip"
        expected = load_download_checksums()[archive.name]
        self.assertEqual(hashlib.sha256(archive.read_bytes()).hexdigest(), expected)

        with zipfile.ZipFile(archive) as package:
            names = package.namelist()
        self.assertTrue(any(name.endswith("/Contents/Info.plist") for name in names))
        self.assertTrue(any(name.endswith("/Contents/Resources/AntigravityConsultas.icns") for name in names))
        self.assertTrue(any(name.endswith("/Contents/MacOS/AntigravityConsultas") for name in names))

    def test_iphone_icon_package_is_complete_and_matches_checksum(self) -> None:
        archive = ROOT / "downloads/Antigravity-Consultas-iPhone-Icones.zip"
        expected = load_download_checksums()[archive.name]
        self.assertEqual(hashlib.sha256(archive.read_bytes()).hexdigest(), expected)

        with zipfile.ZipFile(archive) as package:
            names = set(package.namelist())
        self.assertEqual(
            names,
            {
                "README.md",
                "apple-touch-icon-120.png",
                "apple-touch-icon-152.png",
                "apple-touch-icon-167.png",
                "apple-touch-icon-180.png",
                "apple-touch-icon-1024.png",
            },
        )

    def test_windows_package_is_transparent_reversible_and_matches_checksum(self) -> None:
        archive = ROOT / "downloads/Antigravity-Consultas-Windows.zip"
        expected = load_download_checksums()[archive.name]
        self.assertEqual(hashlib.sha256(archive.read_bytes()).hexdigest(), expected)

        package_root = "Antigravity-Consultas-Windows/"
        expected_files = {
            package_root + "README.md",
            package_root + "INSTALAR.cmd",
            package_root + "DESINSTALAR.cmd",
            package_root + "app/Abrir-Antigravity.cmd",
            package_root + "app/AntigravityConsultas.ico",
            package_root + "app/Desinstalar.ps1",
            package_root + "app/Instalar.ps1",
            package_root + "app/VERSAO.txt",
        }
        with zipfile.ZipFile(archive) as package:
            names = {name for name in package.namelist() if not name.endswith("/")}
            scripts = "\n".join(
                package.read(name).decode("ascii")
                for name in sorted(names)
                if name.endswith((".cmd", ".ps1"))
            )
            icon = package.read(package_root + "app/AntigravityConsultas.ico")

        self.assertEqual(names, expected_files)
        self.assertEqual(icon[:4], b"\x00\x00\x01\x00")
        self.assertEqual(int.from_bytes(icon[4:6], "little"), 7)
        self.assertIn(
            "https://aldenirfilho.github.io/antigravity-consultas/",
            scripts,
        )
        self.assertIn("[Environment]::GetFolderPath('LocalApplicationData')", scripts)
        self.assertIn("[Environment]::GetFolderPath('DesktopDirectory')", scripts)
        self.assertIn("[IO.FileAttributes]::ReparsePoint", scripts)
        self.assertNotIn("Remove-Item -Recurse", scripts)
        for blocked in (
            "Invoke-WebRequest",
            "Start-BitsTransfer",
            "New-Service",
            "Register-ScheduledTask",
            "Start-Process -Verb RunAs",
        ):
            self.assertNotIn(blocked, scripts)

    def test_guides_cover_feed_library_apps_privacy_and_deploy(self) -> None:
        operation = (ROOT / "docs_usuario/OPERACAO_CONTINUA.md").read_text(
            encoding="utf-8"
        )
        dock = (ROOT / "docs_usuario/ACESSO_DOCK_MAC.md").read_text(encoding="utf-8")
        windows = (ROOT / "docs_usuario/ACESSO_WINDOWS.md").read_text(encoding="utf-8")
        iphone = (ROOT / "docs_usuario/ACESSO_IPHONE.md").read_text(encoding="utf-8")
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
        self.assertIn("Adicionar à Tela de Início", iphone)
        self.assertIn("Abrir como App da Web", iphone)
        self.assertIn("permissão de administrador", windows)
        self.assertIn("não possui assinatura digital Authenticode", windows)

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
