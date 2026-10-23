#!/usr/bin/env python3
"""Render the public 360X dashboard from the existing versioned catalogs."""
from __future__ import annotations

import argparse
import html
import json
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://aldenirfilho.github.io/aldenirmed89/"
PHASES = {"ideia": "Ideia", "estruturacao": "Em estruturação", "prototipo": "Protótipo", "revisao": "Em revisão", "disponivel": "Disponível", "validado": "Validado"}
PRIORITIES = {"agora": "Agora", "proximo": "Próximo", "incubando": "Incubando", "pausado": "Pausado"}


def esc(value):
    return html.escape(str(value), quote=True)


def link(label, url):
    parsed = urlsplit(url)
    if parsed.scheme != "https" or not parsed.netloc or parsed.username or parsed.password:
        raise ValueError(f"Unsafe destination: {url}")
    return f'<a href="{esc(url)}" target="_blank" rel="noopener noreferrer">{esc(label)} <span aria-hidden="true">↗</span></a>'


def read(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def render():
    catalog = read("ecossistema/data/catalog.json")
    directory = read("ecossistema/data/sites-360x.json")
    portfolio = read("docs_usuario/PORTFOLIO_GITHUB/repositorios-publicos.json")
    map_data = read("ecossistema/data/mapa-conexoes.json")
    roots, projects, sites, repos = catalog["roots"], catalog["projects"], directory["projects"], portfolio["repositories"]
    date = portfolio["as_of"]
    date_label = "/".join(reversed(date.split("-")))
    parts = []
    for root in roots:
        rows = []
        for project in projects:
            if project["root"] != root["id"]:
                continue
            actions = " ".join(link(entry["label"], entry["url"]) for entry in project.get("publicLinks", []))
            if not actions:
                actions = '<span class="muted">Sem entrega pública específica vinculada.</span>'
            outputs = ", ".join(project["outputs"])
            rows.append(f'''<article class="entry" id="{esc(project['id'])}" data-kind="initiatives" data-root="{esc(root['id'])}">
<div class="eyebrow">{esc(PHASES[project['phase']])} · {esc(PRIORITIES[project['priority']])}</div>
<h3>{esc(project['name'])}</h3><p>{esc(project['objective'])}</p>
<div class="entry-links">{actions}</div><details><summary>Estado e próximo passo</summary>
<p><strong>Estado documental:</strong> {esc(project['evidence'])}</p>
<p><strong>Próximo nanomicropasso:</strong> {esc(project['nextStep'])}</p>
<p><strong>Frutos:</strong> {esc(outputs)}</p></details></article>''')
        parts.append(f'<section class="root-group" data-root-group="{esc(root["id"])}"><h3 class="root-title">{esc(root["icon"])} {esc(root["name"])} <small>{len(rows)} iniciativas</small></h3><p class="root-purpose">{esc(root["purpose"])}</p><div class="grid">{"".join(rows)}</div></section>')
    site_rows = []
    for site in sites:
        repo_sources = [s["url"] for s in site.get("sources", []) if s.get("type") == "owner-repository"]
        actions = link("Abrir " + ("documentação" if site.get("kind") == "documentation" else "site ou módulo"), site["url"])
        actions += " " + " ".join(link("GitHub", url) for url in dict.fromkeys(repo_sources))
        note = site.get("accessNote", "")
        if site.get("verificationMethod") == "source-repository":
            note += " Destino documentado no repositório; resposta HTTP ainda não conferida."
        site_rows.append(f'<article class="entry" id="destino-{esc(site["id"])}" data-kind="sites"><div class="eyebrow">{esc(site["category"])}</div><h3>{esc(site["title"])}</h3><p>{esc(site["description"])}</p><div class="entry-links">{actions}</div><p class="muted">{esc(note)}</p></article>')
    repo_rows = []
    for repo in repos:
        destinations = {s["url"]: s["title"] for s in sites if any(source.get("url", "").rstrip("/") == repo["url"].rstrip("/") for source in s.get("sources", []))}
        if repo.get("homepage"):
            destinations.setdefault(repo["homepage"], "Site informado no GitHub")
        actions = link("Repositório", repo["url"]) + " " + " ".join(link(label, url) for url, label in destinations.items())
        repo_rows.append(f'<article class="entry" data-kind="repositories"><div class="eyebrow">{esc(repo["area"])}</div><h3>{esc(repo["title"])}</h3><p>{esc(repo["purpose"])}</p><p class="muted">{esc(repo["stage"])}</p><div class="entry-links">{actions}</div></article>')
    options = "".join(f'<option value="{esc(r["id"])}">{esc(r["name"])}</option>' for r in roots)
    linked = sum(bool(p.get("publicLinks")) for p in projects)
    main = f'''<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Painel integrado do Projeto 360X: iniciativas, sites, módulos e repositórios públicos organizados por dez raízes.">
<meta name="theme-color" content="#f4f6f5"><title>Painel integrado 360X | AldenirMed89</title>
<link rel="canonical" href="{BASE}ecossistema/painel.html"><link rel="icon" href="../favicon.ico">
<link rel="stylesheet" href="./assets/painel.css"><script src="./assets/painel.js" defer></script></head>
<body><a class="skip" href="#conteudo">Pular para o conteúdo</a>
<header class="top"><a class="brand" href="../index.html">360X <span>AldenirMed89</span></a><nav aria-label="Acessos principais"><a href="./index.html">Catálogo</a><a href="./mapa.html">Mapa visual</a><a href="./agentes-habilidades/">Agentes e habilidades</a><a href="https://github.com/aldenirfilho/aldenirmed89">GitHub</a></nav></header>
<main id="conteudo"><section class="intro"><p class="eyebrow">ECOSSISTEMA 360X · PAINEL INTEGRADO</p>
<h1>Todos os caminhos.<br><span>Uma visão conectada.</span></h1>
<p class="lead">Encontre um projeto, abra sua entrega e veja o próximo passo. Medicina, aprendizagem, natureza, cultura e impacto social pertencem ao mesmo ecossistema.</p>
<p class="muted">Inventário conferido em {esc(date_label)} · Atualização editorial versionada.</p>
<div class="actions"><a class="button" href="#explorar">Explorar projetos</a><a class="button secondary" href="./mapa.html">Ver conexões no mapa</a><a class="button secondary" href="./aplicativos.html">Aplicativos recuperados e downloads</a><a class="button secondary" href="./agentes-habilidades/">Explorar agentes e habilidades</a><a class="button secondary" href="https://github.com/aldenirfilho/aldenirmed89/blob/main/docs_usuario/PORTFOLIO_GITHUB/README.md">Portfólio no GitHub ↗</a></div></section>
<section class="metrics" aria-label="Cobertura do painel"><article><strong>{len(projects)}</strong><span>iniciativas canônicas</span></article><article><strong>{len(roots)}</strong><span>raízes do ecossistema</span></article><article><strong>{len(sites)}</strong><span>sites, módulos e documentação</span></article><article><strong>{len(repos)}</strong><span>repositórios públicos</span></article></section>
<aside class="coverage"><strong>Como ler este painel</strong><p>Uma iniciativa pode reunir vários sites ou módulos. Um repositório contém código e pode ainda não ter um site. {linked} das {len(projects)} iniciativas têm links de navegação ou referências vinculados; as demais conservam seu estado e próximo passo. O mapa registra {len(map_data['connections'])} relações editoriais entre os destinos.</p><p>O inventário dos repositórios públicos foi percorrido até o fim. O catálogo reúne o acervo já recuperado; não representa todos os arquivos ou conversas existentes. Sites com acesso restrito ficam fora desta vitrine. A disponibilidade dos links e a validação dos conteúdos dependem de cada projeto.</p></aside>
<section id="explorar" aria-labelledby="exploreTitle"><h2 id="exploreTitle">Explore o ecossistema</h2>
<form id="panelFilters" role="search"><label>Buscar<input id="panelSearch" type="search" placeholder="Ex.: TEMI, auditoria, plantas…" autocomplete="off"></label>
<label>Exibir<select id="panelKind"><option value="all">Tudo</option><option value="initiatives">Iniciativas ({len(projects)})</option><option value="sites">Sites e módulos ({len(sites)})</option><option value="repositories">GitHub ({len(repos)})</option></select></label>
<label>Raiz das iniciativas<select id="panelRoot"><option value="all">Todas as raízes</option>{options}</select></label><button id="panelClear" type="button">Limpar filtros</button></form>
<p id="panelStatus" role="status" aria-live="polite">{len(projects) + len(sites) + len(repos)} registros para explorar.</p>
<nav class="jump" aria-label="Seções do painel"><a href="#iniciativas">Iniciativas</a><a href="#destinos">Sites e módulos</a><a href="#repositorios">Repositórios</a></nav>
<section class="dataset" id="iniciativas" data-section="initiatives"><h2>Iniciativas · {len(projects)}</h2>{''.join(parts)}</section>
<section class="dataset" id="destinos" data-section="sites"><h2>Sites e módulos · {len(sites)}</h2><p class="section-lead">Destinos de navegação e documentação pública. Cada cartão conserva os limites informados pelo projeto.</p><div class="grid">{''.join(site_rows)}</div></section>
<section class="dataset" id="repositorios" data-section="repositories"><h2>GitHub · {len(repos)} repositórios públicos</h2><p class="section-lead">Código, documentação e histórico. Repositório e aplicação publicada são entregas diferentes.</p><div class="grid">{''.join(repo_rows)}</div></section>
<p id="panelEmpty" hidden>Nenhum resultado. Tente uma busca mais curta ou limpe os filtros.</p></section>
<footer><p>Projeto 360X · Aldenir Rocha de Oliveira Filho</p><p>{link('Portal AldenirMed89', BASE)} · {link('Catálogo canônico', BASE + 'ecossistema/')} · {link('Dados de navegação', BASE + 'ecossistema/data/sites-360x.json')}</p><p>Conteúdo médico educacional, com estado de revisão próprio por módulo. Marcas e obras de terceiros conservam seus respectivos direitos.</p></footer></main></body></html>'''
    return main + "\n"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    target = ROOT / "ecossistema/painel.html"
    content = render()
    if args.check:
        if not target.is_file() or target.read_text(encoding="utf-8") != content:
            raise SystemExit("Painel desatualizado: execute python3 scripts_admin/build_360x_panel.py")
        print("Painel 360X atualizado em relação aos catálogos.")
    else:
        target.write_text(content, encoding="utf-8")
        print("Gerado ecossistema/painel.html")


if __name__ == "__main__":
    main()
