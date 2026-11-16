import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, aRasDelSuelo, sentados, mesaAlta, barra } from './restaurantesCharco.js';

/**
 * El Velero del Charco, en la cara oeste de su manzana, al pasaje El Velero, con la foto de su terraza de
 * Google Maps (solo se mira, no va dentro del juego): la pérgola de lona blanca con sus postes blancos y
 * el faldón con el nombre, las jardineras de barro con geranios colgadas de la pérgola, los faroles negros
 * de los postes, las mesas bajas de tablero gris claro con las sillas de aluminio gris, y delante la fila
 * de mesas altas con sus taburetes negros. La terraza cabe en lo empedrado del pasaje (unos 3,5 m); el
 * jardín de las palmeras de delante se queda como está, igual que el bloque blanco de balcones azules.
 */

// la cara oeste del bloque, al pasaje (s de norte a sur)
const V = marco([149.3, 29.9], [149.2, 49.6]);
const S0 = 3.0, S1 = 19.0, FONDO = 3.3;
const BLANCO = 0xf2f2ee, ALUMINIO = 0x9a9ea2, BARRO = 0xa8583a;

/** antes de levantar la ciudad: fuera el rótulo rojo genérico (y su mesa) */
export function tuneElVelero(map) {
  map.elVeleroSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'El Velero');
  if (i >= 0) map.elVeleroSign = map.signs.splice(i, 1)[0];
  map.elVelero = true;
}

// ——— lo que se pinta en lienzo ———

/** el velero azul marino dentro de su círculo */
function velero(g, x, y, r) {
  g.strokeStyle = '#1e3a6a';
  g.lineWidth = r * 0.08;
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#1e3a6a';
  g.beginPath(); g.moveTo(x - r * 0.05, y - r * 0.7); g.lineTo(x - r * 0.05, y + r * 0.25); g.lineTo(x - r * 0.55, y + r * 0.25); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(x + r * 0.05, y - r * 0.55); g.lineTo(x + r * 0.05, y + r * 0.25); g.lineTo(x + r * 0.45, y + r * 0.25); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(x - r * 0.6, y + r * 0.35); g.lineTo(x + r * 0.6, y + r * 0.35); g.lineTo(x + r * 0.4, y + r * 0.55); g.lineTo(x - r * 0.4, y + r * 0.55); g.closePath(); g.fill();
}

/** el faldón blanco de la pérgola: el velero y «El Velero del Charco», dos veces */
function faldon(g, w, h) {
  g.fillStyle = '#f4f4f0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(0,0,0,.08)';
  for (let x = 0; x < w; x += h * 1.2) { g.beginPath(); g.arc(x + h * 0.6, h, h * 0.55, Math.PI, 0); g.fill(); }
  for (const c of [0.25, 0.75]) {
    velero(g, w * c - h * 2.6, h * 0.48, h * 0.36);
    g.fillStyle = '#1e3a6a';
    g.textAlign = 'left';
    g.textBaseline = 'middle';
    g.font = `italic 600 ${Math.round(h * 0.5)}px Georgia, "Times New Roman", serif`;
    g.fillText('El Velero del Charco', w * c - h * 2.0, h * 0.52);
  }
}

// ——— las piezas ———

