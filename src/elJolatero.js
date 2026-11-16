import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, toldo, estufa, pizarraColgada, SERIF } from './restaurantesCharco.js';

/**
 * El Jolatero, el bar restaurante de la calle La Coruña frente al Charco de San Ginés, con la foto de Google
 * Maps de febrero de 2026 (solo se mira, no va dentro del juego; la gente de la foto no se pone): la casa
 * blanca con la carpintería azul fuerte, arriba la ventana con sus contraventanas azules y el balcón de
 * barandilla azul; abajo el panel de lamas azules con el nombre en letras doradas y sus focos (en la foto el
 * panel lleva el nombre de una marca de cerveza, que no se pone: va el del bar), el toldo azul marino de
 * ondas, la barra iluminada con la celosía blanca, la puerta de lamas azules y, en la calle, la terraza de
 * mesas grises con las sillas de mimbre blanco, la estufa y la pizarra. El bloque se queda como está.
 */

// la fachada de la calle La Coruña (s desde la esquina del oeste); el rótulo del mapa cae en s 10,8
const J = marco([396.14, 53.03], [408.23, 57.08]);
const Z = 0.12, S0 = 0.8, S1 = 11.6, AZUL = 0x1f4fb0, MARINO = 0x1c2840, BLANCO = 0xf2f1ec, PB = 3.4;

/** antes de levantar la ciudad: fuera el rótulo genérico (y su terraza genérica: lleva la suya) */
export function tuneElJolatero(map) {
  map.elJolateroSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'El Jolatero');
  if (i >= 0) map.elJolateroSign = map.signs.splice(i, 1)[0];
  map.elJolatero = true;
}

// ——— lo que se pinta en lienzo ———

