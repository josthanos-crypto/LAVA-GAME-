import { aceras } from './kitCalles.js';

/**
 * La calle El Salvador (Altavista; en el mapa del juego, la que va entre Calderón de la Barca y Menéndez y Pelayo),
 * de Chafarís hacia el oeste, con las vistas de la calle de Google (solo se miran, no van dentro del juego). La acera
 * norte es la otra mitad de la manzana estrecha de Calderón (entra poco): casas blancas de una y dos plantas con
 * balaustradas y, al final, las beige de los balcones y la amarilla. La sur: terreras blancas, la rosa, la del
 * azulejo verde y un callejón de tierra. Casas de a hacia b.
 */

const B = '#f1eee7', B2 = '#ece8e0', SOLAR = 0;

const ACERAS = [
  { a: [34.9, -792.8], b: [-117, -721.7], fondo: 6, casas: [
    [10, 6.6, B], [10, 4.0, B2], [11, 6.6, B], [11, 4.0, B2], [10, 6.6, B], [10, 6.6, B2], [10, 6.6, '#dfd2bf'],
    [10, 4.0, B], [10, 6.6, '#c79a7a'], [10, 6.6, B], [10, 6.6, '#e9ddd2'], [10, 6.6, '#e2cfb0'], [26, 6.6, '#e6cfae'],
    [20, 6.6, '#e5c25f']] },
  { a: [35.1, -803.5], b: [-54.8, -761.4], fondo: 9, casas: [
    [6, 4.0, '#ecd9d3'], [10, 6.6, B], [10, 4.0, '#8fb8a8'], [11, 4.0, B], [10, 4.0, B2], [10, 4.0, B], [10, 4.0, B2],
    [10, 4.0, B], [10, 4.0, B2], [6, SOLAR, B], [6, 4.0, B]] },
  { a: [-54.8, -761.4], b: [-122, -729.6], fondo: 9, casas: [
    [9, 4.0, B], [11, 4.0, B2], [10, 4.0, B], [15, 4.0, B2], [15, 6.6, '#dcb89a'], [14, 4.0, B]] },
];

export function tuneSalvador(map) {
  aceras(map, ACERAS);
  map.salvadorAltavista = true;
}
