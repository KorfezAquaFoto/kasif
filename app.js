(() => {
"use strict";
const D = window.KASIF;
const ST = D.stations;
const KEY = "okyanus-kasifi-v1";
const AVATARS = ["vatoz","kesis","orfoz","pirana","mersin","karagoz"];
const REG = D.regions;
const ROT = [-9, 7, -5, 10, -12, 6, -7, 8, -4, 11];
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

// ---------- Kayıt ----------
let S = load();
function load(){
  try{
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && !AVATARS.includes(s.avatar)) s.avatar = AVATARS[0];
    return s || null;
  }catch(e){ return null; }
}
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
function count(){ return S ? ST.filter(st => S.badges[st.id]).length : 0; }
function newId(){ return String(1000 + Math.floor(Math.random()*9000)); }
const av = key => artSVG(AVATARS.includes(key) ? key : AVATARS[0]);

// ---------- Görünümler ----------
let current = null, stack = [];
function show(id, push = true){
  if (current === "v-scan" && id !== "v-scan") stopCam();
  if (push && current && current !== id && !["v-reward","v-quiz"].includes(current)) stack.push(current);
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === id));
  document.body.classList.toggle("scan-mode", id === "v-scan");
  current = id; window.scrollTo(0,0);
  if (id === "v-home") renderHome();
  if (id === "v-scan") startCam();
  if (id === "v-menu") renderMenu();
}
function back(){ show(stack.pop() || (S ? "v-home" : "v-welcome"), false); }
document.querySelectorAll("[data-back]").forEach(b => b.onclick = back);

// ico: emoji ya da canlı adı (art.js)
function modal(ico, title, text, buttons = [{label:"Tamam"}]){
  $("#modal-ico").innerHTML = (window.ART && ART[ico]) ? artSVG(ico) : esc(ico);
  $("#modal-title").textContent = title; $("#modal-text").textContent = text;
  const box = $("#modal-btns"); box.innerHTML = "";
  buttons.forEach(b => {
    const el = document.createElement("button");
    el.className = "btn " + (b.cls || "btn-gold"); el.textContent = b.label;
    el.onclick = () => { $("#modal").classList.add("hidden"); b.onClick && b.onClick(); };
    box.appendChild(el);
  });
  $("#modal").classList.remove("hidden");
}

// ---------- Karşılama ----------
let avatar = AVATARS[0];
function renderWelcome(){
  $("[data-aq]").textContent = D.aquarium;
  document.querySelectorAll(".sheet-lead b").forEach(b => b.textContent = ST.length + " damgayı");
  const box = $("#avatars"); box.innerHTML = "";
  AVATARS.forEach(a => {
    const b = document.createElement("button"); b.type = "button";
    b.className = a === avatar ? "sel" : ""; b.innerHTML = artSVG(a);
    b.setAttribute("aria-label", (ST.find(s => s.art === a) || {}).name || a);
    b.onclick = () => { avatar = a; renderWelcome(); }; box.appendChild(b);
  });
}
$("#btn-start").onclick = () => {
  const name = $("#in-name").value.trim().slice(0,16) || "Kaşif";
  S = { v:1, id:newId(), name, avatar, badges:{}, created:Date.now() };
  save(); requestPersist();
  // Kapak kitap gibi açılır, altındaki kimlik sayfası görünür
  $("#idpage-w").innerHTML = `<div class="idcard">${idHTML()}</div>`;
  $("#ready-msg").textContent = `Pasaportun hazır, ${S.name}!`;
  $("#in-name").blur(); window.scrollTo({ top: 0, behavior: "smooth" });
  $("#v-welcome").classList.add("opening");
  setTimeout(() => {
    $("#v-welcome").classList.remove("opening");
    show("v-home", false);
    if (pending) { const p = pending; pending = null; setTimeout(() => handleCode(p), 350); }
  }, 2600);
};

// ---------- Kimlik sayfası ----------
const FRIEND = { vatoz:"Vatoz", kesis:"Keşiş Yengeci", orfoz:"Orfoz", pirana:"Pirana", mersin:"Mersin Balığı", karagoz:"Karagöz" };
// Nasıl oynanır adımları (Kaşif Kartım sayfası ve menü)
const HOWTO = [["🔎", "İpucunu oku, canlıyı bul"], ["📷", "Yanındaki QR'ı <b>QR Tara</b> ile okut"], ["❓", "Soruyu bil"], ["⭐", "Damgan pasaportuna basılsın!"]];
const howtoHTML = () => HOWTO.map(([i, t]) => `<li><span>${i}</span><p>${t}</p></li>`).join("");
function idHTML(){
  const d = new Date(S.created || Date.now()), p = n => String(n).padStart(2, "0");
  return `<p class="id-title">Kaşif Kartım</p>
    <div class="id-body"><div class="id-photo">${av(S.avatar)}</div><div class="id-fields">
      <div><small>Adım</small><b>${esc(S.name)}</b></div>
      <div><small>Kaşif numaram</small><b>#${esc(S.id)}</b></div>
      <div><small>Yola çıktığım gün</small><b>${p(d.getDate())}.${p(d.getMonth()+1)}.${d.getFullYear()}</b></div>
    </div></div>
    <p class="id-friend">Yol arkadaşım: <b>${FRIEND[S.avatar] || ""}</b></p>
    <p class="id-note">Merhaba ${esc(S.name)}! ${D.aquarium}'da ${ST.length} damga seni bekliyor. Haydi keşfe çıkalım! 🐠</p>`;
}

