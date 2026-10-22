#!/usr/bin/env python3
"""Integrate the published Fauna module without duplicating canonical projects.

This maintenance script changes only the listed public navigation files and
refreshes their existing editorial evidence. It never changes gate policy,
conservation data, photographs, donations, credentials or clinical content.
"""
from __future__ import annotations
import argparse
import copy
import hashlib
import json
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
DATE = "2026-10-22"
KEY = "bolsa-ajuda-fauna"
URL = "https://aldenirfilho.github.io/aldenirmed89/apps/bolsa-ajuda-fauna/"
PUBLIC = (
    "ecossistema/data/sites-360x.json", "ecossistema/data/mapa-conexoes.json",
    "ecossistema/data/catalog.json", "ecossistema/assets/app.js",
    "ecossistema/index.html", "ecossistema/mapa.html",
    "apps/bolsa-ajuda-fauna/index.html",
)
REGISTRY = "data/editorial/registry.json"


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def encode(value: object) -> str:
    return json.dumps(value, ensure_ascii=False, indent=2) + "\n"


def replace_once(text: str, old: str, new: str) -> str:
    if new in text:
        return text
    require(text.count(old) == 1, f"Expected one navigation anchor: {old[:90]}")
    return text.replace(old, new, 1)


def insert_fallback(text: str) -> str:
    if URL in text:
        return text
    lines = text.splitlines(keepends=True)
    positions = [i for i, line in enumerate(lines) if '<li><a href="https://aldenirfilho.github.io/atlas-vivo-360x-animais/"' in line]
    require(len(positions) == 1, "Expected one Animalia fallback link")
    i = positions[0]
    indent = lines[i][:len(lines[i]) - len(lines[i].lstrip())]
    lines.insert(i + 1, indent + f'<li><a href="{URL}" target="_blank" rel="noopener noreferrer">Bolsa de Ajuda · Fauna 360° <span aria-hidden="true">↗</span></a></li>\n')
    return "".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--verify-public", action="store_true", help="Verify the already published destination before adding it")
    args = parser.parse_args()
    require(args.verify_public, "Run with --verify-public; the directory requires evidence of public availability")
    request = Request(URL, headers={"User-Agent": "Fauna360X-NavigationValidation/1.0"})
    with urlopen(request, timeout=30) as response:
        require(response.status == 200 and response.geturl().startswith(URL), "Public destination did not return the expected HTTP 200 page")
        live = response.read(1000000).decode("utf-8")
        require("Fauna 360" in live and 'id="instituicoes"' in live, "Destination is not the expected public Fauna module")

    original = {path: (ROOT / path).read_text(encoding="utf-8") for path in (*PUBLIC, REGISTRY)}
    pending = dict(original)
    directory = json.loads(original[PUBLIC[0]])
    require(not any(p["id"] == KEY for p in directory["projects"]), "Fauna is already integrated; no duplicate entry will be created")
    animalia = next(p for p in directory["projects"] if p["id"] == "atlas-animais")
    entry = {
        "id": KEY, "title": "Bolsa de Ajuda · Fauna 360°",
        "description": "Animais ameaçados, fotografias reais, habitats, causas do risco e ações de conservação. Conheça instituições e seus canais oficiais para contribuir, com atenção ao Brasil e ao Ceará.",
        "category": "Ciência e natureza", "url": URL,
        "image": animalia["image"],
        "imageAlt": "Ilustração editorial de biodiversidade. O site Fauna 360° apresenta fotografias reais com créditos individuais.",
        "imageType": "illustration", "imageCredit": animalia["imageCredit"],
        "imageLicense": animalia["imageLicense"],
        "sources": [
            {"url": URL, "type": "public-project-homepage"},
            {"url": "https://github.com/aldenirfilho/aldenirmed89/tree/main/apps/bolsa-ajuda-fauna", "type": "owner-repository"},
        ],
        "verifiedAt": DATE, "verificationMethod": "anonymous-http-200", "kind": "site",
        "accessNote": "Diretório educativo público. Apoio diretamente às instituições, sem arrecadação ou parceria presumida. Comprovantes e valores de ajuda não integram este site.",
        "canonicalProjectId": "p044-panda-x-fauna", "relatedCanonicalProjectIds": ["p042-bolsa-ajuda-atracao"],
    }
    directory["projects"].insert(directory["projects"].index(animalia) + 1, entry)
    directory["updatedAt"] = DATE
    pending[PUBLIC[0]] = encode(directory)

    graph = json.loads(original[PUBLIC[1]])
    graph["labels"][KEY] = {"short": "Fauna 360°", "title": entry["title"], "subtitle": "Conservação e formas de ajudar"}
    for target, label in (
        ("atlas-animais", "Da zoologia à conservação de espécies ameaçadas"),
        ("atlas-plantas", "Habitat, biodiversidade e proteção da vida"),
        ("plano-d", "Solidariedade e caminhos responsáveis de apoio"),
        ("aldenirmed", "Módulo socioambiental do portal AldenirMed89"),
    ):
        graph["connections"].append({"source": KEY, "target": target, "label": label})
    graph["updatedAt"] = DATE
    pending[PUBLIC[1]] = encode(graph)

    catalog = json.loads(original[PUBLIC[2]])
    before_ids = [p["id"] for p in catalog["projects"]]
    fauna = next(p for p in catalog["projects"] if p["id"] == "p044-panda-x-fauna")
    support = next(p for p in catalog["projects"] if p["id"] == "p042-bolsa-ajuda-atracao")
    fauna["aliases"] = list(dict.fromkeys([*fauna["aliases"], fauna["name"], "Bolsa de Ajuda — Fauna 360°", "Animais ameaçados", "Instituições de conservação"]))
    fauna.update({
        "name": "Fauna 360° — conservação e Bolsa de Ajuda", "phase": "disponivel",
        "objective": "Conectar educação sobre animais ameaçados a habitats, ameaças e canais institucionais de apoio à conservação.",
        "evidence": "Diretório publicado no AldenirMed89 com 26 fichas de animais, fotografias reais creditadas, fontes, filtros e 10 instituições. Disponibilidade do site não significa impacto de conservação medido nem parceria com as entidades. Panda X permanece uma linha histórica de proposta, sem parceria confirmada.",
        "nextStep": "Revisar periodicamente fontes e canais institucionais, distinguindo disponibilidade do site, contribuição realizada e resultado documentado.",
        "relatedRoots": ["impacto-social"],
        "publicLinks": [{"label": "Explorar animais e fotografias", "url": URL}, {"label": "Instituições e formas de ajudar", "url": URL + "#instituicoes"}],
    })
    fauna["outputs"] = list(dict.fromkeys([*fauna["outputs"], "diretório público de fauna e instituições"]))
    support["evidence"] += " O módulo público Fauna 360° já oferece consulta de animais e canais de conservação; isso não publica a carteira privada de ajudas nem constitui fundo ou edital."
    support["publicLinks"] = [{"label": "Conhecer o módulo público de conservação", "url": URL + "#instituicoes"}]
    catalog["metadata"]["updatedAt"] = DATE
    require(before_ids == [p["id"] for p in catalog["projects"]], "Canonical project identifiers must remain unchanged")
    pending[PUBLIC[2]] = encode(catalog)

    link_block = '''    // Optional public destinations: text-only labels and HTTPS allowlist.
    const publicLinks = asArray(project.publicLinks).filter((entry) => entry && clean(entry.label) && safeSiteUrl(entry.url));
    if (publicLinks.length) {
      const destinations = make("div", null, "hero-actions");
      publicLinks.forEach((entry) => {
        const link = make("a", `${clean(entry.label, 100)} ↗`, "button secondary");
        link.href = safeSiteUrl(entry.url);
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        destinations.append(link);
      });
      body.append(destinations);
    }
'''
    pending[PUBLIC[3]] = replace_once(original[PUBLIC[3]], '    const aliases = asArray(project.aliases).filter(Boolean);', link_block + '    const aliases = asArray(project.aliases).filter(Boolean);')
    pending[PUBLIC[4]] = insert_fallback(original[PUBLIC[4]])
    pending[PUBLIC[4]] = replace_once(pending[PUBLIC[4]], 'src="./assets/app.js"', 'src="./assets/app.js?v=20261022-fauna-ecos"')
    pending[PUBLIC[5]] = insert_fallback(original[PUBLIC[5]])
    pending[PUBLIC[6]] = replace_once(original[PUBLIC[6]], '<a class="portal" href="../../index.html">Portal 360X', '<a class="portal" href="../../ecossistema/index.html#site-bolsa-ajuda-fauna">Ecossistema 360X')
    pending[PUBLIC[6]] = replace_once(pending[PUBLIC[6]], '<a href="../../ecossistema/index.html">Explorar o ecossistema ↗</a>', '<div><a href="../../ecossistema/index.html#site-bolsa-ajuda-fauna">Explorar o ecossistema ↗</a><br><a href="../../ecossistema/mapa.html#projeto=bolsa-ajuda-fauna">Ver conexões no mapa 360X ↗</a><br><a href="../../index.html">AldenirMed89 ↗</a></div>')

    registry = json.loads(original[REGISTRY])
    for path in PUBLIC:
        owners = [item for item in registry["items"] if path in item.get("paths", [])]
        require(len(owners) == 1, f"Expected one existing editorial owner for {path}, found {len(owners)}")
        item = owners[0]
        revision = item.setdefault("navigationRevisions", [])
        if not any(r.get("id") == "fauna-ecossistema-20261022" for r in revision):
            revision.append({"id": "fauna-ecossistema-20261022", "date": DATE,
                "authorization": "Pedido explícito do proprietário: integrar o site ao Ecossistema 360X.",
                "scope": "Navegação, cadastro e conexões editoriais do módulo público Fauna; sem integração da carteira privada, processamento de pagamentos ou alteração de conteúdo clínico.",
                "reviewer": "ChatGPT — revisão técnica assistida por IA; sem alegação de revisão clínica, jurídica ou de conservação humana."})
        source = {"title": "Fauna 360° — módulo público do AldenirMed89", "url": URL, "accessedAt": DATE}
        if not any(s.get("url") == URL for s in item.setdefault("sources", [])):
            item["sources"].append(source)
        item["reviewedAt"] = DATE
        evidence = item.setdefault("assetEvidence", [])
        existing = next((e for e in evidence if e.get("path") == path), None)
        digest = hashlib.sha256(pending[path].encode("utf-8")).hexdigest()
        if existing:
            existing["sha256"] = digest
        else:
            evidence.append({"path": path, "sha256": digest})
    pending[REGISTRY] = encode(registry)
    for path, content in pending.items():
        require((ROOT / path).read_text(encoding="utf-8") == original[path], f"Concurrent local change: {path}")
        (ROOT / path).write_text(content, encoding="utf-8")
    print(encode({"changed": list(pending), "sites": len(directory["projects"]), "canonicalProjects": len(catalog["projects"]), "status": "integrated", "verifiedDestination": URL}))


if __name__ == "__main__":
    main()
