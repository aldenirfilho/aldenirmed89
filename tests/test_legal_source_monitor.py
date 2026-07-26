#!/usr/bin/env python3
"""Contratos de segurança do monitor de fontes jurídico-editoriais."""

from __future__ import annotations

import hashlib
import importlib.util
import json
import sys
import tempfile
import unittest
from email.message import Message
from pathlib import Path
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = ROOT / "scripts_admin" / "check_legal_sources.py"
CATALOG_PATH = (
    ROOT / "19_Integridade_Editorial" / "data" / "legal-sources.json"
)
WORKFLOW_PATH = ROOT / ".github" / "workflows" / "legal-integrity-monitor.yml"

SPEC = importlib.util.spec_from_file_location("legal_source_monitor", SCRIPT_PATH)
assert SPEC and SPEC.loader
MONITOR = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = MONITOR
SPEC.loader.exec_module(MONITOR)


def make_source(
    *,
    source_id: str = "official-test-source",
    url: str = "https://www.gov.br/example",
    baseline_state: str = "unissued",
    baseline_sha: str | None = None,
    baseline_bytes: int | None = None,
    max_bytes: int = 4096,
) -> dict[str, object]:
    source: dict[str, object] = {
        "id": source_id,
        "title": "Fonte oficial de teste",
        "publisher": "Órgão público de teste",
        "url": url,
        "expectedHost": "www.gov.br",
        "extraction": "visible-html-text-v1",
        "maxBytes": max_bytes,
        "minNormalizedBytes": 100,
        "requiredMarkers": ["conteúdo oficial", "direitos autorais"],
        "ignoreRegexes": [],
        "baselineState": baseline_state,
        "baselineSha256": baseline_sha,
        "baselineNormalizedBytes": baseline_bytes,
    }
    if baseline_state == "issued":
        source.update(
            {
                "baselineConsultedAt": "2026-07-25T22:05:00-03:00",
                "baselineReviewedBy": "Revisor humano de teste",
            }
        )
    else:
        source.update(
            {
                "baselineNote": "Aguardando conferência técnica explícita.",
                "lastConsultedAt": "2026-07-25T22:05:00-03:00",
            }
        )
    return source


def make_config(source: dict[str, object]) -> dict[str, object]:
    return {
        "schemaVersion": MONITOR.SCHEMA_VERSION,
        "automaticLegalInterpretation": False,
        "allowedHosts": sorted(MONITOR.ALLOWED_HOSTS),
        "catalogNotice": "Teste",
        "lastBaselineReview": None,
        "sources": [source],
    }


class FakeResponse:
    def __init__(
        self,
        body: bytes,
        *,
        url: str = "https://www.gov.br/example",
        content_type: str = "text/html; charset=utf-8",
        declared_length: int | None = None,
        status: int = 200,
    ) -> None:
        self.body = body
        self.offset = 0
        self.url = url
        self.status = status
        self.headers = Message()
        self.headers["Content-Type"] = content_type
        if declared_length is not None:
            self.headers["Content-Length"] = str(declared_length)

    def __enter__(self) -> "FakeResponse":
        return self

    def __exit__(self, *args: object) -> None:
        return None

    def getcode(self) -> int:
        return self.status

    def geturl(self) -> str:
        return self.url

    def read(self, size: int = -1) -> bytes:
        if size < 0:
            size = len(self.body) - self.offset
        chunk = self.body[self.offset : self.offset + size]
        self.offset += len(chunk)
        return chunk


class FakeOpener:
    def __init__(self, response: FakeResponse) -> None:
        self.response = response
        self.timeout: float | None = None
        self.request = None

    def open(self, request: object, timeout: float) -> FakeResponse:
        self.timeout = timeout
        self.request = request
        return self.response


def valid_html(extra: str = "") -> bytes:
    filler = " orientação estável" * 20
    return (
        "<!doctype html><html><body><header>menu volátil</header>"
        "<main><h1>Conteúdo oficial</h1>"
        f"<p>Direitos autorais {filler} {extra}</p>"
        "<script>token = Math.random()</script></main>"
        "</body></html>"
    ).encode("utf-8")


