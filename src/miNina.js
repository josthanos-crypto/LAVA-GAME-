import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, hueco, enMarco, pizarraColgada, SERIF } from './restaurantesCharco.js';

/**
 * Mi Niña, la cafetería y panadería de la calle Canalejas, junto a la esquina de la calle José Betancort,
 * con la foto de Google Maps (solo se mira, no va dentro del juego): la planta baja color arena, la puerta
 * ancha de aluminio blanco con el montante de cristal y el 17, las dos hojas abiertas contra la pared con
 * sus pizarras, y dentro la vitrina curva de los dulces, las baldas del pan y el suelo de barro; a la
 * izquierda, la ventana-mostrador de madera con la tabla «MI NIÑA» encima, los azulejos azules de debajo,
 * la repisa de madera y el taburete alto; encima de la puerta, la pizarra negra colgada de «Pizza» y el
 * aplique blanco. Sin terraza: en el juego la acera es de medio metro. El bloque del mapa se queda.
 */

// la cara norte del bloque, a la calle Canalejas (s desde la esquina este, hacia el oeste)
const M = marco([-134.0, 435.4], [-158.4, 441.0]);
const Z = 0.15, ARENA = 0xe8d6a6, MADERA = 0x6a4428, BLANCO = 0xf0f0ec, BLANCO_CSS = '#f0f0ec';

/** antes de levantar la ciudad: fuera el rótulo rojo genérico */
export function tuneMiNina(map) {
  map.miNinaSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Mi niña cafe');
  if (i >= 0) map.miNinaSign = map.signs.splice(i, 1)[0];
  map.miNina = true;
}

// ——— lo que se pinta en lienzo ———

/** por la puerta: las baldas del pan, la vitrina curva de los dulces y el suelo de barro */
function dentro(g, w, h) {
  g.fillStyle = '#e2d4bc';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4f0e6';
  g.fillRect(0, 0, w, h * 0.12);
  // el suelo de barro, en baldosas
  g.fillStyle = '#c0835a';
  g.fillRect(0, h * 0.72, w, h * 0.28);
  g.strokeStyle = '#e8dccb';
  g.lineWidth = 2;
  for (let y = h * 0.72; y < h; y += h * 0.06) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  for (let x = -w; x < w * 2; x += w * 0.18) { g.beginPath(); g.moveTo(w / 2 + (x - w / 2) * 0.4, h * 0.72); g.lineTo(x, h); g.stroke(); }
  // las baldas del fondo con el pan
  let s = 7;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (const y of [0.3, 0.42, 0.54]) {
    g.fillStyle = '#d8d4cc';
    g.fillRect(w * 0.08, h * y, w * 0.84, h * 0.012);
    for (let x = 0.1; x < 0.9; x += 0.06) {
      g.fillStyle = ['#c08a4a', '#a8703a', '#d8a868'][Math.floor(r() * 3)];
      g.beginPath(); g.ellipse(w * x, h * y - h * 0.018, w * 0.025, h * 0.016, 0, 0, Math.PI * 2); g.fill();
    }
  }
  // la vitrina: el mueble negro, el cristal curvo y los dulces
  g.fillStyle = '#1e1e20';
  g.fillRect(w * 0.18, h * 0.6, w * 0.7, h * 0.14);
  g.fillStyle = '#bcc0c2';
  g.fillRect(w * 0.18, h * 0.735, w * 0.7, h * 0.04);
  g.fillStyle = 'rgba(200,220,230,.45)';
  g.beginPath(); g.moveTo(w * 0.18, h * 0.6); g.quadraticCurveTo(w * 0.2, h * 0.47, w * 0.32, h * 0.46); g.lineTo(w * 0.88, h * 0.46); g.lineTo(w * 0.88, h * 0.6); g.closePath(); g.fill();
  for (let x = 0.24; x < 0.86; x += 0.05) {
    g.fillStyle = ['#d89a5a', '#8a4a2a', '#f0d8a0', '#c85a3a'][Math.floor(r() * 4)];
    g.fillRect(w * x, h * 0.555, w * 0.035, h * 0.03);
  }
  // la dependienta, de espaldas al fondo
  g.fillStyle = '#26262a';
  g.fillRect(w * 0.8, h * 0.42, w * 0.1, h * 0.3);
  g.fillStyle = '#e8d8c8';
  g.beginPath(); g.arc(w * 0.85, h * 0.39, w * 0.035, 0, Math.PI * 2); g.fill();
}

