import { aceras } from './kitCalles.js';

/**
 * La calle Almería (Altavista), el tramo del medio (el que tiene vistas de la calle de Google; solo se miran, no van
 * dentro del juego): terreras y de dos plantas, la ocre de los balcones, la del zócalo de piedra gris, la de la
 * fachada de piedra, la del azulejo negro con las ventanas verdes y la crema del final. Casas de a hacia b.
 */

const B = '#f1eee7', B2 = '#ece8e0';

const ACERAS = [
  { a: [31.4, -1236.1], b: [-33.1, -1208.7], fondo: 9, casas: [
    [12, 6.6, B], [12, 4.0, '#e8ddd0'], [10, 4.0, B2], [10, 6.6, B], [12, 6.6, '#d9b98f'], [14, 4.0, B2]] },
  { a: [-29.6, -1200.4], b: [35.4, -1229.0], fondo: 9, casas: [
    [10, 4.0, B], [10, 4.0, B2], [5, 4.0, '#ece0c4'], [8, 4.0, '#9a8c80'], [12, 4.0, B], [12, 4.0, '#4a4f53'],
    [14, 4.0, '#efe3bf']] },
];

export function tuneAlmeria(map) {
  aceras(map, ACERAS);
  map.almeriaAltavista = true;
}
