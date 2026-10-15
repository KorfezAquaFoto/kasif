# v32 — Soru ekranındaki çizimler

- Soru görselinin eski 130 px üst sınırı kaldırıldı. Uzun ekranlarda 280 px genişliğe ve 260 px yüksekliğe kadar alan kullanır.
- Orta telefonlarda 230 × 200 px üst sınırı, kısa ekranlarda 120 × 100 px hedefi uygulanır.
- Soru ve cevaplar uzadığında görsel kalan yüksekliğe göre küçülür; çizim oranı korunur.
- Soru kartı ve cevaplar önceliklidir. Boş yanıt mesajının gereksiz alanı kaldırıldı.
- Yatay telefonda çizim soru kartının solunda gösterilir.
- Soru görselinin sürekli sallanması kaldırıldı; daha büyük çizim sabit durur.
- Dokuz çizim, metinler, sorular ve QR kodları korunur. Çevrimdışı önbellek v32.

Doğrulama: 16 ekran/tarayıcı alanında soru ve yanlış yanıt ipucu kontrolü eklendi. Beş tam görev akışında dokuz soru kontrol edilir. Chromium ve WebKit'te büyük ekran görsel boyutu ve soru sınırları ayrıca doğrulanır.
