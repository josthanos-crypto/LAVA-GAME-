import * as THREE from 'three';
import { mergeGeometries, toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';
import { ruedaLejos } from './ruedas.js';
import { focos } from './cocheDetalle.js';

/**
 * El coche visto de lejos (Version 133): la misma silueta que el de cerca, sacada de las mismas secciones,
 * pero con muchos menos triángulos (unos 2.000 en vez de 13.000) y todo en una sola malla de tres trozos:
 * chapa (lleva la pintura de cada coche), resto (plásticos, cristales y ruedas, con el color en los
 * vértices) y luces (faros y pilotos, que de noche brillan sin pedir luz a nadie).
 *
 * carModels.js lo enseña en vez del coche detallado a partir de cierta distancia (userData.setDist).
 */

// de los 16 puntos de la media sección de carModels.js se quedan 9; JTAG dice a qué franja de color
// (el «j» de faceColor) corresponde cada cara que queda
const KEEP = [0, 1, 3, 8, 9, 10, 12, 13, 15];
const JTAG = [0, 2, 5, 8, 9, 10, 12, 14];
const CRISTAL = [0.035, 0.05, 0.065];

function estaciones(s) {
  const zs = [];
  for (const d of [0.06, 0.24]) zs.push(s.zr + d, s.zf - d);
  for (let z = s.zr + 0.5; z < s.zf - 0.3; z += 0.5) zs.push(z);
  for (const wz of s.wheels) for (const t of [-1, -0.72, -0.38, 0, 0.38, 0.72, 1]) zs.push(wz + t * s.archR);
  const marcas = [...(s.win || []), ...s.topGlass.flat(), ...s.cabZ, ...(s.cockpit || []), ...(s.bed || [])];
  const todo = [...new Set([...zs, ...marcas].filter(z => z > s.zr + 0.02 && z < s.zf - 0.02).map(z => Math.round(z * 1000) / 1000))].sort((a, b) => a - b);
  // sin secciones pegadas (menos de 5 cm); las marcas de cristales mandan
  const out = [s.zr];
  const esMarca = new Set(marcas.map(z => Math.round(z * 1000) / 1000));
  for (const z of todo) {
    const prev = out[out.length - 1];
    if (z - prev < 0.05) { if (esMarca.has(z) && !esMarca.has(prev) && out.length > 1) out[out.length - 1] = z; continue; }
    out.push(z);
  }
  out.push(s.zf);
  return out;
}

function conColor(geo, col) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
  const n = g.getAttribute('position').count;
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[i * 3] = col[0]; a[i * 3 + 1] = col[1]; a[i * 3 + 2] = col[2]; }
  g.setAttribute('color', new THREE.BufferAttribute(a, 3));
  return g;
}

const cache = new Map();
/**
 * M: el modelo de carModels.js (buildModel). taller: { section, halfRing, faceColor, classOf } de carModels.js.
 * Devuelve una geometría con grupos 0 chapa · 1 resto · 2 luces
 */
