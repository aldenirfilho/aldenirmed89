#!/usr/bin/env python3
"""Gera a página pública do Jornal Diário 360 e o bloco da página inicial.

Fonte única: ``jornal-360/data/edicoes.json``.

Como publicar uma nova edição (passo a passo curto):
  1. Copie os PDFs da edição para ``jornal-360/edicoes/``
     (Jornal_Diario_360_AAAA-MM-DD.pdf, Pilulas_do_Dia_360_AAAA-MM-DD.pdf e
     Arcanos_360_Sessao_Extra_AAAA-MM-DD.pdf).
  2. Acrescente a edição no INÍCIO da lista ``edicoes`` do JSON.
  3. Rode ``python3 scripts_admin/build_jornal_360.py``.
  4. Confira com ``python3 scripts_admin/build_jornal_360.py --check``.

O script não apaga PDFs antigos: o arquivo do jornal cresce edição a edição.
Arquivos citados no JSON e ausentes na pasta viram botão desativado
("PDF em publicação"), nunca link quebrado.
"""

from __future__ import annotations

import argparse
import datetime as dt
import html
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "jornal-360/data/edicoes.json"
PAGE = ROOT / "jornal-360/index.html"
EDITIONS_DIR = ROOT / "jornal-360/edicoes"
HOME = ROOT / "index.html"
HOME_START = "<!-- JORNAL360:INICIO (gerado por scripts_admin/build_jornal_360.py) -->"
HOME_END = "<!-- JORNAL360:FIM -->"
PILL_ORDER = ("TEMI", "R3", "POCUS", "ECG", "VM")
PILL_ICONS = {"TEMI": "🏆", "R3": "🩺", "POCUS": "🔊", "ECG": "🫀", "VM": "🫁"}
FILE_LABELS = (
    ("jornal", "📄", "Jornal completo"),
    ("pilulas", "💊", "Pílulas do Dia"),
    ("esportes", "⚽", "Esportes 360"),
    ("financas", "💰", "Finanças e Humor"),
    ("arcanos", "🔮", "Arcanos 360"),
    ("honra", "🏛️", "Honra e Equilíbrio"),
    ("humanitario", "🤝", "Serviço Humanitário 360"),
)
LEITURA_DIR = ROOT / "jornal-360/leitura"
# Cadernos do padrão de 30 páginas (16/11/2026). "arquivo" aponta a chave de
# "arquivos" da edição; "leitura" usa a versão HTML para celular quando existir.
CADERNOS = (
    ("noticias", "🗞️", "Notícias", "Brasil, Ceará, Sobral e mundo, com gráficos próprios", "leitura"),
    ("pilulas", "💊", "Pílulas do Dia", "TEMI, R3, POCUS, ECG e ventilação mecânica", "pilulas"),
    ("esportes", "⚽", "Esportes 360", "futebol do Brasil com tabela, Sobral, Ceará e Nordeste, mundo e motor, feminino e quadras", "esportes"),
    ("financas", "💰", "Educação financeira", "renda fixa, imóvel e veículo, e como não cair em golpe", "financas"),
    ("humor", "😄", "Humor 360", "tirinhas e charge com personagens originais", "financas"),
    ("honra", "🏛️", "Honra 360", "a honra em seis tradições, a palavra empenhada e a honra no plantão", "honra"),
    ("equilibrio", "⚖️", "Equilíbrio 360", "ordem, gratidão, caráter, o céu do dia, plantas, animais e família", "honra"),
    ("arcanos", "🔮", "Arcanos 360", "história da medicina e curiosidades do dia", "arcanos"),
)
APP_JSON = ROOT / "jornal-360/app/editions.json"
MONTHS = (
    "janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho",
    "agosto", "setembro", "outubro", "novembro", "dezembro",
)


def esc(value: object) -> str:
    return html.escape(str(value), quote=True)


def load() -> dict:
    data = json.loads(DATA.read_text(encoding="utf-8"))
    if data.get("schema") != "jornal-diario-360/v1":
        raise SystemExit("edicoes.json: schema inesperado")
    editions = data.get("edicoes")
    if not isinstance(editions, list) or not editions:
        raise SystemExit("edicoes.json: lista de edições vazia")
    seen: set[int] = set()
    previous: dt.date | None = None
    for edition in editions:
        number = edition["numero"]
        if number in seen:
            raise SystemExit(f"edicoes.json: edição nº {number} repetida")
        seen.add(number)
        day = dt.date.fromisoformat(edition["data"])
        if previous and day >= previous:
            raise SystemExit("edicoes.json: mantenha as edições da mais nova para a mais antiga")
        previous = day
        for key in ("manchetes", "arcanos"):
            if not edition.get(key):
                raise SystemExit(f"edicoes.json: nº {number} sem {key}")
        missing = [k for k in PILL_ORDER if k not in edition.get("pilulas", {})]
        if missing:
            raise SystemExit(f"edicoes.json: nº {number} sem pílulas {missing}")
    return data


