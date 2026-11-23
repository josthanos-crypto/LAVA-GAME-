import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alzarEdificio } from './edificioReal.js';

/**
 * El Bar Bahía de Nao, la marisquería de la avenida de Naos 32 (Valterra), frente al puerto, con la foto de Google Maps
 * de abril de 2025, la de la puerta de julio de 2024 y la vista de la calle de mayo de 2019 (solo se miran, no van
 * dentro del juego; la gente no se pone): la casa vieja encalada de la esquina; la puerta de dos hojas azules con su
 * marco azul y, encima, el letrero azul de «Bahía de Nao» con el timón y el salvavidas; la ventana alta con la reja
 * azul; la ventanita de al lado; y delante, en la acera, la terraza: el suelo de baldosa roja, el murete blanco bajo,
 * las dos sombrillas blancas, las mesas con sillas negras y los dos barriles de los lados (sin la marca de cerveza que
 * llevan pintada). A la derecha, la pared vieja desconchada con la ventana tapiada de madera y el portón viejo de
 * tablas; y después, la casita de la puerta verde. Lo de detrás, como en la foto aérea y en la vista de la calle de
 * julio de 2025: el bloque del mapa era una nave de 6 m que tapaba la manzana entera, y de verdad es un solar de tierra
 * con la fila de casas viejas de una planta en la esquina (la del bar un poco más alta, 5,6 m, y las otras de 4,2 m);
 * por la avenida, el muro blanco bajo del solar y luego la valla de malla.
 */

// la cara de la avenida de la nave (s desde la esquina del oeste hacia el este); la foto pone el bar en la esquina
// (el mapa no tenía rótulo suyo)
const M = marco([1051.86, -559.57], [1101.08, -587]);
const Z = 0.12, ZF = Z + 0.3, YP = 5.6, YC = 4.2, BLANCO = 0xf0eee8, AZUL = 0x1e4aa8, VERDE = 0x3a9a6a;
// la casa del bar (de la esquina a s 6,2), las casas viejas de al lado (hasta s 17) y su fondo
const C0 = -0.2, C1 = 6.2, C2 = 17.0, FONDO = 8;

/**
 * antes de levantar la ciudad: la marca de que se monta (el mapa no tenía rótulo suyo) y la manzana como es: la nave
 * del mapa pasa a ser la fila de casas viejas de la esquina (el resto queda de solar) y la casa del bar, más alta
 */
export function tuneBahiaDeNao(map) {
  map.bahiaDeNao = true;
  if (!Array.isArray(map?.buildings)) return;
  const cerca = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.5;
  const A = M.W(0, 0), B = M.W(M.len, 0);
  const nave = map.buildings.find(b => !b.skip && b.k === 'industrial' && Array.isArray(b.p) && b.p.some(q => cerca(q, A)) && b.p.some(q => cerca(q, B)));
  if (nave) {
    const p = [M.W(C1, 0), M.W(C2, 0), M.W(C2, -FONDO), M.W(C1, -FONDO)].map(q => [+q[0].toFixed(2), +q[1].toFixed(2)]);
    p.push(p[0].slice());
    Object.assign(nave, { p, h: YC, k: 'gen', s: 0, f: [240, 238, 232], c: [214, 210, 202] });
  }
  alzarEdificio(map, M, C0, C1, FONDO, YP, [240, 238, 232]);
}

// ——— lo que se pinta en lienzo ———

/** la cal vieja, con desconchones */
function cal(g, w, h) {
  g.fillStyle = '#f0eee8';
  g.fillRect(0, 0, w, h);
  let s = 31;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 90; i++) {
    g.fillStyle = r() < 0.7 ? 'rgba(200,192,178,.35)' : 'rgba(160,150,138,.22)';
    g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 7, 1 + r() * 4, r() * 3, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = 'rgba(150,140,125,.3)';
  g.fillRect(0, h * 0.92, w, h * 0.08);
}

