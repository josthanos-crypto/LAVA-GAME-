import { aceras } from './kitCalles.js';

/**
 * La calle Coronel Capaz (Altavista), de la punta norte de Chafarís hacia el este, con las vistas de la calle de
 * Google (solo se miran, no van dentro del juego). La acera norte, casas de una y dos plantas (la del almacén, la
 * rosada, la del taller gris, la crema) y un solar al final; la sur, terreras blancas con zócalos y la farmacia, la de
 * ladrillo rojo, la verde salvia y la naranja de dos plantas del final. Casas de a hacia b.
 */

const B = '#f1eee7', B2 = '#ece8e0', SOLAR = 0;

const ACERAS = [
  { a: [-43.7, -1036.7], b: [62.5, -1082.3], fondo: 9, casas: [
    [7, 6.6, B], [10, 4.0, B, { tienda: true }], [10, 6.6, B2], [11, 6.6, '#e7cdb8'], [10, 4.0, '#c9a48c'],
    [10, 6.6, '#d9d6d0', { tienda: true }], [10, 4.0, B], [10, 4.0, '#e9d9a6'], [10, 6.6, B2], [10, 4.0, B],
    [10, 6.6, B2], [8, SOLAR, B]] },
  { a: [-28.7, -1054.5], b: [123.9, -1118.7], fondo: 9, casas: [
    [8, 4.0, B], [10, 4.0, '#efe3d8'], [10, 6.6, B2], [10, 4.0, '#c9c3bb', { letrero: 'Farmacia', k: 'pharma' }],
    [10, 4.0, B], [10, 4.0, B], [10, 4.0, '#b0553a'], [10, 4.0, B2], [10, 4.0, B], [10, 4.0, '#b7c1a8'], [10, 4.0, B2],
    [10, 4.0, B], [10, 4.0, B2], [10, 4.0, B], [12, 4.0, B2], [16, 6.6, '#d99a55']] },
];

export function tuneCapaz(map) {
  aceras(map, ACERAS);
  map.capazAltavista = true;
}
