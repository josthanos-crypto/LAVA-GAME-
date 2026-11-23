import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * Tinta Smile, la tienda de tintas y papelería de la calle La Inés, con la foto de Google Maps de
 * septiembre de 2024 (solo se mira, no va dentro del juego): la casa blanca con la ventanita de reja, el
 * letrero verde y azul «TINTA SMILE» con la gota, el hueco grande de la tienda abierto con el mostrador
 * azul de borde verde, la gota del logo, las baldas y la dependienta, la franja amarilla de abajo, el
 * pilar con el 6 en su placa azul y, en la acera, el cartel de pie con forma de tabla con la gota. El
 * bloque se queda como está.
 */

// la cara sur del bloque, a la calle La Inés (s desde la esquina del oeste)
const T = marco([-285.3, 147.7], [-229.9, 121.7]);
const Z = 0.12, BLANCO = 0xf4f2ec, AMARILLO = 0xd8b030;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneTintaSmile(map) {
  map.tintaSmileSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Tinta smile');
  if (i >= 0) map.tintaSmileSign = map.signs.splice(i, 1)[0];
  map.tintaSmile = true;
}

// ——— lo que se pinta en lienzo ———

/** la gota del logo: verde con el borde amarillo y la sonrisa */
function gota(g, x, y, r) {
  g.fillStyle = '#e8c030';
  g.beginPath(); g.moveTo(x, y - r * 1.5); g.quadraticCurveTo(x + r * 1.15, y - r * 0.2, x + r, y + r * 0.3); g.arc(x, y + r * 0.3, r, 0, Math.PI); g.quadraticCurveTo(x - r * 1.15, y - r * 0.2, x, y - r * 1.5); g.fill();
  const k = 0.78;
  g.fillStyle = '#3a9a4a';
  g.beginPath(); g.moveTo(x, y - r * 1.5 * k); g.quadraticCurveTo(x + r * k * 1.15, y - r * 0.2 * k, x + r * k, y + r * 0.3); g.arc(x, y + r * 0.3, r * k, 0, Math.PI); g.quadraticCurveTo(x - r * k * 1.15, y - r * 0.2 * k, x, y - r * 1.5 * k); g.fill();
  g.strokeStyle = '#f2f2ee';
  g.lineWidth = r * 0.12;
  g.beginPath(); g.arc(x, y + r * 0.2, r * 0.4, 0.2, Math.PI - 0.2); g.stroke();
}

/** el letrero: TINTA SMILE en blanco sobre verde y azul, con la gota en medio */
function letrero(g, w, h) {
  g.fillStyle = '#2a8a4a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#1e4aa8';
  g.fillRect(0, h * 0.72, w, h * 0.28);
  g.fillStyle = '#f2f2ee';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(h * 0.5)}px "Arial Black", Arial, sans-serif`;
  g.fillText('TINTA', w * 0.24, h * 0.38);
  g.fillText('SMILE', w * 0.74, h * 0.38);
  gota(g, w * 0.5, h * 0.32, h * 0.2);
  g.font = `600 ${Math.round(h * 0.15)}px Arial, sans-serif`;
  g.fillText('TINTAS · PAPELERÍA', w / 2, h * 0.86);
}

/** por el hueco abierto: el mostrador azul de borde verde, la gota, las baldas, las plantas y la dependienta */
function tienda(g, w, h) {
  g.fillStyle = '#ece8e0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c8c0b0';
  g.fillRect(0, h * 0.84, w, h * 0.16);
  let s = 21;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (const y of [0.25, 0.38]) for (let x = 0.04; x < 0.96; x += 0.035) { g.fillStyle = ['#c84a2a', '#2a5ab8', '#e8c040', '#3a9a4a', '#f2f2ee'][Math.floor(r() * 5)]; g.fillRect(w * x, h * y, w * 0.025, h * 0.08); }
  g.fillStyle = '#4a8a3a';
  for (let x = 0.1; x < 0.9; x += 0.2) { g.beginPath(); g.arc(w * x, h * 0.18, w * 0.03, 0, Math.PI * 2); g.fill(); }
  // la dependienta detrás del mostrador
  g.fillStyle = '#58a8c8';
  g.fillRect(w * 0.52, h * 0.44, w * 0.08, h * 0.14);
  g.fillStyle = '#d8b090';
  g.beginPath(); g.arc(w * 0.56, h * 0.41, w * 0.03, 0, Math.PI * 2); g.fill();
  // el mostrador azul con su borde verde y la gota
  g.fillStyle = '#1e4aa8';
  g.fillRect(w * 0.1, h * 0.56, w * 0.8, h * 0.28);
  g.fillStyle = '#7ac040';
  g.fillRect(w * 0.1, h * 0.56, w * 0.8, h * 0.04);
  gota(g, w * 0.72, h * 0.72, h * 0.06);
}

/** el cartel de pie con forma de tabla, con la gota */
function tabla(g, w, h) {
  g.fillStyle = '#f4f2ec';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8c030';
  g.fillRect(0, h * 0.82, w, h * 0.18);
  gota(g, w / 2, h * 0.45, w * 0.24);
  g.fillStyle = '#2a8a4a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(w * 0.18)}px Arial, sans-serif`;
  g.fillText('TINTA', w / 2, h * 0.14);
  g.fillText('SMILE', w / 2, h * 0.24);
}

