import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, aRasDelSuelo, sentados } from './restaurantesCharco.js';

/**
 * Fresco d'Italia, la heladería y crepería de la avenida Doctor Rafael González, en la esquina de la calle
 * Coronel Bens, con la foto de Google Maps (solo se mira, no va dentro del juego): la planta baja chapada
 * de piedra gris clara, el letrero blanco de lado a lado con «Heladería Cremería» y «Fresco d'Italia» en
 * letra de mano gris azulada, el toldo gris oscuro, la cristalera con la vitrina de los helados dentro, la
 * puerta de cristal de marco oscuro a la derecha y, en la acera, la terraza: dos sombrillas cuadradas
 * color topo, mesitas, sillas azul marino de plástico, las dos jardineras blancas de hormigón con sus
 * matas en el borde de la acera y la gente. El bloque del mapa (de ocho plantas) se queda.
 */

// la cara sur del bloque, a la avenida (s desde la esquina de Coronel Bens, hacia el este)
const F = marco([-205.6, 492.4], [-188.0, 488.9]);
const Z = 0.15, MARCO = 0x2e3034, TOPO = 0xb4a6a2, AZUL_SILLA = 0x1e2a5c;

/** antes de levantar la ciudad: fuera el rótulo rojo genérico */
export function tuneFrescoItalia(map) {
  map.frescoItaliaSign = null;
  const i = (map.signs || []).findIndex(s => s.name === "Fresco d'Italia");
  if (i >= 0) map.frescoItaliaSign = map.signs.splice(i, 1)[0];
  map.frescoItalia = true;
}

// ——— lo que se pinta en lienzo ———

const MANO = '"Segoe Script", "Brush Script MT", "Lucida Handwriting", cursive';

/** la piedra gris clara con motas de la chapa */
function piedra(g, w, h) {
  g.fillStyle = '#c4c2bc';
  g.fillRect(0, 0, w, h);
  let s = 19;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 2600; i++) { const v = 150 + r() * 80; g.fillStyle = `rgb(${v},${v - 2},${v - 6})`; g.fillRect(r() * w, r() * h, 2, 2); }
  g.strokeStyle = 'rgba(120,118,112,.5)';
  g.lineWidth = 1;
  for (let y = 0; y < h; y += h / 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  for (let x = 0; x < w; x += w / 10) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
}

/** el letrero blanco: Heladería Cremería · Fresco d'Italia */
function letrero(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c8c8c4';
  g.lineWidth = 4;
  g.strokeRect(2, 2, w - 4, h - 4);
  g.fillStyle = '#3c4c5e';
  g.textBaseline = 'middle';
  g.textAlign = 'center';
  g.font = `700 ${Math.round(h * 0.5)}px ${MANO}`;
  g.fillText('Heladería Cremería', w * 0.3, h * 0.58);
  g.font = `400 ${Math.round(h * 0.3)}px ${MANO}`;
  g.fillText("Fresco d'", w * 0.64, h * 0.4);
  g.font = `700 ${Math.round(h * 0.7)}px ${MANO}`;
  g.fillText('Italia', w * 0.82, h * 0.56);
}

