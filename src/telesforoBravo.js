import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco, trocear, sueloTex } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';
import { paveMesh, polyTris } from './suelos.js';
import { pared, tira } from './rapadurasSur.js';
import { tuneFrayLuisOeste } from './frayLuisOeste.js';

/**
 * La calle Telésforo Bravo (Altavista), la acera del este, por detrás de las casas de Fray Luis de León, al sur del
 * solar del 29, con las vistas de la calle de Google de julio de 2025 (Telésforo Bravo 27, 25 y 20; solo se miran, no
 * van dentro del juego) y el plano del Catastro. Las casas ya las pone frayLuisOeste.js con su altura; aquí van las
 * caras que dan a esta calle:
 * - el 25: la casa crema de dos plantas con la torre de la escalera, el zócalo de granito rosado, las dos persianas
 *   marrones de abajo, la puerta con su montante, la franja blanca con los cuatro respiraderos redondos y los dos
 *   balcones de madera oscura sobre sus losas molduradas;
 * - el patio de grava de al lado, abierto a la calle, con los dos garajes del fondo (de bloques sin enfoscar, con el
 *   portón de chapa marrón, el de madera granate y los tejadillos de uralita) y las paredes blancas de alrededor;
 * - el 20: la casa blanca terrera del zócalo gris, la puerta de cuarterones, las ventanas marrones y el buzón negro;
 * - el 18: la casa blanca de dos plantas del zócalo gris azulado, los dos portones de tablas marrones, la puerta verde
 *   de cuadraditos con su buzón y las ventanas negras de arriba;
 * - el 16 (y 16A): la plaqueta beis de abajo con las dos puertas verdes, la ventana de barrotes y la de marco verde, y
 *   arriba el cuarto acristalado de madera con su alero de vigas;
 * - el 14: el zócalo de piedra marrón, la ventana, el buzón, el garaje blanco, la puerta blanca con su escalón y, al
 *   lado, la parte baja con la ventanita y la puerta lisa;
 * - el 12 y la casa metida de al lado: blancas y terreras, con el zócalo de placas grises, la puerta y la ventana
 *   verdes y la placa vieja de la calle Crucero Baleares;
 * - el solar vallado de la esquina de Crucero Baleares: la tierra, la valla de alambre, la fila de piedras grandes, las
 *   hierbas, el cuarto de bloques del fondo y las paredes de alrededor (la de la casa del sur con su barandilla);
 * - el 9: el mármol de vetas de abajo con el garaje blanco de cuarterones, la ventana alargada y la puerta de cristal,
 *   el balcón grande de balaustres y la torre del sur;
 * - el 7, hasta la esquina de Guillermo Topham: blanco abajo con la ventana de lamas y la ventanita, y arriba color
 *   melocotón con los dos balcones de madera blanca y sus puertas de lamas.
 */

// el marco de Fray Luis de León: a hacia el sur desde la esquina de Padre Claret, b hacia el oeste
const C = [378.37 + 0.166579 * 1.9, -1299.89 - 0.98603 * 1.9];
const US = [-0.166579, 0.98603], E = [0.98605, 0.166412];
const P = (a, b = 0) => [C[0] + US[0] * a - E[0] * b, C[1] + US[1] * a - E[1] * b];
const F = 0.054;

/** antes de levantar la ciudad: los garajes del patio son bajos (2,6 m), el 18 y el 16 tienen 7,2 m, y el 14, 4,6 m con
 * la parte baja de al lado aparte (3,1 m) */
export function tuneTelesforoBravo(map) {
  if (!Array.isArray(map?.buildings)) return;
  if (!map.frayLuisOeste) tuneFrayLuisOeste(map);
  if (!map.frayLuisOeste) return;
  const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const G = P(51.42, 64.52), G2 = P(48.18, 58.75);
  const g = map.buildings.find(q => q.edificioReal && Array.isArray(q.p) && q.p.some(p => d(p, G) < 0.1) && q.p.some(p => d(p, G2) < 0.1));
  if (g) g.h = 2.6;
  const H = P(68.86, 66.36), H2 = P(63.66, 66.39);
  const h18 = map.buildings.find(q => q.edificioReal && Array.isArray(q.p) && q.p.some(p => d(p, H) < 0.1) && q.p.some(p => d(p, H2) < 0.1));
  if (h18) h18.h = 7.2;
  const I = P(68.79, 66.36), I2 = P(77.02, 66.31), J = P(85.58, 66.26);
  const h16 = map.buildings.find(q => q.edificioReal && Array.isArray(q.p) && q.p.some(p => d(p, I) < 0.1) && q.p.some(p => d(p, I2) < 0.1));
  if (h16) h16.h = 7.2;
  const h14 = map.buildings.find(q => q.edificioReal && Array.isArray(q.p) && q.p.some(p => d(p, J) < 0.1) && q.p.some(p => d(p, I2) < 0.1));
  if (h14) {
    // (al revés, para que den la vuelta como los bloques del mapa)
    const r = q => [+q[0].toFixed(2), +q[1].toFixed(2)];
    const poli = ab => { const p = ab.map(q => r(P(q[0], q[1]))).reverse(); p.push(p[0].slice()); return p; };
    h14.p = poli([[85.6, 66.26], [77.02, 66.31], [76.94, 60.61], [85.61, 60.42]]);
    h14.h = 4.6;
    const baja = [[87.65, 58.51], [87.75, 59.08], [87.67, 62.55], [87.76, 65.79], [87.72, 66.25], [85.6, 66.26], [85.61, 60.42], [85.63, 58.54]];
    map.buildings.push({ ...h14, p: poli(baja), h: 3.1 });
  }
  // el cuartito del Catastro de la esquina de Crucero Baleares ya no está: es el solar
  const S = P(98.69, 66.18), S2 = P(94.76, 61.15);
  const cuarto = map.buildings.find(q => q.edificioReal && Array.isArray(q.p) && q.p.some(p => d(p, S) < 0.1) && q.p.some(p => d(p, S2) < 0.1));
  if (cuarto) cuarto.skip = true;
  map.telesforoBravo = true;
}

