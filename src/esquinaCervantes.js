import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';
import { ZF, pared, tira } from './rapadurasSur.js';
import { tuneCanaryTel } from './canaryTel.js';

/**
 * La punta norte de la manzana de León y Castillo (la LZ-1, Altavista), de Fte a la esquina de la calle Cervantes, con
 * las vistas de la calle de Google de julio de 2025 (LZ-1 195 y 197, y Cervantes 1; solo se miran, no van dentro del
 * juego), medidas con el foco bueno de las capturas (475 px). En el mapa era el bloque genérico de 5 m. De verdad las
 * casas salen 2,6 m más a la calle que el bodegón, como el edificio de Canary-Tel, y la esquina llega unos 3 m más al
 * norte que el bloque del mapa:
 * - la casa vieja blanca de una planta (4,2 m), con el zócalo de piedra volcánica, la ventana de persianas verdes con su
 *   marco de piedra, el grupo de la puerta verde con las dos ventanas de lamas, el buzón, la placa roja y la otra puerta
 *   verde, con sus marcos de piedra y las cornisitas de encima;
 * - la casa crema de la esquina, de dos plantas (8,7 m), con la torre alta de las dos ventanas redondas y la puerta de
 *   madera con su escalón, el buzón, la ventana grande, los contadores, la puerta de la peluquería con la reja blanca
 *   plegable y el letrero «PELUQUERÍA» (lo demás del letrero lo tapa el árbol), y arriba el balcón corrido con los
 *   antepechos crema y las barandillas de madera, que da la vuelta a la esquina, y las ventanas de detrás.
 */

// la cara de León y Castillo, con el mismo marco que el Bodegón Los Mencey y Canary-Tel (n hacia el norte)
const ESQ_S = [396.6, -1409.71], ESQ_N = [409.82, -1490.89];
const UN = [0.16073, -0.987], NE = [0.987, 0.16073];
const P = (n, b = 0) => [ESQ_S[0] + UN[0] * n - NE[0] * b, ESQ_S[1] + UN[1] * n - NE[1] * b];
// las casas, medidas en las vistas de la calle; la fachada sale AD m a la calle; el bloque del mapa acaba en N_MAPA
const N0 = 63.9, N1 = 74.8, N2 = 78.1, FIN = 85.5, N_MAPA = 82.25, AD = 2.6, FONDO = 12;
const ALTO_V = 4.22, ALTO_T = 10.6, ALTO_E = 8.73;
const F = marco(P(N0, -AD), P(FIN, -AD));
const FN = marco(P(FIN, -AD), P(FIN, FONDO));
const s = n => n - N0;

const CREMA = '#ece0c4', MADERA = 0x6a4a32;

/** antes de levantar la ciudad: las casas salen del bloque genérico de 5 m y de la acera, hasta la esquina */
export function tuneEsquinaCervantes(map) {
  if (!Array.isArray(map?.buildings)) return;
  // va detrás de Canary-Tel, que deja la esquina de donde se parte (en la web los retoques van al revés)
  if (!map.canaryTel) tuneCanaryTel(map);
  const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const r = q => [+q[0].toFixed(2), +q[1].toFixed(2)];
  const A = r(P(N0));
  const b = map.buildings.find(q => !q.skip && !q.edificioReal && Array.isArray(q.p) && q.p.some(p => d(p, A) < 0.3) && q.p.some(p => d(p, ESQ_N) < 0.3));
  if (!b) return;
  b.p = b.p.filter(p => d(p, A) >= 0.3).map(p => (d(p, ESQ_N) < 0.3 ? r(P(N_MAPA, FONDO)) : p));
  for (const [n0, n1, h, f] of [[N0, N1, ALTO_V, [240, 239, 232]], [N1, N2, ALTO_T, [239, 230, 208]], [N2, FIN, ALTO_E, [236, 224, 196]]]) {
    const p = [P(n0, -AD), P(n0, FONDO), P(n1, FONDO), P(n1, -AD)].map(r);
    p.push(p[0].slice());
    map.buildings.push({ p, h, k: 'gen', s: 0, f, c: [200, 196, 188], edificioReal: true });
  }
  map.esquinaCervantes = true;
}

// ——— las texturas ———

const liso = color => (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); };

