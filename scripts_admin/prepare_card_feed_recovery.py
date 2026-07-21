#!/usr/bin/env python3
"""Reproduz a recuperação auditada do Card Feed de 21/07/2026.

Este utilitario e deliberadamente especifico do lote historico cuja autoria foi
confirmada pelo proprietario. Ele nao e um importador generico: valida a
impressao digital do inventario e o formato do manifesto antes de gravar os
arquivos canonicos. As imagens raster sao convertidas para WebP sem metadados;
SVGs sao sanitizados antes da publicacao. Os nomes publicos usam slug ASCII e
hash para evitar 404 por Unicode.

Exemplo:
    python3 scripts_admin/prepare_card_feed_recovery.py \
      --source-dir /caminho/privado/assets/cards/inbox \
      --legacy-cards /caminho/privado/data/cards.json \
      --acknowledge-historical-batch-2026-07-21

O ambiente precisa de Pillow com suporte a WebP. No Codex Desktop, use o Python
do runtime de workspace indicado por ``load_workspace_dependencies``.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import unicodedata
import xml.etree.ElementTree as ET
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_ROOT = ROOT / "05_Midia_E_Feed/assets/cards/public"
RECOVERED_ROOT = PUBLIC_ROOT / "recovered"
CARDS_OUTPUT = ROOT / "05_Midia_E_Feed/data/cards.json"
RECOVERY_MANIFEST = ROOT / "05_Midia_E_Feed/data/recovery_manifest.json"
SUPPORTED = {".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg"}
RASTER = SUPPORTED - {".svg"}
BLOCKED_SVG_TAGS = {"script", "foreignobject", "iframe", "object", "embed", "audio", "video"}
SOURCE_COMMIT = "ad1674f8b4871067fe86e47fdf9807134265b467"
EXPECTED_SOURCE_FILES = 257
EXPECTED_LEGACY_CARDS = 198
EXPECTED_LEGACY_IMAGE_REFS = 195
EXPECTED_INVENTORY_SHA256 = "6684542494db23bd796ff7f0a0dec56735e5c77f8da345207044668304232a03"
CLINICAL_QUARANTINE_BY_SHA = {
    "a1f5c6b454fdd06aaeb55df958023cf140cb4c6a404622169beeb53ed0a69e38": (
        "Conduta de bradicardia com doses desatualizadas; exige revisão clínica antes de publicar."
    ),
}


def normalized_key(value: str) -> str:
    """Cria uma chave estavel para reconciliar NFC/NFD e caixa."""
    return unicodedata.normalize("NFC", value).casefold()


def slugify(value: str, limit: int = 72) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii").lower()
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_value).strip("-")
    return (slug[:limit].rstrip("-") or "card")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def inventory_sha256(source_dir: Path, sources: list[Path]) -> str:
    """Hash reproduzivel de caminho NFC + SHA-256 de cada fonte suportada."""
    digest = hashlib.sha256()
    for source in sources:
        relative = unicodedata.normalize("NFC", source.relative_to(source_dir).as_posix())
        digest.update(relative.encode("utf-8"))
        digest.update(b"\0")
        digest.update(sha256(source).encode("ascii"))
        digest.update(b"\n")
    return digest.hexdigest()


def infer_theme(name: str) -> str:
    value = normalized_key(name)
    rules = (
        ("pocus", r"pocus|ultrassom|\busg\b|\beco\b|\bfast\b|vexus|pleur|aorta|volemia"),
        ("nefro-aki-trs", r"kdigo|\baki\b|\bira\b|renal|rim|hemodial|dialis|\btrs\b|crrt|sled|pirrt"),
        ("temi", r"temi|prova|quest|flashcard|memory"),
        ("vm-sdra", r"\bvm\b|ventil|sara|ards|sdra|\bpav\b|assincronia|alarme"),
        ("sepse-choque", r"sepse|septic|choque|vasopressor|noradrenalina|lactato"),
        ("endocrino-diabetes", r"diabetes|\bcad\b|cetoacid|hipoglic|hiperglic|\bhhs\b|\behh\b|insulina"),
        ("ia-produtividade", r"obsidian|\bia\b|\bgpt\b|claude|antigravity|github|token|comando"),
        ("neuro-uti", r"\bavc\b|\btce\b|convuls|neuro|\bcoma\b|delirium|sedacao|trombol|trombect|\bhic\b"),
        ("cardio-hemodinamica", r"\becg\b|cardio|\biam\b|arrit|bradi|taqui|hemodin"),
        ("infectologia", r"antibi|infect|pneumo|aspirat|mening|anvisa"),
        ("farmaco-doses", r"dose|dilui|farmaco|droga|bomba|mlh|ml-h"),
        ("familia-paciente", r"mae|familia|cuidado|idos|paciente"),
        ("reumato-imuno", r"lupus|reumato|imuno|\bjak\b"),
    )
    for theme, pattern in rules:
        if re.search(pattern, value):
            return theme
    return "uti-geral"


def import_pillow():
    try:
        from PIL import Image, ImageOps, features
    except ImportError as exc:  # pragma: no cover - depende do ambiente local
        raise RuntimeError(
            "Pillow nao encontrado. Use o Python do runtime de workspace do Codex."
        ) from exc
    if not features.check("webp"):
        raise RuntimeError("O Pillow deste ambiente nao possui suporte a WebP.")
    return Image, ImageOps


def convert_raster(source: Path, target: Path, max_edge: int, quality: int) -> None:
    Image, ImageOps = import_pillow()
    target.parent.mkdir(parents=True, exist_ok=True)
    temporary = target.with_name(target.name + ".tmp")
    with Image.open(source) as raw:
        image = ImageOps.exif_transpose(raw)
        if getattr(image, "is_animated", False):
            image.seek(0)
        image.thumbnail((max_edge, max_edge), Image.Resampling.LANCZOS)
        mode = "RGBA" if "A" in image.getbands() else "RGB"
        image = image.convert(mode)
        image.save(
            temporary,
            "WEBP",
            quality=quality,
            method=6,
            exact=True,
        )
    temporary.replace(target)


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1].lower()


def sanitize_svg(source: Path, target: Path) -> None:
    text = source.read_text(encoding="utf-8")
    lowered = text.lower()
    if "<!doctype" in lowered or "<!entity" in lowered:
        raise ValueError(f"SVG com DTD/ENTITY bloqueado: {source.name}")

    # Alguns SVGs antigos trazem JavaScript inline com texto que nem sempre e
    # XML valido. Removemos todos os manipuladores antes do parse; a segunda
    # passada abaixo continua como defesa em profundidade.
    text = re.sub(
        r"\s+on[a-z_:][a-z0-9_:.-]*\s*=\s*(?:\"[^\"]*\"|'[^']*')",
        "",
        text,
        flags=re.IGNORECASE | re.DOTALL,
    )
    # Reparo limitado de um erro legado observado no eixo Y do SVG VG70:
    # ``y"360"=""`` -> ``y="360"``. Nenhuma outra estrutura e reescrita.
    text = re.sub(r'\sy"([+-]?[0-9]+(?:\.[0-9]+)?)"=""', r' y="\1"', text)

    root = ET.fromstring(text)

    def clean(element: ET.Element) -> None:
        for child in list(element):
            if local_name(child.tag) in BLOCKED_SVG_TAGS:
                element.remove(child)
            else:
                clean(child)
        for attribute, value in list(element.attrib.items()):
            name = local_name(attribute)
            normalized = value.strip().lower()
            if name.startswith("on"):
                del element.attrib[attribute]
            elif name == "style" and ("javascript:" in normalized or "url(" in normalized):
                del element.attrib[attribute]
            elif name == "href" and not normalized.startswith("#"):
                del element.attrib[attribute]

    clean(root)
    target.parent.mkdir(parents=True, exist_ok=True)
    temporary = target.with_name(target.name + ".tmp")
    ET.ElementTree(root).write(temporary, encoding="utf-8", xml_declaration=True)
    temporary.replace(target)


def public_path(target: Path) -> str:
    return target.relative_to(ROOT / "05_Midia_E_Feed").as_posix()


def recovery_target(source: Path, source_hash: str) -> Path:
    theme = infer_theme(source.name)
    stem = slugify(source.stem)
    extension = ".svg" if source.suffix.lower() == ".svg" else ".webp"
    return RECOVERED_ROOT / theme / f"{stem}-{source_hash[:10]}{extension}"


def planned_recovery_targets(sources: list[Path]) -> set[Path]:
    """Calcula o conjunto gerenciado antes de qualquer conversão ou escrita."""

    expected: set[Path] = set()
    seen_hashes: set[str] = set()
    for source in sources:
        source_hash = sha256(source)
        if source_hash in seen_hashes:
            continue
        seen_hashes.add(source_hash)
        if source_hash in CLINICAL_QUARANTINE_BY_SHA:
            continue
        expected.add(recovery_target(source, source_hash))
    return expected


def validate_recovered_root(recovered_root: Path, expected: set[Path]) -> None:
    """Falha fechado diante de saídas inesperadas; nunca remove arquivos."""

    if not recovered_root.exists():
        return
    unexpected: list[Path] = []
    for path in sorted(recovered_root.rglob("*"), key=lambda item: item.as_posix().casefold()):
        if path.is_symlink():
            raise ValueError(f"Link simbólico inesperado no diretório recuperado: {path}")
        if path.is_file() and path not in expected:
            unexpected.append(path)
    if unexpected:
        sample = ", ".join(path.name for path in unexpected[:3])
        raise ValueError(
            f"Saída(s) inesperada(s) preservada(s) em recovered/: {len(unexpected)} "
            f"({sample}). Revise manualmente; nenhuma exclusão foi realizada."
        )


def load_json(path: Path) -> dict:
    with path.open(encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, dict):
        raise ValueError(f"JSON raiz deve ser objeto: {path}")
    return data


def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def reconcile_cards(legacy: dict, by_name: dict[str, dict]) -> tuple[dict, int, list[str]]:
    cards = legacy.get("cards", [])
    if not isinstance(cards, list):
        raise ValueError("O manifesto legado nao possui uma lista cards valida.")

    recovered = 0
    missing: list[str] = []
    for card in cards:
        if not isinstance(card, dict):
            continue
        old_url = str(card.get("imageUrl") or "").strip()
        if not old_url:
            continue
        source_name = Path(old_url).name
        entry = by_name.get(normalized_key(source_name))
        if entry is None or not entry.get("publicPath"):
            missing.append(source_name)
            continue
        card["imageUrl"] = entry["publicPath"]
        card["theme"] = entry["theme"]
        card["source"] = "Imagem gerada por IA pelo Dr. Aldenir Rocha; recuperação auditada"
        card["authorship"] = "Aldenir Rocha"
        card["assetLicense"] = "Autoral — publicação autorizada pelo criador"
        card["assetSha256"] = entry["publicSha256"]
        card["recoveredAt"] = date.today().isoformat()
        card["status"] = "publicado"
        card["clinicalReviewStatus"] = "pendente"
        card["reviewedAt"] = None
        recovered += 1

    legacy["version"] = "3.0-recovery-optimized"
    legacy["updatedAt"] = date.today().isoformat()
    legacy["recovery"] = {
        "sourceCommit": SOURCE_COMMIT,
        "recoveredCards": recovered,
        "unicodeNormalization": "NFC-to-ASCII-slug-with-sha256",
        "originals": "preserved in local ignored staging; not published",
    }
    return legacy, recovered, sorted(set(missing), key=normalized_key)


def main() -> int:
    parser = argparse.ArgumentParser(description="Recupera e otimiza o Card Feed autoral.")
    parser.add_argument("--source-dir", required=True, type=Path)
    parser.add_argument("--legacy-cards", required=True, type=Path)
    parser.add_argument("--max-edge", type=int, default=1600)
    parser.add_argument("--quality", type=int, default=88)
    parser.add_argument(
        "--acknowledge-historical-batch-2026-07-21",
        action="store_true",
        help="Confirma que a entrada e o lote autoral auditado de 21/07/2026.",
    )
    args = parser.parse_args()

    if not args.acknowledge_historical_batch_2026_07_21:
        print("❌ Ferramenta restrita ao lote histórico auditado de 21/07/2026.")
        print("   Para novos cards, siga o fluxo individual do guia de inserção segura.")
        return 1

    source_dir = args.source_dir.resolve()
    legacy_cards = args.legacy_cards.resolve()
    if not source_dir.is_dir():
        print(f"❌ Diretório de origem inexistente: {source_dir}")
        return 1
    if not legacy_cards.is_file():
        print(f"❌ Manifesto legado inexistente: {legacy_cards}")
        return 1
    if not 800 <= args.max_edge <= 4096:
        print("❌ --max-edge deve ficar entre 800 e 4096.")
        return 1
    if not 60 <= args.quality <= 100:
        print("❌ --quality deve ficar entre 60 e 100.")
        return 1

    sources = sorted(
        (path for path in source_dir.rglob("*") if path.is_file() and path.suffix.lower() in SUPPORTED),
        key=lambda path: normalized_key(path.relative_to(source_dir).as_posix()),
    )
    if not sources:
        print("❌ Nenhuma imagem suportada encontrada no staging privado.")
        return 1
    inventory_hash = inventory_sha256(source_dir, sources)
    if len(sources) != EXPECTED_SOURCE_FILES or inventory_hash != EXPECTED_INVENTORY_SHA256:
        print("❌ O inventário não corresponde ao lote histórico autorizado.")
        print(f"   Arquivos: {len(sources)} (esperado: {EXPECTED_SOURCE_FILES})")
        print(f"   SHA-256: {inventory_hash}")
        return 1

    legacy = load_json(legacy_cards)
    legacy_list = legacy.get("cards", [])
    if not isinstance(legacy_list, list):
        print("❌ O manifesto histórico não possui uma lista cards válida.")
        return 1
    legacy_image_refs = sum(
        1 for card in legacy_list
        if isinstance(card, dict) and str(card.get("imageUrl") or "").strip()
    )
    if len(legacy_list) != EXPECTED_LEGACY_CARDS or legacy_image_refs != EXPECTED_LEGACY_IMAGE_REFS:
        print("❌ O manifesto não corresponde ao baseline histórico autorizado.")
        print(f"   Cards: {len(legacy_list)} (esperado: {EXPECTED_LEGACY_CARDS})")
        print(f"   Referências de imagem: {legacy_image_refs} (esperado: {EXPECTED_LEGACY_IMAGE_REFS})")
        return 1

    expected_public_paths = planned_recovery_targets(sources)
    try:
        validate_recovered_root(RECOVERED_ROOT, expected_public_paths)
    except (OSError, ValueError) as exc:
        print(f"❌ {exc}")
        return 1

    entries: list[dict] = []
    by_source_hash: dict[str, dict] = {}
    by_name: dict[str, dict] = {}
    original_bytes = 0

    for source in sources:
        original_bytes += source.stat().st_size
        source_hash = sha256(source)
        theme = infer_theme(source.name)
        target = recovery_target(source, source_hash)

        quarantine_reason = CLINICAL_QUARANTINE_BY_SHA.get(source_hash)
        if quarantine_reason:
            entry = {
                "sourceFilename": source.name,
                "sourceSha256": source_hash,
                "originalBytes": source.stat().st_size,
                "theme": theme,
                "status": "quarantined",
                "publicPath": "",
                "publicSha256": "",
                "publicBytes": 0,
                "quarantineReason": quarantine_reason,
            }
            entries.append(entry)
            by_source_hash[source_hash] = entry
            by_name[normalized_key(source.name)] = entry
            continue

        previous = by_source_hash.get(source_hash)
        if previous is not None:
            entry = {
                "sourceFilename": source.name,
                "sourceSha256": source_hash,
                "originalBytes": source.stat().st_size,
                "theme": theme,
                "status": previous["status"],
                "publicPath": previous.get("publicPath", ""),
                "publicSha256": previous.get("publicSha256", ""),
                "publicBytes": previous.get("publicBytes", 0),
                "duplicateOf": previous["sourceFilename"],
            }
            if previous.get("quarantineReason"):
                entry["quarantineReason"] = previous["quarantineReason"]
            entries.append(entry)
            by_name[normalized_key(source.name)] = entry
            continue

        try:
            if not target.is_file():
                if source.suffix.lower() in RASTER:
                    convert_raster(source, target, args.max_edge, args.quality)
                else:
                    sanitize_svg(source, target)
        except (ET.ParseError, ValueError) as exc:
            entry = {
                "sourceFilename": source.name,
                "sourceSha256": source_hash,
                "originalBytes": source.stat().st_size,
                "theme": theme,
                "status": "quarantined",
                "publicPath": "",
                "publicSha256": "",
                "publicBytes": 0,
                "quarantineReason": f"SVG inseguro ou malformado: {exc}",
            }
            entries.append(entry)
            by_source_hash[source_hash] = entry
            by_name[normalized_key(source.name)] = entry
            continue

        entry = {
            "sourceFilename": source.name,
            "sourceSha256": source_hash,
            "originalBytes": source.stat().st_size,
            "theme": theme,
            "status": "published",
            "publicPath": public_path(target),
            "publicSha256": sha256(target),
            "publicBytes": target.stat().st_size,
        }
        entries.append(entry)
        by_source_hash[source_hash] = entry
        by_name[normalized_key(source.name)] = entry

    cards, recovered_cards, missing = reconcile_cards(legacy, by_name)
    unique_entries = [item for item in by_source_hash.values() if item.get("publicPath")]
    quarantined = [item for item in entries if item.get("status") == "quarantined"]
    duplicate_files = sum(1 for item in entries if item.get("duplicateOf"))
    public_bytes = sum(item["publicBytes"] for item in unique_entries)
    payload = {
        "description": "Auditoria de recuperação das imagens autorais do Card Feed.",
        "updatedAt": date.today().isoformat(),
        "sourceCommit": SOURCE_COMMIT,
        "authorship": "Autoria confirmada pelo proprietário do repositório em 2026-07-21.",
        "policy": "Originais preservados localmente; somente derivados otimizados são publicados.",
        "inventorySha256": inventory_hash,
        "totalFiles": len(entries),
        "optimization": {
            "rasterFormat": "WebP",
            "maxEdge": args.max_edge,
            "quality": args.quality,
            "metadata": "removed",
            "svg": "sanitized",
        },
        "summary": {
            "sourceFiles": len(entries),
            "publishedFiles": len(unique_entries),
            "deduplicatedFiles": duplicate_files,
            "quarantinedSourceFiles": len(quarantined),
            "originalBytes": original_bytes,
            "publicBytes": public_bytes,
            "recoveredCards": recovered_cards,
            "missingLegacyReferences": len(missing),
        },
        "missingLegacyReferences": missing,
        "files": entries,
    }
    write_json(CARDS_OUTPUT, cards)
    write_json(RECOVERY_MANIFEST, payload)

    print(f"✅ Fontes autorais processadas: {len(entries)}")
    print(f"✅ Arquivos públicos únicos: {len(unique_entries)}")
    print(f"✅ Cards reconciliados: {recovered_cards}")
    print(f"✅ Peso: {original_bytes / 1048576:.1f} MiB → {public_bytes / 1048576:.1f} MiB")
    if missing:
        print(f"❌ Referências legadas sem arquivo: {len(missing)}")
        for name in missing:
            print(f"   - {name}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
