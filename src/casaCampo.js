import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { paveMesh, paveMaterial, polyTris, bandTris, tierra, tierraCamino, lightSlabs, picon } from './suelos.js';
import { makeCar } from './carModels.js';
import { recolocarCalles, recolocarCasas, recolocarPunto, mover, casaDeAbajo, escenaReal, choquesReales } from './campoReal.js';
import { CAMPO_CASAS, CAMPO_AUTO, CAMPO_PISCINAS, CAMPO_MUROS, CAMPO_CAMINOS, CAMPO_CALLES, CAMPO_ENARENADOS } from './campoDatos.js';

/**
 * El campo de arriba de Arrecife, al norte de la Calle Campoamor: la casa de las fotos de José Manuel (cuatro
 * fotos desde la azotea), sin nombre ni rótulo (el juego también va en la web), y todo lo de alrededor sacado
 * de sus fotos aéreas (campoDatos.js): la manzana de la casa, las fincas con muro, las casas sueltas, los
 * caminos de tierra hasta el cruce grande, las calles de la ciudad y los enarenados de picón negro.
 * La casa (la del tejado rojo de la fila del medio de la manzana, con el patio de la piscina al oeste): paredes
 * blancas, azotea con tela roja y su chimenea blanca, la terraza con balaustrada blanca, los delfines azules
 * pintados en los muros del patio, la piscina, la pérgola de chapa oxidada, el cuarto con el tejado de losetas
 * rosas y el busto blanco. Sin datos de OpenStreetMap ni del IGN para esta zona: las alturas del terreno son
 * aproximadas; las posiciones, de las fotos aéreas (con la escala de los coches aparcados).
 */

export const CASA = [-2002, -3304];   // la casa (28,992184 N, 13,570553 O)
// la casa en la foto aérea, y su patio: del muro oeste a la casa y del muro norte a la calle
const HX0 = -2009.5, HX1 = -1995.5, HZ0 = -3314.5, HZ1 = -3295.0, HH = 6.3;
const PX0 = -2029, PZ0 = -3316, PZ1 = -3294.6;

const rect = (x0, z0, x1, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1], [x0, z0]];
const rotRect = (x, z, w, d, deg) => {
  const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  const q = [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]].map(([u, v]) => [x + c * u - s * v, z + s * u + c * v]);
  return [...q, q[0]];
};

/** los caminos de tierra (world.js no los asfalta: dirt) y las calles nuevas de la ciudad, para el mapa */
// (Version 145) todo pasa por campoReal.js, que lo pone en su sitio de la foto oficial
export const CAMPO_ROADS = recolocarCalles([
  ...CAMPO_CAMINOS.map(c => ({ name: 'Camino de tierra', w: c.w, major: 0, dirt: 1, p: c.p })),
  ...CAMPO_CALLES.map(c => ({ ...(c.name ? { name: c.name } : {}), w: c.w, major: 0, p: c.p })),
]);

// los edificios: la casa y su cuarto con modelo propio (skip, ownRoof); las demás, como las del resto de Arrecife
const HOUSE = { p: rect(HX0, HZ0, HX1, HZ1), h: HH };
const ANNEX = { p: rect(-2028.5, -3304, -2020, -3295.2), h: 3 };
const WHITE_F = [244, 242, 236];
export const CAMPO_BUILDINGS = recolocarCasas([
  ...[HOUSE, ANNEX].map(b => ({ ...b, k: 'gen', skip: true, ownRoof: true })),
  ...CAMPO_CASAS.map(([x0, z0, x1, z1, h, f]) => ({ p: rect(x0, z0, x1, z1), h, k: 'res', f: f || WHITE_F })),
  // sin las «detectadas» de abajo: ahí están ya las casas reales del norte de Arrecife (campoReal.js)
  ...CAMPO_AUTO.filter(c => !casaDeAbajo(c)).map(([x, z, w, d, a, h]) => ({ p: rotRect(x, z, w, d, a), h, k: 'res' })),
]);

/** el sitio para empezar (y para el mapa grande): en la calle de delante de la casa, junto a la cancela */
export const CAMPO_START = { at: mover(-2016, -3290), look: mover(-2002, -3305) };

/** palmeras junto a las casas blancas del este del camino (foto bajando hacia la ciudad), para map.extraPalms */
export const CAMPO_PALMS = [[-1888, -2925, 8], [-1858, -2922, 7], [-1826, -2924, 9], [-1772, -2928, 7.5],
  [-1810, -2868, 8], [-1745, -2832, 7], [-1716, -2778, 8.5], [-1690, -2735, 7]].map(recolocarPunto);

/** el camino en coche desde el final de la Calle Campoamor hasta la cancela (para las pruebas) */
export const CAMPO_RUTA = [[-2057, -2366], [-2055, -2470], [-2052, -2546], [-2050, -2590], [-1997, -2603], [-1957, -2611],
  [-1922.6, -2645], [-1888, -2672], ...CAMPO_CAMINOS[0].p.slice(1, 20), [-2016, -3290]].map(recolocarPunto);

// la tierra del campo (un rectángulo); el suelo del juego deja ahí un hueco
const CAMPO = { x0: -2700, x1: 0, z0: -3700, z1: -2385 };
export const CAMPO_HOLE = { x0: CAMPO.x0 + 30, x1: CAMPO.x1 - 30, z0: CAMPO.z0 + 30, z1: CAMPO.z1 - 30 };
const WHITE = 0xf2f0ea, CAL = 0xe9e6de, BLOQUE = 0x9a958c;

/** delfín azul pintado en la pared, como los del patio de la casa */
function dolphinTex(flip) {
  return canvasTex(256, 144, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.save();
    if (flip) { g.translate(w, 0); g.scale(-1, 1); }
    g.fillStyle = '#2d6db6';
    g.beginPath();
    g.moveTo(30, 96);
    g.bezierCurveTo(60, 40, 150, 28, 205, 52);   // lomo
    g.lineTo(232, 44);                             // hocico
    g.lineTo(208, 64);
    g.bezierCurveTo(170, 78, 120, 90, 78, 104);   // vientre
    g.lineTo(46, 122); g.lineTo(52, 104); g.lineTo(18, 110);   // cola
    g.closePath();
    g.fill();
    g.beginPath(); g.moveTo(112, 40); g.lineTo(98, 14); g.lineTo(140, 36); g.fill();   // aleta
    g.beginPath(); g.moveTo(140, 80); g.lineTo(128, 104); g.lineTo(158, 78); g.fill();
    g.fillStyle = '#9cc8ee';
    g.beginPath(); g.moveTo(205, 60); g.bezierCurveTo(170, 72, 120, 84, 84, 98); g.lineTo(90, 92); g.bezierCurveTo(130, 78, 170, 66, 200, 56); g.fill();
    g.fillStyle = '#10243e'; g.beginPath(); g.arc(196, 52, 3.5, 0, Math.PI * 2); g.fill();
    g.restore();
  });
}

