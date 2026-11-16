import { aceras } from './kitCalles.js';

/**
 * La calle Honduras (Altavista), al norte de Coronel Capaz, con las vistas de la calle de Google (solo se miran, no
 * van dentro del juego). La acera sur, terreras y de dos plantas blancas, la ocre y la del azulejo dorado; la norte,
 * las adosadas de dos plantas con cancelas, las salmón de las puertas rojas, dos solares en las puntas y, pasado el
 * cruce, terreras con portones verdes. Casas de a hacia b.
 */

const B = '#f1eee7', B2 = '#ece8e0', SOLAR = 0;

const ACERAS = [
  { a: [-47.1, -1139], b: [77.2, -1194.1], fondo: 9, casas: [
    [7, 4.0, B], [10, 6.6, B2], [10, 6.6, '#d9b57f'], [10, 6.6, '#c99a52'], [10, 4.0, B], [10, 4.0, B2], [10, 6.6, B],
    [11, 4.0, B2], [10, 4.0, '#e6dccb'], [10, 4.0, B], [10, 6.6, B2], [10, 4.0, B], [10, 4.0, B2], [8, 4.0, B]] },
  { a: [-66.8, -1141.7], b: [3.8, -1173], fondo: 9, casas: [
    [4, SOLAR, B], [14, 4.0, B], [10, 6.6, '#d9c8b4'], [10, 6.6, B], [10, 6.6, B2], [10, 6.6, '#bfa290'],
    [12, 6.6, '#c9a58f'], [7, SOLAR, B]] },
  { a: [32.7, -1185.8], b: [77.8, -1205.9], fondo: 9, casas: [
    [6, 4.0, B], [10, 4.0, B2], [10, 4.0, B], [10, 4.0, B2], [8, 4.0, '#c5c0b6'], [5, 4.0, B]] },
];

export function tuneHonduras(map) {
  aceras(map, ACERAS);
  map.hondurasAltavista = true;
}
