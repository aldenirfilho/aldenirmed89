#!/usr/bin/env python3
"""Install the audited static fauna release and register its public provenance.

One-shot helper for the feature branch. No network, secrets, deletion or change
of publication rules. The lzma payload is hash-checked and has an exact path
allowlist before any write. Existing registry items are preserved.
"""
from pathlib import Path
import lzma
import hashlib
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
RELEASE = ROOT / 'scripts_admin/fauna-site-release.json.xz'
EXPECTED_SHA256 = 'c33d75c6d5927cb95f8fc9c964dca803165982d5f2ba7329c7ebc72017029361'
EXPECTED_PATHS = {
    'apps/bolsa-ajuda-fauna/index.html',
    'apps/bolsa-ajuda-fauna/styles.css',
    'apps/bolsa-ajuda-fauna/app.js',
    'apps/bolsa-ajuda-fauna/catalog.json',
    'apps/bolsa-ajuda-fauna/catalog.js',
    'apps/bolsa-ajuda-fauna/README.md',
    'tests/test_fauna_site.py',
}
RELEASE_ID = 'bolsa-ajuda-fauna-20261022'
NAV_ID = 'bolsa-ajuda-fauna-navigation-20261022'
NAV_MARKER = '<!-- bolsa-ajuda-fauna-entry -->'
NAV = '''    <!-- bolsa-ajuda-fauna-entry -->
    <section aria-labelledby="fauna-app-title" class="grid">
      <article class="card">
        <h2 id="fauna-app-title">Bolsa de Ajuda · Fauna 360°</h2>
        <p>Diretório de conservação: 26 animais ameaçados, habitats, ameaças, fontes e instituições para conhecer e apoiar. Conteúdo socioambiental, separado das ferramentas clínicas.</p>
        <div class="tags"><span class="tag">Conservação</span><span class="tag">Ceará e mundo</span></div>
        <div class="actions"><a class="btn primary" href="./bolsa-ajuda-fauna/index.html">Explorar animais e instituições</a></div>
      </article>
    </section>
'''

def main():
    archive = RELEASE.read_bytes()
    if hashlib.sha256(archive).hexdigest() != EXPECTED_SHA256:
        raise SystemExit('Release hash mismatch; no files changed.')
    raw = lzma.decompress(archive)
    if len(raw) > 1024 * 1024:
        raise SystemExit('Release exceeds size limit.')
    payload = json.loads(raw)
    if set(payload) != EXPECTED_PATHS or not all(isinstance(v, str) for v in payload.values()):
        raise SystemExit('Release paths or content types invalid.')
    nav_path = ROOT / 'apps/index.html'
    navigation = nav_path.read_text(encoding='utf-8')
    if NAV_MARKER not in navigation and navigation.count('  </main>') != 1:
        raise SystemExit('Navigation anchor changed; manual review required.')
    registry_path = ROOT / 'data/editorial/registry.json'
    registry = json.loads(registry_path.read_text(encoding='utf-8'))
    if registry.get('schemaVersion') != 'editorial-registry-v1':
        raise SystemExit('Unexpected registry schema.')
    existing_ids = {i['id'] for i in registry['items']}
    existing_paths = {p for i in registry['items'] for p in i.get('paths', [])}
    public_paths = sorted(p for p in EXPECTED_PATHS if p.startswith('apps/bolsa-ajuda-fauna/'))
    if RELEASE_ID not in existing_ids and set(public_paths) & existing_paths:
        raise SystemExit('Public path already registered; refusing duplicate registration.')
    for relative, contents in payload.items():
        destination = ROOT / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(contents, encoding='utf-8')
    catalog = json.loads(payload['apps/bolsa-ajuda-fauna/catalog.json'])
    sources = {}
    for animal in catalog['animals']:
        for source in animal['sources']:
            sources[source['url']] = dict(source, accessedAt=animal['reviewedAt'])
    for org in catalog['organizations']:
        sources[org['url']] = {'title': org['name'], 'url': org['url'], 'accessedAt': org['verifiedAt']}
    approval = {
        'source': 'explicit-human-user-request-in-current-chat',
        'authorizedAt': '2026-10-22',
        'authorizationSummary': 'O proprietário solicitou criar no repositório o site de animais em risco e instituições para ajudar, e confirmou a continuação da execução.',
        'scope': 'Publicação do diretório educativo de fauna e de seu acesso no hub de aplicativos. Sem comprovantes, dados de doadores, pagamentos ou alterações de conteúdo clínico.',
        'claimsHumanClinicalReview': False,
    }
    common = {
        'classification': 'public-cited',
        'publishTargets': ['github-pages'],
        'ownerApproval': True,
        'reviewer': 'ChatGPT — revisão técnica e editorial assistida por IA; não representa revisão humana especializada em conservação ou auditoria financeira.',
        'reviewedAt': '2026-10-22',
        'rights': {'basis': 'owned', 'statement': 'Código e organização originais produzidos por solicitação do proprietário. Sínteses educativas com fontes; sem fotografias ou logotipos de terceiros. Ícones usam caracteres do sistema. Marcas e obras referenciadas permanecem com seus titulares.'},
        'professionalClaims': [],
        'personalData': {'contains': False},
        'publicationAuthorization': approval,
    }
    if RELEASE_ID not in existing_ids:
        registry['items'].append(dict(common, id=RELEASE_ID, paths=public_paths, medical=False, sources=list(sources.values()),
            assetEvidence=[{'path': p, 'sha256': hashlib.sha256(payload[p].encode()).hexdigest()} for p in public_paths]))
    if NAV_MARKER not in navigation:
        navigation = navigation.replace('  </main>', NAV + '  </main>', 1)
        nav_path.write_text(navigation, encoding='utf-8')
    if 'apps/index.html' not in existing_paths and NAV_ID not in existing_ids:
        registry['items'].append(dict(common, id=NAV_ID, paths=['apps/index.html'], medical=True,
            clinicalReviewer='Não aplicável à alteração de navegação: apenas acrescenta acesso a diretório socioambiental. Os cartões clínicos preexistentes permanecem inalterados e não recebem homologação clínica por esta entrega.',
            clinicalReviewStatus='not-applicable-navigation-only',
            sources=[{'title':'Portal AldenirMed89 — hub de aplicativos existente','url':'https://aldenirfilho.github.io/aldenirmed89/apps/','accessedAt':'2026-10-22','scope':'Estrutura técnica existente consultada pelo repositório; sem validação do conteúdo clínico.'}]))
    registry_path.write_text(json.dumps(registry, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('Installed public fauna catalogue; preserved existing registry and navigation.')

if __name__ == '__main__':
    main()
