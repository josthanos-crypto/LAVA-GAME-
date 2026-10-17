import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Detalle de ciudad canaria: en las azoteas, casetones de la escalera,
 * bidones de agua negros y blancos, termos solares mirando al sur, aparatos
 * de aire y antenas; en parques y jardines, laureles de Indias de copa
 * redonda, ficus y algún drago. Todo con mallas instanciadas (unas pocas
 * llamadas de dibujo para miles de piezas).
 */

function rng(seed) {
  let s = Math.abs(Math.floor(seed * 9301 + 49297)) % 233280 || 1;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
}
function pointInPoly(poly, x, z) {
  let inn = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inn = !inn;
  }
  return inn;
}
function edgeDist(poly, x, z) {
  let d = Infinity;
  for (let i = 0; i < poly.length - 1; i++) {
    const [ax, az] = poly[i], [bx, bz] = poly[i + 1];
    const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2));
    d = Math.min(d, Math.hypot(x - ax - dx * t, z - az - dz * t));
  }
  return d;
}
const polyArea = (p) => {
  let s = 0;
  for (let i = 0; i < p.length - 1; i++) s += p[i][0] * p[i + 1][1] - p[i + 1][0] * p[i][1];
  return Math.abs(s / 2);
};
/** punto al azar dentro del polígono, a más de m metros del borde */
function inside(poly, r, m, tries = 24) {
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (const [x, z] of poly) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
  for (let k = 0; k < tries; k++) {
    const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0);
    if (pointInPoly(poly, x, z) && edgeDist(poly, x, z) > m) return [x, z];
  }
  return null;
}

/** pinta una pieza (para piezas de varios colores en una sola malla) */
function paint(g, hex) {
  const geo = g.index ? g.toNonIndexed() : g;
  if (geo.getAttribute('uv')) geo.deleteAttribute('uv');
  const c = new THREE.Color(hex), n = geo.getAttribute('position').count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) arr.set([c.r, c.g, c.b], i * 3);
  geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return geo;
}
const merged = (parts) => mergeGeometries(parts, false);
const T = (g, x, y, z) => { g.translate(x, y, z); return g; };

// ── piezas de azotea (en su sitio: base en y = 0) ──
function hutGeo() {
  return merged([
    paint(T(new THREE.BoxGeometry(2.4, 2.3, 2.6), 0, 1.15, 0), 0xf0ece4),
    paint(T(new THREE.BoxGeometry(2.6, 0.12, 2.8), 0, 2.36, 0), 0xd8d2c6),
    paint(T(new THREE.BoxGeometry(0.9, 1.95, 0.05), 0, 0.98, 1.31), 0x4a3a2c),
  ]);
}
function tankGeo() {
  return merged([
    paint(T(new THREE.CylinderGeometry(0.55, 0.55, 1.1, 8), 0, 0.68, 0), 0xffffff),
    paint(T(new THREE.CylinderGeometry(0.3, 0.32, 0.12, 6), 0, 1.29, 0), 0xffffff),
    paint(T(new THREE.BoxGeometry(1.2, 0.12, 1.2), 0, 0.06, 0), 0x9a9a96),
  ]);
}
function heaterGeo() {
  const panel = new THREE.BoxGeometry(1.0, 0.06, 2.0);
  panel.rotateX(0.62);       // mirando al sur (+z) y al cielo
  const tank = new THREE.CylinderGeometry(0.26, 0.26, 1.15, 8);
  tank.rotateZ(Math.PI / 2);
  const legs = [-0.45, 0.45].map(x => paint(T(new THREE.BoxGeometry(0.05, 1.1, 0.05), x, 0.55, -0.7), 0xb8bcc2));
  return merged([
    paint(T(panel, 0, 0.75, 0.15), 0x1d2c4a),
    paint(T(tank, 0, 1.35, -0.75), 0xf2f2ee),
    ...legs,
  ]);
}
function acGeo() {
  const fan = new THREE.CircleGeometry(0.2, 8);
  return merged([
    paint(T(new THREE.BoxGeometry(0.85, 0.6, 0.34), 0, 0.42, 0), 0xe6e6e2),
    paint(T(fan, 0.12, 0.42, 0.175), 0x3a3c40),
    paint(T(new THREE.BoxGeometry(0.9, 0.12, 0.4), 0, 0.06, 0), 0x8a8c90),
  ]);
}
function antennaGeo() {
  const parts = [paint(T(new THREE.CylinderGeometry(0.025, 0.03, 3.2, 4), 0, 1.6, 0), 0xa8acb2)];
  for (const [y, w] of [[2.6, 1.2], [2.95, 0.9], [3.2, 0.6]]) parts.push(paint(T(new THREE.BoxGeometry(w, 0.025, 0.025), 0, y, 0), 0xa8acb2));
  const dish = new THREE.SphereGeometry(0.38, 8, 3, 0, Math.PI * 2, 0, Math.PI * 0.35);
  dish.rotateX(-Math.PI / 2 + 0.5);
  parts.push(paint(T(dish, 0, 1.4, 0.25), 0xf0f0ee));
  return merged(parts);
}

