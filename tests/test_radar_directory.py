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

    def test_daily_edition_has_unique_evidence_and_exactly_ten_visuals(self):
        scientific = self.radar["scientific"]
        visuals = self.radar["visuals"]
        self.assertGreaterEqual(len(scientific), 10)
        self.assertEqual(len({item["id"] for item in scientific}), len(scientific))
        self.assertEqual(len(visuals), 10)
        self.assertEqual(len({item["id"] for item in visuals}), 10)
        for visual in visuals:
            self.assertTrue(visual["source"])
            self.assertTrue(visual["date"])
            self.assertTrue(visual["sourceUrl"].startswith("https://"))
            relative = visual["file"].removeprefix("./")
            self.assertTrue((RADAR / relative).is_file(), relative)

    def test_visuals_render_clickable_citations_with_official_origin_icons(self):
        for marker in (
            'className="visual-source"',
            "item.sourceUrl",
            "item.source",
            "item.date",
            "/favicon.ico",
            "Síntese visual",
        ):
            self.assertIn(marker, self.html)

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
            "Compartilhar → Copiar link da playlist",
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
            for group in ("scientific", "geopolitics")
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
