import { aceras } from './kitCalles.js';

/**
 * La calle Andalucía (Altavista), de Chafarís hacia el oeste, con las vistas de la calle de Google (solo se miran, no
 * van dentro del juego). La acera norte, de dos plantas (beige, marrón y blanco, con el pasillo de tierra del medio);
 * la sur, casas terreras blancas con garajes de madera, una de azulejo naranja y otra de ladrillo. Casas de a hacia b.
 */

const B = '#f1eee7', B2 = '#ece8e0', SOLAR = 0;

const ACERAS = [
  { a: [61.9, -743.5], b: [-24.7, -702.9], fondo: 9, casas: [
    [9, 9.4, '#e8cda4'], [9, 6.6, '#c9a989'], [10, 6.6, '#ebe8e2'], [5, SOLAR, B], [8, 4.0, '#77797b'],
    [10, 6.6, B], [10, 6.6, '#a97955'], [12, 6.6, '#dcc6a7'], [12, 6.6, B], [11, 6.6, B2]] },
  { a: [57.3, -751.5], b: [-56.2, -698.9], fondo: 9, casas: [
    [9, 6.6, B], [10, 4.0, B], [10, 4.0, B2], [11, 4.0, B], [10, 4.0, B2], [10, 4.0, '#c58a4f'], [12, 4.0, '#ece2cc'],
    [12, 4.0, B], [11, 4.0, '#a5503c'], [15, 4.0, B], [15, 4.0, B2]] },
  // pasado Ronda, hacia Jerez
  { a: [-34.2, -698.7], b: [-59.6, -686.7], fondo: 9, casas: [[14, 6.6, B], [14, 6.6, B2]] },
  { a: [-59.6, -686.7], b: [-70.5, -681.6], fondo: 9, casas: [[12, 6.6, B]] },
  { a: [-72.1, -691.6], b: [-81.2, -687.4], fondo: 9, casas: [[10, 6.6, '#9ea0a2']] },
];

export function tuneAndalucia(map) {
  aceras(map, ACERAS);
  map.andaluciaAltavista = true;
}
