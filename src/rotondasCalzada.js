import * as THREE from 'three';
import { ROUNDABOUTS, islandR } from './places.js';
import { TRINCHERAS } from './trinchera.js';

/**
 * ¿(x, z) cae donde la circunvalación va hundida (trinchera.js)? Ahí el sombreador baja todo lo que no es del puente:
 * el anillo no se pinta (arriba lo pone el tablero del puente con sus rayas; abajo se verían trozos colgando)
 */
/**
 * (Version 183) ¿(x, z), yendo en la dirección (dx, dz), cruza la zanja de una trinchera? Lo fijo de una calle que cruza
 * (sus aceras y bordillos) caería dentro de la zanja (el sombreador lo baja) como una rampa blanca a rayas a los lados
 * del puente: world.js no lo pone ahí (el puente lleva sus aceras)
 */
export function cruzaZanja(x, z, dx, dz) {
  const L = Math.hypot(dx, dz) || 1;
  for (const t of TRINCHERAS) {
    if (t.tipo !== 'trinchera') continue;
    if (Math.abs((dx * t.u[0] + dz * t.u[1]) / L) > 0.85) continue;
    if (dentroZanja(t, x, z)) return true;
  }
  return false;
}

/** (Version 183) ¿un disco de radio r en (x, z) queda a caballo del borde de una zanja? (medio dentro, medio fuera) */
export function aCaballoZanja(x, z, r) {
  for (const t of TRINCHERAS) {
    if (t.tipo !== 'trinchera') continue;
    let dentro = 0, fuera = 0;
    for (let k = 0; k <= 8; k++) {
      const a = (k / 8) * Math.PI * 2, q = k === 8 ? [x, z] : [x + Math.cos(a) * r, z + Math.sin(a) * r];
      if (dentroZanja(t, q[0], q[1])) dentro++; else fuera++;
    }
    if (dentro && fuera) return true;
  }
  return false;
}

function dentroZanja(t, x, z) {
  const qx = x - t.o[0], qz = z - t.o[1];
  const a = Math.abs(qx * t.u[0] + qz * t.u[1]), l = Math.abs(-qx * t.u[1] + qz * t.u[0]);
  if (a > t.llano + t.rampa || l > t.ancho + t.talud) return false;
  const s = Math.min(1, Math.max(0, (a - t.llano) / t.rampa));
  const f = a <= t.llano ? 1 : 1 - s * s * (3 - 2 * s);
  const g = l <= t.ancho ? 1 : 1 - (l - t.ancho) / t.talud;
  return Math.abs(t.prof * f * g) > 0.05;
}

function enZanja(x, z) {
  for (const t of TRINCHERAS) {
    if (t.tipo !== 'trinchera') continue;
    const qx = x - t.o[0], qz = z - t.o[1];
    const a = Math.abs(qx * t.u[0] + qz * t.u[1]), l = Math.abs(-qx * t.u[1] + qz * t.u[0]);
    if (a > t.llano + t.rampa || l > t.ancho + t.talud) continue;
    const s = Math.min(1, Math.max(0, (a - t.llano) / t.rampa));
    const f = a <= t.llano ? 1 : 1 - s * s * (3 - 2 * s);
    const g = l <= t.ancho ? 1 : 1 - (l - t.ancho) / t.talud;
    if (Math.abs(t.prof * f * g) > 0.05) return true;
  }
  return false;
}

/**
 * (Version 183) La calzada de las rotondas, redonda de verdad. Antes el anillo se pintaba con los trozos rectos del
 * mapa (cada arco de OpenStreetMap son 4 a 10 puntos): salía un polígono, y sus bordes pintados, al cambiar de trozo,
 * se cruzaban; encima llegaban las rayas de las calles que entran, que seguían hasta la isleta.
 *
 * Aquí, para cada rotonda de places.js que tiene sus arcos en el mapa:
 *  - el anillo de asfalto entero, de la isleta (islandR, donde va el bordillo de roundabouts.js) al borde de fuera;
 *  - el borde de dentro pintado (círculo entero), el de fuera cortado en las bocas de las calles que entran y, si la
 *    calzada es ancha (dos carriles), la raya discontinua entre los dos;
 *  - recortar(): quita de las rayas de las calles lo que cae dentro del anillo;
 *  - dentro(): para que las aceras de las calles que llegan no se metan en el anillo.
 * world.js deja de pintar los arcos de esas rotondas (el tráfico sigue usando los del mapa).
 */

const PASO_ARCO = 2;       // largo de cada tramo del círculo (m)
const Y_ASFALTO = 0.18;    // por encima de las calles que entran (0,14 y 0,16): tapa sus puntas
const Y_RAYA = 0.192;
const HW_BORDE = 0.08, HW_RAYA = 0.07, DASH = 3, GAP = 4;

