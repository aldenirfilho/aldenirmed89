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

    def test_feed_is_continuous_optional_and_merges_daily_radar(self):
        for marker in (
            "../15_Radar_Cientifico/data/radar.js",
            "IntersectionObserver",
            'id="sentinel"',
            "renderNext",
            "continue rolando",
            "Portal opcional",
            "não substitui",
        ):
            self.assertIn(marker.casefold(), self.html.casefold())

    def test_manual_composer_is_private_structured_and_chat_ready(self):
        for marker in (
            'id="composerForm"',
            'id="draftSource"',
            'id="draftNote"',
            'id="auditDraft"',
            'id="copyDraft"',
            'id="downloadDraft"',
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
        self.assertTrue(validated["id"])
        unsafe = json.loads(json.dumps(base))
        unsafe["turbo"]["clinicalImpact"] = (
            "Administre dose de 10 mg imediatamente em todos os pacientes."
        )
        with self.assertRaisesRegex(ValueError, "revisão clínica confirmada"):
            self.publisher.validate_post(unsafe)

    def test_publisher_updates_json_js_and_antiduplication_history(self):
        post = {
            "type": "study-note",
            "category": "POCUS",
            "priority": 2,
            "title": "Nota de estudo sobre integração do POCUS na avaliação",
            "summary": (
                "Registro educacional rastreável para organizar uma pergunta "
                "de estudo sem apresentar a observação como protocolo clínico."
            ),
            "publishedAt": "2026-07-25T21:30:00-03:00",
            "source": {
                "name": "Fonte de teste",
                "url": "https://example.org/portal-functional-test",
                "date": "2026-07-25",
                "checkedAt": "2026-07-25T21:30:00-03:00",
            },
            "turbo": {
                "clinicalImpact": "Estrutura a pergunta antes da leitura aprofundada.",
                "temiHook": "Revisar indicação, técnica, limitações e integração clínica.",
                "memoryAnchor": "JANELA → ACHADO → CONTEXTO",
                "takeaways": [
                    "Documentar a pergunta clínica.",
                    "Integrar o achado ao contexto e às limitações.",
                ],
                "caveat": "A nota não substitui treinamento nem validação do achado.",
            },
            "audit": {
                "sourceChecked": True,
                "clinicalReview": "pending",
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