def long_date(edition: dict) -> str:
    day = dt.date.fromisoformat(edition["data"])
    return f"{edition['diaSemana']}, {day.day} de {MONTHS[day.month - 1]} de {day.year}"


def short_date(edition: dict) -> str:
    day = dt.date.fromisoformat(edition["data"])
    return f"{day.day:02d}/{day.month:02d}/{day.year}"


def anchor(edition: dict) -> str:
    return f"edicao-{edition['numero']:03d}"


def size_label(path: Path) -> str:
    size = path.stat().st_size
    if size >= 1024 * 1024:
        return f"{size / (1024 * 1024):.1f} MB".replace(".", ",")
    return f"{round(size / 1024)} KB"


def file_buttons(edition: dict, prefix: str, compact: bool = False) -> str:
    """Botões de PDF; arquivo ausente vira botão desativado, não link quebrado."""

    items = []
    for key, icon, label in FILE_LABELS:
        name = edition.get("arquivos", {}).get(key)
        if not name:
            continue
        path = EDITIONS_DIR / name
        text = label if not compact else label.split(" ")[0]
        if path.is_file():
            items.append(
                f'<a class="j360-file j360-file-{key}" href="{esc(prefix + "edicoes/" + name)}" '
                f'target="_blank" rel="noopener" type="application/pdf">'
                f'<span aria-hidden="true">{icon}</span> {esc(text)}'
                f'<small>PDF · {esc(size_label(path))}</small></a>'
            )
        else:
            items.append(
                f'<span class="j360-file is-pending" aria-disabled="true">'
                f'<span aria-hidden="true">{icon}</span> {esc(text)}'
                f'<small>PDF em publicação</small></span>'
            )
    leitura = LEITURA_DIR / edition["data"] / "index.html"
    if leitura.is_file():
        items.insert(1, (
            f'<a class="j360-file j360-file-leitura" href="{esc(prefix + "leitura/" + edition["data"] + "/index.html")}">'
            '<span aria-hidden="true">📱</span> Ler no celular<small>HTML · iPhone</small></a>'
        ))
    return '<div class="j360-files">' + "".join(items) + "</div>"


def render_app_json(data: dict) -> str:
    """Lista de edições do app Jornal 360 (jornal-360/app/), gerada do mesmo JSON."""

    eds = []
    for e in data["edicoes"]:
        files = e.get("arquivos", {})
        jornal = files.get("jornal")
        if not jornal or not (EDITIONS_DIR / jornal).is_file():
            continue
        cover = ROOT / "jornal-360/app/capas" / f'{e["data"]}.webp'
        leitura = LEITURA_DIR / e["data"] / "index.html"
        eds.append({
            "date": e["data"],
            "label": f'{e["diaSemana"].split("-")[0].capitalize()}, {short_date(e)}',
            "number": e["numero"],
            "pages": e["paginas"],
            "title": e["temaDoDia"],
            "pdf": "../edicoes/" + jornal,
            "html": f'../leitura/{e["data"]}/index.html' if leitura.is_file() else "",
            "cover": f'capas/{e["data"]}.webp' if cover.is_file() else "icons/icon-512.png",
            "font": e.get("fonte", "OpenDyslexic"),
            "highlights": e.get("manchetes", [])[:6],
            "pills": [{"area": k, "icon": PILL_ICONS[k], "text": e["pilulas"][k]} for k in PILL_ORDER if e.get("pilulas", {}).get(k)],
            "humanitarian": ("../edicoes/" + files["humanitario"]) if files.get("humanitario") and (EDITIONS_DIR / files["humanitario"]).is_file() else "",
        })
    return json.dumps({"updated": data.get("atualizadoEm", ""), "editions": eds}, ensure_ascii=False, indent=2) + "\n"


