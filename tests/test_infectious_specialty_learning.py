"""Exercise the infectious training banks and specialty clinical safeguards in CI."""
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class InfectiousSpecialtyLearningTests(unittest.TestCase):
    def test_infectious_and_specialty_modules(self):
        result = subprocess.run(
            ["node", "--test", "tests/infectious-learning-data.test.mjs",
             "tests/infectious-learning-integration.test.mjs", "tests/pott-igg4-data.test.mjs"],
            cwd=ROOT, capture_output=True, text=True, check=False,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)


if __name__ == "__main__":
    unittest.main()
