"""Integração do calendário, caminhos públicos e contrato editorial do Radar."""
import json
from pathlib import Path
import shutil
import subprocess
import unittest
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[1]


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.local = []

    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in ('href', 'src') and value and value.startswith('daily'):
                self.local.append(value.split('?', 1)[0])


class RadarDailyTests(unittest.TestCase):
    def test_calendar_and_sharing_regressions(self):
        node = shutil.which('node')
        self.assertIsNotNone(node, 'Node.js necessário para validar o calendário diário')
        result = subprocess.run([node, '--test', 'tests/radar-daily.test.cjs'], cwd=ROOT, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_daily_assets_exist_and_are_covered_by_public_allowlist_and_registry(self):
        module = ROOT / 'radar-biblico-3min'
        parsed = Links()
        parsed.feed((module / 'index.html').read_text())
        self.assertEqual(len(parsed.local), 4)
        registry = json.loads((ROOT / 'data/editorial/registry.json').read_text())
        registered = {path for item in registry['items'] for path in item['paths']}
        for path in parsed.local:
            self.assertTrue((module / path).is_file(), path)
            self.assertIn('radar-biblico-3min/' + path, registered)
        from scripts_admin.build_public_site import OPTIONAL
        self.assertIn('radar-biblico-3min', OPTIONAL)
