import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';

/**
 * CEIP Antonio Zerolo, al oeste de la Calle Guenia (enfrente del final de Tagoror),
 * como en las fotos de Street View de José Manuel:
 * - por Guenia, el muro bajo de bloques encalados en blanco, con pilares cada pocos metros
 *   y la verja verde de barrotes encima; portones verdes de chapa abajo y barrotes arriba;
 * - detrás, los pabellones blancos de una planta junto a la calle y el de dos plantas que da a
 *   Tagoror, con «CEIP ANTONIO ZEROLO» en letras azules;
 * - en la acera, los flamboyanes en flor que dan sombra al muro.
 * Las medidas salen de la foto aérea (PNOA): el recinto va de z ≈ 205 a z ≈ 345.
 */

const WALL = 0xf2f0ea, WALL_CAP = 0xe4e1d8, GREEN = 0x1f7a3e, GREEN_DK = 0x165c2e;
const BLUE = '#1d4fa8';
const Z_FROM = 205, Z_TO = 345;     // el recinto a lo largo de Guenia
const BASE_H = 1.1;                 // muro de bloques
const FENCE_H = 2.2;                // hasta lo alto de la verja
const PILLAR_STEP = 2.6;
const GATES = [0.2, 0.5, 0.8];      // portones, en fracción del muro (de sur a norte)
const GATE_W = 3.4;

/** la Calle Guenia (el tramo largo) recortada al recinto y llevada al borde de la acera oeste */
function wallLine(map) {
  const road = (map.roads || [])
    .filter(r => /Guenia/i.test(r.n || r.name || '') && r.p.some(q => q[1] > Z_FROM && q[1] < Z_TO))
    .sort((a, b) => b.p.length - a.p.length)[0];
  if (!road) return null;
  const off = (road.w || 8) / 2 + 3.0;
  // puntos del eje ordenados de sur a norte (z de mayor a menor)
  const P = road.p.slice().sort((a, b) => b[1] - a[1]);
  const at = (z) => {
    for (let i = 0; i < P.length - 1; i++) {
      const [ax, az] = P[i], [bx, bz] = P[i + 1];
      if (z <= az && z >= bz) { const t = (az - z) / (az - bz || 1); return [ax + (bx - ax) * t, z]; }
    }
    return null;
  };
  const pts = [at(Z_TO), ...P.filter(q => q[1] < Z_TO && q[1] > Z_FROM), at(Z_FROM)].filter(Boolean);
  // se aparta hacia el oeste (el lado del colegio)
  return pts.map((q, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1;
    let nx = dz / L, nz = -dx / L;
    if (nx > 0) { nx = -nx; nz = -nz; }
    return [q[0] + nx * off, q[1] + nz * off];
  });
}

/** punto a la distancia s a lo largo de la línea, con su dirección */
function along(line, s) {
  for (let i = 0; i < line.length - 1; i++) {
    const [ax, az] = line[i], [bx, bz] = line[i + 1];
    const L = Math.hypot(bx - ax, bz - az);
    if (s <= L || i === line.length - 2) {
      const t = Math.min(1, s / (L || 1));
      return { x: ax + (bx - ax) * t, z: az + (bz - az) * t, ux: (bx - ax) / L, uz: (bz - az) / L };
    }
    s -= L;
  }
  return null;
}
const lineLength = (line) => line.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - line[i][0], q[1] - line[i][1]), 0);

/**
 * antes de levantar la ciudad: los pabellones blancos del colegio en el mapa y los bloques
 * del recinto que ya venían, encalados con su teja
 */
