#!/bin/bash

set -xe

dir=`dirname "$0"`

echo 'Executing tests'
$dir/test.sh

echo 'Bumping version'
npm run lerna-publish -- "patch"  "--yes" "-m '[skip ci] chore(release): publish %s'"

echo 'Generating Changelog'
npm run make-changelog

echo 'Finished'