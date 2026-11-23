import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { rebajarTramo, medianera } from './edificioReal.js';

/**
 * Deliciosamente Coffee & More, la cafetería de la calle José Molina 8 (centro), con la foto de la entrada de marzo de
 * 2026 y la vista de la calle de Google de julio de 2025 (solo se miran, no van dentro del juego; la gente no se pone;
 * en julio de 2025 el local era todavía otro café): la casa antigua de dos plantas color crema con los marcos de
 * piedra gris, las esquinas de sillares y el zócalo de bloques grises; la puerta de madera oscura abierta con la sala
 * dentro (las lámparas colgadas, las mesas de madera y las sillas); el hueco grande de la derecha con la lámpara de
 * mimbre y la vitrina de los dulces; el letrero de bandera blanco con «DELI CIO SA MEN TE» en vertical y «coffee &
 * more»; el portal del 8 con su puerta de cuarterones y las rejas blancas; el cajetín de la luz; las ventanas de
 * madera de arriba; y al lado, el escaparate y la puerta de la tienda Algo Más con su letrero granate. La casa de
 * verdad tiene dos plantas (7,2 m) y el bloque del mapa, que es la manzana entera, 15,5 m (el edificio de la esquina de
 * al lado sí es alto, de cinco plantas): se le hace una muesca en el tramo de la casa, que queda a su altura con su
 * azotea, y las paredes del vecino que asoman por encima son medianeras lisas.
 */

// la cara de la calle José Molina (s de norte a sur, hasta la esquina de Teobaldo Power en s 17,2); la foto pone la
// puerta en s 0,9–1,95 y el portal del 8 en s 7,6–9 (Google pone la cafetería en s 11; el mapa no tenía rótulo suyo)
const M = marco([91.65, 330.12], [97.78, 346.19]);
const Z = 0.12, ZF = Z + 0.3, YP = 7.2, S0 = 0.2, S1 = 14.2;
const CREMA = 0xd8c6a6, PIEDRA = 0x8a7e70, MADERA = 0x3e2618;

/** antes de levantar la ciudad: la marca de que se monta (el mapa no tenía rótulo suyo) y la casa a su altura */
export function tuneDeliciosamente(map) {
  map.deliciosamente = true;
  // la casa a su altura de verdad, con una muesca en el bloque alto de la manzana
  rebajarTramo(map, M, S0 - 0.2, S1, 10, YP, [216, 198, 166]);
}

// ——— lo que se pinta en lienzo ———

/** la cal crema, con manchas de humedad */
function crema(g, w, h) {
  g.fillStyle = '#d8c6a6';
  g.fillRect(0, 0, w, h);
  let s = 41;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 60; i++) {
    g.fillStyle = r() < 0.6 ? 'rgba(190,170,140,.3)' : 'rgba(230,215,190,.35)';
    g.beginPath(); g.ellipse(r() * w, h * (0.5 + r() * 0.5), 3 + r() * 14, 2 + r() * 8, 0, 0, Math.PI * 2); g.fill();
  }
}

/** los bloques grises del zócalo */
function bloques(g, w, h) {
  g.fillStyle = '#8a7e70';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(50,44,38,.5)';
  g.lineWidth = 1.5;
  const fila = h / 2;
  for (let y = 0; y < h; y += fila) {
    g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke();
    for (let x = (y / fila) % 2 ? 20 : 0; x < w; x += 40) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + fila); g.stroke(); }
  }
}

