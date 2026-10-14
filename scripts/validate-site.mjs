import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { getBuildTime, isPostPublished } from "../lib/publishing.mjs";

const root = process.cwd();
const dist = path.join(root, "dist");
const postSource = path.join(root, "src", "blog", "posts");
const errors = [];

function fail(message) {
  errors.push(message);
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(target));
    else files.push(target);
  }
  return files;
}

function attr(html, name, value, wanted) {
  const pattern = new RegExp(`<${name}[^>]*${value}=["']${wanted}["'][^>]*>`, "i");
  return pattern.test(html);
}

function metaContent(html, attribute, value) {
  const patterns = [
    new RegExp(`<meta[^>]*${attribute}=["']${value}["'][^>]*content=["']([^"']*)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*${attribute}=["']${value}["'][^>]*>`, "i")
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }
  return "";
}

const sourcePosts = (await readdir(postSource)).filter((name) => name.endsWith(".md"));
if (sourcePosts.length !== 11) fail(`11 makale bekleniyordu, ${sourcePosts.length} bulundu.`);
const buildTime = getBuildTime();
const publishedSources = [];
for (const name of sourcePosts) {
  const source = await readFile(path.join(postSource, name), "utf8");
  const date = source.match(/^date:\s*["']?([^\s"']+)/m)?.[1];
  const draft = source.match(/^draft:\s*(true|false)/m)?.[1] === "true";
  if (isPostPublished({ date, draft }, buildTime)) publishedSources.push(name);
}

const htmlFiles = (await walk(dist)).filter((file) => file.endsWith(".html"));
const postHtmlFiles = htmlFiles.filter((file) => file.includes(`${path.sep}blog${path.sep}`) && file !== path.join(dist, "blog", "index.html"));
if (postHtmlFiles.length !== publishedSources.length) fail(`Derlemede ${publishedSources.length} yayınlanmış makale sayfası bekleniyordu, ${postHtmlFiles.length} bulundu.`);

const expectedUrls = new Set(["https://linamacros.com.tr/", "https://linamacros.com.tr/blog/"]);

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const relative = path.relative(dist, file).replaceAll("\\", "/");
  const urlPath = relative === "index.html" ? "/" : `/${relative.replace(/index\.html$/, "")}`;
  const canonical = `https://linamacros.com.tr${urlPath}`;
  expectedUrls.add(canonical);

  if (!html.includes('<html lang="tr">')) fail(`${relative}: lang=tr eksik.`);
  if (!html.includes(`<link rel="canonical" href="${canonical}"`)) fail(`${relative}: canonical yanlış veya eksik.`);
  if (metaContent(html, "property", "og:url") !== canonical) fail(`${relative}: og:url canonical ile eşleşmiyor.`);
  if (!metaContent(html, "property", "og:title")) fail(`${relative}: og:title eksik.`);
  if (!metaContent(html, "property", "og:description")) fail(`${relative}: og:description eksik.`);
  if (!metaContent(html, "property", "og:image")) fail(`${relative}: og:image eksik.`);
  if (!attr(html, "meta", "name", "description")) fail(`${relative}: meta description eksik.`);
  if ((html.match(/\/assets\/js\/consent-analytics\.js/g) ?? []).length !== 1) fail(`${relative}: ortak Analytics rıza betiği tam bir kez yüklenmeli.`);
  if ((html.match(/window\.LINA_ANALYTICS_ID\s*=\s*"G-SBGM63WMGG"/g) ?? []).length !== 1) fail(`${relative}: GA4 yapılandırması tam bir kez bulunmalı.`);
  if (!html.includes("data-consent-accept") || !html.includes("data-consent-reject")) fail(`${relative}: analitik rıza seçenekleri eksik.`);
  if (html.includes("googletagmanager.com/gtag/js")) fail(`${relative}: GA4 etiketi rıza öncesinde statik olarak yüklenmemeli.`);
  if ((html.match(/class="site-header"/g) ?? []).length !== 1) fail(`${relative}: ortak sticky üst menü eksik veya tekrarlanmış.`);

  const localLinks = [...html.matchAll(/href=["'](\/[^"'#?]*)(?:[?#][^"']*)?["']/g)].map((match) => match[1]);
  for (const href of localLinks) {
    const clean = decodeURIComponent(href);
    const target = clean.endsWith("/")
      ? path.join(dist, clean, "index.html")
      : path.join(dist, clean);
    if (!await exists(target)) fail(`${relative}: bozuk iç bağlantı ${href}`);
  }
}

for (const file of postHtmlFiles) {
  const html = await readFile(file, "utf8");
  const relative = path.relative(dist, file).replaceAll("\\", "/");
  const description = metaContent(html, "name", "description");
  if (description.length < 120 || description.length > 160) fail(`${relative}: meta description ${description.length} karakter.`);
  if (metaContent(html, "property", "og:type") !== "article") fail(`${relative}: og:type article değil.`);
  const jsonBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map((match) => match[1]);
  const posting = jsonBlocks.map((block) => {
    try { return JSON.parse(block); } catch { return null; }
  }).find((value) => value?.["@type"] === "BlogPosting");
  if (!posting) fail(`${relative}: geçerli BlogPosting JSON-LD bulunamadı.`);
  else {
    for (const key of ["headline", "description", "datePublished", "dateModified", "mainEntityOfPage", "author", "publisher"]) {
      if (!posting[key]) fail(`${relative}: JSON-LD ${key} eksik.`);
    }
  }
  const plainText = html.match(/<div class="article-content">([\s\S]*?)<\/div>/i)?.[1]
    .replace(/<[^>]+>/g, " ")
    .replace(/&[^;]+;/g, " ")
    .trim() ?? "";
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  if (wordCount < 700) fail(`${relative}: içerik yalnızca ${wordCount} kelime.`);
}

const home = await readFile(path.join(dist, "index.html"), "utf8");
const shopierUrls = [
  "https://www.shopier.com/linamacros/33482000",
  "https://www.shopier.com/linamacros/33090562",
  "https://www.shopier.com/linamacros/33088510",
  "https://www.shopier.com/linamacros/33086748"
];
for (const url of shopierUrls) {
  if (!home.includes(`href="${url}"`)) fail(`Ana sayfada Shopier bağlantısı korunmadı: ${url}`);
}
if ((home.match(/data-shopier-product=/g) ?? []).length !== 4 || (home.match(/data-shopier-game=/g) ?? []).length !== 4) {
  fail("Dört Shopier satın alma düğmesinin ürün ve oyun ölçüm bilgileri eksik.");
}
const faqIndex = home.indexOf('id="sss"');
const brandTrustIndex = home.indexOf('class="section brand-trust');
const homeBlogIndex = home.indexOf('class="section section-grid home-blog');
if (!(brandTrustIndex >= 0 && faqIndex > brandTrustIndex && homeBlogIndex > faqIndex)) fail("Bölüm sırası Marka Güven → S.S.S. → Blog şeklinde değil.");
for (const text of ["Oyunu Biliyoruz, Oyuncuyu Anlıyoruz.", "Bloody Mouse Uyumlu", "Türkçe Kurulum", "Telegram Destek", "Uygun Fiyat"]) {
  if (!home.includes(text)) fail(`Marka güven bölümünde metin eksik: ${text}`);
}
if (!home.includes('class="btn btn-primary brand-trust-cta" href="#urunler"')) fail("Marka güven bölümü CTA bağlantısı ürünlere gitmiyor.");
if (home.includes("3.000+ Kullanıcı") || home.includes("4,8/5 Kullanıcı Memnuniyeti")) fail("Doğrulanmamış istatistikler canlı HTML içinde görünmemeli.");
if (home.includes("Oyununa Uygun <span>Paketi</span>") || home.includes("Paketi seç, Shopier üzerinden satın al ve kullanmaya başla.")) {
  fail("Kaldırılan son paket CTA bölümü hâlâ ana sayfada bulunuyor.");
}

const siteCss = await readFile(path.join(dist, "assets", "css", "styles.css"), "utf8");
if (!siteCss.includes(".site-header.is-scrolled") || !siteCss.includes("scroll-padding-top") || !siteCss.includes(".page-shell{overflow:clip}")) {
  fail("Sticky menü, anchor boşluğu veya kapsayıcı overflow düzeltmesi eksik.");
}
const siteScript = await readFile(path.join(dist, "assets", "js", "script.js"), "utf8");
if (!siteScript.includes("is-scrolled") || !siteScript.includes("aria-expanded','false")) fail("Sticky menü durumu veya mobil menü kapanış senkronu eksik.");

const analyticsScript = await readFile(path.join(dist, "assets", "js", "consent-analytics.js"), "utf8");
for (const marker of ["click_shopier", "click_outbound", "product_name", "game", "destination_url", "analytics_storage", "lina_analytics_consent_v1"]) {
  if (!analyticsScript.includes(marker)) fail(`Analytics betiğinde ${marker} eksik.`);
}
if (!analyticsScript.includes('document.createElement("script")') || !analyticsScript.includes("googletagmanager.com/gtag/js")) {
  fail("GA4 etiketi rıza sonrasında dinamik yüklenmiyor.");
}

const sitemap = await readFile(path.join(dist, "sitemap.xml"), "utf8");
const sitemapUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
for (const url of expectedUrls) {
  if (!sitemapUrls.has(url)) fail(`Sitemap URL eksik: ${url}`);
}
const expectedSitemapSize = publishedSources.length + 3;
if (sitemapUrls.size !== expectedSitemapSize) fail(`Sitemap ${expectedSitemapSize} URL içermeli, ${sitemapUrls.size} içeriyor.`);

const robots = await readFile(path.join(dist, "robots.txt"), "utf8");
if (!robots.includes("User-agent: *") || !robots.includes("Allow: /") || !robots.includes("Sitemap: https://linamacros.com.tr/sitemap.xml")) {
  fail("robots.txt içeriği beklenen kurallarla eşleşmiyor.");
}

const cname = (await readFile(path.join(dist, "CNAME"), "utf8")).trim();
if (cname !== "linamacros.com.tr") fail(`CNAME yanlış: ${cname}`);

for (const [name, width, height] of [
  ["apple-touch-icon.png", 180, 180],
  ["icon-192.png", 192, 192],
  ["icon-512.png", 512, 512],
  ["assets/images/lina-macros-og.png", 1200, 630]
]) {
  const png = await readFile(path.join(dist, name));
  const actualWidth = png.readUInt32BE(16);
  const actualHeight = png.readUInt32BE(20);
  if (png.toString("ascii", 1, 4) !== "PNG" || actualWidth !== width || actualHeight !== height) fail(`${name}: ${width}x${height} PNG bekleniyordu.`);
}
for (const file of ["favicon.ico", "favicon.svg"]) {
  if (!await exists(path.join(dist, file))) fail(`${file} derlemede eksik.`);
}

const sourceFiles = (await walk(root)).filter((file) => !file.includes(`${path.sep}.git${path.sep}`) && !file.includes(`${path.sep}node_modules${path.sep}`) && !file.includes(`${path.sep}dist${path.sep}`));
const protectedPagesDomain = "lina-macros" + ".pages.dev";
for (const file of sourceFiles) {
  const extension = path.extname(file).toLowerCase();
  if (![".html", ".njk", ".md", ".js", ".mjs", ".json", ".yml", ".yaml", ".css", ".txt"].includes(extension)) continue;
  const content = await readFile(file, "utf8");
  if (/ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|GITHUB_TOKEN\s*=|CLIENT_SECRET\s*=/.test(content)) fail(`${path.relative(root, file)}: olası gizli bilgi bulundu.`);
  if (content.includes(protectedPagesDomain)) fail(`${path.relative(root, file)}: dokunulmaması istenen pages.dev alan adına referans bulundu.`);
}

if (errors.length) {
  console.error(`Doğrulama başarısız (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Doğrulama başarılı: ${sourcePosts.length} kaynak makalenin ${publishedSources.length} adedi yayında; ${htmlFiles.length} HTML sayfası, ${expectedSitemapSize} sitemap URL'si ve tüm SEO/Shopier/GA4-rıza/favicon kontrolleri geçti.`);
