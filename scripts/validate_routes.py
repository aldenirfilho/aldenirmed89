"""
Script de auditoria de rotas e manifests da Enciclopédia Médica.
Verifica a integridade física de todos os arquivos apontados nos manifests do site.
"""

import json
import os
from typing import Dict, List, Tuple


def load_json_file(path: str) -> dict:
    """Carrega um arquivo JSON de forma segura.

    Args:
        path: Caminho do arquivo a ser lido.

    Returns:
        O conteúdo do JSON como dicionário.
    """
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def validate_manifest(manifest: dict, base_dir: str) -> List[Tuple[str, str, bool]]:
    """Valida as rotas apontadas no site_manifest.json.

    Args:
        manifest: Dicionário contendo o site_manifest.
        base_dir: Diretório raiz do projeto.

    Returns:
        Lista de tuplas contendo (nome da rota, caminho, se_existe).
    """
    results: List[Tuple[str, str, bool]] = []

    # 1. Validar Hubs
    hubs = manifest.get("hubs", {})
    for hub_name, hub_path in hubs.items():
        # Ignorar o marcador do mapa vivo se for apenas uma referência que não é arquivo físico direto
        if hub_name == "mapa":
            # mapa aponta para data/connections.json, que existe no disco.
            pass
        full_path = os.path.join(base_dir, hub_path)
        exists = os.path.exists(full_path)
        results.append((f"Hub: {hub_name}", hub_path, exists))

    # 2. Validar Canonical Routes
    canonical_routes = manifest.get("canonicalRoutes", {})
    for route_name, route_path in canonical_routes.items():
        full_path = os.path.join(base_dir, route_path)
        exists = os.path.exists(full_path)
        results.append((f"Rota Canônica: {route_name}", route_path, exists))

    # 3. Validar Legacy Routes
    legacy_routes = manifest.get("legacyRoutes", [])
    for route in legacy_routes:
        from_path = route.get("from", "")
        to_path = route.get("to", "")
        # O to_path deve existir localmente
        full_path = os.path.join(base_dir, to_path)
        exists = os.path.exists(full_path)
        results.append((f"Legada (destino): {from_path} -> {to_path}", to_path, exists))

    # 4. Validar Data Sources
    data_sources = manifest.get("dataSources", {})
    for source_name, source_path in data_sources.items():
        full_path = os.path.join(base_dir, source_path)
        exists = os.path.exists(full_path)
        results.append((f"Fonte de Dados: {source_name}", source_path, exists))

    # 5. Validar Modules
    modules = manifest.get("modules", [])
    for module in modules:
        mod_label = module.get("label", "")
        mod_path = module.get("path", "")
        full_path = os.path.join(base_dir, mod_path)
        exists = os.path.exists(full_path)
        results.append((f"Módulo: {mod_label}", mod_path, exists))

    return results


def validate_aliases(aliases_data: dict, base_dir: str) -> List[Tuple[str, str, bool]]:
    """Valida as rotas e destinos definidos no route_aliases.json.

    Args:
        aliases_data: Dicionário contendo os aliases de rotas.
        base_dir: Diretório raiz do projeto.

    Returns:
        Lista de tuplas contendo (descrição, destino, se_existe).
    """
    results: List[Tuple[str, str, bool]] = []
    aliases = aliases_data.get("aliases", [])

    for alias in aliases:
        from_route = alias.get("from", "")
        to_route = alias.get("to", "")
        note = alias.get("note", "")

        # Verificar se o destino (to) existe localmente
        full_path = os.path.join(base_dir, to_route)
        exists = os.path.exists(full_path)
        results.append((f"Alias '{from_route}' ({note})", to_route, exists))

    return results


def main() -> None:
    """Função principal do script de auditoria."""
    # Obter diretório do script e encontrar a raiz do projeto
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_dir, ".."))

    manifest_path = os.path.join(project_root, "data", "site_manifest.json")
    aliases_path = os.path.join(project_root, "data", "route_aliases.json")

    manifest = load_json_file(manifest_path)
    aliases_data = load_json_file(aliases_path)

    manifest_results = validate_manifest(manifest, project_root)
    aliases_results = validate_aliases(aliases_data, project_root)

    # Agrupar resultados
    all_results = manifest_results + aliases_results
    broken_links = [r for r in all_results if not r[2]]
    valid_links = [r for r in all_results if r[2]]

    # Gerar Relatório em Markdown
    report_path = os.path.join(project_root, "08_Documentacao_Projeto", "RELATORIO_VALIDACAO_ROTAS.md")
    
    # Criar pasta de documentação se não existir
    os.makedirs(os.path.dirname(report_path), exist_ok=True)

    with open(report_path, "w", encoding="utf-8") as f:
        f.write("# 🚦 Relatório de Validação de Rotas e Manifests\n\n")
        f.write(f"**Data da Auditoria:** 2026-06-04  \n")
        f.write(f"**Raiz do Repositório:** `{project_root}`  \n\n")
        
        f.write("## 1. Resumo Geral\n\n")
        f.write("| Métrica | Total |\n")
        f.write("| :--- | :--- |\n")
        f.write(f"| Rotas / Fontes Auditadas | {len(all_results)} |\n")
        f.write(f"| ✅ Links Íntegros | {len(valid_links)} |\n")
        f.write(f"| 🚨 Links Quebrados (404) | {len(broken_links)} |\n\n")

        if broken_links:
            f.write("## 🚨 2. Detalhe de Links Quebrados\n\n")
            f.write("Os seguintes destinos mapeados nos manifests **NÃO** existem no diretório físico:\n\n")
            f.write("| Origem/Descrição | Destino Esperado (Faltante) | Status |\n")
            f.write("| :--- | :--- | :--- |\n")
            for desc, path, _ in broken_links:
                f.write(f"| {desc} | `{path}` | ❌ Faltante (404) |\n")
            f.write("\n")
        else:
            f.write("## 🎉 2. Status de Integridade\n\n")
            f.write("### ✅ Todas as rotas e destinos canônicos mapeados estão presentes no disco local! Nenhuma falha estrutural de 404 foi identificada.\n\n")

        f.write("## 📂 3. Inventário Completo de Rotas Auditadas\n\n")
        f.write("| Elemento Mapeado | Caminho Físico no Repositório | Status no Disco |\n")
        f.write("| :--- | :--- | :--- |\n")
        for desc, path, exists in all_results:
            status_emoji = "✅ OK" if exists else "❌ FALTANTE (404)"
            f.write(f"| {desc} | `{path}` | {status_emoji} |\n")

    print(f"✅ Auditoria concluída! Relatório gerado em: {report_path}")


if __name__ == "__main__":
    main()
