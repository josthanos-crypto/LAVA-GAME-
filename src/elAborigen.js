import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, aRasDelSuelo, sentados } from './restaurantesCharco.js';

/**
 * La Cafetería El Aborigen, en la cara oeste de su bloque, a la plaza de la calle Doctor Ruperto González
 * Negrín, con las fotos de Google Maps (solo se miran, no van dentro del juego): la tabla color cobre con
 * «CAFETERÍA EL ABORIGEN» en letras claras, el toldo granate recogido, el cajón gris del cierre, la
 * cristalera de marcos negros con el rótulo esmerilado y los triángulos, la puerta abierta con la
 * cafetería dentro (las paredes beis, los taburetes rojos de la barra y la tele), los pilares de granito
 * negro y, en la plaza, la pérgola oscura con las mesas y las sillas negras, las dos sombrillas blancas
 * cerradas y la gente. El bloque se queda.
 */

// la cara oeste del bloque, a la plaza (s de sur a norte)
const A = marco([-140.7, 495.4], [-139.3, 517.5]);
const Z = 0.15, S0 = 9.6, S1 = 16.6, H = 2.8, NEGRO = 0x1c1c1e;

/** antes de levantar la ciudad: fuera el rótulo rojo genérico */
export function tuneElAborigen(map) {
  map.elAborigenSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'El Aborigen');
  if (i >= 0) map.elAborigenSign = map.signs.splice(i, 1)[0];
  map.elAborigen = true;
}

// ——— lo que se pinta en lienzo ———

/** la tabla color cobre con CAFETERÍA arriba y EL ABORIGEN grande */
function tabla(g, w, h) {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, '#a8643a');
  gr.addColorStop(1, '#7a4426');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#4a2814';
  g.lineWidth = 5;
  g.strokeRect(3, 3, w - 6, h - 6);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  for (const [txt, y, size] of [['CAFETERÍA', 0.28, 0.26], ['EL ABORIGEN', 0.68, 0.44]]) {
    g.font = `700 ${Math.round(h * size)}px Georgia, "Times New Roman", serif`;
    g.fillStyle = '#3a2010';
    g.fillText(txt, w / 2 + 2, h * y + 2);
    g.fillStyle = '#ead8b4';
    g.fillText(txt, w / 2, h * y);
  }
}

/** por la puerta: las paredes beis, los cuadros, la tele, la barra y los taburetes rojos */
function dentro(g, w, h) {
  g.fillStyle = '#e2cfa0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f2f0ea';
  g.fillRect(0, 0, w, h * 0.12);
  g.fillStyle = '#b8a888';
  g.fillRect(0, h * 0.75, w, h * 0.25);
  g.fillStyle = '#8a5a3a';
  g.fillRect(w * 0.1, h * 0.28, w * 0.25, h * 0.2);
  g.fillStyle = '#2a2a2e';
  g.fillRect(w * 0.6, h * 0.2, w * 0.3, h * 0.14);
  g.fillStyle = '#5a8ac8';
  g.fillRect(w * 0.62, h * 0.215, w * 0.26, h * 0.11);
  g.fillStyle = '#6a4a32';
  g.fillRect(w * 0.45, h * 0.52, w * 0.55, h * 0.2);
  g.fillStyle = '#c8202a';
  for (const x of [0.15, 0.27, 0.39]) { g.fillRect(w * x, h * 0.55, w * 0.07, h * 0.04); g.fillRect(w * x + w * 0.03, h * 0.59, w * 0.012, h * 0.16); }
}

/** un paño de la cristalera: el reflejo, el rótulo esmerilado y, si toca, los triángulos */
function pano(conTriangulos, conNombre) {
  return (g, w, h) => {
    g.fillStyle = '#6a6c6e';
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(220,226,230,.35)';
    g.fillRect(0, 0, w * 0.45, h);
    if (conTriangulos) {
      for (let j = 0; j < 4; j++) for (let i = 0; i <= j; i++) {
        const x = w * (0.5 - j * 0.1 + i * 0.2), y = h * (0.06 + j * 0.08);
        g.fillStyle = (i + j) % 2 ? 'rgba(240,240,240,.85)' : 'rgba(150,150,150,.8)';
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + w * 0.1, y + h * 0.08); g.lineTo(x - w * 0.1, y + h * 0.08); g.closePath(); g.fill();
      }
    }
    if (conNombre) {
      g.fillStyle = 'rgba(240,240,240,.8)';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = `700 ${Math.round(w * 0.16)}px Georgia, serif`;
      g.fillText('EL ABORIGEN', w / 2, h * 0.52);
      g.font = `400 ${Math.round(w * 0.1)}px Georgia, serif`;
      g.fillText('CAFETERÍA', w / 2, h * 0.6);
      g.fillStyle = 'rgba(240,240,240,.6)';
      for (let y = 0.74; y < 0.9; y += 0.03) g.fillRect(0, h * y, w, h * 0.012);
    }
  };
}

// ——— las piezas ———

