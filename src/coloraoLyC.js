import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco, trocear } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';
import { paveMesh, polyTris, lightSlabs } from './suelos.js';
import { Z, ZF, pared, tira, tierraParda } from './rapadurasSur.js';
import { tuneCompafricLyC } from './compafricLyC.js';

/**
 * El resto de la acera de León y Castillo al sur de El Túnel (la LZ-1, Altavista), de Compafric al solar de la esquina,
 * con las vistas de la calle de Google de julio de 2025 (LZ-1 159 a 151; solo se miran, no van dentro del juego),
 * medidas con el foco bueno de las capturas (475 px) y con las medianeras del plano del Catastro (manzana 17575). En
 * el mapa era el bloque genérico de 4 m, y el solar no tenía nada. De verdad:
 * - el 159: la casa del zócalo de piedra gris azulada, con la ventana, la puerta y el ventanal verdes, y arriba la
 *   terraza con las jardineras blancas y la baranda verde, y la planta de arriba metida;
 * - el 157: la casa blanca de la espadaña con los dos ojos de buey, la puerta verde, el portón de chapa del garaje, el
 *   cuerpo saliente con la ventana verde, las contraventanas verdes y la baranda verde de celosía de la azotea;
 * - el 155, OTIS (ascensores): el zócalo gris oscuro, el escaparate con el nombre, el letrero azul y blanco, la puerta
 *   de cristal, la puerta blanca del portal y los dos cuerpos salientes de arriba con las ventanas blancas;
 * - el callejón de tierra que atraviesa la manzana, entre las paredes blancas de OTIS y del bar;
 * - la Cafetería Churrería El Colorao: la casa de tres plantas, con el zócalo de plaqueta, la puerta del bar, las
 *   ventanas de celosía, el toldillo, el cartel rojo (solo el nombre, sin la marca del refresco), el aparato del aire,
 *   el portal de madera, el balcón corrido y el antepecho de la segunda planta con la baranda de la azotea;
 * - el solar de tierra de la esquina, con el muro corto, la cancela de barrotes y el muro de grafitis.
 * Las fachadas van como en el Catastro, a ras de Compafric en el norte y metiéndose poco a poco hacia el sur. Las
 * palmeras que el juego plantaba al azar dentro de las casas y del solar se esconden.
 */

// la cara de León y Castillo: a hacia el sur desde la esquina de Padre Claret (la de El Túnel), b hacia dentro
const C = [378.37 + 0.166579 * 1.9, -1299.89 - 0.98603 * 1.9];
const US = [-0.166579, 0.98603], E = [0.98605, 0.166412];
const P = (a, b = 0) => [C[0] + US[0] * a - E[0] * b, C[1] + US[1] * a - E[1] * b];
const A159 = 62.58, A157 = 70.85, AOTIS = 78.65, APAS = 88.63, ABAR = 96.5, AFIN = 105.8, ABLOQUE = 112;
const FONDO = 24.18, FONDO159 = 13.1, TERRAZA = 2.1;
// lo que se mete cada fachada (como en el Catastro)
const M157 = 0.2, MOTIS = 0.4, MBAR = 0.9;
const ALTO159 = 4.0, ALTO159A = 7.2, ALTO157 = 7.15, ALTO_OTIS = 8.5, ALTO_BAR = 8.5;
// el solar de la esquina (a, b), hasta el borde de las calles del mapa
const SOLAR = [[AFIN, 0.5], [118, 0.5], [128, 5.5], [132, 10.5], [134.5, 20], [134, FONDO], [AFIN, FONDO]];
// el marco va del sur al norte, con la calle delante
const F = marco(P(AFIN), P(A159));
const s = a => AFIN - a;

const BLANCO = '#f2f1ec', CREMA_BAR = '#ece2cc';