/** por la ventana-mostrador: el bar oscuro, las baldas de botellas y el barril */
function barVentana(g, w, h) {
  g.fillStyle = '#3a3026';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#5a4a3a';
  g.fillRect(0, h * 0.75, w, h * 0.25);
  for (const y of [0.25, 0.5]) {
    g.fillStyle = '#7a6a58';
    g.fillRect(0, h * y, w, h * 0.02);
    for (let x = 0.05; x < 0.95; x += 0.05) { g.fillStyle = ['#3a5a2a', '#d8c08a', '#8a2a22', '#e8e8e0'][Math.floor(x * 97) % 4]; g.fillRect(w * x, h * y - h * 0.12, w * 0.02, h * 0.12); }
  }
  g.fillStyle = '#7a5030';
  g.beginPath(); g.ellipse(w * 0.2, h * 0.85, w * 0.12, h * 0.2, 0, 0, Math.PI * 2); g.fill();
}

/** los azulejos azules y blancos de debajo de la ventana */
function azulejos(g, w, h) {
  const n = 8, t = w / n;
  for (let i = 0; i < n; i++) for (let j = 0; j * t < h; j++) {
    const x = i * t, y = j * t;
    g.fillStyle = '#f2f0ea';
    g.fillRect(x, y, t, t);
    g.fillStyle = '#2a4a8a';
    g.beginPath(); g.moveTo(x + t / 2, y + t * 0.1); g.lineTo(x + t * 0.9, y + t / 2); g.lineTo(x + t / 2, y + t * 0.9); g.lineTo(x + t * 0.1, y + t / 2); g.closePath(); g.fill();
    g.fillStyle = '#f2f0ea';
    g.beginPath(); g.arc(x + t / 2, y + t / 2, t * 0.18, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#3a6ab0';
    for (const [a, b] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { g.beginPath(); g.arc(x + a * t, y + b * t, t * 0.14, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = '#c8c4bc';
    g.strokeRect(x, y, t, t);
  }
}

/** la tabla de madera con MI NIÑA */
function tabla(g, w, h) {
  g.fillStyle = '#7a5434';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(40,24,12,.35)';
  for (let y = 4; y < h; y += 7) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + 2); g.stroke(); }
  g.strokeStyle = '#4a2e1a';
  g.lineWidth = 6;
  g.strokeRect(3, 3, w - 6, h - 6);
  g.fillStyle = '#f2e6cc';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.56)}px ${SERIF}`;
  g.fillText('MI NIÑA', w / 2, h * 0.55);
}

/** la pizarra negra de la pizza, escrita con tiza */
function pizza(g, w, h) {
  g.fillStyle = '#2a2c2e';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(240,240,235,.85)';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 400 ${Math.round(h * 0.42)}px "Segoe Print", "Comic Sans MS", cursive`;
  g.fillText('Pizza', w / 2, h * 0.55);
}

/** el montante: el cristal y el 17 en el marco */
function diecisiete(g, w, h) {
  g.fillStyle = BLANCO_CSS;
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#4a4a4a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.8)}px Arial, sans-serif`;
  g.fillText('17', w / 2, h * 0.55);
}
/** el cristal de las hojas y del montante: reflejo claro */
function cristal(g, w, h) {
  const gr = g.createLinearGradient(0, 0, w, h);
  gr.addColorStop(0, '#c8d0d4');
  gr.addColorStop(0.5, '#e4e2da');
  gr.addColorStop(1, '#b8bcbc');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
}

// ——— las piezas ———

