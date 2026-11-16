import * as THREE from 'three';
import { Calzada } from './sentidos.js';
import { paveMaterial, asfalto } from './suelos.js';
import { cinta, malla } from './puenteRayas.js';

/**
 * Los aparcamientos de la zona comercial de Tenderete (Version 135, pedido por José Manuel: «haz los parking de las
 * hamburgueseras, la carretera de autoservicio, las rayas de los parking; Decathlon también tiene parking, y el
 * Mercadona de abajo»).
 *
 * Hasta ahora el suelo de esos solares era solo la foto aérea, borrosa. Aquí se pone, donde la foto aérea (PNOA)
 * enseña cada aparcamiento:
 *  - el firme de asfalto, que sigue el terreno y no se pinta donde hay calle, acera o edificio;
 *  - las plazas en batería, en filas con su calle de paso en medio (5 m de plaza, 6 m de calle, 2,5 m de ancho);
 *  - el carril del autoservicio del McDonald's y del Burger King: una vuelta al edificio con sus bordes pintados y
 *    flechas, cortada donde cruza una calle.
 * El sitio y el giro de cada solar están medidos sobre la foto aérea; el número de plazas es el que cabe, no el real.
 *
 * Coordenadas del juego: x = (lon + 13,55) · 97398, z = (28,9625 − lat) · 111320.
 */

const Y = 0.12;            // entre el suelo de la foto (0,10) y las calzadas (0,14)
const PLAZA = 2.5, FONDO = 5, PASO = 6;
const BLANCO = 0xeceae2;

/**
 * Los solares: centro, eje (a lo largo de las filas de plazas), medio largo y medio ancho (m).
 * Medidos sobre la foto aérea; lo que caiga en calle, acera o edificio no se pinta.
 */
const SOLARES = [
  // entre el McDonald's y el Mercadona
  { nombre: 'aparcamientoMcDonaldsMercadona', centro: [-1167, -1118], eje: [0.889, -0.458], largo: 24, ancho: 17 },
  // el del Mercadona de abajo, entre la calle y las naves largas
  { nombre: 'aparcamientoMercadona', centro: [-1141, -1076], eje: [0.874, -0.486], largo: 14, ancho: 31 },
  // el del Burger King, al nordeste del local
  { nombre: 'aparcamientoBurgerKing', centro: [-1233, -1111], eje: [0.824, 0.567], largo: 15, ancho: 9 },
  // el del Decathlon, a lo largo de su pared larga y hasta la calle
  { nombre: 'aparcamientoDecathlon', centro: [-1178, -1059], eje: [0.763, 0.646], largo: 50, ancho: 17 },
];

/** los locales con autoservicio: un punto de dentro del edificio */
const AUTOSERVICIOS = [
  { nombre: 'autoservicioMcDonalds', en: [-1194.5, -1144.75] },
  { nombre: 'autoservicioBurgerKing', en: [-1244.5, -1094] },
];

function dentroDe(poly, x, z) {
  let dentro = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) dentro = !dentro;
  }
  return dentro;
}

/** distancia de un punto al borde de un polígono */
function alBorde(poly, x, z) {
  let d = Infinity;
  for (let i = 0; i < poly.length - 1; i++) {
    const [ax, az] = poly[i], [bx, bz] = poly[i + 1];
    const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
    d = Math.min(d, Math.hypot(ax + dx * t - x, az + dz * t - z));
  }
  return d;
}

/** el rectángulo más ajustado a una planta: centro, eje largo y sus dos medias medidas */
function rectDe(poly) {
  const p = poly.slice(0, -1);
  let mejor = null;
  for (let i = 0; i < p.length; i++) {
    const [ax, az] = p[i], [bx, bz] = p[(i + 1) % p.length], l = Math.hypot(bx - ax, bz - az);
    if (l < 0.5) continue;
    const u = [(bx - ax) / l, (bz - az) / l];
    let u0 = 1e9, u1 = -1e9, n0 = 1e9, n1 = -1e9;
    for (const [x, z] of p) { const a = x * u[0] + z * u[1], b = -x * u[1] + z * u[0]; u0 = Math.min(u0, a); u1 = Math.max(u1, a); n0 = Math.min(n0, b); n1 = Math.max(n1, b); }
    const area = (u1 - u0) * (n1 - n0);
    if (!mejor || area < mejor.area) {
      const um = (u0 + u1) / 2, nm = (n0 + n1) / 2;
      mejor = { area, u, c: [um * u[0] - nm * u[1], um * u[1] + nm * u[0]], a: (u1 - u0) / 2, b: (n1 - n0) / 2 };
    }
  }
  return mejor;
}

