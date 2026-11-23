import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alzarEdificio, paredAlta, ventana, barandillaAzotea, medianera } from './edificioReal.js';

/**
 * El Bar Cafetería D.R. Punta Cana, en la calle la Férmina 2 (Titerroy), junto al Minimarket La Bodega, con la vista
 * de la calle de Google de julio de 2025 (solo se mira, no va dentro del juego; la gente no se pone): la casa blanca
 * con el zócalo gris y la banda gris encima de los locales; el toldo verde del bar con «PUNTA CANA» en rojo en el
 * faldón; la puerta abierta con la reja blanca; el cuadro de luz con la playa; los aires acondicionados y las dos
 * ventanas redondas con reja; delante, en la acera, la caseta de madera de la terraza con las lonas color arena, el
 * techo de chapa de rayas rojas y las mesas dentro. A la izquierda, el Minimarket La Bodega con su toldo verde y sus
 * rejas blancas de celosía (sin el cartel de la marca de envíos de dinero), y a la derecha, la puerta blanca del
 * portal. Encima, el edificio de verdad (vista de la calle mirando hacia arriba): blanco, el bajo y dos plantas
 * (8,8 m; el bloque del mapa, la manzana entera, era de 5 m), con la cornisa que sale encima de la primera planta, las
 * ventanas de la segunda con su barandilla blanca de barrotes y la barandilla de la azotea; y en la esquina de
 * Vicente Guerra, el portón de reja blanca del bajo, el voladizo gris y la terraza de la primera planta con su
 * barandilla blanca y sus dos columnas.
 */

// la cara de la calle la Férmina (s desde la esquina de Vicente Guerra hacia el sur); la vista de la calle pone el
// minimarket en s 6,3–8,9 y el bar en s 10–16,3 (el mapa no tenía rótulo suyo)
const M = marco([-233.37, -648.9], [-210.67, -614.54]);
const Z = 0.12, ZF = Z + 0.3, YP = 5.0, BLANCO = 0xf2f2ee, VERDE = 0x1e6a3e;
// el edificio de verdad: de la esquina (s 0) a s 18,3, el bajo y dos plantas, con la azotea a 8,8 m
const E1 = 18.3, TECHO = 8.8, CORNISA = 5.85;

/** antes de levantar la ciudad: la marca de que se monta (el mapa no tenía rótulo suyo) y el edificio a su altura */
export function tunePuntaCana(map) {
  map.puntaCana = true;
  // el edificio a su altura de verdad (el bloque del mapa es la manzana entera, de 5 m)
  alzarEdificio(map, M, 0, E1, 10, TECHO, [240, 240, 236]);
}

// ——— lo que se pinta en lienzo ———

/** el faldón del toldo con el nombre */
function faldon(texto, color, fondo) {
  return (g, w, h) => {
    g.fillStyle = fondo;
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,.2)';
    for (let x = 0; x < w; x += 24) { g.beginPath(); g.arc(x + 12, h, 12, Math.PI, 0); g.fill(); }
    g.fillStyle = color;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `900 ${Math.round(h * 0.62)}px "Arial Black", Arial, sans-serif`;
    const m = g.measureText(texto).width, k = Math.min(1, (w * 0.9) / m);
    g.save(); g.translate(w / 2, h * 0.45); g.scale(k, 1); g.fillText(texto, 0, 0); g.restore();
  };
}

/** el minimarket por la puerta abierta: las estanterías llenas */
function tienda(g, w, h) {
  g.fillStyle = '#4a4440';
  g.fillRect(0, 0, w, h);
  const c = ['#d83a2a', '#f2c82a', '#2a7ad8', '#3aa84a', '#f2f2ee', '#e87a2a'];
  let s = 5;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let y = h * 0.12; y < h * 0.85; y += h * 0.12) {
    g.fillStyle = '#8a8480';
    g.fillRect(0, y + h * 0.1, w, 3);
    for (let x = 2; x < w - 6; x += 6 + r() * 6) { g.fillStyle = c[Math.floor(r() * c.length)]; g.fillRect(x, y + h * 0.1 - 6 - r() * 10, 5, 16); }
  }
  g.fillStyle = '#9a948e';
  g.fillRect(0, h * 0.9, w, h * 0.1);
  g.fillStyle = 'rgba(30,26,24,.35)';
  g.fillRect(0, 0, w, h);
}

