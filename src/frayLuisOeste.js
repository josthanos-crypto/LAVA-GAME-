import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco, trocear } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';
import { paveMesh, polyTris } from './suelos.js';
import { pared, tira, puertaMarron, tierraParda } from './rapadurasSur.js';
import { sinPalmasDentro } from './coloraoLyC.js';

/**
 * La acera de enfrente de la calle Fray Luis de León (Altavista), la del oeste, de Padre Claret hasta la esquina de
 * Guillermo Topham, con las vistas de la calle de Google de julio de 2025 (Fray Luis de León 59, 48, 55, 44, 49, 37 y
 * 32; solo se miran, no van dentro del juego) y el plano del Catastro. En el mapa era un bloque genérico de 9 m entero.
 * De verdad son casas terreras casi todas, cada una a su altura:
 * - el 59, en la esquina de Padre Claret: el edificio canela de tres plantas con el garaje blanco, los balconcitos de
 *   barandilla blanca, las contraventanas blancas de lamas, la persiana y, al lado, el muro bajo con otro garaje;
 * - la casa blanca del hueco con la cancela verde y el garaje verde claro;
 * - el 55: la casa de dos plantas forrada de granito negro, con el portón, las ventanas y la puerta de madera, las dos
 *   losas que vuelan y el cuarto alto de la azotea;
 * - la casa de la piedra de colores con las contraventanas verdes y la señal azul de aparcamiento delante; la del
 *   garaje verde y las dos puertas verdes; el 49 con el porche de arco y su tejadillo; las de las puertas y ventanas
 *   verdes y marrones; el 37A con la parte de arriba de bloques sin enfoscar; la de la piedra abajo y la planta de
 *   arriba metida; y el 32, en la esquina, crema con el zócalo de plaqueta y el balcón de madera por el lado.
 * Y la cara de Padre Claret (vistas de la calle de Padre Claret 3, 5 y 7): el lado del 59, con su cuerpo que vuela, la
 * puerta blanca y los buzones, y las adosadas color arena hasta la esquina de Telésforo Bravo, con los cuerpos que
 * vuelan en la planta de arriba, las ventanitas de la escalera, las puertas blancas y el balcón blanco de la esquina.
 * Y por detrás, en Telésforo Bravo (vistas de la calle de Telésforo Bravo 33, 28 y 29): la casa de la esquina con sus
 * dos balcones y la placa de la calle, el 28 con la torre de la escalera, y el solar de tierra con la valla de alambre.
 */

// la cara de León y Castillo de El Túnel: a hacia el sur desde la esquina de Padre Claret, b hacia el oeste; la
// fachada de esta acera va por b = 32,8 + 0,0098·a (se va un poco hacia el oeste al bajar)
const C = [378.37 + 0.166579 * 1.9, -1299.89 - 0.98603 * 1.9];
const US = [-0.166579, 0.98603], E = [0.98605, 0.166412];
const P = (a, b = 0) => [C[0] + US[0] * a - E[0] * b, C[1] + US[1] * a - E[1] * b];
const bF = a => 32.8 + 0.0098 * a;
const AN = -1.0, AS = 122.83;
// el marco va del sur al norte, con la calle delante (al este); la cara a 0,054 de la línea
const M = marco(P(AS, bF(AS)), P(AN, bF(AN)));
const K = M.len / (AS - AN);
const x = a => (AS - a) * K;
const F = 0.054;

