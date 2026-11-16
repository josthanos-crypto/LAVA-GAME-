import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, hueco, enMarco, aRasDelSuelo, sentados, sombrillaGrande, mesaAlta, barDentro, pizarraColgada, barra, WHITE } from './restaurantesCharco.js';

/**
 * Tres locales sueltos del centro, con las fotos de internet de Google Maps (solo se miran, no van dentro del
 * juego):
 *  - Mawi (bar de cócteles), en la esquina sureste de la manzana de El Velero, al paseo: el rótulo de letras rosas encendidas con la flor
 *    de colores encima del toldo, el toldo de lona beis plegable sobre su pérgola, el machón azul, la
 *    cristalera del bar y la terraza de sombrillas blancas, mesas altas y sillas blancas;
 *  - el Bar Cafetería Guanapay, en la punta estrecha de la manzana de la calle Laguna: las dos ventanas
 *    verdes con sus persianas, una encima de otra, el letrero rojo de lado a lado con «BAR CAFETERIA
 *    Guanapay» (sin las marcas de refresco de la foto) y los dos farolillos rojos redondos de brazo;
 *  - Antípoda (café de especialidad), en la esquina de la calle Francos: el zócalo gris oscuro, la puerta de
 *    cristal con la placa negra de «ANTÍPODA» encima, el escaparate, el toldo gris, la pizarra de pie y dos
 *    mesitas redondas con sus sillas. Ahora va con su edificio entero en antipoda.js; este bajo suelto solo se monta
 *    si aquel no está (map.antipoda).
 */

// Mawi: la cara sur de la manzana de El Velero, al paseo (s de oeste a este; Mawi va en la punta del este)
const M = marco([149.2, 49.6], [184.6, 48.6]);
// Guanapay: la punta estrecha de su manzana, mirando al oeste
const G = marco([-140.0, 84.0], [-141.3, 88.1]);
// Antípoda: la cara de la calle Francos, desde la esquina
const A = marco([-10.2, 123.0], [-4.0, 115.1]);

/** antes de levantar la ciudad: fuera los rótulos rojos genéricos de los tres */
export function tuneLocalesVarios(map) {
  map.localesVariosSigns = [];
  for (const name of ['Mawi', 'Bar Cafeteria Guanapay', 'Antipoda Cafe']) {
    const i = (map.signs || []).findIndex(s => s.name === name);
    if (i >= 0) map.localesVariosSigns.push(map.signs.splice(i, 1)[0]);
  }
  map.localesVarios = true;
}

// ——— lo que se pinta en lienzo ———

/** MAWI en letras rosas encendidas, con la flor de pétalos de colores delante */
function rotuloMawi(g, w, h) {
  g.clearRect(0, 0, w, h);
  // la flor: seis pétalos de colores alrededor
  const cx = h * 0.55, cy = h * 0.5, r = h * 0.22;
  const cols = ['#f2c21a', '#4ab0e8', '#7ac83a', '#f0607a', '#a05ad0', '#f08a1e'];
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    g.fillStyle = cols[i];
    g.beginPath(); g.ellipse(cx + Math.cos(a) * r, cy + Math.sin(a) * r, r * 0.95, r * 0.5, a, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = '#ffffff';
  g.beginPath(); g.arc(cx, cy, r * 0.45, 0, Math.PI * 2); g.fill();
  // las letras, con el brillo alrededor
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(h * 0.78)}px "Arial Black", Arial, sans-serif`;
  g.shadowColor = '#ff7ae8';
  g.shadowBlur = h * 0.12;
  g.fillStyle = '#ff9af0';
  g.fillText('MAWI', h * 1.15, h * 0.54);
  g.shadowBlur = 0;
  g.fillStyle = '#ffd0f6';
  g.fillText('MAWI', h * 1.15, h * 0.54);
}

/** el letrero rojo de Guanapay, de lado a lado de la punta */
function rotuloGuanapay(g, w, h) {
  g.fillStyle = '#c8202a';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#f2f2f2';
  g.lineWidth = 4;
  g.strokeRect(5, 5, w - 10, h - 10);
  g.fillStyle = '#f4f4f0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(h * 0.26)}px Arial, sans-serif`;
  g.fillText('BAR CAFETERIA', w / 2, h * 0.3);
  g.font = `800 ${Math.round(h * 0.42)}px Arial, sans-serif`;
  g.fillText('Guanapay', w / 2, h * 0.7);
}

/** ventana verde con las persianas de librillo arriba y los cristales con visillo */
function ventanaVerdeG(g, w, h) {
  g.fillStyle = '#2a7a3e';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8dcd8';
  for (let y = 6; y < h * 0.28; y += 6) g.fillRect(6, y, w - 12, 3);
  g.fillStyle = '#e6e2d8';
  for (const x of [0.06, 0.38, 0.7]) g.fillRect(w * x, h * 0.34, w * 0.26, h * 0.6);
  g.fillStyle = 'rgba(60,70,70,.25)';
  for (const x of [0.06, 0.38, 0.7]) g.fillRect(w * x, h * 0.34, w * 0.1, h * 0.6);
}

