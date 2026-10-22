"""Static contracts for the cinematic presentation and deterministic art studio."""
import hashlib
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / 'ecossistema'
VERSION = 'cinematic-360x-v1'

class CinematicStudioTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.catalog = json.loads((PAGE / 'data/sites-360x.json').read_text(encoding='utf-8'))
        cls.manifest = json.loads((PAGE / 'data/cinematic-360x.json').read_text(encoding='utf-8'))
        cls.config = json.loads((PAGE / 'estudio-360x/design-system.json').read_text(encoding='utf-8'))

    def test_covers_match_existing_projects_without_duplicate_ids(self):
        ids = [c['id'] for c in self.manifest['covers']]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertEqual(set(ids), {p['id'] for p in self.catalog['projects']})
        self.assertEqual(len(ids), 24)

    def test_local_images_and_original_vectors_are_preserved(self):
        for cover in self.manifest['covers']:
            path = (PAGE / cover['image']).resolve()
            self.assertTrue(path.is_relative_to(PAGE / 'assets/previews' / VERSION))
            data = path.read_bytes()
            self.assertEqual(data[:4], b'RIFF')
            self.assertEqual(data[8:12], b'WEBP')
            self.assertLess(len(data), 250000)
            self.assertEqual(cover['outputDimensions'], [960, 540])
        for project in self.catalog['projects']:
            self.assertTrue((PAGE / project['image']).is_file())
            self.assertTrue(project['image'].endswith('.svg'))

    def test_honest_provenance_and_capability_labels(self):
        self.assertEqual(self.manifest['artType'], 'user-approved-ai-illustration')
        for cover in self.manifest['covers']:
            self.assertIn('não é fotografia', cover['alt'])
            self.assertIn('não constitui geração individual', cover['transform'])
        self.assertFalse(self.config['imageGeneration'])
        self.assertFalse(self.config['automaticPublishing'])
        self.assertFalse(self.config['apiKeyRequired'])
        self.assertEqual(self.config['executionMode'], 'deterministic-briefing-composer')

    def test_studio_controls_and_local_resources(self):
        text = (PAGE / 'estudio-360x/index.html').read_text(encoding='utf-8')
        for identifier in ['project', 'format', 'energy', 'palette', 'extra', 'brief', 'copy', 'export-json', 'export-text', 'export-batch']:
            self.assertIn(f'id="{identifier}"', text)
        self.assertIn('lang="pt-BR"', text)
        self.assertIn('aria-live="polite"', text)
        self.assertNotIn('<iframe', text)
        self.assertNotIn('type="password"', text)
        self.assertNotIn('type="file"', text)
        self.assertIn('href="./estudio-360x/index.html"', (PAGE / 'index.html').read_text())

    def test_safe_dom_fallback_and_motion(self):
        script = (PAGE / 'assets/cinematic-360x.js').read_text()
        self.assertIn('textContent', script)
        self.assertNotIn('innerHTML', script)
        self.assertIn('image.src=old.src', script)
        self.assertIn('prefers-reduced-motion:reduce', (PAGE / 'assets/cinematic-360x.css').read_text())

    def test_public_asset_hashes_registered(self):
        reg = json.loads((ROOT / 'data/editorial/registry.json').read_text())
        entry = next(i for i in reg['items'] if i['id'] == VERSION)
        self.assertFalse(entry['personalData']['contains'])
        hashes = {e['path']: e['sha256'] for e in entry['assetEvidence']}
        self.assertEqual(set(hashes), set(entry['paths']))
        for path, digest in hashes.items():
            self.assertEqual(hashlib.sha256((ROOT / path).read_bytes()).hexdigest(), digest)

if __name__ == '__main__':
    unittest.main()
