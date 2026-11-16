import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * El Trueque (Trueque Canarias), la tienda de compraventa y casa de empeños de la calle Fajardo 23, con la
 * foto de Google Maps de febrero de 2023 (solo se mira, no va dentro del juego): el rótulo morado con el
 * borde amarillo y «El Trueque» en letra de mano amarilla, con «Especialistas en Compra Venta & Reparación &
 * Casa de Empeños» debajo; el panel vertical morado de la pilastra de la izquierda con todo lo que compran
 * y venden; debajo del rótulo, la caja gris de la persiana; y el escaparate de aluminio con la tienda
 * dentro (móviles, guitarras, consolas) y la puerta de cristal de marco morado. En el panel no se ponen las
 * marcas de las consolas de la foto. El bloque se queda como está.
 */

// la fachada de la calle Fajardo (s desde la esquina del noroeste); el rótulo del mapa cae en s 12,5
const T = marco([-53.82, 170.98], [-39.06, 154.3]);
const Z = 0.12, S0 = 9.4, S1 = 15.6, MORADO = 0x5a2a9a, AMARILLO = '#f2d22a', PB = 2.85, ALTO = 1.1;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneElTrueque(map) {
  map.elTruequeSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'El Trueque');
  if (i >= 0) map.elTruequeSign = map.signs.splice(i, 1)[0];
  map.elTrueque = true;
}

// ——— lo que se pinta en lienzo ———

/** escribe un texto que quepa en el ancho dado (si no cabe, más pequeño) */
function cabe(g, t, x, y, ancho, fuente, tam) {
  g.font = fuente(tam);
  const w = g.measureText(t).width;
  if (w > ancho) g.font = fuente(tam * ancho / w);
  g.fillText(t, x, y);
}

/** el morado del fondo, más claro en el centro, con el borde amarillo */
function fondoMorado(g, w, h) {
  const gr = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, Math.max(w, h) * 0.7);
  gr.addColorStop(0, '#8a4ad0');
  gr.addColorStop(1, '#4a1a8a');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = AMARILLO;
  g.lineWidth = Math.max(4, h * 0.03);
  g.strokeRect(g.lineWidth, g.lineWidth, w - g.lineWidth * 2, h - g.lineWidth * 2);
}

/** el rótulo de arriba: «El Trueque» en letra de mano y el lema debajo */
function rotulo(g, w, h) {
  fondoMorado(g, w, h);
  g.fillStyle = AMARILLO;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  cabe(g, 'El Trueque', w * 0.5, h * 0.38, w * 0.8, t => `italic 700 ${Math.round(t)}px "Brush Script MT", "Segoe Script", "Lucida Handwriting", cursive`, h * 0.5);
  cabe(g, 'Especialistas en Compra Venta & Reparación & Casa de Empeños', w * 0.5, h * 0.78, w * 0.9, t => `italic 600 ${Math.round(t)}px "Segoe Script", "Lucida Handwriting", cursive`, h * 0.16);
}

/** el panel vertical de la pilastra: el nombre y la lista de lo que compran, venden y empeñan */
function panel(g, w, h) {
  fondoMorado(g, w, h);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = AMARILLO;
  const mano = t => `italic 700 ${Math.round(t)}px "Segoe Script", "Lucida Handwriting", cursive`, letra = t => `700 ${Math.round(t)}px Arial, sans-serif`;
  const cab = ['El Trueque', 'Compra Venta', 'Casa de', 'Empeños'];
  cab.forEach((t, i) => cabe(g, t, w / 2, h * (0.05 + i * 0.045), w * 0.68, mano, w * 0.13));
  g.fillStyle = '#f4f2f8';
  const lista = ['Compramos', 'Vendemos', 'Empeñamos', 'Móviles - Tablets', 'Ordenadores - Tv', 'Consolas',
    'Herramientas', 'Profesionales', 'Artículos de Pesca', 'Relojes de Lujo', 'Gadgets Varios', 'Instrumentos de',
    'Música - Altavoces', '& Mucho Más...'];
  lista.forEach((t, i) => cabe(g, t, w / 2, h * (0.25 + i * 0.042), w * 0.76, letra, w * 0.105));
  g.fillStyle = AMARILLO;
  cabe(g, 'Servicio Técnico', w / 2, h * 0.86, w * 0.68, mano, w * 0.11);
  cabe(g, 'Especializado', w / 2, h * 0.9, w * 0.68, mano, w * 0.11);
}

