import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';
import { ZF, BLANCO, pared, tira } from './rapadurasSur.js';

/**
 * El Supermercado Locutorio Altavista (calle Mina 17) y las dos casas adosadas color crema de al lado, hasta el solar
 * del «EN VENTA» (el 19 y el 21), con las vistas de la calle de Google de julio de 2025 (calle Mina 13, 15 y 17; el sitio
 * no tiene fotos; solo se miran, no van dentro del juego). En el mapa era el bloque genérico de 6 m. De verdad:
 * - el 17: el edificio blanco de tres plantas con el bajo de granito rosado, la tienda abierta con las estanterías, la
 *   nevera amarilla de la puerta y el toldo crema con «Supermercado Locutorio ALTAVISTA» en rojo, el buzón rojo, el
 *   aparato del aire, el contador y el portal de aluminio blanco en la columna de la escalera; arriba, el balcón corrido
 *   con la barandilla de cristal, las ventanas, el balcón de la segunda planta con el antepecho macizo y el pretil;
 * - el 19 y el 21: las dos casas adosadas color crema, con el zócalo de mármol marrón, las ventanas de persiana blanca,
 *   las puertas blancas, los balcones de barandilla blanca, la cornisa, las barandillas de las azoteas y el cuarto del
 *   medio con el depósito del agua.
 */

// la cara de la calle Mina: m hacia el sur desde la esquina del solar; el marco va del sur al norte (s = 15,9 − m)
const ESQ = [140.02, -1727.48];
const US = [-0.1811, 0.98346], NE = [0.98346, 0.1811];
const P = (m, b = 0) => [ESQ[0] + US[0] * m - NE[0] * b, ESQ[1] + US[1] * m - NE[1] * b];
const M17 = 6.25, FIN = 15.9, FONDO = 12;
const ALTO17 = 9.4, ALTO19 = 6.3;
const F = marco(P(FIN), P(0));
const s = m => FIN - m;

const CREMA = '#ecd2a0', CREMA_HEX = 0xecd2a0, CORNISA = 0xe2bc80;

/** antes de levantar la ciudad: las casas salen del bloque genérico de 6 m */
export function tuneLocutorioAltavista(map) {
  if (!Array.isArray(map?.buildings)) return;
  const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const r = q => [+q[0].toFixed(2), +q[1].toFixed(2)];
  const b = map.buildings.find(q => !q.skip && !q.edificioReal && Array.isArray(q.p) && q.p.some(p => d(p, ESQ) < 0.3) && q.p.some(p => d(p, [122.82, -1634.08]) < 0.3));
  if (!b) return;
  const i = b.p.findIndex(p => d(p, ESQ) < 0.3);
  const n = b.p.length, cerrado = d(b.p[0], b.p[n - 1]) < 0.01;
  const antes = b.p[i > 0 ? i - 1 : (cerrado ? n - 2 : n - 1)];
  const nuevo = (d(antes, P(0, FONDO)) < d(antes, P(FIN)) ? [P(0, FONDO), P(FIN, FONDO), P(FIN)] : [P(FIN), P(FIN, FONDO), P(0, FONDO)]).map(r);
  b.p.splice(i, 1, ...nuevo);
  if (cerrado && i === 0) b.p[b.p.length - 1] = nuevo[0].slice();
  for (const [m0, m1, h, f] of [[0, M17, ALTO19, [236, 210, 160]], [M17, FIN, ALTO17, [242, 242, 238]]]) {
    const p = [P(m0), P(m1), P(m1, FONDO), P(m0, FONDO)].map(r);
    p.push(p[0].slice());
    map.buildings.push({ p, h, k: 'gen', s: 0, f, c: [200, 196, 188], edificioReal: true });
  }
  map.locutorioAltavista = true;
}

// ——— las texturas ———

const liso = color => (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); };

/** el granito rosado del bajo del 17, en placas */
function granito(g, w, h) {
  g.fillStyle = '#b8a8a0';
  g.fillRect(0, 0, w, h);
  let sd = 31;
  const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < w * h / 10; i++) {
    g.fillStyle = rnd() < 0.5 ? 'rgba(110,90,90,.35)' : 'rgba(235,225,220,.4)';
    g.fillRect(rnd() * w, rnd() * h, 1.3, 1.3);
  }
  g.strokeStyle = 'rgba(120,100,100,.45)';
  for (let x = 14; x < w; x += 14) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 14; y < h; y += 14) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** el mármol marrón del zócalo de las adosadas */
