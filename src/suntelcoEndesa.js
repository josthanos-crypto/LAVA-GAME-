import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';
import { ZF, pared, tira } from './rapadurasSur.js';
import { tuneBodegonMencey } from './bodegonMencey.js';

/**
 * La oficina de Suntelco y Punto de Servicio de Endesa (calle León y Castillo 187, la LZ-1, Altavista) y las dos casas
 * de al lado, con las vistas de la calle de Google de julio de 2025 (LZ-1 185, 187 y 189; solo se miran, no van dentro
 * del juego), medidas con el foco bueno de las capturas (475 px). En el mapa era el bloque genérico de 5 m. De verdad:
 * - la casa blanca de dos plantas del balcón (6,5 m de ancho y 8 de alto): abajo, el marco de piedra del portal con la
 *   puerta de madera, el buzón, el portero, el letrero «SUNTELCO energías renovables» (sin el dibujo del rayo) y las dos
 *   puertas de cristal azulado con el azulejo negro; arriba, el balcón metido con la barandilla oscura, las dos ventanas,
 *   el aparato del aire, la losa del tejado y el cuartito de la ventana de madera;
 * - la casa alta de al lado (casi 10 m): el escaparate azul de la oficina con los carteles, el letrero «SUNTELCO ·
 *   Punto de Servicio · endesa» (solo los nombres), la banderola azul, el azulejo negro, la puerta verde estrecha y la
 *   ventana de arriba;
 * - la casa blanca de dos plantas del portón verde: el portón, las placas de vado, los contadores y las dos ventanas de
 *   tres hojas de marco verde.
 */

// la cara de León y Castillo, con el mismo marco que el Bodegón Los Mencey (n hacia el norte desde la esquina sur)
const ESQ_S = [396.6, -1409.71];
const UN = [0.16073, -0.987], NE = [0.987, 0.16073];
const P = (n, b = 0) => [ESQ_S[0] + UN[0] * n - NE[0] * b, ESQ_S[1] + UN[1] * n - NE[1] * b];
// dónde empieza cada casa (en n), medido en las vistas de la calle; en N3 empieza la casa alta del bodegón
const N0 = 24.7, N1 = 31.21, N2 = 35.75, N3 = 42.85, FONDO = 12;
const ALTO1 = 8.0, ALTO2 = 9.9, ALTO3 = 8.98;
const F = marco(P(N0), P(N3));
const s = n => n - N0;

const VERDE = 0x2e7a46, NEGRO = 0x1e1e20, BARANDA = 0x2a2a2c;

/** antes de levantar la ciudad: las tres casas salen del bloque genérico de 5 m, al sur del bodegón */
export function tuneSuntelcoEndesa(map) {
  if (!Array.isArray(map?.buildings)) return;
  // parte de la esquina que deja el bodegón (en la web los retoques van al revés)
  if (!map.bodegonMencey) tuneBodegonMencey(map);
  const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const r = q => [+q[0].toFixed(2), +q[1].toFixed(2)];
  const A = r(P(N3)), B = r(P(N3, FONDO));
  const b = map.buildings.find(q => !q.skip && !q.edificioReal && Array.isArray(q.p) && q.p.some(p => d(p, A) < 0.3) && q.p.some(p => d(p, B) < 0.3));
  if (!b) return;
  const i = b.p.findIndex(p => d(p, A) < 0.3);
  const antes = b.p[i - 1];
  // el bloque pierde el frente de N0 a N3 (12 m de fondo)
  const nuevo = (antes && d(antes, B) < 0.3 ? [P(N0, FONDO), P(N0)] : [P(N0), P(N0, FONDO)]).map(r);
  b.p.splice(i, 1, ...nuevo);
  for (const [n0, n1, h] of [[N0, N1, ALTO1], [N1, N2, ALTO2], [N2, N3, ALTO3]]) {
    const p = [P(n0), P(n0, FONDO), P(n1, FONDO), P(n1)].map(r);
    p.push(p[0].slice());
    map.buildings.push({ p, h, k: 'gen', s: 0, f: [242, 242, 238], c: [200, 196, 188], edificioReal: true });
  }
  map.suntelcoEndesa = true;
}

// ——— las texturas ———

const liso = color => (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); };
const tx = (w, h, fn) => canvasTex(Math.max(16, Math.min(1024, Math.round(w * 60))), Math.max(16, Math.round(h * 60)), fn);

