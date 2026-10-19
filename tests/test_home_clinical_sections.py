"""Regressões da homepage: cartões clínicos convencionais e migração idempotente."""
from __future__ import annotations

import importlib.util
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "home_clinical_sections", ROOT / "scripts_admin/insert_haa_home_block.py"
)
assert SPEC and SPEC.loader
PATCHER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(PATCHER)


class HomeClinicalSectionsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.home = (ROOT / "index.html").read_text(encoding="utf-8")

    def test_clinical_cards_are_conventional_and_keep_direct_routes(self) -> None:
        PATCHER.validate(self.home)
        for anchor, route, color in (
            ("hepatite-alcool", PATCHER.HAA_ROUTE, "yellow"),
            ("doencas-geneticas", PATCHER.GENETICS_ROUTE, "violet"),
        ):
            with self.subTest(anchor=anchor):
                card = re.search(rf'<a id="{anchor}"[^>]*>.*?</a>', self.home, re.S)
                self.assertIsNotNone(card)
                self.assertIn(f'class="module-card mod-{color} reveal"', card.group())
                self.assertIn(f'href="{route}"', card.group())
        self.assertNotIn("🟠 Abrir Hepatologia HAA", self.home)
        self.assertNotIn("🟠 HAA · Maddrey · MELD · Lille", self.home)
        self.assertIn('<span class="module-tag">10 imagens</span>', self.home)
        self.assertIn("Noonan · rasopatias", self.home)

    def test_current_home_is_idempotent(self) -> None:
        self.assertEqual(PATCHER.patch_home(self.home), self.home)

    def test_legacy_feature_migrates_without_losing_print_contract(self) -> None:
        legacy = self.home.replace(
            PATCHER.HOME_MODULE_CARD,
            PATCHER.HOME_MODULE_CARD.replace('id="hepatite-alcool" ', "").replace(
                "module-card mod-yellow", "haa-discovery-module mod-yellow"
            ),
        ).replace(PATCHER.GENETICS_MODULE_CARD + "\n\n", "")
        legacy = legacy.replace(
            "/* ── FUTEBOL TOTAL",
            "/* haa-home-feature:v1 */\n.haa-home-feature{padding:20px}\n"
            "/* ── FUTEBOL TOTAL",
            1,
        ).replace(
            "<!-- ── CAMPO TOTAL",
            '<!-- haa-home-feature:v1 -->\n<section class="haa-home-feature" '
            'id="hepatite-alcool"><div>Antiga apresentação</div></section>\n'
            "<!-- ── CAMPO TOTAL",
            1,
        ).replace(".module-card p,.dsf-excerpt{", ".module-card p,.haa-discovery-module p,.dsf-excerpt{")
        legacy = legacy.replace(
            ".card,.module-card,.hema-cockpit", ".card,.module-card,.haa-discovery-module,.hema-cockpit"
        ).replace(
            f'href="{PATCHER.HAA_ROUTE}" class="accent"', 'href="#hepatite-alcool" class="accent"'
        )
        updated = PATCHER.patch_home(legacy)
        PATCHER.validate(updated)
        self.assertEqual(PATCHER.patch_home(updated), updated)
        self.assertIn(".module-card p,.dsf-excerpt{", updated)
        self.assertIn("-webkit-line-clamp:unset!important", updated)
        self.assertIn(".card,.module-card,.hema-cockpit", updated)
        self.assertIn("break-inside:avoid;page-break-inside:avoid", updated)
        self.assertIn(f'href="{PATCHER.HAA_ROUTE}" class="accent"', updated)

    def test_legacy_wrapper_and_workflow_only_normalize_home(self) -> None:
        wrapper = (ROOT / "scripts_admin/normalize_haa_discovery_card.py").read_text(encoding="utf-8")
        workflow = (ROOT / ".github/workflows/apply-haa-home-block.yml").read_text(encoding="utf-8")
        self.assertIn("from insert_haa_home_block import main", wrapper)
        self.assertIn("git add index.html\n", workflow)
        self.assertNotIn("v29", workflow)
        self.assertNotIn("haa-discovery-module", workflow)


if __name__ == "__main__":
    unittest.main()
