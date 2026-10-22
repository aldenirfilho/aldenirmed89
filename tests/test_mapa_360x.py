"""Contratos de navegação, acesso sem JavaScript e pacote offline do mapa 360X."""

import json
import re
import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[1]
MAP_PATH = "ecossistema/mapa.html"


class PageResources(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.links = []
        self.assets = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "a":
            self.links.append(attrs)
        if tag in {"script", "img"} and attrs.get("src"):
            self.assets.append(attrs["src"])
        if tag == "link" and attrs.get("rel") in {"stylesheet", "icon"}:
            self.assets.append(attrs["href"])


class Mapa360XIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.page = PageResources((ROOT / MAP_PATH).read_text(encoding="utf-8"))
        cls.projects = json.loads(
            (ROOT / "ecossistema/data/sites-360x.json").read_text(encoding="utf-8")
        )["projects"]

    def test_all_public_destinations_have_safe_links_without_javascript(self):
        destinations = {project["url"] for project in self.projects}
        links = {link.get("href"): link for link in self.page.links}
        self.assertTrue(destinations.issubset(links))
        for url in destinations:
            with self.subTest(url=url):
                self.assertEqual(links[url].get("target"), "_blank")
                self.assertTrue({"noopener", "noreferrer"}.issubset(links[url].get("rel", "").split()))

    def test_map_is_reachable_from_home_and_catalog_with_history_preserved(self):
        home = PageResources((ROOT / "index.html").read_text(encoding="utf-8"))
        catalog = PageResources((ROOT / "ecossistema/index.html").read_text(encoding="utf-8"))
        self.assertIn(MAP_PATH, {link.get("href") for link in home.links})
        self.assertIn("./mapa.html", {link.get("href") for link in catalog.links})
        self.assertIn("./index.html#catalogo", {link.get("href") for link in self.page.links})
        manifest = json.loads((ROOT / "data/site_manifest.json").read_text(encoding="utf-8"))
        self.assertEqual(manifest["canonicalRoutes"]["mapa_visual_360x"], MAP_PATH)
        self.assertEqual(manifest["canonicalRoutes"]["ecossistema_360xa"], "ecossistema/index.html")

    def test_map_and_its_local_dependencies_are_in_the_offline_shell(self):
        worker = (ROOT / "sw.js").read_text(encoding="utf-8")
        shell = re.search(r"const SHELL_ASSETS = \[(.*?)\];", worker, re.S)
        self.assertIsNotNone(shell)
        cached = {path.removeprefix("./") for path in re.findall(r'"([^"]+)"', shell.group(1))}
        required = {
            MAP_PATH,
            "ecossistema/data/sites-360x.json",
            "ecossistema/data/catalog.json",
            "ecossistema/data/mapa-conexoes.json",
        }
        for resource in self.page.assets:
            parsed = urlsplit(resource)
            if not parsed.scheme and not parsed.netloc:
                required.add((ROOT / MAP_PATH).parent.joinpath(parsed.path).resolve().relative_to(ROOT).as_posix())
        for path in required:
            with self.subTest(path=path):
                self.assertTrue((ROOT / path).is_file(), f"Dependência ausente: {path}")
                self.assertIn(path, cached, f"Dependência offline ausente: {path}")


if __name__ == "__main__":
    unittest.main()
