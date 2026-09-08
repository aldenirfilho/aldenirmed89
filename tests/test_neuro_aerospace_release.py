"""Behavioural regression and platform artifact contracts for the aeroespacial release."""
import hashlib
import json
from pathlib import Path
import re
import struct
import subprocess
import unittest
import zipfile

ROOT = Path(__file__).resolve().parents[1]
MODULE = ROOT / '01_Modulos_Clinicos/Semiologia_Neurologica_Topografica'


class NeuroAerospaceReleaseTests(unittest.TestCase):
    def test_quiz_survives_reload_and_invalid_storage(self):
        result = subprocess.run(['node', str(ROOT / 'tests/neuro_quiz_regression.cjs')], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_versioned_course_assets_are_precached(self):
        html = (MODULE / 'aprofundamento.html').read_text()
        worker = (ROOT / 'sw.js').read_text()
        for relative in re.findall(r'(?:src|href)="(assets/[^" ]+\?v=[^"]+)"', html):
            self.assertIn('"./01_Modulos_Clinicos/Semiologia_Neurologica_Topografica/' + relative + '"', worker)

    def test_all_platform_formats_and_masters_are_integral(self):
        brand = ROOT / 'assets/brand'
        metadata = json.loads((brand / 'aerospace-platforms.json').read_text())
        for filename, digest in metadata['masters'].items():
            self.assertEqual(hashlib.sha256((brand / filename).read_bytes()).hexdigest(), digest)
        manifest = json.loads((ROOT / 'manifest.webmanifest').read_text())
        self.assertTrue(all(i.get('purpose') == 'any' for i in manifest['icons']))
        for icon in manifest['icons']:
            data = (ROOT / icon['src']).read_bytes()
            self.assertEqual(data[:8], b'\x89PNG\r\n\x1a\n')
            width, height = struct.unpack('>II', data[16:24])
            self.assertEqual(icon['sizes'], f'{width}x{height}')
        with zipfile.ZipFile(ROOT / metadata['package']) as archive:
            self.assertIsNone(archive.testzip())
            self.assertTrue({'macOS/AldenirMed89.icns', 'Windows/AldenirMed89.ico', 'Android/icon-512.png', 'iOS/apple-touch-icon-180.png'}.issubset(archive.namelist()))
            icns = archive.read('macOS/AldenirMed89.icns')
            self.assertEqual(icns[:4], b'icns')
            self.assertEqual(struct.unpack('>I', icns[4:8])[0], len(icns))
            ico = archive.read('Windows/AldenirMed89.ico')
            self.assertEqual(ico, (ROOT / 'favicon.ico').read_bytes())
            self.assertEqual(struct.unpack('<HHH', ico[:6]), (0, 1, 7))

    def test_original_route_and_search_terms_reach_existing_course(self):
        alias = ROOT / '01_Modulos_Clinicos/Neuro_Semiologia_Topografica'
        self.assertIn('../Semiologia_Neurologica_Topografica/aprofundamento.html', (alias / 'index.html').read_text())
        self.assertIn('destination.hash = location.hash', (alias / 'redirect.js').read_text())
        topic = next(t for t in json.loads((ROOT / 'data/topics.json').read_text()) if t['id'] == 'neuro-aprofundamento')
        node = next(t for t in json.loads((ROOT / 'data/connections.json').read_text())['nodes'] if t['id'] == topic['id'])
        self.assertEqual(topic['url'], node['url'])
        self.assertEqual(topic['tags'], node['tags'])
        self.assertIn('siringomielia', node['tags'])


if __name__ == '__main__':
    unittest.main()