/** el bar por la puerta abierta */
function bar(g, w, h) {
  g.fillStyle = '#2e2a28';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8c8a8';
  g.fillRect(w * 0.1, h * 0.5, w * 0.8, h * 0.08);
  g.fillStyle = '#5a4030';
  g.fillRect(w * 0.1, h * 0.58, w * 0.8, h * 0.3);
  g.fillStyle = 'rgba(255,240,200,.25)';
  g.fillRect(w * 0.3, h * 0.08, w * 0.4, h * 0.06);
}

/** la reja blanca de celosía */
function celosia(g, w, h) {
  g.fillStyle = '#3a3634';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#f2f2ee';
  g.lineWidth = 3;
  for (let i = -h; i < w + h; i += 14) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke();
    g.beginPath(); g.moveTo(i + h, 0); g.lineTo(i, h); g.stroke();
  }
  g.lineWidth = 6;
  g.strokeRect(3, 3, w - 6, h - 6);
}

/** el cuadro de luz con la playa */
function playa(g, w, h) {
  g.fillStyle = '#f4f4f0';
  g.fillRect(0, 0, w, h);
  const cielo = g.createLinearGradient(0, 0, 0, h * 0.55);
  cielo.addColorStop(0, '#4a9ae8');
  cielo.addColorStop(1, '#bfe4f8');
  g.fillStyle = cielo;
  g.fillRect(6, 6, w - 12, h * 0.5);
  g.fillStyle = '#1aa8c8';
  g.fillRect(6, h * 0.5, w - 12, h * 0.2);
  g.fillStyle = '#ecd8a8';
  g.fillRect(6, h * 0.7, w - 12, h * 0.3 - 6);
  // la palmera
  g.strokeStyle = '#6a4a2a';
  g.lineWidth = 4;
  g.beginPath(); g.moveTo(w * 0.3, h * 0.85); g.quadraticCurveTo(w * 0.22, h * 0.5, w * 0.32, h * 0.25); g.stroke();
  g.strokeStyle = '#2a7a3a';
  g.lineWidth = 3;
  for (const a of [-2.6, -2.0, -1.2, -0.5, 0.2]) { g.beginPath(); g.moveTo(w * 0.32, h * 0.25); g.quadraticCurveTo(w * 0.32 + Math.cos(a) * w * 0.15, h * 0.25 + Math.sin(a) * h * 0.1 - 4, w * 0.32 + Math.cos(a) * w * 0.25, h * 0.25 + Math.sin(a) * h * 0.12 + 8); g.stroke(); }
}

/** las lonas color arena de la caseta */
function lona(g, w, h) {
  g.fillStyle = '#d8c8a0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(120,100,70,.25)';
  for (let x = 0; x < w; x += 18) g.fillRect(x, 0, 6, h);
  g.fillStyle = 'rgba(80,60,40,.3)';
  g.fillRect(0, h * 0.9, w, h * 0.1);
}

/** las tablas de madera de la caseta */
function madera(g, w, h) {
  g.fillStyle = '#7a5434';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(40,25,15,.45)';
  g.lineWidth = 2;
  for (let x = 0; x < w; x += 22) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  g.fillStyle = 'rgba(160,120,80,.25)';
  g.fillRect(0, 0, w, h * 0.12);
}

/** el portón de reja blanca del local de la esquina: barrotes con los travesaños a saltos */
function rejaPorton(g, w, h) {
  g.fillStyle = '#2e2c2a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4f4f0';
  const n = 9, p = w / n;
  for (let i = 0; i <= n; i++) g.fillRect(i * p - 2, 0, 4, h);
  for (let i = 0; i < n; i++) for (let j = 0; j < 4; j++) g.fillRect(i * p, h * (0.12 + j * 0.24 + (i % 2) * 0.1), p, 4);
  g.fillRect(0, 0, w, 5);
  g.fillRect(0, h - 5, w, 5);
}

// ——— las piezas ———

