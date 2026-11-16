import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * La Farmacia David Mayor Gomà, en la calle Luis Morote (centro), junto al estanco de la esquina, con la foto de
 * Google Maps de junio de 2026 y la vista de la calle de julio de 2025 (solo se miran, no van dentro del
 * juego): el bajo blanco liso con la puerta de cristal y la farmacia llena de baldas dentro, las dos cajas
 * blancas de los contadores, el portero, el tablón y la rejilla; la línea de luz blanca de encima; y arriba, el
 * forro de lamas grises de lado a lado con la cruz grande dibujada con luz blanca, «farmacia» en letras verdes
 * de neón y la cruz verde de bandera. En el mapa su rótulo salía con el nombre de la Farmacia Tenorio (que está
 * en la calle León y Castillo); aquí va con el suyo. El bloque se queda como está; lo de abajo tapa su trozo.
 */

// la fachada de la calle Luis Morote (s de izquierda a derecha mirándola; la esquina del estanco cae en s 0)
const F = marco([-148.47, 484.61], [-122.74, 485.19]);
const Z = 0.12, ZF = Z + 0.3, S0 = 5.6, S1 = 10.6, P0 = 7.3, P1 = 8.9, PH = 2.45, YL = 2.92, ARRIBA = 7.2;

/** antes de levantar la ciudad: fuera el rótulo genérico de esta fachada (el que llevaba el nombre de Tenorio) */
export function tuneFarmaciaMayor(map) {
  map.farmaciaMayorSign = null;
  const i = (map.signs || []).findIndex(s => /Tenorio/.test(s.name) && Math.hypot(s.x + 144.6, s.z - 484.7) < 15);
  if (i >= 0) map.farmaciaMayorSign = map.signs.splice(i, 1)[0];
  map.farmaciaMayor = true;
}

// ——— lo que se pinta en lienzo ———

/** el forro de lamas grises, con sus rayas */
function lamas(g, w, h) {
  g.fillStyle = '#c8c8c4';
  g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 5) {
    g.fillStyle = 'rgba(0,0,0,.14)';
    g.fillRect(0, y, w, 1);
    g.fillStyle = 'rgba(255,255,255,.25)';
    g.fillRect(0, y + 1, w, 1);
  }
}

/** «farmacia» en verde de neón sobre las lamas */
function letras(g, w, h) {
  lamas(g, w, h);
  g.fillStyle = '#2ad84a';
  g.textAlign = 'left';
  g.textBaseline = 'alphabetic';
  g.font = `400 ${Math.round(h * 0.95)}px "Arial Narrow", "Segoe UI", Arial, sans-serif`;
  const m = g.measureText('farmacia').width, k = Math.min(1, (w * 0.96) / m);
  g.save(); g.translate(w * 0.02, h * 0.9); g.scale(k, 1); g.fillText('farmacia', 0, 0); g.restore();
}

/** la farmacia por la puerta: las baldas llenas de colores y la luz */
function dentro(g, w, h) {
  g.fillStyle = '#f2ecd8';
  g.fillRect(0, 0, w, h);
  const col = ['#e8d8a0', '#a8d8c8', '#f0c8b0', '#d8e8f0', '#c8e0a8', '#f8f8f4'];
  let s = 4;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let y = 0.12; y < 0.85; y += 0.09) for (let x = 0.03; x < 0.95; x += 0.05) { g.fillStyle = col[Math.floor(r() * 6)]; g.fillRect(w * x, h * y, w * 0.04, h * 0.07); }
  g.fillStyle = '#4aa89a';
  g.fillRect(w * 0.45, h * 0.35, w * 0.15, h * 0.5);
  g.fillStyle = '#d8d4cc';
  g.fillRect(0, h * 0.9, w, h * 0.1);
}

// ——— las piezas ———

