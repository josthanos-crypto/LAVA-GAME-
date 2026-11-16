import { aceras } from './kitCalles.js';

/**
 * La calle Juan Sebastián Elcano (Altavista), de Chafarís hacia el oeste, con las vistas de la calle de Google (solo
 * se miran, no van dentro del juego). La acera norte tiene talleres y almacenes (el Taller Eléctrico con el coche
 * pintado en la persiana, el almacén viejo de piedra, el de los portones verdes) y el edificio crema de dos plantas
 * con las ventanas en arco. La esquina sur con Chafarís, dos casas terreras de portones verdes. Casas de a hacia b.
 */

const B = '#f1eee7', B2 = '#ece8e0';

const ACERAS = [
  { a: [-27.8, -919], b: [-163.3, -855.5], fondo: 9, casas: [
    [7, 6.6, B], [10, 6.6, B2], [9, 6.6, B], [10, 6.6, '#c9c0b0', { tienda: true }], [10, 6.6, B],
    [10, 6.6, B2, { tienda: true }], [10, 6.6, B, { tienda: true }], [10, 6.6, B2], [10, 4.0, '#b5a48a'],
    [10, 6.6, B, { letrero: 'Taller Eléctrico', k: 'tech' }], [20, 6.6, '#e8d5a8'], [9, 6.6, B], [10, 6.6, B2],
    [10, 4.0, '#dcc6a8'], [5, 6.6, B]] },
  { a: [-32.1, -929.6], b: [-48.9, -921.4], fondo: 9, casas: [[10, 4.0, B], [9, 4.0, B2]] },
];

export function tuneElcano(map) {
  aceras(map, ACERAS);
  map.elcanoAltavista = true;
}
