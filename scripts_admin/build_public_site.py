#!/usr/bin/env python3
"""Monta o artefato público Antigravity a partir de uma allowlist explícita.

O builder falha se uma entrada obrigatória estiver ausente, nunca copia o
espelho legado ``public_site/`` e ignora staging privado, scripts de operação e
arquivos internos. A sanitização/validação final continua a cargo de
``publication_guard.py`` como defesa em profundidade.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import posixpath
import re
import shutil
import stat
import sys
import unicodedata
import zipfile
from pathlib import Path, PurePosixPath

try:
    from svg_safety import validate_svg_file
except ModuleNotFoundError:  # import via unittest/importlib a partir da raiz
    from scripts_admin.svg_safety import validate_svg_file


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
    "15_Radar_Cientifico",
    "16_Diretorio_Medico",
    "17_Portal_Vivo",
    "18_Centro_Tripulacao",
    "19_Integridade_Editorial",
    "20_Conheca_Aldenir",
    "21_Central_Ativacao",
    "01_Modulos_Clinicos",
    "en",
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
    "sw.js",
    "robots.txt",
    "sitemap.xml",
    "docs_usuario",
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
CARD_PUBLIC_PREFIX = "05_Midia_E_Feed/assets/cards/public/"
CARD_PUBLIC_INDEX = "05_Midia_E_Feed/data/public.json"
CARD_ASSET_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp", ".svg"}
NON_PUBLIC_ADMIN_NAMES = {".gitkeep"}
EDITORIAL_DATA_PREFIX = "data/editorial/"
EDITORIAL_PUBLIC_FILES = {
    "data/editorial/editorial-provenance.json",
}
PUBLIC_DOWNLOADS = (
    "downloads/Antigravity-Consultas-macOS.zip",
    "downloads/Antigravity-Consultas-Windows.zip",
    "downloads/Antigravity-Consultas-iPhone-Icones.zip",
    "downloads/SHA256SUMS.txt",
)
DOWNLOAD_ARCHIVE_LIMIT = 512
DOWNLOAD_UNCOMPRESSED_LIMIT = 64 * 1024 * 1024


def is_within(child: Path, parent: Path) -> bool:
    return child == parent or parent in child.parents


def canonical_relative(value: str) -> str:
    """Compara paths em NFC sem depender da normalização do macOS/iCloud."""

    return unicodedata.normalize("NFC", value)


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
    if (
        relative.startswith(CARD_PUBLIC_PREFIX)
        and candidate.suffix
        and re.search(r" [2-9]\d*$", candidate.stem)
    ):
        return True
    if any(part.lower() in {"inbox", "juridico-financeiro"} for part in candidate.parts):
        return True
    if name in {".ds_store", "thumbs.db", *NON_PUBLIC_ADMIN_NAMES} or name.endswith(BLOCKED_SUFFIXES):
        return True
    if any(part.lower() == "_private" for part in candidate.parts):
        return True
    if normalized.startswith(EDITORIAL_DATA_PREFIX) and relative not in EDITORIAL_PUBLIC_FILES:
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
        relative = canonical_relative(f"02_Biblioteca_IA_Engine/{item['path']}")
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
        physical.add(canonical_relative(candidate.relative_to(root).as_posix()))

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


def load_card_public_allowlist(root: Path) -> set[str]:
    index_path = root / CARD_PUBLIC_INDEX
    try:
        payload = json.loads(index_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError("Índice público dos cards ausente ou inválido.") from exc

    files = payload.get("files")
    if not isinstance(files, list):
        raise ValueError("Índice público dos cards precisa conter a lista 'files'.")

    allowlist: set[str] = set()
    for value in files:
        if not isinstance(value, str) or not value.strip() or "\\" in value:
            raise ValueError("Índice público dos cards contém caminho inválido.")
        relative_asset = PurePosixPath(value)
        if (
            relative_asset.is_absolute()
            or relative_asset.as_posix() != value
            or any(part in {"", ".", ".."} for part in relative_asset.parts)
            or relative_asset.suffix.casefold() not in CARD_ASSET_SUFFIXES
        ):
            raise ValueError(f"Asset público de card inseguro: {value!r}")
        relative = canonical_relative(CARD_PUBLIC_PREFIX + value)
        if relative in allowlist:
            raise ValueError(f"Asset público de card duplicado: {value}")
        allowlist.add(relative)
    return allowlist


def validate_card_public_assets(root: Path, allowlist: set[str]) -> list[str]:
    """Aceita cópias de conflito conhecidas, mas nunca as publica."""

    public_root = root / CARD_PUBLIC_PREFIX
    if not public_root.is_dir():
        raise ValueError("Diretório público dos cards ausente.")

    physical = {
        canonical_relative(path.relative_to(root).as_posix())
        for path in public_root.rglob("*")
        if path.is_file() and path.suffix.casefold() in CARD_ASSET_SUFFIXES
    }
    missing = sorted(allowlist - physical)
    if missing:
        raise ValueError("Asset aprovado de card ausente: " + ", ".join(missing[:3]))

    # Defesa em profundidade: mesmo que o builder seja executado sem o scanner
    # anterior, nenhum SVG ativo presente na allowlist chega ao artefato.
    for relative in sorted(allowlist):
        if PurePosixPath(relative).suffix.casefold() != ".svg":
            continue
        try:
            validate_svg_file(root / relative)
        except ValueError as exc:
            raise ValueError(f"SVG aprovado inseguro bloqueado ({relative}): {exc}") from exc

    conflicts: list[str] = []
    unexpected: list[str] = []
    for relative in sorted(physical - allowlist):
        candidate = PurePosixPath(relative)
        canonical_name = re.sub(
            r" [2-9]\d*(\.(?:png|jpe?g|webp|svg))$", r"\1", candidate.name, flags=re.IGNORECASE
        )
        canonical = candidate.with_name(canonical_name).as_posix()
        if canonical != relative and canonical in allowlist:
            conflicts.append(relative)
        else:
            unexpected.append(relative)
    if unexpected:
        raise ValueError(
            "Asset físico de card fora do índice público: " + ", ".join(unexpected[:3])
        )
    return conflicts


def validate_clinical_publication(root: Path) -> None:
    """Exige autorização explícita para publicar módulos ainda em revisão."""

    modules_root = root / "01_Modulos_Clinicos"
    for manifest_path in sorted(modules_root.rglob("module.manifest.json")):
        try:
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            raise ValueError(f"Manifesto clínico inválido: {manifest_path}") from exc

        status = str(manifest.get("status", "")).strip().casefold()
        if status in {"privado", "private", "rascunho", "revisar"}:
            raise ValueError(
                f"Módulo clínico não publicável ({status}): "
                f"{manifest_path.relative_to(root)}"
            )
        if status != "em-revisao-medica":
            continue

        publication = manifest.get("publication")
        explicit_preview = (
            isinstance(publication, dict)
            and publication.get("mode") == "public-preview"
            and publication.get("publicPreview") is True
            and publication.get("clinicalReviewOngoing") is True
        )
        index_path = manifest_path.parent / str(manifest.get("entrypoint", "index.html"))
        try:
            index_html = index_path.read_text(encoding="utf-8").casefold()
        except OSError as exc:
            raise ValueError(f"Entrypoint clínico ausente: {index_path}") from exc
        visible_review_notice = (
            "review-strip" in index_html
            and ("revisão médica" in index_html or "revisao medica" in index_html)
        )
        if not explicit_preview or not visible_review_notice:
            raise ValueError(
                "Módulo em revisão só pode sair como prévia pública explícita, "
                f"com aviso visível: {manifest_path.relative_to(root)}"
            )


def validate_public_downloads(root: Path) -> None:
    """Publica somente pacotes declarados, íntegros e sem membros inseguros."""

    downloads_root = root / "downloads"
    expected_names = {PurePosixPath(relative).name for relative in PUBLIC_DOWNLOADS}
    physical_names = {
        path.name for path in downloads_root.iterdir() if path.is_file()
    }
    unexpected = sorted(physical_names - expected_names)
    missing = sorted(expected_names - physical_names)
    if unexpected:
        raise ValueError(
            "Download fora da allowlist pública: " + ", ".join(unexpected)
        )
    if missing:
        raise ValueError("Download público ausente: " + ", ".join(missing))

    checksum_path = downloads_root / "SHA256SUMS.txt"
    checksums: dict[str, str] = {}
    for line_number, raw_line in enumerate(
        checksum_path.read_text(encoding="utf-8").splitlines(), start=1
    ):
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        match = re.fullmatch(r"([0-9a-f]{64})  ([^/\\]+)", line)
        if not match:
            raise ValueError(
                f"Linha inválida em downloads/SHA256SUMS.txt:{line_number}"
            )
        digest, filename = match.groups()
        if filename in checksums:
            raise ValueError(f"Checksum duplicado para download: {filename}")
        checksums[filename] = digest

    archive_names = expected_names - {"SHA256SUMS.txt"}
    if set(checksums) != archive_names:
        raise ValueError("SHA256SUMS.txt não corresponde à allowlist de downloads.")

    for filename in sorted(archive_names):
        archive_path = downloads_root / filename
        digest = hashlib.sha256()
        with archive_path.open("rb") as package:
            for chunk in iter(lambda: package.read(1024 * 1024), b""):
                digest.update(chunk)
        if digest.hexdigest() != checksums[filename]:
            raise ValueError(f"Checksum divergente para download: {filename}")

        try:
            with zipfile.ZipFile(archive_path) as archive:
                members = archive.infolist()
                if not members or len(members) > DOWNLOAD_ARCHIVE_LIMIT:
                    raise ValueError(
                        f"Quantidade insegura de membros no ZIP: {filename}"
                    )
                total_size = 0
                for member in members:
                    member_path = PurePosixPath(member.filename)
                    total_size += member.file_size
                    if (
                        member.filename.startswith("/")
                        or "\\" in member.filename
                        or any(part in {"", ".", ".."} for part in member_path.parts)
                        or member.flag_bits & 0x1
                        or stat.S_ISLNK(member.external_attr >> 16)
                    ):
                        raise ValueError(
                            f"Membro inseguro em {filename}: {member.filename!r}"
                        )
                if total_size > DOWNLOAD_UNCOMPRESSED_LIMIT:
                    raise ValueError(f"ZIP público excede o limite: {filename}")
                damaged = archive.testzip()
                if damaged:
                    raise ValueError(
                        f"Membro corrompido em {filename}: {damaged}"
                    )
        except zipfile.BadZipFile as exc:
            raise ValueError(f"Download ZIP inválido: {filename}") from exc


def copy_entry(
    root: Path,
    site: Path,
    relative: str,
    library_allowlist: set[str],
    card_allowlist: set[str],
) -> None:
    source = root / relative
    destination = site / relative
    if should_skip(root, source):
        return

    if source.is_dir():
        destination.mkdir(parents=True, exist_ok=True)
        for child in sorted(source.iterdir(), key=lambda path: path.name.casefold()):
            if not should_skip(root, child):
                copy_entry(
                    root,
                    site,
                    child.relative_to(root).as_posix(),
                    library_allowlist,
                    card_allowlist,
                )
    elif source.is_file():
        canonical = canonical_relative(relative)
        if canonical.startswith(LIBRARY_ACERVO_PREFIX) and canonical not in library_allowlist:
            raise ValueError(f"Arquivo da Biblioteca fora da allowlist: {relative}")
        if canonical.startswith(CARD_PUBLIC_PREFIX) and canonical not in card_allowlist:
            return
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)


def normalize_permissions(site: Path) -> None:
    for path in site.rglob("*"):
        mode = 0o755 if path.is_dir() else 0o644
        path.chmod(mode)


EDITORIAL_ATTRIBUTION_MARKER = "antigravity-editorial-attribution:v1"


def inject_editorial_attribution(site: Path) -> int:
    """Acrescenta atribuição editorial discreta em todo HTML do artefato.

    A injeção acontece somente no artefato público. Assim, páginas antigas e
    módulos independentes recebem a mesma referência sem uma reescrita massiva
    dos arquivos-fonte. O bloco distingue a plataforma/curadoria das obras de
    terceiros e aponta para os dois canais de transparência.
    """

    updated = 0
    for html_path in sorted(site.rglob("*.html")):
        try:
            html = html_path.read_text(encoding="utf-8")
        except UnicodeDecodeError as exc:
            raise ValueError(
                f"HTML público sem codificação UTF-8: {html_path.relative_to(site)}"
            ) from exc
        if EDITORIAL_ATTRIBUTION_MARKER in html:
            continue

        relative = html_path.relative_to(site)
        parent = relative.parent.as_posix()
        root_prefix = posixpath.relpath(".", start=parent or ".")
        if root_prefix == ".":
            root_prefix = ""
        else:
            root_prefix += "/"

        integrity_href = f"{root_prefix}19_Integridade_Editorial/"
        profile_href = f"{root_prefix}20_Conheca_Aldenir/"
        css_href = f"{root_prefix}assets/editorial-attribution.css"
        block = f"""
