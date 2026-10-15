import { access, readFile, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isCampaignActive } from "../lib/campaign.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const eleventyCli = path.join(root, "node_modules", "@11ty", "eleventy", "cmd.cjs");
const temporaryRoot = path.join(root, ".tmp-campaign");
const site = JSON.parse(await readFile(path.join(root, "src", "_data", "site.json"), "utf8"));
const beforeStart = new Date("2026-10-14T20:59:59Z");
const start = new Date("2026-10-14T21:00:00Z");
const lastSecond = new Date("2026-12-31T20:59:59Z");
const expiry = new Date("2026-12-31T21:00:00Z");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function buildAt(instant, output) {
  const result = spawnSync(process.execPath, [eleventyCli, `--output=${output}`], {
    cwd: root,
    env: { ...process.env, SITE_BUILD_TIME: instant.toISOString() },
    encoding: "utf8"
  });
  if (result.status !== 0) throw new Error(`Kampanya test derlemesi başarısız:\n${result.stdout}\n${result.stderr}`);
}

async function exists(file) {
  try { await access(file); return true; } catch { return false; }
}

try {
  await rm(temporaryRoot, { recursive: true, force: true });
  assert(!isCampaignActive(site.campaign, beforeStart), "Kampanya başlangıçtan önce gizli olmalı.");
  assert(isCampaignActive(site.campaign, start), "Kampanya başlangıç anında görünmeli.");
  assert(isCampaignActive(site.campaign, lastSecond), "Kampanya 31 Aralık 2026 23.59.59 Türkiye saatinde görünmeli.");
  assert(!isCampaignActive(site.campaign, expiry), "Kampanya 1 Ocak 2027 00.00 Türkiye saatinde gizlenmeli.");
  assert(!isCampaignActive({ ...site.campaign, enabled: false }, start), "Merkezi ayardan kapatılan kampanya gizlenmeli.");

  const activeOutput = path.join(temporaryRoot, "active");
  buildAt(lastSecond, activeOutput);
  const activeHome = await readFile(path.join(activeOutput, "index.html"), "utf8");
  assert((activeHome.match(/data-campaign(?:[ >])/g) ?? []).length === 6, "Aktif kampanyada üst bant, ürün duyurusu ve dört ürün etiketi bulunmalı.");
  assert((activeHome.match(/data-campaign-placement=/g) ?? []).length === 2, "İki kampanya Shopier bağlantısı konum bilgisi taşımalı.");
  assert(activeHome.includes('data-campaign-placement="top_banner"'), "Üst bant ölçüm konumu eksik.");
  assert(activeHome.includes('data-campaign-placement="products_banner"'), "Ürün duyurusu ölçüm konumu eksik.");
  assert((activeHome.match(/🎁 3 Al 2 Öde/g) ?? []).length === 4, "Dört ürün kartının kampanya etiketi eksik.");

  const expiredOutput = path.join(temporaryRoot, "expired");
  buildAt(expiry, expiredOutput);
  const expiredHome = await readFile(path.join(expiredOutput, "index.html"), "utf8");
  const expiredBlog = await readFile(path.join(expiredOutput, "blog", "index.html"), "utf8");
  assert(!expiredHome.includes("data-campaign"), "Süresi dolan kampanya ana sayfa HTML'inden kaldırılmalı.");
  assert(!expiredHome.includes("3 AL 2 ÖDE") && !expiredHome.includes("3 Al 2 Öde"), "Süresi dolan kampanya metni ana sayfada kalmamalı.");
  assert(!expiredBlog.includes("data-campaign"), "Süresi dolan üst bant blog HTML'inden kaldırılmalı.");
  assert(await exists(path.join(expiredOutput, "assets", "js", "campaign.js")), "İstemci kampanya koruması derleme çıktısında bulunmalı.");

  console.log("Kampanya testi başarılı: başlangıç, 31 Aralık 23.59.59 ve 1 Ocak 00.00 sınırları ile tüm duyuru alanları doğrulandı.");
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
