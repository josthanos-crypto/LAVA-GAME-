import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alturaBloque } from './edificioReal.js';
import { tira, lienzoCorrido, juntarLienzos } from './kitFachada.js';

/**
 * La parroquia de San Antonio María Claret (Altavista), con la ficha de Google Maps (28.97437, −13.54827) y la vista de
 * la calle de julio de 2025 desde la calle San Juan de la Cruz (solo se mira). La fachada da al este, a la explanada de
 * picón: el muro blanco de estilo canario con el pretil de curvas, la puerta de madera marrón de dos hojas con su
 * tejadillo, la placa de al lado, las ventanas de marco marrón y, a la derecha, el cuerpo más alto y la torre blanca.
 * Detrás asoma el edificio alto del mapa. La foto no lleva rótulo, así que no se pone ninguno.
 * s va del sur (0) al norte; z hacia la explanada.
 */

const M = marco([180.3, -1301.7], [185.5, -1333.7]);
const H = 8, MURO = 5.2, Z = 0.25;
const BLANCO = 0xf4f3ee, MARRON = 0x5a3a24;

export function tuneIglesiaAltavista(map) {
  if (!alturaBloque(map, 175, -1320, H, [244, 243, 238])) return;
  map.iglesiaAltavista = true;
}

function encalado(g, w, h) {
  g.fillStyle = '#f4f3ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(150,145,130,.08)';
  for (let i = 0; i < 90; i++) g.fillRect((i * 37) % w, (i * 53) % h, 6, 3);
}

function puerta(g, w, h) {
  g.fillStyle = '#4e321f';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(25,15,8,.6)';
  g.lineWidth = 2;
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
  for (const x0 of [6, w / 2 + 6]) {
    for (let y = 8; y < h - 8; y += (h - 16) / 3) g.strokeRect(x0, y, w / 2 - 12, (h - 16) / 3 - 6);
  }
}

function ventana(g, w, h) {
  g.fillStyle = '#5a3a24';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#3b2a20';
  g.fillRect(4, 4, w - 8, h - 8);
  g.fillStyle = '#5a3a24';
  g.fillRect(w / 2 - 2, 0, 4, h);
}

function placa(g, w, h) {
  g.fillStyle = '#6b5240';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8d2c4';
  g.fillRect(5, 5, w - 10, h - 10);
}

let ENCALADO, PUERTA, VENTANA, PLACA;

/** un pretil de curvas: escalones redondeados con remate */
function pretil(k, s0, s1, y, alto) {
  const c = (s0 + s1) / 2, w = s1 - s0;
  k.box(c, y, Z / 2, w, alto * 0.45, Z, BLANCO);
  k.box(c, y + alto * 0.45, Z / 2, w * 0.7, alto * 0.3, Z, BLANCO);
  k.box(c, y + alto * 0.75, Z / 2, w * 0.4, alto * 0.25, Z, BLANCO);
  k.box(c, y + alto, Z / 2 + 0.03, w * 0.44, 0.12, Z + 0.1, 0xe6e4dc);
}

function fachada(k) {
  const L = M.len, zp = Z + 0.012;
  tira(k, 0, L, 0, Z / 2, MURO, Z, BLANCO);
  k.block(L / 2, Z / 2, L, Z);
  lienzoCorrido(k, 0, L, 0, MURO, zp, ENCALADO);
  tira(k, 0, L, MURO, Z / 2, 0.12, Z + 0.1, 0xe6e4dc, k.solid);
  // el pretil de curvas sobre la puerta y los de los lados
  pretil(k, 8.5, 15.5, MURO, 2.0);
  pretil(k, 2.5, 6.5, MURO, 0.9);
  // la puerta de dos hojas con el marco de piedra y el tejadillo marrón
  k.box(12, 0, zp + 0.05, 2.9, 3.2, 0.1, 0xb9ae9a);
  k.pic(12, 1.4, zp + 0.11, 2.3, 2.8, 0, 1, PUERTA);
  k.box(12, 3.25, zp + 0.45, 3.4, 0.14, 0.95, MARRON);
  k.box(12, 3.39, zp + 0.3, 3.0, 0.12, 0.6, 0x7a4b2e);
  k.pic(9.6, 1.7, zp + 0.01, 0.75, 0.6, 0, 1, PLACA);
  // las ventanas de marco marrón
  for (const s of [4.0, 7.0, 16.5]) k.pic(s, 3.1, zp + 0.005, 1.5, 0.7, 0, 1, VENTANA);
  // el cuerpo de la derecha, más alto, y la torre blanca
  k.box(21.5, 0, Z / 2 + 0.6, 7, 7.2, Z + 1.2, BLANCO);
  k.block(21.5, Z / 2 + 0.6, 7, Z + 1.2);
  k.pic(21.5, 5.4, Z + 1.21, 1.6, 1.0, 0, 1, VENTANA);
  k.pic(19.0, 2.8, Z + 1.21, 1.3, 0.7, 0, 1, VENTANA);
  k.box(27.5, 0, Z / 2 + 1.0, 3.6, 9.6, Z + 2.0, BLANCO);
  k.block(27.5, Z / 2 + 1.0, 3.6, Z + 2.0);
  k.pic(27.5, 7.6, Z + 2.01, 0.6, 0.9, 0, 1, VENTANA);
  k.box(27.5, 9.6, Z / 2 + 1.0, 4.0, 0.15, Z + 2.3, 0xe6e4dc);
  // la cruz de hierro sobre la torre
  k.box(27.5, 9.75, Z / 2 + 1.0, 0.1, 1.3, 0.1, 0x2a2a2a);
  k.box(27.5, 10.55, Z / 2 + 1.0, 0.7, 0.1, 0.1, 0x2a2a2a);
}

/** se monta con lo de la Rambla Medular (allí se enganchan las piezas sueltas de Altavista) */
export function buildIglesiaAltavista(scene, colliders, map) {
  if (!map?.iglesiaAltavista) return null;
  ENCALADO = canvasTex(128, 128, encalado);
  PUERTA = canvasTex(96, 120, puerta);
  VENTANA = canvasTex(64, 32, ventana);
  PLACA = canvasTex(40, 32, placa);
  const k = new Kit();
  fachada(k);
  juntarLienzos(k);
  const g = enMarco(k, M, 'iglesiaAltavista', colliders);
  scene.add(g);
  return g;
}
