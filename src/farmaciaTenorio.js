import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * La Farmacia Tenorio, en la calle León y Castillo (la calle Real), con las fotos de Google Maps (solo se
 * miran, no van dentro del juego): la casa antigua blanca de dos plantas, la esquina de cuadros grises y
 * blancos, la puerta abierta de marco verde agua con la farmacia dentro, el letrero blanco de borde verde
 * con «FARMACIA» y la cruz, la ventana baja con su reja, el portón verde agua de dos hojas con la portada
 * de piedra oscura, las ventanas de arriba de guillotina con marco verde agua, el balcón de madera verde
 * y la cruz verde encendida de bandera. El bloque del mapa es más alto: lo de encima se queda como está.
 */

// la cara este del bloque, a la calle León y Castillo (s desde el extremo del norte)
const F = marco([41.0, 101.9], [44.2, 84.1]);
const Z = 0.12, VERDE_AGUA = 0x1e9a8a, BLANCO = 0xf4f2ec, PIEDRA = 0x4a4440, ALTO = 7.6;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneFarmaciaTenorio(map) {
  map.farmaciaTenorioSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Lcdo. Jesús Tenorio Hernandez');
  if (i >= 0) map.farmaciaTenorioSign = map.signs.splice(i, 1)[0];
  map.farmaciaTenorio = true;
}

// ——— lo que se pinta en lienzo ———

/** los cuadros grises y blancos de la esquina */
function cuadros(g, w, h) {
  g.fillStyle = '#f2f0ea';
  g.fillRect(0, 0, w, h);
  const c = w / 2;
  g.fillStyle = '#6a6c70';
  for (let y = 0, f = 0; y < h; y += c, f++) for (let x = (f % 2) * c; x < w; x += c * 2) g.fillRect(x, y, c, c);
}

