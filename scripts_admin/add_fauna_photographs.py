#!/usr/bin/env python3
"""Add attributed Wikimedia photographs to Fauna 360 without changing scientific data.

No downloads, encoded executable payloads, secrets, payments or network calls.
Only known module paths and its existing editorial entry can be modified.
"""
from __future__ import annotations
import hashlib
import html
import json
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / 'apps/bolsa-ajuda-fauna'
MARKER = 'fauna-real-photographs-v1'
EXPECTED = {
    'app.js': '3a19c8719e8b6633d19c9f5c0f05248f9917bb98',
    'styles.css': 'a0f38c2c8453b81f9f413e6467d449af936ec60e',
    'README.md': 'f5aa6ebdd1569ae7766b3ad0f0ec2e2aeae50fc7',
}
# id, Commons filename, original directory, author, license, context, photo date.
ROWS = [
 ['animal-01','Araripe Manakin (1).jpg','0/02','Rick elis.simpson; edição registrada: Edithsme','CC BY-SA 3.0','Registro do soldadinho-do-araripe.','2011-10-13'],
 ['animal-02','Pyrrhura griseipectus -upper body-8a.jpg','9/9a','writhedhornbill','CC BY 2.0','Retrato do periquito-cara-suja. Contexto de captura não especificado na ficha consultada.','2007-02-14'],
 ['animal-03','Anodorhynchus leari (3).JPG','d/d1','Miguelrangeljr','Domínio público','Araras-azuis-de-lear em Canudos, Bahia.','2011-04-24'],
 ['animal-04','Golden Lion Tamarin Poco das Antas.jpg','4/40','Bart van Dorp','CC BY 2.0','Mico-leão-dourado na região de Poço das Antas, Rio de Janeiro.','2014-04-25'],
 ['animal-05','Mico leao preto SP Zoo 2.jpg','1/14','Miguelrangeljr','CC BY-SA 3.0','Registro em cativeiro — Zoológico de São Paulo.','2013-04-07'],
 ['animal-06','Inia geoffrensis1.jpg','3/38','Citron','CC0 1.0','Boto-cor-de-rosa. Local e data da fotografia não confirmados nesta seleção.',None],
 ['animal-07','Rhinoceros sondaicus in London Zoo.jpg','c/ce','T. Dixon / Zoological Society of London','Domínio público','Fotografia histórica de 1884, em cativeiro no Zoológico de Londres. Não representa a população atual.','1884'],
 ['animal-08','Sumatran Rhino 001.jpg','7/78','Ltshears','Domínio público','Registro em cativeiro — Zoológico de Cincinnati.','2007-07-04'],
 ['animal-09','Pongo tapanuliensis.jpg','6/65','Tim Laman; edição registrada: WolfmanSF','CC BY 4.0','Orangotango-de-tapanuli na floresta de Batang Toru, Sumatra.','2014-03-10'],
 ['animal-10','Loxodonta cyclotis 3970045.jpg','5/5e','Matt Muir','CC BY 4.0','Elefante-africano-de-floresta no Parque Nacional Odzala-Kokoua, República do Congo.','2016-06-04'],
 ['animal-11','Mountain gorilla (Gorilla beringei beringei) 05.jpg','3/36','Thomas Fuhrmann','CC BY-SA 4.0','Gorila-das-montanhas em Bwindi, Uganda.','2015-09-15'],
 ['animal-12','Panthera tigris tigris.jpg','4/49','John e Karen Hollingsworth / USFWS; edição registrada: Zwoenitzer','Domínio público','Tigre-de-bengala, uma população da espécie Panthera tigris.',None],
 ['animal-13','台北動物園穿山甲 2024.jpg','0/0a','Taiwan Presidential Office (總統府)','CC BY 2.0','Pangolim-chinês no Zoológico de Taipei. Registro em cativeiro.','2024-08-08'],
 ['animal-14','Ailuropoda melanoleuca in San Diego Zoo.jpg','c/c8','Jason “Textfiles” Scott','CC BY 2.0','Registro em cativeiro — panda-gigante no Zoológico de San Diego.','2008-07-28'],
 ['animal-15','Vaquita1 Olson NOAA.jpg','7/77','Paula Olson / NOAA','Domínio público','Vaquitas na superfície do mar, em 2008. O registro não indica a população atual.','2008-10-19'],
 ['animal-16','Hawksbill Sea Turtle Carey de Concha (5840602412).jpg','5/59','Caroline S. Rogers / NOAA; acervo USFWS Southeast Region','CC BY 2.0','Tartaruga-de-pente em ambiente marinho. Fonte: acervo USFWS/NOAA.',None],
 ['animal-17','SBNMS North Atlantic right whale (50040735308).jpg','6/6e','Allison Henry / NOAA; National Marine Sanctuaries','Domínio público','Baleia-franca-do-atlântico-norte acompanhada por golfinhos, em registro aéreo.',None],
 ['animal-18','Whale shark (Rhincodon typus) (15603514463).jpg','a/ae','Sylke Rohrlach','CC BY-SA 2.0','Tubarão-baleia em Ningaloo Reef, Austrália.','2014-04-22'],
 ['animal-19','Mobula birostris 179661605.jpg','9/90','Dan Bender','CC BY 4.0','Raia-manta identificada como Mobula birostris na fonte fotográfica, em Bonaire.','2022-01-20'],
 ['animal-20','African Penguin (Spheniscus demersus) (32780193212).jpg','0/02','Bernard DUPONT','CC BY-SA 2.0','Pinguim-africano em Boulders Beach, África do Sul.','2016-10-16'],
 ['animal-21','Waved Albatross, Galápagos Islands.jpg','4/41','Anne Dirkse (www.annedirkse.com)','CC BY-SA 4.0','Albatroz-das-galápagos nas ilhas Galápagos.','2013-07-13'],
 ['animal-22','Kākāpō head.jpg','a/ad','Kimberley Collins','CC BY 2.0','Retrato de kākāpō jovem em Anchor Island, Nova Zelândia.','2016-07-18'],
 ['animal-23','Ambystoma mexicanum 1.jpg','6/6b','Stan Shebs','CC BY-SA 3.0','Registro em cativeiro — axolote no Steinhart Aquarium, São Francisco.','2005-06'],
 ['animal-24','Anguilla anguilla 01 by-dpc (cropped).jpg','e/e6','David Pérez (DPC); recorte registrado: Ellicrum','CC BY 3.0','Enguia-europeia do rio Porma, Espanha. Versão recortada publicada na fonte.','2010-10-26'],
 ['animal-25','Acropora palmata (Elkhorn coral).jpg','4/40','Nick Hobgood','CC BY-SA 3.0','Coral-chifre-de-alce, Acropora palmata.','2008-07-20'],
 ['animal-26','Bombus affinis 5539518.jpg','4/4b','psweet','CC BY-SA 4.0','Abelhão da espécie Bombus affinis.','2013-08-09'],
]
LICENSES = {
 'CC BY 2.0':'https://creativecommons.org/licenses/by/2.0/',
 'CC BY 3.0':'https://creativecommons.org/licenses/by/3.0/',
 'CC BY 4.0':'https://creativecommons.org/licenses/by/4.0/',
 'CC BY-SA 2.0':'https://creativecommons.org/licenses/by-sa/2.0/',
 'CC BY-SA 3.0':'https://creativecommons.org/licenses/by-sa/3.0/',
 'CC BY-SA 4.0':'https://creativecommons.org/licenses/by-sa/4.0/',
 'CC0 1.0':'https://creativecommons.org/publicdomain/zero/1.0/',
 'Domínio público':'https://creativecommons.org/publicdomain/mark/1.0/',
}
JS = r'''
/* fauna-real-photographs-v1: progressive enhancement, no scientific data changes. */
(() => {
  'use strict';
  const photos = __PHOTOS__;
  const animals = window.FAUNA_CATALOG?.animals;
  if (!Array.isArray(animals)) return;
  const byId = new Map(animals.map(a => [a.id, a]));
  window.FAUNA_PHOTOS = Object.freeze(photos);
  function el(tag, className, text) {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function link(url, text) {
    const a = el('a', '', text); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; return a;
  }
  function credit(p) {
    const n = el('figcaption', 'fauna-photo-credit');
    n.append(el('span', '', 'Foto: ' + p.author), el('span', 'fauna-photo-context', p.caption));
    const rights = el('span', 'fauna-photo-rights');
    rights.append(link(p.licenseUrl, p.license), document.createTextNode(' · '), link(p.source, 'Fonte e arquivo'));
    n.append(rights); return n;
  }
  function visual(a, eager = false) {
    const p = photos[a.id], frame = el('span', 'fauna-photo-frame');
    const img = el('img', 'fauna-real-photo');
    img.alt = a.name + ' (' + a.scientific + '). ' + p.caption;
    img.width = 960; img.height = 640; img.loading = eager ? 'eager' : 'lazy';
    img.decoding = 'async'; img.referrerPolicy = 'no-referrer'; img.dataset.animalPhoto = a.id;
    const fallback = el('span', 'fauna-photo-failure', 'Foto indisponível. Consulte a fonte abaixo.');
    fallback.hidden = true;
    let retried = false;
    img.addEventListener('error', () => {
      if (!retried && img.src !== p.original) { retried = true; img.src = p.original; return; }
      img.hidden = true; fallback.hidden = false;
    });
    img.addEventListener('load', () => { img.hidden = false; fallback.hidden = true; });
    img.src = p.src; frame.append(img, fallback); return frame;
  }
  function figure(a, eager = true) {
    const p = photos[a.id], f = el('figure', 'fauna-photo-figure');
    const open = link(p.original, ''); open.className = 'fauna-photo-open';
    open.setAttribute('aria-label', 'Abrir fotografia original de ' + a.name);
    open.append(visual(a, eager)); f.append(open, credit(p)); return f;
  }
  function cards() {
    document.querySelectorAll('#animal-grid .animal-card').forEach(card => {
      if (card.dataset.photographed) return;
      const a = byId.get(card.dataset.animal), art = card.querySelector('.card-art');
      if (!a || !photos[a.id] || !art) return;
      card.dataset.photographed = 'true'; art.classList.add('fauna-photo-art');
      art.querySelector('.symbol')?.remove();
      const button = el('button', 'fauna-photo-open'); button.type = 'button'; button.dataset.detail = a.id;
      button.setAttribute('aria-label', 'Ver fotografia e ficha de ' + a.name);
      button.append(visual(a)); art.prepend(button);
      const caption = credit(photos[a.id]);
      // The credit is adjacent to the photograph, without nesting interactive controls.
      const wrapper = el('figure', 'fauna-card-figure');
      art.before(wrapper); wrapper.append(art, caption);
    });
  }
  const grid = document.getElementById('animal-grid');
  if (grid) { new MutationObserver(cards).observe(grid, {childList:true}); cards(); }
  const content = document.getElementById('dialog-content');
  function dialogPhoto() {
    if (!content || content.querySelector('.fauna-photo-figure')) return;
    const title = content.querySelector('#dialog-title')?.textContent;
    const animal = animals.find(a => a.name === title);
    if (animal && photos[animal.id]) {
      const scientific = content.querySelector('.scientific');
      if (scientific) scientific.after(figure(animal)); else content.prepend(figure(animal));
    }
  }
  if (content) new MutationObserver(dialogPhoto).observe(content, {childList:true});
  const hero = document.querySelector('.habitat-art');
  if (hero && photos[animals[0].id]) {
    hero.classList.add('fauna-real-hero');
    hero.setAttribute('aria-label', 'Fotografia real do soldadinho-do-araripe');
    hero.replaceChildren(el('p', 'eyebrow', 'ATLAS FOTOGRÁFICO · CEARÁ'), figure(animals[0]));
  }
  const method = document.getElementById('metodo');
  if (method) {
    const note = el('p', 'notice fauna-photo-notice', 'Fotografias reais do Wikimedia Commons. Autores e licenças estão identificados em cada imagem; registros históricos e em cativeiro são sinalizados. As imagens precisam de internet e suas requisições são recebidas pela Wikimedia. Nenhum favorito é enviado nessas requisições. ');
    const all = el('a', '', 'Ver todos os créditos fotográficos'); all.href = 'photos.html';
    note.append(all); method.append(note);
  }
})();
'''
CSS = '''
/* fauna-real-photographs-v1: preserve full photographs without distortion or crops. */
.fauna-card-figure,.fauna-photo-figure{margin:0;min-width:0}
.card-art.fauna-photo-art{height:250px;padding:0;position:relative;background:#18392f;overflow:hidden}
.fauna-photo-open{display:block;width:100%;height:100%;border:0;padding:0;background:transparent;cursor:pointer;color:inherit;text-decoration:none}
.fauna-photo-frame{position:relative;display:flex;width:100%;height:100%;min-height:180px;align-items:center;justify-content:center;background:#18392f}
.fauna-real-photo{display:block;width:100%;height:100%;max-height:500px;object-fit:contain}
.fauna-real-photo[hidden],.fauna-photo-failure[hidden]{display:none}
.fauna-photo-failure{padding:24px;color:#fff;text-align:center}
.fauna-photo-credit{display:grid;gap:6px;padding:14px 18px;background:#f2f5ed;color:#273c32;font-size:.76rem;line-height:1.5;overflow-wrap:anywhere}
.fauna-photo-credit a{color:#194e3b;text-decoration:underline;text-underline-offset:3px}
.fauna-photo-context{color:#405648}
.fauna-photo-art .favorite,.fauna-photo-art .habitat-tag{z-index:2}
.fauna-photo-art .habitat-tag{pointer-events:none}
.fauna-photo-art .favorite{background:#f8f9f2;color:#173e32;border:1px solid #31533f}
.fauna-photo-art .habitat-tag{background:#173e32;color:#fff}
.fauna-photo-open:focus-visible{outline:3px solid #e8bc5d;outline-offset:-4px}
.habitat-art.fauna-real-hero{padding:20px;background:#173e32;color:#fff;min-height:0;display:block;overflow:hidden}
.fauna-real-hero>.eyebrow{color:#f2f5ed;margin:0 0 16px}
.fauna-real-hero .fauna-photo-frame{height:310px}
.fauna-photo-figure .fauna-photo-frame{height:auto;aspect-ratio:3/2}
.fauna-photo-figure .fauna-real-photo{height:100%;position:absolute;inset:0}
#dialog-content .fauna-photo-figure{margin:18px 0;border-radius:12px;overflow:hidden}
.fauna-photo-notice{margin-top:20px}
.photo-credit-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;padding:32px 0}
.photo-credit-entry{padding:22px;border:1px solid #cbd5c7;border-radius:16px;background:#fff;overflow-wrap:anywhere}
.photo-credit-entry h2{font-size:1.3rem}.photo-credit-entry a{color:#194e3b;text-decoration:underline}
@media(max-width:600px){.card-art.fauna-photo-art{height:230px}.photo-credit-list{grid-template-columns:1fr}.fauna-real-hero .fauna-photo-frame{height:230px}.fauna-photo-credit{font-size:.78rem}}
@media print{.fauna-real-photo{max-height:220px}.fauna-photo-credit{break-inside:avoid}.fauna-photo-art .favorite{display:none}}
'''


