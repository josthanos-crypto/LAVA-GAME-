import { aceras } from '../altavista/kitCalles.js';

/**
 * El norte de Titerroy (Paraguay, Tegala, Tenique, Tebete, El Rafael, Luis Braille, Ciudad Real, Madrid y la punta de
 * José Pereyra Galviaty), con las vistas de la calle de Google (solo se miran): las naves blancas y beis de zócalo
 * gris de Paraguay y Tegala, los bloques blancos de tres plantas con jardín de Luis Braille, la fila larga de Tegala
 * (blancas, de granito, rosas, beis) y casas terreras blancas con garaje. Casas de a hacia b.
 */

const B = '#f1eee7', B2 = '#ece8e0', BE = '#e6cfa8', NAVE = '#e9e7e2', GR = '#9a9e9e', OS = '#5d6064';

const fila = (n, alto = 6.6, ancho = 10) => Array.from({ length: n }, (_, i) => [ancho, alto, i % 2 ? B2 : B]);

const ACERAS = [
  // Paraguay
  { a: [-634.7, -1273.8], b: [-558.7, -1307.4], fondo: 9, casas: [[20, 4.0, B], [20, 4.0, B2], [10, 4.0, B], [10, 5.0, NAVE], [23, 5.0, NAVE]] },
  { a: [-534.2, -1271.7], b: [-553.7, -1298.4], fondo: 9, casas: [[17, 6.6, '#efe2c8'], [16, 6.6, '#efe2c8']] },
  // Tebete y El Rafael
  { a: [-637, -1196.5], b: [-651.5, -1217.9], fondo: 9, casas: [[26, 6.6, BE]] },
  { a: [-643.9, -1072.7], b: [-579.9, -1119.5], fondo: 9, casas: fila(8) },
  // Luis Braille: los bloques de tres plantas con jardín
  { a: [-730.6, -1150.2], b: [-756.2, -1131.5], fondo: 9, casas: [[16, 9.2, B], [16, 9.2, B2]] },
  { a: [-762, -1126.9], b: [-820.6, -1082.8], fondo: 9, casas: fila(7, 9.2, 10.4) },
  { a: [-826.7, -1077.4], b: [-852.6, -1058.5], fondo: 9, casas: [[16, 9.2, B], [16, 9.2, B2]] },
  { a: [-770.7, -1108], b: [-832.6, -1060.7], fondo: 9, casas: [
    [10, 6.6, '#c8946a'], [10, 4.0, B], [10, 6.6, B2], [10, 4.0, '#e4ddd0'], [10, 6.6, B], [10, 6.6, B2], [10, 6.6, B], [8, 4.0, B2]] },
  // Ciudad Real y Madrid
  { a: [-820.4, -1035.9], b: [-740.4, -1087.6], fondo: 9, casas: [[15, 6.6, B], [15, 4.0, B2], [15, 6.6, B], [15, 4.0, B], [15, 9.2, B2], [12, 6.6, B], [8, 0, B]] },
  { a: [-726.1, -1034.7], b: [-745.9, -1072.2], fondo: 9, casas: [[14, 4.0, B], [14, 4.0, '#d8d8d6'], [14, 6.6, B2]] },
  { a: [-735.2, -1029.4], b: [-752.7, -1063.3], fondo: 9, casas: [[19, 6.6, B], [19, 6.6, B2]] },
  // Tegala
  { a: [-558.7, -1307.4], b: [-620.5, -1256.5], fondo: 9, casas: [[30, 5.0, NAVE], [10, 6.6, B], [10, 6.6, '#d8c8b0'], [30, 5.5, '#d8c8b0']] },
  { a: [-553.7, -1298.4], b: [-651.5, -1217.9], fondo: 9, casas: [
    [8, 9.2, BE], [10, 6.6, BE], [10, 6.6, OS], [10, 6.6, B], [10, 6.6, B2], [10, 6.6, GR], [10, 6.6, B], [10, 4.0, '#e8c0a0'],
    [10, 4.0, '#b88a68'], [10, 6.6, B], [10, 6.6, B2, { tienda: true }], [10, 6.6, '#c8b8a8'], [9, 9.2, BE]] },
  // José Pereyra Galviaty (la punta norte)
  { a: [-669.8, -1106.6], b: [-725, -1182.2], fondo: 9, casas: [
    [8, 6.6, B, { tienda: true }], [8, 4.0, B2], [6, 0, B], [10, 4.0, B], [10, 4.0, OS], [10, 6.6, '#d8c4a0'], [10, 6.6, GR],
    [10, 6.6, '#c8b8a8'], [12, 4.0, '#e4ddd0'], [10, 4.0, B]] },
];

export function tuneNorte(map) {
  aceras(map, ACERAS);
  map.titerroyNorte = true;
}