// ——— las texturas ———

const liso = color => (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); };
const tx = (w, h, fn) => canvasTex(Math.max(16, Math.min(1024, Math.round(w * 60))), Math.max(16, Math.round(h * 60)), fn);
const azar = semilla => { let s = semilla; return () => (s = (s * 16807) % 2147483647) / 2147483647; };

/** el granito rosado del zócalo, salpicado */
function granitoRosa(g, w, h) {
  g.fillStyle = '#b6a8a2';
  g.fillRect(0, 0, w, h);
  const rnd = azar(17);
  for (let i = 0; i < w * h / 5; i++) {
    g.fillStyle = ['rgba(60,50,50,.35)', 'rgba(240,236,232,.4)', 'rgba(150,110,104,.35)'][i % 3];
    g.fillRect(rnd() * w, rnd() * h, 1.4, 1.4);
  }
  g.fillStyle = 'rgba(255,255,255,.5)';
  g.fillRect(0, 0, w, 2);
}

/** una persiana enrollable marrón, bajada */
function persianaMarron(g, w, h) {
  g.fillStyle = '#7a5a48';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#5a3e30';
  g.lineWidth = 1.5;
  for (let y = 4; y < h; y += 5) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.fillStyle = '#5a3e30';
  g.fillRect(w / 2 - 3, 0, 6, h);
}

/** la puerta abierta, oscura por dentro, con el montante de cristal arriba */
function puertaAbierta(g, w, h) {
  g.fillStyle = '#5a3a28';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#4a4440';
  g.fillRect(w * 0.08, h * 0.04, w * 0.84, h * 0.13);
  g.fillStyle = '#231e1a';
  g.fillRect(w * 0.08, h * 0.2, w * 0.84, h * 0.8);
  g.fillStyle = '#3a2a20';
  g.fillRect(w * 0.08, h * 0.2, w * 0.18, h * 0.8);
}

/** los bloques de cemento sin enfoscar (40 × 20 cm) */
function bloques(g, w, h) {
  g.fillStyle = '#8e8a82';
  g.fillRect(0, 0, w, h);
  const rnd = azar(23);
  for (let y = h, f = 0; y > -12; y -= 12, f++) {
    for (let xx = -(f % 2) * 12; xx < w; xx += 24) {
      const t = 150 + Math.floor(rnd() * 28);
      g.fillStyle = `rgb(${t},${t - 4},${t - 12})`;
      g.fillRect(xx + 1, y - 11, 22, 10);
    }
  }
}

/** el portón de chapa ondulada marrón */
function chapaMarron(g, w, h) {
  g.fillStyle = '#5e4438';
  g.fillRect(0, 0, w, h);
  for (let xx = 0; xx < w; xx += 6) {
    g.fillStyle = 'rgba(255,220,200,.08)';
    g.fillRect(xx, 0, 2, h);
    g.fillStyle = 'rgba(0,0,0,.18)';
    g.fillRect(xx + 3, 0, 2, h);
  }
}

/** las dos hojas de madera granate con cuarterones */
function maderaGranate(g, w, h) {
  g.fillStyle = '#7a2e2a';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#561e1c';
  g.lineWidth = 3;
  for (let i = 0; i < 2; i++) for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
    g.strokeRect(w * (i * 0.5 + 0.04 + c * 0.22), h * (0.05 + r * 0.31), w * 0.19, h * 0.27);
  }
  g.fillStyle = '#3e1614';
  g.fillRect(w / 2 - 2, 0, 4, h);
}

/** la uralita ondulada del canto de los tejadillos */
function uralita(g, w, h) {
  g.fillStyle = '#d8d2c4';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#b4ac9c';
  for (let xx = 0; xx < w; xx += 8) { g.beginPath(); g.arc(xx + 4, h, 4, Math.PI, 0); g.fill(); }
}

/** la grava gris del patio */
function gravaGris() {
  return sueloTex(256, 3, (g, r, n) => {
    g.fillStyle = '#8e8c88';
    g.fillRect(0, 0, n, n);
    for (let i = 0; i < 4600; i++) {
      const v = 90 + r() * 100;
      g.fillStyle = `rgb(${Math.round(v)},${Math.round(v - 2)},${Math.round(v - 6)})`;
      g.fillRect(r() * n, r() * n, 1 + r() * 2.2, 1 + r() * 2.2);
    }
  });
}

const vidrio = (carp, hojas = 2) => cristales(carp, hojas, 'rgba(50,52,56,.55)');

// ——— las piezas ———

