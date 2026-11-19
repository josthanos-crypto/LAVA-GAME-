import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alturaBloque, cristales } from './edificioReal.js';

/**
 * El Centro Comercial Arrecife, en la Rambla Medular 61-63, con el gimnasio Aerofit en su punta del este, con las vistas
 * de la calle de Google de julio de 2025 y la foto aérea (solo se miran, no van dentro del juego; la gente no se pone).
 * El mapa lo tenía como un bloque gris oscuro de 8 m y liso. Por la Rambla: el muro color crema sobre el zócalo de piedra
 * volcánica, con la franja de cristal verdoso arriba; en la punta del oeste, la gran marquesina morada en alto sobre sus
 * columnas moradas, el ascensor de cristal, la escalinata ancha con la barandilla de cristal, la marquesina verde de la
 * parada de guaguas y el buzón amarillo de Correos; en medio, la escalera doble de subida con el cuerpo de cristal verde
 * arriba y la puerta de chapa del cuarto; y en la punta del este, el Aerofit con la ventana corrida oscura, las rejillas
 * y los tres mástiles blancos con su banderola (sin el logotipo), delante del parterre de picón rojo con las palmeras.
 */

// la cara de la Rambla, de la punta del este (s 0, el Aerofit) a la del oeste (la marquesina), N hacia la calle
const M = marco([-286.17, -398.13], [-346.75, -357.5]);
const Z = 0.12, ZF = Z + 0.3, H = 8, CREMA = 0xece4d4, MORADO = 0x8a72d8;

/** antes de levantar la ciudad: el bloque a su altura y color crema */
export function tuneCcArrecife(map) {
  if (!alturaBloque(map, -300, -370, H, [236, 228, 212])) return;
  map.ccArrecife = true;
}

// ——— lo que se pinta en lienzo ———

/** el zócalo de piedra volcánica de colores */
function piedra(g, w, h) {
  g.fillStyle = '#8a7a66';
  g.fillRect(0, 0, w, h);
  let s = 23;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < w * 2; i++) {
    const v = 90 + r() * 60;
    g.fillStyle = `rgb(${v + 10},${v - 5},${v - 25})`;
    g.fillRect(r() * w, r() * h, 4 + r() * 8, 3 + r() * 5);
  }
}

/** la franja de cristal verdoso */
function verdoso(g, w, h) {
  g.fillStyle = '#9ac4b8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.25)';
  g.fillRect(0, 0, w, h * 0.3);
  g.fillStyle = '#c8d8d0';
  for (let x = 0; x < w; x += w / 6) g.fillRect(x, 0, 3, h);
}

