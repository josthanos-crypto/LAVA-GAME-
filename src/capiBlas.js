import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * El Restaurante Capi Blas, hamburguesería y pizzería de la avenida Doctor Rafael González (frente a la playa
 * del Reducto), con la foto de Google Maps de febrero de 2023 (solo se mira, no va dentro del juego; la
 * gente de la foto no se pone): la planta baja forrada de mármol beis; el rótulo alargado de encima de la
 * entrada, con el borde de triángulos negros y amarillos, la hamburguesa dibujada a la izquierda y «CAPI BLAS» en
 * letras grises grandes con una hamburguesita en medio; debajo, «Hamburguesería Pizzería» en letras sueltas
 * de color granate; la entrada abierta con los dos escalones y la barandilla de acero, y el bar dentro; a la
 * derecha, la ventana con la reja y el cartel de la casa, y la puerta blanca de lamas del portal. Los carteles
 * de bebidas de la foto no se ponen. El bloque se queda como está.
 */

// la cara sur del bloque, a la avenida (s de oeste a este, la de Lolita); el rótulo del mapa cae en s 13,9
const C = marco([-258.2, 497.7], [-215.1, 495.1]);
const Z = 0.12, S0 = 8.6, S1 = 18.4, MARMOL = 0xd8c4a8, GRANATE = '#8a2a3a', PB = 4.5, YR = 3.3;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneCapiBlas(map) {
  map.capiBlasSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Capi Blas');
  if (i >= 0) map.capiBlasSign = map.signs.splice(i, 1)[0];
  map.capiBlas = true;
}

// ——— lo que se pinta en lienzo ———

/** una hamburguesa dibujada (pan, lechuga, carne y tomate) en (x, y) con radio r */
function hamburguesa(g, x, y, r) {
  g.fillStyle = '#d8a058';
  g.beginPath(); g.ellipse(x, y - r * 0.25, r, r * 0.55, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#5aa83a';
  g.fillRect(x - r * 1.02, y - r * 0.28, r * 2.04, r * 0.16);
  g.fillStyle = '#d02a2a';
  g.fillRect(x - r * 0.95, y - r * 0.14, r * 1.9, r * 0.14);
  g.fillStyle = '#5a3420';
  g.fillRect(x - r, y, r * 2, r * 0.28);
  g.fillStyle = '#d8a058';
  g.beginPath(); g.ellipse(x, y + r * 0.3, r, r * 0.3, 0, 0, Math.PI); g.fill();
  g.fillStyle = '#f2e8c8';
  for (let i = 0; i < 6; i++) g.fillRect(x - r * 0.6 + i * r * 0.22, y - r * 0.55 + (i % 2) * r * 0.08, r * 0.06, r * 0.04);
}

/** el rótulo: el borde de triángulos negros y amarillos, la hamburguesa y «CAPI BLAS» */
function rotulo(g, w, h) {
  const b = h * 0.16;
  g.fillStyle = '#e8d84a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#1a1a1c';
  for (let x = 0; x < w; x += b) {
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x + b / 2, b); g.lineTo(x + b, 0); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(x, h); g.lineTo(x + b / 2, h - b); g.lineTo(x + b, h); g.closePath(); g.fill();
  }
  for (let y = 0; y < h; y += b) {
    g.beginPath(); g.moveTo(0, y); g.lineTo(b, y + b / 2); g.lineTo(0, y + b); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(w, y); g.lineTo(w - b, y + b / 2); g.lineTo(w, y + b); g.closePath(); g.fill();
  }
  // el fondo: crema con la parte de la hamburguesa más tostada, y un degradado rosado hacia la derecha
  const gr = g.createLinearGradient(b, 0, w - b, 0);
  gr.addColorStop(0, '#e8c8a0');
  gr.addColorStop(0.3, '#f2ece2');
  gr.addColorStop(0.85, '#f2ece2');
  gr.addColorStop(1, '#f0d8d0');
  g.fillStyle = gr;
  g.fillRect(b, b, w - 2 * b, h - 2 * b);
  hamburguesa(g, w * 0.14, h * 0.52, h * 0.3);
  g.fillStyle = '#6a6a70';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.font = `900 ${Math.round(h * 0.52)}px "Arial Black", Arial, sans-serif`;
  const a1 = g.measureText('CAPI').width, a2 = g.measureText('BLAS').width, hueco = h * 0.42;
  const x0 = Math.min(w * 0.6 - (a1 + hueco + a2) / 2, w * 0.95 - (a1 + hueco + a2));
  g.fillText('CAPI', x0, h * 0.54);
  hamburguesa(g, x0 + a1 + hueco / 2, h * 0.6, h * 0.14);
  g.fillStyle = '#6a6a70';
  g.fillText('BLAS', x0 + a1 + hueco, h * 0.54);
}

