import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco, trocear } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';
import { paveMesh, polyTris } from './suelos.js';
import { pared, tira, tierraParda } from './rapadurasSur.js';
import { tuneFrayLuisNorte } from './frayLuisNorte.js';

/**
 * La calle Fray Luis de León por detrás de la manzana de El Túnel (Altavista), mitad sur, con las vistas de la calle
 * de Google de julio de 2025 (Fray Luis de León 42, 49, 38, 36 y 37; solo se miran, no van dentro del juego) y el
 * plano del Catastro. En el mapa era el bloque genérico de 4 m y las traseras lisas. De verdad:
 * - el 42: el muro blanco del patio con la puerta del garaje, la caja de la luz y el cuarto de detrás;
 * - la parte de atrás de Compafric: el edificio beis de tres plantas con el zócalo de granito gris, los dos garajes, la
 *   puerta metálica de lamas, el portal 40 con los buzones, la rendija de la escalera, las ventanas y las losas de los
 *   balcones;
 * - la parte de atrás del 157: la puerta de madera 38, los dos ojos de buey, la ventana de lamas marrones y el garaje;
 * - OTIS por detrás: el zócalo gris oscuro, el portal 36, la ventana de las rejillas, el letrero azul y blanco
 *   («OTIS ASCENSORES - MONTACARGAS»), el garaje y el balcón de barandilla blanca;
 * - El Colorao por detrás: la persiana oxidada del garaje con su caja, la puerta 32, la cornisa y las rejas oscuras de
 *   arriba; y el callejón de tierra llega hasta la calle.
 */

// la cara de León y Castillo: a hacia el sur desde la esquina de Padre Claret (la de El Túnel), b hacia dentro; la de
// Fray Luis de León va a b = 25,3 (como la casa del bar y el 46)
const C = [378.37 + 0.166579 * 1.9, -1299.89 - 0.98603 * 1.9];
const US = [-0.166579, 0.98603], E = [0.98605, 0.166412];
const P = (a, b = 0) => [C[0] + US[0] * a - E[0] * b, C[1] + US[1] * a - E[1] * b];
const A42 = 45.1, ACOM = 55.3, A159 = 62.58, A157 = 70.85, AOTIS = 78.65, APAS = 88.63, ABAR = 96.5, AFIN = 105.8;
const FL = 25.3, VIEJO = 24.18;
const ALTO42 = 2.7, ALTO_COM = 9.0, ALTO157 = 7.15, ALTO_OTIS = 8.5, ALTO_BAR = 8.5;
// el marco va del norte al sur, con la calle de Fray Luis de León delante (al oeste); la cara a 0,054 de la línea
const M = marco(P(A42, FL), P(AFIN, FL));
const x = a => a - A42;
const F = 0.054;

/** antes de levantar la ciudad: las casas van en lugar del bloque genérico (al 42, bajo, se le hace sitio) y las
 * traseras del 157, OTIS y El Colorao llegan hasta la calle */
export function tuneFrayLuisSur(map) {
  if (!Array.isArray(map?.buildings)) return;
  if (!map.frayLuisNorte) tuneFrayLuisNorte(map);
  const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const r = q => [+q[0].toFixed(2), +q[1].toFixed(2)];
  const libre = q => !q.skip && !q.edificioReal && Array.isArray(q.p);
  // el entrante del 44 se alarga hasta el 42: su primera esquina, P(45,1, 24,17), pasa a ser el entrante del 42
  const N = P(A42, 24.17), N2 = P(A42, 16.0);
  const b = map.buildings.find(q => libre(q) && q.p.some(p => d(p, N) < 0.3) && q.p.some(p => d(p, N2) < 0.3));
  if (!b) return;
  const i = b.p.findIndex(p => d(p, N) < 0.3);
  const nuevo = [P(55.7, 24.17), P(55.7, 16.6), P(A42, 16.6)].map(r);
  b.p.splice(i, 1, ...(b.p[i + 1] && d(b.p[i + 1], N2) < 0.3 ? nuevo : nuevo.reverse()));
  // (al revés, para que den la vuelta como los bloques del mapa)
  const casa = (a0, a1, b0, b1, h, f, c = [200, 196, 188]) => {
    const p = [P(a0, b0), P(a0, b1), P(a1, b1), P(a1, b0)].map(r).reverse();
    p.push(p[0].slice());
    map.buildings.push({ p, h, k: 'gen', s: 0, f, c, edificioReal: true });
  };
  const blanca = [242, 241, 236], beige = [201, 182, 166], crema = [236, 226, 204];
  casa(A42, ACOM, 16.7, FL, ALTO42, blanca);
  casa(50.5, 52.5, 19.5, 22.5, 3.9, blanca);
  casa(ACOM, A159, 17.05, FL, ALTO_COM, beige);
  casa(A159, A157, 13.15, FL, ALTO_COM, beige);
  // las traseras del 157, OTIS y El Colorao, de donde se quedaron (24,18) a la calle
  casa(A157, AOTIS, VIEJO, FL, ALTO157, blanca);
  casa(AOTIS, APAS, VIEJO, FL, ALTO_OTIS, blanca);
  casa(ABAR, AFIN, VIEJO, FL, ALTO_BAR, crema);
  map.frayLuisSur = true;
}

