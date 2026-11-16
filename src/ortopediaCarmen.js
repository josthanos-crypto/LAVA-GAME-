import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * La Ortopedia Carmen, en la carretera de San Bartolomé 5 (Argana Alta), con la foto de Google Maps de julio de
 * 2019 (solo se mira, no va dentro del juego; la gente de la foto no se pone): la pared gris clara con el
 * recerco de granito gris alrededor del hueco; dentro, el marco rojo, la caja roja de la persiana subida y la
 * entrada de cristal con las dos hojas fijas de marco rojo y la puerta abierta en medio, con la tienda blanca
 * y luminosa al fondo (las sillas de ruedas, el mostrador); los dos escalones de granito; y encima, el logo
 * redondo verde azulado con el árbol blanco, «ortopedia» en letras finas y «CARMEN» en letras blancas grandes.
 * El bloque se queda como está.
 */

// la fachada de la carretera (s desde la esquina del este); el rótulo del mapa cae en s 19,6
const O = marco([-1385.77, -935.66], [-1419.88, -963.63]);
const Z = 0.12, S0 = 17.2, S1 = 22.0, ROJO = 0xc8282e, GRANITO = 0xb8b8b4, GRIS = 0xa6a8aa;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneOrtopediaCarmen(map) {
  map.ortopediaCarmenSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Ortopedia Carmen');
  if (i >= 0) map.ortopediaCarmenSign = map.signs.splice(i, 1)[0];
  map.ortopediaCarmen = true;
}

// ——— lo que se pinta en lienzo ———

