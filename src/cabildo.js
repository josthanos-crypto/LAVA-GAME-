import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { paveMesh, discTris, bandTris, lightSlabs } from './suelos.js';

/**
 * Cabildo de Lanzarote (Avenida Fred Olsen, esquina con la Rambla Medular), según las fotos de
 * José Manuel (julio de 2025): edificio blanco de estilo neocanario con balaustradas y pináculos;
 * el ala del este con tres plantas (bajo y primera con ventanas rectas, la de arriba en arco);
 * el resto con dos plantas de ventanales grandes; la portada central de piedra beige con frontón
 * y el ventanal en arco; la torre del reloj de piedra beige; el muro curvo beige del extremo oeste,
 * sobre la Rambla Medular. Delante, la plaza de losa clara con su anillo de ladrillo rojizo y los
 * bolardos de media bola, la jardinera redonda de piedra de lava con el banco blanco, las jardineras
 * de lava con árboles en flor, los monolitos de acero corten y el pabellón de techo oscuro.
 * Todo dibujado aquí (nada copiado de Street View). El rótulo y las banderas los pone civic.js
 * (b.face apunta a la portada).
 */

const PT = [-1250, 480];           // un punto dentro del edificio del mapa
const LOW = 8.6, HIGH = 12.4;      // dos plantas / tres plantas (ala este)
// el ala alta del este, simplificada del polígono de OpenStreetMap
const ESTE = [[-1272.0, 456.5], [-1237.8, 453.3], [-1233.2, 504.3], [-1267.4, 507.5], [-1270.5, 473.7]];
// la fachada de la portada (el tramo central de la fachada sur)
const PA = [-1272.4, 496.3], PB = [-1299.5, 498.8];
const PABELLON = [-1283, 531];
const PLAZA = [-1283, 531], R_PLAZA = 17;   // el círculo de la foto aérea, con el pabellón en medio
const JARDINERA = [-1302, 517];   // la jardinera redonda con el banco blanco
const WHITE = 0xf4f2ec, BEIGE = 0xcdbb98, STONE = 0xd2c3a3, LAVA = 0x3a3533, CORTEN = 0x6e3b22, ROOF = 0x4a3328;

function tex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

const inside = (p, x, z) => {
  let c = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, zi] = p[i], [xj, zj] = p[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
};

let edificio = null;

export function tuneCabildo(map) {
  for (const b of map.buildings || []) {
    if (!edificio && inside(b.p, PT[0], PT[1])) edificio = b;
    // el pabellón de la plaza: blanco y bajo, con su techo oscuro
    if (inside(b.p, PABELLON[0], PABELLON[1])) { b.h = 3.2; b.s = 0; b.f = [244, 242, 236]; b.c = [74, 51, 40]; }
  }
  if (!edificio) return;
  const b = edificio;
  b.h = LOW; b.s = 0; b.f = [244, 242, 236]; b.c = [214, 210, 202];
  // rótulo y banderas de civic.js delante de la portada
  const L = Math.hypot(PB[0] - PA[0], PB[1] - PA[1]), tx = (PB[0] - PA[0]) / L, tz = (PB[1] - PA[1]) / L;
  const n = normalOut(b.p, PA, PB), mx = (PA[0] + PB[0]) / 2 + n[0] * 2.05, mz = (PA[1] + PB[1]) / 2 + n[1] * 2.05;
  b.face = [mx - tx * 3.25, mz - tz * 3.25, mx + tx * 3.25, mz + tz * 3.25, n[0], n[1], 6.5];
}

const area = (p) => { let s = 0; for (let i = 0; i < p.length - 1; i++) s += p[i][0] * p[i + 1][1] - p[i + 1][0] * p[i][1]; return s / 2; };
function normalOut(p, a, b) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]), out = area(p) >= 0 ? 1 : -1;
  return [out * (b[1] - a[1]) / len, -out * (b[0] - a[0]) / len];
}
/** lados del polígono (cerrado) con su normal hacia fuera */
function edges(p) {
  const q = p[0][0] === p[p.length - 1][0] && p[0][1] === p[p.length - 1][1] ? p : [...p, p[0]];
  const out = [];
  for (let i = 0; i < q.length - 1; i++) {
    const a = q[i], b = q[i + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (len < 1.2) continue;
    out.push({ a, b, len, n: normalOut(q, a, b) });
  }
  return out;
}

/** paño plano pegado a una pared: u en metros / bay */
function panel(e, y0, h, off, bay) {
  const g = new THREE.PlaneGeometry(e.len, h);
  const uv = g.getAttribute('uv');
  for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * (bay ? Math.max(1, Math.round(e.len / bay)) : 1));
  g.rotateY(Math.atan2(e.n[0], e.n[1]));
  g.translate((e.a[0] + e.b[0]) / 2 + e.n[0] * off, y0 + h / 2, (e.a[1] + e.b[1]) / 2 + e.n[1] * off);
  return g;
}

