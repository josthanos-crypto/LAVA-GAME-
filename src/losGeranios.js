import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco, trocear } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';
import { paveMesh, polyTris } from './suelos.js';
import { ZF, BLANCO, pared, tira, desconchada, tierraParda } from './rapadurasSur.js';

/**
 * El Bar Cafetería Los Geranios (calle Mina 25, Altavista), su terraza y las casas de al lado hasta la esquina del norte,
 * con las vistas de la calle de Google de julio de 2025 (calle Mina 21, 23, 25 y 27; las fotos del sitio son solo de la
 * comida) y la foto aérea de GRAFCAN (solo se miran, no van dentro del juego). En el mapa era el bloque genérico de 6 m
 * con un hueco que enseñaba la foto aérea. De verdad, de sur a norte:
 * - el solar del 21 al 23: tierra parda con matojos, el muro de bloques del fondo y el cartel de «EN VENTA» (sin el
 *   teléfono);
 * - el 23: la casa color salmón de dos plantas con el bajo de piedra, la puerta de cristales emplomados, la puerta blanca,
 *   los contadores, la puerta doble blanca con su tejadillo gris y, arriba, los dos miradores ocres con las ventanas
 *   blancas;
 * - el 25, Los Geranios: la casa blanca de dos plantas con el cuarto de la azotea y la antena; abajo, la puerta de
 *   cristal con los carteles, el portal, el pilar de piedra, la franja de piedra, la entrada del bar abierta y el letrero
 *   «Los Geranios»; arriba, la ventanita y la ventana grande; y en la acera, la terraza con el toldo, los postes y la
 *   barandilla blancos, las lonas «BAR - CAFETERÍA - RESTAURANTE Los Geranios» (sin los teléfonos) y las mesas;
 * - el 27: la casa vieja blanca de una planta con el portón naranja, la puerta de madera, el ventanuco y la ventana
 *   tapiada, hasta la esquina del aparcamiento.
 */

// la cara de la calle Mina, desde la esquina del hueco del mapa hacia el norte (s en metros), y hacia la calle (z)
const F = marco([141.28, -1734.35], [145.72, -1758.44]);
const UN = F.U, NE = F.N;
// las casas: hasta dónde llega cada una (s) y su altura; todas de 12 m de fondo
const S23 = 2.5, S25 = 12.0, S27 = 18.26, FIN = 24.5, FONDO = 12;
const ALTO23 = 7.8, ALTO25 = 7.3, ALTO27 = 4.6;
const atras = (s, b = FONDO) => F.W(s, -b);
// los vértices del bloque del mapa que cambian: la esquina del norte, la esquina del hueco y el fondo del hueco
const ESQ_N = [145.72, -1758.44], ESQ_H = [141.28, -1734.35], FONDO_H = [121.99, -1737.9];
// el solar: el hueco del mapa, 2,5 m más largo hacia el norte
const SOLAR = [[140.02, -1727.48], F.W(S23, 0), [FONDO_H[0] + UN[0] * S23, FONDO_H[1] + UN[1] * S23], [120.72, -1731.03]];

const SALMON = '#d9937a', OCRE = 0xd8a55a;

/** antes de levantar la ciudad: las tres casas salen del bloque de 6 m y el hueco del solar crece hasta la casa salmón */
export function tuneLosGeranios(map) {
  if (!Array.isArray(map?.buildings)) return;
  const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const r = q => [+q[0].toFixed(2), +q[1].toFixed(2)];
  const b = map.buildings.find(q => !q.skip && !q.edificioReal && Array.isArray(q.p) && [ESQ_N, ESQ_H, FONDO_H].every(v => q.p.some(p => d(p, v) < 0.3)));
  if (!b) return;
  b.p = b.p.map(p => (d(p, ESQ_N) < 0.3 ? r(atras(FIN)) : d(p, ESQ_H) < 0.3 ? r(atras(S23)) : d(p, FONDO_H) < 0.3 ? r(SOLAR[2]) : p));
  for (const [s0, s1, h, f] of [[S23, S25, ALTO23, [217, 147, 122]], [S25, S27, ALTO25, [242, 242, 238]], [S27, FIN, ALTO27, [236, 235, 228]]]) {
    const p = [F.W(s0, 0), atras(s0), atras(s1), F.W(s1, 0)].map(r);
    p.push(p[0].slice());
    map.buildings.push({ p, h, k: 'gen', s: 0, f, c: [200, 196, 188], edificioReal: true });
  }
  map.losGeranios = true;
}

