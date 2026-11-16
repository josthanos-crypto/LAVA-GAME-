import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alzarEdificio, rebajarTramo, paredAlta, ventana as ventanaAlta } from './edificioReal.js';

/**
 * La Pastelería Zayes (cafetería y pastelería), en la avenida Eugenio Rijo Rocha 40, en la punta norte de la manzana
 * (Titerroy), con la vista de la calle de Google de julio de 2025 y la foto de enero de 2020 (solo se miran, no van
 * dentro del juego; la gente no se pone): el bajo color salmón con la cenefa de azulejos; la ventana con la reja
 * blanca; la puerta abierta con la pastelería dentro (las vitrinas y el mueble rosa); el letrerito rosa de
 * «Cafetería & Pastelería» en lo alto; y delante, en la acera, la terraza con el toldo rosa abovedado sobre sus
 * postes negros, el faldón con «Zayes», los paneles blancos bajos alrededor, las mesas de madera clara y las sillas
 * negras. A la derecha, el muro beige con la cenefa de colores, con dos mesitas más pegadas a la pared. Encima, como
 * en la vista de la calle de julio de 2025 mirando hacia arriba (el bloque del mapa era la manzana entera, de 6 m): la
 * casa de la pastelería tiene dos plantas, con la de arriba blanca, sus dos ventanas de marco verde y la franja de
 * bloques de cemento sin enfoscar de lo alto (7,3 m), y el costado de bloques también sin enfoscar; lo de al lado es de
 * una planta (3,9 m), con la banda blanca encima del muro beige, los cables y el cuarto de bloques de la azotea con
 * su chimenea.
 */

// la cara de la avenida (s desde la punta norte de la manzana hacia el sur); la vista de la calle pone la pastelería
// en s 0–5 y el muro beige hasta el final (el mapa no tenía rótulo suyo)
const M = marco([-777.67, -849.79], [-766.05, -833.97]);
const Z = 0.12, ZF = Z + 0.3, YP = 3.4, ROSA = 0xd85a8a, SALMON = 0xe8b898, BEIGE = 0xe0d4bc;
const T0 = -0.3, T1 = 4.9, FUERA = 3.0;
// la casa de la pastelería (de la punta a s 4,8), con la azotea a 7,3 m, y lo de al lado, de una planta
const E1 = 4.8, TECHO = 7.3, BLOQUES = 6.3, YC = 3.9, YB = 6.0, FONDO = 12;

/** antes de levantar la ciudad: la marca de que se monta (el mapa no tenía rótulo suyo) y las casas a su altura */
export function tunePasteleriaZayes(map) {
  map.pasteleriaZayes = true;
  rebajarTramo(map, M, E1, M.len, FONDO, YC, [240, 238, 232]);
  alzarEdificio(map, M, 0, E1, 10, TECHO, [244, 244, 240]);
}

// ——— lo que se pinta en lienzo ———

/** la cenefa de azulejos: una banda de rombos marrón, naranja y crema */
function cenefa(g, w, h) {
  g.fillStyle = '#e8d8b8';
  g.fillRect(0, 0, w, h);
  const p = h;
  for (let x = 0; x < w; x += p) {
    g.fillStyle = ['#a8642a', '#d88a3a', '#6a4a2a'][Math.floor(x / p) % 3];
    g.beginPath(); g.moveTo(x + p / 2, 1); g.lineTo(x + p - 1, h / 2); g.lineTo(x + p / 2, h - 1); g.lineTo(x + 1, h / 2); g.fill();
  }
}

/** la ventana con la reja blanca */
function ventana(g, w, h) {
  g.fillStyle = '#3a3634';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.1)';
  g.fillRect(0, 0, w * 0.35, h);
  g.strokeStyle = '#f2f2ee';
  g.lineWidth = 4;
  g.strokeRect(2, 2, w - 4, h - 4);
  for (let x = w / 6; x < w; x += w / 6) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (const y of [0.33, 0.66]) { g.beginPath(); g.moveTo(0, h * y); g.lineTo(w, h * y); g.stroke(); }
}

/** la pastelería por la puerta: las vitrinas, el mueble rosa y la luz */
function dentro(g, w, h) {
  g.fillStyle = '#ece8e2';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8d8d4';
  g.fillRect(w * 0.05, h * 0.3, w * 0.5, h * 0.35);
  g.fillStyle = '#c8a070';
  for (let y = 0.35; y < 0.6; y += 0.1) g.fillRect(w * 0.08, h * y, w * 0.44, h * 0.05);
  g.fillStyle = '#e04a8a';
  g.fillRect(w * 0.05, h * 0.65, w * 0.5, h * 0.2);
  g.fillStyle = '#f4f4f2';
  g.fillRect(w * 0.62, h * 0.4, w * 0.3, h * 0.45);
  g.fillStyle = '#8a7a6a';
  g.fillRect(0, h * 0.88, w, h * 0.12);
  g.strokeStyle = '#2a2a2c';
  g.lineWidth = 6;
  g.strokeRect(3, 3, w - 6, h - 6);
}

