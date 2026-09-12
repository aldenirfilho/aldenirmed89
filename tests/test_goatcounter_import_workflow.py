"""Regressões da importação privada; usa exclusivamente dados sintéticos."""
import contextlib
import importlib.util
import io
import json
import os
import stat
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('gc_import_workflow', ROOT / 'scripts_admin/import_goatcounter_daily.py')
gc = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gc)
CSV = b'2Path,Event,Session,Bot,Date\n/aldenirmed89/,false,synthetic-session,0,2026-09-11T12:00:00Z\n'


class ImportWorkflowTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.base = Path(self.tmp.name)
        self.repo = self.base / 'repo'
        (self.repo / 'data').mkdir(parents=True)
        (self.repo / 'data/site_manifest.json').write_text('{"routes":["index.html","unit/index.html"]}', encoding='utf-8')
        self.source = self.base / 'export real.csv'
        self.source.write_bytes(CSV)
        self.patch = patch.object(gc, 'ROOT', self.repo)
        self.patch.start()
        self.addCleanup(self.patch.stop)

    def test_default_output_next_to_source_and_compatible(self):
        target, result = gc.convert_file(self.source)
        self.assertEqual(target.parent, self.base)
        self.assertEqual(json.loads(target.read_text()), result)
        self.assertEqual(result['days'][0]['views'], 1)
        self.assertEqual(result['days'][0]['visitors'], 1)
        self.assertEqual(self.source.read_bytes(), CSV)
        self.assertNotIn('synthetic-session', target.read_text())

    def test_unique_default_names(self):
        first, _ = gc.convert_file(self.source)
        second, _ = gc.convert_file(self.source)
        self.assertNotEqual(first, second)

    @unittest.skipIf(os.name == 'nt', 'Permissões POSIX')
    def test_private_output_permissions(self):
        target, _ = gc.convert_file(self.source)
        self.assertEqual(stat.S_IMODE(target.stat().st_mode), 0o600)

    def test_no_overwrite(self):
        out = self.base / 'existing.json'
        out.write_text('preserve')
        with self.assertRaisesRegex(ValueError, 'sobrescrito'):
            gc.convert_file(self.source, out)
        self.assertEqual(out.read_text(), 'preserve')

    def test_output_inside_repo_rejected(self):
        with self.assertRaisesRegex(ValueError, 'fora do repositório'):
            gc.convert_file(self.source, self.repo / 'totals.json')

    def test_input_inside_repo_rejected(self):
        inside = self.repo / 'export.csv'
        inside.write_bytes(CSV)
        with self.assertRaisesRegex(ValueError, 'fora do repositório'):
            gc.convert_file(inside)

    def test_symlink_into_repository_rejected(self):
        inside = self.repo / 'export.csv'
        inside.write_bytes(CSV)
        link = self.base / 'linked.csv'
        link.symlink_to(inside)
        with self.assertRaisesRegex(ValueError, 'fora do repositório'):
            gc.convert_file(link)

    def test_placeholder_explained(self):
        with self.assertRaisesRegex(ValueError, 'apenas um exemplo'):
            gc.convert_file(Path('/caminho/privado/export.csv'))

    def test_missing_file_explained(self):
        with self.assertRaisesRegex(ValueError, 'não encontrado'):
            gc.convert_file(self.base / 'missing.csv')

    def test_directory_is_not_a_csv(self):
        with self.assertRaisesRegex(ValueError, 'pasta'):
            gc.convert_file(self.base)

    def test_compressed_file_rejected(self):
        source = self.base / 'export.csv.gz'
        source.write_bytes(b'compressed')
        with self.assertRaisesRegex(ValueError, 'descompactado'):
            gc.convert_file(source)

    def test_output_parent_must_exist(self):
        with self.assertRaisesRegex(ValueError, 'pasta de saída'):
            gc.convert_file(self.source, self.base / 'missing/total.json')

    def test_expands_home(self):
        with patch.dict(os.environ, {'HOME': str(self.base)}):
            target, _ = gc.convert_file(Path('~/export real.csv'))
        self.assertTrue(target.is_file())

    def test_csv_limit_before_read(self):
        with patch.object(gc, 'MAX_CSV_BYTES', 4), self.assertRaisesRegex(ValueError, '200 MB'):
            gc.convert_file(self.source)
        self.assertEqual(list(self.base.glob('*.json')), [])

    def test_json_limit_before_write(self):
        with patch.object(gc, 'MAX_JSON_BYTES', 4), self.assertRaisesRegex(ValueError, '5 MB'):
            gc.convert_file(self.source)
        self.assertEqual(list(self.base.glob('*.json')), [])

    def test_invalid_csv_does_not_create_output(self):
        self.source.write_text('wrong,format\n')
        with self.assertRaisesRegex(ValueError, 'versão 2'):
            gc.convert_file(self.source)
        self.assertEqual(list(self.base.glob('*.json')), [])

    def test_empty_valid_export_is_not_filled_with_zero(self):
        self.source.write_bytes(CSV.splitlines(keepends=True)[0])
        target, result = gc.convert_file(self.source)
        self.assertEqual(result['days'], [])
        self.assertTrue(target.exists())

    def test_network_path_excluded(self):
        raw = CSV.replace(b'/aldenirmed89/,', b'//example.invalid/aldenirmed89/,')
        result = gc.aggregate(raw, gc.route_allowlist({}))
        self.assertEqual(result['days'], [])
        self.assertEqual(result['source']['excludedRows'], 1)

    def test_traversal_in_manifest_rejected(self):
        allowed = gc.route_allowlist(['../private.html', '%2e%2e/private.html', './unit/index.html'])
        self.assertNotIn('/aldenirmed89/private.html', allowed)
        self.assertEqual(allowed['/aldenirmed89/unit/index.html'], '/aldenirmed89/unit/')

    def test_bom_supported(self):
        result = gc.aggregate(b'\xef\xbb\xbf' + CSV, gc.route_allowlist({}))
        self.assertEqual(result['days'][0]['views'], 1)

    def test_cli_legacy_arguments(self):
        out = self.base / 'legacy.json'
        with contextlib.redirect_stdout(io.StringIO()):
            gc.main(['--csv', str(self.source), '--output', str(out), '--timezone', 'UTC'])
        self.assertEqual(json.loads(out.read_text())['source']['timezone'], 'UTC')

    def test_cli_chooser_cancelled(self):
        message = io.StringIO()
        with patch.object(gc, 'choose_csv', return_value=None), contextlib.redirect_stdout(message):
            gc.main(['--choose-file'])
        self.assertIn('cancelada', message.getvalue())
        self.assertEqual(list(self.base.glob('*.json')), [])

    def test_mac_chooser_uses_arguments_without_shell(self):
        result = subprocess.CompletedProcess([], 0, stdout=str(self.source) + '\n')
        with patch.object(gc.sys, 'platform', 'darwin'), patch.object(gc.subprocess, 'run', return_value=result) as run:
            self.assertEqual(gc.choose_csv(), self.source)
        self.assertNotIn('shell', run.call_args.kwargs)
        self.assertEqual(run.call_args.args[0][0], '/usr/bin/osascript')

    def test_mac_native_cancellation(self):
        error = subprocess.CalledProcessError(1, [], stderr='User canceled. (-128)')
        with patch.object(gc.sys, 'platform', 'darwin'), patch.object(gc.subprocess, 'run', side_effect=error):
            self.assertIsNone(gc.choose_csv())

    def test_picker_on_other_platform_has_fallback(self):
        with patch.object(gc.sys, 'platform', 'linux'), self.assertRaisesRegex(ValueError, '--csv'):
            gc.choose_csv()

    def test_picker_timeout_explained(self):
        error = subprocess.TimeoutExpired([], 300)
        with patch.object(gc.sys, 'platform', 'darwin'), patch.object(gc.subprocess, 'run', side_effect=error), self.assertRaisesRegex(ValueError, 'cinco minutos'):
            gc.choose_csv()


if __name__ == '__main__':
    unittest.main()