/** la fachada: el bajo blanco con la puerta, la línea de luz, el forro de lamas con la cruz de luz y las letras */
function fachada(k) {
  const sm = (S0 + S1) / 2, pm = (P0 + P1) / 2;
  // el bajo blanco por delante de lo genérico, con el hueco de la puerta
  for (const [s0, s1, y0] of [[S0, P0, 0], [P1, S1, 0], [P0, P1, PH]]) k.box((s0 + s1) / 2, y0, Z + 0.15, s1 - s0, YL - y0, 0.3, 0xf4f4f2);
  k.block(sm, Z + 0.15, S1 - S0, 0.3);
  // la puerta de cristal con la farmacia dentro
  k.pic(pm, PH / 2, Z + 0.02, P1 - P0, PH, 0, 1, canvasTex(160, 240, dentro), { glow: 0.35 });
  k.glass.push(new THREE.PlaneGeometry(P1 - P0, PH).translate(pm, PH / 2, Z + 0.1));
  for (const s of [P0, P1]) k.box(s, 0, Z + 0.1, 0.06, PH, 0.08, 0xd8d8d6);
  k.box(pm, PH - 0.05, Z + 0.1, P1 - P0, 0.06, 0.08, 0xd8d8d6);
  // las cajas de los contadores, el portero, el tablón y la rejilla
  for (const [y, h] of [[0.45, 0.75], [1.35, 0.7]]) k.box(6.3, y, ZF + 0.03, 0.62, h, 0.06, 0xf8f8f6);
  k.box(9.35, 1.3, ZF + 0.03, 0.2, 0.42, 0.06, 0x3a3a3c);
  k.box(9.85, 1.4, ZF + 0.03, 0.34, 0.5, 0.06, 0xe8e8e4);
  k.box(9.85, 0.55, ZF + 0.02, 0.3, 0.2, 0.04, 0xd8d8d6);
  // la línea de luz blanca de encima del bajo
  k.box(sm, YL, ZF + 0.04, S1 - S0, 0.05, 0.06, 0xffffff, { list: k.glow });
  // el forro de lamas grises de arriba
  k.box(sm, YL + 0.05, Z + 0.22, S1 - S0, ARRIBA - YL - 0.05, 0.2, 0xc8c8c4);
  k.pic(sm, (YL + 0.05 + ARRIBA) / 2, ZF + 0.025, S1 - S0, ARRIBA - YL - 0.05, 0, 1, canvasTex(250, 210, lamas));
  // la cruz grande dibujada con luz blanca: su contorno de doce lados
  const a0 = 7.75, a1 = 9.45, b0 = 6.45, b1 = 10.5, y0 = 3.45, y1 = 4.45, y2 = 5.95, y3 = 7.0;
  const p = [[a0, y0], [a1, y0], [a1, y1], [b1, y1], [b1, y2], [a1, y2], [a1, y3], [a0, y3], [a0, y2], [b0, y2], [b0, y1], [a0, y1], [a0, y0]];
  for (let i = 0; i < p.length - 1; i++) {
    const [s1, t1] = p[i], [s2, t2] = p[i + 1];
    if (s1 === s2) k.box(s1, Math.min(t1, t2), ZF + 0.05, 0.05, Math.abs(t2 - t1), 0.04, 0xffffff, { list: k.glow });
    else k.box((s1 + s2) / 2, t1 - 0.025, ZF + 0.05, Math.abs(s2 - s1), 0.05, 0.04, 0xffffff, { list: k.glow });
  }
  // «farmacia» en verde de neón, abajo a la izquierda
  k.pic(7.0, 3.5, ZF + 0.04, 2.7, 0.85, 0, 1, canvasTex(320, 100, letras), { glow: 0.1 });
  // la cruz verde de bandera, arriba a la izquierda
  k.box(S0 + 0.15, 6.9, ZF + 0.15, 0.05, 0.05, 0.3, 0x5a5c60);
  k.box(S0 + 0.15, 6.55, ZF + 0.4, 0.1, 0.6, 0.2, 0x1eaa4a);
  k.box(S0 + 0.15, 6.75, ZF + 0.4, 0.1, 0.2, 0.6, 0x1eaa4a);
}

/** se monta con lo demás de Arrecife Centro */
export function buildFarmaciaMayor(scene, colliders, map) {
  if (!map?.farmaciaMayor) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, F, 'farmaciaMayor', colliders);
  scene.add(group);
  return { group };
}
