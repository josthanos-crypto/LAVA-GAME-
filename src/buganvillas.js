import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Kit, canvasTex, glowMaterial } from './interiorKit.js';
import { windowGlow } from './realism.js';
import { makeCar } from './carModels.js';
import { fit, SANS, SERIF } from './localesCommon.js';
import { findBuilding } from './civic.js';

/**
 * Centro Comercial Buganvillas por fuera (Manolo Millares 106, Arrecife), como en las
 * fotos de calle: el bloque entero, con sus cuatro caras.
 *
 *  · Manolo Millares (sur): desde la esquina de Fenauso, el buffet Sakura V con su
 *    toldo granate, la entrada del centro con el letrero amarillo, las persianas
 *    metálicas y el tramo del TEPPANYAKI hacia Peñas del Chache.
 *  · La esquina de Fenauso (suroeste): el chaflán con el ventanal corrido del WOK
 *    encima y las letras rojas en el pretil, como en la foto de la calle.
 *  · Peñas del Chache (este): la tapia blanca con el zócalo verde, el anagrama del centro
 *    y la tienda Smile; casi todo muro ciego, que es lo que hay detrás de los salones.
 *  · Aniagua (norte): el Kassino con su mural de neones azules y el BINGO, el cartel de
 *    area fit en el cajón negro de arriba, la zona de contenedores y el muelle de carga.
 *  · Fenauso (oeste): la trasera del centro, con «CENTRO COMERCIAL» pintado en verde,
 *    los dos muelles de carga con sus flechas amarillas, cámaras y bolardos.
 *
 * Y alrededor: el parque-jardín de Aniagua con sus parterres de flamboyanes, su acera de losas
 * y su parque infantil, La Madrileña al otro lado de Peñas del Chache y los toldos de las
 * tiendas de enfrente de Manolo Millares.
 *
 * La esquina suroeste del polígono de OSM (Fenauso × Manolo Millares) se achaflana en
 * tuneBuganvillas(), que corre antes de levantar la ciudad, para que el WOK mire al
 * cruce de verdad.
 */

// ── el bloque (polígono de OSM: Manolo Millares 106) ──
const SE = [-650.8, 348.7];    // esquina Manolo Millares × Peñas del Chache
const SW = [-686.4, 351.6];    // esquina Fenauso × Manolo Millares
const NW = [-691.9, 280.9];    // esquina Fenauso × Aniagua
const NE = [-656.4, 278.1];    // esquina Aniagua × Peñas del Chache
const CH = 6.0;                // corte de la esquina de Fenauso
const CH_E = 4.5;              // corte de la esquina de Peñas del Chache

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const addv = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const vlen = (a) => Math.hypot(a[0], a[1]) || 1;
const unit = (a) => mul(a, 1 / vlen(a));

const U_S = unit(sub(SW, SE));           // sur, de este a oeste
const U_E = unit(sub(NE, SE));           // este, de sur a norte
const PE = addv(SE, mul(U_E, CH_E));     // el chaflán arranca a CH_E de Peñas del Chache
const PSE = addv(SE, mul(U_S, CH_E));    // y a CH_E por Manolo Millares, hacia el este
const PSW = addv(SW, mul(unit(sub(SE, SW)), CH));   // y a CH de la esquina, en Manolo Millares
const PEW = addv(SW, mul(unit(sub(NW, SW)), CH));   // y en Fenauso
const U_C = unit(sub(PSW, PEW));         // el chaflán del WOK (Fenauso)
const U_CE = unit(sub(PE, PSE));         // el chaflán de Peñas del Chache

const side = (o, u, l) => ({ o, u, n: [-u[1], u[0]], L: l });
const SIDES = {
  south: side(PSW, unit(sub(PSE, PSW)), vlen(sub(PSE, PSW))),
  chamfer: side(PEW, U_C, vlen(sub(PSW, PEW))),
  chamferSE: side(PSE, U_CE, vlen(sub(PE, PSE))),
  east: side(PE, U_E, vlen(sub(NE, PE))),
  north: side(NE, unit(sub(NW, NE)), vlen(sub(NW, NE))),
  west: side(NW, unit(sub(PEW, NW)), vlen(sub(PEW, NW))),
};
/** punto de una fachada en coordenadas del mundo: x a lo largo, z hacia fuera */
const at = (s, x, z) => [s.o[0] + s.u[0] * x + s.n[0] * z, s.o[1] + s.u[1] * x + s.n[1] * z];

const WALL_H = 6.2;
const WHITE = 0xf2efe7, WHITE2 = 0xe8e4da, GREEN = 0x1c6a4e, GREEN_DK = 0x114634;
const DARK = 0x23272b, BLACK = 0x111214, RED = 0xa8232c, YELLOW = 0xf2c218;
const GLASS = 0x1c2833, FRAME = 0x2b3138, STEEL = 0x9aa1a8;

// ── lienzos ──

const T = (w, h, f) => canvasTex(w, h, f);
const texCache = new Map();
/** el mismo lienzo para todas las ventanas: una textura compartida */
const cached = (key, w, h, f) => {
  if (!texCache.has(key)) texCache.set(key, T(w, h, f));
  return texCache.get(key);
};
const hex = (n) => '#' + n.toString(16).padStart(6, '0');

function txt(g, text, x, y, maxW, size, color, weight = '800', family = SANS, style = '') {
  g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
  fit(g, text, x, y, maxW, size, weight, family, style);
}

/** letras separadas (C I N T A, T E P P A N Y A K I) */
const spaced = (s) => s.split('').join(' ');

/** el cartel negro del tejado de Peñas del Chache: WOK en rojo y CINTA en blanco */
function wokCinta(g, W, H) {
  g.fillStyle = '#141416'; g.fillRect(0, 0, W, H);
  g.save();
  g.shadowColor = 'rgba(226,58,38,.55)'; g.shadowBlur = H * 0.1;
  txt(g, 'WOK', W / 2, H * 0.42, W * 0.66, H * 0.5, '#e23a26', '900', SANS);
  g.restore();
  txt(g, spaced('CINTA'), W / 2, H * 0.79, W * 0.42, H * 0.15, '#ffffff', '700', SANS);
}

/** las letras rojas del WOK pintadas en el pretil blanco de la esquina */
function wokLetters(g, W, H) {
  g.fillStyle = hex(WHITE); g.fillRect(0, 0, W, H);
  g.save();
  g.shadowColor = 'rgba(150,18,14,.5)'; g.shadowBlur = H * 0.14;
  txt(g, 'WOK', W / 2, H * 0.44, W * 0.66, H * 0.66, '#d0201c', '900', SANS);
  g.restore();
  txt(g, spaced('CINTA'), W / 2, H * 0.86, W * 0.24, H * 0.13, '#8a1a16', '700', SANS);
}

