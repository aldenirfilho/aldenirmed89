#!/usr/bin/env python3
"""Regressões de segurança dos SVGs publicados e recuperados."""

from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class PublishedSvgSafetyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.scanner = load_module(
            "card_feed_svg_scanner",
            ROOT / "scripts_admin/scan_card_feed.py",
        )

    def assert_scanner_rejects(self, source: str) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            public = Path(temporary) / "public"
            public.mkdir()
            (public / "card.svg").write_text(source, encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "SVG público inseguro"):
                self.scanner.collect_public_files(public)

    def test_scanner_rejects_active_external_and_obfuscated_svg_content(self) -> None:
        unsafe_sources = {
            "script": (
                '<svg xmlns="http://www.w3.org/2000/svg">'
                '<script>alert(1)</script></svg>'
            ),
            "onload": '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>',
            "foreign-object": (
                '<svg xmlns="http://www.w3.org/2000/svg">'
                '<foreignObject><div>HTML</div></foreignObject></svg>'
            ),
            "javascript-href": (
                '<svg xmlns="http://www.w3.org/2000/svg">'
                '<use href="javascript:alert(1)"/></svg>'
            ),
            "external-href": (
                '<svg xmlns="http://www.w3.org/2000/svg">'
                '<use href="https://example.test/card.svg#item"/></svg>'
            ),
            "data-href": (
                '<svg xmlns="http://www.w3.org/2000/svg">'
                '<use href="data:image/svg+xml;base64,PHN2Zy8+"/></svg>'
            ),
            "external-src": (
                '<svg xmlns="http://www.w3.org/2000/svg">'
                '<rect src="https://example.test/pixel"/></svg>'
            ),
            "entity-obfuscated-href": (
                '<svg xmlns="http://www.w3.org/2000/svg">'
                '<use href="jav&#x61;script:alert(1)"/></svg>'
            ),
            "css-url": (
                '<svg xmlns="http://www.w3.org/2000/svg">'
                '<rect style="fill:url(https://example.test/pixel)"/></svg>'
            ),
            "css-import": (
                '<svg xmlns="http://www.w3.org/2000/svg">'
                '<rect style="fill:red;@import url(//example.test/a.css)"/></svg>'
            ),
            "css-escaped-url": (
                '<svg xmlns="http://www.w3.org/2000/svg">'
                '<rect style="fill:\\75rl(https://example.test/pixel)"/></svg>'
            ),
            "stylesheet-processing-instruction": (
                '<?xml-stylesheet href="https://example.test/a.css"?>'
                '<svg xmlns="http://www.w3.org/2000/svg"/>'
            ),
            "doctype-entity": (
                '<!DOCTYPE svg [<!ENTITY payload "javascript:alert(1)">]>'
                '<svg xmlns="http://www.w3.org/2000/svg"><use href="&payload;"/></svg>'
            ),
        }
        for label, source in unsafe_sources.items():
            with self.subTest(label=label):
                self.assert_scanner_rejects(source)

    def test_scanner_accepts_declarative_svg_with_only_local_references(self) -> None:
        safe = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" role="img">
          <title>Card seguro</title>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5"
                    markerWidth="6" markerHeight="6" orient="auto">
              <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke"/>
            </marker>
            <mask id="fade"><rect width="20" height="20" fill="white"/></mask>
          </defs>
          <line x1="1" y1="1" x2="19" y2="19" mask="url(#fade)"
                marker-end="url(#arrow)"
                style="stroke:rgb(55, 138, 221);stroke-width:2px;opacity:1"/>
        </svg>"""
        with tempfile.TemporaryDirectory() as temporary:
            public = Path(temporary) / "public"
            public.mkdir()
            (public / "safe.svg").write_text(safe, encoding="utf-8")
            files, conflicts = self.scanner.collect_public_files(public)
        self.assertEqual(files, ["safe.svg"])
        self.assertEqual(conflicts, [])

    def test_public_builder_also_rejects_allowlisted_active_svg(self) -> None:
        builder = load_module(
            "card_feed_svg_public_builder",
            ROOT / "scripts_admin/build_public_site.py",
        )
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            public = root / "05_Midia_E_Feed/assets/cards/public/recovered/uti-geral"
            public.mkdir(parents=True)
            unsafe = public / "unsafe.svg"
            unsafe.write_text(
                '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>',
                encoding="utf-8",
            )
            relative = unsafe.relative_to(root).as_posix()
            with self.assertRaisesRegex(ValueError, "SVG aprovado inseguro"):
                builder.validate_card_public_assets(root, {relative})


class HistoricalSvgIntegrityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.svg_safety = load_module(
            "historical_svg_safety",
            ROOT / "scripts_admin/svg_safety.py",
        )
        cls.recovery = load_module(
            "historical_svg_recovery",
            ROOT / "scripts_admin/prepare_card_feed_recovery.py",
        )

    def test_existing_svg_target_requires_safe_content_and_expected_hash(self) -> None:
        safe = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10"/></svg>'
        with tempfile.TemporaryDirectory() as temporary:
            target = Path(temporary) / "target.svg"
            target.write_text(safe, encoding="utf-8")
            expected = self.svg_safety.sha256_file(target)
            self.svg_safety.validate_svg_integrity(target, expected)

            target.write_text(safe.replace('width="10"', 'width="11"'), encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "integridade do SVG divergente"):
                self.svg_safety.validate_svg_integrity(target, expected)

            active = '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>'
            target.write_text(active, encoding="utf-8")
            active_hash = self.svg_safety.sha256_file(target)
            with self.assertRaisesRegex(ValueError, "manipulador de evento"):
                self.svg_safety.validate_svg_integrity(target, active_hash)

    def test_historical_target_hash_is_pinned_for_known_svg_source(self) -> None:
        source_hash = "a42f2c4b5d11ce40a7e65368184b5e14b82403246b632f7df38879fe603be88d"
        target = (
            ROOT
            / "05_Midia_E_Feed/assets/cards/public/recovered/uti-geral"
            / "vg70-curvas-retencao-detalhadas-a42f2c4b5d.svg"
        )
        self.recovery.validate_historical_svg_target(target, source_hash)

        with tempfile.TemporaryDirectory() as temporary:
            altered = Path(temporary) / target.name
            altered.write_bytes(target.read_bytes().replace(b'width="100%"', b'width="99%"', 1))
            with self.assertRaisesRegex(ValueError, "integridade do SVG divergente"):
                self.recovery.validate_historical_svg_target(altered, source_hash)

        with self.assertRaisesRegex(ValueError, "allowlist"):
            self.recovery.validate_historical_svg_target(target, "0" * 64)


if __name__ == "__main__":
    unittest.main()
