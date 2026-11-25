#!/usr/bin/env python3
"""Gera o pacote de ícones AldenirMed 360X (favicon, PWA, iOS e cartão social).

Fontes vetoriais:
- assets/brand-360x/aldenirmed-360x-mark.svg      → favicon.ico, icon-32, icon-64
- assets/brand-360x/aldenirmed-360x-app-icon.svg  → icon-192/512/1024 e apple-touch-icon-*
- assets/brand-360x/aldenirmed-360x-launch-card.png → social-card.png (cópia byte a byte)

Uso:
    python3 scripts_admin/build_360x_icon_release.py          # renderiza (requer rsvg-convert e Pillow)
    python3 scripts_admin/build_360x_icon_release.py --check  # só confere bytes x provenance.json
"""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import shutil
import struct
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets/icons/360x-v1"
MARK = "assets/brand-360x/aldenirmed-360x-mark.svg"
APP = "assets/brand-360x/aldenirmed-360x-app-icon.svg"
CARD = "assets/brand-360x/aldenirmed-360x-launch-card.png"
ICO_SIZES = (16, 24, 32, 48, 64, 128, 256)

PLAN = {
    "icon-32.png": (MARK, 32, True),
    "icon-64.png": (MARK, 64, True),
    "icon-192.png": (APP, 192, False),
    "icon-512.png": (APP, 512, False),
    "icon-1024.png": (APP, 1024, False),
    "apple-touch-icon-120.png": (APP, 120, False),
    "apple-touch-icon-152.png": (APP, 152, False),
    "apple-touch-icon-167.png": (APP, 167, False),
    "apple-touch-icon-180.png": (APP, 180, False),
    "apple-touch-icon-1024.png": (APP, 1024, False),
}
KEEP_CHUNKS = {b"IHDR", b"PLTE", b"tRNS", b"IDAT", b"IEND"}


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def strip_png(data: bytes) -> bytes:
    """Mantém só os blocos essenciais (sem data, software ou EXIF)."""
    assert data[:8] == b"\x89PNG\r\n\x1a\n", "PNG inválido"
    out, offset = [data[:8]], 8
    while offset < len(data):
        length = struct.unpack(">I", data[offset:offset + 4])[0]
        kind = data[offset + 4:offset + 8]
        chunk = data[offset:offset + 12 + length]
        offset += 12 + length
        if kind in KEEP_CHUNKS:
            out.append(chunk)
    return b"".join(out)


def render(source: str, size: int, alpha: bool, workdir: Path) -> bytes:
    from PIL import Image  # import tardio: --check não precisa de Pillow

    target = workdir / f"{Path(source).stem}-{size}.png"
    subprocess.run(
        ["rsvg-convert", "-w", str(size), "-h", str(size), str(ROOT / source), "-o", str(target)],
        check=True,
    )
    image = Image.open(target)
    image = image.convert("RGBA" if alpha else "RGB")
    buffer = io.BytesIO()
    image.save(buffer, format="PNG", optimize=True)
    return strip_png(buffer.getvalue())


def build_ico(workdir: Path) -> bytes:
    from PIL import Image

    frames = []
    for size in ICO_SIZES:
        frames.append(Image.open(io.BytesIO(render(MARK, size, True, workdir))).convert("RGBA"))
    buffer = io.BytesIO()
    frames[-1].save(
        buffer,
        format="ICO",
        sizes=[(s, s) for s in ICO_SIZES],
        append_images=frames[:-1],
    )
    return buffer.getvalue()


def build() -> dict:
    if not shutil.which("rsvg-convert"):
        sys.exit("rsvg-convert não encontrado; instale librsvg2-bin.")
    OUT.mkdir(parents=True, exist_ok=True)
    files: dict[str, dict] = {}
    with tempfile.TemporaryDirectory() as tmp:
        workdir = Path(tmp)
        for name, (source, size, alpha) in PLAN.items():
            data = render(source, size, alpha, workdir)
            (OUT / name).write_bytes(data)
            files[name] = {"source": source, "size": size, "sha256": sha256(data)}
        ico = build_ico(workdir)
        (OUT / "favicon.ico").write_bytes(ico)
        files["favicon.ico"] = {"source": MARK, "sizes": list(ICO_SIZES), "sha256": sha256(ico)}
    card = (ROOT / CARD).read_bytes()
    (OUT / "social-card.png").write_bytes(card)
    files["social-card.png"] = {"source": CARD, "copy": True, "sha256": sha256(card)}
    provenance = {
        "version": 1,
        "description": (
            "Pacote de ícones AldenirMed 360X: favicon e ícones pequenos a partir do emblema "
            "com cantos transparentes; ícones do aplicativo instalado (PWA e iOS) a partir da "
            "versão em sangria total; cartão social idêntico ao cartão de lançamento da abertura."
        ),
        "generator": "scripts_admin/build_360x_icon_release.py",
        "renderer": "rsvg-convert + Pillow (PNG sem metadados)",
        "sources": {path: sha256((ROOT / path).read_bytes()) for path in (MARK, APP, CARD)},
        "files": dict(sorted(files.items())),
    }
    (OUT / "provenance.json").write_text(
        json.dumps(provenance, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return provenance


def check() -> list[str]:
    problems = []
    provenance = json.loads((OUT / "provenance.json").read_text(encoding="utf-8"))
    for path, digest in provenance["sources"].items():
        if sha256((ROOT / path).read_bytes()) != digest:
            problems.append(f"fonte alterada sem regenerar o pacote: {path}")
    for name, record in provenance["files"].items():
        target = OUT / name
        if not target.is_file():
            problems.append(f"arquivo ausente: {name}")
        elif sha256(target.read_bytes()) != record["sha256"]:
            problems.append(f"hash divergente: {name}")
    return problems


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--check", action="store_true", help="confere o pacote sem renderizar")
    args = parser.parse_args()
    if args.check:
        problems = check()
        for problem in problems:
            print(f"❌ {problem}")
        if not problems:
            print("✅ Pacote de ícones 360X íntegro.")
        return 1 if problems else 0
    provenance = build()
    print(f"✅ {len(provenance['files'])} arquivos gerados em {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