/** las ventanas oscuras con su marco, en la fachada que mira hacia (nx, nz) */
function windows(k, x0, z0, x1, z1, nx, nz, ys, every = 3.2) {
  const L = Math.hypot(x1 - x0, z1 - z0), ux = (x1 - x0) / L, uz = (z1 - z0) / L, ry = Math.atan2(ux, uz) + Math.PI / 2;
  for (let s = every / 2 + 0.6; s < L - 0.8; s += every) {
    for (const y of ys) {
      const x = x0 + ux * s + nx * 0.04, z = z0 + uz * s + nz * 0.04;
      k.box(x, y, z, 1.15, 1.25, 0.1, 0x2e3a2f, { ry });
      k.box(x + nx * 0.02, y + 0.08, z + nz * 0.02, 0.95, 1.05, 0.1, 0x161a1c, { ry });
    }
  }
}

/** la casa de las fotos, en su sitio de la foto aérea */
function casa(k) {
  const cx = (HX0 + HX1) / 2, cz = (HZ0 + HZ1) / 2, W = HX1 - HX0, D = HZ1 - HZ0;
  k.box(cx, 0, cz, W, HH, D, WHITE, { list: k.shell });
  // azotea: tela impermeable roja con sus arrugas, pretil blanco y la chimenea canaria
  k.box(cx, HH, cz, W - 0.4, 0.05, D - 0.4, 0xb4553f, { list: k.shell });
  for (let i = 1; i < 6; i++) k.box(cx, HH + 0.05, HZ0 + i * D / 6, W - 0.6, 0.02, 0.05, 0xa04a37, { list: k.shell });
  for (const [x, z, w, d] of [[cx, HZ0 + 0.15, W, 0.3], [cx, HZ1 - 0.15, W, 0.3], [HX0 + 0.15, cz, 0.3, D], [HX1 - 0.15, cz, 0.3, D]]) {
    k.box(x, HH, z, w, 0.45, d, WHITE, { list: k.shell });
  }
  const chx = HX1 - 3.1, chz = HZ1 - 3.4;
  k.box(chx, HH, chz, 0.8, 1.35, 0.8, WHITE).box(chx, HH + 1.35, chz, 1.0, 0.12, 1.0, WHITE).box(chx, HH + 1.47, chz, 0.5, 0.35, 0.5, WHITE);
  k.box(chx, HH + 0.7, chz + 0.41, 0.3, 0.45, 0.02, 0x2a2a2a).box(chx + 0.41, HH + 0.7, chz, 0.02, 0.45, 0.3, 0x2a2a2a);
  k.box(chx - 1.4, HH, chz, 1.5, 0.35, 0.9, 0x8a8f94).box(HX0 + 2, HH, HZ0 + 2, 1.2, 0.5, 0.8, 0xd8d8d0);   // aire y depósito
  // ventanas a los cuatro lados; la puerta de la calle y la del patio
  windows(k, HX0, HZ1, HX0, HZ0, -1, 0, [1.0, 4.0]);
  windows(k, HX1, HZ0, HX1, HZ1, 1, 0, [4.0]);
  windows(k, HX0, HZ0, HX1, HZ0, 0, -1, [1.0, 4.0], 3.6);
  windows(k, HX1, HZ1, HX0, HZ1, 0, 1, [4.0], 3.6);
  k.box(cx + 2, 0.06, HZ1 + 0.02, 1.1, 2.2, 0.1, 0x3b4a3a);
  k.box(HX0 - 0.02, 0.06, HZ0 + 4, 0.1, 2.15, 1.0, 0x3b4a3a).box(HX0 - 0.02, 0.06, HZ1 - 2.5, 0.1, 2.15, 1.0, 0x3b4a3a);
  // la terraza del primer piso sobre el patio de la piscina, con la balaustrada blanca
  const tx0 = HX0 - 2.6, tz0 = HZ0 + 7.5, tz1 = HZ1 - 2.6;
  k.box((tx0 + HX0) / 2, 2.9, (tz0 + tz1) / 2, HX0 - tx0, 0.22, tz1 - tz0, WHITE, { list: k.shell });
  for (const z of [tz0 + 0.15, (tz0 + tz1) / 2, tz1 - 0.15]) k.box(tx0 + 0.15, 0, z, 0.3, 2.9, 0.3, WHITE);
  for (let z = tz0 + 0.1; z <= tz1 - 0.1; z += 0.26) k.cyl(tx0 + 0.1, 3.12, z, 0.045, 0.06, 0.62, WHITE, { seg: 6 });
  for (let x = tx0 + 0.36; x <= HX0 - 0.1; x += 0.26) for (const z of [tz0 + 0.1, tz1 - 0.1]) k.cyl(x, 3.12, z, 0.045, 0.06, 0.62, WHITE, { seg: 6 });
  k.box(tx0 + 0.1, 3.72, (tz0 + tz1) / 2, 0.18, 0.1, tz1 - tz0, WHITE).box(tx0 + 0.1, 3.1, (tz0 + tz1) / 2, 0.16, 0.06, tz1 - tz0, WHITE);
  k.box(tx0 + 1.2, 3.12, tz1 - 1.3, 0.6, 0.9, 0.6, 0x5a7ab0, {});   // la silla tapada con la tela azul
  // la ventana redonda de arriba y la pérgola de madera sobre la terraza (fotos del garaje desde el camino)
  k.cyl(HX0 - 0.06, 4.7, HZ0 + 3.2, 0.5, 0.5, 0.08, WHITE, { rx: Math.PI / 2, ry: Math.PI / 2, seg: 20 });
  k.cyl(HX0 - 0.09, 4.7, HZ0 + 3.2, 0.38, 0.38, 0.08, 0x1d2328, { rx: Math.PI / 2, ry: Math.PI / 2, seg: 20 });
  for (const z of [tz0 + 0.15, tz1 - 0.15]) k.box(tx0 + 0.15, 3.12, z, 0.14, 2.3, 0.14, 0x5a3e2a);
  k.box(tx0 + 0.15, 5.42, (tz0 + tz1) / 2, 0.16, 0.16, tz1 - tz0, 0x5a3e2a);
  for (let z = tz0 + 0.3; z < tz1; z += 0.6) k.box((tx0 + HX0) / 2, 5.58, z, HX0 - tx0 + 0.3, 0.1, 0.1, 0x6b4a32);
}

