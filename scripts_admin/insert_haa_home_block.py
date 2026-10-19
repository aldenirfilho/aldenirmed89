#!/usr/bin/env python3
"""Mantém HAA e doenças genéticas como cartões convencionais na homepage.

O nome histórico é preservado para compatibilidade com o workflow. A migração
remove o antigo destaque inicial de HAA e seu CSS exclusivo; o conteúdo clínico
e o service worker são mantidos pelos respectivos módulos e pelo deploy.
"""
from __future__ import annotations

import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HOME = ROOT / "index.html"
HAA_ROUTE = "01_Modulos_Clinicos/Hepatite_Alcool_Associada/index.html"
GENETICS_ROUTE = "01_Modulos_Clinicos/Doencas_Geneticas/index.html"
TCE_MARKER = (
    '      <a class="module-card mod-red reveal" '
    'href="01_Modulos_Clinicos/TCE_Grave_CRASH/index.html" '
    'aria-label="Abrir TCE grave — Protocolo CRASH">'
)

HOME_MODULE_CARD = r'''
      <a id="hepatite-alcool" class="module-card mod-yellow reveal" data-haa-home-card href="01_Modulos_Clinicos/Hepatite_Alcool_Associada/index.html" aria-label="Abrir Hepatite associada ao álcool — Turbo TEMI 360 X">
        <div class="module-icon">🟠</div>
        <h3>Hepatite associada ao álcool</h3>
        <p>Critérios NIAAA, mecanismo, abordagem inicial, prednisolona, suporte e Atlas visual com os principais escores.</p>
        <div class="module-tag-row">
          <span class="module-tag">10 mapas 16:9</span>
          <span class="module-tag">5 escores</span>
          <span class="module-tag">Turbo TEMI 360 X</span>
        </div>
        <span class="module-link" style="color:var(--yellow)">Abrir hepatologia</span>
      </a>
'''.strip("\n")

GENETICS_MODULE_CARD = r'''
      <a id="doencas-geneticas" class="module-card mod-violet reveal" data-genetics-home-card href="01_Modulos_Clinicos/Doencas_Geneticas/index.html" aria-label="Abrir Doenças genéticas — rasopatias e síndrome de Noonan — Turbo TEMI 360X">
        <div class="module-icon">🧬</div>
        <h3>Doenças genéticas</h3>
        <p>Rasopatias e síndrome de Noonan: via RAS/MAPK, reconhecimento clínico, avaliação genética e implicações na UTI. Atlas com 10 imagens didáticas.</p>
        <div class="module-tag-row">
          <span class="module-tag">Noonan · rasopatias</span>
          <span class="module-tag">10 imagens</span>
          <span class="module-tag">Turbo TEMI 360X</span>
        </div>
        <span class="module-link" style="color:var(--violet)">Explorar doenças genéticas</span>
      </a>
'''.strip("\n")


class IdCollector(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: list[str] = []

    def handle_starttag(self, _tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.ids.extend(value for key, value in attrs if key == "id" and value)


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: esperado 1 marcador, encontrado {count}")
    return text.replace(old, new, 1)


def patch_home(text: str) -> str:
    # Os marcadores delimitam somente o antigo destaque e seu CSS privativo.
    text = re.sub(
        r"\n?/\* haa-home-feature:v1 \*/.*?(?=/\* ── FUTEBOL TOTAL)",
        "", text, flags=re.S,
    )
    text = re.sub(
        r"\n?<!-- haa-home-feature:v1 -->\s*<section\b.*?</section>\s*",
        "\n", text, flags=re.S,
    )
    # A variante histórica do normalizador podia anexar CSS do cartão ao fim.
    text = text.replace("/* haa-discovery-card:v1 */", "")
    text = text.replace(",.haa-discovery-module p", "").replace(",.haa-discovery-module", "")
    text = re.sub(r"\.haa-discovery-module[^{}]*\{[^{}]*\}\s*", "", text)

    # HAA continua no menu e no rodapé, sem destaque no hero.
    text = re.sub(r'^[ \t]*<a\b[^>]*class="btn btn-primary"[^>]*>🟠 Abrir Hepatologia HAA</a>\n', "", text, flags=re.M)
    text = re.sub(r'^[ \t]*<a\b[^>]*class="topic-pill yellow"[^>]*>🟠 HAA · Maddrey · MELD · Lille</a>\n', "", text, flags=re.M)
    text = text.replace('href="#hepatite-alcool"', f'href="{HAA_ROUTE}"')

    for marker, card in (
        ("data-haa-home-card", HOME_MODULE_CARD),
        ("data-genetics-home-card", GENETICS_MODULE_CARD),
    ):
        pattern = re.compile(r'^[ \t]*<a\b[^>]*\b' + marker + r'\b[^>]*>.*?</a>', re.M | re.S)
        existing = list(pattern.finditer(text))
        if len(existing) > 1:
            raise RuntimeError(f"Cartão duplicado: {marker}")
        if existing:
            text = pattern.sub(lambda _: card, text, count=1)
        else:
            text = replace_once(text, TCE_MARKER, card + "\n\n" + TCE_MARKER, marker)
    return text


def validate(home: str) -> None:
    for token in ("haa-home-feature", "haa-discovery-module", "haa-home-title"):
        if token in home:
            raise RuntimeError(f"Destaque HAA obsoleto ainda presente: {token}")
    if 'href="#hepatite-alcool"' in home:
        raise RuntimeError("Atalho HAA deve abrir diretamente o módulo.")
    modules_start = home.index('id="modulos"')
    modules_end = home.index("<!-- ── DECK DE MISSÕES CRÍTICAS", modules_start)
    grid = home[modules_start:modules_end]
    for card in (HOME_MODULE_CARD, GENETICS_MODULE_CARD):
        if grid.count(card) != 1:
            raise RuntimeError("Cartão clínico ausente ou duplicado na grade de módulos.")
    parser = IdCollector()
    parser.feed(home)
    duplicates = sorted({item for item in parser.ids if parser.ids.count(item) > 1})
    if duplicates:
        raise RuntimeError(f"IDs duplicados na homepage: {duplicates}")


def main() -> None:
    original = HOME.read_text(encoding="utf-8")
    updated = patch_home(original)
    validate(updated)
    if original != updated:
        HOME.write_text(updated, encoding="utf-8")
        print("Homepage atualizada: HAA e doenças genéticas na grade convencional.")
    else:
        print("Nenhuma alteração necessária: cartões clínicos já estão normalizados.")


if __name__ == "__main__":
    main()
