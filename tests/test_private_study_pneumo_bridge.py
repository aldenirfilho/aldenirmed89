"""Exercise the private/public boundary and lifecycle of the shared study bridge."""
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class PrivateStudyPneumoBridgeTests(unittest.TestCase):
    def test_private_study_pneumo_bridge(self):
        result = subprocess.run(
            ['node', '--test', 'tests/private-study-pneumo-bridge.test.mjs'],
            cwd=ROOT, capture_output=True, text=True, check=False,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)


if __name__ == '__main__':
    unittest.main()