// ——— las texturas ———

const liso = color => (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); };
const tx = (w, h, fn) => canvasTex(Math.max(16, Math.min(1024, Math.round(w * 60))), Math.max(16, Math.round(h * 60)), fn);

/** una persiana o puerta de garaje de chapa, de franjas, del color que se pida */
const chapa = (fondo, raya, vertical = false) => (g, w, h) => {
  g.fillStyle = fondo;
  g.fillRect(0, 0, w, h);
  g.fillStyle = raya;
  if (vertical) for (let xx = 2; xx < w; xx += 6) g.fillRect(xx, 0, 2, h);
  else for (let y = 2; y < h; y += 5) g.fillRect(0, y, w, 1.5);
};

/** la persiana oxidada de El Colorao */
function persianaOxidada(g, w, h) {
  chapa('#8a6a50', 'rgba(60,40,26,.55)')(g, w, h);
  let sd = 5;
  const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 60; i++) {
    g.fillStyle = rnd() < 0.5 ? 'rgba(150,90,50,.35)' : 'rgba(190,170,150,.3)';
    g.fillRect(rnd() * w, rnd() * h, 4 + rnd() * 20, 2);
  }
}

/** la puerta metálica de lamas de Compafric */
function puertaLamas(g, w, h) {
  g.fillStyle = '#b8babc';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#8e9092';
  for (let y = 4; y < h; y += 7) g.fillRect(4, y, w - 8, 2);
  g.fillStyle = '#d8dadc';
  g.fillRect(w / 2 - 2, 0, 4, h);
  g.strokeStyle = '#9a9c9e';
  g.lineWidth = 4;
  g.strokeRect(2, 2, w - 4, h - 4);
}

/** una puerta de aluminio de lamas con el cristal al lado (el portal 40) */
function portalLamas(g, w, h) {
  g.fillStyle = '#c8cacc';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#2a2e34';
  g.fillRect(w * 0.06, h * 0.04, w * 0.2, h * 0.92);
  g.fillStyle = '#a8aaac';
  for (let y = h * 0.06; y < h * 0.94; y += 6) g.fillRect(w * 0.32, y, w * 0.62, 2);
}

/** una puerta de madera de cuarterones con el medio punto (la del 157, el 38) */
function puertaArco(g, w, h) {
  g.fillStyle = '#5e3428';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#43241a';
  g.lineWidth = 3;
  g.beginPath(); g.arc(w / 2, h * 0.18, w * 0.32, Math.PI, 0); g.stroke();
  for (let j = 0; j < 3; j++) for (const x0 of [0.14, 0.54]) g.strokeRect(w * x0, h * (0.28 + j * 0.23), w * 0.32, h * 0.19);
}

/** unas contraventanas de lamas marrones */
function lamasMarrones(g, w, h) {
  g.fillStyle = '#6a3a2c';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#3e2018';
  g.lineWidth = 2;
  for (let y = 4; y < h - 2; y += 5) { g.beginPath(); g.moveTo(4, y); g.lineTo(w / 2 - 2, y); g.moveTo(w / 2 + 2, y); g.lineTo(w - 4, y); g.stroke(); }
  g.fillStyle = '#3e2018';
  g.fillRect(w / 2 - 1.5, 0, 3, h);
}

/** la puerta blanca del portal de OTIS, con el rombo */
function puertaRombo(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#cfcdc6';
  g.lineWidth = 3;
  g.strokeRect(w * 0.12, h * 0.06, w * 0.76, h * 0.88);
  g.beginPath();
  g.moveTo(w / 2, h * 0.46); g.lineTo(w * 0.8, h * 0.62); g.lineTo(w / 2, h * 0.78); g.lineTo(w * 0.2, h * 0.62); g.closePath();
  g.stroke();
}

