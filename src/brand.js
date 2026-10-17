import * as THREE from 'three';

/**
 * Canary Consulting: logos, datos de contacto y rotulación de los vehículos
 * (pegatinas de puerta, lonas de furgoneta y camión, techo y banda trasera).
 * Las texturas se pintan al momento y se repintan cuando terminan de cargar
 * el logo y la tipografía. Los logos son los originales de la marca; el
 * símbolo se recorta del logo claro (es el cuadrado de su izquierda).
 */
export const BRAND = {
  name: 'CANARY CONSULTING',
  tagline: 'ENERGÍA · CANARIAS',
  slogan: 'Ahorra en tu factura de la luz y el gas',
  services: 'Potencia y peajes · Revisión de contratos · Comparativas · Placas solares',
  phone: '620 983 685',
  tel: '+34620983685',
  web: 'canaryislandconsulting.es',
  url: 'https://canaryislandconsulting.es',
  email: 'info@canaryislandconsulting.es',
  person: 'José Manuel Pérez Cabrera',
};

// colores de la marca (los del logo)
export const C = {
  ink: '#0e1116', cream: '#f3efe6', yellow: '#e8a026', rust: '#b9561f', teal: '#11555e', olive: '#6e8a55',
};
const FONT = '"Barlow Condensed", "Arial Narrow", Arial, sans-serif';

// ── logo y tipografía ──
const base = import.meta.env.BASE_URL || './';
const loadImg = (src) => new Promise((res) => {
  const im = new Image();
  im.onload = () => res(im);
  im.onerror = () => res(null);
  im.src = base + src;
});
const LOGO = { dark: null, light: null };
const live = []; // texturas que se repintan cuando llega el logo
let isReady = false;
const ready = Promise.all([
  loadImg('brand/logo-oscuro.png'), loadImg('brand/logo-claro.png'),
  (document.fonts?.load ? Promise.all([
    document.fonts.load(`800 60px ${FONT}`), document.fonts.load(`600 40px ${FONT}`),
  ]).catch(() => null) : Promise.resolve()),
]).then(([dark, light]) => {
  Object.assign(LOGO, { dark, light });
  isReady = true;
  for (const t of live) { t.paint(); t.tex.needsUpdate = true; }
});
export const brandReady = ready;

/** los logos vienen a 2400 px: al reducirlos tanto hace falta el filtrado bueno */
function drawImg(ctx, img, ...args) {
  const q = ctx.imageSmoothingQuality;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, ...args);
  ctx.imageSmoothingQuality = q;
}

/** el símbolo: anillo con el degradado de la marca y el sol amarillo en medio */
export function drawSymbol(ctx, cx, cy, r) {
  const im = LOGO.light;
  if (im) { drawImg(ctx, im, 0, 0, im.height, im.height, cx - r, cy - r, r * 2, r * 2); return; }
  let g;
  if (ctx.createConicGradient) {
    g = ctx.createConicGradient(-Math.PI / 2, cx, cy);
    [[0, C.yellow], [0.18, '#d7832a'], [0.3, C.rust], [0.55, '#4f5a4a'], [0.68, C.teal], [0.85, C.olive], [1, C.yellow]]
      .forEach(([t, c]) => g.addColorStop(t, c));
  } else {
    g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    g.addColorStop(0, C.yellow); g.addColorStop(0.5, C.rust); g.addColorStop(1, C.teal);
  }
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.yellow;
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.42, 0, Math.PI * 2); ctx.fill();
}

/** logo completo (símbolo + CANARY CONSULTING + ENERGÍA · CANARIAS), con o sin imagen */
function drawLogo(ctx, x, y, w, onDark) {
  const img = onDark ? LOGO.dark : LOGO.light;
  if (img) {
    const h = w * img.height / img.width;
    drawImg(ctx, img, x, y, w, h);
    return h;
  }
  const h = w * 0.21;
  drawSymbol(ctx, x + h * 0.5, y + h * 0.5, h * 0.48);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.fillStyle = onDark ? C.cream : C.ink;
  ctx.font = `800 ${Math.round(h * 0.6)}px ${FONT}`;
  ctx.fillText(BRAND.name, x + h * 1.2, y + h * 0.62, w - h * 1.25);
  ctx.fillStyle = onDark ? C.yellow : C.rust;
  ctx.font = `600 ${Math.round(h * 0.22)}px ${FONT}`;
  ctx.fillText(BRAND.tagline.split('').join(' '), x + h * 1.22, y + h * 0.95, w - h * 1.25);
  return h;
}

function rounded(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
}
/** franja con los colores de la marca */
function stripe(ctx, x, y, w, h) {
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, C.yellow); g.addColorStop(0.35, C.rust); g.addColorStop(0.7, C.teal); g.addColorStop(1, C.olive);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}
function text(ctx, s, x, y, size, color, weight = 800, align = 'center', maxW) {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y, maxW);
}

