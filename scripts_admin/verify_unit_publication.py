#!/usr/bin/env python3
"""Valida a publicação seletiva da Máquina Turbo TEMI sem gravar arquivos."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path


PRODUCT_RELATIVE = Path(
    "23_Cosmos_NEXUS/products/maquina-turbo-temi-360x"
)
TAF_PATTERN = re.compile(r"^TAF###-MUX-PROD-[0-9]{8}-[0-9]{4}-[A-F0-9]{8}$")


class VerificationError(ValueError):
    """Falha fechada da publicação unitária."""


def _load_object(path: Path, label: str) -> dict:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise VerificationError(f"{label} ausente ou inválido: {path}") from exc
    if not isinstance(payload, dict):
        raise VerificationError(f"{label} precisa ser objeto JSON")
    return payload


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _validate_local_targets(public_root: Path, html_path: Path, html: str) -> int:
    targets = re.findall(r"(?:href|src)=[\"']([^\"']+)[\"']", html)
    checked = 0
    for target in targets:
        if target.startswith(("#", "https://", "http://", "mailto:", "tel:")):
            continue
        relative = target.split("#", 1)[0].split("?", 1)[0]
        if not relative:
            continue
        candidate = (html_path.parent / relative).resolve()
        try:
            candidate.relative_to(public_root.resolve())
        except ValueError as exc:
            raise VerificationError(f"link escapa do artefato público: {target}") from exc
        if candidate.is_dir():
            candidate = candidate / "index.html"
        if not candidate.is_file():
            raise VerificationError(f"link local quebrado: {target}")
        checked += 1
    return checked


def verify(public_root: Path) -> dict:
    public_root = public_root.resolve()
    product = public_root / PRODUCT_RELATIVE
    if not product.is_dir():
        raise VerificationError("produto unitário ausente do artefato")

    nexus_root = public_root / "23_Cosmos_NEXUS"
    leaked = []
    for candidate in nexus_root.rglob("*"):
        if not candidate.is_file():
            continue
        try:
            candidate.relative_to(product)
        except ValueError:
            leaked.append(candidate.relative_to(public_root).as_posix())
    if leaked:
        raise VerificationError(
            "conteúdo NEXUS fora do TAF unitário: " + ", ".join(leaked[:3])
        )

    manifest = _load_object(product / "product.manifest.json", "manifesto")
    release = _load_object(product / "release/release.json", "release")
    tombstone = _load_object(product / "release/tombstone.json", "tombstone")
    audit = _load_object(product / "release/audit.json", "auditoria")
    homologation = _load_object(
        product / "release/homologation.json", "homologação"
    )

    publication = manifest.get("publication", {})
    release_publication = release.get("publication", {})
    taf_code = release.get("tafCode")
    if not isinstance(taf_code, str) or not TAF_PATTERN.fullmatch(taf_code):
        raise VerificationError("TAF unitário inválido")
    if publication.get("finalAcceptanceCode") != taf_code:
        raise VerificationError("TAF diverge entre manifesto e release")
    if publication.get("requiredCommand") != f"PUBLICAR {taf_code}":
        raise VerificationError("comando literal divergente")
    if release_publication.get("requiredCommand") != f"PUBLICAR {taf_code}":
        raise VerificationError("release não exige o TAF literal")
    if (
        publication.get("officialPublication") is not False
        or publication.get("ownerPublicationAuthorization") is not False
        or publication.get("officialPublicationCode") is not None
        or release_publication.get("status") != "LOCKED"
    ):
        raise VerificationError("publicação foi liberada antes do novo comando")

    expected_codes = {
        "auditCode": audit.get("auditCode"),
        "homologationCode": homologation.get("homologationCode"),
        "tombstoneCode": tombstone.get("tombstoneCode"),
    }
    for key, value in expected_codes.items():
        if release.get(key) != value:
            raise VerificationError(f"código divergente: {key}")
    if audit.get("outcome") != "PASS":
        raise VerificationError("auditoria não aprovada")

    members = tombstone.get("members")
    if not isinstance(members, list) or len(members) != 12:
        raise VerificationError("tombstone precisa conter exatamente 12 membros")
    paths = [member.get("path") for member in members if isinstance(member, dict)]
    if paths != sorted(paths) or len(paths) != len(set(paths)):
        raise VerificationError("membros não estão ordenados e únicos")

    root_lines = []
    image_count = 0
    for member in members:
        relative = member.get("path")
        if not isinstance(relative, str) or not relative.startswith(
            PRODUCT_RELATIVE.as_posix() + "/"
        ):
            raise VerificationError("membro fora da subárvore unitária")
        path = public_root / relative
        if not path.is_file():
            raise VerificationError(f"membro ausente: {relative}")
        digest = _sha256(path)
        size = path.stat().st_size
        if digest != member.get("sha256") or size != member.get("bytes"):
            raise VerificationError(f"membro divergente: {relative}")
        if path.suffix.lower() == ".png":
            image_count += 1
        root_lines.append(f"{relative}\t{digest}\t{size}\n")

    artifact_root = hashlib.sha256("".join(root_lines).encode("utf-8")).hexdigest()
    if artifact_root != tombstone.get("artifactRootSha256"):
        raise VerificationError("root físico diverge do TOM")
    if artifact_root != release.get("artifactRootSha256"):
        raise VerificationError("root físico diverge do TAF")

    html_path = product / "index.html"
    html = html_path.read_text(encoding="utf-8")
    for forbidden in ("publicação bloqueada", "###STATUS:RELEASE_LOCKED"):
        if forbidden.casefold() in html.casefold():
            raise VerificationError(f"estado obsoleto ainda visível: {forbidden}")
    if "###STATUS:PUBLIC_READY" not in html:
        raise VerificationError("topografia PUBLIC_READY ausente")
    local_links = _validate_local_targets(public_root, html_path, html)

    return {
        "status": "OK",
        "tafCode": taf_code,
        "artifactRootSha256": artifact_root,
        "memberCount": len(members),
        "imageCount": image_count,
        "localLinksChecked": local_links,
        "publication": "LOCKED",
        "scope": "maquina-turbo-temi-360x-only",
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--public-root", type=Path, default=Path("site"))
    args = parser.parse_args()
    try:
        print(json.dumps(verify(args.public_root), ensure_ascii=False, indent=2))
        return 0
    except VerificationError as exc:
        print(f"❌ {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
