import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { laurel } from './sanGines.js';
import { plazaSlabs, blackStones, paveMesh, polyTris } from './suelos.js';

/**
 * Las calles de la iglesia de San Ginés como en la postal: la Plaza de Las
 * Palmas delante de la fachada, la calle de la torre (Academia), Otilia Díaz,
 * San Juan y el arranque de Manuel Miranda, empedradas de losas grises de
 * fachada a fachada (tapan asfalto, aceras y bordillos, que siguen debajo),
 * y, como en la foto de José Manuel, el parterre con borde de piedra negra y
 * juntas blancas, la cruz sobre su pirámide de piedra volcánica, bolas de
 * piedra en las esquinas, pilares blancos con bola y los laureles de Indias.
 * Las tres palmeras del parterre van con las demás (map.extraPalms).
 */

const CHURCH = [253, 323];
const STREETS = /^(Plaza de Las Palmas|Calle Otilia Diaz|Calle Academia|Calle San Juan|Calle Manuel Miranda)$/;
const REACH = 55;     // hasta dónde llegan las losas desde la iglesia
const MAX_HALF = 9;   // media calle como mucho, si no hay fachada antes
const PAVE_Y = 0.25;  // por encima de las aceras (0,24)

// el centro de la plaza (dentro del anillo de calles) y lo que lleva
const PLAZA = [[238.5, 311], [228, 314], [214, 333], [235, 351], [244, 361], [262.5, 340]];
// el parterre de la cruz: centro, a lo largo de la fachada (u) y hacia la plaza (v)
const BED = [243.8, 331.6], BU = [0.629, 0.777], BV = [-0.777, 0.629], BL = 7.6, BW = 3.8;
const bed = (a, b) => [BED[0] + BU[0] * a + BV[0] * b, BED[1] + BU[1] * a + BV[1] * b];
// las tres palmeras grandes del parterre (x, z, alto)
export const PLAZA_PALMS = [[...bed(-2.6, 0.9), 10], [...bed(1.3, -0.8), 9.5], [...bed(2.9, 0.9), 8.5]];
const LAURELS = [[232, 327, 0.9], [229, 340, 0.85], [240, 350, 0.95], [248, 351, 0.8]];

/** las calles de la plaza no son para aparcar (parked.js) */
export function markPlazaStreets(map) {
  for (const r of map.roads || []) {
    if (STREETS.test(r.name || '') && r.p.some(([x, z]) => Math.hypot(x - CHURCH[0], z - CHURCH[1]) < 30)) r.noParking = true;
  }
}

function inPoly(p, x, z) {
  let c = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, zi] = p[i], [xj, zj] = p[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
}

/** trozos de 3 m de cada calle, cada uno con su ancho hasta las fachadas de cada lado */
function streetTris(map) {
  const near = (map.buildings || []).filter(b => b.p.some(([x, z]) => Math.hypot(x - CHURCH[0], z - CHURCH[1]) < REACH + 30));
  const built = (x, z) => near.some(b => inPoly(b.p, x, z));
  const reach = (x, z, nx, nz) => {
    for (let d = 1; d <= MAX_HALF; d += 0.5) if (built(x + nx * d, z + nz * d)) return Math.max(2, d - 0.3);
    return MAX_HALF;
  };
  const tris = [];
  for (const r of map.roads || []) {
    if (!STREETS.test(r.name || '')) continue;
    for (let i = 0; i < r.p.length - 1; i++) {
      const [ax, az] = r.p[i], [bx, bz] = r.p[i + 1];
      const L = Math.hypot(bx - ax, bz - az);
      if (L < 0.3) continue;
      const ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux;
      const n = Math.max(1, Math.round(L / 3));
      for (let k = 0; k < n; k++) {
        // un poco más largo que su trozo para que no queden rendijas en los giros
        const t0 = Math.max(0, k / n - 0.4 / L), t1 = Math.min(1, (k + 1) / n + 0.4 / L);
        const mx = ax + (bx - ax) * (t0 + t1) / 2, mz = az + (bz - az) * (t0 + t1) / 2;
        if (Math.hypot(mx - CHURCH[0], mz - CHURCH[1]) > REACH) continue;
        const wl = reach(mx, mz, nx, nz), wr = reach(mx, mz, -nx, -nz);
        const p0 = [ax + (bx - ax) * t0, az + (bz - az) * t0], p1 = [ax + (bx - ax) * t1, az + (bz - az) * t1];
        const A = [p0[0] + nx * wl, p0[1] + nz * wl], B = [p1[0] + nx * wl, p1[1] + nz * wl];
        const C = [p1[0] - nx * wr, p1[1] - nz * wr], D = [p0[0] - nx * wr, p0[1] - nz * wr];
        tris.push([A, B, C], [A, C, D]);
      }
    }
  }
  return tris;
}

/** pieza girada como el parterre y puesta en (a, b) del parterre, con la base en y */
function onBed(g, a, b, y) {
  g.rotateY(Math.atan2(-BU[1], BU[0]));
  const [x, z] = bed(a, b);
  g.translate(x, y, z);
  return g;
}

/** uv de una caja de w × h × d en metros de textura (mpt metros por vuelta), para que la piedra no se estire */
function boxUV(g, w, h, d, mpt = 2) {
  const uv = g.getAttribute('uv');
  const size = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = f * 4; i < f * 4 + 4; i++) uv.setXY(i, uv.getX(i) * size[f][0] / mpt, uv.getY(i) * size[f][1] / mpt);
  return g;
}

