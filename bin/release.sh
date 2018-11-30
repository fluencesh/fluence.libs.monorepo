#!/bin/bash

set -e

npm run lerna-publish -- "patch"  "--yes" "-m '[skip ci] chore(release): publish %s'"

npm run make-changelog