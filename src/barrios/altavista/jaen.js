import { aceras } from './kitCalles.js';

/**
 * La calle Jaén (Altavista), de Chafarís hacia el oeste, con las vistas de la calle de Google (solo se miran, no van
 * dentro del juego). En la acera norte hay dos solares de tierra grandes y la entrada de coches del final; en la sur,
 * casas blancas de una y dos plantas con las ventanas y los garajes verdes. Las casas van de a hacia b.
 */

const B = '#f1eee7', B2 = '#ece8e0', SOLAR = 0;

const ACERAS = [
  // acera norte: la casa de las ventanas verdes, la de la escalera de fuera, el solar grande y la casa estrecha del 12
  { a: [97.3, -690.1], b: [49.5, -664.8], fondo: 9, casas: [
    [8, 6.6, B], [8, 4.0, B2], [8, 6.6, '#d9c3a3'], [5, 6.6, '#e6dcca'], [16, SOLAR, B], [5, 6.6, '#cdb89a'], [4, SOLAR, B]] },
  { a: [44, -662], b: [4.8, -642.1], fondo: 9, casas: [
    [3, SOLAR, B], [9, 4.0, '#e6e4df'], [10, 4.0, B], [5, 4.0, B2], [6, 4.0, '#eadcc0'], [9, 4.0, '#efe9e0'], [2, SOLAR, B]] },
  // acera sur: casas terreras y de dos plantas con lo verde
  { a: [62.6, -661.6], b: [21, -640.1], fondo: 9, casas: [[10, 4.0, B2], [10, 4.0, B], [10, 6.6, B], [10, 6.6, '#f0ede6'], [7, 4.0, B2]] },
  { a: [13, -635.8], b: [0, -628.9], fondo: 9, casas: [[15, 6.6, '#e4cdb9']] },
  // pasado Ronda, hacia Jerez
  { a: [-26.7, -624.5], b: [-50.6, -612.2], fondo: 9, casas: [[10, 6.6, B], [9, 6.6, '#e9e6e1'], [8, 6.6, B2]] },
];

export function tuneJaen(map) {
  aceras(map, ACERAS);
  map.jaenAltavista = true;
}
