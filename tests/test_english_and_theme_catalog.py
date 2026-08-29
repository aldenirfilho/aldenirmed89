import json
import subprocess
import unittest
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class _HTMLFacts(HTMLParser):
    def __init__(self):
        super().__init__()
        self.lang = None
        self.hrefs = []
        self.scripts = []
        self.styles = []
        self.ids = set()
        self.text = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "html":
            self.lang = attrs.get("lang")
        if tag == "a" and attrs.get("href"):
            self.hrefs.append(attrs["href"])
        if tag == "script" and attrs.get("src"):
            self.scripts.append(attrs["src"])
        if tag == "link" and attrs.get("rel") == "stylesheet":
            self.styles.append(attrs.get("href"))
        if attrs.get("id"):
            self.ids.add(attrs["id"])

    def handle_data(self, data):
        self.text.append(data)


def _parse_html(path: Path) -> _HTMLFacts:
    parser = _HTMLFacts()
    parser.feed(path.read_text(encoding="utf-8"))
    return parser


def _resolve_local(base_file: Path, reference: str) -> Path:
    clean = reference.split("#", 1)[0].split("?", 1)[0]
    return (base_file.parent / clean).resolve()


def _load_english_radar():
    script = r"""
const fs = require("fs");
const vm = require("vm");
const context = {window: {}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(process.argv[1], "utf8"), context);
process.stdout.write(JSON.stringify(context.window.ANTIGRAVITY_RADAR_EN));
"""
    result = subprocess.run(
        ["node", "-e", script, str(ROOT / "en/radar/data/radar.en.js")],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


class ThemeCatalogTests(unittest.TestCase):
    def setUp(self):
        self.catalog = json.loads(
            (ROOT / "data/theme-catalog.json").read_text(encoding="utf-8")
        )

    def test_catalog_has_exact_requested_profiles(self):
        expected = {
            "mystic-aerospace",
            "aerospace",
            "aerospace-light",
            "rustic-light",
            "dark",
            "minimal",
            "sepia",
            "oceanic",
            "green",
            "natural",
            "forest",
            "wizard-academy",
            "comic-hero",
            "modern-serious",
        }
        themes = self.catalog["themes"]
        self.assertEqual(14, len(themes))
        self.assertEqual(expected, {theme["id"] for theme in themes})
        self.assertEqual("mystic-aerospace", self.catalog["defaultTheme"])

    def test_all_explicit_profiles_are_active(self):
        statuses = {theme["id"]: theme["status"] for theme in self.catalog["themes"]}
        self.assertEqual(14, len(statuses))
        self.assertEqual({"active"}, set(statuses.values()))

    def test_each_theme_is_bilingual_and_has_complete_palette(self):
        required_palette = {
            "background",
            "surface",
            "surfaceElevated",
            "text",
            "muted",
            "accent",
            "accentSecondary",
            "border",
        }
        for theme in self.catalog["themes"]:
            self.assertTrue(theme["nome"])
            self.assertTrue(theme["name"])
            self.assertTrue(theme["description"])
            self.assertTrue(theme["descriptionEn"])
            self.assertTrue(theme["icon"])
            self.assertIn(theme["mode"], {"dark", "light"})
            self.assertEqual(required_palette, set(theme["palette"]))
            for color in theme["palette"].values():
                self.assertRegex(color, r"^#[0-9a-fA-F]{6}$")

    def test_catalog_avoids_requested_trademarks(self):
        payload = json.dumps(self.catalog, ensure_ascii=False).lower()
        self.assertNotIn("harry potter", payload)
        self.assertNotIn("marvel", payload)

    def test_every_non_default_theme_has_css_and_script_support(self):
        css = (ROOT / "en/assets/theme.css").read_text(encoding="utf-8")
        script = (ROOT / "en/assets/theme.js").read_text(encoding="utf-8")
        for theme in self.catalog["themes"]:
            self.assertIn(f'"{theme["id"]}"', script)
            if theme["id"] != self.catalog["defaultTheme"]:
                self.assertIn(f'html[data-theme="{theme["id"]}"]', css)


class EnglishHomeTests(unittest.TestCase):
    def setUp(self):
        self.path = ROOT / "en/index.html"
        self.page = _parse_html(self.path)
        self.text = " ".join(self.page.text)

    def test_home_is_english_and_marks_portuguese_boundaries(self):
        self.assertEqual("en", self.page.lang)
        self.assertIn("Translation status", self.text)
        self.assertIn("Portuguese", self.text)
        self.assertIn("English beta", self.text)

    def test_home_links_to_core_destinations_and_downloads(self):
        required = {
            "../index.html",
            "./radar/",
            "../15_Radar_Cientifico/",
            "../16_Diretorio_Medico/",
            "../17_Portal_Vivo/",
            "../01_Modulos_Clinicos/Hematologia_Critica/",
            "../01_Modulos_Clinicos/Reumatologia_Critica/",
            "../downloads/Antigravity-Consultas-macOS.zip",
            "../downloads/Antigravity-Consultas-Windows.zip",
            "../downloads/Antigravity-Consultas-iPhone-Icones.zip",
        }
        self.assertTrue(required.issubset(set(self.page.hrefs)))
        for reference in required:
            self.assertTrue(
                _resolve_local(self.path, reference).exists(),
                f"Missing Home destination: {reference}",
            )

    def test_home_uses_shared_theme_assets(self):
        self.assertIn("./assets/theme.css", self.page.styles)
        self.assertIn("./assets/theme.js", self.page.scripts)
        self.assertTrue((ROOT / "en/assets/theme.css").exists())
        self.assertTrue((ROOT / "en/assets/theme.js").exists())

    def test_home_offers_all_catalogued_themes(self):
        source = self.path.read_text(encoding="utf-8")
        catalog = json.loads(
            (ROOT / "data/theme-catalog.json").read_text(encoding="utf-8")
        )
        for theme in catalog["themes"]:
            self.assertIn(f'value="{theme["id"]}"', source)


class EnglishRadarTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.radar = _load_english_radar()
        cls.items = (
            cls.radar["science"]
            + cls.radar["healthAndSystems"]
            + cls.radar["productivityPurchases"]
        )

    def test_radar_has_all_nineteen_translated_items(self):
        self.assertEqual(10, len(self.radar["science"]))
        self.assertEqual(6, len(self.radar["healthAndSystems"]))
        self.assertEqual(3, len(self.radar["productivityPurchases"]))
        self.assertEqual(19, len(self.items))
        self.assertEqual(19, len({item["id"] for item in self.items}))
        self.assertEqual("2026-07-25T22:40:00-03:00", self.radar["checkedAt"])

    def test_every_item_preserves_dates_sources_limits_and_practical_fields(self):
        for item in self.items:
            self.assertRegex(item["date"], r"^2026-\d{2}-\d{2}$")
            self.assertTrue(item["sourcePublishedAt"].startswith(item["date"]))
            self.assertTrue(item["url"].startswith("https://"))
            self.assertTrue(item["summary"])
            self.assertTrue(item["why"])
            self.assertTrue(item["caveat"])
            self.assertTrue(item["evidence"]["mainResult"])
            self.assertTrue(item["evidence"]["practice"])
            self.assertTrue(item["evidence"]["doNotInfer"])

    def test_reported_numbers_and_deadlines_are_present(self):
        text = json.dumps(self.radar, ensure_ascii=False)
        for value in (
            "0.96",
            "0.71",
            "0.89",
            "0.90",
            "911",
            "187",
            "172",
            "29.5%",
            "44.4%",
            "89,789",
            "43%",
            "98.1%",
            "96.2%",
            "July 31",
            "1 in 150",
            "R$52.15",
            "1920×1080",
            "70 hours",
        ):
            self.assertIn(value, text)

    def test_commercial_items_are_non_affiliate_and_time_stamped(self):
        for item in self.radar["productivityPurchases"]:
            self.assertFalse(item["commerce"]["affiliate"])
            self.assertRegex(item["price"]["checkedAt"], r"^2026-07-25T")
            self.assertTrue(item["price"]["volatile"])
            self.assertTrue(item["commerce"]["possibleBenefit"])
            self.assertTrue(item["commerce"]["skipIf"])
        self.assertIn("non-affiliate", self.radar["editorialNote"])

    def test_visuals_have_existing_relative_card_and_widescreen_files(self):
        visuals = self.radar["visualPairs"]
        self.assertEqual(13, len(visuals))
        self.assertEqual(13, len({visual["itemId"] for visual in visuals}))
        radar_page = ROOT / "en/radar/index.html"
        for visual in visuals:
            for key in ("cardFile", "wideFile"):
                reference = visual[key]
                self.assertFalse(reference.startswith("/"))
                self.assertTrue(
                    _resolve_local(radar_page, reference).is_file(),
                    f"Missing {key}: {reference}",
                )
            self.assertTrue(visual["transcript"])
            self.assertTrue(visual["alt"])

    def test_radar_interface_has_search_three_channels_and_view_modes(self):
        page = _parse_html(ROOT / "en/radar/index.html")
        source = (ROOT / "en/radar/index.html").read_text(encoding="utf-8")
        self.assertEqual("en", page.lang)
        self.assertIn("radar-search", page.ids)
        for value in ("scientific", "context", "commercial"):
            self.assertIn(f'data-filter="{value}"', source)
        for value in ("auto", "wide", "card"):
            self.assertIn(f'data-view="{value}"', source)
        self.assertIn("./data/radar.en.js", page.scripts)
        self.assertIn("./app.js", page.scripts)
        self.assertIn("Radar em português", " ".join(page.text))
        catalog = json.loads(
            (ROOT / "data/theme-catalog.json").read_text(encoding="utf-8")
        )
        for theme in catalog["themes"]:
            self.assertIn(f'value="{theme["id"]}"', source)


if __name__ == "__main__":
    unittest.main()
