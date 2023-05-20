#!/usr/bin/env bash
set -ex
cd `dirname $0`
rm -rf dist
deno run -A ../src/main.ts
node dist && echo Test passed || echo Test failed