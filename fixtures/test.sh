#!/bin/sh
set -e
cd $(dirname $0)
rm -rf dist
node ../cli.js --outDir dist src
node dist && echo Tests passed || echo Tests failed
