import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco, trocear } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';
import { paveMesh, polyTris } from './suelos.js';
import { Z, ZF, BLANCO, pared, tira, tierraParda } from './rapadurasSur.js';
import { tuneSuntelcoEndesa } from './suntelcoEndesa.js';

/**
 * La punta sur de la acera de León y Castillo en Altavista (la LZ-1), del solar de tierra a la oficina de Suntelco, con
 * las vistas de la calle de Google de julio de 2025 (LZ-1 177, 179, 181, 185 y 187; solo se miran, no van dentro del
 * juego). Medido con el foco bueno de las capturas (475 px: el fov de la URL es el vertical) y con el sitio de cada
 * vista; las medidas de vistas distintas cuadran a medio metro y el paso de peatones cae donde en la foto aérea. De sur
 * a norte:
 * - el solar de tierra (con coches aparcados de verdad, que no se ponen), con su muro bajo de bloques por delante;
 * - la casa blanca alta del 179: los dos portones marrones con la vidriera de arriba, la puerta de madera tallada del
 *   medio con su escalón, los contadores y las placas de vado; arriba, las tres ventanas de carpintería marrón y el
 *   remate con el centro más alto; la pared del solar, lisa y blanca, y la medianera del norte sin pintar;
 * - la farmacia (181): la parte estrecha de dos plantas con la puertita blanca y la ventanita, y la de una planta con
 *   el toldo «FARMACIA ✚ APOTHEKE», el escaparate, la entrada de la escalera con el letrero «FARMACIA», el balcón de
 *   obra de arriba y la cruz verde colgada delante;
 * - Énalta Atención Funeraria (183): el zócalo de azulejo marrón oscuro, la puerta de madera tallada, la entrada de
 *   cristal con la escalera, el escaparate grande con la plaquita, el letrero lila y la losa saliente de arriba;
 * - la casa baja blanca (185): el portón verde, la ventana grande de seis hojas, la puerta verde de cristal, la otra
 *   ventana, el zócalo de piedra gris y, metidas 3,25 m, las dos habitaciones de arriba con sus ventanas verdes.
 * En el mapa era el bloque de 6 m del 179, el hueco de al lado (que no existe) y el bloque genérico de 5 m.
 */

// la cara de León y Castillo: n hacia el norte desde la esquina sur del bloque genérico del mapa, b hacia dentro
const ESQ_S = [396.6, -1409.71];
const UN = [0.16073, -0.987], NE = [0.987, 0.16073];
const P = (n, b = 0) => [ESQ_S[0] + UN[0] * n - NE[0] * b, ESQ_S[1] + UN[1] * n - NE[1] * b];
// dónde empieza cada casa (en n), medido en las vistas de la calle
const N_SOLAR = -48.85, N_179 = -16.6, N_FAR = -6.65, N_FAR2 = -4.35, N_ENA = 2.42, N_BAJA = 12.5, N_SUN = 24.7;
const FONDO = 12, FONDO_179 = 28.1;
const ALTO_179 = 9.42, ALTO_F1 = 7.23, ALTO_F2 = 4.95, ALTO_E = 6.08, ALTO_B = 3.96;
const F = marco(P(N_179), P(N_SUN));
const s = n => n - N_179;
// el solar: de la casa del 179 a la del 175 (el bloque de al lado del mapa) y hasta la calle de atrás
const SOLAR = [P(N_179), P(N_SOLAR), [361.3, -1366], P(N_179, FONDO_179)];

const LILA = '#cdb4dc', AZULEJO = 0x3a2a24, VERDE = 0x2e7a46, MARRON = 0x5a3a2a;