export function tuneEscuelaZerolo(map) {
  if (!map.buildings || map.buildings.some(b => b.zerolo)) return;
  const line = wallLine(map);
  if (!line) return;
  // el pabellón de una planta pegado al muro (unos 28 m, a la altura del final de Tagoror)
  const a = along(line, Z_TO - 284), b = along(line, Z_TO - 256);
  const back = (p, d) => [p.x - p.uz * d, p.z + p.ux * d];   // hacia dentro del colegio
  const inward = (p) => {
    // el lado de dentro es el oeste
    const n = [-p.uz, p.ux];
    return n[0] < 0 ? 1 : -1;
  };
  const sgn = inward(a);
  const A0 = back(a, sgn * 1.6), A1 = back(b, sgn * 1.6), A2 = back(b, sgn * 10), A3 = back(a, sgn * 10);
  map.buildings.push({ p: [A0, A1, A2, A3, A0], h: 4.2, k: 'school', f: [246, 245, 240], c: [196, 194, 188], zerolo: 'pabellon' });
  // el de dos plantas que mira a Tagoror
  const x1 = Math.min(A2[0], A3[0]) - 1.5;
  map.buildings.push({ p: [[x1, 249], [x1, 261], [-806, 261], [-806, 249], [x1, 249]], h: 7, k: 'school', f: [246, 245, 240], c: [196, 194, 188], zerolo: 'aulario' });
  // los bloques del recinto que ya venían: blancos, con la teja de la foto aérea
  const inside = (b) => {
    const n = b.p.length - 1, cx = b.p.slice(0, n).reduce((s, q) => s + q[0], 0) / n, cz = b.p.slice(0, n).reduce((s, q) => s + q[1], 0) / n;
    return cx > -840 && cx < -760 && cz > 200 && cz < 345;
  };
  for (const bd of map.buildings) {
    if (bd.zerolo || !inside(bd)) continue;
    bd.f = [244, 242, 236];
    bd.c = [178, 96, 62];
    bd.k = 'school';
  }
}

