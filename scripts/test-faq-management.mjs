import { readFile } from "node:fs/promises";

const faqs = JSON.parse(await readFile("src/_data/faqs.json", "utf8"));
const pagesConfig = await readFile(".pages.yml", "utf8");

if (!Array.isArray(faqs)) throw new Error("S.S.S. veri kaynağı bir JSON listesi olmalı.");
if (!/name:\s*faqs[\s\S]*?type:\s*file[\s\S]*?path:\s*src\/_data\/faqs\.json[\s\S]*?list:\s*true/.test(pagesConfig)) {
  throw new Error("Pages CMS S.S.S. kaynağı üst düzey JSON listesi olarak yapılandırılmamış.");
}

const orders = new Set();
for (const [index, faq] of faqs.entries()) {
  if (!faq || typeof faq !== "object" || Array.isArray(faq)) throw new Error(`${index + 1}. S.S.S. kaydı bir nesne olmalı.`);
  for (const key of ["question", "answer", "category", "order", "active"]) {
    if (!(key in faq)) throw new Error(`${index + 1}. S.S.S. kaydında ${key} alanı eksik.`);
  }
  if (typeof faq.question !== "string" || typeof faq.answer !== "string" || typeof faq.category !== "string") {
    throw new Error(`${index + 1}. S.S.S. kaydının soru, cevap ve kategori alanları metin olmalı.`);
  }
  if (!faq.question.trim() || !faq.answer.trim() || !faq.category.trim()) throw new Error(`${index + 1}. S.S.S. kaydı boş alan içeriyor.`);
  if (!Number.isFinite(faq.order) || !Number.isInteger(faq.order) || faq.order < 0) {
    throw new Error(`${index + 1}. S.S.S. kaydının sıralaması sıfır veya daha büyük bir tam sayı olmalı.`);
  }
  if (orders.has(faq.order)) throw new Error(`${index + 1}. S.S.S. kaydının ${faq.order} sıralama değeri başka bir kayıtla aynı.`);
  orders.add(faq.order);
  if (typeof faq.active !== "boolean") throw new Error(`${index + 1}. S.S.S. kaydının Aktif alanı boolean olmalı.`);
}

// CMS işlemlerini kaynak dosyayı değiştirmeden bellekte taklit eder.
const workingCopy = structuredClone(faqs);
const originalLength = workingCopy.length;
const nextOrder = Math.max(-1, ...workingCopy.map((faq) => faq.order)) + 1;
workingCopy.push({ question: "Aktif test sorusu", answer: "Test cevabı", category: "Test", order: nextOrder, active: true });
workingCopy.push({ question: "Pasif test sorusu", answer: "Gizli test cevabı", category: "Test", order: nextOrder + 1, active: false });
if (workingCopy.length !== originalLength + 2) throw new Error("Dinamik soru ekleme testi başarısız.");

const visibleFaqs = workingCopy
  .filter((faq) => faq.active === true && faq.question.trim() && faq.answer.trim())
  .sort((a, b) => a.order - b.order);
if (!visibleFaqs.some((faq) => faq.question === "Aktif test sorusu")) throw new Error("Aktif soru filtreleme testi başarısız.");
if (visibleFaqs.some((faq) => faq.question === "Pasif test sorusu")) throw new Error("Pasif soru gizleme testi başarısız.");
if (visibleFaqs.some((faq, index) => index > 0 && visibleFaqs[index - 1].order > faq.order)) throw new Error("S.S.S. sıralama testi başarısız.");

workingCopy.splice(-1, 1);
workingCopy.splice(-1, 1);
if (workingCopy.length !== originalLength) throw new Error("Soru silme testi başarısız.");

console.log(`S.S.S. yönetim testi başarılı: ${faqs.length} kayıt doğrulandı; dinamik ekleme, aktif/pasif filtreleme, sıralama ve silme davranışları geçti.`);
