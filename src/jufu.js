import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * Jufu, el restaurante chino de buffet libre de la calle Guenia, con la foto de Google Maps de febrero de
 * 2022 (solo se mira, no va dentro del juego): la planta baja chapada de granito oscuro, el escaparate de
 * la izquierda con «COMIDAS PARA LLEVAR · RESTAURANTE BUFFET LIBRE» y el teléfono en letras doradas, la
 * puerta de cristal con la caja de la persiana encima y el comedor blanco dentro, el escaparate de la
 * derecha con lo de los adultos, los niños y el horario en dorado (sin los precios de la foto, que serán
 * otros), y encima el panel dorado con «JUFU» en letras plateadas grandes y «RESTAURANTE BUFFET LIBRE».
 * El bloque se queda como está.
 */

// la cara de la calle Guenia (s desde el extremo del norte)
const J = marco([-745.55, 283.16], [-738.62, 357.88]);
const Z = 0.12, S0 = 47.5, S1 = 55.5, H = 2.95, GRANITO = 0x2a2a2c, MARCO = 0x1a1a1c;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneJufu(map) {
  map.jufuSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Jufu Restaurant chino');
  if (i >= 0) map.jufuSign = map.signs.splice(i, 1)[0];
  map.jufu = true;
}

// ——— lo que se pinta en lienzo ———

/** el granito oscuro con sus motas, en placas */
function granito(g, w, h) {
  g.fillStyle = '#2a2a2c';
  g.fillRect(0, 0, w, h);
  let s = 23;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 2200; i++) { const v = 80 + r() * 80; g.fillStyle = `rgba(${v},${v},${v + 3},.4)`; g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2); }
  g.strokeStyle = 'rgba(8,8,10,.7)';
  g.lineWidth = 2;
  for (let y = 0; y < h; y += h / 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  for (let x = 0; x < w; x += w / 12) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
}

/** el comedor por el cristal: paredes blancas, el mostrador del buffet y el reflejo de la calle */
function comedor(g, w, h) {
  g.fillStyle = '#e8e6e0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c8c4bc';
  g.fillRect(0, h * 0.78, w, h * 0.22);
  g.fillStyle = '#b8bcc0';
  g.fillRect(w * 0.1, h * 0.55, w * 0.8, h * 0.08);
  g.fillStyle = '#5a5a5c';
  g.fillRect(w * 0.1, h * 0.63, w * 0.8, h * 0.15);
  for (let x = 0.12; x < 0.88; x += 0.1) { g.fillStyle = ['#c87a3a', '#e8b050', '#a84a2a', '#5a8a3a'][Math.floor(x * 30) % 4]; g.fillRect(w * x, h * 0.52, w * 0.07, h * 0.03); }
  g.fillStyle = '#f4f2ea';
  for (const x of [0.2, 0.5, 0.8]) { g.beginPath(); g.arc(w * x, h * 0.12, w * 0.04, 0, Math.PI * 2); g.fill(); }
  // el reflejo de los árboles y los coches de la calle
  const rf = g.createLinearGradient(0, 0, 0, h);
  rf.addColorStop(0, 'rgba(50,70,50,.65)');
  rf.addColorStop(0.6, 'rgba(90,100,92,.4)');
  rf.addColorStop(1, 'rgba(30,30,34,.5)');
  g.fillStyle = rf;
  g.fillRect(0, 0, w, h);
}

/** unas líneas de letras doradas con su sombra oscura, como el vinilo de la foto */
function dorado(g, lineas, x, y0, paso, tam, alinear) {
  g.textAlign = alinear;
  g.textBaseline = 'middle';
  lineas.forEach((t, i) => {
    g.font = `800 ${Math.round(tam * (t.length > 14 ? 0.8 : 1))}px "Arial Narrow", Arial, sans-serif`;
    g.fillStyle = '#2a1e10';
    g.fillText(t, x + 2, y0 + i * paso + 2);
    g.fillStyle = '#d8b050';
    g.fillText(t, x, y0 + i * paso);
  });
}

/** el escaparate de la izquierda: COMIDAS PARA LLEVAR, RESTAURANTE BUFFET LIBRE y el teléfono */
function escaparateIzq(g, w, h) {
  comedor(g, w, h);
  dorado(g, ['COMIDAS', 'PARA LLEVAR', 'RESTAURANTE', 'BUFFET', 'LIBRE', '928 80 03 77'], w * 0.4, h * 0.12, h * 0.15, h * 0.11, 'center');
}

