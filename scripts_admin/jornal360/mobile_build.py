#!/usr/bin/env python3
"""Gera a versão HTML de leitura no celular (iPhone) a partir do HTML A4 do Jornal 360.

Uso: python3 mobile_build.py JORNAL_HTML CSS IMG_DIR SAIDA_DIR AAAA-MM-DD NUMERO
Saída: SAIDA_DIR/index.html (+ img/). Fontes vêm de ../assets/fonts/ (compartilhadas).
"""
import re, sys, shutil, html as H
from pathlib import Path

src, css, imgdir, out, data, numero = sys.argv[1:7]
out = Path(out); (out / "img").mkdir(parents=True, exist_ok=True)
t = Path(src).read_text()
pages = re.findall(r'<section class="page".*?</section>', t, re.S)
c = Path(css).read_text()
c = re.sub(r'url\("fonts/node_modules/@fontsource/[^/]+/files/([^"]+)"\)', r'url("../assets/fonts/\1")', c)

# imagens usadas
for m in sorted(set(re.findall(r'src="img/([^"]+)"', t))):
    shutil.copy(Path(imgdir) / m, out / "img" / m)

MOBILE = """
:root{--tam:17px}
html,body{background:#e9e1cf}
body{font-size:var(--tam);line-height:1.6;padding-top:env(safe-area-inset-top)}
.page{width:auto;height:auto;overflow:visible;margin:12px 8px 20px;padding:16px 14px 14px;border-radius:12px;box-shadow:0 1px 8px rgba(0,0,0,.18);scroll-margin-top:70px}
.page::before,.page::after{display:none}
.page > *:not(.foot):not(.runner){zoom:1}
.cols2{column-count:1}
.g-7-5,.g-5-7,.g-6-4,.grid2,.grid3,.kpis,.signs{display:block}
.g-7-5>*,.g-5-7>*,.g-6-4>*,.grid2>*,.grid3>*,.kpis>*{margin-bottom:10px}
.vr{border-left:0;padding-left:0;border-top:1px solid var(--rule);padding-top:8px}
img,svg{max-width:100%;height:auto}
.index{grid-template-columns:repeat(2,1fr)!important;font-size:.8em}
.runner{font-size:.68em;flex-wrap:wrap;gap:4px}
.kicker{font-size:.72em}
h1{font-size:1.5em} h2{font-size:1.3em} h3{font-size:1.06em} .box h3{font-size:1em}
.dek{font-size:.95em}
.small,.cap,.fontes,.flag,.tag{font-size:.78em}
.tag{font-size:.66em}
table{font-size:.86em;width:100%;table-layout:fixed} td,th{word-break:break-word;overflow-wrap:anywhere;hyphens:auto}
.topbar,.ear,.mast,.edbar,.runner{flex-wrap:wrap} .topbar span,.ear span,.edbar span{white-space:normal!important;margin-left:0!important}
.mast .title{font-size:2.2em!important}
.mast{flex-wrap:wrap;overflow:hidden} .mast .tag2{display:none}
.sixty{grid-template-columns:1fr!important;display:block} .sixty>div{margin-bottom:6px}
.hq{overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:4px} .hq svg{width:230%!important;max-width:none} .hq h3::after{content:'  ↔ deslize';font-size:.7em;color:var(--muted);font-weight:400}
.foot{position:static;margin-top:12px;font-size:.66em;flex-direction:column;gap:4px}
.timeline{font-size:.95em}
body.claro{--paper:#fffdf7}
body.escuro{--paper:#16191c;--paper2:#1e2226;--ink:#efe9dc;--ink2:#cfc8b8;--muted:#a9a296;--obsidian:#f3e7c4;--rule:#3a3f45;background:#0b0d0f}
body.escuro .box{background:#1e2226}
body.escuro .fig img,body.escuro .hq svg{background:#fbf7ee;border-radius:6px}
body.semod{--f:-apple-system,"Segoe UI",Roboto,sans-serif,"Noto Color Emoji"}
.barra360{position:sticky;top:0;z-index:20;display:flex;gap:6px;align-items:center;padding:8px 8px;background:#111417;color:#f3e7c4;font-family:var(--f);border-bottom:2px solid #a8750a}
.barra360 a,.barra360 button,.barra360 select{min-height:40px;min-width:40px;border-radius:9px;border:1px solid #a8750a;background:#1e2226;color:#f3e7c4;font:inherit;font-size:14px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;padding:0 8px}
.barra360 select{flex:1;min-width:0}
.topo360{padding:14px 12px 4px;font-family:var(--f);color:#3a352c}
.topo360 b{color:#a8750a}
@media(min-width:900px){.page{max-width:820px;margin:16px auto 24px}}
@media print{.barra360,.topo360{display:none}}
"""