/** un toldo verde inclinado con su faldón */
function toldo(k, s0, s1, tex) {
  const w = s1 - s0, c = (s0 + s1) / 2, vuelo = 1.0, caida = 0.35;
  const lona = new THREE.BoxGeometry(w, 0.04, Math.hypot(vuelo, caida));
  lona.rotateX(Math.atan2(caida, vuelo));
  lona.translate(c, 2.75 - caida / 2, ZF + vuelo / 2);
  k.add(lona, VERDE);
  k.box(c, 2.4 - 0.34, ZF + vuelo, w, 0.34, 0.03, VERDE);
  k.pic(c, 2.4 - 0.17, ZF + vuelo + 0.02, w, 0.34, 0, 1, tex);
}

/** una ventana redonda con su reja */
function ojoDeBuey(k, s, y, r) {
  const aro = new THREE.CylinderGeometry(r + 0.08, r + 0.08, 0.1, 24);
  aro.rotateX(Math.PI / 2);
  aro.translate(s, y, ZF + 0.04);
  k.add(aro, 0xf8f8f4);
  const hueco = new THREE.CylinderGeometry(r, r, 0.1, 24);
  hueco.rotateX(Math.PI / 2);
  hueco.translate(s, y, ZF + 0.06);
  k.add(hueco, 0x2a3036);
  for (const dy of [-0.5, -0.17, 0.17, 0.5]) { const l = 2 * r * Math.sqrt(1 - dy * dy); k.box(s, y + dy * r - 0.015, ZF + 0.12, l, 0.03, 0.02, 0xf2f2ee); }
  k.box(s, y - r, ZF + 0.12, 0.03, 2 * r, 0.02, 0xf2f2ee);
}

/** la casa blanca: la pared, el zócalo, la banda gris, el minimarket, el bar y el portal */
function fachada(k) {
  const S0 = 4.5, S1 = 18.0;
  k.box((S0 + S1) / 2, 0, Z + 0.15, S1 - S0, YP, 0.3, BLANCO);
  k.block((S0 + S1) / 2, Z + 0.15, S1 - S0, 0.3);
  k.box((S0 + S1) / 2, 0, ZF + 0.01, S1 - S0, 1.2, 0.03, 0x8a8078);
  k.box((S0 + S1) / 2, 2.78, ZF + 0.08, S1 - S0, 0.2, 0.16, 0x9a9894);
  // el Minimarket La Bodega: la puerta abierta con la tienda dentro, las rejas de celosía y su toldo
  k.pic(7.6, 1.15, ZF + 0.03, 2.6, 2.3, 0, 1, canvasTex(240, 210, tienda), { glow: 0.15 });
  for (const s of [5.95, 9.25]) k.pic(s, 1.15, ZF + 0.05, 0.75, 2.3, 0, 1, canvasTex(70, 210, celosia));
  toldo(k, 5.4, 10.1, canvasTex(500, 36, faldon('MINIMARKET   LA BODEGA', '#f4f4f0', '#1e6a3e')));
  ojoDeBuey(k, 7.7, 3.55, 0.55);
  // los aires acondicionados de entre los dos locales
  for (const [s, y] of [[10.3, 3.1], [10.3, 3.7], [10.3, 4.3], [11.2, 2.95], [11.2, 3.6], [14.5, 3.25]]) {
    k.box(s, y, ZF + 0.15, 0.8, 0.55, 0.3, 0xe8e8e4);
    const v = new THREE.CylinderGeometry(0.18, 0.18, 0.02, 16);
    v.rotateX(Math.PI / 2);
    v.translate(s - 0.1, y + 0.27, ZF + 0.31);
    k.add(v, 0x7a7a78);
  }
  ojoDeBuey(k, 12.4, 3.6, 0.45);
  // el Punta Cana: la puerta abierta con la reja, el cuadro de la playa y su toldo con el nombre
  k.pic(14.8, 1.15, ZF + 0.03, 1.1, 2.3, 0, 1, canvasTex(110, 230, bar), { glow: 0.15 });
  k.pic(15.6, 1.15, ZF + 0.05, 0.6, 2.3, 0, 1, canvasTex(60, 210, celosia));
  k.box(13.7, 2.95, ZF + 0.1, 0.6, 0.8, 0.18, 0xf2f2ee);
  k.pic(13.7, 3.35, ZF + 0.195, 0.56, 0.76, 0, 1, canvasTex(90, 120, playa), { glow: 0.3 });
  toldo(k, 10.1, 16.3, canvasTex(500, 36, faldon('PUNTA CANA', '#d82a2a', '#f2f2ee')));
  // la puerta blanca del portal
  k.box(17.1, 0, ZF + 0.02, 0.95, 2.2, 0.06, 0xf6f6f2);
  k.box(17.4, 1.05, ZF + 0.06, 0.04, 0.12, 0.04, 0xa8a8a8);
}

