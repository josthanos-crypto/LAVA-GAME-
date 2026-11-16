import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { paveMesh, polyTris, bandTris, discTris, asfalto } from './suelos.js';

/**
 * El Hospital Insular de Lanzarote, al lado del tanatorio (fotos de José Manuel, noviembre de 2026):
 * - El porche de columnas de la puerta del hospital, mirando al jardín (el edificio, blanco y con su
 *   rótulo, lo pone civic.js).
 * - El jardín que sube desde la calle hasta la puerta (segunda foto): entre la parada de guaguas y el
 *   parque, una entrada con los muretes encalados que se abren en curva, el camino de piedra
 *   volcánica con sus escalones, dos farolas verdes y arriba el monumento al médico (parqueHospital.js).
 * - El aparcamiento del hospital, entre la fachada y el parque (en la foto aérea, lleno de coches):
 *   asfalto, dos filas de plazas pintadas y sus coches (HOSPITAL_SPOTS, que valterra/index.js pasa a
 *   map.lotSpots). Se entra por la calle del lateral del tanatorio, viniendo de la rotonda.
 * - En el aparcamiento, junto a la plazoleta (primera foto): el cartel de dos paneles en su isleta de
 *   picón con pitas y el bordillo pintado de rojo y blanco (arriba el blanco del 75 aniversario, debajo
 *   el gris oscuro «HOSPITAL INSULAR DE LANZAROTE») y, a la izquierda, el buzón amarillo de Correos
 *   delante del murete encalado del parque; detrás, los coches aparcados y el hospital.
 */

// la fachada del hospital que da al jardín (foto aérea): la puerta y hacia fuera
const DOOR = [660.5, -104.1], DOOR_N = [0.7772, 0.6295];
// el jardín: la entrada en el murete del parque (al sur de la parada de guaguas) y el monumento
const GATE_A = [700.53, -77.4], GATE_B = [700.24, -73.4];
const START = [700.4, -75.4], MONUMENT = [689, -81];
const PATH_W = 2.6, PLAZA_R = 2.6, RISE = 0.08, Y = 0.135;
// el cartel y el buzón, en la punta del aparcamiento que da a la plazoleta, mirando a ella
const SIGN = [690.2, -100.2], SIGN_N = [1, 0];
const BUZON = [690.6, -96.3], BUZON_N = [1, 0];

// el aparcamiento: la fachada (desde su punta sur, t a lo largo y s hacia fuera), el porche y los parques
const F = (t, s) => [652.5 + 0.6295 * t + 0.7772 * s, -94.22 - 0.7772 * t + 0.6295 * s];
const LOT = [F(0.8, 0.8), F(7.6, 0.8), F(7.6, 4.6), F(17.8, 4.6), F(17.8, 0.8), F(29.6, 0.8),
  [678.6, -111.4], [683.6, -117.6], [688, -124.8], [701.6, -125.4], [702.2, -121.2], [704.2, -104.3],
  [700, -101.8], [694.3, -98.3], [695.2, -94.2], [682.3, -98.8], [662.3, -96.9], [661.9, -93],
  // y se une, por el mismo borde, con el aparcamiento del tanatorio (tanatorioEntorno.js), que es la entrada
  [659.5, -86], [653, -88]];
const CAR_L = 4.6, STALL = 2.6;
// las dos filas de plazas: a lo largo del borde del parque (morro al parque) y la de enfrente (morro al norte)
function stalls() {
  const out = [], [ax, az] = [662, -96], d = [0.995, -0.0995], n = [-0.0995, -0.995];
  for (let t = 7.2; t < 20; t += STALL) out.push([ax + d[0] * t + n[0] * 2.9, az + d[1] * t + n[1] * 2.9, Math.atan2(-n[0], -n[1])]);
  for (let x = 684.6; x < 700; x += STALL) out.push([x, -111, Math.PI]);
  return out;
}
export const HOSPITAL_SPOTS = stalls();

const LIME = 0xf1efe8, BASALT = 0x34302c, GREEN = 0x2e4f3a;
const RED = 0xc8322b, WHITE = 0xf2f2ee;

