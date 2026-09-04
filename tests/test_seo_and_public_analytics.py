import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def load_builder():
    spec = importlib.util.spec_from_file_location(
        "seo_public_analytics_builder",
        ROOT / "scripts_admin" / "build_public_site.py",
    )
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


class SeoAndPublicAnalyticsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.builder = load_builder()
        cls.config = json.loads(
            (ROOT / "data/site-analytics.json").read_text(encoding="utf-8")
        )

    def test_active_config_is_public_safe_and_contains_no_secret(self):
        config = self.builder.load_site_analytics_config(ROOT)
        self.assertTrue(config["enabled"])
        self.assertTrue(config["visitorCounterEnabled"])
        self.assertEqual(
            config["siteCode"],
            "aldenirrochadeoliveirafilho1989",
        )
        serialized = json.dumps(config).casefold()
        for forbidden in ("password", "api_key", "token", "secret"):
            self.assertNotIn(forbidden, serialized)

    def test_injects_canonical_and_active_loader_at_any_depth(self):
        with tempfile.TemporaryDirectory() as directory:
            site = Path(directory)
            nested = site / "01_Modulos_Clinicos" / "Pneumologia_Critica"
            nested.mkdir(parents=True)
            page = nested / "index.html"
            endpoint = "https://aldenirrochadeoliveirafilho1989.goatcounter.com"
            csp = (
                "default-src 'self'; "
                "script-src 'self' https://gc.zgo.at; "
                f"connect-src 'self' {endpoint}; "
                f"img-src 'self' {endpoint}"
            )
            page.write_text(
                f'<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="{csp}"></head><body></body></html>',
                encoding="utf-8",
            )

            count = self.builder.inject_public_metadata(site, self.config)

            self.assertEqual(count, 1)
            html = page.read_text(encoding="utf-8")
            self.assertIn(self.builder.PUBLIC_METADATA_MARKER, html)
            self.assertIn(
                'rel="canonical" href="https://aldenirfilho.github.io/aldenirmed89/01_Modulos_Clinicos/Pneumologia_Critica/"',
                html,
            )
            self.assertIn('src="../../assets/site-analytics.js"', html)
            self.assertIn('href="../../assets/aldenirmed89-mystic.css"', html)
            self.assertIn('class="aldenirmed89-cosmos" aria-hidden="true"', html)
            self.assertIn('data-enabled="true"', html)
            self.assertIn('data-counter-enabled="true"', html)
            self.assertIn(
                'data-site-code="aldenirrochadeoliveirafilho1989"',
                html,
            )
            self.assertIn("https://gc.zgo.at", html)
            self.assertIn(csp, html)

    def test_global_identity_layer_is_rustic_restrained_and_accessible(self):
        css = (ROOT / "assets/aldenirmed89-mystic.css").read_text(encoding="utf-8")
        for marker in (
            "bruxa-rustica-moderna",
            "--aldenirmed89-aged-copper: #d8a85f",
            "--aldenirmed89-moss: #91b28b",
            "--line: #806f54",
            "prefers-reduced-motion: reduce",
            "html.a11y-contrast .aldenirmed89-cosmos",
        ):
            self.assertIn(marker, css)
        self.assertNotIn("@keyframes", css)

    def test_public_rebrand_preserves_legacy_identifiers_and_download_paths(self):
        source = """<!doctype html><html><head>
        <title>Antigravity Consultas</title>
        </head><body>
        <h1 aria-label="Antigravity Consultas — início">ANTIGRAVITY</h1>
        <a href="downloads/Antigravity-Consultas-Windows.zip">Antigravity</a>
        <script>window.ANTIGRAVITY_PORTAL='Antigravity';</script>
        </body></html>"""

        migrated = self.builder.rebrand_public_html(source)

        self.assertIn("<title>AldenirMed89</title>", migrated)
        self.assertIn('aria-label="AldenirMed89 — início"', migrated)
        self.assertIn(">ALDENIRMED89</h1>", migrated)
        self.assertIn("downloads/Antigravity-Consultas-Windows.zip", migrated)
        self.assertIn("window.ANTIGRAVITY_PORTAL='Antigravity'", migrated)

    def test_activation_fails_closed_when_existing_csp_was_not_reviewed(self):
        with tempfile.TemporaryDirectory() as directory:
            site = Path(directory)
            page = site / "index.html"
            page.write_text(
                '<html><head><meta http-equiv="Content-Security-Policy" content="default-src \'self\'; img-src \'self\' data:; script-src \'self\'; connect-src \'none\'"></head><body></body></html>',
                encoding="utf-8",
            )
            active = dict(self.config)
            active.update(
                enabled=True,
                visitorCounterEnabled=True,
                siteCode="antigravityconsultas",
            )

            with self.assertRaisesRegex(ValueError, "bloqueadas pela CSP"):
                self.builder.inject_public_metadata(site, active)

    def test_csp_text_inside_body_script_is_not_treated_as_page_policy(self):
        html = """<!doctype html><html><head><meta charset="utf-8"></head>
        <body><script>const preview = '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'">';</script></body></html>"""
        self.builder.validate_goatcounter_csp(
            html,
            self.config["siteCode"],
            Path("preview.html"),
        )

    def test_isolated_document_previews_keep_their_closed_csp(self):
        with tempfile.TemporaryDirectory() as directory:
            site = Path(directory)
            preview_dir = site / "02_Biblioteca_IA_Engine" / "previews"
            preview_dir.mkdir(parents=True)
            page = preview_dir / "docx-example.html"
            page.write_text(
                """<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self'"></head><body>Prévia isolada</body></html>""",
                encoding="utf-8",
            )

            self.builder.inject_public_metadata(site, self.config)

            html = page.read_text(encoding="utf-8")
            self.assertIn("default-src 'none'", html)
            self.assertIn(self.builder.PUBLIC_METADATA_MARKER, html)
            self.assertNotIn("data-antigravity-analytics", html)
            self.assertNotIn("site-analytics.css", html)
            self.assertNotIn("gc.zgo.at", html)

    def test_generates_robots_and_sitemap_from_canonical_manifest(self):
        with tempfile.TemporaryDirectory() as directory:
            site = Path(directory)
            (site / "index.html").write_text("home", encoding="utf-8")
            nested = site / "01_Modulos_Clinicos" / "Pneumologia_Critica"
            nested.mkdir(parents=True)
            (nested / "index.html").write_text("pneumo", encoding="utf-8")

            count, _ = self.builder.write_search_discovery(ROOT, site)

            self.assertEqual(count, 2)
            sitemap = (site / "sitemap.xml").read_text(encoding="utf-8")
            robots = (site / "robots.txt").read_text(encoding="utf-8")
            self.assertIn(self.builder.PUBLIC_BASE_URL, sitemap)
            self.assertIn("Pneumologia_Critica/", sitemap)
            self.assertNotIn("index.html</loc>", sitemap)
            self.assertIn(f"Sitemap: {self.builder.PUBLIC_BASE_URL}sitemap.xml", robots)

    def test_home_panel_is_hidden_until_real_metrics_are_available(self):
        home = (ROOT / "index.html").read_text(encoding="utf-8")
        script = (ROOT / "assets/site-analytics.js").read_text(encoding="utf-8")
        self.assertIn("data-analytics-section", home)
        self.assertIn("data-analytics-section aria-labelledby", home)
        self.assertIn("hidden>", home)
        self.assertIn("loader.dataset.enabled !== 'true'", script)
        self.assertNotIn("document.cookie", script)
        self.assertNotIn("localStorage", script)
        self.assertNotIn("innerHTML", script)


if __name__ == "__main__":
    unittest.main()