def blob_sha(data: bytes) -> str:
    return hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()


def main() -> None:
    originals={name:(APP/name).read_bytes() for name in EXPECTED}
    if MARKER.encode() in originals['app.js']:
        print('Photographic layer already installed; no changes.');return
    for name,data in originals.items():
        if blob_sha(data)!=EXPECTED[name]: raise ValueError('Concurrent change: '+name)
    if (APP/'photos.html').exists(): raise ValueError('Credit page already exists; refusing overwrite')
    catalog=json.loads((APP/'catalog.json').read_text(encoding='utf-8'))
    animals={a['id']:a for a in catalog['animals']}
    if len(ROWS)!=26 or {r[0] for r in ROWS}!=set(animals): raise ValueError('Animal IDs differ')
    photos={}
    for ident,filename,directory,author,license_name,caption,photo_date in ROWS:
        name=quote(filename.replace(' ','_'),safe='')
        original=f'https://upload.wikimedia.org/wikipedia/commons/{directory}/{name}'
        photos[ident]={'file':filename,'src':f'https://upload.wikimedia.org/wikipedia/commons/thumb/{directory}/{name}/960px-{name}',
            'original':original,'source':f'https://commons.wikimedia.org/wiki/File:{name}',
            'author':author,'license':license_name,'licenseUrl':LICENSES[license_name],
            'caption':caption,'photographedAt':photo_date,'reviewedAt':'2026-10-22',
            'changes':'Exibição proporcional, sem novos recortes. Edições preexistentes identificadas na autoria e na fonte.'}
        if ident=='animal-07': photos[ident]['src']=original
    registry_path=ROOT/'data/editorial/registry.json'
    registry=json.loads(registry_path.read_text(encoding='utf-8'))
    entries=[x for x in registry['items'] if 'apps/bolsa-ajuda-fauna/app.js' in x.get('paths',[])]
    if len(entries)!=1: raise ValueError('Unique existing editorial entry not found')
    item=entries[0]
    if item.get('ownerApproval') is not True or item.get('classification') not in {'public-cited','public-approved'}:
        raise ValueError('Existing public approval missing')
    updates={
        'app.js':originals['app.js'].decode()+JS.replace('__PHOTOS__',json.dumps(photos,ensure_ascii=False,separators=(',',':'))),
        'styles.css':originals['styles.css'].decode()+CSS,
        'README.md':originals['README.md'].decode()+'\n## Fotografias reais — 22/10/2026\n\nCamada fotográfica progressiva para as 26 fichas, a capa e o diálogo. As categorias e fontes científicas do catálogo não foram alteradas. Fotografias externas do Wikimedia Commons, com autor, licença individual, fonte e contexto. Registros históricos e em cativeiro são identificados. Não há imagens geradas por IA. Ver `photos.html` e os metadados `window.FAUNA_PHOTOS`.\n\nAs imagens precisam de internet. A requisição vai à Wikimedia, sem favoritos e sem referência de origem. Falhas de carregamento tentam uma única vez o original e depois exibem aviso, sem impedir o catálogo. Nenhuma credencial, dado de doador, pagamento ou comprovante foi acrescentado.\n',
    }
    esc=lambda s:html.escape(str(s),quote=True)
    cards=[]
    for ident,p in photos.items():
        a=animals[ident]
        cards.append(f'<article class="photo-credit-entry"><h2>{esc(a["name"])}</h2><p><i>{esc(a["scientific"])}</i></p><p>{esc(p["caption"])}</p><p>Foto: {esc(p["author"])}</p><p><a href="{esc(p["licenseUrl"])}" target="_blank" rel="noopener noreferrer">{esc(p["license"])}</a> · <a href="{esc(p["source"])}" target="_blank" rel="noopener noreferrer">Fonte e histórico</a> · <a href="{esc(p["original"])}" target="_blank" rel="noopener noreferrer">Fotografia original</a></p><p>{esc(p["changes"])}</p></article>')
    updates['photos.html']='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Créditos fotográficos — Fauna 360°</title><link rel="stylesheet" href="styles.css"></head><body><main class="wrap"><p><a href="index.html">Voltar ao catálogo</a></p><h1>Fotografias reais. Fontes identificadas.</h1><p>26 registros selecionados em 22/10/2026. Cada fotografia mantém sua autoria e licença. Não há afiliação presumida aos fotógrafos ou instituições. As datas das fotografias não são avaliações populacionais atuais. Nenhuma fotografia foi gerada por inteligência artificial.</p><div class="photo-credit-list">'+''.join(cards)+'</div></main></body></html>\n'
    for name in updates:
        rel='apps/bolsa-ajuda-fauna/'+name
        if any(other is not item and rel in other.get('paths',[]) for other in registry['items']):
            raise ValueError('Conflicting editorial owner: '+rel)
        if rel not in item['paths']: item['paths'].append(rel)
    item['rights']={'basis':'licensed','license':'Individual CC BY, CC BY-SA, CC0 and public-domain terms linked in photos.html.',
        'statement':'Código e organização próprios. Fotografias externas de terceiros mantêm autoria e licença individual, com fonte e contexto visíveis. Sem novos recortes, sem imagens geradas por IA e sem apropriação de marcas ou fotografias. A licença do código não substitui as licenças das fotografias.'}
    item['reviewedAt']='2026-10-22'
    item['reviewer']='Revisão técnica assistida por IA da camada fotográfica; não representa auditoria jurídica, financeira ou revisão especializada humana.'
    item['photoRevision']={'date':'2026-10-22','authorization':'Pedido explícito do proprietário para colocar imagens reais e publicar o site em seu GitHub.','scope':'Fotografias, créditos e apresentação. Nenhum dado privado de doadores ou alteração da avaliação científica.'}
    sources=item.setdefault('sources',[]);known={s.get('url') for s in sources}
    for ident,p in photos.items():
        if p['source'] not in known: sources.append({'title':'Fotografia — '+animals[ident]['name'],'url':p['source'],'accessedAt':'2026-10-22'})
    for evidence in item.get('assetEvidence',[]):
        name=evidence.get('path','').removeprefix('apps/bolsa-ajuda-fauna/')
        if name in updates and 'sha256' in evidence: evidence['sha256']=hashlib.sha256(updates[name].encode()).hexdigest()
    for name,text in updates.items(): (APP/name).write_text(text,encoding='utf-8')
    registry_path.write_text(json.dumps(registry,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    assert json.loads((APP/'catalog.json').read_text())==catalog, 'Scientific catalog changed'
    print('Updated: '+', '.join(updates)+', existing fauna editorial entry')

if __name__=='__main__': main()
