import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PREFERENCE_KEY = "antigravity:a11y:v1"

EXPECTED_MODULE_ENTRYPOINTS = {
    "01_UpDown_Hub/index.html",
    "02_Biblioteca_IA_Engine/index.html",
    "03_Calculadoras_E_Apps/index.html",
    "01_Modulos_Clinicos/Ventilacao_Mecanica/respirasense/index.html",
    "01_Modulos_Clinicos/Ventilacao_Mecanica/respiracrit.html",
    "questoes/index.html",
    "05_Midia_E_Feed/index.html",
    "04_Ebooks_Intensiva_Clinica/index.html",
    "07_Questoes_Comentadas/index.html",
    "08_Transcricoes/index.html",
    "09_POCUS_Hub/index.html",
    "13_RenalDose_Antimicrobianos/index.html",
    "14_SAPS3_Calculator/index.html",
    "01_Modulos_Clinicos/Hematologia_Critica/index.html",
    "01_Modulos_Clinicos/Reumatologia_Critica/index.html",
}


class ClarityHomeCoverageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.home = (ROOT / "index.html").read_text(encoding="utf-8")
        cls.entrypoints = set(
            re.findall(
                r'<a\b[^>]*class="[^"]*\bmodule-card\b[^"]*"[^>]*href="([^"]+)"',
                cls.home,
                flags=re.IGNORECASE,
            )
        )

    def test_all_home_module_entrypoints_are_covered(self):
        self.assertEqual(self.entrypoints, EXPECTED_MODULE_ENTRYPOINTS)
        self.assertEqual(len(self.entrypoints), 15)

    def test_every_module_has_global_clarity_and_accessible_control(self):
        for relative_path in sorted(self.entrypoints):
            with self.subTest(module=relative_path):
                entrypoint = ROOT / relative_path
                self.assertTrue(entrypoint.is_file())
                html = entrypoint.read_text(encoding="utf-8")
                self.assertIn(PREFERENCE_KEY, html)

                buttons = re.findall(r"<button\b[^>]*>", html, flags=re.IGNORECASE)
                clarity_buttons = [
                    button
                    for button in buttons
                    if "ativar visualização clara" in button.casefold()
                ]
                self.assertTrue(clarity_buttons)
                self.assertTrue(
                    all('aria-pressed="false"' in button.casefold() for button in clarity_buttons)
                )

    def test_every_module_has_a_white_print_contract(self):
        for relative_path in sorted(self.entrypoints):
            with self.subTest(module=relative_path):
                entrypoint = ROOT / relative_path
                sources = [entrypoint.read_text(encoding="utf-8")]
                sibling_styles = entrypoint.parent / "styles.css"
                if sibling_styles.is_file():
                    sources.append(sibling_styles.read_text(encoding="utf-8"))
                combined = "\n".join(sources).casefold()
                self.assertIn("@media print", combined)
                self.assertRegex(combined, r"(?:background|--bg)\s*:\s*#(?:fff|ffffff)\b")

    def test_every_module_understands_and_updates_the_shared_theme_schema(self):
        for relative_path in sorted(self.entrypoints):
            with self.subTest(module=relative_path):
                entrypoint = ROOT / relative_path
                sources = [entrypoint.read_text(encoding="utf-8")]
                sibling_controller = entrypoint.parent / "pwa.js"
                if sibling_controller.is_file():
                    sources.append(sibling_controller.read_text(encoding="utf-8"))
                combined = "\n".join(sources)
                self.assertIn("prefers-color-scheme: light", combined)
                self.assertRegex(
                    combined,
                    r"\.theme\s*===?\s*[\"']system[\"']",
                )
                self.assertRegex(
                    combined,
                    r"(?:\.theme\s*=|theme\s*:)\s*[\s\S]{0,80}?[\"'](?:light|dark)[\"']",
                )


if __name__ == "__main__":
    unittest.main()
