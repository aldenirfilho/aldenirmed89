#!/usr/bin/env python3
"""Cria um inventario privado e reproduzivel de candidatos da Biblioteca.

O utilitario somente le metadados do sistema de arquivos e os bytes necessarios
para calcular SHA-256. Ele nao extrai texto, nao copia, nao move, nao apaga e
nao publica documentos. A saida e recusada se o caminho resolvido nao contiver
um componente chamado ``_private``.

Exemplo::

    python3 scripts_admin/inventory_library_candidates.py \
      --source-root /caminho/do/arquivo \
      --output /caminho/do/arquivo/_private/library-candidates.json \
      --exclude-dir backups-antigos

Para validar que um inventario continua refletindo a fonte sem regrava-lo::

    python3 scripts_admin/inventory_library_candidates.py \
      --source-root /caminho/do/arquivo \
      --output /caminho/do/arquivo/_private/library-candidates.json \
      --check
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path, PurePosixPath
from typing import Iterable, Sequence


SCHEMA_VERSION = 1
DEFAULT_IGNORED_DIRECTORY_NAMES = (
    ".git",
    ".venv",
    "__pycache__",
    "node_modules",
    "public_site",
    "site",
    "venv",
)
DEFAULT_EXTENSIONS = (
    ".apkg",
    ".csv",
    ".doc",
    ".docx",
    ".epub",
    ".htm",
    ".html",
    ".key",
    ".markdown",
    ".md",
    ".mobi",
    ".numbers",
    ".odp",
    ".ods",
    ".odt",
    ".pages",
    ".pdf",
    ".ppt",
    ".pptx",
    ".rtf",
    ".tsv",
    ".txt",
    ".xls",
    ".xlsx",
)
# Acervos publicados conhecidos. A sequencia pode aparecer em qualquer ponto
# abaixo de --source-root (por exemplo, dentro de um checkout do repositorio).
PUBLIC_ACERVO_SUFFIXES = (
    ("02_biblioteca_ia_engine", "acervo"),
    ("05_biblioteca_ia", "acervo"),
)
SHA256_PATTERN = re.compile(r"^[0-9a-f]{64}$")


def sort_key(value: str) -> tuple[str, str]:
    """Ordena de modo estavel apesar de caixa e composicao Unicode."""
    normalized = unicodedata.normalize("NFC", value)
    return normalized.casefold(), normalized


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def normalize_extension(value: str) -> str:
    extension = value.strip().casefold()
    if not extension:
        raise ValueError("Extensao vazia nao e permitida.")
    if not extension.startswith("."):
        extension = f".{extension}"
    if not re.fullmatch(r"\.[a-z0-9]+", extension):
        raise ValueError(f"Extensao invalida: {value!r}")
    return extension


def normalize_relative_rule(value: str, option: str) -> str:
    """Valida uma regra de exclusao sem permitir fuga do source-root."""
    raw = value.strip().replace("\\", "/")
    candidate = PurePosixPath(raw)
    if not raw or candidate.is_absolute() or ".." in candidate.parts:
        raise ValueError(f"{option} deve ser um caminho relativo seguro: {value!r}")
    normalized = candidate.as_posix().strip("/")
    if normalized in {"", "."}:
        raise ValueError(f"{option} nao pode apontar para a raiz.")
    return normalized


def validate_source_root(source_root: Path) -> Path:
    resolved = source_root.expanduser().resolve()
    if not resolved.is_dir():
        raise ValueError("--source-root deve apontar para um diretorio existente.")
    return resolved


def validate_output_path(output: Path) -> Path:
    """Recusa qualquer destino que nao esteja sob um componente _private."""
    expanded = output.expanduser()
    if expanded.is_symlink():
        raise ValueError("--output nao pode ser um link simbolico.")
    resolved = expanded.resolve(strict=False)
    if "_private" not in resolved.parts:
        raise ValueError("--output recusado: o caminho deve conter o diretorio _private.")
    if resolved.suffix.casefold() != ".json":
        raise ValueError("--output deve terminar em .json.")
    if resolved.exists() and not resolved.is_file():
        raise ValueError("--output existente deve ser um arquivo regular, nunca um link.")
    return resolved


def relative_parts_casefold(relative: str) -> tuple[str, ...]:
    return tuple(unicodedata.normalize("NFC", part).casefold() for part in PurePosixPath(relative).parts)


def is_automatic_public_acervo(relative: str) -> bool:
    parts = relative_parts_casefold(relative)
    return any(
        len(parts) >= len(suffix) and parts[-len(suffix) :] == suffix
        for suffix in PUBLIC_ACERVO_SUFFIXES
    )


def should_exclude_directory(
    relative: str,
    *,
    extra_rules: Sequence[str],
    public_acervo_rules: Sequence[str],
) -> bool:
    folded_parts = relative_parts_casefold(relative)
    if folded_parts[-1] in {name.casefold() for name in DEFAULT_IGNORED_DIRECTORY_NAMES}:
        return True
    if is_automatic_public_acervo(relative):
        return True

    folded_relative = "/".join(folded_parts)
    for rule in extra_rules:
        rule_parts = relative_parts_casefold(rule)
        # Uma regra de um componente e um nome de diretorio em qualquer nivel;
        # regras com mais componentes sao caminhos exatos relativos a fonte.
        if len(rule_parts) == 1 and rule_parts[0] in folded_parts:
            return True
        if folded_relative == "/".join(rule_parts):
            return True

    for rule in public_acervo_rules:
        if folded_relative == "/".join(relative_parts_casefold(rule)):
            return True
    return False


def authorship_hint(filename: str) -> bool:
    """Sinaliza somente marcador no nome; jamais confirma autoria."""
    normalized = unicodedata.normalize("NFKD", filename)
    ascii_name = normalized.encode("ascii", "ignore").decode("ascii").casefold()
    return "aldenir" in ascii_name


def iter_candidate_paths(
    source_root: Path,
    *,
    extensions: set[str],
    extra_rules: Sequence[str],
    public_acervo_rules: Sequence[str],
) -> Iterable[tuple[str, Path]]:
    """Percorre sem seguir links e poda diretorios excluidos antes da leitura."""
    for current_text, directory_names, filenames in os.walk(source_root, topdown=True, followlinks=False):
        current = Path(current_text)
        directory_names.sort(key=sort_key)
        kept_directories: list[str] = []
        for name in directory_names:
            candidate = current / name
            relative = candidate.relative_to(source_root).as_posix()
            if candidate.is_symlink():
                continue
            if should_exclude_directory(
                relative,
                extra_rules=extra_rules,
                public_acervo_rules=public_acervo_rules,
            ):
                continue
            kept_directories.append(name)
        directory_names[:] = kept_directories

        for filename in sorted(filenames, key=sort_key):
            path = current / filename
            if path.is_symlink() or not path.is_file():
                continue
            extension = path.suffix.casefold()
            if extension not in extensions:
                continue
            relative = path.relative_to(source_root).as_posix()
            yield relative, path


def build_inventory(
    source_root: Path,
    *,
    exclude_dirs: Sequence[str] = (),
    public_acervo_dirs: Sequence[str] = (),
    extensions: Sequence[str] = DEFAULT_EXTENSIONS,
) -> dict:
    root = validate_source_root(source_root)
    normalized_excludes = tuple(
        sorted(
            {normalize_relative_rule(item, "--exclude-dir") for item in exclude_dirs},
            key=sort_key,
        )
    )
    normalized_public_acervos = tuple(
        sorted(
            {normalize_relative_rule(item, "--public-acervo-dir") for item in public_acervo_dirs},
            key=sort_key,
        )
    )
    normalized_extensions = tuple(sorted({normalize_extension(item) for item in extensions}))
    extension_set = set(normalized_extensions)

    files: list[dict] = []
    by_hash: dict[str, list[dict]] = defaultdict(list)
    for relative, path in iter_candidate_paths(
        root,
        extensions=extension_set,
        extra_rules=normalized_excludes,
        public_acervo_rules=normalized_public_acervos,
    ):
        stat = path.stat()
        digest = sha256_file(path)
        entry = {
            "path": relative,
            "extension": path.suffix.casefold(),
            "sizeBytes": stat.st_size,
            "sha256": digest,
            "authorshipHint": authorship_hint(path.name),
        }
        files.append(entry)
        by_hash[digest].append(entry)

    files.sort(key=lambda item: sort_key(item["path"]))
    duplicate_groups = []
    for digest, matches in by_hash.items():
        if len(matches) < 2:
            continue
        duplicate_groups.append(
            {
                "sha256": digest,
                "sizeBytes": matches[0]["sizeBytes"],
                "paths": sorted((item["path"] for item in matches), key=sort_key),
            }
        )
    duplicate_groups.sort(key=lambda item: (sort_key(item["paths"][0]), item["sha256"]))

    extension_counts = Counter(item["extension"] for item in files)
    total_duplicate_files = sum(len(group["paths"]) for group in duplicate_groups)
    payload = {
        "schemaVersion": SCHEMA_VERSION,
        "kind": "private-library-candidate-inventory",
        "safety": {
            "contentExtracted": False,
            "filesCopiedMovedDeletedOrPublished": False,
            "pathsAreRelativeToSourceRoot": True,
            "authorshipHintPolicy": "filename-marker-only; never authorship confirmation",
        },
        "configuration": {
            "extensions": list(normalized_extensions),
            "defaultIgnoredDirectoryNames": list(DEFAULT_IGNORED_DIRECTORY_NAMES),
            "extraIgnoredDirectories": list(normalized_excludes),
            "explicitPublicAcervoDirectories": list(normalized_public_acervos),
            "automaticPublicAcervoSuffixes": ["/".join(item) for item in PUBLIC_ACERVO_SUFFIXES],
        },
        "summary": {
            "files": len(files),
            "totalBytes": sum(item["sizeBytes"] for item in files),
            "authorshipHints": sum(bool(item["authorshipHint"]) for item in files),
            "duplicateGroups": len(duplicate_groups),
            "filesInDuplicateGroups": total_duplicate_files,
            "byExtension": dict(sorted(extension_counts.items())),
        },
        "files": files,
        "duplicateGroups": duplicate_groups,
    }
    return payload


def validate_relative_inventory_path(value: object) -> bool:
    if not isinstance(value, str) or not value:
        return False
    path = PurePosixPath(value)
    return not path.is_absolute() and ".." not in path.parts and path.as_posix() == value


def validate_inventory_shape(payload: object) -> None:
    if not isinstance(payload, dict):
        raise ValueError("Inventario existente deve ter um objeto JSON na raiz.")
    if payload.get("schemaVersion") != SCHEMA_VERSION:
        raise ValueError("Inventario existente possui schemaVersion inesperada.")
    if payload.get("kind") != "private-library-candidate-inventory":
        raise ValueError("Inventario existente possui kind inesperado.")
    files = payload.get("files")
    if not isinstance(files, list):
        raise ValueError("Inventario existente nao possui lista files valida.")
    for entry in files:
        if not isinstance(entry, dict) or not validate_relative_inventory_path(entry.get("path")):
            raise ValueError("Inventario existente contem path absoluto ou inseguro.")
        if not isinstance(entry.get("sizeBytes"), int) or entry["sizeBytes"] < 0:
            raise ValueError("Inventario existente contem sizeBytes invalido.")
        if not isinstance(entry.get("sha256"), str) or not SHA256_PATTERN.fullmatch(entry["sha256"]):
            raise ValueError("Inventario existente contem SHA-256 invalido.")
        if not isinstance(entry.get("authorshipHint"), bool):
            raise ValueError("Inventario existente contem authorshipHint invalido.")
    groups = payload.get("duplicateGroups")
    if not isinstance(groups, list):
        raise ValueError("Inventario existente nao possui duplicateGroups valida.")
    for group in groups:
        if not isinstance(group, dict) or not isinstance(group.get("paths"), list):
            raise ValueError("Inventario existente contem grupo duplicado invalido.")
        if len(group["paths"]) < 2 or not all(validate_relative_inventory_path(item) for item in group["paths"]):
            raise ValueError("Inventario existente contem paths duplicados invalidos.")


def serialized(payload: dict) -> str:
    return json.dumps(payload, ensure_ascii=False, indent=2) + "\n"


def write_inventory(output: Path, payload: dict) -> None:
    destination = validate_output_path(output)
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(serialized(payload), encoding="utf-8")


def check_inventory(output: Path, expected: dict) -> bool:
    destination = validate_output_path(output)
    if not destination.is_file():
        raise ValueError("Inventario para --check nao existe.")
    with destination.open(encoding="utf-8") as handle:
        existing = json.load(handle)
    validate_inventory_shape(existing)
    return existing == expected


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Inventaria candidatos documentais sem copiar, extrair ou publicar arquivos."
    )
    parser.add_argument("--source-root", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument(
        "--exclude-dir",
        action="append",
        default=[],
        help="Nome de diretorio ou caminho relativo a ignorar; pode ser repetido.",
    )
    parser.add_argument(
        "--public-acervo-dir",
        action="append",
        default=[],
        help="Caminho relativo de outro acervo publico a ignorar; pode ser repetido.",
    )
    parser.add_argument(
        "--extension",
        action="append",
        dest="extensions",
        help="Substitui as extensoes padrao; pode ser repetido.",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Valida o inventario existente contra a fonte sem regrava-lo.",
    )
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        output = validate_output_path(args.output)
        inventory = build_inventory(
            args.source_root,
            exclude_dirs=args.exclude_dir,
            public_acervo_dirs=args.public_acervo_dir,
            extensions=args.extensions or DEFAULT_EXTENSIONS,
        )
        if args.check:
            if not check_inventory(output, inventory):
                print("❌ Inventario privado diverge da fonte atual.", file=sys.stderr)
                return 1
            print(f"✅ Inventario privado valido: {inventory['summary']['files']} arquivo(s).")
            return 0

        write_inventory(output, inventory)
        print(
            "✅ Inventario privado gravado: "
            f"{inventory['summary']['files']} arquivo(s), "
            f"{inventory['summary']['duplicateGroups']} grupo(s) duplicado(s)."
        )
        return 0
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"❌ {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
