import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * La Zumería, la zumería y bocadillería de la calle Hermanos Zerolo 34 (centro), en la plazoleta junto a la calle
 * Fajardo, con la vista de la calle de Google de julio de 2025 y las fotos de Google Maps de 2020 a 2025 (solo se
 * miran, no van dentro del juego; la gente no se pone): la casa terrera blanca con su zócalo gris y la cornisa; el
 * escaparate de marco turquesa con «Zumería» escrito en blanco en el cristal y, dentro, la pared naranja, la barra
 * de madera, las plantas y la piña; encima, el letrerito blanco de «La Zumería» con las frutas; la puerta abierta de
 * marco turquesa con el local naranja dentro; las dos puertas turquesa de cuarterones cerradas; el cajetín del
 * contador; y la terraza en la plazoleta: las mesas de metal claro con las sillas negras, la mesita naranja delante
 * del escaparate y las sombrillas blancas cerradas. La pizarra de los zumos lleva precios y no se pone. El bloque
 * del mapa (más alto que la casa de verdad) se queda como está; lo de abajo tapa su trozo.
 */

// la cara de la plazoleta (s de oeste a este, hasta la esquina en s 12,6); la vista de la calle pone la casa en
// s 0,6–9,3 (el rótulo del mapa caía en s 9,6, en la puerta turquesa del final)
const M = marco([-154.58, 70.47], [-142.84, 75.02]);
const Z = 0.12, ZF = Z + 0.3, S0 = 0.6, S1 = 9.3, YC = 3.7, BLANCO = 0xf2f0ea, TURQUESA = 0x2a8a92;

/** antes de levantar la ciudad: fuera el rótulo genérico (y su terraza genérica) */
export function tuneLaZumeria(map) {
  map.laZumeriaSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'La Zumeria' && Math.hypot(s.x + 145.6, s.z - 74) < 15);
  if (i >= 0) map.laZumeriaSign = map.signs.splice(i, 1)[0];
  map.laZumeria = true;
}

// ——— lo que se pinta en lienzo ———

