#!/usr/bin/env bash
set -euo pipefail
export CI=true

EXPECTED=$(cat .nvmrc)
ACTUAL=$(node --version)
if [[ "$ACTUAL" != "v${EXPECTED}"* ]]; then
  echo "ERROR: expected node $EXPECTED, got $ACTUAL" >&2
  exit 1
fi

# Remove generated test artefacts that differ between branches to avoid cross-branch contamination
rm -f test/error/reported.json test/errors/reported.json

npm ci
npm run test
npm run fuzz
npm run lint
npm run test:types
npm run format:check
