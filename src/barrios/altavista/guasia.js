import { aceras } from './kitCalles.js';

/**
 * La calle Guasia (Altavista), el tramo del este, con las vistas de la calle de Google (solo se miran, no van dentro
 * del juego): el edificio de dos plantas blanco abajo y crema arriba con el taller de coches y su portón abierto.
 */

const ACERAS = [
  { a: [76.2, -1370.4], b: [35.7, -1377.9], fondo: 10, casas: [
    [20, 6.6, '#efe3c4'], [21, 6.6, '#efe3c4', { tienda: true }]] },
];

export function tuneGuasia(map) {
  aceras(map, ACERAS);
  map.guasiaAltavista = true;
}
