---
title: "Oyunlarda FPS ve Input Lag Azaltma Rehberi"
description: "Windows, ekran, oyun ve arka plan ayarlarını doğru sırada kontrol ederek FPS dalgalanması ile input lag sorununu ölçün ve güvenli biçimde azaltın."
date: 2026-10-14
updated: 2026-10-14
category: Teknik Rehber
readingTime: 9
tags:
  - FPS artırma
  - input lag azaltma
  - oyun performans ayarları
  - Windows oyun ayarları
---

Yüksek FPS tek başına akıcı ve hızlı tepki veren bir oyun garantisi değildir. Ortalama FPS yüksek görünürken kare süreleri düzensiz olabilir; monitör yanlış yenileme hızında çalışabilir veya sistem gecikmesi başka bir aşamada oluşabilir. Bu nedenle “FPS artırma” ve “input lag azaltma” işini tek bir sihirli ayara değil, ölçümlü bir kontrol sırasına bağlamak gerekir.

Bu rehber PUBG, Valorant ve CS2 gibi rekabetçi oyunlarda güvenli, geri alınabilir ve resmî ayarlara dayanan bir başlangıç sunar.

## Önce sorunu doğru tanımlayın

### Düşük ortalama FPS

Oyun genel olarak hedeflediğiniz kare hızının altında çalışır. Grafik yükü, CPU sınırı, güç modu veya sıcaklık buna neden olabilir.

### Ani FPS düşüşü ve takılma

Ortalama değer iyi olduğu hâlde kısa süreli kare süresi sıçramaları vardır. Arka plan uygulaması, shader derleme, disk erişimi, RAM baskısı veya sıcaklık değişimi incelenmelidir.

### Input lag

Mouse tıklaması veya klavye girdisi ile ekrandaki sonuç arasında hissedilen gecikmedir. Oyun motoru, CPU/GPU kuyruğu, görüntü modu, V-Sync, monitör ve çevre birimi zincirin parçalarıdır.

### Ağ gecikmesi

Ping ve paket kaybı, sistem input lag’inden farklıdır. Karakterlerin ışınlanması veya sunucu tepkisinin gecikmesi ağ kaynaklı olabilir; mouse hareketinin ekrana geç yansıması yerel sistem zincirini düşündürür.

## 1. Monitör yenileme hızını doğrulayın

Yüksek yenileme hızlı monitör, Windows’ta otomatik olarak en yüksek değere geçmeyebilir. Microsoft’un resmî yolu:

1. **Ayarlar > Sistem > Ekran > Gelişmiş ekran** bölümünü açın.
2. Doğru monitörü seçin.
3. “Yenileme hızı seçin” alanında desteklenen değeri kontrol edin.
4. Çözünürlüğün değişip değişmediğine dikkat edin.

Microsoft, daha yüksek yenileme hızının hareket bulanıklığını ve ekran yırtılmasını azaltabileceğini, hızlı oyunlarda tepkiyi iyileştirebileceğini belirtir. Donanımınız VRR destekliyorsa değişken yenileme hızı davranışını da kontrol edin.

## 2. Oyunun doğru GPU’yu kullandığını kontrol edin

Özellikle dizüstü bilgisayarlarda oyun güç tasarruflu GPU ile açılabilir. Windows 11’de **Ayarlar > Sistem > Ekran > Grafikler** bölümünden oyun için “Yüksek performans” tercihini seçebilirsiniz. Değişiklikten sonra oyunu yeniden başlatın.

Bu ayar her sistemde mutlaka daha yüksek FPS vermez; doğru GPU’nun seçilmesini sağlar. Sonucu aynı sahne veya tekrar oynatma koşulunda ölçün.

## 3. Görüntü modunu ve pencere optimizasyonunu test edin

Windows 11, uyumlu DirectX 10 ve 11 oyunlarının pencere veya kenarlıksız pencere modunda daha yeni flip modelini kullanabilmesi için “Pencereli oyunlar için iyileştirmeler” seçeneği sunar. Microsoft bu özelliğin kare gecikmesini azaltabildiğini ve VRR gibi özellikleri etkinleştirebildiğini açıklar.

Ancak her oyun ve sistem aynı tepkiyi vermez. Tam ekran ve kenarlıksız pencere modlarını aynı sahnede kıyaslayın; yalnızca FPS’ye değil kare süresi tutarlılığına ve alt-tab ihtiyacınıza bakın.

## 4. Oyun içi grafik ayarlarını sırayla azaltın

Tüm seçenekleri bir anda “low” yapmak hangi ayarın darboğaz oluşturduğunu gizler. Şu sırayla test edin:

1. Gölge ve hacimsel efektler
2. Yansıma ve post-processing
3. Görüş mesafesi veya çevre ayrıntısı
4. Anti-aliasing
5. Doku kalitesi
6. Çözünürlük veya render scale

