#!/usr/bin/env python3
"""Renderiza o catálogo público de agentes e habilidades 360X em HTML estático.

O JSON é a fonte de conteúdo. Nenhum conector, segredo ou chamada remota é
necessário para gerar ou consultar as fichas. O JavaScript apenas aprimora a
navegação sobre o conteúdo já presente no documento.
"""

from __future__ import annotations

import argparse
from collections import Counter
from datetime import date
from html import escape
import json
from pathlib import Path
import re
from urllib.parse import urlsplit


REPO_ROOT = Path(__file__).resolve().parents[1]
CATALOG_ROOT = REPO_ROOT / "ecossistema" / "agentes-habilidades"

TYPE_LABELS = {
    "habilidade": ("Habilidade", "habilidades"),
    "agente": ("Agente", "agentes"),
    "papel": ("Papel associado", "papéis associados"),
    "prompt": ("Prompt", "prompts"),
    "molde": ("Molde", "moldes"),
    "sistema": ("Sistema", "sistemas"),
    "automacao": ("Rotina documentada", "rotinas documentadas"),
}
STATUS_LABELS = {
    "documentada": "Documentado",
    "especificacao": "Especificação",
    "referencia-historica": "Referência histórica",
}
DEFAULT_CATEGORIES = {
    "clinica": ("Clínica e cuidado", "clinica", "#3d746a"),
    "estudo": ("Estudo e aprendizagem", "estudo", "#7b8b53"),
    "organizacao": ("Organização e memória", "organizacao", "#5e7a6c"),
    "publicacao": ("Publicação e conteúdo", "publicacao", "#99845a"),
    "negocios": ("Produtos e negócios", "negocios", "#a07b48"),
    "criacao": ("Criação e imaginação", "criacao", "#99819c"),
    "auditoria": ("Auditoria e qualidade", "auditoria", "#69828c"),
    "vida": ("Vida e impacto", "vida", "#8f8763"),
    "pesquisa": ("Pesquisa e evidências", "pesquisa", "#507d82"),
    "tecnologia": ("Tecnologia e sistemas", "tecnologia", "#737d98"),
}

ICON_PATHS = {
    "marca": '<circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4M5 5l3 3m8 8 3 3M5 19l3-3M16 8l3-3"/>',
    "arrow": '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    "arrow-up": '<path d="M6 18 18 6M6 6h12v12"/>',
    "chevron": '<path d="m6 9 6 6 6-6"/>',
    "search": '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    "star": '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
    "link": '<path d="m10 14 4-4m-6 5-2 2a4 4 0 0 1-5-5l4-4a4 4 0 0 1 5 0m4 1 2-2a4 4 0 0 1 5 5l-4 4a4 4 0 0 1-5 0" transform="translate(1 -1)"/>',
    "download": '<path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4"/>',
    "print": '<path d="M7 8V3h10v5M7 17H4V9h16v8h-3M7 14h10v7H7z"/><path d="M17 11h.01"/>',
    "reset": '<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/>',
    "clinica": '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3Z"/>',
    "estudo": '<path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1V5Zm9 1v14"/>',
    "organizacao": '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 17h6m-3-3v6"/>',
    "publicacao": '<path d="M7 3h8l4 4v14H5V3h2Zm7 0v5h5M8 12h8M8 16h6"/>',
    "negocios": '<path d="M4 8h16v12H4V8Zm4 0V4h8v4M4 12c5 3 11 3 16 0M10 13v3h4v-3"/>',
    "criacao": '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM19 3v4m-2-2h4"/>',
    "auditoria": '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
    "vida": '<path d="M12 21V10m0 6c-7 0-9-4-9-8 6 0 9 2 9 6m0-3c0-6 4-8 9-8 0 6-3 9-9 9"/>',
    "pesquisa": '<path d="m8 3 5 2-3 8-5-2 3-8ZM4 21h16M12 8a6 6 0 0 1 2 12M3 15h10m-6 0v3m10-4h4"/>',
    "tecnologia": '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/>',
}


def text(value: object) -> str:
    return "" if value is None else str(value)


def esc(value: object) -> str:
    return escape(text(value), quote=True)


