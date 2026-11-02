"""Limites da conexão local e do inventário privado, sem navegador ou rede."""
from __future__ import annotations

import importlib.util
import json
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('cardfeed_icloud_inventory', ROOT / 'scripts_admin/cardfeed_icloud_inventory.py')
INVENTORY = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(INVENTORY)


class CardFeedICloudFolderTests(unittest.TestCase):
    def test_node_connection_boundaries(self):
        node = shutil.which('node')
        self.assertIsNotNone(node, 'Node é necessário para verificar a conexão local.')
        result = subprocess.run([node, '--test', str(ROOT / 'tests/cardfeed-icloud-folder.test.mjs')],
                                cwd=ROOT, capture_output=True, text=True, timeout=60)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_inventory_reads_metadata_without_opening_image_bytes(self):
        with tempfile.TemporaryDirectory() as temp:
            source = Path(temp) / 'IMAGENS'
            source.mkdir()
            (source / 'a.PNG').write_bytes(b'fixture apenas para metadados')
            (source / '.oculto.png').write_bytes(b'oculto')
            (source / 'arquivo.svg').write_text('<svg/>')
            (source / 'subpasta').mkdir()
            (source / 'subpasta/b.jpeg').write_bytes(b'fixture')
            outside = Path(temp) / 'fora.png'
            outside.write_bytes(b'nao seguir')
            (source / 'atalho.png').symlink_to(outside)
            with patch.object(Path, 'open', side_effect=AssertionError('Não abrir imagem')), \
                    patch('builtins.open', side_effect=AssertionError('Não ler bytes')):
                report = INVENTORY.inventory(source)
            self.assertTrue(report['metadataOnly'])
            self.assertFalse(report['imageBytesRead'])
            self.assertFalse(report['followedSymlinks'])
            self.assertEqual(report['summary']['images'], 2)
            self.assertEqual(report['summary']['ignoredSymlinks'], 1)
            self.assertEqual(report['summary']['ignoredHidden'], 1)
            self.assertEqual(report['summary']['ignoredUnsupported'], 1)
            self.assertEqual({item['relativePath'] for item in report['images']}, {'a.PNG', 'subpasta/b.jpeg'})
            self.assertTrue(all('size' in item and 'modifiedNs' in item and 'dataless' in item for item in report['images']))
            self.assertNotIn(str(source), json.dumps(report))

    def test_private_output_refuses_repo_source_and_silent_overwrite(self):
        with tempfile.TemporaryDirectory() as temp:
            source = Path(temp) / 'IMAGENS'
            source.mkdir()
            report = INVENTORY.inventory(source)
            for output in (ROOT / '_nao_publicar_inventario.json', source / 'report.json'):
                with self.assertRaises(ValueError):
                    INVENTORY.write_private_report(report, output, source)
            output = Path(temp) / 'private/report.json'
            INVENTORY.write_private_report(report, output, source)
            self.assertTrue(output.is_file())
            with self.assertRaises(FileExistsError):
                INVENTORY.write_private_report(report, output, source)

    def test_inventory_limit_and_symlink_root_are_explicit(self):
        with tempfile.TemporaryDirectory() as temp:
            source = Path(temp) / 'IMAGENS'
            source.mkdir()
            for number in range(4):
                (source / f'{number}.png').write_bytes(b'fixture')
            report = INVENTORY.inventory(source, max_entries=1)
            self.assertTrue(report['truncated'])
            self.assertEqual(report['summary']['seen'], 1)
            alias = Path(temp) / 'alias'
            alias.symlink_to(source, target_is_directory=True)
            with self.assertRaises(ValueError):
                INVENTORY.inventory(alias)


if __name__ == '__main__':
    unittest.main()
