"""Release checks for the four-page adult ICU antimicrobial table summary.

Poppler is installed by Pages CI. No PDF generation or network access occurs.
The published 40-drug A6 guide remains an independent, immutable deliverable.
"""

import hashlib
import json
import re
import shutil
import subprocess
import tempfile
import unicodedata
import unittest
from collections import Counter
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
RELATIVE = Path("01_Modulos_Clinicos/Infectologia_Critica/resistencia-antimicrobianos")
MODULE = ROOT / RELATIVE
PDF_NAME = "Resumo_Antimicrobianos_UTI_Tabelas_2026-11-03_v1.pdf"
PDF = MODULE / "documentos" / PDF_NAME
DATA = "data/resumo_tabelas_2026-11-03.json"
DOWNLOAD = "data/resumo_tabelas_download.json"
SOURCE_DATA = "data/guia_bolso_2026-11-03.json"
SOURCE_HASH = "140d7668623547cfa638956321adcf9eec79f5c86609599bebcaaccb7aa654f9"
A6_PDF = MODULE / "documentos/Guia_Bolso_Antimicrobianos_UTI_2026-11-03_v1.pdf"
A6_HASH = "0bd6039c7e5e49207d943b2415c01db69a9fc75e1b0e2579ed2b1fad42c0015a"
EDITION = date(2026, 11, 3)
GROUP_COUNTS = {"Antibióticos": 16, "Antifúngicos": 6, "Antivirais": 4}
FIELDS = ("dose", "renal", "alerta")


def normalized(value):
    value = unicodedata.normalize("NFKD", value).casefold()
    value = "".join(char for char in value if not unicodedata.combining(char))
    return " ".join(re.sub(r"[^a-z0-9]+", " ", value).split())


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


