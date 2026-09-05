#!/usr/bin/env python3
"""Normaliza o card de descoberta da HAA sem alterar a taxonomia canônica.

A página principal possui uma suíte histórica que trata todo link com a classe
``module-card`` como um módulo canônico. A HAA já está integrada aos manifests,
mas seu novo card visual é uma camada de descoberta. Por isso, este script usa
uma classe visual própria, preservando os 25 cartões canônicos e os contratos de
teste existentes.
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HOME = ROOT / "index.html"
PATCHER = ROOT / "scripts_admin" / "insert_haa_home_block.py"
MODULE_HTML = ROOT / "01_Modulos_Clinicos" / "Hepatite_Alcool_Associada" / "index.html"
SW = ROOT / "sw.js"

ROUTE = "01_Modulos_Clinicos/Hepatite_Alcool_Associada/index.html"
CARD_MARKER = f'data-haa-home-card href="{ROUTE}"'
CSS_MARKER = "/* haa-discovery-card:v1 */"
TCE_MARKER = (
    '      <a class="module-card mod-red reveal" '
    'href="01_Modulos_Clinicos/TCE_Grave_CRASH/index.html" '
    'aria-label="Abrir TCE grave — Protocolo CRASH">'
)

CARD = "\n".join(
    [
        f'      <a class="haa-discovery-module mod-yellow reveal" data-haa-home-card href="{ROUTE}" aria-label="Abrir Hepatite associada ao álcool — Turbo TEMI 360 X">',
        '        <div class="module-icon">🟠</div>',
        '        <h3>Hepatite associada ao álcool</h3>',
        '        <p>Critérios NIAAA, mecanismo, abordagem inicial, prednisolona, suporte e Atlas visual com os principais escores.</p>',
        '        <div class="module-tag-row">',
        '          <span class="module-tag">10 mapas 16:9</span>',
        '          <span class="module-tag">5 escores</span>',
        '          <span class="module-tag">Turbo TEMI 360 X</span>',
        '        </div>',
        '        <span class="module-link" style="color:var(--yellow)">Abrir hepatologia</span>',
        '      </a>',
        '',
        '',
    ]
)

DISCOVERY_CSS = r"""
/* haa-discovery-card:v1 */
.haa-discovery-module{
  --accent:var(--yellow);--accent-d:var(--yel-d);
  position:relative;overflow:hidden;display:flex;flex-direction:column;
  min-width:0;min-height:100%;padding:26px 24px 22px;
  border:1px solid color-mix(in srgb,var(--yellow) 42%,var(--brd));
  border-radius:var(--r-lg);
  background:linear-gradient(145deg,color-mix(in srgb,var(--yellow) 8%,var(--surf)),var(--surf));
  color:var(--text);text-decoration:none;cursor:pointer;
  transition:transform .22s ease,border-color .22s ease,box-shadow .22s ease,background .22s ease;
}
.haa-discovery-module::before{
  content:'';position:absolute;inset:0;pointer-events:none;opacity:0;
  background:linear-gradient(135deg,var(--yel-d),transparent 60%);transition:opacity .22s ease;
}
.haa-discovery-module:hover,.haa-discovery-module:focus-visible{
  transform:translateY(-3px);border-color:var(--yellow);
  box-shadow:0 16px 50px rgba(0,0,0,.3),0 0 0 1px var(--yellow);
}
.haa-discovery-module:hover::before,.haa-discovery-module:focus-visible::before{opacity:1}
.haa-discovery-module h3{
  position:relative;font-family:var(--font-head);font-size:1rem;font-weight:700;
  letter-spacing:-.01em;margin-bottom:8px;line-height:1.2;
}
.haa-discovery-module p{
  position:relative;font-size:.85rem;color:var(--soft);line-height:1.55;margin-bottom:16px;
  display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;line-clamp:3;overflow:hidden;
}
.haa-discovery-module .module-icon,.haa-discovery-module .module-tag-row,
.haa-discovery-module .module-link{position:relative}
.haa-discovery-module:hover .module-link::after,
.haa-discovery-module:focus-visible .module-link::after{transform:translateX(3px)}
""".strip()

OLD_CARD_OPENING = re.compile(
    r'<a class="module-card mod-yellow(?: reveal)?" data-haa-home-card '
    r'href="01_Modulos_Clinicos/Hepatite_Alcool_Associada/(?:index\.html)?"'
)
NEW_CARD_OPENING = (
    f'<a class="haa-discovery-module mod-yellow reveal" '
    f'data-haa-home-card href="{ROUTE}"'
)


def read(path: Path) -> str:
    if not path.exists():
        raise FileNotFoundError(path)
    return path.read_text(encoding="utf-8")


def write_if_changed(path: Path, content: str) -> bool:
    original = read(path)
    if original == content:
        return False
    path.write_text(content, encoding="utf-8")
    return True


def normalize_home(text: str) -> str:
    text = OLD_CARD_OPENING.sub(NEW_CARD_OPENING, text)

    if CARD_MARKER not in text:
        if text.count(TCE_MARKER) != 1:
            raise RuntimeError("Card TCE usado como âncora não foi localizado de forma única.")
        text = text.replace(TCE_MARKER, CARD + TCE_MARKER, 1)

    if CSS_MARKER not in text:
        css_anchor = "</style>\n<noscript><style>"
        if text.count(css_anchor) != 1:
            raise RuntimeError("Fechamento do estilo principal não foi localizado de forma única.")
        text = text.replace(css_anchor, f"\n{DISCOVERY_CSS}\n</style>\n<noscript><style>", 1)

    return text


def normalize_patcher(text: str) -> str:
    text = OLD_CARD_OPENING.sub(NEW_CARD_OPENING, text)
    text = text.replace(
        "if 'data-haa-home-card href=\"01_Modulos_Clinicos/Hepatite_Alcool_Associada/\"' not in text:",
        f"if '{CARD_MARKER}' not in text:",
    )
    text = text.replace(
        "if 'data-haa-home-card' not in text:",
        f"if '{CARD_MARKER}' not in text:",
    )

    if CSS_MARKER not in text:
        start = text.find("HOME_CSS = r'''")
        if start < 0:
            raise RuntimeError("Bloco HOME_CSS não localizado no patcher.")
        end = text.find("'''.strip()", start)
        if end < 0:
            raise RuntimeError("Fim do bloco HOME_CSS não localizado no patcher.")
        text = text[:end] + "\n" + DISCOVERY_CSS + "\n" + text[end:]

    return text


def preserve_cache_contract(text: str) -> str:
    text = text.replace("v29-haa-home", "v29")
    text, count = re.subn(
        r"const CACHE_NAME = `\$\{CACHE_PREFIX\}v[^`]+`;",
        "const CACHE_NAME = `${CACHE_PREFIX}v29`;",
        text,
        count=1,
    )
    if count != 1:
        raise RuntimeError("CACHE_NAME não foi localizado no service worker.")
    return text


def validate(home: str, patcher: str, module_html: str, worker: str) -> None:
    required_home = (
        "<!-- haa-home-feature:v1 -->",
        'id="hepatite-alcool"',
        'class="haa-discovery-module mod-yellow reveal" data-haa-home-card',
        CARD_MARKER,
        CSS_MARKER,
    )
    for token in required_home:
        if token not in home:
            raise RuntimeError(f"Homepage sem marcador obrigatório: {token}")

    if OLD_CARD_OPENING.search(home):
        raise RuntimeError("O card HAA ainda usa a classe canônica module-card.")
    if CARD_MARKER not in patcher or CSS_MARKER not in patcher:
        raise RuntimeError("Patcher idempotente não foi normalizado.")
    if "<!-- haa-module-entry:v1 -->" not in module_html or 'href="#atlas-visual"' not in module_html:
        raise RuntimeError("Entrada do módulo ou atalho do Atlas não foi encontrado.")
    if "const CACHE_NAME = `${CACHE_PREFIX}v29`;" not in worker:
        raise RuntimeError("Contrato de cache v29 não foi preservado.")
    if '"./01_Modulos_Clinicos/Hepatite_Alcool_Associada/index.html"' not in worker:
        raise RuntimeError("Módulo HAA não está no aquecimento do PWA.")

    modules_start = home.index('id="modulos"')
    deck_start = home.index("<!-- ── DECK DE MISSÕES CRÍTICAS", modules_start)
    module_slice = home[modules_start:deck_start]
    if CARD_MARKER not in module_slice:
        raise RuntimeError("Card de descoberta HAA está fora da seção Módulos e apps.")
    if module_slice.count('class="module-card') != 25:
        raise RuntimeError("A quantidade histórica de 25 module-card foi alterada.")

    module_hrefs = set(
        re.findall(
            r'<a\b[^>]*class="[^"]*\bmodule-card\b[^"]*"[^>]*href="([^"]+)"',
            home,
            flags=re.I,
        )
    )
    if len(module_hrefs) != 28:
        raise RuntimeError(f"Contrato global de module-card alterado: {len(module_hrefs)} links.")
    if ROUTE in module_hrefs:
        raise RuntimeError("Card HAA foi classificado incorretamente como module-card canônico.")


def main() -> None:
    outputs = {
        HOME: normalize_home(read(HOME)),
        PATCHER: normalize_patcher(read(PATCHER)),
        SW: preserve_cache_contract(read(SW)),
    }
    module_html = read(MODULE_HTML)
    validate(outputs[HOME], outputs[PATCHER], module_html, outputs[SW])

    changed: list[str] = []
    for path, content in outputs.items():
        if write_if_changed(path, content):
            changed.append(str(path.relative_to(ROOT)))

    if changed:
        print("Arquivos normalizados:")
        for item in changed:
            print(f"- {item}")
    else:
        print("Nenhuma alteração necessária: card HAA já está normalizado.")


if __name__ == "__main__":
    main()
