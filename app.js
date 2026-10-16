(() => {
"use strict";
const D = window.KASIF;
const route = D.regionOrder || Object.keys(D.regions);
const rank = s => route.includes(s.region) ? route.indexOf(s.region) : route.length;
const ST = [...D.stations].sort((a,b) => rank(a)-rank(b));
const KEY = "okyanus-kasifi-v1";
const AVATARS = ["vatoz","kesis","orfoz","pirana","mersin","karagoz"];
const REG = D.regions;
const ROT = [-9, 7, -5, 10, -12, 6, -7, 8, -4, 11];
const $ = s => document.querySelector(s);
const olay = (...a) => { try { window.kasifOlay && window.kasifOlay(...a); } catch(e){} };
let scanSource = "link";
// ---------- v41 görsel yenilikler ----------
// Her biri tek tek kapatılabilir: false yapılırsa o parça v40'taki gibi davranır.
const FX = {
  parlak: true,    // damgalar hologram gibi parlar
  qrEfekt: true,   // QR okununca "Buldun!" patlaması
  bolgeRenk: true, // Tanış/soru/damga ekranında bölgeye göre arka plan
  yol: true,       // macera yolunda altın iz ve yürüyen kaşif dostu
  unvan: true,     // 3 / 6 / 9 damgada kaşif unvanı
  tepki: true,     // soru ekranında kaşif dostunun sevinci/düşünmesi
  sandik: true,    // 9/9'da hazine sandığının açılması
  hikaye: true     // dolu pasaportu dik "hikâye" resmi olarak paylaşma
};
Object.keys(FX).forEach(k => document.documentElement.classList.toggle("fx-" + k, !!FX[k]));
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const RANKS = [[9, "🏆", "Okyanus Kaşifi"], [6, "🐬", "Cesur Kaşif"], [3, "🐠", "Yavru Kaşif"]];
const rankOf = n => RANKS.find(r => n >= r[0]) || null;
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

// ---------- Kayıt ----------
let storageAlertShown = false;
let S = load();
function load(){
  try{
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && !AVATARS.includes(s.avatar)) s.avatar = AVATARS[0];
    return s || null;
  }catch(e){ return null; }
}
function save(){
  try {
    localStorage.setItem(KEY,JSON.stringify(S));
    document.querySelector('#save-warning')?.classList.add('hidden');document.querySelector('#save-retry')?.classList.add('hidden');storageAlertShown=false;return true;
  } catch(e) {
    document.querySelector('#save-warning')?.classList.remove('hidden');
    if(!storageAlertShown){storageAlertShown=true;setTimeout(()=>modal('⚠️','İlerlemen kaydedilemedi','Bu telefonda kayıt yapılamadı. Sayfayı kapatırsan damgaların kaybolabilir. İzinleri kontrol edip yeniden deneyebilirsin.',[
      {label:'Tekrar dene',onClick:()=>{storageAlertShown=false;save();}},
      {label:'Oynamaya devam et',cls:'btn-ghost'}]),0);}
    return false;
  }
}
function count(){ return S ? ST.filter(st => S.badges[st.id]).length : 0; }
function newId(){ return String(1000 + Math.floor(Math.random()*9000)); }
const av = key => artSVG(AVATARS.includes(key) ? key : AVATARS[0]);

// ---------- Görünümler ----------
let current = null, stack = [];
function show(id, push = true){
  stopSpeech();
  if (current === "v-scan" && id !== "v-scan") stopCam();
  if (push && current && current !== id && !["v-reward","v-quiz"].includes(current)) stack.push(current);
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === id));
  document.body.classList.toggle("scan-mode", id === "v-scan");
  current = id; window.scrollTo(0,0); scheduleFit();
  if (!["v-learn","v-quiz","v-reward","v-scan"].includes(id)) setBolge(null);
  document.querySelectorAll("[data-listen]").forEach(b => b.hidden = !("speechSynthesis" in window));
  if (id === "v-home") renderHome();
  if (id === "v-scan") startCam();
  if (id === "v-menu") renderMenu();
  if (id === "v-hints") renderHints();
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
function renderWelcome(animate=false){
  document.querySelectorAll("[data-aq]").forEach(el=>el.textContent=D.aquarium);
  document.querySelectorAll(".sheet-lead b").forEach(b => b.textContent = ST.length + " damgayı");
  const box = $("#avatars"); box.innerHTML = "";
  AVATARS.forEach(a => {
    const b = document.createElement("button"); b.type = "button";
    b.className = a === avatar ? 'sel'+(animate?' just-picked':'') : ''; b.innerHTML = artSVG(a)+(a===avatar?'<span class="avatar-check" aria-hidden="true">✓</span>':'');
    b.dataset.avatar=a;b.setAttribute('aria-pressed',String(a===avatar));
    b.setAttribute("aria-label", (ST.find(s => s.art === a) || {}).name || a);
    b.onclick = () => { avatar = a; renderWelcome(true); document.querySelector('#avatars [data-avatar="'+a+'"]').focus({preventScroll:true}); }; box.appendChild(b);
  });
}
$("#in-name").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();e.currentTarget.blur();}});
$("#btn-start").onclick = () => {
  const name = $("#in-name").value.trim().slice(0,16) || "Kaşif";
  S = { v:1, id:newId(), name, avatar, badges:{}, created:Date.now() };
  save(); requestPersist(); olay("start");
  // Kapak kitap gibi açılır, altında kaşif dostu ve "Merhaba" görünür
  $("#idpage-w").innerHTML = helloHTML();
  $("#ready-msg").textContent = `Pasaportun hazır, ${S.name}!`;
  $("#in-name").blur(); window.scrollTo(0, 0);
  // Açılış kendi merkezlenmiş sahnesini kullanır; klavye kapanırken konum ölçmeyiz.
  $("#v-welcome").classList.add("opening");
  setTimeout(() => {
    $("#v-welcome").classList.remove("opening");
    show("v-home", false);
    if (pending) { const p = pending; pending = null; setTimeout(() => handleCode(p), 350); }
  }, 2600);
};

// ---------- Simgelerle nasıl oynanır ----------
const FLOW = `<span>🔍</span><i>›</i><span>📷</span><i>›</i><span>❓</span><i>›</i><span>⭐</span>`;
const HOWTO = [["🔍", "İpucunu oku, keşfini bul"], ["📷", "Görev tabelasındaki QR kodunu <b>QR Tara</b> ile okut"], ["❓", "Soruyu cevapla"], ["⭐", "Damgan pasaportuna basılsın!"]];
const howtoHTML = () => HOWTO.map(([i, t]) => `<li><span>${i}</span><p>${t}</p></li>`).join("");
function helloHTML(){
  return `<div class="hello"><div class="hello-av">${av(S.avatar)}</div><p class="hello-hi">Merhaba ${esc(S.name)}!</p>
    <p class="hello-sub">${ST.length} damga seni bekliyor</p><div class="flow">${FLOW}</div></div>`;
}

