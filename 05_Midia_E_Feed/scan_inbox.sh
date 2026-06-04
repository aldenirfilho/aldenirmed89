#!/bin/bash
# 📥 Scan Inbox — Gera o manifesto inbox.json a partir das imagens na pasta inbox
# Uso: cd 06_Card_Feed_Medico && bash scan_inbox.sh

INBOX_DIR="assets/cards/inbox"
OUTPUT="data/inbox.json"

# Coleta todos os PNGs e JPGs da pasta inbox
FILES=()
for f in "$INBOX_DIR"/*.png "$INBOX_DIR"/*.jpg "$INBOX_DIR"/*.jpeg "$INBOX_DIR"/*.webp; do
  [ -f "$f" ] && FILES+=("$(basename "$f")")
done

# Gera o JSON
echo "{" > "$OUTPUT"
echo "  \"description\": \"Lista de imagens na pasta inbox para classificação. Gerada pelo script scan_inbox.sh\"," >> "$OUTPUT"
echo "  \"updatedAt\": \"$(date +%Y-%m-%d)\"," >> "$OUTPUT"
echo "  \"files\": [" >> "$OUTPUT"

TOTAL=${#FILES[@]}
for i in "${!FILES[@]}"; do
  COMMA=","
  [ $((i + 1)) -eq "$TOTAL" ] && COMMA=""
  echo "    \"${FILES[$i]}\"$COMMA" >> "$OUTPUT"
done

echo "  ]" >> "$OUTPUT"
echo "}" >> "$OUTPUT"

echo "✅ Escaneado $TOTAL imagem(ns) no inbox."
echo "📄 Manifesto salvo em: $OUTPUT"
echo ""
echo "Próximo passo:"
echo "  git add . && git commit -m 'feat: add inbox images' && git push origin main"
