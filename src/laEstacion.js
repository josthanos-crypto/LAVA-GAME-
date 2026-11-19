import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * El Bar Cafetería La Estación, en la nave blanca de la calle Velacho (zona industrial de Valterra), con
 * la foto de la vista de la calle de Google de julio de 2025 (solo se mira, no va dentro del juego): la
 * pared blanca de la nave con las ventanas de arriba, el remate rojo y azul del tejado de chapa, la puerta
 * de persiana gris, la rejilla blanca, el marco rojo de la puerta de emergencia, el zócalo gris oscuro,
 * el cartel enmarcado de al lado de la entrada, la entrada del bar con su marco gris oscuro y la puerta
 * de cristal, el letrero claro de «Bar Cafetería La Estación» encima, las cajas de los contadores y,
 * después de la esquina de la nave, la valla verde de chapa. Delante no hay terraza, solo aparcamiento.
 * El bloque se queda como está.
 */

// la cara de la calle Velacho (s desde el extremo del sur)
const E = marco([726.99, -602.93], [693.71, -663.88]);
const Z = 0.12, S0 = 34.0, S1 = 54.2, ALTO = 6.0, BLANCO = 0xf2f2ee, GRIS = 0x4a4a4c;

/** antes de levantar la ciudad: fuera el rótulo genérico (y con él la terraza genérica, que no está en la foto) */
export function tuneLaEstacion(map) {
  map.laEstacionSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'La Estación');
  if (i >= 0) map.laEstacionSign = map.signs.splice(i, 1)[0];
  map.laEstacion = true;
}

// ——— lo que se pinta en lienzo ———

/** el letrero claro del bar: Bar, Cafetería y La Estación en letras oscuras */
function letrero(g, w, h) {
  g.fillStyle = '#efe6cc';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#8a6a3a';
  g.lineWidth = 4;
  g.strokeRect(3, 3, w - 6, h - 6);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#2a2a6a';
  g.font = `700 ${Math.round(h * 0.2)}px Georgia, serif`;
  g.fillText('Bar', w / 2, h * 0.22);
  g.fillText('Cafetería', w / 2, h * 0.47);
  g.fillStyle = '#6a3a1a';
  g.font = `italic 700 ${Math.round(h * 0.16)}px Georgia, serif`;
  g.fillText('La Estación', w / 2, h * 0.76);
}

/** la puerta de cristal del bar: el marco oscuro y la penumbra de dentro */
function puerta(g, w, h) {
  g.fillStyle = '#2a2a2c';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#5a5e62';
  g.fillRect(w * 0.12, h * 0.06, w * 0.76, h * 0.9);
  g.fillStyle = '#8a7a68';
  g.fillRect(w * 0.2, h * 0.55, w * 0.6, h * 0.3);
  g.fillStyle = 'rgba(255,255,255,.18)';
  g.fillRect(w * 0.12, h * 0.06, w * 0.25, h * 0.9);
  g.fillStyle = '#2a2a2c';
  g.fillRect(w * 0.48, h * 0.06, w * 0.04, h * 0.9);
  g.fillStyle = '#c8c8c4';
  g.fillRect(w * 0.4, h * 0.5, w * 0.06, h * 0.02);
}

/** el cartel enmarcado de al lado de la entrada: naranja y oscuro, sin marca */
function cartel(g, w, h) {
  g.fillStyle = '#2a2420';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8822a';
  g.fillRect(w * 0.06, h * 0.08, w * 0.4, h * 0.84);
  g.fillRect(w * 0.54, h * 0.08, w * 0.4, h * 0.84);
  // dos botellas oscuras con su etiqueta clara
  for (const x of [0.26, 0.74]) {
    g.fillStyle = '#3a2a1a';
    g.fillRect(w * (x - 0.07), h * 0.38, w * 0.14, h * 0.48);
    g.fillRect(w * (x - 0.025), h * 0.18, w * 0.05, h * 0.22);
    g.fillStyle = '#f2e8c8';
    g.fillRect(w * (x - 0.06), h * 0.52, w * 0.12, h * 0.16);
  }
}

/** una ventana de arriba de la nave: el marco gris, el cristal y la persiana a medio bajar */
function ventana(g, w, h) {
  g.fillStyle = '#8a8e90';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#3a4048';
  g.fillRect(w * 0.06, h * 0.08, w * 0.88, h * 0.84);
  g.fillStyle = '#d8d8d4';
  for (let y = 0.08; y < 0.5; y += 0.06) g.fillRect(w * 0.06, h * y, w * 0.88, h * 0.04);
  g.fillStyle = '#8a8e90';
  g.fillRect(w * 0.48, 0, w * 0.04, h);
}

/** la persiana gris de la puerta grande */
function persiana(g, w, h) {
  g.fillStyle = '#5a5c5e';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(30,30,32,.5)';
  for (let y = 0; y < h; y += h / 30) g.fillRect(0, y, w, 1.5);
}

