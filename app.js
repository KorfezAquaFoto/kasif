(() => {
"use strict";
const D = window.KASIF;
const ST = D.stations;
const KEY = "okyanus-kasifi-v1";
const SALT = "korfez-aqua-kasif";      // kurtarma kodu sağlaması için
const AVATARS = ["🐬","🐢","🦀","🐡","🦑","🐳"];
const $ = s => document.querySelector(s);

// ---------- Kayıt ----------
let S = load();
function load(){ try{ return JSON.parse(localStorage.getItem(KEY)) || null; }catch(e){ return null; } }
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
function count(){ return S ? Object.keys(S.badges).length : 0; }
function newId(){ return String(1000 + Math.floor(Math.random()*9000)); }

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

function modal(ico, title, text, buttons = [{label:"Tamam"}]){
  $("#modal-ico").textContent = ico; $("#modal-title").textContent = title; $("#modal-text").textContent = text;
  const box = $("#modal-btns"); box.innerHTML = "";
  buttons.forEach(b => {
    const el = document.createElement("button");
    el.className = "btn " + (b.cls || "btn-gold"); el.textContent = b.label;
    el.onclick = () => { $("#modal").classList.add("hidden"); b.onClick && b.onClick(); };
    box.appendChild(el);
  });
  $("#modal").classList.remove("hidden");
}
function badgeEl(st, cls = ""){
  const d = document.createElement("div");
  d.className = "badge " + cls; d.style.setProperty("--c", st.color);
  d.innerHTML = `<span>${st.emoji}</span>`; return d;
}

// ---------- Karşılama ----------
let avatar = AVATARS[0];
function renderWelcome(){
  $("[data-aq]").textContent = D.aquarium;
  const box = $("#avatars"); box.innerHTML = "";
  AVATARS.forEach(a => {
    const b = document.createElement("button"); b.textContent = a; b.type = "button";
    b.className = a === avatar ? "sel" : ""; b.setAttribute("aria-label","Karakter " + a);
    b.onclick = () => { avatar = a; renderWelcome(); }; box.appendChild(b);
  });
}
$("#btn-start").onclick = () => {
  const name = $("#in-name").value.trim().slice(0,16) || "Kaşif";
  S = { v:1, id:newId(), name, avatar, badges:{}, created:Date.now() };
  save(); requestPersist(); show("v-home", false);
  if (pending) { const p = pending; pending = null; setTimeout(() => handleCode(p), 300); }
};
$("#btn-restore-open").onclick = () => { restoreMode = true; show("v-scan"); };

// ---------- Ana ekran ----------
function renderHome(){
  $("#me-av").textContent = S.avatar; $("#me-name").textContent = S.name; $("#me-id").textContent = "Kaşif #" + S.id;
  const n = count(), t = ST.length;
  $("#count").textContent = `⭐ ${n} / ${t}`;
  $("#bar").style.width = (n / t * 100) + "%";
  $("#progress-text").textContent = n === 0 ? "Akvaryumdaki ilk QR kodu bulmaya hazır mısın?"
    : n === t ? "Muhteşem! Artık gerçek bir okyanus kaşifisin." : `${t - n} görev kaldı. Devam et!`;
  $("#done-banner").classList.toggle("hidden", n !== t);
  const ul = $("#tasks"); ul.innerHTML = "";
  ST.forEach(st => {
    const got = !!S.badges[st.id];
    const li = document.createElement("li"); li.className = "task" + (got ? "" : " locked");
    li.appendChild(badgeEl(st));
    const body = document.createElement("div"); body.className = "task-body";
    body.innerHTML = `<b></b><small></small>`;
    body.querySelector("b").textContent = st.title;
    body.querySelector("small").textContent = got ? "Rozet kazanıldı" : st.hint;
    li.appendChild(body);
    if (got) { const c = document.createElement("span"); c.className = "check"; c.textContent = "✓"; li.appendChild(c); }
    ul.appendChild(li);
  });
  renderInstall();
}
$("#btn-scan").onclick = () => { restoreMode = false; show("v-scan"); };
$("#btn-menu").onclick = () => show("v-menu");
$("#btn-cert").onclick = () => openCert();

// Ana ekrana ekleme ipucu (iPhone'da verinin silinmemesi için önemli)
let deferredInstall = null;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredInstall = e; renderInstall(); });
function isStandalone(){ return matchMedia("(display-mode: standalone)").matches || navigator.standalone === true; }
function renderInstall(){
  const box = $("#install");
  if (isStandalone()) { box.classList.add("hidden"); return; }
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (ios) {
    box.innerHTML = `📌 <b>Rozetlerin kaybolmasın!</b> Alttaki <b>Paylaş</b> düğmesine dokun, sonra <b>“Ana Ekrana Ekle”</b>yi seç.`;
    box.classList.remove("hidden");
  } else if (deferredInstall) {
    box.innerHTML = `📌 <b>Pasaportunu telefonuna ekle</b>, internet olmadan da açılsın. <button class="btn btn-ghost sm" id="btn-inst">Ekle</button>`;
    box.classList.remove("hidden");
    $("#btn-inst").onclick = async () => { deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; renderInstall(); };
  } else box.classList.add("hidden");
}
function requestPersist(){ try{ navigator.storage && navigator.storage.persist && navigator.storage.persist(); }catch(e){} }

