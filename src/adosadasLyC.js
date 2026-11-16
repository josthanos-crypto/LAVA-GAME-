import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';
import { ZF, pared, tira } from './rapadurasSur.js';

/**
 * La acera de León y Castillo al norte de la calle Cervantes (la LZ-1, Altavista), del 199 al pasaje del 215, con las
 * vistas de la calle de Google de julio de 2025 (LZ-1 199 a 215; solo se miran, no van dentro del juego), medidas con el
 * foco bueno de las capturas (475 px). En el mapa era el bloque genérico de 4 m. De verdad:
 * - el 199, la casa blanca de la esquina: el zócalo gris, la ventana de rejas, la puerta blanca, la ventana de lamas, la
 *   placa azul de la calle y, en la azotea, el tejadillo de chapa verde clara;
 * - el 201, la casa baja del porche con la cancela de rejas, y el 203, la casa blanca de la ventana grande de rejas;
 * - la fila de adosadas color crema de dos plantas: abajo, los porches metidos (unos con la columna blanca y las plantas,
 *   otros con la puerta y los escalones de losetas rojas), los paños de celosía de bloques blancos y las cajas de los
 *   contadores; arriba, las ventanas de carpintería blanca, unas con las contraventanas de lamas abiertas o cerradas y
 *   otras con la persiana enrollable; el pasaje de los garajes con la balaustrada encima y las placas de vado, y el
 *   pasaje cubierto del 215 con la cancela blanca y la balaustrada de la azotea.
 */

// la cara de León y Castillo: a hacia el norte desde la esquina de Cervantes del bloque del mapa, b hacia dentro
const O = [415.7, -1501.6];
const U = [0.1594, -0.9873], N = [0.9873, 0.1594];
const P = (a, b = 0) => [O[0] + U[0] * a - N[0] * b, O[1] + U[1] * a - N[1] * b];
const A199 = 6.35, A201 = 8.92, A203 = 13.45, PAS1 = 23.95, PAS1F = 27.75, PAS2 = 53.4, FIN = 56.7, FONDO = 12, TUNEL = 4;
const ALTO199 = 4.3, ALTO201 = 3.7, ALTO203 = 4.17, ALTO_FILA = 6.8, ALTO_PAS1 = 3.48, ALTO_PAS2 = 6.0;
const F = marco(P(0), P(FIN));
const s = a => a;

const CREMA = '#f6eacc', BLANCO = '#f2f0ea';

/** antes de levantar la ciudad: las casas salen del frente del bloque genérico de 4 m */
export function tuneAdosadasLyC(map) {
  if (!Array.isArray(map?.buildings)) return;
  const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const r = q => [+q[0].toFixed(2), +q[1].toFixed(2)];
  const libre = q => !q.skip && !q.edificioReal && Array.isArray(q.p);
  const b = map.buildings.find(q => libre(q) && q.p.some(p => d(p, O) < 0.3) && q.p.some(p => d(p, [426.1, -1566]) < 0.3));
  if (!b) return;
  const i = b.p.findIndex(p => d(p, O) < 0.3);
  const antes = b.p[i - 1];
  const nuevo = [P(FIN), P(FIN, FONDO), P(0, FONDO)].map(r);
  b.p.splice(i, 1, ...(antes && d(antes, [426.1, -1566]) < 0.3 ? nuevo : nuevo.reverse()));
  if (d(b.p[0], b.p[b.p.length - 1]) > 0.01 && d(b.p[b.p.length - 1], O) < 0.3) b.p[b.p.length - 1] = b.p[0].slice();
  const casa = (a0, a1, b0, h, f, c = [200, 196, 188]) => {
    const p = [P(a0, b0), P(a0, FONDO), P(a1, FONDO), P(a1, b0)].map(r);
    p.push(p[0].slice());
    map.buildings.push({ p, h, k: 'gen', s: 0, f, c, edificioReal: true });
  };
  const blanca = [242, 240, 234], crema = [241, 226, 184];
  casa(0, A199, 0, ALTO199, blanca);
  casa(A199, A201, 0, ALTO201, blanca);
  casa(A201, A203, 0, ALTO203, blanca);
  casa(A203, PAS1, 0, ALTO_FILA, crema);
  casa(PAS1, PAS1F, 0, ALTO_PAS1, crema);
  casa(PAS1F, PAS2, 0, ALTO_FILA, crema);
  casa(PAS2, FIN, TUNEL, ALTO_PAS2, crema);
  map.adosadasLyC = true;
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
    for (let x = 0; x < w; x += t) {
      g.strokeRect(x + 1, y + 1, t - 2, t - 2);
      g.beginPath();
      g.moveTo(x + t / 2, y + 2); g.lineTo(x + t - 2, y + t / 2); g.lineTo(x + t / 2, y + t - 2); g.lineTo(x + 2, y + t / 2); g.closePath();
      g.stroke();
      g.beginPath(); g.moveTo(x + 2, y + 2); g.lineTo(x + t - 2, y + t - 2); g.moveTo(x + t - 2, y + 2); g.lineTo(x + 2, y + t - 2); g.stroke();
    }
  }
}

