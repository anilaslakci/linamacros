import { readFile, rm, access, readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isPostPublished, istanbulDateKey } from "../lib/publishing.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const eleventyCli = path.join(root, "node_modules", "@11ty", "eleventy", "cmd.cjs");
const scheduledPosts = [
  { slug: "pubg-43-2-guncellemesi-2026", date: "2026-10-22" },
  { slug: "cs2-ekim-2026-guncellemesi-aug-replay", date: "2026-10-29" }
];
const scenarios = [
  { date: "2026-10-19", instant: new Date("2026-10-19T06:00:00Z"), published: [] },
  { date: "2026-10-22", instant: new Date("2026-10-22T06:00:00Z"), published: ["pubg-43-2-guncellemesi-2026"] },
  { date: "2026-10-29", instant: new Date("2026-10-29T06:00:00Z"), published: scheduledPosts.map((post) => post.slug) }
];
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

async function htmlContains(directory, value) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (await htmlContains(target, value)) return true;
    } else if (entry.name.endsWith(".html") && (await readFile(target, "utf8")).includes(value)) {
      return true;
    }
  }
  return false;
}

try {
  await rm(temporaryRoot, { recursive: true, force: true });
  for (const post of scheduledPosts) {
    const beforeRelease = new Date(`${post.date}T20:59:59Z`);
    const release = new Date(`${post.date}T21:00:00Z`);
    beforeRelease.setUTCDate(beforeRelease.getUTCDate() - 1);
    release.setUTCDate(release.getUTCDate() - 1);
    assert(!isPostPublished({ date: post.date }, beforeRelease), `${post.slug}: İstanbul yayın tarihinden önce gizli olmalı.`);
    assert(isPostPublished({ date: post.date }, release), `${post.slug}: İstanbul yayın tarihinde görünmeli.`);
  }
  assert(!isPostPublished({ date: "2026-10-19", draft: true }, scenarios[2].instant), "Taslak yazı tarihi geçmiş olsa da yayınlanmamalı.");

  for (const scenario of scenarios) {
    assert(istanbulDateKey(scenario.instant) === scenario.date, `${scenario.date}: İstanbul test tarihi yanlış.`);
    const output = path.join(temporaryRoot, scenario.date);
    buildAt(scenario.instant, output);
    const blog = await readFile(path.join(output, "blog", "index.html"), "utf8");
    const sitemap = await readFile(path.join(output, "sitemap.xml"), "utf8");

    for (const post of scheduledPosts) {
      const shouldPublish = scenario.published.includes(post.slug);
      assert(await exists(path.join(output, "blog", post.slug, "index.html")) === shouldPublish, `${scenario.date} / ${post.slug}: doğrudan URL durumu yanlış.`);
      assert(blog.includes(post.slug) === shouldPublish, `${scenario.date} / ${post.slug}: blog listesi durumu yanlış.`);
      assert(sitemap.includes(post.slug) === shouldPublish, `${scenario.date} / ${post.slug}: sitemap durumu yanlış.`);
      assert(await htmlContains(output, post.slug) === shouldPublish, `${scenario.date} / ${post.slug}: ilgili yazılar veya başka bir HTML içinde görünürlük durumu yanlış.`);
    }
  }

  console.log("Zamanlama testi başarılı: 19, 22 ve 29 Ekim İstanbul senaryolarında URL, blog listesi, sitemap ve ilgili yazı görünürlüğü doğrulandı.");
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
