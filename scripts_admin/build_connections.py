#!/usr/bin/env python3
"""
Atualiza data/connections.json (Mapa Vivo) de forma IDEMPOTENTE e SEGURA.

Objetivo: deixar o caminho feito para atualizações contínuas. Toda vez que
roda (local ou no CI), o script GARANTE que o grafo reflita o conteúdo vivo
do site — sem destruir a curadoria manual já existente.

O que faz:
  • Preserva todos os nós/arestas já curados em connections.json.
  • Garante um hub "home" e os hubs "desafios-hub" e "mnemonicos-hub".
  • Cria/atualiza 1 nó por DESAFIO (de data/desafios.json) e 1 por
    MNEMÔNICO (de data/mnemonicos.json), ligados ao seu hub.
  • Remove apenas os nós AUTO (type 'desafio'/'mnemonico') cujo conteúdo
    deixou de existir — nunca toca em nós de outros tipos.
  • Não define coordenadas: o layout é calculado no navegador (auto-layout
    radial), então adicionar conteúdo nunca exige posicionar nada à mão.

Schema de nó: {id,label,body,type,url,status}. Aresta: {from,to,relation}.
"""

import os
import json
from datetime import datetime

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONN_JSON = os.path.join(ROOT_DIR, "data", "connections.json")
DESAFIOS_JSON = os.path.join(ROOT_DIR, "data", "desafios.json")
MNEM_JSON = os.path.join(ROOT_DIR, "data", "mnemonicos.json")

# Tipos gerenciados automaticamente por este script (podem ser podados).
AUTO_TYPES = {"desafio", "mnemonico"}
CANONICAL_URLS = {
    "05_Biblioteca_IA/index.html": "02_Biblioteca_IA_Engine/index.html",
    "06_Card_Feed_Medico/index.html": "05_Midia_E_Feed/index.html",
    "03_Calculadoras_UTI/index.html": "03_Calculadoras_E_Apps/index.html",
}


def load_json(path, default):
    if not os.path.exists(path):
        return default
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return default


def trim(text, n=180):
    text = " ".join(str(text or "").split())
    return text[: n - 1] + "…" if len(text) > n else text


def ensure_node(index, node):
    """Insere ou atualiza um nó preservando campos curados (x/y/status)."""
    nid = node["id"]
    if nid in index:
        cur = index[nid]
        for key in ("label", "body", "url", "type"):
            if node.get(key):
                cur[key] = node[key]
        cur.setdefault("status", node.get("status", "ativo"))
        return False
    index[nid] = node
    return True