/** el escaparate de la derecha: adultos, niños, IGIC incluido, el wifi y el horario */
function escaparateDer(g, w, h) {
  comedor(g, w, h);
  dorado(g, ['ADULTOS', 'NIÑOS (HASTA 7 AÑOS)', 'IGIC incluido', '12:30 - 16:00h', '19:00 - 24:00'], w * 0.55, h * 0.14, h * 0.17, h * 0.1, 'center');
  g.fillStyle = '#8a2a6a';
  g.beginPath(); g.arc(w * 0.15, h * 0.48, w * 0.06, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#f2f2ee';
  g.font = `700 ${Math.round(w * 0.04)}px Arial, sans-serif`;
  g.textAlign = 'center';
  g.fillText('WiFi', w * 0.15, h * 0.48);
}

/** la puerta de cristal abierta: el comedor dentro y el marco negro */
function puerta(g, w, h) {
  comedor(g, w, h);
  g.fillStyle = 'rgba(30,30,32,.25)';
  g.fillRect(0, 0, w * 0.3, h);
  g.fillStyle = '#1a1a1c';
  g.fillRect(w * 0.28, 0, w * 0.04, h);
}

/** el panel dorado de encima: JUFU en letras plateadas grandes y RESTAURANTE BUFFET LIBRE */
function panel(g, w, h) {
  const gr = g.createLinearGradient(0, 0, w, h);
  gr.addColorStop(0, '#c8a060');
  gr.addColorStop(0.5, '#e0c080');
  gr.addColorStop(1, '#b89050');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.08)';
  for (let y = 0; y < h; y += 3) g.fillRect(0, y, w, 1);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `900 ${Math.round(h * 0.6)}px "Arial Black", Arial, sans-serif`;
  g.fillStyle = '#5a4a3a';
  g.fillText('JUFU', w / 2 + h * 0.03, h * 0.36 + h * 0.04);
  g.fillStyle = '#f0f0ee';
  g.fillText('JUFU', w / 2, h * 0.36);
  g.font = `700 ${Math.round(h * 0.2)}px Arial, sans-serif`;
  g.fillStyle = '#6a5a48';
  g.fillText('RESTAURANTE BUFFET LIBRE', w / 2 + 2, h * 0.83 + 2);
  g.fillStyle = '#f4f4f2';
  g.fillText('RESTAURANTE BUFFET LIBRE', w / 2, h * 0.83);
}

// ——— las piezas ———

/** el marco negro de un hueco */
function marcoNegro(k, a, b, y0, y1) {
  for (const s of [a, b]) k.box(s, y0, Z + 0.03, 0.1, y1 - y0, 0.08, MARCO);
  for (const y of [y0, y1 - 0.1]) k.box((a + b) / 2, y, Z + 0.03, b - a, 0.1, 0.08, MARCO);
}

/** la planta baja del restaurante */
function fachada(k) {
  const sm = (S0 + S1) / 2;
  // el granito oscuro de toda la planta baja y las pilastras de los lados
  k.box(sm, 0, Z - 0.05, S1 - S0, H, 0.1, GRANITO);
  k.pic(sm, H / 2, Z + 0.004, S1 - S0, H, 0, 1, canvasTex(640, 236, granito));
  for (const s of [S0 + 0.22, S1 - 0.22]) k.box(s, 0, Z + 0.05, 0.44, H, 0.12, GRANITO);
  // el escaparate de la izquierda, la puerta y el escaparate de la derecha
  const a = S0 + 0.55, b = S0 + 3.65, c = S0 + 5.25, d = S1 - 0.55, y0 = 0.3, y1 = 2.6;
  k.pic((a + b) / 2, (y0 + y1) / 2, Z + 0.01, b - a, y1 - y0, 0, 1, canvasTex(310, 230, escaparateIzq), { glow: 0.06 });
  k.pic((b + c) / 2, 1.25, Z + 0.01, c - b, 2.5, 0, 1, canvasTex(160, 250, puerta), { glow: 0.06 });
  k.pic((c + d) / 2, (y0 + y1) / 2, Z + 0.01, d - c, y1 - y0, 0, 1, canvasTex(270, 230, escaparateDer), { glow: 0.06 });
  marcoNegro(k, a, b, y0, y1);
  marcoNegro(k, c, d, y0, y1);
  for (const s of [b, c]) k.box(s, 0, Z + 0.03, 0.1, 2.5, 0.08, MARCO);
  // la caja de la persiana encima de la puerta y su lucecita blanca
  k.box((b + c) / 2, 2.5, Z + 0.08, c - b + 0.1, 0.32, 0.22, 0x3a3a3c);
  k.box(c + 0.35, 2.68, Z + 0.06, 0.3, 0.1, 0.12, 0xe8e8e4);
}

/** el panel dorado del nombre */
function rotulo(k) {
  const sm = (S0 + S1) / 2, y0 = H, y1 = 4.05;
  k.box(sm, y0, Z + 0.07, S1 - S0, y1 - y0, 0.24, 0xc8a060);
  k.pic(sm, (y0 + y1) / 2, Z + 0.195, S1 - S0 - 0.06, y1 - y0 - 0.04, 0, 1, canvasTex(1024, 140, panel));
}

/** segunda fase, como los demás de este barrio */
export function buildJufu(scene, colliders, map) {
  if (!map?.jufu) return null;
  const k = new Kit();
  fachada(k);
  rotulo(k);
  const group = enMarco(k, J, 'jufu', colliders);
  scene.add(group);
  return { group };
}