export function cocheLejos(M, taller) {
  const s = M.s;
  if (cache.has(s.type)) return cache.get(s.type);
  const { section, halfRing, faceColor, classOf } = taller;
  const zs = estaciones(s);
  const anillos = zs.map(z => {
    const h = halfRing(s, section(s, z));
    const m = KEEP.map(i => h[i]);
    return [...m, ...m.slice(1, -1).reverse().map(([x, y]) => [-x, y])];
  });
  const RN = anillos[0].length;   // 16
  const pos = [[], []], col = [[], []];
  for (let i = 0; i < zs.length - 1; i++) {
    const zMid = (zs[i] + zs[i + 1]) / 2, cm = section(s, zMid);
    for (let k = 0; k < RN; k++) {
      const k2 = (k + 1) % RN;
      const j = JTAG[k < 8 ? k : 15 - k];
      const yMid = (anillos[i][k][1] + anillos[i][k2][1] + anillos[i + 1][k][1] + anillos[i + 1][k2][1]) / 4;
      const c0 = faceColor(s, j, zMid, yMid, cm);
      const cls = classOf(c0), c = cls === 2 ? CRISTAL : c0, t = cls === 0 ? 0 : 1;
      const a = [anillos[i][k][0], anillos[i][k][1], zs[i]], b = [anillos[i][k2][0], anillos[i][k2][1], zs[i]];
      const d0 = [anillos[i + 1][k][0], anillos[i + 1][k][1], zs[i + 1]], d1 = [anillos[i + 1][k2][0], anillos[i + 1][k2][1], zs[i + 1]];
      pos[t].push(...a, ...b, ...d1, ...a, ...d1, ...d0);
      for (let v = 0; v < 6; v++) col[t].push(c[0], c[1], c[2]);
    }
  }
  // tapas de morro y zaga (chapa)
  const tapa = (ring, z, dir) => {
    const cy = ring.reduce((a, p) => a + p[1], 0) / ring.length;
    for (let k = 0; k < ring.length; k++) {
      const p0 = ring[k], p1 = ring[(k + 1) % ring.length];
      const tri = dir > 0 ? [[0, cy], p0, p1] : [[0, cy], p1, p0];
      for (const [x, y] of tri) { pos[0].push(x, y, z); col[0].push(1, 1, 1); }
    }
  };
  tapa(anillos[anillos.length - 1], s.zf, 1);
  tapa(anillos[0], s.zr, -1);
  const piel = pos.map((p, t) => {
    let g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col[t], 3));
    g = toCreasedNormals(g, 0.62);
    return g;
  });
  const chapa = [piel[0]], resto = [piel[1]], luces = [];
  // caja del camión
  if (s.box) {
    const { z: [z0, z1], w, y: [y0, y1] } = s.box;
    const g = new THREE.BoxGeometry(w, y1 - y0, z1 - z0);
    g.translate(0, (y0 + y1) / 2, (z0 + z1) / 2);
    chapa.push(conColor(g, [1, 1, 1]));
  }
  // ruedas fundidas (no giran: de lejos no se nota)
  const rueda = ruedaLejos(s.wheelR, s.tireW, s.rim);
  for (const z of s.wheels) {
    const c = section(s, z);
    for (const sx of [-1, 1]) {
      const g = rueda.clone();
      if (sx < 0) g.rotateY(Math.PI);
      g.translate(sx * (c.hw - s.tireW / 2 + 0.005), s.wheelR, z);
      resto.push(g);
    }
  }
  // faros y pilotos: una placa de color por cada uno
  const f = focos(M);
  const placa = (fo, z, dir) => {
    const g = new THREE.PlaneGeometry(fo.w, fo.h);
    if (dir < 0) g.rotateY(Math.PI);
    g.translate(fo.x, fo.y, z + dir * 0.012);
    const c = new THREE.Color(fo.col);
    luces.push(conColor(g, [c.r, c.g, c.b]));
  };
  for (const fo of f.del) placa(fo, s.zf, 1);
  for (const fo of f.tras) placa(fo, s.zr, -1);
  if (s.fenders) {
    // el escarabajo lleva los faros sobre las aletas
    for (const sx of [-1, 1]) {
      const c = section(s, s.wheels[0]);
      const g = new THREE.CircleGeometry(0.085, 8);
      g.translate(sx * (c.hw - 0.03), s.wheelR + 0.3, s.wheels[0] + 0.43);
      luces.push(conColor(g, [1, 0.95, 0.85]));
    }
  }
  const trozos = [chapa, resto, luces].map(l => (l.length ? mergeGeometries(l, false) : null));
  const geo = mergeGeometries(trozos.filter(Boolean), false);
  geo.clearGroups();
  let ini = 0;
  trozos.forEach((g, k) => {
    if (!g) return;
    const n = g.getAttribute('position').count;
    geo.addGroup(ini, n, k);
    ini += n;
  });
  geo.computeBoundingSphere();
  cache.set(s.type, geo);
  return geo;
}

// plásticos, cristales y ruedas del coche lejano: un solo material con el color en los vértices
export const RESTO_LEJOS = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.55, metalness: 0.2 });
// faros y pilotos del coche lejano: no les afecta la luz; de noche se suben (setLucesLejos)
export const LUCES_LEJOS = new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true });
LUCES_LEJOS.color.setScalar(0.55);

/** enciende o apaga las luces de todos los coches lejanos (noche: 0 día … 1 noche cerrada) */
export function setLucesLejos(noche) {
  LUCES_LEJOS.color.setScalar(0.55 + 2.4 * Math.min(1, noche * 1.2));
}

/** a qué distancia se pasa del coche detallado al ligero: más cerca en el móvil */
export function distanciaLejos() {
  const tactil = typeof document !== 'undefined' && document.body?.classList.contains('touch');
  return tactil ? 20 : 32;
}