def strings(value: object) -> list[str]:
    if isinstance(value, str):
        return [value] if value.strip() else []
    if not isinstance(value, list):
        return []
    return [str(item) for item in value if isinstance(item, (str, int, float)) and str(item).strip()]


def display_date(value: object) -> str:
    raw = text(value)
    if not raw:
        return "Data não informada"
    try:
        return date.fromisoformat(raw[:10]).strftime("%d/%m/%Y")
    except ValueError:
        return raw


def number(value: object) -> str:
    try:
        return f"{int(value):,}".replace(",", ".")
    except (TypeError, ValueError):
        return "0"


def safe_url(value: object) -> str | None:
    raw = text(value).strip()
    if not raw or any(ord(char) < 32 for char in raw):
        return None
    try:
        parsed = urlsplit(raw)
    except ValueError:
        return None
    if parsed.scheme in {"http", "https"} and parsed.netloc and not parsed.username and not parsed.password:
        return raw
    if not parsed.scheme and not raw.startswith("//") and raw.startswith(("./", "../", "#", "/")):
        return raw
    return None


def svg(name: str, extra_class: str = "") -> str:
    name = name if name in ICON_PATHS else "organizacao"
    return f'<svg class="icon {esc(extra_class)}" viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-{name}"></use></svg>'


def sprite() -> str:
    return '<svg class="sprite" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + "".join(
        f'<symbol id="icon-{name}" viewBox="0 0 24 24">{paths}</symbol>' for name, paths in ICON_PATHS.items()
    ) + '</svg>'


def category_map(data: dict, entries: list[dict]) -> dict[str, dict]:
    result: dict[str, dict] = {}
    for raw in data.get("categories", []):
        if not isinstance(raw, dict) or not raw.get("id"):
            continue
        key = text(raw["id"])
        defaults = DEFAULT_CATEGORIES.get(key, (key.replace("-", " ").capitalize(), "organizacao", "#5e7a6c"))
        color = text(raw.get("color"))
        result[key] = {
            "id": key,
            "label": text(raw.get("label") or defaults[0]),
            "icon": key if key in ICON_PATHS else defaults[1],
            "color": color if re.fullmatch(r"#[0-9a-fA-F]{6}", color) else defaults[2],
            "summary": text(raw.get("summary")),
        }
    for entry in entries:
        key = text(entry.get("category") or "organizacao")
        if key not in result:
            default = DEFAULT_CATEGORIES.get(key, (key.replace("-", " ").capitalize(), "organizacao", "#5e7a6c"))
            result[key] = {"id": key, "label": default[0], "icon": default[1], "color": default[2], "summary": ""}
    return result


def render_sources(evidence: object) -> str:
    if isinstance(evidence, dict):
        evidence = [evidence]
    if not isinstance(evidence, list) or not evidence:
        return '<p class="availability-note">Fonte individual não recuperada neste registro.</p>'
    items = []
    for source in evidence:
        if not isinstance(source, dict):
            continue
        title = esc(source.get("title") or "Registro de origem")
        url = safe_url(source.get("url"))
        if url:
            external = ' target="_blank" rel="noopener noreferrer"' if url.startswith(("http://", "https://")) else ""
            title = f'<a href="{esc(url)}"{external}>{title}</a>'
        meta = []
        if source.get("date"):
            meta.append(display_date(source["date"]))
        if source.get("dateMeaning"):
            meta.append(text(source["dateMeaning"]))
        suffix = f'<span class="source-meta">{esc(" · ".join(meta))}</span>' if meta else ""
        items.append(f'<li><span class="source-title">{title}</span>{suffix}</li>')
    return '<ul class="sources-list">' + "".join(items) + '</ul>' if items else '<p class="availability-note">Fonte individual não recuperada neste registro.</p>'