/** «Hamburguesería Pizzería» en letras sueltas granates, en fondo transparente */
function letras(g, w, h) {
  g.clearRect(0, 0, w, h);
  g.fillStyle = GRANATE;
  g.strokeStyle = '#f2ece2';
  g.lineWidth = 3;
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  g.font = `700 ${Math.round(h * 0.7)}px "Bookman Old Style", Georgia, serif`;
  g.strokeText('Hamburguesería', w * 0.02, h * 0.55);
  g.fillText('Hamburguesería', w * 0.02, h * 0.55);
  g.textAlign = 'right';
  g.strokeText('Pizzería', w * 0.98, h * 0.55);
  g.fillText('Pizzería', w * 0.98, h * 0.55);
}

/** el mármol beis de la planta baja, en placas */
function marmol(g, w, h) {
  g.fillStyle = '#d8c4a8';
  g.fillRect(0, 0, w, h);
  let s = 5;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(${150 + r() * 80},${130 + r() * 60},${100 + r() * 50},.25)`; g.fillRect(r() * w, r() * h, 2 + r() * 8, 1 + r() * 3); }
  g.strokeStyle = 'rgba(120,100,80,.45)';
  g.lineWidth = 2;
  for (let x = 0; x < w; x += w / 8) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y < h; y += h / 5) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** el bar por la entrada abierta: el techo con los fluorescentes, la barra, la cafetera y el fondo */
function bar(g, w, h) {
  g.fillStyle = '#4a4440';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8dce0';
  g.fillRect(0, 0, w, h * 0.14);
  g.fillStyle = '#f2fbff';
  for (const x of [0.15, 0.55]) g.fillRect(w * x, h * 0.05, w * 0.28, h * 0.03);
  g.fillStyle = '#6a6460';
  g.fillRect(w * 0.45, h * 0.3, w * 0.5, h * 0.25);
  g.fillStyle = '#2a2a2c';
  g.fillRect(w * 0.55, h * 0.35, w * 0.12, h * 0.12);
  g.fillStyle = '#b8b0a8';
  g.fillRect(w * 0.3, h * 0.55, w * 0.65, h * 0.06);
  g.fillStyle = '#8a7a6a';
  g.fillRect(w * 0.3, h * 0.61, w * 0.65, h * 0.39);
  g.fillStyle = '#c8302a';
  g.fillRect(w * 0.06, h * 0.32, w * 0.06, h * 0.08);
}

// ——— las piezas ———

/** la hamburguesería: el mármol, la entrada con los escalones y la barandilla, la ventana, el portal y el rótulo */
function fachada(k) {
  const sm = (S0 + S1) / 2, e0 = S0 + 0.3, e1 = S0 + 5.6, v0 = e1 + 0.9, v1 = v0 + 1.4, p0 = S1 - 1.2;
  // el mármol beis de toda la planta baja (con los huecos de la entrada, la ventana y el portal)
  for (const [a, b, y0, y1] of [[S0, e0, 0, PB], [e1, v0, 0, PB], [v1, p0, 0, PB], [v0, v1, 0, 0.9], [v0, v1, 2.3, PB], [e0, e1, 2.6, PB], [p0, S1, 2.3, PB]]) {
    k.box((a + b) / 2, y0, Z - 0.01, b - a, y1 - y0, 0.06, MARMOL);
    k.pic((a + b) / 2, (y0 + y1) / 2, Z + 0.025, b - a, y1 - y0, 0, 1, canvasTex(Math.max(16, Math.round((b - a) * 40)), Math.max(16, Math.round((y1 - y0) * 40)), marmol));
  }
  // la entrada abierta con el bar dentro, los dos escalones de granito y la barandilla de acero
  k.pic((e0 + e1) / 2, 1.3, Z - 0.03, e1 - e0, 2.6, 0, 1, canvasTex(300, 150, bar), { glow: 0.15 });
  for (const [y, d] of [[0, 0.7], [0.17, 0.35]]) k.box((e0 + e1) / 2, y, Z + d / 2, e1 - e0, 0.17, d, 0x8a8a88);
  for (const s of [e0 + 0.9, e0 + 2.4]) {
    k.box(s, 0.34, Z + 0.55, 0.05, 0.9, 0.05, 0xc8ccd0);
    k.box(s, 1.24, Z + 0.3, 0.05, 0.05, 0.8, 0xc8ccd0);
  }
  // la ventana con su reja y el cartel de la casa pegado, y la puerta blanca de lamas del portal
  k.box((v0 + v1) / 2, 0.9, Z + 0.01, v1 - v0, 1.4, 0.04, 0x3a4a54);
  for (let s = v0 + 0.15; s < v1; s += 0.14) k.box(s, 0.95, Z + 0.06, 0.02, 1.3, 0.02, 0x2a2a2c);
  k.box((v0 + v1) / 2, 0.9, Z + 0.05, v1 - v0 + 0.08, 0.06, 0.08, 0xf2f2f0);
  k.box(v0 + 0.95, 1.35, Z + 0.07, 0.45, 0.55, 0.01, 0xe8c83a);
  k.box((p0 + S1) / 2, 0, Z + 0.02, S1 - p0 - 0.1, 2.3, 0.05, 0xf2f2f0);
  for (let y = 0.25; y < 2.2; y += 0.12) k.box((p0 + S1) / 2, y, Z + 0.05, S1 - p0 - 0.3, 0.03, 0.02, 0xd0d0cc);
  // la cornisa blanca de encima del bajo
  k.box(sm, PB, Z + 0.3, S1 - S0, 0.25, 0.7, 0xf2f2f0);
  // el rótulo alargado encima de la entrada (las letras granates sueltas van debajo, en letrasSueltas)
  k.box(e0 + 3.8, YR, Z + 0.25, 7.2, 1.1, 0.12, 0xe8d84a);
  k.pic(e0 + 3.8, YR + 0.55, Z + 0.315, 7.18, 1.08, 0, 1, canvasTex(900, 140, rotulo));
  for (const s of [e0 + 0.6, e0 + 7.0]) k.box(s, YR + 0.4, Z + 0.06, 0.05, 0.25, 0.2, 0x5a5a5c);
}

/** las letras sueltas de debajo del rótulo (planos transparentes, aparte del kit) */
function letrasSueltas(group) {
  const tex = new THREE.CanvasTexture((() => { const c = document.createElement('canvas'); c.width = 900; c.height = 80; letras(c.getContext('2d'), 900, 80); return c; })());
  tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(7.0, 0.62), new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.4 }));
  m.position.set(S0 + 0.3 + 3.8, 2.95, Z + 0.06);
  group.add(m);
}

/** se monta con lo demás de Arrecife Centro */
export function buildCapiBlas(scene, colliders, map) {
  if (!map?.capiBlas) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, C, 'capiBlas', colliders);
  letrasSueltas(group);
  scene.add(group);
  return { group };
}
