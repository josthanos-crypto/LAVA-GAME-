import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * Terali, la zapatería del paseo de la Marina Lanzarote, con la foto de Google Maps de abril de 2022 (solo
 * se mira, no va dentro del juego): las dos pilastras de piedra gris, el frente forrado de azul brillante
 * con «ZAPATOS · TERALI · SHOES» en blanco en sus tres paños, el escaparate grande con las baldas blancas de
 * zapatos y botas (y el cartelito azul de Terali) en el que se reflejan los mástiles de la Marina, la puerta
 * de cristal de marco blanco con el felpudo azul y el escaparate pequeño de después. El bloque se queda
 * como está.
 */

// la cara del edificio que da al paseo y al agua (s desde el extremo del sur); el rótulo del mapa cae en s 37,2
const T = marco([1135.48, -102.14], [1102.16, -42.72]);
const Z = 0.12, S0 = 33.4, S1 = 42.2, ALTO = 3.6, AZUL = 0x1e3cc8, PIEDRA = 0x5a5a5c, BLANCO = 0xf4f4f2;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneTerali(map) {
  map.teraliSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Terali');
  if (i >= 0) map.teraliSign = map.signs.splice(i, 1)[0];
  map.terali = true;
}

// ——— lo que se pinta en lienzo ———

/** la piedra gris oscura de las pilastras */
function piedra(g, w, h) {
  g.fillStyle = '#5a5a5c';
  g.fillRect(0, 0, w, h);
  let s = 3;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 900; i++) { const v = 70 + r() * 40; g.fillStyle = `rgba(${v},${v},${v + 2},.5)`; g.fillRect(r() * w, r() * h, 2, 3); }
  g.strokeStyle = 'rgba(40,40,42,.6)';
  g.lineWidth = 2;
  for (let y = 0; y < h; y += h / 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** el frente azul de arriba: ZAPATOS, TERALI y SHOES en sus tres paños con los perfiles blancos */
function rotulo(g, w, h) {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, '#2a4ad8');
  gr.addColorStop(1, '#1a34b8');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.12)';
  g.fillRect(0, 0, w, h * 0.18);
  const cortes = [0, 0.42, 0.74, 1];
  g.strokeStyle = '#f4f4f2';
  g.lineWidth = 5;
  for (const c of cortes) { g.beginPath(); g.moveTo(w * c, 0); g.lineTo(w * c, h); g.stroke(); }
  g.strokeRect(2, 2, w - 4, h - 4);
  g.fillStyle = '#f4f4f2';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `900 ${Math.round(h * 0.62)}px "Arial Narrow", "Arial Black", Arial, sans-serif`;
  g.fillText('ZAPATOS', w * 0.21, h * 0.54);
  g.font = `italic 700 ${Math.round(h * 0.6)}px Georgia, "Times New Roman", serif`;
  g.fillText('TERALI', w * 0.58, h * 0.54);
  g.font = `900 ${Math.round(h * 0.5)}px "Arial Narrow", "Arial Black", Arial, sans-serif`;
  g.fillText('SHOES', w * 0.87, h * 0.54);
}

/** el escaparate: las baldas blancas con zapatos y botas, el cartelito azul y el reflejo de los mástiles */
function escaparate(seed, cartel) {
  return (g, w, h) => {
    g.fillStyle = '#e8eaec';
    g.fillRect(0, 0, w, h);
    let s = seed;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let y = 0.3; y < 0.95; y += 0.16) {
      g.fillStyle = '#ffffff';
      g.fillRect(w * 0.04, h * (y + 0.1), w * 0.92, h * 0.025);
      g.fillStyle = '#3a6ad8';
      g.fillRect(w * 0.04, h * (y + 0.123), w * 0.92, h * 0.006);
      for (let x = 0.08; x < 0.9; x += 0.09 + r() * 0.05) {
        const color = ['#2a2a2c', '#8a3a2a', '#c83a6a', '#e8e0d0', '#5a4a6a', '#a8743a'][Math.floor(r() * 6)];
        g.fillStyle = color;
        if (r() < 0.5) { g.fillRect(w * x, h * (y + 0.01), w * 0.035, h * 0.09); g.fillRect(w * x, h * (y + 0.07), w * 0.06, h * 0.03); }
        else { g.beginPath(); g.moveTo(w * x, h * (y + 0.1)); g.lineTo(w * (x + 0.06), h * (y + 0.1)); g.lineTo(w * (x + 0.05), h * (y + 0.06)); g.lineTo(w * (x + 0.01), h * (y + 0.05)); g.closePath(); g.fill(); }
      }
    }
    if (cartel) {
      g.fillStyle = '#2a4ad8';
      g.fillRect(w * 0.55, h * 0.78, w * 0.12, h * 0.1);
      g.fillStyle = '#f4f4f2';
      g.font = `italic 700 ${Math.round(h * 0.035)}px Georgia, serif`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('TERALI', w * 0.61, h * 0.83);
    }
    // el reflejo del cielo y de los mástiles de la Marina en la parte de arriba del cristal
    const cielo = g.createLinearGradient(0, 0, 0, h * 0.45);
    cielo.addColorStop(0, 'rgba(170,200,230,.75)');
    cielo.addColorStop(1, 'rgba(170,200,230,0)');
    g.fillStyle = cielo;
    g.fillRect(0, 0, w, h * 0.45);
    g.strokeStyle = 'rgba(70,80,96,.55)';
    for (let i = 0; i < 26; i++) { const x = r() * w; g.lineWidth = 1 + r(); g.beginPath(); g.moveTo(x, h * (0.08 + r() * 0.1)); g.lineTo(x, h * 0.4); g.stroke(); }
    g.fillStyle = 'rgba(240,240,244,.5)';
    for (let i = 0; i < 12; i++) g.fillRect(r() * w, h * (0.34 + r() * 0.05), w * 0.05, h * 0.02);
  };
}