/** el 25: la casa crema, del norte al sur */
function casa25(colliders) {
  const A0 = 35.3, A1 = 44.3;
  return tira(P(A0, 66.55), P(A1, 66.5), 6.6, 'telesforo25', colliders, (k, L) => {
    const s = a => (a - A0) * L / (A1 - A0);
    const caja = (a0, a1, y0, y1, sale, hex, z = F) => k.box((s(a0) + s(a1)) / 2, y0, z + sale / 2, s(a1) - s(a0), y1 - y0, sale, hex);
    const ho = (a0, a1, y0, y1, fn, borde, z = F) => hueco(k, (s(a0) + s(a1)) / 2, y0, s(a1) - s(a0), y1 - y0, tx(a1 - a0, y1 - y0, fn), { borde, z });
    const crema = liso('#efe5d0');
    pared(k, 0, s(38.46), 6.6, crema, -0.25);
    pared(k, s(38.46), s(40.96), 9.3, crema, -0.25);
    pared(k, s(40.96), L, 6.6, crema, -0.25);
    caja(A0, A1, 0, 1.05, 0.04, 0xb6a8a2);
    k.pic(L / 2, 0.525, F + 0.044, L, 1.05, 0, 1, tx(A1 - A0, 1.05, granitoRosa));
    // la franja blanca con los respiraderos redondos
    caja(A0, A1, 3.3, 3.55, 0.06, 0xf6f4ee);
    for (let i = 0; i < 4; i++) k.cyl(s(43.3 + i * 0.2), 3.43, F + 0.06, 0.07, 0.07, 0.01, 0x8a8680, { seg: 12, rx: Math.PI / 2 });
    // las dos persianas marrones de abajo y la puerta abierta con su montante
    ho(36.3, 37.9, 1.05, 3.25, persianaMarron, 0x5a3e30, F + 0.04);
    ho(40.2, 43.4, 1.05, 3.25, persianaMarron, 0x5a3e30, F + 0.04);
    ho(38.5, 39.6, 0.02, 3.25, puertaAbierta, 0x4a3020, F + 0.04);
    caja(36.1, 37.7, 0.05, 0.95, 0.14, 0xeeeeea, F + 0.04);
    caja(42.2, 43.9, 0.3, 1.0, 0.14, 0xeeeeea, F + 0.04);
    // los dos balcones de madera oscura, sobre su losa moldurada, con la puerta de cristales detrás
    for (const [a0, a1] of [[36.2, 38.4], [40.3, 43.4]]) {
      ho(a0 + 0.25, a1 - 0.25, 4.1, 6.3, vidrio('#5a3a2a', 2), 0x5a3a2a);
      caja(a0 - 0.15, a1 + 0.15, 3.6, 3.85, 0.65, 0xf2efe8);
      caja(a0 - 0.05, a1 + 0.05, 3.85, 4.1, 0.6, 0xe8e2d6);
      for (let a = a0 + 0.05; a < a1; a += 0.13) caja(a, a + 0.05, 4.1, 5.2, 0.05, 0x3e2a20, F + 0.52);
      caja(a0, a1, 5.15, 5.25, 0.08, 0x3e2a20, F + 0.5);
      for (const a of [a0, a1 - 0.05]) for (let z = 0.08; z < 0.55; z += 0.13) caja(a, a + 0.05, 4.1, 5.2, 0.05, 0x3e2a20, F + z);
    }
    caja(A0, 38.46, 6.5, 6.6, 0.08, 0xe2d8c2);
    caja(40.96, A1, 6.5, 6.6, 0.08, 0xe2d8c2);
    caja(38.46, 40.96, 9.2, 9.3, 0.08, 0xe2d8c2);
  });
}

/** el patio de grava con los dos garajes del fondo y las paredes de alrededor */
function patio(scene, colliders, grupos) {
  const suelo = paveMesh(trocear(polyTris([P(44.45, 51.3), P(54.38, 51.3), P(54.38, 66.44), P(44.45, 66.5)]), 1.5), 0.15, gravaGris(), 0xffffff);
  if (suelo) { suelo.name = 'telesforoPatio'; scene.add(suelo); }
  const lisa = (A, B, alto, nombre, fn) => tira(A, B, alto, nombre, colliders, (kk, L) => pared(kk, 0, L, alto, fn, -0.25));
  const blanca = liso('#f0efea');
  grupos.push(lisa(P(44.45, 66.5), P(44.45, 51.3), 6.6, 'telesforo25Sur', blanca));
  grupos.push(lisa(P(44.45, 51.32), P(48.2, 51.34), 3.9, 'telesforoPatioFondo', liso('#e4e2dc')));
  grupos.push(lisa(P(54.38, 60.95), P(54.38, 66.44), 3.9, 'telesforo20Norte', blanca));
  grupos.push(lisa(P(54.3, 54.2), P(54.3, 60.95), 6.6, 'telesforo20NorteAlta', blanca));
  grupos.push(lisa(P(48.18, 58.75), P(48.18, 64.37), 2.6, 'telesforoGarajeLado', bloques));
  // la fachada de los dos garajes, del norte al sur
  grupos.push(tira(P(48.18, 64.45), P(54.38, 64.5), 2.6, 'telesforoGarajes', colliders, (k, L) => {
    const s = a => (a - 48.18) * L / (54.38 - 48.18);
    pared(k, 0, L, 2.6, bloques, -0.25);
    hueco(k, (s(48.6) + s(50.8)) / 2, 0.02, s(50.8) - s(48.6), 2.15, tx(2.2, 2.15, chapaMarron), { borde: 0x4a3428, z: F });
    hueco(k, (s(50.95) + s(53.5)) / 2, 0.02, s(53.5) - s(50.95), 2.2, tx(2.55, 2.2, maderaGranate), { borde: 0xd8d4cc, z: F });
    k.box((s(53.55) + L) / 2, 0, F + 0.01, L - s(53.55), 2.6, 0.02, 0xe8e6e0);
    // los tejadillos de uralita, que vuelan un poco
    k.box(L / 2, 2.55, F - 0.4, L + 0.1, 0.06, 1.3, 0xd8d2c4);
    k.pic(L / 2, 2.58, F + 0.256, L + 0.1, 0.12, 0, 1, canvasTex(512, 16, uralita));
  }));
  return suelo;
}

/** la puerta de madera marrón de cuarterones del 20 */
function puertaCuarterones(g, w, h) {
  g.fillStyle = '#5e3a26';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#33200f';
  g.lineWidth = 3;
  for (let r = 0; r < 4; r++) g.strokeRect(w * 0.14, h * (0.04 + r * 0.24), w * 0.72, h * 0.2);
  g.fillStyle = '#b8a070';
  g.fillRect(w * 0.8, h * 0.5, w * 0.06, h * 0.02);
}

/** los portones de tablas marrones del 18, de arriba abajo */
function tablasMarrones(g, w, h) {
  g.fillStyle = '#6e4c3a';
  g.fillRect(0, 0, w, h);
  for (let xx = 0; xx < w; xx += 9) {
    g.fillStyle = 'rgba(0,0,0,.35)';
    g.fillRect(xx, 0, 1.5, h);
    g.fillStyle = 'rgba(255,220,190,.06)';
    g.fillRect(xx + 3, 0, 3, h);
  }
  g.fillStyle = '#2e1e16';
  g.fillRect(w / 2 - 1.5, 0, 3, h);
}

