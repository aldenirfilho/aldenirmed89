"""Inclui as regressões de interface na suíte Python executada pelo CI."""
import subprocess
import unittest
from pathlib import Path


class DailyMetricsRaceTest(unittest.TestCase):
    def test_async_import_and_source_isolation(self):
        script = Path(__file__).with_name('daily_metrics_race_regression.js')
        result = subprocess.run(['node', str(script)], capture_output=True, text=True, timeout=30)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn('10 cenários', result.stdout)


if __name__ == '__main__':
    unittest.main()
