---
title: "CS2 Hassasiyet Ayarı: DPI, eDPI ve Test Rehberi"
description: "CS2 hassasiyet ayarınızı DPI ve eDPI hesabıyla karşılaştırın; 180 derece dönüş, mikro düzeltme ve hedef takibi testleriyle tutarlı değeri bulun."
date: 2026-10-14
updated: 2026-10-14
category: CS2
readingTime: 8
tags:
  - CS2 hassasiyet ayarı
  - CS2 eDPI
  - CS2 DPI
  - CS2 mouse ayarları
---

CS2’de hassasiyet seçimi, hızlı dönüş ile hassas mikro düzeltme arasında kişisel bir dengedir. Başka bir oyuncunun ayarını kopyalamak bu dengeyi otomatik olarak kurmaz; çünkü DPI, mousepad alanı, çözünürlük algısı ve kol-bilek kullanımı farklıdır.

Kendi ayarınızı bulmak için ölçülebilir üç teste ve birkaç gün süren sabit bir deneme dönemine ihtiyacınız vardır.

## CS2 eDPI nasıl hesaplanır?

Farklı DPI değerlerini karşılaştırmak için şu basit formülü kullanın:

`eDPI = mouse DPI × CS2 sensitivity`

Örneğin:

- 400 DPI × 2,0 sensitivity = 800 eDPI
- 800 DPI × 1,0 sensitivity = 800 eDPI
- 1600 DPI × 0,5 sensitivity = 800 eDPI

Bu profiller benzer temel dönüş ölçeği sağlar. eDPI, oyuncu kalitesini ölçmez ve size ideal sayı söylemez; yalnızca ayarları ortak bir ölçekte kıyaslamanıza yardım eder.

## Başlangıç koşullarını sabitleyin

Testten önce şunları not edin:

- Mouse DPI değeri
- CS2 sensitivity değeri
- Kullanılabilir mousepad genişliği
- Monitör yenileme hızı
- Ortalama ve en düşük FPS davranışı
- Mouse ağırlığı ve tutuş biçimi

Farklı kare süresi veya yanlış yenileme hızı, nişan hissini değiştirebilir. Windows ve ekran tarafını kontrol etmek için [FPS ve input lag azaltma rehberini](/blog/oyunlarda-fps-ve-input-lag-azaltma-rehberi/) kullanın.

## 180 derece dönüş testi

Bir Practice veya Workshop haritasında duvardaki sabit bir referansa bakın. Mouse’u rahat başlangıç noktasından kontrollü biçimde yana hareket ettirin.

- Tek harekette 180 dereceyi sürekli aşıyorsanız sensitivity yüksek olabilir.
- Mousepad sonuna ulaşıp dönemiyorsanız düşük olabilir.
- Dönüş tamamlanıyor fakat hareket sonunda bileğiniz geriliyorsa ergonomiyi de değerlendirin.

Değeri yüzde 5–10’dan büyük olmayan adımlarla değiştirin. Her adımda en az 10 tekrar yapın.

## Mikro düzeltme testi

CS2’de uzak bir kafa açısı, çok küçük hareket gerektirebilir. İki yakın referans noktası seçin ve aralarında tek hareketle geçin. Hedefi sürekli geçmek, sensitivity’nin size göre yüksek olduğuna işaret edebilir. Birkaç ek düzeltme gerektirmek ise düşük olabileceğini gösterir.

Bu testi hem sağa hem sola yapın. Tek yöndeki başarısızlık, sayıdan çok kol pozisyonu veya mousepad sınırıyla ilgili olabilir.

## Hedef takibi ve durdurma testi

Hareketli bir hedefi kısa süre izleyin, ardından belirli noktada durun. İyi ayar hem takibi hem anlık durdurmayı yönetebilmelidir.

Sadece flick skoruna bakmayın. Şu soruları not edin:

- Hedefe ilk harekette ulaşıyor musunuz?
- Durduktan sonra geri düzeltme gerekiyor mu?
- Uzun takipte kol veya bilek geriliyor mu?
- Yakın hedefte mouse’u kaldırmak zorunda kalıyor musunuz?

## Zoom sensitivity ayrı mı ayarlanmalı?

