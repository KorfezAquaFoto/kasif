// ===== Canlı çizimleri (SVG, internet gerektirmez) =====
// Her çizim 100x100 alana yapılır. ART[id](uid) bir <g> içeriği döndürür.
(function(){
let n = 0;
const uid = p => p + "_" + (++n);

const ART = {
  pirana(){
    const c = uid("pr");
    return `
      <defs><clipPath id="${c}"><path d="M22 50 C22 28 58 22 76 36 C84 42 86 50 84 58 C80 72 60 78 44 74 C30 70 22 62 22 50 Z"/></clipPath></defs>
      <path d="M26 50 L8 36 Q14 50 8 66 Z" fill="#8a96a6"/>
      <path d="M42 30 Q52 16 64 28 Z" fill="#8a96a6"/>
      <path d="M22 50 C22 28 58 22 76 36 C84 42 86 50 84 58 C80 72 60 78 44 74 C30 70 22 62 22 50 Z" fill="#b8c3cf"/>
      <g clip-path="url(#${c})">
        <path d="M18 58 C40 54 64 56 90 54 L90 90 L18 90 Z" fill="#e2463b"/>
        <circle cx="40" cy="40" r="1.6" fill="#8a96a6"/><circle cx="50" cy="36" r="1.6" fill="#8a96a6"/><circle cx="46" cy="46" r="1.6" fill="#8a96a6"/><circle cx="58" cy="42" r="1.6" fill="#8a96a6"/>
      </g>
      <path d="M68 58 L86 54 C86 62 80 68 72 66 Z" fill="#c43328"/>
      <path d="M70 58 l3 4 l3 -4.6 l3 4.2 l3 -5 l2 3" stroke="#fff" stroke-width="1.6" fill="#fff" stroke-linejoin="round"/>
      <path d="M44 66 Q48 74 40 78 Q40 70 44 66 Z" fill="#c43328"/>
      <circle cx="68" cy="43" r="4.6" fill="#fff36b"/><circle cx="69" cy="43.5" r="2.4" fill="#111"/>
      <path d="M62 36 L74 39" stroke="#3b4350" stroke-width="2.4" stroke-linecap="round"/>`;
  },
  megalodon(){
    // çene halkası + iki sıra diş
    let teeth = "";
    const N = 9;
    for (let i = 0; i < N; i++) {
      const a = Math.PI * (0.12 + 0.76 * i / (N - 1));       // üst yay
      const x = 50 - Math.cos(a) * 30, y = 50 - Math.sin(a) * 23;
      const ix = 50 - Math.cos(a) * 20, iy = 50 - Math.sin(a) * 13;
      const px = -Math.sin(a) * 3.6, py = Math.cos(a) * 3.6 * 1.3;
      teeth += `<path d="M${(x+px).toFixed(1)} ${(y-py).toFixed(1)} L${ix.toFixed(1)} ${iy.toFixed(1)} L${(x-px).toFixed(1)} ${(y+py).toFixed(1)} Z" fill="#fffaf0" stroke="#d9cdb4" stroke-width=".8"/>`;
      const y2 = 50 + Math.sin(a) * 23, iy2 = 50 + Math.sin(a) * 13;
      teeth += `<path d="M${(x+px).toFixed(1)} ${(y2+py).toFixed(1)} L${ix.toFixed(1)} ${iy2.toFixed(1)} L${(x-px).toFixed(1)} ${(y2-py).toFixed(1)} Z" fill="#fffaf0" stroke="#d9cdb4" stroke-width=".8"/>`;
    }
    return `
      <ellipse cx="50" cy="50" rx="38" ry="31" fill="#8a7b6a"/>
      <ellipse cx="50" cy="50" rx="34" ry="27" fill="#d98b8b"/>
      <ellipse cx="50" cy="50" rx="24" ry="17" fill="#3a0f17"/>
      <ellipse cx="50" cy="56" rx="14" ry="6" fill="#5c1a26"/>
      ${teeth}`;
  },
  mersin(){
    const scute = (x, y) => `<path d="M${x} ${y-2.6} l2.6 2.6 l-2.6 2.6 l-2.6 -2.6 Z" fill="#eef3f8" stroke="#3d5a78" stroke-width=".8"/>`;
    let sc = "";
    for (let x = 32; x <= 70; x += 7.5) sc += scute(x, 44.5);
    for (let x = 30; x <= 72; x += 7) sc += scute(x, 53);
    return `
      <path d="M26 52 L6 32 Q11 46 9 50 Q12 58 12 66 Z" fill="#4f6f90"/>
      <path d="M46 42 Q52 33 59 41 Z" fill="#4f6f90"/>
      <path d="M20 52 C30 41 52 39 72 43 C81 44 89 46 96 49 C89 52 81 55 72 57 C52 62 30 62 20 52 Z" fill="#7393b3"/>
      <path d="M30 56 C48 61 66 60 82 55 C68 63 44 64 30 56 Z" fill="#dde7f0"/>
      ${sc}
      <path d="M62 56 Q60 66 53 69 Q59 62 57 56 Z" fill="#4f6f90"/>
      <path d="M83 53.5 l-1.5 5.5 M86.5 52.5 l-.5 5.5 M89.5 51.5 l.5 5" stroke="#3d5a78" stroke-width="1.3" stroke-linecap="round"/>
      <circle cx="76" cy="47" r="3" fill="#14263d"/><circle cx="77" cy="46" r="1" fill="#fff"/>`;
  },
  kesis(){
    const leg = d => `<path d="${d}" stroke="#e0662a" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    return `
      ${leg("M50 60 L42 72 L36 78")}${leg("M58 62 L55 74 L50 82")}${leg("M66 61 L70 73 L74 80")}
      <path d="M14 60 C8 36 26 16 48 18 C66 20 74 38 68 60 Z" fill="#f6e0cb" stroke="#c98a6a" stroke-width="2"/>
      <path d="M20 46 C28 44 36 46 42 52 M24 32 C34 32 44 38 50 48 M38 22 C46 26 54 34 58 44" stroke="#e8b59a" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M42 52 C32 52 28 42 34 36 C40 30 50 34 50 42 C50 48 44 50 41 46 C39 43 42 40 44 42" stroke="#c96f52" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M70 46 L68 34 M77 47 L81 35" stroke="#e0662a" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="71" cy="56" rx="12" ry="9" fill="#f28a3a"/>
      <path d="M78 60 C90 54 98 62 94 70 C90 76 80 74 78 67 Z" fill="#e0662a"/>
      <path d="M84 63 L93 64" stroke="#b44a1c" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="68" cy="32" r="4.2" fill="#fff"/><circle cx="68.6" cy="32.4" r="2.3" fill="#111"/>
      <circle cx="81" cy="33" r="4.2" fill="#fff"/><circle cx="81.6" cy="33.4" r="2.3" fill="#111"/>
      <path d="M66 59 Q70 62 74 59" stroke="#8a3410" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  },
  fosil(){
    let ribs = "";
    for (let x = 58; x >= 34; x -= 6) ribs += `<path d="M${x} 49 Q${x-2} 43 ${x-4} 40 M${x} 51 Q${x-2} 57 ${x-4} 61" stroke="#7a5a33" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    return `
      <path d="M12 32 C14 18 40 13 60 15 C80 17 90 26 88 44 C90 64 84 82 60 84 C36 86 12 80 12 62 Z" fill="#dcc49a"/>
      <path d="M16 62 C18 78 38 82 58 80 C78 78 84 66 85 52 C88 72 80 84 60 84 C36 86 14 80 16 62 Z" fill="#c7ab7d"/>
      <path d="M20 26 l8 6 l-3 6 M76 72 l-6 4 l2 5" stroke="#b39769" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      <path d="M64 40 C76 37 83 44 81 50 C79 57 70 59 63 55 Z" fill="#cdb183" stroke="#7a5a33" stroke-width="2.4" stroke-linejoin="round"/>
      <circle cx="73" cy="46" r="3.2" fill="none" stroke="#7a5a33" stroke-width="2"/>
      <path d="M64 50 C52 50 40 51 27 52" stroke="#7a5a33" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${ribs}
      <path d="M27 52 L16 42 Q21 52 16 62 Z" fill="none" stroke="#7a5a33" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M30 70 m-6 0 a6 6 0 1 1 12 0 a4.2 4.2 0 1 1 -8.4 0 a2.4 2.4 0 1 1 4.8 0" stroke="#9c7c4c" stroke-width="1.8" fill="none"/>`;
  },
  orfoz(){
    const blot = [[40,48,5,3.4],[52,42,4.4,3],[56,56,5,3.4],[44,60,4,2.8],[67,47,3.8,2.6],[31,54,3.6,2.6],[64,62,3.6,2.4]]
      .map(([x,y,a,b]) => `<ellipse cx="${x}" cy="${y}" rx="${a}" ry="${b}" fill="#e2c49c" opacity=".75"/>`).join("");
    return `
      <path d="M24 53 C14 40 5 43 5 53 C5 63 14 66 24 53 Z" fill="#7a5233"/>
      <path d="M34 37 L37 27 L41 34 L45 25 L49 33 L53 25 L57 33 L61 27 L64 35 Z" fill="#7a5233"/>
      <path d="M20 53 C24 35 52 29 72 35 C84 39 92 47 92 55 C92 63 84 70 70 72 C48 76 24 70 20 53 Z" fill="#9c6c43"/>
      <path d="M34 64 C50 72 70 70 87 62 C80 71 66 76 50 74 C42 73 37 70 34 64 Z" fill="#c69a6a"/>
      ${blot}
      <path d="M60 58 Q56 68 48 71 Q55 63 55 56 Z" fill="#7a5233"/>
      <path d="M79 60 C85 63 92 61 93.5 55 C88 58 84 58 79 60 Z" fill="#6b4528"/>
      <path d="M80 59 Q86 59 92 55" stroke="#4a2c16" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      <circle cx="78" cy="46" r="4.4" fill="#fff6dc"/><circle cx="79" cy="46.4" r="2.4" fill="#111"/>`;
  },
  karagoz(){
    const c = uid("kg");
    return `
      <defs><clipPath id="${c}"><path d="M22 50 C28 32 60 26 80 38 C88 43 90 50 88 54 C84 64 60 72 40 66 C30 63 22 58 22 50 Z"/></clipPath></defs>
      <path d="M26 50 L8 35 Q14 50 8 65 Z" fill="#aeb9c5"/>
      <path d="M40 34 Q54 21 68 32 Z" fill="#aeb9c5"/>
      <path d="M22 50 C28 32 60 26 80 38 C88 43 90 50 88 54 C84 64 60 72 40 66 C30 63 22 58 22 50 Z" fill="#dfe6ee"/>
      <g clip-path="url(#${c})">
        <path d="M20 46 C40 30 66 28 90 42 L90 20 L20 20 Z" fill="#b4c1ce"/>
        <path d="M24 50 C44 47 66 47 88 50 M26 56 C46 54 66 54 86 56" stroke="#c6d0da" stroke-width="1.4" fill="none"/>
        <rect x="64" y="20" width="6" height="60" fill="#2a2f38"/>
        <rect x="27" y="20" width="6" height="60" fill="#2a2f38"/>
      </g>
      <path d="M52 66 Q50 74 44 77 Q48 70 47 64 Z" fill="#e8c95a"/>
      <circle cx="79" cy="44" r="4" fill="#fff"/><circle cx="80" cy="44.4" r="2.3" fill="#111"/>
      <path d="M86 53 Q88.5 54 87.5 56.5" stroke="#3b4350" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
  },
  kabuk(){
    return `
      <path d="M14 88 L20 74 Q28 70 36 74 L42 88 Z" fill="#f3b47a"/>
      <path d="M28 87 L28 74 M22 87 L24 76 M34 87 L32 76" stroke="#d98a4a" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M34 72 C22 58 26 34 46 26 C62 20 80 32 80 50 C80 66 66 80 50 80 C43 80 38 77 34 72 Z" fill="#f8dcc0" stroke="#d99a78" stroke-width="2"/>
      <path d="M46 26 L38 10 L54 22 Z" fill="#f2c9a6" stroke="#d99a78" stroke-width="2" stroke-linejoin="round"/>
      <path d="M50 50 m-16 0 a16 16 0 1 1 32 0 a12 12 0 1 1 -24 0 a8 8 0 1 1 16 0 a4 4 0 1 1 -8 0" stroke="#d9806a" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M64 64 C76 62 82 72 74 80 C68 84 60 80 60 74 Z" fill="#f7a9a0" stroke="#d9806a" stroke-width="1.6"/>`;
  },
  vatoz(){
    const sp = [[34,46],[66,46],[28,52],[72,52],[40,56],[60,56],[50,32]]
      .map(([x,y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#cfe2f7" opacity=".8"/>`).join("");
    return `
      <path d="M50 70 C50 80 52 88 57 96" stroke="#2f5788" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M50 18 C58 30 70 40 93 47 C80 58 63 62 55 70 L45 70 C37 62 20 58 7 47 C30 40 42 30 50 18 Z" fill="#4a78b5"/>
      <path d="M50 24 C55 33 62 40 76 46 C64 46 56 44 50 40 C44 44 36 46 24 46 C38 40 45 33 50 24 Z" fill="#5d8cc8"/>
      ${sp}
      <circle cx="43" cy="42" r="5" fill="#fff"/><circle cx="57" cy="42" r="5" fill="#fff"/>
      <circle cx="43.6" cy="42.6" r="2.7" fill="#0f1c33"/><circle cx="57.6" cy="42.6" r="2.7" fill="#0f1c33"/>
      <circle cx="44.6" cy="41.4" r="1" fill="#fff"/><circle cx="58.6" cy="41.4" r="1" fill="#fff"/>
      <path d="M45 52 Q50 56 55 52" stroke="#16325a" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="37" cy="50" r="2.6" fill="#ff9fc0" opacity=".6"/><circle cx="63" cy="50" r="2.6" fill="#ff9fc0" opacity=".6"/>`;
  }
};

// Vize damgası: bölgenin türüne göre yuvarlak (kıta), köşeli (körfez) ya da sekizgen (özel bölge).
// opts.date verilirse damgada tarih yazar.
const TXT = `font-family='"Baloo 2",ui-rounded,system-ui,sans-serif' font-weight="800" text-anchor="middle"`;
function fmtDate(ts){ const d = new Date(ts), p = n => String(n).padStart(2, "0"); return `${p(d.getDate())}.${p(d.getMonth()+1)}.${d.getFullYear()}`; }
function octagon(r){ return Array.from({length:8}, (_, i) => { const a = Math.PI / 8 + i * Math.PI / 4; return `${(60 + r*Math.cos(a)).toFixed(1)},${(60 + r*Math.sin(a)).toFixed(1)}`; }).join(" "); }
function stampSVG(st, opts = {}){
  const id = uid("st"), K = window.KASIF, reg = (K && K.regions && K.regions[st.region]) || { label: st.name, kind: "kita" };
  const label = reg.label.toLocaleUpperCase("tr-TR"), bottom = opts.date ? fmtDate(opts.date) : "KÖRFEZ AQUA";
  const art = (cx, cy, k) => `<g class="art" transform="translate(${cx} ${cy}) scale(${k}) translate(-50 -50)">${ART[st.art || st.id]()}</g>`;
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
    <text font-size="9" ${white}><textPath href="#${id}t" startOffset="50%">${label}</textPath></text>
    <text font-size="8" ${white}><textPath href="#${id}b" startOffset="50%">${bottom}</textPath></text>
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
    <text font-family='"Baloo 2",ui-rounded,system-ui,sans-serif' font-weight="800" font-size="21" fill="#5a3600" text-anchor="middle" letter-spacing="2"><textPath href="#${id}t" startOffset="50%">OKYANUS</textPath></text>
    <text font-family='"Baloo 2",ui-rounded,system-ui,sans-serif' font-weight="800" font-size="21" fill="#5a3600" text-anchor="middle" letter-spacing="2"><textPath href="#${id}b" startOffset="50%">KAŞİFİ</textPath></text>
  </svg>`;
}
function artSVG(key, cls = ""){
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="${cls}" aria-hidden="true">${ART[key]()}</svg>`;
}
window.ART = ART; window.stampSVG = stampSVG; window.finalSealSVG = finalSealSVG; window.artSVG = artSVG;
})();
