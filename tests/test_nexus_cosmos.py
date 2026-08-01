#!/usr/bin/env python3
"""Contratos da estação NEXUS Cosmos e do barramento de sincronização."""

from __future__ import annotations

import base64
import copy
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
        cls.topology = load("23_Cosmos_NEXUS/data/tag-topology.json")
        cls.block_schema = load("23_Cosmos_NEXUS/blocks/_schemas/block-item.schema.json")
        cls.block_template = load("23_Cosmos_NEXUS/blocks/_templates/item.template.json")
        cls.audit_contract = load("23_Cosmos_NEXUS/data/editorial-audit-contract.json")
        cls.domain_routing = load("23_Cosmos_NEXUS/data/project-domain-routing.json")
        cls.project_sync = load("23_Cosmos_NEXUS/data/project-sync-contract.json")
        cls.home_manifest = load("06_Infra_Site_E_Assets/data/home-manifest.json")
        cls.site_manifest = load("data/site_manifest.json")
        cls.connections = load("data/connections.json")
        cls.topics = load("data/topics.json")
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
        node_ids = [node["id"] for node in self.connections["nodes"]]
        nodes = set(node_ids)
        self.assertEqual(len(node_ids), len(nodes))
        self.assertGreaterEqual(len(nodes), 119)
        self.assertGreaterEqual(len(self.connections["edges"]), 229)
        required_core = {
            "nexus-cosmos",
            "nexus-u1-humano-clinico",
            "nexus-u2-medico-arsenal",
            "nexus-u3-didatico-cognitivo",
            "nexus-tag-deposito",
        }
        required_blocks = {
            "nexus-bloco-evolucao",
            "nexus-bloco-plano-terapeutico",
            "nexus-bloco-motor-visual",
            "nexus-bloco-organizador-estudos",
            "nexus-bloco-turbo-temi",
            "nexus-bloco-refinaria-temi",
            "nexus-bloco-tutor",
            "nexus-bloco-estudo-microparticulado",
            "nexus-bloco-imagens-turbo-temi",
            "nexus-bloco-produtos-turbo-temi",
            "nexus-bloco-referencias-evidencias",
            "nexus-bloco-auditoria-publicacao",
        }
        self.assertTrue(required_core | required_blocks <= nodes)

        topic_ids = {topic["id"] for topic in self.topics}
        self.assertTrue(required_blocks <= topic_ids)
        suggested_edges = {
            (edge["from"], edge["to"])
            for edge in self.connections["edges"]
            if edge.get("strength") == "suggested" and edge.get("status") == "sugerido"
        }
        for block_id in required_blocks:
            self.assertIn(("nexus-cosmos", block_id), suggested_edges)
            self.assertTrue(
                any(source == block_id for source, _ in suggested_edges),
                f"{block_id} precisa propor uma saída canônica",
            )
        for edge in self.connections["edges"]:
            self.assertIn(edge["from"], nodes)
            self.assertIn(edge["to"], nodes)

    def test_web_project_faces_share_one_canonical_lot_and_fail_closed(self) -> None:
        policies = {
            item["alias"]: item
            for item in self.project_sync["sourceProjectPolicies"]
        }
        aliases = {"@TEMI360XINFINIT", "@BIBLIOTECAVISUAL"}
        self.assertTrue(aliases <= set(policies))

        lot = next(
            item for item in self.project_sync["canonicalLots"]
            if item["id"] == "temi360xinfinit-biblioteca-visual"
        )
        self.assertEqual(set(lot["aliases"]), aliases)
        self.assertEqual(
            lot["roles"],
            {
                "@TEMI360XINFINIT": "DERIVA",
                "@BIBLIOTECAVISUAL": "REPRESENTA",
            },
        )
        self.assertEqual(lot["domain"], "clinical-educational")
        self.assertEqual(lot["defaultPrivacy"], "P1")
        self.assertEqual(lot["candidatePrivacy"], "P0")
        self.assertTrue(lot["identityPolicy"]["singleProductCode"])
        self.assertTrue(lot["identityPolicy"]["singleImageCodePerSha256"])
        self.assertFalse(lot["identityPolicy"]["duplicateCodesAcrossFaces"])
        self.assertEqual(
            set(lot["publicationGate"]["requiredAuditPillars"]),
            {"patient-exposure", "copyright-rights", "scientific-grounding"},
        )
        self.assertEqual(
            lot["publicationGate"]["unlockCommand"],
            "PUBLICAR {TAF###-EXATO}",
        )
        self.assertFalse(lot["publicationGate"]["standingAuthorization"])

        for alias in aliases:
            policy = policies[alias]
            self.assertEqual(policy["domain"], "clinical-educational")
            self.assertEqual(policy["defaultPrivacy"], "P1")
            self.assertEqual(policy["canonicalLot"], lot["id"])
            self.assertEqual(policy["candidateGate"]["targetPrivacy"], "P0")
            self.assertEqual(
                policy["candidateGate"]["finalOwnerAuthorization"],
                "PUBLICAR {TAF###-EXATO}",
            )
            self.assertFalse(policy["candidateGate"]["standingAuthorization"])
            self.assertNotIn("generatedImageException", policy)

    def test_web_project_faces_are_fused_in_local_and_global_graphs(self) -> None:
        local_nodes = {node["id"]: node for node in self.cosmos["nodes"]}
        local_edges = {
            (edge["from"], edge["relation"], edge["to"])
            for edge in self.cosmos["edges"]
        }
        expected_local = {
            "source-temi360xinfinit",
            "source-biblioteca-visual",
            "lot-temi360xinfinit-biblioteca-visual",
        }
        self.assertTrue(expected_local <= set(local_nodes))
        for node_id in expected_local:
            self.assertEqual(local_nodes[node_id]["status"], "em_revisao")
        self.assertIn(
            (
                "source-temi360xinfinit",
                "DERIVA",
                "lot-temi360xinfinit-biblioteca-visual",
            ),
            local_edges,
        )
        self.assertIn(
            (
                "source-biblioteca-visual",
                "REPRESENTA",
                "lot-temi360xinfinit-biblioteca-visual",
            ),
            local_edges,
        )
        self.assertIn(
            (
                "lot-temi360xinfinit-biblioteca-visual",
                "TOPOGRAFA",
                "tag-deposito",
            ),
            local_edges,
        )

        global_nodes = {node["id"]: node for node in self.connections["nodes"]}
        global_topics = {topic["id"]: topic for topic in self.topics}
        global_edges = {
            (edge["from"], edge["relation"], edge["to"])
            for edge in self.connections["edges"]
        }
        expected_global = {
            "nexus-projeto-temi360xinfinit",
            "nexus-projeto-biblioteca-visual",
            "nexus-lote-temi360xinfinit-biblioteca-visual",
        }
        self.assertTrue(expected_global <= set(global_nodes))
        self.assertTrue(expected_global <= set(global_topics))
        for node_id in expected_global:
            self.assertEqual(global_nodes[node_id]["status"], "em_revisao")
            self.assertEqual(global_topics[node_id]["status"], "em_revisao")
        self.assertIn(
            (
                "nexus-projeto-temi360xinfinit",
                "DERIVA",
                "nexus-lote-temi360xinfinit-biblioteca-visual",
            ),
            global_edges,
        )
        self.assertIn(
            (
                "nexus-projeto-biblioteca-visual",
                "REPRESENTA",
                "nexus-lote-temi360xinfinit-biblioteca-visual",
            ),
            global_edges,
        )
        self.assertIn(
            (
                "nexus-lote-temi360xinfinit-biblioteca-visual",
                "TOPOGRAFA",
                "nexus-tag-deposito",
            ),
            global_edges,
        )

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

    def test_all_thirteen_coupling_directories_are_registered(self) -> None:
        expected_blocks = {
            "evolucao",
            "plano-terapeutico",
            "motor-visual",
            "organizador-estudos",
            "turbo-temi",
            "refinaria-temi",
            "tutor",
            "estudo-microparticulado",
            "imagens-turbo-temi",
            "produtos-turbo-temi",
            "referencias-evidencias",
            "auditoria-publicacao",
            "extensoes",
        }
        block_ids = [block["id"] for block in self.blocks["blocks"]]
        self.assertEqual(len(block_ids), 13)
        self.assertEqual(set(block_ids), expected_blocks)
        self.assertEqual(len(block_ids), len(set(block_ids)))
        for block in self.blocks["blocks"]:
            payload = load(f"23_Cosmos_NEXUS/{block['ingestionPath']}")
            self.assertEqual(payload["blockId"], block["id"])
            self.assertIsInstance(payload["items"], list)
        self.assertTrue((MODULE / "blocks/_schemas/block-item.schema.json").is_file())
        self.assertTrue((MODULE / "blocks/_templates/item.template.json").is_file())

    def test_block_schema_and_template_are_structurally_valid(self) -> None:
        schema = self.block_schema
        template = self.block_template
        required = set(schema["required"])
        properties = set(schema["properties"])

        self.assertEqual(schema["$schema"], "https://json-schema.org/draft/2020-12/schema")
        self.assertFalse(schema["additionalProperties"])
        self.assertTrue(required <= properties)
        self.assertEqual(set(template), required)
        self.assertRegex(
            template["productCode"],
            re.compile(schema["properties"]["productCode"]["pattern"]),
        )
        self.assertIn(
            template["render"]["status"],
            schema["properties"]["render"]["properties"]["status"]["enum"],
        )
        self.bus._validate_block_item(
            template,
            "evolucao",
            schema,
            set(self.topology["relations"]),
        )

        invalid = copy.deepcopy(template)
        invalid["render"]["status"] = "em_revisao"
        with self.assertRaises(self.bus.ContractError):
            self.bus._validate_block_item(
                invalid,
                "evolucao",
                schema,
                set(self.topology["relations"]),
            )

    def test_new_block_nodes_and_relation_vocabulary_are_fused(self) -> None:
        expected_block_nodes = {
            "block-evolucao",
            "block-plano",
            "block-visual",
            "block-estudos",
            "block-turbo",
            "block-refinaria",
            "block-tutor",
            "block-micro",
            "block-imgt",
            "block-prod",
            "block-refs",
            "block-audit",
        }
        node_ids = {node["id"] for node in self.cosmos["nodes"]}
        graph_edges = {
            (edge["from"], edge["relation"], edge["to"])
            for edge in self.cosmos["edges"]
        }
        graph_relations = {relation for _, relation, _ in graph_edges}
        relation_vocabulary = set(self.topology["relations"])

        self.assertTrue(expected_block_nodes <= node_ids)
        self.assertTrue(graph_relations <= relation_vocabulary)
        self.assertTrue(
            {"MICROPARTICULA", "EMPACOTA", "REFERENCIA", "AUDITA"}
            <= graph_relations
        )
        for block_node in expected_block_nodes:
            self.assertIn(("nexus", "ORQUESTRA", block_node), graph_edges)
            self.assertIn((block_node, "TOPOGRAFA", "tag-deposito"), graph_edges)

    def test_three_editorial_pillars_fail_closed_for_public_candidates(self) -> None:
        self.assertTrue(self.audit_contract["failClosed"])
        self.assertEqual(
            [pillar["id"] for pillar in self.audit_contract["pillars"]],
            ["patient-exposure", "copyright-rights", "scientific-grounding"],
        )
        relations = set(self.topology["relations"])

        candidate = copy.deepcopy(self.block_template)
        candidate["privacy"]["publicEligible"] = True
        with self.assertRaisesRegex(self.bus.ContractError, "gate de paciente"):
            self.bus._validate_block_item(
                candidate, "evolucao", self.block_schema, relations
            )

        candidate["audit"]["patientExposure"] = "passed"
        with self.assertRaisesRegex(self.bus.ContractError, "rightsReview"):
            self.bus._validate_block_item(
                candidate, "evolucao", self.block_schema, relations
            )

        candidate["audit"].update(
            {
                "rightsReview": "passed",
                "technicalReview": "passed",
                "linkCheck": "passed",
            }
        )
        self.bus._validate_block_item(
            candidate, "evolucao", self.block_schema, relations
        )

        clinical = copy.deepcopy(candidate)
        clinical["contentClass"] = "clinical"
        clinical["audit"]["scientificGrounding"] = "pending"
        with self.assertRaisesRegex(self.bus.ContractError, "referência forte"):
            self.bus._validate_block_item(
                clinical, "evolucao", self.block_schema, relations
            )

        clinical["references"] = [
            {
                "id": "ref:synthetic-primary",
                "title": "Fonte primária sintética para teste",
                "url": "https://example.test/primary",
                "role": "primary",
                "verifiedAt": "2026-08-01",
            }
        ]
        with self.assertRaisesRegex(self.bus.ContractError, "gate científico"):
            self.bus._validate_block_item(
                clinical, "evolucao", self.block_schema, relations
            )
        clinical["audit"]["scientificGrounding"] = "passed"
        self.bus._validate_block_item(
            clinical, "evolucao", self.block_schema, relations
        )

    def test_five_private_domains_never_reach_public_surfaces(self) -> None:
        expected_private = {
            "personal",
            "legal",
            "financial",
            "administrative",
            "technology-ecosystem",
        }
        domains = {item["id"]: item for item in self.domain_routing["domains"]}
        self.assertEqual(set(domains) - {"clinical-educational"}, expected_private)
        public_corpus = json.dumps(
            {"connections": self.connections, "topics": self.topics},
            ensure_ascii=False,
        )

        with tempfile.TemporaryDirectory() as temporary:
            folder = Path(temporary)
            source = folder / "produto-privado.pdf"
            source.write_bytes(b"%PDF-1.7\nconteudo sintetico\n%%EOF\n")
            queue = folder / "queue"
            for domain_id in sorted(expected_private):
                config = domains[domain_id]
                self.assertFalse(config["githubEligible"])
                self.assertFalse(config["officialSiteEligible"])
                self.assertNotIn("github", config["allowedSurfaces"])
                self.assertNotIn("official-site", config["allowedSurfaces"])
                self.assertNotIn(config["privateUniverse"], public_corpus)

                entry = self.bus.enqueue_intake(
                    SimpleNamespace(
                        source=str(source),
                        kind="auto",
                        universe="MUX",
                        block="organizador-estudos",
                        domain=domain_id,
                        privacy="P0",
                        title=f"Produto privado {domain_id}",
                        objective="sincronizar somente superfícies privadas",
                        date="2026-08-01",
                        sequence=None,
                    ),
                    queue,
                )
                self.assertEqual(entry["surfaces"]["drive"]["status"], "PENDING_ON_DEMAND")
                self.assertEqual(entry["surfaces"]["notion"]["status"], "PENDING_ON_DEMAND")
                for surface in ("githubDraft", "library", "officialSite"):
                    self.assertEqual(
                        entry["surfaces"][surface]["status"],
                        "BLOCKED_PRIVATE_DOMAIN",
                    )
                self.assertEqual(entry["publication"]["status"], "LOCKED")

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
        self.assertEqual(
            prefixes,
            {"PRC###", "AUD###", "HOM###", "TOM###", "TAF###", "PUB###"},
        )
        audit_code = self.bus.issue_code(
            SimpleNamespace(
                kind="audit",
                date="2026-08-01",
                sequence=1,
                subject="####AGX-MUX-AUDIT-20260801-0001-A1B2C3D4",
                artifact_sha256="a" * 64,
                scope="NEXUS-COSMOS",
            )
        )
        self.assertRegex(audit_code, re.compile(self.codes["codes"]["audit"]["regex"]))

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

    def test_public_study_microparticle_is_closed_and_has_no_follow_up_loop(self) -> None:
        block = next(
            item for item in self.blocks["blocks"]
            if item["id"] == "estudo-microparticulado"
        )
        cosmos_node = next(
            item for item in self.cosmos["nodes"] if item["id"] == "block-micro"
        )
        topic = next(
            item for item in self.topics
            if item["id"] == "nexus-bloco-estudo-microparticulado"
        )
        command = load("23_Cosmos_NEXUS/data/command-contract.json")
        example = next(
            item for item in command["examples"]
            if "#estudo-microparticulado" in item
        )
        public_contract = json.dumps(
            {"block": block, "cosmos": cosmos_node, "topic": topic, "example": example},
            ensure_ascii=False,
        )
        for required in ("100%", "corrigid", "referenci"):
            self.assertIn(required, public_contract.casefold())
        self.assertIsNone(re.search(r"\bD(?:0|1|7|30)\b", public_contract))
        for forbidden in ("plano-retomada", "monitor de seguimento", "alça de recuperação"):
            self.assertNotIn(forbidden, public_contract.casefold())

        by_kind = {item["kind"]: item for item in self.routing["routes"]}
        self.assertIn("P1 privado", by_kind["estudo-microparticulado-interno"]["gate"])
        self.assertIn("100% respondida", by_kind["microparticula-fechada-publica"]["gate"])

    def test_public_study_microparticle_validator_rejects_incomplete_items(self) -> None:
        item = copy.deepcopy(self.block_template)
        item.update(
            productCode="####AGX-MUX-MICRO-20260801-0001-A1B2C3D4",
            blockId="estudo-microparticulado",
            privacy={"classification": "P0", "synthetic": True, "patientData": False, "publicEligible": True},
            provenance={"sourceIds": ["@ORGANIZACAODEESTUDO"], "reviewStatus": "reviewed", "reviewer": "Codex", "reviewedAt": "2026-08-01T03:00:00-03:00"},
            render={"status": "candidate-public", "artifacts": []},
            references=[{"id": "ref-official", "title": "Fonte oficial", "url": "https://example.org/reference", "role": "official", "verifiedAt": "2026-08-01"}],
            audit={"auditCode": "AUD###-MICRO-20260801-0001-A1B2C3D4", "patientExposure": "passed", "rightsReview": "passed", "scientificGrounding": "passed", "technicalReview": "passed", "linkCheck": "passed"},
        )
        relations = set(self.topology["relations"])
        with self.assertRaisesRegex(self.bus.ContractError, "contrato de fechamento"):
            self.bus._validate_block_item(
                item, "estudo-microparticulado", self.block_schema, relations
            )

        item["closedMicroparticle"] = {
            "ownerCompletionStatus": "MODULE_COMPLETED_BY_OWNER",
            "cleanPublicModel": True,
            "extractionStatus": "extracted-clean-model",
            "allPromptsAnswered": True,
            "answersCorrected": True,
            "answersJustified": True,
            "selfContained": True,
            "personalStateRemoved": True,
            "followUpMonitor": False,
            "recoveryLoop": False,
        }
        self.bus._validate_block_item(
            item, "estudo-microparticulado", self.block_schema, relations
        )
        item["closedMicroparticle"]["answersCorrected"] = False
        with self.assertRaisesRegex(self.bus.ContractError, "incompleta"):
            self.bus._validate_block_item(
                item, "estudo-microparticulado", self.block_schema, relations
            )

    def test_every_public_product_image_has_unique_catalog_code(self) -> None:
        item = load("23_Cosmos_NEXUS/blocks/10_produtos_turbo_temi/items.json")["items"][0]
        manifest = load("23_Cosmos_NEXUS/products/maquina-turbo-temi-360x/product.manifest.json")
        catalog = item["assetCodes"]
        self.assertEqual(len(catalog), 8)
        self.assertEqual(len({asset["code"] for asset in catalog}), 8)
        self.assertEqual(
            {asset["code"] for asset in catalog},
            {asset["catalogCode"] for asset in manifest["assets"]},
        )
        for asset in catalog:
            self.assertRegex(asset["code"], r"^####IMG-\d{8}-\d{4}-[A-F0-9]{8}$")
            self.assertTrue(asset["code"].endswith(asset["sha256"][:8].upper()))
            self.assertIn(asset["code"], read("23_Cosmos_NEXUS/products/maquina-turbo-temi-360x/index.html"))

    def test_visual_library_product_is_physical_coded_and_fail_closed(self) -> None:
        product_root = MODULE / "products/biblioteca-visual-cosmica"
        manifest = load(
            "23_Cosmos_NEXUS/products/biblioteca-visual-cosmica/product.manifest.json"
        )
        block_item = load(
            "23_Cosmos_NEXUS/blocks/09_imagens_turbo_temi/items.json"
        )["items"][0]
        page = read("23_Cosmos_NEXUS/products/biblioteca-visual-cosmica/index.html")
        worker = read("sw.js")

        self.assertEqual(manifest["identity"]["id"], "biblioteca-visual-cosmica")
        self.assertEqual(manifest["bundle"]["assetCount"], 2)
        self.assertEqual(len(manifest["assets"]), 2)
        self.assertFalse(manifest["publication"]["officialPublication"])
        self.assertIsNone(manifest["publication"]["finalAcceptanceCode"])
        self.assertEqual(
            manifest["publication"]["authorizationMode"],
            "LITERAL_OWNER_COMMAND",
        )
        self.assertEqual(
            set(manifest["provenance"]["sourceProjects"]),
            {"@BIBLIOTECAVISUAL", "@TEMI360XINFINIT"},
        )
        self.assertEqual(
            set(block_item["provenance"]["sourceIds"]),
            {"@BIBLIOTECAVISUAL", "@TEMI360XINFINIT"},
        )

        codes: set[str] = set()
        hashes: set[str] = set()
        total_bytes = 0
        for asset in manifest["assets"]:
            path = product_root / asset["path"]
            raw = path.read_bytes()
            digest = hashlib.sha256(raw).hexdigest()
            width = int.from_bytes(raw[16:20], "big")
            height = int.from_bytes(raw[20:24], "big")

            self.assertEqual(raw[:8], b"\x89PNG\r\n\x1a\n")
            self.assertEqual(digest, asset["sha256"])
            self.assertEqual(path.stat().st_size, asset["bytes"])
            self.assertEqual((width, height), (asset["width"], asset["height"]))
            self.assertRegex(
                asset["catalogCode"],
                r"^####IMG-\d{8}-\d{4}-[A-F0-9]{8}$",
            )
            self.assertTrue(asset["catalogCode"].endswith(digest[:8].upper()))
            self.assertIn(asset["catalogCode"], page)
            self.assertIn(b"OpenAI Media Service API", raw)
            self.assertIn(b"gpt-image", raw)
            self.assertIn(b"versionc2.0", raw)
            self.assertIn(b"trainedAlgorithmicMedia", raw)
            self.assertNotIn(asset["catalogCode"], codes)
            self.assertNotIn(digest, hashes)
            codes.add(asset["catalogCode"])
            hashes.add(digest)
            total_bytes += len(raw)
            self.assertIn(
                f'"./23_Cosmos_NEXUS/products/biblioteca-visual-cosmica/{asset["path"]}"',
                worker,
            )

        self.assertEqual(total_bytes, manifest["bundle"]["totalBytes"])
        self.assertEqual(
            codes,
            {item["code"] for item in block_item["assetCodes"]},
        )
        self.assertEqual(
            self.bus.SOURCE_PROJECTS,
            {
                "@TURBOTEMI",
                "#EVOLUCOES",
                "#PLANOTERAPEUTICO",
                "@ORGANIZACAODEESTUDO",
                "@BIBLIOTECAVISUAL",
                "@TEMI360XINFINIT",
            },
        )
        for forbidden in (
            "g-p-",
            "gpt-asset:",
            "https://chatgpt.com",
            "access_token",
        ):
            self.assertNotIn(forbidden, page + json.dumps(manifest))

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
        self.assertIn('const CACHE_NAME = `${CACHE_PREFIX}v21`', worker)
        self.assertIn('"./23_Cosmos_NEXUS/index.html"', worker)
        for block in self.blocks["blocks"]:
            self.assertIn(f'"./23_Cosmos_NEXUS/{block["ingestionPath"]}"', worker)

    def test_bus_validator_and_route_resolution_are_fail_closed(self) -> None:
        report = self.bus.validate()
        self.assertEqual(report["status"], "OK")
        self.assertEqual(report["publication"], "LOCKED")
        self.assertEqual(report["blocks"], 13)
        self.assertEqual(report["auditPillars"], 3)
        self.assertEqual(report["privateDomains"], 5)
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
        self.assertIn("AUD###", self.codes["codes"]["finalProduct"]["issuedWhen"])

    def test_standing_publication_authorization_is_image_only(self) -> None:
        args = SimpleNamespace(
            kind="publication",
            date="2026-08-01",
            sequence=1,
            artifact_sha256="a" * 64,
            subject="####IMG-20260801-0001-AAAAAAAA",
            final_product_code="TAF###-MUX-IMGT-20260801-0001-A1B2C3D4",
            owner_command=None,
            authorization_mode="standing-organization-study-image",
            source_project="@ORGANIZACAODEESTUDO",
        )
        self.assertRegex(self.bus.issue_code(args), r"^PUB###-")
        args.final_product_code = "TAF###-MUX-PROD-20260801-0001-A1B2C3D4"
        with self.assertRaisesRegex(self.bus.ContractError, "imagem IMGT"):
            self.bus.issue_code(args)

    def test_station_catalogs_candidates_without_premature_taf(self) -> None:
        products = {
            item["semanticKey"]: item for item in self.product_catalog["items"]
        }
        graph_nodes = {
            node["id"] for node in self.cosmos["nodes"] + self.connections["nodes"]
        }
        self.assertEqual(
            set(products),
            {
                "nexus-cosmos-fusao-dos-universos",
                "maquina-turbo-temi-360x",
                "biblioteca-visual-cosmica",
            },
        )
        for product in products.values():
            self.assertRegex(product["productCode"], r"^####AGX-")
            self.assertIn(product["graphNode"], graph_nodes)
            self.assertIsNone(product["homologationCode"])
            self.assertIsNone(product["tombstoneCode"])
            self.assertIsNone(product["tafCode"])
            self.assertFalse(product["published"])
            source = ROOT / product["source"]["path"]
            self.assertEqual(
                hashlib.sha256(source.read_bytes()).hexdigest(),
                product["source"]["sha256"],
            )

        self.assertIn(
            products["nexus-cosmos-fusao-dos-universos"]["productCode"],
            read("23_Cosmos_NEXUS/index.html"),
        )
        for semantic_key in (
            "maquina-turbo-temi-360x",
            "biblioteca-visual-cosmica",
        ):
            route = f"products/{semantic_key}/index.html"
            self.assertIn(f'href="{route}"', read("23_Cosmos_NEXUS/index.html"))
            self.assertIn(
                products[semantic_key]["productCode"],
                read(f"23_Cosmos_NEXUS/{route}"),
            )

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

    def test_organization_study_waits_for_completion_but_images_use_parallel_lane(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            folder = Path(temporary)
            module = folder / "modulo.pdf"
            module.write_bytes(b"%PDF-1.7\nmodulo sintetico\n%%EOF\n")
            args = SimpleNamespace(
                source=str(module), kind="auto", universe="U3",
                block="estudo-microparticulado", domain="clinical-educational",
                privacy="P0", title="Módulo concluído", objective="extrair modelo fechado",
                date="2026-08-01", sequence=None,
                source_project="@ORGANIZACAODEESTUDO",
                owner_completed_module=False,
            )
            with self.assertRaisesRegex(self.bus.ContractError, "conclusão integral"):
                self.bus.enqueue_intake(args, folder / "queue-incomplete")

            args.owner_completed_module = True
            completed = self.bus.enqueue_intake(args, folder / "queue-completed")
            self.assertEqual(
                completed["moduleCompletion"]["status"],
                "MODULE_COMPLETED_BY_OWNER",
            )
            self.assertEqual(completed["surfaces"]["githubDraft"]["status"], "BLOCKED_GATES")

            image = folder / "imagem.png"
            image.write_bytes(
                base64.b64decode(
                    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwC"
                    "AAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
                )
            )
            args.source = str(image)
            args.block = "imagens-turbo-temi"
            args.title = "Imagem paralela"
            args.objective = "catalogar imagem independente"
            args.owner_completed_module = False
            image_entry = self.bus.enqueue_intake(args, folder / "queue-image")
            self.assertEqual(
                image_entry["moduleCompletion"]["status"],
                "INDEPENDENT_IMAGE_LANE",
            )
            self.assertTrue(image_entry["moduleCompletion"]["publicExtractionAllowed"])
            self.assertEqual(
                image_entry["surfaces"]["officialSite"]["status"],
                "BLOCKED_GATES_STANDING_AUTH",
            )
            self.assertEqual(
                image_entry["publication"]["authorizationMode"],
                "STANDING_OWNER_AUTHORIZATION_2026-08-01",
            )

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
