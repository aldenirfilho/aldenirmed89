#!/usr/bin/env python3
"""Contrato isolado da Visualização Clara nos três hubs de aprendizagem."""

from __future__ import annotations

import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SURFACES = (
    ROOT / "01_UpDown_Hub" / "index.html",
    ROOT / "02_Biblioteca_IA_Engine" / "index.html",
    ROOT / "questoes" / "index.html",
)


def relative_luminance(color: str) -> float:
    channels = [int(color[index : index + 2], 16) / 255 for index in (1, 3, 5)]
    linear = [
        channel / 12.92
        if channel <= 0.04045
        else ((channel + 0.055) / 1.055) ** 2.4
        for channel in channels
    ]
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]


def contrast_ratio(foreground: str, background: str = "#ffffff") -> float:
    lighter, darker = sorted(
        (relative_luminance(foreground), relative_luminance(background)),
        reverse=True,
    )
    return (lighter + 0.05) / (darker + 0.05)


class LearningHubsClarityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.sources = {
            path: path.read_text(encoding="utf-8")
            for path in SURFACES
        }

    def test_antiflash_bootstrap_precedes_visual_styles(self) -> None:
        for path, source in self.sources.items():
            with self.subTest(path=path):
                head = source[: source.index("</head>")]
                visual_starts = [
                    position
                    for marker in ("<style", '<link rel="stylesheet"')
                    if (position := head.find(marker)) >= 0
                ]
                self.assertTrue(visual_starts)
                bootstrap = head[: min(visual_starts)]
                for marker in (
                    "antigravity:a11y:v1",
                    "const contrast = prefs.contrast === true",
                    "theme === 'system'",
                    "classList.toggle('a11y-contrast', contrast)",
                    "classList.toggle('a11y-light', clarity)",
                    "style.colorScheme = clarity ? 'light' : 'dark'",
                    "clarity ? '#ffffff' : contrast ? '#000000'",
                ):
                    self.assertIn(marker, bootstrap)
                self.assertIn('meta name="theme-color"', bootstrap)
                self.assertIn('meta name="color-scheme"', bootstrap)

    def test_toggle_is_accessible_and_preserves_unknown_preferences(self) -> None:
        for path, source in self.sources.items():
            with self.subTest(path=path):
                self.assertEqual(source.count('id="clarity-toggle"'), 1)
                for marker in (
                    'class="clarity-toggle"',
                    'type="button"',
                    'aria-pressed="false"',
                    'aria-label="Ativar visualização clara com fundo branco"',
                    "const preferenceKey = 'antigravity:a11y:v1'",
                    "theme: clarity ? 'dark' : 'light'",
                    "localStorage.setItem(preferenceKey, JSON.stringify(",
                    "window.addEventListener('storage'",
                    "event.newValue",
                ):
                    self.assertIn(marker, source)

                self.assertRegex(
                    source,
                    r"if\s*\((?:next|preferences)\.clarity\)"
                    r"\s*(?:next|preferences)\.contrast\s*=\s*false",
                )

                storage_handler = re.search(
                    r"window\.addEventListener\('storage',\s*event\s*=>\s*\{"
                    r"(?P<body>[\s\S]*?)\n\s*\}\);",
                    source,
                )
                self.assertIsNotNone(storage_handler)
                storage_body = storage_handler.group("body")
                self.assertIn("event.newValue", storage_body)
                self.assertNotIn("setItem", storage_body)

    def test_white_palette_is_sharp_wcag_aa_and_filter_free(self) -> None:
        readable_colors = (
            "#102a43",
            "#536b7d",
            "#006b7d",
            "#087a55",
            "#855400",
            "#b4233f",
        )
        for path, source in self.sources.items():
            with self.subTest(path=path):
                light_selector = re.search(r"html\.a11y-light\s*\{", source)
                self.assertIsNotNone(light_selector)
                light_css = source[
                    light_selector.start()
                    : source.index("@media print", light_selector.start())
                ]
                self.assertRegex(
                    light_css,
                    r"html\.a11y-light body\s*\{[\s\S]*?"
                    r"background(?:-color)?\s*:[\s\S]*?#ffffff",
                )
                self.assertIn("#71869a", light_css)
                self.assertIn("focus-visible", light_css)
                self.assertIn("#855400", light_css)
                self.assertNotRegex(light_css, r"(?<![-\w])filter\s*:")
                self.assertNotIn("invert(", light_css)
                for color in readable_colors:
                    self.assertIn(color, light_css)

        for color in readable_colors:
            with self.subTest(color=color):
                self.assertGreaterEqual(contrast_ratio(color), 4.5)
        self.assertGreaterEqual(contrast_ratio("#71869a"), 3)

    def test_print_pdf_is_white_and_mobile_control_remains_available(self) -> None:
        for path, source in self.sources.items():
            with self.subTest(path=path):
                print_start = source.index("@media print")
                print_end = source.index("</style>", print_start)
                print_css = source[print_start:print_end]
                compact_print = re.sub(r"\s+", "", print_css)
                self.assertIn("html.a11y-light", print_css)
                self.assertIn("html.a11y-contrast", print_css)
                self.assertIn("body{background:#ffffff!important", compact_print)
                self.assertIn(".clarity-toggle", print_css)
                self.assertIn("break-inside:avoid", compact_print)
                self.assertIn("print-color-adjust:exact", compact_print)

                self.assertRegex(
                    source,
                    r"@media\s*\(max-width:\s*(?:480|560|760)px\)",
                )
                self.assertRegex(
                    source,
                    r"\.clarity-label\s*\{\s*display:\s*none",
                )
                self.assertRegex(
                    source,
                    r"\.clarity-toggle\s*\{[^}]*min-width:\s*44px",
                )

    def test_existing_learning_engines_remain_linked(self) -> None:
        expected_markers = {
            SURFACES[0]: (
                '<script src="assets/estudos.js"></script>',
                'id="searchInput"',
                'id="docsGrid"',
            ),
            SURFACES[1]: (
                '<script src="assets/library-focused-reader.js?v=20260721-ios-reader-1"></script>',
                "async function init()",
                "function switchView(v)",
                "init();",
            ),
            SURFACES[2]: (
                '<script src="data/hub_qbanks.js"></script>',
                'id="searchInput"',
                'id="qbankGrid"',
                "function renderCards()",
                "renderCards();",
            ),
        }
        for path, markers in expected_markers.items():
            source = self.sources[path]
            with self.subTest(path=path):
                for marker in markers:
                    self.assertIn(marker, source)


if __name__ == "__main__":
    unittest.main()