/** el letrerito rosa de «Cafetería & Pastelería» */
function letrerito(g, w, h) {
  g.fillStyle = '#e04a8a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4f4f0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 700 ${Math.round(h * 0.3)}px Georgia, serif`;
  g.fillText('Cafetería', w / 2, h * 0.32);
  g.fillText('& Pastelería', w / 2, h * 0.7);
}

/** el faldón rosa del toldo con «Zayes» */
function faldon(g, w, h) {
  g.fillStyle = '#c84a7a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4f4f0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 700 ${Math.round(h * 0.7)}px "Segoe Script", "Brush Script MT", Georgia, serif`;
  for (const x of [0.28, 0.72]) g.fillText('Zayes', w * x, h * 0.55);
}

/** el muro beige con su cenefa */
function muro(g, w, h) {
  g.fillStyle = '#e0d4bc';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(160,140,110,.25)';
  g.lineWidth = 1;
  for (let x = 0; x < w; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y < h; y += 30) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** los bloques de cemento sin enfoscar, grises, con sus juntas */
function bloques(g, w, h) {
  g.fillStyle = '#a8a49a';
  g.fillRect(0, 0, w, h);
  let s = 9;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const bh = h / Math.max(1, Math.round(h / 20)), bw = bh * 2;
  for (let y = 0, f = 0; y < h; y += bh, f++) {
    for (let x = (f % 2) * -bw / 2; x < w; x += bw) {
      const v = r() * 26 | 0;
      g.fillStyle = `rgb(${150 + v},${146 + v},${138 + v})`;
      g.fillRect(x + 1, y + 1, bw - 2, bh - 2);
    }
  }
}

// ——— las piezas ———

/** la pared de la pastelería y el muro beige de al lado */
function fachada(k) {
  // la pastelería: la pared salmón, la ventana, la puerta y el letrerito
  k.box(2.4, 0, Z + 0.15, 4.8, YP, 0.3, SALMON);
  k.pic(1.6, 1.55, ZF + 0.01, 1.3, 1.3, 0, 1, canvasTex(130, 130, ventana));
  k.pic(3.8, 1.15, ZF + 0.008, 1.2, 2.3, 0, 1, canvasTex(120, 230, dentro), { glow: 0.25 });
  k.box(3.8, 2.3, ZF + 0.02, 1.3, 0.08, 0.06, 0x2a2a2c);
  k.box(2.4, 2.75, ZF + 0.02, 1.2, 0.5, 0.05, 0xe04a8a);
  k.pic(2.4, 3.0, ZF + 0.05, 1.18, 0.48, 0, 1, canvasTex(160, 64, letrerito));
  // el muro beige con la cenefa, hasta el final de la cara
  k.box(12.2, 0, Z + 0.15, 14.8, YP, 0.3, BEIGE);
  k.pic(12.2, YP / 2, ZF + 0.003, 14.8, YP, 0, 1, canvasTex(600, 136, muro));
  const cz = canvasTex(400, 10, cenefa);
  k.pic(12.2, 1.8, ZF + 0.008, 14.8, 0.12, 0, 1, cz);
  k.pic(2.4, 2.35, ZF + 0.012, 4.8, 0.12, 0, 1, cz);
  k.block(9.8, Z + 0.15, 19.6, 0.3);
}

/** la terraza: el toldo rosa abovedado, los postes, los paneles blancos y las mesas */
function terraza(k) {
  const W = T1 - T0, cs = (T0 + T1) / 2, zf = ZF + FUERA;
  // los postes negros
  for (const s of [T0, cs, T1]) for (const z of [ZF + 0.2, zf]) { k.box(s, 0, z, 0.08, 2.6, 0.08, 0x1e1e20); k.block(s, z, 0.1, 0.1); }
  // la bóveda del toldo: un arco poco alto de lado a lado, que sale de la pared hasta los postes de delante
  const flecha = 0.5, R = (W * W / 4 + flecha * flecha) / (2 * flecha), yc = 2.6 + flecha - R, a0 = Math.asin(W / 2 / R), n = 10;
  for (let i = 0; i < n; i++) {
    const a = -a0 + (i + 0.5) * 2 * a0 / n, largo = 2 * R * Math.sin(a0 / n) + 0.02;
    const p = new THREE.BoxGeometry(largo, 0.03, FUERA + 0.2);
    p.rotateZ(-a);
    p.translate(cs + R * Math.sin(a), yc + R * Math.cos(a), ZF + 0.1 + FUERA / 2);
    k.add(p, ROSA);
  }
  // el frente del arco y el faldón con «Zayes»
  k.box(cs, 2.25, zf + 0.06, W, 0.35, 0.03, 0xc84a7a);
  k.pic(cs, 2.425, zf + 0.08, W - 0.02, 0.33, 0, 1, canvasTex(520, 34, faldon));
  // los paneles blancos bajos, por delante y por el lado de la esquina (la entrada por el lado de la tienda)
  k.box(cs, 0, zf, W, 0.95, 0.05, 0xf2f2ee);
  k.block(cs, zf, W, 0.1);
  k.box(T0, 0, ZF + FUERA / 2, 0.05, 0.95, FUERA - 0.4, 0xf2f2ee);
  k.block(T0, ZF + FUERA / 2, 0.1, FUERA - 0.4);
  // las mesas de madera clara con sillas negras
  for (const [s, z] of [[0.6, 1.0], [2.0, 1.0], [0.6, 2.2], [2.0, 2.2], [3.5, 2.2]]) {
    k.table(s, ZF + z, { w: 0.65, d: 0.65, h: 0.75, top: 0xc8a070, leg: 0x1e1e20 });
    k.chair(s, ZF + z - 0.48, 0, 0x1e1e20, { legs: 0x1e1e20 });
    k.chair(s, ZF + z + 0.48, Math.PI, 0x1e1e20, { legs: 0x1e1e20 });
    k.block(s, ZF + z, 0.65, 0.65);
  }
  // las dos mesitas pegadas al muro beige
  for (const s of [6.0, 8.2]) {
    k.table(s, ZF + 0.5, { w: 0.6, d: 0.6, h: 0.75, top: 0xc8a070, leg: 0x1e1e20 });
    k.chair(s - 0.45, ZF + 0.5, Math.PI / 2, 0x1e1e20, { legs: 0x1e1e20 });
    k.chair(s + 0.45, ZF + 0.5, -Math.PI / 2, 0x1e1e20, { legs: 0x1e1e20 });
    k.block(s, ZF + 0.5, 0.6, 0.6);
  }
}

/** lo de arriba: la planta blanca de la pastelería, la franja de bloques, el costado y lo de al lado */
function arriba(k) {
  // la planta de arriba de la pastelería: blanca, con sus dos ventanas de marco verde
  paredAlta(k, 0, E1, YP, BLOQUES, Z, 0xf2f2ee);
  for (const s of [1.2, 3.6]) {
    ventanaAlta(k, s, 4.4, 1.0, 1.15, Z, { carpinteria: '#2a7a3a', alfeizar: 0xe8e6e0 });
    for (const t of [s - 0.56, s + 0.56]) k.box(t, 4.4, ZF + 0.03, 0.1, 1.15, 0.06, 0x2a7a3a);
  }
  // la franja de bloques sin enfoscar de lo alto
  paredAlta(k, 0, E1, BLOQUES, TECHO, Z, 0xa8a49a);
  k.pic(E1 / 2, (BLOQUES + TECHO) / 2, ZF + 0.004, E1, TECHO - BLOQUES, 0, 1, canvasTex(240, 50, bloques));
  // los cables corridos por encima del bajo, de punta a punta
  for (const y of [3.55, 3.62]) k.box(M.len / 2, y, ZF + 0.04, M.len, 0.03, 0.03, 0x2a2a2c);
  // el costado de la pastelería que da a lo de al lado: de bloques sin enfoscar (por fuera de las caras del bloque)
  const zc = Z + 0.3 - FONDO / 2;
  k.box(E1 + 0.07, YC, zc, 0.12, TECHO - YC, FONDO, 0xa8a49a);
  k.pic(E1 + 0.135, (YC + TECHO) / 2, zc, FONDO, TECHO - YC, 1, 0, canvasTex(400, 120, bloques));
  // lo de al lado: la banda blanca encima del muro beige y la pared lisa del fondo de la muesca
  k.box((E1 + M.len) / 2, YP, Z + 0.15, M.len - E1, YC - YP, 0.3, 0xf0eee8);
  k.box((E1 + M.len) / 2, YC, Z + 0.3 - FONDO + 0.07, M.len - E1, YB - YC, 0.12, 0xf0eee8);
  // el cuarto de bloques de la azotea, con su chimenea
  k.box(8.0, YC, Z - 3.0, 2.4, 1.6, 2.6, 0xa8a49a);
  k.pic(8.0, YC + 0.8, Z - 1.69, 2.4, 1.6, 0, 1, canvasTex(120, 80, bloques));
  k.box(7.4, YC + 1.6, Z - 2.4, 0.5, 0.7, 0.5, 0xc8c4bc);
  k.box(7.4, YC + 2.3, Z - 2.4, 0.65, 0.08, 0.65, 0x9a968e);
}

/** se monta con lo demás de Titerroy */
export function buildPasteleriaZayes(scene, colliders, map) {
  if (!map?.pasteleriaZayes) return null;
  const k = new Kit();
  fachada(k);
  arriba(k);
  terraza(k);
  const group = enMarco(k, M, 'pasteleriaZayes', colliders);
  scene.add(group);
  return { group };
}
