import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * Mastik Salchipapas, en la calle Doctor Juan Negrín 103 (Titerroy), con la vista de la calle de Google de julio
 * de 2025 (solo se mira, no va dentro del juego; en la foto está cerrado): la casa blanca; la franja roja de
 * lado a lado con «CAFETERIA» y la taza, el centro naranja con «maStik» y «SALCHIPAPAS» y «¡La original!», y
 * «HAMBURGUESERIA» con la hamburguesa; a la izquierda, el local de marco gris con la persianita estrecha, los
 * tres carteles de «AREPAS», «HAMBURGUESAS» y «SALCHIPAPAS» (con colores en vez de las fotos de comida) y la
 * persiana blanca bajada; en medio, el portal de madera verde oliva con su marco de piedra gris, el número y
 * el contador; a la derecha, la persiana grande; y los bolardos de la acera. El bloque se queda como está; lo
 * de abajo tapa su trozo.
 */

// la fachada de la calle Doctor Juan Negrín (s de izquierda a derecha mirándola); el rótulo del mapa cae en s 15,4
const M = marco([-804.41, -455.9], [-820.36, -469.43]);
const Z = 0.12, ZF = Z + 0.3, S0 = 10.6, S1 = 20.8, BLANCO = 0xf4f3ef, GRIS = 0x8a8e88, PIEDRA = 0x9a9c98;

/** antes de levantar la ciudad: fuera el rótulo genérico (y su terraza genérica, que en la foto no está) */
export function tuneMastik(map) {
  map.mastikSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Mastik Salchipapas');
  if (i >= 0) map.mastikSign = map.signs.splice(i, 1)[0];
  map.mastik = true;
}

// ——— lo que se pinta en lienzo ———

