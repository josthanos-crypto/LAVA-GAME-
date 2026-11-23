import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';
import { ZF, pared, tira } from './rapadurasSur.js';
import { tuneAdosadasLyC } from './adosadasLyC.js';

/**
 * El Snack Bar Los Picachos (León y Castillo, esquina de la calle Fasnia, la LZ-1, Altavista) y su edificio entero, con
 * las vistas de la calle de Google de julio de 2025 (LZ-1 215 y Fasnia 1; solo se miran, no van dentro del juego),
 * medidas con el foco bueno de las capturas (475 px). En el mapa era la punta norte del bloque genérico de 4 m, que se
 * quedaba 4 m antes de la esquina de verdad. De verdad es una casa color crema de dos plantas:
 * - por León y Castillo: la ventana de la persiana enrollable ocre con su cajón y sus rejas, la puerta abierta del bar
 *   (dentro, las mesas y las sillas rojas) con su cajón y su escalón, las dos repisas de pared de fuera, los dos letreros
 *   «LOS PICACHOS · SNAK BAR · BOCATERÍA - CAFETERÍA · HAMBURGUESERÍA · GRAN PANTALLA TV» (sin el dibujo del bocadillo)
 *   y, arriba, las dos ventanas de cuarterones;
 * - por Fasnia: la ventanilla con el toldo, el letrero de la esquina, las ventanas de arriba, las cajas de los
 *   contadores, la puerta blanca de rejas y el paño de celosía del fondo.
 */

// la cara de León y Castillo, con el mismo marco que las adosadas (a hacia el norte, b hacia dentro)
const O = [415.7, -1501.6];
const U = [0.1594, -0.9873], N = [0.9873, 0.1594];
const P = (a, b = 0) => [O[0] + U[0] * a - N[0] * b, O[1] + U[1] * a - N[1] * b];
// el bar va de la casa del pasaje del 215 (A0) a la esquina de Fasnia (A1); el bloque del mapa acababa en A_MAPA
const A0 = 56.7, A1 = 69.3, A_MAPA = 65.24, FONDO = 12, ALTO = 8.6;
const F = marco(P(A0), P(A1));
const FN = marco(P(A1), P(A1, FONDO));
const s = a => a - A0;

const CREMA = '#f0e2bc', OCRE = 0xd8a850;

/** antes de levantar la ciudad: la casa sale de la punta norte del bloque genérico y llega hasta la esquina */
export function tuneSnackLosPicachos(map) {
  if (!Array.isArray(map?.buildings)) return;
  // parte de la esquina que dejan las adosadas (en la web los retoques van al revés)
  if (!map.adosadasLyC) tuneAdosadasLyC(map);
  const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const r = q => [+q[0].toFixed(2), +q[1].toFixed(2)];
  const esq = [426.1, -1566], A = r(P(A0));
  const b = map.buildings.find(q => !q.skip && !q.edificioReal && Array.isArray(q.p) && q.p.some(p => d(p, esq) < 0.3) && q.p.some(p => d(p, A) < 0.3));
  if (!b) return;
  // el frente de A0 a la esquina del mapa (12 m de fondo) sale del bloque: la esquina y P(A0) se cambian por Q(A_MAPA)
  const ie = b.p.findIndex(p => d(p, esq) < 0.3), ia = b.p.findIndex(p => d(p, A) < 0.3);
  if (Math.abs(ie - ia) !== 1) return;
  b.p.splice(Math.min(ie, ia), 2, r(P(A_MAPA, FONDO)));
  const p = [P(A0), P(A0, FONDO), P(A1, FONDO), P(A1)].map(r);
  p.push(p[0].slice());
  map.buildings.push({ p, h: ALTO, k: 'gen', s: 0, f: [240, 226, 188], c: [200, 196, 188], edificioReal: true });
  map.snackLosPicachos = true;
}

// ——— las texturas ———

const liso = color => (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); };
const tx = (w, h, fn) => canvasTex(Math.max(16, Math.min(1024, Math.round(w * 60))), Math.max(16, Math.round(h * 60)), fn);

/** el letrero del bar: el arco blanco con «LOS PICACHOS» y el panel verde con lo que tienen */
function letrero(g, w, h) {
  g.fillStyle = '#f0f0ec';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#2e8a5a';
  g.fillRect(0, h * 0.42, w, h * 0.58);
  g.strokeStyle = '#1e5a3a';
  g.lineWidth = 3;
  g.strokeRect(1.5, h * 0.42, w - 3, h * 0.58 - 1.5);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#2e8a5a';
  g.font = `italic ${Math.round(h * 0.2)}px Georgia, serif`;
  g.fillText('Los Picachos', w / 2, h * 0.24, w * 0.6);
  g.fillStyle = '#ffffff';
  g.font = `bold ${Math.round(h * 0.2)}px Georgia, serif`;
  g.fillText('SNAK BAR', w * 0.58, h * 0.55, w * 0.7);
  g.font = `bold ${Math.round(h * 0.08)}px Arial, sans-serif`;
  g.fillText('BOCATERÍA - CAFETERÍA', w * 0.58, h * 0.7, w * 0.62);
  g.fillText('HAMBURGUESERÍA', w * 0.58, h * 0.8, w * 0.5);
  g.font = `bold ${Math.round(h * 0.07)}px Arial, sans-serif`;
  g.fillText('GRAN PANTALLA TV', w * 0.4, h * 0.92, w * 0.4);
  g.fillStyle = '#c82a2a';
  g.fillRect(w * 0.62, h * 0.9, w * 0.3, h * 0.04);
}

