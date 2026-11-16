import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, sombrillaGrande } from './restaurantesCharco.js';

/**
 * L'Style Bar, en la calle Hermanos Zerolo (centro), con la foto de Google Maps de agosto de 2025 y la vista de la
 * calle de junio de 2014 (solo se miran, no van dentro del juego; la gente no se pone): el bajo del edificio forrado
 * de mármol verde oscuro; el portal del número 14 con sus puertas de cristal de marco verde y el cajetín verde del
 * contador; y el bar, en el hueco grande del final del mármol, pegado a la casa vieja blanca de al lado: la
 * entrada de cristal oscuro y la vidriera de las lamas verdes, «L'style» en letras blancas sobre el mármol, los
 * dos aparatos del aire acondicionado y la terraza en la calle peatonal: las sombrillas blancas
 * cuadradas, las mesas de tablero de madera con patas negras, las sillas negras y la pizarra de pie. El bloque se
 * queda como está; lo de abajo tapa su trozo.
 */

// la cara de Hermanos Zerolo del bloque de casas bajas (s de este a oeste); la vista de la calle pone el portal
// del 14 en s 25–26,3 y el final del mármol (y del bar) en s 31,8; el rótulo del mapa caía en s 6,9
const M = marco([36.88, 150.2], [-6.61, 135.84]);
const Z = 0.12, ZF = Z + 0.3, S0 = 24.0, S1 = 31.8, YM = 3.6, VERDE = 0x3e5a4c;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneLStyle(map) {
  map.lstyleSign = null;
  const i = (map.signs || []).findIndex(s => s.name === "L'Style" && Math.hypot(s.x - 30.4, s.z - 148) < 15);
  if (i >= 0) map.lstyleSign = map.signs.splice(i, 1)[0];
  map.lstyle = true;
}

// ——— lo que se pinta en lienzo ———

/** el mármol verde oscuro con sus vetas, en placas */
function marmol(g, w, h) {
  g.fillStyle = '#3e5a4c';
  g.fillRect(0, 0, w, h);
  let s = 5;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 500; i++) {
    g.fillStyle = r() < 0.5 ? 'rgba(20,40,30,.35)' : 'rgba(120,150,130,.3)';
    g.fillRect(r() * w, r() * h, 3, 3);
  }
  g.strokeStyle = 'rgba(170,195,180,.35)';
  g.lineWidth = 1;
  for (let i = 0; i < 14; i++) {
    g.beginPath();
    let x = r() * w, y = r() * h;
    g.moveTo(x, y);
    for (let j = 0; j < 5; j++) { x += (r() - 0.5) * w * 0.3; y += r() * h * 0.08; g.lineTo(x, y); }
    g.stroke();
  }
  g.strokeStyle = 'rgba(15,30,22,.5)';
  for (let y = 0; y <= h; y += h / 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  for (let x = 0; x <= w; x += w / 2) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
}

