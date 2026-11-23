import { aceras } from '../altavista/kitCalles.js';

/**
 * Maneje, tercera tanda (Pamplona, El Rafael, La Joaquina), con las vistas de la calle de Google (solo se miran). Casas blancas y crema; las naves y los muros de al lado se quedan como estaban. Casas de a hacia b.
 */

const B = '#f1eee7', SA = '#e6c9a0', SM = '#d9b08c';

const ACERAS = [
  { a: [-543.2, -1145.8], b: [-526, -1158.4], fondo: 9, casas: [[10.2, 6.6, SM], [11.1, 6.6, SM]] }, // M18L2
  { a: [-484.7, -1141.7], b: [-548.3, -1095.1], fondo: 9, casas: [[13, 4.0, B], [13, 4.0, B], [13, 6.6, B], [13, 6.6, SA], [13, 4.0, B], [13.8, 6.6, B]] }, // M24R1
  { a: [-509, -1135.2], b: [-548.2, -1106.6], fondo: 9, casas: [[15.8, 0, B], [15.8, 4.0, B], [16.9, 4.0, B]] }, // M24L2
  { a: [-461.4, -1110], b: [-444, -1086.2], fondo: 9, casas: [[14.2, 4.0, B], [15.3, 4.0, B]] }, // M85L4
];

export function tuneCalles3(map) {
  aceras(map, ACERAS);
  map.manejeCalles3 = true;
}
