"""Conexão privada da Biblioteca: contrato local verificado em Node, sem rede."""
from pathlib import Path
import shutil
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]

class LibraryLocalFoldersTests(unittest.TestCase):
    def test_private_folder_connection_flow(self):
        node = shutil.which('node')
        self.assertIsNotNone(node, 'Node é necessário para verificar a conexão local.')
        result = subprocess.run([node, '--test', str(ROOT / 'tests/library-local-folders.test.mjs')], cwd=ROOT, capture_output=True, text=True, timeout=60)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
