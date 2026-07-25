#!/usr/bin/env python3
"""Contratos isolados da Visualização Clara nos módulos críticos."""

from __future__ import annotations

import base64
import hashlib
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MODULES = {
    "hematologia": ROOT / "01_Modulos_Clinicos/Hematologia_Critica/index.html",
    "reumatologia": ROOT / "01_Modulos_Clinicos/Reumatologia_Critica/index.html",
}


def inline_block(source: str, tag: str, marker: str) -> str:
    match = re.search(
        rf"<{tag} {re.escape(marker)}>([\s\S]*?)</{tag}>",
        source,
    )
    if not match:
        raise AssertionError(f"Bloco {marker!r} ausente")
    return match.group(1)


def csp_hash(payload: str) -> str:
    digest = hashlib.sha256(payload.encode("utf-8")).digest()
    return "sha256-" + base64.b64encode(digest).decode("ascii")


def relative_luminance(color: str) -> float:
    channels = [
        int(color.lstrip("#")[offset:offset + 2], 16) / 255
        for offset in (0, 2, 4)
    ]
    linear = [
        channel / 12.92
        if channel <= 0.04045
        else ((channel + 0.055) / 1.055) ** 2.4
        for channel in channels
    ]
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]


def contrast_ratio(first: str, second: str = "#ffffff") -> float:
    first_luminance = relative_luminance(first)
    second_luminance = relative_luminance(second)
    lighter = max(first_luminance, second_luminance)
    darker = min(first_luminance, second_luminance)
    return (lighter + 0.05) / (darker + 0.05)


class CriticalModulesClarityTests(unittest.TestCase):
    def setUp(self) -> None:
        self.sources = {
            name: path.read_text(encoding="utf-8")
            for name, path in MODULES.items()
        }

    def test_bootstrap_is_csp_authorized_and_runs_before_styles(self) -> None:
        for name, source in self.sources.items():
            with self.subTest(module=name):
                bootstrap = inline_block(source, "script", "data-clarity-bootstrap")
                styles = inline_block(source, "style", "data-clarity-styles")
                controller = inline_block(source, "script", "data-clarity-controller")
                csp = re.search(
                    r'<meta http-equiv="Content-Security-Policy" content="([^"]+)">',
                    source,
                )
                self.assertIsNotNone(csp)
                policy = csp.group(1)
                self.assertIn(csp_hash(bootstrap), policy)
                self.assertIn(csp_hash(styles), policy)
                self.assertIn(csp_hash(controller), policy)
                self.assertNotIn("'unsafe-inline'", policy)
                self.assertLess(
                    source.index("data-clarity-bootstrap"),
                    source.index('rel="stylesheet"'),
                )
                self.assertIn('const globalKey = "antigravity:a11y:v1"', bootstrap)
                self.assertIn("const contrast = preferences.contrast === true", bootstrap)
                self.assertIn("const clarity = !contrast &&", bootstrap)
                self.assertIn('legacyTheme === "light"', bootstrap)
                self.assertIn("legacyTheme === '\"light\"'", bootstrap)
                self.assertIn('preferences.theme === "system"', bootstrap)

    def test_accessible_control_preserves_unknown_preferences_and_syncs(self) -> None:
        expected_legacy_keys = {
            "hematologia": "hemato-theme",
            "reumatologia": "reuma-theme",
        }
        for name, source in self.sources.items():
            with self.subTest(module=name):
                self.assertIn(
                    f'data-legacy-theme-key="{expected_legacy_keys[name]}"',
                    source,
                )
                self.assertRegex(
                    source,
                    r'<button class="icon-button" id="themeToggle" '
                    r'data-clarity-toggle type="button" aria-pressed="false" '
                    r'aria-label="Ativar visualização clara com fundo branco"',
                )
                controller = inline_block(
                    source,
                    "script",
                    "data-clarity-controller",
                )
                self.assertRegex(
                    controller,
                    r"const updated = \{\s*\.\.\.current\.preferences,\s*"
                    r"clarity: !clarity,\s*theme: clarity \? \"dark\" : \"light\"\s*\}",
                )
                self.assertIn("if (updated.clarity) updated.contrast = false", controller)
                self.assertIn('value === \'"light"\'', controller)
                self.assertIn('theme === "system"', controller)
                self.assertIn(
                    'localStorage.setItem(globalKey, JSON.stringify(updated))',
                    controller,
                )
                self.assertIn(
                    'button?.addEventListener("click", toggleClarity, true)',
                    controller,
                )
                storage_handler = controller.split(
                    'window.addEventListener("storage"',
                    1,
                )[1].split("});", 1)[0]
                self.assertIn("applyState(currentState(event.newValue))", storage_handler)
                self.assertNotIn("localStorage.setItem", storage_handler)

    def test_white_palette_focus_and_print_meet_contrast_contracts(self) -> None:
        required_text_colors = (
            "#102a43",
            "#334e68",
            "#536b7d",
            "#b4233f",
            "#855400",
            "#087a55",
            "#006b7d",
            "#5946c7",
        )
        for name, source in self.sources.items():
            with self.subTest(module=name):
                styles = inline_block(source, "style", "data-clarity-styles")
                self.assertIn("--bg: #ffffff", styles)
                self.assertIn("--panel: #ffffff", styles)
                self.assertIn("--line: #71869a", styles)
                self.assertIn("outline-color: #855400", styles)
                self.assertIn("html.a11y-contrast", styles)
                self.assertIn("@media print", styles)
                self.assertIn("background: #ffffff !important", styles)
                self.assertIn("break-inside: avoid", styles)
                self.assertIn("--card-accent: #9a3412", styles)
                self.assertIn("color: #704600 !important", styles)
                self.assertIn("border-color: #855400 !important", styles)
                for color in required_text_colors:
                    self.assertIn(color, styles)
                    self.assertGreaterEqual(
                        contrast_ratio(color),
                        4.5,
                        f"{name}: {color} não alcança contraste AA no branco",
                    )
                self.assertGreaterEqual(contrast_ratio("#71869a"), 3)

    def test_clinical_catalogs_and_shared_logic_are_unchanged(self) -> None:
        expected_hashes = {
            "01_Modulos_Clinicos/Hematologia_Critica/assets/app.js":
                "86617850026e41a5b4804242398ab14c58b0c7dd6bf6346530cd496df95bd984",
            "01_Modulos_Clinicos/Hematologia_Critica/data/catalog.js":
                "0211a3cf95cf95144ff198a90e926f63d78371623e64a65a46383f8d7c8a1368",
            "01_Modulos_Clinicos/Reumatologia_Critica/data/catalog.js":
                "8603c9a0e7517537a49f3ad05b19e7f017f0bb50965006762928f51f43e3d076",
        }
        for relative, expected in expected_hashes.items():
            with self.subTest(file=relative):
                payload = (ROOT / relative).read_bytes()
                self.assertEqual(hashlib.sha256(payload).hexdigest(), expected)
        self.assertEqual(self.sources["hematologia"].count('src="data/catalog.js"'), 1)
        self.assertEqual(self.sources["hematologia"].count('src="assets/app.js"'), 1)
        self.assertEqual(self.sources["reumatologia"].count('src="data/catalog.js"'), 1)
        self.assertEqual(
            self.sources["reumatologia"].count(
                'src="../Hematologia_Critica/assets/app.js"'
            ),
            1,
        )


if __name__ == "__main__":
    unittest.main()