/** los de la zona comercial de Tenderete */
export function buildAparcamientosTenderete(scene, map) {
  return buildAparcamientos(scene, map, { nombre: 'aparcamientosTenderete', solares: SOLARES, autoservicios: AUTOSERVICIOS, zona: [-1320, -1060, -1230, -980] });
}

/**
 * (Version 140) Lo mismo para cualquier otro sitio: `solares` y `autoservicios` como los de arriba y `zona` =
 * [x0, x1, z0, z1], el rectángulo donde se miran los edificios que no hay que pisar. Lo usa hospitalAparcamiento.js.
 */
export function buildAparcamientos(scene, map, { nombre, solares, autoservicios = [], zona }) {
  const grupo = new THREE.Group();
  grupo.name = nombre;
  const calz = new Calzada(map.roads);
  // los edificios de la zona (también los que rehace otra pieza: su planta sigue ocupando el sitio)
  const cerca = (map.buildings || []).filter(b => b.p?.length > 3 && b.p.some(([x, z]) => x > zona[0] && x < zona[1] && z > zona[2] && z < zona[3]));
  const enEdificio = (x, z, margen = 1.2) => cerca.some(b => dentroDe(b.p, x, z) || alBorde(b.p, x, z) < margen);
  const libre = (x, z) => !calz.roadAt(x, z, 2.8) && !enEdificio(x, z);
  const tex = asfalto();
  const pintura = new THREE.MeshStandardMaterial({ color: BLANCO, roughness: 0.85, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  let plazas = 0;

  // ───────────── los solares: firme y plazas ─────────────
  for (const s of solares) {
    const A = s.eje, B = [-A[1], A[0]];
    const P = (a, b) => [s.centro[0] + A[0] * a + B[0] * b, s.centro[1] + A[1] * a + B[1] * b];
    // el firme, en celdas de 1,25 m (así el borde junto a las calles no sale a escalones grandes); solo las que caen
    // enteras en sitio libre
    const na = Math.ceil(2 * s.largo / 1.25), nb = Math.ceil(2 * s.ancho / 1.25), pos = [], uv = [];
    const ok = [];
    for (let i = 0; i <= na; i++) { ok.push([]); for (let j = 0; j <= nb; j++) ok[i].push(libre(...P(-s.largo + 2 * s.largo * i / na, -s.ancho + 2 * s.ancho * j / nb))); }
    const pt = (i, j) => P(-s.largo + 2 * s.largo * i / na, -s.ancho + 2 * s.ancho * j / nb);
    for (let i = 0; i < na; i++) for (let j = 0; j < nb; j++) {
      if (!(ok[i][j] && ok[i + 1][j] && ok[i][j + 1] && ok[i + 1][j + 1])) continue;
      for (const [x, z] of [pt(i, j), pt(i, j + 1), pt(i + 1, j), pt(i + 1, j), pt(i, j + 1), pt(i + 1, j + 1)]) { pos.push(x, Y, z); uv.push(x / 4, -z / 4); }
    }
    if (pos.length) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      g.computeVertexNormals();
      const mat = paveMaterial(tex, 0xd8d8d8);
      mat.side = THREE.DoubleSide;
      const m = new THREE.Mesh(g, mat);
      m.name = s.nombre; m.receiveShadow = true;
      grupo.add(m);
    }
    // el firme de un punto: ¿hay asfalto de este solar debajo?
    const enFirme = (a, b) => {
      const i = Math.floor((a + s.largo) / (2 * s.largo) * na), j = Math.floor((b + s.ancho) / (2 * s.ancho) * nb);
      return i >= 0 && j >= 0 && i < na && j < nb && ok[i][j] && ok[i + 1][j] && ok[i][j + 1] && ok[i + 1][j + 1];
    };
    // las plazas: módulos de fila + calle de paso + fila, a lo ancho del solar
    const MOD = 2 * FONDO + PASO, n = Math.max(1, Math.floor((2 * s.ancho + 0.01) / MOD)), b0 = -n * MOD / 2;
    const rayas = [];
    const raya = (a0, b0r, a1, b1r) => {
      const pts = [0, 1, 2, 3].map(k => [a0 + (a1 - a0) * k / 3, b0r + (b1r - b0r) * k / 3]);
      if (!pts.every(([a, b]) => enFirme(a, b))) return false;
      cinta(rayas, pts.map(([a, b]) => P(a, b)), () => Y + 0.012, 0.05, false);
      return true;
    };
    for (let k = 0; k < n; k++) {
      for (const [bi, bf] of [[b0 + k * MOD, b0 + k * MOD + FONDO], [b0 + k * MOD + FONDO + PASO, b0 + (k + 1) * MOD]]) {
        let antes = false;
        for (let a = -s.largo + 0.6; a <= s.largo - 0.6; a += PLAZA) {
          const ahora = raya(a, bi + 0.15, a, bf - 0.15);
          if (ahora && antes) plazas++;
          antes = ahora;
        }
      }
    }
    const m = malla(rayas, pintura);
    if (m) { m.name = s.nombre + 'Rayas'; grupo.add(m); }
  }

  // ───────────── el carril del autoservicio: una vuelta al local ─────────────
  const carril = new THREE.MeshStandardMaterial({ color: 0x3b3d40, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
  const amarillo = new THREE.MeshStandardMaterial({ color: 0xf2c200, roughness: 0.8, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
  for (const au of autoservicios) {
    const ed = cerca.find(b => dentroDe(b.p, au.en[0], au.en[1])) || cerca.slice().sort((p, q) => alBorde(p.p, ...au.en) - alBorde(q.p, ...au.en))[0];
    if (!ed) continue;
    const r = rectDe(ed.p);
    if (!r) continue;
    const u = r.u, v = [-u[1], u[0]], SEP = 3.6, R = 3, ha = r.a + SEP, hb = r.b + SEP;
    const P = (a, b) => [r.c[0] + u[0] * a + v[0] * b, r.c[1] + u[1] * a + v[1] * b];
    // el rectángulo redondeado, con un punto cada metro
    const vuelta = [];
    const recta = (a0, b0, a1, b1) => { const l = Math.hypot(a1 - a0, b1 - b0), k = Math.ceil(l); for (let i = 0; i < k; i++) vuelta.push([a0 + (a1 - a0) * i / k, b0 + (b1 - b0) * i / k]); };
    const curva = (ca, cb, t0) => { for (let i = 0; i < 6; i++) { const t = t0 + (Math.PI / 2) * i / 6; vuelta.push([ca + Math.cos(t) * R, cb + Math.sin(t) * R]); } };
    recta(-ha + R, -hb, ha - R, -hb); curva(ha - R, -hb + R, -Math.PI / 2);
    recta(ha, -hb + R, ha, hb - R); curva(ha - R, hb - R, 0);
    recta(ha - R, hb, -ha + R, hb); curva(-ha + R, hb - R, Math.PI / 2);
    recta(-ha, hb - R, -ha, -hb + R); curva(-ha + R, -hb + R, Math.PI);
    vuelta.push(vuelta[0]);
    // se corta donde pisa una calle (por ahí se entra y se sale) o el edificio de al lado
    const otros = cerca.filter(b => b !== ed);
    const vale = ([a, b]) => { const [x, z] = P(a, b); return !calz.roadAt(x, z, 2.4) && !otros.some(o => dentroDe(o.p, x, z) || alBorde(o.p, x, z) < 2); };
    const tramos = [];
    let tramo = null;
    for (const q of vuelta) { if (vale(q)) { if (!tramo) { tramo = []; tramos.push(tramo); } tramo.push(q); } else tramo = null; }
    const firme = [], bordes = [], flechas = [];
    for (const t of tramos) {
      if (t.length < 4) continue;
      const mundo = t.map(([a, b]) => P(a, b));
      cinta(firme, mundo, () => Y + 0.004, 1.7, false);
      for (const lado of [1.55, -1.55]) {
        const des = mundo.map((p, i) => { const a = mundo[Math.max(0, i - 1)], b = mundo[Math.min(mundo.length - 1, i + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [p[0] - (b[1] - a[1]) / l * lado, p[1] + (b[0] - a[0]) / l * lado]; });
        cinta(bordes, des, () => Y + 0.014, 0.05, false);
      }
      // una flecha cada 9 m, en el sentido de la vuelta
      for (let i = 4; i < mundo.length - 3; i += 9) {
        const [x, z] = mundo[i], [nx, nz] = mundo[i + 1], l = Math.hypot(nx - x, nz - z) || 1, dx = (nx - x) / l, dz = (nz - z) / l;
        const at = (f, s) => [x + dx * f - dz * s, Y + 0.016, z + dz * f + dx * s];
        flechas.push(...at(1.1, 0), ...at(0.2, 0.55), ...at(0.2, -0.55));
        flechas.push(...at(0.2, 0.16), ...at(-1.0, 0.16), ...at(-1.0, -0.16), ...at(0.2, 0.16), ...at(-1.0, -0.16), ...at(0.2, -0.16));
      }
    }
    const mf = malla(firme, carril), mb = malla(bordes, amarillo), ma = malla(flechas, pintura);
    if (mf) { mf.name = au.nombre; mf.material.side = THREE.DoubleSide; grupo.add(mf); }
    if (mb) { mb.name = au.nombre + 'Bordes'; mb.material.side = THREE.DoubleSide; grupo.add(mb); }
    if (ma) { ma.name = au.nombre + 'Flechas'; ma.material.side = THREE.DoubleSide; grupo.add(ma); }
  }

  grupo.userData.plazas = plazas;
  scene.add(grupo);
  return grupo;
}