/** antes de levantar la ciudad: las casas salen del bloque del 179, del hueco y del bloque genérico de 5 m */
export function tuneFarmaciaEnalta(map) {
  if (!Array.isArray(map?.buildings)) return;
  // parte de la esquina que deja la oficina de Suntelco: tiene que hacerse antes (en la web los retoques van al revés)
  if (!map.suntelcoEndesa) tuneSuntelcoEndesa(map);
  const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const r = q => [+q[0].toFixed(2), +q[1].toFixed(2)];
  const libre = q => !q.skip && !q.edificioReal && Array.isArray(q.p);
  const A = r(P(N_SUN));
  const b = map.buildings.find(q => libre(q) && q.p.some(p => d(p, A) < 0.3) && q.p.some(p => d(p, ESQ_S) < 0.3));
  const viejo = map.buildings.find(q => libre(q) && q.p.some(p => d(p, [394.7, -1402.4]) < 0.3) && q.p.some(p => d(p, [392.6, -1389.3]) < 0.3));
  if (!b || !viejo) return;
  // el bloque genérico pierde el frente de la esquina sur hasta la casa de Suntelco (12 m de fondo): la de Suntelco ya
  // lo dejó en ... P(N_SUN, FONDO), P(N_SUN), ESQ_S ...; los dos últimos se cambian por P(0, FONDO)
  let q = b.p.map(p => p.slice());
  const cerrado = d(q[0], q[q.length - 1]) < 0.01;
  if (cerrado) q.pop();
  const i0 = q.findIndex(p => d(p, ESQ_S) < 0.3);
  q = [...q.slice(i0), ...q.slice(0, i0)];
  const esquina = r(P(0, FONDO));
  if (d(q[q.length - 1], A) < 0.3) q = [...q.slice(1, -1), esquina];
  else if (d(q[1], A) < 0.3) q = [esquina, ...q.slice(2)];
  else return;
  if (cerrado) q.push(q[0].slice());
  b.p = q;
  // el bloque del 179 era más largo que la casa (se comía parte del solar): se quita y va el de verdad
  viejo.skip = true;
  const casa = (n0, n1, fondo, h, c = [200, 196, 188]) => {
    const p = [P(n0), P(n0, fondo), P(n1, fondo), P(n1)].map(r);
    p.push(p[0].slice());
    map.buildings.push({ p, h, k: 'gen', s: 0, f: [242, 242, 238], c, edificioReal: true });
  };
  casa(N_179, N_FAR, FONDO_179, ALTO_179, [96, 136, 108]);
  casa(N_FAR, N_FAR2, FONDO, ALTO_F1);
  casa(N_FAR2, N_ENA, FONDO, ALTO_F2);
  casa(N_ENA, N_BAJA, FONDO, ALTO_E);
  casa(N_BAJA, N_SUN, FONDO, ALTO_B);
  map.farmaciaEnalta = true;
}

// ——— las texturas ———

const liso = color => (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); };
const tx = (w, h, fn) => canvasTex(Math.max(16, Math.min(1024, Math.round(w * 60))), Math.max(16, Math.round(h * 60)), fn);

/** el faldón del toldo de la farmacia: «FARMACIA ✚ APOTHEKE» en blanco sobre azul */
function faldonFarmacia(g, w, h) {
  g.fillStyle = '#2a6ab8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#ffffff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `bold ${Math.round(h * 0.62)}px Arial, sans-serif`;
  g.fillText('FARMACIA  ✚  APOTHEKE', w / 2, h * 0.54, w * 0.94);
}

/** el letrero de la farmacia: la cruz verde y «FARMACIA» en rojo */
function letreroFarmacia(g, w, h) {
  g.fillStyle = '#f6f6f2';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#2aa84a';
  const t = h * 0.18;
  g.fillRect(h * 0.5 - t / 2, h * 0.12, t, h * 0.76);
  g.fillRect(h * 0.12, h * 0.5 - t / 2, h * 0.76, t);
  g.fillStyle = '#c82a2a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `bold ${Math.round(h * 0.56)}px Georgia, serif`;
  g.fillText('FARMACIA', w * 0.58, h * 0.46, w * 0.74);
}

