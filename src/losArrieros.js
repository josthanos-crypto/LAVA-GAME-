import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alturaBloque, cristales } from './edificioReal.js';

/**
 * El Bar Picoteros Los Arrieros, en la calle León y Castillo 170 (Altavista, frente a la gasolinera), con la vista de la
 * calle de Google de julio de 2025 (solo se mira, no va dentro del juego; la gente no se pone). El nombre es el del
 * rótulo de la fachada. El mapa tenía la manzana como un bloque gris oscuro de 5 m y liso. De verdad es una fila de
 * casas terreras blancas de unos 6 m, con el zócalo gris, las puertas y las ventanas verdes (algunas con reja), la
 * línea oscura del alero y el pretil de arriba; en medio, el bar, pintado de color crema, con su puerta verde, la
 * ventana del marco rojo con reja, el toldo verde y el rótulo blanco con las letras rojas; y en la punta del norte, la
 * casa más alta con su puerta verde, sus ventanas y la barandilla verde de la rampa.
 */

// la cara de la calle León y Castillo, de la esquina del norte (s 0) a la del sur, N hacia la calle (al este)
const M = marco([297.5, -853.3], [312.9, -921.4]);
const Z = 0.12, ZF = Z + 0.3, H = 6, BLANCO = 0xf0f0ec, VERDE = 0x2f7a3e, GRIS = 0x8c8e8e;

/** antes de levantar la ciudad: la manzana blanca y a su altura */
export function tuneLosArrieros(map) {
  if (!alturaBloque(map, 280, -880, H, [240, 240, 236])) return;
  map.losArrieros = true;
}

/** el rótulo blanco del bar, con las letras rojas y su marco */
function rotulo(g, w, h) {
  g.fillStyle = '#f4f2ec';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#b8b2a8';
  g.lineWidth = 3;
  g.strokeRect(2, 2, w - 4, h - 4);
  g.fillStyle = '#b8202a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.34)}px Georgia, serif`;
  g.fillText('BAR PICOTEROS', w / 2, h * 0.3, w * 0.9);
  g.fillText('LOS ARRIEROS', w / 2, h * 0.72, w * 0.9);
}

const ventanaVerde = cristales('#2f7a3e', 4, 'rgba(60,70,70,.55)');
const ventanaRoja = cristales('#a02a24', 4, 'rgba(60,60,60,.6)');

/** una puerta verde de dos hojas */
function puerta(k, s, ancho = 1.5, alto = 2.3) {
  k.box(s, 0, ZF + 0.03, ancho, alto, 0.06, VERDE);
  k.box(s, 0, ZF + 0.07, 0.04, alto, 0.02, 0x245e30);
  for (const y of [0.6, 1.5]) k.box(s, y, ZF + 0.07, ancho - 0.2, 0.03, 0.02, 0x245e30);
}

/** una ventana verde, con reja si se pide */
function ventana(k, s, y, ancho, alto, conReja, tex = ventanaVerde) {
  k.pic(s, y, ZF + 0.012, ancho, alto, 0, 1, canvasTex(Math.round(ancho * 40), Math.round(alto * 40), tex));
  if (!conReja) return;
  for (let x = -ancho / 2 + 0.1; x < ancho / 2; x += 0.14) k.box(s + x, y - alto / 2, ZF + 0.08, 0.025, alto, 0.025, 0x2a2a2a);
}

/** la fachada de León y Castillo */
function fachada(k) {
  const L = M.len;
  // el muro blanco de toda la fila, el zócalo gris, la línea oscura del alero y el pretil
  k.box(L / 2, 0, Z + 0.15, L, H, 0.3, BLANCO);
  k.block(L / 2, Z + 0.15, L, 0.3);
  k.box(L / 2, 0, ZF + 0.02, L, 0.95, 0.06, GRIS);
  k.box(23, 3.45, ZF + 0.12, 38, 0.12, 0.3, 0x4a3e34);
  k.box(L / 2, H - 0.2, ZF + 0.06, L, 0.2, 0.15, 0xe2e2de);
  // en la punta del norte, la casa más alta, con su puerta, sus ventanas y la barandilla verde de la rampa
  k.box(6, 0, Z + 0.15, 12, H + 1.2, 0.3, BLANCO);
  puerta(k, 4.5, 1.3, 2.4);
  ventana(k, 9.5, 1.8, 1.4, 1.1, false);
  ventana(k, 6, 4.6, 1.2, 0.9, false);
  for (let s = 6; s <= 13; s += 1) k.box(s, 0, ZF + 1.2, 0.05, 1.0, 0.05, VERDE);
  k.box(9.5, 1.0, ZF + 1.2, 7, 0.05, 0.05, VERDE);
  // el bar: el paño color crema, la puerta verde, la ventana del marco rojo con reja, el toldo verde y el rótulo
  k.box(19, 0.95, ZF + 0.03, 9, 2.5, 0.05, 0xe6d29a);
  puerta(k, 16.5, 1.6, 2.4);
  ventana(k, 21, 1.8, 1.6, 1.3, true, ventanaRoja);
  k.box(19, 3.0, ZF + 0.55, 8, 0.08, 1.1, VERDE);
  k.box(19, 2.92, ZF + 1.08, 8, 0.25, 0.04, 0x245e30);
  k.pic(19, 4.6, ZF + 0.04, 3.4, 1.0, 0, 1, canvasTex(340, 100, rotulo));
  for (const s of [14.3, 23.7]) k.box(s, 0.35, ZF + 0.05, 0.4, 0.5, 0.12, VERDE);
  // hacia el sur: las puertas y las ventanas verdes de las casas terreras (las de las rejas, más abajo)
  puerta(k, 26.5, 1.5, 2.4);
  ventana(k, 30, 1.8, 1.4, 1.2, true);
  puerta(k, 33.5, 1.4, 2.3);
  ventana(k, 37, 1.8, 1.4, 1.2, true);
  ventana(k, 30, 4.4, 1.5, 0.8, false);
  ventana(k, 37, 4.4, 1.5, 0.8, false);
  puerta(k, 41, 1.3, 2.3);
  // lo demás de la fila hasta la esquina del sur, con sus puertas y ventanas
  for (let s = 45; s < L - 3; s += 6) {
    puerta(k, s, 1.2, 2.2);
    ventana(k, s + 2.6, 1.8, 1.3, 1.1, true);
  }
}

/** se monta con lo demás */
export function buildLosArrieros(scene, colliders, map) {
  if (!map?.losArrieros) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, M, 'losArrieros', colliders);
  scene.add(group);
  return { group };
}
