import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * La Cafetería Restaurante Lander, en la Rambla Medular 97, con la foto de Google Maps de diciembre de 2024
 * (solo se mira, no va dentro del juego): la planta baja forrada de granito negro pulido; encima de la
 * entrada, el rótulo de tablas de madera oscura con los bordes rotos, «CAFÉ - RESTAURANTE» en letras
 * doradas y «Lander» en letra de mano dorada dentro de su marco; y debajo, la cristalera de carpintería
 * granate con los cristales esmerilados de flores azules. La banderola redonda de la marca de refrescos de
 * la foto no se pone. El bloque se queda como está.
 */

// la fachada de la Rambla Medular (s de izquierda a derecha mirándola); el rótulo del mapa cae en s 16,8
const L = marco([-952.42, -263.5], [-972.95, -234.85]);
const Z = 0.12, S0 = 12.6, S1 = 20.6, GRANITO = 0x1e2024, GRANATE = 0x6a2420, PB = 4.2;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneLander(map) {
  map.landerSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Lander');
  if (i >= 0) map.landerSign = map.signs.splice(i, 1)[0];
  map.lander = true;
}

// ——— lo que se pinta en lienzo ———

/** el rótulo de tablas de madera oscura con los bordes rotos y las letras doradas */
function rotulo(g, w, h) {
  g.clearRect(0, 0, w, h);
  // las tablas, con el borde de arriba y el de abajo mordidos
  let s = 21;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  g.beginPath();
  g.moveTo(0, h * 0.06);
  for (let x = 0; x <= w; x += w / 40) g.lineTo(x, h * (0.02 + r() * 0.08));
  for (let x = w; x >= 0; x -= w / 40) g.lineTo(x, h * (0.9 + r() * 0.08));
  g.closePath();
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, '#3a3028');
  gr.addColorStop(1, '#2a221c');
  g.fillStyle = gr;
  g.fill();
  g.save();
  g.clip();
  g.strokeStyle = 'rgba(120,100,80,.35)';
  g.lineWidth = 2;
  for (let y = h * 0.08; y < h; y += h * 0.05) { g.beginPath(); g.moveTo(0, y + r() * 4); g.bezierCurveTo(w * 0.3, y + r() * 8, w * 0.6, y - r() * 8, w, y + r() * 4); g.stroke(); }
  g.fillStyle = 'rgba(0,0,0,.4)';
  for (const x of [0.33, 0.67]) g.fillRect(w * x, 0, 2, h);
  g.restore();
  // «CAFÉ - RESTAURANTE» arriba, y «Lander» en su marco dorado debajo
  g.fillStyle = '#e8d8a8';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.17)}px "Rockwell", Georgia, serif`;
  g.fillText('CAFÉ  -  RESTAURANTE', w * 0.5, h * 0.24);
  g.strokeStyle = '#c8a050';
  g.lineWidth = 4;
  const x0 = w * 0.18, y0 = h * 0.4, x1 = w * 0.82, y1 = h * 0.86, c = h * 0.06;
  g.beginPath();
  g.moveTo(x0 + c, y0); g.lineTo(x1 - c, y0); g.lineTo(x1, y0 + c); g.lineTo(x1, y1 - c); g.lineTo(x1 - c, y1);
  g.lineTo(x0 + c, y1); g.lineTo(x0, y1 - c); g.lineTo(x0, y0 + c); g.closePath(); g.stroke();
  g.fillStyle = '#e8c870';
  g.font = `italic 700 ${Math.round(h * 0.4)}px "Brush Script MT", "Segoe Script", "Lucida Handwriting", cursive`;
  g.fillText('Lander', w * 0.5, h * 0.64);
}

/** el cristal esmerilado con flores azules */
function esmerilado(g, w, h) {
  g.fillStyle = '#c8d4e2';
  g.fillRect(0, 0, w, h);
  let s = 9;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 90; i++) {
    const x = r() * w, y = r() * h, t = 3 + r() * 4;
    g.fillStyle = `rgba(${90 + r() * 40},${120 + r() * 40},${180 + r() * 40},.35)`;
    for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; g.beginPath(); g.arc(x + Math.cos(a) * t, y + Math.sin(a) * t, t * 0.6, 0, Math.PI * 2); g.fill(); }
  }
  g.fillStyle = 'rgba(255,255,255,.18)';
  g.fillRect(0, 0, w * 0.35, h);
}

/** el granito negro pulido, en placas, con el brillo del cielo */
function granito(g, w, h) {
  g.fillStyle = '#1e2024';
  g.fillRect(0, 0, w, h);
  let s = 3;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 500; i++) { const v = 40 + r() * 40; g.fillStyle = `rgb(${v},${v},${v + 4})`; g.fillRect(r() * w, r() * h, 1.5, 1.5); }
  const gr = g.createLinearGradient(0, 0, w, h);
  gr.addColorStop(0, 'rgba(160,180,200,.18)');
  gr.addColorStop(0.5, 'rgba(160,180,200,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(0,0,0,.6)';
  g.lineWidth = 2;
  for (let x = 0; x < w; x += w / 4) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y < h; y += h / 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

// ——— las piezas ———

/** el bajo: el granito negro, la cristalera granate con los cristales de flores, la puerta y el rótulo */
function fachada(k) {
  const sm = (S0 + S1) / 2, c0 = S0 + 1.2, c1 = S1 - 1.2, yC = 2.8;
  // el granito negro de toda la planta baja (alrededor de la cristalera)
  for (const [a, b, y0, y1] of [[S0, c0, 0, PB], [c1, S1, 0, PB], [c0, c1, yC, PB]]) {
    k.box((a + b) / 2, y0, Z - 0.01, b - a, y1 - y0, 0.06, GRANITO);
    k.pic((a + b) / 2, (y0 + y1) / 2, Z + 0.025, b - a, y1 - y0, 0, 1, canvasTex(Math.max(32, Math.round((b - a) * 40)), Math.max(32, Math.round((y1 - y0) * 40)), granito));
  }
  // la cristalera: carpintería granate en cuarterones con los cristales esmerilados (y la puerta a la derecha)
  const tex = canvasTex(160, 160, esmerilado);
  const cols = 4, filas = 3, ancho = (c1 - c0) / cols, alto = (yC - 0.3) / filas;
  for (let i = 0; i < cols; i++) for (let j = 0; j < filas; j++) {
    k.pic(c0 + ancho * (i + 0.5), 0.3 + alto * (j + 0.5), Z + 0.0, ancho - 0.1, alto - 0.1, 0, 1, tex, { glow: 0.05 });
  }
  for (let i = 0; i <= cols; i++) k.box(c0 + ancho * i, 0, Z + 0.04, i === 0 || i === cols ? 0.14 : 0.08, yC, 0.1, GRANATE);
  for (let j = 0; j <= filas; j++) k.box((c0 + c1) / 2, 0.3 + alto * j - 0.04, Z + 0.04, c1 - c0, j === 0 ? 0.3 + 0.04 : 0.08, 0.1, GRANATE);
  k.box(c1 - ancho / 2, 1.0, Z + 0.1, 0.04, 0.3, 0.06, 0xc8a050);
  // el rótulo de tablas, un poco despegado del granito, con sus escuadras
  k.pic(sm, yC + 0.8, Z + 0.14, c1 - c0 + 0.8, 1.45, 0, 1, canvasTex(800, 150, rotulo));
  k.box(sm, yC + 0.15, Z + 0.07, c1 - c0 + 0.6, 1.3, 0.1, 0x2a221c);
  for (const s of [c0, c1]) k.box(s, yC + 0.5, Z + 0.07, 0.04, 0.04, 0.12, 0x5a5a5c);
}

/** se monta con lo demás de Arrecife Centro (cae al borde de su caja, junto a San Francisco Javier) */
export function buildLander(scene, colliders, map) {
  if (!map?.lander) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, L, 'lander', colliders);
  scene.add(group);
  return { group };
}