/** el escaparate de la farmacia, con las cosas de dentro */
function escaparate(g, w, h) {
  g.fillStyle = '#3a4048';
  g.fillRect(0, 0, w, h);
  const colores = ['#f2f2ee', '#5aa0d8', '#e84a7a', '#f2c232', '#4ab06a'];
  for (let i = 0; i < 14; i++) {
    g.fillStyle = colores[i % 5];
    g.fillRect(w * (0.04 + (i % 7) * 0.135), h * (0.25 + Math.floor(i / 7) * 0.35), w * 0.09, h * 0.22);
  }
  g.strokeStyle = '#f0f0ec';
  g.lineWidth = 3;
  g.strokeRect(1.5, 1.5, w - 3, h - 3);
}

/** una entrada abierta con la escalera que sube */
function entradaEscalera(g, w, h) {
  g.fillStyle = '#d8d6d0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#b8b4ac';
  for (let i = 0; i < 6; i++) g.fillRect(w * (0.25 + i * 0.05), h * (1 - (i + 1) * 0.09), w * (0.75 - i * 0.05), h * 0.035);
  g.fillStyle = '#e8e8e4';
  g.fillRect(0, 0, w * 0.22, h);
  g.strokeStyle = '#9a9a96';
  g.lineWidth = 2;
  g.beginPath(); g.moveTo(w * 0.3, h * 0.55); g.lineTo(w * 0.95, h * 0.1); g.stroke();
}

/** una puerta de madera tallada, con sus cuarterones */
const tallada = (fondo, linea) => (g, w, h) => {
  g.fillStyle = fondo;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = linea;
  g.lineWidth = 2;
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) g.strokeRect(w * (0.1 + j * 0.42), h * (0.05 + i * 0.235), w * 0.38, h * 0.2);
};

/** la puertita blanca de la farmacia */
function puertaBlanca(g, w, h) {
  g.fillStyle = '#f0f0ec';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c8c8c4';
  g.lineWidth = 2;
  g.strokeRect(w * 0.15, h * 0.06, w * 0.7, h * 0.38);
  g.strokeRect(w * 0.15, h * 0.52, w * 0.7, h * 0.42);
  g.fillStyle = '#9a9a96';
  g.fillRect(w * 0.8, h * 0.5, 3, 8);
}

/** un portón de chapa marrón, con sus nervios y sus dos refuerzos */
function portonMarron(g, w, h) {
  g.fillStyle = '#6a4434';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#4e3024';
  g.lineWidth = 1.5;
  for (let x = 3; x < w; x += 6) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  g.fillStyle = '#7a5444';
  g.fillRect(0, h * 0.33, w, 3);
  g.fillRect(0, h * 0.66, w, 3);
  g.fillStyle = '#4e3024';
  g.fillRect(w / 2 - 1.5, 0, 3, h);
  g.fillStyle = 'rgba(0,0,0,.18)';
  g.fillRect(0, h - 6, w, 6);
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

/** el letrero lila de Énalta */
function letreroEnalta(g, w, h) {
  g.fillStyle = LILA;
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#3a2a4a';
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  g.font = `${Math.round(h * 0.7)}px Georgia, "Times New Roman", serif`;
  g.fillText('Énalta', w * 0.02, h * 0.5, w * 0.24);
  g.font = `${Math.round(h * 0.48)}px Arial, sans-serif`;
  g.fillText('Atención Funeraria', w * 0.29, h * 0.56, w * 0.68);
}

/** el azulejo marrón oscuro del zócalo */
function azulejo(g, w, h) {
  g.fillStyle = '#2a1e18';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#4a3a30';
  g.lineWidth = 1;
  for (let x = 0; x < w; x += 8) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y < h; y += 8) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** la piedra gris del zócalo de la casa baja */
function piedraGris(g, w, h) {
  g.fillStyle = '#9a968e';
  g.fillRect(0, 0, w, h);
  let sd = 61;
  const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < w * h / 14; i++) {
    g.fillStyle = rnd() < 0.5 ? 'rgba(70,68,64,.4)' : 'rgba(210,206,198,.4)';
    g.fillRect(rnd() * w, rnd() * h, 2, 1.5);
  }
}

