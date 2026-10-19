import hashlib
import struct
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PLATFORM = ROOT / '01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026'


class PulmonaryExpansionTests(unittest.TestCase):
    def test_cited_educational_content(self):
        result = subprocess.run(
            ['node', '--test', '--test-reporter=tap', 'tests/pulmonary-expansion-data.test.mjs'],
            cwd=ROOT, capture_output=True, text=True, timeout=90,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_thirty_distinct_widescreen_originals(self):
        images = list((PLATFORM / 'assets/expansao').glob('*.png'))
        self.assertEqual(len(images), 30)
        hashes = set()
        for group in ('raras', 'tb-pulmonar', 'tb-extra'):
            self.assertEqual(len([p for p in images if p.name.startswith(group + '-')]), 10)
            for number in range(1, 11):
                path = PLATFORM / 'assets/expansao' / f'{group}-{number:02}.png'
                with self.subTest(image=path.name):
                    data = path.read_bytes()
                    self.assertEqual(data[:8], b'\x89PNG\r\n\x1a\n')
                    width, height = struct.unpack('>II', data[16:24])
                    self.assertGreaterEqual(width, 1024)
                    self.assertLess(abs(width / height - 16 / 9), 0.02)
                    hashes.add(hashlib.sha256(data).hexdigest())
        self.assertEqual(len(hashes), 30, 'Cada conexão deve ter uma arte distinta.')


if __name__ == '__main__':
    unittest.main()