/** «L'style» en letras blancas sobre el mármol */
function nombre(g, w, h) {
  g.fillStyle = '#3e5a4c';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4f4f0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 700 ${Math.round(h * 0.62)}px "Segoe Script", "Brush Script MT", Georgia, serif`;
  const t = "L'style", m = g.measureText(t).width, k = Math.min(1, (w * 0.9) / m);
  g.save(); g.translate(w / 2, h * 0.52); g.scale(k, 1); g.fillText(t, 0, 0); g.restore();
}

/** la entrada del bar: cristal oscuro, la barra al fondo y la pantalla del menú encendida */
function entrada(g, w, h) {
  g.fillStyle = '#22282a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#3a4a48';
  g.fillRect(w * 0.1, h * 0.2, w * 0.8, h * 0.35);
  g.fillStyle = '#c8b48a';
  for (let x = 0.12; x < 0.88; x += 0.05) g.fillRect(w * x, h * 0.25, w * 0.025, h * 0.08);
  g.fillStyle = '#5ab0d8';
  g.fillRect(w * 0.58, h * 0.6, w * 0.22, h * 0.14);
  g.strokeStyle = '#1a6a4a';
  g.lineWidth = 4;
  g.strokeRect(2, 2, w - 4, h - 4);
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.1)';
  g.fillRect(0, 0, w * 0.3, h);
}

/** la vidriera con las lamas verdes por dentro */
function lamas(g, w, h) {
  g.fillStyle = '#2a3a34';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#5a9a7a';
  for (let y = 0.04; y < 0.96; y += 0.035) g.fillRect(w * 0.04, h * y, w * 0.92, h * 0.022);
  g.strokeStyle = '#1a6a4a';
  g.lineWidth = 4;
  g.strokeRect(2, 2, w - 4, h - 4);
  g.fillStyle = 'rgba(255,255,255,.08)';
  g.fillRect(0, 0, w * 0.3, h);
}

/** las puertas de cristal del portal del 14, con su marco verde */
function portal(g, w, h) {
  g.fillStyle = '#4a5a5c';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.14)';
  g.fillRect(0, 0, w * 0.35, h);
  g.strokeStyle = '#1e4a38';
  g.lineWidth = 6;
  g.strokeRect(3, 3, w - 6, h - 6);
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
  g.strokeStyle = '#c8ccc8';
  g.lineWidth = 3;
  for (const x of [0.42, 0.58]) { g.beginPath(); g.moveTo(w * x, h * 0.3); g.lineTo(w * x, h * 0.75); g.stroke(); }
}

/** la pizarra de pie */
function pizarra(g, w, h) {
  g.fillStyle = '#1e1e20';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d8d8d4';
  g.lineWidth = 2;
  for (let y = 0.2; y < 0.9; y += 0.1) { g.beginPath(); g.moveTo(w * 0.15, h * y); g.lineTo(w * (0.5 + ((y * 7) % 0.35)), h * y); g.stroke(); }
}

// ——— las piezas ———

/** el mármol, el portal del 14 y el bar con su nombre y los aires acondicionados */
function fachada(k) {
  const mt = canvasTex(128, 256, marmol);
  // el mármol: los trozos de pared alrededor del portal y de los huecos del bar
  const trozos = [[S0, 24.96, 0, YM], [26.29, 27.9, 0, YM], [29.45, 29.75, 0, YM], [24.96, 26.29, 2.45, YM], [27.9, 29.45, 2.7, YM], [29.75, 31.4, 2.7, YM], [31.4, S1, 0, YM]];
  for (const [a, b, y0, y1] of trozos) {
    k.box((a + b) / 2, y0, Z + 0.15, b - a, y1 - y0, 0.3, VERDE);
    k.pic((a + b) / 2, (y0 + y1) / 2, ZF + 0.005, b - a, y1 - y0, 0, 1, mt);
  }
  k.block((S0 + S1) / 2, Z + 0.15, S1 - S0, 0.3);
  // el portal del 14: las puertas de cristal, la plaquita del número y el cajetín verde
  k.pic(25.625, 1.225, Z + 0.04, 1.33, 2.45, 0, 1, canvasTex(130, 240, portal));
  k.box(25.6, 2.62, ZF + 0.01, 0.18, 0.14, 0.02, 0xc8ccc8);
  k.box(27.0, 0.05, ZF + 0.08, 0.8, 0.65, 0.16, 0x2e4a3a);
  // los huecos del bar: la entrada y la vidriera de las lamas, con su marco verde
  k.pic(28.675, 1.35, Z + 0.04, 1.55, 2.7, 0, 1, canvasTex(150, 260, entrada), { glow: 0.2 });
  k.pic(30.575, 1.35, Z + 0.04, 1.65, 2.7, 0, 1, canvasTex(160, 260, lamas));
  for (const [a, b] of [[27.9, 29.45], [29.75, 31.4]]) {
    for (const t of [a, b]) k.box(t, 0, Z + 0.1, 0.07, 2.7, 0.08, 0x1a4a36);
    k.box((a + b) / 2, 2.63, Z + 0.1, b - a, 0.07, 0.08, 0x1a4a36);
  }
  // «L'style» encima de la entrada
  k.pic(28.7, 3.08, ZF + 0.012, 1.4, 0.52, 0, 1, canvasTex(280, 104, nombre));
  // los dos aires acondicionados de arriba, junto a la casa blanca (en la foto van uno encima de otro en la planta
  // de arriba; aquí la casa es más baja y van uno al lado del otro, encima de la vidriera)
  for (const s of [30.35, 31.25]) {
    k.box(s, 2.92, ZF + 0.18, 0.82, 0.58, 0.32, 0xeceae6);
    k.cyl(s - 0.12, 3.21, ZF + 0.345, 0.19, 0.19, 0.02, 0xb8b8b4, { seg: 16, rx: Math.PI / 2 });
  }
}

/** la terraza en la calle peatonal: sombrillas blancas, mesas de madera, sillas negras y la pizarra */
function terraza(k) {
  for (const s of [27.4, 30.2, 33.0]) sombrillaGrande(k, s, 2.2, 0xf4f4f2);
  for (const [s, z] of [[26.6, 1.6], [28.3, 2.6], [29.6, 1.5], [31.0, 2.7], [32.4, 1.6], [33.6, 2.7]]) {
    k.table(s, z, { w: 0.7, d: 0.7, h: 0.75, top: 0x8a6440, leg: 0x1e1e20 });
    k.chair(s - 0.55, z, Math.PI / 2, 0x1e1e20, { legs: 0x1e1e20 });
    k.chair(s + 0.55, z, -Math.PI / 2, 0x1e1e20, { legs: 0x1e1e20 });
    k.block(s, z, 0.7, 0.7);
  }
  // la pizarra de pie, delante de la entrada
  const p = new THREE.BoxGeometry(0.55, 1.0, 0.04);
  p.rotateX(-0.2);
  p.translate(28.2, 0.5, ZF + 0.7);
  k.add(p, 0x1e1e20);
  k.pic(28.2, 0.52, ZF + 0.81, 0.5, 0.9, 0, 1, canvasTex(80, 140, pizarra));
  k.block(28.2, ZF + 0.6, 0.6, 0.4);
}

/** se monta con lo demás de Arrecife Centro */
export function buildLStyle(scene, colliders, map) {
  if (!map?.lstyle) return null;
  const k = new Kit();
  fachada(k);
  terraza(k);
  const group = enMarco(k, M, 'lstyle', colliders);
  scene.add(group);
  return { group };
}
