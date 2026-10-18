"""Contrato da expansão de 18/10/2026, sem depender do estado futuro do Git."""

import json
import subprocess
import unittest
from datetime import date, datetime
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
RELEASE = "2026-10-18"
REVIEW = "revisao-medica-pendente"


def load_json(relative):
    return json.loads((ROOT / relative).read_text(encoding="utf-8"))


def load_javascript(relative, expression):
    script = """
const fs = require('node:fs'), vm = require('node:vm');
const source = fs.readFileSync(process.argv[1], 'utf8');
const value = vm.runInNewContext(source + '\\n;' + process.argv[2],
  {window: {}}, {timeout: 3000});
process.stdout.write(JSON.stringify(value));
"""
    result = subprocess.run(
        ["node", "-e", script, str(ROOT / relative), expression],
        check=True, capture_output=True, text=True, timeout=10,
    )
    return json.loads(result.stdout)


class OctoberContentReleaseTests(unittest.TestCase):
    def assert_sources(self, entry, sources):
        self.assertTrue(entry["sourceRefs"], entry["id"])
        for reference in entry["sourceRefs"]:
            self.assertIn(reference, sources, entry["id"])
            source = sources[reference]
            url = source["url"] if isinstance(source, dict) else source
            parsed = urlparse(url)
            self.assertEqual(parsed.scheme, "https")
            self.assertTrue(parsed.netloc)

    def test_thirty_mnemonics_are_integrated_without_losing_legacy_ids(self):
        pack = load_json("11_MNEMONICOS/catalogo_expansao_30_20261018.json")
        generated = load_json("data/mnemonicos.json")["mnemonicos"]
        legacy = load_json("11_MNEMONICOS/catalogo_uti_clinica_50.json")["mnemonicos"]
        legacy_ids = {item["id"] for item in legacy} | {
            "abcdechoque", "fasthugbid", "ressuscitacaosepse", "sbar", "qsofa",
        }
        new_ids = {item["id"] for item in pack["mnemonicos"]}
        self.assertEqual(len(pack["mnemonicos"]), 30)
        self.assertEqual(len(new_ids), 30)
        self.assertEqual(len(legacy_ids), 56)
        self.assertFalse(new_ids & legacy_ids)
        self.assertEqual({item["id"] for item in generated}, legacy_ids | new_ids)
        self.assertEqual(len(generated), 86)
        self.assertEqual(pack["editorial"]["status"], REVIEW)
        self.assertFalse(pack["editorial"]["patientData"])
        for item in pack["mnemonicos"]:
            self.assertTrue(item["title"] and item["letters"] and item["content"])
            self.assert_sources(item, pack["sources"])
        for item in generated:
            if item["id"] in new_ids:
                self.assertEqual(item["reviewStatus"], REVIEW)

    def test_thirty_challenges_are_integrated_without_losing_legacy_ids(self):
        pack = load_json("10_DESAFIOS/catalogo_expansao_30_20261018.json")
        legacy = load_json("10_DESAFIOS/catalogo_expansao_40.json")
        generated = load_json("data/desafios.json")
        entries = [item for branch in ("temi", "r3") for item in pack[branch]]
        new_ids = {item["id"] for item in entries}
        legacy_ids = {item["id"] for branch in ("temi", "r3") for item in legacy[branch]} | {
            "banco-de-temas-do-passa-tempo-temi", "o-plantao-da-madrugada",
            "sdra", "sepse-hemodinamica-inicial",
        }
        compiled = [item for branch in ("temi", "r3") for item in generated[branch]]
        self.assertEqual(len(entries), 30)
        self.assertEqual(len(new_ids), 30)
        self.assertEqual(len(legacy_ids), 46)
        self.assertFalse(new_ids & legacy_ids)
        self.assertEqual({item["id"] for item in compiled}, legacy_ids | new_ids)
        self.assertEqual(len(compiled), 76)
        self.assertEqual(pack["editorial"]["status"], REVIEW)
        self.assertFalse(pack["editorial"]["patientData"])
        for item in entries:
            self.assertEqual(item["reviewStatus"], REVIEW)
            self.assertIn("## Caso", item["content"])
            self.assertIn("### ✅ Gabarito comentado", item["content"])
            self.assert_sources(item, pack["sources"])
        for item in compiled:
            if item["id"] in new_ids:
                self.assertEqual(item["reviewStatus"], REVIEW)
                self.assert_sources(item, pack["sources"])

    def test_fifty_authorial_questions_have_answers_comments_and_primary_sources(self):
        bank = load_javascript(
            "questoes/data/qbank_temi_integrado_2026.js", "TEMI_INTEGRADO_2026_QBANK"
        )
        self.assertEqual(bank["meta"]["status"], REVIEW)
        self.assertFalse(bank["meta"]["patientData"])
        self.assertEqual(len(bank["questions"]), 50)
        self.assertEqual(len({item["id"] for item in bank["questions"]}), 50)
        letters = set("ABCDE")
        for item in bank["questions"]:
            self.assertTrue(item["stem"].strip())
            self.assertEqual(set(item["options"]), letters)
            self.assertEqual(set(item["rationales"]), letters)
            self.assertIn(item["answer"], letters)
            self.assertTrue(all(str(text).strip() for text in item["options"].values()))
            self.assertTrue(all(str(text).strip() for text in item["rationales"].values()))
            self.assertTrue(item["synthesis"].strip() and item["pearl"].strip())
            self.assertEqual(item["reviewStatus"], REVIEW)
            self.assert_sources(item, bank["sources"])

    def test_radar_release_has_ten_unique_dois_with_traceable_dates_in_its_window(self):
        radar = load_javascript(
            "15_Radar_Cientifico/data/radar.js", "window.ANTIGRAVITY_RADAR"
        )
        edition = next(item for item in radar["editions"] if item["id"] == RELEASE)
        start, end = date(2026, 9, 19), date(2026, 10, 18)
        self.assertEqual(edition["sourceWindowStart"], start.isoformat())
        self.assertEqual(edition["sourceWindowEnd"], end.isoformat())
        self.assertEqual(len(edition["itemIds"]), 10)
        indexed = {item["id"]: item for item in radar["scientific"]}
        items = [indexed[item_id] for item_id in edition["itemIds"]]
        self.assertEqual(len({item["doi"].casefold() for item in items}), 10)
        for item in items:
            self.assertRegex(item["doi"], r"^10\.\d{4,9}/\S+$")
            self.assertEqual(item["id"].casefold(), "doi:" + item["doi"].casefold())
            published = datetime.fromisoformat(item["sourcePublishedAt"])
            checked = datetime.fromisoformat(item["checkedAt"])
            editorial = datetime.fromisoformat(item["editorialPublishedAt"])
            self.assertLessEqual(start, published.date())
            self.assertLessEqual(published.date(), end)
            self.assertEqual(item["date"], published.date().isoformat())
            self.assertLessEqual(published, checked)
            self.assertLessEqual(editorial, checked)
            self.assertEqual(item["sourceDatePrecision"], "day")
            self.assertTrue(item["sourceDateKind"].strip() and item["sourceDateNote"].strip())
            self.assertEqual(urlparse(item["url"]).scheme, "https")
            self.assertTrue(urlparse(item["url"]).netloc)
            self.assertEqual(item["audit"]["reviewStatus"], "pending")
            self.assertIsNone(item["audit"]["clinicalReviewer"])


if __name__ == "__main__":
    unittest.main()
