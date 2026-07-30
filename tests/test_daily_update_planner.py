"""Contratos do planejador diário Antigravity."""

from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
import unittest
from datetime import date, datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts_admin" / "plan_daily_updates.py"
CONFIG = ROOT / "data" / "editorial" / "daily-update-rotation.json"
GUIDE = ROOT / "docs_usuario" / "ROTINA_DIARIA_30_MIN.md"

SPEC = importlib.util.spec_from_file_location("plan_daily_updates", SCRIPT)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("plan_daily_updates.py indisponível")
PLANNER = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = PLANNER
SPEC.loader.exec_module(PLANNER)


class DailyUpdatePlannerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.config = json.loads(CONFIG.read_text(encoding="utf-8"))
        PLANNER.validate_config(ROOT, cls.config)
        cls.last_updates = {
            item["id"]: date(2026, 7, 20)
            for item in cls.config["sections"]
        }

    def test_config_has_three_balanced_lanes_under_thirty_minutes(self) -> None:
        self.assertEqual(len(self.config["lanes"]), 3)
        total = sum(lane["minutes"] for lane in self.config["lanes"])
        total += self.config["validationMinutes"]
        self.assertEqual(total, self.config["maxMinutes"])
        self.assertEqual(total, 29)
        self.assertEqual(
            {lane["id"] for lane in self.config["lanes"]},
            {"clinica-temi", "estudo-ativo", "portal-vivo"},
        )

    def test_plan_is_deterministic_and_selects_one_section_per_lane(self) -> None:
        first = PLANNER.generate_schedule(
            self.config,
            start=date(2026, 7, 29),
            days=1,
            last_updates=self.last_updates,
        )
        second = PLANNER.generate_schedule(
            self.config,
            start=date(2026, 7, 29),
            days=1,
            last_updates=self.last_updates,
        )
        self.assertEqual(first, second)
        plan = first[0]
        self.assertEqual(plan["totalMinutes"], 29)
        self.assertEqual(len(plan["selections"]), 3)
        self.assertEqual(
            {item["laneId"] for item in plan["selections"]},
            {"clinica-temi", "estudo-ativo", "portal-vivo"},
        )

    def test_seven_day_forecast_avoids_repeats_within_each_lane(self) -> None:
        plans = PLANNER.generate_schedule(
            self.config,
            start=date(2026, 7, 29),
            days=7,
            last_updates=self.last_updates,
        )
        by_lane: dict[str, list[str]] = {}
        for plan in plans:
            for item in plan["selections"]:
                by_lane.setdefault(item["laneId"], []).append(item["sectionId"])
        for lane_id, selected in by_lane.items():
            self.assertEqual(
                len(selected),
                len(set(selected)),
                f"repetição precoce na trilha {lane_id}",
            )

    def test_recent_git_update_loses_priority_to_safe_alternative(self) -> None:
        section_id = "calculadoras-clinicas"
        updated = dict(self.last_updates)
        updated[section_id] = date(2026, 7, 29)
        plans = PLANNER.generate_schedule(
            self.config,
            start=date(2026, 7, 29),
            days=1,
            last_updates=updated,
        )
        chosen = {
            item["sectionId"] for item in plans[0]["selections"]
        }
        self.assertNotIn(section_id, chosen)

    def test_markdown_exposes_timebox_routes_and_safety_gate(self) -> None:
        plans = PLANNER.generate_schedule(
            self.config,
            start=date(2026, 7, 29),
            days=1,
            last_updates=self.last_updates,
        )
        markdown = PLANNER.render_markdown(plans)
        self.assertIn("máximo de 29 minutos", markdown)
        self.assertIn("Tempo total:** 29 minutos", markdown)
        self.assertIn("paciente e plantão têm prioridade", markdown)
        self.assertIn("zero dados identificáveis", markdown)
        self.assertIn("Radar Diário", markdown)
        self.assertIn("Portal Vivo", markdown)
        self.assertIn("Não ampliar o escopo", markdown)
        for item in plans[0]["selections"]:
            self.assertIn(item["route"], markdown)

    def test_fortaleza_date_is_used_near_utc_midnight(self) -> None:
        self.assertEqual(
            PLANNER.fortaleza_today(
                datetime(2026, 7, 29, 1, 30, tzinfo=timezone.utc)
            ),
            date(2026, 7, 28),
        )

    def test_cli_is_read_only_and_supports_json_forecast(self) -> None:
        before = subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        ).stdout
        completed = subprocess.run(
            [
                sys.executable,
                str(SCRIPT),
                "--root",
                str(ROOT),
                "--date",
                "2026-07-29",
                "--days",
                "7",
                "--format",
                "json",
            ],
            cwd=ROOT,
            check=False,
            capture_output=True,
            text=True,
        )
        after = subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        ).stdout
        self.assertEqual(completed.returncode, 0, completed.stderr)
        payload = json.loads(completed.stdout)
        self.assertEqual(len(payload["plans"]), 7)
        self.assertEqual(before, after)

    def test_guide_requires_codex_choice_and_clinical_review(self) -> None:
        guide = GUIDE.read_text(encoding="utf-8")
        for expected in (
            "O Codex escolhe automaticamente",
            "Total máximo: 29 minutos",
            "Execute a Rotina Antigravity de hoje",
            "fonte primária ou diretriz oficial",
            "não publica nada sozinho",
            "assistência",
            "revisão clínica humana",
        ):
            self.assertIn(expected, guide)


if __name__ == "__main__":
    unittest.main()
