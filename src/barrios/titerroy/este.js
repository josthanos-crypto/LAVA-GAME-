import { aceras } from '../altavista/kitCalles.js';

/**
 * El borde este de Titerroy, pegado a Altavista (Almería, Temisa, Honduras y Málaga), con las vistas de la calle de
 * Google (solo se miran). Las naves blancas con ribetes azules y portones verdes de Temisa (con una tienda en la
 * esquina), los dúplex crema de Almería y casas blancas de una y dos plantas. Casas de a hacia b.
 */

const B = '#f1eee7', B2 = '#ece8e0', CR = '#efe2c8';

const ACERAS = [
  // Almería
  { a: [-33.4, -1209.3], b: [-115.9, -1173.5], fondo: 9, casas: [
    [10, 4.0, B, { tienda: true }], [10, 4.0, B2], [10, 6.6, B], [10, 6.6, B2], [10, 4.0, B], [10, 6.6, B], [10, 6.6, CR],
    [10, 6.6, CR], [10, 6.6, CR]] },
  { a: [-89.5, -1174.5], b: [-106.3, -1167], fondo: 9, casas: [[10, 4.0, '#c9c2b4', { tienda: true }], [8, 0, B]] },
  // Temisa
  { a: [-114, -1197.5], b: [-115.9, -1173.5], fondo: 9, casas: [[12, 6.6, CR], [12, 6.6, '#ece0c8']] },
  { a: [-73.8, -973], b: [-52.8, -929.5], fondo: 9, casas: [
    [10, 4.5, B, { tienda: true }], [10, 4.5, B], [10, 4.5, B2], [9, 4.5, B], [9, 4.5, B2]] },
  { a: [-70.8, -1102], b: [-73.9, -1109.6], fondo: 9, casas: [[8, 6.6, B]] },
  { a: [-97.9, -1024.8], b: [-104.2, -1040.7], fondo: 9, casas: [[10, 3.2, B], [7, 4.0, B2]] },
  { a: [-109.4, -1096.1], b: [-110.2, -1112], fondo: 9, casas: [[8, 6.6, B], [8, 6.6, B2]] },
  // Málaga y Honduras
  { a: [-61.5, -1238.3], b: [-88.9, -1226.1], fondo: 9, casas: [[15, 6.6, '#e9dcc0'], [15, 6.6, B]] },
  { a: [-110.2, -1112], b: [-99.3, -1116.9], fondo: 9, casas: [[7, 4.0, B], [5, 0, B]] },
  { a: [-104.4, -1125.8], b: [-73.9, -1139.3], fondo: 9, casas: [[9, 6.6, B], [9, 6.6, '#e6dccb'], [9, 9.2, '#e3cdb0'], [6, 0, B]] },
];

export function tuneEste(map) {
  aceras(map, ACERAS);
  map.titerroyEste = true;
}
