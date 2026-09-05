#!/usr/bin/env python3
"""Contratos de segurança e operação do Centro da Tripulação."""

from __future__ import annotations

import json
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CREW = ROOT / "18_Centro_Tripulacao"


class CrewCenterTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.html = (CREW / "index.html").read_text(encoding="utf-8")
        cls.app = (CREW / "assets/app.js").read_text(encoding="utf-8")
        cls.css = (CREW / "assets/styles.css").read_text(encoding="utf-8")
        cls.config = (CREW / "config.example.js").read_text(encoding="utf-8")
        cls.schema = (CREW / "scripts/supabase-schema.sql").read_text(
            encoding="utf-8"
        )
        cls.backend_docs = (CREW / "ATIVAR_BACKEND.md").read_text(
            encoding="utf-8"
        )
        cls.automation = (
            CREW / "automation/send_daily_newsletter.mjs"
        ).read_text(encoding="utf-8")

    def test_required_static_package_is_complete(self) -> None:
        required = (
            "index.html",
            "assets/app.js",
            "assets/styles.css",
            "config.example.js",
            "data/public-metrics.json",
            "README.md",
            "ATIVAR_BACKEND.md",
            "scripts/supabase-schema.sql",
            "automation/send_daily_newsletter.mjs",
            "automation/newsletter-workflow.example.yml",
            "automation/README.md",
        )
        for relative in required:
            self.assertTrue((CREW / relative).is_file(), relative)

    def test_unconfigured_mode_never_invents_metrics_or_identity(self) -> None:
        metrics = json.loads(
            (CREW / "data/public-metrics.json").read_text(encoding="utf-8")
        )
        self.assertEqual(metrics["status"], "disconnected")
        self.assertFalse(metrics["connected"])
        self.assertIsNone(metrics["subscriberCount"])
        self.assertIsNone(metrics["totalViews"])
        self.assertEqual(metrics["sectionViews"], [])
        self.assertIn('mode: "disconnected"', self.config)
        for marker in (
            "Serviço ainda não conectado",
            "Nenhum login será simulado",
            "nada foi enviado",
            "nenhum número foi estimado",
        ):
            self.assertIn(marker.casefold(), (self.html + self.app).casefold())
        self.assertIn("if (raw === null) return fallback;", self.app)
        self.assertIn(
            "parsed === null || parsed === undefined ? fallback : parsed",
            self.app,
        )

    def test_public_mission_metrics_and_preferences_are_accessible(self) -> None:
        for marker in (
            "Tripulantes em busca de conhecimento científico",
            'id="subscriberCount"',
            'id="totalViews"',
            'id="sectionMetricsBody"',
            'id="preferencesForm"',
            'id="themePreference"',
            'id="languagePreference"',
            'id="colorModePreference"',
            'id="notificationPreference"',
            'id="publicProfilePreference"',
            "Perfil público separado e sempre opcional",
            'class="skip-link"',
            "prefers-reduced-motion",
            "prefers-color-scheme: light",
            "@media print",
            "background:#fff!important",
        ):
            self.assertIn(marker, self.html + self.css)
        self.assertIn("antigravity:a11y:v1", self.app)
        self.assertIn('data-visual-profile="aerospace"', self.html)
        self.assertIn('visualProfile: "aerospace"', self.app)
        self.assertIn('const BRAND_THEME_RELEASE = "aerospace-primary-v1"', self.app)
        self.assertIn("previousBrandDefault", self.app)
        for marker in ("bruxa-rustica-moderna", "total-orange", "mystic-aerospace", "#0b100c"):
            self.assertIn(marker, self.app + self.css + self.html)
        self.assertIn("html[data-theme][data-visual-profile]{color-scheme:light", self.css)
        self.assertIn('globalA11y.theme === "system"', self.app)
        self.assertIn('aria-label="Ativar visualização clara"', self.html)
        for mode in ('value="light"', 'value="dark"', 'value="system"'):
            self.assertIn(mode, self.html)

    def test_prepared_capabilities_are_labeled_and_public_profile_is_fail_closed(self) -> None:
        for marker in (
            "Preferência preparada: a tradução completa deste Centro ainda não está ativa.",
            "Preferência preparada: marcar esta opção ainda não envia alertas nem e-mails.",
            'id="publicProfileStatus"',
            "ainda não existe mural público ativo",
        ):
            self.assertIn(marker, self.html)
        self.assertIn("config.enablePublicProfiles === true", self.app)
        self.assertIn("publicProfileCheckbox.disabled = !publicProfilesEnabled;", self.app)
        self.assertIn("publicProfileCheckbox.checked = false;", self.app)

    def test_deep_link_aliases_resolve_to_gated_canonical_views(self) -> None:
        for marker in (
            'listeningPanel: "listening"',
            'manifestacao: "listening"',
            'ownerNotebook: "admin"',
            'const LISTENING_CHANNELS = new Set(["manifestacao", "correcao", "uso-indevido"])',
            "requestedViewFromLocation()",
            'if (LISTENING_CHANNELS.has(channel)) return "listening";',
        ):
            self.assertIn(marker, self.app)
        self.assertIn('id="adminContent" hidden', self.html)
        self.assertIn("if (!state.isAdmin)", self.app)

    def test_auth_password_and_admin_directory_are_privacy_first(self) -> None:
        self.assertIn('type="password"', self.html)
        self.assertIn('autocomplete="current-password"', self.html)
        self.assertIn('id="adminContent" hidden', self.html)
        self.assertIn("if (!state.session || !state.isAdmin) return;", self.app)
        self.assertIn("state.isAdmin = Array.isArray(admins)", self.app)
        self.assertIn("passwordInput.value = \"\";", self.app)
        self.assertLess(
            self.app.index('passwordInput.value = "";'),
            self.app.index("await state.adapter.signIn"),
        )
        self.assertNotIn("innerHTML", self.app)
        self.assertNotIn("document.write", self.app)
        self.assertNotIn("eval(", self.app)
        self.assertNotIn("SUPABASE_SERVICE_ROLE_KEY", self.app)
        self.assertNotIn("SUPABASE_SERVICE_ROLE_KEY", self.config)
        self.assertNotIn("sessionStorage", self.app)
        self.assertNotRegex(
            self.app,
            r"(localStorage|sessionStorage)\.setItem\([^)]*password",
        )

    def test_sign_out_clears_session_keys_and_sensitive_dom(self) -> None:
        for marker in (
            "state.subscriptionRows = [];",
            "state.activeThread = null;",
            "state.adminActiveThread = null;",
            'state.adapter.setAccessToken("")',
            'byId("protocolValue").textContent = "";',
            'byId("anonymousKeyValue").textContent = "";',
            'byId("sessionIdentity").textContent = "";',
            'byId("adminDirectoryBody").replaceChildren();',
            'byId("threadMessages").replaceChildren(',
            'byId("adminThreadMessages").replaceChildren(',
            'byId("ownerDocumentsList").replaceChildren(',
            'byId("credentialList").replaceChildren();',
        ):
            self.assertIn(marker, self.app)
        self.assertNotIn("innerHTML", self.app)

    def test_reset_removes_both_preference_keys_and_applies_defaults(self) -> None:
        reset_block = self.app.split(
            'byId("resetLocalPreferences").addEventListener("click", () => {', 1
        )[1].split("});", 1)[0]
        self.assertIn("removeStorage(localStorage, PREFERENCES_KEY);", reset_block)
        self.assertIn("removeStorage(localStorage, A11Y_PREFERENCES_KEY);", reset_block)
        self.assertIn("fillPreferences(DEFAULT_PREFERENCES);", reset_block)

    def test_adapter_restricts_origins_and_uses_text_nodes(self) -> None:
        for marker in (
            "allowedAppOrigins",
            "allowedApiOrigins",
            "allowedApiOrigins.has(url.origin)",
            "url.origin !== this.baseUrl",
            "credentials: \"omit\"",
            "referrerPolicy: \"no-referrer\"",
            ".textContent",
            "replaceChildren",
            "cleanText",
            "manifestationEndpoint",
            "hasManifestationGateway",
            'recordSectionView("centro-tripulacao")',
        ):
            self.assertIn(marker, self.app + self.config)
        self.assertIn(
            "connect-src 'self' https://aldenirrochadeoliveirafilho1989.goatcounter.com;",
            self.html,
        )
        self.assertIn("script-src 'self' https://gc.zgo.at", self.html)

    def test_newsletter_requires_consent_and_supports_cancellation(self) -> None:
        for marker in (
            'id="newsletterConsent"',
            'id="unsubscribeButton"',
            "consent_at",
            "unsubscribed_at",
            "status: \"unsubscribed\"",
            "frequency: \"daily\"",
        ):
            self.assertIn(marker, self.html + self.app + self.schema)
        self.assertIn("active_subscription_requires_consent", self.schema)
        self.assertIn("unsubscribe_newsletter", self.schema)

    def test_metrics_page_session_and_admin_filter_are_bounded(self) -> None:
        self.assertIn("const PAGE_SESSION_ID = (() => {", self.app)
        self.assertEqual(self.app.count("pageSessionId: PAGE_SESSION_ID"), 1)
        self.assertIn(
            "`record_section_view` deduplica seção/carregamento/dia",
            self.backend_docs,
        )
        self.assertIn(
            "recarregar a página inicia uma nova visualização",
            self.backend_docs,
        )
        self.assertIn(
            'state.connected && payload && payload.status === "connected"',
            self.app,
        )
        self.assertIn(
            "state.subscriptionRows = Array.isArray(subscriptions) ? subscriptions : [];",
            self.app,
        )
        filter_block = self.app.split(
            'byId("directorySearch").addEventListener("input", (event) => {', 1
        )[1].split(
            'byId("manifestationCategory").addEventListener', 1
        )[0]
        self.assertIn("state.subscriptionRows", filter_block)
        self.assertNotIn("getAdminSubscriptions", filter_block)

    def test_listening_portal_has_categories_protocol_and_async_thread(self) -> None:
        for category in (
            "agradecimento",
            "sugestao",
            "contribuicao",
            "informacao",
            "notificacao",
            "reclamacao",
            "outra",
        ):
            self.assertIn(f'value="{category}"', self.html)
        for marker in (
            "Especifique a categoria",
            'value="anonymous"',
            'value="identified"',
            'id="manifestationConsent"',
            'id="protocolResult"',
            'id="anonymousLookupForm"',
            'id="crewReplyForm"',
            "conversa assíncrona",
            "não é chat em tempo real",
            "Canal de e-mail em configuração",
            "Contribua com conteúdo próprio ou autorizado.",
            "outras pessoas ou empresas sem licença",
            "Conheça Aldenir",
        ):
            self.assertIn(marker.casefold(), self.html.casefold())
        self.assertIn("PROTOCOL_PATTERN", self.app)
        self.assertIn("crypto.getRandomValues", self.app)
        self.assertIn("p_anonymous_access_token", self.app)

    def test_admin_manifestation_inbox_is_gated_and_reply_capable(self) -> None:
        for marker in (
            'id="adminInboxList"',
            'id="adminThreadMessages"',
            'id="adminReplyForm"',
            "getAdminManifestations",
            "if (!state.session || !state.isAdmin) return;",
            "replyAsAdmin",
            "reply_manifestation",
        ):
            self.assertIn(marker, self.html + self.app)

    def test_owner_notebook_is_private_discreet_and_role_gated(self) -> None:
        for marker in (
            'id="ownerNotebook"',
            'aria-labelledby="ownerNotebookTitle" hidden',
            "Caderno do Idealizador",
            "Responsabilidade editorial",
            "GitHub Pages não protege arquivos estáticos",
            "sem transformar experiência pessoal em superioridade",
            'id="ownerDocumentFields" disabled',
            'id="credentialFields" disabled',
        ):
            self.assertIn(marker, self.html)
        for category in (
            "biografia",
            "curriculo",
            "historia",
            "experiencia",
            "reflexao",
            "posicao",
            "explicacao",
            "legado",
        ):
            self.assertIn(f'value="{category}"', self.html)
        for document_status in ("draft", "review", "private", "publish-approved"):
            self.assertIn(f'value="{document_status}"', self.html)
        for marker in (
            "state.isOwner",
            'row.role === "owner"',
            "if (!state.connected || !state.session || !state.isOwner) return;",
            "getOwnerDocuments",
            "getOwnerCredentialSubmissions",
        ):
            self.assertIn(marker, self.app)

    def test_owner_schema_separates_documents_credentials_and_publication(self) -> None:
        for marker in (
            "create table if not exists public.owner_documents",
            "create table if not exists public.owner_credential_verifications",
            "create or replace function public.is_crew_owner()",
            "role in ('admin','owner')",
            "owner exclusively manages private documents",
            "owner submits unverified credentials",
            "verification_status = 'pending'",
            "pending_credential_is_not_self_verified",
            "publish_approval_requires_workflow",
            "publication_workflow_reference",
            "alter table public.owner_documents enable row level security",
            "alter table public.owner_credential_verifications enable row level security",
        ):
            self.assertIn(marker, self.schema)
        self.assertNotIn("grant select on public.owner_documents to anon", self.schema)
        self.assertNotIn(
            "grant select on public.owner_credential_verifications to anon",
            self.schema,
        )
        self.assertNotIn(
            "grant update on public.owner_credential_verifications to authenticated",
            self.schema,
        )

    def test_owner_bootstrap_is_manual_and_creates_no_account(self) -> None:
        for marker in (
            "Bootstrap manual da conta owner",
            "UUID-REAL-DO-USUARIO-AUTH",
            "'owner'",
            "não cria conta, senha, e-mail ou UUID",
            "definida somente pelo fluxo do provedor",
            "não crie Markdown",
            "publish-approved",
            "não superioridade",
        ):
            self.assertIn(marker.casefold(), self.backend_docs.casefold())

    def test_schema_enables_rls_and_separates_public_private_data(self) -> None:
        tables = (
            "admin_users",
            "profiles",
            "subscriptions",
            "section_views",
            "section_daily_aggregates",
            "manifestations",
            "manifestation_messages",
        )
        for table in tables:
            self.assertIn(
                f"alter table public.{table} enable row level security;",
                self.schema,
            )
        for marker in (
            "public.is_crew_admin()",
            "crew can read own profile",
            "crew can read only own manifestations",
            "anonymous_access_hash",
            "consent_to_process_at",
            "consent_to_contact",
            "crew_anonymous_thread",
            "reply_anonymous_manifestation",
            "crew_public_profiles",
            "public_profile is true",
            "security definer",
            "set search_path = public, pg_temp",
        ):
            self.assertIn(marker, self.schema)
        self.assertNotIn("contact_email text", self.schema.split(
            "create or replace function public.crew_public_profiles()", 1
        )[1])
        self.assertNotIn(
            "grant insert on public.manifestations to anon, authenticated",
            self.schema,
        )
        self.assertNotIn(
            "grant insert on public.section_views to anon, authenticated",
            self.schema,
        )
        self.assertIn(
            "grant execute on function public.record_section_view(text, text) to service_role;",
            self.schema,
        )
        self.assertIn(
            ") to service_role;\ngrant execute on function public.crew_manifestation_thread",
            self.schema,
        )
        self.assertIn(
            "grant execute on function public.crew_anonymous_thread(text, text) to service_role;",
            self.schema,
        )
        self.assertIn(
            "grant execute on function public.reply_anonymous_manifestation(text, text, text) to service_role;",
            self.schema,
        )
        self.assertNotIn(
            "grant execute on function public.crew_public_profiles() to anon",
            self.schema,
        )
        self.assertNotIn("to_jsonb(v_manifestation)", self.schema)
        self.assertNotIn("p_contact_email", self.schema)
        self.assertIn("p_verified_user_id uuid", self.schema)
        self.assertIn("p_verified_email text", self.schema)
        self.assertNotIn("p_verified_email", self.app)

    def test_docs_require_rate_limit_captcha_and_no_frontend_service_role(self) -> None:
        for marker in (
            "CAPTCHA",
            "rate limit",
            "allowlist",
            "não armazene IP bruto",
            "service-role",
            "nunca",
            "Canal de e-mail em configuração",
            "conversa é assíncrona",
            "manifestationEndpoint",
            "não libere EXECUTE direto",
        ):
            self.assertIn(marker.casefold(), self.backend_docs.casefold())

    def test_newsletter_automation_is_inactive_and_dry_run_by_default(self) -> None:
        workflow = CREW / "automation/newsletter-workflow.example.yml"
        self.assertNotIn(".github/workflows", str(workflow))
        self.assertIn("workflow_dispatch", workflow.read_text(encoding="utf-8"))
        for marker in (
            'const sendMode = process.argv.includes("--send")',
            "CONFIRM_NEWSLETTER_SEND",
            "EMAIL_PROVIDER_ALLOWED_HOSTS",
            "consent_at=not.is.null",
            "unsubscribed_at=is.null",
            "Nenhum e-mail enviado",
            "Idempotency-Key",
        ):
            self.assertIn(marker, self.automation)
        self.assertNotIn("console.log(recipient", self.automation)

    def test_javascript_files_pass_syntax_check(self) -> None:
        for path in (
            CREW / "assets/app.js",
            CREW / "automation/send_daily_newsletter.mjs",
        ):
            subprocess.run(
                ["node", "--check", str(path)],
                check=True,
                capture_output=True,
                text=True,
            )


if __name__ == "__main__":
    unittest.main()
