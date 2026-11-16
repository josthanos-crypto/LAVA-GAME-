import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * El Detalle Ideal, la tienda de artículos de fiesta, regalos y decoración de la calle La Carmen 5 (Titerroy), con
 * la vista de la calle de Google de julio de 2025 y la foto del escaparate de octubre de 2018 (solo se miran, no
 * van dentro del juego): el bajo forrado de granito gris moteado; el escaparate de aluminio blanco de dos hojas,
 * con la franja rosa de «El detalle ideal» y el regalito en la izquierda, la franja verde menta con las letras
 * pequeñas en la derecha, las cortinas blancas abajo y la persiana de arriba; el cartelito rojo y el papel
 * pegado; y a la derecha, el portal blanco del número 5 con su montante. El bloque se queda como está; lo de
 * abajo tapa su trozo.
 */

// la fachada de la calle La Carmen (s de izquierda a derecha mirándola; la esquina queda a la izquierda). El rótulo
// del mapa estaba en la otra cara de la manzana; Google y la vista de la calle la ponen aquí, en s 4,9–7,3
const D = marco([-811.9, -522.42], [-831.72, -539.58]);
const Z = 0.12, ZF = Z + 0.3, S0 = 3.0, S1 = 12.8, V0 = 4.85, V1 = 7.3;

/** antes de levantar la ciudad: fuera el rótulo genérico (el de la otra cara de la manzana) */
export function tuneElDetalleIdeal(map) {
  map.elDetalleIdealSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'El detalle ideal');
  if (i >= 0) map.elDetalleIdealSign = map.signs.splice(i, 1)[0];
  map.elDetalleIdeal = true;
}

// ——— lo que se pinta en lienzo ———

/** el granito gris moteado del bajo, en placas */
function granito(g, w, h) {
  g.fillStyle = '#b4b0aa';
  g.fillRect(0, 0, w, h);
  let s = 17;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 1800; i++) { const v = 140 + r() * 90; g.fillStyle = `rgb(${v},${v - 4},${v - 8})`; g.fillRect(r() * w, r() * h, 1.5, 1.5); }
  g.fillStyle = 'rgba(0,0,0,.12)';
  for (let x = 0; x < w; x += w / 8) g.fillRect(x, 0, 1, h);
  for (let y = 0; y < h; y += h / 3) g.fillRect(0, y, w, 1);
}

