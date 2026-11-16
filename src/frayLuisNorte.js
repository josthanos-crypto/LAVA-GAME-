import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';
import { pared, tira } from './rapadurasSur.js';
import { tuneColoraoLyC } from './coloraoLyC.js';

/**
 * La calle Fray Luis de León por detrás de la manzana de El Túnel (Altavista), al sur de la casa del bar, con las
 * vistas de la calle de Google de julio de 2025 (Fray Luis de León 55 y 44; solo se miran, no van dentro del juego) y
 * el plano del Catastro. En el mapa era el bloque genérico de 4 m. De verdad:
 * - el 46: la casa blanca de dos plantas con el zócalo de plaqueta de piedra de colores, las dos puertas verdes, las
 *   contraventanas verdes de lamas, las ventanas verdes de arriba y, detrás, el cuarto alto de la azotea;
 * - el 44: la casa baja de cemento sin pintar, con la persiana blanca, la puerta blanca, la puerta de madera y el
 *   portón de chapa granate del garaje.
 */

// la cara de León y Castillo: a hacia el sur desde la esquina de Padre Claret (la de El Túnel), b hacia dentro; la de
// Fray Luis de León va a b = 25,3 (como la casa del bar)
const C = [378.37 + 0.166579 * 1.9, -1299.89 - 0.98603 * 1.9];
const US = [-0.166579, 0.98603], E = [0.98605, 0.166412];
const P = (a, b = 0) => [C[0] + US[0] * a - E[0] * b, C[1] + US[1] * a - E[1] * b];
const A46 = 25.0, A44 = 34.9, AFIN = 45.1, FL = 25.3;
const FONDO46 = 15.5, FONDO44 = 16.0, T0 = 25.1, T1 = 27.3, TB = 19.4;
const ALTO46 = 6.5, ALTO_T = 9.5, ALTO44 = 3.3;
// el marco va del norte al sur, con la calle de Fray Luis de León delante (al oeste); la cara a 0,054 de la línea
const M = marco(P(A46, FL), P(AFIN, FL));
const x = a => a - A46;
const F = 0.054;

/** antes de levantar la ciudad: las casas van en lugar del bloque genérico de 4 m (al 44, más bajo, se le hace sitio) */
export function tuneFrayLuisNorte(map) {
  if (!Array.isArray(map?.buildings)) return;
  if (!map.coloraoLyC) tuneColoraoLyC(map);
  const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const r = q => [+q[0].toFixed(2), +q[1].toFixed(2)];
  const libre = q => !q.skip && !q.edificioReal && Array.isArray(q.p);
  const A = P(70.85, 24.18), B = P(1.9, 24.16);
  const b = map.buildings.find(q => libre(q) && q.p.some(p => d(p, A) < 0.3) && q.p.some(p => d(p, B) < 0.3));
  if (!b) return;
  // el entrante del 44 en la trasera del bloque: entre A y B (por la calle de atrás) va [P(45,1), P(45,1, 16), P(34,9, 16), P(34,9)]
  const hueco44 = [P(AFIN, 24.17), P(AFIN, FONDO44), P(A44, FONDO44), P(A44, 24.17)].map(r);
  const i = b.p.findIndex(p => d(p, A) < 0.3);
  if (b.p[i + 1] && d(b.p[i + 1], B) < 0.3) b.p.splice(i + 1, 0, ...hueco44);
  else if (i > 0 && d(b.p[i - 1], B) < 0.3) b.p.splice(i, 0, ...hueco44.reverse());
  else return;
  // (al revés, para que den la vuelta como los bloques del mapa)
  const casa = (a0, a1, b0, b1, h, f, c = [200, 196, 188]) => {
    const p = [P(a0, b0), P(a0, b1), P(a1, b1), P(a1, b0)].map(r).reverse();
    p.push(p[0].slice());
    map.buildings.push({ p, h, k: 'gen', s: 0, f, c, edificioReal: true });
  };
  casa(A46, A44, FONDO46, FL, ALTO46, [242, 241, 236]);
  casa(T0, T1, FONDO46 + 0.1, TB, ALTO_T, [242, 241, 236]);
  casa(A44, AFIN, FONDO44, FL, ALTO44, [164, 156, 140]);
  map.frayLuisNorte = true;
}

