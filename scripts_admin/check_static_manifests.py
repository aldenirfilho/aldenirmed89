#!/usr/bin/env python3
"""
check_static_manifests.py — Validador estático de manifests do Antigravity Consultas
======================================================================================

Valida a integridade dos manifests JSON do projeto sem necessidade de Node/build.
Usa apenas stdlib Python 3.

Uso:
    python3 scripts_admin/check_static_manifests.py

Checa:
    1. JSON válido em todos os manifests principais
    2. Rotas canônicas existem como arquivos reais
    3. Aliases apontam para destinos existentes
    4. Módulos, estações, portais e canais do site_manifest existem
    5. Legacy routes do site_manifest existem (origem e destino)
    6. mainLinks do home-manifest existem
    7. Resumo final com contagem de erros

⚠️ Ferramenta de apoio à decisão — não substitui validação manual.
"""

import json
import os
import sys
import unicodedata

# ── Configuração ──────────────────────────────────────────────────────────

# Diretório raiz do projeto (assume que o script é chamado da raiz ou de scripts_admin/)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)

# Manifests a validar
MANIFESTS = {
    "site_manifest": "data/site_manifest.json",
    "route_aliases": "data/route_aliases.json",
    "home_manifest": "06_Infra_Site_E_Assets/data/home-manifest.json",
    "public_site_manifest": "public_site/data/site_manifest.json",
    "public_route_aliases": "public_site/data/route_aliases.json",
}

# Contadores globais
errors = 0
warnings = 0
checks = 0


def log_ok(msg):
    global checks
    checks += 1
    print(f"  ✅ {msg}")


def log_err(msg):
    global errors, checks
    errors += 1
    checks += 1
    print(f"  ❌ {msg}")


def log_warn(msg):
    global warnings, checks
    warnings += 1
    checks += 1
    print(f"  ⚠️  {msg}")


def path_exists(rel_path):
    """Verifica se um caminho relativo ao PROJECT_ROOT existe (arquivo ou diretório)."""
    full = os.path.join(PROJECT_ROOT, rel_path)
    return os.path.exists(full)


def file_exists(rel_path):
    """Verifica se um arquivo relativo ao PROJECT_ROOT existe."""
    full = os.path.join(PROJECT_ROOT, rel_path)
    return os.path.isfile(full)


def dir_exists(rel_path):
    """Verifica se um diretório relativo ao PROJECT_ROOT existe."""
    full = os.path.join(PROJECT_ROOT, rel_path)
    return os.path.isdir(full)