// las piezas del Catastro (alto y vértices en a, b), con la fachada llevada a la línea de la calle
const PARTES = [
  [3.0,[15.63,32.95,18.68,32.98,18.65,42.29,15.58,42.22,15.6,39.64]],
  [8.3,[15.63,32.95,15.6,39.64,13.68,39.57,11.85,39.49,9.93,39.52,8.11,39.43,8.09,40.62,8.12,42.09,6.87,42.11,3.82,42.03,3.59,42.07,3.66,41.07,3.67,40.47,3.63,39.6,3.41,39.63,-1.02,39.49,-1.01,36.23,-0.99,32.79,2.4,32.82,8.29,32.88]],
  [9.1,[8.12,42.09,8.09,40.62,8.11,39.43,9.93,39.52,11.85,39.49,13.68,39.57,15.6,39.64,15.58,42.22,13.67,42.24,11.85,42.15,9.92,42.08]],
  [9.1,[-1.02,39.49,3.41,39.63,3.63,39.6,3.67,40.47,3.66,41.07,3.59,42.07,-1.05,41.97]],
  [3.9,[27.18,48.65,27.2,50.83,18.63,50.89,18.72,50.08,18.69,49.89,18.65,42.29,18.68,32.98,24.34,33.04,27.28,33.07,27.33,37.57,27.34,38.26,27.32,39.45]],
  [6.6,[29.89,33.09,35.79,33.15,35.67,39.52,27.32,39.45,27.34,38.26,27.33,37.57,29.92,37.53]],
  [9.3,[35.67,39.52,35.54,47.34,35.52,48.63,27.18,48.65,27.32,39.45]],
  [9.0,[29.89,33.09,29.92,37.53,27.33,37.57,27.28,33.07]],
  [10.0,[35.52,48.63,35.55,50.8,27.2,50.83,27.18,48.65]],
  [4.2,[39.01,51.2,38.31,51.12,35.51,51.2,35.55,50.8,35.52,48.63,35.54,47.34,35.67,39.52,35.79,33.15,44.71,33.24,44.65,38.49,44.42,51.18,41.94,51.2,42.05,47.83,39.01,47.84]],
  [3.9,[54.82,38.56,48.83,38.49,48.74,47.99,48.06,48.0,48.04,51.26,44.42,51.18,44.65,38.49,44.71,33.24,47.65,33.27,54.89,33.34]],
  [3.9,[61.01,35.73,60.95,40.09,60.95,49.47,60.73,52.18,58.56,51.96,54.65,51.62,54.82,38.56,54.89,33.34,59.08,33.38,58.96,35.68]],
  [3.9,[60.95,49.47,60.95,40.09,61.01,35.73,60.99,33.4,66.54,33.45,66.31,46.4,66.25,48.78,66.21,53.23,65.09,53.23,64.75,53.18,63.16,53.16,63.12,50.29,61.32,50.3,61.3,49.52]],
  [6.6,[60.95,49.47,61.3,49.52,61.32,50.3,63.12,50.29,63.16,53.16,60.65,52.98,60.73,52.18]],
  [3.9,[68.97,48.81,69.06,53.34,66.21,53.23,66.25,48.78]],
  [3.9,[66.31,46.4,66.54,33.45,73.43,33.52,73.32,37.8,73.12,45.94,69.37,45.88,69.36,46.47]],
  [6.6,[73.12,45.94,73.04,48.82,68.97,48.81,66.25,48.78,66.31,46.4,69.36,46.47,69.37,45.88]],
  [4.2,[73.32,37.8,73.43,33.52,80.09,33.58,80.16,45.54,80.08,45.76,76.71,45.83,76.74,46.02,75.72,46.0,75.73,44.71,76.85,44.72,76.9,42.93,77.79,42.88,77.84,39.12,76.68,39.02,76.84,37.91]],
  [6.6,[80.08,45.76,80.14,48.8,76.98,48.75,73.04,48.82,73.12,45.94,73.32,37.8,76.84,37.91,76.68,39.02,77.84,39.12,77.79,42.88,76.9,42.93,76.85,44.72,75.73,44.71,75.72,46.0,76.74,46.02,76.71,45.83]],
  [3.8,[87.68,45.96,87.69,48.71,85.56,48.78,85.33,48.72,85.34,45.46,80.16,45.54,80.09,33.58,87.67,33.66,87.67,40.52,87.7,40.71,82.74,40.77,82.67,42.35,86.17,42.36,86.2,45.9]],
  [6.6,[80.16,45.54,85.34,45.46,85.33,48.72,80.14,48.8,80.08,45.76]],
  [6.6,[87.7,40.71,87.68,45.96,86.2,45.9,86.17,42.36,82.67,42.35,82.74,40.77]],
  [3.8,[87.67,40.52,87.67,33.66,95.15,33.73,95.08,36.31,95.02,41.95,91.73,41.91,91.69,42.31,90.56,42.31,90.5,40.63]],
  [6.6,[95.02,41.95,95.1,42.43,94.99,43.14,94.98,49.07,94.63,49.02,87.65,49.12,87.69,48.71,87.68,45.96,87.7,40.71,87.67,40.52,90.5,40.63,90.56,42.31,91.69,42.31,91.73,41.91]],
  [6.6,[99.43,33.77,99.38,36.38,95.08,36.31,95.15,33.73]],
  [6.6,[99.43,33.77,103.84,33.82,103.8,37.8,103.85,42.04,103.82,43.92,103.87,46.88,103.89,49.04,102.87,49.02,94.98,49.07,94.99,43.14,95.1,42.43,95.02,41.95,95.08,36.31,99.38,36.38]],
  [6.6,[110.97,42.12,110.94,44.0,108.23,43.97,108.21,43.87,103.82,43.92,103.85,42.04,103.8,37.8,106.97,37.85,107.88,37.21,107.92,36.12,110.98,36.19,110.9,39.07,108.19,39.04,108.15,42.11]],
  [9.3,[110.9,39.07,110.97,42.12,108.15,42.11,108.19,39.04]],
  [3.9,[110.98,36.19,107.92,36.12,107.88,37.21,106.97,37.85,103.8,37.8,103.84,33.82,110.96,33.89]],
  [9.3,[110.94,44.0,111.01,49.03,106.94,49.02,106.91,46.86,103.87,46.88,103.82,43.92,108.21,43.87,108.23,43.97]],
  [6.6,[122.72,42.9,122.62,48.95,118.55,48.94,118.54,42.82]],
  [9.3,[114.14,33.92,114.14,37.54,110.97,37.48,110.97,37.48,110.98,36.19,110.96,33.89,111.08,33.89]],
  [6.8,[114.14,33.92,122.83,34.0,122.79,40.62,118.51,40.65,118.49,38.58,113.87,38.57,113.89,39.35,110.95,39.36,110.95,39.36,110.9,39.07,110.97,37.48,110.97,37.48,114.14,37.54]],
  [9.3,[122.72,42.9,118.54,42.82,118.55,48.94,115.51,48.96,111.68,49.02,111.01,49.03,111.01,49.03,110.94,44.0,110.97,42.12,110.95,39.36,110.95,39.36,113.89,39.35,113.87,38.57,118.49,38.58,118.51,40.65,122.79,40.62]],
  [6.6,[115.51,48.96,118.55,48.94,122.62,48.95,122.59,52.8,122.61,55.57,122.52,66.04,111.8,66.11,111.77,62.92,111.77,60.26,111.74,57.4,115.57,57.35]],
  [9.3,[115.51,48.96,115.57,57.35,111.74,57.4,111.72,53.26,111.68,49.02]],
  [6.6,[111.77,62.92,109.51,62.91,109.54,66.12,102.86,66.16,102.85,58.9,105.11,58.92,105.07,56.65,102.82,56.74,102.8,53.28,111.72,53.26,111.74,57.4,107.79,57.38,107.84,60.33,111.77,60.26]],
  [9.3,[111.77,62.92,111.8,66.11,109.54,66.12,109.51,62.91]],
  [9.3,[111.74,57.4,111.77,60.26,107.84,60.33,107.79,57.38]],
  [9.3,[102.82,56.74,105.07,56.65,105.11,58.92,102.85,58.9]],
  [9.3,[102.8,53.28,102.87,49.02,103.89,49.04,106.94,49.02,111.01,49.03,111.68,49.02,111.72,53.26]],
  [3.9,[94.76,61.15,98.61,61.2,98.69,66.18,94.73,66.21]],
  [3.9,[94.69,54.74,98.07,54.67,98.11,58.91,94.72,58.89]],
  [3.9,[94.63,54.36,94.69,54.74,94.72,58.89,94.76,61.15,94.73,66.21,94.74,66.21,90.69,66.23,90.69,65.79,87.76,65.79,87.67,62.55,91.51,62.59,91.47,59.04,87.75,59.08,87.65,58.51,87.68,54.65,87.69,50.69,91.53,50.73,91.5,54.49]],
  [3.9,[87.65,58.51,87.75,59.08,87.67,62.55,87.76,65.79,87.72,66.25,85.58,66.26,77.02,66.31,76.94,60.61,85.61,60.42,85.63,58.54]],
  [3.9,[85.56,48.78,87.69,48.71,87.65,49.12,87.69,50.69,87.68,54.65,85.64,54.6,85.6,51.73]],
  [6.6,[77.01,54.97,79.74,55.1,79.72,53.62,81.74,53.57,81.67,51.81,85.6,51.73,85.64,54.6,85.63,58.54,85.61,60.42,76.94,60.61]],
  [3.9,[76.95,51.32,74.06,51.51,74.13,53.97,72.89,53.98,72.9,53.39,68.99,53.65,69.06,53.34,68.97,48.81,73.04,48.82,76.98,48.75]],
  [6.6,[76.95,51.32,77.01,54.97,76.94,60.61,77.02,66.31,68.79,66.36,68.86,66.36,68.83,63.36,68.96,60.77,68.99,53.65,72.9,53.39,72.89,53.98,74.13,53.97,74.06,51.51]],
  [6.6,[68.83,63.36,68.86,66.36,67.61,66.37,64.79,66.38,63.66,66.39,60.85,66.4,60.8,63.92,63.15,63.82,63.07,62.66,64.77,62.66,64.77,63.35]],
  [9.3,[60.8,63.92,60.73,58.8,60.65,52.98,63.16,53.16,64.75,53.18,65.09,53.23,66.21,53.23,69.06,53.34,68.99,53.65,68.96,60.77,68.83,63.36,64.77,63.35,64.77,62.66,63.07,62.66,63.15,63.82]],
  [3.9,[60.73,58.8,60.8,63.92,60.85,66.4,54.43,66.44,54.46,64.5,54.43,60.95,57.82,60.97,57.78,58.8]],
  [6.6,[60.73,58.8,57.78,58.8,57.82,60.97,54.43,60.95,54.29,54.16,54.31,51.59,54.65,51.62,58.56,51.96,60.73,52.18,60.65,52.98]],
  [3.9,[54.29,54.16,54.43,60.95,54.46,64.5,51.42,64.52,51.39,64.32,48.23,64.37,48.18,58.75,51.34,58.7,51.33,53.97]],
  [6.6,[41.6,51.16,41.94,51.2,44.42,51.18,44.17,66.5,40.9,66.52,39.66,66.53,38.42,66.54,35.27,66.55,35.39,59.22,35.51,51.2,38.31,51.12,38.26,54.2,39.96,54.2,41.55,54.23]],
  [9.3,[38.64,61.74,37.4,61.74,37.46,59.46,37.55,57.28,39.92,57.27,42.42,57.35,42.35,59.63,42.29,61.91,41.13,61.81,40.96,66.52,38.46,66.54]],
  [8.6,[18.67,60.46,18.68,66.65,15.41,66.67,13.83,66.68,11.35,66.69,7.85,66.71,3.45,66.74,-1.17,66.77,-1.17,59.96,-1.21,59.77,-1.13,59.56,-1.18,59.27,-1.11,56.99,-1.21,55.72,-1.17,53.25,-1.19,52.46,-1.09,49.77,-1.18,47.22,-1.17,45.93,-1.13,43.55,-1.05,41.97,3.59,42.07,3.82,42.03,6.87,42.11,8.12,42.09,9.92,42.08,11.85,42.15,13.67,42.24,15.58,42.22,15.54,49.93,18.69,49.89,18.72,50.08,18.63,50.89,18.7,57.3,15.63,57.22,15.63,60.48]]
];

/** antes de levantar la ciudad: las casas, cada una a su altura, en lugar del bloque genérico */
export function tuneFrayLuisOeste(map) {
  if (!Array.isArray(map?.buildings)) return;
  const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const r = q => [+q[0].toFixed(2), +q[1].toFixed(2)];
  const A = P(-0.09, 33.29), B = P(125.08, 32.56);
  const b = map.buildings.find(q => !q.skip && !q.edificioReal && Array.isArray(q.p) && q.p.some(p => d(p, A) < 0.3) && q.p.some(p => d(p, B) < 0.3));
  if (!b) return;
  b.skip = true;
  const color = a => a < 18.7 ? [200, 172, 140] : a > 27.2 && a < 35.8 ? [232, 228, 226] : a > 110.9 ? [236, 226, 204] : [242, 241, 236];
  for (const [h, v] of PARTES) {
    const ab = [];
    for (let i = 0; i < v.length; i += 2) ab.push([v[i], v[i + 1]]);
    const am = ab.reduce((s, q) => s + q[0], 0) / ab.length;
    // (al revés, para que den la vuelta como los bloques del mapa)
    const p = ab.map(q => r(P(q[0], q[1]))).reverse();
    p.push(p[0].slice());
    map.buildings.push({ p, h, k: 'gen', s: 0, f: color(am), c: [200, 196, 188], edificioReal: true });
  }
  map.frayLuisOeste = true;
}

// ——— las texturas ———

const liso = color => (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); };
const tx = (w, h, fn) => canvasTex(Math.max(16, Math.min(1024, Math.round(w * 60))), Math.max(16, Math.round(h * 60)), fn);
const azar = semilla => { let s = semilla; return () => (s = (s * 16807) % 2147483647) / 2147483647; };

/** el granito negro pulido, en placas */
const granito = paso => (g, w, h) => {
  g.fillStyle = '#2c2e31';
  g.fillRect(0, 0, w, h);
  const rnd = azar(7);
  for (let i = 0; i < w * h / 6; i++) {
    g.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,.10)' : 'rgba(0,0,0,.25)';
    g.fillRect(rnd() * w, rnd() * h, 1.2, 1.2);
  }
  g.strokeStyle = 'rgba(140,144,150,.35)';
  g.lineWidth = 1;
  for (let y = h; y > 0; y -= paso) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  for (let xx = 0; xx < w; xx += paso) { g.beginPath(); g.moveTo(xx, 0); g.lineTo(xx, h); g.stroke(); }
};

