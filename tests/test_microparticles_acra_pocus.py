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
        generated = [
            asset
            for asset in self.visuals["assets"]
            if asset["origin"] == "original-generated"
        ]
        self.assertEqual(len(generated), 1)
        asset = generated[0]
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

    def test_real_pocus_assets_are_licensed_unmodified_and_self_contained(self):
        real_assets = [
            asset
            for asset in self.visuals["assets"]
            if asset["origin"] == "published-clinical-image"
        ]
        self.assertEqual(len(real_assets), 4)
        expected_hashes = {
            "choque-cardiogenico-ve-b-lines.jpg":
                "1858970c9d0eb90579fe31e59bd27e5e0ff281d151798f135026e39fb88bf4d0",
            "choque-obstrutivo-vd-dilatado.jpg":
                "04451d594c9fd6ef518fa29b0058408d606a8b73acb582be1e6bb5e75f9cd983",
            "derrame-pericardico-swinging-heart.jpg":
                "407094eaedce69ad1f8de6b01b0ffe0325aecf4c4f68439182664221ac5f6241",
            "ausencia-sliding-barcode.jpg":
                "99f459d92bc81f3f576e9dad453e579ed08ddea8849038aeb0b86b7b194ace3c",
        }

        for asset in real_assets:
            image = MODULE / asset["path"]
            self.assertTrue(image.is_file())
            self.assertEqual(image.stat().st_size, asset["bytes"])
            actual_hash = hashlib.sha256(image.read_bytes()).hexdigest()
            self.assertEqual(actual_hash, asset["sha256"])
            self.assertEqual(
                actual_hash,
                expected_hashes[image.name],
            )
            self.assertTrue(asset["patientDerived"])
            self.assertFalse(asset["patientData"])
            self.assertFalse(asset["identifiablePatientData"])
            self.assertTrue(asset["realUltrasound"])
            self.assertFalse(asset["generativeModification"])
            self.assertFalse(asset["clinicalGroundTruth"])
            self.assertTrue(asset["publishedClinicalContext"])
            self.assertEqual(asset["rightsBasis"], "CC-BY-4.0")
            self.assertEqual(
                asset["licenseUrl"],
                "https://creativecommons.org/licenses/by/4.0/",
            )
            self.assertEqual(
                asset["sourceUrl"],
                "https://pmc.ncbi.nlm.nih.gov/articles/PMC9554831/",
            )
            self.assertIn("sem alteração de pixels", asset["fileFidelity"])
            self.assertIn(f'src="{asset["path"]}"', self.html)
            self.assertIn(f'alt="{asset["alt"]}"', self.html)

        for marker in (
            "Pixels clínicos reais — sem geração ou retoque por IA",
            "🪟 JANELA",
            "👁️ VEJA",
            "🧠 INTERPRETE",
            "⚠️ ARMADILHA",
            "➡️ PRÓXIMO PASSO",
            "CC BY 4.0",
        ):
            self.assertIn(marker, self.html)
        self.assertIn(
            "ultrassom real, desidentificado, licenciado e preservado",
            self.visuals["pipeline"]["didacticPocusPolicy"],
        )

    def test_publication_skill_keeps_visual_generation_out_of_browser(self):
        skill = (
            ROOT / ".codex/skills/antigravity-publicar-portal/SKILL.md"
        ).read_text(encoding="utf-8")
        self.assertIn("Motor visual GPT no fluxo editorial", skill)
        self.assertIn("usar a skill `imagegen`", skill)
        self.assertIn("Não usar chave OpenAI", skill)
        self.assertIn("fluxo Git auditável", skill)
        self.assertIn("Regra de realidade clínica para imagens POCUS", skill)
        self.assertIn("Janela → Veja → Interprete → Armadilha", skill)
        self.assertIn("Preservar os pixels clínicos originais", skill)
        self.assertIn("Imagem gerada por IA nunca pode", skill)

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
        for asset in self.visuals["assets"]:
            self.assertIn(
                f'./22_Microparticulas_Ativas_ACRA/{asset["path"]}',
                worker,
            )
        self.assertEqual(
            site_manifest["canonicalRoutes"]["microparticulas_acra"],
            "22_Microparticulas_Ativas_ACRA/index.html",
        )


if __name__ == "__main__":
    unittest.main()
