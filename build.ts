import { build, emptyDir } from "https://deno.land/x/dnt@0.33.1/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["ts-guard.ts", {
    name: "./shim",
    path: "shim.ts",
  }],
  outDir: "./npm",
  shims: {
    deno: true,
  },
  package: {
    name: "ts-guard",
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
    bin: "./ts-guard.js",
  },
  mappings: {
    "./util.ts": "./util.node.ts",
    "https://deno.land/x/ts_morph@17.0.1/mod.ts": {
      name: "ts-morph",
      version: "17.0.1",
    },
  },
  test: false,
});

Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
Deno.writeTextFile(
  "npm/ts-guard.js",
  `#!/usr/bin/env node\n\nrequire('.').compile();`,
  { mode: 0o755 },
);
