import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * El Minimarket Nazaret, en la calle Alcalde Lorenzo Cabrera 5 (Titerroy), con la vista de la calle de Google de
 * julio de 2025 (solo se mira, no va dentro del juego; la gente de la foto no se pone): el bajo de revoco gris y
 * encima la pared color teja; la entrada con las dos hojas de reja blanca abiertas, los carteles de colores de
 * la izquierda y la tienda dentro (las estanterías y el arcón); encima, el letrero blanco con las verduras y
 * «Minimarket Nazaret» en verde con el carrito, y la fila de ventanitas de marco blanco; a la derecha, la caja de
 * los contadores y el portal blanco del número 5; delante, el cubo verde y la farola verde de farol. Los
 * letreros de las empresas de envío de dinero de la foto no se ponen (llevan marca). El bloque se queda como
 * está; lo de abajo tapa su trozo.
 */

// la fachada de la calle Alcalde Lorenzo Cabrera (s de izquierda a derecha mirándola); el rótulo del mapa cae en
// s 11,5, pero en la vista de la calle la tienda está en s 15,5–17,4, junto al portal del 5
const N = marco([-693.53, -652.98], [-666.91, -672.55]);
const Z = 0.12, ZF = Z + 0.3, S0 = 13.6, S1 = 19.6, P0 = 15.55, P1 = 17.35, PH = 2.35;
const REVOCO = 0x9a988e, TEJA = 0xd8ae84;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneMinimarketNazaret(map) {
  map.minimarketNazaretSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Minimarket Nazaret');
  if (i >= 0) map.minimarketNazaretSign = map.signs.splice(i, 1)[0];
  map.minimarketNazaret = true;
}

// ——— lo que se pinta en lienzo ———

/** el letrero blanco: las verduras, las botellas y la cesta a la izquierda y el nombre en verde con el carrito */
function letrero(g, w, h) {
  g.fillStyle = '#f2f4ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8e8c8';
  g.fillRect(0, 0, w, h * 0.08);
  g.fillRect(0, h * 0.92, w, h * 0.08);
  let s = 9;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 40; i++) {
    g.fillStyle = ['#3a8a2a', '#d83a2a', '#e8a030', '#6aa83a', '#a0522d', '#e8d040'][Math.floor(r() * 6)];
    g.beginPath(); g.arc(w * (0.03 + r() * 0.5), h * (0.2 + r() * 0.65), h * (0.06 + r() * 0.08), 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = '#2a7a3a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.22)}px Georgia, "Times New Roman", serif`;
  g.fillText('Minimarket', w * 0.74, h * 0.33);
  g.fillText('Nazaret', w * 0.69, h * 0.66);
  // el carrito
  g.strokeStyle = '#2a7a3a';
  g.lineWidth = 3;
  const cx = w * 0.92, cy = h * 0.64;
  g.beginPath(); g.moveTo(cx - h * 0.18, cy - h * 0.12); g.lineTo(cx + h * 0.14, cy - h * 0.12); g.lineTo(cx + h * 0.08, cy + h * 0.08); g.lineTo(cx - h * 0.12, cy + h * 0.08); g.closePath(); g.stroke();
  for (const d of [-0.08, 0.06]) { g.beginPath(); g.arc(cx + d * h, cy + h * 0.16, h * 0.035, 0, Math.PI * 2); g.stroke(); }
}

/** la tienda por la entrada: las estanterías llenas, el arcón azul y la luz del techo */
function tienda(g, w, h) {
  g.fillStyle = '#3a3634';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8e8e0';
  g.fillRect(w * 0.2, h * 0.04, w * 0.6, h * 0.03);
  let s = 3;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let y = 0.2; y < 0.7; y += 0.08) for (let x = 0.05; x < 0.55; x += 0.04) { g.fillStyle = ['#d84a3a', '#e8c040', '#4a8ad8', '#5aa84a', '#f2f2ee', '#c87a3a'][Math.floor(r() * 6)]; g.fillRect(w * x, h * y, w * 0.03, h * 0.06); }
  g.fillStyle = '#2a5ab8';
  g.fillRect(w * 0.45, h * 0.62, w * 0.4, h * 0.3);
  g.fillStyle = '#c8d8e8';
  g.fillRect(w * 0.47, h * 0.6, w * 0.36, h * 0.04);
  g.fillStyle = '#5a5654';
  g.fillRect(0, h * 0.92, w, h * 0.08);
}

/** una hoja de reja blanca abierta; la de la izquierda con los carteles de colores detrás */
function reja(carteles) {
  return (g, w, h) => {
    g.fillStyle = carteles ? '#3a3634' : '#5a5654';
    g.fillRect(0, 0, w, h);
    if (carteles) {
      for (const [y, c] of [[0.08, '#e8a030'], [0.2, '#3a8ad8'], [0.32, '#d83a5a'], [0.44, '#6aa83a']]) { g.fillStyle = c; g.fillRect(w * 0.12, h * y, w * 0.76, h * 0.1); }
    }
    g.fillStyle = '#f4f4f2';
    g.fillRect(0, 0, w, h * 0.03);
    g.fillRect(0, h * 0.97, w, h * 0.03);
    g.fillRect(0, h * 0.5, w, h * 0.02);
    for (let x = 0; x <= w; x += w / 6) g.fillRect(Math.min(x, w - 3), 0, 3, h);
  };
}

