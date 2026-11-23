import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * QuePerro!, la veterinaria y peluquería canina de la calle Doctor Juan Negrín, con la foto de Google Maps
 * de julio de 2025 (solo se mira, no va dentro del juego): la planta baja chapada de mármol marrón, el
 * friso blanco con «Veterinaria» y «Peluquería Canina» en letras rosas, el escaparate de los servicios,
 * el de las fotos de perros, la puerta de cristal de la clínica con la cruz azul, el círculo con el perro
 * del logo, la puerta de la peluquería con su reja blanca y, arriba, el cartel vertical con la cruz. La
 * calle llega hasta la pared: todo pegado a ella. El bloque se queda como está.
 */

// la cara de la calle Doctor Juan Negrín (s de oeste a este)
const Q = marco([-331.1, -72.6], [-321.8, -65.1]);
const Z = 0.12, MARMOL = 0x7a5a48, ROSA = '#d8508a';

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneQuePerro(map) {
  map.quePerroSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Que Perro!!');
  if (i >= 0) map.quePerroSign = map.signs.splice(i, 1)[0];
  map.quePerro = true;
}

// ——— lo que se pinta en lienzo ———

/** el mármol marrón con sus vetas */
function marmol(g, w, h) {
  g.fillStyle = '#7a5a48';
  g.fillRect(0, 0, w, h);
  let s = 3;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 60; i++) {
    g.strokeStyle = `rgba(${200 + r() * 40},${170 + r() * 40},${150 + r() * 30},${0.15 + r() * 0.2})`;
    g.lineWidth = 1 + r() * 2;
    g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y);
    for (let j = 0; j < 5; j++) { x += (r() - 0.5) * w * 0.3; y += r() * h * 0.2; g.lineTo(x, y); }
    g.stroke();
  }
  g.strokeStyle = 'rgba(40,28,20,.35)';
  g.lineWidth = 2;
  for (let y = 0; y < h; y += h / 5) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** el friso blanco: Veterinaria y Peluquería Canina en rosa */
function friso(g, w, h) {
  g.fillStyle = '#f2f0ec';
  g.fillRect(0, 0, w, h);
  g.fillStyle = ROSA;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.58)}px "Segoe Print", "Comic Sans MS", cursive`;
  g.fillText('Veterinaria', w * 0.28, h * 0.55);
  g.font = `700 ${Math.round(h * 0.46)}px "Segoe Print", "Comic Sans MS", cursive`;
  g.fillText('Peluquería Canina', w * 0.8, h * 0.55);
}

/** el escaparate de los servicios: el cartel azul con su lista */
function servicios(g, w, h) {
  g.fillStyle = '#4a4c50';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8f0f8';
  g.fillRect(w * 0.08, h * 0.06, w * 0.84, h * 0.86);
  g.fillStyle = '#2a5ab8';
  g.fillRect(w * 0.08, h * 0.06, w * 0.84, h * 0.12);
  g.fillStyle = '#f2f2ee';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.06)}px Arial, sans-serif`;
  g.fillText('SERVICIOS', w / 2, h * 0.12);
  g.fillStyle = '#2a3a5a';
  for (let y = 0.25; y < 0.82; y += 0.05) g.fillRect(w * 0.18, h * y, w * (0.45 + ((y * 37) % 0.2)), h * 0.015);
}

/** el escaparate de las fotos de perros pegadas */
function fotos(g, w, h) {
  g.fillStyle = '#d8c8b0';
  g.fillRect(0, 0, w, h);
  let s = 13;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 9; i++) {
    g.fillStyle = '#f8f8f4';
    const x = w * (0.08 + (i % 2) * 0.45), y = h * (0.06 + Math.floor(i / 2) * 0.19);
    g.fillRect(x, y, w * 0.4, h * 0.16);
    g.fillStyle = ['#c89a6a', '#f2e8d8', '#6a5040', '#e8d0a0'][Math.floor(r() * 4)];
    g.beginPath(); g.arc(x + w * 0.2, y + h * 0.08, w * 0.09, 0, Math.PI * 2); g.fill();
  }
}

/** la puerta de cristal de la clínica: la sala blanca y la cruz azul */
function clinica(g, w, h) {
  g.fillStyle = '#dce4ea';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c8ccd0';
  g.fillRect(0, h * 0.78, w, h * 0.22);
  g.fillStyle = '#2a7ac8';
  g.fillRect(w * 0.42, h * 0.28, w * 0.16, h * 0.22);
  g.fillRect(w * 0.31, h * 0.34, w * 0.38, h * 0.1);
  g.fillStyle = '#3a3c40';
  g.fillRect(w * 0.15, h * 0.62, w * 0.5, h * 0.12);
  g.fillStyle = 'rgba(255,255,255,.2)';
  g.fillRect(0, 0, w * 0.35, h);
}

