import * as THREE from 'three';
import { roadSigns } from './senales.js';
import { PasoIndex } from './sentidos.js';

/**
 * Pintura de la calzada, al estilo español: pasos de peatones (bandas a lo largo de la marcha), línea de
 * detención en los STOP y semáforos, línea de ceda el paso, flechas de sentido en las calles de sentido
 * único y los tramos de línea continua antes de los cruces. Todo sale de los mismos datos que usan el
 * tráfico y los peatones (sentidos.js, senales.js), así pintura, señales y coches dicen lo mismo.
 */

const SOLID = 12;        // metros de línea continua antes de un cruce
const ARROW_EVERY = 70;  // una flecha cada tantos metros en las calles de sentido único
const TILE = 256;
const LIFT = 0.014;      // por encima del asfalto (la pintura lleva polygonOffset: no parpadea)

const roadY = (r) => 0.14 + (r.major ? 0.02 : 0);
const nodeKey = (p) => Math.round(p[0]) + ',' + Math.round(p[1]);

function lengthOf(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return L;
}

/** punto y rumbo de una línea a d metros de su principio */
function pointAt(pts, d) {
  let acc = 0;
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
    const L = Math.hypot(bx - ax, bz - az);
    if (L < 0.01) continue;
    if (acc + L >= d || i + 2 === pts.length) {
      const t = Math.max(0, Math.min(1, (d - acc) / L));
      return { x: ax + (bx - ax) * t, z: az + (bz - az) * t, ux: (bx - ax) / L, uz: (bz - az) / L };
    }
    acc += L;
  }
  return null;
}

/** el trozo de una línea entre d0 y d1 metros de su principio */
export function cutLine(pts, d0, d1) {
  const out = [];
  let acc = 0;
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
    const L = Math.hypot(bx - ax, bz - az);
    if (L < 0.01) continue;
    const s0 = Math.max(d0, acc), s1 = Math.min(d1, acc + L);
    if (s1 > s0) {
      if (!out.length) out.push([ax + (bx - ax) * (s0 - acc) / L, az + (bz - az) * (s0 - acc) / L]);
      out.push([ax + (bx - ax) * (s1 - acc) / L, az + (bz - az) * (s1 - acc) / L]);
    }
    acc += L;
  }
  return out.length > 1 ? out : [[0, 0], [0, 0]];
}

/** a qué distancia del principio de la calle cae el punto (x, z), que está sobre su eje */
function distAlong(pts, x, z) {
  let acc = 0, best = 0, bd = Infinity;
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
    const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz);
    if (L < 0.01) continue;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (L * L)));
    const d = Math.hypot(ax + dx * t - x, az + dz * t - z);
    if (d < bd) { bd = d; best = acc + L * t; }
    acc += L;
  }
  return best;
}

const BCELL = 32;
const GAP = 3.4;   // metros a cada lado del centro de un paso sin línea del medio (las bandas miden 3 m)