/** el bar por dentro: las mesas y las sillas rojas y la barra del fondo */
function barDentro(g, w, h) {
  g.fillStyle = '#3a3634';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8d4cc';
  g.fillRect(0, 0, w, h * 0.12);
  g.fillStyle = '#8a4a2a';
  g.fillRect(0, h * 0.85, w, h * 0.15);
  g.fillStyle = '#5a5452';
  g.fillRect(w * 0.6, h * 0.4, w * 0.35, h * 0.3);
  for (const x of [0.12, 0.35, 0.55]) {
    g.fillStyle = '#c82a2a';
    g.fillRect(w * x, h * 0.55, w * 0.08, h * 0.25);
    g.fillRect(w * (x + 0.12), h * 0.55, w * 0.08, h * 0.25);
    g.fillStyle = '#e8e4dc';
    g.fillRect(w * (x + 0.02), h * 0.52, w * 0.16, h * 0.04);
  }
}

/** la persiana enrollable ocre, bajada */
function persianaOcre(g, w, h) {
  g.fillStyle = '#d8a850';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#b88a3a';
  g.lineWidth = 1;
  for (let y = 2; y < h; y += 3) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** las rejas oscuras de la ventana, por debajo de la persiana */
function rejasOscuras(g, w, h) {
  g.fillStyle = '#2a2a2c';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8e4dc';
  for (let x = 6; x < w; x += 14) g.fillRect(x, 2, 8, h - 4);
}

/** la puerta blanca de rejas de la cara de Fasnia */
function puertaRejas(g, w, h) {
  g.fillStyle = '#f4f4f0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#3a3a3c';
  g.fillRect(w * 0.12, h * 0.06, w * 0.76, h * 0.38);
  g.fillStyle = '#f4f4f0';
  for (let x = w * 0.16; x < w * 0.86; x += w * 0.1) g.fillRect(x, h * 0.06, 3, h * 0.38);
  g.strokeStyle = '#c8c8c4';
  g.lineWidth = 2;
  g.strokeRect(w * 0.12, h * 0.5, w * 0.76, h * 0.44);
}

/** un paño de celosía de bloques blancos */
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
    }
  }
}

// ——— las piezas ———

/** un hueco de a0 a a1 y de y0 a y1 */
const hu = (k, a0, a1, y0, y1, fn, borde, z = ZF + 0.04) => hueco(k, s((a0 + a1) / 2), y0, a1 - a0, y1 - y0, tx(a1 - a0, y1 - y0, fn), { borde, z });
/** una caja pegada a la fachada de a0 a a1 y de y0 a y1, que sale «sale» m */
const caja = (k, a0, a1, y0, y1, sale, color) => k.box(s((a0 + a1) / 2), y0, ZF + sale / 2, a1 - a0, y1 - y0, sale, color);
/** un letrero del bar de a0 a a1 y de y0 a y1 */
function cartel(k, x0, x1, y0, y1) {
  k.box((x0 + x1) / 2, y0, ZF + 0.04, x1 - x0, y1 - y0, 0.08, 0xf0f0ec);
  k.pic((x0 + x1) / 2, (y0 + y1) / 2, ZF + 0.082, x1 - x0, y1 - y0, 0, 1, tx(x1 - x0, y1 - y0, letrero));
}

