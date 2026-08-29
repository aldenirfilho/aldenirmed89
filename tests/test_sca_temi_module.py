from __future__ import annotations

import json
import re
import unittest
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RELATIVE = Path("01_Modulos_Clinicos/Sindrome_Coronariana_Aguda")
MODULE = ROOT / RELATIVE


def load_catalog() -> dict:
    source = (MODULE / "data/catalog.js").read_text(encoding="utf-8").strip()
    prefix = "window.SCA_TEMI ="
    if not source.startswith(prefix) or not source.endswith(";"):
        raise AssertionError("Catálogo SCA não segue o envelope JavaScript esperado")
    return json.loads(source[len(prefix) : -1].strip())


class StrictHtmlParser(HTMLParser):
    def error(self, message: str) -> None:  # pragma: no cover - compatibilidade
        raise AssertionError(message)


class ScaTemiModuleTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.html = (MODULE / "index.html").read_text(encoding="utf-8")
        cls.css = (MODULE / "assets/styles.css").read_text(encoding="utf-8")
        cls.app = (MODULE / "assets/app.js").read_text(encoding="utf-8")
        cls.catalog = load_catalog()
        cls.public_source = "\n".join(
            (cls.html, cls.css, cls.app, json.dumps(cls.catalog, ensure_ascii=False))
        )

    def test_module_files_are_complete_and_html_parses(self) -> None:
        for relative in (
            "index.html",
            "assets/styles.css",
            "assets/app.js",
            "data/catalog.js",
        ):
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
        site_manifest = json.loads(
            (ROOT / "data/site_manifest.json").read_text(encoding="utf-8")
        )
        navigation = json.loads(
            (ROOT / "data/navigation.json").read_text(encoding="utf-8")
        )
        home_manifest = json.loads(
            (ROOT / "06_Infra_Site_E_Assets/data/home-manifest.json").read_text(
                encoding="utf-8"
            )
        )
        service_worker = (ROOT / "sw.js").read_text(encoding="utf-8")
        workflow = (ROOT / ".github/workflows/deploy-seguro.yml").read_text(
            encoding="utf-8"
        )
        self.assertIn(expected, home)
        self.assertEqual(
            site_manifest["canonicalRoutes"]["sindrome_coronariana_aguda"], expected
        )
        self.assertTrue(any(item["url"] == expected for item in navigation["main"]))
        self.assertTrue(
            any(
                item["href"] == RELATIVE.as_posix() + "/"
                for item in home_manifest["mainLinks"]
            )
        )
        self.assertIn("./" + expected, service_worker)
        self.assertIn("site/" + expected, workflow)

    def test_public_page_has_scope_and_safety_boundaries(self) -> None:
        for marker in (
            "Não substitui avaliação cardiológica",
            "protocolo institucional",
            "não fornece escolha, dose ou esquema farmacológico",
            "Não inserir dados identificáveis de pacientes",
        ):
            with self.subTest(marker=marker):
                self.assertIn(marker.casefold(), self.public_source.casefold())
        self.assertIn("script-src 'self' https://gc.zgo.at", self.public_source)
        self.assertIn(
            "connect-src 'self' https://aldenirrochadeoliveirafilho1989.goatcounter.com",
            self.public_source,
        )
        blocked = (
            "TAF###",
            "HOM###",
            "TOM###",
            "deploymentId",
            "publicationBlockedUntilOwnerCommand",
            "source_thread_id",
            "Rua Raimunda",
            "CRM 16587",
            "token=",
            "api_key",
        )
        for marker in blocked:
            with self.subTest(marker=marker):
                self.assertNotIn(marker.casefold(), self.public_source.casefold())

    def test_required_clinical_domains_are_present(self) -> None:
        for marker in (
            "STEMI",
            "NSTEMI",
            "10 minutos",
            "troponina de alta sensibilidade",
            "0/1 h",
            "0/2 h",
            "120 min",
            "fibrinólise",
            "ICP de resgate",
            "telemetria",
            "complicação mecânica",
            "SYNTAX Score II 2020",
            "Heart Team",
        ):
            with self.subTest(marker=marker):
                self.assertIn(marker.casefold(), self.public_source.casefold())

    def test_reperfusion_and_shock_safety_statements_are_explicit(self) -> None:
        source = self.public_source.casefold()
        self.assertIn("não aguarde troponina", source)
        self.assertIn("vaso culpado primeiro", source)
        self.assertIn("não faça icp rotineira dos vasos não culpados", source)
        self.assertIn("entre 2 e 24 h", source)
        self.assertIn("não use fibrinólise em nstemi", source)

    def test_syntax_is_anatomic_context_not_an_automatic_decision(self) -> None:
        source = self.public_source.casefold()
        self.assertIn("depende da angiografia", source)
        self.assertIn("não deve atrasar reperfusão do vaso culpado", source)
        self.assertIn("não decide sozinho", source)
        self.assertIn("variabilidade entre observadores", source)
        for cutoff in ("≤22", "23–32", "≥33"):
            self.assertIn(cutoff, self.html)

    def test_training_has_feedback_and_unique_items(self) -> None:
        minimums = {"cases": 5, "questions": 6, "flashcards": 12}
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

    def test_references_are_primary_or_guideline_https_sources(self) -> None:
        references = self.catalog["references"]
        self.assertGreaterEqual(len(references), 6)
        urls = [item["url"] for item in references]
        self.assertTrue(all(url.startswith("https://") for url in urls))
        self.assertTrue(any("jacc.org" in url for url in urls))
        self.assertTrue(any("academic.oup.com" in url for url in urls))
        self.assertTrue(any("pubmed.ncbi.nlm.nih.gov/33038944" in url for url in urls))
        self.assertEqual(len(urls), len(set(urls)))

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
        self.assertNotIn("fetch(", self.app)
        self.assertNotIn("XMLHttpRequest", self.app)
        self.assertNotIn("sessionStorage", self.app)

    def test_page_does_not_embed_drug_doses(self) -> None:
        dose_pattern = re.compile(
            r"\b\d+(?:[.,]\d+)?\s*(?:mg|mcg|µg|g)(?:/kg|/min|/h)?\b",
            flags=re.IGNORECASE,
        )
        self.assertIsNone(dose_pattern.search(self.public_source))


if __name__ == "__main__":
    unittest.main()
