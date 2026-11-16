#!/usr/bin/env python3
"""Gera ``complexo-360x/index.html`` a partir de ``complexo-360x/data/complexo.json``.

A página é o mapa de busca do Complexo 360X: organiza os sites públicos do
Projeto 360X pelos eixos que as pessoas procuram no Google (medicina, honra,
religião, justiça, auditoria, verdades verdadeiras, projetos políticos e ficção
com magia), com dados estruturados schema.org e um filtro local que funciona
sem servidor. Sem JavaScript, todos os cartões continuam visíveis.

Uso:
    python3 scripts_admin/build_complexo_360x.py          # regenera a página
    python3 scripts_admin/build_complexo_360x.py --check  # falha se desatualizada (CI)
"""

from __future__ import annotations

import argparse
import html
import json
import sys
from datetime import date
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "complexo-360x" / "data" / "complexo.json"
OUTPUT = ROOT / "complexo-360x" / "index.html"
PUBLIC_URL = "https://aldenirfilho.github.io/aldenirmed89/complexo-360x/"
SITE_URL = "https://aldenirfilho.github.io/aldenirmed89/"


def esc(value: object) -> str:
    return html.escape(str(value), quote=True)


def load(path: Path = DATA) -> dict:
    data = json.loads(path.read_text(encoding="utf-8"))
    validate(data)
    return data


def validate(data: dict) -> None:
    """Falha fechado: endereço inseguro, eixo órfão ou id repetido não publicam."""
    if data.get("schema") != "complexo-360x-v1":
        raise ValueError("schema do complexo inválido")
    date.fromisoformat(data["atualizadoEm"])
    axes = [axis["id"] for axis in data["eixos"]]
    if len(axes) != len(set(axes)):
        raise ValueError("eixo repetido")
    seen: set[str] = set()
    used: set[str] = set()
    for entry in [*data["sites"], *data.get("constelacoes", [])]:
        if entry["id"] in seen:
            raise ValueError(f"site repetido: {entry['id']}")
        seen.add(entry["id"])
        url = urlsplit(entry["url"])
        if url.scheme != "https" or not url.netloc:
            raise ValueError(f"URL pública precisa ser https: {entry['id']}")
        if not entry.get("descricao"):
            raise ValueError(f"site sem descrição: {entry['id']}")
    for site in data["sites"]:
        unknown = set(site["eixos"]) - set(axes)
        if unknown or not site["eixos"]:
            raise ValueError(f"eixo desconhecido em {site['id']}: {sorted(unknown)}")
        used.update(site["eixos"])
    orphan = set(axes) - used
    if orphan:
        raise ValueError(f"eixo sem site: {sorted(orphan)}")


def br_date(value: str) -> str:
    return date.fromisoformat(value).strftime("%d/%m/%Y")


def structured_data(data: dict) -> str:
    """CollectionPage + ItemList + BreadcrumbList; só fatos presentes no JSON."""
    organization = {
        "@type": "Organization",
        "@id": SITE_URL + "#projeto-360x",
        "name": data["projeto"],
        "alternateName": ["Complexo 360X", "Equipe 360X", "Plano D"],
        "url": PUBLIC_URL,
        "founder": {
            "@type": "Person",
            "@id": SITE_URL + "#idealizador",
            "name": data["idealizador"],
            "url": SITE_URL + "20_Conheca_Aldenir/",
        },
        "sameAs": [site["url"] for site in data["sites"] if not site.get("interno")]
        + [site["url"] for site in data.get("constelacoes", [])],
    }
    elements = []
    for position, site in enumerate([*data["sites"], *data.get("constelacoes", [])], 1):
        axis_names = {axis["id"]: axis["nome"] for axis in data["eixos"]}
        elements.append(
            {
                "@type": "ListItem",
                "position": position,
                "item": {
                    "@type": "WebSite",
                    "name": site["nome"],
                    "url": site["url"],
                    "description": site["descricao"],
                    "keywords": ", ".join(axis_names[a] for a in site.get("eixos", [])) or None,
                },
            }
        )
        if elements[-1]["item"]["keywords"] is None:
            del elements[-1]["item"]["keywords"]
    graph = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CollectionPage",
                "@id": PUBLIC_URL + "#webpage",
                "url": PUBLIC_URL,
                "name": f"{data['titulo']} · mapa de busca dos sites",
                "description": data["subtitulo"],
                "inLanguage": "pt-BR",
                "dateModified": data["atualizadoEm"],
                "isPartOf": {"@id": SITE_URL + "#website"},
                "about": [{"@type": "Thing", "name": axis["nome"]} for axis in data["eixos"]],
                "keywords": ", ".join(term for axis in data["eixos"] for term in axis["termos"]),
                "publisher": {"@id": SITE_URL + "#projeto-360x"},
                "breadcrumb": {"@id": PUBLIC_URL + "#breadcrumb"},
                "mainEntity": {"@id": PUBLIC_URL + "#sites"},
            },
            {
                "@type": "BreadcrumbList",
                "@id": PUBLIC_URL + "#breadcrumb",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "AldenirMed 360X", "item": SITE_URL},
                    {"@type": "ListItem", "position": 2, "name": data["titulo"], "item": PUBLIC_URL},
                ],
            },
            {
                "@type": "ItemList",
                "@id": PUBLIC_URL + "#sites",
                "name": "Sites do Complexo 360X",
                "numberOfItems": len(elements),
                "itemListElement": elements,
            },
            organization,
        ],
    }
    text = json.dumps(graph, ensure_ascii=False, indent=1)
    return text.replace("</", "<\\/")