def cadernos_list(edition: dict, prefix: str, css: str) -> str:
    """Cadernos da edição; cada um abre o PDF (ou o HTML) da edição, se publicado."""

    files = edition.get("arquivos", {})
    leitura = LEITURA_DIR / edition["data"] / "index.html"
    items = []
    for key, icon, title, desc, source in CADERNOS:
        href = ""
        if source == "leitura" and leitura.is_file():
            href = prefix + "leitura/" + edition["data"] + "/index.html"
        elif source == "leitura" and files.get("jornal") and (EDITIONS_DIR / files["jornal"]).is_file():
            href = prefix + "edicoes/" + files["jornal"]
        elif files.get(source) and (EDITIONS_DIR / files[source]).is_file():
            href = prefix + "edicoes/" + files[source]
        body = (
            f'<span class="{css}-icon" aria-hidden="true">{icon}</span>'
            f'<span class="{css}-text"><b>{esc(title)}</b><small>{esc(desc)}</small></span>'
        )
        if href:
            extra = '' if href.endswith(".html") else ' target="_blank" rel="noopener" type="application/pdf"'
            items.append(f'<li><a class="{css}-item is-{key}" href="{esc(href)}"{extra}>{body}</a></li>')
        else:
            items.append(f'<li><span class="{css}-item is-{key}">{body}</span></li>')
    return f'<ul class="{css}">' + "".join(items) + "</ul>"


def pills_list(edition: dict) -> str:
    rows = "".join(
        f'<li><b><span aria-hidden="true">{PILL_ICONS[key]}</span> {key}</b>'
        f'<span>{esc(edition["pilulas"][key])}</span></li>'
        for key in PILL_ORDER
    )
    return f'<ul class="j360-pills">{rows}</ul>'


def edition_article(edition: dict, featured: bool) -> str:
    headlines = "".join(f"<li>{esc(item)}</li>" for item in edition["manchetes"])
    arcanos = "".join(
        f'<li><b>Sessão {"I" * (index + 1)}</b> {esc(item)}</li>'
        for index, item in enumerate(edition["arcanos"])
    )
    corrections = edition.get("correcoes") or []
    corrections_html = ""
    if corrections:
        corrections_html = (
            '<details class="j360-corrections"><summary>✏️ Correções e atualizações '
            f'publicadas ({len(corrections)})</summary><ul>'
            + "".join(f"<li>{esc(item)}</li>" for item in corrections)
            + "</ul></details>"
        )
    meta = (
        f'<span>Ano I · nº {edition["numero"]:03d}</span>'
        f'<span>{edition["paginas"]} páginas</span>'
        f'<span>fechamento: {esc(edition["fechamento"])}</span>'
        f'<span>fonte: {esc(edition["fonte"])}</span>'
    )
    tag = "Edição mais recente" if featured else "Edição anterior"
    body = f"""
      <div class="j360-grid">
        <section class="j360-block" aria-label="Manchetes da edição nº {edition['numero']:03d}">
          <h3>🗞️ Manchetes</h3>
          <ul class="j360-headlines">{headlines}</ul>
        </section>
        <section class="j360-block" aria-label="Pílulas de estudo da edição nº {edition['numero']:03d}">
          <h3>💊 Pílulas de estudo · <em>{esc(edition['temaDoDia'])}</em></h3>
          {pills_list(edition)}
        </section>
        <section class="j360-block" aria-label="Arcanos 360 da edição nº {edition['numero']:03d}">
          <h3>🔮 Arcanos 360</h3>
          <ul class="j360-arcanos">{arcanos}</ul>
        </section>
      </div>
      {corrections_html}"""
    if featured:
        return f"""
    <article class="j360-edition is-featured" id="{anchor(edition)}" aria-labelledby="{anchor(edition)}-title">
      <header class="j360-edition-head">
        <div>
          <span class="j360-kicker">{tag}</span>
          <h2 id="{anchor(edition)}-title">{esc(long_date(edition).capitalize())}</h2>
          <p class="j360-meta">{meta}</p>
        </div>
        {file_buttons(edition, "./")}
      </header>{body}
    </article>"""
    return f"""
    <article class="j360-edition" id="{anchor(edition)}" aria-labelledby="{anchor(edition)}-title">
      <details>
        <summary>
          <span class="j360-summary-date"><b id="{anchor(edition)}-title">{esc(short_date(edition))}</b> {esc(edition['diaSemana'])}</span>
          <span class="j360-summary-theme">nº {edition['numero']:03d} · {esc(edition['temaDoDia'])}</span>
          <span class="j360-summary-open" aria-hidden="true">abrir ▾</span>
        </summary>
        <div class="j360-edition-body">
          <p class="j360-meta">{meta}</p>
          {file_buttons(edition, "./")}{body}
        </div>
      </details>
    </article>"""


