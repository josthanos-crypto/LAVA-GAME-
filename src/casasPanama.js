import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alzarEdificio, alturaBloque, rebajarTramo, medianera } from './edificioReal.js';
import { casa } from './casasTampico.js';

/**
 * La acera de enfrente de las casas de Tampico (src/casasTampico.js): la manzana entre Panamá, Tampico, Venezuela y
 * Santa Teresa de Jesús, con la foto aérea y las vistas de la calle de Google de julio de 2025 (solo se miran, no van
 * dentro del juego; la gente no se pone). El mapa la tenía entera como un bloque gris de 12,4 m; de verdad es una
 * fila de casas de una a cinco plantas: el bloque baja a 7 m y cada casa de Panamá y Tampico va a su altura, con su
 * fachada (la misma manera de hacerlas que en las de enfrente). Por Tampico, las casas color crema con los balcones
 * de madera oscura y de balaustres, y la del portón blanco en arco; en la esquina, la casa crema de cuatro plantas; por
 * Panamá, el solar de tierra con su muro blanco (que en la foto aérea llega hasta Santa Teresa), la casa terrera de
 * la puerta verde y las contraventanas verdes, y más allá el edificio color salmón de cinco plantas con el bajo de
 * granito gris y las ventanas grandes.
 */

// las dos caras del bloque, con N hacia la calle: Panamá de la esquina de Tampico (s 0) hacia el oeste, y Tampico
// de la esquina de Venezuela (s 0) hacia la de Panamá
const C = [-848.89, -292.2], O = [-908.69, -267.51], E = [-818.71, -283.59];
const PAN = marco(C, O), TAM = marco(E, C);
const Z = 0.12, ZF = Z + 0.3, FONDO = 10, BASE = 7.0, CREMA = 0xf0e4c4, BLANCO = 0xf2f2ee, SALMON = 0xd8b090;
const SOLAR0 = 6, SOLAR1 = 13, TERRERA0 = 20, TERRERA1 = 32;
// [s0, s1, altura, plantas, color, barandilla, bajo]
const CASAS_TAM = [[0, 7, 9.6, 3, BLANCO, 'marron', 'puerta'], [7, 14, 12.6, 4, CREMA, 'marron', 'garaje-blanco'],
  [14, 21, 13.0, 4, 0xeee0c0, 'marron', 'portal'], [21, 27, 7.0, 2, 0xf0e0b8, 'blanca', 'garaje-blanco'], [27, 31.4, 7.0, 2, 0xf0e0b8, 'blanca', 'puerta']];
const CASAS_PAN = [[0, SOLAR0, 13.0, 4, CREMA, 'marron', 'portal'], [SOLAR1, TERRERA0, 7.0, 2, BLANCO, 'verde', 'garaje-verde'],
  [TERRERA0, TERRERA1, 4.2, 1, BLANCO, 'ninguna', 'puerta'], [32, 40, 7.0, 2, BLANCO, 'blanca', 'garaje-madera'], [40, 46, 9.6, 3, BLANCO, 'blanca', 'puerta'],
  [46, 56, 15.5, 5, SALMON, 'salmon', 'local'], [56, PAN.len, 9.6, 3, BLANCO, 'blanca', 'garaje-blanco']];

/** antes de levantar la ciudad: el bloque a 7 m, el solar y la casa terrera metidos, y las casas altas levantadas */
export function tuneCasasPanama(map) {
  if (!Array.isArray(map?.buildings)) return;
  const p = PAN.W(30, -10);
  if (!alturaBloque(map, p[0], p[1], BASE, [238, 232, 220])) return;
  map.casasPanama = true;
  // el solar, metido hasta el fondo de la manzana, y luego la casa terrera en lo que queda de la cara
  rebajarTramo(map, PAN, SOLAR0, SOLAR1, 22, 0.1, undefined, [156, 138, 112]);
  rebajarTramo(map, marco(PAN.W(SOLAR1, 0), O), TERRERA0 - SOLAR1, TERRERA1 - SOLAR1, 9, 4.2, undefined, [242, 242, 238]);
  for (const [M, casas] of [[PAN, CASAS_PAN], [TAM, CASAS_TAM]]) {
    for (const [s0, s1, h, , color] of casas) if (h > BASE) alzarEdificio(map, M, s0, s1, FONDO, h, [(color >> 16) & 255, (color >> 8) & 255, color & 255]);
  }
}

/** el muro blanco del solar con su puerta de chapa, la tierra y las paredes lisas de los lados */
function solar(k) {
  const c = (SOLAR0 + SOLAR1) / 2, L = SOLAR1 - SOLAR0;
  k.box(c, 0, Z + 0.12, L, 2.6, 0.24, 0xeceae2);
  k.block(c, Z + 0.12, L, 0.24);
  k.box(c + 1.5, 0, Z + 0.25, 2.2, 2.2, 0.03, 0x6a6c6e);
  k.box(c, 0, Z - 11, L, 0.05, 22, 0x9c8a70);
  for (const [s, z, w] of [[8, -5, 0.6], [11, -12, 0.9], [9.5, -18, 0.5]]) k.box(s, 0, z, w, w * 0.4, w, 0xa8a094);
  medianera(k, SOLAR0 + 0.07, 0, 13.0, 22, Z, 0xeae4d4);
  medianera(k, SOLAR1 - 0.07, 0, BASE, 22, Z, 0xeae4d4);
}

/** una fila de casas en su cara, con las paredes lisas que asoman por encima de las de al lado */
function fila(k, casas, n0) {
  casas.forEach(([s0, s1, h, plantas, color, baranda, bajo], j) => {
    casa(k, s0, s1, h, plantas, color, baranda, bajo, n0 + j);
    const prev = casas[j - 1], next = casas[j + 1];
    if (prev && prev[1] === s0 && prev[2] < h) medianera(k, s0 - 0.07, Math.max(prev[2], BASE), h, FONDO, Z, 0xe8e2d4);
    if (next && next[0] === s1 && next[2] < h) medianera(k, s1 + 0.07, Math.max(next[2], BASE), h, FONDO, Z, 0xe8e2d4);
    if (h > BASE) k.box((s0 + s1) / 2, BASE, -FONDO - 0.07, s1 - s0, h - BASE, 0.12, 0xe8e2d4);
  });
}

/** se monta con lo demás de Arrecife Centro */
export function buildCasasPanama(scene, colliders, map) {
  if (!map?.casasPanama) return null;
  const kp = new Kit();
  fila(kp, CASAS_PAN, 3);
  solar(kp);
  // la casa terrera de la puerta verde: las contraventanas verdes y la pared de detrás que asoma
  kp.box(26, 0, ZF + 0.01, 2.2, 1.3, 0.04, 0x2a6a46);
  kp.box(29.5, 0.9, ZF + 0.02, 1.6, 1.4, 0.04, 0x2a7a4a);
  kp.box((TERRERA0 + TERRERA1) / 2, 4.2, -9.07, TERRERA1 - TERRERA0, BASE - 4.2, 0.12, 0xece6d8);
  const gp = enMarco(kp, PAN, 'casasPanama', colliders);
  scene.add(gp);
  const kt = new Kit();
  fila(kt, CASAS_TAM, 11);
  const gt = enMarco(kt, TAM, 'casasPanamaTampico', colliders);
  scene.add(gt);
  return { group: gp, tampico: gt };
}