// ── los rótulos ──
const PAINT = {
  // pegatina de puerta para cualquier coche (oscura: se lee sobre cualquier color)
  door: [1024, 256, (ctx, W, H) => {
    ctx.fillStyle = C.ink;
    rounded(ctx, 2, 2, W - 4, H - 4, 26);
    ctx.fill();
    const lw = 700;
    drawLogo(ctx, (W - lw) / 2, 12, lw, true);
    stripe(ctx, 40, 182, W - 80, 6);
    text(ctx, `${BRAND.phone}  ·  ${BRAND.web}`, W / 2, 222, 52, C.yellow, 800, 'center', W - 60);
  }],
  // lona de furgoneta sobre chapa clara (sin fondo: se ve la pintura)
  cargoLight: [1024, 400, (ctx, W, H) => {
    drawLogo(ctx, 40, 18, W - 80, false);
    text(ctx, BRAND.slogan, W / 2, 248, 62, C.ink, 800, 'center', W - 60);
    text(ctx, `☎ ${BRAND.phone}  ·  ${BRAND.web}`, W / 2, 318, 52, C.rust, 800, 'center', W - 60);
    stripe(ctx, 0, 364, W, 22);
  }],
  // la misma lona sobre chapa oscura o de color
  cargoDark: [1024, 400, (ctx, W, H) => {
    ctx.fillStyle = C.ink;
    rounded(ctx, 2, 2, W - 4, H - 4, 30);
    ctx.fill();
    drawLogo(ctx, 40, 18, W - 80, true);
    text(ctx, BRAND.slogan, W / 2, 248, 62, C.cream, 800, 'center', W - 60);
    text(ctx, `☎ ${BRAND.phone}  ·  ${BRAND.web}`, W / 2, 318, 52, C.yellow, 800, 'center', W - 60);
    stripe(ctx, 30, 362, W - 60, 16);
  }],
  // caja del camión: todo el costado
  truck: [1024, 512, (ctx, W, H) => {
    stripe(ctx, 0, 0, W, 18);
    drawLogo(ctx, 36, 44, W - 72, false);
    text(ctx, BRAND.slogan, W / 2, 300, 66, C.ink, 800, 'center', W - 50);
    text(ctx, BRAND.services, W / 2, 352, 34, C.ink, 600, 'center', W - 50);
    text(ctx, `☎ ${BRAND.phone}`, W / 2, 414, 64, C.rust, 800, 'center', W - 50);
    text(ctx, `${BRAND.web}  ·  ${BRAND.email}`, W / 2, 466, 36, C.teal, 800, 'center', W - 50);
    stripe(ctx, 0, H - 22, W, 22);
  }],
  // puertas traseras de la caja del camión
  truckRear: [512, 512, (ctx, W, H) => {
    ctx.fillStyle = '#f4f4f2';
    ctx.fillRect(0, 0, W, H);
    // junta de las dos hojas y sus cierres, sin tapar el rótulo
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(W / 2 - 2, 0, 4, H);
    ctx.fillStyle = '#3a3e44';
    for (const x of [W / 2 - 22, W / 2 + 16]) ctx.fillRect(x, 452, 6, 30);
    drawSymbol(ctx, W / 2, 150, 92);
    text(ctx, BRAND.name, W / 2, 285, 58, C.ink, 800, 'center', W - 40);
    text(ctx, `☎ ${BRAND.phone}`, W / 2, 350, 56, C.rust, 800, 'center', W - 40);
    text(ctx, BRAND.web, W / 2, 405, 38, C.teal, 800, 'center', W - 40);
    stripe(ctx, 0, H - 24, W, 24);
  }],
  // techo: el símbolo y la web, para leer desde detrás
  roof: [512, 512, (ctx, W, H) => {
    drawSymbol(ctx, W / 2, 210, 170);
    ctx.fillStyle = 'rgba(14,17,22,0.85)';
    rounded(ctx, 40, 400, W - 80, 80, 20);
    ctx.fill();
    text(ctx, BRAND.web, W / 2, 441, 40, C.yellow, 800, 'center', W - 100);
  }],
};

const cache = new Map();
/** textura de un rótulo (se repinta sola cuando llega el logo) */
export function brandTexture(kind) {
  if (cache.has(kind)) return cache.get(kind);
  const [W, H, fn] = PAINT[kind];
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const paint = () => { ctx.clearRect(0, 0, W, H); fn(ctx, W, H); };
  paint();
  if (!isReady) live.push({ tex, paint });
  cache.set(kind, tex);
  return tex;
}

const mats = new Map();
/** material de pegatina: transparente, sin pelearse con la chapa */
export function brandMaterial(kind) {
  if (mats.has(kind)) return mats.get(kind);
  const m = new THREE.MeshStandardMaterial({
    map: brandTexture(kind), transparent: true, alphaTest: 0.02, roughness: 0.42, metalness: 0.05,
    polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, depthWrite: false,
  });
  mats.set(kind, m);
  return m;
}

/** banda trasera de los coches rotulados (se dibuja en la trasera de cada modelo) */
export function drawRearBanner(ctx, X, Y, PX, cx, cy, halfW) {
  const h = 0.13, w = Math.min(halfW * 2 - 0.2, 1.2);
  const x0 = cx - w / 2;
  ctx.fillStyle = C.ink;
  rounded(ctx, X(x0), Y(cy + h / 2), w * PX, h * PX, 0.03 * PX);
  ctx.fill();
  drawSymbol(ctx, X(x0 + 0.075), Y(cy), 0.05 * PX);
  text(ctx, BRAND.name, X(x0 + 0.14), Y(cy + 0.027), Math.round(0.052 * PX), C.cream, 800, 'left', (w - 0.18) * PX);
  text(ctx, `${BRAND.phone} · ${BRAND.web}`, X(x0 + 0.14), Y(cy - 0.033), Math.round(0.036 * PX), C.yellow, 800, 'left', (w - 0.18) * PX);
}
