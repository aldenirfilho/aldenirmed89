#!/usr/bin/env python3
"""Portão fail-closed para impedir publicação de staging e dados privados.

Uso:
    python3 scripts_admin/publication_guard.py sanitize-data .
    python3 scripts_admin/publication_guard.py check-repository .
    python3 scripts_admin/publication_guard.py sanitize-site site
    python3 scripts_admin/publication_guard.py check-site site

O script nunca abre nem imprime o conteúdo dos documentos. Ele trabalha apenas
com caminhos, metadados JSON e o tamanho total do artefato.
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from collections import Counter
from pathlib import Path
from typing import Any


MAX_SITE_BYTES = 900 * 1024 * 1024

PRIVATE_THEMES = {"inbox-revisar", "juridico-financeiro"}
PRIVATE_STATUSES = {"privado", "private", "rascunho", "revisar"}

DROP = object()


def normalize_path(value: str) -> str:
    return value.replace("\\", "/").lstrip("./").lower()


def has_private_segment(value: str) -> bool:
    normalized = normalize_path(value)
    parts = [part for part in normalized.split("/") if part]
    return (
        normalized == "00_inbox_atualizacao"
        or normalized.startswith("00_inbox_atualizacao/")
        or any(part in {"inbox", "juridico-financeiro"} for part in parts)
    )


def is_private_record(record: dict[str, Any]) -> bool:
    for key, value in record.items():
        if has_private_segment(str(key)):
            return True
        if isinstance(value, str) and has_private_segment(value):
            return True

    paths = [
        str(record.get(key) or "")
        for key in ("path", "folder", "imageUrl", "src", "filename")
    ]
    if any(path and has_private_segment(path) for path in paths):
        return True

    theme = str(record.get("theme") or record.get("id") or "").lower()
    if theme in PRIVATE_THEMES:
        return True

    status = str(record.get("status") or "").lower()
    return status in PRIVATE_STATUSES


def clean_value(value: Any) -> Any:
    if isinstance(value, dict):
        if is_private_record(value):
            return DROP
        cleaned: dict[str, Any] = {}
        for key, child in value.items():
            if has_private_segment(str(key)):
                continue
            result = clean_value(child)
            if result is not DROP:
                cleaned[key] = result
        return cleaned

    if isinstance(value, list):
        cleaned_list = []
        for child in value:
            result = clean_value(child)
            if result is not DROP:
                cleaned_list.append(result)
        return cleaned_list

    if isinstance(value, str) and has_private_segment(value):
        return DROP

    return value


def refresh_counts(data: dict[str, Any]) -> None:
    items = data.get("files") if isinstance(data.get("files"), list) else data.get("items")
    if not isinstance(items, list):
        return

    data["totalFiles"] = len(items)

    if isinstance(data.get("partitions"), list):
        counts = Counter(str(item.get("format")) for item in items if isinstance(item, dict))
        for partition in data["partitions"]:
            if isinstance(partition, dict):
                partition["count"] = counts.get(str(partition.get("id")), 0)

    if isinstance(data.get("origins"), list):
        counts = Counter(str(item.get("origin")) for item in items if isinstance(item, dict))
        for origin in data["origins"]:
            if isinstance(origin, dict):
                origin["count"] = counts.get(str(origin.get("id")), 0)

    if isinstance(data.get("stats"), dict):
        counts = Counter(str(item.get("theme")) for item in items if isinstance(item, dict))
        data["stats"] = {key: counts.get(key, 0) for key in data["stats"]}


def sanitize_document(data: Any) -> Any:
    removed_node_ids: set[str] = set()
    if isinstance(data, dict) and isinstance(data.get("nodes"), list):
        removed_node_ids = {
            str(node.get("id"))
            for node in data["nodes"]
            if isinstance(node, dict) and is_private_record(node)
        }

    cleaned = clean_value(data)
    if cleaned is DROP:
        return {}

    if isinstance(cleaned, dict) and removed_node_ids and isinstance(cleaned.get("edges"), list):
        cleaned["edges"] = [
            edge
            for edge in cleaned["edges"]
            if not isinstance(edge, dict)
            or (
                str(edge.get("from")) not in removed_node_ids
                and str(edge.get("to")) not in removed_node_ids
            )
        ]

    if isinstance(cleaned, dict):
        refresh_counts(cleaned)
    return cleaned


def json_files(root: Path, repository: bool = False) -> list[Path]:
    if repository:
        result = subprocess.run(
            ["git", "-C", str(root), "ls-files", "-z", "--cached", "--others", "--exclude-standard"],
            check=True,
            capture_output=True,
        )
        paths = result.stdout.decode("utf-8").split("\0")
        return sorted(
            root / relative
            for relative in paths
            if relative.lower().endswith(".json") and (root / relative).is_file()
        )

    return sorted(path for path in root.rglob("*.json") if path.is_file())


def sanitize_json_files(root: Path, repository: bool = False) -> tuple[int, int]:
    changed = removed = 0
    for path in json_files(root, repository=repository):
        try:
            original = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            raise ValueError(f"JSON público inválido: {path}") from exc
        cleaned = sanitize_document(original)
        if path.name == "inbox.json" and isinstance(cleaned, dict):
            if isinstance(cleaned.get("files"), list):
                cleaned["files"] = []
            if isinstance(cleaned.get("items"), list):
                cleaned["items"] = []
            refresh_counts(cleaned)
        if cleaned != original:
            before = count_private_records(original)
            after = count_private_records(cleaned)
            removed += max(0, before - after)
            path.write_text(
                json.dumps(cleaned, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            changed += 1
    return changed, removed


def count_private_records(value: Any) -> int:
    if isinstance(value, dict):
        if is_private_record(value):
            return 1
        return sum(
            int(has_private_segment(str(key))) + count_private_records(child)
            for key, child in value.items()
        )
    if isinstance(value, list):
        return sum(count_private_records(v) for v in value)
    if isinstance(value, str):
        return int(has_private_segment(value))
    return 0


def check_json_files(root: Path, repository: bool = False) -> tuple[int, int]:
    violations = 0
    invalid = 0
    for path in json_files(root, repository=repository):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            invalid += 1
            continue
        violations += count_private_records(data)
        if path.name == "inbox.json" and isinstance(data, dict):
            for key in ("files", "items"):
                if isinstance(data.get(key), list):
                    violations += len(data[key])
    return violations, invalid


def tracked_paths(root: Path) -> list[str]:
    result = subprocess.run(
        ["git", "-C", str(root), "ls-files", "-z"],
        check=True,
        capture_output=True,
    )
    return [item for item in result.stdout.decode("utf-8").split("\0") if item]


def site_paths(root: Path) -> list[str]:
    return [path.relative_to(root).as_posix() for path in root.rglob("*") if path.is_file()]


def total_size(root: Path) -> int:
    return sum(path.stat().st_size for path in root.rglob("*") if path.is_file())


def ensure_safe_root(root: Path) -> Path:
    resolved = root.resolve()
    if not resolved.is_dir() or resolved == Path(resolved.anchor):
        raise ValueError(f"Raiz insegura ou inexistente: {resolved}")
    return resolved


def sanitize_site(root: Path) -> int:
    root = ensure_safe_root(root)
    removed_dirs = 0
    private_dirs = sorted(
        (
            path
            for path in root.rglob("*")
            if path.is_dir() and path.name.lower() in {"inbox", "juridico-financeiro"}
        ),
        key=lambda path: len(path.parts),
        reverse=True,
    )
    for target in private_dirs:
        resolved = target.resolve()
        if root not in resolved.parents:
            raise ValueError(f"Destino fora do artefato: {resolved}")
        shutil.rmtree(resolved)
        removed_dirs += 1

    changed, removed_records = sanitize_json_files(root)
    print(
        f"✅ Sanitização do artefato: {removed_dirs} diretório(s), "
        f"{changed} JSON alterado(s), {removed_records} registro(s) privado(s) removido(s)."
    )
    return 0


def check_repository(root: Path) -> int:
    root = ensure_safe_root(root)
    offending = [
        path for path in tracked_paths(root) if has_private_segment(path)
    ]
    json_violations, invalid_json = check_json_files(root, repository=True)
    if offending or json_violations or invalid_json:
        print(
            f"❌ Portão do repositório falhou: {len(offending)} arquivo(s) privado(s) "
            f"rastreados, {json_violations} valor(es) privado(s) e "
            f"{invalid_json} JSON inválido(s)."
        )
        return 1
    print("✅ Portão do repositório: nenhum staging/dado privado rastreado ou catalogado.")
    return 0


def check_site(root: Path) -> int:
    root = ensure_safe_root(root)
    offending = [path for path in site_paths(root) if has_private_segment(path)]
    json_violations, invalid_json = check_json_files(root)
    size = total_size(root)
    too_large = size > MAX_SITE_BYTES
    if offending or json_violations or invalid_json or too_large:
        print(
            f"❌ Portão do artefato falhou: {len(offending)} arquivo(s) privado(s), "
            f"{json_violations} valor(es) privado(s), {invalid_json} JSON inválido(s), "
            f"{size / 1024 / 1024:.1f} MiB."
        )
        return 1
    print(
        f"✅ Portão do artefato: privacidade aprovada; "
        f"tamanho {size / 1024 / 1024:.1f} MiB (limite interno 900 MiB)."
    )
    return 0


def sanitize_data(root: Path) -> int:
    root = ensure_safe_root(root)
    changed, removed = sanitize_json_files(root, repository=True)
    print(f"✅ Dados públicos saneados: {changed} JSON alterado(s), {removed} registro(s) removido(s).")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Protege o artefato público Antigravity.")
    parser.add_argument(
        "mode",
        choices=("sanitize-data", "check-repository", "sanitize-site", "check-site"),
    )
    parser.add_argument("root", type=Path)
    args = parser.parse_args()

    try:
        if args.mode == "sanitize-data":
            return sanitize_data(args.root)
        if args.mode == "check-repository":
            return check_repository(args.root)
        if args.mode == "sanitize-site":
            return sanitize_site(args.root)
        return check_site(args.root)
    except (OSError, ValueError, subprocess.SubprocessError) as exc:
        print(f"❌ Falha segura no portão de publicação: {exc}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
