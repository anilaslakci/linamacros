import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { activeProducts, productUrl, tryPrice } from "../lib/products.mjs";

const products = JSON.parse(await readFile("src/_data/products.json", "utf8"));
const pagesConfig = await readFile(".pages.yml", "utf8");
const builtHome = await readFile("dist/index.html", "utf8");
const sitemap = await readFile("dist/sitemap.xml", "utf8");

function validateProduct(product, index) {
  assert(product && typeof product === "object" && !Array.isArray(product), `${index + 1}. ürün kaydı bir nesne olmalı.`);
  for (const key of ["id", "slug", "name", "game", "cardLabel", "price", "description", "shopierUrl", "active"]) {
    assert(key in product, `${index + 1}. ürün kaydında ${key} alanı eksik.`);
  }
  for (const key of ["id", "slug", "name", "game", "cardLabel", "description", "shopierUrl"]) {
    assert(typeof product[key] === "string" && product[key].trim(), `${index + 1}. ürünün ${key} alanı boş veya geçersiz.`);
  }
  assert(/^product-[a-z0-9-]+$/.test(product.id), `${index + 1}. ürün kimliği geçersiz.`);
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.slug), `${product.id}: kalıcı URL parçası geçersiz.`);
  assert(Number.isFinite(product.price) && product.price > 0, `${product.id}: satış fiyatı sıfırdan büyük olmalı.`);
  if (product.regularPrice !== undefined && product.regularPrice !== null) {
    assert(Number.isFinite(product.regularPrice) && product.regularPrice > 0, `${product.id}: indirimsiz fiyat sıfırdan büyük olmalı.`);
    assert(product.regularPrice >= product.price, `${product.id}: indirimsiz fiyat satış fiyatından düşük olamaz.`);
  }
  assert(/^https:\/\/www\.shopier\.com\/linamacros\/\d+$/.test(product.shopierUrl), `${product.id}: Shopier ürün bağlantısı geçersiz.`);
  assert(typeof product.active === "boolean", `${product.id}: Aktif alanı boolean olmalı.`);
}

assert(Array.isArray(products) && products.length > 0, "Ürün veri kaynağı boş olmayan bir JSON listesi olmalı.");
assert(/name:\s*products[\s\S]*?label:\s*Ürünler ve Fiyatlar[\s\S]*?type:\s*file[\s\S]*?path:\s*src\/_data\/products\.json[\s\S]*?list:\s*true/.test(pagesConfig), "Pages CMS ürün kaynağı düzenlenebilir JSON listesi olarak yapılandırılmamış.");

const ids = new Set();
const slugs = new Set();
for (const [index, product] of products.entries()) {
  validateProduct(product, index);
  assert(!ids.has(product.id), `${product.id}: ürün kimliği benzersiz değil.`);
  assert(!slugs.has(product.slug), `${product.slug}: ürün slug'ı benzersiz değil.`);
  ids.add(product.id);
  slugs.add(product.slug);
}
for (const requiredId of ["product-pubg-steam", "product-pubg-mobile", "product-valorant", "product-cs2"]) {
  assert(ids.has(requiredId), `Korunması gereken ürün kimliği eksik: ${requiredId}`);
}
for (const product of products) {
  const url = productUrl(product);
  const file = `dist${url}index.html`;
  const inSitemap = sitemap.includes(`<loc>https://linamacros.com.tr${url}</loc>`);
  assert.equal(inSitemap, product.active, `${product.id}: sitemap kaydı aktiflik durumuyla eşleşmiyor.`);
  if (!product.active) {
    await assert.rejects(readFile(file, "utf8"), { code: "ENOENT" });
    continue;
  }

  const card = builtHome.split(`id="${product.id}"`)[1]?.split("</article>")[0];
  const detail = await readFile(file, "utf8");
  assert(card?.includes(`href="${url}"`), `${product.id}: kartın detay bağlantısı eksik.`);
  const layout = detail.match(/<div class="article-layout">\s*<div class="article-content">([\s\S]*?)<\/div>\s*<aside class="article-aside"[^>]*>([\s\S]*?)<\/aside>/);
  assert(layout, `${product.id}: detay sayfasında article-content ve article-aside sütunları eksik.`);
  const [, content, aside] = layout;
  const headingCount = (content.match(/<h2\b/g) ?? []).length;
  assert(headingCount >= 3, `${product.id}: article-content içinde en az 3 h2 olmalı.`);
  const purchaseCard = aside.match(/<section class="aside-card"[^>]*>([\s\S]*?)<\/section>/)?.[1];
  assert(purchaseCard, `${product.id}: kenar panelinde satın alma kartı eksik.`);
  for (const html of [card, purchaseCard]) {
    assert(html.includes(`<strong>${tryPrice(product.price)}</strong>`), `${product.id}: merkezi satış fiyatı karta ve detay sayfasına yansımalı.`);
    assert(html.includes(`href="${product.shopierUrl}"`), `${product.id}: Shopier bağlantısı karta ve detay sayfasına yansımalı.`);
    if (product.regularPrice) {
      assert(html.includes(`<del>${tryPrice(product.regularPrice)}</del>`), `${product.id}: indirimsiz fiyat karta ve detay sayfasına yansımalı.`);
    }
  }
}

// CMS fiyat değişikliği ve aktif/pasif davranışını kaynak dosyayı değiştirmeden bellekte taklit eder.
const workingCopy = structuredClone(products);
const priceTestProduct = workingCopy.find((product) => product.id === "product-pubg-mobile");
priceTestProduct.price = 200;
assert(Math.round((1 - priceTestProduct.price / priceTestProduct.regularPrice) * 100) === 60, "250 TL'den 200 TL'ye fiyat senaryosunda indirim oranı %60 hesaplanmadı.");
const initiallyActive = activeProducts(workingCopy).length;
priceTestProduct.active = !priceTestProduct.active;
assert.equal(activeProducts(workingCopy).length, initiallyActive + (priceTestProduct.active ? 1 : -1), "Aktif/pasif ürün filtreleme davranışı başarısız.");

console.log(`Ürün yönetim testi başarılı: ${products.length} benzersiz slug ve ${activeProducts(products).length} ürün sayfası doğrulandı; sayfa düzeni, başlıklar, fiyat, indirim, satın alma kartındaki Shopier bağlantısı ve aktif/pasif senaryoları geçti.`);
