import { aceras } from './kitCalles.js';

/**
 * La calle Doctor Ramón y Cajal (Altavista), de Chafarís hacia el oeste, con las vistas de la calle de Google (solo
 * se miran, no van dentro del juego). La acera norte, casas de dos plantas blancas con balcones, un solar y la ocre
 * del garaje; la sur, casi todo terreras con garajes (de madera, de chapa verde, el negro) y zócalos de piedra.
 * Casas de a hacia b.
 */

const B = '#f1eee7', B2 = '#ece8e0', SOLAR = 0;

const ACERAS = [
  { a: [9.5, -883.8], b: [-144.5, -810.6], fondo: 9, casas: [
    [8, 6.6, B], [10, 4.0, B], [11, 4.0, B2], [10, 4.0, B], [10, 6.6, B2], [10, 6.6, B], [10, 6.6, B2], [10, 6.6, B],
    [11, 6.6, B2], [10, 6.6, B], [8, SOLAR, B], [10, 6.6, '#d4a258'], [10, 6.6, '#dcc3a3'], [10, 4.0, B], [10, 6.6, B2],
    [23, 6.6, '#e2dcd2']] },
  { a: [-11.5, -884], b: [-147, -820.7], fondo: 9, casas: [
    [3, SOLAR, B], [10, 4.0, '#e2e0dc'], [10, 4.0, '#8a7a68'], [10, 4.0, '#c8c6c1'], [11, 4.0, B], [10, 4.0, '#b5ada0'],
    [10, 4.0, B], [10, 4.0, '#c9a98a'], [10, 4.0, B], [10, 4.0, B2], [10, 4.0, '#c7a37c'], [10, 4.0, '#9b8b7a'],
    [10, 4.0, '#d8c2a6'], [10, 4.0, B], [16, 4.0, B2]] },
];

export function tuneRamon(map) {
  aceras(map, ACERAS);
  map.ramonAltavista = true;
}
