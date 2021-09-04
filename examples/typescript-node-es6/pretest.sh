#!/usr/bin/env bash
set -eu

rm -rf node_modules dist

npm i
[[ ${1:-''} ]] \
  && npm i --no-save typescript@${1} \
  || echo "Using TypeScript $(node_modules/.bin/tsc --version) (change with first argument)"
npm run tsc
