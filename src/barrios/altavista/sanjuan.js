import { aceras } from './kitCalles.js';

/**
 * Las calles San Juan de la Cruz, Leopoldo von Buch (en Google, Crucero Canarias), Cervantes, Fasnia y el tramo este
 * de Guigua (Altavista), con las vistas de la calle de Google (solo se miran). Casas terreras blancas con portones
 * verdes, algunas de dos plantas con balcón, los adosados color crema de dos plantas de Fasnia (con una tiendita en la
 * esquina) y de Leopoldo von Buch, y los bloques naranja de tres plantas de Cervantes. Casas de a hacia b.
 */

const B = '#f1eee7', B2 = '#ece8e0', C = '#ede3cf', CR = '#efe2c8', CR2 = '#f3e8d2', NA = '#e8c9a0';

const ACERAS = [
  // San Juan de la Cruz
  { a: [230.2, -1495.6], b: [222.9, -1450.7], fondo: 9, casas: [[9, 6.6, '#d9d4cc'], [10, 6.6, B], [10, 6.6, '#b9b0a2'], [8, 4.0, C], [8, 4.0, B]] },
  { a: [221.7, -1419.1], b: [219, -1398.5], fondo: 9, casas: [[7, 0, B], [7, 3.2, '#b8ae9c'], [7, 4.0, B]] },
  { a: [227.2, -1558.8], b: [234.1, -1601.4], fondo: 9, casas: [[20, 6.6, C], [23, 6.6, CR]] },
  { a: [245.5, -1600.1], b: [241.5, -1575.9], fondo: 9, casas: [[25, 6.6, '#e2cfae']] },
  { a: [240.9, -1563.2], b: [231.8, -1507.4], fondo: 9, casas: [[12, 4.0, B], [10, 6.6, B], [10, 6.6, B2], [12, 9.2, B], [13, 6.6, B]] },
  { a: [217.6, -1344.3], b: [222.1, -1372.1], fondo: 9, casas: [[7, 4.0, B], [8, 4.0, C], [8, 4.0, C], [5, 0, B]] },
  // Leopoldo von Buch (Crucero Canarias)
  { a: [369.7, -1414.1], b: [371.6, -1426.4], fondo: 9, casas: [[5, 0, B], [7, 4.5, B]] },
  { a: [373, -1436.7], b: [377.7, -1468.1], fondo: 9, casas: [[6, 4.0, B], [7, 4.0, B], [7, 4.0, '#5a5f62'], [7, 4.0, B], [5, 4.0, B2]] },
  { a: [380.1, -1485.8], b: [381.6, -1495.7], fondo: 9, casas: [[4, 0, B], [6, 4.0, B]] },
  { a: [384.6, -1521.3], b: [391.6, -1571.6], fondo: 9, casas: [[10, 6.6, CR], [10, 6.6, CR2], [10, 6.6, CR], [10, 6.6, CR2], [11, 6.6, CR]] },
  { a: [349, -1338.2], b: [370.7, -1498.5], fondo: 9, casas: [
    [12, 4.0, B], [12, 4.0, B2], [12, 6.6, '#6a6560'], [10, 4.0, B], [10, 4.0, B2], [10, 4.0, '#d9c2a8'], [10, 4.0, B],
    [10, 4.0, '#c9a888'], [10, 4.0, B], [11, 4.0, B2], [10, 4.0, B], [10, 6.6, B], [10, 4.0, B2], [10, 4.0, B], [10, 4.0, B]] },
  { a: [373.6, -1509], b: [384.3, -1574.5], fondo: 9, casas: [
    [8, 6.6, B], [10, 4.0, B], [10, 4.0, B2], [10, 6.6, B], [10, 6.6, B2], [10, 4.0, '#b8b2aa'], [8, 4.0, B]] },
  // Cervantes
  { a: [373.6, -1509], b: [346.3, -1513.4], fondo: 9, casas: [[14, 4.0, B], [14, 4.0, B2]] },
  { a: [290, -1526.1], b: [272, -1529], fondo: 9, casas: [[18, 4.0, B]] },
  { a: [398, -1492.8], b: [381.6, -1495.7], fondo: 9, casas: [[17, 6.6, B]] },
  { a: [370.7, -1498.5], b: [344.6, -1502.8], fondo: 9, casas: [[9, 6.6, B], [8, 0, B], [9, 9.2, NA]] },
  { a: [336.3, -1505.6], b: [315.7, -1509], fondo: 9, casas: [[21, 9.2, NA]] },
  { a: [298.6, -1514.8], b: [269.3, -1520.7], fondo: 9, casas: [[15, 6.6, B], [15, 4.0, B]] },
  // Fasnia
  { a: [132.2, -1618], b: [234.1, -1601.4], fondo: 9, casas: [
    [10, 4.0, CR, { tienda: true }], [10, 6.6, CR], [9, 6.6, CR2], [9, 6.6, CR], [9, 6.6, CR2], [9, 6.6, CR], [9, 6.6, CR2],
    [9, 6.6, CR], [9, 6.6, CR2], [10, 6.6, CR], [10, 6.6, CR2]] },
  { a: [245.5, -1600.1], b: [271.5, -1595.9], fondo: 9, casas: [[13, 6.6, '#e6d6b8'], [13, 6.6, B]] },
  { a: [328.7, -1585.2], b: [348.3, -1582], fondo: 9, casas: [[20, 6.6, B]] },
  // Guigua, el tramo de junto a San Juan de la Cruz
  { a: [230.2, -1495.6], b: [247.2, -1492.9], fondo: 9, casas: [[17, 6.6, B]] },
  { a: [257.4, -1503.6], b: [231.8, -1507.4], fondo: 9, casas: [[13, 6.6, B], [13, 6.6, B2]] },
];

export function tuneSanJuan(map) {
  aceras(map, ACERAS);
  map.sanJuanAltavista = true;
}