class LegalSourceCatalogTests(unittest.TestCase):
    def test_catalog_is_https_allowlisted_and_has_honest_baselines(self) -> None:
        catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
        MONITOR.validate_config(catalog)
        self.assertFalse(catalog["automaticLegalInterpretation"])
        expected_ids = {
            "planalto-lei-9610",
            "planalto-lgpd-13709",
            "cfm-resolution-2336",
            "cfm-publicity-manual",
            "bn-copyright-registration",
            "inpi-trademark-guide",
            "cc-license-chooser",
            "cc-faq",
        }
        self.assertEqual({item["id"] for item in catalog["sources"]}, expected_ids)
        for source in catalog["sources"]:
            parsed = MONITOR.validate_https_url(source["url"])
            self.assertIn(parsed.hostname, MONITOR.ALLOWED_HOSTS)
            self.assertLessEqual(
                source["maxBytes"], MONITOR.HARD_MAX_RESPONSE_BYTES
            )
            if source["baselineState"] == "issued":
                self.assertRegex(source["baselineSha256"], r"^[0-9a-f]{64}$")
                self.assertGreater(source["baselineNormalizedBytes"], 0)
                self.assertIn("baselineConsultedAt", source)
            else:
                self.assertIsNone(source["baselineSha256"])
                self.assertIsNone(source["baselineNormalizedBytes"])
                self.assertIn("nenhum hash foi inventado", source["baselineNote"])

    def test_html_normalization_ignores_frames_scripts_and_known_dates(self) -> None:
        first = """
        <html><body>
          <header>Menu A</header>
          <main><h1>Norma oficial</h1>
            <p>Texto   juridicamente relevante.</p>
            <p>Atualizado em 01/01/2025 às 10h20</p>
            <script>segredo = 1</script>
          </main>
          <footer>Rodapé A</footer>
        </body></html>
        """
        second = """
        <html><body>
          <header>Menu B completamente diferente</header>
          <main>
            <h1> NORMA OFICIAL </h1>
            <p>texto juridicamente relevante.</p>
            <p>Atualizado em 25/07/2026 às 22h11</p>
            <script>segredo = 999</script>
          </main>
          <footer>Rodapé B</footer>
        </body></html>
        """
        normalized_first = MONITOR.normalize_document(first)
        normalized_second = MONITOR.normalize_document(second)
        self.assertEqual(normalized_first, normalized_second)
        self.assertNotIn("segredo", normalized_first)
        changed = MONITOR.normalize_document(
            second.replace("relevante", "materialmente alterado")
        )
        self.assertNotEqual(normalized_first, changed)