def site_card(site: dict, axes: dict[str, dict], current: str | None = None) -> str:
    href = site.get("interno") or site["url"]
    external = not site.get("interno")
    rel = ' target="_blank" rel="noopener"' if external else ""
    host = "neste site · AldenirMed 360X" if not external else urlsplit(site["url"]).netloc.replace(
        "aldenirfilho.github.io", "github.io/aldenirfilho"
    )
    tags = "".join(
        f'<span class="c3-tag" data-axis="{esc(axis)}">{esc(axes[axis]["icone"])} {esc(axes[axis]["nome"])}</span>'
        for axis in site.get("eixos", [])
        if axis != current
    )
    search = " ".join(
        [site["nome"], site["descricao"]]
        + [axes[a]["nome"] + " " + " ".join(axes[a]["termos"]) for a in site.get("eixos", [])]
    )
    return (
        f'<li class="c3-card" data-search="{esc(search.casefold())}">'
        f'<a href="{esc(href)}"{rel}><strong>{esc(site["nome"])}</strong>'
        f'<span class="c3-desc">{esc(site["descricao"])}</span>'
        f'<span class="c3-host">{esc(host)}{" ↗" if external else ""}</span></a>'
        + (f'<div class="c3-tags" aria-label="Também em">{tags}</div>' if tags else "")
        + "</li>"
    )


