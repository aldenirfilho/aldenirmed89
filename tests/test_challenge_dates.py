"""Datas editoriais não devem avançar apenas porque o catálogo foi recompilado."""

import contextlib
import importlib.util
import io
import json
import os
import tempfile
import unicodedata
import unittest
from datetime import datetime
from pathlib import Path
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "challenge_dates_builder", ROOT / "scripts_admin/build_desafios.py"
)
BUILDER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(BUILDER)


class ChallengeDateTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.sources = self.root / "10_DESAFIOS"
        self.sources.mkdir()
        self.output = self.root / "data/desafios.json"

    def write_json(self, path, value):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(value, ensure_ascii=False), encoding="utf-8")

    def entry(self, entry_id, **extra):
        return {
            "id": entry_id,
            "title": entry_id,
            "excerpt": "Caso fictício para testar compilação.",
            "content": "# Caso fictício\n\n## Caso\nConteúdo de teste.",
            **extra,
        }

    def build_at(self, day):
        class Clock(datetime):
            @classmethod
            def now(cls, tz=None):
                return cls.fromisoformat(day)

        with (
            patch.object(BUILDER, "ROOT_DIR", str(self.root)),
            patch.object(BUILDER, "DESAFIOS_DIR", str(self.sources)),
            patch.object(BUILDER, "OUTPUT_JSON", str(self.output)),
            patch.object(BUILDER, "datetime", Clock),
            contextlib.redirect_stdout(io.StringIO()),
        ):
            BUILDER.build()
        return json.loads(self.output.read_text(encoding="utf-8"))

    def test_catalog_dates_follow_source_precedence_and_survive_later_rebuild(self):
        dated = self.sources / "dated.json"
        fallback = self.sources / "fallback.json"
        self.write_json(dated, {
            "updated": "2025-02-03",
            "temi": [
                self.entry("explicit", date="2025-01-02"),
                self.entry("pack-updated"),
            ],
        })
        self.write_json(fallback, {
            "temi": [self.entry("previous"), self.entry("first-import")],
        })
        source_time = datetime(2022, 1, 1, 12).timestamp()
        os.utime(fallback, (source_time, source_time))
        self.write_json(self.output, {
            "temi": [self.entry(
                "previous", date="2024-04-04",
                source="10_DESAFIOS/fallback.json#temi/previous",
            )],
            "r3": [],
        })

        first = self.build_at("2026-10-18")
        expected = {
            "explicit": "2025-01-02",
            "pack-updated": "2025-02-03",
            "previous": "2024-04-04",
            "first-import": "2022-01-01",
        }
        self.assertEqual({e["id"]: e["date"] for e in first["temi"]}, expected)

        # Simulate a copied checkout and a build years later. Even the legacy
        # entry imported from mtime now has a published date to preserve.
        later_mtime = datetime(2031, 8, 20, 12).timestamp()
        os.utime(fallback, (later_mtime, later_mtime))
        later = self.build_at("2031-08-20")
        self.assertEqual({e["id"]: e["date"] for e in later["temi"]}, expected)
        self.assertNotEqual(first["updated"], later["updated"])

    def test_previous_date_does_not_leak_to_a_different_source_with_same_id(self):
        source = self.sources / "new-origin.json"
        self.write_json(source, {"temi": [self.entry("reused-id")]})
        source_time = datetime(2023, 3, 4, 12).timestamp()
        os.utime(source, (source_time, source_time))
        self.write_json(self.output, {
            "temi": [self.entry(
                "reused-id", date="2010-01-01",
                source="10_DESAFIOS/old-origin.json#temi/reused-id",
            )],
            "r3": [],
        })
        built = self.build_at("2026-10-18")
        self.assertEqual(built["temi"][0]["date"], "2023-03-04")

    def test_unchanged_markdown_keeps_published_date_after_unicode_checkout(self):
        filename = "Plantão.md"
        source = self.sources / filename
        content = "# Plantão\n\n## Caso\nCaso fictício de UTI."
        source.write_text(content, encoding="utf-8")
        copied_time = datetime(2026, 10, 18, 12).timestamp()
        os.utime(source, (copied_time, copied_time))
        self.write_json(self.output, {
            "temi": [self.entry(
                "plantao", content=content, date="2026-06-05",
                source=unicodedata.normalize("NFD", "10_DESAFIOS/" + filename),
            )],
            "r3": [],
        })

        first = self.build_at("2026-10-18")
        self.assertEqual(first["temi"][0]["date"], "2026-06-05")
        later = self.build_at("2031-08-20")
        self.assertEqual(later["temi"][0]["date"], "2026-06-05")

        # A genuine content edit must remain able to advance the source date.
        source.write_text(content + "\n\nRevisão do caso.", encoding="utf-8")
        edited_time = datetime(2026, 11, 2, 12).timestamp()
        os.utime(source, (edited_time, edited_time))
        changed = self.build_at("2031-08-20")
        self.assertEqual(changed["temi"][0]["date"], "2026-11-02")


if __name__ == "__main__":
    unittest.main()