/** un portón verde de tablas */
function tablasVerdes(g, w, h) {
  g.fillStyle = '#2e7a46';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#1e5a32';
  g.lineWidth = 2;
  for (let x = w / 8; x < w; x += w / 8) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
}

/** la puerta verde de la casa baja: los cristales con visillo arriba y el cuarterón abajo */
function puertaVerdeCristal(g, w, h) {
  g.fillStyle = '#2e7a46';
  g.fillRect(0, 0, w, h);
  g.save();
  g.translate(w * 0.1, h * 0.06);
  cristales('#2e7a46', 2, 'rgba(240,238,232,.85)')(g, w * 0.8, h * 0.44);
  g.restore();
  g.strokeStyle = '#1e5a32';
  g.lineWidth = 2;
  g.strokeRect(w * 0.15, h * 0.58, w * 0.7, h * 0.36);
}

/** los bloques de cemento del muro bajo del solar (40 × 20 cm en los 32 m del muro) */
function bloquesGris(g, w, h) {
  g.fillStyle = '#8c8a84';
  g.fillRect(0, 0, w, h);
  const bw = w / 80, bh = h / 2.75;
  g.strokeStyle = 'rgba(60,58,54,.55)';
  g.lineWidth = 1;
  for (let y = 0, f = 0; y < h; y += bh, f++) {
    g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke();
    for (let x = (f % 2) * bw / 2; x < w; x += bw) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + bh); g.stroke(); }
  }
}

// ——— las piezas ———

/** un hueco de n0 a n1 y de y0 a y1 */
const hu = (k, n0, n1, y0, y1, fn, borde, z = ZF + 0.03) => hueco(k, s((n0 + n1) / 2), y0, n1 - n0, y1 - y0, tx(n1 - n0, y1 - y0, fn), { borde, z });
/** una caja pegada a la fachada de n0 a n1 y de y0 a y1, que sale «sale» m */
const caja = (k, n0, n1, y0, y1, sale, color) => k.box(s((n0 + n1) / 2), y0, ZF + sale / 2, n1 - n0, y1 - y0, sale, color);

/** la casa alta del 179 */
function casa179(k) {
  const a = s(N_179), b = s(N_FAR);
  pared(k, a, b, ALTO_179, liso('#f4f3ee'));
  // el remate: el centro más alto y el tramo del norte un poco más que el del sur
  k.box(s(-11.63), ALTO_179, Z + 0.15, 2.48, 0.31, 0.3, BLANCO);
  k.box(s(-8.52), ALTO_179, Z + 0.15, 3.74, 0.1, 0.3, BLANCO);
  caja(k, N_179, N_FAR, 3.55, 3.67, 0.1, 0xe6e4de);
  // los dos portones con la vidriera de arriba y, en medio, la puerta tallada con su escalón
  for (const [n0, n1] of [[-15.88, -13.03], [-10.09, -7.07]]) {
    hu(k, n0, n1, 0, 2.65, portonMarron, MARRON);
    hu(k, n0, n1, 2.65, 2.97, cristales('#5a3a2a', 4), MARRON);
  }
  hu(k, -11.96, -11.16, 0.14, 2.3, tallada('#5e3c2c', '#7a5440'), MARRON);
  hu(k, -11.96, -11.16, 2.3, 2.97, cristales('#5a3a2a', 1), MARRON);
  caja(k, -12.06, -11.06, 0, 0.14, 0.3, 0xb8b4ac);
  // arriba, las tres ventanas de carpintería marrón
  for (const [n0, n1, y0, y1] of [[-15.09, -13.99, 5.87, 7.26], [-12.02, -11.11, 5.34, 6.26], [-9.18, -8.04, 5.93, 7.32]]) {
    hu(k, n0, n1, y0, y1, cristales('#4a3022', 2), 0x4a3022, ZF);
  }
  // los contadores, el buzón y las dos placas de vado
  caja(k, -12.58, -12.09, 0.99, 1.47, 0.12, 0xf0f0ec);
  caja(k, -11.04, -10.64, 0.15, 0.85, 0.14, 0xb8b8b4);
  caja(k, -10.78, -10.57, 1.4, 1.65, 0.1, 0xd8c890);
  for (const n of [-16.26, -12.6]) k.pic(s(n), 2.47, ZF + 0.02, 0.26, 0.32, 0, 1, canvasTex(52, 64, vado));
}

