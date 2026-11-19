import { aceras } from '../altavista/kitCalles.js';

/**
 * Argana Alta, el resto de las calles de casas: sin vistas de Google cerca, así que van con el patrón del barrio: casas blancas, ocre y crema de una y dos plantas. Quedan fuera la carretera de San Bartolomé, los colegios, los edificios grandes y los tramos pegados a un rótulo de negocio. Casas de a hacia b.
 */

const B = '#f1eee7', AM = '#efe3b8', SA = '#e6c9a0';

const ACERAS = [
  { a: [-2239.6, -1740.2], b: [-2211.5, -1751], fondo: 9, casas: [[15.1, 6.6, AM], [15, 6.6, AM]] }, // A5L1
  { a: [-1870.8, -1598.9], b: [-1882.2, -1622.3], fondo: 9, casas: [[13, 4.0, B], [13, 6.6, B]] }, // A11R2
  { a: [-1692.8, -1479.3], b: [-1643.3, -1523.9], fondo: 9, casas: [[13.3, 6.6, B], [13.3, 4.0, B], [13.3, 6.6, SA], [13.3, 4.0, SA], [13.4, 6.6, B]] }, // A12L2
  { a: [-1668.4, -1512.1], b: [-1649.6, -1530.4], fondo: 9, casas: [[13.1, 6.6, AM], [13.1, 4.0, AM]] }, // A12L3
  { a: [-1697.7, -1484.4], b: [-1671.5, -1509.7], fondo: 9, casas: [[12.1, 6.6, B], [12.1, 4.0, B], [12.2, 6.6, AM]] }, // A12R1
  { a: [-1578.6, -1577.7], b: [-1556.3, -1590.3], fondo: 9, casas: [[12.8, 6.6, SA], [12.8, 4.0, SA]] }, // A12R2
  { a: [-1600.4, -1564.8], b: [-1626.5, -1550.7], fondo: 9, casas: [[14.8, 6.6, SA], [14.9, 4.0, SA]] }, // A12R7
  { a: [-1931.4, -1540.4], b: [-1895.2, -1515], fondo: 9, casas: [[14.7, 6.6, B], [14.7, 6.6, B], [14.8, 4.0, AM]] }, // A13R3
  { a: [-1624.9, -1640.2], b: [-1602.3, -1598.2], fondo: 9, casas: [[11.9, 6.6, SA], [11.9, 4.0, SA], [11.9, 6.6, B], [12, 6.6, B]] }, // A15R1
  { a: [-1492.4, -1623.4], b: [-1477.8, -1596.8], fondo: 9, casas: [[15.2, 6.6, B], [15.1, 4.0, B]] }, // A23L1
  { a: [-1575.2, -1082.3], b: [-1608.1, -1033.5], fondo: 9, casas: [[11.8, 6.6, B], [11.8, 4.0, B], [11.8, 6.6, AM], [11.8, 6.6, AM], [11.7, 4.0, B]] }, // A32L1
  { a: [-1583.5, -1048.6], b: [-1594.2, -1033.2], fondo: 9, casas: [[18.8, 6.6, B]] }, // A32R1
  { a: [-1462.5, -936.8], b: [-1431.1, -978.4], fondo: 9, casas: [[13, 6.6, AM], [13, 4.0, AM], [13, 6.6, B], [13.1, 4.0, B]] }, // A34R1
  { a: [-1637, -934.8], b: [-1612.4, -917.5], fondo: 9, casas: [[15, 4.0, B], [15.1, 6.6, B]] }, // A35R2
  { a: [-1592.2, -1020.4], b: [-1555.1, -992.6], fondo: 9, casas: [[11.6, 4.0, AM], [11.6, 6.6, AM], [11.6, 6.6, B], [11.6, 4.0, B]] }, // A37L1
  { a: [-1455, -1677.7], b: [-1480.3, -1718.4], fondo: 9, casas: [[12, 6.6, AM], [12, 6.6, AM], [12, 4.0, B], [11.9, 6.6, B]] }, // A47L7
  { a: [-1189.2, -1291.5], b: [-1203.6, -1318.4], fondo: 9, casas: [[15.3, 4.0, AM], [15.2, 6.6, AM]] }, // A47R4
  { a: [-1463.5, -1673.2], b: [-1486.1, -1715.3], fondo: 9, casas: [[11.9, 6.6, SA], [11.9, 4.0, SA], [11.9, 6.6, B], [12.1, 6.6, B]] }, // A47R5
];

export function tuneResto(map) {
  aceras(map, ACERAS);
  map.arganaResto = true;
}
