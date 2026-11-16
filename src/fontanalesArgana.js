import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * La Churrería Fontanales de Argana, en la calle Tajaraste 24 (frente a la glorieta de la calle Campoamor), con
 * la foto de Google Maps de agosto de 2016 (solo se mira, no va dentro del juego; la gente de la foto no se pone):
 * la casa color crema con la visera corrida de la planta baja; encima, sobre sus escuadras de acero, el letrero
 * azul de borde blanco con la taza en su círculo dorado, «CHURRERIA - HAMBURGUESERIA» y «FONTANALES» en dorado;
 * debajo, la terraza cerrada de dos tramos con el faldón naranja arriba, el plástico transparente y el panel
 * naranja abajo, y entre los dos la entrada abierta con la puerta de cristal y las mesas de hierro negro. El
 * letrero del otro local de al lado no se pone (no se lee bien). El bloque se queda como está.
 */

// la fachada de la calle Tajaraste (s de izquierda a derecha mirándola); el rótulo del mapa cae en s 33,3
const F = marco([-2012.31, -1826.4], [-2055.19, -1807.84]);
const Z = 0.12, NARANJA = 0xe0702a, CREMA = 0xe6d8c4, FUERA = 2.1, VISERA = 2.9;
const B0 = 31.0, B1 = 34.6, E1 = 36.6, B2 = 40.6;

/** antes de levantar la ciudad: fuera el rótulo genérico (y su terraza genérica: lleva la suya) */
export function tuneFontanalesArgana(map) {
  map.fontanalesArganaSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Cafeteria Fontanales');
  if (i >= 0) map.fontanalesArganaSign = map.signs.splice(i, 1)[0];
  map.fontanalesArgana = true;
}

// ——— lo que se pinta en lienzo ———

/** el letrero azul: el borde blanco, la taza en su círculo dorado y las letras */
function letrero(g, w, h) {
  g.fillStyle = '#f4f4f0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#2a2a7a';
  g.fillRect(h * 0.06, h * 0.06, w - h * 0.12, h * 0.88);
  // el círculo dorado
  const cx = h * 0.55, cy = h * 0.5, r = h * 0.34;
  g.fillStyle = '#c8a850';
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
  // la taza azul con su asa, el plato y el humo
  g.fillStyle = '#2a2a7a';
  g.beginPath();
  g.moveTo(cx - r * 0.45, cy - r * 0.1); g.lineTo(cx + r * 0.35, cy - r * 0.1);
  g.lineTo(cx + r * 0.25, cy + r * 0.4); g.lineTo(cx - r * 0.35, cy + r * 0.4); g.closePath(); g.fill();
  g.fillRect(cx - r * 0.6, cy + r * 0.47, r * 1.1, r * 0.1);
  g.strokeStyle = '#2a2a7a';
  g.lineWidth = h * 0.03;
  g.beginPath(); g.arc(cx + r * 0.38, cy + r * 0.12, r * 0.16, -Math.PI / 2, Math.PI / 2); g.stroke();
  for (const dx of [-0.2, 0.05]) { g.beginPath(); g.moveTo(cx + dx * r, cy - r * 0.2); g.quadraticCurveTo(cx + (dx + 0.18) * r, cy - r * 0.45, cx + dx * r, cy - r * 0.7); g.stroke(); }
  // «CHURRERIA - HAMBURGUESERIA» fino en blanco, la raya dorada y «FONTANALES» grande en dorado
  const x0 = h * 1.05, ancho = w - x0 - h * 0.15;
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.fillStyle = '#f4f4f0';
  g.font = `400 ${Math.round(h * 0.2)}px "Arial Narrow", "Segoe UI", Arial, sans-serif`;
  let m = g.measureText('CHURRERIA - HAMBURGUESERIA').width;
  g.save(); g.translate(x0, h * 0.3); g.scale(Math.min(1, ancho / m), 1); g.fillText('CHURRERIA - HAMBURGUESERIA', 0, 0); g.restore();
  g.fillStyle = '#c8a850';
  g.fillRect(x0, h * 0.45, ancho, h * 0.025);
  g.font = `700 ${Math.round(h * 0.36)}px "Century Gothic", "Segoe UI", Arial, sans-serif`;
  m = g.measureText('FONTANALES').width;
  g.save(); g.translate(x0, h * 0.7); g.scale(Math.min(1, ancho / m), 1); g.fillText('FONTANALES', 0, 0); g.restore();
}