/** antes de levantar la ciudad: las casas salen de lo que queda del bloque genérico de 4 m (después de Compafric) */
export function tuneColoraoLyC(map) {
  if (!Array.isArray(map?.buildings)) return;
  if (!map.compafricLyC) tuneCompafricLyC(map);
  const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const r = q => [+q[0].toFixed(2), +q[1].toFixed(2)];
  const libre = q => !q.skip && !q.edificioReal && Array.isArray(q.p);
  const A = P(A159), B = P(ABLOQUE), Bd = P(ABLOQUE, FONDO);
  const b = map.buildings.find(q => libre(q) && q.p.some(p => d(p, A) < 0.3) && q.p.some(p => d(p, B) < 0.5) && q.p.some(p => d(p, Bd) < 0.5));
  if (!b) return;
  // el bloque se queda solo con lo de detrás del 159: [A, B, Bd] pasa a ser [P(A159, 13,1), P(A157, 13,1), P(A157, FONDO)]
  const nuevo = [P(A159, FONDO159), P(A157, FONDO159), P(A157, FONDO)].map(r);
  const i = b.p.findIndex(p => d(p, A) < 0.3);
  if (b.p[i + 1] && d(b.p[i + 1], B) < 0.5) b.p.splice(i, 3, ...nuevo);
  else if (i >= 2 && d(b.p[i - 1], B) < 0.5) b.p.splice(i - 2, 3, ...nuevo.reverse());
  else return;
  if (d(b.p[0], b.p[b.p.length - 1]) > 0.01) b.p[b.p.length - 1] = b.p[0].slice();
  // (al revés, para que den la vuelta como los bloques del mapa)
  const casa = (a0, a1, b0, b1, h, f, c = [200, 196, 188]) => {
    const p = [P(a0, b0), P(a0, b1), P(a1, b1), P(a1, b0)].map(r).reverse();
    p.push(p[0].slice());
    map.buildings.push({ p, h, k: 'gen', s: 0, f, c, edificioReal: true });
  };
  const blanca = [242, 241, 236], crema = [236, 226, 204];
  casa(A159, A157, 0, TERRAZA, ALTO159, blanca);
  casa(A159, A157, TERRAZA, FONDO159, ALTO159A, blanca);
  casa(A157, AOTIS, M157, FONDO, ALTO157, blanca);
  casa(AOTIS, APAS, MOTIS, FONDO, ALTO_OTIS, blanca);
  casa(ABAR, AFIN, MBAR, FONDO, ALTO_BAR, crema);
  map.coloraoLyC = true;
}

// ——— las texturas ———

const liso = color => (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); };
const tx = (w, h, fn) => canvasTex(Math.max(16, Math.min(1024, Math.round(w * 60))), Math.max(16, Math.round(h * 60)), fn);

/** un zócalo de placas de piedra, del color que se pida */
const placasPiedra = (color, junta) => (g, w, h) => {
  g.fillStyle = junta;
  g.fillRect(0, 0, w, h);
  const ph = h / 3, pw = ph * 1.7;
  for (let j = 0; j * ph < h; j++) {
    for (let x = (j % 2) * -pw / 2; x < w; x += pw) {
      g.fillStyle = color;
      g.globalAlpha = 0.85 + ((j * 13 + Math.round(x)) % 7) * 0.02;
      g.fillRect(x + 1.5, j * ph + 1.5, pw - 3, ph - 3);
    }
  }
  g.globalAlpha = 1;
};

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

/** una puerta verde con cristales arriba (la del 159) */
function puertaVerdeCristal(g, w, h) {
  g.fillStyle = '#3a7448';
  g.fillRect(0, 0, w, h);
  cristales('#3a7448', 1, 'rgba(220,226,220,.4)')(g, w, h * 0.55);
  g.strokeStyle = '#4e8a5c';
  g.lineWidth = 3;
  g.strokeRect(w * 0.15, h * 0.62, w * 0.7, h * 0.3);
}

/** el portón de chapa ondulada del garaje del 157 */
function chapaGaraje(g, w, h) {
  g.fillStyle = '#8a9286';
  g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 6) {
    g.fillStyle = 'rgba(255,255,255,.10)';
    g.fillRect(x, 0, 2, h);
    g.fillStyle = 'rgba(0,0,0,.18)';
    g.fillRect(x + 3, 0, 2, h);
  }
  g.fillStyle = 'rgba(150,110,70,.18)';
  g.fillRect(0, h * 0.7, w, h * 0.3);
  g.fillStyle = '#5e665c';
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

/** el escaparate de OTIS: el cristal con el nombre arriba */
function escaparateOtis(g, w, h) {
  cristales('#f2f2ee', 1, 'rgba(60,70,90,.0)')(g, w, h);
  g.fillStyle = 'rgba(210,220,236,.75)';
  g.fillRect(4, 4, w - 8, h * 0.42);
  g.fillStyle = '#2a4a9a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 900 ${Math.round(h * 0.2)}px "Arial Black", Arial, sans-serif`;
  g.fillText('OTIS', w / 2, h * 0.22, w * 0.85);
}

