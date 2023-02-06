import { build, emptyDir } from "https://deno.land/x/dnt@0.33.1/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./ts-guard.ts", "./shim.ts"],
  outDir: "./npm",
  shims: {
    deno: true,
  },
  package: {
    name: "ts-guard",
    version: "0.0.0",
    description: "Guard your object with TypeScript declarations",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/username/repo.git",
    },
    bugs: {
      url: "https://github.com/username/repo/issues",
    },
  },
  mappings: {
    "./util.ts": "./util.node.ts",
  },
  test: false,
});
