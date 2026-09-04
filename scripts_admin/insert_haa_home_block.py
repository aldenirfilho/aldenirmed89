#!/usr/bin/env python3
"""Insere, de forma idempotente, o bloco público da HAA no AldenirMed89.

O script mantém o conteúdo clínico canônico no módulo e melhora a descoberta na
homepage, no menu, no elenco de módulos e no rodapé. Também move o Atlas Turbo
TEMI 360 X para o início do módulo e renova o cache do PWA.
"""
from __future__ import annotations

import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HOME = ROOT / "index.html"
MODULE_DIR = ROOT / "01_Modulos_Clinicos" / "Hepatite_Alcool_Associada"
MODULE_HTML = MODULE_DIR / "index.html"
MODULE_JS = MODULE_DIR / "app.js"
MODULE_CSS = MODULE_DIR / "styles.css"
MODULE_MANIFEST = MODULE_DIR / "module.manifest.json"
MODULE_README = MODULE_DIR / "README.md"
SW = ROOT / "sw.js"

HOME_CSS_SENTINEL = "/* haa-home-feature:v1 */"
HOME_HTML_SENTINEL = "<!-- haa-home-feature:v1 -->"
MODULE_ENTRY_SENTINEL = "<!-- haa-module-entry:v1 -->"
MODULE_CSS_SENTINEL = "/* haa-module-entry:v1 */"


