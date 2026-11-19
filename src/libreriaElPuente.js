import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * La Librería El Puente, en la calle de detrás de la iglesia de San Ginés, al lado de Barbacana, con las
 * fotos de Google Maps (solo se miran, no van dentro del juego): el frente de madera verde casi negro con
 * sus molduras y cuarterones, el friso con «LIBRERIA EL PUENTE» en letras claras y el 11 debajo, la
 * puerta de dos hojas y los escaparates con la reja de rombos por dentro del cristal y los libros detrás,
 * el escalón de piedra rojiza, los dos apliques grises de encima y el cartel de bandera verde con
 * «LIBRERÍA». El bloque se queda como está.
 */

// la misma cara que la de Barbacana (s de oeste a este; Barbacana llega a s 13,5 y la librería va de 14,6 a 21)
const P = marco([213.0, 389.4], [235.7, 378.2]);
const Z = 0.15, S0 = 14.6, S1 = 21.0, ALTO = 3.6, VERDE = 0x1e2a26, MOLDURA = 0x2a3a34;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneLibreriaElPuente(map) {
  map.libreriaElPuenteSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Libreria El Puente');
  if (i >= 0) map.libreriaElPuenteSign = map.signs.splice(i, 1)[0];
  map.libreriaElPuente = true;
}

// ——— lo que se pinta en lienzo ———

/** el friso: LIBRERIA EL PUENTE en letras claras y el 11 pequeño debajo */
function friso(g, w, h) {
  g.fillStyle = '#1e2a26';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#3a4a44';
  g.lineWidth = 4;
  g.strokeRect(6, 6, w - 12, h - 12);
  g.fillStyle = '#e8e8e0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `600 ${Math.round(h * 0.42)}px Georgia, "Times New Roman", serif`;
  g.fillText('LIBRERIA EL PUENTE', w / 2, h * 0.44);
  g.font = `600 ${Math.round(h * 0.16)}px Georgia, serif`;
  g.fillText('11', w / 2, h * 0.84);
}

/** el escaparate: los libros de colores detrás y la reja de rombos por delante, tras el cristal */
function escaparate(g, w, h) {
  g.fillStyle = '#3a3430';
  g.fillRect(0, 0, w, h);
  let s = 41;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const c = ['#c83a2a', '#2a5a9a', '#e8d070', '#f2f2ee', '#3a8a5a', '#d8783a', '#7a3a7a'];
  for (let y = h * 0.25; y < h; y += h * 0.22) for (let x = 0; x < w; x += w * 0.06) { g.fillStyle = c[Math.floor(r() * c.length)]; g.fillRect(x + 2, y - h * (0.1 + r() * 0.06), w * 0.045, h * (0.1 + r() * 0.06)); }
  g.fillStyle = 'rgba(240,240,236,.5)';
  g.fillRect(0, h * 0.82, w, h * 0.18);
  // la reja de rombos
  g.strokeStyle = 'rgba(232,232,226,.85)';
  g.lineWidth = 3;
  const p = w / 7;
  for (let x = -h; x < w + h; x += p) {
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x + h, h); g.stroke();
    g.beginPath(); g.moveTo(x + h, 0); g.lineTo(x, h); g.stroke();
  }
  g.fillStyle = 'rgba(255,255,255,.12)';
  g.fillRect(0, 0, w * 0.3, h);
}

/** el cartel de bandera: LIBRERÍA en blanco sobre verde */
function bandera(g, w, h) {
  g.fillStyle = '#2a5a48';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#e8e8e0';
  g.lineWidth = 3;
  g.strokeRect(5, 5, w - 10, h - 10);
  g.fillStyle = '#f2f2ee';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.42)}px Georgia, serif`;
  g.fillText('LIBRERÍA', w / 2, h * 0.55);
}

// ——— las piezas ———

/** un hueco con su escaparate y su marco de molduras */
function hueco(k, s0, s1, y0, y1) {
  k.pic((s0 + s1) / 2, (y0 + y1) / 2, Z + 0.02, s1 - s0, y1 - y0, 0, 1, canvasTex(256, Math.round(256 * (y1 - y0) / (s1 - s0)), escaparate), { glow: 0.08 });
  for (const s of [s0 - 0.06, s1 + 0.06]) k.box(s, y0 - 0.06, Z + 0.06, 0.12, y1 - y0 + 0.12, 0.1, MOLDURA);
  for (const y of [y0 - 0.12, y1]) k.box((s0 + s1) / 2, y, Z + 0.06, s1 - s0 + 0.24, 0.12, 0.1, MOLDURA);
}

/** el frente de madera de la librería */
function frente(k) {
  const sm = (S0 + S1) / 2;
  k.box(sm, 0, Z - 0.05, S1 - S0, ALTO, 0.12, VERDE);
  // los escaparates y la puerta
  hueco(k, 14.95, 16.1, 0.55, 2.6);
  hueco(k, 16.45, 17.75, 0.1, 2.6);
  k.box(17.1, 0.1, Z + 0.07, 0.06, 2.5, 0.06, MOLDURA);
  hueco(k, 18.1, 20.65, 0.55, 2.6);
  // los cuarterones de abajo de los escaparates
  for (const [a, b] of [[14.95, 16.1], [18.1, 20.65]]) k.box((a + b) / 2, 0.12, Z + 0.04, b - a - 0.1, 0.32, 0.06, MOLDURA);
  // el escalón de piedra rojiza de la puerta
  k.box(17.1, 0, Z + 0.25, 1.6, 0.12, 0.45, 0xa8786a);
  // el friso con el nombre, la cornisa y los dos apliques
  k.box(sm, 2.8, Z + 0.06, S1 - S0, 0.72, 0.1, MOLDURA);
  k.pic(sm, 3.16, Z + 0.115, 4.6, 0.62, 0, 1, canvasTex(640, 86, friso));
  k.box(sm, ALTO - 0.08, Z + 0.1, S1 - S0 + 0.1, 0.14, 0.24, MOLDURA);
  for (const s of [15.6, 20.0]) {
    k.box(s, 3.85, Z + 0.1, 0.06, 0.06, 0.25, 0x6a6c70);
    k.box(s, 3.78, Z + 0.28, 0.32, 0.12, 0.2, 0x8a8c90);
  }
  // el cartel de bandera, de canto a la fachada, en la punta del este
  k.box(S1 - 0.2, 3.4, Z + 0.45, 0.04, 0.04, 0.8, 0x2a2a2a);
  k.box(S1 - 0.2, 2.75, Z + 0.55, 0.05, 0.55, 0.7, 0x2a5a48);
  for (const nx of [1, -1]) k.pic(S1 - 0.2 + nx * 0.03, 3.025, Z + 0.55, 0.68, 0.53, nx, 0, canvasTex(160, 124, bandera));
}

/** segunda fase, como los demás de este barrio */
export function buildLibreriaElPuente(scene, colliders, map) {
  if (!map?.libreriaElPuente) return null;
  const k = new Kit();
  frente(k);
  const group = enMarco(k, P, 'libreriaElPuente', colliders);
  scene.add(group);
  return { group };
}