class LegalSourceNetworkSafetyTests(unittest.TestCase):
    def test_fetch_passes_timeout_clear_user_agent_and_hashes_text(self) -> None:
        response = FakeResponse(valid_html(), declared_length=len(valid_html()))
        opener = FakeOpener(response)
        snapshot = MONITOR.fetch_snapshot(
            make_source(), timeout_seconds=7.5, opener=opener
        )
        self.assertEqual(opener.timeout, 7.5)
        self.assertIn("Antigravity-LegalIntegrityMonitor", opener.request.get_header("User-agent"))
        self.assertEqual(snapshot.hashBasis, "visible-html-text-v1")
        self.assertRegex(snapshot.sha256, r"^[0-9a-f]{64}$")
        self.assertLess(snapshot.normalizedBytes, snapshot.downloadedBytes)

    def test_content_length_and_stream_limits_fail_closed(self) -> None:
        source = make_source(max_bytes=500)
        oversized_header = FakeOpener(
            FakeResponse(valid_html(), declared_length=501)
        )
        with self.assertRaisesRegex(
            MONITOR.SourceUnavailableError, "excede o limite"
        ):
            MONITOR.fetch_snapshot(source, opener=oversized_header)

        oversized_stream = FakeOpener(
            FakeResponse(b"x" * 501, declared_length=None)
        )
        with self.assertRaisesRegex(
            MONITOR.SourceUnavailableError, "excede o limite"
        ):
            MONITOR.fetch_snapshot(source, opener=oversized_stream)

    def test_http_cross_host_redirect_and_unsafe_timeout_are_refused(self) -> None:
        with self.assertRaisesRegex(
            MONITOR.SourceConfigurationError, "somente URLs HTTPS"
        ):
            MONITOR.validate_https_url("http://www.gov.br/example")
        with self.assertRaisesRegex(
            MONITOR.SourceConfigurationError, "fora da allowlist"
        ):
            MONITOR.validate_https_url("https://example.com/legal")

        evil_final = FakeOpener(
            FakeResponse(valid_html(), url="https://example.com/captive")
        )
        with self.assertRaisesRegex(
            MONITOR.SourceConfigurationError, "fora da allowlist"
        ):
            MONITOR.fetch_snapshot(make_source(), opener=evil_final)
        with self.assertRaisesRegex(
            MONITOR.SourceConfigurationError, "timeout fora"
        ):
            MONITOR.fetch_snapshot(make_source(), timeout_seconds=61)

    def test_pdf_mode_hashes_bounded_official_bytes(self) -> None:
        source = make_source(
            source_id="official-pdf",
            url="https://sistemas.cfm.org.br/norma.pdf",
            max_bytes=512,
        )
        source.update(
            {
                "expectedHost": "sistemas.cfm.org.br",
                "extraction": "raw-pdf-bytes-v1",
                "requiredMarkers": [],
                "minNormalizedBytes": 100,
            }
        )
        body = b"%PDF-1.7\n" + (b"stable" * 30)
        response = FakeResponse(
            body,
            url="https://sistemas.cfm.org.br/norma.pdf",
            content_type="application/pdf",
            declared_length=len(body),
        )
        snapshot = MONITOR.fetch_snapshot(source, opener=FakeOpener(response))
        self.assertEqual(snapshot.hashBasis, "raw-pdf-bytes-v1")
        self.assertEqual(snapshot.sha256, hashlib.sha256(body).hexdigest())