/** el zócalo de piedra volcánica oscura con las juntas claras */
function piedraNegra(g, w, h) {
  g.fillStyle = '#d8d6d0';
  g.fillRect(0, 0, w, h);
  let sd = 53;
  const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let y = 0; y < h; y += 7) {
    for (let x = -rnd() * 8; x < w; x += 8 + rnd() * 6) {
      const k = Math.round(rnd() * 22);
      g.fillStyle = `rgb(${52 + k},${52 + k},${56 + k})`;
      g.beginPath();
      g.ellipse(x + 4, y + 3.5, 3.5 + rnd() * 2, 2.6 + rnd(), rnd(), 0, Math.PI * 2);
      g.fill();
    }
  }
}

/** una ventana con las persianas verdes de lamas cerradas */
function persianaVerde(g, w, h) {
  g.fillStyle = '#2e7a46';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#1e5a32';
  g.lineWidth = 1.5;
  for (let y = 3; y < h; y += 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.fillStyle = '#1e5a32';
  g.fillRect(w / 2 - 1, 0, 2, h);
}

/** una puerta verde de tablas */
function puertaVerde(g, w, h) {
  g.fillStyle = '#2e7a46';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#1e5a32';
  g.lineWidth = 2;
  for (let x = w / 6; x < w; x += w / 6) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  g.fillStyle = '#c8c8c4';
  g.fillRect(w * 0.8, h * 0.5, w * 0.07, h * 0.03);
}

/** la puerta de madera de dos hojas con los cristalitos */
function puertaMadera(g, w, h) {
  g.fillStyle = '#7a4a2a';
  g.fillRect(0, 0, w, h);
  for (const x0 of [0.06, 0.53]) {
    for (let i = 0; i < 4; i++) {
      g.fillStyle = 'rgba(60,70,80,.85)';
      g.fillRect(w * (x0 + 0.08), h * (0.06 + i * 0.12), w * 0.25, h * 0.09);
    }
    g.strokeStyle = '#5a3418';
    g.lineWidth = 2;
    g.strokeRect(w * (x0 + 0.05), h * 0.56, w * 0.31, h * 0.38);
  }
}

/** la puerta de la peluquería con la reja blanca plegable delante */
function rejaPlegable(g, w, h) {
  g.fillStyle = '#5a3a24';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#3a4048';
  g.fillRect(w * 0.55, h * 0.08, w * 0.35, h * 0.6);
  g.strokeStyle = '#f0f0ec';
  g.lineWidth = 2;
  const paso = w / 9;
  for (let x = 0; x < w * 0.5; x += paso) {
    for (let y = 0; y < h; y += paso * 2) {
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + paso, y + paso); g.lineTo(x, y + paso * 2); g.stroke();
      g.beginPath(); g.moveTo(x + paso, y); g.lineTo(x, y + paso); g.lineTo(x + paso, y + paso * 2); g.stroke();
    }
  }
  for (const x of [0, w * 0.5]) { g.fillStyle = '#f0f0ec'; g.fillRect(x, 0, 3, h); }
}

/** el letrero negro de la peluquería */
function letreroPeluqueria(g, w, h) {
  g.fillStyle = '#1e1e20';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#ffffff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `bold ${Math.round(h * 0.42)}px Arial, sans-serif`;
  g.fillText('PELUQUERÍA', w / 2, h * 0.32, w * 0.9);
}

