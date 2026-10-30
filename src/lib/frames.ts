import { brand } from "./brand";

// Every frame is an SVG overlay drawn on top of the camera image at this size (3:4 portrait).
export const W = 1080;
export const H = 1440;

export type FrameCategory = "family" | "kids";
// Oval cut-out (frame pixels) where a face belongs; auto-fit zooms the camera onto it.
export type FaceSpot = { cx: number; cy: number; rx: number; ry: number };
export type Frame = { id: string; name: string; category: FrameCategory; src: string; face?: FaceSpot };

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Helvetica Neue', Arial, sans-serif";
const GOLD = "#f5c542";
const MAROON = "#7a1020";
const CREAM = "#fff4d6";
const SKIN = "#d9a07a";
const SKIN_DARK = "#b97f5a";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const svg = (body: string, defs = "", w = W, h = H) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`;

const toSrc = (s: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(s)}`;

// Deterministic pseudo-random so frames render identically every time.
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const NAVY = "#2b2a7e";
const LOGO_RED = "#d2452b";

// Store logo: navy arch with EG mark and the red "Best Brands · Genuine Products · Best Quality" arc.
// Drawn in a 384×214 box (white plate included) and scaled so its centre lands on (x, y).
function logo(x: number, y: number, w: number) {
  const s = w / 384;
  const red = (text: string, at: number) =>
    `<text font-family="${SERIF}" font-size="21" fill="${LOGO_RED}" text-anchor="middle"><textPath href="#lg-red" startOffset="${at}%">${text}</textPath></text>`;
  return `<g transform="translate(${x} ${y}) scale(${s}) translate(0 85)">
<rect x="-192" y="-192" width="384" height="214" rx="28" fill="#fff"/>
<path id="lg-red" d="M-159.7 10 A160 160 0 1 1 159.7 10" fill="none"/>
<path id="lg-arc" d="M-118 0 A118 118 0 0 1 118 0" fill="none"/>
<path d="M-150 0 A150 150 0 0 1 150 0 Z" fill="${NAVY}"/>
<path d="M-108.4 -28 A112 112 0 0 1 108.4 -28 Z" fill="#fff"/>
<path d="M-100 -30 A104 104 0 0 1 100 -30" fill="none" stroke="${NAVY}" stroke-width="2"/>
<path d="M-140 -24 H140 M-140 -4 H140" stroke="#fff" stroke-width="1.5"/>
<text font-family="${SERIF}" font-size="38" letter-spacing="16" fill="#fff" text-anchor="middle"><textPath href="#lg-arc" startOffset="50%">EVEREST</textPath></text>
<text y="-9" font-family="${SERIF}" font-weight="700" font-size="15" letter-spacing="3" fill="#fff" text-anchor="middle">garments</text>
<circle cx="0" cy="-62" r="22" fill="#fff" stroke="${LOGO_RED}" stroke-width="3"/>
<text x="-7" y="-53" font-family="${SERIF}" font-size="26" fill="${LOGO_RED}" text-anchor="middle">E</text>
<text x="7" y="-53" font-family="${SERIF}" font-size="26" fill="${NAVY}" text-anchor="middle">G</text>
${red("Best Brands", 16)}${red("Genuine Products", 50)}${red("Best Quality", 84)}
</g>`;
}

export const logoSrc = toSrc(svg(logo(192, 107, 384), "", 384, 214));

function bunting(y: number, n: number, sag: number, colors: string[]) {
  let s = `<path d="M0 ${y} Q${W / 2} ${y + 2 * sag} ${W} ${y}" stroke="#5b3a1a" stroke-width="4" fill="none"/>`;
  const size = W / n / 2 - 6;
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const x = t * W;
    const cy = y + 4 * sag * t * (1 - t);
    s += `<path d="M${x - size} ${cy} L${x + size} ${cy} L${x} ${cy + size * 1.5} Z" fill="${colors[i % colors.length]}"/>`;
  }
  return s;
}

function confetti(seed: number, count: number, colors: string[], skip?: (x: number, y: number) => boolean) {
  const r = rng(seed);
  let s = "";
  for (let i = 0; i < count; i++) {
    const x = r() * W;
    const y = r() * H;
    const c = colors[Math.floor(r() * colors.length)];
    const rot = Math.floor(r() * 180);
    if (skip?.(x, y)) continue;
    s += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="14" height="7" rx="2" fill="${c}" transform="rotate(${rot} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
  }
  return s;
}

