import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * La fábrica de cerveza Dos Cabras (Dos Cabras Brewing Company), en la carretera de San Bartolomé, junto a la
 * LZ-20 (Argana Alta), con la vista de la calle de Google de julio de 2025 y la foto del portón de febrero de
 * 2023 (solo se miran, no van dentro del juego): la nave blanca, más alta que el local de al lado, con su
 * albardilla gris oscura; el bajante, las cajas color crema de los contadores y el piloto rojo de la alarma; el
 * portón seccional blanco de lamas con el dibujo de la cabra en negro, «DOS||CABRAS» y «LANZAROTE | CRAFT
 * BEER»; y a la derecha, la puerta blanca pequeña. El bloque se queda como está; la nave tapa su trozo.
 */

// la fachada de la carretera (s de izquierda a derecha mirándola); el rótulo del mapa cae en s 8,6
const D = marco([-1517.59, -1051], [-1541.28, -1070.38]);
const Z = 0.12, S0 = 9.5, S1 = 19.5, ZF = Z + 0.45, BLANCO = 0xf2f1ec, OSCURO = 0x4a4c50, ALTO = 6.4;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneDosCabras(map) {
  map.dosCabrasSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Dos Cabras');
  if (i >= 0) map.dosCabrasSign = map.signs.splice(i, 1)[0];
  map.dosCabras = true;
}

// ——— lo que se pinta en lienzo ———