/** la placa negra de Antípoda */
function placaAntipoda(g, w, h) {
  g.fillStyle = '#1d1e20';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8e8e4';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `600 ${Math.round(h * 0.5)}px "Arial Narrow", Arial, sans-serif`;
  g.fillText('ANT/PØDA', w / 2, h * 0.55);
}

// ——— las piezas ———

/** el farolillo rojo redondo en su brazo curvo */
function farolillo(k, s, y, lado) {
  barra(k, [s, y, 0.05], [s + lado * 0.5, y + 0.25, 0.55], 0.04, 0x2a2a2c);
  k.ball(s + lado * 0.5, y - 0.05, 0.55, 0.24, 0xc8202a, { seg: 14 });
  k.ball(s + lado * 0.5, y - 0.05, 0.55 + 0.2, 0.07, 0xf2f2f2, { seg: 8 });
}

/** Mawi, en el marco M: pared, machón azul, cristalera, pérgola con el toldo y el rótulo encendido */
function mawi(k) {
  const s0 = 26.6, s1 = 35.1, sm = (s0 + s1) / 2, F = 4.2, Y = 2.9;
  k.box(sm, 0, 0.03, s1 - s0, 4.2, 0.06, WHITE);
  k.box(s1 - 0.6, 0, 0.12, 1.2, 4.2, 0.24, 0x2a4a8a);
  hueco(k, sm - 0.6, 0, 6.0, 2.6, canvasTex(512, 220, barDentro), { borde: 0x2a2a2c, z: 0.08 });
  // la pérgola: postes blancos y la lona del toldo en pendiente
  for (const s of [s0 + 0.2, sm, s1 - 1.3]) k.box(s, 0, F, 0.12, Y, 0.12, 0xf2f2ee);
  k.box(sm - 0.5, Y, F, s1 - s0 - 1.0, 0.12, 0.12, 0xf2f2ee);
  const dy = 0.6, L = Math.hypot(F, dy);
  const tela = new THREE.BoxGeometry(s1 - s0 - 1.0, 0.03, L);
  tela.rotateX(Math.atan2(dy, F));
  tela.translate(sm - 0.5, Y + 0.12 + dy / 2, F / 2);
  k.add(tela, 0xd8c8a8);
  // el faldón de la lona por delante
  k.box(sm - 0.5, Y - 0.22, F + 0.07, s1 - s0 - 1.0, 0.22, 0.02, 0xd8c8a8);
  // el rótulo de letras encendidas encima del toldo, mirando a la calle
  k.pic(sm - 0.5, Y + dy + 0.9, 0.3, 4.4, 0.95, 0, 1, canvasTex(560, 120, rotuloMawi), { glow: 1 });
  for (const s of [s0 + 0.2, sm, s1 - 1.3]) k.block(s, F, 0.15, 0.15);
}

/** la terraza de Mawi: sombrillas blancas, mesas altas y mesas bajas con sillas blancas */
function terrazaMawi(k) {
  const mesas = [];
  for (const [s, z] of [[28.0, 2.0], [30.8, 2.0], [33.2, 2.4], [29.4, 5.6], [32.2, 5.8]]) {
    k.table(s, z, { w: 0.7, d: 0.7, h: 0.75, top: 0xf2f2ee, leg: 0xd8d8d4 });
    k.chair(s - 0.55, z, Math.PI / 2, 0xf4f4f0, { legs: 0xd8d8d4 });
    k.chair(s + 0.55, z, -Math.PI / 2, 0xf4f4f0, { legs: 0xd8d8d4 });
    k.block(s, z, 0.7, 0.7);
    mesas.push([s, z]);
  }
  for (const s of [27.2, 34.4]) mesaAlta(k, s, 6.6);
  for (const [s, z] of [[25.8, 5.8], [35.0, 4.8]]) sombrillaGrande(k, s, z, 0xf4f4f0);
  return mesas;
}

/** Guanapay, en la punta estrecha G: las ventanas verdes, el letrero rojo, la puerta y los farolillos */
function guanapay(k) {
  const L = G.len, c = L / 2;
  k.box(c, 0, 0.03, L, 9.0, 0.06, WHITE);
  hueco(k, c, 0, 1.4, 2.4, canvasTex(160, 288, barDentro), { borde: 0x2a7a3e, z: 0.08 });
  k.box(c, 2.75, 0.12, L - 0.1, 0.9, 0.18, 0xc8202a);
  k.pic(c, 3.2, 0.215, L - 0.2, 0.86, 0, 1, canvasTex(420, 86, rotuloGuanapay));
  for (const y of [4.4, 7.0]) hueco(k, c, y, 2.2, 1.5, canvasTex(220, 150, ventanaVerdeG), { borde: 0x2a7a3e, z: 0.08 });
  farolillo(k, 0.15, 4.0, -1);
  farolillo(k, L - 0.15, 4.0, 1);
}