function marigold(x: number, y: number, r: number, i: number) {
  const outer = i % 2 ? "#ffb300" : "#ff7a00";
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${outer}"/><circle cx="${x}" cy="${y}" r="${r * 0.55}" fill="${i % 2 ? "#ff8f00" : "#e65100"}" opacity="0.7"/>`;
}

const textShadow = `<filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#000" flood-opacity="0.55"/></filter>`;

/* ---------------------------------- Family frames ---------------------------------- */

function festiveFrame() {
  const corner = `<path d="M0 0H110A110 110 0 0 1 0 110Z" fill="${GOLD}"/><path d="M0 0H74A74 74 0 0 1 0 74Z" fill="${MAROON}"/><circle cx="22" cy="22" r="10" fill="${GOLD}"/>`;
  let sideDots = "";
  for (let y = 230; y <= 1200; y += 60) {
    sideDots += `<path d="M30 ${y - 10} L40 ${y} L30 ${y + 10} L20 ${y} Z" fill="${GOLD}"/><path d="M1050 ${y - 10} L1060 ${y} L1050 ${y + 10} L1040 ${y} Z" fill="${GOLD}"/>`;
  }
  let bottomDots = "";
  for (let x = 80; x <= 1000; x += 40) bottomDots += `<circle cx="${x}" cy="1410" r="5" fill="${GOLD}"/>`;
  return svg(`
<path fill-rule="evenodd" fill="${MAROON}" d="M0 0H${W}V${H}H0Z M60 190H1020V1220H60Z"/>
${bunting(190, 14, 40, ["#e53935", "#fdd835", "#43a047", "#1e88e5", "#fb8c00", "#d81b60"])}
<g transform="translate(60 190)">${corner}</g>
<g transform="translate(1020 190) scale(-1 1)">${corner}</g>
<g transform="translate(60 1220) scale(1 -1)">${corner}</g>
<g transform="translate(1020 1220) scale(-1 -1)">${corner}</g>
<rect x="60" y="190" width="960" height="1030" fill="none" stroke="${GOLD}" stroke-width="12"/>
<rect x="44" y="174" width="992" height="1062" fill="none" stroke="${GOLD}" stroke-width="5" stroke-dasharray="1 14" stroke-linecap="round"/>
${sideDots}
${logo(160, 92, 250)}
<text x="580" y="108" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="88" letter-spacing="8" fill="${GOLD}">${esc(brand.short)}</text>
<text x="580" y="152" text-anchor="middle" font-family="${SANS}" font-size="30" letter-spacing="18" fill="${CREAM}">${esc(brand.sub)}</text>
<text x="540" y="1312" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-weight="700" font-size="68" fill="${GOLD}">${esc(brand.tagline)}</text>
<text x="540" y="1366" text-anchor="middle" font-family="${SANS}" font-size="30" letter-spacing="4" fill="${CREAM}">Festive Collection ${brand.year}  ✦  ${esc(brand.hashtag)}</text>
${bottomDots}`);
}

function silkFrame() {
  const MAG = "#9d1457";
  const defs = `
<pattern id="temple" width="60" height="50" patternUnits="userSpaceOnUse"><path d="M0 50 L30 6 L60 50 Z" fill="${GOLD}"/><path d="M14 50 L30 26 L46 50 Z" fill="${MAG}"/></pattern>
<linearGradient id="top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>`;
  let dots = "";
  for (let x = 60; x <= 1020; x += 32) dots += `<circle cx="${x}" cy="1418" r="6" fill="${GOLD}"/>`;
  return svg(`
<rect width="${W}" height="220" fill="url(#top)"/>
${logo(540, 108, 320)}
<rect x="0" y="0" width="36" height="${H}" fill="${MAG}"/><rect x="36" y="0" width="10" height="${H}" fill="${GOLD}"/>
<rect x="1044" y="0" width="36" height="${H}" fill="${MAG}"/><rect x="1034" y="0" width="10" height="${H}" fill="${GOLD}"/>
<rect x="0" y="1150" width="${W}" height="290" fill="${MAG}"/>
<rect x="0" y="1150" width="${W}" height="12" fill="${GOLD}"/>
<rect x="0" y="1162" width="${W}" height="50" fill="url(#temple)"/>
<rect x="0" y="1212" width="${W}" height="8" fill="${GOLD}"/>
<text x="540" y="1302" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="72" letter-spacing="6" fill="${GOLD}">${esc(brand.name.toUpperCase())}</text>
<text x="540" y="1356" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="36" fill="${CREAM}">Pure Silk · Pure Tradition</text>
<rect x="0" y="1388" width="${W}" height="6" fill="${GOLD}"/>
${dots}`, defs);
}

