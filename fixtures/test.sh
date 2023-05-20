#!/usr/bin/env bash
set -ex
cd `dirname $0`
deno run -A ../src/main.ts
node dist && echo Test passed || echo Test failed