def render_card(entry: dict, index: int, categories: dict, families: dict, types: dict, by_id: dict) -> str:
    entry_id = text(entry["id"])
    name = text(entry.get("name") or entry_id)
    category_id = text(entry.get("category") or "organizacao")
    category = categories[category_id]
    kind = text(entry.get("type") or "sistema")
    status = text(entry.get("status") or "referencia-historica")
    family_value = text(entry.get("family"))
    family = families.get(family_value, family_value or "Acervo autoral 360X")
    capabilities = strings(entry.get("capabilities"))
    aliases = strings(entry.get("aliases"))
    related = [item for item in strings(entry.get("relatedIds")) if item in by_id and item != entry_id]
    parent_id = text(entry.get("parentId"))
    parent = by_id.get(parent_id)
    parent_html = ''
    if parent:
        parent_html = f'<p class="parent-link">Integra <a href="#{esc(parent_id)}">{esc(parent.get("name") or parent_id)}</a>.</p>'
    elif parent_id:
        parent_html = f'<p class="parent-link">Vínculo registrado: {esc(entry.get("parentName") or parent_id)}.</p>'
    search = " ".join([name, text(entry.get("description")), category["label"], family,
                       text(entry.get("technicalSlug") or entry.get("technical_slug")),
                       text(entry.get("example")), " ".join(aliases), " ".join(capabilities)])
    details = []
    if capabilities:
        details.append('<section class="detail-section"><h4>O que permite fazer</h4><ul class="capability-list">' +
                       "".join(f'<li>{esc(item)}</li>' for item in capabilities) + '</ul></section>')
    if entry.get("example"):
        details.append(f'<section class="detail-section"><h4>Exemplo de solicitação</h4><p class="example-box">{esc(entry["example"])}</p></section>')
    availability = entry.get("availabilityNote") or entry.get("executionStatus")
    if availability:
        details.append(f'<section class="detail-section"><h4>Disponibilidade documentada</h4><p class="availability-note">{esc(availability)}</p></section>')
    details.append('<section class="detail-section"><h4>Fontes do registro</h4>' + render_sources(entry.get("evidence")) + '</section>')
    identity = []
    technical_slug = entry.get("technicalSlug") or entry.get("technical_slug")
    if technical_slug:
        identity.append(f'<dt>Identificador técnico:</dt><dd>{esc(technical_slug)}</dd>')
    if aliases:
        identity.append(f'<dt>Nomes e aliases:</dt><dd>{esc(" · ".join(aliases))}</dd>')
    if entry.get("firstDocumentedAt"):
        identity.append(f'<dt>Primeiro registro localizado:</dt><dd>{esc(display_date(entry["firstDocumentedAt"]))}</dd>')
    if identity:
        details.append('<section class="detail-section"><h4>Identidade e histórico</h4><dl class="identity-list">' + "".join(identity) + '</dl></section>')
    if related:
        links = "".join(f'<a href="#{esc(item)}">{esc(by_id[item].get("name") or item)}</a>' for item in dict.fromkeys(related))
        details.append('<section class="detail-section"><h4>Conexões no acervo</h4><div class="related-list">' + links + '</div></section>')
    return f'''<article class="entry-card" id="{esc(entry_id)}" data-entry-id="{esc(entry_id)}" data-name="{esc(name)}" data-order="{index}" data-category="{esc(category_id)}" data-type="{esc(kind)}" data-status="{esc(status)}" data-search="{esc(search)}" style="--area-color:{esc(category['color'])}" aria-labelledby="title-{esc(entry_id)}">
  <div class="card-topline" aria-hidden="true"></div>
  <div class="card-main">
    <div class="card-meta"><span class="card-family">{esc(family)}</span><div class="card-utilities"><button class="favorite-button js-only" type="button" data-favorite aria-pressed="false" aria-label="Adicionar {esc(name)} aos favoritos">{svg('star')}</button><a class="card-link" href="#{esc(entry_id)}" aria-label="Link direto para {esc(name)}" title="Link direto desta ficha">{svg('link')}</a></div></div>
    <div class="card-title-row"><span class="card-icon">{svg(category['icon'])}</span><h3 class="card-title" id="title-{esc(entry_id)}"><a href="#{esc(entry_id)}">{esc(name)}</a></h3></div>
    <div class="card-tags"><span class="tag tag-type">{esc(types.get(kind, (kind.capitalize(), kind))[0])}</span><span class="tag">{esc(category['label'])}</span><span class="tag tag-status status-{esc(status)}"><span class="status-dot" aria-hidden="true"></span>{esc(STATUS_LABELS.get(status, status.capitalize()))}</span></div>
    <p class="card-description">{esc(entry.get('description') or 'Descrição ainda não recuperada neste registro.')}</p>
    {parent_html}
  </div>
  <details class="entry-details"><summary>Ver capacidades e fontes {svg('chevron')}</summary><div class="detail-body">{''.join(details)}</div></details>
</article>'''


