import { aceras } from './kitCalles.js';

/**
 * Las calles Sevilla y Córdoba (Altavista, al principio de Chafarís), con las vistas de la calle de Google (solo se
 * miran, no van dentro del juego). Casi todo son casas terreras blancas con el zócalo de piedra o de azulejo; en la
 * acera norte de Sevilla hay cuatro solares de tierra entre las casas (alto 0: el bloque genérico se quita y queda el
 * suelo). Las casas van de a hacia b.
 */

const B = '#f1eee7', B2 = '#ece8df', SOLAR = 0;

const ACERAS = [
  // Sevilla, acera sur, de Chafarís hacia el oeste
  { a: [104.8, -621], b: [51.3, -601.5], fondo: 9, casas: [
    [6, 4.0, '#efe9dd'], [10, 4.0, B], [10, 6.4, B2], [10, 4.0, B], [10, 6.6, B2], [11, 6.6, B]] },
  { a: [44.5, -598.2], b: [12.4, -585.9], fondo: 9, casas: [[9, 4.2, '#e9e3d8'], [10, 4.0, B], [10, 4.0, B2], [5, 4.2, B]] },
  { a: [4, -582.4], b: [-27.4, -572.8], fondo: 9, casas: [[9, 6.6, B], [9, 6.6, B2], [10, 6.6, '#5b5d60'], [5, SOLAR, B]] },
  // Sevilla, acera norte, de Chafarís hacia el oeste: casas y solares alternados
  { a: [117.1, -616.4], b: [44.2, -588.2], fondo: 9, casas: [
    [8, 4.0, '#f0ebe1'], [6, SOLAR, B], [9, 6.6, '#e3e1dc'], [8, SOLAR, B], [5, 4.2, B2], [7, SOLAR, B],
    [9, 4.0, B], [10, SOLAR, B], [16, 4.0, B2]] },
  { a: [26, -581.6], b: [14.7, -577.2], fondo: 9, casas: [[12, 6.6, B]] },
  { a: [-20.4, -564.7], b: [-46.4, -556.4], fondo: 9, casas: [[3, SOLAR, B], [11, 4.0, B], [9, 4.0, B2], [4, 4.0, B]] },
  // Córdoba, acera norte: la casa terrera de las ventanas verdes y, más al oeste, Alternativa Dental y 4Light
  { a: [131.2, -579.9], b: [109.7, -571.6], fondo: 9, casas: [[23, 4.0, B]] },
  { a: [72.2, -557.3], b: [46.4, -547.3], fondo: 10, casas: [
    [6, 6.6, '#f0ece4'], [4, 6.6, '#a5503c'], [6, 6.6, '#d8b779', { letrero: 'Alternativa Dental', k: 'pharma' }],
    [5, 6.6, '#9a958c'], [6, 6.6, '#d8b779', { letrero: '4Light', k: 'tech' }]] },
];

export function tuneSevilla(map) {
  aceras(map, ACERAS);
  map.sevillaAltavista = true;
}