// el eje del camino: dirección, izquierda y largo hasta la plaza del monumento
const DIR = (() => { const dx = MONUMENT[0] - START[0], dz = MONUMENT[1] - START[1], l = Math.hypot(dx, dz); return [dx / l, dz / l]; })();
const LEFT = [DIR[1], -DIR[0]];
const PATH_LEN = Math.hypot(MONUMENT[0] - START[0], MONUMENT[1] - START[1]) - PLAZA_R + 0.2;
const at = (u, v) => [START[0] + DIR[0] * u + LEFT[0] * v, START[1] + DIR[1] * u + LEFT[1] * v];

/** ¿cae en el camino o en la plaza del monumento? (para que parqueHospital.js no ponga piedras encima) */
export function enJardinHospital(x, z, d = 0) {
  if (Math.hypot(x - MONUMENT[0], z - MONUMENT[1]) < PLAZA_R + 0.3 + d) return true;
  const rx = x - START[0], rz = z - START[1];
  const u = rx * DIR[0] + rz * DIR[1], v = rx * LEFT[0] + rz * LEFT[1];
  return u > -1.5 && u < PATH_LEN + 0.5 && Math.abs(v) < PATH_W / 2 + 0.9 + d;
}

/** el porche de la puerta (foto: blanco, losa gruesa sobre cuatro columnas cuadradas y las puertas de cristal) */
function porche() {
  const k = new Kit();
  k.box(0, 0, 1.9, 8.8, 0.15, 3.9, 0xd9d4ca, { list: k.shell }).box(0, 0.15, 1.75, 8.2, 0.15, 3.5, 0xe2ddd3, { list: k.shell });
  for (const x of [-3.6, -1.3, 1.3, 3.6]) {
    k.box(x, 0.3, 3.2, 0.48, 3.4, 0.48, LIME);
    k.block(x, 3.2, 0.5, 0.5);
  }
  k.box(0, 3.7, 1.75, 8.6, 0.55, 3.5, LIME).box(0, 3.66, 1.75, 8.4, 0.05, 3.3, 0xd8d4cc);
  // las puertas de cristal y su marco
  k.box(0, 0.3, 0.06, 3.4, 2.7, 0.1, 0x3a4a45);
  k.box(0, 0.38, 0.13, 3.1, 2.5, 0.04, 0x1d2a2c);
  k.box(0, 0.38, 0.16, 0.06, 2.5, 0.03, 0x3a4a45);
  return k;
}

