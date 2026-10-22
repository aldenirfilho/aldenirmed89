"""Financial reconciliation and evidence boundaries for the published 13F view."""
from __future__ import annotations

import csv
import hashlib
import io
import json
import re
import unittest
from pathlib import Path

from scripts_admin.classify_ensign_peak_sectors import classify

ROOT = Path(__file__).resolve().parents[1]
PORTAL = ROOT / "ecossistema/auditoria-religiosa-360"
DATA = PORTAL / "data"


class EnsignPeakSectorsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.raw = list(csv.DictReader(io.StringIO((DATA / "ensign-peak-2026-q2.csv").read_text())))
        cls.result = json.loads((DATA / "setores-2026-q2.json").read_text())
        cls.snapshot = json.loads((DATA / "nasdaq-setores-snapshot-2026-10-22.json").read_text())
        cls.reviews = json.loads((DATA / "revisao-identidades-setores-2026-q2.json").read_text())

    def test_sec_values_and_identifiers_are_preserved_line_by_line(self):
        rows = self.result["holdings"]
        self.assertEqual(len(rows), 1724)
        self.assertEqual(sum(r["valueUSD"] for r in rows), 60_816_389_385)
        for original, classified in zip(self.raw, rows):
            with self.subTest(line=original["lineNumber"]):
                for field in ("issuer", "securityClass", "cusip"):
                    self.assertEqual(classified[field], original[field])
                self.assertEqual(classified["valueUSD"], int(original["valueUSD"]))
        self.assertEqual(
            hashlib.sha256((DATA / "ensign-peak-2026-q2.csv").read_bytes()).hexdigest(),
            self.result["sourceHashes"]["secCSV"],
        )

    def test_total_and_former_residual_are_partitioned_without_renormalization(self):
        for key, value in (("summary", 60_816_389_385), ("previousResidual", 34_711_166_918)):
            self.assertEqual(sum(g["valueUSD"] for g in self.result[key].values()), value)
        self.assertEqual(sum(s["valueUSD"] for s in self.result["sectors"]), 60_816_389_385)
        self.assertEqual(sum(s["residualValueUSD"] for s in self.result["sectors"]), 34_711_166_918)
        self.assertAlmostEqual(sum(s["percentOfFormerResidual"] for s in self.result["sectors"]), 100)
        self.assertAlmostEqual(sum(s["percentOf13F"] for s in self.result["sectors"]), 100)
        self.assertEqual(self.result["summary"]["etf"]["positions"], 29)
        self.assertEqual(self.result["summary"]["etf"]["valueUSD"], 1_217_968_868)
        self.assertEqual(self.result["summary"]["pending"]["valueUSD"], 1_043_302_775)

    def test_contested_and_missing_classifications_are_not_imputed(self):
        by_issuer = {r["issuer"]: r for r in self.result["holdings"]}
        ge = by_issuer["GE AEROSPACE"]
        self.assertEqual((ge["status"], ge["providerSector"]), ("pending", "Technology"))
        self.assertEqual(ge["method"], "provider_label_contested")
        self.assertTrue(ge["identitySourceURL"].startswith("https://www.geaerospace.com/"))
        for issuer in ("BERKSHIRE HATHAWAY INC DEL", "MORGAN STANLEY DIRECT LENDIN", "ENERGY TRANSFER L P", "AVALONBAY CMNTYS INC"):
            self.assertEqual(by_issuer[issuer]["status"], "pending")
        fbp = by_issuer["FIRST BANCORP CORPORATION"]
        self.assertEqual((fbp["cusip"], fbp["referenceSymbol"]), ("318672706", "FBP"))
        self.assertEqual(fbp["method"], "manual_cusip_evidence")
        self.assertIn("BDC/veículo listado", by_issuer["SLR INVESTMENT CORP"]["note"])
        for r in self.result["holdings"]:
            self.assertTrue(r["note"])
            if r["status"] == "nasdaq":
                self.assertTrue(r["sourceURL"].startswith("https://www.nasdaq.com/market-activity/stocks/"))
                self.assertNotIn(r["providerSector"], ("", "Miscellaneous"))

    def test_reproduction_from_public_snapshot_matches_all_published_records(self):
        regenerated = classify(self.raw, self.snapshot, self.reviews["aliases"], self.reviews["pending"])
        for key in ("holdings", "sectors", "summary", "previousResidual"):
            self.assertEqual(regenerated[key], self.result[key])
        self.assertIsNone(self.result["providerAsOf"])
        self.assertEqual(self.result["classificationConsultedAt"], "2026-10-22")

    def test_offline_html_and_downloaded_csv_expose_the_same_holdings(self):
        source = (PORTAL / "dossie-igreja-mormon.html").read_text()
        embedded = json.loads(re.search(r'<script id="holdings-data" type="application/json">(.*?)</script>', source, re.S)[1])
        downloaded = list(csv.DictReader(io.StringIO((DATA / "ensign-peak-2026-q2-setores.csv").read_text())))
        self.assertEqual(len(downloaded), len(embedded))
        for record, csv_record, html_record in zip(self.result["holdings"], downloaded, embedded):
            self.assertEqual(html_record[:4], [record["issuer"], record["securityClass"], record["cusip"], record["valueUSD"]])
            self.assertEqual(html_record[4:7], [record["sector"], record["status"], record["providerIndustry"]])
            self.assertEqual(csv_record["status"], record["status"])
            self.assertEqual(int(csv_record["valueUSD"]), record["valueUSD"])
        self.assertIn('id="filtro-status"', source)
        self.assertIn('id="fonte-nasdaq"', source)
        self.assertIn('id="residuo-setorial"', source)


if __name__ == "__main__":
    unittest.main()
