// Grup Mücadelesi: bir grup öğretmenin telefonuyla oynar; sonuç gruplar arası sıralamaya yazılır.
// Supabase (olay.js ile aynı proje). Tablolara doğrudan erişim yok; yalnızca supabase/grup-mucadelesi.sql fonksiyonları.
(function(){
const BASE = "https://jusssskyelfizcuejytf.supabase.co";
const KEY = "sb_publishable_kAKGNIYcCSIomQpxdpqODg_alO04cLQ";
async function rpc(name, body){
  const r = await fetch(BASE + "/rest/v1/rpc/" + name, { method: "POST",
    headers: { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body || {}) });
  if (!r.ok) { let m = ""; try { m = (await r.json()).message || ""; } catch(e){} const err = new Error(m || ("HTTP " + r.status)); err.status = r.status; throw err; }
  const t = await r.text(); return t ? JSON.parse(t) : null;
}
window.kasifGrup = {
  yaz: e => rpc("kasif_grup_yaz", { p_cihaz: e.cihaz, p_ad: e.ad, p_damga: e.damga, p_yanlis: e.yanlis, p_kacan: e.kacan, p_bitti: !!e.bitti }),
  // donem: "hafta" | "ay" | "tum" → {toplam, liste:[{ad,damga,yanlis,bitti,sira,ben}], ben:{...}|null}
  siralama: (donem, cihaz) => rpc("kasif_grup_siralama", { p_donem: donem, p_cihaz: cihaz || null })
};
})();
