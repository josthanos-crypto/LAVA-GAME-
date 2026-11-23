import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alzarEdificio, cristales, medianera } from './edificioReal.js';

/**
 * Las casas de la calle Tampico y del trozo de Panamá, la otra cara de la manzana de la Rambla Medular 75
 * (src/ramblaMedular75.js), con las vistas de la calle de Google de julio de 2025 (solo se miran, no van dentro del
 * juego; la gente no se pone). Es una fila de casas estrechas blancas pegadas, de dos a cuatro plantas, cada una con
 * su altura (la manzana las tenía todas a 8,2 m), con los balcones corridos de losa blanca y barandilla de madera
 * marrón, verde o blanca, las ventanas de madera, los portones de garaje de madera, verdes o blancos, las puertas de
 * los portales, los cables por la fachada y el zócalo de piedra; en medio, el edificio color salmón de cinco plantas
 * del 22 con sus balcones metidos; en Panamá, la casa blanca de cuatro plantas con los balcones de cristal y el
 * localito del toldo; y en la esquina de Antonio Nieves Santos, la casa del taller de bicis con la banda negra del
 * letrero (sin el dibujo del logotipo) y los portones blancos.
 */

// la acera de la manzana en Panamá y Tampico, de oeste a este (N hacia la calle)
const S = [[-915.94, -276.48], [-852.16, -302.38], [-812.97, -294.42], [-795.0, -290.17]];
const TRAMOS = [marco(S[0], S[1]), marco(S[1], S[2]), marco(S[2], S[3])];
const Z = 0.12, ZF = Z + 0.3, FONDO = 10;
// las casas de cada tramo: [s0, s1, altura, plantas, color, barandilla, bajo]
const CASAS = [
  [[0, 7, 9.6, 3, 0xf2f2ee, 'blanca', 'puerta'], [7, 13, 7.0, 2, 0xf0eee6, 'marron', 'garaje-madera'], [13, 20, 12.6, 4, 0xf4f4f0, 'cristal', 'local'],
    [20, 26, 9.6, 3, 0xf2f2ee, 'blanca', 'garaje-blanco'], [26, 33, 9.6, 3, 0xece8de, 'marron', 'puerta'], [33, 40, 7.0, 2, 0xf2f2ee, 'verde', 'garaje-verde'],
    [40, 47, 9.6, 3, 0xf4f2ec, 'blanca', 'garaje-blanco'], [47, 54, 12.6, 4, 0xf2f2ee, 'cristal', 'puerta'], [54, 60.5, 9.6, 3, 0xeeeae2, 'marron', 'garaje-madera'],
    [60.5, 68.9, 9.6, 3, 0xf2f2ee, 'verde', 'puerta']],
  [[0, 4, 9.6, 3, 0xf2f2ee, 'marron', 'puerta'], [4, 14, 15.5, 5, 0xd8b090, 'salmon', 'portal'], [14, 20, 9.6, 3, 0xf4f4f0, 'blanca', 'garaje-blanco'],
    [20, 26, 9.6, 3, 0xf2f2ee, 'verde', 'garaje-carteles'], [26, 33, 8.4, 2, 0xf0eee8, 'marron', 'garaje-verde'], [33, 40, 7.0, 2, 0xf2f2ee, 'verde', 'puerta']],
  [[0, 5, 7.0, 2, 0xf2f2ee, 'verde', 'garaje-verde'], [5, 11, 9.8, 3, 0xf4f4f0, 'marron', 'garaje-madera'], [11, 18.4, 9.6, 3, 0xf2f2ee, 'ninguna', 'taller']],
];
const BARANDA = { blanca: 0xf0f0ec, marron: 0x5a3a28, verde: 0x2a6a46, cristal: 0x9ab8c0, salmon: 0xc8a080 };

/** antes de levantar la ciudad: cada casa a su altura encima de la manzana */
export function tuneCasasTampico(map) {
  if (!map?.ramblaMedular75) return;
  map.casasTampico = true;
  TRAMOS.forEach((M, i) => {
    for (const [s0, s1, h, , color] of CASAS[i]) {
      if (h <= 8.2) continue;
      alzarEdificio(map, M, s0, s1, FONDO, h, [(color >> 16) & 255, (color >> 8) & 255, color & 255]);
    }
  });
}

// ——— lo que se pinta en lienzo ———

