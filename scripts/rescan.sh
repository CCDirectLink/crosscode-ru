#!/usr/bin/env bash
set -euo pipefail
node tool/dist/headless-scan.js \
  --gameAssetsDir ~/all-crosscode-versions/assets \
  --ccloaderDir ~/crosscode/ccloader3 \
  --outputFile assets/ru-translation-tool/scan.json \
  --includeRuSpecificPatches "$@"
