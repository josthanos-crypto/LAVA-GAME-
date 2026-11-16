import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * Intrigo, el bar de hamburguesas del paseo de la Marina Lanzarote (local B37), con la foto de Google Maps de
 * mayo de 2023 (solo se mira, no va dentro del juego): bajo el techo blanco del soportal con sus focos, la
 * banda negra con «INTRIGO» en letras blancas gastadas y el «TRI» en rojo, la cristalera de lado a lado con la
 * franja esmerilada de «I WAS SAD THEN I SAW FOOD» y, dentro, las mesas de madera con las sillas de metal
 * amarillas, la barra de madera con el letrero negro de Intrigo encima y la pared de ladrillo; delante, el
 * ficus en su macetero. El bloque se queda como está.
 */

// la cara del edificio que da al paseo y al agua (s desde la esquina del Burger King); el rótulo cae en s 26,6
const I = marco([1051.34, 47.3], [1020.26, 102.59]);
const Z = 0.12, S0 = 22.4, S1 = 31.0, BANDA = 3.0, TECHO = 3.9, FUERA = 2.6, NEGRO = 0x1a1a1c, BLANCO = 0xf2f2f0;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneIntrigo(map) {
  map.intrigoSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Intrigo');
  if (i >= 0) map.intrigoSign = map.signs.splice(i, 1)[0];
  map.intrigo = true;
}

// ——— lo que se pinta en lienzo ———

/** unas letras gastadas: se les quitan motas como en el rótulo de verdad */
function gastar(g, x, y, w, h, seed) {
  let s = seed;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  g.save();
  g.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 260; i++) { g.globalAlpha = 0.5 + r() * 0.5; g.fillRect(x + r() * w, y + r() * h, 1 + r() * 3, 1 + r() * 2); }
  g.restore();
}

/** la banda negra con «IN», «TRI» en rojo y «GO» */
function rotulo(g, w, h) {
  g.fillStyle = '#18181a';
  g.fillRect(0, 0, w, h);
  const letras = document.createElement('canvas');
  letras.width = w;
  letras.height = h;
  const l = letras.getContext('2d');
  l.font = `900 ${Math.round(h * 0.84)}px Impact, "Arial Narrow", "Arial Black", sans-serif`;
  l.textBaseline = 'middle';
  l.letterSpacing = `${Math.round(h * 0.08)}px`;
  const partes = [['IN', '#f4f2ee'], ['TRI', '#d8262a'], ['GO', '#f4f2ee']];
  const ancho = partes.reduce((a, [t]) => a + l.measureText(t).width, 0);
  let x = w * 0.5 - ancho / 2;
  for (const [t, c] of partes) { l.fillStyle = c; l.fillText(t, x, h * 0.54); x += l.measureText(t).width; }
  gastar(l, 0, 0, w, h, 17);
  g.drawImage(letras, 0, 0);
}

/** el bar por la cristalera: el suelo oscuro, las mesas de madera con sus sillas amarillas, la barra y el ladrillo */
function local(g, w, h) {
  g.fillStyle = '#4a4440';
  g.fillRect(0, 0, w, h);
  // el techo claro del fondo con las bombillas colgadas
  g.fillStyle = '#d8d4cc';
  g.fillRect(0, 0, w, h * 0.12);
  g.fillStyle = '#ffe2a8';
  for (let x = 0.1; x < 0.95; x += 0.12) { g.fillRect(w * x, h * 0.12, 1, h * 0.08); g.beginPath(); g.arc(w * x, h * 0.21, 3, 0, Math.PI * 2); g.fill(); }
  // la pared de ladrillo de la derecha
  g.fillStyle = '#8a4a36';
  g.fillRect(w * 0.72, h * 0.12, w * 0.28, h * 0.6);
  g.strokeStyle = 'rgba(220,210,200,.35)';
  for (let y = h * 0.14; y < h * 0.72; y += 7) { g.beginPath(); g.moveTo(w * 0.72, y); g.lineTo(w, y); g.stroke(); }
  // la pared de madera del fondo con la barra, las botellas y el letrero negro de encima
  g.fillStyle = '#7a5032';
  g.fillRect(w * 0.3, h * 0.12, w * 0.42, h * 0.6);
  g.fillStyle = '#1a1a1c';
  g.fillRect(w * 0.36, h * 0.18, w * 0.28, h * 0.1);
  g.font = `900 ${Math.round(h * 0.07)}px Impact, "Arial Black", sans-serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#f4f2ee';
  g.fillText('IN    GO', w * 0.5, h * 0.235);
  g.fillStyle = '#d8262a';
  g.fillText('TRI', w * 0.5, h * 0.235);
  g.fillStyle = '#c8b898';
  for (let x = 0.34; x < 0.68; x += 0.025) g.fillRect(w * x, h * 0.32, w * 0.008, h * 0.05);
  g.fillStyle = '#5a3a26';
  g.fillRect(w * 0.33, h * 0.45, w * 0.36, h * 0.2);
  g.fillStyle = '#3a3a3c';
  g.fillRect(w * 0.33, h * 0.44, w * 0.36, h * 0.015);
  // el suelo y las mesas de madera con sus sillas de metal amarillas
  g.fillStyle = '#34322f';
  g.fillRect(0, h * 0.72, w, h * 0.28);
  for (const [x, y, e] of [[0.08, 0.68, 1.1], [0.22, 0.66, 1], [0.48, 0.7, 1.2], [0.8, 0.7, 1.2], [0.62, 0.66, 0.9]]) {
    g.fillStyle = '#a8784a';
    g.fillRect(w * x, h * y, w * 0.1 * e, h * 0.03);
    g.fillStyle = '#2a2a2c';
    g.fillRect(w * (x + 0.045 * e), h * (y + 0.03), 2, h * 0.14);
    g.fillStyle = '#e8b21a';
    for (const dx of [-0.025, 0.1 * e + 0.005]) { g.fillRect(w * (x + dx), h * (y - 0.04), w * 0.006, h * 0.17); g.fillRect(w * (x + dx), h * (y + 0.04), w * 0.022, h * 0.015); g.fillRect(w * (x + dx + 0.016), h * (y + 0.04), w * 0.004, h * 0.09); }
  }
  // el reflejo del cielo y de los mástiles en el cristal
  const cielo = g.createLinearGradient(0, 0, 0, h * 0.5);
  cielo.addColorStop(0, 'rgba(190,210,230,.45)');
  cielo.addColorStop(1, 'rgba(190,210,230,0)');
  g.fillStyle = cielo;
  g.fillRect(0, 0, w, h * 0.5);
  g.strokeStyle = 'rgba(90,100,110,.4)';
  let s = 5;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 18; i++) { const x = w * (0.7 + r() * 0.3); g.beginPath(); g.moveTo(x, h * 0.05); g.lineTo(x, h * 0.45); g.stroke(); }
}

/** la franja esmerilada del cristal con la frase de la foto */
function franja(g, w, h) {
  g.fillStyle = 'rgba(236,238,240,1)';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#6a6c70';
  g.font = `700 ${Math.round(h * 0.34)}px "Arial Narrow", Arial, sans-serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  for (let x = 0.12; x < 1; x += 0.25) {
    g.fillText('I WAS SAD', w * x, h * 0.3);
    g.fillText('THEN I SAW FOOD', w * x, h * 0.72);
  }
}