/** las vetas de óxido del muro del garaje (foto): blanco con chorretones naranjas que bajan */
function rustTex() {
  return canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = '#f1efe9';
    g.fillRect(0, 0, w, h);
    let seed = 11;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 46; i++) {
      const x = rnd() * w, len = h * (0.3 + rnd() * 0.7), a = 0.15 + rnd() * 0.35;
      const grad = g.createLinearGradient(0, 0, 0, len);
      grad.addColorStop(0, `rgba(176,104,46,${a})`);
      grad.addColorStop(1, 'rgba(176,104,46,0)');
      g.fillStyle = grad;
      g.fillRect(x, 0, 1 + rnd() * 2.5, len);
    }
  });
}

/**
 * la parte de atrás de la casa (el norte), con cuatro fotos: el garaje en el muro de atrás del patio con el
 * picón negro delante, el muro alto con vetas de óxido y la luz de seguridad, las macetas, las garrafas, la mesa
 * de madera, el casco de barca, los palés, el árbol, la hormigonera y los palés azules y amarillos
 */
function garaje(k, scene) {
  const X0 = -2022.4, X1 = -2016.6, Z = -3316.2, ZB = -3311.2;
  k.box((X0 + X1) / 2, 0, (Z + ZB) / 2, X1 - X0, 3.0, ZB - Z, WHITE, { list: k.shell }).block((X0 + X1) / 2, (Z + ZB) / 2, X1 - X0, ZB - Z);
  k.box((X0 + X1) / 2, 3.0, (Z + ZB) / 2, X1 - X0 + 0.1, 0.08, ZB - Z + 0.1, CAL, { list: k.shell });
  // la puerta seccional color crema que da al picón, con sus juntas
  k.box(-2019.5, 0.02, Z - 0.03, 3.4, 2.45, 0.06, 0xd9d4c6);
  for (let y = 0.5; y < 2.4; y += 0.48) k.box(-2019.5, y, Z - 0.07, 3.4, 0.03, 0.02, 0xb9b3a4);
  k.box(-2018.2, 1.0, Z - 0.08, 0.25, 0.06, 0.03, 0x3a3a3a);
  // el muro alto de atrás con las vetas de óxido y la luz de seguridad, al oeste del garaje
  k.box(-2025.7, 2.3, -3316, 6.6, 0.7, 0.3, WHITE, { list: k.shell });
  k.pic(-2025.7, 1.5, -3316.16, 6.6, 3.0, 0, -1, rustTex());
  k.box(-2023.6, 2.75, -3316.3, 0.3, 0.14, 0.25, 0x2b2b2b).box(-2023.6, 2.68, -3316.42, 0.42, 0.12, 0.06, 0xdedede);
  // las macetas blancas, las garrafas de agua y la mesa de madera, pegadas al muro
  const WOOD = 0x6b5038;
  for (const x of [-2022.8, -2023.25]) k.box(x, 0, -3316.6, 0.4, 0.42, 0.4, 0xf4f4f0).ball(x, 0.6, -3316.6, 0.18, 0x4f7a3a, { sy: 1.4 });
  for (const x of [-2023.65, -2023.95]) k.cyl(x, 0, -3316.7, 0.13, 0.13, 0.42, 0xbfd8a8, { seg: 10 });
  k.box(-2025.3, 0.95, -3316.55, 2.2, 0.06, 0.45, WOOD);
  for (const x of [-2026.2, -2024.4]) k.box(x, 0, -3316.55, 0.1, 0.95, 0.1, WOOD).box(x + 0.3, 0, -3316.75, 0.08, 0.95, 0.08, WOOD);
  // el casco de barca de madera con su franja azul, los palés, la hormigonera y los palés azules y amarillos
  k.box(-2027.6, 0, -3317.0, 2.6, 1.35, 0.22, 0x2c3438, { ry: 0.12 }).box(-2027.6, 1.05, -3317.13, 2.5, 0.12, 0.03, 0x2a5aa6, { ry: 0.12 });
  for (let i = 0; i < 3; i++) k.box(-2028.7 - i * 1.1, 0, -3317.6 - (i % 2) * 0.4, 1.1, 1.05, 0.1, 0x4a3a2c);
  k.cyl(-2030.0, 0.9, -3318.6, 0.42, 0.3, 0.9, 0x6e5a44, { rx: 0.6, seg: 12 }).box(-2030.0, 0, -3318.6, 0.6, 0.5, 0.8, 0x4a3a2c);
  k.box(-2031.6, 0, -3317.9, 1.25, 1.0, 0.12, 0x7aa6cf).box(-2031.6, 1.0, -3317.9, 1.25, 0.1, 0.14, 0xd8c23a);
  k.block(-2027.8, -3317.6, 8.4, 2.6);
  // el árbol, delante del muro entre el casco de barca y los palés
  k.cyl(-2028.4, 0, -3318.4, 0.12, 0.18, 2.0, 0x5a4636, { seg: 7 });
  for (const [dx, dy, dz, r] of [[0, 3.0, 0, 1.6], [-0.9, 2.6, -0.6, 1.2], [1.0, 2.7, 0.3, 1.25], [0.2, 3.7, -0.3, 1.0]]) k.ball(-2028.4 + dx, dy, -3318.4 + dz, r, 0x3f6a34, { seg: 8 });
  // el picón negro detrás de la casa, entre el patio y la casa de al lado, y por el lado del camino del oeste
  const gravel = picon();
  for (const r of [rect(-2034, -3335, -2013.7, -3316.3), rect(-2033.4, -3316.3, -2029.3, -3296)]) {
    const m = paveMesh(polyTris(r.slice(0, 4)), 0.1, gravel, 0xcfcac2);
    if (m) { m.name = 'piconGaraje'; scene.add(m); }
  }
  // la pared de piedra seca y los matojos secos del campo del suroeste (foto de la casa del muro de bloques)
  for (let i = 0; i < 26; i++) {
    const t = i / 25, x = -2052 + t * 19, z = -3239.5 + t * 4.5 + Math.sin(i * 1.7) * 0.25;
    k.ball(x, 0.22 + (i % 2) * 0.26, z, 0.26 + (i % 3) * 0.06, [0x5b4a3e, 0x8a7a66, 0x4a403a][i % 3], { sx: 1.25, sy: 0.75, seg: 5 });
  }
  k.seg(-2052, -3239.5, -2033, -3235);
}