/**
 * las rotondas grandes de los enlaces, que en el mapa no son «glorieta» (son las calles de la carretera, con su tráfico
 * normal): solo se cambia cómo se pintan. [x, z, radio del eje, ancho]. Sin isleta con bordillo: dentro va el campo y,
 * en la de San Bartolomé, la circunvalación pasando por debajo (por eso aquí solo se recorta el anillo, no el centro).
 */
const ANILLOS_ENLACE = [
  // la rotonda de la subida a San Bartolomé (enlace de la LZ-20 con la circunvalación; foto aérea del PNOA)
  [-1235.2, -833.1, 47.3, 11],
];

/** las rotondas con sus arcos en el mapa: { cx, cz, r, w, r0, r1, arcos: Set, soloAnillo } */
export function anillosRotonda(roads) {
  const lista = [
    ...ROUNDABOUTS.map(ra => ({ ra, r0: islandR(ra), soloAnillo: false,
      esArco: (rd) => rd.glorieta && rd.p.every(([x, z]) => Math.hypot(x - ra[0], z - ra[1]) <= ra[2] + 6) })),
    ...ANILLOS_ENLACE.map(ra => ({ ra, r0: ra[2] - ra[3] / 2, soloAnillo: true,
      esArco: (rd) => !rd.ped && !rd.dirt && rd.p.every(([x, z]) => Math.abs(Math.hypot(x - ra[0], z - ra[1]) - ra[2]) < 1.5) })),
  ];
  const out = [];
  for (const { ra, r0, soloAnillo, esArco } of lista) {
    const [cx, cz, r, w] = ra;
    const arcos = new Set();
    for (const rd of roads) if (rd.p.length >= 2 && esArco(rd)) arcos.add(rd);
    if (!arcos.size) continue;
    const r1 = r + w / 2;
    // las calles que entran: sus tramos cerca del anillo (para cortar el borde de fuera en las bocas)
    const bocas = [];
    for (const rd of roads) {
      if (arcos.has(rd) || rd.glorieta || rd.ped || rd.dirt || rd.p.length < 2) continue;
      for (let i = 0; i < rd.p.length - 1; i++) {
        const [ax, az] = rd.p[i], [bx, bz] = rd.p[i + 1];
        if (distSeg(cx, cz, ax, az, bx, bz) < r1 + rd.w) bocas.push([ax, az, bx, bz, rd.w / 2 + 0.4]);
      }
    }
    out.push({ cx, cz, r, w, r0, r1, arcos, bocas, soloAnillo });
  }
  return out;
}

function distSeg(x, z, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2));
  return Math.hypot(ax + dx * t - x, az + dz * t - z);
}

/** el anillo de asfalto, con uvs como roadGeometry de world.js (a lo ancho 0..1, a lo largo metros / 8) */
export function anilloGeometry(a) {
  const N = Math.max(48, Math.ceil((2 * Math.PI * a.r1) / PASO_ARCO));
  const filas = Math.max(2, Math.ceil((a.r1 - a.r0) / 3));
  const pos = [], uv = [], idx = [];
  const rm = (a.r0 + a.r1) / 2;
  for (let i = 0; i <= N; i++) {
    const ang = (i / N) * Math.PI * 2, c = Math.cos(ang), s = Math.sin(ang);
    for (let j = 0; j <= filas; j++) {
      const rr = a.r0 + (a.r1 - a.r0) * (j / filas);
      pos.push(a.cx + c * rr, Y_ASFALTO, a.cz + s * rr);
      uv.push(j / filas, (ang * rm) / 8);
    }
  }
  const F = filas + 1;
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < filas; j++) {
      const p = i * F + j, q = (i + 1) * F + j;
      const am = ((i + 0.5) / N) * Math.PI * 2, rr = a.r0 + (a.r1 - a.r0) * ((j + 0.5) / filas);
      if (enZanja(a.cx + Math.cos(am) * rr, a.cz + Math.sin(am) * rr)) continue;
      // con el ángulo creciendo (de x hacia z) la cara mira hacia arriba con este orden
      idx.push(p, q, p + 1, p + 1, q, q + 1);
    }
  }
  return geo(pos, idx, uv);
}