/** el portón: las lamas blancas, la cabra dibujada en negro y las letras */
function porton(g, w, h) {
  g.fillStyle = '#eeeeec';
  g.fillRect(0, 0, w, h);
  // las juntas de las lamas
  for (let y = h / 9; y < h; y += h / 9) {
    g.fillStyle = 'rgba(0,0,0,.16)';
    g.fillRect(0, y, w, 2);
    g.fillStyle = 'rgba(255,255,255,.7)';
    g.fillRect(0, y + 2, w, 1);
  }
  // la cabra: la cabeza de líneas, los ojos, las orejas, los cuernos y las rayitas de encima
  const cx = w * 0.5, cy = h * 0.3, r = h * 0.13;
  g.strokeStyle = '#1c1c1e';
  g.lineWidth = Math.max(3, h * 0.014);
  g.lineJoin = 'round';
  g.beginPath();
  g.moveTo(cx - r * 1.5, cy + r * 0.2);
  g.lineTo(cx - r * 0.2, cy - r * 0.6);
  g.lineTo(cx + r * 0.9, cy - r * 0.3);
  g.lineTo(cx + r * 1.5, cy + r * 0.5);
  g.lineTo(cx + r * 0.3, cy + r * 1.1);
  g.lineTo(cx - r * 1.2, cy + r * 1.0);
  g.closePath();
  g.stroke();
  for (const dx of [-0.45, 0.45]) {
    g.beginPath(); g.arc(cx + dx * r, cy + r * 0.25, r * 0.28, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(cx + dx * r - r * 0.14, cy + r * 0.25); g.lineTo(cx + dx * r + r * 0.14, cy + r * 0.25); g.stroke();
  }
  g.beginPath(); g.moveTo(cx - r * 1.2, cy + r * 1.0); g.lineTo(cx - r * 1.4, cy + r * 1.35); g.lineTo(cx - r * 0.7, cy + r * 1.05); g.stroke();
  g.beginPath(); g.moveTo(cx + r * 1.5, cy + r * 0.5); g.quadraticCurveTo(cx + r * 1.9, cy + r * 0.9, cx + r * 1.6, cy + r * 1.2); g.stroke();
  g.beginPath(); g.arc(cx + r * 0.05, cy - r * 0.75, r * 0.32, Math.PI * 1.05, Math.PI * 2.1); g.stroke();
  for (const [x0, y0, x1, y1] of [[-0.3, -1.25, -0.4, -1.6], [0.05, -1.3, 0.05, -1.7], [0.4, -1.2, 0.55, -1.55]]) {
    g.beginPath(); g.moveTo(cx + x0 * r, cy + y0 * r); g.lineTo(cx + x1 * r, cy + y1 * r); g.stroke();
  }
  // «DOS||CABRAS» grande y, debajo, «LANZAROTE | CRAFT BEER» fino
  g.fillStyle = '#1c1c1e';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `900 ${Math.round(h * 0.12)}px "Arial Black", "Segoe UI", Arial, sans-serif`;
  const mD = g.measureText('DOS').width, mC = g.measureText('CABRAS').width, hueco = h * 0.07;
  const total = mD + hueco + mC, k = Math.min(1, (w * 0.86) / total);
  g.save();
  g.translate(w * 0.5 - (total * k) / 2, h * 0.6);
  g.scale(k, 1);
  g.textAlign = 'left';
  g.fillText('DOS', 0, 0);
  g.fillText('CABRAS', mD + hueco, 0);
  // las dos rayas de entre las palabras
  for (const d of [0.25, 0.6]) g.fillRect(mD + hueco * d - h * 0.006, -h * 0.05, h * 0.012, h * 0.1);
  g.restore();
  g.textAlign = 'center';
  g.font = `400 ${Math.round(h * 0.042)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('LANZAROTE  |  CRAFT BEER', w * 0.5, h * 0.7);
}

// ——— las piezas ———

/** la nave: la pared blanca con su albardilla, el bajante, los contadores, el portón y la puerta pequeña */
function fachada(k) {
  const sm = (S0 + S1) / 2, L = S1 - S0, p0 = 13.4, p1 = 17.9, ph = 4.6;
  // la pared blanca de la nave (por delante de lo genérico del bloque) y el peto hasta arriba
  for (const [s0, s1, y0, y1] of [[S0, p0, 0, ALTO], [p1, S1, 0, ALTO], [p0, p1, ph, ALTO]]) {
    k.box((s0 + s1) / 2, y0, Z + 0.2, s1 - s0, y1 - y0, 0.5, BLANCO);
  }
  k.box(sm, ALTO, Z + 0.2, L + 0.1, 0.16, 0.6, OSCURO);
  k.box(sm, ALTO - 0.02, ZF - 0.02, L + 0.1, 0.06, 0.08, OSCURO);
  k.block(sm, Z + 0.2, L, 0.5);
  // el bajante gris de la esquina de la izquierda
  k.cyl(S0 + 0.2, 0, ZF + 0.06, 0.05, 0.05, ALTO, 0x9a9c9e, { seg: 8 });
  // las cajas color crema de los contadores y el piloto rojo de la alarma
  for (const [y, h] of [[0.5, 0.75], [1.35, 0.75]]) k.box(11.1, y, ZF + 0.08, 1.1, h, 0.16, 0xe4d8b8);
  k.box(11.1, 2.15, ZF + 0.03, 0.06, 2.0, 0.06, 0x9a9c9e);
  k.box(12.4, 4.6, ZF + 0.05, 0.22, 0.28, 0.1, 0xc81e1e);
  // el portón seccional en su hueco, con el marco de acero gris
  k.box((p0 + p1) / 2, 0, Z + 0.2, p1 - p0, ph, 0.3, 0xdcdcda);
  k.pic((p0 + p1) / 2, ph / 2, ZF - 0.09, p1 - p0, ph, 0, 1, canvasTex(460, 470, porton));
  for (const s of [p0 - 0.06, p1 + 0.06]) k.box(s, 0, ZF - 0.05, 0.12, ph + 0.1, 0.14, 0x8a8c90);
  k.box((p0 + p1) / 2, ph, ZF - 0.05, p1 - p0 + 0.24, 0.12, 0.14, 0x8a8c90);
  k.box(p1 - 0.3, 0.45, ZF - 0.07, 0.1, 0.16, 0.04, 0x2a2a2c);
  // la puerta blanca pequeña de la derecha, con su marco
  k.box(18.75, 0, ZF + 0.01, 0.85, 2.1, 0.04, 0xf6f6f4);
  for (const s of [18.3, 19.2]) k.box(s, 0, ZF + 0.02, 0.06, 2.15, 0.06, 0xb8bab8);
  k.box(18.75, 2.1, ZF + 0.02, 0.96, 0.06, 0.06, 0xb8bab8);
  k.box(18.45, 1.0, ZF + 0.05, 0.04, 0.14, 0.05, 0x8a8c90);
}

/** se monta con lo demás de Argana Alta */
export function buildDosCabras(scene, colliders, map) {
  if (!map?.dosCabras) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, D, 'dosCabras', colliders);
  scene.add(group);
  return { group };
}