export function roadMarks(roads, pasos, buildings = []) {
  roadSigns(roads);
  const nodes = roads._nodes;
  const idx = new PasoIndex(pasos);
  // edificios por casillas: una banda de paso no puede acabar dentro de una fachada
  const bgrid = new Map();
  for (const b of buildings) {
    if (!b.p || b.p.length < 3) continue;
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (const [x, z] of b.p) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
    for (let cx = Math.floor(x0 / BCELL); cx <= Math.floor(x1 / BCELL); cx++) for (let cz = Math.floor(z0 / BCELL); cz <= Math.floor(z1 / BCELL); cz++) {
      const k = cx * 100003 + cz;
      if (!bgrid.has(k)) bgrid.set(k, []);
      bgrid.get(k).push(b.p);
    }
  }
  const inBuilding = (x, z) => {
    for (const p of bgrid.get(Math.floor(x / BCELL) * 100003 + Math.floor(z / BCELL)) || []) {
      let c = false;
      for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
        const [xi, zi] = p[i], [xj, zj] = p[j];
        if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c;
      }
      if (c) return true;
    }
    return false;
  };
  // dónde cae cada paso a lo largo de su calle (para cortar las líneas del medio)
  const gaps = new Map();
  for (const c of pasos) {
    if (!gaps.has(c.road)) gaps.set(c.road, []);
    gaps.get(c.road).push(distAlong(c.road.p, c.x, c.z));
  }
  // por cuadros de 256 m (world.js los junta en una malla; así cada trozo queda con sus vecinos)
  const tiles = new Map();
  const tri = (a, b, c, y) => {
    const tk = Math.floor(a[0] / TILE) + ',' + Math.floor(a[1] / TILE);
    if (!tiles.has(tk)) tiles.set(tk, { pos: [], ind: [] });
    const { pos, ind } = tiles.get(tk);
    const v = pos.length / 3;
    // siempre mirando hacia arriba, venga como venga el rumbo
    if ((b[1] - a[1]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[1] - a[1]) < 0) [b, c] = [c, b];
    pos.push(a[0], y, a[1], b[0], y, b[1], c[0], y, c[1]);
    ind.push(v, v + 1, v + 2);
  };
  /** rectángulo centrado en (x, z): len metros a lo largo de (ux, uz) y wid a lo ancho */
  const quad = (x, z, ux, uz, len, wid, y) => {
    const hx = ux * len / 2, hz = uz * len / 2, wx = -uz * wid / 2, wz = ux * wid / 2;
    const A = [x - hx - wx, z - hz - wz], B = [x + hx - wx, z + hz - wz], C = [x + hx + wx, z + hz + wz], D = [x - hx + wx, z - hz + wz];
    tri(A, B, C, y); tri(A, C, D, y);
  };

  /** dónde acaba la calzada de las calles que cruzan en un extremo (0 si no es un cruce) */
  const reachAt = (r, end) => {
    const n = nodes.get(nodeKey(end ? r.p[r.p.length - 1] : r.p[0]));
    if (!n || n.deg < 3) return 0;
    return (r._reach?.[end] || 3.5) + 0.3;
  };

  return {
    /** tramos de la línea del medio: continua de a0 a a1 y de b0 a b1, discontinua entre a1 y b0 */
    centre(r) {
      const total = lengthOf(r.p);
      const ra = reachAt(r, 0), rb = reachAt(r, 1);
      let a0 = ra, a1 = ra ? ra + SOLID : 0, b1 = total - rb, b0 = rb ? b1 - SOLID : total;
      if (a1 > b0) { a1 = b0 = (ra && rb) ? total / 2 : ra ? Math.min(a1, total) : Math.max(b0, 0); }
      return { a0, a1, b0, b1, total };
    },

    /** el trozo [s, e] de la línea del medio sin lo que pisa un paso de peatones: lista de [s, e] */
    clip(r, s, e) {
      let out = [[s, e]];
      for (const d of gaps.get(r) || []) {
        const next = [];
        for (const [a, b] of out) {
          if (d + GAP <= a || d - GAP >= b) { next.push([a, b]); continue; }
          if (d - GAP > a) next.push([a, d - GAP]);
          if (d + GAP < b) next.push([d + GAP, b]);
        }
        out = next;
      }
      // y sin lo que pisa el paso de otra calle (la línea de una calle que desemboca cruza las bandas de la otra)
      const total = lengthOf(r.p), free = [];
      for (const [a, b] of out) {
        let from = null;
        for (let d = a; d <= b + 1e-6; d += 0.5) {
          let bad = false;
          if (d < 16 || d > total - 16) {
            const q = pointAt(r.p, d), c = q && idx.on(q.x, q.z, 1.9);
            bad = !!c && c.road !== r;
          }
          if (!bad && from === null) from = d;
          if (bad && from !== null) { free.push([from, d - 0.5]); from = null; }
        }
        if (from !== null) free.push([from, b]);
      }
      return free.filter(([a, b]) => b - a > 1);
    },

    geometries() {
      // pasos de peatones: bandas de 50 cm cada metro, de 3 m de largo, de bordillo a bordillo
      for (const c of pasos) {
        const y = roadY(c.road) + LIFT, w = c.half - 0.35;
        const n = Math.max(2, Math.floor((w * 2) / 1.0));
        for (let i = 0; i < n; i++) {
          const off = -w + 0.25 + i * ((w * 2 - 0.5) / (n - 1));
          const bx = c.x - c.uz * off, bz = c.z + c.ux * off;
          // sin las bandas que acaban dentro de una fachada (calle que roza un edificio)
          if (inBuilding(bx, bz) || inBuilding(bx + c.ux * 1.5, bz + c.uz * 1.5) || inBuilding(bx - c.ux * 1.5, bz - c.uz * 1.5)) continue;
          quad(bx, bz, c.ux, c.uz, 3, 0.5, y);
        }
      }
      for (const r of roads) {
        if (r.ped || r.dirt || r.glorieta || r.p.length < 2) continue;
        const y = roadY(r) + LIFT, total = lengthOf(r.p);
        // línea de detención (STOP y semáforo) o de ceda el paso, en el carril de quien llega
        for (const end of [0, 1]) {
          const sign = r._sign?.[end];
          if (!sign || sign === 'right' || total < 14) continue;
          const reach = reachAt(r, end);
          if (!reach) continue;
          const boca = pasos.find(c => c.road === r && c.end === end);
          const d = boca ? reach + 1.4 + 2.4 : reach + 0.5;
          const q = pointAt(end ? [...r.p].reverse() : r.p, d);
          if (!q) continue;
          // q.u apunta hacia dentro de la calle; quien llega va al revés y su derecha es (uz, −ux)
          const from = r.ow ? -(r.w / 2 - 0.4) : 0.1, to = r.w / 2 - 0.4;
          const rx = q.uz, rz = -q.ux;
          if (sign === 'ceda') {
            for (let o = from + 0.4; o + 0.4 <= to; o += 1.2) quad(q.x + rx * o, q.z + rz * o, q.ux, q.uz, 0.4, 0.8, y);
          } else {
            const mid = (from + to) / 2;
            quad(q.x + rx * mid, q.z + rz * mid, q.ux, q.uz, 0.4, to - from, y);
          }
        }
        // flechas de sentido en las calles de sentido único
        if (!r.ow || total < 26) continue;
        const pts = r.ow > 0 ? r.p : [...r.p].reverse();
        const start = reachAt(r, r.ow > 0 ? 0 : 1) + 9;
        const lanes = r.w >= 9 ? [-r.w / 4, r.w / 4] : [0];
        for (let d = start; d < total - 12; d += ARROW_EVERY) {
          const q = pointAt(pts, d);
          if (!q || idx.at(q.x, q.z, 6)) continue;
          for (const o of lanes) {
            const x = q.x - q.uz * o, z = q.z + q.ux * o;
            // asta de 2,4 m y punta de 1,6 m (flecha de frente del catálogo español, algo simplificada)
            quad(x, z, q.ux, q.uz, 2.4, 0.18, y);
            const bx = x + q.ux * 1.2, bz = z + q.uz * 1.2;
            const L = [bx - q.uz * 0.45, bz + q.ux * 0.45], R = [bx + q.uz * 0.45, bz - q.ux * 0.45], T = [bx + q.ux * 1.6, bz + q.uz * 1.6];
            tri(L, T, R, y);
          }
        }
      }
      const out = [];
      for (const { pos, ind } of tiles.values()) {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        const nrm = new Float32Array(pos.length), uv = new Float32Array(pos.length / 3 * 2);
        for (let i = 0; i < pos.length / 3; i++) {
          nrm[i * 3 + 1] = 1;
          uv[i * 2] = pos[i * 3] * 0.25; uv[i * 2 + 1] = pos[i * 3 + 2] * 0.25;
        }
        g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
        g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
        g.setIndex(ind);
        out.push(g);
      }
      return out;
    },
  };
}
