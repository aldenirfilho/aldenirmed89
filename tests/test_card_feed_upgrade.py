#!/usr/bin/env python3
"""Regressões do resgate autoral, feed e conexões canônicas."""

from __future__ import annotations

import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FEED = ROOT / "05_Midia_E_Feed"
PUBLIC_ROOT = FEED / "assets/cards/public"


def load_json(relative: str):
    return json.loads((ROOT / relative).read_text(encoding="utf-8"))


class CardFeedRecoveryTests(unittest.TestCase):
    def test_recovered_cards_have_unique_ids_and_existing_public_assets(self) -> None:
        data = load_json("05_Midia_E_Feed/data/cards.json")
        cards = data["cards"]
        with_image = [card for card in cards if card.get("imageUrl")]
        recovered = [card for card in cards if card.get("recoveredAt")]

        self.assertEqual(len({card["id"] for card in cards}), len(cards))
        self.assertEqual(len(recovered), data["recovery"]["recoveredCards"])
        self.assertTrue(all(card.get("imageUrl") for card in recovered))
        for card in recovered:
            parts = Path(card["imageUrl"]).parts
            self.assertGreaterEqual(len(parts), 6)
            self.assertEqual(parts[-2], card["theme"])

        for card in with_image:
            image_url = card["imageUrl"]
            self.assertTrue(image_url.startswith("assets/cards/public/"), image_url)
            self.assertNotIn("/inbox/", image_url.casefold())
            self.assertTrue((FEED / image_url).is_file(), image_url)

    def test_recovery_manifest_records_optimization_and_quarantine(self) -> None:
        manifest = load_json("05_Midia_E_Feed/data/recovery_manifest.json")
        summary = manifest["summary"]
        self.assertEqual(summary["sourceFiles"], 257)
        self.assertEqual(summary["publishedFiles"], 220)
        self.assertEqual(summary["deduplicatedFiles"], 36)
        self.assertEqual(summary["quarantinedSourceFiles"], 1)
        self.assertEqual(summary["missingLegacyReferences"], 0)
        self.assertLess(summary["publicBytes"], summary["originalBytes"] // 5)
        self.assertEqual(
            manifest["inventorySha256"],
            "6684542494db23bd796ff7f0a0dec56735e5c77f8da345207044668304232a03",
        )

    def test_historical_recovery_tool_is_fail_closed(self) -> None:
        source = (ROOT / "scripts_admin/prepare_card_feed_recovery.py").read_text(encoding="utf-8")
        self.assertIn("--acknowledge-historical-batch-2026-07-21", source)
        self.assertIn("EXPECTED_SOURCE_FILES = 257", source)
        self.assertIn("EXPECTED_LEGACY_CARDS = 198", source)
        self.assertIn("EXPECTED_LEGACY_IMAGE_REFS = 195", source)
        self.assertIn("EXPECTED_INVENTORY_SHA256", source)

    def test_known_outdated_clinical_asset_is_quarantined(self) -> None:
        manifest = load_json("05_Midia_E_Feed/data/recovery_manifest.json")
        matches = [
            item for item in manifest["files"]
            if item.get("sourceFilename") == "protocolo_emergencia_hipotermia_bradicardia.svg"
        ]
        self.assertEqual(len(matches), 1)
        self.assertEqual(matches[0]["status"], "quarantined")
        self.assertEqual(matches[0]["publicPath"], "")
        self.assertIn("desatualizadas", matches[0]["quarantineReason"])
        self.assertFalse(any("hipotermia-bradicardia" in path.as_posix() for path in PUBLIC_ROOT.rglob("*")))

    def test_public_index_matches_approved_directory(self) -> None:
        public = load_json("05_Midia_E_Feed/data/public.json")
        files_on_disk = {
            path.relative_to(PUBLIC_ROOT).as_posix()
            for path in PUBLIC_ROOT.rglob("*")
            if path.is_file() and path.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp", ".svg"}
        }
        approved = set(public["files"])
        self.assertTrue(approved.issubset(files_on_disk))
        self.assertEqual(public["totalFiles"], len(approved))
        self.assertEqual(
            public["totalBytes"], sum((PUBLIC_ROOT / item).stat().st_size for item in approved)
        )

        unexpected = []
        for relative in sorted(files_on_disk - approved):
            path = Path(relative)
            canonical_name = re.sub(
                r" [2-9]\d*(\.(?:png|jpe?g|webp|svg))$",
                r"\1",
                path.name,
                flags=re.IGNORECASE,
            )
            canonical = path.with_name(canonical_name).as_posix()
            if canonical == relative or canonical not in approved:
                unexpected.append(relative)
        self.assertEqual(unexpected, [])

    def test_published_svgs_have_no_active_content(self) -> None:
        public = load_json("05_Midia_E_Feed/data/public.json")
        for relative in public["files"]:
            path = PUBLIC_ROOT / relative
            if path.suffix.casefold() != ".svg":
                continue
            source = path.read_text(encoding="utf-8").casefold()
            self.assertNotIn("<script", source)
            self.assertNotIn("onclick=", source)
            self.assertNotIn("javascript:", source)
            self.assertNotIn("<foreignobject", source)


class CardFeedBehaviorTests(unittest.TestCase):
    def test_local_overrides_hidden_cards_and_new_tools_are_wired(self) -> None:
        source = (FEED / "index.html").read_text(encoding="utf-8")
        self.assertIn('const VIEW_MODES = ["grid", "continuous", "compact"]', source)
        self.assertIn("const localById = new Map", source)
        self.assertIn("mergeLocalOverride(repoCard, localOverride)", source)
        self.assertNotIn('{ ...repoCard, ...localOverride, origin: "local" }', source)
        self.assertIn('const hiddenMode = activeTheme === "__hidden__"', source)
        self.assertIn("if (hiddenMode ? !isHidden : isHidden) return false", source)
        self.assertIn('$("btnRandom").onclick = randomCard', source)
        self.assertIn('$("assetFilter").value', source)
        self.assertIn('data-copy="${esc(c.id)}"', source)
        self.assertIn("function publicAssetTheme(file)", source)
        self.assertIn("const reviewCount = list.filter(needsReview).length", source)

        fields_match = re.search(r"const LOCAL_MUTABLE_FIELDS = (\[[\s\S]*?\]);", source)
        self.assertIsNotNone(fields_match)
        mutable_fields = set(json.loads(fields_match.group(1)))
        protected = {
            "id", "imageUrl", "imageData", "assetSha256", "authorship", "assetLicense",
            "recoveredAt", "clinicalReviewStatus", "reviewedAt", "createdAt",
        }
        self.assertTrue(protected.isdisjoint(mutable_fields))

        repo = {
            "id": "card-1", "imageUrl": "assets/cards/public/card.webp",
            "assetSha256": "canonical", "authorship": "author", "favorite": False,
        }
        legacy_override = {
            "id": "card-1", "imageUrl": "assets/cards/inbox/old.png",
            "assetSha256": "old", "authorship": "old", "favorite": True,
        }
        merged = dict(repo)
        for field in mutable_fields:
            if field in legacy_override:
                merged[field] = legacy_override[field]
        self.assertEqual(merged["imageUrl"], repo["imageUrl"])
        self.assertEqual(merged["assetSha256"], repo["assetSha256"])
        self.assertEqual(merged["authorship"], repo["authorship"])
        self.assertTrue(merged["favorite"])

    def test_library_accepts_feed_query_parameters(self) -> None:
        source = (ROOT / "02_Biblioteca_IA_Engine/index.html").read_text(encoding="utf-8")
        self.assertIn("function applyInitialQuery()", source)
        self.assertIn("params.get('q')", source)
        self.assertIn("params.get('theme')", source)
        self.assertIn("applyInitialQuery();", source)


class CanonicalConnectionTests(unittest.TestCase):
    def test_library_graph_connects_every_public_document(self) -> None:
        graph = load_json("02_Biblioteca_IA_Engine/data/biblioteca_brain_connections.json")
        manifest = load_json("02_Biblioteca_IA_Engine/data/biblioteca_documentos_manifest.json")
        taxonomy = load_json("02_Biblioteca_IA_Engine/data/biblioteca_taxonomia_temas.json")
        nodes = graph["nodes"]
        edges = graph["edges"]
        document_nodes = [node for node in nodes if node.get("type") == "document"]
        theme_nodes = [node for node in nodes if node.get("type") == "theme"]

        self.assertEqual(len(document_nodes), len(manifest["files"]))
        self.assertEqual(len(theme_nodes), len(taxonomy["themes"]))
        self.assertEqual(len(nodes), 1 + len(document_nodes) + len(theme_nodes))
        self.assertEqual(len(edges), len(document_nodes) + len(theme_nodes))
        self.assertEqual(len({node["id"] for node in nodes}), len(nodes))
        self.assertEqual(
            len({json.dumps(edge, ensure_ascii=False, sort_keys=True) for edge in edges}),
            len(edges),
        )
        connected_documents = {edge["to"] for edge in edges if edge.get("relation") == "documento"}
        self.assertEqual(connected_documents, {node["id"] for node in document_nodes})
        self.assertFalse(any("05_Biblioteca_IA/" in str(node.get("path")) for node in nodes))

    def test_global_graph_is_deduplicated_and_uses_canonical_hubs(self) -> None:
        graph = load_json("data/connections.json")
        edge_keys = [json.dumps(edge, ensure_ascii=False, sort_keys=True) for edge in graph["edges"]]
        self.assertEqual(len(edge_keys), len(set(edge_keys)))

        nodes = {node["id"]: node for node in graph["nodes"]}
        self.assertEqual(nodes["biblioteca-ia"]["url"], "02_Biblioteca_IA_Engine/index.html")
        self.assertEqual(nodes["card-feed-medico"]["url"], "05_Midia_E_Feed/index.html")
        self.assertEqual(nodes["calculadoras-uti"]["url"], "03_Calculadoras_E_Apps/index.html")

    def test_topics_use_canonical_core_routes(self) -> None:
        topics = load_json("data/topics.json")
        urls = {topic.get("url") for topic in topics}
        self.assertNotIn("05_Biblioteca_IA/index.html", urls)
        self.assertNotIn("06_Card_Feed_Medico/index.html", urls)
        self.assertNotIn("03_Calculadoras_UTI/index.html", urls)


if __name__ == "__main__":
    unittest.main()
