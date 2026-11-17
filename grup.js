// Grup Mücadelesi: bir grup öğretmenin telefonuyla oynar; sonuç gruplar arası sıralamaya yazılır.
// Supabase (olay.js ile aynı proje). Tablolara doğrudan erişim yok; yalnızca supabase/*.sql fonksiyonları.
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
// Uygunsuz grup adı: internetsiz de çalışan temel liste (kodda düz yazı görünmesin diye base64) (sunucudaki kasif_yasakli ile aynı başlangıç listesi;
// yöneticinin istatistik ekranından eklediği kelimeler sunucuda denetlenir). SQL'deki kasif_sade ile aynı sadeleştirme.
const ICINDE = atob("b3Jvc3B1IHNpa3RpciBzaWtlcmltIHNpa2V5aW0gYW1jaWsgYW1pbmFrbyBnb3R2ZXJlbiBwZXpldmVuayBrYWhwZSB5YXZzYWsgc2VyZWZzaXoga2FsdGFrIHN1cnR1ayBkYWx5YXJhayBrZXJoYW5lIGlibmUgZ2VyaXpla2FsaSBkYW5nYWxhayBzYWxhayBhcHRhbCBhaG1hayBlbmF5aSBwb3JubyBmdWNrIGJpdGNo").split(" ");
const TAM = atob("c2lraXMgc2lraWsgc2lrIHNpa2ltIHNpa28gYW1pbmEgYW0gYW1rIGFtcSBhcSBvYyBtayBnb3QgeWFyYWsgdGFzYWsgcHVzdCBwaWMgZ2F2YXQgZ29kb3MgbWFsIHNla3Mgc2V4IHNoaXQgZGljaw==").split(" ");
const HARF = { "ç":"c","ğ":"g","ı":"i","ö":"o","ş":"s","ü":"u","â":"a","î":"i","û":"u","0":"o","1":"i","3":"e","4":"a","5":"s","7":"t","8":"b","@":"a","$":"s","!":"i","|":"i" };
function sade(t){ return String(t || "").replace(/[İI]/g, "i").toLowerCase().replace(/[çğıöşüâîû0134578@$!|]/g, c => HARF[c]).replace(/(.)\1+/g, "$1"); }
function uygunYerel(ad){
  const s = sade(ad), harf = s.replace(/[^a-z]/g, ""), kel = s.split(/[^a-z]+/);
  return !ICINDE.some(k => harf.includes(k)) && !TAM.some(k => kel.includes(k));
}
window.kasifGrup = {
  yaz: e => rpc("kasif_grup_yaz", { p_cihaz: e.cihaz, p_ad: e.ad, p_damga: e.damga, p_yanlis: e.yanlis, p_kacan: e.kacan, p_bitti: !!e.bitti }),
  // donem: "hafta" | "ay" | "tum" → {toplam, liste:[{ad,damga,yanlis,bitti,sira,ben}], ben:{...}|null}
  siralama: (donem, cihaz) => rpc("kasif_grup_siralama", { p_donem: donem, p_cihaz: cihaz || null }),
  uygunYerel,
  // true/false; internet yoksa ya da SQL kurulmadıysa null (oyun yerel sonuca göre devam eder)
  uygunSunucu: ad => rpc("kasif_ad_uygun", { p_ad: ad }).then(v => v === false ? false : v === true ? true : null).catch(() => null)
};
})();
