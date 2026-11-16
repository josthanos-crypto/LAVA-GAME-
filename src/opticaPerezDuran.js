import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * La Óptica Pérez-Durán, en la esquina de la calle Coronel Bens con Manolo Millares, con las fotos de
 * Google Maps (solo se miran, no van dentro del juego): el friso azul marino de lado a lado con «ÓPTICA
 * PÉREZ DURÁN» en letras claras y el ojo azul, los escaparates de cristal con los marcos de acero, las
 * pilastras blancas, la puerta de la esquina con sus escalones y, dentro, las baldas blancas con las
 * gafas, el mostrador de madera y las sillas verde agua. En el mapa la esquina no tiene chaflán: la puerta
 * va en la punta de la cara de Coronel Bens. Las calles llegan casi a la pared. El bloque se queda.
 */

// la cara de Coronel Bens (s desde la esquina, hacia el norte) y la de Manolo Millares (s hasta la esquina)
const C = marco([-240.9, 325.8], [-228.7, 377.5]);
const M = marco([-175.3, 320.0], [-240.9, 325.8]);
const Z = 0.12, MARINO = 0x1e2a44, ACERO = 0xb8bcc0, BLANCO = 0xf0eee8;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneOpticaPerezDuran(map) {
  map.opticaPerezDuranSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Optica Perez Duran');
  if (i >= 0) map.opticaPerezDuranSign = map.signs.splice(i, 1)[0];
  map.opticaPerezDuran = true;
}

// ——— lo que se pinta en lienzo ———

/** el friso azul marino: ÓPTICA PÉREZ DURÁN y el ojo */
function friso(g, w, h) {
  g.fillStyle = '#1e2a44';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8eef8';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `500 ${Math.round(h * 0.5)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('ÓPTICA PÉREZ DURÁN', w * 0.44, h * 0.55);
  const x = w * 0.92, y = h * 0.5, r = h * 0.36;
  g.fillStyle = '#f2f6f8';
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#2a8ac8';
  g.beginPath(); g.arc(x, y, r * 0.62, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#0e1a2a';
  g.beginPath(); g.arc(x, y, r * 0.3, 0, Math.PI * 2); g.fill();
}

/** por el escaparate: las baldas blancas con las gafas, el mostrador de madera y las sillas verde agua */
function dentro(g, w, h) {
  g.fillStyle = '#e8e4dc';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c8c0b0';
  g.fillRect(0, h * 0.8, w, h * 0.2);
  for (let y = 0.2; y < 0.6; y += 0.1) {
    g.fillStyle = '#f8f8f6';
    g.fillRect(w * 0.05, h * y, w * 0.9, h * 0.02);
    g.strokeStyle = '#2a2a2e';
    g.lineWidth = 2;
    for (let x = 0.08; x < 0.92; x += 0.07) { g.beginPath(); g.arc(w * x, h * y - h * 0.025, w * 0.012, 0, Math.PI * 2); g.arc(w * x + w * 0.03, h * y - h * 0.025, w * 0.012, 0, Math.PI * 2); g.stroke(); }
  }
  g.fillStyle = '#8a5a3a';
  g.fillRect(w * 0.55, h * 0.62, w * 0.35, h * 0.18);
  g.fillStyle = '#4ab0a8';
  for (const x of [0.15, 0.3]) { g.fillRect(w * x, h * 0.62, w * 0.08, h * 0.08); g.fillRect(w * x, h * 0.5, w * 0.08, h * 0.12); }
  g.fillStyle = 'rgba(255,255,255,.2)';
  g.fillRect(0, 0, w * 0.35, h);
}

// ——— las piezas ———

/** un tramo de fachada: escaparates y pilastras, el friso con el nombre y, si toca, la puerta con escalones */
function tramo(k, s0, s1, conPuerta) {
  const H = 2.8, sm = (s0 + s1) / 2;
  k.box(sm, 0, Z - 0.05, s1 - s0, 3.6, 0.1, BLANCO);
  // el friso azul de encima, con el nombre y el ojo
  k.box(sm, H, Z + 0.06, s1 - s0, 0.62, 0.14, MARINO);
  k.pic(sm, H + 0.31, Z + 0.135, s1 - s0 - 0.1, 0.56, 0, 1, canvasTex(640, 72, friso));
  // las pilastras blancas y los huecos de cristal con marco de acero
  const huecos = [];
  let s = s0 + 0.3;
  if (conPuerta) { huecos.push([s, s + 1.3, 0.25]); s += 1.6; }
  while (s1 - 0.3 - s > 1.2) { const e = Math.min(s + 1.9, s1 - 0.3); huecos.push([s, e, 0.45]); s = e + 0.3; }
  for (const [a, b, y0] of huecos) {
    k.pic((a + b) / 2, (y0 + H - 0.1) / 2, Z + 0.01, b - a, H - 0.1 - y0, 0, 1, canvasTex(192, 192, dentro), { glow: 0.12 });
    for (const x of [a, b]) k.box(x, y0, Z + 0.04, 0.06, H - 0.1 - y0, 0.06, ACERO);
    for (const y of [y0, H - 0.16]) k.box((a + b) / 2, y, Z + 0.04, b - a, 0.06, 0.06, ACERO);
  }
  for (let i = 0; i <= huecos.length; i++) {
    const x = i === 0 ? s0 + 0.12 : i === huecos.length ? s1 - 0.12 : (huecos[i - 1][1] + huecos[i][0]) / 2;
    k.box(x, 0, Z + 0.05, 0.24, H, 0.1, BLANCO);
  }
  if (conPuerta) {
    const [a, b] = huecos[0];
    k.box((a + b) / 2, 0, Z + 0.3, b - a + 0.3, 0.13, 0.5, 0xb8b4ac);
    k.box((a + b) / 2, 0.13, Z + 0.15, b - a + 0.3, 0.12, 0.25, 0xc8c4bc);
  }
}

/** segunda fase, como los demás de este barrio */
export function buildOpticaPerezDuran(scene, colliders, map) {
  if (!map?.opticaPerezDuran) return null;
  const group = new THREE.Group();
  group.name = 'opticaPerezDuran';
  const kC = new Kit();
  tramo(kC, 0.1, 5.2, true);
  const kM = new Kit();
  tramo(kM, M.len - 5.0, M.len - 0.1, false);
  group.add(enMarco(kC, C, 'opticaCoronelBens', colliders), enMarco(kM, M, 'opticaManoloMillares', colliders));
  scene.add(group);
  return { group };
}