/** la puerta verde de cuadraditos del 18 */
function puertaVerdeCuadros(g, w, h) {
  g.fillStyle = '#1f7a48';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#145a34';
  g.lineWidth = 2.5;
  for (let r = 0; r < 7; r++) for (let c = 0; c < 2; c++) g.strokeRect(w * (0.12 + c * 0.4), h * (0.03 + r * 0.137), w * 0.34, h * 0.11);
}

/** el 20: la casa blanca terrera, del norte al sur */
function casa20(colliders) {
  const A0 = 54.43, A1 = 60.83;
  return tira(P(A0, 66.44), P(A1, 66.4), 3.9, 'telesforo20', colliders, (k, L) => {
    const s = a => (a - A0) * L / (A1 - A0);
    const caja = (a0, a1, y0, y1, sale, hex, z = F) => k.box((s(a0) + s(a1)) / 2, y0, z + sale / 2, s(a1) - s(a0), y1 - y0, sale, hex);
    const ho = (a0, a1, y0, y1, fn, borde, z = F) => hueco(k, (s(a0) + s(a1)) / 2, y0, s(a1) - s(a0), y1 - y0, tx(a1 - a0, y1 - y0, fn), { borde, z });
    pared(k, 0, L, 3.9, liso('#f0efea'), -0.25);
    caja(A0, A1, 0, 0.95, 0.04, 0x7a7e84);
    caja(A0, A1, 3.25, 3.35, 0.1, 0xe8e6e0);
    caja(A0, A1, 3.8, 3.9, 0.06, 0xe4e2dc);
    for (const [a0, a1] of [[54.8, 55.6], [56.4, 57.14], [59.6, 60.4]]) ho(a0, a1, 1.07, 2.1, vidrio('#4a2e22', 2), 0x4a2e22, F + 0.04);
    ho(55.62, 56.38, 0.02, 2.1, puertaCuarterones, 0x3e2618, F + 0.04);
    caja(54.93, 55.43, 0.3, 0.75, 0.12, 0xeeeeea, F + 0.04);
    caja(56.85, 57.37, 0.3, 0.75, 0.12, 0xeeeeea, F + 0.04);
    caja(57.45, 57.9, 1.55, 1.95, 0.16, 0x1e1e1e, F + 0.04);
  });
}

/** el 18: la casa blanca de dos plantas de los dos portones de madera, del norte al sur */
function casa18(colliders) {
  const A0 = 60.83, A1 = 68.8;
  return tira(P(A0, 66.4), P(A1, 66.36), 7.2, 'telesforo18', colliders, (k, L) => {
    const s = a => (a - A0) * L / (A1 - A0);
    const caja = (a0, a1, y0, y1, sale, hex, z = F) => k.box((s(a0) + s(a1)) / 2, y0, z + sale / 2, s(a1) - s(a0), y1 - y0, sale, hex);
    const ho = (a0, a1, y0, y1, fn, borde, z = F) => hueco(k, (s(a0) + s(a1)) / 2, y0, s(a1) - s(a0), y1 - y0, tx(a1 - a0, y1 - y0, fn), { borde, z });
    pared(k, 0, L, 7.2, liso('#f2f1ec'), -0.25);
    caja(A0, A1, 0, 1.25, 0.04, 0x6e7e8a);
    caja(A0, A1, 3.2, 3.35, 0.12, 0xe8e6e0);
    caja(A0, A1, 7.1, 7.2, 0.06, 0xe4e2dc);
    ho(62.12, 64.68, 0.02, 2.4, tablasMarrones, 0xf2f1ec, F + 0.05);
    ho(65.86, 68.6, 0.02, 2.35, tablasMarrones, 0xf2f1ec, F + 0.05);
    ho(65.05, 65.69, 0.02, 2.38, puertaVerdeCuadros, 0x1a6a3c, F + 0.05);
    caja(64.74, 65.0, 1.6, 2.08, 0.12, 0x2a6a40, F + 0.05);
    for (const [a0, a1] of [[62.1, 64.5], [66.4, 68.5]]) ho(a0, a1, 5.3, 6.75, vidrio('#1e1e1e', 2), 0x1e1e1e);
  });
}

/** la plaqueta beis de abajo del 16, en placas grandes */
function plaquetaBeis(g, w, h) {
  g.fillStyle = '#cbb6a0';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(150,130,110,.55)';
  g.lineWidth = 1.5;
  for (let y = h; y > 0; y -= 18) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  for (let xx = 0; xx < w; xx += 24) { g.beginPath(); g.moveTo(xx, 0); g.lineTo(xx, h); g.stroke(); }
}

/** la puerta verde ancha del 16, con los cristalitos del lado */
function puertaVerdeAncha(g, w, h) {
  g.fillStyle = '#1f8a44';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#167034';
  g.lineWidth = 1.5;
  for (let y = 8; y < h; y += 8) { g.beginPath(); g.moveTo(w * 0.2, y); g.lineTo(w, y); g.stroke(); }
  g.fillStyle = '#a8b4b0';
  for (let i = 0; i < 3; i++) g.fillRect(w * 0.07, h * (0.08 + i * 0.3), w * 0.06, h * 0.22);
  g.fillStyle = '#14301e';
  g.fillRect(w * 0.42, h * 0.48, w * 0.2, h * 0.015);
}

/** la puerta verde lisa del 16A */
function puertaVerdeLisa(g, w, h) {
  g.fillStyle = '#1f8a44';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#167034';
  g.lineWidth = 2;
  g.strokeRect(4, 4, w - 8, h - 8);
}

/** la ventana de los barrotes verdes, oscura por dentro */
function ventanaBarrotes(g, w, h) {
  g.fillStyle = '#2a2e30';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#1e5a36';
  for (let xx = 6; xx < w; xx += 14) g.fillRect(xx, 0, 4, h);
}