def study_index(editions: list[dict]) -> str:
    head = "".join(f'<th scope="col">{PILL_ICONS[k]} {k}</th>' for k in PILL_ORDER)
    rows = []
    for edition in editions:
        cells = "".join(f"<td>{esc(edition['pilulas'][k])}</td>" for k in PILL_ORDER)
        rows.append(
            f'<tr><th scope="row"><a href="#{anchor(edition)}">{esc(short_date(edition))}</a>'
            f'<small>nº {edition["numero"]:03d}</small></th>{cells}</tr>'
        )
    return (
        '<div class="j360-table-wrap" tabindex="0" role="region" aria-label="Índice de pílulas por edição">'
        f'<table class="j360-table"><caption class="sr-only">Pílulas de estudo por edição</caption>'
        f'<thead><tr><th scope="col">Edição</th>{head}</tr></thead>'
        f'<tbody>{"".join(rows)}</tbody></table></div>'
    )


PAGE_CSS = """
:root{color-scheme:dark;--bg:#020b1f;--bg2:#071831;--surf:rgba(255,255,255,.055);--surf2:rgba(255,255,255,.09);
--brd:rgba(255,255,255,.11);--text:#f5f9ff;--muted:#a7bad4;--soft:#c7d7ea;--cyan:#2dd4ff;--gold:#e3b04b;
--violet:#a98cff;--green:#4ef0a1;--red:#ff6060;--r:16px;--body:'Outfit',system-ui,-apple-system,'Segoe UI',sans-serif;
--head:'Syne','Outfit',system-ui,sans-serif;--mono:'IBM Plex Mono',ui-monospace,monospace}
html.a11y-light{color-scheme:light;--bg:#fff;--bg2:#f4f8fc;--surf:rgba(16,38,59,.045);--surf2:rgba(16,38,59,.08);
--brd:#d3e0ea;--text:#10263b;--muted:#536b7d;--soft:#334f67;--cyan:#006f7d;--gold:#865800;--violet:#6548b8;--green:#087a4e;--red:#b42335}
html.a11y-contrast{--bg:#000;--bg2:#050505;--surf:rgba(255,255,255,.12);--brd:rgba(255,255,255,.5);--text:#fff;--muted:#d6e2ee;--soft:#eef5fb;--cyan:#63efff;--gold:#ffe28a}
@font-face{font-family:'OpenDyslexic';src:url('../assets/fonts/opendyslexic/OpenDyslexic-Regular.woff2') format('woff2');font-weight:400;font-display:swap}
@font-face{font-family:'OpenDyslexic';src:url('../assets/fonts/opendyslexic/OpenDyslexic-Bold.woff2') format('woff2');font-weight:700;font-display:swap}
html.j360-dyslexic body,html.j360-dyslexic h1,html.j360-dyslexic h2,html.j360-dyslexic h3{font-family:'OpenDyslexic',var(--body);letter-spacing:.01em}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;background:radial-gradient(circle at 12% -10%,rgba(45,212,255,.14),transparent 40rem),radial-gradient(circle at 100% 0,rgba(227,176,75,.1),transparent 34rem),var(--bg);
color:var(--text);font:400 1.02rem/1.6 var(--body)}
a{color:inherit}img{max-width:100%;display:block}
:focus-visible{outline:3px solid var(--gold);outline-offset:3px;border-radius:6px}
.skip{position:fixed;left:12px;top:12px;z-index:50;background:#fff;color:#071422;padding:10px 14px;border-radius:10px;font-weight:800;transform:translateY(-180%)}
.skip:focus{transform:none}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}
.wrap{width:min(1180px,100% - 32px);margin:0 auto}
.top{position:sticky;top:0;z-index:20;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(14px);border-bottom:1px solid var(--brd)}
.top .wrap{display:flex;align-items:center;gap:14px;min-height:64px;flex-wrap:wrap;padding:8px 0}
.brand{display:flex;align-items:center;gap:10px;text-decoration:none;font:800 1.02rem/1.1 var(--head)}
.brand img{width:40px;height:40px;border-radius:11px}
.brand b{color:var(--cyan)}.brand small{display:block;font:500 .7rem var(--mono);color:var(--muted);letter-spacing:.06em}
.top nav{display:flex;gap:4px;flex-wrap:wrap;margin-left:auto}
.top nav a,.top button{min-height:40px;display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:10px;border:1px solid transparent;
background:none;color:var(--soft);font:600 .86rem var(--body);text-decoration:none;cursor:pointer}
.top nav a:hover,.top button:hover{background:var(--surf2);border-color:var(--brd);color:var(--text)}
.top button[aria-pressed="true"]{border-color:var(--gold);color:var(--gold)}
.hero{padding:44px 0 18px}
.kicker{font:600 .74rem var(--mono);letter-spacing:.16em;text-transform:uppercase;color:var(--cyan)}
h1{font:800 clamp(2rem,5vw,3.3rem)/1.05 var(--head);margin:10px 0 12px;letter-spacing:-.02em}
h1 span{background:linear-gradient(90deg,var(--cyan),var(--gold));-webkit-background-clip:text;background-clip:text;color:transparent}
.lead{color:var(--soft);max-width:70ch;margin:0 0 18px}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:0;padding:0;list-style:none}
.chips li{padding:6px 11px;border:1px solid var(--brd);border-radius:999px;background:var(--surf);font-size:.84rem;color:var(--soft)}
main section.band{padding:22px 0}
h2.band-title{font:800 1.45rem/1.2 var(--head);margin:0 0 12px}
.j360-edition{border:1px solid var(--brd);border-radius:var(--r);background:var(--surf);margin:0 0 12px;scroll-margin-top:84px}
.j360-edition.is-featured{padding:22px;border-color:color-mix(in srgb,var(--cyan) 40%,var(--brd));background:linear-gradient(160deg,color-mix(in srgb,var(--cyan) 9%,transparent),var(--surf))}
.j360-edition-head{display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between;align-items:flex-start;margin-bottom:16px}
.j360-edition-head h2{font:800 clamp(1.3rem,3vw,1.9rem)/1.15 var(--head);margin:4px 0 6px}
.j360-kicker{font:600 .72rem var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--gold)}
.j360-meta{display:flex;flex-wrap:wrap;gap:6px 14px;margin:0;color:var(--muted);font:500 .8rem var(--mono)}
.j360-files{display:flex;flex-wrap:wrap;gap:8px}
.j360-file{display:inline-flex;flex-direction:column;justify-content:center;min-height:52px;padding:8px 14px;border-radius:12px;border:1px solid var(--brd);
background:var(--surf2);text-decoration:none;font-weight:700;line-height:1.2}
.j360-file small{font:500 .72rem var(--mono);color:var(--muted);margin-top:3px}
.j360-file-jornal{border-color:color-mix(in srgb,var(--cyan) 55%,var(--brd))}
.j360-file:hover{border-color:var(--cyan)}
.j360-file.is-pending{opacity:.62;cursor:not-allowed}
.j360-grid{display:grid;grid-template-columns:1.25fr 1.15fr .9fr;gap:14px}
.j360-block{border:1px solid var(--brd);border-radius:14px;padding:14px 16px;background:color-mix(in srgb,var(--bg) 55%,transparent)}
.j360-block h3{font:700 1rem/1.3 var(--head);margin:0 0 10px}.j360-block h3 em{font-style:normal;color:var(--gold)}
.j360-headlines,.j360-arcanos,.j360-pills{margin:0;padding:0;list-style:none;display:grid;gap:8px}
.j360-headlines li{padding-left:14px;border-left:3px solid color-mix(in srgb,var(--cyan) 55%,transparent)}
.j360-arcanos li b{display:block;font:600 .72rem var(--mono);color:var(--violet);letter-spacing:.1em;text-transform:uppercase}
.j360-pills li{display:grid;grid-template-columns:86px 1fr;gap:8px;align-items:start}
.j360-pills b{font:700 .8rem var(--mono);color:var(--cyan);white-space:nowrap}
.j360-corrections{margin-top:12px;border:1px dashed var(--brd);border-radius:12px;padding:8px 14px}
.j360-corrections summary{cursor:pointer;font-weight:700;color:var(--gold)}
.j360-corrections ul{margin:8px 0 2px;padding-left:18px}
.j360-edition>details>summary{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;padding:14px 18px;cursor:pointer;list-style:none}
.j360-edition>details>summary::-webkit-details-marker{display:none}
.j360-summary-date b{font:800 1.08rem var(--head);margin-right:6px}
.j360-summary-date{color:var(--muted)}
.j360-summary-theme{color:var(--soft);font-weight:600}
.j360-summary-open{font:600 .78rem var(--mono);color:var(--cyan)}
details[open]>summary .j360-summary-open{color:var(--gold)}
.j360-edition-body{padding:0 18px 18px;display:grid;gap:12px}
.j360-cadernos{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.j360-cadernos-item{display:grid;grid-template-columns:auto minmax(0,1fr);gap:10px;align-items:start;height:100%;padding:12px 14px;
border:1px solid var(--brd);border-radius:14px;background:var(--surf);text-decoration:none}
a.j360-cadernos-item:hover{border-color:var(--cyan);background:var(--surf2)}
.j360-cadernos-icon{font-size:1.5rem;line-height:1.1}
.j360-cadernos-text b{display:block;font:700 1rem/1.25 var(--head)}
.j360-cadernos-text small{display:block;margin-top:3px;color:var(--muted);font-size:.84rem;line-height:1.4}
@media(max-width:920px){.j360-cadernos{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:520px){.j360-cadernos{grid-template-columns:1fr}}
.j360-table-wrap{overflow:auto;border:1px solid var(--brd);border-radius:14px}
.j360-table{width:100%;border-collapse:collapse;min-width:820px;font-size:.92rem}
.j360-table th,.j360-table td{padding:10px 12px;border-bottom:1px solid var(--brd);text-align:left;vertical-align:top}
.j360-table thead th{font:700 .78rem var(--mono);color:var(--cyan);background:var(--surf2);position:sticky;top:0}
.j360-table tbody th small{display:block;font:500 .72rem var(--mono);color:var(--muted)}
.j360-table tbody th a{font-weight:800;text-decoration:none;color:var(--text)}
.note{border:1px solid var(--brd);border-left:4px solid var(--gold);border-radius:12px;padding:12px 16px;background:var(--surf);color:var(--soft)}
.note p{margin:4px 0}
.steps{margin:0;padding-left:20px;color:var(--soft)}
footer{border-top:1px solid var(--brd);margin-top:28px;padding:22px 0 40px;color:var(--muted);font-size:.88rem}
footer .wrap{display:flex;flex-wrap:wrap;gap:10px 22px;justify-content:space-between}
footer a{color:var(--cyan)}
@media(max-width:920px){.j360-grid{grid-template-columns:1fr}}
@media(max-width:560px){.j360-edition>details>summary{grid-template-columns:1fr}.j360-summary-open{display:none}.j360-pills li{grid-template-columns:1fr;gap:2px}.top nav{margin-left:0}}
@media(max-width:640px){.top{position:static}.top nav{width:100%;margin-left:0;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:thin}.top nav a{white-space:nowrap}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
@media print{.top,.skip,footer,.j360-files{display:none}body{background:#fff;color:#000}.j360-edition{break-inside:avoid}details>*{display:block}}
"""