/** una ventana de lamas oscuras */
function lamasOscuras(g, w, h) {
  g.fillStyle = '#3a4040';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#5a6260';
  g.lineWidth = 2;
  for (let y = 3; y < h; y += 5) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

// ——— las piezas ———

const tx = (w, h, fn) => canvasTex(Math.max(16, Math.min(1024, Math.round(w * 60))), Math.max(16, Math.round(h * 60)), fn);
/** un hueco de n0 a n1 y de y0 a y1 */
const hu = (k, n0, n1, y0, y1, fn, borde, z = ZF + 0.05) => hueco(k, s((n0 + n1) / 2), y0, n1 - n0, y1 - y0, tx(n1 - n0, y1 - y0, fn), { borde, z });
/** una caja pegada a la fachada de n0 a n1 y de y0 a y1, que sale «sale» m */
const caja = (k, n0, n1, y0, y1, sale, color) => k.box(s((n0 + n1) / 2), y0, ZF + sale / 2, n1 - n0, y1 - y0, sale, color);

/** una ventana redonda de ojo de buey, con su marco marrón */
function ojoDeBuey(k, x, y, r = 0.48) {
  k.cyl(x, y, ZF, r, r, 0.06, 0x5a3a24, { seg: 24, rx: Math.PI / 2 });
  k.cyl(x, y, ZF + 0.02, r - 0.08, r - 0.08, 0.05, 0x3a4048, { seg: 24, rx: Math.PI / 2 });
  k.box(x - (r - 0.08), y - 0.015, ZF + 0.07, 2 * (r - 0.08), 0.03, 0.02, 0x5a3a24);
}

/** un tramo de barandilla de madera del balcón (sin choques: va en alto) */
function barandillaMadera(k, x0, x1, y, z, alto = 0.82) {
  const c = (x0 + x1) / 2, L = x1 - x0;
  k.box(c, y + alto - 0.06, z, L, 0.06, 0.1, MADERA);
  for (let i = 0; i < 4; i++) k.box(c, y + 0.1 + i * (alto - 0.2) / 3, z, L, 0.09, 0.04, MADERA);
  for (const x of [x0, x1]) k.box(x, y, z, 0.08, alto, 0.08, MADERA);
}

/** la casa vieja blanca de una planta */
function casaVieja(k) {
  pared(k, s(N0), s(N1), ALTO_V, liso('#f0efe8'));
  caja(k, N0, N1, 0, 0.7, 0.06, 0x3a3a3c);
  k.pic(s((N0 + N1) / 2), 0.35, ZF + 0.062, N1 - N0, 0.7, 0, 1, tx(N1 - N0, 0.7, piedraNegra));
  // los marcos de piedra gris de los huecos y, dentro, las persianas, las lamas y las puertas verdes
  for (const [n0, n1, y0] of [[65.93, 67.65, 0.7], [68.95, 71.5, 0], [72.55, 73.69, 0]]) {
    caja(k, n0, n1, y0, 1.95, 0.05, 0x8a8a86);
    caja(k, n0 - 0.05, n1 + 0.05, 1.98, 2.1, 0.18, 0xe8e6e0);
  }
  hu(k, 66.1, 67.48, 0.8, 1.88, persianaVerde, 0x2e7a46, ZF + 0.07);
  for (const [n0, n1] of [[69.06, 69.74], [70.65, 71.4]]) hu(k, n0, n1, 0.75, 1.81, lamasOscuras, 0x2e7a46, ZF + 0.07);
  hu(k, 69.78, 70.6, 0.04, 1.81, puertaVerde, 0x1e5a32, ZF + 0.07);
  hu(k, 72.71, 73.49, 0.02, 1.81, puertaVerde, 0x1e5a32, ZF + 0.07);
  caja(k, 71.72, 71.92, 1.35, 1.62, 0.1, 0x1e1e20);
  caja(k, 72.26, 72.52, 1.48, 1.81, 0.03, 0xc82a2a);
  caja(k, N0, N1, ALTO_V - 0.2, ALTO_V, 0.12, 0xe4e2dc);
}

/** la torre alta, con la puerta de madera y su escalón, el buzón y las dos ventanas redondas */
function torre(k) {
  pared(k, s(N1), s(N2), ALTO_T, liso('#efe6d0'));
  hu(k, 75.01, 76.45, 0.13, 2.53, puertaMadera, 0x5a3418);
  caja(k, 74.95, 76.5, 0, 0.13, 0.35, 0xb8b0a0);
  caja(k, 76.79, 77.08, 1.35, 1.68, 0.12, 0x1e1e20);
  ojoDeBuey(k, s(75.7), 4.62, 0.47);
  ojoDeBuey(k, s(75.69), 7.83, 0.5);
  caja(k, N1, N2, ALTO_T - 0.2, ALTO_T, 0.25, 0xe8e0cc);
}

/** el balcón corrido de la casa de la esquina, de n0 al canto: la losa, los antepechos crema y las barandillas de madera */
function balcon(k, n0, n1) {
  const z = ZF + 0.45, zb = ZF + 0.86, x1 = s(n1) + 0.9;
  k.box((s(n0) + x1) / 2, 3.85, z, x1 - s(n0), 0.24, 0.9, 0xece0c4);
  const tramos = [[n0, 80.4, 'c'], [80.4, 82.0, 'm'], [82.0, 82.8, 'c'], [82.8, 85.0, 'm']];
  for (const [a, b, t] of tramos) {
    if (t === 'c') k.box((s(a) + s(b)) / 2, 4.09, zb, s(b) - s(a), 1.5, 0.12, 0xece0c4);
    else {
      k.box((s(a) + s(b)) / 2, 4.09, zb, s(b) - s(a), 0.69, 0.12, 0xece0c4);
      barandillaMadera(k, s(a), s(b), 4.78, zb);
    }
  }
  k.box((s(85.0) + x1) / 2, 4.09, zb, x1 - s(85.0), 1.5, 0.12, 0xece0c4);
  k.box((s(n0) + x1) / 2, 5.59, zb, x1 - s(n0) + 0.02, 0.06, 0.18, 0xe0d4b8);
}

/** la casa de la esquina: la ventana grande, los contadores, la peluquería, el balcón corrido y las ventanas de arriba */
function casaEsquina(k) {
  pared(k, s(N2), s(FIN), ALTO_E, liso(CREMA));
  hu(k, 77.29, 80.02, 1.13, 2.53, cristales('#5a3a24', 2, 'rgba(240,240,236,.92)'), 0x5a3a24);
  caja(k, 80.87, 81.27, 0.57, 2.08, 0.14, 0xd8d8d4);
  hu(k, 81.32, 84.61, 0.13, 3.08, rejaPlegable, 0x5a3a24);
  caja(k, 82.33, 83.84, 3.24, 3.84, 0.06, 0x1e1e20);
  k.pic(s(83.085), 3.54, ZF + 0.062, 1.51, 0.6, 0, 1, canvasTex(151, 60, letreroPeluqueria));
  for (const [n0, n1] of [[78.23, 78.97], [82.18, 83.04]]) hu(k, n0, n1, 4.5, 6.79, cristales('#5a3a24', 2), 0x5a3a24, ZF);
  balcon(k, 78.04, FIN);
  caja(k, N2, FIN, ALTO_E - 0.3, ALTO_E, 0.25, 0xe4d8bc);
}

/** la cara de la calle Cervantes de la casa de la esquina: el balcón que da la vuelta y una ventana */
function caraCervantes(k) {
  const L = FN.len;
  pared(k, 0, L, ALTO_E, liso(CREMA));
  const z = ZF + 0.45, zb = ZF + 0.86;
  k.box(1.6, 3.85, z, 3.2, 0.24, 0.9, 0xece0c4);
  k.box(1.55, 4.09, zb, 2.7, 0.69, 0.12, 0xece0c4);
  barandillaMadera(k, 0.2, 2.9, 4.78, zb);
  k.box(3.05, 4.09, zb, 0.3, 1.5, 0.12, 0xece0c4);
  hueco(k, 1.6, 4.5, 0.8, 2.29, canvasTex(48, 137, cristales('#5a3a24', 2)), { borde: 0x5a3a24, z: ZF });
  hueco(k, 4.6, 1.0, 1.0, 1.3, canvasTex(50, 65, persianaVerde), { borde: 0x5a3a24, z: ZF + 0.05 });
  k.box(L / 2, ALTO_E - 0.3, ZF + 0.125, L, 0.3, 0.25, 0xe4d8bc);
}

/** se monta con lo demás */
export function buildEsquinaCervantes(scene, colliders, map) {
  if (!map?.esquinaCervantes) return null;
  const k = new Kit(), kn = new Kit();
  casaVieja(k);
  torre(k);
  casaEsquina(k);
  caraCervantes(kn);
  const grupos = [enMarco(k, F, 'esquinaCervantes', colliders), enMarco(kn, FN, 'esquinaCervantesNorte', colliders)];
  // las paredes lisas de la torre y de atrás que asoman por encima de las casas de los lados y del bloque de 5 m
  const lisa = (A, B, alto, nombre, color = '#ecebe6') => tira(A, B, alto, nombre, colliders, (kk, L) => pared(kk, 0, L, alto, liso(color), -0.25));
  grupos.push(lisa(P(N1, FONDO), P(N1, -AD), ALTO_T, 'esquinaCervantesTorreSur', '#efe6d0'));
  grupos.push(lisa(P(N2, -AD), P(N2, FONDO), ALTO_T, 'esquinaCervantesTorreNorte', '#efe6d0'));
  grupos.push(lisa(P(N0, FONDO), P(N1, FONDO), 5.3, 'esquinaCervantesFondoVieja'));
  grupos.push(lisa(P(N2, FONDO), P(N1, FONDO), ALTO_T, 'esquinaCervantesTraseraTorre'));
  grupos.push(lisa(P(FIN, FONDO), P(N2, FONDO), ALTO_E, 'esquinaCervantesTrasera'));
  for (const g of grupos) scene.add(g);
  return { grupos };
}