/** el letrero blanco de Suntelco */
function letreroSuntelco(g, w, h) {
  g.fillStyle = '#f6f6f2';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#1e1e22';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `bold ${Math.round(h * 0.5)}px Arial, sans-serif`;
  g.fillText('SUNTELCO', w * 0.55, h * 0.38, w * 0.7);
  g.font = `italic ${Math.round(h * 0.24)}px Arial, sans-serif`;
  g.fillText('energías renovables', w * 0.6, h * 0.8, w * 0.6);
}

/** el letrero del punto de servicio: «SUNTELCO · Punto de Servicio · endesa», en azul sobre blanco */
function letreroEndesa(g, w, h) {
  g.fillStyle = '#f4f6f8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#2a4a8a';
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  g.font = `bold ${Math.round(h * 0.28)}px Arial, sans-serif`;
  g.fillText('SUNTELCO', w * 0.04, h * 0.5, w * 0.24);
  g.font = `${Math.round(h * 0.24)}px Arial, sans-serif`;
  g.fillText('Punto de', w * 0.33, h * 0.36, w * 0.2);
  g.fillText('Servicio', w * 0.33, h * 0.68, w * 0.2);
  g.fillStyle = '#3a6ab8';
  g.font = `${Math.round(h * 0.6)}px Arial, sans-serif`;
  g.fillText('endesa', w * 0.58, h * 0.52, w * 0.38);
}

/** una puerta de cristal azulado con el marco negro y el montante de arriba */
function puertaAzul(g, w, h) {
  g.fillStyle = '#1e1e20';
  g.fillRect(0, 0, w, h);
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, '#6aa8d8');
  gr.addColorStop(1, '#3a7ab8');
  g.fillStyle = gr;
  g.fillRect(w * 0.08, h * 0.04, w * 0.84, h * 0.92);
  g.strokeStyle = '#1e1e20';
  g.lineWidth = 3;
  g.beginPath(); g.moveTo(w / 2, h * 0.22); g.lineTo(w / 2, h); g.moveTo(0, h * 0.22); g.lineTo(w, h * 0.22); g.stroke();
  g.lineWidth = 1.5;
  for (let x = -h; x < w; x += 10) { g.beginPath(); g.moveTo(x, h * 0.22); g.lineTo(x + h * 0.18, h * 0.04); g.stroke(); }
  g.fillStyle = '#f2f2ee';
  g.fillRect(w * 0.15, h * 0.34, w * 0.25, h * 0.1);
}

/** el escaparate de la oficina: el cristal azulado con los carteles azules */
function escaparateEndesa(g, w, h) {
  g.fillStyle = '#e8eef4';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#4a8ac8';
  g.fillRect(0, 0, w, h * 0.12);
  g.fillStyle = '#2a5ab8';
  g.fillRect(w * 0.15, h * 0.55, w * 0.45, h * 0.3);
  g.fillStyle = '#f2f2ee';
  for (let i = 0; i < 4; i++) g.fillRect(w * 0.2, h * (0.6 + i * 0.06), w * 0.3, h * 0.025);
  g.strokeStyle = '#1e1e20';
  g.lineWidth = 4;
  g.strokeRect(2, 2, w - 4, h - 4);
}

/** la puerta de madera del portal */
function portalMadera(g, w, h) {
  g.fillStyle = '#8a5a34';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#6a4224';
  g.lineWidth = 2;
  for (let x = w / 5; x < w; x += w / 5) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
}

/** la piedra gris parda del marco del portal */
function piedraMarco(g, w, h) {
  g.fillStyle = '#8a8274';
  g.fillRect(0, 0, w, h);
  let sd = 17;
  const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < w * h / 12; i++) {
    g.fillStyle = rnd() < 0.5 ? 'rgba(60,56,50,.35)' : 'rgba(190,182,170,.35)';
    g.fillRect(rnd() * w, rnd() * h, 2, 2);
  }
}

/** una puerta o un portón verde de tablas */
function tablasVerdes(g, w, h) {
  g.fillStyle = '#2e7a46';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#1e5a32';
  g.lineWidth = 2;
  for (let x = w / 8; x < w; x += w / 8) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
}

