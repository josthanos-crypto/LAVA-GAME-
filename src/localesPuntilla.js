import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, hueco, enMarco, aRasDelSuelo, sentados, cuarterones, barra, SERIF, WHITE, AZUL_D } from './restaurantesCharco.js';

/**
 * Dos locales de La Puntilla, al sur del Charco, con las fotos de internet de Google Maps (solo se miran, no
 * van dentro del juego):
 *  - el restaurante La Puntilla, en el paseo de la avenida César Manrique: la pared encalada con las piedras
 *    volcánicas negras alrededor de los huecos, la ventana azul de contraventanas, la puerta azul de arco con
 *    el abanico de cristal, el rótulo «La Puntilla», la tabla de madera de «Comidas y Vinos», el salvavidas,
 *    el alero azul y la terraza de mesas y sillas de madera oscura;
 *  - el Bar Enrique, en la esquina de la calle Academia: la buganvilla roja que trepa por la pared hasta el
 *    balcón, el balcón de la esquina con los dos arcos y el antepecho de celosía, la cancela verde, el cierre
 *    marrón del garaje y la puerta del bar. La calle es de coches en el juego y llega a la pared: sin
 *    terraza (en la foto, la calle es estrecha y no entran coches).
 */

// La Puntilla: la cara del noroeste de su casa, hacia el paseo (s de la esquina norte a la oeste)
const P = marco([312.3, 249.3], [307.5, 255.3]);
// el Bar Enrique: la cara del sureste hacia la calle Academia (s del oeste al este)
const E = marco([291.8, 302.9], [299.7, 294.6]);

/** antes de levantar la ciudad: fuera los rótulos rojos genéricos de los dos */
export function tuneLocalesPuntilla(map) {
  map.localesPuntillaSigns = [];
  for (const name of ['La Puntilla', 'Bar Enrique']) {
    const i = (map.signs || []).findIndex(s => s.name === name);
    if (i >= 0) map.localesPuntillaSigns.push(map.signs.splice(i, 1)[0]);
  }
  map.localesPuntilla = true;
}

// ——— lo que se pinta en lienzo ———

/** la pared encalada con las piedras volcánicas negras sueltas (las del recercado de los huecos) */
function paredPiedras(g, w, h) {
  g.fillStyle = '#f0efe8';
  g.fillRect(0, 0, w, h);
  let s = 3;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  g.fillStyle = '#1f1d1c';
  // las piedras van por el borde de los huecos (la ventana en 0,1–0,4 y la puerta en 0,52–0,78 del ancho)
  const piedra = (x, y) => { g.beginPath(); g.ellipse(x, y, 10 + r() * 14, 7 + r() * 9, r() * 3, 0, Math.PI * 2); g.fill(); };
  for (const [x0, x1, y0] of [[0.1, 0.4, 0.38], [0.52, 0.78, 0.18]]) {
    for (let y = y0; y < 0.98; y += 0.09) { piedra(w * x0 - 14, h * y); piedra(w * x1 + 14, h * y); }
    for (let x = x0; x <= x1; x += 0.05) if (r() < 0.6) piedra(w * x, h * y0 - 14);
  }
  for (let i = 0; i < 6; i++) piedra(w * (0.42 + r() * 0.08), h * (0.4 + r() * 0.5));
}

/** el rótulo «La Puntilla» en letras marrones sueltas sobre la pared */
function rotuloPuntilla(g, w, h) {
  g.clearRect(0, 0, w, h);
  g.fillStyle = '#3a2418';
  g.fillRect(0, h * 0.1, w, h * 0.8);
  g.fillStyle = '#f2ece0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 700 ${Math.round(h * 0.62)}px "Segoe Script", "Brush Script MT", cursive`;
  g.fillText('La Puntilla', w / 2, h * 0.52);
}

/** la tabla de madera colgada: «Comidas y Vinos» y «Wine & Food» */
function tablaVinos(g, w, h) {
  g.fillStyle = '#6a4630';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#4a2e1e';
  g.lineWidth = 4;
  g.strokeRect(3, 3, w - 6, h - 6);
  g.fillStyle = '#efe4cc';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `600 ${Math.round(h * 0.17)}px ${SERIF}`;
  g.fillText('Comidas y Vinos', w / 2, h * 0.3);
  g.font = `${Math.round(h * 0.12)}px ${SERIF}`;
  g.fillText('· · ·', w / 2, h * 0.5);
  g.font = `600 ${Math.round(h * 0.15)}px ${SERIF}`;
  g.fillText('Wine & Food', w / 2, h * 0.72);
}

