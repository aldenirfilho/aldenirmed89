#!/usr/bin/env python3
"""Avisa os buscadores do IndexNow (Bing, Yandex, Naver, Seznam, Yep) sobre URLs novas.

O Google não participa do IndexNow: para ele valem o sitemap enviado no Search
Console e a inspeção de URL. Este script roda no job ``deploy`` depois que o
GitHub Pages publicou o site e nunca derruba o deploy: falhas viram aviso.

Uso:
    python3 scripts_admin/indexnow_submit.py --changed-since <sha>   # só o que mudou no push
    python3 scripts_admin/indexnow_submit.py --all                   # todas as URLs dos sitemaps
    python3 scripts_admin/indexnow_submit.py --all --dry-run         # mostra sem enviar

Regras do protocolo respeitadas: a chave fica em ``/aldenirmed89/<chave>.txt``
(``keyLocation``), então só URLs sob ``/aldenirmed89/`` podem ser enviadas; no
máximo 10.000 URLs por envio; reenvio apenas do que mudou.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import quote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "scripts_admin" / "seo_360x_config.json"
BASE_URL = "https://aldenirfilho.github.io/aldenirmed89/"
MAX_URLS = 10_000
USER_AGENT = "AldenirMed360X-IndexNow/1.0 (+https://aldenirfilho.github.io/aldenirmed89/)"


def http_get(url: str, timeout: int = 20) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return response.read().decode("utf-8", errors="replace")


def sitemap_universe(base_url: str, fetch=http_get) -> list[str]:
    """URLs publicadas segundo o sitemap_index (ou sitemap.xml, se o índice faltar)."""
    try:
        index = fetch(base_url + "sitemap_index.xml")
        children = re.findall(r"<loc>([^<]+)</loc>", index)
    except (urllib.error.URLError, OSError):
        children = [base_url + "sitemap.xml"]
    urls: list[str] = []
    for child in children:
        try:
            urls.extend(re.findall(r"<loc>([^<]+)</loc>", fetch(child)))
        except (urllib.error.URLError, OSError) as exc:
            print(f"⚠️ Sitemap indisponível ({child}): {exc}")
    return [url for url in dict.fromkeys(urls) if url.startswith(base_url)]


def canonical(path: str, base_url: str = BASE_URL) -> str:
    if path == "index.html":
        return base_url
    if path.endswith("/index.html"):
        path = path[: -len("index.html")]
    return base_url + quote(path, safe="/:-._~")


def changed_paths(since: str) -> list[str]:
    if not since or set(since) == {"0"}:
        return []
    result = subprocess.run(
        ["git", "-C", str(ROOT), "diff", "--name-only", "--diff-filter=ACMR", since, "HEAD"],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        print(f"⚠️ git diff falhou ({result.stderr.strip()}); nada será enviado.")
        return []
    return [line for line in result.stdout.splitlines() if line]


def select_urls(paths: list[str], universe: list[str], base_url: str = BASE_URL) -> list[str]:
    """Liga arquivos alterados às URLs públicas que eles produzem."""
    available = set(universe)
    selected: list[str] = []
    for path in paths:
        if path.endswith(".html"):
            selected.append(canonical(path, base_url))
        elif path.startswith("jornal-360/"):
            selected.extend(url for url in universe if url.startswith(base_url + "jornal-360/"))
        elif path.startswith("complexo-360x/"):
            selected.append(base_url + "complexo-360x/")
        if not path.endswith(".html"):
            # Dados, estilos e scripts mudam a página índice publicada mais próxima.
            parts = path.split("/")[:-1]
            for depth in range(len(parts), 0, -1):
                candidate = base_url + quote("/".join(parts[:depth]) + "/", safe="/:-._~")
                if candidate in available:
                    selected.append(candidate)
                    break
    return [url for url in dict.fromkeys(selected) if url in available]


def key_is_live(key_location: str, key: str, attempts: int = 6, wait: int = 20, fetch=http_get) -> bool:
    for attempt in range(1, attempts + 1):
        try:
            if fetch(key_location).strip() == key:
                return True
        except (urllib.error.URLError, OSError):
            pass
        if attempt < attempts:
            time.sleep(wait)
    return False


def submit(urls: list[str], key: str, endpoint: str, base_url: str = BASE_URL) -> int:
    host = urlsplit(base_url).netloc
    payload = {
        "host": host,
        "key": key,
        "keyLocation": f"{base_url}{key}.txt",
        "urlList": urls[:MAX_URLS],
    }
    request = urllib.request.Request(
        endpoint,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json; charset=utf-8", "User-Agent": USER_AGENT},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return response.status
    except urllib.error.HTTPError as exc:
        return exc.code


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Envia URLs alteradas ao IndexNow.")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--changed-since", metavar="SHA")
    group.add_argument("--all", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args(argv)

    config = json.loads(CONFIG.read_text(encoding="utf-8"))
    key = (config.get("indexnow") or {}).get("key", "")
    endpoint = (config.get("indexnow") or {}).get("endpoint", "https://api.indexnow.org/indexnow")
    if not key:
        print("ℹ️ IndexNow sem chave configurada; nada a fazer.")
        return 0

    universe = sitemap_universe(BASE_URL)
    if not universe:
        print("⚠️ Nenhuma URL encontrada nos sitemaps publicados; nada enviado.")
        return 0
    if args.all:
        urls = universe
    else:
        paths = changed_paths(args.changed_since)
        # Primeira publicação do motor (ou troca de chave): envia o inventário inteiro.
        urls = universe if "scripts_admin/seo_360x_config.json" in paths else select_urls(paths, universe)
    if not urls:
        print("ℹ️ Nenhuma página pública alterada neste push; nada enviado ao IndexNow.")
        return 0

    print(f"🔎 {len(urls)} URL(s) para o IndexNow:")
    for url in urls[:25]:
        print("   ", url)
    if len(urls) > 25:
        print(f"    … e mais {len(urls) - 25}.")
    if args.dry_run:
        print("🧪 Simulação: nada foi enviado.")
        return 0

    key_location = f"{BASE_URL}{key}.txt"
    if not key_is_live(key_location, key):
        print(f"⚠️ Arquivo-chave ainda não publicado em {key_location}; envio adiado para o próximo deploy.")
        return 0
    status = submit(urls, key, endpoint)
    meaning = {
        200: "aceito",
        202: "recebido; a chave será validada",
        400: "requisição inválida",
        403: "chave não validada",
        422: "URLs não pertencem ao host ou à chave",
        429: "limite de envios atingido",
    }.get(status, "resposta inesperada")
    icon = "✅" if status in (200, 202) else "⚠️"
    print(f"{icon} IndexNow HTTP {status}: {meaning}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
