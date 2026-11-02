from __future__ import annotations

import json
import unittest
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RELATIVE = Path("01_Modulos_Clinicos/Emergencias_Cardiopulmonares")
MODULE = ROOT / RELATIVE


def load_catalog() -> dict:
    source = (MODULE / "data/catalog.js").read_text(encoding="utf-8").strip()
    prefix = "window.ECP_TEMI ="
    if not source.startswith(prefix) or not source.endswith(";"):
        raise AssertionError("Catálogo ECP não segue o envelope JavaScript esperado")
    return json.loads(source[len(prefix) : -1].strip())


class StrictHtmlParser(HTMLParser):
    def error(self, message: str) -> None:  # pragma: no cover - compatibilidade
        raise AssertionError(message)


class EmergenciasCardiopulmonaresModuleTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.html = (MODULE / "index.html").read_text(encoding="utf-8")
        cls.css = (MODULE / "assets/styles.css").read_text(encoding="utf-8")
        cls.app = (MODULE / "assets/app.js").read_text(encoding="utf-8")
        cls.catalog = load_catalog()
        cls.manifest = json.loads((MODULE / "module.manifest.json").read_text(encoding="utf-8"))
        cls.public_source = "\n".join(
            (cls.html, cls.css, cls.app, json.dumps(cls.catalog, ensure_ascii=False))
        )

    def test_module_files_are_complete_and_html_parses(self) -> None:
        for relative in ("index.html", "assets/styles.css", "assets/app.js", "data/catalog.js", "module.manifest.json"):
            with self.subTest(path=relative):
                path = MODULE / relative
                self.assertTrue(path.is_file())
                self.assertGreater(path.stat().st_size, 500)
        parser = StrictHtmlParser()
        parser.feed(self.html)
        parser.close()

    def test_home_manifests_navigation_cache_and_deploy_include_module(self) -> None:
        expected = (RELATIVE / "index.html").as_posix()
        home = (ROOT / "index.html").read_text(encoding="utf-8")
        site_manifest = json.loads((ROOT / "data/site_manifest.json").read_text(encoding="utf-8"))
        navigation = json.loads((ROOT / "data/navigation.json").read_text(encoding="utf-8"))
        home_manifest = json.loads(
            (ROOT / "06_Infra_Site_E_Assets/data/home-manifest.json").read_text(encoding="utf-8")
        )
        service_worker = (ROOT / "sw.js").read_text(encoding="utf-8")
        workflow = (ROOT / ".github/workflows/deploy-seguro.yml").read_text(encoding="utf-8")
        self.assertIn(expected, home)
        self.assertEqual(site_manifest["canonicalRoutes"]["emergencias_cardiopulmonares"], expected)
        self.assertTrue(any(item["url"] == expected for item in navigation["main"]))
        self.assertTrue(any(item["href"] == RELATIVE.as_posix() + "/" for item in home_manifest["mainLinks"]))
        for relative in ("index.html", "assets/styles.css", "assets/app.js", "data/catalog.js"):
            with self.subTest(path=relative):
                self.assertIn("./" + (RELATIVE / relative).as_posix(), service_worker)
                self.assertIn("site/" + (RELATIVE / relative).as_posix(), workflow)

    def test_registry_records_pending_human_review(self) -> None:
        registry = json.loads((ROOT / "data/editorial/registry.json").read_text(encoding="utf-8"))
        item = next(i for i in registry["items"] if i["id"] == "release-emergencias-cardiopulmonares-preview-2026-11-02")
        self.assertEqual(item["classification"], "public-cited")
        self.assertTrue(item["medical"])
        self.assertEqual(item["clinicalReviewStatus"], "pending")
        self.assertIsNone(item["clinicalReviewedAt"])
        self.assertFalse(item["publicationAuthorization"]["claimsHumanClinicalReview"])
        self.assertEqual(self.manifest["status"], "em-revisao-medica")
        self.assertIsNone(self.manifest["clinicalReviewer"])
        self.assertIn("revisão médica", self.html.casefold())

    def test_public_page_has_scope_and_safety_boundaries(self) -> None:
        for marker in (
            "Não substitui avaliação cardiológica",
            "protocolo institucional",
            "confira bula",
            "Não inserir dados identificáveis de pacientes",
        ):
            with self.subTest(marker=marker):
                self.assertIn(marker.casefold(), self.public_source.casefold())
        for marker in ("Rua Raimunda", "CRM 16587", "CRM-CE", "token=", "api_key", "source_thread_id"):
            with self.subTest(marker=marker):
                self.assertNotIn(marker.casefold(), self.public_source.casefold())

    def test_required_clinical_domains_are_present(self) -> None:
        for marker in (
            "pré-excitação",
            "amiodarona IV",
            "24 h",
            "48 h",
            "CHA₂DS₂-VA",
            "RACE II",
            "SCAPE",
            "3CPO",
            "VNI",
            "natriurese",
            "choque cardiogênico",
            "De Winter",
            "COMMIT",
            "REBOOT",
            "40–49%",
        ):
            with self.subTest(marker=marker):
                self.assertIn(marker.casefold(), self.public_source.casefold())

    def test_tenecteplase_bands_and_age_rule_match_guidelines(self) -> None:
        rules = self.catalog["doseRules"]
        bands = [(band["maxKgExclusive"], band["mg"]) for band in rules["tnkBands"]]
        self.assertEqual(bands, [(60, 30), (70, 35), (80, 40), (90, 45), (None, 50)])
        self.assertEqual(rules["tnkHalfDoseAge"], 75)
        self.assertEqual(rules["tnkConcentrationMgPerMl"], 5)

    def test_heparin_rules_match_guidelines(self) -> None:
        ufh = self.catalog["doseRules"]["ufhFibrinolysis"]
        self.assertEqual(
            (ufh["bolusUnitsPerKg"], ufh["bolusMaxUnits"], ufh["infusionUnitsPerKgH"], ufh["infusionMaxUnitsH"]),
            (60, 4000, 12, 1000),
        )
        enoxa = self.catalog["doseRules"]["enoxaparinFibrinolysis"]
        self.assertEqual((enoxa["under75"]["ivBolusMg"], enoxa["under75"]["scMgPerKg"], enoxa["under75"]["firstTwoDosesMaxMg"]), (30, 1, 100))
        self.assertEqual((enoxa["age75plus"]["ivBolusMg"], enoxa["age75plus"]["scMgPerKg"], enoxa["age75plus"]["firstTwoDosesMaxMg"]), (0, 0.75, 75))
        self.assertEqual(enoxa["crclBelow30"]["scMgPerKg"], 1)
        self.assertIn("24 h", enoxa["crclBelow30"]["interval"])
        self.assertIn("HNF", enoxa["crclBelow15"])

    def test_preexcited_af_forbids_av_nodal_blockers_including_amiodarone(self) -> None:
        source = self.public_source.casefold()
        self.assertIn("amiodarona iv", source)
        self.assertIn("contraindicad", source)
        wpw_question = next(q for q in self.catalog["questions"] if q["id"] == "q-wpw")
        self.assertIn("amiodarona", wpw_question["pearl"].casefold())

    def test_training_has_feedback_and_unique_items(self) -> None:
        minimums = {"cases": 5, "questions": 12, "flashcards": 12}
        for collection_name, minimum in minimums.items():
            collection = self.catalog[collection_name]
            self.assertGreaterEqual(len(collection), minimum)
            ids = [item["id"] for item in collection]
            self.assertEqual(len(ids), len(set(ids)))
        for collection_name in ("cases", "questions"):
            for item in self.catalog[collection_name]:
                with self.subTest(collection=collection_name, item=item["id"]):
                    self.assertEqual(len(item["options"]), len(item["comments"]))
                    self.assertGreaterEqual(item["answer"], 0)
                    self.assertLess(item["answer"], len(item["options"]))
                    self.assertTrue(item["comments"][item["answer"]].startswith("Correta"))

    def test_references_are_primary_or_guideline_https_sources(self) -> None:
        references = self.catalog["references"]
        self.assertGreaterEqual(len(references), 12)
        urls = [item["url"] for item in references]
        self.assertTrue(all(url.startswith("https://") for url in urls))
        self.assertEqual(len(urls), len(set(urls)))
        for marker in ("10.1093/eurheartj/ehae176", "pubmed.ncbi.nlm.nih.gov/38033089", "academic.oup.com/eurheartj/article/42/36/3599"):
            with self.subTest(marker=marker):
                self.assertTrue(any(marker in url for url in urls))

    def test_accessibility_responsiveness_and_local_only_behavior(self) -> None:
        for marker in (
            'class="skip-link"',
            'aria-live="polite"',
            'role="tablist"',
            'aria-pressed="false"',
            "@media (max-width: 720px)",
            "@media (prefers-reduced-motion: reduce)",
            "@media print",
            "prefers-color-scheme: light",
            "antigravity:a11y:v1",
            "escapeHtml",
        ):
            with self.subTest(marker=marker):
                self.assertIn(marker, self.public_source)
        self.assertIn("script-src 'self' https://gc.zgo.at", self.html)
        self.assertNotIn("fetch(", self.app)
        self.assertNotIn("XMLHttpRequest", self.app)
        self.assertNotIn("sessionStorage", self.app)
        self.assertNotIn("style=", self.html)
        self.assertNotIn("<script>", self.html)


if __name__ == "__main__":
    unittest.main()
