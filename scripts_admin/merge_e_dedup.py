import json
import glob
import os

print("🚀 Iniciando Deduplicação e Merge do Mapa Vivo...")

# --- 1. Deduplicação e Merge do topics.json ---
topics_path = "data/topics.json"
try:
    with open(topics_path, 'r', encoding='utf-8') as f:
        topics = json.load(f)
except Exception as e:
    print(f"⚠️ Erro ao ler {topics_path}: {e}")
    topics = {}

patch_files_topics = glob.glob("data/_aplicados/topics_patch_*.json")
for pfile in patch_files_topics:
    try:
        with open(pfile, 'r', encoding='utf-8') as f:
            patch = json.load(f)
            topics.update(patch) # sobrepõe / mescla topicos
    except Exception as e:
        print(f"⚠️ Erro no patch de topics {pfile}: {e}")

with open(topics_path, 'w', encoding='utf-8') as f:
    json.dump(topics, f, indent=2, ensure_ascii=False)
print("✅ topics.json deduplicado e consolidado.")

# --- 2. Deduplicação e Merge do connections.json ---
conn_path = "data/connections.json"
try:
    with open(conn_path, 'r', encoding='utf-8') as f:
        connections = json.load(f)
except Exception as e:
    print(f"⚠️ Erro ao ler {conn_path}: {e}")
    connections = {"nodes": [], "links": []}

# Função auxiliar para mesclar dicionários de connections
def merge_connections_data(base, novos):
    # Processa os Nós (nodes)
    nodes_dict = {}
    for node in base.get("nodes", []):
        nodes_dict[node["id"]] = node
        
    for node in novos.get("nodes", []):
        # Se o nó já existir, apenas sobrepõe os dados, evitando duplicatas
        nodes_dict[node["id"]] = node

    base["nodes"] = list(nodes_dict.values())
    
    # Processa as Arestas (links)
    links_seen = set()
    unique_links = []
    
    # Links base
    for link in base.get("links", []):
        sig = f"{link['source']}->{link['target']}"
        if sig not in links_seen:
            unique_links.append(link)
            links_seen.add(sig)
            
    # Links dos patches
    for link in novos.get("links", []):
        sig = f"{link['source']}->{link['target']}"
        if sig not in links_seen:
            unique_links.append(link)
            links_seen.add(sig)
            
    base["links"] = unique_links

# Primeiro passo: Deduplica o base
merge_connections_data(connections, {"nodes": connections.get("nodes", []), "links": connections.get("links", [])})

# Segundo passo: Mescla os Patches que movemos
patch_files_conn = glob.glob("data/_aplicados/patch_*.json") + glob.glob("data/_aplicados/connections_patch_*.json")
for pfile in patch_files_conn:
    try:
        with open(pfile, 'r', encoding='utf-8') as f:
            patch = json.load(f)
            merge_connections_data(connections, patch)
    except Exception as e:
        print(f"⚠️ Erro no patch {pfile}: {e}")

with open(conn_path, 'w', encoding='utf-8') as f:
    json.dump(connections, f, indent=2, ensure_ascii=False)

print("✅ connections.json deduplicado e consolidado.")
print("🔥 Script concluído com sucesso!")