/** la piedra de colores en lajas, con las juntas claras */
function laja(g, w, h) {
  g.fillStyle = '#e0dbcf';
  g.fillRect(0, 0, w, h);
  const rnd = azar(5);
  const cs = ['#8c7a66', '#a48e76', '#6f6a62', '#9b8c7a', '#7c6652', '#b3a28a', '#5f5a54', '#a07a5e', '#c0ae96'];
  const dx = 24, dy = 18, nx = Math.ceil(w / dx) + 2, ny = Math.ceil(h / dy) + 2, q = [];
  for (let j = 0; j < ny; j++) { q[j] = []; for (let i = 0; i < nx; i++) q[j][i] = [i * dx + (rnd() - 0.5) * dx * 0.7, j * dy + (rnd() - 0.5) * dy * 0.7]; }
  g.strokeStyle = '#e2ddd0';
  g.lineWidth = 2.5;
  for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    g.fillStyle = cs[Math.floor(rnd() * cs.length)];
    g.beginPath();
    g.moveTo(...q[j][i]); g.lineTo(...q[j][i + 1]); g.lineTo(...q[j + 1][i + 1]); g.lineTo(...q[j + 1][i]);
    g.closePath(); g.fill(); g.stroke();
  }
}

/** la plaqueta de ladrillo de colores del zócalo, en tiras */
function plaqueta(g, w, h) {
  g.fillStyle = '#d8d0c4';
  g.fillRect(0, 0, w, h);
  const rnd = azar(3);
  const cs = ['#a8826e', '#b8957e', '#8e6e5e', '#c4a48e', '#9a8478', '#7e6656', '#b49c90'];
  const fh = 6;
  for (let y = 0, f = 0; y < h; y += fh, f++) {
    for (let xx = -(f % 2) * 14; xx < w;) {
      const l = 16 + rnd() * 18;
      g.fillStyle = cs[Math.floor(rnd() * cs.length)];
      g.fillRect(xx + 1, y + 1, l - 2, fh - 2);
      xx += l;
    }
  }
}

/** los bloques de cemento sin enfoscar */
function bloquesCrudos(g, w, h) {
  g.fillStyle = '#a49e94';
  g.fillRect(0, 0, w, h);
  const rnd = azar(9);
  const bw = 30, bh = 15;
  for (let y = h, f = 0; y > -bh; y -= bh, f++) {
    for (let xx = -(f % 2) * bw / 2; xx < w; xx += bw) {
      const t = 150 + Math.floor(rnd() * 26);
      g.fillStyle = `rgb(${t},${t - 6},${t - 14})`;
      g.fillRect(xx + 1.5, y - bh + 1.5, bw - 3, bh - 3);
    }
  }
}

/** contraventanas blancas de lamas, de las hojas que se pidan, con los cuarterones de abajo */
const lamasBlancas = (n = 4) => (g, w, h) => {
  g.fillStyle = '#f4f4f0';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#b4b4ae';
  g.lineWidth = 1.5;
  const hw = w / n;
  for (let i = 0; i < n; i++) {
    const x0 = i * hw;
    g.strokeRect(x0 + 2, 2, hw - 4, h - 4);
    for (let y = 7; y < h * 0.66; y += 5) { g.beginPath(); g.moveTo(x0 + 6, y); g.lineTo(x0 + hw - 6, y); g.stroke(); }
    g.strokeRect(x0 + 6, h * 0.72, hw - 12, h * 0.22);
  }
};

/** la puerta blanca de cuarterones, con el de arriba en arco */
function puertaBlanca(g, w, h) {
  g.fillStyle = '#f4f4f0';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c8c8c2';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(w * 0.2, h * 0.42); g.lineTo(w * 0.2, h * 0.16); g.quadraticCurveTo(w * 0.5, h * 0.04, w * 0.8, h * 0.16); g.lineTo(w * 0.8, h * 0.42);
  g.closePath(); g.stroke();
  g.strokeRect(w * 0.2, h * 0.5, w * 0.6, h * 0.42);
  g.fillStyle = '#9a9a94';
  g.fillRect(w * 0.82, h * 0.48, w * 0.06, h * 0.03);
}

/** la señal redonda de prohibido girar a la izquierda (lo de dentro del círculo) */
function prohibidoIzquierda(g, w, h) {
  g.fillStyle = '#f4f4f2';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#1a1a1a';
  g.lineWidth = w * 0.09;
  g.beginPath(); g.moveTo(w * 0.6, h * 0.92); g.lineTo(w * 0.6, h * 0.48); g.quadraticCurveTo(w * 0.6, h * 0.32, w * 0.42, h * 0.32); g.lineTo(w * 0.3, h * 0.32); g.stroke();
  g.fillStyle = '#1a1a1a';
  g.beginPath(); g.moveTo(w * 0.12, h * 0.32); g.lineTo(w * 0.32, h * 0.16); g.lineTo(w * 0.32, h * 0.48); g.closePath(); g.fill();
  g.strokeStyle = '#c8202a';
  g.lineWidth = w * 0.1;
  g.beginPath(); g.moveTo(w * 0.02, h * 0.02); g.lineTo(w * 0.98, h * 0.98); g.stroke();
}

/** el garaje de chapa de paneles (blanco o verde) */
const garaje = (fondo, raya, vertical = false) => (g, w, h) => {
  g.fillStyle = fondo;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = raya;
  g.lineWidth = 2;
  if (vertical) for (let xx = 8; xx < w; xx += 10) { g.beginPath(); g.moveTo(xx, 0); g.lineTo(xx, h); g.stroke(); }
  else for (let y = h / 6; y < h; y += h / 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.fillStyle = 'rgba(0,0,0,.45)';
  g.fillRect(w * 0.48, h * 0.6, 3, 9);
};

/** una persiana enrollable blanca, bajada (o a medias, con el cristal oscuro debajo) */
const persiana = (baja = 1) => (g, w, h) => {
  g.fillStyle = '#3e4246';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#ecebe6';
  g.fillRect(0, 0, w, h * baja);
  g.strokeStyle = '#c8c6c0';
  g.lineWidth = 1;
  for (let y = 3; y < h * baja; y += 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
};

/** una puerta verde de tablas */
function puertaVerde(g, w, h) {
  g.fillStyle = '#2e8a46';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#1e6a32';
  g.lineWidth = 3;
  for (const [y0, y1] of [[0.06, 0.3], [0.36, 0.62], [0.68, 0.94]]) for (const x0 of [0.14, 0.54]) g.strokeRect(w * x0, h * y0, w * 0.32, h * (y1 - y0));
  g.fillStyle = '#c8c8c0';
  g.fillRect(w * 0.44, h * 0.5, w * 0.12, h * 0.02);
}

/** contraventanas de lamas (verdes o marrones), de tres hojas */
const lamas = (fondo, raya) => (g, w, h) => {
  g.fillStyle = fondo;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = raya;
  g.lineWidth = 1.5;
  for (let y = 4; y < h - 2; y += 4) { g.beginPath(); g.moveTo(3, y); g.lineTo(w - 3, y); g.stroke(); }
  g.fillStyle = raya;
  for (let xx = w / 3; xx < w - 2; xx += w / 3) g.fillRect(xx - 1.5, 0, 3, h);
};

/** la ventana de marco verde: los cristales a los lados y la contraventana de lamas verdes en medio */
function ventanaVerde(g, w, h) {
  g.fillStyle = '#2f8a4a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#5a4436';
  g.fillRect(4, 4, w * 0.25 - 6, h - 8);
  g.fillRect(w * 0.75 + 2, 4, w * 0.25 - 6, h - 8);
  g.strokeStyle = '#1e6a32';
  g.lineWidth = 1.5;
  for (let y = 5; y < h - 3; y += 4) { g.beginPath(); g.moveTo(w * 0.27, y); g.lineTo(w * 0.73, y); g.stroke(); }
  g.fillRect(w / 2 - 1, 0, 2, h);
}

/** la madera barnizada de cuarterones con cristalitos arriba (portón, puerta o ventana de la casa de granito) */
const maderaCristales = (hojas, cristalHasta = 0.55) => (g, w, h) => {
  g.fillStyle = '#7a5032';
  g.fillRect(0, 0, w, h);
  const hw = w / hojas;
  for (let i = 0; i < hojas; i++) {
    const x0 = i * hw;
    g.strokeStyle = '#4e321e';
    g.lineWidth = 2;
    g.strokeRect(x0 + 1, 1, hw - 2, h - 2);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) {
      g.fillStyle = r % 2 === c % 2 ? '#3c3a36' : '#58524a';
      g.fillRect(x0 + hw * 0.12 + c * hw * 0.4, h * 0.05 + r * h * cristalHasta / 4, hw * 0.34, h * cristalHasta / 4 - 3);
    }
    g.strokeStyle = '#5a3a24';
    g.lineWidth = 3;
    if (cristalHasta < 0.95) for (let r = 0; r < 2; r++) g.strokeRect(x0 + hw * 0.15, h * (cristalHasta + 0.1) + r * h * (0.85 - cristalHasta) / 2, hw * 0.7, h * (0.85 - cristalHasta) / 2 - 4);
  }
};

/** las ventanas de madera de arriba: los cristales a los lados y la celosía de librillo en medio */
function ventanaLibrillo(g, w, h) {
  g.fillStyle = '#7a5032';
  g.fillRect(0, 0, w, h);
  for (const x0 of [0.05, 0.68]) for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
    g.fillStyle = '#4a4640';
    g.fillRect(w * (x0 + c * 0.13), h * (0.06 + r * 0.24), w * 0.11, h * 0.2);
  }
  g.strokeStyle = '#4e321e';
  g.lineWidth = 2;
  for (let y = h * 0.06; y < h * 0.76; y += 4) { g.beginPath(); g.moveTo(w * 0.36, y); g.lineTo(w * 0.64, y); g.stroke(); }
  g.fillStyle = '#5a3a24';
  g.fillRect(0, h * 0.8, w, 3);
  for (let i = 0; i < 4; i++) g.fillRect(w * (0.04 + i * 0.24), h * 0.84, w * 0.2, h * 0.12);
}

