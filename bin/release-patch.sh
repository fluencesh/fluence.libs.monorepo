#!/bin/bash

set -xe

npm run lerna-publish -- "prerelease" "--yes" "-m '[skip ci] chore(alpha): publish %s'"