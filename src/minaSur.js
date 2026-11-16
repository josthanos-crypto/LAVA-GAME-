import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';
import { ZF, BLANCO, pared, tira } from './rapadurasSur.js';
import { tuneLocutorioAltavista } from './locutorioAltavista.js';

/**
 * El tramo de la calle Mina al sur del Supermercado Locutorio (Altavista): las dos casas adosadas color crema, la casa
 * baja de las puertas azules y el edificio blanco del 11 con las ventanas verdes, con las vistas de la calle de Google
 * de julio de 2025 (calle Mina 11, 13 y 15; solo se miran, no van dentro del juego). En el mapa era el bloque genérico de
 * 6 m. De verdad, de norte a sur:
 * - las adosadas crema: el zócalo de piedra gris, la ventana y la puerta blanca de cada una (una al revés que la otra),
 *   las balconeras de barandilla blanca con la moldura ocre, la cornisa ocre y la planta de arriba metida hacia atrás,
 *   con su barandilla y sus ventanas;
 * - la casa baja blanca: el portón azul, la puerta azul y la ventana azul con su reja, y el pretil;
 * - el 11: el edificio blanco de tres plantas con el bajo de granito rosado, la puerta verde de madera con su montante,
 *   el garaje de persiana blanca con el marco verde, la columna de la escalera con sus dos ventanas verdes y el cuerpo
 *   saliente con la ventana grande de marcos verdes.
 */

// la cara de la calle Mina: m hacia el sur desde la esquina del solar del «EN VENTA»; el marco va del sur al norte
const ESQ = [140.02, -1727.48];
const US = [-0.1811, 0.98346], NE = [0.98346, 0.1811];
const P = (m, b = 0) => [ESQ[0] + US[0] * m - NE[0] * b, ESQ[1] + US[1] * m - NE[1] * b];
const M0 = 15.9, M13 = 24.05, M11 = 31.94, FIN = 39.8, FONDO = 12;
const ALTO15 = 6.3, ALTO_ARRIBA = 8.6, ALTO13 = 4.2, ALTO11 = 9.0;
const F = marco(P(FIN), P(M0));
const s = m => FIN - m;

const CREMA = '#e8c88e', OCRE = 0xd8a858, VERDE = 0x3a8a4a, AZUL = 0x2a5ab8;

/** antes de levantar la ciudad: las tres casas salen del bloque genérico de 6 m (que ya empieza detrás del locutorio) */
export function tuneMinaSur(map) {
  if (!Array.isArray(map?.buildings)) return;
  // va detrás del locutorio, que es el que deja las esquinas de donde se parte (en la web los retoques van al revés)
  if (!map.locutorioAltavista) tuneLocutorioAltavista(map);
  const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const r = q => [+q[0].toFixed(2), +q[1].toFixed(2)];
  const A = r(P(M0, FONDO)), B = r(P(M0));
  const b = map.buildings.find(q => !q.skip && !q.edificioReal && Array.isArray(q.p) && q.p.some(p => d(p, A) < 0.3) && q.p.some(p => d(p, B) < 0.3));
  if (!b) return;
  b.p = b.p.map(p => (d(p, A) < 0.3 ? r(P(FIN, FONDO)) : d(p, B) < 0.3 ? r(P(FIN)) : p));
  for (const [m0, m1, h, f] of [[M0, M13, ALTO15, [232, 200, 142]], [M13, M11, ALTO13, [240, 240, 236]], [M11, FIN, ALTO11, [240, 240, 236]]]) {
    const p = [P(m0), P(m1), P(m1, FONDO), P(m0, FONDO)].map(r);
    p.push(p[0].slice());
    map.buildings.push({ p, h, k: 'gen', s: 0, f, c: [200, 196, 188], edificioReal: true });
  }
  map.minaSur = true;
}

// ——— las texturas ———

const liso = color => (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); };