/** la placa azul del 6 */
function seis(g, w, h) {
  g.fillStyle = '#1e4aa8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f2f2ee';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.7)}px Arial, sans-serif`;
  g.fillText('6', w / 2, h * 0.55);
}

// ——— las piezas ———

/** la planta baja de Tinta Smile */
function fachada(k) {
  const a0 = 8.4, a1 = 12.2, H = 2.8;
  // la pared blanca, la franja amarilla de abajo y la ventanita de reja
  k.box(8.9, 0, Z - 0.05, 8.2, 3.8, 0.1, BLANCO);
  k.box(8.9, 0, Z + 0.01, 8.2, 0.25, 0.04, AMARILLO);
  k.box(6.3, 1.4, Z + 0.01, 0.55, 0.45, 0.04, 0x3a3a3e);
  for (let s = 6.1; s < 6.55; s += 0.1) k.box(s, 1.4, Z + 0.04, 0.02, 0.45, 0.02, 0xf2f2ee);
  // el letrero verde y azul encima de la pared, junto al hueco
  k.box(6.9, 2.45, Z + 0.03, 3.0, 0.62, 0.06, 0x2a8a4a);
  k.pic(6.9, 2.76, Z + 0.065, 2.94, 0.58, 0, 1, canvasTex(480, 96, letrero));
  // el hueco grande de la tienda, abierto, con sus jambas amarillas
  k.pic((a0 + a1) / 2, H / 2, Z, a1 - a0, H, 0, 1, canvasTex(384, 284, tienda), { glow: 0.12 });
  for (const s of [a0, a1]) k.box(s, 0, Z + 0.03, 0.14, H, 0.08, AMARILLO);
  k.box((a0 + a1) / 2, H, Z + 0.04, a1 - a0 + 0.14, 0.2, 0.1, 0xe8e6e0);
  // el pilar del 6 con su placa azul
  k.box(12.6, 0, Z + 0.04, 0.6, 3.6, 0.1, BLANCO);
  k.box(12.6, 0, Z + 0.1, 0.6, 1.0, 0.04, 0x58a8d8);
  k.pic(12.6, 2.9, Z + 0.1, 0.24, 0.2, 0, 1, canvasTex(48, 40, seis));
}

/** el cartel de pie con forma de tabla, en la acera */
function cartelDePie(k) {
  const s = 11.4, z = 0.75;
  const g = new THREE.CylinderGeometry(0.32, 0.32, 0.05, 20);
  g.rotateX(Math.PI / 2);
  g.scale(1, 2.8, 1);
  g.translate(s, 0.9, z);
  k.add(g, 0xf4f2ec);
  k.pic(s, 0.92, z + 0.03, 0.4, 1.3, 0, 1, canvasTex(96, 312, tabla));
  k.box(s, 0, z - 0.15, 0.3, 0.05, 0.3, 0x6a6c70);
  k.block(s, z, 0.6, 0.3);
}

/** segunda fase, como los demás de este barrio */
export function buildTintaSmile(scene, colliders, map) {
  if (!map?.tintaSmile) return null;
  const k = new Kit();
  fachada(k);
  cartelDePie(k);
  const group = enMarco(k, T, 'tintaSmile', colliders);
  scene.add(group);
  return { group };
}