// ---------- Ana ekran: macera yolu ----------
// Çocuğun ilk gördüğü yer oyunun kendisi: Başla'dan Hazine'ye zikzak bir yol, üstünde 9 durak.
// Kaşif dostu aranan durağın üstünde durur; ipucu alttaki konuşma balonunda.
const ROAD = [[18,79],[50,79],[82,79],[82,51],[50,51],[18,51],[18,23],[50,23],[82,23]];   // % konumlar, 3 sıra zikzak
let target = S && S.target || null;   // aranan görev; boş bir durağa dokununca değişir
function renderHome(){
  $("#me-av").innerHTML = av(S.avatar); $("#me-name").textContent = S.name;
  const n = count(), t = ST.length;
  $("#me-count").textContent = `⭐ ${n}/${t}`;
  const rank = FX.unvan && rankOf(n);
  $("#me-rank").classList.toggle("hidden", !rank);
  if (rank) $("#me-rank").textContent = rank[1] + " " + rank[2];
  $("#done-banner").classList.toggle("hidden", n !== t);
  if (!target || S.badges[target]) target = (ST.find(s => !S.badges[s.id]) || {}).id || null;
  renderTarget(); renderRoad();
  if (chestSeq) runChestSequence();
  $("#btn-scan").classList.toggle("pulse", n === 0);
  S.last = null;
  renderInstall();
}
// Konum simgeleri: metne eşlik eder, tek başlarına anlam taşımak zorunda değildir.
function locationCue(st){
  const paths = st.id === "fosil" ? '<path d="M12 21V4M5 11l7-7 7 7"/>' : st.id === "orfoz" ? '<path d="M3 19l4-10 7-5 6 7 1 8Z M7 9l6 5 7-3 M13 14l-2 5"/>' : st.id === "vatoz" ? '<path d="M3 21V11a9 9 0 0 1 18 0v10M7 21V11a5 5 0 0 1 10 0v10 M3 21h18"/>' : st.id === "kabuk" ? '<path d="M12 21L3 9Q2 2 8 4Q12 0 16 4Q22 2 21 9ZM12 21V5M12 21L7 7M12 21l5-14"/>' : '<path d="M2 12Q12 0 22 12Q12 24 2 12Z"/><circle cx="12" cy="12" r="3"/>';
  return `<span class="cue-icon" aria-hidden="true"><svg viewBox="0 0 24 24">${paths}</svg></span><span>${esc(st.where || REG[st.region].label)}</span>`;
}
function renderTarget(){
  const st = ST.find(s => s.id === target), box = $("#target");
  box.classList.toggle("hidden", !st); if (!st) return;
  box.innerHTML = `<div class="target-heading"><span class="target-art" aria-hidden="true">${artSVG(st.art)}<span class="target-step">${ST.indexOf(st)+1}</span></span><div class="tg-txt"><p class="target-kicker">SIRADAKİ KEŞFİN</p><h2 class="tg-k">${esc(st.name)}</h2></div></div><p class="tg-where location-cue">${locationCue(st)}</p><button class="btn btn-gold" id="target-learn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5Q7 2 2 4v15q5-2 10 1q5-3 10-1V4q-5-2-10 1Z M12 5v15"/></svg>${S.flow && S.flow.id === st.id ? "Kaldığın yerden devam et →" : "Tanış ve bul →"}</button>`;
  $("#target-learn").onclick = () => {
    if (S.flow && S.flow.id === st.id) resumeTask(); else openLesson(st, false);
  };
}
function renderRoad(){
  const done = count() === ST.length;
  $("#road-nodes").innerHTML = ST.map((st, i) => {
    const [x, y] = ROAD[i] || [50, 50], has = !!S.badges[st.id], on = st.id === target;
    return `<button type="button" class="stop ${has ? "got" : "locked"}${on ? " on" : ""}" data-id="${st.id}" style="left:${x}%;top:${y}%;--rot:${ROT[i % ROT.length]}deg" aria-label="${esc((i+1)+". durak: "+st.name+(has?", tamamlandı":on?", buradasın":""))}" aria-current="${on ? "step" : "false"}">
      ${has ? stampSVG(st, { date: S.badges[st.id], shine: FX.parlak }) : `<span class="sil">${artSVG(st.art)}</span>`}<span class="num">${i + 1}</span>
      ${has ? `<span class="stop-done" aria-hidden="true">✓</span>` : ""}${on ? `<span class="here-pin">Buradasın<span aria-hidden="true">▼</span></span>` : ""}</button>`;
  }).join("");
  const end = $("#road-end");
  end.classList.toggle("done", done);
  if (FX.sandik) {
    if (!end.querySelector(".chest-svg")) end.querySelector(".chest").innerHTML = '<span class="chest-rays" aria-hidden="true"></span>' + chestSVG() + '<span class="chest-seal">' + finalSealSVG() + '</span>';
    end.classList.toggle("open", done && !chestSeq);
  } else end.querySelector(".chest").innerHTML = done ? finalSealSVG() : "🎁";
  updateRoadFx();
}

