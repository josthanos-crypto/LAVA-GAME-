import { aceras } from './kitCalles.js';

/**
 * La calle Huelva (Altavista), de Chafarís hacia el oeste, con las vistas de la calle de Google (solo se miran, no
 * van dentro del juego). La acera norte es casi entera el edificio salmón de tres plantas con el zócalo de piedra (el
 * que hace esquina con Chafarís); la sur, casas de dos plantas beige y blancas con los garajes azules. Las casas van
 * de a hacia b.
 */

const B = '#f1eee7', B2 = '#ece8e0';

const ACERAS = [
  { a: [73.4, -717.6], b: [7.8, -686.8], fondo: 10, casas: [[55, 9.4, '#dfa587'], [8, 6.6, B], [9, 6.6, '#a8673f']] },
  { a: [69.8, -726.5], b: [-18.7, -685], fondo: 9, casas: [
    [5, 9.4, '#e8cda4'], [9, 6.6, '#e2c3a8'], [10, 6.6, B], [10, 6.6, B2], [10, 6.6, B], [10, 6.6, '#6e5546'],
    [10, 6.6, '#e2c9a6'], [10, 9.4, '#e7d3b0'], [10, 6.6, B], [10, 6.6, B2], [4, 4.0, '#d8d4cc']] },
  // pasado Ronda
  { a: [-26.2, -681.6], b: [-51.6, -669.7], fondo: 9, casas: [[9, 4.0, B], [10, 6.6, B2], [9, 4.0, '#e6e1d8']] },
  { a: [-37.6, -666.1], b: [-52.9, -659], fondo: 9, casas: [[17, 4.0, '#b06a48']] },
];

export function tuneHuelva(map) {
  aceras(map, ACERAS);
  map.huelvaAltavista = true;
}