// --- lienzos -------------------------------------------------------------------------------
const glass = (g, x, y, w, h) => {
  const gr = g.createLinearGradient(0, y, 0, y + h);
  gr.addColorStop(0, '#9fb6c6'); gr.addColorStop(1, '#3f5262');
  g.fillStyle = gr; g.fillRect(x, y, w, h);
};
/** ala de tres plantas: 4 m de ancho por 12,4 m (32 px por metro) */
const bayAlta = () => tex(128, 397, (g, w, h) => {
  const Y = (m) => h - m * 32;
  g.fillStyle = '#f4f2ec'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#e3dfd5'; g.fillRect(0, 0, 7, h); g.fillRect(w - 7, 0, 7, h);       // pilastras
  g.fillStyle = '#d9d4c9'; g.fillRect(0, Y(0.5), w, 16);                             // zócalo
  for (const m of [4.2, 8.1]) { g.fillStyle = '#e6e2d9'; g.fillRect(0, Y(m), w, 9); } // impostas
  g.fillStyle = '#dcd7cc'; g.fillRect(0, Y(12.0), w, 14);                            // cornisa
  // bajo y primera: ventanas rectas con su recerco y su repisa
  for (const [b0, t0] of [[1.0, 3.3], [4.9, 7.3]]) {
    g.fillStyle = '#e0dbd0'; g.fillRect(36, Y(t0) - 6, 56, (t0 - b0) * 32 + 12);
    glass(g, 42, Y(t0), 44, (t0 - b0) * 32);
    g.fillStyle = '#f4f2ec'; g.fillRect(62, Y(t0), 4, (t0 - b0) * 32); g.fillRect(42, Y((b0 + t0) / 2), 44, 3);
    g.fillStyle = '#cfc9bd'; g.fillRect(32, Y(b0), 64, 6);
  }
  // segunda: ventana en arco
  const x0 = 42, x1 = 86, bot = Y(8.7), top = Y(10.9), r = (x1 - x0) / 2;
  g.fillStyle = '#e0dbd0'; g.beginPath(); g.moveTo(x0 - 6, bot + 4); g.lineTo(x0 - 6, top + r); g.arc(64, top + r, r + 6, Math.PI, 0); g.lineTo(x1 + 6, bot + 4); g.fill();
  const gr = g.createLinearGradient(0, top, 0, bot); gr.addColorStop(0, '#9fb6c6'); gr.addColorStop(1, '#3f5262');
  g.fillStyle = gr; g.beginPath(); g.moveTo(x0, bot); g.lineTo(x0, top + r); g.arc(64, top + r, r, Math.PI, 0); g.lineTo(x1, bot); g.fill();
  g.fillStyle = '#f4f2ec'; g.fillRect(62, top + 4, 4, bot - top - 4);
});
/** dos plantas de ventanales grandes: 4 m por 8,6 m */
const bayBaja = () => tex(128, 275, (g, w, h) => {
  const Y = (m) => h - m * 32;
  g.fillStyle = '#f4f2ec'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#e3dfd5'; g.fillRect(0, 0, 9, h); g.fillRect(w - 9, 0, 9, h);
  g.fillStyle = '#d9d4c9'; g.fillRect(0, Y(0.45), w, 14);
  g.fillStyle = '#dcd7cc'; g.fillRect(0, Y(8.2), w, 13);
  for (const [b0, t0] of [[0.7, 3.6], [4.6, 7.4]]) {
    glass(g, 18, Y(t0), 92, (t0 - b0) * 32);
    g.fillStyle = '#f4f2ec';
    for (const x of [18, 48, 78, 106]) g.fillRect(x, Y(t0), 4, (t0 - b0) * 32);
    g.fillRect(18, Y(t0) + 20, 92, 3);
  }
});
/** balaustrada: 4 m por 1 m, con transparencia */
const balaustres = () => tex(128, 32, (g, w, h) => {
  g.clearRect(0, 0, w, h);
  g.fillStyle = '#f6f4ef'; g.fillRect(0, 0, w, 5); g.fillRect(0, h - 5, w, 5);
  for (let x = 4; x < w; x += 11) {
    g.beginPath(); g.ellipse(x + 3, h / 2, 3.2, 9, 0, 0, Math.PI * 2); g.fill();
  }
});
/** portada: ventanal en arco con cuadrícula */
const arcoTex = () => tex(128, 256, (g, w, h) => {
  g.fillStyle = '#e9e5dc'; g.fillRect(0, 0, w, h);
  const r = w / 2 - 6;
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#a9c0cf'); gr.addColorStop(1, '#384a58');
  g.fillStyle = gr; g.beginPath(); g.moveTo(6, h); g.lineTo(6, r + 6); g.arc(w / 2, r + 6, r, Math.PI, 0); g.lineTo(w - 6, h); g.fill();
  g.fillStyle = '#e9e5dc';
  for (let x = 6 + 29; x < w - 6; x += 29) g.fillRect(x - 2, 0, 4, h);
  for (let y = r + 6; y < h; y += 34) g.fillRect(0, y - 2, w, 4);
});
const relojTex = () => tex(128, 128, (g, w) => {
  g.fillStyle = '#f6f2e6'; g.beginPath(); g.arc(64, 64, 60, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#2b2b2b'; g.lineWidth = 5; g.stroke();
  g.fillStyle = '#2b2b2b';
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; g.fillRect(64 + Math.sin(a) * 48 - 3, 64 - Math.cos(a) * 48 - 3, 6, 6); }
  g.lineWidth = 6; g.beginPath(); g.moveTo(64, 64); g.lineTo(64, 26); g.moveTo(64, 64); g.lineTo(90, 70); g.stroke();
});

