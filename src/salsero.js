import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * El Salsero, el bar cafetería de la esquina de la calle Lebrillo con Santander, con las fotos de Google
 * Maps (solo se miran, no van dentro del juego): la casa blanca con todo lo de madera pintado de azul
 * fuerte. En la cara de Lebrillo, el letrero luminoso azul con «Bar Cafetería» y «El Salsero» en letras
 * negras inclinadas, la caja negra del toldo con «BAR · El Salsero · CAFE», la puerta con su marco azul
 * grueso y el bar dentro, la caja del contador y los cables que doblan la esquina. En la cara de
 * Santander, la placa azul de la calle Lebrillo y la ventana con su reja azul de volutas. La terraza de
 * toldo azul de la foto está en la calzada y en el juego ahí no cabe: no se pone. El bloque se queda como
 * está.
 */

// la cara de la calle Lebrillo (s desde el extremo del este; la esquina queda en s = L.len)
const L = marco([-567.49, -310.04], [-606.89, -318.86]);
// la cara de la calle Santander (s desde la esquina)
const S = marco([-606.89, -318.86], [-612.99, -312.52]);
const Z = 0.12, S0 = 31.0, ALTO = 4.0, BLANCO = 0xf2f2ee, AZUL = 0x1c3cc8, NEGRO = 0x161618;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneSalsero(map) {
  map.salseroSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'El Salsero');
  if (i >= 0) map.salseroSign = map.signs.splice(i, 1)[0];
  map.salsero = true;
}

// ——— lo que se pinta en lienzo ———

