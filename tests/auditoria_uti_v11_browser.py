#!/usr/bin/env python3
"""Smoke de fluxos reais. Fixtures sintéticas não entram na base publicada."""
import argparse
import hashlib
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--url', default='http://127.0.0.1:8765/ecossistema/auditoria-uti/')
parser.add_argument('--inline', action='store_true', help='Renderização offline sem teste de localStorage')
parser.add_argument('--chromium', default=None)
parser.add_argument('--output', default='test-results/auditoria-uti-v11')
args = parser.parse_args()
out = Path(args.output); out.mkdir(parents=True, exist_ok=True)
checks = []; errors = []; skipped = []

def check(name, condition=True):
    assert condition, name
    checks.append(name)
    print("PASS", name, flush=True)

with sync_playwright() as pw:
    options = {'headless': True}
    if args.chromium:
        options['executable_path'] = args.chromium
        options['args'] = ['--no-sandbox']
    browser = pw.chromium.launch(**options)
    page = browser.new_page(viewport={'width':1440,'height':1000}, accept_downloads=True)
    page.on('pageerror', lambda e: errors.append(str(e)))
    if args.inline:
        page.set_content((ROOT/'ecossistema/auditoria-uti/index.html').read_text(), wait_until='domcontentloaded')
    else:
        response = page.goto(args.url, wait_until='domcontentloaded')
        check('HTTP 200', response.status == 200)
    check('v1.1 carregada', page.evaluate('UTI360XPlus.version') == '1.1.0')
    check('140 itens originais', page.evaluate('UTI360X.DATA.items.length') == 140)
    check('35 referências originais', page.evaluate('UTI360X.DATA.references.length') == 35)
    check('sem overflow no desktop', page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
    page.screenshot(path=str(out/'desktop.png'),full_page=True)
    for view in ['catalog','budget','audit','learn','sources','overview']:
        page.locator('#nav [data-view="'+view+'"]').click()
        expect(page.locator('#view-'+view)).to_be_visible()
    check('seis módulos navegáveis')
    page.locator('#nav [data-view="audit"]').click()
    today=page.evaluate('UTI360XPlusCore.todayISO()')
    check('data da compra atual', page.locator('#purchaseDate').input_value()==today)
    sku=page.evaluate('UTI360X.DATA.items.find(i=>!UTI360X.DATA.references.some(r=>r.sku===i.id)).id')
    header='sku;data;instituicao;processo;preco_embalagem;unidades_base;url;marca;observacoes'
    csv=header+'\n'+'\n'.join(f'{sku};{today};Teste {i};Processo {i};100;1;https://example.test/{i};;Fixture sintética' for i in [1,2,3])
    page.locator('#view-audit [data-v11-open]').click()
    page.locator('#v11-csv-file').set_input_files({'name':'teste.csv','mimeType':'text/csv','buffer':csv.encode()})
    expect(page.locator('#v11-apply')).to_be_enabled()
    check('prévia não altera sessão', page.evaluate('UTI360X.getState().userReferences.length')==0)
    page.locator('#v11-apply').click()
    check('CSV adiciona três referências pendentes', page.evaluate('UTI360X.getState().userReferences.every(r=>r.equivalent===false)'))
    page.locator('#purchaseDoc').fill('TESTE SINTÉTICO <img src=x onerror=alert(1)>')
    page.locator('#paidPrice').fill('130')
    page.locator('#paidQuantity').fill('10')
    for _ in range(3):
        page.locator('[data-v11-ref]:not(:checked)').first.check()
    page.locator('#compareConfirm').check()
    expect(page.locator('#auditResult')).to_contain_text('Prioridade de revisão')
    check('revisão individual e classificação', page.evaluate('UTI360X.evaluateAudit(UTI360X.getAuditInput(),UTI360X.getState().userReferences).materiality')==300)
    page.locator('#view-audit [data-v11-open]').click()
    page.locator('#v11-csv-file').set_input_files({'name':'duplicado.csv','mimeType':'text/csv','buffer':csv.encode()})
    expect(page.locator('#v11-import-status')).to_contain_text('Importação bloqueada')
    expect(page.locator('#v11-apply')).to_be_disabled()
    check('duplicidade não amplia sessão', page.evaluate('UTI360X.getState().userReferences.length')==3)
    page.locator('#v11-close').click()
    with page.expect_download() as evt:
        page.locator('#v11-report').click()
    report=out/'relatorio-sintetico.html';evt.value.save_as(str(report))
    content=report.read_text()
    check('relatório escapa HTML', '&lt;img src=x onerror=alert(1)&gt;' in content and '<img src=x' not in content)
    check('relatório contém fonte e parâmetro', 'example.test/1' in content and 'Razão máxima' in content and 'não comprova superfaturamento' in content)
    page.locator('#nav [data-view="budget"]').click()
    page.locator('#v11-tco summary').click()
    tco={'months':60,'purchase':100000,'install':5000,'maintenance':500,'consumablesBuy':1000,'residual':10000,'rent':2500,'consumablesRent':1000,'returnCost':0}
    for key,value in tco.items():
        page.locator('#v11-tco-'+key).fill(str(value))
    expect(page.locator('#v11-tco-result')).to_contain_text('185.000,00')
    expect(page.locator('#v11-tco-result')).to_contain_text('210.000,00')
    check('compra versus locação calculada')
    session=page.evaluate('UTI360X.getSession()')
    page.evaluate('(s)=>UTI360X.restoreSession(s)',session)
    check('restauração invalida confirmações das referências',page.evaluate('UTI360X.getState().userReferences.every(r=>!r.equivalent)'))
    check('restauração mantém TCO',page.locator('#v11-tco-purchase').input_value()=='100000')
    page.locator('#nav [data-view="sources"]').click()
    if not args.inline:
        page.locator('#v11-autosave').check()
        page.wait_for_function("localStorage.getItem('uti360x-draft-v11') !== null")
        check('salvamento local consentido')
        draft=page.evaluate("localStorage.getItem('uti360x-draft-v11')")
        page.reload(wait_until='domcontentloaded')
        check('abertura não sobrescreve rascunho',page.evaluate("localStorage.getItem('uti360x-draft-v11')")==draft)
        page.locator('#nav [data-view="sources"]').click()
        page.on('dialog',lambda d:d.accept())
        page.locator('#v11-restore').click()
        check('rascunho restaura referências',page.evaluate('UTI360X.getState().userReferences.length')==3)
        page.locator('#v11-forget').click()
        check('exclusão do rascunho restrita ao painel',page.evaluate("localStorage.getItem('uti360x-draft-v11')===null"))
    else:
        skipped.append('localStorage: origem opaca na renderização inline; executar em HTTP no CI')
    with page.expect_download() as evt:
        page.locator('[data-download-workbook]').first.click()
    workbook=out/'planilha.xlsx';evt.value.save_as(str(workbook))
    check('download Excel preservado',hashlib.sha256(workbook.read_bytes()).hexdigest()=='27bf900e427ae9208562a0f26c077f83fcf86eaff3479494730a447d94cf2ed6')
    page.set_viewport_size({'width':390,'height':844})
    for view in ['overview','audit','budget','sources']:
        page.locator('#nav [data-view="'+view+'"]').click()
        check('sem overflow mobile em '+view,page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
    page.locator('#nav [data-view="overview"]').click()
    page.screenshot(path=str(out/'mobile.png'),full_page=True)
    page.locator('#themeBtn').click()
    check('tema claro preservado',page.evaluate('document.documentElement.dataset.theme')=='light')
    page.screenshot(path=str(out/'mobile-light.png'),full_page=True)
    check('sem erro JavaScript',not errors)
    browser.close()
result={'ok':True,'checks':checks,'count':len(checks),'skipped':skipped,'errors':errors,'source':args.url if not args.inline else 'local-inline'}
(out/'resultado.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False))