CSS = """
:root{color-scheme:dark;--bg:#020b1f;--bg2:#071831;--surf:rgba(255,255,255,.055);--surf2:rgba(255,255,255,.09);
--brd:rgba(255,255,255,.12);--text:#f5f9ff;--muted:#a7bad4;--soft:#c7d7ea;--cyan:#2dd4ff;--gold:#e3b04b;--violet:#a98cff;
--r:16px;--body:'Outfit',system-ui,-apple-system,'Segoe UI',sans-serif;--head:'Syne','Outfit',system-ui,sans-serif;--mono:'IBM Plex Mono',ui-monospace,monospace}
html.a11y-light{color-scheme:light;--bg:#fff;--bg2:#f4f8fc;--surf:rgba(16,38,59,.045);--surf2:rgba(16,38,59,.08);--brd:#d3e0ea;--text:#10263b;--muted:#536b7d;--soft:#334f67;--cyan:#006f7d;--gold:#865800;--violet:#6548b8}
html.a11y-contrast{--bg:#000;--bg2:#050505;--surf:rgba(255,255,255,.12);--brd:rgba(255,255,255,.5);--text:#fff;--muted:#d6e2ee;--soft:#eef5fb;--cyan:#63efff;--gold:#ffe28a}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;background:radial-gradient(circle at 10% -10%,rgba(45,212,255,.14),transparent 40rem),radial-gradient(circle at 100% 0,rgba(227,176,75,.1),transparent 34rem),var(--bg);color:var(--text);font:400 1.02rem/1.6 var(--body)}
a{color:inherit}:focus-visible{outline:3px solid var(--gold);outline-offset:3px;border-radius:6px}
.skip{position:fixed;left:12px;top:12px;z-index:50;background:#fff;color:#071422;padding:10px 14px;border-radius:10px;font-weight:800;transform:translateY(-180%)}.skip:focus{transform:none}
.wrap{width:min(1180px,100% - 32px);margin:0 auto}
.top{position:sticky;top:0;z-index:20;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(14px);border-bottom:1px solid var(--brd)}
.top .wrap{display:flex;align-items:center;gap:14px;min-height:64px;flex-wrap:wrap;padding:8px 0}
.brand{display:flex;align-items:center;gap:10px;text-decoration:none;font:800 1.05rem var(--head)}
.brand img{width:40px;height:40px}.brand b{color:var(--cyan)}.brand small{display:block;font:600 .66rem var(--mono);letter-spacing:.12em;color:var(--gold)}
.top nav{display:flex;gap:6px;flex-wrap:wrap;margin-left:auto}
.top nav a{padding:7px 11px;border-radius:999px;border:1px solid var(--brd);text-decoration:none;font-size:.86rem;background:var(--surf)}
.hero{padding:44px 0 18px}
.kicker{font:600 .76rem var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--gold)}
h1{font:800 clamp(2rem,5vw,3.3rem)/1.08 var(--head);margin:10px 0 12px}h1 span{color:var(--cyan)}
.lead{max-width:62rem;color:var(--soft);font-size:1.1rem}
.finder{margin:22px 0 8px;display:grid;gap:8px;max-width:44rem}
.finder label{font-weight:700}
.finder input{width:100%;padding:14px 16px;border-radius:14px;border:1px solid var(--brd);background:var(--surf2);color:var(--text);font:500 1.05rem var(--body)}
.finder output{font:500 .85rem var(--mono);color:var(--muted)}
.axes{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0 6px;padding:0;list-style:none}
.axes a{display:inline-flex;gap:6px;align-items:center;padding:9px 14px;border-radius:999px;border:1px solid var(--brd);background:var(--surf);text-decoration:none;font-weight:600}
.feature{margin:26px 0;padding:22px;border-radius:var(--r);border:1px solid color-mix(in srgb,var(--cyan) 40%,var(--brd));background:var(--surf);display:grid;gap:10px}
.feature h2{margin:0;font:800 1.5rem var(--head)}.feature p{margin:0;color:var(--soft)}
.feature .actions{display:flex;gap:10px;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;min-height:44px;padding:9px 16px;border-radius:12px;border:1px solid var(--brd);background:var(--surf2);font-weight:700;text-decoration:none}
.btn.primary{border-color:var(--cyan);color:var(--cyan)}
section.axis{padding:26px 0;border-top:1px solid var(--brd);scroll-margin-top:64px}.feature{scroll-margin-top:84px}
section.axis h2{font:800 clamp(1.4rem,3vw,1.9rem) var(--head);margin:0 0 4px}
.axis-meta{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:baseline;margin-bottom:6px}
.nature{font:600 .74rem var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--gold)}
.axis p{margin:0 0 6px;color:var(--soft)}
.terms{font-size:.86rem;color:var(--muted);margin:0 0 14px}
.c3-grid{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
.c3-card{border:1px solid var(--brd);border-radius:var(--r);background:var(--surf);display:flex;flex-direction:column}
.c3-card>a{display:grid;gap:6px;padding:16px 16px 10px;text-decoration:none;flex:1}
.c3-card>a:hover strong{color:var(--cyan)}
.c3-card strong{font:700 1.06rem var(--head)}
.c3-desc{color:var(--soft);font-size:.95rem}
.c3-host{font:500 .74rem var(--mono);color:var(--muted);word-break:break-all}
.c3-tags{display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 14px}
.c3-tag{font-size:.74rem;padding:3px 8px;border-radius:999px;border:1px solid var(--brd);color:var(--muted)}
.c3-card[hidden],section.axis[hidden]{display:none}
.notice{margin:28px 0;padding:16px 18px;border-left:4px solid var(--gold);background:var(--surf);border-radius:10px;color:var(--soft)}
footer{border-top:1px solid var(--brd);padding:22px 0 40px;color:var(--muted);font-size:.9rem}
footer .wrap{display:flex;flex-wrap:wrap;gap:10px 22px;justify-content:space-between}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
@media (max-width:640px){.top nav{margin-left:0}.hero{padding-top:26px}}
""".strip()

