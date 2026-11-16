import { aceras } from '../altavista/kitCalles.js';

/**
 * Argana Alta, cuarta tanda (Salazones, Don Manuel Cáceres), con las vistas de la calle de Google (solo se miran). Casas blancas de una y dos plantas. Casas de a hacia b.
 */

const B = '#f1eee7';

const ACERAS = [
  { a: [-1948.5, -1083.2], b: [-1842.2, -1078], fondo: 9, casas: [[13.3, 4.0, B], [13.3, 4.0, B], [13.3, 4.0, B], [13.3, 6.6, B], [13.3, 4.0, B], [13.3, 4.0, B], [13.3, 6.6, B], [13.3, 4.0, B]] }, // A57R1
  { a: [-1845.1, -1138.8], b: [-1843.1, -1116.9], fondo: 9, casas: [[11, 6.6, B], [11, 6.6, B]] }, // A63L1
  { a: [-1841.3, -1066.7], b: [-1839.9, -1021.1], fondo: 9, casas: [[10.9, 4.0, B], [11.9, 6.6, B], [10.9, 4.0, B], [11.9, 4.0, B]] }, // A63L3
];

export function tuneAbajo3(map) {
  aceras(map, ACERAS);
  map.arganaAbajo3 = true;
}
