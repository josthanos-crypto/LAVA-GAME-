import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * El Hong Kong, restaurante chino de buffet libre de la avenida Doctor Rafael González (centro), con la vista de la
 * calle de Google de julio de 2025 (solo se mira, no va dentro del juego; la gente no se pone): el bajo blanco del
 * edificio de cinco plantas, con el vuelo de la primera planta por encima; la entrada en alto, con su escalera y
 * el antepecho blanco de lamas; la ventana de marco blanco, la puerta abierta con el comedor dentro (los manteles
 * azulados, las sillas de madera) y la cristalera con el letrerito de «HONG KONG»; encima, el cartel granate con
 * los adornos dorados y «RESTAURANTE CHINO / HONG KONG / BUFFET LIBRE»; el cartel rojo alargado de la izquierda
 * (sin letras, que no se leen); el atril del menú; y a la derecha, la puerta oscura de marco negro del local de
 * al lado. La terraza de las fotos está en una acera ancha que en el juego no hay (aquí la acera tiene 1,6 m) y
 * la bandera de la entrada lleva marca, así que no se ponen. El bloque se queda como está.
 */

// la cara sur del bloque, a la avenida (s de oeste a este, la de Capi Blas y Lolita); la vista de la calle pone el
// edificio en s 22,6–30,4 y el rótulo del mapa caía en s 24,4
const M = marco([-258.2, 497.7], [-215.1, 495.1]);
const Z = 0.12, ZF = Z + 0.3, S0 = 22.6, S1 = 30.4, YP = 0.8, YT = 2.75, BLANCO = 0xf2f0ea;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneHongKong(map) {
  map.hongKongSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Hong Kong' && Math.hypot(s.x + 233.8, s.z - 496.2) < 15);
  if (i >= 0) map.hongKongSign = map.signs.splice(i, 1)[0];
  map.hongKong = true;
}

// ——— lo que se pinta en lienzo ———