/** el letrero luminoso: el azul con sus brillos, «Bar Cafetería» y «El Salsero» */
function letrero(g, w, h) {
  const gr = g.createLinearGradient(0, 0, w, h);
  gr.addColorStop(0, '#2638d8');
  gr.addColorStop(0.5, '#4a5cf4');
  gr.addColorStop(1, '#2232c8');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.12)';
  for (let x = -h; x < w; x += w / 6) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + h * 0.6, 0); g.lineTo(x + h * 0.9, 0); g.lineTo(x + h * 0.3, h); g.fill(); }
  g.textBaseline = 'middle';
  g.fillStyle = '#101018';
  g.textAlign = 'right';
  g.font = `italic 700 ${Math.round(h * 0.22)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('Bar Cafetería', w * 0.95, h * 0.24);
  g.textAlign = 'left';
  g.font = `italic 900 ${Math.round(h * 0.62)}px "Arial Black", Arial, sans-serif`;
  g.lineWidth = h * 0.05;
  g.strokeStyle = '#9ab8ff';
  g.strokeText('El Salsero', w * 0.04, h * 0.62);
  g.fillText('El Salsero', w * 0.04, h * 0.62);
  g.strokeStyle = '#f2f2ee';
  g.lineWidth = 6;
  g.strokeRect(3, 3, w - 6, h - 6);
}

/** la caja negra del toldo: BAR, El Salsero en letra de mano y CAFE */
function cajaToldo(g, w, h) {
  g.fillStyle = '#161618';
  g.fillRect(0, 0, w, h);
  g.textBaseline = 'middle';
  g.textAlign = 'center';
  g.fillStyle = '#f2f2ee';
  g.font = `900 ${Math.round(h * 0.6)}px "Arial Black", Arial, sans-serif`;
  g.fillText('BAR', w * 0.22, h * 0.52);
  g.fillText('CAFE', w * 0.78, h * 0.52);
  g.fillStyle = '#d83a3a';
  g.font = `italic 700 ${Math.round(h * 0.62)}px "Brush Script MT", "Segoe Script", cursive`;
  g.fillText('El Salsero', w * 0.5, h * 0.55);
}

/** por la puerta: el bar en penumbra, la barra, las mesitas y la máquina de colores */
function dentro(g, w, h) {
  g.fillStyle = '#5a5650';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8e4dc';
  g.fillRect(0, 0, w, h * 0.55);
  g.fillStyle = '#8a847a';
  g.fillRect(0, h * 0.78, w, h * 0.22);
  // la barra del fondo
  g.fillStyle = '#3a3634';
  g.fillRect(w * 0.45, h * 0.5, w * 0.55, h * 0.2);
  // la máquina de colores de la entrada
  g.fillStyle = '#202024';
  g.fillRect(w * 0.08, h * 0.3, w * 0.38, h * 0.7);
  for (const [c, x] of [['#e8c040', 0.14], ['#e8502a', 0.26], ['#3a6ad8', 0.36]]) { g.fillStyle = c; g.beginPath(); g.ellipse(w * x, h * 0.8, w * 0.04, h * 0.18, 0.2, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#c8c4bc';
  g.fillRect(w * 0.12, h * 0.36, w * 0.3, h * 0.14);
  // la mesita y su silla
  g.fillStyle = '#2a2a2c';
  g.fillRect(w * 0.6, h * 0.72, w * 0.25, h * 0.03);
  g.fillRect(w * 0.71, h * 0.72, w * 0.03, h * 0.2);
}

/** la ventana de Santander: el bar dentro, el cristal abierto y la reja azul de volutas */
function ventana(g, w, h) {
  g.fillStyle = '#e8e6e0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c8d4dc';
  g.fillRect(w * 0.55, 0, w * 0.45, h * 0.75);
  g.fillStyle = 'rgba(255,255,255,.35)';
  g.fillRect(w * 0.6, h * 0.05, w * 0.12, h * 0.6);
  g.fillStyle = '#b8b0a4';
  for (let y = 0.2; y < 0.7; y += 0.16) g.fillRect(w * 0.05, h * y, w * 0.45, h * 0.02);
  g.fillStyle = '#d8d2c8';
  g.fillRect(0, h * 0.75, w, h * 0.25);
  // la reja: los barrotes y las volutas, finos
  g.strokeStyle = '#1c3cc8';
  g.lineWidth = w * 0.022;
  for (const x of [0.02, 0.26, 0.5, 0.74, 0.98]) { g.beginPath(); g.moveTo(w * x, 0); g.lineTo(w * x, h); g.stroke(); }
  for (const y of [0.015, 0.34, 0.67, 0.985]) { g.beginPath(); g.moveTo(0, h * y); g.lineTo(w, h * y); g.stroke(); }
  g.lineWidth = w * 0.012;
  for (const [x0, x1] of [[0.02, 0.26], [0.26, 0.5], [0.5, 0.74], [0.74, 0.98]]) for (const [y0, y1] of [[0.015, 0.34], [0.34, 0.67], [0.67, 0.985]]) {
    const cx = w * (x0 + x1) / 2, r = w * (x1 - x0) * 0.2, ya = h * (y0 + (y1 - y0) * 0.3), yb = h * (y0 + (y1 - y0) * 0.7);
    g.beginPath(); g.arc(cx, ya, r, Math.PI * 0.5, Math.PI * 2.2); g.stroke();
    g.beginPath(); g.arc(cx, yb, r, -Math.PI * 0.5, Math.PI * 1.2); g.stroke();
    g.beginPath(); g.moveTo(cx, ya + r); g.lineTo(cx, yb - r); g.stroke();
  }
}

/** la placa azul de la calle */
function placa(g, w, h) {
  g.fillStyle = '#1c3cc8';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#f2f2ee';
  g.lineWidth = 4;
  g.strokeRect(5, 5, w - 10, h - 10);
  g.fillStyle = '#f2f2ee';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `600 ${Math.round(h * 0.16)}px Arial, sans-serif`;
  g.fillText('CALLE', w / 2, h * 0.42);
  g.font = `700 ${Math.round(h * 0.2)}px Arial, sans-serif`;
  g.fillText('LEBRILLO', w / 2, h * 0.68);
}

// ——— las piezas ———

/** la cara de la calle Lebrillo */
function caraLebrillo(k) {
  const S1 = L.len + 0.12, sm = (S0 + S1) / 2;
  k.box(sm, 0, Z - 0.05, S1 - S0, ALTO, 0.1, BLANCO);
  // la puerta con su marco azul grueso y el bar dentro
  const a = 35.6, b = 37.1, hp = 2.45;
  k.pic((a + b) / 2, hp / 2, Z + 0.004, b - a, hp, 0, 1, canvasTex(120, 196, dentro), { glow: 0.05 });
  for (const s of [a, b]) k.box(s, 0, Z + 0.04, 0.2, hp + 0.1, 0.1, AZUL);
  k.box((a + b) / 2, hp - 0.05, Z + 0.04, b - a + 0.2, 0.2, 0.1, AZUL);
  // la caja del contador
  k.box(38.7, 1.15, Z + 0.06, 0.55, 0.45, 0.12, 0xdcdcd8);
  // la caja negra del toldo y el letrero luminoso de encima
  k.box(37.0, 2.55, Z + 0.15, 6.4, 0.3, 0.3, NEGRO);
  k.pic(37.0, 2.7, Z + 0.305, 6.36, 0.28, 0, 1, canvasTex(640, 28, cajaToldo));
  k.box(37.3, 2.95, Z + 0.09, 4.7, 0.8, 0.18, 0xf2f2ee);
  k.pic(37.3, 3.35, Z + 0.185, 4.64, 0.74, 0, 1, canvasTex(512, 82, letrero), { glow: 0.15 });
  // los cables negros que van por la pared hasta la esquina
  k.box(36.5, 2.42, Z + 0.02, 9.0, 0.04, 0.04, NEGRO);
}

/** la cara de la calle Santander */
function caraSantander(k) {
  const s1 = S.len;
  k.box(s1 / 2, 0, Z - 0.05, s1 + 0.12, ALTO, 0.1, BLANCO);
  // la placa de la calle, junto a la esquina
  k.pic(0.6, 2.6, Z + 0.01, 0.42, 0.32, 0, 1, canvasTex(120, 92, placa));
  // la ventana con la reja azul y su marco
  const a = 1.4, b = 3.0, y0 = 0.3, y1 = 2.25;
  k.pic((a + b) / 2, (y0 + y1) / 2, Z + 0.01, b - a, y1 - y0, 0, 1, canvasTex(240, 292, ventana), { glow: 0.04 });
  for (const s of [a, b]) k.box(s, y0 - 0.06, Z + 0.04, 0.14, y1 - y0 + 0.12, 0.1, AZUL);
  for (const y of [y0 - 0.1, y1 - 0.02]) k.box((a + b) / 2, y, Z + 0.04, b - a + 0.14, 0.12, 0.1, AZUL);
  k.box((a + b) / 2, y0 - 0.12, Z + 0.08, b - a + 0.3, 0.06, 0.16, AZUL);
  // los cables siguen por esta cara
  k.box(2.0, 2.42, Z + 0.02, 4.0, 0.04, 0.04, NEGRO);
}

/** segunda fase, como los demás de este barrio */
export function buildSalsero(scene, colliders, map) {
  if (!map?.salsero) return null;
  const kL = new Kit(), kS = new Kit();
  caraLebrillo(kL);
  caraSantander(kS);
  const group = new THREE.Group();
  group.add(enMarco(kL, L, 'salseroLebrillo', colliders), enMarco(kS, S, 'salseroSantander', colliders));
  scene.add(group);
  return { group };
}
