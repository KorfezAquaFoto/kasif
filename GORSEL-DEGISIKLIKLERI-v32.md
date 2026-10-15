# v32 — Soru ekranındaki çizimler

- Soru görselinin eski 130 px üst sınırı kaldırıldı. Uzun ekranlarda 280 px genişliğe ve 260 px yüksekliğe kadar alan kullanır.
- Orta telefonlarda 230 × 200 px üst sınırı, kısa ekranlarda 120 × 100 px hedefi uygulanır.
- Soru ve cevaplar uzadığında görsel kalan yüksekliğe göre küçülür; çizim oranı korunur.
- Soru kartı ve cevaplar önceliklidir. Boş yanıt mesajının gereksiz alanı kaldırıldı.
- Yatay telefonda çizim soru kartının solunda gösterilir.
- Soru görselinin sürekli sallanması kaldırıldı; daha büyük çizim sabit durur.
- Dokuz çizim, metinler, sorular ve QR kodları korunur. Çevrimdışı önbellek v32.

Doğrulama: 16 ekran/tarayıcı alanında soru ve yanlış yanıt ipucu kontrolü eklendi. Beş tam görev akışında dokuz soru kontrol edilir. Chromium ve WebKit'te büyük ekran görsel boyutu ve soru sınırları ayrıca doğrulanır.

## Sonuçlar

- Üç test grubu başarılı: mobile-layout, mobile-flow, browser-platforms.
- 16 ekran/tarayıcı alanında soru ve yanlış yanıt ipucu taşmadan görüntülendi. 253 px genişlikteki ekran için alt boşluk ve başlık ölçüleri ayrıca ayarlandı.
- Beş ekran boyutunda dokuz görevin tam akışı geçti. Pirana, fosil ve megalodon soru görüntüleri kaydedildi.
- Chromium ve WebKit'te üçer telefon boyutunda soru, yanlış yanıt ipucu ve büyük görsel boyutu kontrolleri başarılı.
- QR, kayıt ve çevrimdışı açılış kontrolleri geçti.
- Test kaydı: https://github.com/KorfezAquaFoto/kasif/actions/runs/38709441851
- Ekran görüntüleri: tests/out/v32-quiz-art.jpg ve tests/out/v32-quiz-mobile.jpg.
- Testler otomatik ekran/tarayıcı simülasyonudur; fiziksel telefon testi yapılmadı.
