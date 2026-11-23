import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * El Supermercado Granill, en la esquina de la calle Carlos III 56 con José Pereyra Galviaty (Titerroy), con la
 * vista de la calle de Google de julio de 2025 y la foto del letrero de octubre de 2022 (solo se miran, no van
 * dentro del juego): la pared blanca con el zócalo de piedra en mosaico; el voladizo de la primera planta; la
 * puerta estrecha de aluminio blanco con sus escalones, la caja de la persiana con la reja de rombos asomando y,
 * encima, el letrero blanco de «SUPERMERCADO GRANILL» en letras rojas de molde con las frutas y verduras; las
 * pegatinas de la alarma (sin la marca) y la cajita gris de la izquierda; los dos aparatos del aire
 * acondicionado; y en la pared de la esquina, la pintura de las verduras (la mazorca, la cebolla, los ajos y
 * la tajada de melón). El bloque se queda como está; lo de abajo tapa su trozo.
 */

// la fachada de la esquina (s de izquierda a derecha mirándola; la esquina cae en s 38,8); el rótulo del mapa cae en s 33,0
const G = marco([-452.43, -814.31], [-429.44, -783.04]);
const Z = 0.12, ZF = Z + 0.3, S0 = 29.8, S1 = 38.75, PARED = 0xf0efea, P0 = 34.6, P1 = 35.9, PH = 2.5;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneSupermercadoGranill(map) {
  map.supermercadoGranillSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Supermercado Granill');
  if (i >= 0) map.supermercadoGranillSign = map.signs.splice(i, 1)[0];
  map.supermercadoGranill = true;
}

// ——— lo que se pinta en lienzo ———

/** el letrero blanco: «SUPERMERCADO GRANILL» en rojo y las frutas y verduras de la derecha */
function letrero(g, w, h) {
  g.fillStyle = '#f6f6f2';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c81e28';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.36)}px "Times New Roman", Georgia, serif`;
  g.fillText('SUPERMERCADO', w * 0.33, h * 0.3);
  g.fillText('GRANILL', w * 0.33, h * 0.72);
  // las frutas y verduras: el manojo de hojas verdes, los tomates, el limón y las naranjas
  g.fillStyle = '#3a8a2a';
  for (const [x, y, r] of [[0.72, 0.4, 0.2], [0.78, 0.3, 0.18], [0.84, 0.42, 0.16], [0.66, 0.55, 0.14]]) { g.beginPath(); g.ellipse(w * x, h * y, h * r * 1.4, h * r, -0.4, 0, Math.PI * 2); g.fill(); }
  for (const [x, y, r, c] of [[0.8, 0.62, 0.17, '#d82a2a'], [0.88, 0.58, 0.16, '#c81e1e'], [0.72, 0.7, 0.14, '#e8d040'], [0.94, 0.5, 0.14, '#e88a2a'], [0.86, 0.78, 0.12, '#d82a2a']]) {
    g.fillStyle = c;
    g.beginPath(); g.arc(w * x, h * y, h * r, 0, Math.PI * 2); g.fill();
  }
}

/** el súper por la entrada: el techo con los tubos de luz y las estanterías llenas */
function dentro(g, w, h) {
  g.fillStyle = '#2a2a2e';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8ecf2';
  for (const [x, y] of [[0.3, 0.08], [0.55, 0.14], [0.75, 0.1], [0.45, 0.22], [0.8, 0.26]]) g.fillRect(w * x, h * y, w * 0.08, 3);
  let s = 5;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const col = ['#d84a3a', '#e8c040', '#4a8ad8', '#5aa84a', '#f2f2ee', '#e88a2a'];
  for (const [x0, x1] of [[0.02, 0.3], [0.7, 0.98]]) {
    g.fillStyle = '#c8c8c4';
    g.fillRect(w * x0, h * 0.3, w * (x1 - x0), h * 0.6);
    for (let y = 0.34; y < 0.86; y += 0.1) for (let x = x0 + 0.01; x < x1 - 0.02; x += 0.035) { g.fillStyle = col[Math.floor(r() * 6)]; g.fillRect(w * x, h * y, w * 0.025, h * 0.07); }
  }
  g.fillStyle = '#5a5654';
  g.fillRect(w * 0.3, h * 0.88, w * 0.4, h * 0.12);
}

/** la reja de rombos de la persiana que asoma por debajo de la caja */
function reja(g, w, h) {
  g.fillStyle = '#2a2a2c';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#b8bab8';
  g.lineWidth = 2;
  for (let x = -h; x < w + h; x += h * 0.7) {
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x + h * 0.35, h); g.stroke();
    g.beginPath(); g.moveTo(x + h * 0.35, 0); g.lineTo(x, h); g.stroke();
  }
}

/** el zócalo de piedra en mosaico, de pardos y grises */
function zocalo(g, w, h) {
  g.fillStyle = '#8a8078';
  g.fillRect(0, 0, w, h);
  let s = 11;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const col = ['#6a5a4e', '#a89a8a', '#d8d0c4', '#4a4440', '#b8a890', '#7a6e64'];
  for (let y = 0; y < h; y += 9) for (let x = (y / 9) % 2 ? -7 : 0; x < w; x += 14) {
    g.fillStyle = col[Math.floor(r() * 6)];
    g.fillRect(x + 1, y + 1, 12 + r() * 3, 7);
  }
}

