#!/bin/bash
set -eu
if [[ ! -d docs ]] ; then
  echo "execute from the root directory!" && exit 1
fi

export PLANTUML_VERSION=1.2021.4

function svg {
  if [[ -f "docs/$1.puml" ]] ; then
    echo "updating docs/$1.svg"
    if [[ -f docs/plantuml.jar ]] ; then
      # for using java, download plantuml.jar into the docs folder from https://plantuml.com/download
      < "docs/$1.puml" java -jar docs/plantuml.jar -pipe -tsvg -nometadata > "docs/$1.svg"
    else
      < "docs/$1.puml" docker run --rm -i karfau/plantuml:$PLANTUML_VERSION -pipe -tsvg -nometadata > "docs/$1.svg"
    fi
  else
    echo "missing file 'docs/$1.puml'"
  fi
}

svg architecture
svg specs