// ── lienzos ──
const letters = () => canvasTex(1024, 96, (g, W, H) => {
  g.fillStyle = '#f6f5f0';   // el blanco de la fachada
  g.fillRect(0, 0, W, H);
  g.fillStyle = BLUE;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(H * 0.78)}px "Barlow Condensed", Arial, sans-serif`;
  g.fillText('CEIP ANTONIO ZEROLO', W / 2, H * 0.54);
});

/** un flamboyán en flor (el mismo de la plaza de Aniagua) */
function flamboyan(k, x, z, s = 1) {
  k.cyl(x, 0.12, z, 0.26 * s, 0.42 * s, 3.0 * s, 0x6b5445, { seg: 8 });
  for (let i = 0; i < 4; i++) {
    const a = i * 1.9;
    k.cyl(x + Math.cos(a) * 0.5 * s, 2.3 * s, z + Math.sin(a) * 0.5 * s, 0.07, 0.14, 1.7 * s, 0x6b5445, { rx: 0.5, ry: -a, seg: 6 });
    k.ball(x + Math.cos(a) * 1.0 * s, 4.2 * s, z + Math.sin(a) * 1.0 * s, 0.95 * s, 0x3f7a3a, { sy: 0.55, seg: 8 });
  }
  k.ball(x, 4.7 * s, z, 1.55 * s, 0x3f7a3a, { sy: 0.48, seg: 10 });
  for (let i = 0; i < 10; i++) {
    const a = i * 2.3, r = (0.35 + (i % 3) * 0.5) * s;
    k.ball(x + Math.cos(a) * r, (4.85 + (i % 2) * 0.32) * s, z + Math.sin(a) * r, 0.45 * s, 0xc0392b, { sy: 0.7, seg: 8 });
  }
  k.block(x, z, 0.8, 0.8);
}

/** un tramo recto de muro con verja, de la distancia s0 a s1 (en la dirección de p) */
function wallRun(k, p, len) {
  const ry = Math.atan2(-p.uz, p.ux);
  const cx = p.x + p.ux * len / 2, cz = p.z + p.uz * len / 2;
  k.box(cx, 0.24, cz, len, BASE_H - 0.24, 0.26, WALL, { ry });
  k.box(cx, BASE_H, cz, len + 0.04, 0.07, 0.32, WALL_CAP, { ry });
  // verja: barrotes, pasamanos de arriba y travesaño de abajo
  const n = Math.max(1, Math.round(len / 0.14));
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * len;
    k.box(p.x + p.ux * t, BASE_H + 0.07, p.z + p.uz * t, 0.025, FENCE_H - BASE_H - 0.07, 0.025, GREEN, { ry });
  }
  k.box(cx, FENCE_H - 0.05, cz, len, 0.05, 0.05, GREEN_DK, { ry });
  k.box(cx, BASE_H + 0.12, cz, len, 0.04, 0.04, GREEN_DK, { ry });
  k.seg(p.x, p.z, p.x + p.ux * len, p.z + p.uz * len);
}

function pillar(k, x, z, ry) {
  k.box(x, 0.24, z, 0.36, BASE_H + 0.25 - 0.24, 0.36, WALL, { ry });
  k.box(x, BASE_H + 0.25, z, 0.42, 0.06, 0.42, WALL_CAP, { ry });
}

/** portón de dos hojas: chapa verde abajo y barrotes arriba */
function gate(k, p) {
  const ry = Math.atan2(-p.uz, p.ux);
  const cx = p.x + p.ux * GATE_W / 2, cz = p.z + p.uz * GATE_W / 2;
  k.box(cx, 0.24, cz, GATE_W, 1.0, 0.06, GREEN, { ry });
  const n = Math.round(GATE_W / 0.12);
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * GATE_W;
    k.box(p.x + p.ux * t, 1.24, p.z + p.uz * t, 0.025, 0.95, 0.025, GREEN, { ry });
  }
  k.box(cx, 2.15, cz, GATE_W, 0.06, 0.07, GREEN_DK, { ry });
  k.box(cx, 1.22, cz, GATE_W, 0.05, 0.07, GREEN_DK, { ry });
  // la junta de las dos hojas
  k.box(cx, 0.24, cz, 0.05, 1.96, 0.09, GREEN_DK, { ry });
  k.seg(p.x, p.z, p.x + p.ux * GATE_W, p.z + p.uz * GATE_W);
}

/** el muro, los portones, el rótulo y los flamboyanes de la acera */
export function buildEscuelaZerolo(scene, map, colliders) {
  const line = wallLine(map);
  if (!line) return { update() {} };
  const k = new Kit();
  const total = lineLength(line);
  const gates = GATES.map(f => f * total);
  let s = 0;
  while (s < total - 0.05) {
    const p = along(line, s);
    const g = gates.find(gs => s >= gs - 0.01 && s < gs + GATE_W - 0.01);
    if (g !== undefined) {
      gate(k, along(line, g));
      pillar(k, p.x, p.z, Math.atan2(-p.uz, p.ux));
      s = g + GATE_W;
      continue;
    }
    const next = Math.min(total, s + PILLAR_STEP, ...gates.filter(gs => gs > s + 0.01));
    pillar(k, p.x, p.z, Math.atan2(-p.uz, p.ux));
    wallRun(k, p, next - s);
    s = next;
  }
  const end = along(line, total);
  pillar(k, end.x, end.z, Math.atan2(-end.uz, end.ux));

  // flamboyanes en la acera, entre el muro y la calzada (lejos de los portones)
  for (let t = 6; t < total - 4; t += 13) {
    if (gates.some(gs => t > gs - 3 && t < gs + GATE_W + 3)) continue;
    const p = along(line, t);
    // hacia la calle: el lado contrario al colegio
    let nx = p.uz, nz = -p.ux;
    if (nx < 0) { nx = -nx; nz = -nz; }
    flamboyan(k, p.x + nx * 1.7, p.z + nz * 1.7, 0.85 + 0.12 * ((t | 0) % 2));
  }

  // el rótulo azul sobre el pabellón que da a la calle, mirando a Guenia (y a Tagoror)
  const pab = (map.buildings || []).find(b => b.zerolo === 'pabellon');
  if (pab) {
    const [A0, A1] = pab.p;
    const mx = (A0[0] + A1[0]) / 2, mz = (A0[1] + A1[1]) / 2;
    const L = Math.hypot(A1[0] - A0[0], A1[1] - A0[1]);
    let nx = (A1[1] - A0[1]) / L, nz = -(A1[0] - A0[0]) / L;
    if (nx < 0) { nx = -nx; nz = -nz; }
    k.pic(mx + nx * 0.05, 3.55, mz + nz * 0.05, Math.min(L - 2, 17), 1.4, nx, nz, letters());
  }

  const { group, segs } = k.build('ceipAntonioZerolo');
  scene.add(group);
  if (colliders) for (const [ax, az, bx, bz] of segs) colliders.addSegment(ax, az, bx, bz);
  return { group, update() {} };
}
