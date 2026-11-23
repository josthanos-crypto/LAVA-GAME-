import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { masonryTexture } from './fortBridge.js';

/**
 * Puente del Cabildo (paso bajo hacia San Francisco Javier / Arrecife).
 * Muro de piedra volcánica a ambos lados de la calzada, como el Charco y como
 * el paseo de Av. Fred Olsen (fotos de José Manuel). Se coloca cruzando C. El
 * Fortito junto al ALDI, dirección San Francisco Javier.
 * Coordenadas aproximadas (arte, no topografía real).
 */

const WALL_H = 1.1;
const WALL_T = 0.45;

/** caja horizontal a lo largo de (ux, uz), centrada en (x, y, z) */
function beam(L, h, t, x, y, z, ux, uz) {
  const g = new THREE.BoxGeometry(L, h, t);
  g.rotateY(-Math.atan2(uz, ux));
  g.translate(x, y, z);
  return g;
}

export function buildCabildoBridge(scene, colliders) {
  const group = new THREE.Group();
  group.name = 'cabildoBridge';
  const stone = masonryTexture({ mortar: '#a9a399', stone: [52, 50, 47], spread: 26, seed: 41, rowH: 26 });

  // el puente cruza la calle cerca del ALDI: tramo longitudinal de C. El Fortito
  // punto A (cerca ALDI) -> punto B (hacia San Francisco Javier, sureste)
  const A = [-820, 450];
  const B = [-700, 540];
  const L = Math.hypot(B[0] - A[0], B[1] - A[1]);
  const ux = (B[0] - A[0]) / L, uz = (B[1] - A[1]) / L;
  const nx = -uz, nz = ux;

  const body = [], caps = [];
  for (const side of [1, -1]) {
    const x0 = A[0] + nx * (WALL_T / 2 + 0.1) * side, z0 = A[1] + nz * (WALL_T / 2 + 0.1) * side;
    const x1 = B[0] + nx * (WALL_T / 2 + 0.1) * side, z1 = B[1] + nz * (WALL_T / 2 + 0.1) * side;
    const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
    colliders.addSegment(x0, z0, x1, z1, 'coast');
    body.push(beam(L + 0.4, WALL_H, WALL_T, mx, WALL_H / 2, mz, ux, uz));
    caps.push(beam(L + 0.46, 0.09, WALL_T + 0.14, mx, WALL_H + 0.045, mz, ux, uz));
  }

  // UVs del mundo para que las piedras no se estiren
  for (const g of body) {
    const p = g.getAttribute('position'), n = g.getAttribute('normal'), uv = g.getAttribute('uv');
    for (let i = 0; i < p.count; i++) {
      const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
      const u = ay > ax && ay > az ? p.getX(i) : ax > az ? p.getZ(i) : p.getX(i);
      uv.setXY(i, u / 1.8, (ay > ax && ay > az ? p.getZ(i) : p.getY(i)) / 1.8);
    }
  }

  const m = new THREE.Mesh(mergeGeometries(body, false), new THREE.MeshStandardMaterial({ map: stone, roughness: 0.93, userData: { terrain: 'skirt' } }));
  m.castShadow = true; m.receiveShadow = true;
  group.add(m);
  const cm = new THREE.Mesh(mergeGeometries(caps, false), new THREE.MeshStandardMaterial({ color: 0xc9c4b8, roughness: 0.85 }));
  cm.castShadow = true; cm.receiveShadow = true;
  group.add(cm);

  scene.add(group);
  return { group };
}
