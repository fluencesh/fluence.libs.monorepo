#!/bin/bash

set -xe

npm run test:ci
npm run test:lint
npm run test:sonar