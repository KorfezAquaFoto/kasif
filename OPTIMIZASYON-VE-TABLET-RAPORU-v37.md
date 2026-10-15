# v37 — Optimizasyon ve tablet uyumu

## Bulgular ve uygulanan düzeltmeler

| Alan | Önce | Sonra |
| --- | --- | --- |
| Tablet alanı | 768 ve 1024 px ekranlarda da 520 px telefon sütunu | Görünür alanı en az 600 × 600 px olan cihazlarda tablet düzeni; dikeyde 760, yatayda 1080 px üst sınır |
| Yatay ana ekran | Harita ve görev üst üste; yan alan boş | Harita solda, görev sağda; alt eylemler tek sırada |
| Giriş | Telefon formu | Yatay tablette marka ve pasaport solda, ad/dost seçimi sağda |
| Görev ve soru | Küçük görsel ve dar metin sütunu | Yatayda görsel ve içerik yan yana; dikeyde daha büyük görsel ve yazı |
| Dokunma | Telefon ölçüleri | Tablet simge düğmeleri 52 px, ana eylemler en az 56 px; cevaplar en az 66 px |
| Bölünmüş pencere | Cihaz adına göre sabit düzen yok | Görünür genişlik 600 px altına düşünce telefon düzenine dönüş |
| Boyut değişimi olayları | 20 eşzamanlı olayda 61 frame isteği, 22 callback | Aynı deneyde 1 istek ve 1 callback; ölçü değişmediyse tekrar yerleşim hesabı yok |
| Kutlama efekti | Ekran × DPR² kadar piksel tamponu | Efekt başına en fazla 3 milyon piksel; bittiğinde 1 × 1 piksele dönerek tamponu bırakır |
| Kamera sırasında arka plan | Balıklar, ışıklar ve baloncuklar hareketli | Kamera görünümünde dekoratif hareket durur; gizli sekmede de durur |

Frame sayıları yerel Chrome'da aynı boyutlu 20 yapay resize olayının ölçümüdür; gerçek cihaz FPS veya pil ömrü kazancı iddiası değildir. 3 milyon RGBA piksel yaklaşık 12 MB ham tampon üst sınırıdır; tarayıcının toplam bellek kullanımı değildir.

## Korunanlar

- QR görüntü işleme ve her taramada tuval boyutlandırma kodu byte düzeyinde aynı tutuldu.
- İlerleme anahtarı, kayıt şeması, görev kodları ve metinleri korunur.
- Final açılışı ve 1080 × 1350 sertifika dışa aktarımı korunur.
- Çizimler mevcut tek 337.530 bayt WebP atlasını kullanır.
- Menü ve çevrimdışı önbellek v37.

## Kontrol kapsamı

Yerel Chrome: 600 × 960, 768 × 1024, 820 × 1180, 1024 × 768, 1180 × 820, 1280 × 800, 1366 × 1024. Yön değiştirme ve 540 × 720 bölünmüş pencere de her boyutta denendi.

Her tablette giriş, ana ekran, yardım, dokuz ipucu, pirana/fosil/megalodon hazırlığı, soru, yanlış yanıt ipucu, yeni damga, kamera/kod girişi, menü, final ve sertifika önizlemesi kontrol edilir. Metin sınırları, kaydırma, dokunma alanı, piksel tamponu, efekt temizliği ve olay birleştirme doğrulanır.

CI Chromium + WebKit: 600 × 960, 768 × 1024, 1024 × 768, 1366 × 1024; ayrıca mevcut 16 telefon konfigürasyonu ve beş ekranda dokuz görevin tam akışı çalışır.

Test kaydı: https://github.com/KorfezAquaFoto/kasif/actions/runs/38737863240

Fiziksel iPad/Android tablet testi yapılmadı. Kamera izinlerinin gerçek cihazdaki davranışı ve gerçek FPS/pil tüketimi bu çalışmada ölçülmedi.

## Doğrulama sonucu

- Üç kontrol grubu başarılı: mobile-flow, mobile-layout, browser-platforms.
- Chromium ve WebKit'te toplam sekiz tablet konfigürasyonu geçti; yön değiştirme ve bölünmüş pencere her konfigürasyonda doğrulandı.
- Yerel Chrome'a 1024 × 600 ve 600 × 600 sınırları da eklenerek toplam dokuz tablet boyutu denendi.
- Mevcut 16 telefon konfigürasyonu ve beş ekranda dokuz görev akışı geçti.
- Klavye sırasında WebKit'in tuttuğu üst sayfa kaydırması sıfırlanır; giriş alanının görünürlük kontrolü geçti.
- Tablet test dosyasındaki aktarma kaynaklı örnek isim karakterleri UTF-8 olarak düzeltildi. Uygulama metinleri bu sorundan etkilenmedi.
- Yardım, tüm ipuçları, soru/yanlış yanıt/damga, kamera ekranı, menü, final ve sertifika önizlemesinde kaydırma ve taşma kontrolleri başarılı.
- Kutlama piksel sınırı ve ekran değişince tampon temizliği doğrulandı. Aynı boyutlu resize deneyinde iki tarayıcının her konfigürasyonunda 1 frame isteği ölçüldü.
- Önce/sonra görseli: Tablet-Karsilastirma-v37.png. Ayrıntılı ekran görüntüleri test artifact'inde tablet-{engine}-{genişlik}x{yükseklik}-*.png adlarıyla kayıtlıdır.
