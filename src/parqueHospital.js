import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { laurel } from './sanGines.js';
import { blackStones, paveMesh, polyTris, picon } from './suelos.js';
import { Kit, canvasTex } from './interiorKit.js';
import { enJardinHospital } from './hospitalInsular.js';

/**
 * El parque del Hospital Insular (el antiguo), al lado de la oficina de Canary Consulting, entre el
 * hospital y la Escuela de Pesca, junto a la rotonda de la Avenida Olof Palme (José Manuel: «todo de
 * piedra, muy guapo, da sombrita y los estudiantes se ponen allí a comer bocadillos»). Con su foto:
 * suelo de picón negro con piedras grandes redondeadas, muretes encalados con el remate redondo, gradas
 * con el borde blanco que suben entre los árboles, palmeras (map.extraPalms) y laureles de Indias, y en
 * el borde del aparcamiento la parada de guaguas con su pérgola de arcos azules, el banco crema, la losa
 * de la parada y «BUS» pintado en el suelo. Son los dos trozos de la foto aérea: el de delante de la
 * oficina, con el monumento al médico del hospital (busto de bronce sobre su peana; el redondo blanco de
 * la foto aérea), y el triángulo arbolado junto al muro de la manzana de la torre; entre los dos, el
 * aparcamiento con sus plazas pintadas.
 * Con la segunda foto (la misma parada, mirando al norte): la señal azul de parada y el poste verde
 * «Hospital Insular» con los horarios junto a la pérgola, y detrás la plazoleta de losas de piedra
 * oscura que une los dos trozos de parque, con parterres redondos encalados (el del cardón y las pitas)
 * y una farola de farol negra.
 * Al sur de la parada, el murete se abre para el jardín que sube a la puerta del hospital (el camino de
 * piedra con sus escalones y los muretes en curva: hospitalInsular.js).
 */

// los dos trozos de parque (foto aérea): A delante de la oficina, B el triángulo junto al muro de la torre
const PARK_A = [[662, -96], [682, -98], [696, -93], [701, -84], [700, -70], [694, -63], [680, -64], [663, -76]];
const PARK_B = [[703, -121], [709, -126], [736, -88], [731, -83], [716, -81], [709, -91], [705, -104]];
// muretes encalados del lado del aparcamiento, con un hueco de entrada en cada trozo; en A, otro más
// al sur de la parada: la entrada del jardín que sube al hospital (hospitalInsular.js)
const WALLS = [
  [[682, -98], [696, -93], [698.2, -89.2]],
  [[699.8, -86.4], [701, -84], [700.53, -77.4]],
  [[700.24, -73.4], [700, -70], [694, -63]],
  [[703, -121], [705, -104], [706.4, -99.6]],
  [[707.6, -95.4], [709, -91], [716, -81]],
];
const MONUMENT = [689, -81];
// la plazoleta de losas de piedra oscura al norte de la parada (segunda foto): une los dos trozos
const PLAZ = [[701, -84], [707, -83.5], [709, -90.6], [707.4, -95.6], [706.2, -99.8], [700, -101], [694, -97.5], [696, -93]];
// sus parterres redondos encalados (x, z, radio, lo que llevan) y la farola de farol
const ROUND = [[703.2, -90.5, 1.7, 'cardon'], [701.4, -96.6, 1.3, 'pitas']];
const LAMP = [705.6, -87.2];
// la parada de guaguas de la foto: en el murete de A, mirando al aparcamiento (x hacia el norte)
const STOP = [700.7, -79.8], STOP_N = [0.997, 0.071];
// las gradas con el borde blanco que suben a la derecha de la parada (foto), alineadas con el murete
const STEPS = [691.2, -87.2];
// parterres: centro y lo que llevan (en los dos trozos de parque, fuera del aparcamiento)
const BEDS = [[676, -82, 'palm'], [668, -90, 'laurel'], [672, -72, 'laurel'], [684, -92, 'palm'], [694, -74, 'palm'], [683, -70, 'laurel'],
  [712, -92, 'palm'], [722, -89, 'laurel'], [711, -105, 'laurel'], [719, -99, 'palm'], [708, -116, 'palm'], [727, -93, 'laurel']];
