#!/usr/bin/env python3
"""Regressões do isolamento preventivo no artefato público."""

from __future__ import annotations

import importlib.util
import hashlib
import json
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE_ONLY_EXCLUDED = {
    "01_Modulos_Clinicos/Dermatologia_Critica/module.manifest.json",
}
ABSENT_INTERNAL = {
    "01_UpDown_Hub/content/reumatologia/les-manifestacoes/metadata.json",
    "05_Midia_E_Feed/data/recovery_manifest.json",
}
EXCLUDED = SOURCE_ONLY_EXCLUDED | ABSENT_INTERNAL


def load_builder():
    path = ROOT / "scripts_admin/build_public_site.py"
    spec = importlib.util.spec_from_file_location("content_isolation_builder", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("Não foi possível carregar o builder público.")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class PublicContentIsolationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.builder = load_builder()

    def test_builder_excludes_all_explicitly_protected_files(self) -> None:
        self.assertEqual(set(self.builder.PUBLIC_BUILD_EXCLUSIONS), EXCLUDED)

    def test_copy_preserves_sources_and_adjacent_public_files(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            site = root / "site"
            fixtures = {
                "01_Modulos_Clinicos/Dermatologia_Critica/module.manifest.json":
                    '{"status":"published","visibility":"source-only"}',
                "01_UpDown_Hub/content/reumatologia/les-manifestacoes/metadata.json":
                    '{"state":"review"}',
                "01_UpDown_Hub/content/reumatologia/les-manifestacoes/reader/metadata.json":
                    '{"state":"public"}',
                "05_Midia_E_Feed/data/recovery_manifest.json":
                    '{"internal":"inventory"}',
                "05_Midia_E_Feed/data/public.json":
                    '{"files":[]}',
            }
            for relative, payload in fixtures.items():
                source = root / relative
                source.parent.mkdir(parents=True, exist_ok=True)
                source.write_text(payload, encoding="utf-8")

            for top_level in (
                "01_Modulos_Clinicos",
                "01_UpDown_Hub",
                "05_Midia_E_Feed",
            ):
                self.builder.copy_entry(root, site, top_level, set(), set())

            for relative in EXCLUDED:
                self.assertTrue((root / relative).is_file())
                self.assertFalse((site / relative).exists())
            for relative in {
                "01_UpDown_Hub/content/reumatologia/les-manifestacoes/reader/metadata.json",
                "05_Midia_E_Feed/data/public.json",
            }:
                self.assertEqual(
                    (site / relative).read_bytes(),
                    (root / relative).read_bytes(),
                )

    def test_preview_metadata_quarantines_source_and_all_public_indexes(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            library = root / "02_Biblioteca_IA_Engine"
            data = library / "data"
            previews = library / "previews"
            acervo = library / "acervo/tema"
            data.mkdir(parents=True)
            previews.mkdir()
            acervo.mkdir(parents=True)
            policy_path = root / "data/editorial/policy.json"
            policy_path.parent.mkdir(parents=True)
            policy_path.write_text(
                json.dumps(
                    {
                        "scanning": {
                            "textExtensions": [".csv", ".md", ".txt"],
                            "publicContactAllowlist": [],
                        }
                    }
                ),
                encoding="utf-8",
            )

            blocked_source = acervo / "bloqueado.docx"
            safe_source = acervo / "seguro.docx"
            pdf_source = acervo / "sempre-bloqueado.pdf"
            blocked_source.write_bytes(b"fonte preservada")
            safe_source.write_bytes(b"fonte segura")
            pdf_source.write_bytes(b"%PDF-1.4 fonte estrutural")
            blocked_preview = previews / ("docx-" + "a" * 20 + ".html")
            safe_preview = previews / ("docx-" + "b" * 20 + ".html")
            pdf_preview = previews / ("pdf-" + "c" * 20 + ".html")
            blocked_preview.write_text(
                "<!doctype html><title>Conteúdo em revisão editorial</title>",
                encoding="utf-8",
            )
            safe_preview.write_text(
                "<!doctype html><title>Material seguro</title>",
                encoding="utf-8",
            )
            pdf_preview.write_text(
                "<!doctype html><title>Prévia PDF aparentemente segura</title>",
                encoding="utf-8",
            )

            def record(
                identifier: str,
                filename: str,
                source: Path,
                extension: str = "docx",
                file_format: str = "doc-ia",
            ) -> dict:
                return {
                    "id": identifier,
                    "path": f"acervo/tema/{filename}",
                    "extension": extension,
                    "format": file_format,
                    "origin": "gerada-por-ia",
                    "sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(),
                }

            blocked_record = record("doc-bloqueado", "bloqueado.docx", blocked_source)
            safe_record = record("doc-seguro", "seguro.docx", safe_source)
            pdf_record = record(
                "doc-pdf",
                "sempre-bloqueado.pdf",
                pdf_source,
                "pdf",
                "pdf-artigos",
            )
            manifest = {
                "updatedAt": "2026-07-25",
                "totalFiles": 3,
                "partitions": [
                    {"id": "doc-ia", "extensions": ["doc", "docx"], "count": 2},
                    {"id": "pdf-artigos", "extensions": ["pdf"], "count": 1},
                ],
                "origins": [{"id": "gerada-por-ia", "count": 3}],
                "files": [blocked_record, safe_record, pdf_record],
            }
            (data / "biblioteca_documentos_manifest.json").write_text(
                json.dumps(manifest), encoding="utf-8"
            )
            for filename, list_key in (
                ("biblioteca_catalogo.json", "items"),
                ("biblioteca_inbox_manifest_auto.json", "files"),
            ):
                (data / filename).write_text(
                    json.dumps(
                        {
                            "totalFiles": 3,
                            list_key: [blocked_record, safe_record, pdf_record],
                        }
                    ),
                    encoding="utf-8",
                )
            preview_items = [
                {
                    "documentId": "doc-bloqueado",
                    "sourcePath": blocked_record["path"],
                    "sourceSha256": blocked_record["sourceSha256"],
                    "previewPath": f"previews/{blocked_preview.name}",
                    "previewSha256": hashlib.sha256(
                        blocked_preview.read_bytes()
                    ).hexdigest(),
                    "previewFormat": "docx",
                    "status": "review-blocked",
                    "riskCodes": ["SENSITIVE_PATIENT_ID"],
                    "stats": {},
                },
                {
                    "documentId": "doc-seguro",
                    "sourcePath": safe_record["path"],
                    "sourceSha256": safe_record["sourceSha256"],
                    "previewPath": f"previews/{safe_preview.name}",
                    "previewSha256": hashlib.sha256(
                        safe_preview.read_bytes()
                    ).hexdigest(),
                    "previewFormat": "docx",
                    "status": "ready",
                    "stats": {},
                },
                {
                    "documentId": "doc-pdf",
                    "sourcePath": pdf_record["path"],
                    "sourceSha256": pdf_record["sourceSha256"],
                    "previewPath": f"previews/{pdf_preview.name}",
                    "previewSha256": hashlib.sha256(
                        pdf_preview.read_bytes()
                    ).hexdigest(),
                    "previewFormat": "pdf",
                    "status": "ready",
                    "stats": {
                        "nativeVisibleCharacters": 500,
                        "ocrReady": False,
                    },
                },
            ]
            preview_index_path = data / "biblioteca_previews.json"
            preview_index_payload = {
                "version": "library-previews-v5",
                "items": preview_items,
            }
            preview_index_path.write_text(
                json.dumps(
                    preview_index_payload
                ),
                encoding="utf-8",
            )
            (data / "biblioteca_brain_connections.json").write_text(
                json.dumps(
                    {
                        "nodes": [
                            {
                                "id": "node-blocked",
                                "type": "document",
                                "sourceId": "doc-bloqueado",
                                "path": (
                                    "02_Biblioteca_IA_Engine/"
                                    + blocked_record["path"]
                                ),
                            },
                            {
                                "id": "node-safe",
                                "type": "document",
                                "sourceId": "doc-seguro",
                                "path": (
                                    "02_Biblioteca_IA_Engine/"
                                    + safe_record["path"]
                                ),
                            },
                        ],
                        "edges": [
                            {"from": "node-safe", "to": "node-blocked"}
                        ],
                        "stats": {},
                    }
                ),
                encoding="utf-8",
            )
            (data / "biblioteca_duplicados.json").write_text(
                json.dumps(
                    {
                        "exactDuplicates": [
                            {
                                "count": 2,
                                "items": [blocked_record, safe_record],
                            }
                        ],
                        "renditionFamilies": [],
                        "summary": {},
                    }
                ),
                encoding="utf-8",
            )
            (data / "biblioteca_card_candidates.json").write_text(
                json.dumps(
                    [
                        {
                            "id": "lib-card-bloqueado",
                            "source": "Biblioteca IA (bloqueado.docx)",
                        },
                        {
                            "id": "lib-card-seguro",
                            "source": "Biblioteca IA (seguro.docx)",
                        },
                    ]
                ),
                encoding="utf-8",
            )
            (data / "biblioteca_temi_question_candidates.json").write_text(
                json.dumps(
                    [
                        {
                            "id": "q-lib-bloqueado",
                            "sourceFileId": "bloqueado",
                            "commentary": "Extraído de bloqueado.docx",
                        },
                        {
                            "id": "q-lib-seguro",
                            "sourceFileId": "seguro",
                            "commentary": "Extraído de seguro.docx",
                        },
                    ]
                ),
                encoding="utf-8",
            )
            feed_patch = root / "05_Midia_E_Feed/data/cards_patch_biblioteca.json"
            feed_patch.parent.mkdir(parents=True)
            feed_patch.write_text(
                json.dumps(
                    [
                        {
                            "id": "lib-card-bloqueado",
                            "source": "Biblioteca IA (bloqueado.docx)",
                        },
                        {
                            "id": "lib-card-seguro",
                            "source": "Biblioteca IA (seguro.docx)",
                        },
                    ]
                ),
                encoding="utf-8",
            )

            allowlist = self.builder.load_library_acervo_allowlist(root)
            plan = self.builder.load_library_publication_plan(root, allowlist)
            self.assertEqual(
                plan.blocked_source_paths,
                {blocked_record["path"], pdf_record["path"]},
            )
            self.assertEqual(
                plan.preview_only_source_paths,
                {safe_record["path"]},
            )
            self.assertNotIn(
                "02_Biblioteca_IA_Engine/" + safe_record["path"],
                plan.public_acervo_allowlist,
            )
            self.assertIn(
                "02_Biblioteca_IA_Engine/" + safe_record["path"],
                plan.excluded_repository_paths,
            )
            mismatched = json.loads(json.dumps(preview_index_payload))
            mismatched["items"][1]["previewFormat"] = "pages"
            preview_index_path.write_text(json.dumps(mismatched), encoding="utf-8")
            mismatch_plan = self.builder.load_library_publication_plan(root, allowlist)
            self.assertIn(safe_record["path"], mismatch_plan.blocked_source_paths)
            unknown = json.loads(json.dumps(preview_index_payload))
            unknown["items"][1]["status"] = "experimental"
            preview_index_path.write_text(json.dumps(unknown), encoding="utf-8")
            unknown_plan = self.builder.load_library_publication_plan(root, allowlist)
            self.assertIn(safe_record["path"], unknown_plan.blocked_source_paths)
            preview_index_path.write_text(
                json.dumps(preview_index_payload),
                encoding="utf-8",
            )
            safe_source.write_bytes(b"fonte adulterada")
            with self.assertRaisesRegex(ValueError, "SHA-256 físico divergente"):
                self.builder.load_library_publication_plan(root, allowlist)
            safe_source.write_bytes(b"fonte segura")
            plan = self.builder.load_library_publication_plan(root, allowlist)

            site = root / "site"
            self.builder.copy_entry(
                root,
                site,
                "02_Biblioteca_IA_Engine",
                set(plan.public_acervo_allowlist),
                set(),
                plan.excluded_repository_paths,
            )
            self.builder.write_public_library_metadata(root, site, plan)

            self.assertTrue(blocked_source.is_file())
            self.assertTrue(blocked_preview.is_file())
            self.assertFalse(
                (site / "02_Biblioteca_IA_Engine" / blocked_record["path"]).exists()
            )
            self.assertFalse(
                (site / "02_Biblioteca_IA_Engine/previews" / blocked_preview.name).exists()
            )
            self.assertFalse(
                (site / "02_Biblioteca_IA_Engine" / pdf_record["path"]).exists()
            )
            self.assertFalse(
                (site / "02_Biblioteca_IA_Engine/previews" / pdf_preview.name).exists()
            )
            self.assertFalse(
                (site / "02_Biblioteca_IA_Engine" / safe_record["path"]).exists()
            )
            self.assertTrue(
                (site / "02_Biblioteca_IA_Engine/previews" / safe_preview.name).is_file()
            )
            public_acervo = site / "02_Biblioteca_IA_Engine/acervo"
            self.assertEqual(
                [
                    path
                    for path in public_acervo.rglob("*")
                    if path.is_file()
                    and path.suffix.casefold() in {".docx", ".pdf", ".pages"}
                ],
                [],
            )
            public_tree = "\n".join(
                path.read_text(encoding="utf-8")
                for path in (site / "02_Biblioteca_IA_Engine/data").glob("*.json")
            )
            self.assertNotIn("doc-bloqueado", public_tree)
            self.assertNotIn("acervo/tema/bloqueado.docx", public_tree)
            self.assertNotIn("acervo/tema/sempre-bloqueado.pdf", public_tree)
            self.assertIn("doc-seguro", public_tree)
            public_cards = json.loads(
                (
                    site
                    / "02_Biblioteca_IA_Engine/data/biblioteca_card_candidates.json"
                ).read_text(encoding="utf-8")
            )
            public_questions = json.loads(
                (
                    site
                    / "02_Biblioteca_IA_Engine/data/biblioteca_temi_question_candidates.json"
                ).read_text(encoding="utf-8")
            )
            public_feed_patch = json.loads(
                (
                    site
                    / "05_Midia_E_Feed/data/cards_patch_biblioteca.json"
                ).read_text(encoding="utf-8")
            )
            self.assertEqual(public_cards, [])
            self.assertEqual(public_questions, [])
            self.assertEqual(public_feed_patch, [])
            for payload in (public_cards, public_questions, public_feed_patch):
                self.assertIsInstance(payload, list)
            self.assertEqual(
                len(
                    json.loads(
                        (
                            root
                            / "02_Biblioteca_IA_Engine/data/biblioteca_card_candidates.json"
                        ).read_text(encoding="utf-8")
                    )
                ),
                2,
            )
            self.assertEqual(
                len(json.loads(feed_patch.read_text(encoding="utf-8"))),
                2,
            )
            public_manifest = json.loads(
                (
                    site
                    / "02_Biblioteca_IA_Engine/data/biblioteca_documentos_manifest.json"
                ).read_text(encoding="utf-8")
            )
            self.assertEqual(public_manifest["totalFiles"], 1)
            self.assertEqual(public_manifest["partitions"][0]["count"], 1)
            self.assertEqual(public_manifest["partitions"][1]["count"], 0)
            self.assertEqual(public_manifest["origins"][0]["count"], 1)
            self.assertEqual(
                public_manifest["files"][0]["publicationMode"],
                "preview-only",
            )
            self.assertIs(public_manifest["files"][0]["originalPublic"], False)
            for relative, key in (
                ("biblioteca_catalogo.json", "items"),
                ("biblioteca_inbox_manifest_auto.json", "files"),
                ("biblioteca_previews.json", "items"),
            ):
                payload = json.loads(
                    (
                        site / "02_Biblioteca_IA_Engine/data" / relative
                    ).read_text(encoding="utf-8")
                )
                self.assertEqual(payload[key][0]["publicationMode"], "preview-only")
                self.assertIs(payload[key][0]["originalPublic"], False)

    def test_non_preview_format_requires_direct_editorial_gate(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            library = root / "02_Biblioteca_IA_Engine"
            data = library / "data"
            acervo = library / "acervo/tema"
            data.mkdir(parents=True)
            acervo.mkdir(parents=True)
            policy_path = root / "data/editorial/policy.json"
            policy_path.parent.mkdir(parents=True)
            policy_path.write_text(
                json.dumps(
                    {
                        "scanning": {
                            "textExtensions": [".md", ".tsv"],
                            "publicContactAllowlist": [],
                        }
                    }
                ),
                encoding="utf-8",
            )
            safe_md = acervo / "seguro.md"
            unsupported_tsv = acervo / "nao-auditavel.tsv"
            safe_md.write_text("# Conteúdo seguro", encoding="utf-8")
            unsupported_tsv.write_text("frente\tverso", encoding="utf-8")

            def record(identifier: str, path: Path, extension: str) -> dict:
                return {
                    "id": identifier,
                    "path": f"acervo/tema/{path.name}",
                    "extension": extension,
                    "sourceSha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                }

            safe_record = record("doc-md", safe_md, "md")
            blocked_record = record("doc-tsv", unsupported_tsv, "tsv")
            (data / "biblioteca_documentos_manifest.json").write_text(
                json.dumps(
                    {
                        "files": [safe_record, blocked_record],
                    }
                ),
                encoding="utf-8",
            )
            (data / "biblioteca_previews.json").write_text(
                json.dumps(
                    {
                        "version": "library-previews-v5",
                        "items": [],
                    }
                ),
                encoding="utf-8",
            )

            allowlist = self.builder.load_library_acervo_allowlist(root)
            plan = self.builder.load_library_publication_plan(root, allowlist)

            self.assertIn(
                "02_Biblioteca_IA_Engine/acervo/tema/seguro.md",
                plan.public_acervo_allowlist,
            )
            self.assertNotIn(
                "02_Biblioteca_IA_Engine/acervo/tema/nao-auditavel.tsv",
                plan.public_acervo_allowlist,
            )
            self.assertEqual(
                plan.blocked_source_paths,
                {"acervo/tema/nao-auditavel.tsv"},
            )

    def test_builder_always_blocks_pages_even_with_ready_preview(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            library = root / "02_Biblioteca_IA_Engine"
            data = library / "data"
            acervo = library / "acervo/tema"
            previews = library / "previews"
            data.mkdir(parents=True)
            acervo.mkdir(parents=True)
            previews.mkdir()
            policy_path = root / "data/editorial/policy.json"
            policy_path.parent.mkdir(parents=True)
            policy_path.write_text(
                json.dumps(
                    {
                        "scanning": {
                            "textExtensions": [".md"],
                            "publicContactAllowlist": [],
                        }
                    }
                ),
                encoding="utf-8",
            )
            source = acervo / "documento.pages"
            source.write_bytes(b"pacote pages preservado")
            preview = previews / ("pages-" + "d" * 20 + ".html")
            preview.write_text(
                "<!doctype html><title>Quick Look pronto</title>",
                encoding="utf-8",
            )
            record = {
                "id": "doc-pages",
                "path": "acervo/tema/documento.pages",
                "extension": "pages",
                "sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(),
            }
            (data / "biblioteca_documentos_manifest.json").write_text(
                json.dumps({"files": [record]}),
                encoding="utf-8",
            )
            (data / "biblioteca_previews.json").write_text(
                json.dumps(
                    {
                        "version": "library-previews-v5",
                        "items": [
                            {
                                "documentId": "doc-pages",
                                "sourcePath": record["path"],
                                "sourceSha256": record["sourceSha256"],
                                "previewPath": f"previews/{preview.name}",
                                "previewSha256": hashlib.sha256(
                                    preview.read_bytes()
                                ).hexdigest(),
                                "previewFormat": "pages",
                                "status": "ready",
                                "stats": {"previewAsset": "preview-web.jpg"},
                            }
                        ],
                    }
                ),
                encoding="utf-8",
            )

            allowlist = self.builder.load_library_acervo_allowlist(root)
            plan = self.builder.load_library_publication_plan(root, allowlist)

            self.assertEqual(plan.blocked_source_paths, {record["path"]})
            self.assertNotIn(
                "02_Biblioteca_IA_Engine/acervo/tema/documento.pages",
                plan.public_acervo_allowlist,
            )
            self.assertIn(
                "02_Biblioteca_IA_Engine/previews/" + preview.name,
                plan.excluded_repository_paths,
            )

    def test_deploy_smoke_asserts_both_exclusions(self) -> None:
        workflow = (ROOT / ".github/workflows/deploy-seguro.yml").read_text(
            encoding="utf-8"
        )
        self.assertIn(
            "python3 scripts_admin/editorial_gate.py --check --public-root site --json",
            workflow,
        )
        for relative in EXCLUDED:
            self.assertIn(f"test ! -e site/{relative}", workflow)

    def test_service_worker_revokes_the_previous_public_cache(self) -> None:
        worker = (ROOT / "sw.js").read_text(encoding="utf-8")
        self.assertIn('const CACHE_NAME = `${CACHE_PREFIX}v18`', worker)
        self.assertNotIn('const CACHE_NAME = `${CACHE_PREFIX}v12`', worker)
        self.assertIn(
            "key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME",
            worker,
        )
        self.assertIn(".map((key) => caches.delete(key))", worker)

    def test_library_ui_hides_original_actions_for_preview_only_items(self) -> None:
        source = (
            ROOT / "02_Biblioteca_IA_Engine/index.html"
        ).read_text(encoding="utf-8")
        self.assertIn("function isPreviewOnlyItem(item)", source)
        self.assertGreaterEqual(source.count("i.originalPublic === false"), 2)
        self.assertIn("link.removeAttribute('href')", source)
        self.assertIn("currentPreviewContext.previewOnly", source)
        self.assertIn("O arquivo binário original não integra o site público.", source)

    def test_internal_sources_are_absent_but_adjacent_public_files_remain(self) -> None:
        for relative in ABSENT_INTERNAL:
            self.assertFalse((ROOT / relative).exists())
        self.assertTrue(
            (
                ROOT
                / "01_UpDown_Hub/content/reumatologia/les-manifestacoes/reader/metadata.json"
            ).is_file()
        )
        self.assertTrue((ROOT / "05_Midia_E_Feed/data/public.json").is_file())

    def test_public_footers_have_neutral_attribution_and_review_warning(self) -> None:
        forbidden = (
            "Desenvolvido por Dr.",
            "CRM-CE 16587",
            "RQE Clínica Médica 11846",
            "Mestre Ciências da Saúde",
            "Plantonista UTI/Enfermaria",
            "Hospital Regional Norte",
            "Santa Casa de Sobral",
        )
        for relative in (
            "13_RenalDose_Antimicrobianos/index.html",
            "14_SAPS3_Calculator/index.html",
        ):
            source = (ROOT / relative).read_text(encoding="utf-8")
            self.assertIn(
                "Idealização e edição da plataforma: Aldenir Rocha de Oliveira Filho.",
                source,
            )
            self.assertIn("Conteúdo educacional em revisão.", source)
            for claim in forbidden:
                self.assertNotIn(claim, source)

    def test_registry_has_one_unique_protective_release(self) -> None:
        registry = json.loads(
            (ROOT / "data/editorial/registry.json").read_text(encoding="utf-8")
        )
        releases = [
            item
            for item in registry["items"]
            if item["id"] == "release-isolamento-conteudo-nao-homologado-2026-07-25"
        ]
        self.assertEqual(len(releases), 1)
        self.assertEqual(
            set(releases[0]["paths"]),
            {
                "02_Biblioteca_IA_Engine/index.html",
                "13_RenalDose_Antimicrobianos/index.html",
                "14_SAPS3_Calculator/index.html",
            },
        )
        registered = [
            path
            for item in registry["items"]
            for path in item["paths"]
        ]
        self.assertEqual(len(registered), len(set(registered)))


if __name__ == "__main__":
    unittest.main()
