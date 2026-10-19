import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class RespiratoryReviewTests(unittest.TestCase):
    def test_review_engine_and_learning_integration(self):
        result = subprocess.run(
            ["node", "--test", "--test-reporter=tap", "tests/respiratory-review.test.mjs"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)


if __name__ == "__main__":
    unittest.main()
