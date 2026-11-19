import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alturaBloque, cristales } from './edificioReal.js';

/**
 * La cara de Clavijo y Fajardo de la manzana del este, enfrente de la esquina de Cáceres (números 7 a 34), con las
 * vistas de la calle de Google de julio de 2025 (solo se miran, no van dentro del juego; la gente no se pone). El mapa
 * la tenía como un bloque gris de 5 m. De norte a sur: el edificio color crema de la esquina, de bajo y dos plantas,
 * con el zócalo de piedra gris, las ventanas de persiana blanca abajo y las de cuarterones arriba, las ventanitas
 * cuadradas y el cuerpo de la escalera que sale; después, la fila de dúplex color crema de tres alturas, cada uno con
 * el porche metido y la puerta de madera, la escalera de fuera que sube a la primera planta, el balcón de barandilla
 * blanca con la pérgola encima (alguno cerrado con cristal), las ventanas de persiana blanca y el remate ondulado; y
 * al final, la casa blanca del 34 con la puerta verde, las ventanitas de cristal de colores, la ventana de marco verde,
 * los contadores y el buzón.
 */

// la cara de Clavijo y Fajardo del bloque, del norte (s 0) al sur, N hacia la calle (al oeste)
const M = marco([592.23, -549.08], [555.74, -485.06]);
const Z = 0.12, ZF = Z + 0.3, H = 9.4, CREMA = 0xf0e6d6, BLANCO = 0xf4f4f0, PIEDRA = 0x5a5c5e;
// el edificio de la esquina, los dúplex (cada uno de 6,5 m) y la casa blanca del 34
const ESQ1 = 14, DUP = [14, 20.5, 27, 33.5, 40, 46.5, 53], CASA0 = 59.5;

/** antes de levantar la ciudad: el bloque a la altura de las casas y color crema */
export function tuneCasasClavijo(map) {
  if (!alturaBloque(map, 590, -515, H, [240, 230, 214])) return;
  map.casasClavijo = true;
}

// ——— lo que se pinta en lienzo ———

/** el zócalo de piedra gris en hiladas */
function piedra(g, w, h) {
  g.fillStyle = '#5e6062';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(40,40,42,.55)';
  g.lineWidth = 1.5;
  const fila = h / 3;
  for (let y = 0, i = 0; y < h; y += fila, i++) {
    g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke();
    for (let x = (i % 2) * 25; x < w; x += 50) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + fila); g.stroke(); }
  }
}

/** la ventana de persiana de lamas blanca de dos hojas */
function persiana(g, w, h) {
  g.fillStyle = '#f4f4f0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#a8a8a4';
  for (let y = 5; y < h - 4; y += 5) g.fillRect(4, y, w - 8, 1.5);
  g.fillStyle = '#d8d8d4';
  g.fillRect(w / 2 - 1.5, 0, 3, h);
  g.strokeStyle = '#e4e4e0';
  g.lineWidth = 3;
  g.strokeRect(1.5, 1.5, w - 3, h - 3);
}

/** la ventanita de cristal de colores */
function colores(g, w, h) {
  const c = ['#b84a3a', '#3a6aa8', '#d8b040', '#4a8a4a'];
  for (let i = 0; i < 4; i++) { g.fillStyle = c[i]; g.fillRect((i % 2) * w / 2, Math.floor(i / 2) * h / 2, w / 2, h / 2); }
  g.strokeStyle = '#2a2a2a';
  g.lineWidth = 2;
  g.strokeRect(1, 1, w - 2, h - 2);
}

/** la puerta de madera de cuarterones (o la verde del 34) */
function puerta(color, oscuro) {
  return (g, w, h) => {
    g.fillStyle = color;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = oscuro;
    g.lineWidth = 3;
    for (const [x, y, a, b] of [[0.15, 0.08, 0.7, 0.38], [0.15, 0.54, 0.7, 0.38]]) g.strokeRect(w * x, h * y, w * a, h * b);
  };
}

const cuarterones = cristales('#f2f2ee', 2, 'rgba(230,226,215,.5)');
const ventanaVerde = cristales('#2a7a3e', 2, 'rgba(230,226,215,.5)');

// ——— las piezas ———

/** la pared de un tramo con su zócalo de piedra y el remate ondulado */
function pared(k, a, b, h, color, zocalo = true) {
  const c = (a + b) / 2, L = b - a;
  k.box(c, 0, Z + 0.15, L, h, 0.3, color);
  k.block(c, Z + 0.15, L, 0.3);
  if (zocalo) k.pic(c, 0.6, ZF + 0.006, L, 1.2, 0, 1, canvasTex(Math.round(L * 20), 24, piedra));
  for (let s = a; s < b - 0.1; s += 1.6) k.box(s + 0.8, h, ZF, 1.6, 0.12 + 0.1 * Math.abs(Math.sin(s)), 0.3, color);
}

/** el edificio crema de la esquina del norte */
function esquina(k) {
  pared(k, 0, ESQ1, H, CREMA);
  // el cuerpo de la escalera que sale, con su ventanita
  k.box(3.6, 3.0, ZF + 0.25, 1.4, H - 2.8, 0.5, CREMA);
  for (const y of [4.0, 7.0]) k.pic(3.6, y, ZF + 0.51, 0.4, 0.4, 0, 1, canvasTex(16, 16, cuarterones));
  for (const s of [1.6, 6.8, 10.6]) k.pic(s, 2.0, ZF + 0.012, 1.1, 1.3, 0, 1, canvasTex(44, 52, persiana));
  k.pic(5.0, 2.2, ZF + 0.012, 0.4, 0.4, 0, 1, canvasTex(16, 16, cuarterones));
  for (const y of [4.6, 7.6]) for (const s of [1.6, 6.8, 10.6]) k.pic(s, y + 0.6, ZF + 0.012, 1.0, 1.0, 0, 1, canvasTex(40, 40, cuarterones));
  k.box(0.6, 2.1, ZF + 0.03, 0.5, 0.25, 0.03, 0x1f4aa0);
}

