#!/usr/bin/env python3
"""Build local e determinístico. Não faz rede, deploy, cobrança ou atualização de preços."""
from __future__ import annotations
import argparse, hashlib, json, re, shutil
from pathlib import Path

def build(base: Path, output: Path) -> dict:
    src=Path(__file__).parent/'src'
    original=base.read_text(encoding='utf-8')
    def payload(identifier: str) -> str:
        match=re.search(r'<script\b[^>]*\bid=[\"\']'+re.escape(identifier)+r'[\"\'][^>]*>(.*?)</script>',original,re.S|re.I)
        if not match: raise ValueError('Payload ausente: '+identifier)
        return match.group(1).strip()
    data=payload('appData'); workbook=payload('workbookBytes')
    parsed=json.loads(data)
    if len(parsed['items'])!=140 or len(parsed['references'])!=35:
        raise ValueError('Base mudou: revisão manual do builder obrigatória.')
    safe_data=json.dumps(parsed,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
    page=(src/'template.html').read_text(encoding='utf-8')
    replacements={'/*STYLE*/':(src/'style.css').read_text(),'/*DATA*/':safe_data,'/*EXCEL*/':workbook,'/*CORE*/':(src/'core.js').read_text(),'/*APP*/':(src/'app.js').read_text()}
    for marker,value in replacements.items():
        if page.count(marker)!=1: raise ValueError('Marcador inválido: '+marker)
        page=page.replace(marker,value)
    output.mkdir(parents=True,exist_ok=True)
    (output/'UTI360X_Gestao_Offline.html').write_text(page.replace('<!--PWA-->',''),encoding='utf-8')
    pwa='<link rel="manifest" href="./manifest.webmanifest"><link rel="icon" href="./icon.svg">'
    hosted=page.replace('<!--PWA-->',pwa)
    reg="<script>if(location.protocol!=='file:'&&'serviceWorker'in navigator){navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});}</script>"
    (output/'index.html').write_text(hosted.replace('</body>',reg+'</body>'),encoding='utf-8')
    manifest={'id':'./','name':'UTI 360X Gestão — demonstração','short_name':'UTI 360X','lang':'pt-BR','start_url':'./index.html','scope':'./','display':'standalone','background_color':'#f3f5f5','theme_color':'#112b3c','icons':[{'src':'./icon.svg','sizes':'any','type':'image/svg+xml','purpose':'any'}]}
    (output/'manifest.webmanifest').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    (output/'icon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="110" fill="#112b3c"/><text x="256" y="250" fill="#f3f5f5" font-family="Arial,sans-serif" font-weight="bold" font-size="130" text-anchor="middle">360<tspan fill="#e1b56c">X</tspan></text><text x="256" y="335" fill="#b5ded8" font-family="Arial,sans-serif" font-size="54" text-anchor="middle">UTI GESTÃO</text></svg>',encoding='utf-8')
    digest=hashlib.sha256(hosted.encode()).hexdigest()[:12]
    sw="""/* Cache limitado ao aplicativo, nunca aos demais módulos ou dados de sessão. */
const PREFIX='uti360x-gestao:'+self.registration.scope+':',CACHE=PREFIX+'VERSION';
const paths=['./index.html','./manifest.webmanifest','./icon.svg'].map(p=>new URL(p,self.registration.scope).href);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(paths))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||!paths.includes(event.request.url))return;event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)));}return response;}).catch(()=>caches.match(event.request).then(r=>r||Response.error())));});
""".replace('VERSION',digest)
    (output/'sw.js').write_text(sw,encoding='utf-8')
    receipt={'app':'UTI 360X Gestão','version':'0.2.0','releaseDate':'2026-11-03','priceBaseDate':parsed['cutoff'],'items':140,'references':35,'itemsWithPrice':sum(x.get('median') is not None for x in parsed['items']),'billingEnabled':False,'publicReleaseApproved':False,'humanEditorialReview':'pending','sourceHtmlSha256':hashlib.sha256(original.encode()).hexdigest(),'dataSha256':hashlib.sha256(data.encode()).hexdigest(),'workbookBase64Sha256':hashlib.sha256(workbook.encode()).hexdigest(),'offlineSha256':hashlib.sha256((output/'UTI360X_Gestao_Offline.html').read_bytes()).hexdigest()}
    (output/'versao.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2),encoding='utf-8')
    for name in ['README.md','PLANO_COMERCIAL.md','ARQUITETURA_PAGAMENTOS.md']:
        source=Path(__file__).parent/'docs'/name
        if source.exists():shutil.copy2(source,output/name)
    return receipt
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--base',type=Path,default=Path('ecossistema/auditoria-uti/index.html'));p.add_argument('--out',type=Path,default=Path('dist/uti360x-gestao'));a=p.parse_args();print(json.dumps(build(a.base,a.out),ensure_ascii=False,indent=2))
