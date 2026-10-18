"""Comportamento observável do painel, com transporte e tempo controlados."""

import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class AnalyticsPanelBehaviorTests(unittest.TestCase):
    def test_home_previews_honor_motion_preferences_and_observer_fallback(self):
        result = subprocess.run(
            ["node", "tests/home_preview_motion_regression.cjs"],
            cwd=ROOT, capture_output=True, text=True, timeout=20,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_panel_failure_recovery_privacy_and_payload_handling(self):
        result = subprocess.run(
            ["node", "tests/analytics_panel_regression.cjs"],
            cwd=ROOT, capture_output=True, text=True, timeout=20,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)


if __name__ == "__main__":
    unittest.main()
