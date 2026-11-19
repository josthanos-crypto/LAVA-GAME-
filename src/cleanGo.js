import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * La lavandería autoservicio Clean&Go Bello Lanzarote, en la calle Francos, con la foto de Google Maps de
 * febrero de 2022 (solo se mira, no va dentro del juego): la pared blanca con los cables por arriba, el
 * portal de madera oscura del número 6 con sus cristales de dibujo y la placa roja de vivienda vacacional,
 * el letrero blanco de la lavandería con «LAVANDERÍA AUTOSERVICIO», «Clean&Go» y «Bello LANZAROTE» y el
 * remolino verde, la entrada con las puertas de madera oscura abiertas y el marco verde lima, la sala
 * verde con las lavadoras de acero dentro, la caja gris del contador, el escaparate de marco verde con
 * el nombre pegado, la otra puerta de madera de después y los dos bolardos negros de la acera. El bloque
 * se queda como está.
 */

// la cara de la calle Francos (s desde el extremo del suroeste)
const C = marco([33.27, 71.23], [49.82, 53.68]);
const Z = 0.12, S0 = 10.8, S1 = 22.8, ALTO = 3.9, BLANCO = 0xf2f0ea, MADERA = 0x4a2a1a, VERDE = 0x7ac81e;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneCleanGo(map) {
  map.cleanGoSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Clean & Go');
  if (i >= 0) map.cleanGoSign = map.signs.splice(i, 1)[0];
  map.cleanGo = true;
}

// ——— lo que se pinta en lienzo ———

/** el remolino verde del letrero: dos arcos gruesos */
function remolino(g, x, y, r) {
  g.strokeStyle = '#7ac81e';
  g.lineCap = 'round';
  g.lineWidth = r * 0.28;
  g.beginPath(); g.arc(x, y, r, Math.PI * 0.6, Math.PI * 1.6); g.stroke();
  g.lineWidth = r * 0.18;
  g.beginPath(); g.arc(x, y, r * 0.55, Math.PI * 0.7, Math.PI * 1.7); g.stroke();
}

/** el nombre: Clean en gris, el & en verde, Go en gris */
function nombre(g, x, y, t) {
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  g.font = `700 ${Math.round(t)}px "Segoe UI", Arial, sans-serif`;
  const a = g.measureText('Clean').width, b = g.measureText('&').width, c = g.measureText('Go').width;
  let x0 = x - (a + b + c) / 2;
  g.fillStyle = '#4a4a4c'; g.fillText('Clean', x0, y); x0 += a;
  g.fillStyle = '#7ac81e'; g.fillText('&', x0, y); x0 += b;
  g.fillStyle = '#4a4a4c'; g.fillText('Go', x0, y);
}

/** el letrero blanco de encima de la entrada */
function letrero(g, w, h) {
  g.fillStyle = '#f6f6f4';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#4a4a4c';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.15)}px "Arial Narrow", Arial, sans-serif`;
  g.fillText('LAVANDERÍA AUTOSERVICIO', w * 0.47, h * 0.17);
  nombre(g, w * 0.47, h * 0.47, h * 0.3);
  g.textAlign = 'right';
  g.fillStyle = '#7ac81e';
  g.font = `italic 700 ${Math.round(h * 0.17)}px "Segoe Script", Georgia, serif`;
  g.fillText('Bello', w * 0.38, h * 0.79);
  g.textAlign = 'left';
  g.fillStyle = '#5a5a5c';
  g.font = `400 ${Math.round(h * 0.17)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('LANZAROTE', w * 0.4, h * 0.79);
  remolino(g, w * 0.98, h * 0.75, h * 0.32);
}

/** la sala de dentro: las paredes verde lima, las lavadoras de acero en dos alturas y el suelo oscuro */
function sala(g, w, h) {
  g.fillStyle = '#8ad02a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f2f2ee';
  g.fillRect(w * 0.08, h * 0.12, w * 0.62, h * 0.66);
  g.fillStyle = '#3a3a3e';
  g.fillRect(0, h * 0.8, w, h * 0.2);
  for (let i = 0; i < 4; i++) for (const y of [0.3, 0.56]) {
    const x = w * (0.1 + i * 0.15);
    g.fillStyle = '#c8ccd0';
    g.fillRect(x, h * y, w * 0.13, h * 0.24);
    g.fillStyle = '#3a3e44';
    g.beginPath(); g.arc(x + w * 0.065, h * (y + 0.13), w * 0.045, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#9aa0a6';
    g.beginPath(); g.arc(x + w * 0.065, h * (y + 0.13), w * 0.03, 0, Math.PI * 2); g.fill();
  }
  // la mesa de doblar de madera y la columna verde
  g.fillStyle = '#c8a070';
  g.fillRect(w * 0.72, h * 0.6, w * 0.25, h * 0.03);
  g.fillStyle = '#7ac81e';
  g.fillRect(w * 0.76, 0, w * 0.08, h * 0.8);
}

/** el escaparate: la sala detrás y el nombre pegado con el remolino */
function escaparate(g, w, h) {
  sala(g, w, h);
  g.fillStyle = 'rgba(240,244,246,.55)';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#4a4a4c';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.06)}px "Arial Narrow", Arial, sans-serif`;
  g.fillText('LAVANDERÍA AUTOSERVICIO', w * 0.45, h * 0.12);
  nombre(g, w * 0.45, h * 0.24, h * 0.1);
  g.fillStyle = '#5a5a5c';
  g.font = `400 ${Math.round(h * 0.05)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('LANZAROTE', w * 0.45, h * 0.33);
  remolino(g, w * 0.9, h * 0.72, h * 0.22);
}

/** un portal de madera oscura con los cristales de dibujo y el montante de cristal */
function portal(g, w, h) {
  g.fillStyle = '#4a2a1a';
  g.fillRect(0, 0, w, h);
  const m = w * 0.08;
  g.fillStyle = '#c8c8c0';
  g.fillRect(m, m, w - 2 * m, h * 0.14);
  for (const [a, b] of [[m, w * 0.47], [w * 0.53, w - m]]) {
    for (const [y0, y1] of [[0.22, 0.56], [0.6, 0.94]]) {
      g.fillStyle = '#b8bcb8';
      g.fillRect(a, h * y0, b - a, h * (y1 - y0));
      g.fillStyle = 'rgba(90,90,86,.5)';
      for (let y = y0; y < y1 - 0.02; y += 0.04) for (let x = a; x < b - 4; x += 10) g.fillRect(x + ((y * 100) % 2) * 4, h * y, 5, h * 0.02);
    }
  }
}

/** la placa azul del número 6 */
function numero(g, w, h) {
  g.fillStyle = '#2a4a8a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f2f2ee';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.7)}px Arial, sans-serif`;
  g.fillText('6', w / 2, h * 0.55);
}

