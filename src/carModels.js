import * as THREE from 'three';
import { mergeGeometries, toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';
import { contactShadowTexture, plateTexture } from './textures.js';
import { brandMaterial, brandReady, drawRearBanner } from './brand.js';

/**
 * Coches por secciones: a lo largo del coche se colocan secciones
 * transversales (bajos, costado abombado, hombro, cabina que se estrecha y
 * techo) y se unen en una sola malla redondeada. Cada cara se pinta según
 * dónde cae: chapa, cristal, marcos, pasos de rueda, juntas de puertas o
 * rotulación. Morro y zaga llevan un "frontal" dibujado (faros, parrilla,
 * logotipo, pilotos, modelo) que brilla de noche.
 *
 * Marcas y modelos inventados, con nombres de aquí. Toda la geometría es original.
 */

// ── colores de cada cara ──
// la chapa multiplica el color de la pintura; plásticos, gomas e interior van
// con su propio material mate y los cristales con uno oscuro y brillante
const K = {
  paint: [1, 1, 1],
  stripe: [0.02, 0.022, 0.025],
  blue: [0.03, 0.11, 0.42],
  yellow: [0.92, 0.66, 0.04],
  glass: [0, 0, 0],
  black: [0.03, 0.032, 0.035],
  under: [0.012, 0.012, 0.013],
  gap: [0.018, 0.018, 0.02],
  interior: [0.075, 0.06, 0.05],
  seat: [0.11, 0.07, 0.05],
  bed: [0.04, 0.04, 0.045],
  grey: [0.3, 0.31, 0.33],
};
const TRIM = new Set([K.black, K.under, K.gap, K.interior, K.seat, K.bed, K.grey]);
/** 0 pintura · 1 plástico/goma/interior · 2 cristal */
const classOf = (col) => (col === K.glass ? 2 : TRIM.has(col) ? 1 : 0);

// ── modelos ──
// z hacia delante (morro en +z), y hacia arriba desde el asfalto, medidas en metros.
// deck: perfil de capó, cintura y maletero · roof: perfil de la cabina
// topGlass: tramos del techo que son luna (parabrisas / luneta) · win: tramo de ventanillas
// fender: cuánto suben las aletas sobre las ruedas (deportivos)
const MODELS = {
  hatch: {
    brand: 'Guanche', name: 'Chinijo', len: [-2.03, 2.03], width: 1.75, clear: 0.16,
    wheelR: 0.31, wheels: [1.33, -1.23], rim: 'alloy5',
    deck: [[-2.03, 0.98], [-1.96, 1.02], [-1.0, 1.0], [0.9, 0.96], [1.5, 0.9], [1.9, 0.8], [2.03, 0.7]],
    // portón inclinado: la luneta va en la propia carrocería
    roof: [[-1.97, 1.0], [-1.82, 1.38], [-1.6, 1.44], [-0.6, 1.46], [0.1, 1.44], [0.92, 0.96]],
    topGlass: [[-1.95, -1.66], [0.12, 0.92]], win: [-1.32, 0.86], pillars: [-0.36], doors: [0.9, -0.36, -1.42],
    tumble: 0.17, front: { lights: 'swept', grille: 'mesh' }, rear: { lights: 'pair' },
    colors: [0xd8271c, 0xf2f2f2, 0x2f6fb5, 0xf2c500, 0x22262c, 0x9aa5ad, 0x6fbf73],
    drive: { MAX_SPEED: 40, ENGINE: 13, RADIUS: 1.15, WHEELBASE: 2.5 },
  },
  sedan: {
    brand: 'Alisio', name: 'Berlina', len: [-2.32, 2.32], width: 1.8, clear: 0.17,
    wheelR: 0.32, wheels: [1.42, -1.27], rim: 'alloy5',
    deck: [[-2.32, 0.93], [-2.24, 1.0], [-1.7, 1.04], [-1.2, 1.03], [1.0, 0.98], [1.6, 0.92], [2.1, 0.83], [2.32, 0.73]],
    roof: [[-1.68, 1.04], [-1.05, 1.41], [-0.7, 1.45], [0.25, 1.46], [1.02, 0.98]],
    topGlass: [[-1.64, -1.08], [0.28, 1.02]], win: [-1.24, 0.96], pillars: [-0.18], doors: [0.98, -0.18, -1.3],
    front: { lights: 'swept', grille: 'bars' }, rear: { lights: 'wide' },
    colors: [0xf2f2f2, 0xb8bec4, 0x5b6168, 0x1b1e22, 0x22406b, 0x6b1e24],
    drive: { MAX_SPEED: 44, ENGINE: 13 },
  },
  estate: {
    brand: 'Alisio', name: 'Familiar', len: [-2.32, 2.32], width: 1.8, clear: 0.17,
    wheelR: 0.32, wheels: [1.42, -1.27], rim: 'alloy5',
    deck: [[-2.32, 0.98], [-2.25, 1.02], [-1.6, 1.04], [1.0, 0.98], [1.6, 0.92], [2.1, 0.83], [2.32, 0.73]],
    roof: [[-2.32, 1.34], [-2.12, 1.42], [-0.5, 1.45], [0.25, 1.44], [1.02, 0.98]],
    topGlass: [[0.28, 1.02]], win: [-2.02, 0.96], pillars: [-0.18, -1.36], doors: [0.98, -0.18, -1.3],
    roofRails: true, front: { lights: 'swept', grille: 'bars' }, rear: { lights: 'pair', window: true },
    colors: [0xb8bec4, 0xf2f2f2, 0x2f4a3a, 0x2c4f86, 0xcdbb94, 0x3a3f45],
    drive: { MAX_SPEED: 43, ENGINE: 12.5 },
  },
  suv: {
    brand: 'Malpaís', name: '4x4', len: [-2.38, 2.38], width: 1.92, clear: 0.3,
    wheelR: 0.39, tireW: 0.28, wheels: [1.48, -1.42], rim: 'alloy6', archGap: 0.08,
    deck: [[-2.38, 1.12], [-2.32, 1.18], [1.35, 1.18], [1.95, 1.13], [2.3, 1.04], [2.38, 0.96]],
    roof: [[-2.38, 1.84], [-2.05, 1.9], [0.75, 1.9], [1.42, 1.18]],
    topGlass: [[0.72, 1.42]], win: [-2.05, 1.34], pillars: [-0.04, -1.46], doors: [1.33, -0.05, -1.5],
    tumble: 0.07, nose: [0.25, 0.08], tail: [0.2, 0.06], cladding: true, roofRails: true, spare: true,
    front: { lights: 'square', grille: 'big', fog: true }, rear: { lights: 'vertical', window: true },
    colors: [0xf2f2f2, 0x1b1e22, 0x4a4f55, 0xc8b48a, 0x2f4a3a, 0x9a1e1e],
    drive: { MAX_SPEED: 41, ENGINE: 12, RADIUS: 1.35, WHEELBASE: 2.9 },
  },
  pickup: {
    brand: 'Majorero', name: 'Faena', len: [-2.62, 2.62], width: 1.86, clear: 0.3,
    wheelR: 0.38, tireW: 0.27, wheels: [1.62, -1.5], rim: 'alloy6', archGap: 0.06,
    // caja abierta: el suelo queda hundido entre las paredes
    deck: [[-2.62, 1.08], [-2.56, 1.1], [-0.7, 1.12], [1.32, 1.14], [1.95, 1.09], [2.45, 1.0], [2.62, 0.92]],
    roof: [[-0.68, 1.12], [-0.58, 1.8], [0.62, 1.84], [1.36, 1.14]],
    topGlass: [[-0.68, -0.58], [0.6, 1.36]], win: [-0.5, 1.3], pillars: [0.27], doors: [1.3, 0.27, -0.52],
    tumble: 0.08, nose: [0.25, 0.08], tail: [0.1, 0.03], cladding: true, bed: [-2.54, -0.76], bedDepth: 0.28,
    front: { lights: 'square', grille: 'big', fog: true }, rear: { lights: 'vertical', tailgate: true },
    colors: [0xf2f2f2, 0xf2f2f2, 0xb8bec4, 0x9a1e1e, 0x1b1e22, 0x22406b],
    drive: { MAX_SPEED: 40, ENGINE: 12, RADIUS: 1.4, WHEELBASE: 3.1 },
  },
  van: {
    brand: 'Jameo', name: 'Cargo', len: [-2.8, 2.8], width: 1.98, clear: 0.24,
    wheelR: 0.36, tireW: 0.25, wheels: [1.92, -1.7], rim: 'steel',
    deck: [[-2.8, 1.22], [1.6, 1.22], [2.1, 1.13], [2.55, 1.02], [2.8, 0.9]],
    roof: [[-2.8, 2.38], [-2.5, 2.44], [0.95, 2.44], [1.55, 1.95], [2.08, 1.13]],
    topGlass: [[1.05, 2.08]], win: [0.82, 2.0], doors: [1.95, 0.8, 0.62, -0.75],
    tumble: 0.03, nose: [0.2, 0.07], tail: [0.12, 0.04], crown: 0.02, bulge: 0.008,
    front: { lights: 'van', grille: 'van', fog: true }, rear: { lights: 'vertical', cargo: true }, ad: true,
    colors: [0xf2f2f2, 0xf2f2f2, 0xf2f2f2, 0xb8bec4, 0x8fb8d8, 0xc8352a],
    drive: { MAX_SPEED: 33, ENGINE: 9, BRAKE: 18, RADIUS: 1.5, WHEELBASE: 3.6, MAX_STEER: 0.55 },
  },
  truck: {
    brand: 'Majorero', name: 'Tonelada', len: [-3.3, 3.3], width: 2.06, clear: 0.32,
    wheelR: 0.4, tireW: 0.26, wheels: [2.2, -1.6], rim: 'steel', archGap: 0.06,
    // chasis bajo detrás de la cabina: encima va la caja (ver box)
    deck: [[-3.3, 0.98], [1.0, 0.98], [1.12, 1.26], [2.75, 1.26], [3.15, 1.14], [3.3, 1.0]],
    roof: [[1.12, 1.26], [1.17, 2.52], [2.5, 2.56], [3.0, 2.3], [3.16, 1.27]],
    topGlass: [[2.52, 3.16]], win: [1.95, 3.0], doors: [3.05, 1.8],
    tumble: 0.03, nose: [0.16, 0.05], tail: [0.06, 0.02], crown: 0.015, bulge: 0.006,
    box: { z: [-3.3, 1.06], w: 2.3, y: [1.0, 3.25] },
    front: { lights: 'van', grille: 'van', fog: true }, rear: { lights: 'vertical' },
    colors: [0xf2f2f2, 0xf2f2f2, 0xeae6dc, 0x2c4f86],
    drive: { MAX_SPEED: 27, ENGINE: 6.5, BRAKE: 15, RADIUS: 1.7, WHEELBASE: 3.8, MAX_STEER: 0.5 },
  },
  kangoo: {
    brand: 'Guanche', name: 'Reparto', len: [-2.2, 2.2], width: 1.8, clear: 0.18,
    wheelR: 0.31, wheels: [1.42, -1.38], rim: 'steel',
    deck: [[-2.2, 1.0], [1.0, 1.02], [1.6, 0.96], [2.05, 0.85], [2.2, 0.73]],
    roof: [[-2.2, 1.78], [-1.95, 1.84], [0.3, 1.84], [1.12, 1.02]],
    topGlass: [[0.3, 1.12]], win: [-0.35, 1.08], doors: [1.05, -0.4, -0.56],
    tumble: 0.05, nose: [0.3, 0.1],
    front: { lights: 'swept', grille: 'mesh' }, rear: { lights: 'vertical', window: true }, ad: true,
    colors: [0xf2f2f2, 0xf2f2f2, 0xc8352a, 0xe7c43a, 0x2c5cc5, 0xb8bec4],
    drive: { MAX_SPEED: 37, ENGINE: 11, RADIUS: 1.2 },
  },
  sport: {
    brand: 'Volcanía', name: 'Timanfaya GT', len: [-2.25, 2.25], width: 1.85, clear: 0.13,
    wheelR: 0.34, tireW: 0.27, wheels: [1.38, -1.25], rim: 'sport', caliper: 0xd81c12, archGap: 0.05,
    deck: [[-2.25, 0.66], [-2.15, 0.84], [-1.8, 0.93], [-1.2, 0.97], [0.9, 0.92], [1.6, 0.84], [2.1, 0.7], [2.25, 0.57]],
    roof: [[-2.0, 0.93], [-1.3, 1.08], [-0.55, 1.26], [0.22, 1.28], [0.95, 0.92]],
    topGlass: [[-1.25, -0.55], [0.2, 0.95]], win: [-0.85, 0.9], pillars: [-0.45], doors: [0.92, -0.42],
    tumble: 0.2, nose: [0.45, 0.2], tail: [0.4, 0.16], bulge: 0.03, fender: 0.07, spoiler: 'duck', exhaust: 2,
    pillarCol: 'black', front: { lights: 'oval', grille: 'none' }, rear: { lights: 'wide' },
    colors: [0xd8271c, 0xf2c500, 0xc0c4c8, 0x101418, 0xf2f2f2, 0xff7a00],
    drive: { MAX_SPEED: 52, ENGINE: 17, BRAKE: 25, RADIUS: 1.25 },
  },
  super: {
    brand: 'Volcanía', name: 'Cráter', len: [-2.3, 2.3], width: 2.0, clear: 0.11,
    wheelR: 0.35, tireW: 0.3, wheels: [1.4, -1.35], rim: 'sport', caliper: 0xf2c500, archGap: 0.045,
    deck: [[-2.3, 0.8], [-2.15, 0.93], [-1.5, 0.99], [-0.6, 0.99], [0.5, 0.9], [1.6, 0.75], [2.15, 0.57], [2.3, 0.47]],
    roof: [[-1.75, 0.99], [-0.85, 1.15], [-0.15, 1.17], [0.98, 0.85]],
    topGlass: [[-0.12, 0.98]], win: [-0.75, 0.88], doors: [0.85, -0.7], intake: [-1.15, -0.78],
    tumble: 0.28, nose: [0.6, 0.26], tail: [0.3, 0.12], bulge: 0.025, fender: 0.11, roofCol: 'black',
    pillarCol: 'black', spoiler: 'wing', exhaust: 1,
    front: { lights: 'slim', grille: 'intake' }, rear: { lights: 'slim' },
    colors: [0xf2c500, 0x76b041, 0xff7a00, 0x101418, 0xf2f2f2, 0xd8271c],
    drive: { MAX_SPEED: 58, ENGINE: 19, BRAKE: 27, RADIUS: 1.3 },
  },
  muscle: {
    brand: 'Atlántica', name: 'Bravo', len: [-2.42, 2.42], width: 1.9, clear: 0.15,
    wheelR: 0.35, tireW: 0.27, wheels: [1.5, -1.35], rim: 'classic',
    deck: [[-2.42, 0.86], [-2.35, 0.98], [-1.7, 1.01], [0.75, 1.02], [2.1, 0.98], [2.35, 0.9], [2.42, 0.8]],
    roof: [[-1.75, 1.01], [-0.9, 1.3], [0.2, 1.33], [0.82, 1.02]],
    topGlass: [[-1.55, -0.9], [0.2, 0.82]], win: [-0.95, 0.78], doors: [0.78, -0.65],
    tumble: 0.14, nose: [0.25, 0.08], tail: [0.2, 0.06], fender: 0.03, stripes: true, scoop: true, spoiler: 'lip', exhaust: 2,
    front: { lights: 'round2', grille: 'muscle' }, rear: { lights: 'bar3' },
    colors: [0x1f4d36, 0x2c5cc5, 0xe2661b, 0xc8221e, 0x101418, 0xf2f2f2],
    drive: { MAX_SPEED: 50, ENGINE: 18, RADIUS: 1.3 },
  },
  cabrio: {
    brand: 'Papagayo', name: 'Spider', len: [-2.0, 2.0], width: 1.76, clear: 0.13,
    wheelR: 0.32, wheels: [1.24, -1.18], rim: 'alloy5', archGap: 0.06,
    deck: [[-2.0, 0.78], [-1.85, 0.9], [-1.2, 0.93], [0.5, 0.9], [1.4, 0.82], [1.9, 0.68], [2.0, 0.6]],
    // solo el parabrisas: descapotable
    roof: [[0.2, 0.91], [0.23, 1.2], [0.31, 1.22], [0.78, 0.9]],
    topGlass: [[0.3, 0.78]], open: true, cockpit: [-1.05, 0.2], doors: [0.7, -0.75],
    tumble: 0.22, nose: [0.45, 0.2], tail: [0.4, 0.16], bulge: 0.03, fender: 0.05, seats: true,
    front: { lights: 'oval', grille: 'mesh' }, rear: { lights: 'round4' },
    colors: [0xd8271c, 0x6fb6e0, 0xf2f2f2, 0x1d4a33, 0xf2c500, 0xc0c4c8],
    drive: { MAX_SPEED: 48, ENGINE: 15, RADIUS: 1.15, WHEELBASE: 2.4 },
  },
  beetle: {
    brand: 'Guanche', name: 'Tunera', len: [-2.0, 2.0], width: 1.62, clear: 0.2,
    wheelR: 0.33, tireW: 0.2, wheels: [1.2, -1.2], rim: 'classic',
    deck: [[-2.0, 0.62], [-1.92, 0.82], [-1.65, 0.96], [-1.2, 1.0], [0.6, 0.98], [1.3, 0.92], [1.8, 0.8], [2.0, 0.6]],
    roof: [[-1.6, 0.97], [-1.15, 1.32], [-0.5, 1.48], [0.1, 1.47], [0.75, 0.97]],
    topGlass: [[-1.42, -1.05], [0.22, 0.75]], win: [-1.02, 0.66], pillars: [-0.35], doors: [0.7, -0.38],
    tumble: 0.3, nose: [0.6, 0.3], tail: [0.55, 0.3], crown: 0.08, roofCrown: 0.05, bulge: 0.04,
    fenders: true, front: { lights: 'none', grille: 'none' }, rear: { lights: 'round2' },
    colors: [0x7fb2d6, 0xeadfb8, 0xb83228, 0xe7c43a, 0x6e9b52, 0xf2f2f2],
    drive: { MAX_SPEED: 34, ENGINE: 10, RADIUS: 1.1, WHEELBASE: 2.4 },
  },
};
// variantes con rotulación: taxi y Policía Local (sobre la berlina blanca)
MODELS.taxi = { ...MODELS.sedan, name: 'Taxi', taxi: true, colors: [0xf2f2f2] };
MODELS.police = {
  ...MODELS.sedan, name: 'Policía Local', livery: 'police', checker: 0.24, lightBar: true, colors: [0xf4f5f7],
  rear: { ...MODELS.sedan.rear, text: 'POLICÍA LOCAL' },
};

const DEFAULTS = {
  width: 1.8, clear: 0.18, wheelR: 0.32, tireW: 0.24, rim: 'alloy5', tumble: 0.16, crown: 0.03,
  roofCrown: 0.02, bulge: 0.02, inset: 0.05, nose: [0.38, 0.12], tail: [0.3, 0.09], lift: [0.06, 0.05],
  archGap: 0.07, fender: 0, bedDepth: 0.28,
  pillarCol: 'paint', roofCol: 'paint', doors: [], pillars: [], topGlass: [],
};

export const TYPE_NAMES = Object.keys(MODELS);
/** marca y modelo, para el cartel al subirte ("Volcanía Timanfaya GT") */
export function modelName(type) {
  const m = MODELS[type];
  return m ? `${m.brand} ${m.name}` : '';
}
/** cómo va cada coche (velocidad, aceleración, tamaño): lo usa car.js */
export const DRIVE = Object.fromEntries(Object.entries(MODELS).map(([k, m]) => [k, m.drive || {}]));

// ── utilidades ──
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };

