#!/usr/bin/env python3
"""Contratos do Radar Científico e do Diretório Médico plugável."""

from __future__ import annotations

import json
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RADAR = ROOT / "15_Radar_Cientifico"
DIRECTORY = ROOT / "16_Diretorio_Medico"


def load_window_data(path: Path, variable: str):
    script = (
        "global.window={};require(process.argv[1]);"
        f"process.stdout.write(JSON.stringify(window.{variable}));"
    )
    result = subprocess.run(
        ["node", "-e", script, str(path)],
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


class MedicalDirectoryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sites = load_window_data(
            DIRECTORY / "data/sites.js", "ANTIGRAVITY_MEDICAL_SITES"
        )
        cls.html = (DIRECTORY / "index.html").read_text(encoding="utf-8")

    def test_catalog_is_large_unique_and_secure(self):
        self.assertGreaterEqual(len(self.sites), 250)
        self.assertEqual(len({item["id"] for item in self.sites}), len(self.sites))
        self.assertEqual(len({item["url"] for item in self.sites}), len(self.sites))
        self.assertTrue(all(item["url"].startswith("https://") for item in self.sites))
        self.assertEqual(
            {item["access"] for item in self.sites},
            {"aberto", "semiaberto", "fechado"},
        )

    def test_regions_categories_and_core_sources_are_present(self):
        regions = {item["region"] for item in self.sites}
        categories = {item["category"] for item in self.sites}
        names = " ".join(item["name"] for item in self.sites).casefold()
        self.assertTrue({"Internacional", "Brasil", "Ceará"}.issubset(regions))
        self.assertGreaterEqual(len(categories), 10)
        for marker in ("uptodate", "new england", "pubmed", "amib", "ta de clinicagem"):
            self.assertIn(marker, names)

    def test_directory_is_filterable_and_uses_legal_open_alternatives(self):
        for marker in (
            'id="search"',
            'id="region"',
            'id="category"',
            'id="access"',
            "Unpaywall",
            "PubMed Central",
            "DOAJ",
            'rel="noopener noreferrer"',
        ):
            self.assertIn(marker, self.html)
        urls = " ".join(item["url"] for item in self.sites).casefold()
        self.assertNotIn("sci-hub", urls)


class ScientificRadarTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.radar = load_window_data(
            RADAR / "data/radar.js", "ANTIGRAVITY_RADAR"
        )
        cls.html = (RADAR / "index.html").read_text(encoding="utf-8")
        cls.history = json.loads(
            (RADAR / "data/radar-history.json").read_text(encoding="utf-8")
        )

    def test_radar_v2_has_unique_evidence_and_exactly_ten_visuals(self):
        self.assertEqual(self.radar["schemaVersion"], "radar-v2")
        scientific = self.radar["scientific"]
        visuals = self.radar["visuals"]
        self.assertGreaterEqual(len(scientific), 10)
        self.assertEqual(len({item["id"] for item in scientific}), len(scientific))
        self.assertEqual(len(visuals), 10)
        self.assertEqual(len({item["id"] for item in visuals}), 10)
        item_ids = {
            item["id"]
            for group in ("scientific", "geopolitics", "commercial")
            for item in self.radar[group]
        }
        visual_files = set()
        for visual in visuals:
            self.assertIn(visual["itemId"], item_ids)
            self.assertTrue(visual["source"])
            self.assertTrue(visual["date"])
            self.assertTrue(visual["sourceUrl"].startswith("https://"))
            self.assertGreaterEqual(len(visual["alt"]), 40)
            self.assertEqual(
                set(visual["transcript"]),
                {"question", "evidence", "practice", "limit"},
            )
            self.assertTrue(all(visual["transcript"].values()))
            self.assertEqual(visual["file"], visual["cardFile"])
            self.assertNotEqual(visual["cardFile"], visual["wideFile"])
            for field in ("cardFile", "wideFile"):
                relative = visual[field].removeprefix("./")
                visual_files.add(relative)
                self.assertTrue((RADAR / relative).is_file(), relative)
        self.assertEqual(len(visual_files), 20)

    def test_commercial_channel_has_three_referenced_visual_pairs_and_safeguards(self):
        commercial = self.radar["commercial"]
        product_visuals = self.radar["productVisuals"]
        self.assertEqual(len(commercial), 3)
        self.assertEqual(len(product_visuals), 3)
        self.assertEqual(len({item["id"] for item in commercial}), 3)
        self.assertEqual(len({item["id"] for item in product_visuals}), 3)
        commercial_ids = {item["id"] for item in commercial}
        product_files = set()
        for item in commercial:
            self.assertEqual(item["section"], "commercial")
            self.assertFalse(item["commerce"]["affiliate"])
            self.assertTrue(item["price"]["checkedAt"])
            self.assertTrue(item["price"]["availability"])
            self.assertIn("garant", (item["summary"] + item["caveat"] + str(item["commerce"])).casefold())
            self.assertNotIn("%", item["commerce"]["possibleBenefit"])
        for visual in product_visuals:
            self.assertIn(visual["itemId"], commercial_ids)
            self.assertEqual(visual["file"], visual["cardFile"])
            self.assertNotEqual(visual["cardFile"], visual["wideFile"])
            self.assertTrue(visual["sourceUrl"].startswith("https://"))
            for field in ("cardFile", "wideFile"):
                relative = visual[field].removeprefix("./")
                product_files.add(relative)
                self.assertTrue((RADAR / relative).is_file(), relative)
        self.assertEqual(len(product_files), 6)

    def test_items_separate_source_editorial_and_audit_dates(self):
        expected_sections = {
            "scientific": "scientific",
            "geopolitics": "context",
            "commercial": "commercial",
        }
        for group in ("scientific", "geopolitics", "commercial"):
            for item in self.radar[group]:
                self.assertEqual(item["section"], expected_sections[group])
                for field in (
                    "sourcePublishedAt",
                    "editorialPublishedAt",
                    "checkedAt",
                ):
                    self.assertRegex(
                        item[field],
                        r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-03:00$",
                    )
                self.assertTrue(item["sourcePublishedAt"] <= item["checkedAt"])
                self.assertTrue(item["editorialPublishedAt"] <= item["checkedAt"])
                didactic = item["didactic"]
                for field in (
                    "clinicalQuestion",
                    "design",
                    "population",
                    "mainResult",
                    "clinicalMeaning",
                    "practiceToday",
                    "doNotInfer",
                    "temiHook",
                    "memoryAnchor",
                    "caveats",
                ):
                    self.assertTrue(didactic[field], f"{item['id']} sem {field}")

    def test_editions_are_chronological_and_reference_existing_content(self):
        editions = self.radar["editions"]
        self.assertGreaterEqual(len(editions), 1)
        self.assertEqual(
            [item["date"] for item in editions],
            sorted((item["date"] for item in editions), reverse=True),
        )
        all_ids = {
            item["id"]
            for group in ("scientific", "geopolitics", "commercial")
            for item in self.radar[group]
        }
        visual_ids = {item["id"] for item in self.radar["visuals"]}
        for edition in editions:
            self.assertTrue(set(edition["itemIds"]).issubset(all_ids))
            self.assertEqual(
                len(edition["visualIds"]),
                edition["visualPairCount"],
            )
            self.assertEqual(
                edition["visualAssetCount"],
                edition["visualPairCount"] * 2,
            )
            self.assertTrue(set(edition["visualIds"]).issubset(visual_ids))
            self.assertEqual(
                edition["productVisualAssetCount"],
                edition["productVisualPairCount"] * 2,
            )

    def test_visuals_render_clickable_citations_and_semantic_transcripts(self):
        for marker in (
            'class="visual-source"',
            "visual.sourceUrl",
            "visual.source",
            "visual.sourcePublishedAt",
            "/favicon.ico",
            'aria-label="Transcrição didática do visual"',
            "visual.alt||visual.title",
            'class="visual-picture visual-picture-auto"',
            '<source media="(min-width: 921px)"',
        ):
            self.assertIn(marker, self.html)

    def test_radar_is_a_searchable_chronological_station(self):
        for marker in (
            "Estação Radar Diário",
            'id="search"',
            'id="todayButton"',
            'id="previousButton"',
            'id="nextButton"',
            'id="allDatesButton"',
            'id="dateSelect"',
            'id="topicSelect"',
            'class="date-group"',
            "<time datetime=",
            "editorialPublishedAt",
            "sourcePublishedAt",
            "checkedAt",
            'id="loadMore"',
            "IntersectionObserver",
            'data-visual-mode="auto"',
            'data-visual-mode="wide"',
            'data-visual-mode="card"',
            'data-section="commercial"',
            "Produtividade &amp; compras",
            'class="commerce-panel"',
            "sem link afiliado",
            "Impacto na rotina do médico/estudante",
            "antigravity:radar-visual-mode:v1",
        ):
            self.assertIn(marker, self.html)
        self.assertNotIn("Bloco 1", self.html)
        self.assertNotIn("Bloco 2", self.html)
        self.assertNotIn("honra" + " e vigor", self.html.casefold())
        self.assertEqual(self.html.count("const colorSchemeMedia"), 1)
        self.assertNotIn("const systemTheme", self.html)

    def test_spotify_connection_is_explicit_local_and_without_autoplay(self):
        self.assertEqual(len(self.radar["spotify"]), 3)
        self.assertTrue(
            all(
                item["url"].startswith("https://open.spotify.com/")
                for item in self.radar["spotify"]
            )
        )
        for marker in (
            "antigravity:spotify-playlist:v1",
            "Compartilhar → Copiar link",
            "Salvar e abrir",
            'parsed.hostname!=="open.spotify.com"',
            '["playlist","album","track","episode","show"].includes(spotifyKind)',
        ):
            self.assertIn(marker, self.html)
        self.assertNotIn("<iframe", self.html.casefold())
        self.assertNotIn("autoplay", self.html.casefold())

    def test_temi_goal_is_local_and_celebration_requires_completion(self):
        for marker in (
            "antigravity:temi-goal:v1",
            "done<goal",
            "if(done>=goal)celebrate()",
            "animation:achievement 5s",
        ):
            self.assertIn(marker, self.html)
        self.assertIn('id="goalReplay" type="button" disabled', self.html)

    def test_history_and_public_architecture_are_connected(self):
        history_ids = set(self.history["publishedIds"])
        current_ids = {
            item["id"]
            for group in ("scientific", "geopolitics", "commercial")
            for item in self.radar[group]
        }
        self.assertTrue(current_ids.issubset(history_ids))
        manifest = json.loads(
            (ROOT / "data/site_manifest.json").read_text(encoding="utf-8")
        )
        self.assertEqual(
            manifest["canonicalRoutes"]["radar_cientifico"],
            "15_Radar_Cientifico/index.html",
        )
        self.assertEqual(
            manifest["canonicalRoutes"]["diretorio_medico"],
            "16_Diretorio_Medico/index.html",
        )


if __name__ == "__main__":
    unittest.main()
