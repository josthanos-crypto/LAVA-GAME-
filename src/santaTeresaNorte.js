import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alzarEdificio, alturaBloque, rebajarTramo, medianera } from './edificioReal.js';
import { casa } from './casasTampico.js';

/**
 * La acera norte de la calle Santa Teresa de Jesús, enfrente de las terreras (src/calleSantaTeresa.js), con las vistas
 * de la calle de Google de julio de 2025 (solo se miran, no van dentro del juego; la gente no se pone). El mapa la
 * tenía como un bloque gris de 12,4 m; de verdad es una fila de casas de una a cinco plantas: el bloque baja a 7 m,
 * las altas se levantan y las bajas se meten. De la esquina de Venezuela hacia el oeste: la casa blanca de cuatro
 * plantas con los balcones de cristal y el zócalo negro, la de los balcones verdes, la blanca de cuatro plantas con
 * los balcones de hierro negro y el bajo de granito, la Lavandería Autoservicio (un muro blanco bajo con su letrero,
 * los apliques y el cartel de se vende), las casas de dos plantas con las ventanas verdes, la casa terrera vieja con la
 * pared manchada de humedad, las ventanas tapiadas y la puerta de chapa marrón, el edificio de cinco plantas color
 * salmón con el bajo de granito, más casas, el edificio color beis de cuatro plantas y, en la esquina, el solar con el
 * muro blanco y el portón de tablas.
 */

// la cara de Santa Teresa del bloque, de la esquina de Venezuela (s 0) hacia el oeste, N hacia la calle
const E = [-822.05, -249.79], O = [-952.42, -263.5];
const SN = marco(E, O);
const Z = 0.12, ZF = Z + 0.3, BASE = 7.0, FONDO = 10, BLANCO = 0xf2f2ee;
// [s0, s1, altura, plantas, color, barandilla, bajo]; las de menos de 7 m se meten en el bloque
const CASAS = [
  [0, 7, 12.6, 4, BLANCO, 'cristal', 'puerta'], [7, 14, 9.6, 3, BLANCO, 'verde', 'puerta'], [14, 25, 12.6, 4, BLANCO, 'marron', 'local'],
  [25, 33, 3.2, 1, BLANCO, 'ninguna', 'lavanderia'], [33, 45, 7.0, 2, BLANCO, 'verde', 'garaje-verde'], [45, 58, 4.4, 1, 0xe8e4dc, 'ninguna', 'vieja'],
  [58, 66, 7.0, 2, BLANCO, 'verde', 'puerta'], [66, 80, 15.5, 5, 0xd8b090, 'cristal', 'local'], [80, 90, 9.6, 3, BLANCO, 'marron', 'garaje-madera'],
  [90, 100, 7.0, 2, 0xf0eee6, 'blanca', 'puerta'], [100, 118, 12.6, 4, 0xe0c8a0, 'blanca', 'garaje-blanco'], [118, SN.len, 2.4, 1, 0xeceae4, 'ninguna', 'solar'],
];

/** antes de levantar la ciudad: el bloque a 7 m, las casas bajas metidas y las altas levantadas */
export function tuneSantaTeresaNorte(map) {
  if (!Array.isArray(map?.buildings)) return;
  const p = SN.W(60, -12);
  if (!alturaBloque(map, p[0], p[1], BASE, [238, 234, 226])) return;
  map.santaTeresaNorte = true;
  // las muescas de las casas bajas, una detrás de otra por lo que va quedando de la cara
  let desde = 0;
  for (const [s0, s1, h, , color] of CASAS) {
    if (h >= BASE) continue;
    const M = marco(SN.W(desde, 0), O);
    const col = [(color >> 16) & 255, (color >> 8) & 255, color & 255];
    if (rebajarTramo(map, M, s0 - desde, s1 - desde, h < 3 ? 14 : 9, h < 3 ? 0.1 : h, undefined, h < 3 ? [156, 138, 112] : col)) desde = s1;
  }
  for (const [s0, s1, h, , color] of CASAS) if (h > BASE) alzarEdificio(map, SN, s0, s1, FONDO, h, [(color >> 16) & 255, (color >> 8) & 255, color & 255]);
}

// ——— lo que se pinta en lienzo ———

/** el letrero blanco de «LAVANDERÍA AUTOSERVICIO» en letras azules */
function letreroLavanderia(g, w, h) {
  g.fillStyle = '#f4f4f2';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#9aa8c0';
  g.lineWidth = 3;
  g.strokeRect(2, 2, w - 4, h - 4);
  g.fillStyle = '#2a3a7a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 700 ${Math.round(h * 0.5)}px Arial, sans-serif`;
  g.fillText('LAVANDERÍA AUTOSERVICIO', w / 2, h * 0.55, w * 0.94);
}