/** el letrero de OTIS: la caja azul con el nombre y la franja blanca con lo que hacen */
function letreroOtis(g, w, h) {
  const corte = w * (87.0 - 85.65) / (87.0 - 82.07);
  g.fillStyle = '#f2f2f0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#2f55a8';
  g.fillRect(0, 0, corte, h);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#f4f4f4';
  g.font = `italic 900 ${Math.round(h * 0.62)}px "Arial Black", Arial, sans-serif`;
  g.fillText('OTIS', corte / 2, h * 0.54, corte * 0.86);
  g.fillStyle = '#2f55a8';
  g.font = `italic bold ${Math.round(h * 0.26)}px Arial, sans-serif`;
  g.fillText('ASCENSORES · MONTACARGAS · ESCALERAS MECÁNICAS', (corte + w) / 2, h * 0.52, (w - corte) * 0.94);
}

/** la ventana de la persiana blanca de OTIS: la persiana arriba y el cristal abajo */
function ventanaPersiana(g, w, h) {
  cristales('#f2f2ee', 1, 'rgba(60,70,90,.0)')(g, w, h);
  g.fillStyle = '#ecebe6';
  g.fillRect(3, 3, w - 6, h * 0.48);
  g.strokeStyle = '#c8c6c0';
  g.lineWidth = 1;
  for (let y = 6; y < h * 0.5; y += 4) { g.beginPath(); g.moveTo(3, y); g.lineTo(w - 3, y); g.stroke(); }
}

/** una puerta de cristal con el montante oscuro */
function puertaCristal(g, w, h) {
  cristales('#e8e8e4', 1, 'rgba(60,70,90,.0)')(g, w, h);
  g.fillStyle = '#1e2430';
  g.fillRect(4, 4, w - 8, h * 0.3);
  g.fillStyle = '#e8e8e4';
  g.fillRect(0, h * 0.31, w, 4);
}

/** la puerta blanca del portal de OTIS, con el rombo */
function puertaRombo(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#cfcdc6';
  g.lineWidth = 3;
  g.strokeRect(w * 0.12, h * 0.06, w * 0.76, h * 0.88);
  for (const k of [0.32, 0.22]) {
    g.beginPath();
    g.moveTo(w / 2, h * (0.62 - k * 0.5)); g.lineTo(w * (0.5 + k), h * 0.62); g.lineTo(w / 2, h * (0.62 + k * 0.5)); g.lineTo(w * (0.5 - k), h * 0.62); g.closePath();
    g.stroke();
  }
}

/** la puerta del bar, abierta: lo oscuro de dentro y la barra al fondo */
function puertaBar(g, w, h) {
  g.fillStyle = '#1c1a18';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#3a2e24';
  g.fillRect(w * 0.1, h * 0.55, w * 0.8, h * 0.2);
  g.fillStyle = 'rgba(255,220,160,.25)';
  g.fillRect(w * 0.15, h * 0.2, w * 0.7, h * 0.06);
  g.fillStyle = '#6a5a48';
  g.fillRect(0, 0, w * 0.06, h);
  g.fillRect(w * 0.94, 0, w * 0.06, h);
}

/** las rejas de celosía blanca de las ventanas del bar */
function celosiaBar(g, w, h) {
  g.fillStyle = '#2a2a2c';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#efefec';
  g.lineWidth = 1.5;
  const t = w / 8;
  for (let k = -h; k < w + h; k += t) {
    g.beginPath(); g.moveTo(k, 0); g.lineTo(k + h, h); g.stroke();
    g.beginPath(); g.moveTo(k, 0); g.lineTo(k - h, h); g.stroke();
  }
  g.strokeStyle = '#f2f2ee';
  g.lineWidth = 4;
  g.strokeRect(2, 2, w - 4, h - 4);
}

/** el cartel rojo del bar: solo el nombre (sin la marca del refresco) */
function cartelColorao(g, w, h) {
  g.fillStyle = '#c8262c';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#f2ece6';
  g.lineWidth = 3;
  g.strokeRect(3, 3, w - 6, h - 6);
  g.fillStyle = '#f6f2ee';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `bold ${Math.round(h * 0.24)}px Arial, sans-serif`;
  g.fillText('Cafetería', w / 2, h * 0.24, w * 0.8);
  g.fillText('Churrería', w / 2, h * 0.5, w * 0.8);
  g.fillText('El Colorao', w / 2, h * 0.76, w * 0.8);
}

