#!/bin/bash
set -eu
if [[ ! -d docs ]] ; then
  echo "execute from the root directory" && exit 1
fi

export PLANTUML_VERSION=1.2021.4

function svg {
  if [[ -f "docs/$1.puml" ]] ; then
    echo "updating docs/$1.svg"
    < "docs/$1.puml" docker run --rm -i karfau/plantuml:$PLANTUML_VERSION -pipe -tsvg -nometadata > "docs/$1.svg"
  else
    echo "missing file 'docs/$1.puml'"
  fi
}

svg architecture
svg specs