/** la cruz verde de farmacia, de cara a la calle, colgada delante del balcón con su brazo y su tubo */
function cruzVerde(k, x, y, z, xTubo) {
  const verde = 0x2ac84a, borde = 0x1a6a2a;
  k.box(x, y - 0.6, z, 0.42, 1.2, 0.1, borde);
  k.box(x, y - 0.21, z, 1.2, 0.42, 0.1, borde);
  k.box(x, y - 0.55, z, 0.34, 1.1, 0.16, verde);
  k.box(x, y - 0.17, z, 1.1, 0.34, 0.16, verde);
  k.box((x + 0.6 + xTubo) / 2, y - 0.05, z, xTubo - x - 0.6, 0.06, 0.06, 0x2a7a3a);
  k.cyl(xTubo, ALTO_F2, z, 0.035, 0.035, y + 0.2 - ALTO_F2, 0x2a7a3a, { seg: 8 });
}

/** la farmacia: la parte estrecha de dos plantas y la de una planta con el balcón */
function casaFarmacia(k) {
  pared(k, s(N_FAR), s(N_FAR2), ALTO_F1, liso('#f2f2ee'));
  hu(k, -5.84, -4.8, 0, 2.2, puertaBlanca, 0xdcdcd8);
  hu(k, -5.78, -4.95, 4.3, 5.5, cristales('#f2f2ee', 2), 0xf2f2ee, ZF);
  caja(k, N_FAR, N_FAR2, ALTO_F1 - 0.15, ALTO_F1, 0.12, 0xe4e4e0);
  pared(k, s(N_FAR2), s(N_ENA), ALTO_F2, liso('#f2f2ee'));
  // abajo: la cajita blanca, el escaparate con el toldo y la entrada de la escalera con el letrero y el portero
  caja(k, -4.3, -3.95, 0.9, 1.5, 0.12, 0xf0f0ec);
  hu(k, -3.34, -0.62, 1.3, 2.6, escaparate, 0xf0f0ec);
  toldoFarmacia(k, -4.1, -0.6);
  hu(k, 0.52, 2.16, 0, 2.76, entradaEscalera, 0xf0f0ec);
  caja(k, -0.47, -0.12, 1.2, 1.6, 0.06, 0xf0f0ec);
  caja(k, -0.12, 2.37, 3.21, 3.84, 0.08, 0xf6f6f2);
  k.pic(s(1.125), 3.525, ZF + 0.082, 2.45, 0.6, 0, 1, canvasTex(245, 60, letreroFarmacia));
  // arriba: el balcón de obra, la cruz y las varillas
  caja(k, -4.68, 0.34, 3.93, ALTO_F2, 0.4, 0xf4f4f0);
  cruzVerde(k, s(-3.45), 5.85, ZF + 0.62, s(-2.4));
  for (const n of [0.15, 0.3, 2.35, 2.45]) k.cyl(s(n), ALTO_F2, ZF - 0.2, 0.012, 0.012, 0.55, 0x3a3a3a, { seg: 4 });
}

/** el toldo inclinado de la farmacia, con su faldón */
function toldoFarmacia(k, n0, n1) {
  const yPared = 3.09, yFuera = 2.33, sale = 0.9, c = s((n0 + n1) / 2), w = n1 - n0;
  const ang = Math.atan2(yPared - yFuera, sale), largo = Math.hypot(yPared - yFuera, sale);
  const geo = new THREE.BoxGeometry(w, 0.04, largo);
  geo.rotateX(ang);
  geo.translate(c, (yPared + yFuera) / 2, ZF + sale / 2);
  k.add(geo, 0x4a98c4);
  k.box(c, yFuera - 0.26, ZF + sale + 0.01, w, 0.26, 0.02, 0x2a6ab8);
  k.pic(c, yFuera - 0.13, ZF + sale + 0.025, w, 0.26, 0, 1, canvasTex(Math.round(w * 100), 26, faldonFarmacia));
}

