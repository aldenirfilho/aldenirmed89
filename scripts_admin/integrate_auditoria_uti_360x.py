#!/usr/bin/env python3
"""Importa somente o painel autorizado e integra a seção Auditoria UTI.

O pacote é público por autorização do proprietário para esta publicação.
Seu SHA-256 é conferido antes de qualquer leitura. Nenhum código do ZIP é
executado, e nenhum arquivo preexistente da seção é sobrescrito silenciosamente.
"""
from __future__ import annotations
import argparse
import base64
import hashlib
import io
import json
import re
import urllib.request
import zipfile
from pathlib import Path

ARCHIVE_SHA256 = 'c947c9454ec4191af98ea840786b3f372189285b5ec1de9df2a94c8f447bcba1'
SHARE_URL = 'https://1drv.ms/u/c/c4031850a37efbbc/IQCwSrLdSYLxRruVXlYJS16EAWBXrANrf1NC8fahvrWjj1s'
PUBLIC_URL = 'https://aldenirfilho.github.io/aldenirmed89/ecossistema/auditoria-uti/'
DEST = Path('ecossistema/auditoria-uti')
MAX_ARCHIVE = 5 * 1024 * 1024


def download_archive() -> bytes:
    share_id = 'u!' + base64.urlsafe_b64encode(SHARE_URL.encode()).decode().rstrip('=')
    candidates = [
        SHARE_URL + '?download=1',
        f'https://api.onedrive.com/v1.0/shares/{share_id}/root/content',
        'https://my.microsoftpersonalcontent.com/personal/c4031850a37efbbc/_layouts/15/download.aspx?share=IQCwSrLdSYLxRruVXlYJS16EAWBXrANrf1NC8fahvrWjj1s',
    ]
    for index, url in enumerate(candidates, 1):
        try:
            request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 UTI360X-Publisher/1.0'})
            with urllib.request.urlopen(request, timeout=45) as response:
                payload = response.read(MAX_ARCHIVE + 1)
            if len(payload) <= MAX_ARCHIVE and hashlib.sha256(payload).hexdigest() == ARCHIVE_SHA256:
                print(f'Transferência {index}: integridade SHA-256 confirmada.')
                return payload
            print(f'Transferência {index}: conteúdo não corresponde ao pacote autorizado.')
        except Exception as exc:
            print(f'Transferência {index}: {type(exc).__name__}.')
    raise RuntimeError('Não foi possível obter o pacote autorizado. Use --archive com a cópia original.')


def write_new(path: Path, payload: bytes) -> None:
    if path.exists() and path.read_bytes() != payload:
        raise RuntimeError(f'Conteúdo preexistente diferente em {path}; revisão manual necessária.')
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(payload)


