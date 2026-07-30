#!/usr/bin/env python3
"""Escolhe uma rotina diária Antigravity equilibrada de 60 minutos.

O planejador é deliberadamente somente leitura. Ele usa a data de Fortaleza,
um rodízio pseudoaleatório reproduzível e o histórico Git de cada seção.
Não edita conteúdo, não registra publicação e não acessa a rede.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Iterable, Sequence
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError


SCHEMA_VERSION = "antigravity-daily-update-plan-v2"
CONFIG_SCHEMA_VERSION = "antigravity-daily-update-rotation-v2"
DEFAULT_CONFIG = Path("data/editorial/daily-update-rotation.json")
FORTALEZA = "America/Fortaleza"
WEEKDAYS = (
    "segunda-feira",
    "terça-feira",
    "quarta-feira",
    "quinta-feira",
    "sexta-feira",
    "sábado",
    "domingo",
)
MONTHS = (
    "",
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
)


@dataclass(frozen=True)
class Selection:
    lane_id: str
    lane_label: str
    lane_emoji: str
    quality_focus: str
    definition_of_done: str
    minutes: int
    section_id: str
    section_label: str
    route: str
    task: str
    priority: int
    last_git_update: str | None
    staleness_days: int | None
    score: float
    balance_cycle: int
    balance_slot: int


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def safe_root(value: Path) -> Path:
    root = value.resolve()
    if not root.is_dir() or root == Path(root.anchor):
        raise ValueError(f"Raiz insegura ou inexistente: {root}")
    return root


def resolve_under(root: Path, relative: Path) -> Path:
    target = (root / relative).resolve()
    if target != root and root not in target.parents:
        raise ValueError(f"Caminho fora do projeto: {relative}")
    return target


def fortaleza_today(now: datetime | None = None) -> date:
    if now is None:
        now = datetime.now(timezone.utc)
    try:
        zone = ZoneInfo(FORTALEZA)
    except ZoneInfoNotFoundError:
        zone = timezone(timedelta(hours=-3))
    return now.astimezone(zone).date()


def parse_day(value: str) -> date:
    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise argparse.ArgumentTypeError(
            "Data inválida; use AAAA-MM-DD."
        ) from exc


def stable_number(*parts: str, modulo: int) -> int:
    digest = hashlib.sha256("\x1f".join(parts).encode("utf-8")).digest()
    return int.from_bytes(digest[:8], "big") % modulo


def validate_config(root: Path, config: dict[str, Any]) -> None:
    required = {
        "schemaVersion",
        "timezone",
        "maxMinutes",
        "validationMinutes",
        "continuousPulse",
        "selectionPolicy",
        "lanes",
        "sections",
    }
    missing = sorted(required - config.keys())
    if missing:
        raise ValueError("Configuração incompleta: " + ", ".join(missing))
    if config["schemaVersion"] != CONFIG_SCHEMA_VERSION:
        raise ValueError(f"schemaVersion obrigatória: {CONFIG_SCHEMA_VERSION}")
    if config["timezone"] != FORTALEZA:
        raise ValueError(f"Fuso obrigatório: {FORTALEZA}")
    if config["maxMinutes"] != 60:
        raise ValueError("maxMinutes precisa ser exatamente 60.")
    if config["validationMinutes"] != 8:
        raise ValueError("validationMinutes precisa ser exatamente 8.")

    continuous_pulse = config["continuousPulse"]
    if not isinstance(continuous_pulse, list) or len(continuous_pulse) != 3:
        raise ValueError("continuousPulse precisa ter exatamente três tópicos.")
    pulse_ids: set[str] = set()
    for item in continuous_pulse:
        item_id = item.get("id")
        if not isinstance(item_id, str) or not item_id or item_id in pulse_ids:
            raise ValueError("Tópico contínuo precisa de id único.")
        pulse_ids.add(item_id)
        for field in ("label", "emoji", "task", "definitionOfDone"):
            if not isinstance(item.get(field), str) or not item[field].strip():
                raise ValueError(
                    f"Campo {field} ausente no tópico contínuo {item_id}."
                )
        if not isinstance(item.get("minutes"), int) or item["minutes"] < 1:
            raise ValueError(f"Tempo inválido no tópico contínuo {item_id}.")
        pulse_route = str(item.get("route", "")).split("#", 1)[0]
        if not pulse_route or not resolve_under(root, Path(pulse_route)).is_file():
            raise ValueError(f"Rota contínua inexistente em {item_id}.")
    if sum(item["minutes"] for item in continuous_pulse) != 10:
        raise ValueError("O pulso contínuo precisa totalizar 10 minutos.")

    policy = config["selectionPolicy"]
    if not isinstance(policy, dict):
        raise ValueError("selectionPolicy precisa ser um objeto.")
    required_policy = {
        "mode",
        "seedNamespace",
        "forecastCooldownDays",
        "gitCooldownDays",
        "minimumSectionsPerLane",
        "fairnessWindowDays",
    }
    missing_policy = sorted(required_policy - policy.keys())
    if missing_policy:
        raise ValueError(
            "Política de seleção incompleta: " + ", ".join(missing_policy)
        )
    if policy["mode"] != "balanced-deterministic-random":
        raise ValueError("Modo de seleção precisa ser balanceado e reproduzível.")
    if not isinstance(policy["seedNamespace"], str) or not policy["seedNamespace"]:
        raise ValueError("seedNamespace precisa ser texto não vazio.")
    for key in (
        "forecastCooldownDays",
        "gitCooldownDays",
        "minimumSectionsPerLane",
        "fairnessWindowDays",
    ):
        if not isinstance(policy[key], int) or policy[key] < 1:
            raise ValueError(f"{key} precisa ser inteiro positivo.")

    lanes = config["lanes"]
    sections = config["sections"]
    lane_ids = [lane.get("id") for lane in lanes]
    if len(lane_ids) != 3 or len(set(lane_ids)) != 3:
        raise ValueError("A rotina precisa ter exatamente três trilhas únicas.")
    if set(lane_ids) != {
        "conteudo-temi",
        "design-tdah",
        "performance-qualidade",
    }:
        raise ValueError(
            "As trilhas obrigatórias são conteúdo, design e performance."
        )
    if (
        sum(int(lane.get("minutes", 0)) for lane in lanes)
        + sum(int(item["minutes"]) for item in continuous_pulse)
        + config["validationMinutes"]
        != config["maxMinutes"]
    ):
        raise ValueError("A soma das trilhas e validação deve igualar maxMinutes.")
    for lane in lanes:
        for field in ("label", "emoji", "goal", "qualityFocus", "definitionOfDone"):
            if not isinstance(lane.get(field), str) or not lane[field].strip():
                raise ValueError(
                    f"Campo {field} ausente na trilha {lane.get('id')}."
                )

    section_ids: set[str] = set()
    route_errors: list[str] = []
    for item in sections:
        item_id = item.get("id")
        if not isinstance(item_id, str) or not item_id:
            raise ValueError("Toda seção precisa de id.")
        if item_id in section_ids:
            raise ValueError(f"Seção duplicada: {item_id}")
        section_ids.add(item_id)
        if item.get("lane") not in lane_ids:
            raise ValueError(f"Trilha inválida em {item_id}.")
        if not 1 <= int(item.get("priority", 0)) <= 5:
            raise ValueError(f"Prioridade inválida em {item_id}.")
        if not item.get("microTasks"):
            raise ValueError(f"Sem microtarefas em {item_id}.")
        if len(item["microTasks"]) < 3 or not all(
            isinstance(task, str) and task.strip()
            for task in item["microTasks"]
        ):
            raise ValueError(
                f"{item_id} precisa de pelo menos três microtarefas válidas."
            )
        route = str(item.get("route", "")).split("#", 1)[0]
        if not route or not resolve_under(root, Path(route)).is_file():
            route_errors.append(f"{item_id}: {route}")
        paths = item.get("paths")
        if not isinstance(paths, list) or not paths:
            raise ValueError(f"Sem fontes canônicas em {item_id}.")
        for relative in paths:
            if not resolve_under(root, Path(relative)).exists():
                raise ValueError(
                    f"Fonte canônica inexistente em {item_id}: {relative}"
                )
    if route_errors:
        raise ValueError("Rotas inexistentes: " + "; ".join(route_errors))
    for lane_id in lane_ids:
        lane_total = sum(item["lane"] == lane_id for item in sections)
        if lane_total < policy["minimumSectionsPerLane"]:
            raise ValueError(
                f"Trilha {lane_id} precisa de ao menos "
                f"{policy['minimumSectionsPerLane']} seções."
            )


def git_last_update(root: Path, paths: Sequence[str]) -> date | None:
    command = [
        "git",
        "log",
        "-1",
        "--format=%cs",
        "--",
        *paths,
    ]
    try:
        completed = subprocess.run(
            command,
            cwd=root,
            check=False,
            capture_output=True,
            text=True,
            timeout=5,
        )
    except (OSError, subprocess.TimeoutExpired):
        return None
    if completed.returncode != 0 or not completed.stdout.strip():
        return None
    try:
        return date.fromisoformat(completed.stdout.strip().splitlines()[0])
    except ValueError:
        return None


def collect_last_updates(
    root: Path,
    sections: Iterable[dict[str, Any]],
) -> dict[str, date | None]:
    return {
        section["id"]: git_last_update(root, section["paths"])
        for section in sections
    }


def staleness_days(today: date, last_update: date | None) -> int | None:
    if last_update is None:
        return None
    return max(0, (today - last_update).days)


def choose_task(
    section: dict[str, Any],
    day: date,
    seed_namespace: str,
) -> str:
    tasks = section["microTasks"]
    index = stable_number(
        seed_namespace,
        "microtask",
        day.isoformat(),
        section["id"],
        modulo=len(tasks),
    )
    return str(tasks[index])


def balanced_rotation(
    lane: dict[str, Any],
    roster: Sequence[dict[str, Any]],
    *,
    day: date,
    seed_namespace: str,
) -> tuple[dict[str, int], int, int]:
    roster_size = len(roster)
    adjusted_ordinal = day.toordinal() + int(lane.get("rotationOffset", 0))
    cycle = adjusted_ordinal // roster_size
    slot = adjusted_ordinal % roster_size
    ordered = sorted(
        roster,
        key=lambda section: (
            stable_number(
                seed_namespace,
                "cycle",
                lane["id"],
                str(cycle),
                section["id"],
                modulo=2**63 - 1,
            ),
            section["id"],
        ),
    )
    positions = {
        section["id"]: index
        for index, section in enumerate(ordered)
    }
    ranks = {
        section_id: (position - slot) % roster_size
        for section_id, position in positions.items()
    }
    return ranks, cycle, slot


def score_section(
    section: dict[str, Any],
    *,
    day: date,
    lane_id: str,
    rotation_rank: int,
    roster_size: int,
    last_update: date | None,
    recently_planned: set[str],
    seed_namespace: str,
    git_cooldown_days: int,
    planned_count: int,
) -> float:
    rotation_score = (roster_size - rotation_rank) * 100
    stale = staleness_days(day, last_update)
    stale_score = 40 if stale is None else min(stale, 365) / 7
    priority_score = int(section["priority"]) * 5
    daily_variety = stable_number(
        seed_namespace,
        "daily-jitter",
        day.isoformat(),
        lane_id,
        section["id"],
        modulo=1_000,
    ) / 100
    recent_penalty = 20_000 if section["id"] in recently_planned else 0
    git_cooldown = (
        10_000
        if stale is not None and stale < git_cooldown_days
        else 0
    )
    coverage_penalty = planned_count * 2_000
    return (
        rotation_score
        + stale_score
        + priority_score
        + daily_variety
        - recent_penalty
        - git_cooldown
        - coverage_penalty
    )


def choose_lane_section(
    lane: dict[str, Any],
    sections: Sequence[dict[str, Any]],
    *,
    day: date,
    last_updates: dict[str, date | None],
    recently_planned: set[str],
    excluded_routes: set[str],
    policy: dict[str, Any],
    planned_counts: dict[str, int],
) -> Selection:
    roster = [item for item in sections if item["lane"] == lane["id"]]
    if not roster:
        raise ValueError(f"Trilha sem seções: {lane['id']}")
    seed_namespace = str(policy["seedNamespace"])
    ranks, cycle, slot = balanced_rotation(
        lane,
        roster,
        day=day,
        seed_namespace=seed_namespace,
    )
    candidates = [
        item
        for item in roster
        if str(item["route"]).split("#", 1)[0] not in excluded_routes
    ]
    if not candidates:
        raise ValueError(
            f"Trilha {lane['id']} sem rota livre após aplicar o pulso diário."
        )
    scored = []
    for section in candidates:
        score = score_section(
            section,
            day=day,
            lane_id=lane["id"],
            rotation_rank=ranks[section["id"]],
            roster_size=len(roster),
            last_update=last_updates.get(section["id"]),
            recently_planned=recently_planned,
            seed_namespace=seed_namespace,
            git_cooldown_days=int(policy["gitCooldownDays"]),
            planned_count=planned_counts.get(section["id"], 0),
        )
        scored.append((score, section["id"], section))
    score, _, chosen = max(scored, key=lambda item: (item[0], item[1]))
    last_update = last_updates.get(chosen["id"])
    stale = staleness_days(day, last_update)
    return Selection(
        lane_id=lane["id"],
        lane_label=lane["label"],
        lane_emoji=lane["emoji"],
        quality_focus=lane["qualityFocus"],
        definition_of_done=lane["definitionOfDone"],
        minutes=int(lane["minutes"]),
        section_id=chosen["id"],
        section_label=chosen["label"],
        route=chosen["route"],
        task=choose_task(chosen, day, seed_namespace),
        priority=int(chosen["priority"]),
        last_git_update=last_update.isoformat() if last_update else None,
        staleness_days=stale,
        score=round(score, 2),
        balance_cycle=cycle,
        balance_slot=slot,
    )


def generate_schedule(
    config: dict[str, Any],
    *,
    start: date,
    days: int,
    last_updates: dict[str, date | None],
) -> list[dict[str, Any]]:
    if not 1 <= days <= 62:
        raise ValueError("days deve estar entre 1 e 62.")
    recent_by_lane: dict[str, list[str]] = {
        lane["id"]: [] for lane in config["lanes"]
    }
    planned_counts_by_lane: dict[str, dict[str, int]] = {
        lane["id"]: {} for lane in config["lanes"]
    }
    policy = config["selectionPolicy"]
    schedule = []
    for offset in range(days):
        current_day = start + timedelta(days=offset)
        selections = []
        selected_routes: set[str] = {
            str(item["route"]).split("#", 1)[0]
            for item in config["continuousPulse"]
        }
        for lane in config["lanes"]:
            lane_sections = [
                item for item in config["sections"] if item["lane"] == lane["id"]
            ]
            cooldown_size = min(
                int(policy["forecastCooldownDays"]),
                max(0, len(lane_sections) - 1),
            )
            recent = set(recent_by_lane[lane["id"]][-cooldown_size:])
            selection = choose_lane_section(
                lane,
                config["sections"],
                day=current_day,
                last_updates=last_updates,
                recently_planned=recent,
                excluded_routes=selected_routes,
                policy=policy,
                planned_counts=planned_counts_by_lane[lane["id"]],
            )
            selections.append(selection)
            recent_by_lane[lane["id"]].append(selection.section_id)
            lane_counts = planned_counts_by_lane[lane["id"]]
            lane_counts[selection.section_id] = (
                lane_counts.get(selection.section_id, 0) + 1
            )
            selected_routes.add(selection.route.split("#", 1)[0])
        schedule.append(
            {
                "schemaVersion": SCHEMA_VERSION,
                "date": current_day.isoformat(),
                "timezone": config["timezone"],
                "totalMinutes": config["maxMinutes"],
                "validationMinutes": config["validationMinutes"],
                "continuousMinutes": sum(
                    int(item["minutes"])
                    for item in config["continuousPulse"]
                ),
                "continuousPulse": config["continuousPulse"],
                "selectionMode": policy["mode"],
                "fairnessWindowDays": policy["fairnessWindowDays"],
                "selections": [
                    {
                        "laneId": item.lane_id,
                        "laneLabel": item.lane_label,
                        "laneEmoji": item.lane_emoji,
                        "qualityFocus": item.quality_focus,
                        "definitionOfDone": item.definition_of_done,
                        "minutes": item.minutes,
                        "sectionId": item.section_id,
                        "sectionLabel": item.section_label,
                        "route": item.route,
                        "task": item.task,
                        "priority": item.priority,
                        "lastGitUpdate": item.last_git_update,
                        "stalenessDays": item.staleness_days,
                        "score": item.score,
                        "balanceCycle": item.balance_cycle,
                        "balanceSlot": item.balance_slot,
                    }
                    for item in selections
                ],
            }
        )
    return schedule


def human_date(value: date) -> str:
    return (
        f"{WEEKDAYS[value.weekday()]}, {value.day} de "
        f"{MONTHS[value.month]} de {value.year}"
    )


def reason_for(item: dict[str, Any]) -> str:
    if item["lastGitUpdate"] is None:
        freshness = "sem atualização Git identificada"
    elif item["stalenessDays"] == 0:
        freshness = "atualizada hoje; selecionada pela rotação"
    elif item["stalenessDays"] == 1:
        freshness = "há 1 dia sem atualização"
    else:
        freshness = f"há {item['stalenessDays']} dias sem atualização"
    return (
        f"prioridade {item['priority']}/5; {freshness}; "
        f"rodízio pseudoaleatório auditável no ciclo "
        f"{item['balanceCycle']}, posição {item['balanceSlot']}"
    )


def render_markdown(schedule: Sequence[dict[str, Any]]) -> str:
    lines = [
        "# 🛰️ Cronograma diário Antigravity — 60 minutos",
        "",
        "> O Codex escolhe as seções por rodízio pseudoaleatório equilibrado. "
        "Interrompa a rotina se houver necessidade assistencial; paciente e "
        "plantão têm prioridade.",
        "",
    ]
    for plan in schedule:
        current = date.fromisoformat(plan["date"])
        lines.extend(
            [
                f"## {human_date(current)}",
                "",
                f"**Tempo total:** {plan['totalMinutes']} minutos · "
                f"**Fuso:** {plan['timezone']}",
                f"**Modo:** {plan['selectionMode']} · "
                f"**Janela de equilíbrio:** {plan['fairnessWindowDays']} dias",
                "",
            ]
        )
        elapsed = 0
        lines.extend(
            [
                f"### 🔁 Pulso contínuo diário — "
                f"{plan['continuousMinutes']} min",
                "",
                "Estes tópicos são verificados todos os dias. A checagem pode "
                "terminar em decisão explícita de não publicar.",
                "",
            ]
        )
        for item in plan["continuousPulse"]:
            start_minute = elapsed
            elapsed += int(item["minutes"])
            lines.extend(
                [
                    f"#### {item['emoji']} {item['label']} — "
                    f"{item['minutes']} min",
                    "",
                    f"- **Janela:** minuto {start_minute}–{elapsed}",
                    f"- **Checagem:** {item['task']}",
                    f"- **Pronto quando:** {item['definitionOfDone']}",
                    f"- **Rota:** `{item['route']}`",
                    "",
                ]
            )
        lines.extend(
            [
                "### 🎲 Atualizações randômicas equilibradas",
                "",
            ]
        )
        for number, item in enumerate(plan["selections"], start=1):
            start_minute = elapsed
            elapsed += int(item["minutes"])
            lines.extend(
                [
                    f"### {number}. {item['laneEmoji']} "
                    f"{item['sectionLabel']} — {item['minutes']} min",
                    "",
                    f"- **Janela:** minuto {start_minute}–{elapsed}",
                    f"- **Pilar:** {item['qualityFocus']}",
                    f"- **Microentrega:** {item['task']}",
                    f"- **Pronto quando:** {item['definitionOfDone']}",
                    f"- **Rota:** `{item['route']}`",
                    f"- **Motivo da escolha:** {reason_for(item)}.",
                    "- **Regra TDAH:** uma aba, um cronômetro e uma entrega; "
                    "ideias extras vão para o estacionamento.",
                    "",
                ]
            )
        final_end = elapsed + int(plan["validationMinutes"])
        lines.extend(
            [
                f"### 🛡️ Validação e publicação segura — "
                f"{plan['validationMinutes']} min",
                "",
                f"- **Janela:** minuto {elapsed}–{final_end}",
                "- Revisar o diff e garantir zero dados identificáveis, "
                "credenciais ou arquivos privados.",
                "- Confirmar fonte e ressalva do conteúdo, hierarquia e teclado "
                "do design, e medida antes/depois da performance.",
                "- Executar os testes relacionados, o portão editorial, o "
                "portão de publicação e o builder público.",
                "- Conteúdo clínico novo exige fonte e revisão humana; sem isso, "
                "fica em revisão e não vira protocolo.",
                "- Registrar no Radar Diário achados clínicos/estudo; registrar "
                "no Portal Vivo apenas UPGRADEs realmente entregues.",
                "",
                "**Critério de parada:** uma microentrega por pilar. Encerrar no "
                "minuto 60 e estacionar qualquer ampliação de escopo.",
                "",
            ]
        )
    return "\n".join(lines).rstrip() + "\n"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "Escolhe automaticamente três seções do Antigravity para uma "
            "rotina diária de 60 minutos: conteúdo, design e performance."
        )
    )
    parser.add_argument("--root", type=Path, default=Path("."))
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    parser.add_argument("--date", type=parse_day, default=None)
    parser.add_argument("--days", type=int, default=1)
    parser.add_argument(
        "--format",
        choices=("markdown", "json"),
        default="markdown",
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        root = safe_root(args.root)
        config_path = resolve_under(root, args.config)
        config = load_json(config_path)
        validate_config(root, config)
        start = args.date or fortaleza_today()
        last_updates = collect_last_updates(root, config["sections"])
        schedule = generate_schedule(
            config,
            start=start,
            days=args.days,
            last_updates=last_updates,
        )
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"❌ Não foi possível gerar o cronograma: {exc}", file=sys.stderr)
        return 2

    if args.format == "json":
        print(
            json.dumps(
                {"schemaVersion": SCHEMA_VERSION, "plans": schedule},
                ensure_ascii=False,
                indent=2,
            )
        )
    else:
        print(render_markdown(schedule), end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
