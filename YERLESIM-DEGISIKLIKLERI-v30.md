# v30 — Daha büyük damgalar ve ortalı görev kimliği

- Yeni damga ekranında damga ölçüsü uzun ekranlarda 170 → 195 px, orta ekranlarda 135 → 145 px, kısa ekranlarda 80 → 84 px; en dar ekranlarda 68 → 72 px.
- Kısa ekranlardaki kart yüksekliği damgayı içine alacak şekilde ayarlandı.
- Damga animasyonu bitince eğim sıfırlanır; kıta adı ve tarih yatay merkezde görünür. SVG yay yazılarında orta hizalama açıkça tanımlanır.
- Dikey telefonlarda İpuçları görseli, canlı/nesne adı ve görev başlığı referanstaki gibi alt alta ortalanır. Bu düzen fosiller dahil bütün görevlerde ortaktır.
- İpucu açıklamaları sola hizalı kalır. Çok kısa ekranlarda metnin okunabilmesi için mevcut yoğunluk uyarlaması korunur.
- QR, sorular ve kayıt yapısı değiştirilmedi. Çevrimdışı sürüm v30.

Testler: 16 telefon/tarayıcı alanı düzeni, 5 tam görev ekran boyutu ve Chromium/WebKit testleri çalıştırılır. Damganın karta sığması, görev görseli/başlığının ortalanması ve animasyon sonrası eğim için kontroller eklendi. Sonuçlar yayın öncesinde incelenecek.