/** el azulejo negro brillante de la oficina */
function azulejoNegro(g, w, h) {
  g.fillStyle = '#1a1a1c';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#3a3a3e';
  g.lineWidth = 1;
  for (let x = 0; x < w; x += 10) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y < h; y += 10) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
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

// ——— las piezas ———

/** un hueco de n0 a n1 y de y0 a y1 */
const hu = (k, n0, n1, y0, y1, fn, borde, z = ZF + 0.04) => hueco(k, s((n0 + n1) / 2), y0, n1 - n0, y1 - y0, tx(n1 - n0, y1 - y0, fn), { borde, z });
/** una caja pegada a la fachada de n0 a n1 y de y0 a y1, que sale «sale» m */
const caja = (k, n0, n1, y0, y1, sale, color) => k.box(s((n0 + n1) / 2), y0, ZF + sale / 2, n1 - n0, y1 - y0, sale, color);
/** una ventana con su carpintería */
const ventana = (k, n0, n1, y0, y1, color = '#3a3030', hojas = 2, z = ZF) => hu(k, n0, n1, y0, y1, cristales(color, hojas), parseInt(color.slice(1), 16), z);

/** la casa del balcón, con el portal y la parte de Suntelco */
function casaBalcon(k) {
  pared(k, s(N0), s(N1), ALTO1, liso('#f2f2ee'));
  // abajo: el marco de piedra del portal con la puerta de madera, el buzón, el portero y los contadores
  caja(k, N0, 25.91, 0, 2.98, 0.08, 0x8a8274);
  k.pic(s((N0 + 25.91) / 2), 1.49, ZF + 0.084, 25.91 - N0, 2.98, 0, 1, tx(25.91 - N0, 2.98, piedraMarco));
  hu(k, 24.85, 25.69, 0.1, 2.18, portalMadera, 0x6a4224, ZF + 0.1);
  hu(k, 24.85, 25.69, 2.18, 2.71, cristales('#6a4224', 1), 0x6a4224, ZF + 0.1);
  caja(k, 24.72, 24.82, 1.15, 1.5, 0.16, NEGRO);
  caja(k, 25.98, 26.25, 1.59, 1.91, 0.06, 0xf0f0ec);
  caja(k, 25.98, 26.25, 0.25, 0.5, 0.1, 0xf0f0ec);
  // las dos puertas azuladas, el azulejo negro y el letrero
  hu(k, 26.27, 27.81, 0.14, 2.8, puertaAzul, NEGRO, ZF + 0.07);
  hu(k, 28.97, 30.6, 0.14, 2.8, puertaAzul, 0xc8a040, ZF + 0.07);
  for (const [n0, n1] of [[27.81, 28.97], [30.6, N1]]) {
    caja(k, n0, n1, 0, 1.59, 0.05, NEGRO);
    k.pic(s((n0 + n1) / 2), 0.795, ZF + 0.052, n1 - n0, 1.59, 0, 1, tx(n1 - n0, 1.59, azulejoNegro));
  }
  caja(k, 26.8, 30.41, 3.13, 3.9, 0.08, 0xf6f6f2);
  k.pic(s(28.605), 3.515, ZF + 0.082, 3.61, 0.77, 0, 1, canvasTex(361, 77, letreroSuntelco));
  // arriba: el balcón metido con su pared del sur, la barandilla oscura, las dos ventanas y el aparato del aire
  caja(k, 25.96, N1, 4.5, 4.7, 0.9, 0xf2f2ee);
  caja(k, 25.85, 25.96, 4.7, 7.78, 0.9, 0xf2f2ee);
  const zr = ZF + 0.85;
  k.box(s((25.96 + N1) / 2), 5.45, zr, N1 - 25.96, 0.05, 0.05, BARANDA);
  k.box(s((25.96 + N1) / 2), 4.75, zr, N1 - 25.96, 0.04, 0.04, BARANDA);
  for (let x = s(26.05); x <= s(N1 - 0.05); x += 0.13) k.box(x, 4.7, zr, 0.025, 0.75, 0.025, BARANDA);
  for (const [n0, n1] of [[26.33, 27.53], [28.87, 30.06]]) ventana(k, n0, n1, 5.0, 6.15);
  caja(k, 30.4, 31.06, 6.5, 7.29, 0.3, 0xe4e4e0);
  caja(k, N0, N1, 7.78, ALTO1, 0.3, 0xeeeeea);
  // el cuartito de arriba, un poco metido, con su ventana de madera
  k.box(s(30.15), ALTO1, -2.25, 1.7, 2.2, 2.5, 0xf2f2ee);
  ventana(k, 29.5, 30.8, ALTO1 + 0.45, ALTO1 + 1.85, '#6a4224', 3, -1.0);
}

