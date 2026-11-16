import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, aRasDelSuelo, sentados, pizarraColgada } from './restaurantesCharco.js';

/**
 * La Tentación, el bar de la fachada que da a la plaza de la iglesia de San Ginés, con la foto de noche
 * de Google Maps (solo se mira, no va dentro del juego): los dos toldos negros con «La Tentación» en
 * letra de mano blanca en el faldón (ocupa también el local de al lado, el del antiguo El Príncipe Café,
 * que Google Maps da como cerrado), la cristalera de marcos negros con el bar encendido dentro, las
 * pizarras de la puerta, las mamparas de cristal de marco negro a los lados de la terraza y las mesitas
 * oscuras con sillas grises. En el juego la calle de delante es de coches y deja unos 2 m: una sola fila
 * de mesas pegada a la pared y los toldos cortos. El bloque se queda.
 */

// la cara este del bloque, a la plaza de la iglesia (s de norte a sur, hasta la esquina)
const T = marco([239.6, 365.7], [235.2, 358.6]);
const Z = 0.15, NEGRO = 0x1a1a1c, H = 2.9;

/** antes de levantar la ciudad: fuera los rótulos genéricos de La Tentación y del cerrado El Príncipe Café */
export function tuneLaTentacion(map) {
  map.laTentacionSigns = [];
  for (const nombre of ['La Tentacíon', 'El Príncipe Café']) {
    const i = (map.signs || []).findIndex(s => s.name === nombre);
    if (i >= 0) map.laTentacionSigns.push(map.signs.splice(i, 1)[0]);
  }
  map.laTentacion = true;
}

// ——— lo que se pinta en lienzo ———

/** el faldón negro del toldo con La Tentación en blanco */
function faldon(g, w, h) {
  g.fillStyle = '#141416';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4f2ec';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.62)}px "Segoe Script", "Brush Script MT", cursive`;
  g.fillText('La Tentación', w / 2, h * 0.55);
}

/** por la cristalera: el bar encendido, las mesas con gente, las baldas y la luz amarilla */
function bar(g, w, h) {
  g.fillStyle = '#4a3a2a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8c090';
  g.fillRect(0, 0, w, h * 0.55);
  g.fillStyle = '#7a5a3a';
  g.fillRect(0, h * 0.55, w, h * 0.45);
  for (const y of [0.18, 0.32]) {
    g.fillStyle = '#5a4030';
    g.fillRect(w * 0.55, h * y, w * 0.4, h * 0.015);
    for (let x = 0.57; x < 0.93; x += 0.03) { g.fillStyle = ['#3a5a2a', '#e8d8a0', '#8a2a22'][Math.floor(x * 70) % 3]; g.fillRect(w * x, h * y - h * 0.07, w * 0.015, h * 0.07); }
  }
  g.fillStyle = 'rgba(40,30,26,.75)';
  for (const x of [0.1, 0.24, 0.4]) { g.beginPath(); g.arc(w * x, h * 0.42, w * 0.025, 0, Math.PI * 2); g.fill(); g.fillRect(w * x - w * 0.03, h * 0.45, w * 0.06, h * 0.2); }
  const luz = g.createRadialGradient(w * 0.4, h * 0.1, 4, w * 0.4, h * 0.1, w * 0.8);
  luz.addColorStop(0, 'rgba(255,220,150,.45)');
  luz.addColorStop(1, 'rgba(255,220,150,0)');
  g.fillStyle = luz;
  g.fillRect(0, 0, w, h);
}

/** el cristal de las mamparas */
function mampara(g, w, h) {
  g.fillStyle = 'rgba(200,214,220,1)';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.35)';
  g.fillRect(0, 0, w * 0.3, h);
}

// ——— las piezas ———

