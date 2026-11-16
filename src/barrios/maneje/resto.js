import { aceras } from '../altavista/kitCalles.js';

/**
 * Maneje, el resto de las calles de casas: sin vistas de Google cerca, así que van con el patrón del barrio: casas terreras blancas y alguna de dos plantas. Quedan fuera las avenidas, León y Castillo, los edificios grandes y los tramos pegados a un rótulo de negocio. Casas de a hacia b.
 */

const B = '#f1eee7', AM = '#efe3b8';

const ACERAS = [
  { a: [-510.2, -1235.4], b: [-524.6, -1255], fondo: 9, casas: [[12.2, 6.6, B], [12.1, 4.0, B]] }, // M2R2
  { a: [-24.5, -1389.6], b: [-54.7, -1395.1], fondo: 9, casas: [[15.3, 4.0, B], [15.4, 6.6, B]] }, // M8L1
  { a: [-24.5, -1389.6], b: [-13.3, -1450.2], fondo: 9, casas: [[12.3, 4.0, AM], [12.3, 6.6, AM], [12.3, 4.0, B], [12.3, 4.0, B], [12.4, 6.6, B]] }, // M12R1
  { a: [51.5, -1288.4], b: [67.3, -1253], fondo: 9, casas: [[12.9, 4.0, B], [12.9, 6.6, B], [13, 4.0, B]] }, // M20L1
  { a: [71.1, -1244.7], b: [79.1, -1226.6], fondo: 9, casas: [[9.9, 4.0, AM], [9.9, 6.6, AM]] }, // M20L2
  { a: [-818.3, -1342.1], b: [-835, -1329.7], fondo: 9, casas: [[10.4, 4.0, AM], [10.4, 4.0, AM]] }, // M32R2
  { a: [-925.4, -1488.7], b: [-942.9, -1475.6], fondo: 9, casas: [[10.9, 6.6, B], [11, 4.0, B]] }, // M35R3
  { a: [-699.6, -1778.7], b: [-699.4, -1754], fondo: 9, casas: [[12.4, 4.0, B], [12.3, 6.6, B]] }, // M40R1
  { a: [-653.1, -1585.9], b: [-657, -1696.1], fondo: 9, casas: [[13.8, 4.0, AM], [13.8, 6.6, AM], [13.8, 4.0, B], [13.8, 4.0, B], [13.8, 6.6, B], [13.8, 4.0, B], [13.8, 4.0, B], [13.7, 6.6, B]] }, // M45R2
  { a: [-642.8, -1476.3], b: [-665.8, -1475.1], fondo: 9, casas: [[11.5, 4.0, B], [11.5, 6.6, B]] }, // M70R1
  { a: [-742.6, -1558.6], b: [-743.4, -1578.7], fondo: 9, casas: [[10.1, 4.0, B], [10, 4.0, B]] }, // M73L2
  { a: [96.2, -1419.5], b: [115.7, -1416], fondo: 9, casas: [[9.9, 4.0, AM], [9.9, 6.6, AM]] }, // M77R1
  { a: [125.3, -1370.1], b: [131.8, -1403.8], fondo: 9, casas: [[11.4, 6.6, B], [11.4, 4.0, B], [11.5, 4.0, B]] }, // M78R1
  { a: [174.6, -1136.2], b: [194.2, -1132.8], fondo: 9, casas: [[9.9, 4.0, AM], [10, 6.6, AM]] }, // M81L1
  { a: [111.1, -1284.3], b: [74.6, -1291.9], fondo: 9, casas: [[12.4, 4.0, B], [12.4, 4.0, B], [12.5, 6.6, B]] }, // M83L1
];

export function tuneResto(map) {
  aceras(map, ACERAS);
  map.manejeResto = true;
}
