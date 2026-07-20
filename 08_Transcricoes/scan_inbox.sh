#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
python3 "$SCRIPT_DIR/../scripts_admin/scan_content_module.py" "$SCRIPT_DIR"