/** la sala por la puerta abierta: la hoja de madera, las lámparas, las mesas y las sillas */
function sala(g, w, h) {
  g.fillStyle = '#c8b494';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8d8b8';
  for (const x of [0.5, 0.75]) { g.fillRect(w * x, 0, 2, h * 0.2); g.beginPath(); g.arc(w * x + 1, h * 0.22, 6, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#5a4434';
  g.fillRect(w * 0.35, h * 0.5, w * 0.6, h * 0.08);
  g.fillStyle = '#b89a70';
  g.fillRect(w * 0.45, h * 0.62, w * 0.45, h * 0.04);
  g.fillRect(w * 0.5, h * 0.66, 3, h * 0.2);
  g.fillRect(w * 0.85, h * 0.66, 3, h * 0.2);
  g.fillStyle = '#6a6a66';
  g.fillRect(w * 0.62, h * 0.6, w * 0.12, h * 0.26);
  g.fillStyle = '#8a7a64';
  g.fillRect(0, h * 0.88, w, h * 0.12);
  // la hoja de la puerta abierta hacia dentro, con su ventanita
  g.fillStyle = '#3e2618';
  g.fillRect(0, 0, w * 0.32, h);
  g.fillStyle = '#d8d0c0';
  g.fillRect(w * 0.12, h * 0.2, w * 0.1, h * 0.22);
}

/** el hueco grande: la lámpara de mimbre, la vitrina de los dulces y la mesa */
function vitrina(g, w, h) {
  g.fillStyle = '#c4ae8c';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c8964a';
  g.beginPath(); g.ellipse(w * 0.6, h * 0.2, w * 0.14, h * 0.08, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(90,60,30,.6)';
  g.lineWidth = 1;
  for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(w * (0.6 + i * 0.035), h * 0.12); g.lineTo(w * (0.6 + i * 0.035), h * 0.28); g.stroke(); }
  g.fillStyle = '#5a4434';
  g.fillRect(w * 0.1, h * 0.55, w * 0.8, h * 0.33);
  g.fillStyle = 'rgba(230,240,245,.55)';
  g.fillRect(w * 0.12, h * 0.42, w * 0.76, h * 0.14);
  for (let x = 0.15; x < 0.85; x += 0.09) { g.fillStyle = ['#7a4a2a', '#e8d0a0', '#c86a4a', '#f2e8d0'][Math.round(x * 30) % 4]; g.fillRect(w * x, h * 0.49, w * 0.06, h * 0.05); }
  g.fillStyle = '#8a7a64';
  g.fillRect(0, h * 0.9, w, h * 0.1);
  g.fillStyle = 'rgba(255,255,255,.12)';
  g.fillRect(0, 0, w * 0.3, h);
}

/** el letrero de bandera: «DELI CIO SA MEN TE» en vertical y «coffee & more» */
function letrero(g, w, h) {
  g.fillStyle = '#f4f2ec';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#2a2420';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `300 ${Math.round(h * 0.13)}px "Segoe UI Light", "Helvetica Neue", Arial, sans-serif`;
  ['DELI', 'CIO', 'SA', 'MEN', 'TE'].forEach((t, i) => {
    const m = g.measureText(t).width, k = Math.min(1, (w * 0.8) / m);
    g.save(); g.translate(w / 2, h * (0.1 + i * 0.15)); g.scale(k, 1); g.fillText(t, 0, 0); g.restore();
  });
  g.font = `400 ${Math.round(h * 0.035)}px Arial, sans-serif`;
  g.fillText('COFFEE & MORE', w / 2, h * 0.88, w * 0.85);
}

/** la puerta del portal: los cuarterones de madera y las rejas blancas */
function portal(g, w, h) {
  g.fillStyle = '#3e2618';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(0,0,0,.45)';
  g.lineWidth = 3;
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
  for (const x of [0.06, 0.56]) for (const [y, hh] of [[0.05, 0.22], [0.32, 0.2], [0.58, 0.16], [0.78, 0.18]]) g.strokeRect(w * x, h * y, w * 0.38, h * hh);
  g.strokeStyle = '#f2f2ee';
  g.lineWidth = 2;
  for (const x of [0.08, 0.58]) {
    g.strokeRect(w * x, h * 0.33, w * 0.34, h * 0.17);
    for (let i = 0; i < 3; i++) { const x0 = w * (x + i * 0.113); g.beginPath(); g.moveTo(x0, h * 0.33); g.lineTo(x0 + w * 0.113, h * 0.5); g.moveTo(x0 + w * 0.113, h * 0.33); g.lineTo(x0, h * 0.5); g.stroke(); }
  }
  g.fillStyle = '#e8e8e4';
  for (const x of [0.45, 0.55]) { g.beginPath(); g.arc(w * x, h * 0.42, 4, 0, Math.PI * 2); g.fill(); }
}

/** una ventana de arriba: la carpintería de madera oscura con los cristales */
function ventanaAlta(g, w, h) {
  g.fillStyle = '#2a2a2c';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(200,215,225,.35)';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#3e2618';
  g.lineWidth = 6;
  g.strokeRect(3, 3, w - 6, h - 6);
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
  g.lineWidth = 3;
  for (let y = h / 4; y < h; y += h / 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** el escaparate de la tienda de al lado: la ropa, el sombrero y las hojas pintadas */
function escaparate(g, w, h) {
  g.fillStyle = '#c8ccc4';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8e6e0';
  g.fillRect(w * 0.4, h * 0.35, w * 0.3, h * 0.45);
  g.fillStyle = '#e8dcc0';
  g.beginPath(); g.ellipse(w * 0.55, h * 0.28, w * 0.12, h * 0.03, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#6a8ab8';
  g.fillRect(w * 0.15, h * 0.3, w * 0.18, h * 0.4);
  g.fillStyle = '#c86a6a';
  g.fillRect(w * 0.72, h * 0.4, w * 0.14, h * 0.3);
  let s = 9;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 70; i++) {
    const lado = r() < 0.5, x = lado ? r() * w * 0.18 : w - r() * w * 0.18, y = r() * h;
    g.fillStyle = r() < 0.5 ? '#2a6a32' : '#3a8a3a';
    g.beginPath(); g.ellipse(x, y, w * (0.06 + r() * 0.08), h * (0.012 + r() * 0.015), r() * 3, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = 'rgba(20,20,20,.18)';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.12)';
  g.fillRect(0, 0, w * 0.3, h);
}

/** el letrero granate de Algo Más */
function algoMas(g, w, h) {
  g.fillStyle = '#9a1e2a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4f2ee';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `400 ${Math.round(h * 0.26)}px Georgia, serif`;
  g.fillText('Algo', w / 2, h * 0.38);
  g.fillText('Más', w / 2, h * 0.66);
}

// ——— las piezas ———

/** un hueco con su marco de piedra gris */
function marcoPiedra(k, s, y0, w, h) {
  k.box(s, y0 + h, ZF + 0.03, w + 0.5, 0.25, 0.08, PIEDRA);
  for (const t of [s - w / 2 - 0.125, s + w / 2 + 0.125]) k.box(t, y0, ZF + 0.03, 0.25, h, 0.08, PIEDRA);
}

/** la casa: la pared crema, el zócalo, las esquinas, la cafetería, el portal, la tienda y las ventanas de arriba */
function fachada(k) {
  const c = (S0 + S1) / 2, L = S1 - S0;
  k.box(c, 0, Z + 0.15, L, YP, 0.3, CREMA);
  k.block(c, Z + 0.15, L, 0.3);
  k.pic(c, YP / 2, ZF + 0.003, L, YP, 0, 1, canvasTex(700, 360, crema));
  k.pic(c, 0.45, ZF + 0.006, L, 0.9, 0, 1, canvasTex(700, 45, bloques));
  k.box(c, YP - 0.3, ZF + 0.1, L, 0.3, 0.2, 0xe2d2b4);
  k.box(S0 + 0.2, 0, ZF + 0.02, 0.4, YP - 0.3, 0.06, PIEDRA);
  // la cafetería: la puerta abierta y el hueco grande, con sus marcos de piedra
  k.pic(1.45, 1.2, ZF + 0.01, 1.05, 2.4, 0, 1, canvasTex(100, 230, sala), { glow: 0.3 });
  marcoPiedra(k, 1.45, 0, 1.05, 2.4);
  k.pic(4.9, 1.45, ZF + 0.01, 1.4, 2.7, 0, 1, canvasTex(140, 270, vitrina), { glow: 0.3 });
  marcoPiedra(k, 4.9, 0.15, 1.4, 2.65);
  // el letrero de bandera
  k.box(3.0, 2.55, ZF + 0.45, 0.12, 1.25, 0.6, 0x2a2420);
  k.pic(3.065, 3.175, ZF + 0.45, 0.52, 1.15, 1, 0, canvasTex(90, 200, letrero));
  k.pic(2.935, 3.175, ZF + 0.45, 0.52, 1.15, -1, 0, canvasTex(90, 200, letrero));
  k.box(3.0, 3.75, ZF + 0.1, 0.05, 0.05, 0.3, 0x2a2420);
  k.box(1.9, 2.55, ZF + 0.02, 0.22, 0.3, 0.02, 0x1e1e20);
  // el portal del 8, con su número
  k.pic(8.3, 1.47, ZF + 0.01, 1.4, 2.93, 0, 1, canvasTex(140, 290, portal));
  marcoPiedra(k, 8.3, 0, 1.4, 2.95);
  k.box(8.3, 3.35, ZF + 0.03, 0.3, 0.18, 0.02, 0x1e1e20);
  // el cajetín de la luz
  k.box(9.8, 0.3, ZF + 0.08, 0.6, 0.7, 0.16, 0xece8e0);
  // la tienda de al lado: el escaparate, la puerta y el letrero granate
  k.pic(11.4, 1.6, ZF + 0.01, 1.5, 2.2, 0, 1, canvasTex(150, 220, escaparate), { glow: 0.15 });
  marcoPiedra(k, 11.4, 0.5, 1.5, 2.2);
  k.pic(13.4, 1.4, ZF + 0.01, 0.8, 2.4, 0, 1, canvasTex(80, 240, escaparate), { glow: 0.15 });
  marcoPiedra(k, 13.4, 0.2, 0.8, 2.4);
  k.box(12.55, 2.5, ZF + 0.05, 0.6, 0.8, 0.1, 0x9a1e2a);
  k.pic(12.55, 2.9, ZF + 0.105, 0.58, 0.78, 0, 1, canvasTex(80, 110, algoMas));
  // las ventanas de madera de arriba, con sus marcos de piedra
  for (const s of [1.5, 5.2, 8.4, 11.8]) {
    k.pic(s, 5.6, ZF + 0.01, 1.1, 1.5, 0, 1, canvasTex(110, 150, ventanaAlta));
    marcoPiedra(k, s, 4.85, 1.1, 1.5);
    k.box(s, 4.75, ZF + 0.08, 1.7, 0.1, 0.18, PIEDRA);
  }
  // los cables de la fachada
  for (const y of [3.95, 4.5]) k.box(c, y, ZF + 0.05, L, 0.03, 0.03, 0x2a2a2c);
  // el pretil de la azotea y las medianeras lisas de los vecinos altos que asoman por encima
  k.box(c, YP, Z + 0.15, L + 0.2, 0.45, 0.3, 0xe2d2b4);
  for (const t of [S0 - 0.14, S1 - 0.07]) medianera(k, t, YP, 15.5, 10, Z, 0xe6e2da);
  k.box(c - 0.1, YP, Z + 0.3 - 9.94, L + 0.2, 15.5 - YP, 0.12, 0xe6e2da);
}

/** se monta con lo demás de Arrecife Centro */
export function buildDeliciosamente(scene, colliders, map) {
  if (!map?.deliciosamente) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, M, 'deliciosamente', colliders);
  scene.add(group);
  return { group };
}
