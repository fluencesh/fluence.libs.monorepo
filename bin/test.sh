#!/bin/bash

set -xe

npm run bootstrap-deps
npm run build
npm run test:ci
npm run test:lint