/** el patio: delfines, suelo de baldosa, piscina, pérgola, cuarto de tejado rosa, busto, tumbonas y macetas */
function patio(k, scene) {
  // el cuarto del suroeste con su tejado de losetas rosas y la puerta al patio
  const [[ax, az], , [bx, bz]] = ANNEX.p;
  k.box((ax + bx) / 2, 0, (az + bz) / 2, bx - ax, ANNEX.h, bz - az, WHITE, { list: k.shell });
  k.box((ax + bx) / 2, ANNEX.h, (az + bz) / 2, bx - ax + 0.2, 0.12, bz - az + 0.2, 0xd9907e, { list: k.shell });
  for (let i = 0; i < 9; i++) k.box(ax - 0.1 + i, ANNEX.h + 0.12, (az + bz) / 2, 0.03, 0.02, bz - az + 0.2, 0xb8705f, { list: k.shell });
  k.box(bx + 0.04, 0, az + 3.6, 0.1, 2.1, 0.9, 0xf4f4f0).box(bx + 0.06, 0.05, az + 3.6, 0.1, 1.95, 0.72, 0x1d2328);
  // la pérgola de chapa oxidada del rincón del noroeste, junto al garaje
  const gx0 = -2028, gx1 = -2023.2, gz0 = -3315.6, gz1 = -3309;
  for (const [x, z] of [[gx0, gz1], [gx1, gz1], [gx1, gz0 + 0.3], [(gx0 + gx1) / 2, gz1]]) k.box(x, 0, z, 0.12, 2.5, 0.12, 0x6b4a32);
  k.box((gx0 + gx1) / 2, 2.5, (gz0 + gz1) / 2, gx1 - gx0 + 0.4, 0.06, gz1 - gz0 + 0.3, 0x9a5a32, { list: k.shell });
  for (let x = gx0; x <= gx1; x += 0.5) k.box(x, 2.56, (gz0 + gz1) / 2, 0.04, 0.03, gz1 - gz0 + 0.3, 0x7d4627, { list: k.shell });
  // la cancela de la calle, cerrada pero pasable a pie
  k.box(-2023.5, 0, PZ1, 5, 1.9, 0.08, 0x2e3b33);
  // la piscina de la foto aérea, con su borde blanco
  const [px0, pz0, px1, pz1] = [-2016.7, -3305.8, -2010.3, -3297.8];
  k.box((px0 + px1) / 2, 0.2, (pz0 + pz1) / 2, px1 - px0 + 0.7, 0.06, pz1 - pz0 + 0.7, 0xf4f4f0, { list: k.shell });
  k.box((px0 + px1) / 2, 0.22, (pz0 + pz1) / 2, px1 - px0, 0.05, pz1 - pz0, 0x3d9ad6, { list: k.glow });
  k.block((px0 + px1) / 2, (pz0 + pz1) / 2, px1 - px0 + 0.3, pz1 - pz0 + 0.3);
  // el busto en su peana, las tumbonas junto a la piscina y las macetas
  k.box(px1 + 0.6, 0.2, pz1 + 1.0, 0.42, 0.95, 0.42, 0xf2f2ee).ball(px1 + 0.6, 1.45, pz1 + 1.0, 0.17, 0xf6f6f2, { sy: 1.15 });
  k.box(px1 + 0.6, 1.15, pz1 + 1.0, 0.5, 0.22, 0.26, 0xf6f6f2);
  for (const z of [pz0 + 1.6, pz0 + 4.2]) k.box(px0 - 1.4, 0.2, z, 0.62, 0.32, 1.9, 0x8a6a48);
  for (const [x, z, r] of [[PX0 + 0.8, PZ0 + 9, 0.5], [-2019, -3296, 0.7], [px1 + 1.6, pz0 - 1.0, 0.45], [-2024, -3306, 0.6]]) {
    k.cyl(x, 0.2, z, 0.22, 0.18, 0.45, 0x5a4334).ball(x, 0.75 + r * 0.6, z, r, 0x4c7a3c, { sy: 1.1 });
  }
  // suelo de baldosa en todo el patio
  const floor = paveMesh(polyTris(rect(PX0, PZ0, HX0, PZ1).slice(0, 4)), 0.2, lightSlabs(), 0xd8d2c6);
  if (floor) { floor.name = 'patioCasaCampo'; scene.add(floor); }
  // los delfines, por dentro de los muros del patio y en la pared del cuarto
  const dl = dolphinTex(false), dr = dolphinTex(true);
  for (const z of [-3312.5, -3309.5]) k.pic(PX0 + 0.17, 1.4, z, 1.6, 0.9, 1, 0, dr);
  for (const x of [-2017.5, -2013.5]) k.pic(x, 1.35, PZ0 + 0.17, 1.7, 0.95, 0, 1, x > -2015 ? dr : dl);
  k.pic(bx + 0.05, 1.6, az + 1.6, 1.4, 0.8, 1, 0, dl);
  k.pic(-2015.5, 1.35, PZ1 - 0.17, 1.7, 0.95, 0, -1, dl);
}

/** los muros de las fincas (blancos o de bloque gris) y las piscinas, de la foto aérea */
function muros(k) {
  for (const [pts, h, white] of CAMPO_MUROS) {
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[i + 1], L = Math.hypot(bx - ax, bz - az);
      if (L < 0.2) continue;
      const ry = Math.atan2(bx - ax, bz - az);
      k.box((ax + bx) / 2, 0, (az + bz) / 2, 0.3, h, L, white ? WHITE : BLOQUE, { ry, list: k.shell }).seg(ax, az, bx, bz);
      if (white) k.box((ax + bx) / 2, h, (az + bz) / 2, 0.36, 0.06, L, CAL, { ry });
    }
  }
  for (const [x0, z0, x1, z1] of CAMPO_PISCINAS) {
    k.box((x0 + x1) / 2, 0.2, (z0 + z1) / 2, x1 - x0 + 0.6, 0.06, z1 - z0 + 0.6, 0xf4f4f0, { list: k.shell });
    k.box((x0 + x1) / 2, 0.22, (z0 + z1) / 2, x1 - x0, 0.05, z1 - z0, 0x3d9ad6, { list: k.glow });
  }
  // el muro bajo de piedra de los enarenados (solo se ve: los caminos pasan pegados)
  for (const poly of CAMPO_ENARENADOS) {
    for (let i = 0; i < poly.length; i++) {
      const [ax, az] = poly[i], [bx, bz] = poly[(i + 1) % poly.length], L = Math.hypot(bx - ax, bz - az);
      k.box((ax + bx) / 2, 0, (az + bz) / 2, 0.5, 0.6, L, 0x3b3633, { ry: Math.atan2(bx - ax, bz - az) });
    }
  }
}

/**
 * el cruce del noroeste, detrás de la casa (foto desde el coche): la valla de malla verde del solar de picón
 * donde están las autocaravanas, el pilar blanco de la esquina, la casa blanca con la puerta corredera verde, la
 * maceta con el cactus, el poste de la luz con su montón de piedras, y los árboles detrás del muro de bloques de
 * la casa del sur (foto bajando hacia la ciudad)
 */