// laureles sueltos sobre el picón, para la sombra (en la foto los árboles lo tapan casi todo)
const TREES = [[665, -82], [679, -88], [688, -93], [714, -86], [707, -110], [729, -87]];
// (sin parterres donde está la torre gris de la Escuela de Pesca, en el lado de la avenida: escuelaPesca.js)
export const PARQUE_HOSPITAL_PALMS = BEDS.filter(b => b[2] === 'palm').map(([x, z], i) => [x, z, 8 + (i % 3) * 0.8]);
const BED = 3.2, WALL = 0.5, T = 0.3, Y = 0.12;
const LIME = 0xf1efe8, BLUE = 0x2d55a8, SEAT = 0xe3cd8c;

/** caja con las uv en metros (para que la piedra no se estire) */
function stoneBox(w, h, d, mpt = 2) {
  const g = new THREE.BoxGeometry(w, h, d);
  const uv = g.getAttribute('uv');
  const size = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = f * 4; i < f * 4 + 4; i++) uv.setXY(i, uv.getX(i) * size[f][0] / mpt, uv.getY(i) * size[f][1] / mpt);
  return g;
}

/** generador repetible (las piedras salen siempre en el mismo sitio) */
function rng(seed) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function inside(poly, x, z) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, az] = poly[i], [bx, bz] = poly[j];
    if ((az > z) !== (bz > z) && x < ax + ((z - az) * (bx - ax)) / (bz - az)) c = !c;
  }
  return c;
}

/** la parada de guaguas: pérgola de cuatro arcos azules, banco crema, losa y las plazas pintadas */
function busStop() {
  const k = new Kit(), H = 2.35, Z0 = 0.45, Z1 = 1.9, C = Z1 - Z0, S = 0.3;
  const R = (C * C / 4 + S * S) / (2 * S), ARC = 2 * Math.asin(C / 2 / R);
  for (let i = 0; i < 4; i++) {
    const x = -1.875 + i * 1.25;
    k.cyl(x, 0, Z1, 0.04, 0.04, H, BLUE, { seg: 8 }).cyl(x, 0, Z0, 0.04, 0.04, H, BLUE, { seg: 8 });
    const a = new THREE.TorusGeometry(R, 0.035, 6, 16, ARC);
    a.rotateZ(Math.PI / 2 - ARC / 2);
    a.translate(0, H - (R - S), 0);
    a.rotateY(Math.PI / 2);
    a.translate(x, 0, (Z0 + Z1) / 2);
    k.add(a, BLUE);
  }
  for (const [y, z] of [[H, Z1], [H, Z0], [H + S, (Z0 + Z1) / 2]]) k.cyl(-1.875, y, z, 0.03, 0.03, 3.75, BLUE, { seg: 6, rx: Math.PI / 2, ry: Math.PI / 2 });
  // el banco de dos asientos, crema, sobre patas oscuras
  const bx = 0.45;
  k.box(bx, 0.42, 0.95, 1.8, 0.05, 0.46, SEAT).box(bx, 0.47, 0.71, 1.8, 0.42, 0.05, SEAT).box(bx, 0.4, 0.95, 0.04, 0.12, 0.46, SEAT);
  for (const dx of [-0.7, 0.7]) k.box(bx + dx, 0, 0.88, 0.06, 0.42, 0.4, 0x3a3d42);
  k.block(bx, 0.85, 1.8, 0.55);
  // la losa de la parada a la izquierda del banco, con la franja de botones para los ciegos
  k.box(-2.6, 0, 1.1, 2.2, 0.14, 1.9, 0xcbc5b8, { list: k.shell }).box(-2.6, 0.14, 1.85, 2.2, 0.01, 0.4, 0xcdbf8f, { list: k.shell });
  // plazas pintadas hacia el aparcamiento: la de la guagua delante de la losa y dos de coches
  for (const x of [-9.0, -6.5, -4.0, -1.3]) k.box(x, 0.11, 2.6 + 2.5, 0.1, 0.012, 5.0, 0xe9e7e0, { list: k.shell });
  k.box(-5.15, 0.11, 7.6, 7.8, 0.012, 0.1, 0xe9e7e0, { list: k.shell });
  // al norte de la pérgola, la señal de parada (mirando a las guaguas que llegan) y el poste verde
  k.cyl(2.7, 0, 2.1, 0.035, 0.035, 2.7, 0x9aa0a6, { seg: 8 });
  k.pic(2.66, 2.28, 2.1, 0.56, 0.98, -1, 0, canvasTex(160, 280, stopSign));
  k.box(2.69, 1.79, 2.1, 0.02, 0.98, 0.56, 0x9aa0a6);
  k.box(3.5, 0, 1.3, 0.16, 2.25, 0.3, 0x3d8b3d).box(3.5, 0, 1.3, 0.2, 0.25, 0.34, 0x2b4a2b);
  k.pic(3.41, 2.05, 1.3, 0.3, 0.32, -1, 0, canvasTex(120, 128, totemTop));
  k.pic(3.41, 1.35, 1.3, 0.24, 0.62, -1, 0, canvasTex(96, 248, totemPanel));
  k.block(3.5, 1.3, 0.3, 0.4);
  return k;
}

