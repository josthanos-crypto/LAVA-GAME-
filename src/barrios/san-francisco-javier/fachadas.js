import { aceras } from '../altavista/kitCalles.js';

/**
 * (Version 173) San Francisco Javier, los tramos que seguían genéricos: José Hernández Almeida (los adosados crema y
 * salmón y el bloque largo de zócalo gris), Juana de Arco, Alfonso XIII, Enrique IV, Pizarro, El Cid Campeador,
 * Cardenal Cisneros, Juan II y Gregorio Medina Armas. Casas blancas de una y dos plantas, alguna melocotón, crema o
 * tostada, obras de bloque sin enlucir y los solares que hacen de aparcamiento.
 * Hecho con la segunda pasada de capturas de Look Around (26-11-2026, PC de casa, carpeta «Lava Game\recursos lava
 * game 2026-11-25 web casa fachadas», barrio argana_baja: tres fotos por paso, de frente y a los dos lados, con la
 * coordenada de cada paso). Solo se miran; no van dentro del juego. Cada tramo es una tirada de pasos seguidos que
 * daban a un bloque genérico del mapa: el kit de aceras recorta ese bloque y levanta las casas en el orden de las fotos.
 * La coordenada de cada paso baila unos metros, así que el sitio de cada casa a lo largo de la calle es aproximado, y
 * los anchos salen de repartir el tramo entre los pasos (a ojo). Alto 0 = solar. Casas de a hacia b.
 */

const B = '#f1eee7';

