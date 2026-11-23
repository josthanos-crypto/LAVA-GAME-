import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, aRasDelSuelo } from './restaurantesCharco.js';

/**
 * La Lupe, la cantina mexicana de la calle La Porra, en la casa vieja de piedra de la esquina, con la foto
 * de Google Maps de junio de 2026 (solo se mira, no va dentro del juego): la pared de piedra volcánica
 * oscura con su pretil, la ventana grande de marco negro con la reja amarilla de arriba y las dos
 * contraventanas amarillas abiertas, la placa dorada de la «R», la puerta con el 9 encima, la hoja de
 * dentro azul y la de fuera rosa abierta contra la pared con sus papeles, los dos farolillos negros, la
 * ventanita roja con sus contraventanas rojas, el marco azul de los carteles y, en la acera, la silla roja,
 * la mesita azul y la silla amarilla. La casa ocupa los primeros 16 m de la cara; el resto y el bloque del
 * mapa se quedan como estaban.
 */

// la cara sur del bloque, a la calle La Porra (s desde la esquina oeste)
const P = marco([-253.3, 414.7], [-233.2, 409.8]);
const Z = 0.15, CASA = 16.2, ALTO = 4.1;
const AMARILLO = 0xf0c81e, ROSA = 0xe2507e, ROJO = 0xd8382a, AZUL = 0x2a6ac8, NEGRO = 0x1a1a1a;

/** antes de levantar la ciudad: fuera el rótulo rojo genérico */
export function tuneLaLupe(map) {
  map.laLupeSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'La Lupe');
  if (i >= 0) map.laLupeSign = map.signs.splice(i, 1)[0];
  map.laLupe = true;
}

// ——— lo que se pinta en lienzo ———

/** la piedra volcánica de la pared: piedras oscuras sin labrar, apretadas, con las juntas claras */
function piedra(g, w, h) {
  g.fillStyle = '#857c70';
  g.fillRect(0, 0, w, h);
  let s = 23;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const paso = 22;
  for (let y = 0; y < h + paso; y += paso * 0.8) for (let x = (y / paso) % 2 ? paso / 2 : 0; x < w + paso; x += paso) {
    const cx = x + (r() - 0.5) * 8, cy = y + (r() - 0.5) * 6, rx = paso * (0.42 + r() * 0.2), ry = paso * (0.32 + r() * 0.16);
    const v = 46 + r() * 44;
    g.fillStyle = `rgb(${Math.round(v + 8)},${Math.round(v + 3)},${Math.round(v)})`;
    g.beginPath();
    for (let i = 0; i < 7; i++) {
      const an = (i / 7) * Math.PI * 2, k = 0.75 + r() * 0.35;
      const px = cx + Math.cos(an) * rx * k, py = cy + Math.sin(an) * ry * k;
      if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.closePath();
    g.fill();
    g.fillStyle = 'rgba(255,255,255,.06)';
    g.fillRect(cx - rx * 0.4, cy - ry * 0.5, rx * 0.5, ry * 0.3);
  }
}

/** una reja de cuarterones amarilla con los cristales oscuros */
function rejaAmarilla(cols, rows) {
  return (g, w, h) => {
    g.fillStyle = '#f0c81e';
    g.fillRect(0, 0, w, h);
    const bw = Math.max(3, w * 0.05), cw = (w - bw) / cols, ch = (h - bw) / rows;
    g.fillStyle = '#2a2a2e';
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) g.fillRect(bw + i * cw, bw + j * ch, cw - bw, ch - bw);
    g.fillStyle = 'rgba(255,255,255,.12)';
    for (let i = 0; i < cols; i++) g.fillRect(bw + i * cw, bw, (cw - bw) * 0.4, h - bw * 2);
  };
}

