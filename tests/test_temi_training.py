"""Fluxos de treino e calendário local, sem rede ou dados de pacientes."""

import os
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class TemiTrainingTests(unittest.TestCase):
    def test_daily_study_review_storage_and_accessible_controls(self):
        result = subprocess.run(
            ["node", "tests/temi_training_regression.cjs"],
            cwd=ROOT, capture_output=True, text=True, timeout=20,
            env={**os.environ, "TZ": "America/Fortaleza"},
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_calendar_is_local_in_timezones_on_both_sides_of_utc(self):
        for timezone in ("America/Fortaleza", "Pacific/Auckland", "America/New_York"):
            with self.subTest(timezone=timezone):
                result = subprocess.run(
                    ["node", "tests/temi_training_regression.cjs", "--calendar"],
                    cwd=ROOT, capture_output=True, text=True, timeout=20,
                    env={**os.environ, "TZ": timezone},
                )
                self.assertEqual(result.returncode, 0, result.stdout + result.stderr)


if __name__ == "__main__":
    unittest.main()
