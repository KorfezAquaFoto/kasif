# v36 — Pasaport açılışındaki görsel hatalar

| Sorun | Düzeltme |
| --- | --- |
| Kapak yarı açık kalmış gibi görünüyordu. | Açık ve damgalı son durum artık zamanlamayla açıkça uygulanır; yalnızca CSS animasyonunun tamamlanmasına bağlı kalmaz. |
| Kapak, sayfa ve kitap farklı yönlerde kayıyordu. | Kitap bütün hareket boyunca ortada sabit kalır. Kapak merkezde başlayıp sola katlanır. |
| Kesilen sol sayfa ve erken görünen yazılar. | Sayfalar kesme maskesi kullanmadan, opak kâğıt olarak genişler; içerik kapak açılınca belirir. |
| Perspektif kapağı uzatıp alttaki başlığa yaklaştırıyordu. | Kapak hareketi iki boyutlu katlanmayla çizilir; ters yüz ve perspektif taşması kaldırılır. |

- Önce kapak açılır, ardından damga sağ sayfaya basılır. Sol sayfadaki isim ve kaşif dostu korunur.
- 900 ms'de açık kitap; 2000 ms'de basılmış mühür ve kalkmış damga aracı kesin son durum olarak atanır.
- Hareket azaltma ayarında doğrudan açık ve damgalı görünüm gösterilir.
- Sertifika PNG tasarımı ve indirme akışı korunur. Menü ve çevrimdışı önbellek v36.

## Kontroller

- Yerel Chrome'da altı kaşif dostu, uzun isim, Türkçe karakterler, küçük telefon boyutu, hareket azaltma ve duraklatılmış CSS animasyonu geçti.
- Açılışın altı ara karesi alındı; kitabın merkezi, ekran sınırları ve kesme maskesi olmaması doğrulandı. Telefon ve masaüstü görüntüleri incelendi.
- CI: https://github.com/KorfezAquaFoto/kasif/actions/runs/38734589896
- Gerçek ekran kareleri: tests/out/final-{closed,turning,opening,pages,press,settled}-{engine}.png.
- Fiziksel telefon testi yapılmadı.

## Sonuç

- mobile-flow, browser-platforms ve mobile-layout testlerinin üçü de başarılı.
- Chromium ve WebKit'te altı ara kare ve tamamlanmış görünüm doğrulandı; WebKit normal/uzun isim görüntüleri incelendi.
- Duraklatılmış CSS animasyonu, hareket azaltma ve 280 × 480 küçük ekran kontrolleri geçti.
- Önceki sertifika metinleri, isim/rozet boşluğu, tarih merkezi ve PNG dışa aktarma kontrolleri geçti.
- Telefon yerleşimi, dokuz görev, QR, kayıt ve çevrimdışı açılış kontrolleri başarılı.
- Paylaşılan hareketli önizleme: gerçek yerel Chrome ekran karelerinden Pasaport-Acilisi-v36.gif.