def render(data: dict) -> str:
    if not isinstance(data, dict):
        raise ValueError("O catálogo deve ser um objeto JSON.")
    entries = data.get("entries")
    if not isinstance(entries, list) or not entries:
        raise ValueError("O catálogo precisa conter uma lista não vazia em entries.")
    by_id = {}
    for entry in entries:
        if not isinstance(entry, dict) or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.:-]*", text(entry.get("id"))):
            raise ValueError("Cada ficha precisa de um id seguro e estável (letras, números, ponto, hífen, dois-pontos ou sublinhado).")
        if entry["id"] in by_id:
            raise ValueError(f"Identificador repetido: {entry['id']}")
        by_id[entry["id"]] = entry
    metadata = data.get("metadata") or {}
    coverage = data.get("coverage") or {}
    categories = category_map(data, entries)
    families = {text(f["id"]): text(f.get("name") or f["id"]) for f in data.get("families", []) if isinstance(f, dict) and f.get("id")}
    types = dict(TYPE_LABELS)
    for item in data.get("types", []):
        if isinstance(item, dict) and item.get("id"):
            types[text(item["id"])] = (text(item.get("label") or item["id"]), text(item.get("plural") or item.get("label") or item["id"]))
    type_counts = Counter(text(entry.get("type") or "sistema") for entry in entries)
    category_counts = Counter(text(entry.get("category") or "organizacao") for entry in entries)
    status_counts = Counter(text(entry.get("status") or "referencia-historica") for entry in entries)
    author = text(metadata.get("author") or "Aldenir Rocha")
    verified_at = display_date(metadata.get("verifiedAt"))
    period = metadata.get("period") or {}
    period_text = (f"{display_date(period['start'])} a {display_date(period['end'])}"
                   if period.get("start") and period.get("end") else "Registros de 2026")
    coverage_note = text(metadata.get("coverageNote") or "O catálogo reúne as fontes acessíveis e os registros localizados. A cobertura de todas as conversas e criações do período não pode ser garantida.")
    secondary_counts = " · ".join(f"{number(type_counts[kind])} {types[kind][1]}" for kind in ("prompt", "molde", "sistema", "automacao") if type_counts[kind])
    extra_note = f"Inclui também {secondary_counts}." if secondary_counts else "Habilidades e papéis são apresentados em contagens separadas."
    title = text(metadata.get("title") or "Agentes & habilidades — Catálogo autoral 360X · 2026")

    stats = [
        (len(entries), "Itens catalogados", "Todo o acervo desta edição"),
        (type_counts["habilidade"], "Habilidades", "Métodos reutilizáveis"),
        (type_counts["agente"], "Agentes", "Definições registradas"),
        (type_counts["papel"], "Papéis associados", "Funções dentro dos sistemas"),
    ]
    stats_html = "".join(f'<div class="stat"><span class="stat-value">{number(value)}</span><span class="stat-label">{esc(label)}</span><span class="stat-detail">{esc(note)}</span></div>' for value, label, note in stats)
    areas_html = "".join(
        f'<a class="area-tile" href="#catalogo" data-category-filter="{esc(key)}" style="--area-color:{esc(item["color"])}" title="{esc(item["summary"] or item["label"])}"><span class="area-icon">{svg(item["icon"])}</span><span><span class="area-title">{esc(item["label"])}</span><span class="area-count">{number(category_counts[key])} registros</span></span>{svg("arrow", "area-arrow")}</a>'
        for key, item in categories.items() if category_counts[key]
    )
    category_options = "".join(f'<option value="{esc(key)}">{esc(item["label"])} ({number(category_counts[key])})</option>' for key, item in categories.items() if category_counts[key])
    type_options = "".join(f'<option value="{esc(key)}">{esc(types.get(key, (key.capitalize(), key))[0])} ({number(count)})</option>' for key, count in type_counts.items())
    status_options = "".join(f'<option value="{esc(key)}">{esc(label)} ({number(status_counts[key])})</option>' for key, label in STATUS_LABELS.items() if status_counts[key])
    cards_html = "\n".join(render_card(entry, index, categories, families, types, by_id) for index, entry in enumerate(entries))
    source_counts = []
    for key, label in (("reviewedSkillCount", "habilidades disponíveis conferidas"), ("repositoryFileCount", "caminhos de arquivos inventariados no repositório"), ("librarySourceCount", "fontes do acervo consultadas"), ("packageCount", "pacotes examinados"), ("automationConfigurationsRead", "configurações de rotinas consultadas")):
        if key in coverage:
            source_counts.append(f"{number(coverage[key])} {label}")
    source_counts_html = "<br>".join(esc(item) for item in source_counts) or "Escopo descrito nas fontes de cada ficha."

    return f'''<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Catálogo autoral de agentes, habilidades e métodos desenvolvidos por Aldenir Rocha com colaboração de IA: descrições, capacidades, relações e fontes verificadas.">
  <meta name="theme-color" content="#183e3d">
  <link rel="canonical" href="https://aldenirfilho.github.io/aldenirmed89/ecossistema/agentes-habilidades/">
  <meta property="og:title" content="Agentes &amp; habilidades · Acervo autoral 360X">
  <meta property="og:description" content="Conheça os métodos, agentes e habilidades de Aldenir Rocha, com descrições, exemplos e fontes.">
  <meta property="og:image" content="https://aldenirfilho.github.io/aldenirmed89/ecossistema/agentes-habilidades/assets/hero.webp">
  <meta property="og:type" content="website">
  <title>{esc(title)}</title>
  <link rel="stylesheet" href="./assets/styles.css">
  <script src="./assets/app.js" defer></script>
</head>
<body>
{sprite()}
<a class="skip-link" href="#catalogo">Ir para o catálogo</a>
<header class="site-header"><div class="wrap header-inner">
  <a class="brand" href="../painel.html" aria-label="360X — voltar ao painel"><span class="brand-mark">{svg('marca')}</span><span><strong>360X</strong><small>Acervo de criação</small></span></a>
  <nav class="header-nav" aria-label="Navegação principal"><a href="../painel.html">Ecossistema</a><a class="optional-nav" href="../mapa.html">Mapa de conexões</a><a class="nav-home" href="../../index.html">AldenirMed {svg('arrow-up')}</a><span class="edition-mark">Edição 2026</span></nav>
</div></header>
<main data-agent-catalog>
  <section class="hero wrap" aria-labelledby="page-title">
    <p class="eyebrow">Catálogo autoral · Inteligência aplicada</p>
    <div class="hero-grid"><div class="hero-copy">
      <h1 id="page-title"><span>Agentes <em>&amp;</em></span><span>habilidades</span></h1>
      <p class="hero-subtitle">Um ano de ideias que ganharam método.</p>
      <p class="hero-intro">Conheça as ferramentas de pensamento, os métodos e os papéis criados para pesquisar, aprender, organizar e transformar conhecimento em projetos.</p>
      <div class="hero-actions"><a class="button button-primary" href="#catalogo">Explorar o catálogo {svg('arrow')}</a><a class="button button-link" href="#sobre">Sobre esta edição</a></div>
      <p class="author-line"><strong>Criação e direção: {esc(author)}</strong><span class="author-dot" aria-hidden="true"></span><span>GPT como colaboração de IA</span></p>
    </div><figure class="hero-figure">
      <div class="hero-art"><img src="./assets/hero.webp" alt="Ilustração editorial de um acervo vivo de conhecimento, com livros, estruturas conectadas e elementos de criação." width="1672" height="941" fetchpriority="high"></div>
      <div class="art-seal" aria-hidden="true"><span>2026</span><small>Acervo autoral</small></div>
      <figcaption class="figure-caption"><span>Do primeiro insight ao método reutilizável.</span><span class="caption-number">01 / ACERVO</span></figcaption>
    </figure></div>
  </section>

  <section class="wrap" aria-label="Dimensão do catálogo"><div class="stats-section"><div class="stats">{stats_html}</div></div><div class="scope-line"><span>{esc(extra_note)}</span><span>Verificação: <strong>{esc(verified_at)}</strong></span></div></section>

  <section class="areas wrap" aria-labelledby="areas-title"><div class="section-intro"><div><p class="section-kicker">Diferentes caminhos, um acervo</p><h2 class="section-title" id="areas-title">Explore por área</h2></div><p class="section-note">Da pesquisa clínica à criação de novos universos, cada área reúne métodos com um propósito definido.</p></div><div class="area-grid">{areas_html}</div></section>

  <section class="catalog-section wrap" id="catalogo" aria-labelledby="catalog-title"><div class="catalog-heading"><div class="section-intro"><div><p class="section-kicker">Conheça cada criação</p><h2 class="section-title" id="catalog-title">A coleção, em detalhe</h2></div><div class="catalog-actions"><button class="button js-only" type="button" data-print>{svg('print')} Imprimir</button><a class="button" href="./data/catalogo.json" download>{svg('download')} Dados JSON</a><a class="button" href="./downloads/Catalogo_Agentes_Habilidades_360X_2026.html" download>{svg('download')} Catálogo HTML</a></div></div></div>
    <div class="catalog-tools js-only-block" role="search" aria-label="Pesquisar e filtrar o catálogo"><div class="filter-grid">
      <div class="filter-field search-field"><label for="catalog-search">BUSCAR NO ACERVO</label><div class="search-wrap">{svg('search')}<input id="catalog-search" type="search" placeholder="Nome, função, habilidade ou palavra-chave…" autocomplete="off" aria-controls="catalog-grid"></div></div>
      <div class="filter-field"><label for="filter-category">ÁREA</label><select id="filter-category" aria-controls="catalog-grid"><option value="">Todas as áreas</option>{category_options}</select></div>
      <div class="filter-field"><label for="filter-type">TIPO</label><select id="filter-type" aria-controls="catalog-grid"><option value="">Todos os tipos</option>{type_options}</select></div>
      <div class="filter-field"><label for="filter-status">ESTADO DO REGISTRO</label><select id="filter-status" aria-controls="catalog-grid"><option value="">Todos os estados</option>{status_options}</select></div>
    </div><div class="filter-bottom"><div class="filter-toggles"><button class="filter-button" id="filter-favorites" type="button" aria-pressed="false" aria-controls="catalog-grid">{svg('star')} Favoritos <span data-favorite-count>0</span></button><button class="filter-button clear-filters" type="button" data-clear-filters>{svg('reset')} Limpar filtros</button></div><div class="sort-control"><label for="sort-order">Ordenar por</label><select id="sort-order" aria-controls="catalog-grid"><option value="catalogo">Ordem do catálogo</option><option value="az">Nome: A–Z</option></select></div></div></div>
    <noscript><p class="no-script-note">Todas as fichas estão disponíveis abaixo. Abra “Ver capacidades e fontes” para ler cada registro; você também pode usar a busca do navegador.</p></noscript>
    <div class="results-bar"><p class="result-count" id="result-count" role="status" aria-live="polite" aria-atomic="true"><strong>{number(len(entries))} itens catalogados</strong></p><p class="result-note" id="favorites-note">Papéis associados integram outros métodos.</p></div>
    <div class="cards-grid" id="catalog-grid">{cards_html}</div>
    <div class="empty-state" id="empty-state" hidden>{svg('search')}<h3>Nenhuma ficha nesta seleção.</h3><p>Experimente uma palavra mais curta ou combine menos filtros. A busca reconhece palavras com ou sem acento.</p><button class="button" type="button" data-clear-filters>Limpar filtros</button></div>
    <div class="pagination js-only-block" id="catalog-pagination" hidden><button class="button" type="button" id="show-more">Mostrar mais 30</button><p class="pagination-note" id="pagination-note"></p></div>
  </section>

  <section class="about-section wrap" id="sobre" aria-labelledby="about-title"><div class="about-grid"><figure><div class="about-image"><img src="./assets/ciencia.webp" alt="Ilustração editorial de pesquisa científica e aprendizagem, com instrumentos, livros e conexões de conhecimento." width="1672" height="941" loading="lazy" decoding="async"></div><figcaption class="figure-caption"><span>Pesquisa, método e cuidado.</span><span class="caption-number">02 / CIÊNCIA</span></figcaption></figure><div class="about-copy"><p class="section-kicker">Memória com contexto</p><h2 class="section-title" id="about-title">Cada ideia tem uma história. Cada método, uma função.</h2><p>Este catálogo aproxima o que foi criado de como pode ser compreendido e reutilizado. As fichas mostram finalidade, capacidades, exemplos e origem, preservando os vínculos entre agentes, habilidades e seus papéis.</p><ol class="principle-list"><li><span class="principle-number">01</span><span><strong>Um propósito claro.</strong> O que cada criação faz e em que contexto pode ajudar.</span></li><li><span class="principle-number">02</span><span><strong>Uma origem verificável.</strong> Fontes e datas acompanham o registro, com os limites do que foi recuperado.</span></li><li><span class="principle-number">03</span><span><strong>Conexões preservadas.</strong> Papéis internos permanecem ligados às habilidades e aos sistemas que integram.</span></li></ol></div></div>
    <div class="creation-strip"><figure><img src="./assets/criacao.webp" alt="Ilustração editorial de criação e imaginação, representando ideias que se transformam em projetos conectados." width="1672" height="941" loading="lazy" decoding="async"></figure><div><p class="section-kicker">03 / Criação</p><p class="serif">Imaginar. Estruturar. Dar continuidade.</p><p class="creation-note">Um registro que ajuda a encontrar o trabalho anterior e reconhecer as próximas possibilidades de cada projeto.</p></div></div>
    <div class="coverage-box"><div><h3>O que esta edição documenta</h3><p class="coverage-counts">Período solicitado: {esc(period_text)}.<br>{source_counts_html}</p></div><p class="coverage-note"><strong>Verificado em {esc(verified_at)}.</strong> {esc(coverage_note)} A data de verificação não substitui a data original de criação.</p></div>
  </section>
</main>
<footer class="site-footer"><div class="wrap"><div class="footer-row"><p class="footer-brand">PROJETO 360X · {esc(author)}<span>Catálogo autoral de agentes e habilidades · Edição 2026</span></p><nav class="footer-links" aria-label="Navegação do rodapé"><a href="../painel.html">Painel 360X</a><a href="../mapa.html">Mapa</a><a href="../../index.html">AldenirMed</a><a href="https://github.com/aldenirfilho/aldenirmed89/tree/main/ecossistema/agentes-habilidades" target="_blank" rel="noopener noreferrer">Repositório GitHub</a><a href="#page-title">Voltar ao início</a></nav></div><p class="footer-note">Documentação não equivale a execução: uma ficha não comprova que o agente esteja instalado, que uma automação esteja ativa ou que seu funcionamento tenha sido testado. Os papéis associados são funções de outros métodos e sistemas. A cobertura global do histórico não é garantida; cada registro informa as evidências recuperadas. Conteúdo autoral organizado com colaboração de IA GPT.</p></div></footer>
</body>
</html>
'''


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data", type=Path, default=CATALOG_ROOT / "data" / "catalogo.json", help="JSON canônico de entrada.")
    parser.add_argument("--output", type=Path, default=CATALOG_ROOT / "index.html", help="HTML de saída.")
    parser.add_argument("--check", action="store_true", help="Valida e renderiza em memória sem gravar HTML.")
    args = parser.parse_args()
    if not args.data.is_file():
        raise SystemExit(f"Fonte ainda não disponível: {args.data}. Nenhum HTML foi gerado.")
    try:
        data = json.loads(args.data.read_text(encoding="utf-8"))
        html = render(data)
    except (ValueError, TypeError, KeyError) as exc:
        raise SystemExit(f"Não foi possível compilar o catálogo: {exc}") from exc
    if args.check:
        print(f"Catálogo válido: {len(data['entries'])} registros; {len(html.encode('utf-8'))} bytes de HTML em memória.")
        return
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(html, encoding="utf-8")
    print(f"Catálogo gerado: {args.output} ({len(data['entries'])} registros).")


if __name__ == "__main__":
    main()