// ---------- Ana ekran (damga sayfası) ----------
function renderHome(){
  $("#me-av").innerHTML = av(S.avatar); $("#me-name").textContent = S.name; $("#me-id").textContent = "Kaşif #" + S.id;
  const n = count(), t = ST.length;
  $("#count").innerHTML = `${n}<small> / ${t} damga</small>`;
  $("#stars").innerHTML = ST.map((st,i) => `<span class="${i < n ? "on" : ""}">⭐</span>`).join("");
  const pct = n / t * 100;
  $("#bar").style.width = pct + "%";
  $("#track-fish").style.left = Math.max(4, Math.min(96, pct)) + "%";
  $("#progress-text").textContent = n === 0 ? "Akvaryumdaki ilk QR kodu bul ve okut!"
    : n === t ? "Muhteşem! Artık gerçek bir okyanus kaşifisin." : `Harika gidiyorsun! ${t - n} damga kaldı.`;
  $("#done-banner").classList.toggle("hidden", n !== t);
  renderMap();
  renderNext();
  renderBook();
  $("#btn-scan").classList.toggle("pulse", n === 0);
  S.last = null;
  renderInstall();
}

// Sıradaki görev kartı: henüz alınmamış ilk damganın ipucu
function renderNext(){
  const st = ST.find(s => !S.badges[s.id]), box = $("#next-card");
  box.classList.toggle("hidden", !st); if (!st) return;
  box.innerHTML = `<span class="nc-art">${artSVG(st.art)}</span><span><small>Sıradaki görevin</small><b>${esc(st.title)}</b>
    <em>${esc(st.hint)}</em>${st.where ? `<i>📍 ${esc(st.where)}</i>` : ""}</span>`;
  box.onclick = () => openDrawer(st, false);
}