/** la placa roja de vivienda vacacional */
function placaVV(g, w, h) {
  g.fillStyle = '#c8202a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f2f2ee';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.6)}px Georgia, serif`;
  g.fillText('Vv', w / 2, h * 0.55);
}

// ——— las piezas ———

/** la planta baja de la casa de la lavandería */
function fachada(k) {
  const sm = (S0 + S1) / 2;
  k.box(sm, 0, Z - 0.05, S1 - S0, ALTO, 0.1, BLANCO);
  // el portal del número 6, su número y la placa roja
  k.pic(12.05, 1.32, Z + 0.01, 1.3, 2.64, 0, 1, canvasTex(100, 204, portal));
  k.box(12.05, 2.64, Z + 0.03, 1.4, 0.08, 0.08, MADERA);
  k.pic(12.05, 3.0, Z + 0.01, 0.22, 0.26, 0, 1, canvasTex(40, 48, numero));
  k.pic(13.25, 2.0, Z + 0.025, 0.32, 0.36, 0, 1, canvasTex(48, 54, placaVV));
  k.box(11.0, 2.55, Z + 0.02, 0.26, 0.3, 0.02, 0xe8c020);
  // la entrada de la lavandería: el marco verde, las puertas de madera abiertas y la sala dentro
  const a = 14.2, b = 16.5, hp = 2.6;
  k.pic((a + b) / 2, hp / 2, Z + 0.004, b - a, hp, 0, 1, canvasTex(180, 204, sala), { glow: 0.08 });
  for (const s of [a - 0.06, b + 0.06]) k.box(s, 0, Z + 0.03, 0.12, hp + 0.12, 0.1, VERDE);
  k.box((a + b) / 2, hp, Z + 0.03, b - a + 0.24, 0.12, 0.1, VERDE);
  for (const s of [a + 0.1, b - 0.1]) k.box(s, 0, Z + 0.1, 0.12, hp - 0.02, 0.06, MADERA);
  k.box((a + b) / 2, hp - 0.14, Z + 0.1, b - a, 0.12, 0.06, MADERA);
  // el letrero blanco de encima
  k.box((a + b) / 2, 2.78, Z + 0.06, 2.9, 0.9, 0.08, 0xf6f6f4);
  k.pic((a + b) / 2, 3.23, Z + 0.105, 2.86, 0.86, 0, 1, canvasTex(400, 120, letrero));
  // la caja gris del contador
  k.box(17.2, 1.0, Z + 0.06, 0.5, 0.65, 0.12, 0xd8d8d4);
  // el escaparate de marco verde
  const c = 18.0, d = 19.8;
  k.pic((c + d) / 2, 1.45, Z + 0.01, d - c, 2.0, 0, 1, canvasTex(160, 178, escaparate), { glow: 0.06 });
  for (const s of [c, d]) k.box(s, 0.38, Z + 0.03, 0.1, 2.2, 0.08, VERDE);
  for (const y of [0.38, 2.5]) k.box((c + d) / 2, y, Z + 0.03, d - c + 0.1, 0.1, 0.08, VERDE);
  k.box((c + d) / 2, 0.3, Z + 0.08, d - c + 0.2, 0.06, 0.14, 0x3a3a3c);
  // la otra puerta de madera de después
  k.pic(21.7, 1.2, Z + 0.01, 0.95, 2.4, 0, 1, canvasTex(76, 192, portal));
  k.box(21.7, 2.4, Z + 0.03, 1.05, 0.08, 0.08, MADERA);
  // los cables de arriba y la cámara del rincón
  k.box(sm, 3.7, Z + 0.02, S1 - S0, 0.03, 0.03, 0x161618);
  k.box(13.3, 3.4, Z + 0.05, 0.22, 0.36, 0.12, 0xe8e6e0);
  k.box(11.2, 3.3, Z + 0.06, 0.12, 0.1, 0.12, 0x2a2a2c);
}

/** los dos bolardos negros del borde de la acera */
function bolardos(k) {
  for (const s of [11.3, 19.6]) {
    k.cyl(s, 0, 2.7, 0.08, 0.09, 0.85, 0x1e1e20, { seg: 10 });
    k.block(s, 2.7, 0.18, 0.18);
  }
}

/** segunda fase, como los demás de este barrio */
export function buildCleanGo(scene, colliders, map) {
  if (!map?.cleanGo) return null;
  const k = new Kit();
  fachada(k);
  bolardos(k);
  const group = enMarco(k, C, 'cleanGo', colliders);
  scene.add(group);
  return { group };
}