/** el aparato del aire acondicionado: la caja con el ventilador */
function aparatoAire(g, w, h) {
  g.fillStyle = '#e6e2da';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#7a756c';
  g.beginPath(); g.arc(w * 0.42, h / 2, h * 0.36, 0, 7); g.fill();
  g.strokeStyle = '#4a463e';
  g.lineWidth = 2;
  for (let k = 0; k < 6; k++) { const an = k * Math.PI / 3; g.beginPath(); g.moveTo(w * 0.42, h / 2); g.lineTo(w * 0.42 + Math.cos(an) * h * 0.34, h / 2 + Math.sin(an) * h * 0.34); g.stroke(); }
}

/** el portal de madera del bar, con los cristales */
function portalMadera(g, w, h) {
  g.fillStyle = '#5e5141';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#2a2e32';
  for (let j = 0; j < 4; j++) for (let i = 0; i < 2; i++) g.fillRect(w * (0.14 + i * 0.4), h * (0.08 + j * 0.15), w * 0.32, h * 0.12);
  g.fillStyle = '#4a3f32';
  g.fillRect(w * 0.12, h * 0.7, w * 0.76, h * 0.24);
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

/** el muro del solar con los grafitis (manchas y letras gordas sin leer) */
function muroGrafiti(g, w, h) {
  g.fillStyle = '#b8b09c';
  g.fillRect(0, 0, w, h);
  let semilla = 7;
  const rnd = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
  for (let x = 0; x < w; x += h * 1.6) {
    if (rnd() < 0.35) continue;
    const cx = x + rnd() * h, cy = h * (0.35 + rnd() * 0.3), r = h * (0.25 + rnd() * 0.2);
    const col = ['#e8d27a', '#d8cfa8', '#9ab0c8', '#e6e2d8'][Math.floor(rnd() * 4)];
    g.fillStyle = col;
    for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(cx + k * r * 0.9, cy + (k % 2) * r * 0.2, r * 0.55, r, 0.2, 0, 7); g.fill(); }
    g.strokeStyle = '#3a3630';
    g.lineWidth = Math.max(2, h * 0.04);
    for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(cx + k * r * 0.9, cy + (k % 2) * r * 0.2, r * 0.55, r, 0.2, 0, 7); g.stroke(); }
  }
  g.fillStyle = 'rgba(0,0,0,.08)';
  g.fillRect(0, h * 0.85, w, h * 0.15);
}

// ——— las piezas ———

/** un hueco de a0 a a1 y de y0 a y1 */
const hu = (k, a0, a1, y0, y1, fn, borde, z = ZF + 0.04) =>
  hueco(k, s((a0 + a1) / 2), y0, Math.abs(a1 - a0), y1 - y0, tx(Math.abs(a1 - a0), y1 - y0, fn), { borde, z });
/** una caja pegada a la fachada de a0 a a1 y de y0 a y1, que sale «sale» m */
const caja = (k, a0, a1, y0, y1, sale, color, z = ZF) => k.box(s((a0 + a1) / 2), y0, z + sale / 2, Math.abs(a1 - a0), y1 - y0, sale, color);
/** una imagen pegada a la fachada */
const cuadro = (k, a0, a1, y0, y1, z, fn) =>
  k.pic(s((a0 + a1) / 2), (y0 + y1) / 2, z, Math.abs(a1 - a0), y1 - y0, 0, 1, tx(Math.abs(a1 - a0), y1 - y0, fn));
/** una baranda de tubo de a0 a a1, de y0 a y1, a la distancia z */
const baranda = (k, a0, a1, y0, y1, z, color, paso = 0.6) => {
  k.box(s((a0 + a1) / 2), y1 - 0.05, z, Math.abs(a1 - a0), 0.05, 0.05, color);
  k.box(s((a0 + a1) / 2), (y0 + y1) / 2, z, Math.abs(a1 - a0), 0.03, 0.03, color);
  for (let a = Math.min(a0, a1); a <= Math.max(a0, a1) + 0.01; a += paso) k.box(s(a), y0, z, 0.04, y1 - y0, 0.04, color);
};

const VERDE = 0x2f6a3c;

