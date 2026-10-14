---
title: "Gaming Mouse DPI, Polling Rate ve Profil Ayarları"
description: "Gaming mouse DPI, polling rate ve uygulama profillerini doğru kurun; yanlış kademe değişimini önleyin, ayarlarınızı ölçün ve güvenli biçimde yedekleyin."
date: 2026-10-14
updated: 2026-10-14
category: Teknik Rehber
readingTime: 8
tags:
  - gaming mouse ayarları
  - mouse DPI ayarı
  - polling rate nedir
  - mouse profil ayarı
---

Gaming mouse yazılımları çok sayıda seçenek sunar: DPI kademeleri, polling rate, lift-off distance, angle snapping, tuş atamaları, uygulama profilleri ve dahili bellek. Hepsini en yüksek değere almak doğru başlangıç değildir. İyi profil; tutarlı, kolay doğrulanabilir ve yanlışlıkla değişmeyecek kadar sadedir.

Bu rehberde PUBG, Valorant ve CS2 gibi oyunlar için mouse profilinin temelini kuracağız. Rekabetçi eylemleri otomatikleştiren makro veya script ayarları bu kapsamda değildir.

## DPI nedir?

DPI, mouse’un fiziksel harekete karşı ürettiği sayım yoğunluğunu ifade eder. Yüksek DPI’da aynı el hareketi daha fazla imleç hareketi üretir; düşük DPI’da daha az üretir. Oyun içi hassasiyet bu girdiyi yeniden ölçekler.

Bu nedenle yalnızca DPI’a bakarak “hızlı” veya “yavaş” ayar kararı verilmez. Oyun içi değerle birlikte değerlendirilir. Valorant ve CS2 için eDPI hesabı kullanışlıdır:

`eDPI = DPI × oyun içi hassasiyet`

[Valorant eDPI rehberi](/blog/valorant-hassasiyet-ayari-edpi-hesaplama/) ve [CS2 hassasiyet rehberi](/blog/cs2-hassasiyet-ayari-edpi-rehberi/) farklı profilleri karşılaştırma adımlarını içerir.

## Kaç DPI kademesi kullanmalısınız?

Birçok mouse varsayılan olarak dört veya beş DPI kademesiyle gelir. Oyun sırasında DPI düğmesine yanlışlıkla basmak hassasiyeti aniden değiştirebilir. Sık kullanmadığınız kademeleri kaldırın veya yalnızca iki açıkça farklı profil bırakın.

Örnek sade kurulum:

- Oyun profili: tek sabit DPI
- Masaüstü/üretkenlik profili: ihtiyaca uygun ikinci DPI
- DPI düğmesi: devre dışı veya güvenli başka bir tek tuş işlevi

Profiller arasında otomatik geçiş kullanıyorsanız oyunun çalıştırılabilir dosyasının doğru seçildiğini kontrol edin. Launcher ile oyun dosyası farklı olabilir.

## Polling rate nedir?

Polling rate, mouse’un bilgisayara saniyede kaç kez rapor gönderdiğini belirtir. Teorik rapor aralıkları yaklaşık olarak şöyledir:

| Polling rate | Teorik rapor aralığı |
| ---: | ---: |
| 125 Hz | 8 ms |
| 500 Hz | 2 ms |
| 1000 Hz | 1 ms |
| 2000 Hz | 0,5 ms |
| 4000 Hz | 0,25 ms |
| 8000 Hz | 0,125 ms |

Bu tablo yalnızca USB rapor aralığını gösterir; toplam sistem input lag’i değildir. Oyun motoru, CPU/GPU, ekran ve monitör gecikmesi de zincire eklenir.

Çok yüksek polling rate, destekleyen mouse ve güçlü sistemde daha sık veri sağlayabilir. Ancak bazı sistemlerde CPU yükünü veya kare süresi dalgalanmasını artırabilir. Önce 1000 Hz gibi yaygın bir değerde kararlılığı doğrulayın; daha yükseğini aynı sahne ve performans ölçümüyle test edin.

## Angle snapping ve mouse acceleration

**Angle snapping**, fiziksel hareketi daha düz çizgiye dönüştürmeye çalışır. Çizim işinde yararlı olabilir; hassas FPS nişanında istemediğiniz düzeltme üretebilir. Tercihinizi test edin ve ne yaptığını bilmeden açmayın.