/** el hueco de la casa blanca: el fondo encalado con el trozo tapiado y la cancela verde a la derecha */
function huecoCancela(g, w, h) {
  g.fillStyle = '#cfc8bc';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(0,0,0,.18)';
  g.fillRect(0, 0, w, h * 0.08);
  g.fillRect(0, 0, w * 0.03, h);
  g.fillStyle = '#bdb4a6';
  g.fillRect(w * 0.38, h * 0.05, w * 0.3, h * 0.33);
  g.fillStyle = '#d8d2c6';
  g.fillRect(0, h * 0.84, w, h * 0.16);
  // la cancela, de barrotes verdes
  const x0 = w * 0.77;
  g.fillStyle = '#3aa078';
  g.fillRect(x0, h * 0.42, w - x0, 4);
  g.fillRect(x0, h * 0.62, w - x0, 4);
  g.fillRect(x0, h * 0.95, w - x0, 4);
  for (let xx = x0; xx < w; xx += (w - x0) / 6) g.fillRect(xx, h * 0.42, 4, h * 0.56);
}

/** el porche de arco del 49: los azulejos claros de dentro y la puerta de madera */
function porcheArco(g, w, h) {
  g.fillStyle = '#f0efe9';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e4dccc';
  g.beginPath();
  g.moveTo(w * 0.06, h);
  g.lineTo(w * 0.06, h * 0.32);
  g.arc(w / 2, h * 0.32, w * 0.44, Math.PI, 0);
  g.lineTo(w * 0.94, h);
  g.closePath();
  g.fill();
  g.strokeStyle = 'rgba(150,140,120,.35)';
  g.lineWidth = 1;
  for (let y = h * 0.3; y < h; y += 7) { g.beginPath(); g.moveTo(w * 0.06, y); g.lineTo(w * 0.94, y); g.stroke(); }
  g.fillStyle = '#5a3220';
  g.fillRect(w * 0.28, h * 0.24, w * 0.44, h * 0.76);
  g.fillStyle = '#c8c0a0';
  g.fillRect(w * 0.32, h * 0.62, w * 0.04, h * 0.02);
}

/** la reja negra del porche del 37A, con el patinillo oscuro detrás y la puerta abierta */
function rejaPorche(g, w, h) {
  g.fillStyle = '#5a564e';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#7a6e5c';
  g.fillRect(w * 0.55, h * 0.1, w * 0.4, h * 0.9);
  g.fillStyle = '#1e1e1e';
  for (let xx = 2; xx < w * 0.5; xx += 7) g.fillRect(xx, 0, 3, h);
  g.fillRect(0, 0, w * 0.5, 4);
  g.fillRect(0, h - 4, w * 0.5, 4);
}

/** la ventana blanca con la reja de barrotes del 37A */
function ventanaReja(g, w, h) {
  g.fillStyle = '#3a3e44';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f2f2ee';
  for (let xx = 4; xx < w; xx += 12) g.fillRect(xx, 0, 4, h);
  g.fillRect(0, 0, w, 4);
  g.fillRect(0, h - 4, w, 4);
}

/** cristal oscuro con la carpintería del color que se pida */
const vidrio = (carp, hojas = 2) => cristales(carp, hojas, 'rgba(50,52,56,.55)');

// ——— las piezas ———

/** un hueco de a0 a a1 (a0 < a1) y de y0 a y1 */
const hu = (k, a0, a1, y0, y1, fn, borde, z = F) => hueco(k, (x(a0) + x(a1)) / 2, y0, a1 - a0, y1 - y0, tx(a1 - a0, y1 - y0, fn), { borde, z });
/** una pieza que sale de la fachada */
const caja = (k, a0, a1, y0, y1, sale, color, z = F) => k.box((x(a0) + x(a1)) / 2, y0, z + sale / 2, a1 - a0, y1 - y0, sale, color);
/** un zócalo pintado encima de la pared */
const zocalo = (k, a0, a1, y1, fn, hex) => {
  caja(k, a0, a1, 0, y1, 0.03, hex);
  k.pic((x(a0) + x(a1)) / 2, y1 / 2, F + 0.034, a1 - a0, y1, 0, 1, tx(a1 - a0, y1, fn));
};
/** la pared de la fachada, de a0 a a1 */
const muro = (k, a0, a1, alto, fn) => pared(k, x(a1), x(a0), alto, fn, -0.25);
/** el remate de arriba de las azoteas */
const remate = (k, a0, a1, y, hex = 0xe6e4de) => caja(k, a0, a1, y - 0.1, y, 0.08, hex);

/** el 59, en la esquina de Padre Claret, y el muro bajo de su garaje */
function casa59(k) {
  const canela = '#c9ad8e';
  muro(k, AN, 15.6, 8.3, liso(canela));
  muro(k, 15.6, 18.65, 3.0, liso(canela));
  caja(k, AN, 18.65, 0, 1.2, 0.03, 0xb4987a);
  // las juntas de las plantas
  for (const y of [3.0, 5.7]) caja(k, AN, 15.6, y, y + 0.04, 0.02, 0xb09478);
  hu(k, 11.5, 14.7, 0.02, 2.6, garaje('#f2f2ee', '#c8c8c2'), 0xeeeeea, F + 0.03);
  hu(k, 16.0, 18.2, 0.02, 2.4, garaje('#f2f2ee', '#c8c8c2'), 0xeeeeea, F + 0.03);
  // la primera planta
  hu(k, 1.9, 3.0, 3.0, 4.3, lamasBlancas(2), 0xf2f2ee);
  hu(k, 4.7, 7.0, 3.0, 4.3, lamasBlancas(4), 0xf2f2ee);
  for (const [a0, a1] of [[8.8, 9.8], [11.6, 12.8]]) hu(k, a0, a1, 3.0, 4.3, vidrio('#f2f2ee'), 0xf2f2ee);
  for (const [a0, a1] of [[8.6, 10.0], [11.4, 13.0]]) caja(k, a0, a1, 4.45, 4.6, 0.4, 0xc2a688);
  // la segunda: la ventana grande con la persiana a medias y su visera, los dos balconcitos y la persiana bajada
  hu(k, 4.4, 6.4, 5.6, 7.0, persiana(0.5), 0xf2f2ee);
  caja(k, 4.2, 6.6, 7.25, 7.45, 0.35, 0xc2a688);
  for (const [a0, a1] of [[8.8, 10.0], [11.5, 12.6]]) {
    hu(k, a0, a1, 5.6, 7.0, vidrio('#f2f2ee'), 0xf2f2ee);
    for (let a = a0 + 0.05; a <= a1; a += 0.11) caja(k, a, a + 0.025, 5.6, 6.5, 0.025, 0xf2f2ee, F + 0.12);
    caja(k, a0, a1, 6.48, 6.52, 0.03, 0xf2f2ee, F + 0.12);
  }
  hu(k, 1.9, 2.9, 5.6, 7.0, persiana(), 0xf2f2ee);
  remate(k, AN, 15.6, 8.3, 0xc0a486);
  remate(k, 15.6, 18.65, 3.0, 0xc0a486);
}

/** la casa blanca del hueco con la cancela verde y el garaje verde claro */
function casaCancela(k) {
  muro(k, 18.65, 27.3, 3.9, liso('#eeede7'));
  caja(k, 18.65, 27.3, 0, 0.5, 0.03, 0xd8d6cf);
  hu(k, 19.0, 22.5, 0.02, 2.4, huecoCancela, 0xe8e6e0, F + 0.03);
  hu(k, 23.7, 25.9, 0.02, 2.4, garaje('#86c4a0', '#6aa884', true), 0x9ad0b0, F + 0.03);
  remate(k, 18.65, 27.3, 3.9);
}

