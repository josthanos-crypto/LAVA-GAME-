import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, aRasDelSuelo, sentados, sombrillaGrande, barDentro, barra, SERIF } from './restaurantesCharco.js';

/**
 * El restaurante Gambrinus, en los soportales del edificio de la avenida Fred Olsen, con la foto de Google
 * Maps de septiembre de 2026 (solo se mira, no va dentro del juego): el faldón rojo con «Restaurante ·
 * Gambrinus · Arrecife» y las dos figuras del rey brindando, los tres focos negros de encima, las columnas
 * redondas de granito del soportal, la cristalera oscura del local, encima el letrero azul de la óptica
 * (Canarias Visión, oculistas), y delante la terraza: mesas redondas de madera con pie de aluminio, sillas
 * negras, tres sombrillas blancas grandes, el árbol joven y las cartas de pie. El bloque del mapa se queda.
 */

// la cara sur del bloque, a la plaza de la avenida Fred Olsen (s de oeste a este)
const G = marco([-675.0, 431.5], [-652.9, 438.8]);
const Z = 0.3;

/** antes de levantar la ciudad: fuera el rótulo rojo genérico */
export function tuneGambrinus(map) {
  map.gambrinusSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Gambrinus');
  if (i >= 0) map.gambrinusSign = map.signs.splice(i, 1)[0];
  map.gambrinus = true;
}

// ——— lo que se pinta en lienzo ———

/** la figura crema del rey con la jarra levantada */
function rey(g, x, y, s, lado) {
  g.fillStyle = '#efe4c8';
  g.beginPath(); g.arc(x, y - s * 0.62, s * 0.13, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.moveTo(x - s * 0.22, y + s * 0.4); g.lineTo(x - s * 0.15, y - s * 0.45); g.lineTo(x + s * 0.15, y - s * 0.45); g.lineTo(x + s * 0.24, y + s * 0.4); g.closePath(); g.fill();
  // la corona y el brazo con la jarra
  g.fillRect(x - s * 0.1, y - s * 0.82, s * 0.2, s * 0.08);
  g.beginPath(); g.moveTo(x + lado * s * 0.12, y - s * 0.35); g.lineTo(x + lado * s * 0.36, y - s * 0.7); g.lineWidth = s * 0.07; g.strokeStyle = '#efe4c8'; g.stroke();
  g.fillRect(x + lado * s * 0.32 - s * 0.07, y - s * 0.86, s * 0.14, s * 0.18);
}

/** el faldón rojo: Restaurante · Gambrinus · Arrecife, con los dos reyes */
function faldon(g, w, h) {
  g.fillStyle = '#b8202a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#efe4c8';
  g.textBaseline = 'middle';
  g.textAlign = 'center';
  g.font = `500 ${Math.round(h * 0.34)}px ${SERIF}`;
  g.fillText('Restaurante', w * 0.15, h * 0.55);
  g.fillText('Arrecife', w * 0.88, h * 0.55);
  g.font = `700 ${Math.round(h * 0.56)}px ${SERIF}`;
  g.fillText('Gambrinus', w * 0.52, h * 0.52);
  rey(g, w * 0.32, h * 0.6, h * 0.9, 1);
  rey(g, w * 0.73, h * 0.6, h * 0.9, -1);
}

/** el letrero azul de la óptica de la primera planta */
function optica(g, w, h) {
  g.fillStyle = '#2a5a8a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8eef4';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `600 ${Math.round(h * 0.26)}px Arial, sans-serif`;
  g.fillText('Canarias Visión', w / 2, h * 0.28);
  g.font = `700 ${Math.round(h * 0.34)}px ${SERIF}`;
  g.fillText('OCULISTAS', w / 2, h * 0.72);
}

/** granito gris claro con motas, para las columnas */
function granito(g, w, h) {
  g.fillStyle = '#b8b4ac';
  g.fillRect(0, 0, w, h);
  let s = 11;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 900; i++) { const v = 120 + r() * 100; g.fillStyle = `rgb(${v},${v - 4},${v - 10})`; g.fillRect(r() * w, r() * h, 2, 2); }
  g.fillStyle = '#3a3836';
  for (const y of [0.12, 0.88]) g.fillRect(0, h * y, w, 3);
}

/** una carta de pie blanca */
function cartaPie(g, w, h) {
  g.fillStyle = '#f4f4f0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c8202a';
  g.fillRect(w * 0.1, h * 0.06, w * 0.8, h * 0.08);
  g.fillStyle = '#2a2c30';
  for (let y = 0.22; y < 0.9; y += 0.07) g.fillRect(w * 0.12, h * y, w * (0.5 + ((y * 13) % 0.3)), 3);
}

// ——— las piezas ———

