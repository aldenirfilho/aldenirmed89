#!/usr/bin/env python3
"""Contrato isolado da Visualização Clara no RespiraCrit e Vasoativas."""

from __future__ import annotations

import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RESPIRACRIT = ROOT / "01_Modulos_Clinicos/Ventilacao_Mecanica/respiracrit.html"
VASOATIVAS = ROOT / "01_UpDown_Hub/apps/vasoativas/index.html"


def relative_luminance(color: str) -> float:
    channels = [int(color[i : i + 2], 16) / 255 for i in (1, 3, 5)]
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


class ClarityRespiraCritVasoactiveTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.respiracrit = RESPIRACRIT.read_text(encoding="utf-8")
        cls.vasoactive = VASOATIVAS.read_text(encoding="utf-8")

    def test_bootstrap_prevents_dark_flash_and_contrast_wins(self) -> None:
        for source, style_marker in (
            (self.respiracrit, "<style>"),
            (self.vasoactive, '<link rel="stylesheet" href="../../assets/estudos.css"'),
        ):
            bootstrap = source[: source.index(style_marker)]
            self.assertIn("localStorage.getItem('antigravity:a11y:v1')", bootstrap)
            self.assertIn("if (prefs.contrast === true)", bootstrap)
            self.assertIn("prefs.theme === 'system'", bootstrap)
            self.assertIn("classList.add('a11y-contrast')", bootstrap)
            self.assertIn("classList.add('a11y-light')", bootstrap)
            self.assertIn("themeMeta.content = '#000000'", bootstrap)
            self.assertIn("themeMeta.content = '#ffffff'", bootstrap)
            self.assertIn("statusMeta.content = 'default'", bootstrap)

    def test_controls_persist_unknown_preferences_and_sync_tabs(self) -> None:
        for source, state_name, resolver in (
            (
                self.respiracrit,
                "respiracritA11yPreferences",
                "respiraCritClarityEnabled",
            ),
            (
                self.vasoactive,
                "vasoactiveA11yPreferences",
                "vasoactiveClarityEnabled",
            ),
        ):
            self.assertIn('id="clarity-toggle"', source)
            self.assertIn('aria-pressed="false"', source)
            self.assertIn(
                'aria-label="Ativar visualização clara com fundo branco"',
                source,
            )
            self.assertIn(
                "const A11Y_PREFERENCES_KEY = 'antigravity:a11y:v1'",
                source,
            )
            self.assertIn(
                f"const clarityActive = {resolver}(current)",
                source,
            )
            compact = "".join(source.split())
            self.assertIn(
                (
                    f"{state_name}={{...current,clarity:!clarityActive,"
                    "theme:clarityActive?'dark':'light'}"
                ),
                compact,
            )
            self.assertIn(f"if ({state_name}.clarity) {state_name}.contrast = false", source)
            self.assertIn("window.addEventListener('storage'", source)
            self.assertIn("event.key !== A11Y_PREFERENCES_KEY", source)
            self.assertIn("JSON.stringify(", source)
            self.assertIn("themeMeta?.setAttribute('content'", source)
            self.assertIn("statusMeta?.setAttribute('content'", source)

    def test_light_palette_meets_wcag_aa_and_prints_on_white(self) -> None:
        for source in (self.respiracrit, self.vasoactive):
            for color in (
                "#102a43",
                "#536b7d",
                "#006b7d",
                "#087a55",
                "#855400",
                "#b4233f",
            ):
                self.assertIn(color, source)
                self.assertGreaterEqual(contrast_ratio(color), 4.5)
            self.assertIn("#71869a", source)
            self.assertGreaterEqual(contrast_ratio("#71869a"), 3)
            self.assertIn("html.a11y-light", source)
            self.assertIn("html.a11y-contrast", source)
            self.assertIn("@media print", source)
            self.assertIn("background:#fff!important", source.replace(" ", ""))
            self.assertIn("outline", source)
        self.assertIn("#5946c7", self.respiracrit)
        self.assertGreaterEqual(contrast_ratio("#5946c7"), 4.5)

    def test_respiracrit_canvas_uses_theme_tokens_and_redraws_for_print(self) -> None:
        for token in (
            "--chart-bg",
            "--chart-grid",
            "--chart-text",
            "--chart-muted",
            "--chart-pressure",
            "--chart-flow",
            "--chart-volume",
            "--chart-loop",
            "--chart-loop-grid",
        ):
            self.assertIn(f"chartColor('{token}')", self.respiracrit)
        self.assertIn("window.addEventListener('beforeprint'", self.respiracrit)
        self.assertIn("classList.add('print-light')", self.respiracrit)
        self.assertIn("window.addEventListener('afterprint'", self.respiracrit)
        self.assertIn("classList.remove('print-light')", self.respiracrit)
        self.assertIn("drawCurve(activeWaveType)", self.respiracrit)
        self.assertIn('role="img" aria-labelledby="wave-label"', self.respiracrit)
        self.assertIn("canvas.setAttribute('aria-label'", self.respiracrit)
        self.assertIn("button.setAttribute('aria-pressed'", self.respiracrit)
        self.assertNotIn("ctx.fillStyle='#18222e'", self.respiracrit)
        self.assertNotIn("ctx.strokeStyle='#1e2d3d'", self.respiracrit)
        print_css = self.respiracrit[self.respiracrit.index("@media print") :]
        for selector in (
            ".alert-danger",
            ".alert-warn",
            ".alert-ok",
            ".alert-info",
            ".alert-purple",
        ):
            self.assertIn(selector, print_css)

    def test_vasoactive_print_tokens_and_tabs_are_accessible(self) -> None:
        print_css = self.vasoactive[self.vasoactive.index("@media print") :]
        for token in ("--bg2: #fff", "--muted: #455f73", "--accent: #006b7d"):
            self.assertIn(token, print_css)
        self.assertIn('role="tablist"', self.vasoactive)
        self.assertIn('role="tab"', self.vasoactive)
        self.assertIn("setAttribute('aria-selected'", self.vasoactive)

    def test_visual_change_does_not_replace_clinical_calculations(self) -> None:
        self.assertIn("const pf = Math.round(po2 / fio2);", self.respiracrit)
        self.assertIn("const dp = pplat - peep;", self.respiracrit)
        self.assertIn(
            "const concentration = (totalMass * (drug.unit.includes('mcg') ? 1000 : 1)) / finalVol;",
            self.vasoactive,
        )
        self.assertIn(
            "result = (dose * weight * 60) / concentration;",
            self.vasoactive,
        )
        self.assertIn(
            '<link rel="stylesheet" href="../../assets/estudos.css" />',
            self.vasoactive,
        )


if __name__ == "__main__":
    unittest.main()
