// Çevrimdışı çalışma: ilk açılışta tüm dosyalar telefona kaydedilir.
// İçerik değiştiğinde VERSION'ı artırın; telefonlar bir sonraki internet bağlantısında günceller.
const VERSION = "kasif-v1";
const FILES = [
  "./", "./index.html", "./styles.css", "./app.js", "./data.js",
  "./vendor/jsQR.js", "./vendor/qrcode.js", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/maskable-512.png", "./icons/apple-touch-icon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  // Sayfa açılışları (QR'dan gelen ?s=KOD dahil) her zaman önbellekteki index.html ile karşılanır
  if (req.mode === "navigate" && !url.pathname.endsWith("qr-kodlari.html")) {
    e.respondWith(caches.match("./index.html").then(r => r || fetch(req)));
    return;
  }
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(r => r || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }))
  );
});
