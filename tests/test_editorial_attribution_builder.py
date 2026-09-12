import importlib.util
import shutil
import subprocess
import tempfile
import unittest
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def load_builder():
    spec = importlib.util.spec_from_file_location(
        "editorial_attribution_builder",
        ROOT / "scripts_admin" / "build_public_site.py",
    )
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


class EditorialAttributionBuilderTests(unittest.TestCase):
    def test_injectors_preserve_inline_preview_templates_and_ignore_comment_closings(self):
        """A Biblioteca embeds complete HTML in JS strings, including </body>."""
        builder = load_builder()

        class InlineScripts(HTMLParser):
            def __init__(self):
                super().__init__(convert_charrefs=False)
                self.scripts = []
                self.current = None

            def handle_starttag(self, tag, attrs):
                if tag == 'script' and not dict(attrs).get('src'):
                    self.current = []

            def handle_data(self, data):
                if self.current is not None:
                    self.current.append(data)

            def handle_endtag(self, tag):
                if tag == 'script' and self.current is not None:
                    self.scripts.append(''.join(self.current))
                    self.current = None

        original = '''<!doctype html>
<html lang="pt-BR"><head><title>Biblioteca</title></head>
<body><main id="reader"></main>
<script id="preview-template">
function previewMessage(title) {
  return '<!doctype html><html><head><title>Prévia</title></head><body><main>' + title + '</main></body></html>';
}
// A string that fooled the old first-match injector: </body>
const templateComment = '<!-- fake </body> and </head> -->';
window.previewFactory = previewMessage;
</script>
<script>window.readerReady = typeof window.previewFactory === 'function';</script>
<!-- A closing tag inside a comment is not the document end: </body> -->
</body></html>
<!-- A trailing comment also defeats a last-match regex: </body> -->
'''
        before = InlineScripts()
        before.feed(original)
        analytics = {'enabled': False, 'siteCode': '', 'visitorCounterEnabled': False}
        for sequence in ('attribution', 'metadata', 'both'):
            with self.subTest(injector=sequence), tempfile.TemporaryDirectory() as directory:
                site = Path(directory)
                page = site / 'index.html'
                page.write_text(original, encoding='utf-8')
                if sequence in ('attribution', 'both'):
                    self.assertEqual(builder.inject_editorial_attribution(site), 1)
                if sequence in ('metadata', 'both'):
                    self.assertEqual(builder.inject_public_metadata(site, analytics), 1)
                result = page.read_text(encoding='utf-8')
                after = InlineScripts()
                after.feed(result)
                self.assertEqual(after.scripts, before.scripts)
                # Both additions belong after application scripts and before
                # the real closing body, not in a string or trailing comment.
                app_end = result.index("</script>", result.index('window.readerReady'))
                real_body_end = result.index('</body></html>\n<!-- A trailing')
                if sequence in ('attribution', 'both'):
                    marker = result.index(builder.EDITORIAL_ATTRIBUTION_MARKER)
                    self.assertLess(app_end, marker)
                    self.assertLess(marker, real_body_end)
                if sequence in ('metadata', 'both'):
                    marker = result.index('data-antigravity-analytics')
                    self.assertLess(app_end, marker)
                    self.assertLess(marker, real_body_end)
                node = shutil.which('node')
                if node:
                    script = site / 'application.js'
                    script.write_text('\n'.join(after.scripts), encoding='utf-8')
                    checked = subprocess.run([node, '--check', str(script)], capture_output=True, text=True)
                    self.assertEqual(checked.returncode, 0, checked.stderr)

    def test_injects_discreet_attribution_with_depth_aware_links(self):
        builder = load_builder()
        with tempfile.TemporaryDirectory() as directory:
            site = Path(directory)
            (site / "assets").mkdir()
            (site / "index.html").write_text(
                "<!doctype html><html><body><main>Home</main></body></html>",
                encoding="utf-8",
            )
            nested = site / "en" / "radar"
            nested.mkdir(parents=True)
            (nested / "index.html").write_text(
                "<!doctype html><html><body><main>Radar</main></body></html>",
                encoding="utf-8",
            )

            count = builder.inject_editorial_attribution(site)

            self.assertEqual(count, 2)
            root_html = (site / "index.html").read_text(encoding="utf-8")
            nested_html = (nested / "index.html").read_text(encoding="utf-8")
            self.assertIn(builder.EDITORIAL_ATTRIBUTION_MARKER, root_html)
            self.assertIn('href="19_Integridade_Editorial/"', root_html)
            self.assertIn('href="../../19_Integridade_Editorial/"', nested_html)
            self.assertIn('href="../../assets/editorial-attribution.css"', nested_html)
            self.assertLess(root_html.index("ATV · TURBO TEMI · ALD 360"), root_html.index("</body>"))

    def test_is_idempotent_and_handles_html_without_body(self):
        builder = load_builder()
        with tempfile.TemporaryDirectory() as directory:
            site = Path(directory)
            path = site / "fragment.html"
            path.write_text("<main>Fragmento</main>", encoding="utf-8")

            self.assertEqual(builder.inject_editorial_attribution(site), 1)
            self.assertEqual(builder.inject_editorial_attribution(site), 0)
            html = path.read_text(encoding="utf-8")
            self.assertEqual(html.count(builder.EDITORIAL_ATTRIBUTION_MARKER), 1)
            self.assertTrue(html.endswith("</footer>\n"))

    def test_does_not_inject_internal_attribution_code_into_dermatology(self):
        builder = load_builder()
        with tempfile.TemporaryDirectory() as directory:
            site = Path(directory)
            module = site / "01_Modulos_Clinicos" / "Dermatologia_Critica"
            module.mkdir(parents=True)
            page = module / "index.html"
            page.write_text(
                "<!doctype html><html><body><main>Dermatologia</main></body></html>",
                encoding="utf-8",
            )

            self.assertEqual(builder.inject_editorial_attribution(site), 0)
            html = page.read_text(encoding="utf-8")
            self.assertNotIn(builder.EDITORIAL_ATTRIBUTION_MARKER, html)
            self.assertNotIn("ATV-ALD-360", html)

    def test_public_css_exists_without_remote_dependencies(self):
        css = (ROOT / "assets" / "editorial-attribution.css").read_text(encoding="utf-8")
        self.assertIn(".antigravity-editorial-attribution", css)
        self.assertNotIn("http://", css)
        self.assertNotIn("https://", css)

    def test_only_public_provenance_leaves_editorial_control_directory(self):
        builder = load_builder()
        self.assertTrue(
            builder.should_skip(ROOT, ROOT / "data/editorial/registry.json")
        )
        self.assertTrue(
            builder.should_skip(ROOT, ROOT / "data/editorial/policy.json")
        )
        self.assertFalse(
            builder.should_skip(
                ROOT, ROOT / "data/editorial/editorial-provenance.json"
            )
        )

    def test_supabase_backend_is_excluded_without_hiding_the_public_crew_center(self):
        builder = load_builder()
        for relative in (
            '18_Centro_Tripulacao/supabase',
            '18_Centro_Tripulacao/supabase/schema.sql',
            '18_Centro_Tripulacao/supabase/functions/member-directory/index.ts',
        ):
            with self.subTest(path=relative):
                self.assertTrue(builder.should_skip(ROOT, ROOT / relative))
        self.assertFalse(builder.should_skip(ROOT, ROOT / '18_Centro_Tripulacao/index.html'))
        self.assertFalse(builder.should_skip(ROOT, ROOT / '18_Centro_Tripulacao/supabase-client.js'))


if __name__ == "__main__":
    unittest.main()