/** curva suave que pasa por los puntos [[z, y], ...] sin pasarse (Fritsch–Carlson) */
function curve(pts) {
  const n = pts.length, xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const d = [];
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  const m = new Array(n);
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
  }
  return (x) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i], t = (x - xs[i]) / h, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
  };
}

function prep(type) {
  const m = MODELS[type] || MODELS.sedan;
  const s = { ...DEFAULTS, ...m, type };
  s.zr = s.len[0]; s.zf = s.len[1];
  s.deckF = curve(s.deck);
  s.roofF = curve(s.roof);
  s.cabZ = [s.roof[0][0], s.roof[s.roof.length - 1][0]];
  s.archR = s.wheelR + s.archGap;
  return s;
}

/**
 * sección transversal en z: medio ancho, bajos (en el centro y en el borde,
 * que sube para abrir el paso de rueda), cintura, borde de las aletas y techo
 */
function section(s, z) {
  const dF = s.zf - z, dR = z - s.zr;
  let k = 1;
  if (dF < s.nose[0]) k -= s.nose[1] * (1 - dF / s.nose[0]) ** 2;
  if (dR < s.tail[0]) k -= s.tail[1] * (1 - dR / s.tail[0]) ** 2;
  const hw = (s.width / 2) * k;
  let yb = s.clear;
  if (dF < 0.4) yb += s.lift[0] * (1 - dF / 0.4) ** 2;
  if (dR < 0.4) yb += s.lift[1] * (1 - dR / 0.4) ** 2;
  const yt = s.deckF(z);
  let fen = 0, arch = 0;
  for (const wz of s.wheels) {
    const d = Math.abs(z - wz), span = s.archR + 0.32;
    if (s.fender && d < span) fen = Math.max(fen, s.fender * Math.cos((d / span) * Math.PI / 2) ** 2);
    if (d <= s.archR) arch = Math.max(arch, s.wheelR + Math.sqrt(s.archR * s.archR - d * d));
  }
  const yo = yt + fen;
  let yr = yt;
  if (z >= s.cabZ[0] - 1e-6 && z <= s.cabZ[1] + 1e-6) yr = Math.max(yt, s.roofF(z));
  yb = Math.min(yb, yt - 0.12);
  const ybo = Math.max(yb, Math.min(arch, yo - 0.13));
  return { z, hw, yb, ybo, yt, yo, yr, cab: yr - yt };
}

