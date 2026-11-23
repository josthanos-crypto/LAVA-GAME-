import { aceras } from '../altavista/kitCalles.js';

/**
 * San Francisco Javier, Carlos V, con las vistas de la calle de Google (solo se miran). Casas terreras blancas y un solar. Casas de a hacia b.
 */

const B = '#f1eee7';

const ACERAS = [
  { a: [-1523.6, -284.9], b: [-1577.1, -275.8], fondo: 9, casas: [[18.1, 4.0, B], [18.1, 4.0, B], [18.1, 0, B]] }, // S11R2
  { a: [-1613.3, -279.9], b: [-1575.8, -286.8], fondo: 9, casas: [[19.1, 4.0, B], [19, 6.6, B]] }, // S11R8
];

export function tuneCalles3(map) {
  aceras(map, ACERAS);
  map.sfjCalles3 = true;
}
