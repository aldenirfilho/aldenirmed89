#!/usr/bin/env python3
"""Gera ou verifica proveniência SHA-256 de arquivos autorais selecionados.

Exemplo:
    python3 scripts_admin/generate_editorial_provenance.py \
      --root . --input caminho/arquivo.md \
      --commit "$EDITORIAL_COMMIT" \
      --generated-at "$EDITORIAL_GENERATED_AT"

Commit e data nunca são inferidos: precisam vir por argumento ou pelas
variáveis ``EDITORIAL_COMMIT`` e ``EDITORIAL_GENERATED_AT``. Assim, para a mesma
seleção, bytes, commit e data, a saída é determinística.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Any, Sequence


MARK = "ATV · TURBO TEMI · ALD 360"
AUTHOR = "Aldenir Rocha de Oliveira Filho"
SCHEMA_VERSION = "editorial-provenance-v1"
DEFAULT_OUTPUT = Path("data/editorial/editorial-provenance.json")
COMMIT_RE = re.compile(r"^[0-9a-fA-F]{7,64}$")
MEDIA_TYPES = {
    ".css": "text/css",
    ".csv": "text/csv",
    ".html": "text/html",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".js": "text/javascript",
    ".json": "application/json",
    ".md": "text/markdown",
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".txt": "text/plain",
    ".webp": "image/webp",
    ".xml": "application/xml",
}


def canonical_bytes(data: dict[str, Any]) -> bytes:
    return (
        json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    ).encode("utf-8")


def validate_explicit_timestamp(value: str) -> str:
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValueError("generated-at deve ser ISO-8601 válido") from exc
    if parsed.tzinfo is None:
        raise ValueError("generated-at precisa incluir fuso horário")
    return value


def resolve_selected_files(root: Path, values: Sequence[str]) -> list[Path]:
    root = root.resolve()
    if not values:
        raise ValueError("Selecione pelo menos um --input; selagem vazia é recusada")
    selected: dict[str, Path] = {}
    for value in values:
        candidate = Path(value)
        path = candidate if candidate.is_absolute() else root / candidate
        if path.is_symlink():
            raise ValueError(f"Link simbólico não é aceito: {value}")
        try:
            relative = path.resolve().relative_to(root)
        except ValueError as exc:
            raise ValueError(f"Arquivo fora da raiz: {value}") from exc
        if not path.is_file():
            raise ValueError(f"Arquivo selecionado não existe: {value}")
        selected[relative.as_posix()] = path
    return [selected[key] for key in sorted(selected)]


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def build_manifest(
    root: Path,
    selected: Sequence[Path],
    commit: str,
    generated_at: str,
) -> dict[str, Any]:
    root = root.resolve()
    if not COMMIT_RE.fullmatch(commit):
        raise ValueError("commit deve ser um SHA Git hexadecimal explícito")
    generated_at = validate_explicit_timestamp(generated_at)
    works = []
    for path in sorted(selected, key=lambda item: item.resolve().relative_to(root).as_posix()):
        relative = path.resolve().relative_to(root).as_posix()
        works.append(
            {
                "path": relative,
                "sha256": sha256_file(path),
                "bytes": path.stat().st_size,
                "mediaType": MEDIA_TYPES.get(
                    path.suffix.casefold(), "application/octet-stream"
                ),
            }
        )
    if not works:
        raise ValueError("Nenhuma obra selecionada")
    return {
        "schemaVersion": SCHEMA_VERSION,
        "state": "issued",
        "mark": MARK,
        "author": AUTHOR,
        "generatedAt": generated_at,
        "commit": commit.lower(),
        "selection": {"mode": "explicit-files", "count": len(works)},
        "works": works,
        "rightsNotice": (
            "Acesso gratuito não implica domínio público. "
            "A licença de reutilização deve ser declarada para cada obra."
        ),
        "legalNotice": (
            "Hashes SHA-256, histórico Git e esta marca ajudam a registrar "
            "integridade e cronologia, mas não são prova jurídica absoluta "
            "nem substituem registro formal ou orientação jurídica."
        ),
    }


def write_atomic(path: Path, payload: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{path.name}.", suffix=".tmp", dir=path.parent
    )
    try:
        with os.fdopen(descriptor, "wb") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary_name, path)
    finally:
        try:
            os.unlink(temporary_name)
        except FileNotFoundError:
            pass


def verify_manifest(root: Path, manifest: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if manifest.get("schemaVersion") != SCHEMA_VERSION:
        errors.append("schemaVersion inválida")
    if manifest.get("state") != "issued":
        errors.append("proveniência ainda não foi emitida")
    if manifest.get("mark") != MARK or manifest.get("author") != AUTHOR:
        errors.append("marca ou autor divergente")
    works = manifest.get("works")
    if not isinstance(works, list) or not works:
        errors.append("lista de obras ausente")
        return errors
    seen: set[str] = set()
    for index, work in enumerate(works):
        if not isinstance(work, dict):
            errors.append(f"works[{index}] inválido")
            continue
        relative = work.get("path")
        if not isinstance(relative, str) or not relative or relative in seen:
            errors.append(f"works[{index}].path ausente ou duplicado")
            continue
        seen.add(relative)
        candidate = root / relative
        try:
            candidate.resolve().relative_to(root.resolve())
        except ValueError:
            errors.append(f"{relative}: fora da raiz")
            continue
        if not candidate.is_file() or candidate.is_symlink():
            errors.append(f"{relative}: arquivo ausente ou link simbólico")
            continue
        if sha256_file(candidate) != work.get("sha256"):
            errors.append(f"{relative}: SHA-256 divergente")
        if candidate.stat().st_size != work.get("bytes"):
            errors.append(f"{relative}: tamanho divergente")
    return errors


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", default=".")
    parser.add_argument("--input", action="append", default=[])
    parser.add_argument("--commit")
    parser.add_argument("--generated-at")
    parser.add_argument("--output", default=str(DEFAULT_OUTPUT))
    parser.add_argument(
        "--check",
        action="store_true",
        help="Compara a saída determinística sem gravar",
    )
    parser.add_argument(
        "--verify",
        action="store_true",
        help="Verifica hashes do manifesto existente sem gravar",
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    root = Path(args.root).resolve()
    if not root.is_dir() or root == Path(root.anchor):
        print("ERRO: raiz ausente ou insegura.", file=sys.stderr)
        return 2
    output = Path(args.output)
    if not output.is_absolute():
        output = root / output
    try:
        output.resolve().relative_to(root)
    except ValueError:
        print("ERRO: output precisa estar dentro da raiz.", file=sys.stderr)
        return 2

    if args.verify:
        if args.input or args.commit or args.generated_at:
            print(
                "ERRO: --verify não aceita --input, --commit ou --generated-at.",
                file=sys.stderr,
            )
            return 2
        try:
            manifest = json.loads(output.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            print(f"ERRO: manifesto inválido: {exc}", file=sys.stderr)
            return 1
        errors = verify_manifest(root, manifest)
        for error in errors:
            print(f"- {error}")
        print("Proveniência: " + ("BLOQUEADA" if errors else "ÍNTEGRA"))
        return 1 if errors else 0

    commit = args.commit or os.environ.get("EDITORIAL_COMMIT")
    generated_at = args.generated_at or os.environ.get("EDITORIAL_GENERATED_AT")
    if not commit or not generated_at:
        print(
            "ERRO: --commit e --generated-at são obrigatórios e nunca são inferidos.",
            file=sys.stderr,
        )
        return 2
    try:
        selected = resolve_selected_files(root, args.input)
        if output.resolve() in {path.resolve() for path in selected}:
            raise ValueError("O manifesto de saída não pode selar a si próprio")
        manifest = build_manifest(
            root, selected, commit, generated_at
        )
        payload = canonical_bytes(manifest)
    except (OSError, ValueError) as exc:
        print(f"ERRO: {exc}", file=sys.stderr)
        return 2

    if args.check:
        try:
            current = output.read_bytes()
        except OSError:
            print("Proveniência: DIVERGENTE (saída ausente)")
            return 1
        if current != payload:
            print("Proveniência: DIVERGENTE")
            return 1
        print("Proveniência: ÍNTEGRA E DETERMINÍSTICA")
        return 0

    try:
        write_atomic(output, payload)
    except OSError as exc:
        print(f"ERRO: não foi possível gravar: {exc}", file=sys.stderr)
        return 1
    print(f"Proveniência emitida para {len(manifest['works'])} obra(s): {output}")
    print(
        "Aviso: hash/Git ajudam a registrar integridade e cronologia, "
        "mas não são prova jurídica absoluta."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
