#!/usr/bin/env -S deno run -A

import { assert } from "https://deno.land/std@0.188.0/testing/asserts.ts";
import { build, emptyDir } from "https://deno.land/x/dnt@0.35.0/mod.ts";

const p = new Deno.Command("./fixtures/test.sh").spawn();
const status = await p.status;
assert(status.success);

await emptyDir("./npm");

await build({
  entryPoints: ["src/ts-guard.ts", {
    kind: "bin",
    name: "ts-guard",
    path: "src/main.ts",
  }],
  outDir: "./npm",
  shims: {
    deno: true,
  },
  package: {
    name: "@gera2ld/ts-guard",
    version: Deno.env.get("VERSION") || "0.0.0",
    description: "Guard your object with TypeScript declarations",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/gera2ld/ts-guard.git",
    },
    bugs: {
      url: "https://github.com/gera2ld/ts-guard/issues",
    },
    publishConfig: {
      access: "public",
      registry: "https://registry.npmjs.org/",
    },
  },
  mappings: {
    "./src/util.ts": "./src/util.node.ts",
    "https://deno.land/x/ts_morph@18.0.0/mod.ts": {
      name: "ts-morph",
      version: "^18.0.0",
    },
    "https://esm.sh/cac": {
      name: "cac",
      version: "^6.7.14",
    },
  },
  test: false,
});

Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
Deno.copyFileSync("shim.d.ts", "npm/shim.d.ts");
Deno.copyFileSync("src/ts-guard.tpl.ts", "npm/ts-guard.tpl.ts");