function cruce(k) {
  const MESH = 0x5f6f4c, POST = 0x6b6b66;
  const fence = [[-2027, -3366], [-2027, -3345.4], [-2011.6, -3345.4]];
  for (let i = 0; i < fence.length - 1; i++) {
    const [ax, az] = fence[i], [bx, bz] = fence[i + 1], L = Math.hypot(bx - ax, bz - az), n = Math.ceil(L / 3.4);
    for (let j = 0; j < n; j++) {
      const t0 = j / n, t1 = (j + 1) / n;
      const x0 = ax + (bx - ax) * t0, z0 = az + (bz - az) * t0, x1 = ax + (bx - ax) * t1, z1 = az + (bz - az) * t1;
      const ry = Math.atan2(x1 - x0, z1 - z0);
      k.box((x0 + x1) / 2, 0.08, (z0 + z1) / 2, 0.04, 1.75, L / n - 0.08, MESH, { ry, list: k.shell });
      k.box((x0 + x1) / 2, 1.83, (z0 + z1) / 2, 0.05, 0.05, L / n, POST, { ry });
      k.box(x0, 0, z0, 0.3, 0.12, 0.3, 0x9a958c).box(x0, 0, z0, 0.05, 1.9, 0.05, POST);
    }
    k.seg(ax, az, bx, bz);
  }
  // el pilar blanco donde acaba la valla, pegado a la casa
  k.box(-2011.2, 0, -3345.2, 1.0, 2.1, 1.0, WHITE, { list: k.shell }).block(-2011.2, -3345.2, 1.0, 1.0);
  // la puerta corredera verde de la casa blanca, la ventana pequeña, la luz y la maceta con el cactus
  k.box(-2005.5, 0.02, -3343.82, 4.4, 2.7, 0.06, 0x3f8f5a);
  for (let x = -2007.5; x <= -2003.5; x += 0.5) k.box(x, 0.05, -3343.78, 0.03, 2.6, 0.02, 0x2f6e44);
  k.box(-2009.3, 1.5, -3343.82, 0.7, 0.6, 0.06, 0x1d2328).box(-2008.0, 3.0, -3343.8, 0.25, 0.14, 0.2, 0xdedede);
  k.cyl(-2010.3, 0, -3343.2, 0.24, 0.18, 0.42, 0xc8662e, { seg: 10 }).cyl(-2010.3, 0.42, -3343.2, 0.07, 0.09, 0.75, 0x4f7a3a, { seg: 7 });
  // el poste de la luz con su montón de piedras, entre los dos caminos
  k.cyl(-2029.4, 0, -3343.6, 0.1, 0.14, 8, 0x8a7a66, { seg: 7 });
  for (let i = 0; i < 14; i++) k.ball(-2029.4 + Math.cos(i * 2.4) * (0.4 + (i % 4) * 0.3), 0.18, -3343.6 + Math.sin(i * 2.4) * (0.4 + (i % 4) * 0.25), 0.22 + (i % 3) * 0.06, i % 2 ? 0x3d3530 : 0x5b4a3e, { sx: 1.2, sy: 0.8, seg: 5 });
  k.block(-2029.4, -3343.6, 2.2, 2.2);
  // los árboles detrás del muro de bloques de la casa del sur del camino
  for (const [x, z, r] of [[-2027.5, -3262, 1.7], [-2024.5, -3257.5, 1.5], [-2027, -3252.5, 1.4]]) {
    k.cyl(x, 0, z, 0.13, 0.2, 2.2, 0x5a4636, { seg: 7 });
    for (const [dx, dy, dz, rr] of [[0, 3.1, 0, r], [-0.7, 2.7, 0.6, r * 0.75], [0.7, 2.8, -0.5, r * 0.8]]) k.ball(x + dx, dy, z + dz, rr, 0x3f6a34, { seg: 8 });
  }
}

/**
 * las torres de alta tensión que bajan hacia la ciudad por el este del camino (fotos bajando hacia Arrecife):
 * celosía gris de unos 30 m con sus crucetas, y los cables
 */
function torres(k, scene) {
  const GRIS = 0x8f9499, line = [[-1792, -2705], [-1777, -2565], [-1762, -2425], [-1747, -2285]];
  const tops = [];
  for (const [x, z] of line) {
    k.cyl(x, 0, z, 0.5, 2.6, 30, GRIS, { seg: 4 });
    for (const [y, w] of [[21, 9], [25.5, 7], [29.5, 4]]) k.box(x, y, z, w, 0.5, 0.6, GRIS);
    for (const y of [5, 10, 15]) k.box(x, y, z, 4.6 - y * 0.24, 0.18, 0.18, 0x7d8287).box(x, y, z, 0.18, 0.18, 4.6 - y * 0.24, 0x7d8287);
    k.block(x, z, 4.4, 4.4);
    tops.push([x, z]);
  }
  const mat = new THREE.MeshBasicMaterial({ color: 0x3a3a3a });
  const wires = new THREE.Group();
  wires.name = 'cablesAltaTension';
  for (let i = 0; i < tops.length - 1; i++) {
    for (const [dx, y] of [[-4.2, 21], [4.2, 21], [-3.2, 25.5], [3.2, 25.5]]) {
      const A = new THREE.Vector3(tops[i][0] + dx, y, tops[i][1]), B = new THREE.Vector3(tops[i + 1][0] + dx, y, tops[i + 1][1]);
      const curve = new THREE.QuadraticBezierCurve3(A, A.clone().lerp(B, 0.5).add(new THREE.Vector3(0, -6, 0)), B);
      wires.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.05, 3, false), mat));
    }
  }
  scene.add(wires);
}

/**
 * la esquina de la fila de casas del muro blanco, bajando por el camino (foto desde el coche): el pilar blanco de
 * la entrada con su bola, la piedra grande al pie y el muro bajo de piedra seca del camino que sale hacia el este
 */
function entradaFinca(k) {
  k.box(-1898.2, 0, -2924.6, 0.9, 2.3, 0.9, WHITE, { list: k.shell }).box(-1898.2, 2.3, -2924.6, 1.05, 0.12, 1.05, CAL);
  k.ball(-1898.2, 2.72, -2924.6, 0.3, CAL, { seg: 12 }).block(-1898.2, -2924.6, 0.9, 0.9);
  k.ball(-1900.6, 0.45, -2927.8, 1.1, 0x5a4c40, { sx: 1.3, sy: 0.75, sz: 1.0, seg: 6 }).block(-1900.6, -2927.8, 2.4, 1.8);
  for (let x = -1896.5; x < -1835; x += 0.7) {
    const i = Math.round((x + 1896.5) / 0.7);
    k.ball(x, 0.2 + (i % 2) * 0.18, -2917.6 + Math.sin(i * 1.3) * 0.12, 0.26 + (i % 3) * 0.05, [0x4a403a, 0x6b5c4c, 0x3d3530][i % 3], { sx: 1.2, sy: 0.75, seg: 5 });
  }
  k.seg(-1896.5, -2917.6, -1835, -2917.6);
}