/** el letrero azul de «Bahía de Nao» con el timón y el salvavidas */
function letrero(g, w, h) {
  g.fillStyle = '#1e4aa8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4f4f0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.62)}px Georgia, "Times New Roman", serif`;
  g.fillText('Bahía de Nao', w * 0.44, h * 0.55);
  // el salvavidas con el timón
  const cx = w * 0.88, cy = h * 0.5, r = h * 0.42;
  g.fillStyle = '#f4f4f0';
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#d82a2a';
  for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, i * Math.PI / 2 + 0.3, i * Math.PI / 2 + 0.9); g.closePath(); g.fill(); }
  g.fillStyle = '#1e4aa8';
  g.beginPath(); g.arc(cx, cy, r * 0.55, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#d8b060';
  g.lineWidth = 2;
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * r * 0.5, cy + Math.sin(a) * r * 0.5); g.stroke(); }
}

/** el bar por la puerta abierta: los azulejos blancos, la barra y la nevera */
function dentro(g, w, h) {
  g.fillStyle = '#e8e8e4';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(0,0,0,.08)';
  for (let y = 0; y < h; y += 8) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.fillStyle = '#f4f4f2';
  g.fillRect(w * 0.42, h * 0.42, w * 0.3, h * 0.45);
  g.fillStyle = '#8a8c90';
  g.fillRect(w * 0.2, h * 0.15, w * 0.25, h * 0.2);
  g.fillStyle = '#2a2a2c';
  g.beginPath(); g.arc(w * 0.3, h * 0.25, w * 0.1, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#8a8a86';
  g.fillRect(0, h * 0.88, w, h * 0.12);
  g.fillStyle = 'rgba(0,0,0,.15)';
  g.fillRect(0, 0, w, h);
}

/** la ventana con la reja azul */
function ventana(g, w, h) {
  g.fillStyle = '#2a3a5a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#3a5aa8';
  g.fillRect(w * 0.15, h * 0.1, w * 0.7, h * 0.8);
  g.strokeStyle = '#1e2a5a';
  g.lineWidth = 4;
  for (let x = w / 5; x < w; x += w / 5) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = h / 5; y < h; y += h / 5) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.strokeRect(2, 2, w - 4, h - 4);
}

/** la madera vieja azulada de tablas (el portón y la ventana tapiada) */
function tablas(g, w, h) {
  g.fillStyle = '#6a7a7a';
  g.fillRect(0, 0, w, h);
  let s = 13;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let x = 0; x < w; x += w / 9) {
    g.fillStyle = r() < 0.5 ? '#5a6a6a' : '#7a8a86';
    g.fillRect(x + 1, 0, w / 9 - 2, h);
  }
  g.fillStyle = '#8a6a4a';
  for (const y of [0.15, 0.5, 0.82]) g.fillRect(w * 0.1, h * y, w * 0.8, h * 0.06);
  g.strokeStyle = '#4a3a2a';
  g.lineWidth = 5;
  g.strokeRect(2, 2, w - 4, h - 4);
}