/** el bar al fondo de la entrada: la pared crema y la puerta de cristal de marco oscuro */
function fondo(g, w, h) {
  g.fillStyle = '#d8ccb8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#2a2624';
  g.fillRect(w * 0.12, h * 0.1, w * 0.34, h * 0.9);
  g.fillStyle = '#6a6460';
  g.fillRect(w * 0.16, h * 0.15, w * 0.26, h * 0.8);
  g.fillStyle = 'rgba(255,255,255,.15)';
  g.fillRect(w * 0.16, h * 0.15, w * 0.1, h * 0.8);
  g.fillStyle = '#c8b8a0';
  g.fillRect(w * 0.6, h * 0.25, w * 0.12, h * 0.14);
}

// ——— las piezas ———

/** una mesa redonda de hierro negro con dos sillas */
function mesa(k, s, z) {
  k.cyl(s, 0, z, 0.04, 0.04, 0.72, 0x1e1e20, { seg: 6 });
  k.cyl(s, 0.72, z, 0.32, 0.32, 0.03, 0x2a2a2c, { seg: 14 });
  for (const d of [-0.55, 0.55]) {
    k.box(s + d, 0.44, z, 0.42, 0.04, 0.42, 0x1e1e20);
    for (const [u, v] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) k.box(s + d + u, 0, z + v, 0.03, 0.44, 0.03, 0x1e1e20);
    k.box(s + d * 1.38, 0.48, z, 0.03, 0.45, 0.42, 0x1e1e20);
  }
}

/** la churrería: la visera, la terraza cerrada de dos tramos, la entrada con las mesas y el letrero */
function fachada(k) {
  // la visera corrida de la planta baja, color crema
  k.box((B0 + B2) / 2, VISERA, Z + FUERA / 2 + 0.05, B2 - B0 + 1.2, 0.2, FUERA + 0.1, CREMA);
  // la pared crema del bajo, por delante de lo genérico del bloque, y el fondo de la entrada
  k.box((B0 + B2) / 2, 0, Z + 0.25, B2 - B0, VISERA, 0.3, CREMA);
  k.block((B0 + B2) / 2, Z + 0.25, B2 - B0, 0.3);
  k.pic((B1 + E1) / 2, 1.3, Z + 0.41, E1 - B1, 2.6, 0, 1, canvasTex(160, 210, fondo));
  // los dos tramos de la terraza cerrada: el faldón naranja arriba, el plástico y el panel naranja abajo
  for (const [a, b] of [[B0, B1], [E1, B2]]) {
    const m = (a + b) / 2, L = b - a;
    k.box(m, 0, Z + FUERA, L, 0.75, 0.05, NARANJA);
    k.box(m, VISERA - 0.45, Z + FUERA, L, 0.45, 0.05, NARANJA);
    k.glass.push(new THREE.PlaneGeometry(L - 0.1, VISERA - 1.2).translate(m, 0.75 + (VISERA - 1.2) / 2, Z + FUERA));
    for (const s of [a + 0.03, b - 0.03]) {
      k.box(s, 0, Z + FUERA / 2, 0.05, 0.75, FUERA, NARANJA);
      k.box(s, VISERA - 0.45, Z + FUERA / 2, 0.05, 0.45, FUERA, NARANJA);
      k.box(s, 0, Z + FUERA, 0.08, VISERA, 0.08, 0xc85a1a);
    }
    k.block(m, Z + FUERA, L, 0.1);
    for (const s of [a, b]) k.block(s, Z + FUERA / 2, 0.1, FUERA);
    mesa(k, m, Z + 1.1);
  }
  // el faldón de la entrada y la mesa de delante de la puerta
  k.box((B1 + E1) / 2, VISERA - 0.35, Z + FUERA - 0.6, E1 - B1, 0.35, 0.05, NARANJA);
  mesa(k, (B1 + E1) / 2 + 0.2, Z + 1.0);
  // el letrero sobre sus escuadras de acero
  const sl = 33.6, yL = VISERA + 0.45;
  k.box(sl, yL, Z + 0.65, 4.1, 1.0, 0.1, 0x2a2a7a);
  k.pic(sl, yL + 0.5, Z + 0.71, 4.08, 0.98, 0, 1, canvasTex(600, 144, letrero));
  for (const s of [sl - 1.6, sl - 0.5, sl + 0.6, sl + 1.7]) {
    k.box(s, VISERA + 0.2, Z + 0.4, 0.05, 0.05, 0.6, 0x8a8c90);
    k.box(s, VISERA + 0.2, Z + 0.62, 0.05, 0.3, 0.05, 0x8a8c90);
  }
}

/** se monta con lo demás de Argana Alta */
export function buildFontanalesArgana(scene, colliders, map) {
  if (!map?.fontanalesArgana) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, F, 'fontanalesArgana', colliders);
  scene.add(group);
  return { group };
}