function sakuraBand(g, W, H) {
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#7d2024'); bg.addColorStop(0.55, '#641519'); bg.addColorStop(1, '#4a0e12');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#d8b268'; g.lineWidth = Math.max(4, H * 0.045);
  g.strokeRect(H * 0.05, H * 0.07, W - H * 0.1, H * 0.86);
  // fotos de comida a los lados (sushi y wok)
  const dish = (cx, cy, r, kind) => {
    g.fillStyle = '#1b1410';
    g.beginPath(); g.ellipse(cx, cy, r, r * 0.62, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = kind ? '#c8542a' : '#f0e6d2';
    g.beginPath(); g.ellipse(cx, cy - r * 0.1, r * 0.86, r * 0.46, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = kind ? '#e8a040' : '#d84a3a';
    for (let i = 0; i < 6; i++) {
      g.beginPath();
      g.arc(cx - r * 0.5 + (i % 3) * r * 0.5, cy - r * 0.18 + Math.floor(i / 3) * r * 0.3, r * 0.15, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = '#7ac043';
    g.beginPath(); g.arc(cx + r * 0.45, cy - r * 0.3, r * 0.13, 0, Math.PI * 2); g.fill();
  };
  for (let i = 0; i < 3; i++) dish(H * (0.7 + i * 0.62), H * 0.5, H * 0.3, i === 1);
  for (let i = 0; i < 3; i++) dish(W - H * (0.7 + i * 0.62), H * 0.5, H * 0.3, i === 0);
  txt(g, 'SAKURA V · BUFFET LIBRE', W / 2, H * 0.52, W * 0.62, H * 0.42, '#f6ead2', '700', SERIF);
}

function ccYellow(g, W, H) {
  g.fillStyle = '#101113'; g.fillRect(0, 0, W, H);
  g.strokeStyle = hex(YELLOW); g.lineWidth = Math.max(4, H * 0.06);
  g.strokeRect(H * 0.05, H * 0.08, W - H * 0.1, H * 0.84);
  txt(g, 'CENTRO COMERCIAL BUGANVILLAS', W / 2, H * 0.52, W * 0.9, H * 0.56, hex(YELLOW), '900', SANS);
}

function localDisponible(g, W, H) {
  g.fillStyle = '#d11f28'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#ffffff';
  txt(g, 'LOCAL DISPONIBLE', W / 2, H * 0.2, W * 0.9, H * 0.24, '#ffffff', '800', SANS);
  txt(g, '620 176 462', W / 2, H * 0.5, W * 0.72, H * 0.3, '#ffffff', '900', SANS);
  txt(g, 'www.inmogestioncanarias.com', W / 2, H * 0.75, W * 0.8, H * 0.12, '#ffe6e6', '600', SANS);
  // el marco blanco de la lona
  g.strokeStyle = '#f6f2ea'; g.lineWidth = H * 0.05; g.strokeRect(H * 0.06, H * 0.06, W - H * 0.12, H * 0.88);
}

/** cristal de un escaparate con la sala iluminada dentro */
function shopGlass(kind = 'food') {
  return (g, W, H) => {
    const bg = g.createLinearGradient(0, 0, 0, H);
    if (kind === 'food') { bg.addColorStop(0, '#3a2118'); bg.addColorStop(0.6, '#5a3322'); bg.addColorStop(1, '#24140f'); }
    else { bg.addColorStop(0, '#2b343c'); bg.addColorStop(1, '#161d24'); }
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    // lámparas colgando
    for (const fx of [0.22, 0.5, 0.78]) {
      g.strokeStyle = '#1a120c'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(W * fx, 0); g.lineTo(W * fx, H * 0.12); g.stroke();
      const lg = g.createRadialGradient(W * fx, H * 0.2, 2, W * fx, H * 0.2, W * 0.12);
      lg.addColorStop(0, 'rgba(255,226,170,.95)'); lg.addColorStop(1, 'rgba(255,190,110,0)');
      g.fillStyle = lg; g.fillRect(W * (fx - 0.14), H * 0.05, W * 0.28, H * 0.35);
      g.fillStyle = '#c9a36a';
      g.beginPath(); g.ellipse(W * fx, H * 0.18, W * 0.05, H * 0.045, 0, Math.PI, 0); g.fill();
    }
    if (kind === 'food') {
      // barra del buffet con bandejas
      g.fillStyle = '#2a1a12'; g.fillRect(0, H * 0.62, W, H * 0.2);
      g.fillStyle = '#9aa1a8'; g.fillRect(0, H * 0.6, W, H * 0.04);
      for (let i = 0; i < 7; i++) {
        g.fillStyle = ['#f2c05a', '#d84a2a', '#7ac043', '#f0e6d2', '#c8642a'][i % 5];
        g.fillRect(W * 0.04 + i * W * 0.14, H * 0.55, W * 0.11, H * 0.07);
      }
      // mesa de la entrada
      g.fillStyle = '#e8e0d0'; g.fillRect(W * 0.08, H * 0.86, W * 0.25, H * 0.02);
    } else {
      for (let i = 0; i < 4; i++) {
        g.fillStyle = '#2a323a'; g.fillRect(W * 0.08 + i * W * 0.22, H * 0.35, W * 0.14, H * 0.45);
        for (let r = 0; r < 4; r++) {
          g.fillStyle = ['#e8c46a', '#dfe8ee', '#18c5b8', '#e84a6a'][(i + r) % 4];
          g.fillRect(W * 0.1 + i * W * 0.22, H * (0.4 + r * 0.09), W * 0.1, H * 0.03);
        }
      }
    }
    // reflejo del cristal
    const refl = g.createLinearGradient(0, 0, W, H);
    refl.addColorStop(0, 'rgba(190,220,240,.16)'); refl.addColorStop(0.45, 'rgba(190,220,240,0)');
    refl.addColorStop(1, 'rgba(190,220,240,.1)');
    g.fillStyle = refl; g.fillRect(0, 0, W, H);
  };
}

/** el hueco de la esquina: cristal oscuro con el pasillo encendido detrás */
function cornerEntry(g, W, H) {
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#101a22'); bg.addColorStop(0.5, '#16222b'); bg.addColorStop(1, '#0b1218');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  // la luz cálida del pasillo, al fondo
  const warm = g.createRadialGradient(W * 0.5, H * 0.56, W * 0.02, W * 0.5, H * 0.56, W * 0.44);
  warm.addColorStop(0, 'rgba(255,226,180,.55)'); warm.addColorStop(1, 'rgba(255,200,140,0)');
  g.fillStyle = warm; g.fillRect(0, 0, W, H);
  // techo, suelo y el marco de la puerta
  g.fillStyle = 'rgba(238,233,222,.16)'; g.fillRect(0, 0, W, H * 0.09);
  g.fillStyle = 'rgba(206,200,190,.14)'; g.fillRect(0, H * 0.88, W, H * 0.12);
  g.fillStyle = 'rgba(20,26,32,.55)';
  for (const fx of [0.33, 0.5, 0.67]) g.fillRect(W * fx - W * 0.006, 0, W * 0.012, H);
  // reflejo del cristal
  const refl = g.createLinearGradient(0, 0, W, H);
  refl.addColorStop(0, 'rgba(185,215,240,.26)'); refl.addColorStop(0.45, 'rgba(185,215,240,0)');
  refl.addColorStop(1, 'rgba(185,215,240,.14)');
  g.fillStyle = refl; g.fillRect(0, 0, W, H);
}

/** el zaguán del centro: terrazo, claraboya y el pasillo con las tiendas al fondo */
function mallLobby(g, W, H) {
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#f6f2e8'); bg.addColorStop(0.6, '#e8e2d6'); bg.addColorStop(1, '#cfc8ba');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  // suelo de terrazo en fuga
  g.fillStyle = '#d8d2c6';
  g.beginPath(); g.moveTo(0, H); g.lineTo(W, H); g.lineTo(W * 0.72, H * 0.62); g.lineTo(W * 0.28, H * 0.62);
  g.closePath(); g.fill();
  g.strokeStyle = 'rgba(120,112,100,.35)'; g.lineWidth = 2;
  for (let i = 1; i < 5; i++) {
    const t = i / 5;
    g.beginPath(); g.moveTo(W * t, H); g.lineTo(W * (0.28 + 0.44 * t), H * 0.62); g.stroke();
  }
  // techo con claraboya
  g.fillStyle = '#f8f6f0'; g.beginPath(); g.moveTo(0, 0); g.lineTo(W, 0); g.lineTo(W * 0.72, H * 0.2); g.lineTo(W * 0.28, H * 0.2); g.closePath(); g.fill();
  const sky = g.createLinearGradient(0, 0, 0, H * 0.2);
  sky.addColorStop(0, '#cfe8ff'); sky.addColorStop(1, '#eef8ff');
  g.fillStyle = sky; g.fillRect(W * 0.3, H * 0.03, W * 0.4, H * 0.13);
  // el pasillo con escaparates a los lados
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const x0 = side < 0 ? W * (0.08 + i * 0.06) : W * (0.68 + i * 0.08);
      const w = W * 0.1;
      g.fillStyle = '#2a2f36'; g.fillRect(x0, H * (0.25 + i * 0.02), w, H * 0.3);
      g.fillStyle = ['#e8c46a', '#18c5b8', '#e84a6a', '#7ac043'][(i + (side > 0 ? 1 : 0)) % 4];
      g.fillRect(x0 + 4, H * (0.27 + i * 0.02), w - 8, H * 0.12);
    }
  }
  // jardineras y el directorio
  for (const fx of [0.3, 0.7]) {
    g.fillStyle = '#8a8f96'; g.fillRect(W * fx - W * 0.05, H * 0.6, W * 0.1, H * 0.16);
    g.fillStyle = '#2f6b3a'; g.beginPath(); g.arc(W * fx, H * 0.56, W * 0.06, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = '#1e3a5a'; g.fillRect(W * 0.45, H * 0.3, W * 0.1, H * 0.2);
  // reflejo del cristal
  const refl = g.createLinearGradient(0, 0, W, H);
  refl.addColorStop(0, 'rgba(200,225,245,.22)'); refl.addColorStop(0.5, 'rgba(200,225,245,0)');
  refl.addColorStop(1, 'rgba(200,225,245,.12)');
  g.fillStyle = refl; g.fillRect(0, 0, W, H);
}

function shutterPanel(g, W, H) {
  g.fillStyle = '#7c8288'; g.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += Math.max(6, H / 34)) {
    g.fillStyle = 'rgba(255,255,255,.16)'; g.fillRect(0, y, W, 1.5);
    g.fillStyle = 'rgba(26,30,34,.38)'; g.fillRect(0, y + 2, W, 2.4);
  }
  // guías y suelo
  g.fillStyle = '#5d646b'; g.fillRect(0, 0, W * 0.02, H); g.fillRect(W * 0.98, 0, W * 0.02, H);
  g.fillStyle = 'rgba(20,24,26,.35)'; g.fillRect(0, H * 0.94, W, H * 0.06);
  // mugre y algún grafiti suave
  for (let i = 0; i < 40; i++) {
    g.fillStyle = `rgba(60,55,45,${0.03 + Math.random() * 0.05})`;
    g.fillRect(Math.random() * W, H * (0.6 + Math.random() * 0.4), 2 + Math.random() * 20, 2 + Math.random() * 30);
  }
}

/** una ventana encendida de arriba: cortina, lámpara y el cuarto al fondo */
function litWindow(g, W, H) {
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#3a2c20'); bg.addColorStop(0.6, '#5a4430'); bg.addColorStop(1, '#241a12');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const lamp = g.createRadialGradient(W * 0.75, H * 0.3, 2, W * 0.75, H * 0.3, W * 0.5);
  lamp.addColorStop(0, 'rgba(255,226,170,.7)'); lamp.addColorStop(1, 'rgba(255,200,120,0)');
  g.fillStyle = lamp; g.fillRect(0, 0, W, H);
  // cortina corrida a un lado
  g.fillStyle = 'rgba(230,220,200,.75)';
  g.beginPath(); g.moveTo(0, 0); g.lineTo(W * 0.26, 0);
  for (let i = 0; i <= 8; i++) g.lineTo(W * (0.26 - i * 0.008), H * (i / 8));
  g.lineTo(0, H); g.closePath(); g.fill();
  // el hueco oscuro de la habitación
  g.fillStyle = 'rgba(20,14,10,.35)'; g.fillRect(W * 0.3, H * 0.1, W * 0.4, H * 0.8);
  g.fillStyle = 'rgba(200,220,235,.12)'; g.fillRect(0, 0, W, H * 0.12);
}

/** cristal que refleja el cielo, para las ventanas de arriba */
function skyGlass(g, W, H) {
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#9dc0d8'); bg.addColorStop(0.45, '#6d8ea6'); bg.addColorStop(1, '#3a4b58');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  // reflejo diagonal y el interior oscuro del marco
  g.fillStyle = 'rgba(255,255,255,.18)';
  g.beginPath(); g.moveTo(0, H * 0.15); g.lineTo(W * 0.55, 0); g.lineTo(W, 0); g.lineTo(W * 0.3, H); g.lineTo(0, H);
  g.closePath(); g.fill();
  g.fillStyle = 'rgba(18,26,32,.35)'; g.fillRect(0, H * 0.82, W, H * 0.18);
  for (let i = 0; i < 5; i++) {
    g.fillStyle = `rgba(30,40,46,${0.1 + i * 0.02})`;
    g.fillRect(0, H * (0.1 + i * 0.17), W, 2);
  }
}

function teppanBand(g, W, H) {
  g.fillStyle = '#1b1d21'; g.fillRect(0, 0, W, H);
  txt(g, 'RESTAURANTE JAPONES SAKURA.V', W * 0.36, H * 0.5, W * 0.62, H * 0.42, '#f3efe6', '700', SANS);
  g.fillStyle = 'rgba(255,255,255,.18)';
  g.fillRect(W * 0.665, H * 0.2, 2, H * 0.6);
  txt(g, spaced('TEPPANYAKI'), W * 0.84, H * 0.5, W * 0.28, H * 0.4, '#f3efe6', '700', SANS);
}

const ccWall = (g, W, H) => {
  g.fillStyle = hex(WHITE); g.fillRect(0, 0, W, H);
  const cx = H * 0.55, cy = H * 0.5, r = H * 0.36;
  g.fillStyle = '#1b4ea8';
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#ffffff';
  // la personita del anagrama
  g.beginPath(); g.arc(cx, cy - r * 0.38, r * 0.16, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.moveTo(cx - r * 0.34, cy + r * 0.45); g.lineTo(cx, cy - r * 0.08); g.lineTo(cx + r * 0.34, cy + r * 0.45); g.fill();
  txt(g, 'CENTRO COMERCIAL', cx + r + (W - cx - r) / 2, cy * 1.02, W - cx - r * 1.4, H * 0.42, '#1b5e46', '800', SANS);
};

const ccLetters = (g, W, H) => {
  g.fillStyle = hex(WHITE); g.fillRect(0, 0, W, H);
  txt(g, 'CENTRO COMERCIAL', W * 0.5, H * 0.46, W * 0.86, H * 0.6, '#12523c', '900', SANS);
  g.fillStyle = '#12523c';
  const cy = H * 0.82, x0 = W * 0.32, x1 = W * 0.68;
  g.beginPath(); g.moveTo(x0, cy - H * 0.05); g.lineTo(x1 - H * 0.14, cy - H * 0.05);
  g.lineTo(x1, cy); g.lineTo(x1 - H * 0.14, cy + H * 0.05); g.lineTo(x0, cy + H * 0.05);
  g.closePath(); g.fill();
};

function neonMural(g, W, H) {
  const bg = g.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0d1450'); bg.addColorStop(0.45, '#1b1f6e'); bg.addColorStop(1, '#2a1550');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  // rayos en zigzag, como el mural del bingo
  const n = 12;
  for (let i = 0; i < n; i++) {
    const x = (i / n) * W + W * 0.01;
    const w = W / n * 0.85;
    const grad = g.createLinearGradient(x, 0, x + w, H);
    grad.addColorStop(0, i % 2 ? '#8a2ad8' : '#2a7ad8');
    grad.addColorStop(0.5, i % 2 ? '#ff4fb0' : '#4fd0ff');
    grad.addColorStop(1, '#1a1a6a');
    g.strokeStyle = grad;
    g.lineWidth = W / n * 0.09;
    g.save();
    g.shadowColor = i % 2 ? '#ff4fb0' : '#4fd0ff';
    g.shadowBlur = H * 0.05;
    g.beginPath();
    g.moveTo(x, H * 0.98);
    g.lineTo(x + w * 0.75, H * 0.5);
    g.lineTo(x + w * 0.12, H * 0.06);
    g.stroke();
    g.restore();
  }
  // BINGO en letras grandes de bombillas (rojo de feria sobre el azul)
  g.save();
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `900 ${Math.round(H * 0.6)}px ${SANS}`;
  g.lineWidth = H * 0.03; g.strokeStyle = '#120a2a';
  g.strokeText('BINGO', W * 0.5, H * 0.52);
  g.shadowColor = '#ff3a4a'; g.shadowBlur = H * 0.12;
  g.fillStyle = '#d8243a';
  g.fillText('BINGO', W * 0.5, H * 0.52);
  g.restore();
  // bombillas alrededor de las letras
  g.fillStyle = '#ffe8c8';
  const bs = H * 0.022;
  for (let i = 0; i < 44; i++) {
    const t = i / 43;
    const bx = W * 0.22 + t * W * 0.56, by = H * 0.5 + Math.sin(t * Math.PI * 8) * H * 0.24;
    g.beginPath(); g.arc(bx, by, bs, 0, Math.PI * 2); g.fill();
  }
  txt(g, 'SALÓN RECREATIVO · BINGO', W * 0.5, H * 0.92, W * 0.5, H * 0.07, '#e8d8ff', '700', SANS);
}

function kassinoSign(g, W, H) {
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#2a4ad8'); bg.addColorStop(1, '#1a2a9a');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = H * 0.04;
  g.strokeRect(H * 0.05, H * 0.06, W - H * 0.1, H * 0.88);
  g.save();
  g.shadowColor = '#ff4a2a'; g.shadowBlur = H * 0.16;
  txt(g, 'KASSINO', W / 2, H * 0.52, W * 0.86, H * 0.66, '#ef3a2a', '900', SANS);
  g.restore();
}

function areaFit(g, W, H) {
  g.fillStyle = '#101216'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#2a7ad8';
  g.beginPath(); g.arc(H * 0.4, H * 0.42, H * 0.26, 0, Math.PI * 2); g.fill();
  txt(g, 'area', H * 0.4, H * 0.42, H * 0.36, H * 0.2, '#ffffff', '700', SANS);
  txt(g, 'fit', H * 1.0, H * 0.42, H * 0.36, H * 0.2, '#4fd0ff', '700', SANS);
  txt(g, 'Más que un gimnasio', W * 0.62, H * 0.82, W * 0.6, H * 0.16, '#dfe8ee', '600', SANS);
}

function smileSign(g, W, H) {
  g.fillStyle = '#12523c'; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#7ac043'; g.lineWidth = H * 0.06; g.strokeRect(H * 0.05, H * 0.06, W - H * 0.1, H * 0.88);
  txt(g, 'Smile', W / 2, H * 0.55, W * 0.7, H * 0.6, '#ffffff', '700', SERIF, 'italic');
}

/** el rótulo rojo de La Madrileña, con el nombre en cursiva y el filete blanco */
function madrilena(g, W, H) {
  g.fillStyle = '#c1121f'; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = Math.max(3, H * 0.03);
  g.strokeRect(H * 0.05, H * 0.08, W - H * 0.1, H * 0.84);
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#ffffff';
  fit(g, 'La MADRILEÑA', W / 2, H * 0.33, W * 0.86, H * 0.44, '800', SERIF, 'italic');
  g.fillStyle = '#ffffff';
  fit(g, 'Bar Cafetería', W / 2, H * 0.62, W * 0.58, H * 0.2, '600', SERIF, 'italic');
  g.fillStyle = '#ffffff';
  fit(g, spaced('PLATOS COMBINADOS'), W / 2, H * 0.83, W * 0.66, H * 0.12, '700', SANS);
}

/** el interior del bar: paredes blancas, mesas redondas, la botellera y la barra */
function barInterior(g, W, H) {
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#f7f3ea'); bg.addColorStop(1, '#e2dbcd');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.fillStyle = '#efe9dc'; g.fillRect(0, 0, W, H * 0.11);
  for (const fx of [0.28, 0.6]) {
    const lamp = g.createRadialGradient(W * fx, H * 0.22, 2, W * fx, H * 0.22, W * 0.21);
    lamp.addColorStop(0, 'rgba(255,232,185,.85)'); lamp.addColorStop(1, 'rgba(255,214,155,0)');
    g.fillStyle = lamp; g.fillRect(W * (fx - 0.23), 0, W * 0.46, H * 0.6);
  }
  // la barra y la botellera
  g.fillStyle = '#3a2a1c'; g.fillRect(0, H * 0.34, W, H * 0.14);
  for (let i = 0; i < 14; i++) {
    g.fillStyle = ['#c9a24a', '#8a2a24', '#2f6b3a', '#d8d3c8', '#7a5230'][i % 5];
    g.fillRect(W * 0.03 + i * W * 0.068, H * 0.35, W * 0.032, H * 0.12);
  }
  g.fillStyle = '#8a5a38'; g.fillRect(0, H * 0.48, W, H * 0.1);
  g.fillStyle = '#c8bfae'; g.fillRect(0, H * 0.55, W, H * 0.02);
  // mesas redondas con sus taburetes
  for (const [fx, fy] of [[0.26, 0.8], [0.62, 0.86]]) {
    g.fillStyle = '#f2efe7';
    g.beginPath(); g.ellipse(W * fx, H * fy, W * 0.12, H * 0.055, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#4a4d52'; g.fillRect(W * fx - W * 0.012, H * fy + H * 0.05, W * 0.024, H * 0.13);
    g.fillStyle = '#1b1d20';
    for (const dx of [-0.17, 0.17]) {
      g.beginPath(); g.ellipse(W * (fx + dx), H * (fy + 0.01), W * 0.032, H * 0.045, 0, 0, Math.PI * 2); g.fill();
    }
  }
  // reflejo del cristal
  const refl = g.createLinearGradient(0, 0, W, H);
  refl.addColorStop(0, 'rgba(200,225,245,.2)'); refl.addColorStop(0.5, 'rgba(200,225,245,0)');
  refl.addColorStop(1, 'rgba(200,225,245,.12)');
  g.fillStyle = refl; g.fillRect(0, 0, W, H);
}

function ferreteria(g, W, H) {
  g.fillStyle = '#b31c22'; g.fillRect(0, 0, W, H);
  txt(g, 'FERRETERÍA', W / 2, H * 0.52, W * 0.86, H * 0.6, '#ffffff', '800', SANS);
}

function alimentacion(g, W, H) {
  g.fillStyle = '#f2c218'; g.fillRect(0, 0, W, H);
  txt(g, 'ALIMENTACIÓN', W / 2, H * 0.5, W * 0.88, H * 0.5, '#1a1a1a', '800', SANS);
}

function taxiPlate(g, W, H) {
  g.fillStyle = '#1b4ea8'; g.fillRect(0, 0, W, H);
  txt(g, 'TAXI', W / 2, H * 0.52, W * 0.8, H * 0.6, '#ffffff', '900', SANS);
}

function parkingSign(g, W, H) {
  g.fillStyle = '#1b4ea8'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#ffffff';
  txt(g, 'P', W * 0.2, H * 0.34, W * 0.22, H * 0.44, '#ffffff', '900', SANS);
  txt(g, 'APARCAMIENTO', W * 0.62, H * 0.34, W * 0.62, H * 0.24, '#ffffff', '700', SANS);
  txt(g, '→', W * 0.62, H * 0.76, W * 0.3, H * 0.4, '#ffffff', '900', SANS);
}

function securityPlate(g, W, H) {
  g.fillStyle = '#12151a'; g.fillRect(0, 0, W, H);
  txt(g, 'PHOENIX', W * 0.3, H * 0.42, W * 0.42, H * 0.3, '#e8c46a', '800', SANS);
  txt(g, 'SECURITY', W * 0.72, H * 0.42, W * 0.36, H * 0.24, '#e8c46a', '700', SANS);
  txt(g, 'LOCKSRT · SEGURIDAD', W * 0.5, H * 0.8, W * 0.7, H * 0.16, '#9aa1a8', '600', SANS);
}

function menuBoard(g, W, H) {
  g.fillStyle = '#f6f2ea'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#b3181f'; g.fillRect(0, 0, W, H * 0.3);
  txt(g, 'SAKURA V', W / 2, H * 0.16, W * 0.8, H * 0.14, '#ffffff', '800', SANS);
  g.textAlign = 'left';
  for (let i = 0; i < 5; i++) {
    g.fillStyle = '#2a2a2c'; g.fillRect(W * 0.1, H * (0.4 + i * 0.11), W * 0.5, H * 0.03);
    g.fillStyle = '#b3181f'; g.fillRect(W * 0.72, H * (0.4 + i * 0.11), W * 0.18, H * 0.03);
  }
}

function loadingDoor(g, W, H) {
  g.fillStyle = '#e6e2d8'; g.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += H / 14) {
    g.fillStyle = 'rgba(90,90,86,.25)'; g.fillRect(0, y, W, 2);
    g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(0, y + 2, W, 1.5);
  }
  g.fillStyle = 'rgba(60,58,52,.35)'; g.fillRect(0, H * 0.94, W, H * 0.06);
  g.strokeStyle = '#6d7378'; g.lineWidth = H * 0.02; g.strokeRect(H * 0.02, H * 0.02, W - H * 0.04, H * 0.96);
}

// ── piezas ──

/** rótulo en caja: canto oscuro y la cara dibujada */
function board(k, x, y, w, h, tex, { edge = 0x17191c, glow = 0.35, z = 0.2, depth = 0.18 } = {}) {
  k.box(x, y, z, w, h, depth, edge);
  k.pic(x, y + h / 2, z + depth / 2 + 0.012, w, h, 0, 1, tex, { glow });
}

/** lámina pegada a la pared (sin canto) */
function decal(k, x, y, w, h, tex, { z = 0.185, glow = 0 } = {}) {
  k.pic(x, y + h / 2, z, w, h, 0, 1, tex, { glow });
}

/** ventana con su marco, la cruz y algo de luz dentro */
function windowUnit(k, x, y, w, h, { frame = FRAME, glass = GLASS, lit = null, cross = true, litGlow = 0.25 } = {}) {
  k.box(x, y, 0.185, w, h, 0.03, glass, { list: k.solid });
  if (lit) k.pic(x, y + h / 2, 0.2, w * 0.96, h * 0.96, 0, 1, lit, { glow: litGlow });
  const t = 0.12;
  k.box(x, y, 0.235, w, t, 0.09, frame);
  k.box(x, y + h - t, 0.235, w, t, 0.09, frame);
  k.box(x - w / 2 + t / 2, y, 0.235, t, h, 0.09, frame);
  k.box(x + w / 2 - t / 2, y, 0.235, t, h, 0.09, frame);
  if (cross) k.box(x, y, 0.235, 0.05, h, 0.07, frame);
  // alféizar
  k.box(x, y - 0.04, 0.26, w + 0.16, 0.05, 0.14, 0xd8d3c8);
}

/** persiana metálica cerrada */
function closedShutter(k, x, y, w, h, { z = 0.205 } = {}) {
  k.box(x, y, z, w, h, 0.09, 0x6d7378);
  k.pic(x, y + h / 2, z + 0.06, w * 0.98, h * 0.99, 0, 1, T(512, 512, shutterPanel));
}

/** farol de pared encendido de noche */
function wallLamp(k, x, y) {
  k.box(x, y, 0.26, 0.16, 0.3, 0.36, 0x2a2d31);
  k.box(x, y + 0.06, 0.42, 0.2, 0.16, 0.22, 0xffe6b0, { list: k.glow });
}

function vent(k, x, y, w = 0.9) {
  k.box(x, y, 0.22, w, 0.5, 0.08, 0x8a8378);
  for (let i = 0; i < 4; i++) k.box(x, y + 0.05 + i * 0.11, 0.28, w * 0.92, 0.05, 0.03, 0x4a453e);
}

// ── el bloque, antes de levantar la ciudad ──

export function tuneBuganvillas(map) {
  const b = findBuilding(map, -670, 315, 45);
  if (!b || !b.p) return;
  b.f = [244, 241, 233];     // estuco blanco
  b.c = [150, 150, 146];     // azotea de grava, más oscura que la calle
  b.s = 1;
  // la esquina del WOK (Fenauso × Manolo Millares) va cortada en diagonal:
  // el vértice de OSM se cambia por los dos del chaflán
  const p = b.p;
  const idx = (pt) => {
    let k = -1, best = 1e9;
    for (let j = 0; j < p.length - 1; j++) {
      const d = Math.hypot(p[j][0] - pt[0], p[j][1] - pt[1]);
      if (d < best) { best = d; k = j; }
    }
    return best < 2 ? k : -1;
  };
  // las dos esquinas de Manolo Millares van cortadas: primero la del este
  const iSE = idx(SE);
  if (iSE >= 0) p.splice(iSE, 1, PE, PSE);
  const iSW = idx(SW);
  if (iSW >= 0) p.splice(iSW, 1, PSW, PEW);
}

// ── las cuatro caras ──

function place(scene, colliders, s, name, build) {
  const k = new Kit();
  build(k);
  const { group, segs } = k.build(name, { glow: glowMaterial(0.4) });
  group.position.set(s.o[0], 0, s.o[1]);
  group.rotation.y = Math.atan2(s.n[0], s.n[1]);
  scene.add(group);
  for (const [ax, az, bx, bz] of segs) {
    const a = at(s, ax, az), b = at(s, bx, bz);
    colliders.addSegment(a[0], a[1], b[0], b[1]);
  }
  return group;
}

/** Manolo Millares: la entrada del centro, el buffet Sakura y el bloque del WOK */
function southFacade(k) {
  const L = SIDES.south.L, H = WALL_H;
  k.box(L / 2, 0, 0.08, L, H, 0.16, WHITE, { list: k.shell });
  // zócalo verde con su remate
  k.box(L / 2, 0, 0.175, L, 1.25, 0.03, GREEN, { list: k.shell });
  k.box(L / 2, 1.23, 0.205, L, 0.07, 0.08, GREEN_DK, { list: k.shell });
  // cornisa del cuerpo bajo y remate de arriba
  k.box(L / 2, 4.28, 0.15, L, 0.16, 0.36, WHITE);
  k.box(L / 2, 6.04, 0.13, L, 0.16, 0.34, WHITE);
  for (const x of [0.1, 11.4, 20.3, L - 0.1]) k.box(x, 0, 0.16, 0.24, H, 0.24, WHITE2);
  // pilastras de la planta alta y las bajantes de la lluvia
  for (const x of [1.0, 4.0, 7.0, 9.9, 12.9, 20.1]) k.box(x, 4.34, 0.2, 0.3, 1.7, 0.16, 0xf8f5ee, { list: k.shell });
  for (const x of [11.5, 20.2]) k.cyl(x, 0, 0.26, 0.055, 0.055, H - 0.1, 0x9aa1a8, { seg: 8 });

  // ── buffet Sakura V ──
  const glassFood = T(700, 560, shopGlass('food'));
  for (const [x, w] of [[2.5, 2.4], [5.4, 2.2], [8.3, 2.4]]) {
    k.box(x, 1.25, 0.185, w, 2.0, 0.03, GLASS);
    k.pic(x, 2.25, 0.2, w * 0.96, 1.92, 0, 1, glassFood, { glow: 0.18 });
    k.box(x, 1.25, 0.235, w, 0.1, 0.1, FRAME);
    k.box(x, 3.15, 0.235, w, 0.1, 0.1, FRAME);
  }
  k.box(6.7, 1.25, 0.2, 1.4, 2.1, 0.04, 0x3a2418);
  k.box(6.7, 1.25, 0.25, 0.06, 2.1, 0.05, 0xd8b268);
  board(k, 6.0, 3.28, 11.5, 1.0, T(1900, 140, sakuraBand), { glow: 0.45 });
  // el toldo granate del buffet
  k.box(6.3, 3.02, 0.55, 10.5, 0.08, 0.85, 0x7a1f22);
  for (let i = 0; i < 7; i++) k.box(1.4 + i * 1.65, 2.88, 0.9, 0.06, 0.2, 0.06, 0x5a1216);

  // ── entrada del centro comercial (la puerta de verdad, locales.js) ──
  closedShutter(k, 11.6, 1.25, 2.3, 1.95);
  closedShutter(k, 16.2, 1.25, 2.3, 1.95);
  // hueco de la puerta automática (la del cartel de locales.js, en 12,9)
  k.box(13.9, 0, 0.2, 3.2, 3.2, 0.06, 0x0e1216, { list: k.shell });
  k.pic(13.9, 1.7, 0.24, 3.0, 3.1, 0, 1, T(600, 600, mallLobby), { glow: 0.3 });
  for (const x of [12.6, 13.35, 14.45, 15.2]) k.box(x, 0, 0.27, 0.09, 3.1, 0.1, STEEL);
  k.box(13.9, 3.1, 0.3, 3.2, 0.16, 0.14, STEEL);
  // felpudo, escalón y bolardos
  k.box(13.9, 0.12, 0.7, 3.0, 0.03, 1.3, 0x2a2420);
  k.box(13.9, 0, 0.45, 3.6, 0.13, 0.9, 0xbfb9ad, { list: k.shell });
  for (const x of [12.6, 15.6]) {
    k.cyl(x, 0.13, 1.15, 0.075, 0.09, 0.85, 0x2a2d31, { seg: 10 });
    k.ball(x, 1.0, 1.15, 0.09, 0x2a2d31, { sy: 0.7 });
  }
  board(k, 13.8, 3.32, 8.0, 0.95, T(1900, 190, ccYellow), { glow: 0.5 });
  for (const x of [1.9, 8.0, 12.4, 17.2, 23.4]) wallLamp(k, x, 3.75);
  // cartel de la seguridad y el de taxi
  decal(k, 10.4, 1.5, 1.6, 0.55, T(680, 220, securityPlate), { glow: 0.1 });
  k.cyl(18.2, 0.13, 1.0, 0.05, 0.05, 2.4, 0x8d939a, { seg: 8 });
  board(k, 18.2, 2.4, 0.85, 0.35, T(340, 140, taxiPlate), { glow: 0.3, depth: 0.1, z: 0.1 });
  // tablón con la carta y dos macetas
  k.box(11.0, 0.13, 0.75, 0.7, 1.0, 0.12, 0x2a2420, { ry: 0.25 });
  k.pic(11.0, 0.63, 0.82, 0.62, 0.9, -0.24, 1, T(300, 430, menuBoard), { glow: 0.15 });
  for (const x of [9.6, 17.4]) {
    k.cyl(x, 0.13, 0.75, 0.28, 0.22, 0.55, 0x8a5a38, { seg: 12 });
    k.ball(x, 1.05, 0.75, 0.42, 0x2f6b3a, { sy: 0.85 });
    k.ball(x + 0.12, 1.2, 0.7, 0.18, 0xc2185b);
  }

  // ── el tramo del TEPPANYAKI, ya hacia Peñas del Chache ──
  const wx0 = 20.2;
  const glassFood2 = T(700, 560, shopGlass('food'));
  for (const [x, w] of [[21.8, 2.3], [24.2, 1.7]]) {
    k.box(x, 1.25, 0.185, w, 2.05, 0.03, GLASS);
    k.pic(x, 2.27, 0.2, w * 0.96, 1.97, 0, 1, glassFood2, { glow: 0.2 });
    k.box(x, 1.25, 0.235, w, 0.1, 0.1, FRAME);
    k.box(x, 3.2, 0.235, w, 0.1, 0.1, FRAME);
  }
  board(k, (wx0 + L) / 2 + 0.1, 3.32, L - wx0 - 0.3, 0.78, T(1200, 130, teppanBand), { glow: 0.45 });
  // planta alta del TEPPANYAKI: ventanales y toldo
  for (const x of [21.6, 24.0]) windowUnit(k, x, 4.55, 2.0, 1.35, { frame: 0xe8e4da, lit: cached('foodLit', 380, 240, shopGlass('food')) });
  k.box((wx0 + L) / 2, 4.35, 0.5, L - wx0, 0.06, 0.7, 0x7a1f22);
  for (let i = 0; i < 3; i++) k.box(wx0 + 0.7 + i * 1.9, 4.28, 0.8, 0.05, 0.16, 0.05, 0x5a1216);

  // ── ventanas de la planta alta (ala del buffet) ──
  for (const x of [2.2, 5.1, 8.0, 10.9, 13.9, 17.1, 19.5]) {
    windowUnit(k, x, 4.62, 2.0, 1.25, {
      frame: 0xe8e4da, cross: false,
      lit: Math.round(x) % 3 === 0
        ? cached('roomLit', 360, 220, litWindow)
        : cached('sky', 360, 220, skyGlass),
      litGlow: Math.round(x) % 3 === 0 ? 0.2 : 0.06,
    });
  }
  // ── azotea: los toldos amarillos de la terraza, detrás del pretil ──
  for (const x of [5.9, 8.8, 11.7]) {
    const aw = new THREE.BoxGeometry(2.2, 0.05, 2.8);
    aw.rotateX(0.16);
    aw.translate(x, 7.32, -2.9);
    k.add(aw, 0xd8ae24);
    for (const [dx, dz] of [[-1.05, -1.3], [1.05, -1.3], [-1.05, -4.5], [1.05, -4.5]]) {
      k.cyl(x + dx, 6.2, dz, 0.05, 0.05, 1.15, 0xb8bcc0, { seg: 8 });
    }
  }
}

/**
 * La esquina de Fenauso: el ventanal corrido del WOK en la planta primera, el pretil
 * blanco con las letras rojas y, abajo, la entrada del centro (foto de la calle).
 */
function chamferFacade(k) {
  const L = SIDES.chamfer.L, H = WALL_H;
  // cuerpo bajo blanco con el zócalo verde
  k.box(L / 2, 0, 0.08, L, H, 0.16, WHITE, { list: k.shell });
  k.box(L / 2, 0, 0.175, L, 1.25, 0.03, GREEN, { list: k.shell });
  k.box(L / 2, 1.23, 0.205, L, 0.07, 0.08, GREEN_DK, { list: k.shell });
  // dintel entre la planta baja y el ventanal
  k.box(L / 2, 2.92, 0.22, L, 0.22, 0.4, WHITE);
  // la entrada del centro: cristal oscuro con el pasillo al fondo
  k.box(L / 2, 0, 0.2, L - 1.4, 2.92, 0.05, 0x0e1216, { list: k.shell });
  k.pic(L / 2, 1.46, 0.235, L - 1.5, 2.84, 0, 1, T(760, 540, cornerEntry), { glow: 0.2 });
  for (const x of [0.9, L / 2 - 0.85, L / 2 + 0.85, L - 0.9]) k.box(x, 0, 0.27, 0.1, 2.92, 0.1, STEEL);
  k.box(L / 2, 2.78, 0.3, L - 1.2, 0.13, 0.15, STEEL);
  // planta primera: el ventanal del Sakura V, con su estructura vista
  k.box(L / 2, 3.14, 0.16, L - 0.2, 2.7, 0.07, GLASS, { list: k.solid });
  k.pic(L / 2, 4.5, 0.2, L - 0.3, 2.6, 0, 1, T(1100, 430, shopGlass('food')), { glow: 0.22 });
  for (let i = 0; i <= 4; i++) k.box(0.3 + i * (L - 0.6) / 4, 3.14, 0.245, 0.09, 2.7, 0.1, FRAME);
  k.box(L / 2, 3.16, 0.25, L - 0.2, 0.09, 0.12, FRAME);
  k.box(L / 2, 5.75, 0.25, L - 0.2, 0.1, 0.12, FRAME);
  // la lona roja del local libre, vista a través del cristal
  decal(k, L * 0.32, 4.02, 3.2, 1.0, T(620, 300, localDisponible), { glow: 0.22, z: 0.27 });
  // pretil blanco con las letras rojas del WOK
  k.box(L / 2, 5.85, 0.13, L, 1.45, 0.3, WHITE);
  k.box(L / 2, 7.3, 0.2, L + 0.16, 0.14, 0.44, WHITE2);
  k.pic(L / 2, 6.55, 0.29, L * 0.8, 1.06, 0, 1, T(1000, 250, wokLetters), { glow: 0.12 });
}

/**
 * La otra esquina, en Peñas del Chache: el portal del centro bajo el vuelo, la banda
 * con el «LOCAL DISPONIBLE», el ventanal del restaurante encima y el cartel negro
 * del WOK CINTA en el tejado.
 */
function chamferSEFacade(k) {
  const L = SIDES.chamferSE.L;
  // la pared del portal, en verde oscuro, y las puertas de cristal
  k.box(L / 2, 0, 0.07, L, 2.8, 0.14, 0x16382c, { list: k.shell });
  k.box(L / 2 - 1.1, 0, 0.14, 2.4, 2.5, 0.05, 0x0e1216, { list: k.shell });
  k.pic(L / 2 - 1.1, 1.3, 0.18, 2.3, 2.45, 0, 1, T(560, 620, cornerEntry), { glow: 0.2 });
  for (const x of [L / 2 - 1.85, L / 2 - 1.1, L / 2 - 0.35]) k.box(x, 0, 0.23, 0.08, 2.5, 0.09, STEEL);
  k.box(L / 2 - 1.1, 2.42, 0.24, 2.5, 0.1, 0.1, STEEL);
  // el banderín del buffet, en un mástil a la izquierda
  k.cyl(0.85, 0, 0.3, 0.05, 0.05, 3.4, 0x8d939a, { seg: 8 });
  k.pic(0.85, 2.2, 0.36, 0.72, 2.05, 0, 1, T(220, 620, (g, W, H) => {
    g.fillStyle = '#1b1d21'; g.fillRect(0, 0, W, H);
    txt(g, 'Sakura', W / 2, H * 0.16, W * 0.8, H * 0.09, '#f6f2ea', '700', SANS);
    txt(g, 'BUFFET', W / 2, H * 0.3, W * 0.8, H * 0.1, '#e23a26', '800', SANS);
    txt(g, 'WOK', W / 2, H * 0.44, W * 0.6, H * 0.1, '#f6f2ea', '800', SANS);
  }), { glow: 0.2 });
  // el vuelo sobre el portal y la banda con el cartel del local libre
  k.box(L / 2, 2.62, 0.62, L, 0.3, 1.3, WHITE);
  k.box(L / 2, 2.92, 0.14, L, 0.95, 0.34, 0xd9d1bf);
  board(k, L * 0.42, 2.95, 3.3, 0.76, T(620, 160, localDisponible), { glow: 0.2, z: 0.32, depth: 0.08 });
  // el ventanal corrido del restaurante
  k.box(L / 2, 3.87, 0.14, L - 0.3, 2.15, 0.07, GLASS, { list: k.solid });
  k.pic(L / 2, 4.95, 0.18, L - 0.4, 2.05, 0, 1, T(900, 380, shopGlass('food')), { glow: 0.22 });
  for (let i = 0; i <= 3; i++) k.box(0.4 + i * (L - 0.8) / 3, 3.87, 0.22, 0.09, 2.15, 0.1, FRAME);
  k.box(L / 2, 3.89, 0.23, L - 0.2, 0.09, 0.12, FRAME);
  k.box(L / 2, 5.92, 0.23, L - 0.2, 0.1, 0.12, FRAME);
  // la banda con el nombre del restaurante, en el borde alto
  board(k, L * 0.45, 6.08, L - 0.4, 0.44, T(1100, 90, teppanBand), { glow: 0.3, depth: 0.1, z: 0.24 });
  // pretil y el cartel negro del WOK CINTA
  k.box(L / 2, 6.2, 0.09, L, 0.52, 0.26, WHITE);
  k.box(L / 2, 6.74, 0.0, 4.9, 0.1, 0.46, 0x17191c);
  for (const x of [L / 2 - 2.0, L / 2 + 2.0]) k.box(x, 6.24, -0.14, 0.09, 1.85, 0.09, 0x3a3f45);
  board(k, L / 2, 7.62, 4.6, 1.85, T(900, 380, wokCinta), { glow: 0.5, depth: 0.3, z: 0.12 });
}

/** Peñas del Chache: la tapia larga, el anagrama y la tienda Smile */
function eastFacade(k) {
  const L = SIDES.east.L, H = WALL_H;
  k.box(L / 2, 0, 0.08, L, H, 0.16, WHITE, { list: k.shell });
  k.box(L / 2, 0, 0.175, L, 1.2, 0.03, GREEN, { list: k.shell });
  k.box(L / 2, 1.18, 0.205, L, 0.07, 0.08, GREEN_DK, { list: k.shell });
  k.box(L / 2, 3.0, 0.1, L, 0.12, 0.24, WHITE2);
  k.box(L / 2, 6.04, 0.13, L, 0.16, 0.34, WHITE);
  // anagrama del centro y su nombre en verde, a media tapia
  decal(k, 10.6, 2.55, 8.2, 1.35, T(1640, 270, ccWall), { glow: 0.2 });
  decal(k, 33.0, 2.4, 11.0, 1.3, T(1500, 178, ccLetters), { glow: 0.14 });
  // puerta de servicio, rejas y cámaras
  k.box(4.2, 0, 0.2, 1.25, 2.25, 0.1, 0x1f4b3a);
  k.box(4.2, 1.1, 0.27, 0.05, 0.05, 0.05, 0xd8b268);
  k.box(4.2, 2.3, 0.26, 1.4, 0.12, 0.16, 0x2a2d31);
  // Smile
  k.box(28.6, 1.2, 0.185, 5.2, 1.9, 0.04, GLASS);
  k.pic(28.6, 2.15, 0.21, 5.0, 1.8, 0, 1, T(900, 360, shopGlass('shop')), { glow: 0.22 });
  for (const x of [26.1, 31.1]) k.box(x, 1.2, 0.24, 0.1, 1.9, 0.1, 0x2a2d31);
  board(k, 28.6, 3.05, 4.4, 0.62, T(1000, 150, smileSign), { glow: 0.35 });
  closedShutter(k, 38.0, 1.2, 3.0, 2.0);
  // puerta trasera y reja
  k.box(47.0, 0, 0.19, 1.3, 2.2, 0.1, 0x6d7378);
  k.box(52.5, 0, 0.19, 2.2, 2.2, 0.09, 0x3a3f45);
  for (let i = 0; i < 5; i++) k.box(51.5 + i * 0.5, 0.2, 0.25, 0.05, 1.9, 0.05, 0x9aa1a8);
  // respiraderos, faroles y cámaras
  for (const x of [7.2, 13.0, 20.0, 34.0, 43.0, 58.0]) vent(k, x, 1.75, 0.85);
  for (const x of [6.0, 18.0, 30.0, 42.0, 54.0, 64.0]) wallLamp(k, x, 3.4);
  for (const x of [12.0, 36.0, 50.0]) {
    k.box(x, 3.55, 0.35, 0.1, 0.1, 0.42, 0xd8dcdf);
    k.box(x, 3.5, 0.58, 0.22, 0.16, 0.22, 0x2a2d31);
  }
  // ventanas altas (las de las oficinas del centro)
  for (const x of [22.0, 40.0, 60.0]) windowUnit(k, x, 4.85, 1.1, 0.85, { frame: 0xe8e4da, lit: cached('sky3', 280, 220, skyGlass), litGlow: 0.06, cross: false });

}

/** Aniagua: el Kassino en la esquina de Fenauso, su mural y los contenedores */
function northFacade(k) {
  const L = SIDES.north.L, H = WALL_H;
  k.box(L / 2, 0, 0.08, L, H, 0.16, WHITE, { list: k.shell });
  k.box(L / 2, 6.04, 0.13, L, 0.16, 0.34, WHITE);
  // zócalo verde en el tramo del centro (el del bingo va con el mural)
  k.box(8.2, 0, 0.175, 16.4, 1.2, 0.03, GREEN, { list: k.shell });
  k.box(8.2, 1.18, 0.205, 16.4, 0.07, 0.08, GREEN_DK, { list: k.shell });
  // el mural del bingo, de suelo a la cornisa, en la mitad de poniente
  decal(k, 25.9, 0.34, 18.9, 4.15, T(2200, 480, neonMural), { glow: 0.42, z: 0.19 });
  // entrada del salón recreativo, en la esquina con Fenauso
  k.box(32.9, 0.15, 0.22, 2.3, 2.6, 0.06, 0x0c0f16);
  k.pic(32.9, 1.5, 0.27, 2.15, 2.45, 0, 1, T(420, 500, shopGlass('shop')), { glow: 0.3 });
  for (const x of [31.8, 32.9, 34.0]) k.box(x, 0.15, 0.3, 0.08, 2.55, 0.08, 0x2a2d31);
  k.box(32.9, 2.8, 0.45, 2.9, 0.14, 0.5, 0x1b1d21);
  k.box(32.3, 0.12, 0.9, 2.8, 0.02, 1.0, 0x2a2420);
  board(k, 29.4, 4.55, 6.8, 1.0, T(1400, 205, kassinoSign), { glow: 0.55 });
  board(k, 22.6, 2.35, 2.4, 1.05, T(560, 250, parkingSign), { glow: 0.3 });
  // las letras verdes de la trasera, hacia Peñas del Chache
  decal(k, 6.8, 2.15, 10.0, 1.05, T(1300, 136, ccLetters), { glow: 0.12 });
  // el cajón negro de arriba con el cartel de area fit
  k.box(26.0, 6.2, -3.7, 19.2, 3.3, 7.4, BLACK);
  k.box(26.0, 9.45, -3.7, 19.4, 0.16, 7.6, 0x2a2d31);
  board(k, 26.2, 7.5, 3.2, 1.5, T(700, 330, areaFit), { glow: 0.55, z: 0.04, depth: 0.22 });
  for (let i = 0; i < 4; i++) k.box(19.6 + i * 4.2, 9.45, -1.2, 0.09, 0.9, 0.09, 0x3a3f45);
  // muelle de carga y respiraderos
  closedShutter(k, 3.6, 0.05, 3.2, 2.6);
  decal(k, 9.4, 2.7, 4.0, 0.4, T(900, 90, (g, W, H2) => {
    g.fillStyle = hex(WHITE); g.fillRect(0, 0, W, H2);
    txt(g, 'CARGA Y DESCARGA', W / 2, H2 / 2, W * 0.9, H2 * 0.6, '#12523c', '700', SANS);
  }));
  for (const x of [7.2, 14.6]) vent(k, x, 2.2, 1.0);
  wallLamp(k, 11.0, 3.6);
  wallLamp(k, 20.0, 3.6);
}

/** Fenauso: la trasera, los dos muelles de carga y los bolardos */
function westFacade(k) {
  const L = SIDES.west.L, H = WALL_H;
  k.box(L / 2, 0, 0.08, L, H, 0.16, WHITE, { list: k.shell });
  k.box(L / 2, 0, 0.175, L, 1.2, 0.03, GREEN, { list: k.shell });
  k.box(L / 2, 1.18, 0.205, L, 0.07, 0.08, GREEN_DK, { list: k.shell });
  k.box(L / 2, 6.04, 0.13, L, 0.16, 0.34, WHITE);
  // las letras verdes de «CENTRO COMERCIAL», junto a la esquina del WOK
  decal(k, L - 18.0, 2.7, 12.4, 1.3, T(1900, 200, ccLetters), { glow: 0.12 });
  decal(k, 30.0, 2.35, 3.0, 0.85, T(600, 170, (g, W, H2) => {
    g.fillStyle = hex(WHITE); g.fillRect(0, 0, W, H2);
    txt(g, '◀ LAS', W / 2, H2 / 2, W * 0.86, H2 * 0.55, '#12523c', '800', SANS);
  }), { glow: 0.1 });
  // los dos muelles de carga con sus jambas rojas y verdes
  for (const [x, w] of [[35.6, 3.1], [40.4, 3.1]]) {
    k.box(x, 0.05, 0.2, w, 2.85, 0.1, 0x6d7378);
    k.pic(x, 1.47, 0.27, w * 0.97, 2.8, 0, 1, T(512, 460, loadingDoor), { glow: 0.05 });
    k.box(x, 2.9, 0.3, w + 0.5, 0.2, 0.3, 0x8d939a);
    for (let i = 0; i < 5; i++) {
      const c = i % 2 ? 0x1f6b3a : 0xb3181f;
      k.box(x - w / 2 - 0.22, i * 0.55, 0.26, 0.22, 0.55, 0.16, c);
      k.box(x + w / 2 + 0.22, i * 0.55, 0.26, 0.22, 0.55, 0.16, c);
    }
    // la flecha amarilla pintada en el suelo
    k.box(x, 0.14, 1.1, 0.35, 0.02, 1.4, 0xd8b422);
    k.box(x, 0.14, 1.95, 0.9, 0.02, 0.32, 0xd8b422);
    k.box(x - 0.34, 0.14, 1.78, 0.5, 0.02, 0.22, 0xd8b422, { ry: 0.6 });
    k.box(x + 0.34, 0.14, 1.78, 0.5, 0.02, 0.22, 0xd8b422, { ry: -0.6 });
    // el tope de goma y la rampa
    k.box(x, 0.12, 1.0, 3.4, 0.1, 1.5, 0xbdb7ab, { list: k.shell });
  }
  // puerta de personal, cámara y faroles
  k.box(50.0, 0, 0.19, 1.15, 2.2, 0.1, 0x1f4b3a);
  k.box(50.0, 1.1, 0.27, 0.05, 0.05, 0.05, 0xd8b268);
  k.box(48.4, 3.3, 0.4, 0.1, 0.1, 0.45, 0xd8dcdf);
  k.box(48.4, 3.24, 0.62, 0.24, 0.16, 0.24, 0x2a2d31);
  for (const x of [32.0, 47.0, 58.0, 62.5]) vent(k, x, 1.8, 0.9);
  for (const x of [8.0, 24.0, 33.0, 45.0, 56.0, 61.5]) wallLamp(k, x, 3.5);
}

// ── el entorno ──

/** contenedores y demás trastos de la calle */
function streetProps(P) {
  const bin = (x, z, ry, color, lid) => {
    P.box(x, 0.06, z, 1.32, 1.05, 1.05, color, { ry });
    P.box(x, 1.11, z, 1.38, 0.14, 1.1, lid, { ry });
    P.box(x, 1.25, z, 0.42, 0.06, 0.12, 0x2a2a2a, { ry });
    P.box(x - 0.45, 1.18, z, 0.12, 0.06, 0.5, 0x2a2a2a, { ry });
    P.cyl(x - 0.45, 0.02, z + 0.35, 0.11, 0.11, 0.1, 0x1c1c1e, { rx: Math.PI / 2, seg: 8 });
    P.cyl(x + 0.45, 0.02, z + 0.35, 0.11, 0.11, 0.1, 0x1c1c1e, { rx: Math.PI / 2, seg: 8 });
    P.block(x, z, 1.42, 1.15, ry);
  };
  const ryN = Math.atan2(SIDES.north.n[0], SIDES.north.n[1]);
  const bins = [
    [13.0, 0x3f7a3a, 0x2e5c2b], [14.8, 0x4a6f46, 0x31502e], [16.6, 0x2f6f8a, 0x225368],
  ];
  for (const [lx, c, l] of bins) {
    const [x, z] = at(SIDES.north, lx, 1.85);
    bin(x, z, ryN, c, l);
  }
  // jaula de reciclaje de vidrio y el contenedor naranja de la ropa
  {
    const [x, z] = at(SIDES.north, 18.4, 1.9);
    P.box(x, 0.06, z, 2.1, 1.55, 1.5, 0xcfd4d8, { ry: ryN });
    P.box(x, 0.2, z, 1.95, 1.3, 1.36, 0x6d7378, { ry: ryN });
    for (let i = 0; i < 5; i++) P.box(x - 0.9 + i * 0.45, 0.15, z + 0.76, 0.05, 1.35, 0.05, 0xe8ecef, { ry: ryN });
    P.box(x, 1.62, z, 2.18, 0.1, 1.56, 0xe8ecef, { ry: ryN });
    P.block(x, z, 2.2, 1.6, ryN);
    const [x2, z2] = at(SIDES.north, 20.6, 1.85);
    P.box(x2, 0.1, z2, 1.15, 1.25, 0.95, 0xd4552a, { ry: ryN });
    P.cyl(x2, 1.35, z2, 0.58, 0.58, 0.95, 0xd4552a, { rx: Math.PI / 2, ry: ryN, seg: 14 });
    P.cyl(x2, 1.15, z2 + 0.48, 0.2, 0.2, 0.1, 0x8a3a1c, { rx: Math.PI / 2, seg: 12 });
    P.box(x2, 0.12, z2, 1.0, 0.5, 0.99, 0xb8441e, { ry: ryN });
    P.block(x2, z2, 1.25, 1.05, ryN);
  }
  // bolardos verdes y blancos de la trasera
  for (let i = 0; i < 7; i++) {
    const [x, z] = at(SIDES.west, 8 + i * 8.2, 1.5);
    P.cyl(x, 0.12, z, 0.09, 0.11, 0.85, 0x1f6b3a, { seg: 10 });
    P.cyl(x, 0.62, z, 0.093, 0.093, 0.14, 0xf2efe7, { seg: 10 });
    P.cyl(x, 0.76, z, 0.093, 0.093, 0.1, 0x1f6b3a, { seg: 10 });
  }
}

/** un flamboyán en flor, con su copa roja encima de la verde */
function flamboyan(P, x, z, s = 1) {
  P.cyl(x, 0.12, z, 0.26 * s, 0.42 * s, 3.0 * s, 0x6b5445, { seg: 8 });
  for (let i = 0; i < 4; i++) {
    const a = i * 1.9;
    const bx = x + Math.cos(a) * 1.0 * s, bz = z + Math.sin(a) * 1.0 * s;
    P.cyl(x + Math.cos(a) * 0.5 * s, 2.3 * s, z + Math.sin(a) * 0.5 * s, 0.07, 0.14, 1.7 * s, 0x6b5445, { rx: 0.5, ry: -a, seg: 6 });
    P.ball(bx, 4.2 * s, bz, 0.95 * s, 0x3f7a3a, { sy: 0.55, seg: 8 });
  }
  P.ball(x, 4.7 * s, z, 1.55 * s, 0x3f7a3a, { sy: 0.48, seg: 10 });
  for (let i = 0; i < 10; i++) {
    const a = i * 2.3, r = (0.35 + (i % 3) * 0.5) * s;
    P.ball(x + Math.cos(a) * r, (4.85 + (i % 2) * 0.32) * s, z + Math.sin(a) * r, 0.45 * s, 0xc0392b, { sy: 0.7, seg: 8 });
  }
  P.block(x, z, 0.8, 0.8);
}

/** suelo plano de un polígono (las losas del parque), a la altura dada */
function polyFloor(P, poly, hex, y) {
  const shape = new THREE.Shape();
  shape.moveTo(poly[0][0], -poly[0][1]);
  for (let i = 1; i < poly.length; i++) shape.lineTo(poly[i][0], -poly[i][1]);
  const g = new THREE.ShapeGeometry(shape);
  g.rotateX(-Math.PI / 2);
  g.translate(0, y, 0);
  P.add(g, hex);
}

function bench(P, x, z, ry) {
  P.box(x, 0.52, z, 1.9, 0.09, 0.55, 0x8a6a44, { ry });
  P.box(x, 0.62, z - 0.26, 1.9, 0.5, 0.09, 0x8a6a44, { ry });
  for (const dx of [-0.78, 0.78]) P.box(x + dx, 0.12, z, 0.08, 0.4, 0.5, 0x2a2d31, { ry });
  P.block(x, z, 2.0, 0.7, ry);
}

/**
 * El parque que hay detrás del centro, en Aniagua: la plaza-jardín de la foto, con la acera de
 * losas, los parterres elevados de borde blanco, los flamboyanes en flor, los bancos de tablones,
 * las farolas y el parque infantil del rincón de Peñas del Chache.
 *
 * El polígono de OSM va inclinado con la calle (5,2°), así que todo se coloca sobre su eje: t de
 * poniente a levante por la acera, d hacia la calle (negativo, hacia dentro del parque).
 */
function parqueAniagua(P, panes) {
  const PARK = [[-749.01, 252.81], [-656.12, 244.29], [-654.37, 263.35], [-747.25, 271.85]];
  const S0 = [-747.25, 271.85];             // punta de poniente del borde de la acera
  const UX = 0.99587, UZ = -0.09114;        // a lo largo del parque, hacia Peñas del Chache
  const OX = 0.09114, OZ = 0.99587;         // hacia la calle
  const RY = Math.atan2(OX, OZ);            // lo que gira cada pieza con la acera
  const at2 = (t, d) => [S0[0] + UX * t + OX * d, S0[1] + UZ * t + OZ * d];
  const piece = (t, d, w, h, dp, hex, y = 0.12) => {
    const [x, z] = at2(t, d);
    P.box(x, y, z, w, h, dp, hex, { ry: RY });
  };
  const rnd = (seed) => { let s = seed | 0; return () => (s = (s * 16807) % 2147483647) / 2147483647; };

  // ── el piso de losas de todo el parque, con su bordillo blanco contra la calle ──
  polyFloor(P, PARK, 0xa9a294, 0.13);
  piece(45.5, -0.12, 91.5, 0.2, 0.28, 0xdbd5c7);
  // las juntas de las losas: cinco tiras a lo largo y una cada 7,6 m a lo ancho
  for (let i = 0; i < 5; i++) piece(45.5, -1.9 - i * 3.8, 91.2, 0.012, 0.07, 0x96907f, 0.136);
  for (let i = 0; i < 12; i++) {
    const t = 2.0 + i * 7.6;
    const [x, z] = at2(t, -9.5);
    P.box(x, 0.136, z, 0.07, 0.012, 18.4, 0x96907f, { ry: RY });
  }

  // ── un parterre: borde blanco de obra, tierra y matorrales, con sus flamboyanes ──
  const bed = (t0, t1, d0, d1, trees, seed) => {
    const t = (t0 + t1) / 2, d = (d0 + d1) / 2, w = t1 - t0, dp = d0 - d1;
    const r = rnd(seed);
    piece(t, d0, w, 0.44, 0.26, 0xe9e4d8);
    piece(t, d1, w, 0.44, 0.26, 0xe9e4d8);
    piece(t0, d, 0.26, 0.44, dp - 0.52, 0xe9e4d8);
    piece(t1, d, 0.26, 0.44, dp - 0.52, 0xe9e4d8);
    piece(t, d, w - 0.52, 0.32, dp - 0.52, 0x43331f, 0.13);
    // la grava rojiza del parterre, como en la foto de Calle Guenia
    piece(t, d, w - 0.62, 0.02, dp - 0.62, 0x6b4a37, 0.45);
    for (let i = 0; i < 16; i++) {
      const [x, z] = at2(t0 + 0.9 + r() * (w - 1.8), d1 + 0.8 + r() * (dp - 1.8));
      const s = 0.42 + r() * 0.4;
      P.ball(x, 0.26 + s * 0.35, z, s, r() < 0.22 ? 0x8a3a4a : 0x2f6b3a, { sy: 0.78 });
      if (r() < 0.4) P.ball(x + 0.3, 0.46 + s * 0.35, z + 0.22, 0.12, 0xc2185b, { sy: 0.9 });
    }
    for (let i = 0; i < trees; i++) {
      const [x, z] = at2(t0 + (w * (i + 0.5)) / trees, d1 + dp * 0.56);
      flamboyan(P, x, z, 0.92 + 0.14 * (i % 2));
      // el montón de piedra de lava al pie del tronco, como el de la foto
      for (let k = 0; k < 6; k++) {
        const a = r() * Math.PI * 2, rad = 0.6 + r() * 1.05, s = 0.22 + r() * 0.34;
        P.ball(x + Math.cos(a) * rad, 0.46 + s * 0.3, z + Math.sin(a) * rad, s, r() < 0.5 ? 0x2b2622 : 0x35302b, { sy: 0.68 });
      }
    }
    // las piedras de lava del borde, como las de la plaza de Tagoror
    for (const [dt, dd] of [[-1.3, d0 - 0.65], [1.2, d1 + 0.7]]) {
      const [x, z] = at2(t + dt, dd);
      P.ball(x, 0.33, z, 0.44, 0x2b2622, { sy: 0.68 });
      P.ball(x + 0.5, 0.28, z + 0.18, 0.25, 0x35302b, { sy: 0.72 });
    }
    const [bx, bz] = at2(t, d);
    P.block(bx, bz, w, dp, RY);
  };

  bed(58, 72, -6.4, -13.4, 2, 11);
  bed(34, 52, -6.4, -13.4, 3, 23);
  // el parterre del rincón de Peñas del Chache, el de la foto
  bed(87.5, 91, -1.2, -5.2, 1, 67);

  // ── la plaza del monumento, en el extremo de Tagoror (C. Tagoror 4) ──
  {
    const [mx, mz] = at2(16, -9.6);
    // el solado de ladrillo de toda la plazuela, con el abanico alrededor del monumento
    piece(16, -9.3, 32.2, 0.012, 18.4, 0xac9276, 0.128);
    P.cyl(mx, 0.138, mz, 8.8, 8.8, 0.012, 0xa89076, { seg: 30 });
    for (const [r, c] of [[8.0, 0x947b62], [6.8, 0x947b62], [5.7, 0x947b62]]) {
      P.cyl(mx, 0.15, mz, r, r, 0.006, c, { seg: 30 });
    }
    // el parterre circular: borde blanco de obra, tierra y barandilla negra
    P.cyl(mx, 0.13, mz, 4.9, 4.9, 0.44, 0xe9e4d8, { seg: 30 });
    P.cyl(mx, 0.145, mz, 4.56, 4.56, 0.46, 0x43331f, { seg: 30 });
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      P.cyl(mx + Math.cos(a) * 4.63, 0.57, mz + Math.sin(a) * 4.63, 0.028, 0.028, 0.82, 0x1f2226, { seg: 5 });
    }
    P.cyl(mx, 1.36, mz, 4.67, 4.67, 0.05, 0x1f2226, { seg: 30 });
    // el monumento: tres piezas blancas, como una vela, sobre su basamento
    P.box(mx, 0.45, mz, 3.4, 0.28, 2.8, 0xe9e4d8);
    P.box(mx, 0.73, mz, 2.6, 0.24, 2.1, 0xf1ede4);
    P.cyl(mx, 0.95, mz, 0.24, 1.6, 6.4, 0xf6f3ec, { seg: 6, rx: 0.04 });
    P.cyl(mx + 1.05, 0.95, mz - 0.4, 0.22, 0.85, 4.9, 0xf1ede4, { seg: 6, rx: -0.03 });
    P.cyl(mx - 0.95, 0.95, mz + 0.35, 0.18, 0.62, 3.3, 0xf1ede4, { seg: 6, rx: 0.07 });
    // las matas dentro del parterre
    const rr = rnd(73);
    for (let i = 0; i < 9; i++) {
      const a = rr() * Math.PI * 2, rad = 1.9 + rr() * 2.1;
      const s = 0.45 + rr() * 0.4;
      P.ball(mx + Math.cos(a) * rad, 0.45 + s * 0.4, mz + Math.sin(a) * rad, s, rr() < 0.2 ? 0x8a3a4a : 0x2f6b3a, { sy: 0.8 });
    }
    // no se atraviesa el parterre
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2, b = ((i + 1) / 16) * Math.PI * 2;
      P.seg(mx + Math.cos(a) * 4.9, mz + Math.sin(a) * 4.9, mx + Math.cos(b) * 4.9, mz + Math.sin(b) * 4.9);
    }
  }

  // ── los maceteros de hormigón de la plaza, con su mata dentro ──
  for (const [t, d] of [[22, -4.2], [36.5, -3.2]]) {
    const [x, z] = at2(t, d);
    // las cuatro paredes del macetero, de hormigón
    P.box(x, 0.13, z - 0.63, 2.7, 0.8, 0.12, 0xb8b4aa, { ry: RY });
    P.box(x, 0.13, z + 0.63, 2.7, 0.8, 0.12, 0xb8b4aa, { ry: RY });
    P.box(x - 1.29, 0.13, z, 0.12, 0.8, 1.38, 0xb8b4aa, { ry: RY });
    P.box(x + 1.29, 0.13, z, 0.12, 0.8, 1.38, 0xb8b4aa, { ry: RY });
    // la tierra dentro, un dedo más baja que el borde
    P.box(x, 0.14, z, 2.46, 0.68, 1.14, 0x43331f, { ry: RY });
    P.ball(x - 0.5, 0.95, z, 0.42, 0x2f6b3a, { sy: 0.8 });
    P.ball(x + 0.55, 0.92, z + 0.1, 0.34, 0x3f7a3a, { sy: 0.8 });
    P.block(x, z, 2.8, 1.45, RY);
  }

  // ── las jardineras blancas con piedra de lava, como las de la plaza ──
  for (const [t, d, ry] of [[5.5, -3.6, 0.1], [27, -3.6, -0.15], [16, -16.4, 0.2]]) {
    const [x, z] = at2(t, d);
    P.box(x, 0.13, z, 2.6, 0.5, 1.3, 0xe9e4d8, { ry: RY + ry });
    P.box(x, 0.14, z, 2.3, 0.52, 1.05, 0x43331f, { ry: RY + ry });
    P.ball(x - 0.6, 0.72, z, 0.42, 0x2f6b3a, { sy: 0.75 });
    P.ball(x + 0.55, 0.7, z + 0.1, 0.36, 0x3f7a3a, { sy: 0.75 });
    P.ball(x - 0.15, 0.62, z - 0.28, 0.3, 0x35302b);
    P.ball(x + 0.9, 0.6, z - 0.2, 0.22, 0x2b2723);
    P.block(x, z, 2.7, 1.4, RY + ry);
  }

  // ── las farolas de fundición de la plaza (el cristal va aparte, que se apaga de día) ──
  for (const t of [7, 25]) {
    const [x, z] = at2(t, -2.5);
    P.box(x, 0.13, z, 0.34, 0.36, 0.34, 0x21252a);
    P.cyl(x, 0.45, z, 0.075, 0.11, 3.6, 0x21252a, { seg: 8 });
    P.box(x, 4.0, z, 0.42, 0.5, 0.42, 0x21252a);
    panes.push(new THREE.BoxGeometry(0.32, 0.42, 0.32).translate(x, 4.25, z));
    P.cyl(x, 4.5, z, 0.02, 0.26, 0.34, 0x21252a, { seg: 4 });
    P.block(x, z, 0.44, 0.44);
  }

  // ── el parque infantil, sobre su caucho rojizo ──
  {
    const tC = 79, dC = -8.6;
    const red = 0xc8452e, blue = 0x2a6db5, yellow = 0xe0b520, green = 0x2f6b3a;
    piece(tC, dC, 9.4, 0.05, 6.0, 0x8f463c, 0.16);
    // el columpio
    for (const dt of [-1.9, 1.9]) {
      const [x, z] = at2(tC + dt, dC - 1.9);
      P.box(x, 0.15, z, 0.13, 2.45, 0.13, red, { ry: RY });
    }
    {
      const [x, z] = at2(tC, dC - 1.9);
      P.box(x, 2.48, z, 4.0, 0.13, 0.13, red, { ry: RY });
    }
    for (const dt of [-0.8, 0.8]) {
      const [x, z] = at2(tC + dt, dC - 1.9);
      P.cyl(x, 1.45, z, 0.022, 0.022, 1.02, 0x2a2e32, { seg: 4 });
      P.box(x, 0.63, z, 0.52, 0.09, 0.34, yellow, { ry: RY });
    }
    // la torre del tobogán y su rampa
    {
      const [x, z] = at2(tC + 3.0, dC + 0.6);
      P.box(x, 0.14, z, 1.4, 1.55, 1.4, blue, { ry: RY });
      P.box(x, 1.62, z, 1.62, 0.12, 1.62, blue, { ry: RY });
      P.box(x, 2.0, z, 1.5, 0.5, 0.07, blue, { ry: RY });
    }
    {
      const ramp = new THREE.BoxGeometry(0.9, 0.12, 2.9);
      ramp.rotateX(0.4);
      ramp.rotateY(RY);
      const [x, z] = at2(tC + 3.0, dC + 2.55);
      ramp.translate(x, 1.1, z);
      P.add(ramp, yellow);
      for (const dt of [-0.48, 0.48]) {
        const r2 = new THREE.BoxGeometry(0.07, 0.28, 2.9);
        r2.rotateX(0.4);
        r2.rotateY(RY);
        const [x2, z2] = at2(tC + 3.0 + dt, dC + 2.55);
        r2.translate(x2, 1.2, z2);
        P.add(r2, blue);
      }
    }
    // el balancín
    {
      const [x, z] = at2(tC - 3.3, dC + 1.3);
      P.ball(x, 0.28, z, 0.17, green);
      P.box(x, 0.42, z, 2.2, 0.1, 0.24, green, { ry: RY });
      for (const dt of [-0.75, 0.75]) P.box(x + dt, 0.5, z, 0.26, 0.3, 0.26, red, { ry: RY });
    }
    {
      const [bx, bz] = at2(tC, dC);
      P.block(bx, bz, 9.4, 6.0, RY);
    }
  }

  // ── los flamboyanes de la misma acera, con la copa sobre el paseo ──
  for (const [t, s] of [[13, 1.05], [41, 1.12], [70, 1.0]]) {
    const [x, z] = at2(t, -2.4);
    flamboyan(P, x, z, s);
  }

  // ── la fila de atrás, contra la tapia del fondo ──
  for (const [t, s] of [[18, 0.95], [38, 1.05], [58, 0.92], [80, 1.0]]) {
    const [x, z] = at2(t, -15.6);
    flamboyan(P, x, z, s);
  }

  // ── bancos de tablones mirando a la calle, como el de la foto ──
  for (const t of [6, 26, 46, 62, 73]) {
    const [x, z] = at2(t, -4.4);
    bench(P, x, z, RY);
  }

  // ── farolas y papeleras ──
  for (const t of [4, 30, 56, 68, 90]) {
    const [x, z] = at2(t, -5.7);
    P.cyl(x, 0.14, z, 0.06, 0.09, 5.0, 0x4a4f55, { seg: 8 });
    P.box(x, 4.98, z, 0.34, 0.16, 0.5, 0x3a3f45, { ry: RY });
    panes.push(new THREE.BoxGeometry(0.3, 0.05, 0.44).rotateY(RY).translate(x, 4.975, z));
    P.block(x, z, 0.4, 0.4);
  }
  for (const t of [18, 64]) {
    const [x, z] = at2(t, -5.3);
    P.cyl(x, 0.14, z, 0.05, 0.05, 0.42, 0x4a4f55, { seg: 6 });
    P.cyl(x, 0.52, z, 0.24, 0.2, 0.68, 0x3f4a43, { seg: 10 });
    P.cyl(x, 1.2, z, 0.26, 0.26, 0.05, 0x2e3733, { seg: 10 });
    P.block(x, z, 0.5, 0.5);
  }
}

/**
 * La orilla de Fenauso que sale en la foto: la fila de coches en batería con el morro
 * contra la tapia y los flamboyanes en la acera, camino de la esquina del WOK.
 */
function fenausoParking(scene, colliders) {
  const s = SIDES.west;
  const ry = Math.atan2(s.n[0], s.n[1]);   // el morro mira a la tapia
  const cars = [
    ['suv', 0xb9bdc1], ['sedan', 0x2f4c7a], ['hatch', 0x8a1f1f],
    ['pickup', 0x3f4a52], ['estate', 0xd8d3c8], ['hatch', 0x2a6b4a],
    ['van', 0xe4e0d6], ['sedan', 0x6b2f2f],
  ];
  cars.forEach(([type, color], i) => {
    const car = makeCar(type, color);
    const [x, z] = at(s, s.L - 5.0 - i * 5.0, 4.4);
    car.group.position.set(x, 0, z);
    car.group.rotation.y = ry + 0.82;
    car.group.userData.setLights?.(0);   // aparcados, sin luces
    scene.add(car.group);
    // que no se puedan atravesar
    colliders.addSegment(x - 1.3, z - 1.3, x + 1.3, z - 1.3);
    colliders.addSegment(x + 1.3, z - 1.3, x + 1.3, z + 1.3);
    colliders.addSegment(x + 1.3, z + 1.3, x - 1.3, z + 1.3);
    colliders.addSegment(x - 1.3, z + 1.3, x - 1.3, z - 1.3);
  });
  // los flamboyanes de la acera, pegados a la tapia
  const P = new Kit();
  for (let i = 0; i < 3; i++) {
    const [tx, tz] = at(s, s.L - 3.2 - i * 10.6, 2.3);
    flamboyan(P, tx, tz, 1.22 - i * 0.08);
  }
  const { group, segs } = P.build('C.C. Buganvillas · flamboyanes de Fenauso', { glow: null });
  scene.add(group);
  for (const [ax, az, bx, bz] of segs) colliders.addSegment(ax, az, bx, bz);
}

/** pizarra de la barra: bocadillos del día */
function barChalk(g, W, H) {
  g.fillStyle = '#5a3a22'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#1f2a24'; g.fillRect(W * 0.05, H * 0.04, W * 0.9, H * 0.92);
  txt(g, 'LA MADRILEÑA', W / 2, H * 0.16, W * 0.82, H * 0.1, '#f6d36b', '700', SERIF, 'italic');
  const L = ['Bocadillo de calamares', 'Chorizo criollo', 'Tortilla de papas', 'Queso de cabra', 'Café con leche'];
  g.textAlign = 'center';
  L.forEach((t, i) => txt(g, t, W / 2, H * (0.32 + i * 0.12), W * 0.84, H * 0.075, '#f2efe6', '600', SANS));
}

/**
 * La Madrileña, al otro lado de Peñas del Chache, con su toldo azul.
 * La fachada va pegada a la línea del edificio de OSM (que va inclinada con la calle,
 * 5,6 m al este del eje): así la acera de 2,2 m queda libre para las mesas y no se mete
 * en la calzada.
 */
function laMadrilena(scene, colliders) {
  const s = side([-640.77, 295.6], [0.0838, 0.9965], 10.5);
  place(scene, colliders, s, 'La Madrileña', (k) => {
    const L = s.L, H = 4.1;
    // el bajo del edificio, aplacado de piedra gris como en la foto
    k.box(L / 2, 0, 0.08, L, H, 0.16, 0xe9e4da, { list: k.shell });
    k.box(L / 2, 0, 0.175, L, 0.78, 0.03, 0x8f8c84, { list: k.shell });
    for (let i = 1; i < 3; i++) k.box(L / 2, i * 0.26, 0.195, L, 0.015, 0.02, 0x7c7970);
    for (let i = 0; i < 9; i++) k.box(0.55 + i * 1.2, 0.02, 0.196, 0.02, 0.74, 0.02, 0x7c7970);
    k.box(L / 2, 0.78, 0.2, L, 0.1, 0.07, 0x9d9a92, { list: k.shell });
    k.box(L / 2, H - 0.16, 0.13, L, 0.16, 0.32, 0xf2efe7);

    // ── el bar: dos ventanales y la puerta de cristal ──
    const inside = T(760, 470, barInterior);
    for (const [x, w] of [[4.4, 2.5], [7.2, 2.5]]) {
      k.box(x, 0.62, 0.18, w, 1.95, 0.04, GLASS);
      k.pic(x, 1.6, 0.22, w * 0.95, 1.87, 0, 1, inside, { glow: 0.2 });
      k.box(x, 0.62, 0.25, w, 0.1, 0.09, 0x2a2d31);
      k.box(x, 2.57, 0.25, w + 0.14, 0.1, 0.11, 0x2a2d31);
      k.box(x - w / 2 + 0.05, 0.62, 0.25, 0.09, 1.95, 0.09, 0x2a2d31);
      k.box(x + w / 2 - 0.05, 0.62, 0.25, 0.09, 1.95, 0.09, 0x2a2d31);
      k.box(x, 1.6, 0.25, 0.06, 1.95, 0.08, 0x2a2d31);
    }
    k.box(2.55, 0.32, 0.19, 1.2, 2.4, 0.05, 0x2a2a2c);
    k.pic(2.55, 1.45, 0.24, 1.1, 2.25, 0, 1, T(360, 700, shopGlass('shop')), { glow: 0.15 });
    k.box(2.55, 2.62, 0.26, 1.34, 0.1, 0.12, 0x2a2d31);

    // ── los dos rótulos rojos, uno junto al otro sobre el toldo ──
    for (const x of [4.5, 7.35]) {
      board(k, x, 3.42, 2.85, 0.78, T(900, 240, madrilena), { glow: 0.4, z: 0.2, depth: 0.12 });
    }

    // ── el toldo azul, con su faldón de ondas ──
    const awW = 7.1, awX = 5.45;
    const aw = new THREE.BoxGeometry(awW, 0.06, 1.65);
    aw.rotateX(-0.22);
    aw.translate(0, 0.18, 0.82);
    aw.translate(awX, 2.66, 0);
    k.add(aw, 0x3a3f45);                 // la lona es gris, con el faldón azul
    k.box(awX, 2.48, 1.62, awW, 0.24, 0.05, 0x2f6ae0);
    for (let i = 0; i < 13; i++) k.box(awX - awW / 2 + 0.28 + i * 0.54, 2.37, 1.64, 0.52, 0.11, 0.04, 0x3d7cf0);
    for (const x of [awX - awW / 2 + 0.3, awX + awW / 2 - 0.3]) k.box(x, 2.45, 0.8, 0.045, 0.5, 0.045, 0x9aa1a8);

    // ── las mesas altas y los taburetes de la acera ──
    for (const x of [4.3, 6.1, 7.9]) {
      k.cyl(x, 0.12, 1.45, 0.2, 0.22, 0.03, 0x3a3d42, { seg: 12 });
      k.cyl(x, 0.14, 1.45, 0.045, 0.045, 0.95, 0x6d7378, { seg: 8 });
      k.cyl(x, 1.05, 1.45, 0.26, 0.26, 0.05, 0xf2efe7, { seg: 14 });
      k.block(x, 1.45, 0.55, 0.55);
    }
    for (const x of [3.6, 4.95, 6.75, 8.55]) {
      k.cyl(x, 0.12, 1.15, 0.15, 0.15, 0.03, 0x1b1d20, { seg: 10 });
      k.cyl(x, 0.15, 1.15, 0.03, 0.03, 0.75, 0x2a2d31, { seg: 8 });
      k.cyl(x, 0.9, 1.15, 0.17, 0.17, 0.05, 0x1b1d20, { seg: 12 });
      k.box(x, 0.95, 1.03, 0.3, 0.26, 0.04, 0x1b1d20);
      k.block(x, 1.15, 0.42, 0.42);
    }
    // el tablón azul de la carta, junto a la puerta
    k.box(2.05, 0.12, 1.15, 0.66, 1.15, 0.08, 0xbfd3e0, { ry: 0.22 });
    k.pic(2.05, 0.7, 1.2, 0.58, 1.05, -0.22, 1, T(320, 460, barChalk), { glow: 0.12 });

    // ── la vecina de la izquierda: ventana con reja, toldo curvo y puerta de madera ──
    k.box(0.55, 0.7, 0.18, 1.0, 1.45, 0.03, 0x14181c);
    for (let i = 0; i < 6; i++) k.box(0.1 + i * 0.18, 0.72, 0.24, 0.04, 1.4, 0.05, 0x6d7378);
    for (let i = 0; i < 4; i++) k.box(0.55, 0.85 + i * 0.38, 0.24, 0.98, 0.045, 0.05, 0x6d7378);
    // el toldo largo y curvado de la vecina, de lona azul
    const cw = new THREE.BoxGeometry(3.1, 0.05, 0.85);
    cw.rotateX(-0.42);
    cw.translate(0.45, 2.5, 0.42);
    k.add(cw, 0x2f5bc4);
    k.box(0.45, 2.2, 0.92, 3.1, 0.18, 0.05, 0x2440a0);
    for (let i = 0; i < 7; i++) k.box(0.45 - 1.55 + 0.24 + i * 0.44, 2.09, 0.93, 0.42, 0.09, 0.03, 0x2f5bc4);
    // la puerta de madera con su número
    k.box(1.45, 0.15, 0.17, 0.95, 2.3, 0.06, 0x5a3a24);
    k.pic(1.45, 1.3, 0.22, 0.85, 2.1, 0, 1, T(300, 700, (g, W, H2) => {
      g.fillStyle = '#5a3a24'; g.fillRect(0, 0, W, H2);
      g.fillStyle = 'rgba(0,0,0,.28)';
      g.fillRect(W * 0.14, H2 * 0.08, W * 0.32, H2 * 0.36); g.fillRect(W * 0.54, H2 * 0.08, W * 0.32, H2 * 0.36);
      g.fillRect(W * 0.14, H2 * 0.5, W * 0.32, H2 * 0.4); g.fillRect(W * 0.54, H2 * 0.5, W * 0.32, H2 * 0.4);
      g.fillStyle = '#d8b268'; g.beginPath(); g.arc(W * 0.88, H2 * 0.5, W * 0.03, 0, Math.PI * 2); g.fill();
    }), { glow: 0 });
    k.pic(1.45, 2.72, 0.28, 0.22, 0.17, 0, 1, T(120, 96, (g, W, H2) => {
      g.fillStyle = '#f2efe7'; g.fillRect(0, 0, W, H2);
      txt(g, '10', W / 2, H2 / 2, W * 0.8, H2 * 0.62, '#1b4ea8', '800', SANS);
    }), { glow: 0 });

    // ── el aplacado de piedra del edificio de al lado, y el aparato de aire ──
    k.box(9.8, 0, 0.19, 1.4, 4.0, 0.06, 0xd9d2c2, { list: k.shell });
    for (let i = 0; i < 8; i++) k.box(9.8, 0.1 + i * 0.48, 0.23, 1.36, 0.03, 0.02, 0xc4bcab);
    k.box(8.85, 3.22, 0.62, 0.95, 0.5, 0.42, 0xe4e2dc);
    k.box(8.85, 3.26, 0.86, 0.8, 0.34, 0.05, 0x8d939a);
    k.cyl(9.3, 0.1, 0.45, 0.05, 0.05, 3.9, 0x8d939a, { seg: 8 });
  });
}

/** los toldos de las tiendas de enfrente de Manolo Millares */
function oppositeShops(scene, colliders) {
  const s = side([-669.0, 371.1], [-1, 0], 11.0);
  place(scene, colliders, s, 'Comercios de enfrente', (k) => {
    k.box(3.0, 0, 0.08, 6.0, 3.0, 0.14, 0xd8d3c8, { list: k.shell });
    k.box(3.0, 0, 0.17, 6.0, 0.9, 0.03, 0x5a3a2a, { list: k.shell });
    k.box(3.0, 2.35, 0.7, 5.6, 0.08, 1.5, 0xb31c22);
    for (let i = 0; i < 7; i++) k.box(0.5 + i * 0.86, 2.24, 1.38, 0.72, 0.18, 0.05, 0x8a151a);
    board(k, 3.0, 2.5, 4.4, 0.66, T(1000, 150, ferreteria), { glow: 0.25, z: 0.1, depth: 0.12 });
    k.box(8.2, 0, 0.08, 4.6, 3.0, 0.14, 0xd8d3c8, { list: k.shell });
    k.box(8.2, 0, 0.17, 4.6, 0.9, 0.03, 0x3a5a3a, { list: k.shell });
    k.box(8.2, 2.3, 0.66, 4.2, 0.08, 1.35, 0xd8b422);
    for (let i = 0; i < 6; i++) k.box(6.3 + i * 0.72, 2.19, 1.28, 0.6, 0.17, 0.05, 0xb8961a);
    board(k, 8.2, 2.45, 3.6, 0.62, T(860, 150, alimentacion), { glow: 0.25, z: 0.1, depth: 0.12 });
  });
}

// ── se monta todo ──

export async function buildBuganvillas(scene, colliders) {
  place(scene, colliders, SIDES.south, 'C.C. Buganvillas · Manolo Millares', southFacade);
  place(scene, colliders, SIDES.chamfer, 'C.C. Buganvillas · esquina WOK', chamferFacade);
  place(scene, colliders, SIDES.chamferSE, 'C.C. Buganvillas · esquina Buganvillas', chamferSEFacade);
  place(scene, colliders, SIDES.east, 'C.C. Buganvillas · Peñas del Chache', eastFacade);
  place(scene, colliders, SIDES.north, 'C.C. Buganvillas · Aniagua', northFacade);
  place(scene, colliders, SIDES.west, 'C.C. Buganvillas · Fenauso', westFacade);

  // los trastos de la calle, la plaza y lo de enfrente
  const P = new Kit();
  const panes = [];
  streetProps(P);
  parqueAniagua(P, panes);
  const { group, segs } = P.build('C.C. Buganvillas · contenedores y plaza', { glow: null });
  scene.add(group);
  for (const [ax, az, bx, bz] of segs) colliders.addSegment(ax, az, bx, bz);
  // el cristal de las farolas de la plaza: gris apagado de día y encendido de noche, como las de la calle
  const paneMat = new THREE.MeshStandardMaterial({ color: 0x8f958f, emissive: 0xffd9a0, emissiveIntensity: 0, roughness: 0.35, metalness: 0.15 });
  if (panes.length) {
    const glass = new THREE.Mesh(mergeGeometries(panes, false), paneMat);
    glass.name = 'parqueAniaguaFarolas';
    scene.add(glass);
  }

  laMadrilena(scene, colliders);
  oppositeShops(scene, colliders);
  fenausoParking(scene, colliders);

  // los aparatos de la azotea (vistos desde arriba, como en la ortofoto)
  const R = new Kit();
  for (const [x, z] of [[-665, 300], [-672, 318], [-680, 332], [-660, 292], [-678, 344], [-658, 338]]) {
    R.box(x, 6.24, z, 1.8, 0.85, 1.3, 0xc8ccd0);
    R.box(x, 7.09, z, 1.9, 0.08, 1.4, 0x9aa1a8);
    R.cyl(x, 7.17, z, 0.55, 0.55, 0.06, 0x4a4f55, { seg: 14 });
  }
  // la claraboya del pasillo del centro, que se ve desde arriba
  R.box(-673.5, 6.24, 314, 3.6, 0.18, 26.0, 0xb8bec4, { ry: -0.08 });
  R.box(-673.5, 6.42, 314, 2.6, 0.12, 25.0, 0x9fb6c4, { ry: -0.08 });
  for (let i = 0; i < 9; i++) R.box(-673.5, 6.5, 302 + i * 3.0, 2.7, 0.05, 0.16, 0x8d9aa4, { ry: -0.08 });
  // la caja de la escalera y su puerta, con barandilla
  R.box(-687.5, 6.24, 291, 4.2, 3.0, 3.6, 0xe8e4da);
  R.box(-687.5, 9.24, 291, 4.4, 0.16, 3.8, 0xd8d3c8);
  R.box(-687.5, 6.24, 292.85, 1.2, 2.2, 0.1, 0x6d7378);
  // chimeneas de ventilación
  for (const [x, z] of [[-680, 340], [-663, 326], [-684, 302]]) {
    R.cyl(x, 6.24, z, 0.28, 0.32, 1.1, 0xb8b2a6, { seg: 10 });
    R.cyl(x, 7.34, z, 0.36, 0.36, 0.12, 0x8d939a, { seg: 10 });
  }
  R.cyl(-688.0, 6.24, 285.5, 1.0, 1.0, 1.9, 0xd8d3c8, { seg: 14 });
  R.cyl(-686.0, 6.24, 287.6, 0.8, 0.8, 1.6, 0xd8d3c8, { seg: 14 });
  R.cyl(-670, 6.24, 286, 0.06, 0.06, 5.0, 0x3a3f45, { seg: 6 });
  R.box(-656, 6.24, 350, 1.2, 1.0, 1.2, 0x8d939a);
  const roof = R.build('C.C. Buganvillas · azotea');
  scene.add(roof.group);

  return {
    group,
    // el cristal de las farolas de la plaza: apagado de día y encendido de noche, como las de la calle
    update() {
      const on = windowGlow.value > 0.02;
      paneMat.color.setHex(on ? 0xfff0c8 : 0x8f958f);
      paneMat.emissiveIntensity = windowGlow.value * 5;
    },
  };
}
