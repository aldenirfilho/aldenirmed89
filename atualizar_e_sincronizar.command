#!/bin/bash
# Script de automação para build e sincronização do Antigravity Consultas no Mac.
# Desenvolvido para o Dr. Aldenir Rocha — CRM-CE 16587.

# Garante que o script rode a partir da pasta raiz onde está localizado
cd "$(dirname "$0")"
clear

echo "=========================================================="
echo "🚀 INICIANDO PIPELINE DE ATUALIZAÇÃO DO ANTIGRAVITY"
echo "=========================================================="
echo ""

echo "🏋️  Passo 1/3: Compilando Desafios Clínicos..."
python3 scripts_admin/build_desafios.py
echo ""

echo "📦 Passo 2/3: Reindexando hubs e validando rotas..."
bash scripts_admin/atualizar_tudo.sh
echo ""

echo "🔄 Passo 3/3: Sincronizando com o public_site/..."
python3 scripts_admin/sync_public_site.py
echo ""

echo "=========================================================="
echo "✅ PROCESSOS CONCLUÍDOS COM SUCESSO! 🛡️"
echo "=========================================================="
echo ""
echo "O site no localhost está pronto e atualizado."
echo "Pressione qualquer tecla para fechar esta janela."
read -n 1 -s -r
