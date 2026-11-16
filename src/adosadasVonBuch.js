import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco, trocear } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';
import { paveMesh, polyTris } from './suelos.js';
import { pared, tira, tierraParda } from './rapadurasSur.js';
import { tuneFasniaCrema } from './fasniaCrema.js';

/**
 * La cara de atrás de las adosadas crema de León y Castillo, por la calle de detrás (en el mapa, Leopoldo von Buch; en
 * Google, Crucero Canarias), con las vistas de la calle de Google de julio de 2025 (Crucero Canarias 43 a 55; solo se
 * miran, no van dentro del juego) y el plano del Catastro (es el mismo conjunto). En el mapa era el bloque genérico de
 * 4 m, que además se metía en la calle. De verdad:
 * - el patio de la esquina de Cervantes, con su tierra y el muro alto de piedra;
 * - la fila de adosadas crema de dos plantas: los paños de celosía de bloques blancos, los porches con la columna
 *   blanca, las cancelas blancas de rejas (una con arco), las cajas de los contadores y, arriba, las ventanas de lamas,
 *   las de persiana y las de carpintería blanca;
 * - el pasaje de los garajes con la balaustrada encima, y el pasaje cubierto con la cancela blanca del fondo y la
 *   balaustrada de la azotea.
 */

// la cara de León y Castillo de las adosadas: a hacia el norte desde la esquina de Cervantes, b hacia dentro
const O = [415.7, -1501.6];
const U = [0.1594, -0.9873], N = [0.9873, 0.1594];
const P = (a, b = 0) => [O[0] + U[0] * a - N[0] * b, O[1] + U[1] * a - N[1] * b];
// la cara de la calle de atrás va un poco torcida, como la calle: de b = 33,9 en a = 14 a b = 35,0 en a = 57,9
const bf = a => 33.9 + (a - 14) * (1.1 / 43.9);
const A0 = 14.5, PG0 = 25.35, PG1 = 28.8, PC0 = 54.4, PC1 = 56.5, ATRAS = 25.0;
const ALTO = 6.8, ALTO_PG = 4.05, ALTO_PC = 6.0, ALTO_MURO = 3.0;
// el marco va del norte (el pasaje cubierto) al sur (el patio), con la calle delante (al oeste); la cara a 0,054
const M = marco(P(PC1, bf(PC1)), P(A0, bf(A0)));
const x = a => (PC1 - a) * M.len / (PC1 - A0);
const F = 0.054;
const CREMA = '#f6eacc';

/** antes de levantar la ciudad: el bloque genérico se mete detrás de la cara y deja el patio; van las casas */
export function tuneAdosadasVonBuch(map) {
  if (!Array.isArray(map?.buildings)) return;
  if (!map.fasniaCrema) tuneFasniaCrema(map);
  const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const r = q => [+q[0].toFixed(2), +q[1].toFixed(2)];
  const libre = q => !q.skip && !q.edificioReal && Array.isArray(q.p);
  const V1 = P(10.36, 25.26), V2 = P(10.38, 35.25), V3 = P(65.28, 35.18);
  const b = map.buildings.find(q => libre(q) && q.p.some(p => d(p, V1) < 0.3) && q.p.some(p => d(p, V2) < 0.3) && q.p.some(p => d(p, V3) < 0.3));
  if (!b) return;
  b.p = b.p.map(p => d(p, V1) < 0.3 ? r(P(A0, 25.26)) : d(p, V2) < 0.3 ? r(P(A0, bf(A0) - 0.02)) : d(p, V3) < 0.3 ? r(P(65.28, 35.0)) : p);
  // (al revés, para que den la vuelta como los bloques del mapa)
  const casa = (a0, a1, h) => {
    const p = [P(a0, ATRAS), P(a0, bf(a0)), P(a1, bf(a1)), P(a1, ATRAS)].map(r).reverse();
    p.push(p[0].slice());
    map.buildings.push({ p, h, k: 'gen', s: 0, f: [246, 234, 204], c: [200, 196, 188], edificioReal: true });
  };
  casa(A0, PG0, ALTO);
  casa(PG0, PG1, ALTO_PG);
  casa(PG1, PC0, ALTO);
  casa(PC0, PC1, ALTO_PC);
  map.adosadasVonBuch = true;
}

// ——— las texturas ———

const liso = color => (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); };
const tx = (w, h, fn) => canvasTex(Math.max(16, Math.min(1024, Math.round(w * 60))), Math.max(16, Math.round(h * 60)), fn);