/** la casa de Énalta */
function casaEnalta(k) {
  pared(k, s(N_ENA), s(N_BAJA), ALTO_E, liso('#f2f2ee'));
  for (const [n0, n1] of [[N_ENA, 3.31], [4.4, 4.97], [6.69, N_BAJA]]) {
    caja(k, n0, n1, 0, 1.19, 0.06, AZULEJO);
    k.pic(s((n0 + n1) / 2), 0.595, ZF + 0.062, n1 - n0, 1.19, 0, 1, tx(n1 - n0, 1.19, azulejo));
  }
  hu(k, 3.31, 4.4, 0, 2.23, tallada('#3a2618', '#5a3e28'), 0x2a1e18, ZF + 0.07);
  caja(k, 2.65, 3.1, 0.65, 0.95, 0.1, 0xeaeae6);
  hu(k, 4.97, 6.69, 0, 2.76, entradaEscalera, 0xd8d8d4);
  hu(k, 4.97, 6.69, 2.76, 3.21, cristales('#d8d8d4', 1), 0xd8d8d4);
  caja(k, 7.1, 7.89, 1.45, 1.8, 0.03, 0xcdb4dc);
  hu(k, 8.09, 11.24, 1.22, 3.16, cristales('#e8e8e4', 2, 'rgba(240,240,236,.7)'), 0xe8e8e4, ZF + 0.07);
  caja(k, 4.83, 11.67, 3.39, 4.03, 0.06, 0xcdb4dc);
  k.pic(s(8.25), 3.71, ZF + 0.062, 6.8, 0.6, 0, 1, canvasTex(680, 60, letreroEnalta));
  // la losa saliente de arriba y las varillas de la parte alta de la izquierda
  caja(k, 4.65, 12.37, 5.13, ALTO_E, 0.6, 0xf2f2ee);
  for (const n of [2.6, 2.75]) k.cyl(s(n), ALTO_E, ZF - 0.2, 0.012, 0.012, 0.5, 0x3a3a3a, { seg: 4 });
}

/** la casa baja de las ventanas verdes, con las dos habitaciones de arriba metidas hacia atrás */
function casaBaja(k) {
  const a = s(N_BAJA), b = s(N_SUN);
  pared(k, a, b, ALTO_B, liso('#f0efe8'));
  caja(k, N_BAJA, N_SUN, 0, 0.91, 0.06, 0x9a968e);
  k.pic((a + b) / 2, 0.455, ZF + 0.062, b - a, 0.91, 0, 1, tx(b - a, 0.91, piedraGris));
  hu(k, 13.5, 15.94, 0, 2.52, tablasVerdes, VERDE, ZF + 0.07);
  hu(k, 17.15, 19.65, 0.96, 2.09, cristales('#2e7a46', 6, 'rgba(240,238,232,.8)'), VERDE, ZF + 0.07);
  hu(k, 19.66, 20.54, 0, 2.09, puertaVerdeCristal, VERDE, ZF + 0.07);
  hu(k, 22.04, 23.29, 0.96, 2.09, cristales('#2e7a46', 3, 'rgba(240,238,232,.8)'), VERDE, ZF + 0.07);
  caja(k, N_BAJA, N_SUN, ALTO_B - 0.2, ALTO_B, 0.12, 0xe4e2dc);
  // las placas blancas y la cajita amarilla
  caja(k, 12.8, 13.07, 1.97, 2.41, 0.03, 0xf4f4f0);
  caja(k, 16.55, 16.81, 1.85, 2.2, 0.03, 0xf4f4f0);
  caja(k, 20.83, 21.19, 2.09, 2.45, 0.1, 0xe8c040);
  // las dos habitaciones de arriba, metidas 3,25 m, cada una con su ventana verde
  const atras = 3.25, hondo = FONDO - atras - 0.3;
  for (const [n0, n1, alto, v0, v1, y0, y1] of [[16.63, 20.37, 6.76, 17.9, 19.0, 4.55, 5.63], [20.37, 24.32, 6.03, 21.9, 23.35, 4.3, 5.04]]) {
    const x0 = s(n0), x1 = s(n1);
    k.box((x0 + x1) / 2, ALTO_B - 0.3, -atras - hondo / 2, x1 - x0, alto - ALTO_B + 0.3, hondo, 0xf0efe8);
    k.box((x0 + x1) / 2, alto, -atras - hondo / 2, x1 - x0 + 0.05, 0.1, hondo + 0.05, 0xe4e2dc);
    hu(k, v0, v1, y0, y1, cristales('#2e7a46', 2), VERDE, -atras);
  }
}

