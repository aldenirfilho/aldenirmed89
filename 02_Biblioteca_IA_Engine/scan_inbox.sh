#!/bin/bash
# 📥 Scan Biblioteca IA — Gera manifestos por formato, origem e inbox
# Uso: cd 02_Biblioteca_IA_Engine && bash scan_inbox.sh

set -e

python3 scan_biblioteca.py

echo ""
echo "Próximo passo:"
echo "  Revise git diff, valide e publique pela branch de trabalho/PR."