// media sección derecha: 16 puntos de los bajos al centro del techo
const TAGS = ['under', 'under', 'rocker', 'side', 'side', 'side', 'side', 'side', 'shoulder', 'belt', 'glass', 'glass', 'rail', 'top', 'top'];
function halfRing(s, c) {
  const { hw, yb, ybo, yt, yo, yr, cab } = c;
  const rl = Math.min(0.11, (yo - ybo) * 0.25);
  const p = [[0, yb], [hw - rl, ybo], [hw - rl * 0.3, ybo + rl * 0.3], [hw, ybo + rl]];
  // costado: las líneas van a la misma altura que en el resto del coche y solo
  // se aprietan contra el borde del paso de rueda (así las franjas no se doblan)
  const y0 = ybo + rl, y1 = yo - 0.07;
  const base = yb + Math.min(0.11, (yo - yb) * 0.25);
  for (let i = 1; i <= 5; i++) {
    const y = Math.min(y1, Math.max(y0 + i * 0.004, base + (y1 - base) * (i / 5)));
    const t = Math.max(0, Math.min(1, (y - base) / Math.max(1e-3, y1 - base)));
    p.push([hw + s.bulge * s.width * Math.sin(Math.PI * t * 0.9), y]);
  }
  p.push([hw - 0.035, yo - 0.012]);
  const cr = s.crown, f = yo - yt;
  let deck = [
    [hw - 0.09, yo + cr * 0.25], [hw * 0.78, yt + f * 0.45 + cr * 0.5], [hw * 0.62, yt + f * 0.12 + cr * 0.65],
    [hw * 0.48, yt + cr * 0.78], [hw * 0.25, yt + cr * 0.93], [0, yt + cr],
  ];
  if (s.bed && c.z > s.bed[0] && c.z < s.bed[1]) {
    // caja de la pick-up: canto, pared interior y suelo
    const fl = yt - s.bedDepth;
    deck = [[hw - 0.075, yt], [hw - 0.1, fl], [hw * 0.62, fl], [hw * 0.4, fl], [hw * 0.2, fl], [0, fl]];
  }
  const hb = hw - s.inset, ht = hb * (1 - s.tumble), rc = s.roofCrown;
  const cabin = [
    [hb, yo + 0.008],
    [(hb + ht) / 2 + 0.012, Math.max(yo + 0.01, (yo + yr) / 2)],
    [ht, Math.max(yo + 0.015, yr - 0.07)],
    [ht - 0.06, Math.max(yo + 0.02, yr - 0.012)],
    [ht * 0.45, yr + rc * 0.7],
    [0, yr + rc],
  ];
  const b = smooth(cab / 0.1);
  for (let i = 0; i < 6; i++) p.push([lerp(deck[i][0], cabin[i][0], b), lerp(deck[i][1], cabin[i][1], b)]);
  return p;
}
const fullRing = (half) => [...half, ...half.slice(1, 15).reverse().map(([x, y]) => [-x, y])];

function stations(s) {
  const zs = [];
  for (let z = s.zr; z < s.zf; z += 0.1) zs.push(z);
  zs.push(s.zf);
  for (const d of [0.012, 0.03, 0.06, 0.1, 0.15, 0.22]) zs.push(s.zr + d, s.zf - d);
  // pasos de rueda: más secciones donde el arco cae en picado
  for (const wz of s.wheels) {
    for (let i = -10; i <= 10; i++) zs.push(wz + Math.sin((i / 10) * Math.PI / 2) * s.archR);
    zs.push(wz - s.archR - 0.004, wz + s.archR + 0.004);
  }
  const marks = [
    ...s.doors.flatMap(d => [d - 0.007, d + 0.007]), ...s.pillars.flatMap(p => [p - 0.045, p + 0.045]),
    ...(s.win || []), ...s.topGlass.flat(), ...(s.cockpit || []), ...(s.intake || []), ...s.cabZ,
    ...(s.bed ? s.bed.flatMap(b => [b - 0.004, b + 0.004]) : []),
  ];
  zs.push(...marks);
  if (s.checker) for (let z = Math.ceil(s.zr / s.checker) * s.checker; z < s.zf; z += s.checker) zs.push(z);
  return [...new Set(zs.filter(z => z >= s.zr && z <= s.zf).map(z => Math.round(z * 1000) / 1000))].sort((a, b) => a - b);
}

/** color de una cara según su sitio en la carrocería */
function faceColor(s, j, z, y, c) {
  const tag = TAGS[j];
  if (tag === 'under') return K.under;
  const lower = tag === 'rocker' || tag === 'side' || tag === 'shoulder';
  if ((lower || tag === 'belt') && s.doors.some(d => Math.abs(z - d) < 0.007)) return K.gap;
  if (tag === 'rocker') return s.cladding ? K.black : K.paint;
  if (tag === 'side') {
    const k = j - 3;
    if (s.cladding && k === 0) return K.black;
    if (s.intake && k >= 1 && k <= 3 && z > s.intake[0] && z < s.intake[1]) return K.black;
    if (s.livery === 'police' && (k === 2 || k === 3)) return (Math.floor((z + 20) / s.checker) + k) % 2 ? K.yellow : K.blue;
    return K.paint;
  }
  if (tag === 'shoulder' || tag === 'belt') return K.paint;
  if (c.cab < 0.05) {
    // capó, maletero, caja de la pick-up o habitáculo abierto
    if (s.bed && z > s.bed[0] - 0.005 && z < s.bed[1] + 0.005 && j >= 10) return K.bed;
    if (s.cockpit && z > s.cockpit[0] && z < s.cockpit[1] && j >= 11) return K.interior;
    if (s.stripes && j === 14) return K.stripe;
    return K.paint;
  }
  if (s.open) return s.topGlass.some(([a, b]) => z > a && z < b) && j >= 13 ? K.glass : K.black;
  if (tag === 'glass') {
    const inWin = s.win && z > s.win[0] && z < s.win[1] && c.cab > 0.1;
    if (inWin) return s.pillars.some(p => Math.abs(z - p) < 0.045) ? K.black : K.glass;
    return s.pillarCol === 'paint' ? K.paint : K.black;
  }
  if (tag === 'rail') return s.roofCol === 'black' ? K.black : K.paint;
  if (s.topGlass.some(([a, b]) => z > a && z < b)) return K.glass;
  if (s.stripes && j === 14) return K.stripe;
  return s.roofCol === 'black' ? K.black : K.paint;
}

// ── piezas sueltas (retrovisores, alerones, baca...) con su color ──
function colored(geo, col) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
  const n = g.getAttribute('position').count;
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[i * 3] = col[0]; a[i * 3 + 1] = col[1]; a[i * 3 + 2] = col[2]; }
  g.setAttribute('color', new THREE.BufferAttribute(a, 3));
  g.userData.cls = classOf(col);
  return g;
}
function box(w, h, d, x, y, z, col, rx = 0, ry = 0, rz = 0) {
  const g = new THREE.BoxGeometry(w, h, d);
  if (rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz)));
  g.translate(x, y, z);
  return colored(g, col);
}
function cyl(r0, r1, h, x, y, z, col, axis = 'y', seg = 14) {
  const g = new THREE.CylinderGeometry(r0, r1, h, seg);
  if (axis === 'z') g.rotateX(Math.PI / 2);
  if (axis === 'x') g.rotateZ(Math.PI / 2);
  g.translate(x, y, z);
  return colored(g, col);
}

