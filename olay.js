// Anonim kullanım istatistiği: isim gönderilmez; rastgele cihaz numarası, olay, görev, saat ve telefon türü.
// İnternet yoksa olaylar telefonda bekler, bağlantı gelince toplu gönderilir. Oyun hiçbir zaman bunu beklemez.
(function(){
const URL_ = "https://jusssskyelfizcuejytf.supabase.co/rest/v1/events";
const KEY_ = "sb_publishable_kAKGNIYcCSIomQpxdpqODg_alO04cLQ";
const QUEUE = "kasif-olaylar", DEVICE = "kasif-cihaz", MAX = 300, VERSION = "v42";
// Yerel geliştirme ve testler gerçek istatistiğe karışmasın; denemek için localStorage "kasif-istatistik-test" = "1".
const LOCAL = location.protocol === "file:" || /^(localhost|127\.0\.0\.1|\[::1\]|.*\.localhost|.*\.test)$/.test(location.hostname);
const store = {
  get(k){ try { return localStorage.getItem(k); } catch(e){ return null; } },
  set(k, v){ try { localStorage.setItem(k, v); } catch(e){} }
};
const TEST = LOCAL && store.get("kasif-istatistik-test") === "1";
const ENABLED = !LOCAL || TEST;

function device(){
  let id = store.get(DEVICE);
  if (!id || !/^[a-z0-9-]{8,40}$/.test(id)) {
    id = (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 12)).toLowerCase();
    store.set(DEVICE, id);
  }
  return id;
}
const ua = navigator.userAgent;
const platform = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ? "ios" : /android/i.test(ua) ? "android" : "diger";

function queue(){ try { return JSON.parse(store.get(QUEUE)) || []; } catch(e){ return []; } }
function setQueue(q){ store.set(QUEUE, JSON.stringify(q.slice(-MAX))); }

let sending = false;
function flush(keepalive){
  if (!ENABLED || sending || !navigator.onLine) return;
  const batch = queue().slice(0, 50);
  if (!batch.length) return;
  sending = true;
  fetch(URL_, {
    method: "POST", keepalive: !!keepalive,
    headers: { "apikey": KEY_, "Authorization": "Bearer " + KEY_, "Content-Type": "application/json", "Prefer": "return=minimal" },
    body: JSON.stringify(batch)
  }).then(r => {
    // Gönderilenleri kuyruktan çıkar; sunucu kaydı reddettiyse (400) de çıkar, yoksa sonsuza dek takılır.
    if (r.ok || r.status === 400 || r.status === 409) {
      const sent = new Set(batch.map(x => x.happened_at + x.event + (x.station || "")));
      setQueue(queue().filter(x => !sent.has(x.happened_at + x.event + (x.station || ""))));
      sending = false;
      if (queue().length) setTimeout(flush, 500);
    } else sending = false;
  }).catch(() => { sending = false; });
}

window.kasifOlay = function(event, station, detail){
  if (!ENABLED) return;
  const q = queue();
  q.push({
    happened_at: new Date().toISOString(), device: device(), event,
    station: station || null, detail: detail == null ? null : String(detail).slice(0, 20),
    platform, version: VERSION, test: TEST
  });
  setQueue(q);
  setTimeout(flush, 0);
};

window.addEventListener("online", () => flush());
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(true); });
setInterval(() => flush(), 60000);
window.kasifOlay("visit");
})();