<!-- {EDITORIAL_ATTRIBUTION_MARKER} -->
<link rel="stylesheet" href="{css_href}">
<footer class="antigravity-editorial-attribution" data-editorial-attribution="ATV-ALD-360">
  <p class="antigravity-editorial-attribution__mark">ATV · TURBO TEMI · ALD 360</p>
  <p>
    Idealização da plataforma e responsabilidade editorial:
    <strong>Aldenir Rocha de Oliveira Filho</strong> · editor, criador,
    codificador, produtor, atualizador e patrocinador independente.
    <a href="{integrity_href}">Integridade editorial</a> ·
    <a href="{profile_href}">Conheça o idealizador</a>
  </p>
  <p class="antigravity-editorial-attribution__scope">
    A atribuição refere-se à plataforma e à curadoria original; fontes,
    marcas e obras de terceiros permanecem creditadas aos respectivos titulares.
  </p>
</footer>"""
        closing_body = re.search(r"</body\s*>", html, flags=re.IGNORECASE)
        if closing_body:
            html = html[: closing_body.start()] + block + "\n" + html[closing_body.start() :]
        else:
            html = html.rstrip() + "\n" + block + "\n"
        html_path.write_text(html, encoding="utf-8")
        updated += 1
    return updated


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
    card_allowlist = load_card_public_allowlist(root)
    card_conflicts = validate_card_public_assets(root, card_allowlist)
    validate_clinical_publication(root)
    validate_public_downloads(root)

    if site.exists():
        shutil.rmtree(site)
    site.mkdir(parents=True)

    for relative in REQUIRED:
        copy_entry(root, site, relative, library_allowlist, card_allowlist)
    for relative in OPTIONAL:
        if (root / relative).exists():
            copy_entry(root, site, relative, library_allowlist, card_allowlist)
    for relative in PUBLIC_DOWNLOADS:
        copy_entry(root, site, relative, library_allowlist, card_allowlist)
    for logo in sorted(root.glob("logo_concept*.png")):
        copy_entry(root, site, logo.name, library_allowlist, card_allowlist)

    (site / ".nojekyll").touch(exist_ok=True)
    attributed = inject_editorial_attribution(site)
    normalize_permissions(site)
    total = sum(path.stat().st_size for path in site.rglob("*") if path.is_file())
    count = sum(1 for path in site.rglob("*") if path.is_file())
    print(f"✅ Artefato montado: {count} arquivo(s), {total / 1024 / 1024:.1f} MiB.")
    print(f"🛡️ Atribuição editorial aplicada a {attributed} página(s) HTML.")
    if card_conflicts:
        print(
            f"🛡️ Cópias de conflito preservadas localmente e excluídas do site: "
            f"{len(card_conflicts)}."
        )
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