/** el 16: abajo la plaqueta beis, en medio blanco y arriba el cuarto acristalado de madera con su alero */
function casa16(colliders) {
  const A0 = 68.8, A1 = 77.02;
  return tira(P(A0, 66.36), P(A1, 66.31), 7.2, 'telesforo16', colliders, (k, L) => {
    const s = a => (a - A0) * L / (A1 - A0);
    const caja = (a0, a1, y0, y1, sale, hex, z = F) => k.box((s(a0) + s(a1)) / 2, y0, z + sale / 2, s(a1) - s(a0), y1 - y0, sale, hex);
    const ho = (a0, a1, y0, y1, fn, borde, z = F) => hueco(k, (s(a0) + s(a1)) / 2, y0, s(a1) - s(a0), y1 - y0, tx(a1 - a0, y1 - y0, fn), { borde, z });
    pared(k, 0, L, 5.4, liso('#f2f1ec'), -0.25);
    caja(A0, A1, 0, 3.1, 0.03, 0xcbb6a0);
    k.pic(L / 2, 1.55, F + 0.034, L, 3.1, 0, 1, tx(A1 - A0, 3.1, plaquetaBeis));
    ho(69.54, 70.25, 0.02, 2.75, puertaVerdeLisa, 0xf2f1ec, F + 0.05);
    ho(70.76, 71.61, 1.55, 2.75, ventanaBarrotes, 0xf2f1ec, F + 0.05);
    ho(72.74, 74.37, 1.3, 2.55, vidrio('#1f8a44', 3), 0xf2f1ec, F + 0.05);
    ho(74.67, 76.03, 0.02, 2.65, puertaVerdeAncha, 0x1a7a3a, F + 0.05);
    caja(72.0, 72.47, 0.5, 0.9, 0.12, 0xeeeeea, F + 0.05);
    caja(76.03, 76.88, 1.25, 1.9, 0.14, 0xeeeeea, F + 0.05);
    for (const a of [76.1, 76.42]) caja(a, a + 0.26, 1.95, 2.3, 0.14, 0x2a7a40, F + 0.05);
    // la losa blanca de arriba y el cuarto acristalado con las ventanas de madera y el alero de vigas
    caja(A0, A1, 5.25, 5.4, 0.25, 0xeeede8);
    k.box(L / 2, 5.4, -0.15, L, 1.3, 0.3, 0xf2f1ec);
    hueco(k, (s(70.9) + s(76.3)) / 2, 5.45, s(76.3) - s(70.9), 1.1, tx(5.4, 1.1, cristales('#a8784a', 8, 'rgba(40,44,48,.6)')), { borde: 0x8a5a36, z: 0.0 });
    k.box(L / 2, 6.7, 0.15, L + 0.1, 0.12, 0.9, 0x7a5236);
    for (let x0 = 0.3; x0 < L; x0 += 0.6) k.box(x0, 6.6, 0.3, 0.08, 0.1, 0.7, 0x5e3e28);
  });
}

/** el 14: la casa blanca del zócalo de piedra marrón, el garaje blanco, la puerta y la parte baja de al lado */
function casa14(colliders) {
  const A0 = 77.02, A1 = 87.72;
  return tira(P(A0, 66.31), P(A1, 66.25), 4.6, 'telesforo14', colliders, (k, L) => {
    const s = a => (a - A0) * L / (A1 - A0);
    const caja = (a0, a1, y0, y1, sale, hex, z = F) => k.box((s(a0) + s(a1)) / 2, y0, z + sale / 2, s(a1) - s(a0), y1 - y0, sale, hex);
    const ho = (a0, a1, y0, y1, fn, borde, z = F) => hueco(k, (s(a0) + s(a1)) / 2, y0, s(a1) - s(a0), y1 - y0, tx(a1 - a0, y1 - y0, fn), { borde, z });
    pared(k, 0, s(85.48), 4.6, liso('#f2f1ec'), -0.25);
    pared(k, s(85.48), L, 3.1, liso('#f0efea'), -0.25);
    for (const [a0, a1] of [[A0, 81.1], [83.85, 84.5], [85.25, 85.48]]) {
      caja(a0, a1, 0, 1.25, 0.03, 0x8a6a52);
      k.pic((s(a0) + s(a1)) / 2, 0.625, F + 0.034, s(a1) - s(a0), 1.25, 0, 1, tx(a1 - a0, 1.25, lajaMarron));
    }
    ho(77.65, 78.85, 1.15, 2.15, vidrio('#f2f2ee', 2), 0xf2f2ee, F + 0.03);
    caja(80.0, 80.56, 1.7, 2.1, 0.16, 0xeeeeea, F + 0.03);
    ho(81.1, 83.85, 0.02, 2.45, garaje('#eeeeea', '#cfcfc8'), 0xeeeeea, F + 0.03);
    caja(84.4, 85.35, 0, 0.35, 0.3, 0x8a6a52, F + 0.03);
    ho(84.5, 85.25, 0.35, 2.4, puertaBlancaArco, 0xf2f2ee, F + 0.03);
    k.cyl(s(85.5), 0, F + 0.08, 0.05, 0.05, 4.4, 0x9a9a98, { seg: 8 });
    ho(85.65, 86.42, 1.0, 2.1, vidrio('#f2f2ee', 1), 0xf2f2ee, F + 0.03);
    ho(86.45, 87.49, 0.02, 2.2, liso('#f4f4f0'), 0xe8e8e4, F + 0.03);
    caja(A0, 85.48, 4.5, 4.6, 0.06, 0xe4e2dc);
    caja(85.48, A1, 3.0, 3.1, 0.06, 0xe4e2dc);
    // el cuarto de arriba, metido, con su rejilla
    k.box((s(79.5) + s(85.3)) / 2, 4.6, -1.3, s(85.3) - s(79.5), 0.7, 2.0, 0xf0efea);
    k.box((s(83.1) + s(84.2)) / 2, 4.9, -0.29, s(84.2) - s(83.1), 0.12, 0.02, 0x9a9690);
  });
}