/** por la cristalera: la vitrina larga de los helados de colores, la pared clara y la gente */
function heladeria(g, w, h) {
  g.fillStyle = '#ece8e0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8d2c6';
  g.fillRect(0, h * 0.78, w, h * 0.22);
  // la pizarra de los sabores y las baldas de los cucuruchos
  g.fillStyle = '#3a3a3e';
  g.fillRect(w * 0.12, h * 0.12, w * 0.3, h * 0.16);
  g.fillStyle = '#e8c890';
  for (let x = 0.55; x < 0.9; x += 0.03) { g.beginPath(); g.moveTo(w * x, h * 0.3); g.lineTo(w * x + w * 0.008, h * 0.2); g.lineTo(w * x + w * 0.016, h * 0.3); g.fill(); }
  // la vitrina: el cristal inclinado, las cubetas de colores y el mueble
  g.fillStyle = 'rgba(210,225,232,.55)';
  g.beginPath(); g.moveTo(w * 0.05, h * 0.62); g.lineTo(w * 0.1, h * 0.46); g.lineTo(w * 0.95, h * 0.46); g.lineTo(w * 0.95, h * 0.62); g.closePath(); g.fill();
  const sabores = ['#f4e6c0', '#7a4a2a', '#c8e0b0', '#f0b8c0', '#fff4d8', '#e8a040', '#a8c8e8', '#d8302a', '#f8f0e8', '#9a6a3a'];
  for (let i = 0; i < 20; i++) {
    g.fillStyle = sabores[i % sabores.length];
    const x = 0.1 + i * 0.042;
    g.beginPath(); g.ellipse(w * (x + 0.018), h * 0.56, w * 0.019, h * 0.04, 0, Math.PI, 0); g.fill();
  }
  g.fillStyle = '#c8ccd0';
  g.fillRect(w * 0.05, h * 0.56, w * 0.9, h * 0.06);
  g.fillStyle = '#4a4c52';
  g.fillRect(w * 0.05, h * 0.62, w * 0.9, h * 0.16);
  // las dependientas detrás y algún cliente
  for (const [x, c] of [[0.3, '#2a2c32'], [0.62, '#2a2c32']]) {
    g.fillStyle = c; g.fillRect(w * x, h * 0.32, w * 0.05, h * 0.16);
    g.fillStyle = '#e4c4a4'; g.beginPath(); g.arc(w * x + w * 0.025, h * 0.29, w * 0.018, 0, Math.PI * 2); g.fill();
  }
  // el reflejo de la calle en el cristal
  const gr = g.createLinearGradient(0, 0, w, h);
  gr.addColorStop(0, 'rgba(255,255,255,.18)');
  gr.addColorStop(0.5, 'rgba(255,255,255,0)');
  gr.addColorStop(1, 'rgba(255,255,255,.12)');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
}

/** la puerta de cristal: el pasillo oscuro de dentro */
function puertaDentro(g, w, h) {
  g.fillStyle = '#5a5c60';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#8a8c8e';
  g.fillRect(w * 0.1, h * 0.1, w * 0.8, h * 0.6);
  g.fillStyle = 'rgba(255,255,255,.15)';
  g.fillRect(0, 0, w * 0.4, h);
}

// ——— las piezas ———

/** la planta baja: la piedra, la cristalera, la puerta, el toldo gris y el letrero */
function fachada(k) {
  const s0 = 0.9, s1 = 8.6, H = 2.9;
  // la chapa de piedra gris clara de toda la planta baja
  k.pic(6.0, 2.2, Z - 0.02, 11.7, 4.4, 0, 1, canvasTex(512, 192, piedra));
  // la cristalera con la heladería detrás, entre montantes oscuros
  k.pic((s0 + s1) / 2, H / 2 + 0.1, Z, s1 - s0, H - 0.2, 0, 1, canvasTex(1024, 384, heladeria), { glow: 0.2 });
  for (const s of [s0, s0 + 2.6, s0 + 5.1, s1]) k.box(s, 0, Z + 0.03, 0.08, H, 0.06, MARCO);
  k.box((s0 + s1) / 2, 0, Z + 0.04, s1 - s0, 0.18, 0.08, MARCO);
  k.box((s0 + s1) / 2, H - 0.08, Z + 0.04, s1 - s0, 0.1, 0.08, MARCO);
  // la puerta de cristal de marco oscuro, a la derecha
  k.pic(9.8, 1.3, Z, 1.6, 2.6, 0, 1, canvasTex(128, 208, puertaDentro));
  for (const s of [9.0, 9.8, 10.6]) k.box(s, 0, Z + 0.03, 0.08, 2.65, 0.06, MARCO);
  k.box(9.8, 2.6, Z + 0.03, 1.68, 0.1, 0.06, MARCO);
  // el toldo gris oscuro, que baja hacia la acera
  const fuera = 1.3, alto = 3.05, bajo = 2.6, L = Math.hypot(fuera, alto - bajo), a = Math.atan2(alto - bajo, fuera);
  const tela = new THREE.BoxGeometry(s1 - s0 + 0.2, 0.03, L);
  tela.rotateX(a);
  tela.translate((s0 + s1) / 2, (alto + bajo) / 2, Z + fuera / 2);
  k.add(tela, 0x45474c);
  k.box((s0 + s1) / 2, bajo - 0.2, Z + fuera, s1 - s0 + 0.2, 0.2, 0.02, 0x45474c);
  // el letrero blanco de encima
  k.box((s0 + s1) / 2, 3.15, Z + 0.04, s1 - s0 + 0.2, 0.75, 0.08, 0xe8e8e4);
  k.pic((s0 + s1) / 2, 3.525, Z + 0.085, s1 - s0 + 0.1, 0.7, 0, 1, canvasTex(1024, 96, letrero));
}

