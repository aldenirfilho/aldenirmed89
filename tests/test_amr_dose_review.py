"""Regressões de segurança documental da revisão AMR de 18/10/2026.

Asserções locais preservam números, limites e referências já conferidos nas
fontes primárias; não certificam adequação clínica ou atualização futura.
"""

from html.parser import HTMLParser
from pathlib import Path
import re
import unittest
from urllib.parse import parse_qs, urlparse


ROOT = Path(__file__).resolve().parents[1]
MODULE = ROOT / "01_Modulos_Clinicos/Bacterias_Super_Resistentes/index.html"


class Element:
    def __init__(self, tag, attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []

    def text(self):
        parts = (child.text() if isinstance(child, Element) else child
                 for child in self.children)
        return re.sub(r"\s+", " ", " ".join(parts)).strip()

    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Element):
                yield from child.walk()


class ModuleParser(HTMLParser):
    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input",
            "link", "meta", "param", "source", "track", "wbr"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Element("document")
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        node = Element(tag, attrs)
        self.stack[-1].children.append(node)
        if tag not in self.VOID:
            self.stack.append(node)

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                break

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def links(node):
    return {item.attrs["href"] for item in node.walk()
            if item.tag == "a" and "href" in item.attrs}


class AmrDoseReviewTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        parser = ModuleParser()
        parser.feed(MODULE.read_text(encoding="utf-8"))
        cls.ids = {node.attrs["id"]: node for node in parser.root.walk()
                   if "id" in node.attrs}
        cls.rows = {}
        for row in cls.ids["doseBody"].walk():
            if row.tag != "tr":
                continue
            cells = [node for node in row.children
                     if isinstance(node, Element) and node.tag in {"th", "td"}]
            header = " ".join(part for part in cells[0].children
                              if isinstance(part, str)).strip()
            cls.rows[header] = (row, cells)

    def row(self, name):
        return self.rows[name][0]

    def notes(self, name):
        return self.rows[name][1][2].text()

    def test_ten_regimens_preserve_dose_components_and_intervals(self):
        expected = {
            "Ceftazidima-avibactam": ("2,5 g a cada 8 h", "2 g ceftazidima", "0,5 g avibactam"),
            "Meropenem-vaborbactam": ("4 g a cada 8 h", "2 g meropenem", "2 g vaborbactam"),
            "Imipenem-cilastatina-relebactam": ("1,25 g a cada 6 h", "500 mg + 500 mg + 250 mg"),
            "Aztreonam-avibactam": ("2,67 g uma vez", "2 + 0,67 g", "2 g a cada 6 h", "1,5 + 0,5 g"),
            "Ceftazidima-avibactam + aztreonam": ("2,5 g CAZ-AVI a cada 8 h", "2 g aztreonam a cada 8 h"),
            "Cefiderocol": ("2 g a cada 8 h",),
            "Ceftolozana-tazobactam": ("3 g a cada 8 h", "2 g ceftolozana", "1 g tazobactam"),
            "Sulbactam-durlobactam": ("2 g a cada 6 h", "1 g sulbactam", "1 g durlobactam"),
            "Ampicilina-sulbactam em alta dose": ("9 g da associação a cada 8 h", "6 g ampicilina", "3 g sulbactam"),
            "Meropenem": ("1–2 g a cada 8 h",),
        }
        self.assertEqual(set(self.rows), set(expected))
        for name, dose_tokens in expected.items():
            with self.subTest(drug=name):
                self.assertEqual(len(self.rows[name][1]), 3)
                dose = self.rows[name][1][1].text()
                for token in dose_tokens:
                    self.assertIn(token, dose)

    def test_aztreonam_avibactam_maintenance_is_timed_from_loading_start(self):
        row = self.row("Aztreonam-avibactam")
        self.assertIn("6 h após o início do ataque", row.text())
        self.assertIn("início a início da infusão", row.text())
        self.assertIn("Ataque e manutenção em 3 h", row.text())
        self.assertIn("#fonte-aztavi", links(row))

    def test_renal_boundaries_include_exactly_fifty_without_mixing_egfr(self):
        for name in ("Ceftazidima-avibactam", "Aztreonam-avibactam",
                     "Ceftolozana-tazobactam", "Meropenem"):
            with self.subTest(drug=name):
                self.assertRegex(self.notes(name), r"ajustar se (?:CrCl )?≤50 mL/min")
        vaborbactam = self.notes("Meropenem-vaborbactam")
        self.assertIn("eGFR ≥50 mL/min/1,73 m²", vaborbactam)
        self.assertIn("não são medidas intercambiáveis", vaborbactam)
        self.assertIn("CrCl ≥90 mL/min", self.notes("Imipenem-cilastatina-relebactam"))

    def test_augmented_clearance_has_different_cutoffs_for_two_agents(self):
        cefiderocol = self.notes("Cefiderocol")
        self.assertIn("CrCl 60–119 mL/min", cefiderocol)
        self.assertRegex(cefiderocol, r"≥120: 2 g a cada 6 h, em 3 h")
        sulbactam = self.notes("Sulbactam-durlobactam")
        self.assertIn("CrCl 45–129 mL/min", sulbactam)
        self.assertRegex(sulbactam, r"≥130: a cada 4 h")

    def test_cefiderocol_warning_retains_observation_and_uncertain_causality(self):
        row = self.row("Cefiderocol")
        self.assertIn("maior mortalidade por todas as causas", row.text())
        self.assertIn("foi observada em um estudo", row.text())
        self.assertIn("a causa não foi estabelecida", row.text())
        self.assertIn("CRAB requer estratégia combinada", row.text())
        self.assertIn("questão 5.3", row.text())
        self.assertTrue({"#fonte-cefiderocol", "#fonte-idsa"} <= links(row))
        self.assertIn("5.1–5.3", self.ids["fonte-idsa"].text())

    def test_fda_indications_are_distinguished_from_guidance_and_off_label_use(self):
        vaborbactam = self.notes("Meropenem-vaborbactam")
        self.assertIn("Indicação FDA: ITU complicada/pielonefrite em adultos", vaborbactam)
        self.assertIn("IDSA", vaborbactam)
        self.assertIn("fora de bula", vaborbactam)
        aztreonam = self.notes("Aztreonam-avibactam")
        for token in ("intra-abdominal complicada", "adultos", "alternativas limitadas ou ausentes",
                      "metronidazol", "fora da bula"):
            self.assertIn(token, aztreonam)
        self.assertIn("pneumonia hospitalar/VM por complexo A. baumannii-calcoaceticus",
                      self.notes("Sulbactam-durlobactam"))

    def test_label_and_optimized_infusion_times_remain_explicit(self):
        for name, label_time in (("Ceftazidima-avibactam", "bula: 2 h"),
                                 ("Ceftolozana-tazobactam", "bula pneumonia: 1 h")):
            with self.subTest(drug=name):
                self.assertIn("3 h pela IDSA", self.notes(name))
                self.assertIn(label_time, self.notes(name))
        self.assertIn("30 min", self.notes("Imipenem-cilastatina-relebactam"))
        self.assertIn("1,5 g", self.notes("Ceftolozana-tazobactam"))

    def test_high_dose_sulbactam_preserves_daily_total_and_separate_renal_protocol(self):
        row = self.row("Ampicilina-sulbactam em alta dose")
        for token in ("27 g/dia da associação = 9 g/dia de sulbactam", "fora da bula FDA",
                      "ponte no CRAB", "4 g/dia", "protocolo renal específico", "4 h pela IDSA"):
            self.assertIn(token, row.text())
        self.assertTrue({"#fonte-doses", "#fonte-unasyn"} <= links(row))

    def test_combination_has_independent_renal_sources_and_simultaneous_infusions(self):
        row = self.row("Ceftazidima-avibactam + aztreonam")
        for token in ("Ambos em 3 h, simultâneos", "Ajustar cada fármaco separadamente",
                      "regras renais próprias", "Não equivale ao produto fixo"):
            self.assertIn(token, row.text())
        self.assertTrue({"#fonte-doses", "#fonte-cazavi", "#fonte-azactam"} <= links(row))
        self.assertIn("#fonte-merrem", links(self.row("Meropenem")))

    def test_corrections_resolve_to_the_primary_sources_actually_reviewed(self):
        labels = {
            "fonte-cazavi": "d9c2803f-dc9c-4b19-b4a3-8303bc8c15fd",
            "fonte-merovabo": "e237fd0f-3050-42a3-b43e-b6fb4824e93d",
            "fonte-imirele": "be32f468-738b-40df-a425-591e12f65159",
            "fonte-aztavi": "be1a6c99-d4b3-46d7-9e99-6e5f9fab556a",
            "fonte-cefiderocol": "75c0c785-38e0-4049-a6fb-b77581f5b35c",
            "fonte-ceftolozana": "70ac1d90-eff3-4f0b-9f46-5846c571b32f",
            "fonte-suldur": "c0167aec-a89d-4e96-afe5-2ccf3e89fe72",
            "fonte-azactam": "9a105eaf-ee77-4016-beeb-d425a5565db2",
            "fonte-unasyn": "155c7ec0-5862-404f-b1d0-f278f8a8bbda",
        }
        for source, setid in labels.items():
            with self.subTest(source=source):
                urls = [urlparse(url) for url in links(self.ids[source])]
                self.assertTrue(any(url.scheme == "https" and url.hostname == "dailymed.nlm.nih.gov"
                                    and parse_qs(url.query).get("setid") == [setid] for url in urls))
        self.assertIn("https://labeling.pfizer.com/ShowLabeling.aspx?id=9318",
                      links(self.ids["fonte-merrem"]))
        self.assertIn("https://www.idsociety.org/globalassets/idsa/practice-guidelines/amr-guidance/5.0/table-1.pdf",
                      links(self.ids["fonte-doses"]))
        for row, _cells in self.rows.values():
            for href in links(row):
                if href.startswith("#"):
                    self.assertIn(href[1:], self.ids, f"Referência de dose ausente: {href}")


if __name__ == "__main__":
    unittest.main()
