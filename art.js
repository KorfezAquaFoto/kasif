// ===== Canlı çizimleri (SVG, internet gerektirmez) =====
// Her çizim 100x100 alana yapılır. ART[id](uid) bir <g> içeriği döndürür.
(function(){
let n = 0;
const uid = p => p + "_" + (++n);

const ART = {
  kopekbaligi(){
    return `
      <path d="M24 56 L8 38 Q14 55 9 72 Z" fill="#5d7f9e"/>
      <path d="M47 42 Q52 24 62 20 Q60 32 63 43 Z" fill="#5d7f9e"/>
      <path d="M18 56 C30 38 62 33 84 49 C89 52 89 57 84 59 C62 72 32 70 18 56 Z" fill="#7b9cbc"/>
      <path d="M38 60 C55 67 72 64 86 56 C80 66 56 74 38 60 Z" fill="#f4f8fb"/>
      <path d="M50 63 Q46 74 40 80 Q52 76 60 65 Z" fill="#5d7f9e"/>
      <path d="M78 58 Q82 60 86 57" stroke="#2b3f55" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <path d="M62 49 q-2 4 0 8 M66 48 q-2 4 0 8 M70 48 q-2 4 0 8" stroke="#4a6987" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <circle cx="75" cy="49" r="3.2" fill="#14263d"/><circle cx="76.2" cy="47.8" r="1.1" fill="#fff"/>`;
  },
  palyaco(){
    const c = uid("pc");
    return `
      <defs><clipPath id="${c}"><ellipse cx="52" cy="52" rx="28" ry="19"/></clipPath></defs>
      <path d="M27 52 L10 38 Q15 52 10 66 Z" fill="#ff7a1a" stroke="#1d1d1d" stroke-width="2" stroke-linejoin="round"/>
      <path d="M40 36 Q50 22 64 34 Z" fill="#ff7a1a" stroke="#1d1d1d" stroke-width="2" stroke-linejoin="round"/>
      <ellipse cx="52" cy="52" rx="28" ry="19" fill="#ff8a1f"/>
      <g clip-path="url(#${c})">
        <path d="M30 30 Q27 52 30 74 L37 74 Q34 52 37 30 Z" fill="#fff" stroke="#1d1d1d" stroke-width="2"/>
        <path d="M47 30 Q44 52 47 74 L56 74 Q53 52 56 30 Z" fill="#fff" stroke="#1d1d1d" stroke-width="2"/>
        <path d="M63 30 Q61 52 63 74 L69 74 Q67 52 69 30 Z" fill="#fff" stroke="#1d1d1d" stroke-width="2"/>
        <ellipse cx="52" cy="62" rx="26" ry="8" fill="#ffb15c" opacity=".5"/>
      </g>
      <ellipse cx="52" cy="52" rx="28" ry="19" fill="none" stroke="#1d1d1d" stroke-width="2"/>
      <path d="M50 64 Q54 74 46 76 Q46 70 50 64 Z" fill="#ff7a1a" stroke="#1d1d1d" stroke-width="1.8"/>
      <circle cx="73" cy="47" r="4" fill="#fff"/><circle cx="74" cy="47" r="2.4" fill="#111"/>
      <path d="M77 56 Q80 57 79.5 54" stroke="#1d1d1d" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  },
  ahtapot(){
    const t = (d) => `<path d="${d}" stroke="#a24fc0" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    return `
      ${t("M36 54 C28 64 20 66 18 76 C17 82 24 84 26 78")}
      ${t("M44 58 C40 70 36 76 38 86")}
      ${t("M50 59 C50 70 52 78 50 88")}
      ${t("M56 58 C60 70 64 76 62 86")}
      ${t("M64 54 C72 64 80 66 82 76 C83 82 76 84 74 78")}
      <circle cx="26" cy="77" r="1.4" fill="#e9b6f5"/><circle cx="74" cy="77" r="1.4" fill="#e9b6f5"/>
      <path d="M28 42 C28 20 72 20 72 42 C72 56 62 60 50 60 C38 60 28 56 28 42 Z" fill="#b65fd3"/>
      <ellipse cx="42" cy="28" rx="7" ry="4" fill="#d79aec" opacity=".8" transform="rotate(-25 42 28)"/>
      <circle cx="41" cy="44" r="5.2" fill="#fff"/><circle cx="59" cy="44" r="5.2" fill="#fff"/>
      <circle cx="42" cy="45" r="2.8" fill="#1d1030"/><circle cx="60" cy="45" r="2.8" fill="#1d1030"/>
      <circle cx="43" cy="44" r="1" fill="#fff"/><circle cx="61" cy="44" r="1" fill="#fff"/>
      <path d="M46 53 Q50 56 54 53" stroke="#5e1f78" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="34" cy="51" r="2.6" fill="#ff8fc8" opacity=".7"/><circle cx="66" cy="51" r="2.6" fill="#ff8fc8" opacity=".7"/>`;
  },
  muren(){
    return `
      <path d="M6 92 C6 70 22 62 36 66 C46 69 50 80 48 92 Z" fill="#4f5966"/>
      <ellipse cx="30" cy="80" rx="11" ry="9" fill="#1f252d"/>
      <path d="M30 80 C30 62 42 50 56 44 C66 40 72 34 74 28" stroke="#6f8a2c" stroke-width="15" fill="none" stroke-linecap="round"/>
      <path d="M30 80 C30 62 42 50 56 44 C66 40 72 34 74 28" stroke="#9cb84a" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="2 7" opacity=".9"/>
      <path d="M62 32 C62 18 78 10 90 15 C97 18 97 25 92 29 L80 30 L93 34 C91 42 76 45 66 40 Z" fill="#7d9a33"/>
      <path d="M80 30 L92 29 L93 34 Z" fill="#3a1a1a"/>
      <path d="M82 30 l1.5 2 l1.5 -2 l1.5 2 l1.5 -2" stroke="#fff" stroke-width="1.2" fill="none"/>
      <circle cx="80" cy="21" r="3.8" fill="#fff8c4"/><circle cx="80.8" cy="21" r="2.1" fill="#111"/>
      <path d="M48 24 q8 -6 14 0" stroke="#ffffff" stroke-width="1.5" fill="none" opacity="0"/>`;
  },
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
  mercan(){
    const b = (d, w = 8, col = "#ff6f61") => `<path d="${d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    return `
      <path d="M18 88 C20 78 40 76 50 78 C62 76 80 78 82 88 Z" fill="#c9a77c"/>
      ${b("M50 82 L50 50 L38 34 L34 18")}
      ${b("M50 58 L64 42 L66 24")}
      ${b("M38 34 L26 30 L20 20")}
      ${b("M64 42 L78 36 L82 24")}
      ${b("M50 70 L32 60 L24 50", 7)}
      ${b("M50 66 L70 60 L80 52", 7)}
      ${b("M66 24 L72 16", 6)}
      ${["34,18","20,20","66,24","82,24","24,50","80,52","72,16"].map(p => { const [x,y] = p.split(","); return `<circle cx="${x}" cy="${y}" r="5" fill="#ff9a8c"/>`; }).join("")}
      ${["40,44","52,52","60,48","44,64","58,64","30,32","74,40"].map(p => { const [x,y] = p.split(","); return `<circle cx="${x}" cy="${y}" r="1.4" fill="#ffd2cb"/>`; }).join("")}
      <circle cx="26" cy="72" r="3" fill="#ffd34d"/><circle cx="74" cy="74" r="2.4" fill="#8be0d6"/>`;
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
  }
};

// Damga (rozet) SVG'si: renkli daire + canlı çizimi
function stampSVG(st, opts = {}){
  const id = uid("st");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" class="stamp-svg" aria-hidden="true">
    <defs><radialGradient id="${id}" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="${st.light}"/><stop offset="1" stop-color="${st.color}"/></radialGradient></defs>
    <circle cx="60" cy="60" r="57" fill="#f2b632"/>
    <circle cx="60" cy="60" r="52" fill="url(#${id})"/>
    <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.6" stroke-dasharray="3 4"/>
    <g class="art" transform="translate(14 14) scale(.92)">${ART[st.art || st.id]()}</g>
  </svg>`;
}
function artSVG(key, cls = ""){
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="${cls}" aria-hidden="true">${ART[key]()}</svg>`;
}
window.ART = ART; window.stampSVG = stampSVG; window.artSVG = artSVG;
})();
