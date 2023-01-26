import { readFile } from "fs/promises";
import { fileURLToPath } from "url";

export function readTemplate(file: string) {
  const fullPath = fileURLToPath(new URL(file, import.meta.url));
  return readFile(fullPath, "utf8");
}