/** un porche metido visto de frente: las paredes en sombra, el fondo, la puerta o las plantas y los escalones */
const porche = tipo => (g, w, h) => {
  g.fillStyle = '#c8b48a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#dccaa0';
  g.fillRect(w * 0.12, h * 0.1, w * 0.76, h * 0.8);
  g.fillStyle = 'rgba(0,0,0,.18)';
  g.fillRect(0, 0, w, h * 0.1);
  if (tipo === 'puerta' || tipo === 'cancela') {
    g.fillStyle = tipo === 'puerta' ? '#f6f4ee' : '#3a3a38';
    g.fillRect(w * 0.3, h * 0.2, w * 0.45, h * 0.7);
    if (tipo === 'cancela') {
      g.fillStyle = '#f2f2ee';
      g.fillRect(w * 0.1, h * 0.35, w * 0.8, h * 0.55);
      g.fillStyle = '#c8c8c4';
      for (let x = w * 0.14; x < w * 0.9; x += w * 0.08) g.fillRect(x, h * 0.38, 2, h * 0.2);
    } else {
      g.strokeStyle = '#d8d6d0';
      g.lineWidth = 2;
      g.strokeRect(w * 0.35, h * 0.26, w * 0.35, h * 0.25);
      g.strokeRect(w * 0.35, h * 0.56, w * 0.35, h * 0.28);
    }
    g.fillStyle = '#b8583a';
    g.fillRect(0, h * 0.9, w, h * 0.1);
  } else {
    g.fillStyle = '#5a7a3a';
    for (let i = 0; i < 6; i++) g.fillRect(w * (0.1 + i * 0.14), h * (0.72 - (i % 3) * 0.08), w * 0.06, h * (0.18 + (i % 3) * 0.08));
    g.fillStyle = '#f2f2ee';
    g.fillRect(w * 0.12, h * 0.25, w * 0.18, h * 0.3);
  }
};

/** el pasaje de los garajes: la rampa que baja y la puerta del garaje al fondo */
function pasajeGaraje(g, w, h) {
  g.fillStyle = '#d8c69c';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8dcbc';
  g.fillRect(w * 0.15, h * 0.05, w * 0.7, h * 0.95);
  g.fillStyle = '#2a2a2c';
  g.fillRect(w * 0.25, h * 0.55, w * 0.5, h * 0.35);
  g.strokeStyle = '#4a4a4c';
  g.lineWidth = 1;
  for (let y = h * 0.57; y < h * 0.9; y += 4) { g.beginPath(); g.moveTo(w * 0.25, y); g.lineTo(w * 0.75, y); g.stroke(); }
  g.fillStyle = '#b8ae98';
  g.fillRect(0, h * 0.9, w, h * 0.1);
}

/** el pasaje cubierto del 215: la cancela blanca del fondo y el suelo verde */
function pasajeCancela(g, w, h) {
  g.fillStyle = '#cdbb90';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e4d6b0';
  g.fillRect(w * 0.12, h * 0.1, w * 0.76, h * 0.8);
  g.fillStyle = '#f4f4f0';
  g.fillRect(w * 0.15, h * 0.42, w * 0.7, h * 0.45);
  g.strokeStyle = '#8a8a86';
  g.lineWidth = 1;
  for (let x = w * 0.15; x < w * 0.85; x += 5) { g.beginPath(); g.moveTo(x, h * 0.3); g.lineTo(x, h * 0.42); g.stroke(); }
  g.strokeStyle = '#c8c8c4';
  g.strokeRect(w * 0.42, h * 0.44, w * 0.16, h * 0.42);
  g.fillStyle = '#4a7a5a';
  g.fillRect(0, h * 0.87, w, h * 0.13);
}

