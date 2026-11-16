import { aceras } from './kitCalles.js';

/**
 * La calle Menéndez y Pelayo (Altavista), de Chafarís hacia el oeste, con las vistas de la calle de Google (solo se
 * miran, no van dentro del juego). La acera norte empieza con la ferretería y los almacenes viejos de los portones
 * verdes, y luego se abre el aparcamiento grande de tierra (unos 40 m) y otros dos solares entre casas. La sur, casas
 * terreras y de dos plantas: la de azulejo marrón, la amarilla, las beige de los balcones. Casas de a hacia b.
 */

const B = '#f1eee7', B2 = '#ece8e0', SOLAR = 0;
// los solares de la acera norte llegan hasta las traseras de las casas de El Salvador
const HONDO = { fondo: 28 };

const ACERAS = [
  { a: [19.5, -836.8], b: [-137.6, -762.4], fondo: 9, casas: [
    [8, 6.6, '#efe6cc', { letrero: 'Ferretería', k: 'retail' }], [10, 4.0, B], [10, 4.0, B2], [10, 4.0, B], [8, 4.0, B2],
    [42, SOLAR, B, HONDO], [8, 4.0, B], [8, SOLAR, B, HONDO], [10, 6.6, B2], [16, 4.0, B], [16, SOLAR, B, HONDO],
    [10, 4.0, '#dcdad6'],
    [18, 4.0, '#d6c7ad']] },
  { a: [15.5, -847.4], b: [-94.7, -795.5], fondo: 9, casas: [
    [7, 4.0, B], [9, 4.0, '#a8673f'], [10, 4.0, '#ece2cc'], [6, 4.0, '#e5cf8e'], [8, 6.6, B], [10, 4.0, B2], [11, 4.0, B],
    [10, 6.6, B], [9, 4.0, B2], [10, 6.6, '#e2cdb0'], [10, 6.6, '#e2cdb0'], [10, 6.6, '#efe7da'], [8, 4.0, '#b06a48'],
    [4, 6.6, B]] },
];

export function tuneMenendez(map) {
  aceras(map, ACERAS);
  map.menendezAltavista = true;
}