/** un portón de garaje: de tablas de madera, verde con las rejillas, blanco de cuarterones o con carteles */
function porton(tipo) {
  return (g, w, h) => {
    const col = { 'garaje-madera': '#6a3e24', 'garaje-verde': '#1e4a36', 'garaje-blanco': '#ecebe6', 'garaje-carteles': '#f0efea', taller: '#ecebe6' }[tipo];
    g.fillStyle = col;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(0,0,0,.3)';
    g.lineWidth = 3;
    if (tipo === 'garaje-madera') for (let x = 8; x < w; x += 10) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    else for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo((w / 4) * i, 0); g.lineTo((w / 4) * i, h); g.stroke(); }
    g.strokeRect(2, 2, w - 4, h - 4);
    if (tipo === 'garaje-verde') { g.fillStyle = '#7a5a3a'; for (let i = 0; i < 4; i++) for (let y = 0; y < 5; y++) g.fillRect(w * (0.05 + i * 0.25), h * 0.08 + y * 5, w * 0.15, 3); }
    if (tipo === 'garaje-carteles') for (const [x, c] of [[0.2, '#c83a8a'], [0.45, '#3a6ac8'], [0.72, '#2a2a2a']]) { g.fillStyle = c; g.fillRect(w * x, h * 0.25, w * 0.12, h * 0.6); }
    g.lineWidth = 5;
    g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
  };
}

/** la puerta de madera de un portal, con el cristalito de arriba */
function puerta(g, w, h) {
  g.fillStyle = '#5a3420';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#3a4048';
  g.fillRect(w * 0.15, h * 0.06, w * 0.7, h * 0.16);
  g.strokeStyle = '#3a2214';
  g.lineWidth = 4;
  for (const y of [0.3, 0.62]) g.strokeRect(w * 0.15, h * y, w * 0.7, h * 0.26);
}

/** el localito con la persiana metálica medio subida y el cristal */
function localito(g, w, h) {
  g.fillStyle = '#3a4650';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c8c8c4';
  g.fillRect(0, 0, w, h * 0.4);
  g.fillStyle = '#a8a8a4';
  for (let y = 4; y < h * 0.4; y += 6) g.fillRect(0, y, w, 2);
}

/** el zócalo de piedra en lajas de colores */
function lajas(g, w, h) {
  g.fillStyle = '#a89a88';
  g.fillRect(0, 0, w, h);
  let s = 17;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < w * h / 60; i++) {
    const v = 120 + Math.floor(r() * 80);
    g.fillStyle = `rgb(${v},${v - 10},${v - 25})`;
    g.fillRect(r() * w, r() * h, 6 + r() * 10, 4 + r() * 6);
  }
}

// ——— las piezas ———

