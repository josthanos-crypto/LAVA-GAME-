import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, barDentro } from './restaurantesCharco.js';
import { paredAlta, ventana } from './edificioReal.js';

/**
 * La Cafetería El Cortadito, en la calle Manolo Millares, entre El Nuevo Maccheroni y la inmobiliaria (centro), con la
 * vista de la calle de Google de julio de 2025 (solo se mira, no va dentro del juego; la gente no se pone): el
 * edificio color arena del bajo y tres plantas (12,4 m, lo que ya medía el bloque del mapa) con sus ventanas de
 * persianas blancas y, a la izquierda, los balcones curvos de la segunda y la tercera planta; en el bajo, El Cortadito
 * con su toldo crema de «El Cortadito» y «Bocadillos Calientes · Sándwiches · Zumos Naturales», la cafetería abierta
 * por dentro y el portal marrón de al lado; a su izquierda, el restaurante El nido con su letrero y su toldo oscuro; y
 * delante de los dos, la terraza de la acera con las mesas de madera y las sillas grises. El rótulo genérico de «El
 * Barrilito Tapas y Pinchos» que el mapa tenía en ese sitio (el juego no lo usa para nada) se quita: ya no está.
 */

// la cara de Manolo Millares del bloque tiene un retranqueo: el tramo de El nido (s de este a oeste, desde el
// Maccheroni) y el de El Cortadito, 1,4 m más metido (s de este a oeste, desde el retranqueo hasta el portal)
const F1 = marco([-594.79, 365.06], [-600.75, 365.47]);
const F2 = marco([-600.67, 366.83], [-611.04, 367.65]);
const Z = 0.12, ZF = Z + 0.3, YP = 3.6, TECHO = 12.4, ARENA = 0xe8c088, BLANCO = 0xf2f2ee;
const C1 = 3.7, PLANTAS = [3.9, 6.8, 9.7];

/** antes de levantar la ciudad: la marca de que se monta y fuera el rótulo genérico de El Barrilito */
export function tuneElCortadito(map) {
  map.elCortadito = true;
  const i = (map.signs || []).findIndex(s => s.name === 'El Barrilito Tapas y Pinchos' && Math.hypot(s.x + 602.2, s.z - 367) < 10);
  if (i >= 0) map.signs.splice(i, 1);
}

// ——— lo que se pinta en lienzo ———

/** el faldón del toldo de El Cortadito: el nombre en letra de mano y lo que sirven */
function faldon(g, w, h) {
  g.fillStyle = '#f2e8dc';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c86a6a';
  g.fillRect(0, 0, w, h * 0.08);
  g.fillRect(0, h * 0.92, w, h * 0.08);
  g.fillStyle = '#9a2a2a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 600 ${Math.round(h * 0.42)}px "Segoe Script", "Brush Script MT", Georgia, serif`;
  g.fillText('El Cortadito', w / 2, h * 0.36, w * 0.8);
  g.fillStyle = '#4a3a34';
  g.font = `600 ${Math.round(h * 0.16)}px Arial, sans-serif`;
  g.fillText('Bocadillos Calientes · Sándwiches · Zumos Naturales', w / 2, h * 0.76, w * 0.92);
}