/** el escaparate: la persiana de arriba, las dos franjas de colores y las cortinas blancas */
function escaparate(g, w, h) {
  g.fillStyle = '#e8eae8';
  g.fillRect(0, 0, w, h);
  // la persiana de arriba, con el reflejo oscuro
  g.fillStyle = '#4a4a44';
  g.fillRect(0, 0, w, h * 0.3);
  g.fillStyle = '#7a7a6a';
  for (let x = 0; x < w; x += 6) g.fillRect(x, 0, 2, h * 0.3);
  // la franja rosa con el nombre y el regalito, y la verde menta con las letras pequeñas
  g.fillStyle = '#e88aa0';
  g.fillRect(0, h * 0.32, w * 0.49, h * 0.11);
  g.fillStyle = '#9adcc8';
  g.fillRect(w * 0.51, h * 0.32, w * 0.49, h * 0.11);
  g.fillStyle = '#ffffff';
  g.font = `italic 700 ${Math.round(h * 0.05)}px "Segoe Script", "Brush Script MT", Georgia, serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const m = g.measureText('El detalle ideal').width, k = Math.min(1, (w * 0.36) / m);
  g.save(); g.translate(w * 0.29, h * 0.375); g.scale(k, 1); g.fillText('El detalle ideal', 0, 0); g.restore();
  g.strokeStyle = '#ffffff';
  g.lineWidth = 2;
  g.strokeRect(w * 0.035, h * 0.35, w * 0.05, h * 0.05);
  g.beginPath(); g.moveTo(w * 0.06, h * 0.35); g.lineTo(w * 0.06, h * 0.4); g.stroke();
  for (const y of [0.35, 0.375, 0.4]) { g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(w * 0.58, h * y, w * 0.35, h * 0.012); }
  // las cortinas blancas de abajo, con sus pliegues
  g.fillStyle = 'rgba(0,0,0,.05)';
  for (let x = 0; x < w; x += 10) g.fillRect(x, h * 0.45, 4, h * 0.55);
  g.fillStyle = 'rgba(255,255,255,.2)';
  g.fillRect(0, 0, w * 0.3, h);
}

/** el portal blanco del 5 con su montante oscuro */
function portal(g, w, h) {
  g.fillStyle = '#f4f4f2';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#5a6a6e';
  g.fillRect(w * 0.06, h * 0.03, w * 0.88, h * 0.24);
  g.fillStyle = '#2a2a2c';
  g.font = `700 ${Math.round(h * 0.05)}px Arial, sans-serif`;
  g.textAlign = 'center';
  g.fillText('5', w / 2, h * 0.34);
  g.strokeStyle = 'rgba(0,0,0,.16)';
  g.lineWidth = 2;
  g.strokeRect(w * 0.1, h * 0.38, w * 0.8, h * 0.58);
  g.fillStyle = '#8a8c90';
  g.fillRect(w * 0.42, h * 0.6, w * 0.16, h * 0.03);
}

// ——— las piezas ———

/** el bajo: el granito, el escaparate, los papeles y el portal del 5 */
function fachada(k) {
  const vm = (V0 + V1) / 2, gt = canvasTex(400, 120, granito);
  // el granito del bajo por delante de lo genérico, con los huecos del escaparate y del portal
  for (const [s0, s1] of [[S0, V0 - 0.08], [V1 + 0.08, 11.1], [12.1, S1]]) {
    k.box((s0 + s1) / 2, 0, Z + 0.15, s1 - s0, 3.15, 0.3, 0xb4b0aa);
    k.pic((s0 + s1) / 2, 1.575, ZF + 0.005, s1 - s0, 3.15, 0, 1, gt);
  }
  for (const [a, b] of [[V0 - 0.08, V1 + 0.08], [11.1, 12.1]]) {
    k.box((a + b) / 2, 3.0, Z + 0.15, b - a, 0.15, 0.3, 0xb4b0aa);
  }
  k.box((S0 + S1) / 2, 3.15, Z + 0.2, S1 - S0, 0.12, 0.4, 0xf2f0ea);
  k.block((S0 + S1) / 2, Z + 0.15, S1 - S0, 0.3);
  // el escaparate de aluminio blanco de dos hojas
  k.pic(vm, 1.58, Z + 0.06, V1 - V0, 2.86, 0, 1, canvasTex(260, 300, escaparate), { glow: 0.1 });
  for (const s of [V0, vm, V1]) k.box(s, 0.15, Z + 0.1, s === vm ? 0.06 : 0.1, 2.86, 0.08, 0xf2f2f0);
  for (const y of [0.1, 3.0]) k.box(vm, y, Z + 0.1, V1 - V0 + 0.1, 0.08, 0.08, 0xf2f2f0);
  // el papel pegado de la izquierda y el cartelito rojo de la derecha
  k.box(V0 - 0.45, 2.15, ZF + 0.01, 0.32, 0.36, 0.01, 0xf6f6f2);
  k.box(V1 + 0.25, 1.85, ZF + 0.02, 0.18, 0.24, 0.03, 0xc82a2a);
  // el portal blanco del 5, metido en el granito
  k.pic(11.6, 1.45, Z + 0.06, 0.95, 2.9, 0, 1, canvasTex(100, 300, portal));
  for (const s of [11.1, 12.1]) k.box(s, 0, Z + 0.12, 0.06, 3.0, 0.06, 0xe8e8e6);
}

/** se monta con lo demás de Titerroy */
export function buildElDetalleIdeal(scene, colliders, map) {
  if (!map?.elDetalleIdeal) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, D, 'elDetalleIdeal', colliders);
  scene.add(group);
  return { group };
}
