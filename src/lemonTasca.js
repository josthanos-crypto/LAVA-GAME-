import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, sombrillaGrande } from './restaurantesCharco.js';

/**
 * Lemon Tasca (el «Lemon Bar» del mapa), en el paseo de la avenida César Manrique, frente al Charco de San Ginés
 * (centro), con las fotos de Google Maps de 2024 a 2025 (solo se miran, no van dentro del juego; la gente no se
 * pone): la casa blanca de puertas y ventanas azules se queda como está; abajo, la puerta de la tasca con el
 * comedor dentro (las paredes blancas, la barra de madera, las cornamentas y «Lemon Tasca» pintado) y la ventana
 * de lamas azules; y en el paseo, la terraza: la caseta de madera oscura con la celosía arriba, las ventanillas de
 * cristal y el letrero de madera de «Lemon Tasca» en la esquina, las mesas negras con sillas de metal, las
 * sombrillas blancas y la pizarra de pie. La pizarra de la carta lleva platos y precios y se deja sin letras.
 */

// la cara del paseo de la casa (s de este a oeste); Google pone la tasca en s 15,6 (el rótulo del mapa caía en s 21)
const M = marco([268.33, 258.9], [241.95, 248.7]);
const Z = 0.12, ZF = Z + 0.3, AZUL = 0x1e4aa8, MADERA = 0x3a2a20;

/** antes de levantar la ciudad: fuera el rótulo genérico (y su terraza genérica) */
export function tuneLemonTasca(map) {
  map.lemonTascaSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Lemon Bar' && Math.hypot(s.x - 248.6, s.z - 251.3) < 15);
  if (i >= 0) map.lemonTascaSign = map.signs.splice(i, 1)[0];
  map.lemonTasca = true;
}

// ——— lo que se pinta en lienzo ———

/** el comedor por la puerta: paredes blancas, la barra de madera, las cornamentas y el nombre pintado */
function comedor(g, w, h) {
  g.fillStyle = '#f2ece2';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#7a5a3a';
  g.lineWidth = 3;
  for (const x of [0.25, 0.7]) {
    g.beginPath(); g.moveTo(w * x, h * 0.2); g.lineTo(w * (x - 0.12), h * 0.08); g.moveTo(w * x, h * 0.2); g.lineTo(w * (x + 0.12), h * 0.08);
    g.moveTo(w * (x - 0.06), h * 0.14); g.lineTo(w * (x - 0.1), h * 0.04); g.moveTo(w * (x + 0.06), h * 0.14); g.lineTo(w * (x + 0.1), h * 0.04); g.stroke();
  }
  g.fillStyle = '#8a3a1a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 700 ${Math.round(h * 0.07)}px Georgia, serif`;
  g.fillText('Lemon', w * 0.5, h * 0.3);
  g.fillStyle = '#6a3a1e';
  g.fillRect(0, h * 0.55, w, h * 0.25);
  g.fillStyle = '#4a2a16';
  g.fillRect(0, h * 0.53, w, h * 0.03);
  g.fillStyle = '#8a5a3a';
  g.fillRect(0, h * 0.8, w, h * 0.2);
  g.fillStyle = 'rgba(0,0,0,.15)';
  g.fillRect(0, 0, w, h);
}

/** la ventana de lamas azules */
function lamas(g, w, h) {
  g.fillStyle = '#1e4aa8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#163a88';
  for (let y = 6; y < h; y += 10) g.fillRect(4, y, w - 8, 4);
}

/** la caseta de madera: la celosía de arriba */
function celosia(g, w, h) {
  g.fillStyle = '#2a1e16';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#8a6a4a';
  g.lineWidth = 2;
  for (let x = -h; x < w; x += 10) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + h, h); g.stroke(); g.beginPath(); g.moveTo(x + h, 0); g.lineTo(x, h); g.stroke(); }
}

/** las ventanillas de cristal de la caseta, con los cañizos dorados detrás */
function ventanilla(g, w, h) {
  g.fillStyle = '#3a2a20';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c8a050';
  for (let x = 4; x < w; x += 6) g.fillRect(x, 4, 3, h - 8);
  g.fillStyle = 'rgba(220,230,240,.25)';
  g.fillRect(0, 0, w, h);
}