/** el letrero de El nido: la banda crema con el nombre en letra de mano y las rayas oscuras de los lados */
function letreroNido(g, w, h) {
  g.fillStyle = '#ece6da';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#2a2a2c';
  for (const x of [0, w * 0.86]) for (let i = 0; i < 4; i++) g.fillRect(x + i * w * 0.035, 0, w * 0.02, h);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 600 ${Math.round(h * 0.55)}px "Segoe Script", "Brush Script MT", Georgia, serif`;
  g.fillText('El nido', w / 2, h * 0.45, w * 0.6);
  g.font = `600 ${Math.round(h * 0.13)}px Arial, sans-serif`;
  g.fillText('BAR · RESTAURANTE', w / 2, h * 0.82, w * 0.6);
}

/** una ventana con la persiana blanca de lamas bajada hasta la mitad */
function persiana(g, w, h) {
  g.fillStyle = '#2e363e';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f0f0ec';
  g.fillRect(0, 0, w, h * 0.55);
  g.fillStyle = 'rgba(0,0,0,.18)';
  for (let y = 4; y < h * 0.55; y += 6) g.fillRect(0, y, w, 1.5);
  g.strokeStyle = '#e8e6e0';
  g.lineWidth = 5;
  g.strokeRect(2, 2, w - 4, h - 4);
}

/** el portal marrón */
function portal(g, w, h) {
  g.fillStyle = '#6a4a32';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(0,0,0,.35)';
  g.lineWidth = 3;
  for (let y = h * 0.08; y < h; y += h / 6) g.strokeRect(w * 0.12, y, w * 0.76, h / 7);
}

// ——— las piezas ———

/** una ventana de persiana con su alféizar */
function ventanaPersiana(k, s, y, w = 1.1, h = 1.3) {
  k.pic(s, y + h / 2, ZF + 0.008, w, h, 0, 1, canvasTex(Math.round(w * 60), Math.round(h * 60), persiana));
  k.box(s, y - 0.06, ZF + 0.04, w + 0.16, 0.06, 0.12, 0xe8e2d4);
}

/** la terraza de la acera: mesas de madera con dos sillas grises cada una */
function terraza(k, sitios) {
  for (const [s, z] of sitios) {
    k.table(s, ZF + z, { w: 0.7, d: 0.7, h: 0.75, top: 0xb08a5a, leg: 0x3a3a3c });
    k.chair(s - 0.5, ZF + z, Math.PI / 2, 0x4a4c50, { legs: 0x3a3a3c });
    k.chair(s + 0.5, ZF + z, -Math.PI / 2, 0x4a4c50, { legs: 0x3a3a3c });
    k.block(s, ZF + z, 0.7, 0.7);
  }
}

/** el tramo de El nido: el bajo del restaurante y las plantas de arriba con los balcones curvos */
function tramoNido(k) {
  const L = F1.len, c = L / 2;
  k.box(c, 0, Z + 0.15, L, YP, 0.3, ARENA);
  k.block(c, Z + 0.15, L, 0.3);
  paredAlta(k, 0, L, YP, TECHO, Z, ARENA);
  // el restaurante: la cristalera de marco negro, el toldo oscuro y el letrero
  k.pic(c, 1.25, ZF + 0.01, L - 0.8, 2.5, 0, 1, canvasTex(300, 130, barDentro), { glow: 0.15 });
  for (const t of [0.4, c, L - 0.4]) k.box(t, 0, ZF + 0.03, 0.1, 2.6, 0.06, 0x1e1e20);
  const tela = new THREE.BoxGeometry(L - 0.4, 0.03, Math.hypot(1.0, 0.3));
  tela.rotateX(Math.atan2(0.3, 1.0));
  tela.translate(c, 2.75 - 0.15, ZF + 0.5);
  k.add(tela, 0x2a2624);
  k.box(c, 2.4, ZF + 1.0, L - 0.4, 0.22, 0.02, 0x2a2624);
  k.box(c, 2.95, ZF + 0.03, L - 0.6, 0.6, 0.06, 0xe0dace);
  k.pic(c, 3.25, ZF + 0.065, L - 0.62, 0.58, 0, 1, canvasTex(420, 58, letreroNido));
  // la primera planta: dos ventanas de persiana
  for (const s of [1.4, 4.4]) ventanaPersiana(k, s, PLANTAS[0] + 0.5);
  // la segunda y la tercera: el balcón curvo de la izquierda (pegado al Maccheroni) y una ventana a su lado
  for (const y of PLANTAS.slice(1)) {
    const b0 = 0.15, b1 = 3.6, bc = (b0 + b1) / 2;
    k.box(bc, y - 0.15, ZF + 0.45, b1 - b0, 0.15, 0.9, 0xe6d4a8);
    k.box(bc - 0.4, y, ZF + 0.88, b1 - b0 - 0.8, 1.05, 0.12, ARENA);
    const curva = new THREE.CylinderGeometry(0.45, 0.45, 1.05, 16, 1, false, 0, Math.PI / 2);
    curva.translate(b1 - 0.45, y + 0.52, ZF + 0.45);
    k.add(curva, ARENA);
    k.box(bc, y + 1.05, ZF + 0.45, b1 - b0, 0.06, 0.9, 0xe6d4a8);
    ventana(k, bc, y + 0.3, 2.4, 1.7, Z, { carpinteria: '#e8e8e4', hojas: 3 });
    ventanaPersiana(k, 4.8, y + 0.5, 1.0, 1.3);
  }
  k.box(c, TECHO - 0.15, ZF + 0.05, L, 0.15, 0.1, 0xe6d4a8);
  // las antenas de la azotea
  for (const s of [1.5, 4.0]) { k.cyl(s, TECHO, Z - 2, 0.02, 0.02, 1.8, 0x9a9a9a, { seg: 6 }); k.box(s, TECHO + 1.5, Z - 2, 0.8, 0.03, 0.03, 0x9a9a9a); }
  // la pared del retranqueo, que da al oeste, en arena como la fachada
  k.box(L + 0.15, 0, Z - 0.55, 0.3, TECHO, 1.7, ARENA);
  terraza(k, [[1.0, 1.4], [2.9, 1.4], [4.8, 1.4]]);
}

/** el tramo de El Cortadito: el bajo de la cafetería con su toldo, el portal y las plantas de arriba */
function tramoCortadito(k) {
  const c = C1 / 2, L = C1 + 0.7;
  k.box(L / 2, 0, Z + 0.15, L, YP, 0.3, ARENA);
  k.block(L / 2, Z + 0.15, L, 0.3);
  paredAlta(k, 0, L, YP, TECHO, Z, ARENA);
  // la cafetería abierta, con su marco blanco
  k.pic(c, 1.25, ZF + 0.01, C1 - 0.3, 2.5, 0, 1, canvasTex(220, 160, barDentro), { glow: 0.25 });
  for (const t of [0.12, C1 - 0.12]) k.box(t, 0, ZF + 0.03, 0.14, 2.6, 0.06, BLANCO);
  // el toldo crema con sus faldones de rayas y el nombre
  const vuelo = 1.3, caida = 0.4;
  const tela = new THREE.BoxGeometry(C1, 0.03, Math.hypot(vuelo, caida));
  tela.rotateX(Math.atan2(caida, vuelo));
  tela.translate(c, 3.1 - caida / 2, ZF + vuelo / 2);
  k.add(tela, 0xf2e8dc);
  k.box(c, 2.7 - 0.5, ZF + vuelo, C1, 0.5, 0.03, 0xf2e8dc);
  k.pic(c, 2.45, ZF + vuelo + 0.02, C1 - 0.04, 0.48, 0, 1, canvasTex(400, 64, faldon));
  for (const t of [0.02, C1 - 0.02]) {
    const lado = new THREE.BoxGeometry(0.02, 0.5, vuelo);
    lado.translate(t, 2.45, ZF + vuelo / 2);
    k.add(lado, 0xf2e8dc);
  }
  // el portal marrón de al lado
  k.pic(C1 + 0.35, 1.15, ZF + 0.01, 0.6, 2.3, 0, 1, canvasTex(60, 230, portal));
  // arriba: dos ventanas de persiana por planta y el remate
  for (const y of PLANTAS) for (const s of [1.0, 2.9]) ventanaPersiana(k, s, y + 0.5);
  k.box(L / 2, TECHO - 0.15, ZF + 0.05, L, 0.15, 0.1, 0xe6d4a8);
  terraza(k, [[0.6, 1.5], [2.4, 1.5], [1.5, 2.6], [3.4, 2.6]]);
}

/** se monta con lo demás de Arrecife Centro: los dos tramos de la fachada */
export function buildElCortadito(scene, colliders, map) {
  if (!map?.elCortadito) return null;
  const partes = [];
  for (const [M, nom, hacer] of [[F1, 'elCortaditoNido', tramoNido], [F2, 'elCortadito', tramoCortadito]]) {
    const k = new Kit();
    hacer(k);
    const group = enMarco(k, M, nom, colliders);
    scene.add(group);
    partes.push(group);
  }
  return { partes };
}
