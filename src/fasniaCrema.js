import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';
import { ZF, pared, tira } from './rapadurasSur.js';
import { tuneSnackLosPicachos } from './snackLosPicachos.js';

/**
 * La calle Fasnia (Altavista), la acera de las adosadas crema entre el Snack Bar Los Picachos y la calle Leopoldo von
 * Buch, con las vistas de la calle de Google de julio de 2025 (Fasnia 1 y 3; solo se miran, no van dentro del juego) y
 * el plano del Catastro (es el mismo conjunto de las adosadas de León y Castillo). En el mapa era el bloque genérico de
 * 4 m, que además se quedaba 4 m antes de la calle. De verdad:
 * - las adosadas crema de dos plantas: abajo los paños de celosía de bloques blancos, los porches metidos con su
 *   columna, las cancelas blancas de rejas, la puerta de rejas con arco del 1 y las cajas de los contadores; arriba las
 *   ventanas de lamas blancas, la de la persiana y la de carpintería blanca, y el pretil que sube a escalones;
 * - el 3, la casa más alta de la esquina, con Marcia, centro de estética: la persiana con los tratamientos pintados
 *   (DERMAPEN, PRESOTERAPIA, MANICURA SPA...) y las rayas naranjas y azules, el letrero blanco con el nombre (sin el
 *   dibujo del logotipo), la rejilla de ventilación y las dos ventanas de lamas de arriba.
 */

// la cara de León y Castillo de las adosadas: a hacia el norte desde la esquina de Cervantes, b hacia dentro; la de
// Fasnia va a a = 69,3 (como la del Snack Los Picachos), de b = 12 (detrás del snack) a b = 35,2 (Leopoldo von Buch)
const O = [415.7, -1501.6];
const U = [0.1594, -0.9873], N = [0.9873, 0.1594];
const P = (a, b = 0) => [O[0] + U[0] * a - N[0] * b, O[1] + U[1] * a - N[1] * b];
const AF = 69.3, B0 = 12, B1 = 35.2, FONDO = 12.8;
// lo medido va de b = 12 a 36,4 (el Catastro); se encoge un poco para que la esquina no se coma la calle de atrás
const K = (B1 - B0) / (36.4 - B0);
const x = b => (b - B0) * K;
// las casas: [de b, a b, alto del pretil]
const CASAS = [[12, 14.4, 6.4], [14.4, 17.9, 6.8], [17.9, 21.7, 7.15], [21.7, 25.4, 7.45], [25.4, 36.4, 8.45]];
// el marco va de la trasera del snack a Leopoldo von Buch, con Fasnia delante (al norte)
const M = marco(P(AF, B0), P(AF, B1));
const CREMA = '#f6eacc';

