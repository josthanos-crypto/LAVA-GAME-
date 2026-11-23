import { aceras } from './kitCalles.js';

/**
 * El norte de Altavista (Mina, Mosta, Tornajo, Régulo, Las Quemadas, Peña del Espino, La Majada y el trozo de
 * Tinguatón), con las vistas de la calle de Google (solo se miran). En Mina, el colegio Los Geranios, los bloques
 * beis de tres plantas y los negocios con rótulo que se leen en las fotos (Escuela Infantil Lapiceros, Estimular-T,
 * Supermercado La Plaza, Bar Cafetería Mina, la exposición de maquinaria de hostelería); en Mosta, la frutería; y al
 * norte, las filas de adosados blancos de dos plantas. Los locales sin nombre legible se quedan como bajo de tienda.
 * Casas de a hacia b.
 */

const B = '#f1eee7', B2 = '#ece8e0', BE = '#e3c39a', AM = '#ecd9a0';

/** una fila de adosados blancos de dos plantas que llena de a a b */
const fila = (n, ancho = 10) => Array.from({ length: n }, (_, i) => [ancho, 6.6, i % 2 ? B2 : B]);

const ACERAS = [
  // Mina
  { a: [136.2, -1654.7], b: [140.3, -1677.3], fondo: 9, casas: [[23, 4.0, B]] },
  { a: [148.2, -1705.9], b: [150.9, -1722.1], fondo: 9, casas: [[16, 4.0, B]] },
  { a: [170.4, -1845.1], b: [179.9, -1898.5], fondo: 9, casas: [
    [8, 4.0, B], [10, 4.0, B], [10, 6.6, '#d8cfc0'], [10, 6.6, '#d8cfc0', { letrero: 'Exposición Maquinaria Hostelería', k: 'shop' }],
    [9, 6.6, AM], [7, 4.0, '#e8d39a']] },
  { a: [181.4, -1908.7], b: [183.8, -1922.3], fondo: 9, casas: [[14, 6.6, '#e6dcc4']] },
  { a: [187.2, -1941.3], b: [199.8, -2011.4], fondo: 9, casas: [
    [6, 0, B], [10, 6.6, '#e2d2b4'], [10, 6.6, '#d9b8a8'], [10, 6.6, B], [6, 0, B], [10, 6.6, B], [9, 6.6, B2], [10, 6.6, B]] },
  { a: [122.8, -1634.1], b: [132.8, -1688.3], fondo: 9, casas: [
    [6, 6.6, B], [10, 6.6, B, { tienda: true }], [10, 6.6, B2], [9, 6.6, B],
    [10, 4.5, B, { letrero: 'Escuela Infantil Lapiceros', k: 'gen' }], [10, 6.6, '#e9d6b4'], [6, 9.2, '#e2d8c8']] },
  { a: [146.7, -1784.9], b: [162.5, -1870.9], fondo: 9, casas: [
    [10, 9.2, '#d9b896', { tienda: true }], [8, 6.6, B, { letrero: 'Estimular-T', k: 'gen' }], [8, 4.0, B],
    [10, 6.6, '#e9dcc6', { letrero: 'Supermercado La Plaza', k: 'shop' }], [10, 4.0, B], [33, 9.2, BE], [8, 9.2, B]] },
  { a: [166.7, -1893.6], b: [178.7, -1963.8], fondo: 9, casas: [
    [7, 9.2, '#dde4ea'], [9, 9.2, '#d8c09c'], [8, 0, B], [6, 4.0, B], [6, 0, B], [9, 6.6, '#e8dcc4', { tienda: true }],
    [9, 9.2, B], [9, 6.6, B], [8, 6.6, B2, { letrero: 'Bar Cafetería Mina', k: 'food' }]] },
  // Mosta
  { a: [97, -1781.9], b: [58.4, -1789], fondo: 9, casas: [[13, 6.6, B], [13, 6.6, B, { letrero: 'Frutería', k: 'shop' }], [13, 4.0, B]] },
  { a: [60.1, -1800.2], b: [97.9, -1793.2], fondo: 9, casas: [[10, 6.6, B], [10, 6.6, '#b8b0a4'], [9, 4.0, B], [9, 4.0, B2]] },
  { a: [110.6, -1791.6], b: [146.7, -1784.9], fondo: 9, casas: [[8, 4.0, B], [10, 6.6, B], [9, 6.6, B2], [10, 6.6, '#a88a6a', { tienda: true }]] },
  { a: [296.8, -1759.6], b: [306.7, -1757.9], fondo: 9, casas: [[10, 6.6, B]] },
  { a: [327, -1753.1], b: [337.3, -1751.2], fondo: 9, casas: [[10, 6.6, B]] },
  { a: [384.2, -1742.9], b: [393.1, -1741.3], fondo: 9, casas: [[9, 6.6, B]] },
  // Tornajo
  { a: [344.9, -1866.3], b: [338, -1827.8], fondo: 9, casas: fila(4) },
  // Régulo
  { a: [179.9, -1898.5], b: [225.9, -1890.3], fondo: 9, casas: [[8, 6.6, AM], [10, 9.2, '#e4d4a8'], [10, 4.0, B], [9, 0, B], [10, 3.2, B]] },
  { a: [236.9, -1887.8], b: [281, -1879.9], fondo: 9, casas: [[10, 9.2, '#e4c8a4'], [10, 9.2, '#e4c8a4'], [9, 6.6, B], [9, 6.6, B2], [7, 4.0, B]] },
  { a: [373.4, -1861.6], b: [384.8, -1859.5], fondo: 9, casas: [[12, 6.6, B]] },
  { a: [402, -1856.3], b: [412.2, -1854.5], fondo: 9, casas: [[10, 6.6, B]] },
  { a: [181.4, -1908.7], b: [227.3, -1900.5], fondo: 9, casas: [[8, 6.6, AM], [10, 4.0, B], [10, 4.0, B2], [10, 6.6, '#b48a68'], [9, 4.0, '#c49a7a']] },
  { a: [238.5, -1898.7], b: [282.1, -1891], fondo: 9, casas: fila(4, 11) },
  { a: [294.8, -1889], b: [334.2, -1882], fondo: 9, casas: fila(2, 20) },
  // Las Quemadas (la esquina con Mosta es del IES Altavista: iesAltavista.js)
  { a: [377.8, -1820.2], b: [384.8, -1859.5], fondo: 9, casas: fila(4) },
  // Peña del Espino (la acera de Fran la monta franPenaEspino.js)
  { a: [267.2, -1802.5], b: [281, -1879.9], fondo: 9, casas: fila(8) },
  { a: [282.1, -1891], b: [283.7, -1900], fondo: 9, casas: [[9, 4.0, B]] },
  // La Majada
  { a: [241.7, -1980], b: [230.5, -1917.1], fondo: 9, casas: fila(6) },
  { a: [228.8, -1909.1], b: [227.3, -1900.5], fondo: 9, casas: [[9, 6.6, B]] },
  { a: [225.9, -1890.3], b: [216.4, -1836.9], fondo: 9, casas: [[12, 0, B], [10, 4.0, B], [10, 4.0, B2], [10, 4.0, B], [12, 4.0, B]] },
  { a: [254.7, -1978.8], b: [238.5, -1898.7], fondo: 9, casas: [...fila(6), [6, 0, B], [10, 6.6, B]] },
  { a: [236.9, -1887.8], b: [223.1, -1810.4], fondo: 9, casas: [
    [10, 6.6, '#e8dcc0'], [10, 4.0, B, { tienda: true }], [10, 4.0, B, { tienda: true }], [10, 4.0, B], [10, 4.0, B2],
    [10, 4.0, B], [10, 6.6, B], [9, 4.0, B]] },
  // Tinguatón
  { a: [170.4, -1845.1], b: [216.4, -1836.9], fondo: 9, casas: [[12, 6.6, '#e2c8a8'], [18, 4.0, '#e9dcc4'], [17, 4.0, B]] },
];

export function tuneNorte(map) {
  aceras(map, ACERAS);
  map.norteAltavista = true;
}
