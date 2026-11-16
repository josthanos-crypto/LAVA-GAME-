import { aceras } from '../altavista/kitCalles.js';

/**
 * El extremo oeste de Titerroy (Valbanera, El Tres de Mayo, Félix Pérez Camacho, El Antonio, Gaire, Carlos III, Juan
 * Negrín y Hermanos Álvarez Quintero, hacia Argana), con las vistas de la calle de Google (solo se miran): las naves
 * blancas de zócalo gris de Félix Pérez Camacho, la fila larga de casas blancas de dos plantas con ventanas de madera
 * de enfrente, el edificio de cristal de la esquina de El Antonio con Carlos III y casas blancas o beis con garaje.
 * Rótulos que se leen en las fotos: La Gruta del Goblin, Dallas Motor Canarias, Siguiendo El Camino (iglesia) y un
 * taller mecánico; los demás bajos con tienda o bar van sin nombre. Casas de a hacia b.
 */

const B = '#f1eee7', B2 = '#ece8e0', BE = '#e6cfa8', NAVE = '#e9e7e2', VID = '#b8c4c8';

const fila = (n, alto = 6.6, ancho = 10) => Array.from({ length: n }, (_, i) => [ancho, alto, i % 2 ? B2 : B]);

const ACERAS = [
  // Valbanera
  { a: [-946.7, -686.1], b: [-911.8, -726.4], fondo: 9, casas: [[6, 0, B], [8, 4.0, B], [9, 6.6, B2], [9, 6.6, '#e0b8a0'], [9, 4.0, B], [8, 4.0, B2]] },
  { a: [-901.9, -719.1], b: [-954.8, -658], fondo: 9, casas: [
    [8, 6.6, B], [10, 6.6, B, { tienda: true }], [10, 6.6, '#efe2c8', { tienda: true }], [10, 0, B], [10, 6.6, '#e9b890'],
    [10, 6.6, '#efe2c8'], [10, 4.0, B], [13, 6.6, '#e8d8c8']] },
  { a: [-963.6, -665], b: [-950.6, -680], fondo: 9, casas: [[20, 6.6, B]] },
  { a: [-962, -650.3], b: [-980.8, -628.5], fondo: 9, casas: [[29, 6.6, '#d8d4cc', { tienda: true }]] },
  // El Tres de Mayo
  { a: [-984.3, -789.9], b: [-1016.3, -752.3], fondo: 9, casas: [[12, 6.6, '#e8c8a0'], [12, 0, B], [12, 4.5, B, { tienda: true }], [13, 6.6, B2]] },
  { a: [-1030.9, -722.3], b: [-1010.1, -746.2], fondo: 9, casas: [[10, 4.0, B], [11, 6.6, B2], [11, 6.6, '#a07858', { letrero: 'Taller mecánico', k: 'tech' }]] },
  { a: [-1004.4, -753.3], b: [-983.8, -777], fondo: 9, casas: [[8, 0, B], [8, 4.0, B], [8, 6.6, BE], [7, 6.6, '#c8b8a0']] },
  { a: [-960, -806], b: [-917, -854.9], fondo: 9, casas: [[16, 6.6, B, { tienda: true }], [16, 6.6, B2], [16, 6.6, B], [17, 6.6, '#e4ddd0']] },
  // Félix Pérez Camacho: las naves y la fila de enfrente
  { a: [-1076, -760.7], b: [-1023, -821.9], fondo: 9, casas: [[20, 5.5, NAVE], [20, 5.5, NAVE], [20, 5.5, NAVE], [21, 5.5, NAVE]] },
  { a: [-1016.7, -829.8], b: [-943.6, -914.2], fondo: 9, casas: fila(11) },
  // El Antonio y Carlos III (el edificio de cristal)
  { a: [-1095.4, -810.9], b: [-1113.7, -790.4], fondo: 9, casas: [[27, 7.5, VID, { tienda: true }]] },
  { a: [-1049, -846.6], b: [-1103.1, -784.1], fondo: 9, casas: [[40, 5.5, NAVE], [43, 5.5, NAVE]] },
  { a: [-1113.7, -790.4], b: [-1113.4, -827.8], fondo: 9, casas: [[37, 7.5, VID, { tienda: true }]] },
  { a: [-1001.8, -697.1], b: [-1030.9, -722.3], fondo: 9, casas: [
    [13, 6.6, B, { letrero: 'Dallas Motor Canarias', k: 'tech' }], [13, 6.6, B2, { tienda: true }], [12, 6.6, B]] },
  // Gaire
  { a: [-1017.5, -660.8], b: [-999, -682.2], fondo: 9, casas: [[14, 4.0, B, { letrero: 'La Gruta del Goblin', k: 'shop' }], [14, 6.6, B2]] },
  // Hermanos Álvarez Quintero (oeste)
  { a: [-920, -901.2], b: [-963.5, -975.3], fondo: 9, casas: [
    [8, 4.0, B], [12, 6.6, B, { letrero: 'Siguiendo El Camino', k: 'gen' }], [12, 6.6, B2], [12, 4.0, '#e6dccb'], [14, 4.0, B, { tienda: true }],
    [14, 4.0, B2], [14, 6.6, B]] },
];

export function tuneLejano(map) {
  aceras(map, ACERAS);
  map.titerroyLejano = true;
}