// ——— las texturas ———

const liso = color => (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); };

/** la piedra rústica del bajo: lajas irregulares pardas, ocres y grises con la junta oscura */
function piedra(g, w, h) {
  g.fillStyle = '#4a3a2e';
  g.fillRect(0, 0, w, h);
  let sd = 17;
  const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const tonos = ['#8a6a4a', '#a07a52', '#6e5a48', '#9a8a72', '#7a5a3e', '#b0905e'];
  for (let y = 0; y < h; y += 9) {
    for (let x = -rnd() * 10; x < w; x += 10 + rnd() * 8) {
      g.fillStyle = tonos[Math.floor(rnd() * tonos.length)];
      g.beginPath();
      g.moveTo(x + 1, y + 1 + rnd() * 2);
      g.lineTo(x + 9 + rnd() * 6, y + 1);
      g.lineTo(x + 10 + rnd() * 6, y + 8);
      g.lineTo(x + rnd() * 2, y + 8 + rnd());
      g.closePath();
      g.fill();
    }
  }
}

/** los bloques de cemento sin enfoscar del muro del fondo del solar (de su tamaño: 40 × 20 cm) */
function bloques(g, w, h) {
  g.fillStyle = '#9a968e';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#7a766e';
  g.lineWidth = 1;
  const bw = 9.6, bh = 4.8;
  for (let y = 0, f = 0; y < h; y += bh, f++) {
    g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke();
    for (let x = (f % 2) * bw / 2; x < w; x += bw) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + bh); g.stroke(); }
  }
}

/** la puerta de dos hojas de cristales emplomados del 23 */
function emplomada(g, w, h) {
  g.fillStyle = '#f0f0ec';
  g.fillRect(0, 0, w, h);
  for (const x0 of [0.08, 0.54]) {
    g.fillStyle = '#b8c8bc';
    g.fillRect(w * x0, h * 0.06, w * 0.38, h * 0.88);
    g.strokeStyle = '#5a6a60';
    g.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      const y = h * (0.1 + i * 0.14);
      g.beginPath(); g.ellipse(w * (x0 + 0.19), y + h * 0.06, w * 0.13, h * 0.05, 0, 0, Math.PI * 2); g.stroke();
    }
  }
}

/** una puerta blanca de cuarterones */
function puertaBlanca(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d0d0ca';
  g.lineWidth = 3;
  for (const [y0, y1] of [[0.06, 0.3], [0.36, 0.6], [0.66, 0.94]]) g.strokeRect(w * 0.15, h * y0, w * 0.7, h * (y1 - y0));
  g.fillStyle = '#8a8a86';
  g.fillRect(w * 0.78, h * 0.5, w * 0.08, h * 0.03);
}

/** la puerta doble blanca de aluminio, con los cristales mates */
function puertaDoble(g, w, h) {
  g.fillStyle = '#f0f0ec';
  g.fillRect(0, 0, w, h);
  for (const x0 of [0.06, 0.53]) {
    g.fillStyle = '#d8dcdc';
    g.fillRect(w * x0, h * 0.05, w * 0.41, h * 0.55);
    g.fillStyle = '#e8e8e4';
    g.fillRect(w * x0, h * 0.64, w * 0.41, h * 0.31);
  }
}

