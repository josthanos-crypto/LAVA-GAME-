import * as THREE from 'three';
import { Kit } from './interiorKit.js';
import { terrainY } from './terrain.js';

/**
 * La gasolinera Repsol del arranque del circuito — glorieta de Tenderete (Argana Alta).
 *
 * La del principio del recorrido de José Manuel (los vídeos del 25 y del 26/10/2026
 * arrancan a su lado): la marquesina blanca plana sobre pilares, las isletas con los
 * surtidores y la torre de precios vertical la pone `world.js` con el resto de
 * estaciones (`map.fuel`). Aquí va lo que faltaba del solar: el arranque de palmeras
 * canarias en el parterre de grava con bordillo bajo, el seto bajo y las farolas, en
 * el lado de atrás, el que no da a la calzada.
 *
 * El reparto se hace en dos fases: `world.js` recoloca la estación antes de pintarla
 * (el nodo de OpenStreetMap cae dentro de la nave de al lado), así que la marquesina
 * se busca ya colocada —después del mundo, como los demás barrios— y las piezas se
 * cuelgan de su posición y de su giro de verdad.
 */

const REP = [-1193, -1338.9];

/** palmera canaria: tronco grueso y penacho de frondas */
function palmera(k, x, y, z, h) {
  k.cyl(x, y, z, 0.17, 0.3, h, 0x8a7554, { seg: 9 });
  k.cyl(x, y + h - 0.55, z, 0.44, 0.3, 0.7, 0x6f5d46, { seg: 9 });
  for (let i = 0; i < 16; i++) {
    const ry = (i / 16) * Math.PI * 2 + (i % 2) * 0.19;
    const rx = 0.6 + (i % 4) * 0.12;
    k.cyl(x, y + h, z, 0, 0.1, 2.5 + (i % 3) * 0.35, 0x3f7038, { seg: 3, rx, ry });
  }
  k.block(x, z, 0.7, 0.7);
}

export function buildGasolineraTenderete(scene, colliders, map) {
  const fuel = map.fuel || [];
  let f = null;
  for (const q of fuel) {
    const d = Math.hypot(q.x - REP[0], q.z - REP[1]);
    if (d < 90 && (!f || d < f.d)) f = { ...q, d };
  }
  if (!f || !/repsol/i.test(f.brand || '')) return {};

  /** ocupado: dentro de un edificio (o pegado) o sobre la calzada */
  const ocupado = (x, z) => {
    for (const b of map.buildings || []) {
      if (b.skip) continue;
      const p = b.p || [];
      if (p.length < 3) continue;
      const xs = p.map(q => q[0]), zs = p.map(q => q[1]);
      if (x > Math.min(...xs) - 1.2 && x < Math.max(...xs) + 1.2 &&
          z > Math.min(...zs) - 1.2 && z < Math.max(...zs) + 1.2) return true;
    }
    for (const r of map.roads || []) {
      for (let i = 1; i < r.p.length; i++) {
        const [ax, az] = r.p[i - 1], [bx, bz] = r.p[i];
        const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1;
        const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2));
        if (Math.hypot(x - (ax + dx * t), z - (az + dz * t)) < r.w / 2 + 5.5) return true;
      }
    }
    return false;
  };

  const k = new Kit();
  // la cota del terreno de la estación (terrainY da la altura absoluta: se resta la de aquí)
  const BASE = terrainY(f.x, f.z);
  const alto = (x, z) => Math.max(terrainY(x, z) - BASE + 0.05, 0.05);
  const cos = Math.cos(f.a), sin = Math.sin(f.a);
  /** punto en coordenadas de la estación: lx a lo largo de la marquesina, lz hacia la calzada */
  const L = (lx, lz) => [f.x + lx * cos + lz * sin, f.z - lx * sin + lz * cos];

  const [bx, bz] = L(0, -12);
  if (!ocupado(bx, bz)) {
    // el parterre de grava, con el bordillo bajo
    k.box(bx, alto(bx, bz), bz, 15, 0.08, 3.2, 0x8d8375, { ry: f.a, list: k.shell });
    for (const [lx, lz] of [[-7.5, -10.4], [7.5, -10.4], [-7.5, -13.6], [7.5, -13.6]]) {
      const [x, z] = L(lx, lz);
      k.box(x, alto(x, z), z, 0.24, 0.22, 0.24, 0xc9c6bd, { list: k.solid });
    }
    // el seto bajo, delante del parterre
    for (let lx = -6.9; lx <= 6.9; lx += 1.2) {
      const [x, z] = L(lx, -10.5);
      k.box(x, alto(x, z) + 0.1, z, 1.1, 0.85, 0.8, 0x2f6b3a, { ry: f.a, list: k.solid });
    }
    // el arranque de palmeras
    for (const [lx, h] of [[-4.6, 8.6], [0, 9.4], [4.6, 8.9]]) {
      const [x, z] = L(lx, -12.6);
      if (!ocupado(x, z)) palmera(k, x, alto(x, z), z, h);
    }
    // las dos farolas
    for (const lx of [-7.2, 7.2]) {
      const [x, z] = L(lx, -9.4);
      if (ocupado(x, z)) continue;
      const yy = alto(x, z);
      k.cyl(x, yy, z, 0.1, 0.13, 6.4, 0x9ba0a3, { seg: 10 });
      k.box(x, yy + 6.4, z, 0.9, 0.14, 0.42, 0xb9bebf, { ry: f.a, list: k.solid });
      k.box(x, yy + 6.26, z, 0.7, 0.06, 0.3, 0xfff4e0, { ry: f.a, list: k.glow });
    }
  }

  const { group, segs } = k.build('gasolineraTenderete');
  scene.add(group);
  if (colliders) for (const sg of segs) colliders.addSegment(...sg);

  return { group };
}