function extras(s, at) {
  const parts = [];
  const add = (g) => parts.push(g);
  const frontWin = s.win ? s.win[1] : (s.cockpit ? s.cockpit[1] : s.zf - 1.2);
  // retrovisores: brazo negro, carcasa del color del coche y espejo hacia atrás
  {
    const z = frontWin - 0.1, c = at(z), x0 = c.hw - s.inset;
    for (const sx of [-1, 1]) {
      add(box(0.09, 0.045, 0.07, sx * (x0 + 0.03), c.yo + 0.07, z, K.black));
      add(box(0.15, 0.1, 0.11, sx * (x0 + 0.13), c.yo + 0.1, z - 0.01, K.paint));
      add(box(0.12, 0.075, 0.015, sx * (x0 + 0.135), c.yo + 0.1, z - 0.07, K.black));
    }
  }
  // tiradores de las puertas
  for (let i = 0; i < s.doors.length - 1; i++) {
    const z = s.doors[i] - 0.22, c = at(z);
    if (s.type === 'van' && i > 0) continue;
    for (const sx of [-1, 1]) add(box(0.025, 0.03, 0.14, sx * (c.hw + 0.004), c.yo - 0.11, z, K.black));
  }
  if (s.roofRails) {
    const z0 = s.topGlass.length ? s.topGlass[s.topGlass.length - 1][0] - 0.15 : 0.6, z1 = s.zr + 0.18;
    const c = at((z0 + z1) / 2);
    const x = (c.hw - s.inset) * (1 - s.tumble) - 0.1;
    for (const sx of [-1, 1]) {
      add(box(0.04, 0.04, z0 - z1, sx * x, c.yr + 0.07, (z0 + z1) / 2, K.black));
      for (const zz of [z0 - 0.06, z1 + 0.06]) add(box(0.05, 0.06, 0.08, sx * x, c.yr + 0.03, zz, K.black));
    }
  }
  if (s.spare) {
    const c = at(s.zr + 0.01);
    add(cyl(0.36, 0.36, 0.22, 0, (c.yb + c.yt) / 2 + 0.12, s.zr - 0.1, K.black, 'z', 20));
    add(cyl(0.3, 0.3, 0.24, 0, (c.yb + c.yt) / 2 + 0.12, s.zr - 0.1, K.paint, 'z', 20));
  }
  if (s.bed) {
    // barra antivuelco sobre los cantos de la caja, tras la cabina
    const z = s.bed[1] - 0.12, c = at(z), x = c.hw - 0.055;
    add(box(x * 2, 0.05, 0.05, 0, c.yt + 0.34, z, K.black));
    for (const sx of [-1, 1]) add(box(0.05, 0.36, 0.05, sx * x, c.yt + 0.17, z, K.black));
  }
  if (s.spoiler === 'duck') {
    const c = at(s.zr + 0.3);
    add(box(c.hw * 1.6, 0.04, 0.32, 0, c.yt + 0.07, s.zr + 0.32, K.paint, -0.12));
  } else if (s.spoiler === 'wing') {
    const z = s.zr + 0.32, c = at(z);
    add(box(c.hw * 1.85, 0.04, 0.36, 0, c.yt + 0.3, z, K.black, -0.08));
    for (const sx of [-1, 1]) add(box(0.04, 0.3, 0.12, sx * c.hw * 0.62, c.yt + 0.15, z, K.black));
  } else if (s.spoiler === 'lip') {
    const c = at(s.zr + 0.12);
    add(box(c.hw * 1.7, 0.05, 0.1, 0, c.yt + 0.03, s.zr + 0.12, K.paint, -0.25));
  }
  if (s.exhaust) {
    const c = at(s.zr + 0.02);
    const xs = s.exhaust === 1 ? [0] : [-0.32, 0.32];
    for (const x of xs) add(cyl(0.05, 0.05, 0.16, x, c.yb + 0.08, s.zr + 0.03, K.grey, 'z', 12));
  }
  if (s.scoop) {
    const c = at(1.1);
    add(box(0.5, 0.08, 0.6, 0, c.yt + 0.05, 1.1, K.black, 0.06));
  }
  if (s.seats) {
    for (const sx of [-1, 1]) {
      const z = -0.62;
      add(box(0.46, 0.16, 0.45, sx * 0.36, 0.68, z + 0.15, K.seat));
      add(box(0.46, 0.55, 0.12, sx * 0.36, 0.95, z - 0.12, K.seat, -0.22));
      add(box(0.26, 0.16, 0.1, sx * 0.36, 1.28, z - 0.2, K.seat, -0.22));
      // arco antivuelco
      add(box(0.06, 0.34, 0.06, sx * 0.36, 1.08, z - 0.38, K.black));
    }
    // salpicadero y volante (conductor a la izquierda: +x)
    add(box(1.3, 0.12, 0.3, 0, 0.86, 0.1, K.interior));
    const w = new THREE.TorusGeometry(0.17, 0.025, 6, 18);
    w.rotateX(-0.35);
    w.translate(0.36, 1.0, 0.0);
    add(colored(w, K.black));
  }
  if (s.fenders) {
    // aletas redondas del escarabajo
    for (const wz of s.wheels) {
      for (const sx of [-1, 1]) {
        const c = at(wz);
        const g = new THREE.SphereGeometry(0.46, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.5);
        g.scale(0.44, 0.8, 1.18);
        g.translate(sx * (c.hw - 0.03), s.wheelR + 0.04, wz);
        add(colored(g, K.paint));
      }
    }
    for (const sx of [-1, 1]) add(box(0.12, 0.04, s.wheels[0] - s.wheels[1] - 0.95, sx * (at(0).hw + 0.03), s.clear + 0.1, (s.wheels[0] + s.wheels[1]) / 2, K.black));
  }
  if (s.lightBar) {
    const z = -0.25, c = at(z);
    add(box(1.1, 0.06, 0.3, 0, c.yr + 0.05, z, K.black));
  }
  if (s.box) {
    // caja de carga del camión, con su bastidor oscuro
    const { z: [z0, z1], w, y: [y0, y1] } = s.box;
    add(box(w, y1 - y0, z1 - z0, 0, (y0 + y1) / 2, (z0 + z1) / 2, K.paint));
    add(box(w + 0.02, 0.08, z1 - z0 + 0.02, 0, y0 + 0.04, (z0 + z1) / 2, K.black));
    add(box(w + 0.02, 0.05, z1 - z0 + 0.02, 0, y1 - 0.025, (z0 + z1) / 2, K.grey));
  }
  return parts;
}

