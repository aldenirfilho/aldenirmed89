#!/usr/bin/env python3
"""Monta o artefato público Antigravity a partir de uma allowlist explícita.

O builder falha se uma entrada obrigatória estiver ausente, nunca copia o
espelho legado ``public_site/`` e ignora staging privado, scripts de operação e
arquivos internos. A sanitização/validação final continua a cargo de
``publication_guard.py`` como defesa em profundidade.
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path


REQUIRED = (
    "index.html",
    "404.html",
    "assets",
    "data",
    "01_UpDown_Hub",
    "02_Biblioteca_IA_Engine",
    "03_Calculadoras_E_Apps",
    "04_Ebooks_Intensiva_Clinica",
    "05_Midia_E_Feed",
    "07_Questoes_Comentadas",
    "08_Transcricoes",
    "09_POCUS_Hub",
    "10_DESAFIOS",
    "11_MNEMONICOS",
    "01_Modulos_Clinicos",
    "questoes",
    "apps",
    "desafios",
)

OPTIONAL = (
    ".nojekyll",
    "favicon.ico",
    "manifest.json",
    "manifest.webmanifest",
    "offline.html",
    "robots.txt",
    "sitemap.xml",
    "06_Infra_Site_E_Assets",
    "css",
    "js",
    "imagens",
    "admin",
    "03_Calculadoras_UTI",
    "05_Biblioteca_IA",
    "06_Card_Feed_Medico",
    "07_Estudos_Markdown",
    "13_RenalDose_Antimicrobianos",
    "14_SAPS3_Calculator",
    "02_Banco_Questoes_TEMI",
    "les-autoanticorpos",
    "respirasense-icu",
    "biblioteca",
    "updown",
    "calculadoras",
    "card-feed",
)

BLOCKED_SUFFIXES = (".bak", ".tmp", ".command", ".py", ".pyc", ".sh")
LIBRARY_ACERVO_PREFIX = "02_Biblioteca_IA_Engine/acervo/"
LIBRARY_PRIVATE_PARTS = {"juridico-financeiro", "_private", "inbox"}
NON_PUBLIC_ADMIN_NAMES = {".gitkeep"}


def is_within(child: Path, parent: Path) -> bool:
    return child == parent or parent in child.parents


def should_skip(root: Path, candidate: Path) -> bool:
    relative = candidate.relative_to(root).as_posix()
    normalized = relative.lower()
    name = candidate.name.lower()

    if candidate.is_symlink():
        return True
    # Cópias de conflito criadas por sincronização (ex.: ``index 2.html``)
    # não são fontes canônicas e podem carregar versões obsoletas ou privadas.
    if candidate.suffix and candidate.stem.endswith(" 2"):
        return True
    if any(part.lower() in {"inbox", "juridico-financeiro"} for part in candidate.parts):
        return True
    if name in {".ds_store", "thumbs.db", *NON_PUBLIC_ADMIN_NAMES} or name.endswith(BLOCKED_SUFFIXES):
        return True
    if any(part.lower() == "_private" for part in candidate.parts):
        return True
    if "antigravity_repo_pack" in normalized:
        return True
    if "_privad" in name:
        return True
    if "prompt" in name and ("antigravity" in name or "rules" in name):
        return True
    if name.startswith("instrucoes-antigravity") or name.startswith("patch_"):
        return True
    if "antigravity" in name and "instruc" in name:
        return True
    return False


def load_library_acervo_allowlist(root: Path) -> set[str]:
    manifest_path = root / "02_Biblioteca_IA_Engine/data/biblioteca_documentos_manifest.json"
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError("Manifesto canônico da Biblioteca ausente ou inválido.") from exc

    allowlist: set[str] = set()
    for item in manifest.get("files", []):
        if not isinstance(item, dict) or not isinstance(item.get("path"), str):
            raise ValueError("Manifesto da Biblioteca contém entrada inválida.")
        relative = f"02_Biblioteca_IA_Engine/{item['path']}"
        if not relative.startswith(LIBRARY_ACERVO_PREFIX) or relative in allowlist:
            raise ValueError(f"Caminho inválido ou duplicado no manifesto: {relative}")
        allowlist.add(relative)
    return allowlist


def validate_library_acervo(root: Path, allowlist: set[str]) -> None:
    """Falha fechado se o acervo físico contém algo fora do manifesto."""

    acervo = root / "02_Biblioteca_IA_Engine/acervo"
    if not acervo.is_dir():
        raise ValueError("Diretório público da Biblioteca ausente.")

    physical: set[str] = set()
    for candidate in sorted(acervo.rglob("*")):
        relative_to_acervo = candidate.relative_to(acervo)
        if any(part.lower() in LIBRARY_PRIVATE_PARTS for part in relative_to_acervo.parts):
            continue
        if candidate.is_symlink():
            raise ValueError(f"Link simbólico não permitido no acervo: {candidate}")
        if not candidate.is_file() or candidate.name.lower() in NON_PUBLIC_ADMIN_NAMES:
            continue
        physical.add(candidate.relative_to(root).as_posix())

    unexpected = sorted(physical - allowlist)
    missing = sorted(allowlist - physical)
    blocked_allowlisted = sorted(
        relative for relative in allowlist if should_skip(root, root / relative)
    )
    if unexpected:
        raise ValueError(
            "Arquivo físico fora do manifesto da Biblioteca: " + ", ".join(unexpected[:3])
        )
    if missing:
        raise ValueError(
            "Arquivo do manifesto ausente no acervo da Biblioteca: " + ", ".join(missing[:3])
        )
    if blocked_allowlisted:
        raise ValueError(
            "Arquivo aprovado seria omitido pelo filtro público: "
            + ", ".join(blocked_allowlisted[:3])
        )


def copy_entry(root: Path, site: Path, relative: str, library_allowlist: set[str]) -> None:
    source = root / relative
    destination = site / relative
    if should_skip(root, source):
        return

    if source.is_dir():
        destination.mkdir(parents=True, exist_ok=True)
        for child in sorted(source.iterdir(), key=lambda path: path.name.casefold()):
            if not should_skip(root, child):
                copy_entry(root, site, child.relative_to(root).as_posix(), library_allowlist)
    elif source.is_file():
        if relative.startswith(LIBRARY_ACERVO_PREFIX) and relative not in library_allowlist:
            raise ValueError(f"Arquivo da Biblioteca fora da allowlist: {relative}")
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)


def normalize_permissions(site: Path) -> None:
    for path in site.rglob("*"):
        mode = 0o755 if path.is_dir() else 0o644
        path.chmod(mode)


def build(root: Path, site: Path) -> int:
    root = root.resolve()
    site = site.resolve()
    if not root.is_dir() or root == Path(root.anchor):
        raise ValueError(f"Raiz insegura ou inexistente: {root}")
    if not is_within(site, root) or site == root:
        raise ValueError(f"Destino deve ser uma subpasta da raiz: {site}")

    missing = [relative for relative in REQUIRED if not (root / relative).exists()]
    if missing:
        print(f"❌ Entradas públicas obrigatórias ausentes: {len(missing)}")
        for relative in missing:
            print(f"   - {relative}")
        return 1

    library_allowlist = load_library_acervo_allowlist(root)
    validate_library_acervo(root, library_allowlist)

    if site.exists():
        shutil.rmtree(site)
    site.mkdir(parents=True)

    for relative in REQUIRED:
        copy_entry(root, site, relative, library_allowlist)
    for relative in OPTIONAL:
        if (root / relative).exists():
            copy_entry(root, site, relative, library_allowlist)
    for logo in sorted(root.glob("logo_concept*.png")):
        copy_entry(root, site, logo.name, library_allowlist)

    (site / ".nojekyll").touch(exist_ok=True)
    normalize_permissions(site)
    total = sum(path.stat().st_size for path in site.rglob("*") if path.is_file())
    count = sum(1 for path in site.rglob("*") if path.is_file())
    print(f"✅ Artefato montado: {count} arquivo(s), {total / 1024 / 1024:.1f} MiB.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Monta o site público por allowlist.")
    parser.add_argument("root", type=Path, nargs="?", default=Path.cwd())
    parser.add_argument("site", type=Path, nargs="?", default=Path("site"))
    args = parser.parse_args()

    root = args.root.resolve()
    site = args.site if args.site.is_absolute() else root / args.site
    try:
        return build(root, site)
    except (OSError, ValueError) as exc:
        print(f"❌ Falha segura ao montar artefato: {exc}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
