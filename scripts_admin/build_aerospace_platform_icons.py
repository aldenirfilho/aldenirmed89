#!/usr/bin/env python3
"""Convert the reviewed Aeroespacial masters to platform formats (requires Pillow).

No image generation or network access: only resizing and format packaging.
Run from any working directory: python3 scripts_admin/build_aerospace_platform_icons.py
"""
from __future__ import annotations

import hashlib
import io
import json
import shutil
import tempfile
import zipfile
from pathlib import Path

from PIL import Image

try:
    from build_multires_ico import build_ico
except ModuleNotFoundError:
    from scripts_admin.build_multires_ico import build_ico

ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / 'assets/brand'
ICONS = ROOT / 'assets/icons'
MASTER = BRAND / 'aldenirmed89-aerospace-orbital-master.png'
ICO_SIZES = (16, 24, 32, 48, 64, 128, 256)
IOS_SIZES = (120, 152, 167, 180, 1024)


def png(source: Image.Image, size: int) -> bytes:
    out = io.BytesIO()
    source.resize((size, size), Image.Resampling.LANCZOS).save(out, 'PNG', optimize=True)
    return out.getvalue()


def write_zip(destination: Path, members: dict[str, bytes]) -> None:
    """Stable timestamps and permissions keep rebuilds byte-for-byte reproducible."""
    with zipfile.ZipFile(destination, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
        for name, data in sorted(members.items()):
            info = zipfile.ZipInfo(name, (2026, 9, 8, 0, 0, 0))
            info.external_attr = 0o100644 << 16
            info.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(info, data)


def main() -> None:
    with Image.open(MASTER) as source:
        regular = source.convert('RGB')
    if regular.size != (1024, 1024):
        raise ValueError('The original master must be 1024 × 1024.')
    bundle: dict[str, bytes] = {}
    for size in (32, 64, 192, 512, 1024):
        content = png(regular, size) if size != 1024 else MASTER.read_bytes()
        (ICONS / f'antigravity-consultas-{size}.png').write_bytes(content)
        bundle[f'PNG/aldenirmed89-{size}.png'] = content
    for size in IOS_SIZES:
        content = png(regular, size) if size != 1024 else MASTER.read_bytes()
        (ICONS / f'ios/apple-touch-icon-{size}.png').write_bytes(content)
        bundle[f'iOS/apple-touch-icon-{size}.png'] = content
    shutil.copyfile(ICONS / 'ios/apple-touch-icon-180.png', ICONS / 'apple-touch-icon.png')
    shutil.copyfile(MASTER, ROOT / 'assets/img/logo.png')
    for size in (192, 512):
        bundle[f'Android/icon-{size}.png'] = png(regular, size)
    with tempfile.TemporaryDirectory() as directory:
        frames = []
        for size in ICO_SIZES:
            frame = Path(directory) / f'{size}.png'
            frame.write_bytes(png(regular, size))
            frames.append(frame)
        build_ico(ROOT / 'favicon.ico', frames)
        icns = Path(directory) / 'AldenirMed89.icns'
        regular.save(icns, format='ICNS')
        bundle['macOS/AldenirMed89.icns'] = icns.read_bytes()
    windows = ROOT / 'windows/Antigravity-Consultas-Windows'
    shutil.copyfile(ROOT / 'favicon.ico', windows / 'app/AntigravityConsultas.ico')
    bundle['Windows/AldenirMed89.ico'] = (ROOT / 'favicon.ico').read_bytes()
    bundle['README.md'] = (
        '# AldenirMed89 · Aeroespacial · 2026-09-08\n\n'
        'Logotipo aeroespacial original: A branco, órbita ciano e ponto âmbar. Ícones derivados por redimensionamento; desenho preservado.\n\n'
        '- macOS: ICNS para personalizar um atalho; Safari → Arquivo → Adicionar ao Dock usa o ícone do site.\n'
        '- iOS/iPadOS: PNG 120, 152, 167, 180 e 1024 px; Safari → Compartilhar → Adicionar à Tela de Início.\n'
        '- Windows: ICO com 16, 24, 32, 48, 64, 128 e 256 px; use Propriedades do atalho → Alterar ícone.\n'
        '- Android: PNG 192 e 512 px com purpose any; o navegador preserva o desenho completo.\n\n'
        'Site: https://aldenirfilho.github.io/aldenirmed89/\n'
        'Este pacote contém imagens, não aplicativos nativos. Atalhos existentes podem manter o ícone em cache.\n'
    ).encode()
    write_zip(ROOT / 'downloads/AldenirMed89-Identidade-Multiplataforma.zip', bundle)
    write_zip(ROOT / 'downloads/Antigravity-Consultas-Windows.zip', {
        'Antigravity-Consultas-Windows/' + path.relative_to(windows).as_posix(): path.read_bytes()
        for path in windows.rglob('*') if path.is_file()
    })
    ios_archive = ROOT / 'downloads/Antigravity-Consultas-iPhone-Icones.zip'
    with zipfile.ZipFile(ios_archive) as archive:
        ios_members = {name: archive.read(name) for name in archive.namelist()}
    for size in IOS_SIZES:
        name = f'apple-touch-icon-{size}.png'
        ios_members[name] = (ICONS / 'ios' / name).read_bytes()
    write_zip(ios_archive, ios_members)
    archives = sorted((ROOT / 'downloads').glob('*.zip'))
    (ROOT / 'downloads/SHA256SUMS.txt').write_text(''.join(
        f'{hashlib.sha256(path.read_bytes()).hexdigest()}  {path.name}\n' for path in archives
    ))
    metadata = {
        'name': 'AldenirMed89 · Aeroespacial', 'version': '1.0', 'date': '2026-09-08',
        'origin': 'Mestre aeroespacial original do repositório, escolhido pelo proprietário em 2026-09-08; somente redimensionamento e conversão com Pillow.',
        'concept': 'A branco, órbita ciano e ponto âmbar sobre azul profundo.',
        'formats': ['PNG', 'ICO', 'ICNS'],
        'androidPurpose': 'any: o navegador acomoda o símbolo sem cortar a órbita; não rotular o mestre como maskable.',
        'masters': {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in (MASTER,)},
        'package': 'downloads/AldenirMed89-Identidade-Multiplataforma.zip',
        'nativeApps': False,
    }
    (BRAND / 'aerospace-platforms.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + '\n')
    print('Aeroespacial: PNG, ICO, ICNS, pacotes Windows/iOS e checksums atualizados.')


if __name__ == '__main__':
    main()
