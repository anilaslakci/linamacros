import { readFile } from "node:fs/promises";

const faqs = JSON.parse(await readFile("src/_data/faqs.json", "utf8"));
const pagesConfig = await readFile(".pages.yml", "utf8");

if (!Array.isArray(faqs) || faqs.length !== 5) throw new Error(`5 mevcut S.S.S. kaydı bekleniyordu, ${faqs.length} bulundu.`);
if (!/name:\s*faqs[\s\S]*?type:\s*file[\s\S]*?path:\s*src\/_data\/faqs\.json[\s\S]*?list:\s*true/.test(pagesConfig)) {
  throw new Error("Pages CMS S.S.S. kaynağı üst düzey JSON listesi olarak yapılandırılmamış.");
}

for (const [index, faq] of faqs.entries()) {
  for (const key of ["question", "answer", "category", "order", "active"]) {
    if (!(key in faq)) throw new Error(`${index + 1}. S.S.S. kaydında ${key} alanı eksik.`);
  }
  if (!faq.question.trim() || !faq.answer.trim() || !faq.category.trim()) throw new Error(`${index + 1}. S.S.S. kaydı boş alan içeriyor.`);
}

// CMS işlemlerini kaynak dosyayı değiştirmeden bellekte taklit eder.
const workingCopy = structuredClone(faqs);
workingCopy.push({ question: "Test sorusu", answer: "Test cevabı", category: "Test", order: 999, active: true });
if (workingCopy.length !== 6) throw new Error("Yeni soru ekleme testi başarısız.");
workingCopy[0].question = "Düzenlenmiş test sorusu";
if (workingCopy[0].question !== "Düzenlenmiş test sorusu") throw new Error("Soru düzenleme testi başarısız.");
workingCopy[0].active = false;
const visibleFaqs = workingCopy.filter((faq) => faq.active && faq.question.trim() && faq.answer.trim()).sort((a, b) => a.order - b.order);
if (visibleFaqs.some((faq) => faq.question === "Düzenlenmiş test sorusu")) throw new Error("Pasifleştirme testi başarısız.");
workingCopy.splice(-1, 1);
if (workingCopy.length !== 5) throw new Error("Soru silme testi başarısız.");

console.log("S.S.S. yönetim testi başarılı: 5 kayıt korundu; ekleme, düzenleme, pasifleştirme, sıralama ve silme işlemleri doğrulandı.");