/** la puerta azul de arco con el abanico de cristal (la parte de abajo, la del arco va aparte) */
function puertaArco(g, w, h) {
  g.fillStyle = '#2a64b8';
  g.fillRect(0, 0, w, h);
  // el abanico de arriba
  const cx = w / 2, cy = w / 2, rr = w / 2 - 6;
  g.fillStyle = '#c8dcea';
  g.beginPath(); g.arc(cx, cy, rr, Math.PI, 0); g.fill();
  g.strokeStyle = '#2a64b8';
  g.lineWidth = 5;
  for (let i = 1; i < 6; i++) { const a = Math.PI + (i * Math.PI) / 6; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); g.stroke(); }
  g.beginPath(); g.arc(cx, cy, rr * 0.35, Math.PI, 0); g.stroke();
  // las dos hojas de tablas
  g.strokeStyle = '#1d4f9c';
  g.lineWidth = 4;
  g.beginPath(); g.moveTo(w / 2, cy); g.lineTo(w / 2, h); g.stroke();
  for (const x0 of [8, w / 2 + 4]) g.strokeRect(x0, cy + 10, w / 2 - 12, h - cy - 18);
  g.fillStyle = '#c9b27a';
  g.beginPath(); g.arc(w / 2 + 10, h * 0.62, 4, 0, Math.PI * 2); g.fill();
}

/** el salvavidas redondo de la pared */
function salvavidas(g, w, h) {
  g.clearRect(0, 0, w, h);
  g.fillStyle = '#8a5a34';
  g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#d8d0c0';
  g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 12, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#7a8a90';
  g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 22, 0, Math.PI * 2); g.fill();
}

/** la celosía del antepecho del balcón */
function celosiaBalcon(g, w, h) {
  g.fillStyle = '#f2f1ec';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#9aa0a4';
  for (let x = 6; x < w - 6; x += 12) for (let y = 8; y < h - 8; y += 12) g.fillRect(x, y, 6, 6);
}

/** el cierre del garaje, de lamas marrones */
function cierreMarron(g, w, h) {
  g.fillStyle = '#7a4a2e';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#5a3420';
  for (let y = 0; y < h; y += 9) g.fillRect(0, y, w, 2);
}

/** la puerta del bar, abierta, con el bar oscuro dentro */
function puertaBar(g, w, h) {
  g.fillStyle = '#1f1c1a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,214,150,.18)';
  g.fillRect(w * 0.15, h * 0.15, w * 0.7, h * 0.45);
  g.strokeStyle = '#2f6b3e';
  g.lineWidth = 8;
  g.strokeRect(0, 0, w, h);
}

// ——— las piezas ———

/** el arco de la puerta de La Puntilla: un aro azul sobre el hueco */
function arcoAzul(k, s, y0, w) {
  const forma = new THREE.Shape();
  const r = w / 2 + 0.1;
  forma.absarc(0, 0, r, 0, Math.PI, false);
  forma.lineTo(-r + 0.12, 0);
  forma.absarc(0, 0, r - 0.12, Math.PI, 0, true);
  forma.lineTo(r, 0);
  const g = new THREE.ExtrudeGeometry(forma, { depth: 0.1, bevelEnabled: false });
  g.translate(s, y0, 0.04);
  k.add(g, AZUL_D);
}

/** la terraza de La Puntilla: mesas de madera oscura y sus sillas, y las sombrillas blancas cerradas */
function terrazaPuntilla(k) {
  const mesas = [];
  for (const [s, z] of [[0.9, 2.2], [3.0, 2.4], [5.0, 2.2], [1.9, 4.2], [4.1, 4.3]]) {
    k.table(s, z, { w: 0.8, d: 0.8, h: 0.75, top: 0x3a2a22, leg: 0x2a2220 });
    k.chair(s - 0.6, z, Math.PI / 2, 0x5a3a28, { legs: 0x3a2a22 });
    k.chair(s + 0.6, z, -Math.PI / 2, 0x5a3a28, { legs: 0x3a2a22 });
    k.block(s, z, 0.8, 0.8);
    mesas.push([s, z]);
  }
  // las sombrillas blancas cerradas, de pie junto a la pared
  for (const s of [-0.6, -0.1]) {
    k.cyl(s, 0, 0.6, 0.2, 0.22, 0.06, 0x3a3d42, { seg: 10 });
    k.cyl(s, 0.06, 0.6, 0.025, 0.025, 2.6, 0xd8d8d4, { seg: 6 });
    k.cyl(s, 1.0, 0.6, 0.06, 0.16, 1.7, 0xf2f2ee, { seg: 8 });
    k.block(s, 0.6, 0.3, 0.3);
  }
  return mesas;
}

