"""Contratos da porta pública e do catálogo empresarial 360xA."""

from __future__ import annotations

import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "ecossistema"
CATALOG = PAGE / "data" / "catalog.json"


class Ecossistema360xATests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
        cls.html = (PAGE / "index.html").read_text(encoding="utf-8")
        cls.css = (PAGE / "assets" / "styles.css").read_text(encoding="utf-8")
        cls.js = (PAGE / "assets" / "app.js").read_text(encoding="utf-8")

    def test_catalog_has_ten_roots_and_three_priorities(self) -> None:
        roots = self.catalog["roots"]
        self.assertEqual(self.catalog["schemaVersion"], "1.0.0")
        self.assertEqual(len(roots), 10)
        self.assertEqual(sum(root["priority"] is True for root in roots), 3)
        self.assertEqual(len({root["id"] for root in roots}), 10)

    def test_projects_are_canonical_detailed_and_linked_to_a_root(self) -> None:
        required = {
            "id", "name", "root", "type", "phase", "priority", "objective",
            "foundation", "evidence", "nextStep", "outputs", "valuePath",
            "safeguards", "aliases", "sourceRecords",
        }
        root_ids = {root["id"] for root in self.catalog["roots"]}
        projects = self.catalog["projects"]
        self.assertGreaterEqual(len(projects), 40)
        self.assertEqual(len({project["id"] for project in projects}), len(projects))
        for project in projects:
            self.assertTrue(required.issubset(project), project.get("id"))
            self.assertIn(project["root"], root_ids)
            self.assertIn(project["phase"], {"ideia", "estruturacao", "prototipo", "revisao", "disponivel", "validado"})
            self.assertIn(project["priority"], {"agora", "proximo", "incubando", "pausado"})
            self.assertIn(project["visibility"], {"public", "controlled-public"})
            for field in ("objective", "foundation", "evidence", "nextStep", "valuePath"):
                self.assertGreaterEqual(len(project[field].strip()), 12, f"{project['id']}:{field}")

    def test_recovered_records_are_accounted_for_without_exposing_the_private_subset(self) -> None:
        covered = {
            record
            for project in self.catalog["projects"]
            for record in project["sourceRecords"]
            if re.fullmatch(r"R\d{2}", record)
        }
        coverage = self.catalog["metadata"]["coverage"]
        self.assertEqual(len(covered), coverage["publicHistoricalRecordsMapped"])
        self.assertEqual(
            len(covered) + coverage["protectedHistoricalRecordsExcluded"],
            coverage["historicalRecordsCovered"],
        )
        self.assertNotIn("p055-nucleo-privado-fundador", {project["id"] for project in self.catalog["projects"]})

    def test_sensitive_private_topics_are_not_named_in_public_catalog(self) -> None:
        public_text = CATALOG.read_text(encoding="utf-8").casefold()
        for forbidden in (
            "tinder", "civic touring", "divórcio", "divorcio", "número de cartão",
            "numero de cartao", "senha", "credencial de acesso",
        ):
            self.assertNotRegex(public_text, rf"\b{re.escape(forbidden)}\b")

    def test_page_exposes_method_filters_privacy_and_responsible_capitalization(self) -> None:
        positions = [self.html.index(term) for term in ("Raiz", "Tronco", "Ramo", "Fruto", "Oferta", "Resultado")]
        self.assertEqual(positions, sorted(positions))
        for element_id in ("searchInput", "rootSelect", "prioritySelect", "clearFilters", "resultsStatus"):
            self.assertIn(f'id="{element_id}"', self.html)
        for fallback_id in ("priorityFallback", "rootFallback", "catalogFallback"):
            self.assertIn(f'id="{fallback_id}"', self.html)
        self.assertIn("Meta: R$ 30 mil líquidos por mês — combustível da missão, não seu único destino", self.html)
        self.assertIn("Inovação não convencional", self.html)
        self.assertIn("DA QUESTÃO À OBRA", self.html)
        self.assertIn("Livros e e-books", self.html)
        self.assertIn("Cursos e mentorias", self.html)
        self.assertIn("Emergência e UTI", self.html)
        self.assertIn("Magia, símbolo e fantasia", self.html)
        self.assertIn("Tecnologia e inteligência artificial", self.html)
        self.assertIn("CARTA SOCIAL EM INVESTIGAÇÃO", self.html)
        self.assertIn("Humanidade Infinita e Além", self.html)
        self.assertIn("Portão de segurança", self.html)
        self.assertIn("Meta experimental, não receita atual nem garantia", self.html)
        self.assertIn("O catálogo é completo sem transformar privacidade em vitrine", self.html)

    def test_catalog_declares_the_problem_solution_knowledge_factory(self) -> None:
        factory = self.catalog["metadata"]["knowledgeFactory"]
        self.assertEqual(len(factory["sequence"]), 7)
        self.assertIn("livro", factory["outputs"])
        self.assertIn("curso", factory["outputs"])
        self.assertIn("mentoria educacional", factory["outputs"])
        self.assertIn("proposta de política pública", factory["outputs"])
        social = self.catalog["metadata"]["socialModel"]
        self.assertEqual(social["editorialSeries"], "Humanidade Infinita e Além")
        self.assertIn("site temático", social["plannedFormats"])
        self.assertIn("série no YouTube", social["plannedFormats"])
        civic = next(project for project in self.catalog["projects"] if project["id"] == "p048-integridade-politicas")
        self.assertIn("livro-manifesto Humanidade Infinita e Além", civic["outputs"])
        self.assertIn("site temático", civic["outputs"])

    def test_search_is_accent_insensitive_and_motion_is_respected(self) -> None:
        self.assertIn('.normalize("NFD")', self.js)
        self.assertIn('replace(/[\\u0300-\\u036f]/g, "")', self.js)
        self.assertIn('navigator.serviceWorker.register("../sw.js"', self.js)
        self.assertIn("Estado documental e validação", self.js)
        self.assertNotIn("Registros-fonte", self.js)
        self.assertIn("prefers-reduced-motion:reduce", self.css)
        self.assertIn(":focus-visible", self.css)
        for accessible_accent in ("#006f7d", "#087a4e", "#865800", "#6548b8"):
            self.assertIn(accessible_accent, self.css)

    def test_public_builder_manifest_navigation_and_offline_cache_include_route(self) -> None:
        builder = (ROOT / "scripts_admin" / "build_public_site.py").read_text(encoding="utf-8")
        workflow = (ROOT / ".github" / "workflows" / "deploy-seguro.yml").read_text(encoding="utf-8")
        worker = (ROOT / "sw.js").read_text(encoding="utf-8")
        home = (ROOT / "index.html").read_text(encoding="utf-8")
        manifest = json.loads((ROOT / "data" / "site_manifest.json").read_text(encoding="utf-8"))
        self.assertIn('"ecossistema"', builder)
        self.assertIn("site/ecossistema/data/catalog.json", workflow)
        self.assertIn('"./ecossistema/data/catalog.json"', worker)
        self.assertIn('url.pathname.endsWith("/ecossistema/data/catalog.json")', worker)
        self.assertIn('href="ecossistema/index.html"', home)
        self.assertEqual(manifest["canonicalRoutes"]["ecossistema_360xa"], "ecossistema/index.html")
        self.assertEqual(manifest["dataSources"]["ecosystemCatalog"], "ecossistema/data/catalog.json")


if __name__ == "__main__":
    unittest.main()