PREFS_SCRIPT = """(()=>{try{const p=JSON.parse(localStorage.getItem('antigravity:a11y:v1')||'{}');const c=p&&p.contrast===true;const t=p&&p.theme;
const light=!c&&(t==='light'||(t==='system'&&matchMedia('(prefers-color-scheme: light)').matches)||(!['dark','light','system'].includes(t)&&p&&p.clarity===true));
const r=document.documentElement;r.classList.toggle('a11y-contrast',c);r.classList.toggle('a11y-light',light);r.style.colorScheme=light?'light':'dark';
if(localStorage.getItem('jornal360:dyslexic')==='1')r.classList.add('j360-dyslexic');}catch(_){}})();"""

TOGGLE_SCRIPT = """(()=>{const b=document.getElementById('j360Dyslexic');if(!b)return;const r=document.documentElement;
const sync=()=>b.setAttribute('aria-pressed',r.classList.contains('j360-dyslexic')?'true':'false');sync();
b.addEventListener('click',()=>{r.classList.toggle('j360-dyslexic');try{localStorage.setItem('jornal360:dyslexic',r.classList.contains('j360-dyslexic')?'1':'0')}catch(_){}sync();});
const open=()=>{const id=decodeURIComponent(location.hash.slice(1));if(!id)return;const el=document.getElementById(id);const d=el&&el.querySelector('details');if(d)d.open=true;};
window.addEventListener('hashchange',open);open();})();"""