/** el 55: la casa de granito negro con su cuarto alto */
function casa55(k) {
  const gr = granito(14);
  muro(k, 27.3, 29.9, 9.0, gr);
  muro(k, 29.9, 35.8, 6.6, gr);
  hu(k, 32.65, 35.38, 0.02, 2.6, maderaCristales(4, 0.5), 0x5a3a24, F + 0.03);
  hu(k, 29.73, 31.88, 1.0, 2.3, maderaCristales(3, 0.62), 0x5a3a24, F + 0.03);
  hu(k, 27.98, 28.96, 0.02, 2.4, maderaCristales(1, 0.45), 0x5a3a24, F + 0.03);
  // la losa del primer piso y la de arriba, que vuela más
  caja(k, 27.3, 35.8, 2.9, 3.2, 0.45, 0x2e3033);
  hu(k, 32.8, 34.4, 3.8, 5.0, ventanaLibrillo, 0x5a3a24, F + 0.03);
  hu(k, 29.9, 31.7, 3.6, 5.2, maderaCristales(3, 0.95), 0x5a3a24, F + 0.03);
  hu(k, 27.9, 29.25, 3.8, 5.0, ventanaLibrillo, 0x5a3a24, F + 0.03);
  caja(k, 27.3, 35.8, 6.35, 6.6, 0.9, 0x2e3033);
  // el cuarto alto, con su ventana de madera
  hu(k, 27.85, 29.4, 7.0, 8.4, ventanaLibrillo, 0x5a3a24, F + 0.03);
  // las ventanas de madera no llevan alféizar blanco, sino el larguero de madera de abajo
  for (const [a0, a1, y0] of [[29.73, 31.88, 1.0], [32.8, 34.4, 3.8], [29.9, 31.7, 3.6], [27.9, 29.25, 3.8], [27.85, 29.4, 7.0]]) caja(k, a0 - 0.16, a1 + 0.16, y0 - 0.09, y0 + 0.012, 0.21, 0x5a3a24);
  remate(k, 27.3, 29.9, 9.0, 0x2e3033);
}

/** la casa de la piedra de colores, con las contraventanas verdes */
function casaPiedra(k) {
  muro(k, 35.8, 44.6, 4.2, liso('#f0efe9'));
  zocalo(k, 35.8, 44.6, 2.9, laja, 0x8c7a66);
  caja(k, 35.8, 44.6, 2.9, 3.05, 0.3, 0xeeede8);
  for (const [a0, a1] of [[36.92, 39.2], [41.38, 43.46]]) hu(k, a0, a1, 1.1, 2.3, lamas('#2f8a46', '#1e6a32'), 0x2a7a3e, F + 0.05);
  hu(k, 40.19, 41.08, 0.02, 2.3, puertaVerde, 0x2a7a3e, F + 0.05);
  remate(k, 35.8, 44.6, 4.2);
}

/** la casa del garaje verde y las dos puertas verdes */
function casaGarajeVerde(k) {
  muro(k, 44.6, 54.85, 3.9, liso('#efeee8'));
  caja(k, 44.6, 54.85, 0, 1.0, 0.03, 0x8a9094);
  hu(k, 45.42, 47.96, 0.02, 2.5, garaje('#3a9a68', '#2a7a50', true), 0x2e8a58, F + 0.03);
  for (const [a0, a1] of [[49.94, 51.12], [52.3, 53.56]]) hu(k, a0, a1, 0.02, 2.4, puertaVerde, 0x2a7a3e, F + 0.03);
  remate(k, 44.6, 54.85, 3.9);
}

/** el 49, con las contraventanas verdes y el porche de arco con su tejadillo */
function casa49(k) {
  muro(k, 54.85, 61.0, 3.9, liso('#f0efe9'));
  caja(k, 54.85, 61.0, 0, 0.9, 0.03, 0x9a9a96);
  hu(k, 56.12, 57.6, 1.1, 2.2, lamas('#2f8a46', '#1e6a32'), 0x2a7a3e, F + 0.03);
  hu(k, 59.59, 60.78, 0.02, 2.6, porcheArco, 0xf0efe9, F + 0.03);
  caja(k, 59.35, 61.0, 2.7, 3.1, 0.5, 0xb85a3e);
  caja(k, 59.45, 60.9, 3.1, 3.2, 0.3, 0xa44a32);
  remate(k, 54.85, 61.0, 3.9);
}

/** la casa del zócalo de plaqueta con la puerta y la ventana marrones */
function casaMarron(k) {
  muro(k, 61.0, 66.4, 3.9, liso('#efeee8'));
  zocalo(k, 61.0, 66.4, 1.1, plaqueta, 0xa8826e);
  hu(k, 61.08, 62.57, 0.02, 2.4, puertaMarron, 0x4e3122, F + 0.05);
  hu(k, 63.96, 65.15, 1.1, 2.2, lamas('#6a3a2c', '#3e2018'), 0x4e3122, F + 0.05);
  remate(k, 61.0, 66.4, 3.9);
}

/** las tres casas de las puertas y ventanas verdes */
function casasVerdes(k) {
  muro(k, 66.4, 73.3, 3.9, liso('#f0efe9'));
  zocalo(k, 66.4, 73.3, 1.0, liso('#9a9894'), 0x9a9894);
  for (const [a0, a1] of [[67.5, 68.71], [71.22, 72.53]]) hu(k, a0, a1, 1.1, 2.1, ventanaVerde, 0x2a7a3e, F + 0.05);
  hu(k, 70.18, 70.96, 0.02, 2.2, puertaVerde, 0x2a7a3e, F + 0.05);
  remate(k, 66.4, 73.3, 3.9);
  muro(k, 73.3, 80.15, 4.2, liso('#efeee8'));
  caja(k, 73.3, 80.15, 0, 1.0, 0.03, 0x7f8c96);
  hu(k, 74.36, 75.6, 0.02, 2.4, puertaVerde, 0x2a7a3e, F + 0.03);
  hu(k, 76.76, 77.65, 0.02, 2.3, puertaVerde, 0x2a7a3e, F + 0.03);
  hu(k, 78.14, 79.16, 1.1, 2.2, ventanaVerde, 0x2a7a3e, F + 0.03);
  remate(k, 73.3, 80.15, 4.2);
  muro(k, 80.15, 87.7, 3.8, liso('#f0efe9'));
  caja(k, 80.15, 84.9, 0, 1.0, 0.03, 0x8e8e8a);
  zocalo(k, 84.9, 87.6, 1.0, plaqueta, 0xa8826e);
  for (const [a0, a1] of [[80.2, 82.2], [82.3, 83.5]]) hu(k, a0, a1, 1.0, 2.2, vidrio('#2a2a2a', 3), 0x2a2a2a, F + 0.05);
  hu(k, 84.99, 86.32, 1.1, 2.1, ventanaVerde, 0x2a7a3e, F + 0.05);
  remate(k, 80.15, 87.7, 3.8);
}

/** la casa de las ventanas marrones y el zócalo azulado */
function casaAzulada(k) {
  muro(k, 87.7, 95.1, 3.8, liso('#efeee8'));
  caja(k, 87.7, 95.1, 0, 1.0, 0.03, 0x8494a0);
  for (const [a0, a1] of [[89.05, 90.31], [92.82, 94.07]]) hu(k, a0, a1, 1.1, 2.1, vidrio('#6a4430'), 0x4e3122, F + 0.03);
  hu(k, 91.77, 92.61, 0.02, 2.2, puertaMarron, 0x4e3122, F + 0.03);
  remate(k, 87.7, 95.1, 3.8);
}

/** el 37A: blanco abajo y los bloques sin enfoscar arriba */
function casa37A(k) {
  muro(k, 95.1, 103.85, 6.6, liso('#f2f1ec'));
  k.pic((x(95.1) + x(103.85)) / 2, 6.2, F + 0.006, 103.85 - 95.1, 0.8, 0, 1, tx(103.85 - 95.1, 0.8, bloquesCrudos));
  caja(k, 95.1, 103.85, 5.62, 5.8, 0.12, 0xe8e6e0);
  // el antepecho de bloques de la parte del sur, más alto
  caja(k, 99.4, 103.85, 6.6, 7.4, 0.2, 0xa49e94, F - 0.2);
  k.pic((x(99.4) + x(103.85)) / 2, 7.0, F + 0.003, 103.85 - 99.4, 0.8, 0, 1, tx(103.85 - 99.4, 0.8, bloquesCrudos));
  hu(k, 95.6, 98.1, 0.02, 1.9, rejaPorche, 0x1e1e1e, F + 0.03);
  hu(k, 99.17, 100.02, 0.02, 2.3, liso('#f4f4f0'), 0xe8e8e4, F + 0.03);
  hu(k, 100.02, 102.02, 1.1, 2.2, ventanaReja, 0xf2f2ee, F + 0.03);
  hu(k, 101.28, 102.24, 4.6, 5.3, vidrio('#e8e4dc', 1), 0xe8e4dc, F + 0.03);
}

/** la casa de la piedra abajo, con la planta de arriba metida */
function casaMetida(k) {
  muro(k, 103.85, 110.95, 3.9, liso('#f0efe9'));
  zocalo(k, 103.85, 110.95, 1.0, laja, 0x8c7a66);
  for (const [a0, a1] of [[104.46, 105.72], [108.08, 109.47]]) hu(k, a0, a1, 1.1, 2.2, lamas('#6a3a2c', '#3e2018'), 0x4e3122, F + 0.05);
  hu(k, 106.15, 107.42, 0.02, 2.3, puertaMarron, 0x4e3122, F + 0.05);
  caja(k, 103.85, 110.95, 3.75, 3.95, 0.25, 0xeeede8);
}