/** la autocaravana blanca aparcada junto al muro */
function camper(k, x, z) {
  k.box(x, 0.45, z, 2.3, 2.6, 6.2, 0xf4f4f2).box(x, 0.45, z + 3.4, 2.2, 1.5, 1.1, 0xf4f4f2).box(x, 3.05, z - 0.4, 2.35, 0.25, 4.4, 0xe8e8e4);
  k.box(x, 1.25, z + 3.96, 1.9, 0.62, 0.04, 0x1d2328).box(x + 1.16, 1.4, z - 1, 0.04, 0.5, 1.6, 0x2a3036).box(x - 1.16, 1.4, z + 0.5, 0.04, 0.5, 1.2, 0x2a3036);
  k.box(x + 1.16, 0.5, z + 1.2, 0.03, 0.12, 3.6, 0x9c3a2a).box(x - 1.16, 0.5, z + 1.2, 0.03, 0.12, 3.6, 0x9c3a2a);
  for (const zz of [z + 2.6, z - 1.8]) for (const xx of [x - 1.0, x + 1.0]) k.cyl(xx, 0.38, zz, 0.38, 0.38, 0.3, 0x1a1b1d, { rx: Math.PI / 2, ry: Math.PI / 2, seg: 14 });
  k.block(x, z + 0.5, 2.4, 7.4);
}

/** poste de la luz de madera con su cruceta; devuelve la punta para los cables */
function poste(k, x, z) {
  k.cyl(x, 0, z, 0.1, 0.14, 8, 0x5a4636, { seg: 7 });
  k.box(x, 7.3, z, 1.6, 0.12, 0.12, 0x4a3a2c);
  for (const s of [-0.7, 0.7]) k.cyl(x + s, 7.42, z, 0.04, 0.05, 0.16, 0xd8d8d0, { seg: 6 });
  k.seg(x - 0.15, z, x + 0.15, z);
  return [x, 7.5, z];
}

const inField = (x, z) => CAMPO_ENARENADOS.some(poly => inside(poly, x, z));

/** matojos secos, piedras sueltas y la montaña del norte */
function campo(scene, avoid) {
  const bush = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ color: 0x7d7a52, roughness: 0.95, flatShading: true }), 1600);
  const rock = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: 0x3a3532, roughness: 0.92, flatShading: true }), 1000);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), v = new THREE.Vector3(), col = new THREE.Color();
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  let nb = 0, nr = 0;
  for (let i = 0; i < 12000 && (nb < bush.count || nr < rock.count); i++) {
    // cuatro de cada diez, a menos de 300 m de la casa (en las fotos, el campo de alrededor está lleno de matojos)
    let x, z;
    if (rnd() < 0.4) {
      const a = rnd() * 6.283, r = 300 * Math.sqrt(rnd());
      [x, z] = [CASA[0] + Math.cos(a) * r, CASA[1] + Math.sin(a) * r];
    } else {
      x = CAMPO.x0 + 50 + rnd() * (CAMPO.x1 - CAMPO.x0 - 100);
      z = CAMPO.z1 - 35 - rnd() * (CAMPO.z1 - CAMPO.z0 - 85);
    }
    if (avoid(x, z) || inField(x, z)) continue;
    if (nb < bush.count && rnd() < 0.62) {
      const r = 0.35 + rnd() * 0.55;
      s.set(r * (1 + rnd() * 0.5), r * (0.55 + rnd() * 0.3), r * (1 + rnd() * 0.5));
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd() * 6.28);
      m4.compose(v.set(x, 0.1 + s.y * 0.5, z), q, s);
      bush.setMatrixAt(nb, m4);
      bush.setColorAt(nb, col.setHSL(0.12 + rnd() * 0.1, 0.15 + rnd() * 0.17, 0.3 + rnd() * 0.12));
      nb++;
    } else if (nr < rock.count) {
      const r = 0.18 + rnd() * 0.35;
      s.set(r * (1 + rnd() * 0.6), r * 0.6, r * (1 + rnd() * 0.6));
      q.setFromEuler(new THREE.Euler(rnd(), rnd() * 6.28, rnd()));
      m4.compose(v.set(x, 0.1 + s.y * 0.3, z), q, s);
      rock.setMatrixAt(nr, m4);
      nr++;
    }
  }
  bush.count = nb;
  rock.count = nr;
  bush.name = 'matojosCampo';
  rock.name = 'piedrasCampo';
  rock.castShadow = true;
  scene.add(bush, rock);
  // la montaña del norte-noreste (fotos desde la azotea hacia el noroeste y desde el camino del este hacia el
  // norte): un cono volcánico marrón oscuro a unos 2 km, con la ladera algo más clara
  const mount = new THREE.Mesh(new THREE.ConeGeometry(700, 330, 40, 6, true), new THREE.MeshStandardMaterial({ color: 0x6e5040, roughness: 1, flatShading: true }));
  const pos = mount.geometry.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y > -164 && y < 164) { const k = 1 + (Math.sin(pos.getX(i) * 0.02) + Math.cos(pos.getZ(i) * 0.017)) * 0.04; pos.setX(i, pos.getX(i) * k); pos.setZ(i, pos.getZ(i) * k); }
  }
  mount.geometry.computeVertexNormals();
  mount.position.set(-1560, 165 - 20, -5150);
  mount.name = 'montanaNoroeste';
  scene.add(mount);
  // la sierra marrón del norte y el noroeste (fotos desde el coche en el cruce y de la parte de atrás): lomas anchas
  // y bajas, la del oeste con sus antenas en la cumbre
  const hillMat = new THREE.MeshStandardMaterial({ color: 0x8c7058, roughness: 1, flatShading: true });
  for (const [x, z, r, h, rot] of [[-2650, -4700, 820, 210, 0.4], [-2150, -4950, 1000, 290, 1.1], [-1050, -5250, 900, 240, 2.3]]) {
    const g = new THREE.ConeGeometry(r, h, 36, 5, true);
    const hp = g.getAttribute('position');
    for (let i = 0; i < hp.count; i++) {
      const y = hp.getY(i), px = hp.getX(i), pz = hp.getZ(i);
      // lomas redondeadas y algo alargadas de este a oeste
      const k = (1 + Math.sin(px * 0.011 + rot) * 0.06 + Math.cos(pz * 0.013) * 0.05) * (y > h / 2 - 1 ? 1 : 1);
      hp.setX(i, px * k * 1.35);
      hp.setY(i, y - Math.max(0, y - h * 0.3) * 0.35);
      hp.setZ(i, pz * k);
    }
    g.computeVertexNormals();
    const hill = new THREE.Mesh(g, hillMat);
    hill.position.set(x, h / 2 - 20, z);
    hill.rotation.y = rot * 0.2;
    hill.name = 'sierraNorte';
    scene.add(hill);
  }
  const ant = new THREE.MeshStandardMaterial({ color: 0xd8d8d0, roughness: 0.6 });
  for (const [dx, dz, ah] of [[0, 0, 28], [14, 8, 20], [-12, 6, 16]]) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.2, ah, 6), ant);
    m.position.set(-2650 + dx, 210 - 20 - 30 + ah / 2, -4700 + dz);
    m.name = 'antenasSierra';
    scene.add(m);
  }
}