**Acceleration**, hızlı ve yavaş el hareketlerini farklı oranda ölçekler. Bazı oyuncular bilinçli olarak kullanabilir; ancak yeni bir temel profil kurarken tutarlılığı değerlendirmek için kapalı ve sabit bir başlangıç daha kolay ölçülür. İşletim sistemi ve üretici yazılımında birden fazla hızlandırma katmanı bırakmayın.

## Lift-off distance ve yüzey ayarı

Lift-off distance, mouse’u kaldırdığınızda sensörün takibi hangi yükseklikte bıraktığını etkiler. Düşük hassasiyet kullanan ve mouse’u sık kaldıran oyuncular düşük mesafeyi tercih edebilir. Çok düşük ayar bazı yüzeylerde takibi kesebilir.

Yüzey kalibrasyonu yaparken mousepad’i temiz ve düz tutun. Ayar sonrası hızlı ve yavaş hareketlerde sensör atlaması olup olmadığını kontrol edin.

## Oyun profili nasıl adlandırılmalı?

Profil adında en az şu bilgileri görünür tutun:

`OYUN - DPI - POLLING RATE - TARİH`

Örnek: `CS2 - 800 DPI - 1000 Hz - 2026-10`

Bu düzen, eski ayarla yeniyi karıştırmanızı önler. Bulut senkronizasyonu varsa yerel dışa aktarma yedeği de alın. Hesap parolanızı veya üretici oturum bilgilerinizi profil dosyasıyla paylaşmayın.

## Tuş atamalarında güvenli sınır

Tek bir fiziksel düğmeyi başka bir tek tuşa eşlemek ile tek basışta çok sayıda oyun aksiyonu üretmek aynı değildir. Rekabetçi oyunlarda çoklu aksiyon, zamanlama, recoil veya hareket otomasyonu hesap yaptırımı riski taşıyabilir.

Profilinizi gözden geçirirken:

- Tek basışın kaç çıktı ürettiğini kontrol edin.
- Repeat/toggle işlevlerini kapatın.
- Gecikmeli komut dizilerini kaldırın.
- Eski oyunlardan kalan scriptleri silin.
- Rekabetçi profile yalnızca gerekli tek tuş atamalarını koyun.

Oyunlara göre ayrıntılı politika karşılaştırması için [PUBG, Valorant ve CS2’de makro yasak mı?](/blog/pubg-valorant-cs2-makro-yasak-mi/) rehberine bakın.

## Profili test etme sırası

1. DPI değerini doğrulayın.
2. Polling rate’i seçin ve performans dalgalanmasını gözleyin.
3. DPI kademesi düğmesini test edin.
4. Oyun açılınca doğru profilin etkinleştiğini doğrulayın.
5. Practice alanında 180 derece dönüş ve mikro düzeltme yapın.
6. Oyunu kapatınca masaüstü profilinin geri geldiğini kontrol edin.
7. Bilgisayar yeniden başladıktan sonra ayarın korunduğunu doğrulayın.

Her adımda tek değişken kullanın. DPI ve polling rate’i aynı anda değiştirirseniz farkın kaynağını ayırmak zorlaşır.

## Kablosuz kullanım için kısa kontrol listesi

- Alıcıyı güçlü kablosuz parazit kaynaklarından uzak tutun.
- Üreticinin önerdiği uzatma adaptörünü kullanın.
- Pil seviyesi ve güç tasarrufu modunu kontrol edin.
- Firmware’i resmî üretici uygulamasından güncelleyin.
- Sorun teşhisinde farklı USB portu deneyin.
- Bilinmeyen firmware veya üçüncü taraf sürücü kurmayın.

## Sonuç

İyi gaming mouse profili karmaşık değil, öngörülebilirdir: tek sabit DPI, sistemin kaldırdığı kararlı polling rate, açık profil adı ve gereksiz otomasyonlardan arındırılmış tuş düzeni. Ayarı yedekleyin, oyun içinde doğrulayın ve performans değişikliklerini ölçerek yapın.

## Kaynaklar

- [Microsoft: ekran yenileme hızı ve oyun deneyimi](https://support.microsoft.com/en-au/windows/hardware/display-graphics/change-the-refresh-rate-on-your-monitor-in-windows)
- [NVIDIA: uçtan uca sistem gecikmesinin ölçümü](https://www.nvidia.com/en-us/geforce/news/reflex-latency-analyzer-360hz-g-sync-monitors/)
- [Riot Games: üçüncü taraf uygulamalar politikası](https://support.riotgames.com/en-us/riot/events/third-party-applications)
