import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco, trocear } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';
import { paveMesh, polyTris, lightSlabs } from './suelos.js';
import { Z, ZF, pared, tira } from './rapadurasSur.js';
import { tuneTunelAltavista } from './tunelAltavista.js';

/**
 * La acera de León y Castillo al sur del bar El Túnel (la LZ-1, Altavista), del 169 a Compafric, con las vistas de la
 * calle de Google de julio de 2025 (LZ-1 167 a 161; solo se miran, no van dentro del juego), medidas con el foco bueno
 * de las capturas (475 px), y con dónde empieza y acaba cada casa sacado del plano del Catastro (los edificios de la
 * manzana 17575). En el mapa era el bloque genérico de 4 m. De verdad:
 * - el 169, la casa blanca baja del zócalo de plaqueta de ladrillo: la puerta verde del garaje, las dos puertas verdes,
 *   la ventana de contraventanas verdes, la placa azul de la calle y, arriba a la derecha, el cuarto de la azotea con su
 *   ventana verde;
 * - el 165, la casa blanca de la puerta blanca y las dos ventanas de lamas blancas, con la cornisa de tejas y los
 *   machones de las puntas;
 * - el 163, la casa metida metro y medio, con el zócalo gris pizarra, las dos ventanas verdes y la puerta verde oscura;
 * - Compafric (aire acondicionado), el edificio beis de tres plantas: abajo el escaparate con las placas de lo que
 *   hacen, encima el rótulo con las lamas oscuras, la caja de las aletas, la rendija de la escalera y la torreta.
 * Las casas están 0,7 m más adentro que en el Catastro, a ras de la fachada de El Túnel, para no comerse la acera. La
 * palmera que el juego plantaba al azar dentro del 165 (en la acera de verdad no hay ninguna) se esconde.
 */

// la cara de León y Castillo: a hacia el sur desde la esquina de Padre Claret (la de El Túnel), b hacia dentro
const C = [378.37 + 0.166579 * 1.9, -1299.89 - 0.98603 * 1.9];
const US = [-0.166579, 0.98603], E = [0.98605, 0.166412];
const P = (a, b = 0) => [C[0] + US[0] * a - E[0] * b, C[1] + US[1] * a - E[1] * b];
const A169 = 25.0, ACAJA = 29.1, A165 = 35.44, A163 = 45.39, ACOM = 55.55, AFIN = 62.58;
const FONDO169 = 14.4, FONDO_CAJA = 10.3, FONDO165 = 11.1, FONDO163 = 16.3, FONDO_COM = 17.0, METIDO = 1.5;
const ALTO169 = 4.0, ALTO_CAJA = 5.8, ALTO165 = 4.3, ALTO163 = 4.1, ALTO_CUARTO = 5.9, ALTO_COM = 10.24, ALTO_TORRE = 11.05;
// el marco va del sur al norte, con la calle delante
const F = marco(P(AFIN), P(A169));
const s = a => AFIN - a;

const BLANCO = '#f2f1ec', BEIGE = '#cdb59c';

/** antes de levantar la ciudad: las casas salen del frente del bloque genérico de 4 m (el que dejó El Túnel) */
export function tuneCompafricLyC(map) {
  if (!Array.isArray(map?.buildings)) return;
  if (!map.tunelAltavista) tuneTunelAltavista(map);
  const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const r = q => [+q[0].toFixed(2), +q[1].toFixed(2)];
  const libre = q => !q.skip && !q.edificioReal && Array.isArray(q.p);
  const PS = P(A169), ATRAS = P(A169, 10.5);
  const b = map.buildings.find(q => libre(q) && q.p.some(p => d(p, PS) < 0.3) && q.p.some(p => d(p, P(112)) < 0.5));
  if (!b) return;
  const i = b.p.findIndex(p => d(p, PS) < 0.3);
  const antes = i > 0 ? b.p[i - 1] : b.p[b.p.length - 2];
  const nuevo = [P(A169, FONDO169), P(A165, FONDO169), P(A165, FONDO165), P(A163, FONDO165), P(A163, FONDO163),
    P(ACOM, FONDO163), P(ACOM, FONDO_COM), P(AFIN, FONDO_COM), P(AFIN)].map(r);
  b.p.splice(i, 1, ...(d(antes, ATRAS) < 0.5 ? nuevo : nuevo.reverse()));
  if (i === 0) b.p[b.p.length - 1] = b.p[0].slice();
  // (al revés, para que den la vuelta como los bloques del mapa)
  const casa = (pts, h, f, c = [200, 196, 188]) => {
    const p = pts.map(r).reverse();
    p.push(p[0].slice());
    map.buildings.push({ p, h, k: 'gen', s: 0, f, c, edificioReal: true });
  };
  const blanca = [242, 241, 236], beige = [205, 181, 156];
  casa([P(A169), P(A169, FONDO169), P(A165, FONDO169), P(A165, FONDO_CAJA), P(ACAJA, FONDO_CAJA), P(ACAJA)], ALTO169, blanca);
  casa([P(ACAJA), P(ACAJA, FONDO_CAJA), P(A165, FONDO_CAJA), P(A165)], ALTO_CAJA, blanca);
  casa([P(A165), P(A165, FONDO165), P(A163, FONDO165), P(A163)], ALTO165, blanca);
  casa([P(A163, METIDO), P(A163, FONDO163), P(ACOM, FONDO163), P(ACOM, METIDO)], ALTO163, blanca);
  casa([P(45.45, 5.9), P(45.45, 9.1), P(48.6, 9.1), P(48.6, 5.9)], ALTO_CUARTO, blanca);
  casa([P(ACOM), P(ACOM, FONDO_COM), P(AFIN, FONDO_COM), P(AFIN)], ALTO_COM, beige);
  map.compafricLyC = true;
}

