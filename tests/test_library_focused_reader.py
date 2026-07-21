#!/usr/bin/env python3
"""Regressões direcionadas do Leitor Focado da Biblioteca IA."""

from __future__ import annotations

import json
import shutil
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
LIBRARY = ROOT / "02_Biblioteca_IA_Engine"
INDEX = (LIBRARY / "index.html").read_text(encoding="utf-8")
READER = (LIBRARY / "assets/library-focused-reader.js").read_text(encoding="utf-8")
BUILDER = (ROOT / "scripts_admin/build_library_previews.py").read_text(encoding="utf-8")


def node_binary() -> str | None:
    executable = shutil.which("node")
    if executable:
        return executable
    bundled = (
        Path.home()
        / ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
    )
    return str(bundled) if bundled.is_file() else None


class FocusedReaderStaticTests(unittest.TestCase):
    def test_controls_and_all_exports_are_wired(self) -> None:
        for marker in (
            'assets/library-focused-reader.css',
            'assets/library-focused-reader.js',
            'id="readerFocusToggle"',
            'id="readerWidth"',
            'id="readerFont"',
            'id="readerTheme"',
            'id="readerSearch"',
            'id="readerAddHighlight"',
            'id="readerExportMarkdown"',
            'id="readerExportJSON"',
            'id="readerExportHTML"',
        ):
            self.assertIn(marker, INDEX)
        for marker in (
            "serializeMarkdown(payload)",
            "serializeHTML(payload)",
            "antigravity-library-highlights-v1",
            "sourceSha256",
            "previewSha256",
        ):
            self.assertIn(marker, READER)

    def test_trusted_and_isolated_sandboxes_remain_separate(self) -> None:
        reset = INDEX.split("function resetPreviewFrame", 1)[1].split(
            "function previewMessage", 1
        )[0]
        self.assertIn("mode === 'trusted'", reset)
        self.assertIn("allow-downloads allow-same-origin", reset)
        self.assertIn("allow-downloads allow-popups", reset)
        self.assertNotIn("allow-scripts", reset)
        self.assertNotIn("allow-forms", reset)

        html_branch = INDEX.split("} else if (['html','htm'].includes(ext))", 1)[1].split(
            "} else if (ext === 'pages')", 1
        )[0]
        self.assertIn("resetPreviewFrame('isolated')", html_branch)
        self.assertIn("HTML arbitrário permanece isolado", html_branch)
        self.assertNotIn("resetPreviewFrame('trusted')", html_branch)

    def test_trusted_preview_requires_local_path_and_both_hashes(self) -> None:
        validator = INDEX.split("function validateTrustedPreview", 1)[1].split(
            "function setTrustedGeneratedPreview", 1
        )[0]
        self.assertIn(
            "/^previews\\/(?:docx|pdf|pages)-[0-9a-f]{20}\\.html$/",
            validator,
        )
        self.assertIn("sourceSha256 !== itemSha256", validator)
        self.assertIn("/^[0-9a-f]{64}$/.test(previewSha256)", validator)
        self.assertIn("entry.browserIndependent !== true", validator)
        self.assertIn("entry.documentId", validator)

    def test_generated_and_inline_surfaces_have_explicit_reader_root(self) -> None:
        self.assertIn('data-reader-content="true"', BUILDER)
        self.assertGreaterEqual(INDEX.count('data-reader-content="true"'), 3)
        self.assertIn("default-src 'none'", BUILDER)
        self.assertNotIn("allow-scripts", BUILDER)

    def test_ocr_ready_and_ocr_required_have_distinct_reader_paths(self) -> None:
        self.assertIn("stats.ocrReady === true", READER)
        self.assertIn("metadata.status === 'ocr-ready'", READER)
        self.assertIn("metadata.status === 'ocr-required'", READER)
        self.assertIn("OCR necessário", READER)
        self.assertIn("confira no original", READER)
        self.assertIn("format === 'pages'", READER)


