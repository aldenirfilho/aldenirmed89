#!/usr/bin/env python3
"""Testes da recuperação autoral privada, sem mutações no acervo público."""

from __future__ import annotations

import importlib.util
import io
import json
import os
import subprocess
import tempfile
import unittest
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts_admin/recover_authorial_batches.py"
SPEC = importlib.util.spec_from_file_location("recover_authorial_batches", SCRIPT)
assert SPEC and SPEC.loader
RECOVERY = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(RECOVERY)


def run_main(arguments: list[str]) -> tuple[int, str, str]:
    stdout = io.StringIO()
    stderr = io.StringIO()
    with redirect_stdout(stdout), redirect_stderr(stderr):
        code = RECOVERY.main(arguments)
    return code, stdout.getvalue(), stderr.getvalue()


def snapshot_tree(root: Path) -> dict[str, tuple[bytes, int]]:
    return {
        path.relative_to(root).as_posix(): (path.read_bytes(), path.stat().st_mtime_ns)
        for path in sorted(root.rglob("*"))
        if path.is_file()
    }


class AuthorialRecoveryBatchTests(unittest.TestCase):
    def make_sources(self, base: Path, *, total: int = 8) -> Path:
        inbox = base / "02_Biblioteca_IA_Engine/inbox"
        inbox.mkdir(parents=True)
        fixtures = [
            ("autoria/Manual_Dr_Aldenir.docx", b"manual-duplicado"),
            ("copias/Manual_Dr_Aldenir copia.docx", b"manual-duplicado"),
            ("hemostasia/Protocolo_Crioprecipitado.docx", b"docx-rendition"),
            ("hemostasia/Protocolo_Crioprecipitado.pdf", b"pdf-rendition"),
            ("sedacao/Guia_Sedacao.docx", b"sedacao"),
            ("pocus/POCUS_Choque.pdf", b"pocus"),
            ("temi/Questoes_TEMI.tsv", b"question\tanswer"),
            ("uti/Checklist_UTI.md", b"# checklist"),
        ]
        for relative, content in fixtures[:total]:
            path = inbox / relative
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(content)
        return inbox

    def test_default_is_read_only_and_does_not_create_registry_or_parent(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            base = Path(temporary)
            inbox = self.make_sources(base)
            registry = base / "02_Biblioteca_IA_Engine/_private/decisions.json"
            before = snapshot_tree(inbox)

            code, output, error = run_main(
                [
                    "--source-root",
                    str(inbox),
                    "--registry",
                    str(registry),
                    "--batch-size",
                    "5",
                ]
            )

            self.assertEqual(code, 0, error)
            self.assertIn("SOMENTE LEITURA", output)
            self.assertIn("Próximo lote: 5", output)
            self.assertFalse(registry.exists())
            self.assertFalse(registry.parent.exists())
            self.assertEqual(snapshot_tree(inbox), before)

    def test_explicit_private_write_groups_hash_duplicates_and_renditions(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            base = Path(temporary)
            inbox = self.make_sources(base)
            registry = base / "_private/decisions.json"
            before = snapshot_tree(inbox)

            code, output, error = run_main(
                [
                    "--source-root",
                    str(inbox),
                    "--registry",
                    str(registry),
                    "--batch-size",
                    "5",
                    "--write-private",
                ]
            )

            self.assertEqual(code, 0, error)
            self.assertIn("Apenas o registro privado foi atualizado", output)
            payload = json.loads(registry.read_text(encoding="utf-8"))
            self.assertEqual(payload["kind"], RECOVERY.REGISTRY_KIND)
            self.assertEqual(payload["inventory"]["summary"]["candidates"], 8)
            self.assertEqual(payload["inventory"]["summary"]["exactDuplicateGroups"], 1)
            self.assertEqual(payload["inventory"]["summary"]["possibleRenditionGroups"], 1)
            self.assertEqual(payload["nextBatch"]["selectedSize"], 5)
            selected_ids = payload["nextBatch"]["candidateIds"]
            selected_by_id = {
                item["candidateId"]: item for item in payload["inventory"]["candidates"]
            }
            self.assertEqual(
                len({selected_by_id[candidate_id]["sha256"] for candidate_id in selected_ids}),
                5,
            )
            duplicate_group = payload["inventory"]["duplicateGroups"][0]
            self.assertEqual(
                len(set(selected_ids) & set(duplicate_group["candidateIds"])),
                1,
            )
            duplicate_work = next(
                work
                for work in payload["nextBatch"]["works"]
                if work["sha256"] == duplicate_group["sha256"]
            )
            self.assertEqual(len(duplicate_work["occurrences"]), 2)
            self.assertFalse(payload["nextBatch"]["exactDuplicatesConsumeAdditionalSlots"])
            self.assertEqual(len(payload["decisions"]), 8)
            self.assertFalse(payload["policy"]["publishesCopiesMovesRenamesOrDeletes"])
            self.assertEqual(snapshot_tree(inbox), before)
            if os.name != "nt":
                self.assertEqual(registry.stat().st_mode & 0o777, 0o600)

    def test_public_manifest_hashes_are_marked_and_excluded_without_public_write(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            base = Path(temporary)
            inbox = self.make_sources(base)
            inventory = RECOVERY.build_inventory([inbox])
            duplicate_group = inventory["duplicateGroups"][0]
            public_path = "acervo/uti-geral/Manual_Dr_Aldenir.docx"
            manifest = (
                base
                / "02_Biblioteca_IA_Engine/data/biblioteca_documentos_manifest.json"
            )
            manifest.parent.mkdir(parents=True, exist_ok=True)
            manifest.write_text(
                json.dumps(
                    {
                        "files": [
                            {
                                "sourceSha256": duplicate_group["sha256"],
                                "path": public_path,
                            }
                        ]
                    }
                ),
                encoding="utf-8",
            )
            inbox_before = snapshot_tree(inbox)
            manifest_before = (manifest.read_bytes(), manifest.stat().st_mtime_ns)
            registry = base / "_private/decisions.json"

            code, output, error = run_main(
                [
                    "--source-root",
                    str(inbox),
                    "--registry",
                    str(registry),
                    "--public-manifest",
                    str(manifest),
                    "--batch-size",
                    "5",
                    "--write-private",
                ]
            )

            self.assertEqual(code, 0, error)
            self.assertIn("Manifesto público: SOMENTE LEITURA", output)
            payload = json.loads(registry.read_text(encoding="utf-8"))
            matching = [
                item
                for item in payload["inventory"]["candidates"]
                if item["sha256"] == duplicate_group["sha256"]
            ]
            self.assertEqual(len(matching), 2)
            self.assertTrue(all(item["alreadyPublicPaths"] == [public_path] for item in matching))
            self.assertEqual(
                payload["nextBatch"]["excludedAlreadyPublicUniqueSha256"], 1
            )
            self.assertEqual(payload["nextBatch"]["excludedAlreadyPublicOccurrences"], 2)
            self.assertTrue(
                all(
                    work["sha256"] != duplicate_group["sha256"]
                    for work in payload["nextBatch"]["works"]
                )
            )
            self.assertEqual(
                (manifest.read_bytes(), manifest.stat().st_mtime_ns), manifest_before
            )
            self.assertEqual(snapshot_tree(inbox), inbox_before)

    def test_gate_update_requires_write_and_complete_gates_leave_batch(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            base = Path(temporary)
            inbox = self.make_sources(base)
            registry = base / "_private/decisions.json"
            inventory = RECOVERY.build_inventory([inbox])
            candidate = next(
                item
                for item in inventory["candidates"]
                if item["filename"] == "Protocolo_Crioprecipitado.docx"
            )
            candidate_id = candidate["candidateId"]
            before = snapshot_tree(inbox)

            code, _, error = run_main(
                [
                    "--source-root",
                    str(inbox),
                    "--registry",
                    str(registry),
                    "--candidate-id",
                    candidate_id,
                    "--authorship-status",
                    "confirmed-author",
                ]
            )
            self.assertEqual(code, 2)
            self.assertIn("--write-private", error)
            self.assertFalse(registry.exists())

            arguments = [
                "--source-root",
                str(inbox),
                "--registry",
                str(registry),
                "--write-private",
                "--candidate-id",
                candidate_id,
                "--authorship-status",
                "confirmed-author",
                "--authorship-evidence",
                "Declaração autoral privada verificada.",
                "--license-status",
                "owned",
                "--license-evidence",
                "Titularidade registrada na ficha privada.",
                "--privacy-status",
                "no-sensitive-data",
                "--privacy-evidence",
                "Inspeção humana concluída sem identificadores.",
                "--clinical-review-status",
                "approved",
                "--clinical-review-evidence",
                "Revisão médica registrada em 2026-07-21.",
                "--notes",
                "Aguardando promoção humana separada.",
            ]
            code, _, error = run_main(arguments)
            self.assertEqual(code, 0, error)
            payload = json.loads(registry.read_text(encoding="utf-8"))
            self.assertEqual(
                RECOVERY.decision_state(payload["decisions"][candidate_id]),
                "gates-complete-human-review-required",
            )
            self.assertNotIn(candidate_id, payload["nextBatch"]["candidateIds"])
            self.assertEqual(
                payload["decisionSummary"]["gatesCompleteHumanReviewRequired"], 1
            )
            self.assertEqual(snapshot_tree(inbox), before)

    def test_third_party_remains_private_even_with_open_license(self) -> None:
        decision = RECOVERY.default_decision()
        decision["authorship"] = RECOVERY.empty_gate(
            "third-party", "Autoria externa confirmada.", "2026-07-21T00:00:00+00:00"
        )
        decision["license"] = RECOVERY.empty_gate(
            "open-license", "Licença aberta conferida.", "2026-07-21T00:00:00+00:00"
        )
        decision["privacy"] = RECOVERY.empty_gate(
            "no-sensitive-data", "Inspeção concluída.", "2026-07-21T00:00:00+00:00"
        )
        decision["clinicalReview"] = RECOVERY.empty_gate(
            "approved", "Revisão clínica registrada.", "2026-07-21T00:00:00+00:00"
        )

        self.assertEqual(RECOVERY.decision_state(decision), "hold-private")

    def test_mixed_exact_duplicate_decisions_are_reported_as_conflict(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            base = Path(temporary)
            inbox = self.make_sources(base, total=2)
            inventory = RECOVERY.build_inventory([inbox])
            candidates = inventory["candidates"]
            self.assertEqual(candidates[0]["sha256"], candidates[1]["sha256"])
            decisions = {
                item["candidateId"]: RECOVERY.default_decision() for item in candidates
            }
            completed = decisions[candidates[0]["candidateId"]]
            completed["authorship"] = RECOVERY.empty_gate(
                "confirmed-author", "Autoria conferida.", "2026-07-21T00:00:00+00:00"
            )
            completed["license"] = RECOVERY.empty_gate(
                "owned", "Titularidade conferida.", "2026-07-21T00:00:00+00:00"
            )
            completed["privacy"] = RECOVERY.empty_gate(
                "no-sensitive-data", "Inspeção concluída.", "2026-07-21T00:00:00+00:00"
            )
            completed["clinicalReview"] = RECOVERY.empty_gate(
                "approved", "Revisão clínica registrada.", "2026-07-21T00:00:00+00:00"
            )

            batch = RECOVERY.select_next_batch(inventory, decisions, 5)

            self.assertEqual(batch["selectedSize"], 0)
            self.assertEqual(batch["conflictingDecisionUniqueSha256"], 1)
            conflict = batch["conflictingDecisions"][0]
            self.assertEqual(conflict["sha256"], candidates[0]["sha256"])
            self.assertEqual(
                {item["state"] for item in conflict["occurrences"]},
                {"pending", "gates-complete-human-review-required"},
            )

    def test_public_source_and_non_private_registry_are_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            base = Path(temporary)
            public = base / "02_Biblioteca_IA_Engine/acervo/uti-geral"
            public.mkdir(parents=True)
            (public / "manual.pdf").write_bytes(b"public")

            code, _, error = run_main(
                [
                    "--source-root",
                    str(public),
                    "--registry",
                    str(base / "_private/decisions.json"),
                ]
            )
            self.assertEqual(code, 2)
            self.assertIn("inbox ou _private", error)

            inbox = self.make_sources(base / "outra-fonte", total=1)
            code, _, error = run_main(
                [
                    "--source-root",
                    str(inbox),
                    "--registry",
                    str(base / "decisions.json"),
                    "--write-private",
                ]
            )
            self.assertEqual(code, 2)
            self.assertIn("_private", error)
            self.assertFalse((base / "decisions.json").exists())

    def test_corrupt_registry_fails_closed_without_overwrite(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            base = Path(temporary)
            inbox = self.make_sources(base, total=1)
            registry = base / "_private/decisions.json"
            registry.parent.mkdir()
            registry.write_text("{registro quebrado", encoding="utf-8")
            before = registry.read_bytes()

            code, _, error = run_main(
                [
                    "--source-root",
                    str(inbox),
                    "--registry",
                    str(registry),
                    "--write-private",
                ]
            )

            self.assertEqual(code, 2)
            self.assertIn("JSON inválido", error)
            self.assertEqual(registry.read_bytes(), before)

    def test_existing_registry_is_not_rewritten_in_default_mode(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            base = Path(temporary)
            inbox = self.make_sources(base, total=2)
            registry = base / "_private/decisions.json"
            common = [
                "--source-root",
                str(inbox),
                "--registry",
                str(registry),
            ]
            self.assertEqual(run_main([*common, "--write-private"])[0], 0)
            before_bytes = registry.read_bytes()
            before_mtime = registry.stat().st_mtime_ns

            code, output, error = run_main(common)

            self.assertEqual(code, 0, error)
            self.assertIn("SOMENTE LEITURA", output)
            self.assertEqual(registry.read_bytes(), before_bytes)
            self.assertEqual(registry.stat().st_mtime_ns, before_mtime)

    def test_changed_source_gets_new_id_and_preserves_orphaned_decision(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            base = Path(temporary)
            inbox = self.make_sources(base, total=1)
            source = next(inbox.rglob("*.docx"))
            registry = base / "_private/decisions.json"
            common = [
                "--source-root",
                str(inbox),
                "--registry",
                str(registry),
                "--write-private",
            ]
            self.assertEqual(run_main(common)[0], 0)
            first = json.loads(registry.read_text(encoding="utf-8"))
            old_id = first["inventory"]["candidates"][0]["candidateId"]

            # A mudança é parte do fixture; a ferramenta apenas deve percebê-la.
            source.write_bytes(b"nova-versao-do-documento")
            source_snapshot = snapshot_tree(inbox)
            code, _, error = run_main(common)

            self.assertEqual(code, 0, error)
            refreshed = json.loads(registry.read_text(encoding="utf-8"))
            new_id = refreshed["inventory"]["candidates"][0]["candidateId"]
            self.assertNotEqual(new_id, old_id)
            self.assertIn(old_id, refreshed["decisions"])
            self.assertIn(new_id, refreshed["decisions"])
            self.assertIn(old_id, refreshed["decisionSummary"]["orphanedDecisionIds"])
            self.assertEqual(snapshot_tree(inbox), source_snapshot)

    def test_write_inside_git_repository_requires_ignore_rule(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            repo = Path(temporary) / "repo"
            repo.mkdir()
            subprocess.run(["git", "init", "-q", str(repo)], check=True)
            inbox = self.make_sources(repo, total=1)
            registry = repo / "_private/decisions.json"
            arguments = [
                "--source-root",
                str(inbox),
                "--registry",
                str(registry),
                "--write-private",
            ]

            code, _, error = run_main(arguments)
            self.assertEqual(code, 2)
            self.assertIn(".gitignore", error)
            self.assertFalse(registry.exists())

            (repo / ".gitignore").write_text("**/_private/\n", encoding="utf-8")
            code, _, error = run_main(arguments)
            self.assertEqual(code, 0, error)
            self.assertTrue(registry.is_file())
            ignored = subprocess.run(
                ["git", "-C", str(repo), "check-ignore", "--quiet", "--", "_private/decisions.json"],
                check=False,
            )
            self.assertEqual(ignored.returncode, 0)

    def test_final_partial_batch_is_explicit(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            base = Path(temporary)
            inbox = self.make_sources(base, total=3)
            registry = base / "_private/decisions.json"
            code, output, error = run_main(
                [
                    "--source-root",
                    str(inbox),
                    "--registry",
                    str(registry),
                    "--batch-size",
                    "5",
                ]
            )
            self.assertEqual(code, 0, error)
            self.assertIn("Lote final parcial", output)
            self.assertFalse(registry.exists())


if __name__ == "__main__":
    unittest.main()