/** la piedra marrón en lajas del zócalo del 14 */
function lajaMarron(g, w, h) {
  g.fillStyle = '#e4ddd0';
  g.fillRect(0, 0, w, h);
  const rnd = azar(31);
  const cs = ['#7a5038', '#8e6448', '#6a4a36', '#9a7656', '#5e4030', '#a88466'];
  const dx = 26, dy = 20, nx = Math.ceil(w / dx) + 2, ny = Math.ceil(h / dy) + 2, q = [];
  for (let j = 0; j < ny; j++) { q[j] = []; for (let i = 0; i < nx; i++) q[j][i] = [i * dx + (rnd() - 0.5) * dx * 0.7, j * dy + (rnd() - 0.5) * dy * 0.7]; }
  g.strokeStyle = '#e8e2d6';
  g.lineWidth = 2.5;
  for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    g.fillStyle = cs[Math.floor(rnd() * cs.length)];
    g.beginPath();
    g.moveTo(...q[j][i]); g.lineTo(...q[j][i + 1]); g.lineTo(...q[j + 1][i + 1]); g.lineTo(...q[j + 1][i]);
    g.closePath(); g.fill(); g.stroke();
  }
}

/** la puerta blanca con el cuarterón de arriba en arco del 14 */
function puertaBlancaArco(g, w, h) {
  g.fillStyle = '#f4f4f0';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c8c8c2';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(w * 0.18, h * 0.45); g.lineTo(w * 0.18, h * 0.14); g.quadraticCurveTo(w * 0.5, h * 0.03, w * 0.82, h * 0.14); g.lineTo(w * 0.82, h * 0.45);
  g.closePath(); g.stroke();
  g.strokeRect(w * 0.18, h * 0.52, w * 0.64, h * 0.42);
  g.fillStyle = '#5a5a56';
  g.beginPath(); g.arc(w * 0.5, h * 0.5, w * 0.05, 0, Math.PI * 2); g.fill();
}

/** el garaje de chapa blanca de paneles */
const garaje = (fondo, raya) => (g, w, h) => {
  g.fillStyle = fondo;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = raya;
  g.lineWidth = 2;
  for (let y = h / 6; y < h; y += h / 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.fillStyle = 'rgba(0,0,0,.45)';
  g.fillRect(w * 0.48, h * 0.22, 6, 4);
};

/** las placas grises del zócalo del 12 */
function placasGrises(g, w, h) {
  g.fillStyle = '#b8bcbc';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(120,124,124,.6)';
  g.lineWidth = 1.5;
  for (let y = h; y > 0; y -= 20) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  for (let xx = 0; xx < w; xx += 30) { g.beginPath(); g.moveTo(xx, 0); g.lineTo(xx, h); g.stroke(); }
}

/** el mármol beis de vetas marrones del 9, en placas grandes */
function marmol(g, w, h) {
  g.fillStyle = '#cdbcac';
  g.fillRect(0, 0, w, h);
  const rnd = azar(41);
  g.lineWidth = 2;
  for (let i = 0; i < w * h / 900; i++) {
    g.strokeStyle = rnd() < 0.5 ? 'rgba(110,80,60,.35)' : 'rgba(150,120,96,.3)';
    const x0 = rnd() * w, y0 = rnd() * h;
    g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + 20, y0 - 8 - rnd() * 10, x0 + 40 + rnd() * 30, y0 - 20 - rnd() * 20); g.stroke();
  }
  g.strokeStyle = 'rgba(255,255,255,.45)';
  g.lineWidth = 1;
  for (let y = h; y > 0; y -= 26) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  for (let xx = 0; xx < w; xx += 36) { g.beginPath(); g.moveTo(xx, 0); g.lineTo(xx, h); g.stroke(); }
}

/** el garaje blanco de cuarterones con las dos ventanitas del 9 */
function garajeCuarterones(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c8c8c2';
  g.lineWidth = 2;
  for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) g.strokeRect(w * (0.04 + c * 0.24), h * (0.04 + r * 0.19), w * 0.2, h * 0.15);
  g.fillStyle = '#3a3a38';
  g.fillRect(w * 0.3, h * 0.06, w * 0.14, h * 0.08);
  g.fillRect(w * 0.56, h * 0.06, w * 0.14, h * 0.08);
}

/** las casas blancas bajas del 12 y la de al lado (metida), del norte al sur */
function casa12(colliders) {
  return tira(P(87.76, 66.29), P(94.74, 66.29), 4.1, 'telesforo12', colliders, (k, L) => {
    const s = a => (a - 87.76) * L / (94.74 - 87.76);
    const caja = (a0, a1, y0, y1, sale, hex, z = F) => k.box((s(a0) + s(a1)) / 2, y0, z + sale / 2, s(a1) - s(a0), y1 - y0, sale, hex);
    const ho = (a0, a1, y0, y1, fn, borde, z = F) => hueco(k, (s(a0) + s(a1)) / 2, y0, s(a1) - s(a0), y1 - y0, tx(a1 - a0, y1 - y0, fn), { borde, z });
    pared(k, 0, L, 4.1, liso('#f2f1ec'), -0.25);
    caja(87.76, 90.69, 0, 1.1, 0.03, 0x8e9296);
    caja(90.69, 94.74, 0, 1.1, 0.03, 0xb8bcbc);
    k.pic((s(90.69) + L) / 2, 0.55, F + 0.034, L - s(90.69), 1.1, 0, 1, tx(4.05, 1.1, placasGrises));
    ho(88.0, 88.9, 0.02, 2.3, puertaVerdeLisa, 0xf2f1ec, F + 0.03);
    ho(92.2, 93.3, 1.2, 2.4, lamas('#2e8a48', '#1e6a32'), 0x2a7a3e, F + 0.03);
    caja(91.95, 93.55, 2.6, 2.75, 0.06, 0xece8e0);
    caja(87.76, 94.74, 4.0, 4.1, 0.06, 0xe4e2dc);
    // la placa vieja de la calle Crucero Baleares, en la esquina del solar
    caja(94.1, 94.62, 2.3, 2.62, 0.02, 0xece4d2, F + 0.03);
    k.pic((s(94.1) + s(94.62)) / 2, 2.46, F + 0.054, s(94.62) - s(94.1) - 0.02, 0.3, 0, 1, canvasTex(104, 60, (g, w, h) => {
      g.fillStyle = '#ece4d2'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#3a3430'; g.font = 'bold 9px Arial'; g.textAlign = 'center';
      g.fillText('CALLE', w / 2, 22); g.fillText('CRUCERO BALEARES', w / 2, 40);
    }));
  });
}

