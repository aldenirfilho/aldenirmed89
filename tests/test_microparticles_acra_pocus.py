import hashlib
import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MODULE = ROOT / "22_Microparticulas_Ativas_ACRA"
ARTIFACT_PATH = MODULE / "data/pocus-choque-acra.json"
ALLOWED_COMPONENTS = {
    "callout",
    "tabs",
    "accordion",
    "cards",
    "numberedSteps",
    "comparisonTable",
    "thresholdTable",
    "checklist",
    "quiz",
    "keyValueGrid",
    "sources",
    "progress",
    "followupActions",
}


class MicroparticlesAcraPocusTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.artifact = json.loads(ARTIFACT_PATH.read_text(encoding="utf-8"))
        cls.html = (MODULE / "index.html").read_text(encoding="utf-8")
        cls.app = (MODULE / "assets/app.js").read_text(encoding="utf-8")
        cls.styles = (MODULE / "assets/styles.css").read_text(encoding="utf-8")
        cls.manifest = json.loads(
            (MODULE / "module.manifest.json").read_text(encoding="utf-8")
        )
        cls.visuals = json.loads(
            (MODULE / "data/visual-assets.json").read_text(encoding="utf-8")
        )

    def test_acra_v1_closed_component_contract(self):
        self.assertEqual(self.artifact["version"], "1.0")
        self.assertEqual(self.artifact["mode"], "tutorial")
        self.assertLessEqual(len(self.artifact["components"]), 24)
        self.assertTrue(self.artifact["critical"])
        self.assertTrue(self.artifact["sources"])
        self.assertTrue(self.artifact["actions"])

        types = {component["type"] for component in self.artifact["components"]}
        self.assertLessEqual(types, ALLOWED_COMPONENTS)
        self.assertEqual(types, ALLOWED_COMPONENTS)

    def test_all_ids_are_unique_and_acra_safe(self):
        ids = [self.artifact["id"]]
        ids.extend(item["id"] for item in self.artifact["critical"])
        ids.extend(item["id"] for item in self.artifact["components"])
        ids.extend(item["id"] for item in self.artifact["actions"])
        ids.extend(item["id"] for item in self.artifact["sources"])
        self.assertEqual(len(ids), len(set(ids)))
        for item_id in ids:
            self.assertRegex(item_id, r"^[a-z0-9][a-z0-9._-]{2,63}$")

    def test_active_learning_layers_and_pocus_safety_are_explicit(self):
        combined = json.dumps(self.artifact, ensure_ascii=False)
        for marker in ("M0", "M1", "M2", "M3", "M4", "M5", "M6"):
            self.assertIn(marker, combined)
        for marker in (
            "Bomba",
            "Tanque",
            "Tubos",
            "Pulmão",
            "Perfusão",
            "Nunca feche o choque por um único sinal",
            "revisão médica",
        ):
            self.assertIn(marker, combined)
        self.assertEqual(len(self.artifact["components"][9]["questions"]), 5)

    def test_sources_are_https_and_actions_are_preview_only(self):
        for source in self.artifact["sources"]:
            if "url" in source:
                self.assertTrue(source["url"].startswith("https://"))
        for action in self.artifact["actions"]:
            self.assertIs(action["requiresPreview"], True)

    def test_renderer_is_local_first_and_uses_safe_dom_apis(self):
        self.assertIn("localStorage", self.app)
        self.assertIn("textContent", self.app)
        self.assertNotIn("innerHTML", self.app)
        self.assertNotRegex(self.app, r"\beval\s*\(")
        self.assertNotRegex(self.app, r"\bnew Function\s*\(")
        self.assertNotIn("XMLHttpRequest", self.app)
        self.assertNotIn("sendBeacon", self.app)
        self.assertIn('url.protocol === "https:"', self.app)

    def test_critical_scope_is_visible_before_dynamic_artifact(self):
        safety = self.html.index('class="safety-band"')
        artifact = self.html.index('id="artifact-status"')
        self.assertLess(safety, artifact)
        self.assertIn("Não substitui ABCDE", self.html)
        self.assertIn("Em revisão médica", self.html)

    def test_accessibility_print_and_reduced_motion_contracts(self):
        self.assertIn('aria-label="Ativar visualização clara"', self.html)
        self.assertIn('aria-pressed="false"', self.html)
        self.assertIn("antigravity:a11y:v1", self.html)
        self.assertIn("@media print", self.styles)
        self.assertRegex(self.styles, r"(?:background|--bg)\s*:\s*#ffffff\b")
        self.assertIn("@media (prefers-reduced-motion: reduce)", self.styles)

    def test_manifest_keeps_clinical_and_privacy_gates(self):
        self.assertEqual(self.manifest["status"], "em-revisao-medica")
        self.assertTrue(self.manifest["publication"]["publicPreview"])
        self.assertTrue(self.manifest["publication"]["clinicalReviewOngoing"])
        self.assertFalse(self.manifest["privacy"]["cloud"])
        self.assertFalse(self.manifest["privacy"]["telemetry"])
        self.assertFalse(self.manifest["privacy"]["patientData"])
        self.assertEqual(
            self.manifest["method"]["contract"],
            "nexus-artifact-v1.0",
        )
        self.assertTrue(self.manifest["visualGeneration"]["enabled"])
        self.assertFalse(self.manifest["visualGeneration"]["runtimeApi"])
        self.assertFalse(self.manifest["visualGeneration"]["publicCredentials"])

    def test_gpt_visual_asset_is_versioned_optimized_and_accessible(self):
        self.assertFalse(self.visuals["pipeline"]["publicRuntimeGeneration"])
        self.assertFalse(self.visuals["pipeline"]["publicApiKey"])
        self.assertTrue(self.visuals["pipeline"]["failClosed"])
        self.assertEqual(len(self.visuals["assets"]), 1)
        asset = self.visuals["assets"][0]
        image = MODULE / asset["path"]
        self.assertTrue(image.is_file())
        self.assertLess(image.stat().st_size, 400_000)
        self.assertEqual(image.stat().st_size, asset["bytes"])
        self.assertEqual(
            hashlib.sha256(image.read_bytes()).hexdigest(),
            asset["sha256"],
        )
        self.assertEqual((asset["width"], asset["height"]), (1600, 900))
        self.assertFalse(asset["patientData"])
        self.assertFalse(asset["embeddedText"])
        self.assertFalse(asset["clinicalGroundTruth"])
        self.assertEqual(asset["clinicalReview"], "pending")
        self.assertIn(f'src="{asset["path"]}"', self.html)
        self.assertIn(f'alt="{asset["alt"]}"', self.html)
        self.assertIn('loading="lazy"', self.html)
        self.assertIn('decoding="async"', self.html)

    def test_publication_skill_keeps_visual_generation_out_of_browser(self):
        skill = (
            ROOT / ".codex/skills/antigravity-publicar-portal/SKILL.md"
        ).read_text(encoding="utf-8")
        self.assertIn("Motor visual GPT no fluxo editorial", skill)
        self.assertIn("usar a skill `imagegen`", skill)
        self.assertIn("Não usar chave OpenAI", skill)
        self.assertIn("fluxo Git auditável", skill)

    def test_home_and_public_build_include_the_module(self):
        home = (ROOT / "index.html").read_text(encoding="utf-8")
        builder = (ROOT / "scripts_admin/build_public_site.py").read_text(
            encoding="utf-8"
        )
        worker = (ROOT / "sw.js").read_text(encoding="utf-8")
        site_manifest = json.loads(
            (ROOT / "data/site_manifest.json").read_text(encoding="utf-8")
        )
        self.assertIn("22_Microparticulas_Ativas_ACRA/index.html", home)
        self.assertIn('"22_Microparticulas_Ativas_ACRA"', builder)
        self.assertIn(
            "./22_Microparticulas_Ativas_ACRA/data/pocus-choque-acra.json",
            worker,
        )
        self.assertIn(
            "./22_Microparticulas_Ativas_ACRA/assets/visuals/"
            "pocus-choque-mapa-acra-v1.jpg",
            worker,
        )
        self.assertEqual(
            site_manifest["canonicalRoutes"]["microparticulas_acra"],
            "22_Microparticulas_Ativas_ACRA/index.html",
        )


if __name__ == "__main__":
    unittest.main()
