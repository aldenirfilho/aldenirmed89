"""Data, fallback and asset contracts for the public thematic trails."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import unittest
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / 'ecossistema'


class Trails360XTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.projects = json.loads((PAGE / 'data/sites-360x.json').read_text())['projects']
        cls.data = json.loads((PAGE / 'data/trilhas-360x.json').read_text())
        cls.trails = cls.data['trails']

    def test_trails_cover_the_canonical_directory_without_copied_urls(self):
        self.assertEqual(self.data['schemaVersion'], 1)
        self.assertEqual(len(self.trails), 6)
        ids = {project['id'] for project in self.projects}
        covered = set()
        self.assertEqual(len({trail['id'] for trail in self.trails}), len(self.trails))
        for trail in self.trails:
            steps = [step['projectId'] for step in trail['steps']]
            self.assertEqual(len(steps), len(set(steps)))
            self.assertTrue(set(steps) <= ids)
            self.assertTrue(3 <= len(steps) <= 7)
            self.assertTrue(all(step['purpose'] and 'url' not in step for step in trail['steps']))
            covered.update(steps)
        self.assertEqual(covered, ids)

    def test_no_javascript_trails_match_the_canonical_sources(self):
        subprocess.run([sys.executable, str(ROOT / 'scripts_admin/build_360x_trails.py'), '--check'], check=True, capture_output=True)

    def test_all_new_covers_are_safe_local_art_with_preserved_originals(self):
        from scripts_admin.svg_safety import validate_svg_file
        images = [project['image'] for project in self.projects] + [trail['image'] for trail in self.trails]
        self.assertEqual(len(images), len(set(images)))
        for image in images:
            path = (PAGE / image).resolve()
            self.assertTrue(path.is_relative_to(PAGE / 'assets'))
            self.assertLess(path.stat().st_size, 30000)
            self.assertIsNone(validate_svg_file(path), image)
            self.assertEqual(ET.parse(path).getroot().get('viewBox'), '0 0 1200 675')
        for project in self.projects:
            self.assertTrue((PAGE / project['previousImage']).is_file())

    def test_offline_shell_contains_trails_and_all_new_covers(self):
        worker = (ROOT / 'sw.js').read_text()
        for path in ['ecossistema/data/trilhas-360x.json'] + [f'ecossistema/{row["image"].removeprefix("./")}' for row in self.projects + self.trails]:
            self.assertIn(f'"./{path}"', worker)

    def test_link_snapshot_is_complete_and_preserves_the_historical_bridge(self):
        for project in self.projects:
            evidence = project['verificationEvidence']
            self.assertEqual(evidence['authentication'], 'none')
            self.assertEqual(evidence['method'], 'GET')
            self.assertEqual(evidence['url'], project['url'])
            self.assertEqual(evidence['httpStatus'], 200)
            self.assertTrue(evidence['checkedAt'].startswith('2026-11-02'))
        bridge = next(project for project in self.projects if project['id'] == 'antigravity')
        self.assertEqual(bridge['availability'], 'html-redirect')
        self.assertEqual(bridge['verificationEvidence']['htmlRedirectURL'], 'https://aldenirfilho.github.io/aldenirmed89/')

    def test_new_assets_have_matching_editorial_evidence(self):
        registry = json.loads((ROOT / 'data/editorial/registry.json').read_text())
        item = next(row for row in registry['items'] if row['id'] == 'trilhas-capas-sereno-360x-20261102')
        evidence = {row['path']: row['sha256'] for row in item['assetEvidence']}
        for asset in item['paths']:
            self.assertEqual(evidence[asset], hashlib.sha256((ROOT / asset).read_bytes()).hexdigest())


if __name__ == '__main__':
    unittest.main()