/** la plazoleta: parterres redondos encalados con picón, el cardón, las pitas y la farola de farol (en el mundo) */
function plazoleta() {
  const k = new Kit(), BLACK = 0x1d1f22;
  for (const [x, z, r, what] of ROUND) {
    k.cyl(x, 0, z, r, r, 0.55, LIME, { seg: 28 });
    k.cyl(x, 0.55, z, r - 0.16, r - 0.16, 0.02, 0x2b2927, { seg: 28 });
    if (what === 'cardon') {
      // cardón: columnas verdes que salen juntas, de distinta altura
      for (let i = 0; i < 11; i++) {
        const a = i * 2.4, d = 0.12 + (i % 4) * 0.13, h = 1.0 + ((i * 7) % 5) * 0.32;
        k.cyl(x + Math.cos(a) * d, 0.55, z + Math.sin(a) * d, 0.09, 0.1, h, 0x6c8a5e, { seg: 7 });
        k.ball(x + Math.cos(a) * d, 0.55 + h, z + Math.sin(a) * d, 0.09, 0x6c8a5e, { seg: 7 });
      }
    }
    for (let i = 0; i < (what === 'cardon' ? 3 : 5); i++) {
      const a = 0.9 + i * 1.3, d = r * 0.62;
      for (let j = 0; j < 8; j++) k.cyl(x + Math.cos(a) * d, 0.57, z + Math.sin(a) * d, 0, 0.045, 0.6, 0x6e8c74, { seg: 4, rx: 0.4 + (j % 3) * 0.22, ry: (j / 8) * Math.PI * 2 });
    }
    k.block(x, z, r * 1.8, r * 1.8);
  }
  // la farola de farol negra
  const [lx, lz] = LAMP;
  k.cyl(lx, 0, lz, 0.15, 0.17, 0.5, BLACK, { seg: 12 }).cyl(lx, 0.5, lz, 0.05, 0.07, 2.7, BLACK, { seg: 10 });
  k.box(lx, 3.2, lz, 0.28, 0.4, 0.28, 0xf1ead2);
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) k.box(lx + dx * 0.14, 3.2, lz + dz * 0.14, 0.03, 0.4, 0.03, BLACK);
  k.box(lx, 3.15, lz, 0.32, 0.05, 0.32, BLACK).cyl(lx, 3.6, lz, 0, 0.24, 0.22, BLACK, { seg: 4, ry: Math.PI / 4 }).ball(lx, 3.84, lz, 0.04, BLACK);
  k.block(lx, lz, 0.34, 0.34);
  return k;
}

/** la señal de parada: cuadro de borde azul con la guagua y el panel blanco de debajo */
function stopSign(g, w, h) {
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#1f4e9e';
  g.lineWidth = w * 0.09;
  g.strokeRect(w * 0.045, w * 0.045, w * 0.91, w * 0.91);
  g.lineWidth = w * 0.04;
  g.strokeRect(w * 0.02, w + w * 0.04, w * 0.96, h - w - w * 0.06);
  // la guagua: caja negra con ventanas y ruedas
  g.fillStyle = '#16181b';
  g.fillRect(w * 0.18, w * 0.36, w * 0.64, w * 0.26);
  g.fillStyle = '#ffffff';
  for (let i = 0; i < 4; i++) g.fillRect(w * (0.22 + i * 0.14), w * 0.4, w * 0.1, w * 0.09);
  g.fillStyle = '#16181b';
  for (const x of [0.3, 0.7]) { g.beginPath(); g.arc(w * x, w * 0.63, w * 0.055, 0, Math.PI * 2); g.fill(); }
}

