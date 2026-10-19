"""Run advanced topic content, safety and learning integration checks in CI."""
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class AdvancedRespiratoryLearningTests(unittest.TestCase):
    def test_advanced_topics_and_review_integration(self):
        result = subprocess.run(
            ["node", "--test", "tests/advanced-tb-data.test.mjs",
             "tests/advanced-therapy-data.test.mjs", "tests/advanced-learning-integration.test.mjs"],
            cwd=ROOT, capture_output=True, text=True, check=False,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)


if __name__ == "__main__":
    unittest.main()