// ── frontales y traseras dibujados ──
const decalCache = new Map();
function capBounds(ring) {
  const xs = ring.map(p => p[0]), ys = ring.map(p => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h);
}
function emblem(ctx, X, Y, PX, x, y, r, letter) {
  const g = ctx.createRadialGradient(X(x) - r * PX * 0.3, Y(y) - r * PX * 0.3, 1, X(x), Y(y), r * PX);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(1, '#8d939a');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(X(x), Y(y), r * PX, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#20252b';
  ctx.font = `800 ${Math.round(r * PX * 1.25)}px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, X(x), Y(y) + r * PX * 0.08);
}

/**
 * dibuja el frontal o la trasera; devuelve textura de color y de brillo (faros/pilotos).
 * branded: la trasera lleva la banda de Canary Consulting
 */
function drawDecal(s, ring, front, belt, branded = false) {
  const key = s.type + (front ? ':f' : ':r') + (branded ? ':b' : '');
  if (decalCache.has(key)) return decalCache.get(key);
  const b = capBounds(ring);
  const PX = 300;
  const W = Math.min(1024, Math.ceil((b.x1 - b.x0) * PX)), H = Math.min(1024, Math.ceil((b.y1 - b.y0) * PX));
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return [c, c.getContext('2d')]; };
  const [cv, ctx] = mk();
  const [ev, ex] = mk();
  const paint = () => {
    ctx.clearRect(0, 0, W, H);
    ex.fillStyle = '#000';
    ex.fillRect(0, 0, W, H);
    const X = (x) => (x - b.x0) * PX, Y = (y) => (b.y1 - y) * PX;
    const hw = b.x1, top = front ? b.y1 : Math.min(b.y1, belt + 0.02), yb = b.y0;
    const both = (fn) => { fn(1); fn(-1); };
    const rect = (c, x0, y0, x1, y1, r, fill) => { c.fillStyle = fill; rr(c, X(Math.min(x0, x1)), Y(Math.max(y0, y1)), Math.abs(x1 - x0) * PX, Math.abs(y1 - y0) * PX, r * PX); c.fill(); };
    const ell = (c, x, y, rx, ry, fill) => { c.fillStyle = fill; c.beginPath(); c.ellipse(X(x), Y(y), rx * PX, ry * PX, 0, 0, Math.PI * 2); c.fill(); };
    const poly = (c, pts, fill) => { c.fillStyle = fill; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(X(x), Y(y)) : c.moveTo(X(x), Y(y)))); c.closePath(); c.fill(); };
    const mid = (pts) => [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length];
    const shrink = (pts, k) => { const [cx, cy] = mid(pts); return pts.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]); };
    const vgrad = (y0, y1, stops) => { const g = ctx.createLinearGradient(0, Y(y1), 0, Y(y0)); stops.forEach(([t, c]) => g.addColorStop(t, c)); return g; };
    const letter = s.brand[0];

    // faro: carcasa oscura, cristal claro con degradado y lupa
    const HOUSING = '#14171b';
    const lensFill = (y0, y1) => vgrad(y0, y1, [[0, '#ffffff'], [0.5, '#d5dee7'], [1, '#8796a5']]);
    const projector = (x, y, r) => { ell(ctx, x, y, r, r, '#59636d'); ell(ctx, x, y, r * 0.62, r * 0.62, '#ffffff'); };
    const headPoly = (pts, proj = true) => {
      poly(ctx, pts, HOUSING);
      const inner = shrink(pts, 0.8);
      const ys = inner.map(p => p[1]);
      poly(ctx, inner, lensFill(Math.min(...ys), Math.max(...ys)));
      poly(ex, inner, '#fff4dc');
      if (proj) { const [cx, cy] = mid(inner); projector(cx, cy, Math.min(0.035, (Math.max(...ys) - Math.min(...ys)) * 0.35)); }
    };
    const headRound = (x, y, r) => {
      ell(ctx, x, y, r * 1.14, r * 1.14, '#b9c0c7');
      ell(ctx, x, y, r, r, HOUSING);
      const g = ctx.createRadialGradient(X(x - r * 0.3), Y(y + r * 0.3), 1, X(x), Y(y), r * 0.9 * PX);
      g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#a9b6c2');
      ell(ctx, x, y, r * 0.86, r * 0.86, g);
      ell(ex, x, y, r * 0.86, r * 0.86, '#fff4dc');
    };
    // piloto: carcasa granate, rojo vivo y un reflejo
    const tailRect = (x0, y0, x1, y1, r) => {
      rect(ctx, x0, y0, x1, y1, r, '#3d0705');
      const ix0 = x0 + Math.sign(x1 - x0) * 0.012, ix1 = x1 - Math.sign(x1 - x0) * 0.012;
      const iy0 = Math.min(y0, y1) + 0.012, iy1 = Math.max(y0, y1) - 0.012;
      rect(ctx, ix0, iy0, ix1, iy1, r * 0.8, vgrad(iy0, iy1, [[0, '#ff4a36'], [0.45, '#d0180e'], [1, '#8a0c07']]));
      rect(ex, ix0, iy0, ix1, iy1, r * 0.8, '#ff2a12');
    };
    const tailRound = (x, y, r, col = '#d0180e', glow = '#ff2a12') => {
      ell(ctx, x, y, r * 1.12, r * 1.12, '#b9c0c7');
      ell(ctx, x, y, r, r, '#3d0705');
      ell(ctx, x, y, r * 0.82, r * 0.82, col);
      ell(ctx, x - r * 0.25, y + r * 0.25, r * 0.25, r * 0.25, 'rgba(255,255,255,0.35)');
      ell(ex, x, y, r * 0.82, r * 0.82, glow);
    };

    if (front) {
      const st = s.front || {};
      const h = top - yb;
      // toma de aire inferior
      if (st.grille === 'intake') {
        both(sx => poly(ctx, [[sx * 0.15, yb + 0.05], [sx * (hw - 0.12), yb + 0.05], [sx * (hw - 0.2), yb + h * 0.55], [sx * 0.25, yb + h * 0.3]], '#0b0d10'));
        rect(ctx, -0.32, yb + 0.03, 0.32, yb + 0.1, 0.02, '#0b0d10');
      } else {
        rect(ctx, -Math.min(0.55, hw * 0.62), yb + 0.04, Math.min(0.55, hw * 0.62), yb + Math.min(0.17, h * 0.33), 0.04, '#121417');
        ctx.strokeStyle = '#23272c';
        ctx.lineWidth = 2;
        for (let x = -Math.min(0.5, hw * 0.58); x < Math.min(0.5, hw * 0.58); x += 0.05) {
          ctx.beginPath(); ctx.moveTo(X(x), Y(yb + 0.05)); ctx.lineTo(X(x + 0.02), Y(yb + Math.min(0.16, h * 0.32))); ctx.stroke();
        }
      }
      // parrilla
      const gy0 = yb + h * 0.42, gy1 = top - 0.05;
      if (st.grille === 'bars' || st.grille === 'mesh') {
        rect(ctx, -0.36, gy0 - 0.01, 0.36, gy1 + 0.01, 0.06, '#aab1b8');
        rect(ctx, -0.34, gy0, 0.34, gy1, 0.05, '#15181c');
        ctx.strokeStyle = st.grille === 'bars' ? '#9aa1a8' : '#2c3238';
        ctx.lineWidth = st.grille === 'bars' ? 3 : 1.5;
        for (let y = gy0 + 0.035; y < gy1 - 0.01; y += st.grille === 'bars' ? 0.045 : 0.025) {
          ctx.beginPath(); ctx.moveTo(X(-0.3), Y(y)); ctx.lineTo(X(0.3), Y(y)); ctx.stroke();
        }
      } else if (st.grille === 'big' || st.grille === 'van') {
        const gw = st.grille === 'big' ? 0.5 : 0.56;
        rect(ctx, -gw - 0.02, gy0 - 0.06, gw + 0.02, gy1 + 0.02, 0.04, st.grille === 'big' ? '#b9bfc5' : '#1a1d21');
        rect(ctx, -gw, gy0 - 0.04, gw, gy1, 0.03, '#101215');
        ctx.fillStyle = st.grille === 'big' ? '#b9bfc5' : '#2a2f35';
        for (let y = gy0; y < gy1 - 0.02; y += 0.07) ctx.fillRect(X(-gw), Y(y + 0.02), gw * 2 * PX, 0.022 * PX);
      } else if (st.grille === 'muscle') {
        rect(ctx, -hw + 0.06, gy0 - 0.04, hw - 0.06, gy1, 0.02, '#0c0e10');
        ctx.strokeStyle = '#c9ced4';
        ctx.lineWidth = 2;
        rr(ctx, X(-hw + 0.06), Y(gy1), (hw - 0.06) * 2 * PX, (gy1 - gy0 + 0.04) * PX, 0.02 * PX);
        ctx.stroke();
      }
      // faros
      const ly = top - Math.min(0.11, h * 0.28);
      const L = (sx) => {
        const xi = sx * (hw - 0.05), xo = sx * (hw - 0.44);
        switch (st.lights) {
          case 'swept':
            headPoly([[xo, ly - 0.055], [xi, ly - 0.03], [xi, ly + 0.075], [xo + sx * 0.07, ly + 0.04]]);
            rect(ctx, xo + sx * 0.04, ly - 0.07, xi - sx * 0.04, ly - 0.055, 0.005, '#fdfdfd');
            rect(ex, xo + sx * 0.04, ly - 0.07, xi - sx * 0.04, ly - 0.055, 0.005, '#ffffff');
            break;
          case 'square':
            headPoly([[xo, ly - 0.13], [xi, ly - 0.13], [xi, ly + 0.06], [xo, ly + 0.06]]);
            rect(ctx, xo + sx * 0.02, ly - 0.18, xo + sx * 0.12, ly - 0.15, 0.01, '#e8a33a');
            break;
          case 'van':
            headPoly([[xo, ly - 0.12], [xi, ly - 0.12], [xi, ly + 0.06], [xo, ly + 0.06]]);
            rect(ctx, xo, ly - 0.22, xi, ly - 0.14, 0.02, HOUSING);
            rect(ctx, xo + sx * 0.02, ly - 0.2, xo + sx * 0.14, ly - 0.16, 0.01, '#f0a030');
            rect(ex, xo + sx * 0.02, ly - 0.2, xo + sx * 0.14, ly - 0.16, 0.01, '#ffb030');
            break;
          case 'oval': {
            const cx = sx * (hw - 0.2), cy = ly - 0.01;
            ell(ctx, cx, cy, 0.15, 0.085, HOUSING);
            ell(ctx, cx, cy, 0.125, 0.065, lensFill(cy - 0.065, cy + 0.065));
            ell(ex, cx, cy, 0.125, 0.065, '#fff4dc');
            projector(cx + sx * 0.04, cy, 0.03);
            projector(cx - sx * 0.05, cy, 0.024);
            break;
          }
          case 'round2':
            headRound(sx * (hw - 0.15), ly - 0.03, 0.075);
            headRound(sx * (hw - 0.34), ly - 0.03, 0.062);
            break;
          case 'slim':
            headPoly([[sx * 0.33, ly - 0.01], [xi, ly + 0.04], [xi, ly + 0.09], [sx * 0.4, ly + 0.04]], false);
            break;
          default: break;
        }
      };
      both(L);
      if (st.fog) both(sx => headRound(sx * (hw - 0.2), yb + 0.11, 0.042));
      if (st.grille !== 'muscle' && st.grille !== 'intake') emblem(ctx, X, Y, PX, 0, Math.min(top - 0.06, gy1 + 0.0), 0.045, letter);
      if (st.text) {
        ctx.fillStyle = '#1f4fa8';
        ctx.font = `800 ${Math.round(0.07 * PX)}px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(st.text, X(0), Y(yb + 0.27));
      }
    } else {
      const st = s.rear || {};
      const h = top - yb;
      // luneta (traseras verticales) o puertas de carga
      if (st.window) {
        const y0 = belt + 0.06, y1 = b.y1 - 0.07, x = (hw - 0.12) * 0.92;
        rect(ctx, -x, y0, x, y1, 0.07, vgrad(y0, y1, [[0, '#2a3440'], [1, '#0a0f14']]));
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.beginPath();
        ctx.moveTo(X(-x * 0.6), Y(y1)); ctx.lineTo(X(-x * 0.2), Y(y1)); ctx.lineTo(X(-x * 0.55), Y(y0)); ctx.lineTo(X(-x * 0.95), Y(y0));
        ctx.closePath(); ctx.fill();
      }
      if (st.cargo) {
        rect(ctx, -hw + 0.06, yb + 0.1, hw - 0.06, b.y1 - 0.06, 0.03, 'rgba(0,0,0,0.12)');
        ctx.fillStyle = '#20252b';
        ctx.fillRect(X(-0.006), Y(b.y1 - 0.06), 0.012 * PX, (b.y1 - yb - 0.16) * PX);
        both(sx => rect(ctx, sx * 0.08, b.y1 - 0.62, sx * (hw - 0.18), b.y1 - 0.12, 0.04, '#10161c'));
      }
      if (st.tailgate) {
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(X(-hw + 0.08), Y(top - 0.04), (hw - 0.08) * 2 * PX, 0.012 * PX);
      }
      // parachoques
      rect(ctx, -hw + 0.05, yb + 0.02, hw - 0.05, yb + 0.1, 0.03, s.cladding || st.cargo ? '#16191d' : 'rgba(0,0,0,0.18)');
      const ty = st.window || st.cargo ? belt - 0.08 : top - Math.min(0.12, h * 0.32);
      const T = (sx) => {
        const xi = sx * (hw - 0.04);
        switch (st.lights) {
          case 'wide':
            tailRect(-hw + 0.05, ty - 0.035, hw - 0.05, ty + 0.055, 0.02);
            rect(ctx, -0.18, ty - 0.02, 0.18, ty + 0.04, 0.01, '#2a0504');
            break;
          case 'pair':
            tailRect(sx * (hw - 0.42), ty - 0.065, xi, ty + 0.065, 0.03);
            rect(ctx, sx * (hw - 0.3), ty - 0.05, sx * (hw - 0.22), ty + 0.0, 0.01, '#eef1f4');
            break;
          case 'vertical':
            tailRect(sx * (hw - 0.18), ty - 0.3, xi, ty + 0.12, 0.03);
            rect(ctx, sx * (hw - 0.16), ty - 0.27, xi - sx * 0.02, ty - 0.19, 0.02, '#eef1f4');
            break;
          case 'slim':
            tailRect(-hw + 0.07, ty - 0.005, hw - 0.07, ty + 0.045, 0.01);
            break;
          case 'round2':
            tailRound(sx * (hw - 0.17), ty, 0.072);
            tailRound(sx * (hw - 0.37), ty, 0.062);
            break;
          case 'round4':
            tailRound(sx * (hw - 0.16), ty, 0.062);
            tailRound(sx * (hw - 0.33), ty, 0.052, '#e9a020', '#ff9a20');
            break;
          case 'bar3':
            for (let i = 0; i < 3; i++) {
              const x0 = sx * (hw - 0.1 - i * 0.12);
              tailRect(x0, ty - 0.065, x0 - sx * 0.09, ty + 0.065, 0.015);
            }
            break;
          default: break;
        }
      };
      if (st.lights === 'wide' || st.lights === 'slim') T(1); else both(T);
      // rótulos: marca a la izquierda, modelo a la derecha (o la banda de Canary Consulting)
      const ry = st.window || st.cargo ? belt - 0.3 : yb + h * 0.42;
      if (branded) {
        drawRearBanner(ctx, X, Y, PX, 0, ry + 0.035, hw);
      } else {
        ctx.fillStyle = '#d7dce1';
        ctx.font = `700 ${Math.round(0.05 * PX)}px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.fillText(s.brand.toUpperCase(), X(-hw + 0.16), Y(ry));
        ctx.textAlign = 'right';
        ctx.fillText(s.name.toUpperCase(), X(hw - 0.16), Y(ry));
        emblem(ctx, X, Y, PX, 0, ry + 0.06, 0.04, letter);
      }
      if (branded && st.window) {
        // la web en la luneta, como en los coches de empresa
        ctx.fillStyle = 'rgba(243,239,230,0.92)';
        ctx.font = `800 ${Math.round(0.055 * PX)}px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('canaryislandconsulting.es', X(0), Y(belt + 0.13), (hw * 2 - 0.4) * PX);
      }
      if (st.text) {
        ctx.fillStyle = '#1f4fa8';
        ctx.textAlign = 'center';
        ctx.font = `800 ${Math.round(0.06 * PX)}px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`;
        ctx.fillText(st.text, X(0), Y(ry - 0.1));
      }
    }
  };
  paint();
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const etex = new THREE.CanvasTexture(ev);
  etex.colorSpace = THREE.SRGBColorSpace;
  if (branded) brandReady.then(() => { paint(); tex.needsUpdate = true; etex.needsUpdate = true; });
  const mat = new THREE.MeshStandardMaterial({
    map: tex, emissiveMap: etex, emissive: 0xffffff, emissiveIntensity: 0.5,
    transparent: true, alphaTest: 0.02, depthWrite: false, roughness: 0.25, metalness: 0.35,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
  });
  const out = { mat, bounds: b };
  decalCache.set(key, out);
  return out;
}

