import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';
import { ZF, pared, tira } from './rapadurasSur.js';

/**
 * Los edificios del 173 y el 175 de León y Castillo (la LZ-1, Altavista), entre el aparcamiento de la esquina de Padre
 * Claret y el solar de tierra, con las vistas de la calle de Google de julio de 2025 (LZ-1 173 y 175; solo se miran, no
 * van dentro del juego), medidos con el foco bueno de las capturas (475 px). En el mapa era un bloque genérico de 6 m más
 * largo que los edificios (se comía parte del aparcamiento). De verdad:
 * - el 175, blanco crema, de dos plantas con la azotea de balaustrada: abajo, la tienda HenryCar abierta (el cartel
 *   naranja de lo que venden, el letrero negro con el nombre, sin el dibujo de la marca), la torre de la escalera con la
 *   puerta de cristal, la vidriera alta y el arco de arriba, y la oficina de Almudena Seguros con el escaparate de
 *   arcos, el letrero azul y la placa de HRA (solo los nombres); arriba, las cuatro ventanas con sus balconcitos de
 *   balaustres, los faroles, la cornisa y la balaustrada;
 * - el 173, beige, de tres plantas: abajo, las cristaleras de marco oscuro sobre su escalón blanco, la franja gris y las
 *   ventanas esmeriladas de la primera planta; arriba, los dos torreones con sus ventanas y, en medio, metido, el
 *   balcón de cristal con las dos puertas y la barandilla de la azotea.
 */

// la cara de León y Castillo: n hacia el norte desde la esquina sur del bloque de la farmacia, b hacia dentro
const ESQ_S = [396.6, -1409.71];
const UN = [0.16073, -0.987], NE = [0.987, 0.16073];
const P = (n, b = 0) => [ESQ_S[0] + UN[0] * n - NE[0] * b, ESQ_S[1] + UN[1] * n - NE[1] * b];
// los cortes, medidos en las vistas de la calle: el 173 (con sus dos torreones y el centro) y el 175
const N0 = -76.15, T1 = -72.73, T2 = -67.65, N1 = -64.0, N2 = -48.85, FONDO = 27.8, METIDO = 1.5;
const ALTO_173 = 10.1, ALTO_173C = 5.93, ALTO_173A = 9.1, ALTO_175 = 7.49, PRETIL = 8.29, ALTO_TORRE = 9.69;
const F = marco(P(N0), P(N2));
const s = n => n - N0;

const CREMA = '#f1e8d2', BEIGE = '#e2c89e', GRIS = 0x8e8c88;

/** antes de levantar la ciudad: los dos edificios en lugar del bloque genérico de 6 m */
export function tuneAlmudena175(map) {
  if (!Array.isArray(map?.buildings)) return;
  const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const r = q => [+q[0].toFixed(2), +q[1].toFixed(2)];
  const b = map.buildings.find(q => !q.skip && !q.edificioReal && Array.isArray(q.p) && q.p.some(p => d(p, [388.7, -1361.5]) < 0.3) && q.p.some(p => d(p, [383.5, -1329.8]) < 0.3));
  if (!b) return;
  b.skip = true;
  const casa = (n0, n1, b0, h, f, c = [178, 120, 96]) => {
    const p = [P(n0, b0), P(n0, FONDO), P(n1, FONDO), P(n1, b0)].map(r);
    p.push(p[0].slice());
    map.buildings.push({ p, h, k: 'gen', s: 0, f, c, edificioReal: true });
  };
  const beige = [226, 200, 158], crema = [241, 232, 210];
  casa(N0, T1, 0, ALTO_173, beige, [200, 196, 188]);
  casa(T1, T2, 0, ALTO_173C, beige, [200, 196, 188]);
  casa(T1, T2, METIDO, ALTO_173A, beige, [200, 196, 188]);
  casa(T2, N1, 0, ALTO_173, beige, [200, 196, 188]);
  casa(N1, N2, 0, ALTO_175, crema);
  casa(-57.46, -55.21, 0.3, ALTO_TORRE, crema);
  map.almudena175 = true;
}

// ——— las texturas ———

const liso = color => (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); };
const tx = (w, h, fn) => canvasTex(Math.max(16, Math.min(1024, Math.round(w * 60))), Math.max(16, Math.round(h * 60)), fn);