// ——— las piezas ———

/** el bar: la cristalera, la banda negra, el techo del soportal con sus focos y el ficus */
function fachada(k) {
  const sm = (S0 + S1) / 2, L = S1 - S0;
  // la cristalera de lado a lado, con sus juntas finas y la franja esmerilada
  k.pic(sm, BANDA / 2, Z + 0.01, L, BANDA, 0, 1, canvasTex(860, 300, local), { glow: 0.1 });
  k.pic(sm, 1.25, Z + 0.03, L, 0.32, 0, 1, canvasTex(860, 40, franja));
  for (let s = S0; s <= S1 + 0.01; s += L / 4) k.box(s, 0, Z + 0.04, 0.05, BANDA, 0.05, 0x3a3a3c);
  k.box(sm, 0, Z + 0.04, L, 0.2, 0.06, 0x3a3a3c);
  // la banda negra con el nombre
  k.box(sm, BANDA, Z, L + 0.4, TECHO - BANDA, 0.14, NEGRO);
  k.pic(sm, (BANDA + TECHO) / 2, Z + 0.075, L * 0.8, TECHO - BANDA - 0.12, 0, 1, canvasTex(700, 110, rotulo));
  // el techo blanco del soportal con los focos redondos y una bombilla colgada
  k.box(sm, TECHO, Z + FUERA / 2, L + 0.4, 0.25, FUERA, BLANCO);
  for (let s = S0 + 1; s < S1; s += 2.2) k.cyl(s, TECHO - 0.01, Z + FUERA * 0.55, 0.09, 0.09, 0.02, 0xfff2d8, { seg: 12, list: k.glow });
  k.box(S1 - 1.2, TECHO - 0.6, Z + 1.4, 0.01, 0.6, 0.01, 0x2a2a2c);
  k.ball(S1 - 1.2, TECHO - 0.66, Z + 1.4, 0.06, 0xffd890, { seg: 8, list: k.glow });
  // el ficus de delante en su macetero
  const fs = S0 + 0.9, fz = Z + 1.9;
  k.box(fs, 0, fz, 0.7, 0.75, 0.7, 0x2a2a2c);
  k.block(fs, fz, 0.7, 0.7);
  k.cyl(fs, 0.75, fz, 0.05, 0.08, 1.6, 0xb8b0a0, { seg: 6 });
  let s0 = 29;
  const r = () => (s0 = (s0 * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 11; i++) k.ball(fs + (r() - 0.5) * 1.3, 1.9 + r() * 1.2, fz + (r() - 0.5) * 1.1, 0.3 + r() * 0.2, [0x4a7a2a, 0x5a8a32, 0x3a6a22][Math.floor(r() * 3)], { seg: 7 });
}

/** se monta con lo demás de Valterra, en su primera fase */
export function buildIntrigo(scene, colliders, map) {
  if (!map?.intrigo) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, I, 'intrigo', colliders);
  scene.add(group);
  return { group };
}