/** lo de dentro, oscuro, con un farolillo encendido */
function dentroOscuro(g, w, h) {
  g.fillStyle = '#1e1a18';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#5a3a2a';
  g.fillRect(0, h * 0.7, w, h * 0.3);
  g.fillStyle = '#f0d8a0';
  g.beginPath(); g.arc(w * 0.3, h * 0.25, w * 0.04, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(200,60,80,.6)';
  g.fillRect(w * 0.55, h * 0.3, w * 0.25, h * 0.3);
}

/** la puerta: por el hueco, la hoja de dentro azul a la izquierda y el pasillo oscuro */
function puerta(g, w, h) {
  dentroOscuro(g, w, h);
  g.fillStyle = '#2a6ac8';
  g.fillRect(0, 0, w * 0.32, h);
  g.fillStyle = '#1e4e98';
  for (const y of [0.08, 0.55]) g.fillRect(w * 0.05, h * y, w * 0.22, h * 0.36);
}

/** la hoja rosa, con sus cuarterones y los dos papeles pegados */
function hojaRosa(g, w, h) {
  g.fillStyle = '#e2507e';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#b83a62';
  g.lineWidth = 4;
  for (const [x, y, a, b] of [[0.1, 0.05, 0.8, 0.4], [0.1, 0.5, 0.8, 0.45]]) g.strokeRect(w * x, h * y, w * a, h * b);
  g.fillStyle = '#f4f2ea';
  g.fillRect(w * 0.25, h * 0.12, w * 0.5, h * 0.16);
  g.fillRect(w * 0.3, h * 0.3, w * 0.4, h * 0.1);
  g.fillStyle = '#6a6a6a';
  for (let y = 0.15; y < 0.27; y += 0.03) g.fillRect(w * 0.3, h * y, w * 0.4, 2);
}

/** la ventanita roja: el marco con su reja arriba y la cortina amarilla de dentro */
function ventanaRoja(g, w, h) {
  g.fillStyle = '#d8382a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f0c040';
  g.fillRect(w * 0.12, h * 0.3, w * 0.76, h * 0.62);
  g.fillStyle = '#2a2a2e';
  for (let i = 0; i < 3; i++) g.fillRect(w * (0.12 + i * 0.26), h * 0.06, w * 0.22, h * 0.2);
}

/** el marco azul con los carteles de colores */
function carteles(g, w, h) {
  g.fillStyle = '#2a6ac8';
  g.fillRect(0, 0, w, h);
  const c = ['#f4f2ea', '#e8b030', '#58a8d8', '#d84a6a', '#f4f2ea', '#7ac060'];
  for (let i = 0; i < 6; i++) { g.fillStyle = c[i]; g.fillRect(w * 0.12, h * (0.06 + i * 0.15), w * 0.76, h * 0.13); }
}

/** una placa pequeña: la R dorada o el 9 */
function placa(fondo, letra, color) {
  return (g, w, h) => {
    g.fillStyle = fondo;
    g.fillRect(0, 0, w, h);
    g.fillStyle = color;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `700 ${Math.round(h * 0.7)}px Georgia, serif`;
    g.fillText(letra, w / 2, h * 0.55);
  };
}

// ——— las piezas ———

/** un farolillo negro de pared con su bombilla */
function farolillo(k, s, y) {
  k.box(s, y, Z + 0.08, 0.05, 0.05, 0.16, NEGRO);
  k.box(s, y - 0.22, Z + 0.18, 0.12, 0.2, 0.12, 0xffe2a8, { list: k.glow });
  k.box(s, y - 0.02, Z + 0.18, 0.16, 0.04, 0.16, NEGRO);
}

/** la fachada de la casa de piedra */
function fachada(k) {
  // la pared de piedra, el pretil de arriba y el canto de la esquina
  k.box(CASA / 2, 0, Z - 0.06, CASA, ALTO, 0.12, 0x4a4440);
  k.pic(CASA / 2, ALTO / 2, Z + 0.005, CASA, ALTO, 0, 1, canvasTex(1024, 256, piedra));
  k.box(CASA / 2, ALTO, Z, CASA + 0.05, 0.2, 0.3, 0x4e4844);
  // la ventana grande: el marco negro, la reja amarilla de arriba, el hueco y el panel de abajo
  k.box(4.7, 0.9, Z + 0.01, 2.6, 2.3, 0.04, NEGRO);
  k.pic(4.7, 2.82, Z + 0.035, 2.3, 0.66, 0, 1, canvasTex(256, 74, rejaAmarilla(4, 2)));
  k.pic(4.7, 1.83, Z + 0.035, 2.3, 1.2, 0, 1, canvasTex(192, 100, dentroOscuro));
  k.box(4.7, 1.0, Z + 0.03, 2.3, 0.26, 0.04, AMARILLO);
  // las dos contraventanas amarillas abiertas contra la piedra
  for (const s of [3.0, 6.4]) {
    k.box(s, 1.2, Z + 0.05, 0.86, 1.25, 0.04, AMARILLO);
    k.pic(s, 1.825, Z + 0.075, 0.8, 1.19, 0, 1, canvasTex(96, 140, rejaAmarilla(3, 3)));
  }
  // la placa de la R y el farolillo de la izquierda
  k.pic(7.15, 2.55, Z + 0.02, 0.26, 0.26, 0, 1, canvasTex(48, 48, placa('#d8b030', 'R', '#3a2a10')));
  farolillo(k, 6.9, 3.65);
  // la puerta: el marco negro, el hueco con la hoja azul, el escalón, el 9 y la hoja rosa abierta
  k.box(7.55, 0, Z + 0.02, 0.1, 2.5, 0.06, NEGRO);
  k.box(8.85, 0, Z + 0.02, 0.1, 2.5, 0.06, NEGRO);
  k.box(8.2, 2.42, Z + 0.02, 1.4, 0.1, 0.06, NEGRO);
  k.pic(8.2, 1.21, Z + 0.01, 1.2, 2.42, 0, 1, canvasTex(96, 192, puerta));
  k.box(8.2, 0, Z + 0.1, 1.3, 0.1, 0.2, 0x5a4a44);
  k.pic(8.2, 2.68, Z + 0.02, 0.24, 0.24, 0, 1, canvasTex(48, 48, placa('#1a1a1a', '9', '#f2f2ee')));
  k.box(9.45, 0.02, Z + 0.06, 1.1, 2.36, 0.05, ROSA);
  k.pic(9.45, 1.2, Z + 0.09, 1.04, 2.3, 0, 1, canvasTex(104, 230, hojaRosa));
  // el farolillo de la derecha y la ventanita roja con sus contraventanas
  farolillo(k, 11.8, 3.35);
  k.box(12.85, 0.95, Z + 0.01, 1.4, 1.5, 0.04, NEGRO);
  k.pic(12.85, 1.7, Z + 0.035, 1.2, 1.36, 0, 1, canvasTex(96, 108, ventanaRoja));
  for (const s of [11.95, 13.75]) k.box(s, 1.05, Z + 0.05, 0.4, 1.3, 0.04, ROJO);
  // el marco azul de los carteles
  k.pic(15.35, 1.55, Z + 0.02, 0.72, 1.3, 0, 1, canvasTex(72, 130, carteles));
}

/** en la acera, pegadas a la pared: la silla roja, la mesita azul y la silla amarilla */
function acera(k) {
  k.chair(3.3, Z + 0.32, 0, ROJO, { legs: ROJO });
  k.chair(5.8, Z + 0.32, 0, AMARILLO, { legs: AMARILLO });
  k.cyl(4.55, 0, Z + 0.3, 0.02, 0.02, 0.62, AZUL, { seg: 6 });
  k.cyl(4.55, 0.62, Z + 0.3, 0.24, 0.24, 0.03, AZUL, { seg: 14 });
  for (const s of [3.3, 4.55, 5.8]) k.block(s, Z + 0.3, 0.44, 0.4);
}

/** segunda fase, como los demás de este barrio */
export function buildLaLupe(scene, colliders, map) {
  if (!map?.laLupe) return null;
  const group = new THREE.Group();
  group.name = 'laLupe';
  const kF = new Kit();
  fachada(kF);
  const kA = new Kit();
  acera(kA);
  const sillas = enMarco(kA, P, 'aceraLaLupe', colliders);
  group.add(enMarco(kF, P, 'fachadaLaLupe', colliders), sillas);
  scene.add(group);
  aRasDelSuelo(scene, sillas);
  return { group };
}
