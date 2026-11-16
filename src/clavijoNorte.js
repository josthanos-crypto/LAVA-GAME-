import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';

/**
 * El resto de la cara de Clavijo y Fajardo de la manzana de la esquina de Cáceres (del edificio blanco de los balcones
 * hacia el norte), con las vistas de la calle de Google de julio de 2025 (solo se miran, no van dentro del juego; la
 * gente no se pone). Es la otra cara del bloque de pisos blanco de Pérez Galdós: bajo y dos plantas, en tramos, cada
 * uno con el portal metido y la puerta blanca de cristal, las ventanas de persiana de lamas blanca abajo, las rejillas,
 * los cuerpos de balcones que salen con la losa y los balaustres blancos y las ventanas grandes de aluminio (en la
 * planta de arriba, algunas cerradas con cristal), y el remate escalonado. Va después de la esquina de Cáceres, que ya
 * pone el bloque a 9,6 m y hace la fachada hasta s 40.
 */

// la cara de Clavijo y Fajardo del bloque, de la esquina de Cáceres (s 0) al norte, N hacia la calle (al este)
const F = marco([544.51, -491.95], [582.38, -558.45]);
const Z = 0.12, ZF = Z + 0.3, H = 9.6, BLANCO = 0xf2f2ee, S0 = 40;
// los tramos (desde, ancho), del blanco de los balcones de la esquina de Cáceres hacia el norte
const TRAMOS = [[S0, 12.4], [S0 + 12.4, 12.4]];

/** antes de levantar la ciudad: solo la marca (la altura del bloque la pone la esquina de Cáceres) */
export function tuneClavijoNorte(map) {
  if (!map?.esquinaCaceres) return;
  map.clavijoNorte = true;
}

// ——— lo que se pinta en lienzo ———

/** la ventana de persiana de lamas blanca de dos o tres hojas */
function persiana(hojas) {
  return (g, w, h) => {
    g.fillStyle = '#f4f4f0';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#a4a4a0';
    for (let y = 5; y < h - 4; y += 5) g.fillRect(4, y, w - 8, 1.5);
    g.fillStyle = '#d4d4d0';
    for (let i = 1; i < hojas; i++) g.fillRect((w * i) / hojas - 1.5, 0, 3, h);
    g.strokeStyle = '#dcdcd8';
    g.lineWidth = 3;
    g.strokeRect(1.5, 1.5, w - 3, h - 3);
  };
}

const ventanal = cristales('#e8e8e4', 3, 'rgba(230,226,215,.45)');
const puerta = cristales('#f2f2ee', 1, 'rgba(210,214,216,.3)');

// ——— las piezas ———

/** un cuerpo de balcones de dos plantas que sale de la fachada, entre s0 y s1 */
function balcones(k, s0, s1, cerrado) {
  const c = (s0 + s1) / 2, W = s1 - s0;
  for (const [y, top] of [[3.4, false], [6.4, true]]) {
    k.box(c, y, ZF + 0.5, W, 0.2, 1.0, BLANCO);
    k.pic(c, y + 1.35, ZF + 0.012, W - 0.6, 1.5, 0, 1, canvasTex(Math.round(W * 30), 60, ventanal));
    for (let x = s0 + 0.2; x <= s1 - 0.19; x += 0.25) k.cyl(x, y + 0.2, ZF + 0.92, 0.06, 0.08, 0.75, 0xf6f6f2, { seg: 6 });
    k.box(c, y + 0.97, ZF + 0.92, W, 0.1, 0.18, BLANCO);
    for (const x of [s0 + 0.1, s1 - 0.1]) k.box(x, y + 0.2, ZF + 0.5, 0.2, 2.8, 1.0, BLANCO);
    if (top && cerrado) k.box(c, y + 1.1, ZF + 0.95, W - 0.2, 1.7, 0.05, 0xe8ecee, { list: k.glass });
  }
  k.box(c, H - 0.25, ZF + 0.5, W, 0.25, 1.0, BLANCO);
}

/** un tramo: el portal, las persianas, las rejillas, dos cuerpos de balcones y el remate */
function tramo(k, a, L, i) {
  const b = a + L;
  k.box(a + 6.2, 0, ZF + 0.01, 1.6, 2.7, 0.03, 0xd8d8d4);
  k.pic(a + 6.2, 1.25, ZF + 0.03, 1.0, 2.4, 0, 1, canvasTex(40, 96, puerta));
  for (const x of [a + 5.32, a + 7.08]) k.box(x, 0, ZF + 0.25, 0.16, 2.9, 0.5, BLANCO);
  k.box(a + 6.2, 2.75, ZF + 0.25, 1.92, 0.18, 0.5, BLANCO);
  for (const [s, w, h] of [[a + 1.2, 1.3, 3], [a + 3.6, 1.8, 3], [a + 8.6, 1.4, 2], [b - 1.8, 1.8, 3]]) {
    k.pic(s, 1.75, ZF + 0.012, w, 1.1, 0, 1, canvasTex(Math.round(w * 40), 44, persiana(h)));
  }
  for (const s of [a + 2.6, b - 2.6]) k.pic(s, 0.45, ZF + 0.012, 1.6, 0.35, 0, 1, canvasTex(64, 14, persiana(1)));
  balcones(k, a + 0.8, a + 5.0, i % 2 === 0);
  balcones(k, a + 7.6, b - 0.6, i % 2 === 1);
  for (const y of [4.4, 7.4]) k.pic(a + 6.2, y + 0.7, ZF + 0.012, 0.9, 1.1, 0, 1, canvasTex(36, 44, persiana(2)));
  k.box(a + 6.2, H, ZF, 2.4, 0.4, 0.3, BLANCO);
}

/** la cara entera de s 40 al final, con la esquina del norte lisa con dos ventanas */
function fachada(k) {
  const L = F.len, c = (S0 + L) / 2;
  k.box(c, 0, Z + 0.15, L - S0, H, 0.3, BLANCO);
  k.block(c, Z + 0.15, L - S0, 0.3);
  TRAMOS.forEach(([a, w], i) => tramo(k, a, w, i));
  const e = TRAMOS[1][0] + TRAMOS[1][1];
  for (const [s, y] of [[e + 2.2, 1.8], [e + 2.2, 5.6], [L - 2.0, 8.0]]) k.pic(s, y, ZF + 0.012, 1.0, 1.0, 0, 1, canvasTex(40, 40, persiana(2)));
}

/** se monta con lo demás de Valterra */
export function buildClavijoNorte(scene, colliders, map) {
  if (!map?.clavijoNorte) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, F, 'clavijoNorte', colliders);
  scene.add(group);
  return { group };
}
