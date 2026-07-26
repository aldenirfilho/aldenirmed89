#!/usr/bin/env python3
"""Determinismo e verificação da proveniência autoral SHA-256."""

from __future__ import annotations

import importlib.util
import json
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts_admin/generate_editorial_provenance.py"
COMMIT = "6ccb848f1d9b700304ad3c80d4fb2fce7271df32"
GENERATED_AT = "2026-07-25T12:00:00-03:00"


def load_module():
    spec = importlib.util.spec_from_file_location("editorial_provenance", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError("generate_editorial_provenance.py indisponível")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class EditorialProvenanceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.module = load_module()

    def test_manifest_is_deterministic_regardless_of_input_order(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            first = root / "a.md"
            second = root / "b.html"
            first.write_text("conteúdo A\n", encoding="utf-8")
            second.write_text("<p>conteúdo B</p>\n", encoding="utf-8")
            one = self.module.build_manifest(
                root, [second, first], COMMIT, GENERATED_AT
            )
            two = self.module.build_manifest(
                root, [first, second], COMMIT, GENERATED_AT
            )
            self.assertEqual(
                self.module.canonical_bytes(one),
                self.module.canonical_bytes(two),
            )
            self.assertEqual(
                [work["path"] for work in one["works"]],
                ["a.md", "b.html"],
            )
            self.assertEqual(one["mark"], "ATV · TURBO TEMI · ALD 360")
            self.assertEqual(one["author"], "Aldenir Rocha de Oliveira Filho")
            self.assertIn("não são prova jurídica absoluta", one["legalNotice"])

    def test_generator_requires_explicit_commit_and_timestamp(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "obra.md").write_text("obra", encoding="utf-8")
            result = subprocess.run(
                [
                    "python3",
                    str(SCRIPT),
                    "--root",
                    str(root),
                    "--input",
                    "obra.md",
                ],
                check=False,
                capture_output=True,
                text=True,
                env={"PATH": "/usr/bin:/bin"},
            )
            self.assertEqual(result.returncode, 2)
            self.assertIn("nunca são inferidos", result.stderr)

    def test_check_mode_does_not_write_and_detects_divergence(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / "obra.md"
            output = root / "provenance.json"
            source.write_text("versão 1", encoding="utf-8")
            common = [
                "python3",
                str(SCRIPT),
                "--root",
                str(root),
                "--input",
                "obra.md",
                "--commit",
                COMMIT,
                "--generated-at",
                GENERATED_AT,
                "--output",
                "provenance.json",
            ]
            generated = subprocess.run(common, check=False, capture_output=True, text=True)
            self.assertEqual(generated.returncode, 0, generated.stderr)
            before = output.read_bytes()
            checked = subprocess.run(
                common + ["--check"], check=False, capture_output=True, text=True
            )
            self.assertEqual(checked.returncode, 0, checked.stdout + checked.stderr)
            self.assertEqual(output.read_bytes(), before)
            source.write_text("versão adulterada", encoding="utf-8")
            divergent = subprocess.run(
                common + ["--check"], check=False, capture_output=True, text=True
            )
            self.assertEqual(divergent.returncode, 1)
            self.assertEqual(output.read_bytes(), before)

    def test_verify_detects_tampering(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / "obra.md"
            source.write_text("íntegro", encoding="utf-8")
            selected = self.module.resolve_selected_files(root, ["obra.md"])
            manifest = self.module.build_manifest(
                root, selected, COMMIT, GENERATED_AT
            )
            self.assertEqual(self.module.verify_manifest(root, manifest), [])
            source.write_text("alterado", encoding="utf-8")
            errors = self.module.verify_manifest(root, manifest)
            self.assertTrue(any("SHA-256 divergente" in error for error in errors))

    def test_generator_refuses_empty_or_outside_selection(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            with self.assertRaisesRegex(ValueError, "pelo menos um"):
                self.module.resolve_selected_files(root, [])
            outside = root.parent / "fora-editorial.txt"
            outside.write_text("fora", encoding="utf-8")
            try:
                with self.assertRaisesRegex(ValueError, "fora da raiz"):
                    self.module.resolve_selected_files(root, [str(outside)])
            finally:
                outside.unlink()

    def test_checked_in_public_output_is_an_honest_unissued_scaffold(self):
        data = json.loads(
            (ROOT / "data/editorial/editorial-provenance.json").read_text(
                encoding="utf-8"
            )
        )
        self.assertEqual(data["state"], "unissued")
        self.assertIsNone(data["commit"])
        self.assertIsNone(data["generatedAt"])
        self.assertEqual(data["works"], [])


if __name__ == "__main__":
    unittest.main()
