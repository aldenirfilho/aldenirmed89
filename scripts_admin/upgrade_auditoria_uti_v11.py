#!/usr/bin/env python3
"""Integra a extensão v1.1 de forma idempotente, preservando dados e Excel.

Uso: python3 scripts_admin/upgrade_auditoria_uti_v11.py [--check]
O modo --check não escreve arquivos. O HTML continua autocontido e sem rede.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODULE = ROOT / 'ecossistema/auditoria-uti'
MARKER = '<!-- uti360x-v11:'

def once(text: str, old: str, new: str) -> str:
    if text.count(old) != 1:
        raise ValueError('Âncora ausente ou ambígua: ' + old[:90])
    return text.replace(old, new, 1)

def payload(text: str, ident: str) -> str:
    match = re.search(r'<script\b[^>]*\bid="' + re.escape(ident) + r'"[^>]*>(.*?)</script>', text, re.S)
    if not match:
        raise ValueError('Payload não encontrado: ' + ident)
    return match.group(1)

def block(name: str, content: str) -> str:
    return f'<!-- uti360x-v11:{name}:start -->\n{content}\n<!-- uti360x-v11:{name}:end -->'

def replace_block(text: str, name: str, content: str, anchor: str) -> str:
    pattern = r'<!-- uti360x-v11:' + name + r':start -->.*?<!-- uti360x-v11:' + name + r':end -->'
    target = block(name, content)
    if re.search(pattern, text, re.S):
        return re.sub(pattern, lambda _: target, text, count=1, flags=re.S)
    return once(text, anchor, target + '\n' + anchor)

def build(original: str) -> str:
    result = original
    if MARKER not in result:
        result = once(result, 'a.date>DATA.cutoff', 'a.date>UTI360XPlusCore.todayISO()')
        result = once(result, 'A data da compra deve ser válida e não posterior ao corte da base (22/10/2026).', 'A data da compra deve ser válida e não futura (fuso America/Fortaleza). A base histórica não define o limite da compra.')
        result = once(result, 'equivalent:r.equivalent===true', 'equivalent:false')
        result = once(result, 'quiz:state.quiz};}', 'quiz:state.quiz,extension:window.UTI360XPlus?.getExtension()??null};}')
        result = once(result, 'function init(){hydrateIcons();', "function init(){hydrateIcons();$('purchaseDate').max=UTI360XPlusCore.todayISO();$('purchaseDate').value=UTI360XPlusCore.todayISO();")
        result = once(result, "renderAudit();toast('Sessão restaurada. Reconfirme a reconciliação e a comparabilidade.');", "renderAudit();window.UTI360XPlus?.restoreExtension(obj.extension);toast('Sessão restaurada. Reconfirme cada referência, a compra e os cenários.');")
        # Os hooks são limitados ao estado já existente e não dão acesso de rede.
        old = 'window.UTI360X=Object.freeze({DATA,getStats,equipmentTotals,computeBudget,evaluateAudit,classifyReferences,getFilteredItems,getSession,validateSession,getState:()=>state});'
        new = "function restoreSessionObject(obj){const clean=validateSession(obj);state.budgets=clean.budgets;state.userReferences=clean.userReferences;state.beds=clean.beds;setAudit(clean.audit);loadBudget();renderAudit();window.UTI360XPlus?.restoreExtension(obj.extension);}\nwindow.UTI360X=Object.freeze({DATA,getStats,equipmentTotals,computeBudget,evaluateAudit,classifyReferences,getFilteredItems,getSession,validateSession,getState:()=>state,getAuditInput,renderAudit,changeView,restoreSession:restoreSessionObject});"
        result = once(result, old, new)
        result = result.replace('UTI adulto • edição 1.0', 'UTI adulto • edição 1.1').replace('HTML v1.0', 'HTML v1.1')
        # Exportações CSV neutralizam também fórmulas precedidas por espaços.
        result = once(result, "if(/^[=+\\-@\\t\\r]/.test(s))", "if(/^[\\s\\uFEFF]*[=+\\-@]/.test(s)||/^[\\t\\r\\n]/.test(s))")
    core = (MODULE / 'assets/auditoria-v11-core.js').read_text(encoding='utf-8')
    ui = (MODULE / 'assets/auditoria-v11.js').read_text(encoding='utf-8')
    css = (MODULE / 'assets/auditoria-v11.css').read_text(encoding='utf-8')
    if '</script' in core.lower() or '</script' in ui.lower():
        raise ValueError('Marcador de fechamento de script em fonte embutida.')
    result = replace_block(result, 'core', '<script id="uti360x-v11-core">\n'+core+'\n</script>', "<script>'use strict';")
    result = replace_block(result, 'style', '<style id="uti360x-v11-style">\n'+css+'\n</style>', '</head>')
    result = replace_block(result, 'ui', '<script id="uti360x-v11-ui">\n'+ui+'\n</script>', '</body>')
    for key in ('appData', 'workbookBytes'):
        if payload(original, key) != payload(result, key):
            raise ValueError('Alteração não permitida no payload ' + key)
    return result

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    path = MODULE / 'index.html'
    original = path.read_text(encoding='utf-8')
    result = build(original)
    if build(result) != result:
        raise ValueError('Build não idempotente.')
    if args.check and result != original:
        raise SystemExit('HTML desatualizado: execute o integrador antes de commitar.')
    if not args.check and original != result:
        path.write_text(result, encoding='utf-8')
    report = {'version':'1.1.0','releaseDate':'2026-10-31','priceBaseDate':'2026-10-22',
              'automaticBpsPncpSync':False,'htmlSha256':hashlib.sha256(result.encode()).hexdigest(),
              'embeddedDataSha256':hashlib.sha256(payload(result,'appData').encode()).hexdigest(),
              'embeddedWorkbookBase64Sha256':hashlib.sha256(payload(result,'workbookBytes').encode()).hexdigest(),
              'checks':['payloads-preserved','idempotent-build','standalone-html'],
              'limitations':['Preços históricos não foram atualizados.','Referências importadas exigem conferência humana.','Relatório gerencial não comprova irregularidade.']}
    if not args.check:
        (MODULE / 'versao.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'ok':True,'mode':'check' if args.check else 'build',**report},ensure_ascii=False))

if __name__ == '__main__':
    main()