/** la baldosa roja de la terraza */
function baldosa(g, w, h) {
  g.fillStyle = '#b8583a';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(80,30,20,.35)';
  g.lineWidth = 1;
  for (let x = 0; x < w; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y < h; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

// ——— las piezas ———

/** la casa encalada: la pared, la puerta azul con su letrero, las ventanas y la pared vieja con el portón */
function fachada(k) {
  for (const [a, b, h] of [[C0, C1, YP], [C1, C2, YC]]) {
    k.box((a + b) / 2, 0, Z + 0.15, b - a, h, 0.3, BLANCO);
    k.block((a + b) / 2, Z + 0.15, b - a, 0.3);
    k.pic((a + b) / 2, h / 2, ZF + 0.003, b - a, h, 0, 1, canvasTex(Math.round((b - a) * 50), Math.round(h * 50), cal));
    // el pretil del tejado, un poco más grueso
    k.box((a + b) / 2, h - 0.25, ZF + 0.04, b - a, 0.25, 0.08, 0xe8e6e0);
  }
  // la antena del tejado de la casa del bar
  k.cyl(4.6, YP, Z - 1.0, 0.025, 0.025, 2.2, 0x8a8a8a, { seg: 6 });
  for (const y of [YP + 1.4, YP + 1.9]) k.box(4.6, y, Z - 1.0, 0.9, 0.03, 0.03, 0x8a8a8a);
  // la puerta azul abierta, con el bar dentro, y su marco
  k.pic(2.6, 1.15, ZF + 0.01, 1.4, 2.3, 0, 1, canvasTex(140, 230, dentro), { glow: 0.2 });
  for (const t of [1.85, 3.35]) k.box(t, 0, ZF + 0.02, 0.12, 2.4, 0.08, AZUL);
  k.box(2.6, 2.3, ZF + 0.02, 1.6, 0.12, 0.08, AZUL);
  for (const [s, ry] of [[1.6, -1.1], [3.6, 1.1]]) {
    const hoja = new THREE.BoxGeometry(0.7, 2.25, 0.05);
    hoja.translate(ry < 0 ? -0.35 : 0.35, 1.125, 0);
    hoja.rotateY(ry);
    hoja.translate(s + (ry < 0 ? 0.3 : -0.3), 0, ZF + 0.05);
    k.add(hoja, AZUL);
  }
  k.box(2.6, 0, ZF + 0.15, 1.5, 0.15, 0.4, 0xd8d4cc);
  // el letrero azul encima de la puerta
  k.box(2.6, 2.45, ZF + 0.03, 2.6, 0.55, 0.08, AZUL);
  k.pic(2.6, 2.725, ZF + 0.075, 2.58, 0.53, 0, 1, canvasTex(420, 86, letrero));
  // la ventana alta de la reja azul y la ventanita oscura de al lado
  k.pic(2.4, 4.6, ZF + 0.01, 1.2, 1.3, 0, 1, canvasTex(110, 120, ventana));
  k.box(2.4, 3.92, ZF + 0.06, 1.35, 0.06, 0.12, 0xd8d4cc);
  k.box(4.1, 1.3, ZF + 0.01, 0.5, 0.5, 0.02, 0x2a2a2c);
  k.box(4.7, 3.3, ZF + 0.02, 0.2, 0.3, 0.06, 0xd8c8a8);
  // la pared vieja: la ventana tapiada de madera y el portón de tablas
  k.pic(9.3, 3.0, ZF + 0.01, 0.9, 1.5, 0, 1, canvasTex(80, 130, tablas));
  k.pic(9.3, 0.95, ZF + 0.01, 2.0, 1.9, 0, 1, canvasTex(180, 170, tablas));
  k.box(9.3, 1.9, ZF + 0.04, 2.1, 0.08, 0.1, 0x4a3a2a);
  // la casita de la puerta verde: la puerta de dos hojas y el ventanuco verde de encima
  k.box(14.6, 0, ZF + 0.02, 1.3, 2.1, 0.06, VERDE);
  k.box(14.6, 0, ZF + 0.055, 0.03, 2.1, 0.02, 0x2a6a4a);
  for (const y of [0.7, 1.4]) k.box(14.6, y, ZF + 0.055, 1.3, 0.03, 0.02, 0x2a6a4a);
  k.box(14.6, 2.85, ZF + 0.02, 0.75, 0.45, 0.06, VERDE);
  for (const y of [2.95, 3.05, 3.15]) k.box(14.6, y, ZF + 0.055, 0.7, 0.025, 0.02, 0x2a6a4a);
}

/** el solar de al lado por la avenida: el muro blanco bajo y luego la valla de malla con sus postes */
function solar(k) {
  const m0 = C2, m1 = 30.0, v1 = M.len - 0.3;
  k.box((m0 + m1) / 2, 0, Z + 0.15, m1 - m0, 1.6, 0.3, BLANCO);
  k.box((m0 + m1) / 2, 1.6, Z + 0.15, m1 - m0 + 0.04, 0.06, 0.36, 0xe0ddd6);
  k.block((m0 + m1) / 2, Z + 0.15, m1 - m0, 0.3);
  // la pared del costado de la última casa, que da al solar
  k.box(C2, 0, Z + 0.3 - FONDO / 2, 0.2, YC, FONDO, BLANCO);
  for (let s = m1; s <= v1 + 0.01; s += (v1 - m1) / Math.round((v1 - m1) / 2.6)) k.box(s, 0, Z + 0.15, 0.06, 1.9, 0.06, 0x7a7a78);
  for (const y of [0.05, 0.95, 1.85]) k.box((m1 + v1) / 2, y, Z + 0.15, v1 - m1, 0.025, 0.025, 0x8a8a88);
  for (let s = m1 + 0.2; s < v1; s += 0.2) k.box(s, 0.05, Z + 0.15, 0.008, 1.8, 0.008, 0x9a9a98);
  k.block((m1 + v1) / 2, Z + 0.15, v1 - m1, 0.2);
}

/** la terraza de la acera: el suelo rojo, el murete blanco, las sombrillas, las mesas y los barriles */
function terraza(k) {
  const t0 = -0.3, t1 = 5.4, fuera = 3.6, zf = ZF + fuera;
  // el suelo de baldosa roja, un poco por encima de la acera
  k.box((t0 + t1) / 2, 0, ZF + fuera / 2, t1 - t0, 0.06, fuera, 0xb8583a);
  const suelo = new THREE.PlaneGeometry(t1 - t0, fuera);
  suelo.rotateX(-Math.PI / 2);
  suelo.translate((t0 + t1) / 2, 0.065, ZF + fuera / 2);
  k.pics.push({ geo: suelo, tex: canvasTex(200, 130, baldosa), glow: 0 });
  // el murete blanco: por delante (con la entrada a la derecha) y por el lado de la esquina
  for (const [a, b] of [[t0, 3.9]]) { k.box((a + b) / 2, 0, zf, b - a, 0.9, 0.2, BLANCO); k.block((a + b) / 2, zf, b - a, 0.22); }
  k.box(t0, 0, ZF + fuera / 2, 0.2, 0.9, fuera, BLANCO);
  k.block(t0, ZF + fuera / 2, 0.22, fuera);
  k.box(t1, 0, zf - 0.6, 0.2, 0.9, 1.2, BLANCO);
  k.block(t1, zf - 0.6, 0.22, 1.2);
  // las dos sombrillas blancas redondas
  for (const s of [1.2, 3.8]) {
    k.cyl(s, 0, ZF + 1.9, 0.03, 0.03, 2.5, 0xe8e6e0, { seg: 6 });
    const tela = new THREE.ConeGeometry(1.5, 0.45, 12, 1, true);
    tela.translate(s, 2.5, ZF + 1.9);
    k.add(tela, 0xf4f2ec);
    k.block(s, ZF + 1.9, 0.1, 0.1);
  }
  // las mesas con sillas negras
  for (const [s, z] of [[0.6, 1.0], [2.2, 1.0], [0.6, 2.6], [2.6, 2.6], [4.4, 1.6]]) {
    k.table(s, ZF + z, { w: 0.65, d: 0.65, h: 0.74, top: 0xd8d8d4, leg: 0x2a2a2c });
    k.chair(s - 0.48, ZF + z, Math.PI / 2, 0x1e1e20, { legs: 0x1e1e20 });
    k.chair(s + 0.48, ZF + z, -Math.PI / 2, 0x1e1e20, { legs: 0x1e1e20 });
    k.block(s, ZF + z, 0.65, 0.65);
  }
  // los barriles de los lados: el rojo en la esquina y el negro junto a la entrada
  for (const [s, hex] of [[-0.3, 0xc82a2a], [4.2, 0x1e1e20]]) {
    k.cyl(s, 0, zf + 0.45, 0.3, 0.3, 0.9, hex, { seg: 14 });
    for (const y of [0.15, 0.75]) k.cyl(s, y, zf + 0.45, 0.31, 0.31, 0.04, 0x8a8a8a, { seg: 14 });
    k.block(s, zf + 0.45, 0.6, 0.6);
  }
}

/** se monta con lo demás de Valterra */
export function buildBahiaDeNao(scene, colliders, map) {
  if (!map?.bahiaDeNao) return null;
  const k = new Kit();
  fachada(k);
  solar(k);
  terraza(k);
  const group = enMarco(k, M, 'bahiaDeNao', colliders);
  scene.add(group);
  return { group };
}
