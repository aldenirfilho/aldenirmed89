#!/usr/bin/env python3
"""Regenerate original, dependency-free SVG covers for the 360X directory.

Uses only catalog titles and hand-authored geometric motifs. No photography,
site captures, anatomical claims, third-party marks, remote fonts or animation.
Existing cover collections are preserved. Run from any directory with --root.
"""
from __future__ import annotations

import argparse
import html
import json
from pathlib import Path


LABELS = {
    "aldenirmed": ("AldenirMed89",),
    "nexus-care": ("Passagem", "de Plantão"),
    "respiracrit": ("RespiraCrit",),
    "respirasense": ("RespiraSense", "ICU"),
    "intensivahub": ("IntensivaHub",),
    "atlas-plantas": ("Atlas Vivo", "Plantas"),
    "atlas-animais": ("Animalia", "360X"),
    "bolsa-ajuda-fauna": ("Bolsa de Ajuda", "Fauna 360°"),
    "atlas-rochas": ("Geo 360X",),
    "tempo": ("Tempo de Viver",),
    "entre-dois-ceus": ("Entre dois céus",),
    "guerreiros-fe": ("Guerreiros de Fé",),
    "dragon-ball": ("Dragon Ball", "Legado Eterno"),
    "atlas-phoenix": ("Atlas Phoenix", "e Piratas"),
    "intuicao": ("Intuição", "Guia Decisional"),
    "life-archive": ("Life Archive", "360"),
    "plano-d": ("PLANO D", "Comunidade"),
    "auditoria": ("Auditoria", "das Coisas"),
    "garagem": ("Garagem 2026", "Revista"),
    "garagem-avaliacoes": ("Garagem 2026", "Avaliações"),
    "nexus-brasil": ("360X Brasil", "Comunidade"),
    "nexus-propostas": ("360X Brasil", "Propostas"),
    "indole": ("Índole 360°",),
    "transparencia": ("Transparência", "360X"),
    "auditoria-evangelica-360": ("Auditoria", "Evangélica Brasil"),
    "dossie-igreja-mormon-360x": ("Dossiê", "Igreja Mórmon"),
    "comparativo-interreligioso-360x": ("Comparativo", "inter-religioso"),
    "smd4": ("SMD-4",),
    "auditoria-uti": ("Auditoria UTI",),
    "riqueza-e-vida": ("Riqueza e Vida",),
    "paradoxos-inexoraveis": ("Paradoxos", "Inexoráveis"),
    "antigravity": ("Antigravity",),
    "dragon-ball-github": ("Dragon Ball", "Edição GitHub"),
    "agentes-habilidades-2026": ("Agentes e", "Habilidades"),
    "ram-espelho-cerebro": ("RAM, espelho", "e cérebro"),
    "clinica-uti": ("Estudar clínica", "e UTI"),
    "ciencia-natureza": ("Ciência", "e natureza"),
    "vida-memoria-decisoes": ("Vida, memória", "e decisões"),
    "cultura-imaginacao": ("Cultura", "e imaginação"),
    "cidadania-propostas": ("Cidadania", "e propostas"),
    "transparencia-escolhas": ("Transparência", "e escolhas"),
}