/** la pared vieja manchada de humedad, con el zócalo azulado desconchado */
function paredVieja(g, w, h) {
  g.fillStyle = '#ece8e0';
  g.fillRect(0, 0, w, h);
  let s = 23;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 9; i++) { g.fillStyle = `rgba(120,112,98,${0.12 + r() * 0.14})`; g.beginPath(); g.ellipse(r() * w, h * (0.25 + r() * 0.2), 20 + r() * 50, 6 + r() * 14, 0, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#a8b4c0';
  g.fillRect(0, h * 0.78, w, h * 0.22);
  for (let i = 0; i < 20; i++) { g.fillStyle = 'rgba(236,232,224,.8)'; g.fillRect(r() * w, h * 0.78 + r() * h * 0.2, 8 + r() * 20, 4 + r() * 8); }
}

/** el portón de tablas del solar */
function porton(g, w, h) {
  g.fillStyle = '#7a4a2a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(40,24,12,.5)';
  for (let x = 6; x < w; x += 9) g.fillRect(x, 0, 2, h);
  g.strokeStyle = '#4a2a18';
  g.lineWidth = 4;
  g.strokeRect(w * 0.35, h * 0.15, w * 0.3, h * 0.82);
}

// ——— las piezas ———

/** la lavandería: el muro blanco bajo con su letrero, los apliques y la puerta */
function lavanderia(k, s0, s1) {
  const c = (s0 + s1) / 2, L = s1 - s0;
  k.box(c, 0, Z + 0.15, L, 3.2, 0.3, BLANCO);
  k.block(c, Z + 0.15, L, 0.3);
  k.box(c, 3.1, ZF + 0.05, L + 0.05, 0.1, 0.1, 0xe4e2dc);
  k.box(c - 0.6, 2.2, ZF + 0.02, 4.2, 0.55, 0.04, 0xf4f4f2);
  k.pic(c - 0.6, 2.475, ZF + 0.041, 4.2, 0.55, 0, 1, canvasTex(420, 56, letreroLavanderia));
  for (const s of [s0 + 1.2, s1 - 1.6]) k.box(s, 2.05, ZF + 0.08, 0.2, 0.14, 0.18, 0x3a3a3c);
  k.box(c + 2.2, 0.9, ZF + 0.02, 0.5, 0.6, 0.02, 0xf0f0ea);
  k.box(c + 1.3, 0, ZF + 0.01, 1.0, 2.2, 0.03, 0x6a6c6e);
}

/** la casa terrera vieja: la pared manchada, las ventanas tapiadas y la puerta de chapa marrón */
function vieja(k, s0, s1) {
  const c = (s0 + s1) / 2, L = s1 - s0;
  k.box(c, 0, Z + 0.15, L, 4.4, 0.3, 0xe8e4dc);
  k.block(c, Z + 0.15, L, 0.3);
  k.pic(c, 2.2, ZF + 0.004, L, 4.4, 0, 1, canvasTex(Math.round(L * 30), 132, paredVieja));
  for (const s of [s0 + 2.5, s1 - 3.0]) k.box(s, 0.9, ZF + 0.01, 1.4, 1.4, 0.02, 0xd8d0c4);
  k.box(c, 0, ZF + 0.012, 1.0, 1.9, 0.02, 0x5a3424);
  k.box(c, 4.2, ZF + 0.05, L, 0.2, 0.1, 0xe0dcd2);
}

/** el solar de la esquina: el muro blanco, el portón de tablas y la tierra */
function solar(k, s0, s1) {
  const c = (s0 + s1) / 2, L = s1 - s0;
  k.box(c, 0, Z + 0.12, L, 2.4, 0.24, 0xeceae4);
  k.block(c, Z + 0.12, L, 0.24);
  k.pic(s1 - 3.5, 1.05, Z + 0.25, 2.4, 2.1, 0, 1, canvasTex(120, 105, porton));
  k.box(c, 0, Z - 7, L, 0.05, 14, 0x9c8a70);
}

/** se monta con lo demás de Arrecife Centro */
export function buildSantaTeresaNorte(scene, colliders, map) {
  if (!map?.santaTeresaNorte) return null;
  const k = new Kit();
  CASAS.forEach(([s0, s1, h, plantas, color, baranda, bajo], j) => {
    if (bajo === 'lavanderia') lavanderia(k, s0, s1);
    else if (bajo === 'vieja') vieja(k, s0, s1);
    else if (bajo === 'solar') solar(k, s0, s1);
    else casa(k, s0, s1, h, plantas, color, baranda, bajo, j);
    // las paredes lisas que asoman por encima de la casa de al lado
    const prev = CASAS[j - 1], next = CASAS[j + 1];
    const tope = h < BASE ? 0 : h;
    if (prev && prev[2] < tope) medianera(k, s0 - 0.07, prev[2], tope, FONDO, Z, 0xe8e4dc);
    if (next && next[2] < tope) medianera(k, s1 + 0.07, next[2], tope, FONDO, Z, 0xe8e4dc);
    if (h > BASE) k.box((s0 + s1) / 2, BASE, -FONDO - 0.07, s1 - s0, h - BASE, 0.12, 0xe8e4dc);
    if (h < BASE && h > 3) k.box((s0 + s1) / 2, h, -9.07, s1 - s0, BASE - h, 0.12, 0xe8e4dc);
  });
  const group = enMarco(k, SN, 'santaTeresaNorte', colliders);
  scene.add(group);
  return { group };
}
