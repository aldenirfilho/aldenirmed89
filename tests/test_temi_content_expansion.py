import json
import subprocess
import unittest
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def load_json(relative_path):
    return json.loads((ROOT / relative_path).read_text(encoding="utf-8"))


def load_javascript_bank():
    bank_path = ROOT / "questoes" / "data" / "qbank_temi_abcde.js"
    loader = """
const fs = require("fs");
const vm = require("vm");
const source = fs.readFileSync(process.argv[1], "utf8");
const payload = vm.runInNewContext(
  source + "\\n;JSON.stringify(TEMI_ABCDE_QBANK);",
  {},
  { filename: process.argv[1], timeout: 3000 }
);
process.stdout.write(payload);
"""
    result = subprocess.run(
        ["node", "-e", loader, str(bank_path)],
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


class TemiContentExpansionTests(unittest.TestCase):
    def test_mnemonic_pack_has_at_least_fifty_safe_unique_entries(self):
        pack = load_json("11_MNEMONICOS/catalogo_uti_clinica_50.json")
        entries = pack["mnemonicos"]
        source_ids = set(pack["sources"])

        self.assertGreaterEqual(len(entries), 50)
        self.assertEqual(pack["destination"].split("—", 1)[0].strip(), "Estação Radar Diário")
        self.assertFalse(pack["editorial"]["patientData"])
        self.assertEqual(pack["editorial"]["status"], "revisao-medica-pendente")
        self.assertEqual(len({item["id"] for item in entries}), len(entries))

        for item in entries:
            self.assertTrue(item["title"].strip())
            self.assertTrue(item["letters"])
            self.assertTrue(item["content"].strip())
            self.assertTrue(set(item.get("sourceRefs", [])).issubset(source_ids))

        generated = load_json("data/mnemonicos.json")
        self.assertGreaterEqual(len(generated["mnemonicos"]), 55)
        self.assertEqual(
            len({item["id"] for item in generated["mnemonicos"]}),
            len(generated["mnemonicos"]),
        )

    def test_challenge_pack_has_twenty_per_requested_branch(self):
        pack = load_json("10_DESAFIOS/catalogo_expansao_40.json")
        source_ids = set(pack["sources"])

        self.assertGreaterEqual(len(pack["temi"]), 20)
        self.assertGreaterEqual(len(pack["r3"]), 20)
        self.assertFalse(pack["editorial"]["patientData"])
        all_entries = pack["temi"] + pack["r3"]
        self.assertEqual(len({item["id"] for item in all_entries}), len(all_entries))

        for item in all_entries:
            self.assertIn("## Caso", item["content"])
            self.assertIn("### ✅ Gabarito comentado", item["content"])
            self.assertTrue(set(item.get("sourceRefs", [])).issubset(source_ids))

        generated = load_json("data/desafios.json")
        self.assertGreaterEqual(len(generated["temi"]), 24)
        self.assertGreaterEqual(len(generated["r3"]), 20)
        generated_entries = generated["temi"] + generated["r3"]
        self.assertEqual(
            len({item["id"] for item in generated_entries}),
            len(generated_entries),
        )

    def test_question_bank_has_fifty_questions_and_full_abcde_comments(self):
        bank = load_javascript_bank()
        questions = bank["questions"]
        expected_letters = {"A", "B", "C", "D", "E"}
        expected_blocks = {"POCUS", "VM", "IOT", "DVA", "SEPSE"}
        counts = Counter(item["block"] for item in questions)
        source_ids = set(bank["sources"])

        self.assertEqual(len(questions), 50)
        self.assertEqual(counts, Counter({block: 10 for block in expected_blocks}))
        self.assertEqual(len({item["id"] for item in questions}), 50)
        self.assertFalse(bank["meta"]["patientData"])
        self.assertEqual(bank["meta"]["status"], "revisao-medica-pendente")

        for question in questions:
            self.assertEqual(set(question["options"]), expected_letters)
            self.assertEqual(set(question["rationales"]), expected_letters)
            self.assertIn(question["answer"], expected_letters)
            self.assertTrue(question["synthesis"].strip())
            self.assertTrue(question["pearl"].strip())
            self.assertTrue(question["sourceRefs"])
            self.assertTrue(set(question["sourceRefs"]).issubset(source_ids))

        for source in bank["sources"].values():
            self.assertTrue(source["url"].startswith("https://"))

    def test_question_experience_is_linked_and_offline_friendly(self):
        page = (ROOT / "questoes" / "temi_abcde_questoes.html").read_text(encoding="utf-8")
        hub = (ROOT / "questoes" / "data" / "hub_qbanks.js").read_text(encoding="utf-8")
        home = (ROOT / "index.html").read_text(encoding="utf-8")

        self.assertIn('src="data/qbank_temi_abcde.js"', page)
        self.assertIn("Revelar ABCDE", page)
        self.assertIn("localStorage", page)
        self.assertIn("temi_abcde_questoes.html", hub)
        self.assertIn('"questions": 50', hub)
        self.assertIn("80+", home)


if __name__ == "__main__":
    unittest.main()