// ---------- v41 macera yolu: altın iz ve yürüyen kaşif dostu ----------
// Yol noktaları road-svg ile aynı yüzde koordinatlarında: Başla → 9 durak → Hazine.
const ROUTE = [[18,97], ...ROAD, [82,4], [65,7]];   // son nokta: hazinenin yanı (yalnızca kaşif dostu için)
let walkerAt = null, trailAt = null, chestSeq = false, chestTimer = 0, stopWalk = null, stopTrail = null;
function routePoint(p){
  const i = Math.max(0, Math.min(ROUTE.length - 2, Math.floor(p))), f = Math.max(0, Math.min(1, p - i));
  const a = ROUTE[i], b = ROUTE[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}
function roadFxVisible(){
  const road = $("#road"), svg = road && road.querySelector(".road-svg");
  return FX.yol && current === "v-home" && !!road.offsetWidth && !!svg && getComputedStyle(svg).display !== "none";
}
// Kaşif dostu aranan durağın üstünde durur; hepsi bitince hazinenin önünde.
function walkerGoal(){ const i = ST.findIndex(s => s.id === target); return i < 0 ? (count() === ST.length ? ROUTE.length - 1 : 1) : i + 1; }
function trailGoal(){ const n = count(); return n === ST.length ? ROUTE.length - 2 : n; }
function drawTrail(q){
  const pts = [];
  if (q > 0) { for (let i = 0; i <= Math.floor(q) && i < ROUTE.length; i++) pts.push(ROUTE[i]); if (q % 1) pts.push(routePoint(q)); }
  const str = pts.map(p => p[0].toFixed(2) + "," + p[1].toFixed(2)).join(" ");
  $("#road-gold").setAttribute("points", str); $("#road-gold-glow").setAttribute("points", str);
}
function placeWalker(p, hop = 0){
  const w = $("#walker"); if (!w) return;
  const [x, y] = routePoint(p), stop = $("#road-nodes .stop");
  const lift = p > 9.5 ? 2 : (stop ? stop.offsetHeight / 2 : 36) + 2;
  w.style.left = x + "%"; w.style.top = y + "%";
  w.style.transform = "translate(-50%, calc(-100% - " + (lift + hop).toFixed(1) + "px))";
}
function animate(from, to, ms, step, done){
  const t0 = performance.now(), ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  let id = 0, stopped = false;
  const tick = now => {
    if (stopped) return;
    const t = Math.min(1, (now - t0) / ms); step(from + (to - from) * ease(t), t);
    if (t < 1) id = requestAnimationFrame(tick); else if (done) done();
  };
  id = requestAnimationFrame(tick);
  return () => { stopped = true; cancelAnimationFrame(id); };
}
function updateRoadFx(){
  if (!FX.yol) return;
  const road = $("#road");
  let w = $("#walker");
  if (!w) { w = document.createElement("div"); w.id = "walker"; w.className = "walker"; w.setAttribute("aria-hidden", "true"); road.appendChild(w); }
  if (w.dataset.avatar !== S.avatar) { w.dataset.avatar = S.avatar; w.innerHTML = '<span class="walker-av">' + av(S.avatar) + '</span><i>▼</i>'; }
  const visible = roadFxVisible();
  road.classList.toggle("has-walker", visible);
  const wGoal = walkerGoal(), tGoal = trailGoal();
  if (!visible || reducedMotion() || walkerAt === null) {
    if (stopWalk) stopWalk(); if (stopTrail) stopTrail();
    walkerAt = wGoal; trailAt = tGoal; drawTrail(tGoal); w.classList.remove("walking");
    requestAnimationFrame(() => placeWalker(wGoal));
    return;
  }
  // Altın iz yeni damgaya kadar uzar
  if (Math.abs(tGoal - trailAt) > .01) {
    if (stopTrail) stopTrail();
    const from = trailAt; trailAt = tGoal;
    const t = setTimeout(() => { stopTrail = animate(from, tGoal, Math.min(1600, 450 + Math.abs(tGoal - from) * 420), drawTrail); }, 250);
    stopTrail = () => clearTimeout(t);
  } else drawTrail(tGoal);
  // Kaşif dostu durak durak zıplayarak yeni hedefe gider
  if (Math.abs(wGoal - walkerAt) > .01) {
    if (stopWalk) stopWalk();
    const from = walkerAt, hops = Math.max(1, Math.round(Math.abs(wGoal - from)));
    walkerAt = wGoal; w.classList.add("walking");
    const t = setTimeout(() => {
      stopWalk = animate(from, wGoal, Math.min(1900, 380 * hops + 220), p => {
        const k = Math.abs(p - from) / (Math.abs(wGoal - from) || 1);
        placeWalker(p, Math.abs(Math.sin(Math.PI * hops * k)) * 16);
      }, () => { w.classList.remove("walking"); placeWalker(wGoal); });
    }, 250);
    stopWalk = () => clearTimeout(t);
  } else requestAnimationFrame(() => placeWalker(wGoal));
}
window.addEventListener("resize", () => { if (FX.yol && current === "v-home" && walkerAt !== null && S) updateRoadFx(); });

// 9/9: kaşif dostu hazineye gider, sandık sallanır ve açılır, ardından final ekranı. Dokunmak atlatır.
function runChestSequence(){
  const end = $("#road-end");
  const finish = () => {
    clearTimeout(chestTimer); document.removeEventListener("pointerdown", skip, true);
    if (!chestSeq) return; chestSeq = false; end.classList.remove("shaking"); end.classList.add("open");
    if (current === "v-home") openCert();
  };
  const skip = e => { e.preventDefault(); e.stopPropagation(); finish(); };
  document.addEventListener("pointerdown", skip, true);
  end.classList.remove("open", "shaking");
  chestTimer = setTimeout(() => {
    end.classList.add("shaking");
    chestTimer = setTimeout(() => {
      end.classList.remove("shaking"); end.classList.add("open");
      if (navigator.vibrate) navigator.vibrate([30, 40, 60]);
      playStampSound();
      chestTimer = setTimeout(finish, 1800);
    }, 800);
  }, 1500);
}
$("#road-nodes").addEventListener("click", e => {
  const b = e.target.closest(".stop"); if (!b) return;
  const st = ST.find(s => s.id === b.dataset.id);
  if (S.badges[st.id]) return openDrawer(st, true);
  target = st.id; S.target = target; save(); renderTarget(); renderRoad();
});
$("#road-end").onclick = () => count() === ST.length ? openCert()
  : modal("🎁", "Hazine burada!", `${ST.length} damgayı topla, tamamlanmış pasaportunu aç!`, [{ label: "Tamam" }]);
function openDrawer(st, got){
  const art = $("#dr-art"); art.innerHTML = got ? stampSVG(st, { date: S.badges[st.id], shine: FX.parlak }) : artSVG(st.art);
  art.style.transform = ""; art.classList.remove("tilting");
  art.classList.toggle("sil", !got);
  $("#dr-name").textContent = REG[st.region].label + " · " + (got ? st.name : "Gizemli görev");
  $("#dr-title").textContent = st.title;
  $("#dr-text").textContent = got ? st.fact : "İpucu: " + st.hint;
  $("#dr-where").textContent = got || !st.where ? "" : st.where;
  $("#drawer").classList.remove("hidden");
}
$("#dr-close").onclick = () => $("#drawer").classList.add("hidden");
// Parlak damga: parmakla kaydırınca damga hafifçe eğilir, ışık parmağı izler.
if (FX.parlak) {
  const art = $("#dr-art");
  const tilt = e => {
    if (art.classList.contains("sil") || reducedMotion()) return;
    const r = art.getBoundingClientRect(), px = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), py = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
    art.classList.add("tilting");
    art.style.transform = "perspective(500px) rotateY(" + ((px - .5) * 24).toFixed(1) + "deg) rotateX(" + ((.5 - py) * 24).toFixed(1) + "deg)";
    art.style.setProperty("--sx", (px * 150 - 20).toFixed(1) + "px");
  };
  const reset = () => { art.classList.remove("tilting"); art.style.transform = ""; };
  art.addEventListener("pointermove", tilt); art.addEventListener("pointerdown", tilt);
  art.addEventListener("pointerleave", reset); art.addEventListener("pointerup", reset); art.addEventListener("pointercancel", reset);
}
$("#drawer").onclick = e => { if (e.target.id === "drawer") $("#drawer").classList.add("hidden"); };
$("#btn-scan").onclick = () => show("v-scan");
$("#btn-menu").onclick = () => show("v-menu");
$("#btn-help").onclick = () => { $("#howto").innerHTML = howtoHTML(); $("#help").classList.remove("hidden"); };
$("#help-close").onclick = () => $("#help").classList.add("hidden");
$("#help").onclick = e => { if (e.target.id === "help") $("#help").classList.add("hidden"); };
$("#btn-cert").onclick = () => openCert();

