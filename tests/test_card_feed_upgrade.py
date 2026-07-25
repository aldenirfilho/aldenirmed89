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
        self.assertIn(
            'const VIEW_MODES = ["grid", "continuous", "compact", "carousel", "study"]',
            source,
        )
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

    def test_query_contract_is_allowlisted_and_covers_library_feed_theme_aliases(self) -> None:
        source = (FEED / "index.html").read_text(encoding="utf-8")
        library = load_json("02_Biblioteca_IA_Engine/data/biblioteca_taxonomia_temas.json")
        feed = load_json("05_Midia_E_Feed/data/themes.json")

        forward_match = re.search(
            r"const LIBRARY_TO_FEED_THEME = Object\.freeze\((\{[\s\S]*?\})\);",
            source,
        )
        reverse_match = re.search(
            r"const FEED_TO_LIBRARY_THEME = Object\.freeze\((\{[\s\S]*?\})\);",
            source,
        )
        self.assertIsNotNone(forward_match)
        self.assertIsNotNone(reverse_match)
        forward = json.loads(forward_match.group(1))
        reverse = json.loads(reverse_match.group(1))
        library_ids = {theme["id"] for theme in library["themes"]}
        feed_ids = {theme["id"] for theme in feed["themes"]}

        self.assertTrue(library_ids.issubset(forward))
        self.assertTrue(set(forward.values()).issubset(feed_ids))
        self.assertEqual(set(reverse), feed_ids)
        self.assertTrue(set(reverse.values()).issubset(library_ids))

        for parameter in ("q", "theme", "view", "filter", "sort", "card"):
            self.assertIn(f'params.get("{parameter}")', source)
        self.assertIn("VIEW_MODES.includes(requestedView)", source)
        self.assertIn("ASSET_FILTERS.includes(requestedFilter)", source)
        self.assertIn("themes.some(theme => theme.id === mapped)", source)
        self.assertIn("allCards().find(card => card.id === requestedCard)", source)
        self.assertIn('if (!VIEW_MODES.includes(requestedView)) viewMode = "carousel"', source)
        self.assertIn('if (query && !requestedTheme) $("search").value = query', source)
        self.assertIn("applyInitialQuery();", source)

    def test_new_public_assets_inherit_their_theme_directory(self) -> None:
        source = (FEED / "index.html").read_text(encoding="utf-8")
        themes = load_json("05_Midia_E_Feed/data/themes.json")["themes"]

        self.assertIn('parts[0] === "recovered"', source)
        self.assertIn("parts.length >= 2", source)
        self.assertIn("? parts[1]", source)
        self.assertIn(": parts.length >= 2", source)
        for theme in themes:
            self.assertEqual(
                theme["folder"],
                f"assets/cards/public/{theme['id']}/",
            )

    def test_continuous_feed_is_default_and_renders_incremental_batches(self) -> None:
        source = (FEED / "index.html").read_text(encoding="utf-8")
        cards = load_json("05_Midia_E_Feed/data/cards.json")["cards"]

        self.assertIn('readStorage("cardFeedViewModeV2") ||', source)
        self.assertIn('legacyViewMode !== "grid" ? legacyViewMode : "continuous"', source)
        self.assertIn('writeStorage("cardFeedViewModeV2", viewMode)', source)
        self.assertIn('if (!VIEW_MODES.includes(viewMode)) viewMode = "continuous"', source)
        self.assertIn("const FEED_BATCH_SIZES = Object.freeze", source)
        sizes_match = re.search(
            r"const FEED_BATCH_SIZES = Object\.freeze\(\{([^}]+)\}\);",
            source,
        )
        self.assertIsNotNone(sizes_match)
        batch_sizes = {
            key: int(value)
            for key, value in re.findall(r"(grid|continuous|compact):\s*(\d+)", sizes_match.group(1))
        }
        self.assertEqual(set(batch_sizes), {"grid", "continuous", "compact"})
        self.assertGreater(min(batch_sizes.values()), 0)
        self.assertLess(max(batch_sizes.values()), len(cards))

        for marker in (
            'id="feedProgress"',
            'id="feedSentinel"',
            'id="btnLoadMore"',
            "function loadNextBatch()",
            "currentFeedCards.slice(start, end)",
            'insertAdjacentHTML("beforeend", html)',
            "list.slice(0, renderedCardCount)",
            'new IntersectionObserver(entries =>',
            'rootMargin: "800px 0px"',
            '$("btnLoadMore").onclick = loadNextBatch',
        ):
            self.assertIn(marker, source)

        render = source[source.index("function render()"):source.index("function hideCard(id)")]
        self.assertNotIn("(focusMode ? [] : list);", render)
        self.assertIn('aria-busy="false"', source)

    def test_feed_images_are_lazy_prioritized_and_fail_without_inline_script(self) -> None:
        source = (FEED / "index.html").read_text(encoding="utf-8")
        self.assertIn("const IMAGE_PRIORITY_COUNT = 2", source)
        self.assertIn('loading="${priorityImage ? "eager" : "lazy"}"', source)
        self.assertIn('decoding="async"', source)
        self.assertIn('fetchpriority="${priorityImage ? "high" : "low"}"', source)
        self.assertIn('data-card-image="${esc(c.id)}"', source)
        self.assertIn("function handleCardImageError(event)", source)
        self.assertIn('document.createElement("div")', source)
        self.assertIn('$("feed").addEventListener("error", handleCardImageError, true)', source)
        self.assertNotIn("onerror=", source)
        self.assertNotIn("onclick=", source)
        self.assertNotIn("parentElement.innerHTML", source)

    def test_feed_state_empty_results_and_accessibility_are_explicit(self) -> None:
        source = (FEED / "index.html").read_text(encoding="utf-8")
        for marker in (
            'const FEED_PREFERENCES_KEY = "cardFeedPreferencesV2"',
            "function applyStoredPreferences()",
            "function syncBrowserState()",
            'window.history.replaceState(null, "", url)',
            'url.searchParams.set("view", state.view)',
            'id="emptyTitle"',
            'id="emptyText"',
            'id="btnEmptyAction"',
            'id="btnCloseViewer"',
            'id="btnCloseHelp"',
            "function updateEmptyState(list)",
            'action.dataset.emptyAction = "retry"',
            'action.dataset.emptyAction = "clear"',
            ':focus-visible',
            'tabindex="-1"',
            "element.focus({ preventScroll: true })",
        ):
            self.assertIn(marker, source)
        self.assertIn("dataLoadErrors.length > 0", source)
        self.assertIn("apenas esta combinação de busca, tema e filtro retornou zero resultados", source)

        service_worker = (FEED / "sw.js").read_text(encoding="utf-8")
        self.assertIn('const CACHE_NAME = `${CACHE_PREFIX}v5`', service_worker)

    def test_search_uses_independent_normalized_tokens(self) -> None:
        source = (FEED / "index.html").read_text(encoding="utf-8")
        self.assertIn('normalize("NFKD")', source)
        self.assertIn("function searchTokens(value", source)
        self.assertIn("tokens.every(token => blob.includes(token))", source)
        self.assertNotIn("return blob.includes(q)", source)

    def test_carousel_and_study_are_single_card_keyboard_and_swipe_modes(self) -> None:
        source = (FEED / "index.html").read_text(encoding="utf-8")
        modes_match = re.search(r"const VIEW_MODES = (\[[^;]+\]);", source)
        self.assertIsNotNone(modes_match)
        self.assertEqual(
            json.loads(modes_match.group(1)),
            ["grid", "continuous", "compact", "carousel", "study"],
        )
        for marker in (
            'id="focusControls"',
            'id="btnPreviousCard"',
            'id="btnNextCard"',
            'id="focusCounter"',
            'id="btnRevealStudy"',
            "function moveFocus(delta)",
            "function toggleStudyAnswer()",
            "async function rateStudyCard(id, status)",
            "function handleFocusKeydown(event)",
            "function wireFocusGestures()",
            'event.key === "ArrowLeft"',
            'event.key === "ArrowRight"',
            'feed.addEventListener("touchstart"',
            'feed.addEventListener("touchend"',
            "const visibleCards = focusMode && focusPosition >= 0 ? [navigationList[focusPosition]]",
            'data-value="revisar"',
            'data-value="aprendendo"',
            'data-value="dominado"',
        ):
            self.assertIn(marker, source)
        self.assertIn('if (status === "revisar") c.nextReview = addDays(1)', source)
        self.assertIn('if (status === "aprendendo") c.nextReview = addDays(3)', source)
        self.assertIn('if (status === "dominado") c.nextReview = addDays(14)', source)
        move_focus = source[source.index("function moveFocus(delta)"):source.index("function toggleStudyAnswer()")]
        self.assertLess(move_focus.index('directCardId = ""'), move_focus.index("const list = getFiltered()"))
        self.assertIn("getFiltered({ ignoreDirect: true })", source)
        self.assertIn("updateFocusControls(navigationList, focusPosition)", source)
        rate_study = source[source.index("async function rateStudyCard"):source.index("function openDB()")]
        self.assertIn("studyRevealed = false", rate_study)
        self.assertIn("Math.min(ratedPosition + 1, after.length - 1)", rate_study)
        self.assertIn("focusedCardId = after[focusIndex].id", rate_study)

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
