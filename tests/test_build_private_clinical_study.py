"""Proveniência e preservação do gerador privado; apenas documentos sintéticos."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts_admin"))
import build_private_clinical_study as study

FACT = "A sepse é uma disfunção orgânica ameaçadora à vida associada a uma resposta desregulada à infecção."


def row(**changes):
    value = {"id": "synthetic-1", "sourceName": "PDF", "path": "sepse.pdf", "relativePath": "sepse.pdf", "size": 1500,
             "modifiedNs": 1700000000000000000, "theme": "sepse-choque", "themeLabel": "Sepse e choque", "labels": [],
             "sha256": "a" * 64, "metadataStable": True, "status": "ready-candidate", "factualEligible": True,
             "privacyTriage": {"status": "noPatientRecordSignals"},
             "didacticSegments": [{"kind": "pdf-page", "pageNumber": 8, "text": FACT}]}
    value.update(changes)
    return value


def build(*rows):
    return study.build_package({"documents": list(rows)}, [])


class PrivateClinicalGenerationTests(unittest.TestCase):
    def test_statement_card_and_source_share_actual_physical_page(self):
        package, report = build(row())
        unit = package["units"][0]
        self.assertEqual(unit["particles"][0]["text"], FACT)
        self.assertEqual(unit["particles"][0]["locator"], {"pages": [8], "paragraphs": []})
        self.assertEqual(unit["cards"][0]["locator"], unit["particles"][0]["locator"])
        self.assertIn("[…]", unit["cards"][0]["front"])
        self.assertEqual(package["sources"][0]["coverage"]["pages"], [8])
        self.assertFalse(report["fullWorksSummarized"])

    def test_docx_uses_real_xml_paragraph_and_converted_text_uses_lines(self):
        for segment, expected in [
            ({"kind": "xml-paragraph", "paragraphNumber": 19, "text": FACT}, {"pages": [], "paragraphs": [19]}),
            ({"kind": "converted-text-lines", "startLine": 30, "text": FACT + "\n\n"}, {"pages": [], "paragraphs": [], "lines": [30]}),
        ]:
            with self.subTest(segment=segment["kind"]):
                package, _ = build(row(sourceName="DOC 2026", path="sintetico.docx", didacticSegments=[segment]))
                self.assertEqual(package["units"][0]["particles"][0]["locator"], expected)
                self.assertEqual(package["sources"][0]["slot"], "doc")

    def test_english_source_keeps_its_literal_statement_and_grounded_card(self):
        text = "Heart failure is a clinical syndrome associated with structural or functional cardiac abnormalities."
        package, _ = build(row(didacticSegments=[{"kind": "pdf-page", "pageNumber": 4, "text": text}]))
        self.assertEqual(package["units"][0]["particles"][0]["text"], text)
        self.assertIn("[…]", package["units"][0]["cards"][0]["front"])
        front, _ = study._card("A asma é uma condição inflamatória; plasma é outra palavra e deve permanecer intacta.")
        self.assertIn("[…]", front)
        self.assertIn("plasma", front)

    def test_no_fake_anchor_or_unknown_prefix_upper_bound(self):
        for segment in [
            {"kind": "pdf-page", "pageNumber": 0, "text": FACT},
            {"kind": "pdf-page", "pageNumber": True, "text": FACT},
            {"kind": "pdf-page-range", "pageNumbers": [1, 1], "text": FACT},
            {"kind": "pdf-page-range", "pageNumbers": [1, 2], "rangeIsPrefixUpperBound": True, "text": FACT},
        ]:
            with self.subTest(segment=segment):
                package, _ = build(row(didacticSegments=[segment]))
                self.assertEqual(package["units"], [])
        package, _ = build(row(didacticSegments=[{"kind": "pdf-page-range", "pageNumbers": [1, 2], "text": FACT}]))
        self.assertEqual(package["units"][0]["particles"][0]["locator"]["pages"], [1, 2])

    def test_reflows_pdf_lines_and_rejects_unfinished_or_dependent_fragments(self):
        wrapped = FACT.replace("ameaçadora à vida", "ameaçadora\nà vida")
        package, _ = build(row(didacticSegments=[{"kind": "pdf-page", "pageNumber": 8, "text": wrapped}]))
        self.assertEqual(package["units"][0]["particles"][0]["text"], FACT)
        for text in [FACT[:-1] + ":", "Além disso, " + FACT, FACT[:-1] + " —", FACT[:-1] + "?",
                     "Quais doenças são associadas à insuficiência cardíaca e ao risco renal",
                     "O professor da faculdade é especialista em sepse e choque com disfunção orgânica."]:
            self.assertEqual(study.select_facts(row(didacticSegments=[{"kind": "pdf-page", "pageNumber": 8, "text": text}])), [])

    def test_exam_without_comment_quarantine_and_insufficient_never_become_facts(self):
        for r in [row(status="exam-only", factualEligible=False), row(status="insufficient-content", factualEligible=False),
                  row(privacyTriage={"status": "quarantinedPII"}), row(status="quarantinedPII", factualEligible=False)]:
            with self.subTest(status=r["status"]):
                package, _ = build(r)
                self.assertEqual(package["units"], [])
                if r["status"] == "quarantinedPII" or r["privacyTriage"]["status"] == "quarantinedPII":
                    self.assertEqual(package["sources"][0]["rights"], "blocked")
                    self.assertNotEqual(package["sources"][0]["path"], r["path"])
                    self.assertTrue(package["sources"][0]["path"].startswith("quarentena/identificacao-restrita-"))

    def test_no_patient_identifier_metadata_dose_or_choice_as_fact(self):
        for text in ["A) " + FACT, "Nome do paciente: Exemplo Sintético. " + FACT,
                     "A sepse é tratada sempre com dose de 100 mg, segundo a alternativa incorreta."]:
            with self.subTest(text=text):
                package, _ = build(row(didacticSegments=[{"kind": "pdf-page", "pageNumber": 8, "text": text}]))
                self.assertEqual(package["units"], [])
        package, _ = build(row(didacticSegments=[{"kind": "pdf-page", "pageNumber": 8, "text": "Licensed to exemplo. " + FACT}]))
        self.assertEqual(package["units"][0]["particles"][0]["text"], FACT)

    def test_dedup_requires_whole_file_hash_and_same_passages(self):
        a = row()
        b = row(id="synthetic-2", path="outra-copia.pdf")
        same, _ = build(a, b)
        self.assertEqual(len(same["units"]), 1)
        self.assertEqual(len(same["units"][0]["sourceIds"]), 2)
        b["sha256"] = "b" * 64
        different, _ = build(a, b)
        self.assertEqual(len(different["units"]), 2)
        b.pop("sha256"); a.pop("sha256")
        unknown, _ = build(a, b)
        self.assertEqual(len(unknown["units"]), 2)

    def test_changed_source_fails_closed_and_waiting_coverage_is_explicit(self):
        for flag in ["metadataCurrent", "manifestCurrent", "metadataStable"]:
            with self.subTest(flag=flag), self.assertRaisesRegex(ValueError, "source-changed"):
                build(row(**{flag: False}))
        package, report = build(row(status="awaiting-extraction", factualEligible=False))
        self.assertEqual(report["coverage"], {"pending": 1})
        self.assertEqual(package["sources"][0]["coverage"]["pages"], [])

    def test_original_bytes_and_metadata_unchanged_private_outputs_exclusive(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp); original = root / "original.pdf"; original.write_bytes(b"ORIGINAL_SYNTHETIC")
            before = (original.stat().st_size, original.stat().st_mtime_ns, hashlib.sha256(original.read_bytes()).hexdigest())
            package, report = build(row())
            output = root / "private"; study.write_private(output, package, report)
            self.assertEqual((output.stat().st_mode & 0o777), 0o700)
            self.assertEqual((output / "estudo-clinico-360x.json").stat().st_mode & 0o777, 0o600)
            self.assertEqual(json.loads((output / "estudo-clinico-360x.json").read_text()), package)
            with self.assertRaisesRegex(ValueError, "private-new-output-required"):
                study.write_private(output, package, report)
            self.assertEqual(before, (original.stat().st_size, original.stat().st_mtime_ns, hashlib.sha256(original.read_bytes()).hexdigest()))
            with self.assertRaisesRegex(ValueError, "private-new-output-required"):
                study.write_private(ROOT / "forbidden-private-output", package, report)
            alias = root / "repository-alias"; alias.symlink_to(ROOT, target_is_directory=True)
            with self.assertRaisesRegex(ValueError, "private-new-output-required"):
                study.write_private(alias / "forbidden-private-output", package, report)
            broken = root / "broken"; broken.symlink_to(root / "missing")
            with self.assertRaisesRegex(ValueError, "private-new-output-required"):
                study.write_private(broken, package, report)

    def test_racing_destination_is_never_overwritten(self):
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "racing"
            exclusive = study._rename_exclusive
            def race(source, destination):
                target.mkdir(); (target / "user.txt").write_text("PRESERVE")
                return exclusive(source, destination)
            with patch.object(study, "_rename_exclusive", side_effect=race), self.assertRaises(OSError):
                study.write_private(target, *build(row()))
            self.assertEqual((target / "user.txt").read_text(), "PRESERVE")
            self.assertEqual(list(Path(tmp).glob(".clinical-study-stage-*")), [])

    def test_generated_package_passes_public_exact_schema(self):
        node = shutil.which("node"); self.assertIsNotNone(node)
        package, _ = build(row())
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "synthetic.json"; path.write_text(json.dumps(package))
            module = (ROOT / "02_Biblioteca_IA_Engine/assets/private-study-schema.mjs").as_uri()
            code = "import fs from 'node:fs';import{validatePrivateStudyPackage}from'" + module + "';validatePrivateStudyPackage(JSON.parse(fs.readFileSync(process.argv[1],'utf8')));"
            result = subprocess.run([node, "--input-type=module", "-e", code, str(path)], capture_output=True, text=True, timeout=20)
            self.assertEqual(result.returncode, 0, result.stderr)


if __name__ == "__main__":
    unittest.main()