function weddingFrame() {
  const CRIMSON = "#9b111e";
  let scallops = `M0 0H${W}V200`;
  let bells = "";
  for (let i = 0; i < 8; i++) {
    const x1 = W - i * 135;
    scallops += ` A67.5 67.5 0 0 1 ${x1 - 135} 200`;
    if (i > 0) bells += `<line x1="${x1}" y1="200" x2="${x1}" y2="262" stroke="${GOLD}" stroke-width="4"/><path d="M${x1 - 14} 286 Q${x1} 250 ${x1 + 14} 286 Z" fill="${GOLD}"/><circle cx="${x1}" cy="292" r="5" fill="${GOLD}"/>`;
  }
  scallops += " Z";
  let garlands = "";
  let k = 0;
  for (let y = 230; y <= 1170; y += 40) {
    garlands += marigold(36, y, 22, k) + marigold(1044, y, 22, k + 1);
    k++;
  }
  for (let y = 230; y <= 700; y += 40) {
    garlands += marigold(104, y, 18, k) + marigold(976, y, 18, k + 1);
    k++;
  }
  garlands += `<path d="M104 718 l-12 40 h24 Z" fill="#c2185b"/><path d="M976 718 l-12 40 h24 Z" fill="#c2185b"/>`;
  let border = "";
  for (let x = 18; x <= W; x += 36) border += marigold(x, 1186, 18, Math.round(x / 36));
  return svg(`
<path d="${scallops}" fill="${CRIMSON}"/>
<path d="${scallops}" fill="none" stroke="${GOLD}" stroke-width="8"/>
${bells}
${logo(540, 100, 240)}
<text x="250" y="122" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="50" letter-spacing="6" fill="${GOLD}">${esc(brand.short)}</text>
<text x="830" y="122" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="50" letter-spacing="6" fill="${GOLD}">${esc(brand.sub)}</text>
${garlands}
<rect x="0" y="1186" width="${W}" height="254" fill="${CREAM}"/>
${border}
<text x="540" y="1306" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-weight="700" font-size="84" fill="${CRIMSON}">Wedding Collection</text>
<text x="540" y="1368" text-anchor="middle" font-family="${SANS}" font-size="30" letter-spacing="4" fill="#6b4b1a">${esc(brand.name.toUpperCase())} · BRIDAL &amp; GROOM WEAR</text>`);
}

function denimFrame() {
  const DENIM = "#2c4f86";
  const STITCH = "#f0a830";
  const defs = `<pattern id="denim" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="10" height="10" fill="${DENIM}"/><rect width="3" height="10" fill="#3a63a3"/></pattern>`;
  const rivet = (x: number, y: number) => `<circle cx="${x}" cy="${y}" r="13" fill="#c9a24a" stroke="#7a5a1c" stroke-width="3"/><circle cx="${x}" cy="${y}" r="4" fill="#7a5a1c"/>`;
  return svg(`
<path fill-rule="evenodd" fill="url(#denim)" d="M0 0H${W}V${H}H0Z M56 56H1024V1180H56Z"/>
<rect x="22" y="22" width="1036" height="1396" rx="20" fill="none" stroke="${STITCH}" stroke-width="4" stroke-dasharray="16 10"/>
<rect x="42" y="42" width="996" height="1152" fill="none" stroke="${STITCH}" stroke-width="4" stroke-dasharray="16 10"/>
${rivet(56, 56)}${rivet(1024, 56)}${rivet(56, 1180)}${rivet(1024, 1180)}
<g transform="rotate(-6 240 160)">
<rect x="90" y="95" width="300" height="130" rx="14" fill="#8a5a2b"/>
<rect x="100" y="105" width="280" height="110" rx="10" fill="none" stroke="#f3d9a4" stroke-width="3" stroke-dasharray="10 7"/>
<text x="240" y="165" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="54" fill="#f3d9a4">${esc(brand.short)}</text>
<text x="240" y="198" text-anchor="middle" font-family="${SANS}" font-size="20" letter-spacing="6" fill="#f3d9a4">${esc(brand.sub)}</text>
</g>
<path d="M910 960 C950 900 1000 900 1010 860" stroke="#f3d9a4" stroke-width="4" fill="none"/>
<g transform="translate(820 950) rotate(12)">
<path d="M30 0H150L180 40V240H0V40Z" fill="#f4e7c5" stroke="#c9a24a" stroke-width="3"/>
<circle cx="90" cy="38" r="12" fill="${DENIM}"/>
<text x="90" y="120" text-anchor="middle" font-family="${SANS}" font-weight="800" font-size="46" fill="#c0392b">NEW</text>
<text x="90" y="160" text-anchor="middle" font-family="${SANS}" font-weight="700" font-size="28" fill="#333">ARRIVAL</text>
<line x1="20" y1="180" x2="160" y2="180" stroke="#999" stroke-width="2" stroke-dasharray="6 5"/>
<text x="90" y="216" text-anchor="middle" font-family="${SANS}" font-size="22" letter-spacing="3" fill="#555">DENIM</text>
</g>
<text x="540" y="1290" text-anchor="middle" font-family="${SANS}" font-weight="800" font-size="60" letter-spacing="4" fill="#fff">CASUAL. COOL. ${esc(brand.short)}.</text>
<text x="540" y="1346" text-anchor="middle" font-family="${SANS}" font-size="30" fill="#f3d9a4">#WeekendFits  ·  New Denim Drop</text>`, defs);
}