/** la cristalera, los toldos negros con su nombre y las pizarras de la puerta */
function fachada(k) {
  const s0 = 0.4, s1 = T.len - 0.2;
  k.pic((s0 + s1) / 2, H / 2, Z, s1 - s0, H, 0, 1, canvasTex(768, 256, bar), { glow: 0.12 });
  for (const s of [s0, 2.4, 4.4, 6.3, s1]) k.box(s, 0, Z + 0.03, 0.09, H, 0.06, NEGRO);
  k.box((s0 + s1) / 2, H - 0.08, Z + 0.03, s1 - s0, 0.1, 0.06, NEGRO);
  k.box((s0 + s1) / 2, 0, Z + 0.03, s1 - s0, 0.25, 0.06, NEGRO);
  // los dos toldos negros, cortos, con el faldón de La Tentación
  const fuera = 1.8, alto = 3.15, bajo = 2.55, L = Math.hypot(fuera, alto - bajo), a = Math.atan2(alto - bajo, fuera);
  for (const [a0, a1] of [[s0, 4.3], [4.5, s1]]) {
    const tela = new THREE.BoxGeometry(a1 - a0, 0.03, L);
    tela.rotateX(a);
    tela.translate((a0 + a1) / 2, (alto + bajo) / 2, Z + fuera / 2);
    k.add(tela, NEGRO);
    k.box((a0 + a1) / 2, bajo - 0.34, Z + fuera, a1 - a0, 0.34, 0.02, NEGRO);
    k.pic((a0 + a1) / 2, bajo - 0.17, Z + fuera + 0.015, a1 - a0 - 0.1, 0.32, 0, 1, canvasTex(512, 52, faldon));
    for (const s of [a0 + 0.1, a1 - 0.1]) k.box(s, 2.6, Z + 0.9, 0.04, 0.04, 1.75, NEGRO);
  }
  // las dos pizarras de la puerta, colgadas del cristal
  for (const [s, seed] of [[3.4, 19], [5.4, 37]]) k.pic(s, 1.5, Z + 0.07, 0.55, 0.8, 0, 1, canvasTex(96, 140, pizarraColgada(seed)));
}

/** la terraza pegada a la pared: mesitas oscuras, sillas grises y las mamparas de los lados */
function terraza(k) {
  const mesas = [];
  for (const s of [1.4, 3.4, 5.4, 7.3]) {
    const z = 1.0;
    k.table(s, z, { w: 0.6, d: 0.6, h: 0.74, top: 0x2a2a2c, leg: NEGRO });
    k.chair(s - 0.55, z, Math.PI / 2, 0x8a8e92, { legs: 0x6a6e72 });
    k.chair(s + 0.55, z, -Math.PI / 2, 0x8a8e92, { legs: 0x6a6e72 });
    k.block(s, z, 0.6, 0.6);
    mesas.push([s, z]);
  }
  // las mamparas de cristal de los lados, de marco negro
  for (const s of [0.35, T.len - 0.25]) {
    k.box(s, 0, 1.0, 0.05, 0.12, 1.7, NEGRO);
    k.box(s, 1.5, 1.0, 0.05, 0.05, 1.7, NEGRO);
    k.pic(s, 0.81, 1.0, 1.66, 1.38, 1, 0, canvasTex(64, 64, mampara));
    k.pic(s, 0.81, 1.0, 1.66, 1.38, -1, 0, canvasTex(64, 64, mampara));
    k.block(s, 1.0, 0.1, 1.7);
  }
  return mesas;
}

// la gente de la terraza (sin nombre: no hablan)
const CLIENTES = [
  { sex: 'f', skin: 0xf1d3b8, hair: 0xc8a070, hairStyle: 'ponytail', top: 0xd8303a, bottom: 0x2a3a5a, height: 1.64 },
  { sex: 'm', skin: 0xe8c4a2, hair: 0x3a2a1a, hairStyle: 'short', top: 0x5a6a7a, bottom: 0x3a3a40, height: 1.78 },
  { sex: 'm', skin: 0xc8916c, hair: 0x15110e, hairStyle: 'short', top: 0x2a2c30, bottom: 0x3b4a66, height: 1.74 },
].map(l => ({ eyes: 0x3a2616, topStyle: 'tshirt', bottomStyle: 'pants', shoes: 0x2a2c30, shoeStyle: 'shoe', build: 1, ...l }));

/** segunda fase, con los locales ya hechos */
export function buildLaTentacion(scene, colliders, map, locales) {
  if (!map?.laTentacion) return null;
  const group = new THREE.Group();
  group.name = 'laTentacion';
  const kF = new Kit();
  fachada(kF);
  const kT = new Kit();
  const mesas = terraza(kT);
  const ter = enMarco(kT, T, 'terrazaLaTentacion', colliders);
  group.add(enMarco(kF, T, 'fachadaLaTentacion', colliders), ter);
  scene.add(group);
  aRasDelSuelo(scene, ter);
  const gente = sentados(scene, locales, T, mesas, CLIENTES, [[0, 1], [2, -1], [3, 1]]);
  return { group, gente };
}
