#!/bin/bash
set -xeu

# the script assumes that it's run as part of an npm script
# so $npm_package_ variable are set
# https://docs.npmjs.com/cli/v6/using-npm/scripts#packagejson-vars

# before trying to release a version we want to make sure the changelog has been updated
# well at least the headline needs to be there
grep "## \[$npm_package_version\](" CHANGELOG.md || (echo "CHANGELOG.md is missing content for $npm_package_version! Read docs/RELEASE.md" && exit 1)