// ——— las texturas ———

const liso = color => (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); };
const tx = (w, h, fn) => canvasTex(Math.max(16, Math.min(1024, Math.round(w * 60))), Math.max(16, Math.round(h * 60)), fn);

/** la plaqueta de piedra de colores del zócalo del 46 */
function plaquetaColores(g, w, h) {
  g.fillStyle = '#6e6458';
  g.fillRect(0, 0, w, h);
  const colores = ['#a68a74', '#8e8c86', '#b89a7a', '#9a7e6a', '#a4a09a', '#c0a084'];
  const ph = h / 6;
  let k = 0;
  for (let y = 0; y < h; y += ph) {
    for (let xx = (Math.round(y / ph) % 2) * -ph; xx < w; xx += ph * 2.2) {
      g.fillStyle = colores[k++ % colores.length];
      g.fillRect(xx + 1, y + 1, ph * 2.2 - 2, ph - 2);
    }
  }
}

/** una puerta verde de tablas horizontales */
function puertaVerde(g, w, h) {
  g.fillStyle = '#2e7a3c';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(0,0,0,.22)';
  g.lineWidth = 1;
  for (let y = 6; y < h; y += 6) { g.beginPath(); g.moveTo(3, y); g.lineTo(w - 3, y); g.stroke(); }
  g.fillStyle = '#1e5a2a';
  g.fillRect(w * 0.08, 0, 3, h);
  g.fillStyle = '#c8c8c0';
  g.fillRect(w * 0.82, h * 0.5, w * 0.06, h * 0.03);
}

/** unas contraventanas verdes de lamas */
function lamasVerdes(g, w, h) {
  g.fillStyle = '#2f7a3e';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#1e5a2a';
  g.lineWidth = 1.5;
  for (let y = 4; y < h - 2; y += 4) { g.beginPath(); g.moveTo(3, y); g.lineTo(w - 3, y); g.stroke(); }
  g.fillStyle = '#1e5a2a';
  for (let xx = w / 3; xx < w - 2; xx += w / 3) g.fillRect(xx - 1, 0, 2, h);
}

/** el revoque de cemento sin pintar, con manchas */
function cemento(g, w, h) {
  g.fillStyle = '#a49c8c';
  g.fillRect(0, 0, w, h);
  let sd = 11;
  const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < w * h / 60; i++) {
    g.fillStyle = rnd() < 0.5 ? 'rgba(80,72,60,.10)' : 'rgba(220,214,200,.12)';
    g.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 6, 2 + rnd() * 6);
  }
  g.fillStyle = 'rgba(60,54,46,.12)';
  g.fillRect(0, h * 0.85, w, h * 0.15);
}

/** una puerta de madera de cuarterones */
function puertaMadera(g, w, h) {
  g.fillStyle = '#5a3a24';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#3e2818';
  g.lineWidth = 3;
  for (let j = 0; j < 4; j++) for (const x0 of [0.14, 0.54]) g.strokeRect(w * x0, h * (0.05 + j * 0.23), w * 0.32, h * 0.19);
}

/** el portón de chapa granate del garaje, con su marco */
function chapaGranate(g, w, h) {
  g.fillStyle = '#7a3a2e';
  g.fillRect(0, 0, w, h);
  for (let xx = 0; xx < w; xx += 7) {
    g.fillStyle = 'rgba(255,200,180,.10)';
    g.fillRect(xx, 0, 2, h);
    g.fillStyle = 'rgba(0,0,0,.2)';
    g.fillRect(xx + 4, 0, 2, h);
  }
  g.strokeStyle = '#5a2a20';
  g.lineWidth = 6;
  g.strokeRect(0, 0, w, h);
}

