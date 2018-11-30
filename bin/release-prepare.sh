#!/bin/bash

set -xe

setup_npm() {
    printf "//`node -p \"require('url').parse(process.env.NPM_REGISTRY_URL || 'https://registry.npmjs.org').host\"`/:_authToken=${NPM_TOKEN}\nregistry=${NPM_REGISTRY_URL:-https://registry.npmjs.org}\n" >> ~/.npmrc
}

setup_git() {
    git config --global user.email "travis@travis-ci.org"
    git config --global user.name "Travis CI"

    git remote set-url origin https://${GH_TOKEN}@github.com/${TRAVIS_REPO_SLUG}

    git checkout -b $TRAVIS_JOB_ID
}

setup_npm
setup_git
