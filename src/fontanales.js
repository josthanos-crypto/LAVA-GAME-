import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * La Churrería Cafetería Fontanales de Titerroy, en la calle Carlos III 11 (esquina con la avenida Eugenio
 * Rijo Rocha), con la foto de Google Maps de mayo de 2018 (solo se mira, no va dentro del juego; la gente de
 * la foto no se pone): el toldo naranja largo de ondas con «FONTANALES» en letras blancas, la taza en su
 * círculo y «CAFETERÍA» en letras azules; debajo, la terraza cerrada con los paneles naranjas bajos y los
 * cristales, las mesas y las sillas de rejilla, el banco de madera de la acera y el tablón verde de los
 * carteles; detrás, la cristalera del bar; y en la acera, los laureles de Indias con el tronco blanqueado.
 * El bloque se queda como está.
 */

// la fachada de la avenida (s desde la esquina del este); el rótulo del mapa cae en s 8,3
const F = marco([-636.21, -626.83], [-658.15, -656.68]);
const Z = 0.12, S0 = 0.4, S1 = 16.4, NARANJA = 0xe8601e, FUERA = 2.6, TOLDO = 2.75;

/** antes de levantar la ciudad: fuera el rótulo genérico (y su terraza genérica: lleva la suya) */
export function tuneFontanales(map) {
  map.fontanalesSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Fontanales');
  if (i >= 0) map.fontanalesSign = map.signs.splice(i, 1)[0];
  map.fontanales = true;
}

// ——— lo que se pinta en lienzo ———

/** el faldón del toldo: «FONTANALES» en blanco, la taza en su círculo y «CAFETERÍA» en azul */
function faldon(g, w, h) {
  g.fillStyle = '#e8601e';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.14)';
  g.fillRect(0, 0, w, h * 0.2);
  g.textBaseline = 'middle';
  g.textAlign = 'center';
  g.font = `italic 900 ${Math.round(h * 0.62)}px "Arial Black", Arial, sans-serif`;
  g.fillStyle = '#ffffff';
  g.fillText('FONTANALES', w * 0.3, h * 0.52);
  // la taza en su círculo blanco
  g.beginPath(); g.arc(w * 0.53, h * 0.5, h * 0.36, 0, Math.PI * 2); g.fillStyle = '#ffffff'; g.fill();
  g.fillStyle = '#5a3a26';
  g.fillRect(w * 0.53 - h * 0.17, h * 0.42, h * 0.3, h * 0.22);
  g.strokeStyle = '#5a3a26';
  g.lineWidth = 3;
  g.beginPath(); g.arc(w * 0.53 + h * 0.15, h * 0.53, h * 0.07, -Math.PI / 2, Math.PI / 2); g.stroke();
  g.fillStyle = '#1e3a9a';
  g.font = `italic 900 ${Math.round(h * 0.56)}px "Arial Black", Arial, sans-serif`;
  g.fillText('CAFETERÍA', w * 0.78, h * 0.52);
}

/** el bar por la cristalera de la terraza: las mesas, las sillas y la barra al fondo */
function bar(g, w, h) {
  g.fillStyle = '#5a4a40';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8d8c0';
  g.fillRect(0, 0, w, h * 0.15);
  g.fillStyle = '#d8c8a8';
  g.fillRect(w * 0.55, h * 0.45, w * 0.4, h * 0.12);
  g.fillStyle = '#8a6a4a';
  g.fillRect(w * 0.55, h * 0.57, w * 0.4, h * 0.43);
  g.fillStyle = '#f2e8d8';
  for (let x = 0.58; x < 0.92; x += 0.06) g.fillRect(w * x, h * 0.3, w * 0.03, h * 0.12);
  g.fillStyle = '#c8a878';
  for (const x of [0.08, 0.3]) { g.fillRect(w * x, h * 0.62, w * 0.14, h * 0.03); g.fillRect(w * (x + 0.06), h * 0.65, w * 0.02, h * 0.3); }
  g.fillStyle = 'rgba(255,255,255,.15)';
  g.fillRect(0, 0, w * 0.4, h);
}

// ——— las piezas ———

/** una silla de rejilla de aluminio, mirando hacia (sin ry, cos ry) */
function silla(k, s, z, ry) {
  k.box(s, 0.44, z, 0.45, 0.04, 0.45, 0x8a7a6a, { ry });
  const c = Math.cos(ry), sn = Math.sin(ry);
  for (const [u, v] of [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]]) k.box(s + c * u + sn * v, 0, z - sn * u + c * v, 0.03, 0.44, 0.03, 0xb8bcc0, { ry });
  k.box(s - sn * 0.21, 0.48, z - c * 0.21, 0.45, 0.42, 0.03, 0x8a7a6a, { ry });
}