/** un paño de celosía de bloques blancos: cuadros con el rombo y las aspas */
function celosia(g, w, h) {
  g.fillStyle = '#4a4438';
  g.fillRect(0, 0, w, h);
  const t = h / 5;
  g.strokeStyle = '#f4f2ec';
  g.lineWidth = Math.max(2, t * 0.14);
  for (let y = 0; y < h; y += t) {
    for (let xx = 0; xx < w; xx += t) {
      g.strokeRect(xx + 1, y + 1, t - 2, t - 2);
      g.beginPath();
      g.moveTo(xx + t / 2, y + 2); g.lineTo(xx + t - 2, y + t / 2); g.lineTo(xx + t / 2, y + t - 2); g.lineTo(xx + 2, y + t / 2); g.closePath();
      g.stroke();
      g.beginPath(); g.moveTo(xx + 2, y + 2); g.lineTo(xx + t - 2, y + t - 2); g.moveTo(xx + t - 2, y + 2); g.lineTo(xx + 2, y + t - 2); g.stroke();
    }
  }
}

/** un porche metido visto de frente: las paredes en sombra, el fondo y las plantas */
function porche(g, w, h) {
  g.fillStyle = '#c8b48a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#dccaa0';
  g.fillRect(w * 0.12, h * 0.1, w * 0.76, h * 0.8);
  g.fillStyle = 'rgba(0,0,0,.18)';
  g.fillRect(0, 0, w, h * 0.1);
  g.fillStyle = '#5a7a3a';
  for (let i = 0; i < 5; i++) g.fillRect(w * (0.12 + i * 0.16), h * (0.72 - (i % 3) * 0.08), w * 0.07, h * (0.18 + (i % 3) * 0.08));
  g.fillStyle = '#b8583a';
  g.fillRect(0, h * 0.92, w, h * 0.08);
}

/** una cancela blanca de rejas, con el porche detrás (con arco arriba si se pide) */
const cancela = arco => (g, w, h) => {
  porche(g, w, h);
  g.fillStyle = '#f4f4f0';
  g.fillRect(0, h * 0.62, w, h * 0.38);
  g.fillStyle = '#f2f2ee';
  const y0 = arco ? h * 0.12 : h * 0.04;
  for (let xx = w * 0.06; xx < w; xx += w / 9) g.fillRect(xx, y0, 3, h * 0.6);
  g.fillRect(0, h * 0.04, 4, h);
  g.fillRect(w - 4, h * 0.04, 4, h);
  g.fillRect(0, h * 0.6, w, 4);
  if (arco) {
    g.strokeStyle = '#f2f2ee';
    g.lineWidth = 4;
    g.beginPath(); g.arc(w / 2, h * 0.14, w * 0.48, Math.PI, 0); g.stroke();
  } else g.fillRect(0, h * 0.04, w, 4);
};

/** unas contraventanas blancas de lamas, cerradas */
function lamasBlancas(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#a8a6a0';
  g.lineWidth = 1.5;
  for (let y = 4; y < h - 2; y += 4) { g.beginPath(); g.moveTo(3, y); g.lineTo(w / 2 - 2, y); g.moveTo(w / 2 + 2, y); g.lineTo(w - 3, y); g.stroke(); }
  g.fillStyle = '#d0cec8';
  g.fillRect(w / 2 - 1, 0, 2, h);
}