// ---------- Pasaport defteri ----------
// Sayfalar: kimlik + her bölge türü için bir vize sayfası. Yana kaydırılır.
let leafIdx = null;
function leaves(){ return [null, ...D.groups.filter(g => ST.some(st => REG[st.region].kind === g.kind))]; }
function leafOf(st){ return leaves().findIndex(g => g && g.kind === REG[st.region].kind); }
function renderBook(){
  const L = leaves(), book = $("#book");
  book.innerHTML = L.map((g, pi) => {
    const no = `<span class="pgno">— ${pi + 1} —</span>`;
    if (!g) return `<section class="leaf id-leaf">${count() === ST.length ? `<span class="id-seal">${finalSealSVG()}</span>` : ""}<div class="idcard">${idHTML()}</div><p class="howto-t">Nasıl oynanır?</p><ol class="howto">${howtoHTML()}</ol>${no}</section>`;
    const list = ST.filter(st => REG[st.region].kind === g.kind);
    const got = list.filter(st => S.badges[st.id]).length;
    return `<section class="leaf"><div class="leaf-hd"><span>${g.icon || ""} ${esc(g.label)}</span><span class="chip">${got} / ${list.length}</span></div>
      <div class="spots n${list.length}">${list.map(st => {
        const i = ST.indexOf(st), has = !!S.badges[st.id];
        return `<button type="button" class="spot ${has ? "got" : "locked"}" data-id="${st.id}" style="--rot:${ROT[i % ROT.length]}deg">
          <span class="disc">${has ? stampSVG(st, { date: S.badges[st.id] }) : `<span class="sil">${artSVG(st.art)}</span><span class="num">${i + 1}</span>`}</span>
          <b>${esc(has ? st.name : st.title)}</b>${has ? "" : "<small>İpucu için dokun</small>"}</button>`;
      }).join("")}</div>${no}</section>`;
  }).join("");
  // Sekmeler: kaydırmayı bilmeyen çocuk dokunarak sayfa değiştirir
  $("#book-tabs").innerHTML = L.map(g => {
    if (!g) return `<button type="button" role="tab"><span class="ti">📇</span>Kartım</button>`;
    const list = ST.filter(st => REG[st.region].kind === g.kind), got = list.filter(st => S.badges[st.id]).length;
    return `<button type="button" role="tab"><span class="ti">${g.icon}</span>${esc(g.short || g.label)}<small>${got}/${list.length}</small></button>`;
  }).join("");
  $("#book-tabs").querySelectorAll("button").forEach((b, pi) => b.onclick = () => goLeaf(pi, true));
  const last = S.last && ST.find(st => st.id === S.last);
  if (last) leafIdx = leafOf(last);
  else if (leafIdx === null) leafIdx = count() === 0 ? 0 : 1;
  goLeaf(leafIdx, false);
}
function goLeaf(i, smooth){
  const book = $("#book"), leaf = book.children[i]; if (!leaf) return;
  book.scrollTo({ left: leaf.offsetLeft - book.offsetLeft - (book.clientWidth - leaf.clientWidth) / 2, behavior: smooth ? "smooth" : "auto" });
  markDot(i);
}
function markDot(i){ leafIdx = i; $("#book-tabs").querySelectorAll("button").forEach((b, k) => { b.classList.toggle("on", k === i); b.setAttribute("aria-selected", k === i); }); }
$("#book").addEventListener("scroll", () => {
  const book = $("#book"), mid = book.scrollLeft + book.clientWidth / 2;
  let best = 0, bd = 1e9;
  [...book.children].forEach((c, k) => { const d = Math.abs(c.offsetLeft - book.offsetLeft + c.clientWidth / 2 - mid); if (d < bd) { bd = d; best = k; } });
  if (best !== leafIdx) markDot(best);
}, { passive: true });
$("#book").addEventListener("click", e => {
  const b = e.target.closest(".spot"); if (!b) return;
  const st = ST.find(s => s.id === b.dataset.id); openDrawer(st, !!S.badges[st.id]);
});
function openDrawer(st, got){
  const art = $("#dr-art"); art.innerHTML = got ? stampSVG(st, { date: S.badges[st.id] }) : artSVG(st.art);
  art.classList.toggle("sil", !got);
  $("#dr-name").textContent = REG[st.region].label + " · " + (got ? st.name : "Gizemli görev");
  $("#dr-title").textContent = st.title;
  $("#dr-text").textContent = got ? st.fact : "İpucu: " + st.hint;
  $("#dr-where").textContent = got || !st.where ? "" : "QR'ı bul: " + st.where;
  $("#drawer").classList.remove("hidden");
}

// ---------- Kaşif haritası ----------
// Basitleştirilmiş dünya haritası (x = boylam + 180, y = 80 − enlem). Damgası alınan kıta altın renge döner.
const LAND = {
  "guney-amerika": "M100 70 L105 69 L118 70 L130 80 L145 87 L140 102 L132 107 L122 118 L115 135 L108 130 L107 115 L110 98 L99 85 Z",
  "avrupa": "M170 44 L171 37 L178 36 L175 32 L185 28 L188 23 L185 18 L195 11 L208 9 L230 12 L235 25 L225 35 L220 39 L208 39 L203 43 L195 42 L192 36 L185 37 L175 44 Z M176 30 L180 23 L183 22 L183 30 L179 31 Z",
  "asya": "M206 40 L207 43 L216 44 L215 50 L223 67 L232 65 L238 58 L240 55 L247 56 L253 60 L257 72 L260 65 L268 58 L272 59 L278 64 L280 67 L284 79 L289 68 L288 59 L301 50 L302 40 L308 45 L310 37 L322 34 L320 26 L340 20 L360 14 L360 10 L320 7 L290 3 L260 7 L240 10 L230 12 L235 25 L225 35 L220 39 L208 39 Z M310 49 L314 46 L321 38 L322 35 L318 37 L312 45 Z M275 75 L286 82 L287 86 L283 86 L274 78 Z M289 80 L297 75 L299 82 L292 85 Z",
  "afrika": "M163 59 L170 50 L174 45 L190 43 L200 48 L212 49 L215 52 L223 68 L231 68 L222 81 L220 95 L215 104 L208 113 L199 115 L192 97 L194 85 L189 76 L172 76 L163 66 Z M224 93 L230 95 L227 105 L223 102 Z",
  "avustralya": "M294 102 L302 97 L310 92 L317 92 L322 91 L326 99 L333 106 L330 117 L321 118 L311 111 L296 115 Z"
};
const OTHER_LAND = "M12 14 L40 10 L85 8 L100 18 L120 25 L114 35 L99 55 L83 62 L93 67 L100 72 L88 65 L75 60 L63 48 L55 38 L55 30 L30 20 Z M120 2 L155 2 L160 8 L138 20 L125 12 Z";
const IZMIT = [209.9, 39.2];
function renderMap(){
  const byReg = r => ST.find(st => st.region === r);
  const lit = r => { const st = byReg(r); return st && S.badges[st.id]; };
  const fresh = r => { const st = byReg(r); return st && S.last === st.id; };
  const kitalar = Object.keys(LAND).filter(r => byReg(r));
  const land = kitalar.map(r => `<path class="kita${lit(r) ? " lit" : ""}${fresh(r) ? " new" : ""}" data-r="${r}" d="${LAND[r]}"><title>${esc(REG[r].label)}</title></path>`).join("");
  const pin = byReg("izmit") ? `<g class="pin${lit("izmit") ? " lit" : ""}${fresh("izmit") ? " new" : ""}" data-r="izmit">
      <circle class="ring" cx="${IZMIT[0]}" cy="${IZMIT[1]}" r="6"/><circle class="dot" cx="${IZMIT[0]}" cy="${IZMIT[1]}" r="4.2"/><title>${esc(REG.izmit.label)}</title></g>` : "";
  $("#map").innerHTML = `<svg viewBox="0 0 360 140" role="img" aria-label="Kaşif haritası">
    <path class="lat" d="M0 80 H360 M0 56.5 H360 M0 103.5 H360"/>
    <path class="other" d="${OTHER_LAND}"/>${land}${pin}</svg>`;
  $("#map").querySelectorAll("[data-r]").forEach(el => el.onclick = () => { const st = byReg(el.dataset.r); openDrawer(st, !!S.badges[st.id]); });
  const k = kitalar.filter(lit).length;
  $("#map-cap").innerHTML = `<span>🌍 Dünya turun: <b>${k} / ${kitalar.length} kıta</b></span>` +
    (byReg("izmit") ? `<span>📍 ${esc(REG.izmit.label)}: <b>${lit("izmit") ? "✓" : "?"}</b></span>` : "");
}
$("#dr-close").onclick = () => $("#drawer").classList.add("hidden");
$("#drawer").onclick = e => { if (e.target.id === "drawer") $("#drawer").classList.add("hidden"); };
$("#btn-scan").onclick = () => show("v-scan");
$("#btn-menu").onclick = () => show("v-menu");
$("#btn-cert").onclick = () => openCert();