// ---------- Kamera / QR okuma ----------
let stream = null, raf = 0, detector = null, restoreMode = false, busy = false;
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
  $("#in-code").value = ""; stopCam(); handleText(v);
};

// QR içeriğini çöz: istasyon kodu, kurtarma kodu ya da giriş QR'ı
function parse(text){
  const t = String(text).trim();
  let m = t.match(/[#?&]r=([A-Za-z0-9_\-]+)/); if (m) return { type:"restore", value:m[1] };
  m = t.match(/[#?&]s=([A-Za-z0-9\-]+)/);     if (m) return { type:"code", value:m[1].toUpperCase() };
  m = t.toUpperCase().replace(/\s/g,"").match(/^([A-Z]{3})-?([A-Z0-9]{4})$/); if (m) return { type:"code", value:`${m[1]}-${m[2]}` };
  try { const u = new URL(t); if (u.origin === location.origin) return { type:"entry" }; } catch(e){}
  return { type:"unknown" };
}
function handleText(text){
  const p = parse(text);
  if (p.type === "restore") return doRestore(p.value);
  if (restoreMode) { return modal("🤔","Bu bir kurtarma QR'ı değil","Kaydettiğin kurtarma QR'ını okutmalısın.",[{label:"Tekrar dene",onClick:()=>show("v-scan",false)},{label:"Vazgeç",cls:"btn-ghost",onClick:back}]); }
  if (p.type === "code") return handleCode(p.value);
  if (p.type === "entry") return modal("🚪","Bu giriş QR'ı","Pasaportun zaten açık! Şimdi akvaryumdaki görev QR'larını bul.",[{label:"Tamam",onClick:()=>show("v-home",false)}]);
  modal("🤔","Bu QR bizim değil","Bu kod Okyanus Kaşifi görevlerinden biri değil. Görev tabelalarındaki QR'ları ara!",[{label:"Tekrar dene",onClick:()=>show("v-scan",false)},{label:"Görevlerime dön",cls:"btn-ghost",onClick:()=>show("v-home",false)}]);
}
function handleCode(code){
  const st = ST.find(s => s.code === code);
  if (!st) return modal("🤔","Kod bulunamadı","Bu kodu tanıyamadık. Harfleri kontrol edip tekrar dene.",[{label:"Tekrar dene",onClick:()=>show("v-scan",false)},{label:"Görevlerime dön",cls:"btn-ghost",onClick:()=>show("v-home",false)}]);
  if (S.badges[st.id]) return modal(st.emoji,"Bu rozet zaten sende!",`“${st.title}” görevini daha önce tamamladın. Diğer görevlere bak.`,[{label:"Görevlerim",onClick:()=>show("v-home",false)}]);
  if (st.quiz) openQuiz(st); else award(st);
}

// ---------- Soru ----------
function openQuiz(st){
  const qb = $("#quiz-badge"); qb.innerHTML = ""; const b = badgeEl(st, "quiz-badge"); qb.replaceWith(b); b.id = "quiz-badge";
  $("#quiz-title").textContent = st.title;
  $("#quiz-q").textContent = st.quiz.q;
  const msg = $("#quiz-msg"); msg.textContent = ""; msg.style.color = "";
  const box = $("#quiz-opts"); box.innerHTML = "";
  st.quiz.options.forEach((o, i) => {
    const el = document.createElement("button"); el.className = "opt"; el.textContent = o;
    el.onclick = () => {
      if (i === st.quiz.answer) {
        el.classList.add("right"); box.querySelectorAll(".opt").forEach(x => x.disabled = true);
        msg.textContent = "Doğru! 🎉"; msg.style.color = "var(--ok)";
        setTimeout(() => award(st), 700);
      } else {
        el.classList.add("wrong"); el.disabled = true;
        msg.textContent = "Olmadı, tabelaya bir daha bak ve tekrar dene!"; msg.style.color = "var(--bad)";
      }
    };
    box.appendChild(el);
  });
  stack = ["v-home"]; show("v-quiz", false);
}

// ---------- Rozet ----------
function award(st){
  S.badges[st.id] = Date.now(); save();
  const rb = $("#rw-badge"); const b = badgeEl(st, "big-badge"); rb.replaceWith(b); b.id = "rw-badge";
  $("#rw-title").textContent = st.title;
  $("#rw-fact").textContent = st.fact;
  const n = count(), t = ST.length;
  $("#rw-count").textContent = `⭐ ${n} / ${t} rozet`;
  $("#rw-next").textContent = n === t ? "Sertifikamı al 🏆" : "Görevlerime dön";
  $("#rw-next").onclick = () => n === t ? openCert() : show("v-home", false);
  stack = []; show("v-reward", false); confetti(n === t ? 260 : 120);
}
function confetti(N){
  const c = $("#confetti"), x = c.getContext("2d"), dpr = devicePixelRatio || 1;
  c.width = innerWidth * dpr; c.height = innerHeight * dpr; x.scale(dpr, dpr);
  const cols = ["#f2b632","#5fd3f3","#ff7b54","#7be08f","#ffffff","#c08cff"];
  const P = Array.from({length:N}, () => ({ x:innerWidth/2, y:innerHeight*0.35, vx:(Math.random()-.5)*12, vy:-Math.random()*13-3,
    s:Math.random()*7+4, r:Math.random()*6, vr:(Math.random()-.5)*.3, c:cols[Math.random()*cols.length|0] }));
  let f = 0;
  (function tick(){
    x.clearRect(0,0,innerWidth,innerHeight);
    P.forEach(p => { p.vy += .32; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      x.save(); x.translate(p.x,p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2); x.restore(); });
    if (++f < 160 && current === "v-reward") requestAnimationFrame(tick); else x.clearRect(0,0,innerWidth,innerHeight);
  })();
}

// ---------- Sertifika ----------
let certBlob = null;
function openCert(){
  if (count() < ST.length) return show("v-home", false);
  stack = ["v-home"]; show("v-cert", false);
  drawCert().then(blob => { certBlob = blob; $("#cert-img").src = URL.createObjectURL(blob); });
}
function drawCert(){
  const W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d"), F = 'ui-rounded,"SF Pro Rounded",system-ui,-apple-system,Roboto,sans-serif';
  const g = x.createLinearGradient(0,0,0,H); g.addColorStop(0,"#123a7a"); g.addColorStop(1,"#0b2150");
  x.fillStyle = g; x.fillRect(0,0,W,H);
  // bubbles
  x.strokeStyle = "rgba(255,255,255,.12)"; x.lineWidth = 3;
  for (let i=0;i<26;i++){ x.beginPath(); x.arc((i*397)%W, (i*613)%H, 6+(i*7)%22, 0, 7); x.stroke(); }
  // card
  rr(x,60,60,W-120,H-120,40); x.fillStyle = "#fffaf0"; x.fill();
  x.lineWidth = 10; x.strokeStyle = "#f2b632"; x.stroke();
  rr(x,90,90,W-180,H-180,28); x.lineWidth = 3; x.strokeStyle = "#1d6fb8"; x.stroke();
  x.textAlign = "center"; x.fillStyle = "#1d6fb8";
  x.font = `800 34px ${F}`; x.fillText(D.aquarium.toLocaleUpperCase("tr-TR"), W/2, 190);
  x.fillStyle = "#0e2a5c"; x.font = `900 78px ${F}`; x.fillText("OKYANUS KAŞİFİ", W/2, 290);
  x.font = `800 46px ${F}`; x.fillStyle = "#1d6fb8"; x.fillText("SERTİFİKASI", W/2, 352);
  x.font = `140px ${F}`; x.fillText(S.avatar, W/2, 530);
  x.fillStyle = "#5a6b88"; x.font = `600 36px ${F}`; x.fillText("Bu sertifika", W/2, 610);
  x.fillStyle = "#0e2a5c"; let fs = 92; x.font = `900 ${fs}px ${F}`;
  while (x.measureText(S.name).width > W - 260 && fs > 40) { fs -= 4; x.font = `900 ${fs}px ${F}`; }
  x.fillText(S.name, W/2, 712);
  x.fillStyle = "#f2b632"; x.fillRect(W/2-220, 740, 440, 6);
  x.fillStyle = "#5a6b88"; x.font = `600 36px ${F}`;
  x.fillText(`adlı kaşifimize, ${ST.length} keşif görevinin`, W/2, 810);
  x.fillText("hepsini başarıyla tamamladığı için verilmiştir.", W/2, 860);
  // badges
  const n = ST.length, size = 104, gap = 16, total = n*size + (n-1)*gap; let bx = (W-total)/2 + size/2;
  ST.forEach(st => {
    x.beginPath(); x.arc(bx, 980, size/2, 0, 7); x.fillStyle = st.color; x.fill();
    x.lineWidth = 6; x.strokeStyle = "#f2b632"; x.stroke();
    x.font = `58px ${F}`; x.fillText(st.emoji, bx, 1000); bx += size + gap;
  });
  const d = new Date().toLocaleDateString("tr-TR", { day:"numeric", month:"long", year:"numeric" });
  x.fillStyle = "#0e2a5c"; x.font = `800 34px ${F}`; x.fillText(d, W/2, 1120);
  x.fillStyle = "#5a6b88"; x.font = `600 30px ${F}`; x.fillText(`Kaşif #${S.id}`, W/2, 1170);
  return new Promise(r => c.toBlob(r, "image/png"));
}
function rr(x,a,b,w,h,r){ x.beginPath(); x.moveTo(a+r,b); x.arcTo(a+w,b,a+w,b+h,r); x.arcTo(a+w,b+h,a,b+h,r); x.arcTo(a,b+h,a,b,r); x.arcTo(a,b,a+w,b,r); x.closePath(); }
$("#btn-share").onclick = async () => {
  if (!certBlob) return;
  const file = new File([certBlob], `okyanus-kasifi-${S.id}.png`, { type:"image/png" });
  try {
    if (navigator.canShare && navigator.canShare({ files:[file] })) {
      await navigator.share({ files:[file], title:"Okyanus Kaşifi Sertifikam", text:`${D.aquarium}'da Okyanus Kaşifi oldum! 🐢` });
      return;
    }
  } catch(e){ if (e && e.name === "AbortError") return; }
  const a = document.createElement("a"); a.href = URL.createObjectURL(certBlob); a.download = file.name;
  document.body.appendChild(a); a.click(); a.remove();
};

// ---------- Kurtarma kodu ----------
function b64u(s){ return btoa(unescape(encodeURIComponent(s))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }
function unb64u(s){ s = s.replace(/-/g,"+").replace(/_/g,"/"); while (s.length % 4) s += "="; return decodeURIComponent(escape(atob(s))); }
function sum(s){ let h = 2166136261; for (const ch of s + SALT) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36).slice(0,5); }
function recoveryPayload(){
  const mask = ST.map(st => S.badges[st.id] ? 1 : 0).join("");
  const body = [S.id, S.name, S.avatar, mask].join("|");
  return b64u(body + "|" + sum(body));
}
function recoveryUrl(){ return location.origin + location.pathname + "#r=" + recoveryPayload(); }
function renderMenu(){
  const qr = qrcode(0, "M"); qr.addData(recoveryUrl()); qr.make();
  $("#rec-qr").innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
  $("#rec-id").textContent = `${S.avatar} ${S.name} · Kaşif #${S.id} · ${count()}/${ST.length} rozet`;
  $("#ver").textContent = `${D.aquarium} · ${D.season}`;
}
function doRestore(payload){
  restoreMode = false;
  let parts;
  try { parts = unb64u(payload).split("|"); } catch(e){ parts = []; }
  const [id, name, av, mask, chk] = parts;
  if (parts.length !== 5 || sum([id,name,av,mask].join("|")) !== chk) {
    return modal("⚠️","Kurtarma kodu bozuk","Bu QR okunamadı. Ekran görüntüsünün net olduğundan emin ol.",[{label:"Tamam",onClick:()=>show(S ? "v-home" : "v-welcome", false)}]);
  }
  const apply = () => {
    const badges = S && S.id === id ? S.badges : {};
    ST.forEach((st, i) => { if (mask[i] === "1" && !badges[st.id]) badges[st.id] = Date.now(); });
    S = { v:1, id, name, avatar:av, badges, created:(S && S.created) || Date.now() };
    save(); requestPersist(); stack = [];
    modal("🎒","Rozetlerin geri geldi!",`Tekrar hoş geldin ${name}! ${count()} rozetin pasaportunda.`,[{label:"Görevlerim",onClick:()=>show("v-home",false)}]);
  };
  if (S && S.id !== id && count() > 0) {
    modal("🔄","Pasaport değişsin mi?",`Bu telefondaki ${S.name} pasaportu yerine ${name} pasaportu yüklenecek.`,
      [{label:"Evet, yükle",onClick:apply},{label:"Vazgeç",cls:"btn-ghost",onClick:()=>show("v-home",false)}]);
  } else apply();
}
$("#btn-restore-scan").onclick = () => { restoreMode = true; show("v-scan"); };
$("#btn-reset").onclick = () => modal("🗑️","Emin misin?","Bu telefondaki tüm rozetler silinecek.",[
  {label:"Evet, sıfırla",cls:"btn-danger",onClick:()=>{ try{localStorage.removeItem(KEY);}catch(e){} S = null; stack = []; renderWelcome(); show("v-welcome",false); }},
  {label:"Vazgeç",cls:"btn-ghost"}]);

// ---------- Başlangıç ve QR linkleri ----------
let pending = null;
function readHash(){
  const h = location.hash; if (!h || h.length < 3) return;
  window.history.replaceState(null, "", location.pathname + location.search);
  const p = parse(h);
  if (p.type === "restore") return doRestore(p.value);
  if (p.type === "code") { if (S) handleCode(p.value); else pending = p.value; }
}
window.addEventListener("hashchange", readHash);

renderWelcome();
show(S ? "v-home" : "v-welcome", false);
readHash();
if (pending && !S) setTimeout(() => modal("🐢","Bir görev buldun!","Önce kaşif adını yaz, rozetin hemen pasaportuna eklenecek.",[{label:"Tamam"}]), 300);

// Service worker: çevrimdışı çalışma
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").then(() => navigator.serviceWorker.ready).then(() => {
    $("#offline-ok").classList.remove("hidden");
  }).catch(()=>{});
}
})();
