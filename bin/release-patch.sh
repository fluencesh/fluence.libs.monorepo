#!/bin/bash

set -xe

./test.sh

npm run lerna-publish -- "prerelease" "--yes" "-m '[skip ci] chore(alpha): publish %s'"