// Ana ekrana ekleme ipucu (iPhone'da verinin silinmemesi için önemli)
let deferredInstall = null;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredInstall = e; if (current === "v-home") renderInstall(); });
function isStandalone(){ return matchMedia("(display-mode: standalone)").matches || navigator.standalone === true; }
function renderInstall(){
  const box = $("#install");
  if (isStandalone()) { box.classList.add("hidden"); return; }
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (ios) {
    box.innerHTML = `📌 <b>Damgaların kaybolmasın!</b> Alttaki <b>Paylaş</b> düğmesine dokun, sonra <b>“Ana Ekrana Ekle”</b>yi seç.`;
    box.classList.remove("hidden");
  } else if (deferredInstall) {
    box.innerHTML = `📌 <b>Pasaportunu telefonuna ekle</b>, internet olmadan da açılsın.<button class="btn btn-ghost sm" id="btn-inst">Telefona ekle</button>`;
    box.classList.remove("hidden");
    $("#btn-inst").onclick = async () => { deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; renderInstall(); };
  } else box.classList.add("hidden");
}
function requestPersist(){ try{ navigator.storage && navigator.storage.persist && navigator.storage.persist(); }catch(e){} }

// ---------- Kamera / QR okuma ----------
let stream = null, raf = 0, detector = null, busy = false;
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
async function startCam(){
  const msg = $("#cam-msg"); msg.classList.add("hidden"); busy = false;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    msg.textContent = "Bu tarayıcı kameraya izin vermiyor. Kodu aşağıya yazabilirsin."; msg.classList.remove("hidden"); return;
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
    if (current !== "v-scan") { stopCam(); return; }
    const v = $("#video"); v.srcObject = stream; await v.play().catch(()=>{});
    if (!detector && "BarcodeDetector" in window) {
      try { const f = await BarcodeDetector.getSupportedFormats(); if (f.includes("qr_code")) detector = new BarcodeDetector({ formats: ["qr_code"] }); } catch(e){}
    }
    loop();
  } catch (e) {
    msg.textContent = "Kamera izni verilmedi. Tarayıcı ayarlarından izin ver ya da kodu aşağıya yaz.";
    msg.classList.remove("hidden");
  }
}
function stopCam(){
  cancelAnimationFrame(raf); raf = 0;
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
  const v = $("#video"); if (v) v.srcObject = null;
}
let last = 0;
function loop(){
  raf = requestAnimationFrame(loop);
  const now = performance.now(); if (now - last < 180 || busy) return; last = now;
  const v = $("#video"); if (!v.videoWidth) return;
  if (detector) {
    busy = true;
    detector.detect(v).then(r => { busy = false; if (r[0]) onScan(r[0].rawValue); }).catch(() => { busy = false; detector = null; });
    return;
  }
  if (!window.jsQR) return;
  const w = 480, h = Math.round(v.videoHeight * w / v.videoWidth);
  canvas.width = w; canvas.height = h; ctx.drawImage(v, 0, 0, w, h);
  const img = ctx.getImageData(0, 0, w, h);
  const res = jsQR(img.data, w, h, { inversionAttempts: "dontInvert" });
  if (res && res.data) onScan(res.data);
}
function onScan(text){
  if (current !== "v-scan") return;
  stopCam(); if (navigator.vibrate) navigator.vibrate(60);
  handleText(text);
}
$("#manual-form").onsubmit = e => {
  e.preventDefault();
  const v = $("#in-code").value.trim(); if (!v) return;
  $("#in-code").value = ""; $("#in-code").blur(); stopCam(); handleText(v);
};

