#!/usr/bin/env python3
"""Contrato isolado da Visualização Clara nos hubs e calculadoras legadas."""

from __future__ import annotations

import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SURFACES = (
    ROOT / "apps/index.html",
    ROOT / "03_Calculadoras_E_Apps/index.html",
    ROOT / "calculadoras/sodio-disnatremia.html",
    ROOT / "calculadoras/bicarbonato-albumina.html",
)


def relative_luminance(color: str) -> float:
    channels = [int(color[i : i + 2], 16) / 255 for i in (1, 3, 5)]
    linear = [
        channel / 12.92
        if channel <= 0.04045
        else ((channel + 0.055) / 1.055) ** 2.4
        for channel in channels
    ]
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]


def contrast_ratio(foreground: str, background: str) -> float:
    lighter, darker = sorted(
        (relative_luminance(foreground), relative_luminance(background)),
        reverse=True,
    )
    return (lighter + 0.05) / (darker + 0.05)


class AppsCalculatorsClarityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.sources = {path: path.read_text(encoding="utf-8") for path in SURFACES}

    def test_bootstrap_runs_before_styles_and_contrast_has_precedence(self) -> None:
        for path, source in self.sources.items():
            with self.subTest(path=path):
                head_bootstrap = source[: source.index("<style>")]
                self.assertIn("antigravity:a11y:v1", head_bootstrap)
                self.assertIn("prefs?.contrast === true", head_bootstrap)
                self.assertIn("theme === 'system'", head_bootstrap)
                self.assertIn("classList.toggle('a11y-light', clarity)", head_bootstrap)
                self.assertIn("clarity ? '#ffffff' : contrast ? '#000000'", head_bootstrap)

    def test_accessible_toggle_preserves_unknown_preferences_and_syncs_tabs(self) -> None:
        for path, source in self.sources.items():
            with self.subTest(path=path):
                for marker in (
                    'data-clarity-toggle',
                    'aria-pressed="false"',
                    'aria-label="Ativar visualização clara com fundo branco"',
                ):
                    self.assertIn(marker, source)
                compact = re.sub(r"\s+", "", source)
                for marker in (
                    "const key='antigravity:a11y:v1'",
                    "prefs=readPrefs();",
                    "const clarityActive=clarityEnabled(prefs)",
                    "prefs.clarity=!clarityActive",
                    "prefs.theme=prefs.clarity?'light':'dark'",
                    "if(prefs.clarity)prefs.contrast=false",
                    "localStorage.setItem(key,JSON.stringify(prefs))",
                    "window.addEventListener('storage'",
                    "if(event.key!==key)return",
                    "themeMeta?.setAttribute('content'",
                    "statusMeta?.setAttribute('content'",
                ):
                    self.assertIn(marker.replace(" ", ""), compact)
                self.assertNotIn("Object.keys(default", source)

    def test_light_palette_is_white_sharp_and_does_not_filter_content(self) -> None:
        for path, source in self.sources.items():
            with self.subTest(path=path):
                light_css = source[
                    source.index("html.a11y-light")
                    : source.index("@media print")
                ]
                for selector in (
                    "html.a11y-light body",
                    "html.a11y-light .topbar",
                    "html.a11y-light .clarity-toggle",
                ):
                    self.assertIn(selector, light_css)
                self.assertRegex(light_css, r"background(?:-color)?:\s*#(?:fff|ffffff)")
                self.assertRegex(light_css, r"--control-border\s*:\s*#71869a")
                self.assertIn("outline-color:", light_css)
                self.assertNotRegex(light_css, r"(?<![-\w])filter\s*:")
                self.assertNotIn("invert(", light_css)

    def test_wcag_aa_palette_and_control_boundaries(self) -> None:
        palette = {
            "--text": "#102a43",
            "--muted": "#536b7d",
            "--cyan": "#006b7d",
            "--green": "#087a55",
            "--violet": "#5946c7",
            "--yellow": "#855400",
        }
        for path, source in self.sources.items():
            with self.subTest(path=path):
                for token, color in palette.items():
                    self.assertRegex(
                        source,
                        rf"{re.escape(token)}\s*:\s*{re.escape(color)}",
                    )
                    self.assertGreaterEqual(contrast_ratio(color, "#ffffff"), 4.5)
                self.assertGreaterEqual(contrast_ratio("#71869a", "#ffffff"), 3)

    def test_print_and_pdf_are_forced_to_readable_white(self) -> None:
        for path, source in self.sources.items():
            with self.subTest(path=path):
                print_css = source[source.index("@media print") : source.index("</style>")]
                self.assertIn("html.a11y-light", print_css)
                self.assertIn("html.a11y-contrast", print_css)
                self.assertRegex(print_css, r"body\s*\{\s*background:\s*#(?:fff|ffffff)\s*!important")
                self.assertIn(".clarity-toggle", print_css)
                self.assertIn("break-inside: avoid", print_css.replace("break-inside:avoid", "break-inside: avoid"))

    def test_narrow_headers_wrap_without_hiding_the_theme_control(self) -> None:
        for path, source in self.sources.items():
            with self.subTest(path=path):
                self.assertRegex(source, r"@media\s*\(max-width:\s*(?:520|900)px\)")
                compact = source.replace(" ", "")
                self.assertTrue(
                    "flex-wrap:wrap" in compact or "flex-direction:column" in compact,
                    f"cabeçalho móvel sem quebra segura: {path}",
                )

    def test_central_explains_rounding_and_interpretation_limits(self) -> None:
        source = self.sources[ROOT / "03_Calculadoras_E_Apps/index.html"]
        for marker in (
            'role="note"',
            'aria-label="Segurança clínica e interpretação dos resultados"',
            "resultado é uma conversão matemática dos valores digitados",
            "arredondamento exibido não valida peso, unidade, concentração, população ou indicação",
            "Não copie o resultado diretamente para uma prescrição",
        ):
            self.assertIn(marker, source)


if __name__ == "__main__":
    unittest.main()
