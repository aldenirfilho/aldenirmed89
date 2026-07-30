"""Contratos do planejador diário Antigravity."""

from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
import unittest
from collections import Counter
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

    def test_config_has_three_quality_lanes_in_sixty_minutes(self) -> None:
        self.assertEqual(len(self.config["lanes"]), 3)
        total = sum(lane["minutes"] for lane in self.config["lanes"])
        total += sum(
            item["minutes"] for item in self.config["continuousPulse"]
        )
        total += self.config["validationMinutes"]
        self.assertEqual(total, self.config["maxMinutes"])
        self.assertEqual(total, 60)
        self.assertEqual(self.config["validationMinutes"], 8)
        self.assertEqual(
            sum(item["minutes"] for item in self.config["continuousPulse"]),
            10,
        )
        self.assertEqual(
            {item["id"] for item in self.config["continuousPulse"]},
            {
                "radar-diario-continuo",
                "integridade-continua",
                "portal-vivo-continuo",
            },
        )
        self.assertEqual(
            {lane["id"] for lane in self.config["lanes"]},
            {"conteudo-temi", "design-tdah", "performance-qualidade"},
        )
        self.assertEqual(
            self.config["selectionPolicy"]["mode"],
            "balanced-deterministic-random",
        )
        evolution = self.config["continuousEvolution"]
        self.assertEqual(evolution["mode"], "weekly-expansion-sprint")
        self.assertEqual(evolution["expansionWeekday"], 4)
        self.assertEqual(evolution["cycleWeeks"], 6)
        self.assertEqual(len(evolution["stages"]), 6)
        self.assertEqual(len(evolution["candidates"]), 8)
        self.assertEqual(
            {candidate["type"] for candidate in evolution["candidates"]},
            {"app", "section"},
        )
        minimum = self.config["selectionPolicy"]["minimumSectionsPerLane"]
        for lane in self.config["lanes"]:
            self.assertGreaterEqual(
                sum(
                    section["lane"] == lane["id"]
                    for section in self.config["sections"]
                ),
                minimum,
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
        self.assertEqual(plan["totalMinutes"], 60)
        self.assertEqual(len(plan["selections"]), 3)
        self.assertEqual(
            {item["laneId"] for item in plan["selections"]},
            {"conteudo-temi", "design-tdah", "performance-qualidade"},
        )
        self.assertEqual(
            {item["qualityFocus"] for item in plan["selections"]},
            {"conteúdo", "design", "performance"},
        )
        self.assertTrue(
            all(item["definitionOfDone"] for item in plan["selections"])
        )
        routes = [
            item["route"].split("#", 1)[0]
            for item in plan["selections"]
        ]
        self.assertEqual(len(routes), len(set(routes)))
        continuous_routes = {
            item["route"].split("#", 1)[0]
            for item in plan["continuousPulse"]
        }
        self.assertTrue(continuous_routes.isdisjoint(routes))

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
        baseline = PLANNER.generate_schedule(
            self.config,
            start=date(2026, 7, 29),
            days=1,
            last_updates=self.last_updates,
        )
        section_id = baseline[0]["selections"][0]["sectionId"]
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

    def test_forty_two_day_window_stays_homogeneous_per_lane(self) -> None:
        plans = PLANNER.generate_schedule(
            self.config,
            start=date(2026, 7, 29),
            days=42,
            last_updates=self.last_updates,
        )
        counts: dict[str, Counter[str]] = {}
        for plan in plans:
            continuous_routes = {
                item["route"].split("#", 1)[0]
                for item in plan["continuousPulse"]
            }
            selected_routes = {
                item["route"].split("#", 1)[0]
                for item in plan["selections"]
            }
            self.assertTrue(continuous_routes.isdisjoint(selected_routes))
            for item in plan["selections"]:
                if item["kind"] != "maintenance":
                    continue
                counts.setdefault(item["laneId"], Counter())[
                    item["sectionId"]
                ] += 1
        for lane in self.config["lanes"]:
            lane_counts = counts[lane["id"]]
            expected_ids = {
                section["id"]
                for section in self.config["sections"]
                if section["lane"] == lane["id"]
            }
            self.assertEqual(set(lane_counts), expected_ids)
            self.assertLessEqual(
                max(lane_counts.values()) - min(lane_counts.values()),
                2,
                f"cobertura desigual na trilha {lane['id']}: {lane_counts}",
            )

    def test_friday_expansion_advances_one_candidate_over_six_weeks(self) -> None:
        plans = PLANNER.generate_schedule(
            self.config,
            start=date(2026, 7, 31),
            days=43,
            last_updates=self.last_updates,
        )
        fridays = [
            plan
            for plan in plans
            if date.fromisoformat(plan["date"]).weekday() == 4
        ]
        self.assertEqual(len(fridays), 7)
        self.assertEqual(
            {
                plan["expansionSprint"]["candidate"]["id"]
                for plan in fridays[:6]
            },
            {"sepse-choque-turbo"},
        )
        self.assertEqual(
            [plan["expansionSprint"]["week"] for plan in fridays[:6]],
            [1, 2, 3, 4, 5, 6],
        )
        self.assertEqual(
            fridays[6]["expansionSprint"]["candidate"]["id"],
            "aki-trs-turbo",
        )
        self.assertEqual(fridays[6]["expansionSprint"]["week"], 1)
        for plan in fridays:
            self.assertEqual(plan["planMode"], "weekly-expansion-sprint")
            self.assertEqual(
                {item["kind"] for item in plan["selections"]},
                {"expansion"},
            )
            self.assertEqual(
                sum(item["minutes"] for item in plan["selections"]),
                42,
            )
            self.assertEqual(
                {item["laneId"] for item in plan["selections"]},
                {"conteudo-temi", "design-tdah", "performance-qualidade"},
            )

    def test_markdown_exposes_timebox_routes_and_safety_gate(self) -> None:
        plans = PLANNER.generate_schedule(
            self.config,
            start=date(2026, 7, 30),
            days=2,
            last_updates=self.last_updates,
        )
        queue = PLANNER.project_expansion_queue(
            self.config,
            reference=date(2026, 7, 30),
        )
        markdown = PLANNER.render_markdown(plans, queue)
        self.assertIn("60 minutos", markdown)
        self.assertIn("Tempo total:** 60 minutos", markdown)
        self.assertIn("balanced-deterministic-random", markdown)
        self.assertIn("Pilar:** conteúdo", markdown)
        self.assertIn("Pilar:** design", markdown)
        self.assertIn("Pilar:** performance", markdown)
        self.assertIn("Pronto quando", markdown)
        self.assertIn("Regra TDAH", markdown)
        self.assertIn("Pulso contínuo diário", markdown)
        self.assertIn("Radar Diário", markdown)
        self.assertIn("Integridade e privacidade", markdown)
        self.assertIn("paciente e plantão têm prioridade", markdown)
        self.assertIn("zero dados identificáveis", markdown)
        self.assertIn("Radar Diário", markdown)
        self.assertIn("Portal Vivo", markdown)
        self.assertIn("minuto 60", markdown)
        self.assertIn("Sprint semanal de expansão", markdown)
        self.assertIn("Sepse e Choque Séptico", markdown)
        self.assertIn("Fila de novos apps e seções sugeridas", markdown)
        self.assertIn("AKI e Terapia Renal Substitutiva", markdown)
        self.assertIn("Rota futura", markdown)

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
        self.assertEqual(len(payload["expansionQueue"]), 8)
        self.assertTrue(
            any(plan["expansionSprint"] for plan in payload["plans"])
        )
        self.assertEqual(before, after)

    def test_guide_requires_codex_choice_and_clinical_review(self) -> None:
        guide = GUIDE.read_text(encoding="utf-8")
        for expected in (
            "O Codex escolhe automaticamente",
            "Total máximo: 60 minutos",
            "Execute a Rotina Antigravity de hoje",
            "pseudoaleatória, auditável e equilibrada",
            "Pulso contínuo obrigatório",
            "Radar Diário — 6 minutos",
            "Integridade e privacidade — 2 minutos",
            "Portal Vivo — 2 minutos",
            "Conteúdo Turbo TEMI",
            "Design TDAH-friendly",
            "Performance mensurável",
            "sexta-feira de expansão",
            "Fila sugerida de novos apps e seções",
            "Sepse e Choque Séptico",
            "TEMI Sprint 10",
            "uma aba, um cronômetro e uma entrega por vez",
            "não publica nada sozinho",
            "assistência",
            "revisão clínica humana",
        ):
            self.assertIn(expected, guide)
        self.assertIn(
            "mantém `ROTINA_DIARIA_30_MIN` por compatibilidade",
            guide,
        )


if __name__ == "__main__":
    unittest.main()
