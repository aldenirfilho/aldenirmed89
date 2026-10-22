#!/usr/bin/env python3
"""Install the explicitly approved public artwork package; never execute package code.
Only new public image/client files are admitted. Existing destinations and vector
artwork remain untouched. The package contains the user-approved AI illustration,
its thematic crops, and the requested public art-direction studio.
"""
from pathlib import Path, PurePosixPath
import hashlib
import io
import json
import stat
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
VERSION = 'cinematic-360x-v1'
DATE = '2026-10-22'
ZIP_SHA = '3c3056ae99cac65cc2bc044ae02db338498273eb71df38416178c152d64fa987'


def install(package: str) -> None:
    raw = Path(package).read_bytes()
    if len(raw) > 3000000 or hashlib.sha256(raw).hexdigest() != ZIP_SHA:
        raise SystemExit('Package integrity mismatch; nothing installed.')
    directory = json.loads((ROOT / 'ecossistema/data/sites-360x.json').read_text(encoding='utf-8'))
    ids = {p['id'] for p in directory['projects']}
    expected = {f'ecossistema/assets/previews/{VERSION}/{i}.webp' for i in ids | {'reference'}}
    expected |= {
        'ecossistema/assets/cinematic-360x.css',
        'ecossistema/assets/cinematic-360x.js',
        'ecossistema/data/cinematic-360x.json',
        'ecossistema/estudio-360x/index.html',
        'ecossistema/estudio-360x/style.css',
        'ecossistema/estudio-360x/agent.js',
        'ecossistema/estudio-360x/design-system.json',
        'ecossistema/estudio-360x/GUIA_VISUAL.md',
    }
    staged = {}
    with zipfile.ZipFile(io.BytesIO(raw)) as archive:
        names = archive.namelist()
        if len(names) != len(set(names)) or set(names) != expected | {'_payload_manifest.json'}:
            raise SystemExit('Unexpected package paths or changed directory; manual review required.')
        manifest = json.loads(archive.read('_payload_manifest.json'))
        evidence = {entry['path']: entry for entry in manifest['files']}
        if manifest['version'] != VERSION or set(evidence) != expected:
            raise SystemExit('Invalid manifest.')
        if sum(item.file_size for item in archive.infolist()) > 3000000:
            raise SystemExit('Package is too large.')
        for name in sorted(expected):
            info = archive.getinfo(name)
            path = PurePosixPath(name)
            if path.is_absolute() or '..' in path.parts or stat.S_ISLNK(info.external_attr >> 16):
                raise SystemExit('Unsafe archive entry.')
            data = archive.read(name)
            if len(data) != evidence[name]['bytes'] or hashlib.sha256(data).hexdigest() != evidence[name]['sha256']:
                raise SystemExit('File integrity mismatch.')
            target = ROOT / name
            if target.exists() and target.read_bytes() != data:
                raise SystemExit(f'Would overwrite an existing asset: {name}')
            staged[name] = data
    cover_manifest = json.loads(staged['ecossistema/data/cinematic-360x.json'])
    if {c['id'] for c in cover_manifest['covers']} != ids:
        raise SystemExit('Cover mapping does not match live directory.')
    for name, data in staged.items():
        target = ROOT / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)

    index = ROOT / 'ecossistema/index.html'
    html = index.read_text(encoding='utf-8')
    if 'cinematic-360x.css' not in html:
        if html.count('</head>') != 1 or '<form id="sitesControls"' not in html:
            raise SystemExit('Unexpected directory layout; integration stopped.')
        html = html.replace('</head>', '<link rel="stylesheet" href="./assets/cinematic-360x.css?v=1">\n<script src="./assets/cinematic-360x.js?v=1" defer></script>\n</head>', 1)
        banner = '<aside class="cinematic-banner" aria-label="Estilo visual 360X"><div><strong>360X / COMBATE UNIVERSAL</strong><p>Cenas ilustrativas, energia cinematográfica e missões com propósito.</p></div><a href="./estudio-360x/index.html">Abrir Estúdio de Estilo ↗</a></aside>\n      '
        html = html.replace('<form id="sitesControls"', banner + '<form id="sitesControls"', 1)
        index.write_text(html, encoding='utf-8')

    changed = ['ecossistema/index.html']
    registry_path = ROOT / 'data/editorial/registry.json'
    registry = json.loads(registry_path.read_text(encoding='utf-8'))
    for item in registry['items']:
        affected = set(changed) & set(item.get('paths', []))
        if affected:
            revisions = item.setdefault('visualRevisions', [])
            if not any(r.get('id') == VERSION for r in revisions):
                revisions.append({'id': VERSION, 'date': DATE, 'authorization': 'Solicitação explícita de aplicar a imagem aprovada às capas e criar agente de estilo 360X.', 'scope': 'Apresentação visual e acesso ao estúdio; sem revisão de conteúdo clínico.'})
            hashes = {entry['path']: entry for entry in item.get('assetEvidence', [])}
            for path in affected:
                hashes[path] = {'path': path, 'sha256': hashlib.sha256((ROOT / path).read_bytes()).hexdigest()}
            item['assetEvidence'] = list(hashes.values())
    paths = sorted(expected)
    item = {
        'id': VERSION, 'classification': 'public-cited', 'paths': paths,
        'publishTargets': ['github-pages'], 'ownerApproval': True,
        'reviewer': 'Revisão técnica e de apresentação assistida por IA; não representa validação clínica nem revisão jurídica.',
        'reviewedAt': DATE,
        'rights': {'basis': 'owned', 'statement': 'Imagem ilustrativa gerada na conversa e aprovada pelo proprietário para aplicação pública; recortes e apresentação derivados, não fotografias reais. Código e guia produzidos por solicitação do proprietário. Não se afirma exclusividade de copyright sobre conteúdo gerado por IA.'},
        'medical': False, 'personalData': {'contains': False}, 'professionalClaims': [],
        'sources': [{'title': 'Diretório público do Ecossistema 360X', 'url': 'https://aldenirfilho.github.io/aldenirmed89/ecossistema/', 'accessedAt': DATE}],
        'publicationAuthorization': {'source': 'explicit-human-user-request-in-current-chat', 'authorizedAt': DATE, 'authorizationSummary': 'Aplicar o estilo da imagem aprovada às capas dos sites e gerar o agente de estilo 360X.', 'scope': 'Arte ilustrativa e estúdio público de direção visual; não autoriza divulgação de informações privadas.', 'claimsHumanClinicalReview': False, 'grantsClinicalHomologation': False},
        'assetEvidence': [{'path': path, 'sha256': hashlib.sha256((ROOT / path).read_bytes()).hexdigest()} for path in paths],
    }
    registry['items'] = [entry for entry in registry['items'] if entry.get('id') != VERSION] + [item]
    registry_path.write_text(json.dumps(registry, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'covers': len(ids), 'public_paths': paths + changed, 'style': VERSION}, ensure_ascii=False))


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit('Usage: install_360x_cinematic_assets.py approved-public-assets.zip')
    install(sys.argv[1])
