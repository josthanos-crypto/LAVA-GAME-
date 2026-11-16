import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, aRasDelSuelo, sentados, sombrillaGrande, barDentro, barra } from './restaurantesCharco.js';

/**
 * El Bar & Restaurant Asturias, en la placita de la calle Almirante Boado Endeiza, con la foto de su
 * terraza de Google Maps (solo se mira, no va dentro del juego): los pilares chapados de piedra clara de
 * la planta baja con la cristalera oscura del bar entre ellos, el letrero blanco ovalado de «BAR &
 * RESTAURANT · Asturias» colgado de su brazo de hierro en el pilar de la esquina, y en la placita la
 * terraza de sombrillas blancas grandes con mesas negras y sillas negras de rejilla, con la gente. El
 * bloque del mapa se queda como está.
 */

// la cara sur del bloque, a la placita (s de oeste a este, hasta el rincón del ala del este)
const A = marco([-476.4, 476.3], [-461.3, 476.3]);
const Z = 0.15, NEGRO = 0x1e1e20;

/** antes de levantar la ciudad: fuera el rótulo rojo genérico */
export function tuneBarAsturias(map) {
  map.barAsturiasSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Asturias');
  if (i >= 0) map.barAsturiasSign = map.signs.splice(i, 1)[0];
  map.barAsturias = true;
}

// ——— lo que se pinta en lienzo ———