/** la puerta de cristal abierta: la tienda blanca de dentro y las pegatinas */
function puerta(g, w, h) {
  g.fillStyle = '#eef0f2';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8dadc';
  g.fillRect(0, h * 0.85, w, h * 0.15);
  g.fillStyle = '#e8e0d0';
  g.fillRect(w * 0.15, h * 0.3, w * 0.35, h * 0.45);
  g.fillStyle = '#2a4ad8';
  g.beginPath(); g.arc(w * 0.7, h * 0.35, w * 0.12, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#f2d23a';
  g.fillRect(w * 0.62, h * 0.5, w * 0.12, h * 0.05);
  g.fillStyle = '#c82a2a';
  g.fillRect(w * 0.62, h * 0.68, w * 0.16, h * 0.04);
}

// ——— las piezas ———

/** un marco blanco de aluminio alrededor de un hueco */
function marcoBlanco(k, a, b, y0, y1) {
  for (const s of [a, b]) k.box(s, y0, Z + 0.06, 0.07, y1 - y0, 0.06, BLANCO);
  for (const y of [y0, y1 - 0.07]) k.box((a + b) / 2, y, Z + 0.06, b - a, 0.07, 0.06, BLANCO);
}

/** la zapatería: las pilastras de piedra, el frente azul, los escaparates y la puerta */
function fachada(k) {
  const sm = (S0 + S1) / 2, yC = 2.75;
  // el azul brillante de todo el frente y las dos pilastras de piedra gris
  k.box(sm, 0, Z - 0.05, S1 - S0, ALTO, 0.1, AZUL);
  for (const s of [S0 + 0.3, S1 - 0.3]) {
    k.box(s, 0, Z + 0.05, 0.6, ALTO + 0.1, 0.14, PIEDRA);
    k.pic(s, (ALTO + 0.1) / 2, Z + 0.125, 0.6, ALTO + 0.1, 0, 1, canvasTex(48, 280, piedra));
  }
  // el frente azul de arriba con el nombre
  k.box(sm, yC, Z + 0.04, S1 - S0 - 1.2, ALTO - yC, 0.1, AZUL);
  k.pic(sm, (yC + ALTO) / 2, Z + 0.095, S1 - S0 - 1.24, ALTO - yC - 0.04, 0, 1, canvasTex(900, 96, rotulo));
  // el escaparate grande, la puerta y el escaparate pequeño, con sus marcos blancos
  const a = S0 + 0.85, b = S0 + 5.0, c = S0 + 5.25, d = S0 + 6.45, e = S0 + 6.7, f = S1 - 0.85, y0 = 0.25, y1 = yC - 0.15;
  k.pic((a + b) / 2, (y0 + y1) / 2, Z + 0.01, b - a, y1 - y0, 0, 1, canvasTex(330, 190, escaparate(11, true)), { glow: 0.05 });
  k.pic((c + d) / 2, y1 / 2, Z + 0.01, d - c, y1, 0, 1, canvasTex(100, 200, puerta), { glow: 0.05 });
  k.pic((e + f) / 2, (y0 + y1) / 2, Z + 0.01, f - e, y1 - y0, 0, 1, canvasTex(140, 190, escaparate(23, false)), { glow: 0.05 });
  marcoBlanco(k, a, b, y0, y1);
  marcoBlanco(k, c, d, 0, y1);
  marcoBlanco(k, e, f, y0, y1);
  // el felpudo azul de la puerta, encima de las losas del paseo (que van a 0,2 m)
  k.box((c + d) / 2, 0.2, Z + 0.45, d - c, 0.02, 0.6, 0x1a2a8a);
}

/** se monta con lo demás de Valterra, en su primera fase */
export function buildTerali(scene, colliders, map) {
  if (!map?.terali) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, T, 'terali', colliders);
  scene.add(group);
  return { group };
}