# Motifs live in a 400 x 400 local coordinate system. They are symbolic,
# not diagrams of clinical, financial or scientific processes.
MOTIFS = {
    "aldenirmed": '<path d="M65 125q70-35 135 0 65-35 135 0v185q-70-35-135 0-65-35-135 0z" fill="var(--pale)"/><path d="M200 125v185M100 175h65m-65 35h65m70-35h65m-65 35h65"/>',
    "nexus-care": '<rect x="65" y="70" width="195" height="235" rx="25" fill="var(--pale)"/><rect x="135" y="120" width="195" height="235" rx="25" fill="var(--paper)"/><path d="M180 175h100m-100 45h100m-100 45h65M75 330l45 25-5-45"/>',
    "respiracrit": '<circle cx="200" cy="205" r="130" fill="var(--pale)"/><path d="M45 215h70q15 0 20-40t25 0 30 20 25-5 25-30 30 0 25 55h60"/><path d="M95 285h210" opacity=".4"/>',
    "respirasense": '<rect x="50" y="95" width="300" height="230" rx="30" fill="var(--pale)"/><path d="M80 200q30-100 60 0t60 0 60 0 60 0M85 275h230M200 95v230"/><circle cx="285" cy="140" r="12" fill="var(--accent)" stroke="none"/>',
    "intensivahub": '<circle cx="200" cy="210" r="55" fill="var(--pale)"/><path d="m200 155 0-70m55 125h80M145 210H65m135 55v70m-40-165-55-55m135 55 55-55m-55 135 55 55m-135-55-55 55"/><g fill="var(--paper)"><circle cx="200" cy="70" r="22"/><circle cx="350" cy="210" r="22"/><circle cx="50" cy="210" r="22"/><circle cx="200" cy="350" r="22"/></g>',
    "atlas-plantas": '<path d="M200 340V110m0 80q-95 5-110-85 100-5 110 85m0 65q95-5 110-95-100-5-110 95" fill="var(--pale)"/><path d="m110 305 90 35 90-35M200 190l-65-50m65 115 65-60"/>',
    "atlas-animais": '<ellipse cx="200" cy="235" rx="120" ry="85" fill="var(--pale)"/><circle cx="200" cy="105" r="28"/><circle cx="110" cy="125" r="25"/><circle cx="290" cy="125" r="25"/><path d="M125 270q75-65 150 0"/>',
    "bolsa-ajuda-fauna": '<path d="M65 215q55-60 135 0 80-60 135 0-35 110-135 125Q100 325 65 215z" fill="var(--pale)"/><path d="M200 340V210m-80 45 80 35 80-35"/><circle cx="155" cy="110" r="17"/><circle cx="200" cy="85" r="19"/><circle cx="245" cy="110" r="17"/>',
    "atlas-rochas": '<path d="m55 300 65-180 120-40 110 220z" fill="var(--pale)"/><path d="m55 300 125-105 170 105M120 120l60 75 60-115m-60 115 35 105M120 120l120-40"/>',
    "tempo": '<circle cx="200" cy="205" r="125" fill="var(--pale)"/><path d="M200 105v100l70 45m-70-170v25m125 100h-25m-100 125v-25M75 205h25"/><path d="M60 320q140 60 280 0"/>',
    "entre-dois-ceus": '<circle cx="285" cy="115" r="35" fill="var(--pale)"/><path d="M45 290q70-85 130 0 70-115 180 0M45 325h310M60 180q100-160 280-70M60 215q115-130 280-60"/><path d="M60 355h280" opacity=".4"/>',
    "guerreiros-fe": '<path d="M80 130q60-35 120 0 60-35 120 0v180q-60-35-120 0-60-35-120 0z" fill="var(--pale)"/><path d="M200 130v180m0-245v35M120 85l15 25m145-25-15 25M105 190h60m70 0h60m-190 45h60m70 0h60"/>',
    "dragon-ball": '<circle cx="200" cy="210" r="125" fill="var(--pale)"/><path d="m200 140 17 45 48 2-38 30 13 47-40-27-40 27 13-47-38-30 48-2z"/><path d="M65 300q-50-100 40-180m190 0q90 80 40 180" opacity=".5"/>',
    "atlas-phoenix": '<path d="M200 335 75 145l125 70 125-70z" fill="var(--pale)"/><path d="m75 145 60-60 65 130 65-130 60 60M135 85l65 250 65-250m-65 130V55"/><circle cx="200" cy="55" r="12" fill="var(--accent)"/>',
    "intuicao": '<path d="M200 335V95m0 165L95 155m105 40 100-95"/><circle cx="95" cy="155" r="35" fill="var(--pale)"/><circle cx="300" cy="100" r="35" fill="var(--pale)"/><circle cx="200" cy="80" r="35" fill="var(--paper)"/><path d="m165 335 35-35 35 35"/>',
    "life-archive": '<rect x="70" y="95" width="240" height="65" rx="14" fill="var(--pale)"/><rect x="90" y="180" width="240" height="65" rx="14" fill="var(--paper)"/><rect x="70" y="265" width="240" height="65" rx="14" fill="var(--pale)"/><path d="M115 125h135m-115 85h135m-155 85h135"/>',
    "plano-d": '<path d="M70 320V150l130-80 130 80v170" fill="var(--pale)"/><path d="M135 320V210h130v110M45 320h310M200 105v55m-30-27h60"/><circle cx="200" cy="250" r="18" fill="var(--paper)"/>',
    "auditoria": '<rect x="60" y="75" width="215" height="245" rx="20" fill="var(--pale)"/><path d="M100 135h130m-130 45h105m-105 45h65"/><circle cx="270" cy="255" r="65" fill="var(--paper)"/><path d="m315 300 45 45"/>',
    "garagem": '<path d="m80 220 40-95h150l55 95v80H80z" fill="var(--pale)"/><path d="M80 220h245M165 125v95m-45 55h30m105 0h30"/><circle cx="125" cy="315" r="25" fill="var(--paper)"/><circle cx="280" cy="315" r="25" fill="var(--paper)"/>',
    "garagem-avaliacoes": '<path d="M65 90h270v200H190l-70 55v-55H65z" fill="var(--pale)"/><path d="m110 190 40 40 100-95M280 155h20m-20 40h20"/>',
    "nexus-brasil": '<circle cx="200" cy="200" r="80" fill="var(--pale)"/><path d="m200 120 0-55m70 95 55-35m-55 115 55 35m-125 5v55m-70-95-55 35m55-115-55-35"/><g fill="var(--paper)"><circle cx="200" cy="50" r="22"/><circle cx="340" cy="115" r="22"/><circle cx="340" cy="285" r="22"/><circle cx="200" cy="350" r="22"/><circle cx="60" cy="285" r="22"/><circle cx="60" cy="115" r="22"/></g>',
    "nexus-propostas": '<path d="M65 325V210h70v115m20 0V155h70v170m20 0V95h70v230" fill="var(--pale)"/><path d="M45 325h300M70 145l90-65 95 5 80-40"/><circle cx="160" cy="80" r="12" fill="var(--paper)"/>',
    "indole": '<path d="M200 65 320 115v100q-10 85-120 130Q90 300 80 215V115z" fill="var(--pale)"/><path d="m140 205 40 40 85-95M120 135l80-30 80 30"/>',
    "transparencia": '<rect x="65" y="75" width="205" height="240" rx="18" fill="var(--pale)"/><rect x="130" y="130" width="205" height="215" rx="18" fill="var(--paper)" fill-opacity=".8"/><path d="M170 185h125m-125 45h100m-100 45h125M100 120h110"/>',
    "auditoria-evangelica-360": '<path d="M65 310h270M95 310V180h50v130m35 0V130h50v180m35 0V80h50v230" fill="var(--pale)"/><circle cx="130" cy="120" r="45" fill="var(--paper)"/><path d="m162 152 32 32m-78-64h28m-14-14v28"/>',
    "dossie-igreja-mormon-360x": '<path d="M70 115h105l30 35h125v175H70z" fill="var(--pale)"/><rect x="115" y="65" width="170" height="220" rx="15" fill="var(--paper)"/><path d="M150 115h100m-100 45h100m-100 45h65M70 325h260"/>',
    "comparativo-interreligioso-360x": '<path d="M70 95h110v230H70zm150 0h110v230H220z" fill="var(--pale)"/><path d="M95 150h60m-60 45h60m90-45h60m-60 45h60M135 260h130m-110-20-20 20 20 20m90-40 20 20-20 20"/>',
    "smd4": '<path d="M70 215h110v110H70zm150 0h110v110H220zM70 75h110v110H70zm150 0h110v110H220z" fill="var(--pale)"/><path d="M125 185v30m150-30v30M180 130h40m-40 140h40"/>',
    "auditoria-uti": '<rect x="60" y="85" width="280" height="245" rx="22" fill="var(--pale)"/><path d="M100 130h200M100 175h200M100 220h200M100 265h200M170 130v135m60-135v135"/><circle cx="290" cy="300" r="35" fill="var(--paper)"/>',
    "riqueza-e-vida": '<path d="M70 325V205h65v120m30 0V135h65v190m30 0V80h65v245" fill="var(--pale)"/><path d="M55 350h290M105 165q95-100 190-115M200 115q-35-75-100-55 10 70 100 55"/>',
    "paradoxos-inexoraveis": '<path d="m75 295 120-210 130 210H75z" fill="var(--pale)"/><path d="m120 265 75-130 80 130H120zm75-130 130 160M75 295l120-30m0-180v180"/>',
    "antigravity": '<circle cx="200" cy="205" r="60" fill="var(--pale)"/><ellipse cx="200" cy="205" rx="150" ry="70" transform="rotate(-28 200 205)"/><ellipse cx="200" cy="205" rx="150" ry="70" transform="rotate(28 200 205)"/><circle cx="75" cy="275" r="14" fill="var(--accent)"/>',
    "dragon-ball-github": '<circle cx="200" cy="205" r="110" fill="var(--pale)"/><path d="m150 175-35 30 35 30m100-60 35 30-35 30m-35-70-30 80M80 310h240"/><circle cx="200" cy="65" r="15" fill="var(--paper)"/>',
    "agentes-habilidades-2026": '<rect x="65" y="80" width="115" height="115" rx="20" fill="var(--pale)"/><rect x="220" y="80" width="115" height="115" rx="20" fill="var(--paper)"/><rect x="145" y="245" width="115" height="115" rx="20" fill="var(--pale)"/><path d="M180 140h40M125 195l50 50m100-50-45 50"/>',
    "ram-espelho-cerebro": '<rect x="55" y="130" width="90" height="145" rx="12" fill="var(--pale)"/><path d="M170 75v260M85 165h30m-30 40h30m-30 40h30m110-45 45-70 75 40-15 90-80 30z"/><g fill="var(--paper)"><circle cx="215" cy="200" r="16"/><circle cx="260" cy="130" r="16"/><circle cx="335" cy="170" r="16"/><circle cx="320" cy="260" r="16"/><circle cx="240" cy="290" r="16"/></g>',
    "clinica-uti": '<path d="M65 145q70-45 135 0 65-45 135 0v175q-70-45-135 0-65-45-135 0z" fill="var(--pale)"/><path d="M200 145v175M85 215h65l20-35 30 65 25-40h90"/><rect x="115" y="65" width="170" height="35" rx="12" fill="var(--paper)"/>',
    "ciencia-natureza": '<path d="M95 325V115m0 80q100-5 115-100-110 0-115 100m0 55q-65-5-75-65 70 0 75 65" fill="var(--pale)"/><path d="m180 325 45-135 80-30 75 165zm45-135 50 60 30-90m-125 165 95-75 105 75"/>',
    "vida-memoria-decisoes": '<circle cx="290" cy="105" r="50" fill="var(--pale)"/><path d="M30 285h340M45 330q130 5 125-100S255 125 350 175"/><g fill="var(--paper)"><circle cx="75" cy="330" r="16"/><circle cx="170" cy="230" r="16"/><circle cx="265" cy="155" r="16"/></g>',
    "cultura-imaginacao": '<path d="M65 315V180q135-180 270 0v135" fill="var(--pale)"/><path d="M110 315V190q90-115 180 0v125M155 315V205q45-55 90 0v110M40 340h320m-20-240 10-25 10 25 25 10-25 10-10 25-10-25-25-10z"/>',
    "cidadania-propostas": '<path d="M45 325h310M70 325V210h70v115m25 0V145h70v180m25 0V80h70v245" fill="var(--pale)"/><path d="m105 140 95-65 95-30"/><g fill="var(--paper)"><circle cx="105" cy="140" r="20"/><circle cx="200" cy="75" r="20"/><circle cx="295" cy="45" r="20"/></g>',
    "transparencia-escolhas": '<rect x="50" y="70" width="205" height="245" rx="20" fill="var(--pale)"/><rect x="120" y="115" width="205" height="220" rx="20" fill="var(--paper)" fill-opacity=".8"/><path d="M155 165h130m-130 45h90m-90 45h75"/><circle cx="285" cy="275" r="65" fill="var(--paper)"/><path d="m330 320 35 35"/>',
}