/** el 32, en la esquina de Guillermo Topham: crema, con el zócalo de plaqueta y el cuarto alto */
function casa32(k) {
  const crema = liso('#ece2cc');
  muro(k, 110.95, 114.14, 9.3, crema);
  muro(k, 114.14, AS, 6.8, crema);
  zocalo(k, 110.95, AS, 1.2, plaqueta, 0xa8826e);
  caja(k, 110.95, AS, 3.3, 3.4, 0.06, 0x2a2a2a);
  hu(k, 111.3, 112.9, 0.02, 2.5, vidrio('#3a3a3a', 2), 0x3a3a3a, F + 0.05);
  for (const [a0, a1] of [[115.3, 116.8], [119.25, 120.73]]) hu(k, a0, a1, 1.1, 2.4, vidrio('#3a3a3a', 2), 0x3a3a3a, F + 0.05);
  for (const [a0, a1] of [[111.9, 112.9], [114.9, 116.4], [119.3, 120.7]]) hu(k, a0, a1, 4.3, 5.3, vidrio('#3a3a3a', 2), 0x3a3a3a, F + 0.03);
  remate(k, 114.14, AS, 6.8, 0xe0d6c0);
  remate(k, 110.95, 114.14, 9.3, 0xe0d6c0);
  // la placa azul de la calle, en la esquina
  caja(k, 121.75, 122.45, 2.6, 2.9, 0.02, 0x2a4ea0, F + 0.01);
  k.pic((x(121.75) + x(122.45)) / 2, 2.75, F + 0.034, 0.66, 0.26, 0, 1, canvasTex(132, 52, (g, w, h) => {
    g.fillStyle = '#2a4ea0'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#f2f2ee'; g.lineWidth = 2; g.strokeRect(3, 3, w - 6, h - 6);
    g.fillStyle = '#f2f2ee'; g.font = 'bold 13px Arial'; g.textAlign = 'center';
    g.fillText('FRAY LUIS', w / 2 + 6, 22); g.fillText('DE LEÓN', w / 2 + 6, 38);
  }));
}

/** la señal azul de aparcamiento, en su poste, delante de la casa de la piedra */
function senalP(k) {
  const s = x(36.3);
  k.cyl(s, 0, F + 0.35, 0.03, 0.03, 2.9, 0x8a8e92, { seg: 8 });
  k.box(s, 2.3, F + 0.38, 0.6, 0.6, 0.03, 0xf2f2ee);
  k.pic(s, 2.6, F + 0.397, 0.56, 0.56, 0, 1, canvasTex(84, 84, (g, w, h) => {
    g.fillStyle = '#1f5fbf'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; g.font = 'bold 64px Arial'; g.textAlign = 'center'; g.fillText('P', w / 2, h * 0.8);
  }));
}

/** la cara de Padre Claret, del este al oeste (b): el lado del 59 y las adosadas color arena hasta Telésforo Bravo */
function caraPadreClaret(colliders) {
  const B0 = 32.8, B1 = 66.77;
  return tira(P(AN, B0), P(-1.2, B1), 8.6, 'frayLuisOestePadreClaret', colliders, (k, L) => {
    const s = b => (b - B0) * L / (B1 - B0);
    const caja = (b0, b1, y0, y1, sale, hex, z = F) => k.box((s(b0) + s(b1)) / 2, y0, z + sale / 2, s(b1) - s(b0), y1 - y0, sale, hex);
    const ho = (b0, b1, y0, y1, fn, borde, z = F) => hueco(k, (s(b0) + s(b1)) / 2, y0, s(b1) - s(b0), y1 - y0, tx(b1 - b0, y1 - y0, fn), { borde, z });
    // el lado del 59: canela, más alto por detrás, con el zócalo, las dos ventanas de lamas, los buzones y los
    // contadores, la puerta blanca, el cuerpo que vuela con la persiana y las ventanitas de la escalera
    pared(k, 0, s(39.6), 8.3, liso('#c9ad8e'), -0.25);
    pared(k, s(39.6), s(42.0), 9.1, liso('#c9ad8e'), -0.25);
    caja(B0, 42.0, 0, 1.25, 0.03, 0xb4987a);
    ho(33.87, 35.09, 1.75, 3.0, lamasBlancas(2), 0xf2f2ee, F + 0.03);
    ho(36.9, 38.71, 1.16, 3.0, lamasBlancas(3), 0xf2f2ee, F + 0.03);
    for (let i = 0; i < 4; i++) caja(38.92 + i * 0.37, 39.22 + i * 0.37, 1.75, 2.1, 0.12, 0xa86a44, F + 0.03);
    caja(38.85, 39.43, 0.65, 1.4, 0.16, 0xe8e8e2, F + 0.03);
    caja(39.71, 40.46, 0.75, 1.35, 0.14, 0xe0e0da, F + 0.03);
    caja(40.45, 41.6, 0, 0.3, 0.35, 0xd8d4cc, F + 0.03);
    ho(40.59, 41.46, 0.3, 2.54, puertaBlanca, 0xf2f2ee, F + 0.03);
    ho(34.09, 35.26, 4.89, 6.12, persiana(0.92), 0xf2f2ee);
    caja(36.1, 40.14, 3.46, 7.34, 0.35, 0xc9ad8e);
    ho(37.08, 38.92, 4.5, 6.44, persiana(0.85), 0xf2f2ee, F + 0.35);
    ho(40.44, 41.5, 4.09, 5.23, vidrio('#f2f2ee'), 0xf2f2ee);
    ho(40.47, 41.59, 6.87, 7.99, vidrio('#f2f2ee'), 0xf2f2ee);
    caja(B0, 39.6, 8.2, 8.3, 0.08, 0xc0a486);
    caja(39.6, 42.0, 9.0, 9.1, 0.08, 0xc0a486);
    // la señal de prohibido girar a la izquierda, en su poste junto a la esquina
    const sp = s(33.45);
    k.cyl(sp, 0, F + 0.3, 0.03, 0.03, 3.2, 0x8a8e92, { seg: 8 });
    k.cyl(sp, 2.85, F + 0.34, 0.31, 0.31, 0.02, 0xc8202a, { seg: 28, rx: Math.PI / 2 });
    k.cyl(sp, 2.85, F + 0.36, 0.24, 0.24, 0.01, 0xf4f4f2, { seg: 28, rx: Math.PI / 2 });
    k.pic(sp, 2.85, F + 0.374, 0.33, 0.33, 0, 1, canvasTex(66, 66, prohibidoIzquierda));
    // las adosadas color arena: el zócalo con la raya gris, las franjas oscuras y la raya gris de la planta
    pared(k, s(42.0), L, 8.6, liso('#d8b99b'), -0.25);
    caja(41.85, 42.15, 0, 8.6, 0.1, 0xc8a07a);
    caja(42.0, B1, 0, 0.8, 0.02, 0xceae8e);
    caja(42.0, B1, 0.78, 0.83, 0.05, 0x7d8288);
    caja(42.0, B1, 3.68, 4.05, 0.03, 0xc49a6c);
    caja(42.0, B1, 4.43, 4.48, 0.07, 0x7d8288);
    caja(42.0, B1, 6.6, 6.8, 0.03, 0xc49a6c);
    caja(42.0, B1, 8.5, 8.6, 0.06, 0xccac8c);
    // los cuerpos que vuelan en la planta de arriba, con su ventana grande, y las ventanas de abajo
    for (const [b0, b1, v0, v1, w0, w1, abajo] of [
      [42.93, 47.0, 43.95, 46.2, 43.95, 46.15, vidrio('#f2f2ee', 3)],
      [49.12, 53.33, 49.95, 52.44, 49.61, 51.95, lamasBlancas(4)],
      [54.5, 58.7, 55.37, 57.84, 55.3, 57.6, lamasBlancas(4)],
    ]) {
      caja(b0, b1, 3.68, 8.68, 0.4, 0xd8b99b);
      caja(b0, b1, 3.68, 4.05, 0.43, 0xc49a6c);
      caja(b0, b1, 6.96, 7.15, 0.43, 0xc49a6c);
      caja(b0, b1, 4.43, 4.48, 0.47, 0x7d8288);
      ho(v0, v1, 5.26, 6.69, vidrio('#f2f2ee', 3), 0xf2f2ee, F + 0.4);
      ho(w0, w1, 1.97, 3.39, abajo, 0xf2f2ee, F + 0.03);
    }
    // las ventanitas de la escalera, las puertas blancas con su escalón y los buzones
    for (const [b0, b1] of [[47.55, 48.48], [53.14, 54.16]]) {
      ho(b0, b1, 4.55, 5.3, vidrio('#f2f2ee'), 0xf2f2ee);
      ho(b0, b1, 7.05, 7.85, vidrio('#f2f2ee'), 0xf2f2ee);
    }
    for (const [b0, b1] of [[47.72, 48.63], [53.6, 54.45]]) {
      caja(b0 - 0.1, b1 + 0.1, 0, 0.27, 0.3, 0xd8d4cc, F + 0.03);
      ho(b0, b1, 0.27, 2.34, puertaBlanca, 0xf2f2ee, F + 0.03);
    }
    for (const b of [46.8, 47.12, 52.85, 53.17]) caja(b, b + 0.26, 1.8, 2.1, 0.12, 0xe8e6e0, F + 0.03);
    // la casa de la esquina, sin cuerpo que vuele: la ventana de lamas, el balcón blanco de obra con la puerta de
    // cristal y la placa azul de la calle
    ho(60.4, 62.1, 1.7, 3.4, lamasBlancas(2), 0xf2f2ee, F + 0.03);
    ho(60.5, 61.7, 4.46, 6.7, vidrio('#f2f2ee'), 0xf2f2ee);
    caja(60.0, 62.3, 4.36, 4.46, 0.6, 0xeeeeea);
    caja(60.0, 62.3, 4.46, 5.55, 0.06, 0xf2f2ee, F + 0.54);
    for (const b of [60.0, 62.24]) caja(b, b + 0.06, 4.46, 5.55, 0.56, 0xf2f2ee);
    caja(63.2, 63.47, 2.4, 2.62, 0.02, 0xe8c030, F + 0.03);
    caja(66.0, 66.5, 2.72, 3.0, 0.02, 0x2a4ea0, F + 0.03);
    k.pic((s(66.0) + s(66.5)) / 2, 2.86, F + 0.054, 0.47, 0.24, 0, 1, canvasTex(120, 60, (g, w, h) => {
      g.fillStyle = '#2a4ea0'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#f2f2ee'; g.lineWidth = 2; g.strokeRect(3, 3, w - 6, h - 6);
      g.fillStyle = '#f2f2ee'; g.font = 'bold 14px Arial'; g.textAlign = 'center';
      g.fillText('PADRE', w / 2 + 5, 26); g.fillText('CLARET', w / 2 + 5, 44);
    }));
  });
}

