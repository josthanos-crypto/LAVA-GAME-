/**
 * Desniveles de SAN FRANCISCO JAVIER (x -1799…-1036 · z -582…432).
 *
 * Lo que había: el talud que baja del barrio hacia la avenida (de x -1280 a -1240, todo a lo largo)
 * caía 14 m en 40 m, con los caminos peatonales al 36 % y escalones del 42 %; y cuestas del 30 % en
 * Pizarro, Don Rodrigo y junto al cruce del Cabildo. Se dejan en un 12 % como mucho.
 *
 * Los puentes (Camino de Guime y el del Cabildo) van en trinchera.js: bajan sobre el suelo que haya.
 */
import { suavizarCuestas } from './comun.js';

const CAJA = { x0: -1799, x1: -1036, z0: -582, z1: 432 };

/** se llama desde el prepararMapa del barrio, antes de levantar la ciudad */
export function desnivelesSanFranciscoJavier() {
  // margen de 80 m por el sur: la calle que pasa bajo el puente del Cabildo sigue hasta z 500
  return suavizarCuestas({ caja: { ...CAJA, z1: CAJA.z1 + 80 }, margen: 40, maxPendiente: 0.12 });
}
