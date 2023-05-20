import { readFile } from "fs/promises";
import { fileURLToPath } from "url";

export function getTemplate() {
  const fullPath = fileURLToPath(
    new URL("../ts-guard.tpl.ts", import.meta.url),
  );
  return readFile(fullPath, "utf8");
}
