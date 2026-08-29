#!/usr/bin/env python3
"""Contratos do canal público e discreto Conheça Aldenir."""

from __future__ import annotations

import json
import unittest
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
CHANNEL = ROOT / "20_Conheca_Aldenir"
ALLOWED_CATEGORIES = {
    "reflexoes",
    "ideias",
    "insights",
    "promessas-publicas",
    "relatos",
    "manifestacoes",
    "historia-biografia",
}
ALLOWED_DOCUMENT_CATEGORIES = {
    "apresentacao",
    "biografia",
    "curriculo",
    "historia",
    "experiencia-profissional",
    "relatos",
    "manifestacoes",
}


class ConhecaAldenirTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.html = (CHANNEL / "index.html").read_text(encoding="utf-8")
        cls.css = (CHANNEL / "assets/styles.css").read_text(encoding="utf-8")
        cls.app = (CHANNEL / "assets/app.js").read_text(encoding="utf-8")
        cls.readme = (CHANNEL / "README.md").read_text(encoding="utf-8")
        cls.config = (CHANNEL / "config.js").read_text(encoding="utf-8")
        cls.config_example = (CHANNEL / "config.example.js").read_text(
            encoding="utf-8"
        )
        cls.feed = json.loads(
            (CHANNEL / "data/content/public-feed.json").read_text(
                encoding="utf-8"
            )
        )
        cls.documents = json.loads(
            (CHANNEL / "data/content/public-documents.json").read_text(
                encoding="utf-8"
            )
        )

    def test_static_package_is_complete(self) -> None:
        for relative in (
            "index.html",
            "assets/styles.css",
            "assets/app.js",
            "config.js",
            "config.example.js",
            "data/content/public-feed.json",
            "data/content/public-documents.json",
            "README.md",
        ):
            self.assertTrue((CHANNEL / relative).is_file(), relative)

    def test_channel_is_discreet_separate_and_accessible(self) -> None:
        for marker in (
            "Conheça Aldenir",
            "Idealizador e responsável editorial da Antigravity",
            "A missão permanece no centro",
            "Pessoal não significa automaticamente público",
            "Caderno do Idealizador",
            "Documentos públicos",
            "Blog e feed público contínuo",
            "Conversa com o idealizador",
            "Integridade Editorial",
            'class="skip-link"',
            'role="search"',
            'aria-live="polite"',
            "../18_Centro_Tripulacao/",
            "../19_Integridade_Editorial/",
            "ATV · TURBO TEMI · ALD 360",
        ):
            self.assertIn(marker, self.html)
        self.assertIn("@media (max-width:720px)", self.css)
        self.assertIn("@media (prefers-reduced-motion:reduce)", self.css)
        self.assertIn("@media (prefers-contrast:more)", self.css)

    def test_no_unverified_professional_or_biographical_claims(self) -> None:
        public_surface = (self.html + self.readme).casefold()
        disallowed_claims = (
            "médico clínico geral mestre",
            "mestre em",
            "especialista em",
            "residência em anestesia",
            "abandono da residência",
        )
        for claim in disallowed_claims:
            self.assertNotIn(claim, public_surface)

    def test_feed_contains_only_public_approved_contract_entries(self) -> None:
        self.assertEqual(self.feed["schemaVersion"], "1.0.0")
        self.assertEqual(self.feed["channel"], "conheca-aldenir")
        self.assertIsInstance(self.feed["entries"], list)
        ids: set[str] = set()
        for entry in self.feed["entries"]:
            self.assertEqual(entry["status"], "public-approved")
            self.assertEqual(entry["visibility"], "public")
            self.assertIn(entry["category"], ALLOWED_CATEGORIES)
            self.assertRegex(entry["id"], r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
            self.assertNotIn(entry["id"], ids)
            ids.add(entry["id"])
            self.assertTrue(entry["title"].strip())
            self.assertTrue(entry["content"].strip())
            self.assertTrue(entry["version"].strip())
            datetime.fromisoformat(entry["publishedAt"])
            datetime.fromisoformat(entry["updatedAt"])
            self.assertIsInstance(entry["references"], list)
            if entry["kind"] == "factual":
                self.assertGreaterEqual(len(entry["references"]), 1)
            for reference in entry["references"]:
                parsed = urlparse(reference["url"])
                self.assertEqual(parsed.scheme, "https")
                self.assertTrue(parsed.netloc)
                self.assertTrue(reference["label"].strip())

    def test_documents_are_public_approved_and_verification_gated(self) -> None:
        self.assertEqual(self.documents["schemaVersion"], "1.0.0")
        self.assertEqual(
            self.documents["channel"],
            "conheca-aldenir-public-documents",
        )
        self.assertEqual(
            set(self.documents["plannedCategories"]),
            ALLOWED_DOCUMENT_CATEGORIES,
        )
        ids: set[str] = set()
        for entry in self.documents["entries"]:
            self.assertEqual(entry["status"], "public-approved")
            self.assertEqual(entry["visibility"], "public")
            self.assertIn(entry["category"], ALLOWED_DOCUMENT_CATEGORIES)
            self.assertRegex(entry["id"], r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
            self.assertNotIn(entry["id"], ids)
            ids.add(entry["id"])
            self.assertTrue(entry["title"].strip())
            self.assertTrue(entry["content"].strip())
            self.assertTrue(entry["version"].strip())
            datetime.fromisoformat(entry["publishedAt"])
            datetime.fromisoformat(entry["updatedAt"])
            self.assertIn(
                entry["verificationStatus"],
                {"not-applicable", "self-reported", "verified"},
            )
            self.assertIsInstance(entry["references"], list)
            if entry["kind"] in {"factual", "credential"}:
                self.assertEqual(entry["verificationStatus"], "verified")
                self.assertGreaterEqual(len(entry["references"]), 1)
            for reference in entry["references"]:
                parsed = urlparse(reference["url"])
                self.assertEqual(parsed.scheme, "https")
                self.assertTrue(parsed.netloc)
                self.assertTrue(reference["label"].strip())
        serialized = json.dumps(self.documents, ensure_ascii=False)
        self.assertNotIn('"status": "draft"', serialized)
        self.assertNotIn('"visibility": "private"', serialized)

    def test_runtime_is_fail_closed_and_uses_safe_dom_rendering(self) -> None:
        for marker in (
            'if (entry.status !== "public-approved") return null;',
            'if (entry.visibility !== "public") return null;',
            'if (entry.kind === "factual" && references.length === 0) return null;',
            "normalizeApprovedDocument",
            'kind === "factual" || kind === "credential"',
            'verificationStatus !== "verified"',
            ".textContent",
            "replaceChildren",
            "credentials: \"same-origin\"",
            "noopener noreferrer nofollow external",
            "Nenhum conteúdo alternativo foi inventado",
        ):
            self.assertIn(marker, self.app + self.html)
        for unsafe in ("innerHTML", "document.write", "eval("):
            self.assertNotIn(unsafe, self.app)
        self.assertIn(
            "connect-src 'self' https://aldenirrochadeoliveirafilho1989.goatcounter.com;",
            self.html,
        )
        self.assertIn("script-src 'self' https://gc.zgo.at", self.html)

    def test_conversation_is_prepared_but_fail_closed(self) -> None:
        for category in (
            "pergunta",
            "contato-pessoal",
            "produtividade",
            "contribuicao-operacional",
            "contribuicao-cientifica",
            "relato",
        ):
            self.assertIn(f'value="{category}"', self.html)
        for marker in (
            "Conversa com o idealizador",
            "Centro da Tripulação",
            "sugestões, críticas, pedidos, reclamações",
            "E-mail institucional em ativação",
            "AldenGrav360",
            'id="conversationForm"',
            'id="threadLookupForm"',
            'id="threadMessages"',
            'id="rightsConsent"',
            'id="privacyConsent"',
            "obra de terceiro sem autorização",
            "dados identificáveis de pacientes",
            "Uma tentativa por minuto",
            "não é salvo nesta página",
        ):
            self.assertIn(marker.casefold(), self.html.casefold())
        for control_id in (
            "conversationCategory",
            "subscriberEmail",
            "conversationSubject",
            "conversationBody",
            "conversationSubmit",
            "threadProtocol",
            "threadAccessCode",
            "threadLookupSubmit",
        ):
            self.assertRegex(
                self.html,
                rf'id="{control_id}"[^>]*\bdisabled\b',
            )

    def test_gateway_config_has_no_live_endpoint_email_or_secret(self) -> None:
        for source in (self.config, self.config_example):
            self.assertIn('mode: "disconnected"', source)
            self.assertIn('conversationEndpoint: ""', source)
            self.assertIn('threadEndpoint: ""', source)
            self.assertIn('contactEmail: ""', source)
            self.assertIn('suggestedEmailIdentity: "AldenGrav360"', source)
            self.assertNotRegex(source, r"(?i)(sk-|eyJ[A-Za-z0-9_-]{10,})")
        self.assertLess(
            self.html.index('src="./config.js"'),
            self.html.index('src="./assets/app.js"'),
        )
        for marker in (
            'runtimeConfig.mode !== "gateway"',
            'url.protocol === "https:"',
            "runtimeConfig.allowedGatewayOrigins.has(url.origin)",
            'endpoint.origin === window.location.origin ? "same-origin" : "omit"',
            'referrerPolicy: "no-referrer"',
            "minimumSubmissionIntervalMs",
            "accessCode = \"\";",
            "THREAD_AUTHORS",
        ):
            self.assertIn(marker, self.app)
        self.assertNotIn("sessionStorage", self.app)
        self.assertNotIn("localStorage.setItem", self.app)
        self.assertNotIn("Authorization", self.app)
        self.assertNotIn("Bearer ", self.app)

    def test_global_visual_profile_is_supported_without_tracking(self) -> None:
        for marker in (
            "antigravity:a11y:v1",
            "visualProfile",
            "aerospace-light",
            "rustic-light",
            "modern-serious",
        ):
            self.assertIn(marker, self.app + self.css + self.html)
        for forbidden in (
            "google-analytics",
            "googletagmanager",
            "facebook.com/tr",
            "mixpanel",
        ):
            self.assertNotIn(forbidden, (self.app + self.html).casefold())

    def test_readme_requires_private_first_human_review(self) -> None:
        for marker in (
            "Este diretório é estático e público",
            "Nenhum rascunho",
            "GitHub Pages não protege arquivos",
            "Caderno do Idealizador autenticado",
            'status: "public-approved"',
            'visibility: "public"',
            "fonte primária ou institucional",
            "credenciais profissionais",
            "assessoria jurídica",
            "data/content/public-documents.json",
            "kind: \"credential\"",
            "AldenGrav360",
            "gateway",
            "Não envie nem publique obra ou material de terceiro",
            "Nunca enviar dados clínicos identificáveis de pacientes",
            "config.example.js",
        ):
            self.assertIn(marker, self.readme)


if __name__ == "__main__":
    unittest.main()