/** la caseta de madera de la terraza, en la acera delante del bar */
function caseta(k) {
  const a = 9.9, b = 16.1, z0 = ZF + 0.7, z1 = ZF + 2.6, alto = 1.95, c = (a + b) / 2;
  const zc = (z0 + z1) / 2, d = z1 - z0;
  // las tablas de abajo: por delante y por los dos lados (por detrás queda abierta al bar)
  k.box(c, 0, z1, b - a, 1.0, 0.06, 0x7a5434);
  k.pic(c, 0.5, z1 + 0.035, b - a, 1.0, 0, 1, canvasTex(400, 64, madera));
  for (const s of [a, b]) { k.box(s, 0, zc, 0.06, 1.0, d, 0x7a5434); k.block(s, zc, 0.1, d); }
  k.block(c, z1, b - a, 0.1);
  // los postes y las lonas color arena colgadas
  for (const s of [a, (a + b) / 2, b]) for (const z of [z0, z1]) k.box(s, 0, z, 0.08, alto, 0.08, 0x5a3e28);
  for (const [s0, s1] of [[a + 0.1, c - 0.15], [c + 0.15, b - 0.1]]) k.pic((s0 + s1) / 2, 1.45, z1 + 0.04, s1 - s0, 0.9, 0, 1, canvasTex(160, 60, lona));
  for (const s of [a, b]) {
    const l = new THREE.PlaneGeometry(d - 0.2, 0.9);
    l.rotateY(s === a ? -Math.PI / 2 : Math.PI / 2);
    l.translate(s + (s === a ? -0.04 : 0.04), 1.45, zc);
    k.pics.push({ geo: l, tex: canvasTex(90, 60, lona), glow: 0 });
  }
  // el techo de chapa, con las rayas rojas del borde
  const techo = new THREE.BoxGeometry(b - a + 0.3, 0.05, d + 0.3);
  techo.rotateX(-0.06);
  techo.translate(c, alto + 0.05, zc);
  k.add(techo, 0x9a7a5a);
  for (const y of [alto - 0.02, alto + 0.08]) k.box(c, y, z1 + 0.16, b - a + 0.3, 0.04, 0.03, 0xc83a2a);
  // las mesas de dentro
  for (const s of [11.3, 13.2, 15.0]) {
    k.table(s, zc, { w: 0.65, d: 0.65, h: 0.74, top: 0x2a2a2c, leg: 0x2a2a2c });
    k.chair(s - 0.48, zc, Math.PI / 2, 0x3a3a3c, { legs: 0x3a3a3c });
    k.chair(s + 0.48, zc, -Math.PI / 2, 0x3a3a3c, { legs: 0x3a3a3c });
  }
}

/** una barandilla blanca de barrotes, de s0 a s1, de y a y + alto */
function barrotes(k, s0, s1, y, alto, z) {
  const c = (s0 + s1) / 2;
  k.box(c, y + alto - 0.05, z, s1 - s0, 0.05, 0.05, 0xf4f4f0);
  k.box(c, y, z, s1 - s0, 0.04, 0.04, 0xf4f4f0);
  for (let s = s0 + 0.03; s <= s1; s += 0.1) k.box(s, y, z, 0.025, alto, 0.025, 0xf4f4f0);
}