/** el camino de la foto: losas irregulares de piedra volcánica gris oscura, con la junta más oscura */
function losas() {
  const N = 5;
  let seed = 23;
  const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const jit = Array.from({ length: N }, () => Array.from({ length: N }, () => [(r() - 0.5) * 0.5, (r() - 0.5) * 0.5]));
  const t = canvasTex(256, 256, (g, w) => {
    const s = w / N;
    g.fillStyle = '#242220'; g.fillRect(0, 0, w, w);
    // las esquinas de las losas: rejilla movida que se repite (la del borde es la del otro lado)
    const P = (i, j) => [(i + jit[i % N][j % N][0]) * s, (j + jit[i % N][j % N][1]) * s];
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const q = [P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)];
      const cx = q.reduce((a, p) => a + p[0], 0) / 4, cy = q.reduce((a, p) => a + p[1], 0) / 4;
      const v = 62 + r() * 38;
      g.fillStyle = `rgb(${v},${v - 3},${v - 6})`;
      for (const [ox, oy] of [[0, 0], [-w, 0], [0, -w], [-w, -w]]) {
        g.beginPath();
        q.forEach(([x, y], k) => { const px = cx + (x - cx) * 0.93 + ox, py = cy + (y - cy) * 0.93 + oy; if (k) g.lineTo(px, py); else g.moveTo(px, py); });
        g.closePath(); g.fill();
      }
    }
    // poros y manchas de la piedra
    for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(${r() < 0.5 ? '20,18,16' : '150,145,138'},${0.15 + r() * 0.2})`; g.fillRect(r() * w, r() * w, 1 + r() * 2, 1 + r() * 2); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.userData.mpt = 2.6;
  return t;
}

/** pita (agave): hojas largas y gruesas que salen del centro */
function pita(k, x, y, z, s, hex = 0x6d8a72) {
  for (let i = 0; i < 9; i++) {
    const a = i * 0.7 + (i % 2) * 0.3;
    k.cyl(x, y, z, 0, 0.07 * s, 0.75 * s, hex, { seg: 4, rx: 0.5 + (i % 3) * 0.25, ry: a });
  }
}

/** el panel de arriba: blanco, el 75 del aniversario y los escudos de las tres instituciones */
function panelAniversario(g, w, h) {
  g.fillStyle = '#f6f6f3'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c9cdd1'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6);
  // el 75 en trazo azul verdoso, con el nombre encima, pequeño, y la ola debajo
  g.strokeStyle = '#2f7f8f'; g.lineWidth = h * 0.035; g.lineCap = 'round';
  g.font = `300 ${Math.round(h * 0.56)}px "Barlow", Arial, sans-serif`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.strokeText('75', w * 0.3, h * 0.5);
  g.fillStyle = '#1f6170';
  g.font = `600 ${Math.round(h * 0.075)}px "Barlow", Arial, sans-serif`;
  g.fillText('HOSPITAL INSULAR', w * 0.3, h * 0.13);
  g.beginPath(); g.moveTo(w * 0.14, h * 0.8); g.quadraticCurveTo(w * 0.3, h * 0.74, w * 0.46, h * 0.8); g.lineTo(w * 0.46, h * 0.83); g.quadraticCurveTo(w * 0.3, h * 0.77, w * 0.14, h * 0.83); g.fill();
  g.fillText('ANIVERSARIO', w * 0.3, h * 0.91);
  // a la derecha, uno debajo de otro: Cabildo, Servicio Canario de la Salud y Gobierno de Canarias
  const logos = ['Cabildo de\nLanzarote', 'Servicio Canario\nde la Salud', 'Gobierno\nde Canarias'];
  logos.forEach((t, i) => {
    const y = h * (0.2 + i * 0.3), x = w * 0.78;
    if (i === 1) {
      for (const [dx, dy, c] of [[0, -1, '#1d5aa6'], [-1, 0, '#f2c230'], [1, 0, '#1d5aa6'], [0, 1, '#f2c230']]) { g.fillStyle = c; g.fillRect(x + dx * h * 0.035 - h * 0.015, y + dy * h * 0.035 - h * 0.015, h * 0.03, h * 0.03); }
    } else {
      g.fillStyle = '#3a3f45';
      g.beginPath(); g.moveTo(x - h * 0.03, y - h * 0.045); g.lineTo(x + h * 0.03, y - h * 0.045); g.lineTo(x + h * 0.03, y + h * 0.01); g.quadraticCurveTo(x, y + h * 0.06, x - h * 0.03, y + h * 0.01); g.fill();
    }
    g.fillStyle = '#3a3f45';
    g.font = `500 ${Math.round(h * 0.045)}px "Barlow", Arial, sans-serif`;
    g.textAlign = 'left';
    t.split('\n').forEach((s, j) => g.fillText(s, x + h * 0.07, y - h * 0.02 + j * h * 0.05));
    g.textAlign = 'center';
  });
}

/** el panel de abajo: gris oscuro con el nombre en blanco */
function panelNombre(g, w, h) {
  g.fillStyle = '#4b5056'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#8b9096'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6);
  // arriba a la izquierda, la marca del Servicio Canario de la Salud; a la derecha, Gobierno de Canarias
  for (const [dx, dy, c] of [[0, -1, '#3b7fd0'], [-1, 0, '#f2c230'], [1, 0, '#3b7fd0'], [0, 1, '#f2c230']]) { g.fillStyle = c; g.fillRect(w * 0.08 + dx * h * 0.05 - h * 0.02, h * 0.2 + dy * h * 0.05 - h * 0.02, h * 0.04, h * 0.04); }
  g.fillStyle = '#e8eaec';
  g.beginPath(); g.moveTo(w * 0.62, h * 0.12); g.lineTo(w * 0.66, h * 0.12); g.lineTo(w * 0.66, h * 0.22); g.quadraticCurveTo(w * 0.64, h * 0.3, w * 0.62, h * 0.22); g.fill();
  g.font = `500 ${Math.round(h * 0.08)}px "Barlow", Arial, sans-serif`;
  g.textAlign = 'left'; g.textBaseline = 'middle';
  g.fillText('Gobierno', w * 0.68, h * 0.15); g.fillText('de Canarias', w * 0.68, h * 0.24);
  g.textAlign = 'center';
  g.font = `700 ${Math.round(h * 0.17)}px "Barlow", Arial, sans-serif`;
  g.fillText('HOSPITAL INSULAR', w / 2, h * 0.55);
  g.fillText('DE LANZAROTE', w / 2, h * 0.78);
}

/** la corneta de Correos, azul sobre el amarillo del buzón */
function correos(g, w, h) {
  g.clearRect(0, 0, w, h);
  g.strokeStyle = '#1f3f8f'; g.fillStyle = '#1f3f8f'; g.lineWidth = w * 0.07;
  g.beginPath(); g.arc(w * 0.5, h * 0.62, w * 0.22, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(w * 0.28, h * 0.62); g.lineTo(w * 0.08, h * 0.5); g.lineTo(w * 0.08, h * 0.76); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(w * 0.72, h * 0.62); g.lineTo(w * 0.9, h * 0.62); g.stroke();
  // la corona de arriba
  g.beginPath(); g.moveTo(w * 0.36, h * 0.3); g.lineTo(w * 0.36, h * 0.16); g.lineTo(w * 0.43, h * 0.24); g.lineTo(w * 0.5, h * 0.12); g.lineTo(w * 0.57, h * 0.24); g.lineTo(w * 0.64, h * 0.16); g.lineTo(w * 0.64, h * 0.3); g.closePath(); g.fill();
}

/** el cartel en su isleta (x a lo largo de la isleta, z hacia los que llegan) */
function cartel() {
  const k = new Kit(), B = 0.14, HC = 0.16, T = 0.2, ix = 2.2, iz = 0.95;
  // bordillo a trozos rojo y blanco alrededor de la isleta, picón dentro
  const curb = (ax, az, bx, bz) => {
    const len = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(len / 0.5));
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      k.box(ax + (bx - ax) * t, B, az + (bz - az) * t, Math.abs(bx - ax) / n || T, HC, Math.abs(bz - az) / n || T, i % 2 ? WHITE : RED);
    }
  };
  curb(-ix, -iz, ix, -iz); curb(-ix, iz, ix, iz); curb(-ix, -iz + T, -ix, iz - T); curb(ix, -iz + T, ix, iz - T);
  k.box(0, B, 0, 2 * ix - 2 * T, HC - 0.03, 2 * iz - 2 * T, 0x2b2927);
  k.block(0, 0, 2 * ix, 2 * iz);
  // las pitas y la yuca (foto)
  pita(k, -1.55, B + HC, 0.2, 1.0);
  pita(k, 1.45, B + HC, -0.15, 0.9, 0x7a9478);
  pita(k, 0.0, B + HC, 0.45, 0.7);
  k.cyl(1.75, B + HC, 0.45, 0.06, 0.08, 1.1, 0x6b5d50, { seg: 6 });
  pita(k, 1.75, B + HC + 1.05, 0.45, 0.8, 0x4f7a4a);
  // los dos postes y los dos paneles, con su marco; detrás, gris
  const PX = 1.0, P0 = B + HC;
  for (const x of [-PX, PX]) k.box(x, P0, -0.1, 0.09, 3.15, 0.09, 0x8d939a);
  k.box(0, P0 + 1.95, -0.1, 2.36, 1.18, 0.06, 0xd9dcdf);
  k.box(0, P0 + 0.68, -0.1, 2.36, 1.04, 0.06, 0x3f4449);
  k.pic(0, P0 + 1.95 + 0.59, -0.065, 2.3, 1.12, 0, 1, canvasTex(512, 250, panelAniversario));
  k.pic(0, P0 + 0.68 + 0.52, -0.065, 2.3, 0.98, 0, 1, canvasTex(512, 218, panelNombre));
  // los dos focos solares de arriba
  for (const x of [-0.6, 0.6]) {
    k.box(x, P0 + 3.13, -0.1, 0.26, 0.04, 0.2, 0x1f2224).box(x, P0 + 3.06, 0.02, 0.14, 0.08, 0.14, 0x2a2d30);
  }
  return k;
}

/** el buzón amarillo de Correos */
function buzon() {
  const k = new Kit(), Y = 0x2a2b2d, YEL = 0xf2c200;
  k.cyl(0, 0, 0, 0.29, 0.29, 0.08, Y, { seg: 18 });
  k.cyl(0, 0.08, 0, 0.25, 0.25, 0.95, YEL, { seg: 18 });
  k.cyl(0, 1.03, 0, 0.27, 0.27, 0.06, YEL, { seg: 18 });
  k.ball(0, 1.09, 0, 0.24, YEL, { sy: 0.35, seg: 16 });
  // la boca y la placa de horarios
  k.box(0, 0.86, 0.24, 0.26, 0.05, 0.03, Y).box(0, 0.62, 0.245, 0.16, 0.1, 0.02, 0xe6e6e0);
  k.pic(0, 0.38, 0.252, 0.32, 0.32, 0, 1, canvasTex(128, 128, correos));
  k.block(0, 0, 0.6, 0.6);
  return k;
}

/** las farolas verdes de la plaza del monumento (foto) */
function farola(k, x, z) {
  k.cyl(x, 0, z, 0.14, 0.16, 0.45, GREEN, { seg: 10 }).cyl(x, 0.45, z, 0.05, 0.065, 2.6, GREEN, { seg: 10 });
  k.box(x, 3.05, z, 0.3, 0.42, 0.3, 0xf3edd8);
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) k.box(x + dx * 0.15, 3.05, z + dz * 0.15, 0.035, 0.42, 0.035, GREEN);
  k.box(x, 3.0, z, 0.34, 0.06, 0.34, GREEN).cyl(x, 3.47, z, 0, 0.25, 0.22, GREEN, { seg: 4, ry: Math.PI / 4 }).ball(x, 3.72, z, 0.04, GREEN);
  k.block(x, z, 0.34, 0.34);
}

/** murete encalado de remate redondo por una línea de puntos [[x, z]...] */
function murete(k, line, h = 0.58) {
  for (let i = 0; i < line.length - 1; i++) {
    const [ax, az] = line[i], [bx, bz] = line[i + 1];
    const len = Math.hypot(bx - ax, bz - az), ry = Math.atan2(bx - ax, bz - az);
    k.box((ax + bx) / 2, 0, (az + bz) / 2, 0.32, h, len + 0.06, LIME, { ry });
    k.cyl(ax - Math.sin(ry) * 0.03, h, az - Math.cos(ry) * 0.03, 0.16, 0.16, len + 0.06, LIME, { seg: 10, rx: Math.PI / 2, ry });
    k.seg(ax, az, bx, bz);
  }
}

/** el jardín: camino de piedra con escalones, muretes en curva a la entrada, bordillos y la plaza */
function jardin(group, colliders) {
  const stones = losas();
  // los tramos del camino, cada uno un escalón más alto (u = metros desde la entrada)
  const STEPS = [1.3, 2.1, 6.6];
  const cuts = [-0.6, ...STEPS, PATH_LEN];
  for (let i = 0; i < cuts.length - 1; i++) {
    const m = paveMesh(bandTris([at(cuts[i], 0), at(cuts[i + 1], 0)], PATH_W), Y + i * RISE, stones, 0xffffff);
    if (m) group.add(m);
  }
  const plaza = paveMesh(discTris(MONUMENT[0], MONUMENT[1], PLAZA_R, 36), Y + STEPS.length * RISE, stones, 0xffffff);
  if (plaza) group.add(plaza);
  const k = new Kit();
  // los escalones: la cara de basalto oscuro de cada uno, de lado a lado del camino
  const ry = Math.atan2(LEFT[0], LEFT[1]);
  STEPS.forEach((u, i) => {
    const [x, z] = at(u, 0);
    k.box(x, 0, z, 0.22, Y + (i + 1) * RISE + 0.005, PATH_W, BASALT, { ry });
  });
  // la entrada: los muretes del parque se abren en curva hacia el camino (foto)
  const toUV = ([x, z]) => { const rx = x - START[0], rz = z - START[1]; return [rx * DIR[0] + rz * DIR[1], rx * LEFT[0] + rz * LEFT[1]]; };
  const [ua, va] = toUV(GATE_A), [ub, vb] = toUV(GATE_B);
  const side = (u0, v0, s) => [[u0, v0], [u0 + 0.8, s * 1.62], [u0 + 1.7, s * 1.5], [4.6, s * 1.48]].map(([u, v]) => at(u, v));
  const sa = Math.sign(va) || -1;
  murete(k, side(ua, va, sa));
  murete(k, side(ub, vb, -sa));
  // y luego bordillos blancos bajos hasta la plaza
  for (const s of [-1, 1]) {
    const a = at(4.6, s * 1.42), b = at(PATH_LEN - 0.1, s * 1.42);
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]), r2 = Math.atan2(b[0] - a[0], b[1] - a[1]);
    k.box((a[0] + b[0]) / 2, 0, (a[1] + b[1]) / 2, 0.16, Y + STEPS.length * RISE + 0.08, len, LIME, { ry: r2, list: k.shell });
  }
  // las dos farolas verdes a los lados, pasado el último escalón
  for (const s of [-1, 1]) farola(k, ...at(STEPS[2] + 2.0, s * 1.9));
  const built = k.build('jardinHospitalInsular');
  group.add(built.group);
  for (const sg of built.segs) colliders.addSegment(...sg);
}

/** el aparcamiento: asfalto y las rayas de las plazas */
function aparcamiento(group) {
  const pave = paveMesh(polyTris(LOT), 0.14, asfalto(), 0xffffff);
  if (pave) { pave.name = 'aparcamientoHospitalInsular'; group.add(pave); }
  const k = new Kit(), LINE = 0xe9e7e0;
  for (const [x, z, h] of HOSPITAL_SPOTS) {
    const fx = Math.sin(h), fz = Math.cos(h), sx = fz, sz = -fx;
    // las dos rayas de los lados de la plaza
    for (const s of [-1, 1]) k.box(x + sx * s * STALL / 2, 0.16, z + sz * s * STALL / 2, 0.1, 0.015, CAR_L + 0.3, LINE, { ry: h, list: k.shell });
  }
  group.add(k.build('rayasAparcamientoHospital').group);
}

export function buildHospitalInsular(scene, colliders) {
  const group = new THREE.Group();
  group.name = 'hospitalInsular';
  jardin(group, colliders);
  aparcamiento(group);
  scene.add(group);
  // las piezas que van giradas: el porche, el cartel con su isleta y el buzón
  const place = (k, origin, n, name) => {
    const { group: g, segs } = k.build(name);
    const ex = [n[1], -n[0]];
    g.position.set(origin[0], 0, origin[1]);
    g.rotation.y = Math.atan2(n[0], n[1]);
    scene.add(g);
    const w = (x, z) => [origin[0] + ex[0] * x + n[0] * z, origin[1] + ex[1] * x + n[1] * z];
    for (const [ax, az, bx, bz] of segs) colliders.addSegment(...w(ax, az), ...w(bx, bz));
    return g;
  };
  place(porche(), DOOR, DOOR_N, 'porcheHospitalInsular');
  place(cartel(), SIGN, SIGN_N, 'cartelHospitalInsular');
  place(buzon(), BUZON, BUZON_N, 'buzonCorreosHospital');
  return group;
}
