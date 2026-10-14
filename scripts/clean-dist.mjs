import { rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const target = path.resolve(root, "dist");
if (path.dirname(target) !== path.resolve(root) || path.basename(target) !== "dist") {
  throw new Error(`Güvenli olmayan çıktı yolu temizlenmedi: ${target}`);
}
await rm(target, { recursive: true, force: true });
