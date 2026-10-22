#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_URL = "https://aldenirfilho.github.io/aldenirmed89/ecossistema/auditoria-religiosa-360/comparativo-interreligioso.html"
DOSSIE_URL = "https://aldenirfilho.github.io/aldenirmed89/ecossistema/auditoria-religiosa-360/dossie-igreja-mormon.html"


def update_text(path: Path, transform) -> bool:
    text = path.read_text(encoding="utf-8")
    updated = transform(text)
    if updated == text:
        return False
    path.write_text(updated, encoding="utf-8")
    return True


def patch_auditoria_index(text: str) -> str:
    if "comparativo-interreligioso.html" in text:
        return text
    marker = '<a href="dossie-igreja-mormon.html">Dossiê Igreja Mórmon</a>'
    if marker in text:
        text = text.replace(marker, marker + '<a href="comparativo-interreligioso.html">Comparativo inter-religioso</a>', 1)
    button = '<a class="btn primary" href="dossie-igreja-mormon.html">Dossiê Igreja Mórmon · patrimônio e simulador</a>'
    if button in text:
        text = text.replace(button, button + '<a class="btn" href="comparativo-interreligioso.html">Cristianismo × judaísmo × islamismo</a>', 1)
    return text


def patch_dossie(text: str) -> str:
    if "comparativo-interreligioso.html" in text:
        return text
    nav_marker = '<a href="#fontes">Fontes</a></nav>'
    if nav_marker in text:
        text = text.replace(nav_marker, '<a href="#fontes">Fontes</a><a href="comparativo-interreligioso.html">Comparativo</a></nav>', 1)
    action_marker = '<a class="button" href="#simulador">Simular impacto social</a>'
    if action_marker in text:
        text = text.replace(action_marker, action_marker + '<a class="button" href="comparativo-interreligioso.html">Comparar tradições</a>', 1)
    return text


def patch_ecossistema_index(text: str) -> str:
    if "comparativo-interreligioso.html" in text:
        return text
    marker = '          <li><a href="auditoria-religiosa-360/dossie-igreja-mormon.html">Dossiê Igreja Mórmon · investimentos e simulador ↗</a></li>'
    addition = marker + '\n          <li><a href="auditoria-religiosa-360/comparativo-interreligioso.html">Comparativo inter-religioso · patrimônio e transparência ↗</a></li>'
    return text.replace(marker, addition, 1) if marker in text else text


def patch_portfolio(text: str) -> str:
    heading = "## Comparativo inter-religioso de patrimônio institucional"
    if heading in text:
        return text
    block = f"""

{heading}

[Comparação documental entre instituições cristãs, judaicas e islâmicas]({PUBLIC_URL}), com entidades jurídicas identificadas, valores datados, perímetros contábeis, gráfico interativo, filtros e base JSON aberta. O módulo não soma a amostra nem atribui patrimônio privado de fiéis às religiões. [Dossiê Igreja SUD]({DOSSIE_URL}) · [Documentação](../COMPARATIVO_INTERRELIGIOSO_PATRIMONIO_360X_2026-10-22.md).
"""
    return text.rstrip() + block + "\n"


def patch_sites_catalog(path: Path) -> bool:
    data = json.loads(path.read_text(encoding="utf-8"))
    projects = data.setdefault("projects", [])
    ids = {p.get("id") for p in projects}
    common = {
        "category": "Cidadania e consumo",
        "image": "./assets/previews/turbo-360x-v1/transparencia.svg",
        "imageType": "illustration",
        "imageCredit": "Ilustração vetorial original produzida para o Ecossistema 360X, sob direção do proprietário.",
        "imageLicense": "Arte original do projeto; marcas e documentos citados conservam seus respectivos direitos.",
        "verifiedAt": "2026-10-22",
        "verificationMethod": "repository-integrated-github-pages",
        "kind": "site",
    }
    changed = False
    if "dossie-igreja-mormon-360x" not in ids:
        projects.append({
            "id": "dossie-igreja-mormon-360x",
            "title": "Dossiê Igreja Mórmon · Auditoria 360X",
            "description": "Patrimônio estimado, Ensign Peak, terras, SEC, projetos sociais, transparência e simulador de impacto.",
            "url": DOSSIE_URL,
            "imageAlt": "Dossiê Igreja Mórmon: patrimônio, transparência e impacto social.",
            "sources": [{"url": DOSSIE_URL, "type": "public-project-homepage"}],
            "accessNote": "Pesquisa documental; estimativas, carteira regulatória e ativos operacionais possuem perímetros distintos.",
            **common,
        })
        changed = True
    if "comparativo-interreligioso-360x" not in ids:
        projects.append({
            "id": "comparativo-interreligioso-360x",
            "title": "Comparativo inter-religioso · Patrimônio 360X",
            "description": "Contraste responsável entre instituições cristãs, judaicas e islâmicas, com valores, datas, limites e dados abertos.",
            "url": PUBLIC_URL,
            "imageAlt": "Comparativo inter-religioso: patrimônio institucional sem estereótipos.",
            "sources": [{"url": PUBLIC_URL, "type": "public-project-homepage"}],
            "accessNote": "Amostra institucional não representa patrimônio mundial das religiões nem riqueza privada dos fiéis.",
            **common,
        })
        changed = True
    if changed:
        data["updatedAt"] = "2026-10-22"
        if isinstance(data.get("visualRevision"), dict):
            data["visualRevision"]["scope"] = "Vitrine editorial do Ecossistema 360X, incluindo os módulos de Auditoria Religiosa e comparação inter-religiosa."
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return changed


def main() -> None:
    changed = []
    targets = [
        (ROOT / "ecossistema/auditoria-religiosa-360/index.html", patch_auditoria_index),
        (ROOT / "ecossistema/auditoria-religiosa-360/dossie-igreja-mormon.html", patch_dossie),
        (ROOT / "ecossistema/index.html", patch_ecossistema_index),
        (ROOT / "docs_usuario/PORTFOLIO_GITHUB/README.md", patch_portfolio),
    ]
    for path, transform in targets:
        if path.exists() and update_text(path, transform):
            changed.append(str(path.relative_to(ROOT)))
    catalog = ROOT / "ecossistema/data/sites-360x.json"
    if catalog.exists() and patch_sites_catalog(catalog):
        changed.append(str(catalog.relative_to(ROOT)))
    print("Arquivos integrados:")
    for item in changed:
        print(f"- {item}")
    if not changed:
        print("- nenhuma alteração necessária")


if __name__ == "__main__":
    main()