/** la rejilla blanca de ventilación */
function rejilla(g, w, h) {
  g.fillStyle = '#e8e8e4';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#9a9a96';
  for (let y = h * 0.1; y < h * 0.9; y += h / 8) g.fillRect(w * 0.05, y, w * 0.9, h * 0.04);
}

/** la chapa verde ondulada de la valla */
function chapaVerde(g, w, h) {
  g.fillStyle = '#5a6a3a';
  g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 8) {
    g.fillStyle = 'rgba(255,255,255,.08)';
    g.fillRect(x, 0, 3, h);
    g.fillStyle = 'rgba(0,0,0,.18)';
    g.fillRect(x + 5, 0, 2, h);
  }
  g.fillStyle = 'rgba(60,40,20,.25)';
  g.fillRect(0, h * 0.85, w, h * 0.15);
}

// ——— las piezas ———

/** la parte de la nave del bar */
function fachada(k) {
  const sm = (S0 + S1) / 2;
  // la pared blanca de la nave y el remate rojo y azul de arriba
  k.box(sm, 0, Z - 0.05, S1 - S0, ALTO - 0.6, 0.1, BLANCO);
  k.box(sm, ALTO - 0.6, Z, S1 - S0, 0.45, 0.14, 0xc8362e);
  k.box(sm, ALTO - 0.15, Z, S1 - S0, 0.15, 0.16, 0x2a4a9a);
  // las ventanas de arriba
  for (const [s, w, y0, y1] of [[37.5, 1.1, 3.4, 4.1], [41.0, 1.1, 3.4, 4.1], [45.0, 1.3, 3.5, 4.2], [50.3, 1.8, 4.3, 5.1]]) {
    k.pic(s, (y0 + y1) / 2, Z + 0.01, w, y1 - y0, 0, 1, canvasTex(96, 60, ventana));
    k.box(s, y0 - 0.06, Z + 0.05, w + 0.1, 0.05, 0.1, 0xe0e0dc);
  }
  // la puerta de persiana gris y su marco
  k.pic(38.0, 1.6, Z + 0.01, 3.0, 3.2, 0, 1, canvasTex(150, 160, persiana));
  for (const s of [36.45, 39.55]) k.box(s, 0, Z + 0.03, 0.1, 3.3, 0.08, 0xd8d8d4);
  // la rejilla blanca y el marco rojo de la puerta de emergencia
  k.pic(41.2, 1.9, Z + 0.01, 0.8, 0.55, 0, 1, canvasTex(64, 44, rejilla));
  k.box(43.45, 0, Z + 0.02, 0.9, 2.2, 0.04, 0xe8e6e0);
  for (const s of [43.0, 43.9]) k.box(s, 0, Z + 0.04, 0.08, 2.25, 0.06, 0xc82a2a);
  k.box(43.45, 2.18, Z + 0.04, 0.98, 0.07, 0.06, 0xc82a2a);
  // el zócalo gris oscuro de la parte del bar
  k.box(50.0, 0, Z + 0.01, 8.4, 0.5, 0.08, GRIS);
  // el cartel enmarcado de al lado de la entrada
  k.pic(47.25, 1.45, Z + 0.06, 1.3, 0.75, 0, 1, canvasTex(120, 70, cartel));
  k.box(47.25, 1.04, Z + 0.03, 1.4, 0.82, 0.04, 0x1a1a1a);
  // la entrada del bar: el marco gris oscuro, la puerta de cristal y el letrero de encima
  const a = 49.0, b = 51.0, hp = 2.5;
  k.box((a + b) / 2, 0, Z + 0.04, b - a + 0.4, hp + 0.25, 0.1, 0x3a3a3c);
  k.pic((a + b) / 2, (hp - 0.05) / 2, Z + 0.095, b - a - 0.2, hp - 0.05, 0, 1, canvasTex(120, 150, puerta), { glow: 0.04 });
  k.box(49.8, 3.05, Z + 0.03, 1.0, 1.05, 0.05, 0xefe6cc);
  k.pic(49.8, 3.575, Z + 0.06, 0.96, 1.01, 0, 1, canvasTex(120, 126, letrero));
  // las cajas de los contadores y la del timbre
  k.box(52.2, 0.6, Z + 0.06, 0.6, 0.5, 0.14, 0xe8e8e4);
  k.box(51.5, 1.5, Z + 0.03, 0.18, 0.22, 0.05, 0xd8d8d4);
  // la valla verde de chapa de después de la esquina de la nave
  k.box(59.0, 0, Z + 0.1, 9.0, 3.2, 0.12, 0x5a6a3a);
  k.pic(59.0, 1.6, Z + 0.165, 8.96, 3.16, 0, 1, canvasTex(360, 128, chapaVerde));
}

/** se monta con lo demás de Valterra, en su primera fase */
export function buildLaEstacion(scene, colliders, map) {
  if (!map?.laEstacion) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, E, 'laEstacion', colliders);
  scene.add(group);
  return { group };
}