function magazineFrame() {
  const defs = `${textShadow}
<linearGradient id="gt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.5"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
<linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.65"/></linearGradient>`;
  const r = rng(7);
  let bars = "";
  for (let x = 872; x < 1008; ) {
    const w = 2 + Math.floor(r() * 5);
    bars += `<rect x="${x}" y="1300" width="${w}" height="76" fill="#000"/>`;
    x += w + 2 + Math.floor(r() * 4);
  }
  return svg(`
<rect width="${W}" height="380" fill="url(#gt)"/>
<rect y="1080" width="${W}" height="360" fill="url(#gb)"/>
<g filter="url(#sh)" fill="#fff">
<text x="540" y="70" text-anchor="middle" font-family="${SANS}" font-size="26" letter-spacing="10">THE FESTIVE ISSUE · ${brand.year}</text>
<text x="540" y="268" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="190" textLength="940" lengthAdjust="spacingAndGlyphs">${esc(brand.short)}</text>
<text x="60" y="520" font-family="${SANS}" font-weight="800" font-size="64" fill="#ffd54a">FESTIVE</text>
<text x="60" y="584" font-family="${SANS}" font-weight="800" font-size="64">EDIT ${brand.year}</text>
<text x="60" y="630" font-family="${SANS}" font-size="30">50+ looks for the family</text>
<text x="1020" y="860" text-anchor="end" font-family="${SANS}" font-weight="800" font-size="70">SILK</text>
<text x="1020" y="930" text-anchor="end" font-family="${SANS}" font-weight="800" font-size="70" fill="#ffd54a">SEASON</text>
<text x="1020" y="974" text-anchor="end" font-family="${SANS}" font-size="28">Sarees · Kurtas · Kids</text>
<text x="60" y="1330" font-family="${SANS}" font-weight="800" font-size="52">THE FAMILY STYLE ISSUE</text>
<text x="60" y="1380" font-family="${SERIF}" font-style="italic" font-size="32">by ${esc(brand.name)}</text>
</g>
<circle cx="930" cy="420" r="82" fill="#e53935"/>
<text x="930" y="420" text-anchor="middle" font-family="${SANS}" font-weight="800" font-size="44" fill="#fff">NEW</text>
<text x="930" y="452" text-anchor="middle" font-family="${SANS}" font-weight="700" font-size="20" letter-spacing="2" fill="#fff">IN STORE</text>
<rect x="860" y="1290" width="160" height="116" fill="#fff"/>
${bars}
<text x="940" y="1398" text-anchor="middle" font-family="${SANS}" font-size="14" letter-spacing="3" fill="#000">8 901234 567890</text>`, defs);
}

/* ----------------------------------- Kids frames ----------------------------------- */

const ARCH = "M170 1120V640A370 370 0 0 1 910 640V1120Z";
const FACE: FaceSpot = { cx: 540, cy: 610, rx: 170, ry: 210 };
const insideArch = (x: number, y: number) => x > 150 && x < 930 && y > 250 && y < 1140;

function leaf(x: number, y: number, rot: number, s = 1) {
  let veins = "";
  for (let v = 40; v < 320; v += 40) veins += `<path d="M0 ${-v} L${-40} ${-v + 30} M0 ${-v} L40 ${-v + 30}" stroke="#1d5e27" stroke-width="3"/>`;
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M0 0 C75 -80 75 -240 0 -340 C-75 -240 -75 -80 0 0Z" fill="#2e8b3a"/>${veins}<path d="M0 0V-330" stroke="#1d5e27" stroke-width="6"/></g>`;
}

