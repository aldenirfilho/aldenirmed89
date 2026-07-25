#!/usr/bin/env python3
"""Contratos do fallback de tema para MediaQueryList legado no Safari/iOS."""

from __future__ import annotations

import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SURFACES = {
    "calculadoras/sodio-disnatremia.html":
        ("systemTheme", "handleSystemThemeChange"),
    "apps/index.html":
        ("systemTheme", "handleSystemThemeChange"),
    "calculadoras/bicarbonato-albumina.html":
        ("systemTheme", "handleSystemThemeChange"),
    "03_Calculadoras_E_Apps/index.html":
        ("systemTheme", "handleSystemThemeChange"),
    "14_SAPS3_Calculator/index.html":
        ("systemTheme", "handleSystemThemeChange"),
    "01_UpDown_Hub/apps/vasoativas/index.html":
        ("vasoactiveSystemTheme", "handleVasoactiveSystemThemeChange"),
    "13_RenalDose_Antimicrobianos/index.html":
        ("systemTheme", "handleSystemThemeChange"),
    "07_Questoes_Comentadas/index.html":
        ("systemTheme", "handleSystemThemeChange"),
    "questoes/index.html":
        ("systemTheme", "handleSystemThemeChange"),
    "08_Transcricoes/index.html":
        ("systemTheme", "handleSystemThemeChange"),
    "04_Ebooks_Intensiva_Clinica/index.html":
        ("systemTheme", "handleSystemThemeChange"),
    "01_UpDown_Hub/index.html":
        ("systemTheme", "handleSystemThemeChange"),
    "02_Biblioteca_IA_Engine/index.html":
        ("systemTheme", "handleSystemThemeChange"),
    "09_POCUS_Hub/index.html":
        ("systemTheme", "handleSystemThemeChange"),
    "01_Modulos_Clinicos/Hematologia_Critica/index.html":
        ("systemTheme", "handleSystemThemeChange"),
    "01_Modulos_Clinicos/Ventilacao_Mecanica/respiracrit.html":
        ("respiracritSystemTheme", "handleRespiraCritSystemThemeChange"),
    "01_Modulos_Clinicos/Reumatologia_Critica/index.html":
        ("systemTheme", "handleSystemThemeChange"),
    "01_Modulos_Clinicos/Delirium_UTI/assets/app.js":
        ("systemTheme", "handleSystemThemeChange"),
    "01_Modulos_Clinicos/Ventilacao_Mecanica/respirasense/pwa.js":
        ("systemTheme", "handleSystemThemeChange"),
}


class SafariThemeFallbackTests(unittest.TestCase):
    def test_modern_and_legacy_media_query_listeners_are_mutually_exclusive(self) -> None:
        for relative, (media, handler) in SURFACES.items():
            with self.subTest(surface=relative):
                source = (ROOT / relative).read_text(encoding="utf-8")
                media_pattern = re.escape(media)
                handler_pattern = re.escape(handler)
                self.assertRegex(
                    source,
                    rf"const\s+{handler_pattern}\s*=\s*\(",
                )
                self.assertRegex(
                    source,
                    rf"if\s*\(\s*{media_pattern}\.addEventListener\s*\)\s*"
                    rf"\{{\s*{media_pattern}\.addEventListener\("
                    rf"['\"]change['\"]\s*,\s*{handler_pattern}\s*\);\s*"
                    rf"\}}\s*else\s*\{{\s*{media_pattern}\.addListener\?\.\("
                    rf"{handler_pattern}\s*\);\s*\}}",
                )
                self.assertNotRegex(
                    source,
                    rf"{media_pattern}\.addEventListener\?\.\("
                    rf"['\"]change['\"]",
                )


if __name__ == "__main__":
    unittest.main()