/** el 159: abajo la casa, arriba la terraza con las jardineras y la planta metida */
function casa159(k) {
  pared(k, s(A157), s(A159), ALTO159, liso(BLANCO));
  caja(k, A159, A157, 0, 1.4, 0.04, 0x8796a2);
  cuadro(k, A159, A157, 0, 1.4, ZF + 0.042, placasPiedra('#94a3ae', '#6e7c86'));
  hu(k, 67.9, 69.5, 1.42, 2.62, cristales('#3a7448', 2, 'rgba(230,232,226,.55)'), VERDE);
  hu(k, 65.52, 66.4, 0.04, 2.6, puertaVerdeCristal, VERDE);
  hu(k, 63.3, 65.5, 1.4, 2.6, cristales('#3a7448', 3, 'rgba(230,232,226,.4)'), VERDE);
  caja(k, 62.75, 63.57, 0.5, 0.88, 0.12, 0xeeeeea);
  // el pretil de la terraza, las jardineras blancas con sus matas y la baranda verde
  caja(k, A159, A157, ALTO159 - 0.1, ALTO159, 0.08, 0xe6e4de);
  for (const [a0, a1] of [[64.15, 66.8], [67.6, 70.0]]) {
    caja(k, a0, a1, ALTO159, ALTO159 + 0.5, 0.3, 0xf0efea, ZF - 0.15);
    for (let a = a0 + 0.3; a < a1; a += 0.55) k.box(s(a), ALTO159 + 0.5, ZF, 0.3, 0.25, 0.25, 0x5a8a3c);
  }
  for (const [a0, a1] of [[63.9, 66.75], [67.85, 69.9]]) baranda(k, a0, a1, ALTO159 + 0.5, ALTO159 + 1.2, ZF - 0.25, VERDE);
  // la planta de arriba, metida TERRAZA m, con la puerta y la ventana verdes que dan a la terraza
  pared(k, s(A157), s(A159), ALTO159A, liso(BLANCO), Z - TERRAZA);
  hu(k, 68.0, 69.6, ALTO159 + 0.2, 6.3, cristales('#3a7448', 2, 'rgba(230,232,226,.5)'), VERDE, ZF - TERRAZA + 0.04);
  hu(k, 65.9, 66.75, ALTO159 + 0.2, 6.3, cristales('#3a7448', 1, 'rgba(230,232,226,.5)'), VERDE, ZF - TERRAZA + 0.04);
  caja(k, A159, A157, ALTO159A - 0.1, ALTO159A, 0.08, 0xe6e4de, ZF - TERRAZA);
}

/** el 157: la espadaña con los ojos de buey, el portón del garaje y el cuerpo saliente */
function casa157(k) {
  const z = ZF - M157;
  pared(k, s(AOTIS), s(A157), ALTO157, liso(BLANCO), Z - M157);
  caja(k, A157, AOTIS, 3.55, 3.62, 0.05, 0xe2e0da, z);
  // la espadaña: el remate que sube y el arco de encima
  k.box(s((A157 + 73.2) / 2), ALTO157, z - 0.15, 73.2 - A157, 8.23 - ALTO157, 0.3, 0xf4f3ee);
  k.cyl(s(72.1), 8.23, z - 0.3, 0.86, 0.86, 0.29, 0xf4f3ee, { seg: 28, rx: Math.PI / 2 });
  k.box(s((A157 + 73.2) / 2), 8.17, z - 0.12, 73.2 - A157 + 0.1, 0.07, 0.36, 0xe4e2dc);
  for (const y of [7.0, 4.3]) {
    k.cyl(s(72.1), y, z + 0.02, 0.38, 0.38, 0.05, 0x3e7a52, { seg: 24, rx: Math.PI / 2 });
    k.cyl(s(72.1), y, z + 0.05, 0.31, 0.31, 0.03, 0x2a3036, { seg: 24, rx: Math.PI / 2 });
  }
  hu(k, 71.72, 72.54, 0.04, 2.18, puertaTableros('#4e7a4c', '#64905e'), 0x3e6a40, z + 0.04);
  hu(k, 74.45, 77.2, 0.06, 3.02, chapaGaraje, 0x4a4e48, z + 0.04);
  for (const [a0, a1, y0, y1] of [[73.85, 74.39, 0.75, 1.28], [73.3, 73.65, 1.55, 1.85], [72.7, 73.05, 1.5, 1.85]]) caja(k, a0, a1, y0, y1, 0.12, 0xeceae4, z);
  // el cuerpo saliente de la izquierda, con la ventana verde, y las contraventanas del medio
  caja(k, 75.6, AOTIS, 3.6, ALTO157, 0.35, 0xf2f1ec, z);
  hu(k, 76.1, 78.25, 4.97, 6.24, cristales('#3a7448', 3, 'rgba(40,50,60,.25)'), VERDE, z + 0.35);
  hu(k, 73.9, 75.05, 4.75, 6.07, lamas('#3e7a4e', '#2a5838'), VERDE, z + 0.02);
  // la azotea: los machones y la baranda verde de celosía
  for (const [a0, a1] of [[78.0, AOTIS], [75.0, 75.7], [72.9, 73.4]]) caja(k, a0, a1, ALTO157, 7.8, 0.3, 0xf2f1ec, z - 0.3);
  for (const [a0, a1] of [[75.7, 78.0], [73.4, 75.0]]) baranda(k, a0, a1, ALTO157, 7.7, z - 0.15, 0x2f6a3c, 0.15);
}

