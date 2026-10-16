// Onaylanan doğal renkli çizimler; tüm ekranlar ve damgalar aynı kaynağı kullanır.
(function(){
let n=0;
const uid=p=>p+'_'+(++n);
const pack=window.KASIF_ART_PACK;
if(!pack)throw new Error('Çizim paketi yüklenemedi');
const ART={};
for(const key of Object.keys(pack.sprites))ART[key]=()=>{
 const sprite=pack.sprites[key],id=uid('sprite'),[x,y,w,h]=sprite.box;
 const scale=90/Math.max(w,h),cx=x+w/2,cy=y+h/2;
 return `<g transform="translate(50 50) scale(${scale}) translate(-${cx} -${cy})"><defs><clipPath id="${id}" clipPathUnits="userSpaceOnUse"><path d="${sprite.clip}"/></clipPath></defs><image href="${pack.src}" width="${pack.width}" height="${pack.height}" clip-path="url(#${id})"/></g>`;
};

// Vize damgası: bölgenin türüne göre yuvarlak (kıta), köşeli (körfez) ya da sekizgen (özel bölge).
// opts.date verilirse damgada tarih yazar.
const TXT = `font-family='"Baloo 2",ui-rounded,system-ui,sans-serif' font-weight="800" text-anchor="middle"`;
function fmtDate(ts){ const d = new Date(ts), p = n => String(n).padStart(2, "0"); return `${p(d.getDate())}.${p(d.getMonth()+1)}.${d.getFullYear()}`; }
function octagon(r){ return Array.from({length:8}, (_, i) => { const a = Math.PI / 8 + i * Math.PI / 4; return `${(60 + r*Math.cos(a)).toFixed(1)},${(60 + r*Math.sin(a)).toFixed(1)}`; }).join(" "); }
function stampSVG(st, opts = {}){
  const id = uid("st"), K = window.KASIF, reg = (K && K.regions && K.regions[st.region]) || { label: st.name, kind: "kita" };
  const label = reg.label.toLocaleUpperCase("tr-TR"), bottom = opts.certificate ? "★ ★ ★" : opts.date ? fmtDate(opts.date) : "KÖRFEZ AQUA";
  const clarity={pirana:1.12,mersin:1.24,kesis:1.12,fosil:1.12,orfoz:1.12,karagoz:1.12,kabuk:1.08,megalodon:1.13,vatoz:1.12};
  const art = (cx, cy, k) => `<g class="art" transform="translate(${cx} ${cy}) scale(${k*(clarity[st.art || st.id]||1)}) translate(-50 -50)">${ART[st.art || st.id]()}</g>`;
  const grad = `<defs><radialGradient id="${id}" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="${st.light}"/><stop offset="1" stop-color="${st.color}"/></radialGradient></defs>`;
  const white = `${TXT} fill="#fff" stroke="rgba(0,0,0,.28)" stroke-width="1.4" paint-order="stroke" letter-spacing=".6"`;
  const lower = opts.certificate ? `${TXT} fill="#ffe38a" letter-spacing="1"` : white;
  let body;
  if (reg.kind === "korfez") body = `
    <rect x="2" y="2" width="116" height="116" rx="20" fill="#f2b632"/>
    <rect x="7" y="7" width="106" height="106" rx="16" fill="url(#${id})"/>
    <rect x="13" y="22" width="94" height="76" rx="8" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="1.4" stroke-dasharray="3 4"/>
    <text x="60" y="18.5" font-size="9" ${white}>${label}</text>
    <text x="60" y="109" font-size="8" ${lower}>${bottom}</text>
    ${art(60, 60, .62)}`;
  else if (reg.kind === "ozel") body = `
    <polygon points="${octagon(62)}" fill="#f2b632"/>
    <polygon points="${octagon(56.5)}" fill="url(#${id})"/>
    <polygon points="${octagon(48)}" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.4" stroke-dasharray="3 4"/>
    ${opts.certificate ? "" : `<text x="60" y="27" font-size="7.5" ${white}>${bottom}</text>`}
    ${art(60, 56, .56)}
    <path d="M12 84 L1 84 L6 92 L1 100 L12 100 Z M108 84 L119 84 L114 92 L119 100 L108 100 Z" fill="#c98500"/>
    <rect x="10" y="80" width="100" height="18" rx="3" fill="#f5bd3a" stroke="#b06f00" stroke-width="1"/>
    <text x="60" y="93" font-size="9.5" ${TXT} fill="#4a2d00" letter-spacing=".5">${label}</text>
    ${opts.certificate ? `<text x="60" y="109" font-size="8" ${lower}>${bottom}</text>` : ""}`;
  else body = `
    <circle cx="60" cy="60" r="57" fill="#f2b632"/>
    <circle cx="60" cy="60" r="52" fill="url(#${id})"/>
    <circle cx="60" cy="60" r="40" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="1.4" stroke-dasharray="3 4"/>
    <path id="${id}t" d="M16.5 60 A43.5 43.5 0 0 1 103.5 60" fill="none"/>
    <path id="${id}b" d="M10.5 60 A49.5 49.5 0 0 0 109.5 60" fill="none"/>
    <text font-size="9" ${white}><textPath href="#${id}t" startOffset="50%" text-anchor="middle">${label}</textPath></text>
    <text font-size="8" ${lower}><textPath href="#${id}b" startOffset="50%" text-anchor="middle">${bottom}</textPath></text>
    <text x="13.5" y="63" font-size="8" ${TXT} fill="#fff">★</text><text x="106.5" y="63" font-size="8" ${TXT} fill="#fff">★</text>
    ${art(60, 61, .6)}`;
  // v41 parlak damga: damganın kendi şekline kırpılmış, kayan yumuşak hologram bandı (opts.shine)
  let shine = "";
  if (opts.shine) {
    const shape = reg.kind === "korfez" ? `<rect x="2" y="2" width="116" height="116" rx="20"/>`
      : reg.kind === "ozel" ? `<polygon points="${octagon(62)}"/>` : `<circle cx="60" cy="60" r="57"/>`;
    shine = `<defs><clipPath id="${id}c">${shape}</clipPath><linearGradient id="${id}h" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".38" stop-color="#fff6c8" stop-opacity=".55"/>
      <stop offset=".5" stop-color="#ffffff" stop-opacity=".9"/><stop offset=".62" stop-color="#b8f3ff" stop-opacity=".55"/>
      <stop offset=".8" stop-color="#ffc6f2" stop-opacity=".3"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
      <g class="shine" clip-path="url(#${id}c)"><rect class="shine-band" x="-40" y="-40" width="44" height="200" fill="url(#${id}h)"/></g>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" class="stamp-svg" aria-hidden="true">${grad}${body}${shine}</svg>`;
}
// v41 hazine sandığı: kapak (.lid) ayrı grup; açılınca içinden ışık yükselir.
function chestSVG(){
  const id = uid("ch"), O = "#1f2440";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 104" class="chest-svg" aria-hidden="true">
    <defs><radialGradient id="${id}g" cx="50%" cy="100%" r="80%"><stop offset="0" stop-color="#fff7c2"/><stop offset=".45" stop-color="#ffd54a" stop-opacity=".85"/><stop offset="1" stop-color="#ffb300" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c47a3c"/><stop offset="1" stop-color="#8e4f22"/></linearGradient>
      <linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d88d4a"/><stop offset="1" stop-color="#a7612d"/></linearGradient></defs>
    <ellipse cx="60" cy="98" rx="46" ry="5" fill="#000" opacity=".22"/>
    <g class="chest-glow"><ellipse cx="60" cy="52" rx="44" ry="30" fill="url(#${id}g)"/></g>
    <rect x="12" y="50" width="96" height="44" rx="7" fill="url(#${id}w)" stroke="${O}" stroke-width="4"/>
    <path d="M14 66h92M14 80h92" stroke="#7a4219" stroke-width="2.5" opacity=".7"/>
    <rect x="24" y="50" width="11" height="44" fill="#f5bd3a" stroke="${O}" stroke-width="3"/>
    <rect x="85" y="50" width="11" height="44" fill="#f5bd3a" stroke="${O}" stroke-width="3"/>
    <rect x="50" y="56" width="20" height="22" rx="4" fill="#ffd45c" stroke="${O}" stroke-width="3"/>
    <path d="M60 63a3 3 0 1 1-.01 0M58.6 66h2.8l1 6h-4.8z" fill="${O}"/>
    <g class="lid">
      <path d="M12 52V36Q12 14 60 14Q108 14 108 36V52Z" fill="url(#${id}l)" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M24 52V30Q26 20 35 18.2V52ZM85 18.2Q94 20 96 30V52H85Z" fill="#f5bd3a" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M22 26Q60 12 98 26" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".35" fill="none"/>
      <rect x="10" y="46" width="100" height="9" rx="4" fill="#f5bd3a" stroke="${O}" stroke-width="3.5"/>
    </g>
  </svg>`;
}
// Final damgası: 9 damga tamamlanınca pasaporta basılan büyük altın "Okyanus Kaşifi" damgası
function finalSealSVG(){
  const id = uid("fs");
  const scal = Array.from({length: 30}, (_, i) => { const a = i * Math.PI / 15; return `<circle cx="${(100 + 86*Math.cos(a)).toFixed(1)}" cy="${(100 + 86*Math.sin(a)).toFixed(1)}" r="11" fill="#e39a12"/>`; }).join("");
  const star = Array.from({length: 10}, (_, i) => { const r = i % 2 ? 13 : 30, a = -Math.PI/2 + i * Math.PI/5; return `${(100 + r*Math.cos(a)).toFixed(1)},${(98 + r*Math.sin(a)).toFixed(1)}`; }).join(" ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 230" class="final-seal-svg" aria-hidden="true">
    <defs><radialGradient id="${id}" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#ffe9a0"/><stop offset=".55" stop-color="#f5bd3a"/><stop offset="1" stop-color="#d98c10"/></radialGradient>
      <path id="${id}t" d="M38 100 A62 62 0 0 1 162 100"/><path id="${id}b" d="M30 100 A70 70 0 0 0 170 100"/></defs>
    <path d="M62 160 L44 222 L66 208 L80 228 L92 168 Z M138 160 L156 222 L134 208 L120 228 L108 168 Z" fill="#c43328"/>
    ${scal}<circle cx="100" cy="100" r="86" fill="url(#${id})"/>
    <circle cx="100" cy="100" r="74" fill="none" stroke="#fff6d6" stroke-width="2.5" stroke-dasharray="4 4"/>
    <circle cx="100" cy="98" r="40" fill="#10264d"/><polygon points="${star}" fill="#f5bd3a"/>
    <text font-family='"Baloo 2",ui-rounded,system-ui,sans-serif' font-weight="800" font-size="21" fill="#5a3600" text-anchor="middle" letter-spacing="2"><textPath href="#${id}t" startOffset="50%" text-anchor="middle">OKYANUS</textPath></text>
    <text font-family='"Baloo 2",ui-rounded,system-ui,sans-serif' font-weight="800" font-size="21" fill="#5a3600" text-anchor="middle" letter-spacing="2"><textPath href="#${id}b" startOffset="50%" text-anchor="middle">KAŞİFİ</textPath></text>
  </svg>`;
}
function artSVG(key, cls = ""){
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="${cls}" aria-hidden="true">${ART[key]()}</svg>`;
}
window.ART = ART; window.stampSVG = stampSVG; window.chestSVG = chestSVG; window.finalSealSVG = finalSealSVG; window.artSVG = artSVG;
})();