/** una sombrilla cuadrada color topo, más pequeña que las grandes del paseo */
function sombrilla(k, s, z) {
  k.cyl(s, 0, z, 0.22, 0.25, 0.08, 0x3a3d42, { seg: 10 });
  k.cyl(s, 0.08, z, 0.03, 0.03, 2.45, 0xc8c2b4, { seg: 6 });
  const tela = new THREE.ConeGeometry(1.55, 0.42, 4, 1, true);
  tela.rotateY(Math.PI / 4);
  tela.translate(s, 2.5, z);
  k.add(tela, TOPO);
  for (const [dx, dz, w, d] of [[0, 1.1, 2.2, 0.02], [0, -1.1, 2.2, 0.02], [1.1, 0, 0.02, 2.2], [-1.1, 0, 0.02, 2.2]]) k.box(s + dx, 2.14, z + dz, w, 0.16, d, TOPO);
  k.block(s, z, 0.3, 0.3);
}

/** una jardinera blanca de hormigón con sus matas */
function jardinera(k, s, z) {
  k.box(s, 0, z, 2.2, 0.55, 0.5, 0xe6e4de);
  k.box(s, 0.55, z, 2.1, 0.02, 0.42, 0x5a4a3a);
  let sd = Math.round(s * 13);
  const r = () => (sd = (sd * 16807 + 7) % 2147483647) / 2147483647;
  for (let i = 0; i < 9; i++) k.ball(s - 0.9 + i * 0.22, 0.75 + r() * 0.2, z + (r() - 0.5) * 0.2, 0.2 + r() * 0.08, [0x5a7a3a, 0x6a8a42, 0x4a6a32][i % 3], { seg: 6 });
  k.block(s, z, 2.2, 0.5);
}

/** la terraza de la acera: mesitas, sillas azul marino, las sombrillas y las jardineras del borde */
function terraza(k) {
  const mesas = [];
  for (const s of [1.9, 3.7, 5.5, 7.3]) {
    const z = 1.35;
    k.table(s, z, { w: 0.6, d: 0.6, h: 0.72, top: 0x3a3c40, leg: 0x9a9ea2 });
    k.chair(s - 0.55, z, Math.PI / 2, AZUL_SILLA, { legs: AZUL_SILLA });
    k.chair(s + 0.55, z, -Math.PI / 2, AZUL_SILLA, { legs: AZUL_SILLA });
    k.block(s, z, 0.6, 0.6);
    mesas.push([s, z]);
  }
  for (const s of [2.8, 6.4]) sombrilla(k, s, 1.45);
  for (const s of [2.2, 6.9]) jardinera(k, s, 2.6);
  return mesas;
}

// la gente de la terraza (sin nombre: no hablan)
const CLIENTES = [
  { sex: 'f', skin: 0xe8c4a2, hair: 0x3a2a1a, hairStyle: 'ponytail', top: 0xf2f2ee, bottom: 0x2a3a5a, height: 1.64 },
  { sex: 'm', skin: 0xc8916c, hair: 0x15110e, hairStyle: 'short', top: 0x2a4a8a, bottom: 0x3a3a40, height: 1.76 },
  { sex: 'f', skin: 0xf1d3b8, hair: 0xb89060, hairStyle: 'bun', top: 0xe8b0a0, bottom: 0x3a3a40, height: 1.62 },
  { sex: 'm', skin: 0xf1d3b8, hair: 0x5a4a3a, hairStyle: 'short', top: 0xe8e4da, bottom: 0x3b4a66, height: 1.8 },
].map(l => ({ eyes: 0x3a2616, topStyle: 'tshirt', bottomStyle: 'pants', shoes: 0x2a2c30, shoeStyle: 'shoe', build: 1, ...l }));

/** segunda fase, con los locales ya hechos */
export function buildFrescoItalia(scene, colliders, map, locales) {
  if (!map?.frescoItalia) return null;
  const group = new THREE.Group();
  group.name = 'frescoItalia';
  const kF = new Kit();
  fachada(kF);
  const kT = new Kit();
  const mesas = terraza(kT);
  const ter = enMarco(kT, F, 'terrazaFrescoItalia', colliders);
  group.add(enMarco(kF, F, 'fachadaFrescoItalia', colliders), ter);
  scene.add(group);
  aRasDelSuelo(scene, ter);
  const gente = sentados(scene, locales, F, mesas, CLIENTES, [[0, 1], [1, -1], [2, 1], [3, -1]]);
  return { group, gente };
}
