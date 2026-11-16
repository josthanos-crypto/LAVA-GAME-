import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * Casa Emiliano, el café bar de la calle Democracia 30 (centro), con la vista de la calle de Google de julio de
 * 2025 (solo se mira, no va dentro del juego): la casa terrera blanca con la cal desconchada y los cables por
 * arriba; el zócalo de granito negro a la izquierda con el portón de madera; la entrada del bar con las puertas
 * de madera abiertas (cristal arriba, cuarterones abajo), la barra con los taburetes dentro y las dos rejas
 * negras abiertas a los lados; encima, el letrero luminoso en V con «Casa Emiliano» y «Café • Bar»; y los
 * cajetines blancos de la luz. El bloque se queda como está; lo de abajo tapa su trozo.
 */

// la fachada de la calle Democracia (s de izquierda a derecha mirándola: de sur a norte); el bar va en la punta
// del norte del bloque, donde lo ponen el rótulo del mapa, Google y la vista de la calle
const E = marco([-373.32, 478.56], [-372.43, 441.08]);
const Z = 0.12, ZF = Z + 0.3, S0 = 27.0, S1 = 37.45, P0 = 34.35, P1 = 36.85, PH = 2.6;

/** antes de levantar la ciudad: fuera el rótulo genérico (y su terraza genérica, que en la foto no está) */
export function tuneCasaEmiliano(map) {
  map.casaEmilianoSign = null;
  const i = (map.signs || []).findIndex(s => /Bar Emiliano/.test(s.name));
  if (i >= 0) map.casaEmilianoSign = map.signs.splice(i, 1)[0];
  map.casaEmiliano = true;
}

// ——— lo que se pinta en lienzo ———

/** la cal blanca con los desconchones */
function cal(g, w, h) {
  g.fillStyle = '#f2f0ea';
  g.fillRect(0, 0, w, h);
  let s = 13;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 9; i++) {
    g.fillStyle = ['#d8ccb8', '#cfc2ac', '#e0d6c4'][Math.floor(r() * 3)];
    const x = r() * w, y = h * (0.35 + r() * 0.3);
    g.beginPath(); g.ellipse(x, y, w * (0.01 + r() * 0.025), h * (0.02 + r() * 0.03), r(), 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = 'rgba(0,0,0,.05)';
  for (let i = 0; i < 300; i++) g.fillRect(r() * w, r() * h, 2, 2);
}

/** el granito negro pulido del zócalo, en placas */
function granito(g, w, h) {
  g.fillStyle = '#2a2a2c';
  g.fillRect(0, 0, w, h);
  let s = 7;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 900; i++) { const v = 40 + r() * 70; g.fillStyle = `rgb(${v},${v},${v + 3})`; g.fillRect(r() * w, r() * h, 2, 2); }
  g.fillStyle = 'rgba(0,0,0,.5)';
  for (let x = 0; x < w; x += w / 3) g.fillRect(x, 0, 2, h);
  g.fillRect(0, h / 2, w, 2);
}

/** el portón de madera de cuarterones */
function porton(g, w, h) {
  g.fillStyle = '#6a3a22';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(0,0,0,.35)';
  g.lineWidth = 3;
  for (const y of [0.06, 0.4, 0.7]) g.strokeRect(w * 0.15, h * y, w * 0.7, h * 0.26);
  g.fillStyle = '#c8a050';
  g.fillRect(w * 0.4, h * 0.36, w * 0.2, h * 0.02);
}

/** el bar por la puerta: la barra, los taburetes, las botellas y la luz */
function bar(g, w, h) {
  g.fillStyle = '#3a2e28';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8d8b8';
  g.fillRect(w * 0.25, h * 0.04, w * 0.5, h * 0.03);
  g.fillStyle = '#5a4436';
  g.fillRect(w * 0.2, h * 0.3, w * 0.8, h * 0.12);
  for (let x = 0.24; x < 0.95; x += 0.05) { g.fillStyle = ['#8a5a2a', '#4a7a3a', '#c8a050', '#6a2a2a'][Math.floor(x * 40) % 4]; g.fillRect(w * x, h * 0.22, w * 0.025, h * 0.08); }
  g.fillStyle = '#d8d0c4';
  g.fillRect(w * 0.15, h * 0.5, w * 0.85, h * 0.06);
  g.fillStyle = '#8a6a4a';
  g.fillRect(w * 0.15, h * 0.56, w * 0.85, h * 0.24);
  g.fillStyle = '#1e1e20';
  for (const x of [0.35, 0.6]) { g.fillRect(w * (x - 0.06), h * 0.58, w * 0.12, h * 0.025); g.fillRect(w * x - 2, h * 0.6, 4, h * 0.3); }
  g.fillStyle = '#9a9488';
  g.fillRect(0, h * 0.88, w, h * 0.12);
}

/** una hoja de madera abierta: cristal arriba y cuarterones abajo */
function hoja(g, w, h) {
  g.fillStyle = '#8a5a32';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#4a5a6a';
  g.fillRect(w * 0.12, h * 0.06, w * 0.76, h * 0.52);
  g.fillStyle = 'rgba(255,255,255,.18)';
  g.fillRect(w * 0.12, h * 0.06, w * 0.3, h * 0.52);
  g.strokeStyle = 'rgba(0,0,0,.35)';
  g.lineWidth = 3;
  for (const y of [0.64, 0.82]) g.strokeRect(w * 0.15, h * y, w * 0.7, h * 0.14);
}

