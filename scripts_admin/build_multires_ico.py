#!/usr/bin/env python3
"""Empacota PNGs quadrados em um ICO multirresolução sem dependências externas."""

from __future__ import annotations

import argparse
import struct
from pathlib import Path


PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


def read_png(path: Path) -> tuple[int, int, bytes]:
    data = path.read_bytes()
    if data[:8] != PNG_SIGNATURE or data[12:16] != b"IHDR":
        raise ValueError(f"Arquivo não é PNG válido: {path}")
    width, height = struct.unpack(">II", data[16:24])
    if width != height or not 1 <= width <= 256:
        raise ValueError(f"O frame precisa ser quadrado e ter 1–256 px: {path}")
    return width, height, data


def build_ico(output: Path, png_paths: list[Path]) -> None:
    frames = [read_png(path) for path in png_paths]
    sizes = [width for width, _height, _data in frames]
    if len(frames) != len(set(sizes)):
        raise ValueError("Há tamanhos de frame duplicados.")

    header = struct.pack("<HHH", 0, 1, len(frames))
    directory_size = len(frames) * 16
    offset = len(header) + directory_size
    entries: list[bytes] = []
    payloads: list[bytes] = []
    for width, height, data in frames:
        entries.append(
            struct.pack(
                "<BBBBHHII",
                0 if width == 256 else width,
                0 if height == 256 else height,
                0,
                0,
                1,
                32,
                len(data),
                offset,
            )
        )
        payloads.append(data)
        offset += len(data)

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(header + b"".join(entries) + b"".join(payloads))


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Cria um favicon/ícone Windows com múltiplos PNGs."
    )
    parser.add_argument("output", type=Path)
    parser.add_argument("pngs", nargs="+", type=Path)
    args = parser.parse_args()
    build_ico(args.output, args.pngs)
    print(f"ICO criado com {len(args.pngs)} tamanhos: {args.output}")


if __name__ == "__main__":
    main()