def render_page(data: dict) -> str:
    editions = data["edicoes"]
    latest = editions[0]
    featured = edition_article(latest, True)
    previous = "".join(edition_article(edition, False) for edition in editions[1:])
    notices = "".join(f"<p>{esc(item)}</p>" for item in data["avisos"])
    count = len(editions)
    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Jornal Diário 360 · AldenirMed 360X</title>
<meta name="description" content="Jornal Diário 360: 30 páginas por dia com notícias, pílulas de estudo (TEMI, R3, POCUS, ECG e VM), Esportes 360, educação financeira, Humor 360, Honra 360, Equilíbrio 360 e Arcanos 360, com as {count} edições mais recentes em PDF."/>
<meta name="theme-color" content="#020b1f"/>
<meta name="color-scheme" content="dark light"/>
<link rel="icon" type="image/x-icon" href="../assets/icons/360x-v1/favicon.ico" sizes="64x64"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=IBM+Plex+Mono:wght@400;500;600&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet"/>
<link rel="apple-touch-icon" href="../assets/icons/360x-v1/apple-touch-icon-180.png" sizes="180x180"/>
<script>{PREFS_SCRIPT}</script>
<style>{PAGE_CSS}</style>
</head>
<body>
<a class="skip" href="#conteudo">Pular para o conteúdo</a>
<header class="top">
  <div class="wrap">
    <a class="brand" href="../index.html" aria-label="AldenirMed 360X — voltar ao início">
      <img src="../assets/brand-360x/aldenirmed-360x-mark.svg" alt="" width="40" height="40"/>
      <span>AldenirMed <b>360X</b><small>JORNAL DIÁRIO 360</small></span>
    </a>
    <nav aria-label="Seções do Jornal Diário 360">
      <a href="#{anchor(latest)}">📰 Hoje</a>
      <a href="#cadernos">🧭 Cadernos</a>
      <a href="#anteriores">🗂️ Edições</a>
      <a href="#indice-pilulas">💊 Pílulas</a>
      <a href="#sobre">ℹ️ Sobre</a>
      <a href="../index.html#jornal-360">↩ Início</a>
    </nav>
    <button id="j360Dyslexic" type="button" aria-pressed="false" title="Ler com a fonte OpenDyslexic">Aa OpenDyslexic</button>
  </div>
