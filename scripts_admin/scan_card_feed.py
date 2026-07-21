#!/usr/bin/env python3
"""Indexa somente imagens já aprovadas para o Card Feed público.

Cópias de conflito de sincronização (por exemplo, ``card 2.webp``) são
preservadas no disco e excluídas do índice apenas quando forem idênticas ao
arquivo canônico. Cópia divergente ou órfã bloqueia a operação.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from datetime import date
from pathlib import Path
from typing import Sequence


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_DIR = ROOT / "05_Midia_E_Feed/assets/cards/public"
OUTPUT = ROOT / "05_Midia_E_Feed/data/public.json"
SUPPORTED = {".png", ".jpg", ".jpeg", ".webp", ".svg"}
CONFLICT_COPY = re.compile(
    r"^(?P<stem>.+) (?P<copy>[2-9]\d*)(?P<suffix>\.(?:png|jpe?g|webp|svg))$",
    flags=re.IGNORECASE,
)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def conflict_canonical(path: Path) -> Path | None:
    match = CONFLICT_COPY.fullmatch(path.name)
    if match is None:
        return None
    return path.with_name(f"{match.group('stem')}{match.group('suffix')}")


def collect_public_files(public_dir: Path) -> tuple[list[str], list[str]]:
    if not public_dir.is_dir():
        raise ValueError("Diretório público do Card Feed ausente.")

    canonical_files: list[str] = []
    conflicts: list[str] = []
    candidates = sorted(public_dir.rglob("*"), key=lambda item: item.as_posix().casefold())
    for path in candidates:
        if path.is_symlink():
            raise ValueError(f"Link simbólico bloqueado no Card Feed: {path}")
        if not path.is_file() or path.suffix.casefold() not in SUPPORTED:
            continue
        relative = path.relative_to(public_dir).as_posix()
        canonical = conflict_canonical(path)
        if canonical is None:
            canonical_files.append(relative)
            continue
        if not canonical.is_file() or canonical.is_symlink():
            raise ValueError(f"Cópia de conflito órfã bloqueada: {relative}")
        if sha256_file(path) != sha256_file(canonical):
            raise ValueError(f"Cópia de conflito divergente bloqueada: {relative}")
        conflicts.append(relative)

    if len(canonical_files) != len(set(canonical_files)):
        raise ValueError("Índice do Card Feed produziria caminhos canônicos duplicados.")
    return canonical_files, conflicts


def build_payload(public_dir: Path) -> tuple[dict, list[str]]:
    files, conflicts = collect_public_files(public_dir)

    payload = {
        "description": "Imagens explicitamente aprovadas para o Card Feed público.",
        "updatedAt": date.today().isoformat(),
        "files": files,
        "totalFiles": len(files),
        "totalBytes": sum((public_dir / relative).stat().st_size for relative in files),
    }
    return payload, conflicts


def comparable_payload(payload: dict) -> dict:
    return {key: value for key, value in payload.items() if key != "updatedAt"}


def check_output(output: Path, expected: dict) -> bool:
    try:
        existing = json.loads(output.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError("Índice público atual ausente ou inválido.") from exc
    return isinstance(existing, dict) and comparable_payload(existing) == comparable_payload(expected)


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Gera ou valida o índice público seguro do Card Feed."
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Valida o índice e as cópias de conflito sem gravar arquivos.",
    )
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        payload, conflicts = build_payload(PUBLIC_DIR)
        if args.check:
            if not check_output(OUTPUT, payload):
                print("❌ Índice público do Card Feed diverge dos assets canônicos.", file=sys.stderr)
                return 1
            print(f"✅ Card Feed válido sem escrita: {payload['totalFiles']} imagem(ns).")
            if conflicts:
                print(f"🛡️ Cópias idênticas preservadas e excluídas do índice: {len(conflicts)}.")
            return 0

        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        OUTPUT.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"❌ {exc}", file=sys.stderr)
        return 1

    print(f"✅ Card Feed: {payload['totalFiles']} imagem(ns) pública(s) aprovada(s).")
    if conflicts:
        print(f"🛡️ Cópias idênticas preservadas e excluídas do índice: {len(conflicts)}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