/** el panel de lamas azules con el nombre en dorado */
function panel(g, w, h) {
  g.fillStyle = '#1f4fb0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(0,0,0,.22)';
  for (let y = 0; y < h; y += h / 9) g.fillRect(0, y, w, 2);
  g.fillStyle = 'rgba(255,255,255,.1)';
  for (let y = 3; y < h; y += h / 9) g.fillRect(0, y, w, 1);
  g.font = `700 ${Math.round(h * 0.62)}px ${SERIF}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#5a4210';
  g.fillText('El Jolatero', w / 2 + 3, h * 0.56 + 3);
  g.fillStyle = '#f0cf72';
  g.fillText('El Jolatero', w / 2, h * 0.56);
}

/** el bar por dentro: la barra iluminada, la celosía blanca, las lámparas y las botellas */
function bar(g, w, h) {
  g.fillStyle = '#f2e8d6';
  g.fillRect(0, 0, w, h);
  // la celosía blanca de la pared del fondo
  g.strokeStyle = 'rgba(180,170,150,.7)';
  g.lineWidth = 2;
  for (let x = -h; x < w; x += 14) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + h * 0.6, h * 0.6); g.stroke(); g.beginPath(); g.moveTo(x + h * 0.6, 0); g.lineTo(x, h * 0.6); g.stroke(); }
  // las baldas con botellas y la luz verde de la nevera
  g.fillStyle = '#8a6a48';
  for (const y of [0.3, 0.45]) g.fillRect(w * 0.55, h * y, w * 0.4, h * 0.02);
  for (let x = 0.56; x < 0.94; x += 0.025) { g.fillStyle = ['#3a6a3a', '#7a3a2a', '#c8a050', '#2a4a6a'][Math.floor(x * 97) % 4]; g.fillRect(w * x, h * 0.21, w * 0.012, h * 0.09); g.fillRect(w * x, h * 0.36, w * 0.012, h * 0.09); }
  g.fillStyle = 'rgba(80,220,120,.55)';
  g.fillRect(w * 0.82, h * 0.5, w * 0.12, h * 0.3);
  // la barra
  g.fillStyle = '#e8e2d4';
  g.fillRect(w * 0.08, h * 0.6, w * 0.7, h * 0.08);
  g.fillStyle = '#4a3a2c';
  g.fillRect(w * 0.08, h * 0.68, w * 0.7, h * 0.32);
  // las lámparas colgadas
  g.fillStyle = '#ffd890';
  for (let x = 0.15; x < 0.8; x += 0.16) { g.fillRect(w * x, 0, 1, h * 0.12); g.beginPath(); g.arc(w * x, h * 0.14, 5, 0, Math.PI * 2); g.fill(); }
}

/** las lamas de la puerta y de las contraventanas azules */
function lamas(g, w, h) {
  g.fillStyle = '#1f4fb0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(0,0,0,.25)';
  for (let y = 4; y < h; y += 7) g.fillRect(4, y, w - 8, 2);
  g.strokeStyle = '#163c88';
  g.lineWidth = 4;
  g.strokeRect(2, 2, w - 4, h - 4);
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
}

// ——— las piezas ———

/** una silla de mimbre blanco con brazos, mirando hacia (sin ry, cos ry) */
function sillaMimbre(k, s, z, ry) {
  const c = Math.cos(ry), sn = Math.sin(ry), at = (u, v) => [s + c * u + sn * v, z - sn * u + c * v];
  const [ax, az] = at(0, 0);
  k.box(ax, 0.42, az, 0.5, 0.06, 0.5, 0xeeeae2, { ry });
  for (const [u, v] of [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]]) { const [x, zz] = at(u, v); k.box(x, 0, zz, 0.04, 0.42, 0.04, 0x8a8a8a, { ry }); }
  const [bx, bz] = at(0, -0.24);
  k.box(bx, 0.48, bz, 0.5, 0.38, 0.06, 0xeeeae2, { ry });
  for (const u of [-0.25, 0.25]) { const [x, zz] = at(u, -0.02); k.box(x, 0.48, zz, 0.05, 0.2, 0.44, 0xeeeae2, { ry }); }
}

/** la fachada: el blanco, la planta de arriba con su ventana y balcón azules, el panel, el bar y el toldo */
function fachada(k) {
  const sm = (S0 + S1) / 2, L = S1 - S0;
  // la planta baja: el bar abierto a todo lo ancho, con la puerta de lamas a la derecha
  k.pic(sm - 1.2, 1.35, Z + 0.01, L - 3, 2.7, 0, 1, canvasTex(620, 270, bar), { glow: 0.25 });
  k.pic(S1 - 1.4, 1.2, Z + 0.02, 1.4, 2.4, 0, 1, canvasTex(80, 160, lamas));
  for (const s of [S0, S1 - 2.2, S1]) k.box(s, 0, Z + 0.06, 0.2, PB - 0.6, 0.14, BLANCO);
  // el panel de lamas azules con el nombre y la fila de focos encima
  k.box(sm, PB - 0.6, Z + 0.08, L, 1.3, 0.12, AZUL);
  k.pic(sm, PB + 0.05, Z + 0.15, L * 0.92, 1.25, 0, 1, canvasTex(820, 110, panel));
  for (let s = S0 + 0.6; s < S1; s += 1.1) { k.box(s, PB + 0.72, Z + 0.3, 0.06, 0.06, 0.4, 0x2a2a2c); k.box(s, PB + 0.66, Z + 0.48, 0.12, 0.12, 0.12, 0xfff2d0, { list: k.glow }); }
  // la planta de arriba: la ventana con sus contraventanas azules y el balcón con barandilla azul
  const ys = PB + 1.4;
  k.box(S0 + 2.3, ys, Z + 0.02, 1.3, 1.5, 0.04, 0x16233a);
  for (const d of [-1, 1]) k.pic(S0 + 2.3 + d * 1.05, ys + 0.75, Z + 0.05, 0.75, 1.5, 0, 1, canvasTex(60, 120, lamas));
  k.box(S1 - 3, ys - 0.15, Z + 0.6, 4, 0.15, 1.2, BLANCO);
  for (let s = S1 - 4.9; s <= S1 - 1.1; s += 0.14) k.box(s, ys, Z + 1.18, 0.03, 0.95, 0.03, AZUL);
  k.box(S1 - 3, ys + 0.95, Z + 1.18, 4, 0.05, 0.06, AZUL);
  k.box(S1 - 3, ys, Z + 0.05, 1.6, 2.1, 0.04, 0x16233a);
  // el toldo azul marino de ondas, de la pared hacia la calle
  toldo(k, S0 + 0.2, S1 - 0.2, PB - 0.65, 2.3, 3.6);
  // las ondas del faldón
  for (let s = S0 + 0.45; s < S1 - 0.3; s += 0.42) k.box(s, 1.9, Z + 3.67, 0.3, 0.14, 0.02, MARINO);
}

/** la terraza de la calle: las mesas grises con las sillas de mimbre, la estufa y la pizarra */
function terraza(k) {
  for (const [s, z] of [[2.2, 1.6], [5.0, 1.6], [7.8, 1.6], [2.2, 3.4], [5.0, 3.4], [7.8, 3.4]]) {
    k.box(s, 0, z, 0.08, 0.72, 0.08, 0x2a2c30);
    k.box(s, 0, z, 0.5, 0.03, 0.5, 0x2a2c30);
    k.box(s, 0.72, z, 1.2, 0.04, 0.75, 0xa8aaa8);
    for (const d of [-1, 1]) sillaMimbre(k, s + d * 0.8, z, d > 0 ? -Math.PI / 2 : Math.PI / 2);
    k.block(s, z, 1.4, 0.8);
  }
  estufa(k, 9.8, 2.5);
  // la pizarra de pie de la esquina
  k.pic(S0 + 0.3, 0.7, 4.2, 0.6, 1.0, 0, 1, canvasTex(60, 100, pizarraColgada(7)));
  k.box(S0 + 0.3, 0, 4.15, 0.62, 1.2, 0.05, 0x5a4636);
}

/** se monta con lo demás de Arrecife Centro */
export function buildElJolatero(scene, colliders, map) {
  if (!map?.elJolatero) return null;
  const k = new Kit();
  fachada(k);
  terraza(k);
  const group = enMarco(k, J, 'elJolatero', colliders);
  scene.add(group);
  return { group };
}