// ——— las texturas ———

const liso = color => (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); };
const tx = (w, h, fn) => canvasTex(Math.max(16, Math.min(1024, Math.round(w * 60))), Math.max(16, Math.round(h * 60)), fn);

/** la plaqueta de ladrillo del zócalo del 169 */
function ladrillo(g, w, h) {
  g.fillStyle = '#8e6450';
  g.fillRect(0, 0, w, h);
  const lh = h / 10, lw = lh * 2.3;
  for (let j = 0; j * lh < h; j++) {
    for (let x = (j % 2) * -lw / 2; x < w; x += lw) {
      const v = (Math.sin(j * 7.3 + x * 0.37) + 1) * 9;
      g.fillStyle = `rgb(${(176 + v) | 0},${(128 + v * 0.6) | 0},${(98 + v * 0.4) | 0})`;
      g.fillRect(x + 1, j * lh + 1, lw - 2, lh - 2);
    }
  }
}

/** una puerta de tableros, del color que se pida */
const puertaTableros = (color, claro) => (g, w, h) => {
  g.fillStyle = color;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = claro;
  g.lineWidth = Math.max(2, w * 0.04);
  for (const [y0, y1] of [[0.08, 0.36], [0.42, 0.62], [0.68, 0.92]]) g.strokeRect(w * 0.18, h * y0, w * 0.64, h * (y1 - y0));
  g.fillStyle = '#c8c4b4';
  g.fillRect(w * 0.82, h * 0.52, w * 0.07, h * 0.03);
};

/** la puerta verde del garaje del 169: dos hojas lisas */
function garajeVerde(g, w, h) {
  g.fillStyle = '#3a5145';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(0,0,0,.25)';
  g.lineWidth = 1;
  for (let y = h * 0.1; y < h; y += h * 0.1) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.fillStyle = '#2c4036';
  g.fillRect(w / 2 - 1, 0, 2, h);
}

/** unas contraventanas de lamas, del color que se pida */
const lamas = (fondo, raya) => (g, w, h) => {
  g.fillStyle = fondo;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = raya;
  g.lineWidth = 1.5;
  for (let y = 4; y < h - 2; y += 4) { g.beginPath(); g.moveTo(3, y); g.lineTo(w / 2 - 2, y); g.moveTo(w / 2 + 2, y); g.lineTo(w - 3, y); g.stroke(); }
  g.fillStyle = raya;
  g.fillRect(w / 2 - 1, 0, 2, h);
};

/** la puerta blanca del 165, con la rejilla oscura de arriba */
function puertaBlanca(g, w, h) {
  puertaTableros('#f2f2ee', '#d4d2cc')(g, w, h);
  g.fillStyle = '#3a3a38';
  g.fillRect(w * 0.06, h * 0.02, w * 0.88, h * 0.09);
  g.fillStyle = '#9a9a96';
  for (let x = w * 0.1; x < w * 0.92; x += w * 0.1) g.fillRect(x, h * 0.02, 2, h * 0.09);
}