function inside(poly, x, z) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, az] = poly[i], [bx, bz] = poly[j];
    if ((az > z) !== (bz > z) && x < ax + ((z - az) * (bx - ax)) / (bz - az)) c = !c;
  }
  return c;
}
const edgeDist = (poly, x, z) => {
  let d = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, az] = poly[j], [bx, bz] = poly[i], dx = bx - ax, dz = bz - az;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
    d = Math.min(d, Math.hypot(x - ax - dx * t, z - az - dz * t));
  }
  return d;
};

/**
 * el suelo del campo: una malla de 15 m que sigue el terreno como el suelo del juego (modo «ground»; el
 * suelo general deja aquí un hueco, CAMPO_HOLE), con la tierra marrón, algo de variación de color y, debajo de
 * los enarenados (que llevan su picón encima), la tierra oscurecida para que el borde no se note
 */
function campoGround() {
  const S = 15, nx = Math.ceil((CAMPO.x1 - CAMPO.x0) / S), nz = Math.ceil((CAMPO.z1 - CAMPO.z0) / S);
  const tex = tierra(), mpt = tex.userData.mpt;
  const pos = [], uv = [], col = [], idx = [];
  const vtx = (x, z) => {
    // manchas grandes y, vértice a vértice, algo de ruido: que no se vea la textura repetida cada 6 m
    const hash = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453 % 1;
    const k = 1 + Math.sin(x * 0.013) * Math.cos(z * 0.011) * 0.07 + Math.sin(x * 0.05 + z * 0.031) * Math.cos(z * 0.043 - x * 0.02) * 0.06 + hash * 0.07;
    const poly = CAMPO_ENARENADOS.find(p => inside(p, x, z));
    const m = poly ? Math.min(1, edgeDist(poly, x, z) / 8) : 0;
    pos.push(x, 0.06, z);
    uv.push(x / mpt, -z / mpt);
    // la tierra de las fotos es algo menos rojiza que la textura
    col.push(k * 0.94 * (1 - m * 0.62), k * 0.96 * (1 - m * 0.55), k * (1 - m * 0.45));
  };
  // malla con índices (los vértices compartidos): unos 16 000 en vez de casi 100 000
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) vtx(Math.min(CAMPO.x1, CAMPO.x0 + i * S), Math.min(CAMPO.z1, CAMPO.z0 + j * S));
  for (let j = 0; j < nz; j++) {
    for (let i = 0; i < nx; i++) {
      const a = j * (nx + 1) + i, b = a + nx + 1;
      idx.push(a, b, b + 1, a, b + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setIndex(idx);
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  const m = paveMaterial(tex);
  m.vertexColors = true;
  m.userData.terrain = 'ground';
  const mesh = new THREE.Mesh(g, m);
  mesh.receiveShadow = true;
  mesh.name = 'tierraCampo';
  return mesh;
}

const segDist = (x, z, [ax, az], [bx, bz]) => {
  const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2));
  return Math.hypot(x - ax - dx * t, z - az - dz * t);
};

