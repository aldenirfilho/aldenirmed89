#!/usr/bin/env python3
"""Regressões mínimas para os hotfixes clínicos e de segurança P0."""

from __future__ import annotations

import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class ClinicalSafetyRegressionTests(unittest.TestCase):
    def test_pbw_does_not_clamp_short_adult_height(self) -> None:
        source = (ROOT / "01_Modulos_Clinicos/Ventilacao_Mecanica/respirasense/app.js").read_text(
            encoding="utf-8"
        )
        match = re.search(
            r"function predictedBodyWeight\(sex,height\)\{(?P<body>.*?)\}\nfunction tidalTargets",
            source,
            flags=re.DOTALL,
        )
        self.assertIsNotNone(match, "Função PBW não encontrada")
        body = match.group("body")
        self.assertNotIn("Math.max", body, "PBW voltou a limitar alturas abaixo de 152,4 cm")

        constants = re.search(
            r"\?\s*([0-9.]+)\+([0-9.]+)\*\(h-([0-9.]+)\)\s*:\s*([0-9.]+)\+([0-9.]+)\*\(h-([0-9.]+)\)",
            body,
        )
        self.assertIsNotNone(constants, "Equações PBW esperadas não encontradas")
        female_base, female_coef, female_ref, male_base, male_coef, male_ref = map(
            float, constants.groups()
        )

        female_145 = female_base + female_coef * (145 - female_ref)
        male_145 = male_base + male_coef * (145 - male_ref)
        self.assertAlmostEqual(female_145, 38.766, places=3)
        self.assertAlmostEqual(male_145, 43.266, places=3)
        self.assertLess(female_145, female_base)
        self.assertLess(male_145, male_base)
        self.assertIn("PBW abaixo da faixa antropométrica mais bem validada", source)
        self.assertIn("não usar o valor isoladamente", source)
        self.assertIn("Não extrapolar esta calculadora para pacientes pediátricos", source)

    def test_psv_cycling_examples_match_direction(self) -> None:
        source = (ROOT / "01_Modulos_Clinicos/Ventilacao_Mecanica/respiracrit.html").read_text(
            encoding="utf-8"
        )
        self.assertIn("aumentar % ciclagem de fluxo (PSV: 25→50%)", source)
        self.assertIn("reduzir % ciclagem de fluxo (PSV: 50→25%)", source)
        self.assertNotIn("aumentar % ciclagem de fluxo (PSV: 50→25%)", source)
        self.assertNotIn("reduzir % ciclagem de fluxo (PSV: 25→50%)", source)

    def test_respiracrit_gas_analysis_uses_defined_ph_identifier(self) -> None:
        source = (ROOT / "01_Modulos_Clinicos/Ventilacao_Mecanica/respiracrit.html").read_text(
            encoding="utf-8"
        )
        match = re.search(
            r"function analyzeGas\(\)\s*\{(?P<body>.*?)\n\}\n\n// ============ SUPPORT LADDER",
            source,
            flags=re.DOTALL,
        )
        self.assertIsNotNone(match, "Função analyzeGas não encontrada")
        body = match.group("body")
        self.assertIn("const pH =", body)
        self.assertNotRegex(body, r"(?<![\w-])ph(?![\w-])")


class WebSecurityRegressionTests(unittest.TestCase):
    def test_respiracrit_does_not_send_clinical_data_from_browser(self) -> None:
        source = (ROOT / "01_Modulos_Clinicos/Ventilacao_Mecanica/respiracrit.html").read_text(
            encoding="utf-8"
        )
        self.assertNotIn("api.anthropic.com", source)
        self.assertIn("Nenhuma imagem clínica foi transmitida", source)
        self.assertIn("Nenhum dado clínico foi transmitido", source)

    def test_markdown_viewer_has_allowlist_and_no_raw_marked_sink(self) -> None:
        source = (ROOT / "01_UpDown_Hub/assets/markdown-viewer.js").read_text(encoding="utf-8")
        self.assertIn("function resolveDocumentUrl", source)
        self.assertIn("function sanitizeRenderedHtml", source)
        self.assertIn("documentUrl.origin !== location.origin", source)
        self.assertIn("documentUrl.pathname.startsWith(contentRoot.pathname)", source)
        self.assertNotRegex(source, r"body\.innerHTML\s*=\s*marked\.parse")
        self.assertNotRegex(source, r"meta\.innerHTML\s*=")

    def test_content_hub_previews_are_sandboxed(self) -> None:
        for relative in (
            "04_Ebooks_Intensiva_Clinica/index.html",
            "07_Questoes_Comentadas/index.html",
            "08_Transcricoes/index.html",
            "09_POCUS_Hub/index.html",
        ):
            source = (ROOT / relative).read_text(encoding="utf-8")
            self.assertRegex(
                source,
                r'<iframe id="preview-frame"[^>]*sandbox="allow-downloads"[^>]*referrerpolicy="no-referrer"',
                relative,
            )

    def test_content_hub_path_validation_is_fail_closed(self) -> None:
        source = (ROOT / "assets/js/content-hub.js").read_text(encoding="utf-8")
        self.assertIn("function safePath(path, allowExternal = false)", source)
        self.assertIn('segment === ".."', source)
        self.assertIn("resolved.origin !== window.location.origin", source)
        self.assertIn("!resolved.pathname.startsWith(base.pathname)", source)
        self.assertIn('frame.setAttribute("sandbox", "allow-downloads")', source)

    def test_biblioteca_catalog_and_preview_escape_untrusted_data(self) -> None:
        source = (ROOT / "02_Biblioteca_IA_Engine/index.html").read_text(encoding="utf-8")
        self.assertIn('sandbox="allow-downloads allow-forms allow-popups"', source)
        self.assertIn("function escapeHTML(value)", source)
        self.assertIn("function inlineToken(value)", source)
        self.assertIn("const path = normalizePath(decodeInlineToken(encodedPath));", source)
        self.assertIn("${escapeHTML(i.title)}", source)
        self.assertNotIn('<div class="card-title">${i.title}</div>', source)
        self.assertNotIn("'<a href=\"$2\" target=\"_blank\">$1</a>'", source)

    def test_respirasense_snapshots_are_versioned_and_html_escaped(self) -> None:
        source = (
            ROOT / "01_Modulos_Clinicos/Ventilacao_Mecanica/respirasense/app.js"
        ).read_text(encoding="utf-8")
        self.assertIn('const SNAPSHOT_KEY="respirasense_snapshots_v2"', source)
        self.assertIn("function escapeHtml(value)", source)
        self.assertIn("<td>${escapeHtml(c??\"—\")}</td>", source)
        self.assertNotIn('localStorage.getItem("respirasense_snapshots")', source)


if __name__ == "__main__":
    unittest.main()
