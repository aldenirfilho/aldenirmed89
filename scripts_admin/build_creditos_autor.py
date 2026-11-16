#!/usr/bin/env python3
"""Gera a página pública dos Créditos do Autor (Axiomas 360X) e o bloco da página inicial.

Fonte única: ``creditos-autor/data/axiomas.json``.

Como acrescentar um axioma ou um e-book (passo a passo curto):
  1. Axioma novo: acrescente um objeto ao fim da lista ``axiomas`` (número
     seguinte, título, eixo do catálogo, situação, data, tema, enunciado do
     autor sem alteração e comentário da edição).
  2. E-book novo: copie o PDF para ``creditos-autor/ebooks/`` e acrescente o
     objeto em ``ebooks`` com o ``sha256`` do arquivo.
  3. Rode ``python3 scripts_admin/build_creditos_autor.py``.
  4. Confira com ``python3 scripts_admin/build_creditos_autor.py --check``.

O script não apaga PDFs. Um PDF citado no JSON e ausente da pasta vira botão
desativado ("PDF em publicação"), nunca link quebrado.
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import html
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "creditos-autor/data/axiomas.json"
PAGE = ROOT / "creditos-autor/index.html"
EBOOKS_DIR = ROOT / "creditos-autor/ebooks"
HOME = ROOT / "index.html"
HOME_START = "<!-- CREDITOS360:INICIO (gerado por scripts_admin/build_creditos_autor.py) -->"
HOME_END = "<!-- CREDITOS360:FIM -->"
SITUACOES = {
    "Lapidado": ("✅", "lapidado"),
    "Confirmado pelo autor": ("⭐", "confirmado"),
    "Proposta do autor": ("💡", "proposta"),
}
MONTHS = (
    "janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho",
    "agosto", "setembro", "outubro", "novembro", "dezembro",
)


def esc(value: object) -> str:
    return html.escape(str(value), quote=True)


def load() -> dict:
    data = json.loads(DATA.read_text(encoding="utf-8"))
    if data.get("schema") != "axiomas-360x/v1":
        raise SystemExit("axiomas.json: schema inesperado")
    axioms = data.get("axiomas")
    if not isinstance(axioms, list) or not axioms:
        raise SystemExit("axiomas.json: lista de axiomas vazia")
    numbers = [axiom["numero"] for axiom in axioms]
    if numbers != list(range(1, len(axioms) + 1)):
        raise SystemExit("axiomas.json: mantenha a numeração contínua e em ordem (1, 2, 3…)")
    axes = {axis["chave"] for axis in data["eixos"]}
    for axiom in axioms:
        number = axiom["numero"]
        for key in ("titulo", "eixo", "situacao", "data", "tema", "enunciado", "comentario"):
            if not str(axiom.get(key, "")).strip():
                raise SystemExit(f"axiomas.json: axioma {number} sem {key}")
        if axiom["eixo"] not in axes:
            raise SystemExit(f"axiomas.json: axioma {number} com eixo desconhecido {axiom['eixo']!r}")
        if axiom["situacao"] not in SITUACOES:
            raise SystemExit(f"axiomas.json: axioma {number} com situação desconhecida")
        if axiom["tema"] not in data["temas"]:
            raise SystemExit(f"axiomas.json: axioma {number} com tema desconhecido")
        dt.date.fromisoformat(axiom["data"])
    for number in data.get("destaques", []):
        if not 1 <= number <= len(axioms):
            raise SystemExit(f"axiomas.json: destaque {number} inexistente")
    seen: set[str] = set()
    for ebook in data["ebooks"]:
        name = ebook["arquivo"]
        if name in seen or "/" in name or not name.endswith(".pdf"):
            raise SystemExit(f"axiomas.json: e-book inválido ou repetido: {name}")
        seen.add(name)
        path = EBOOKS_DIR / name
        if path.is_file() and hashlib.sha256(path.read_bytes()).hexdigest() != ebook["sha256"]:
            raise SystemExit(f"axiomas.json: SHA-256 de {name} não confere com o arquivo")
    return data


def short_date(value: str) -> str:
    day = dt.date.fromisoformat(value)
    return f"{day.day:02d}/{day.month:02d}/{day.year}"


def long_date(value: str) -> str:
    day = dt.date.fromisoformat(value)
    return f"{day.day} de {MONTHS[day.month - 1]} de {day.year}"


def axis_slug(axis: dict) -> str:
    numeral = axis["numeral"]
    return "eixo-armorial" if numeral == "⚜" else f"eixo-{numeral.lower()}"


def axiom_anchor(number: int) -> str:
    return f"axioma-{number:03d}"


def size_label(path: Path) -> str:
    size = path.stat().st_size
    if size >= 1024 * 1024:
        return f"{size / (1024 * 1024):.1f} MB".replace(".", ",")
    return f"{round(size / 1024)} KB"


def first_sentence(text: str, limit: int = 190) -> str:
    cut = text.find(". ")
    sentence = text if cut < 0 else text[: cut + 1]
    if len(sentence) > limit:
        sentence = sentence[:limit].rsplit(" ", 1)[0] + "…"
    return sentence


BRASAO = """<svg class="{cls}" viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
<defs><linearGradient id="{gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3d67a"/><stop offset="1" stop-color="#a87e2a"/></linearGradient></defs>
<path d="M100 8 L188 34 L188 118 C188 176 146 214 100 232 C54 214 12 176 12 118 L12 34 Z" fill="#0b0f18" stroke="url(#{gid})" stroke-width="6"/>
<path d="M100 24 L172 45 L172 118 C172 166 138 198 100 214 C62 198 28 166 28 118 L28 45 Z" fill="none" stroke="#2dd4ff" stroke-width="2" opacity=".8"/>
<path d="M100 52 C112 70 116 88 100 108 C84 88 88 70 100 52 Z M100 108 C92 92 70 86 62 100 C56 112 70 124 82 116 M100 108 C108 92 130 86 138 100 C144 112 130 124 118 116 M76 126 H124 M100 108 V150" fill="none" stroke="url(#{gid})" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
<text x="100" y="190" text-anchor="middle" font-family="Cinzel,Georgia,serif" font-size="30" font-weight="700" fill="url(#{gid})" letter-spacing="3">360X</text>
</svg>"""


def brasao(cls: str, gid: str) -> str:
    return BRASAO.format(cls=cls, gid=gid)


def ebook_buttons(ebook: dict, prefix: str) -> str:
    path = EBOOKS_DIR / ebook["arquivo"]
    href = esc(prefix + "ebooks/" + ebook["arquivo"])
    if not path.is_file():
        return (
            '<div class="cr-files"><span class="cr-file is-pending" aria-disabled="true">'
            '<span aria-hidden="true">📄</span> PDF em publicação</span></div>'
        )
    return (
        '<div class="cr-files">'
        f'<a class="cr-file cr-file-open" href="{href}" target="_blank" rel="noopener" type="application/pdf">'
        f'<span class="cr-file-label"><span aria-hidden="true">📖</span> Abrir PDF</span><small>{esc(size_label(path))}</small></a>'
        f'<a class="cr-file" href="{href}" download type="application/pdf">'
        '<span class="cr-file-label"><span aria-hidden="true">⬇️</span> Baixar</span><small>arquivo original</small></a>'
        "</div>"
    )


def ebook_meta(ebook: dict) -> str:
    return (
        f'<span>{esc(ebook["formato"])}</span>'
        f'<span>{ebook["paginas"]} páginas</span>'
        f'<span>{esc(short_date(ebook["data"]))}</span>'
    )


def ebook_card(ebook: dict) -> str:
    return f"""
      <article class="cr-ebook" id="ebook-{esc(ebook['id'])}" aria-labelledby="ebook-{esc(ebook['id'])}-title">
        <div class="cr-ebook-cover" aria-hidden="true">
          <span class="cr-ebook-icon">{esc(ebook['icone'])}</span>
          <span class="cr-ebook-seal">AXIOMAS 360X</span>
        </div>
        <div class="cr-ebook-body">
          <h3 id="ebook-{esc(ebook['id'])}-title">{esc(ebook['titulo'])}</h3>
          <p class="cr-meta">{ebook_meta(ebook)}</p>
          <p>{esc(ebook['descricao'])}</p>
          {ebook_buttons(ebook, "./")}
          <p class="cr-hash"><abbr title="Impressão digital do arquivo para conferir a integridade">SHA-256</abbr> {esc(ebook['sha256'][:16])}…</p>
        </div>
      </article>"""


def axiom_card(axiom: dict, data: dict, axis_by_key: dict) -> str:
    emoji, theme = data["temas"][axiom["tema"]]
    sit_icon, sit_class = SITUACOES[axiom["situacao"]]
    number = axiom["numero"]
    axis = axis_by_key[axiom["eixo"]]
    return f"""
        <article class="ax-card is-{sit_class}" id="{axiom_anchor(number)}" data-eixo="{axis_slug(axis)}" aria-labelledby="{axiom_anchor(number)}-t">
          <header class="ax-head">
            <a class="ax-num" href="#{axiom_anchor(number)}" aria-label="Link do axioma {number}">{number}</a>
            <div>
              <h4 id="{axiom_anchor(number)}-t">{esc(axiom['titulo'])}</h4>
              <p class="ax-meta"><span>{emoji} {esc(theme)}</span><span>{sit_icon} {esc(axiom['situacao'])}</span><span>🗓️ {esc(short_date(axiom['data']))}</span></p>
            </div>
          </header>
          <blockquote class="ax-quote"><p>“{esc(axiom['enunciado'])}”</p></blockquote>
          <div class="ax-comment"><b>📖 Comentário da edição</b><p>{esc(axiom['comentario'])}</p></div>
        </article>"""


def axes_sections(data: dict) -> str:
    axis_by_key = {axis["chave"]: axis for axis in data["eixos"]}
    blocks = []
    for axis in data["eixos"]:
        axioms = [a for a in data["axiomas"] if a["eixo"] == axis["chave"]]
        if not axioms:
            continue
        cards = "".join(axiom_card(axiom, data, axis_by_key) for axiom in axioms)
        label = "axioma" if len(axioms) == 1 else "axiomas"
        blocks.append(f"""
      <section class="ax-eixo" id="{axis_slug(axis)}" aria-labelledby="{axis_slug(axis)}-t">
        <header class="ax-eixo-head">
          <span class="ax-eixo-num" aria-hidden="true">{esc(axis['numeral'])}</span>
          <div>
            <h3 id="{axis_slug(axis)}-t">{esc(axis['titulo'])}</h3>
            <p>{esc(axis['intro'])}</p>
            <span class="ax-eixo-count">{len(axioms)} {label}</span>
          </div>
        </header>
        <div class="ax-list">{cards}
        </div>
      </section>""")
    return "".join(blocks)


def axes_nav(data: dict, prefix: str = "#") -> str:
    items = []
    for axis in data["eixos"]:
        count = sum(1 for a in data["axiomas"] if a["eixo"] == axis["chave"])
        if not count:
            continue
        items.append(
            f'<a href="{prefix}{axis_slug(axis)}" data-eixo-link="{axis_slug(axis)}">'
            f'<b>{esc(axis["numeral"])}</b> {esc(axis["titulo"])} <small>{count}</small></a>'
        )
    return "".join(items)


PAGE_CSS = """
:root{color-scheme:dark;--bg:#04060c;--bg2:#0a0f1a;--surf:rgba(255,255,255,.05);--surf2:rgba(255,255,255,.085);
--brd:rgba(227,176,75,.2);--brd2:rgba(255,255,255,.12);--text:#f6f2e8;--muted:#b3b8c6;--soft:#d9dbe3;--cyan:#2dd4ff;--gold:#e3b04b;
--gold2:#f3d67a;--violet:#a98cff;--green:#4ef0a1;--r:16px;--body:'Outfit',system-ui,-apple-system,'Segoe UI',sans-serif;
--head:'Cinzel','Syne',Georgia,serif;--serif:Georgia,'Times New Roman',serif;--mono:'IBM Plex Mono',ui-monospace,monospace}
html.a11y-light{color-scheme:light;--bg:#fffdf8;--bg2:#f6f1e4;--surf:rgba(60,44,12,.045);--surf2:rgba(60,44,12,.08);
--brd:#dcc9a0;--brd2:#d6d0c2;--text:#1d1a14;--muted:#5c5546;--soft:#3b3528;--cyan:#006f7d;--gold:#7a5300;--gold2:#7a5300;--violet:#6548b8;--green:#087a4e}
html.a11y-contrast{--bg:#000;--bg2:#050505;--surf:rgba(255,255,255,.12);--brd:#ffe28a;--brd2:rgba(255,255,255,.5);--text:#fff;--muted:#e6e6e6;--soft:#f2f2f2;--cyan:#63efff;--gold:#ffe28a;--gold2:#ffe28a}
@font-face{font-family:'OpenDyslexic';src:url('../assets/fonts/opendyslexic/OpenDyslexic-Regular.woff2') format('woff2');font-weight:400;font-display:swap}
@font-face{font-family:'OpenDyslexic';src:url('../assets/fonts/opendyslexic/OpenDyslexic-Bold.woff2') format('woff2');font-weight:700;font-display:swap}
html.cr-dyslexic body,html.cr-dyslexic h1,html.cr-dyslexic h2,html.cr-dyslexic h3,html.cr-dyslexic h4,html.cr-dyslexic .ax-quote{font-family:'OpenDyslexic',var(--body);letter-spacing:.01em}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;background:radial-gradient(circle at 10% -8%,rgba(227,176,75,.13),transparent 38rem),radial-gradient(circle at 100% 0,rgba(45,212,255,.1),transparent 34rem),var(--bg);
color:var(--text);font:400 1.02rem/1.6 var(--body)}
a{color:inherit}
:focus-visible{outline:3px solid var(--gold);outline-offset:3px;border-radius:6px}
.skip{position:fixed;left:12px;top:12px;z-index:50;background:#fff;color:#071422;padding:10px 14px;border-radius:10px;font-weight:800;transform:translateY(-180%)}
.skip:focus{transform:none}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}
.wrap{width:min(1180px,100% - 32px);margin:0 auto}
.top{position:sticky;top:0;z-index:20;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(14px);border-bottom:1px solid var(--brd)}
.top .wrap{display:flex;align-items:center;gap:14px;min-height:64px;flex-wrap:wrap;padding:8px 0}
.brand{display:flex;align-items:center;gap:10px;text-decoration:none;font:800 1.02rem/1.1 'Syne',var(--body)}
.brand img{width:40px;height:40px;border-radius:11px}
.brand b{color:var(--cyan)}.brand small{display:block;font:500 .7rem var(--mono);color:var(--gold);letter-spacing:.08em}
.top nav{display:flex;gap:4px;flex-wrap:wrap;margin-left:auto}
.top nav a,.top button{min-height:40px;display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:10px;border:1px solid transparent;
background:none;color:var(--soft);font:600 .86rem var(--body);text-decoration:none;cursor:pointer}
.top nav a:hover,.top button:hover{background:var(--surf2);border-color:var(--brd);color:var(--text)}
.top button[aria-pressed="true"]{border-color:var(--gold);color:var(--gold)}
.hero{padding:44px 0 10px}
.hero .wrap{display:grid;grid-template-columns:minmax(0,1fr) 170px;gap:28px;align-items:center}
.cr-brasao{width:100%;max-width:170px;height:auto;filter:drop-shadow(0 12px 32px rgba(227,176,75,.25))}
.kicker{font:600 .74rem var(--mono);letter-spacing:.16em;text-transform:uppercase;color:var(--gold)}
h1{font:700 clamp(2rem,5vw,3.2rem)/1.08 var(--head);margin:10px 0 12px;letter-spacing:.01em}
h1 span{background:linear-gradient(90deg,var(--gold2),var(--cyan));-webkit-background-clip:text;background-clip:text;color:transparent}
html.a11y-light h1 span,html.a11y-contrast h1 span{background:none;color:var(--gold)}
.lead{color:var(--soft);max-width:72ch;margin:0 0 16px}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:0;padding:0;list-style:none}
.chips li{padding:6px 11px;border:1px solid var(--brd);border-radius:999px;background:var(--surf);font-size:.84rem;color:var(--soft)}
.lema{margin:22px 0 0;padding:18px 22px;border:1px solid var(--brd);border-left:4px solid var(--gold);border-radius:14px;
background:linear-gradient(120deg,rgba(227,176,75,.1),transparent);font:italic 600 clamp(1.08rem,2.2vw,1.35rem)/1.45 var(--serif)}
.lema small{display:block;margin-top:6px;font:500 .78rem var(--mono);font-style:normal;color:var(--muted)}
main section.band{padding:24px 0}
h2.band-title{font:700 clamp(1.35rem,2.6vw,1.75rem)/1.2 var(--head);margin:0 0 6px;color:var(--gold2)}
html.a11y-light h2.band-title{color:var(--gold)}
.band-sub{color:var(--muted);margin:0 0 16px;max-width:72ch}
.cr-ebooks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.cr-ebook{display:grid;grid-template-columns:110px minmax(0,1fr);gap:16px;padding:16px;border:1px solid var(--brd);border-radius:var(--r);background:var(--surf)}
.cr-ebook-cover{display:flex;flex-direction:column;align-items:center;justify-content:space-between;min-height:150px;padding:14px 8px;border-radius:10px;
border:1px solid var(--gold);background:linear-gradient(165deg,#141a28,#06080f);box-shadow:inset 0 0 0 4px rgba(227,176,75,.12)}
.cr-ebook-icon{font-size:2.2rem;line-height:1}
.cr-ebook-seal{font:700 .6rem/1.2 var(--head);letter-spacing:.14em;color:#e3b04b;text-align:center}
.cr-ebook h3{font:700 1.08rem/1.3 var(--head);margin:0 0 4px}
.cr-ebook p{margin:0 0 10px;color:var(--soft);font-size:.94rem}
.cr-meta{display:flex;flex-wrap:wrap;gap:4px 12px;color:var(--muted)!important;font:500 .78rem var(--mono)!important}
.cr-files{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px}
.cr-file{display:inline-flex;flex-direction:column;justify-content:center;min-height:48px;padding:7px 14px;border-radius:12px;border:1px solid var(--brd2);
background:var(--surf2);text-decoration:none;font-weight:700;line-height:1.2}
.cr-file small{font:500 .7rem var(--mono);color:var(--muted);margin-top:3px}
.cr-file-label{display:inline-flex;align-items:center;gap:6px}
.cr-file-open{border-color:var(--gold)}
.cr-file:hover{border-color:var(--cyan)}
.cr-file.is-pending{opacity:.62;cursor:not-allowed}
.cr-hash{font:500 .7rem var(--mono)!important;color:var(--muted)!important;margin:0!important}
.cr-more{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.cr-more a{display:inline-flex;align-items:center;min-height:44px;padding:8px 14px;border-radius:12px;border:1px solid var(--brd2);text-decoration:none;font-weight:600;color:var(--cyan)}
.ax-tools{position:sticky;top:64px;z-index:10;display:grid;gap:10px;padding:12px 0;background:color-mix(in srgb,var(--bg) 92%,transparent);backdrop-filter:blur(10px)}
.ax-search{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.ax-search input{flex:1 1 260px;min-height:46px;padding:10px 14px;border-radius:12px;border:1px solid var(--brd);background:var(--surf);color:var(--text);font:500 1rem var(--body)}
.ax-search button{min-height:46px;padding:8px 14px;border-radius:12px;border:1px solid var(--brd2);background:var(--surf2);color:var(--text);font:600 .9rem var(--body);cursor:pointer}
.ax-count{font:500 .8rem var(--mono);color:var(--muted)}
.ax-nav{display:flex;gap:6px;overflow-x:auto;scrollbar-width:thin;padding-bottom:4px}
.ax-nav a{flex:0 0 auto;display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:6px 12px;border-radius:999px;border:1px solid var(--brd);
background:var(--surf);text-decoration:none;font-size:.84rem;color:var(--soft)}
.ax-nav a b{font-family:var(--head);color:var(--gold)}
.ax-nav a small{font:500 .7rem var(--mono);color:var(--muted)}
.ax-nav a:hover{border-color:var(--gold);color:var(--text)}
.ax-eixo{margin:22px 0 8px;scroll-margin-top:220px}
.ax-eixo-head{display:grid;grid-template-columns:62px minmax(0,1fr);gap:16px;align-items:start;margin-bottom:12px}
.ax-eixo-num{display:grid;place-items:center;width:62px;height:72px;font:700 1.35rem var(--head);color:#0b0f18;
background:linear-gradient(180deg,#f3d67a,#a87e2a);clip-path:polygon(50% 0,100% 12%,100% 58%,50% 100%,0 58%,0 12%)}
.ax-eixo-head h3{font:700 clamp(1.15rem,2.2vw,1.4rem)/1.25 var(--head);margin:4px 0 4px}
.ax-eixo-head p{margin:0 0 6px;color:var(--muted);max-width:75ch}
.ax-eixo-count{font:600 .74rem var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--cyan)}
.ax-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.ax-card{display:flex;flex-direction:column;gap:10px;padding:16px 18px;border:1px solid var(--brd2);border-radius:var(--r);background:var(--surf);scroll-margin-top:220px}
.ax-card:target{border-color:var(--gold);box-shadow:0 0 0 3px rgba(227,176,75,.25)}
.ax-card.is-confirmado{border-color:var(--gold)}
.ax-card.is-proposta{border-style:dashed}
.ax-head{display:grid;grid-template-columns:auto minmax(0,1fr);gap:12px;align-items:start}
.ax-num{display:grid;place-items:center;min-width:44px;height:44px;padding:0 6px;border-radius:12px;border:1px solid var(--gold);
font:700 1rem var(--head);color:var(--gold);text-decoration:none;background:rgba(227,176,75,.08)}
.ax-head h4{font:700 1.02rem/1.3 var(--body);margin:0 0 4px}
.ax-meta{display:flex;flex-wrap:wrap;gap:4px 10px;margin:0;font:500 .74rem var(--mono);color:var(--muted)}
.ax-quote{margin:0;padding:10px 14px;border-left:4px solid var(--gold);border-radius:8px;background:rgba(227,176,75,.07)}
.ax-quote p{margin:0;font:italic 400 1.06rem/1.55 var(--serif);color:var(--text)}
.ax-comment{padding:10px 14px;border-radius:10px;border:1px solid color-mix(in srgb,var(--cyan) 40%,transparent);background:color-mix(in srgb,var(--cyan) 6%,transparent)}
.ax-comment b{display:block;font:600 .74rem var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--cyan);margin-bottom:4px}
.ax-comment p{margin:0;color:var(--soft);font-size:.95rem}
.ax-empty{padding:18px;border:1px dashed var(--brd);border-radius:14px;color:var(--muted)}
.ax-card[hidden],.ax-eixo[hidden]{display:none}
.note{border:1px solid var(--brd);border-left:4px solid var(--gold);border-radius:12px;padding:12px 16px;background:var(--surf);color:var(--soft)}
.note p{margin:6px 0}
.ficha{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:0 0 14px;padding:0;list-style:none}
.ficha li{padding:12px 14px;border:1px solid var(--brd);border-radius:12px;background:var(--surf)}
.ficha b{display:block;font:600 .72rem var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--gold)}
footer{border-top:1px solid var(--brd);margin-top:28px;padding:22px 0 40px;color:var(--muted);font-size:.88rem}
footer .wrap{display:flex;flex-wrap:wrap;gap:10px 22px;justify-content:space-between}
footer a{color:var(--cyan)}
@media(max-width:920px){.cr-ebooks,.ax-list,.ficha{grid-template-columns:1fr}}
@media(max-width:640px){.hero .wrap{grid-template-columns:1fr}.cr-brasao{max-width:110px;order:-1}.top{position:static}
.top nav{width:100%;margin-left:0;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:thin}.top nav a{white-space:nowrap}
.ax-tools{top:0}.ax-eixo,.ax-card{scroll-margin-top:150px}.cr-ebook{grid-template-columns:76px minmax(0,1fr);gap:12px}.cr-ebook-cover{min-height:110px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
@media print{.top,.skip,footer,.ax-tools,.cr-files,.cr-more,#ebooks{display:none}body{background:#fff;color:#000}
.ax-card,.ax-eixo-head{break-inside:avoid}.ax-list{grid-template-columns:1fr}.ax-quote,.ax-comment,.lema{background:none}}
"""

PREFS_SCRIPT = """(()=>{try{const p=JSON.parse(localStorage.getItem('antigravity:a11y:v1')||'{}');const c=p&&p.contrast===true;const t=p&&p.theme;
const light=!c&&(t==='light'||(t==='system'&&matchMedia('(prefers-color-scheme: light)').matches)||(!['dark','light','system'].includes(t)&&p&&p.clarity===true));
const r=document.documentElement;r.classList.toggle('a11y-contrast',c);r.classList.toggle('a11y-light',light);r.style.colorScheme=light?'light':'dark';
if(localStorage.getItem('creditos360:dyslexic')==='1')r.classList.add('cr-dyslexic');}catch(_){}})();"""

PAGE_SCRIPT = """(()=>{const r=document.documentElement;const b=document.getElementById('crDyslexic');
if(b){const sync=()=>b.setAttribute('aria-pressed',r.classList.contains('cr-dyslexic')?'true':'false');sync();
b.addEventListener('click',()=>{r.classList.toggle('cr-dyslexic');try{localStorage.setItem('creditos360:dyslexic',r.classList.contains('cr-dyslexic')?'1':'0')}catch(_){}sync();});}
const q=document.getElementById('axBusca');const clr=document.getElementById('axLimpar');const out=document.getElementById('axContagem');
const cards=[...document.querySelectorAll('.ax-card')];const eixos=[...document.querySelectorAll('.ax-eixo')];const empty=document.getElementById('axVazio');
if(!q||!cards.length)return;
const norm=s=>s.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase();
const index=cards.map(c=>norm(c.textContent));
const total=cards.length;
const run=()=>{const v=norm(q.value.trim());let shown=0;
cards.forEach((c,i)=>{const ok=!v||index[i].includes(v)||c.id==='axioma-'+v.padStart(3,'0');c.hidden=!ok;if(ok)shown++;});
eixos.forEach(e=>{e.hidden=!e.querySelector('.ax-card:not([hidden])');});
if(out)out.textContent=v?shown+' de '+total+' axiomas':total+' axiomas';if(empty)empty.hidden=shown>0;};
q.addEventListener('input',run);if(clr)clr.addEventListener('click',()=>{q.value='';run();q.focus();});
document.addEventListener('keydown',e=>{if(e.key==='/'&&document.activeElement!==q&&!/input|textarea/i.test(document.activeElement.tagName)){e.preventDefault();q.focus();}});
run();})();"""


def render_page(data: dict) -> str:
    axioms = data["axiomas"]
    total = len(axioms)
    chapters = sum(1 for axis in data["eixos"] if any(a["eixo"] == axis["chave"] for a in axioms))
    ebooks = "".join(ebook_card(ebook) for ebook in data["ebooks"])
    proposals = sum(1 for a in axioms if a["situacao"] == "Proposta do autor")
    lema = data["lema"]
    xp = data["placarXP"]
    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Créditos do Autor · Axiomas 360X · AldenirMed 360X</title>
<meta name="description" content="Créditos do autor do AldenirMed 360X: os {total} Axiomas 360X de {esc(data['autor'])}, com os comentários da edição, e os e-books em PDF gerados a partir deles."/>
<meta name="theme-color" content="#04060c"/>
<meta name="color-scheme" content="dark light"/>
<link rel="icon" type="image/x-icon" href="../assets/icons/aerospace-v2/favicon.ico" sizes="64x64"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Syne:wght@700;800&family=IBM+Plex+Mono:wght@400;500;600&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<link rel="apple-touch-icon" href="../assets/icons/aerospace-v2/apple-touch-icon-180.png" sizes="180x180"/>
<script>{PREFS_SCRIPT}</script>
<style>{PAGE_CSS}</style>
</head>
<body>
<a class="skip" href="#conteudo">Pular para o conteúdo</a>
<header class="top">
  <div class="wrap">
    <a class="brand" href="../index.html" aria-label="AldenirMed 360X — voltar ao início">
      <img src="../assets/brand-360x/aldenirmed-360x-mark.svg" alt="" width="40" height="40"/>
      <span>AldenirMed <b>360X</b><small>CRÉDITOS DO AUTOR</small></span>
    </a>
    <nav aria-label="Seções dos Créditos do Autor">
      <a href="#ebooks">📚 E-books</a>
      <a href="#axiomas">⚜️ Axiomas</a>
      <a href="#ficha">🪶 Ficha da edição</a>
      <a href="../index.html#creditos-autor">↩ Início</a>
    </nav>
    <button id="crDyslexic" type="button" aria-pressed="false" title="Ler com a fonte OpenDyslexic">Aa OpenDyslexic</button>
  </div>
</header>
<main id="conteudo" tabindex="-1">
  <section class="hero">
    <div class="wrap">
      <div>
        <span class="kicker">Créditos do autor · Ordo · Virtus · Sapientia</span>
        <h1>⚜️ Axiomas <span>360X</span></h1>
        <p class="lead">A plataforma AldenirMed 360X é idealizada, escrita e mantida por <strong>{esc(data['autor'])}</strong>.
Esta página reúne a coleção autoral de axiomas, com o comentário da edição em cada um, e os e-books em PDF gerados a partir dela.</p>
        <ul class="chips" aria-label="Números da coleção">
          <li>⚜️ {total} axiomas</li>
          <li>🏛️ {chapters} capítulos ({chapters - 1} eixos + Armorial)</li>
          <li>📚 {len(data['ebooks'])} e-books em PDF</li>
          <li>🏅 Placar XP: {esc(xp['total'])} XP</li>
          <li>🗓️ Atualizado em {esc(short_date(data['atualizadoEm']))}</li>
        </ul>
        <p class="lema">“{esc(lema)}”<small>Lema central da coleção · axioma {data['lemaNumero']} · confirmado pelo autor</small></p>
      </div>
      {brasao("cr-brasao", "crBrasaoPage")}
    </div>
  </section>
  <section class="band" id="ebooks" aria-labelledby="ebooks-title">
    <div class="wrap">
      <h2 class="band-title" id="ebooks-title">📚 E-books gerados com os axiomas</h2>
      <p class="band-sub">Cada edição em PDF, para ler na tela, imprimir ou guardar. Os arquivos são os originais publicados pelo autor.</p>
      <div class="cr-ebooks">{ebooks}
      </div>
      <div class="cr-more">
        <a href="https://aldenirfilho.github.io/intensivahub/flashcards/autor/axiomas-360x.html" target="_blank" rel="noopener noreferrer">📕 Livro comentado no Códice 360X ↗</a>
        <a href="https://aldenirfilho.github.io/intensivahub/flashcards/" target="_blank" rel="noopener noreferrer">🎴 Flashcards dos axiomas no Códice 360X ↗</a>
      </div>
    </div>
  </section>
  <section class="band" id="axiomas" aria-labelledby="axiomas-title">
    <div class="wrap">
      <h2 class="band-title" id="axiomas-title">⚜️ Todos os axiomas, com comentários</h2>
      <p class="band-sub">Os enunciados são do autor, sem alteração. Os {proposals} itens marcados com 💡 são propostas e hipóteses do autor, ainda em aberto.</p>
      <div class="ax-tools">
        <div class="ax-search" role="search">
          <label class="sr-only" for="axBusca">Buscar nos axiomas</label>
          <input id="axBusca" type="search" placeholder="Buscar por palavra, tema ou número (atalho: /)" autocomplete="off"/>
          <button id="axLimpar" type="button">Limpar</button>
          <span class="ax-count" id="axContagem" aria-live="polite">{total} axiomas</span>
        </div>
        <nav class="ax-nav" aria-label="Capítulos da coleção">{axes_nav(data)}</nav>
      </div>
      <p class="ax-empty" id="axVazio" hidden>Nenhum axioma encontrado. Tente outra palavra ou um número de 1 a {total}.</p>{axes_sections(data)}
    </div>
  </section>
  <section class="band" id="ficha" aria-labelledby="ficha-title">
    <div class="wrap">
      <h2 class="band-title" id="ficha-title">🪶 Ficha da edição</h2>
      <ul class="ficha">
        <li><b>Concepção e axiomas</b>{esc(data['autor'])}</li>
        <li><b>Comentários e diagramação</b>Claude (Anthropic), a pedido do autor, identificados como “Comentário da edição”</li>
        <li><b>Fonte dos enunciados</b>{esc(data['fonte'])}</li>
        <li><b>Placar XP</b>{esc(xp['total'])} XP em {xp['axiomas']} axiomas. {esc(xp['nota'])}</li>
      </ul>
      <div class="note">
        <p>📖 Os comentários são leitura da edição, não texto do autor. Ao citar um axioma, informe o autor e o número.</p>
        <p>💡 Propostas e hipóteses do autor são ideias em aberto; as hipóteses clínicas pedem estudo antes de qualquer uso.</p>
        <p>⚠️ <em>Os axiomas médicos são reflexões de estudo. Não substituem o julgamento clínico, as diretrizes, os protocolos institucionais ou a avaliação médica individual.</em></p>
      </div>
    </div>
  </section>
</main>
<footer>
  <div class="wrap">
    <span>© 2026 AldenirMed 360X · Créditos do Autor · atualizado em {esc(short_date(data['atualizadoEm']))}</span>
    <span><a href="../index.html">Voltar ao início</a> · <a href="../20_Conheca_Aldenir/index.html">Conheça o idealizador</a> · <a href="../jornal-360/index.html">Jornal Diário 360</a></span>
  </div>
</footer>
<script>{PAGE_SCRIPT}</script>
</body>
</html>
"""


def render_home_block(data: dict) -> str:
    axioms = {axiom["numero"]: axiom for axiom in data["axiomas"]}
    total = len(axioms)
    chapters = sum(1 for axis in data["eixos"] if any(a["eixo"] == axis["chave"] for a in axioms.values()))
    featured = []
    for number in data["destaques"]:
        if number == data["lemaNumero"]:
            continue
        axiom = axioms[number]
        featured.append(
            f'<li><a href="creditos-autor/index.html#{axiom_anchor(number)}">'
            f'<span class="cr360-num">{number}</span>'
            f'<span class="cr360-ax"><b>{esc(axiom["titulo"])}</b>'
            f'<q>{esc(axiom["enunciado"])}</q>'
            f'<small>📖 {esc(first_sentence(axiom["comentario"]))}</small></span></a></li>'
        )
    ebooks = []
    for ebook in data["ebooks"]:
        path = EBOOKS_DIR / ebook["arquivo"]
        href = esc("creditos-autor/ebooks/" + ebook["arquivo"])
        if path.is_file():
            action = (
                f'<a class="cr360-pdf" href="{href}" target="_blank" rel="noopener" type="application/pdf">'
                f'<span aria-hidden="true">{esc(ebook["icone"])}</span><span><b>{esc(ebook["titulo"])}</b>'
                f'<small>PDF · {ebook["paginas"]} p. · {esc(size_label(path))}</small></span></a>'
            )
        else:
            action = (
                f'<span class="cr360-pdf is-pending" aria-disabled="true"><span aria-hidden="true">{esc(ebook["icone"])}</span>'
                f'<span><b>{esc(ebook["titulo"])}</b><small>PDF em publicação</small></span></span>'
            )
        ebooks.append(f"<li>{action}</li>")
    return f"""{HOME_START}
      <article class="cr360-author" aria-labelledby="cr360Author">
        {brasao("cr360-brasao", "crBrasaoHome")}
        <div class="cr360-author-text">
          <span class="cr360-kicker">⚜️ Idealização, autoria e edição</span>
          <h3 id="cr360Author">{esc(data['autor'])}</h3>
          <p>Idealizador, autor, editor e mantenedor independente do AldenirMed 360X. Dos plantões e do estudo nasceram os seus Axiomas 360X.</p>
          <blockquote class="cr360-lema"><p>“{esc(data['lema'])}”</p><cite>Lema central · axioma {data['lemaNumero']}</cite></blockquote>
          <ul class="cr360-stats" aria-label="Números da coleção"><li><b>{total}</b> axiomas</li><li><b>{chapters}</b> capítulos</li><li><b>{len(data['ebooks'])}</b> e-books</li><li><b>{esc(data['placarXP']['total'])}</b> XP</li></ul>
          <nav class="cr360-eixos" aria-label="Capítulos dos Axiomas 360X">{axes_nav(data, "creditos-autor/index.html#")}</nav>
        </div>
      </article>
      <section class="cr360-featured" aria-labelledby="cr360Featured">
        <h3 id="cr360Featured">✨ Axiomas em destaque</h3>
        <ul>{"".join(featured)}</ul>
        <a class="cr360-all" href="creditos-autor/index.html#axiomas" data-search-route data-search-title="Créditos do autor: Axiomas 360X" data-search-kind="Créditos do autor" data-search-terms="axiomas autor creditos aldenir ebooks pdf lema honra merito">Ler os {total} axiomas com comentários →</a>
      </section>
      <section class="cr360-ebooks" aria-labelledby="cr360Ebooks">
        <h3 id="cr360Ebooks">📚 E-books gerados com os axiomas (PDF)</h3>
        <ul>{"".join(ebooks)}</ul>
      </section>
      {HOME_END}"""


def apply_home(html_text: str, block: str) -> str:
    start = html_text.find(HOME_START)
    end = html_text.find(HOME_END)
    if start < 0 or end < 0 or end < start:
        raise SystemExit("index.html: marcadores CREDITOS360 ausentes")
    return html_text[:start] + block + html_text[end + len(HOME_END):]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--check", action="store_true", help="falha se os arquivos gerados estiverem desatualizados")
    args = parser.parse_args()
    data = load()
    page = render_page(data)
    home = apply_home(HOME.read_text(encoding="utf-8"), render_home_block(data))
    if args.check:
        stale = []
        if not PAGE.is_file() or PAGE.read_text(encoding="utf-8") != page:
            stale.append(str(PAGE.relative_to(ROOT)))
        if HOME.read_text(encoding="utf-8") != home:
            stale.append("index.html (bloco CREDITOS360)")
        if stale:
            print("❌ Créditos do Autor desatualizados: " + ", ".join(stale))
            print("   Rode: python3 scripts_admin/build_creditos_autor.py")
            return 1
        print(f"✅ Créditos do Autor em dia: {len(data['axiomas'])} axiomas, {len(data['ebooks'])} e-books.")
        return 0
    PAGE.write_text(page, encoding="utf-8")
    HOME.write_text(home, encoding="utf-8")
    present = sum(1 for ebook in data["ebooks"] if (EBOOKS_DIR / ebook["arquivo"]).is_file())
    print(f"⚜️ Créditos do Autor: {len(data['axiomas'])} axiomas, {present} PDF(s) publicados.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
