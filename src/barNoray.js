import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alzarEdificio, rebajarTramo, cristales, medianera } from './edificioReal.js';

/**
 * El bar del número 83 de la calle Pérez Galdós (Valterra), con la vista de la calle de Google de julio de 2025 y la
 * foto aérea (solo se miran, no van dentro del juego; la gente no se pone). Google lo tiene ahora como «Bar Cafetería
 * Sabor Manabita», pero no hay foto de su letrero: en la vista de la calle aún está el letrero de «NORAY Bar -
 * Cafetería», y es el que se pone. De norte a sur: la casa terrera vieja del 81 con la pared desconchada, la ventana
 * tapiada, la puerta verde y el murete con la cancela y la barandilla verdes; la casa terrera del bar, blanca, con la
 * puerta verde del 83, la persiana blanca bajada, el letrero de «NORAY» con su banda roja y el letrero de bandera
 * apagado; y el edificio blanco de tres plantas de la farmacia, con la puerta de madera del portal, el panel de azulejos
 * de dibujo azul, la banda marrón de «Farmacia», la cruz verde, y arriba los balcones de barandilla de madera oscura.
 */

// la cara de Pérez Galdós del bloque, del norte (s 0) hacia el sur, N hacia la calle (al este)
const M = marco([394.77, -333.86], [437.88, -410.79]);
const Z = 0.12, ZF = Z + 0.3, H = 4.4, FONDO = 9, T0 = 44, T1 = 60.5, F1 = 72, HF = 10.4, BLANCO = 0xf2f2ee;

/** antes de levantar la ciudad: las dos terreras metidas en el bloque y el edificio de la farmacia levantado */
export function tuneBarNoray(map) {
  if (!rebajarTramo(map, M, T0, T1, FONDO, H, undefined, [240, 238, 232])) return;
  map.barNoray = true;
  alzarEdificio(map, M, T1, F1, 12, HF, [242, 242, 238]);
}

// ——— lo que se pinta en lienzo ———

/** el letrero de «NORAY» en rojo con la banda de «BAR - CAFETERÍA» */
function letrero(g, w, h) {
  g.fillStyle = '#efe6d2';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#b8a888';
  g.lineWidth = 3;
  g.strokeRect(2, 2, w - 4, h - 4);
  g.fillStyle = '#c82a2a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 900 ${Math.round(h * 0.55)}px Georgia, serif`;
  g.fillText('NORAY', w * 0.45, h * 0.38, w * 0.7);
  g.fillStyle = '#2a4a9a';
  g.font = `800 ${Math.round(h * 0.22)}px Arial, sans-serif`;
  g.fillText('BAR - CAFETERÍA', w * 0.55, h * 0.8, w * 0.7);
}