/** un laurel de Indias de la acera: el tronco blanqueado abajo y la copa redonda */
function laurel(k, s, z, semilla) {
  let r0 = semilla;
  const r = () => (r0 = (r0 * 16807) % 2147483647) / 2147483647;
  k.cyl(s, 0, z, 0.16, 0.22, 1.0, 0xe8e4dc, { seg: 8 });
  k.cyl(s, 1.0, z, 0.12, 0.16, 2.6, 0x8a8478, { seg: 8 });
  for (let i = 0; i < 7; i++) k.ball(s + (r() - 0.5) * 3, 4.0 + r() * 1.4, z + (r() - 0.5) * 2.6, 1.0 + r() * 0.6, [0x3a6a2a, 0x2e5a22, 0x4a7a32][Math.floor(r() * 3)], { seg: 8 });
  k.block(s, z, 0.45, 0.45);
}

/** la cafetería: la cristalera, el toldo con el faldón, la terraza cerrada, los muebles, el banco y los árboles */
function fachada(k) {
  const sm = (S0 + S1) / 2, L = S1 - S0;
  // la cristalera del bar al fondo de la terraza
  k.pic(sm, 1.25, Z + 0.01, L, 2.5, 0, 1, canvasTex(820, 130, bar), { glow: 0.12 });
  // el toldo inclinado de la pared al faldón, y el faldón con el nombre
  const yP = 3.3, Lt = Math.hypot(FUERA, yP - TOLDO);
  const g = new THREE.BoxGeometry(L + 0.2, 0.03, Lt);
  g.rotateX(Math.atan2(yP - TOLDO, FUERA));
  g.translate(sm, (yP + TOLDO) / 2, Z + FUERA / 2);
  k.add(g, NARANJA);
  k.box(sm, TOLDO - 0.5, Z + FUERA, L + 0.2, 0.5, 0.03, NARANJA);
  k.pic(sm, TOLDO - 0.25, Z + FUERA + 0.02, L + 0.18, 0.48, 0, 1, canvasTex(1200, 60, faldon));
  for (let s = S0 + 0.3; s < S1; s += 0.5) k.box(s, TOLDO - 0.6, Z + FUERA + 0.02, 0.36, 0.1, 0.01, NARANJA);
  // la terraza cerrada: los paneles naranjas bajos, los cristales y los montantes
  for (let s = S0; s <= S1 + 0.01; s += L / 6) k.box(s, 0, Z + FUERA - 0.05, 0.08, TOLDO - 0.5, 0.08, 0xd85a1a);
  k.box(sm, 0, Z + FUERA - 0.05, L, 0.85, 0.06, NARANJA);
  k.block(sm, Z + FUERA - 0.05, L, 0.1);
  k.glass.push(new THREE.PlaneGeometry(L, TOLDO - 1.4).translate(sm, 0.85 + (TOLDO - 1.4) / 2, Z + FUERA - 0.04));
  for (const s of [S0 + 0.05, S1 - 0.05]) k.box(s, 0, Z + FUERA / 2, 0.06, TOLDO - 0.5, FUERA - 0.1, 0xd85a1a);
  // las mesas y las sillas de dentro de la terraza
  for (const s of [2.2, 5.0, 7.8, 10.6, 13.4]) {
    k.cyl(s, 0, Z + 1.3, 0.04, 0.04, 0.72, 0x5a5a5c, { seg: 6 });
    k.cyl(s, 0.72, Z + 1.3, 0.38, 0.38, 0.03, 0xe8e4dc, { seg: 14 });
    silla(k, s - 0.6, Z + 1.3, Math.PI / 2);
    silla(k, s + 0.6, Z + 1.3, -Math.PI / 2);
  }
  // en la acera: el banco de madera, el tablón verde de los carteles y los laureles
  k.box(8.2, 0.42, Z + 3.2, 1.8, 0.06, 0.45, 0xb87a48);
  for (const d of [-0.8, 0.8]) k.box(8.2 + d, 0, Z + 3.2, 0.06, 0.42, 0.4, 0x3a3a3c);
  k.box(8.2, 0.48, Z + 3.0, 1.8, 0.4, 0.05, 0xb87a48);
  k.block(8.2, Z + 3.2, 1.8, 0.5);
  k.box(4.6, 0, Z + 3.3, 0.08, 1.9, 0.08, 0x2a8a5a);
  k.box(4.6, 1.0, Z + 3.3, 0.9, 0.9, 0.06, 0x2a8a5a);
  k.box(4.6, 1.05, Z + 3.34, 0.78, 0.78, 0.01, 0xe8e4d0);
  for (const [s, sem] of [[1.6, 7], [6.6, 19], [11.8, 31]]) laurel(k, s, Z + 4.4, sem);
}

/** se monta con lo demás de Titerroy */
export function buildFontanales(scene, colliders, map) {
  if (!map?.fontanales) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, F, 'fontanales', colliders);
  scene.add(group);
  return { group };
}
