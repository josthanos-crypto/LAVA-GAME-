import { aceras } from './kitCalles.js';

/**
 * Altavista, los tramos que seguían genéricos porque no había vistas de Google, hechos con las capturas de Look Around
 * del 24-11-2026 (PC de casa, carpeta «recursos lava game 2026-11-24 web casa», barrio altavista; solo se miran, no
 * van dentro del juego). Cada calle tiene 8 capturas seguidas mirando a lo largo de la calle, así que el orden de las
 * casas es el de las fotos pero los anchos van a ojo. Casas de a hacia b.
 *
 * - Arniches, la mitad de abajo (de media calle a la esquina con Filipinas; capturas 2593-2600): casas terreras
 *   blancas con portones verdes y marrones, un garaje de bloque sin pintar, dos casas de dos plantas, un solar vallado
 *   y el solar de tierra de la esquina donde aparcan.
 * - Filipinas, las cuatro casas de dos plantas que cierran Arniches (la del balcón de madera y la del bajo de tienda).
 * - Almería, la punta de arriba hasta el parque (2569-2576): casas de dos plantas blancas, melocotón y amarilla de
 *   carpintería verde, una terrera beis y un muro de bloque.
 * - Guasia, de la esquina del descampado a la fila beis que ya estaba (2513-2516 y 2665-2672): la casa blanca de
 *   balcones amarillos, el muro blanco largo, los dos garajes de bloque de portón rojo y verde y la casa crema de la
 *   esquina.
 * - (Version 172) Tornajo, del cruce con Régulo a Mosta (calle_tornajo 2457-2464): toda la urbanización es de casas
 *   blancas de dos plantas con carpintería verde; las cuatro manzanas genéricas que dan a la calle salían rosadas y
 *   de alturas distintas, y ahora salen blancas y de dos plantas (no se recortan: solo cambian color y altura).
 */

const B = '#f1eee7', B2 = '#ece8e0', BLOQUE = '#9d9890';

const ACERAS = [
  // Arniches, acera norte (de la esquina de Filipinas hacia media calle)
  { a: [-31.6, -1104.1], b: [25.1, -1129.2], fondo: 9, casas: [
    [8, 0, B, { fondo: 16 }], [10, 6.6, B], [6, 0, B], [10, 6.6, '#efe9e2'], [9, 4.0, B2], [9, 4.0, B], [10, 4.0, B2]] },
  // Arniches, acera sur
  { a: [-43.3, -1089.0], b: [29.8, -1121.4], fondo: 9, casas: [
    [9, 3.6, B], [10, 4.0, B2], [9, 4.0, B], [8, 4.2, BLOQUE], [7, 4.0, B], [10, 4.0, B2], [9, 4.0, B], [9, 4.0, B2],
    [9, 4.0, B]] },
  // Filipinas, lo que se ve al fondo de Arniches (de norte a sur)
  { a: [-73.5, -1109.8], b: [-59.0, -1074.0], fondo: 9, casas: [
    [8, 6.6, B], [9, 6.6, B2], [10, 6.6, B], [11, 6.6, B2, { tienda: true }]] },
  // Almería, la punta de arriba: acera norte y acera sur (hacia el parque)
  { a: [31.4, -1236.8], b: [68.5, -1253.5], fondo: 9, casas: [
    [8, 6.6, B], [8, 4.0, '#e3cfae'], [12, 6.6, '#e8c49c'], [6, 6.6, '#efe0b4'], [7, 6.6, B]] },
  { a: [35.4, -1229.2], b: [70.8, -1245.1], fondo: 9, casas: [
    [7, 3.4, BLOQUE], [9, 6.6, '#efdf9c'], [7, 6.6, '#e9e5dd'], [6, 6.6, '#c9a08a'], [7, 9.4, B], [6, 6.6, '#e6c3a0']] },
  // Guasia, acera norte: la manzana del descampado y la de la esquina
  { a: [-63.9, -1396.8], b: [-24.5, -1389.6], fondo: 9, casas: [
    [5, 6.0, '#8f8b84'], [16, 6.6, '#f3ecd2'], [10, 4.0, B], [9, 4.0, B2]] },
  { a: [-13.3, -1387.7], b: [25.9, -1380.4], fondo: 9, casas: [
    [13, 5.0, B], [9, 4.2, BLOQUE], [8, 4.6, BLOQUE], [10, 6.6, '#f0ebd8']] },
];

// un punto de dentro de cada manzana de Tornajo que pasa a blanca de dos plantas
const BLANCAS = [[318, -1850], [307, -1817], [306, -1781], [336, -1772]];

function dentro(p, x, z) {
  let c = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, zi] = p[i], [xj, zj] = p[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
}

export function tuneLookAround(map) {
  aceras(map, ACERAS);
  let blancas = 0;
  for (const [x, z] of BLANCAS) {
    for (const b of map.buildings || []) {
      if (!Array.isArray(b.p) || b.skip || b.ownFront || b.ownRoof || b.edificioReal || !dentro(b.p, x, z)) continue;
      b.h = 6.6;
      b.f = [241, 238, 231];
      blancas++;
    }
  }
  map.altavistaTornajoBlancas = blancas;
  map.altavistaLookAround = true;
}
