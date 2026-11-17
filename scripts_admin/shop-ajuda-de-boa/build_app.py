#!/usr/bin/env python3
"""Monta o app Bolsa Ajuda de Boa (arquivo único) e a vitrine pública da Ajuda de Boa.

Saídas:
  dist/downloads/bolsa-ajuda-de-boa.html   app offline, scripts inline com CSP por hash
  dist/index.html                          recebe o SHA-256 e o tamanho do app
  <repo>/apps/ajuda-de-boa/                vitrine pública (data-mode="vitrine", sem cofre)

Uso:
  python3 scripts_admin/shop-ajuda-de-boa/build_app.py           # gera tudo
  python3 scripts_admin/shop-ajuda-de-boa/build_app.py --check   # falha se algo estiver desatualizado
Sem rede e sem dependências externas.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"
APP = ROOT / "app"
REPO = ROOT.parents[1]
VITRINE = REPO / "apps" / "ajuda-de-boa"
VERSION = "1.0"
BUILT = "2026-11-16"
SCRIPTS = ["assets/core.js", "assets/catalog.js", "assets/xp.js", "assets/vault.js"]
VITRINE_URL = "https://aldenirfilho.github.io/aldenirmed89/apps/ajuda-de-boa/"


def build_app() -> bytes:
    sources = [(DIST / rel).read_text(encoding="utf-8") for rel in SCRIPTS]
    sources.append((APP / "app-bolsa.js").read_text(encoding="utf-8"))
    hashes, tags = [], []
    for src in sources:
        if "</script" in src.lower():
            raise SystemExit("Script contém </script e não pode ser embutido.")
        digest = base64.b64encode(hashlib.sha256(src.encode("utf-8")).digest()).decode()
        hashes.append(f"'sha256-{digest}'")
        tags.append(f"<script>{src}</script>")
    html = (APP / "template.html").read_text(encoding="utf-8")
    html = (
        html.replace("{{SCRIPT_HASHES}}", " ".join(hashes))
        .replace("{{CSS}}", (APP / "bolsa.css").read_text(encoding="utf-8"))
        .replace("{{VERSION}}", VERSION)
        .replace("{{BUILT}}", BUILT)
        .replace("{{SCRIPTS}}", "\n".join(tags))
    )
    if "{{" in html:
        raise SystemExit("Marcador não substituído no template do app.")
    return html.encode("utf-8")


def human(size: int) -> str:
    return f"{size / 1024:.0f} KB".replace(".", ",")


def inject_hash(index: str, app: bytes) -> str:
    sha = hashlib.sha256(app).hexdigest()
    index, n1 = re.subn(r'(<code class="hash" id="app-sha">)[^<]*(</code>)', rf"\g<1>{sha}\g<2>", index)
    index, n2 = re.subn(r'(<span id="app-size">)[^<]*(</span>)', rf"\g<1>{human(len(app))}\g<2>", index)
    if n1 != 1 or n2 != 1:
        raise SystemExit("Marcadores de hash/tamanho do app ausentes em dist/index.html.")
    return index


def vitrine_files(index: str) -> dict[str, bytes]:
    page = index.replace('<html lang="pt-BR">', '<html lang="pt-BR" data-mode="vitrine">', 1)
    page = page.replace(
        '<link rel="canonical" href="https://shop-ajuda-de-boa.aldenirmed.chatgpt.site/">',
        f'<link rel="canonical" href="{VITRINE_URL}">',
        1,
    )
    page = re.sub(r"<!-- Optimizer - [^>]*-->\n?", "", page)
    if 'data-mode="vitrine"' not in page:
        raise SystemExit("Não foi possível marcar a vitrine.")
    audit = (DIST / "auditoria.html").read_text(encoding="utf-8").replace('<a href="/">', '<a href="./">')
    files = {"index.html": page.encode("utf-8"), "auditoria.html": audit.encode("utf-8")}
    for asset in sorted((DIST / "assets").iterdir()):
        files[f"assets/{asset.name}"] = asset.read_bytes()
    files["downloads/bolsa-ajuda-de-boa.html"] = (DIST / "downloads" / "bolsa-ajuda-de-boa.html").read_bytes()
    return files


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    app = build_app()
    index_path = DIST / "index.html"
    index = inject_hash(index_path.read_text(encoding="utf-8"), app)
    targets: dict[Path, bytes] = {
        DIST / "downloads" / "bolsa-ajuda-de-boa.html": app,
        index_path: index.encode("utf-8"),
    }
    if not args.check:
        for path, data in targets.items():
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
    for rel, data in vitrine_files(index).items():
        targets[VITRINE / rel] = data
    stale = [p for p, d in targets.items() if not p.exists() or p.read_bytes() != d]
    if args.check:
        if stale:
            print("DESATUALIZADO:", *[str(p.relative_to(REPO)) for p in stale], sep="\n  ")
            return 1
        print(f"OK: app {VERSION} e vitrine atualizados ({len(targets)} arquivos).")
        return 0
    for path in stale:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(targets[path])
    print(f"App {VERSION}: {human(len(app))} · SHA-256 {hashlib.sha256(app).hexdigest()}")
    print(f"Vitrine: {VITRINE.relative_to(REPO)} ({len(targets) - 2} arquivos)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