/** la tienda por el escaparate: las vitrinas con móviles, los relojes, las guitarras colgadas y la luz morada */
function tienda(g, w, h) {
  g.fillStyle = '#e8e8ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(150,90,220,.35)';
  g.fillRect(0, 0, w, h * 0.12);
  // las baldas de cristal con los móviles y las cajas
  g.fillStyle = '#c8ccd4';
  for (const y of [0.3, 0.45, 0.6]) g.fillRect(w * 0.05, h * y, w * 0.5, h * 0.015);
  let s = 3;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (const y of [0.22, 0.37, 0.52]) for (let x = 0.07; x < 0.52; x += 0.05) { g.fillStyle = ['#1a1a1e', '#3a3a44', '#d8d8de', '#c84a2a'][Math.floor(r() * 4)]; g.fillRect(w * x, h * y, w * 0.03, h * 0.075); }
  // las guitarras colgadas
  for (const [x, c] of [[0.65, '#c8843a'], [0.75, '#2a2a2e'], [0.85, '#a8582a']]) {
    g.fillStyle = c;
    g.beginPath(); g.ellipse(w * x, h * 0.6, w * 0.04, h * 0.09, 0, 0, Math.PI * 2); g.fill();
    g.fillRect(w * x - 2, h * 0.25, 4, h * 0.3);
  }
  // la vitrina baja de delante con el frente rojo
  g.fillStyle = '#d8dce2';
  g.fillRect(w * 0.05, h * 0.72, w * 0.9, h * 0.06);
  g.fillStyle = '#e04a2a';
  g.fillRect(w * 0.6, h * 0.78, w * 0.35, h * 0.22);
  g.fillStyle = '#2a2a2e';
  g.fillRect(w * 0.05, h * 0.78, w * 0.55, h * 0.22);
  // el reflejo de la calle
  const rf = g.createLinearGradient(0, 0, w, h);
  rf.addColorStop(0, 'rgba(255,255,255,.25)');
  rf.addColorStop(0.5, 'rgba(255,255,255,0)');
  g.fillStyle = rf;
  g.fillRect(0, 0, w, h);
}

// ——— las piezas ———

/** la tienda: la pilastra con su panel, el escaparate, la puerta, la caja de la persiana y el rótulo */
function fachada(k) {
  const sm = (S0 + S1) / 2, p0 = S0, p1 = S0 + 1.2, e1 = S1 - 1.6, d1 = S1 - 0.15;
  // la pilastra de la izquierda forrada con el panel morado
  k.box((p0 + p1) / 2, 0, Z + 0.05, p1 - p0, PB, 0.12, MORADO);
  k.pic((p0 + p1) / 2, PB / 2, Z + 0.115, p1 - p0 - 0.04, PB - 0.04, 0, 1, canvasTex(160, 400, panel));
  // el escaparate grande y la puerta de cristal con su marco morado
  k.pic((p1 + e1) / 2, 1.3, Z + 0.01, e1 - p1, 2.4, 0, 1, canvasTex(300, 180, tienda), { glow: 0.1 });
  k.pic((e1 + d1) / 2, 1.2, Z + 0.01, d1 - e1, 2.4, 0, 1, canvasTex(140, 220, tienda), { glow: 0.1 });
  for (const s of [p1 + 0.03, e1, d1]) k.box(s, 0, Z + 0.06, 0.07, 2.5, 0.08, 0xc8ccd0);
  for (const s of [e1 + 0.08, d1 - 0.08]) k.box(s, 0, Z + 0.08, 0.06, 2.4, 0.06, 0x7a3ac0);
  k.box((p1 + e1) / 2, 0, Z + 0.06, e1 - p1, 0.12, 0.08, 0xc8ccd0);
  // la caja gris de la persiana y el toldo recogido, debajo del rótulo
  k.box((p1 + S1) / 2, 2.5, Z + 0.2, S1 - p1, 0.35, 0.4, 0xb8bcc2);
  k.box((p1 + S1) / 2, 2.55, Z + 0.48, S1 - p1, 0.2, 0.16, 0xe8e8ea);
  // el rótulo morado de arriba, de lado a lado
  k.box(sm, PB, Z + 0.06, S1 - S0, ALTO, 0.14, MORADO);
  k.pic(sm, PB + ALTO / 2, Z + 0.135, S1 - S0 - 0.04, ALTO - 0.04, 0, 1, canvasTex(820, 150, rotulo));
}

/** se monta con lo demás de Arrecife Centro */
export function buildElTrueque(scene, colliders, map) {
  if (!map?.elTrueque) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, T, 'elTrueque', colliders);
  scene.add(group);
  return { group };
}
