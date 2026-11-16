import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * El Centro de Belleza Millerlandi, en la calle La Inés (edificio Fajardo), con la foto de Google Maps
 * (solo se mira, no va dentro del juego): los tres paños de cristal con marco de aluminio, el vinilo negro
 * de abajo con el círculo dorado del logo y «Estética de Uñas», la puerta de cristal en medio con el
 * salón dentro, el letrero dorado «Centro de Belleza Millerlandi» en el montante, el cartel del listado
 * de servicios de la derecha, los carteles de arriba (aquí siluetas, sin las caras de la foto) y la chapa
 * de granito gris de encima. El bloque se queda como está.
 */

// la cara de la calle La Inés (s desde el extremo del sur)
const M = marco([-182.8, 68.4], [-200.9, 96.3]);
const Z = 0.12, ALUMINIO = 0xc8ccd0, GRANITO = 0x9a9a98, ORO = '#d8b050';
const S0 = 18.6, S1 = 24.6, H = 3.0;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneMillerlandi(map) {
  map.millerlandiSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Millerlandi');
  if (i >= 0) map.millerlandiSign = map.signs.splice(i, 1)[0];
  map.millerlandi = true;
}

// ——— lo que se pinta en lienzo ———

/** el círculo dorado del logo: el perfil con el pelo largo */
function logo(g, x, y, r) {
  g.strokeStyle = ORO;
  g.lineWidth = r * 0.07;
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
  g.fillStyle = ORO;
  g.beginPath(); g.ellipse(x - r * 0.1, y - r * 0.15, r * 0.22, r * 0.3, 0, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 5; i++) {
    g.lineWidth = r * 0.05;
    g.beginPath(); g.moveTo(x + r * 0.05, y - r * 0.45); g.quadraticCurveTo(x + r * (0.5 + i * 0.05), y - r * 0.1, x + r * (0.2 + i * 0.08), y + r * 0.6); g.stroke();
  }
}