/** el cartel granate con los adornos dorados y las tres líneas */
function cartel(g, w, h) {
  g.fillStyle = '#6a2028';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c8a050';
  g.lineWidth = 3;
  g.strokeRect(4, 4, w - 8, h - 8);
  // los adornos dorados de los lados: ramas con flores
  for (const x0 of [0.03, 0.75]) {
    g.strokeStyle = '#b89048';
    g.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      g.beginPath();
      g.moveTo(w * (x0 + 0.01), h * (0.3 + i * 0.2));
      g.bezierCurveTo(w * (x0 + 0.06), h * (0.1 + i * 0.2), w * (x0 + 0.12), h * (0.6 + i * 0.1), w * (x0 + 0.2), h * (0.35 + i * 0.15));
      g.stroke();
    }
    g.fillStyle = '#d8b060';
    for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(w * (x0 + 0.03 + i * 0.04), h * (0.3 + (i % 3) * 0.2), h * 0.05, 0, Math.PI * 2); g.fill(); }
  }
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#d8b060';
  g.font = `700 ${Math.round(h * 0.2)}px Georgia, "Times New Roman", serif`;
  g.fillText('RESTAURANTE CHINO', w / 2, h * 0.24);
  g.fillStyle = '#f4f0e8';
  g.font = `700 ${Math.round(h * 0.28)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('HONG KONG', w / 2, h * 0.52);
  g.fillStyle = '#d8b060';
  g.font = `700 ${Math.round(h * 0.2)}px Georgia, "Times New Roman", serif`;
  g.fillText('BUFFET LIBRE', w / 2, h * 0.8);
}

/** el comedor por la puerta: las mesas de mantel azulado y las sillas de madera */
function comedor(g, w, h) {
  g.fillStyle = '#e8e4dc';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#8a6a4a';
  g.fillRect(0, h * 0.82, w, h * 0.18);
  g.fillStyle = '#5a3a2a';
  g.fillRect(w * 0.1, h * 0.12, w * 0.8, h * 0.22);
  g.fillStyle = '#7ab0a8';
  g.fillRect(w * 0.14, h * 0.15, w * 0.72, h * 0.16);
  for (const x of [0.1, 0.55]) {
    g.fillStyle = '#c8e4e8';
    g.fillRect(w * x, h * 0.55, w * 0.35, h * 0.12);
    g.fillStyle = '#d8b878';
    g.fillRect(w * (x - 0.04), h * 0.45, w * 0.06, h * 0.3);
    g.fillRect(w * (x + 0.33), h * 0.45, w * 0.06, h * 0.3);
  }
  g.fillStyle = 'rgba(0,0,0,.25)';
  g.fillRect(0, 0, w, h);
}

/** la cristalera con el letrerito de «HONG KONG» arriba */
function cristalera(g, w, h) {
  comedor(g, w, h);
  g.fillStyle = 'rgba(200,215,225,.2)';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#2a2a2c';
  g.fillRect(w * 0.15, h * 0.03, w * 0.7, h * 0.1);
  g.fillStyle = '#f4f0e8';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.06)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('HONG KONG', w / 2, h * 0.08);
  g.strokeStyle = '#f2f0ea';
  g.lineWidth = 4;
  g.strokeRect(2, 2, w - 4, h - 4);
  g.beginPath(); g.moveTo(w * 0.42, h * 0.15); g.lineTo(w * 0.42, h); g.stroke();
}

/** la ventana de marco blanco */
function ventana(g, w, h) {
  comedor(g, w, h);
  g.fillStyle = 'rgba(255,255,255,.15)';
  g.fillRect(0, 0, w * 0.4, h);
  g.strokeStyle = '#f2f0ea';
  g.lineWidth = 6;
  g.strokeRect(3, 3, w - 6, h - 6);
  g.beginPath(); g.moveTo(w * 0.42, 0); g.lineTo(w * 0.42, h); g.stroke();
}

/** el antepecho blanco de lamas de la entrada */
function antepecho(g, w, h) {
  g.fillStyle = '#f2f0ea';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c8c4bc';
  for (let x = 6; x < w; x += 12) g.fillRect(x, 4, 3, h - 8);
}

/** el atril del menú */
function menu(g, w, h) {
  g.fillStyle = '#e8dcc0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#8a6a3a';
  for (let y = 0.1; y < 0.9; y += 0.27) for (const x of [0.08, 0.54]) g.fillRect(w * x, h * y, w * 0.38, h * 0.22);
}

/** la puerta oscura de marco negro del local de al lado */
function puertaVecino(g, w, h) {
  g.fillStyle = '#1e1e20';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#3a3a3e';
  g.fillRect(w * 0.12, h * 0.06, w * 0.76, h * 0.88);
  g.fillStyle = 'rgba(255,255,255,.08)';
  g.fillRect(w * 0.12, h * 0.06, w * 0.3, h * 0.88);
}

// ——— las piezas ———

/** el bajo: la pared blanca con sus huecos, el vuelo de arriba y los carteles */
function fachada(k) {
  const trozos = [[S0, 23.1, 0, 3.6], [24.4, 24.6, 0, 3.6], [25.7, 25.8, 0, 3.6], [27.4, 29.2, 0, 3.6], [30.1, S1, 0, 3.6],
    [23.1, 24.4, 0, 1.5], [23.1, 24.4, YT, 3.6], [24.6, 27.4, YT, 3.6], [24.6, 27.4, 0, YP], [29.2, 30.1, 2.3, 3.6]];
  for (const [a, b, y0, y1] of trozos) k.box((a + b) / 2, y0, Z + 0.15, b - a, y1 - y0, 0.3, BLANCO);
  k.block((S0 + S1) / 2, Z + 0.15, S1 - S0, 0.3);
  // la ventana, la puerta abierta con el comedor y la cristalera
  k.pic(23.75, (1.5 + YT) / 2, Z + 0.04, 1.3, YT - 1.5, 0, 1, canvasTex(130, 125, ventana), { glow: 0.15 });
  k.pic(25.15, (YP + YT) / 2, Z + 0.04, 1.1, YT - YP, 0, 1, canvasTex(110, 195, comedor), { glow: 0.2 });
  k.pic(26.6, (YP + YT) / 2, Z + 0.04, 1.6, YT - YP, 0, 1, canvasTex(160, 195, cristalera), { glow: 0.15 });
  // el cartel granate de encima de la entrada y el cartel rojo alargado de la izquierda
  k.box(25.1, 2.83, ZF + 0.02, 2.5, 0.52, 0.06, 0x6a2028);
  k.pic(25.1, 3.09, ZF + 0.055, 2.48, 0.5, 0, 1, canvasTex(420, 84, cartel));
  k.box(22.85, 1.9, ZF + 0.03, 0.28, 1.0, 0.06, 0xb82a2a);
  k.box(22.85, 1.95, ZF + 0.065, 0.2, 0.9, 0.01, 0xc8a050);
  k.box(22.85, 2.0, ZF + 0.07, 0.16, 0.8, 0.01, 0xb82a2a);
  // el vuelo de la primera planta, por encima de la acera
  k.box((S0 + S1) / 2, 3.45, Z + 0.72, S1 - S0, 0.35, 1.45, BLANCO);
  k.box((S0 + S1) / 2, 3.42, Z + 1.44, S1 - S0, 0.04, 0.04, 0xd8d4cc);
  // la puerta del local de al lado
  k.pic(29.65, 1.15, Z + 0.04, 0.9, 2.3, 0, 1, canvasTex(90, 230, puertaVecino));
  for (const t of [29.2, 30.1]) k.box(t, 0, ZF + 0.02, 0.1, 2.35, 0.06, 0x1e1e20);
  k.box(29.65, 2.3, ZF + 0.02, 1.0, 0.1, 0.06, 0x1e1e20);
}

/** la entrada en alto: la plataforma, los escalones, el antepecho de lamas y el atril del menú */
function entrada(k) {
  const fondo = 0.5, huella = 0.22;
  k.box(25.15, 0, ZF + fondo / 2, 4.9, YP, fondo, 0xe8e4dc);
  for (let i = 1; i <= 3; i++) k.box(25.1, 0, ZF + fondo + huella * (i - 0.5), 1.3, YP - 0.2 * i, huella, i % 2 ? 0xd8d4cc : 0xe0dcd4);
  k.block(25.15, ZF + fondo / 2, 4.9, fondo);
  // el antepecho a los dos lados de la escalera
  const at = canvasTex(160, 60, antepecho);
  for (const [a, b] of [[22.7, 24.45], [25.75, 27.6]]) {
    k.box((a + b) / 2, YP, ZF + fondo - 0.04, b - a, 0.7, 0.06, 0xf2f0ea);
    k.pic((a + b) / 2, YP + 0.35, ZF + fondo, b - a, 0.7, 0, 1, at);
  }
  // la barandilla negra de la escalera
  k.box(24.4, YP, ZF + fondo + 0.3, 0.04, 0.9, 0.04, 0x1e1e20);
  k.box(24.4, YP + 0.88, ZF + fondo + 0.15, 0.04, 0.04, 0.7, 0x1e1e20);
  // el atril del menú en la plataforma
  k.box(26.9, YP, ZF + 0.25, 0.04, 1.0, 0.04, 0x8a6a3a);
  k.box(26.9, YP + 0.85, ZF + 0.28, 0.5, 0.6, 0.03, 0x8a6a3a);
  k.pic(26.9, YP + 1.15, ZF + 0.3, 0.46, 0.56, 0, 1, canvasTex(60, 74, menu));
}

/** se monta con lo demás de Arrecife Centro */
export function buildHongKong(scene, colliders, map) {
  if (!map?.hongKong) return null;
  const k = new Kit();
  fachada(k);
  entrada(k);
  const group = enMarco(k, M, 'hongKong', colliders);
  scene.add(group);
  return { group };
}