/** el círculo del logo: el perro de orejas grandes */
function logo(g, w, h) {
  g.fillStyle = '#7a5a48';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f2f0ec';
  g.beginPath(); g.arc(w / 2, h * 0.45, w * 0.42, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#2a2a2e';
  for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(w / 2 + sx * w * 0.1, h * 0.3); g.lineTo(w / 2 + sx * w * 0.32, h * 0.12); g.lineTo(w / 2 + sx * w * 0.28, h * 0.38); g.closePath(); g.fill(); }
  g.beginPath(); g.arc(w / 2, h * 0.46, w * 0.22, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#f2f0ec';
  g.beginPath(); g.ellipse(w / 2, h * 0.53, w * 0.1, w * 0.08, 0, 0, Math.PI * 2); g.fill();
  for (const sx of [-1, 1]) { g.beginPath(); g.arc(w / 2 + sx * w * 0.09, h * 0.42, w * 0.035, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = ROSA;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(h * 0.13)}px Arial, sans-serif`;
  g.fillText('quePERRO!!', w / 2, h * 0.92);
}

/** el cartel vertical: la cruz azul y QUEPERRO en rosa */
function cartel(g, w, h) {
  g.fillStyle = '#f4f2ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = ROSA;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(w * 0.5)}px Arial, sans-serif`;
  const t = 'QUEPERRO';
  for (let i = 0; i < t.length; i++) g.fillText(t[i], w / 2, h * (0.06 + i * 0.095));
  g.fillStyle = '#2a7ac8';
  g.fillRect(w * 0.38, h * 0.82, w * 0.24, h * 0.14);
  g.fillRect(w * 0.2, h * 0.86, w * 0.6, h * 0.06);
}

// ——— las piezas ———

/** la planta baja de QuePerro! */
function fachada(k) {
  const L = Q.len, H = 2.65;
  // el mármol marrón de toda la planta baja
  k.box(L / 2, 0, Z - 0.05, L - 0.1, 3.3, 0.1, MARMOL);
  k.pic(L / 2, 1.65, Z + 0.004, L - 0.1, 3.3, 0, 1, canvasTex(512, 144, marmol));
  // los escaparates, la puerta de la clínica y el logo
  const huecos = [[0.3, 2.0, servicios, 0.25], [2.15, 3.25, fotos, 0.25], [3.4, 4.6, clinica, 0.1], [7.0, 8.2, clinica, 0.1]];
  for (const [a, b, f, y0] of huecos) {
    k.pic((a + b) / 2, (y0 + H) / 2, Z + 0.015, b - a, H - y0, 0, 1, canvasTex(128, 256, f), { glow: 0.08 });
    for (const s of [a, b]) k.box(s, y0, Z + 0.03, 0.06, H - y0, 0.05, 0xd8d8d4);
    k.box((a + b) / 2, H - 0.05, Z + 0.03, b - a, 0.06, 0.05, 0xd8d8d4);
  }
  // la reja blanca de la puerta de la peluquería
  for (let s = 7.1; s < 8.15; s += 0.14) k.box(s, 0.1, Z + 0.07, 0.025, H - 0.15, 0.025, 0xf2f2ee);
  k.pic(5.6, 1.85, Z + 0.015, 1.1, 1.3, 0, 1, canvasTex(128, 150, logo));
  // el friso blanco con las letras rosas
  k.box(4.3, 2.75, Z + 0.04, 8.4, 0.5, 0.08, 0xf2f0ec);
  k.pic(4.3, 3.0, Z + 0.085, 8.3, 0.46, 0, 1, canvasTex(1024, 56, friso));
  // el cartel vertical de arriba, de canto a la fachada
  k.box(5.6, 3.5, Z + 0.3, 0.08, 1.9, 0.45, 0xe8e6e0);
  for (const nx of [1, -1]) k.pic(5.6 + nx * 0.045, 4.45, Z + 0.3, 0.42, 1.85, nx, 0, canvasTex(64, 280, cartel));
}

/** segunda fase, como los demás de este barrio */
export function buildQuePerro(scene, colliders, map) {
  if (!map?.quePerro) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, Q, 'quePerro', colliders);
  scene.add(group);
  return { group };
}
