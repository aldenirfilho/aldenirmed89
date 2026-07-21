#!/usr/bin/env python3
"""Regressões do dashboard agregado e da fila clínica local."""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts_admin"))
import update_authorial_recovery_public_summary as SUMMARY_BUILDER  # noqa: E402

LIBRARY = ROOT / "02_Biblioteca_IA_Engine"
DASHBOARD = (LIBRARY / "recovery-review-dashboard.html").read_text(encoding="utf-8")
SCRIPT = (LIBRARY / "assets/recovery-review-dashboard.js").read_text(encoding="utf-8")


def node_binary() -> str | None:
    executable = shutil.which("node")
    if executable:
        return executable
    bundled = (
        Path.home()
        / ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
    )
    return str(bundled) if bundled.is_file() else None


class RecoveryDashboardTests(unittest.TestCase):
    def test_public_summary_is_aggregate_only_and_current(self) -> None:
        path = LIBRARY / "data/authorial_recovery_public_summary.json"
        raw = path.read_text(encoding="utf-8")
        payload = json.loads(raw)

        self.assertEqual(payload["schemaVersion"], 1)
        self.assertEqual(payload["kind"], "authorial-recovery-public-aggregate")
        self.assertEqual(payload["baseline"]["requestedCandidates"], 549)
        self.assertEqual(payload["current"]["candidates"], 555)
        self.assertEqual(payload["current"]["candidateDelta"], 6)
        self.assertEqual(payload["current"]["uniqueSha256"], 425)
        self.assertEqual(payload["current"]["eligibleUniqueWorks"], 419)
        self.assertEqual(payload["nextBatch"]["remainingUniqueWorksAfterBatch"], 414)
        self.assertTrue(payload["privacy"]["aggregateOnly"])
        self.assertFalse(payload["privacy"]["containsCandidateNames"])
        self.assertFalse(payload["privacy"]["containsPaths"])
        self.assertFalse(payload["privacy"]["containsHashes"])
        self.assertFalse(payload["privacy"]["publishesDocuments"])

        self.assertNotRegex(raw, r"\b[0-9a-f]{64}\b")
        for forbidden in ("candidateId", "relativePath", "sourceFilename", "rootId"):
            self.assertNotIn(forbidden, raw)

    def test_dashboard_uses_external_assets_and_strict_csp(self) -> None:
        self.assertIn("default-src 'self'", DASHBOARD)
        self.assertIn("object-src 'none'", DASHBOARD)
        self.assertIn("frame-src 'none'", DASHBOARD)
        self.assertIn('href="../favicon.ico"', DASHBOARD)
        self.assertIn('href="assets/recovery-review-dashboard.css"', DASHBOARD)
        self.assertIn('src="assets/recovery-review-dashboard.js"', DASHBOARD)
        self.assertNotIn("<script>", DASHBOARD)
        self.assertNotIn("<style>", DASHBOARD)
        for marker in (
            'id="reviewResponsible"',
            'id="reviewSource"',
            'id="reviewDate"',
            'id="reviewValidUntil"',
            'id="exportQueue"',
            'id="importQueue"',
        ):
            self.assertIn(marker, DASHBOARD)

    def test_queue_is_local_bounded_and_fail_closed(self) -> None:
        for marker in (
            'const STORE_KEY = "antigravity-clinical-review-queue-v1"',
            "const MAX_JSON_BYTES = 5 * 1024 * 1024",
            "localStorage.setItem(STORE_KEY",
            "file.size > MAX_JSON_BYTES",
            "documentRecord.sha256 !== sha256",
            "requireApprovedFields(record)",
            "recordValidationError(normalized)",
            "Informe a fonte clínica antes de aprovar.",
            "A validade não pode ser anterior à data de revisão.",
            "date.getUTCDate() !== day",
            "URL.createObjectURL(blob)",
            "BLOCKED_PATH_SEGMENTS",
        ):
            self.assertIn(marker, SCRIPT)
        self.assertNotIn(".innerHTML", SCRIPT)
        self.assertNotIn("eval(", SCRIPT)
        self.assertNotIn("document.write", SCRIPT)

    def test_favicon_is_a_real_64px_windows_icon(self) -> None:
        favicon = ROOT / "favicon.ico"
        raw = favicon.read_bytes()
        self.assertGreater(len(raw), 1000)
        self.assertEqual(raw[:4], b"\x00\x00\x01\x00")
        self.assertIn('"favicon.ico"', (ROOT / "scripts_admin/build_public_site.py").read_text(encoding="utf-8"))

    def test_no_private_route_is_embedded_in_dashboard_files(self) -> None:
        combined = DASHBOARD + SCRIPT
        self.assertNotIn("/_private/", combined.casefold())
        self.assertNotIn("00_INBOX_ATUALIZACAO", combined)

    def test_aggregate_builder_emits_only_allowlisted_counts(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            inbox = root / "inbox"
            inbox.mkdir()
            (inbox / "A.md").write_text("mesma obra", encoding="utf-8")
            (inbox / "A copia.md").write_text("mesma obra", encoding="utf-8")
            (inbox / "B.txt").write_text("outra obra", encoding="utf-8")
            manifest = root / "biblioteca_documentos_manifest.json"
            manifest.write_text('{"files": []}\n', encoding="utf-8")

            payload = SUMMARY_BUILDER.build_public_summary(
                [inbox], manifest, baseline_candidates=2, batch_size=5
            )
            self.assertEqual(payload["current"]["candidates"], 3)
            self.assertEqual(payload["current"]["candidateDelta"], 1)
            self.assertEqual(payload["current"]["uniqueSha256"], 2)
            self.assertEqual(payload["current"]["exactDuplicateGroups"], 1)
            self.assertEqual(payload["nextBatch"]["selectedUniqueWorks"], 2)
            encoded = json.dumps(payload, ensure_ascii=False)
            self.assertNotIn("A.md", encoded)
            self.assertNotIn(str(inbox), encoded)
            self.assertNotRegex(encoded, r"\b[0-9a-f]{64}\b")

    def test_aggregate_builder_rejects_extra_or_individual_fields(self) -> None:
        payload = json.loads(
            (LIBRARY / "data/authorial_recovery_public_summary.json").read_text(
                encoding="utf-8"
            )
        )
        payload["privatePath"] = "/tmp/inbox/document.pdf"
        with self.assertRaises(SUMMARY_BUILDER.RecoverySafetyError):
            SUMMARY_BUILDER.validate_public_summary(payload)


@unittest.skipUnless(node_binary(), "Node.js indisponível para validar a fila clínica")
class RecoveryDashboardFunctionalTests(unittest.TestCase):
    def test_invalid_approval_and_impossible_dates_fail_closed(self) -> None:
        script_path = json.dumps(
            str(LIBRARY / "assets/recovery-review-dashboard.js")
        )
        harness = f"""
const assert = require('assert');
const {{ validDate, normalizeRecord, recordValidationError }} = require({script_path});
const sha = 'a'.repeat(64);
assert.strictEqual(validDate('2026-02-31'), '');
assert.strictEqual(validDate('2024-02-29'), '2024-02-29');
assert.strictEqual(validDate('2025-02-29'), '');

const incomplete = normalizeRecord({{
  documentId: 'doc-1', documentSha256: sha, status: 'approved'
}});
assert(recordValidationError(incomplete).includes('responsável'));

const reversed = normalizeRecord({{
  documentId: 'doc-1', documentSha256: sha, status: 'approved',
  responsible: 'Revisor', source: 'Diretriz oficial',
  reviewedAt: '2026-07-21', validUntil: '2026-07-20'
}});
assert(recordValidationError(reversed).includes('anterior'));

const valid = normalizeRecord({{
  documentId: 'doc-1', documentSha256: sha, status: 'approved',
  responsible: 'Revisor', source: 'Diretriz oficial',
  reviewedAt: '2026-07-21', validUntil: '2027-07-21'
}});
assert.strictEqual(recordValidationError(valid), '');
process.stdout.write('ok');
"""
        result = subprocess.run(
            [node_binary(), "-e", harness],
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
            timeout=30,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout, "ok")


if __name__ == "__main__":
    unittest.main()