/** el muro bajo de bloques del solar, por delante, de la casa del 179 a la del 175 */
function muroSolar(k) {
  const a = s(N_SOLAR), b = s(N_179), alto = 0.55;
  k.box((a + b) / 2, 0, 0.1, b - a, alto, 0.2, 0x8a8884);
  k.pic((a + b) / 2, alto / 2, 0.204, b - a, alto, 0, 1, canvasTex(1024, 18, bloquesGris));
  k.box((a + b) / 2, alto, 0.1, b - a + 0.04, 0.05, 0.26, 0xa8a6a0);
  k.block((a + b) / 2, 0.1, b - a, 0.2);
}

/** se monta con lo demás */
export function buildFarmaciaEnalta(scene, colliders, map) {
  if (!map?.farmaciaEnalta) return null;
  const k = new Kit(), ks = new Kit();
  casa179(k);
  casaFarmacia(k);
  casaEnalta(k);
  casaBaja(k);
  muroSolar(ks);
  const grupos = [enMarco(k, F, 'farmaciaEnalta', colliders), enMarco(ks, F, 'farmaciaEnaltaSolar', colliders)];
  // las paredes de los lados y de atrás que asoman: la del solar blanca, la medianera del 179 sin pintar, las demás lisas
  const lisa = (A, B, alto, nombre, color = '#ecebe6') => tira(A, B, alto, nombre, colliders, (kk, L) => pared(kk, 0, L, alto, liso(color), -0.25));
  grupos.push(lisa(P(N_179, FONDO_179), P(N_179), ALTO_179, 'casa179LadoSolar', '#efeee9'));
  grupos.push(lisa(P(N_FAR), P(N_FAR, FONDO_179), ALTO_179, 'casa179Medianera', '#cbb898'));
  grupos.push(lisa(P(N_FAR, FONDO_179), P(N_179, FONDO_179), ALTO_179, 'casa179Trasera'));
  grupos.push(lisa(P(N_FAR2), P(N_FAR2, FONDO), ALTO_F1, 'farmaciaLadoNorte'));
  grupos.push(lisa(P(N_FAR2, FONDO), P(N_FAR, FONDO), ALTO_F1, 'farmaciaTrasera'));
  grupos.push(lisa(P(N_ENA, FONDO), P(N_FAR2, FONDO), ALTO_F2, 'farmaciaTraseraBaja'));
  grupos.push(lisa(P(N_ENA, FONDO), P(N_ENA), ALTO_E, 'enaltaLadoSur'));
  grupos.push(lisa(P(N_BAJA), P(N_BAJA, FONDO), ALTO_E, 'enaltaLadoNorte'));
  grupos.push(lisa(P(N_BAJA, FONDO), P(N_ENA, FONDO), ALTO_E, 'enaltaTrasera'));
  for (const g of grupos) scene.add(g);
  const suelo = paveMesh(trocear(polyTris(SOLAR), 2), 0.18, tierraParda(), 0xf0e4d4);
  if (suelo) { suelo.name = 'farmaciaEnaltaSolarTierra'; scene.add(suelo); }
  return { grupos, suelo };
}
