"""Financial reconciliation and temporal/asset boundaries for ETF disclosures."""
from __future__ import annotations

import csv
import hashlib
import json
import re
import unittest
from pathlib import Path

from scripts_admin.build_ensign_peak_etfs import reconcile, validate_dataset

ROOT = Path(__file__).resolve().parents[1]
PORTAL = ROOT / "ecossistema/auditoria-religiosa-360"
DATA = PORTAL / "data"


class EnsignPeakETFTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads((DATA / "etfs-ensign-peak-2026-q2.json").read_text())
        cls.direct = json.loads((DATA / "setores-2026-q2.json").read_text())
        cls.funds = {fund["ticker"]: fund for fund in cls.data["funds"]}

    def test_all_etf_cusips_and_values_match_the_immutable_13f(self):
        expected = {row["cusip"]: row for row in self.direct["holdings"] if row["status"] == "etf"}
        self.assertEqual(len(self.funds), 29)
        self.assertEqual({fund["cusip"] for fund in self.funds.values()}, set(expected))
        self.assertEqual(sum(fund["ensignPeakValueUSD"] for fund in self.funds.values()), 1_217_968_868)
        for fund in self.funds.values():
            with self.subTest(fund=fund["ticker"]):
                sec = expected[fund["cusip"]]
                self.assertEqual(fund["ensignPeakValueUSD"], sec["valueUSD"])
                self.assertEqual(fund["secLineNumber"], sec["lineNumber"])
                self.assertAlmostEqual(fund["percentOfETFs"], sec["valueUSD"] / 1_217_968_868 * 100)
                self.assertAlmostEqual(fund["percentOf13F"], sec["valueUSD"] / 60_816_389_385 * 100)
        self.assertEqual(hashlib.sha256((DATA / "ensign-peak-2026-q2.csv").read_bytes()).hexdigest(), self.data["sourceHashes"]["secCSV"])

    def test_mandates_partition_vehicle_values_without_adding_underlying_assets(self):
        groups = {group["id"]: group for group in self.data["groups"]}
        expected = {"equity": (23, 916_010_927), "loan_credit": (2, 264_209_993),
                    "corporate_bonds": (2, 35_556_840), "government": (1, 2_009_200), "commodity": (1, 181_908)}
        self.assertEqual(set(groups), set(expected))
        for key, (count, value) in expected.items():
            self.assertEqual((groups[key]["fundCount"], groups[key]["valueUSD"]), (count, value))
        self.assertAlmostEqual(sum(group["percentOfETFs"] for group in groups.values()), 100)
        self.assertAlmostEqual(sum(group["percentOf13F"] for group in groups.values()), 2.0026984178386704)
        self.assertFalse(self.data["sectorAggregationPerformed"])
        self.assertFalse(self.data["indirectExposuresAddedToDirectPortfolio"])

    def test_historical_and_proxy_dates_have_distinct_evidence(self):
        validate_dataset(self.data)
        historical = [fund for fund in self.funds.values() if fund["temporalStatus"] == "historical_same_date"]
        self.assertEqual(len(historical), 13)
        self.assertEqual(self.data["proxyFundCount"], 16)
        self.assertEqual(sum(fund["ensignPeakValueUSD"] for fund in historical), self.data["historicalValueUSD"])
        for fund in self.funds.values():
            self.assertEqual(fund["ensignPeakHoldingsAsOf"], "2026-06-30")
            same_date = fund["holdingsAsOf"] == fund["sectorAsOf"] == "2026-06-30"
            self.assertEqual(same_date, fund["temporalStatus"] == "historical_same_date")
            self.assertTrue(fund["limitations"])
            for evidence in fund["evidenceFiles"]:
                self.assertEqual(len(evidence["sha256"]), 64)
                self.assertNotIn("path", evidence)
        self.assertIn("indexada", self.funds["VOO"]["limitations"][0])
        self.assertEqual(self.funds["PBUS"]["sectorAsOf"], "2026-09-30")
        self.assertEqual(self.funds["PBUS"]["holdingsAsOf"], "2026-10-21")

    def test_credit_government_and_derivatives_do_not_become_equity_sectors(self):
        bkln, srln, vtip, hger = (self.funds[key] for key in ("BKLN", "SRLN", "VTIP", "HGER"))
        self.assertEqual(bkln["sectors"], [])
        self.assertEqual(bkln["sectorCoveragePercent"], 0)
        self.assertEqual(bkln["providerBreakdownRaw"], [{"name": "Corporate", "value": 100}])
        self.assertEqual(bkln["topHoldings"][0]["kind"], "Money Market Fund, Taxable")
        self.assertEqual(srln["mandateCategory"], "loan_credit")
        self.assertLess(next(row["weightPercent"] for row in srln["assetAllocation"] if row["name"] == "Loans"), 100)
        self.assertEqual(vtip["mandateCategory"], "government")
        self.assertEqual(vtip["topHoldings"], [])
        self.assertEqual(hger["mandateCategory"], "commodity")
        self.assertEqual(hger["topHoldings"], [])
        self.assertTrue(hger["commodityExposures"])
        self.assertTrue(hger["instrumentIllustration"])
        for ticker in ("IJH", "IJR"):
            self.assertTrue(self.funds[ticker]["notionalSectors"])
            self.assertIsNone(self.funds[ticker]["sectorCoveragePercent"])

    def test_public_data_csv_and_offline_view_are_consistent(self):
        page = (PORTAL / "dossie-igreja-mormon.html").read_text()
        embedded = json.loads(re.search(r'<script[^>]*id="etfs-data"[^>]*>(.*?)</script>', page, re.S)[1])
        self.assertEqual(embedded, self.data)
        with (DATA / "etfs-ensign-peak-2026-q2-resumo.csv").open() as csv_file:
            csv_rows = list(csv.DictReader(csv_file))
        self.assertEqual(len(csv_rows), 29)
        for row, fund in zip(csv_rows, self.data["funds"]):
            self.assertEqual(row["cusip"], fund["cusip"])
            self.assertEqual(int(row["ensignPeakValueUSD"]), fund["ensignPeakValueUSD"])
        regenerated = reconcile([{"funds": self.data["funds"]}], self.direct["holdings"])
        self.assertEqual(regenerated["funds"], self.data["funds"])
        self.assertEqual(regenerated["groups"], self.data["groups"])
        for identifier, extension, tag in (("etfs-styles", "css", "style"), ("etfs-ui", "js", "script")):
            content = re.search(rf'<{tag}[^>]*id="{identifier}"[^>]*>(.*?)</{tag}>', page, re.S)[1].strip()
            self.assertEqual(content, (PORTAL / f"etfs-ensign-peak.{extension}").read_text().strip())
        self.assertNotIn("/Users/", json.dumps(self.data))
        self.assertIn('id="etfs"', page)
        self.assertIn('href="comparativo-interreligioso/"', page)


if __name__ == "__main__":
    unittest.main()