function pot(x: number, y: number) {
  return `<g transform="translate(${x} ${y})">
<ellipse cx="0" cy="20" rx="115" ry="95" fill="#e0a526" stroke="#9c6b12" stroke-width="5"/>
<rect x="-55" y="-95" width="110" height="40" fill="#e0a526" stroke="#9c6b12" stroke-width="5"/>
<ellipse cx="0" cy="-95" rx="75" ry="18" fill="#f2c14e" stroke="#9c6b12" stroke-width="5"/>
<path d="M-100 0 L-75 30 L-50 0 L-25 30 L0 0 L25 30 L50 0 L75 30 L100 0" stroke="#c62828" stroke-width="7" fill="none"/>
<path d="M-90 -25 H90" stroke="#2e7d32" stroke-width="6"/>
</g>`;
}

function rangoli(x: number, y: number) {
  let s = `<g transform="translate(${x} ${y})">`;
  for (let i = 0; i < 8; i++) s += `<ellipse cx="0" cy="-70" rx="34" ry="52" fill="#3bb3d6" transform="rotate(${i * 45})"/>`;
  for (let i = 0; i < 8; i++) s += `<ellipse cx="0" cy="-42" rx="22" ry="38" fill="#e84a8a" transform="rotate(${i * 45 + 22.5})"/>`;
  return s + `<circle r="26" fill="#fdd835"/><circle r="10" fill="#e65100"/></g>`;
}

function balloon(x: number, y: number, color: string) {
  return `<path d="M${x} ${y + 78} q-18 60 6 120 q20 50 -4 100" stroke="#fff" stroke-width="3" fill="none"/>
<ellipse cx="${x}" cy="${y}" rx="62" ry="78" fill="${color}"/><path d="M${x - 8} ${y + 76} h16 l-8 14 Z" fill="${color}"/>
<ellipse cx="${x - 22}" cy="${y - 30}" rx="12" ry="22" fill="#fff" opacity="0.45" transform="rotate(25 ${x - 22} ${y - 30})"/>`;
}

function star(x: number, y: number, r: number, color: string) {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    d += `${i ? "L" : "M"}${(x + rr * Math.cos(a)).toFixed(1)} ${(y + rr * Math.sin(a)).toFixed(1)}`;
  }
  return `<path d="${d}Z" fill="${color}"/>`;
}

