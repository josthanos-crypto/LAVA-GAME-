import { aceras } from '../altavista/kitCalles.js';

/**
 * Argana Alta calle a calle, tercera tanda (Tomás Morales, Jesús Soto Morales, Tenderete, Malagueña, Francisca Cabrera Sastre, Vía del Rancho de Pascua), con las vistas de la calle de Google (solo se miran). Casas terreras blancas, bloques de dos plantas ocre y crema y alguna nave. Casas de a hacia b.
 */

const B = '#f1eee7', AM = '#efe3b8', SA = '#e6c9a0', OC = '#d9b98a';

const ACERAS = [
  { a: [-1441, -1913.4], b: [-1456.3, -1944.8], fondo: 9, casas: [[18, 6.6, AM], [16.9, 6.6, SA]] }, // A16R3
  { a: [-1554.6, -992.3], b: [-1578.6, -951.5], fondo: 9, casas: [[12.1, 6.6, B], [12.1, 6.6, B], [12.1, 6.6, B], [11, 6.6, B]] }, // A28L1
  { a: [-1588.2, -936.3], b: [-1605.1, -912.3], fondo: 9, casas: [[10.1, 4.0, B], [10.1, 4.0, SA], [9.2, 6.6, SA]] }, // A28L2
  { a: [-1607.6, -902], b: [-1620.4, -880.2], fondo: 9, casas: [[13.1, 4.0, B], [12.2, 4.0, B]] }, // A28L3
  { a: [-1523.2, -1000.6], b: [-1570.5, -946.9], fondo: 9, casas: [[13.9, 4.0, B], [13.9, 4.0, B], [13.9, 6.6, SA], [13.9, 4.0, B], [16, 5.5, B]] }, // A28R1
  { a: [-1580.2, -931.4], b: [-1596.1, -904.8], fondo: 9, casas: [[10, 4.0, B], [10, 4.0, B], [11, 4.0, SA]] }, // A28R2
  { a: [-1600.9, -896.1], b: [-1613.1, -876.3], fondo: 9, casas: [[12.1, 4.0, B], [11.2, 4.0, B]] }, // A28R3
  { a: [-1600.9, -896.1], b: [-1571.5, -876.1], fondo: 9, casas: [[11.9, 4.0, B], [11.9, 4.0, B], [11.8, 4.0, B]] }, // A35L3
  { a: [-1596.1, -904.8], b: [-1565, -882.5], fondo: 9, casas: [[12.1, 6.6, SA], [13.1, 6.6, SA], [13.1, 6.6, B]] }, // A35R3
  { a: [-1458.6, -1720.5], b: [-1440, -1685.9], fondo: 9, casas: [[13.1, 6.6, SA], [13.1, 6.6, SA], [13.1, 6.6, SA]] }, // A47L4
  { a: [-1563.6, -1892.5], b: [-1539.6, -1865.6], fondo: 9, casas: [[18, 6.6, SA], [18.1, 6.6, SA]] }, // A47R1
  { a: [-1533, -1858.3], b: [-1506.7, -1825.2], fondo: 9, casas: [[14.1, 6.6, B], [14.1, 6.6, B], [14.1, 6.6, SA]] }, // A47R2
  { a: [-1533, -1858.3], b: [-1436.9, -1904.5], fondo: 9, casas: [[10.7, 6.6, B], [10.7, 6.6, AM], [10.7, 6.6, AM], [10.7, 4.0, SA], [10.7, 4.0, SA], [10.7, 6.6, B], [10.7, 6.6, AM], [10.7, 6.6, AM], [10.7, 6.6, AM], [10.3, 6.6, AM]] }, // A50L1
  { a: [-1539.6, -1865.6], b: [-1441, -1913.4], fondo: 9, casas: [[11.1, 6.6, B], [11.1, 6.6, B], [11.1, 4.0, B], [11.1, 4.0, B], [11.1, 6.6, OC], [11.1, 6.6, OC], [11.1, 6.6, OC], [11.1, 6.6, OC], [11.1, 6.6, OC], [9.7, 6.6, OC]] }, // A50R3
  { a: [-1721.4, -930.1], b: [-1667.5, -934.4], fondo: 9, casas: [[14, 4.0, AM], [14, 4.0, AM], [13, 4.0, B], [13.1, 4.0, B]] }, // A64R1
];

export function tuneAbajo2(map) {
  aceras(map, ACERAS);
  map.arganaAbajo2 = true;
}