/** una persiana enrollable blanca, bajada */
function persianaBlanca(g, w, h) {
  g.fillStyle = '#ecebe6';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c8c6c0';
  g.lineWidth = 1;
  for (let y = 3; y < h; y += 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

// ——— las piezas ———

/** un hueco de a0 a a1 y de y0 a y1 */
const hu = (k, a0, a1, y0, y1, fn, borde, z = F) => hueco(k, (x(a0) + x(a1)) / 2, y0, a1 - a0, y1 - y0, tx(a1 - a0, y1 - y0, fn), { borde, z });

/** el 46 */
function casa46(k) {
  pared(k, x(A46), x(A44), ALTO46, liso('#f2f1ec'), -0.25);
  k.box((x(A46) + x(A44)) / 2, 0, F + 0.02, A44 - A46, 1.77, 0.04, 0x9a8a78);
  k.pic((x(A46) + x(A44)) / 2, 0.885, F + 0.042, A44 - A46, 1.77, 0, 1, tx(A44 - A46, 1.77, plaquetaColores));
  for (const [a0, a1] of [[25.6, 27.8], [32.6, 34.0]]) hu(k, a0, a1, 1.05, 2.27, lamasVerdes, 0x2a6a36, F + 0.04);
  for (const [a0, a1] of [[28.7, 29.9], [31.1, 32.1]]) hu(k, a0, a1, 0.02, 2.26, puertaVerde, 0x2a6a36, F + 0.04);
  for (const [a0, a1] of [[25.25, 27.8], [31.0, 33.5]]) hu(k, a0, a1, 4.32, 5.4, cristales('#2f7a42', 2, 'rgba(220,226,230,.5)'), 0x2a6a36);
  k.box((x(30.2) + x(30.5)) / 2, 2.9, F + 0.04, 0.3, 0.35, 0.08, 0xe0e0dc);
  k.box((x(33.9) + x(34.4)) / 2, 1.85, F + 0.06, 0.5, 0.42, 0.12, 0xeeeeea);
  k.box((x(A46) + x(A44)) / 2, ALTO46 - 0.12, F + 0.05, A44 - A46, 0.12, 0.1, 0xe4e2dc);
}

/** el 44 */
function casa44(k) {
  pared(k, x(A44), x(AFIN), ALTO44, cemento, -0.25);
  hu(k, 36.1, 36.8, 1.1, 2.42, persianaBlanca, 0xd8d6d0);
  hu(k, 37.6, 38.6, 0.02, 2.42, liso('#f2f2ee'), 0xe8e8e4);
  hu(k, 39.8, 40.7, 0.02, 2.22, puertaMadera, 0x4a3020);
  hu(k, 42.0, 44.4, 0.02, 2.32, chapaGranate, 0x5a2a20);
  k.box((x(40.85) + x(41.3)) / 2, 0.05, F + 0.05, 0.45, 0.55, 0.1, 0xd8d6d0);
  // el remate de arriba, más alto en la parte del norte
  k.box((x(A44) + x(39.2)) / 2, ALTO44 - 0.08, F - 0.05, 39.2 - A44, 0.1, 0.2, 0x9a9282);
}

/** se monta con lo demás */
export function buildFrayLuisNorte(scene, colliders, map) {
  if (!map?.frayLuisNorte) return null;
  const k = new Kit();
  casa46(k);
  casa44(k);
  const grupos = [enMarco(k, M, 'frayLuisNorte', colliders)];
  // las paredes que asoman: el lado del 46 sobre el 44, la trasera del 46 sobre el bloque y el cuarto alto de la azotea
  const lisa = (A, B, alto, nombre, color = '#ecebe6') => tira(A, B, alto, nombre, colliders, (kk, L) => pared(kk, 0, L, alto, liso(color), -0.25));
  grupos.push(lisa(P(A44, FL), P(A44, FONDO46), ALTO46, 'casa46LadoSur'));
  grupos.push(lisa(P(A44, FONDO46), P(A46, FONDO46), ALTO46, 'casa46Trasera'));
  grupos.push(tira(P(T0, TB), P(T1, TB), ALTO_T, 'casa46Cuarto', colliders, (kk, L) => {
    pared(kk, 0, L, ALTO_T, liso('#ecebe6'), -0.25);
    hueco(kk, L / 2, 7.4, 0.9, 1.0, canvasTex(54, 60, cristales('#2f7a42', 2)), { borde: 0x2a6a36, z: F });
  }));
  grupos.push(lisa(P(T1, TB), P(T1, FONDO46 + 0.1), ALTO_T, 'casa46CuartoSur'));
  grupos.push(lisa(P(T1, FONDO46 + 0.1), P(T0, FONDO46 + 0.1), ALTO_T, 'casa46CuartoEste'));
  for (const g of grupos) scene.add(g);
  return { grupos };
}
