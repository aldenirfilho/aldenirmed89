import struct
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PLATFORM = ROOT / '01_Modulos_Clinicos/Pneumologia_Critica/protocolos-2026'


class RespiratoryProtocolsTests(unittest.TestCase):
    def test_clinical_rules_and_missing_data_regressions(self):
        result = subprocess.run(
            ['node', '--test', '--test-reporter=tap', 'tests/dpoc-pac-protocols.test.mjs'],
            cwd=ROOT, capture_output=True, text=True, timeout=90,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn('# fail 0', result.stdout)

    def test_twenty_widescreen_pngs_are_present(self):
        paths = list((PLATFORM / 'assets').glob('*.png'))
        self.assertEqual(len(paths), 20)
        self.assertEqual(sum(p.name.startswith('dpoc-') for p in paths), 10)
        self.assertEqual(sum(p.name.startswith('pac-') for p in paths), 10)
        for path in paths:
            with self.subTest(image=path.name), path.open('rb') as stream:
                header = stream.read(24)
                self.assertEqual(header[:8], b'\x89PNG\r\n\x1a\n')
                width, height = struct.unpack('>II', header[16:24])
                self.assertGreaterEqual(width, 1024)
                self.assertLess(abs(width / height - 16 / 9), 0.02)


if __name__ == '__main__':
    unittest.main()
