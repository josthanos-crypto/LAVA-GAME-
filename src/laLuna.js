import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * El Restaurante La Luna (La Destiladera La Luna), en la calle Pedro Barba (centro), en la esquina, con la vista de
 * la calle de Google de octubre de 2022 (solo se mira, no va dentro del juego): la casa blanca; la puerta de
 * madera oscura de cuarterones con el número 8 en su placa naranja; la ventana con la reja y el cartel azul de
 * encima; el toldo color tierra de brazos con «La Destiladera La Luna» en blanco en el faldón; las sillas rojas
 * apiladas junto a la puerta; y el barril de la esquina. La terraza de mesas de la foto está en una acera ancha
 * que en el juego no hay (la calzada llega a la pared), así que no se pone, y el toldo sale menos. El bloque se
 * queda como está; lo de abajo tapa su trozo.
 */

// la fachada de la calle Pedro Barba (s de izquierda a derecha mirándola; la esquina cae en s 19,1); Google pone
// el restaurante en la esquina y el rótulo del mapa estaba en la cara de al lado, que da a un solar
const L = marco([-475.73, 399.23], [-456.66, 398.57]);
const Z = 0.12, ZF = Z + 0.3, S0 = 12.6, S1 = 19.05, TIERRA = 0x8a7660, FUERA = 1.8, T0 = 12.9, T1 = 18.4;

/** antes de levantar la ciudad: fuera el rótulo genérico (y su terraza genérica, que aquí caería en la calzada) */
export function tuneLaLuna(map) {
  map.laLunaSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'La Luna' && Math.hypot(s.x + 457, s.z - 391.4) < 15);
  if (i >= 0) map.laLunaSign = map.signs.splice(i, 1)[0];
  map.laLuna = true;
}

// ——— lo que se pinta en lienzo ———

/** el faldón del toldo con el nombre en blanco */
function faldon(g, w, h) {
  g.fillStyle = '#8a7660';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(0,0,0,.12)';
  for (let x = 0; x < w; x += w / 14) { g.beginPath(); g.moveTo(x, h); g.quadraticCurveTo(x + w / 28, h * 0.7, x + w / 14, h); g.fill(); }
  g.fillStyle = '#f4f0e8';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.font = `400 ${Math.round(h * 0.55)}px "Palatino Linotype", Georgia, serif`;
  g.fillText('La Destiladera', w * 0.06, h * 0.5);
  g.font = `400 ${Math.round(h * 0.5)}px "Palatino Linotype", Georgia, serif`;
  g.fillText('La Luna', w * 0.46, h * 0.5);
}

/** la puerta de madera oscura de cuarterones */
function puerta(g, w, h) {
  g.fillStyle = '#5a3a26';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(0,0,0,.4)';
  g.lineWidth = 3;
  for (let y = 0.05; y < 0.95; y += 0.15) for (const x of [0.1, 0.55]) g.strokeRect(w * x, h * y, w * 0.35, h * 0.12);
  g.fillStyle = 'rgba(255,220,180,.12)';
  for (let y = 0.05; y < 0.95; y += 0.15) for (const x of [0.1, 0.55]) g.fillRect(w * x + 4, h * y + 4, w * 0.35 - 8, h * 0.05);
}

/** la ventana con la reja, oscura por dentro */
function ventana(g, w, h) {
  g.fillStyle = '#2a2a2c';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.08)';
  g.fillRect(0, 0, w * 0.4, h);
  g.fillStyle = '#3a3a3c';
  for (let x = w / 6; x < w; x += w / 6) g.fillRect(x - 2, 0, 4, h);
}

/** el cartel azul de encima de la ventana */
function cartel(g, w, h) {
  g.fillStyle = '#2a4a8a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8d8a0';
  g.fillRect(w * 0.12, h * 0.2, w * 0.3, h * 0.6);
  g.fillStyle = '#f4f4f0';
  for (const y of [0.3, 0.5, 0.7]) g.fillRect(w * 0.5, h * y, w * 0.4, h * 0.08);
}

// ——— las piezas ———