/** la cara de Telésforo Bravo, del norte al sur (a): la casa de la esquina de Padre Claret y la del 28 */
function caraTelesforo(colliders) {
  const A0 = -1.2, A1 = 18.7;
  return tira(P(A0, 66.77), P(A1, 66.65), 8.6, 'frayLuisOesteTelesforo', colliders, (k, L) => {
    const s = a => (a - A0) * L / (A1 - A0);
    const caja = (a0, a1, y0, y1, sale, hex, z = F) => k.box((s(a0) + s(a1)) / 2, y0, z + sale / 2, s(a1) - s(a0), y1 - y0, sale, hex);
    const ho = (a0, a1, y0, y1, fn, borde, z = F) => hueco(k, (s(a0) + s(a1)) / 2, y0, s(a1) - s(a0), y1 - y0, tx(a1 - a0, y1 - y0, fn), { borde, z });
    // la casa de la esquina, como por Padre Claret: el zócalo con la raya gris, las franjas, las tres ventanas de
    // lamas de abajo, los dos balcones blancos de obra y la placa azul de la calle
    pared(k, 0, s(8.2), 8.6, liso('#d8b99b'), -0.25);
    caja(A0, 8.2, 0, 0.8, 0.02, 0xceae8e);
    caja(A0, 8.2, 0.78, 0.83, 0.05, 0x7d8288);
    caja(A0, 8.2, 3.68, 4.05, 0.03, 0xc49a6c);
    caja(A0, 8.2, 4.43, 4.48, 0.07, 0x7d8288);
    caja(A0, 8.2, 6.95, 7.15, 0.03, 0xc49a6c);
    caja(A0, 8.2, 8.5, 8.6, 0.06, 0xccac8c);
    for (const [a0, a1] of [[-0.3, 1.4], [3.2, 5.0], [6.0, 7.7]]) ho(a0, a1, 1.95, 3.45, lamasBlancas(2), 0xf2f2ee, F + 0.03);
    for (const [a0, a1, v0, v1] of [[-0.4, 1.6, 0.12, 1.17], [5.9, 7.8, 6.3, 7.4]]) {
      ho(v0, v1, 4.46, 6.69, vidrio('#f2f2ee'), 0xf2f2ee);
      caja(a0, a1, 3.68, 4.05, 0.5, 0xd8b99b);
      caja(a0, a1, 4.05, 4.46, 0.5, 0xc49a6c);
      caja(a0, a1, 4.46, 5.5, 0.06, 0xf2f2ee, F + 0.44);
      for (const a of [a0, a1 - 0.06]) caja(a, a + 0.06, 4.46, 5.5, 0.5, 0xf2f2ee);
    }
    ho(3.23, 4.63, 5.26, 6.69, vidrio('#f2f2ee', 2), 0xf2f2ee);
    caja(-0.85, -0.35, 3.16, 3.48, 0.02, 0x2a4ea0, F + 0.03);
    k.pic((s(-0.85) + s(-0.35)) / 2, 3.32, F + 0.054, 0.47, 0.3, 0, 1, canvasTex(120, 76, (g, w, h) => {
      g.fillStyle = '#2a4ea0'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#f2f2ee'; g.lineWidth = 2; g.strokeRect(3, 3, w - 6, h - 6);
      g.fillStyle = '#f2f2ee'; g.font = 'bold 13px Arial'; g.textAlign = 'center';
      g.fillText('CALLE', w / 2 + 5, 22); g.fillText('TELESFORO', w / 2 + 5, 42); g.fillText('BRAVO', w / 2 + 5, 60);
    }));
    // el 28: más alto, con la puerta baja y la raya gris encima, las dos plantas de ventanas y la torre de la escalera
    pared(k, s(8.2), L, 9.4, liso('#d6b496'), -0.25);
    k.box((s(8.2) + L) / 2, 8.6, -4.3, L - s(8.2), 0.8, 8.1, 0xd6b496);
    caja(8.2, A1, 2.05, 2.1, 0.06, 0x7d8288);
    caja(8.2, A1, 4.8, 5.05, 0.03, 0xc49a6c);
    caja(8.2, A1, 5.58, 5.63, 0.07, 0x7d8288);
    caja(8.2, A1, 8.0, 8.2, 0.03, 0xc49a6c);
    caja(8.2, A1, 9.3, 9.4, 0.06, 0xccac8c);
    caja(9.24, 10.09, 0.6, 1.2, 0.04, 0xeeeeea, F + 0.03);
    k.pic((s(9.24) + s(10.09)) / 2, 0.9, F + 0.074, s(10.09) - s(9.24) - 0.08, 0.5, 0, 1, tx(0.8, 0.5, lamasBlancas(1)));
    caja(11.76, 12.43, 0.35, 0.85, 0.14, 0xe4e4de, F + 0.03);
    caja(12.54, 13.56, 0, 0.12, 0.3, 0xd8d4cc, F + 0.03);
    ho(12.64, 13.46, 0.12, 2.0, puertaBlanca, 0xf2f2ee, F + 0.03);
    for (const [a0, y0, c] of [[13.63, 1.3, 0x6a7a44], [13.92, 1.3, 0xeeeeea], [13.63, 0.9, 0xe8e2c8], [13.92, 0.9, 0x6a7a44]]) caja(a0, a0 + 0.26, y0, y0 + 0.35, 0.14, c, F + 0.03);
    ho(14.16, 14.98, 0.02, 2.2, lamasBlancas(1), 0xf2f2ee, F + 0.03);
    ho(15.6, 18.2, 0.02, 2.2, garaje('#eeeeea', '#cfcfc8'), 0xeeeeea, F + 0.03);
    caja(8.8, 9.0, 2.6, 2.9, 0.02, 0xe8c030, F + 0.03);
    ho(8.37, 10.62, 3.2, 4.3, lamasBlancas(2), 0xf2f2ee);
    ho(12.22, 13.17, 3.2, 4.3, vidrio('#f2f2ee'), 0xf2f2ee);
    ho(15.58, 17.69, 3.1, 4.4, vidrio('#f2f2ee', 3), 0xf2f2ee);
    for (const [a0, a1, n] of [[8.9, 10.46, 2], [12.17, 13.18, 2], [15.7, 17.96, 3]]) ho(a0, a1, 6.3, 7.5, vidrio('#f2f2ee', n), 0xf2f2ee);
    // la torre de la escalera, encima, con su ventanita
    k.box((s(11.35) + s(13.96)) / 2, 9.4, -1.4, s(13.96) - s(11.35), 1.6, 3.0, 0xd6b496);
    k.box((s(11.35) + s(13.96)) / 2, 10.95, -1.4, s(13.96) - s(11.35) + 0.04, 0.08, 3.04, 0xccac8c);
    ho(12.17, 13.2, 9.6, 10.2, vidrio('#f2f2ee'), 0xf2f2ee, 0.104);
  });
}

/** la pared con pintadas de la casa del sur del solar (unos garabatos sin letras) */
function pintadas(g, w, h) {
  g.fillStyle = '#efeee9';
  g.fillRect(0, 0, w, h);
  const rnd = azar(13);
  g.lineWidth = 3;
  for (let i = 0; i < 14; i++) {
    g.strokeStyle = ['#2a2a2a', '#3a3a44', '#5a5a5a'][i % 3];
    const x0 = w * (0.45 + rnd() * 0.5), y0 = h * (0.72 + rnd() * 0.16);
    g.beginPath(); g.moveTo(x0, y0);
    for (let j = 0; j < 4; j++) g.quadraticCurveTo(x0 + (rnd() - 0.3) * 60, y0 - rnd() * 40, x0 + (j + 1) * 14, y0 + (rnd() - 0.5) * 20);
    g.stroke();
  }
}