// ── ruedas ──
const TIRE = new THREE.MeshStandardMaterial({ color: 0x1a1b1d, roughness: 0.92, metalness: 0 });
const RIM = new THREE.MeshStandardMaterial({ color: 0xc9ced4, roughness: 0.22, metalness: 0.95 });
const STEEL = new THREE.MeshStandardMaterial({ color: 0x3a3e44, roughness: 0.5, metalness: 0.6 });
const wheelCache = new Map();
function wheelGeos(R, W, style) {
  const key = R + ':' + W + ':' + style;
  if (wheelCache.has(key)) return wheelCache.get(key);
  const prof = [];
  for (let i = 0; i <= 6; i++) {
    const a = -Math.PI / 2 + (i / 6) * Math.PI;
    prof.push(new THREE.Vector2(R - 0.06 + Math.cos(a) * 0.06, Math.sin(a) * W / 2));
  }
  prof.unshift(new THREE.Vector2(R * 0.64, -W / 2 + 0.01));
  prof.push(new THREE.Vector2(R * 0.64, W / 2 - 0.01));
  const tire = new THREE.LatheGeometry(prof, 20);
  tire.rotateZ(Math.PI / 2);
  const parts = [];
  const face = W / 2 - 0.03;
  const lip = new THREE.TorusGeometry(R * 0.64, 0.016, 4, 20);
  lip.rotateY(Math.PI / 2);
  lip.translate(W / 2 - 0.02, 0, 0);
  parts.push(lip);
  if (style === 'steel') {
    const disc = new THREE.CylinderGeometry(R * 0.62, R * 0.62, 0.02, 18);
    disc.rotateZ(Math.PI / 2);
    disc.translate(face - 0.03, 0, 0);
    parts.push(disc);
    const cap = new THREE.CylinderGeometry(R * 0.26, R * 0.3, 0.05, 16);
    cap.rotateZ(Math.PI / 2);
    cap.translate(face, 0, 0);
    parts.push(cap);
  } else if (style === 'classic') {
    const dome = new THREE.SphereGeometry(R * 0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.35);
    dome.rotateZ(-Math.PI / 2);
    dome.translate(face - R * 0.42, 0, 0);
    parts.push(dome);
    const ring = new THREE.TorusGeometry(R * 0.5, 0.02, 6, 22);
    ring.rotateY(Math.PI / 2);
    ring.translate(face - 0.01, 0, 0);
    parts.push(ring);
  } else {
    const n = style === 'sport' ? 10 : (style === 'alloy6' ? 6 : 5);
    const sw = style === 'sport' ? 0.028 : 0.07;
    for (let i = 0; i < n; i++) {
      const spoke = new THREE.BoxGeometry(0.035, R * 0.56, sw);
      spoke.translate(0, R * 0.32, 0);
      spoke.rotateX((i / n) * Math.PI * 2);
      spoke.translate(face, 0, 0);
      parts.push(spoke);
    }
    const hub = new THREE.CylinderGeometry(0.06, 0.075, 0.05, 12);
    hub.rotateZ(Math.PI / 2);
    hub.translate(face, 0, 0);
    parts.push(hub);
    const barrel = new THREE.CylinderGeometry(R * 0.6, R * 0.6, W - 0.08, 14, 1, true);
    barrel.rotateZ(Math.PI / 2);
    parts.push(barrel);
  }
  const rim = mergeGeometries(parts.map(g => (g.index ? g.toNonIndexed() : g)).map(g => {
    for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
    return g;
  }), false);
  const out = { tire, rim, rimMat: style === 'steel' ? STEEL : RIM };
  wheelCache.set(key, out);
  return out;
}

// ── la carrocería entera de cada modelo (se comparte entre coches iguales) ──
const bodyCache = new Map();

/** separa los triángulos por material (pintura, plástico, cristal) */
function splitByClass(geo, triCls) {
  const P = geo.getAttribute('position').array, N = geo.getAttribute('normal').array, C = geo.getAttribute('color').array;
  const out = [0, 1, 2].map(() => ({ p: [], n: [], c: [] }));
  triCls.forEach((k, t) => {
    const o = out[k];
    for (let i = t * 9; i < t * 9 + 9; i++) { o.p.push(P[i]); o.n.push(N[i]); o.c.push(C[i]); }
  });
  return out.map(o => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(o.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(o.n, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(o.c, 3));
    return g;
  });
}