function kidsScene(o: { bg: string; plate: string; subtitle: string; decor: "festive" | "party"; seed: number; body: string }) {
  const defs = `<pattern id="dots" width="44" height="44" patternUnits="userSpaceOnUse"><circle cx="22" cy="22" r="4" fill="#fff" opacity="0.25"/></pattern>`;
  const { cx, cy, rx, ry } = FACE;
  const bx1 = cx - rx - 20, bx2 = cx + rx + 20, by1 = cy - ry - 20, by2 = cy + ry + 20, L = 50;
  const brackets = `<path d="M${bx1} ${by1 + L}V${by1}H${bx1 + L} M${bx2 - L} ${by1}H${bx2}V${by1 + L} M${bx1} ${by2 - L}V${by2}H${bx1 + L} M${bx2 - L} ${by2}H${bx2}V${by2 - L}" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  const decor =
    o.decor === "festive"
      ? `${leaf(120, 1060, -18)}${leaf(70, 1120, -40, 0.85)}${leaf(960, 1060, 18)}${leaf(1010, 1120, 40, 0.85)}${rangoli(150, 1330)}${pot(935, 1320)}`
      : `${balloon(95, 520, "#ff4d6d")}${balloon(990, 470, "#2ec4b6")}${balloon(1000, 820, "#ffd23f")}${balloon(85, 860, "#4cc9f0")}${star(150, 1300, 70, "#ffd23f")}${star(940, 1310, 80, "#ff4d6d")}${star(60, 330, 30, "#fff")}${star(1020, 1130, 34, "#fff")}`;
  return svg(`
<path fill-rule="evenodd" fill="${o.bg}" d="M0 0H${W}V${H}H0Z ${ARCH}"/>
<path fill-rule="evenodd" fill="url(#dots)" d="M0 0H${W}V${H}H0Z ${ARCH}"/>
${confetti(o.seed, 160, ["#e53935", "#1e88e5", "#43a047", "#fff", "#d81b60"], insideArch)}
<path d="${ARCH}" fill="none" stroke="${o.plate}" stroke-width="22"/>
<path d="${ARCH}" fill="none" stroke="${GOLD}" stroke-width="8"/>
${bunting(6, 12, 34, ["#e53935", "#43a047", "#1e88e5", "#fb8c00", "#d81b60", "#8e24aa"])}
${logo(100, 165, 180)}
<rect x="200" y="106" width="680" height="110" rx="18" fill="${o.plate}" stroke="${GOLD}" stroke-width="6"/>
<text x="540" y="182" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="50" fill="#fff" letter-spacing="1">${esc(brand.name.toUpperCase())}</text>
<rect x="290" y="226" width="500" height="46" rx="23" fill="${CREAM}" stroke="${GOLD}" stroke-width="3"/>
<text x="540" y="257" text-anchor="middle" font-family="${SANS}" font-weight="700" font-size="24" letter-spacing="4" fill="${o.plate}">${esc(o.subtitle)}</text>
${decor}
<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${GOLD}" stroke-width="8"/>
<ellipse cx="${cx}" cy="${cy}" rx="${rx - 10}" ry="${ry - 10}" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="10 10" opacity="0.8"/>
${brackets}
${o.body}`, defs);
}

const neck = `<path d="M502 795 H578 V880 H502 Z" fill="${SKIN}"/><path d="M502 800 Q540 830 578 800 V815 Q540 845 502 815 Z" fill="${SKIN_DARK}" opacity="0.5"/>`;
const hand = (x: number, y: number) => `<circle cx="${x}" cy="${y}" r="31" fill="${SKIN}" stroke="${SKIN_DARK}" stroke-width="3"/>`;

function princessBody() {
  const GREEN = "#1f8a4c";
  const SKIRT = "#c2185b";
  // nethi chutti beads along the forehead chain
  let beads = "";
  for (let i = 1; i < 12; i++) {
    const t = i / 12;
    const x = (1 - t) ** 2 * 380 + 2 * t * (1 - t) * 540 + t * t * 700;
    const y = (1 - t) ** 2 * 520 + 2 * t * (1 - t) * 380 + t * t * 520;
    beads += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="${GOLD}" stroke="#b8860b" stroke-width="2"/>`;
  }
  let braid = "";
  for (let i = 0; i < 8; i++) braid += `<ellipse cx="${392 - i * 2}" cy="${880 + i * 38}" rx="26" ry="24" fill="#2a1a12" stroke="#120a06" stroke-width="3"/>`;
  const flowers = [890, 960, 1030].map((y) => `<circle cx="${360}" cy="${y}" r="16" fill="#ff7043"/><circle cx="${360}" cy="${y}" r="6" fill="#ffcc80"/>`).join("");
  let jasmine = "";
  for (let i = 0; i < 7; i++) jasmine += `<circle cx="${418}" cy="${880 + i * 36}" r="9" fill="#fff" stroke="#ddd"/>`;
  let belt = "";
  for (let x = 425; x <= 655; x += 30) belt += `<circle cx="${x}" cy="1024" r="7" fill="#fff59d"/>`;
  const jhumka = (x: number) => `<circle cx="${x}" cy="642" r="10" fill="${GOLD}"/><path d="M${x - 24} 690 Q${x} 640 ${x + 24} 690 Z" fill="${GOLD}" stroke="#b8860b" stroke-width="2"/><circle cx="${x - 14}" cy="698" r="5" fill="${GOLD}"/><circle cx="${x}" cy="700" r="5" fill="#c62828"/><circle cx="${x + 14}" cy="698" r="5" fill="${GOLD}"/>`;
  return `
<path d="M350 600 A190 232 0 0 1 730 600 L712 600 A172 214 0 0 0 368 600 Z" fill="#2a1a12"/>
<path d="M360 540 C330 690 345 800 395 870 L432 870 C392 790 380 680 392 540Z" fill="#2a1a12"/>
<path d="M720 540 C750 690 735 800 685 870 L648 870 C688 790 700 680 688 540Z" fill="#2a1a12"/>
${neck}
<path d="M420 862 Q540 900 660 862 L692 885 L672 1012 L408 1012 L388 885 Z" fill="${GREEN}" stroke="${GOLD}" stroke-width="4"/>
<path d="M345 930 h56 v150 a28 28 0 0 1 -56 0 Z" fill="${SKIN}"/>
<path d="M679 930 h56 v150 a28 28 0 0 1 -56 0 Z" fill="${SKIN}"/>
<rect x="343" y="1040" width="60" height="10" rx="4" fill="${GOLD}"/><rect x="343" y="1054" width="60" height="8" rx="4" fill="#c62828"/>
<rect x="677" y="1040" width="60" height="10" rx="4" fill="${GOLD}"/><rect x="677" y="1054" width="60" height="8" rx="4" fill="#c62828"/>
<ellipse cx="394" cy="905" rx="58" ry="46" fill="${GREEN}" stroke="${GOLD}" stroke-width="5"/>
<ellipse cx="686" cy="905" rx="58" ry="46" fill="${GREEN}" stroke="${GOLD}" stroke-width="5"/>
<path d="M425 868 L495 860 L672 988 L640 1036 Z" fill="#ef6c00" stroke="${GOLD}" stroke-width="6"/>
<path d="M502 860 Q540 925 578 860 Z" fill="${SKIN}"/>
<path d="M482 866 Q540 960 598 866" stroke="${GOLD}" stroke-width="9" fill="none"/>
<path d="M462 868 Q540 1010 618 868" stroke="${GOLD}" stroke-width="6" fill="none" stroke-dasharray="2 10" stroke-linecap="round"/>
<circle cx="540" cy="958" r="15" fill="#c62828" stroke="${GOLD}" stroke-width="5"/>
<path d="M410 1040 L670 1040 L820 1440 L260 1440 Z" fill="${SKIRT}"/>
<path d="M540 1045 V1440 M480 1045 L420 1440 M600 1045 L660 1440" stroke="#8e0f45" stroke-width="5"/>
<path d="M290 1365 L790 1365 L820 1440 L260 1440 Z" fill="${GOLD}"/>
<path d="M285 1402 H795" stroke="${SKIRT}" stroke-width="8" stroke-dasharray="8 14"/>
<rect x="404" y="1004" width="272" height="40" rx="14" fill="${GOLD}" stroke="#b8860b" stroke-width="3"/>
${belt}
<circle cx="540" cy="1024" r="17" fill="#c62828" stroke="#fff59d" stroke-width="4"/>
${hand(373, 1110)}${hand(707, 1110)}
${braid}${jasmine}${flowers}
<path d="M380 520 Q540 380 700 520" stroke="${GOLD}" stroke-width="5" fill="none"/>
${beads}
<path d="M540 450 V478" stroke="${GOLD}" stroke-width="5"/>
<circle cx="540" cy="494" r="16" fill="#c62828" stroke="${GOLD}" stroke-width="5"/>
<circle cx="540" cy="518" r="6" fill="${GOLD}"/>
${jhumka(366)}${jhumka(714)}`;
}

