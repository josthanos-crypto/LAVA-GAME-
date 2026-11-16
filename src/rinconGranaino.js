import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, barra } from './restaurantesCharco.js';

/**
 * El Rincón Granaíno, el bar de tapas de la calle Alicante, en la esquina, con la foto de Google Maps (solo
 * se mira, no va dentro del juego): la planta baja de ladrillo rojo, la puerta de cristal de marco de
 * aluminio con sus pegatinas y el paño de al lado, la ventana de marco blanco con la hoja de arriba abierta
 * y la franja oscura de «CERVEZAS» encima (sin la marca de cerveza de la foto), el cajón blanco del toldo
 * recogido de lado a lado, y en la pared blanca de arriba la tabla de madera con «EL RINCON GRANAINO» y
 * las dos granadas, con sus dos focos de brazo. Sin terraza: en la foto no la hay. El edificio se queda.
 */

// la cara norte del bloque, a la calle Alicante (s desde la esquina del este, hacia el oeste)
const R = marco([-492.2, 355.8], [-498.6, 357.6]);
const Z = 0.15, ALTO = 3.6, ALUMINIO = 0xc8ccd0;

/** antes de levantar la ciudad: fuera el rótulo rojo genérico */
export function tuneRinconGranaino(map) {
  map.rinconGranainoSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'El Rincon Granaino');
  if (i >= 0) map.rinconGranainoSign = map.signs.splice(i, 1)[0];
  map.rinconGranaino = true;
}

// ——— lo que se pinta en lienzo ———

/** el ladrillo rojo con las llagas claras */
function ladrillo(g, w, h) {
  g.fillStyle = '#c8b8a8';
  g.fillRect(0, 0, w, h);
  let s = 13;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const lh = 10, lw = 34;
  for (let y = 0, f = 0; y < h; y += lh, f++) for (let x = f % 2 ? -lw / 2 : 0; x < w; x += lw) {
    const v = r();
    g.fillStyle = `rgb(${Math.round(150 + v * 30)},${Math.round(80 + v * 18)},${Math.round(62 + v * 14)})`;
    g.fillRect(x + 1, y + 1, lw - 2, lh - 2);
  }
}

/** la granada: el fruto rojo anaranjado, la corona y el brillo */
function granada(g, x, y, r) {
  g.fillStyle = '#d8582a';
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#b83a1e';
  g.beginPath(); g.arc(x + r * 0.25, y + r * 0.2, r * 0.7, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#e8a040';
  g.beginPath(); g.moveTo(x - r * 0.3, y - r * 0.85); g.lineTo(x - r * 0.15, y - r * 1.25); g.lineTo(x, y - r * 0.95); g.lineTo(x + r * 0.15, y - r * 1.25); g.lineTo(x + r * 0.3, y - r * 0.85); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,230,180,.5)';
  g.beginPath(); g.arc(x - r * 0.35, y - r * 0.3, r * 0.22, 0, Math.PI * 2); g.fill();
}

