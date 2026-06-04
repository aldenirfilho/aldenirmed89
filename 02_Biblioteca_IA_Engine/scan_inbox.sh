#!/bin/bash
# 📥 Scan Inbox — Gera inbox.json a partir dos arquivos na pasta inbox
# Uso: cd 05_Biblioteca_IA && bash scan_inbox.sh

INBOX_DIR="inbox"
OUTPUT="data/inbox.json"

FILES=()
for f in "$INBOX_DIR"/*.pdf "$INBOX_DIR"/*.docx "$INBOX_DIR"/*.doc "$INBOX_DIR"/*.html "$INBOX_DIR"/*.htm; do
  [ -f "$f" ] && FILES+=("$(basename "$f")")
done

echo "{" > "$OUTPUT"
echo "  \"description\": \"Arquivos no inbox aguardando classificação\"," >> "$OUTPUT"
echo "  \"updatedAt\": \"$(date +%Y-%m-%d)\"," >> "$OUTPUT"
echo "  \"files\": [" >> "$OUTPUT"

TOTAL=${#FILES[@]}
for i in "${!FILES[@]}"; do
  NAME="${FILES[$i]}"
  EXT="${NAME##*.}"
  TIPO="pdf"
  [[ "$EXT" == "docx" || "$EXT" == "doc" ]] && TIPO="word"
  [[ "$EXT" == "html" || "$EXT" == "htm" ]] && TIPO="html"
  
  COMMA=","
  [ $((i + 1)) -eq "$TOTAL" ] && COMMA=""
  
  echo "    {\"filename\": \"$NAME\", \"tipo\": \"$TIPO\"}$COMMA" >> "$OUTPUT"
done

echo "  ]" >> "$OUTPUT"
echo "}" >> "$OUTPUT"

echo "✅ Escaneado $TOTAL arquivo(s) no inbox."
echo "📄 Manifesto salvo em: $OUTPUT"
echo ""
echo "Próximo passo:"
echo "  git add . && git commit -m 'feat: add inbox files' && git push origin main"
