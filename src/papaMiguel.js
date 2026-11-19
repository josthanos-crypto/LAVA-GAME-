import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, aRasDelSuelo, sentados, sombrillaGrande, barDentro } from './restaurantesCharco.js';

/**
 * Papa Miguel (café-bar, hamburguesería y cafetería), en la cara sur de la manzana de El Velero, al paseo
 * del Charco, con la foto de Google Maps de julio de 2022 (solo se mira, no va dentro del juego): el
 * letrero azul «PAPA MIGUEL · CAFÉ-BAR» con el timón en la franja blanca, el toldo azul marino con
 * «HAMBURGUESERÍA · CAFETERÍA» en el faldón, la cristalera con el bar dentro, el cierre azul de la
 * derecha, y en el paseo la terraza de mesas de aluminio con las sillas azules de plástico, las
 * sombrillas blancas, con la gente. Las palmeras de la foto ya las tiene el paseo del juego: una, entre
 * las mesas (s 13,1 a 4,8 m de la pared), y otra, al oeste; las mesas van alrededor. El bloque se queda.
 */

// la cara sur de la manzana, al paseo (s de oeste a este; Papa Miguel, de s 7,5 a 19,5; Mawi, más allá)
const M = marco([149.2, 49.6], [184.6, 48.6]);
const Z = 0.15, S0 = 7.5, S1 = 19.5;
const MARINO = 0x1e2e5a, AZUL = 0x2a64c8, ALUMINIO = 0xb8bcc0;

/** antes de levantar la ciudad: fuera el rótulo rojo genérico */
export function tunePapaMiguel(map) {
  map.papaMiguelSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Papa Miguel');
  if (i >= 0) map.papaMiguelSign = map.signs.splice(i, 1)[0];
  map.papaMiguel = true;
}

// ——— lo que se pinta en lienzo ———

/** el timón blanco */
function timon(g, x, y, r) {
  g.strokeStyle = '#f4f4f0';
  g.lineWidth = r * 0.16;
  g.beginPath(); g.arc(x, y, r * 0.7, 0, Math.PI * 2); g.stroke();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); g.stroke();
  }
  g.fillStyle = '#f4f4f0';
  g.beginPath(); g.arc(x, y, r * 0.2, 0, Math.PI * 2); g.fill();
}

/** el letrero azul: el timón, PAPA MIGUEL y CAFÉ-BAR */
function letrero(g, w, h) {
  g.fillStyle = '#2a64c8';
  g.fillRect(0, 0, w, h);
  timon(g, h * 0.55, h * 0.5, h * 0.36);
  g.fillStyle = '#f4f4f0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(h * 0.42)}px "Arial Black", Arial, sans-serif`;
  g.fillText('PAPA MIGUEL', w * 0.58, h * 0.4);
  g.font = `600 ${Math.round(h * 0.2)}px Arial, sans-serif`;
  g.fillText('CAFÉ - BAR', w * 0.58, h * 0.8);
}

/** el faldón del toldo: HAMBURGUESERÍA · CAFETERÍA */
function faldon(g, w, h) {
  g.fillStyle = '#1e2e5a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4f4f0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.6)}px Arial, sans-serif`;
  g.fillText('HAMBURGUESERÍA · CAFETERÍA', w * 0.3, h * 0.55);
  g.fillText('HAMBURGUESERÍA · CAFETERÍA', w * 0.78, h * 0.55);
}

/** el cierre metálico azul, bajado */
function cierre(g, w, h) {
  g.fillStyle = '#2a64c8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(0,0,0,.18)';
  for (let y = 0; y < h; y += 6) g.fillRect(0, y, w, 2);
}

// ——— las piezas ———