// Ana ekrana ekleme ipucu (iPhone'da verinin silinmemesi için önemli)
let deferredInstall = null;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredInstall = e; if (current === "v-home") renderInstall(); });
function isStandalone(){ return matchMedia("(display-mode: standalone)").matches || navigator.standalone === true; }
function renderInstall(){
  const box = $("#install-menu");
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

// Tek ipucunun içindeki bilgiyi ve bakılacak ayrıntıyı görsel olarak ayır.
function copyIcon(kind){
 const paths=kind==='up'?'<path d="M12 21V4M5 11l7-7 7 7"/>':kind==='bulb'?'<path d="M9 18h6M10 21h4M8 14a7 7 0 1 1 8 0q-1 1-1 3H9q0-2-1-3Z"/>':'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>';
 return '<svg class="copy-icon" viewBox="0 0 24 24" aria-hidden="true">'+paths+'</svg>';
}
function tipMarkup(st){
  const split=st.tip.indexOf(". ");
  if(split<0)return `<span class="tip-instruction">${esc(st.tip)}</span>`;
  return `<span class="tip-fact">${copyIcon('bulb')}${esc(st.tip.slice(0,split+1))}</span><span class="tip-instruction">${copyIcon(['fosil','vatoz'].includes(st.id)?'up':'search')}${esc(st.tip.slice(split+2))}</span>`;
}
const bulbIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 21h4M8 14a7 7 0 1 1 8 0q-1 1-1 3H9q0-2-1-3Z"/></svg>';
const globeIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 7h14M5 17h14"/></svg>';

// ---------- Bölüm ve kıta ipuçları ----------
let hintIndex = 0;
function hintStation(){return ST[hintIndex];}
function openHints(){
  hintIndex = Math.max(0, ST.findIndex(s => s.id === target)); 
  stack=["v-home"];show("v-hints",false);
}
function renderHints(){
  $(".hint-card").scrollTop=0;
  const st=hintStation(), reg=REG[st.region], group=D.groups.find(g=>g.kind===reg.kind);
  $("#hint-group").textContent=group ? group.label : "Keşif bölümü";
  $("#hint-region").textContent=reg.label;
  $("#hint-page").textContent=`Bölüm ${hintIndex+1} / ${ST.length}`;
  $("#hint-art").innerHTML=artSVG(st.art);$("#hint-name").textContent=st.name;
  $("#hint-title").textContent=st.title;
  $("#hint-earned").textContent=S.badges[st.id] ? "✓ Bu damga sende!" : "Bu bölümdeki keşfin";
  $("#hint-guide").innerHTML=av(S.avatar);
  $("#hint-greeting").textContent=`${S.name}, keşfe hazır mısın?`;
  $("#hint-copy").innerHTML=tipMarkup(st);
  $("#hint-prev").disabled=hintIndex===0;$("#hint-next").disabled=hintIndex===ST.length-1;
  $("#hint-go").textContent=S.badges[st.id] ? "Öğrendiklerime bak →" : "Buldum! QR kodunu tara →";
}
$("#btn-hints").onclick=openHints;
$("#hint-home").onclick=()=>{stack=[];show("v-home",false);};
$("#hint-prev").onclick=()=>{if(hintIndex>0){hintIndex--;stopSpeech();renderHints();}};
$("#hint-next").onclick=()=>{if(hintIndex<ST.length-1){hintIndex++;stopSpeech();renderHints();}};
$("#hint-go").onclick=()=>{
  const st=hintStation();target=st.id;S.target=target;save();
  if(S.badges[st.id]){show("v-home",false);openDrawer(st,true);}
  else{lesson=st;S.flow={id:st.id,step:"find",verified:false};save();stack=["v-home","v-hints"];show("v-scan",false);}
};

// ---------- Kamera / QR okuma ----------
let stream = null, raf = 0, detector = null, busy = false;
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
async function startCam(){
  const msg = $("#cam-msg"); msg.classList.add("hidden"); busy = false;
  $(".cam").classList.remove("found");
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
  if (navigator.vibrate) navigator.vibrate(60);
  if (FX.qrEfekt && !reducedMotion()) {
    // Görüntü donar, çerçeve altın yanar, kabarcıklar patlar; sonra görev açılır.
    cancelAnimationFrame(raf); raf = 0; $("#video").pause();
    const cam = $(".cam"); cam.classList.remove("found"); void cam.offsetWidth; cam.classList.add("found");
    setTimeout(() => { if (current !== "v-scan") return; stopCam(); scanSource = "qr"; handleText(text); }, 700);
    return;
  }
  stopCam(); scanSource = "qr"; handleText(text);
}
$("#manual-form").onsubmit = e => {
  e.preventDefault();
  const v = $("#in-code").value.trim(); if (!v) return;
  $("#in-code").value = ""; $("#in-code").blur(); stopCam(); scanSource = "kod"; handleText(v);
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
  if (p.type === "entry") return modal("🚪","Bu, giriş QR kodu","Pasaportun zaten açık! Şimdi akvaryumdaki görev QR kodlarını bul.",[{label:"Tamam",onClick:goHome}]);
  modal("🤔","Bu QR bizim değil","Bu kod Okyanus Kaşifi görevlerinden biri değil. Görev tabelalarındaki QR'ları ara!",[{label:"Tekrar dene",onClick:retry},{label:"Pasaportuma dön",cls:"btn-ghost",onClick:goHome}]);
}
function handleCode(code){
  const st = ST.find(s => s.code === code), src = scanSource; scanSource = "link";
  if (!st) return modal("🤔","Kod bulunamadı","Bu kodu tanıyamadık. Harfleri kontrol edip tekrar dene.",[{label:"Tekrar dene",onClick:retry},{label:"Pasaportuma dön",cls:"btn-ghost",onClick:goHome}]);
  if (S.badges[st.id]) return modal(st.art,"Bu damga zaten sende!",`“${st.title}” görevini daha önce tamamladın. Diğer görevleri keşfet!`,[{label:"Pasaportuma dön",onClick:goHome}]);
  olay("scan", st.id, src);
  if (st.quiz) {
    if (S.flow && S.flow.id === st.id && S.flow.step === "find") { S.flow.verified = true; save(); openQuiz(st); }
    else openLesson(st, true);
  } else award(st);
}

// ---------- Tanış → Gözlemle → Cevapla ----------
let lesson = null;
function openLesson(st, verified){
  lesson = st; target = st.id; S.target = target;
  S.flow = {id:st.id, step:"find", verified:!!verified}; save(); olay("learn", st.id);
  stack = ["v-home"]; show("v-learn", false); renderLesson();
}
function resumeTask(){
  const f = S && S.flow, st = f && ST.find(s => s.id === f.id);
  if (!st || S.badges[st.id]) { if(S){S.flow=null;save();} return goHome(); }
  if (f.step === "quiz" && f.verified) return openQuiz(st);
  lesson = st; stack = ["v-home"]; show("v-learn", false); renderLesson();
}
function setBolge(st){ if (FX.bolgeRenk) { if (st) document.documentElement.dataset.bolge = st.region; else delete document.documentElement.dataset.bolge; } }
function renderLesson(){
  $(".learn-card").scrollTop=0;
  stopSpeech();const st=lesson; setBolge(st);
  // Eski iki aşamalı kayıtları tek hazırlık ekranına taşı.
  S.flow.step="find";save();
  $("#learn-heading").textContent="Tanış ve bul";
  $("#learn-region").innerHTML=`<span class="region-symbol">${globeIcon}</span><span class="region-name">${esc(REG[st.region].label.toLocaleUpperCase("tr-TR"))}</span><span class="region-counter" aria-label="${ST.indexOf(st)+1}. görev, toplam ${ST.length} görev">${ST.indexOf(st)+1} / ${ST.length}</span>`;
  $("#learn-name").textContent=st.name;
  $("#learn-art").dataset.creature=st.id;$("#learn-art").innerHTML=artSVG(st.art);
  $("#learn-copy").innerHTML=`<div class="quick-tip"><div class="tip-heading"><span>${bulbIcon}</span>Keşif ipucun</div><p>${tipMarkup(st)}</p></div>`;
  $("#learn-next").textContent=S.flow.verified ? "Haydi soruyu cevapla →" : "Buldum! QR kodunu tara →";
}
$("#learn-next").onclick=()=>{
  if(S.flow.verified)openQuiz(lesson);
  else{stack=["v-home","v-learn"];show("v-scan",false);}
};
$("#learn-back").onclick=()=>show("v-home",false);
// Ses kullanıcı istediğinde başlar; ekran değişince durur.
let speaking = false, speechGeneration = 0;
function stopSpeech(){
  speechGeneration++;
  if ("speechSynthesis" in window) speechSynthesis.cancel(); speaking=false;
  document.querySelectorAll("[data-listen]").forEach(b => {b.textContent="♪ Dinle";b.setAttribute("aria-pressed","false");});
}
function spokenText(){
  if(current === "v-hints") return REG[hintStation().region].label+". "+hintStation().title+". "+$("#hint-greeting").textContent+" "+$("#hint-copy").textContent;
  if(current === "v-learn") return lesson.name + ". " + lesson.tip;
  if(current === "v-quiz") return $("#quiz-q").textContent + ". " + [...$("#quiz-opts").children].map((b,i)=>(i+1)+". "+b.lastChild.textContent).join(". ") + ". " + $("#quiz-msg").textContent;
  return $("#rw-title").textContent + ". " + $("#rw-fact").textContent;
}
document.querySelectorAll("[data-listen]").forEach(b => b.onclick = () => {
  if(speaking) return stopSpeech();
  if (!("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(spokenText()); u.lang="tr-TR";u.rate=.9;
  const voice=speechSynthesis.getVoices().find(v=>v.lang.startsWith("tr"));if(voice)u.voice=voice;
  const ticket=++speechGeneration;
  u.onend=()=>{if(ticket===speechGeneration)stopSpeech();};
  u.onerror=e=>{if(ticket!==speechGeneration || e.error==="canceled" || e.error==="interrupted")return;stopSpeech();modal("♪","Ses açılamadı","Bu cihazda Türkçe ses kullanılamıyor. Bilgileri ekrandan okuyabilirsin.");};
  speaking=true;b.textContent="■ Durdur";b.setAttribute("aria-pressed","true");speechSynthesis.speak(u);
});
// Klavye ve tarayıcı çubukları dahil görünür yüksekliği kullan.
function fitContent(){
  const v=document.querySelector('.view.active');if(!v)return;
  v.removeAttribute('data-density');
  v.classList.remove('text-overflow');
  const card=v.querySelector('.learn-card,.hint-card');
  if(card){
    const crowded=()=>{
      const copy=card.querySelector('#learn-copy,#hint-copy'),r=card.getBoundingClientRect(),c=copy?.getBoundingClientRect();
      return card.scrollHeight>card.clientHeight+2 || (c && (c.bottom>r.bottom-8 || c.top<r.top+8));
    };
    if(crowded())v.dataset.density='compact';
    if(crowded())v.dataset.density='minimal';
    v.classList.toggle('text-overflow',crowded());
  }
}
let fitFrame=0;
function scheduleFit(){
  if(fitFrame)return;
  fitFrame=requestAnimationFrame(()=>{fitFrame=0;fitContent();});
}
let viewportState="";
function fitViewport(){
  const vp=window.visualViewport,h=vp?vp.height:innerHeight,w=vp?vp.width:innerWidth;
  const input=document.activeElement.matches('input'),keyboard=h<400&&input;
  // Sayfa sabittir; klavye açılırken WebKit önceki odak kaydırmasını tutmamalı.
  if(window.scrollY)window.scrollTo(0,0);
  const state=[w,h,keyboard].join(":");
  if(state===viewportState)return;
  viewportState=state;
  const root=document.documentElement;
  root.style.setProperty('--app-height',h+'px');
  root.dataset.layout=h<530?'tiny':h<690?'short':'roomy';
  root.dataset.narrow=w<360?'true':'false';
  root.dataset.tablet=w>=600&&h>=600?'true':'false';
  root.classList.toggle('keyboard-open',keyboard);
  scheduleFit();
}
let viewportTimer=0,viewportFrame=0;
function refreshViewport(){
  if(!viewportFrame)viewportFrame=requestAnimationFrame(()=>{viewportFrame=0;fitViewport();});
  clearTimeout(viewportTimer);viewportTimer=setTimeout(fitViewport,120);
}
window.addEventListener('resize',refreshViewport);
if(window.visualViewport){visualViewport.addEventListener('resize',refreshViewport);visualViewport.addEventListener('scroll',refreshViewport);}
document.addEventListener('focusin',refreshViewport);document.addEventListener('focusout',refreshViewport);
new MutationObserver(scheduleFit).observe(document.body,{childList:true,subtree:true,characterData:true});
document.fonts.ready.then(scheduleFit);fitViewport();


// ---------- Soru ----------
function openQuiz(st){
  S.flow={id:st.id,step:"quiz",verified:true};save(); setBolge(st);
  $("#quiz-art").innerHTML = artSVG(st.art);
  let buddy = $("#quiz-buddy");
  if (FX.tepki) {
    if (!buddy) { buddy = document.createElement("span"); buddy.id = "quiz-buddy"; buddy.setAttribute("aria-hidden", "true"); $("#v-quiz .quiz .paper").appendChild(buddy); }
    buddy.className = "quiz-buddy"; buddy.innerHTML = '<span class="buddy-av">' + av(S.avatar) + '</span><i class="buddy-say"></i>';
  }
  const react = (cls, say) => { if (!buddy) return; buddy.className = "quiz-buddy"; void buddy.offsetWidth; buddy.className = "quiz-buddy " + cls; buddy.querySelector(".buddy-say").textContent = say; };
  $("#quiz-title").textContent = `${st.name} · ${st.title}`;
  $("#quiz-q").textContent = st.quiz.q;
  const msg = $("#quiz-msg"); msg.textContent = ""; msg.style.color = "";
  const box = $("#quiz-opts"); box.innerHTML = "";
  st.quiz.options.forEach((o, i) => {
    const el = document.createElement("button"); el.className = "opt";
    el.innerHTML = `<span class="l">${st.icons ? st.icons[i] : "ABCD"[i]}</span><span></span>`; el.lastChild.textContent = o;
    el.onclick = () => {
      if (i === st.quiz.answer) {
        el.classList.add("right");el.querySelector('.l').textContent='✓';el.setAttribute('aria-label',o+' — Doğru cevap'); box.querySelectorAll(".opt").forEach(x => x.disabled = true);
        msg.textContent = "Doğru! Damgan geliyor…"; msg.style.color = "var(--ok)"; react("happy", "✨");
        setTimeout(() => award(st), 800);
      } else {
        el.classList.add("wrong"); olay("wrong", st.id, i);
        // Kaybetmek yok: yanlış cevapta yön gösteren ipucu, istediği kadar deneyebilir
        msg.textContent = "Bir daha düşün! 💡 İpucu: " + (st.quiz.clue || "Tabelaya bir daha bak."); msg.style.color = "var(--sea2)";
        if (navigator.vibrate) navigator.vibrate([40,40,40]);
        react("think", "?");
      }
    };
    box.appendChild(el);
  });
  stack = ["v-home"]; show("v-quiz", false);
}

// ---------- Damga ----------
function award(st){
  S.badges[st.id] = Date.now(); S.flow=null; save();
  olay("stamp", st.id); if (count() === ST.length) olay("complete");
  S.last = st.id;   // haritada yeni yanan bölge parlasın
  // Damga aleti pasaport sayfasına iner, damga basılır
  const stage = $("#rw-stamp"), ring = $("#ink-ring"), tool = $("#rw-tool");
  stage.innerHTML = stampSVG(st, { date: S.badges[st.id], shine: FX.parlak }); setBolge(st);
  const g = D.groups.find(x => x.kind === REG[st.region].kind);
  $("#rw-page-hd").textContent = g ? `${g.icon || ""} ${g.label}` : "";
  [stage, ring, tool].forEach(el => { el.style.animation = "none"; void el.offsetWidth; el.style.animation = ""; });
  $("#rw-name").textContent = REG[st.region].label;
  $("#rw-title").textContent = st.name + " keşfedildi!";
  $("#rw-fact-title").textContent = st.factTitle || "Biliyor muydun?";
  $(".fact-card").classList.toggle("eco", !!st.factTitle);
  $("#rw-fact").textContent = st.reward || st.fact;
  const n = count(), t = ST.length;
  $("#rw-count").textContent = `⭐ ${n} / ${t} damga`;
  const newRank = FX.unvan && rankOf(n), oldRank = rankOf(n - 1), rankUp = !!newRank && newRank !== oldRank;
  $("#rw-count").classList.toggle("rank-up", rankUp);
  if (rankUp) $("#rw-count").innerHTML = '<span>⭐ ' + n + ' / ' + t + '</span><span class="rank-new">' + newRank[1] + ' ' + esc(newRank[2]) + ' oldun!</span>';
  const chestNext = FX.sandik && n === t && !reducedMotion();
  $("#rw-next").textContent = n === t ? (chestNext ? "Hazineyi aç 🎁" : "Final damgamı bas ⭐") : "Pasaportuma dön";
  $("#rw-next").onclick = () => { if (n !== t) return show("v-home", false); if (chestNext) { chestSeq = true; show("v-home", false); } else openCert(); };
  stack = []; show("v-reward", false);
  $("#v-reward").classList.remove("shake");
  setTimeout(() => { if(current!=="v-reward"||S.last!==st.id)return; if(navigator.vibrate&&!matchMedia('(prefers-reduced-motion: reduce)').matches)navigator.vibrate(60);playStampSound();confetti(22); },560);
}
function confetti(N, sel = "#confetti", view = "v-reward"){
  if(matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const c = $(sel), x = c.getContext("2d"), dpr = Math.min(devicePixelRatio || 1,2,Math.sqrt(3000000/(innerWidth*innerHeight)));
  const token=Symbol("confetti");c.confettiToken=token;
  c.width = innerWidth * dpr; c.height = innerHeight * dpr; x.setTransform(dpr,0,0,dpr,0,0);
  const cols = ["#f5bd3a","#7fe3ff","#ff7b54","#7be08f","#ffffff","#c08cff"];
  const P = Array.from({length:N}, () => ({ x:innerWidth/2, y:innerHeight*0.3, vx:(Math.random()-.5)*13, vy:-Math.random()*13-3,
    s:Math.random()*7+4, r:Math.random()*6, vr:(Math.random()-.5)*.3, c:cols[Math.random()*cols.length|0], o:Math.random() < .3 }));
  let f = 0;
  (function tick(){
    if(c.confettiToken!==token)return;
    x.clearRect(0,0,innerWidth,innerHeight);
    P.forEach(p => { p.vy += .32; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      x.save(); x.translate(p.x,p.y); x.rotate(p.r); x.fillStyle = p.c;
      if (p.o) { x.beginPath(); x.arc(0,0,p.s/2.4,0,7); x.fill(); } else x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);
      x.restore(); });
    if (++f < (view === "v-cert" ? 170 : 80) && current === view && !document.hidden) requestAnimationFrame(tick); else {x.clearRect(0,0,innerWidth,innerHeight);c.width=c.height=1;}
  })();
}

// ---------- Final: pasaport tamamlandı ----------
// Damga aleti büyük altın "Okyanus Kaşifi" damgasını kapağa basar, kapak altına döner.
// Paylaşılan resim sertifika değil, çocuğun dolu pasaportu.
let certBlob = null, certAnimationRun = 0;
function openCert(){
  if (count() < ST.length) return show("v-home", false);
  stack = ["v-home"]; show("v-cert", false);
  $("#v-cert").classList.remove("preview-passport");
  certBlob=null; $("#btn-save").disabled=true; $("#btn-share").disabled=true; $("#btn-story").disabled=true;
  $("#btn-story").classList.toggle("hidden", !FX.hikaye);
  document.querySelectorAll("#v-cert [data-aq]").forEach(el => el.textContent = D.aquarium);
  $("#final-name").textContent = S.name;
  $("#final-p").textContent = `${S.name}, ${D.aquarium} içindeki ${ST.length} görevi tamamladın. Pasaportun tamamlandı!`;
  const stage = $("#v-cert .final-stage"), run = ++certAnimationRun;
  $("#final-seal").innerHTML = finalSealSVG();
  $("#final-friend").innerHTML = artSVG(S.avatar);
  $("#final-page-count").textContent = count() + " / " + ST.length + " keşif";
  stage.classList.remove("final-opening", "final-opened", "final-stamped");
  void stage.offsetWidth;
  stage.classList.add("final-opening");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stillHere = () => run === certAnimationRun && current === "v-cert" && !$("#v-cert").classList.contains("preview-passport");
  if (reduced) stage.classList.add("final-opened", "final-stamped");
  else {
    setTimeout(() => { if(stillHere()) stage.classList.add("final-opened"); }, 900);
    setTimeout(() => { if(stillHere()) stage.classList.add("final-stamped"); }, 2000);
  }
  setTimeout(() => {
    if (run !== certAnimationRun || current !== "v-cert" || $("#v-cert").classList.contains("preview-passport")) return;
    if (!reduced && navigator.vibrate) navigator.vibrate([50,35,80]);
    playStampSound();
    confetti(70, "#confetti2", "v-cert");
  }, reduced ? 0 : 1400);
  $("#cert-img").removeAttribute("src");
  setupSave();
  drawCert().then(blob => {
    certBlob = blob;
    $("#btn-save").disabled=false; $("#btn-share").disabled=false; $("#btn-story").disabled=false;
    // data: adresi, resme basılı tutunca iPhone'da "Fotoğraflara Ekle", Android'de "Resmi indir" çıkmasını garantiler
    const fr = new FileReader(); fr.onload = () => { $("#cert-img").src = fr.result; }; fr.readAsDataURL(blob);
  }).catch(()=>modal("🤔","Resim hazırlanamadı","Pasaportunu yeniden açıp tekrar dene."));
}
$("#btn-preview").onclick=()=>$("#v-cert").classList.add("preview-passport");

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
    : ANDROID ? "Resim İndirilenler’e kaydedilir. Galeri’de de görünebilir. Ya da resme basılı tut → <b>“Resmi indir”</b>."
    : "Resim bilgisayarına indirilir.";
}
function download(){
  const a = document.createElement("a"); a.href = URL.createObjectURL(certBlob); a.download = `okyanus-kasifi-${S.id}.png`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => { URL.revokeObjectURL(a.href); modal("📥", "İndirme başlatıldı", "Pasaportunu İndirilenler klasöründe bulabilirsin. Telefona göre Galeri’de de görünebilir.", [{label:"Tamam"}]); }, 600);
}
async function shareFile(){
  try { await navigator.share({ files:[certFile()], title:"Okyanus Kaşifi Pasaportum", text:`${D.aquarium}'da Okyanus Kaşifi oldum!` }); return true; }
  catch(e){ return e && e.name === "AbortError"; }
}
$("#btn-save").onclick = async () => {
  if (!certBlob) return;
  olay("save");
  if (IOS && canShareFile() && await shareFile()) return;
  download();
};
$("#btn-share").onclick = async () => {
  if (!certBlob) return;
  olay("share");
  if (canShareFile() && await shareFile()) return;
  if (navigator.share) { try { await navigator.share({ title:"Okyanus Kaşifi", text:`${D.aquarium}'da Okyanus Kaşifi oldum!`, url: location.origin + location.pathname }); return; } catch(e){ if (e && e.name === "AbortError") return; } }
  download();
};
// v41 hikâye resmi (1080×1920): WhatsApp durumu / Instagram hikâyesi için dik pasaport.
async function storyBlob(){
  const url = URL.createObjectURL(certBlob);
  const cert = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
  URL.revokeObjectURL(url);
  const W = 1080, H = 1920, c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d"), F = '"DynaPuff",ui-rounded,system-ui,sans-serif';
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#1a86c7"); g.addColorStop(.55, "#0b3c6e"); g.addColorStop(1, "#04182f");
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  // Işık hüzmeleri ve kenar kabarcıkları
  x.fillStyle = "#ffffff";
  [[.08, .16, .07], [.36, .1, .05], [.64, .14, .06]].forEach(([l, w, o]) => { x.save(); x.globalAlpha = o; x.beginPath(); x.moveTo(W * l, 0); x.lineTo(W * (l + w), 0); x.lineTo(W * (l + w + .12), H * .62); x.lineTo(W * (l + .08), H * .62); x.closePath(); x.fill(); x.restore(); });
  x.strokeStyle = "rgba(255,255,255,.3)"; x.lineWidth = 3;
  [[90, 1630, 14], [150, 1550, 9], [985, 1590, 16], [935, 1712, 10], [62, 420, 10], [1016, 385, 13], [120, 1815, 8], [1000, 1830, 7]].forEach(([a, b, r]) => { x.beginPath(); x.arc(a, b, r, 0, Math.PI * 2); x.stroke(); });
  const line = (t, y, size, color, weight = 700) => { let fs = size; x.font = weight + " " + fs + "px " + F; while (x.measureText(t).width > 960 && fs > 24) { fs--; x.font = weight + " " + fs + "px " + F; } x.fillStyle = color; x.textAlign = "center"; x.textBaseline = "alphabetic"; x.fillText(t, W / 2, y); };
  line("Okyanus Kaşifi oldum!", 205, 92, "#ffffff");
  line(D.aquarium + "'da " + ST.length + " keşfi tamamladım", 285, 44, "#ffe38a", 600);
  x.save(); x.shadowColor = "rgba(0,0,0,.45)"; x.shadowBlur = 40; x.shadowOffsetY = 18;
  rr(x, 90, 350, 900, 1125, 44); x.fillStyle = "#fff8ec"; x.fill(); x.restore();
  x.save(); rr(x, 90, 350, 900, 1125, 44); x.clip(); x.drawImage(cert, 90, 350, 900, 1125); x.restore();
  line("Sen de keşfe çık!", 1600, 60, "#ffffff");
  try { const brand = await brandImage(); x.drawImage(brand, 637, 332, 646, 399, W / 2 - 130, 1662, 260, 160.6); } catch(e){}
  return new Promise(r => c.toBlob(r, "image/png"));
}
$("#btn-story").onclick = async () => {
  if (!certBlob) return;
  olay("share", null, "hikaye");
  const btn = $("#btn-story"); btn.disabled = true;
  try {
    const blob = await storyBlob(), file = new File([blob], "okyanus-kasifi-hikaye-" + S.id + ".png", { type: "image/png" });
    let ok = false;
    try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: "Okyanus Kaşifi oldum!" }); ok = true; } }
    catch(e){ ok = !!e && e.name === "AbortError"; }
    if (!ok) { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = file.name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }
  } catch(e){ modal("🤔", "Hikâye resmi hazırlanamadı", "Biraz sonra yeniden dene."); }
  btn.disabled = false;
};
let artworkDataPromise=null;
function artworkDataURL(){
 if(!artworkDataPromise)artworkDataPromise=fetch(window.KASIF_ART_PACK.src).then(r=>{
  if(!r.ok)throw new Error('Çizimler yüklenemedi');return r.blob();
 }).then(blob=>new Promise((resolve,reject)=>{
  const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob);
 })).catch(e=>{artworkDataPromise=null;throw e;});
 return artworkDataPromise;
}
async function svgImg(svg){
 const src=window.KASIF_ART_PACK?.src;
 if(src&&svg.includes(src))svg=svg.split(src).join(await artworkDataURL());
  return new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null);
    i.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg); });
}
let logoImagePromise=null;
function brandImage(){
  if(!logoImagePromise)logoImagePromise=new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error("Logo yüklenemedi"));i.src="logo2.png";});
  return logoImagePromise;
}