// ── árboles de parque ──
function laurelCanopy() {
  const blobs = [[0, 0, 0, 1], [0.55, -0.15, 0.2, 0.72], [-0.5, -0.1, -0.3, 0.75], [0.15, 0.2, -0.55, 0.66], [-0.2, 0.15, 0.55, 0.7]];
  return merged(blobs.map(([x, y, z, r], i) => paint(T(new THREE.IcosahedronGeometry(r, 0), x, y, z), i % 2 ? 0x2f5a2a : 0x3a6a30)));
}
function dragoGeo() {
  const parts = [paint(T(new THREE.CylinderGeometry(0.45, 0.7, 2.6, 10), 0, 1.3, 0), 0x8f8578)];
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    const br = new THREE.CylinderGeometry(0.16, 0.26, 1.7, 7);
    br.translate(0, 0.85, 0);
    br.rotateZ(0.75);
    br.rotateY(a);
    parts.push(paint(T(br, 0, 2.5, 0), 0x8f8578));
    // penachos de hojas como espadas en la punta de cada rama
    const tip = [Math.cos(a) * 1.15, 3.7, -Math.sin(a) * 1.15];
    for (let j = 0; j < 7; j++) {
      const b = (j / 7) * Math.PI * 2;
      const leaf = new THREE.ConeGeometry(0.06, 0.9, 3);
      leaf.translate(0, 0.45, 0);
      leaf.rotateZ(0.9);
      leaf.rotateY(b);
      parts.push(paint(T(leaf, ...tip), 0x5f7f4a));
    }
  }
  return merged(parts);
}

export function buildCityDetail(scene, map) {
  const group = new THREE.Group();
  group.name = 'detalleCiudad';
  const roof = { hut: [], tank: [], heater: [], ac: [], ant: [] };
  for (const b of map.buildings || []) {
    if (b.skip || b.civic === 'hotel' || b.h < 2.8) continue;
    const p = b.p, A = polyArea(p);
    if (A < 30 || A > 6000) continue;
    const r = rng(p[0][0] * 7.1 + p[0][1] * 3.3);
    const y = b.h;
    if (A > 70 && b.h > 5 && r() < 0.8) { const q = inside(p, r, 2.2); if (q) roof.hut.push([q[0], y, q[1], r() * Math.PI * 2, 1]); }
    const tanks = A < 60 ? 1 : 1 + Math.floor(r() * 2);
    for (let k = 0; k < tanks; k++) { const q = inside(p, r, 1.3); if (q) roof.tank.push([q[0], y, q[1], 0, r() < 0.6 ? 0x1c1d1f : 0xeeeeea]); }
    if (r() < 0.35) { const q = inside(p, r, 1.8); if (q) roof.heater.push([q[0], y, q[1], 0, 1]); }
    const acs = r() < 0.6 ? 1 : 0;
    for (let k = 0; k < acs; k++) { const q = inside(p, r, 1.0); if (q) roof.ac.push([q[0], y, q[1], Math.floor(r() * 4) * Math.PI / 2, 1]); }
    if (r() < 0.3) { const q = inside(p, r, 1.2); if (q) roof.ant.push([q[0], y, q[1], r() * Math.PI, 1]); }
  }
  const trees = { trunk: [], crown: [], drago: [] };
  for (const a of map.areas || []) {
    if (a.k !== 'park' && a.k !== 'garden') continue;
    const A = polyArea(a.p);
    const r = rng(a.p[0][0] * 5.3 + a.p[0][1] * 1.7);
    const n = Math.max(1, Math.min(60, Math.round(A / 240)));
    for (let k = 0; k < n; k++) {
      const q = inside(a.p, r, 2.2);
      if (!q) continue;
      if (A > 3000 && r() < 0.06) { trees.drago.push([q[0], 0.1, q[1], r() * 6, 0.9 + r() * 0.5]); continue; }
      const s = 0.75 + r() * 0.6;
      trees.trunk.push([q[0], 0.1, q[1], r() * 6, s]);
      trees.crown.push([q[0], 0.1 + 3.6 * s, q[1], r() * 6, s * (2.2 + r() * 0.6)]);
    }
  }

  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), col = new THREE.Color();
  // una malla instanciada por casilla de 600 m: lo que queda detrás de la cámara no se dibuja
  const inst = (geo, list, mat, { shadow = true, tint = false } = {}) => {
    const tiles = new Map();
    for (const it of list) {
      const key = Math.floor(it[0] / 600) + ',' + Math.floor(it[2] / 600);
      if (!tiles.has(key)) tiles.set(key, []);
      tiles.get(key).push(it);
    }
    for (const items of tiles.values()) {
      const m = new THREE.InstancedMesh(geo, mat, items.length);
      items.forEach(([x, y, z, ry, s], i) => {
        q4.setFromAxisAngle(up, ry);
        const sc = tint ? 1 : s;
        m4.compose(new THREE.Vector3(x, y, z), q4, new THREE.Vector3(sc, sc, sc));
        m.setMatrixAt(i, m4);
        if (tint) m.setColorAt(i, col.set(s));
      });
      m.computeBoundingSphere();
      m.castShadow = shadow;
      m.receiveShadow = true;
      group.add(m);
    }
  };
  const vc = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7, metalness: 0.1 });
  inst(hutGeo(), roof.hut, vc);
  inst(tankGeo(), roof.tank, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55 }), { tint: true });
  inst(heaterGeo(), roof.heater, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0.3 }));
  inst(acGeo(), roof.ac, vc);
  inst(antennaGeo(), roof.ant, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.4, metalness: 0.6 }), { shadow: false });
  // árboles: tronco y copa (la copa va escalada aparte)
  const trunk = new THREE.CylinderGeometry(0.22, 0.34, 3.8, 8);
  trunk.translate(0, 1.9, 0);
  inst(paint(trunk, 0x6b5a48), trees.trunk, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }));
  inst(laurelCanopy(), trees.crown, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, flatShading: true }));
  inst(dragoGeo(), trees.drago, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, flatShading: true }));
  scene.add(group);
  return { group, counts: { ...Object.fromEntries(Object.entries(roof).map(([k, v]) => [k, v.length])), trees: trees.trunk.length, dragos: trees.drago.length } };
}
