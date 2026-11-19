"""Contratos da reorganização AldenirMed 360X (16/11/2026).

Garante que a nova navegação agrupada não perde rotas, que o Jornal Diário 360
fica sincronizado com seus PDFs e que os apps 360 (Códice e FocusAI) seguem
conectados e publicáveis.
"""

import hashlib
import importlib.util
import json
import re
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HOME = (ROOT / "index.html").read_text(encoding="utf-8")


class Home360xTests(unittest.TestCase):
    def test_brand_logo_assets_exist_and_header_uses_them(self) -> None:
        for relative in (
            "assets/brand-360x/aldenirmed-360x-mark.svg",
            "assets/brand-360x/aldenirmed-360x-logo.svg",
            "assets/brand-360x/icons/aldenirmed-360x-1024.png",
        ):
            self.assertTrue((ROOT / relative).is_file(), relative)
        self.assertIn('class="brand brand-360x" href="#top" aria-label="AldenirMed 360X Intensiva · Clínica Médica · TEMI — início"', HOME)
        self.assertIn('src="./assets/brand-360x/aldenirmed-360x-mark.svg"', HOME)
        self.assertIn("<title>AldenirMed 360X — Medicina Intensiva, Plantão e TEMI</title>", HOME)
        svg = (ROOT / "assets/brand-360x/aldenirmed-360x-mark.svg").read_text(encoding="utf-8")
        self.assertNotIn("<script", svg.lower())

    def test_grouped_menu_keeps_every_previous_route(self) -> None:
        start = HOME.index('<div class="nav-links nav-menu" id="siteNavMenu" role="navigation" aria-label="Navegação principal">')
        end = HOME.index("</div>\n    <div class=\"nav-tools\">", start)
        menu = HOME[start:end]
        for href in (
            "planos/", "membros/", "#neurodiversidade-tdah", "#auditoria-uti",
            "ecossistema/painel.html", "ecossistema/agentes-habilidades/", "ecossistema/mapa.html",
            "24_Semiologia/index.html", "#modulos", "17_Portal_Vivo/index.html",
            "15_Radar_Cientifico/index.html", "16_Diretorio_Medico/index.html",
            "01_UpDown_Hub/index.html", "#campo-total", "03_Calculadoras_E_Apps/index.html",
            "05_Midia_E_Feed/index.html", "questoes/index.html",
            "01_Modulos_Clinicos/TCE_Grave_CRASH/index.html",
            "01_Modulos_Clinicos/AVC_Turbo_TEMI/index.html",
            "01_Modulos_Clinicos/Hepatite_Alcool_Associada/index.html",
            "01_Modulos_Clinicos/Sindrome_Coronariana_Aguda/index.html",
            "01_Modulos_Clinicos/Emergencias_Cardiopulmonares/index.html",
            "01_Modulos_Clinicos/RCP_Turbo_TEMI/index.html",
            "01_Modulos_Clinicos/Almanaque_ECG/index.html",
            "01_Modulos_Clinicos/Hematologia_Critica/index.html",
            "01_Modulos_Clinicos/Reumatologia_Critica/index.html",
            "01_Modulos_Clinicos/Sepse_Choque_Septico/index.html",
            "02_Biblioteca_IA_Engine/index.html",
            "13_RenalDose_Antimicrobianos/index.html",
            "14_SAPS3_Calculator/index.html",
            "#apps-360", "#jornal-360",
        ):
            self.assertIn(f'href="{href}"', menu, href)
        self.assertGreaterEqual(menu.count('<details class="nav-group">'), 4)
        for href in ("18_Centro_Tripulacao/painel-visitas.html", "18_Centro_Tripulacao/divulgacao.html"):
            self.assertIn(f'href="{href}"', menu, href)
        self.assertIn('id="navMenuToggle" type="button" aria-expanded="false" aria-controls="siteNavMenu"', HOME)
        self.assertIn('<script src="assets/home-360x.js" defer></script>', HOME)
        self.assertIn('<link rel="stylesheet" href="./assets/home-360x.css"/>', HOME)

    def test_sections_follow_the_new_reading_order(self) -> None:
        order = [
            'id="comece"', 'id="jornal-360"', 'id="portal-upgrade"', 'id="estacoes"',
            'id="modulos"', 'id="temi"', 'id="apps-360"', 'id="downloads"',
            'id="universo-360x"', 'id="bastidores"', 'id="campo-total"', 'id="pipeline"',
            'id="roadmap"', 'id="audiencia"',
        ]
        positions = [HOME.index(marker) for marker in order]
        self.assertEqual(positions, sorted(positions))
        backstage = HOME[HOME.index('id="bastidores"'):HOME.index("</main>")]
        for marker in ('id="campo-total"', 'id="pipeline"', 'id="roadmap"', 'id="audiencia"'):
            self.assertIn(marker, backstage)
        self.assertEqual(HOME.count('<a class="hub-tile'), 8)

    def test_jornal_block_and_page_are_generated_and_pdfs_exist(self) -> None:
        result = subprocess.run(
            [sys.executable, "scripts_admin/build_jornal_360.py", "--check"],
            cwd=ROOT, text=True, capture_output=True,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        data = json.loads((ROOT / "jornal-360/data/edicoes.json").read_text(encoding="utf-8"))
        editions = data["edicoes"]
        self.assertGreaterEqual(len(editions), 5)
        dates = [edition["data"] for edition in editions]
        self.assertEqual(dates, sorted(dates, reverse=True))
        page = (ROOT / "jornal-360/index.html").read_text(encoding="utf-8")
        self.assertIn('<html lang="pt-BR">', page)
        for edition in editions:
            for name in edition["arquivos"].values():
                path = ROOT / "jornal-360/edicoes" / name
                self.assertTrue(path.is_file(), name)
                self.assertEqual(path.read_bytes()[:5], b"%PDF-", name)
                self.assertIn(f'href="./edicoes/{name}"', page)
        latest = editions[0]
        self.assertIn(f'jornal-360/edicoes/{latest["arquivos"]["jornal"]}', HOME)
        self.assertIn("Não substitui o julgamento clínico", page)

    def test_apps_360_are_connected_and_focusai_download_is_allowlisted(self) -> None:
        apps = HOME[HOME.index('id="apps-360"'):HOME.index('id="downloads"')]
        self.assertIn("https://aldenirfilho.github.io/intensivahub/flashcards/", apps)
        self.assertIn('href="apps/focusai-360/index.html"', apps)
        self.assertIn('href="downloads/FocusAI-Reader-360X-v8.0.0.zip" download', apps)
        self.assertEqual(HOME.count('data-download-card="'), 3)
        self.assertEqual(HOME.count('data-app-download="'), 4)

        spec = importlib.util.spec_from_file_location("builder360", ROOT / "scripts_admin/build_public_site.py")
        builder = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(builder)
        self.assertIn("downloads/FocusAI-Reader-360X-v8.0.0.zip", builder.PUBLIC_DOWNLOADS)
        self.assertIn("jornal-360", builder.OPTIONAL)
        sums = (ROOT / "downloads/SHA256SUMS.txt").read_text(encoding="utf-8")
        digest = hashlib.sha256((ROOT / "downloads/FocusAI-Reader-360X-v8.0.0.zip").read_bytes()).hexdigest()
        self.assertIn(f"{digest}  FocusAI-Reader-360X-v8.0.0.zip", sums)
        self.assertEqual(digest, "8252bc649cfcd6a400b6f007a1a1d1afa25c13f92c5309c89fc48813dfca5734")

        focus = (ROOT / "apps/focusai-360/index.html").read_text(encoding="utf-8")
        self.assertIn('href="../../downloads/FocusAI-Reader-360X-v8.0.0.zip" download', focus)
        self.assertIn("Não substitui o julgamento clínico", focus)
        hub = (ROOT / "apps/index.html").read_text(encoding="utf-8")
        self.assertIn("apps-360x-entry", hub)
        self.assertIn('href="./focusai-360/index.html"', hub)

    def test_opendyslexic_is_shipped_with_its_license(self) -> None:
        folder = ROOT / "assets/fonts/opendyslexic"
        self.assertIn("SIL OPEN FONT LICENSE", (folder / "OFL.txt").read_text(encoding="utf-8"))
        for name in ("OpenDyslexic-Regular.woff2", "OpenDyslexic-Bold.woff2"):
            self.assertEqual((folder / name).read_bytes()[:4], b"wOF2")

    def test_new_scripts_have_valid_syntax(self) -> None:
        for relative in ("assets/home-360x.js", "assets/site-navigation.js"):
            result = subprocess.run(["node", "--check", relative], cwd=ROOT, text=True, capture_output=True)
            self.assertEqual(result.returncode, 0, relative + result.stderr)
        self.assertTrue(re.search(r"a\.module-card, a\[data-search-route\]", (ROOT / "assets/site-navigation.js").read_text(encoding="utf-8")))


if __name__ == "__main__":
    unittest.main()