</header>
<main id="conteudo" tabindex="-1">
  <section class="hero">
    <div class="wrap">
      <span class="kicker">Radar 360 Circunstancial · modo 360X Turbo · TEMI</span>
      <h1>📰 Jornal <span>Diário 360</span></h1>
      <p class="lead">As notícias do dia em leitura TDAH-friendly, com pílulas de estudo para a UTI e a prova de título e a coluna Arcanos 360. Cada edição traz o jornal completo de 30 páginas, as Pílulas do Dia e os cadernos extras em PDF, além da versão em HTML para ler no celular. O <a href="app/index.html">app Jornal 360</a> guarda o acervo completo.</p>
      <ul class="chips" aria-label="Destaques">
        <li>🗓️ Última edição: {esc(short_date(latest))} · nº {latest['numero']:03d}</li>
        <li>🗂️ {count} edições no arquivo</li>
        <li>🔤 Leitura em OpenDyslexic</li>
        <li>🚫 Sem fotos de terceiros</li>
        <li>📱 <a href="app/index.html">App e acervo</a></li>
      </ul>
    </div>
  </section>
  <section class="band" aria-label="Edição mais recente">
    <div class="wrap">{featured}
    </div>
  </section>
  <section class="band" id="cadernos" aria-labelledby="cadernos-title">
    <div class="wrap">
      <h2 class="band-title" id="cadernos-title">🧭 Cadernos da edição</h2>
      <p class="lead">Cada edição de 30 páginas tem oito cadernos. Toque em um deles para abrir o da edição de {esc(short_date(latest))}.</p>
      {cadernos_list(latest, "./", "j360-cadernos")}
    </div>
  </section>
  <section class="band" id="anteriores" aria-labelledby="anteriores-title">
    <div class="wrap">
      <h2 class="band-title" id="anteriores-title">🗂️ Edições anteriores</h2>{previous}
    </div>
  </section>
  <section class="band" id="indice-pilulas" aria-labelledby="indice-title">
    <div class="wrap">
      <h2 class="band-title" id="indice-title">💊 Índice de pílulas de estudo</h2>
      <p class="lead">Revisão espaçada em uma tabela: escolha o eixo (TEMI, R3, POCUS, ECG ou VM) e percorra as edições.</p>
      {study_index(editions)}
    </div>
  </section>
  <section class="band" id="sobre" aria-labelledby="sobre-title">
    <div class="wrap">
      <h2 class="band-title" id="sobre-title">ℹ️ Sobre o jornal</h2>
      <div class="note">
        <p><strong>{esc(data['titulo'])}</strong> · {esc(data['subtitulo'])}</p>
        <p>{esc(data['producao'])}.</p>
        {notices}
        <p>⚠️ <em>Material educacional. Não substitui o julgamento clínico, os protocolos institucionais ou a avaliação médica individual.</em></p>
      </div>
    </div>
  </section>