/** una reja negra abierta, recogida contra la pared blanca */
function reja(g, w, h) {
  g.fillStyle = '#f0eee8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#1e1e20';
  g.fillRect(0, 0, w, h * 0.025);
  g.fillRect(0, h * 0.975, w, h * 0.025);
  g.fillRect(0, h * 0.5, w, h * 0.015);
  for (let x = 0; x <= w; x += w / 5) g.fillRect(Math.min(x, w - 3), 0, 3, h);
}

/** una cara del letrero luminoso: el bocadillo y la caña a la derecha, el nombre y «Café • Bar» */
function letrero(g, w, h) {
  const gr = g.createLinearGradient(0, 0, w, 0);
  gr.addColorStop(0, '#f6f0e4');
  gr.addColorStop(0.6, '#f0dcc0');
  gr.addColorStop(1, '#d8a060');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c83a2a';
  g.lineWidth = 4;
  g.strokeRect(2, 2, w - 4, h - 4);
  g.fillStyle = '#c87a3a';
  g.beginPath(); g.ellipse(w * 0.87, h * 0.66, w * 0.09, h * 0.13, -0.2, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#e8b840';
  g.fillRect(w * 0.88, h * 0.14, w * 0.06, h * 0.36);
  g.fillStyle = '#7a2a1e';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.font = `400 ${Math.round(h * 0.24)}px Georgia, "Times New Roman", serif`;
  g.fillText('Casa', w * 0.08, h * 0.25);
  g.fillText('Emiliano', w * 0.05, h * 0.55);
  g.font = `400 ${Math.round(h * 0.16)}px Georgia, "Times New Roman", serif`;
  g.fillText('Café • Bar', w * 0.08, h * 0.84);
}

// ——— las piezas ———

/** la casa terrera: la cal, el zócalo, el portón, la entrada del bar con sus hojas y rejas, el letrero y los cables */
function fachada(k) {
  const pm = (P0 + P1) / 2, rt = canvasTex(60, 260, reja), ht = canvasTex(60, 260, hoja);
  // la pared blanca por delante de lo genérico, con el hueco de la entrada
  for (const [s0, s1, y0] of [[S0, P0, 0], [P1, S1, 0], [P0, P1, PH]]) {
    k.box((s0 + s1) / 2, y0, Z + 0.15, s1 - s0, 4.0 - y0, 0.3, 0xf2f0ea);
  }
  k.block((S0 + S1) / 2, Z + 0.15, S1 - S0, 0.3);
  k.pic((S0 + P0) / 2, 2.0, ZF + 0.005, P0 - S0, 4.0, 0, 1, canvasTex(420, 240, cal));
  // el zócalo de granito negro y el portón de madera
  for (const [a, b] of [[27.3, 30.6], [31.6, 33.65]]) k.pic((a + b) / 2, 0.8, ZF + 0.012, b - a, 1.6, 0, 1, canvasTex(160, 80, granito));
  k.box(31.1, 0, ZF - 0.05, 1.0, 2.25, 0.1, 0xe8e6e0);
  k.pic(31.1, 1.06, ZF + 0.01, 0.86, 2.12, 0, 1, canvasTex(90, 220, porton));
  // la entrada del bar: el fondo, el dintel de madera, las dos hojas abiertas y las rejas negras recogidas
  k.pic(pm, PH / 2, Z + 0.02, P1 - P0 - 0.9, PH, 0, 1, canvasTex(200, 220, bar), { glow: 0.25 });
  k.box(pm, PH - 0.12, Z + 0.2, P1 - P0, 0.12, 0.2, 0x6a4a2e);
  k.pic(P0 + 0.23, PH / 2 - 0.06, Z + 0.16, 0.44, PH - 0.12, 0, 1, ht);
  k.pic(P1 - 0.23, PH / 2 - 0.06, Z + 0.16, 0.44, PH - 0.12, 0, 1, ht);
  k.pic(P0 - 0.36, 1.35, ZF + 0.02, 0.68, 2.7, 0, 1, rt);
  k.pic(P1 + 0.3, 1.35, ZF + 0.02, 0.58, 2.7, 0, 1, rt);
  // el letrero luminoso en V, sobre su escuadra
  k.box(pm + 0.05, 3.95, ZF + 0.25, 0.06, 0.06, 0.5, 0x3a3a3c);
  const lt = canvasTex(260, 200, letrero);
  k.pic(pm - 0.33, 3.68, ZF + 0.32, 0.85, 0.66, -0.6, 0.8, lt, { glow: 0.35 });
  k.pic(pm + 0.43, 3.68, ZF + 0.32, 0.85, 0.66, 0.6, 0.8, lt, { glow: 0.35 });
  // los cajetines blancos de la luz, el cartelito rojo y los cables de arriba
  k.box(P0 - 1.1, 2.75, ZF + 0.05, 0.3, 0.42, 0.1, 0xf6f6f2);
  k.box(P0 - 0.55, 2.55, ZF + 0.03, 0.32, 0.2, 0.06, 0xf6f6f2);
  k.box(P1 - 0.25, 2.85, ZF + 0.02, 0.22, 0.28, 0.03, 0xc82a2a);
  for (const y of [3.82, 3.9]) k.box((S0 + S1) / 2, y, ZF + 0.03, S1 - S0, 0.025, 0.025, 0x2a2a2c);
}

/** se monta con lo demás de Arrecife Centro */
export function buildCasaEmiliano(scene, colliders, map) {
  if (!map?.casaEmiliano) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, E, 'casaEmiliano', colliders);
  scene.add(group);
  return { group };
}
