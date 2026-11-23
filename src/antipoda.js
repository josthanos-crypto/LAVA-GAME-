import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, barDentro } from './restaurantesCharco.js';
import { paredAlta, ventana, medianera } from './edificioReal.js';

/**
 * Antípoda (ANT/PØDA Specialty Coffee), el café de especialidad de la calle Hermanos Zerolo 8, en la esquina con
 * Francos (centro), con la vista de la calle de Google de julio de 2025 (solo se mira, no va dentro del juego; la gente
 * no se pone). Antes iba como un bajo suelto en localesVarios.js, en la cara de Francos; ahora va el edificio entero:
 * la casa blanca de dos plantas con el chaflán en la esquina y el zócalo gris oscuro; en el chaflán, la puerta de
 * cristal de marco oscuro con la placa negra de «ANT/PØDA» encima y la placa azul de la calle; por Hermanos Zerolo, el
 * escaparate grande de marco oscuro con su toldo gris, la puerta del portal de marco gris y la pizarra de pie; por
 * Francos, las dos ventanas del bajo; arriba, el balcón de balaustres de madera sobre su losa con las ménsulas grises,
 * las ventanas y la puerta del balcón de marco oscuro, la cornisa con su fila de ménsulas grises y el pretil de
 * balaustrada de la azotea. El bloque del mapa era de una planta (4 m), en punta: se le hace el chaflán y la casa sube
 * a su altura (7 m y el pretil).
 */

// la cara de Hermanos Zerolo (s de oeste a este, hasta la esquina) y la de Francos (s desde la esquina hacia el sur)
const HZ = marco([-82.38, 95.75], [-10.15, 123.04]);
const FR = marco([-10.15, 123.04], [-3.95, 115.12]);
const L = HZ.len, LF = FR.len;
const Z = 0.12, ZF = Z + 0.3, YP = 3.6, TECHO = 7.0, YB = 4.0, BLANCO = 0xf2f2ee, GRIS = 0x4a4c50, OSCURO = 0x2a2a2c;
// la casa: por Hermanos Zerolo, hasta 10,5 m de la esquina; por Francos, la cara entera; el chaflán, de 1,6 m
const H0 = L - 10.5, T = 1.0, FONDO = 9;
// el chaflán, en el marco de Hermanos Zerolo: del punto P1 de la cara de Hermanos Zerolo al P2 de la de Francos
const E2 = [FR.U[0] * HZ.U[0] + FR.U[1] * HZ.U[1], FR.U[0] * HZ.N[0] + FR.U[1] * HZ.N[1]];
const P1 = [L - T, 0], P2 = [L + E2[0] * T, E2[1] * T];
const CL = Math.hypot(P2[0] - P1[0], P2[1] - P1[1]);
const V = [(P2[0] - P1[0]) / CL, (P2[1] - P1[1]) / CL], NC = [-V[1], V[0]];
const enChaflan = (u, z) => [P1[0] + V[0] * u + NC[0] * z, P1[1] + V[1] * u + NC[1] * z];

/** antes de levantar la ciudad: la marca de que se monta, el chaflán del bloque y la casa a su altura */
export function tuneAntipoda(map) {
  map.antipoda = true;
  if (!Array.isArray(map?.buildings)) return;
  const r2 = q => [+q[0].toFixed(2), +q[1].toFixed(2)];
  const punta = HZ.W(L, 0), cerca = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.1;
  const a = r2(HZ.W(...P1)), b = r2(HZ.W(...P2));
  const bl = map.buildings.find(q => !q.skip && Array.isArray(q.p) && q.p.some(v => cerca(v, punta)));
  if (bl) {
    const n = bl.p.length, cerrado = cerca(bl.p[0], bl.p[n - 1]);
    const i = bl.p.findIndex(v => cerca(v, punta));
    const ant = bl.p[i === 0 ? (cerrado ? n - 2 : n - 1) : i - 1];
    const tramo = Math.hypot(ant[0] - a[0], ant[1] - a[1]) < Math.hypot(ant[0] - b[0], ant[1] - b[1]) ? [a, b] : [b, a];
    bl.p.splice(i, 1, ...tramo);
    if (cerrado && i === 0) bl.p[bl.p.length - 1] = tramo[0].slice();
  }
  // la casa: la cara de Hermanos Zerolo, el chaflán, la de Francos y un trozo de la de Trinidad, hasta el fondo
  const fin = FR.W(LF, 0), tr = [fin[0] - 0.755 * 8, fin[1] - 0.655 * 8];
  const p = [HZ.W(H0, 0), a, b, fin, tr, HZ.W(H0, -FONDO)].map(r2);
  p.push(p[0].slice());
  map.buildings.push({ p, h: TECHO, k: 'gen', s: 0, f: [242, 242, 238], c: [214, 210, 202], edificioReal: true });
}

