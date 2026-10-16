// Çevrimdışı çalışma: ilk açılışta tüm dosyalar telefona kaydedilir.
// İçerik değiştiğinde VERSION'ı artırın; telefonlar bir sonraki internet bağlantısında günceller.
const VERSION = "kasif-v39";
const FILES = [
  "./", "./logo2.png", "./index.html", "./styles.css", "./app.js", "./olay.js", "./data.js", "./art.js", "./art-assets.js", "./assets/art-atlas-v27.webp",
  "./vendor/jsQR.js", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/apple-touch-icon.png",
  "./fonts/dynapuff-variable.woff2", "./fonts/baloo-2-latin-600-normal.woff2", "./fonts/baloo-2-latin-ext-600-normal.woff2",
  "./fonts/baloo-2-latin-800-normal.woff2", "./fonts/baloo-2-latin-ext-800-normal.woff2"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(f => new Request(f, { cache: "reload" })))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("kasif-") && k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  // Sayfa açılışları (QR'dan gelen ?s=KOD dahil) her zaman önbellekteki index.html ile karşılanır
  if (req.mode === "navigate" && !/(qr-kodlari|istatistik)\.html$/.test(url.pathname)) {
    e.respondWith(caches.match("./index.html").then(r => r || fetch(req)));
    return;
  }
  // Poster sayfası her zaman güncel data.js/art.js ile çalışsın (internet yoksa önbellek)
  if (url.pathname.endsWith("istatistik.html")) return;
  if (url.pathname.endsWith("qr-kodlari.html") || req.referrer.includes("qr-kodlari.html")) {
    e.respondWith(fetch(req, { cache: "no-store" }).catch(() => caches.match(req, { ignoreSearch: true })));
    return;
  }
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(r => r || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }))
  );
});