/** Antípoda, en el marco A desde la esquina */
function antipoda(k) {
  k.box(3.0, 0, 0.03, 6.0, 0.9, 0.06, 0x3a3c40);
  hueco(k, 1.5, 0, 1.3, 2.5, canvasTex(144, 280, barDentro), { borde: 0x2a2a2c, z: 0.08 });
  k.box(1.5, 2.65, 0.1, 1.5, 0.36, 0.06, 0x1d1e20);
  k.pic(1.5, 2.83, 0.135, 1.44, 0.32, 0, 1, canvasTex(240, 54, placaAntipoda));
  hueco(k, 4.0, 0.9, 2.4, 1.6, canvasTex(240, 160, barDentro), { borde: 0x2a2a2c, z: 0.08 });
  // el toldo gris del escaparate
  const tela = new THREE.BoxGeometry(2.8, 0.03, Math.hypot(1.2, 0.35));
  tela.rotateX(Math.atan2(0.35, 1.2));
  tela.translate(4.0, 2.85 - 0.175, 0.65);
  k.add(tela, 0x6a6e72);
  k.box(4.0, 2.4, 1.25, 2.8, 0.18, 0.02, 0x6a6e72);
  // la pizarra de pie y las dos mesitas redondas
  for (const a of [0.2, -0.2]) {
    const g = new THREE.BoxGeometry(0.5, 0.85, 0.03);
    g.translate(0, 0.42, 0);
    g.rotateX(a);
    g.translate(2.7, 0, 1.1 + Math.sign(a) * 0.08);
    k.add(g, 0x23262a);
  }
  for (const s of [0.4, 5.6]) {
    k.table(s, 1.2, { w: 0.6, d: 0.6, h: 0.74, top: 0x2a2c30, leg: 0x2a2c30, round: true });
    k.chair(s, 1.8, Math.PI, 0x2a2c30, { legs: 0x2a2c30 });
    k.block(s, 1.2, 0.6, 0.6);
  }
}

// la gente de la terraza de Mawi (sin nombre: no hablan)
const CLIENTES = [
  { sex: 'f', skin: 0xe8c4a2, hair: 0x2a1d14, hairStyle: 'ponytail', top: 0xf2f2ee, bottom: 0x2a2f3a, height: 1.66 },
  { sex: 'm', skin: 0xd9a882, hair: 0x15110e, hairStyle: 'short', top: 0x1d1d1f, bottom: 0x3b4a66, height: 1.8 },
  { sex: 'f', skin: 0xf1d3b8, hair: 0xd8c08a, hairStyle: 'bun', top: 0xd85a8a, bottom: 0x1d2b44, height: 1.62 },
  { sex: 'm', skin: 0xc28a62, hair: 0x2a1d14, hairStyle: 'short', top: 0x4a8ac8, bottom: 0x22252a, height: 1.76 },
].map(l => ({ eyes: 0x3a2616, topStyle: 'tshirt', bottomStyle: 'pants', shoes: 0x2a2c30, shoeStyle: 'shoe', build: 1, ...l }));

/** segunda fase, con los locales ya hechos */
export function buildLocalesVarios(scene, colliders, map, locales) {
  if (!map?.localesVarios) return null;
  const group = new THREE.Group();
  group.name = 'localesVarios';
  const kM = new Kit();
  mawi(kM);
  const kT = new Kit();
  const mesas = terrazaMawi(kT);
  const terraza = enMarco(kT, M, 'terrazaMawi', colliders);
  const kG = new Kit();
  guanapay(kG);
  // Antípoda va ahora con su edificio entero en antipoda.js; este bajo suelto solo si aquel no está
  let antip = null;
  if (!map.antipoda) {
    const kA = new Kit();
    antipoda(kA);
    antip = enMarco(kA, A, 'antipoda', colliders);
  }
  const mw = enMarco(kM, M, 'mawi', colliders);
  // la fachada de Mawi y la de Antípoda salen 15 cm, por delante de los escaparates que pone el juego en esas paredes
  for (const [g, F] of [[mw, M], [antip, A]]) if (g) { g.position.x += F.N[0] * 0.15; g.position.z += F.N[1] * 0.15; }
  group.add(mw, terraza, enMarco(kG, G, 'guanapay', colliders));
  if (antip) group.add(antip);
  scene.add(group);
  aRasDelSuelo(scene, terraza);
  if (antip) aRasDelSuelo(scene, antip);
  const gente = sentados(scene, locales, M, mesas, CLIENTES, [[0, 1], [1, -1], [2, 1], [4, -1]]);
  return { group, gente };
}