def titulo(sec):
    m = re.search(r'<span class="sec">(.*?)</span>', sec, re.S)
    return re.sub(r"<[^>]+>", "", m.group(1)).strip() if m else "Capa"

opts, body = [], []
for i, p in enumerate(pages, 1):
    p = p.replace('<section class="page"', f'<section class="page" id="p{i}"', 1)
    body.append(p)
    opts.append(f'<option value="p{i}">{i} · {H.escape(titulo(p) if i > 1 else "Capa")}</option>')

d = data.split("-"); dbr = f"{d[2]}/{d[1]}/{d[0]}"
doc = f"""<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#111417">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Jornal 360">
<title>Jornal Diário 360 · {dbr} · leitura no celular</title>
<meta name="description" content="Edição nº {int(numero):03d} do Jornal Diário 360 em HTML para ler no iPhone: texto em uma coluna, fonte OpenDyslexic, modo escuro e tamanho ajustável.">
<link rel="apple-touch-icon" href="../../app/icons/apple-touch-icon.png">
<style>{c}{MOBILE}</style></head>
<body>
<nav class="barra360" aria-label="Navegação da edição">
  <a href="../../app/index.html" aria-label="Acervo de edições">📚</a>
  <select id="ir" aria-label="Ir para a página">{''.join(opts)}</select>
  <button id="menos" aria-label="Diminuir letra">A−</button><button id="mais" aria-label="Aumentar letra">A+</button>
  <button id="tema" aria-label="Alternar modo escuro">🌓</button><button id="od" aria-label="Alternar fonte para dislexia">Aa</button>
</nav>
<div class="topo360">📰 <b>Jornal Diário 360</b> · nº {int(numero):03d} · {dbr} · {len(pages)} páginas · <a href="../../edicoes/Jornal_Diario_360_{data}.pdf">PDF A4</a></div>
{''.join(body)}
<script>
(function(){{var b=document.body,r=document.documentElement;function g(k,d){{try{{var v=localStorage.getItem(k);return v===null?d:v}}catch(e){{return d}}}}function s(k,v){{try{{localStorage.setItem(k,v)}}catch(e){{}}}}
var tam=parseInt(g('j360m_tam','17'),10);function ap(){{r.style.setProperty('--tam',tam+'px');b.classList.toggle('escuro',g('j360m_esc','0')==='1');b.classList.toggle('semod',g('j360m_od','1')!=='1')}}ap();
document.getElementById('menos').onclick=function(){{tam=Math.max(13,tam-1);s('j360m_tam',tam);ap()}};
document.getElementById('mais').onclick=function(){{tam=Math.min(26,tam+1);s('j360m_tam',tam);ap()}};
document.getElementById('tema').onclick=function(){{s('j360m_esc',g('j360m_esc','0')==='1'?'0':'1');ap()}};
document.getElementById('od').onclick=function(){{s('j360m_od',g('j360m_od','1')==='1'?'0':'1');ap()}};
var sel=document.getElementById('ir');sel.onchange=function(){{document.getElementById(sel.value).scrollIntoView({{behavior:'smooth'}})}};
var obs=new IntersectionObserver(function(es){{es.forEach(function(e){{if(e.isIntersecting)sel.value=e.target.id}})}},{{rootMargin:'-40% 0px -55% 0px'}});
document.querySelectorAll('.page').forEach(function(p){{obs.observe(p)}});}})();
</script>
</body></html>"""
(out / "index.html").write_text(doc)
print(out / "index.html", len(pages), "páginas", round(len(doc) / 1024), "KB")
