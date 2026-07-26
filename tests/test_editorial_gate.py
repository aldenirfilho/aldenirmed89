#!/usr/bin/env python3
"""Contratos do gate editorial incremental e fail-closed."""

from __future__ import annotations

import copy
import importlib.util
import json
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
POLICY_PATH = ROOT / "data/editorial/policy.json"
REGISTRY_PATH = ROOT / "data/editorial/registry.json"
PROVENANCE_PATH = ROOT / "data/editorial/editorial-provenance.json"
GATE_PATH = ROOT / "scripts_admin/editorial_gate.py"


def load_module():
    spec = importlib.util.spec_from_file_location("editorial_gate", GATE_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("editorial_gate.py indisponível")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def valid_medical_item(path: str = "novo-conteudo.html"):
    return {
        "id": "conteudo-medico-validado",
        "classification": "public-cited",
        "paths": [path],
        "publishTargets": [path],
        "medical": True,
        "ownerApproval": True,
        "reviewer": "Revisão editorial humana",
        "clinicalReviewer": "Revisão clínica humana",
        "reviewedAt": "2026-07-25T10:00:00-03:00",
        "rights": {
            "basis": "owned",
            "statement": "Conteúdo autoral com revisão documentada."
        },
        "personalData": {"contains": False},
        "professionalClaims": [],
        "sources": [
            {
                "title": "Diretriz clínica oficial",
                "url": "https://example.org/diretriz",
                "publishedAt": "2026-07-20"
            }
        ]
    }


class EditorialGateConfigurationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.guard = load_module()
        cls.policy = json.loads(POLICY_PATH.read_text(encoding="utf-8"))
        cls.registry = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))

    def test_checked_in_policy_registry_and_scaffold_are_valid(self):
        self.assertEqual(self.guard.validate_policy(self.policy), [])
        registry_issues, index = self.guard.validate_registry(
            self.registry, self.policy
        )
        self.assertEqual(registry_issues, [])
        expected_paths = {
            path
            for item in self.registry["items"]
            for path in item["paths"]
        }
        self.assertGreater(len(expected_paths), 0)
        self.assertEqual(set(index), expected_paths)
        provenance = json.loads(PROVENANCE_PATH.read_text(encoding="utf-8"))
        self.assertEqual(self.guard.validate_provenance_scaffold(provenance), [])

    def test_policy_has_exactly_five_classes_and_quarantines_doubt(self):
        self.assertEqual(
            set(self.policy["classes"]),
            {
                "public-approved",
                "public-cited",
                "restricted-owner",
                "quarantine",
                "rejected",
            },
        )
        self.assertEqual(self.policy["defaultDecision"], "quarantine")
        self.assertTrue(self.policy["failClosed"])
        self.assertIn(
            "public_site/",
            self.policy["scanning"]["nonPublicSourcePrefixes"],
        )
        self.assertEqual(
            {
                key
                for key, value in self.policy["classes"].items()
                if value["public"]
            },
            {"public-approved", "public-cited"},
        )

    def test_baseline_is_explicit_without_inventing_legacy_approval(self):
        baseline = self.registry["baseline"]
        self.assertEqual(baseline["mode"], "explicit-incremental")
        self.assertEqual(baseline["legacyInventoryState"], "not-certified")
        self.assertEqual(
            baseline["legacyPublicationDecision"],
            "outside-registry-no-approval",
        )
        self.assertTrue(baseline["newOrModifiedPublicContentMustBeRegistered"])
        self.assertTrue(self.registry["items"])
        self.assertTrue(
            all(
                item["classification"] in {"public-approved", "public-cited"}
                and item["ownerApproval"] is True
                for item in self.registry["items"]
            )
        )
        self.assertTrue(
            all(
                item["classification"] not in {"public-approved", "public-cited"}
                for item in self.registry["exampleTemplates"]
            )
        )

    def test_invalid_manifest_is_blocked(self):
        issues = self.guard.validate_policy({"schemaVersion": "wrong"})
        codes = {issue.code for issue in issues}
        self.assertIn("POLICY_SCHEMA", codes)
        self.assertIn("POLICY_NOT_FAIL_CLOSED", codes)
        self.assertIn("POLICY_DEFAULT", codes)
        self.assertIn("POLICY_CLASSES", codes)

    def test_medical_item_requires_source_dates_and_reviewers(self):
        registry = copy.deepcopy(self.registry)
        bad = valid_medical_item()
        bad.pop("reviewedAt")
        bad.pop("clinicalReviewer")
        bad["sources"] = [{"title": "", "url": "http://unsafe.example"}]
        registry["items"] = [bad]
        issues, _ = self.guard.validate_registry(registry, self.policy)
        codes = {issue.code for issue in issues}
        self.assertIn("REVIEW_DATE_MISSING", codes)
        self.assertIn("CLINICAL_REVIEWER_MISSING", codes)
        self.assertIn("SOURCE_TITLE", codes)
        self.assertIn("SOURCE_URL", codes)
        self.assertIn("SOURCE_DATE", codes)

    def test_valid_medical_item_is_accepted(self):
        registry = copy.deepcopy(self.registry)
        registry["items"] = [valid_medical_item()]
        issues, index = self.guard.validate_registry(registry, self.policy)
        self.assertEqual(issues, [])
        self.assertIn("novo-conteudo.html", index)

    def test_restricted_owner_can_never_have_public_target(self):
        registry = copy.deepcopy(self.registry)
        registry["items"] = [
            {
                "id": "rascunho-pessoal",
                "classification": "restricted-owner",
                "paths": ["pessoal/rascunho.md"],
                "publishTargets": ["site/rascunho.html"],
                "medical": False,
            }
        ]
        issues, _ = self.guard.validate_registry(registry, self.policy)
        self.assertIn("NONPUBLIC_HAS_TARGET", {issue.code for issue in issues})

    def test_public_claim_requires_verification(self):
        registry = copy.deepcopy(self.registry)
        item = valid_medical_item()
        item["professionalClaims"] = [
            {
                "claim": "Médico mestre",
                "verification": {"type": "diploma", "reference": ""}
            }
        ]
        registry["items"] = [item]
        issues, _ = self.guard.validate_registry(registry, self.policy)
        self.assertIn(
            "PROFESSIONAL_CLAIM_UNVERIFIED",
            {issue.code for issue in issues},
        )

    def test_cli_check_is_read_only_and_passes_metadata_baseline(self):
        before = {
            path: path.read_bytes()
            for path in (POLICY_PATH, REGISTRY_PATH, PROVENANCE_PATH)
        }
        result = subprocess.run(
            ["python3", str(GATE_PATH), "--check", "--root", str(ROOT), "--json"],
            check=False,
            capture_output=True,
            text=True,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        report = json.loads(result.stdout)
        self.assertEqual(report["summary"]["mode"], "approved")
        self.assertEqual(report["summary"]["baselineMode"], "explicit-incremental")
        self.assertEqual(report["summary"]["strictFilesChecked"], 0)
        self.assertEqual(
            before,
            {
                path: path.read_bytes()
                for path in (POLICY_PATH, REGISTRY_PATH, PROVENANCE_PATH)
            },
        )


class EditorialContentScannerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.guard = load_module()
        cls.policy = json.loads(POLICY_PATH.read_text(encoding="utf-8"))

    def codes(self, text, item=None, require_registration=False, path="publico.html"):
        return {
            issue.code
            for issue in self.guard.scan_text(
                text,
                path,
                self.policy,
                item,
                require_registration=require_registration,
            )
        }

    def test_unregistered_medical_change_is_fail_closed(self):
        codes = self.codes(
            "Paciente com sepse: diagnóstico, tratamento e dose de 5 mg.",
            require_registration=True,
        )
        self.assertIn("UNREGISTERED_PUBLIC_CONTENT", codes)
        self.assertIn("MEDICAL_UNREGISTERED", codes)

    def test_secrets_and_sensitive_data_are_blocked(self):
        text = (
            "password='segredo-real-123'; "
            "CPF 123.456.789-09; prontuário: ABCD1234; "
            "contato pessoa@dominio-real.org"
        )
        codes = self.codes(text)
        self.assertIn("SECRET_PASSWORD_ASSIGNMENT", codes)
        self.assertIn("SENSITIVE_CPF", codes)
        self.assertIn("SENSITIVE_PATIENT_ID", codes)
        self.assertIn("SENSITIVE_EMAIL", codes)

    def test_beta_personal_content_in_public_output_is_blocked(self):
        codes = self.codes('{"status": "beta", "audience": "personal"}')
        self.assertIn("RESTRICTED_STATUS_PUBLIC", codes)

    def test_defamation_and_uncertain_copyright_are_quarantined(self):
        codes = self.codes(
            "Fulano é golpista. Copyright com licença desconhecida."
        )
        self.assertIn("DEFAMATION_SUSPECTED", codes)
        self.assertIn("COPYRIGHT_UNCERTAIN", codes)

    def test_unverified_named_professional_claim_is_blocked(self):
        codes = self.codes(
            "Aldenir Rocha de Oliveira Filho, médico mestre e especialista."
        )
        self.assertIn("PROFESSIONAL_CLAIM_UNVERIFIED", codes)

    def test_restricted_path_is_blocked_even_without_reading_content(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            path = root / "beta" / "pessoal.html"
            path.parent.mkdir()
            path.write_text("texto comum", encoding="utf-8")
            issues = self.guard.scan_file(
                root,
                path,
                self.policy,
                None,
                require_registration=False,
            )
            self.assertIn("RESTRICTED_PATH_PUBLIC", {issue.code for issue in issues})

    def test_allowlisted_platform_email_is_not_flagged(self):
        policy = copy.deepcopy(self.policy)
        policy["scanning"]["publicContactAllowlist"] = ["contato@example.org"]
        issues = self.guard.scan_text(
            "Contato: contato@example.org",
            "contato.html",
            policy,
            require_registration=False,
        )
        self.assertNotIn("SENSITIVE_EMAIL", {issue.code for issue in issues})

    def test_hash_digits_example_email_and_runtime_password_are_not_secrets(self):
        issues = self.guard.scan_text(
            (
                "sha256 39a957b78a08635597506c7bf85698943840c7e979 "
                "contato equipe@dominio-oficial.example; "
                "const password = passwordInput.value;"
            ),
            "codigo-publico.js",
            self.policy,
            require_registration=False,
        )
        codes = {issue.code for issue in issues}
        self.assertNotIn("SENSITIVE_CPF", codes)
        self.assertNotIn("SENSITIVE_EMAIL", codes)
        self.assertNotIn("SECRET_PASSWORD_ASSIGNMENT", codes)


if __name__ == "__main__":
    unittest.main()