class LegalSourceModesTests(unittest.TestCase):
    def test_check_is_read_only_and_change_requires_review(self) -> None:
        expected = "a" * 64
        source = make_source(
            baseline_state="issued",
            baseline_sha=expected,
            baseline_bytes=150,
        )
        config = make_config(source)
        observed = MONITOR.Snapshot(
            sourceId=source["id"],
            finalUrl=source["url"],
            contentType="text/html",
            downloadedBytes=300,
            normalizedBytes=151,
            sha256="b" * 64,
            hashBasis="visible-html-text-v1",
        )
        with tempfile.TemporaryDirectory() as temporary:
            config_path = Path(temporary) / "sources.json"
            report_path = Path(temporary) / "report.json"
            original = MONITOR.canonical_json_bytes(config)
            config_path.write_bytes(original)
            with mock.patch.object(MONITOR, "fetch_snapshot", return_value=observed):
                exit_code = MONITOR.main(
                    [
                        "--check",
                        "--config",
                        str(config_path),
                        "--report",
                        str(report_path),
                    ]
                )
            self.assertEqual(exit_code, 2)
            self.assertEqual(config_path.read_bytes(), original)
            report = json.loads(report_path.read_text(encoding="utf-8"))
            self.assertEqual(report["overallStatus"], "review_required")
            self.assertEqual(report["results"][0]["status"], "changed")
            self.assertFalse(report["automaticPublication"])
            self.assertFalse(report["automaticLegalInterpretation"])

    def test_unavailability_is_fail_closed(self) -> None:
        config = make_config(make_source())
        with mock.patch.object(
            MONITOR,
            "fetch_snapshot",
            side_effect=MONITOR.SourceUnavailableError("timeout"),
        ):
            report, needs_review = MONITOR.run_check(
                config, checked_at="2026-07-25T22:10:00-03:00"
            )
        self.assertTrue(needs_review)
        self.assertEqual(report["results"][0]["status"], "unavailable")

    def test_refresh_requires_explicit_scope_reviewer_and_timestamp(self) -> None:
        source = make_source()
        config = make_config(source)
        snapshot = MONITOR.Snapshot(
            sourceId=source["id"],
            finalUrl=source["url"],
            contentType="text/html",
            downloadedBytes=300,
            normalizedBytes=150,
            sha256="c" * 64,
            hashBasis="visible-html-text-v1",
        )
        with self.assertRaisesRegex(
            MONITOR.SourceConfigurationError, "ao menos um --source"
        ):
            MONITOR.run_refresh(
                config,
                requested_ids=[],
                reviewer="Revisor de teste",
                reviewed_at="2026-07-25T22:10:00-03:00",
            )
        with self.assertRaisesRegex(
            MONITOR.SourceConfigurationError, "fuso horário"
        ):
            with mock.patch.object(
                MONITOR, "fetch_snapshot", return_value=snapshot
            ):
                MONITOR.run_refresh(
                    config,
                    requested_ids=[source["id"]],
                    reviewer="Revisor de teste",
                    reviewed_at="2026-07-25T22:10:00",
                )

        with mock.patch.object(MONITOR, "fetch_snapshot", return_value=snapshot):
            refreshed, report = MONITOR.run_refresh(
                config,
                requested_ids=[source["id"]],
                reviewer="Revisor de teste",
                reviewed_at="2026-07-25T22:10:00-03:00",
            )
        entry = refreshed["sources"][0]
        self.assertEqual(entry["baselineState"], "issued")
        self.assertEqual(entry["baselineSha256"], "c" * 64)
        self.assertEqual(entry["baselineReviewedBy"], "Revisor de teste")
        self.assertEqual(report["overallStatus"], "baseline_refreshed")

    def test_failed_refresh_does_not_write_partial_catalog(self) -> None:
        config = make_config(make_source())
        with tempfile.TemporaryDirectory() as temporary:
            config_path = Path(temporary) / "sources.json"
            report_path = Path(temporary) / "report.json"
            original = MONITOR.canonical_json_bytes(config)
            config_path.write_bytes(original)
            with mock.patch.object(
                MONITOR,
                "fetch_snapshot",
                side_effect=MONITOR.SourceUnavailableError("indisponível"),
            ):
                exit_code = MONITOR.main(
                    [
                        "--refresh",
                        "--source",
                        "official-test-source",
                        "--reviewer",
                        "Revisor de teste",
                        "--reviewed-at",
                        "2026-07-25T22:10:00-03:00",
                        "--config",
                        str(config_path),
                        "--report",
                        str(report_path),
                    ]
                )
            self.assertEqual(exit_code, 2)
            self.assertEqual(config_path.read_bytes(), original)


class LegalSourceWorkflowTests(unittest.TestCase):
    def test_workflow_is_daily_minimal_and_never_commits_or_refreshes(self) -> None:
        workflow = WORKFLOW_PATH.read_text(encoding="utf-8")
        self.assertIn("schedule:", workflow)
        self.assertIn("cron: '17 10 * * *'", workflow)
        self.assertIn("workflow_dispatch:", workflow)
        self.assertIn("contents: read", workflow)
        self.assertIn("issues: write", workflow)
        self.assertNotIn("contents: write", workflow)
        self.assertIn("persist-credentials: false", workflow)
        monitor_run = workflow.split("run: |", 1)[1].split(
            "\n      - name:", 1
        )[0]
        self.assertIn("--check", monitor_run)
        self.assertNotIn("--refresh", monitor_run)
        self.assertIn("actions/upload-artifact@v4", workflow)
        self.assertIn("actions/github-script@v8", workflow)
        self.assertIn("issues.update", workflow)
        self.assertIn("issues.create", workflow)
        lowered = workflow.casefold()
        self.assertNotIn("git commit", lowered)
        self.assertNotIn("git push", lowered)
        for line in workflow.splitlines():
            if "uses:" in line:
                action = line.split("uses:", 1)[1].strip()
                self.assertTrue(action.startswith("actions/"), action)


if __name__ == "__main__":
    unittest.main()