/** la fila de tejas de la cornisa del 165 */
function tejas(g, w, h) {
  g.fillStyle = '#e2ddd2';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c4baa8';
  const r = h * 0.45;
  for (let x = r; x < w; x += r * 2) { g.beginPath(); g.arc(x, h, r, Math.PI, 0); g.fill(); }
  g.fillStyle = '#ece8e0';
  g.fillRect(0, 0, w, h * 0.3);
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

// Compafric: lo que va de izquierda (el sur, AFIN) a derecha (el norte, ACOM) en las texturas de la fachada entera
const fr = (a, a0 = AFIN, a1 = ACOM) => (a0 - a) / (a0 - a1);

/** el escaparate de Compafric (de 61,46 a 56,0): tres paños de cristal, la puerta de cristal y la puerta abierta */
function escaparate(g, w, h) {
  const a0 = 61.46, a1 = 56.0, x = a => fr(a, a0, a1) * w;
  const vidrio = g.createLinearGradient(0, 0, 0, h);
  vidrio.addColorStop(0, '#56626a');
  vidrio.addColorStop(1, '#2c3338');
  g.fillStyle = vidrio;
  g.fillRect(0, 0, w, h);
  // lo de dentro: las cajas de las máquinas y los rollos de tubo
  g.fillStyle = 'rgba(214,210,200,.35)';
  g.fillRect(x(61.2), h * 0.55, x(60.2) - x(61.2), h * 0.45);
  g.fillRect(x(59.2), h * 0.3, x(58.6) - x(59.2), h * 0.7);
  g.fillStyle = 'rgba(255,255,255,.12)';
  g.beginPath(); g.moveTo(x(61.0), h); g.lineTo(x(60.2), 0); g.lineTo(x(59.9), 0); g.lineTo(x(60.7), h); g.fill();
  // la puerta abierta del norte, oscura
  g.fillStyle = '#1e2124';
  g.fillRect(x(56.9), 0, w - x(56.9), h);
  // los perfiles de aluminio
  g.fillStyle = '#c8c8c4';
  for (const a of [a0, 59.7, 57.85, 56.9]) g.fillRect(Math.min(w - 4, x(a)), 0, 4, h);
  g.fillRect(0, 0, w, 3);
  g.fillRect(x(57.85), h * 0.5, x(56.9) - x(57.85), 3);
}

/** las tres placas de encima del escaparate, con lo que hacen (sin teléfonos ni correos) */
function placasServicios(g, w, h) {
  const a0 = 61.46, a1 = 56.0, x = a => fr(a, a0, a1) * w;
  g.fillStyle = '#8a7a68';
  g.fillRect(0, 0, w, h);
  const placas = [
    [61.43, 59.73, ['FABRICACIÓN ACERO INOX', 'AIRE ACONDICIONADO', 'REPARACIONES DE FRÍO Y CALOR', 'PROYECTOS E INSTALACIONES']],
    [59.67, 57.9, ['EQUIPAMIENTOS', 'MAQUINARIA HOSTELERÍA', 'BOMBAS DE CALOR', 'EXTRACCIONES DE SÓTANOS']],
    [57.83, 56.05, ['C/ León y Castillo', 'Arrecife']],
  ];
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  for (const [b0, b1, lineas] of placas) {
    const x0 = x(b0), x1 = x(b1);
    g.fillStyle = '#eef0f2';
    g.fillRect(x0 + 2, 2, x1 - x0 - 4, h - 4);
    g.fillStyle = '#23408a';
    const t = (h - 8) / lineas.length;
    g.font = `bold ${Math.max(7, Math.round(t * 0.8))}px Arial, sans-serif`;
    lineas.forEach((l, j) => g.fillText(l, (x0 + x1) / 2, 4 + t * (j + 0.5), x1 - x0 - 8));
  }
}

/** la primera planta de Compafric (de 2,96 a 5,13 m): la franja beis de «AIRE ACONDICIONADO» y, encima, el marco con
 * las lamas oscuras y el rótulo rojo (solo el nombre, sin el copo ni la flecha del logotipo) */
function plantaRotulo(g, w, h) {
  const yy = m => (5.13 - m) / 2.17 * h, x = a => fr(a) * w;
  g.fillStyle = '#7d6d5d';
  g.fillRect(0, 0, w, h);
  // las lamas oscuras entre los perfiles
  g.fillStyle = '#2f2c29';
  g.fillRect(x(61.9), yy(5.05), x(55.9) - x(61.9), yy(3.4) - yy(5.05));
  g.strokeStyle = '#4a4540';
  g.lineWidth = 1;
  for (let y = yy(5.05); y < yy(3.4); y += 4) { g.beginPath(); g.moveTo(x(61.9), y); g.lineTo(x(55.9), y); g.stroke(); }
  g.fillStyle = '#9a8a78';
  for (const m of [3.62, 4.35, 4.56, 4.86]) g.fillRect(x(61.9), yy(m) - 2, x(55.9) - x(61.9), 4);
  for (const a of [59.7, 57.85]) g.fillRect(x(a) - 2, yy(5.05), 4, yy(3.4) - yy(5.05));
  // la franja beis de abajo, con «AIRE ACONDICIONADO» en azul
  g.fillStyle = '#c2ad94';
  g.fillRect(x(61.9), yy(3.37), x(55.9) - x(61.9), h - yy(3.37));
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#2a4aa0';
  g.font = `bold ${Math.round((yy(3.03) - yy(3.29)) * 1.05)}px Arial, sans-serif`;
  g.fillText('AIRE ACONDICIONADO', (x(60.31) + x(57.18)) / 2, (yy(3.03) + yy(3.29)) / 2, x(57.18) - x(60.31));
  // el nombre en rojo con el borde blanco
  const alto = yy(3.69) - yy(4.26);
  g.font = `italic 900 ${Math.round(alto * 1.25)}px "Arial Black", Arial, sans-serif`;
  const cx = (x(61.05) + x(56.79)) / 2, cy = (yy(3.69) + yy(4.26)) / 2, ancho = x(56.79) - x(61.05);
  g.lineWidth = Math.max(2, alto * 0.12);
  g.strokeStyle = '#f2f0ec';
  g.strokeText('COMPAFRIC', cx, cy, ancho);
  g.fillStyle = '#c82a2c';
  g.fillText('COMPAFRIC', cx, cy, ancho);
}

// ——— las piezas ———

/** un hueco de a0 a a1 y de y0 a y1 */
const hu = (k, a0, a1, y0, y1, fn, borde, z = ZF + 0.04) =>
  hueco(k, s((a0 + a1) / 2), y0, Math.abs(a1 - a0), y1 - y0, tx(Math.abs(a1 - a0), y1 - y0, fn), { borde, z });
/** una caja pegada a la fachada de a0 a a1 y de y0 a y1, que sale «sale» m */
const caja = (k, a0, a1, y0, y1, sale, color, z = ZF) => k.box(s((a0 + a1) / 2), y0, z + sale / 2, Math.abs(a1 - a0), y1 - y0, sale, color);
/** una imagen pegada a la fachada */
const cuadro = (k, a0, a1, y0, y1, z, fn, tex) =>
  k.pic(s((a0 + a1) / 2), (y0 + y1) / 2, z, Math.abs(a1 - a0), y1 - y0, 0, 1, tex || tx(Math.abs(a1 - a0), y1 - y0, fn));

const VERDE = 0x2f6a3c, VERDE_OSC = 0x3f5a48;

/** el 169 */
function casa169(k) {
  pared(k, s(ACAJA), s(A169), ALTO169, liso(BLANCO));
  pared(k, s(A165), s(ACAJA), ALTO_CAJA, liso(BLANCO));
  cuadro(k, A169, A165, 0, 1.54, ZF + 0.01, ladrillo);
  caja(k, A169, A165, 3.9, 4.0, 0.06, 0xe4e2dc);
  caja(k, A169, ACAJA, ALTO169 - 0.12, ALTO169, 0.1, 0xe4e2dc);
  caja(k, ACAJA, A165, ALTO_CAJA - 0.12, ALTO_CAJA, 0.1, 0xe4e2dc);
  hu(k, 32.02, 34.66, 0, 1.98, garajeVerde, 0x34483c);
  hu(k, 30.02, 30.8, 0, 2.06, puertaTableros('#387344', '#4c8a58'), VERDE);
  hu(k, 27.93, 28.72, 0, 2.06, puertaTableros('#387344', '#4c8a58'), VERDE);
  hu(k, 26.11, 27.55, 1.0, 2.06, lamas('#3a7a48', '#2a5a34'), VERDE);
  hu(k, 32.35, 34.34, 4.15, 5.14, cristales('#2f6a3c', 2, 'rgba(200,205,200,.35)'), VERDE, ZF);
  // la caja de los contadores entre las puertas y la placa azul de la calle
  caja(k, 29.05, 29.55, 1.75, 2.05, 0.1, 0xeeeeea);
  caja(k, 25.5, 25.95, 2.75, 3.05, 0.03, 0x2a4aa8);
  cuadro(k, 25.5, 25.95, 2.75, 3.05, ZF + 0.032, placaCalle);
}

/** el 165 */
function casa165(k) {
  pared(k, s(A163), s(A165), ALTO165, liso(BLANCO));
  caja(k, A165, A163, 4.12, 4.32, 0.14, 0xd9d2c4);
  cuadro(k, A165, A163, 4.12, 4.32, ZF + 0.142, tejas);
  // los machones de las dos puntas de la azotea
  for (const [a0, a1] of [[A165, 36.7], [44.28, A163]]) {
    k.box(s((a0 + a1) / 2), ALTO165, ZF - 0.3, a1 - a0, 0.42, 0.6, 0xeeede8);
    k.box(s((a0 + a1) / 2), ALTO165 + 0.42, ZF - 0.3, a1 - a0 + 0.06, 0.07, 0.66, 0xd9d2c4);
  }
  hu(k, 36.9, 38.18, 1.1, 2.11, lamas('#f2f2ee', '#a8a6a0'), 0xf2f2ee);
  hu(k, 42.45, 43.89, 1.07, 2.11, lamas('#f2f2ee', '#a8a6a0'), 0xf2f2ee);
  hu(k, 39.9, 40.7, 0, 2.18, puertaBlanca, 0xf2f2ee);
  caja(k, 41.38, 42.07, 1.04, 1.71, 0.15, 0xe6e6e2);
  caja(k, 39.0, 39.3, 1.3, 1.7, 0.08, 0xe0e0dc);
}

/** el 163, metido METIDO m */
function casa163(k) {
  const z = ZF - METIDO;
  pared(k, s(ACOM), s(A163), ALTO163, liso(BLANCO), Z - METIDO);
  caja(k, A163, ACOM, 0, 0.9, 0.04, 0x50565a, z);
  caja(k, A163, ACOM, ALTO163 - 0.12, ALTO163, 0.08, 0xe4e2dc, z);
  for (const [a0, a1] of [[47.1, 48.35], [52.55, 53.75]]) hu(k, a0, a1, 0.91, 2.0, cristales('#4a7a5a', 2, 'rgba(120,150,130,.45)'), 0x3e6a50, z + 0.04);
  hu(k, 50.0, 50.9, 0.08, 2.0, puertaTableros('#4f6656', '#647c6a'), VERDE_OSC, z + 0.04);
  caja(k, 49.85, 51.05, 0, 0.08, 0.3, 0xcfcac0, z);
  caja(k, 51.0, 51.25, 1.55, 1.8, 0.08, 0x3e6a50, z);
}

/** Compafric */
function compafric(k) {
  pared(k, s(AFIN), s(ACOM), ALTO_COM, liso(BEIGE));
  // abajo: las pilastras, el poyo de granito, el escaparate y las placas de encima
  caja(k, 61.46, AFIN, 0, 2.96, 0.08, 0x9a8a78);
  caja(k, ACOM, 56.0, 0, 2.96, 0.08, 0x9a8a78);
  caja(k, 56.0, 61.46, 0, 0.39, 0.1, 0xafa289);
  cuadro(k, 56.0, 61.46, 0.39, 2.3, ZF + 0.02, escaparate);
  cuadro(k, 56.0, 61.46, 2.3, 2.9, ZF + 0.02, null, canvasTex(820, 90, placasServicios));
  caja(k, 56.0, 61.46, 2.9, 2.96, 0.08, 0x8a7a68);
  // la primera planta, con el rótulo, y la cornisa
  cuadro(k, ACOM, AFIN, 2.96, 5.13, ZF + 0.02, null, canvasTex(1024, 316, plantaRotulo));
  caja(k, ACOM, AFIN, 5.13, 5.66, 0.28, 0xc4ad95);
  // la segunda: la caja de las aletas y la rendija con sus dos aletas
  caja(k, 58.8, AFIN, 5.8, 7.25, 0.5, 0xcdb59d);
  caja(k, 58.8, AFIN, 7.25, 8.66, 0.3, 0x2e2a26);
  for (const [y0, y1] of [[7.25, 7.67], [7.78, 8.11], [8.23, 8.66]]) caja(k, 58.75, AFIN, y0, y1, 0.62, 0xcfb79f);
  hu(k, 56.2, 56.8, 6.0, 8.1, cristales('#e8e4dc', 1, 'rgba(230,226,215,.6)'), 0xe0d8cc, ZF);
  for (const a of [56.05, 56.95]) caja(k, a - 0.1, a + 0.1, 5.7, 8.8, 0.3, 0xc8b098);
  // el remate y la torreta de la escalera, un poco metida
  caja(k, ACOM, AFIN, ALTO_COM - 0.1, ALTO_COM, 0.06, 0xc0a890);
  k.box(s((59.0 + AFIN) / 2), ALTO_COM, ZF - 1.0 - 2.5, AFIN - 59.0, ALTO_TORRE - ALTO_COM, 5.0, 0xc9b199);
}

/** las palmeras que el juego planta al azar a unos metros de las calles grandes y que caen dentro de estas casas: se
 * esconden (el juego las planta después de montar los barrios, así que se vuelve a mirar hasta que estén) */
function sinPalmasDentro(scene, veces = 40) {
  let tronco = null;
  scene.traverse(o => {
    if (!tronco && o.isInstancedMesh && o.geometry?.type === 'CylinderGeometry' && o.material?.color?.getHex?.() === 0xd8bc94) tronco = o;
  });
  if (!tronco) {
    if (veces > 0) setTimeout(() => sinPalmasDentro(scene, veces - 1), 1000);
    return 0;
  }
  const dentro = (x, z) => {
    const dx = x - C[0], dz = z - C[1], a = dx * US[0] + dz * US[1], b = -(dx * E[0] + dz * E[1]);
    return a > A169 && a < AFIN && b > -0.45 && b < FONDO_COM;
  };
  const mallas = tronco.parent.children.filter(o => o.isInstancedMesh && o.count === tronco.count);
  const M = new THREE.Matrix4(), v = new THREE.Vector3(), cero = new THREE.Matrix4().makeScale(0, 0, 0);
  tronco.updateMatrixWorld(true);
  let n = 0;
  for (let i = 0; i < tronco.count; i++) {
    tronco.getMatrixAt(i, M);
    v.setFromMatrixPosition(M).applyMatrix4(tronco.matrixWorld);
    if (!dentro(v.x, v.z)) continue;
    for (const m of mallas) { m.setMatrixAt(i, cero); m.instanceMatrix.needsUpdate = true; }
    n++;
  }
  return n;
}

/** se monta con lo demás */
export function buildCompafricLyC(scene, colliders, map) {
  if (!map?.compafricLyC) return null;
  const k = new Kit();
  casa169(k);
  casa165(k);
  casa163(k);
  compafric(k);
  const grupos = [enMarco(k, F, 'compafricLyC', colliders)];
  // las paredes de los lados y de atrás que asoman: las del cuarto de la azotea del 169, el lado del 165 en el
  // entrante del 163, y los dos lados y la trasera de Compafric
  const lisa = (A, B, alto, nombre, color = '#ecebe6') => tira(A, B, alto, nombre, colliders, (kk, L) => pared(kk, 0, L, alto, liso(color), -0.25));
  grupos.push(lisa(P(ACAJA), P(ACAJA, FONDO_CAJA), ALTO_CAJA, 'casa169CuartoNorte'));
  grupos.push(lisa(P(ACAJA, FONDO_CAJA), P(A165, FONDO_CAJA), ALTO_CAJA, 'casa169CuartoTrasera'));
  grupos.push(lisa(P(A163, METIDO), P(A163), ALTO165, 'casa165LadoSur'));
  grupos.push(lisa(P(ACOM), P(ACOM, FONDO_COM), ALTO_COM, 'compafricLadoNorte', '#c8b098'));
  grupos.push(lisa(P(AFIN, FONDO_COM), P(AFIN), ALTO_COM, 'compafricLadoSur', '#c8b098'));
  grupos.push(lisa(P(ACOM, FONDO_COM), P(AFIN, FONDO_COM), ALTO_COM, 'compafricTrasera', '#c4ac94'));
  for (const g of grupos) scene.add(g);
  // las losetas de la acera en el entrante del 163
  const suelo = paveMesh(trocear(polyTris([P(A163), P(A163, METIDO), P(ACOM, METIDO), P(ACOM)]), 1.5), 0.18, lightSlabs(), 0xe6dccb);
  if (suelo) { suelo.name = 'compafricLyCEntrante'; scene.add(suelo); }
  const palmas = sinPalmasDentro(scene);
  return { grupos, suelo, palmas };
}
