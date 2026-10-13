(() => {
"use strict";
const D = window.KASIF;
const ST = D.stations;
const KEY = "okyanus-kasifi-v1";
const SALT = "korfez-aqua-kasif";      // kurtarma kodu sağlaması için
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
  $("#passport").classList.add("open");
  setTimeout(() => {
    $("#passport").classList.remove("open");
    show("v-home", false);
    if (pending) { const p = pending; pending = null; setTimeout(() => handleCode(p), 350); }
  }, 650);
};
$("#btn-restore-open").onclick = () => { restoreMode = true; show("v-scan"); };

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
  // Pasaport sayfaları: kıtalar, körfez, özel bölgeler
  const ul = $("#slots"); ul.innerHTML = "";
  D.groups.forEach(g => {
    const list = ST.filter(st => REG[st.region].kind === g.kind);
    if (!list.length) return;
    const h = document.createElement("li"); h.className = "group"; h.textContent = g.label; ul.appendChild(h);
    list.forEach(st => {
      const i = ST.indexOf(st), got = !!S.badges[st.id];
      const li = document.createElement("li");
      li.className = "slot " + (got ? "got" : "locked");
      li.style.setProperty("--rot", ROT[i % ROT.length] + "deg");
      li.innerHTML = `<div class="disc">${got ? stampSVG(st, { date: S.badges[st.id] }) : `<div class="sil">${artSVG(st.art)}</div>`}<span class="num">${got ? "✓" : i + 1}</span></div>
        <b>${esc(got ? st.name : st.title)}</b><small>${esc(REG[st.region].label)}</small>`;
      li.onclick = () => openDrawer(st, got);
      ul.appendChild(li);
    });
  });
  S.last = null;
  renderInstall();
}
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
$("#btn-scan").onclick = () => { restoreMode = false; show("v-scan"); };
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
let stream = null, raf = 0, detector = null, restoreMode = false, busy = false;
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
async function startCam(){
  $("#scan-title").textContent = restoreMode ? "Kurtarma QR'ını okut" : "QR kodu çerçeveye getir";
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
  let m = t.match(/[#?&]r=([A-Za-z0-9_\-]+)/); if (m) return { type:"restore", value:m[1] };
  m = t.match(/[#?&]s=([A-Za-z0-9\-]+)/);     if (m) return { type:"code", value:m[1].toUpperCase() };
  m = t.toUpperCase().replace(/\s/g,"").match(/^([A-Z]{3})-?([A-Z0-9]{4})$/); if (m) return { type:"code", value:`${m[1]}-${m[2]}` };
  try { const u = new URL(t); if (u.origin === location.origin) return { type:"entry" }; } catch(e){}
  return { type:"unknown" };
}
const goHome = () => show(S ? "v-home" : "v-welcome", false);
const retry = () => show("v-scan", false);
function handleText(text){
  const p = parse(text);
  if (p.type === "restore") return doRestore(p.value);
  if (restoreMode) return modal("🤔","Bu bir kurtarma QR'ı değil","Kaydettiğin kurtarma QR'ını okutmalısın.",[{label:"Tekrar dene",onClick:retry},{label:"Vazgeç",cls:"btn-ghost",onClick:goHome}]);
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
        msg.textContent = "Olmadı! Tabelaya bir daha bak ve tekrar dene."; msg.style.color = "var(--bad)";
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
  const stage = $("#rw-stamp"), ring = $("#ink-ring");
  stage.innerHTML = stampSVG(st, { date: S.badges[st.id] });
  [stage, ring].forEach(el => { el.style.animation = "none"; void el.offsetWidth; el.style.animation = ""; });
  $("#rw-name").textContent = REG[st.region].label + " · " + st.name;
  $("#rw-title").textContent = st.title;
  $("#rw-fact-title").textContent = st.factTitle || "Biliyor muydun?";
  $(".fact-card").classList.toggle("eco", !!st.factTitle);
  $("#rw-fact").textContent = st.fact;
  const n = count(), t = ST.length;
  $("#rw-count").textContent = `⭐ ${n} / ${t} damga`;
  $("#rw-next").textContent = n === t ? "Sertifikamı al 🏆" : "Damga sayfama dön";
  $("#rw-next").onclick = () => n === t ? openCert() : show("v-home", false);
  stack = []; show("v-reward", false);
  const rv = $("#v-reward"); rv.classList.remove("shake"); void rv.offsetWidth; rv.classList.add("shake");
  setTimeout(() => { if (navigator.vibrate) navigator.vibrate(80); confetti(n === t ? 260 : 120); }, 380);
}
function confetti(N){
  const c = $("#confetti"), x = c.getContext("2d"), dpr = devicePixelRatio || 1;
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
    if (++f < 170 && current === "v-reward") requestAnimationFrame(tick); else x.clearRect(0,0,innerWidth,innerHeight);
  })();
}

// ---------- Sertifika ----------
let certBlob = null;
function openCert(){
  if (count() < ST.length) return show("v-home", false);
  stack = ["v-home"]; show("v-cert", false);
  $("#cert-img").removeAttribute("src");
  drawCert().then(blob => { certBlob = blob; $("#cert-img").src = URL.createObjectURL(blob); });
}
function svgImg(svg){
  return new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null);
    i.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg); });
}
async function drawCert(){
  const F = '"Baloo 2",ui-rounded,system-ui,sans-serif';
  try { await Promise.all([document.fonts.load(`800 40px "Baloo 2"`, "ŞĞİ"), document.fonts.load(`600 40px "Baloo 2"`, "ŞĞİ")]); } catch(e){}
  const W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d");
  const g = x.createLinearGradient(0,0,0,H); g.addColorStop(0,"#1677b8"); g.addColorStop(.5,"#0b3c6e"); g.addColorStop(1,"#061f40");
  x.fillStyle = g; x.fillRect(0,0,W,H);
  x.strokeStyle = "rgba(255,255,255,.14)"; x.lineWidth = 3;
  for (let i=0;i<30;i++){ x.beginPath(); x.arc((i*397)%W, (i*613)%H, 6+(i*7)%22, 0, 7); x.stroke(); }
  rr(x,60,60,W-120,H-120,44); x.fillStyle = "#fff8ec"; x.fill();
  x.lineWidth = 12; x.strokeStyle = "#f5bd3a"; x.stroke();
  rr(x,92,92,W-184,H-184,30); x.setLineDash([10,12]); x.lineWidth = 3; x.strokeStyle = "#c9b48a"; x.stroke(); x.setLineDash([]);
  x.textAlign = "center";
  x.fillStyle = "#0f5a96"; x.font = `800 34px ${F}`; x.fillText(D.aquarium.toLocaleUpperCase("tr-TR"), W/2, 178);
  x.fillStyle = "#10264d"; x.font = `800 92px ${F}`; x.fillText("OKYANUS KAŞİFİ", W/2, 276);
  x.fillStyle = "#e39a12"; x.font = `800 46px ${F}`; x.fillText("S E R T İ F İ K A S I", W/2, 336);
  const avImg = await svgImg(artSVG(S.avatar));
  x.beginPath(); x.arc(W/2, 456, 86, 0, 7); x.fillStyle = "#e3f0fb"; x.fill(); x.lineWidth = 8; x.strokeStyle = "#f5bd3a"; x.stroke();
  if (avImg) x.drawImage(avImg, W/2-72, 384, 144, 144);
  x.fillStyle = "#6a7891"; x.font = `600 36px ${F}`; x.fillText("Bu sertifika", W/2, 596);
  x.fillStyle = "#10264d"; let fs = 104; x.font = `800 ${fs}px ${F}`;
  while (x.measureText(S.name).width > W - 280 && fs > 44) { fs -= 4; x.font = `800 ${fs}px ${F}`; }
  x.fillText(S.name, W/2, 700);
  x.fillStyle = "#f5bd3a"; rr(x, W/2-210, 724, 420, 8, 4); x.fill();
  x.fillStyle = "#6a7891"; x.font = `600 36px ${F}`;
  x.fillText(`adlı kaşifimize, ${D.aquarium}'daki ${ST.length} damganın`, W/2, 796);
  x.fillText("hepsini topladığı için verilmiştir.", W/2, 844);
  // damgalar: 2 sıra
  const imgs = await Promise.all(ST.map(st => svgImg(stampSVG(st, { date: S.badges[st.id] }))));
  const perRow = Math.ceil(ST.length / 2), size = 150, gap = 18;
  ST.forEach((st, i) => {
    const row = i < perRow ? 0 : 1, inRow = row === 0 ? perRow : ST.length - perRow, k = row === 0 ? i : i - perRow;
    const total = inRow*size + (inRow-1)*gap, cx = (W-total)/2 + k*(size+gap) + size/2, cy = 944 + row*(size+8);
    if (!imgs[i]) return;
    x.save(); x.translate(cx, cy); x.rotate(ROT[i % ROT.length] * Math.PI / 180);
    x.drawImage(imgs[i], -size/2, -size/2, size, size); x.restore();
  });
  const d = new Date().toLocaleDateString("tr-TR", { day:"numeric", month:"long", year:"numeric" });
  x.fillStyle = "#10264d"; x.font = `800 32px ${F}`; x.fillText(d, W/2, 1204);
  x.fillStyle = "#6a7891"; x.font = `600 28px ${F}`; x.fillText(`Kaşif #${S.id}`, W/2, 1238);
  return new Promise(r => c.toBlob(r, "image/png"));
}
function rr(x,a,b,w,h,r){ x.beginPath(); x.moveTo(a+r,b); x.arcTo(a+w,b,a+w,b+h,r); x.arcTo(a+w,b+h,a,b+h,r); x.arcTo(a,b+h,a,b,r); x.arcTo(a,b,a+w,b,r); x.closePath(); }
$("#btn-share").onclick = async () => {
  if (!certBlob) return;
  const file = new File([certBlob], `okyanus-kasifi-${S.id}.png`, { type:"image/png" });
  try {
    if (navigator.canShare && navigator.canShare({ files:[file] })) {
      await navigator.share({ files:[file], title:"Okyanus Kaşifi Sertifikam", text:`${D.aquarium}'da Okyanus Kaşifi oldum!` });
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
  const got = ST.filter(st => S.badges[st.id]).map(st => st.id).join(",");
  const body = [S.id, S.name, S.avatar, got].join("|");
  return b64u(body + "|" + sum(body));
}
function recoveryUrl(){ return location.origin + location.pathname + "#r=" + recoveryPayload(); }
function renderMenu(){
  const qr = qrcode(0, "M"); qr.addData(recoveryUrl()); qr.make();
  $("#rec-qr").innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
  $("#rec-id").textContent = `${S.name} · Kaşif #${S.id} · ${count()}/${ST.length} damga`;
  $("#ver").textContent = `${D.aquarium} · ${D.season}`;
}
function doRestore(payload){
  restoreMode = false;
  let parts;
  try { parts = unb64u(payload).split("|"); } catch(e){ parts = []; }
  const [id, name, avt, got, chk] = parts;
  if (parts.length !== 5 || sum([id,name,avt,got].join("|")) !== chk) {
    return modal("⚠️","Kurtarma kodu bozuk","Bu QR okunamadı. Ekran görüntüsünün net olduğundan emin ol.",[{label:"Tamam",onClick:goHome}]);
  }
  const ids = got ? got.split(",") : [];
  const apply = () => {
    const badges = S && S.id === id ? S.badges : {};
    ST.forEach(st => { if (ids.includes(st.id) && !badges[st.id]) badges[st.id] = Date.now(); });
    S = { v:1, id, name, avatar: AVATARS.includes(avt) ? avt : AVATARS[0], badges, created:(S && S.created) || Date.now() };
    save(); requestPersist(); stack = [];
    modal(S.avatar,"Damgaların geri geldi!",`Tekrar hoş geldin ${name}! ${count()} damgan pasaportunda.`,[{label:"Damga sayfam",onClick:() => show("v-home",false)}]);
  };
  if (S && S.id !== id && count() > 0) {
    modal("🔄","Pasaport değişsin mi?",`Bu telefondaki ${S.name} pasaportu yerine ${name} pasaportu yüklenecek.`,
      [{label:"Evet, yükle",onClick:apply},{label:"Vazgeç",cls:"btn-ghost",onClick:goHome}]);
  } else apply();
}
$("#btn-restore-scan").onclick = () => { restoreMode = true; show("v-scan"); };
$("#btn-reset").onclick = () => modal("🗑️","Emin misin?","Bu telefondaki tüm damgalar silinecek.",[
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
