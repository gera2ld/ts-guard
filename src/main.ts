import { cac } from "https://esm.sh/cac";
import { compile } from "./ts-guard.ts";

const cli = cac();
cli
  .command("")
  .option("-p, --project", "Specify the path of tsconfig", {
    default: "tsconfig.json",
  })
  .action((options: { project?: string }) => {
    compile({
      tsConfigFilePath: options.project,
    });
  });

cli.parse();
