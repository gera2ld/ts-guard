#!/usr/bin/env bash
set -ex
cd `dirname $0`
rm -rf dist
node ../cli.js --outDir dist src
node dist && echo Test passed || echo Test failed