function princeBody() {
  const SILK = "#fff3d6";
  const EDGE = "#d9b56a";
  const buttons = [920, 975, 1030, 1085].map((y) => `<circle cx="540" cy="${y}" r="8" fill="${GOLD}" stroke="#b8860b" stroke-width="2"/>`).join("");
  const sleeve = (x: number) => `<rect x="${x}" y="880" width="72" height="215" rx="32" fill="${SILK}" stroke="${EDGE}" stroke-width="4"/><rect x="${x}" y="1065" width="72" height="18" rx="6" fill="${GOLD}"/>`;
  return `
${neck}
${sleeve(334)}${sleeve(674)}
<path d="M410 860 Q540 885 670 860 L702 900 L692 1185 L388 1185 L378 900 Z" fill="${SILK}" stroke="${EDGE}" stroke-width="4"/>
<path d="M540 885 V1185" stroke="${EDGE}" stroke-width="4"/>
${buttons}
<path d="M488 855 Q540 882 592 855 L592 874 Q540 902 488 874 Z" fill="${GOLD}" stroke="#b8860b" stroke-width="2"/>
<path d="M498 874 Q540 950 582 874" stroke="${GOLD}" stroke-width="5" fill="none"/>
<path d="M412 862 L478 856 L470 1185 L418 1185 Z" fill="#f7e7b4" stroke="${GOLD}" stroke-width="8"/>
<path d="M432 870 L462 868 L456 1180" stroke="${MAROON}" stroke-width="5" fill="none"/>
${hand(370, 1118)}${hand(710, 1118)}
<path d="M388 1185 L692 1185 L722 1440 L358 1440 Z" fill="#fffdf6" stroke="#e0d6b8" stroke-width="3"/>
<rect x="386" y="1172" width="308" height="24" rx="6" fill="#fffdf6" stroke="#e0d6b8" stroke-width="3"/>
<path d="M520 1196 L542 1196 L566 1440 L544 1440 Z" fill="${GOLD}"/>
<path d="M364 1392 L716 1392 L722 1440 L358 1440 Z" fill="${GOLD}"/>
<path d="M366 1414 H716" stroke="${MAROON}" stroke-width="6" stroke-dasharray="10 10"/>`;
}