// Dolu sertifika (1080×1350): örnekteki çerçeve, ortalı kimlik ve dokuz keşif.
async function drawCert(){
  const F = '"DynaPuff",ui-rounded,system-ui,sans-serif';
  await Promise.all([
    document.fonts.load('700 40px "DynaPuff"', "ÇĞİÖŞÜçğıöşü"),
    document.fonts.load('600 40px "DynaPuff"', "ÇĞİÖŞÜçğıöşü"),
    document.fonts.load('800 20px "Baloo 2"', "ÇĞİÖŞÜçğıöşü")
  ]);
  const W=1080,H=1350,c=document.createElement("canvas");c.width=W;c.height=H;
  const x=c.getContext("2d"),navy="#10264d",gold="#f5bd3a",ivory="#fff8ec";
  const gradient=x.createLinearGradient(0,0,0,H);
  gradient.addColorStop(0,"#1677b8");gradient.addColorStop(1,"#061f40");
  x.fillStyle=gradient;x.fillRect(0,0,W,H);
  const star=(cx,cy,r,color)=>{
    x.beginPath();
    for(let i=0;i<10;i++){
      const a=-Math.PI/2+i*Math.PI/5,k=i%2?r*.45:r;
      const px=cx+Math.cos(a)*k,py=cy+Math.sin(a)*k;
      if(i)x.lineTo(px,py);else x.moveTo(px,py);
    }
    x.closePath();x.fillStyle=color;x.fill();
  };
  // Lejand ve isimlerde uzun Türkçe metinleri alanına sığdır.
  const text=(value,cx,cy,size,maxWidth,color=navy,weight=700)=>{
    let fs=size;x.font=weight+" "+fs+"px "+F;
    while(x.measureText(value).width>maxWidth&&fs>18){fs--;x.font=weight+" "+fs+"px "+F;}
    const m=x.measureText(value);
    x.fillStyle=color;x.textAlign="center";x.textBaseline="alphabetic";
    x.fillText(value,cx,cy+(m.actualBoundingBoxAscent-m.actualBoundingBoxDescent)/2);
  };
  const coral=(cx,base,flip,scale,color)=>{
    x.save();x.translate(cx,base);x.scale(flip*scale,scale);
    x.strokeStyle=color;x.lineCap="round";x.lineJoin="round";x.lineWidth=13;
    const strokes=[
      [0,0,9,-30,0,-64,12,-102],
      [3,-24,-18,-40,-22,-55,-20,-70],
      [4,-43,28,-53,32,-75,30,-86],
      [-2,-4,-30,-15,-38,-32,-42,-48],
      [4,-12,30,-21,45,-35,46,-53],
      [-18,-18,-27,-38,-18,-46,-21,-56]
    ];
    strokes.forEach(a=>{x.beginPath();x.moveTo(a[0],a[1]);x.bezierCurveTo(...a.slice(2));x.stroke();});
    x.restore();
  };
  coral(33,1350,1,.8,"#10588a");coral(1047,1350,-1,.8,"#10588a");
  // Krem sayfa ve çift kenar.
  x.save();x.shadowColor="#0004";x.shadowBlur=28;x.shadowOffsetY=12;
  rr(x,50,45,980,1200,58);x.fillStyle=ivory;x.fill();x.restore();
  x.lineWidth=7;x.strokeStyle=gold;rr(x,50,45,980,1200,58);x.stroke();
  x.lineWidth=1.5;x.strokeStyle="#e4c880";rr(x,60,55,960,1180,49);x.stroke();
  x.save();rr(x,64,59,952,1172,46);x.clip();
  coral(106,1240,1,.87,"#0f6698");coral(974,1240,-1,.87,"#0f6698");
  // Baloncuklar yalnızca kenarlarda; yazı alanı temiz kalır.
  x.strokeStyle="#cce5e6";x.lineWidth=3;
  [[94,100,8],[139,92,15],[970,102,11],[985,207,15],[94,246,11],
    [987,342,13],[93,438,9],[981,530,10],[92,685,12],[987,758,10],
    [91,870,9],[986,999,13],[87,1086,9],[990,1118,8]].forEach(([a,b,r])=>{
      x.beginPath();x.arc(a,b,r,0,Math.PI*2);x.stroke();
    });
  x.restore();
  // Örnekteki başlık: ortası yükselen yay, hafif dönen iri harfler.
  const heading="OKYANUS KAŞİFİ",radius=2200;
  let headingSize=96;
  x.font="700 "+headingSize+"px "+F;
  let widths=Array.from(heading,ch=>x.measureText(ch).width);
  while(widths.reduce((a,b)=>a+b,0)>800){headingSize--;x.font="700 "+headingSize+"px "+F;widths=Array.from(heading,ch=>x.measureText(ch).width);}
  let advance=-widths.reduce((a,b)=>a+b,0)/2;
  Array.from(heading).forEach((ch,i)=>{
    const angle=(advance+widths[i]/2)/radius;
    x.save();x.translate(540+Math.sin(angle)*radius,155+(1-Math.cos(angle))*radius);
    x.rotate(angle);x.font="700 "+headingSize+"px "+F;x.textAlign="center";x.textBaseline="alphabetic";x.fillStyle=navy;
    x.fillText(ch,0,0);x.restore();advance+=widths[i];
  });
  // Başlığın iki yanındaki altın vurgular.
  [128,952].forEach((cx,index)=>{
    const flip=index?-1:1;
    [[-9,-18,-.5,15,4.5],[-12,7,.05,14,4.5],[-4,31,.65,12,4.5]].forEach(([dx,dy,angle,rx,ry])=>{
      x.save();x.translate(cx+dx*flip,157+dy);x.rotate(angle*flip);
      x.beginPath();x.ellipse(0,0,rx,ry,0,0,Math.PI*2);x.fillStyle=gold;x.fill();x.restore();
    });
  });
  text("SERTİFİKASI",540,180,44,680);
  x.strokeStyle="#b78624";x.lineWidth=2.5;
  x.beginPath();x.moveTo(356,224);x.lineTo(505,224);x.moveTo(575,224);x.lineTo(724,224);x.stroke();
  star(540,224,18,gold);
  // İsim ve kaşif dostu tek bir grup: görsel mürekkep merkezleri aynı yatay çizgide.
  const name=String(S.name||"Kaşif"),r=80,gap=34,sealGap=32,sealWidth=100,cy=315;
  let fs=104;x.font="700 "+fs+"px "+F;
  while(x.measureText(name).width>500&&fs>24){fs--;x.font="700 "+fs+"px "+F;}
  const metrics=x.measureText(name),groupWidth=r*2+gap+metrics.width+sealGap+sealWidth,left=(W-groupWidth)/2;
  const avatarX=left+r,nameX=left+r*2+gap,sealX=nameX+metrics.width+sealGap+sealWidth/2,sealY=cy;
  x.beginPath();x.arc(avatarX,cy,r,0,Math.PI*2);
  x.fillStyle="#e4f2f8";x.fill();x.lineWidth=8;x.strokeStyle=gold;x.stroke();
  const avatarImage=await svgImg(artSVG(S.avatar));
  if(avatarImage)x.drawImage(avatarImage,avatarX-68,cy-68,136,136);
  x.font="700 "+fs+"px "+F;x.textAlign="left";x.textBaseline="alphabetic";x.fillStyle=navy;
  x.fillText(name,nameX,cy+(metrics.actualBoundingBoxAscent-metrics.actualBoundingBoxDescent)/2);
  // Tarihsiz, düz duran koleksiyon damgaları ve canlı/nesne adları.
  const stamps=await Promise.all(ST.map(st=>svgImg(stampSVG(st,{certificate:true}))));
  const centers=[250,540,830],rows=[510,770,1030],size=212;
  ST.forEach((st,i)=>{
    const cx=centers[i%3],sy=rows[Math.floor(i/3)];
    if(stamps[i])x.drawImage(stamps[i],cx-size/2,sy-size/2,size,size);
    text(st.name,cx,sy+132,27,268);
  });
  // Tamamlanma tarihi bir kez: son keşfin tarihi.
  const finishedAt=Math.max(...ST.map(st=>Number(S.badges[st.id])||0))||Date.now();
  const date=new Date(finishedAt).toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"});
  text(date,W/2,1210,28,300);
  x.strokeStyle="#c6952c";x.lineWidth=2;
  x.beginPath();x.moveTo(205,1210);x.lineTo(365,1210);x.moveTo(715,1210);x.lineTo(875,1210);x.stroke();
  // Küçük başarı mührü: bütün tamamlanma bilgisi burada.
  x.fillStyle="#137594";
  [[-26,-7], [26,7]].forEach(([dx,dir])=>{
    x.beginPath();x.moveTo(sealX+dx,sealY+25);x.lineTo(sealX+dx+dir,sealY+58);
    x.lineTo(sealX+dx+12,sealY+49);x.lineTo(sealX+dx+22,sealY+54);x.lineTo(sealX+dx+17,sealY+24);x.fill();
  });
  x.fillStyle="#e9a916";
  for(let i=0;i<18;i++){const a=i*Math.PI/9;x.beginPath();x.arc(sealX+Math.cos(a)*37,sealY+Math.sin(a)*37,8,0,Math.PI*2);x.fill();}
  x.beginPath();x.arc(sealX,sealY,36,0,Math.PI*2);x.fillStyle="#ffe38a";x.fill();
  x.lineWidth=2;x.strokeStyle=gold;x.stroke();
  text(ST.length+" / "+ST.length,sealX,sealY-6,26,72);
  text("keşif",sealX,sealY+18,15,60);
  // Orijinal marka, navy zemine çerçevesiz oturur.
  const brand=await brandImage();
  x.drawImage(brand,637,332,646,399,477,1264,126,77.8);
  return new Promise(resolve=>c.toBlob(resolve,"image/png"));
}
function rr(x,a,b,w,h,r){ x.beginPath(); x.moveTo(a+r,b); x.arcTo(a+w,b,a+w,b+h,r); x.arcTo(a+w,b+h,a,b+h,r); x.arcTo(a,b+h,a,b,r); x.arcTo(a,b,a+w,b,r); x.closePath(); }