/** el 155, OTIS */
function otis(k) {
  const z = ZF - MOTIS;
  pared(k, s(APAS), s(AOTIS), ALTO_OTIS, liso(BLANCO), Z - MOTIS);
  caja(k, AOTIS, APAS, 0, 2.36, 0.04, 0x5f5f5c, z);
  cuadro(k, AOTIS, APAS, 0, 2.36, z + 0.042, placasPiedra('#62625e', '#4a4a48'));
  hu(k, 84.85, 86.8, 1.07, 3.54, escaparateOtis, 0xf2f2ee, z + 0.04);
  caja(k, 82.07, 87.0, 3.84, 4.43, 0.06, 0xf2f2f0, z);
  k.pic(s((82.07 + 87.0) / 2), (3.84 + 4.43) / 2, z + 0.062, 87.0 - 82.07, 4.43 - 3.84, 0, 1, canvasTex(820, 98, letreroOtis));
  hu(k, 81.82, 82.84, 1.07, 3.54, ventanaPersiana, 0xf2f2ee, z + 0.04);
  hu(k, 80.7, 81.75, 0.02, 3.54, puertaCristal, 0xe8e8e4, z + 0.04);
  hu(k, 79.2, 80.1, 2.43, 3.54, cristales('#e8e8e4', 1, 'rgba(30,36,48,.6)'), 0xe8e8e4, z + 0.04);
  hu(k, 79.15, 80.1, 0.04, 2.24, puertaRombo, 0xf2f2ee, z + 0.04);
  caja(k, 78.68, 79.0, 1.43, 1.8, 0.12, 0x3a3a38, z);
  for (const [a0, a1] of [[83.45, 84.05], [82.24, 82.95]]) caja(k, a0, a1, 0.3, 0.88, 0.14, 0xeceae4, z);
  // el letrerito de bandera, azul y blanco
  k.box(s(80.36), 3.4, z + 0.35, 0.06, 1.0, 0.6, 0x2f55a8);
  // arriba: los dos cuerpos salientes con las ventanas blancas (el grande con la baranda blanca)
  for (const [a0, a1] of [[83.0, 87.2], [80.2, 82.3]]) {
    caja(k, a0, a1, 4.5, 9.5, 0.4, 0xf2f1ec, z);
    caja(k, a0, a1, ALTO_OTIS, 9.5, 3.0, 0xf2f1ec, z - 3.0);
  }
  hu(k, 83.45, 87.15, 5.8, 7.6, cristales('#f2f2ee', 4, 'rgba(40,50,60,.2)'), 0xf2f2ee, z + 0.4);
  for (let y = 5.85; y < 6.3; y += 0.11) caja(k, 83.45, 87.15, y, y + 0.04, 0.1, 0xf2f2ee, z + 0.42);
  hu(k, 80.5, 82.05, 5.97, 7.78, cristales('#f2f2ee', 2, 'rgba(230,226,215,.45)'), 0xf2f2ee, z + 0.4);
  caja(k, AOTIS, APAS, ALTO_OTIS - 0.1, ALTO_OTIS, 0.06, 0xe6e4de, z);
}

