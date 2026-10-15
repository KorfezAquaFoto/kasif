# v30 — Daha büyük damgalar ve ortalı görev kimliği

- Yeni damga ekranında damganın üst boyut sınırı uzun ekranlarda 170 → 195 px, orta ekranlarda 135 → 145 px, kısa ekranlarda 80 → 84 px; en dar ekranlarda 68 → 72 px.
- Kısa ekranlardaki kart yüksekliği damgayı içine alacak şekilde ayarlandı.
- Damga animasyonu bitince eğim sıfırlanır; kıta adı ve tarih yatay merkezde görünür. SVG yay yazılarında orta hizalama açıkça tanımlanır.
- Dikey telefonlarda İpuçları görseli, canlı/nesne adı ve görev başlığı referanstaki gibi alt alta ortalanır. Bu düzen fosiller dahil bütün görevlerde ortaktır.
- İpucu açıklamaları sola hizalı kalır. Çok kısa ekranlarda metnin okunabilmesi için mevcut yoğunluk uyarlaması korunur.
- QR, sorular ve kayıt yapısı değiştirilmedi. Çevrimdışı sürüm v30.

## Test sonuçları

- Üç grup başarılı: mobile-layout, mobile-flow, browser-platforms.
- 16 telefon/tarayıcı alanı düzeninde dokuz ipucu ve görev öncesi ekranı kontrol edildi. Görsel/başlık ortası, kart sınırları, metin taşması, dokunma alanları ve yön değişimi geçti.
- Beş ekran boyutunda dokuz görevin tam akışı, QR kodları, damgalar, kayıt ve çevrimdışı açılış geçti.
- Chromium ve WebKit'te üçer telefon boyutunda yeni damganın karta sığması ve animasyon sonrası düz durması doğrulandı. Klavye, büyük yazı, azaltılmış hareket ve kayıt hatası testleri de başarılı.
- Uzun görev başlığı kartı daralttığında damga, kartın kullanılabilir iç yüksekliğine göre küçülür. Genişlik ve yükseklik birlikte değişir; çizim bozulmaz.
- Test kaydı: https://github.com/KorfezAquaFoto/kasif/actions/runs/38704102515
- Otomatik ekran/tarayıcı testleridir; fiziksel telefon testi yapılmadı.

Ekran görüntüleri: tests/out/v30-new-stamp.jpg, v30-stamp-gallery.jpg, v30-centered-fossil.jpg ve v30-mobile-layouts.jpg.