function superstarBody() {
  const JACKET = "#3b6fb6";
  const STITCH = "#f0a830";
  const sleeve = (x: number) => `<rect x="${x}" y="880" width="74" height="215" rx="32" fill="${JACKET}"/><rect x="${x}" y="1065" width="74" height="22" rx="8" fill="#2c4f86"/>`;
  return `
<g>
<rect x="420" y="380" width="112" height="62" rx="24" fill="#111"/><rect x="548" y="380" width="112" height="62" rx="24" fill="#111"/>
<path d="M532 400 Q540 390 548 400" stroke="#111" stroke-width="8" fill="none"/>
<path d="M440 396 l30 -6 M568 396 l30 -6" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="0.7"/>
</g>
${neck}
${sleeve(332)}${sleeve(674)}
<path d="M410 860 Q540 885 670 860 L700 900 L690 1180 L390 1180 L380 900 Z" fill="#ffd23f"/>
${star(540, 950, 42, "#ff4d6d")}
<text x="540" y="1040" text-anchor="middle" font-family="${SANS}" font-weight="800" font-size="26" fill="#222">${esc(brand.short)}</text>
<text x="540" y="1078" text-anchor="middle" font-family="${SANS}" font-weight="800" font-size="30" letter-spacing="6" fill="#ff4d6d">KIDS</text>
<path d="M410 860 L478 868 L462 1180 L390 1180 L380 900 Z" fill="${JACKET}" stroke="${STITCH}" stroke-width="3" stroke-dasharray="10 6"/>
<path d="M670 860 L602 868 L618 1180 L690 1180 L700 900 Z" fill="${JACKET}" stroke="${STITCH}" stroke-width="3" stroke-dasharray="10 6"/>
<rect x="404" y="960" width="50" height="40" rx="6" fill="#2c4f86" stroke="${STITCH}" stroke-width="3" stroke-dasharray="6 5"/>
<rect x="626" y="960" width="50" height="40" rx="6" fill="#2c4f86" stroke="${STITCH}" stroke-width="3" stroke-dasharray="6 5"/>
${hand(369, 1118)}${hand(711, 1118)}
<path d="M390 1178 L690 1178 L702 1440 L562 1440 L540 1268 L518 1440 L378 1440 Z" fill="#2c4f86"/>
<path d="M398 1196 H682" stroke="${STITCH}" stroke-width="3" stroke-dasharray="10 6"/>
<path d="M540 1196 V1268" stroke="${STITCH}" stroke-width="3" stroke-dasharray="10 6"/>
<rect x="390" y="1178" width="300" height="20" fill="#24406d"/>`;
}

const rawFrames: { id: string; name: string; category: FrameCategory; svg: string; face?: FaceSpot }[] = [
  { id: "festive", name: "Festive Gold", category: "family", svg: festiveFrame() },
  { id: "silk", name: "Silk Saree", category: "family", svg: silkFrame() },
  { id: "wedding", name: "Wedding", category: "family", svg: weddingFrame() },
  { id: "denim", name: "Denim Day", category: "family", svg: denimFrame() },
  { id: "cover", name: "Cover Star", category: "family", svg: magazineFrame() },
  {
    id: "princess", name: "Little Princess", category: "kids", face: FACE,
    svg: kidsScene({ bg: "#f7c531", plate: "#a3161f", subtitle: "KIDS FESTIVE COLLECTION", decor: "festive", seed: 11, body: princessBody() }),
  },
  {
    id: "prince", name: "Little Prince", category: "kids", face: FACE,
    svg: kidsScene({ bg: "#19a7a0", plate: MAROON, subtitle: "PATTU VESHTI COLLECTION", decor: "festive", seed: 23, body: princeBody() }),
  },
  {
    id: "superstar", name: "Superstar", category: "kids", face: FACE,
    svg: kidsScene({ bg: "#6a3de8", plate: "#ff4d6d", subtitle: "KIDS PARTY WEAR", decor: "party", seed: 37, body: superstarBody() }),
  },
];

export const frames: Frame[] = rawFrames.map(({ svg: s, ...f }) => ({ ...f, src: toSrc(s) }));
