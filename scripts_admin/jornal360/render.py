"""Renderiza o HTML A4 do Jornal 360 em PDF, ajustando o zoom de cada página (folga >= 12 px).
Uso: python3 render.py jornal.html saida.pdf [ZMAX] [ZMIN]  · imprime JSON por página (slack<12 ou colOver = conteúdo cortado)."""
import asyncio, sys, json
from playwright.async_api import async_playwright
HTML = sys.argv[1]
OUT = sys.argv[2]
ZMAX = float(sys.argv[3]) if len(sys.argv) > 3 else 1.15
ZMIN = float(sys.argv[4]) if len(sys.argv) > 4 else 0.85
MEASURE = """(i) => { const pg=[...document.querySelectorAll('.page')][i];
  const foot = pg.querySelector('.foot').getBoundingClientRect().top;
  let maxB=0, worst='';
  pg.querySelectorAll('p,li,table,.fig,.box,h1,h2,h3,svg,.kpis,.index,.flag,.cap,.timeline,.fontes,tr,.tip,.how,img').forEach(e=>{
    if (e.closest('.foot')) return; const r=e.getBoundingClientRect();
    if(r.bottom>maxB){maxB=r.bottom; worst=(e.className||e.tagName)+':'+(e.textContent||'').trim().slice(0,40);} });
  const pr=pg.getBoundingClientRect(); let over=[];
  pg.querySelectorAll('p,li,td,h2,h3,.box,svg,img').forEach(e=>{const r=e.getBoundingClientRect(); if(r.right>pr.right-8 || r.left<pr.left+8) over.push((e.textContent||e.tagName).slice(0,30));});
  let colOver=[]; pg.querySelectorAll('.cols2').forEach(c=>{ if(c.scrollWidth>c.clientWidth+2) colOver.push(c.scrollWidth-c.clientWidth); });
  return {slack: Math.round(foot-maxB), worst, over: over.slice(0,2), colOver}; }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        import os
        await pg.goto("file://" + os.path.abspath(HTML))
        await pg.wait_for_load_state("networkidle"); await pg.evaluate("document.fonts.ready")
        n = await pg.evaluate("document.querySelectorAll('.page').length")
        async def setz(i,z): await pg.evaluate("([i,z])=>[...document.querySelectorAll('.page')][i].style.setProperty('--z',z)", [i,z])
        async def meas(i,z):
            await setz(i,z); return await pg.evaluate(MEASURE, i)
        out=[]
        for i in range(n):
            m = await meas(i, ZMIN)
            if m['slack'] < 12: out.append((i+1, ZMIN, m)); continue
            lo, hi = ZMIN, ZMAX
            mh = await meas(i, hi)
            if mh['slack'] >= 12 and not mh['colOver']: out.append((i+1, hi, mh)); continue
            for _ in range(9):
                mid=(lo+hi)/2; mm=await meas(i,mid)
                if mm['slack']>=12 and not mm['colOver']: lo=mid
                else: hi=mid
            z=round(lo-0.003,3); mf=await meas(i,z); out.append((i+1,z,mf))
        for pnum,z,m in out: print(json.dumps({'page':pnum,'zoom':z,'slack':m['slack'],'worst':m['worst'][:50],'over':m['over'],'colOver':m['colOver']}, ensure_ascii=False))
        await pg.pdf(path=OUT, format="A4", print_background=True, margin={"top":"0","bottom":"0","left":"0","right":"0"}, prefer_css_page_size=True)
        await b.close()
asyncio.run(main())