/** la puerta de cristal del bar, con los carteles pegados */
function puertaCarteles(g, w, h) {
  g.fillStyle = '#f0f0ec';
  g.fillRect(0, 0, w, h);
  for (const x0 of [0.06, 0.53]) {
    g.fillStyle = '#3a4048';
    g.fillRect(w * x0, h * 0.05, w * 0.41, h * 0.9);
  }
  const carteles = [[0.1, 0.12, '#e84a3a'], [0.6, 0.1, '#f2c232'], [0.62, 0.32, '#ffffff'], [0.12, 0.4, '#5aa0d8']];
  for (const [x, y, c] of carteles) { g.fillStyle = c; g.fillRect(w * x, h * y, w * 0.25, h * 0.14); }
}

/** el bar por dentro, por la entrada abierta: la tele, la máquina de colores y las botellas */
function barDentro(g, w, h) {
  g.fillStyle = '#4a3e36';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#7a6656';
  g.fillRect(w * 0.1, h * 0.1, w * 0.8, h * 0.5);
  g.fillStyle = '#1e1e22';
  g.fillRect(w * 0.15, h * 0.16, w * 0.3, h * 0.18);
  const colores = ['#e84a3a', '#f2c232', '#4ab04a', '#3a7ad8', '#d84ab0'];
  for (let i = 0; i < 6; i++) { g.fillStyle = colores[i % 5]; g.fillRect(w * 0.62, h * (0.16 + i * 0.07), w * 0.18, h * 0.06); }
  g.fillStyle = '#8a8478';
  g.beginPath(); g.moveTo(0, h); g.lineTo(w, h); g.lineTo(w * 0.85, h * 0.62); g.lineTo(w * 0.15, h * 0.62); g.closePath(); g.fill();
  g.fillStyle = '#5a3e2a';
  g.fillRect(w * 0.2, h * 0.55, w * 0.45, h * 0.12);
}

