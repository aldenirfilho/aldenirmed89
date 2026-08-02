from __future__ import annotations

import json
import re
import unittest
from pathlib import Path

from scripts_admin import build_public_site


ROOT = Path(__file__).resolve().parents[1]
OLD_RELATIVE = Path("23_Cosmos_NEXUS/products/maquina-turbo-temi-360x")
OLD_PRODUCT = ROOT / OLD_RELATIVE
MODULE_RELATIVE = Path("01_Modulos_Clinicos/Dermatologia_Critica")
MODULE = ROOT / MODULE_RELATIVE


def load_catalog() -> dict:
    source = (MODULE / "data/catalog.js").read_text(encoding="utf-8").strip()
    prefix = "window.DERM_CRITICA ="
    if not source.startswith(prefix) or not source.endswith(";"):
        raise AssertionError("Catálogo JavaScript não segue o envelope esperado")
    object_literal = source[len(prefix) : -1].strip()
    json_source = re.sub(
        r"([,{]\s*)([A-Za-z_$][A-Za-z0-9_$]*)(\s*:)",
        r'\1"\2"\3',
        object_literal,
    )
    return json.loads(json_source)


class DermatologiaCriticalReplacementTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.catalog = load_catalog()
        cls.html = (MODULE / "index.html").read_text(encoding="utf-8")
        cls.css = (MODULE / "assets/styles.css").read_text(encoding="utf-8")
        cls.app = (MODULE / "assets/app.js").read_text(encoding="utf-8")

    def test_old_product_is_preserved_but_excluded_from_public_builder(self) -> None:
        self.assertTrue(OLD_PRODUCT.is_dir())
        self.assertNotIn("23_Cosmos_NEXUS", build_public_site.REQUIRED)
        self.assertNotIn("23_Cosmos_NEXUS", build_public_site.OPTIONAL)
        self.assertNotIn(OLD_RELATIVE.as_posix(), build_public_site.OPTIONAL)
        self.assertIn(
            (MODULE_RELATIVE / "module.manifest.json").as_posix(),
            build_public_site.PUBLIC_BUILD_EXCLUSIONS,
        )

        manifest = json.loads(
            (OLD_PRODUCT / "product.manifest.json").read_text(encoding="utf-8")
        )
        self.assertFalse(manifest["classification"]["publicEligible"])
        self.assertEqual(manifest["publication"]["status"], "published")
        self.assertTrue(manifest["publication"]["officialPublication"])
        self.assertTrue(manifest["publication"]["ownerPublicationAuthorization"])
        self.assertFalse(manifest["publication"]["withdrawal"]["publicBuildEligible"])

    def test_new_module_is_complete_official_release(self) -> None:
        required = (
            "index.html",
            "assets/styles.css",
            "assets/app.js",
            "data/catalog.js",
        )
        for relative in required:
            with self.subTest(path=relative):
                self.assertTrue((MODULE / relative).is_file())
                self.assertGreater((MODULE / relative).stat().st_size, 300)

        self.assertIn("Publicação educacional oficial", self.html)
        self.assertIn("connect-src 'none'", self.html)

    def test_home_replaces_old_public_entrypoint(self) -> None:
        home = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn(MODULE_RELATIVE.as_posix() + "/index.html", home)
        self.assertIn("Dermatologia Crítica", home)
        self.assertNotIn(OLD_RELATIVE.as_posix(), home)
        self.assertNotIn("Máquina Turbo TEMI 360X", home)

    def test_public_module_does_not_expose_internal_engineering_vocabulary(self) -> None:
        public_source = "\n".join((self.html, self.css, self.app, json.dumps(self.catalog)))
        blocked = (
            "23_Cosmos_NEXUS",
            "TAF###",
            "HOM###",
            "TOM###",
            "PUBLIC_READY",
            "U2 + U3",
            "P0 · auditado",
            "deploymentId",
            "publicationBlockedUntilOwnerCommand",
            "candidato-local-validacao",
            "reviewGate",
        )
        for token in blocked:
            with self.subTest(token=token):
                self.assertNotIn(token, public_source)

    def test_module_has_required_high_risk_clinical_lanes(self) -> None:
        source = "\n".join((self.html, json.dumps(self.catalog, ensure_ascii=False)))
        for marker in (
            "SJS/TEN",
            "DRESS",
            "AGEP",
            "Eritrodermia",
            "SCORTEN",
            "ALDEN",
            "oftalmologia",
            "UTI",
            "transferência",
        ):
            with self.subTest(marker=marker):
                self.assertIn(marker.casefold(), source.casefold())

    def test_scorten_uses_all_original_variables_and_limits(self) -> None:
        for marker in (
            "Idade &gt;40 anos",
            "Neoplasia maligna",
            "Descolamento &gt;10%",
            "Frequência cardíaca &gt;120/min",
            "Ureia &gt;60 mg/dL (10 mmol/L) ou BUN &gt;28 mg/dL",
            "Glicose &gt;252 mg/dL",
            "Bicarbonato &lt;20 mmol/L",
            "prognóstico, não triagem",
        ):
            with self.subTest(marker=marker):
                self.assertIn(marker, self.html)

    def test_how_to_flow_is_prominent_and_actionable(self) -> None:
        self.assertIn('id="como-usar"', self.html)
        for marker in (
            "Inicie pela triagem",
            "Siga o relógio de ação",
            "Compare fenótipos",
            "Pratique casos e questões",
            "Revise os flashcards",
        ):
            with self.subTest(marker=marker):
                self.assertIn(marker, self.html)

    def test_every_training_option_has_individual_feedback(self) -> None:
        self.assertGreaterEqual(len(self.catalog["cases"]), 6)
        self.assertGreaterEqual(len(self.catalog["questions"]), 10)
        self.assertGreaterEqual(len(self.catalog["flashcards"]), 18)
        for collection_name in ("cases", "questions"):
            ids = set()
            for item in self.catalog[collection_name]:
                with self.subTest(collection=collection_name, item=item["id"]):
                    self.assertNotIn(item["id"], ids)
                    ids.add(item["id"])
                    self.assertEqual(len(item["options"]), 4)
                    self.assertEqual(len(item["comments"]), len(item["options"]))
                    self.assertIn(item["answer"], range(len(item["options"])))

    def test_references_are_direct_and_source_backed(self) -> None:
        references = self.catalog["references"]
        self.assertGreaterEqual(len(references), 10)
        urls = {item["url"] for item in references}
        for url in (
            "https://pmc.ncbi.nlm.nih.gov/articles/PMC11986972/",
            "https://pubmed.ncbi.nlm.nih.gov/40905522/",
            "https://pmc.ncbi.nlm.nih.gov/articles/PMC10652220/",
            "https://onlinelibrary.wiley.com/doi/10.1111/jdv.20232",
            "https://pubmed.ncbi.nlm.nih.gov/10951229/",
        ):
            self.assertIn(url, urls)

    def test_no_remote_runtime_or_patient_input_field(self) -> None:
        self.assertIn("connect-src 'none'", self.html)
        self.assertNotRegex(self.html, r'<script[^>]+src="https?://')
        self.assertNotRegex(self.html, r'<link[^>]+href="https?://')
        self.assertNotIn('type="file"', self.html)
        self.assertNotIn("fetch(", self.app)
        self.assertNotIn("XMLHttpRequest", self.app)


if __name__ == "__main__":
    unittest.main()
