"""Offline contract checks for the historical Infectologia publication.

No preparation script is imported: it writes publication files at import time.
The generated frontend is mandatory, including on CI; nothing is skipped.
"""

import ast
import json
import math
import re
import unicodedata
import unittest
from decimal import Decimal
from fractions import Fraction
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
MODULE = ROOT / "01_Modulos_Clinicos/Infectologia_Critica/resistencia-antimicrobianos"
MODES = ("publico", "pf20", "pmvgCondicional")


def load_catalog():
    return json.loads((MODULE / "data/catalog.json").read_text(encoding="utf-8"))


def normalized(value):
    value = unicodedata.normalize("NFD", value)
    return " ".join("".join(c for c in value if not unicodedata.combining(c)).lower().split())


def exact_unit_price(item, mode):
    """Independent rational reference; never use the rounded display unit."""
    if item["status"] == "NAO_LOCALIZADO":
        return None
    if item["status"] == "PRECIFICADO_ARP_IMPORTACAO_2026":
        rule = item["regraExata"]
        return Fraction(rule["preco_caixa_brl"]) / rule["divisor_unidades"]
    column = "PMVG 20 %" if (
        mode == "pmvgCondicional" or (mode == "publico" and item["capNovo"] == "Sim")
    ) else "PF 20 %"
    return Fraction(str(item["precosCaixa"][column])) / item["unidadesCaixa"]


