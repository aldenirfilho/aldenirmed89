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
        self.assertEqual(len(historical), 22)
        self.assertEqual(self.data["partialFundCount"], 3)
        self.assertEqual(self.data["proxyFundCount"], 4)
        self.assertEqual(sum(fund["ensignPeakValueUSD"] for fund in historical), self.data["historicalValueUSD"])
        self.assertEqual(self.data["historicalValueUSD"], 897_165_598)
        self.assertEqual(self.data["partialValueUSD"], 21_241_285)
        self.assertEqual(self.data["proxyValueUSD"], 299_561_985)
        self.assertEqual(self.data["historicalHoldingsFundCount"], 24)
        self.assertEqual(self.data["historicalHoldingsValueUSD"], 914_637_308)
        self.assertAlmostEqual(self.data["historicalHoldingsPercentOfETFs"],
                               914_637_308 / 1_217_968_868 * 100)
        self.assertEqual(self.data["historicalSectorsFundCount"], 23)
        self.assertEqual(self.data["historicalSectorsValueUSD"], 900_935_173)
        self.assertAlmostEqual(self.data["historicalSectorsPercentOfETFs"],
                               900_935_173 / 1_217_968_868 * 100)
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
        self.assertEqual(partial, {"VEA", "VWO", "AVEM"})
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
        self.assertEqual(self.data["historicalSearchScope"]["resultEdition"], "1.3")
        self.assertTrue(self.data["historicalSearchScope"]["auditIsHistoricalSnapshot"])
        self.assertEqual(self.data["historicalSearchScope"]["endOfRoundCounts"], {
            "historicalFundCount": 21, "partialFundCount": 2, "proxyFundCount": 6})
        self.assertEqual(sum(record["holdingsConfirmed"] for record in audit), 10)
        self.assertEqual(sum(record["sectorsConfirmed"] for record in audit), 8)
        for record in audit:
            fund = self.funds[record["ticker"]]
            with self.subTest(fund=fund["ticker"]):
                self.assertEqual(record["targetAsOf"], "2026-06-30")
                self.assertEqual(record["cusip"], fund["cusip"])
                # This audit is the preserved first-round snapshot, before QQQM/AVEM improved.
                if fund["ticker"] in {"QQQM", "AVEM"}:
                    self.assertEqual(record["result"], "later_proxy")
                    self.assertFalse(record["holdingsConfirmed"])
                    self.assertFalse(record["sectorsConfirmed"])
                else:
                    self.assertEqual(record["result"], fund["temporalStatus"])
                    self.assertEqual(record["holdingsConfirmed"],
                                     fund["fieldDateStatus"]["holdings"] == "same_date_documented")
                    self.assertEqual(record["sectorsConfirmed"],
                                     fund["fieldDateStatus"]["sectors"] == "same_date_documented")
                self.assertTrue(record["gap"])
                self.assertTrue(record["attempts"])

    def test_the_eight_followup_searches_report_the_final_state_individually(self):
        expected = {"PBUS", "BKLN", "QQQM", "KBWB", "VEA", "VWO", "AVEM", "HGER"}
        audit = self.data["followupSearchAudit"]
        self.assertEqual(len(audit), 8)
        self.assertEqual({record["ticker"] for record in audit}, expected)
        self.assertEqual(self.data["followupSearchScope"]["fundCount"], 8)
        self.assertEqual(set(self.data["followupSearchScope"]["tickers"]), expected)
        self.assertEqual(sum(record["holdingsConfirmed"] for record in audit), 3)
        self.assertEqual(sum(record["sectorsConfirmed"] for record in audit), 2)
        for record in audit:
            fund = self.funds[record["ticker"]]
            with self.subTest(fund=fund["ticker"]):
                self.assertEqual(record["targetAsOf"], "2026-06-30")
                self.assertEqual(record["holdingsAsOf"], fund["holdingsAsOf"])
                self.assertEqual(record["sectorsAsOf"], fund["sectorAsOf"])
                self.assertEqual(record["result"], fund["temporalStatus"])
                self.assertEqual(record["holdingsConfirmed"],
                                 fund["fieldDateStatus"]["holdings"] == "same_date_documented")
                self.assertEqual(record["sectorsConfirmed"],
                                 fund["fieldDateStatus"]["sectors"] == "same_date_documented")
                self.assertTrue(record["gap"])
                self.assertTrue(record["sources"])
                self.assertTrue(record["evidenceFiles"])
                for evidence in record["evidenceFiles"]:
                    self.assertEqual(len(evidence["sha256"]), 64)
                    self.assertNotIn("path", evidence)

    def test_qqqm_june_top_ten_preserves_issuer_aggregation_and_limited_coverage(self):
        fund = self.funds["QQQM"]
        self.assertEqual(fund["holdingsAsOf"], "2026-06-30")
        self.assertEqual(fund["sectorAsOf"], "2026-06-30")
        self.assertEqual(fund["fundHoldingCount"], 103)
        self.assertEqual(fund["holdingsScope"], "published_top_10_issuer_labels_only")
        self.assertFalse(fund["fullPortfolioConfirmed"])
        self.assertEqual(len(fund["topHoldings"]), 10)
        self.assertEqual(sum(Decimal(str(row["weightPercent"])) for row in fund["topHoldings"]),
                         Decimal("47.84"))
        alphabet = [row for row in fund["topHoldings"] if "Alphabet" in row["name"]]
        self.assertEqual(len(alphabet), 1)
        self.assertEqual(alphabet[0]["name"], "Alphabet Inc")
        self.assertEqual(alphabet[0]["weightPercent"], 6.29)
        self.assertIsNone(alphabet[0]["ticker"])
        self.assertFalse(alphabet[0]["shareClassesSeparated"])
        self.assertFalse(any(row["ticker"] in {"GOOG", "GOOGL"} for row in fund["topHoldings"]))
        self.assertTrue(fund["sectorTaxonomy"].startswith("ICB"))
        self.assertEqual(len(fund["sectors"]), 9)
        self.assertEqual(sum(Decimal(str(row["weightPercent"])) for row in fund["sectors"]),
                         Decimal("100"))
        date_evidence = fund["sourceDateEvidence"]
        self.assertFalse(date_evidence["internalDateConfirmedIndependentlyForHoldingsAndSectors"])
        self.assertEqual(date_evidence["sectorDateBasis"], "overall_factsheet_as_of")
        self.assertTrue(any("20260801031657" in source["url"] for source in fund["holdingsSources"]))

    def test_avem_june_sector_scope_does_not_backdate_july_or_september_holdings(self):
        fund = self.funds["AVEM"]
        self.assertEqual(fund["holdingsAsOf"], "2026-09-30")
        self.assertEqual(fund["sectorAsOf"], "2026-06-30")
        self.assertEqual(fund["fieldDateStatus"], {
            "holdings": "later_dated_proxy", "sectors": "same_date_documented"})
        self.assertEqual(fund["temporalStatus"], "partial_same_date")
        self.assertEqual(len(fund["sectors"]), 11)
        self.assertEqual(sum(Decimal(str(row["weightPercent"])) for row in fund["sectors"]),
                         Decimal("99"))
        self.assertEqual(fund["reportedSectorWeightSumPercent"], 99)
        self.assertEqual(fund["topHoldings"][0]["weightPercent"], 12.67)
        self.assertIn("Taiwan Semiconductor", fund["topHoldings"][0]["name"])
        date_evidence = fund["sectorDateEvidence"]
        self.assertEqual(date_evidence["field"], "a.portfolio.asOfDate")
        self.assertEqual(date_evidence["value"], "06/30/2026")
        self.assertFalse(date_evidence["specificSectorDateExists"])
        self.assertIn("July 29", date_evidence["relationship"])

    def test_gics_editorial_panels_keep_missing_weights_and_do_not_promote_icb(self):
        self.assertEqual(set(self.data["derived_panels"]), {"VEA", "VWO"})
        expected = {
            "VEA": (157, 7, 8, 0, "98.06157", "0.00612", "98.06769"),
            "VWO": (155, 19, 59, 12, "95.09779", "0.04552", "95.14331"),
        }
        for ticker, (labels, blanks, missing, blank_missing, mapped, unmapped, total) in expected.items():
            panel, fund = self.data["derived_panels"][ticker], self.funds[ticker]
            with self.subTest(fund=ticker):
                self.assertEqual(panel["as_of"], "2026-06-30")
                self.assertEqual(panel["map_document_date"], "2026-04")
                self.assertEqual(panel["map_pages_1_based"], [6, 7, 8, 9, 10, 11, 12])
                self.assertIn("GICS", panel["taxonomy"])
                self.assertFalse(panel["published_by_vanguard"])
                self.assertFalse(panel["replace_official_ICB_panel"])
                self.assertEqual(len(panel["sectors"]), 11)
                self.assertEqual(sum(Decimal(str(row["known_native_weight_pct"]))
                                     for row in panel["sectors"]), Decimal(mapped))
                coverage = panel["coverage"]
                self.assertEqual(coverage["mapped_nonempty_literal_labels"], labels)
                self.assertEqual(coverage["nonempty_literal_labels"], labels)
                self.assertEqual(coverage["nonempty_unmapped_labels"], [])
                self.assertEqual(coverage["unmapped_labels_including_empty"], [""])
                self.assertEqual(coverage["unmapped_rows"], blanks)
                self.assertEqual(coverage["missing_numeric_weights_total"], missing)
                self.assertEqual(coverage["missing_numeric_weights_unmapped"], blank_missing)
                self.assertEqual(Decimal(str(coverage["unmapped_known_weight_pct"])), Decimal(unmapped))
                self.assertEqual(Decimal(str(coverage["all_known_equity_weight_pct"])), Decimal(total))
                self.assertFalse(coverage["normalization_performed"])
                self.assertFalse(coverage["full_portfolio_coverage_claimed"])
                self.assertEqual(len(panel["unmapped_rows"]), blanks)
                self.assertEqual(len(panel["subindustry_audit"]), labels)
                self.assertEqual(len(panel["map_source_sha256"]), 64)
                self.assertEqual(fund["sectorTaxonomy"], "ICB")
                self.assertEqual(fund["sectorAsOf"], "2026-09-30")
                self.assertEqual(fund["temporalStatus"], "partial_same_date")

    def test_hger_manager_report_is_separate_from_etf_june_confirmation(self):
        fund = self.funds["HGER"]
        self.assertEqual(fund["temporalStatus"], "later_proxy")
        self.assertEqual(fund["holdingsAsOf"], "2026-09-30")
        self.assertEqual(fund["sectorAsOf"], "2026-09-30")
        self.assertEqual(fund["topHoldings"], [])
        panel = fund["managerReportedCommodityWeightsJune"]
        self.assertEqual(panel["asOf"], "2026-06-30")
        self.assertEqual(panel["sourcePageOneBased"], 6)
        self.assertEqual(panel["columnLabel"], "Daily Weight %")
        self.assertEqual(len(panel["rows"]), 20)
        self.assertEqual(sum(Decimal(str(row["dailyWeightPercent"])) for row in panel["rows"]),
                         Decimal("100"))
        self.assertEqual({row["kind"] for row in panel["rows"]},
                         {"manager_reported_commodity_weight_not_NAV"})
        self.assertEqual(len(panel["editorialGroupings"]), 6)
        for group in panel["editorialGroupings"]:
            self.assertEqual(sum(Decimal(str(row["dailyWeightPercent"])) for row in panel["rows"]
                                 if row["commoditySector"] == group["name"]),
                             Decimal(str(group["dailyWeightSumPercent"])))
            self.assertIn("no normalization", group["method"])
        self.assertIn("NAV", panel["weightBasis"])
        self.assertIn("benchmark", panel["attribution"])

    def test_unsuccessful_archived_candidates_preserve_existing_proxies(self):
        for ticker in ("PBUS", "BKLN", "KBWB"):
            fund = self.funds[ticker]
            with self.subTest(fund=ticker):
                self.assertEqual(fund["holdingsAsOf"], "2026-10-21")
                self.assertEqual(fund["sectorAsOf"], "2026-09-30")
                self.assertEqual(fund["temporalStatus"], "later_proxy")
                self.assertTrue(fund["topHoldings"])
                self.assertTrue(fund["evidenceFiles"])

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
        self.assertIn('id="etf-followup-search"', page)
        self.assertIn('href="comparativo-interreligioso/"', page)


if __name__ == "__main__":
    unittest.main()
