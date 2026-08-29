#!/usr/bin/env python3
"""Testes do gate fail-closed do roteiro de ativação."""

from __future__ import annotations

import base64
import contextlib
import io
import json
import tempfile
import unittest
from copy import deepcopy
from pathlib import Path

from scripts_admin import validate_activation_roadmap as validator


def valid_roadmap() -> dict:
    return {
        "schemaVersion": "1.0.0",
        "updatedAt": "2026-07-25",
        "items": [
            {
                "id": "publicacao-base",
                "title": "Confirmar publicação estática",
                "status": "live",
                "actor": "codex",
                "dependsOn": [],
                "estimatedTime": "10 min",
                "completionCriteria": [
                    "Página oficial responde por HTTPS com conteúdo esperado."
                ],
                "references": [
                    "https://aldenirfilho.github.io/aldenirmed89/"
                ],
                "microActions": [
                    {
                        "id": "validar-home",
                        "label": "Abrir a Home publicada",
                        "actor": "codex",
                        "estimatedTime": "2 min",
                        "completionCriterion": "Resposta HTTP 200 confirmada.",
                    }
                ],
            },
            {
                "id": "criar-homologacao",
                "title": "Criar projeto de homologação",
                "status": "owner-action",
                "actor": "owner",
                "dependsOn": ["publicacao-base"],
                "estimatedTime": "20 min",
                "completionCriteria": [
                    "Projeto de homologação existe sem segredo salvo no roadmap."
                ],
                "doNotShare": [
                    "Nunca compartilhe senha, token ou chave service_role.",
                    "Não cole credenciais no chat nem em arquivos versionados.",
                ],
                "references": ["https://supabase.com/dashboard/projects"],
                "microActions": [
                    {
                        "id": "abrir-supabase",
                        "label": "Abrir o painel oficial do Supabase",
                        "estimatedTime": "3 min",
                        "completionCriterion": "Painel oficial aberto na conta do proprietário.",
                        "doNotShare": [
                            "Não compartilhe senha, token, chave anon ou service_role."
                        ],
                    }
                ],
            },
        ],
    }


def issue_codes(document: dict) -> set[str]:
    return {issue.code for issue in validator.validate_document(document)}


def service_role_jwt() -> str:
    def encode(value: dict) -> str:
        raw = json.dumps(value, separators=(",", ":")).encode("utf-8")
        return base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")

    return f"{encode({'alg': 'HS256', 'typ': 'JWT'})}.{encode({'role': 'service_role'})}.{'x' * 32}"