/** el rótulo: el logo redondo con el árbol, «ortopedia» y «CARMEN» en blanco, sobre la pared gris */
function rotulo(g, w, h) {
  g.fillStyle = '#a6a8aa';
  g.fillRect(0, 0, w, h);
  // el logo: el círculo verde azulado con el borde rojizo y el árbol blanco
  const cx = h * 0.5, cy = h * 0.5, r = h * 0.42;
  g.fillStyle = '#c86a4a';
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#2a6a6a';
  g.beginPath(); g.arc(cx, cy, r * 0.9, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#f2f2ee';
  g.lineWidth = h * 0.04;
  g.beginPath(); g.moveTo(cx, cy + r * 0.7); g.bezierCurveTo(cx - r * 0.2, cy + r * 0.2, cx + r * 0.2, cy - r * 0.1, cx, cy - r * 0.4); g.stroke();
  g.fillStyle = '#f2f2ee';
  for (const [dx, dy, e] of [[-0.3, -0.45, 0.16], [0.25, -0.5, 0.15], [0, -0.65, 0.17], [-0.4, -0.2, 0.12], [0.38, -0.25, 0.12]]) {
    g.beginPath(); g.arc(cx + dx * r, cy + dy * r, e * r, 0, Math.PI * 2); g.fill();
  }
  // las letras: «ortopedia» fina con su raya roja debajo, y «CARMEN» grande
  g.textAlign = 'left';
  g.textBaseline = 'alphabetic';
  g.fillStyle = '#f6f6f2';
  g.font = `400 ${Math.round(h * 0.3)}px "Century Gothic", "Segoe UI", Arial, sans-serif`;
  g.fillText('ortopedia', h * 1.1, h * 0.38);
  g.fillStyle = '#c86a4a';
  g.fillRect(h * 1.1, h * 0.43, w - h * 1.2, h * 0.03);
  g.fillStyle = '#f6f6f2';
  g.font = `700 ${Math.round(h * 0.5)}px "Century Gothic", "Segoe UI", Arial, sans-serif`;
  g.fillText('CARMEN', h * 1.1, h * 0.94);
}

/** la tienda por la entrada: el techo blanco con los focos, el mostrador, las sillas de ruedas y las baldas */
function tienda(g, w, h) {
  g.fillStyle = '#eceae6';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f8f8f6';
  g.fillRect(0, 0, w, h * 0.18);
  g.fillStyle = '#fff6d8';
  for (const x of [0.2, 0.5, 0.8]) { g.beginPath(); g.arc(w * x, h * 0.1, 3, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#d8d6d2';
  g.fillRect(0, h * 0.8, w, h * 0.2);
  g.fillStyle = '#c8b898';
  g.fillRect(w * 0.15, h * 0.55, w * 0.3, h * 0.08);
  g.fillStyle = '#3a3a40';
  g.fillRect(w * 0.2, h * 0.63, w * 0.03, h * 0.17);
  // las sillas de ruedas: las ruedas grandes y el asiento
  g.strokeStyle = '#3a3a3c';
  g.lineWidth = 2;
  for (const x of [0.55, 0.72, 0.88]) {
    g.beginPath(); g.arc(w * x, h * 0.72, h * 0.08, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#2a2a2e';
    g.fillRect(w * (x - 0.05), h * 0.6, w * 0.07, h * 0.04);
  }
  g.fillStyle = '#e8c83a';
  g.fillRect(w * 0.7, h * 0.5, w * 0.06, h * 0.06);
  g.fillStyle = '#b8c8d8';
  for (let y = 0.25; y < 0.55; y += 0.1) g.fillRect(w * 0.6, h * y, w * 0.35, h * 0.015);
}

/** el granito gris del recerco */
function granito(g, w, h) {
  g.fillStyle = '#b8b8b4';
  g.fillRect(0, 0, w, h);
  let s = 4;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 600; i++) { const v = 120 + r() * 110; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(r() * w, r() * h, 1.5, 1.5); }
}

// ——— las piezas ———

/** la ortopedia: la pared, el recerco de granito, el marco rojo, la persiana, la entrada, los escalones y el rótulo */
function fachada(k) {
  const sm = (S0 + S1) / 2, a = S0 + 0.65, b = S1 - 0.65, yH = 3.2, gr = canvasTex(64, 64, granito);
  // la pared gris clara de la planta baja
  k.box(sm, 0, Z - 0.03, S1 - S0, 4.6, 0.04, GRIS);
  // el recerco de granito alrededor del hueco
  for (const [x, w] of [[a - 0.22, 0.44], [b + 0.22, 0.44]]) {
    k.box(x, 0, Z + 0.02, w, yH + 0.3, 0.1, GRANITO);
    k.pic(x, (yH + 0.3) / 2, Z + 0.075, w, yH + 0.3, 0, 1, gr);
  }
  k.box(sm, yH, Z + 0.02, b - a + 0.88, 0.3, 0.1, GRANITO);
  k.pic(sm, yH + 0.15, Z + 0.075, b - a + 0.88, 0.3, 0, 1, gr);
  // el marco rojo y la caja roja de la persiana subida
  for (const s of [a + 0.05, b - 0.05]) k.box(s, 0.3, Z + 0.06, 0.1, yH - 0.3, 0.1, ROJO);
  k.box(sm, yH - 0.55, Z + 0.1, b - a, 0.55, 0.2, ROJO);
  // la tienda al fondo y la entrada: dos hojas fijas de cristal con marco rojo y la puerta abierta en medio
  k.pic(sm, 0.3 + (yH - 0.85) / 2, Z + 0.0, b - a, yH - 0.85, 0, 1, canvasTex(260, 180, tienda), { glow: 0.25 });
  const h0 = a + 0.1, h1 = h0 + 0.85, h3 = b - 0.1, h2 = h3 - 0.85;
  for (const [x0, x1] of [[h0, h1], [h2, h3]]) {
    k.glass.push(new THREE.PlaneGeometry(x1 - x0, yH - 0.95).translate((x0 + x1) / 2, 0.3 + (yH - 0.95) / 2, Z + 0.05));
    for (const s of [x0, x1]) k.box(s, 0.3, Z + 0.05, 0.08, yH - 0.85, 0.08, ROJO);
    for (const y of [0.3, yH - 0.62]) k.box((x0 + x1) / 2, y, Z + 0.05, x1 - x0, 0.08, 0.08, ROJO);
    k.block((x0 + x1) / 2, Z + 0.05, x1 - x0, 0.1);
  }
  k.box(h1 + 0.1, yH - 0.62, Z + 0.05, h2 - h1 - 0.2, 0.08, 0.08, ROJO);
  // los papeles pegados en los cristales y el buzón blanco de la derecha
  for (const s of [h0 + 0.4, h3 - 0.4]) k.box(s, 1.9, Z + 0.06, 0.3, 0.22, 0.01, 0xf8f8f6);
  k.box(b - 0.2, 1.4, Z + 0.1, 0.22, 0.3, 0.1, 0xf2f2ee);
  // los dos escalones de granito
  for (const [y, d] of [[0, 0.75], [0.15, 0.4]]) {
    k.box(sm, y, Z + d / 2, b - a + 0.6, 0.15, d, GRANITO);
  }
  // encima, el rótulo con el logo y las letras
  k.pic(sm + 0.2, yH + 0.95, Z + 0.02, 4.4, 1.15, 0, 1, canvasTex(560, 146, rotulo));
}

/** se monta con lo demás de Argana Alta */
export function buildOrtopediaCarmen(scene, colliders, map) {
  if (!map?.ortopediaCarmen) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, O, 'ortopediaCarmen', colliders);
  scene.add(group);
  return { group };
}