@unittest.skipUnless(node_binary(), "Node.js indisponível para o teste funcional do leitor")
class FocusedReaderFunctionalTests(unittest.TestCase):
    def test_sha_ocr_exports_and_pending_note_guards(self) -> None:
        script_path = json.dumps(str(LIBRARY / "assets/library-focused-reader.js"))
        harness = f"""
const assert = require('assert');
const values = new Map();
global.localStorage = {{
  getItem: key => values.has(key) ? values.get(key) : null,
  setItem: (key, value) => values.set(key, String(value))
}};
global.document = {{
  getElementById: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {{}},
  visibilityState: 'visible'
}};
global.window = {{ addEventListener: () => {{}} }};
global.confirm = () => true;
require({script_path});

const reader = window.LibraryFocusedReader.create({{}});
const sourceSha = 'a'.repeat(64);
reader.item = {{ id: 'doc-1', path: 'acervo/tema/doc.pdf', title: 'Documento', sourceSha256: sourceSha }};
reader.previewMetadata = {{ previewSha256: 'b'.repeat(64), renderer: 'fixture', previewFormat: 'pdf' }};
let payload = reader.getDocumentRecord(true);
assert(payload);
assert.strictEqual(payload.record.sourceSha256, sourceSha);

reader.item = {{ id: 'sem-sha', path: 'acervo/tema/sem-sha.pdf', sourceSha256: '' }};
assert.strictEqual(reader.getDocumentRecord(true), null);

reader.root = {{ textContent: 'OCR necessário é apenas uma mensagem explicativa longa.' }};
reader.previewMetadata = {{ previewFormat: 'pdf', status: 'ocr-required', stats: {{ ocrRequired: true, ocrReady: false, nativeVisibleCharacters: 0 }} }};
assert.strictEqual(reader.determineTextAvailability(), false);
reader.previewMetadata = {{ previewFormat: 'pdf', status: 'ocr-ready', stats: {{ ocrRequired: true, ocrReady: true, ocrVisibleCharacters: 120 }} }};
assert.strictEqual(reader.determineTextAvailability(), true);
reader.previewMetadata = {{ previewFormat: 'pages', stats: {{}} }};
assert.strictEqual(reader.determineTextAvailability(), false);
reader.previewMetadata = {{ previewFormat: 'docx', stats: {{ characters: 120 }} }};
assert.strictEqual(reader.determineTextAvailability(), true);

const exported = {{
  exportedAt: '2026-07-21T00:00:00Z',
  document: {{ title: '<script>alert(1)</script>', path: 'acervo/doc.md', sourceSha256: sourceSha }},
  highlights: [{{ color: 'yellow', quote: '<img src=x onerror=alert(1)>', note: '[x](javascript:alert(2)) <script>x</script>' }}]
}};
const markdown = reader.serializeMarkdown(exported);
assert(!markdown.includes('<script>'));
assert(!markdown.includes('](javascript:'));
const html = reader.serializeHTML(exported);
assert(html.includes("default-src 'none'"));
assert(html.includes('&lt;script&gt;'));
assert(!html.includes('<script>'));

reader.item = {{ id: 'doc-1', path: 'acervo/tema/doc.pdf', title: 'Documento', sourceSha256: sourceSha }};
reader.previewMetadata = {{ previewSha256: 'b'.repeat(64), renderer: 'fixture', previewFormat: 'pdf' }};
payload = reader.getDocumentRecord(true);
payload.record.highlights = [{{ id: 'h1', start: 0, end: 5, quote: 'texto', prefix: '', suffix: '', color: 'yellow', note: '', sourceSha256: sourceSha }}];
reader.writeStore(payload.store);
reader.pendingNotes.set('h1', 'nota ainda não salva');
reader.writeStore = () => false;
assert.strictEqual(reader.closeDocument(), false);
assert(reader.item);
assert(reader.pendingNotes.has('h1'));
process.stdout.write('ok');
"""
        result = subprocess.run(
            [node_binary(), "-e", harness],
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
            timeout=30,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout, "ok")


if __name__ == "__main__":
    unittest.main()
