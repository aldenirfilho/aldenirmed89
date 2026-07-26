#!/usr/bin/env python3
"""Contratos do Portal Vivo e do publicador editorial Antigravity."""

from __future__ import annotations

import importlib.util
import json
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PORTAL = ROOT / "17_Portal_Vivo"
PUBLISHER = (
    ROOT
    / ".codex/skills/antigravity-publicar-portal/scripts/publish_portal.py"
)


def load_posts_js() -> dict:
    script = (
        "global.window={};require(process.argv[1]);"
        "process.stdout.write(JSON.stringify(window.ANTIGRAVITY_PORTAL));"
    )
    result = subprocess.run(
        ["node", "-e", script, str(PORTAL / "data/posts.js")],
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


def load_publisher():
    spec = importlib.util.spec_from_file_location("portal_publisher", PUBLISHER)
    if spec is None or spec.loader is None:
        raise RuntimeError("Publicador do Portal não pôde ser carregado.")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class PortalVivoTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = (PORTAL / "index.html").read_text(encoding="utf-8")
        cls.posts = json.loads(
            (PORTAL / "data/posts.json").read_text(encoding="utf-8")
        )
        cls.posts_js = load_posts_js()
        cls.history = json.loads(
            (PORTAL / "data/publication-history.json").read_text(encoding="utf-8")
        )
        cls.publisher = load_publisher()

    def test_generated_store_matches_canonical_json(self):
        self.assertEqual(self.posts_js, self.posts)
        self.assertEqual(self.posts["schemaVersion"], "portal-vivo-v1")
        ids = [item["id"] for item in self.posts["posts"]]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertTrue(set(ids).issubset(self.history["publishedIds"]))

    def test_feed_is_continuous_optional_and_keeps_platform_upgrades_separate(self):
        for marker in (
            "IntersectionObserver",
            'id="sentinel"',
            "renderNext",
            "continue rolando",
            "Portal opcional",
            "Conteúdo clínico e estudo ficam na Estação Radar Diário",
            "Portal Vivo preserva o histórico de UPGRADE",
        ):
            self.assertIn(marker.casefold(), self.html.casefold())
        self.assertNotIn(
            '<script src="../15_Radar_Cientifico/data/radar.js"></script>',
            self.html,
        )

    def test_manual_composer_is_private_structured_and_chat_ready(self):
        for marker in (
            'id="composerForm"',
            'id="draftSource"',
            'id="draftNote"',
            'id="auditDraft"',
            'id="copyDraft"',
            'id="downloadDraft"',
            'id="draftTarget"',
            'value="radar-diario" selected',
            "Estação Radar Diário — conteúdo clínico/estudo do chat",
            "Portal Vivo — UPGRADE da plataforma",
            "destination:DESTINATIONS[target]",
            "target,sourceUrl",
            "$antigravity-publicar-portal",
            "RASCUNHO LOCAL · NÃO PUBLICADO",
            "no navegador",
        ):
            self.assertIn(marker, self.html)
        self.assertNotIn("github_pat_", self.html)
        self.assertNotIn("ghp_", self.html)

    def test_upgrade_sidebar_has_explicit_upgrade_labels_and_links(self):
        upgrades = self.posts["upgrades"]
        self.assertGreaterEqual(len(upgrades), 5)
        self.assertTrue(all(item["status"] == "UPGRADE" for item in upgrades))
        self.assertEqual(len({item["id"] for item in upgrades}), len(upgrades))
        for marker in ('id="upgradeList"', "Últimas sessões", "UPGRADE"):
            self.assertIn(marker, self.html)

    def test_every_manual_post_has_turbo_source_and_audit(self):
        for post in self.posts["posts"]:
            self.assertEqual(post["target"], "portal-vivo-upgrade")
            self.assertEqual(
                post["destination"],
                "Portal Vivo — UPGRADE da plataforma",
            )
            self.assertEqual(post["type"], "system-upgrade")
            self.assertIn(post["type"], self.publisher.ALLOWED_TYPES)
            self.assertIn(post["priority"], {1, 2, 3})
            self.assertTrue(post["source"]["url"])
            self.assertTrue(post["source"]["date"])
            self.assertTrue(post["audit"]["sourceChecked"])
            self.assertTrue(post["audit"]["noDirectPatientData"])
            self.assertGreaterEqual(len(post["turbo"]["takeaways"]), 2)
            self.assertTrue(post["turbo"]["caveat"])

    def test_publisher_accepts_grounded_post_and_rejects_unsafe_directive(self):
        base = {
            "destination": "Estação Radar Diário — conteúdo clínico/estudo do chat",
            "target": "radar-diario",
            "type": "evidence-summary",
            "category": "Terapia Intensiva",
            "priority": 1,
            "title": "Estudo clínico com resultado relevante para a UTI",
            "summary": (
                "Síntese descritiva do resultado, sem extrapolar a população "
                "avaliada e sem transformar associação em causalidade."
            ),
            "publishedAt": "2026-07-25T21:00:00-03:00",
            "source": {
                "name": "Fonte primária",
                "url": "https://example.org/article?utm_source=test",
                "date": "2026-07-25",
                "checkedAt": "2026-07-25T21:00:00-03:00",
            },
            "turbo": {
                "clinicalImpact": "Ajuda a formular uma pergunta clínica verificável.",
                "temiHook": "Revisar desenho, população, desfecho e limitações.",
                "memoryAnchor": "PERGUNTA → EVIDÊNCIA",
                "takeaways": [
                    "Conferir a população incluída.",
                    "Distinguir desfecho substituto de desfecho clínico.",
                ],
                "caveat": "A aplicação depende do texto completo e do protocolo local.",
            },
            "audit": {
                "sourceChecked": True,
                "clinicalReview": "pending",
                "noDirectPatientData": True,
                "reviewedAt": "2026-07-25T21:00:00-03:00",
                "reviewedBy": "Codex Antigravity",
            },
        }
        validated = self.publisher.validate_post(base)
        self.assertTrue(validated["source"]["url"].endswith("/article"))
        self.assertEqual(validated["target"], "radar-diario")
        self.assertTrue(validated["id"])
        unsafe = json.loads(json.dumps(base))
        unsafe["turbo"]["clinicalImpact"] = (
            "Administre dose de 10 mg imediatamente em todos os pacientes."
        )
        with self.assertRaisesRegex(ValueError, "revisão clínica confirmada"):
            self.publisher.validate_post(unsafe)

    def test_publisher_updates_json_js_and_antiduplication_history(self):
        post = {
            "destination": "Portal Vivo — UPGRADE da plataforma",
            "target": "portal-vivo-upgrade",
            "type": "system-upgrade",
            "category": "Sistema Antigravity",
            "priority": 2,
            "title": "Nova melhoria operacional no compositor do Antigravity",
            "summary": (
                "O compositor passou a declarar o destino da publicação para "
                "evitar que conteúdo clínico seja enviado ao feed de upgrades."
            ),
            "publishedAt": "2026-07-25T21:30:00-03:00",
            "source": {
                "name": "Fonte de teste",
                "url": "https://example.org/portal-functional-test",
                "date": "2026-07-25",
                "checkedAt": "2026-07-25T21:30:00-03:00",
            },
            "turbo": {
                "clinicalImpact": "Reduz erros editoriais e mantém cada estação com função clara.",
                "temiHook": "A Estação Radar concentra estudo; o Portal registra evolução.",
                "memoryAnchor": "DESTINO → AUDITORIA → PUBLICAÇÃO",
                "takeaways": [
                    "Destino explícito no pacote.",
                    "UPGRADE permanece no Portal Vivo.",
                ],
                "caveat": "O envio ao chat ainda exige auditoria e integração segura.",
            },
            "audit": {
                "sourceChecked": True,
                "clinicalReview": "not-required",
                "noDirectPatientData": True,
                "reviewedAt": "2026-07-25T21:30:00-03:00",
                "reviewedBy": "Teste Antigravity",
            },
        }
        with tempfile.TemporaryDirectory() as directory:
            temp = Path(directory)
            posts_path = temp / "posts.json"
            history_path = temp / "history.json"
            js_path = temp / "posts.js"
            input_path = temp / "input.json"
            posts_path.write_text(
                json.dumps(self.posts, ensure_ascii=False), encoding="utf-8"
            )
            history_path.write_text(
                json.dumps(self.history, ensure_ascii=False), encoding="utf-8"
            )
            input_path.write_text(
                json.dumps(post, ensure_ascii=False), encoding="utf-8"
            )
            original = (
                self.publisher.POSTS_PATH,
                self.publisher.HISTORY_PATH,
                self.publisher.JS_PATH,
            )
            try:
                self.publisher.POSTS_PATH = posts_path
                self.publisher.HISTORY_PATH = history_path
                self.publisher.JS_PATH = js_path
                post_id = self.publisher.publish(input_path)
            finally:
                (
                    self.publisher.POSTS_PATH,
                    self.publisher.HISTORY_PATH,
                    self.publisher.JS_PATH,
                ) = original
            updated = json.loads(posts_path.read_text(encoding="utf-8"))
            history = json.loads(history_path.read_text(encoding="utf-8"))
            self.assertEqual(updated["posts"][0]["id"], post_id)
            self.assertIn(post_id, history["publishedIds"])
            self.assertIn("window.ANTIGRAVITY_PORTAL=", js_path.read_text())

    def test_radar_destination_validates_but_cannot_publish_into_portal_store(self):
        post = {
            "destination": "Estação Radar Diário — conteúdo clínico/estudo do chat",
            "target": "radar-diario",
            "type": "study-note",
            "category": "POCUS",
            "priority": 2,
            "title": "Nota clínica destinada à Estação Radar Diário",
            "summary": (
                "Conteúdo educacional rastreável que deve permanecer separado "
                "do feed de melhorias operacionais da plataforma Antigravity."
            ),
            "publishedAt": "2026-07-25T21:40:00-03:00",
            "source": {
                "name": "Fonte clínica",
                "url": "https://example.org/article/radar-only",
                "date": "2026-07-25",
                "checkedAt": "2026-07-25T21:40:00-03:00",
            },
            "turbo": {
                "clinicalImpact": "Organiza uma pergunta clínica para revisão posterior.",
                "temiHook": "Revisar indicação, técnica e limitações do método.",
                "memoryAnchor": "RADAR → ESTUDO",
                "takeaways": [
                    "Preservar a fonte específica.",
                    "Separar estudo de UPGRADE.",
                ],
                "caveat": "Não substitui avaliação clínica nem protocolo local.",
            },
            "audit": {
                "sourceChecked": True,
                "clinicalReview": "pending",
                "noDirectPatientData": True,
                "reviewedAt": "2026-07-25T21:40:00-03:00",
                "reviewedBy": "Teste Antigravity",
            },
        }
        validated = self.publisher.validate_post(post)
        self.assertEqual(validated["target"], "radar-diario")
        with tempfile.TemporaryDirectory() as directory:
            input_path = Path(directory) / "radar.json"
            input_path.write_text(
                json.dumps(post, ensure_ascii=False), encoding="utf-8"
            )
            with self.assertRaisesRegex(ValueError, "Estação Radar Diário"):
                self.publisher.publish(input_path)

    def test_source_identity_uses_doi_pmid_or_id_not_landing_domain(self):
        base = {
            "destination": "Portal Vivo — UPGRADE da plataforma",
            "target": "portal-vivo-upgrade",
            "type": "system-upgrade",
            "category": "Sistema Antigravity",
            "priority": 2,
            "title": "Primeiro upgrade publicado pela mesma página institucional",
            "summary": (
                "Primeira atualização independente publicada em uma página "
                "institucional que também hospeda outras notícias do sistema."
            ),
            "publishedAt": "2026-07-25T22:00:00-03:00",
            "source": {
                "name": "Fonte institucional",
                "url": "https://example.org/news",
                "id": "upgrade-alpha",
                "date": "2026-07-25",
                "checkedAt": "2026-07-25T22:00:00-03:00",
            },
            "turbo": {
                "clinicalImpact": "Mantém o histórico de mudanças separado e rastreável.",
                "temiHook": "Distinguir atualização editorial de conteúdo clínico.",
                "memoryAnchor": "ID ESPECÍFICO",
                "takeaways": [
                    "Uma identidade por notícia.",
                    "O domínio não define duplicidade.",
                ],
                "caveat": "O identificador editorial precisa permanecer estável.",
            },
            "audit": {
                "sourceChecked": True,
                "clinicalReview": "not-required",
                "noDirectPatientData": True,
                "reviewedAt": "2026-07-25T22:00:00-03:00",
                "reviewedBy": "Teste Antigravity",
            },
        }
        other = json.loads(json.dumps(base))
        other["title"] = "Segundo upgrade publicado pela mesma página institucional"
        other["source"]["id"] = "upgrade-beta"
        first = self.publisher.validate_post(base)
        second = self.publisher.validate_post(other)
        self.assertNotEqual(first["sourceIdentity"], second["sourceIdentity"])
        self.assertNotEqual(first["sourceHash"], second["sourceHash"])

        landing_first = json.loads(json.dumps(base))
        landing_first["source"].pop("id")
        landing_second = json.loads(json.dumps(landing_first))
        landing_second["title"] = (
            "Outra notícia independente publicada pela mesma landing page"
        )
        self.assertNotEqual(
            self.publisher.validate_post(landing_first)["sourceIdentity"],
            self.publisher.validate_post(landing_second)["sourceIdentity"],
        )

        doi_copy = json.loads(json.dumps(base))
        doi_copy["source"].pop("id")
        doi_copy["source"]["doi"] = "10.1000/same-publication"
        doi_copy["source"]["url"] = "https://journal.example/article-one"
        doi_mirror = json.loads(json.dumps(doi_copy))
        doi_mirror["source"]["url"] = "https://doi.org/10.1000/same-publication"
        self.assertEqual(
            self.publisher.validate_post(doi_copy)["sourceIdentity"],
            self.publisher.validate_post(doi_mirror)["sourceIdentity"],
        )

        pmid_copy = json.loads(json.dumps(base))
        pmid_copy["source"].pop("id")
        pmid_copy["source"]["pmid"] = "42476363"
        pmid_copy["source"]["url"] = "https://journal.example/pocus-review"
        pmid_mirror = json.loads(json.dumps(pmid_copy))
        pmid_mirror["source"].pop("pmid")
        pmid_mirror["source"]["url"] = (
            "https://pubmed.ncbi.nlm.nih.gov/42476363/?utm_source=test"
        )
        self.assertEqual(
            self.publisher.validate_post(pmid_copy)["sourceIdentity"],
            self.publisher.validate_post(pmid_mirror)["sourceIdentity"],
        )

    def test_public_architecture_and_home_are_connected(self):
        manifest = json.loads(
            (ROOT / "data/site_manifest.json").read_text(encoding="utf-8")
        )
        home = (ROOT / "index.html").read_text(encoding="utf-8")
        builder = (ROOT / "scripts_admin/build_public_site.py").read_text(
            encoding="utf-8"
        )
        worker = (ROOT / "sw.js").read_text(encoding="utf-8")
        webmanifest = json.loads(
            (ROOT / "manifest.webmanifest").read_text(encoding="utf-8")
        )
        self.assertEqual(
            manifest["canonicalRoutes"]["portal_vivo"],
            "17_Portal_Vivo/index.html",
        )
        self.assertIn('"17_Portal_Vivo"', builder)
        self.assertIn("17_Portal_Vivo/index.html", home)
        self.assertIn("17_Portal_Vivo/index.html", worker)
        self.assertIn("PORTAL_VIVO_PUBLICACAO", worker)
        self.assertIn(
            "17_Portal_Vivo/index.html",
            {shortcut["url"] for shortcut in webmanifest["shortcuts"]},
        )


if __name__ == "__main__":
    unittest.main()