class IdCollector(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: list[str] = []

    def handle_starttag(self, _tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for key, value in attrs:
            if key == "id" and value:
                self.ids.append(value)


def read(path: Path) -> str:
    if not path.exists():
        raise FileNotFoundError(path)
    return path.read_text(encoding="utf-8")


def write_if_changed(path: Path, content: str) -> bool:
    current = read(path)
    if current == content:
        return False
    path.write_text(content, encoding="utf-8")
    return True


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: esperado 1 marcador, encontrado {count}")
    return text.replace(old, new, 1)


HOME_CSS = r'''
/* haa-home-feature:v1 */
.haa-home-feature{
  padding:0 0 var(--section-space);
  scroll-margin-top:96px;
}
.haa-home-surface{
  position:relative;
  overflow:hidden;
  display:grid;
  grid-template-columns:minmax(0,1.15fr) minmax(330px,.85fr);
  gap:clamp(22px,4vw,54px);
  align-items:center;
  padding:clamp(24px,4vw,52px);
  border:1px solid color-mix(in srgb,var(--yellow) 42%,var(--brd));
  border-radius:var(--r-xl);
  background:
    radial-gradient(circle at 8% 5%,color-mix(in srgb,var(--yellow) 16%,transparent),transparent 35%),
    radial-gradient(circle at 94% 94%,color-mix(in srgb,var(--red) 12%,transparent),transparent 32%),
    linear-gradient(145deg,var(--bg3),var(--bg2));
  box-shadow:var(--shadow);
}
.haa-home-surface::after{
  content:"";
  position:absolute;
  inset:auto -120px -180px auto;
  width:420px;
  height:420px;
  border:1px solid color-mix(in srgb,var(--yellow) 26%,transparent);
  border-radius:50%;
  box-shadow:0 0 0 44px color-mix(in srgb,var(--yellow) 4%,transparent),0 0 0 92px color-mix(in srgb,var(--cyan) 3%,transparent);
  pointer-events:none;
}
.haa-home-copy,.haa-home-scoreboard{position:relative;z-index:1}
.haa-home-kicker{
  display:inline-flex;
  align-items:center;
  gap:8px;
  margin-bottom:14px;
  color:var(--yellow);
  font:800 .72rem/1.2 var(--font-mono);
  letter-spacing:.11em;
  text-transform:uppercase;
}
.haa-home-title{
  max-width:15ch;
  margin:0;
  font:800 clamp(2rem,4.8vw,4.9rem)/.96 var(--font-head);
  letter-spacing:-.055em;
}
.haa-home-title span{color:var(--yellow)}
.haa-home-copy>p{
  max-width:68ch;
  margin:18px 0 0;
  color:var(--soft);
  font-size:clamp(.98rem,1.4vw,1.12rem);
  line-height:1.65;
}
.haa-home-actions{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  margin-top:24px;
}
.haa-home-actions .btn{margin:0}
.haa-home-scoreboard{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:10px;
}
.haa-score-tile{
  min-height:118px;
  display:flex;
  flex-direction:column;
  justify-content:space-between;
  padding:18px;
  border:1px solid var(--brd);
  border-radius:var(--r);
  background:var(--surf);
}
.haa-score-tile:first-child{
  grid-column:1/-1;
  min-height:150px;
  background:linear-gradient(135deg,color-mix(in srgb,var(--yellow) 16%,var(--surf)),var(--surf));
  border-color:color-mix(in srgb,var(--yellow) 38%,var(--brd));
}
.haa-score-tile strong{
  color:var(--yellow);
  font:800 clamp(1.12rem,2.4vw,1.75rem)/1.05 var(--font-head);
}
.haa-score-tile span{
  margin-top:10px;
  color:var(--soft);
  font-size:.86rem;
  line-height:1.42;
}
.haa-home-note{
  grid-column:1/-1;
  display:flex;
  gap:10px;
  align-items:flex-start;
  padding:13px 14px;
  border:1px solid var(--brd);
  border-radius:12px;
  background:color-mix(in srgb,var(--bg) 60%,transparent);
  color:var(--soft);
  font-size:.82rem;
  line-height:1.45;
}
.haa-home-note b{color:var(--text)}
.module-card[data-haa-home-card]{
  --accent:var(--yellow);
  --accent-d:var(--yel-d);
  border-color:color-mix(in srgb,var(--yellow) 42%,var(--brd));
  background:linear-gradient(145deg,color-mix(in srgb,var(--yellow) 8%,var(--surf)),var(--surf));
}
.module-card[data-haa-home-card] .module-icon{
  background:var(--yel-d);
  border-color:color-mix(in srgb,var(--yellow) 55%,var(--brd));
  color:var(--yellow);
}
@media (max-width:900px){
  .haa-home-surface{grid-template-columns:1fr}
  .haa-home-title{max-width:18ch}
}
@media (max-width:560px){
  .haa-home-surface{padding:20px;border-radius:var(--r-lg)}
  .haa-home-scoreboard{grid-template-columns:1fr}
  .haa-score-tile:first-child,.haa-home-note{grid-column:auto}
  .haa-home-actions{display:grid}
  .haa-home-actions .btn{width:100%;justify-content:center}
}
'''.strip()


HOME_SECTION = r'''
<!-- haa-home-feature:v1 -->
<section class="haa-home-feature" id="hepatite-alcool" aria-labelledby="haa-home-title">
  <div class="shell">
    <div class="haa-home-surface">
      <div class="haa-home-copy">
        <span class="haa-home-kicker">🟠 Novo bloco clínico · Laranja Mecânica · Turbo TEMI 360 X</span>
        <h2 class="haa-home-title" id="haa-home-title">Hepatite associada <span>ao álcool</span></h2>
        <p>Uma estação única para critérios NIAAA, mecanismo da lesão, abordagem inicial, prednisolona, suporte, complicações e os principais escores. O Atlas Turbo TEMI reúne dez mapas widescreen para revisão rápida.</p>
        <div class="haa-home-actions">
          <a class="btn btn-primary" href="01_Modulos_Clinicos/Hepatite_Alcool_Associada/">Abrir módulo completo</a>
          <a class="btn btn-primary" href="01_Modulos_Clinicos/Hepatite_Alcool_Associada/#atlas-visual">Ver 10 mapas 16:9</a>
          <a class="btn btn-ghost" href="01_Modulos_Clinicos/Hepatite_Alcool_Associada/#escores">Abrir escores</a>
          <a class="btn btn-ghost" href="01_Modulos_Clinicos/Hepatite_Alcool_Associada/#prednisolona">Fluxo da prednisolona</a>
        </div>
      </div>
      <div class="haa-home-scoreboard" aria-label="Conteúdo do módulo de hepatite associada ao álcool">
        <article class="haa-score-tile"><strong>10 mapas · 5 escores</strong><span>Atlas vetorial widescreen, calculadoras educacionais e comparação prática em uma única página.</span></article>
        <article class="haa-score-tile"><strong>Maddrey · MELD</strong><span>Gravidade inicial e prognóstico global.</span></article>
        <article class="haa-score-tile"><strong>ABIC · GAHS</strong><span>Estratificação prognóstica complementar.</span></article>
        <article class="haa-score-tile"><strong>Lille</strong><span>Resposta ao corticoide e regra de interrupção.</span></article>
        <article class="haa-score-tile"><strong>Conduta</strong><span>Diagnóstico, segurança, suporte e seguimento.</span></article>
        <div class="haa-home-note"><span aria-hidden="true">🛡️</span><span><b>Uso educacional profissional.</b> O conteúdo canônico, a avaliação clínica e o protocolo institucional prevalecem sobre qualquer síntese visual.</span></div>
      </div>
    </div>
  </div>
</section>
'''.strip()


HOME_MODULE_CARD = r'''
      <a class="module-card mod-yellow" data-haa-home-card href="01_Modulos_Clinicos/Hepatite_Alcool_Associada/" aria-label="Abrir Hepatite associada ao álcool — Turbo TEMI 360 X">
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

'''


MODULE_ENTRY = r'''
    <!-- haa-module-entry:v1 -->
    <section class="module-entry-rail" data-haa-module-entry aria-labelledby="module-entry-title">
      <div>
        <span class="tag">ENCONTRE O BLOCO RAPIDAMENTE</span>
        <h2 id="module-entry-title">Atlas e escores ficam logo no início</h2>
        <p>Comece pelos dez mapas Turbo TEMI 360 X ou abra diretamente Maddrey, MELD/MELD-Na, ABIC, GAHS e Lille. O conteúdo clínico completo continua abaixo.</p>
      </div>
      <div class="module-entry-actions">
        <a href="#atlas-visual">🖼️ Abrir Atlas 360 X</a>
        <a href="#escores">📊 Abrir os escores</a>
        <a href="#prednisolona">💊 Prednisolona passo a passo</a>
        <a href="../../index.html#hepatite-alcool">← Voltar ao bloco da página principal</a>
      </div>
    </section>
'''.strip()


MODULE_ENTRY_CSS = r'''
/* haa-module-entry:v1 */
.module-entry-rail{
  display:grid;
  grid-template-columns:minmax(0,1.15fr) minmax(280px,.85fr);
  gap:1rem;
  align-items:center;
  margin:1rem 0;
  padding:clamp(1.1rem,3vw,1.8rem);
  border:1px solid #ffc89f;
  border-radius:var(--radius);
  background:linear-gradient(145deg,var(--orange-soft),#fff);
  box-shadow:var(--shadow);
}
.module-entry-rail h2{
  margin:.55rem 0 .45rem;
  color:var(--navy);
  font-size:clamp(1.45rem,3vw,2.25rem);
  line-height:1.08;
}
.module-entry-rail p{margin:0;color:var(--muted)}
.module-entry-actions{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}
.module-entry-actions a{
  display:flex;
  align-items:center;
  min-height:48px;
  padding:.72rem .82rem;
  border:1px solid #d8e0e3;
  border-radius:11px;
  background:#fff;
  color:var(--navy);
  font-size:.82rem;
  font-weight:900;
  text-decoration:none;
}
.module-entry-actions a:hover,.module-entry-actions a:focus-visible{
  border-color:var(--orange);
  background:#fff8f2;
}
@media (max-width:760px){
  .module-entry-rail{grid-template-columns:1fr}
  .module-entry-actions{grid-template-columns:1fr}
}
'''.strip()


def patch_home(text: str) -> str:
    text = text.replace(
        'content="Plataforma médica interativa para Medicina Intensiva, UTI e emergência, com TCE grave CRASH, ventilação, Infectologia, Pneumologia, Hematologia, Reumatologia e preparação TEMI/R3."',
        'content="Plataforma médica interativa para Medicina Intensiva, UTI e emergência, com hepatite associada ao álcool, TCE grave CRASH, ventilação, módulos críticos e preparação TEMI/R3."',
        1,
    )
    text = text.replace(
        'content="Central clínica: TCE grave CRASH, módulos críticos, Calculadoras UTI, Banco TEMI, Biblioteca IA e Mapa Vivo em um único portal."',
        'content="Central clínica com hepatite associada ao álcool, TCE grave CRASH, módulos críticos, Calculadoras UTI, Banco TEMI, Biblioteca IA e Mapa Vivo."',
        1,
    )

    if HOME_CSS_SENTINEL not in text:
        text = replace_once(
            text,
            '/* ── FUTEBOL TOTAL · CAMPO TÁTICO OPERACIONAL ────── */',
            f'{HOME_CSS}\n\n/* ── FUTEBOL TOTAL · CAMPO TÁTICO OPERACIONAL ────── */',
            'CSS da homepage',
        )

    nav_link = '      <a href="#hepatite-alcool" class="accent">🟠 Hepatologia HAA</a>\n'
    if 'href="#hepatite-alcool" class="accent"' not in text:
        text = replace_once(
            text,
            '      <a href="01_Modulos_Clinicos/TCE_Grave_CRASH/index.html" class="accent">🧠 TCE CRASH</a>\n',
            '      <a href="01_Modulos_Clinicos/TCE_Grave_CRASH/index.html" class="accent">🧠 TCE CRASH</a>\n' + nav_link,
            'atalho HAA no menu',
        )

    hero_button = '        <a class="btn btn-primary" href="#hepatite-alcool">🟠 Abrir Hepatologia HAA</a>\n'
    if 'href="#hepatite-alcool">🟠 Abrir Hepatologia HAA' not in text:
        text = replace_once(
            text,
            '        <a class="btn btn-primary" href="01_Modulos_Clinicos/TCE_Grave_CRASH/index.html">🧠 Abrir TCE grave CRASH</a>\n',
            '        <a class="btn btn-primary" href="01_Modulos_Clinicos/TCE_Grave_CRASH/index.html">🧠 Abrir TCE grave CRASH</a>\n' + hero_button,
            'botão HAA no hero',
        )

    topic_pill = '          <a class="topic-pill yellow" href="#hepatite-alcool">🟠 HAA · Maddrey · MELD · Lille</a>\n'
    if 'HAA · Maddrey · MELD · Lille' not in text:
        text = replace_once(
            text,
            '          <a class="topic-pill red" href="01_Modulos_Clinicos/TCE_Grave_CRASH/index.html">🧠 TCE grave · CRASH</a>\n',
            '          <a class="topic-pill red" href="01_Modulos_Clinicos/TCE_Grave_CRASH/index.html">🧠 TCE grave · CRASH</a>\n' + topic_pill,
            'pílula HAA no hero',
        )

    if HOME_HTML_SENTINEL not in text:
        text = replace_once(
            text,
            '<!-- ── CAMPO TOTAL 4–3–3 ─────────────────────────── -->',
            f'{HOME_SECTION}\n\n<!-- ── CAMPO TOTAL 4–3–3 ─────────────────────────── -->',
            'bloco HAA após o hero',
        )

    if 'data-haa-home-card' not in text:
        text = replace_once(
            text,
            '      <a class="module-card mod-red reveal" href="01_Modulos_Clinicos/TCE_Grave_CRASH/index.html" aria-label="Abrir TCE grave — Protocolo CRASH">',
            HOME_MODULE_CARD + '      <a class="module-card mod-red reveal" href="01_Modulos_Clinicos/TCE_Grave_CRASH/index.html" aria-label="Abrir TCE grave — Protocolo CRASH">',
            'card HAA no elenco de módulos',
        )

    footer_link = '        <a href="01_Modulos_Clinicos/Hepatite_Alcool_Associada/">🟠 Hepatite associada ao álcool · Atlas 360 X</a>\n'
    if 'Hepatite associada ao álcool · Atlas 360 X' not in text:
        text = replace_once(
            text,
            '        <a href="09_POCUS_Hub/index.html">🔊 POCUS Hub</a>\n',
            '        <a href="09_POCUS_Hub/index.html">🔊 POCUS Hub</a>\n' + footer_link,
            'atalho HAA no rodapé',
        )

    return text


def patch_module_html(text: str) -> str:
    text = text.replace(
        'content="Módulo clínico Laranja Mecânica: hepatite associada ao álcool — diagnóstico NIAAA, fisiopatologia, Maddrey, ABIC, Lille, prednisolona e prevenção de complicações."',
        'content="Módulo clínico Laranja Mecânica: hepatite associada ao álcool, critérios NIAAA, fisiopatologia, Atlas Turbo TEMI 360 X, Maddrey, MELD, ABIC, GAHS, Lille e prednisolona."',
        1,
    )
    text = text.replace('href="styles.css"', 'href="styles.css?v=2.1.0"', 1)
    text = text.replace('src="app.js"', 'src="app.js?v=2.1.0"', 1)
    text = text.replace('Publicação educacional · 03/09/2026', 'Versão 2.1 · bloco destacado · 04/09/2026', 1)
    text = text.replace('Versão 1.0 · 03/09/2026', 'Versão 2.1 · 04/09/2026', 1)

    if 'href="#atlas-visual"' not in text:
        text = replace_once(
            text,
            '    <a href="#fisiopatologia">Mecanismo</a>\n',
            '    <a href="#fisiopatologia">Mecanismo</a>\n    <a href="#atlas-visual">Atlas 360 X</a>\n',
            'atalho Atlas na navegação do módulo',
        )

    if MODULE_ENTRY_SENTINEL not in text:
        text = replace_once(
            text,
            '    <section class="panel" id="diagnostico">',
            f'{MODULE_ENTRY}\n\n    <section class="panel" id="diagnostico">',
            'faixa de entrada do módulo',
        )
    return text


def patch_module_js(text: str) -> str:
    text = text.replace(
        "    const physiopathology = byId('fisiopatologia');\n    if (!physiopathology || byId('atlas-visual')) return;",
        "    const entryRail = document.querySelector('[data-haa-module-entry]');\n    const flash = byId('flash');\n    const insertionPoint = entryRail || flash;\n    if (!insertionPoint || byId('atlas-visual')) return;",
        1,
    )
    text = text.replace(
        "    physiopathology.insertAdjacentElement('afterend', section);",
        "    insertionPoint.insertAdjacentElement('afterend', section);",
        1,
    )
    text = text.replace(
        "    const scoresLink = nav?.querySelector('a[href=\"#escores\"]');\n    if (nav && scoresLink && !nav.querySelector('a[href=\"#atlas-visual\"]')) {",
        "    const diagnosisLink = nav?.querySelector('a[href=\"#diagnostico\"]');\n    if (nav && !nav.querySelector('a[href=\"#atlas-visual\"]')) {",
        1,
    )
    text = text.replace(
        "      nav.insertBefore(link, scoresLink);",
        "      nav.insertBefore(link, diagnosisLink || nav.firstChild);",
        1,
    )
    text = text.replace(
        "    if (status) status.textContent = 'Versão 2.0 · Atlas Turbo TEMI 360 X · 03/09/2026';",
        "    if (status) status.textContent = 'Versão 2.1 · Atlas destacado · 04/09/2026';",
        1,
    )

    if 'function honorRequestedAnchor()' not in text:
        insertion = r'''
  function honorRequestedAnchor() {
    const raw = window.location.hash.slice(1);
    if (!raw) return;
    let id = raw;
    try { id = decodeURIComponent(raw); } catch (_) {}
    const target = byId(id);
    if (!target) return;
    window.requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  }

'''
        text = replace_once(text, '  function initialize() {\n', insertion + '  function initialize() {\n', 'rolagem para âncora dinâmica')
        text = text.replace(
            '    bindCalculators();\n  }',
            "    bindCalculators();\n    honorRequestedAnchor();\n    window.addEventListener('hashchange', honorRequestedAnchor);\n  }",
            1,
        )
    return text


def patch_module_css(text: str) -> str:
    if MODULE_CSS_SENTINEL in text:
        return text
    return replace_once(text, '.visual-atlas {', MODULE_ENTRY_CSS + '\n\n.visual-atlas {', 'CSS da faixa de entrada')


def patch_manifest(text: str) -> str:
    data = json.loads(text)
    data['version'] = '2.1.0'
    data['updatedAt'] = '2026-09-04'
    features = data.setdefault('features', [])
    item = 'Bloco destacado na homepage, menu superior, elenco de módulos e rodapé'
    if item not in features:
        features.insert(0, item)
    data.setdefault('visualSeries', {})['placement'] = 'logo após a abertura do módulo, com atalho direto na navegação'
    data.setdefault('reviewGate', {})['reviewedAt'] = '2026-09-04'
    return json.dumps(data, ensure_ascii=False, indent=2) + '\n'


def patch_readme(text: str) -> str:
    text = text.replace('## Versão 2.0', '## Versão 2.1', 1)
    marker = '- Série visual Turbo TEMI 360 X com 10 mapas vetoriais widescreen 16:9.\n'
    addition = '- Bloco destacado na página principal, no menu, no elenco de módulos e no rodapé.\n- Atlas posicionado logo no início do módulo, com âncoras diretas.\n'
    if 'Bloco destacado na página principal' not in text:
        text = replace_once(text, marker, marker + addition, 'README de descoberta')
    return text


def patch_sw(text: str) -> str:
    text, cache_count = re.subn(r'const CACHE_NAME = `\$\{CACHE_PREFIX\}v[^`]+`;', 'const CACHE_NAME = `${CACHE_PREFIX}v29-haa-home`;', text, count=1)
    if cache_count != 1:
        raise RuntimeError('não foi possível localizar CACHE_NAME no service worker')
    if '"./assets/site-analytics.js"' not in text:
        text = replace_once(
            text,
            '  "./assets/aldenirmed89-mystic.css",\n',
            '  "./assets/aldenirmed89-mystic.css",\n  "./assets/site-analytics.css",\n  "./assets/site-analytics.js",\n',
            'assets públicos no cache',
        )
    if '"./01_Modulos_Clinicos/Hepatite_Alcool_Associada/index.html"' not in text:
        marker = '  "./01_Modulos_Clinicos/TCE_Grave_CRASH/index.html",\n'
        haa = (
            '  "./01_Modulos_Clinicos/Hepatite_Alcool_Associada/index.html",\n'
            '  "./01_Modulos_Clinicos/Hepatite_Alcool_Associada/styles.css",\n'
            '  "./01_Modulos_Clinicos/Hepatite_Alcool_Associada/app.js",\n'
            '  "./01_Modulos_Clinicos/Hepatite_Alcool_Associada/module.manifest.json",\n'
        )
        text = replace_once(text, marker, haa + marker, 'módulo HAA no cache aquecido')
    return text


def validate(home: str, module_html: str, module_js: str, module_css: str, manifest: str, sw: str) -> None:
    required_home = [HOME_HTML_SENTINEL, 'id="hepatite-alcool"', 'data-haa-home-card', 'HAA · Maddrey · MELD · Lille']
    required_module = [MODULE_ENTRY_SENTINEL, 'href="#atlas-visual"', 'app.js?v=2.1.0', 'styles.css?v=2.1.0']
    for token in required_home:
        if token not in home:
            raise RuntimeError(f'Homepage sem marcador obrigatório: {token}')
    for token in required_module:
        if token not in module_html:
            raise RuntimeError(f'Módulo sem marcador obrigatório: {token}')
    for token in ["const insertionPoint = entryRail || flash", 'function honorRequestedAnchor()', "Versão 2.1"]:
        if token not in module_js:
            raise RuntimeError(f'JavaScript sem marcador obrigatório: {token}')
    if MODULE_CSS_SENTINEL not in module_css:
        raise RuntimeError('CSS do módulo sem faixa de entrada')
    if 'v29-haa-home' not in sw:
        raise RuntimeError('Service worker sem renovação de cache')
    parsed = json.loads(manifest)
    if parsed.get('version') != '2.1.0':
        raise RuntimeError('Manifesto não está na versão 2.1.0')

    for name, document in [('homepage', home), ('módulo', module_html)]:
        parser = IdCollector()
        parser.feed(document)
        duplicates = sorted({item for item in parser.ids if parser.ids.count(item) > 1})
        if duplicates:
            raise RuntimeError(f'IDs duplicados em {name}: {duplicates}')


def main() -> None:
    changed: list[str] = []
    operations = [
        (HOME, patch_home),
        (MODULE_HTML, patch_module_html),
        (MODULE_JS, patch_module_js),
        (MODULE_CSS, patch_module_css),
        (MODULE_MANIFEST, patch_manifest),
        (MODULE_README, patch_readme),
        (SW, patch_sw),
    ]
    outputs: dict[Path, str] = {}
    for path, patcher in operations:
        outputs[path] = patcher(read(path))

    validate(
        outputs[HOME], outputs[MODULE_HTML], outputs[MODULE_JS], outputs[MODULE_CSS],
        outputs[MODULE_MANIFEST], outputs[SW],
    )

    for path, content in outputs.items():
        if write_if_changed(path, content):
            changed.append(str(path.relative_to(ROOT)))

    if changed:
        print('Arquivos atualizados:')
        for path in changed:
            print(f'- {path}')
    else:
        print('Nenhuma alteração necessária: bloco HAA já está aplicado.')


if __name__ == '__main__':
    main()
