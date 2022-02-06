#!/usr/bin/env bash
set -euo pipefail
CC_ASSETS_DIR="${CC_ASSETS_DIR:-$HOME/all-crosscode-versions/assets}"
scan_db_file=assets/ru-translation-tool/scan.json
crosslocale scan "$CC_ASSETS_DIR" --output "$scan_db_file" --verbose
node tool/dist/synthesize-scan.js --gameAssetsDir "$CC_ASSETS_DIR" --outputFile "$scan_db_file" --prevFile "$scan_db_file"