export function buildCabildo(scene, colliders) {
  const group = new THREE.Group();
  group.name = 'cabildo';
  if (!edificio) { scene.add(group); return { group, update() {} }; }
  const byMat = new Map();
  const put = (key, g) => { if (!byMat.has(key)) byMat.set(key, []); byMat.get(key).push(g.index ? g.toNonIndexed() : g); };
  const solid = (key, g, x, y, z, ry = 0) => { g.rotateY(ry); g.translate(x, y, z); put(key, g); return g; };
  const box = (key, w, h, d, x, y, z, ry = 0) => solid(key, new THREE.BoxGeometry(w, h, d), x, y + h / 2, z, ry);

  // 1) el volumen alto del ala este (de 8,6 a 12,4 m)
  const sh = new THREE.Shape(ESTE.map(([x, z]) => new THREE.Vector2(x, -z)));
  const ext = new THREE.ExtrudeGeometry(sh, { depth: HIGH - LOW, bevelEnabled: false });
  ext.rotateX(-Math.PI / 2); ext.translate(0, LOW, 0);
  put('blanco', ext);

  // 2) fachadas: ala alta, resto bajo y el muro curvo beige del oeste
  const enEste = (e) => { const mx = (e.a[0] + e.b[0]) / 2; return mx > -1273.5; };
  for (const e of edges(ESTE)) {
    put('alta', panel(e, 0, HIGH, 0.09, 4));
    put('balaustre', panel(e, HIGH, 0.95, 0.06, 4));
  }
  for (const e of edges(edificio.p)) {
    if (enEste(e)) continue;
    const mx = (e.a[0] + e.b[0]) / 2;
    if (mx < -1324.5) { put('beige', panel(e, 0, LOW + 0.6, 0.07, 0)); continue; }   // el muro curvo
    put('baja', panel(e, 0, LOW, 0.07, 4));
    put('balaustre', panel(e, LOW, 0.95, 0.05, 4));
  }
  // pináculos en las esquinas de las balaustradas
  const cone = (x, y, z) => { solid('blanco', new THREE.ConeGeometry(0.16, 0.7, 8), x, y + 0.85, z); box('blanco', 0.34, 0.5, 0.34, x, y, z); };
  for (const e of edges(ESTE)) for (let s = 0; s <= e.len; s += Math.max(4, e.len / Math.round(e.len / 6))) {
    const t = s / e.len; cone(e.a[0] + (e.b[0] - e.a[0]) * t + e.n[0] * 0.1, HIGH + 1.0, e.a[1] + (e.b[1] - e.a[1]) * t + e.n[1] * 0.1);
  }
  for (const e of edges(edificio.p)) {
    if (enEste(e) || e.len < 4 || (e.a[0] + e.b[0]) / 2 < -1324.5) continue;
    for (const t of [0, 1]) cone(e.a[0] + (e.b[0] - e.a[0]) * t + e.n[0] * 0.08, LOW + 1.0, e.a[1] + (e.b[1] - e.a[1]) * t + e.n[1] * 0.08);
  }

  // 3) la portada de piedra beige con frontón y el ventanal en arco
  const L = Math.hypot(PB[0] - PA[0], PB[1] - PA[1]), tx = (PB[0] - PA[0]) / L, tz = (PB[1] - PA[1]) / L;
  const [nx, nz] = normalOut(edificio.p, PA, PB), ry = Math.atan2(nx, nz);
  const M = [(PA[0] + PB[0]) / 2, (PA[1] + PB[1]) / 2];
  const at = (s, d) => [M[0] + tx * s + nx * d, M[1] + tz * s + nz * d];
  { const [x, z] = at(0, 1.0); box('piedra', 6.5, 12.2, 2.0, x, 0, z, ry); }
  { // frontón
    const tri = new THREE.Shape([new THREE.Vector2(-3.4, 0), new THREE.Vector2(3.4, 0), new THREE.Vector2(0, 2.6)]);
    const g = new THREE.ExtrudeGeometry(tri, { depth: 2.0, bevelEnabled: false });
    g.translate(0, 0, -1.0);
    const [x, z] = at(0, 1.0); solid('piedra', g, x, 12.2, z, ry);
    const [x2, z2] = at(0, 2.02); box('blanco', 7.0, 0.3, 0.2, x2, 12.0, z2, ry);
  }
  { // ventanal en arco y la puerta
    const s = new THREE.Shape(), w = 3.4, h = 7.2, r = w / 2;
    s.moveTo(-r, 0); s.lineTo(r, 0); s.lineTo(r, h - r); s.absarc(0, h - r, r, 0, Math.PI, false); s.lineTo(-r, 0);
    const g = new THREE.ShapeGeometry(s, 12), p = g.getAttribute('position'), uv = g.getAttribute('uv');
    for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + r) / w, p.getY(i) / h);
    const [x, z] = at(0, 2.03); solid('arco', g, x, 3.4, z, ry);
    const [x2, z2] = at(0, 2.03); box('cristal', 2.6, 2.9, 0.06, x2, 0, z2, ry);
    const [x3, z3] = at(0, 2.6); box('blanco', 4.6, 0.5, 1.2, x3, 0, z3, ry);          // escalón
  }
  // 4) la torre del reloj, a la izquierda de la portada y un poco hacia dentro
  const [cx, cz] = at(-7.2, -2.5);
  box('piedra', 4.2, 15.6, 4.2, cx, 0, cz, ry);
  box('blanco', 4.7, 0.45, 4.7, cx, 15.6, cz, ry);
  for (const [dx, dz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) cone(cx + (dx * tx + dz * nx) * 2.1, 16.05 + 0.5, cz + (dx * tz + dz * nz) * 2.1);
  for (let k = 0; k < 4; k++) {
    const a = ry + (k * Math.PI) / 2, g = new THREE.CircleGeometry(0.95, 32);
    solid('reloj', g, cx + Math.sin(a) * 2.13, 14.2, cz + Math.cos(a) * 2.13, a);
  }

  // 5) la plaza: losa clara, anillo de ladrillo, bolardos de media bola
  const [px, pz] = PLAZA;
  const losa = paveMesh(discTris(px, pz, R_PLAZA, 48), 0.05, lightSlabs(), 0xe9d6b2);
  if (losa) group.add(losa);
  const ring = [];
  for (let i = 0; i <= 64; i++) { const a = (i / 64) * Math.PI * 2; ring.push([px + Math.sin(a) * (R_PLAZA + 1.2), pz + Math.cos(a) * (R_PLAZA + 1.2)]); }
  const anillo = paveMesh(bandTris(ring, 2.4), 0.06, lightSlabs(), 0xc79a86);
  if (anillo) group.add(anillo);
  const per = 2 * Math.PI * R_PLAZA, nb = Math.round(per / 2.3);
  for (let i = 0; i < nb; i++) {
    const a = (i / nb) * Math.PI * 2, x = px + Math.sin(a) * R_PLAZA, z = pz + Math.cos(a) * R_PLAZA;
    if (z < 511) continue;
    solid('gris', new THREE.SphereGeometry(0.42, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), x, 0, z);
  }
  // la jardinera redonda de lava con el banco blanco
  const [jx, jz] = JARDINERA;
  solid('lava', new THREE.CylinderGeometry(1.3, 1.4, 1.1, 20), jx, 0.55, jz);
  solid('verde', new THREE.SphereGeometry(0.9, 10, 8), jx, 1.45, jz);
  const banco = new THREE.CylinderGeometry(2.0, 2.0, 0.5, 20, 1, false, Math.PI * 0.6, Math.PI * 0.8);
  solid('blanco', banco, jx, 0.25, jz);
  const segs = [];
  const square = (x, z, hw, hd) => segs.push([x - hw, z - hd, x + hw, z - hd], [x + hw, z - hd, x + hw, z + hd], [x + hw, z + hd, x - hw, z + hd], [x - hw, z + hd, x - hw, z - hd]);
  square(jx, jz, 2.0, 2.0);
  // jardineras de lava con árboles en flor (lado de la Rambla Medular)
  const arbol = (x, z, h) => {
    solid('tronco', new THREE.CylinderGeometry(0.09, 0.13, h, 6), x, h / 2 + 0.6, z);
    solid('flor', new THREE.SphereGeometry(1.05, 10, 8), x, h + 0.9, z);
  };
  for (const [x, z, round] of [[-1322, 516, 0], [-1316.5, 517, 0], [-1311, 518, 0], [-1319, 523.5, 1], [-1313, 524.5, 0]]) {
    if (round) solid('lava', new THREE.CylinderGeometry(1.5, 1.6, 0.9, 20), x, 0.45, z);
    else box('lava', 2.3, 0.85, 2.3, x, 0, z);
    arbol(x, z, 1.8);
    square(x, z, round ? 1.6 : 1.15, round ? 1.6 : 1.15);
  }
  // monolitos de acero corten
  for (const [x, z, r] of [[-1322.5, 532, 0.3], [-1292.5, 513.5, -0.2]]) {
    box('corten', 1.6, 3.4, 0.6, x, 0, z, r);
    square(x, z, 0.9, 0.5);
  }
  // el techo oscuro del pabellón, que vuela por los lados
  box('techo', 14.8, 0.4, 14.2, PABELLON[0], 3.2, PABELLON[1]);

  const mats = {
    blanco: new THREE.MeshStandardMaterial({ color: WHITE, roughness: 0.85 }),
    piedra: new THREE.MeshStandardMaterial({ color: STONE, roughness: 0.9 }),
    beige: new THREE.MeshStandardMaterial({ color: BEIGE, roughness: 0.9 }),
    alta: new THREE.MeshStandardMaterial({ map: bayAlta(), roughness: 0.7 }),
    baja: new THREE.MeshStandardMaterial({ map: bayBaja(), roughness: 0.6 }),
    balaustre: new THREE.MeshStandardMaterial({ map: balaustres(), transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.8 }),
    arco: new THREE.MeshStandardMaterial({ map: arcoTex(), roughness: 0.3 }),
    reloj: new THREE.MeshStandardMaterial({ map: relojTex(), roughness: 0.6 }),
    cristal: new THREE.MeshStandardMaterial({ color: 0x2c3a44, roughness: 0.2, metalness: 0.3 }),
    gris: new THREE.MeshStandardMaterial({ color: 0x9a968f, roughness: 0.9 }),
    lava: new THREE.MeshStandardMaterial({ color: LAVA, roughness: 1 }),
    verde: new THREE.MeshStandardMaterial({ color: 0x5f8a3a, roughness: 0.9 }),
    tronco: new THREE.MeshStandardMaterial({ color: 0x6d5a45, roughness: 1 }),
    flor: new THREE.MeshStandardMaterial({ color: 0xd8744f, roughness: 0.9 }),
    corten: new THREE.MeshStandardMaterial({ color: CORTEN, roughness: 0.95, metalness: 0.2 }),
    techo: new THREE.MeshStandardMaterial({ color: ROOF, roughness: 0.9 }),
  };
  for (const [key, geos] of byMat) {
    const clean = geos.map(g => { for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k); return g; });
    const m = new THREE.Mesh(mergeGeometries(clean, false), mats[key]);
    m.castShadow = !['balaustre', 'reloj', 'arco'].includes(key);
    m.receiveShadow = true;
    group.add(m);
  }
  if (colliders) for (const sg of segs) colliders.addSegment(...sg);
  scene.add(group);
  return { group, update() {} };
}