/** el soportal de Gambrinus, de s 0 a 13 */
function soportal(k) {
  const s0 = 0.2, s1 = 12.8, H = 3.15;
  // la cristalera oscura del local, de lado a lado
  k.pic((s0 + s1) / 2, H / 2, Z, s1 - s0, H, 0, 1, canvasTex(1024, 256, barDentro));
  // las columnas redondas de granito, por delante
  const tex = canvasTex(128, 256, granito);
  for (const s of [s0 + 0.3, 4.4, 8.6, s1 - 0.3]) {
    const g = new THREE.CylinderGeometry(0.3, 0.3, H + 0.85, 16);
    g.translate(s, (H + 0.85) / 2, Z + 0.8);
    k.pics.push({ geo: g, tex, glow: 0 });
    k.block(s, Z + 0.8, 0.6, 0.6);
  }
  // el faldón rojo encima de la cristalera y los tres focos negros
  k.box((s0 + s1) / 2, H, Z + 0.2, s1 - s0, 0.85, 0.3, 0xb8202a);
  k.pic((s0 + s1) / 2, H + 0.42, Z + 0.355, s1 - s0, 0.8, 0, 1, canvasTex(1024, 80, faldon));
  for (const s of [3.2, 7.0, 10.6]) {
    barra(k, [s, H + 1.1, Z + 0.2], [s, H + 1.25, Z + 0.7], 0.04, 0x1d1d1f);
    k.cyl(s, H + 0.95, Z + 0.75, 0.06, 0.14, 0.24, 0x1d1d1f, { seg: 10, rx: 0.5 });
  }
  // el techo del soportal y, encima, el letrero azul de la óptica
  k.box((s0 + s1) / 2, H + 0.85, Z + 0.55, s1 - s0, 0.15, 1.1, 0xd8d4cc);
  k.pic(8.3, H + 2.0, Z + 0.06, 4.6, 1.1, 0, 1, canvasTex(460, 110, optica));
}

/** el árbol joven de la plaza: tronco fino y la copa de hojas en matas */
function arbol(k, s, z) {
  barra(k, [s, 0, z], [s + 0.2, 3.4, z - 0.1], 0.14, 0x6a5440);
  let sd = 29;
  const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 16; i++) k.ball(s + (r() - 0.5) * 2.2, 3.3 + r() * 2.0, z + (r() - 0.5) * 2.0, 0.35 + r() * 0.3, [0x7a9a3a, 0x6a8a32, 0x8aaa48][i % 3], { seg: 7 });
  k.block(s, z, 0.3, 0.3);
}

/** la terraza: mesas redondas de madera con pie de aluminio, sillas negras, sombrillas, el árbol y las cartas */
function terraza(k) {
  const mesas = [];
  for (const [s, z] of [[1.4, 2.6], [4.0, 2.4], [6.6, 2.6], [9.4, 2.4], [11.8, 2.6], [2.6, 5.0], [7.8, 5.2], [10.6, 5.0]]) {
    k.table(s, z, { w: 0.7, d: 0.7, h: 0.74, top: 0xb88a5a, leg: 0xc8ccd0, round: true });
    k.chair(s - 0.6, z, Math.PI / 2, 0x26282c, { legs: 0x26282c });
    k.chair(s + 0.6, z, -Math.PI / 2, 0x26282c, { legs: 0x26282c });
    k.block(s, z, 0.7, 0.7);
    mesas.push([s, z]);
  }
  for (const [s, z] of [[1.6, 3.8], [6.8, 3.9], [11.6, 3.8]]) sombrillaGrande(k, s, z, 0xf4f2ec);
  arbol(k, 5.2, 4.0);
  for (const s of [3.0, 8.0]) {
    k.box(s, 0, 1.7, 0.04, 1.0, 0.04, 0x8a8f94);
    k.pic(s, 1.25, 1.73, 0.62, 0.85, 0, 1, canvasTex(96, 132, cartaPie));
  }
  return mesas;
}

// la gente de la terraza (sin nombre: no hablan)
const CLIENTES = [
  { sex: 'm', skin: 0xf1d3b8, hair: 0x8c8580, hairStyle: 'short', top: 0xf2f2ee, bottom: 0x3a3a40, height: 1.78 },
  { sex: 'f', skin: 0xe8c4a2, hair: 0x6a4a2a, hairStyle: 'bun', top: 0x2a6ab0, bottom: 0x2a2f3a, height: 1.64 },
  { sex: 'm', skin: 0xc8916c, hair: 0x15110e, hairStyle: 'short', top: 0x3a3a40, bottom: 0x3b4a66, height: 1.74 },
  { sex: 'f', skin: 0xf1d3b8, hair: 0xd8c08a, hairStyle: 'ponytail', top: 0xe85a4a, bottom: 0x1d2b44, height: 1.68 },
].map(l => ({ eyes: 0x3a2616, topStyle: 'tshirt', bottomStyle: 'pants', shoes: 0x2a2c30, shoeStyle: 'shoe', build: 1, ...l }));

/** segunda fase, con los locales ya hechos */
export function buildGambrinus(scene, colliders, map, locales) {
  if (!map?.gambrinus) return null;
  const group = new THREE.Group();
  group.name = 'gambrinus';
  const kS = new Kit();
  soportal(kS);
  const kT = new Kit();
  const mesas = terraza(kT);
  const ter = enMarco(kT, G, 'terrazaGambrinus', colliders);
  group.add(enMarco(kS, G, 'soportalGambrinus', colliders), ter);
  scene.add(group);
  aRasDelSuelo(scene, ter);
  const gente = sentados(scene, locales, G, mesas, CLIENTES, [[1, 1], [3, -1], [4, 1], [6, -1]]);
  return { group, gente };
}