/** La Puntilla, en el marco P (de s 0 a 5,6; detrás, en la misma cara, sigue el otro local) */
function puntilla(k) {
  const s0 = 0.0, s1 = 5.6, H = 4.6;
  k.box((s0 + s1) / 2, 0, 0.02, s1 - s0, H, 0.04, WHITE);
  k.pic((s0 + s1) / 2, H / 2, 0.045, s1 - s0, H, 0, 1, canvasTex(512, 420, paredPiedras));
  // la ventana azul con sus contraventanas abiertas
  hueco(k, 1.4, 1.0, 1.5, 1.3, canvasTex(192, 168, cuarterones(1, 1)), { borde: AZUL_D, z: 0.06 });
  for (const sg of [-1, 1]) k.box(1.4 + sg * 1.08, 1.0, 0.1, 0.62, 1.32, 0.04, AZUL_D);
  // la puerta azul de arco
  const pd = 3.6, wd = 1.4;
  k.pic(pd, 1.5, 0.07, wd, 3.0, 0, 1, canvasTex(160, 344, puertaArco));
  arcoAzul(k, pd, 3.0 - wd / 2, wd);
  for (const sg of [-1, 1]) k.box(pd + sg * (wd / 2 + 0.05), 0, 0.09, 0.12, 3.0 - wd / 2, 0.1, AZUL_D);
  // el rótulo, la tabla de los vinos, el salvavidas y el alero azul de arriba
  k.pic(1.4, 2.95, 0.07, 1.9, 0.42, 0, 1, canvasTex(380, 84, rotuloPuntilla));
  k.pic(5.0, 3.0, 0.07, 1.0, 0.7, 0, 1, canvasTex(200, 140, tablaVinos));
  k.pic(5.0, 1.75, 0.07, 0.65, 0.65, 0, 1, canvasTex(96, 96, salvavidas));
  k.box((s0 + s1) / 2, H - 0.15, 0.12, s1 - s0, 0.18, 0.24, AZUL_D);
}

/** la buganvilla: un tronco que sube y las matas de flores rojas y hojas verdes por la pared */
function buganvilla(k, s0, s1, y1) {
  let sd = 17;
  const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  barra(k, [s0 + 0.4, 0, 0.12], [s0 + 0.9, y1 * 0.6, 0.18], 0.08, 0x5a4030);
  barra(k, [s0 + 0.9, y1 * 0.6, 0.18], [s1 - 0.6, y1 - 0.3, 0.2], 0.06, 0x5a4030);
  // las matas: pequeñas y planas contra la pared, más espesas arriba, mitad flor y mitad hoja
  for (let i = 0; i < 90; i++) {
    const t = Math.sqrt(r()), s = s0 + 0.3 + r() * (s1 - s0 - 0.3), y = 1.2 + t * (y1 - 1.2), z = 0.12 + r() * 0.3, rad = 0.14 + r() * 0.2;
    const flor = r() < 0.55;
    k.ball(s, y, z, rad, flor ? [0xb8204a, 0xd0306a, 0xa8183c, 0xc84078][i % 4] : [0x3a6a2a, 0x2f5a24][i % 2], { sx: 1.4, sy: 0.9, sz: 0.5, seg: 6 });
  }
}