/** el letrero de Los Geranios: blanco, con el nombre en morado y los geranios rosas */
function letreroGeranios(g, w, h) {
  g.fillStyle = '#f6f4f0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#5a2a8a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic bold ${Math.round(h * 0.42)}px "Segoe Script", "Brush Script MT", Georgia, cursive`;
  g.fillText('Los Geranios', w * 0.55, h * 0.36, w * 0.7);
  g.font = `${Math.round(h * 0.15)}px Arial, sans-serif`;
  g.fillText('Bar · Cafetería · Restaurante', w * 0.55, h * 0.68, w * 0.6);
  let sd = 5;
  const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 14; i++) {
    g.fillStyle = rnd() < 0.6 ? '#e85a8a' : '#4a9a4a';
    g.beginPath(); g.arc(w * (0.2 + rnd() * 0.75), h * (0.82 + rnd() * 0.14), h * 0.05, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = '#b8743a';
  g.beginPath(); g.ellipse(w * 0.09, h * 0.6, w * 0.07, h * 0.24, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#e8c070';
  g.beginPath(); g.ellipse(w * 0.09, h * 0.48, w * 0.06, h * 0.1, 0, 0, Math.PI * 2); g.fill();
}

/** la lona de la terraza: «BAR - CAFETERÍA - RESTAURANTE» y «Los Geranios» en morado (sin los teléfonos) */
function lona(g, w, h) {
  g.fillStyle = '#f4f2f6';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c8b8e0';
  g.fillRect(0, h * 0.55, w, h * 0.06);
  g.fillStyle = '#2a2a3a';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.font = `bold ${Math.round(h * 0.2)}px Arial, sans-serif`;
  g.fillText('BAR - CAFETERÍA - RESTAURANTE', w * 0.03, h * 0.18, w * 0.94);
  g.fillStyle = '#5a2a8a';
  g.textAlign = 'center';
  g.font = `italic bold ${Math.round(h * 0.46)}px "Segoe Script", "Brush Script MT", Georgia, cursive`;
  g.fillText('Los Geranios', w * 0.5, h * 0.66, w * 0.8);
}

/** el cartel de «EN VENTA» del solar (sin el teléfono) */
function enVenta(g, w, h) {
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#d42a2a';
  g.fillRect(0, 0, w, h * 0.5);
  g.fillStyle = '#ffffff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `bold ${Math.round(h * 0.32)}px Arial, sans-serif`;
  g.fillText('EN VENTA', w / 2, h * 0.27, w * 0.9);
  g.fillStyle = '#d42a2a';
  g.beginPath(); g.arc(w / 2, h * 0.72, h * 0.1, 0, Math.PI * 2); g.fill();
}

/** el portón naranja de tablas del 27 */
function portonNaranja(g, w, h) {
  g.fillStyle = '#d86a2a';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#a84e1e';
  g.lineWidth = 2;
  for (let x = w / 10; x < w; x += w / 10) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  g.lineWidth = 3;
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
}

/** la puerta vieja de madera de cuarterones del 27 */
function puertaMadera(g, w, h) {
  g.fillStyle = '#9a6a42';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#6a4428';
  g.lineWidth = 2;
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) g.strokeRect(w * (0.12 + j * 0.4), h * (0.05 + i * 0.23), w * 0.34, h * 0.19);
}

// ——— las piezas ———

/** una ventana blanca con su alféizar */
function ventana(k, s, y, w, h, hojas = 2) {
  hueco(k, s, y, w, h, canvasTex(Math.round(w * 50), Math.round(h * 50), cristales('#f2f2ee', hojas, 'rgba(235,232,225,.6)')), { borde: 0xf2f2ee, z: ZF });
}

/** un mirador ocre saliente con las ventanas blancas (los cristales arriba y los paneles blancos abajo) */
function mirador(k, s, w) {
  const z = ZF + 0.25;
  k.box(s, 3.6, z, w + 0.2, 2.9, 0.5, OCRE);
  k.box(s, 3.5, z, w + 0.3, 0.12, 0.56, OCRE);
  k.box(s, 6.5, z, w + 0.3, 0.14, 0.58, OCRE);
  const n = Math.max(3, Math.round(w / 0.75));
  k.pic(s, 5.25, ZF + 0.502, w - 0.2, 1.5, 0, 1, canvasTex(Math.round(w * 50), 75, cristales('#f2f2ee', n, 'rgba(235,232,225,.55)')));
  k.pic(s, 4.15, ZF + 0.502, w - 0.2, 0.7, 0, 1, canvasTex(Math.round(w * 50), 35, liso('#f0f0ec')));
  for (let i = 0; i <= n; i++) k.box(s - (w - 0.2) / 2 + (w - 0.2) * i / n, 3.8, ZF + 0.52, 0.04, 2.2, 0.03, 0xf2f2ee);
}

/** la barandilla blanca de barrotes de la terraza, de s0 a s1 a una distancia z de la pared (o a lo largo de z) */
function barandilla(k, a, b, fijo, aLoLargoDeZ = false) {
  const L = Math.abs(b - a), c = (a + b) / 2;
  const caja = (x, y, h, w) => (aLoLargoDeZ ? k.box(fijo, y, x, 0.05, h, w, BLANCO) : k.box(x, y, fijo, w, h, 0.05, BLANCO));
  caja(c, 1.0, 0.06, L);
  caja(c, 0.12, 0.05, L);
  for (let t = Math.min(a, b) + 0.06; t < Math.max(a, b); t += 0.12) caja(t, 0.12, 0.88, 0.025);
}

/** la terraza de Los Geranios en la acera: los postes, el toldo, la barandilla, las lonas y las mesas */
function terraza(k) {
  const s0 = 9.3, s1 = 19.0, z0 = ZF + 0.05, z1 = ZF + 2.3;
  for (const s of [s0, 11.7, 14.15, 16.6, s1]) k.box(s, 0, z1, 0.1, 2.85, 0.1, BLANCO);
  for (const s of [s0, s1]) k.box(s, 0, z0 + 0.05, 0.1, 3.0, 0.1, BLANCO);
  k.box((s0 + s1) / 2, 2.85, z1, s1 - s0 + 0.1, 0.1, 0.1, BLANCO);
  // el toldo, con su faldón
  k.box((s0 + s1) / 2, 2.92, (z0 + z1) / 2, s1 - s0 + 0.3, 0.04, z1 - z0 + 0.2, 0xdcb49a);
  k.box((s0 + s1) / 2, 2.62, z1 + 0.08, s1 - s0 + 0.3, 0.3, 0.03, 0xd4a888);
  // la barandilla de delante (con el hueco de la entrada) y la de los lados
  barandilla(k, s0, 13.5, z1);
  barandilla(k, 14.7, s1, z1);
  for (const s of [s0, s1]) barandilla(k, z0 + 0.1, z1, s, true);
  // las lonas de la barandilla, por delante y en el lado del sur
  k.pic(16.8, 1.45, z1 + 0.03, 2.6, 0.6, 0, 1, canvasTex(260, 60, lona));
  k.pic(s0 - 0.03, 1.45, (z0 + z1) / 2, 1.8, 0.5, -1, 0, canvasTex(180, 50, lona));
  // las mesas con sus sillas oscuras
  for (const s of [10.6, 12.6, 16.0, 18.0]) {
    k.table(s, ZF + 1.2, { w: 0.75, d: 0.75, top: 0xa8845a, leg: 0x2e2a26 });
    k.chair(s - 0.6, ZF + 1.2, Math.PI / 2, 0x2e2a28);
    k.chair(s + 0.6, ZF + 1.2, -Math.PI / 2, 0x2e2a28);
  }
  // los choques: la barandilla de delante (sin la entrada) y los lados
  k.block((s0 + 13.5) / 2, z1, 13.5 - s0, 0.1);
  k.block((14.7 + s1) / 2, z1, s1 - 14.7, 0.1);
  for (const s of [s0, s1]) k.block(s, (z0 + z1) / 2, 0.1, z1 - z0);
}

/** la casa salmón del 23 */
function casa23(k) {
  pared(k, S23, S25, ALTO23, liso(SALMON));
  k.box((S23 + S25) / 2, 0, ZF + 0.03, S25 - S23, 3.3, 0.06, 0x7a5e44);
  k.pic((S23 + S25) / 2, 1.65, ZF + 0.062, S25 - S23, 3.3, 0, 1, canvasTex(228, 80, piedra));
  k.box((S23 + S25) / 2, 3.3, ZF + 0.08, S25 - S23, 0.12, 0.16, OCRE);
  hueco(k, 4.05, 0, 1.5, 2.5, canvasTex(90, 150, emplomada), { borde: 0xf0f0ec, z: ZF + 0.07 });
  hueco(k, 6.05, 0, 0.9, 2.3, canvasTex(54, 138, puertaBlanca), { borde: 0xf0f0ec, z: ZF + 0.07 });
  for (const y of [0.55, 1.15]) k.box(6.95, y, ZF + 0.12, 0.45, 0.5, 0.14, 0xeaeae6);
  hueco(k, 9.5, 0, 2.2, 2.7, canvasTex(132, 162, puertaDoble), { borde: 0xf0f0ec, z: ZF + 0.07 });
  k.box(9.5, 2.85, ZF + 0.35, 2.6, 0.12, 0.62, 0x8a8e92);
  k.box(9.5, 2.75, ZF + 0.65, 2.6, 0.22, 0.04, 0x7a7e82);
  // arriba: los dos miradores ocres y la ventanita del medio
  mirador(k, 4.2, 2.4);
  mirador(k, 9.4, 3.0);
  ventana(k, 6.75, 4.8, 0.8, 1.0);
  k.box((S23 + S25) / 2, ALTO23 - 0.15, ZF + 0.06, S25 - S23, 0.15, 0.12, OCRE);
}

/** la casa blanca del 25, Los Geranios */
function casa25(k) {
  pared(k, S25, S27, ALTO25, liso('#f2f2ee'));
  // la franja de piedra de encima de las puertas y el pilar de piedra entre el portal y el bar
  k.box(14.3, 3.06, ZF + 0.03, 4.6, 0.32, 0.06, 0x7a5e44);
  k.pic(14.3, 3.22, ZF + 0.062, 4.6, 0.32, 0, 1, canvasTex(110, 8, piedra));
  k.box(15.45, 0, ZF + 0.03, 0.9, 3.06, 0.06, 0x7a5e44);
  k.pic(15.45, 1.53, ZF + 0.062, 0.9, 3.06, 0, 1, canvasTex(22, 74, piedra));
  // abajo: la puerta de cristal con los carteles, el portal y la entrada abierta del bar con la caja de la persiana
  hueco(k, 12.85, 0, 1.6, 2.6, canvasTex(96, 156, puertaCarteles), { borde: 0xf0f0ec, z: ZF + 0.07 });
  hueco(k, 14.55, 0, 0.8, 2.3, canvasTex(48, 138, puertaBlanca), { borde: 0xf0f0ec, z: ZF + 0.07 });
  hueco(k, 17.1, 0, 2.2, 2.9, canvasTex(132, 174, barDentro), { borde: 0xd8d8d4, z: ZF + 0.07 });
  k.box(17.1, 2.98, ZF + 0.1, 2.3, 0.32, 0.2, 0x9a9a98);
  k.box(13.6, 3.55, ZF + 0.08, 0.4, 0.3, 0.12, 0xe4e4e0);
  // el letrero de Los Geranios, en dos tablas un poco abiertas
  for (const lado of [-1, 1]) {
    const ang = 0.18, ancho = 1.2, sx = 17.03 + lado * Math.cos(ang) * ancho / 2, sz = ZF + 0.12 + Math.sin(ang) * ancho / 2;
    k.box(sx, 3.47, sz, ancho, 0.6, 0.04, 0xe8e6e0, { ry: lado * ang });
    k.pic(sx + lado * Math.sin(ang) * 0.03, 3.77, sz + Math.cos(ang) * 0.03, ancho - 0.04, 0.56, lado * Math.sin(ang), Math.cos(ang), canvasTex(150, 70, letreroGeranios));
  }
  // arriba: la ventanita, la ventana grande con su montante, la de la escalera y el pretil
  ventana(k, 13.25, 4.9, 0.9, 1.0);
  ventana(k, 17.0, 4.6, 2.1, 1.35);
  hueco(k, 17.0, 6.05, 2.1, 0.3, canvasTex(105, 15, cristales('#f2f2ee', 2)), { borde: 0xf2f2ee, z: ZF });
  ventana(k, 15.1, 6.45, 0.6, 0.6, 1);
  k.box((S25 + S27) / 2, ALTO25, ZF - 0.1, S27 - S25, 0.12, 0.24, 0xe8e8e4);
  // el cuarto de la azotea, con su ventana y la antena parabólica
  k.box(15.15, ALTO25, ZF - 1.25, 1.7, 1.3, 2.5, 0xf2f2ee);
  k.box(15.15, ALTO25 + 1.3, ZF - 1.25, 1.8, 0.08, 2.6, 0xe4e4e0);
  ventana(k, 15.1, ALTO25 + 0.3, 0.55, 0.6, 1);
  k.ball(14.45, ALTO25 + 1.1, ZF - 0.3, 0.32, 0xd8d8d4, { sx: 0.35, sy: 1, sz: 1, seg: 12 });
  k.cyl(14.5, ALTO25 + 0.7, ZF - 0.3, 0.03, 0.03, 0.45, 0x8a8a88, { seg: 6 });
  terraza(k);
}

/** la casa vieja del 27 */
function casa27(k) {
  pared(k, S27, FIN, ALTO27, desconchada);
  hueco(k, 19.93, 0, 2.06, 2.9, canvasTex(124, 174, portonNaranja), { borde: 0xb8562a, z: ZF + 0.03 });
  hueco(k, 21.8, 0, 0.85, 2.4, canvasTex(51, 144, puertaMadera), { borde: 0x6a4428, z: ZF + 0.03 });
  k.box(22.7, 0.9, ZF + 0.1, 0.6, 0.7, 0.16, 0xe0dfda);
  hueco(k, 23.3, 2.8, 0.7, 0.3, canvasTex(42, 18, liso('#6a4a30')), { borde: 0x5a3e28, z: ZF + 0.03 });
  k.box(24.0, 1.0, ZF + 0.02, 0.8, 1.2, 0.04, 0x9a968e);
  k.box((S27 + FIN) / 2, ALTO27 - 0.3, ZF + 0.06, FIN - S27, 0.3, 0.12, 0xe4e2dc);
}

/** el solar: el muro de bloques del fondo, el cartel de «EN VENTA» y los matojos */
function solar(k) {
  k.cyl(-2.0, 0, -1.6, 0.03, 0.03, 1.9, 0x6a6a68, { seg: 6 });
  k.box(-2.0, 1.45, -1.6, 0.75, 0.55, 0.03, 0xf2f2ee);
  k.pic(-2.0, 1.725, -1.58, 0.72, 0.52, 0, 1, canvasTex(72, 52, enVenta));
  let sd = 23;
  const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 26; i++) {
    const s = -6.6 + rnd() * 8.8, z = -0.6 - rnd() * 18.5, t = 0.15 + rnd() * 0.3, verde = rnd() < 0.5;
    k.ball(s, 0.18, z, t, verde ? 0x7a8a3a : 0xa8925a, { sx: 1.3, sy: 0.55, sz: 1.2, seg: 7 });
  }
}