/** el bajo de la esquina de Vicente Guerra: el portón de reja, el voladizo gris y la terraza de la primera planta */
function esquina(k) {
  const a = 0, b = 4.5, c = (a + b) / 2;
  k.box(c, 0, Z + 0.15, b - a, YP, 0.3, BLANCO);
  k.block(c, Z + 0.15, b - a, 0.3);
  k.box(c, 0, ZF + 0.01, b - a, 1.2, 0.03, 0x8a8078);
  k.box(2.3, 0, ZF + 0.02, 2.8, 2.75, 0.04, 0xf4f4f0);
  k.pic(2.3, 1.35, ZF + 0.045, 2.6, 2.6, 0, 1, canvasTex(260, 260, rejaPorton));
  // el voladizo gris de la terraza, las dos columnas y la barandilla blanca
  k.box(c, 2.75, ZF + 0.5, b - a, 0.55, 1.0, 0x6e7074);
  k.block(c, ZF + 0.5, b - a, 1.0);
  for (const s of [0.25, b - 0.25]) {
    const col = new THREE.CylinderGeometry(0.13, 0.13, CORNISA - 3.3, 16);
    col.translate(s, 3.3 + (CORNISA - 3.3) / 2, ZF + 0.85);
    k.add(col, 0xd8d8d4);
  }
  barrotes(k, a + 0.1, b - 0.1, 3.3, 1.0, ZF + 0.95);
  for (const s of [a + 0.1, b - 0.1]) k.box(s, 3.3, ZF + 0.5, 0.05, 1.0, 0.9, 0xf4f4f0);
  // detrás, el ventanal y la puerta blanca de la terraza
  ventana(k, 1.4, 3.35, 1.7, 2.1, Z, { carpinteria: '#e8e8e4', hojas: 3 });
  k.box(3.5, 3.3, ZF + 0.01, 0.9, 2.15, 0.04, 0xf6f6f2);
}

/** las plantas de arriba: la cornisa, las ventanas con barandilla de la segunda y la barandilla de la azotea */
function plantas(k) {
  const c = E1 / 2;
  paredAlta(k, 0, E1, YP, TECHO, Z, BLANCO);
  // la cornisa que sale encima de la primera planta (la segunda va un poco más afuera)
  k.box(c, CORNISA, ZF + 0.08, E1, 0.18, 0.16, 0xeaeae6);
  k.box(c, CORNISA + 0.18, Z + 0.15 + 0.06, E1, TECHO - CORNISA - 0.18, 0.3, BLANCO);
  // las ventanas de la segunda planta: la de la cortina, las de barandilla baja, la pequeña y la de barandilla entera
  const zb = ZF + 0.14;
  ventana(k, 2.4, 6.6, 1.2, 1.3, Z + 0.06, { carpinteria: '#f4f4f0' });
  barrotes(k, 1.85, 2.95, 6.55, 0.75, zb);
  ventana(k, 5.6, 6.6, 1.2, 1.3, Z + 0.06, { carpinteria: '#f4f4f0' });
  for (const [s, w] of [[8.6, 1.4], [11.3, 1.4]]) {
    ventana(k, s, 6.55, w, 1.35, Z + 0.06, { carpinteria: '#e8e8e4' });
    barrotes(k, s - w / 2 - 0.05, s + w / 2 + 0.05, 6.5, 0.8, zb);
  }
  ventana(k, 13.6, 7.0, 0.95, 0.95, Z + 0.06, { carpinteria: '#e8e8e4' });
  ventana(k, 15.8, 6.35, 1.3, 1.65, Z + 0.06, { carpinteria: '#e8e8e4' });
  barrotes(k, 15.1, 16.5, 6.3, 1.05, zb);
  // la barandilla blanca de la azotea y la medianera lisa del costado que asoma por encima del vecino
  barandillaAzotea(k, 0, E1, TECHO, Z + 0.06);
  medianera(k, E1 + 0.07, YP, TECHO + 0.25, 10, Z, 0xe8e6e0);
}

/** se monta con lo demás de Titerroy */
export function buildPuntaCana(scene, colliders, map) {
  if (!map?.puntaCana) return null;
  const k = new Kit();
  fachada(k);
  esquina(k);
  plantas(k);
  caseta(k);
  const group = enMarco(k, M, 'puntaCana', colliders);
  scene.add(group);
  return { group };
}
