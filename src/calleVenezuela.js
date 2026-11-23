import { Kit } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alzarEdificio, medianera } from './edificioReal.js';
import { casa } from './casasTampico.js';

/**
 * La cara de la calle Venezuela de la manzana de Aragón y Santa Teresa de Jesús (la que mira a Quirón Prevención),
 * con las vistas de la calle de Google de julio de 2025 (solo se miran, no van dentro del juego; la gente no se pone).
 * De la esquina de Aragón hacia el sur: la casa blanca de tres plantas de la esquina con el zócalo de azulejo verde
 * oscuro, el portón de madera roja de cuarterones y las ventanas de madera arriba; la casa vieja de una planta con su
 * cuarto encima, la puerta y la ventana verdes y el zócalo desconchado; la casa del 7 con la puerta de madera oscura;
 * y la casa blanca de cuatro plantas de la esquina de Santa Teresa con los balcones de cristal.
 */

// la cara de Venezuela, de la esquina de Aragón (s 0) a la de Santa Teresa, N hacia la calle (al este)
const VZ = marco([-825.35, -219.05], [-822.05, -249.79]);
const Z = 0.12, FONDO = 10, BASE = 7.0, BLANCO = 0xf2f2ee;
const CASAS = [
  [0, 9, 10.4, 3, BLANCO, 'ninguna', 'garaje-madera'], [9, 15, 7.0, 2, 0xeeeae2, 'ninguna', 'puerta'],
  [15, 23, 9.6, 3, BLANCO, 'blanca', 'puerta'], [23, VZ.len, 12.6, 4, BLANCO, 'cristal', 'garaje-blanco'],
];

/** antes de levantar la ciudad: las casas altas a su altura encima del bloque */
export function tuneCalleVenezuela(map) {
  if (!map?.santaTeresaNorte) return;
  map.calleVenezuela = true;
  for (const [s0, s1, h] of CASAS) if (h > BASE) alzarEdificio(map, VZ, s0, s1, FONDO, h, [242, 242, 238]);
}

/** se monta con lo demás de Arrecife Centro */
export function buildCalleVenezuela(scene, colliders, map) {
  if (!map?.calleVenezuela) return null;
  const k = new Kit();
  CASAS.forEach(([s0, s1, h, plantas, color, baranda, bajo], j) => {
    casa(k, s0, s1, h, plantas, color, baranda, bajo, j * 3 + 1);
    const prev = CASAS[j - 1], next = CASAS[j + 1];
    if (prev && prev[2] < h) medianera(k, s0 - 0.07, Math.max(prev[2], BASE), h, FONDO, Z, 0xe8e6e0);
    if (next && next[2] < h) medianera(k, s1 + 0.07, Math.max(next[2], BASE), h, FONDO, Z, 0xe8e6e0);
    if (h > BASE) k.box((s0 + s1) / 2, BASE, -FONDO - 0.07, s1 - s0, h - BASE, 0.12, 0xe8e6e0);
  });
  // la puerta y la ventana verdes de la casa vieja
  k.box(11.0, 0, Z + 0.32, 1.9, 2.2, 0.03, 0x2a7a4a);
  k.box(13.4, 0.9, Z + 0.32, 1.1, 1.1, 0.03, 0x2a7a4a);
  const group = enMarco(k, VZ, 'calleVenezuela', colliders);
  scene.add(group);
  return { group };
}
