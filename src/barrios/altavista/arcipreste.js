import { aceras } from './kitCalles.js';

/**
 * La calle Arcipreste de Hita (Altavista), el tramo del aparcamiento de Padre Claret hacia el norte, con las vistas
 * de la calle de Google (solo se miran, no van dentro del juego). Casi todo casas terreras blancas con portones y
 * ventanas verdes y zócalos de piedra o de azulejo; en la acera oeste, al final, dos de dos plantas (la marrón del
 * balcón de madera) y en la este el garaje-taller beige. Casas de a hacia b.
 */

const B = '#f1eee7', B2 = '#ece8e0';

const ACERAS = [
  { a: [237.5, -1377], b: [256.1, -1491.4], fondo: 9, casas: [
    [11, 4.0, B], [10, 4.0, B2], [11, 4.0, '#efe6dc'], [10, 4.0, '#d9d6d2'], [10, 4.0, B], [10, 4.0, B2], [10, 4.0, B],
    [11, 6.6, '#e6ddd0'], [10, 6.6, '#e2d6c3'], [10, 6.6, '#b98966'], [8, 6.6, '#a0705a'], [5, 4.0, B]] },
  { a: [240.6, -1339.7], b: [262.8, -1476.5], fondo: 9, casas: [
    [8, 6.6, B], [10, 6.6, '#e2d3b8', { tienda: true }], [10, 4.0, B], [10, 4.0, B2], [10, 4.0, B], [10, 4.0, B2],
    [10, 4.0, B], [10, 4.0, B2], [10, 4.0, '#a9a49a'], [11, 4.0, B], [10, 4.0, '#efe4d8'], [10, 4.0, B], [10, 4.0, B2],
    [10, 4.0, B]] },
];

export function tuneArcipreste(map) {
  aceras(map, ACERAS);
  map.arciprestealtavista = true;
}