/** la planta baja: la cristalera, el cierre, la franja blanca con el letrero y el toldo azul marino */
function fachada(k) {
  const H = 2.95;
  k.pic((S0 + 17.4) / 2, H / 2, Z, 17.4 - S0, H, 0, 1, canvasTex(1024, 256, barDentro), { glow: 0.15 });
  for (const s of [S0, 10.8, 14.1, 17.4]) k.box(s, 0, Z + 0.03, 0.1, H, 0.06, AZUL);
  k.pic(18.45, H / 2, Z, 2.0, H, 0, 1, canvasTex(128, 192, cierre));
  // la franja blanca de encima y el letrero azul en medio
  k.box((S0 + S1) / 2, H, Z + 0.04, S1 - S0, 0.75, 0.08, 0xf2f2ee);
  k.pic(12.6, H + 0.4, Z + 0.09, 4.4, 0.66, 0, 1, canvasTex(512, 78, letrero));
  // el toldo azul marino, que baja hacia el paseo, con su faldón
  const fuera = 2.0, alto = H, bajo = 2.45, L = Math.hypot(fuera, alto - bajo), a = Math.atan2(alto - bajo, fuera);
  const tela = new THREE.BoxGeometry(17.4 - S0, 0.03, L);
  tela.rotateX(a);
  tela.translate((S0 + 17.4) / 2, (alto + bajo) / 2, Z + fuera / 2);
  k.add(tela, MARINO);
  k.box((S0 + 17.4) / 2, bajo - 0.28, Z + fuera, 17.4 - S0, 0.28, 0.02, MARINO);
  k.pic((S0 + 17.4) / 2, bajo - 0.14, Z + fuera + 0.015, 17.4 - S0, 0.26, 0, 1, canvasTex(1536, 40, faldon));
}

/** la terraza del paseo: mesas de aluminio, sillas azules y sombrillas blancas, alrededor de la palmera del juego */
function terraza(k) {
  const mesas = [];
  for (const z of [3.2, 5.6]) for (const s of [8.6, 11.0, 15.6, 18.0]) {
    k.table(s, z, { w: 0.7, d: 0.7, h: 0.74, top: ALUMINIO, leg: ALUMINIO });
    k.chair(s - 0.58, z, Math.PI / 2, AZUL, { legs: ALUMINIO });
    k.chair(s + 0.58, z, -Math.PI / 2, AZUL, { legs: ALUMINIO });
    k.block(s, z, 0.7, 0.7);
    mesas.push([s, z]);
  }
  for (const s of [9.8, 16.8]) sombrillaGrande(k, s, 4.4, 0xf4f2ec);
  return mesas;
}

// la gente de la terraza (sin nombre: no hablan)
const CLIENTES = [
  { sex: 'm', skin: 0xc8916c, hair: 0x15110e, hairStyle: 'short', top: 0xd8302a, bottom: 0x3a3a40, height: 1.76 },
  { sex: 'f', skin: 0xf1d3b8, hair: 0x8a5a3a, hairStyle: 'ponytail', top: 0xf2f2ee, bottom: 0x2a3a5a, height: 1.64 },
  { sex: 'f', skin: 0xe8c4a2, hair: 0x2a1a12, hairStyle: 'bun', top: 0xe8a0b0, bottom: 0x3a3a40, height: 1.62 },
  { sex: 'm', skin: 0xf1d3b8, hair: 0x5a4a3a, hairStyle: 'short', top: 0x2a4a8a, bottom: 0xc8b890, height: 1.8 },
].map(l => ({ eyes: 0x3a2616, topStyle: 'tshirt', bottomStyle: 'pants', shoes: 0x2a2c30, shoeStyle: 'shoe', build: 1, ...l }));

/** segunda fase, con los locales ya hechos */
export function buildPapaMiguel(scene, colliders, map, locales) {
  if (!map?.papaMiguel) return null;
  const group = new THREE.Group();
  group.name = 'papaMiguel';
  const kF = new Kit();
  fachada(kF);
  const kT = new Kit();
  const mesas = terraza(kT);
  const ter = enMarco(kT, M, 'terrazaPapaMiguel', colliders);
  group.add(enMarco(kF, M, 'fachadaPapaMiguel', colliders), ter);
  scene.add(group);
  aRasDelSuelo(scene, ter);
  const gente = sentados(scene, locales, M, mesas, CLIENTES, [[0, 1], [3, -1], [5, 1], [6, -1]]);
  return { group, gente };
}
