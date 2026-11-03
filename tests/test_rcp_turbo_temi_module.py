"""Integridade editorial, links e fontes do novo módulo RCP (somente stdlib)."""
from __future__ import annotations

import hashlib
import json
import re
import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
MOD = ROOT / '01_Modulos_Clinicos/RCP_Turbo_TEMI'
MD = ROOT / '01_UpDown_Hub/content/intensiva/rcp-turbo-temi-360.md'


class Document(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.ids, self.links, self.images, self.scripts, self.chapters = [], [], [], [], []
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.append(attrs['id'])
        if tag == 'a' and attrs.get('href'):
            self.links.append(attrs['href'])
        if tag == 'img':
            self.images.append(attrs)
        if tag == 'script' and attrs.get('src'):
            self.scripts.append(attrs['src'])
        if tag == 'section' and 'chapter' in attrs.get('class', '').split():
            self.chapters.append(attrs)


class RCPModuleTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = (MOD / 'index.html').read_text('utf-8')
        cls.doc = Document(cls.html)
        cls.manifest = json.loads((MOD / 'module.manifest.json').read_text('utf-8'))
        cls.learning = json.loads((MOD / 'data/learning.json').read_text('utf-8'))

    def test_review_state_is_truthful_and_visible(self):
        self.assertEqual(self.manifest['status'], 'em-revisao-medica')
        self.assertIsNone(self.manifest['clinicalReviewer'])
        self.assertIsNone(self.manifest['clinicalReview']['reviewedAt'])
        self.assertFalse(self.manifest['publication']['grantsClinicalHomologation'])
        self.assertIn('review-strip', self.html)
        self.assertIn('revisão médica humana pendente', self.html)
        self.assertIn('Núcleo adulto; doses de PCR sem pulso.', self.html)

    def test_canonical_sources_have_not_drifted(self):
        for item in self.manifest['sourceIntegrity'].values():
            source = ROOT / item['path']
            self.assertEqual(hashlib.sha256(source.read_bytes()).hexdigest(), item['sha256'])
        generated = (MOD / 'data/learning.js').read_text('utf-8')
        payload = generated.split('window.RCP_LEARNING = ', 1)[1].strip().removesuffix(';')
        self.assertEqual(json.loads(payload), self.learning)

    def test_every_chapter_is_present_without_javascript(self):
        source_ids = re.findall(r'^## .+?\{#([a-z0-9-]+)\}\s*$', MD.read_text('utf-8'), re.M)
        self.assertEqual(len(source_ids), 14)
        self.assertEqual([c['id'] for c in self.doc.chapters], source_ids)
        self.assertTrue(all('hidden' not in c for c in self.doc.chapters))
        self.assertIn('Laboratório TEMI — questões comentadas', self.html)
        self.assertIn('Gabarito:', self.html)

    def test_internal_links_and_assets_resolve(self):
        self.assertEqual(len(self.doc.ids), len(set(self.doc.ids)), 'IDs duplicados')
        for href in self.doc.links:
            parsed = urlsplit(href)
            if parsed.scheme or href.startswith('//'):
                continue
            if not parsed.path:
                if parsed.fragment:
                    self.assertIn(unquote(parsed.fragment), self.doc.ids, href)
            else:
                target = (MOD / unquote(parsed.path)).resolve()
                self.assertTrue(target.exists(), href)
        for src in self.doc.scripts + [image['src'] for image in self.doc.images if image.get('src')]:
            self.assertTrue((MOD / src).is_file(), src)
        self.assertNotRegex(self.html, r'\{\{[A-Z_]+\}\}')

    def test_ten_distinct_accessible_visuals_are_optimized(self):
        visual = json.loads((MOD / 'data/visual-assets.json').read_text('utf-8'))
        self.assertTrue(visual['assistedByAI'])
        self.assertTrue(visual['notPatientImages'])
        self.assertEqual(len(visual['figures']), 10)
        total, hashes = 0, set()
        for figure in visual['figures']:
            payload = (MOD / figure['href']).read_bytes()
            self.assertEqual(payload[:4], b'RIFF')
            self.assertEqual(payload[8:12], b'WEBP')
            self.assertEqual(hashlib.sha256(payload).hexdigest(), figure['sha256'])
            self.assertGreater(figure['width'], figure['height'])
            self.assertAlmostEqual(figure['width'] / figure['height'], 16 / 9, delta=.01)
            hashes.add(figure['sha256']); total += len(payload)
        self.assertEqual(len(hashes), 10)
        self.assertLess(total, 3_000_000, 'Imagens excedem orçamento móvel de 3 MB')
        for image in self.doc.images:
            if image.get('src'):
                self.assertTrue(image.get('alt'), image)
        self.assertEqual(len([i for i in self.doc.images if i.get('src', '').endswith('.webp')]), 10)

    def test_learning_items_have_complete_feedback_and_sources(self):
        self.assertEqual(len(self.learning['cases']), 20)
        self.assertEqual(len(self.learning['flashcards']), 28)
        all_ids = []
        for case in self.learning['cases']:
            all_ids.append(case['id'])
            self.assertEqual(len(case['options']), 4)
            self.assertEqual(len(set(case['options'])), 4)
            self.assertEqual(len(case['explanations']), 4)
            self.assertIn(case['correct'], range(4))
            self.assertTrue(all(len(text) > 25 for text in case['explanations']))
            self.assertTrue(case['rule'] and case['flashcard'])
            for source in case['sourceIds']:
                self.assertIn('ref-' + source.lower(), self.doc.ids)
        for card in self.learning['flashcards']:
            all_ids.append(card['id'])
            self.assertTrue(card['q'] and card['a'])
            for source in card['sourceIds']:
                self.assertIn('ref-' + source.lower(), self.doc.ids)
        self.assertEqual(len(all_ids), len(set(all_ids)))

    def test_public_module_has_no_host_artifact_dependencies(self):
        for relative in ('index.html', 'assets/app.js', 'assets/theme.js', 'data/learning.js'):
            source = (MOD / relative).read_text('utf-8')
            self.assertNotIn('window.openai', source)
            self.assertNotIn('/Users/', source)
            self.assertNotIn('plugin://', source)
        runtime = (MOD / 'assets/app.js').read_text('utf-8')
        self.assertNotRegex(runtime, r'\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon)\s*\(')
        self.assertFalse(self.manifest['privacy']['patientInputs'])
        self.assertFalse(self.manifest['privacy']['moduleRuntimeNetworkRequests'])
        self.assertTrue(all(key.startswith('antigravity:') for key in self.manifest['privacy']['localStorageKeys']))

    def test_discovery_and_editorial_coverage_are_complete(self):
        relative = self.manifest['href']
        self.assertIn(relative, (ROOT / 'index.html').read_text('utf-8'))
        registry = json.loads((ROOT / 'data/editorial/registry.json').read_text('utf-8'))
        entries = registry.get('items', registry.get('entries', [])) if isinstance(registry, dict) else registry
        own = next(item for item in entries if item.get('id') == 'release-rcp-turbo-temi-360-preview-2026-11-03')
        self.assertEqual(own['clinicalReviewStatus'], 'pending')
        self.assertIsNone(own['clinicalReviewedAt'])
        self.assertTrue(own['ownerApproval'])
        declared = set(own['paths'])
        for file in MOD.rglob('*'):
            if file.is_file():
                self.assertIn(file.relative_to(ROOT).as_posix(), declared)
        self.assertIn(MD.relative_to(ROOT).as_posix(), declared)


if __name__ == '__main__':
    unittest.main()
