import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco } from './restaurantesCharco.js';
import { ZF, pared, tira } from './rapadurasSur.js';
import { tuneBodegonMencey } from './bodegonMencey.js';

/**
 * El edificio de Canary-Tel 2 y de Fte (calle León y Castillo 193, la LZ-1, Altavista, al norte del Bodegón Los Mencey),
 * con las vistas de la calle de Google de julio de 2025 (LZ-1 191, 193 y 195; solo se miran, no van dentro del juego),
 * medido con el foco bueno de las capturas (475 px). En el mapa era el bloque genérico de 5 m de toda la manzana. De
 * verdad es un edificio color crema de tres plantas que sale 2,6 m más a la calle que el bodegón (por eso, desde el sur,
 * se ve su pared blanca del lado del bodegón):
 * - el tramo de Canary-Tel 2 (9,3 m de alto): la cristalera con la puerta de aluminio, el buzón, la columna negra de lo
 *   que hacen, el cartel de las placas solares con «SUNTELCO energías renovables», el letrero rojo «CANARY-TEL 2
 *   Telecomunicaciones» y la celosía de lamas;
 * - el tramo de Fte (10,5 m): el portal, el escaparate con los carteles de placas solares, las dos ventanas con la
 *   persiana, la lona con «Fte» y lo que hacen (antenas, sonido, domótica, cámaras, porteros y megafonía; sin los
 *   teléfonos ni el correo, y sin los dibujos de las marcas) y la celosía de lamas.
 */

// la cara de León y Castillo, con el mismo marco que el Bodegón Los Mencey (n hacia el norte desde la esquina sur)
const ESQ_S = [396.6, -1409.71], ESQ_N = [409.82, -1490.89];
const UN = [0.16073, -0.987], NE = [0.987, 0.16073];
const P = (n, b = 0) => [ESQ_S[0] + UN[0] * n - NE[0] * b, ESQ_S[1] + UN[1] * n - NE[1] * b];
// los dos tramos, medidos en las vistas de la calle; la fachada sale AD m más a la calle que la del bodegón
const N0 = 54.4, N1 = 58.32, N2 = 63.9, AD = 2.6, FONDO = 12;
const ALTO_C = 9.25, ALTO_F = 10.5;
const F = marco(P(N0, -AD), P(N2, -AD));
const s = n => n - N0;

const CREMA = '#e2d2b2', ROJO = 0xc8282a;

/** antes de levantar la ciudad: el edificio sale del bloque genérico de 5 m, al lado del bodegón, y sale a la acera */
export function tuneCanaryTel(map) {
  if (!Array.isArray(map?.buildings)) return;
  // va detrás del bodegón, que es el que deja la esquina de donde se parte (en la web los retoques van al revés)
  if (!map.bodegonMencey) tuneBodegonMencey(map);
  const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const r = q => [+q[0].toFixed(2), +q[1].toFixed(2)];
  const A = r(P(N0));
  const b = map.buildings.find(q => !q.skip && !q.edificioReal && Array.isArray(q.p) && q.p.some(p => d(p, A) < 0.3) && q.p.some(p => d(p, ESQ_N) < 0.3));
  if (!b) return;
  const i = b.p.findIndex(p => d(p, A) < 0.3);
  const antes = b.p[i - 1];
  const nuevo = (antes && d(antes, ESQ_N) < 0.3 ? [P(N2), P(N2, FONDO)] : [P(N2, FONDO), P(N2)]).map(r);
  b.p.splice(i, 1, ...nuevo);
  for (const [n0, n1, h] of [[N0, N1, ALTO_C], [N1, N2, ALTO_F]]) {
    const p = [P(n0, -AD), P(n0, FONDO), P(n1, FONDO), P(n1, -AD)].map(r);
    p.push(p[0].slice());
    map.buildings.push({ p, h, k: 'gen', s: 0, f: [226, 210, 178], c: [200, 196, 188], edificioReal: true });
  }
  map.canaryTel = true;
}

