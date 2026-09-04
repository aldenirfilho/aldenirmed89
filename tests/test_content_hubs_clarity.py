#!/usr/bin/env python3
"""Contrato isolado da Visualização Clara nos quatro hubs de conteúdo."""

from __future__ import annotations

import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SURFACES = (
    ROOT / "04_Ebooks_Intensiva_Clinica" / "index.html",
    ROOT / "07_Questoes_Comentadas" / "index.html",
    ROOT / "08_Transcricoes" / "index.html",
    ROOT / "09_POCUS_Hub" / "index.html",
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


class ContentHubsClarityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.sources = {
            path: path.read_text(encoding="utf-8")
            for path in SURFACES
        }

    def test_bootstrap_runs_before_shared_css_and_contrast_wins(self) -> None:
        for path, source in self.sources.items():
            with self.subTest(path=path):
                stylesheet = '<link rel="stylesheet" href="../assets/css/content-hub.css"/>'
                bootstrap = source[: source.index(stylesheet)]
                self.assertIn('localStorage.getItem("antigravity:a11y:v1")', bootstrap)
                self.assertIn("const contrast = prefs.contrast === true", bootstrap)
                self.assertIn(
                    'theme === "system"',
                    bootstrap,
                )
                self.assertIn(
                    'classList.toggle("a11y-contrast", contrast)',
                    bootstrap,
                )
                self.assertIn('classList.toggle("a11y-light", clarity)', bootstrap)
                self.assertIn(
                    'clarity ? "#ffffff" : contrast ? "#000000" : "#0b100c"',
                    bootstrap,
                )

    def test_toggle_preserves_unknown_fields_and_syncs_without_rewriting(self) -> None:
        for path, source in self.sources.items():
            with self.subTest(path=path):
                for marker in (
                    "data-clarity-toggle",
                    'aria-pressed="false"',
                    'aria-label="Ativar visualização clara com fundo branco"',
                    'const key = "antigravity:a11y:v1"',
                    "? {...parsed} : {}",
                    "preferences = readPreferences();",
                    "preferences.clarity = !clarity",
                    'preferences.theme = preferences.clarity ? "light" : "dark"',
                    "if (preferences.clarity) preferences.contrast = false",
                    "localStorage.setItem(key, JSON.stringify(preferences))",
                    'window.addEventListener("storage"',
                    "preferences = readPreferences(event.newValue)",
                ):
                    self.assertIn(marker, source)
                storage_handler = re.search(
                    r'window\.addEventListener\("storage", event => \{'
                    r'(?P<body>[\s\S]*?)\n\s{6}\}\);',
                    source,
                )
                self.assertIsNotNone(storage_handler)
                self.assertNotIn(
                    "localStorage.setItem",
                    storage_handler.group("body"),
                )

    def test_preview_is_modal_keyboard_safe_and_placeholder_is_explicit(self) -> None:
        shared_js = (ROOT / "assets/js/content-hub.js").read_text(encoding="utf-8")
        shared_css = (ROOT / "assets/css/content-hub.css").read_text(encoding="utf-8")
        for marker in (
            "previewReturnFocus",
            "setPreviewModalEnvironment",
            "trapPreviewTab",
            'event.key === "Escape"',
            'element.setAttribute("inert", "")',
            "previewReturnFocus.focus()",
        ):
            self.assertIn(marker, shared_js)
        self.assertIn(".control::placeholder{color:var(--muted);opacity:1}", shared_css)
        for path, source in self.sources.items():
            with self.subTest(path=path):
                self.assertIn('role="dialog"', source)
                self.assertIn('aria-modal="true"', source)
                self.assertIn('aria-hidden="true"', source)
                self.assertIn("data-preview-close", source)
                self.assertIn('title="Pré-visualização segura do documento"', source)
                self.assertRegex(source, r'id="search"[^>]+aria-label="[^"]+"')
                self.assertRegex(source, r'id="format-filter"[^>]+aria-label="[^"]+"')
                self.assertRegex(source, r'id="source-filter"[^>]+aria-label="[^"]+"')

    def test_light_palette_is_white_sharp_and_meets_contrast_targets(self) -> None:
        for path, source in self.sources.items():
            with self.subTest(path=path):
                light_css = source[
                    source.index("html.a11y-light{")
                    : source.index("@media print")
                ]
                self.assertIn("html.a11y-light body", light_css)
                self.assertIn("html.a11y-light .topbar", light_css)
                self.assertIn("html.a11y-light .card", light_css)
                self.assertIn("background:#fff", light_css)
                self.assertIn("border-color:#71869a", light_css)
                self.assertIn("outline-color:#855400", light_css)
                self.assertNotIn("filter:", light_css)
                self.assertNotIn("invert(", light_css)

        for color in (
            "#102a43",
            "#536b7d",
            "#006b7d",
            "#5946c7",
            "#087a55",
            "#855400",
            "#b4233f",
        ):
            with self.subTest(color=color):
                self.assertGreaterEqual(contrast_ratio(color), 4.5)
        self.assertGreaterEqual(contrast_ratio("#71869a"), 3)
        self.assertGreaterEqual(contrast_ratio("#806f54", "#1c271f"), 3)

    def test_print_is_white_and_mobile_control_remains_accessible(self) -> None:
        for path, source in self.sources.items():
            with self.subTest(path=path):
                print_css = source[source.index("@media print") : source.index("</style>")]
                self.assertIn("html.a11y-light", print_css)
                self.assertIn("html.a11y-contrast", print_css)
                self.assertIn(":root,html.a11y-light", print_css)
                self.assertIn("body{background:#fff!important", print_css)
                self.assertIn("Modo rústico", source)
                self.assertIn("print-color-adjust:exact", print_css)
                self.assertIn("break-inside:avoid", print_css)
                self.assertIn("@media(max-width:520px)", source)
                self.assertIn(".clarity-toggle{min-height:44px}", source)

    def test_existing_catalog_contract_remains_intact(self) -> None:
        required_markers = (
            '<link rel="stylesheet" href="../assets/css/content-hub.css"/>',
            '<script src="../assets/js/content-hub.js"></script>',
            'id="search"',
            'id="format-filter"',
            'id="source-filter"',
            'id="items-grid"',
            'id="preview"',
            'onclick="clearFilters()"',
            'onclick="closePreview()"',
        )
        for path, source in self.sources.items():
            with self.subTest(path=path):
                for marker in required_markers:
                    self.assertIn(marker, source)
                self.assertEqual(
                    source.count('<script src="../assets/js/content-hub.js"></script>'),
                    1,
                )


if __name__ == "__main__":
    unittest.main()
