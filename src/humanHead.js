import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { B, col, mix, shade, fin, smooth01, welded, skinPart, ell, box, tube, prober } from './humanParts.js';

/**
 * La cabeza, en coordenadas propias (centro en el origen, la cara mira a +z):
 * cráneo con cuencas de los ojos, arco de las cejas, pómulos, morro y
 * barbilla; ojos con párpado, pestañas, iris y pupila; nariz con aletas;
 * labios; orejas; pelo por mechones que sigue el nacimiento de cada peinado;
 * barba o sombra de barba; gorra y gafas.
 */

export const HEAD_C = [0, 1.635, 0.012];
const HS = 1.08;
const HX = 0.079, HY = 0.118, HZ = 0.103;   // semiejes del cráneo

/** punto de la esfera unidad → forma del cráneo (aún en unidades) */
function skull(x, y, z, female) {
  if (y < 0) {
    const t = -y;
    x *= female ? 1 - 0.4 * t * t : 1 - 0.2 * t * t - 0.16 * t ** 4; // la cara se estrecha hacia la barbilla (mandíbula más cuadrada en ellos)
    z *= z < 0 ? 1 - 0.45 * t : 1 - 0.08 * t;
  }
  if (z < 0) z *= 1.08;                         // cráneo más largo por detrás
  if (z > 0.6) z = 0.6 + (z - 0.6) * 0.55;      // cara plana
  if (z > 0.3 && y > -0.35 && y < 0.05) x *= 1 + 0.04 * Math.cos((y + 0.15) * 8); // pómulos
  return [x, y, z];
}

/** relieve de la cara: cuencas, arco de las cejas, morro y barbilla */
function relief(x, y, z, female) {
  if (z <= 0.3) return z;
  const ax = Math.abs(x), w = smooth01((z - 0.3) / 0.25);
  z -= 0.06 * Math.exp(-(((ax - 0.4) / 0.17) ** 2) - ((y - 0.1) / 0.11) ** 2) * w;
  z += (female ? 0.022 : 0.036) * Math.exp(-(((y - 0.29) / 0.07) ** 2) - (x / 0.55) ** 2) * w;
  z += 0.03 * Math.exp(-((x / 0.3) ** 2) - ((y + 0.42) / 0.16) ** 2) * w;
  z += 0.032 * Math.exp(-((x / 0.24) ** 2) - ((y + 0.8) / 0.11) ** 2) * w;
  return z;
}

/** zona de barba (mandíbula, barbilla y bigote), de 0 a 1 */
function beardMask(x, y, z) {
  if (z < -0.2) return 0;
  const yb = -0.25 + 0.22 * smooth01((Math.abs(x) - 0.42) / 0.38);
  return smooth01((yb - y) / 0.07) * smooth01((z + 0.2) / 0.25);
}

// cabezas y peinados ya hechos, por tipo (cada persona copia el suyo y lo pinta)
const HEADS = new Map(), HAIRS = new Map();

function headGeo(female, beard, detail) {
  const key = `${female}|${beard}|${detail}`;
  if (!HEADS.has(key)) HEADS.set(key, makeHead(female, beard, detail));
  return HEADS.get(key).clone();
}

function makeHead(female, beard, detail) {
  const g = new THREE.SphereGeometry(1, detail > 1 ? 34 : 22, detail > 1 ? 26 : 16);
  const p = g.getAttribute('position');
  for (let i = 0; i < p.count; i++) {
    const [x, y, z0] = skull(p.getX(i), p.getY(i), p.getZ(i), female);
    const z = relief(x, y, z0, female);
    const s = beard ? 1 + 0.055 * beardMask(x, y, z0) : 1;   // la barba abulta
    p.setXYZ(i, x * HX * s, y * HY * s, z * HZ * s);
  }
  return welded(g);
}

