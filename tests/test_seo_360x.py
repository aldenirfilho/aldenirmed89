"""Motor de Busca 360X: metadados, descoberta, Complexo 360X e IndexNow."""

import importlib.util
import json
import shutil
import sys
import tempfile
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts_admin"))


def load(name, relative):
    spec = importlib.util.spec_from_file_location(name, ROOT / relative)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


builder = load("seo_builder_under_test", "scripts_admin/build_public_site.py")
seo = load("seo_360x_under_test", "scripts_admin/seo_360x.py")
complexo = load("complexo_360x_under_test", "scripts_admin/build_complexo_360x.py")
indexnow = load("indexnow_under_test", "scripts_admin/indexnow_submit.py")
gate = load("editorial_gate_for_seo", "scripts_admin/editorial_gate.py")

BASE = builder.PUBLIC_BASE_URL


def json_ld_blocks(html):
    import re

    return [
        json.loads(match)
        for match in re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
    ]


class SeoFixture(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.site = self.root / "site"
        (self.root / "scripts_admin").mkdir()
        shutil.copy(ROOT / "scripts_admin/seo_360x_config.json", self.root / "scripts_admin/seo_360x_config.json")
        (self.root / "complexo-360x/data").mkdir(parents=True)
        shutil.copy(ROOT / "complexo-360x/data/complexo.json", self.root / "complexo-360x/data/complexo.json")
        (self.root / "jornal-360/data").mkdir(parents=True)
        self.editions = {
            "edicoes": [
                {"numero": 2, "data": "2026-11-16", "temaDoDia": "Choque", "arquivos": {"jornal": "J_2.pdf", "pilulas": "P_2.pdf"},
                 "manchetes": ["Manchete & teste"], "pilulas": {"TEMI": "Vasoativas"}, "correcoes": ["Correção pública."]},
                {"numero": 1, "data": "2026-11-15", "temaDoDia": "", "arquivos": {"jornal": "J_1.pdf"}, "manchetes": []},
            ]
        }
        (self.root / "jornal-360/data/edicoes.json").write_text(json.dumps(self.editions), encoding="utf-8")
        pages = {
            "index.html": '<html lang="pt-BR"><head><title>AldenirMed 360X</title>'
                          '<meta name="description" content="Descrição original da home."></head>'
                          "<body><p>Texto</p></body></html>",
            "en/index.html": '<html lang="en"><head><title>English</title></head><body></body></html>',
            "01_Modulos_Clinicos/index.html": "<html><head><title>Módulos</title></head><body></body></html>",
            "01_Modulos_Clinicos/Sepse/index.html": "<html><head><title>Sepse · AldenirMed</title></head><body>"
                                                    "<nav><p>Menu de navegação muito longo que não deve virar descrição da página.</p></nav>"
                                                    "<p>Sepse é disfunção orgânica ameaçadora à vida causada por resposta desregulada à infecção.</p>"
                                                    "</body></html>",
            "02_Banco/components/card.html": "<html><head><title>Card</title></head><body></body></html>",
            "privado.html": '<html><head><meta name="robots" content="noindex"><title>P</title></head><body></body></html>',
            "antigo.html": '<html><head><meta http-equiv="refresh" content="0;url=index.html"></head></html>',
            "excluida.html": "<html><head><title>Excluída</title></head><body></body></html>",
            "jornal-360/index.html": "<html><head><title>Jornal Diário 360</title></head><body></body></html>",
            "20_Conheca_Aldenir/index.html": "<html><head><title>Conheça</title></head><body></body></html>",
        }
        for relative, text in pages.items():
            path = self.site / relative
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text, encoding="utf-8")
        (self.site / "jornal-360/edicoes").mkdir()
        for name in ("J_2.pdf", "P_2.pdf", "J_1.pdf"):
            (self.site / "jornal-360/edicoes" / name).write_bytes(b"%PDF-1.4 teste")

    def tearDown(self):
        self.tmp.cleanup()

    def apply(self):
        return seo.apply_page_seo(
            self.root,
            self.site,
            base_url=BASE,
            canonical_for=builder.canonical_url_for_html,
            closing_tag=builder.closing_document_tag,
            exclusions=frozenset({"excluida.html"}),
        )

    def read(self, relative):
        return (self.site / relative).read_text(encoding="utf-8")