/** una hoja de la puerta abierta contra la pared, con sus pizarras */
function hoja(k, s0, s1, pizarras) {
  const sm = (s0 + s1) / 2, w = s1 - s0, H = 2.3, z = Z + 0.08;
  k.box(sm, 0, z, w, 0.12, 0.05, BLANCO);
  k.box(sm, H - 0.08, z, w, 0.08, 0.05, BLANCO);
  for (const s of [s0 + 0.04, s1 - 0.04]) k.box(s, 0, z, 0.08, H, 0.05, BLANCO);
  k.box(sm, 0.95, z, w, 0.06, 0.05, BLANCO);
  k.pic(sm, (0.12 + H - 0.08) / 2, z - 0.01, w - 0.1, H - 0.2, 0, 1, canvasTex(64, 160, cristal));
  for (const [s, y, pw, ph, seed] of pizarras) k.pic(s, y, z + 0.03, pw, ph, 0, 1, canvasTex(96, Math.round(96 * ph / pw), pizarraColgada(seed)));
}

/** la fachada de Mi Niña, de la esquina a s 8 */
function fachada(k) {
  // la pared color arena de la planta baja
  k.box(4.1, 0, Z - 0.05, 7.9, 3.7, 0.1, ARENA);
  // la puerta ancha con lo de dentro, el montante de cristal con el 17 y el escalón de aluminio
  hueco(k, 4.9, 0, 1.8, 2.3, canvasTex(256, 320, dentro), { borde: BLANCO, z: Z });
  k.box(4.9, 2.4, Z + 0.04, 2.0, 0.6, 0.08, BLANCO);
  k.pic(4.9, 2.72, Z + 0.085, 1.8, 0.36, 0, 1, canvasTex(128, 32, cristal));
  k.pic(4.1, 2.47, Z + 0.085, 0.24, 0.1, 0, 1, canvasTex(64, 28, diecisiete));
  k.box(4.9, 0, Z + 0.2, 1.9, 0.06, 0.4, 0xb8bcbe);
  // las dos hojas abiertas contra la pared, con sus pizarras
  hoja(k, 3.0, 3.9, [[3.45, 1.75, 0.3, 0.45, 5], [3.3, 1.2, 0.28, 0.4, 9], [3.5, 0.62, 0.3, 0.45, 17]]);
  hoja(k, 5.9, 6.8, [[6.45, 1.75, 0.5, 0.6, 23], [6.2, 1.12, 0.48, 0.55, 31], [6.45, 0.45, 0.5, 0.6, 47]]);
  // la ventana-mostrador de madera, la repisa, los azulejos y la tabla de MI NIÑA
  hueco(k, 1.65, 1.05, 2.0, 1.1, canvasTex(256, 140, barVentana), { borde: MADERA, z: Z });
  k.box(1.65, 1.0, Z + 0.15, 2.3, 0.07, 0.36, 0x8a5a34);
  k.pic(1.65, 0.48, Z + 0.01, 2.2, 0.95, 0, 1, canvasTex(256, 112, azulejos));
  k.pic(1.65, 2.62, Z + 0.07, 2.3, 0.5, 0, 1, canvasTex(368, 80, tabla));
  k.box(1.65, 2.35, Z + 0.03, 2.4, 0.56, 0.06, 0x4a2e1a);
  // la contraventana de cristal abierta, a la derecha de la ventana
  k.box(2.78, 1.15, Z + 0.24, 0.06, 0.95, 0.44, MADERA);
  // el taburete alto de madera, debajo de la repisa
  k.cyl(1.0, 0.72, Z + 0.32, 0.17, 0.17, 0.05, 0xa87a4a, { seg: 12 });
  for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) k.box(1.0 + a * 0.1, 0, Z + 0.32 + b * 0.1, 0.03, 0.72, 0.03, 0x8a5a34);
  k.block(1.0, Z + 0.32, 0.36, 0.36);
  // la pizarra negra de la pizza, colgada de su brazo encima de la hoja de la izquierda, y el aplique blanco
  k.box(3.4, 3.62, Z + 0.2, 0.05, 0.05, 0.4, 0x2a2a2a);
  k.pic(3.4, 3.25, Z + 0.37, 1.1, 0.62, 0, 1, canvasTex(220, 124, pizza));
  k.box(3.4, 2.92, Z + 0.35, 1.12, 0.66, 0.03, 0x1a1a1c);
  k.box(4.3, 3.05, Z + 0.06, 0.34, 0.16, 0.12, BLANCO);
}

/** segunda fase, como los demás de este barrio */
export function buildMiNina(scene, colliders, map) {
  if (!map?.miNina) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, M, 'miNina', colliders);
  scene.add(group);
  return { group };
}