/** una persiana enrollable blanca, bajada */
function persianaBlanca(g, w, h) {
  g.fillStyle = '#ecebe6';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c8c6c0';
  g.lineWidth = 1;
  for (let y = 3; y < h; y += 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** el pasaje de los garajes: la rampa que baja y la puerta del garaje al fondo */
function pasajeGaraje(g, w, h) {
  g.fillStyle = '#d8c69c';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8dcbc';
  g.fillRect(w * 0.12, h * 0.05, w * 0.76, h * 0.95);
  g.fillStyle = '#2a2a2c';
  g.fillRect(w * 0.25, h * 0.5, w * 0.5, h * 0.3);
  g.strokeStyle = '#4a4a4c';
  g.lineWidth = 1;
  for (let y = h * 0.52; y < h * 0.8; y += 4) { g.beginPath(); g.moveTo(w * 0.25, y); g.lineTo(w * 0.75, y); g.stroke(); }
  g.fillStyle = '#b8ae98';
  g.fillRect(0, h * 0.8, w, h * 0.2);
}

/** el pasaje cubierto: la cancela blanca del fondo, los buzones y el suelo */
function pasajeCubierto(g, w, h) {
  g.fillStyle = '#cdbb90';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e4d6b0';
  g.fillRect(w * 0.14, h * 0.12, w * 0.72, h * 0.8);
  g.fillStyle = '#f4f4f0';
  g.fillRect(w * 0.22, h * 0.42, w * 0.56, h * 0.45);
  g.strokeStyle = '#8a8a86';
  g.lineWidth = 1;
  for (let xx = w * 0.22; xx < w * 0.78; xx += 5) { g.beginPath(); g.moveTo(xx, h * 0.3); g.lineTo(xx, h * 0.42); g.stroke(); }
  g.fillStyle = '#2a2a2a';
  g.fillRect(w * 0.16, h * 0.5, w * 0.05, h * 0.08);
  g.fillStyle = '#3a4a3a';
  g.fillRect(0, h * 0.87, w, h * 0.13);
}

/** los balaustres de una balaustrada blanca */
function balaustres(g, w, h) {
  g.fillStyle = '#c8c0a8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4f0e4';
  for (let xx = 6; xx < w; xx += 13) {
    g.beginPath();
    g.ellipse(xx, h * 0.55, 3.5, h * 0.32, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.fillRect(0, 0, w, h * 0.16);
  g.fillRect(0, h * 0.86, w, h * 0.14);
}

/** el muro de bloques de piedra del patio */
function muroPiedra(g, w, h) {
  g.fillStyle = '#8e8a84';
  g.fillRect(0, 0, w, h);
  let sd = 3;
  const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const bh = h / 7, bw = bh * 2.2;
  for (let j = 0; j * bh < h; j++) {
    for (let xx = (j % 2) * -bw / 2; xx < w; xx += bw) {
      const v = 168 + Math.round(rnd() * 30);
      g.fillStyle = `rgb(${v},${v - 4},${v - 10})`;
      g.fillRect(xx + 1.5, j * bh + 1.5, bw - 3, bh - 3);
    }
  }
  g.fillStyle = '#9a968e';
  g.fillRect(0, 0, w, h * 0.06);
}

// ——— las piezas ———

/** un hueco de a0 a a1 y de y0 a y1 */
const hu = (k, a0, a1, y0, y1, fn, borde, z = F + 0.04) => hueco(k, (x(a0) + x(a1)) / 2, y0, Math.abs(x(a1) - x(a0)), y1 - y0, tx(Math.abs(a1 - a0), y1 - y0, fn), { borde, z });
/** una caja pegada a la fachada */
const caja = (k, a0, a1, y0, y1, sale, color, z = F) => k.box((x(a0) + x(a1)) / 2, y0, z + sale / 2, Math.abs(x(a1) - x(a0)), y1 - y0, sale, color);
/** una imagen pegada a la fachada */
const cuadro = (k, a0, a1, y0, y1, z, fn) => k.pic((x(a0) + x(a1)) / 2, (y0 + y1) / 2, z, Math.abs(x(a1) - x(a0)), y1 - y0, 0, 1, tx(Math.abs(a1 - a0), y1 - y0, fn));

/** la fila por la calle de atrás */
function fila(k) {
  pared(k, x(PG0), x(A0), ALTO, liso(CREMA), -0.25);
  pared(k, x(PC0), x(PG1), ALTO, liso(CREMA), -0.25);
  for (const [a0, a1] of [[A0, PG0], [PG1, PC0]]) caja(k, a0, a1, ALTO - 0.22, ALTO, 0.1, 0xe8d8b0);
  // los paños de celosía
  for (const [a0, a1] of [[16.4, 18.5], [22.6, 23.8], [30.3, 32.0], [35.5, 37.6], [40.5, 42.5], [45.7, 47.7], [50.4, 52.4]]) {
    hu(k, a0, a1, 1.29, 2.82, celosia, 0xf4f2ec, F + 0.02);
  }
  for (const [a0, a1] of [[46.0, 46.6], [46.7, 47.3], [36.0, 36.6]]) caja(k, a0, a1, 0.3, 0.95, 0.12, 0xeceae4);
  // los porches con la columna blanca
  for (const [a0, a1, col] of [[18.6, 20.1, 19.9], [48.75, 49.9, 48.85]]) {
    hu(k, a0, a1, 0, 3.0, porche, 0xead9ae, F + 0.02);
    k.cyl(x(col), 0, F + 0.25, 0.17, 0.17, 3.0, 0xf4f2ec, { seg: 14 });
    k.block(x(col), F + 0.25, 0.34, 0.34);
  }
  // las cancelas: la del arco y las rectas
  hu(k, 15.3, 16.2, 0, 2.8, cancela(true), 0xead9ae, F + 0.02);
  for (const [a0, a1] of [[20.6, 21.8], [24.0, 25.2], [28.9, 29.8], [33.0, 33.8], [33.9, 35.2], [37.8, 38.8], [43.1, 44.35], [44.4, 45.6], [53.0, 54.2]]) {
    hu(k, a0, a1, 0, 2.6, cancela(false), 0xead9ae, F + 0.02);
  }
  // arriba: las ventanas de lamas, las de persiana y las de carpintería blanca
  for (const [a0, a1, t] of [[15.72, 16.81, 'l'], [18.06, 19.23, 'l'], [23.4, 24.5, 'v'], [32.2, 33.3, 'p'], [34.4, 35.7, 'l'], [37.1, 38.4, 'l'],
    [42.4, 43.8, 'p'], [45.1, 46.3, 'v'], [47.5, 48.6, 'v'], [52.7, 53.9, 'l']]) {
    const fn = t === 'l' ? lamasBlancas : t === 'p' ? persianaBlanca : cristales('#f2f2ee', 2, 'rgba(230,226,215,.45)');
    hu(k, a0, a1, 4.35, 5.5, fn, 0xf2f2ee, F);
  }
  // el pasaje de los garajes, con el muro de encima y la balaustrada
  pared(k, x(PG1), x(PG0), ALTO_PG, liso(CREMA), -0.25);
  hu(k, PG0 + 0.1, PG1 - 0.1, 0, 3.3, pasajeGaraje, 0xead9ae, F + 0.02);
  k.box((x(PG0) + x(PG1)) / 2, ALTO_PG, F - 0.08, x(PG0) - x(PG1), 0.74, 0.16, 0xf4f0e4);
  k.pic((x(PG0) + x(PG1)) / 2, ALTO_PG + 0.37, F + 0.004, x(PG0) - x(PG1), 0.74, 0, 1, tx(PG1 - PG0, 0.74, balaustres));
  // el pasaje cubierto, con el muro de encima y la balaustrada de la azotea
  pared(k, x(PC1), x(PC0), ALTO_PC, liso(CREMA), -0.25);
  hu(k, PC0 + 0.1, PC1 - 0.05, 0, 4.3, pasajeCubierto, 0xead9ae, F + 0.02);
  k.box((x(PC0) + x(PC1)) / 2, ALTO_PC, F - 0.08, x(PC0) - x(PC1), 0.74, 0.16, 0xf4f0e4);
  k.pic((x(PC0) + x(PC1)) / 2, ALTO_PC + 0.37, F + 0.004, x(PC0) - x(PC1), 0.74, 0, 1, tx(PC1 - PC0, 0.74, balaustres));
}

/** se monta con lo demás */
export function buildAdosadasVonBuch(scene, colliders, map) {
  if (!map?.adosadasVonBuch) return null;
  const k = new Kit();
  fila(k);
  const grupos = [enMarco(k, M, 'adosadasVonBuch', colliders)];
  // el muro de piedra del patio: por la calle de atrás y por Cervantes
  const muro = (A, B, nombre) => tira(A, B, ALTO_MURO, nombre, colliders, (kk, L) => pared(kk, 0, L, ALTO_MURO, muroPiedra, -0.25));
  grupos.push(muro(P(A0, bf(A0)), P(0, bf(0)), 'vonBuchMuroPatio'));
  grupos.push(muro(P(0, bf(0)), P(0, 25.3), 'vonBuchMuroCervantes'));
  // la medianera del sur de la fila, sobre el patio, y las de los pasajes
  const lisa = (A, B, alto, nombre, color = '#efe2c0') => tira(A, B, alto, nombre, colliders, (kk, L) => pared(kk, 0, L, alto, liso(color), -0.25));
  grupos.push(lisa(P(A0, bf(A0)), P(A0, ATRAS), ALTO, 'vonBuchLadoPatio'));
  grupos.push(lisa(P(PG0, ATRAS), P(PG0, bf(PG0)), ALTO, 'vonBuchPasajeNorte'));
  grupos.push(lisa(P(PG1, bf(PG1)), P(PG1, ATRAS), ALTO, 'vonBuchPasajeSur'));
  for (const g of grupos) scene.add(g);
  // la tierra del patio
  const suelo = paveMesh(trocear(polyTris([P(0, 25.3), P(0, bf(0)), P(A0, bf(A0)), P(A0, 25.3)]), 1.5), 0.18, tierraParda(), 0xd8d0c4);
  if (suelo) { suelo.name = 'vonBuchPatio'; scene.add(suelo); }
  return { grupos, suelo };
}
