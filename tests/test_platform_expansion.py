#!/usr/bin/env python3
"""Contratos da expansão acessível, plugável e instalável."""

from __future__ import annotations

import hashlib
import importlib.util
import json
import plistlib
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


def sha256(relative: str) -> str:
    return hashlib.sha256((ROOT / relative).read_bytes()).hexdigest()


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


def contrast_ratio(first: str, second: str) -> float:
    def luminance(color: str) -> float:
        channels = [
            int(color[index : index + 2], 16) / 255
            for index in (1, 3, 5)
        ]
        linear = [
            channel / 12.92
            if channel <= 0.04045
            else ((channel + 0.055) / 1.055) ** 2.4
            for channel in channels
        ]
        return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]

    first_luminance = luminance(first)
    second_luminance = luminance(second)
    lighter = max(first_luminance, second_luminance)
    darker = min(first_luminance, second_luminance)
    return (lighter + 0.05) / (darker + 0.05)


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
        self.assertIn(
            "navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'})",
            home,
        )
        self.assertIn('const CACHE_PREFIX = "antigravity-root-"', worker)
        self.assertIn("const SHELL_ASSETS", worker)
        self.assertIn("Promise.allSettled", worker)

        for size in (32, 64, 192, 512, 1024):
            self.assertEqual(
                png_size(f"assets/icons/antigravity-consultas-{size}.png"),
                (size, size),
            )
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
        self.assertIn('const CACHE_NAME = `${CACHE_PREFIX}v7`', worker)
        self.assertIn("await self.skipWaiting()", worker)
        self.assertIn("await self.clients.claim()", worker)
        range_guard = 'if (request.headers.has("range")) return fetch(request);'
        self.assertIn(range_guard, worker)
        self.assertLess(
            worker.index(range_guard),
            worker.index("const cached = await caches.match(request);"),
        )
        self.assertIn('new URL("./downloads/", self.registration.scope)', worker)
        self.assertIn('cache: "no-store"', worker)
        self.assertIn("networkOnlyDownload(request)", worker)
        self.assertIn('id="installPwaBtn"', home)
        self.assertIn("beforeinstallprompt", home)
        self.assertIn("Antigravity-Consultas-Windows.zip", home)
        self.assertIn("Antigravity-Consultas-iPhone-Icones.zip", home)
        self.assertIn('href="docs_usuario/ACESSO_DOCK_MAC/"', home)
        self.assertIn('href="docs_usuario/OPERACAO_CONTINUA/"', home)
        self.assertIn('href="docs_usuario/ALIMENTAR_CONTEUDO_SITE/"', home)
        self.assertIn("Baixar atalho opcional", home)
        self.assertIn("não contém .app, script ou instalador", home)

    def test_a_orbital_identity_replaces_legacy_cross_assets(self) -> None:
        home = (ROOT / "index.html").read_text(encoding="utf-8")
        expected_master = (
            "1b0332baa08c1e9aebc98868ad2714a1a7c6b035302d28699fd052de5e324850"
        )
        legacy_hashes = {
            "44135464a2514d8b35ed01c3a6674425f98cb35ce4e88b582c43c23eecddc477",
            "4be52ad4471b1686af846fdef431ceee9c369d0fb0c98d3f3512227d2ec20489",
            "cf98e8fe91f626ca81db185b0e2046b49dd845dc4018def45dd49c0b40eab5f4",
            "8a2d35b0f93ee9a85a8d95ae0d8ea0bab7a2e0cf8739e87d4c09c0b2437955b3",
        }
        master_aliases = (
            "assets/brand/antigravity-a-orbital-master.png",
            "assets/icons/antigravity-consultas-1024.png",
            "assets/icons/ios/apple-touch-icon-1024.png",
            "assets/img/logo.png",
            "logo_concept_3_book_1778036997285.png",
            "public_site/assets/img/logo.png",
            "public_site/logo_concept_3_book_1778036997285.png",
        )

        for relative in master_aliases:
            self.assertEqual(png_size(relative), (1024, 1024))
            self.assertEqual(sha256(relative), expected_master)
        for relative in (
            *master_aliases,
            "favicon.ico",
            "windows/Antigravity-Consultas-Windows/app/AntigravityConsultas.ico",
        ):
            self.assertNotIn(sha256(relative), legacy_hashes)

        favicon = (ROOT / "favicon.ico").read_bytes()
        windows_icon = (
            ROOT
            / "windows/Antigravity-Consultas-Windows/app/AntigravityConsultas.ico"
        ).read_bytes()
        self.assertEqual(favicon[:4], b"\x00\x00\x01\x00")
        self.assertEqual(int.from_bytes(favicon[4:6], "little"), 7)
        self.assertEqual(windows_icon, favicon)
        self.assertIn(
            'aria-label="Antigravity Consultas — início"',
            home,
        )
        self.assertIn(
            'src="./assets/icons/antigravity-consultas-64.png" alt=""',
            home,
        )
        self.assertNotIn(
            'src="logo_concept_3_book_1778036997285.png"',
            home,
        )

    def test_public_download_showcase_is_visible_and_complete(self) -> None:
        home = (ROOT / "index.html").read_text(encoding="utf-8")

        self.assertIn(
            '<section class="downloads-section" id="downloads"',
            home,
        )
        self.assertLess(home.index('id="downloads"'), home.index('id="pipeline"'))
        self.assertEqual(home.count('data-download-card="'), 3)
        for platform in ("macos", "windows", "ios"):
            self.assertIn(f'data-download-card="{platform}"', home)
        for archive in (
            "downloads/Antigravity-Consultas-macOS.zip",
            "downloads/Antigravity-Consultas-Windows.zip",
            "downloads/Antigravity-Consultas-iPhone-Icones.zip",
        ):
            self.assertIn(f'href="{archive}" download', home)
        for guide in (
            "docs_usuario/ACESSO_DOCK_MAC/",
            "docs_usuario/ACESSO_WINDOWS/",
            "docs_usuario/ACESSO_IPHONE/",
        ):
            self.assertIn(f'href="{guide}"', home)
        self.assertIn('class="nav-download" href="#downloads"', home)
        self.assertIn('class="nav-status-full">Sistema online</span>', home)
        self.assertIn('class="nav-status-short">Online</span>', home)
        self.assertIn('class="nav-download-short">Apps</span>', home)
        self.assertIn('class="brand-short">Antigravity</span>', home)
        self.assertIn("não um aplicativo publicado na App Store", home)
        self.assertIn(".hero>*{min-width:0}", home)

    def test_home_accessibility_and_untrusted_content_contracts(self) -> None:
        home = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn('class="skip-link"', home)
        self.assertIn('id="a11yPanel"', home)
        self.assertIn('data-a11y="contrast"', home)
        self.assertIn("@media(prefers-reduced-motion:reduce)", home)
        self.assertIn(
            'id="a11yPanel" role="dialog" aria-modal="false"',
            home,
        )
        self.assertIn("overflow-y:auto;overscroll-behavior:contain", home)
        self.assertIn("-webkit-overflow-scrolling:touch", home)
        self.assertIn("touch-action:pan-y", home)
        self.assertIn("a11yPanel.scrollTo({", home)
        self.assertIn("env(safe-area-inset-bottom)", home)
        self.assertIn("env(safe-area-inset-right)", home)
        self.assertIn("html{scroll-behavior:smooth;overflow-x:hidden}", home)
        self.assertIn("if(quickPanel&&!quickPanel.hidden)setA11yPanel(false)", home)
        self.assertIn(".drawer-head{", home)
        self.assertIn("position:sticky;top:0;z-index:2", home)
        self.assertIn("let h = escHtml(md)", home)
        self.assertIn("${escHtml(t)}</span>", home)
        self.assertIn("${escH(stripTags(v))}</span>", home)
        self.assertIn('<a class="dsf-card reveal"', home)
        self.assertNotIn('<div class="dsf-card reveal"', home)

    def test_home_expanded_layout_and_information_hierarchy_contracts(self) -> None:
        home = (ROOT / "index.html").read_text(encoding="utf-8")

        self.assertIn("--page-max:1720px;", home)
        self.assertIn("max-width:var(--page-max)", home)
        self.assertIn(
            "html.layout-focus{--page-max:1260px;",
            home,
        )
        self.assertIn(
            "grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));",
            home,
        )
        self.assertIn(
            ".modules-grid{\n  display:grid;\n  grid-template-columns:repeat(4,minmax(0,1fr));",
            home,
        )
        self.assertIn(
            '<div class="critical-grid" role="group"',
            home,
        )
        self.assertIn(
            ".timeline{\n  display:grid;grid-template-columns:repeat(4,minmax(0,1fr));",
            home,
        )
        self.assertGreaterEqual(home.count('class="reveal section-intro"'), 7)
        self.assertLess(home.index('id="modulos"'), home.index('id="pipeline"'))
        self.assertLess(home.index('id="temi"'), home.index('id="pipeline"'))

        self.assertIn(
            "{id:'arquivos',  label:'📄 Arquivos',    types:['file']",
            home,
        )
        self.assertIn("const active = new Set(['estrutura']);", home)
        self.assertIn("let vis = query ? allNodes", home)
        self.assertIn("typeToGroup[n.type] || 'outros'", home)

    def test_light_and_flexible_view_controls_are_persistent(self) -> None:
        home = (ROOT / "index.html").read_text(encoding="utf-8")

        self.assertIn('id="themeModeSelect" data-theme-select', home)
        self.assertIn(
            '<option value="light">☀️ Visualização clara</option>',
            home,
        )
        self.assertIn('<option value="system">💻 Sistema</option>', home)
        self.assertIn('id="wideViewBtn"', home)
        self.assertEqual(
            home.count(' data-layout-wide aria-pressed="true"'),
            2,
        )
        self.assertIn('html[data-theme="light"]{', home)
        self.assertIn("document.documentElement.dataset.themeMode=mode;", home)
        self.assertIn("saved.wide!==false", home)
        self.assertIn("theme:'dark',wide:true", home)
        self.assertIn(
            "if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed))",
            home,
        )
        self.assertIn("root.dataset.themeMode=a11yPrefs.theme;", home)
        self.assertIn(
            "root.dataset.theme=contrastActive?'dark':resolvedTheme;",
            home,
        )
        self.assertIn("themeColorMeta?.setAttribute(", home)
        self.assertIn(
            "systemTheme.addEventListener('change',syncSystemTheme)",
            home,
        )
        self.assertIn("systemTheme.addListener?.(syncSystemTheme)", home)
        self.assertIn("localStorage.setItem(a11yKey,JSON.stringify(a11yPrefs))", home)

        light_background = "#f4f8fc"
        for foreground in (
            "#10263b",
            "#334f67",
            "#536b7d",
            "#006f7d",
            "#6548b8",
            "#087a4e",
            "#865800",
            "#b42335",
            "#175cd3",
        ):
            self.assertIn(foreground, home)
            self.assertGreaterEqual(
                contrast_ratio(foreground, light_background),
                4.5,
                foreground,
            )

    def test_clarity_mode_reaches_offline_and_not_found_surfaces(self) -> None:
        for relative in ("404.html", "offline.html"):
            page = (ROOT / relative).read_text(encoding="utf-8")
            with self.subTest(relative=relative):
                self.assertIn("antigravity:a11y:v1", page)
                self.assertIn("Visualização clara", page)
                self.assertIn("a11y-light", page)
                self.assertIn("a11y-contrast", page)
                self.assertIn("#ffffff", page)
                self.assertIn("#000000", page)
                self.assertIn("@media print", page)
                self.assertIn("event.newValue", page)
                self.assertIn("matchMedia", page)
                self.assertIn("addListener", page)
                self.assertIn("theme", page)
                self.assertIn("system", page)
                self.assertIn("persist", page)
        not_found = (ROOT / "404.html").read_text(encoding="utf-8")
        self.assertIn(
            "html.a11y-contrast .btn-404.primary",
            not_found,
        )
        self.assertIn("border: 2px solid #fff", not_found)

    def test_clarity_palette_and_initialization_contracts(self) -> None:
        home = (ROOT / "index.html").read_text(encoding="utf-8")

        self.assertIn("--bg:#fff", home)
        self.assertIn("--brd:#d3e0ea;--brd-h:#71869a;", home)
        self.assertGreaterEqual(contrast_ratio("#71869a", "#ffffff"), 3)
        self.assertIn("@media print", home)
        self.assertIn(
            ".hero h1 .hl,.metric-cell .val,.temi-stat-big{",
            home,
        )
        self.assertIn("-webkit-text-fill-color:currentColor!important;", home)
        self.assertIn(".module-card p,.dsf-excerpt{", home)
        self.assertIn("-webkit-line-clamp:unset!important", home)
        self.assertIn("overflow:visible!important", home)
        self.assertIn("document.documentElement.style.colorScheme", home)
        self.assertIn("a11yPrefs.clarity=resolvedTheme==='light';", home)
        self.assertIn("window.addEventListener('storage',event=>{", home)
        self.assertIn("event.newValue", home)
        self.assertGreaterEqual(home.count("applyA11y({persist:false})"), 3)
        self.assertIn("themeColorMeta?.setAttribute(", home)
        self.assertIn("appleStatusMeta?.setAttribute(", home)

        for foreground in (
            "#10263b",
            "#334f67",
            "#536b7d",
            "#006f7d",
            "#6548b8",
            "#087a4e",
            "#865800",
            "#b42335",
            "#175cd3",
        ):
            self.assertGreaterEqual(
                contrast_ratio(foreground, "#ffffff"),
                4.5,
                foreground,
            )

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

        for module in ("Hematologia_Critica", "Reumatologia_Critica", "Delirium_UTI"):
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
            names = {name for name in package.namelist() if not name.endswith("/")}
            web_location = plistlib.loads(
                package.read(
                    "Antigravity-Consultas-macOS/Antigravity Consultas.webloc"
                )
            )
        self.assertEqual(
            names,
            {
                "Antigravity-Consultas-macOS/Antigravity Consultas.webloc",
                "Antigravity-Consultas-macOS/LEIA-ME.md",
            },
        )
        self.assertEqual(
            web_location["URL"],
            "https://aldenirfilho.github.io/antigravity-consultas/",
        )
        self.assertFalse(any(".app/" in name for name in names))

    def test_iphone_icon_package_is_complete_and_matches_checksum(self) -> None:
        archive = ROOT / "downloads/Antigravity-Consultas-iPhone-Icones.zip"
        expected = load_download_checksums()[archive.name]
        self.assertEqual(hashlib.sha256(archive.read_bytes()).hexdigest(), expected)

        with zipfile.ZipFile(archive) as package:
            names = set(package.namelist())
            for size in (120, 152, 167, 180, 1024):
                filename = f"apple-touch-icon-{size}.png"
                self.assertEqual(
                    package.read(filename),
                    (ROOT / f"assets/icons/ios/{filename}").read_bytes(),
                )
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
        self.assertEqual(
            icon,
            (
                ROOT
                / "windows/Antigravity-Consultas-Windows/app/AntigravityConsultas.ico"
            ).read_bytes(),
        )
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
        feeding = (ROOT / "docs_usuario/ALIMENTAR_CONTEUDO_SITE.md").read_text(
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
        for expected in (
            "Os 16 cartões",
            "01_UpDown_Hub/content/",
            "update_library_publication_baseline.py --approve",
            "scan_card_feed.py",
            "scan_content_module.py",
            "Banco TEMI estruturado",
            "AVC Agudo e LES Autoanticorpos",
            "Hematologia e Reumatologia Crítica",
            "RespiraSense e RespiraCrit",
            "Apps e calculadoras",
            "admin/desafios.html",
            "build_desafios.py",
            "build_mnemonicos.py",
            "02_Biblioteca_IA_Engine/data/biblioteca_catalogo.json",
            "publication_guard.py",
            "Publicação definitiva",
        ):
            self.assertIn(expected, feeding)
        self.assertIn("Safari", dock)
        self.assertIn("Dock", dock)
        self.assertIn("Gatekeeper", dock)
        self.assertIn("Safari", dock)
        self.assertIn("Adicionar ao Dock", dock)
        self.assertIn("Abrir Mesmo Assim", dock)
        self.assertIn("Adicionar à Tela de Início", iphone)
        self.assertIn("Abrir como App da Web", iphone)
        self.assertIn("permissão de administrador", windows)
        self.assertIn("não possui assinatura digital Authenticode", windows)

    def test_html_guides_are_stable_safe_and_keep_markdown_fallbacks(self) -> None:
        guide_root = ROOT / "docs_usuario"
        hub = (guide_root / "index.html").read_text(encoding="utf-8")
        reader = (guide_root / "guide-reader.js").read_text(encoding="utf-8")
        reader_css = (guide_root / "guide-reader.css").read_text(encoding="utf-8")
        worker = (ROOT / "sw.js").read_text(encoding="utf-8")

        expected = {
            "ALIMENTAR_CONTEUDO_SITE": "ALIMENTAR_CONTEUDO_SITE.md",
            "OPERACAO_CONTINUA": "OPERACAO_CONTINUA.md",
            "ACESSO_DOCK_MAC": "ACESSO_DOCK_MAC.md",
            "ACESSO_WINDOWS": "ACESSO_WINDOWS.md",
            "ACESSO_IPHONE": "ACESSO_IPHONE.md",
        }
        for route, markdown in expected.items():
            page = (guide_root / route / "index.html").read_text(encoding="utf-8")
            self.assertIn("../guide-reader.css", page)
            self.assertIn("../guide-reader.js", page)
            self.assertIn(f'data-source="../{markdown}"', page)
            self.assertIn(f'href="../{markdown}"', page)
            self.assertIn(f"./{route}/", hub)
            self.assertIn(f"./docs_usuario/{route}/index.html", worker)

        feeding_page = (
            guide_root / "ALIMENTAR_CONTEUDO_SITE" / "index.html"
        ).read_text(encoding="utf-8")
        self.assertIn('data-toc-levels="2"', feeding_page)
        self.assertIn("escapeHtml", reader)
        self.assertIn("safeUrl", reader)
        self.assertIn("safeGuideSourceUrl", reader)
        self.assertIn("resolved.origin !== window.location.origin", reader)
        self.assertIn("link.href = safeGuideSourceUrl(source)", reader)
        self.assertIn('article.setAttribute("aria-busy", "false")', reader)
        self.assertNotIn("eval(", reader)
        self.assertNotIn("cdn.", hub)
        self.assertIn(".guide :not(pre)>code{overflow-wrap:anywhere", reader_css)
        self.assertIn("max-height:min(65vh,34rem)", reader_css)
        self.assertIn('script?.dataset.tocLevels || "2,3"', reader)

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
