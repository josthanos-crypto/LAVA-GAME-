import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Iglesia de San Ginés: tres naves encaladas con tejados de teja a dos
 * aguas, esquinas, cornisas y portadas de cantería de basalto, rosetón,
 * ventanas en arco y, en la esquina sur, la torre con su campanario, la
 * cúpula blanca, la linterna y la cruz. Detrás, el parque con sus laureles
 * de Indias (los bancos, farolas y caminos los pone parks.js).
 */

// esquinas del frente de la iglesia: la de enfrente y la de la torre
const FACADE = [[243.42, 311.27], [262.88, 335.29]];

// el parque de detrás de la iglesia (zona verde que el mapa no traía)
export const SAN_GINES_PARK = [[281, 344], [296, 325], [312, 330], [320, 342], [306, 358], [288, 357], [281, 344]];

const WHITE = 0xf1eee6, BASALT = 0x3b3734, TILE = 0xa4573c, DARK = 0x1c1a19, WOOD = 0x4a2f1f, BRONZE = 0x6b5a2e;

function colored(g, hex, j = 0) {
  const geo = g.index ? g.toNonIndexed() : g;
  if (geo.getAttribute('uv')) geo.deleteAttribute('uv');
  const c = new THREE.Color(hex), n = geo.getAttribute('position').count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i += 3) {
    const k = 1 + (j ? (Math.sin(i * 12.9898) * 0.5) * j : 0);
    for (let v = i; v < Math.min(n, i + 3); v++) arr.set([c.r * k, c.g * k, c.b * k], v * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return geo;
}

/** marco local de la iglesia: a a lo largo de las naves (desde la fachada), b a lo ancho, y arriba */
class Frame {
  constructor(ox, oz, ux, uz) { Object.assign(this, { ox, oz, ux, uz, vx: -uz, vz: ux }); }
  /** pieza en coordenadas locales (x = a, y, z = b) llevada al mundo */
  put(g, a, y, b, hex, j = 0) {
    g.rotateY(-Math.atan2(this.uz, this.ux));
    g.translate(this.ox + a * this.ux + b * this.vx, y, this.oz + a * this.uz + b * this.vz);
    return colored(g, hex, j);
  }
}

/** arco de medio punto (rectángulo + semicírculo) de ancho w y alto h, en el plano XY */
function archShape(w, h) {
  const s = new THREE.Shape();
  const r = w / 2;
  s.moveTo(-r, 0);
  s.lineTo(r, 0);
  s.lineTo(r, h - r);
  s.absarc(0, h - r, r, 0, Math.PI, false);
  s.lineTo(-r, 0);
  return s;
}
/** arco plano pegado a una pared que mira a +x (fachada) o a ±z (laterales) */
function arch(w, h, face) {
  const g = new THREE.ShapeGeometry(archShape(w, h), 8);
  if (face === 'front') g.rotateY(-Math.PI / 2);
  else if (face === 'left') g.rotateY(Math.PI);
  return g;
}

/** nave con tejado a dos aguas: a ∈ [0, L], b ∈ [b0, b1], pared hasta h y cumbrera a h + rh */
function nave(F, out, L, b0, b1, h, rh) {
  const w = b1 - b0, bc = (b0 + b1) / 2;
  out.walls.push(F.put(new THREE.BoxGeometry(L, h, w), L / 2, h / 2, bc, WHITE));
  // hastiales (los triángulos de las fachadas) y tejado
  const tri = new THREE.Shape();
  tri.moveTo(-w / 2, 0); tri.lineTo(w / 2, 0); tri.lineTo(0, rh); tri.lineTo(-w / 2, 0);
  for (const a of [0.01, L - 0.01]) {
    const g = new THREE.ShapeGeometry(tri);
    g.rotateY(a < 1 ? -Math.PI / 2 : Math.PI / 2);
    out.walls.push(F.put(g, a, h, bc, WHITE));
  }
  const slope = Math.hypot(w / 2, rh);
  for (const s of [-1, 1]) {
    const g = new THREE.BoxGeometry(L + 0.6, 0.14, slope + 0.35);
    g.rotateX(s * Math.atan2(rh, w / 2));
    out.roof.push(F.put(g, L / 2, h + rh / 2, bc + s * (w / 4), TILE, 0.06));
  }
  // caballete
  out.stone.push(F.put(new THREE.BoxGeometry(L + 0.6, 0.18, 0.25), L / 2, h + rh + 0.06, bc, 0x8a4a33));
  // cornisa y esquinas de cantería
  out.stone.push(F.put(new THREE.BoxGeometry(L + 0.2, 0.35, w + 0.2), L / 2, h - 0.15, bc, BASALT, 0.1));
  for (const a of [0, L]) for (const b of [b0, b1]) {
    out.stone.push(F.put(new THREE.BoxGeometry(0.62, h, 0.62), a, h / 2, b, BASALT, 0.12));
  }
}

function church(out, b) {
  // fachada: de la esquina de la torre (B) a la otra esquina del frente (A), medidas sobre la foto aérea
  const [A, B] = FACADE;
  const p = b.p.slice(0, -1);
  const n = p.length, cx = p.reduce((s, q) => s + q[0], 0) / n, cz = p.reduce((s, q) => s + q[1], 0) / n;
  const fx = (A[0] + B[0]) / 2, fz = (A[1] + B[1]) / 2;
  let ux = cx - fx, uz = cz - fz;
  const ul = Math.hypot(ux, uz);
  ux /= ul; uz /= ul;
  // largo de las naves: hasta el lado de atrás
  let L = 0;
  for (const [x, z] of p) L = Math.max(L, (x - fx) * ux + (z - fz) * uz);
  const F = new Frame(fx, fz, ux, uz);
  // ancho: de A a B a lo largo de v
  const bA = (A[0] - fx) * F.vx + (A[1] - fz) * F.vz, bB = (B[0] - fx) * F.vx + (B[1] - fz) * F.vz;
  const W = Math.abs(bB - bA), side = Math.sign(bB - bA);   // la torre está en b = side · W/2
  const hw = W / 2, cw = Math.min(12, W * 0.4);
  nave(F, out, L, -hw, -cw / 2, 8.6, 2.4);
  nave(F, out, L, cw / 2, hw, 8.6, 2.4);
  nave(F, out, L, -cw / 2, cw / 2, 11.4, 3.4);

  // portada principal de cantería, puerta, rosetón y puertas laterales
  const front = (g, b0, y, hex) => out.walls.push(F.put(g, -0.06, y, b0, hex));
  front(arch(4.2, 6.6, 'front'), 0, 0, BASALT);
  out.walls.push(F.put(arch(3.0, 5.4, 'front'), -0.1, 0, 0, WOOD));
  out.stone.push(F.put(new THREE.BoxGeometry(0.5, 0.45, 5.0), -0.25, 6.9, 0, BASALT));
  const rose = new THREE.CircleGeometry(1.25, 24);
  rose.rotateY(-Math.PI / 2);
  out.walls.push(F.put(rose, -0.08, 9.0, 0, BASALT));
  const roseIn = new THREE.CircleGeometry(0.95, 24);
  roseIn.rotateY(-Math.PI / 2);
  out.walls.push(F.put(roseIn, -0.11, 9.0, 0, 0x2a3440));
  for (const s of [-1, 1]) {
    const bb = s * (cw / 2 + (hw - cw / 2) / 2);
    front(arch(2.6, 4.4, 'front'), bb, 0, BASALT);
    out.walls.push(F.put(arch(1.8, 3.6, 'front'), -0.1, 0, bb, WOOD));
    // ventanas en arco a lo largo de los laterales
    for (let a = 5; a < L - 3; a += 6) {
      const g = arch(1.2, 2.6, s > 0 ? 'right' : 'left');
      out.walls.push(F.put(g, a, 4.2, s * (hw + 0.04), DARK));
      const fr = arch(1.6, 3.0, s > 0 ? 'right' : 'left');
      out.walls.push(F.put(fr, a, 4.0, s * (hw + 0.02), BASALT));
    }
  }

  // torre en la esquina de la fachada (un poco adelantada)
  const ta = 1.2, tb = side * (hw + 1.4), T = 5.4, H = 16;
  out.walls.push(F.put(new THREE.BoxGeometry(T, H, T), ta, H / 2, tb, WHITE));
  for (const da of [-T / 2, T / 2]) for (const db of [-T / 2, T / 2]) {
    out.stone.push(F.put(new THREE.BoxGeometry(0.55, H + 4.6, 0.55), ta + da, (H + 4.6) / 2, tb + db, BASALT, 0.12));
  }
  for (const y of [6, 11.5, H, H + 4.5]) out.stone.push(F.put(new THREE.BoxGeometry(T + 0.4, 0.35, T + 0.4), ta, y, tb, BASALT, 0.08));
  // campanario: cuatro huecos en arco con su campana
  out.walls.push(F.put(new THREE.BoxGeometry(T - 0.3, 4.4, T - 0.3), ta, H + 2.3, tb, WHITE));
  for (const [da, db, face] of [[-T / 2, 0, 'front'], [T / 2, 0, 'back'], [0, -T / 2, 'left'], [0, T / 2, 'right']]) {
    const g = arch(1.7, 3.1, face === 'back' ? 'front' : face);
    if (face === 'back') g.rotateY(Math.PI);
    out.walls.push(F.put(g, ta + da * 1.01, H + 0.6, tb + db * 1.01, DARK));
    const bell = new THREE.SphereGeometry(0.55, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6);
    out.stone.push(F.put(bell, ta + da * 0.75, H + 2.2, tb + db * 0.75, BRONZE));
  }
  // tambor, cúpula blanca, linterna y cruz
  out.walls.push(F.put(new THREE.CylinderGeometry(2.3, 2.45, 1.2, 8), ta, H + 5.3, tb, WHITE));
  const dome = new THREE.SphereGeometry(2.3, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  out.walls.push(F.put(dome, ta, H + 5.9, tb, 0xf6f4ee));
  out.walls.push(F.put(new THREE.CylinderGeometry(0.45, 0.5, 1.1, 8), ta, H + 8.6, tb, WHITE));
  out.walls.push(F.put(new THREE.SphereGeometry(0.5, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), ta, H + 9.15, tb, 0xf6f4ee));
  out.stone.push(F.put(new THREE.BoxGeometry(0.1, 1.5, 0.1), ta, H + 10.3, tb, 0x2a2a2a));
  out.stone.push(F.put(new THREE.BoxGeometry(0.1, 0.1, 0.8), ta, H + 10.6, tb, 0x2a2a2a));
  return { F, ta, tb, T };
}

/** laurel de Indias: tronco grueso y copa redonda y tupida */
function laurel(out, x, z, s, k) {
  const h = 2.6 * s;
  const t = new THREE.CylinderGeometry(0.3 * s, 0.45 * s, h, 8);
  t.translate(x, h / 2, z);
  out.trunk.push(colored(t, 0x6b5a48, 0.1));
  const blobs = [[0, 0, 0, 3.0], [1.6, -0.4, 0.6, 2.2], [-1.4, -0.3, -0.9, 2.3], [0.4, 0.6, -1.5, 2.0], [-0.6, 0.4, 1.6, 2.1]];
  blobs.forEach(([dx, dy, dz, r], i) => {
    const g = new THREE.IcosahedronGeometry(r * s, 1);
    g.translate(x + dx * s, h + 2.2 * s + dy * s, z + dz * s);
    out.leaves.push(colored(g, i % 2 ? 0x2f5a2a : 0x3a6a30, 0.25 + 0.05 * k));
  });
}

export function buildSanGines(scene, map, colliders) {
  const b = (map.buildings || []).find(q => q.sanGines);
  const group = new THREE.Group();
  group.name = 'sanGines';
  const out = { walls: [], stone: [], roof: [], trunk: [], leaves: [] };
  if (b) {
    const { F, ta, tb, T } = church(out, b);
    // la torre también choca
    const c = (a, bb) => [F.ox + a * F.ux + bb * F.vx, F.oz + a * F.uz + bb * F.vz];
    const q = [c(ta - T / 2, tb - T / 2), c(ta + T / 2, tb - T / 2), c(ta + T / 2, tb + T / 2), c(ta - T / 2, tb + T / 2)];
    colliders.addPolygon([...q, q[0]]);
  }
  // laureles del parque de detrás (a buena distancia unos de otros)
  const spots = [[289, 345, 1.0], [298, 333, 1.1], [309, 338, 0.95], [303, 350, 1.05], [314, 346, 0.85]];
  spots.forEach(([x, z, s], k) => laurel(out, x, z, s, k));
  const add = (geos, mat) => {
    if (!geos.length) return;
    const m = new THREE.Mesh(mergeGeometries(geos, false), mat);
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
  };
  add(out.walls, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88, side: THREE.DoubleSide }));
  add(out.stone, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75, metalness: 0.05 }));
  add(out.roof, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 }));
  add(out.trunk, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }));
  add(out.leaves, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, flatShading: true }));
  scene.add(group);
  return group;
}
