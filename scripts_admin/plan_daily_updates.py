#!/usr/bin/env python3
"""Escolhe uma rotina diária Antigravity uniforme, dinâmica e menor que 30 min.

O planejador é deliberadamente somente leitura. Ele usa a data de Fortaleza,
o rodízio configurado e o histórico Git de cada seção. Não edita conteúdo,
não registra publicação e não acessa a rede.
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


SCHEMA_VERSION = "antigravity-daily-update-plan-v1"
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
    minutes: int
    section_id: str
    section_label: str
    route: str
    task: str
    priority: int
    last_git_update: str | None
    staleness_days: int | None
    score: float


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
        "lanes",
        "sections",
    }
    missing = sorted(required - config.keys())
    if missing:
        raise ValueError("Configuração incompleta: " + ", ".join(missing))
    if config["timezone"] != FORTALEZA:
        raise ValueError(f"Fuso obrigatório: {FORTALEZA}")
    if not isinstance(config["maxMinutes"], int) or config["maxMinutes"] >= 30:
        raise ValueError("maxMinutes precisa ser inteiro menor que 30.")
    if not isinstance(config["validationMinutes"], int):
        raise ValueError("validationMinutes precisa ser inteiro.")

    lanes = config["lanes"]
    sections = config["sections"]
    lane_ids = [lane.get("id") for lane in lanes]
    if len(lane_ids) != 3 or len(set(lane_ids)) != 3:
        raise ValueError("A rotina precisa ter exatamente três trilhas únicas.")
    if (
        sum(int(lane.get("minutes", 0)) for lane in lanes)
        + config["validationMinutes"]
        != config["maxMinutes"]
    ):
        raise ValueError("A soma das trilhas e validação deve igualar maxMinutes.")

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


def choose_task(section: dict[str, Any], day: date) -> str:
    tasks = section["microTasks"]
    index = stable_number(day.isoformat(), section["id"], modulo=len(tasks))
    return str(tasks[index])


def score_section(
    section: dict[str, Any],
    *,
    day: date,
    roster_index: int,
    pivot: int,
    roster_size: int,
    last_update: date | None,
    recently_planned: set[str],
) -> float:
    circular_distance = (roster_index - pivot) % roster_size
    rotation_score = (roster_size - circular_distance) * 24
    stale = staleness_days(day, last_update)
    stale_score = 18 if stale is None else min(stale, 180) / 10
    priority_score = int(section["priority"]) * 4
    daily_variety = stable_number(
        day.isoformat(), section["id"], modulo=7
    )
    recent_penalty = 1_000 if section["id"] in recently_planned else 0
    git_cooldown = 600 if stale is not None and stale < 3 else 0
    return (
        rotation_score
        + stale_score
        + priority_score
        + daily_variety
        - recent_penalty
        - git_cooldown
    )


def choose_lane_section(
    lane: dict[str, Any],
    sections: Sequence[dict[str, Any]],
    *,
    day: date,
    last_updates: dict[str, date | None],
    recently_planned: set[str],
) -> Selection:
    roster = [item for item in sections if item["lane"] == lane["id"]]
    if not roster:
        raise ValueError(f"Trilha sem seções: {lane['id']}")
    pivot = (
        day.toordinal() + int(lane.get("rotationOffset", 0))
    ) % len(roster)
    scored = []
    for index, section in enumerate(roster):
        score = score_section(
            section,
            day=day,
            roster_index=index,
            pivot=pivot,
            roster_size=len(roster),
            last_update=last_updates.get(section["id"]),
            recently_planned=recently_planned,
        )
        scored.append((score, section["id"], section))
    score, _, chosen = max(scored, key=lambda item: (item[0], item[1]))
    last_update = last_updates.get(chosen["id"])
    stale = staleness_days(day, last_update)
    return Selection(
        lane_id=lane["id"],
        lane_label=lane["label"],
        lane_emoji=lane["emoji"],
        minutes=int(lane["minutes"]),
        section_id=chosen["id"],
        section_label=chosen["label"],
        route=chosen["route"],
        task=choose_task(chosen, day),
        priority=int(chosen["priority"]),
        last_git_update=last_update.isoformat() if last_update else None,
        staleness_days=stale,
        score=round(score, 2),
    )


def generate_schedule(
    config: dict[str, Any],
    *,
    start: date,
    days: int,
    last_updates: dict[str, date | None],
) -> list[dict[str, Any]]:
    if not 1 <= days <= 31:
        raise ValueError("days deve estar entre 1 e 31.")
    recent_by_lane: dict[str, list[str]] = {
        lane["id"]: [] for lane in config["lanes"]
    }
    schedule = []
    for offset in range(days):
        current_day = start + timedelta(days=offset)
        selections = []
        for lane in config["lanes"]:
            lane_sections = [
                item for item in config["sections"] if item["lane"] == lane["id"]
            ]
            cooldown_size = min(5, max(0, len(lane_sections) - 1))
            recent = set(recent_by_lane[lane["id"]][-cooldown_size:])
            selection = choose_lane_section(
                lane,
                config["sections"],
                day=current_day,
                last_updates=last_updates,
                recently_planned=recent,
            )
            selections.append(selection)
            recent_by_lane[lane["id"]].append(selection.section_id)
        schedule.append(
            {
                "schemaVersion": SCHEMA_VERSION,
                "date": current_day.isoformat(),
                "timezone": config["timezone"],
                "totalMinutes": config["maxMinutes"],
                "validationMinutes": config["validationMinutes"],
                "selections": [
                    {
                        "laneId": item.lane_id,
                        "laneLabel": item.lane_label,
                        "laneEmoji": item.lane_emoji,
                        "minutes": item.minutes,
                        "sectionId": item.section_id,
                        "sectionLabel": item.section_label,
                        "route": item.route,
                        "task": item.task,
                        "priority": item.priority,
                        "lastGitUpdate": item.last_git_update,
                        "stalenessDays": item.staleness_days,
                        "score": item.score,
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
    return f"prioridade {item['priority']}/5; {freshness}"


def render_markdown(schedule: Sequence[dict[str, Any]]) -> str:
    lines = [
        "# 🛰️ Cronograma diário Antigravity — máximo de 29 minutos",
        "",
        "> O Codex escolhe as seções. Interrompa a rotina se houver necessidade "
        "assistencial; paciente e plantão têm prioridade.",
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
                "",
            ]
        )
        elapsed = 0
        for number, item in enumerate(plan["selections"], start=1):
            start_minute = elapsed
            elapsed += int(item["minutes"])
            lines.extend(
                [
                    f"### {number}. {item['laneEmoji']} "
                    f"{item['sectionLabel']} — {item['minutes']} min",
                    "",
                    f"- **Janela:** minuto {start_minute}–{elapsed}",
                    f"- **Microentrega:** {item['task']}",
                    f"- **Rota:** `{item['route']}`",
                    f"- **Motivo da escolha:** {reason_for(item)}.",
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
                "- Executar o teste relacionado, o portão de publicação e o "
                "builder público.",
                "- Conteúdo clínico novo exige fonte e revisão humana; sem isso, "
                "fica em revisão e não vira protocolo.",
                "- Registrar no Radar Diário achados clínicos/estudo; registrar "
                "no Portal Vivo apenas UPGRADEs realmente entregues.",
                "",
                "**Critério de parada:** uma microentrega por seção. Não ampliar "
                "o escopo mesmo que reste tempo.",
                "",
            ]
        )
    return "\n".join(lines).rstrip() + "\n"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "Escolhe automaticamente três seções do Antigravity para uma "
            "rotina diária menor que 30 minutos."
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
