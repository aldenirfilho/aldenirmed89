"""Regression tests for public Fauna integration; no network dependencies."""
import hashlib
import json
import unittest
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KEY = 'bolsa-ajuda-fauna'
URL = 'https://aldenirfilho.github.io/aldenirmed89/apps/bolsa-ajuda-fauna/'


def load(path):
    return json.loads((ROOT / path).read_text(encoding='utf-8'))


class Links(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.links = []
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            self.links.append(dict(attrs))


class FaunaEcosystemTests(unittest.TestCase):
    def test_single_public_site_entry_and_local_preview(self):
        sites = load('ecossistema/data/sites-360x.json')['projects']
        entries = [p for p in sites if p['id'] == KEY]
        self.assertEqual(len(entries), 1)
        entry = entries[0]
        self.assertEqual(entry['url'], URL)
        self.assertEqual(entry['category'], 'Ciência e natureza')
        self.assertTrue((ROOT / 'ecossistema' / entry['image']).is_file())
        self.assertIn(URL, [s['url'] for s in entry['sources']])
        self.assertEqual(entry['canonicalProjectId'], 'p044-panda-x-fauna')
        self.assertEqual(len({p['url'] for p in sites}), len(sites))

    def test_existing_canonical_family_reused(self):
        catalog = load('ecossistema/data/catalog.json')
        self.assertEqual(len(catalog['projects']), 54)
        self.assertEqual(len(catalog['roots']), 10)
        fauna = next(p for p in catalog['projects'] if p['id'] == 'p044-panda-x-fauna')
        self.assertEqual(fauna['root'], 'biodiversidade')
        self.assertEqual(fauna['phase'], 'disponivel')
        self.assertIn('Panda X', fauna['aliases'])
        self.assertIn('impacto-social', fauna['relatedRoots'])
        self.assertEqual({l['url'] for l in fauna['publicLinks']}, {URL, URL + '#instituicoes'})

    def test_support_program_not_misrepresented_as_launched_fund(self):
        program = next(p for p in load('ecossistema/data/catalog.json')['projects'] if p['id'] == 'p042-bolsa-ajuda-atracao')
        self.assertEqual(program['phase'], 'estruturacao')
        self.assertEqual(program['visibility'], 'controlled-public')
        self.assertEqual(program['publicLinks'][0]['url'], URL + '#instituicoes')

    def test_map_contains_fauna_and_valid_nonduplicated_connections(self):
        graph = load('ecossistema/data/mapa-conexoes.json')
        ids = {p['id'] for p in load('ecossistema/data/sites-360x.json')['projects']}
        self.assertIn(KEY, graph['labels'])
        pairs = set()
        neighbors = set()
        for edge in graph['connections']:
            self.assertIn(edge['source'], ids)
            self.assertIn(edge['target'], ids)
            pair = tuple(sorted((edge['source'], edge['target'])))
            self.assertNotIn(pair, pairs)
            pairs.add(pair)
            if KEY in pair:
                neighbors.update(set(pair) - {KEY})
        self.assertEqual(neighbors, {'atlas-animais', 'atlas-plantas', 'plano-d', 'aldenirmed'})

    def test_direct_links_exist_without_javascript(self):
        for path in ['ecossistema/index.html', 'ecossistema/mapa.html']:
            links = Links((ROOT / path).read_text()).links
            direct = [a for a in links if a.get('href') == URL]
            self.assertEqual(len(direct), 1, path)
            self.assertEqual(direct[0]['target'], '_blank')
            self.assertTrue({'noopener', 'noreferrer'} <= set(direct[0]['rel'].split()))

    def test_fauna_returns_to_directory_and_selected_map_node(self):
        hrefs = {a.get('href') for a in Links((ROOT / 'apps/bolsa-ajuda-fauna/index.html').read_text()).links}
        self.assertIn('../../ecossistema/index.html#site-bolsa-ajuda-fauna', hrefs)
        self.assertIn('../../ecossistema/mapa.html#projeto=bolsa-ajuda-fauna', hrefs)
        self.assertIn('../../index.html', hrefs)

    def test_canonical_public_link_renderer_keeps_safe_url_boundary(self):
        code = (ROOT / 'ecossistema/assets/app.js').read_text()
        self.assertIn('asArray(project.publicLinks)', code)
        self.assertIn('safeSiteUrl(entry.url)', code)
        self.assertIn('link.rel = "noopener noreferrer"', code)

    def test_changed_public_files_have_current_editorial_hashes(self):
        registry = load('data/editorial/registry.json')
        paths = ['ecossistema/data/sites-360x.json', 'ecossistema/data/mapa-conexoes.json',
                 'ecossistema/data/catalog.json', 'ecossistema/assets/app.js',
                 'ecossistema/index.html', 'ecossistema/mapa.html', 'apps/bolsa-ajuda-fauna/index.html']
        for path in paths:
            with self.subTest(path=path):
                owners = [item for item in registry['items'] if path in item.get('paths', [])]
                self.assertEqual(len(owners), 1)
                evidence = next(e for e in owners[0]['assetEvidence'] if e['path'] == path)
                self.assertEqual(evidence['sha256'], hashlib.sha256((ROOT / path).read_bytes()).hexdigest())
                self.assertTrue(any(r['id'] == 'fauna-ecossistema-20261022' for r in owners[0]['navigationRevisions']))


if __name__ == '__main__':
    unittest.main()
