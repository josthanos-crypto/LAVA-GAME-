import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alturaBloque } from './edificioReal.js';
import { tira, lienzoCorrido, juntarLienzos } from './kitFachada.js';

/**
 * El Centro de Salud de Titerroy, en la calle Doctor Juan Negrín, con la vista de la calle de Google de julio de 2025
 * (solo se mira). Edificio de dos plantas: el zócalo de bloque gris oscuro, encima los paneles color crema con sus
 * juntas, y dos trozos enteros de bloque gris (uno a la izquierda, con su puerta verde y la visera, y el de la esquina
 * del este). Arriba, las ventanas con las contraventanas verdes abiertas; abajo, las ventanas apaisadas de marco verde.
 * En la punta de la izquierda, dos ventanas altas y estrechas y otra puerta verde. En la cara del este, las ventanas
 * altas y estrechas. La foto no lleva rótulo, así que no se pone ninguno.
 * s va del noroeste (0) al sureste por la calle; z hacia la calle.
 */

const CALLE = marco([-808.76, -480.15], [-773.72, -449.79]);
const ESTE = marco([-773.72, -449.79], [-752.72, -472.98]);
const H = 8.4, ZOC = 2.3, Z = 0.25;
const GRIS_TR = [[7, 16], [41.2, 46.4]];
const VERDE = 0x2e6b3a;

export function tuneCentroSaludTiterroy(map) {
  if (!alturaBloque(map, -784, -479, H, [216, 202, 168])) return;
  map.centroSaludTiterroy = true;
}

function panel(g, w, h) {
  g.fillStyle = '#d8c9a4';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(140,124,92,.5)';
  g.lineWidth = 1.5;
  for (let y = 0; y < h; y += h / 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  for (let x = 0; x < w; x += w / 4) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
}

function bloque(g, w, h) {
  g.fillStyle = '#66696b';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(40,42,44,.55)';
  g.lineWidth = 1.2;
  const fila = h / 14;
  for (let r = 0; r < 14; r++) {
    const y = r * fila;
    g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke();
    for (let x = (r % 2) * (w / 10); x < w; x += w / 5) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + fila); g.stroke(); }
  }
}

function cristal(g, w, h) {
  g.fillStyle = '#2e6b3a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#3c474b';
  g.fillRect(4, 4, w - 8, h - 8);
  g.fillStyle = 'rgba(230,235,230,.3)';
  g.fillRect(4, 4, w - 8, (h - 8) * 0.45);
  g.fillStyle = '#2e6b3a';
  g.fillRect(w / 2 - 2, 0, 4, h);
}

function puerta(g, w, h) {
  g.fillStyle = '#2e6b3a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(0,0,0,.25)';
  for (let x = 6; x < w; x += 7) g.fillRect(x, 6, 2, h - 12);
}

let PANEL, BLOQUE, CRISTAL, PUERTA;

function pared(k, L, grises) {
  const zp = Z + 0.012;
  tira(k, 0, L, 0, Z / 2, H, Z, 0xd8c9a4);
  k.block(L / 2, Z / 2, L, Z);
  lienzoCorrido(k, 0, L, 0, ZOC, zp, BLOQUE);
  let s = 0;
  for (const [a, b] of [...grises, [L, L]]) {
    if (a > s) lienzoCorrido(k, s, a, ZOC, H, zp, PANEL);
    if (b > a) lienzoCorrido(k, a, b, ZOC, H, zp, BLOQUE);
    s = b;
  }
  tira(k, 0, L, H - 0.2, Z + 0.05, 0.2, 0.12, 0xcabb96, k.solid);
}

/** la ventana de arriba con las dos contraventanas verdes abiertas contra la pared */
function ventanaContra(k, s, y = 5.0) {
  const zp = Z + 0.02;
  k.pic(s, y + 0.7, zp, 0.9, 1.4, 0, 1, CRISTAL);
  for (const d of [-0.7, 0.7]) k.box(s + d, y, zp + 0.03, 0.46, 1.4, 0.05, VERDE);
  k.box(s, y - 0.06, zp + 0.06, 1.1, 0.06, 0.14, 0xe4dccb);
}

function calle(k) {
  const L = CALLE.len, zp = Z + 0.02;
  pared(k, L, GRIS_TR);
  // la punta de la izquierda: dos ventanas altas y estrechas y la puerta
  for (const s of [2.4, 4.4]) k.pic(s, 5.6, zp, 0.55, 2.6, 0, 1, CRISTAL);
  k.pic(1.6, 1.15, zp, 1.3, 2.3, 0, 1, PUERTA);
  // el trozo gris: ventanas arriba, la visera y la puerta
  for (const s of [8.4, 10.6, 12.8, 15.0]) ventanaContra(k, s);
  k.box(11.5, 3.2, zp + 0.4, 4.2, 0.18, 0.9, 0xd8d4cc);
  k.pic(11.6, 1.15, zp, 1.4, 2.3, 0, 1, PUERTA);
  for (const s of [8.4, 14.6]) k.pic(s, 2.9, zp, 1.0, 0.6, 0, 1, CRISTAL);
  // el trozo grande de paneles: diez ventanas arriba y la fila de ventanas apaisadas abajo
  for (let i = 0; i < 10; i++) ventanaContra(k, 18 + i * 2.45);
  for (let i = 0; i < 7; i++) k.pic(18.6 + i * 3.4, 2.95, zp, 1.6, 0.6, 0, 1, CRISTAL);
  k.pic(42.6, 2.95, zp, 2.4, 0.6, 0, 1, CRISTAL);
}

function este(k) {
  const L = ESTE.len, zp = Z + 0.02;
  pared(k, L, []);
  for (let s = 3; s < L - 2; s += 2.4) k.pic(s, 5.4, zp, 0.55, 2.8, 0, 1, CRISTAL);
}

export function buildCentroSaludTiterroy(scene, colliders, map) {
  if (!map?.centroSaludTiterroy) return null;
  PANEL = canvasTex(160, 180, panel);
  BLOQUE = canvasTex(160, 160, bloque);
  CRISTAL = canvasTex(64, 64, cristal);
  PUERTA = canvasTex(64, 112, puerta);
  return [[CALLE, 'centroSaludTiterroyCalle', calle], [ESTE, 'centroSaludTiterroyEste', este]].map(([M, n, f]) => {
    const k = new Kit();
    f(k);
    juntarLienzos(k);
    const g = enMarco(k, M, n, colliders);
    scene.add(g);
    return g;
  });
}