/** parterre, pirámide de piedra con la cruz, plantas, bolas de piedra y pilares blancos (foto de José Manuel) */
function cross(out) {
  const Y = PAVE_Y, H = 0.45, T = 0.3;
  // borde de piedra negra con juntas blancas y la tierra
  for (const s of [-1, 1]) {
    out.stones.push(onBed(boxUV(new THREE.BoxGeometry(BL, H, T), BL, H, T), 0, s * (BW - T) / 2, Y + H / 2));
    out.stones.push(onBed(boxUV(new THREE.BoxGeometry(T, H, BW - 2 * T), T, H, BW - 2 * T), s * (BL - T) / 2, 0, Y + H / 2));
  }
  out.soil.push(onBed(new THREE.BoxGeometry(BL - 2 * T, 0.05, BW - 2 * T), 0, 0, Y + H - 0.1));
  // pirámide truncada de piedra volcánica y la cruz encima
  const pyr = new THREE.CylinderGeometry(0.78, 1.72, 2.3, 4, 1, false, Math.PI / 4);
  const puv = pyr.getAttribute('uv');
  for (let i = 0; i < puv.count; i++) puv.setXY(i, puv.getX(i) * 3.4, puv.getY(i) * 1.15);
  out.stones.push(onBed(pyr, -0.6, 0, Y + H + 1.15));
  out.dark.push(onBed(new THREE.BoxGeometry(1.25, 0.16, 1.25), -0.6, 0, Y + H + 2.38));
  out.dark.push(onBed(new THREE.BoxGeometry(0.34, 1.9, 0.34), -0.6, 0, Y + H + 3.41));
  out.dark.push(onBed(new THREE.BoxGeometry(1.15, 0.3, 0.34), -0.6, 0, Y + H + 3.85));
  // matas y pitas en la tierra
  let s = 5;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 9; i++) {
    const a = (r() - 0.5) * (BL - 1.4), b = (r() - 0.5) * (BW - 1.2);
    if (Math.abs(a + 0.6) < 1.5) continue;
    const g = new THREE.IcosahedronGeometry(0.3 + r() * 0.25, 0);
    g.scale(1, 0.7, 1);
    out.plants.push(onBed(g, a, b, Y + H + 0.1));
  }
  for (const [a, b] of [[-2.2, -1.0], [0.9, 0.9], [2.4, -0.7]]) {
    for (let k = 0; k < 5; k++) {
      const leaf = new THREE.ConeGeometry(0.07, 0.8, 4);
      leaf.translate(0, 0.4, 0);
      leaf.rotateZ(0.5 + r() * 0.3);
      leaf.rotateY((k / 5) * Math.PI * 2);
      out.plants.push(onBed(leaf, a, b, Y + H));
    }
  }
  // bolas de piedra oscura en las esquinas, por fuera
  for (const sa of [-1, 1]) for (const sb of [-1, 1]) {
    out.dark.push(onBed(new THREE.SphereGeometry(0.38, 14, 10), sa * (BL / 2 + 0.55), sb * (BW / 2 + 0.55), Y + 0.38));
  }
  // pilares blancos con su bola, a los lados de la plaza
  for (const sa of [-1, 1]) for (const sb of [-1, 1]) {
    out.white.push(onBed(new THREE.BoxGeometry(0.45, 1.05, 0.45), sa * 6.8, sb * 4.2, Y + 0.525));
    out.white.push(onBed(new THREE.SphereGeometry(0.24, 12, 8), sa * 6.8, sb * 4.2, Y + 1.29));
  }
  return [bed(-BL / 2, -BW / 2), bed(BL / 2, -BW / 2), bed(BL / 2, BW / 2), bed(-BL / 2, BW / 2), bed(-BL / 2, -BW / 2)];
}

export function buildPlazaPalmas(scene, map, colliders) {
  const group = new THREE.Group();
  group.name = 'plazaPalmas';
  const tex = plazaSlabs();
  const pave = paveMesh([...streetTris(map), ...polyTris(PLAZA)], PAVE_Y, tex);
  if (pave) group.add(pave);
  const out = { white: [], dark: [], stones: [], soil: [], plants: [], trunk: [], leaves: [] };
  colliders.addPolygon(cross(out));
  LAURELS.forEach(([x, z, s], k) => laurel(out, x, z, s, k));
  const add = (geos, mat) => {
    if (!geos.length) return;
    const m = new THREE.Mesh(mergeGeometries(geos.map(g => (g.index ? g.toNonIndexed() : g)), false), mat);
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
  };
  const stoneTex = blackStones();
  add(out.white, new THREE.MeshStandardMaterial({ color: 0xf1eee7, roughness: 0.8 }));
  add(out.dark, new THREE.MeshStandardMaterial({ color: 0x3a3734, roughness: 0.85 }));
  add(out.stones, new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.95 }));
  add(out.soil, new THREE.MeshStandardMaterial({ color: 0x4a3626, roughness: 1 }));
  add(out.plants, new THREE.MeshStandardMaterial({ color: 0x4e7a3a, roughness: 0.8, flatShading: true }));
  add(out.trunk, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }));
  add(out.leaves, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, flatShading: true }));
  scene.add(group);
  return group;
}
