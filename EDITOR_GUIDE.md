# Lina Macros Blog Editörü — Kısa Kullanım Rehberi

## İlk kurulum (bir kez)

1. Tarayıcıda `https://app.pagescms.org/` adresini açın.
2. **GitHub ile giriş yap** seçeneğini kullanın.
3. GitHub, Pages CMS uygulamasını hangi depoya kuracağınızı sorunca **Only select repositories** seçin.
4. Yalnızca **anilaslakci/linamacros** deposunu işaretleyin.
5. Pages CMS içinde `anilaslakci/linamacros` deposunu ve `main` dalını açın.

Başka depo veya hesaplara yetki vermeniz gerekmez. Herhangi bir tokenı dosyaya veya bu siteye yapıştırmayın.

## Yeni blog yazısı ekleme

1. Sol menüden **Blog Yazıları** bölümüne girin.
2. **New Blog Yazıları** düğmesine basın.
3. Dosya adı alanına yalnızca küçük harf, rakam ve tire kullanarak kalıcı URL'yi yazın. Örnek: `pubg-yeni-baslayanlar-rehberi.md`
4. Başlık, meta açıklaması, yayın tarihi, güncelleme tarihi, kategori, okuma süresi ve anahtar konuları doldurun.
5. Makale metnini **Makale içeriği** alanında yazın.
6. **Save** ile kaydedin.

Kaydetme sonrasında teknik işlemler otomatik gerçekleşir: makale URL'si, sayfa başlığı, meta description, canonical, Open Graph, BlogPosting JSON-LD, ilgili yazılar, sitemap ve robots ayarları derleme sırasında oluşturulur.

## Mevcut yazıyı güncelleme

1. **Blog Yazıları** listesinden yazıyı açın.
2. İçeriği ve gerekiyorsa başlık/meta açıklamasını düzenleyin.
3. **Güncelleme tarihi** alanını bugünün tarihi yapın.
4. Kaydedin.

Dosya adı sonradan değiştirilemez. Bu özellik eski bağlantıların ve Google'daki URL'nin kazara bozulmaması için kapalıdır.

## Yayının tamamlandığını kontrol etme

1. GitHub'da `anilaslakci/linamacros` deposunun **Actions** sekmesini açın.
2. En üstteki `Build, test and deploy GitHub Pages` satırının yeşil tik olmasını bekleyin.
3. Ardından `https://linamacros.com.tr/blog/` sayfasını yenileyin.

Kırmızı hata görülürse aynı yazıyı art arda yeniden kaydetmeyin; workflow ayrıntısını teknik destekle paylaşın.

## Yazı için kısa kalite kontrolü

- Başlık 20–70 karakter olsun.
- Meta açıklaması 120–160 karakter olsun.
- Başlık ve açıklama o yazıya özel olsun.
- İlk paragraf okuyucunun sorusuna doğrudan yanıt versin.
- H2 başlıklarla konuyu bölün.
- Resmî veya birincil kaynakları bağlantı vererek kullanın.
- Başka sitelerden metin kopyalamayın.
- Konuyla ilgili mevcut Lina Macros rehberlerine doğal bağlantı verin.
- Oyun kuralları değişebileceği için politika içeren yazılarda resmî kaynağı yeniden kontrol edin.
