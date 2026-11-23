import { aceras } from './kitCalles.js';

/**
 * La calle Marqués de Santillana (Altavista), entera, con las vistas de la calle de Google (solo se miran). Casas
 * terreras blancas con portones verdes o de madera y zócalos de piedra o de azulejo, alguna de dos plantas con balcón,
 * un par de bloques de tres plantas en las esquinas del norte, y varios solares con muro de bloque. Casas de a hacia b.
 */

const B = '#f1eee7', B2 = '#ece8e0', C = '#ede3cf', V = '#7f8a82';

const ACERAS = [
  { a: [256.2, -1194.2], b: [262.3, -1231.9], fondo: 9, casas: [[9, 4.0, B], [10, 4.0, B2], [10, 4.0, B], [9, 0, B]] },
  { a: [264.1, -1246.1], b: [273.9, -1306.8], fondo: 9, casas: [
    [6, 0, B], [9, 6.6, V], [10, 6.6, B], [10, 4.0, B], [10, 4.0, B2], [10, 0, B], [6, 6.6, V]] },
  { a: [277.3, -1331.7], b: [289.2, -1405.3], fondo: 9, casas: [[10, 4.0, B], [45, 0, B], [12, 4.0, '#e8e2d6'], [8, 0, B]] },
  { a: [291, -1413.3], b: [306.8, -1510.4], fondo: 9, casas: [
    [10, 4.0, B], [10, 4.0, B2], [10, 0, B], [10, 4.0, '#e6e0d6'], [10, 4.0, B], [10, 4.0, B], [10, 4.0, B2],
    [10, 4.0, C], [10, 4.0, C], [8, 6.6, '#d9dde0']] },
  { a: [308.7, -1520.7], b: [315.6, -1562.6], fondo: 9, casas: [[8, 4.0, B], [10, 6.6, B2], [8, 9.2, '#9a9a98'], [8, 6.6, B], [8, 0, B]] },
  { a: [317.1, -1570.1], b: [319.8, -1586.6], fondo: 9, casas: [[5, 0, B], [7, 4.0, B], [5, 9.2, B]] },
  { a: [244.9, -1187.6], b: [266.5, -1320.4], fondo: 9, casas: [
    [10, 4.0, B], [11, 6.6, B2], [10, 9.2, B], [10, 8.0, '#b8b2a8'], [11, 6.6, B], [10, 4.0, B2], [10, 4.0, B],
    [10, 6.6, C], [10, 6.6, B], [10, 4.0, B2], [10, 0, B], [10, 4.0, B], [9, 6.6, '#e6e2dc']] },
  { a: [269.3, -1335], b: [298.4, -1513.9], fondo: 9, casas: [
    [10, 4.0, B], [10, 6.6, B], [10, 4.0, B2], [10, 6.6, '#efe4dc'], [11, 6.6, B], [10, 4.0, B], [10, 6.6, B2],
    [10, 6.6, B], [10, 4.0, B], [10, 6.6, '#cfcfcf'], [10, 4.0, '#d8c8b0'], [10, 4.0, B2], [11, 4.0, B], [10, 4.0, B],
    [10, 6.6, C], [10, 6.6, '#e6dccb'], [9, 4.0, B2]] },
  { a: [298.9, -1524.6], b: [309.3, -1588.3], fondo: 9, casas: [
    [10, 4.0, B], [10, 4.0, C], [10, 4.0, B], [10, 4.0, B2], [10, 6.6, '#e9d8c8'], [10, 6.6, B], [6, 6.6, B]] },
];

export function tuneSantillana(map) {
  aceras(map, ACERAS);
  map.santillanaAltavista = true;
}