/** la tabla de madera: EL RINCON y GRANAINO en crema, con las dos granadas */
function tabla(g, w, h) {
  g.fillStyle = '#6a3a24';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#3a2014';
  g.lineWidth = 6;
  g.strokeRect(3, 3, w - 6, h - 6);
  g.fillStyle = '#f0e6cc';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.34)}px Georgia, "Times New Roman", serif`;
  g.fillText('EL RINCON', w * 0.42, h * 0.3);
  g.fillText('GRANAINO', w * 0.58, h * 0.72);
  granada(g, w * 0.09, h * 0.52, h * 0.22);
  granada(g, w * 0.91, h * 0.52, h * 0.22);
}

/** por el cristal de la puerta: el bar oscuro y las pegatinas */
function puerta(g, w, h) {
  g.fillStyle = '#2a2622';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#4a3e34';
  g.fillRect(0, h * 0.6, w, h * 0.4);
  g.fillStyle = 'rgba(255,255,255,.12)';
  g.fillRect(0, 0, w * 0.4, h);
}

/** el paño de al lado de la puerta, con las pegatinas */
function pegatinas(g, w, h) {
  puerta(g, w, h);
  for (const [x, y, a, b, c] of [[0.1, 0.12, 0.35, 0.16, '#f2f2ee'], [0.5, 0.1, 0.3, 0.2, '#e8d070'], [0.15, 0.32, 0.3, 0.12, '#f2f2ee'], [0.6, 0.36, 0.22, 0.14, '#d8e0e8']]) {
    g.fillStyle = c; g.fillRect(w * x, h * y, w * a, h * b);
  }
  g.strokeStyle = '#c82a2a';
  g.lineWidth = 3;
  g.beginPath(); g.arc(w * 0.27, h * 0.2, w * 0.07, 0, Math.PI * 2); g.stroke();
}

/** la ventana: los dos paños oscuros, la hoja de arriba abierta y la franja de CERVEZAS */
function ventana(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#2a1e1a';
  g.fillRect(w * 0.03, h * 0.04, w * 0.45, h * 0.16);
  g.fillRect(w * 0.52, h * 0.04, w * 0.45, h * 0.16);
  g.fillStyle = '#e8502a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.12)}px Arial, sans-serif`;
  g.fillText('CERVEZAS', w * 0.255, h * 0.125);
  g.fillStyle = '#1e1a18';
  g.fillRect(w * 0.05, h * 0.26, w * 0.42, h * 0.68);
  g.fillRect(w * 0.53, h * 0.26, w * 0.42, h * 0.68);
  // la hoja de la izquierda, abierta hacia fuera por arriba
  g.strokeStyle = '#f2f2ee';
  g.lineWidth = 6;
  g.beginPath(); g.moveTo(w * 0.08, h * 0.62); g.lineTo(w * 0.44, h * 0.3); g.lineTo(w * 0.44, h * 0.62); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.1)';
  g.fillRect(w * 0.53, h * 0.26, w * 0.15, h * 0.68);
}

// ——— las piezas ———

/** la planta baja de ladrillo, la puerta, la ventana, el toldo recogido y la tabla con sus focos */
function fachada(k) {
  const L = R.len;
  k.box(L / 2, 0, Z - 0.05, L - 0.1, ALTO, 0.1, 0x9a5a44);
  k.pic(L / 2, ALTO / 2, Z + 0.004, L - 0.1, ALTO, 0, 1, canvasTex(512, 280, ladrillo));
  // el paño con pegatinas y la puerta de cristal, en su marco de aluminio
  k.pic(1.1, 1.25, Z + 0.01, 0.95, 2.5, 0, 1, canvasTex(96, 250, pegatinas));
  k.pic(2.05, 1.25, Z + 0.01, 0.85, 2.5, 0, 1, canvasTex(96, 250, puerta));
  for (const s of [0.6, 1.6, 2.5]) k.box(s, 0, Z + 0.03, 0.07, 2.55, 0.06, ALUMINIO);
  k.box(1.55, 2.5, Z + 0.03, 1.97, 0.07, 0.06, ALUMINIO);
  // la ventana de marco blanco
  k.box(4.4, 0.95, Z + 0.01, 3.2, 1.85, 0.04, 0xf2f2ee);
  k.pic(4.4, 1.875, Z + 0.035, 3.1, 1.75, 0, 1, canvasTex(320, 180, ventana));
  k.box(4.4, 0.88, Z + 0.08, 3.25, 0.07, 0.16, 0xe8e8e4);
  // el cajón blanco del toldo recogido, de lado a lado, con sus brazos
  k.box(L / 2, 2.85, Z + 0.17, L - 0.3, 0.2, 0.3, 0xf2f2ee);
  for (const s of [0.4, L - 0.4]) k.box(s, 2.8, Z + 0.1, 0.12, 0.3, 0.2, 0xd8d8d4);
  // la tabla de madera de encima, en lo blanco, con los dos focos de brazo
  k.box(3.2, 3.75, Z + 0.03, 3.1, 0.95, 0.06, 0x3a2014);
  k.pic(3.2, 4.22, Z + 0.065, 3.0, 0.88, 0, 1, canvasTex(480, 140, tabla));
  for (const s of [2.4, 4.0]) {
    barra(k, [s, 4.85, Z + 0.02], [s, 4.95, Z + 0.55], 0.02, 0x2a2a2a);
    k.box(s, 4.88, Z + 0.6, 0.22, 0.08, 0.14, 0x4a4a4c);
  }
}

/** segunda fase, como los demás de este barrio */
export function buildRinconGranaino(scene, colliders, map) {
  if (!map?.rinconGranaino) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, R, 'rinconGranaino', colliders);
  scene.add(group);
  return { group };
}