/** el granito gris del zócalo */
function granitoGris(g, w, h) {
  g.fillStyle = '#8e8c88';
  g.fillRect(0, 0, w, h);
  let sd = 29;
  const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < w * h / 10; i++) {
    g.fillStyle = rnd() < 0.5 ? 'rgba(50,50,52,.35)' : 'rgba(220,218,214,.35)';
    g.fillRect(rnd() * w, rnd() * h, 1.5, 1.5);
  }
}

/** la tienda de HenryCar por dentro: las estanterías naranjas, la furgoneta del fondo y el suelo de rayas */
function tiendaHenry(g, w, h) {
  g.fillStyle = '#2e3034';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8e6e0';
  g.fillRect(0, 0, w, h * 0.1);
  for (let i = 0; i < 3; i++) {
    g.fillStyle = '#d8582a';
    g.fillRect(w * (0.02 + i * 0.12), h * 0.3, w * 0.1, h * 0.55);
    g.fillStyle = '#3a2a24';
    for (let y = 0.38; y < 0.85; y += 0.11) g.fillRect(w * (0.02 + i * 0.12), h * y, w * 0.1, h * 0.02);
  }
  g.fillStyle = '#e8e8e4';
  g.fillRect(w * 0.58, h * 0.45, w * 0.3, h * 0.38);
  g.fillStyle = '#3a4048';
  g.fillRect(w * 0.62, h * 0.5, w * 0.22, h * 0.12);
  g.fillStyle = '#c8402a';
  g.fillRect(0, h * 0.9, w, h * 0.04);
}

/** el cartel naranja de lo que venden en HenryCar */
function cartelHenry(g, w, h) {
  g.fillStyle = '#e8702a';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#f4f2ee';
  g.lineWidth = 3;
  g.strokeRect(2, 2, w - 4, h - 4);
  g.fillStyle = '#ffffff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `bold ${Math.round(w * 0.11)}px Arial, sans-serif`;
  g.fillText('Bazar del automóvil', w / 2, h * 0.1, w * 0.9);
  g.font = `bold ${Math.round(w * 0.16)}px Arial, sans-serif`;
  g.fillText('Baterías', w / 2, h * 0.25, w * 0.85);
  g.fillText('Llaves', w / 2, h * 0.4, w * 0.85);
  g.fillStyle = 'rgba(255,255,255,.85)';
  for (let y = 0.52; y < 0.92; y += 0.07) g.fillRect(w * 0.12, h * y, w * (0.5 + ((y * 37) % 3) / 10), h * 0.02);
}

/** el letrero negro de HenryCar (solo el nombre) */
function letreroHenry(g, w, h) {
  g.fillStyle = '#1e1e20';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#ffffff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `bold italic ${Math.round(h * 0.2)}px Arial, sans-serif`;
  g.fillText('HenryCar', w / 2, h * 0.68, w * 0.9);
}

/** el letrero azul de Almudena Seguros (solo el nombre) */
function letreroAlmudena(g, w, h) {
  g.fillStyle = '#2a4aa8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#ffffff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `bold ${Math.round(h * 0.6)}px Arial, sans-serif`;
  g.fillText('Almudena', w * 0.38, h * 0.55, w * 0.5);
  g.font = `${Math.round(h * 0.55)}px Arial, sans-serif`;
  g.fillText('seguros', w * 0.75, h * 0.55, w * 0.3);
}

/** la placa azul de HRA */
function placaHra(g, w, h) {
  g.fillStyle = '#2a4aa8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#ffffff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `bold ${Math.round(h * 0.28)}px Arial, sans-serif`;
  g.fillText('HRA', w / 2, h * 0.25, w * 0.8);
  for (let y = 0.5; y < 0.9; y += 0.12) g.fillRect(w * 0.15, h * y, w * 0.7, h * 0.03);
}