/** el cartel de arriba del poste verde: la guagua y el nombre de la parada (el de la foto) */
function totemTop(g, w, h) {
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#1f4e9e';
  g.fillRect(w * 0.08, h * 0.08, w * 0.3, h * 0.2);
  g.fillStyle = '#c8322b';
  g.fillRect(w * 0.62, h * 0.08, w * 0.3, h * 0.2);
  g.fillStyle = '#1f2326';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.17)}px "Barlow", Arial, sans-serif`;
  g.fillText('Hospital', w / 2, h * 0.52);
  g.fillText('Insular', w / 2, h * 0.74);
}

/** el panel de horarios del poste: franjas verdes y blancas (sin inventar horas) */
function totemPanel(g, w, h) {
  g.fillStyle = '#e9f1e4';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#7fb069';
  for (let y = 0.08; y < 0.9; y += 0.11) g.fillRect(w * 0.1, h * y, w * 0.8, h * 0.035);
  g.fillStyle = '#2f6b2f';
  g.fillRect(0, h * 0.9, w, h * 0.1);
}

/** «BUS» pintado en el suelo de la plaza de la guagua (calcomanía plana) */
function busLetters(g, w, h) {
  g.fillStyle = '#f1efe8';
  g.font = `700 ${Math.round(h * 0.9)}px "Barlow", Arial, sans-serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('BUS', w / 2, h * 0.54);
}

/** las gradas: tres escalones de borde blanco con picón encima y piedras, cada uno más pequeño */
function steps() {
  const k = new Kit();
  for (let i = 0; i < 3; i++) {
    const w = 7 - 1.7 * i, d = 5 - 1.3 * i, y = 0.3 * i;
    k.box(0, y, 0, w, 0.3, d, LIME, { list: k.shell });
    k.box(0, y + 0.3, 0, w - 0.3, 0.015, d - 0.3, 0x2b2927, { list: k.shell });
  }
  for (const [x, z, r, c] of [[-2.6, 1.6, 0.45, 0x5a524a], [2.3, -1.5, 0.55, 0x4a4541], [-0.9, -0.6, 0.6, 0x8a8072], [1.2, 0.9, 0.38, 0x4a4541], [-2.2, -1.7, 0.4, 0x6e6357]]) {
    const top = Math.abs(x) < 1.8 && Math.abs(z) < 1.2 ? 0.9 : Math.abs(x) < 2.6 && Math.abs(z) < 1.85 ? 0.6 : 0.3;
    k.ball(x, top + r * 0.35, z, r, c, { sy: 0.65, sz: 0.85, seg: 8 });
  }
  k.block(0, 0, 7, 5);
  return k;
}

