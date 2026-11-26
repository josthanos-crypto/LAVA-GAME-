import { aceras } from '../altavista/kitCalles.js';

/**
 * (Version 173) Argana Alta, la esquina de abajo que seguía genérica: Liria, Alfonso X el Sabio, Mararía, Alfonso XII,
 * Rivera y Jesús Soto Morales. Casas terreras blancas con garaje verde, las de dos plantas beis, tostadas y ocre de
 * Liria, la casa coral de Alfonso XII, la gris de Alfonso X y los solares de tierra donde se aparca.
 * Hecho con la segunda pasada de capturas de Look Around (26-11-2026, PC de casa, carpeta «Lava Game\recursos lava
 * game 2026-11-25 web casa fachadas», barrio argana_baja: tres fotos por paso, de frente y a los dos lados, con la
 * coordenada de cada paso). Solo se miran; no van dentro del juego. Cada tramo es una tirada de pasos seguidos que
 * daban a un bloque genérico del mapa: el kit de aceras recorta ese bloque y levanta las casas en el orden de las fotos.
 * La coordenada de cada paso baila unos metros, así que el sitio de cada casa a lo largo de la calle es aproximado, y
 * los anchos salen de repartir el tramo entre los pasos (a ojo). Alto 0 = solar. Casas de a hacia b.
 */

const B = '#f1eee7';

const ACERAS = [
  // Liria, izquierda, pasos 1-3
  { a: [-1656.0, -792.0], b: [-1717.9, -828.5], fondo: 9, casas: [
    [11.4, 6.6, '#e6d3b8'], [11.4, 6.6, '#e6d3b8'], [11.3, 6.6, '#e4c4ae'], [11.3, 6.6, '#e4c4ae'], [8.8, 6.6, '#f1eee7'], [8.8, 6.6, '#ece8e0'], [8.8, 6.6, '#f1eee7']] },
  // Liria, izquierda, pasos 5-9
  { a: [-1725.2, -832.6], b: [-1761.8, -853.7], fondo: 9, casas: [
    [10.5, 6.6, '#d8b870'], [7.8, 4.0, '#dcc0b8'], [8.2, 4.0, '#f1eee7'], [7.8, 4.0, '#ece8e0'], [8, 4.0, '#f1eee7']] },
  // Liria, derecha, pasos 1-3
  { a: [-1678.4, -815.3], b: [-1713.9, -836.2], fondo: 9, casas: [
    [5, 4.0, '#efe6c8'], [22.6, 0, B, { fondo: 18 }], [8.9, 4.0, '#efe6c8'], [8.9, 4.0, '#efe6c8'], [8.9, 4.0, '#efe6c8']] },
  // Liria, derecha, pasos 5-10
  { a: [-1720.3, -841.3], b: [-1757.8, -862.8], fondo: 9, casas: [
    [10.4, 4.0, '#f1eee7'], [7.8, 4.0, '#ece8e0'], [8.2, 4.0, '#f1eee7'], [7.8, 4.0, '#ece8e0'], [14.2, 4.0, '#f1eee7'], [5, 6.6, '#f1eee7']] },
  // Alfonso X el Sabio, izquierda, pasos 1-5
  { a: [-1762.8, -910.1], b: [-1718.6, -883.6], fondo: 9, casas: [
    [10, 4.0, '#f1eee7'], [10, 4.0, '#ece8e0'], [14.9, 4.0, '#ece8e0'], [11.3, 6.6, '#d9b996'], [5, 6.6, '#d9b996'], [5, 6.6, '#d9b996']] },
  // Alfonso X el Sabio, derecha, pasos 1-5
  { a: [-1769.4, -904.1], b: [-1721.9, -875.6], fondo: 9, casas: [
    [11.3, 4.0, '#f1eee7'], [11.3, 4.0, '#ece8e0'], [14.9, 6.6, '#f1eee7'], [11.3, 6.6, '#ece8e0'], [5, 6.6, '#8f9296'], [5, 0, B, { fondo: 18 }]] },
  // Mararia, izquierda, paso 3
  { a: [-1763.5, -823.5], b: [-1752.9, -817.8], fondo: 9, casas: [
    [12, 6.6, '#f1eee7']] },
  // Mararia, izquierda, pasos 4-6
  { a: [-1730.8, -806.7], b: [-1678.7, -778.1], fondo: 9, casas: [
    [9.2, 6.6, '#efe6dc'], [9.2, 6.6, '#efe6dc'], [8.1, 6.6, '#f1eee7'], [8.1, 6.6, '#ece8e0'], [12.5, 0, B, { fondo: 18 }], [12.5, 6.6, '#e3d6c6']] },
  // Mararia, derecha, pasos 5-7
  { a: [-1718.0, -783.8], b: [-1696.1, -769.1], fondo: 9, casas: [
    [12.3, 6.6, '#c9c6c0'], [9.5, 6.6, '#f1eee7'], [5, 6.6, '#ece8e0']] },
  // Alfonso XII, izquierda, pasos 2-4
  { a: [-1645.7, -796.0], b: [-1634.3, -801.8], fondo: 9, casas: [
    [5, 6.6, '#dd7d70'], [8.6, 6.6, '#dd7d70'], [8.6, 6.6, '#dd7d70'], [5, 6.6, '#f1eee7']] },
  // Alfonso XII, derecha, pasos 2-3
  { a: [-1651.7, -781.5], b: [-1623.1, -796.0], fondo: 9, casas: [
    [13.7, 4.0, '#f1eee7'], [9.2, 4.0, '#f1eee7'], [9.2, 4.0, '#ece8e0']] },
  // Rivera, izquierda, pasos 1-3
  { a: [-1586.8, -1027.1], b: [-1565.7, -1011.6], fondo: 9, casas: [
    [9, 4.0, '#ece6d0'], [7.6, 6.6, '#9a9a98'], [9.6, 0, B, { fondo: 18 }]] },
  // Jesús Soto Morales, izquierda, pasos 2-3
  { a: [-1756.3, -1019.2], b: [-1733.1, -1002.6], fondo: 9, casas: [
    [7.9, 4.0, '#f1eee7'], [7.9, 4.0, '#ece8e0'], [12.8, 4.0, '#e2b79a']] },
  // Jesús Soto Morales, derecha, paso 3
  { a: [-1748.9, -1004.2], b: [-1730.1, -990.6], fondo: 9, casas: [
    [11.6, 6.6, '#f1eee7'], [11.6, 6.6, '#ece8e0']] },
];

export function tuneFachadasArgana(map) {
  aceras(map, ACERAS);
  map.fachadasArgana = ACERAS.length;
}