// QR içeriğini çöz: istasyon kodu, kurtarma kodu ya da giriş QR'ı
function parse(text){
  const t = String(text).trim();
  let m = t.match(/[#?&]s=([A-Za-z0-9\-]+)/);     if (m) return { type:"code", value:m[1].toUpperCase() };
  m = t.toUpperCase().replace(/\s/g,"").match(/^([A-Z]{3})-?([A-Z0-9]{4})$/); if (m) return { type:"code", value:`${m[1]}-${m[2]}` };
  try { const u = new URL(t); if (u.origin === location.origin) return { type:"entry" }; } catch(e){}
  return { type:"unknown" };
}
const goHome = () => show(S ? "v-home" : "v-welcome", false);
const retry = () => show("v-scan", false);
function handleText(text){
  const p = parse(text);
  if (!S) return goHome();
  if (p.type === "code") return handleCode(p.value);
  if (p.type === "entry") return modal("🚪","Bu giriş QR'ı","Pasaportun zaten açık! Şimdi akvaryumdaki görev QR'larını bul.",[{label:"Tamam",onClick:goHome}]);
  modal("🤔","Bu QR bizim değil","Bu kod Okyanus Kaşifi görevlerinden biri değil. Görev tabelalarındaki QR'ları ara!",[{label:"Tekrar dene",onClick:retry},{label:"Damga sayfama dön",cls:"btn-ghost",onClick:goHome}]);
}
function handleCode(code){
  const st = ST.find(s => s.code === code);
  if (!st) return modal("🤔","Kod bulunamadı","Bu kodu tanıyamadık. Harfleri kontrol edip tekrar dene.",[{label:"Tekrar dene",onClick:retry},{label:"Damga sayfama dön",cls:"btn-ghost",onClick:goHome}]);
  if (S.badges[st.id]) return modal(st.art,"Bu damga zaten sende!",`“${st.title}” görevini daha önce tamamladın. Diğer canlıları bul!`,[{label:"Damga sayfam",onClick:goHome}]);
  if (st.quiz) openQuiz(st); else award(st);
}

// ---------- Soru ----------
function openQuiz(st){
  $("#quiz-art").innerHTML = artSVG(st.art);
  $("#quiz-title").textContent = `${st.name} · ${st.title}`;
  $("#quiz-q").textContent = st.quiz.q;
  const msg = $("#quiz-msg"); msg.textContent = ""; msg.style.color = "";
  const box = $("#quiz-opts"); box.innerHTML = "";
  st.quiz.options.forEach((o, i) => {
    const el = document.createElement("button"); el.className = "opt";
    el.innerHTML = `<span class="l">${"ABCD"[i]}</span><span></span>`; el.lastChild.textContent = o;
    el.onclick = () => {
      if (i === st.quiz.answer) {
        el.classList.add("right"); box.querySelectorAll(".opt").forEach(x => x.disabled = true);
        msg.textContent = "Doğru! Damgan geliyor…"; msg.style.color = "var(--ok)";
        setTimeout(() => award(st), 800);
      } else {
        el.classList.add("wrong"); el.disabled = true;
        // Kaybetmek yok: yanlış cevapta yön gösteren ipucu, istediği kadar deneyebilir
        msg.textContent = "Neredeyse! 💡 İpucu: " + (st.quiz.clue || "Tabelaya bir daha bak."); msg.style.color = "var(--sea2)";
        if (navigator.vibrate) navigator.vibrate([40,40,40]);
      }
    };
    box.appendChild(el);
  });
  stack = ["v-home"]; show("v-quiz", false);
}

// ---------- Damga ----------
function award(st){
  S.badges[st.id] = Date.now(); save();
  S.last = st.id;   // haritada yeni yanan bölge parlasın
  // Damga aleti pasaport sayfasına iner, damga basılır
  const stage = $("#rw-stamp"), ring = $("#ink-ring"), tool = $("#rw-tool");
  stage.innerHTML = stampSVG(st, { date: S.badges[st.id] });
  const g = D.groups.find(x => x.kind === REG[st.region].kind);
  $("#rw-page-hd").textContent = g ? `${g.icon || ""} ${g.label}` : "";
  [stage, ring, tool].forEach(el => { el.style.animation = "none"; void el.offsetWidth; el.style.animation = ""; });
  $("#rw-name").textContent = REG[st.region].label + " · " + st.name;
  $("#rw-title").textContent = st.title;
  $("#rw-fact-title").textContent = st.factTitle || "Biliyor muydun?";
  $(".fact-card").classList.toggle("eco", !!st.factTitle);
  $("#rw-fact").textContent = st.fact;
  const n = count(), t = ST.length;
  $("#rw-count").textContent = `⭐ ${n} / ${t} damga`;
  $("#rw-next").textContent = n === t ? "Final damgamı bas ⭐" : "Pasaportuma dön";
  $("#rw-next").onclick = () => n === t ? openCert() : show("v-home", false);
  stack = []; show("v-reward", false);
  const rv = $("#v-reward"); rv.classList.remove("shake"); void rv.offsetWidth; rv.classList.add("shake");
  setTimeout(() => { if (navigator.vibrate) navigator.vibrate(80); confetti(n === t ? 260 : 120); }, 560);
}
function confetti(N, sel = "#confetti", view = "v-reward"){
  const c = $(sel), x = c.getContext("2d"), dpr = devicePixelRatio || 1;
  c.width = innerWidth * dpr; c.height = innerHeight * dpr; x.setTransform(dpr,0,0,dpr,0,0);
  const cols = ["#f5bd3a","#7fe3ff","#ff7b54","#7be08f","#ffffff","#c08cff"];
  const P = Array.from({length:N}, () => ({ x:innerWidth/2, y:innerHeight*0.3, vx:(Math.random()-.5)*13, vy:-Math.random()*13-3,
    s:Math.random()*7+4, r:Math.random()*6, vr:(Math.random()-.5)*.3, c:cols[Math.random()*cols.length|0], o:Math.random() < .3 }));
  let f = 0;
  (function tick(){
    x.clearRect(0,0,innerWidth,innerHeight);
    P.forEach(p => { p.vy += .32; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      x.save(); x.translate(p.x,p.y); x.rotate(p.r); x.fillStyle = p.c;
      if (p.o) { x.beginPath(); x.arc(0,0,p.s/2.4,0,7); x.fill(); } else x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);
      x.restore(); });
    if (++f < 170 && current === view) requestAnimationFrame(tick); else x.clearRect(0,0,innerWidth,innerHeight);
  })();
}

// ---------- Final: pasaport tamamlandı ----------
// Damga aleti büyük altın "Okyanus Kaşifi" damgasını kapağa basar, kapak altına döner.
// Paylaşılan resim sertifika değil, çocuğun dolu pasaportu.
let certBlob = null;
function openCert(){
  if (count() < ST.length) return show("v-home", false);
  stack = ["v-home"]; show("v-cert", false);
  document.querySelectorAll("#v-cert [data-aq]").forEach(el => el.textContent = D.aquarium);
  $("#final-name").textContent = S.name;
  $("#final-p").textContent = `${S.name}, ${D.aquarium}'daki ${ST.length} bölgenin hepsini keşfettin. Pasaportun artık altın!`;
  const cover = $("#final-cover"), seal = $("#final-seal"), tool = $("#final-tool");
  seal.innerHTML = finalSealSVG(); cover.classList.remove("gold");
  [seal, tool].forEach(el => { el.style.animation = "none"; void el.offsetWidth; el.style.animation = ""; });
  setTimeout(() => { cover.classList.add("gold"); if (navigator.vibrate) navigator.vibrate([60,40,120]); confetti(280, "#confetti2", "v-cert"); }, 560);
  $("#cert-img").removeAttribute("src");
  setupSave();
  drawCert().then(blob => {
    certBlob = blob;
    // data: adresi, resme basılı tutunca iPhone'da "Fotoğraflara Ekle", Android'de "Resmi indir" çıkmasını garantiler
    const fr = new FileReader(); fr.onload = () => { $("#cert-img").src = fr.result; }; fr.readAsDataURL(blob);
  });
}

// ---------- Kaydetme: telefona göre en kolay yol ----------
// iPhone: paylaşma menüsündeki "Resmi Kaydet" doğrudan Fotoğraflar'a koyar (indirme Dosyalar'a gider).
// Android: doğrudan indirme tek dokunuşla Galeri'ye koyar (paylaşma menüsünde kaydet çoğu zaman yok).
const IOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const ANDROID = /android/i.test(navigator.userAgent);
function certFile(){ return new File([certBlob], `okyanus-kasifi-${S.id}.png`, { type:"image/png" }); }
function canShareFile(){ try { return !!(navigator.canShare && certBlob && navigator.canShare({ files:[certFile()] })); } catch(e){ return false; } }
function setupSave(){
  $("#btn-save").textContent = IOS ? "📲 Fotoğraflarıma kaydet" : "📥 Telefonuma kaydet";
  $("#btn-share").classList.toggle("hidden", !navigator.share);
  $("#save-hint").innerHTML = IOS ? "Açılan menüde <b>“Resmi Kaydet”</b>e dokun. Ya da resme basılı tut → <b>“Fotoğraflara Ekle”</b>."
    : ANDROID ? "Resim Galeri'ne kaydedilir. Ya da resme basılı tut → <b>“Resmi indir”</b>."
    : "Resim bilgisayarına indirilir.";
}
function download(){
  const a = document.createElement("a"); a.href = URL.createObjectURL(certBlob); a.download = `okyanus-kasifi-${S.id}.png`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => modal("🎉", "Kaydedildi!", ANDROID ? "Pasaportun Galeri'nde, İndirilenler klasöründe." : "Pasaportun İndirilenler klasöründe.", [{label:"Tamam"}]), 600);
}
async function shareFile(){
  try { await navigator.share({ files:[certFile()], title:"Okyanus Kaşifi Pasaportum", text:`${D.aquarium}'da Okyanus Kaşifi oldum!` }); return true; }
  catch(e){ return e && e.name === "AbortError"; }
}
$("#btn-save").onclick = async () => {
  if (!certBlob) return;
  if (IOS && canShareFile() && await shareFile()) return;
  download();
};
$("#btn-share").onclick = async () => {
  if (!certBlob) return;
  if (canShareFile() && await shareFile()) return;
  if (navigator.share) { try { await navigator.share({ title:"Okyanus Kaşifi", text:`${D.aquarium}'da Okyanus Kaşifi oldum!`, url: location.origin + location.pathname }); return; } catch(e){ if (e && e.name === "AbortError") return; } }
  download();
};
function svgImg(svg){
  return new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null);
    i.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg); });
}
// Dolu pasaport sayfası (1080x1350): altın başlık, kaşif kartı, 9 damga, final damgası
async function drawCert(){
  const F = '"Baloo 2",ui-rounded,system-ui,sans-serif';
  try { await Promise.all([document.fonts.load(`800 40px "Baloo 2"`, "ŞĞİ"), document.fonts.load(`600 40px "Baloo 2"`, "ŞĞİ")]); } catch(e){}
  const W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d");
  const g = x.createLinearGradient(0,0,0,H); g.addColorStop(0,"#1677b8"); g.addColorStop(.5,"#0b3c6e"); g.addColorStop(1,"#061f40");
  x.fillStyle = g; x.fillRect(0,0,W,H);
  x.strokeStyle = "rgba(255,255,255,.14)"; x.lineWidth = 3;
  for (let i=0;i<30;i++){ x.beginPath(); x.arc((i*397)%W, (i*613)%H, 6+(i*7)%22, 0, 7); x.stroke(); }
  // pasaport sayfası
  x.save(); x.shadowColor = "rgba(0,0,0,.35)"; x.shadowBlur = 40; x.shadowOffsetY = 16;
  rr(x,60,50,W-120,H-150,48); x.fillStyle = "#fff8ec"; x.fill(); x.restore();
  x.save(); rr(x,60,50,W-120,H-150,48); x.clip();
  x.strokeStyle = "rgba(56,182,216,.16)"; x.lineWidth = 3;
  for (let i=0;i<60;i++){ x.beginPath(); x.arc(60+(i*263)%960, 50+(i*181)%1200, 6+(i*5)%16, 0, 7); x.stroke(); }
  // altın başlık bandı
  const gg = x.createLinearGradient(0,50,0,240); gg.addColorStop(0,"#ffe38a"); gg.addColorStop(1,"#f5bd3a");
  x.fillStyle = gg; x.fillRect(60,50,W-120,190);
  x.restore();
  x.textAlign = "left";
  x.fillStyle = "#7a4a00"; x.font = `800 32px ${F}`; x.fillText(D.aquarium.toLocaleUpperCase("tr-TR"), 120, 118);
  x.fillStyle = "#10264d"; x.font = `800 64px ${F}`; x.fillText("Okyanus Kaşifi", 120, 186);
  x.fillStyle = "#7a4a00"; x.font = `600 34px ${F}`; x.fillText("pasaportu tamamlandı!", 120, 226);
  // kaşif kartı
  const avImg = await svgImg(artSVG(S.avatar));
  x.beginPath(); x.arc(210, 380, 96, 0, 7); x.fillStyle = "#e3f0fb"; x.fill(); x.lineWidth = 10; x.strokeStyle = "#f5bd3a"; x.stroke();
  if (avImg) x.drawImage(avImg, 130, 300, 160, 160);
  x.fillStyle = "#10264d"; let fs = 80; x.font = `800 ${fs}px ${F}`;
  while (x.measureText(S.name).width > 470 && fs > 40) { fs -= 4; x.font = `800 ${fs}px ${F}`; }
  x.fillText(S.name, 336, 380);
  const d = new Date().toLocaleDateString("tr-TR", { day:"numeric", month:"long", year:"numeric" });
  x.fillStyle = "#0f5a96"; x.font = `800 32px ${F}`; x.fillText(`Kaşif #${S.id}`, 338, 428);
  x.fillStyle = "#6a7891"; x.font = `600 30px ${F}`; x.fillText(d, 338, 468);
  x.textAlign = "center"; x.fillStyle = "#6a7891"; x.font = `600 34px ${F}`;
  x.fillText(`${D.aquarium}'daki ${ST.length} bölgenin hepsini keşfetti!`, W/2, 560);
  // damgalar: 3x3
  const imgs = await Promise.all(ST.map(st => svgImg(stampSVG(st, { date: S.badges[st.id] }))));
  const size = 210, cols = 3, gapX = 64;
  ST.forEach((st, i) => {
    if (!imgs[i]) return;
    const col = i % cols, row = Math.floor(i / cols);
    const cx = (W - (cols*size + (cols-1)*gapX))/2 + col*(size+gapX) + size/2, cy = 705 + row*212;
    x.save(); x.translate(cx, cy); x.rotate(ROT[i % ROT.length] * Math.PI / 180);
    x.drawImage(imgs[i], -size/2, -size/2, size, size); x.restore();
  });
  // final damgası sağ üstte, başlığa taşarak
  const seal = await svgImg(finalSealSVG());
  if (seal) { x.save(); x.translate(860, 250); x.rotate(-12 * Math.PI / 180); x.drawImage(seal, -130, -150, 260, 299); x.restore(); }
  x.fillStyle = "#fff"; x.font = `800 34px ${F}`; x.fillText("Denizleri keşfetmeye devam! 🌊", W/2, H-46);
  return new Promise(r => c.toBlob(r, "image/png"));
}
function rr(x,a,b,w,h,r){ x.beginPath(); x.moveTo(a+r,b); x.arcTo(a+w,b,a+w,b+h,r); x.arcTo(a+w,b+h,a,b+h,r); x.arcTo(a,b+h,a,b,r); x.arcTo(a,b,a+w,b,r); x.closePath(); }

