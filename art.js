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
  const label = reg.label.toLocaleUpperCase("tr-TR"), bottom = opts.date ? fmtDate(opts.date) : "KÖRFEZ AQUA";
  const clarity={pirana:1.12,mersin:1.24,kesis:1.12,fosil:1.12,orfoz:1.12,karagoz:1.12,kabuk:1.08,megalodon:1.13,vatoz:1.12};
  const art = (cx, cy, k) => `<g class="art" transform="translate(${cx} ${cy}) scale(${k*(clarity[st.art || st.id]||1)}) translate(-50 -50)">${ART[st.art || st.id]()}</g>`;
  const grad = `<defs><radialGradient id="${id}" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="${st.light}"/><stop offset="1" stop-color="${st.color}"/></radialGradient></defs>`;
  const white = `${TXT} fill="#fff" stroke="rgba(0,0,0,.28)" stroke-width="1.4" paint-order="stroke" letter-spacing=".6"`;
  let body;
  if (reg.kind === "korfez") body = `
    <rect x="2" y="2" width="116" height="116" rx="20" fill="#f2b632"/>
    <rect x="7" y="7" width="106" height="106" rx="16" fill="url(#${id})"/>
    <rect x="13" y="22" width="94" height="76" rx="8" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="1.4" stroke-dasharray="3 4"/>
    <text x="60" y="18.5" font-size="9" ${white}>${label}</text>
    <text x="60" y="109" font-size="8" ${white}>${bottom}</text>
    ${art(60, 60, .62)}`;
  else if (reg.kind === "ozel") body = `
    <polygon points="${octagon(62)}" fill="#f2b632"/>
    <polygon points="${octagon(56.5)}" fill="url(#${id})"/>
    <polygon points="${octagon(48)}" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.4" stroke-dasharray="3 4"/>
    <text x="60" y="27" font-size="7.5" ${white}>${bottom}</text>
    ${art(60, 56, .56)}
    <path d="M12 84 L1 84 L6 92 L1 100 L12 100 Z M108 84 L119 84 L114 92 L119 100 L108 100 Z" fill="#c98500"/>
    <rect x="10" y="80" width="100" height="18" rx="3" fill="#f5bd3a" stroke="#b06f00" stroke-width="1"/>
    <text x="60" y="93" font-size="9.5" ${TXT} fill="#4a2d00" letter-spacing=".5">${label}</text>`;
  else body = `
    <circle cx="60" cy="60" r="57" fill="#f2b632"/>
    <circle cx="60" cy="60" r="52" fill="url(#${id})"/>
    <circle cx="60" cy="60" r="40" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="1.4" stroke-dasharray="3 4"/>
    <path id="${id}t" d="M16.5 60 A43.5 43.5 0 0 1 103.5 60" fill="none"/>
    <path id="${id}b" d="M10.5 60 A49.5 49.5 0 0 0 109.5 60" fill="none"/>
    <text font-size="9" ${white}><textPath href="#${id}t" startOffset="50%" text-anchor="middle">${label}</textPath></text>
    <text font-size="8" ${white}><textPath href="#${id}b" startOffset="50%" text-anchor="middle">${bottom}</textPath></text>
    <text x="13.5" y="63" font-size="8" ${TXT} fill="#fff">★</text><text x="106.5" y="63" font-size="8" ${TXT} fill="#fff">★</text>
    ${art(60, 61, .6)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" class="stamp-svg" aria-hidden="true">${grad}${body}</svg>`;
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
window.ART = ART; window.stampSVG = stampSVG; window.finalSealSVG = finalSealSVG; window.artSVG = artSVG;
})();

