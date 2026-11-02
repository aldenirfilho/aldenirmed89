#!/usr/bin/env python3
"""Inventário privado de metadados: não abre imagens nem segue links simbólicos.

Uso: python3 scripts_admin/cardfeed_icloud_inventory.py --source PASTA --output ARQUIVO_PRIVADO
O resultado deve ficar fora do repositório público e fora da pasta original.
"""
from __future__ import annotations

import argparse
import json
import os
import stat
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

RASTER_SUFFIXES = frozenset({'.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.avif'})
REPO_ROOT = Path(__file__).resolve().parents[1]
DATALESS_FLAG = getattr(stat, 'UF_DATALESS', 0x40000000)


def inventory(source: Path, *, max_entries: int = 50000) -> dict:
    source = Path(source).absolute()
    if source.is_symlink():
        raise ValueError('A pasta de origem não pode ser um link simbólico.')
    if not source.is_dir():
        raise ValueError('A origem precisa ser uma pasta disponível para leitura.')
    if max_entries < 1:
        raise ValueError('O limite de entradas precisa ser positivo.')
    counters = Counter(directories=0, files=0, images=0, imageBytes=0,
                       datalessImages=0, ignoredHidden=0, ignoredSymlinks=0,
                       ignoredUnsupported=0, unreadable=0, seen=0)
    records, errors = [], []
    truncated = False
    stack = [(source, '')]
    while stack:
        directory, prefix = stack.pop()
        try:
            with os.scandir(directory) as entries:
                for entry in entries:
                    if counters['seen'] >= max_entries:
                        truncated = True
                        break
                    counters['seen'] += 1
                    relative = f'{prefix}/{entry.name}' if prefix else entry.name
                    if entry.name.startswith('.') or entry.name == '__MACOSX':
                        counters['ignoredHidden'] += 1
                        continue
                    try:
                        if entry.is_symlink():
                            counters['ignoredSymlinks'] += 1
                            continue
                        info = entry.stat(follow_symlinks=False)
                        if stat.S_ISDIR(info.st_mode):
                            counters['directories'] += 1
                            stack.append((Path(entry.path), relative))
                            continue
                        if not stat.S_ISREG(info.st_mode):
                            counters['ignoredUnsupported'] += 1
                            continue
                        counters['files'] += 1
                        suffix = Path(entry.name).suffix.casefold()
                        if suffix not in RASTER_SUFFIXES:
                            counters['ignoredUnsupported'] += 1
                            continue
                        dataless = bool(getattr(info, 'st_flags', 0) & DATALESS_FLAG)
                        counters['images'] += 1
                        counters['imageBytes'] += info.st_size
                        counters['datalessImages'] += int(dataless)
                        records.append({'relativePath': relative, 'extension': suffix,
                                        'size': info.st_size, 'modifiedNs': info.st_mtime_ns,
                                        'dataless': dataless})
                    except OSError as error:
                        counters['unreadable'] += 1
                        errors.append({'relativePath': relative, 'errorType': type(error).__name__})
        except OSError as error:
            counters['unreadable'] += 1
            errors.append({'relativePath': prefix or '.', 'errorType': type(error).__name__})
        if truncated:
            break
    return {'schema': 'cardfeed-icloud-private-inventory-v1',
            'sourceName': source.name, 'createdAt': datetime.now(timezone.utc).isoformat(),
            'metadataOnly': True, 'imageBytesRead': False, 'followedSymlinks': False,
            'maxEntries': max_entries, 'truncated': truncated,
            'eligibleExtensions': sorted(RASTER_SUFFIXES), 'summary': dict(counters),
            'images': sorted(records, key=lambda record: record['relativePath']), 'errors': errors}


def write_private_report(report: dict, output: Path, source: Path) -> None:
    output = Path(output).expanduser().resolve()
    source = Path(source).expanduser().resolve()
    if output.is_relative_to(REPO_ROOT):
        raise ValueError('O inventário deve ficar fora do repositório público.')
    if output.is_relative_to(source):
        raise ValueError('Não grave o inventário na pasta original de imagens.')
    output.parent.mkdir(parents=True, exist_ok=True)
    # Não sobrescrever silenciosamente um inventário anterior.
    with output.open('x', encoding='utf-8') as handle:
        json.dump(report, handle, ensure_ascii=False, indent=2)
        handle.write('\n')


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    parser.add_argument('--max-entries', type=int, default=50000)
    args = parser.parse_args(argv)
    try:
        report = inventory(args.source.expanduser(), max_entries=args.max_entries)
        write_private_report(report, args.output, args.source)
    except (OSError, ValueError) as error:
        parser.exit(2, f'Inventário não gravado: {error}\n')
    print(json.dumps({'metadataOnly': True, 'truncated': report['truncated'],
                      'summary': report['summary']}, ensure_ascii=False))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
