# v29 — Amblem, kartlar ve ipucu hizalaması

- Giriş ve final pasaportundaki amblemin alt dalgası kaldırıldı.
- Orijinal logo değiştirilmeden, yengeç kollarının görünür sınırları dairenin yatay ve dikey merkezine alındı.
- Yeni damga ekranındaki damga ve “Biliyor muydun?” kartları aynı genişlikte ve aynı kenar hizasında. Yükseklikleri içerik ve ekran alanına göre uyarlanır.
- Tanış ve bul ile İpuçları ekranlarındaki açıklamalar sola hizalı; İpucu başlığı ortalı kaldı.
- Sürüm ve çevrimdışı önbellek v29 olarak güncellendi.

## Doğrulama sonuçları

- Üç test grubu başarılı: mobile-flow, mobile-layout, browser-platforms.
- 16 ekran/tarayıcı çubuğu düzeninde dokuz ipucu ve görev öncesi ekranı, kart genişlikleri ve kenar hizası kontrol edildi.
- Beş ekran boyutunda dokuz görevin tam akışı, QR kodları, kayıt ve çevrimdışı açılış geçti. İpucu metinleri sola, başlık ortalı; iki pasaport amblemi merkezde ve dalgasız.
- Chromium ve WebKit; klavye, büyük yazı, azaltılmış hareket ve kayıt hatası kontrolleri başarılı.
- Bunlar otomatik tarayıcı testleridir; fiziksel telefon testi yapılmadı.
- Test kaydı: https://github.com/KorfezAquaFoto/kasif/actions/runs/38701354705

Gerçek test ekran görüntüleri çalışma klasöründe tests/out/v29-overview.jpg, v29-tips-stamp.jpg ve v29-mobile-layouts.jpg dosyalarındadır.