/** la piedra clara de los pilares, en placas */
function piedraClara(g, w, h) {
  g.fillStyle = '#cfc2a8';
  g.fillRect(0, 0, w, h);
  let s = 31;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const ph = h / 8;
  for (let j = 0; j < 8; j++) for (let x = (j % 2) * w * 0.25; x < w; x += w * 0.5) {
    const v = 190 + r() * 30;
    g.fillStyle = `rgb(${v},${v - 12},${v - 34})`;
    g.fillRect(x + 1, j * ph + 1, w * 0.5 - 2, ph - 2);
  }
  for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(120,100,80,${0.1 + r() * 0.2})`; g.fillRect(r() * w, r() * h, 2, 2); }
}

/** el letrero ovalado: la corona pequeña, BAR & RESTAURANT y Asturias en verde */
function letrero(g, w, h) {
  g.fillStyle = '#f6f4ee';
  g.fillRect(0, 0, w, h);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  // la corona de arriba
  g.fillStyle = '#c8a040';
  g.beginPath(); g.moveTo(w * 0.4, h * 0.2); g.lineTo(w * 0.43, h * 0.08); g.lineTo(w * 0.47, h * 0.15); g.lineTo(w * 0.5, h * 0.05); g.lineTo(w * 0.53, h * 0.15); g.lineTo(w * 0.57, h * 0.08); g.lineTo(w * 0.6, h * 0.2); g.closePath(); g.fill();
  g.fillStyle = '#1e1e20';
  g.font = `700 ${Math.round(h * 0.13)}px Georgia, "Times New Roman", serif`;
  g.fillText('BAR &', w / 2, h * 0.34);
  g.fillText('RESTAURANT', w / 2, h * 0.5);
  g.fillStyle = '#2a7a3a';
  g.font = `italic 700 ${Math.round(h * 0.2)}px Georgia, "Times New Roman", serif`;
  g.fillText('Asturias', w / 2, h * 0.72);
}

// ——— las piezas ———

/** la planta baja: los pilares de piedra, la cristalera del bar y el letrero colgado de la esquina */
function fachada(k) {
  const H = 3.4, pil = [0.3, 5.0, 10.0, A.len - 0.4];
  const tex = canvasTex(64, 256, piedraClara);
  // la cristalera oscura entre los pilares, con su marco negro
  for (let i = 0; i < pil.length - 1; i++) {
    const a = pil[i] + 0.35, b = pil[i + 1] - 0.35;
    k.pic((a + b) / 2, H / 2, Z, b - a, H, 0, 1, canvasTex(512, 256, barDentro), { glow: 0.15 });
    k.box((a + b) / 2, H - 0.12, Z + 0.03, b - a, 0.12, 0.06, NEGRO);
    k.box((a + b) / 2, 0, Z + 0.03, b - a, 0.12, 0.06, NEGRO);
  }
  // los pilares chapados de piedra clara
  for (const s of pil) {
    k.box(s, 0, Z + 0.2, 0.7, H + 0.4, 0.5, 0xcfc2a8);
    k.pic(s, (H + 0.4) / 2, Z + 0.455, 0.7, H + 0.4, 0, 1, tex);
  }
  // el letrero ovalado, de canto a la fachada, colgado del brazo de hierro del pilar del este
  const s = pil[3], z = Z + 1.25, y = 2.75;
  barra(k, [s, y + 0.75, Z + 0.45], [s, y + 0.75, z + 0.45], 0.03, NEGRO);
  barra(k, [s, y + 0.25, Z + 0.45], [s, y + 0.75, Z + 0.95], 0.02, NEGRO);
  for (const dz of [-0.25, 0.25]) barra(k, [s, y + 0.75, z + dz], [s, y + 0.5, z + dz], 0.01, NEGRO);
  const disco = new THREE.CylinderGeometry(0.5, 0.5, 0.05, 28);
  disco.rotateZ(Math.PI / 2);
  disco.scale(1, 1.25, 1);
  disco.translate(s, y, z);
  k.add(disco, 0x2a2a2a);
  for (const nx of [1, -1]) k.pic(s + nx * 0.03, y, z, 0.78, 0.92, nx, 0, canvasTex(160, 190, letrero));
}

/** la terraza de la placita: sombrillas blancas, mesas negras y sillas negras de rejilla */
function terraza(k) {
  const mesas = [];
  for (const z of [2.4, 4.6, 6.8]) for (const s of [2.2, 5.6, 9.0, 12.4]) {
    const ss = s + (z === 4.6 ? 0.8 : 0);
    k.table(ss, z, { w: 0.7, d: 0.7, h: 0.74, top: 0x26272a, leg: NEGRO });
    k.chair(ss - 0.58, z, Math.PI / 2, 0x2a2a2c, { legs: NEGRO });
    k.chair(ss + 0.58, z, -Math.PI / 2, 0x2a2a2c, { legs: NEGRO });
    k.block(ss, z, 0.7, 0.7);
    mesas.push([ss, z]);
  }
  for (const [s, z] of [[3.6, 3.5], [10.6, 3.5], [7.2, 6.9]]) sombrillaGrande(k, s, z, 0xf2f0ea);
  return mesas;
}

// la gente de la terraza (sin nombre: no hablan)
const CLIENTES = [
  { sex: 'm', skin: 0xe8c4a2, hair: 0x3a2a1a, hairStyle: 'short', top: 0xf2f2ee, bottom: 0x3a3a40, height: 1.78 },
  { sex: 'f', skin: 0xf1d3b8, hair: 0x6a4a2a, hairStyle: 'bun', top: 0x3a7a5a, bottom: 0x2a2f3a, height: 1.64 },
  { sex: 'm', skin: 0xc8916c, hair: 0x15110e, hairStyle: 'short', top: 0xf4f2ea, bottom: 0xc8b890, height: 1.74 },
  { sex: 'f', skin: 0xf1d3b8, hair: 0x2a1a12, hairStyle: 'ponytail', top: 0x2a2c30, bottom: 0x1d2b44, height: 1.66 },
].map(l => ({ eyes: 0x3a2616, topStyle: 'tshirt', bottomStyle: 'pants', shoes: 0x2a2c30, shoeStyle: 'shoe', build: 1, ...l }));

/** segunda fase, con los locales ya hechos */
export function buildBarAsturias(scene, colliders, map, locales) {
  if (!map?.barAsturias) return null;
  const group = new THREE.Group();
  group.name = 'barAsturias';
  const kF = new Kit();
  fachada(kF);
  const kT = new Kit();
  const mesas = terraza(kT);
  const ter = enMarco(kT, A, 'terrazaBarAsturias', colliders);
  group.add(enMarco(kF, A, 'fachadaBarAsturias', colliders), ter);
  scene.add(group);
  aRasDelSuelo(scene, ter);
  const gente = sentados(scene, locales, A, mesas, CLIENTES, [[1, 1], [4, -1], [6, 1], [9, -1]]);
  return { group, gente };
}