def integrate(payload: bytes) -> None:
    assert hashlib.sha256(payload).hexdigest() == ARCHIVE_SHA256, 'SHA-256 do pacote incorreto'
    with zipfile.ZipFile(io.BytesIO(payload)) as archive:
        data = json.loads(archive.read('UTI360X_base_documental.json'))
        assert len(data['items']) == 140
        assert len(data['references']) == 35
        assert sum(group['priced'] for group in data['coverage']) == 32
        original = archive.read('index.html').decode('utf-8')
        assert 'id="appData"' in original and 'id="workbookBytes"' in original
        panel = original.replace('<title>Custos da UTI | Turbo TEMI 360X</title>', '<title>Auditoria UTI | AldenirMed89 · Turbo TEMI 360X</title>', 1)
        metadata = f'''<link rel="canonical" href="{PUBLIC_URL}">
<meta property="og:title" content="Auditoria UTI — Turbo TEMI 360X | AldenirMed89">
<meta property="og:description" content="Catálogo de 140 itens, cenários para 10/20/30 leitos e triagem de preços. Base parcial; alertas não comprovam irregularidades.">
<meta property="og:url" content="{PUBLIC_URL}">
<meta property="og:type" content="website">
'''
        panel = panel.replace('</head>', metadata + '</head>', 1)
        anchor = '<div class="top-actions">'
        assert panel.count(anchor) == 1
        panel = panel.replace(anchor, anchor + '<a class="btn" href="../../#auditoria-uti" title="Voltar à seção Auditoria UTI do AldenirMed89">AldenirMed89</a>', 1)
        panel = panel.replace('Arquivo local • sem conexão', 'Cálculos locais • sem sincronização', 1)
        panel = panel.replace('<div class="nav-label">AUDITORIA DE UTI</div>', '<div class="nav-label">AUDITORIA UTI</div>', 1)
        # Dados, planilha incorporada e código funcional permanecem idênticos.
        for identifier in ('appData', 'workbookBytes'):
            pattern = rf'<script[^>]*id="{identifier}"[^>]*>(.*?)</script>'
            assert re.search(pattern, panel, re.S).group(1) == re.search(pattern, original, re.S).group(1)
        scripts = re.findall(r'<script>(.*?)</script>', panel, re.S)
        assert scripts == re.findall(r'<script>(.*?)</script>', original, re.S)
        write_new(DEST / 'index.html', panel.encode('utf-8'))
        write_new(DEST / 'data/base-documental.json', archive.read('UTI360X_base_documental.json'))
        write_new(DEST / 'data/referencias-documentais.csv', archive.read('UTI360X_Referencias_Documentais.csv'))
        write_new(DEST / 'validacao/testes-originais.json', archive.read('validacao/test_results.json'))
        write_new(DEST / 'validacao/testes-adicionais.json', archive.read('validacao/additional_test_results.json'))
        # A planilha está incorporada no próprio HTML; não precisa de serviço externo.
        workbook_sha = hashlib.sha256(archive.read('Planilha_Mestre_Custos_UTI_360X_v1.xlsx')).hexdigest()
    manifest = {
        'module': 'Auditoria UTI — Turbo TEMI 360X', 'integratedAt': '2026-10-22',
        'url': PUBLIC_URL, 'sourceArchiveSha256': ARCHIVE_SHA256,
        'sourceHtmlSha256': hashlib.sha256(original.encode()).hexdigest(),
        'publishedHtmlSha256': hashlib.sha256(panel.encode()).hexdigest(),
        'embeddedWorkbookSha256': workbook_sha, 'items': 140, 'documentedPrices': 32,
        'observations': 35, 'automaticBpsPncpSync': False,
        'integrationChecks': ['package-sha256', '140-items', '35-observations', '32-priced-items', 'unchanged-data', 'unchanged-workbook', 'unchanged-functional-javascript'],
    }
    write_new(DEST / 'integracao.json', (json.dumps(manifest, ensure_ascii=False, indent=2) + '\n').encode())
    readme = f'''# Auditoria UTI — Turbo TEMI 360X

Seção do AldenirMed89: [{PUBLIC_URL}]({PUBLIC_URL}).

## Conteúdo

Painel autocontido com 140 itens de UTI adulto; catálogo, cenários para 10/20/30 leitos,
comparação de preços, revisão e fontes. A planilha Excel original está incorporada
no HTML e pode ser obtida pelo botão **Planilha Excel**.

## Limites obrigatórios

Base documental de 22/10/2026: 35 observações e 32 itens com preço elegível.
Nenhum item tem três referências elegíveis na base inicial. A pesquisa não é
completa nem se atualiza automaticamente pelo BPS/PNCP. Os alertas priorizam
revisão, não comprovam superfaturamento. Não inserir dados de pacientes.
As simulações rodam no navegador; usar Salvar sessão para conservar entradas.

## Rastreabilidade

`integracao.json` registra os hashes SHA-256 do pacote, HTML e Excel.
`data/` contém a base documental e o CSV de referências.
`validacao/` preserva os testes da criação original; não são uma certificação.
A integração preserva os dados, a planilha e o JavaScript funcional originais.

[Voltar ao AldenirMed89](../../#auditoria-uti)
'''
    write_new(DEST / 'README.md', readme.encode())

    home_path = Path('index.html')
    home = home_path.read_text(encoding='utf-8')
    if 'id="auditoria-uti"' not in home:
        section = '''
<!-- Auditoria UTI 360X: seção integrada, sem substituir módulos existentes. -->
<section id="auditoria-uti" class="section" aria-labelledby="auditoria-uti-title">
  <div class="uti360x-intro">
    <span class="section-tag">Turbo TEMI 360X · Gestão e transparência</span>
    <h2 id="auditoria-uti-title">Auditoria UTI</h2>
    <p>Do preço do equipamento ao custo por paciente-dia. Consulte o catálogo, explore os cenários e revise as evidências de uma compra.</p>
    <div class="uti360x-actions"><a class="uti360x-primary" href="ecossistema/auditoria-uti/">Abrir painel de Auditoria UTI →</a><a href="https://github.com/aldenirfilho/aldenirmed89/tree/main/ecossistema/auditoria-uti" target="_blank" rel="noopener noreferrer">Documentação no GitHub</a></div>
    <p class="uti360x-notice"><strong>Base documental parcial:</strong> 32 dos 140 itens possuem preço elegível. Sem atualização automática BPS/PNCP. Alertas indicam revisão; não comprovam superfaturamento.</p>
  </div>
  <div class="uti360x-features" aria-label="Recursos do painel">
    <div><strong>140 itens</strong><span>Equipamentos, medicamentos e materiais.</span></div>
    <div><strong>10 / 20 / 30 leitos</strong><span>Cenários de orçamento e paciente-dia.</span></div>
    <div><strong>Triagem de preços</strong><span>Fontes, equivalência e amostra mínima.</span></div>
    <div><strong>Excel incorporado</strong><span>Planilha original disponível no painel.</span></div>
  </div>
</section>
'''
        marker = re.search(r'<section\b[^>]*\bid=["\']modulos["\'][^>]*>', home)
        if marker is None:
            marker = re.search(r'<(?:section|div)\b[^>]*\bid=["\']downloads["\'][^>]*>', home)
        if marker is None:
            raise RuntimeError('Ponto seguro de inserção da seção não encontrado na homepage.')
        home = home[:marker.start()] + section + home[marker.start():]
        css = '''
<style id="auditoria-uti-360x-style">
#auditoria-uti{max-width:var(--page-max,1400px);margin:0 auto;padding:clamp(32px,5vw,64px) var(--page-gutter,24px);display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:28px;scroll-margin-top:160px}
#auditoria-uti h2{font:700 clamp(28px,3vw,42px)/1.2 var(--font-head,sans-serif);margin:12px 0}
#auditoria-uti p{color:var(--soft,#c7d7ea);line-height:1.65;max-width:68ch}
.uti360x-actions{display:flex;align-items:center;gap:18px;flex-wrap:wrap;margin:22px 0}
.uti360x-actions a{min-height:44px;display:inline-flex;align-items:center;color:var(--cyan,#73ddd6);font-weight:600}
.uti360x-actions .uti360x-primary{border:1px solid var(--cyan,#73ddd6);background:var(--cyan-d,#102f3d);border-radius:12px;padding:13px 20px}
#auditoria-uti .uti360x-notice{font-size:13px;border-left:3px solid var(--yellow,#f4bd73);padding:8px 14px}
.uti360x-features{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;align-content:center}
.uti360x-features div{border:1px solid var(--brd,#26364d);background:var(--surf,#101b2c);border-radius:16px;padding:21px}
.uti360x-features strong{display:block;font-size:20px;color:var(--text,#eef3fa);margin-bottom:8px}
.uti360x-features span{display:block;color:var(--muted,#a5b4c9);font-size:14px;line-height:1.5}
@media(max-width:760px){#auditoria-uti{grid-template-columns:1fr}.uti360x-features strong{font-size:18px}}
@media(max-width:380px){.uti360x-features{grid-template-columns:1fr}}
</style>
'''
        home = home.replace('</head>', css + '</head>', 1)
    if 'href="#auditoria-uti" class="accent"' not in home:
        nav = '<div class="nav-links" role="navigation" aria-label="Navegação principal">'
        assert home.count(nav) == 1, 'Navegação principal não encontrada de forma única'
        home = home.replace(nav, nav + '\n      <a href="#auditoria-uti" class="accent">Auditoria UTI</a>', 1)
    assert home.count('id="auditoria-uti"') == 1
    assert 'href="ecossistema/auditoria-uti/"' in home
    home_path.write_text(home, encoding='utf-8')

    portfolio = Path('docs_usuario/PORTFOLIO_GITHUB/README.md')
    if portfolio.exists():
        text = portfolio.read_text(encoding='utf-8')
        if PUBLIC_URL not in text:
            text += f'\n\n## Auditoria UTI — Turbo TEMI 360X\n\n[Painel de custos e auditoria de UTI]({PUBLIC_URL}) · [Código e documentação](../../ecossistema/auditoria-uti/README.md).\n\nCatálogo de 140 itens; orçamento para 10/20/30 leitos; triagem de preços e Excel incorporado. Base parcial: 32 itens com preço elegível, sem sincronização automática com BPS/PNCP. Alertas não comprovam superfaturamento.\n'
            portfolio.write_text(text, encoding='utf-8')
    Path('/tmp/uti360x-functional.js').write_text('\n'.join(scripts), encoding='utf-8')
    print('Integração validada: página, seção, navegação, portfólio e rastreabilidade.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--archive', type=Path, help='Pacote ZIP original, com SHA-256 verificado')
    args = parser.parse_args()
    integrate(args.archive.read_bytes() if args.archive else download_archive())
