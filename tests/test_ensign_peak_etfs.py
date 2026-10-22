"""Financial reconciliation and temporal/asset boundaries for ETF disclosures."""
from __future__ import annotations

import csv
import hashlib
import json
import re
import unittest
from decimal import Decimal
from pathlib import Path

from scripts_admin.build_ensign_peak_etfs import reconcile, set_temporal_fields, validate_dataset

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
        self.assertEqual(len(historical), 21)
        self.assertEqual(self.data["partialFundCount"], 2)
        self.assertEqual(self.data["proxyFundCount"], 6)
        self.assertEqual(sum(fund["ensignPeakValueUSD"] for fund in historical), self.data["historicalValueUSD"])
        self.assertEqual(self.data["historicalValueUSD"], 895_038_749)
        self.assertEqual(self.data["partialValueUSD"], 17_471_710)
        self.assertEqual(self.data["proxyValueUSD"], 305_458_409)
        self.assertEqual(self.data["historicalHoldingsFundCount"], 23)
        self.assertEqual(self.data["historicalHoldingsValueUSD"], 912_510_459)
        self.assertAlmostEqual(self.data["historicalHoldingsPercentOfETFs"], 74.92067186400368)
        self.assertAlmostEqual(sum(self.data[key] for key in (
            "historicalPercentOfETFs", "partialPercentOfETFs", "proxyPercentOfETFs")), 100)
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
        self.assertEqual(next(row["weightPercent"] for row in srln["assetAllocation"]
                              if row["name"] == "Senior floating rate loans"), 84.8)
        self.assertTrue(any(row["kind"] == "Repurchase Agreement" for row in srln["topHoldings"]))
        self.assertEqual(srln["topHoldings"][0]["kind"], "Money Market")
        self.assertEqual(vtip["mandateCategory"], "government")
        self.assertEqual(len(vtip["topHoldings"]), 10)
        self.assertEqual({row["kind"] for row in vtip["topHoldings"]}, {"sovereign_bond"})
        self.assertEqual(hger["mandateCategory"], "commodity")
        self.assertEqual(hger["topHoldings"], [])
        self.assertTrue(hger["commodityExposures"])
        self.assertTrue(hger["instrumentIllustration"])
        for ticker in ("IJH", "IJR"):
            self.assertTrue(self.funds[ticker]["notionalSectors"])
            self.assertIsNone(self.funds[ticker]["sectorCoveragePercent"])

    def test_partial_confirmation_does_not_promote_later_sector_data(self):
        partial = {fund["ticker"] for fund in self.funds.values()
                   if fund["temporalStatus"] == "partial_same_date"}
        self.assertEqual(partial, {"VEA", "VWO"})
        for ticker, groups, missing in (("VEA", 158, 8), ("VWO", 156, 59)):
            fund = self.funds[ticker]
            with self.subTest(fund=ticker):
                self.assertEqual(fund["holdingsAsOf"], "2026-06-30")
                self.assertEqual(fund["sectorAsOf"], "2026-09-30")
                self.assertEqual(fund["fieldDateStatus"], {
                    "holdings": "same_date_documented", "sectors": "later_dated_proxy"})
                self.assertEqual(fund["sectorTaxonomy"], "ICB")
                industries = fund["historicalIndustryBreakdown"]
                self.assertEqual(industries["asOf"], "2026-06-30")
                self.assertEqual(len(industries["groups"]), groups)
                self.assertEqual(industries["missingWeightRows"], missing)

    def test_a_date_alone_or_an_alternative_disclosure_does_not_confirm_components(self):
        fund = {"holdingsAsOf": "2026-06-30", "sectorAsOf": "2026-06-30",
                "topHoldings": [], "sectors": [{"name": "Banking", "weightPercent": 25}]}
        set_temporal_fields(fund)
        self.assertEqual(fund["fieldDateStatus"]["holdings"], "not_confirmed")
        self.assertEqual(fund["temporalStatus"], "partial_same_date")
        fund.update({"holdingsAsOf": "2026-10-21", "sectorAsOf": "2026-09-30",
                     "topHoldings": [{"name": "Example debt", "weightPercent": 2}],
                     "alternativeDatedDisclosure": {"holdingsAsOf": "2026-06-30"}})
        set_temporal_fields(fund)
        self.assertEqual(fund["temporalStatus"], "later_proxy")
        self.assertEqual(fund["fieldDateStatus"]["holdings"], "later_dated_proxy")

    def test_the_sixteen_historical_searches_are_accounted_for_individually(self):
        expected = {"PBUS", "BKLN", "QQQM", "KBWB", "XLU", "XLY", "KRE", "SPYG",
                    "SPYV", "SRLN", "VXF", "VWO", "VEA", "VTIP", "AVEM", "HGER"}
        audit = self.data["historicalSearchAudit"]
        self.assertEqual(len(audit), 16)
        self.assertEqual({record["ticker"] for record in audit}, expected)
        self.assertEqual(self.data["historicalSearchScope"]["fundCount"], 16)
        self.assertEqual(set(self.data["historicalSearchScope"]["tickers"]), expected)
        self.assertEqual(sum(record["holdingsConfirmed"] for record in audit), 10)
        self.assertEqual(sum(record["sectorsConfirmed"] for record in audit), 8)
        for record in audit:
            fund = self.funds[record["ticker"]]
            with self.subTest(fund=fund["ticker"]):
                self.assertEqual(record["targetAsOf"], "2026-06-30")
                self.assertEqual(record["cusip"], fund["cusip"])
                self.assertEqual(record["result"], fund["temporalStatus"])
                self.assertEqual(record["holdingsConfirmed"],
                                 fund["fieldDateStatus"]["holdings"] == "same_date_documented")
                self.assertEqual(record["sectorsConfirmed"],
                                 fund["fieldDateStatus"]["sectors"] == "same_date_documented")
                self.assertTrue(record["gap"])
                self.assertTrue(record["attempts"])

    def test_bkln_may_credit_sectors_keep_their_own_date_and_nav_denominator(self):
        bkln = self.funds["BKLN"]
        may = bkln["alternativeDatedDisclosure"]
        self.assertEqual(bkln["temporalStatus"], "later_proxy")
        self.assertEqual(bkln["holdingsAsOf"], "2026-10-21")
        self.assertEqual(may["holdingsAsOf"], "2026-05-31")
        self.assertEqual(may["sectorAsOf"], "2026-05-31")
        self.assertFalse(may["appliesToJune30"])
        loans, bonds, equity = may["sectorBreakdowns"]
        for block, count, expected in ((loans, 30, "93.14"), (bonds, 17, "3.79"),
                                       (equity, 1, "0.11")):
            self.assertEqual(len(block["sectors"]), count)
            self.assertEqual(sum(Decimal(str(row["weightPercent"])) for row in block["sectors"]),
                             Decimal(expected))
            self.assertEqual(Decimal(str(block["assetClassWeightPercentOfNetAssets"])), Decimal(expected))
        self.assertEqual(may["netAssetsValueUSD"], 7_155_853_785)
        self.assertEqual(may["totalInvestmentsValueUSD"], 7_588_079_662)
        self.assertEqual(may["otherAssetsLessLiabilitiesValueUSD"], -432_225_877)
        self.assertEqual(may["totalInvestmentsValueUSD"] + may["otherAssetsLessLiabilitiesValueUSD"],
                         may["netAssetsValueUSD"])
        self.assertEqual(sum(Decimal(str(row["weightPercent"])) for row in may["assetAllocation"]),
                         Decimal("100"))
        self.assertEqual(Decimal(str(may["totalInvestmentsPercentOfNetAssets"])) +
                         Decimal(str(may["otherAssetsLessLiabilitiesPercentOfNetAssets"])), Decimal("100"))

    def test_vtip_distinguishes_tips_liquidity_and_dollars_in_june(self):
        fund = self.funds["VTIP"]
        self.assertEqual(fund["holdingsAsOf"], fund["sectorAsOf"])
        self.assertEqual(fund["sectorCalculation"]["sovereignLines"], 25)
        self.assertEqual(fund["sectorCalculation"]["reserveLines"], 2)
        tips, liquidity, dollars = fund["sectors"]
        self.assertIn("25 TIPS", tips["name"])
        self.assertEqual((liquidity["name"], dollars["name"]), ("MKTLIQ", "US Dollar"))
        self.assertEqual([row["weightPercent"] for row in fund["sectors"]],
                         [99.16872, 0.71087, 0.1204])
        self.assertEqual(sum(Decimal(str(row["weightPercent"])) for row in fund["sectors"]),
                         Decimal("99.99999"))
        for row in fund["topHoldings"]:
            self.assertEqual(row["sourceNativeWeightField"], "percentOfFunds")
            self.assertTrue(row["cusip"])
            self.assertTrue(row["maturityDate"])
            self.assertNotEqual(row["name"], "MKTLIQ")

    def test_manager_financial_nav_weights_are_distinct_from_native_api_weights(self):
        for ticker in ("SRLN", "KRE", "SPYG", "SPYV", "XLU", "XLY"):
            fund = self.funds[ticker]
            with self.subTest(fund=ticker):
                self.assertEqual(fund["holdingsAsOf"], "2026-06-30")
                self.assertEqual(fund["nativeSectorZeroThresholdPercent"], 0.05)
                for row in fund["topHoldings"]:
                    self.assertAlmostEqual(row["weightPercent"],
                                           row["valueUSD"] / fund["netAssetsUSD"] * 100, places=8)
                    self.assertIn("patrimônio líquido", row["weightMethod"])
        vxf = self.funds["VXF"]
        self.assertIn("patrimônio líquido", vxf["sectorWeightBasis"])
        self.assertAlmostEqual(sum(row["weightPercent"] for row in vxf["sectors"]), 100)
        for ticker in ("VXF", "VTIP", "VEA", "VWO"):
            for row in self.funds[ticker]["topHoldings"]:
                self.assertEqual(row["sourceNativeWeightField"], "percentOfFunds")
                self.assertNotIn("weightMethod", row)

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
