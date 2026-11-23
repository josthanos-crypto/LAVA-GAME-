import * as THREE from 'three';
import { Kit } from './interiorKit.js';
import { Calzada } from './sentidos.js';

/**
 * Las paradas de guagua de toda la ciudad, en el sitio que tienen en OpenStreetMap (highway=bus_stop, descarga del
 * 14-11-2026 en public/map/sentidos.json: nombre, marquesina y banco). Cada una va en la acera del lado de la calle
 * donde está de verdad:
 * - con marquesina (shelter=yes) si la acera tiene sitio (ACERA_MARQUESINA m): techo, cristal al fondo, banco y su poste;
 * - si no, el poste con la placa (y un banco si lo tiene y cabe).
 * La placa lleva el nombre real de la parada. Las guaguas del tráfico paran en las de su lado (traffic.js lee
 * road._paradas). No se repiten las que ya están hechas a mano (las de la Rambla, la estación, el C. C. Arrecife y el
 * IES Blas Cabrera).
 * Todo va en pocas mallas: lo sólido, el cristal y las placas (un atlas con los nombres).
 */

const ACERA_MARQUESINA = 3.3;
const A_MANO = [[873, -388], [522, -641], [504, -611], [-606, -374], [-1041, -184]];
const NOMBRES_A_MANO = /estaci[oó]n|intercambiador|c\.?\s*c\.?\s*arrecife|centro comercial arrecife|blas cabrera/i;
const GRIS = 0x8a8e92, TECHO = 0xdedcd6, BANCO = 0x5a4a3c;
const CW = 160, CH = 80, COLS = 12;

function placa(g, x, y, nombre) {
  // banda azul con la guagua y la palabra PARADA; debajo, el nombre en negro sobre blanco
  g.fillStyle = '#ffffff'; g.fillRect(x, y, CW, CH);
  g.fillStyle = '#1f4f9a'; g.fillRect(x, y, CW, 34);
  g.fillStyle = '#ffffff';
  g.fillRect(x + 10, y + 7, 30, 18); g.fillStyle = '#1f4f9a'; g.fillRect(x + 13, y + 10, 24, 7);
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x + 16, y + 27, 3, 0, Math.PI * 2); g.arc(x + 34, y + 27, 3, 0, Math.PI * 2); g.fill();
  g.font = 'bold 20px Arial, sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'left';
  g.fillText('PARADA', x + 50, y + 18);
  g.fillStyle = '#111111';
  let size = 17;
  g.font = `bold ${size}px Arial, sans-serif`;
  while (g.measureText(nombre).width > CW - 12 && size > 10) { size--; g.font = `bold ${size}px Arial, sans-serif`; }
  g.textAlign = 'center';
  g.fillText(nombre || 'Guaguas', x + CW / 2, y + 57, CW - 10);
  g.strokeStyle = '#1f4f9a'; g.lineWidth = 3; g.strokeRect(x + 1.5, y + 1.5, CW - 3, CH - 3);
}

/** la parada más cercana de cada calle con coches: proyección, lado y distancia desde el principio */
function encajar(roads, x, z) {
  let best = null, bd = 18;
  for (const r of roads) {
    if (r.ped || r.dirt || r.glorieta || r.p.length < 2) continue;
    let acc = 0;
    for (let i = 0; i + 1 < r.p.length; i++) {
      const [ax, az] = r.p[i], [bx, bz] = r.p[i + 1], dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz);
      if (L < 0.5) { acc += L; continue; }
      if (Math.min(ax, bx) - bd > x || Math.max(ax, bx) + bd < x || Math.min(az, bz) - bd > z || Math.max(az, bz) + bd < z) { acc += L; continue; }
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (L * L)));
      const px = ax + dx * t, pz = az + dz * t, d = Math.hypot(px - x, pz - z);
      if (d < bd) {
        bd = d;
        const nx = -dz / L, nz = dx / L;   // el +lado de world.js y la derecha de quien va del principio al final
        best = { r, px, pz, ux: dx / L, uz: dz / L, nx, nz, side: (x - px) * nx + (z - pz) * nz >= 0 ? 1 : -1, d: acc + L * t, L: acc };
      }
      acc += L;
    }
  }
  return best;
}