AWP veya dürbünlü silah kullanıyorsanız önce normal sensitivity’yi sabitleyin. Zoom sensitivity’yi aynı anda değiştirmeniz, hatanın kaynağını gizler. Normal ayar birkaç gün tutarlı kaldıktan sonra dürbünlü mikro düzeltmeleri ayrıca test edin.

Bir değeri yalnızca tek etkileyici klip veya maç üzerinden değiştirmeyin. AWP performansındaki sorun; crosshair yerleşimi, pozisyon, duruş zamanı veya bağlantı gecikmesi de olabilir.

## Ayarlar arasında dönüşüm yaparken

DPI değiştirdiğinizde mevcut eDPI’ı korumak için:

`yeni sensitivity = mevcut eDPI ÷ yeni DPI`

Örneğin 800 eDPI’ı 1600 DPI ile sürdürmek için sensitivity başlangıç değeri 0,5 olur. Bu matematiksel eşleştirme ilk adımı sağlar; gerçek oyunda yeniden test gereklidir.

Farklı oyunlar arasında dönüştürme yaparken yalnızca tek bir çevrim sitesine güvenmeyin. Oyunların görüş alanı, zoom davranışı ve hissi farklıdır. Dönüşüm sonucunu başlangıç noktası olarak kullanın.

## Beş günlük test planı

### 1. gün: Temel ölçüm

180 derece dönüş ve mikro düzeltme testlerini yapın. Sadece bir kez ayar değiştirin.

### 2. gün: Statik hedef

İlk mermi ve hedef geçişi çalışın. Taşma yönünü not edin.

### 3. gün: Hareketli hedef

Takip ve durdurma testi uygulayın. Mousepad sınırlarını gözlemleyin.

### 4. gün: Deathmatch

Skordan çok crosshair yerleşimi ve ilk düzeltme sayısına odaklanın.

### 5. gün: Karar

Notları karşılaştırın. Sorun tek yönde ve tekrar ediyorsa küçük bir değişiklik yapın; sonuç karışıksa değeri koruyup bir hafta daha deneyin.

## Yaygın hatalar

### Sürekli ayar değiştirmek

Her gün başka değer kullanmak karşılaştırma verisini bozar. Değişiklik günlüğü tutun.

### Çözünürlüğü sihirli çözüm sanmak

Görüntü oranı ve çözünürlük hedeflerin algılanan biçimini etkileyebilir; fakat fiziksel mouse hareketindeki temel kontrol sorununun tek çözümü değildir.

### Yüksek FPS ile kararlı FPS’i karıştırmak

Kısa süreli tepe değerinden çok kare sürelerinin tutarlılığı önemlidir. Arka plan uygulamalarını, sıcaklıkları ve güç durumunu gözlemleyin.

### Otomasyonla recoil veya hareket uygulamak

Valve, bir girdiden birden çok oyuncu aksiyonunu otomatikleştiren donanım veya script kullanımına karşı çizgisini açıkça belirtmiştir. Trusted Mode ayrıca üçüncü taraf dosyaların oyun sürecine müdahalesini varsayılan olarak engeller. Ayrıntılar için [CS2 recoil ve spray antrenmanı](/blog/cs2-recoil-kontrolu-ve-spray-antrenmani/) ve [makro kuralları](/blog/pubg-valorant-cs2-makro-yasak-mi/) rehberlerine bakın.

## Sonuç

En iyi CS2 sensitivity, yakın dönüşü mousepad’inize sığdırırken uzak hedefte mikro düzeltmeye izin veren ve farklı günlerde aynı kalan değerdir. eDPI ile kayıt tutun, küçük adımlarla değiştirin ve kararı tek maç yerine tekrar eden veriye dayandırın.

## Kaynaklar

- [Counter-Strike 2 güncellemesi: Practice ve Workshop haritaları](https://www.counter-strike.net/newsentry/532126482488623360)
- [Steam Support: CS2 Trusted Mode](https://help.steampowered.com/en/faqs/view/09A0-4879-4353-EF95)
- [Counter-Strike: otomasyonla ilgili resmî güncelleme duyurusu](https://store.steampowered.com/news/posts/?appids=730&enddate=1724194853)
