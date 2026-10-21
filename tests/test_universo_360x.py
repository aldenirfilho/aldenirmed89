"""Integridade da vitrine pública: links, fallback e imagens locais seguras."""

import json
import re
import unittest
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / 'ecossistema'


class FallbackLinks(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.urls = set()
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            self.urls.add(dict(attrs).get('href'))


class Universo360XTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.projects = json.loads((PAGE / 'data/sites-360x.json').read_text())['projects']

    def test_public_destinations_are_unique_https_and_source_backed(self):
        ids, urls = set(), set()
        for project in self.projects:
            with self.subTest(project=project['id']):
                self.assertRegex(project['id'], r'^[a-z0-9-]+$')
                self.assertNotIn(project['id'], ids)
                self.assertNotIn(project['url'], urls)
                ids.add(project['id'])
                urls.add(project['url'])
                url = urlsplit(project['url'])
                self.assertEqual(url.scheme, 'https')
                self.assertTrue(url.hostname)
                self.assertIsNone(url.username)
                self.assertIsNone(url.password)
                self.assertIn(project['url'], {source['url'] for source in project['sources']})
                self.assertTrue(project['description'].strip())
                self.assertIn(project['verificationMethod'], {'anonymous-http-200', 'browser-public-content'})

    def test_each_illustration_is_local_accessible_and_contains_no_active_svg(self):
        for project in self.projects:
            with self.subTest(project=project['id']):
                path = (PAGE / project['image']).resolve()
                self.assertTrue(path.is_relative_to(PAGE / 'assets/previews'))
                self.assertTrue(path.is_file())
                self.assertTrue(project['imageAlt'].strip())
                self.assertEqual(project['imageType'], 'illustration')
                svg = ET.fromstring(path.read_text())
                for element in svg.iter():
                    self.assertNotIn(element.tag.rsplit('}', 1)[-1].lower(), {'script', 'foreignobject', 'iframe', 'image'})
                    self.assertFalse(any(key.lower().startswith('on') for key in element.attrib))

    def test_every_site_remains_reachable_without_javascript(self):
        html = (PAGE / 'index.html').read_text()
        links = FallbackLinks(html).urls
        self.assertTrue({project['url'] for project in self.projects}.issubset(links))
        home = (ROOT / 'index.html').read_text()
        ids = {project['id'] for project in self.projects}
        for destination in re.findall(r'ecossistema/index.html#site-([a-z0-9-]+)', home):
            self.assertIn(destination, ids)
        self.assertIn('id="sites-publicos"', html)


if __name__ == '__main__':
    unittest.main()