PALETTES = [
    ("#f1f3ee", "#e0e8df", "#6d8d80"),
    ("#f3f0e9", "#e5dfcf", "#99866d"),
    ("#edf1f3", "#dce5e9", "#738d9a"),
    ("#f3eeee", "#e8dede", "#9a8181"),
    ("#eff2ee", "#dfe6de", "#7b8c74"),
    ("#f0eff3", "#e2e0e8", "#8a849b"),
]


def cover(key: str, title: str, label: str, index: int, trail: bool) -> str:
    paper, pale, accent = PALETTES[index % len(PALETTES)]
    lines = LABELS[key]
    start = 292 if len(lines) == 2 else 325
    text = "\n".join(
        f'<text x="68" y="{start + row * 75}" font-size="64" font-family="Georgia, serif">{html.escape(line)}</text>'
        for row, line in enumerate(lines)
    )
    kind = "TRILHAS TEMÁTICAS" if trail else "PROJETOS EM CONEXÃO"
    description = f"Ilustração geométrica original 360X para {title}. Capa editorial; não é fotografia nem captura do site."
    motif = MOTIFS[key]
    for name, color in (("paper", paper), ("pale", pale), ("accent", accent)):
        motif = motif.replace(f"var(--{name})", color)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675" fill="#263d44" role="img" aria-labelledby="title desc">
  <title id="title">{html.escape(title)}</title>
  <desc id="desc">{html.escape(description)}</desc>
  <rect width="1200" height="675" fill="{paper}"/>
  <path d="M68 120h1064M68 555h1064" stroke="{accent}" stroke-opacity=".3"/>
  <circle cx="930" cy="320" r="205" fill="{pale}" opacity=".45"/>
  <path d="M695 195v275" stroke="{accent}" stroke-opacity=".25"/>
  <text x="68" y="83" font-family="Arial, sans-serif" font-size="19" letter-spacing="3">{html.escape(kind)}</text>
  <text x="68" y="192" font-family="Arial, sans-serif" font-size="18" letter-spacing="1.5">{html.escape(label.upper())}</text>
  {text}
  <path d="M68 442h90" stroke="{accent}" stroke-width="3"/>
  <text x="68" y="492" font-family="Arial, sans-serif" font-size="21">Conhecer. Conectar. Explorar.</text>
  <g fill="none" stroke="{accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" transform="translate(738 126)">{motif}</g>
  <text x="68" y="610" font-family="Arial, sans-serif" font-size="17" letter-spacing="2">ALDENIRMED · UNIVERSO 360X</text>
  <text x="1132" y="614" text-anchor="end" font-family="Georgia, serif" font-size="33">360<tspan font-family="Arial, sans-serif" font-size="23">X</tspan></text>
</svg>
'''


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    root = args.root.resolve()
    projects = json.loads((root / "ecossistema/data/sites-360x.json").read_text())["projects"]
    trails = json.loads((root / "ecossistema/data/trilhas-360x.json").read_text())["trails"]
    for trail, records, folder in [
        (False, projects, "ecossistema/assets/previews/sereno-360x-v1"),
        (True, trails, "ecossistema/assets/trilhas"),
    ]:
        destination = root / folder
        destination.mkdir(parents=True, exist_ok=True)
        for index, record in enumerate(records):
            key = record["id"]
            if key not in MOTIFS or key not in LABELS:
                raise ValueError(f"Missing an original motif or label for {key}")
            label = "Percurso de descobertas" if trail else record["category"]
            (destination / f"{key}.svg").write_text(cover(key, record["title"], label, index, trail), encoding="utf-8")
    print(f"Generated {len(projects)} project covers and {len(trails)} trail covers; originals preserved.")


if __name__ == "__main__":
    main()