// sondas de la cara ya medidas, por tipo de cabeza (todas las del mismo tipo son iguales)
const FACES = new Map();
function faceProbe(key, geo) {
  if (FACES.has(key)) return FACES.get(key);
  const probe = prober(geo.clone());
  const memo = new Map();
  const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
  const face = {
    /** z de la piel en (x, y), mirando la cara de frente */
    at: (x, y) => once(`z${x.toFixed(4)},${y.toFixed(4)}`, () => probe(x, y, 0.3, 0, 0, -1)?.z ?? 0.08),
    /** x de la piel por el lado derecho en (y, z) */
    side: (y, z) => once(`x${y.toFixed(4)},${z.toFixed(4)}`, () => probe(0.3, y, z, -1, 0, 0)?.x ?? 0.078),
  };
  FACES.set(key, face);
  return face;
}

// nacimiento del pelo: altura (en la esfera unidad) según el ángulo desde la frente
const HAIRLINE = {
  short: [[0, 0.43], [0.5, 0.38], [0.95, 0.26], [1.17, 0.0], [1.33, 0.0], [1.45, 0.3], [1.85, 0.26], [2.05, -0.3], [2.5, -0.62], [Math.PI, -0.7]],
  surf: [[0, 0.42], [0.45, 0.38], [0.9, 0.26], [1.2, -0.12], [1.42, 0.08], [1.85, 0.02], [2.05, -0.4], [2.5, -0.72], [Math.PI, -0.8]],
  curly: [[0, 0.46], [0.6, 0.38], [1.1, 0.12], [1.42, 0.14], [1.85, 0.04], [2.2, -0.45], [Math.PI, -0.66]],
  tied: [[0, 0.5], [0.6, 0.42], [1.05, 0.22], [1.42, 0.24], [1.85, 0.16], [2.2, -0.4], [Math.PI, -0.62]],
  long: [[0, 0.48], [0.5, 0.4], [0.85, 0.06], [1.05, -0.72], [Math.PI, -0.95]],
};
// grosor, surcos entre mechones, número de mechones, desorden, flequillo
const HAIR = {
  short: { th: 0.09, groove: 0.012, n: 30, messy: 0.01, line: 'short', quiff: 0.05 },
  rapado: { th: 0.022, groove: 0.004, n: 40, messy: 0.002, line: 'short' },
  surf: { th: 0.12, groove: 0.04, n: 22, messy: 0.032, line: 'surf', fringe: 0.16 },
  curly: { th: 0.24, groove: 0.03, n: 18, messy: 0.12, line: 'curly' },
  ponytail: { th: 0.05, groove: 0.012, n: 34, messy: 0.008, line: 'tied' },
  bun: { th: 0.05, groove: 0.012, n: 34, messy: 0.008, line: 'tied' },
  long: { th: 0.08, groove: 0.022, n: 30, messy: 0.02, line: 'long', long: true },
};
const lerpTab = (tab, a) => {
  for (let i = 0; i < tab.length - 1; i++) {
    const [a0, v0] = tab[i], [a1, v1] = tab[i + 1];
    if (a <= a1) return v0 + (v1 - v0) * smooth01((a - a0) / (a1 - a0));
  }
  return tab[tab.length - 1][1];
};

/**
 * pelo: una malla que va de la coronilla al nacimiento del pelo de cada
 * peinado, con surcos entre mechones (más oscuros) y algo de desorden.
 * Devuelve la malla y el color de cada vértice.
 */
function hairGeo(style, { female, detail, hair, skin, under }) {
  const key = `${style}|${female}|${detail}|${under}`;
  if (!HAIRS.has(key)) HAIRS.set(key, makeHair(style, female, detail, under));
  const g = HAIRS.get(key).clone();
  // color: surcos oscuros, puntas aclaradas por el sol (surf) y nacimiento suave
  const a = g.getAttribute('aux');
  const light = mix(hair, [1, 0.93, 0.75], 0.4);
  const cols = [];
  for (let i = 0; i < a.count; i++) {
    const s = a.getX(i), str = a.getY(i), uy = a.getZ(i);
    let c = shade(hair, 0.86 + 0.22 * (0.5 + 0.5 * str));
    if (style === 'surf') c = mix(c, light, 0.35 * smooth01((uy - 0.3) / 0.6));
    c = mix(c, skin, (style === 'rapado' ? 0.35 : 0) + 0.16 * smooth01((s - 0.86) / 0.14));
    cols.push(fin(c, 0.62));
  }
  g.deleteAttribute('aux');
  return { g, cols };
}