/** la cara de León y Castillo */
function caraLyC(k) {
  pared(k, s(A0), s(A1), ALTO, liso(CREMA));
  caja(k, A0, A1, 0, 1.3, 0.03, 0xe2d2a8);
  // la ventana de la persiana: el marco ocre, el cajón, la persiana bajada y las rejas de abajo
  hu(k, 57.46, 60.68, 1.83, 2.95, persianaOcre, OCRE);
  hu(k, 57.46, 60.68, 1.51, 1.83, rejasOscuras, OCRE);
  caja(k, 57.36, 60.78, 2.95, 3.36, 0.3, OCRE);
  // la puerta abierta del bar con su cajón y su escalón, y las dos repisas
  hu(k, 65.22, 67.83, 0.31, 2.95, barDentro, 0x8a6a3a);
  caja(k, 65.15, 68.1, 2.95, 3.36, 0.3, OCRE);
  caja(k, 65.19, 68.07, 0, 0.31, 0.35, 0xb8583a);
  for (const [a0, a1, y] of [[64.09, 65.2, 1.25], [67.94, 69.11, 1.38]]) caja(k, a0, a1, y - 0.05, y, 0.28, 0x8a6a3a);
  // los letreros, las placas pequeñas y las dos ventanas de arriba
  cartel(k, s(57.2), s(60.7), 4.35, 5.76);
  cartel(k, s(64.97), s(68.41), 4.39, 5.85);
  caja(k, 66.32, 66.7, 4.04, 4.32, 0.06, 0xc8402a);
  caja(k, 64.74, 64.94, 2.55, 2.95, 0.02, 0xf2f2ee);
  caja(k, 68.3, 68.64, 2.82, 3.12, 0.02, 0xd86a2a);
  for (const [a0, a1, y0, y1] of [[62.24, 63.53, 5.95, 7.13], [66.55, 67.84, 6.0, 7.18]]) hu(k, a0, a1, y0, y1, cristales('#f2f2ee', 2), 0xf2f2ee, ZF);
  caja(k, A0, A1, ALTO - 0.2, ALTO, 0.1, 0xe8d8b0);
}

/** el toldo de la ventanilla de Fasnia */
function toldo(k, x0, x1) {
  const ySal = 3.0, yFuera = 2.45, sale = 1.0, c = (x0 + x1) / 2, w = x1 - x0;
  const ang = Math.atan2(ySal - yFuera, sale), largo = Math.hypot(ySal - yFuera, sale);
  const geo = new THREE.BoxGeometry(w, 0.04, largo);
  geo.rotateX(ang);
  geo.translate(c, (ySal + yFuera) / 2, ZF + sale / 2);
  k.add(geo, 0xe8e0cc);
  k.box(c, yFuera - 0.22, ZF + sale + 0.01, w, 0.22, 0.02, 0xe8e0cc);
}

/** la cara de la calle Fasnia (t desde la esquina hacia el oeste) */
function caraFasnia(k) {
  const L = FN.len;
  pared(k, 0, L, ALTO, liso(CREMA));
  k.box(L / 2, 0, ZF + 0.015, L, 1.3, 0.03, 0xe2d2a8);
  hueco(k, 3.25, 1.0, 2.3, 1.4, tx(2.3, 1.4, cristales('#5a5a58', 2, 'rgba(240,236,228,.3)')), { borde: 0xd8d4cc, z: ZF + 0.04 });
  k.box(3.25, 0.95, ZF + 0.15, 2.4, 0.05, 0.3, 0xd8d4cc);
  toldo(k, 2.0, 4.6);
  k.box(1.15, 4.3, ZF + 0.04, 1.7, 1.3, 0.08, 0xf0f0ec);
  k.pic(1.15, 4.95, ZF + 0.082, 1.7, 1.3, 0, 1, tx(1.7, 1.3, letrero));
  for (const [t0, t1] of [[5.9, 6.8], [8.0, 9.0], [11.0, 11.9]]) hueco(k, (t0 + t1) / 2, 6.0, t1 - t0, 1.15, tx(t1 - t0, 1.15, cristales('#f2f2ee', 2)), { borde: 0xf2f2ee, z: ZF });
  for (const t of [8.35, 8.75]) k.box(t, 0.5, ZF + 0.07, 0.36, 0.9, 0.14, 0xe8e8e4);
  hueco(k, 10.6, 0, 1.2, 2.3, tx(1.2, 2.3, puertaRejas), { borde: 0xf2f2ee, z: ZF + 0.04 });
  hueco(k, 11.6, 1.3, 0.7, 1.5, tx(0.7, 1.5, celosia), { borde: 0xf4f2ec, z: ZF + 0.02 });
  k.box(L / 2, ALTO - 0.2, ZF + 0.05, L, 0.2, 0.1, 0xe8d8b0);
}

/** se monta con lo demás */
export function buildSnackLosPicachos(scene, colliders, map) {
  if (!map?.snackLosPicachos) return null;
  const k = new Kit(), kn = new Kit();
  caraLyC(k);
  caraFasnia(kn);
  const grupos = [enMarco(k, F, 'snackLosPicachos', colliders), enMarco(kn, FN, 'snackLosPicachosFasnia', colliders)];
  // la pared del sur, que asoma por encima de la casa del pasaje, y la de atrás, lisas
  const lisa = (A, B, alto, nombre) => tira(A, B, alto, nombre, colliders, (kk, L) => pared(kk, 0, L, alto, liso('#ece0bc'), -0.25));
  grupos.push(lisa(P(A0, FONDO), P(A0), ALTO, 'snackLadoSur'));
  grupos.push(lisa(P(A1, FONDO), P(A0, FONDO), ALTO, 'snackTrasera'));
  for (const g of grupos) scene.add(g);
  return { grupos };
}