/** el solar de tierra de Telésforo Bravo (el 29): la tierra (no la foto aérea), la valla de alambre, las hierbas,
 * los escombros y las paredes de alrededor */
function solarTelesforo(scene, colliders, grupos) {
  const S0 = 18.7, S1 = 35.3;
  const suelo = paveMesh(trocear(polyTris([P(S0, 50.95), P(S1, 51.2), P(S1, 66.55), P(S0, 66.65)]), 1.5), 0.16, tierraParda(), 0xd8d0c4);
  if (suelo) { suelo.name = 'frayLuisOesteSolar'; scene.add(suelo); }
  const lisa = (A, B, alto, nombre, fn) => tira(A, B, alto, nombre, colliders, (kk, L) => pared(kk, 0, L, alto, fn, -0.25));
  // la pared alta de las adosadas (al norte), la de la casa del sur con las pintadas y las de atrás
  grupos.push(lisa(P(S0 + 0.1, 66.65), P(S0 + 0.1, 58.5), 9.4, 'solarTelesforoNorte', liso('#f0efea')));
  grupos.push(lisa(P(S0 + 0.1, 58.5), P(S0 + 0.1, 51.0), 8.6, 'solarTelesforoNorteAtras', liso('#f0efea')));
  grupos.push(lisa(P(S1 - 0.12, 51.2), P(S1 - 0.12, 66.55), 6.6, 'solarTelesforoSur', pintadas));
  grupos.push(lisa(P(S0 + 0.1, 50.98), P(27.2, 50.96), 3.9, 'solarTelesforoAtras', liso('#b4ada0')));
  grupos.push(tira(P(27.2, 50.94), P(S1 - 0.12, 50.94), 10.0, 'solarTelesforoAtrasAlta', colliders, (kk, L) => {
    pared(kk, 0, L, 10.0, liso('#eeede8'), -0.25);
    kk.pic(L * 0.35, 0.55, F + 0.004, L * 0.7, 1.1, 0, 1, canvasTex(240, 40, bloquesCrudos));
  }));
  // la valla de alambre en la acera, con sus postes, y lo que hay dentro
  const k = new Kit();
  const M2 = marco(P(S0, 66.6), P(S1, 66.5));
  const L = M2.len;
  for (let s = 0.1; s < L; s += 2.4) k.cyl(s, 0, -0.1, 0.035, 0.035, 1.8, 0x4a3a30, { seg: 6 });
  for (let y = 0.15; y < 1.75; y += 0.2) k.box(L / 2, y, -0.1, L, 0.007, 0.007, 0x8a8478);
  for (let s = 0.08; s < L; s += 0.2) k.box(s, 0.05, -0.1, 0.007, 1.65, 0.007, 0x8a8478);
  const rnd = azar(21);
  for (let i = 0; i < 26; i++) {
    const s = 0.5 + rnd() * (L - 1), z = -0.8 - rnd() * 14;
    if (i % 3) k.box(s, 0, z, 0.4 + rnd() * 1.2, 0.12 + rnd() * 0.3, 0.4 + rnd() * 1.0, i % 2 ? 0x6e8a3e : 0x8a9a52);
    else k.box(s, 0, z, 0.2 + rnd() * 0.5, 0.08 + rnd() * 0.2, 0.2 + rnd() * 0.4, [0x9a948a, 0xb8b2a6, 0x6a645c][i % 3]);
  }
  const g = enMarco(k, M2, 'frayLuisOesteSolarValla', colliders);
  grupos.push(g);
  return suelo;
}

/** se monta con lo demás */
export function buildFrayLuisOeste(scene, colliders, map) {
  if (!map?.frayLuisOeste) return null;
  const k = new Kit();
  casa59(k);
  casaCancela(k);
  casa55(k);
  casaPiedra(k);
  casaGarajeVerde(k);
  casa49(k);
  casaMarron(k);
  casasVerdes(k);
  casaAzulada(k);
  casa37A(k);
  casaMetida(k);
  casa32(k);
  senalP(k);
  const grupos = [enMarco(k, M, 'frayLuisOeste', colliders)];
  // las paredes de los lados que asoman por encima de las casas bajas (las del norte de delante a atrás, las del
  // sur de atrás a delante) y la planta metida de la casa de la piedra
  const lisa = (A, B, alto, nombre, color = '#efeee9', hacer) => tira(A, B, alto, nombre, colliders, (kk, L) => {
    pared(kk, 0, L, alto, liso(color), -0.25);
    if (hacer) hacer(kk, L);
  });
  const ventanita = (kk, s, y0, y1, w = 0.6) => hueco(kk, s, y0, w, y1 - y0, canvasTex(40, 60, vidrio('#f2f2ee')), { borde: 0xf2f2ee, z: F });
  grupos.push(lisa(P(15.63, 42.2), P(15.63, 39.5), 9.1, 'casa59LadoSurAtras', '#efeee9', kk => ventanita(kk, 2.05, 5.0, 6.4)));
  grupos.push(lisa(P(15.63, 39.5), P(15.63, bF(15.63)), 8.3, 'casa59LadoSur', '#efeee9', kk => {
    // las ventanitas del lado
    ventanita(kk, 2.65, 3.2, 4.1);
    ventanita(kk, 1.95, 5.8, 6.8);
  }));
  grupos.push(lisa(P(27.3, bF(27.3)), P(27.3, 37.57), 9.0, 'casa55TorreNorte'));
  grupos.push(lisa(P(27.3, 37.57), P(27.3, 39.5), 6.6, 'casa55LadoNorte'));
  grupos.push(lisa(P(27.18, 39.45), P(27.18, 48.65), 9.3, 'casa55AtrasNorte'));
  grupos.push(lisa(P(29.92, 37.57), P(29.92, bF(29.92) + 0.3), 9.0, 'casa55TorreSur'));
  grupos.push(lisa(P(35.79, 39.5), P(35.79, bF(35.79)), 6.6, 'casa55LadoSur', '#e4e0dc'));
  grupos.push(lisa(P(35.67, 48.65), P(35.67, 39.45), 9.3, 'casa55AtrasSur', '#ece0dc'));
  grupos.push(lisa(P(95.08, bF(95.08)), P(95.08, 40.52), 6.6, 'casa37ALadoNorte'));
  grupos.push(lisa(P(103.85, 36.12), P(103.85, bF(103.85)), 6.6, 'casa37ALadoSur'));
  grupos.push(lisa(P(110.95, 36.12), P(103.85, 36.12), 6.6, 'casaMetidaArriba', '#f0efe9', (kk, L) => {
    hueco(kk, L - (105.16 - 103.85), 4.4, 1.6, 1.2, canvasTex(96, 72, vidrio('#6a4430')), { borde: 0x4e3122, z: F });
  }));
  grupos.push(lisa(P(110.95, bF(110.95)), P(110.95, 37.54), 9.3, 'casa32TorreNorte', '#ece2cc'));
  grupos.push(lisa(P(114.14, 37.54), P(114.14, bF(114.14) + 0.3), 9.3, 'casa32TorreSur', '#ece2cc'));
  grupos.push(lisa(P(AS, 38.6), P(AS, bF(AS)), 6.8, 'casa32LadoSur', '#ece2cc', (kk, L) => {
    // el balcón de madera oscura del primer piso, en la esquina
    kk.box(L - 1.3, 3.3, F + 0.4, 2.2, 0.15, 0.8, 0xeeeeea);
    for (let s = L - 2.35; s <= L - 0.2; s += 0.14) kk.box(s, 3.45, F + 0.76, 0.05, 0.9, 0.05, 0x3a2a20);
    kk.box(L - 1.3, 4.33, F + 0.76, 2.2, 0.08, 0.08, 0x3a2a20);
    hueco(kk, L - 1.3, 3.45, 1.0, 2.1, canvasTex(60, 126, vidrio('#3a2a20')), { borde: 0x3a2a20, z: F });
  }));
  grupos.push(lisa(P(AS - 0.04, 49.03), P(AS - 0.04, 38.6), 9.3, 'casa32AtrasSur', '#ece2cc'));
  grupos.push(caraPadreClaret(colliders));
  grupos.push(caraTelesforo(colliders));
  const suelo = solarTelesforo(scene, colliders, grupos);
  for (const g of grupos) scene.add(g);
  // las palmeras al azar que caigan dentro de las casas
  const dentro = (px, pz) => {
    const dx = px - C[0], dz = pz - C[1], a = dx * US[0] + dz * US[1], b = -(dx * E[0] + dz * E[1]);
    return a > AN - 0.3 && a < AS + 0.3 && b > bF(a) - 0.4 && b < 67;
  };
  const palmas = sinPalmasDentro(scene, dentro);
  return { grupos, palmas, suelo };
}