/** el granito rosado del bajo del 11, en placas */
function granito(g, w, h) {
  g.fillStyle = '#b8a8a0';
  g.fillRect(0, 0, w, h);
  let sd = 37;
  const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < w * h / 10; i++) {
    g.fillStyle = rnd() < 0.5 ? 'rgba(110,90,90,.35)' : 'rgba(235,225,220,.4)';
    g.fillRect(rnd() * w, rnd() * h, 1.3, 1.3);
  }
  g.strokeStyle = 'rgba(120,100,100,.45)';
  for (let x = 14; x < w; x += 14) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 14; y < h; y += 14) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** la piedra gris del zócalo de las adosadas */
function piedraGris(g, w, h) {
  g.fillStyle = '#a8a49c';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(90,88,84,.5)';
  for (let x = 12; x < w; x += 12) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
}

/** una puerta blanca de cuarterones */
function puertaBlanca(g, w, h) {
  g.fillStyle = '#f4f4f0';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d2d2cc';
  g.lineWidth = 3;
  for (const [y0, y1] of [[0.06, 0.3], [0.36, 0.6], [0.66, 0.94]]) g.strokeRect(w * 0.15, h * y0, w * 0.7, h * (y1 - y0));
  g.fillStyle = '#8a8a86';
  g.fillRect(w * 0.78, h * 0.5, w * 0.08, h * 0.03);
}

/** el portón azul de chapa */
function portonAzul(g, w, h) {
  g.fillStyle = '#2a5ab8';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#1e468e';
  g.lineWidth = 2;
  for (let x = w / 12; x < w; x += w / 12) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  g.lineWidth = 3;
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
}

/** la puerta azul con la mirilla */
function puertaAzul(g, w, h) {
  g.fillStyle = '#2a5ab8';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#1e468e';
  g.lineWidth = 2;
  g.strokeRect(w * 0.15, h * 0.06, w * 0.7, h * 0.4);
  g.strokeRect(w * 0.15, h * 0.52, w * 0.7, h * 0.42);
  g.fillStyle = '#c8c8c4';
  g.fillRect(w * 0.75, h * 0.5, w * 0.08, h * 0.03);
}

/** la ventana con la reja azul de rombos */
function rejaAzul(g, w, h) {
  g.fillStyle = '#2a3038';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#2a5ab8';
  g.lineWidth = 3;
  g.strokeRect(1.5, 1.5, w - 3, h - 3);
  g.lineWidth = 2;
  const paso = w / 6;
  for (let x = -h; x < w + h; x += paso) {
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x + h, h); g.stroke();
    g.beginPath(); g.moveTo(x, h); g.lineTo(x + h, 0); g.stroke();
  }
}

/** la puerta verde de madera de cuarterones del 11 */
function puertaVerde(g, w, h) {
  g.fillStyle = '#3a7a4a';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#2a5a36';
  g.lineWidth = 2;
  for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) g.strokeRect(w * (0.1 + j * 0.42), h * (0.04 + i * 0.19), w * 0.38, h * 0.16);
}