class Links(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.anchors = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        if tag.casefold() == "a":
            self.anchors.append(dict(attrs))


class AntimicrobialShiftTablesPdfTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads((MODULE / DATA).read_text(encoding="utf-8"))
        cls.download = json.loads((MODULE / DOWNLOAD).read_text(encoding="utf-8"))
        cls.drugs = cls.data["farmacos"]
        cls.sections = cls.data["secoes"]
        cls.pdf_bytes = PDF.read_bytes()
        cls._outputs = {}

    def poppler(self, tool, *args):
        executable = shutil.which(tool)
        self.assertIsNotNone(executable, f"{tool} is required; Pages CI installs poppler-utils.")
        key = (tool, *map(str, args))
        if key not in self._outputs:
            result = subprocess.run(
                [executable, *map(str, args)], capture_output=True, text=True,
                encoding="utf-8", errors="replace", timeout=90, check=False,
            )
            self.assertEqual(result.returncode, 0, f"{tool}: {result.stderr[-2000:]}")
            self.assertNotRegex(result.stderr.casefold(), r"syntax error|damaged|couldn.t read xref")
            self._outputs[key] = result.stdout
        return self._outputs[key]

    def test_download_metadata_matches_the_versioned_binary_and_source(self):
        meta = self.download
        self.assertEqual(meta["schemaVersion"], "antimicrobial-shift-tables-download-v1")
        self.assertEqual(meta["editionDate"], EDITION.isoformat())
        self.assertEqual(meta["format"], "PDF A4 paisagem")
        self.assertEqual(meta["pages"], 4)
        self.assertEqual(meta["drugs"], 26)
        self.assertEqual(meta["groupCounts"], GROUP_COUNTS)
        self.assertGreaterEqual(meta["minimumClinicalFontPt"], 9.2)
        self.assertEqual(meta["clinicalReviewStatus"], "pending")
        self.assertEqual(meta["href"], f"documentos/{PDF_NAME}")
        self.assertEqual(meta["data"], DATA)
        self.assertEqual(meta["sourceData"], SOURCE_DATA)
        self.assertEqual(meta["sourceDataSha256"], SOURCE_HASH)
        self.assertEqual(meta["bytes"], len(self.pdf_bytes))
        self.assertRegex(meta["sha256"], r"^[0-9a-f]{64}$")
        self.assertEqual(meta["sha256"], sha256(PDF))

    def test_pdf_is_complete_and_all_four_pages_are_a4_landscape(self):
        self.assertTrue(self.pdf_bytes.startswith(b"%PDF-"))
        self.assertTrue(self.pdf_bytes.rstrip().endswith(b"%%EOF"))
        info = self.poppler("pdfinfo", "-f", "1", "-l", "4", "-box", PDF)
        count = re.search(r"^Pages:\s*(\d+)\s*$", info, re.MULTILINE)
        self.assertIsNotNone(count, info)
        self.assertEqual(int(count.group(1)), 4)
        sizes = re.findall(r"^Page\s+\d+\s+size:\s*([\d.]+)\s*x\s*([\d.]+)\s+pts", info, re.MULTILINE)
        self.assertEqual(len(sizes), 4, info)
        for width, height in sizes:
            self.assertAlmostEqual(float(width), 297 * 72 / 25.4, delta=1)
            self.assertAlmostEqual(float(height), 210 * 72 / 25.4, delta=1)

    def test_twenty_six_records_are_complete_cited_and_assigned_once(self):
        self.assertEqual(len(self.drugs), 26)
        by_id = {drug["id"]: drug for drug in self.drugs}
        self.assertEqual(len(by_id), 26)
        self.assertEqual(Counter(drug["grupo"] for drug in self.drugs), Counter(GROUP_COUNTS))
        self.assertEqual(len(self.sections), 4)
        self.assertEqual([len(section["ids"]) for section in self.sections], [8, 8, 6, 4])
        assigned = [drug_id for section in self.sections for drug_id in section["ids"]]
        self.assertEqual(Counter(assigned), Counter(by_id.keys()))
        self.assertEqual(len({section["id"] for section in self.sections}), 4)
        for section in self.sections:
            self.assertTrue(section["titulo"].strip())
            self.assertTrue(all(by_id[drug_id]["grupo"] == section["grupo"] for drug_id in section["ids"]))
        original_ids = {drug["id"] for drug in json.loads((MODULE / SOURCE_DATA).read_text())["farmacos"]}
        self.assertTrue(set(by_id).issubset(original_ids), "Summary drugs must be traceable to the full guide")
        for drug in self.drugs:
            with self.subTest(drug=drug["nome"]):
                self.assertTrue(drug["nome"].strip())
                for field in FIELDS:
                    self.assertIsInstance(drug[field], str)
                    self.assertTrue(drug[field].strip(), field)
                self.assertTrue(drug["fontes"])
                for source in drug["fontes"]:
                    self.assertTrue(source["titulo"].strip())
                    self.assertTrue(source["secao"].strip())
                    self.assertRegex(source["consultado_em"], r"^\d{4}-\d{2}-\d{2}$")
                    self.assertLessEqual(date.fromisoformat(source["consultado_em"]), EDITION)
                    url = urlsplit(source["url"])
                    self.assertEqual(url.scheme, "https")
                    self.assertTrue(url.hostname)
                    self.assertNotIn(url.hostname, {"localhost", "127.0.0.1"})
                    self.assertIsNone(url.username)
                    self.assertIsNone(url.password)

    def test_each_table_page_contains_its_drugs_and_clinical_headings(self):
        # Reading order keeps wrapped names together; geometric table layout
        # interleaves adjacent-column doses between a name's successive lines.
        raw = self.poppler("pdftotext", "-raw", "-enc", "UTF-8", PDF, "-")
        pages = [normalized(page) for page in raw.split("\f") if page.strip()]
        self.assertEqual(len(pages), 4)
        by_id = {drug["id"]: drug for drug in self.drugs}
        for number, (page, section) in enumerate(zip(pages, self.sections), 1):
            with self.subTest(page=number):
                self.assertGreater(len(page), 500)
                for drug_id in section["ids"]:
                    self.assertIn(normalized(by_id[drug_id]["nome"]), page, drug_id)
                    for field in FIELDS:
                        self.assertIn(normalized(by_id[drug_id][field]), page, f"{drug_id}: {field}")
                for label in (r"medicamentos?", r"doses?", r"(?:renal|rim)", r"atencao", r"fontes"):
                    self.assertRegex(page, rf"\b{label}\b")
                self.assertRegex(page, r"revisao\s+(?:medica|clinica)[a-z ]{0,80}\bpendente\b")
        self.assertIn("nao substitui", " ".join(pages))

    def test_pdf_has_a_clickable_reference_for_every_drug(self):
        html = self.poppler("pdftohtml", "-i", "-noframes", "-stdout", PDF)
        hrefs = {unquote(link.get("href", "")) for link in Links(html).anchors}
        for drug in self.drugs:
            with self.subTest(drug=drug["nome"]):
                sources = {unquote(source["url"]) for source in drug["fontes"]}
                self.assertTrue(sources & hrefs, "No drug reference survived as a PDF hyperlink")

    def test_module_exposes_the_versioned_local_download(self):
        anchors = Links((MODULE / "index.html").read_text(encoding="utf-8")).anchors
        matches = [anchor for anchor in anchors if anchor.get("href") == self.download["href"]]
        self.assertTrue(matches)
        self.assertTrue(any("download" in anchor for anchor in matches))
        url = urlsplit(self.download["href"])
        self.assertFalse(url.scheme or url.netloc)
        target = (MODULE / unquote(url.path)).resolve()
        self.assertTrue(target.is_relative_to(MODULE.resolve()))
        self.assertEqual(target, PDF.resolve())
        self.assertTrue(target.is_file())

    def test_summary_files_have_cited_medical_editorial_ownership(self):
        registry = json.loads((ROOT / "data/editorial/registry.json").read_text(encoding="utf-8"))
        paths = [PDF.relative_to(ROOT).as_posix(), (RELATIVE / DATA).as_posix(), (RELATIVE / DOWNLOAD).as_posix()]
        for path in paths:
            with self.subTest(path=path):
                items = [item for item in registry["items"] if path in item.get("paths", [])]
                self.assertEqual(len(items), 1)
                item = items[0]
                self.assertEqual(item["classification"], "public-cited")
                self.assertIs(item["medical"], True)
                self.assertIs(item["ownerApproval"], True)
                self.assertEqual(item["clinicalReviewStatus"], "pending")
                self.assertTrue(item["sources"])

    def test_public_builder_copies_the_summary_without_changing_its_bytes(self):
        from scripts_admin import build_public_site
        relative = PDF.relative_to(ROOT)
        with tempfile.TemporaryDirectory() as temporary:
            site = Path(temporary)
            build_public_site.copy_entry(ROOT, site, relative.as_posix(), set(), set())
            self.assertEqual((site / relative).read_bytes(), self.pdf_bytes)

    def test_original_full_guide_and_its_clinical_source_remain_unchanged(self):
        self.assertEqual(sha256(MODULE / SOURCE_DATA), SOURCE_HASH)
        self.assertEqual(sha256(A6_PDF), A6_HASH)


if __name__ == "__main__":
    unittest.main()