// ——— lo que se pinta en lienzo ———

/** la placa negra de ANT/PØDA */
function placa(g, w, h) {
  g.fillStyle = '#1d1e20';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8e8e4';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `600 ${Math.round(h * 0.5)}px "Arial Narrow", Arial, sans-serif`;
  g.fillText('ANT/PØDA', w / 2, h * 0.55, w * 0.9);
}

/** la placa azul del nombre de la calle */
function placaCalle(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#1e4a9a';
  g.fillRect(3, 3, w - 6, h - 6);
  g.fillStyle = '#f2f2ee';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.22)}px Arial, sans-serif`;
  g.fillText('HERMANOS', w / 2, h * 0.36, w * 0.85);
  g.fillText('ZEROLO', w / 2, h * 0.66, w * 0.85);
}

/** la puerta del portal: el marco gris y el cristal */
function portal(g, w, h) {
  g.fillStyle = '#5a5c60';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#7a8a94';
  g.fillRect(w * 0.15, h * 0.06, w * 0.7, h * 0.86);
  g.fillStyle = 'rgba(255,255,255,.15)';
  g.fillRect(w * 0.15, h * 0.06, w * 0.25, h * 0.86);
}

/** los balaustres torneados de madera del balcón, uno al lado de otro */
function balaustres(g, w, h) {
  g.clearRect(0, 0, w, h);
  g.fillStyle = '#7a5236';
  g.fillRect(0, 0, w, h * 0.12);
  g.fillRect(0, h * 0.9, w, h * 0.1);
  const n = Math.round(w / 14);
  for (let i = 0; i < n; i++) {
    const x = (i + 0.5) * (w / n);
    g.beginPath(); g.ellipse(x, h * 0.32, 4, h * 0.12, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(x, h * 0.66, 5, h * 0.16, 0, 0, Math.PI * 2); g.fill();
    g.fillRect(x - 2, h * 0.12, 4, h * 0.78);
  }
}

// ——— las piezas ———

/** un hueco de marco oscuro con su lienzo */
function hueco(k, s, y, w, h, tex, glow = 0) {
  k.pic(s, y + h / 2, ZF + 0.01, w, h, 0, 1, tex, glow ? { glow } : undefined);
  for (const t of [s - w / 2 - 0.05, s + w / 2 + 0.05]) k.box(t, y, ZF + 0.03, 0.1, h, 0.06, OSCURO);
  for (const yy of [y - 0.05, y + h]) k.box(s, yy, ZF + 0.03, w + 0.2, 0.05, 0.06, OSCURO);
}

/** una ménsula gris, de las de debajo de la cornisa y del balcón */
function mensula(k, s, y, z = ZF) {
  k.box(s, y - 0.3, z + 0.09, 0.16, 0.3, 0.18, 0x5a5c60);
  k.box(s, y - 0.12, z + 0.17, 0.16, 0.12, 0.16, 0x5a5c60);
}

/** la cornisa con su fila de ménsulas y el pretil de balaustrada de la azotea, de s0 a s1 */
function remate(k, s0, s1) {
  const c = (s0 + s1) / 2;
  k.box(c, TECHO - 0.12, ZF + 0.15, s1 - s0, 0.16, 0.3, 0xe8e8e4);
  for (let s = s0 + 0.5; s < s1 - 0.2; s += 1.1) mensula(k, s, TECHO - 0.12);
  k.box(c, TECHO, Z + 0.15, s1 - s0, 0.12, 0.3, BLANCO);
  for (const y of [TECHO + 0.12, TECHO + 0.7]) k.box(c, y, Z + 0.2, s1 - s0, 0.08, 0.26, 0xeeeeea);
  for (let s = s0 + 0.12; s < s1; s += 0.22) k.box(s, TECHO + 0.2, Z + 0.2, 0.09, 0.5, 0.09, 0xeeeeea);
}

/** la cara de Hermanos Zerolo: el bajo con el escaparate y el portal, el balcón de balaustres y el remate */
function caraZerolo(k) {
  const a = H0, b = L - T, c = (a + b) / 2, d = x => L - x;
  k.box(c, 0, Z + 0.15, b - a, YP, 0.3, BLANCO);
  k.block(c, Z + 0.15, b - a, 0.3);
  paredAlta(k, a, b, YP, TECHO, Z, BLANCO);
  k.box(c, 0, ZF + 0.01, b - a, 1.0, 0.03, GRIS);
  // el escaparate de marco oscuro y su toldo gris corto
  hueco(k, d(4.3), 0.95, 2.6, 1.6, canvasTex(260, 160, barDentro), 0.15);
  const tela = new THREE.BoxGeometry(3.0, 0.03, Math.hypot(0.7, 0.2));
  tela.rotateX(Math.atan2(0.2, 0.7));
  tela.translate(d(4.3), 2.95 - 0.1, ZF + 0.35);
  k.add(tela, 0x5a5e62);
  k.box(d(4.3), 2.62, ZF + 0.7, 3.0, 0.14, 0.02, 0x5a5e62);
  // la puerta del portal de marco gris, con su placa
  k.pic(d(8.6), 1.15, ZF + 0.01, 1.1, 2.3, 0, 1, canvasTex(110, 230, portal));
  k.box(d(8.6), 2.3, ZF + 0.03, 1.3, 0.12, 0.06, 0x5a5c60);
  k.box(d(7.6), 1.6, ZF + 0.02, 0.22, 0.15, 0.02, 0xd8d8d4);
  // la pizarra de pie, junto al escaparate
  for (const ang of [0.2, -0.2]) {
    const g = new THREE.BoxGeometry(0.5, 0.85, 0.03);
    g.translate(0, 0.42, 0);
    g.rotateX(ang);
    g.translate(d(2.3), 0, ZF + 0.7 + Math.sign(ang) * 0.08);
    k.add(g, 0x23262a);
  }
  k.block(d(2.3), ZF + 0.7, 0.55, 0.3);
  // arriba: el balcón de balaustres de madera con su losa y sus ménsulas, la puerta del balcón y las ventanas
  const b0 = d(7.6), b1 = d(2.0), bc = (b0 + b1) / 2;
  k.box(bc, YP - 0.05, ZF + 0.3, b1 - b0, 0.15, 0.6, 0xeeeeea);
  for (let s = b0 + 0.3; s < b1; s += 1.2) mensula(k, s, YP - 0.05);
  k.pic(bc, YP + 0.55, ZF + 0.58, b1 - b0, 0.9, 0, 1, canvasTex(Math.round((b1 - b0) * 60), 54, balaustres));
  k.box(bc, YP + 1.0, ZF + 0.58, b1 - b0 + 0.04, 0.06, 0.08, 0x7a5236);
  for (const t of [b0, b1]) k.box(t, YP + 0.1, ZF + 0.3, 0.06, 0.95, 0.56, 0x7a5236);
  ventana(k, d(5.0), YP + 0.15, 1.1, 2.1, Z, { carpinteria: '#2a2a2c' });
  for (const t of [d(2.8), d(8.4)]) ventana(k, t, YP + 0.9, 0.9, 1.2, Z, { carpinteria: '#2a2a2c' });
  remate(k, a, b);
  // la pared lisa del costado del oeste, que asoma por encima del bloque del mapa
  medianera(k, a - 0.07, YB, TECHO + 0.8, FONDO, Z, 0xeeeeea);
}

/** el chaflán: la pared, la puerta de cristal con la placa de ANT/PØDA, la placa de la calle y la ventanita de arriba */
function chaflan(k) {
  const a = Math.atan2(-V[1], V[0]);
  const pared = (y, h, z, d, hex) => {
    const g = new THREE.BoxGeometry(CL + 0.02, h, d);
    g.rotateY(a);
    const [s, zz] = enChaflan(CL / 2, z);
    g.translate(s, y + h / 2, zz);
    k.add(g, hex);
  };
  pared(0, TECHO, Z + 0.15, 0.3, BLANCO);
  pared(0, 1.0, ZF + 0.01, 0.03, GRIS);
  pared(TECHO - 0.12, 0.16, ZF + 0.15, 0.3, 0xe8e8e4);
  pared(TECHO, 0.12, Z + 0.15, 0.3, BLANCO);
  pared(TECHO + 0.12, 0.08, Z + 0.2, 0.26, 0xeeeeea);
  pared(TECHO + 0.7, 0.08, Z + 0.2, 0.26, 0xeeeeea);
  const [ms, mz] = enChaflan(CL / 2, Z + 0.15);
  k.block(ms, mz, 1.0, 1.0);
  const sobre = (u, y, z, w, h, tex, op) => { const [s, zz] = enChaflan(u, z); k.pic(s, y, zz, w, h, NC[0], NC[1], tex, op); };
  // la puerta de cristal, su marco oscuro y la placa negra de encima
  sobre(CL / 2, 1.2, ZF + 0.01, 1.15, 2.4, canvasTex(115, 240, barDentro), { glow: 0.2 });
  const marcoPuerta = new THREE.BoxGeometry(1.35, 2.5, 0.06);
  marcoPuerta.rotateY(a);
  const [fs, fz] = enChaflan(CL / 2, ZF + 0.005);
  marcoPuerta.translate(fs, 1.25, fz);
  k.add(marcoPuerta, OSCURO);
  sobre(CL / 2, 2.82, ZF + 0.06, 1.44, 0.32, canvasTex(240, 54, placa));
  sobre(CL * 0.15, 2.5, ZF + 0.03, 0.3, 0.22, canvasTex(60, 44, placaCalle));
  // la ventanita de arriba y el pretil de balaustres
  sobre(CL / 2, YP + 1.5, ZF + 0.01, 0.7, 1.1, canvasTex(42, 66, (g, w, h) => { g.fillStyle = '#2e363e'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a2a2c'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6); }));
  for (let u = 0.12; u < CL; u += 0.22) { const [s, z] = enChaflan(u, Z + 0.2); k.box(s, TECHO + 0.2, z, 0.09, 0.5, 0.09, 0xeeeeea); }
}

/** la cara de Francos: el bajo con sus dos ventanas, las ventanas de arriba y el remate */
function caraFrancos(k) {
  const a = T, b = LF, c = (a + b) / 2;
  k.box(c, 0, Z + 0.15, b - a, YP, 0.3, BLANCO);
  k.block(c, Z + 0.15, b - a, 0.3);
  paredAlta(k, a, b, YP, TECHO, Z, BLANCO);
  k.box(c, 0, ZF + 0.01, b - a, 1.0, 0.03, GRIS);
  for (const s of [2.4, 4.0]) hueco(k, s, 1.1, 0.9, 1.4, canvasTex(90, 140, barDentro), 0.1);
  for (const s of [2.6, 6.2]) ventana(k, s, YP + 0.9, 0.9, 1.2, Z, { carpinteria: '#2a2a2c' });
  remate(k, a, b);
}

/** se monta con lo demás de Arrecife Centro: la cara de Hermanos Zerolo con el chaflán, y la de Francos */
export function buildAntipoda(scene, colliders, map) {
  if (!map?.antipoda) return null;
  const partes = [];
  const zerolo = (k) => { caraZerolo(k); chaflan(k); };
  for (const [M, nom, hacer] of [[HZ, 'antipodaZerolo', zerolo], [FR, 'antipodaFrancos', caraFrancos]]) {
    const k = new Kit();
    hacer(k);
    const group = enMarco(k, M, nom, colliders);
    scene.add(group);
    partes.push(group);
  }
  return { partes };
}
