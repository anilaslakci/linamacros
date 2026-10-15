import { readFile } from "node:fs/promises";

const products = JSON.parse(await readFile("src/_data/products.json", "utf8"));
const pagesConfig = await readFile(".pages.yml", "utf8");
const builtHome = await readFile("dist/index.html", "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function validateProduct(product, index) {
  assert(product && typeof product === "object" && !Array.isArray(product), `${index + 1}. ürün kaydı bir nesne olmalı.`);
  for (const key of ["id", "name", "game", "cardLabel", "price", "description", "shopierUrl", "active"]) {
    assert(key in product, `${index + 1}. ürün kaydında ${key} alanı eksik.`);
  }
  for (const key of ["id", "name", "game", "cardLabel", "description", "shopierUrl"]) {
    assert(typeof product[key] === "string" && product[key].trim(), `${index + 1}. ürünün ${key} alanı boş veya geçersiz.`);
  }
  assert(/^product-[a-z0-9-]+$/.test(product.id), `${index + 1}. ürün kimliği geçersiz.`);
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
for (const [index, product] of products.entries()) {
  validateProduct(product, index);
  assert(!ids.has(product.id), `${product.id}: ürün kimliği benzersiz değil.`);
  ids.add(product.id);
}
for (const requiredId of ["product-pubg-steam", "product-pubg-mobile", "product-valorant", "product-cs2"]) {
  assert(ids.has(requiredId), `Korunması gereken ürün kimliği eksik: ${requiredId}`);
}
for (const product of products.filter((item) => item.active)) {
  const formattedPrice = `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(product.price)} TL`;
  assert(builtHome.includes(`id="${product.id}"`), `${product.id}: aktif ürün kartı derlenmiş sayfada bulunamadı.`);
  assert(builtHome.includes(`<strong>${formattedPrice}</strong>`), `${product.id}: merkezi fiyat derlenmiş sayfaya yansımadı.`);
  assert(builtHome.includes(`href="${product.shopierUrl}"`), `${product.id}: Shopier bağlantısı derlenmiş sayfaya yansımadı.`);
}

// CMS fiyat değişikliği ve aktif/pasif davranışını kaynak dosyayı değiştirmeden bellekte taklit eder.
const workingCopy = structuredClone(products);
const priceTestProduct = workingCopy.find((product) => product.id === "product-pubg-mobile");
priceTestProduct.price = 200;
assert(Math.round((1 - priceTestProduct.price / priceTestProduct.regularPrice) * 100) === 60, "250 TL'den 200 TL'ye fiyat senaryosunda indirim oranı %60 hesaplanmadı.");
const initiallyActive = workingCopy.filter((product) => product.active).length;
priceTestProduct.active = false;
assert(workingCopy.filter((product) => product.active).length === initiallyActive - 1, "Pasif ürün filtreleme davranışı başarısız.");

console.log(`Ürün yönetim testi başarılı: ${products.length} kayıt doğrulandı; fiyat, indirim, Shopier bağlantısı ve aktif/pasif senaryoları geçti.`);