/** la casa alta, con el escaparate del punto de servicio */
function casaOficina(k) {
  pared(k, s(N1), s(N2), ALTO2, liso('#f2f2ee'));
  caja(k, N1, N2, ALTO2 - 0.25, ALTO2, 0.1, 0xe8e8e4);
  caja(k, N1, 34.82, 0, 0.6, 0.05, NEGRO);
  k.pic(s((N1 + 34.82) / 2), 0.3, ZF + 0.052, 34.82 - N1, 0.6, 0, 1, tx(34.82 - N1, 0.6, azulejoNegro));
  hu(k, 31.4, 34.5, 0.6, 3.17, escaparateEndesa, NEGRO, ZF + 0.07);
  caja(k, 31.3, 34.7, 3.24, 3.95, 0.06, 0xf4f6f8);
  k.pic(s(33.0), 3.595, ZF + 0.062, 3.4, 0.71, 0, 1, canvasTex(340, 71, letreroEndesa));
  // la banderola azul de la esquina, de canto a la fachada
  k.box(s(N1 + 0.05), 3.3, ZF + 0.35, 0.1, 0.8, 0.6, 0x2a6ab8);
  hu(k, 34.82, 35.7, 0, 2.31, tablasVerdes, VERDE);
  hu(k, 34.82, 35.7, 2.31, 3.02, liso('#2a2a2c'), VERDE);
  ventana(k, 32.3, 33.36, 5.55, 6.6);
}

/** la casa del portón verde */
function casaPorton(k) {
  pared(k, s(N2), s(N3), ALTO3, liso('#f2f2ee'));
  caja(k, N2, N3, 3.55, 3.67, 0.08, 0xe6e4de);
  hu(k, 38.97, 41.92, 0, 3.02, tablasVerdes, VERDE);
  for (const n of [38.31, 42.36]) k.pic(s(n), 2.6, ZF + 0.02, 0.3, 0.38, 0, 1, canvasTex(48, 60, vado));
  for (const n of [42.45, 42.75]) caja(k, n - 0.14, n + 0.14, 1.31, 1.68, 0.12, 0xe4e4e0);
  for (const [n0, n1] of [[36.02, 38.15], [39.21, 41.41]]) ventana(k, n0, n1, 5.75, 7.03, '#2e7a46', 3);
  caja(k, N2, N3, ALTO3 - 0.2, ALTO3, 0.1, 0xe8e8e4);
}

/** se monta con lo demás */
export function buildSuntelcoEndesa(scene, colliders, map) {
  if (!map?.suntelcoEndesa) return null;
  const k = new Kit();
  casaBalcon(k);
  casaOficina(k);
  casaPorton(k);
  const grupos = [enMarco(k, F, 'suntelcoEndesa', colliders)];
  // las paredes lisas de los lados y de atrás que asoman por encima de las casas de al lado y del bloque de 5 m
  const lisa = (A, B, alto, nombre) => tira(A, B, alto, nombre, colliders, (kk, L) => pared(kk, 0, L, alto, liso('#ecebe6'), -0.25));
  grupos.push(lisa(P(N0, FONDO), P(N0), ALTO1, 'suntelcoLadoSur'));
  grupos.push(lisa(P(N1, FONDO), P(N1), ALTO2, 'suntelcoOficinaSur'));
  grupos.push(lisa(P(N2), P(N2, FONDO), ALTO2, 'suntelcoOficinaNorte'));
  grupos.push(lisa(P(N3), P(N3, FONDO), ALTO3, 'suntelcoPortonNorte'));
  grupos.push(lisa(P(N1, FONDO), P(N0, FONDO), ALTO1, 'suntelcoTraseraBalcon'));
  grupos.push(lisa(P(N2, FONDO), P(N1, FONDO), ALTO2, 'suntelcoTraseraOficina'));
  grupos.push(lisa(P(N3, FONDO), P(N2, FONDO), ALTO3, 'suntelcoTraseraPorton'));
  for (const g of grupos) scene.add(g);
  return { grupos };
}