/** la valla de alambre con sus postes, las piedras grandes y las hierbas del solar de la esquina de Crucero Baleares */
function solarBaleares(scene, colliders, grupos) {
  const suelo = paveMesh(trocear(polyTris([P(94.82, 49.15), P(102.78, 49.15), P(102.78, 66.16), P(94.82, 66.21)]), 1.5), 0.16, tierraOscura(), 0xd8d0c4);
  if (suelo) { suelo.name = 'telesforoSolarBaleares'; scene.add(suelo); }
  const lisa = (A, B, alto, nombre, fn) => tira(A, B, alto, nombre, colliders, (kk, L) => pared(kk, 0, L, alto, fn, -0.25));
  grupos.push(lisa(P(94.82, 66.21), P(94.82, 54.4), 4.1, 'solarBalearesNorte', liso('#f0efea')));
  grupos.push(tira(P(102.78, 53.3), P(102.78, 66.16), 6.6, 'solarBalearesSur', colliders, (kk, L) => {
    pared(kk, 0, L, 6.6, liso('#eeede8'), -0.25);
    for (let x0 = 0.1; x0 < L; x0 += 0.25) kk.box(x0, 6.6, -0.15, 0.04, 0.9, 0.04, 0xf2f2ee);
    kk.box(L / 2, 7.45, -0.15, L, 0.05, 0.06, 0xf2f2ee);
  }));
  grupos.push(lisa(P(94.9, 49.15), P(102.8, 49.15), 6.6, 'solarBalearesFondo', liso('#ebeae4')));
  grupos.push(lisa(P(94.75, 58.97), P(98.17, 58.97), 4.2, 'solarBalearesCuarto', bloques));
  grupos.push(lisa(P(98.17, 58.97), P(98.17, 54.67), 4.2, 'solarBalearesCuartoSur', bloques));
  const k = new Kit();
  const M2 = marco(P(94.82, 66.2), P(102.78, 66.15));
  const L = M2.len;
  for (let s = 0.1; s < L; s += 2.0) k.cyl(s, 0, -0.1, 0.035, 0.035, 1.9, 0x4a3a30, { seg: 6 });
  for (let y = 0.15; y < 1.85; y += 0.2) k.box(L / 2, y, -0.1, L, 0.007, 0.007, 0x8a8478);
  for (let s = 0.08; s < L; s += 0.2) k.box(s, 0.05, -0.1, 0.007, 1.75, 0.007, 0x8a8478);
  const rnd = azar(57);
  // las piedras grandes, en fila detrás de la valla
  for (let s = 0.4; s < L - 0.4; s += 1.15 + rnd() * 0.3) {
    const w = 0.8 + rnd() * 0.5, h = 0.6 + rnd() * 0.4;
    k.box(s, 0, -0.8 - rnd() * 0.3, w, h, 0.8 + rnd() * 0.4, [0xb8ae9c, 0xa89e8c, 0xc4bcac, 0x9a9282][Math.floor(rnd() * 4)]);
  }
  for (let i = 0; i < 18; i++) k.box(0.4 + rnd() * (L - 0.8), 0, -2 - rnd() * 6, 0.4 + rnd() * 1.0, 0.1 + rnd() * 0.25, 0.4 + rnd() * 0.9, i % 2 ? 0x6e8a3e : 0x82a04a);
  grupos.push(enMarco(k, M2, 'telesforoSolarBalearesValla', colliders));
  return suelo;
}

/** la tierra oscura con piedrecitas del solar */
function tierraOscura() {
  return sueloTex(256, 4, (g, r, n) => {
    g.fillStyle = '#6e6458';
    g.fillRect(0, 0, n, n);
    for (let i = 0; i < 3400; i++) {
      const v = r();
      g.fillStyle = v < 0.3 ? `rgb(${Math.round(40 + v * 60)},${Math.round(36 + v * 54)},${Math.round(32 + v * 48)})` : `rgb(${Math.round(110 + v * 70)},${Math.round(100 + v * 62)},${Math.round(86 + v * 54)})`;
      g.fillRect(r() * n, r() * n, 1 + r() * 2.4, 1 + r() * 2.4);
    }
  });
}

