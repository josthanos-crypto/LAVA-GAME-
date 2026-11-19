import * as THREE from 'three';
import { polyTris, paveMesh, plazaSlabs } from './suelos.js';
import { trocear } from './restaurantesCharco.js';

/**
 * El paseo de la Marina Lanzarote: la franja que va de las fachadas de las tiendas (La Vela, La Corona,
 * Springfield, Sunglass Hut...) hasta el borde del agua, unos 400 m de largo y de 4 a 19 m de ancho. En el
 * mapa es tierra, pero el suelo del juego ahí queda por debajo de la lámina del mar y se veía del color
 * del agua (hasta los peatones parecían andar por encima). En las fotos de Google Maps de La Vela y La
 * Corona es un paseo de losas grises claras: se pone el pavimento un poco por encima del agua, con el
 * borde del muelle de piedra y su bordillo claro. Lo de las tiendas no se toca.
 */

// la línea de las fachadas del lado del mar, del extremo norte (edificio de la esquina de la avenida) al sur
const P0 = [1020.26, 102.59], P1 = [1204.69, -262.19];
const LARGO = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]);
const U = [(P1[0] - P0[0]) / LARGO, (P1[1] - P0[1]) / LARGO], N = [U[1], -U[0]];
/** un punto del paseo: t a lo largo de la línea de fachadas, d hacia el mar */
const W = (t, d) => [P0[0] + U[0] * t + N[0] * d, P0[1] + U[1] * t + N[1] * d];

// [t, d] de las fachadas (los huecos entre edificios, a ojo de una a otra) y del borde del agua, sacados del mapa
const FACHADAS = [[0, 0.1], [8, -0.4], [38, -1.65], [70, -3.25], [108, -5.15], [144, -6.9], [176, -7.9], [234, -10.4],
  [244, -10.15], [258, -10.9], [300, -12.9], [308, -13.4], [318, -15.15], [320, -2.9], [336, -3.9], [374, -6.15],
  [382, -4.65], [384, 1.6], [396, 0.85], [408, 0.1]];
const ORILLA = [[0, 8.25], [30, 7], [68, 5.25], [110, 3.25], [144, 1.75], [188, -0.25], [232, -2.25], [264, -3.75],
  [298, -5.25], [304, -5.5], [306, 4.5], [324, 4], [336, 4.5], [364, 5.5], [380, 6], [398, 6.5], [408, 6.75]];

// por encima de la lámina del agua (0,15) y de su espuma (0,17)
const ALTO = 0.2;

/** el borde del muelle a lo largo de la orilla: la cara de piedra que baja al agua y el bordillo de arriba */
function bordeMuelle(group) {
  const piedra = new THREE.MeshStandardMaterial({ color: 0x5c5a56, roughness: 0.95 });
  const bordillo = new THREE.MeshStandardMaterial({ color: 0xd4d0c6, roughness: 0.8 });
  for (let i = 0; i < ORILLA.length - 1; i++) {
    const a = W(...ORILLA[i]), b = W(...ORILLA[i + 1]);
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ry = -Math.atan2(b[1] - a[1], b[0] - a[0]);
    const cara = new THREE.Mesh(new THREE.BoxGeometry(L + 0.3, ALTO + 0.8, 0.3), piedra);
    cara.position.set((a[0] + b[0]) / 2, (ALTO - 0.8) / 2, (a[1] + b[1]) / 2);
    cara.rotation.y = ry;
    const remate = new THREE.Mesh(new THREE.BoxGeometry(L + 0.3, 0.05, 0.4), bordillo);
    remate.position.set((a[0] + b[0]) / 2, ALTO + 0.02, (a[1] + b[1]) / 2);
    remate.rotation.y = ry;
    for (const m of [cara, remate]) { m.receiveShadow = true; group.add(m); }
  }
}

/** el paseo de losas, de las fachadas al borde del agua */
export function buildPaseoMarina(scene) {
  const group = new THREE.Group();
  group.name = 'paseoMarina';
  const contorno = [...FACHADAS.map(([t, d]) => W(t, d)), ...ORILLA.slice().reverse().map(([t, d]) => W(t, d))];
  const suelo = paveMesh(trocear(polyTris(contorno), 2), ALTO, plazaSlabs(), 0xffffff);
  if (suelo) group.add(suelo);
  bordeMuelle(group);
  scene.add(group);
  return { group };
}
