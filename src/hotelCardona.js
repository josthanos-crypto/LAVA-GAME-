import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * El Hotel Residencia Cardona, en la calle Democracia, con la foto de Google Maps (solo se mira, no va
 * dentro del juego): la entrada con el ventanal alto de dos plantas rematado en arco de abanico, los
 * marcos color bronce con sus montantes, las puertas de cristal de abajo con el reflejo del cielo, la
 * pared blanca de alrededor y el cartel vertical color teja con «CARDONA» en letras claras, de canto a la
 * fachada. El hotel sigue en la lista de hoteles del mapa del juego; solo se quita el rótulo genérico de
 * la pared. El bloque se queda como está.
 */

// la cara oeste del bloque, a la calle Democracia (s desde la esquina del sur)
const C = marco([-363.9, 388.1], [-364.7, 430.3]);
const Z = 0.12, BRONCE = 0x6a4a2e, BLANCO = 0xf2f0ea;
const S0 = 7.3, S1 = 11.3, ALTO = 5.6, R = (S1 - S0) / 2;

/** antes de levantar la ciudad: fuera el rótulo genérico (la lista de hoteles del mapa no lo usa) */
export function tuneHotelCardona(map) {
  map.hotelCardonaSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Pensión Cardona');
  if (i >= 0) map.hotelCardonaSign = map.signs.splice(i, 1)[0];
  map.hotelCardona = true;
}

// ——— lo que se pinta en lienzo ———

/** el ventanal: lo blanco de alrededor del arco, el cristal con el cielo y las barras de bronce del abanico */
function ventanal(g, w, h) {
  g.fillStyle = '#f2f0ea';
  g.fillRect(0, 0, w, h);
  const r = w / 2, yc = r;
  // el cristal: el arco de arriba y lo recto de abajo
  const cielo = g.createLinearGradient(0, 0, w, h);
  cielo.addColorStop(0, '#5a7aa8');
  cielo.addColorStop(0.4, '#9ab4d0');
  cielo.addColorStop(0.7, '#4a5a6a');
  cielo.addColorStop(1, '#2a3038');
  g.fillStyle = cielo;
  g.beginPath(); g.arc(r, yc, r - 4, Math.PI, 0); g.lineTo(w - 4, h); g.lineTo(4, h); g.closePath(); g.fill();
  // el abanico: las barras que salen del centro de abajo del arco
  g.strokeStyle = '#6a4a2e';
  g.lineWidth = 5;
  for (let i = 1; i < 8; i++) {
    const a = Math.PI + (i / 8) * Math.PI;
    g.beginPath(); g.moveTo(r + Math.cos(a) * r * 0.3, yc + Math.sin(a) * r * 0.3); g.lineTo(r + Math.cos(a) * (r - 4), yc + Math.sin(a) * (r - 4)); g.stroke();
  }
  g.beginPath(); g.arc(r, yc, r * 0.3, Math.PI, 0); g.stroke();
  g.beginPath(); g.arc(r, yc, r * 0.68, Math.PI, 0); g.stroke();
  g.lineWidth = 8;
  g.beginPath(); g.arc(r, yc, r - 4, Math.PI, 0); g.stroke();
  // el reflejo de la casa de enfrente en lo de abajo
  g.fillStyle = 'rgba(240,240,236,.25)';
  g.fillRect(w * 0.12, h * 0.55, w * 0.3, h * 0.3);
}

/** el cartel vertical: CARDONA letra a letra, en claro sobre color teja */
function cartel(g, w, h) {
  g.fillStyle = '#9a4a2a';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#e8d8b8';
  g.lineWidth = 3;
  g.strokeRect(5, 5, w - 10, h - 10);
  g.fillStyle = '#f2e6cc';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(w * 0.55)}px Georgia, serif`;
  const t = 'CARDONA';
  for (let i = 0; i < t.length; i++) g.fillText(t[i], w / 2, h * (0.09 + i * 0.13));
}

// ——— las piezas ———

/** la entrada del hotel */
function entrada(k) {
  // la pared blanca de alrededor
  k.box((S0 + S1) / 2, 0, Z - 0.05, S1 - S0 + 2.4, 6.8, 0.1, BLANCO);
  // el ventanal y sus marcos de bronce
  k.pic((S0 + S1) / 2, ALTO / 2, Z + 0.01, S1 - S0, ALTO, 0, 1, canvasTex(256, 358, ventanal));
  for (const s of [S0, S1]) k.box(s, 0, Z + 0.04, 0.14, ALTO - R, 0.1, BRONCE);
  for (const s of [S0 + 1.0, (S0 + S1) / 2, S1 - 1.0]) k.box(s, 0, Z + 0.04, 0.07, ALTO - R, 0.07, BRONCE);
  for (const y of [0, 2.5, ALTO - R - 0.07]) k.box((S0 + S1) / 2, y, Z + 0.04, S1 - S0, 0.08, 0.08, BRONCE);
  // el escalón de la entrada
  k.box((S0 + S1) / 2, 0, Z + 0.2, S1 - S0 + 0.4, 0.1, 0.35, 0xc8c0b4);
  // el cartel vertical, de canto a la fachada, arriba a la izquierda
  const s = S0 - 0.5;
  k.box(s, 4.6, Z + 0.32, 0.08, 2.3, 0.5, 0x7a3a22);
  for (const nx of [1, -1]) k.pic(s + nx * 0.045, 5.75, Z + 0.32, 0.46, 2.2, nx, 0, canvasTex(64, 300, cartel));
  for (const y of [4.8, 6.6]) k.box(s, y, Z + 0.06, 0.04, 0.04, 0.12, 0x2a2a2a);
}

/** segunda fase, como los demás de este barrio */
export function buildHotelCardona(scene, colliders, map) {
  if (!map?.hotelCardona) return null;
  const k = new Kit();
  entrada(k);
  const group = enMarco(k, C, 'hotelCardona', colliders);
  scene.add(group);
  return { group };
}