def brl_decimal(amount):
    """Exact positive-currency half-up rounding, including half-cent ties."""
    cents = amount * 100
    whole, remainder = divmod(cents.numerator, cents.denominator)
    if remainder * 2 >= cents.denominator:
        whole += 1
    return Decimal(whole).scaleb(-2)


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.ids = []
        self.references = []
        self.scripts = []
        self.options = []
        self.tags = []
        self.words = []
        self.feed(path.read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        self.tags.append(tag)
        if attributes.get("id"):
            self.ids.append(attributes["id"])
        for key in ("href", "src"):
            if attributes.get(key):
                self.references.append(attributes[key])
        if tag == "script" and attributes.get("src"):
            self.scripts.append(attributes["src"])
        if tag == "option" and attributes.get("value"):
            self.options.append(attributes["value"])

    def handle_data(self, data):
        self.words.append(data)

    @property
    def text(self):
        return normalized(" ".join(self.words))


class InfectologiaDataTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = load_catalog()
        cls.items = {item["id"]: item for item in cls.data["costs"]["items"]}
        cls.scenarios = cls.data["costs"]["scenarios"]

    def scenario(self, item_id, days, label_contains=None):
        matches = [s for s in self.scenarios
                   if s["periodo"] == f"{days} dias"
                   and any(c["id"] == item_id for c in s["consumo"])
                   and (label_contains is None or label_contains in s["cenario"])]
        self.assertEqual(len(matches), 1, (item_id, days, label_contains))
        return matches[0]

    def test_publication_counts_and_historical_dates(self):
        self.assertEqual(len(self.data["pathogens"]), 49)
        self.assertEqual(len(self.data["drugs"]), 20)
        self.assertEqual(len(self.scenarios), 33)
        self.assertEqual(self.data["meta"]["status"], "em-revisao-medica")
        self.assertEqual(self.data["meta"]["evidenceCutoffs"], ["2026-10-10", "2026-10-18"])
        self.assertEqual(self.data["meta"]["sourcePriceList"], "2026-10-09")
        self.assertEqual(self.data["meta"]["priceConsultation"], "2026-10-18")
        groups = {p["grupo"] for p in self.data["pathogens"]}
        self.assertTrue({"Bactérias", "Fungos", "Vírus", "Príons"}.issubset(groups))

    def test_required_clinical_fields_and_sources_are_present(self):
        for collection, fields in (
            (self.data["pathogens"], ("agente", "diagnostico", "tratamento", "limites")),
            (self.data["drugs"], ("farmaco", "dose", "renal", "infusao", "alertas")),
        ):
            for record in collection:
                with self.subTest(record=record.get(fields[0])):
                    for field in fields:
                        self.assertTrue(record.get(field, "").strip(), field)
                    self.assertIsInstance(record.get("fontes"), list)
                    self.assertTrue(record["fontes"])

    def test_source_urls_are_public_https_and_not_local_paths(self):
        urls = []
        for record in self.data["pathogens"] + self.data["drugs"]:
            urls.extend(record["fontes"])
        urls.extend(record["url"] for record in self.data["articles"] + self.data["searches"])
        urls.extend(item["fonte_url"] for item in self.items.values())
        for url in urls:
            with self.subTest(url=url):
                parsed = urlsplit(url)
                self.assertEqual(parsed.scheme, "https")
                self.assertTrue(parsed.hostname)
                self.assertIsNone(parsed.username)
                self.assertIsNone(parsed.password)
                self.assertNotIn(parsed.hostname, ("localhost", "127.0.0.1"))
                self.assertFalse(any(char.isspace() for char in url))

    def test_public_price_uses_pf_without_cap_and_pmvg_with_cap(self):
        # A discounted PMVG column must not silently become every public price.
        self.assertNotEqual(self.items["fluconazol_iv_200mg"]["unit"]["pf20"],
                            self.items["fluconazol_iv_200mg"]["unit"]["pmvgCondicional"])
        for item in self.items.values():
            for mode in MODES:
                with self.subTest(item=item["id"], mode=mode):
                    expected = exact_unit_price(item, mode)
                    actual = item["unit"][mode]
                    if expected is None:
                        self.assertIsNone(actual, "Missing prices must remain null, never zero")
                    else:
                        self.assertIsNotNone(actual)
                        self.assertGreater(actual, 0)
                        expected_decimal = Decimal(expected.numerator) / expected.denominator
                        self.assertLess(abs(Decimal(str(actual)) - expected_decimal), Decimal("0.000000001"))

    def test_scenario_totals_reconcile_without_intermediate_unit_rounding(self):
        for scenario in self.scenarios:
            for mode in MODES:
                with self.subTest(scenario=scenario["cenario"], period=scenario["periodo"], mode=mode):
                    total = Fraction(0)
                    for consumption in scenario["consumo"]:
                        self.assertIn(consumption["id"], self.items)
                        self.assertIsInstance(consumption["unidades"], int)
                        self.assertGreater(consumption["unidades"], 0)
                        total += exact_unit_price(self.items[consumption["id"]], mode) * consumption["unidades"]
                    self.assertEqual(Decimal(scenario["totals"][mode]), brl_decimal(total))
            self.assertEqual(scenario["historic"], scenario["custo_brl"])
            self.assertEqual(Decimal(scenario["historic"]), Decimal(scenario["totals"]["pmvgCondicional"]))

    def test_half_cent_ties_and_changed_public_basis(self):
        # Half a 28-tablet box is exactly x.375 BRL; repeated decimal unit
        # division or binary floats must not turn this into a one-cent loss.
        letermovir = self.scenario("letermovir_oral_480mg", 14)
        self.assertEqual(letermovir["totals"]["publico"], "20884.38")
        aciclovir = self.scenario("aciclovir_iv_250mg", 21)
        self.assertEqual(aciclovir["totals"]["pmvgCondicional"], "16867.31")
        fluconazol = self.scenario("fluconazol_iv_200mg", 7)
        self.assertEqual(fluconazol["totals"]["publico"], "3427.68")
        self.assertEqual(fluconazol["historic"], "2749.33")

    def test_loading_doses_are_included_in_consumption(self):
        for days in (7, 14):
            expected = {
                "fluconazol_iv_200mg": 4 + 2 * (days - 1),
                "anidulafungina_iv_100mg": 2 + days - 1,
                "voriconazol_iv_200mg": 2 * math.ceil(420 / 200) + 2 * math.ceil(280 / 200) * (days - 1),
                "isavuconazol_iv_200mg_ativo": 6 + days - 2,
                "isavuconazol_oral_100mg_ativo": 2 * (6 + days - 2),
            }
            for item_id, units in expected.items():
                with self.subTest(item=item_id, days=days):
                    self.assertEqual(self.scenario(item_id, days)["consumo"], [{"id": item_id, "unidades": units}])
            caspofungina = self.scenario("caspofungina_iv_70mg", days)
            self.assertEqual({c["id"]: c["unidades"] for c in caspofungina["consumo"]},
                             {"caspofungina_iv_70mg": 1, "caspofungina_iv_50mg": days - 1})

    def test_vials_are_rounded_per_administration_not_per_day(self):
        # Foscarnet 6,300 mg needs two 6,000 mg vials on EACH administration.
        # Rounding the daily 12,600 mg total would incorrectly yield three/day.
        foscarnet = self.scenario("foscarnet_iv_24mg_ml_250ml", 14)
        self.assertEqual(foscarnet["consumo"][0]["unidades"], math.ceil(6300 / 6000) * 2 * 14)
        self.assertNotEqual(foscarnet["consumo"][0]["unidades"], math.ceil(12600 / 6000) * 14)
        self.assertEqual(foscarnet["totals"]["publico"], "33909.12")
        self.assertEqual(self.scenario("aciclovir_iv_250mg", 14)["consumo"][0]["unidades"],
                         math.ceil(700 / 250) * 3 * 14)
        self.assertEqual(self.scenario("ganciclovir_iv_500mg", 14)["consumo"][0]["unidades"],
                         math.ceil(350 / 500) * 2 * 14)

    def test_foscarnet_preserves_ata_reference_and_normalized_clearance_units(self):
        item = self.items["foscarnet_iv_24mg_ml_250ml"]
        self.assertEqual(item["status"], "PRECIFICADO_ARP_IMPORTACAO_2026")
        self.assertEqual(item["dataLista"], "2026-06-17")
        self.assertIsNone(item["capNovo"])
        self.assertEqual(item["unit"]["publico"], 605.52)
        self.assertEqual(urlsplit(item["fonte_url"]).hostname, "ioepa.com.br")
        drug = next(d for d in self.data["drugs"] if d["farmaco"].startswith("Foscarnet"))
        self.assertIn("mL/min/kg", drug["renal"])
        self.assertIn("<0,4: não recomendado", drug["renal"])
        induction = drug["renal"].split("Manutenção", 1)[0]
        doses = re.findall(r"(\d+)\s*mg/kg\s+IV\s+a cada\s+(\d+)\s*h", induction)
        self.assertEqual(doses[-6:], [("90", "12"), ("70", "12"), ("50", "12"),
                                           ("80", "24"), ("60", "24"), ("50", "24")])
        self.assertRegex(drug["infusao"], r"(?:≤|<=)\s*1\s*mg/kg/min")

    def test_flucytosine_clearance_20_boundary_uses_nih_interval(self):
        drug = next(d for d in self.data["drugs"] if d["farmaco"].startswith("Flucitosina"))
        bands = re.findall(r"(\d+)\s*[–-]\s*(\d+)\s*mL/min:\s*25\s*mg/kg\s+a cada\s*(\d+)\s*h", drug["renal"])
        intervals = {(int(low), int(high)): int(hours) for low, high, hours in bands}
        self.assertEqual(intervals, {(21, 40): 12, (10, 20): 24})
        for clearance, hours in ((10, 24), (20, 24), (21, 12), (40, 12)):
            matching = [interval for (low, high), interval in intervals.items() if low <= clearance <= high]
            self.assertEqual(matching, [hours])
        self.assertRegex(drug["renal"], r">40\s*mL/min:.*?a cada\s*6\s*h")
        self.assertRegex(drug["renal"], r"<10\s*mL/min:.*?a cada\s*48\s*h")
        self.assertTrue(any("clinicalinfo.hiv.gov" in u and "dosing-recommendations" in u for u in drug["fontes"]))

    def test_mixed_paxlovid_tablets_are_not_priced_as_identical_units(self):
        item = self.items["nirmatrelvir_ritonavir_dose_mista"]
        self.assertEqual(item["unidadesCaixa"], 10)  # 10 doses, not 30 interchangeable tablets.
        self.assertIn("2cp", item["unidade"].replace(" ", ""))
        scenario = self.scenario("nirmatrelvir_ritonavir_dose_mista", 5)
        self.assertEqual(scenario["consumo"][0]["unidades"], 10)
        self.assertEqual(scenario["totals"]["publico"], "3795.50")


class InfectologiaFrontendTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = load_catalog()
        cls.pages = [MODULE / "index.html"] + [MODULE / x["href"] for x in cls.data["readings"]]
        required = cls.pages + [MODULE / "assets/app.js", MODULE / "assets/styles.css", MODULE / "data/catalog.js"]
        missing = [str(p.relative_to(MODULE)) for p in required if not p.is_file()]
        if missing:
            raise AssertionError("Frontend obrigatório incompleto: " + ", ".join(missing))
        cls.parsed = {path: Page(path) for path in cls.pages}

    def test_public_builder_excludes_module_from_analytics_injection(self):
        # Parse the declaration without importing a build script or changing files.
        builder = ROOT / "scripts_admin/build_public_site.py"
        tree = ast.parse(builder.read_text(encoding="utf-8"))
        declarations = [node.value for node in tree.body if isinstance(node, ast.Assign)
                        and any(isinstance(target, ast.Name) and target.id == "ANALYTICS_EXCLUDED_PREFIXES"
                                for target in node.targets)]
        self.assertEqual(len(declarations), 1)
        prefixes = ast.literal_eval(declarations[0])
        self.assertIn(MODULE.relative_to(ROOT).as_posix() + "/", prefixes)
        for page, parsed in self.parsed.items():
            for script in parsed.scripts:
                with self.subTest(page=page.name, script=script):
                    self.assertFalse(urlsplit(script).scheme or urlsplit(script).netloc,
                                     "An external script contradicts the local CSP/no-telemetry module")

    def test_all_local_routes_assets_and_fragments_resolve_inside_site(self):
        for page, parsed in self.parsed.items():
            self.assertEqual(len(parsed.ids), len(set(parsed.ids)), f"Duplicate HTML IDs: {page}")
            for reference in parsed.references:
                url = urlsplit(reference)
                if url.scheme in ("https", "http"):
                    continue
                with self.subTest(page=page.name, href=reference):
                    self.assertFalse(url.scheme or url.netloc, "Unsupported local URL")
                    target = (page.parent / unquote(url.path)).resolve() if url.path else page.resolve()
                    self.assertTrue(target.is_relative_to(ROOT), "Local link escapes the site")
                    self.assertTrue(target.is_file(), str(target))
                    if url.fragment and target.suffix == ".html":
                        self.assertIn(unquote(url.fragment), Page(target).ids)

    def test_review_and_historical_notices_are_visible(self):
        for page, parsed in self.parsed.items():
            with self.subTest(page=page.name):
                self.assertIn("previa educacional", parsed.text)
                self.assertIn("revisao medica em andamento", parsed.text)
                self.assertTrue("nao substitui" in parsed.text or "nao validado como protocolo assistencial" in parsed.text)
        main = self.parsed[MODULE / "index.html"]
        for phrase in ("valores historicos", "nao um orcamento real", "09/10/2026", "18/10/2026"):
            self.assertIn(phrase, main.text)
        self.assertTrue(set(MODES).issubset(main.options))

    def test_main_filters_and_data_load_without_network_fetch(self):
        main = self.parsed[MODULE / "index.html"]
        self.assertTrue({"patogenos", "farmacos", "custos", "artigos", "leitura",
                         "pathogen-search", "pathogen-group", "drug-search", "drug-group",
                         "cost-mode", "cost-items", "cost-scenarios"}.issubset(main.ids))
        self.assertIn("data/catalog.js", main.scripts)
        self.assertIn("assets/app.js", main.scripts)
        self.assertIn("noscript", main.tags)

    def test_shipped_catalog_js_matches_catalog_json(self):
        text = (MODULE / "data/catalog.js").read_text(encoding="utf-8")
        match = re.search(r"window\.INFECTOLOGIA_UTI\s*=\s*(\{.*\})\s*;\s*$", text, re.S)
        self.assertIsNotNone(match, "Expected a local JSON data assignment")
        self.assertEqual(json.loads(match.group(1)), self.data)


if __name__ == "__main__":
    unittest.main()
