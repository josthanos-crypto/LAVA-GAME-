import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * Studio MK, la barbería de la avenida Alcalde Ginés de la Hoz 2 (centro), con la vista de la calle de Google de
 * julio de 2025 (solo se mira, no va dentro del juego): el bajo color crema con el zócalo de piedra arena y su
 * raya; el portal del número 2 de madera oscura con cristal; y la barbería: los dos escaparates de marco marrón
 * con «CITA PREVIA» arriba y los vinilos de las maquinillas rojas y las tijeras (el dibujo de la cara del barbero
 * de la foto no se pone), la puerta de cristal con el vinilo de rayas y, encima, el letrero en forma de
 * hexágono alargado, oscuro y de borde rojo, con «Studio MK» en blanco y las cinco estrellas rojas. El bloque se
 * queda como está; lo de abajo tapa su trozo.
 */

// la fachada de la avenida (s de izquierda a derecha mirándola); Google y la vista de la calle ponen la barbería en
// s 17,6–24,2, al lado del portal del 2 (el rótulo del mapa caía unos metros más allá, en s 27,9)
const M = marco([-405.87, -153.78], [-392.21, -123.95]);
const Z = 0.12, ZF = Z + 0.3, S0 = 15.0, S1 = 24.8, CREMA = 0xece4d4, ARENA = 0xc8b494, MARRON = 0x5a4232;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneStudioMK(map) {
  map.studioMKSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Studio MK');
  if (i >= 0) map.studioMKSign = map.signs.splice(i, 1)[0];
  map.studioMK = true;
}

// ——— lo que se pinta en lienzo ———