class ApplyPageSeoTests(SeoFixture):
    def test_home_declares_site_identity_without_professional_claims(self):
        self.apply()
        home = self.read("index.html")
        graph = json_ld_blocks(home)[0]["@graph"]
        types = {node["@type"] for node in graph}
        self.assertTrue({"WebPage", "WebSite", "Organization", "Person"} <= types)
        organization = next(node for node in graph if node["@type"] == "Organization")
        self.assertIn("https://aldenirfilho.github.io/bussola-da-honra-site/", organization["sameAs"])
        self.assertIn('content="Descrição original da home."', home)
        self.assertEqual(home.count('name="description"'), 1, "descrição existente não é duplicada")
        self.assertIn('hreflang="en" href="' + BASE + 'en/"', home)
        self.assertIn('type="application/rss+xml"', home)
        self.assertIn("max-image-preview:large", home)
        self.assertNotIn("google-site-verification", home, "sem token configurado, nenhuma meta de verificação")
        issues = gate.scan_text(home, "index.html", {"scanning": {}}, None, require_registration=False)
        self.assertEqual([issue.code for issue in issues], [])

    def test_medical_module_gets_breadcrumb_and_body_description(self):
        self.apply()
        page = self.read("01_Modulos_Clinicos/Sepse/index.html")
        graph = json_ld_blocks(page)[0]["@graph"]
        webpage = graph[0]
        self.assertEqual(webpage["@type"], "MedicalWebPage")
        self.assertEqual(webpage["url"], BASE + "01_Modulos_Clinicos/Sepse/")
        self.assertTrue(webpage["description"].startswith("Sepse é disfunção orgânica"))
        crumbs = [item["name"] for item in graph[1]["itemListElement"]]
        self.assertEqual(crumbs, ["AldenirMed 360X", "Módulos clínicos", "Sepse · AldenirMed"])
        self.assertIn('property="og:url" content="' + BASE + '01_Modulos_Clinicos/Sepse/"', page)

    def test_fragments_get_noindex_and_no_structured_data(self):
        self.apply()
        card = self.read("02_Banco/components/card.html")
        self.assertIn('content="noindex,follow"', card)
        self.assertEqual(json_ld_blocks(card), [])
        self.assertEqual(json_ld_blocks(self.read("privado.html")), [], "noindex existente é respeitado")

    def test_redirects_and_excluded_pages_are_untouched_and_run_is_idempotent(self):
        before = {name: self.read(name) for name in ("antigo.html", "excluida.html")}
        first = self.apply()
        for name, text in before.items():
            self.assertEqual(self.read(name), text)
        snapshot = {path: path.read_bytes() for path in self.site.rglob("*.html")}
        second = self.apply()
        self.assertGreater(first["pages"], 0)
        self.assertEqual(second["pages"], 0)
        self.assertEqual(snapshot, {path: path.read_bytes() for path in self.site.rglob("*.html")})

    def test_jornal_and_profile_types(self):
        self.apply()
        jornal = json_ld_blocks(self.read("jornal-360/index.html"))[0]["@graph"]
        periodical = next(node for node in jornal if node["@type"] == "Periodical")
        self.assertEqual([issue["issueNumber"] for issue in periodical["hasPart"]], ["2", "1"])
        self.assertTrue(periodical["hasPart"][0]["url"].endswith("jornal-360/edicoes/J_2.pdf"))
        profile = json_ld_blocks(self.read("20_Conheca_Aldenir/index.html"))[0]["@graph"][0]
        self.assertEqual(profile["@type"], "ProfilePage")

    def test_derived_description_never_reclassifies_a_page_as_medical(self):
        page = self.site / "02_Biblioteca_IA_Engine/ferramenta.html"
        page.parent.mkdir(parents=True)
        page.write_text("<html><head><title>Diagnóstico técnico</title></head><body></body></html>", encoding="utf-8")
        self.apply()
        html = page.read_text(encoding="utf-8")
        self.assertIn('name="description" content="Diagnóstico técnico · AldenirMed 360X"', html)
        self.assertFalse(gate.infer_medical(html))

    def test_verification_token_only_on_home(self):
        config_path = self.root / "scripts_admin/seo_360x_config.json"
        config = json.loads(config_path.read_text(encoding="utf-8"))
        config["verification"]["google-site-verification"] = "token-de-teste_123"
        config_path.write_text(json.dumps(config), encoding="utf-8")
        self.apply()
        self.assertIn('name="google-site-verification" content="token-de-teste_123"', self.read("index.html"))
        self.assertNotIn("google-site-verification", self.read("en/index.html"))