export function buildParadasGuagua(scene, map, colliders) {
  const lista = map.sentidos?.paradas || [];
  if (!lista.length) return null;
  const calz = new Calzada(map.roads);
  const k = new Kit();
  const placas = [];
  const hechas = [];
  const stats = { total: lista.length, puestas: 0, marquesinas: 0, postes: 0, aMano: 0, sinCalle: 0, sinSitio: 0 };
  for (const [x, z, nombre, techo, banco] of lista) {
    if (A_MANO.some(([ax, az]) => Math.hypot(ax - x, az - z) < 35) || NOMBRES_A_MANO.test(nombre)) { stats.aMano++; continue; }
    const e = encajar(map.roads, x, z);
    if (!e) { stats.sinCalle++; continue; }
    // dos paradas de OpenStreetMap casi en el mismo sitio y lado (andén y poste): una sola
    if (hechas.some(h => h.r === e.r && h.side === e.side && Math.abs(h.d - e.d) < 12)) continue;
    const acera = (e.side > 0 ? e.r.aceraL : e.r.aceraR) || 2.2;
    const N = [-e.nx * e.side, -e.nz * e.side];        // hacia la calle
    const X = [N[1], -N[0]];                            // a lo largo (el eje x local de Kit con ry)
    const ry = Math.atan2(N[0], N[1]);
    const bordillo = e.r.w / 2;
    const W = (s, zz) => [e.px + X[0] * s - N[0] * (bordillo + zz), e.pz + X[1] * s - N[1] * (bordillo + zz)];
    const libre = (s, zz) => { const [qx, qz] = W(s, zz); return !calz.roadAt(qx, qz, 0.2) && !colliders.circleContacts(qx, qz, 0.5).length; };
    const conTecho = techo && acera >= ACERA_MARQUESINA && [-1.8, 0, 1.8].every(s => libre(s, acera - 0.9));
    // el poste, a 45 cm del bordillo (en el sentido de la marcha, al principio de la parada)
    const [px, pz] = W(-2.6, 0.45);
    if (!libre(-2.6, 0.45)) { stats.sinSitio++; continue; }
    k.cyl(px, 0.24, pz, 0.045, 0.045, 2.75, GRIS, { seg: 8 });
    placas.push({ x: px, z: pz, y: 2.6, ux: X[0], uz: X[1], nombre });
    if (conTecho) {
      const c = acera - 0.9;   // el centro de la marquesina, con la espalda hacia la fachada
      const at = (s, zz) => W(s, c + zz);
      for (const s of [-1.9, 1.9]) { const [qx, qz] = at(s, 0.6); k.box(qx, 0.24, qz, 0.08, 2.35, 0.08, GRIS, { ry }); }
      { const [qx, qz] = at(0, -0.05); k.box(qx, 2.59, qz, 4.2, 0.1, 1.55, TECHO, { ry }); }
      { const [qx, qz] = at(0, 0.6); k.box(qx, 0.4, qz, 3.7, 1.9, 0.03, 0xbcd4dc, { ry, list: k.glass }); }
      { const [qx, qz] = at(0, 0.3); k.box(qx, 0.66, qz, 2.6, 0.06, 0.4, BANCO, { ry }); }
      for (const s of [-1.2, 1.2]) { const [qx, qz] = at(s, 0.3); k.box(qx, 0.24, qz, 0.06, 0.42, 0.34, GRIS, { ry }); }
      // la espalda y los laterales no se atraviesan
      const a = at(-1.95, 0.62), b = at(1.95, 0.62), a2 = at(-1.95, -0.6), b2 = at(1.95, -0.6);
      colliders.addSegment(...a, ...b); colliders.addSegment(...a, ...a2); colliders.addSegment(...b, ...b2);
      stats.marquesinas++;
    } else {
      if (banco && acera >= 3 && libre(0, acera - 0.4)) {
        const [qx, qz] = W(0, acera - 0.45);
        k.box(qx, 0.66, qz, 1.8, 0.06, 0.42, BANCO, { ry });
        for (const s of [-0.7, 0.7]) { const [rx, rz] = W(s, acera - 0.45); k.box(rx, 0.24, rz, 0.06, 0.42, 0.36, GRIS, { ry }); }
      }
      stats.postes++;
    }
    hechas.push({ r: e.r, side: e.side, d: e.d });
    (e.r._paradas ||= []).push({ d: e.d, side: e.side, nombre });
    stats.puestas++;
  }
  const { group } = k.build('paradasGuagua');
  // las placas: un atlas con todos los nombres y una placa por cara (se lee desde los dos sentidos de la calle)
  if (placas.length) {
    const rows = Math.ceil(placas.length / COLS);
    const c = document.createElement('canvas');
    c.width = COLS * CW; c.height = rows * CH;
    const g = c.getContext('2d');
    placas.forEach((p, i) => placa(g, (i % COLS) * CW, Math.floor(i / COLS) * CH, p.nombre));
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const pos = [], uv = [], idx = [];
    placas.forEach((p, i) => {
      const u0 = (i % COLS) / COLS, u1 = u0 + 1 / COLS, v1 = 1 - Math.floor(i / COLS) / rows, v0 = v1 - 1 / rows;
      const hw = 0.3, hh = 0.15;
      // normal de la placa: a lo largo de la calle (la ve quien viene); la otra cara, al revés
      for (const f of [1, -1]) {
        // tangente horizontal: la derecha de quien la mira de frente (mira en -n: derecha = (-n) × arriba)
        const nx = p.ux * f, nz = p.uz * f, tx = nz, tz = -nx;
        const ox = p.x + nx * 0.03, oz = p.z + nz * 0.03, v = pos.length / 3;
        pos.push(ox - tx * hw, p.y - hh, oz - tz * hw, ox + tx * hw, p.y - hh, oz + tz * hw, ox + tx * hw, p.y + hh, oz + tz * hw, ox - tx * hw, p.y + hh, oz - tz * hw);
        uv.push(u0, v0, u1, v0, u1, v1, u0, v1);
        idx.push(v, v + 1, v + 2, v, v + 2, v + 3);
      }
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, side: THREE.DoubleSide }));
    m.castShadow = true;
    group.add(m);
  }
  scene.add(group);
  stats.placas = placas.map(p => ({ x: p.x, z: p.z, ux: p.ux, uz: p.uz, nombre: p.nombre }));
  map.paradasGuagua = stats;
  return { group, stats };
}
