# Lina Macros

Lina Macros'un `linamacros.com.tr` üzerinde yayınlanan statik web sitesi. Mevcut landing page tasarımı ve Shopier satın alma bağlantıları korunmuştur; blog içeriği Pages CMS üzerinden teknik dosyalara dokunmadan düzenlenebilir.

## Yapı

- `src/index.njk`: ana sayfa
- `src/blog/posts/*.md`: blog yazıları
- `.pages.yml`: Pages CMS editör alanları
- `eleventy.config.js`: statik site üretimi
- `scripts/validate-site.mjs`: SEO, bağlantı, sitemap ve favicon kontrolleri
- `.github/workflows/deploy-pages.yml`: otomatik test ve GitHub Pages yayını
- `dist/`: yerel derlemede üretilir, Git'e eklenmez

## Yerel önizleme

Node.js 22 veya daha yeni sürüm gerekir.

```powershell
npm ci
npm run dev
```

Terminalde gösterilen yerel adresi tarayıcıda açın.

## Kontrol ve derleme

```powershell
npm run check
```

Bu komut siteyi `dist/` klasörüne üretir ve şunları otomatik kontrol eder:

- 10 blog yazısı ve 12 sitemap URL'si
- title, meta description, canonical, Open Graph ve BlogPosting JSON-LD
- iç bağlantılar ve dört mevcut Shopier ürün bağlantısı
- `robots.txt`, `CNAME` ve favicon dosyaları
- 180×180, 192×192, 512×512 ve 1200×630 görsel boyutları
- kaynakta yanlışlıkla token veya secret bulunmaması

## Blog yazısı ekleme

Kullanıcı akışı [EDITOR_GUIDE.md](EDITOR_GUIDE.md) dosyasında anlatılmıştır. Özetle:

1. `https://app.pagescms.org/` adresinde GitHub ile giriş yapılır.
2. Pages CMS GitHub App yalnızca `anilaslakci/linamacros` deposuna yetki verilerek kurulur.
3. `Blog Yazıları` bölümünden yeni yazı oluşturulur veya mevcut yazı düzenlenir.
4. Kaydetme işlemi `main` dalına içerik commit'i ekler.
5. GitHub Actions otomatik olarak derler, test eder ve GitHub Pages'a yayınlar.

CMS'de silme ve dosya adını sonradan değiştirme kapalıdır. Böylece mevcut URL'lerin kazara bozulması önlenir.

## GitHub Pages ilk geçişi

Bu proje özel GitHub Actions workflow'u kullanır. İlk yayın öncesinde GitHub deposunda:

1. **Settings > Pages** açılır.
2. **Build and deployment > Source** alanı **GitHub Actions** yapılır.
3. `main` dalına gönderilen değişiklikten sonra **Actions** sekmesindeki `Build, test and deploy GitHub Pages` işi izlenir.
4. Başarılı yayın sonunda `https://linamacros.com.tr/`, `/blog/`, `/sitemap.xml` ve `/robots.txt` kontrol edilir.

`CNAME` dosyası derleme çıktısında korunur. Mevcut ayrı Cloudflare Pages projesi bu akışın parçası değildir ve değiştirilmez.

## Güvenlik

- Depoda erişim anahtarı, token veya CMS parolası tutulmaz.
- GitHub Actions, GitHub'ın çalışma anında verdiği kısa ömürlü `GITHUB_TOKEN` yetkisini kullanır.
- Workflow yalnızca `contents: read`, `pages: write` ve `id-token: write` izinlerine sahiptir.
- Pages CMS erişimi GitHub App üzerinden yalnızca seçilen depoya verilmelidir.
- Canlı çıktı yalnızca statik HTML, CSS, JavaScript ve görsellerden oluşur; ziyaretçi tarafında CMS anahtarı bulunmaz.

## Shopier bağlantıları

- PUBG Steam: https://www.shopier.com/linamacros/33482000
- PUBG Mobile: https://www.shopier.com/linamacros/33090562
- Valorant: https://www.shopier.com/linamacros/33088510
- CS2: https://www.shopier.com/linamacros/33086748