function buildModel(type) {
  if (bodyCache.has(type)) return bodyCache.get(type);
  const s = prep(type);
  const at = (z) => section(s, Math.max(s.zr, Math.min(s.zf, z)));
  const zs = stations(s);
  const secs = zs.map(z => section(s, z));
  const rings = secs.map(c => fullRing(halfRing(s, c)));
  const RN = rings[0].length;

  // la piel: dos triángulos por cara, cada uno con su color y su material
  const pos = [], cols = [], cls = [];
  const v = (i, k) => [rings[i][k][0], rings[i][k][1], zs[i]];
  for (let i = 0; i < zs.length - 1; i++) {
    const zMid = (zs[i] + zs[i + 1]) / 2, cm = section(s, zMid);
    for (let k = 0; k < RN; k++) {
      const k2 = (k + 1) % RN;
      const j = k < 15 ? k : 29 - k;
      const yMid = (rings[i][k][1] + rings[i][k2][1] + rings[i + 1][k][1] + rings[i + 1][k2][1]) / 4;
      const col = faceColor(s, j, zMid, yMid, cm);
      const a = v(i, k), b = v(i, k2), c = v(i + 1, k), d = v(i + 1, k2);
      pos.push(...a, ...b, ...d, ...a, ...d, ...c);
      for (let t = 0; t < 6; t++) cols.push(col[0], col[1], col[2]);
      const kc = classOf(col);
      cls.push(kc, kc);
    }
  }
  let loft = new THREE.BufferGeometry();
  loft.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  loft.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  loft = toCreasedNormals(loft, 0.62);
  const skin = splitByClass(loft, cls);

  // tapas de morro y zaga
  const cap = (ring, z, dir, uvB) => {
    const cx = 0, cy = ring.reduce((a, p) => a + p[1], 0) / ring.length;
    const P = [], U = [];
    for (let k = 0; k < ring.length; k++) {
      const p0 = ring[k], p1 = ring[(k + 1) % ring.length];
      const tri = dir > 0 ? [[cx, cy], p0, p1] : [[cx, cy], p1, p0];
      for (const [x, y] of tri) {
        P.push(x, y, z);
        // por detrás el lado +x queda a la izquierda de quien mira: la textura va al revés
        if (uvB) U.push(dir > 0 ? (x - uvB.x0) / (uvB.x1 - uvB.x0) : (uvB.x1 - x) / (uvB.x1 - uvB.x0), (y - uvB.y0) / (uvB.y1 - uvB.y0));
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    if (uvB) g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
    g.computeVertexNormals();
    return g;
  };
  const ringF = rings[rings.length - 1], ringR = rings[0];
  const pieces = [colored(cap(ringF, s.zf, 1), K.paint), colored(cap(ringR, s.zr, -1), K.paint), ...extras(s, at)];

  // todo junto en una geometría con tres grupos: pintura, plástico y cristal
  const byCls = [0, 1, 2].map(k => [skin[k], ...pieces.filter(g => g.userData.cls === k)].filter(g => g.getAttribute('position').count));
  const merged = byCls.map(list => (list.length ? mergeGeometries(list, false) : null));
  const body = mergeGeometries(merged.filter(Boolean), false);
  body.clearGroups();
  let start = 0;
  merged.forEach((g, k) => {
    if (!g) return;
    const n = g.getAttribute('position').count;
    body.addGroup(start, n, k);
    start += n;
  });
  body.computeBoundingSphere();

  const secF = secs[secs.length - 1], secR = secs[0];
  const df = drawDecal(s, ringF, true, secF.yt);
  const dr = drawDecal(s, ringR, false, secR.yt);
  const decalF = cap(ringF, s.zf + 0.004, 1, df.bounds);
  const decalR = cap(ringR, s.zr - 0.004, -1, dr.bounds);

  const roofY = Math.max(...secs.map(c => c.yr), s.box ? s.box.y[1] : 0);
  // dónde está lo alto del techo (para la pegatina de arriba)
  const cabs = secs.filter(c => c.cab > 0.2);
  const top = cabs.length ? Math.max(...cabs.map(c => c.yr)) : 0;
  const flat = cabs.filter(c => c.yr > top - 0.04).map(c => c.z);
  const roofZ = flat.length ? (Math.min(...flat) + Math.max(...flat)) / 2 : 0;
  const shadowGeo = new THREE.PlaneGeometry(s.width + 0.7, s.zf - s.zr + 0.8);
  const adZ = s.type === 'van' ? [-2.45, 0.55] : [-1.95, -0.5];
  const adGeo = s.ad ? new THREE.PlaneGeometry(adZ[1] - adZ[0], (adZ[1] - adZ[0]) / 4) : null;
  const out = {
    s, body, decalF, decalR, matF: df.mat, matR: dr.mat, secF, secR, ringF, ringR, shadowGeo, adGeo, adZ,
    dims: { width: Math.max(s.width, s.box ? s.box.w : 0), length: s.zf - s.zr, roofY, belt: s.deckF(0), wheelR: s.wheelR, wheelBase: s.wheels[0] - s.wheels[1], zf: s.zf, zr: s.zr },
    at, roofZ, livery: null,
  };
  bodyCache.set(type, out);
  return out;
}

// plástico negro, gomas e interior (mate) y cristales (oscuros, con reflejos)
const TRIM_MAT = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.72, metalness: 0.05 });
const GLASS_MAT = new THREE.MeshPhysicalMaterial({
  color: 0x0d141b, roughness: 0.05, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.6,
});

const paintCache = new Map();
function paintMat(color) {
  if (paintCache.has(color)) return paintCache.get(color);
  const c = new THREE.Color(color), hsl = {};
  c.getHSL(hsl);
  const metallic = hsl.s < 0.3 && hsl.l > 0.25 && hsl.l < 0.85;
  const m = new THREE.MeshPhysicalMaterial({
    color, vertexColors: true, roughness: metallic ? 0.36 : 0.3, metalness: metallic ? 0.55 : 0.08,
    clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.2,
  });
  paintCache.set(color, m);
  return m;
}

const PLATES = [];
function plateMat() {
  if (PLATES.length < 12) {
    const L = 'BCDFGHJKLMNPRSTVWXYZ';
    let t = String(Math.floor(Math.random() * 10000)).padStart(4, '0') + ' ';
    for (let i = 0; i < 3; i++) t += L[Math.floor(Math.random() * L.length)];
    PLATES.push(new THREE.MeshStandardMaterial({ map: plateTexture(t), roughness: 0.35 }));
    return PLATES[PLATES.length - 1];
  }
  return PLATES[Math.floor(Math.random() * PLATES.length)];
}
const PLATE_GEO = new THREE.PlaneGeometry(0.52, 0.11);

// rótulos: letrero de taxi y anuncios de las furgonetas
let taxiMat = null;
function taxiSignMat() {
  if (taxiMat) return taxiMat;
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const x = c.getContext('2d');
  x.fillStyle = '#f7f5ee';
  x.fillRect(0, 0, 256, 64);
  x.fillStyle = '#1b1e22';
  x.font = '800 44px "Barlow Condensed", "Arial Narrow", Arial, sans-serif';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText('TAXI', 128, 34);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  taxiMat = new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.25, roughness: 0.4 });
  return taxiMat;
}
const TAXI_GREEN = new THREE.MeshStandardMaterial({ color: 0x0a3a14, emissive: 0x22ff55, emissiveIntensity: 1.2 });
const TAXI_BOX = new THREE.BoxGeometry(0.56, 0.15, 0.2);
const TAXI_DOT = new THREE.SphereGeometry(0.035, 10, 8);
const CAL_GEO = new THREE.BoxGeometry(0.05, 0.15, 0.1);
const HEAD_GEO = new THREE.SphereGeometry(0.09, 14, 10);

const ADS = [
  ['CANARY CONSULTING', 'Ahorra en tu factura de la luz', '#0d5c63', '#f4c542'],
  ['FRUTERÍA LOS MOJOS', 'Papas, plátanos y mojo picón', '#1f6b3a', '#ffffff'],
  ['PESCADOS LA MARINA', 'Del muelle a tu mesa · Arrecife', '#1f4fa8', '#ffffff'],
  ['MUDANZAS TIMANFAYA', 'Sin sustos y sin lava', '#b33a1e', '#ffffff'],
  ['GOFIO EL MOLINO', 'De toda la vida', '#7a4a1c', '#f7e6c4'],
  ['CLIMA ALISIO', 'Aire acondicionado · Instalación', '#2c7fb8', '#ffffff'],
];
const adMats = new Map();
function adMat(i) {
  if (adMats.has(i)) return adMats.get(i);
  const [title, sub, bg, fg] = ADS[i];
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = bg;
  x.beginPath();
  x.roundRect ? x.roundRect(8, 8, 1008, 240, 28) : x.rect(8, 8, 1008, 240);
  x.fill();
  x.fillStyle = fg;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.font = 'italic 800 104px "Barlow Condensed", "Arial Narrow", Arial, sans-serif';
  x.fillText(title, 512, 104, 960);
  x.font = '600 50px "Barlow Condensed", "Arial Narrow", Arial, sans-serif';
  x.fillText(sub, 512, 196, 940);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4, transparent: true, polygonOffset: true, polygonOffsetFactor: -2 });
  adMats.set(i, m);
  return m;
}

// ── rotulación de Canary Consulting ──
const _basis = new THREE.Matrix4(), _euler = new THREE.Euler();
const orient = (u, v, n) => _euler.setFromRotationMatrix(_basis.makeBasis(u, v, n)).clone();
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const CARGO_TYPES = new Set(['van', 'kangoo']);

/** pegatinas que se adaptan a la chapa (puertas y techo), una vez por modelo */
function liveryGeo(M) {
  if (M.livery) return M.livery;
  const s = M.s;
  const tmp = new THREE.Mesh(M.body);
  tmp.updateMatrixWorld(true);
  const out = { doors: [], roof: null };
  if (!CARGO_TYPES.has(s.type) && !s.box) {
    // puertas: entre los dos pasos de rueda, por debajo de la cintura
    const zA = s.wheels[1] + s.archR + 0.06, zB = s.wheels[0] - s.archR - 0.06;
    const zc = (zA + zB) / 2, c = M.at(zc);
    const y0 = c.yb + Math.min(0.11, (c.yo - c.yb) * 0.25) + (s.cladding ? 0.17 : 0.03);
    const y1 = c.yt - 0.12;
    let L = Math.min(1.85, zB - zA), H = L / 4;
    if (H > (y1 - y0) * 0.92) { H = (y1 - y0) * 0.92; L = H * 4; }
    const yc = (y0 + y1) / 2;
    for (const sx of [1, -1]) {
      const rot = sx > 0 ? orient(V3(0, 0, -1), V3(0, 1, 0), V3(1, 0, 0)) : orient(V3(0, 0, 1), V3(0, 1, 0), V3(-1, 0, 0));
      out.doors.push(new DecalGeometry(tmp, V3(sx * c.hw, yc, zc), rot, V3(L, H, 0.5)));
    }
    // techo: el símbolo y la web, legible desde detrás
    if (!s.open && !s.taxi && !s.lightBar) {
      const cr = M.at(M.roofZ), sz = Math.min(0.95, (cr.hw - s.inset) * (1 - s.tumble) * 1.5);
      out.roof = new DecalGeometry(tmp, V3(0, cr.yr, M.roofZ), orient(V3(-1, 0, 0), V3(0, 0, 1), V3(0, 1, 0)), V3(sz, sz, 0.5));
    }
  }
  M.livery = out;
  return out;
}