/** la esquina: la pared, la puerta, la ventana, el toldo con su faldón, las sillas apiladas y el barril */
function fachada(k) {
  const tm = (T0 + T1) / 2, Lt = T1 - T0, yP = 3.05, yF = 2.45;
  // la pared blanca del bajo por delante de lo genérico, con los huecos de la puerta y de la ventana
  for (const [s0, s1, y0, y1] of [[S0, 15.4, 0, 3.6], [16.7, 17.0, 0, 3.6], [18.15, S1, 0, 3.6], [15.4, 16.7, 0, 1.0], [15.4, 16.7, 2.25, 3.6], [17.0, 18.15, 2.45, 3.6]]) {
    k.box((s0 + s1) / 2, y0, Z + 0.15, s1 - s0, y1 - y0, 0.3, 0xf4f3ef);
  }
  k.block((S0 + S1) / 2, Z + 0.15, S1 - S0, 0.3);
  // la puerta de madera, la placa del 8, la ventana con la reja y el cartel azul
  k.pic(17.575, 1.225, Z + 0.06, 1.15, 2.45, 0, 1, canvasTex(100, 220, puerta));
  k.box(18.45, 2.7, ZF + 0.01, 0.24, 0.24, 0.03, 0xe8701e);
  k.pic(16.05, 1.625, Z + 0.06, 1.3, 1.25, 0, 1, canvasTex(120, 120, ventana));
  k.box(16.05, 2.35, ZF + 0.02, 0.6, 0.4, 0.04, 0x2a4a8a);
  k.pic(16.05, 2.55, ZF + 0.045, 0.58, 0.38, 0, 1, canvasTex(100, 66, cartel));
  // el toldo inclinado de brazos con su faldón
  const Ltt = Math.hypot(FUERA, yP - yF);
  const tela = new THREE.BoxGeometry(Lt, 0.03, Ltt);
  tela.rotateX(Math.atan2(yP - yF, FUERA));
  tela.translate(tm, (yP + yF) / 2, ZF + FUERA / 2);
  k.add(tela, TIERRA);
  k.box(tm, yF - 0.32, ZF + FUERA, Lt, 0.32, 0.03, TIERRA);
  k.pic(tm, yF - 0.16, ZF + FUERA + 0.02, Lt - 0.02, 0.3, 0, 1, canvasTex(700, 40, faldon));
  k.box(tm, yF - 0.04, ZF + FUERA - 0.04, Lt, 0.05, 0.06, 0xe8e6e0);
  for (const s of [T0 + 0.2, T1 - 0.2]) {
    const brazo = new THREE.BoxGeometry(0.05, 0.05, Ltt);
    brazo.rotateX(Math.atan2(yP - yF, FUERA) + 0.25);
    brazo.translate(s, (yP + yF) / 2 - 0.2, ZF + FUERA / 2);
    k.add(brazo, 0xe8e6e0);
  }
  // las sillas rojas apiladas junto a la puerta
  for (let i = 0; i < 4; i++) k.box(16.7, 0.44 + i * 0.07, ZF + 0.3, 0.45, 0.04, 0.45, 0xc82a2a);
  k.box(16.7, 0.5, ZF + 0.08, 0.45, 0.6, 0.06, 0xc82a2a);
  for (const [u, v] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) k.box(16.7 + u, 0, ZF + 0.3 + v, 0.04, 0.44, 0.04, 0xc82a2a);
  // el barril de la esquina
  k.cyl(18.65, 0, ZF + 0.32, 0.3, 0.3, 0.85, 0x9a6a3a, { seg: 14 });
  for (const y of [0.1, 0.72]) k.cyl(18.65, y, ZF + 0.32, 0.315, 0.315, 0.05, 0x5a5c60, { seg: 14 });
  k.block(18.65, ZF + 0.32, 0.6, 0.6);
}

/** se monta con lo demás de Arrecife Centro */
export function buildLaLuna(scene, colliders, map) {
  if (!map?.laLuna) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, L, 'laLuna', colliders);
  scene.add(group);
  return { group };
}
