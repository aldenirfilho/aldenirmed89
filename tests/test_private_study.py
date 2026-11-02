"""Pacotes de estudo privados: contrato e progressão sem documentos reais."""
from pathlib import Path
import shutil
import subprocess
import unittest
ROOT=Path(__file__).resolve().parents[1]
class PrivateStudyTests(unittest.TestCase):
    def test_private_study_contract_and_progress(self):
        node=shutil.which('node')
        self.assertIsNotNone(node)
        result=subprocess.run([node,'--test',str(ROOT/'tests/private-study.test.mjs')],cwd=ROOT,capture_output=True,text=True,timeout=60)
        self.assertEqual(result.returncode,0,result.stdout+result.stderr)