/** la Cafetería Churrería El Colorao y su casa de tres plantas */
function colorao(k) {
  const z = ZF - MBAR;
  pared(k, s(AFIN), s(ABAR), ALTO_BAR, liso(CREMA_BAR), Z - MBAR);
  caja(k, ABAR, AFIN, 0, 0.97, 0.04, 0xcca284, z);
  cuadro(k, ABAR, AFIN, 0, 0.97, z + 0.042, placasPiedra('#d4aa8c', '#b08a70'));
  hu(k, 98.91, 100.56, 0.02, 2.15, puertaBar, 0x8a8a86, z + 0.04);
  for (const [a0, a1] of [[100.67, 101.48], [97.96, 98.84]]) hu(k, a0, a1, 0.97, 2.15, celosiaBar, 0xf2f2ee, z + 0.04);
  // el toldillo de aluminio, el cartel rojo y el aparato del aire
  caja(k, 97.92, 101.62, 2.18, 2.57, 0.6, 0xb8bcc0, z);
  caja(k, 98.1, 101.42, 2.79, 3.63, 0.35, 0xc8262c, z);
  cuadro(k, 98.1, 101.42, 2.79, 3.63, z + 0.352, cartelColorao);
  caja(k, 102.2, 103.35, 2.92, 3.86, 0.3, 0xe6e2da, z);
  cuadro(k, 102.2, 103.35, 2.92, 3.86, z + 0.302, aparatoAire);
  // el portal de madera, la placa de la calle y las ventanitas de la escalera
  hu(k, 104.46, 105.32, 0.04, 2.05, portalMadera, 0x4a3f32, z + 0.04);
  caja(k, 104.83, 105.31, 2.15, 2.42, 0.03, 0x2a4aa8, z);
  cuadro(k, 104.83, 105.31, 2.15, 2.42, z + 0.032, placaCalle);
  hu(k, 104.55, 105.27, 2.66, 3.29, cristales('#5e5141', 1, 'rgba(40,50,60,.3)'), 0x5e5141, z + 0.04);
  hu(k, 104.3, 105.3, 6.02, 6.73, cristales('#5e5141', 2, 'rgba(40,50,60,.3)'), 0x5e5141, z + 0.04);
  // el balcón corrido: el antepecho macizo y la baranda oscura con los cristales esmerilados
  caja(k, 96.4, 104.1, 3.94, 4.9, 1.0, 0xeee6d2, z);
  k.box(s(100.25), 4.9, z + 0.92, 7.7, 0.04, 0.06, 0x4a3e32);
  k.box(s(100.25), 5.5, z + 0.92, 7.7, 0.05, 0.08, 0x4a3e32);
  for (let a = 96.5; a <= 104.05; a += 1.26) k.box(s(a), 4.9, z + 0.92, 0.05, 0.6, 0.05, 0x4a3e32);
  k.pic(s(100.25), 5.2, z + 0.9, 7.6, 0.5, 0, 1, tx(7.6, 0.5, liso('#cfd4d6')));
  for (const [a0, a1] of [[100.74, 102.69], [97.9, 99.78]]) hu(k, a0, a1, 4.9, 6.3, cristales('#5e5141', 2, 'rgba(60,60,60,.35)'), 0x5e5141, z + 0.04);
  // la segunda planta: el antepecho grande que sale y la baranda de la azotea
  caja(k, 96.3, 104.0, 6.5, ALTO_BAR, 1.0, 0xeee6d2, z);
  caja(k, 96.3, 104.0, 6.44, 6.5, 1.04, 0xd8ccb4, z);
  baranda(k, 96.4, 103.9, ALTO_BAR, ALTO_BAR + 0.4, z + 0.85, 0x5a4636, 0.9);
}

/** las palmeras que el juego planta al azar a unos metros de las calles grandes y que caen donde se le diga: se
 * esconden (el juego las planta después de montar los barrios, así que se vuelve a mirar hasta que estén) */
