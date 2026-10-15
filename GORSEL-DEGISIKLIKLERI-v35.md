# v35 — Pasaportun içinde final damgası

- Önceki finalde kapalı kapağın üstüne basılan mühür kaldırıldı.
- Final ekranı açılınca pasaport kapağı yana açılır; kitap ortalanır.
- Sol sayfada seçilen kaşif dostu ve kullanıcının adı, sağ sayfada final damgası ve keşif sayısı görünür.
- Kapak açıldıktan sonra ahşap damga aracı sağ sayfaya iner, altın mühür belirir. Etkiyle ses/titreşim ve kısa konfeti eşzamanlıdır.
- Ekrandan ayrılınca gecikmiş kutlama çalışmaz. Yeniden açmada animasyon baştan başlar.
- Hareket azaltma ayarında açık kitap ve basılmış mühür doğrudan gösterilir; titreşim ve konfeti kapalıdır.
- Küçük telefonlar için daha küçük kitap ölçüsü, uzun isimler için satır kırma kullanılır.
- Dolu pasaport önizlemesi ve 1080 × 1350 PNG sertifika korunur.
- Menü ve çevrimdışı önbellek v35.

Testler: Chromium/WebKit final sayfası, sağ sayfa sınırları içinde mühür, kitap merkezi, görünür kaşif dostu ve uzun isim; küçük ekranda ve hareket azaltmada görünürlük. Mevcut görev, telefon, QR, kayıt ve çevrimdışı testleri.

## Sonuçlar

- Üç test grubu geçti: mobile-layout, mobile-flow, browser-platforms.
- 16 telefon alanı ve beş boyutta tam görev akışı doğrulandı. Fiziksel telefon testi yapılmadı.
- Chromium ve WebKit'te normal isimler, 280 × 480 ekranda uzun isim ve hareket azaltma ayarı kontrol edildi.
- Kapak açıldıktan sonra gizlendiği ve mühür/isim/dostun görünür kaldığı doğrulandı. Açılışta erken görünen sol sayfa ile WebKit'teki ters kapak görünümü düzeltildi.
- Önizleme ve dışa aktarılan sertifika kontrolleri geçti.
- Bir çalıştırmada eski giriş/klavye kontrolü zaman aşımına uğradı; yalnızca başarısız iş tekrar çalıştırılarak geçti.
- Gerçek ekran görüntüleri test çıktılarında final-closed, final-opening, final-press, final-open adlarıyla kayıtlıdır.

Test kaydı: https://github.com/KorfezAquaFoto/kasif/actions/runs/38730540546