/** una casa de la fila, de s0 a s1, con sus plantas, balcones y el bajo que le toca */
export function casa(k, s0, s1, h, plantas, color, baranda, bajo, n) {
  const c = (s0 + s1) / 2, L = s1 - s0, PB = 3.0;
  k.box(c, 0, Z + 0.15, L, h, 0.3, color);
  k.block(c, Z + 0.15, L, 0.3);
  // el zócalo: de lajas en unas casas, gris en otras
  if (n % 2) k.pic(c, 0.4, ZF + 0.01, L, 0.8, 0, 1, canvasTex(Math.round(L * 30), 30, lajas));
  else k.box(c, 0, ZF + 0.005, L, 0.7, 0.02, 0x8a8c8e);
  // el bajo
  if (bajo === 'puerta' || bajo === 'portal') {
    k.pic(s0 + 1.2, 1.15, ZF + 0.012, 1.0, 2.3, 0, 1, canvasTex(60, 140, puerta));
    k.pic(c + 1.0, 1.55, ZF + 0.012, Math.min(1.6, L - 3.2), 1.3, 0, 1, canvasTex(80, 64, cristales('#5a3420', 2, 'rgba(230,226,215,.55)')));
  } else if (bajo === 'local') {
    k.pic(c - 0.6, 1.25, ZF + 0.012, L - 2.6, 2.5, 0, 1, canvasTex(160, 120, localito));
    k.box(c - 0.6, 2.6, ZF + 0.45, L - 2.4, 0.06, 0.9, 0xece4d8);
    k.pic(s1 - 0.8, 1.15, ZF + 0.012, 0.9, 2.3, 0, 1, canvasTex(60, 140, puerta));
  } else {
    const wg = Math.min(L - 1.8, 3.2);
    k.pic(c - 0.5, 1.2, ZF + 0.012, wg, 2.4, 0, 1, canvasTex(160, 120, porton(bajo)));
    k.pic(s1 - 0.75, 1.1, ZF + 0.012, 0.85, 2.2, 0, 1, canvasTex(56, 140, puerta));
  }
  // los cables por encima del bajo
  k.box(c, PB - 0.1, ZF + 0.05, L, 0.04, 0.04, 0x1c1c1e);
  // las plantas de arriba: la losa del balcón con su barandilla, la ventana de madera y la puerta del balcón
  const alto = (h - PB - 0.4) / (plantas - 1 || 1);
  for (let p = 1; p < plantas; p++) {
    const y = PB + (p - 1) * alto;
    const conBalcon = baranda !== 'ninguna' && (p + n) % 3 !== 0;
    k.pic(s0 + L * 0.3, y + 1.35, ZF + 0.012, Math.min(1.4, L * 0.3), 1.4, 0, 1, canvasTex(70, 70, cristales(baranda === 'cristal' ? '#c8c8c8' : '#5a3a28', 2, 'rgba(230,226,215,.55)')));
    k.pic(s0 + L * 0.7, y + 1.15, ZF + 0.012, Math.min(1.3, L * 0.28), 2.1, 0, 1, canvasTex(60, 100, cristales(baranda === 'cristal' ? '#c8c8c8' : '#5a3a28', 2, 'rgba(230,226,215,.5)')));
    if (conBalcon) {
      const sale = baranda === 'salmon' ? 0.3 : 0.9;
      k.box(c, y, ZF + sale / 2, L - 0.2, 0.22, sale, color === 0xd8b090 ? 0xe8c8a8 : 0xf4f4f0);
      if (baranda === 'salmon') k.box(c, y + 0.22, ZF + sale - 0.05, L - 0.4, 0.95, 0.1, 0xe0c0a0);
      else if (baranda === 'cristal') {
        k.box(c, y + 0.22, ZF + sale - 0.03, L - 0.3, 0.9, 0.02, 0x9ab8c0, { list: k.glass });
        k.box(c, y + 1.1, ZF + sale - 0.03, L - 0.2, 0.04, 0.05, 0xc8ccd0);
      } else {
        const col = BARANDA[baranda];
        k.box(c, y + 1.1, ZF + sale - 0.03, L - 0.2, 0.06, 0.06, col);
        for (let x = s0 + 0.2; x < s1 - 0.1; x += 0.14) k.box(x, y + 0.22, ZF + sale - 0.03, 0.03, 0.88, 0.03, col);
        for (const t of [s0 + 0.12, s1 - 0.12]) k.box(t, y + 0.22, ZF + sale / 2, 0.03, 0.88, sale, col);
      }
    } else if (baranda !== 'ninguna') k.box(c, y - 0.05, ZF + 0.06, L * 0.3, 0.06, 0.12, 0xe8e4dc);
  }
  // el pretil de la azotea
  k.box(c, h - 0.12, ZF + 0.03, L, 0.12, 0.06, 0xe4e0d8);
}

/** el taller de bicis de la esquina: la banda negra del letrero, sin el logotipo */
function taller(k, s0, s1) {
  const c = (s0 + s1) / 2;
  k.box(c, 3.05, ZF + 0.05, s1 - s0 - 0.6, 0.9, 0.06, 0x1c1c1e);
  k.box(c, 3.3, ZF + 0.09, s1 - s0 - 1.6, 0.06, 0.02, 0xe8e8e4);
}

/** se monta con lo demás de Arrecife Centro */
export function buildCasasTampico(scene, colliders, map) {
  if (!map?.casasTampico) return null;
  const grupos = TRAMOS.map((M, i) => {
    const k = new Kit();
    CASAS[i].forEach(([s0, s1, h, plantas, color, baranda, bajo], j) => {
      casa(k, s0, s1, h, plantas, color, baranda, bajo, i * 7 + j);
      if (bajo === 'taller') taller(k, s0, s1);
      // las paredes lisas de los lados que asoman por encima de la casa de al lado
      const prev = CASAS[i][j - 1], next = CASAS[i][j + 1];
      if (prev && prev[2] < h) medianera(k, s0 - 0.07, Math.max(prev[2], 8.2), h, FONDO, Z, 0xe8e6e0);
      if (next && next[2] < h) medianera(k, s1 + 0.07, Math.max(next[2], 8.2), h, FONDO, Z, 0xe8e6e0);
      if (h > 8.2) k.box((s0 + s1) / 2, 8.2, -FONDO - 0.07, s1 - s0, h - 8.2, 0.12, 0xe8e6e0);
    });
    const g = enMarco(k, M, 'casasTampico' + i, colliders);
    scene.add(g);
    return g;
  });
  return { group: grupos[0], grupos };
}