/** la pérgola: los postes, la lona, el faldón, las jardineras colgadas y los faroles */
function pergola(k) {
  const postes = [S0, 7.0, 11.0, 15.0, S1], alto = 3.25, bajo = 2.85;
  for (const s of postes) { k.box(s, 0, FONDO, 0.1, bajo, 0.1, BLANCO); k.block(s, FONDO, 0.14, 0.14); }
  // la lona, de la pared al travesaño de delante
  const L = Math.hypot(FONDO, alto - bajo), a = Math.atan2(alto - bajo, FONDO);
  const tela = new THREE.BoxGeometry(S1 - S0 + 0.3, 0.03, L);
  tela.rotateX(a);
  tela.translate((S0 + S1) / 2, (alto + bajo) / 2, FONDO / 2);
  k.add(tela, BLANCO);
  k.box((S0 + S1) / 2, bajo - 0.1, FONDO, S1 - S0 + 0.2, 0.12, 0.12, BLANCO);
  for (const s of postes) barra(k, [s, alto - 0.06, 0.05], [s, bajo - 0.04, FONDO], 0.04, BLANCO);
  k.pic((S0 + S1) / 2, bajo - 0.3, FONDO + 0.07, S1 - S0 + 0.2, 0.3, 0, 1, canvasTex(2048, 38, faldon));
  // las jardineras de barro colgadas, con sus geranios
  let sd = 5;
  const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (const s of [5.0, 9.0, 13.0, 17.0]) {
    const z = 2.3, y = 2.25;
    for (const ds of [-0.28, 0.28]) barra(k, [s + ds, y + 0.25, z], [s + ds, 3.0, z], 0.008, 0x3a3a3a);
    k.box(s, y, z, 0.72, 0.24, 0.26, BARRO);
    for (let i = 0; i < 6; i++) k.ball(s - 0.3 + i * 0.12, y + 0.32 + r() * 0.1, z + (r() - 0.5) * 0.12, 0.11 + r() * 0.05, [0x4a7a32, 0x5a8a3a][i % 2], { seg: 6 });
    for (let i = 0; i < 4; i++) k.ball(s - 0.25 + r() * 0.5, y + 0.42 + r() * 0.08, z + (r() - 0.5) * 0.14, 0.05, 0xd8303a, { seg: 5 });
  }
  // los faroles negros de los postes de dentro
  for (const s of [7.0, 11.0, 15.0]) {
    k.box(s, 2.25, FONDO - 0.16, 0.16, 0.24, 0.16, 0xffe2a8, { list: k.glow });
    k.box(s, 2.21, FONDO - 0.16, 0.2, 0.04, 0.2, 0x1e1e20);
    k.box(s, 2.49, FONDO - 0.16, 0.2, 0.05, 0.2, 0x1e1e20);
    k.box(s, 2.53, FONDO - 0.1, 0.03, 0.03, 0.14, 0x1e1e20);
  }
}

/** las mesas: las bajas grises con sillas de aluminio y, delante, las altas con taburetes negros */
function mesas(k) {
  const bajas = [];
  for (const s of [4.4, 6.2, 8.6, 10.4, 12.8, 14.6, 17.0]) {
    const z = 1.2;
    k.table(s, z, { w: 0.65, d: 0.65, h: 0.74, top: 0xd8d8d4, leg: ALUMINIO });
    k.chair(s - 0.55, z, Math.PI / 2, ALUMINIO, { legs: ALUMINIO });
    k.chair(s + 0.55, z, -Math.PI / 2, ALUMINIO, { legs: ALUMINIO });
    k.block(s, z, 0.65, 0.65);
    bajas.push([s, z]);
  }
  for (const s of [5.3, 9.5, 13.7, 17.6]) mesaAlta(k, s, 2.65);
  return bajas;
}

// la gente de la terraza (sin nombre: no hablan)
const CLIENTES = [
  { sex: 'f', skin: 0xf1d3b8, hair: 0xd8d6d0, hairStyle: 'bun', top: 0x5a6a7a, bottom: 0x2a2f3a, height: 1.62 },
  { sex: 'm', skin: 0xe8c4a2, hair: 0x3a2a1a, hairStyle: 'short', top: 0x8a9aa8, bottom: 0x3a3a40, height: 1.78 },
  { sex: 'm', skin: 0xc8916c, hair: 0x15110e, hairStyle: 'short', top: 0x1d1d22, bottom: 0x3b4a66, height: 1.74 },
  { sex: 'f', skin: 0xf1d3b8, hair: 0x8a5a3a, hairStyle: 'ponytail', top: 0xf2f2ee, bottom: 0x1d2b44, height: 1.66 },
].map(l => ({ eyes: 0x3a2616, topStyle: 'tshirt', bottomStyle: 'pants', shoes: 0x2a2c30, shoeStyle: 'shoe', build: 1, ...l }));

/** segunda fase, con los locales ya hechos */
export function buildElVelero(scene, colliders, map, locales) {
  if (!map?.elVelero) return null;
  const k = new Kit();
  pergola(k);
  const bajas = mesas(k);
  const group = enMarco(k, V, 'elVelero', colliders);
  scene.add(group);
  aRasDelSuelo(scene, group);
  const gente = sentados(scene, locales, V, bajas, CLIENTES, [[0, 1], [2, -1], [3, 1], [5, -1]]);
  return { group, gente };
}
