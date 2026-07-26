import importlib.util
import tempfile
import unittest
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


if __name__ == "__main__":
    unittest.main()
