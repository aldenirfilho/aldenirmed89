"""Publication and clinical-reference contracts for the expanded neuro course."""
import hashlib
import json
import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
MODULE = ROOT / '01_Modulos_Clinicos/Semiologia_Neurologica_Topografica'


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.ids, self.references, self.sections = [], [], []
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'section':
            self.sections.append(attrs.get('id'))
        for attr in ('href', 'src'):
            if attr in attrs:
                self.references.append(attrs[attr])


class NeuroAprofundamentoTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = (MODULE / 'aprofundamento.html').read_text()
        cls.page = Page(cls.source)

    def test_every_local_asset_and_anchor_resolves(self):
        self.assertEqual(len(self.page.ids), len(set(self.page.ids)))
        self.assertEqual(set(self.page.sections), {f's{i:02}' for i in range(1, 20)})
        for reference in self.page.references:
            url = urlsplit(reference)
            if url.scheme or url.netloc:
                continue
            destination = MODULE / unquote(url.path) if url.path else MODULE / 'aprofundamento.html'
            self.assertTrue(destination.is_file(), reference)
            if url.fragment and destination.suffix == '.html':
                self.assertIn(unquote(url.fragment), Page(destination.read_text()).ids, reference)

    def test_all_new_images_match_metadata_and_are_safe_svg(self):
        metadata = json.loads((MODULE / 'aprofundamento.json').read_text())
        self.assertEqual(len(metadata['assets']), 4)
        for asset in metadata['assets']:
            path = MODULE / asset['file']
            self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(), asset['sha256'])
            self.assertFalse(asset['patientData'])
            if path.suffix == '.svg':
                tree = ET.parse(path)
                self.assertTrue(tree.getroot().get('viewBox'))
                tags = {node.tag.rsplit('}', 1)[-1] for node in tree.iter()}
                self.assertTrue({'title', 'desc'}.issubset(tags))
                self.assertFalse({'script', 'foreignObject'}.intersection(tags))

    def test_public_review_scope_and_traceable_high_risk_sources(self):
        self.assertIn('Prévia educacional em revisão médica', self.source)
        self.assertIn('revisão humana especializada pendente', self.source)
        references = self.page.references
        for required in (
            'https://www.saem.org/publications/grace/grace-3',
            'https://www.glasgowcomascale.org/faq/',
            'https://sistemas.cfm.org.br/normas/arquivos/resolucoes/BR/2017/2173_2017.pdf',
        ):
            self.assertIn(required, references)
        self.assertFalse(any('fonts.googleapis.com' in x for x in references))
        self.assertFalse(any('INSTRUCOES_CODEX' in x or 'PROMPT_CODEX' in x for x in references))

    def test_course_is_reachable_from_home_module_and_search(self):
        relative = '01_Modulos_Clinicos/Semiologia_Neurologica_Topografica/aprofundamento.html'
        self.assertIn(relative, (ROOT / 'index.html').read_text())
        self.assertIn('href="aprofundamento.html"', (MODULE / 'index.html').read_text())
        topics = json.loads((ROOT / 'data/topics.json').read_text())
        self.assertEqual(len([t for t in topics if t['url'].split('#')[0] == relative]), 5)


if __name__ == '__main__':
    unittest.main()