/** el letrero: la cruz verde y FARMACIA en verde, con su borde */
function letrero(g, w, h) {
  g.fillStyle = '#f4f4f0';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#1e8a4a';
  g.lineWidth = 6;
  g.strokeRect(4, 4, w - 8, h - 8);
  g.fillStyle = '#1e8a4a';
  const x = h * 0.6, y = h / 2, a = h * 0.32, b = h * 0.1;
  g.fillRect(x - b, y - a, b * 2, a * 2);
  g.fillRect(x - a, y - b, a * 2, b * 2);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(h * 0.62)}px "Arial Black", Arial, sans-serif`;
  g.fillText('FARMACIA', w * 0.56, h * 0.54);
}

/** por la puerta abierta: las baldas de la farmacia y el suelo */
function dentro(g, w, h) {
  g.fillStyle = '#e8e6e0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c8c4bc';
  g.fillRect(0, h * 0.8, w, h * 0.2);
  let s = 11;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let y = 0.2; y < 0.75; y += 0.09) for (let x = 0.05; x < 0.95; x += 0.06) { g.fillStyle = ['#f2f2ee', '#3a8a5a', '#e8a0a8', '#5a8ac8', '#e8d070'][Math.floor(r() * 5)]; g.fillRect(w * x, h * y, w * 0.045, h * 0.06); }
}

/** una ventana de guillotina de seis cuarterones, con el marco verde agua */
function guillotina(g, w, h) {
  g.fillStyle = '#1e9a8a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f2f2ee';
  g.fillRect(w * 0.1, h * 0.06, w * 0.8, h * 0.88);
  g.fillStyle = '#3a4a52';
  for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) g.fillRect(w * (0.16 + i * 0.36), h * (0.1 + j * 0.28), w * 0.3, h * 0.24);
}

/** la ventana baja: el cristal con la reja de barrotes y el marco verde agua */
function ventanaReja(g, w, h) {
  g.fillStyle = '#1e9a8a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#4a5a62';
  g.fillRect(w * 0.1, h * 0.05, w * 0.8, h * 0.9);
  g.fillStyle = '#1e9a8a';
  for (let x = 0.2; x < 0.9; x += 0.14) g.fillRect(w * x, h * 0.05, w * 0.04, h * 0.9);
  for (const y of [0.35, 0.7]) g.fillRect(w * 0.1, h * y, w * 0.8, h * 0.03);
}

/** el portón verde agua de dos hojas con sus cuarterones */
function porton(g, w, h) {
  g.fillStyle = '#1e9a8a';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#167a6c';
  g.lineWidth = 5;
  for (const x of [0.06, 0.53]) for (const [y, b] of [[0.05, 0.42], [0.52, 0.43]]) g.strokeRect(w * x, h * y, w * 0.41, h * b);
  g.fillStyle = '#167a6c';
  g.fillRect(w * 0.495, 0, w * 0.01, h);
}

// ——— las piezas ———

/** la casa de la farmacia, de s 3,6 a 14 */
function casa(k) {
  const s0 = 3.6, s1 = 14.0, sm = (s0 + s1) / 2;
  // la pared blanca de las dos plantas, la cornisa de arriba y la esquina de cuadros
  k.box(sm, 0, Z - 0.05, s1 - s0, ALTO, 0.1, BLANCO);
  k.box(sm, ALTO - 0.25, Z + 0.06, s1 - s0, 0.25, 0.14, 0xe2dfd6);
  k.pic(s0 + 0.4, ALTO / 2, Z + 0.01, 0.8, ALTO, 0, 1, canvasTex(32, 304, cuadros));
  // la puerta abierta de la farmacia y el letrero de encima
  k.box(5.4, 0, Z + 0.02, 1.4, 2.7, 0.04, VERDE_AGUA);
  k.pic(5.4, 1.27, Z + 0.045, 1.15, 2.54, 0, 1, canvasTex(96, 212, dentro), { glow: 0.15 });
  k.box(6.3, 2.78, Z + 0.03, 3.5, 0.56, 0.05, 0x1e8a4a);
  k.pic(6.3, 3.06, Z + 0.06, 3.42, 0.5, 0, 1, canvasTex(480, 70, letrero));
  // la ventana baja con su reja
  k.pic(7.3, 1.45, Z + 0.02, 1.2, 1.9, 0, 1, canvasTex(96, 152, ventanaReja));
  // el portón verde agua con la portada de piedra oscura
  k.box(9.8, 0, Z + 0.04, 2.8, 3.4, 0.08, PIEDRA);
  k.pic(9.8, 1.5, Z + 0.085, 2.1, 3.0, 0, 1, canvasTex(160, 228, porton));
  // las ventanas de arriba, de guillotina
  for (const s of [5.2, 7.4, 12.4]) k.pic(s, 5.2, Z + 0.02, 1.0, 1.7, 0, 1, canvasTex(64, 108, guillotina));
  // el balcón de madera verde encima del portón, con la puerta de detrás
  k.pic(9.8, 5.25, Z + 0.02, 1.4, 2.3, 0, 1, canvasTex(64, 108, guillotina));
  k.box(9.8, 4.0, Z + 0.4, 2.6, 0.12, 0.8, 0x1e7a6a);
  k.box(9.8, 4.12, Z + 0.78, 2.6, 0.12, 0.06, 0x1e7a6a);
  k.box(9.8, 5.02, Z + 0.78, 2.7, 0.1, 0.1, 0x1e7a6a);
  for (const s of [8.55, 11.05]) k.box(s, 4.12, Z + 0.4, 0.08, 0.9, 0.8, 0x1e7a6a);
  for (let s = 8.7; s < 11.0; s += 0.16) k.box(s, 4.24, Z + 0.78, 0.04, 0.78, 0.04, 0x2a9a8a);
  // la cruz verde encendida, de bandera, en la primera planta
  k.box(4.6, 4.4, Z + 0.3, 0.05, 0.05, 0.4, 0x2a2a2a);
  const cruz = [[0, 0, 0.18, 0.54], [0, 0, 0.54, 0.18]];
  for (const [, , a, b] of cruz) k.box(4.6, 3.95 + (0.54 - b) / 2, Z + 0.6, 0.08, b, a, 0x1eaa4a);
}

/** segunda fase, como los demás de este barrio */
export function buildFarmaciaTenorio(scene, colliders, map) {
  if (!map?.farmaciaTenorio) return null;
  const k = new Kit();
  casa(k);
  const group = enMarco(k, F, 'farmaciaTenorio', colliders);
  scene.add(group);
  return { group };
}
