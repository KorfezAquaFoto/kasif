# Poster Tasarımı v1

Tarih: 16 Ekim 2026. Depo: `KorfezAquaFoto/kasif`.

## Teslim ve kapsam

İnceleme dalı: `poster-redesign-v1`. Tasarım ve test commit'i: `c86c9c6d062869d19151ee37d23b10efdcf746df`.

`main` ve GitHub Pages yayınına gönderilmedi; kullanıcı tasarım onayı bekleniyor.

Uygulama tarafında yalnızca `qr-kodlari.html` değişti. İstenen doğrulama için `tests/posters.py` eklendi ve `.github/workflows/check.yml` içine bağımsız `poster-print` işi eklendi. Bu rapor da teslim dosyasıdır. Oyun dosyaları, sürüm, service worker, veri, atlas ve diğer varlıklar bu değişiklik kapsamında düzenlenmedi.

## Önce / sonra

| Alan | Önce | Sonra |
| --- | --- | --- |
| Sayfa düzeni | A4'te iki küçük poster | Her A4 dikey sayfada bir poster; toplam 10 sayfa |
| QR boyutu | 220 piksel ekran ölçüsü | Beyaz boşluk dahil 160 mm; görevlerde siyah sembol alanı yaklaşık 129 mm |
| QR çevresi | 2 piksel kenar boşluğu | Dört yönde tam 4 modül saf beyaz boşluk |
| QR görünümü | Küçük yerleşim | Vektörel saf siyah modüller ve opak saf beyaz zemin; önünde/arkasında görsel veya desen yok |
| Elle giriş kodu | 20 piksel yazı | Kalın, eş aralıklı 56 punto; ölçülen görünür harf yüksekliği 12,44–12,70 mm |
| Görev kimliği | Küçük kart başlığı | Görev numarası, bölge, onaylı canlı çizimi ve `data.js` görev başlığı |
| Yönlendirme | Eski kart açıklamaları | Tek kısa talimat ve QR altında kamera okumazsa kodu yazma notu |
| Giriş posteri | Küçük giriş kartı | Altın çerçeve, mevcut logo2.png, Okyanus Kaşifi Ol! başlığı ve kamera talimatı |
| Yazı tipi | Sistem yazısı | Yerel DynaPuff ve Türkçe karakterleri kapsayan Baloo 2 |
| Renk ve baskı | Küçük kart görünümü | Krem zemin, ince okyanus mavisi/altın çerçeve; büyük koyu dolgu yok |
| Ekran önizleme | Sabit küçük kartlar | Dar ve geniş ekranda A4 oranını koruyan ölçekli önizleme |
| Otomatik kontrol | Poster odaklı test yok | QR çözme, loşluk, fiziksel ölçü, PDF sayfalama ve baskı testi |

İsteğe bağlı iki posterli küçük düzen eklenmedi; büyük QR hedefini korumak için varsayılan ve tek düzen bir poster/A4 olarak bırakıldı.

## Korunan davranışlar

- `base`, poster sayfasının açıldığı adresten eskisi gibi hesaplanır.
- Giriş QR'ı `base`; görev QR'ları `base + "#s=" + st.code` içerir.
- Sıra, kod, ad, başlık ve bölge `KASIF.stations` / `KASIF.regions` üzerinden alınır.
- QR hata düzeltmesi M seviyesindedir.
- Çizimler mevcut `artSVG` ve onaylı atlasa dayanır; yeni çizim üretilmedi.
- Soru, yanıt, ipucu ve ödül bilgi metinleri postere aktarılmaz.
- Poster sayfası önbelleğe eklenmedi; oyun sürümü artırılmadı.

## Test sonuçları

Yerel Chrome çalıştırması ve GitHub Actions `poster-print` işi başarılıdır.

| Kontrol | Sonuç |
| --- | --- |
| Yerel sunucu: 10 QR'ın vendor/jsQR.js ile çözülmesi | 10/10, beklenen yerel adresler |
| Yayın adresi bağlamı: yerel dosyaları yükleyerek 10 QR çözümü | 10/10, gerçek GitHub Pages adresleri |
| Yüzde 35 parlaklık + 0,7 piksel Gaussian bulanıklık | Her iki adres bağlamında 10/10 |
| 450 piksel genişliğe küçültülmüş poster + aynı loşluk/bulanıklık | Her iki bağlamda 10/10 |
| QR saf siyah/beyaz pikselleri ve 4 modül beyaz çevre | 10/10 |
| Görev kodu ile data.js eşleşmesi | 9/9 |
| QR fiziksel ölçüsü | 160 mm, tüm posterlerde |
| Kodun görünür harf yüksekliği | En az 12,44 mm |
| Renkli A4 PDF | 10 sayfa, her sayfada tek poster; 10/10 QR çözüldü |
| Arka plan grafikleri kapalı A4 PDF | 10 sayfa; 10/10 QR çözüldü; sayfa zemini beyaz |
| PDF sayfa boyutu | A4, yaklaşık 594,96 × 841,92 punto |
| PDF görsel incelemesi | 10 sayfada taşma, kesilme veya üst üste binme görülmedi |
| Ekran önizlemesi | 360 ve 1440 piksel genişlikte yatay taşma yok |
| Mevcut tests/e2e.py (mobile-flow) | GitHub Actions başarılı |
| Mevcut tests/responsive.py (mobile-layout) | GitHub Actions başarılı |
| Mevcut tests/platforms.py (browser-platforms) | GitHub Actions başarılı; Chromium ve WebKit |

CI çalışması: https://github.com/KorfezAquaFoto/kasif/actions/runs/38858201612

Dört işin tamamı ilk çalıştırmada geçti; mevcut oyun testleri değiştirilmedi. Raporun sonradan eklenmesi yalnızca belge değişikliğidir; yukarıdaki çalışma tasarım ve test commit'ini doğrular.

Çalıştırma: `pip install playwright pillow pypdf pymupdf`, `python -m playwright install --with-deps chromium`, ardından `python tests/posters.py`.

Test; PDF'leri, sayfa görsellerini, loşluk örneklerini, yan yana önizlemeyi ve `results.json` dosyasını `tests/out/posters/` altında üretir. CI çıktıları `poster-baski-ve-qr-kontrolleri` adıyla saklanır. Yayın adresi testi dış sunucudan güncel dosya indirmez; aynı yerel dosyaları yayın URL'si bağlamında açarak adres üretimini doğrular.

## Önizleme ve baskı

Teslim PDF'i: `../output/pdf/Korfez-Aqua-Posterler-v1.pdf`. Yan yana giriş + pirana önizlemesi: `../output/Poster-Onizleme-v1.png`. PDF içindeki QR'lar localhost yerine gerçek yayın adresini içerir.

Chrome'da A4 dikey, yüzde 100/gerçek boyut, kenar boşluğu yok; tarayıcı üstbilgi/altbilgileri kapalı kullanılmalı. Arka plan grafikleri kapalıyken de QR ve kodlar okunur. Çerçeve kağıt kenarından 7 mm içeridedir.

Loşluk benzetimi fiziksel 30 cm–1 m mesafede kamera odağı, yansıma veya ortam ışığı ölçümü değildir. Son saha kontrolü için yüzde 100 A4 mat baskıyla özellikle Büyük Tünel'de gerçek telefonlarla okutma denenmelidir.
