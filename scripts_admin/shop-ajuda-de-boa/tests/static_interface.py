"""Verificação estática da distribuição. Não abre navegador e não testa fluxos ou persistência."""
from html.parser import HTMLParser
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'
class Document(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=[];self.assets=[];self.scripts=[];self.meta={};self.titles=0
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if a.get('id'): self.ids.append(a['id'])
        if tag=='script': self.scripts.append(a.get('src'))
        if tag in ('script','link'):
            path=a.get('src') if tag=='script' else (a.get('href') if a.get('rel')=='stylesheet' else None)
            if path:self.assets.append(path)
        if tag=='meta':self.meta[a.get('name') or a.get('http-equiv')]=a.get('content','')
        if tag=='title':self.titles+=1
page=Document();page.feed((DIST/'index.html').read_text())
assert len(page.ids)==len(set(page.ids)), 'IDs HTML duplicados'
assert page.titles==1 and 'viewport' in page.meta, 'Título ou viewport ausente'
for asset in page.assets:
    assert not asset.startswith(('http:','https:','//')),f'Asset externo inesperado: {asset}'
    path=(DIST/asset).resolve();assert path.is_relative_to(DIST.resolve()) and path.is_file(),f'Asset ausente: {asset}'
expected=['assets/core.js','assets/catalog.js','assets/xp.js','assets/vault.js','assets/plan.js','assets/app.js']
assert page.scripts==expected,'Ordem de scripts ou script não local inesperado'
for element in ['cause-grid','search','category-list','selection-content','wallet-content','dialog','import-file','toast','quick-pix','app-view','xp-calculator']:
    assert element in page.ids,f'Elemento essencial ausente: {element}'
csp=page.meta['Content-Security-Policy']
assert "script-src 'self'" in csp and "object-src 'none'" in csp and "base-uri 'none'" in csp,'Política de conteúdo incompleta'
app=DIST/'downloads'/'bolsa-ajuda-de-boa.html'
assert app.is_file() and app.stat().st_size>20000,'App Bolsa Ajuda de Boa ausente em dist/downloads'
assert 'APP_SHA256' not in (DIST/'index.html').read_text(),'Hash do app não injetado (rode build_app.py)'
print(f'PASS: estrutura HTML, {len(page.ids)} IDs únicos, {len(page.assets)} assets locais e ordem de scripts.')
print('ESCOPO: análise estática apenas; não substitui CUA, testes móveis ou IndexedDB real.')
