#!/bin/bash

set -xe

npm run lerna-publish -- "patch"  "--yes" "-m '[skip ci] chore(release): publish %s'"

npm run make-changelog