function makeHair(style, female, detail, under) {
  const P = HAIR[style] || HAIR.short;
  const line = HAIRLINE[P.line];
  const J = detail > 1 ? 56 : 32, I = detail > 1 ? 16 : 9;
  const th = P.th * under, groove = P.groove * under, messy = P.messy * under;
  const pos = [], aux = [], idx = [];
  for (let i = 0; i <= I; i++) {
    const s = i / I;
    for (let j = 0; j <= J; j++) {
      const phi = -Math.PI + (2 * Math.PI * j) / J, a = Math.abs(phi);
      let thL = Math.acos(lerpTab(line, a));
      // flequillo a mechones
      if (P.fringe) thL += P.fringe * Math.max(0, Math.sin(phi * 9 + 0.6)) ** 2 * smooth01((1 - a) / 0.4);
      const t = thL * s;
      const ux = Math.sin(t) * Math.sin(phi), uy = Math.cos(t), uz = Math.sin(t) * Math.cos(phi);
      const [kx, ky, kz] = skull(ux, uy, uz, female);
      const noise = Math.sin(ux * 23 + uz * 17) * Math.cos(uy * 19 - ux * 7);
      const str = Math.sin(phi * P.n + s * 3 + Math.sin(phi * 3) * 1.4 + noise * 1.6) * smooth01(s / 0.15);
      const top = smooth01((1 - s) / 0.3);   // 0 en el nacimiento, 1 arriba
      // tupé: el pelo de delante se levanta un poco
      const quiff = (P.quiff || 0) * Math.exp(-((phi / 0.7) ** 2)) * smooth01((s - 0.35) / 0.35) * top;
      const f = 1.012 + th * (0.12 + 0.88 * top) + groove * str * (0.3 + 0.7 * top) + messy * noise + quiff * under;
      let x = kx * HX * f, y = ky * HY * f, z = kz * HZ * f;
      // melena: cae por detrás y por los lados hasta los hombros
      if (P.long && a > 0.9 && uy < -0.1) {
        const d = -uy - 0.1;
        y -= d * HY * 2.4;
        x *= 1 + 0.35 * d;
        z *= 1 + 0.25 * d;
      }
      pos.push(x, y, z);
      aux.push(s, str, uy);
    }
  }
  for (let i = 0; i < I; i++) {
    for (let j = 0; j < J; j++) {
      const a = i * (J + 1) + j, b = a + 1, c = a + J + 1, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  let g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('aux', new THREE.Float32BufferAttribute(aux, 3));
  g.setIndex(idx);
  g = mergeVertices(g, 1e-5);
  g.computeVertexNormals();
  return g;
}

/**
 * monta la cabeza de la persona o sobre parts (piezas ya cosidas al hueso de la cabeza)
 */
export function buildHead(o, parts, { female, detail }) {
  const [hx, hy, hz] = HEAD_C;
  const toHead = (g) => { g.scale(HS, HS, HS); g.translate(hx, hy, hz); return g; };
  const put = (g, paint) => parts.push(toHead(skinPart(g, typeof paint === 'function' ? paint : () => paint, B.head)));
  const skin = fin(col(o.skin), 0.55);
  const hair = fin(col(o.hair), 0.62);
  const beard = !female && !!o.beard;
  const stubble = female || beard || o.stubble === false ? 0 : 0.17;

  // ── cráneo y cara ──
  const head = headGeo(female, beard, detail);
  const { at, side } = faceProbe(`${female}|${beard}|${detail}`, head);
  // colorete: la propia piel algo más roja (en pieles oscuras no sale un sarpullido)
  const blush = [skin[0] * 1.14, skin[1] * 0.8, skin[2] * 0.78], beardC = fin(shade(hair, 0.82), 0.85);
  put(head, (x, y, z) => {
    const ux = x / HX, uy = y / HY, uz = z / HZ, ax = Math.abs(ux);
    let c = skin;
    if (uz > 0.25) {
      c = mix(c, blush, (female ? 0.26 : 0.18) * Math.exp(-(((ax - 0.5) / 0.2) ** 2) - ((uy + 0.18) / 0.15) ** 2));
      c = shade(c, 1 - 0.1 * Math.exp(-(((ax - 0.4) / 0.2) ** 2) - ((uy - 0.12) / 0.12) ** 2));
    }
    if (!female && (beard || stubble)) {
      const m = beardMask(ux, uy, uz);
      if (m > 0) c = beard && m > 0.5 ? mix(beardC, c, 1 - m) : mix(c, beardC, m * (beard ? 0.94 : stubble));
    }
    return c;
  });

  // ojos: blanco, iris, pupila, párpado de arriba y línea de pestañas
  const EX = 0.032, EY = 0.012;
  const zE = at(EX, EY);
  const white = fin(col(0xf1eee8), 0.16), iris = fin(col(o.eyes), 0.14), pupil = fin(col(0x070708), 0.1);
  const lid = fin(shade(skin, 0.93), 0.55), lash = fin(shade(col(o.hair), 0.25), 0.7);
  const hiE = detail > 1;
  for (const sx of [-1, 1]) {
    const ex = sx * EX;
    put(ell(0.0118, 1.22, 0.86, 0.6, ex, EY, zE + 0.0012, hiE ? 14 : 10, hiE ? 10 : 6), white);
    put(ell(0.0072, 1, 1, 0.4, ex, EY - 0.0005, zE + 0.0062, hiE ? 14 : 8, 6), (x, y) => (y > EY + 0.0035 ? shade(iris, 0.7) : iris));
    put(ell(0.003, 1, 1, 0.35, ex, EY - 0.0005, zE + 0.009, 8, 4), pupil);
    put(ell(0.0128, 1.3, 0.52, 0.66, ex, EY + 0.0079, zE + 0.0016, hiE ? 14 : 10, 6), lid);
    put(tube([[ex - sx * 0.0145, EY + 0.0012, zE + 0.0046], [ex - sx * 0.006, EY + 0.0045, zE + 0.0077], [ex + sx * 0.003, EY + 0.0049, zE + 0.0081], [ex + sx * 0.0135, EY + 0.0022, zE + 0.0052]], female ? 0.0017 : 0.0011, hiE ? 12 : 6, 4), lash);
  }
  // cejas en arco
  const brow = fin(shade(col(o.hair), female ? 0.55 : 0.5), 0.75);
  const BY = 0.034;
  for (const sx of [-1, 1]) {
    const pts = [[0.013, BY - 0.003], [0.024, BY + 0.0015], [0.036, BY + 0.0028], [0.049, BY - 0.0015]]
      .map(([x, y]) => [sx * x, y, at(x, y) + 0.0016]);
    put(tube(pts, female ? 0.0019 : 0.0031, hiE ? 12 : 6, 5), brow);
  }
  // nariz: caballete, punta, aletas y agujeros
  const nose = mix(skin, blush, 0.06);
  put(ell(0.0075, 0.95, 2.9, 1, 0, -0.004, at(0, -0.002) + 0.0035, 10, 8, -0.3), nose);
  const zT = at(0, -0.021);
  put(ell(0.0088, 1, 0.88, 0.95, 0, -0.0208, zT + 0.0098, hiE ? 14 : 10, 8), mix(skin, blush, 0.08));
  for (const sx of [-1, 1]) {
    put(ell(0.0058, 1, 0.8, 0.9, sx * 0.0098, -0.0238, at(0.0098, -0.0238) + 0.003, 10, 6), nose);
    if (hiE) put(ell(0.0022, 1.5, 0.7, 1.1, sx * 0.0048, -0.0282, zT + 0.0078, 8, 4), fin(shade(skin, 0.35), 0.8));
  }
  // labios: el de arriba se oscurece hacia la comisura, el de abajo brilla algo
  const lips = fin(mix(skin, col(female ? 0xb8404a : 0xa4574e), female ? 0.62 : 0.5), 0.36);
  const dark = shade(lips, 0.55);
  const lw = female ? 1 : 0.94, lt = female ? 1 : 0.8;
  put(ell(0.0178 * lw, 1, 0.25 * lt, 0.3 * lt, 0, -0.0428, at(0, -0.0428) + 0.0016, hiE ? 16 : 10, 6), (x, y) => mix(lips, dark, smooth01((-0.0428 - y) / 0.0045)));
  put(ell(0.0162 * lw, 1, 0.33 * lt, 0.38 * lt, 0, -0.0502, at(0, -0.0502) + 0.0022, hiE ? 16 : 10, 6), (x, y) => mix(lips, dark, 0.5 * smooth01((y + 0.0502) / 0.0053)));
  // orejas, con la concha más oscura
  for (const sx of [-1, 1]) {
    const cx = sx * 0.0805;
    put(ell(0.025, 0.34, 1, 0.68, cx, -0.004, -0.006, hiE ? 14 : 8, hiE ? 10 : 6), (x, y, z) => {
      const out = (x - cx) * sx > 0.002;
      const r = Math.hypot((y + 0.006) / 0.018, (z + 0.005) / 0.012);
      return out && r < 1 ? mix(shade(skin, 0.72), blush, 0.12) : skin;
    });
  }

  // ── pelo, gorra y gafas ──
  const under = o.cap ? 0.35 : 1;   // con gorra el pelo queda aplastado
  if (o.hairStyle !== 'calvo') {
    const { g: hg, cols } = hairGeo(o.hairStyle, { female, detail, hair, skin, under });
    put(hg, (x, y, z, i) => cols[i]);
    if (o.hairStyle === 'ponytail') {
      const t = new THREE.CapsuleGeometry(0.026, 0.15, 3, 8);
      t.rotateX(0.55);
      t.translate(0, -0.06, -0.135);
      put(welded(t), shade(hair, 0.92));
    } else if (o.hairStyle === 'bun') {
      put(ell(0.048, 1, 1, 1, 0, 0.1, -0.075, 12, 8), shade(hair, 0.92));
    }
  } else {
    // calvo: corona de pelo corto por los lados y la nuca
    const g = new THREE.TorusGeometry(0.083, 0.014, 6, 20, Math.PI * 1.25);
    g.rotateX(Math.PI / 2);
    g.rotateY(Math.PI * 1.125);
    g.scale(0.98, 1, 1.12);
    g.translate(0, 0.01, -0.006);
    put(welded(g), mix(hair, skin, 0.3));
  }
  if (o.cap) {
    const cc = fin(col(o.capColor ?? 0x1c2a44), 0.85, true);
    const crown = new THREE.SphereGeometry(0.114, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.45);
    crown.scale(0.86, 0.95, 1.06);
    crown.translate(0, 0.032, -0.008);
    put(welded(crown), (x, y) => (y > 0.138 ? shade(cc, 0.8) : cc));
    const visor = new THREE.CylinderGeometry(0.095, 0.095, 0.01, 16, 1, false, -Math.PI * 0.5, Math.PI);
    visor.scale(0.95, 1, 1.05);
    visor.rotateX(-0.12);
    visor.translate(0, 0.058, 0.05);
    put(visor, shade(cc, 0.85));
  }
  if (o.shades) {
    const lens = fin(col(0x0b0e12), 0.06), frame = fin(col(0x17181b), 0.3);
    for (const sx of [-1, 1]) {
      put(ell(0.0215, 1.12, 0.8, 0.3, sx * 0.034, 0.012, zE + 0.0125, 14, 8), lens);
      // patillas pegadas a la sien, hasta la oreja (con melena o pelo largo por los lados, solo asoma el principio)
      const covered = ['surf', 'long', 'curly'].includes(o.hairStyle);
      const pts = (covered ? [0.07, 0.05] : [0.07, 0.045, 0.02, -0.005]).map((z) => [sx * (side(0.019, z) + 0.0022), 0.019, z]);
      pts.unshift([sx * 0.059, 0.02, zE + 0.006]);
      put(tube(pts, 0.0019, 12, 4), frame);
    }
    put(tube([[-0.059, 0.02, zE + 0.006], [-0.034, 0.0262, zE + 0.0135], [0, 0.0215, at(0, 0.021) + 0.003], [0.034, 0.0262, zE + 0.0135], [0.059, 0.02, zE + 0.006]], 0.0019, 16, 4), frame);
  }
}