/** la banderola blanca del gimnasio, solo con el nombre */
function banderola(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#5a5a7a';
  g.save();
  g.translate(w / 2, h / 2);
  g.rotate(Math.PI / 2);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(w * 0.5)}px Arial, sans-serif`;
  g.fillText('aerofit', 0, 0, h * 0.9);
  g.restore();
}

const ventanaOscura = cristales('#2a2a2a', 6, 'rgba(160,175,185,.2)');

// ——— las piezas ———

/** una palmera del parterre */
function palmera(k, s, z, h) {
  k.cyl(s, 0, z, 0.22, 0.3, h, 0x7a6248, { seg: 8 });
  for (let i = 0; i < 8; i++) k.box(s, h - 0.1, z, 3.4, 0.05, 0.45, 0x4a7a32, { ry: (i * Math.PI) / 8 });
}

/** la cara de la Rambla */
function fachada(k) {
  const L = M.len;
  k.box(L / 2, 0, Z + 0.15, L, H, 0.3, CREMA);
  k.block(L / 2, Z + 0.15, L, 0.3);
  k.pic(L / 2, 0.6, ZF + 0.006, L, 1.2, 0, 1, canvasTex(Math.round(L * 12), 18, piedra));
  k.box(L / 2, H - 0.15, ZF + 0.05, L, 0.15, 0.12, 0xdcd4c4);
  // el Aerofit (punta del este): la ventana corrida oscura, las rejillas y los mástiles con la banderola
  k.pic(7, 3.4, ZF + 0.012, 9, 1.6, 0, 1, canvasTex(270, 48, ventanaOscura), { glow: 0.1 });
  k.box(7, 2.5, ZF + 0.06, 9.4, 0.12, 0.2, 0xdcd4c4);
  for (const s of [14, 20.5]) k.box(s, 5.2, ZF + 0.03, 1.0, 0.4, 0.04, 0x5a4030);
  for (const [s, z] of [[2.5, 3.2], [5.5, 3.8], [8.5, 4.4]]) {
    k.cyl(s, 0, ZF + z, 0.07, 0.09, 9.5, 0xf2f2ee, { seg: 8 });
    if (s === 2.5) k.pic(s + 0.35, 7.6, ZF + z + 0.02, 0.6, 2.6, 0, 1, canvasTex(40, 170, banderola));
  }
  // el parterre de picón rojo con las palmeras y los arbustos, de la punta del este a la escalera
  k.box(16, 0, ZF + 2.6, 30, 0.25, 5, 0x9a4a32);
  for (const [s, h] of [[13, 6], [22, 7.5], [29, 5]]) palmera(k, s, ZF + 3.2, h);
  for (const s of [10, 17, 25]) k.ball(s, 1.2, ZF + 2.2, 1.3, 0x4a7a3a);
  // en medio: la escalera doble de subida con el cuerpo de cristal verde arriba y la puerta de chapa
  const e = 37;
  for (let i = 0; i < 10; i++) {
    k.box(e - 2.2 - i * 0.3, i * 0.32, ZF + 1.2, 0.35, 0.32, 2.2, 0xd8d0c4);
    k.box(e + 2.2 + i * 0.3, i * 0.32, ZF + 1.2, 0.35, 0.32, 2.2, 0xd8d0c4);
  }
  k.box(e, 3.2, ZF + 0.8, 5, 4.8, 1.4, 0xa4ccc0, { list: k.glass });
  for (const s of [e - 5.5, e + 5.5]) k.box(s, 0.9, ZF + 1.2, 6, 0.05, 0.05, 0xb8b8b4);
  k.box(e + 9, 0, ZF + 0.03, 2.4, 2.4, 0.06, 0xc8ccc8);
  for (const s of [e - 9, e - 7.6, e - 6.2]) k.box(s, 4.6, ZF + 0.03, 0.8, 0.6, 0.04, 0xd8d0c0);
  // en la punta del oeste: la franja verdosa, la marquesina morada en alto, el ascensor y la escalinata
  k.pic(L - 12, H - 2.4, ZF + 0.012, 16, 2.6, 0, 1, canvasTex(480, 78, verdoso));
  const mc = L - 8, MW = 12;
  for (const [s, z] of [[mc - 3, 3], [mc + 3, 3], [mc - 3, 7.5], [mc + 3, 7.5]]) k.cyl(s, 0, ZF + z, 0.3, 0.3, 13, MORADO, { seg: 12 });
  k.box(mc, 13, ZF + 5, MW + 4, 0.6, 11, MORADO);
  k.box(mc, 12.6, ZF + 5, MW, 0.4, 7, 0x7a62c4);
  k.box(mc - 4.5, H, ZF + 1.6, 2.6, 4.6, 2.6, 0xc8e0dc, { list: k.glass });
  for (let i = 0; i < 6; i++) k.box(mc + 1, i * 0.22, ZF + 6.2 - i * 0.5, 9, 0.22, 0.5, 0xd8d0c4);
  for (const s of [mc - 3.6, mc + 5.6]) k.box(s, 0.3, ZF + 4.6, 0.04, 1.0, 4.4, 0xc8e0dc, { list: k.glass });
  // la marquesina verde de la parada de guaguas y el buzón amarillo de Correos
  const p = L - 20;
  for (const s of [p - 1.8, p + 1.8]) k.box(s, 0, ZF + 6.2, 0.1, 2.6, 0.1, 0x3a7a5a);
  k.box(p, 2.6, ZF + 6.0, 4.6, 0.12, 1.8, 0x7ab88a);
  k.box(p, 0.45, ZF + 5.6, 4.0, 0.08, 0.5, 0xe8e8e4);
  k.box(p, 0, ZF + 5.2, 4.0, 2.4, 0.06, 0xc8d8d4, { list: k.glass });
  k.cyl(L - 3, 0, ZF + 8.6, 0.32, 0.3, 1.1, 0xf0c428, { seg: 12 });
}

/** se monta con lo de la Rambla Medular */
export function buildCcArrecife(scene, colliders, map) {
  if (!map?.ccArrecife) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, M, 'ccArrecife', colliders);
  scene.add(group);
  return { group };
}
