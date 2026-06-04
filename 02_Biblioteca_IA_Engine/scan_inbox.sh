#!/bin/bash
# 📥 Scan Biblioteca IA — Gera manifestos por formato, origem e inbox
# Uso: cd 02_Biblioteca_IA_Engine && bash scan_inbox.sh

set -e

python3 scan_biblioteca.py

echo ""
echo "Próximo passo:"
echo "  git add . && git commit -m 'Atualiza Biblioteca IA por formato e origem' && git push origin main"