/** el 9: el mármol de abajo con el garaje blanco, el balcón grande de balaustres y la torre del sur */
function casa9(colliders) {
  const A0 = 102.85, A1 = 111.8;
  return tira(P(A0, 66.16), P(A1, 66.11), 6.8, 'telesforo9', colliders, (k, L) => {
    const s = a => (a - A0) * L / (A1 - A0);
    const caja = (a0, a1, y0, y1, sale, hex, z = F) => k.box((s(a0) + s(a1)) / 2, y0, z + sale / 2, s(a1) - s(a0), y1 - y0, sale, hex);
    const ho = (a0, a1, y0, y1, fn, borde, z = F) => hueco(k, (s(a0) + s(a1)) / 2, y0, s(a1) - s(a0), y1 - y0, tx(a1 - a0, y1 - y0, fn), { borde, z });
    pared(k, 0, s(109.51), 6.8, liso('#f0d8c2'), -0.25);
    pared(k, s(109.51), L, 9.3, liso('#f0d8c2'), -0.25);
    caja(A0, A1, 0, 3.65, 0.03, 0xcdbcac);
    k.pic(L / 2, 1.825, F + 0.034, L, 3.65, 0, 1, tx(A1 - A0, 3.65, marmol));
    ho(103.92, 106.67, 0.13, 2.9, garajeCuarterones, 0xe8e8e4, F + 0.05);
    caja(103.8, 106.8, 0, 0.13, 0.25, 0x8a8682, F + 0.03);
    ho(107.57, 108.98, 2.4, 2.9, cristales('#f2f2ee', 6, 'rgba(50,52,56,.6)'), 0xf2f2ee, F + 0.05);
    caja(109.35, 109.9, 1.4, 1.7, 0.12, 0xd8d4cc, F + 0.05);
    caja(109.3, 109.7, 0.3, 0.6, 0.12, 0xeeeeea, F + 0.05);
    ho(110.06, 111.17, 0.02, 2.7, vidrio('#f2f2ee', 1), 0xf2f2ee, F + 0.05);
    // el balcón grande: la losa que vuela, el antepecho y los balaustres, con las puertas de cristal detrás
    for (const [a0, a1] of [[103.4, 105.6], [106.6, 108.8]]) ho(a0, a1, 4.25, 6.4, vidrio('#f2f2ee', 2), 0xf2f2ee);
    caja(A0, 109.5, 3.65, 4.2, 1.0, 0xeedcc8);
    caja(A0, 109.5, 4.2, 4.9, 0.12, 0xf2e2d0, F + 0.88);
    for (let a = A0 + 0.12; a < 109.4; a += 0.24) k.cyl(s(a), 4.9, F + 0.94, 0.05, 0.07, 0.85, 0xf4f2ee, { seg: 8 });
    caja(A0, 109.5, 5.75, 5.85, 1.0, 0xf2f0ea);
    ho(110.5, 111.4, 4.2, 4.7, vidrio('#f2f2ee', 2), 0xf2f2ee);
    ho(110.3, 111.5, 7.0, 8.2, vidrio('#f2f2ee', 2), 0xf2f2ee);
    caja(A0, 109.51, 6.7, 6.8, 0.06, 0xe4d0bc);
    caja(109.51, A1, 9.2, 9.3, 0.06, 0xe4d0bc);
  });
}

/** el 7: abajo blanco con la ventana de lamas y la ventanita, arriba color melocotón con los dos balcones de madera
 * blanca y sus puertas de lamas */
function casa7(colliders) {
  const A0 = 111.8, A1 = 122.6;
  return tira(P(A0, 66.11), P(A1, 66.04), 6.8, 'telesforo7', colliders, (k, L) => {
    const s = a => (a - A0) * L / (A1 - A0);
    const caja = (a0, a1, y0, y1, sale, hex, z = F) => k.box((s(a0) + s(a1)) / 2, y0, z + sale / 2, s(a1) - s(a0), y1 - y0, sale, hex);
    const ho = (a0, a1, y0, y1, fn, borde, z = F) => hueco(k, (s(a0) + s(a1)) / 2, y0, s(a1) - s(a0), y1 - y0, tx(a1 - a0, y1 - y0, fn), { borde, z });
    pared(k, 0, L, 6.8, liso('#f2dcc6'), -0.25);
    caja(A0, A1, 0, 3.6, 0.03, 0xf4f2ee);
    caja(A0, A1, 3.6, 3.75, 0.1, 0xf0e6d8);
    ho(113.07, 114.18, 0.55, 2.5, lamasBlancas(2), 0xf2f2ee, F + 0.03);
    ho(115.65, 116.6, 1.75, 2.45, vidrio('#f2f2ee', 1), 0xf2f2ee, F + 0.03);
    for (const [a0, a1] of [[112.2, 114.38], [115.28, 117.43]]) {
      ho(a0 + 0.45, a1 - 0.45, 4.1, 6.0, lamasBlancas(2), 0xf2f2ee);
      caja(a0 - 0.1, a1 + 0.1, 3.6, 4.1, 0.75, 0xf0dcc6);
      caja(a0, a1, 4.1, 4.8, 0.05, 0xf4f4f0, F + 0.65);
      for (const a of [a0, a1 - 0.05]) caja(a, a + 0.05, 4.1, 5.3, 0.7, 0xf4f4f0);
      for (let a = a0 + 0.1; a < a1; a += 0.18) caja(a, a + 0.04, 4.8, 5.3, 0.04, 0xf4f4f0, F + 0.66);
      caja(a0, a1, 5.28, 5.35, 0.08, 0xf4f4f0, F + 0.63);
    }
    caja(A0, A1, 6.7, 6.8, 0.06, 0xe6d2bc);
  });
}

/** contraventanas de lamas de un color, de tres hojas */
const lamas = (fondo, raya) => (g, w, h) => {
  g.fillStyle = fondo;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = raya;
  g.lineWidth = 1.5;
  for (let y = 4; y < h - 2; y += 4) { g.beginPath(); g.moveTo(3, y); g.lineTo(w - 3, y); g.stroke(); }
  g.fillStyle = raya;
  for (let xx = w / 3; xx < w - 2; xx += w / 3) g.fillRect(xx - 1.5, 0, 3, h);
};

/** contraventanas blancas de lamas, de las hojas que se pidan */
const lamasBlancas = n => (g, w, h) => {
  g.fillStyle = '#f4f4f0';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#b4b4ae';
  g.lineWidth = 1.5;
  const hw = w / n;
  for (let i = 0; i < n; i++) {
    g.strokeRect(i * hw + 2, 2, hw - 4, h - 4);
    for (let y = 7; y < h - 5; y += 5) { g.beginPath(); g.moveTo(i * hw + 6, y); g.lineTo(i * hw + hw - 6, y); g.stroke(); }
  }
};

/** se monta con lo demás */
export function buildTelesforoBravo(scene, colliders, map) {
  if (!map?.telesforoBravo) return null;
  const grupos = [casa25(colliders), casa20(colliders), casa18(colliders), casa16(colliders), casa14(colliders), casa12(colliders), casa9(colliders), casa7(colliders)];
  grupos.push(tira(P(85.62, 66.26), P(85.62, 60.5), 4.6, 'telesforo14Lado', colliders, (kk, L) => pared(kk, 0, L, 4.6, liso('#f0efea'), -0.25)));
  const suelo = patio(scene, colliders, grupos);
  const solar = solarBaleares(scene, colliders, grupos);
  for (const g of grupos) scene.add(g);
  return { grupos, suelo, solar };
}