/** el portal blanco de cuarterones del número 5 */
function portal(g, w, h) {
  g.fillStyle = '#f4f4f2';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(0,0,0,.16)';
  g.lineWidth = 2;
  g.beginPath(); g.arc(w / 2, h * 0.12, w * 0.32, Math.PI, 0); g.stroke();
  for (const y of [0.25, 0.48, 0.71]) for (const x of [0.15, 0.55]) g.strokeRect(w * x, h * y, w * 0.3, h * 0.18);
  g.fillStyle = '#2a2a2c';
  g.font = `700 ${Math.round(h * 0.05)}px Arial, sans-serif`;
  g.textAlign = 'center';
  g.fillText('5', w / 2, h * 0.11);
}

// ——— las piezas ———

/** el bajo: la pared, la entrada con las rejas, el letrero, las ventanitas, el portal, el cubo y la farola */
function fachada(k) {
  const pm = (P0 + P1) / 2;
  // la pared por delante de lo genérico: el revoco gris abajo y el color teja arriba, con el hueco de la entrada
  for (const [s0, s1, y0, y1, c] of [[S0, P0, 0, 2.6, REVOCO], [P1, S1, 0, 2.6, REVOCO], [P0, P1, PH, 2.6, REVOCO], [S0, S1, 2.6, 4.2, TEJA]]) {
    k.box((s0 + s1) / 2, y0, Z + 0.15, s1 - s0, y1 - y0, 0.3, c);
  }
  k.box((S0 + S1) / 2, 2.55, ZF + 0.03, S1 - S0, 0.14, 0.08, 0xb8885e);
  k.block((S0 + S1) / 2, Z + 0.15, S1 - S0, 0.3);
  // la entrada: la tienda al fondo, las dos hojas de reja abiertas y el marco
  k.pic(pm, PH / 2, Z + 0.02, P1 - P0, PH, 0, 1, canvasTex(180, 230, tienda), { glow: 0.2 });
  k.pic(P0 + 0.23, PH / 2, Z + 0.25, 0.44, PH, 0, 1, canvasTex(60, 220, reja(true)));
  k.pic(P1 - 0.23, PH / 2, Z + 0.25, 0.44, PH, 0, 1, canvasTex(60, 220, reja(false)));
  for (const s of [P0 - 0.03, P1 + 0.03]) k.box(s, 0, ZF + 0.01, 0.07, PH + 0.05, 0.06, 0xf2f2f0);
  // el letrero y la fila de ventanitas de encima
  k.box(pm, 2.72, ZF + 0.03, P1 - P0 + 0.1, 0.62, 0.06, 0xe8eae4);
  k.pic(pm, 3.03, ZF + 0.065, P1 - P0 + 0.06, 0.58, 0, 1, canvasTex(360, 116, letrero));
  for (let i = 0; i < 4; i++) {
    const a = P0 + i * (P1 - P0) / 4, b = a + (P1 - P0) / 4;
    k.box((a + b) / 2, 3.42, ZF + 0.01, b - a - 0.08, 0.36, 0.02, 0x2a2e34);
  }
  for (let i = 0; i <= 4; i++) k.box(P0 + i * (P1 - P0) / 4, 3.38, ZF + 0.02, 0.06, 0.44, 0.05, 0xf2f2f0);
  for (const y of [3.38, 3.78]) k.box(pm, y, ZF + 0.02, P1 - P0 + 0.06, 0.05, 0.05, 0xf2f2f0);
  // la caja de los contadores y el portal blanco del 5, con su marco de piedra gris
  k.box(17.85, 0.25, ZF + 0.02, 0.45, 0.85, 0.05, 0x8a8880);
  k.box(17.85, 1.25, ZF + 0.02, 0.45, 0.4, 0.05, 0x8a8880);
  k.pic(18.6, 1.05, ZF + 0.01, 0.78, 2.1, 0, 1, canvasTex(80, 216, portal));
  for (const s of [18.16, 19.04]) k.box(s, 0, ZF + 0.02, 0.1, 2.2, 0.06, 0xa8a69e);
  k.box(18.6, 2.12, ZF + 0.02, 0.98, 0.1, 0.06, 0xa8a69e);
  // delante, el cubo verde y la farola verde de farol
  k.box(16.6, 0, ZF + 0.5, 0.55, 0.85, 0.55, 0x3a8a4a);
  k.block(16.6, ZF + 0.5, 0.55, 0.55);
  const sf = 17.9, zf = ZF + 1.1;
  k.cyl(sf, 0, zf, 0.09, 0.12, 0.5, 0x3a7a5a, { seg: 10 });
  k.cyl(sf, 0.5, zf, 0.05, 0.06, 3.0, 0x3a7a5a, { seg: 8 });
  k.box(sf, 3.5, zf, 0.3, 0.4, 0.3, 0xf4ecd0, { list: k.glow });
  k.cyl(sf, 3.9, zf, 0.02, 0.24, 0.16, 0x2a4a3a, { seg: 8 });
  k.block(sf, zf, 0.25, 0.25);
}

/** se monta con lo demás de Titerroy */
export function buildMinimarketNazaret(scene, colliders, map) {
  if (!map?.minimarketNazaret) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, N, 'minimarketNazaret', colliders);
  scene.add(group);
  return { group };
}