THEME_BOOT = (
    "<script>(()=>{try{const p=JSON.parse(localStorage.getItem('antigravity:a11y:v1')||'{}');"
    "const c=p&&p.contrast===true;const t=p&&p.theme;"
    "const light=!c&&(t==='light'||(t==='system'&&matchMedia('(prefers-color-scheme: light)').matches)"
    "||(!['dark','light','system'].includes(t)&&p&&p.clarity===true));"
    "const r=document.documentElement;r.classList.toggle('a11y-contrast',c);r.classList.toggle('a11y-light',light);"
    "r.style.colorScheme=light?'light':'dark';}catch(_){}})();</script>"
)

FINDER_JS = """<script>(()=>{const input=document.getElementById('c3Busca');const out=document.getElementById('c3Total');
if(!input)return;const cards=[...document.querySelectorAll('.c3-card')];const sections=[...document.querySelectorAll('section.axis')];
const norm=s=>s.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase();
cards.forEach(c=>c.dataset.norm=norm(c.dataset.search||c.textContent));
const run=()=>{const q=norm(input.value.trim());const words=q.split(/\\s+/).filter(Boolean);let shown=0;
cards.forEach(c=>{const ok=words.every(w=>c.dataset.norm.includes(w));c.hidden=!ok;if(ok)shown++;});
sections.forEach(s=>{s.hidden=!s.querySelector('.c3-card:not([hidden])');});
out.textContent=q?shown+' resultado(s) para “'+input.value.trim()+'”':'';};
input.addEventListener('input',run);const f=document.getElementById('c3Form');if(f)f.addEventListener('submit',e=>{e.preventDefault();run();});const p=new URLSearchParams(location.search).get('q');if(p){input.value=p;run();}})();</script>"""


def render(data: dict) -> str:
    axes = {axis["id"]: axis for axis in data["eixos"]}
    total = len(data["sites"]) + len(data.get("constelacoes", []))
    feature = data["destaque"]
    description = (
        "Encontre os sites do Complexo 360X por tema: medicina intensiva, honra, religião e fé, "
        "justiça, auditoria, verdades verdadeiras, projetos políticos e ficção com magia."
    )
    chips = "".join(
        f'<li><a href="#{esc(axis["id"])}"><span aria-hidden="true">{esc(axis["icone"])}</span>{esc(axis["nome"])}</a></li>'
        for axis in data["eixos"]
    )
    sections = []
    for axis in data["eixos"]:
        sites = [site for site in data["sites"] if axis["id"] in site["eixos"]]
        cards = "".join(site_card(site, axes, axis["id"]) for site in sites)
        sections.append(
            f'<section class="axis" id="{esc(axis["id"])}" aria-labelledby="t-{esc(axis["id"])}">'
            f'<div class="wrap"><div class="axis-meta"><h2 id="t-{esc(axis["id"])}">'
            f'<span aria-hidden="true">{esc(axis["icone"])}</span> {esc(axis["nome"])}</h2>'
            f'<span class="nature">natureza: {esc(axis["natureza"])}</span></div>'
            f'<p><strong>{esc(axis["chamada"])}</strong> {esc(axis["descricao"])}</p>'
            f'<p class="terms">Buscas relacionadas: {esc(", ".join(axis["termos"]))}.</p>'
            f'<ul class="c3-grid">{cards}</ul></div></section>'
        )
    others = "".join(site_card(site, axes) for site in data.get("constelacoes", []))
    sections.append(
        '<section class="axis" id="constelacoes" aria-labelledby="t-constelacoes"><div class="wrap">'
        '<div class="axis-meta"><h2 id="t-constelacoes"><span aria-hidden="true">🌐</span> Outras constelações 360X</h2>'
        '<span class="nature">natureza: ciência, cultura e tecnologia</span></div>'
        "<p>Natureza, tempo de vida, cultura, consumo e ferramentas que completam o complexo.</p>"
        f'<ul class="c3-grid">{others}</ul></div></section>'
    )
    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Complexo 360X · Medicina, honra, fé, justiça, auditoria e ficção | AldenirMed 360X</title>