const SHADOW_MAT = new THREE.MeshBasicMaterial({ map: contactShadowTexture(), transparent: true, depthWrite: false, opacity: 0.85 });
const HEAD_ROUND = new THREE.MeshStandardMaterial({ color: 0xf4f6ff, emissive: 0xfff3d6, emissiveIntensity: 0.5, roughness: 0.1, metalness: 0.5 });
const CALIPERS = new Map();

/**
 * Crea un coche listo para la escena. Devuelve { group, body, wheels, headlights,
 * taillights, dims, model }: car.js gira body (balanceo) y wheels (rodadura/dirección).
 */
export function makeCar(type = 'sedan', bodyColor, { brand = false } = {}) {
  const M = buildModel(MODELS[type] ? type : 'sedan');
  const s = M.s;
  const color = bodyColor ?? s.colors[0];
  const branded = brand && !s.lightBar;
  const group = new THREE.Group();
  const body = new THREE.Group();
  group.add(body);

  body.add(new THREE.Mesh(M.body, [paintMat(color), TRIM_MAT, GLASS_MAT]));
  body.add(new THREE.Mesh(M.decalF, M.matF));
  const matR = branded ? drawDecal(s, M.ringR, false, M.secR.yt, true).mat : M.matR;
  body.add(new THREE.Mesh(M.decalR, matR));

  // matrículas
  const pm = plateMat();
  const pf = new THREE.Mesh(PLATE_GEO, pm);
  pf.position.set(0, M.secF.yb + 0.14, s.zf + 0.012);
  body.add(pf);
  const pr = new THREE.Mesh(PLATE_GEO, pm);
  const rearPlateY = s.rear.window || s.rear.cargo ? M.secR.yb + 0.2 : M.secR.yb + 0.17;
  pr.position.set(0, rearPlateY, s.zr - 0.012);
  pr.rotation.y = Math.PI;
  body.add(pr);

  const detail = [pf, pr];
  const headlights = [M.matF];
  const taillights = [matR];

  if (branded) {
    // Canary Consulting en las puertas y en el techo
    const lv = liveryGeo(M);
    for (const g of lv.doors) {
      const d = new THREE.Mesh(g, brandMaterial('door'));
      body.add(d);
      detail.push(d);
    }
    if (lv.roof) {
      const r = new THREE.Mesh(lv.roof, brandMaterial('roof'));
      body.add(r);
      detail.push(r);
    }
  }

  if (s.taxi) {
    const c = M.at(-0.25);
    const sign = new THREE.Mesh(TAXI_BOX, taxiSignMat());
    sign.position.set(0, c.yr + 0.1, -0.25);
    body.add(sign);
    const green = new THREE.Mesh(TAXI_DOT, TAXI_GREEN);
    green.position.set(0.22, c.yr + 0.2, -0.25);
    body.add(green);
  }
  if (s.ad) {
    // costado de carga: la lona de Canary Consulting o el anuncio de otro negocio de aquí
    const [z0, z1] = M.adZ;
    const c = M.at((z0 + z1) / 2);
    const light = new THREE.Color(color).getHSL({}).l > 0.6;
    const L = z1 - z0, H = branded ? L / 2.56 : L / 4;
    const geo = branded ? new THREE.PlaneGeometry(L, H) : M.adGeo;
    const mat = branded ? brandMaterial(light ? 'cargoLight' : 'cargoDark') : adMat(1 + Math.floor(Math.random() * (ADS.length - 1)));
    const y = s.type === 'van' ? (branded ? 1.72 : c.yt + 0.55) : (branded ? c.yt + 0.36 : c.yt + 0.35);
    for (const sx of [-1, 1]) {
      const ad = new THREE.Mesh(geo, mat);
      ad.position.set(sx * (c.hw + s.bulge * s.width * 0.9 + 0.012), y, (z0 + z1) / 2);
      ad.rotation.y = sx * Math.PI / 2;
      body.add(ad);
    }
  }
  if (s.box) {
    // caja del camión: costados y puertas traseras
    const { z: [z0, z1], w, y: [y0, y1] } = s.box;
    const L = z1 - z0 - 0.16, H = Math.min(y1 - y0 - 0.12, L / 2);
    for (const sx of [-1, 1]) {
      const ad = branded
        ? new THREE.Mesh(new THREE.PlaneGeometry(L, H), brandMaterial('truck'))
        : new THREE.Mesh(M.adGeo || new THREE.PlaneGeometry(3, 0.75), adMat(1 + Math.floor(Math.random() * (ADS.length - 1))));
      ad.position.set(sx * (w / 2 + 0.006), (y0 + y1) / 2, (z0 + z1) / 2);
      ad.rotation.y = sx * Math.PI / 2;
      body.add(ad);
    }
    if (branded) {
      const back = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.08, y1 - y0 - 0.1), brandMaterial('truckRear'));
      back.position.set(0, (y0 + y1) / 2, z0 - 0.006);
      back.rotation.y = Math.PI;
      body.add(back);
    }
  }
  if (s.fenders) {
    // faros redondos sobre las aletas del escarabajo
    for (const sx of [-1, 1]) {
      const c = M.at(s.wheels[0]);
      const l = new THREE.Mesh(HEAD_GEO, HEAD_ROUND);
      l.scale.set(1, 1, 0.7);
      l.position.set(sx * (c.hw - 0.03), s.wheelR + 0.3, s.wheels[0] + 0.36);
      body.add(l);
    }
    headlights.push(HEAD_ROUND);
  }

  // ruedas
  const wheels = [];
  const { tire, rim, rimMat } = wheelGeos(s.wheelR, s.tireW, s.rim);
  let calMat = null;
  if (s.caliper) {
    if (!CALIPERS.has(s.caliper)) CALIPERS.set(s.caliper, new THREE.MeshStandardMaterial({ color: s.caliper, roughness: 0.4, metalness: 0.3 }));
    calMat = CALIPERS.get(s.caliper);
  }
  for (const [zi, z] of s.wheels.entries()) {
    const c = M.at(z);
    for (const sx of [-1, 1]) {
      const pivot = new THREE.Group();
      const w = new THREE.Group();
      const rimMesh = new THREE.Mesh(rim, rimMat);
      w.add(new THREE.Mesh(tire, TIRE), rimMesh);
      detail.push(rimMesh);
      w.scale.x = sx;
      pivot.position.set(sx * (c.hw - s.tireW / 2 + 0.005), s.wheelR, z);
      pivot.add(w);
      if (calMat) {
        const cal = new THREE.Mesh(CAL_GEO, calMat);
        cal.position.set(sx * (s.tireW / 2 - 0.08), s.wheelR * 0.3, -s.wheelR * 0.28);
        pivot.add(cal);
        detail.push(cal);
      }
      group.add(pivot);
      const proxy = {
        rotation: {
          set x(v) { w.rotation.x = v; },
          get x() { return w.rotation.x; },
          set y(v) { pivot.rotation.y = v; },
          get y() { return pivot.rotation.y; },
        },
      };
      if (zi === 0) wheels.unshift(proxy); else wheels.push(proxy);
    }
  }

  // sombra de contacto
  const shadow = new THREE.Mesh(M.shadowGeo, SHADOW_MAT);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, 0.012, (s.zf + s.zr) / 2);
  shadow.renderOrder = 1;
  group.add(shadow);

  group.traverse(o => { if (o.isMesh && o !== shadow) { o.castShadow = true; o.receiveShadow = true; } });
  group.userData.headlights = headlights;
  group.userData.taillights = taillights;
  // de lejos no se ven llantas ni matrículas: menos trabajo para el móvil
  let near = true;
  group.userData.setDetail = (v) => {
    if (v === near) return;
    near = v;
    for (const o of detail) o.visible = v;
  };
  group.userData.setLights = (night) => {
    for (const m of headlights) m.emissiveIntensity = 0.45 + night * 2.6;
    for (const m of taillights) m.emissiveIntensity = 0.45 + night * 1.6;
  };
  return { group, body, wheels, headlights, taillights, dims: M.dims, model: type, brand: branded };
}

// tráfico: [modelo, peso] — más utilitarios que deportivos, como en la calle
export const FLEET = [
  ['hatch', 16], ['sedan', 12], ['estate', 6], ['suv', 10], ['pickup', 10], ['van', 6], ['kangoo', 8],
  ['truck', 5], ['taxi', 7], ['beetle', 4], ['cabrio', 4], ['muscle', 4], ['sport', 4], ['super', 2],
];
/** parte de los vehículos que llevan la rotulación de Canary Consulting */
export const BRAND_SHARE = 0.8;
const FLEET_TOTAL = FLEET.reduce((a, f) => a + f[1], 0);

/** modelo y color al azar (o a partir de un número fijo, para los aparcados) */
export function pickModel(r1 = Math.random(), r2 = Math.random()) {
  let t = r1 * FLEET_TOTAL;
  let type = FLEET[0][0];
  for (const [k, w] of FLEET) { if (t < w) { type = k; break; } t -= w; }
  const colors = MODELS[type].colors;
  return { type, color: colors[Math.floor(r2 * colors.length) % colors.length] };
}

/** monta de antemano todos los modelos y sus rótulos (en la pantalla de carga, no en marcha) */
export function prewarmCars() {
  for (const t of TYPE_NAMES) {
    const M = buildModel(t);
    if (M.s.lightBar) continue;
    liveryGeo(M);
    drawDecal(M.s, M.ringR, false, M.secR.yt, true);
  }
}

export function randomTrafficCar() {
  const { type, color } = pickModel();
  const brand = Math.random() < BRAND_SHARE;
  return { ...makeCar(type, color, { brand }), type, color, brand };
}