/** el letrero de OTIS por detrás: el nombre grande y lo que hacen, en azul y blanco */
function letreroOtis(g, w, h) {
  g.fillStyle = '#2f55a8';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#f2f2f0';
  g.lineWidth = 3;
  g.strokeRect(3, 3, w - 6, h - 6);
  const corte = w * 0.26;
  g.fillStyle = '#f4f4f4';
  g.fillRect(corte, 4, 3, h - 8);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `900 ${Math.round(h * 0.7)}px "Arial Black", Arial, sans-serif`;
  g.fillText('OTIS', corte / 2, h * 0.54, corte * 0.86);
  g.font = `bold ${Math.round(h * 0.42)}px Arial, sans-serif`;
  g.fillText('ASCENSORES - MONTACARGAS', (corte + w) / 2, h * 0.54, (w - corte) * 0.92);
}

/** la ventana de OTIS: las rejillas arriba y el cristal oscuro abajo */
function ventanaRejillas(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#b8b6b0';
  for (let y = 4; y < h * 0.45; y += 4) g.fillRect(4, y, w - 8, 1.5);
  g.fillStyle = '#20242a';
  g.fillRect(4, h * 0.52, w - 8, h * 0.44);
}

/** la puerta del 32: madera oscura con los cristales */
function puertaCristalesMadera(g, w, h) {
  g.fillStyle = '#3e3028';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#5a5a58';
  for (let j = 0; j < 4; j++) for (let i = 0; i < 2; i++) g.fillRect(w * (0.12 + i * 0.42), h * (0.06 + j * 0.15), w * 0.34, h * 0.12);
}

/** las rejas oscuras de las ventanas de arriba de El Colorao: los recuadros con el cristal esmerilado */
function rejaRecuadros(g, w, h) {
  g.fillStyle = '#d8d4cc';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#2e2a28';
  g.lineWidth = 4;
  g.strokeRect(2, 2, w - 4, h - 4);
  const n = Math.max(2, Math.round(w / (h * 1.8)));
  for (let i = 0; i < n; i++) {
    const x0 = (w / n) * i;
    g.strokeRect(x0 + 6, h * 0.25, w / n - 12, h * 0.5);
  }
}

// ——— las piezas ———

/** un hueco de a0 a a1 y de y0 a y1 */
const hu = (k, a0, a1, y0, y1, fn, borde, z = F) => hueco(k, (x(a0) + x(a1)) / 2, y0, a1 - a0, y1 - y0, tx(a1 - a0, y1 - y0, fn), { borde, z });
/** una caja pegada a la fachada */
const caja = (k, a0, a1, y0, y1, sale, color, z = F) => k.box((x(a0) + x(a1)) / 2, y0, z + sale / 2, a1 - a0, y1 - y0, sale, color);

/** el 42: el muro del patio con el garaje */
function casa42(k) {
  pared(k, x(A42), x(ACOM), ALTO42, liso('#f2f1ec'), -0.25);
  hu(k, 50.3, 53.5, 0.02, 2.18, chapa('#e6e6e2', '#c4c4c0', true), 0xc8c8c4);
  caja(k, 53.8, 54.8, 0.5, 1.26, 0.12, 0xd8d8d4);
  k.pic((x(53.7) + x(54.5)) / 2, 1.35, F + 0.006, 0.8, 2.7, 0, 1, tx(0.8, 2.7, liso('#d2c2a8')));
  caja(k, A42, ACOM, ALTO42 - 0.08, ALTO42, 0.1, 0xe4e2dc);
}