/** la persiana blanca del garaje */
function persianaGaraje(g, w, h) {
  g.fillStyle = '#ececE8';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c8c8c2';
  g.lineWidth = 1.5;
  for (let y = 4; y < h; y += 5) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** cristales con la carpintería verde, en una cuadrícula de cols × filas */
function cuadriculaVerde(cols, filas) {
  return (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#4a5a6a');
    gr.addColorStop(1, '#283038');
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,.12)';
    g.beginPath(); g.moveTo(0, h); g.lineTo(w * 0.3, 0); g.lineTo(w * 0.45, 0); g.lineTo(w * 0.15, h); g.fill();
    g.strokeStyle = '#3a8a4a';
    g.lineWidth = Math.max(3, w * 0.012);
    g.strokeRect(1.5, 1.5, w - 3, h - 3);
    for (let i = 1; i < cols; i++) { const x = (w / cols) * i; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let j = 1; j < filas; j++) { const y = (h / filas) * j; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  };
}

// ——— las piezas ———

/** una ventana de aluminio blanco */
function ventana(k, x, y, w, h, z = ZF, hojas = 2) {
  hueco(k, x, y, w, h, canvasTex(Math.round(w * 50), Math.round(h * 50), cristales('#f2f2ee', hojas, 'rgba(235,232,225,.6)')), { borde: 0xf2f2ee, z });
}

/** una barandilla blanca de barrotes (sin choques: va en alto) */
function barandilla(k, x0, x1, y, z, alto = 0.9) {
  const c = (x0 + x1) / 2;
  k.box(c, y + alto, z, x1 - x0, 0.05, 0.06, BLANCO);
  k.box(c, y + 0.05, z, x1 - x0, 0.04, 0.05, BLANCO);
  for (let x = x0; x <= x1 + 0.01; x += 0.11) k.box(x, y + 0.05, z, 0.025, alto - 0.05, 0.025, BLANCO);
}

/** las dos adosadas crema, con la planta de arriba metida hacia atrás */
function adosadas(k) {
  const a = s(M13), b = s(M0), L = b - a, c = (a + b) / 2;
  pared(k, a, b, ALTO15, liso(CREMA));
  k.box(c, 0, ZF + 0.03, L, 0.6, 0.06, 0xa8a49c);
  k.pic(c, 0.3, ZF + 0.062, L, 0.6, 0, 1, canvasTex(Math.round(L * 24), 14, piedraGris));
  // abajo: la ventana y la puerta de cada una
  ventana(k, s(16.85), 0.9, 1.35, 1.6, ZF + 0.07);
  hueco(k, s(18.05), 0, 0.95, 2.3, canvasTex(57, 138, puertaBlanca), { borde: 0xf2f2ee, z: ZF + 0.07 });
  hueco(k, s(21.2), 0, 0.95, 2.3, canvasTex(57, 138, puertaBlanca), { borde: 0xf2f2ee, z: ZF + 0.07 });
  ventana(k, s(22.6), 0.9, 1.45, 1.6, ZF + 0.07);
  for (const m of [19.0, 20.2]) k.box(s(m), 0.9, ZF + 0.1, 0.4, 0.5, 0.12, 0xeaeae6);
  // arriba: la moldura ocre, las balconeras con barandilla y la cornisa ocre
  k.box(c, 3.0, ZF + 0.1, L, 0.2, 0.2, OCRE);
  for (const [m, w] of [[17.85, 1.35], [21.0, 1.4]]) {
    ventana(k, s(m), 3.3, w, 1.9);
    barandilla(k, s(m) - w / 2 - 0.05, s(m) + w / 2 + 0.05, 3.3, ZF + 0.16);
  }
  k.box(c, 5.9, ZF + 0.1, L, 0.4, 0.2, OCRE);
  // la planta de arriba, metida 1,5 m hacia atrás, con su barandilla delante y sus ventanas
  k.box(c, ALTO15, -1.5 - 5.25, L, ALTO_ARRIBA - ALTO15, 10.5, 0xe8c88e);
  k.box(c, ALTO_ARRIBA, -1.5 - 5.25, L + 0.05, 0.1, 10.6, 0xd8d4cc);
  k.box(c, ALTO_ARRIBA - 0.15, -1.4, L + 0.05, 0.27, 0.25, OCRE);
  for (const m of [17.3, 18.5, 20.6, 21.8]) ventana(k, s(m), ALTO15 + 0.5, 1.0, 1.2, -1.5);
  barandilla(k, a + 0.05, b - 0.05, ALTO15, ZF - 0.05, 0.9);
}

/** la casa baja blanca de las puertas azules */
function casaAzul(k) {
  const a = s(M11), b = s(M13), L = b - a, c = (a + b) / 2;
  pared(k, a, b, ALTO13, liso('#f2f2ee'));
  hueco(k, s(25.4), 0, 2.7, 2.8, canvasTex(162, 168, portonAzul), { borde: AZUL, z: ZF + 0.03 });
  hueco(k, s(28.2), 0, 1.0, 2.3, canvasTex(60, 138, puertaAzul), { borde: AZUL, z: ZF + 0.03 });
  hueco(k, s(30.1), 1.0, 2.0, 1.3, canvasTex(120, 78, rejaAzul), { borde: AZUL, z: ZF + 0.03 });
  k.box(s(26.9), 2.4, ZF + 0.08, 0.3, 0.3, 0.06, 0xe8e8e4);
  k.box(c, ALTO13 - 0.35, ZF + 0.06, L, 0.1, 0.12, 0xe4e4e0);
}

/** el 11: el edificio blanco con las ventanas verdes */
function edificio11(k) {
  const a = s(FIN), b = s(M11), L = b - a, c = (a + b) / 2;
  pared(k, a, b, ALTO11, liso('#f2f2ee'));
  k.box(c, 0, ZF + 0.03, L, 3.2, 0.06, 0xb8a8a0);
  k.pic(c, 1.6, ZF + 0.062, L, 3.2, 0, 1, canvasTex(Math.round(L * 24), 77, granito));
  // abajo: la puerta verde con su montante, el contador, el garaje y los letreritos rojos de la alarma
  hueco(k, s(38.55), 0, 1.15, 2.4, canvasTex(69, 144, puertaVerde), { borde: VERDE, z: ZF + 0.07 });
  hueco(k, s(38.55), 2.5, 1.15, 0.55, canvasTex(69, 33, cuadriculaVerde(4, 2)), { borde: VERDE, z: ZF + 0.07 });
  k.box(s(39.3), 0.9, ZF + 0.1, 0.4, 0.5, 0.12, 0xeaeae6);
  hueco(k, s(34.65), 0, 3.3, 2.6, canvasTex(198, 156, persianaGaraje), { borde: VERDE, z: ZF + 0.07 });
  hueco(k, s(34.65), 2.7, 3.3, 0.4, canvasTex(198, 24, cuadriculaVerde(6, 1)), { borde: VERDE, z: ZF + 0.07 });
  for (const m of [37.4, 33.0]) k.box(s(m), 2.6, ZF + 0.1, 0.2, 0.28, 0.03, 0xd42a2a);
  // la columna de la escalera, con sus dos ventanas verdes
  for (const y of [4.0, 6.6]) hueco(k, s(38.35), y, 1.0, 0.9, canvasTex(60, 54, cuadriculaVerde(2, 1)), { borde: VERDE, z: ZF });
  // el cuerpo saliente con la ventana grande de marcos verdes
  const x0 = s(37.53), x1 = b;
  k.box((x0 + x1) / 2, 3.2, ZF + 0.15, x1 - x0, ALTO11 - 3.2, 0.3, 0xf4f4f0);
  hueco(k, s(34.7), 4.6, 4.8, 2.8, canvasTex(288, 168, cuadriculaVerde(6, 3)), { borde: VERDE, z: ZF + 0.3 });
  k.box((x0 + x1) / 2, ALTO11, ZF + 0.15, x1 - x0 + 0.04, 0.1, 0.34, 0xe4e4e0);
}

/** se monta con lo demás */
export function buildMinaSur(scene, colliders, map) {
  if (!map?.minaSur) return null;
  const k = new Kit();
  adosadas(k);
  casaAzul(k);
  edificio11(k);
  const grupos = [enMarco(k, F, 'minaSur', colliders)];
  // las paredes lisas de los lados y de atrás que asoman por encima de las casas de al lado y del bloque de 6 m
  const lisa = (A, B, alto, nombre, color = '#ecebe6') => tira(A, B, alto, nombre, colliders, (kk, L) => pared(kk, 0, L, alto, liso(color), -0.25));
  grupos.push(lisa(P(M13, FONDO), P(M13), ALTO_ARRIBA, 'minaSurLadoAdosadas', '#e4c48a'));
  grupos.push(lisa(P(M11), P(M11, FONDO), ALTO11, 'minaSurLado11'));
  grupos.push(lisa(P(FIN, FONDO), P(FIN), ALTO11, 'minaSurLadoSur'));
  grupos.push(lisa(P(M0, FONDO), P(M13, FONDO), ALTO_ARRIBA, 'minaSurTraseraAdosadas', '#e4c48a'));
  grupos.push(lisa(P(M11, FONDO), P(M13, FONDO), 6.2, 'minaSurFondoCasaAzul'));
  grupos.push(lisa(P(M11, FONDO), P(FIN, FONDO), ALTO11, 'minaSurTrasera11'));
  for (const g of grupos) scene.add(g);
  return { grupos };
}
