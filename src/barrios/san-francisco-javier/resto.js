import { aceras } from '../altavista/kitCalles.js';

/**
 * San Francisco Javier, el resto de las calles de casas: sin vistas de Google cerca, así que van con el patrón del barrio: casas blancas y crema de una y dos plantas. Quedan fuera el instituto, los edificios grandes y los tramos pegados a un rótulo de negocio. Casas de a hacia b.
 */

const B = '#f1eee7', AM = '#efe3b8', SA = '#e6c9a0';

const ACERAS = [
  { a: [-1463.2, -295.5], b: [-1450.3, -244.1], fondo: 9, casas: [[13.2, 4.0, B], [13.2, 6.6, B], [13.2, 6.6, SA], [13.4, 4.0, SA]] }, // S10R1
  { a: [-1474.8, -89.9], b: [-1481.2, -126.9], fondo: 9, casas: [[12.5, 6.6, AM], [12.5, 6.6, AM], [12.5, 4.0, B]] }, // S17L3
  { a: [-1485.6, -95.5], b: [-1490.5, -114.7], fondo: 9, casas: [[9.9, 6.6, B], [9.9, 6.6, B]] }, // S17R4
  { a: [-1780.6, -164.6], b: [-1781.5, -201], fondo: 9, casas: [[12.1, 6.6, B], [12.1, 6.6, B], [12.2, 4.0, SA]] }, // S32L2
];

export function tuneResto(map) {
  aceras(map, ACERAS);
  map.sfjResto = true;
}