/** la parte de atrás de Compafric */
function compafric(k) {
  pared(k, x(ACOM), x(A157), ALTO_COM, liso('#c9b6a6'), -0.25);
  caja(k, ACOM, 70.4, 0, 1.0, 0.04, 0x6a6a68);
  hu(k, 56.4, 58.35, 0.02, 2.5, chapa('#d8d6d0', '#b0aea8'), 0xa8a6a0, F + 0.04);
  hu(k, 58.35, 60.5, 0.02, 2.65, puertaLamas, 0x9a9c9e, F + 0.04);
  hu(k, 60.6, 61.1, 2.1, 2.7, cristales('#e8e8e4', 1), 0xe8e8e4);
  caja(k, 60.6, 61.25, 0.6, 1.27, 0.14, 0xc8c8c4, F + 0.04);
  for (const [a0, a1] of [[62.03, 62.33], [62.42, 62.79]]) hu(k, a0, a1, 0.02, 2.65, liso('#1e2226'), 0xb8b0a4, F + 0.04);
  hu(k, 62.8, 64.1, 0.02, 2.62, portalLamas, 0xb8babc, F + 0.04);
  k.pic((x(62.8) + x(64.1)) / 2, 2.75, F + 0.06, 0.3, 0.16, 0, 1, canvasTex(60, 32, (g, w, h) => {
    liso('#c9b6a6')(g, w, h); g.fillStyle = '#2a2a28'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `bold ${Math.round(h * 0.7)}px Arial, sans-serif`; g.fillText('40', w / 2, h * 0.55);
  }));
  caja(k, 64.7, 65.4, 1.5, 1.9, 0.12, 0x1e1e1e, F + 0.04);
  hu(k, 67.4, 69.5, 0.02, 2.6, chapa('#d8d6d0', '#b0aea8'), 0xa8a6a0, F + 0.04);
  caja(k, 68.0, 68.8, 2.9, 3.25, 0.03, 0xf2f0ec);
  // arriba: las ventanas de las dos plantas con sus losas que salen, y la rendija de la escalera
  for (const [a0, a1] of [[55.8, 57.8], [58.8, 61.0], [65.8, 69.0]]) {
    for (const y of [3.9, 6.3]) {
      hu(k, a0, a1, y, y + 1.1, cristales('#e8e8e4', 3, 'rgba(60,70,80,.25)'), 0xe0dcd6);
      caja(k, a0 - 0.25, a1 + 0.25, y + 1.35, y + 1.6, 0.6, 0xb8a494);
    }
  }
  hu(k, 62.0, 62.8, 3.9, 8.4, cristales('#d8dadc', 1, 'rgba(40,50,70,.4)'), 0xd8dadc);
  caja(k, ACOM, A157, ALTO_COM - 0.12, ALTO_COM, 0.1, 0xb8a494);
}

/** la parte de atrás del 157 */
function casa157(k) {
  pared(k, x(A157), x(AOTIS), ALTO157, liso('#f2f1ec'), -0.25);
  hu(k, 71.0, 71.8, 0.02, 2.24, puertaArco, 0x4a2a20);
  k.pic((x(71.0) + x(71.8)) / 2, 2.42, F + 0.01, 0.3, 0.16, 0, 1, canvasTex(60, 32, (g, w, h) => {
    liso('#f2f1ec')(g, w, h); g.strokeStyle = '#2a2a28'; g.strokeRect(1, 1, w - 2, h - 2); g.fillStyle = '#2a2a28';
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `bold ${Math.round(h * 0.7)}px Arial, sans-serif`; g.fillText('38', w / 2, h * 0.55);
  }));
  caja(k, 70.55, 70.8, 1.55, 1.85, 0.1, 0x6a7a3a);
  for (const y of [4.3, 6.6]) {
    k.cyl(x(71.4), y, F + 0.02, 0.4, 0.4, 0.05, 0xf4f4f0, { seg: 24, rx: Math.PI / 2 });
    k.cyl(x(71.4), y, F + 0.05, 0.33, 0.33, 0.03, 0x2a3036, { seg: 24, rx: Math.PI / 2 });
  }
  hu(k, 73.0, 74.5, 4.7, 6.0, lamasMarrones, 0x4a2a20);
  hu(k, 73.1, 75.5, 0.02, 2.95, chapa('#ecebe6', '#c8c6c0'), 0xd0d0cc);
  for (const [a0, a1, y0, y1] of [[72.2, 72.7, 1.5, 1.9], [72.0, 72.6, 0.5, 1.2], [72.15, 72.6, 3.0, 3.4]]) caja(k, a0, a1, y0, y1, 0.12, 0xe0e0dc);
  caja(k, A157, AOTIS, ALTO157 - 0.1, ALTO157, 0.08, 0xe4e2dc);
}

/** OTIS por detrás */
function otis(k) {
  pared(k, x(AOTIS), x(APAS), ALTO_OTIS, liso('#f2f1ec'), -0.25);
  caja(k, 79.75, 83.4, 0, 2.6, 0.04, 0x55585a);
  hu(k, 79.1, 79.75, 0.02, 2.6, puertaRombo, 0xf2f2ee, F + 0.04);
  hu(k, 79.0, 79.75, 2.65, 3.5, liso('#20242a'), 0xf2f2ee);
  hu(k, 80.5, 82.2, 2.6, 3.5, ventanaRejillas, 0xf2f2ee, F + 0.04);
  hu(k, 83.4, 87.6, 0.02, 3.0, chapa('#ecebe6', '#c8c6c0'), 0xd0d0cc);
  caja(k, 79.5, 88.4, 3.8, 4.6, 0.08, 0x2f55a8);
  k.pic((x(79.5) + x(88.4)) / 2, 4.2, F + 0.082, 88.4 - 79.5, 0.8, 0, 1, canvasTex(1024, 92, letreroOtis));
  // el balcón de barandilla blanca y las ventanas de arriba
  caja(k, 78.4, 80.9, 4.75, 4.95, 0.7, 0xeeeeea);
  hu(k, 78.7, 80.6, 4.95, 6.9, cristales('#f2f2ee', 2, 'rgba(60,70,80,.3)'), 0xf2f2ee);
  for (let y = 5.1; y < 6.0; y += 0.15) caja(k, 78.45, 80.85, y, y + 0.05, 0.05, 0xf2f2ee, F + 0.65);
  hu(k, 81.3, 81.95, 5.4, 7.0, cristales('#f2f2ee', 1, 'rgba(60,70,80,.3)'), 0xf2f2ee);
  hu(k, 84.2, 86.0, 5.4, 6.9, cristales('#f2f2ee', 2, 'rgba(60,70,80,.3)'), 0xf2f2ee);
  caja(k, AOTIS, APAS, ALTO_OTIS - 0.1, ALTO_OTIS, 0.06, 0xe4e2dc);
}