// Damga sesi isteğe bağlıdır; ilk kullanıcı dokunuşunda ses sistemi hazırlanır.
let stampAudio=null;
function prepareStampAudio(){
 const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return null;
 try{if(!stampAudio)stampAudio=new Audio();if(stampAudio.state==='suspended')stampAudio.resume().catch(()=>{});return stampAudio;}catch(e){return null;}
}
function playStampSound(){
 if(!S?.sound||document.hidden)return;const audio=prepareStampAudio();if(!audio||audio.state!=='running')return;
 try{const oscillator=audio.createOscillator(),gain=audio.createGain(),now=audio.currentTime;
 oscillator.type='triangle';oscillator.frequency.setValueAtTime(170,now);oscillator.frequency.exponentialRampToValueAtTime(70,now+.12);
 gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.10,now+.008);gain.gain.exponentialRampToValueAtTime(.0001,now+.15);
 oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(now);oscillator.stop(now+.16);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
 }catch(e){}
}
function renderSoundSetting(){
 const b=$('#sound-toggle');b.hidden=!(window.AudioContext||window.webkitAudioContext);b.setAttribute('aria-checked',String(!!S?.sound));b.textContent='♪ Damga sesi: '+(S?.sound?'Açık':'Kapalı');
}
$('#sound-toggle').onclick=()=>{S.sound=!S.sound;if(S.sound)prepareStampAudio();save();renderSoundSetting();};
document.addEventListener('visibilitychange',()=>document.documentElement.classList.toggle('page-hidden',document.hidden));