export function buildParqueHospital(scene, colliders) {
  const group = new THREE.Group();
  group.name = 'parqueHospital';
  const ground = picon();
  for (const P of [PARK_A, PARK_B]) {
    const pave = paveMesh(polyTris(P), Y, ground, 0xffffff);
    if (pave) group.add(pave);
  }
  const slabs = paveMesh(polyTris(PLAZ), Y, blackStones(), 0x7a7671);
  if (slabs) group.add(slabs);
  const out = { stones: [], lime: [], caps: [], soil: [], dark: [], bronze: [], trunk: [], leaves: [], rocks: [[], [], []] };
  const at = (g, x, y, z) => { g.translate(x, y, z); return g; };
  // muretes encalados de remate redondo
  for (const line of WALLS) {
    for (let i = 0; i < line.length - 1; i++) {
      const [ax, az] = line[i], [bx, bz] = line[i + 1];
      const len = Math.hypot(bx - ax, bz - az), ry = -Math.atan2(bz - az, bx - ax);
      const body = new THREE.BoxGeometry(len + 0.1, 0.72, 0.36);
      body.rotateY(ry);
      out.lime.push(at(body, (ax + bx) / 2, 0.36, (az + bz) / 2));
      const cap = new THREE.CylinderGeometry(0.18, 0.18, len + 0.1, 10);
      cap.rotateZ(Math.PI / 2);
      cap.rotateY(ry);
      out.lime.push(at(cap, (ax + bx) / 2, 0.72, (az + bz) / 2));
      colliders.addSegment(ax, az, bx, bz);
    }
  }
  const r = rng(4711);
  BEDS.forEach(([x, z, kind], k) => {
    // parterre cuadrado encalado, con remate claro, picón y un par de piedras
    for (const s of [-1, 1]) {
      out.lime.push(at(new THREE.BoxGeometry(BED, WALL, T), x, Y + WALL / 2, z + s * (BED - T) / 2));
      out.lime.push(at(new THREE.BoxGeometry(T, WALL, BED - 2 * T), x + s * (BED - T) / 2, Y + WALL / 2, z));
      out.caps.push(at(new THREE.BoxGeometry(BED + 0.06, 0.06, T + 0.06), x, Y + WALL + 0.03, z + s * (BED - T) / 2));
      out.caps.push(at(new THREE.BoxGeometry(T + 0.06, 0.06, BED - 2 * T), x + s * (BED - T) / 2, Y + WALL + 0.03, z));
    }
    out.soil.push(at(new THREE.BoxGeometry(BED - 2 * T, 0.04, BED - 2 * T), x, Y + WALL - 0.08, z));
    for (let i = 0; i < 2; i++) {
      const g = new THREE.IcosahedronGeometry(0.22 + r() * 0.15, 1);
      g.scale(1, 0.6, 0.85);
      out.rocks[i % 3].push(at(g, x + (r() - 0.5) * 1.6, Y + WALL - 0.02, z + (r() - 0.5) * 1.6));
    }
    if (kind === 'laurel') laurel(out, x, z, 0.85 + (k % 3) * 0.08, k);
    // banco de piedra a un lado del parterre, para comer a la sombra
    const side = k % 2 ? 1 : -1;
    out.dark.push(at(stoneBox(1.9, 0.42, 0.5), x, Y + 0.21, z + side * (BED / 2 + 1.1)));
    out.caps.push(at(new THREE.BoxGeometry(1.95, 0.05, 0.55), x, Y + 0.445, z + side * (BED / 2 + 1.1)));
    colliders.addPolygon([[x - BED / 2, z - BED / 2], [x + BED / 2, z - BED / 2], [x + BED / 2, z + BED / 2], [x - BED / 2, z + BED / 2], [x - BED / 2, z - BED / 2]]);
  });
  // el monumento: peana de basalto en dos cuerpos y el busto de bronce encima
  const [mx, mz] = MONUMENT;
  out.dark.push(at(stoneBox(2.2, 0.4, 2.2), mx, Y + 0.2, mz));
  out.stones.push(at(stoneBox(1.1, 1.7, 1.1), mx, Y + 0.4 + 0.85, mz));
  out.caps.push(at(new THREE.BoxGeometry(1.3, 0.12, 1.3), mx, Y + 2.16, mz));
  const shoulders = new THREE.SphereGeometry(0.42, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  shoulders.scale(1, 0.75, 0.6);
  out.bronze.push(at(shoulders, mx, Y + 2.22, mz));
  out.bronze.push(at(new THREE.CylinderGeometry(0.09, 0.11, 0.18, 10), mx, Y + 2.6, mz));
  const head = new THREE.SphereGeometry(0.17, 16, 12);
  head.scale(0.9, 1.12, 1);
  out.bronze.push(at(head, mx, Y + 2.82, mz));
  colliders.addPolygon([[mx - 1.1, mz - 1.1], [mx + 1.1, mz - 1.1], [mx + 1.1, mz + 1.1], [mx - 1.1, mz + 1.1], [mx - 1.1, mz - 1.1]]);
  // piedras grandes redondeadas sobre el picón (foto), lejos de parterres, monumento, gradas, murete y camino del jardín
  const clear = (x, z, d) => BEDS.every(([bx, bz]) => Math.max(Math.abs(bx - x), Math.abs(bz - z)) > BED / 2 + d)
    && TREES.every(([tx, tz]) => Math.hypot(tx - x, tz - z) > 0.6 + d) && Math.hypot(mx - x, mz - z) > 2.2 + d && Math.hypot(STEPS[0] - x, STEPS[1] - z) > 4.4 + d && Math.hypot(STOP[0] - x, STOP[1] - z) > 3.5
    && !enJardinHospital(x, z, d);
  for (const [P, n] of [[PARK_A, 16], [PARK_B, 12]]) {
    const xs = P.map(p => p[0]), zs = P.map(p => p[1]);
    for (let tries = 0, put = 0; put < n && tries < 400; tries++) {
      const x = Math.min(...xs) + r() * (Math.max(...xs) - Math.min(...xs)), z = Math.min(...zs) + r() * (Math.max(...zs) - Math.min(...zs));
      const s = 0.35 + r() * 0.65;
      if (!inside(P, x, z) || !clear(x, z, s + 0.6) || WALLS.some(l => l.some(([wx, wz]) => Math.hypot(wx - x, wz - z) < 1.2))) continue;
      const g = new THREE.IcosahedronGeometry(s, 1);
      g.scale(1, 0.62, 0.8 + r() * 0.3);
      g.rotateY(r() * Math.PI);
      out.rocks[put % 3].push(at(g, x, Y + s * 0.3, z));
      if (s > 0.55) colliders.addPolygon([[x - s, z - s], [x + s, z - s], [x + s, z + s], [x - s, z + s], [x - s, z - s]]);
      put++;
    }
  }
  TREES.forEach(([x, z], i) => laurel(out, x, z, 0.75 + (i % 3) * 0.1, i + 5));
  // el olivo de detrás del banco de la parada (foto)
  laurel(out, STOP[0] - STOP_N[0] * 1.6, STOP[1] - STOP_N[1] * 1.6 - 0.8, 0.55, 3);

  const add = (geos, mat, shadow = true) => {
    if (!geos.length) return;
    const m = new THREE.Mesh(mergeGeometries(geos.map(g => (g.index ? g.toNonIndexed() : g)), false), mat);
    m.castShadow = shadow;
    m.receiveShadow = true;
    group.add(m);
  };
  const stoneTex = blackStones();
  add(out.stones, new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.95 }));
  add(out.lime, new THREE.MeshStandardMaterial({ color: LIME, roughness: 0.92 }));
  add(out.caps, new THREE.MeshStandardMaterial({ color: 0xe4e0d6, roughness: 0.85 }));
  add(out.soil, new THREE.MeshStandardMaterial({ map: ground, color: 0xbbbbbb, roughness: 1 }), false);
  add(out.dark, new THREE.MeshStandardMaterial({ map: stoneTex, color: 0x9a948c, roughness: 0.9 }));
  add(out.bronze, new THREE.MeshStandardMaterial({ color: 0x5c8f7e, metalness: 0.35, roughness: 0.4 }));
  add(out.trunk, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }));
  add(out.leaves, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, flatShading: true }));
  [0x4a4541, 0x6e6357, 0x8f8576].forEach((c, i) => add(out.rocks[i], new THREE.MeshStandardMaterial({ color: c, roughness: 0.95, flatShading: true })));
  scene.add(group);

  // la parada y las gradas, como piezas del kit en su sitio
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
  const stop = place(busStop(), [STOP[0] + STOP_N[0] * 0.2, STOP[1] + STOP_N[1] * 0.2], STOP_N, 'paradaGuaguasHospital');
  const bus = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.9), new THREE.MeshStandardMaterial({
    map: canvasTex(256, 104, busLetters), transparent: true, depthWrite: false, roughness: 0.6,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
  }));
  bus.geometry.rotateX(-Math.PI / 2);
  bus.geometry.rotateY(Math.PI / 2);
  bus.position.set(-2.65, 0.125, 4.6);
  stop.add(bus);
  const pz = plazoleta().build('plazoletaParqueHospital');
  scene.add(pz.group);
  for (const sg of pz.segs) colliders.addSegment(...sg);
  const wd = [5, 9], wl = Math.hypot(...wd);
  place(steps(), STEPS, [wd[1] / wl, -wd[0] / wl], 'gradasParqueHospital');
  return group;
}
