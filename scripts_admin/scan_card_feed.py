#!/usr/bin/env python3
"""Indexa somente imagens já aprovadas para o Card Feed público."""

from __future__ import annotations

import json
import sys
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_DIR = ROOT / "05_Midia_E_Feed/assets/cards/public"
OUTPUT = ROOT / "05_Midia_E_Feed/data/public.json"
SUPPORTED = {".png", ".jpg", ".jpeg", ".webp", ".svg"}


def main() -> int:
    files = []
    if PUBLIC_DIR.is_dir():
        files = [
            path.relative_to(PUBLIC_DIR).as_posix()
            for path in sorted(PUBLIC_DIR.rglob("*"), key=lambda item: item.as_posix().casefold())
            if path.is_file() and path.suffix.lower() in SUPPORTED
        ]

    payload = {
        "description": "Imagens explicitamente aprovadas para o Card Feed público.",
        "updatedAt": date.today().isoformat(),
        "files": files,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"✅ Card Feed: {len(files)} imagem(ns) pública(s) aprovada(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