const ACERAS = [
  // Jose Hernandez Almeida, izquierda, pasos 2-6
  { a: [-1759.5, 72.6], b: [-1690.6, 62.5], fondo: 9, casas: [
    [12.5, 6.6, '#ecdcc0'], [10.1, 6.6, '#e9b99c'], [14.5, 6.6, '#e9b99c'], [8.9, 6.6, '#ecdcc0'], [8.9, 6.6, '#ecdcc0'], [14.7, 6.6, '#efe6c8']] },
  // Jose Hernandez Almeida, izquierda, pasos 8-12
  { a: [-1679.7, 60.1], b: [-1615.2, 50.6], fondo: 9, casas: [
    [11.1, 9.4, '#e6d5c2'], [11.1, 9.4, '#e6d5c2'], [13.2, 9.4, '#e6d5c2'], [6.8, 9.4, '#e6d5c2'], [10.4, 9.4, '#e6d5c2'], [12.6, 9.4, '#e6d5c2']] },
  // Juana de Arco, izquierda, pasos 1-2
  { a: [-1380.7, -103.9], b: [-1412.5, -94.5], fondo: 9, casas: [
    [11.6, 6.6, '#f1eee7'], [10.8, 6.6, '#f1eee7'], [10.8, 6.6, '#ece8e0']] },
  // Juana de Arco, izquierda, pasos 5-6
  { a: [-1458.8, -84.1], b: [-1469.6, -80.7], fondo: 9, casas: [
    [5, 4.0, '#9d9890'], [10.7, 4.0, '#9d9890']] },
  // Juana de Arco, derecha, pasos 4-5
  { a: [-1448.3, -97.9], b: [-1465.8, -92.3], fondo: 9, casas: [
    [5.6, 6.6, '#e2cfc4'], [12.8, 4.0, '#f1eee7']] },
  // Alfonso XIII, izquierda, paso 18
  { a: [-1408.7, -80.0], b: [-1406.4, -71.3], fondo: 9, casas: [
    [9, 6.6, '#f1eee7']] },
  // Alfonso XIII, derecha, paso 2
  { a: [-1514.2, -441.7], b: [-1511.4, -431.1], fondo: 9, casas: [
    [10.9, 0, B, { fondo: 18 }]] },
  // Alfonso XIII, derecha, pasos 3-4
  { a: [-1508.9, -422.1], b: [-1501.1, -392.3], fondo: 9, casas: [
    [7.9, 4.0, '#f1eee7'], [7.9, 4.0, '#ece8e0'], [7.5, 4.0, '#f1eee7'], [7.5, 4.0, '#ece8e0']] },
  // Alfonso XIII, derecha, pasos 13-14
  { a: [-1460.9, -240.6], b: [-1458.8, -232.4], fondo: 9, casas: [
    [5, 6.6, '#cdb892'], [8.1, 4.0, '#e6e6e6']] },
  // Alfonso XIII, derecha, paso 15
  { a: [-1451.4, -204.8], b: [-1449.2, -196.3], fondo: 9, casas: [
    [8.8, 0, B, { fondo: 22 }]] },
  // Alfonso XIII, derecha, paso 18
  { a: [-1418.9, -77.1], b: [-1416.6, -68.8], fondo: 9, casas: [
    [8.5, 4.0, '#efe2b8']] },
  // Alfonso XIII, derecha, pasos 22-24
  { a: [-1401.6, -7.4], b: [-1397.8, 7.0], fondo: 9, casas: [
    [7.4, 4.0, '#f1eee7'], [6.7, 6.6, '#f1eee7'], [5, 0, B, { fondo: 18 }]] },
  // Enrique IV, izquierda, pasos 1-3
  { a: [-1465.0, -252.8], b: [-1505.9, -246.0], fondo: 9, casas: [
    [10.6, 6.6, '#dfb497'], [10.6, 6.6, '#dfb497'], [9.7, 6.6, '#dfb497'], [10.5, 4.0, '#f1eee7']] },
  // Enrique IV, izquierda, pasos 5-6
  { a: [-1528.1, -242.4], b: [-1543.8, -239.8], fondo: 9, casas: [
    [3.8, 4.0, '#f1eee7'], [3.8, 6.6, '#eee2b0'], [8.4, 6.6, '#eee2b0']] },
  // Enrique IV, izquierda, paso 10
  { a: [-1589.3, -232.2], b: [-1598.3, -230.8], fondo: 9, casas: [
    [9.1, 6.6, '#d9c2a2']] },
  // Enrique IV, izquierda, paso 13
  { a: [-1614.7, -228.1], b: [-1630.4, -225.5], fondo: 9, casas: [
    [7.9, 6.6, '#dcbf9e'], [7.9, 6.6, '#dcbf9e']] },
  // Enrique IV, izquierda, paso 20
  { a: [-1735.9, -208.1], b: [-1743.7, -206.8], fondo: 9, casas: [
    [4, 0, B, { fondo: 18 }], [4, 4.0, '#6a6c70']] },
  // Enrique IV, derecha, pasos 1-3
  { a: [-1467.4, -263.1], b: [-1508.8, -256.2], fondo: 9, casas: [
    [10.3, 4.0, '#efe2b4'], [10.3, 4.0, '#efe2b4'], [9.7, 6.6, '#d9b9a0'], [11.7, 6.6, '#d6d1c8']] },
  // Enrique IV, derecha, paso 13
  { a: [-1616.9, -236.8], b: [-1636.5, -233.6], fondo: 9, casas: [
    [9.9, 6.6, '#d8c0ae'], [9.9, 6.6, '#d8c0ae']] },
  // Pizarro, izquierda, paso 1
  { a: [-1513.9, -441.1], b: [-1545.0, -434.6], fondo: 9, casas: [
    [10.6, 6.6, '#f1eee7'], [10.6, 6.6, '#ece8e0'], [10.6, 6.6, '#f1eee7']] },
  // Pizarro, izquierda, paso 3
  { a: [-1553.3, -431.6], b: [-1573.4, -427.5], fondo: 9, casas: [
    [10.2, 6.6, '#f1eee7'], [10.2, 6.6, '#ece8e0']] },
  // Pizarro, izquierda, pasos 6-8
  { a: [-1599.7, -423.1], b: [-1632.3, -416.4], fondo: 9, casas: [
    [7.6, 4.0, '#e6dcc0'], [6.2, 4.0, '#e6dcc0'], [6.2, 6.6, '#f1eee7'], [13.3, 6.6, '#f1eee7']] },
  // Pizarro, izquierda, paso 10
  { a: [-1651.9, -412.5], b: [-1672.6, -408.3], fondo: 9, casas: [
    [10.6, 4.0, '#f1eee7'], [10.6, 4.0, '#ece8e0']] },
  // el Cid Campeador, derecha, pasos 5-7
  { a: [-1691.3, -11.8], b: [-1643.9, -18.1], fondo: 9, casas: [
    [14.1, 6.6, '#f1eee7'], [8.7, 6.6, '#f1eee7'], [8.7, 6.6, '#ece8e0'], [8.2, 6.6, '#f1eee7'], [8.2, 6.6, '#ece8e0']] },
  // Cardenal Cisneros, derecha, pasos 10-11
  { a: [-1536.9, -202.2], b: [-1519.1, -206.3], fondo: 9, casas: [
    [11.5, 0, B, { fondo: 30 }], [6.8, 4.0, '#f1eee7']] },
  // Juan II, derecha, paso 2
  { a: [-1690.6, -404.6], b: [-1687.6, -384.2], fondo: 9, casas: [
    [20.6, 0, B, { fondo: 26 }]] },
  // Gregorio Medina Armas, derecha, paso 8
  { a: [-1579.4, -306.3], b: [-1577.5, -295.6], fondo: 9, casas: [
    [10.9, 4.0, '#f1eee7']] },
];

export function tuneFachadasSfj(map) {
  aceras(map, ACERAS);
  map.fachadasSfj = ACERAS.length;
}
