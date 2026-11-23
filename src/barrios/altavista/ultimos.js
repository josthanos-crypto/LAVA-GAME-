import { aceras } from './kitCalles.js';

/**
 * Altavista, los últimos tramos con vistas de la calle de Google (solo se miran): Juan Sebastián Elcano, Huelva y Ronda. Casas terreras de frente de azulejo o ladrillo. Casas de a hacia b.
 */

const B = '#f1eee7', OC = '#d9b98a', SA = '#e6c9a0', SM = '#d9b08c';

const ACERAS = [
  { a: [3.2, -942.5], b: [138.6, -1012.4], fondo: 9, casas: [[12.9, 4.0, OC], [12.9, 4.0, B], [12, 4.0, SM], [12.9, 4.0, B], [12, 4.0, SA], [12.9, 4.0, B], [12.9, 4.0, OC], [12, 4.0, B], [12.9, 4.0, SA], [12.9, 4.0, B], [12.9, 4.0, SM], [13.2, 4.0, B]] }, // L43R2
  { a: [98.5, -739.7], b: [139.3, -758], fondo: 9, casas: [[11.9, 4.0, SA], [10.9, 4.0, OC], [10.9, 6.6, SA], [11, 4.0, B]] }, // L52R2
  { a: [12.4, -555.2], b: [18.1, -537.3], fondo: 9, casas: [[9.9, 6.6, SA], [8.9, 4.0, B]] }, // L53L1
];

export function tuneUltimos(map) {
  aceras(map, ACERAS);
  map.altavistaUltimos = true;
}
