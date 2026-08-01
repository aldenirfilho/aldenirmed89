#!/usr/bin/env python3
"""Contratos da Central de Ativação e sua integração pública."""

from __future__ import annotations

import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CENTRAL = ROOT / "21_Central_Ativacao"


def read(relative: str) -> str:
    return (ROOT / relative).read_text(encoding="utf-8")


def load_json(relative: str) -> dict:
    return json.loads(read(relative))


class ActivationCenterTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.html = read("21_Central_Ativacao/index.html")
        cls.app = read("21_Central_Ativacao/assets/app.js")
        cls.css = read("21_Central_Ativacao/assets/styles.css")
        cls.home = read("index.html")
        cls.worker = read("sw.js")
        cls.site_manifest = load_json("data/site_manifest.json")
        cls.public_manifest = load_json("public_site/data/site_manifest.json")
        cls.connections = load_json("data/connections.json")

    def test_page_and_human_fallback_exist(self) -> None:
        for path in (
            CENTRAL / "README.md",
            CENTRAL / "data/roadmap.json",
            ROOT / "docs_usuario/PROXIMAS_ETAPAS.md",
            ROOT / "docs_usuario/PROXIMAS_ETAPAS/index.html",
        ):
            self.assertTrue(path.is_file(), path)
        self.assertIn("Central de Ativação e Próximas Etapas", self.html)
        self.assertIn('href="../docs_usuario/PROXIMAS_ETAPAS/"', self.html)
        self.assertIn("<noscript>", self.html)

    def test_page_is_accessible_responsive_and_has_a_light_view(self) -> None:
        for marker in (
            'class="skip-link"',
            'id="main"',
            'aria-live="polite"',
            'aria-busy="true"',
            "@media(max-width:760px)",
            "@media(prefers-reduced-motion:reduce)",
            'html[data-theme="light"]',
            'id="themeButton"',
        ):
            self.assertIn(marker, self.html + self.css)
        self.assertIn('data-theme="dark"', self.html)

    def test_security_policy_and_dom_rendering_fail_closed(self) -> None:
        for marker in (
            "default-src 'self'",
            "connect-src 'self'",
            "form-action 'none'",
            "object-src 'none'",
            "ROADMAP_URL = \"./data/roadmap.json\"",
            'cache: "no-store"',
            "Nenhuma ação foi simulada",
            "replaceChildren",
            "textContent",
        ):
            self.assertIn(marker, self.html + self.app)
        self.assertNotIn("innerHTML", self.app)
        self.assertNotIn("eval(", self.app)
        self.assertNotIn("WebSocket", self.app)
        self.assertNotIn("supabaseUrl", self.app)
        self.assertNotIn("createClient(", self.app)

    def test_progress_is_local_and_export_contains_only_task_ids(self) -> None:
        for marker in (
            'antigravity:activation-progress:v1',
            'antigravity:a11y:v1',
            "completedMicroActionIds",
            "remainingOwnerItemIds",
            "containsSecrets: false",
            "Progresso local autodeclarado",
            "antigravity-retorno-seguro.json",
        ):
            self.assertIn(marker, self.app)
        for forbidden in (
            "password:",
            "accessToken:",
            "serviceRole:",
            "supabaseAnonKey:",
        ):
            self.assertNotIn(forbidden, self.app)

    def test_canonical_manifest_evolves_without_rewriting_legacy_mirror(self) -> None:
        self.assertNotEqual(
            self.site_manifest["version"],
            self.public_manifest["version"],
        )
        self.assertIn("nexus_cosmos", self.site_manifest["canonicalRoutes"])
        self.assertNotIn("nexus_cosmos", self.public_manifest["canonicalRoutes"])
        self.assertEqual(
            self.site_manifest["canonicalRoutes"]["central_ativacao"],
            "21_Central_Ativacao/index.html",
        )
        self.assertEqual(
            self.site_manifest["dataSources"]["activationRoadmap"],
            "21_Central_Ativacao/data/roadmap.json",
        )
        self.assertEqual(len(self.site_manifest["portals"]), 2)
        self.assertEqual(len(self.site_manifest["stations"]), 2)
        operation_ids = {
            operation["id"] for operation in self.site_manifest["operations"]
        }
        self.assertIn("central_ativacao", operation_ids)
        module_ids = {module["id"] for module in self.site_manifest["modules"]}
        portal_ids = {portal["id"] for portal in self.site_manifest["portals"]}
        self.assertNotIn("central_ativacao", module_ids | portal_ids)

    def test_home_preserves_taxonomy_and_links_to_the_hub(self) -> None:
        portal_start = self.home.index('id="portal-upgrade"')
        stations_start = self.home.index('id="estacoes"')
        modules_start = self.home.index('id="modulos"')
        self.assertEqual(
            self.home[portal_start:stations_start].count('class="module-card'),
            2,
        )
        self.assertEqual(
            self.home[stations_start:modules_start].count('class="module-card'),
            2,
        )
        self.assertIn("Roadmap operacional", self.home)
        self.assertIn('href="21_Central_Ativacao/index.html"', self.home)
        self.assertIn("Abrir Central de Ativação", self.home)

    def test_builder_cache_and_guides_include_the_hub(self) -> None:
        builder = read("scripts_admin/build_public_site.py")
        guides = read("docs_usuario/index.html")
        workflow = read(".github/workflows/deploy-seguro.yml")
        self.assertIn('"21_Central_Ativacao",', builder)
        self.assertIn('const CACHE_NAME = `${CACHE_PREFIX}v22`', self.worker)
        for asset in (
            "./21_Central_Ativacao/index.html",
            "./21_Central_Ativacao/assets/app.js",
            "./21_Central_Ativacao/assets/styles.css",
            "./21_Central_Ativacao/data/roadmap.json",
            "./docs_usuario/PROXIMAS_ETAPAS/index.html",
            "./docs_usuario/PROXIMAS_ETAPAS.md",
        ):
            self.assertIn(f'"{asset}"', self.worker)
        self.assertIn('href="../21_Central_Ativacao/"', guides)
        self.assertIn("Começar pela próxima etapa", guides)
        self.assertIn(
            "python3 scripts_admin/validate_activation_roadmap.py --json",
            workflow,
        )
        for artifact in (
            "site/21_Central_Ativacao/index.html",
            "site/21_Central_Ativacao/data/roadmap.json",
            "site/docs_usuario/PROXIMAS_ETAPAS/index.html",
        ):
            self.assertIn(f"test -s {artifact}", workflow)

    def test_live_map_connects_the_hub_to_real_workflows(self) -> None:
        nodes = {node["id"]: node for node in self.connections["nodes"]}
        self.assertEqual(
            nodes["central-ativacao"]["url"],
            "21_Central_Ativacao/index.html",
        )
        edges = {
            (edge["from"], edge["to"]) for edge in self.connections["edges"]
        }
        for edge in (
            ("home", "central-ativacao"),
            ("central-ativacao", "centro-tripulacao"),
            ("central-ativacao", "radar-diario"),
            ("central-ativacao", "integridade-editorial"),
            ("central-ativacao", "banco-temi"),
        ):
            self.assertIn(edge, edges)

    def test_pwa_shortcuts_remain_bounded(self) -> None:
        manifest = load_json("manifest.webmanifest")
        self.assertLessEqual(len(manifest.get("shortcuts", [])), 5)
        shortcut_urls = {
            shortcut.get("url") for shortcut in manifest.get("shortcuts", [])
        }
        self.assertNotIn("./21_Central_Ativacao/", shortcut_urls)


if __name__ == "__main__":
    unittest.main()
