#!/usr/bin/env python3
"""Build the evidence-based recovered application showcase."""
import argparse
import html
import json
from pathlib import Path
from urllib.parse import urlsplit
ROOT = Path(__file__).resolve().parents[1]
def esc(s): return html.escape(str(s), quote=True)
def anchor(label, url):
    parsed = urlsplit(url)
    if parsed.scheme != 'https' or not parsed.netloc or parsed.username or parsed.password:
        raise ValueError('Invalid public URL')
    return f'<a class="button" href="{esc(url)}" target="_blank" rel="noopener noreferrer">{esc(label)} ↗</a>'
def render():
    data=json.loads((ROOT/'ecossistema/data/aplicativos-recuperados.json').read_text())
    cards=[]
    for a in data['applications']:
        logo=f'<img class="logo" src="{esc(a["icon"])}" alt="Logotipo recuperado de {esc(a["name"])}" width="72" height="72" loading="lazy">' if a.get('icon') else f'<span class="logo initial" aria-label="Identificador provisório, não logotipo oficial">{esc(a["name"][:2].upper())}</span>'
        actions=' '.join(anchor(l['label'],l['url']) for l in a.get('links',[])) or '<p class="pending">Arquivo recuperado para o autor. Download público não disponibilizado.</p>'
        features=''.join(f'<li>{esc(x)}</li>' for x in a['features'])
        steps=''.join(f'<li>{esc(x)}</li>' for x in a['steps'])
        permissions=esc(a.get('permissionNote','Sem declaração de permissões de navegador neste formato; conferir dependências e instruções do pacote antes da execução.'))
        cards.append(f'''<article class="app-card" id="{esc(a['id'])}" data-app data-search="{esc(a['name']+' '+a['type']+' '+a['description'])}">
<header class="card-head">{logo}<div><span class="eyebrow">{esc(a['type'])}</span><h2>{esc(a['name'])}</h2><p class="version">{esc(a['version'])}</p></div></header>
<p class="logo-note">{('Logotipo extraído do pacote recuperado.' if a.get('icon') else 'Identificador tipográfico provisório; logotipo oficial não recuperado.')}</p>
<p class="description">{esc(a['description'])}</p>
<div class="illustration" role="img" aria-label="Esquema ilustrativo: {esc(", ".join(a["visualLabels"]))}"><span>01<br><b>{esc(a["visualLabels"][0])}</b></span><i>→</i><span>02<br><b>{esc(a["visualLabels"][1])}</b></span><i>→</i><span>03<br><b>{esc(a["visualLabels"][2])}</b></span></div><p class="illustration-caption">Esquema ilustrativo dos conceitos do aplicativo. Não é uma captura da interface.</p>
<h3>O que o material descreve</h3><ul>{features}</ul>
<h3>Como começar</h3><ol>{steps}</ol>
<details><summary>Permissões e cuidados</summary><p>{permissions}</p></details>
<p class="notice">{esc(a['caveat'])}</p>
<div class="actions">{actions}</div><p class="evidence">Evidência: {esc(a['evidence'])}</p></article>''')
    return f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Aplicativos recuperados | Ecossistema 360X</title><meta name="description" content="Aplicativos e extensões do Ecossistema 360X: versões recuperadas, funcionalidades documentadas, instalação, permissões e downloads públicos disponíveis."><link rel="canonical" href="https://aldenirfilho.github.io/aldenirmed89/ecossistema/aplicativos.html"><link rel="icon" href="../favicon.ico"><link rel="stylesheet" href="./assets/aplicativos.css"><script defer src="./assets/aplicativos.js"></script></head><body><a class="skip" href="#conteudo">Pular para aplicativos</a><header class="top"><a class="brand" href="./painel.html">360X <span>Biblioteca de aplicativos</span></a><nav aria-label="Navegação"><a href="./painel.html">Painel integrado</a><a href="./index.html">Ecossistema</a><a href="../index.html">AldenirMed89</a></nav></header><main id="conteudo"><section class="hero"><p class="eyebrow">RECUPERAÇÃO DOCUMENTADA · OUTUBRO 2026</p><h1>Seus aplicativos.<br><em>De volta ao mapa.</em></h1><p>Uma biblioteca para entender cada ferramenta, reconhecer sua versão e saber o que está pronto para baixar e o que ainda precisa de revisão.</p><div class="stats"><span><b>{len(data['applications'])}</b> registros recuperados</span><span><b>1</b> ecossistema conectado</span></div></section><aside class="scope"><strong>Versão encontrada não significa versão final ou validada.</strong><p>{esc(data['scope'])} Os aplicativos continuam ligados às iniciativas existentes, sem criar novos projetos canônicos. Os arquivos restritos não são publicados aqui.</p><p>Links públicos ficam nos respectivos cartões. ZIP de código-fonte não é instalador assinado. As funcionalidades abaixo são descrições documentadas, não resultados de testes de uso. Conferência: {esc(data['verifiedAt'])}.</p></aside><div class="searchbar"><label for="app-search">Encontrar aplicativo<input type="search" id="app-search" placeholder="Busque por nome, extensão, estudo…"></label><p id="app-count" aria-live="polite">{len(cards)} registros</p><button type="button" id="clear-search">Limpar</button></div><div class="app-grid">{''.join(cards)}</div><p id="no-results" hidden>Nenhum aplicativo encontrado. Tente outro termo.</p><footer>Ecossistema 360X · <a href="./painel.html">Voltar ao painel integrado</a><p>Preservar o acervo é diferente de homologar software. Não use material experimental com dados sensíveis sem revisão apropriada.</p></footer></main></body></html>\n'''
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args()
    target=ROOT/'ecossistema/aplicativos.html';text=render()
    if args.check:
        if not target.exists() or target.read_text()!=text: raise SystemExit('Showcase desatualizado')
    else: target.write_text(text)