<meta name="description" content="{esc(description)}"/>
<link rel="canonical" href="{PUBLIC_URL}"/>
<meta name="theme-color" content="#020b1f"/>
<meta name="color-scheme" content="dark light"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="AldenirMed 360X"/>
<meta property="og:locale" content="pt_BR"/>
<meta property="og:title" content="Complexo 360X · mapa de busca dos sites"/>
<meta property="og:description" content="{esc(description)}"/>
<meta property="og:url" content="{PUBLIC_URL}"/>
<meta property="og:image" content="{SITE_URL}assets/icons/360x-v1/social-card.png"/>
<meta name="twitter:card" content="summary_large_image"/>
<link rel="icon" type="image/x-icon" href="../assets/icons/360x-v1/favicon.ico" sizes="64x64"/>
<link rel="apple-touch-icon" href="../assets/icons/360x-v1/apple-touch-icon-180.png" sizes="180x180"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=IBM+Plex+Mono:wght@400;500;600&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet"/>
{THEME_BOOT}
<style>
{CSS}
</style>
<script type="application/ld+json">
{structured_data(data)}
</script>
</head>
<body>
<a class="skip" href="#conteudo">Pular para o conteúdo</a>
<header class="top">
  <div class="wrap">
    <a class="brand" href="../index.html" aria-label="AldenirMed 360X — voltar ao início">
      <img src="../assets/brand-360x/aldenirmed-360x-mark.svg" alt="" width="40" height="40"/>
      <span>AldenirMed <b>360X</b><small>COMPLEXO 360X</small></span>
    </a>
    <nav aria-label="Atalhos do Complexo 360X">
      <a href="#eixos">🧭 Eixos</a>
      <a href="#jornal-360">📰 Jornal 360</a>
      <a href="../mapa-do-site.html">🗺️ Mapa do site</a>
      <a href="../index.html#universo-360x">↩ Início</a>
    </nav>
  </div>
</header>
<main id="conteudo" tabindex="-1">
  <section class="hero">
    <div class="wrap">
      <span class="kicker">Projeto 360X · {total} sites conectados · atualizado em {br_date(data["atualizadoEm"])}</span>
      <h1>🧭 Complexo <span>360X</span></h1>
      <p class="lead">{esc(data["subtitulo"])} Escolha um eixo ou digite o que você procura.</p>
      <form class="finder" id="c3Form" role="search" action="./" method="get">
        <label for="c3Busca">🔎 Buscar no Complexo 360X</label>
        <input id="c3Busca" name="q" type="search" autocomplete="off" placeholder="Ex.: UTI, Bíblia, transparência, magia, Sobral…"/>
        <output id="c3Total" for="c3Busca" aria-live="polite"></output>
      </form>
      <ul class="axes" id="eixos" aria-label="Eixos temáticos">{chips}<li><a href="#constelacoes"><span aria-hidden="true">🌐</span>Outras constelações</a></li></ul>
    </div>
  </section>
  <div class="wrap">
    <article class="feature" id="jornal-360" aria-labelledby="t-jornal">
      <span class="kicker">Destaque diário</span>
      <h2 id="t-jornal">{esc(feature["icone"])} {esc(feature["nome"])}</h2>
      <p>{esc(feature["descricao"])}</p>
      <div class="actions">
        <a class="btn primary" href="{esc(feature["url"])}">Ler a edição de hoje →</a>
        <a class="btn" href="{esc(feature["feed"])}" type="application/rss+xml">📡 Assinar por RSS</a>
      </div>
    </article>
  </div>
  {"".join(sections)}
  <div class="wrap">
    <p class="notice"><strong>Como ler este mapa.</strong> {esc(data["aviso"])}</p>
  </div>
</main>
<footer>
  <div class="wrap">
    <span>© 2026 {esc(data["projeto"])} · {esc(data["idealizador"])}, {esc(data["papelIdealizador"])}.</span>
    <span>{esc(data["conferenciaLinks"])} · <a href="../index.html">Início</a> · <a href="../mapa-do-site.html">Mapa do site</a></span>
  </div>
</footer>
{FINDER_JS}
</body>
</html>
"""


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--check", action="store_true", help="falha se a página estiver desatualizada")
    args = parser.parse_args(argv)
    try:
        page = render(load())
    except (KeyError, ValueError, json.JSONDecodeError) as exc:
        print(f"❌ Complexo 360X inválido: {exc}")
        return 1
    if args.check:
        current = OUTPUT.read_text(encoding="utf-8") if OUTPUT.exists() else ""
        if current != page:
            print("❌ complexo-360x/index.html desatualizado: rode scripts_admin/build_complexo_360x.py")
            return 1
        print("✅ Complexo 360X em dia.")
        return 0
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(page, encoding="utf-8")
    print(f"✅ Complexo 360X gerado: {OUTPUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
