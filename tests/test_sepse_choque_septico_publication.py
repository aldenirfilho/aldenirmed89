import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODULE = ROOT / "01_Modulos_Clinicos" / "Sepse_Choque_Septico"
ROUTE = "01_Modulos_Clinicos/Sepse_Choque_Septico/index.html"

class SepseChoqueSepticoPublicationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = (MODULE / "index.html").read_text(encoding="utf-8")
        cls.home = (ROOT / "index.html").read_text(encoding="utf-8")
        cls.navigation = json.loads((ROOT / "data/navigation.json").read_text(encoding="utf-8"))
        cls.topics = json.loads((ROOT / "data/topics.json").read_text(encoding="utf-8"))
        cls.site_manifest = json.loads((ROOT / "data/site_manifest.json").read_text(encoding="utf-8"))
        cls.sw = (ROOT / "sw.js").read_text(encoding="utf-8")

    def test_runtime_publico_limpo(self):
        self.assertTrue(MODULE.is_dir())
        for forbidden in (
            "module.manifest.json", "specs", "acra",
            "PHASE4A_LOCAL_CHECKPOINT.md",
            "PHASE4A_VISUAL_HOMOLOGATION_60_120_2026-08-03.md",
            "data/visual-plan.json", "data/visual-assets.json", "data/acra-plan.json",
            "assets/visual-runtime 2.js",
        ):
            self.assertFalse((MODULE / forbidden).exists(), forbidden)

    def test_conteudo_e_seguranca(self):
        self.assertIn("Sepse e Choque Séptico — Antigravity Consultas", self.html)
        self.assertIn("Pense. Pode ser sepse.", self.html)
        self.assertIn("connect-src 'none'", self.html)
        self.assertIn("default-src 'self'", self.html)
        self.assertEqual(sorted(set(re.findall(r'data-visual-id="IMG-(\d{2})"', self.html))), [f"{i:02d}" for i in range(1, 61)])
        for marker in ("educação e apoio cognitivo", "não substitui", "controle do foco", "antimicrobiano"):
            self.assertIn(marker.casefold(), self.html.casefold())

    def test_inventario_visual(self):
        self.assertEqual(len(list((MODULE / "assets/images").glob("img-*.png"))), 58)
        self.assertEqual(len(list((MODULE / "assets/images/reviewed").glob("img-*.png"))), 2)
        self.assertEqual(len(list((MODULE / "assets/images/optimized").glob("img-*.jpg"))), 120)

    def test_home_e_catalogos_apontam_para_rota_canonica(self):
        self.assertIn(f'href="{ROUTE}"', self.home)
        self.assertNotIn('class="topic-pill yellow">🦠 Sepse <sup', self.home)
        self.assertTrue(any(item.get("url") == ROUTE for item in self.navigation["main"]))
        topic = next(item for item in self.topics if item.get("id") == "sepse-choque")
        self.assertEqual(topic["url"], ROUTE)
        self.assertEqual(topic["type"], "module")
        self.assertIn(topic["status"], {"ativo", "revisao-medica-publica"})
        self.assertEqual(self.site_manifest["canonicalRoutes"]["sepse_choque_septico"], ROUTE)
        self.assertTrue(any(item.get("path") == ROUTE for item in self.site_manifest["modules"]))

    def test_pwa_atualizado_sem_precachear_180_imagens(self):
        version = re.search(r'CACHE_NAME = `\$\{CACHE_PREFIX\}v(\d+)`', self.sw)
        self.assertIsNotNone(version)
        self.assertGreaterEqual(int(version.group(1)), 18)
        self.assertIn(f'"./{ROUTE}"', self.sw)
        self.assertNotIn("assets/images/optimized/img-60", self.sw)

    def test_revisao_humana_interface_e_acra(self):
        css = (MODULE / "assets/styles.css").read_text(encoding="utf-8")
        controller = (MODULE / "assets/acra-controller.js").read_text(encoding="utf-8")
        self.assertRegex(
            self.home,
            rf'href="{re.escape(ROUTE)}"[^>]*>\s*🦠\s*Sepse\s*</a>',
        )
        self.assertNotRegex(
            self.home,
            r"🦠\s*Por(?:que|quê| que| quê)",
        )
        self.assertIn(
            "grid-template-columns: repeat(3, minmax(0, 1fr))",
            css,
        )
        self.assertIn("const stageContent =", controller)
        self.assertIn("const target = stageContent ||", controller)
        self.assertIn("setStageStatus(`Aberto:", controller)
        self.assertIn("Aguardando seleção.", self.html)

if __name__ == "__main__":
    unittest.main()
