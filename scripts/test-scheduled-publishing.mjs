import { readFile, rm, access } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isPostPublished, istanbulDateKey } from "../lib/publishing.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const eleventyCli = path.join(root, "node_modules", "@11ty", "eleventy", "cmd.cjs");
const slug = "pubg-steam-bloody-mouse-makro-rehberi";
const publicationDate = "2026-10-15";
const beforeTime = new Date("2026-10-14T20:59:59Z");
const releaseTime = new Date("2026-10-14T21:00:00Z");
const temporaryRoot = path.join(root, ".tmp-scheduled-publishing");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

function buildAt(instant, output) {
  const result = spawnSync(process.execPath, [eleventyCli, `--output=${output}`], {
    cwd: root,
    env: { ...process.env, SITE_BUILD_TIME: instant.toISOString() },
    encoding: "utf8"
  });
  if (result.status !== 0) throw new Error(`Eleventy test derlemesi başarısız:\n${result.stdout}\n${result.stderr}`);
}

try {
  await rm(temporaryRoot, { recursive: true, force: true });
  assert(istanbulDateKey(beforeTime) === "2026-10-14", "Yayın öncesi İstanbul tarihi yanlış.");
  assert(istanbulDateKey(releaseTime) === publicationDate, "Yayın anındaki İstanbul tarihi yanlış.");
  assert(!isPostPublished({ date: publicationDate }, beforeTime), "15 Ekim yazısı 14 Ekim'de gizli olmalı.");
  assert(isPostPublished({ date: publicationDate }, releaseTime), "15 Ekim yazısı İstanbul'da 15 Ekim olunca yayınlanmalı.");
  assert(!isPostPublished({ date: "2026-10-14", draft: true }, releaseTime), "Taslak yazı tarihi geçmiş olsa da yayınlanmamalı.");

  const beforeOutput = path.join(temporaryRoot, "before");
  buildAt(beforeTime, beforeOutput);
  const beforeBlog = await readFile(path.join(beforeOutput, "blog", "index.html"), "utf8");
  const beforeSitemap = await readFile(path.join(beforeOutput, "sitemap.xml"), "utf8");
  assert(!await exists(path.join(beforeOutput, "blog", slug, "index.html")), "İleri tarihli makale URL'si yayın öncesinde üretilmemeli.");
  assert(!beforeBlog.includes(slug), "İleri tarihli makale blog listesinde görünmemeli.");
  assert(!beforeSitemap.includes(slug), "İleri tarihli makale sitemap'te görünmemeli.");

  const releaseOutput = path.join(temporaryRoot, "release");
  buildAt(releaseTime, releaseOutput);
  const releaseBlog = await readFile(path.join(releaseOutput, "blog", "index.html"), "utf8");
  const releaseSitemap = await readFile(path.join(releaseOutput, "sitemap.xml"), "utf8");
  assert(await exists(path.join(releaseOutput, "blog", slug, "index.html")), "Yayın tarihi gelen makale URL'si üretilmeli.");
  assert(releaseBlog.includes(slug), "Yayın tarihi gelen makale blog listesinde görünmeli.");
  assert(releaseSitemap.includes(slug), "Yayın tarihi gelen makale sitemap'e eklenmeli.");

  console.log("Zamanlama testi başarılı: Bloody Mouse makalesi 14 Ekim'de gizli, 15 Ekim İstanbul tarihinde URL/blog/sitemap içinde yayında.");
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
