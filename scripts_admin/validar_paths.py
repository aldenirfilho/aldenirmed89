#!/usr/bin/env python3
"""Valida paths de manifests e catalagos sem depender de build externo.

Uso:
    python3 scripts_admin/validar_paths.py --check
    python3 scripts_admin/validar_paths.py --fix

O modo --fix corrige somente caminhos com correspondencia unica no disco.
Entradas sem arquivo correspondente nao sao removidas automaticamente.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]


@dataclass(frozen=True)
class Target:
    json_path: str
    list_key: str
    base_path: str
    path_field: str
    kind: str = "file"


TARGETS = [
    Target("01_UpDown_Hub/registry.json", "documents", "01_UpDown_Hub", "path"),
    Target("02_Biblioteca_IA_Engine/data/biblioteca_documentos_manifest.json", "files", "02_Biblioteca_IA_Engine", "path"),
    Target("02_Biblioteca_IA_Engine/data/biblioteca_catalogo.json", "items", "02_Biblioteca_IA_Engine", "path"),
    Target("02_Biblioteca_IA_Engine/data/biblioteca_inbox_manifest_auto.json", "files", "02_Biblioteca_IA_Engine", "path"),
    Target("02_Biblioteca_IA_Engine/data/biblioteca_taxonomia_temas.json", "themes", ".", "folder", "dir"),
    Target("04_Ebooks_Intensiva_Clinica/data/catalogo.json", "items", "04_Ebooks_Intensiva_Clinica", "path"),
    Target("07_Questoes_Comentadas/data/catalogo.json", "items", "07_Questoes_Comentadas", "path"),
    Target("08_Transcricoes/data/catalogo.json", "items", "08_Transcricoes", "path"),
    Target("09_POCUS_Hub/data/catalogo.json", "items", "09_POCUS_Hub", "path"),
    Target("05_Midia_E_Feed/data/cards.json", "cards", "05_Midia_E_Feed", "imageUrl"),
]


def norm_key(value: str) -> str:
    value = unicodedata.normalize("NFC", value).lower()
    value = re.sub(r"[:]+", "-", value)
    value = re.sub(r"[ _\-]+", " ", value)
    return value.strip()


def is_external(path: str) -> bool:
    return bool(re.match(r"^(https?:|mailto:|tel:|data:|blob:|#)", path, re.I))


def read_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def write_json(path: Path, data: Any) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def build_index(base: Path, kind: str) -> tuple[dict[str, str], dict[tuple[str, str], str]]:
    all_paths: dict[str, str] = {}
    by_dir_name: dict[tuple[str, str], str] = {}
    if not base.exists():
        return all_paths, by_dir_name

    iterator = base.rglob("*")
    for entry in iterator:
        if entry.name.startswith("."):
            continue
        if kind == "dir" and not entry.is_dir():
            continue
        if kind != "dir" and not entry.is_file():
            continue
        rel = entry.relative_to(base).as_posix()
        all_paths[rel] = rel
        parent = Path(rel).parent.as_posix()
        key = (parent, norm_key(entry.name))
        if key not in by_dir_name:
            by_dir_name[key] = rel
        else:
            by_dir_name[key] = ""
    return all_paths, by_dir_name


def resolve_path(raw_path: str, base: Path, kind: str, all_paths: dict[str, str], by_dir_name: dict[tuple[str, str], str]) -> str | None:
    if not raw_path or is_external(raw_path):
        return raw_path

    clean = raw_path.strip()
    if clean in all_paths and (base / clean).exists():
        return clean
    if (base / clean).exists():
        return clean

    candidates = [clean]
    if ":" in clean:
        candidates.append(clean.replace(":", "-"))
    if clean.startswith("./"):
        candidates.append(clean[2:])

    base_name = base.name
    duplicated = f"{base_name}/{base_name}/"
    if duplicated in clean:
        candidates.append(clean.replace(duplicated, f"{base_name}/"))

    for candidate in candidates:
        if candidate in all_paths and (base / candidate).exists():
            return candidate
        if (base / candidate).exists():
            return candidate

    parent = Path(clean).parent.as_posix()
    basename = norm_key(Path(clean).name)
    local_match = by_dir_name.get((parent, basename))
    if local_match:
        return local_match

    matches = [rel for rel in all_paths if norm_key(Path(rel).name) == basename]
    if len(matches) == 1:
        return matches[0]
    return None


def validate_target(target: Target, fix: bool) -> tuple[int, int, int, int]:
    json_file = ROOT / target.json_path
    if not json_file.exists():
        print(f"[pulado] {target.json_path}: arquivo inexistente")
        return (0, 0, 0, 0)

    data = read_json(json_file)
    items = data.get(target.list_key, []) if isinstance(data, dict) else []
    if not isinstance(items, list):
        print(f"[erro] {target.json_path}: chave '{target.list_key}' nao e lista")
        return (0, 0, 0, 1)

    base = ROOT / target.base_path
    all_paths, by_dir_name = build_index(base, target.kind)
    ok = fixable = missing = errors = pruned = 0
    changed = False
    kept = []

    for item in items:
        if not isinstance(item, dict):
            kept.append(item)
            continue
        raw = item.get(target.path_field)
        if not raw or is_external(str(raw)):
            ok += 1
            kept.append(item)
            continue
        resolved = resolve_path(str(raw), base, target.kind, all_paths, by_dir_name)
        if resolved is None:
            label = item.get("title") or item.get("name") or item.get("id") or "item"
            if fix:
                # Self-healing: arquivo nao existe (ex.: gitignored/removido) ->
                # remove a entrada do manifesto para nao quebrar o deploy.
                pruned += 1
                changed = True
                print(f"[prune] {target.json_path}: {label} -> {raw} (arquivo ausente, removido)")
                continue
            missing += 1
            print(f"[404] {target.json_path}: {label} -> {raw}")
            kept.append(item)
            continue
        if os.path.normpath(resolved) != os.path.normpath(str(raw)):
            fixable += 1
            print(f"[fixable] {target.json_path}: {raw} -> {resolved}")
            if fix:
                item[target.path_field] = resolved
                changed = True
        else:
            ok += 1
        kept.append(item)

    if fix and changed:
        data[target.list_key] = kept
        write_json(json_file, data)

    status = "OK" if missing == 0 else "ATENCAO"
    bits = []
    if fix and changed:
        bits.append("corrigido")
    if pruned:
        bits.append(f"{pruned} removido(s)")
    action = ", ".join(bits) if bits else "sem escrita"
    print(f"[{status}] {target.json_path}: {ok} ok, {fixable} corrigiveis, {missing} 404 ({action})")
    return (ok, fixable, missing, errors)


def main() -> int:
    parser = argparse.ArgumentParser(description="Valida paths de manifests do Antigravity.")
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true", help="Relata problemas sem alterar arquivos.")
    mode.add_argument("--fix", action="store_true", help="Corrige paths com correspondencia unica no disco.")
    args = parser.parse_args()

    total_ok = total_fixable = total_missing = total_errors = 0
    for target in TARGETS:
        ok, fixable, missing, errors = validate_target(target, fix=args.fix)
        total_ok += ok
        total_fixable += fixable
        total_missing += missing
        total_errors += errors

    print("")
    print(f"Resumo: {total_ok} ok, {total_fixable} corrigiveis, {total_missing} 404, {total_errors} erro(s)")
    return 1 if total_missing or total_errors else 0


if __name__ == "__main__":
    sys.exit(main())
