#!/bin/bash
# Alimentacao continua do Antigravity Consultas.
# Uso:
#   bash scripts_admin/atualizar_tudo.sh          # reindexa e valida
#   bash scripts_admin/atualizar_tudo.sh --check  # apenas valida, sem escrita

set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"
MODE="${1:-}"

echo "Raiz: $ROOT"
echo ""

if [ "$MODE" = "--check" ]; then
  echo "1/4 Validando baseline publico da Biblioteca..."
  python3 scripts_admin/update_library_publication_baseline.py --check
  echo ""
  echo "2/4 Validando previews Word da Biblioteca..."
  python3 scripts_admin/build_library_previews.py --check
  echo ""
  echo "3/4 Validando manifests estaticos..."
  python3 scripts_admin/check_static_manifests.py
  echo ""
  echo "4/4 Validando paths de catalogos..."
  python3 scripts_admin/validar_paths.py --check
  echo ""
  echo "OK: checagem concluida sem escrita."
  exit 0
fi

if [ -n "$MODE" ]; then
  echo "Uso: bash scripts_admin/atualizar_tudo.sh [--check]"
  exit 2
fi

echo "0/4 Desafios + Mnemonicos + Mapa Vivo..."
python3 scripts_admin/build_desafios.py
python3 scripts_admin/build_mnemonicos.py
python3 scripts_admin/build_connections.py
echo ""

echo "1/4 Biblioteca IA..."
if [ -f "02_Biblioteca_IA_Engine/scan_biblioteca.py" ]; then
  (cd 02_Biblioteca_IA_Engine && python3 scan_biblioteca.py)
  python3 scripts_admin/build_library_previews.py
  python3 scripts_admin/build_library_connections.py
else
  echo "Aviso: 02_Biblioteca_IA_Engine/scan_biblioteca.py nao encontrado."
fi
echo ""

echo "2/4 Hubs de conteudo..."
for hub in 04_Ebooks_Intensiva_Clinica 07_Questoes_Comentadas 08_Transcricoes 09_POCUS_Hub; do
  if [ -d "$hub" ]; then
    python3 scripts_admin/scan_content_module.py "$hub"
  else
    echo "Aviso: $hub nao encontrado."
  fi
done
echo ""

echo "3/4 Card Feed..."
if [ -f "05_Midia_E_Feed/scan_inbox.sh" ]; then
  (cd 05_Midia_E_Feed && bash scan_inbox.sh)
else
  echo "Aviso: 05_Midia_E_Feed/scan_inbox.sh nao encontrado."
fi
echo ""

echo "4/4 Validacoes finais..."
python3 scripts_admin/validar_paths.py --fix
python3 scripts_admin/check_static_manifests.py
echo ""

echo "Concluido. Revise git diff, teste localmente e publique pela branch de trabalho."