/** la pared vieja desconchada de la terrera del 81 */
function desconchada(g, w, h) {
  g.fillStyle = '#ece8de';
  g.fillRect(0, 0, w, h);
  let s = 5;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(150,130,110,${0.2 + r() * 0.25})`; g.fillRect(r() * w, h * (0.4 + r() * 0.5), 10 + r() * 30, 6 + r() * 14); }
}

/** el panel de azulejos de dibujo azul de la farmacia */
function azulejos(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  const t = h / 3;
  for (let y = 0; y < h; y += t) for (let x = 0; x < w; x += t) {
    g.strokeStyle = '#2a3a7a';
    g.lineWidth = 3;
    g.beginPath(); g.arc(x + t / 2, y + t / 2, t * 0.3, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(x, y + t / 2); g.lineTo(x + t, y + t / 2); g.moveTo(x + t / 2, y); g.lineTo(x + t / 2, y + t); g.stroke();
  }
}

/** la banda marrón de «Farmacia» */
function farmacia(g, w, h) {
  g.fillStyle = '#4a2e20';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4f2ee';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.font = `600 ${Math.round(h * 0.7)}px Georgia, serif`;
  g.fillText('Farmacia', w * 0.05, h * 0.55, w * 0.9);
}

// ——— las piezas ———

/** la terrera vieja del 81 */
function terrera81(k) {
  const a = T0, b = 53, c = (a + b) / 2, L = b - a;
  k.box(c, 0, Z + 0.15, L, H, 0.3, 0xece8de);
  k.block(c, Z + 0.15, L, 0.3);
  k.pic(c, H / 2, ZF + 0.004, L, H, 0, 1, canvasTex(Math.round(L * 20), 88, desconchada));
  k.box(a + 2.5, 0, ZF + 0.01, 1.1, 2.3, 0.03, 0x2a7a5a);
  k.box(a + 5.6, 1.0, ZF + 0.01, 1.6, 1.3, 0.03, 0xd8ccb4);
  // el murete con la cancela y la barandilla verdes, delante de la casa
  k.box(c, 0, ZF + 1.0, L, 0.7, 0.2, 0xc8c4bc);
  k.block(c, ZF + 1.0, L, 0.2);
  k.box(a + 0.9, 0, ZF + 1.0, 1.2, 1.1, 0.06, 0x2a7a5a);
  k.box(c + 1.5, 1.05, ZF + 1.0, L - 4, 0.04, 0.04, 0x2a7a5a);
  for (let s = a + 3; s < b - 0.5; s += 1.5) k.box(s, 0.7, ZF + 1.0, 0.04, 0.35, 0.04, 0x2a7a5a);
  k.box(c, H - 0.12, ZF + 0.05, L, 0.12, 0.1, 0xe0dcd2);
  for (const y of [3.3, 3.42]) k.box(c, y, ZF + 0.06, L, 0.04, 0.04, 0x1c1c1e);
}

/** la casa del bar, la del 83 */
function casaBar(k) {
  const a = 53, b = T1, c = (a + b) / 2, L = b - a;
  k.box(c, 0, Z + 0.15, L, H, 0.3, BLANCO);
  k.block(c, Z + 0.15, L, 0.3);
  // la puerta verde del 83 con su ventanita encima
  k.box(54.6, 0, ZF + 0.01, 1.0, 2.3, 0.03, 0x2a6a46);
  k.box(54.6, 2.45, ZF + 0.01, 1.0, 0.3, 0.02, 0x3a4a50);
  // la persiana blanca bajada con su marco y el letrero de NORAY encima
  k.box(57.6, 0.1, ZF + 0.012, 2.8, 2.4, 0.02, 0xe8e8e4);
  for (let y = 0.2; y < 2.5; y += 0.1) k.box(57.6, y, ZF + 0.025, 2.8, 0.012, 0.005, 0xc8c8c4);
  k.box(57.6, 2.6, ZF + 0.02, 2.9, 0.75, 0.04, 0xefe6d2);
  k.pic(57.6, 2.975, ZF + 0.041, 2.9, 0.75, 0, 1, canvasTex(290, 75, letrero));
  // el letrero de bandera apagado, con su brazo
  k.box(55.9, 3.6, ZF + 0.25, 0.04, 0.04, 0.5, 0x8a8a88);
  k.box(55.9, 2.9, ZF + 0.5, 0.06, 1.1, 0.4, 0xeceae2);
  k.box(c, H - 0.12, ZF + 0.05, L, 0.12, 0.1, 0xe0dcd2);
  for (const y of [3.4, 3.52, 3.62]) k.box(c, y, ZF + 0.06, L, 0.04, 0.04, 0x1c1c1e);
}

/** el edificio de la farmacia: el portal, la farmacia y las dos plantas con los balcones de madera */
function edificioFarmacia(k) {
  const a = T1, b = F1, c = (a + b) / 2, L = b - a;
  k.box(c, 0, Z + 0.15, L, HF, 0.3, BLANCO);
  k.block(c, Z + 0.15, L, 0.3);
  // el portal de madera, el panel de azulejos, la banda de la farmacia, la cruz y el escaparate
  k.box(a + 1.0, 0, ZF + 0.01, 1.0, 2.4, 0.03, 0x5a3424);
  k.pic(a + 2.9, 2.85, ZF + 0.02, 1.8, 0.9, 0, 1, canvasTex(120, 60, azulejos));
  k.box(a + 6.6, 2.4, ZF + 0.03, 5.6, 0.9, 0.06, 0x4a2e20);
  k.pic(a + 6.6, 2.85, ZF + 0.061, 5.6, 0.9, 0, 1, canvasTex(400, 64, farmacia));
  k.pic(a + 5.0, 1.15, ZF + 0.012, 2.2, 2.3, 0, 1, canvasTex(110, 115, cristales('#4a2e20', 2, 'rgba(230,236,240,.3)')), { glow: 0.2 });
  k.box(a + 8.2, 0, ZF + 0.01, 2.0, 2.3, 0.03, 0x4a2e20);
  k.box(b - 0.6, 3.0, ZF + 0.35, 0.06, 0.6, 0.6, 0x2ac85a, { list: k.glow });
  // las dos plantas: los balcones de losa blanca con barandilla de madera oscura
  for (const y of [4.0, 7.0]) {
    k.box(c, y - 0.2, ZF + 0.5, L - 0.4, 0.22, 1.0, 0xeceae4);
    k.box(c, y + 0.85, ZF + 0.95, L - 0.4, 0.06, 0.08, 0x3a2418);
    for (let s = a + 0.4; s < b - 0.3; s += 0.16) k.box(s, y + 0.02, ZF + 0.95, 0.05, 0.83, 0.05, 0x3a2418);
    for (const s of [a + 2.5, a + 6.0, a + 9.0]) k.pic(s, y + 1.1, ZF + 0.01, 1.6, 2.1, 0, 1, canvasTex(80, 105, cristales('#3a2418', 2, 'rgba(230,226,215,.5)')));
  }
  k.box(c, HF - 0.15, ZF + 0.04, L, 0.15, 0.08, 0xe4e0d8);
  medianera(k, a - 0.07, H, HF, 12, Z, 0xe8e2d4);
}

/** se monta con lo demás de Valterra */
export function buildBarNoray(scene, colliders, map) {
  if (!map?.barNoray) return null;
  const k = new Kit();
  terrera81(k);
  casaBar(k);
  edificioFarmacia(k);
  const group = enMarco(k, M, 'barNoray', colliders);
  scene.add(group);
  return { group };
}