function geo(pos, idx, uv = null) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  if (uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** una cinta pintada sobre el círculo de radio rr, del ángulo a0 al a1 */
function arco(pos, idx, a, rr, a0, a1, hw) {
  const n = Math.max(1, Math.ceil(((a1 - a0) * rr) / 1));
  const v0 = pos.length / 3;
  for (let k = 0; k <= n; k++) {
    const ang = a0 + (a1 - a0) * (k / n), c = Math.cos(ang), s = Math.sin(ang);
    pos.push(a.cx + c * (rr - hw), Y_RAYA, a.cz + s * (rr - hw), a.cx + c * (rr + hw), Y_RAYA, a.cz + s * (rr + hw));
    if (k) {
      const p = v0 + (k - 1) * 2, q = p + 2;
      const am = a0 + (a1 - a0) * ((k - 0.5) / n);
      if (!enZanja(a.cx + Math.cos(am) * rr, a.cz + Math.sin(am) * rr)) idx.push(p, q, p + 1, p + 1, q, q + 1);
    }
  }
}

/** las rayas del anillo: { bordes, discontinua } (geometrías para las mallas de pintura de world.js) */
export function anilloRayas(a) {
  const bp = [], bi = [], dp = [], di = [];
  // dentro: el círculo entero, pegado al bordillo de la isleta
  arco(bp, bi, a, a.r0 + 0.35, 0, Math.PI * 2, HW_BORDE);
  // fuera: cortado donde entra una calle
  const ro = a.r1 - 0.35, N = Math.ceil((2 * Math.PI * ro) / 0.5);
  const libre = (ang) => {
    const x = a.cx + Math.cos(ang) * ro, z = a.cz + Math.sin(ang) * ro;
    return !a.bocas.some(([ax, az, bx, bz, h]) => distSeg(x, z, ax, az, bx, bz) < h);
  };
  let desde = null;
  // se empieza en un punto cortado si lo hay (así el tramo que pasa por el ángulo 0 no se parte en dos)
  let k0 = 0;
  for (let k = 0; k < N; k++) if (!libre((k / N) * Math.PI * 2)) { k0 = k; break; }
  for (let k = 0; k <= N; k++) {
    const ang = ((k0 + k) / N) * Math.PI * 2;
    const ok = k < N && libre(ang);
    if (ok && desde === null) desde = ang;
    if (!ok && desde !== null) {
      if ((ang - desde) * ro > 1.5) arco(bp, bi, a, ro, desde, ang - 0.5 / ro, HW_BORDE);
      desde = null;
    }
  }
  // dos carriles: discontinua en medio
  if (a.w >= 9.5) {
    const rm = (a.r0 + a.r1) / 2, per = 2 * Math.PI * rm, n = Math.max(3, Math.round(per / (DASH + GAP)));
    const paso = (Math.PI * 2) / n, dA = (DASH / per) * Math.PI * 2;
    for (let k = 0; k < n; k++) arco(dp, di, a, rm, k * paso, k * paso + dA, HW_RAYA);
  }
  return { bordes: geo(bp, bi), discontinua: dp.length ? geo(dp, di) : null };
}

/** ¿(x, z) cae en el anillo o en la isleta de alguna rotonda (con margen m hacia dentro)? */
export function dentroDeAnillos(anillos) {
  return (x, z, m = 0.3) => anillos.some(a => {
    if (Math.abs(x - a.cx) >= a.r1 || Math.abs(z - a.cz) >= a.r1) return false;
    const d = Math.hypot(x - a.cx, z - a.cz);
    return d < a.r1 - m && (!a.soloAnillo || d > a.r0 + m);
  });
}

/** una raya de una calle sin lo que cae dentro de las rotondas: lista de polilíneas */
export function recortar(pts, anillos) {
  if (!anillos.length || pts.length < 2) return [pts];
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (const [x, z] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
  const cerca = anillos.filter(a => a.cx + a.r1 > x0 && a.cx - a.r1 < x1 && a.cz + a.r1 > z0 && a.cz - a.r1 < z1);
  if (!cerca.length) return [pts];
  const fuera = ([x, z]) => cerca.every(a => {
    const d = Math.hypot(x - a.cx, z - a.cz);
    return d > a.r1 + 0.2 || (a.soloAnillo && d < a.r0 - 0.2);
  });
  // se guardan los puntos de la raya y solo se añaden los de entrada y salida del anillo (las discontinuas de
  // world.js necesitan tramos largos: no se puede trocear la raya en pasitos)
  const out = [];
  let run = fuera(pts[0]) ? [pts[0]] : [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 0.5));
    let prev = fuera(pts[i]), prevQ = pts[i];
    for (let k = 1; k <= n; k++) {
      const q = [ax + (bx - ax) * (k / n), az + (bz - az) * (k / n)];
      const f = fuera(q);
      if (f && !prev) run = [q];
      else if (!f && prev) { if (k > 1) run.push(prevQ); if (run.length > 1) out.push(run); run = []; }
      else if (f && k === n) run.push(q);
      prev = f;
      prevQ = q;
    }
  }
  if (run.length > 1) out.push(run);
  return out;
}
