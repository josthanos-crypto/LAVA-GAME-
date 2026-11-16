import { aceras } from '../altavista/kitCalles.js';

/**
 * San Francisco Javier calle a calle, con las vistas de la calle de Google (solo se miran): Agustín Espinosa, Enrique
 * IV, Isabel la Católica, Juan II, Felipe II, Cardenal Cisneros, Antonio Bermúdez, Viriato, Carlos V y Fernando el
 * Católico. Casas terreras blancas con garaje verde o de madera y zócalo de piedra o azulejo, bloques beis y
 * melocotón de dos y tres plantas, alguna nave y solares tapiados. Rótulos que se leen en las fotos: Farmacia San
 * Francisco Javier, Suministros Textiles y Bar-Cafetería San Francisco Javier. Los tramos que pasan por delante de los
 * carteles de negociosSfj.js (Rosa Negra, La Iguana, Rincón de Manolo, Carpisur, el supermercado, Magec, Canestylo)
 * se cortan para no taparlos. Casas de a hacia b.
 */

const B = '#f1eee7', B2 = '#ece8e0', BE = '#e6cfa8', CR = '#efe2c8', NAVE = '#e9e7e2';
const MEL = '#e8c8a8', PI = '#e6d2b8';

const ACERAS = [
  // Agustín Espinosa
  { a: [-1424.3, -25.2], b: [-1461, -19.2], fondo: 9, casas: [[18, 9.2, '#e2c8b0'], [19, 6.6, '#e2c8b0']] },
  { a: [-1472.2, -17.5], b: [-1606.1, 2.9], fondo: 9, casas: [
    [10, 6.6, B], [10, 6.6, B2], [8, 0, B], [11, 6.6, MEL], [10, 6.6, MEL], [10, 6.6, '#ecd8c0'], [10, 4.0, B], [10, 4.0, B2],
    [10, 6.6, B], [10, 6.6, B2], [10, 6.6, B], [10, 6.6, BE], [10, 6.6, B], [6, 0, B]] },
  { a: [-1402.6, -16.2], b: [-1458.5, -7.9], fondo: 9, casas: [[20, 6.6, B], [12, 6.6, BE], [12, 6.6, '#e8c8a0'], [13, 9.2, '#e2cdb0']] },
  { a: [-1468.2, -6.1], b: [-1564.1, 8.4], fondo: 9, casas: [
    [10, 6.6, B], [30, 9.2, '#e4cdb2'], [10, 6.6, B2], [10, 6.6, B], [10, 6.6, B2], [10, 6.6, '#e0d8c8'], [10, 6.6, B], [7, 6.6, '#ecdca0']] },
  { a: [-1573.8, 9.9], b: [-1684.8, 27.6], fondo: 9, casas: [
    [6, 0, B], [24, 6.6, '#d8d4cc'], [10, 6.6, '#e8d8b0'], [12, 6.6, '#ecdca0'], [12, 6.6, B], [12, 4.0, B2], [12, 6.6, B], [12, 6.6, BE], [12, 4.0, B]] },
  // Enrique IV (cortada delante de Rosa Negra, La Iguana, el Rincón de Manolo y Carpisur)
  { a: [-1518.3, -253.7], b: [-1616.85, -236.84], fondo: 9, casas: [
    [14, 6.6, B], [14, 4.0, B2], [14, 6.6, B], [14, 6.6, BE], [14, 4.0, B], [10, 4.0, B], [10, 6.6, B2], [10, 4.0, B]] },
  { a: [-1636.56, -233.47], b: [-1654.5, -230.4], fondo: 9, casas: [[18, 4.0, '#e8d6b8']] },
  { a: [-1664.4, -229.1], b: [-1778.3, -210.2], fondo: 9, casas: [
    [12, 4.0, B], [10, 6.6, B2], [10, 4.0, '#efe6d4'], [10, 4.0, B], [10, 6.6, B2], [10, 6.6, B], [10, 6.6, B2], [10, 6.6, B], [10, 6.6, B2],
    [13, 6.6, B], [10, 4.0, B]] },
  { a: [-1516.2, -244], b: [-1528.06, -242.13], fondo: 9, casas: [[12, 6.6, B]] },
  { a: [-1543.86, -239.63], b: [-1589.31, -232.46], fondo: 9, casas: [[14, 4.0, B2], [16, 6.6, BE], [16, 6.6, B]] },
  { a: [-1607.8, -229.1], b: [-1614.7, -228.0], fondo: 9, casas: [[7, 4.0, B]] },
  { a: [-1630.5, -225.5], b: [-1652.6, -222], fondo: 9, casas: [[11, 6.6, '#dcc090'], [11, 6.6, BE]] },
  { a: [-1663.8, -220.2], b: [-1726.5, -209.8], fondo: 9, casas: [
    [11, 6.6, B], [10, 6.6, '#d8c8b0'], [10, 6.6, B2], [10, 6.6, '#ece0c8'], [10, 6.6, B], [9, 6.6, BE], [4, 0, B]] },
  { a: [-1743.8, -207.0], b: [-1781.4, -200.7], fondo: 9, casas: [[10, 9.2, BE], [14, 4.0, B], [14, 6.6, B2]] },
  // Isabel la Católica
  { a: [-1581, -97.6], b: [-1492.7, -123.4], fondo: 9, casas: [
    [12, 9.2, '#e8c8a0'], [10, 4.0, B], [10, 4.0, B2], [10, 6.6, CR], [10, 6.6, B], [10, 6.6, B2], [10, 4.0, B], [10, 4.0, B2], [10, 4.0, B]] },
  { a: [-1481.7, -126.2], b: [-1435.2, -140.6], fondo: 9, casas: [[8, 4.0, B], [10, 4.0, B], [10, 4.0, B2], [11, 6.6, B], [10, 4.0, '#c8c4bc']] },
  { a: [-1606.7, -99.6], b: [-1493, -133.5], fondo: 9, casas: [
    [8, 0, B], [22, 5.0, NAVE], [10, 4.0, B], [10, 4.0, B2], [8, 4.0, B], [22, 5.0, B], [10, 4.0, B], [10, 4.0, '#b8b2a8'], [10, 4.0, CR], [9, 4.0, B]] },
  { a: [-1484.5, -136.6], b: [-1437.8, -149], fondo: 9, casas: [[8, 6.6, B], [10, 4.0, B2], [10, 6.6, B], [10, 6.6, B2], [10, 6.6, B]] },
  // Felipe II (cortada delante del supermercado)
  { a: [-1373.3, -286.9], b: [-1339.6, -178.9], fondo: 9, casas: [
    [3, 0, B], [10, 4.0, CR], [10, 4.0, B], [8, 4.0, B2], [4, 0, B], [10, 6.6, B], [10, 4.0, B2], [10, 4.0, B], [10, 4.0, B2], [10, 4.0, B],
    [10, 4.0, B2], [10, 4.0, B], [8, 4.0, '#e8eef2']] },
  { a: [-1337.1, -170.1], b: [-1312.0, -88.9], fondo: 9, casas: [
    [10, 4.0, B], [10, 6.6, B2], [10, 4.0, B], [10, 4.0, '#e8d8c8'], [10, 6.6, B], [10, 4.0, B2], [10, 6.6, B], [15, 4.0, B]] },
  { a: [-1307.3, -73.6], b: [-1284.2, 1.1], fondo: 9, casas: [[10, 4.0, B], [10, 6.6, B2], [10, 4.0, B], [12, 6.6, B], [12, 4.0, B2], [12, 6.6, B], [12, 4.0, B]] },
  { a: [-1372, -315.3], b: [-1330.2, -181.7], fondo: 9, casas: [
    [8, 6.6, B], [10, 4.0, B, { letrero: 'Farmacia San Francisco Javier', k: 'pharma' }], [8, 0, B], [10, 4.0, B2], [10, 4.0, B], [10, 6.6, B2],
    [10, 6.6, B], [10, 9.2, '#e4d6c4'], [10, 9.2, '#ddd0c0'], [10, 9.2, '#e4d6c4'], [10, 6.6, '#e6d8c4'], [8, 6.6, '#d8ccbc'], [10, 4.0, B],
    [16, 6.6, B2]] },
  { a: [-1328.3, -173.6], b: [-1319.6, -146.3], fondo: 9, casas: [[14, 6.6, B], [15, 6.6, B2, { tienda: true }]] },
  // Juan II
  { a: [-1681, -342.8], b: [-1676.7, -312], fondo: 9, casas: [[10, 6.6, PI], [10, 4.0, B], [11, 4.0, B2]] },
  { a: [-1673.7, -293.6], b: [-1670.8, -269], fondo: 9, casas: [[8, 4.0, B], [17, 4.0, B2]] },
  { a: [-1669.5, -259.9], b: [-1664.4, -229.1], fondo: 9, casas: [[10, 4.0, B], [10, 4.0, B2], [11, 4.0, B, { tienda: true }]] },
  { a: [-1663.8, -220.2], b: [-1658.1, -185.8], fondo: 9, casas: [[17, 4.0, CR, { tienda: true }], [18, 6.6, CR]] },
  { a: [-1681.5, -407.3], b: [-1668.1, -313.6], fondo: 9, casas: [
    [12, 6.6, B], [10, 6.6, B2], [10, 6.6, CR], [10, 6.6, B], [10, 6.6, '#ecdcc0'], [10, 6.6, '#ecdcc0'], [11, 9.2, B],
    [11, 6.6, B, { letrero: 'Suministros Textiles', k: 'shop' }], [11, 6.6, CR]] },
  { a: [-1666, -300.6], b: [-1662.2, -272.2], fondo: 9, casas: [[5, 0, B], [8, 6.6, CR], [8, 6.6, B], [8, 6.6, B2]] },
  { a: [-1660, -262], b: [-1654.5, -230.4], fondo: 9, casas: [
    [12, 6.6, B, { letrero: 'Bar-Cafetería San Francisco Javier', k: 'food' }], [10, 6.6, B2], [10, 4.0, '#e6d2b0']] },
  { a: [-1652.6, -222], b: [-1647.6, -187.6], fondo: 9, casas: [[17, 6.6, '#e6d2b0'], [18, 6.6, '#ecdca8']] },
  // Carlos V
  { a: [-1596, -272.9], b: [-1660, -262], fondo: 9, casas: [[14, 6.6, B], [14, 4.0, B2], [14, 6.6, B], [13, 6.6, B2], [10, 6.6, B, { tienda: true }]] },
  // Cardenal Cisneros
  { a: [-1499.9, -211.3], b: [-1465.1, -219.4], fondo: 9, casas: [[12, 4.0, B], [12, 4.0, B2], [12, 6.6, B]] },
  { a: [-1425.4, -228.5], b: [-1405.5, -233], fondo: 9, casas: [[20, 6.6, B]] },
  { a: [-1501.7, -223], b: [-1460.6, -231.9], fondo: 9, casas: [[10, 6.6, B], [10, 4.0, B2], [11, 4.0, B], [11, 4.0, B2]] },
  { a: [-1448.1, -235.4], b: [-1410.1, -244.9], fondo: 9, casas: [[20, 6.6, '#e2c49c'], [19, 6.6, '#e2c49c']] },
  // Antonio Bermúdez y Alfonso XIII
  { a: [-1379.5, -183.2], b: [-1417.8, -308.1], fondo: 9, casas: [
    [12, 6.6, B], [12, 4.0, B2], [12, 6.6, BE], [12, 4.0, B], [10, 4.0, B], [10, 6.6, B, { tienda: true }], [10, 4.0, CR], [12, 6.6, B2],
    [12, 4.0, B], [12, 6.6, B], [17, 6.6, B2]] },
  { a: [-1428.5, -305.9], b: [-1410.1, -244.9], fondo: 9, casas: [[32, 6.6, MEL], [32, 6.6, MEL]] },
  { a: [-1443.2, -216.9], b: [-1435.8, -185.5], fondo: 9, casas: [[16, 6.6, '#e8d8bc', { tienda: true }], [16, 6.6, CR]] },
  // Viriato (cortada delante de Magec)
  { a: [-1461, -19.2], b: [-1464.4, -43], fondo: 9, casas: [[24, 6.6, '#e2c8b0']] },
  { a: [-1497.1, -153.1], b: [-1518.3, -253.7], fondo: 9, casas: [
    [12, 6.6, B], [12, 4.0, B2], [12, 6.6, B], [12, 6.6, BE], [12, 4.0, B], [12, 6.6, B2], [12, 4.0, B], [19, 6.6, B]] },
];

export function tuneCalles(map) {
  aceras(map, ACERAS);
  map.sfjCalles = true;
}