/** se monta con lo demás */
export function buildLosGeranios(scene, colliders, map) {
  if (!map?.losGeranios) return null;
  const k = new Kit(), ks = new Kit();
  casa23(k);
  casa25(k);
  casa27(k);
  solar(ks);
  const grupos = [enMarco(k, F, 'losGeranios', colliders), enMarco(ks, F, 'losGeraniosSolar', null)];
  // las paredes lisas de los lados y de atrás que asoman por encima de las casas de al lado y del bloque de 6 m
  const lisa = (A, B, alto, nombre, tex = liso('#ecebe6')) => tira(A, B, alto, nombre, colliders, (kk, L) => pared(kk, 0, L, alto, tex, -0.25));
  grupos.push(lisa(atras(S23), F.W(S23, 0), ALTO23, 'losGeraniosLadoSolar'));
  grupos.push(lisa(F.W(FIN, 0), atras(FIN), ALTO27, 'losGeraniosLadoNorte'));
  grupos.push(lisa(F.W(S27, 0), atras(S27), ALTO25, 'losGeraniosLado25'));
  grupos.push(lisa(atras(S25), atras(S23), ALTO23, 'losGeraniosTrasera23'));
  grupos.push(lisa(atras(S27), atras(S25), ALTO25, 'losGeraniosTrasera25'));
  grupos.push(lisa([120.72, -1731.03], SOLAR[2], 2.8, 'losGeraniosMuroSolar', bloques));
  for (const g of grupos) scene.add(g);
  const suelo = paveMesh(trocear(polyTris(SOLAR), 2), 0.18, tierraParda(), 0xf0e4d4);
  if (suelo) { suelo.name = 'losGeraniosSolarTierra'; scene.add(suelo); }
  return { grupos, suelo };
}
