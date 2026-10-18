"""Exercise the actual root worker against controlled network/cache APIs."""
from pathlib import Path
import subprocess
import unittest

class MobilePrecacheTests(unittest.TestCase):
    def test_catalogue_offline_without_course_downloads(self):
        root = Path(__file__).resolve().parents[1]
        result = subprocess.run(['node', 'tests/mobile_precache_regression.cjs'],
                                cwd=root, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