class DiscoveryExtrasTests(SeoFixture):
    def test_jornal_sitemap_feed_index_llms_and_indexnow_key(self):
        self.apply()
        (self.root / "data").mkdir()
        (self.root / "data/site_manifest.json").write_text(
            json.dumps({"canonicalRoutes": {"home": "index.html", "sepse": "01_Modulos_Clinicos/Sepse/index.html"}}),
            encoding="utf-8",
        )
        builder.write_search_discovery(self.root, self.site)
        stats = seo.write_discovery_extras(self.root, self.site, base_url=BASE)

        jornal = ET.parse(self.site / "sitemap-jornal-360.xml").getroot()
        entries = {
            node.find("{*}loc").text: node.find("{*}lastmod").text for node in jornal.findall("{*}url")
        }
        self.assertEqual(entries[BASE + "jornal-360/"], "2026-11-16")
        self.assertEqual(entries[BASE + "jornal-360/edicoes/J_1.pdf"], "2026-11-15")
        self.assertEqual(stats["jornalUrls"], 4)

        index = ET.parse(self.site / "sitemap_index.xml").getroot()
        children = [node.find("{*}loc").text for node in index.findall("{*}sitemap")]
        self.assertEqual(children, [BASE + "sitemap.xml", BASE + "sitemap-jornal-360.xml"])

        feed = ET.parse(self.site / "jornal-360/feed.xml").getroot()
        items = feed.findall("channel/item")
        self.assertEqual(len(items), 2)
        self.assertIn("nº 002", items[0].find("title").text)
        self.assertEqual(items[0].find("enclosure").get("type"), "application/pdf")
        self.assertIn("Manchete &amp; teste", items[0].find("description").text)

        robots = (self.site / "robots.txt").read_text(encoding="utf-8")
        self.assertIn(f"Sitemap: {BASE}sitemap.xml", robots)
        self.assertIn(f"Sitemap: {BASE}sitemap_index.xml", robots)

        llms = (self.site / "llms.txt").read_text(encoding="utf-8")
        self.assertIn(BASE + "complexo-360x/", llms)
        self.assertIn(BASE + "01_Modulos_Clinicos/Sepse/", llms)

        key = json.loads((ROOT / "scripts_admin/seo_360x_config.json").read_text(encoding="utf-8"))["indexnow"]["key"]
        self.assertEqual((self.site / f"{key}.txt").read_text(encoding="utf-8"), key)


class ComplexoPageTests(unittest.TestCase):
    def test_page_is_in_sync_and_covers_the_requested_axes(self):
        self.assertEqual(complexo.main(["--check"]), 0)
        data = complexo.load()
        self.assertEqual(
            [axis["id"] for axis in data["eixos"]],
            ["medicina", "honra", "religiao", "justica", "auditoria", "verdades", "politica", "ficcao"],
        )
        page = (ROOT / "complexo-360x/index.html").read_text(encoding="utf-8")
        graph = json_ld_blocks(page)[0]["@graph"]
        item_list = next(node for node in graph if node["@type"] == "ItemList")
        self.assertEqual(item_list["numberOfItems"], len(data["sites"]) + len(data["constelacoes"]))
        self.assertIn('role="search"', page)
        issues = gate.scan_text(page, "complexo-360x/index.html", {"scanning": {}}, None, require_registration=False)
        self.assertEqual([issue.code for issue in issues], [])

    def test_validation_fails_closed(self):
        data = json.loads((ROOT / "complexo-360x/data/complexo.json").read_text(encoding="utf-8"))
        insecure = json.loads(json.dumps(data))
        insecure["sites"][0]["url"] = "http://exemplo.invalid/"
        with self.assertRaises(ValueError):
            complexo.validate(insecure)
        orphan = json.loads(json.dumps(data))
        orphan["sites"] = [site for site in orphan["sites"] if "ficcao" not in site["eixos"]]
        with self.assertRaises(ValueError):
            complexo.validate(orphan)

    def test_home_links_to_the_complexo(self):
        home = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn('href="complexo-360x/"', home)
        manifest = json.loads((ROOT / "data/site_manifest.json").read_text(encoding="utf-8"))
        self.assertEqual(manifest["canonicalRoutes"]["complexo_360x"], "complexo-360x/index.html")


class IndexNowTests(unittest.TestCase):
    def test_changed_files_map_to_published_urls_only(self):
        universe = [BASE, BASE + "jornal-360/", BASE + "jornal-360/edicoes/J.pdf", BASE + "01_Modulos_Clinicos/Sepse/",
                    BASE + "complexo-360x/"]
        urls = indexnow.select_urls(
            ["index.html", "jornal-360/data/edicoes.json", "01_Modulos_Clinicos/Sepse/assets/app.js",
             "scripts_admin/qualquer.py", "complexo-360x/data/complexo.json", "rascunho/nao-publicado.html"],
            universe,
        )
        self.assertEqual(
            urls,
            [BASE, BASE + "jornal-360/", BASE + "jornal-360/edicoes/J.pdf", BASE + "01_Modulos_Clinicos/Sepse/",
             BASE + "complexo-360x/"],
        )

    def test_universe_reads_sitemap_index_and_drops_foreign_hosts(self):
        pages = {
            BASE + "sitemap_index.xml": f"<sitemapindex><sitemap><loc>{BASE}sitemap.xml</loc></sitemap></sitemapindex>",
            BASE + "sitemap.xml": f"<urlset><url><loc>{BASE}</loc></url><url><loc>https://outro.example/x</loc></url></urlset>",
        }
        self.assertEqual(indexnow.sitemap_universe(BASE, fetch=pages.__getitem__), [BASE])

    def test_key_must_be_served_before_submission(self):
        self.assertTrue(indexnow.key_is_live("u", "abc12345", attempts=1, fetch=lambda _url: "abc12345\n"))
        self.assertFalse(indexnow.key_is_live("u", "abc12345", attempts=1, fetch=lambda _url: "outra"))

    def test_configured_key_is_valid(self):
        config = seo.load_config(ROOT)
        self.assertRegex(config["indexnow"]["key"], r"^[A-Za-z0-9-]{8,128}$")


if __name__ == "__main__":
    unittest.main()