/** una ventana de carpintería blanca con la persiana enrollable a medio bajar */
function ventanaPersiana(g, w, h) {
  cristales('#f2f2ee', 2, 'rgba(230,226,215,.5)')(g, w, h);
  g.fillStyle = '#ecebe6';
  g.fillRect(0, 0, w, h * 0.4);
  g.strokeStyle = '#d0cec8';
  g.lineWidth = 1;
  for (let y = 3; y < h * 0.4; y += 3) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

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

/** las rejas blancas de una ventana */
function rejas(g, w, h) {
  cristales('#f2f2ee', 2, 'rgba(230,226,215,.6)')(g, w, h);
  g.fillStyle = '#f4f4f0';
  for (let x = w * 0.08; x < w; x += w / 9) g.fillRect(x, 0, 3, h);
  for (const y of [0.33, 0.66]) g.fillRect(0, h * y, w, 3);
}

/** la placa azul de la calle */
function placaCalle(g, w, h) {
  g.fillStyle = '#2a4aa8';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#f4f4f0';
  g.lineWidth = 2;
  g.strokeRect(2, 2, w - 4, h - 4);
  g.fillStyle = '#f4f4f0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `bold ${Math.round(h * 0.3)}px Arial, sans-serif`;
  g.fillText('León y', w / 2, h * 0.36, w * 0.85);
  g.fillText('Castillo', w / 2, h * 0.68, w * 0.85);
}

/** la placa de vado: la señal de prohibido aparcar sobre blanco */
function vado(g, w, h) {
  g.fillStyle = '#f4f4f0';
  g.fillRect(0, 0, w, h);
  const r = w * 0.36, cx = w / 2, cy = h * 0.42;
  g.fillStyle = '#c82a2a';
  g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();
  g.fillStyle = '#2a5ab0';
  g.beginPath(); g.arc(cx, cy, r * 0.75, 0, 7); g.fill();
  g.strokeStyle = '#c82a2a';
  g.lineWidth = r * 0.25;
  g.beginPath(); g.moveTo(cx - r * 0.55, cy - r * 0.55); g.lineTo(cx + r * 0.55, cy + r * 0.55); g.stroke();
}

/** los balaustres de una balaustrada blanca */
function balaustres(g, w, h) {
  g.fillStyle = '#c8c0a8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4f0e4';
  for (let x = 6; x < w; x += 13) {
    g.beginPath();
    g.ellipse(x, h * 0.55, 3.5, h * 0.32, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.fillRect(0, 0, w, h * 0.16);
  g.fillRect(0, h * 0.86, w, h * 0.14);
}

// ——— las piezas ———

/** un hueco de a0 a a1 y de y0 a y1 */
const hu = (k, a0, a1, y0, y1, fn, borde, z = ZF + 0.04) => hueco(k, s((a0 + a1) / 2), y0, a1 - a0, y1 - y0, tx(a1 - a0, y1 - y0, fn), { borde, z });
/** una caja pegada a la fachada de a0 a a1 y de y0 a y1, que sale «sale» m */
const caja = (k, a0, a1, y0, y1, sale, color) => k.box(s((a0 + a1) / 2), y0, ZF + sale / 2, a1 - a0, y1 - y0, sale, color);
/** una imagen pegada a la fachada */
const cuadro = (k, a0, a1, y0, y1, z, fn) => k.pic(s((a0 + a1) / 2), (y0 + y1) / 2, ZF + z, a1 - a0, y1 - y0, 0, 1, tx(a1 - a0, y1 - y0, fn));

/** el 199, el 201 y el 203: las casas blancas de la esquina */
function casasEsquina(k) {
  pared(k, s(0), s(A199), ALTO199, liso(BLANCO));
  caja(k, 0, A199, 0, 0.88, 0.05, 0x9aa2a0);
  hu(k, 1.8, 3.14, 0.99, 2.14, rejas, 0xf2f2ee);
  hu(k, 4.01, 4.85, 0.06, 2.08, porche('puerta'), 0xf2f2ee);
  hu(k, 4.9, 5.87, 0.99, 2.14, lamasBlancas, 0xf2f2ee);
  caja(k, 1.35, 1.84, 2.45, 2.72, 0.03, 0x2a4aa8);
  cuadro(k, 1.35, 1.84, 2.45, 2.72, 0.032, placaCalle);
  caja(k, 0, A199, ALTO199 - 0.15, ALTO199, 0.12, 0xe8e6e0);
  // el tejadillo de chapa verde clara de la azotea, con sus dos postes
  const ang = Math.atan2(1.0, 3.0), largo = Math.hypot(1.0, 3.0), c = s((3.33 + A199) / 2);
  const geo = new THREE.BoxGeometry(A199 - 3.33, 0.04, largo);
  geo.rotateX(-ang);
  geo.translate(c, 5.7, -1.2);
  k.add(geo, 0xb8cec0);
  for (const a of [3.45, A199 - 0.15]) k.box(s(a), ALTO199, 0.1, 0.06, 1.9, 0.06, 0xd8d8d4);
  // el 201: el porche con su losa y la cancela de rejas
  pared(k, s(A199), s(A201), ALTO201, liso(BLANCO));
  hu(k, 6.66, 7.62, 0.58, 2.26, porche('cancela'), 0x3a3a38);
  caja(k, A199, A201, 2.51, 3.14, 0.35, 0xeceae4);
  // el 203: la ventana grande de rejas y el zócalo desconchado
  pared(k, s(A201), s(A203), ALTO203, liso(BLANCO));
  caja(k, A201, A203, 0, 0.5, 0.04, 0xd8d4c8);
  hu(k, 10.18, 12.18, 0.88, 2.33, rejas, 0xf2f2ee);
  caja(k, A201, A203, ALTO203 - 0.15, ALTO203, 0.12, 0xe8e6e0);
}

/** la fila de adosadas crema */
function fila(k) {
  pared(k, s(A203), s(PAS1), ALTO_FILA, liso(CREMA));
  pared(k, s(PAS1F), s(PAS2), ALTO_FILA, liso(CREMA));
  // los paños de celosía, con las cajas de los contadores debajo
  for (const [a0, a1] of [[15.35, 17.5], [20.4, 22.6], [29.15, 31.4], [34.3, 36.5], [39.35, 41.6], [44.45, 46.75], [49.6, 51.9]]) {
    hu(k, a0, a1, 1.29, 2.82, celosia, 0xf4f2ec, ZF + 0.02);
    caja(k, a0 + 0.3, a0 + 0.75, 0.7, 1.05, 0.1, 0xf0f0ec);
  }
  // los porches: con la columna blanca y las plantas, o con la puerta y los escalones
  for (const [a0, a1, col] of [[17.7, 20.3, 19.02], [31.4, 34.15, 32.72], [46.85, 49.55, 48.3]]) {
    hu(k, a0, a1, 0, 3.0, porche('plantas'), 0xead9ae, ZF + 0.02);
    k.cyl(s(col), 0, ZF + 0.25, 0.17, 0.17, 3.0, 0xf4f2ec, { seg: 14 });
    k.block(s(col), ZF + 0.25, 0.34, 0.34);
  }
  for (const [a0, a1, tipo] of [[13.75, 15.2, 'cancela'], [22.6, 23.95, 'cancela'], [27.75, 29.15, 'puerta'], [36.6, 38.12, 'puerta'], [38.18, 39.35, 'puerta'], [41.6, 42.8, 'puerta'], [42.9, 44.4, 'puerta'], [51.9, 53.3, 'puerta']]) {
    hu(k, a0, a1, 0, 3.0, porche(tipo), 0xead9ae, ZF + 0.02);
  }
  // arriba: las ventanas, unas con las contraventanas de lamas y otras con la persiana enrollable
  const ventanas = [[14.5, 15.7, 'c'], [16.5, 18.35, 'a'], [19.65, 20.9, 'p'], [22.3, 23.4, 'p'], [27.7, 30.2, 'a'], [30.95, 32.2, 'c'],
    [33.7, 34.9, 'v'], [36.07, 37.3, 'v'], [38.6, 39.85, 'l'], [41.2, 42.5, 'l'], [43.95, 45.1, 'v'], [46.1, 47.3, 'v'], [48.75, 50.1, 'v'], [51.45, 52.8, 'v']];
  for (const [a0, a1, t] of ventanas) {
    if (t === 'l') hu(k, a0, a1, 4.35, 5.5, lamasBlancas, 0xf2f2ee, ZF);
    else if (t === 'p') hu(k, a0, a1, 4.35, 5.5, ventanaPersiana, 0xf2f2ee, ZF);
    else hu(k, a0, a1, 4.35, 5.5, cristales('#f2f2ee', t === 'a' ? 3 : 2, 'rgba(230,226,215,.45)'), 0xf2f2ee, ZF);
    // las contraventanas abiertas a los lados de las ventanas grandes y de las de una hoja
    if (t === 'a' || t === 'c') for (const x of [a0 - 0.32, a1 + 0.32]) k.pic(s(x), 4.925, ZF + 0.03, 0.5, 1.15, 0, 1, canvasTex(30, 69, lamasBlancas));
  }
  caja(k, A203, PAS1, ALTO_FILA - 0.22, ALTO_FILA, 0.1, 0xe8d8b0);
  caja(k, PAS1F, PAS2, ALTO_FILA - 0.22, ALTO_FILA, 0.1, 0xe8d8b0);
  // el pasaje de los garajes: la rampa, el muro de encima, la balaustrada y las dos placas de vado
  pared(k, s(PAS1), s(PAS1F), ALTO_PAS1, liso(CREMA));
  hu(k, 24.05, 27.65, 0, 2.7, pasajeGaraje, 0xead9ae, ZF + 0.02);
  k.box(s((PAS1 + PAS1F) / 2), ALTO_PAS1, ZF - 0.08, PAS1F - PAS1, 0.74, 0.16, 0xf4f0e4);
  k.pic(s((PAS1 + PAS1F) / 2), ALTO_PAS1 + 0.37, ZF + 0.004, PAS1F - PAS1, 0.74, 0, 1, tx(PAS1F - PAS1, 0.74, balaustres));
  for (const a of [24.2, 29.4]) k.pic(s(a), 2.95, ZF + 0.02, 0.3, 0.38, 0, 1, canvasTex(48, 60, vado));
  // el pasaje cubierto del 215: el túnel con la cancela, el muro de encima y la balaustrada de la azotea
  k.box(s((PAS2 + FIN) / 2), 4.3, -TUNEL / 2 + ZF / 2, FIN - PAS2, ALTO_PAS2 - 4.3, TUNEL + ZF, 0xf1e2b8);
  k.pic(s((PAS2 + FIN) / 2), (4.3 + ALTO_PAS2) / 2, ZF + 0.004, FIN - PAS2, ALTO_PAS2 - 4.3, 0, 1, tx(FIN - PAS2, ALTO_PAS2 - 4.3, liso(CREMA)));
  hu(k, 53.55, 56.6, 0, 4.3, pasajeCancela, 0xead9ae, -TUNEL + 0.3);
  for (const [a0, a1] of [[PAS2, 53.55], [56.6, FIN]]) k.box(s((a0 + a1) / 2), 0, -TUNEL / 2 + ZF / 2, a1 - a0, 4.3, TUNEL + ZF, 0xf1e2b8);
  k.box(s((PAS2 + FIN) / 2), ALTO_PAS2, ZF - 0.08, FIN - PAS2, 0.74, 0.16, 0xf4f0e4);
  k.pic(s((PAS2 + FIN) / 2), ALTO_PAS2 + 0.37, ZF + 0.004, FIN - PAS2, 0.74, 0, 1, tx(FIN - PAS2, 0.74, balaustres));
}

/** se monta con lo demás */
export function buildAdosadasLyC(scene, colliders, map) {
  if (!map?.adosadasLyC) return null;
  const k = new Kit();
  casasEsquina(k);
  fila(k);
  const grupos = [enMarco(k, F, 'adosadasLyC', colliders)];
  // las paredes de los lados y de atrás que asoman: la de la esquina de Cervantes, la del 203 sobre el 201, la de la
  // fila sobre el 203, la del norte sobre el bloque y las de atrás
  const lisa = (A, B, alto, nombre, color = '#ecebe6') => tira(A, B, alto, nombre, colliders, (kk, L) => pared(kk, 0, L, alto, liso(color), -0.25));
  grupos.push(lisa(P(0, FONDO), P(0), ALTO199, 'adosadasLadoCervantes', '#efeee9'));
  grupos.push(lisa(P(A203, FONDO), P(A203), ALTO_FILA, 'adosadasFilaSur', '#ece0bc'));
  grupos.push(lisa(P(FIN), P(FIN, FONDO), ALTO_PAS2, 'adosadasLadoNorte', '#ece0bc'));
  grupos.push(lisa(P(PAS1, FONDO), P(A203, FONDO), ALTO_FILA, 'adosadasTrasera1', '#ece0bc'));
  grupos.push(lisa(P(PAS2, FONDO), P(PAS1F, FONDO), ALTO_FILA, 'adosadasTrasera2', '#ece0bc'));
  for (const g of grupos) scene.add(g);
  return { grupos };
}