/** la franja roja: «CAFETERIA» con la taza, el centro naranja con el nombre y «HAMBURGUESERIA» con la hamburguesa */
function franja(g, w, h) {
  g.fillStyle = '#d82a2a';
  g.fillRect(0, 0, w, h);
  const gr = g.createLinearGradient(w * 0.28, 0, w * 0.72, 0);
  gr.addColorStop(0, '#e85a1e');
  gr.addColorStop(0.5, '#f08a2a');
  gr.addColorStop(1, '#e85a1e');
  g.fillStyle = gr;
  g.fillRect(w * 0.27, 0, w * 0.45, h);
  g.fillStyle = '#ffffff';
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  g.font = `700 ${Math.round(h * 0.62)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('CAFETERIA', w * 0.015, h * 0.52);
  const m = g.measureText('HAMBURGUESERIA').width, k = Math.min(1, (w * 0.215) / m);
  g.save(); g.translate(w * 0.725, h * 0.52); g.scale(k, 1); g.fillText('HAMBURGUESERIA', 0, 0); g.restore();
  // la taza y la hamburguesa, en blanco
  g.strokeStyle = '#ffffff';
  g.lineWidth = 2;
  const tx = w * 0.235, ty = h * 0.55;
  g.strokeRect(tx - h * 0.2, ty - h * 0.15, h * 0.4, h * 0.3);
  g.beginPath(); g.arc(tx + h * 0.24, ty, h * 0.08, -Math.PI / 2, Math.PI / 2); g.stroke();
  g.beginPath(); g.moveTo(tx - h * 0.32, ty + h * 0.2); g.lineTo(tx + h * 0.32, ty + h * 0.2); g.stroke();
  const hx = w * 0.975, hy = h * 0.5;
  g.beginPath(); g.arc(hx, hy - h * 0.05, h * 0.22, Math.PI, 0); g.stroke();
  for (const d of [0.05, 0.15, 0.25]) { g.beginPath(); g.moveTo(hx - h * 0.24, hy + d * h); g.lineTo(hx + h * 0.24, hy + d * h); g.stroke(); }
  // el centro: «maStik» en su recuadro oscuro, «SALCHIPAPAS» y «¡La original!»
  g.fillStyle = '#5a2a1a';
  g.fillRect(w * 0.31, h * 0.08, w * 0.09, h * 0.5);
  g.fillStyle = '#f8e8c8';
  g.font = `italic 700 ${Math.round(h * 0.38)}px Georgia, serif`;
  g.textAlign = 'center';
  g.fillText('maStik', w * 0.355, h * 0.34);
  g.fillStyle = '#ffffff';
  g.font = `400 ${Math.round(h * 0.3)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('SALCHIPAPAS', w * 0.43, h * 0.78);
  g.font = `700 ${Math.round(h * 0.34)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('¡La original!', w * 0.58, h * 0.72);
}

/** un cartel de la ventana de arriba del local: el nombre arriba y colores debajo (sin las fotos de comida) */
function cartel(nombre, semilla) {
  return (g, w, h) => {
    g.fillStyle = '#f6f4f0';
    g.fillRect(0, 0, w, h);
    let s = semilla;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 6; i++) {
      g.fillStyle = ['#e8a0b0', '#d87888', '#f0c8b0', '#c86a6a'][Math.floor(r() * 4)];
      g.beginPath(); g.ellipse(w * (0.2 + r() * 0.6), h * (0.45 + r() * 0.4), w * (0.15 + r() * 0.15), h * (0.12 + r() * 0.1), 0, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = '#2a2a2c';
    g.font = `700 ${Math.round(h * 0.13)}px "Segoe UI", Arial, sans-serif`;
    g.textAlign = 'center';
    g.fillText(nombre, w / 2, h * 0.16);
  };
}

/** una persiana blanca bajada, con sus lamas */
function persiana(g, w, h) {
  g.fillStyle = '#e8e8e6';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(0,0,0,.08)';
  for (let y = 0; y < h; y += 6) g.fillRect(0, y, w, 2);
}

/** el portal de madera verde oliva con sus cuarterones de rayas */
function portal(g, w, h) {
  g.fillStyle = '#6a6a50';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c8bc98';
  for (const [x, y] of [[0.12, 0.08], [0.56, 0.6]]) g.fillRect(w * x, h * y, w * 0.32, h * 0.32);
  g.fillStyle = '#7a7a5e';
  for (const [x, y] of [[0.56, 0.08], [0.12, 0.6]]) g.fillRect(w * x, h * y, w * 0.32, h * 0.32);
  g.strokeStyle = 'rgba(0,0,0,.25)';
  g.lineWidth = 2;
  for (const [x, y] of [[0.12, 0.08], [0.56, 0.6]]) for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(w * x, h * (y + k * 0.055)); g.lineTo(w * (x + 0.32), h * (y + k * 0.055 + 0.05)); g.stroke(); }
  g.fillStyle = '#5a5a44';
  g.fillRect(0, h * 0.44, w, h * 0.1);
  g.fillStyle = '#2a2a2c';
  g.beginPath(); g.arc(w * 0.5, h * 0.48, 3, 0, Math.PI * 2); g.fill();
}

// ——— las piezas ———

/** la planta baja: la pared, la franja roja, el local de la izquierda, el portal, la persiana grande y los bolardos */
function fachada(k) {
  const pt = canvasTex(64, 128, persiana);
  // la pared blanca del bajo por delante de lo genérico
  for (const [s0, s1] of [[S0, 10.85], [14.45, 15.05], [16.42, 16.9], [20.2, S1]]) k.box((s0 + s1) / 2, 0, Z + 0.15, s1 - s0, 3.0, 0.3, BLANCO);
  k.box((S0 + S1) / 2, 3.0, Z + 0.15, S1 - S0, 0.95, 0.3, BLANCO);
  k.block((S0 + S1) / 2, Z + 0.15, S1 - S0, 0.3);
  // la franja roja de lado a lado
  k.box((S0 + S1) / 2, 2.98, ZF + 0.02, S1 - S0 - 0.1, 0.62, 0.06, 0xd82a2a);
  k.pic((S0 + S1) / 2, 3.29, ZF + 0.055, S1 - S0 - 0.12, 0.6, 0, 1, canvasTex(1400, 84, franja));
  // el local de la izquierda: el marco gris, la persianita estrecha, los tres carteles y la persiana bajada
  k.box(12.65, 0, Z + 0.12, 3.6, 2.98, 0.08, GRIS);
  k.pic(11.13, 1.35, Z + 0.17, 0.46, 2.5, 0, 1, pt);
  const nombres = ['AREPAS', 'HAMBURGUESAS', 'SALCHIPAPAS'];
  for (let i = 0; i < 3; i++) k.pic(11.95 + i * 0.86, 2.55, Z + 0.17, 0.8, 0.72, 0, 1, canvasTex(100, 90, cartel(nombres[i], 3 + i * 7)));
  k.pic(13.0, 1.07, Z + 0.17, 2.75, 1.85, 0, 1, pt);
  k.box(13.0, 2.0, Z + 0.17, 2.85, 0.12, 0.08, GRIS);
  // el portal de en medio: el marco de piedra gris, la puerta, el número y el contador
  for (const s of [15.15, 16.32]) k.box(s, 0, ZF + 0.02, 0.2, 2.45, 0.1, PIEDRA);
  k.box(15.735, 2.35, ZF + 0.02, 1.37, 0.12, 0.1, PIEDRA);
  for (const [s0, s1] of [[14.6, 15.05], [16.42, 16.95]]) k.box((s0 + s1) / 2, 0, ZF + 0.02, s1 - s0, 0.92, 0.1, PIEDRA);
  k.box(15.735, 0, Z + 0.1, 1.37, 3.0, 0.1, BLANCO);
  k.pic(15.735, 1.2, Z + 0.17, 0.85, 2.3, 0, 1, canvasTex(90, 240, portal));
  k.box(15.735, 2.75, ZF + 0.01, 0.3, 0.14, 0.03, 0xb8b8b4);
  k.box(16.15, 0.75, ZF + 0.08, 0.32, 0.26, 0.1, 0xf4f4f2);
  // la persiana grande de la derecha
  k.box(18.55, 0, Z + 0.12, 3.4, 2.98, 0.08, 0xd8d8d6);
  k.pic(18.55, 1.42, Z + 0.17, 3.25, 2.75, 0, 1, pt);
  // los bolardos de la acera
  for (const s of [14.9, 17.3, 20.4]) {
    k.cyl(s, 0, ZF + 1.4, 0.06, 0.06, 0.8, 0x6a5a4a, { seg: 8 });
    k.ball(s, 0.82, ZF + 1.4, 0.07, 0x6a5a4a, { seg: 8 });
    k.block(s, ZF + 1.4, 0.14, 0.14);
  }
}

/** se monta con lo demás de Titerroy */
export function buildMastik(scene, colliders, map) {
  if (!map?.mastik) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, M, 'mastik', colliders);
  scene.add(group);
  return { group };
}