def main():
    print("🕸️  Atualizando Mapa Vivo (data/connections.json)...")

    conn = load_json(CONN_JSON, None)
    if conn is None:
        conn = {
            "updatedAt": "",
            "version": "auto",
            "description": "Mapa vivo da Enciclopédia Médica.",
            "legend": {},
            "nodes": [],
            "edges": [],
            "links": [],
        }

    nodes = conn.get("nodes", [])
    edges = conn.get("edges", [])
    index = {n["id"]: n for n in nodes if n.get("id")}
    for node in index.values():
        if node.get("url") in CANONICAL_URLS:
            node["url"] = CANONICAL_URLS[node["url"]]
    edge_seen = {(e.get("from"), e.get("to"), e.get("relation")) for e in edges}

    def ensure_edge(frm, to, relation):
        key = (frm, to, relation)
        if frm == to or key in edge_seen:
            return
        edge_seen.add(key)
        edges.append({"from": frm, "to": to, "relation": relation})

    # ── Hubs garantidos ────────────────────────────────────────────────
    ensure_node(index, {"id": "home", "label": "🏠 Portal", "type": "hub",
                        "url": "index.html", "status": "ativo",
                        "body": "Página-mãe da Enciclopédia Médica."})
    ensure_node(index, {"id": "desafios-hub", "label": "🏋️ Desafios Clínicos",
                        "type": "module", "url": "desafios/", "status": "ativo",
                        "body": "Casos, questões e raciocínio de plantão (TEMI e R3)."})
    ensure_node(index, {"id": "mnemonicos-hub", "label": "🧩 Mnemônicos",
                        "type": "module", "url": "index.html#mnemonicos", "status": "ativo",
                        "body": "Ferramentas cognitivas de beira-leito."})
    ensure_edge("home", "desafios-hub", "modulo-ativo")
    ensure_edge("home", "mnemonicos-hub", "modulo-ativo")

    # ── Desafios ───────────────────────────────────────────────────────
    desafios = load_json(DESAFIOS_JSON, {"temi": [], "r3": []})
    live_ids = set()
    n_dsf = 0
    for branch in ("temi", "r3"):
        for d in desafios.get(branch, []):
            did = d.get("id")
            if not did:
                continue
            nid = "dsf-" + did
            live_ids.add(nid)
            ensure_node(index, {
                "id": nid,
                "label": (d.get("title") or did)[:48],
                "type": "desafio",
                "url": f"desafios/?b={branch}&id={did}",
                "status": "ativo",
                "body": trim(d.get("excerpt") or d.get("content")),
            })
            ensure_edge("desafios-hub", nid, "desafio")
            # liga ao tema, se houver nó com mesmo nome amigável
            tema = (d.get("tema") or "").strip().lower()
            if tema:
                for cand in index.values():
                    if cand.get("type") == "theme" and tema in str(cand.get("label", "")).lower():
                        ensure_edge(nid, cand["id"], "tema")
                        break
            n_dsf += 1

    # ── Mnemônicos ─────────────────────────────────────────────────────
    mnem = load_json(MNEM_JSON, {"mnemonicos": []})
    n_mnem = 0
    for m in mnem.get("mnemonicos", []):
        mid = m.get("id")
        if not mid:
            continue
        nid = "mnem-" + mid
        live_ids.add(nid)
        emoji = m.get("emoji", "🧩")
        ensure_node(index, {
            "id": nid,
            "label": f"{emoji} {m.get('title', mid)}"[:48],
            "type": "mnemonico",
            "url": "index.html#mnemonicos",
            "status": "ativo",
            "body": trim(m.get("content")),
        })
        ensure_edge("mnemonicos-hub", nid, "mnemonico")
        n_mnem += 1

    # ── Poda de nós AUTO órfãos (conteúdo removido) ────────────────────
    removed = 0
    for nid in list(index.keys()):
        node = index[nid]
        if node.get("type") in AUTO_TYPES and nid not in live_ids:
            del index[nid]
            removed += 1

    # Reconstrói listas mantendo a ordem original quando possível
    ordered_ids = [n["id"] for n in nodes if n.get("id") in index]
    for nid in index:
        if nid not in ordered_ids:
            ordered_ids.append(nid)
    conn["nodes"] = [index[nid] for nid in ordered_ids]
    valid_edges = [e for e in edges
                   if e.get("from") in index and e.get("to") in index]
    deduplicated_edges = []
    seen_edges = set()
    for edge in valid_edges:
        key = json.dumps(edge, ensure_ascii=False, sort_keys=True)
        if key not in seen_edges:
            seen_edges.add(key)
            deduplicated_edges.append(edge)
    conn["edges"] = deduplicated_edges
    conn["updatedAt"] = datetime.now().isoformat(timespec="seconds")

    os.makedirs(os.path.dirname(CONN_JSON), exist_ok=True)
    with open(CONN_JSON, "w", encoding="utf-8") as f:
        json.dump(conn, f, ensure_ascii=False, indent=2)

    print(f"   Desafios: {n_dsf} | Mnemônicos: {n_mnem} | podados: {removed}")
    print(f"✅  Mapa Vivo atualizado — {len(conn['nodes'])} nós, {len(conn['edges'])} arestas.")


if __name__ == "__main__":
    main()