/** un dúplex de la fila: el porche, la escalera de fuera, el balcón con la pérgola y las ventanas */
function duplex(k, a, i) {
  const b = a + 6.5;
  pared(k, a, b, H, CREMA);
  // el porche metido con la puerta de madera y el murete de piedra delante
  k.box(a + 4.7, 0, ZF + 0.02, 2.6, 2.6, 0.05, 0xece2d0);
  k.pic(a + 4.6, 1.15, ZF + 0.05, 0.95, 2.1, 0, 1, canvasTex(38, 84, puerta('#8a5a32', '#5a3a1e')));
  k.box(a + 4.7, 0, ZF + 0.25, 2.6, 0.9, 0.2, PIEDRA);
  // la escalera de fuera que sube al balcón, con su pasamanos
  for (let j = 0; j < 9; j++) k.box(a + 0.6 + j * 0.15, j * 0.33, ZF + 0.5, 0.18, 0.33, 0.9, 0xe8e8e4);
  k.box(a + 1.3, 1.6, ZF + 0.95, 1.6, 0.05, 0.05, 0xf2f2ee);
  // la ventana de persiana del bajo
  k.pic(a + 2.6, 1.9, ZF + 0.012, 1.0, 1.2, 0, 1, canvasTex(40, 48, persiana));
  // el balcón de la primera planta, con la barandilla blanca y la pérgola de vigas
  k.box(a + 3.25, 3.0, ZF + 0.6, 6.3, 0.2, 1.2, 0xf2f2ee);
  k.box(a + 3.25, 4.1, ZF + 1.15, 6.3, 0.05, 0.06, 0xf6f6f2);
  for (let s = a + 0.2; s < b - 0.1; s += 0.12) k.box(s, 3.2, ZF + 1.15, 0.025, 0.9, 0.025, 0xf6f6f2);
  for (const s of [a + 0.2, a + 3.25, b - 0.2]) k.box(s, 3.2, ZF + 1.15, 0.12, 2.6, 0.12, 0xf6f6f2);
  for (let s = a + 0.4; s < b; s += 0.7) k.box(s, 5.75, ZF + 0.65, 0.08, 0.1, 1.3, 0xf6f6f2);
  k.box(a + 3.25, 5.7, ZF + 1.15, 6.3, 0.1, 0.1, 0xf6f6f2);
  // las puertaventanas del balcón (una con la persiana, otra con los cuarterones o cerrada de cristal)
  k.pic(a + 1.7, 4.3, ZF + 0.012, 1.8, 2.0, 0, 1, canvasTex(72, 80, i % 3 === 1 ? persiana : cuarterones));
  k.pic(a + 4.8, 4.3, ZF + 0.012, 1.8, 2.0, 0, 1, canvasTex(72, 80, i % 2 ? persiana : cuarterones));
  if (i % 3 === 2) k.box(a + 4.8, 3.2, ZF + 1.1, 2.6, 2.4, 0.06, 0xe8ecee, { list: k.glass });
  // arriba, las ventanas de persiana
  for (const s of [a + 1.7, a + 4.6]) k.pic(s, 7.7, ZF + 0.012, 0.9, 1.0, 0, 1, canvasTex(36, 40, persiana));
  // los contadores
  if (i % 2 === 0) k.box(a + 3.6, 0.6, ZF + 0.08, 0.6, 0.6, 0.15, 0xe8e8e4);
}

/** la casa blanca del 34, al sur */
function casa34(k) {
  const L = M.len;
  pared(k, CASA0, L, H - 1.0, BLANCO, false);
  k.pic(CASA0 + 3.2, 1.15, ZF + 0.012, 1.0, 2.2, 0, 1, canvasTex(40, 88, puerta('#2a7a3e', '#1e5a2e')));
  k.box(CASA0 + 3.2, 2.4, ZF + 0.03, 0.2, 0.12, 0.02, 0x2a2a2a);
  for (const s of [CASA0 + 1.6, CASA0 + 5.2]) k.box(s, 0.9, ZF + 0.08, 0.5, 0.6, 0.15, 0xe8e8e4);
  k.box(CASA0 + 4.5, 1.3, ZF + 0.1, 0.3, 0.35, 0.2, 0x2a6a3a);
  for (const [s, y] of [[CASA0 + 2.0, 4.6], [CASA0 + 2.4, 6.8]]) k.pic(s, y, ZF + 0.012, 0.5, 0.5, 0, 1, canvasTex(20, 20, colores));
  k.pic(CASA0 + 6.8, 5.2, ZF + 0.012, 1.1, 1.0, 0, 1, canvasTex(44, 40, ventanaVerde));
}

/** la cara entera */
function fachada(k) {
  esquina(k);
  DUP.forEach((a, i) => duplex(k, a, i));
  casa34(k);
  // la señal de stop de la esquina del norte
  k.cyl(-0.8, 0, ZF + 1.4, 0.04, 0.04, 2.3, 0x9a9a98, { seg: 8 });
  k.cyl(-0.8, 2.3, ZF + 1.42, 0.32, 0.32, 0.03, 0xc82a2a, { seg: 8, rx: Math.PI / 2 });
}

/** se monta con lo demás de Valterra */
export function buildCasasClavijo(scene, colliders, map) {
  if (!map?.casasClavijo) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, M, 'casasClavijo', colliders);
  scene.add(group);
  return { group };
}
