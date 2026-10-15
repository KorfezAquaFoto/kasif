# v33 — Yeni final sertifikası

- Başlık, örnekteki gibi ortası yükselen kavisli iri harflerle çizilir. İki yanındaki altın vurgular da eklendi.
- Onaylanan örnekteki krem zemin, altın çerçeve, deniz köşeleri ve lacivert başlık uygulandı.
- “9 keşfi tamamlayarak Okyanus Kaşifi oldun!” cümlesi kaldırıldı. Önceki uzun başarı cümlesi de çıkarıldı.
- Kaşif dostu ile kullanıcı adı tek grup olarak ortalıdır. İsim harflerinin görünür dikey merkezi avatarın merkeziyle aynı çizgidedir. Uzun isim alanına sığacak şekilde küçülür.
- Dokuz damga düz ve eşit boyutta üçe üç dizilir; altında canlı/nesne adı görünür.
- Sertifika damgalarında tarihin yerini yıldızlar alır. Diğer damga ekranlarının tarihleri korunur.
- Tamamlanma tarihi yalnızca alt bölümde, son keşfin tarihinden üretilir. Küçük 9 / 9 keşif mührü ve orijinal logo alt alanda yer alır.
- Sertifika 1080 × 1350 PNG olarak kalır; önizleme ve indirme aynı görseli kullanır.
- Çevrimdışı önbellek ve menü sürümü v33.

Doğrulama: Chromium ve WebKit'te altı kaşif dostu, 16 harfli geniş isim ve Türkçe karakterli isimle özgün PNG çıktıları alınır. Görünür isim/avatar hizası, yazı sınırları, dokuz başlık, tek tarih ve kaldırılan cümleler kontrol edilir. Mevcut telefon ve görev akışı testleri de çalıştırılır.

## Sonuçlar

- Üç test grubu başarılı: mobile-layout, mobile-flow, browser-platforms.
- 16 telefon/tarayıcı alanı düzeni ve beş ekran boyutunda dokuz görevin tam akışı geçti.
- Chromium ve WebKit'te altı kaşif dostu, 16 harfli geniş isim ve Türkçe karakterli isimle toplam 16 sertifika çıktısı alındı.
- Kavisli başlık, görünür isim/avatar merkezi, metin sınırları, dokuz canlı adı, tek tamamlanma tarihi ve kaldırılan cümleler doğrulandı.
- Önizleme 1080 × 1350 PNG çıktısını kullanıyor; mevcut QR, kayıt ve çevrimdışı kontrolleri geçti.
- Tarayıcı klavye ve yardım penceresi kontrolleri, yerleşimin tamamlanmasını bekleyecek şekilde düzeltildi.
- Test kaydı: https://github.com/KorfezAquaFoto/kasif/actions/runs/38726150856
- Gerçek çıktılar: tests/out/v33-certificate.png, v33-long-name.png ve v33-certificate-webkit.png.
- Bunlar otomatik ekran/tarayıcı testleridir; fiziksel telefon testi yapılmadı.
