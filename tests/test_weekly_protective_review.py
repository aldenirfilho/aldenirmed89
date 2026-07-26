"""Contratos do laudo protetivo semanal."""

from __future__ import annotations

import hashlib
import importlib.util
import json
import tempfile
import unittest
import zipfile
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts_admin" / "weekly_protective_review.py"
WORKFLOW = ROOT / ".github" / "workflows" / "revisao-protetiva-semanal.yml"
DOCUMENTATION = (
    ROOT
    / "19_Integridade_Editorial"
    / "REVISAO_PROTETIVA_SEMANAL.md"
)

SPEC = importlib.util.spec_from_file_location(
    "weekly_protective_review", SCRIPT
)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("weekly_protective_review.py indisponível")
WEEKLY = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(WEEKLY)


class WeeklyProtectiveReviewTests(unittest.TestCase):
    def test_week_uses_fortaleza_time_and_stable_schema(self) -> None:
        metadata = WEEKLY.local_week_metadata(
            datetime(2026, 7, 27, 2, 30, tzinfo=timezone.utc)
        )
        # Em Fortaleza ainda era domingo, portanto a semana ISO anterior.
        self.assertEqual(metadata["localDate"], "2026-07-26")
        self.assertEqual(metadata["weekId"], "2026-W30")
        self.assertEqual(
            WEEKLY.SCHEMA_VERSION,
            "antigravity-weekly-protective-review-v1",
        )

    def test_public_url_is_https_same_origin_and_routes_are_relative(self) -> None:
        self.assertEqual(
            WEEKLY.validate_site_base_url(
                "https://aldenirfilho.github.io/antigravity-consultas"
            ),
            "https://aldenirfilho.github.io/antigravity-consultas/",
        )
        self.assertEqual(
            WEEKLY.safe_relative_url_path("15_Radar_Cientifico/index.html"),
            "15_Radar_Cientifico/index.html",
        )
        for unsafe in (
            "http://example.com/site/",
            "https://user:pass@example.com/",
            "https://example.com/?token=x",
        ):
            with self.assertRaises(ValueError):
                WEEKLY.validate_site_base_url(unsafe)
        for unsafe_route in (
            "../secret.txt",
            "/absolute/index.html",
            "https://example.com/index.html",
            "path/?query=x",
        ):
            with self.assertRaises(ValueError):
                WEEKLY.safe_relative_url_path(unsafe_route)

    def test_findings_never_claim_confirmed_violation(self) -> None:
        item = WEEKLY.finding(
            "legacy-test",
            "inventário legado",
            "alto",
            "Sinal heurístico",
            "Revisar.",
            evidence="index.html",
            heuristic=True,
        )
        self.assertFalse(item["confirmedViolation"])
        self.assertTrue(item["heuristic"])
        self.assertEqual(item["status"], "requer_revisão_humana")
        self.assertIn(
            "não são violações confirmadas",
            WEEKLY.LEGACY_DISCLAIMER.casefold(),
        )

    def test_output_excerpt_redacts_common_credentials(self) -> None:
        output = WEEKLY.sanitize_excerpt(
            "token=super-secret-value\n"
            "sk-proj-abcdefghijklmnopqrstuv\n"
            "github_pat_abcdefghijklmnopqrstuvwxyz123456"
        )
        self.assertNotIn("super-secret-value", output)
        self.assertNotIn("sk-proj-", output)
        self.assertNotIn("github_pat_", output)
        self.assertIn("[REDACTED]", output)

    def test_public_surface_checks_local_routes_zip_and_checksum(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / "data").mkdir()
            (root / "downloads").mkdir()
            site = root / "site"
            (site / "module").mkdir(parents=True)
            (site / "module" / "index.html").write_text(
                "<!doctype html><title>OK</title>",
                encoding="utf-8",
            )
            (root / "data" / "site_manifest.json").write_text(
                json.dumps(
                    {
                        "canonicalRoutes": {
                            "home": "module/index.html"
                        }
                    }
                ),
                encoding="utf-8",
            )
            archive = root / "downloads" / "app.zip"
            with zipfile.ZipFile(archive, "w") as output:
                output.writestr("README.txt", "Antigravity")
            digest = hashlib.sha256(archive.read_bytes()).hexdigest()
            (root / "downloads" / "SHA256SUMS.txt").write_text(
                f"{digest}  app.zip\n",
                encoding="utf-8",
            )

            surface, findings = WEEKLY.audit_public_surface(
                root,
                site,
                None,
                live_timeout_seconds=1,
            )

            self.assertEqual(findings, [])
            self.assertEqual(surface["summary"]["routesOk"], 1)
            self.assertEqual(surface["summary"]["downloadsOk"], 1)
            self.assertTrue(surface["downloads"][0]["archiveOk"])
            self.assertTrue(surface["downloads"][0]["checksumOk"])

    def test_comparison_reports_new_persisting_and_resolved(self) -> None:
        current = [
            WEEKLY.finding(
                "one", "técnico", "alto", "A", "A", evidence="one"
            ),
            WEEKLY.finding(
                "two", "técnico", "baixo", "B", "B", evidence="two"
            ),
        ]
        previous = {
            "weekId": "2026-W29",
            "severityCounts": {
                "crítico": 0,
                "alto": 1,
                "médio": 1,
                "baixo": 0,
            },
            "findingFingerprints": [
                current[0]["fingerprint"],
                "resolved-fingerprint",
            ],
        }
        comparison = WEEKLY.compare_with_previous(current, previous)
        self.assertTrue(comparison["available"])
        self.assertEqual(
            comparison["persistingFindingFingerprints"],
            [current[0]["fingerprint"]],
        )
        self.assertIn(
            current[1]["fingerprint"],
            comparison["newFindingFingerprints"],
        )
        self.assertIn(
            "resolved-fingerprint",
            comparison["resolvedFindingFingerprints"],
        )
        self.assertEqual(comparison["severityDelta"]["médio"], -1)

    def test_report_has_required_limits_and_markdown_sections(self) -> None:
        one_finding = WEEKLY.finding(
            "test",
            "fonte oficial",
            "médio",
            "Fonte indisponível",
            "Revisar manualmente.",
            evidence="https://www.planalto.gov.br/",
        )
        report = WEEKLY.build_report(
            period={
                "weekId": "2026-W30",
                "localDate": "2026-07-25",
                "timezone": WEEKLY.TIMEZONE_LABEL,
            },
            generated_at="2026-07-25T23:00:00Z",
            execution={
                "commit": "abc123",
                "branch": "main",
                "runUrl": "",
            },
            checks=[
                {
                    "id": "test",
                    "title": "Teste",
                    "status": "aprovado",
                    "exitCode": 0,
                    "durationMs": 2,
                }
            ],
            legal_monitor={
                "report": {
                    "results": [
                        {
                            "id": "planalto",
                            "title": "Lei",
                            "publisher": "Planalto",
                            "status": "unavailable",
                            "url": "https://www.planalto.gov.br/",
                        }
                    ]
                }
            },
            legacy_inventory={
                "state": "not-certified",
                "publicationDecision": "outside-registry-no-approval",
                "candidateCount": 10,
                "registeredPathCount": 2,
                "findingCount": 1,
                "countsByCode": {
                    "UNREGISTERED_PUBLIC_CONTENT": 1
                },
            },
            public_surface={
                "siteBaseUrl": "https://example.com/",
                "routes": [],
                "downloads": [],
                "summary": {
                    "routeCount": 0,
                    "routesOk": 0,
                    "downloadCount": 0,
                    "downloadsOk": 0,
                },
            },
            findings=[one_finding],
            previous=None,
        )
        markdown = WEEKLY.render_markdown(report)

        self.assertFalse(
            report["summary"]["automaticLegalInterpretation"]
        )
        self.assertFalse(report["summary"]["automaticCorrection"])
        self.assertFalse(report["summary"]["automaticCommit"])
        self.assertFalse(report["summary"]["automaticPublication"])
        self.assertEqual(report["summary"]["confirmedViolationCount"], 0)
        self.assertIn("Extrato executivo", markdown)
        self.assertIn("Inventário editorial legado", markdown)
        self.assertIn("Plano para os próximos 7 dias", markdown)
        self.assertIn("não constitui parecer jurídico", markdown.casefold())
        self.assertEqual(
            report["comparisonToken"]["weekId"], "2026-W30"
        )

    def test_real_legacy_inventory_is_explicitly_not_certified(self) -> None:
        inventory = WEEKLY.run_legacy_inventory(ROOT)
        self.assertEqual(inventory["state"], "not-certified")
        self.assertEqual(
            inventory["publicationDecision"],
            "outside-registry-no-approval",
        )
        self.assertGreater(inventory["candidateCount"], 100)
        self.assertTrue(
            all(
                sample["heuristic"]
                and not sample["confirmedViolation"]
                for sample in inventory["samples"]
            )
        )

    def test_workflow_is_weekly_read_only_and_archives_one_issue_per_week(self) -> None:
        workflow = WORKFLOW.read_text(encoding="utf-8")
        self.assertIn("cron: '0 11 * * 1'", workflow)
        self.assertIn("workflow_dispatch:", workflow)
        self.assertIn("contents: read", workflow)
        self.assertIn("issues: write", workflow)
        self.assertIn("persist-credentials: false", workflow)
        self.assertIn("weekly_protective_review.py", workflow)
        self.assertIn("upload-artifact@v4", workflow)
        self.assertIn("retention-days: 90", workflow)
        self.assertIn(
            "[Laudo semanal] Revisão protetiva ",
            workflow,
        )
        self.assertIn(
            "antigravity-weekly-summary-base64",
            workflow,
        )
        self.assertIn("github-actions[bot]", workflow)
        self.assertIn("isValidSummary", workflow)
        self.assertIn("SHA-256 do JSON", workflow)
        self.assertIn("SHA-256 do Markdown", workflow)
        self.assertIn("const embeddedSummaryPattern =", workflow)
        self.assertIn(
            "embeddedSummaryPattern.test(issue.body || '')",
            workflow,
        )
        self.assertIn("const summaryComment =", workflow)
        self.assertNotIn("git push", workflow)
        self.assertNotIn("git commit", workflow)
        self.assertNotIn("--refresh", workflow)
        self.assertNotIn("contents: write", workflow)

    def test_public_documentation_states_limits_and_severities(self) -> None:
        documentation = DOCUMENTATION.read_text(encoding="utf-8")
        for marker in (
            "toda segunda-feira",
            "08:00 em Fortaleza",
            "laudo-semanal.md",
            "laudo-semanal.json",
            "achado heurístico",
            "não confirma automaticamente",
            "extrato sanitizado",
            "Crítico",
            "Alto",
            "Médio",
            "Baixo",
            "altera baselines",
        ):
            self.assertIn(marker, documentation)


if __name__ == "__main__":
    unittest.main()