/** El Colorao por detrás */
function colorao(k) {
  pared(k, x(ABAR), x(AFIN), ALTO_BAR, liso('#ece2cc'), -0.25);
  hu(k, 98.35, 101.25, 0.02, 2.82, persianaOxidada, 0x6a5040, F + 0.02);
  caja(k, 98.0, 101.36, 2.85, 3.31, 0.22, 0x9a9890);
  hu(k, 103.3, 104.45, 0.02, 2.46, puertaCristalesMadera, 0x3e3028);
  caja(k, 103.3, 103.68, 1.5, 1.83, 0.14, 0x1e1e1e);
  k.pic(x(104.75), 2.5, F + 0.01, 0.3, 0.18, 0, 1, canvasTex(60, 36, (g, w, h) => {
    liso('#ece2cc')(g, w, h); g.fillStyle = '#2a2a28'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `bold ${Math.round(h * 0.7)}px Georgia, serif`; g.fillText('32', w / 2, h * 0.55);
  }));
  caja(k, 104.1, 104.5, 3.1, 3.47, 0.12, 0xd0c8b8);
  caja(k, ABAR, AFIN, 3.7, 4.14, 0.3, 0xe0d6c0);
  for (const [a0, a1] of [[98.05, 99.8], [100.55, 104.6]]) hu(k, a0, a1, 5.18, 6.0, rejaRecuadros, 0x2e2a28);
  caja(k, ABAR, AFIN, ALTO_BAR - 0.1, ALTO_BAR, 0.06, 0xd8ccb4);
}

/** se monta con lo demás */
export function buildFrayLuisSur(scene, colliders, map) {
  if (!map?.frayLuisSur) return null;
  const k = new Kit();
  casa42(k);
  compafric(k);
  casa157(k);
  otis(k);
  colorao(k);
  const grupos = [enMarco(k, M, 'frayLuisSur', colliders)];
  // las paredes que asoman: el lado de Compafric sobre el 42 y sobre el 157, su trasera sobre el 159, el cuarto del 42 y
  // los trozos nuevos de las paredes del callejón
  const lisa = (A, B, alto, nombre, color = '#ecebe6') => tira(A, B, alto, nombre, colliders, (kk, L) => pared(kk, 0, L, alto, liso(color), -0.25));
  grupos.push(lisa(P(ACOM, 17.05), P(ACOM, FL), ALTO_COM, 'compafricTraseraNorte', '#c4b2a2'));
  grupos.push(lisa(P(A157, FL), P(A157, 13.15), ALTO_COM, 'compafricTraseraSur', '#c4b2a2'));
  grupos.push(lisa(P(A157, 13.15), P(A159, 13.15), ALTO_COM, 'compafricTraseraEste', '#c4b2a2'));
  grupos.push(lisa(P(50.5, 22.5), P(52.5, 22.5), 3.9, 'casa42Cuarto'));
  grupos.push(lisa(P(APAS, FL), P(APAS, VIEJO), ALTO_OTIS, 'otisCallejonFin', '#efeee9'));
  grupos.push(lisa(P(ABAR, VIEJO), P(ABAR, FL), ALTO_BAR, 'coloraoCallejonFin', '#efede6'));
  for (const g of grupos) scene.add(g);
  // la tierra del callejón hasta la calle
  const suelo = paveMesh(trocear(polyTris([P(APAS, VIEJO), P(APAS, FL + 0.3), P(ABAR, FL + 0.3), P(ABAR, VIEJO)]), 1.5), 0.18, tierraParda(), 0xd8d0c4);
  if (suelo) { suelo.name = 'frayLuisSurCallejon'; scene.add(suelo); }
  return { grupos, suelo };
}