def load_json(rel_path):
    """Carrega e valida JSON. Retorna (data, None) ou (None, erro)."""
    full = os.path.join(PROJECT_ROOT, rel_path)
    if not os.path.isfile(full):
        return None, f"Arquivo não encontrado: {rel_path}"
    try:
        with open(full, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data, None
    except json.JSONDecodeError as e:
        return None, f"JSON inválido em {rel_path}: {e}"
    except Exception as e:
        return None, f"Erro ao ler {rel_path}: {e}"


def check_unicode_nfc(text, context):
    """Verifica se o texto está em forma NFC (normalizada)."""
    if text != unicodedata.normalize("NFC", text):
        log_warn(f"Unicode não-NFC em {context}: '{text[:60]}...'")
        return False
    return True


# ── Checagem 1: JSON válido em todos os manifests ────────────────────────


def check_json_validity():
    print("\n📋 1. Validação de JSON")
    print("─" * 60)
    for name, path in MANIFESTS.items():
        data, err = load_json(path)
        if err:
            log_err(f"{name} ({path}): {err}")
        else:
            log_ok(f"{name} ({path}): JSON válido")


# ── Checagem 2: Rotas canônicas existem ──────────────────────────────────


def check_canonical_routes():
    print("\n🗺️  2. Rotas canônicas do site_manifest")
    print("─" * 60)
    data, err = load_json(MANIFESTS["site_manifest"])
    if err:
        log_err(f"Não foi possível checar rotas canônicas: {err}")
        return

    routes = data.get("canonicalRoutes", {})
    if not routes:
        log_warn("Nenhuma rota canônica encontrada em site_manifest.json")
        return

    for key, path in routes.items():
        # 'mapa' aponta para JSON, não index.html
        if path_exists(path):
            log_ok(f"{key}: {path}")
        else:
            log_err(f"{key}: {path} → NÃO EXISTE")


# ── Checagem 3: Aliases apontam para destinos existentes ─────────────────


def check_route_aliases():
    print("\n🔀 3. Route aliases")
    print("─" * 60)
    data, err = load_json(MANIFESTS["route_aliases"])
    if err:
        log_err(f"Não foi possível checar aliases: {err}")
        return

    aliases = data.get("aliases", [])
    if not aliases:
        log_warn("Nenhum alias encontrado em route_aliases.json")
        return

    for alias in aliases:
        frm = alias.get("from", "?")
        to = alias.get("to", "?")
        status = alias.get("status", "?")

        # Checar destino
        if path_exists(to):
            log_ok(f"{frm} → {to} ({status})")
        else:
            log_err(f"{frm} → {to} ({status}) → DESTINO NÃO EXISTE")

        # Checar origem (wrapper deve existir para funcionar)
        if frm != to and not path_exists(frm):
            log_warn(f"Wrapper de origem ausente: {frm} (esperado para redirect)")


# ── Checagem 4: Superfícies do site_manifest existem ─────────────────────


def check_content_surfaces():
    print("\n📦 4. Módulos, estações, portais e canais do site_manifest")
    print("─" * 60)
    data, err = load_json(MANIFESTS["site_manifest"])
    if err:
        log_err(f"Não foi possível checar superfícies: {err}")
        return

    groups = (
        ("modules", "módulo"),
        ("stations", "estação"),
        ("portals", "portal"),
        ("channels", "canal"),
    )
    if not any(data.get(key) for key, _ in groups):
        log_warn("Nenhuma superfície encontrada em site_manifest.json")
        return

    ids_seen = set()
    for key, singular in groups:
        entries = data.get(key, [])
        if not entries:
            log_warn(f"Nenhum {singular} encontrado em {key}")
            continue
        for entry in entries:
            entry_id = entry.get("id", "?")
            entry_path = entry.get("path", "?")
            entry_label = entry.get("label", "?")

            if entry_id in ids_seen:
                log_err(f"ID duplicado entre superfícies: {entry_id}")
            ids_seen.add(entry_id)

            if path_exists(entry_path):
                log_ok(f"{singular} {entry_id}: {entry_path} ({entry_label})")
            else:
                log_err(
                    f"{singular} {entry_id}: {entry_path} ({entry_label}) → NÃO EXISTE"
                )


# ── Checagem 5: Legacy routes existem ────────────────────────────────────


def check_legacy_routes():
    print("\n🏚️  5. Legacy routes do site_manifest")
    print("─" * 60)
    data, err = load_json(MANIFESTS["site_manifest"])
    if err:
        log_err(f"Não foi possível checar legacy routes: {err}")
        return

    legacy = data.get("legacyRoutes", [])
    if not legacy:
        log_warn("Nenhuma rota legada encontrada em site_manifest.json")
        return

    for route in legacy:
        frm = route.get("from", "?")
        to = route.get("to", "?")

        # Checar destino canônico
        if path_exists(to):
            log_ok(f"{frm} → {to}")
        else:
            log_err(f"{frm} → {to} → DESTINO CANÔNICO NÃO EXISTE")

        # Checar wrapper/origem
        if path_exists(frm):
            log_ok(f"  Wrapper existe: {frm}")
        else:
            log_warn(f"  Wrapper ausente: {frm}")


# ── Checagem 6: mainLinks do home-manifest existem ───────────────────────


def check_home_manifest():
    print("\n🏠 6. mainLinks do home-manifest")
    print("─" * 60)
    data, err = load_json(MANIFESTS["home_manifest"])
    if err:
        log_err(f"Não foi possível checar home-manifest: {err}")
        return

    links = data.get("mainLinks", [])
    if not links:
        log_warn("Nenhum mainLink encontrado em home-manifest.json")
        return

    for link in links:
        title = link.get("title", "?")
        href = link.get("href", "?")

        if path_exists(href):
            log_ok(f"{title}: {href}")
        else:
            log_err(f"{title}: {href} → NÃO EXISTE")


# ── Checagem 7: Isolamento do espelho legado public_site ────────────────


def check_public_site_consistency():
    print("\n🧊 7. Isolamento raiz canônica vs public_site legado")
    print("─" * 60)

    # Comparar site_manifest
    root_data, root_err = load_json(MANIFESTS["site_manifest"])
    pub_data, pub_err = load_json(MANIFESTS["public_site_manifest"])

    if root_err or pub_err:
        if root_err:
            log_err(f"Raiz: {root_err}")
        if pub_err:
            log_err(f"Public: {pub_err}")
        return

    root_version = root_data.get("version", "?")
    pub_version = pub_data.get("version", "?")

    if root_version == pub_version:
        log_warn(
            "site_manifest legado ainda coincide com a raiz; public_site não é fonte canônica"
        )
    else:
        log_ok(
            f"versões separadas como esperado: raiz={root_version} vs legado={pub_version}"
        )

    root_routes = root_data.get("canonicalRoutes", {})
    pub_routes = pub_data.get("canonicalRoutes", {})

    if root_routes == pub_routes:
        log_warn("canonicalRoutes ainda idênticas; o espelho legado permanece excluído do build")
    else:
        log_ok("canonicalRoutes da raiz evoluem sem reescrever o espelho legado")
        # Mostrar diferenças
        all_keys = set(root_routes.keys()) | set(pub_routes.keys())
        for k in sorted(all_keys):
            rv = root_routes.get(k, "(ausente)")
            pv = pub_routes.get(k, "(ausente)")
            if rv != pv:
                log_warn(f"  legado congelado · {k}: raiz={rv} vs legado={pv}")


# ── Checagem 8: dataSources existem ──────────────────────────────────────


def check_data_sources():
    print("\n💾 8. dataSources do site_manifest")
    print("─" * 60)
    data, err = load_json(MANIFESTS["site_manifest"])
    if err:
        log_err(f"Não foi possível checar dataSources: {err}")
        return

    sources = data.get("dataSources", {})
    if not sources:
        log_warn("Nenhum dataSource encontrado em site_manifest.json")
        return

    for key, path in sources.items():
        if path_exists(path):
            log_ok(f"{key}: {path}")
        else:
            log_err(f"{key}: {path} → NÃO EXISTE")


# ── MAIN ─────────────────────────────────────────────────────────────────


def main():
    print("=" * 60)
    print("🔍 VALIDADOR ESTÁTICO DE MANIFESTS — ANTIGRAVITY CONSULTAS")
    print(f"   Raiz do projeto: {PROJECT_ROOT}")
    print("=" * 60)

    check_json_validity()
    check_canonical_routes()
    check_route_aliases()
    check_content_surfaces()
    check_legacy_routes()
    check_home_manifest()
    check_public_site_consistency()
    check_data_sources()

    # Resumo
    print("\n" + "=" * 60)
    print("📊 RESUMO FINAL")
    print("=" * 60)
    print(f"  Total de checagens: {checks}")
    print(f"  ✅ Passou:    {checks - errors - warnings}")
    print(f"  ❌ Erros:     {errors}")
    print(f"  ⚠️  Avisos:    {warnings}")

    if errors == 0 and warnings == 0:
        print("\n  🎉 TODOS OS MANIFESTS ESTÃO CONSISTENTES!")
    elif errors == 0:
        print(f"\n  ⚠️  {warnings} aviso(s) — revisar manualmente.")
    else:
        print(f"\n  🚨 {errors} erro(s) encontrado(s) — correção necessária!")

    print()
    return 1 if errors > 0 else 0


if __name__ == "__main__":
    sys.exit(main())