// ——— las texturas ———

const liso = color => (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); };

/** las placas solares de los carteles: celdas azul oscuro con el brillo */
function placas(g, w, h, y0 = 0, y1 = h) {
  g.fillStyle = '#1a2a48';
  g.fillRect(0, y0, w, y1 - y0);
  g.strokeStyle = '#8a9ab8';
  g.lineWidth = 1;
  for (let x = 0; x < w; x += 8) { g.beginPath(); g.moveTo(x, y0); g.lineTo(x + (y1 - y0) * 0.3, y1); g.stroke(); }
  for (let y = y0; y < y1; y += 8) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  const gr = g.createLinearGradient(0, y0, w, y1);
  gr.addColorStop(0, 'rgba(255,255,255,0)');
  gr.addColorStop(0.5, 'rgba(200,220,255,.3)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, y0, w, y1 - y0);
}

/** el cartel grande de encima de la puerta: las placas y «SUNTELCO energías renovables» */
function suntelco(g, w, h) {
  placas(g, w, h, 0, h * 0.72);
  g.fillStyle = '#1e1e22';
  g.fillRect(0, h * 0.72, w, h * 0.28);
  g.fillStyle = '#ffffff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `bold ${Math.round(h * 0.13)}px Arial, sans-serif`;
  g.fillText('SUNTELCO', w / 2, h * 0.81, w * 0.8);
  g.font = `${Math.round(h * 0.07)}px Arial, sans-serif`;
  g.fillText('energías renovables', w / 2, h * 0.93, w * 0.7);
}

/** los escaparates con los carteles de placas solares */
function escaparatePlacas(g, w, h) {
  g.fillStyle = '#2a3038';
  g.fillRect(0, 0, w, h);
  const n = Math.max(2, Math.round(w / (h * 0.4)));
  for (let i = 0; i < n; i++) {
    const x0 = (w / n) * i + 3, x1 = (w / n) * (i + 1) - 3;
    g.save();
    g.beginPath(); g.rect(x0, 4, x1 - x0, h - 8); g.clip();
    placas(g, w, h, 4, h - 4);
    g.restore();
    g.fillStyle = 'rgba(240,200,60,.8)';
    g.fillRect(x0, h * 0.82, x1 - x0, h * 0.05);
  }
  g.strokeStyle = '#d8d8d4';
  g.lineWidth = 3;
  for (let i = 0; i <= n; i++) { const x = (w / n) * i; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
}

/** la columna negra con la lista de lo que hacen (de lejos, solo las rayas blancas) */
function columna(g, w, h) {
  g.fillStyle = '#141416';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8e8e4';
  for (let y = h * 0.06; y < h * 0.95; y += h * 0.07) g.fillRect(w * 0.15, y, w * (0.45 + ((y * 7) % 30) / 100), h * 0.015);
}

/** la puerta de aluminio con cristal */
function puertaAluminio(g, w, h) {
  g.fillStyle = '#c8c8c4';
  g.fillRect(0, 0, w, h);
  for (const x0 of [0.06, 0.53]) {
    g.fillStyle = '#3a4048';
    g.fillRect(w * x0, h * 0.04, w * 0.41, h * 0.92);
    g.fillStyle = 'rgba(255,255,255,.14)';
    g.fillRect(w * (x0 + 0.06), h * 0.06, w * 0.07, h * 0.88);
  }
  g.fillStyle = '#8a8a86';
  g.fillRect(w * 0.44, h * 0.45, w * 0.04, h * 0.12);
  g.fillRect(w * 0.52, h * 0.45, w * 0.04, h * 0.12);
}

/** la celosía de lamas de arriba */
function lamas(g, w, h) {
  g.fillStyle = '#5a554c';
  g.fillRect(0, 0, w, h);
  for (let y = 2; y < h; y += 5) {
    g.fillStyle = '#9a9284';
    g.fillRect(0, y, w, 3);
  }
  g.fillStyle = '#e2d2b2';
  const n = Math.max(2, Math.round(w / (h * 1.2)));
  for (let i = 1; i < n; i++) g.fillRect((w / n) * i - 2, 0, 4, h);
}

/** el letrero rojo de Canary-Tel 2 */
function letreroCanary(g, w, h) {
  g.fillStyle = '#c8282a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#ffffff';
  g.fillRect(0, h * 0.06, w, h * 0.03);
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.font = `bold ${Math.round(h * 0.42)}px Arial, sans-serif`;
  g.fillText('CANARY-TEL 2', w * 0.06, h * 0.42, w * 0.85);
  g.textAlign = 'right';
  g.font = `${Math.round(h * 0.16)}px Arial, sans-serif`;
  g.fillText('Telecomunicaciones', w * 0.94, h * 0.8, w * 0.6);
}

/** la lona roja con lo que hacen */
function lonaServicios(g, w, h) {
  g.fillStyle = '#c8282a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#ffffff';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.font = `bold ${Math.round(h * 0.2)}px Arial, sans-serif`;
  const cols = [['· Antenas TV y Satélite', '· Cámaras de Vigilancia'], ['· Sonido Ambiental', '· Vídeo Portero'], ['· Domótica', '· Megafonía']];
  cols.forEach((c, i) => c.forEach((t, j) => g.fillText(t, w * (0.03 + i * 0.34), h * (0.3 + j * 0.36), w * 0.3)));
}

/** la lona de Fte: la franja blanca con el nombre y, debajo, lo que hacen sobre rojo */
function lonaFte(g, w, h) {
  g.fillStyle = '#f4f2ee';
  g.fillRect(0, 0, w, h * 0.42);
  g.fillStyle = '#c8282a';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.font = `bold italic ${Math.round(h * 0.34)}px Arial, sans-serif`;
  g.fillText('Fte', w * 0.04, h * 0.22, w * 0.25);
  g.save();
  g.translate(0, h * 0.42);
  lonaServicios(g, w, h * 0.58);
  g.restore();
}

/** una ventana de Fte: la persiana a medio bajar arriba y los paneles crema abajo */
function ventanaFte(g, w, h) {
  g.fillStyle = '#c8bca0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#3a4048';
  g.fillRect(w * 0.04, h * 0.04, w * 0.92, h * 0.44);
  g.strokeStyle = '#d8d0c0';
  g.lineWidth = 1;
  for (let y = h * 0.06; y < h * 0.3; y += 3) { g.beginPath(); g.moveTo(w * 0.04, y); g.lineTo(w * 0.96, y); g.stroke(); }
  g.strokeStyle = '#9a9078';
  g.lineWidth = 2;
  g.strokeRect(w * 0.04, h * 0.54, w * 0.44, h * 0.42);
  g.strokeRect(w * 0.52, h * 0.54, w * 0.44, h * 0.42);
}

// ——— las piezas ———

const tx = (w, h, fn) => canvasTex(Math.max(16, Math.min(1024, Math.round(w * 60))), Math.max(16, Math.round(h * 60)), fn);
/** un hueco de n0 a n1 y de y0 a y1 */
const hu = (k, n0, n1, y0, y1, fn, borde, z = ZF + 0.05) => hueco(k, s((n0 + n1) / 2), y0, n1 - n0, y1 - y0, tx(n1 - n0, y1 - y0, fn), { borde, z });
/** una caja pegada a la fachada de n0 a n1 y de y0 a y1, que sale «sale» m */
const caja = (k, n0, n1, y0, y1, sale, color) => k.box(s((n0 + n1) / 2), y0, ZF + sale / 2, n1 - n0, y1 - y0, sale, color);

/** el tramo de Canary-Tel 2 */
function tramoCanary(k) {
  pared(k, s(N0), s(N1), ALTO_C, liso(CREMA));
  caja(k, 54.48, 54.72, 1.3, 1.57, 0.1, 0x1e1e20);
  hu(k, 54.64, 55.36, 0.2, 2.37, escaparatePlacas, 0xc8c8c4);
  hu(k, 55.43, 57.2, 0.2, 2.37, puertaAluminio, 0xc8c8c4);
  hu(k, 57.34, 58.02, 0.2, 2.37, columna, 0x2a2a2c);
  // el cartel de las placas con Suntelco y sus dos lados de placas
  hu(k, 54.6, 55.36, 2.44, 4.75, escaparatePlacas, 0xc8c8c4);
  hu(k, 55.43, 57.3, 2.44, 4.75, suntelco, 0xc8c8c4);
  hu(k, 57.36, 58.02, 2.44, 4.75, escaparatePlacas, 0xc8c8c4);
  // el letrero rojo, la celosía de lamas y el remate
  caja(k, 54.45, 58.15, 5.01, 6.1, 0.14, ROJO);
  k.pic(s(56.3), 5.555, ZF + 0.142, 3.7, 1.09, 0, 1, canvasTex(370, 109, letreroCanary));
  hu(k, 54.5, 58.25, 6.29, 7.35, lamas, 0x9a9284, ZF + 0.02);
  caja(k, N0, N1, ALTO_C - 0.25, ALTO_C, 0.1, 0xd8c8a8);
}

/** el tramo de Fte */
function tramoFte(k) {
  pared(k, s(N1), s(N2), ALTO_F, liso(CREMA));
  caja(k, 58.2, 58.6, 0, 2.4, 0.06, 0xb89a8a);
  hu(k, 59.11, 60.03, 0.14, 2.24, liso('#d8ccb0'), 0xc8bca0);
  hu(k, 60.16, 62.98, 0.08, 2.3, escaparatePlacas, 0xd8d8d4);
  for (const [n0, n1] of [[59.16, 61.3], [61.34, 63.04]]) hu(k, n0, n1, 2.71, 4.6, ventanaFte, 0xd8d0c0, ZF);
  caja(k, 58.6, 63.85, 4.89, 6.74, 0.1, 0xf4f2ee);
  k.pic(s(61.225), 5.815, ZF + 0.102, 5.25, 1.85, 0, 1, canvasTex(525, 185, lonaFte));
  hu(k, 59.24, 63.48, 6.89, 8.13, lamas, 0x9a9284, ZF + 0.02);
  caja(k, N1, N2, ALTO_F - 0.25, ALTO_F, 0.1, 0xd8c8a8);
}

/** se monta con lo demás */
export function buildCanaryTel(scene, colliders, map) {
  if (!map?.canaryTel) return null;
  const k = new Kit();
  tramoCanary(k);
  tramoFte(k);
  const grupos = [enMarco(k, F, 'canaryTel', colliders)];
  // las paredes de los lados (la blanca del lado del bodegón, la del norte, que sale sobre la casa vieja) y de atrás
  const lisa = (A, B, alto, nombre, color) => tira(A, B, alto, nombre, colliders, (kk, L) => pared(kk, 0, L, alto, liso(color), -0.25));
  grupos.push(lisa(P(N0), P(N0, -AD), ALTO_C, 'canaryTelLadoSur', '#f0f0ec'));
  grupos.push(lisa(P(N2, -AD), P(N2, FONDO), ALTO_F, 'canaryTelLadoNorte', '#dccca8'));
  grupos.push(lisa(P(N1, FONDO), P(N1, -AD), ALTO_F, 'canaryTelEscalon', '#dccca8'));
  grupos.push(lisa(P(N1, FONDO), P(N0, FONDO), ALTO_C, 'canaryTelTrasera', '#e8e6e0'));
  grupos.push(lisa(P(N2, FONDO), P(N1, FONDO), ALTO_F, 'canaryTelTraseraFte', '#e8e6e0'));
  for (const g of grupos) scene.add(g);
  return { grupos };
}
