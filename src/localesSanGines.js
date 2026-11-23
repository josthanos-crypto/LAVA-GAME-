import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import {
  marco, hueco, enMarco, aRasDelSuelo, sentados, sombrillaGrande, barDentro, pizarraColgada, barra, SERIF,
} from './restaurantesCharco.js';

/**
 * Los bares de la calle de detrás de la iglesia de San Ginés, con las fotos de internet de Google Maps (solo
 * se miran, no van dentro del juego):
 *  - el Bar Andalucía 1960: la puerta de madera con el abanico de cristal encima, el letrero redondo colgado
 *    de su brazo de hierro, los dos faroles, la pizarra, la tabla de la pared con sus escuadras, la maceta,
 *    el barril de mesa y los taburetes;
 *  - Barbacana: el cajón azul marino con BARBACANA y el rombo, el toldo verde oscuro de «Barbacana grill», el
 *    escaparate de madera, el cerramiento blanco de la terraza y la terraza en la calle con las sillas de
 *    madera curvada y las sombrillas beis.
 * El Príncipe Café, en la misma manzana, sale en Google Maps como cerrado para siempre: se deja como estaba.
 */

// el Bar Andalucía, en la cara sur de su manzana (s de oeste a este, z hacia la calle)
const A = marco([188.0, 401.2], [207.5, 392.0]);
// Barbacana, en la cara sur de la manzana de al lado (s de oeste a este)
const B = marco([213.0, 389.4], [235.7, 378.2]);
const MADERA = 0x5a3a24, MARINO = 0x1e2a44;

/** antes de levantar la ciudad: fuera los rótulos rojos genéricos (y sus mesas) de los dos bares */
export function tuneLocalesSanGines(map) {
  map.localesSanGinesSigns = [];
  for (const name of ['Bar Andalucía 1960', 'Barbacana']) {
    const i = (map.signs || []).findIndex(s => s.name === name);
    if (i >= 0) map.localesSanGinesSigns.push(map.signs.splice(i, 1)[0]);
  }
  map.localesSanGines = true;
}

// ——— lo que se pinta en lienzo ———

/** la puerta de madera oscura de cuarterones con el abanico de cristal encima */
function puertaAbanico(g, w, h) {
  g.fillStyle = '#2f3a30';
  g.fillRect(0, 0, w, h);
  // el abanico: medio círculo con los radios
  const cx = w / 2, cy = h * 0.22, r = w * 0.42;
  g.fillStyle = '#1e2624';
  g.beginPath(); g.arc(cx, cy, r, Math.PI, 0); g.fill();
  g.strokeStyle = '#3e5a44';
  g.lineWidth = 3;
  for (let i = 0; i <= 8; i++) { const a = Math.PI + (i * Math.PI) / 8; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); g.stroke(); }
  g.beginPath(); g.arc(cx, cy, r, Math.PI, 0); g.stroke();
  // las dos hojas con sus cuarterones
  g.strokeStyle = '#1e2a22';
  g.lineWidth = 4;
  for (const x0 of [w * 0.06, w * 0.52]) {
    g.strokeRect(x0, h * 0.26, w * 0.42, h * 0.7);
    g.strokeRect(x0 + w * 0.06, h * 0.3, w * 0.3, h * 0.28);
    g.strokeRect(x0 + w * 0.06, h * 0.62, w * 0.3, h * 0.3);
  }
}

/** el letrero redondo: BAR, ANDALUCÍA y 1960 en blanco sobre marrón */
function letreroAndalucia(g, w, h) {
  g.clearRect(0, 0, w, h);
  g.fillStyle = '#4a2c22';
  g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#d8c8b0';
  g.lineWidth = 3;
  g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 8, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#f2ece0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.13)}px ${SERIF}`;
  g.fillText('BAR', w / 2, h * 0.3);
  g.font = `700 ${Math.round(h * 0.15)}px ${SERIF}`;
  g.fillText('ANDALUCÍA', w / 2, h * 0.5);
  g.font = `600 ${Math.round(h * 0.1)}px ${SERIF}`;
  g.fillText('1960', w / 2, h * 0.69);
}

