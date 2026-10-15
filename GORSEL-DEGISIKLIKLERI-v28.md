# Körfez Aqua — v28 çocuklara uygun görsel dokunuşlar

15 Ekim 2026

- Görev öncesi canlı çizimleri, ekran uygunsa büyütüldü. Çok küçük ekranlarda mevcut metin önceliği ve sadeleşme korunuyor.
- Canlılara iki döngüden sonra duran hafif yüzme/süzülme hareketleri eklendi. Fosil, kabuk ve çene sabit kalıyor. Azaltılmış hareket tercihi ve arka plana geçiş gözetiliyor.
- İpucundaki bilgi ve yönlendirmeye küçük ampul, arama ve yukarı ok simgeleri eşlik ediyor. Daralan kartlarda simgeler gizleniyor; tek ipucu metni korunuyor.
- Damgalardaki çizimler ayrı oranlarla büyütüldü; ince uzun mersin balığına daha fazla alan verildi.
- Seçilen kaşif dostuna onay işareti ve kısa seçim hareketi eklendi. Doğru cevapta da yeşil rengin yanında ✓ gösteriliyor.
- Damga sonrası başlık artık canlı/nesneye özel: “Pirana keşfedildi!” gibi. Görev kutlamasında 22 parçalık kısa efekt; finalde daha büyük kutlama var. Tüm ekranı sarsma kaldırıldı.
- Menüye isteğe bağlı damga sesi eklendi; başlangıçta kapalı. Seçim bu telefonda kaydediliyor.
- Konfeti çizim çözünürlüğü mobil ekranlarda en fazla 2 kat tutuluyor. Kamera/QR görüntü işleme boyutlandırma kodu değiştirilmedi.
- Sorular, bilgi metinleri, QR kodları ve ilerleme kayıtları korunuyor.

## Telefon ve tarayıcı doğrulaması

- Üç test grubu başarılı: mobile-layout, mobile-flow, browser-platforms.
- 16 ekran/tarayıcı çubuğu düzeninde dokuz ipucu, dokuz görev öncesi ekranı ve uzun başlıklı damga ekranı kontrol edildi.
- Düzenler (genişlik × yükseklik; düşülen tarayıcı alanı): 280×480; 320×480; 320×568/96; 360×640/110; 375×667/100; 390×844/120; 412×915/120; 430×932/120; 253×429; 844×390; 320×568/56; 360×780/112; 393×852/122; 414×896/122; 384×854/128; 428×926/128.
- Kısa ekranlardaki damga görünümünde Dinle ve Devam aynı sırayı paylaşır. Dokunma alanları, taşma ve örtüşmeler kontrol edildi.
- 5 ekran boyutunda dokuz görevin tam akışı, yanlış/doğru yanıtlar, yeni onay işaretleri, damgalar, pasaport kaydetme ve QR posterleri geçti.
- Chromium ve WebKit; büyük yazı, klavye, azaltılmış hareket, kayıt hatası ve kamera kapanışı kontrolleri başarılı.
- Ses başlangıçta kapalıdır; açma/kapatma ayarının kayıt edildiği doğrulandı. Hoparlörden çıkan ses fiziksel cihazda dinlenmedi.
- Testler ekran boyutlarını ve tarayıcı motorlarını otomatik olarak simüle eder; fiziksel telefonlarla yerinde test yapılmadı.
- Test kaydı: https://github.com/KorfezAquaFoto/kasif/actions/runs/38698881782
