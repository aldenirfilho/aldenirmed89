#!/bin/bash
# Nome legado preservado para compatibilidade. O scanner nunca publica inbox/.
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
python3 "$SCRIPT_DIR/../scripts_admin/scan_card_feed.py"