/** una silueta de cartel: la cara de perfil y el pelo, en tonos claros */
function silueta(g, x, y, w, h, fondo, pelo) {
  g.fillStyle = fondo;
  g.fillRect(x, y, w, h);
  g.fillStyle = pelo;
  g.beginPath(); g.ellipse(x + w * 0.5, y + h * 0.42, w * 0.32, h * 0.4, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#f0d0b8';
  g.beginPath(); g.ellipse(x + w * 0.5, y + h * 0.5, w * 0.2, h * 0.3, 0, 0, Math.PI * 2); g.fill();
}

/** el cristal oscuro de un paño, con el reflejo de la calle */
function cristal(g, w, h, y0, y1) {
  const gr = g.createLinearGradient(0, h * y0, w, h * y1);
  gr.addColorStop(0, '#5a6066');
  gr.addColorStop(0.5, '#8a9298');
  gr.addColorStop(1, '#4a5056');
  g.fillStyle = gr;
  g.fillRect(0, h * y0, w, h * (y1 - y0));
}

/** el paño de la izquierda: el cartel de arriba, el cristal y el vinilo negro con el logo y Estética de Uñas */
function panoIzq(g, w, h) {
  silueta(g, 0, 0, w, h * 0.24, '#e8dcd0', '#5a3a2a');
  cristal(g, w, h, 0.26, 0.5);
  g.fillStyle = '#141414';
  g.fillRect(0, h * 0.5, w, h * 0.5);
  logo(g, w * 0.4, h * 0.63, w * 0.26);
  g.fillStyle = ORO;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 600 ${Math.round(w * 0.11)}px Georgia, serif`;
  g.fillText('Estética de Uñas', w / 2, h * 0.82);
  silueta(g, w * 0.05, h * 0.86, w * 0.42, h * 0.14, '#f0d8e0', '#2a1a12');
  silueta(g, w * 0.53, h * 0.86, w * 0.42, h * 0.14, '#e8e0f0', '#6a4a2a');
}

/** la puerta de en medio: el letrero dorado del montante y, por el cristal, el salón */
function puerta(g, w, h) {
  g.fillStyle = '#141414';
  g.fillRect(0, 0, w, h * 0.24);
  g.fillStyle = ORO;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  logo(g, w / 2, h * 0.07, w * 0.08);
  g.font = `400 ${Math.round(w * 0.065)}px Georgia, serif`;
  g.fillText('Centro de Belleza', w / 2, h * 0.15);
  g.font = `italic 700 ${Math.round(w * 0.1)}px Georgia, serif`;
  g.fillText('Millerlandi', w / 2, h * 0.205);
  // el salón: la pared clara, el espejo, el sillón negro y las sillas de madera
  g.fillStyle = '#d8d4cc';
  g.fillRect(0, h * 0.26, w, h * 0.74);
  g.fillStyle = '#b8c4cc';
  g.fillRect(w * 0.15, h * 0.35, w * 0.3, h * 0.25);
  g.fillStyle = '#2a2a2c';
  g.fillRect(w * 0.18, h * 0.62, w * 0.24, h * 0.16);
  g.fillStyle = '#c8a070';
  for (const x of [0.6, 0.78]) { g.fillRect(w * x, h * 0.66, w * 0.12, h * 0.03); g.fillRect(w * x, h * 0.69, w * 0.015, h * 0.12); g.fillRect(w * (x + 0.1), h * 0.69, w * 0.015, h * 0.12); }
  g.fillStyle = 'rgba(255,255,255,.18)';
  g.fillRect(0, h * 0.26, w * 0.35, h * 0.74);
}

/** el paño de la derecha: el cartel de arriba, el listado de servicios y el vinilo negro con el nombre */
function panoDer(g, w, h) {
  silueta(g, 0, 0, w, h * 0.24, '#d8e8e8', '#3a2a1e');
  cristal(g, w, h, 0.26, 0.6);
  // el listado de servicios
  g.fillStyle = '#f2f0ea';
  g.fillRect(w * 0.08, h * 0.3, w * 0.6, h * 0.28);
  g.fillStyle = '#e8c040';
  g.fillRect(w * 0.08, h * 0.3, w * 0.6, h * 0.04);
  g.fillStyle = '#4a4a4a';
  for (let y = 0.37; y < 0.56; y += 0.025) g.fillRect(w * 0.12, h * y, w * 0.48, h * 0.008);
  g.fillStyle = '#141414';
  g.fillRect(0, h * 0.6, w, h * 0.4);
  g.fillStyle = ORO;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `400 ${Math.round(w * 0.075)}px Georgia, serif`;
  g.fillText('Centro de Belleza Millerlandi', w / 2, h * 0.72);
  g.font = `400 ${Math.round(w * 0.05)}px Arial, sans-serif`;
  g.fillText('CITA PREVIA', w / 2, h * 0.8);
}

// ——— las piezas ———

/** el frente de cristal del centro de belleza */
function frente(k) {
  const sm = (S0 + S1) / 2, w = (S1 - S0) / 3;
  // la chapa de granito gris de alrededor
  k.box(sm, 0, Z - 0.05, S1 - S0 + 1.0, 4.0, 0.1, GRANITO);
  // los tres paños, de abajo arriba
  const fs = [panoIzq, puerta, panoDer];
  for (let i = 0; i < 3; i++) {
    const a = S0 + i * w;
    k.pic(a + w / 2, H / 2, Z + 0.005, w - 0.08, H, 0, 1, canvasTex(192, 288, fs[i]), { glow: i === 1 ? 0.12 : 0.04 });
  }
  // los marcos de aluminio: montantes, el travesaño del montante y el de abajo
  for (let i = 0; i <= 3; i++) k.box(S0 + i * w, 0, Z + 0.03, 0.08, H, 0.07, ALUMINIO);
  for (const y of [0, H * 0.75, H - 0.06]) k.box(sm, y, Z + 0.03, S1 - S0, 0.07, 0.07, ALUMINIO);
  // la manilla de la puerta
  k.box(S0 + w * 1.15, 0.9, Z + 0.1, 0.03, 0.4, 0.03, 0x8a8c90);
}

/** segunda fase, como los demás de este barrio */
export function buildMillerlandi(scene, colliders, map) {
  if (!map?.millerlandi) return null;
  const k = new Kit();
  frente(k);
  const group = enMarco(k, M, 'millerlandi', colliders);
  scene.add(group);
  return { group };
}
