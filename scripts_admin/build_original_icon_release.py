#!/usr/bin/env python3
"""Publish immutable URLs for the recovered original logo; copy bytes only."""
import hashlib
import json
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
DEST = 'assets/icons/aerospace-v2'
ORIGINAL_SHA256 = '1b0332baa08c1e9aebc98868ad2714a1a7c6b035302d28699fd052de5e324850'
SOURCES = {
    'favicon.ico': 'favicon.ico',
    **{f'icon-{size}.png': f'assets/icons/antigravity-consultas-{size}.png'
       for size in (32, 64, 192, 512, 1024)},
    **{f'apple-touch-icon-{size}.png': f'assets/icons/ios/apple-touch-icon-{size}.png'
       for size in (120, 152, 167, 180, 1024)},
    'social-card.png': 'assets/brand/aldenirmed89-aerospace-launch-card.png',
}


def main():
    master = ROOT / 'assets/brand/aldenirmed89-aerospace-orbital-master.png'
    if hashlib.sha256(master.read_bytes()).hexdigest() != ORIGINAL_SHA256:
        raise ValueError('O mestre original foi alterado; revisar antes de publicar.')
    destination = ROOT / DEST
    destination.mkdir(exist_ok=True)
    for name, source in SOURCES.items():
        shutil.copyfile(ROOT / source, destination / name)
    (destination / 'provenance.json').write_text(json.dumps({
        'version': 2,
        'description': 'Logotipo original: A branco, órbita ciano e ponto âmbar. Cópias sem alteração do desenho, com novos endereços para atualização do cache.',
        'masterSha256': ORIGINAL_SHA256,
        'files': {name: {'source': source, 'sha256': hashlib.sha256((destination / name).read_bytes()).hexdigest()}
                  for name, source in SOURCES.items()},
    }, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{len(SOURCES)} ícones e miniaturas originais copiados para {DEST}.')


if __name__ == '__main__':
    main()