/** la pintura de las verduras de la esquina: la mazorca, la cebolla, los ajos y la tajada de melón */
function mural(g, w, h) {
  g.fillStyle = '#f0efea';
  g.fillRect(0, 0, w, h);
  // la tajada de melón, a la derecha
  g.fillStyle = '#7a9a5a';
  g.beginPath(); g.ellipse(w * 0.82, h * 0.5, w * 0.15, h * 0.42, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#e8d8a0';
  g.beginPath(); g.ellipse(w * 0.84, h * 0.5, w * 0.11, h * 0.34, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#f0efea';
  g.beginPath(); g.ellipse(w * 0.87, h * 0.5, w * 0.06, h * 0.2, 0, 0, Math.PI * 2); g.fill();
  // la cebolla y los ajos
  g.fillStyle = '#d8a050';
  g.beginPath(); g.ellipse(w * 0.55, h * 0.42, w * 0.07, h * 0.2, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#5a8a3a'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(w * 0.55, h * 0.22); g.lineTo(w * 0.53, h * 0.04); g.stroke();
  g.fillStyle = '#e8e4d8';
  for (const [x, y] of [[0.5, 0.75], [0.6, 0.72]]) { g.beginPath(); g.ellipse(w * x, h * y, w * 0.05, h * 0.13, 0, 0, Math.PI * 2); g.fill(); }
  // la mazorca con sus hojas
  g.fillStyle = '#6a8a4a';
  g.beginPath(); g.ellipse(w * 0.25, h * 0.55, w * 0.18, h * 0.12, -0.5, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#e8b840';
  for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(w * (0.12 + i * 0.03), h * (0.7 - i * 0.03), h * 0.045, 0, Math.PI * 2); g.fill(); }
}

// ——— las piezas ———

/** la planta baja: la pared, el zócalo, el voladizo, la entrada con su letrero, la persiana, los aparatos y la pintura */
function fachada(k) {
  const pm = (P0 + P1) / 2, zt = canvasTex(540, 80, zocalo);
  // la pared blanca por delante de lo genérico, con el hueco de la puerta
  for (const [s0, s1, y0] of [[S0, P0 - 0.08, 0], [P1 + 0.08, S1, 0], [P0 - 0.08, P1 + 0.08, PH + 0.35]]) {
    k.box((s0 + s1) / 2, y0, Z + 0.15, s1 - s0, 4.1 - y0, 0.3, PARED);
  }
  k.block((S0 + S1) / 2, Z + 0.15, S1 - S0, 0.3);
  // el zócalo de piedra a los dos lados de la puerta
  for (const [s0, s1] of [[S0, P0 - 0.08], [P1 + 0.08, S1]]) k.pic((s0 + s1) / 2, 0.65, ZF + 0.01, s1 - s0, 1.3, 0, 1, zt);
  // el voladizo de la primera planta
  k.box((S0 + S1) / 2, 4.1, Z + 0.55, S1 - S0, 0.22, 1.1, PARED);
  // la entrada: el súper por dentro, la hoja de aluminio blanco abierta, el marco y los escalones
  k.pic(pm, PH / 2 + 0.3, Z + 0.02, P1 - P0, PH, 0, 1, canvasTex(160, 240, dentro), { glow: 0.2 });
  k.box(P1 - 0.12, 0.45, Z + 0.35, 0.05, PH - 0.45, 0.55, 0xf0f0ee);
  for (const s of [P0 - 0.04, P1 + 0.04]) k.box(s, 0, Z + 0.3, 0.08, PH + 0.35, 0.12, 0xe8e8e6);
  for (const [y, d] of [[0, 0.75], [0.15, 0.5], [0.3, 0.25]]) k.box(pm, y, Z + d / 2, P1 - P0, 0.15, d, 0x9a9896);
  // la caja de la persiana con la reja que asoma y, encima, el letrero
  k.box(pm, PH + 0.08, Z + 0.3, P1 - P0 + 0.2, 0.27, 0.28, 0xe8e8e4);
  k.pic(pm, PH - 0.04, Z + 0.22, P1 - P0, 0.16, 0, 1, canvasTex(160, 20, reja));
  k.box(pm, PH + 0.38, ZF + 0.08, 2.3, 0.5, 0.16, 0xe8e6e0);
  k.pic(pm, PH + 0.63, ZF + 0.165, 2.26, 0.46, 0, 1, canvasTex(520, 104, letrero));
  // las pegatinas de la alarma a los dos lados, la cajita gris y el cubo azul de la puerta
  for (const s of [P0 - 0.45, P1 + 0.35]) k.box(s, 2.15, ZF + 0.01, 0.26, 0.32, 0.02, 0x2a2a2c);
  k.box(P0 - 0.7, 1.55, ZF + 0.03, 0.18, 0.14, 0.06, 0x8a8c90);
  k.cyl(P0 + 0.25, 0, Z + 0.55, 0.16, 0.14, 0.6, 0xe8ecee, { seg: 10 });
  k.cyl(P0 + 0.25, 0.6, Z + 0.55, 0.18, 0.18, 0.06, 0x2a8ac8, { seg: 10 });
  // los dos aparatos del aire acondicionado de la izquierda
  for (const [s, y] of [[31.4, 3.0], [32.9, 2.75]]) {
    k.box(s, y, ZF + 0.2, 0.85, 0.6, 0.32, 0xf2f2f0);
    k.cyl(s - 0.12, y + 0.3, ZF + 0.37, 0.22, 0.22, 0.02, 0x9a9c9e, { seg: 16, rx: Math.PI / 2 });
  }
  // la pintura de las verduras en la pared de la esquina
  k.pic(37.6, 3.25, ZF + 0.01, 2.2, 1.3, 0, 1, canvasTex(220, 130, mural));
}

/** se monta con lo demás de Titerroy */
export function buildSupermercadoGranill(scene, colliders, map) {
  if (!map?.supermercadoGranill) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, G, 'supermercadoGranill', colliders);
  scene.add(group);
  return { group };
}
