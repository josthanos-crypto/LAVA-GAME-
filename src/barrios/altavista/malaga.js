import { aceras } from './kitCalles.js';

/**
 * La calle Málaga (Altavista), la acera sur, con las vistas de la calle de Google (solo se miran, no van dentro del
 * juego): las beige de dos plantas con balcón y garaje, la terrera del zócalo de ladrillo, la del taller, la de piedra
 * gris oscura con los dos garajes y la blanca de la esquina con la balaustrada. Casas de a hacia b.
 */

const B = '#f1eee7';

const ACERAS = [
  { a: [-61.5, -1238.3], b: [-25.2, -1254.4], fondo: 9, casas: [
    [10, 6.6, '#dcc49c'], [10, 4.0, '#e9ded3'], [10, 6.6, '#d8bf98'], [10, 4.0, B]] },
  { a: [20.3, -1272.4], b: [52.3, -1286.6], fondo: 9, casas: [
    [12, 6.6, B, { tienda: true }], [12, 6.6, '#5c5f62'], [11, 6.6, B]] },
];

export function tuneMalaga(map) {
  aceras(map, ACERAS);
  map.malagaAltavista = true;
}