export function sinPalmasDentro(scene, dentro, veces = 40) {
  let tronco = null;
  scene.traverse(o => {
    if (!tronco && o.isInstancedMesh && o.geometry?.type === 'CylinderGeometry' && o.material?.color?.getHex?.() === 0xd8bc94) tronco = o;
  });
  if (!tronco) {
    if (veces > 0) setTimeout(() => sinPalmasDentro(scene, dentro, veces - 1), 1000);
    return 0;
  }
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

/** si un punto (a, b) cae dentro de un polígono en (a, b) */
function enPoligono(a, b, poli) {
  let dentro = false;
  for (let i = 0, j = poli.length - 1; i < poli.length; j = i++) {
    const [ai, bi] = poli[i], [aj, bj] = poli[j];
    if ((bi > b) !== (bj > b) && a < ((aj - ai) * (b - bi)) / (bj - bi) + ai) dentro = !dentro;
  }
  return dentro;
}

/** se monta con lo demás */
export function buildColoraoLyC(scene, colliders, map) {
  if (!map?.coloraoLyC) return null;
  const k = new Kit();
  casa159(k);
  casa157(k);
  otis(k);
  colorao(k);
  const grupos = [enMarco(k, F, 'coloraoLyC', colliders)];
  // las paredes de los lados y de atrás que asoman: el lado del 157 sobre la terraza del 159, las paredes blancas del
  // callejón, el lado del bar sobre el solar y las traseras de la calle de atrás
  const lisa = (A, B, alto, nombre, color = '#ecebe6') => tira(A, B, alto, nombre, colliders, (kk, L) => pared(kk, 0, L, alto, liso(color), -0.25));
  grupos.push(lisa(P(A157, M157), P(A157, TERRAZA), ALTO157, 'casa157LadoTerraza'));
  grupos.push(lisa(P(APAS, FONDO), P(APAS, MOTIS), ALTO_OTIS, 'otisLadoCallejon', '#efeee9'));
  grupos.push(lisa(P(ABAR, MBAR), P(ABAR, FONDO), ALTO_BAR, 'coloraoLadoCallejon', '#efede6'));
  grupos.push(lisa(P(AFIN, FONDO), P(AFIN, MBAR), ALTO_BAR, 'coloraoLadoSolar', '#e2ddd0'));
  grupos.push(lisa(P(A157, FONDO), P(AOTIS, FONDO), ALTO157, 'casa157Trasera'));
  grupos.push(lisa(P(AOTIS, FONDO), P(APAS, FONDO), ALTO_OTIS, 'otisTrasera'));
  grupos.push(lisa(P(ABAR, FONDO), P(AFIN, FONDO), ALTO_BAR, 'coloraoTrasera', '#e6ddc8'));
  // el solar de la esquina: el muro corto, la cancela de barrotes y el muro de los grafitis por la calle
  const sp = ([a, b]) => P(a, b);
  grupos.push(tira(P(107.2, 0.5), P(AFIN, 0.5), 1.9, 'solarMuroCorto', colliders, (kk, L) => pared(kk, 0, L, 1.9, liso('#c8bca6'), -0.25)));
  grupos.push(tira(P(110.9, 0.5), P(107.2, 0.5), 2.25, 'solarCancela', colliders, (kk, L) => {
    kk.box(L / 2, 0, 0, L, 0.12, 0.08, 0x8a8a86);
    kk.box(L / 2, 2.15, 0, L, 0.06, 0.06, 0x8a8a86);
    kk.box(L / 2, 1.1, 0, L, 0.04, 0.04, 0x8a8a86);
    for (let x = 0.05; x < L; x += 0.13) kk.box(x, 0, 0, 0.035, 2.25, 0.035, 0x9a9a96);
    kk.block(L / 2, 0, L, 0.1);
  }));
  const muro = [[118, 0.5], [110.9, 0.5]];
  for (let i = 1; i < SOLAR.length - 1; i++) muro.unshift(SOLAR[i + 1]);
  for (let i = 0; i < muro.length - 1; i++) {
    grupos.push(tira(sp(muro[i]), sp(muro[i + 1]), 1.5, 'solarMuro' + i, colliders, (kk, L) => pared(kk, 0, L, 1.5, muroGrafiti, -0.25)));
  }
  for (const g of grupos) scene.add(g);
  // los suelos: las losetas de la acera delante del callejón y del bar, la tierra del callejón y la del solar
  const suelos = [];
  const pon = (nombre, poli, tex, color, y = 0.18) => {
    const m = paveMesh(trocear(polyTris(poli.map(sp)), 1.5), y, tex, color);
    if (m) { m.name = nombre; scene.add(m); suelos.push(m); }
  };
  pon('coloraoAcera', [[APAS, 0], [AFIN, 0], [AFIN, MBAR], [APAS, MBAR]], lightSlabs(), 0xe6dccb);
  pon('coloraoCallejonTierra', [[APAS, MBAR], [ABAR, MBAR], [ABAR, FONDO], [APAS, FONDO]], tierraParda(), 0xd8d0c4);
  pon('coloraoSolarTierra', SOLAR, tierraParda(), 0xd8d0c4);
  // las palmeras al azar que caen dentro de las casas, del callejón o del solar
  const dentro = (x, z) => {
    const dx = x - C[0], dz = z - C[1], a = dx * US[0] + dz * US[1], b = -(dx * E[0] + dz * E[1]);
    return (a > A159 && a < AFIN && b > -0.45 && b < FONDO) || enPoligono(a, b, SOLAR);
  };
  const palmas = sinPalmasDentro(scene, dentro);
  return { grupos, suelos, palmas };
}
