#!/usr/bin/env python3
"""Render accessible trail cards from canonical IDs, including no-JS links."""
import argparse
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
START = "<!-- TRAILS_360X_START -->"
END = "<!-- TRAILS_360X_END -->"


def render(trails, projects):
    by_id = {project['id']: project for project in projects}
    cards = []
    for trail in trails:
        steps = ''.join(
            f'<li><a href="{html.escape(by_id[step["projectId"]]["url"], quote=True)}" target="_blank" rel="noopener noreferrer">{html.escape(by_id[step["projectId"]]["title"])} <span aria-hidden="true">↗</span></a></li>'
            for step in trail['steps']
        )
        cards.append(f'''<article class="trail-card">
<img src="{html.escape(trail['image'], quote=True)}" alt="{html.escape(trail['imageAlt'], quote=True)}" width="1200" height="675" loading="lazy" decoding="async">
<div class="trail-card-body"><h3>{html.escape(trail['title'])}</h3><p>{html.escape(trail['description'])}</p>
<button type="button" data-trail="{html.escape(trail['id'], quote=True)}" aria-pressed="false" aria-controls="trailJourney mapNodes projectList" disabled>Explorar {len(trail['steps'])} etapas <span aria-hidden="true">→</span><span class="sr-only">: {html.escape(trail['title'])}</span></button>
<details><summary>Ver etapas e links diretos</summary><ol>{steps}</ol></details></div></article>''')
    return f'''{START}
    <section id="trilhas" class="trail-section" aria-labelledby="trailTitle">
      <details id="trailChoices" class="trail-browser" open>
        <summary><span id="trailTitle">Um caminho para cada interesse.</span><small>{len(trails)} trilhas · {len(projects)} projetos · explore no seu ritmo</small></summary>
        <div class="trail-grid">{''.join(cards)}</div>
      </details>
      <p id="trailMessage" class="trail-message">Escolha uma trilha ou explore livremente o mapa. Cada cartão também oferece links diretos.</p>
      <section id="trailJourney" class="trail-journey" aria-labelledby="trailJourneyTitle" hidden>
        <h3 id="trailJourneyTitle" tabindex="-1"></h3>
        <p id="trailJourneyDescription"></p>
        <ol id="trailSteps" class="trail-steps" aria-label="Etapas da trilha"></ol>
        <button id="trailExit" class="reset-button" type="button">Voltar a todos os projetos</button>
      </section>
    </section>
    {END}'''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    projects = json.loads((ROOT / 'ecossistema/data/sites-360x.json').read_text())['projects']
    trails = json.loads((ROOT / 'ecossistema/data/trilhas-360x.json').read_text())['trails']
    path = ROOT / 'ecossistema/mapa.html'
    source = path.read_text()
    assert source.count(START) == source.count(END) == 1
    before, tail = source.split(START)
    _, after = tail.split(END)
    result = before + render(trails, projects) + after
    if args.check:
        if source != result:
            raise SystemExit('Trail cards are stale; run scripts_admin/build_360x_trails.py')
        print(f'Trails current: {len(trails)} trails, {len(projects)} project destinations')
    else:
        path.write_text(result)


if __name__ == '__main__':
    main()