/** la planta baja: la cristalera con la puerta, los pilares, el cierre, el toldo granate y la tabla */
function fachada(k) {
  // los paños de cristal a los lados de la puerta y el hueco de la puerta con lo de dentro
  k.pic(10.9, H / 2, Z, 2.4, H, 0, 1, canvasTex(160, 192, pano(false, true)));
  k.pic(13.2, H / 2, Z, 1.9, H, 0, 1, canvasTex(160, 240, dentro), { glow: 0.15 });
  k.pic(15.35, H / 2, Z, 2.3, H, 0, 1, canvasTex(160, 192, pano(true, false)));
  for (const s of [9.7, 12.2, 14.2, 16.5]) k.box(s, 0, Z + 0.03, 0.08, H, 0.06, NEGRO);
  k.box(13.2, 0, Z + 0.25, 2.0, 0.14, 0.5, 0x8a8c8e);
  // los pilares de granito negro de los lados
  for (const [s, w] of [[9.25, 0.7], [16.95, 0.7]]) k.box(s, 0, Z + 0.1, w, 4.4, 0.25, NEGRO);
  // el cajón gris del cierre y el toldo granate recogido
  k.box((S0 + S1) / 2, H, Z + 0.12, S1 - S0, 0.32, 0.25, 0x9a9c9e);
  const fuera = 1.0, alto = 3.45, bajo = 3.05, L = Math.hypot(fuera, alto - bajo), a = Math.atan2(alto - bajo, fuera);
  const tela = new THREE.BoxGeometry(S1 - S0, 0.03, L);
  tela.rotateX(a);
  tela.translate((S0 + S1) / 2, (alto + bajo) / 2, Z + fuera / 2);
  k.add(tela, 0x7a2a32);
  k.box((S0 + S1) / 2, bajo - 0.18, Z + fuera, S1 - S0, 0.18, 0.02, 0x7a2a32);
  // la tabla color cobre de encima
  k.box((S0 + S1) / 2, 3.5, Z + 0.06, 5.4, 0.95, 0.08, 0x5a3018);
  k.pic((S0 + S1) / 2, 3.97, Z + 0.105, 5.3, 0.88, 0, 1, canvasTex(600, 100, tabla));
}

/** la pérgola oscura de la plaza: cuatro postes y el techo de lamas */
function pergola(k) {
  const s0 = 9.3, s1 = 15.3, z0 = 2.4, z1 = 6.6, alto = 2.7;
  for (const [s, z] of [[s0, z0], [s1, z0], [s0, z1], [s1, z1]]) { k.box(s, 0, z, 0.1, alto, 0.1, NEGRO); k.block(s, z, 0.14, 0.14); }
  k.box((s0 + s1) / 2, alto, (z0 + z1) / 2, s1 - s0 + 0.2, 0.05, z1 - z0 + 0.2, 0x3a3c40);
  for (const z of [z0, z1]) k.box((s0 + s1) / 2, alto - 0.12, z, s1 - s0 + 0.1, 0.12, 0.08, NEGRO);
  for (const s of [s0, s1]) k.box(s, alto - 0.12, (z0 + z1) / 2, 0.08, 0.12, z1 - z0, NEGRO);
}

/** una sombrilla blanca cerrada, de pie */
function cerrada(k, s, z) {
  k.cyl(s, 0, z, 0.25, 0.28, 0.08, 0x4a4c50, { seg: 10 });
  k.cyl(s, 0.08, z, 0.03, 0.03, 2.6, 0xc8c2b4, { seg: 6 });
  k.cyl(s, 0.9, z, 0.04, 0.18, 1.7, 0xf2f0ea, { seg: 10 });
  k.block(s, z, 0.4, 0.4);
}

/** la terraza: la pérgola, las mesas negras con sus sillas, las sombrillas cerradas */
function terraza(k) {
  pergola(k);
  const mesas = [];
  for (const [s, z] of [[10.6, 3.4], [13.6, 3.4], [10.6, 5.6], [13.6, 5.6], [17.2, 4.4]]) {
    k.table(s, z, { w: 0.7, d: 0.7, h: 0.74, top: 0x2a2a2c, leg: NEGRO });
    k.chair(s - 0.58, z, Math.PI / 2, 0x2a2a2c, { legs: NEGRO });
    k.chair(s + 0.58, z, -Math.PI / 2, 0x2a2a2c, { legs: NEGRO });
    k.block(s, z, 0.7, 0.7);
    mesas.push([s, z]);
  }
  cerrada(k, 8.4, 4.4);
  cerrada(k, 16.2, 6.6);
  return mesas;
}

// la gente de la terraza (sin nombre: no hablan)
const CLIENTES = [
  { sex: 'm', skin: 0xf1d3b8, hair: 0xd8d6d0, hairStyle: 'short', top: 0xe8e4da, bottom: 0x3a3a40, height: 1.72 },
  { sex: 'm', skin: 0xe8c4a2, hair: 0xb8b4ac, hairStyle: 'short', top: 0x2a3a5a, bottom: 0x2a2f3a, height: 1.76 },
  { sex: 'm', skin: 0xc8916c, hair: 0x6a6660, hairStyle: 'short', top: 0xf2f2ee, bottom: 0x8a7a5a, height: 1.7 },
  { sex: 'm', skin: 0xf1d3b8, hair: 0x3a2a1a, hairStyle: 'short', top: 0xc8e040, bottom: 0x3a3a40, height: 1.78 },
].map(l => ({ eyes: 0x3a2616, topStyle: 'tshirt', bottomStyle: 'pants', shoes: 0x2a2c30, shoeStyle: 'shoe', build: 1, ...l }));

/** segunda fase, con los locales ya hechos */
export function buildElAborigen(scene, colliders, map, locales) {
  if (!map?.elAborigen) return null;
  const group = new THREE.Group();
  group.name = 'elAborigen';
  const kF = new Kit();
  fachada(kF);
  const kT = new Kit();
  const mesas = terraza(kT);
  const ter = enMarco(kT, A, 'terrazaElAborigen', colliders);
  group.add(enMarco(kF, A, 'fachadaElAborigen', colliders), ter);
  scene.add(group);
  aRasDelSuelo(scene, ter);
  const gente = sentados(scene, locales, A, mesas, CLIENTES, [[0, 1], [1, -1], [2, -1], [4, 1]]);
  return { group, gente };
}