class ActivationRoadmapTests(unittest.TestCase):
    def test_valid_roadmap_passes_and_educational_warnings_are_not_secrets(self) -> None:
        document = valid_roadmap()
        document["securityNotice"] = (
            "Nunca publique sb_secret_, sk-, AKIA, GitHub PAT, token, senha "
            "ou a chave service_role."
        )
        self.assertEqual(validator.validate_document(document), [])

    def test_requires_supported_schema_version_and_nonempty_items(self) -> None:
        document = valid_roadmap()
        document["schemaVersion"] = "2.0.0"
        document["items"] = []
        codes = issue_codes(document)
        self.assertIn("schema.version", codes)
        self.assertIn("schema.items", codes)

    def test_ids_statuses_and_actors_are_strict(self) -> None:
        document = valid_roadmap()
        document["items"][0]["status"] = "done"
        document["items"][0]["actor"] = "bot"
        document["items"][1]["id"] = "publicacao-base"
        document["items"][1]["microActions"][0]["id"] = "ID INVALIDO"
        codes = issue_codes(document)
        self.assertIn("status.invalid", codes)
        self.assertIn("actor.invalid", codes)
        self.assertIn("id.duplicate", codes)
        self.assertIn("id.invalid", codes)

    def test_dependency_must_exist_and_graph_must_be_acyclic(self) -> None:
        missing = valid_roadmap()
        missing["items"][1]["dependsOn"] = ["nao-existe"]
        self.assertIn("dependency.missing", issue_codes(missing))

        cycle = valid_roadmap()
        cycle["items"][0]["dependsOn"] = ["criar-homologacao"]
        self.assertIn("dependency.cycle", issue_codes(cycle))

        self_dependency = valid_roadmap()
        self_dependency["items"][0]["dependsOn"] = ["publicacao-base"]
        self.assertIn("dependency.self", issue_codes(self_dependency))

    def test_micro_actions_require_instruction_time_and_completion_criterion(self) -> None:
        document = valid_roadmap()
        action = document["items"][0]["microActions"][0]
        action["label"] = ""
        action["estimatedTime"] = "0 min"
        action["completionCriterion"] = ""
        codes = issue_codes(document)
        self.assertIn("micro_action.label", codes)
        self.assertIn("micro_action.estimated_time", codes)
        self.assertIn("micro_action.completion_criterion", codes)

    def test_owner_item_and_owner_micro_action_require_do_not_share(self) -> None:
        document = valid_roadmap()
        document["items"][1].pop("doNotShare")
        document["items"][1]["microActions"][0].pop("doNotShare")
        issues = validator.validate_document(document)
        owner_issues = [
            issue for issue in issues if issue.code == "owner.do_not_share_required"
        ]
        self.assertEqual(len(owner_issues), 2)

    def test_urls_must_be_https_on_exactly_allowlisted_domain_boundaries(self) -> None:
        http_document = valid_roadmap()
        http_document["items"][0]["references"] = ["http://github.com/example"]
        self.assertIn("url.https_required", issue_codes(http_document))

        evil_document = valid_roadmap()
        evil_document["items"][0]["references"] = [
            "https://github.com.attacker.example/phishing"
        ]
        self.assertIn("url.domain_not_allowed", issue_codes(evil_document))

        credential_url = valid_roadmap()
        credential_url["items"][0]["references"] = [
            "https://supabase.com/docs?token=filled-value"
        ]
        self.assertIn("url.credential_query", issue_codes(credential_url))

    def test_url_named_field_cannot_hide_non_url_or_nonstandard_port(self) -> None:
        document = valid_roadmap()
        document["items"][0]["actionUrl"] = "abrir depois"
        self.assertIn("url.invalid", issue_codes(document))

        document = valid_roadmap()
        document["items"][0]["actionUrl"] = "https://supabase.com:8443/dashboard"
        self.assertIn("url.port_forbidden", issue_codes(document))

    def test_rejects_high_confidence_secret_patterns(self) -> None:
        secrets = (
            "sb_secret_abcdefghijklmnopqrstuvwxyz",
            "sk-abcdefghijklmnopqrstuvwxyz123456",
            "github_pat_abcdefghijklmnopqrstuvwxyz123456",
            "ghp_abcdefghijklmnopqrstuvwxyz123456",
            "AKIAABCDEFGHIJKLMNOP",
            service_role_jwt(),
        )
        for secret in secrets:
            with self.subTest(prefix=secret[:8]):
                document = valid_roadmap()
                document["items"][0]["notes"] = secret
                self.assertIn("secret.detected", issue_codes(document))

    def test_rejects_filled_credential_fields_but_allows_blank_placeholder(self) -> None:
        document = valid_roadmap()
        document["items"][0]["apiKey"] = "valor-real-preenchido"
        self.assertIn("secret.sensitive_field_filled", issue_codes(document))

        blank = valid_roadmap()
        blank["items"][0]["apiKey"] = ""
        self.assertNotIn("secret.sensitive_field_filled", issue_codes(blank))

        placeholder = valid_roadmap()
        placeholder["items"][0]["apiKey"] = "<redacted>"
        self.assertNotIn("secret.sensitive_field_filled", issue_codes(placeholder))

    def test_rejects_assigned_token_in_free_text_without_flagging_warning(self) -> None:
        document = valid_roadmap()
        document["items"][0]["notes"] = "token=valor-real-preenchido"
        self.assertIn("secret.detected", issue_codes(document))

        warning = valid_roadmap()
        warning["items"][0]["notes"] = "Não compartilhe token=<redacted>."
        self.assertNotIn("secret.detected", issue_codes(warning))

    def test_cli_json_output_does_not_echo_detected_secret(self) -> None:
        secret = "sb_secret_abcdefghijklmnopqrstuvwxyz"
        document = valid_roadmap()
        document["items"][0]["notes"] = secret
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / "roadmap.json"
            path.write_text(json.dumps(document), encoding="utf-8")
            output = io.StringIO()
            with contextlib.redirect_stdout(output):
                result = validator.main([str(path), "--json"])
        rendered = output.getvalue()
        payload = json.loads(rendered)
        self.assertEqual(result, 1)
        self.assertFalse(payload["ok"])
        self.assertNotIn(secret, rendered)
        self.assertIn("secret.detected", rendered)

    def test_missing_or_invalid_json_fails_closed_without_source_excerpt(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            missing = Path(temporary) / "missing.json"
            self.assertEqual(
                [issue.code for issue in validator.validate_path(missing)],
                ["file.unreadable"],
            )
            invalid = Path(temporary) / "invalid.json"
            invalid.write_text('{"credential":"do-not-echo"', encoding="utf-8")
            issues = validator.validate_path(invalid)
            self.assertEqual([issue.code for issue in issues], ["json.invalid"])
            self.assertNotIn("do-not-echo", issues[0].message)

    def test_validation_is_read_only(self) -> None:
        document = valid_roadmap()
        before = deepcopy(document)
        validator.validate_document(document)
        self.assertEqual(document, before)


if __name__ == "__main__":
    unittest.main()