</main>
<footer>
  <div class="wrap">
    <span>© 2026 AldenirMed 360X · Jornal Diário 360 · atualizado em {esc(short_date({'data': data['atualizadoEm']}))}</span>
    <span><a href="../index.html">Voltar ao início</a> · <a href="../index.html#apps-360">Apps 360</a> · <a href="../index.html#downloads">Downloads</a></span>
  </div>
</footer>
<script>{TOGGLE_SCRIPT}</script>
</body>
</html>
"""


def render_home_block(data: dict) -> str:
    editions = data["edicoes"]
    latest = editions[0]
    headlines = "".join(f"<li>{esc(item)}</li>" for item in latest["manchetes"][:4])
    pills = "".join(
        f'<li><b>{PILL_ICONS[key]} {key}</b> {esc(latest["pilulas"][key])}</li>'
        for key in PILL_ORDER
    )
    previous = "".join(
        f'<li><a href="jornal-360/index.html#{anchor(edition)}">'
        f'<b>{esc(short_date(edition))}</b><span>nº {edition["numero"]:03d} · {esc(edition["temaDoDia"])}</span></a></li>'
        for edition in editions[1:5]
    )
    return f"""{HOME_START}
      <article class="j360-home-latest" aria-labelledby="j360HomeLatest">
        <span class="j360-home-kicker">📰 Edição nº {latest['numero']:03d} · {esc(long_date(latest))}</span>
        <h3 id="j360HomeLatest">Tema do dia: {esc(latest['temaDoDia'])}</h3>
        <ul class="j360-home-headlines">{headlines}</ul>
        <ul class="j360-home-pills" aria-label="Pílulas de estudo da edição">{pills}</ul>
        {file_buttons(latest, "jornal-360/", compact=False)}
      </article>
      <aside class="j360-home-archive" aria-label="Edições anteriores do Jornal Diário 360">
        <h3>🗂️ Edições anteriores</h3>
        <ul>{previous}</ul>
        <a class="j360-home-all" href="jornal-360/index.html">Ver todas as edições e o índice de pílulas →</a>
      </aside>
      <section class="j360-home-cadernos-wrap" aria-labelledby="j360HomeCadernos">
        <h3 id="j360HomeCadernos">🧭 Cadernos da edição de hoje · 30 páginas</h3>
        {cadernos_list(latest, "jornal-360/", "j360-home-cadernos")}
      </section>
      {HOME_END}"""


def apply_home(html_text: str, block: str) -> str:
    start = html_text.find(HOME_START)
    end = html_text.find(HOME_END)
    if start < 0 or end < 0 or end < start:
        raise SystemExit("index.html: marcadores JORNAL360 ausentes")
    return html_text[:start] + block + html_text[end + len(HOME_END):]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--check", action="store_true", help="falha se os arquivos gerados estiverem desatualizados")
    args = parser.parse_args()
    data = load()
    page = render_page(data)
    home = apply_home(HOME.read_text(encoding="utf-8"), render_home_block(data))
    app_json = render_app_json(data) if APP_JSON.parent.is_dir() else None
    if args.check:
        stale = []
        if app_json is not None and (not APP_JSON.is_file() or APP_JSON.read_text(encoding="utf-8") != app_json):
            stale.append(str(APP_JSON.relative_to(ROOT)))
        if not PAGE.is_file() or PAGE.read_text(encoding="utf-8") != page:
            stale.append(str(PAGE.relative_to(ROOT)))
        if HOME.read_text(encoding="utf-8") != home:
            stale.append("index.html (bloco JORNAL360)")
        if stale:
            print("❌ Jornal Diário 360 desatualizado: " + ", ".join(stale))
            print("   Rode: python3 scripts_admin/build_jornal_360.py")
            return 1
        print(f"✅ Jornal Diário 360 em dia: {len(data['edicoes'])} edição(ões).")
        return 0
    PAGE.write_text(page, encoding="utf-8")
    HOME.write_text(home, encoding="utf-8")
    if app_json is not None:
        APP_JSON.write_text(app_json, encoding="utf-8")
    present = sum(
        1
        for edition in data["edicoes"]
        for name in edition.get("arquivos", {}).values()
        if (EDITIONS_DIR / name).is_file()
    )
    print(f"📰 Jornal Diário 360: {len(data['edicoes'])} edição(ões), {present} PDF(s) publicados.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
