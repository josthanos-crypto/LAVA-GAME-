import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * Vegas Laundry, la lavandería autoservicio y tintorería de la calle Blas Cabrera Topham, con las fotos de
 * Google Maps (solo se miran, no van dentro del juego): el letrero azul de lado a lado con burbujas,
 * «Lavandería Autoservicio», «Vegas Laundry» grande y «Tintorería», la chapa de piedra color arena de la
 * planta baja, la puerta doble de cristal con marco oscuro y sus carteles de horario, el escaparate con
 * «Tintorería Vegas Laundry» en rojo y las burbujas pegadas, el otro escaparate con los carteles, y dentro
 * las lavadoras de acero. El bloque se queda como está.
 */

// la cara de la calle Blas Cabrera Topham (s desde la esquina del este)
const V = marco([-212.0, 50.9], [-245.7, 30.4]);
const Z = 0.12, S0 = 1.6, S1 = 10.0, MARCO = 0x2a2a2c;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneVegasLaundry(map) {
  map.vegasLaundrySign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Vegas Laundry');
  if (i >= 0) map.vegasLaundrySign = map.signs.splice(i, 1)[0];
  map.vegasLaundry = true;
}

// ——— lo que se pinta en lienzo ———

/** unas burbujas: círculos blancos con su brillo */
function burbujas(g, w, h, n, seed, rMax) {
  let s = seed;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n; i++) {
    const x = r() * w, y = r() * h, rr = 2 + r() * rMax;
    g.strokeStyle = 'rgba(255,255,255,.85)';
    g.lineWidth = 1.5;
    g.beginPath(); g.arc(x, y, rr, 0, Math.PI * 2); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.5)';
    g.beginPath(); g.arc(x - rr * 0.35, y - rr * 0.35, rr * 0.25, 0, Math.PI * 2); g.fill();
  }
}

/** el letrero azul con burbujas: Lavandería Autoservicio, Vegas Laundry y Tintorería */
function letrero(g, w, h) {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, '#9ac8f0');
  gr.addColorStop(0.5, '#3a7ad8');
  gr.addColorStop(1, '#1e4ab0');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  burbujas(g, w, h, 40, 7, h * 0.08);
  g.fillStyle = '#f4f8fc';
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  g.font = `italic 600 ${Math.round(h * 0.18)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('Lavandería', w * 0.02, h * 0.38);
  g.fillText('Autoservicio', w * 0.02, h * 0.62);
  g.textAlign = 'center';
  g.font = `italic 800 ${Math.round(h * 0.5)}px "Segoe UI", Arial, sans-serif`;
  g.fillStyle = '#1e3a8a';
  g.fillText('Vegas Laundry', w * 0.52 + 2, h * 0.52 + 2);
  g.fillStyle = '#f4f8fc';
  g.fillText('Vegas Laundry', w * 0.52, h * 0.52);
  g.textAlign = 'right';
  g.font = `italic 600 ${Math.round(h * 0.2)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('Tintorería', w * 0.98, h * 0.3);
}

/** la piedra color arena en placas cuadradas */
function piedra(g, w, h) {
  g.fillStyle = '#b8945a';
  g.fillRect(0, 0, w, h);
  let s = 41;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const c = w / 10;
  for (let y = 0; y < h; y += c) for (let x = 0; x < w; x += c) {
    const v = r();
    g.fillStyle = `rgb(${Math.round(170 + v * 40)},${Math.round(130 + v * 34)},${Math.round(80 + v * 30)})`;
    g.fillRect(x + 1, y + 1, c - 2, c - 2);
  }
}

/** por el cristal: la lavandería con las lavadoras de acero */
function dentro(g, w, h) {
  g.fillStyle = '#e8eef4';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#8a5a3a';
  g.fillRect(0, h * 0.82, w, h * 0.18);
  for (let x = 0.05; x < 0.95; x += 0.18) {
    for (const y of [0.3, 0.58]) {
      g.fillStyle = '#c8ccd0';
      g.fillRect(w * x, h * y, w * 0.16, h * 0.26);
      g.fillStyle = '#3a3e44';
      g.beginPath(); g.arc(w * (x + 0.08), h * (y + 0.14), w * 0.05, 0, Math.PI * 2); g.fill();
    }
  }
}

