#!/usr/bin/env python3
"""Contratos da estação NEXUS Cosmos e do barramento de sincronização."""

from __future__ import annotations

import base64
import hashlib
import importlib.util
import json
import re
import tempfile
import unittest
import zipfile
from types import SimpleNamespace
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MODULE = ROOT / "23_Cosmos_NEXUS"


def load(relative: str) -> dict:
    return json.loads((ROOT / relative).read_text(encoding="utf-8"))


def read(relative: str) -> str:
    return (ROOT / relative).read_text(encoding="utf-8")


def load_bus():
    spec = importlib.util.spec_from_file_location(
        "nexus_cosmos_bus_test", ROOT / "scripts_admin/nexus_cosmos.py"
    )
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


class NexusCosmosTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.manifest = load("23_Cosmos_NEXUS/module.manifest.json")
        cls.cosmos = load("23_Cosmos_NEXUS/data/cosmos.json")
        cls.atlas = load("23_Cosmos_NEXUS/data/atlas.json")
        cls.blocks = load("23_Cosmos_NEXUS/data/block-registry.json")
        cls.lifecycle = load("23_Cosmos_NEXUS/data/product-lifecycle.json")
        cls.sync = load("23_Cosmos_NEXUS/data/sync-contract.json")
        cls.routing = load("23_Cosmos_NEXUS/data/content-routing.json")
        cls.product_catalog = load("23_Cosmos_NEXUS/data/product-catalog.json")
        cls.codes = load("23_Cosmos_NEXUS/data/governance-code-contract.json")
        cls.organism = load("23_Cosmos_NEXUS/data/living-organism-contract.json")
        cls.home_manifest = load("06_Infra_Site_E_Assets/data/home-manifest.json")
        cls.site_manifest = load("data/site_manifest.json")
        cls.connections = load("data/connections.json")
        cls.bus = load_bus()

    def test_route_is_integrated_but_publication_is_locked(self) -> None:
        self.assertEqual(
            self.site_manifest["canonicalRoutes"]["nexus_cosmos"],
            "23_Cosmos_NEXUS/index.html",
        )
        self.assertFalse(self.manifest["publication"]["published"])
        self.assertFalse(self.manifest["publication"]["publicPreview"])
        self.assertEqual(
            self.manifest["publication"]["unlockCommand"],
            "PUBLICAR {TAF###-EXATO}",
        )
        self.assertTrue(self.sync["publicationLock"]["lockedByDefault"])

    def test_three_universes_and_seven_constellations_are_preserved(self) -> None:
        self.assertEqual(len(self.cosmos["universes"]), 3)
        self.assertEqual(len(self.cosmos["constellations"]), 7)
        self.assertEqual(
            {item["code"] for item in self.cosmos["universes"]},
            {"U1", "U2", "U3"},
        )

    def test_local_graph_has_unique_nodes_and_valid_edges(self) -> None:
        node_ids = [node["id"] for node in self.cosmos["nodes"]]
        self.assertEqual(len(node_ids), len(set(node_ids)))
        endpoints = set(node_ids)
        for edge in self.cosmos["edges"]:
            self.assertIn(edge["from"], endpoints)
            self.assertIn(edge["to"], endpoints)

    def test_global_map_has_expected_fused_snapshot(self) -> None:
        nodes = {node["id"] for node in self.connections["nodes"]}
        self.assertEqual(len(nodes), 104)
        self.assertEqual(len(self.connections["edges"]), 197)
        for required in (
            "nexus-cosmos",
            "nexus-u1-humano-clinico",
            "nexus-u2-medico-arsenal",
            "nexus-u3-didatico-cognitivo",
            "nexus-tag-deposito",
        ):
            self.assertIn(required, nodes)
        for edge in self.connections["edges"]:
            self.assertIn(edge["from"], nodes)
            self.assertIn(edge["to"], nodes)

    def test_twenty_sanitized_images_have_unique_physical_codes(self) -> None:
        self.assertEqual(len(self.atlas["items"]), 20)
        codes: set[str] = set()
        hashes: set[str] = set()
        for item in self.atlas["items"]:
            path = MODULE / item["image"]
            raw = path.read_bytes()
            digest = hashlib.sha256(raw).hexdigest()
            self.assertEqual(digest, item["asset"]["sha256"])
            self.assertEqual(path.stat().st_size, item["asset"]["bytes"])
            self.assertTrue(item["catalogCode"].endswith(digest[:8].upper()))
            self.assertNotIn(item["catalogCode"], codes)
            self.assertNotIn(digest, hashes)
            codes.add(item["catalogCode"])
            hashes.add(digest)
            for marker in (b"Exif\x00\x00", b"Photoshop 3.0", b"http://ns.adobe.com/xap/1.0/"):
                self.assertNotIn(marker, raw)

    def test_source_and_served_asset_integrity_are_not_conflated(self) -> None:
        for item in self.atlas["items"]:
            self.assertNotEqual(item["source"]["sha256"], item["asset"]["sha256"])
            self.assertRegex(item["source"]["sha256"], r"^[a-f0-9]{64}$")
            self.assertRegex(item["asset"]["sha256"], r"^[a-f0-9]{64}$")

    def test_all_coupling_directories_are_ready_and_empty(self) -> None:
        self.assertEqual(len(self.blocks["blocks"]), 8)
        for block in self.blocks["blocks"]:
            payload = load(f"23_Cosmos_NEXUS/{block['ingestionPath']}")
            self.assertEqual(payload["items"], [])
        self.assertTrue((MODULE / "blocks/_schemas/block-item.schema.json").is_file())
        self.assertTrue((MODULE / "blocks/_templates/item.template.json").is_file())

    def test_product_lifecycle_closes_with_hom_tom_taf_and_human_unlock(self) -> None:
        stages = self.lifecycle["stages"]
        self.assertEqual([item["order"] for item in stages], list(range(1, 18)))
        self.assertEqual(
            [item["id"] for item in stages[-4:]],
            ["homologation", "tombstone", "owner-unlock", "publish"],
        )
        self.assertIn("TAF###", stages[-3]["output"])
        self.assertIn("PUBLICAR", stages[-2]["output"])

    def test_each_governance_event_has_a_distinct_prefix(self) -> None:
        prefixes = {entry["prefix"] for entry in self.codes["codes"].values()}
        self.assertEqual(prefixes, {"PRC###", "HOM###", "TOM###", "TAF###", "PUB###"})

    def test_patient_identity_is_private_and_non_derivable(self) -> None:
        contract = load("23_Cosmos_NEXUS/data/entity-code-contract.json")
        patient = next(item for item in contract["entities"] if item["entity"] == "patient")
        self.assertEqual(patient["pattern"], "####PAT-{RANDOM16}")
        self.assertIn("NUNCA", patient["catalog"])
        corpus = json.dumps(contract, ensure_ascii=False)
        for forbidden in ("prontuário no código", "data de nascimento no código", "nome do paciente no código"):
            self.assertNotIn(forbidden, corpus.casefold())

    def test_sync_is_automatic_only_for_drafts(self) -> None:
        surfaces = {item["id"]: item for item in self.sync["surfaces"]}
        for surface in ("gpt-codex", "google-drive", "notion", "github"):
            self.assertTrue(surfaces[surface]["automatic"])
        self.assertFalse(surfaces["official-site"]["automatic"])
        self.assertIn("sem main", surfaces["github"]["writeBoundary"])
        self.assertEqual(surfaces["official-site"]["unlock"], "PUBLICAR {TAF###-EXATO}")

    def test_document_and_image_routes_land_in_the_correct_sections(self) -> None:
        by_kind = {item["kind"]: item for item in self.routing["routes"]}
        self.assertEqual(by_kind["gpt-word"]["canonicalSection"], "02_Biblioteca_IA_Engine")
        self.assertEqual(by_kind["gpt-pdf"]["canonicalSection"], "02_Biblioteca_IA_Engine")
        self.assertEqual(by_kind["atlas-turbo-temi"]["canonicalSection"], "05_Midia_E_Feed")
        self.assertEqual(by_kind["visual-acra"]["canonicalSection"], "22_Microparticulas_Ativas_ACRA")
        self.assertEqual(by_kind["produto-comercial"]["canonicalSection"], "15_Radar_Cientifico")

    def test_living_organism_is_additive_and_measures_cognitive_yield(self) -> None:
        rules = " ".join(self.organism["growthRules"])
        self.assertIn("não sobrescreve silenciosamente", rules)
        self.assertIn("transmutar", rules)
        self.assertGreaterEqual(len(self.organism["cognitiveYield"]["signals"]), 7)

    def test_page_is_same_origin_accessible_and_explicitly_local(self) -> None:
        page = read("23_Cosmos_NEXUS/index.html")
        app = read("23_Cosmos_NEXUS/assets/app.js")
        for marker in (
            "default-src 'self'",
            'class="skip-link"',
            "PRÉVIA LOCAL · NÃO PUBLICADA",
            "CASO 100% SINTÉTICO",
            "REVISÃO MÉDICA HUMANA PENDENTE",
            "prefers-reduced-motion",
            "PUBLICAR TAF###",
        ):
            self.assertIn(marker, page + read("23_Cosmos_NEXUS/assets/styles.css"))
        self.assertNotIn("innerHTML", app)
        self.assertNotIn("eval(", app)

    def test_home_builder_worker_and_manifest_reference_the_route(self) -> None:
        self.assertIn("23_Cosmos_NEXUS/index.html", read("index.html"))
        self.assertTrue(any(item["href"] == "23_Cosmos_NEXUS/" for item in self.home_manifest["mainLinks"]))
        self.assertIn('"23_Cosmos_NEXUS",', read("scripts_admin/build_public_site.py"))
        worker = read("sw.js")
        self.assertIn('const CACHE_NAME = `${CACHE_PREFIX}v19`', worker)
        self.assertIn('"./23_Cosmos_NEXUS/index.html"', worker)

    def test_bus_validator_and_route_resolution_are_fail_closed(self) -> None:
        report = self.bus.validate()
        self.assertEqual(report["status"], "OK")
        self.assertEqual(report["publication"], "LOCKED")
        self.assertEqual(self.bus.route("gpt-pdf")["canonicalSection"], "02_Biblioteca_IA_Engine")
        with self.assertRaises(self.bus.ContractError):
            self.bus.route("tipo-inventado")

    def test_final_publication_code_requires_literal_owner_command(self) -> None:
        self.assertRegex(
            "TAF###-MUX-TEMI-20260731-0001-A1B2C3D4",
            re.compile(self.codes["codes"]["finalProduct"]["regex"]),
        )
        invariant_text = " ".join(self.codes["invariants"])
        self.assertIn("PUBLICAR {TAF###-EXATO}", invariant_text)

    def test_station_has_draft_product_code_but_no_premature_taf(self) -> None:
        self.assertEqual(len(self.product_catalog["items"]), 1)
        product = self.product_catalog["items"][0]
        self.assertEqual(product["productCode"], "####AGX-MUX-EXT-20260731-0001-847D3013")
        self.assertIsNone(product["homologationCode"])
        self.assertIsNone(product["tombstoneCode"])
        self.assertIsNone(product["tafCode"])
        self.assertFalse(product["published"])
        self.assertIn(product["productCode"], read("23_Cosmos_NEXUS/index.html"))

    def test_private_intake_is_idempotent_and_blocks_github_by_default(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            folder = Path(temporary)
            source = folder / "apostila-gpt.pdf"
            source.write_bytes(b"%PDF-1.7\nobjeto sintetico\n%%EOF\n")
            queue = folder / "queue"
            args = SimpleNamespace(
                source=str(source),
                kind="auto",
                universe="MUX",
                block="organizador-estudos",
                privacy="P1",
                title="Apostila GPT sintética",
                objective="catalogar-renderizar-sincronizar-rascunho",
                date="2026-07-31",
                sequence=None,
            )
            first = self.bus.enqueue_intake(args, queue)
            duplicate = self.bus.enqueue_intake(args, queue)

            self.assertEqual(first["queueResult"], "QUEUED_PRIVATE")
            self.assertEqual(duplicate["queueResult"], "SKIP_DUPLICATE")
            self.assertEqual(first["productCode"], duplicate["productCode"])
            self.assertTrue(first["entityCode"].startswith("####PDF-"))
            self.assertTrue(first["productCode"].startswith("####AGX-MUX-STUDY-"))
            self.assertTrue(first["productCode"].endswith(first["productUid"][:8].upper()))
            self.assertTrue(first["procedureCode"].startswith("PRC###-ACOPLAR-"))
            self.assertEqual(first["surfaces"]["githubDraft"]["status"], "BLOCKED_PRIVATE")
            self.assertEqual(first["surfaces"]["library"]["status"], "BLOCKED_PRIVATE")
            self.assertEqual(first["publication"]["status"], "LOCKED")
            self.assertEqual(len(list(queue.glob("*.json"))), 1)
            receipt = next(queue.glob("*.json"))
            blob = folder / first["source"]["blobPath"]
            self.assertEqual(blob.read_bytes(), source.read_bytes())
            self.assertEqual(first["source"]["sha256"], hashlib.sha256(blob.read_bytes()).hexdigest())
            self.assertEqual(receipt.stat().st_mode & 0o777, 0o600)
            self.assertEqual(queue.stat().st_mode & 0o777, 0o700)
            self.assertEqual(blob.stat().st_mode & 0o777, 0o600)
            self.assertNotIn(str(source), receipt.read_text(encoding="utf-8"))

    def test_public_image_intake_is_only_a_draft_candidate(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            folder = Path(temporary)
            source = folder / "imagem-gpt.png"
            source.write_bytes(
                base64.b64decode(
                    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwC"
                    "AAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
                )
            )
            args = SimpleNamespace(
                source=str(source),
                kind="auto",
                universe="U3",
                block="motor-visual",
                privacy="P0",
                title=None,
                objective="imagem-turbo-temi",
                date="2026-07-31",
                sequence=7,
            )
            entry = self.bus.enqueue_intake(args, folder / "queue")

            self.assertTrue(entry["entityCode"].startswith("####IMG-"))
            self.assertTrue(entry["productCode"].startswith("####AGX-U3-VIS-"))
            self.assertEqual(entry["route"]["canonicalSection"], "route-by-function")
            self.assertEqual(entry["surfaces"]["githubDraft"]["status"], "BLOCKED_GATES")
            self.assertEqual(entry["surfaces"]["library"]["status"], "BLOCKED_GATES")
            self.assertEqual(entry["publication"]["tafCode"], None)

    def test_intake_rejects_a_fake_pdf(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            folder = Path(temporary)
            source = folder / "falso.pdf"
            source.write_bytes(b"nao e pdf")
            args = SimpleNamespace(
                source=str(source),
                kind="auto",
                universe="MUX",
                block="organizador-estudos",
                privacy="P1",
                title=None,
                objective="teste",
                date="2026-07-31",
                sequence=None,
            )
            with self.assertRaises(self.bus.ContractError):
                self.bus.enqueue_intake(args, folder / "queue")

    def test_intake_rejects_truncated_png_symlink_unknown_kind_and_bad_date(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            folder = Path(temporary)
            truncated = folder / "truncada.png"
            truncated.write_bytes(b"\x89PNG\r\n\x1a\n")
            args = SimpleNamespace(
                source=str(truncated), kind="auto", universe="MUX",
                block="motor-visual", privacy="P1", title=None,
                objective="teste", date="2026-07-31", sequence=None,
            )
            with self.assertRaises(self.bus.ContractError):
                self.bus.enqueue_intake(args, folder / "queue")

    def test_docx_intake_accepts_minimum_package_and_blocks_external_content(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            folder = Path(temporary)

            def make_docx(path: Path, *, external: bool = False, macro: bool = False) -> None:
                with zipfile.ZipFile(path, "w") as package:
                    package.writestr("[Content_Types].xml", "<Types/>")
                    package.writestr("word/document.xml", "<w:document/>")
                    if external:
                        package.writestr(
                            "word/_rels/document.xml.rels",
                            '<Relationships><Relationship TargetMode="External" Target="https://example.test"/></Relationships>',
                        )
                    if macro:
                        package.writestr("word/vbaProject.bin", b"macro")

            source = folder / "produto.docx"
            make_docx(source)
            args = SimpleNamespace(
                source=str(source), kind="auto", universe="U3",
                block="organizador-estudos", privacy="P1", title="Documento",
                objective="catalogar", date="2026-07-31", sequence=None,
            )
            entry = self.bus.enqueue_intake(args, folder / "queue-ok")
            self.assertTrue(entry["entityCode"].startswith("####DOC-"))

            external = folder / "externo.docx"
            make_docx(external, external=True)
            args.source = str(external)
            with self.assertRaises(self.bus.ContractError):
                self.bus.enqueue_intake(args, folder / "queue-external")

            macro = folder / "macro.docx"
            make_docx(macro, macro=True)
            args.source = str(macro)
            with self.assertRaises(self.bus.ContractError):
                self.bus.enqueue_intake(args, folder / "queue-macro")

            valid_pdf = folder / "valido.pdf"
            valid_pdf.write_bytes(b"%PDF-1.7\nconteudo\n%%EOF\n")
            link = folder / "atalho.pdf"
            link.symlink_to(valid_pdf)
            args.source = str(link)
            with self.assertRaises(self.bus.ContractError):
                self.bus.enqueue_intake(args, folder / "queue")

            args.source = str(valid_pdf)
            args.kind = "produto-comercial"
            with self.assertRaises(self.bus.ContractError):
                self.bus.enqueue_intake(args, folder / "queue")

            args.kind = "auto"
            args.date = "2026-99-99"
            with self.assertRaises(self.bus.ContractError):
                self.bus.enqueue_intake(args, folder / "queue")

    def test_privacy_change_needs_review_and_universe_changes_intent(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            folder = Path(temporary)
            source = folder / "produto.pdf"
            source.write_bytes(b"%PDF-1.7\nconteudo\n%%EOF\n")
            args = SimpleNamespace(
                source=str(source), kind="auto", universe="MUX",
                block="organizador-estudos", privacy="P1", title="Produto",
                objective="catalogar", date="2026-07-31", sequence=None,
            )
            queue = folder / "queue"
            first = self.bus.enqueue_intake(args, queue)
            args.privacy = "P0"
            review = self.bus.enqueue_intake(args, queue)
            self.assertEqual(review["queueResult"], "REVIEW_REQUIRED_PRIVACY_CHANGE")
            self.assertEqual(review["productCode"], first["productCode"])
            self.assertEqual(len(list(queue.glob("*.json"))), 1)

            args.privacy = "P1"
            args.universe = "U3"
            second = self.bus.enqueue_intake(args, queue)
            self.assertEqual(second["queueResult"], "QUEUED_PRIVATE")
            self.assertNotEqual(second["intentUid"], first["intentUid"])
            self.assertEqual(len(list(queue.glob("*.json"))), 2)

    def test_p2_requires_mapped_private_targets_and_sync_plan_is_redacted(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            folder = Path(temporary)
            source = folder / "nome-potencialmente-sensivel.pdf"
            source.write_bytes(b"%PDF-1.7\nconteudo\n%%EOF\n")
            args = SimpleNamespace(
                source=str(source), kind="auto", universe="U1",
                block="evolucao", privacy="P2", title="Título sensível",
                objective="catalogar", date="2026-07-31", sequence=None,
            )
            queue = folder / "queue"
            entry = self.bus.enqueue_intake(args, queue)
            self.assertEqual(entry["surfaces"]["drive"]["status"], "BLOCKED_PRIVATE_TARGET")
            self.assertEqual(entry["surfaces"]["notion"]["status"], "BLOCKED_PRIVATE_TARGET")
            plan = self.bus.sync_plan(queue)
            corpus = json.dumps(plan, ensure_ascii=False)
            self.assertNotIn("Título sensível", corpus)
            self.assertNotIn(str(source), corpus)
            self.assertEqual(plan["publication"], "LOCKED")

    def test_private_queue_is_ignored_by_git(self) -> None:
        self.assertIn(".nexus-sync-private/", read(".gitignore"))


if __name__ == "__main__":
    unittest.main()