/** el letrero: el hexágono alargado oscuro con su borde rojo, «Studio MK» y las cinco estrellas */
function letrero(g, w, h) {
  g.fillStyle = '#ece4d4';
  g.fillRect(0, 0, w, h);
  const hex = (m, c) => {
    g.fillStyle = c;
    g.beginPath();
    g.moveTo(m, h / 2); g.lineTo(w * 0.12 + m * 0.5, m); g.lineTo(w * 0.88 - m * 0.5, m);
    g.lineTo(w - m, h / 2); g.lineTo(w * 0.88 - m * 0.5, h - m); g.lineTo(w * 0.12 + m * 0.5, h - m);
    g.closePath(); g.fill();
  };
  hex(2, '#c82a2a');
  hex(h * 0.08, '#2a2426');
  g.fillStyle = '#f4f2ee';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 700 ${Math.round(h * 0.42)}px "Segoe Script", "Brush Script MT", Georgia, serif`;
  const t = 'Studio MK', m = g.measureText(t).width, k = Math.min(1, (w * 0.62) / m);
  g.save(); g.translate(w / 2, h * 0.42); g.scale(k, 1); g.fillText(t, 0, 0); g.restore();
  g.fillStyle = '#d83a3a';
  for (let i = 0; i < 5; i++) {
    const cx = w * (0.4 + i * 0.05), cy = h * 0.76, r = h * 0.06;
    g.beginPath();
    for (let j = 0; j < 10; j++) { const a = -Math.PI / 2 + j * Math.PI / 5, rr = j % 2 ? r * 0.45 : r; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
    g.closePath(); g.fill();
  }
  g.fillStyle = '#d83a3a';
  g.fillRect(w * 0.3, h * 0.755, w * 0.07, h * 0.015);
  g.fillRect(w * 0.63, h * 0.755, w * 0.07, h * 0.015);
}

/** un escaparate: oscuro, con «CITA PREVIA» arriba, la maquinilla roja, las tijeras y un cartelito */
function escaparate(g, w, h) {
  g.fillStyle = '#2a2a2e';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#4a4a50';
  g.fillRect(0, 0, w, h * 0.12);
  g.fillStyle = '#e8e8e8';
  g.font = `700 ${Math.round(h * 0.06)}px "Segoe UI", Arial, sans-serif`;
  g.textAlign = 'center';
  g.fillText('CITA PREVIA', w / 2, h * 0.08);
  // la maquinilla roja
  g.fillStyle = '#d83a3a';
  g.save(); g.translate(w * 0.68, h * 0.48); g.rotate(-0.3);
  g.fillRect(-w * 0.06, -h * 0.2, w * 0.12, h * 0.36);
  g.fillStyle = '#c8c8c8';
  g.fillRect(-w * 0.07, -h * 0.26, w * 0.14, h * 0.06);
  g.restore();
  // las tijeras
  g.strokeStyle = '#d8d8d8';
  g.lineWidth = 4;
  g.beginPath(); g.moveTo(w * 0.2, h * 0.3); g.lineTo(w * 0.38, h * 0.62); g.moveTo(w * 0.38, h * 0.3); g.lineTo(w * 0.2, h * 0.62); g.stroke();
  for (const x of [0.18, 0.4]) { g.beginPath(); g.arc(w * x, h * 0.68, h * 0.05, 0, Math.PI * 2); g.stroke(); }
  // el cartelito de colores pegado
  g.fillStyle = '#e8c8e0';
  g.fillRect(w * 0.5, h * 0.25, w * 0.09, h * 0.14);
  g.fillStyle = 'rgba(255,255,255,.1)';
  g.fillRect(0, 0, w * 0.3, h);
}

/** la puerta de cristal con el vinilo de rayas */
function puerta(g, w, h) {
  g.fillStyle = '#2a2a2e';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#b8b8b8';
  g.fillRect(w * 0.05, h * 0.05, w * 0.45, h * 0.55);
  g.strokeStyle = '#3a3a3a';
  g.lineWidth = 2;
  for (let y = 0; y < h * 0.55; y += 8) { g.beginPath(); g.moveTo(w * 0.05, h * 0.05 + y); g.lineTo(w * 0.5, h * 0.05 + y + 6); g.stroke(); }
  g.fillStyle = '#4a3a34';
  g.fillRect(w * 0.6, h * 0.3, w * 0.3, h * 0.5);
}

/** el portal del 2: madera oscura con cristal */
function portal(g, w, h) {
  g.fillStyle = '#4a3428';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#5a6a70';
  g.fillRect(w * 0.15, h * 0.08, w * 0.7, h * 0.5);
  g.fillStyle = 'rgba(255,255,255,.15)';
  g.fillRect(w * 0.15, h * 0.08, w * 0.25, h * 0.5);
  g.strokeStyle = 'rgba(0,0,0,.4)';
  g.lineWidth = 3;
  g.strokeRect(w * 0.2, h * 0.65, w * 0.6, h * 0.28);
}

// ——— las piezas ———

/** el bajo: la pared crema con el zócalo, el portal del 2 y la barbería con su letrero */
function fachada(k) {
  const huecos = [[16.1, 17.1, 2.35], [17.6, 20.0, 2.3], [20.5, 21.6, 2.35], [22.0, 24.2, 2.3]];
  let s = S0;
  for (const [a, b, alto] of [...huecos, [S1, S1, 0]]) {
    if (a > s) {
      k.box((s + a) / 2, 0, Z + 0.15, a - s, 3.6, 0.3, CREMA);
      k.box((s + a) / 2, 0, ZF + 0.01, a - s, 0.9, 0.04, ARENA);
      k.box((s + a) / 2, 0.9, ZF + 0.02, a - s, 0.06, 0.05, 0x9a8a72);
    }
    if (b > a) {
      k.box((a + b) / 2, alto, Z + 0.15, b - a, 3.6 - alto, 0.3, CREMA);
      if (alto < 2.4 && b - a > 2) k.box((a + b) / 2, 0, Z + 0.15, b - a, 0.6, 0.3, ARENA);
    }
    s = b;
  }
  k.block((S0 + S1) / 2, Z + 0.15, S1 - S0, 0.3);
  // el portal del 2 y el cajetín del contador
  k.pic(16.6, 1.175, Z + 0.06, 1.0, 2.35, 0, 1, canvasTex(90, 210, portal));
  k.box(16.6, 2.5, ZF + 0.01, 0.16, 0.16, 0.02, 0x3a5ab8);
  k.box(15.6, 0.7, ZF + 0.03, 0.42, 0.5, 0.08, 0xe8e8e4);
  // los dos escaparates de marco marrón, con su cristal
  for (const [a, b] of [[17.6, 20.0], [22.0, 24.2]]) {
    k.pic((a + b) / 2, 1.45, Z + 0.06, b - a, 1.7, 0, 1, canvasTex(220, 160, escaparate), { glow: 0.08 });
    for (const t of [a, b]) k.box(t, 0.6, Z + 0.12, 0.08, 1.7, 0.1, MARRON);
    for (const y of [0.6, 2.22]) k.box((a + b) / 2, y, Z + 0.12, b - a, 0.08, 0.1, MARRON);
  }
  // la puerta de cristal
  k.pic(21.05, 1.175, Z + 0.06, 1.1, 2.35, 0, 1, canvasTex(100, 210, puerta), { glow: 0.08 });
  for (const t of [20.5, 21.6]) k.box(t, 0, Z + 0.12, 0.08, 2.35, 0.1, MARRON);
  // el letrero de hexágono encima de la puerta
  k.box(21.0, 2.55, ZF + 0.03, 1.9, 0.62, 0.05, 0x2a2426);
  k.pic(21.0, 2.86, ZF + 0.06, 1.9, 0.62, 0, 1, canvasTex(380, 124, letrero));
  // los cables de arriba
  for (const y of [3.45, 3.52]) k.box((S0 + S1) / 2, y, ZF + 0.03, S1 - S0, 0.025, 0.025, 0x2a2a2c);
}

/** se monta con lo demás de Arrecife Centro */
export function buildStudioMK(scene, colliders, map) {
  if (!map?.studioMK) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, M, 'studioMK', colliders);
  scene.add(group);
  return { group };
}