Doku kalitesi çoğunlukla VRAM kullanımını etkiler; her sistemde en büyük FPS kazancını sağlamaz. Render scale görüntü netliğini doğrudan etkiler. Her adımda aynı test sahnesini kullanın.

## 5. FPS sınırı ve GPU yükünü birlikte düşünün

GPU sürekli yüzde 99–100 yükteyse giriş kuyruğu ve kare süreleri etkilenebilir. Sistemin sürdürebildiği değere yakın kararlı bir FPS sınırı, bazı yapılarda daha dengeli deneyim sağlayabilir. Oyunun yerleşik sınırlayıcısını veya ekran kartı üreticisinin resmî aracını kullanın.

NVIDIA Reflex destekleyen oyunlarda Reflex Low Latency, CPU ve GPU işini daha doğru zamanlayarak PC gecikmesini azaltmayı hedefler. Seçeneğin varlığı oyuna ve donanıma bağlıdır; oyun içindeki resmî ayarı kullanın.

## 6. Arka plan yükünü sadeleştirin

Test sırasında gereksiz olanları kapatın:

- Tarayıcıda çok sayıda video sekmesi
- Ekran kaydı ve overlay araçları
- Büyük dosya senkronizasyonu
- Oyun güncellemesi veya indirme
- Kullanılmayan donanım izleme araçları

Windows güvenlik işlevlerini veya anti-cheat bileşenlerini performans uğruna devre dışı bırakmayın. “FPS paketi” adıyla sunulan bilinmeyen scriptler kayıt defteri, güvenlik veya ağ ayarlarını bozabilir.

## 7. Sıcaklık ve güç durumunu gözlemleyin

İlk beş dakika iyi, sonra sürekli düşen performans termal sınıra işaret edebilir. CPU/GPU sıcaklıklarını üreticinin güvenilir aracıyla gözlemleyin. Dizüstünde adaptörün takılı, güç profilinin uygun ve hava girişlerinin açık olduğundan emin olun.

Overclock veya undervolt ayarını teşhis sırasında varsayılana döndürmek sorunu ayırmaya yardımcı olabilir. Donanım sınırlarını bilmeden voltaj değişikliği yapmayın.

## 8. Mouse ve USB zincirini sadeleştirin

Polling rate yükseldikçe saniyedeki rapor sayısı artar; fakat çok yüksek değer bazı CPU’larda ek yük veya oyun uyumsuzluğu oluşturabilir. 1000 Hz çoğu sistem için yaygın başlangıçtır, fakat en doğru değer cihaz ve sisteme göre test edilmelidir.

Mouse’u kararsız bir hub yerine doğrudan bilgisayara bağlamak, kablosuz cihazda alıcıyı parazitten uzak tutmak ve üretici firmware’ini güncel tutmak yararlı olabilir. Ayrıntılar için [gaming mouse DPI ve polling rate rehberini](/blog/gaming-mouse-dpi-polling-rate-profil-ayarlari/) okuyun.

## Değişiklikleri nasıl ölçmelisiniz?

Her testte aynı harita, sahne, bot sayısı veya tekrar dosyasını kullanın. Şu değerleri not edin:

- Ortalama FPS
- Yüzde 1 düşük FPS veya kare süresi sıçramaları
- GPU kullanım oranı
- CPU/GPU sıcaklığı
- Ekran modu
- Değiştirdiğiniz tek ayar

Tek koşudan karar vermeyin. En az üç kısa ölçümün ortalamasını alın. İyileşme birkaç FPS’den küçükse görsel kalite kaybına değmeyebilir.

## Kaçınılması gereken yöntemler

- Kaynağı belirsiz “tek tık FPS boost” dosyaları
- Anti-cheat veya Windows güvenliğini devre dışı bırakmak
- Her hizmeti topluca kapatmak
- Kayıt defterinde geri dönüş planı olmadan değişiklik yapmak
- Oyun sürecine enjekte olan üçüncü taraf araçlar
- Aynı anda on farklı ayar değiştirip sonucu tek değişikliğe bağlamak

## Sonuç

En güvenilir sıra; yenileme hızı, doğru GPU, görüntü modu, oyun içi ayarlar, arka plan yükü ve sıcaklık kontrolüdür. Her adımda tek değişken kullanın. Amaç yalnızca en yüksek sayaç değil, uzun maç boyunca kararlı kare süresi ve tutarlı giriş hissidir.

## Kaynaklar

- [Microsoft: Windows’ta ekran yenileme hızını değiştirme](https://support.microsoft.com/en-au/windows/hardware/display-graphics/change-the-refresh-rate-on-your-monitor-in-windows)
- [Microsoft: Windows 11 pencereli oyun optimizasyonları](https://support.microsoft.com/en-us/windows/hardware/display-graphics/optimizations-for-windowed-games-in-windows-11)
- [NVIDIA: Reflex ve sistem gecikmesi](https://www.nvidia.com/en-us/geforce/news/reflex-latency-analyzer-360hz-g-sync-monitors/)
