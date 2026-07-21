#!/usr/bin/env python3
"""Atualiza somente o resumo agregado público da recuperação autoral.

O inventário privado é lido com as mesmas barreiras de
``recover_authorial_batches.py``. A saída contém apenas contagens allowlisted:
nenhum nome, caminho, ID, hash ou conteúdo de candidato pode ser serializado.

Por padrão, imprime o resumo no terminal sem escrever. ``--check`` compara a
fotografia pública atual sem alterar arquivos. A única escrita exige
``--write-public`` e fica presa ao JSON canônico do dashboard.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Sequence

from recover_authorial_batches import (
    RecoverySafetyError,
    apply_public_manifest_comparison,
    build_inventory,
    default_decision,
    load_public_manifest_index,
    select_next_batch,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "02_Biblioteca_IA_Engine/data/authorial_recovery_public_summary.json"
SCHEMA_VERSION = 1
KIND = "authorial-recovery-public-aggregate"
FORBIDDEN_SERIALIZED_MARKERS = (
    '"candidateId"',
    '"relativePath"',
    '"sourceFilename"',
    '"rootId"',
    '"sha256"',
)


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def build_public_summary(
    source_roots: list[Path],
    public_manifest: Path,
    *,
    baseline_candidates: int,
    batch_size: int,
) -> dict:
    inventory = build_inventory(source_roots)
    public_index = load_public_manifest_index(public_manifest)
    apply_public_manifest_comparison(inventory, public_index)
    candidates = inventory["candidates"]
    decisions = {item["candidateId"]: default_decision() for item in candidates}
    batch = select_next_batch(inventory, decisions, batch_size)
    summary = inventory["summary"]
    unique_sha = len({item["sha256"] for item in candidates})
    current_candidates = int(summary["candidates"])

    payload = {
        "schemaVersion": SCHEMA_VERSION,
        "kind": KIND,
        "generatedAt": utc_now(),
        "sourceMode": "private-inventory-read-only-aggregate",
        "comparisonMode": "canonical-public-manifest-read-only",
        "baseline": {"requestedCandidates": baseline_candidates},
        "current": {
            "candidates": current_candidates,
            "candidateDelta": current_candidates - baseline_candidates,
            "uniqueSha256": unique_sha,
            "exactDuplicateGroups": int(summary["exactDuplicateGroups"]),
            "filesInExactDuplicateGroups": int(summary["filesInExactDuplicateGroups"]),
            "possibleRenditionGroups": int(summary["possibleRenditionGroups"]),
            "alreadyPublicUniqueSha256": int(summary["alreadyPublicUniqueSha256"]),
            "alreadyPublicOccurrences": int(summary["alreadyPublicCandidates"]),
            "eligibleUniqueWorks": int(batch["eligibleUniqueWorks"]),
        },
        "nextBatch": {
            "requestedSize": batch_size,
            "selectedUniqueWorks": int(batch["selectedSize"]),
            "selectedOccurrences": int(batch["selectedOccurrences"]),
            "remainingUniqueWorksAfterBatch": int(batch["remainingAfterBatch"]),
        },
        "privacy": {
            "aggregateOnly": True,
            "containsCandidateNames": False,
            "containsPaths": False,
            "containsHashes": False,
            "publishesDocuments": False,
            "movesCopiesRenamesOrDeletes": False,
        },
    }
    validate_public_summary(payload)
    return payload


def validate_public_summary(payload: object) -> None:
    if not isinstance(payload, dict) or set(payload) != {
        "schemaVersion",
        "kind",
        "generatedAt",
        "sourceMode",
        "comparisonMode",
        "baseline",
        "current",
        "nextBatch",
        "privacy",
    }:
        raise RecoverySafetyError("Resumo público possui campos de topo inesperados.")
    expected_nested = {
        "baseline": {"requestedCandidates"},
        "current": {
            "candidates",
            "candidateDelta",
            "uniqueSha256",
            "exactDuplicateGroups",
            "filesInExactDuplicateGroups",
            "possibleRenditionGroups",
            "alreadyPublicUniqueSha256",
            "alreadyPublicOccurrences",
            "eligibleUniqueWorks",
        },
        "nextBatch": {
            "requestedSize",
            "selectedUniqueWorks",
            "selectedOccurrences",
            "remainingUniqueWorksAfterBatch",
        },
        "privacy": {
            "aggregateOnly",
            "containsCandidateNames",
            "containsPaths",
            "containsHashes",
            "publishesDocuments",
            "movesCopiesRenamesOrDeletes",
        },
    }
    for name, allowed in expected_nested.items():
        if not isinstance(payload.get(name), dict) or set(payload[name]) != allowed:
            raise RecoverySafetyError(f"Resumo público possui campos inesperados em {name}.")
    if payload.get("schemaVersion") != SCHEMA_VERSION or payload.get("kind") != KIND:
        raise RecoverySafetyError("Resumo público possui schema/kind incompatível.")
    if payload["privacy"] != {
        "aggregateOnly": True,
        "containsCandidateNames": False,
        "containsPaths": False,
        "containsHashes": False,
        "publishesDocuments": False,
        "movesCopiesRenamesOrDeletes": False,
    }:
        raise RecoverySafetyError("Contrato de privacidade do resumo público foi alterado.")

    encoded = json.dumps(payload, ensure_ascii=False, sort_keys=True)
    if re.search(r"\b[0-9a-f]{64}\b", encoded, flags=re.IGNORECASE):
        raise RecoverySafetyError("Resumo público tentou incluir hash individual.")
    if any(marker.casefold() in encoded.casefold() for marker in FORBIDDEN_SERIALIZED_MARKERS):
        raise RecoverySafetyError("Resumo público tentou incluir metadado individual.")


def comparable(payload: dict) -> dict:
    copy = dict(payload)
    copy.pop("generatedAt", None)
    return copy


def read_existing(path: Path) -> dict:
    if path.is_symlink() or not path.is_file():
        raise RecoverySafetyError("Resumo público canônico ausente ou não regular.")
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise RecoverySafetyError("Resumo público canônico ilegível.") from exc
    validate_public_summary(payload)
    return payload


def write_atomic(path: Path, payload: dict) -> None:
    if path.resolve(strict=False) != OUTPUT.resolve(strict=False):
        raise RecoverySafetyError("A escrita pública está presa ao JSON canônico do dashboard.")
    if path.is_symlink() or path.parent.is_symlink():
        raise RecoverySafetyError("Resumo público ou diretório não pode ser link simbólico.")
    encoded = (json.dumps(payload, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    temporary_name = ""
    try:
        with tempfile.NamedTemporaryFile(
            mode="wb",
            dir=path.parent,
            prefix=f".{path.name}.",
            suffix=".tmp",
            delete=False,
        ) as handle:
            temporary_name = handle.name
            handle.write(encoded)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary_name, path)
    finally:
        if temporary_name:
            Path(temporary_name).unlink(missing_ok=True)


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", action="append", required=True, type=Path)
    parser.add_argument("--public-manifest", required=True, type=Path)
    parser.add_argument("--baseline-candidates", type=int, default=549)
    parser.add_argument("--batch-size", type=int, choices=range(5, 11), default=5)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--check", action="store_true", help="Compara sem escrever.")
    mode.add_argument(
        "--write-public",
        action="store_true",
        help="Autoriza explicitamente atualizar somente o agregado público canônico.",
    )
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    try:
        args = parse_args(argv)
        if args.baseline_candidates < 0:
            raise RecoverySafetyError("Baseline precisa ser um inteiro não negativo.")
        payload = build_public_summary(
            args.source_root,
            args.public_manifest,
            baseline_candidates=args.baseline_candidates,
            batch_size=args.batch_size,
        )
        if args.check:
            existing = read_existing(OUTPUT)
            if comparable(existing) != comparable(payload):
                raise RecoverySafetyError("Dashboard agregado está desatualizado.")
            print("✅ Dashboard agregado atual e validado; nenhuma escrita realizada.")
        elif args.write_public:
            write_atomic(OUTPUT, payload)
            print("✅ Somente o resumo agregado público foi atualizado.")
        else:
            print(json.dumps(payload, ensure_ascii=False, indent=2))
            print("✅ Prévia agregada; nenhuma escrita realizada.")
        return 0
    except RecoverySafetyError as exc:
        print(f"❌ {exc}", file=sys.stderr)
        return 2
    except OSError as exc:
        print(f"❌ Falha segura, sem escrita pública: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
