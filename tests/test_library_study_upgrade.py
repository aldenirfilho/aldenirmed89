#!/usr/bin/env python3
"""Regressões do catálogo canônico, previews e modo estudo da Biblioteca."""

from __future__ import annotations

import json
import hashlib
import importlib.util
import re
import tempfile
import unicodedata
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
LIBRARY = ROOT / "02_Biblioteca_IA_Engine"


def load_json(relative: str) -> dict:
    return json.loads((ROOT / relative).read_text(encoding="utf-8"))


def load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Não foi possível carregar {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class LibraryCanonicalCatalogTests(unittest.TestCase):
    def test_manifest_and_catalog_have_exact_unique_public_paths(self) -> None:
        manifest = load_json("02_Biblioteca_IA_Engine/data/biblioteca_documentos_manifest.json")
        catalog = load_json("02_Biblioteca_IA_Engine/data/biblioteca_catalogo.json")
        files = manifest["files"]
        items = catalog["items"]

        manifest_paths = [item["path"] for item in files]
        catalog_paths = [item["path"] for item in items]
        manifest_ids = [item["id"] for item in files]
        catalog_ids = [item["id"] for item in items]

        self.assertEqual(manifest["totalFiles"], len(files))
        self.assertEqual(catalog["totalFiles"], len(items))
        self.assertEqual(len(manifest_paths), len(set(manifest_paths)))
        self.assertEqual(len(catalog_paths), len(set(catalog_paths)))
        self.assertEqual(len(manifest_ids), len(set(manifest_ids)))
        self.assertEqual(len(catalog_ids), len(set(catalog_ids)))
        self.assertEqual(catalog_paths, manifest_paths)
        self.assertEqual(catalog_ids, manifest_ids)
        self.assertTrue(any(item["extension"] == "pages" for item in files))

        for item in files:
            self.assertEqual(item["path"], unicodedata.normalize("NFC", item["path"]))
            self.assertTrue((LIBRARY / item["path"]).is_file(), item["path"])
            self.assertRegex(item["sourceSha256"], r"^[0-9a-f]{64}$")
            self.assertIn(item["previewMode"], {
                "pdf-native", "generated-html", "safe-text", "safe-table",
                "sandboxed-html", "download-only",
            })
            self.assertNotIn("juridico-financeiro", item["path"].casefold())
            self.assertNotIn("/_private/", f"/{item['path'].casefold()}/")
            self.assertNotIn("/inbox/", f"/{item['path'].casefold()}/")

    def test_generated_preview_index_matches_every_docx_pdf_and_pages_when_present(self) -> None:
        index_path = LIBRARY / "data/biblioteca_previews.json"
        if not index_path.exists():
            self.skipTest("Artefato de build; é gerado antes dos testes no workflow.")
        manifest = load_json("02_Biblioteca_IA_Engine/data/biblioteca_documentos_manifest.json")
        previews = json.loads(index_path.read_text(encoding="utf-8"))
        previewable_paths = {
            item["path"]
            for item in manifest["files"]
            if item["extension"] in {"docx", "pdf", "pages"}
        }
        preview_paths = {item["sourcePath"] for item in previews["items"]}
        self.assertEqual(preview_paths, previewable_paths)
        self.assertEqual(previews["generatedPreviews"], len(previewable_paths))
        self.assertEqual(
            previews["generatedByExtension"],
            {
                "docx": sum(item["extension"] == "docx" for item in manifest["files"]),
                "pages": sum(item["extension"] == "pages" for item in manifest["files"]),
                "pdf": sum(item["extension"] == "pdf" for item in manifest["files"]),
            },
        )
        for item in previews["items"]:
            self.assertTrue((LIBRARY / item["previewPath"]).is_file())

    def test_duplicate_report_uses_canonical_ids_and_never_authorizes_deletion(self) -> None:
        manifest = load_json("02_Biblioteca_IA_Engine/data/biblioteca_documentos_manifest.json")
        report = load_json("02_Biblioteca_IA_Engine/data/biblioteca_duplicados.json")
        canonical_ids = {item["id"] for item in manifest["files"]}
        canonical_paths = {item["path"] for item in manifest["files"]}
        groups = [*report["exactDuplicates"], *report["renditionFamilies"]]
        for group in groups:
            self.assertNotIn("apagar", group["recommendedAction"])
            for item in group["items"]:
                self.assertIn(item["id"], canonical_ids)
                self.assertIn(item["path"], canonical_paths)
        self.assertIn("não autoriza exclusão automática", report["description"])

    def test_publication_baseline_freezes_the_exact_physical_corpus(self) -> None:
        manifest = load_json("02_Biblioteca_IA_Engine/data/biblioteca_documentos_manifest.json")
        baseline = load_json("02_Biblioteca_IA_Engine/data/biblioteca_publication_baseline.json")
        canonical = []
        for path in sorted((LIBRARY / "acervo").rglob("*")):
            relative = path.relative_to(LIBRARY)
            if "juridico-financeiro" in {part.casefold() for part in relative.parts}:
                continue
            if not path.is_file() or path.name.casefold() == ".gitkeep":
                continue
            canonical.append(
                {
                    "path": unicodedata.normalize("NFC", relative.as_posix()),
                    "sourceSha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                }
            )
        canonical.sort(key=lambda value: value["path"])
        payload = json.dumps(
            canonical, ensure_ascii=False, sort_keys=True, separators=(",", ":")
        ).encode("utf-8")
        self.assertEqual(baseline["documentCount"], len(manifest["files"]))
        self.assertEqual(baseline["publicAssetCount"], len(canonical))
        self.assertEqual(baseline["corpusFingerprint"], hashlib.sha256(payload).hexdigest())
        self.assertIn("não confirma autoria", baseline["warning"])

        scanner = (LIBRARY / "scan_biblioteca.py").read_text(encoding="utf-8")
        main_source = scanner.split("def main(", 1)[1]
        self.assertLess(
            main_source.index("verify_publication_baseline(files, assets)"),
            main_source.index("write_outputs(outputs)"),
        )
        workflow = (ROOT / ".github/workflows/deploy-seguro.yml").read_text(encoding="utf-8")
        self.assertIn("update_library_publication_baseline.py --check", workflow)

    def test_scanner_blocks_unsupported_public_assets_and_accepts_zero_counts(self) -> None:
        scanner = load_module("library_scanner_test", LIBRARY / "scan_biblioteca.py")
        self.assertEqual(
            scanner.unexpected_public_assets(
                [], [{"path": "acervo/tema/imagem-paciente.jpg", "sourceSha256": "0" * 64}]
            ),
            ["acervo/tema/imagem-paciente.jpg"],
        )
        with tempfile.TemporaryDirectory() as temporary:
            baseline_path = Path(temporary) / "baseline.json"
            baseline_path.write_text(
                json.dumps(
                    {
                        "corpusFingerprint": scanner.corpus_fingerprint([]),
                        "publicAssetCount": 0,
                        "documentCount": 0,
                    }
                ),
                encoding="utf-8",
            )
            original = scanner.PUBLICATION_BASELINE
            scanner.PUBLICATION_BASELINE = baseline_path
            try:
                scanner.verify_publication_baseline([], [])
            finally:
                scanner.PUBLICATION_BASELINE = original

    def test_public_builder_rejects_every_acervo_file_outside_manifest(self) -> None:
        builder = load_module("library_builder_test", ROOT / "scripts_admin/build_public_site.py")
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            acervo = root / "02_Biblioteca_IA_Engine/acervo/tema"
            data = root / "02_Biblioteca_IA_Engine/data"
            acervo.mkdir(parents=True)
            data.mkdir(parents=True)
            (acervo / "documento.txt").write_text("aprovado", encoding="utf-8")
            (acervo / "imagem-paciente.jpg").write_bytes(b"nao catalogado")
            manifest = {
                "files": [{"path": "acervo/tema/documento.txt"}],
            }
            (data / "biblioteca_documentos_manifest.json").write_text(
                json.dumps(manifest), encoding="utf-8"
            )
            allowlist = builder.load_library_acervo_allowlist(root)
            with self.assertRaisesRegex(ValueError, "fora do manifesto"):
                builder.validate_library_acervo(root, allowlist)

            (acervo / "imagem-paciente.jpg").unlink()
            blocked = acervo / "Prompt_Antigravity.txt"
            blocked.write_text("suportado, mas bloqueado pelo nome", encoding="utf-8")
            manifest["files"].append({"path": "acervo/tema/Prompt_Antigravity.txt"})
            (data / "biblioteca_documentos_manifest.json").write_text(
                json.dumps(manifest), encoding="utf-8"
            )
            allowlist = builder.load_library_acervo_allowlist(root)
            with self.assertRaisesRegex(ValueError, "seria omitido"):
                builder.validate_library_acervo(root, allowlist)

    def test_public_builder_preserves_but_excludes_card_conflict_copies(self) -> None:
        builder = load_module("card_public_builder_test", ROOT / "scripts_admin/build_public_site.py")
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            public_root = root / "05_Midia_E_Feed/assets/cards/public/recovered/uti-geral"
            data_root = root / "05_Midia_E_Feed/data"
            public_root.mkdir(parents=True)
            data_root.mkdir(parents=True)
            (public_root / "card-a1b2c3.webp").write_bytes(b"canonical")
            conflict = public_root / "card-a1b2c3 2.webp"
            conflict.write_bytes(b"conflict-copy-preserved")
            (data_root / "public.json").write_text(
                json.dumps({"files": ["recovered/uti-geral/card-a1b2c3.webp"]}),
                encoding="utf-8",
            )

            allowlist = builder.load_card_public_allowlist(root)
            conflicts = builder.validate_card_public_assets(root, allowlist)
            self.assertEqual(
                conflicts,
                ["05_Midia_E_Feed/assets/cards/public/recovered/uti-geral/card-a1b2c3 2.webp"],
            )
            self.assertTrue(conflict.is_file())

            (public_root / "rogue.webp").write_bytes(b"not-approved")
            with self.assertRaisesRegex(ValueError, "fora do índice público"):
                builder.validate_card_public_assets(root, allowlist)

    def test_hash_bound_attestation_overrides_legacy_editorial_status(self) -> None:
        scanner = (LIBRARY / "scan_biblioteca.py").read_text(encoding="utf-8")
        editorial_position = scanner.index("canonical.update(editorial)")
        attestation_position = scanner.index(
            "attestation = gate_attestations.get(rel)", editorial_position
        )
        self.assertLess(editorial_position, attestation_position)


class LibraryStudyInterfaceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.source = (LIBRARY / "index.html").read_text(encoding="utf-8")

    def test_manifest_is_the_only_structural_source(self) -> None:
        self.assertIn("O manifesto físico validado é a única fonte estrutural", self.source)
        self.assertIn("const canonicalItems = []", self.source)
        self.assertIn("mergeEditorial(canonical, editorial[0])", self.source)
        self.assertNotIn("manifestByName", self.source)
        self.assertNotIn("catalog.items.push(mod)", self.source)
        self.assertNotIn("i.filename === (autoFile.name", self.source)
        self.assertNotIn("hiddenPaths.has(path)", self.source)

    def test_legacy_overrides_cannot_replace_identity_or_paths(self) -> None:
        match = re.search(r"const LOCAL_MUTABLE_FIELDS = (\[[^;]+\]);", self.source)
        self.assertIsNotNone(match)
        mutable = set(json.loads(match.group(1)))
        protected = {
            "id", "path", "filename", "name", "extension", "tipo", "format",
            "sourceSha256", "previewMode", "sizeBytes", "authorshipStatus",
            "authorshipEvidence", "license", "privacyReviewStatus",
            "clinicalReviewStatus",
        }
        self.assertTrue(protected.isdisjoint(mutable))
        self.assertIn("function mergeLocalOverride(repoItem, localOverride)", self.source)
        self.assertIn("canonicalItems.push(mergeLocalOverride", self.source)
        self.assertIn("localByPath.get(path) || localById.get(id)", self.source)

    def test_preview_modes_have_visible_safe_fallbacks(self) -> None:
        self.assertIn("fetch('data/biblioteca_previews.json', { cache: 'no-store' })", self.source)
        self.assertIn("findGeneratedPreviewEntry(path)", self.source)
        self.assertIn("validateTrustedPreview(entry, path, item, extension)", self.source)
        self.assertIn("PDF preservado — prévia em recuperação", self.source)
        self.assertIn("com capa e/ou texto extraído", self.source)
        self.assertIn("A imagem Quick Look local não pôde ser gerada", self.source)
        self.assertIn("frame.srcdoc = html", self.source)
        self.assertNotIn("#view=FitH", self.source)
        self.assertIn("renderTablePreview", self.source)
        self.assertIn("Apple Pages", self.source)
        self.assertNotIn("view.officeapps.live.com/op/embed.aspx", self.source)
        self.assertNotIn("window.open(encodedRelative", self.source)
        self.assertNotIn("window.innerWidth <= 800", self.source)

    def test_study_tools_and_ecosystem_connections_are_wired(self) -> None:
        for marker in (
            'id="view-estudo"',
            "biblioteca_estudo_v1",
            "function saveCurrentStudy(options = {})",
            "function exportStudyBackup()",
            "function importStudyBackup(event)",
            "function copyStudyPrompt()",
            "../01_UpDown_Hub/index.html",
            "../05_Midia_E_Feed/index.html",
            "../07_Questoes_Comentadas/index.html",
            "../03_Calculadoras_E_Apps/index.html",
            "../09_POCUS_Hub/index.html",
        ):
            self.assertIn(marker, self.source)
        self.assertNotIn("05_Midia_E_Feed/index.html?theme=", self.source)
        self.assertIn("Original somente leitura", self.source)
        self.assertIn("function searchKey(value)", self.source)
        self.assertIn("function matchesSearch(haystack, normalizedQuery)", self.source)
        self.assertIn("terms.every(term => normalizedHaystack.includes(term))", self.source)
        render_grid = self.source.split("function renderGrid()", 1)[1].split(
            "// Renderizar Triagem", 1
        )[0]
        self.assertLess(
            render_grid.index("grid-subtitle"),
            render_grid.index("if (items.length === 0)"),
        )
        self.assertIn("existingLoadMoreButton", render_grid)
        self.assertIn("function authorshipLabel(status)", self.source)
        self.assertIn("function scheduleStudyAutosave()", self.source)
        self.assertIn("sourceSha256: currentPreviewItem.sourceSha256", self.source)
        self.assertIn("nextReview: localDateISO(), sourceChanged: true", self.source)
        self.assertIn("let studyStoreCache = null", self.source)
        self.assertIn("window.addEventListener('storage'", self.source)
        self.assertIn("window.addEventListener('pagehide', flushPendingStudy)", self.source)
        self.assertIn("document.addEventListener('visibilitychange'", self.source)
        self.assertIn("window.addEventListener('beforeunload'", self.source)
        self.assertIn("if (loadToken !== previewLoadToken) return", self.source)


if __name__ == "__main__":
    unittest.main()