/** el letrero de madera de «Lemon Tasca» */
function letrero(g, w, h) {
  g.fillStyle = '#3a2a20';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8c88a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 700 ${Math.round(h * 0.34)}px Georgia, "Times New Roman", serif`;
  g.fillText('Lemon', w / 2, h * 0.38);
  g.font = `italic 400 ${Math.round(h * 0.22)}px Georgia, "Times New Roman", serif`;
  g.fillText('Tasca', w / 2, h * 0.7);
}

/** la pizarra de pie, sin letras */
function pizarra(g, w, h) {
  g.fillStyle = '#1e2a3a';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d8d8d4';
  g.lineWidth = 2;
  for (let y = 0.2; y < 0.9; y += 0.09) { g.beginPath(); g.moveTo(w * 0.15, h * y); g.lineTo(w * (0.45 + ((y * 9) % 0.4)), h * y); g.stroke(); }
}

// ——— las piezas ———

/** abajo, en la casa: la puerta de la tasca y la ventana de lamas */
function fachada(k) {
  k.box(16.2, 0, Z + 0.15, 4.4, 3.2, 0.3, 0xf4f4f0);
  k.block(16.2, Z + 0.15, 4.4, 0.3);
  k.pic(15.4, 1.15, Z + 0.32, 1.3, 2.3, 0, 1, canvasTex(130, 230, comedor), { glow: 0.25 });
  for (const t of [14.7, 16.1]) k.box(t, 0, ZF + 0.02, 0.1, 2.35, 0.08, AZUL);
  k.box(15.4, 2.3, ZF + 0.02, 1.5, 0.1, 0.08, AZUL);
  k.pic(17.4, 1.5, ZF + 0.01, 1.2, 1.1, 0, 1, canvasTex(120, 110, lamas));
  k.box(17.4, 0.92, ZF + 0.03, 1.3, 0.06, 0.1, 0xe8e6e0);
}

/** en el paseo: la caseta de madera, las mesas, las sombrillas y la pizarra */
function terraza(k) {
  // la caseta: un cuadrado de madera oscura con ventanillas abajo y celosía arriba, abierta hacia la casa
  const c0 = 18.6, c1 = 21.0, z0 = ZF + 1.2, z1 = ZF + 3.2, alto = 2.1;
  const ct = canvasTex(160, 50, celosia), vt = canvasTex(120, 60, ventanilla);
  const lados = [[(c0 + c1) / 2, z1, c1 - c0, 0, 1], [c0, (z0 + z1) / 2, z1 - z0, -1, 0], [c1, (z0 + z1) / 2, z1 - z0, 1, 0]];
  for (const [s, z, l, nx, nz] of lados) {
    const w = nx ? 0.06 : l, d = nx ? l : 0.06;
    k.box(s, 0, z, w, 0.9, d, MADERA);
    k.box(s, 1.45, z, w, alto - 1.45, d, MADERA);
    k.pic(s + nx * 0.035, 1.17, z + nz * 0.035, l - 0.1, 0.52, nx, nz, vt);
    k.pic(s + nx * 0.035, 1.78, z + nz * 0.035, l - 0.1, 0.6, nx, nz, ct);
    k.block(s, z, w + 0.04, d + 0.04);
  }
  for (const [s, z] of [[c0, z0], [c1, z0], [c0, z1], [c1, z1]]) k.box(s, 0, z, 0.1, alto + 0.05, 0.1, 0x2a1e16);
  k.box((c0 + c1) / 2, alto, (z0 + z1) / 2, c1 - c0 + 0.1, 0.06, z1 - z0 + 0.1, 0x2a1e16);
  // el letrero de madera en la esquina, mirando al paseo
  k.box(c1 - 0.45, alto - 0.05, z1 + 0.06, 0.8, 0.5, 0.05, MADERA);
  k.pic(c1 - 0.45, alto + 0.2, z1 + 0.09, 0.78, 0.48, 0, 1, canvasTex(160, 100, letrero));
  // las mesas negras con sillas de metal, debajo de las sombrillas blancas
  for (const s of [12.4, 15.6]) sombrillaGrande(k, s, ZF + 2.4, 0xf2f0ea);
  for (const [s, z] of [[11.6, 1.8], [13.2, 1.8], [14.8, 1.8], [16.4, 1.8], [11.6, 3.0], [13.2, 3.0], [14.8, 3.0], [16.4, 3.0]]) {
    k.table(s, ZF + z, { w: 0.7, d: 0.7, h: 0.75, top: 0x1e1e20, leg: 0x2a2a2c });
    k.chair(s, ZF + z - 0.52, 0, 0x5a5e66, { legs: 0x3a3c40 });
    k.chair(s, ZF + z + 0.52, Math.PI, 0x5a5e66, { legs: 0x3a3c40 });
    k.block(s, ZF + z, 0.7, 0.7);
  }
  // la pizarra de pie, junto a la puerta
  const p = new THREE.BoxGeometry(0.55, 1.0, 0.04);
  p.rotateX(-0.2);
  p.translate(14.2, 0.5, ZF + 0.55);
  k.add(p, 0x6a4a2a);
  k.pic(14.2, 0.52, ZF + 0.66, 0.48, 0.9, 0, 1, canvasTex(80, 140, pizarra));
  k.block(14.2, ZF + 0.5, 0.6, 0.4);
}

/** se monta con lo demás de Arrecife Centro */
export function buildLemonTasca(scene, colliders, map) {
  if (!map?.lemonTasca) return null;
  const k = new Kit();
  fachada(k);
  terraza(k);
  const group = enMarco(k, M, 'lemonTasca', colliders);
  scene.add(group);
  return { group };
}
