"""Regressões das seções visuais; só dados sintéticos e nenhuma fonte privada."""
from pathlib import Path
import shutil
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]


class ClinicalStudySectionsTests(unittest.TestCase):
    def test_topic_selection_and_private_navigation_contract(self):
        node = shutil.which("node")
        self.assertIsNotNone(node)
        result = subprocess.run(
            [node, "--test", str(ROOT / "tests/clinical-study-sections.test.mjs")],
            cwd=ROOT, capture_output=True, text=True, timeout=60,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
