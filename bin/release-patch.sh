#!/bin/bash

set -xe

dir=`dirname "$0"`

echo 'Executing tests'
$dir/test.sh

echo 'Bumping version'
npm run lerna-publish -- "prerelease" "--yes" "-m '[skip ci] chore(alpha): publish %s'"

echo 'Finished'