// ---------- Menü ----------
function renderMenu(){ $("#ver").textContent = `${D.aquarium} · ${D.season} · v41`; $("#save-retry").classList.toggle("hidden",$("#save-warning").classList.contains("hidden"));renderInstall();renderSoundSetting(); }
$("#save-retry").onclick=()=>{storageAlertShown=false;save();};
$("#btn-reset").onclick = () => modal("🗑️","Emin misin?","Bu telefondaki tüm damgalar silinecek.",[
  {label:"Evet, sıfırla",cls:"btn-danger",onClick:()=>{ try{localStorage.removeItem(KEY);}catch(e){} S = null; stack = []; target = null; renderWelcome(); show("v-welcome",false); }},
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
if (S && S.flow && !location.hash && current === "v-home") resumeTask();
if (pending && !S) setTimeout(() => modal("🐠","Bir görev buldun!","Önce kaşif adını yaz. Sonra keşfine başlayıp soruyu cevaplayabilirsin.",[{label:"Tamam"}]), 300);

// Service worker: çevrimdışı çalışma
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  // Yeni sürüm yüklenince sayfayı bir kez yenile
  const hadCtrl = !!navigator.serviceWorker.controller; let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (hadCtrl && !reloaded && current !== "v-scan" && current !== "v-quiz" && current !== "v-reward" && current !== "v-learn" && current !== "v-cert") { reloaded = true; location.reload(); }
  });
  navigator.serviceWorker.register("sw.js").then(() => navigator.serviceWorker.ready).then(() => {
    $("#offline-ok").classList.remove("hidden");
  }).catch(()=>{});
}
})();

