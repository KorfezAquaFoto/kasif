# v34 — Sertifika hizalama düzeltmeleri

| Önce | Sonra |
| --- | --- |
| Başlığın yanlarındaki altın çizgiler birbirine değiyor. | Üç ayrı ince vurgu, iki yanda simetrik ve aralıklı çizilir. |
| Tarihin merkezi 500 px, sertifikanın merkezi 540 px. | Tarih tam 540 px merkezine alınır; iki yan çizgi eşit uzunlukta ve simetriktir. |
| 9/9 keşif rozeti tarihin sağında. | Rozet kullanıcının isminin sağında, kaşif dostuyla aynı yüksekliktedir. |
| İsim için ayrı rozet alanı yok. | İsim en fazla 500 px genişliğe sığar; rozet için 100 px alan ve 32 px boşluk ayrılır. Üçlü grup birlikte ortalanır. |

Önizleme ve indirme aynı 1080 × 1350 PNG çıktısını kullanır. Menü ve çevrimdışı önbellek sürümü v34.

## Doğrulama sonuçları

- mobile-layout, mobile-flow ve browser-platforms testlerinin üçü de başarılı.
- 16 telefon/tarayıcı alanı düzeni ve beş ekran boyutunda dokuz görevin tam akışı geçti.
- Altı kaşif dostu, 16 geniş harfli isim ve Türkçe karakterli isimle Chromium ve WebKit'te toplam 16 sertifika çıktısı alındı.
- İsim/rozet boşluğu, isim/avatar hizası, tarihin merkezi, metin sınırları, dokuz damga ve tek tarih doğrulandı.
- Başlık çizgileri, normal ve uzun isimli sertifika çıktıları görsel olarak incelendi.
- Gerçek çıktılar: tests/out/v34-certificate.png, v34-long-name.png, v34-certificate-webkit.png.
- Bunlar otomatik tarayıcı/ekran testleridir; fiziksel telefon testi yapılmadı.

Test kaydı: https://github.com/KorfezAquaFoto/kasif/actions/runs/38727888045