/** antes de levantar la ciudad: las casas van en lugar del bloque genérico de 4 m y llegan hasta la calle Fasnia */
export function tuneFasniaCrema(map) {
  if (!Array.isArray(map?.buildings)) return;
  if (!map.snackLosPicachos) tuneSnackLosPicachos(map);
  const r = q => [+q[0].toFixed(2), +q[1].toFixed(2)];
  // (al revés, para que den la vuelta como los bloques del mapa)
  for (const [b0, b1, h] of CASAS) {
    const c0 = B0 + x(b0), c1 = B0 + x(b1);
    const p = [P(AF, c0), P(AF - FONDO, c0), P(AF - FONDO, c1), P(AF, c1)].map(r).reverse();
    p.push(p[0].slice());
    map.buildings.push({ p, h, k: 'gen', s: 0, f: [246, 234, 204], c: [200, 196, 188], edificioReal: true });
  }
  map.fasniaCrema = true;
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

/** la persiana de Marcia con los tratamientos pintados y las rayas de colores */
function persianaMarcia(g, w, h) {
  persianaBlanca(g, w, h);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#e06a3a';
  g.font = `bold ${Math.round(h * 0.045)}px Arial, sans-serif`;
  g.fillText('LA ESTÉTICA AVANZADA ESTÁ AQUÍ', w / 2, h * 0.07, w * 0.8);
  const filas = [['DERMAPEN', 'MICROPIGMENTACIÓN'], ['PRESOTERAPIA', 'PARAFINAS'], ['DISEÑO DE CEJAS', 'MICROBLADING'],
    ['MANICURA SPA', 'HIGIENE FACIAL PROFUNDA'], ['PEDICURA SPA', '']];
  filas.forEach(([a, b], j) => {
    g.fillStyle = j % 2 ? '#e06a3a' : '#2f6aa8';
    g.font = `bold ${Math.round(h * 0.04)}px Arial, sans-serif`;
    g.fillText(a, w * 0.3, h * (0.15 + j * 0.065), w * 0.4);
    g.fillStyle = j % 2 ? '#2f6aa8' : '#e06a3a';
    if (b) g.fillText(b, w * 0.7, h * (0.15 + j * 0.065), w * 0.4);
  });
  for (const [y, color] of [[0.6, '#e8703a'], [0.66, '#e8703a'], [0.74, '#3a9ac8'], [0.8, '#3a9ac8'], [0.86, '#7ac0d8']]) {
    g.strokeStyle = color;
    g.lineWidth = Math.max(2, h * 0.015);
    g.beginPath();
    for (let xx = 0; xx <= w; xx += 8) g.lineTo(xx, h * y + Math.sin(xx / w * 9 + y * 20) * h * 0.012);
    g.stroke();
  }
}

/** el letrero de Marcia: solo el nombre y lo que es, en una placa blanca (sin el dibujo del logotipo) */
function letreroMarcia(g, w, h) {
  g.fillStyle = '#f6f6f4';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c8d8e4';
  g.lineWidth = 3;
  g.strokeRect(2, 2, w - 4, h - 4);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#3a8ac0';
  g.font = `italic bold ${Math.round(h * 0.4)}px Georgia, "Times New Roman", serif`;
  g.fillText('Marcia', w / 2, h * 0.28, w * 0.7);
  g.font = `italic bold ${Math.round(h * 0.24)}px Georgia, serif`;
  g.fillText('Tu centro de Estética', w / 2, h * 0.6, w * 0.9);
  g.fillStyle = '#2a2a2a';
  g.font = `bold ${Math.round(h * 0.16)}px Arial, sans-serif`;
  g.fillText('UNISEX', w * 0.72, h * 0.85, w * 0.3);
}

/** una rejilla de ventilación de lamas */
function rejilla(g, w, h) {
  g.fillStyle = '#ece6d6';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#8a8478';
  for (let y = 3; y < h - 2; y += 5) g.fillRect(4, y, w - 8, 2);
  g.fillStyle = '#d6d0c0';
  g.fillRect(w / 2 - 1, 0, 2, h);
}

// ——— las piezas ———

/** un hueco de b0 a b1 (medidos) y de y0 a y1 */
const hu = (k, b0, b1, y0, y1, fn, borde, z = ZF + 0.04) => hueco(k, (x(b0) + x(b1)) / 2, y0, (b1 - b0) * K, y1 - y0, tx((b1 - b0) * K, y1 - y0, fn), { borde, z });
/** una caja pegada a la fachada */
const caja = (k, b0, b1, y0, y1, sale, color, z = ZF) => k.box((x(b0) + x(b1)) / 2, y0, z + sale / 2, (b1 - b0) * K, y1 - y0, sale, color);

/** las adosadas crema y la casa de Marcia */
function fila(k) {
  for (const [b0, b1, h] of CASAS) {
    pared(k, x(b0), x(b1), h, liso(CREMA));
    caja(k, b0, b1, h - 0.22, h, 0.1, 0xe8d8b0);
  }
  // los paños de celosía, con las cajas de los contadores debajo de algunos
  for (const [b0, b1] of [[12.3, 14.0], [15.55, 17.0], [19.37, 20.75], [22.4, 24.1]]) hu(k, b0, b1, 1.29, 2.82, celosia, 0xf4f2ec, ZF + 0.02);
  for (const [b0, b1] of [[19.6, 20.5], [22.6, 23.6]]) caja(k, b0, b1, 0.75, 1.1, 0.1, 0xf0f0ec);
  // los porches con la columna blanca, las cancelas y la puerta de rejas con arco del 1
  for (const [b0, b1, col] of [[14.0, 15.4, 14.8], [20.96, 22.31, 21.7]]) {
    hu(k, b0, b1, 0, 3.0, porche, 0xead9ae, ZF + 0.02);
    k.cyl(x(col), 0, ZF + 0.25, 0.17, 0.17, 3.0, 0xf4f2ec, { seg: 14 });
    k.block(x(col), ZF + 0.25, 0.34, 0.34);
  }
  hu(k, 17.05, 18.05, 0, 2.6, cancela(false), 0xead9ae, ZF + 0.02);
  hu(k, 18.16, 19.13, 0, 2.8, cancela(true), 0xead9ae, ZF + 0.02);
  hu(k, 24.1, 25.4, 0, 2.7, cancela(false), 0xead9ae, ZF + 0.02);
  k.pic(x(18.0), 3.05, ZF + 0.01, 0.14, 0.16, 0, 1, canvasTex(28, 32, (g, w, h) => {
    liso('#2a4aa8')(g, w, h); g.fillStyle = '#f4f4f0'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `bold ${Math.round(h * 0.7)}px Arial, sans-serif`; g.fillText('1', w / 2, h * 0.55);
  }));
  // arriba: la ventana de carpintería, la de la persiana y las de lamas
  hu(k, 12.6, 13.6, 4.2, 5.2, cristales('#f2f2ee', 2, 'rgba(230,226,215,.45)'), 0xf2f2ee, ZF);
  hu(k, 15.8, 17.0, 4.35, 5.5, persianaBlanca, 0xf2f2ee, ZF);
  hu(k, 19.3, 20.4, 4.45, 5.6, lamasBlancas, 0xf2f2ee, ZF);
  hu(k, 22.6, 24.0, 4.55, 5.7, lamasBlancas, 0xf2f2ee, ZF);
  // Marcia: la persiana pintada, el letrero, la rejilla, la caja y las dos ventanas de lamas de arriba
  hu(k, 26.1, 29.75, 0.3, 3.3, persianaMarcia, 0xd8d8d4);
  caja(k, 30.9, 33.6, 2.95, 4.3, 0.06, 0xf6f6f4);
  k.pic((x(30.9) + x(33.6)) / 2, 3.625, ZF + 0.062, (33.6 - 30.9) * K, 1.35, 0, 1, canvasTex(400, 200, letreroMarcia));
  hu(k, 34.9, 36.3, 2.74, 3.48, rejilla, 0xe8e2d4);
  caja(k, 35.75, 36.25, 1.0, 1.6, 0.12, 0xe8e4dc);
  for (const [b0, b1] of [[26.2, 27.7], [29.2, 30.6]]) hu(k, b0, b1, 5.75, 7.0, lamasBlancas, 0xf2f2ee, ZF);
}

/** se monta con lo demás */
export function buildFasniaCrema(scene, colliders, map) {
  if (!map?.fasniaCrema) return null;
  const k = new Kit();
  fila(k);
  const grupos = [enMarco(k, M, 'fasniaCrema', colliders)];
  // las paredes que asoman: la esquina de Leopoldo von Buch, los escalones de los pretiles y la trasera de Marcia
  const lisa = (A, B, alto, nombre, color = '#efe2c0') => tira(A, B, alto, nombre, colliders, (kk, L) => pared(kk, 0, L, alto, liso(color), -0.25));
  grupos.push(lisa(P(AF, B1), P(AF - FONDO, B1), 8.45, 'fasniaEsquinaVonBuch'));
  for (let i = 1; i < CASAS.length; i++) {
    const c = B0 + x(CASAS[i][0]), h = CASAS[i][2];
    grupos.push(lisa(P(AF - FONDO, c), P(AF, c), h, 'fasniaEscalon' + i));
  }
  grupos.push(lisa(P(AF - FONDO, B1), P(AF - FONDO, B0 + x(25.4)), 8.45, 'fasniaMarciaTrasera'));
  for (const g of grupos) scene.add(g);
  return { grupos };
}
