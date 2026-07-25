#!/usr/bin/env python3
"""Contratos isolados da Visualização Clara em RenalDose e SAPS 3."""

from __future__ import annotations

import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PAGES = (
    ROOT / "13_RenalDose_Antimicrobianos" / "index.html",
    ROOT / "14_SAPS3_Calculator" / "index.html",
)


def relative_luminance(hex_color: str) -> float:
    channels = [int(hex_color[index : index + 2], 16) / 255 for index in (1, 3, 5)]
    linear = [
        channel / 12.92
        if channel <= 0.04045
        else ((channel + 0.055) / 1.055) ** 2.4
        for channel in channels
    ]
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]


def contrast_ratio(foreground: str, background: str = "#ffffff") -> float:
    light = max(relative_luminance(foreground), relative_luminance(background))
    dark = min(relative_luminance(foreground), relative_luminance(background))
    return (light + 0.05) / (dark + 0.05)


class RenalSapsClarityTests(unittest.TestCase):
    def test_shared_preference_bootstraps_before_css(self) -> None:
        for page in PAGES:
            source = page.read_text(encoding="utf-8")
            with self.subTest(page=page.parent.name):
                self.assertGreaterEqual(source.count("antigravity:a11y:v1"), 2)
                self.assertLess(source.index("antigravity:a11y:v1"), source.index("<style>"))
                self.assertIn(
                    "savedTheme==='system'",
                    source,
                )
                self.assertIn("classList.toggle('a11y-contrast',contrastActive)", source)
                self.assertIn("classList.toggle('a11y-light',clarityActive)", source)

    def test_toggle_persists_safely_and_syncs_tabs(self) -> None:
        for page in PAGES:
            source = page.read_text(encoding="utf-8")
            with self.subTest(page=page.parent.name):
                self.assertRegex(
                    source,
                    r'<button class="clarity-toggle" id="clarity-toggle" type="button"'
                    r'[\s\S]*?aria-pressed="false"[\s\S]*?aria-label="Ativar visualização clara',
                )
                compact = "".join(source.split())
                self.assertIn(
                    "constupdated={...current,clarity:!clarityActive,"
                    "theme:clarityActive?'dark':'light'}",
                    compact,
                )
                self.assertIn("if(updated.clarity)updated.contrast=false", source)
                self.assertIn("window.addEventListener('storage'", source)
                self.assertIn("if(event.key===preferenceKey)", source)

    def test_light_mode_is_native_white_and_print_safe(self) -> None:
        for page in PAGES:
            source = page.read_text(encoding="utf-8")
            with self.subTest(page=page.parent.name):
                self.assertIn("html.a11y-light{", source)
                self.assertIn("--bg:#ffffff;--bg2:#f5f8fb;--bg3:#ffffff", source)
                self.assertIn('name="theme-color"', source)
                self.assertIn('name="apple-mobile-web-app-status-bar-style"', source)
                self.assertIn("@media print{", source)
                self.assertIn("print-color-adjust:exact", source)
                self.assertNotRegex(source, r"filter\s*:\s*invert\s*\(")
                self.assertNotRegex(source, r"backdrop-filter\s*:\s*invert\s*\(")
        renal_print = PAGES[0].read_text(encoding="utf-8").split("@media print{", 1)[1]
        self.assertIn(".stage-G2{background:#eef4ff!important;color:#175cd3!important}", renal_print)
        self.assertIn(".nav-actions{flex:1 1 100%", PAGES[0].read_text(encoding="utf-8"))

    def test_light_palette_meets_wcag_contrast_targets(self) -> None:
        text_colors = (
            "#102a43",
            "#455f73",
            "#263f56",
            "#006b7d",
            "#5946c7",
            "#087a55",
            "#855400",
            "#b4233f",
            "#9a4d00",
        )
        for color in text_colors:
            with self.subTest(color=color):
                self.assertGreaterEqual(contrast_ratio(color), 4.5)
        self.assertGreaterEqual(contrast_ratio("#71869a"), 3.0)

    def test_each_document_keeps_single_clinical_script_payload(self) -> None:
        renal = PAGES[0].read_text(encoding="utf-8")
        saps = PAGES[1].read_text(encoding="utf-8")
        self.assertEqual(len(re.findall(r"const DRUGS\s*=", renal)), 1)
        self.assertEqual(len(re.findall(r"function recalc\s*\(", saps)), 1)


if __name__ == "__main__":
    unittest.main()