/** el escaparate de Almudena: los cristales y los arcos blancos de arriba */
function escaparateArcos(g, w, h) {
  cristales('#f2f2ee', 4, 'rgba(230,236,240,.3)')(g, w, h);
  g.strokeStyle = '#f2f2ee';
  g.lineWidth = 3;
  g.beginPath(); g.moveTo(0, h * 0.17); g.lineTo(w, h * 0.17); g.stroke();
  const n = 4;
  for (let i = 0; i < n; i++) {
    const c = (w / n) * (i + 0.5);
    g.beginPath(); g.arc(c, h * 0.17, w / n / 2, Math.PI, 0); g.stroke();
  }
}

/** la vidriera alta de la torre de la escalera */
function vidriera(g, w, h) {
  g.fillStyle = '#5a6a78';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(230,236,240,.25)';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f2f2ee';
  g.fillRect(w / 2 - 2, 0, 4, h);
  for (let y = 0; y < h; y += h / 12) g.fillRect(0, y, w, 4);
  g.strokeStyle = '#f2f2ee';
  g.lineWidth = 5;
  g.strokeRect(2, 2, w - 4, h - 4);
}

/** los balaustres de una balaustrada crema */
function balaustres(g, w, h) {
  g.fillStyle = '#f1e8d2';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c8bea8';
  for (let x = 6; x < w; x += 14) {
    g.beginPath();
    g.ellipse(x, h * 0.55, 3, h * 0.3, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = '#f1e8d2';
  g.fillRect(0, 0, w, h * 0.14);
  g.fillRect(0, h * 0.88, w, h * 0.12);
}

/** las cristaleras del bajo del 173: los cristales con el marco oscuro y las dos puertas */
function cristalera173(g, w, h) {
  cristales('#2a2622', 6, 'rgba(230,234,238,.55)')(g, w, h);
  g.fillStyle = '#2a2622';
  for (const x of [0.26, 0.72]) { g.fillRect(w * x, h * 0.48, w * 0.01, h * 0.1); }
}

/** las ventanas esmeriladas de la primera planta del 173 */
function esmerilada(g, w, h) {
  g.fillStyle = '#e8eaea';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#2a2622';
  g.lineWidth = 4;
  g.strokeRect(2, 2, w - 4, h - 4);
}

/** el cristal verdoso de la barandilla del balcón */
function cristalVerde(g, w, h) {
  g.fillStyle = '#9ab8b4';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.25)';
  g.fillRect(0, 0, w, h * 0.3);
  g.strokeStyle = '#6a7a78';
  g.lineWidth = 2;
  g.strokeRect(1, 1, w - 2, h - 2);
}

// ——— las piezas ———

/** un hueco de n0 a n1 y de y0 a y1 */
const hu = (k, n0, n1, y0, y1, fn, borde, z = ZF + 0.05) => hueco(k, s((n0 + n1) / 2), y0, n1 - n0, y1 - y0, tx(n1 - n0, y1 - y0, fn), { borde, z });
/** una caja pegada a la fachada de n0 a n1 y de y0 a y1, que sale «sale» m */
const caja = (k, n0, n1, y0, y1, sale, color) => k.box(s((n0 + n1) / 2), y0, ZF + sale / 2, n1 - n0, y1 - y0, sale, color);
/** una imagen pegada a la fachada */
const cuadro = (k, n0, n1, y0, y1, z, fn) => k.pic(s((n0 + n1) / 2), (y0 + y1) / 2, ZF + z, n1 - n0, y1 - y0, 0, 1, tx(n1 - n0, y1 - y0, fn));

/** el 173 */
function casa173(k) {
  pared(k, s(N0), s(T1), ALTO_173, liso(BEIGE));
  pared(k, s(T1), s(T2), ALTO_173C, liso(BEIGE));
  pared(k, s(T1), s(T2), ALTO_173A, liso(BEIGE), -METIDO - 0.3);
  pared(k, s(T2), s(N1), ALTO_173, liso(BEIGE));
  // abajo: el escalón blanco, las cristaleras, la franja gris y las ventanas esmeriladas
  caja(k, N0, N1, 0, 0.26, 0.6, 0xf0f0ec);
  hu(k, -75.55, -64.62, 0.26, 2.74, cristalera173, 0x2a2622);
  caja(k, N0, N1, 2.74, 3.29, 0.08, 0xb8b4ac);
  for (const [n0, n1] of [[-75.46, -73.21], [-72.67, -70.33], [-69.97, -67.59], [-67.04, -64.62]]) hu(k, n0, n1, 3.29, 4.87, esmerilada, 0x2a2622, ZF);
  // arriba: las ventanas de los torreones, el balcón de cristal del medio y la barandilla de la azotea
  hu(k, -75.49, -73.79, 7.1, 8.0, cristales('#2a2622', 2), 0x2a2622, ZF);
  hu(k, -67.0, -64.73, 7.0, 8.2, cristales('#2e7a46', 2), 0x2e7a46, ZF);
  caja(k, T1, T2, ALTO_173C - 0.25, ALTO_173C, 0.1, 0xd8bc90);
  hu(k, -72.17, -70.64, 5.93, 7.3, cristales('#2a2622', 2), 0x2a2622, -METIDO);
  hu(k, -69.39, -67.69, 5.93, 7.3, cristales('#2a4ab0', 2), 0x2a4ab0, -METIDO);
  for (const [n0, n1] of [[-72.69, -70.33], [-69.97, -67.65]]) {
    caja(k, n0, n1, 5.93, 6.71, 0.04, 0x9ab8b4);
    cuadro(k, n0, n1, 5.93, 6.71, 0.045, cristalVerde);
  }
  caja(k, -70.33, -69.97, ALTO_173C, ALTO_173A, 0.15, 0xe2c89e);
  const zb = -METIDO - 0.1;
  k.box(s((T1 + T2) / 2), ALTO_173A + 0.45, zb, T2 - T1, 0.04, 0.04, 0x5a5a58);
  for (let x = s(T1); x <= s(T2); x += 0.12) k.box(x, ALTO_173A, zb, 0.02, 0.47, 0.02, 0x5a5a58);
  caja(k, N0, T1, ALTO_173 - 0.2, ALTO_173, 0.08, 0xd8bc90);
  caja(k, T2, N1, ALTO_173 - 0.2, ALTO_173, 0.08, 0xd8bc90);
}

/** el 175 */
function casa175(k) {
  pared(k, s(N1), s(-57.46), ALTO_175, liso(CREMA));
  pared(k, s(-57.46), s(-55.21), ALTO_TORRE, liso(CREMA));
  pared(k, s(-55.21), s(N2), ALTO_175, liso(CREMA));
  // la tienda de HenryCar: el zócalo de granito, el cartel naranja, la tienda abierta y el letrero negro
  for (const [n0, n1, y1] of [[N1, -62.55, 1.57], [-59.1, -57.46, 1.69], [-55.21, -53.36, 1.55], [-49.84, N2, 1.5]]) {
    caja(k, n0, n1, 0, y1, 0.06, GRIS);
    cuadro(k, n0, n1, 0, y1, 0.062, granitoGris);
  }
  caja(k, N1, -57.46, 3.37, 3.88, 0.1, 0x2a2a2c);
  hu(k, -63.88, -62.66, 2.14, 3.37, cartelHenry, 0xf0f0ec);
  hu(k, -62.55, -59.1, 0.09, 3.37, tiendaHenry, 0x2a2a2c);
  caja(k, -59.1, -57.46, 1.69, 3.37, 0.08, 0x1e1e20);
  cuadro(k, -59.1, -57.46, 1.69, 3.37, 0.082, letreroHenry);
  // la torre de la escalera: la puerta de cristal, el número, la vidriera alta y el arco
  hu(k, -57.01, -55.39, 0.09, 2.52, cristales('#f2f2ee', 2), 0xf2f2ee);
  hu(k, -57.01, -55.39, 2.7, 8.6, vidriera, 0xf2f2ee, ZF);
  caja(k, -57.46, -55.21, ALTO_TORRE - 0.3, ALTO_TORRE, 0.12, 0xe8dcc0);
  // el arco de arriba: dos discos detrás de la vidriera, que solo deja ver su mitad de arriba
  k.cyl(s(-56.2), 8.6, ZF + 0.006, 0.8, 0.8, 0.008, 0xf2f2ee, { seg: 20, rx: Math.PI / 2 });
  k.cyl(s(-56.2), 8.6, ZF + 0.015, 0.7, 0.7, 0.004, 0x5a6a78, { seg: 20, rx: Math.PI / 2 });
  caja(k, -54.37, -53.74, 0.6, 1.07, 0.12, 0xf0f0ec);
  // Almudena Seguros: el escaparate de arcos, el letrero azul y la placa de HRA
  hu(k, -53.36, -49.84, 0.17, 3.23, escaparateArcos, 0xf2f2ee);
  caja(k, -53.34, -49.16, 3.23, 3.78, 0.08, 0x2a4aa8);
  cuadro(k, -53.34, -49.16, 3.23, 3.78, 0.082, letreroAlmudena);
  caja(k, -49.32, -48.9, 1.92, 2.92, 0.04, 0x2a4aa8);
  cuadro(k, -49.32, -48.9, 1.92, 2.92, 0.042, placaHra);
  // arriba: la cornisa de la planta, los cuatro balconcitos con sus ventanas, los faroles, la cornisa y la balaustrada
  caja(k, N1, N2, 3.83, 4.05, 0.3, 0xece2c8);
  for (const [b0, b1, v0, v1] of [[-63.03, -61.23, -62.39, -61.37], [-60.37, -58.68, -59.94, -58.92], [-53.39, -51.82, -53.35, -52.45], [-51.09, -49.07, -50.97, -49.97]]) {
    hu(k, v0, v1, 4.39, 6.64, cristales('#f2f2ee', 2), 0xf2f2ee, ZF);
    caja(k, b0, b1, 4.24, 4.39, 0.62, 0xece2c8);
    k.box(s((b0 + b1) / 2), 4.39, ZF + 0.56, b1 - b0, 1.05, 0.08, 0xf1e8d2);
    k.pic(s((b0 + b1) / 2), 4.915, ZF + 0.605, b1 - b0, 1.05, 0, 1, tx(b1 - b0, 1.05, balaustres));
  }
  for (const n of [-63.1, -58.0, -53.6, -49.3]) k.box(s(n), 6.45, ZF + 0.12, 0.14, 0.28, 0.14, 0x4a3a2a);
  caja(k, N1, N2, 6.89, ALTO_175, 0.35, 0xece2c8);
  for (const [n0, n1] of [[-63.65, -57.82], [-54.5, -48.9]]) {
    k.box(s((n0 + n1) / 2), ALTO_175, ZF - 0.1, n1 - n0, PRETIL - ALTO_175, 0.2, 0xf1e8d2);
    k.pic(s((n0 + n1) / 2), (ALTO_175 + PRETIL) / 2, ZF + 0.004, n1 - n0, PRETIL - ALTO_175, 0, 1, tx(n1 - n0, PRETIL - ALTO_175, balaustres));
  }
}

/** se monta con lo demás */
export function buildAlmudena175(scene, colliders, map) {
  if (!map?.almudena175) return null;
  const k = new Kit();
  casa173(k);
  casa175(k);
  const grupos = [enMarco(k, F, 'almudena175', colliders)];
  // las paredes de los lados (la del aparcamiento, la del solar y la del 173 sobre el 175) y de atrás, lisas
  const lisa = (A, B, alto, nombre, color = '#ecebe6') => tira(A, B, alto, nombre, colliders, (kk, L) => pared(kk, 0, L, alto, liso(color), -0.25));
  grupos.push(lisa(P(N0, FONDO), P(N0), ALTO_173, 'casa173LadoSur', '#f0efea'));
  grupos.push(lisa(P(N1), P(N1, FONDO), ALTO_173, 'casa173LadoNorte', '#e8dcc2'));
  grupos.push(lisa(P(N2), P(N2, FONDO), ALTO_175, 'casa175LadoSolar', '#f0efea'));
  grupos.push(lisa(P(T1, FONDO), P(N0, FONDO), ALTO_173, 'casa173Trasera'));
  grupos.push(lisa(P(N1, FONDO), P(T2, FONDO), ALTO_173, 'casa173TraseraNorte'));
  grupos.push(lisa(P(T2, FONDO), P(T1, FONDO), ALTO_173A, 'casa173TraseraMedio'));
  grupos.push(lisa(P(N2, FONDO), P(N1, FONDO), ALTO_175, 'casa175Trasera'));
  for (const g of grupos) scene.add(g);
  return { grupos };
}