function marmol(g, w, h) {
  g.fillStyle = '#8a5a3e';
  g.fillRect(0, 0, w, h);
  let sd = 9;
  const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  g.strokeStyle = 'rgba(200,160,120,.35)';
  g.lineWidth = 1;
  for (let i = 0; i < w / 6; i++) {
    g.beginPath();
    let x = rnd() * w, y = 0;
    g.moveTo(x, y);
    while (y < h) { x += (rnd() - 0.5) * 6; y += 3; g.lineTo(x, y); }
    g.stroke();
  }
  g.strokeStyle = 'rgba(60,40,30,.5)';
  for (let x = 14; x < w; x += 14) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
}

/** una ventana con la persiana blanca de lamas cerrada */
function persiana(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c8c8c2';
  g.lineWidth = 1.5;
  for (let y = 3; y < h; y += 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.fillStyle = '#d8d8d2';
  g.fillRect(w / 2 - 1, 0, 2, h);
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

/** el portal de aluminio blanco con los cristales mates en franjas */
function portal(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#4a6a6a';
  g.fillRect(w * 0.08, h * 0.04, w * 0.1, h * 0.92);
  for (let i = 0; i < 5; i++) {
    g.fillStyle = '#a8c0bc';
    g.fillRect(w * 0.26, h * (0.05 + i * 0.185), w * 0.66, h * 0.15);
  }
}

/** la tienda por dentro: las estanterías llenas de cosas de colores */
function tienda(g, w, h) {
  g.fillStyle = '#5a5048';
  g.fillRect(0, 0, w, h);
  let sd = 3;
  const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const colores = ['#e84a3a', '#f2c232', '#4ab04a', '#3a7ad8', '#e8e0d0', '#d84ab0', '#f08a2a'];
  for (let y = h * 0.08; y < h * 0.7; y += h * 0.1) {
    g.fillStyle = '#8a7a6a';
    g.fillRect(0, y + h * 0.08, w, h * 0.012);
    for (let x = 2; x < w - 4; x += 4 + rnd() * 4) {
      g.fillStyle = colores[Math.floor(rnd() * colores.length)];
      g.fillRect(x, y + h * 0.08 * (0.2 + rnd() * 0.3), 3 + rnd() * 2, h * 0.08 * (0.5 + rnd() * 0.3));
    }
  }
  g.fillStyle = '#9a9288';
  g.beginPath(); g.moveTo(0, h); g.lineTo(w, h); g.lineTo(w * 0.85, h * 0.74); g.lineTo(w * 0.15, h * 0.74); g.closePath(); g.fill();
}

/** el faldón del toldo: «Supermercado Locutorio ALTAVISTA» en rojo sobre crema */
function faldon(g, w, h) {
  g.fillStyle = '#f2ead8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c82a2a';
  g.fillRect(0, 0, w, h * 0.1);
  g.fillRect(0, h * 0.9, w, h * 0.1);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic bold ${Math.round(h * 0.5)}px Georgia, "Times New Roman", serif`;
  g.fillText('Supermercado Locutorio ALTAVISTA', w / 2, h * 0.52, w * 0.94);
}

// ——— las piezas ———

/** una ventana de aluminio blanco */
function ventana(k, x, y, w, h, z = ZF, hojas = 2) {
  hueco(k, x, y, w, h, canvasTex(Math.round(w * 50), Math.round(h * 50), cristales('#f2f2ee', hojas, 'rgba(235,232,225,.6)')), { borde: 0xf2f2ee, z });
}

/** una barandilla blanca de barrotes (sin choques: va en alto) */
function barandilla(k, x0, x1, y, z, alto = 0.95) {
  const c = (x0 + x1) / 2;
  k.box(c, y + alto, z, x1 - x0, 0.05, 0.06, BLANCO);
  k.box(c, y + 0.05, z, x1 - x0, 0.04, 0.05, BLANCO);
  for (let x = x0; x <= x1 + 0.01; x += 0.11) k.box(x, y + 0.05, z, 0.025, alto - 0.05, 0.025, BLANCO);
  for (const x of [x0, x1]) k.box(x, y, z, 0.06, alto + 0.05, 0.06, BLANCO);
}

/** el edificio blanco del 17, con el supermercado */
function edificio17(k) {
  const a = s(FIN), b = s(M17), L = b - a, c = (a + b) / 2;
  pared(k, a, b, ALTO17, liso('#f2f2ee'));
  k.box(c, 0, ZF + 0.03, L, 3.3, 0.06, 0xb8a8a0);
  k.pic(c, 1.65, ZF + 0.062, L, 3.3, 0, 1, canvasTex(Math.round(L * 24), 80, granito));
  // la tienda abierta, el toldo crema con su faldón, la nevera amarilla y el buzón rojo
  hueco(k, s(13.25), 0, 3.3, 2.7, canvasTex(198, 162, tienda), { borde: 0xd8d8d4, z: ZF + 0.07 });
  k.box(s(13.3), 2.95, ZF + 0.62, 4.2, 0.05, 1.2, 0xefe6d2);
  k.box(s(13.3), 2.55, ZF + 1.2, 4.2, 0.4, 0.04, 0xf2ead8);
  k.pic(s(13.3), 2.75, ZF + 1.225, 4.2, 0.4, 0, 1, canvasTex(420, 40, faldon));
  for (const x of [s(15.4), s(11.2)]) k.box(x, 2.55, ZF + 0.62, 0.03, 0.42, 1.2, 0xefe6d2);
  k.box(s(11.3), 0, ZF + 0.35, 0.6, 1.1, 0.6, 0xf2c41c);
  k.box(s(11.3), 1.1, ZF + 0.35, 0.62, 0.05, 0.62, 0xd8d8d4);
  k.block(s(11.3), ZF + 0.35, 0.6, 0.6);
  k.box(s(15.4), 1.2, ZF + 0.12, 0.3, 0.38, 0.16, 0xc82a2a);
  // el aparato del aire, el contador y el portal de la columna de la escalera, con su buzón
  k.box(s(10.2), 2.6, ZF + 0.2, 0.85, 0.5, 0.32, 0xe4e4e0);
  k.box(s(9.7), 1.2, ZF + 0.1, 0.45, 0.55, 0.14, 0xeaeae6);
  k.box(s(6.9), 0, ZF + 0.05, 1.35, ALTO17, 0.1, 0xf4f4f0);
  hueco(k, s(6.95), 0, 0.95, 2.5, canvasTex(57, 150, portal), { borde: 0xf0f0ec, z: ZF + 0.1 });
  hueco(k, s(6.95), 2.6, 0.95, 0.3, canvasTex(57, 18, cristales('#f0f0ec', 1, 'rgba(60,90,90,.3)')), { borde: 0xf0f0ec, z: ZF + 0.1 });
  k.box(s(7.55), 1.25, ZF + 0.16, 0.22, 0.3, 0.12, 0x5a5e62);
  for (const y of [4.5, 7.2]) ventana(k, s(6.95), y, 0.65, 0.8, ZF + 0.1);
  // el balcón corrido de la primera planta, con la barandilla de cristal, y sus ventanas
  const b0 = a, b1 = s(7.6);
  k.box((b0 + b1) / 2, 3.3, ZF + 0.45, b1 - b0, 0.25, 0.9, 0xf4f4f0);
  k.box((b0 + b1) / 2, 3.55, ZF + 0.86, b1 - b0, 0.98, 0.02, 0xb8c8cc);
  k.box((b0 + b1) / 2, 4.53, ZF + 0.86, b1 - b0, 0.05, 0.06, 0x9a9ea2);
  for (let x = b0 + 0.05; x <= b1; x += (b1 - b0) / 5) k.box(x, 3.55, ZF + 0.86, 0.05, 1.0, 0.05, 0x9a9ea2);
  for (const m of [14.5, 11.6, 8.9]) ventana(k, s(m), 3.75, 1.2, 1.85);
  // el balcón de la segunda planta, con el antepecho macizo, y las ventanas de detrás
  k.box((b0 + b1) / 2, 6.4, ZF + 0.45, b1 - b0, 0.25, 0.9, 0xf4f4f0);
  k.box((b0 + b1) / 2, 6.65, ZF + 0.84, b1 - b0, 1.0, 0.12, 0xf4f4f0);
  k.box((b0 + b1) / 2, 7.65, ZF + 0.84, b1 - b0 + 0.04, 0.06, 0.18, 0xe4e4e0);
  for (const m of [14.5, 11.6, 8.9]) ventana(k, s(m), 6.95, 1.2, 1.7);
  k.box(c, ALTO17, ZF - 0.1, L, 0.4, 0.22, BLANCO);
  k.box(c, ALTO17 + 0.4, ZF - 0.08, L + 0.02, 0.06, 0.26, 0xe4e4e0);
}

/** las dos casas adosadas color crema del 19 y el 21 */
function adosadas(k) {
  const a = s(M17), b = s(0), L = b - a, c = (a + b) / 2;
  pared(k, a, b, ALTO19, liso(CREMA));
  k.box(c, 0, ZF + 0.03, L, 1.2, 0.06, 0x8a5a3e);
  k.pic(c, 0.6, ZF + 0.062, L, 1.2, 0, 1, canvasTex(Math.round(L * 24), 29, marmol));
  // abajo: las ventanas de persiana blanca y las puertas blancas
  hueco(k, s(4.95), 0.85, 1.7, 1.65, canvasTex(85, 82, persiana), { borde: 0xf2f2ee, z: ZF + 0.07 });
  hueco(k, s(3.15), 0, 0.93, 2.3, canvasTex(56, 138, puertaBlanca), { borde: 0xf2f2ee, z: ZF + 0.07 });
  hueco(k, s(1.65), 0, 0.85, 2.3, canvasTex(51, 138, puertaBlanca), { borde: 0xf2f2ee, z: ZF + 0.07 });
  hueco(k, s(0.65), 0.85, 1.1, 1.65, canvasTex(55, 82, persiana), { borde: 0xf2f2ee, z: ZF + 0.07 });
  for (const [m, y] of [[2.3, 1.1], [4.0, 1.1]]) k.box(s(m), y, ZF + 0.1, 0.4, 0.5, 0.12, 0xeaeae6);
  // arriba: los balcones de barandilla blanca con las balconeras de detrás
  for (const [m0, m1, mv, wv] of [[6.2, 4.2, 5.1, 1.4], [2.6, 0.3, 1.55, 1.3]]) {
    const x0 = s(m0), x1 = s(m1);
    k.box((x0 + x1) / 2, 3.0, ZF + 0.3, x1 - x0, 0.2, 0.6, 0xf0e6d0);
    barandilla(k, x0 + 0.05, x1 - 0.05, 3.2, ZF + 0.56);
    ventana(k, s(mv), 3.25, wv, 1.95);
  }
  // la cornisa, las barandillas de las azoteas y el cuarto del medio con el depósito del agua
  k.box(c, 5.9, ZF + 0.08, L, 0.4, 0.16, CORNISA);
  barandilla(k, s(6.2), s(4.32), ALTO19, ZF - 0.05, 0.9);
  barandilla(k, s(3.12), s(0.72), ALTO19, ZF - 0.05, 0.9);
  k.box(s(3.72), ALTO19, ZF - 2.0, 1.2, 2.4, 4.0, CREMA_HEX);
  k.box(s(3.72), ALTO19 + 2.4, ZF - 2.0, 1.3, 0.08, 4.1, CORNISA);
  k.cyl(s(5.2), ALTO19, -3.0, 0.45, 0.45, 1.1, 0xe8e8e4, { seg: 14 });
}

/** se monta con lo demás */
export function buildLocutorioAltavista(scene, colliders, map) {
  if (!map?.locutorioAltavista) return null;
  const k = new Kit();
  edificio17(k);
  adosadas(k);
  const grupos = [enMarco(k, F, 'locutorioAltavista', colliders)];
  // las paredes lisas de los lados y de atrás que asoman por encima de las casas de al lado y del bloque de 6 m
  const lisa = (A, B, alto, nombre, color) => tira(A, B, alto, nombre, colliders, (kk, L) => pared(kk, 0, L, alto, liso(color), -0.25));
  grupos.push(lisa(P(0), P(0, FONDO), ALTO19, 'locutorioLadoSolar', '#e6cc9c'));
  grupos.push(lisa(P(M17), P(M17, FONDO), ALTO17, 'locutorioLadoNorte', '#ecebe6'));
  grupos.push(lisa(P(FIN, FONDO), P(FIN), ALTO17, 'locutorioLadoSur', '#ecebe6'));
  grupos.push(lisa(P(M17, FONDO), P(FIN, FONDO), ALTO17, 'locutorioTrasera', '#ecebe6'));
  for (const g of grupos) scene.add(g);
  return { grupos };
}