export function buildCasaCampo(sceneDeVerdad, choquesDeVerdad) {
  // (Version 145) cada pieza se pone en su sitio de la foto oficial al añadirla (campoReal.js)
  const scene = escenaReal(sceneDeVerdad), colliders = choquesReales(choquesDeVerdad);
  // el suelo: tierra marrón en todo el campo, los enarenados de picón negro y los caminos más claros
  scene.add(campoGround());
  const piconTex = picon();
  for (const poly of CAMPO_ENARENADOS) {
    const field = paveMesh(polyTris(poly), 0.09, piconTex, 0xbdb8b0);
    if (field) { field.name = 'enarenado'; scene.add(field); }
  }
  for (const R of CAMPO_CAMINOS) {
    const road = paveMesh(bandTris(R.p, R.w), 0.12, tierraCamino(), 0xffffff);
    if (road) { road.name = 'caminoTierra'; scene.add(road); }
    // las rodadas: dos franjas algo más oscuras (poco: en las fotos apenas se notan)
    for (const off of [-0.85, 0.85]) {
      const line = R.p.map(([x, z], i) => {
        const [ax, az] = R.p[Math.max(0, i - 1)], [bx, bz] = R.p[Math.min(R.p.length - 1, i + 1)];
        const L = Math.hypot(bx - ax, bz - az) || 1;
        return [x - (bz - az) / L * off, z + (bx - ax) / L * off];
      });
      const rut = paveMesh(bandTris(line, 0.45), 0.125, tierraCamino(), 0xe8dccf);
      if (rut) scene.add(rut);
    }
  }
  const k = new Kit();
  casa(k);
  patio(k, scene);
  muros(k);
  // las dos autocaravanas, el coche amarillo y el blanco, en el solar de picón junto a la casa blanca del norte (fotos de
  // la parte de atrás y desde la azotea hacia el noroeste)
  camper(k, -2022, -3354);
  camper(k, -2017.5, -3354);
  garaje(k, scene);
  cruce(k);
  torres(k, scene);
  entradaFinca(k);
  // los postes de la luz a lo largo del camino del oeste de la manzana y del que sale al noroeste, con sus cables
  const tops = [];
  const along = (line, every, side) => {
    let carry = every / 2;
    for (let i = 0; i < line.length - 1; i++) {
      const [ax, az] = line[i], [bx, bz] = line[i + 1], L = Math.hypot(bx - ax, bz - az);
      for (let d = carry; d < L; d += every) {
        const t = d / L, nx = -(bz - az) / L, nz = (bx - ax) / L;
        tops.push(poste(k, ax + (bx - ax) * t + nx * side, az + (bz - az) * t + nz * side));
      }
      carry = (carry - L) % every;
      if (carry < 0) carry += every;
    }
  };
  along(CAMPO_CAMINOS[0].p.slice(14), 46, 4);
  // y en la bajada del camino hacia el cruce grande, también por el lado del este (foto bajando hacia la ciudad)
  along(CAMPO_CAMINOS[0].p.slice(0, 15), 46, 5);
  along(CAMPO_CAMINOS[1].p, 46, -5.5);
  // y a lo largo del camino que sale hacia el este, por el lado del norte (foto desde el coche con el mar a la derecha)
  along(CAMPO_CAMINOS[7].p.slice(5), 48, -5);
  const wires = new THREE.Group();
  wires.name = 'cablesCampo';
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x2a2a2a });
  for (let i = 0; i < tops.length - 1; i++) {
    const a = new THREE.Vector3(...tops[i]), b = new THREE.Vector3(...tops[i + 1]);
    if (a.distanceTo(b) > 70) continue;
    for (const s of [-0.7, 0.7]) {
      const A = a.clone().add(new THREE.Vector3(s, 0, 0)), B = b.clone().add(new THREE.Vector3(s, 0, 0));
      const curve = new THREE.QuadraticBezierCurve3(A, A.clone().lerp(B, 0.5).add(new THREE.Vector3(0, -0.9, 0)), B);
      wires.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 8, 0.015, 3, false), wireMat));
    }
  }
  scene.add(wires);
  const { group, segs } = k.build('casaCampo');
  scene.add(group);
  for (const sg of segs) colliders.addSegment(...sg);
  // el coche amarillo aparcado contra la valla de malla verde del solar, mirando al norte (foto desde el coche en el
  // cruce del noroeste)
  const car = makeCar('hatch', 0xe7d84a);
  const CX = -2021, CZ = -3342.9;
  car.group.position.set(CX, 0.16, CZ);
  car.group.rotation.y = Math.PI;
  car.group.name = 'cocheAmarillo';
  scene.add(car.group);
  for (const [a, b, c, d] of [[-0.9, -2.1, 0.9, -2.1], [0.9, -2.1, 0.9, 2.1], [0.9, 2.1, -0.9, 2.1], [-0.9, 2.1, -0.9, -2.1]]) colliders.addSegment(CX + a, CZ + b, CX + c, CZ + d);
  // el coche blanco y la furgoneta blanca (sin anuncios) delante de la casa blanca de la puerta verde, mirando al este
  for (const [type, x, z, name] of [['hatch', -2006.4, -3342.4, 'cocheBlanco'], ['van', -1999.6, -3342.6, 'furgonetaBlanca']]) {
    const v = makeCar(type, 0xf2f2f2);
    v.group.traverse(o => { if (o.isMesh && o.geometry?.type === 'PlaneGeometry' && Math.abs(Math.abs(o.rotation.y) - Math.PI / 2) < 1e-6) o.visible = false; });
    v.group.position.set(x, 0.16, z);
    v.group.rotation.y = Math.PI / 2;
    v.group.name = name;
    scene.add(v.group);
    const hl = type === 'van' ? 2.9 : 2.1;
    for (const [a, b, c, d] of [[-hl, -0.95, hl, -0.95], [hl, -0.95, hl, 0.95], [hl, 0.95, -hl, 0.95], [-hl, 0.95, -hl, -0.95]]) colliders.addSegment(x + a, z + b, x + c, z + d);
  }
  // el camino del este de la manzana (las dos fotos desde la esquina): el todoterreno gris junto al muro blanco
  // largo, con las tablas verdes apoyadas, y el todoterreno negro al otro lado; macetas en el muro de la casa del
  // este y las piedras grandes al borde del camino, hacia la montaña
  const parked = [['suv', 0x8a8f94, -1941.5, -3263, 0], ['suv', 0x15171a, -1933.4, -3299, Math.PI]];
  for (const [type, color, x, z, ry] of parked) {
    const c = makeCar(type, color);
    c.group.position.set(x, 0.16, z);
    c.group.rotation.y = ry;
    c.group.name = 'todoterrenoCampo';
    scene.add(c.group);
    for (const [a, b, e, f] of [[-1, -2.4, 1, -2.4], [1, -2.4, 1, 2.4], [1, 2.4, -1, 2.4], [-1, 2.4, -1, -2.4]]) colliders.addSegment(x + a, z + b, x + e, z + f);
  }
  const deco = new Kit();
  for (let z = -3281; z < -3268.5; z += 0.135) deco.box(-1942.68, 0, z, 0.04, 1.1 + Math.sin(z * 7) * 0.04, 0.11, 0x5f8a4e, { ry: 0.04 });
  deco.box(-1942.64, 0.75, -3274.8, 0.03, 0.12, 12.4, 0x55804a);
  for (const z of [-3307, -3303, -3299, -3295]) deco.box(-1940.6, 2.0, z, 0.5, 0.3, 0.9, 0xf0ece2).ball(-1940.6, 2.42, z, 0.28, 0x4f7a3a, { sy: 0.8 });
  for (let i = 0; i < 9; i++) deco.ball(-1931.5 + Math.sin(i * 2.3) * 1.4, 0.25, -3346 - i * 1.9, 0.45 + (i % 3) * 0.15, 0x3a3532, { sx: 1.3, sy: 0.8, sz: 1.1, seg: 6 });
  const built = deco.build('caminoEste');
  scene.add(built.group);
  for (const sg of built.segs) colliders.addSegment(...sg);
  // matojos y piedras, sin pisar caminos, calles, casas ni fincas
  const nearRoad = (x, z) => CAMPO_ROADS.some(R => R.p.some((q, i) => i && segDist(x, z, R.p[i - 1], q) < R.w / 2 + 2.5));
  const boxes = CAMPO_BUILDINGS.map(b => {
    const xs = b.p.map(q => q[0]), zs = b.p.map(q => q[1]);
    return [Math.min(...xs) - 5, Math.min(...zs) - 5, Math.max(...xs) + 5, Math.max(...zs) + 5];
  }).concat(CAMPO_MUROS.map(([pts]) => {
    const xs = pts.map(q => q[0]), zs = pts.map(q => q[1]);
    return [Math.min(...xs) - 2, Math.min(...zs) - 2, Math.max(...xs) + 2, Math.max(...zs) + 2];
  }));
  const nearHouse = (x, z) => boxes.some(([x0, z0, x1, z1]) => x > x0 && x < x1 && z > z0 && z < z1);
  campo(scene, (x, z) => nearRoad(x, z) || nearHouse(x, z) || (x > -2035 && x < -2009 && z > -3336 && z < -3294));
}