// ---------- Menü ----------
function renderMenu(){ $("#howto-menu").innerHTML = howtoHTML(); $("#ver").textContent = `${D.aquarium} · ${D.season}`; }
$("#btn-reset").onclick = () => modal("🗑️","Emin misin?","Bu telefondaki tüm damgalar silinecek.",[
  {label:"Evet, sıfırla",cls:"btn-danger",onClick:()=>{ try{localStorage.removeItem(KEY);}catch(e){} S = null; stack = []; leafIdx = null; renderWelcome(); show("v-welcome",false); }},
  {label:"Vazgeç",cls:"btn-ghost"}]);

// ---------- Başlangıç ve QR linkleri ----------
let pending = null;
function readHash(){
  const h = location.hash; if (!h || h.length < 3) return;
  window.history.replaceState(null, "", location.pathname + location.search);
  const p = parse(h);
  if (p.type === "code") { if (S) handleCode(p.value); else pending = p.value; }
}
window.addEventListener("hashchange", readHash);

renderWelcome();
show(S ? "v-home" : "v-welcome", false);
readHash();
if (pending && !S) setTimeout(() => modal("🐠","Bir canlı buldun!","Önce kaşif adını yaz, damgan hemen pasaportuna basılacak.",[{label:"Tamam"}]), 300);

// Service worker: çevrimdışı çalışma
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  // Yeni sürüm yüklenince sayfayı bir kez yenile
  const hadCtrl = !!navigator.serviceWorker.controller; let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (hadCtrl && !reloaded && current !== "v-scan" && current !== "v-quiz" && current !== "v-reward") { reloaded = true; location.reload(); }
  });
  navigator.serviceWorker.register("sw.js").then(() => navigator.serviceWorker.ready).then(() => {
    $("#offline-ok").classList.remove("hidden");
  }).catch(()=>{});
}
})();
