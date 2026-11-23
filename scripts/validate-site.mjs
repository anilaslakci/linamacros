import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { getBuildTime, isPostPublished } from "../lib/publishing.mjs";
import { isCampaignActive } from "../lib/campaign.mjs";
import { activeProduct, activeProducts as filterActiveProducts, productUrl, tryPrice } from "../lib/products.mjs";
import { isRulesGuide } from "../lib/article-links.mjs";
import sharp from "sharp";

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

function countWords(value) {
  return (String(value ?? "").match(/[\p{L}\p{N}]+(?:[’'.-][\p{L}\p{N}]+)*/gu) ?? []).length;
}

function markdownBodyText(source) {
  return source
    .replace(/^---\s*[\s\S]*?\s*---\s*/, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-zA-Z0-9#]+;/g, " ")
    .replace(/[#>*_`~|]/g, " ");
}

function linkUrls(html, canonical) {
  return [...html.matchAll(/<(?:a|link)\b[^>]*\shref\s*=\s*(["'])(.*?)\1[^>]*>/gi)].map(([, , href]) => {
    const target = href.replaceAll("&amp;", "&");
    return { href, url: URL.canParse(target, canonical) ? new URL(target, canonical) : null };
  });
}

function validateSchemaFields(value, relative, origin) {
  if (!value || typeof value !== "object") return;
  const types = [value["@type"]].flat();
  if (types.some((type) => /(?:^|\/)(?:AggregateRating|Review)$/.test(type))) fail(`${relative}: yasak değerlendirme şeması bulundu.`);
  for (const [key, field] of Object.entries(value)) {
    if (key === "@id" && !(typeof field === "string" && (field === origin || field.startsWith(`${origin}/`)))) {
      fail(`${relative}: JSON-LD @id site adresiyle başlamıyor: ${field}`);
    }
    if (["aggregateRating", "review", "ratingValue", "reviewCount"].includes(key)) fail(`${relative}: yasak JSON-LD alanı ${key}.`);
    validateSchemaFields(field, relative, origin);
  }
}

function validateBreadcrumb(schema, relative, canonical, siteUrl, sectionName, sectionPath, pageName) {
  const expected = [["Ana Sayfa", `${siteUrl}/`], [sectionName, `${siteUrl}${sectionPath}`], [pageName, canonical]];
  const items = schema?.itemListElement;
  if (!Array.isArray(items) || items.length !== expected.length || !expected.every(([name, url], index) => {
    const item = items[index];
    return item?.["@type"] === "ListItem" && item.position === index + 1
      && item.name === name && item.item?.["@id"] === url && item.item?.url === url;
  })) {
    fail(`${relative}: BreadcrumbList sayfa yoluyla eşleşmiyor.`);
  }
}

const siteData = JSON.parse(await readFile(path.join(root, "src", "_data", "site.json"), "utf8"));
if (siteData.url !== "https://linamacros.com.tr") fail("Merkezi site adresi https://linamacros.com.tr olmalı.");
const siteHost = new URL(siteData.url).hostname;
const productsData = JSON.parse(await readFile(path.join(root, "src", "_data", "products.json"), "utf8"));
const activeProducts = filterActiveProducts(productsData);
const productsByUrl = new Map(activeProducts.map((product) => [productUrl(product), product]));
const faqsData = JSON.parse(await readFile(path.join(root, "src", "_data", "faqs.json"), "utf8"));

const sourcePosts = (await readdir(postSource)).filter((name) => name.endsWith(".md"));
if (sourcePosts.length === 0) fail("Blog kaynak klasöründe en az bir makale bulunmalı.");
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
const schemasByFile = new Map();
const productTitles = new Set();
const productDescriptions = new Set();
const htmlByFile = new Map(await Promise.all(htmlFiles.map(async (file) => [file, await readFile(file, "utf8")])));
const fragmentsByFile = new Map([...htmlByFile].map(([file, html]) => [
  file, new Set([...html.matchAll(/<[a-z][^>]*\sid=["']([^"']+)["']/gi)].map(([, id]) => id))
]));
let jsonLdBlockCount = 0;
let internalLinkCount = 0;
let postPackageLinkCount = 0;
let rulesGuideCount = 0;

for (const file of htmlFiles) {
  const html = htmlByFile.get(file);
  const relative = path.relative(dist, file).replaceAll("\\", "/");
  const urlPath = relative === "index.html" ? "/" : `/${relative.replace(/index\.html$/, "")}`;
  const canonical = `${siteData.url}${urlPath}`;
  expectedUrls.add(canonical);

  if (!html.includes('<html lang="tr">')) fail(`${relative}: lang=tr eksik.`);
  const canonicalTags = [...html.matchAll(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi)];
  if (canonicalTags.length !== 1 || !canonicalTags[0][0].includes(`href="${canonical}"`)) fail(`${relative}: canonical yanlış, eksik veya tekrarlanmış.`);
  if (metaContent(html, "property", "og:url") !== canonical) fail(`${relative}: og:url canonical ile eşleşmiyor.`);
  if (!metaContent(html, "property", "og:title")) fail(`${relative}: og:title eksik.`);
  if (!metaContent(html, "property", "og:description")) fail(`${relative}: og:description eksik.`);
  if (!metaContent(html, "property", "og:image")) fail(`${relative}: og:image eksik.`);
  if (!attr(html, "meta", "name", "description")) fail(`${relative}: meta description eksik.`);
  if ((html.match(/\/assets\/js\/consent-analytics\.js/g) ?? []).length !== 1) fail(`${relative}: ortak Analytics rıza betiği tam bir kez yüklenmeli.`);
  if ((html.match(/\/assets\/js\/campaign\.js/g) ?? []).length !== 1) fail(`${relative}: kampanya bitiş betiği tam bir kez yüklenmeli.`);
  if ((html.match(/window\.LINA_ANALYTICS_ID\s*=\s*"G-SBGM63WMGG"/g) ?? []).length !== 1) fail(`${relative}: GA4 yapılandırması tam bir kez bulunmalı.`);
  if (!html.includes("data-consent-accept") || !html.includes("data-consent-reject")) fail(`${relative}: analitik rıza seçenekleri eksik.`);
  if (html.includes("googletagmanager.com/gtag/js")) fail(`${relative}: GA4 etiketi rıza öncesinde statik olarak yüklenmemeli.`);
  if ((html.match(/class="site-header"/g) ?? []).length !== 1) fail(`${relative}: ortak sticky üst menü eksik veya tekrarlanmış.`);

  const schemas = new Map();
  for (const [, block] of html.matchAll(/<script\b(?=[^>]*\stype\s*=\s*["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script\s*>/gi)) {
    jsonLdBlockCount++;
    let schema;
    try {
      schema = JSON.parse(block);
    } catch (error) {
      fail(`${relative}: geçersiz JSON-LD: ${error.message}`);
      continue;
    }
    validateSchemaFields(schema, relative, siteData.url);
    if (schemas.has(schema?.["@type"])) fail(`${relative}: yinelenen JSON-LD türü ${schema["@type"]}.`);
    schemas.set(schema?.["@type"], schema);
  }
  schemasByFile.set(file, schemas);
  if (schemas.get("WebSite")?.url !== `${siteData.url}/`) fail(`${relative}: geçerli WebSite JSON-LD bulunamadı.`);

  if (urlPath === "/") {
    const publishedFaqs = faqsData
      .filter((faq) => faq.active === true && faq.question.trim() && faq.answer.trim())
      .sort((a, b) => a.order - b.order);
    const entities = schemas.get("FAQPage")?.mainEntity;
    if (!Array.isArray(entities) || entities.length !== publishedFaqs.length || !publishedFaqs.every((faq, index) =>
      entities[index]?.name === faq.question && entities[index]?.acceptedAnswer?.text === faq.answer
    )) fail(`${relative}: FAQPage aktif S.S.S. kayıtlarıyla eşleşmiyor.`);
  }

  const product = productsByUrl.get(urlPath);
  const productMarkup = schemas.get("Product");
  if (product) {
    const offer = productMarkup?.offers;
    if (productMarkup?.url !== canonical || productMarkup.name !== product.name || productMarkup.description !== product.description
      || productMarkup.sku !== product.id || productMarkup.brand?.name !== siteData.name || "image" in productMarkup) {
      fail(`${relative}: Product JSON-LD ürün kaydıyla eşleşmiyor veya görsel içeriyor.`);
    }
    if (offer?.["@type"] !== "Offer" || typeof offer.price !== "number" || offer.price !== product.price
      || offer.priceCurrency !== "TRY" || offer.availability !== "https://schema.org/InStock"
      || offer.url !== canonical || offer.seller?.name !== siteData.name) {
      fail(`${relative}: Offer JSON-LD fiyat, stok, satıcı veya canonical ile eşleşmiyor.`);
    }
    validateBreadcrumb(schemas.get("BreadcrumbList"), relative, canonical, siteData.url, "Ürünler", "/#urunler", product.name);
    productTitles.add(metaContent(html, "property", "og:title"));
    productDescriptions.add(metaContent(html, "property", "og:description"));
  } else if (schemas.has("Product") || schemas.has("Offer")) {
    fail(`${relative}: aktif ürün sayfası dışında ürün şeması bulundu.`);
  }

  for (const { href, url } of linkUrls(html, canonical)) {
    if (!url) {
      fail(`${relative}: geçersiz bağlantı ${href}`);
      continue;
    }
    if (url.hostname !== siteHost) continue;
    internalLinkCount++;
    const clean = decodeURIComponent(url.pathname);
    const target = path.join(dist, clean, clean.endsWith("/") ? "index.html" : "");
    const resolved = htmlByFile.has(target) || path.extname(clean) ? target : path.join(target, "index.html");
    if (!htmlByFile.has(resolved) && !await exists(resolved)) {
      fail(`${relative}: bozuk iç bağlantı ${href}`);
    } else if (url.hash && fragmentsByFile.has(resolved) && !fragmentsByFile.get(resolved).has(decodeURIComponent(url.hash.slice(1)))) {
      fail(`${relative}: bulunamayan sayfa içi hedef ${href}`);
    }
  }
}
if (productTitles.size !== activeProducts.length || productDescriptions.size !== activeProducts.length) {
  fail("Her aktif ürün sayfasının başlığı ve meta açıklaması benzersiz olmalı.");
}

for (const file of postHtmlFiles) {
  const html = htmlByFile.get(file);
  const relative = path.relative(dist, file).replaceAll("\\", "/");
  const slug = relative.split("/").at(-2);
  const source = await readFile(path.join(postSource, `${slug}.md`), "utf8");
  const readingTime = Number(source.match(/^readingTime:\s*(\d+)/m)?.[1]);
  const description = metaContent(html, "name", "description");
  if (description.length < 120 || description.length > 160) fail(`${relative}: meta description ${description.length} karakter.`);
  if (metaContent(html, "property", "og:type") !== "article") fail(`${relative}: og:type article değil.`);
  const schemas = schemasByFile.get(file);
  const posting = schemas.get("BlogPosting");
  const canonical = `${siteData.url}/blog/${slug}/`;
  if (!posting) fail(`${relative}: geçerli BlogPosting JSON-LD bulunamadı.`);
  else {
    for (const key of ["headline", "description", "datePublished", "dateModified", "mainEntityOfPage", "author", "publisher", "keywords"]) {
      if (!posting[key]) fail(`${relative}: JSON-LD ${key} eksik.`);
    }
    if (posting.url !== canonical || posting.mainEntityOfPage?.["@id"] !== canonical) fail(`${relative}: BlogPosting canonical ile eşleşmiyor.`);
  }
  validateBreadcrumb(schemas.get("BreadcrumbList"), relative, canonical, siteData.url, "Blog", "/blog/", posting?.headline);
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? "";
  const articleLinks = linkUrls(main, canonical).map(({ url }) => url).filter(Boolean);
  const localArticleLinks = articleLinks.filter((url) => url.origin === siteData.url);
  const productLinks = localArticleLinks.filter((url) => productsByUrl.has(url.pathname));
  const generalLinks = localArticleLinks.filter((url) => url.pathname === "/" && url.hash === "#urunler");
  const tags = posting?.keywords?.split(", ") ?? [];
  const selectedSlug = source.match(/^product:[ \t]*["']?([a-z0-9-]+)["']?[ \t]*\r?$/m)?.[1];
  const selectedProduct = activeProduct(productsData, selectedSlug);
  if (isRulesGuide(tags)) {
    rulesGuideCount++;
    if (productLinks.length || generalLinks.length || articleLinks.some((url) => url.hostname === "www.shopier.com" || url.hostname === "shopier.com")) {
      fail(`${relative}: kural odaklı yazıda satış çağrısı veya ürün bağlantısı var.`);
    }
    if (!linkUrls(html, canonical).some(({ href }) => href === "/#urunler")) fail(`${relative}: ortak ürün menüsü bağlantısı eksik.`);
  } else {
    postPackageLinkCount += productLinks.length + generalLinks.length;
    if (!productLinks.length && !generalLinks.length) fail(`${relative}: ürün sayfasına veya /#urunler hedefine bağlantı yok.`);
    const category = source.match(/^category:[ \t]*(.+)$/m)?.[1].trim();
    const taggedGames = new Set(tags.map((tag) => /^(PUBG|Valorant|CS2)\b/i.exec(tag)?.[0].toLowerCase()).filter(Boolean));
    const comparison = category === "Oyun Rehberi" && taggedGames.size > 1 && main.includes("<table>");
    if ((!comparison && productLinks.length > 1) || new Set(productLinks.map((url) => url.pathname)).size !== productLinks.length || generalLinks.length > 1) {
      fail(`${relative}: ürün bağlantısı veya genel CTA adedi sınırı aşıyor.`);
    }
    if (selectedProduct && !productLinks.some((url) => url.pathname === productUrl(selectedProduct))) fail(`${relative}: seçilen paket bağlantısı eksik.`);
  }
  const plainText = html.match(/<div class="article-content">([\s\S]*?)<\/div>/i)?.[1]
    .replace(/<[^>]+>/g, " ")
    .replace(/&[^;]+;/g, " ")
    .trim() ?? "";
  const renderedWordCount = countWords(plainText);
  const sourceWordCount = countWords(markdownBodyText(source));
  const minimumWords = Math.max(300, Math.min(600, (Number.isFinite(readingTime) ? readingTime : 4) * 75));
  if (renderedWordCount < minimumWords) fail(`${relative}: ${readingTime || "?"} dakikalık içerik için en az ${minimumWords} kelime bekleniyordu, ${renderedWordCount} bulundu.`);
  const allowedDifference = Math.max(25, Math.ceil(sourceWordCount * 0.15));
  if (Math.abs(renderedWordCount - sourceWordCount) > allowedDifference) {
    fail(`${relative}: Markdown (${sourceWordCount}) ile HTML (${renderedWordCount}) kelime sayısı arasında olası içerik kesilmesine işaret eden fark var.`);
  }
}

const homePath = path.join(dist, "index.html");
const home = htmlByFile.get(homePath);
if (!fragmentsByFile.get(homePath)?.has("urunler")) fail("Ana sayfada /#urunler hedefi eksik.");
const homeTemplate = await readFile(path.join(root, "src", "index.njk"), "utf8");
for (const product of activeProducts) {
  if (!home.includes(`href="${product.shopierUrl}"`)) fail(`Ana sayfada Shopier bağlantısı eksik: ${product.shopierUrl}`);
  if (!home.includes(`<strong>${tryPrice(product.price)}</strong>`)) fail(`${product.id}: merkezi satış fiyatı ana sayfaya yansımadı.`);
  if (product.regularPrice && !home.includes(`<del>${tryPrice(product.regularPrice)}</del>`)) fail(`${product.id}: merkezi indirimsiz fiyat ana sayfaya yansımadı.`);
}
if ((home.match(/data-shopier-product=/g) ?? []).length !== activeProducts.length || (home.match(/data-shopier-game=/g) ?? []).length !== activeProducts.length) {
  fail("Aktif ürünlerin Shopier satın alma düğmelerinde ürün ve oyun ölçüm bilgileri eksik.");
}
for (const productId of productsData.map((product) => product.id)) {
  const expectedCount = productsData.find((product) => product.id === productId)?.active === true ? 1 : 0;
  const actualCount = (home.match(new RegExp(`id="${productId}"`, "g")) ?? []).length;
  if (actualCount !== expectedCount) fail(`${productId}: ${expectedCount} kart bekleniyordu, ${actualCount} bulundu.`);
}
const campaignShouldRender = isCampaignActive(siteData.campaign, buildTime);
const expectedCampaignElements = campaignShouldRender ? activeProducts.length + 2 : 0;
const expectedCampaignTags = campaignShouldRender ? activeProducts.length : 0;
if ((home.match(/data-campaign(?:[ >])/g) ?? []).length !== expectedCampaignElements || (home.match(/class="product-campaign-tag"/g) ?? []).length !== expectedCampaignTags) {
  fail("Kampanya bandı, ürün duyurusu veya ürün etiketleri kampanya durumuyla eşleşmiyor.");
}
for (const placement of ["top_banner", "products_banner"]) {
  if (home.includes(`data-campaign-placement="${placement}"`) !== campaignShouldRender) fail(`Kampanya ölçüm konumu kampanya durumuyla eşleşmiyor: ${placement}`);
}
if (!home.includes('class="payment-card payment-card-link reveal" href="https://www.shopier.com/linamacros" target="_blank" rel="noopener noreferrer"')) {
  fail("Shopier bilgilendirme kartının tamamı güvenli, yeni sekmede açılan bağlantı değil.");
}
const faqIndex = home.indexOf('id="sss"');
const brandTrustIndex = home.indexOf('class="section brand-trust');
const homeBlogIndex = home.indexOf('class="section section-grid home-blog');
if (!(brandTrustIndex >= 0 && faqIndex > brandTrustIndex && homeBlogIndex > faqIndex)) fail("Bölüm sırası Marka Güven → S.S.S. → Blog şeklinde değil.");
for (const text of ["Oyunu Biliyoruz, Oyuncuyu Anlıyoruz.", "Bloody Mouse Uyumlu", "Türkçe Kurulum", "Telegram Destek", "Uygun Fiyat"]) {
  if (!home.includes(text)) fail(`Marka güven bölümünde metin eksik: ${text}`);
}
if (!home.includes('class="btn btn-primary brand-trust-cta" href="#urunler"')) fail("Marka güven bölümü CTA bağlantısı ürünlere gitmiyor.");
const trustStatsMayPublish = siteData.trustStats?.visible === true && siteData.trustStats?.sourceVerified === true;
const trustStatsRendered = home.includes('class="brand-trust-stats"');
if (!homeTemplate.includes("site.trustStats.visible and site.trustStats.sourceVerified")) fail("Doğrulanmamış güven istatistiklerini engelleyen çift onay koşulu kaldırılmış.");
if (trustStatsMayPublish) {
  if (!trustStatsRendered) fail("Doğrulanmış güven istatistikleri ana sayfada görünmüyor.");
  if (!home.includes(`<strong>${siteData.trustStats.users.value}</strong><span>${siteData.trustStats.users.label}</span>`)) fail("Doğrulanmış kullanıcı istatistiği yanlış veya eksik.");
  if (!home.includes(`<strong>${siteData.trustStats.satisfaction.value}</strong>`) || !home.includes(`<small>${siteData.trustStats.satisfaction.label}</small>`)) fail("Doğrulanmış memnuniyet istatistiği yanlış veya eksik.");
} else if (trustStatsRendered || home.includes("3.000+") || home.includes("4,8/5")) {
  fail("Kaynağı doğrulanmamış güven istatistikleri canlı HTML içinde görünmemeli.");
}
if (home.includes("Oyununa Uygun <span>Paketi</span>") || home.includes("Paketi seç, Shopier üzerinden satın al ve kullanmaya başla.")) {
  fail("Kaldırılan son paket CTA bölümü hâlâ ana sayfada bulunuyor.");
}

const siteCss = await readFile(path.join(dist, "assets", "css", "styles.css"), "utf8");
if (!siteCss.includes(".site-header.is-scrolled") || !siteCss.includes("scroll-padding-top") || !siteCss.includes(".page-shell{overflow:clip}")) {
  fail("Sticky menü, anchor boşluğu veya kapsayıcı overflow düzeltmesi eksik.");
}
for (const marker of [".payment-card-link", "cursor:pointer", "@keyframes linaMascotBreathe", "prefers-reduced-motion:reduce"]) {
  if (!siteCss.includes(marker)) fail(`Shopier kartı veya maskot hareketi stili eksik: ${marker}`);
}
const siteScript = await readFile(path.join(dist, "assets", "js", "script.js"), "utf8");
const supportScript = await readFile(path.join(dist, "assets", "js", "support-widget.js"), "utf8");
if (!siteScript.includes("is-scrolled") || !siteScript.includes("aria-expanded','false")) fail("Sticky menü durumu veya mobil menü kapanış senkronu eksik.");
for (const marker of ["data-support-toggle", "data-support-panel", "aria-controls=\"support-widget-panel\"", "lina_support_bubble_count"]) {
  if (!home.includes(marker) && !supportScript.includes(marker)) fail(`Destek widget işareti eksik: ${marker}`);
}
if (!supportScript.includes("event.key === 'Escape'")) fail("Destek widget ESC ile kapanmıyor.");
for (const timing of ["FIRST_DELAY = 5000", "VISIBLE_DURATION = 6000", "REPEAT_DELAY = 90000", "MAX_SHOWS = 3"]) {
  if (!supportScript.includes(timing)) fail(`Destek balonu zamanlama sözleşmesi eksik: ${timing}`);
}

const telegramUrl = "https://t.me/LinaMacrosDestekBot";
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  if (!html.includes(`href="${telegramUrl}" target="_blank" rel="noopener noreferrer"`)) {
    fail(`${path.relative(dist, file)}: merkezi Telegram destek bağlantısı eksik.`);
  }
  if (html.includes("t.me/justalmora") || html.includes("@justalmora")) fail(`${path.relative(dist, file)}: kişisel Telegram desteği kalmış.`);
  const customerText = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/href=["'][^"']*["']/gi, " ").replace(/<[^>]+>/g, " ");
  if (/telegram\s+(destek\s+)?botu|bot\s+üzerinden\s+destek|botla\s+görüş/i.test(customerText)) {
    fail(`${path.relative(dist, file)}: müşteriye gösterilen teknik Telegram botu ifadesi kalmış.`);
  }
}
for (const name of ["main", "faq-right", "support", "trust", "corner"]) {
  for (const extension of ["png", "webp"]) {
    if (!await exists(path.join(dist, "assets", "images", "mascots", `lina-mascot-${name}.${extension}`))) {
      fail(`Maskot dosyası eksik: lina-mascot-${name}.${extension}`);
    }
  }
}
for (const marker of ["lina-mascot-main.webp", "lina-mascot-faq-right.webp", "lina-mascot-support.webp", "lina-mascot-corner-transparent.webp"]) {
  if (!home.includes(marker)) fail(`Ana sayfada maskot kullanımı eksik: ${marker}`);
}
if (!home.includes("lina-mascot-corner-transparent.webp")) fail("Şeffaf optimize köşe maskotu kullanılmıyor.");
const cornerMetadata = await sharp(path.join(dist, "assets", "images", "mascots", "lina-mascot-corner-transparent.webp")).metadata();
if (!cornerMetadata.hasAlpha || cornerMetadata.width !== 360 || cornerMetadata.height !== 450) {
  fail("Şeffaf köşe maskotu 360x450 alfa kanallı WebP değil.");
}
if (!home.includes('loading="lazy"') || !home.includes('width="720" height="900"')) fail("Maskot boyut sabitleme veya lazy-load eksik.");

const analyticsScript = await readFile(path.join(dist, "assets", "js", "consent-analytics.js"), "utf8");
for (const marker of ["click_shopier", "click_campaign_shopier", "click_outbound", "3_al_2_ode_2026", "campaign_name", "placement", "product_name", "game", "destination_url", "analytics_storage", "lina_analytics_consent_v1"]) {
  if (!analyticsScript.includes(marker)) fail(`Analytics betiğinde ${marker} eksik.`);
}
if ((analyticsScript.match(/click_campaign_shopier/g) ?? []).length !== 1) fail("Kampanya tıklama etkinliği betikte bir kez tanımlanmalı.");
const campaignScript = await readFile(path.join(dist, "assets", "js", "campaign.js"), "utf8");
for (const marker of ["data-campaign", "Date.now() + clockOffset", 'response.headers.get("date")', "visibilitychange", "MAX_TIMER_DELAY"]) {
  if (!campaignScript.includes(marker)) fail(`İstemci kampanya bitiş koruması eksik: ${marker}`);
}
const workflow = await readFile(path.join(root, ".github", "workflows", "deploy-pages.yml"), "utf8");
if (!workflow.includes('cron: "0 6 * * *"') || !workflow.includes("workflow_dispatch:") || !workflow.includes("branches: [main]")) {
  fail("Günlük 09.00 Türkiye, manuel veya main push yayın tetikleyicisi korunmadı.");
}
if (!analyticsScript.includes('document.createElement("script")') || !analyticsScript.includes("googletagmanager.com/gtag/js")) {
  fail("GA4 etiketi rıza sonrasında dinamik yüklenmiyor.");
}

const sitemap = await readFile(path.join(dist, "sitemap.xml"), "utf8");
const sitemapLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const sitemapUrls = new Set(sitemapLocations);
for (const product of activeProducts) expectedUrls.add(`${siteData.url}${productUrl(product)}`);
for (const url of expectedUrls) {
  if (!sitemapUrls.has(url)) fail(`Sitemap URL eksik: ${url}`);
}
const expectedSitemapSize = publishedSources.length + activeProducts.length + 3;
if (sitemapLocations.length !== sitemapUrls.size) fail("Sitemap içinde tekrarlanan URL var.");
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

console.log(`Doğrulama başarılı: ${sourcePosts.length} kaynak makalenin ${publishedSources.length} adedi yayında; ${htmlFiles.length} HTML sayfası, ${expectedSitemapSize} sitemap URL'si, ${jsonLdBlockCount} JSON-LD bloğu ve tüm SEO/Shopier/GA4-rıza/favicon kontrolleri geçti.`);
console.log(`İç bağlantılar: ${internalLinkCount} hedef, ${postPackageLinkCount} yazı içi paket/bölüm bağlantısı ve ${rulesGuideCount} satış çağrısız kural rehberi doğrulandı.`);
