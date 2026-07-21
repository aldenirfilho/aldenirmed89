#!/usr/bin/env python3
"""Planeja a recuperação autoral em pequenos lotes, sem publicar arquivos.

Contrato de segurança:

* as fontes precisam estar sob um componente ``inbox`` ou ``_private``;
* o utilitário lê os arquivos-fonte para metadados e SHA-256;
* ``--public-manifest`` permite confrontar, em modo somente leitura, os hashes
  com o manifesto público canônico;
* por padrão nenhuma pasta ou arquivo é criado;
* ``--write-private`` permite escrever apenas um registro JSON sob ``_private``;
* nenhum arquivo-fonte é copiado, movido, renomeado, apagado ou modificado;
* nenhum arquivo público, catálogo ou manifesto público é alterado.

O registro privado mantém o inventário atual, grupos de duplicatas/rendições,
decisões humanas por gate e o próximo lote de 5 a 10 candidatos. Completar os
gates não publica nada: o estado final continua exigindo promoção humana por um
fluxo separado.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import unicodedata
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath
from typing import Iterable, Sequence


SCHEMA_VERSION = 1
REGISTRY_KIND = "private-authorial-recovery-decisions"
PRIVATE_SOURCE_SEGMENTS = {"inbox", "_private"}
IGNORED_DIRECTORY_NAMES = {
    ".git",
    ".venv",
    "__pycache__",
    "node_modules",
    "public_site",
    "site",
    "venv",
}
SUPPORTED_EXTENSIONS = {
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
}

GATE_CHOICES = {
    "authorship": (
        "pending",
        "confirmed-author",
        "author-with-ai",
        "third-party",
        "rejected",
    ),
    "license": (
        "pending",
        "owned",
        "explicit-permission",
        "open-license",
        "official-link-only",
        "rejected",
    ),
    "privacy": (
        "pending",
        "no-sensitive-data",
        "anonymized-approved",
        "quarantined",
        "rejected",
    ),
    "clinicalReview": (
        "pending",
        "approved",
        "not-applicable",
        "outdated-quarantine",
        "rejected",
    ),
}
BLOCKING_GATE_VALUES = {
    # Obras de terceiros podem permanecer como referência privada ou link oficial,
    # mas nunca entram no fluxo de republicação deste recuperador.
    "authorship": {"third-party", "rejected"},
    "license": {"official-link-only", "rejected"},
    "privacy": {"quarantined", "rejected"},
    "clinicalReview": {"outdated-quarantine", "rejected"},
}
MAX_EVIDENCE_CHARS = 2_000
MAX_NOTES_CHARS = 4_000
MAX_PUBLIC_MANIFEST_BYTES = 25 * 1024 * 1024


class RecoverySafetyError(RuntimeError):
    """Falha controlada que mantém a operação fechada e sem escrita."""


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def nfc(value: str) -> str:
    return unicodedata.normalize("NFC", value)


def sort_key(value: str) -> tuple[str, str]:
    normalized = nfc(value)
    return normalized.casefold(), normalized


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def short_id(prefix: str, value: str, length: int = 20) -> str:
    return f"{prefix}-{hashlib.sha256(value.encode('utf-8')).hexdigest()[:length]}"


def private_component_present(path: Path, allowed: set[str]) -> bool:
    return any(part.casefold() in allowed for part in path.parts)


def validate_private_source(raw_path: Path) -> Path:
    expanded = raw_path.expanduser()
    if expanded.is_symlink():
        raise RecoverySafetyError(f"Fonte privada não pode ser link simbólico: {raw_path}")
    try:
        resolved = expanded.resolve(strict=True)
    except OSError as exc:
        raise RecoverySafetyError(f"Fonte privada inexistente ou ilegível: {raw_path}") from exc
    if not resolved.is_dir():
        raise RecoverySafetyError(f"--source-root deve apontar para um diretório: {raw_path}")
    if not private_component_present(resolved, PRIVATE_SOURCE_SEGMENTS):
        raise RecoverySafetyError(
            "Fonte recusada: o caminho resolvido precisa conter um componente inbox ou _private."
        )
    return resolved


def validate_registry_path(raw_path: Path) -> Path:
    expanded = raw_path.expanduser()
    if expanded.is_symlink():
        raise RecoverySafetyError("O registro privado não pode ser um link simbólico.")
    resolved = expanded.resolve(strict=False)
    if not private_component_present(resolved, {"_private"}):
        raise RecoverySafetyError(
            "Registro recusado: --registry precisa ficar sob um componente exato _private."
        )
    if resolved.suffix.casefold() != ".json":
        raise RecoverySafetyError("O registro privado precisa terminar em .json.")
    if resolved.exists() and (resolved.is_symlink() or not resolved.is_file()):
        raise RecoverySafetyError("O registro existente precisa ser um arquivo regular.")
    return resolved


def validate_public_manifest_path(raw_path: Path) -> Path:
    """Valida o único artefato público que a ferramenta pode ler explicitamente."""

    expanded = raw_path.expanduser()
    if expanded.is_symlink():
        raise RecoverySafetyError("O manifesto público não pode ser um link simbólico.")
    try:
        resolved = expanded.resolve(strict=True)
    except OSError as exc:
        raise RecoverySafetyError("Manifesto público inexistente ou ilegível.") from exc
    if not resolved.is_file() or resolved.is_symlink():
        raise RecoverySafetyError("--public-manifest precisa apontar para arquivo regular.")
    if resolved.name != "biblioteca_documentos_manifest.json":
        raise RecoverySafetyError(
            "--public-manifest precisa apontar para biblioteca_documentos_manifest.json."
        )
    if resolved.stat().st_size > MAX_PUBLIC_MANIFEST_BYTES:
        raise RecoverySafetyError("Manifesto público excede o limite seguro de leitura.")
    return resolved


def load_public_manifest_index(raw_path: Path) -> dict:
    """Lê e valida o manifesto público sem executar, resolver ou alterar seus paths."""

    path = validate_public_manifest_path(raw_path)
    try:
        raw = path.read_bytes()
        payload = json.loads(raw.decode("utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise RecoverySafetyError("Manifesto público ilegível ou JSON inválido.") from exc
    if not isinstance(payload, dict) or not isinstance(payload.get("files"), list):
        raise RecoverySafetyError("Manifesto público precisa conter uma lista files válida.")

    paths_by_sha: dict[str, set[str]] = defaultdict(set)
    for index, entry in enumerate(payload["files"]):
        if not isinstance(entry, dict):
            raise RecoverySafetyError(
                f"Entrada {index} do manifesto público precisa ser um objeto."
            )
        digest = entry.get("sourceSha256")
        public_path = entry.get("path")
        if not isinstance(digest, str) or not re.fullmatch(r"[0-9a-fA-F]{64}", digest):
            raise RecoverySafetyError(
                f"Entrada {index} do manifesto público possui sourceSha256 inválido."
            )
        if not isinstance(public_path, str):
            raise RecoverySafetyError(
                f"Entrada {index} do manifesto público possui path inválido."
            )
        canonical_path = nfc(public_path.strip())
        if (
            not canonical_path
            or len(canonical_path) > 4_096
            or "\\" in canonical_path
            or any(ord(char) < 32 for char in canonical_path)
        ):
            raise RecoverySafetyError(
                f"Entrada {index} do manifesto público possui path não canônico."
            )
        pure = PurePosixPath(canonical_path)
        if (
            pure.is_absolute()
            or ".." in pure.parts
            or pure.as_posix() != canonical_path
            or not pure.parts
            or pure.parts[0].casefold() != "acervo"
        ):
            raise RecoverySafetyError(
                f"Entrada {index} do manifesto público escapou do acervo canônico."
            )
        paths_by_sha[digest.casefold()].add(canonical_path)

    return {
        "manifestPath": str(path),
        "manifestSha256": hashlib.sha256(raw).hexdigest(),
        "fileEntries": len(payload["files"]),
        "uniqueSourceSha256": len(paths_by_sha),
        "pathsBySha": {
            digest: sorted(paths, key=sort_key) for digest, paths in paths_by_sha.items()
        },
    }


def nearest_existing_parent(path: Path) -> Path:
    current = path
    while not current.exists() and current != current.parent:
        current = current.parent
    return current


def find_git_root(path: Path) -> Path | None:
    start = nearest_existing_parent(path)
    for candidate in (start, *start.parents):
        if (candidate / ".git").exists():
            return candidate
    return None


def require_gitignored_if_in_repository(path: Path) -> None:
    root = find_git_root(path.parent)
    if root is None:
        return
    try:
        relative = path.relative_to(root).as_posix()
    except ValueError as exc:
        raise RecoverySafetyError("Registro privado escapou do repositório detectado.") from exc

    tracked = subprocess.run(
        ["git", "-C", str(root), "ls-files", "--error-unmatch", "--", relative],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False,
    )
    if tracked.returncode == 0:
        raise RecoverySafetyError("Registro privado já está rastreado pelo Git; escrita recusada.")

    ignored = subprocess.run(
        ["git", "-C", str(root), "check-ignore", "--quiet", "--no-index", "--", relative],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False,
    )
    if ignored.returncode != 0:
        raise RecoverySafetyError(
            "Registro privado não está coberto pelo .gitignore; escrita recusada."
        )


def normalize_work_key(filename: str) -> str:
    """Cria uma pista conservadora para possíveis rendições da mesma obra."""

    stem = Path(filename).stem
    value = unicodedata.normalize("NFKD", stem).encode("ascii", "ignore").decode("ascii")
    value = value.casefold()
    cleanup_patterns = (
        r"\s*[\(\[]\d+[\)\]]\s*$",
        r"(?:[\s_-]+)(?:copy|copia)(?:[\s_-]*\d+)?\s*$",
        r"(?:[\s_-]+)(?:final|revisad[oa]|versao|version|rev)(?:[\s_-]*\d+)?\s*$",
        r"(?:[\s_-]+)v\d+(?:\.\d+)*\s*$",
    )
    previous = None
    while previous != value:
        previous = value
        for pattern in cleanup_patterns:
            value = re.sub(pattern, "", value, flags=re.IGNORECASE)
    value = re.sub(r"[^a-z0-9]+", " ", value).strip()
    return value or "documento-sem-chave"


def filename_authorship_hint(filename: str) -> str:
    normalized = unicodedata.normalize("NFKD", filename)
    ascii_name = normalized.encode("ascii", "ignore").decode("ascii").casefold()
    return "filename-marker-only" if re.search(r"\b(?:dr\s*)?aldenir\b", ascii_name) else "none"


def iter_private_files(source_root: Path) -> Iterable[tuple[str, Path]]:
    for current_text, directory_names, filenames in os.walk(
        source_root, topdown=True, followlinks=False
    ):
        current = Path(current_text)
        kept: list[str] = []
        for name in sorted(directory_names, key=sort_key):
            candidate = current / name
            if candidate.is_symlink() or name.casefold() in IGNORED_DIRECTORY_NAMES:
                continue
            kept.append(name)
        directory_names[:] = kept

        for filename in sorted(filenames, key=sort_key):
            path = current / filename
            if path.is_symlink() or not path.is_file():
                continue
            if path.suffix.casefold() not in SUPPORTED_EXTENSIONS:
                continue
            relative = nfc(path.relative_to(source_root).as_posix())
            pure = PurePosixPath(relative)
            if pure.is_absolute() or ".." in pure.parts or pure.as_posix() != relative:
                raise RecoverySafetyError(f"Caminho privado não canônico: {relative!r}")
            yield relative, path


def build_inventory(source_roots: Sequence[Path]) -> dict:
    resolved_roots: list[Path] = []
    seen_roots: set[Path] = set()
    for raw in source_roots:
        resolved = validate_private_source(raw)
        if resolved in seen_roots:
            raise RecoverySafetyError(f"Fonte privada repetida: {resolved}")
        seen_roots.add(resolved)
        resolved_roots.append(resolved)

    candidates: list[dict] = []
    roots_payload: list[dict] = []
    by_sha: dict[str, list[dict]] = defaultdict(list)
    by_work: dict[str, list[dict]] = defaultdict(list)

    for root in sorted(resolved_roots, key=lambda item: sort_key(str(item))):
        root_id = short_id("root", str(root), 12)
        roots_payload.append({"rootId": root_id, "path": str(root)})
        for relative, path in iter_private_files(root):
            stat = path.stat()
            digest = sha256_file(path)
            candidate_id = short_id("cand", f"{root_id}\0{relative}\0{digest}", 24)
            entry = {
                "candidateId": candidate_id,
                "rootId": root_id,
                "relativePath": relative,
                "filename": path.name,
                "extension": path.suffix.casefold(),
                "sizeBytes": stat.st_size,
                "sha256": digest,
                "workKey": normalize_work_key(path.name),
                "authorshipHint": filename_authorship_hint(path.name),
                "duplicateGroupId": None,
                "renditionGroupId": None,
                "alreadyPublicPaths": [],
            }
            candidates.append(entry)
            by_sha[digest].append(entry)
            by_work[entry["workKey"]].append(entry)

    duplicate_groups: list[dict] = []
    for digest, members in by_sha.items():
        if len(members) < 2:
            continue
        group_id = f"dup-{digest[:20]}"
        member_ids = sorted(item["candidateId"] for item in members)
        for item in members:
            item["duplicateGroupId"] = group_id
        duplicate_groups.append(
            {"groupId": group_id, "sha256": digest, "candidateIds": member_ids}
        )

    rendition_groups: list[dict] = []
    for work_key, members in by_work.items():
        extensions = {item["extension"] for item in members}
        if len(members) < 2 or len(extensions) < 2:
            continue
        group_id = short_id("rend", work_key, 20)
        member_ids = sorted(item["candidateId"] for item in members)
        for item in members:
            item["renditionGroupId"] = group_id
        rendition_groups.append(
            {
                "groupId": group_id,
                "workKey": work_key,
                "extensions": sorted(extensions),
                "candidateIds": member_ids,
            }
        )

    candidates.sort(
        key=lambda item: (
            sort_key(item["workKey"]),
            sort_key(item["relativePath"]),
            item["rootId"],
        )
    )
    duplicate_groups.sort(key=lambda item: item["groupId"])
    rendition_groups.sort(key=lambda item: (sort_key(item["workKey"]), item["groupId"]))
    return {
        "scannedAt": utc_now(),
        "sourceRoots": roots_payload,
        "summary": {
            "candidates": len(candidates),
            "totalBytes": sum(item["sizeBytes"] for item in candidates),
            "exactDuplicateGroups": len(duplicate_groups),
            "filesInExactDuplicateGroups": sum(
                len(item["candidateIds"]) for item in duplicate_groups
            ),
            "possibleRenditionGroups": len(rendition_groups),
            "publicComparisonApplied": False,
            "alreadyPublicCandidates": 0,
            "alreadyPublicUniqueSha256": 0,
        },
        "candidates": candidates,
        "duplicateGroups": duplicate_groups,
        "renditionGroups": rendition_groups,
        "publicComparison": {
            "applied": False,
            "manifestPath": None,
            "manifestSha256": None,
            "fileEntries": 0,
            "uniqueSourceSha256": 0,
            "matchedCandidates": 0,
            "matchedUniqueSha256": 0,
        },
    }


def apply_public_manifest_comparison(inventory: dict, manifest_index: dict | None) -> None:
    """Anota correspondências por SHA sem remover ocorrências nem tocar no público."""

    if manifest_index is None:
        return
    paths_by_sha = manifest_index["pathsBySha"]
    matched_hashes: set[str] = set()
    matched_candidates = 0
    for candidate in inventory["candidates"]:
        public_paths = list(paths_by_sha.get(candidate["sha256"], ()))
        candidate["alreadyPublicPaths"] = public_paths
        if public_paths:
            matched_hashes.add(candidate["sha256"])
            matched_candidates += 1

    inventory["summary"].update(
        {
            "publicComparisonApplied": True,
            "alreadyPublicCandidates": matched_candidates,
            "alreadyPublicUniqueSha256": len(matched_hashes),
        }
    )
    inventory["publicComparison"] = {
        "applied": True,
        "manifestPath": manifest_index["manifestPath"],
        "manifestSha256": manifest_index["manifestSha256"],
        "fileEntries": manifest_index["fileEntries"],
        "uniqueSourceSha256": manifest_index["uniqueSourceSha256"],
        "matchedCandidates": matched_candidates,
        "matchedUniqueSha256": len(matched_hashes),
    }


def empty_gate(status: str = "pending", evidence: str = "", reviewed_at: str = "") -> dict:
    return {"status": status, "evidence": evidence, "reviewedAt": reviewed_at}


def default_decision() -> dict:
    return {
        "authorship": empty_gate(),
        "license": empty_gate(),
        "privacy": empty_gate(),
        "clinicalReview": empty_gate(),
        "notes": "",
        "updatedAt": "",
    }


def clean_text(value: object, *, limit: int, field: str) -> str:
    text = str(value or "").strip()
    if any(ord(char) < 32 and char not in "\n\t" for char in text):
        raise RecoverySafetyError(f"{field} contém caractere de controle não permitido.")
    if len(text) > limit:
        raise RecoverySafetyError(f"{field} excede o limite de {limit} caracteres.")
    return text


def normalize_gate(name: str, value: object) -> dict:
    source = value if isinstance(value, dict) else {}
    status = str(source.get("status") or "pending")
    if status not in GATE_CHOICES[name]:
        raise RecoverySafetyError(f"Status inválido no gate {name}: {status!r}")
    evidence = clean_text(
        source.get("evidence"), limit=MAX_EVIDENCE_CHARS, field=f"{name}.evidence"
    )
    reviewed_at = clean_text(
        source.get("reviewedAt"), limit=80, field=f"{name}.reviewedAt"
    )
    return empty_gate(status, evidence, reviewed_at)


def normalize_decision(value: object) -> dict:
    source = value if isinstance(value, dict) else {}
    return {
        "authorship": normalize_gate("authorship", source.get("authorship")),
        "license": normalize_gate("license", source.get("license")),
        "privacy": normalize_gate("privacy", source.get("privacy")),
        "clinicalReview": normalize_gate("clinicalReview", source.get("clinicalReview")),
        "notes": clean_text(source.get("notes"), limit=MAX_NOTES_CHARS, field="notes"),
        "updatedAt": clean_text(source.get("updatedAt"), limit=80, field="updatedAt"),
    }


def decision_state(decision: dict) -> str:
    for gate_name, blocked in BLOCKING_GATE_VALUES.items():
        if decision[gate_name]["status"] in blocked:
            return "hold-private"
    for gate_name in GATE_CHOICES:
        gate = decision[gate_name]
        if gate["status"] == "pending" or not gate["evidence"]:
            return "pending"
    return "gates-complete-human-review-required"


def load_registry(path: Path) -> dict | None:
    if not path.exists():
        return None
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise RecoverySafetyError("Registro privado ilegível ou JSON inválido.") from exc
    if not isinstance(payload, dict):
        raise RecoverySafetyError("Registro privado precisa conter um objeto JSON.")
    if payload.get("schemaVersion") != SCHEMA_VERSION or payload.get("kind") != REGISTRY_KIND:
        raise RecoverySafetyError("Registro privado possui schema/kind incompatível.")
    raw_decisions = payload.get("decisions")
    if not isinstance(raw_decisions, dict):
        raise RecoverySafetyError("Registro privado não possui objeto decisions válido.")
    decisions: dict[str, dict] = {}
    for candidate_id, decision in raw_decisions.items():
        if not re.fullmatch(r"cand-[0-9a-f]{24}", str(candidate_id)):
            raise RecoverySafetyError(f"ID inválido no registro privado: {candidate_id!r}")
        decisions[str(candidate_id)] = normalize_decision(decision)
    payload["decisions"] = decisions
    return payload


def merge_decisions(existing: dict | None, candidate_ids: set[str]) -> dict[str, dict]:
    decisions = dict((existing or {}).get("decisions") or {})
    for candidate_id in candidate_ids:
        decisions.setdefault(candidate_id, default_decision())
    return {key: normalize_decision(value) for key, value in sorted(decisions.items())}


def apply_decision_update(
    decisions: dict[str, dict],
    candidate_id: str,
    updates: dict[str, object],
) -> None:
    if candidate_id not in decisions:
        raise RecoverySafetyError("--candidate-id não pertence ao inventário atual.")
    decision = normalize_decision(decisions[candidate_id])
    now = utc_now()
    for gate_name in GATE_CHOICES:
        status_key = f"{gate_name}Status"
        evidence_key = f"{gate_name}Evidence"
        if updates.get(status_key) is not None:
            decision[gate_name]["status"] = str(updates[status_key])
            decision[gate_name]["reviewedAt"] = now
        if updates.get(evidence_key) is not None:
            decision[gate_name]["evidence"] = clean_text(
                updates[evidence_key],
                limit=MAX_EVIDENCE_CHARS,
                field=f"{gate_name}.evidence",
            )
            decision[gate_name]["reviewedAt"] = now
    if updates.get("notes") is not None:
        decision["notes"] = clean_text(
            updates["notes"], limit=MAX_NOTES_CHARS, field="notes"
        )
    decision["updatedAt"] = now
    decisions[candidate_id] = normalize_decision(decision)


def select_next_batch(
    inventory: dict,
    decisions: dict[str, dict],
    batch_size: int,
) -> dict:
    occurrences_by_sha: dict[str, list[dict]] = defaultdict(list)
    for item in inventory["candidates"]:
        occurrences_by_sha[item["sha256"]].append(item)

    eligible_works: list[dict] = []
    excluded_public_hashes = 0
    excluded_public_occurrences = 0
    reviewed_or_held_hashes = 0
    conflicting_decisions: list[dict] = []
    for digest, occurrences in occurrences_by_sha.items():
        if any(item["alreadyPublicPaths"] for item in occurrences):
            excluded_public_hashes += 1
            excluded_public_occurrences += len(occurrences)
            continue
        states = {
            decision_state(decisions[item["candidateId"]]) for item in occurrences
        }
        if len(states) > 1:
            conflicting_decisions.append(
                {
                    "sha256": digest,
                    "occurrences": [
                        {
                            "candidateId": item["candidateId"],
                            "relativePath": item["relativePath"],
                            "state": decision_state(decisions[item["candidateId"]]),
                        }
                        for item in occurrences
                    ],
                }
            )
            continue
        if states != {"pending"}:
            reviewed_or_held_hashes += 1
            continue
        representative = occurrences[0]
        eligible_works.append(
            {
                "sha256": digest,
                "representativeCandidateId": representative["candidateId"],
                "occurrences": [
                    {
                        "candidateId": item["candidateId"],
                        "rootId": item["rootId"],
                        "relativePath": item["relativePath"],
                    }
                    for item in occurrences
                ],
            }
        )

    selected = eligible_works[:batch_size]
    remaining = eligible_works[batch_size:]
    return {
        "plannedAt": utc_now(),
        "requestedSize": batch_size,
        "selectionUnit": "unique-sha256",
        "exactDuplicatesConsumeAdditionalSlots": False,
        "selectedSize": len(selected),
        "finalPartialBatch": 0 < len(selected) < 5,
        "eligibleUniqueWorks": len(eligible_works),
        "eligibleOccurrences": sum(
            len(work["occurrences"]) for work in eligible_works
        ),
        "selectedOccurrences": sum(len(work["occurrences"]) for work in selected),
        "remainingAfterBatch": len(remaining),
        "remainingOccurrencesAfterBatch": sum(
            len(work["occurrences"]) for work in remaining
        ),
        "excludedAlreadyPublicUniqueSha256": excluded_public_hashes,
        "excludedAlreadyPublicOccurrences": excluded_public_occurrences,
        "reviewedOrHeldUniqueSha256": reviewed_or_held_hashes,
        "conflictingDecisionUniqueSha256": len(conflicting_decisions),
        "conflictingDecisions": conflicting_decisions,
        "candidateIds": [work["representativeCandidateId"] for work in selected],
        "works": selected,
        "gateChecklist": ["authorship", "license", "privacy", "clinicalReview"],
        "safety": (
            "review-only; exact occurrences are preserved; no publication, move, "
            "copy, rename or deletion"
        ),
    }


def build_registry(
    inventory: dict,
    existing: dict | None,
    decisions: dict[str, dict],
    next_batch: dict,
) -> dict:
    current_ids = {item["candidateId"] for item in inventory["candidates"]}
    orphaned = sorted(set(decisions) - current_ids)
    states = defaultdict(int)
    for candidate_id in current_ids:
        states[decision_state(decisions[candidate_id])] += 1
    return {
        "schemaVersion": SCHEMA_VERSION,
        "kind": REGISTRY_KIND,
        "updatedAt": utc_now(),
        "policy": {
            "privateOnly": True,
            "defaultMode": "read-only",
            "writeRequires": "--write-private",
            "publishesCopiesMovesRenamesOrDeletes": False,
            "completedGatesStillRequireHumanPromotion": True,
            "authorshipHintIsProof": False,
            "publicManifestReadOnly": True,
            "alreadyPublicHashesExcludedFromBatch": True,
            "exactDuplicatesConsumeOneBatchSlot": True,
            "exactDuplicateGroupingAuthorizesDeletion": False,
            "thirdPartyAlwaysRemainsPrivate": True,
            "conflictingDuplicateDecisionsRequireResolution": True,
        },
        "inventory": inventory,
        "decisionSummary": {
            "currentCandidates": len(current_ids),
            "pending": states["pending"],
            "holdPrivate": states["hold-private"],
            "gatesCompleteHumanReviewRequired": states[
                "gates-complete-human-review-required"
            ],
            "orphanedDecisionIds": orphaned,
        },
        "decisions": decisions,
        "nextBatch": next_batch,
        "previousRegistryUpdatedAt": (existing or {}).get("updatedAt"),
    }


def write_registry(path: Path, payload: dict) -> None:
    require_gitignored_if_in_repository(path)
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
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
        os.chmod(temporary_name, 0o600)
        os.replace(temporary_name, path)
    finally:
        if temporary_name:
            Path(temporary_name).unlink(missing_ok=True)


def print_summary(payload: dict, *, wrote: bool) -> None:
    inventory = payload["inventory"]
    summary = inventory["summary"]
    batch = payload["nextBatch"]
    by_id = {item["candidateId"]: item for item in inventory["candidates"]}
    print("🔒 RECUPERAÇÃO AUTORAL — REGISTRO PRIVADO")
    print("Modo: " + ("ESCRITA PRIVADA EXPLÍCITA" if wrote else "SOMENTE LEITURA"))
    print(
        f"Candidatos: {summary['candidates']} | "
        f"duplicatas exatas: {summary['exactDuplicateGroups']} grupo(s) | "
        f"rendições possíveis: {summary['possibleRenditionGroups']} grupo(s)"
    )
    if summary["publicComparisonApplied"]:
        print(
            "Manifesto público: SOMENTE LEITURA | "
            f"{summary['alreadyPublicUniqueSha256']} obra(s) SHA já pública(s), "
            f"{summary['alreadyPublicCandidates']} ocorrência(s) fora do lote"
        )
    else:
        print(
            "⚠️ Manifesto público: comparação NÃO APLICADA; use --public-manifest "
            "para evitar retriagem de hashes já publicados."
        )
    print(
        f"Próximo lote: {batch['selectedSize']} obra(s) SHA | "
        f"{batch['selectedOccurrences']} ocorrência(s) preservada(s) | "
        f"restantes depois do lote: {batch['remainingAfterBatch']} obra(s)"
    )
    if batch["conflictingDecisionUniqueSha256"]:
        print(
            "⚠️ Decisões conflitantes em duplicatas exatas: "
            f"{batch['conflictingDecisionUniqueSha256']} SHA. "
            "Revise cada ocorrência listada no registro privado; o SHA permanece fora do lote."
        )
    for index, candidate_id in enumerate(batch["candidateIds"], start=1):
        item = by_id[candidate_id]
        groups = ", ".join(
            value
            for value in (item.get("duplicateGroupId"), item.get("renditionGroupId"))
            if value
        ) or "sem grupo"
        print(
            f"  {index}. {candidate_id} | {item['relativePath']} | "
            f"{item['extension']} | {groups} | "
            f"ocorrências SHA: {len(batch['works'][index - 1]['occurrences'])}"
        )
    if batch["finalPartialBatch"]:
        print("ℹ️ Lote final parcial: restam menos de 5 candidatos pendentes.")
    if wrote:
        print("✅ Apenas o registro privado foi atualizado.")
    else:
        print("✅ Nenhum arquivo ou diretório foi criado ou alterado.")
    print("⛔ Esta ferramenta não publica, copia, move, renomeia ou apaga documentos.")


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Inventaria e planeja lotes privados de recuperação autoral sem publicar arquivos."
    )
    parser.add_argument(
        "--source-root",
        action="append",
        required=True,
        type=Path,
        help="Diretório privado contendo componente inbox ou _private; pode ser repetido.",
    )
    parser.add_argument(
        "--registry",
        required=True,
        type=Path,
        help="Único JSON de decisões; precisa ficar sob _private.",
    )
    parser.add_argument(
        "--public-manifest",
        type=Path,
        help=(
            "Leitura opcional de biblioteca_documentos_manifest.json para excluir "
            "do lote hashes já públicos; o manifesto nunca é alterado."
        ),
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        choices=range(5, 11),
        default=5,
        metavar="{5..10}",
    )
    parser.add_argument(
        "--write-private",
        action="store_true",
        help="Autoriza explicitamente criar/atualizar somente o registro privado.",
    )
    parser.add_argument("--candidate-id", help="Candidato atual cuja decisão será atualizada.")

    for gate_name, option_prefix in (
        ("authorship", "authorship"),
        ("license", "license"),
        ("privacy", "privacy"),
        ("clinicalReview", "clinical-review"),
    ):
        parser.add_argument(
            f"--{option_prefix}-status",
            dest=f"{gate_name}Status",
            choices=GATE_CHOICES[gate_name],
        )
        parser.add_argument(
            f"--{option_prefix}-evidence",
            dest=f"{gate_name}Evidence",
            help="Evidência curta, sem dado de paciente; fica somente no registro privado.",
        )
    parser.add_argument(
        "--notes",
        help="Nota operacional curta, sem dado identificável; fica somente no registro privado.",
    )
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    try:
        args = parse_args(argv)
        registry_path = validate_registry_path(args.registry)
        existing = load_registry(registry_path)
        inventory = build_inventory(args.source_root)
        public_manifest_index = (
            load_public_manifest_index(args.public_manifest)
            if args.public_manifest is not None
            else None
        )
        apply_public_manifest_comparison(inventory, public_manifest_index)
        candidate_ids = {item["candidateId"] for item in inventory["candidates"]}
        decisions = merge_decisions(existing, candidate_ids)

        update_values = {
            "authorshipStatus": args.authorshipStatus,
            "authorshipEvidence": args.authorshipEvidence,
            "licenseStatus": args.licenseStatus,
            "licenseEvidence": args.licenseEvidence,
            "privacyStatus": args.privacyStatus,
            "privacyEvidence": args.privacyEvidence,
            "clinicalReviewStatus": args.clinicalReviewStatus,
            "clinicalReviewEvidence": args.clinicalReviewEvidence,
            "notes": args.notes,
        }
        has_update = any(value is not None for value in update_values.values())
        if (args.candidate_id is None) != (not has_update):
            raise RecoverySafetyError(
                "Atualização exige --candidate-id e ao menos um campo de decisão."
            )
        if (has_update or args.candidate_id) and not args.write_private:
            raise RecoverySafetyError(
                "Atualizar decisões exige autorização explícita --write-private."
            )
        if has_update:
            apply_decision_update(decisions, args.candidate_id, update_values)

        next_batch = select_next_batch(inventory, decisions, args.batch_size)
        payload = build_registry(inventory, existing, decisions, next_batch)
        if args.write_private:
            write_registry(registry_path, payload)
        print_summary(payload, wrote=args.write_private)
        return 0
    except RecoverySafetyError as exc:
        print(f"❌ {exc}", file=sys.stderr)
        return 2
    except (OSError, subprocess.SubprocessError) as exc:
        print(f"❌ Falha segura, sem publicação: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
