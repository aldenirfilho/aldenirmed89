"""Release contract for the adult ICU antimicrobial pocket guide.

The checked-in PDF is inspected with Poppler, which the Pages workflow installs.
Tests use no network, reportlab or pypdf and never regenerate the deliverable.
"""

import hashlib
import json
import re
import shutil
import subprocess
import tempfile
import unicodedata
import unittest
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
RELATIVE = Path("01_Modulos_Clinicos/Infectologia_Critica/resistencia-antimicrobianos")
MODULE = ROOT / RELATIVE
PDF_NAME = "Guia_Bolso_Antimicrobianos_UTI_2026-11-03_v1.pdf"
PDF = MODULE / "documentos" / PDF_NAME
DATA_RELATIVE = "data/guia_bolso_2026-11-03.json"
DOWNLOAD_RELATIVE = "data/guia_bolso_download.json"
EDITION = date(2026, 11, 3)
FIELDS = ("indicacoes", "dose", "renal", "interacoes", "monitorizacao", "alerta")


def normalized(value):
    value = unicodedata.normalize("NFKD", value).casefold()
    value = "".join(char for char in value if not unicodedata.combining(char))
    return " ".join(re.sub(r"[^a-z0-9]+", " ", value).split())


class Links(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.anchors = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        if tag.lower() == "a":
            self.anchors.append(dict(attrs))


class AntimicrobialPocketPdfTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads((MODULE / DATA_RELATIVE).read_text(encoding="utf-8"))
        cls.download = json.loads((MODULE / DOWNLOAD_RELATIVE).read_text(encoding="utf-8"))
        cls.drugs = cls.data["farmacos"]
        cls.pdf_bytes = PDF.read_bytes()
        cls._outputs = {}

    def poppler(self, tool, *args):
        executable = shutil.which(tool)
        self.assertIsNotNone(
            executable,
            f"{tool} is required for the release check. Install Poppler; Pages CI installs poppler-utils.",
        )
        key = (tool, *map(str, args))
        if key not in self._outputs:
            result = subprocess.run(
                [executable, *map(str, args)], capture_output=True, text=True,
                encoding="utf-8", errors="replace", timeout=90, check=False,
            )
            self.assertEqual(result.returncode, 0, f"{tool} failed: {result.stderr[-2000:]}")
            # Successful parsing must not conceal damaged-object warnings.
            self.assertNotRegex(result.stderr.casefold(), r"syntax error|damaged|couldn.t read xref")
            self._outputs[key] = result.stdout
        return self._outputs[key]

    def pdf_text(self):
        return self.poppler("pdftotext", "-layout", "-enc", "UTF-8", PDF, "-")

    def test_download_manifest_identifies_exact_version_and_binary(self):
        meta = self.download
        self.assertEqual(meta["href"], f"documentos/{PDF_NAME}")
        self.assertEqual(meta["data"], DATA_RELATIVE)
        self.assertEqual(meta["editionDate"], EDITION.isoformat())
        self.assertEqual(meta["format"], "PDF A6")
        self.assertEqual(meta["drugs"], 40)
        self.assertEqual(meta["clinicalReviewStatus"], "pending")
        self.assertGreaterEqual(meta["minimumClinicalFontPt"], 8.8)
        self.assertIsInstance(meta["pages"], int)
        self.assertGreater(meta["pages"], 0)
        self.assertEqual(meta["bytes"], len(self.pdf_bytes))
        self.assertRegex(meta["sha256"], r"^[0-9a-f]{64}$")
        self.assertEqual(meta["sha256"], hashlib.sha256(self.pdf_bytes).hexdigest())

    def test_pdf_is_complete_parseable_a6_and_has_expected_page_count(self):
        self.assertTrue(self.pdf_bytes.startswith(b"%PDF-"))
        self.assertTrue(self.pdf_bytes.rstrip().endswith(b"%%EOF"))
        info = self.poppler("pdfinfo", "-f", "1", "-l", self.download["pages"], "-box", PDF)
        pages = re.search(r"^Pages:\s*(\d+)\s*$", info, re.MULTILINE)
        self.assertIsNotNone(pages, info)
        self.assertEqual(int(pages.group(1)), self.download["pages"])
        sizes = re.findall(r"^Page(?:\s+\d+)?\s+size:\s*([\d.]+)\s*x\s*([\d.]+)\s+pts", info, re.MULTILINE)
        self.assertTrue(sizes, info)
        for width, height in sizes:
            self.assertAlmostEqual(float(width), 105 * 72 / 25.4, delta=1)
            self.assertAlmostEqual(float(height), 148 * 72 / 25.4, delta=1)

    def test_clinical_source_has_forty_unique_complete_records(self):
        self.assertEqual(len(self.drugs), 40)
        self.assertEqual(len({drug["id"] for drug in self.drugs}), 40)
        self.assertEqual(len({drug["nome"] for drug in self.drugs}), 40)
        groups = {normalized(drug["grupo"]) for drug in self.drugs}
        self.assertTrue({"antibioticos", "antifungicos", "antivirais"}.issubset(groups))
        for drug in self.drugs:
            with self.subTest(drug=drug["nome"]):
                for field in FIELDS:
                    self.assertIsInstance(drug[field], str)
                    self.assertTrue(drug[field].strip(), field)
                self.assertTrue(drug["fontes"], "Every drug requires its own traceable sources")
                for source in drug["fontes"]:
                    self.assertTrue(source["titulo"].strip())
                    self.assertTrue(source["secao"].strip())
                    self.assertRegex(source["consultado_em"], r"^\d{4}-\d{2}-\d{2}$")
                    self.assertLessEqual(date.fromisoformat(source["consultado_em"]), EDITION)
                    parsed = urlsplit(source["url"])
                    self.assertEqual(parsed.scheme, "https")
                    self.assertTrue(parsed.hostname)
                    self.assertIsNone(parsed.username)
                    self.assertIsNone(parsed.password)
                    self.assertNotIn(parsed.hostname, {"localhost", "127.0.0.1"})

    def test_public_source_contains_no_machine_paths_or_credential_values(self):
        body = (MODULE / DATA_RELATIVE).read_text(encoding="utf-8")
        self.assertNotIn("/Users/", body)
        self.assertNotIn("file://", body)
        self.assertNotRegex(body, r"\b(?:sk-proj-|sk_live_|ghp_)[A-Za-z0-9_-]{12,}")
        self.assertNotRegex(body, r"\bAKIA[A-Z0-9]{16}\b")
        self.assertNotRegex(body, r'(?i)"(?:password|api_key|access_token|secret_key)"\s*:\s*"[^\"]+"')

    def test_high_risk_renal_units_and_regimen_distinctions_survive_editing(self):
        def drug(name):
            return next(item for item in self.drugs if normalized(item['nome']).startswith(normalized(name)))
        fluc = drug('Flucitosina')
        self.assertIn('10-20: 25 mg/kg a cada 24 h', fluc['renal'])
        self.assertIn('mL/min/kg', drug('Foscarnet')['renal'])
        self.assertIn('MDRD', drug('Meropenem-vaborbactam')['renal'])
        self.assertIn('1,73', drug('Meropenem-vaborbactam')['renal'])
        ceft = drug('Ceftolozana-tazobactam')
        self.assertIn('BULA:', ceft['dose'])
        self.assertIn('IDSA para resistentes: 3 g', ceft['dose'])
        self.assertIn('ITU (1,5 g)', ceft['alerta'])

    def test_pdf_contains_all_drugs_clinical_sections_and_pending_notice(self):
        text = normalized(self.pdf_text())
        self.assertGreater(len(text), 10000)
        for drug in self.drugs:
            with self.subTest(drug=drug["nome"]):
                self.assertIn(normalized(drug["nome"]), text)
        for label in (r"indicac(?:ao|oes)", r"doses?", r"(?:renal|rim)", r"interac(?:ao|oes)", r"monitorizacao"):
            self.assertRegex(text, rf"\b{label}\b")
        self.assertRegex(text, r"revisao\s+(?:medica|clinica)[a-z ]{0,80}\bpendente\b")
        self.assertIn("nao substitui", text)
        self.assertIn("adultos", text)
        self.assertRegex(text, r"\b(?:fontes|referencias)\b")

    def test_pdf_retains_clickable_source_for_every_drug(self):
        html = self.poppler("pdftohtml", "-i", "-noframes", "-stdout", PDF)
        hrefs = {unquote(anchor.get("href", "")) for anchor in Links(html).anchors}
        for drug in self.drugs:
            with self.subTest(drug=drug["nome"]):
                sources = {unquote(source["url"]) for source in drug["fontes"]}
                self.assertTrue(sources & hrefs, f"No clickable source survived in PDF: {drug['nome']}")

    def test_html_exposes_a_real_local_download(self):
        anchors = Links((MODULE / "index.html").read_text(encoding="utf-8")).anchors
        matching = [anchor for anchor in anchors if anchor.get("href") == self.download["href"]]
        self.assertTrue(matching, "Visible module must link the versioned PDF")
        self.assertTrue(any("download" in anchor for anchor in matching))
        parsed = urlsplit(self.download["href"])
        self.assertEqual(parsed.scheme, "")
        self.assertEqual(parsed.netloc, "")
        target = (MODULE / unquote(parsed.path)).resolve()
        self.assertTrue(target.is_relative_to(MODULE.resolve()))
        self.assertEqual(target, PDF.resolve())
        self.assertTrue(target.is_file())

    def test_pdf_and_editable_sources_are_registered_as_cited_medical_content(self):
        registry = json.loads((ROOT / "data/editorial/registry.json").read_text(encoding="utf-8"))
        paths = [PDF.relative_to(ROOT).as_posix(), (RELATIVE / DATA_RELATIVE).as_posix(),
                 (RELATIVE / DOWNLOAD_RELATIVE).as_posix()]
        for path in paths:
            with self.subTest(path=path):
                entries = [item for item in registry["items"] if path in item.get("paths", [])]
                self.assertEqual(len(entries), 1, "Each release file needs one editorial owner")
                entry = entries[0]
                self.assertEqual(entry["classification"], "public-cited")
                self.assertIs(entry["medical"], True)
                self.assertIs(entry["ownerApproval"], True)
                self.assertEqual(entry["clinicalReviewStatus"], "pending")
                self.assertTrue(entry["sources"])

    def test_public_builder_keeps_the_approved_pdf_unchanged(self):
        from scripts_admin import build_public_site
        relative = PDF.relative_to(ROOT)
        with tempfile.TemporaryDirectory() as temporary:
            site = Path(temporary)
            build_public_site.copy_entry(ROOT, site, relative.as_posix(), set(), set())
            self.assertEqual((site / relative).read_bytes(), self.pdf_bytes)


if __name__ == "__main__":
    unittest.main()