/** el Bar Enrique, en el marco E */
function enrique(k) {
  const L = E.len;
  // la cancela verde de hierro y su pilar
  for (let x = 0.6; x <= 2.2; x += 0.13) k.box(x, 0, 0.12, 0.035, 2.1, 0.035, 0x2f6b3e);
  for (const y of [0.1, 1.0, 2.05]) k.box(1.4, y, 0.12, 1.65, 0.05, 0.05, 0x2f6b3e);
  // la puerta del bar
  hueco(k, 4.4, 0, 1.2, 2.4, canvasTex(144, 288, puertaBar), { borde: 0x2f6b3e });
  // la buganvilla por la pared, del portón al balcón
  buganvilla(k, 2.4, 7.6, 6.2);
  // el cierre marrón del garaje, a la derecha
  hueco(k, 9.6, 0, 2.4, 2.6, canvasTex(240, 260, cierreMarron), { borde: 0xe8e6e0 });
  // el balcón de la esquina: el suelo que sale, el antepecho de celosía y los dos arcos blancos encima
  const b0 = 7.8, b1 = L - 0.1, yb = 3.6;
  k.box((b0 + b1) / 2, yb - 0.15, 0.6, b1 - b0, 0.15, 1.2, WHITE);
  k.box((b0 + b1) / 2, yb, 1.18, b1 - b0, 0.9, 0.06, WHITE);
  k.pic((b0 + b1) / 2, yb + 0.45, 1.215, b1 - b0 - 0.2, 0.7, 0, 1, canvasTex(256, 72, celosiaBalcon));
  const ancho = (b1 - b0) / 2;
  for (let i = 0; i < 2; i++) {
    const c = b0 + ancho * (i + 0.5);
    const arco = new THREE.Shape();
    arco.moveTo(-ancho / 2, 0); arco.lineTo(ancho / 2, 0); arco.lineTo(ancho / 2, 2.6); arco.lineTo(-ancho / 2, 2.6); arco.lineTo(-ancho / 2, 0);
    const hueco2 = new THREE.Path();
    const rr = ancho / 2 - 0.2;
    hueco2.moveTo(-rr, 0.9); hueco2.absarc(0, 1.6, rr, Math.PI, 0, true); hueco2.lineTo(rr, 0.9); hueco2.lineTo(-rr, 0.9);
    arco.holes.push(hueco2);
    const g = new THREE.ExtrudeGeometry(arco, { depth: 0.2, bevelEnabled: false });
    g.translate(c, yb, 1.0);
    k.add(g, WHITE);
  }
  k.box((b0 + b1) / 2, yb + 2.6, 0.6, b1 - b0 + 0.1, 0.18, 1.3, WHITE);
  // el letrero de «prohibido el paso» de la esquina
  k.cyl(L - 0.2, 2.6, 0.25, 0.3, 0.3, 0.04, 0xc8282a, { seg: 16, rx: Math.PI / 2 });
  k.box(L - 0.2, 2.57, 0.28, 0.4, 0.07, 0.02, 0xf2f2f2);
}

// la gente de la terraza de La Puntilla (sin nombre: no hablan)
const CLIENTES = [
  { sex: 'f', skin: 0xe8c4a2, hair: 0x6a4a2a, hairStyle: 'ponytail', top: 0x2a6ab0, bottom: 0x2a2f3a, height: 1.65 },
  { sex: 'm', skin: 0xc8916c, hair: 0x15110e, hairStyle: 'short', top: 0xe8e2d4, bottom: 0x3b4a66, height: 1.78 },
  { sex: 'm', skin: 0xf1d3b8, hair: 0x8c8580, hairStyle: 'short', top: 0x8a3a3a, bottom: 0x3a3a40, height: 1.72, beard: true },
].map(l => ({ eyes: 0x3a2616, topStyle: 'tshirt', bottomStyle: 'pants', shoes: 0x2a2c30, shoeStyle: 'shoe', build: 1, ...l }));

/** segunda fase, con los locales ya hechos */
export function buildLocalesPuntilla(scene, colliders, map, locales) {
  if (!map?.localesPuntilla) return null;
  const group = new THREE.Group();
  group.name = 'localesPuntilla';
  const kP = new Kit();
  puntilla(kP);
  group.add(enMarco(kP, P, 'laPuntilla', colliders));
  const kT = new Kit();
  const mesas = terrazaPuntilla(kT);
  const terraza = enMarco(kT, P, 'terrazaLaPuntilla', colliders);
  const kE = new Kit();
  enrique(kE);
  group.add(terraza, enMarco(kE, E, 'barEnrique', colliders));
  scene.add(group);
  aRasDelSuelo(scene, terraza);
  const gente = sentados(scene, locales, P, mesas, CLIENTES, [[0, 1], [1, -1], [3, 1]]);
  return { group, gente };
}
