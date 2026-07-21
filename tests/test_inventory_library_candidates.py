#!/usr/bin/env python3
"""Testes do inventario privado de candidatos documentais."""

from __future__ import annotations

import hashlib
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts_admin/inventory_library_candidates.py"
SPEC = importlib.util.spec_from_file_location("inventory_library_candidates", SCRIPT)
assert SPEC and SPEC.loader
INVENTORY = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(INVENTORY)


class InventoryLibraryCandidatesTests(unittest.TestCase):
    def make_file(self, root: Path, relative: str, content: bytes) -> Path:
        path = root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)
        return path

    def test_inventory_is_private_relative_deterministic_and_metadata_only(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "fonte"
            root.mkdir()
            first = self.make_file(root, "autoria/Guia_Dr_Aldenir.docx", b"same-private-bytes")
            self.make_file(root, "duplicado/copia.docx", b"same-private-bytes")
            self.make_file(root, "outro/referencia.pdf", b"different-bytes")
            self.make_file(root, "outro/ignorar.jpg", b"not-a-document")
            self.make_file(root, ".git/segredo.pdf", b"git")
            self.make_file(root, "site/copia-publicada.pdf", b"site")
            self.make_file(root, "public_site/copia-publicada.docx", b"public-site")
            self.make_file(
                root,
                "checkout/02_Biblioteca_IA_Engine/acervo/publicado.pdf",
                b"public-acervo",
            )
            self.make_file(root, "descartar/irrelevante.pdf", b"excluded")

            payload = INVENTORY.build_inventory(root, exclude_dirs=["descartar"])
            payload_again = INVENTORY.build_inventory(root, exclude_dirs=["descartar"])
            self.assertEqual(payload, payload_again)
            self.assertEqual(payload["summary"]["files"], 3)
            self.assertEqual(payload["summary"]["authorshipHints"], 1)
            self.assertEqual(payload["summary"]["duplicateGroups"], 1)
            self.assertEqual(payload["summary"]["filesInDuplicateGroups"], 2)
            self.assertFalse(payload["safety"]["contentExtracted"])
            self.assertFalse(payload["safety"]["filesCopiedMovedDeletedOrPublished"])

            paths = [item["path"] for item in payload["files"]]
            self.assertEqual(
                paths,
                [
                    "autoria/Guia_Dr_Aldenir.docx",
                    "duplicado/copia.docx",
                    "outro/referencia.pdf",
                ],
            )
            self.assertTrue(payload["files"][0]["authorshipHint"])
            self.assertFalse(payload["files"][1]["authorshipHint"])
            self.assertEqual(
                payload["files"][0]["sha256"],
                hashlib.sha256(first.read_bytes()).hexdigest(),
            )
            serialized = json.dumps(payload, ensure_ascii=False)
            self.assertNotIn(str(root), serialized)
            self.assertNotIn("same-private-bytes", serialized)
            self.assertNotIn("different-bytes", serialized)

    def test_output_is_refused_outside_exact_private_component(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            base = Path(temporary)
            with self.assertRaisesRegex(ValueError, "_private"):
                INVENTORY.validate_output_path(base / "inventory.json")
            with self.assertRaisesRegex(ValueError, "_private"):
                INVENTORY.validate_output_path(base / "almost_private" / "inventory.json")
            accepted = INVENTORY.validate_output_path(base / "_private" / "inventory.json")
            self.assertEqual(accepted.name, "inventory.json")

    def test_check_detects_source_change_without_rewriting_inventory(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "fonte"
            root.mkdir()
            document = self.make_file(root, "documentos/resumo.pdf", b"v1")
            output = root / "_private" / "inventario.json"

            self.assertEqual(
                INVENTORY.main(
                    ["--source-root", str(root), "--output", str(output)]
                ),
                0,
            )
            original = output.read_bytes()
            self.assertEqual(
                INVENTORY.main(
                    ["--source-root", str(root), "--output", str(output), "--check"]
                ),
                0,
            )
            self.assertEqual(output.read_bytes(), original)

            document.write_bytes(b"v2")
            self.assertEqual(
                INVENTORY.main(
                    ["--source-root", str(root), "--output", str(output), "--check"]
                ),
                1,
            )
            self.assertEqual(output.read_bytes(), original)

    def test_explicit_public_acervo_and_extension_override_are_honored(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "fonte"
            root.mkdir()
            self.make_file(root, "publicado/custom/acervo/manual.pdf", b"public")
            self.make_file(root, "candidatos/manual.pdf", b"candidate")
            self.make_file(root, "candidatos/notas.xyz", b"custom")
            payload = INVENTORY.build_inventory(
                root,
                public_acervo_dirs=["publicado/custom/acervo"],
                extensions=["pdf", "xyz"],
            )
            self.assertEqual(
                [item["path"] for item in payload["files"]],
                ["candidatos/manual.pdf", "candidatos/notas.xyz"],
            )

    def test_relative_rules_reject_parent_traversal(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "fonte"
            root.mkdir()
            with self.assertRaisesRegex(ValueError, "relativo seguro"):
                INVENTORY.build_inventory(root, exclude_dirs=["../fora"])


if __name__ == "__main__":
    unittest.main()