/** el escaparate: dentro la pared naranja, la barra de madera, las plantas y la piña; «Zumería» en el cristal */
function escaparate(g, w, h) {
  g.fillStyle = '#e8702a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f2f0ea';
  g.fillRect(0, 0, w, h * 0.15);
  g.fillStyle = '#9a5a2a';
  g.fillRect(w * 0.55, h * 0.45, w * 0.45, h * 0.55);
  g.strokeStyle = '#7a4420';
  g.lineWidth = 2;
  for (let x = w * 0.58; x < w; x += w * 0.06) { g.beginPath(); g.moveTo(x, h * 0.45); g.lineTo(x, h); g.stroke(); }
  g.fillStyle = '#c8ccd0';
  g.fillRect(w * 0.6, h * 0.3, w * 0.36, h * 0.15);
  for (const x of [0.12, 0.38]) {
    g.fillStyle = '#e8e4dc';
    g.fillRect(w * (x - 0.05), h * 0.62, w * 0.1, h * 0.2);
    g.fillStyle = '#4a8a3a';
    g.beginPath(); g.ellipse(w * x, h * 0.48, w * 0.1, h * 0.16, 0, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = '#e8c02a';
  g.beginPath(); g.ellipse(w * 0.78, h * 0.22, w * 0.03, h * 0.07, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(210,225,235,.22)';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4f4f0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 700 ${Math.round(h * 0.17)}px "Segoe Script", "Brush Script MT", cursive`;
  g.fillText('Zumería', w * 0.5, h * 0.5);
}

/** el letrerito blanco de «La Zumería» con las frutas */
function letrerito(g, w, h) {
  g.fillStyle = '#f6f4ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#8a2a2a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 700 ${Math.round(h * 0.42)}px "Segoe Script", "Brush Script MT", cursive`;
  g.fillText('La Zumería', w * 0.5, h * 0.32);
  const frutas = ['#e8702a', '#e8c02a', '#c83a2a', '#6ab04a', '#e8702a', '#d84a6a', '#e8c02a', '#6ab04a'];
  frutas.forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(w * (0.1 + i * 0.115), h * 0.76, h * 0.14, 0, Math.PI * 2); g.fill(); });
}

/** el local por la puerta abierta: la pared naranja, la nevera y las sillas */
function dentro(g, w, h) {
  g.fillStyle = '#d8682a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f2f0ea';
  g.fillRect(0, 0, w, h * 0.12);
  g.fillStyle = '#c8ccd0';
  g.fillRect(w * 0.08, h * 0.25, w * 0.35, h * 0.5);
  g.fillStyle = '#e8702a';
  g.fillRect(w * 0.55, h * 0.62, w * 0.3, h * 0.05);
  g.fillStyle = '#2a2a2c';
  g.fillRect(w * 0.55, h * 0.67, w * 0.04, h * 0.2);
  g.fillRect(w * 0.81, h * 0.67, w * 0.04, h * 0.2);
  g.fillStyle = '#8a7a6a';
  g.fillRect(0, h * 0.88, w, h * 0.12);
  g.fillStyle = 'rgba(0,0,0,.2)';
  g.fillRect(0, 0, w, h);
}

/** la puerta turquesa de cuarterones, cerrada */
function puertaTurquesa(g, w, h) {
  g.fillStyle = '#2a8a92';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(0,0,0,.3)';
  g.lineWidth = 3;
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
  for (const x of [0.08, 0.56]) for (const [y, hh] of [[0.06, 0.4], [0.52, 0.42]]) g.strokeRect(w * x, h * y, w * 0.36, h * hh);
  g.fillStyle = 'rgba(255,255,255,.1)';
  for (const x of [0.08, 0.56]) g.fillRect(w * x + 3, h * 0.06 + 3, w * 0.36 - 6, h * 0.05);
}

// ——— las piezas ———

/** la casa terrera: la pared blanca, el zócalo, la cornisa y los huecos */
function fachada(k) {
  const huecos = [[1.95, 3.35, 0.3, 1.65], [3.55, 4.55, 0, 2.25], [5.4, 6.43, 0, 2.2], [7.27, 8.29, 0, 2.2]];
  let s = S0;
  for (const [a, b, y0, y1] of [...huecos, [S1, S1, 0, 0]]) {
    if (a > s) k.box((s + a) / 2, 0, Z + 0.15, a - s, YC, 0.3, BLANCO);
    if (b > a) {
      if (y0 > 0) k.box((a + b) / 2, 0, Z + 0.15, b - a, y0, 0.3, BLANCO);
      k.box((a + b) / 2, y1, Z + 0.15, b - a, YC - y1, 0.3, BLANCO);
    }
    s = b;
  }
  k.block((S0 + S1) / 2, Z + 0.15, S1 - S0, 0.3);
  // el zócalo gris y la cornisa
  k.box((S0 + S1) / 2, 0, ZF + 0.01, S1 - S0, 0.3, 0.04, 0x8a8c8e);
  k.box((S0 + S1) / 2, YC - 0.12, ZF + 0.04, S1 - S0 + 0.1, 0.16, 0.12, 0xc8c8c4);
  // el escaparate con su marco turquesa y el letrerito de encima
  k.pic(2.65, 0.975, Z + 0.04, 1.4, 1.35, 0, 1, canvasTex(160, 154, escaparate), { glow: 0.15 });
  for (const t of [1.95, 3.35]) k.box(t, 0.3, Z + 0.12, 0.08, 1.35, 0.1, TURQUESA);
  for (const y of [0.3, 1.6]) k.box(2.65, y, Z + 0.12, 1.48, 0.07, 0.1, TURQUESA);
  k.box(2.6, 1.86, ZF + 0.01, 1.3, 0.42, 0.04, 0xf6f4ee);
  k.pic(2.6, 2.07, ZF + 0.035, 1.28, 0.4, 0, 1, canvasTex(256, 80, letrerito));
  // la puerta abierta con el local dentro, y su marco turquesa
  k.pic(4.05, 1.125, Z + 0.04, 1.0, 2.25, 0, 1, canvasTex(100, 225, dentro), { glow: 0.2 });
  for (const t of [3.55, 4.55]) k.box(t, 0, Z + 0.12, 0.09, 2.25, 0.1, TURQUESA);
  k.box(4.05, 2.2, Z + 0.12, 1.08, 0.08, 0.1, TURQUESA);
  // las dos puertas turquesa cerradas
  const pt = canvasTex(100, 220, puertaTurquesa);
  for (const [a, b] of [[5.4, 6.43], [7.27, 8.29]]) {
    k.pic((a + b) / 2, 1.1, Z + 0.04, b - a, 2.2, 0, 1, pt);
    for (const t of [a, b]) k.box(t, 0, Z + 0.12, 0.08, 2.2, 0.1, 0x1e6a72);
    k.box((a + b) / 2, 2.15, Z + 0.12, b - a + 0.08, 0.08, 0.1, 0x1e6a72);
  }
  // el cajetín del contador y la plaquita azul
  k.box(4.85, 1.3, ZF + 0.02, 0.32, 0.4, 0.08, 0xe8e6e0);
  k.box(1.25, 1.85, ZF + 0.01, 0.22, 0.16, 0.02, 0x2a5ab8);
}

/** la terraza de la plazoleta: mesas de metal claro, sillas negras, la mesita naranja y las sombrillas cerradas */
function terraza(k) {
  for (const [s, z] of [[5.6, 1.6], [7.2, 1.6], [8.8, 1.6], [5.6, 3.2], [7.2, 3.2], [8.8, 3.2], [10.4, 2.4]]) {
    k.table(s, ZF + z, { w: 0.7, d: 0.7, h: 0.75, top: 0xc8ccd0, leg: 0x8a8c90 });
    k.chair(s - 0.52, ZF + z, Math.PI / 2, 0x1e1e20, { legs: 0x1e1e20 });
    k.chair(s + 0.52, ZF + z, -Math.PI / 2, 0x1e1e20, { legs: 0x1e1e20 });
    k.block(s, ZF + z, 0.7, 0.7);
  }
  k.table(2.65, ZF + 0.85, { w: 0.6, d: 0.6, h: 0.74, top: 0xe8702a, leg: 0x6a6c70, round: true });
  k.chair(2.0, ZF + 0.85, Math.PI / 2, 0x6a6c70, { legs: 0x6a6c70 });
  k.chair(3.3, ZF + 0.85, -Math.PI / 2, 0x6a6c70, { legs: 0x6a6c70 });
  k.block(2.65, ZF + 0.85, 0.6, 0.6);
  // las sombrillas blancas cerradas
  for (const s of [6.4, 9.6]) {
    k.cyl(s, 0, ZF + 2.4, 0.22, 0.26, 0.08, 0x3a3d42, { seg: 10 });
    k.cyl(s, 0.08, ZF + 2.4, 0.025, 0.025, 2.5, 0xc8c2b4, { seg: 6 });
    k.cyl(s, 1.3, ZF + 2.4, 0.06, 0.2, 1.3, 0xf2f2ee, { seg: 8 });
    k.block(s, ZF + 2.4, 0.3, 0.3);
  }
}

/** se monta con lo demás de Arrecife Centro */
export function buildLaZumeria(scene, colliders, map) {
  if (!map?.laZumeria) return null;
  const k = new Kit();
  fachada(k);
  terraza(k);
  const group = enMarco(k, M, 'laZumeria', colliders);
  scene.add(group);
  return { group };
}