/** el escaparate de la tintorería: el rótulo rojo y las burbujas pegadas */
function escaparateRojo(g, w, h) {
  dentro(g, w, h);
  g.fillStyle = 'rgba(40,40,44,.45)';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e83a3a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.09)}px Georgia, serif`;
  g.fillText('Tintorería Vegas Laundry', w / 2, h * 0.2);
  burbujas(g, w, h * 0.5, 14, 23, h * 0.05);
  g.save(); g.translate(0, h * 0.5); burbujas(g, w, h * 0.5, 12, 31, h * 0.06); g.restore();
}

/** el escaparate de los carteles de horario */
function escaparateCarteles(g, w, h) {
  dentro(g, w, h);
  g.fillStyle = 'rgba(40,40,44,.4)';
  g.fillRect(0, 0, w, h);
  for (const [x, y, a, b, c] of [[0.05, 0.08, 0.28, 0.75, '#e8402a'], [0.38, 0.1, 0.3, 0.22, '#f2f2ee'], [0.4, 0.38, 0.26, 0.4, '#2a7ad8'], [0.72, 0.12, 0.22, 0.3, '#f2f2ee']]) { g.fillStyle = c; g.fillRect(w * x, h * y, w * a, h * b); }
  burbujas(g, w, h, 10, 47, h * 0.05);
}

/** la puerta doble: el cristal y los carteles pegados */
function puerta(g, w, h) {
  dentro(g, w, h);
  g.fillStyle = 'rgba(40,40,44,.35)';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f2f2ee';
  g.fillRect(w * 0.1, h * 0.15, w * 0.3, h * 0.14);
  g.fillRect(w * 0.6, h * 0.15, w * 0.3, h * 0.14);
  g.fillStyle = '#2a2a2c';
  g.fillRect(w * 0.48, 0, w * 0.04, h);
  burbujas(g, w, h, 6, 59, h * 0.03);
}
// ——— las piezas ———

/** la planta baja de la lavandería */
function fachada(k) {
  const sm = (S0 + S1) / 2, H = 2.75;
  // la chapa de piedra color arena
  k.box(sm, 0, Z - 0.05, S1 - S0, 3.6, 0.1, 0xb8945a);
  k.pic(sm, 1.8, Z + 0.004, S1 - S0, 3.6, 0, 1, canvasTex(512, 220, piedra));
  // el escaparate de los carteles, la puerta doble y el escaparate de la tintorería
  const huecos = [[S0 + 0.3, S0 + 2.6, escaparateCarteles, 0.3], [S0 + 2.8, S0 + 4.6, puerta, 0.05], [S0 + 4.9, S1 - 0.6, escaparateRojo, 0.3]];
  for (const [a, b, f, y0] of huecos) {
    k.pic((a + b) / 2, (y0 + H) / 2, Z + 0.01, b - a, H - y0, 0, 1, canvasTex(256, Math.round(256 * (H - y0) / (b - a)), f), { glow: 0.06 });
    for (const s of [a, b]) k.box(s, y0, Z + 0.03, 0.08, H - y0, 0.08, MARCO);
    for (const y of [y0, H - 0.06]) k.box((a + b) / 2, y, Z + 0.03, b - a, 0.08, 0.08, MARCO);
  }
  // el letrero azul de encima, de lado a lado
  k.box(sm, 2.85, Z + 0.06, S1 - S0, 0.75, 0.12, 0x2a5ac8);
  k.pic(sm, 3.225, Z + 0.125, S1 - S0 - 0.05, 0.72, 0, 1, canvasTex(1024, 88, letrero));
  // la caja gris del contador junto a la tintorería
  k.box(S1 - 0.3, 0.9, Z + 0.08, 0.35, 0.45, 0.12, 0xd8d8d4);
}

/** segunda fase, como los demás de este barrio */
export function buildVegasLaundry(scene, colliders, map) {
  if (!map?.vegasLaundry) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, V, 'vegasLaundry', colliders);
  scene.add(group);
  return { group };
}