/** el cajón azul marino de Barbacana con el nombre y el rombo */
function rotuloBarbacana(g, w, h) {
  g.fillStyle = '#1e2a44';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f2ece0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.55)}px ${SERIF}`;
  g.fillText('BARBACANA', w * 0.45, h * 0.55);
  // el rombo con la raya dentro
  const x = w * 0.88, y = h * 0.52, r = h * 0.3;
  g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + r, y); g.lineTo(x, y + r); g.lineTo(x - r, y); g.closePath(); g.fill();
  g.strokeStyle = '#1e2a44';
  g.lineWidth = 3;
  g.beginPath(); g.moveTo(x - r * 0.5, y + r * 0.3); g.lineTo(x + r * 0.5, y - r * 0.3); g.stroke();
}

/** el faldón del toldo verde oscuro: «Barbacana» y GRILL */
function faldonBarbacana(g, w, h) {
  g.fillStyle = '#2f3f2c';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#efe6d2';
  g.textBaseline = 'middle';
  g.textAlign = 'center';
  g.font = `italic 700 ${Math.round(h * 0.6)}px ${SERIF}`;
  g.fillText('Barbacana', w * 0.42, h * 0.52);
  g.font = `700 ${Math.round(h * 0.36)}px Arial, sans-serif`;
  g.fillText('GRILL', w * 0.8, h * 0.55);
}

/** el escaparate de madera con cristales y lo de dentro */
function escaparateMadera(g, w, h) {
  barDentro(g, w, h);
  g.fillStyle = '#5a3a24';
  g.fillRect(0, 0, w, 8);
  g.fillRect(0, h - 10, w, 10);
  for (let x = 0; x <= w; x += w / 4) g.fillRect(x - 4, 0, 8, h);
  g.fillRect(0, h * 0.62, w, 6);
}

// ——— las piezas ———

/** taburete alto de madera */
function taburete(k, s, z) {
  k.cyl(s, 0, z, 0.03, 0.03, 0.72, 0x3a2a1e, { seg: 5 });
  for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) k.box(s + a * 0.11, 0, z + b * 0.11, 0.03, 0.7, 0.03, 0x3a2a1e);
  k.cyl(s, 0.72, z, 0.17, 0.17, 0.05, 0x6a4430, { seg: 12 });
  k.block(s, z, 0.34, 0.34);
}

/** el barril de mesa */
function barril(k, s, z) {
  k.cyl(s, 0, z, 0.27, 0.27, 0.06, 0x4a3020, { seg: 14 });
  k.cyl(s, 0.06, z, 0.3, 0.27, 0.42, 0x8a5a34, { seg: 14 });
  k.cyl(s, 0.48, z, 0.27, 0.3, 0.42, 0x8a5a34, { seg: 14 });
  for (const y of [0.15, 0.48, 0.82]) k.cyl(s, y, z, 0.305, 0.305, 0.04, 0x2a2a2a, { seg: 14 });
  k.block(s, z, 0.6, 0.6);
}

/** el farol de pared de los de siempre */
function farolPared(k, s, y) {
  k.box(s, y + 0.05, 0.12, 0.04, 0.04, 0.22, 0x1d1d1f);
  k.box(s, y - 0.25, 0.26, 0.14, 0.24, 0.14, 0xf3e2b8, { list: k.glow });
  k.cyl(s, y - 0.02, 0.26, 0.02, 0.13, 0.1, 0x1d1d1f, { seg: 4, ry: Math.PI / 4 });
  k.box(s, y - 0.38, 0.26, 0.16, 0.03, 0.16, 0x1d1d1f);
}

/** el Bar Andalucía, en el marco A */
function barAndalucia(k) {
  const p = 18.3;
  hueco(k, p, 0, 1.15, 2.7, canvasTex(144, 336, puertaAbanico), { borde: 0x2a3a2e });
  // el letrero redondo colgado de su brazo de hierro con volutas
  barra(k, [p, 3.5, 0.02], [p, 3.5, 0.95], 0.04, 0x1d1d1f);
  barra(k, [p, 3.15, 0.02], [p, 3.48, 0.6], 0.03, 0x1d1d1f);
  k.pic(p, 3.1, 0.7, 0.62, 0.62, 1, 0, canvasTex(160, 160, letreroAndalucia));
  k.pic(p, 3.1, 0.7, 0.62, 0.62, -1, 0, canvasTex(160, 160, letreroAndalucia));
  for (const s of [p - 1.0, p + 1.0]) farolPared(k, s, 2.95);
  // la pizarra, la tabla de la pared con sus escuadras, la maceta, el barril y los taburetes
  k.pic(p - 1.65, 1.45, 0.05, 0.55, 0.85, 0, 1, canvasTex(88, 136, pizarraColgada(41)));
  k.box(p - 3.4, 1.08, 0.18, 1.3, 0.05, 0.34, 0x7a5236);
  for (const s of [p - 3.9, p - 2.9]) barra(k, [s, 0.75, 0.02], [s, 1.06, 0.3], 0.04, 0x1d1d1f);
  taburete(k, p - 3.6, 0.65);
  taburete(k, p - 3.0, 0.7);
  k.cyl(p - 2.3, 0.72, 0.4, 0.2, 0.14, 0.3, 0xb8603a, { seg: 10 });
  k.ball(p - 2.3, 1.05, 0.4, 0.2, 0x3a6a2e, { seg: 8 });
  taburete(k, p - 2.3, 0.4);
  barril(k, p + 1.5, 0.6);
  taburete(k, p + 1.0, 0.95);
  taburete(k, p + 2.0, 0.95);
}

/** Barbacana, en el marco B: escaparate, cajón con el nombre, toldo y el cerramiento blanco */
function barbacana(k) {
  const c = 8.7;
  hueco(k, c - 0.5, 0, 2.2, 2.5, canvasTex(264, 300, escaparateMadera), { borde: MADERA });
  hueco(k, c + 1.3, 0, 1.0, 2.45, canvasTex(120, 296, barDentro), { borde: MADERA });
  // el cajón azul marino que sale de la pared, con el nombre
  k.box(c + 0.3, 2.95, 0.22, 3.9, 0.62, 0.42, MARINO);
  k.pic(c + 0.3, 3.26, 0.435, 3.8, 0.58, 0, 1, canvasTex(600, 92, rotuloBarbacana));
  // el toldo verde oscuro debajo, en pendiente, con su faldón
  const L = 1.4, dy = 0.35, ancho = 3.8;
  const tela = new THREE.BoxGeometry(ancho, 0.03, Math.hypot(L, dy));
  tela.rotateX(Math.atan2(dy, L));
  tela.translate(c + 0.3, 2.85 - dy / 2, 0.45 + L / 2);
  k.add(tela, 0x2f3f2c);
  k.pic(c + 0.3, 2.85 - dy - 0.14, 0.47 + L, ancho, 0.3, 0, 1, canvasTex(480, 38, faldonBarbacana));
  // el cerramiento blanco de la terraza, a la izquierda: postes, el techo de lona y los paños transparentes
  const s0 = c - 5.4, s1 = c - 1.9, z1 = 2.6, Hc = 2.35;
  for (const [s, z] of [[s0, z1], [s1, z1], [s0, 0.3]]) k.box(s, 0, z, 0.08, Hc, 0.08, 0xeeeeea);
  k.box((s0 + s1) / 2, Hc, (0.3 + z1) / 2, s1 - s0 + 0.1, 0.1, z1, 0xf2f0ea);
  k.box((s0 + s1) / 2, 0.02, z1, s1 - s0, Hc - 0.1, 0.02, 0xcfe0e6, { list: k.glass });
  k.box(s0, 0.02, (0.3 + z1) / 2, 0.02, Hc - 0.1, z1 - 0.3, 0xcfe0e6, { list: k.glass });
  k.block((s0 + s1) / 2, z1, s1 - s0, 0.1);
  k.block(s0, (0.3 + z1) / 2, 0.1, z1 - 0.3);
}

/** la terraza de Barbacana en la calle: mesas de madera, sillas de madera curvada y las sombrillas beis */
function terrazaBarbacana(k) {
  const mesas = [];
  for (const [s, z] of [[4.2, 1.4], [5.9, 1.4], [10.9, 1.5], [12.6, 1.5], [11.7, 3.1]]) {
    k.table(s, z, { w: 0.7, d: 0.7, h: 0.75, top: 0x8a6440, leg: 0x2a2a2c });
    k.chair(s - 0.55, z, Math.PI / 2, 0x7a4a2a, { legs: 0x5a3a24 });
    k.chair(s + 0.55, z, -Math.PI / 2, 0x7a4a2a, { legs: 0x5a3a24 });
    k.block(s, z, 0.7, 0.7);
    mesas.push([s, z]);
  }
  for (const [s, z] of [[11.3, 2.2], [14.0, 2.0]]) sombrillaGrande(k, s, z, 0xd8cbb0);
  return mesas;
}

// la gente de las dos terrazas (sin nombre: no hablan)
const CLIENTES = [
  { sex: 'm', skin: 0xf1d3b8, hair: 0x8c8580, hairStyle: 'short', top: 0xe8e2d4, bottom: 0x3b4a66, height: 1.76 },
  { sex: 'f', skin: 0xe8c4a2, hair: 0xd8c08a, hairStyle: 'bun', top: 0xd85a4a, bottom: 0x2a2f3a, height: 1.63 },
  { sex: 'm', skin: 0xc8916c, hair: 0x2a1d14, hairStyle: 'short', top: 0x2a4a6a, bottom: 0x22252a, height: 1.74, beard: true },
].map(l => ({ eyes: 0x3a2616, topStyle: 'tshirt', bottomStyle: 'pants', shoes: 0x2a2c30, shoeStyle: 'shoe', build: 1, ...l }));

/** segunda fase, con los locales ya hechos */
export function buildLocalesSanGines(scene, colliders, map, locales) {
  if (!map?.localesSanGines) return null;
  const group = new THREE.Group();
  group.name = 'localesSanGines';
  const kA = new Kit();
  barAndalucia(kA);
  const andalucia = enMarco(kA, A, 'barAndalucia', colliders);
  const kB = new Kit();
  barbacana(kB);
  group.add(enMarco(kB, B, 'barbacana', colliders));
  const kT = new Kit();
  const mesas = terrazaBarbacana(kT);
  const terraza = enMarco(kT, B, 'terrazaBarbacana', colliders);
  group.add(andalucia, terraza);
  scene.add(group);
  aRasDelSuelo(scene, andalucia);
  aRasDelSuelo(scene, terraza);
  const gente = sentados(scene, locales, B, mesas, CLIENTES, [[0, 1], [2, -1], [3, 1]]);
  return { group, gente };
}
