import subprocess
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class StudySearchTests(unittest.TestCase):
 def test_real_filter_and_controller(self):
  result=subprocess.run(['node','--test','tests/study-search.test.mjs'],cwd=ROOT,text=True,capture_output=True,timeout=30)
  self.assertEqual(result.returncode,0,result.stdout+result.stderr)
 def test_generated_index_is_current(self):
  result=subprocess.run(['node','scripts_admin/build_study_search.mjs','--check'],cwd=ROOT,text=True,capture_output=True,timeout=30)
  self.assertEqual(result.returncode,0,result.stdout+result.stderr)
