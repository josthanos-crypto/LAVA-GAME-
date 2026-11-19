import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alzarEdificio, paredAlta, galeria, ventana, barandillaAzotea, aire, medianera } from './edificioReal.js';

/**
 * El Café Saudade, en la calle Manolo Millares 98 (centro), entre el Centro de Formación Canario y el Bar Cafetería
 * La Salida, con la foto de la entrada de mayo de 2025 y la vista de la calle de Google de julio de 2025 (solo se miran,
 * no van dentro del juego; la gente no se pone): el letrero ancho color crema con las golondrinas azules dibujadas, la
 * cinta de «BIO» con la rosa y la cinta de «CAFÉ SAUDADE»; los dos focos negros encima; el toldo blanco recogido; la
 * entrada abierta con la cafetería dentro (las lamparitas de pared, los espejos, los cuadros y las sillas blancas de
 * madera); las pizarras negras de los dos lados; la pared blanca con el zócalo de azulejos azules; delante, en la
 * acera, las mesas blancas con sus sillas blancas; y a la derecha, la puerta gris del portal con su azulejo. Las
 * pegatinas de las marcas no se ponen, y el letrero se queda con el nombre (sin la lista de lo que venden). Encima,
 * el edificio de verdad (vista de la calle mirando hacia arriba): color crema, el bajo y cuatro plantas, con la
 * galería cerrada de aluminio blanco y barrotes tumbados en cada planta, la ventanita de al lado, los aires y la
 * barandilla blanca de la azotea; el bloque del mapa es de cuatro plantas y aquí se levanta a cinco.
 */

// la cara de la calle Manolo Millares del bloque (s de oeste a este); la vista de la calle pone la entrada en
// s 47,4–50,6 y el portal en s 51,3 (Google pone el café en s 47; el mapa no tenía rótulo suyo)
const M = marco([-631.77, 351.89], [-558.04, 344.5]);
const Z = 0.12, ZF = Z + 0.3, S0 = 46.7, S1 = 52.3, BLANCO = 0xf4f2ec, CREMA = 0xe2d6ba;
// el edificio de verdad: el bajo (3,9 m) y cuatro plantas de 2,8 m, con la azotea a 15,1 m
const ALTO = 15.1, PLANTAS = [3.9, 6.7, 9.5, 12.3];

/** antes de levantar la ciudad: la marca de que se monta (el mapa no tenía rótulo suyo) y el edificio a su altura */
export function tuneCafeSaudade(map) {
  map.cafeSaudade = true;
  // el edificio a su altura de verdad (el bloque del mapa es más bajo)
  alzarEdificio(map, M, S0, S1, 12, ALTO, [226, 214, 186]);
}

// ——— lo que se pinta en lienzo ———

/** una golondrina azul en vuelo */
function golondrina(g, x, y, t, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.fillStyle = '#2a5ab0';
  g.beginPath();
  g.moveTo(-t, -t * 0.1); g.quadraticCurveTo(-t * 0.3, -t * 0.7, t * 0.2, -t * 0.15);
  g.quadraticCurveTo(t * 0.6, -t * 0.5, t, -t * 0.4); g.quadraticCurveTo(t * 0.5, 0, t * 0.15, t * 0.15);
  g.lineTo(t * 0.6, t * 0.75); g.lineTo(0, t * 0.3); g.lineTo(-t * 0.25, t * 0.75); g.lineTo(-t * 0.15, t * 0.1);
  g.closePath(); g.fill();
  g.fillStyle = '#c84a3a';
  g.beginPath(); g.arc(t * 0.25, -t * 0.12, t * 0.08, 0, Math.PI * 2); g.fill();
  g.restore();
}

/** una cinta de pergamino con su texto */
function cinta(g, x, y, w, h, texto, rot) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.fillStyle = '#f2ead4';
  g.strokeStyle = '#3a3a3c';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(-w / 2, -h / 2); g.quadraticCurveTo(0, -h * 0.8, w / 2, -h / 2);
  g.lineTo(w / 2 + h * 0.4, 0); g.lineTo(w / 2, h / 2);
  g.quadraticCurveTo(0, h * 0.2, -w / 2, h / 2); g.lineTo(-w / 2 - h * 0.4, 0); g.closePath();
  g.fill(); g.stroke();
  g.fillStyle = '#2a2a2c';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `600 ${Math.round(h * 0.62)}px Georgia, "Times New Roman", serif`;
  g.fillText(texto, 0, -h * 0.05, w * 0.9);
  g.restore();
}

/** el letrero crema con las golondrinas, la cinta de «BIO» con la rosa y la de «CAFÉ SAUDADE» */
function letrero(g, w, h) {
  g.fillStyle = '#f2ecd2';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(170,150,110,.18)';
  for (let x = 0; x < w; x += 7) g.fillRect(x, 0, 2, h);
  golondrina(g, w * 0.08, h * 0.32, h * 0.26, -0.3);
  golondrina(g, w * 0.25, h * 0.3, h * 0.28, 0.2);
  golondrina(g, w * 0.52, h * 0.38, h * 0.3, -0.2);
  golondrina(g, w * 0.84, h * 0.28, h * 0.26, 0.3);
  golondrina(g, w * 0.94, h * 0.55, h * 0.2, -0.1);
  // la rosa roja y la cinta de «BIO»
  g.fillStyle = '#c82a3a';
  g.beginPath(); g.arc(w * 0.3, h * 0.78, h * 0.1, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3a8a3a';
  g.beginPath(); g.ellipse(w * 0.27, h * 0.86, h * 0.08, h * 0.03, -0.5, 0, Math.PI * 2); g.fill();
  cinta(g, w * 0.3, h * 0.6, w * 0.08, h * 0.16, 'BIO', 0.15);
  // «CAFÉ» encima y la cinta grande de «SAUDADE»
  g.fillStyle = '#4a4a4c';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `600 ${Math.round(h * 0.17)}px Georgia, serif`;
  g.fillText('CAFÉ', w * 0.7, h * 0.25);
  cinta(g, w * 0.7, h * 0.52, w * 0.26, h * 0.26, 'SAUDADE', 0.06);
  g.strokeStyle = 'rgba(80,70,50,.35)';
  g.lineWidth = 3;
  g.strokeRect(1.5, 1.5, w - 3, h - 3);
}

/** la cafetería por la entrada abierta: las lamparitas, los espejos, los cuadros y las sillas blancas */
function dentro(g, w, h) {
  g.fillStyle = '#efe8d8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e2d6bc';
  g.fillRect(0, h * 0.62, w, h * 0.38);
  // las lamparitas de pared
  g.fillStyle = '#f8e8b0';
  for (const x of [0.25, 0.55]) { g.beginPath(); g.arc(w * x, h * 0.28, 5, 0, Math.PI * 2); g.fill(); }
  // los cuadros y el espejo ovalado
  for (const [x, y, ww, hh] of [[0.38, 0.22, 0.08, 0.1], [0.68, 0.2, 0.07, 0.12], [0.8, 0.3, 0.06, 0.08]]) { g.fillStyle = '#3a2e26'; g.fillRect(w * x, h * y, w * ww, h * hh); }
  g.strokeStyle = '#8a6a3a';
  g.lineWidth = 3;
  g.beginPath(); g.ellipse(w * 0.15, h * 0.35, w * 0.04, h * 0.08, 0, 0, Math.PI * 2); g.stroke();
  // las sillas blancas de madera y las mesitas
  g.strokeStyle = '#f8f8f4';
  g.lineWidth = 4;
  for (const x of [0.3, 0.5, 0.7]) {
    g.beginPath(); g.moveTo(w * x, h * 0.92); g.lineTo(w * x, h * 0.55); g.lineTo(w * (x + 0.05), h * 0.55); g.lineTo(w * (x + 0.05), h * 0.92); g.stroke();
    g.beginPath(); g.moveTo(w * x, h * 0.72); g.lineTo(w * (x + 0.08), h * 0.72); g.stroke();
  }
  g.fillStyle = '#6a4a32';
  g.fillRect(w * 0.4, h * 0.68, w * 0.12, h * 0.03);
  g.fillStyle = 'rgba(0,0,0,.12)';
  g.fillRect(0, 0, w, h);
}

/** una pizarra negra con letras de tiza de colores (sin leerse) */
function pizarra(g, w, h) {
  g.fillStyle = '#2a2a2c';
  g.fillRect(0, 0, w, h);
  let s = 19;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let y = h * 0.1; y < h * 0.9; y += h * 0.09) {
    g.fillStyle = ['#f2f2ee', '#e8c84a', '#e87a9a', '#8ad8a8'][Math.floor(r() * 4)];
    g.fillRect(w * 0.15, y, w * (0.3 + r() * 0.5), 3);
  }
  g.strokeStyle = '#8a6a4a';
  g.lineWidth = 5;
  g.strokeRect(2, 2, w - 4, h - 4);
}

/** los azulejos azules del zócalo */
function azulejos(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  const c = h / 3;
  g.strokeStyle = '#2a4a9a';
  g.lineWidth = 2;
  for (let y = 0; y < h; y += c) for (let x = 0; x < w; x += c) {
    g.strokeRect(x + 1, y + 1, c - 2, c - 2);
    g.beginPath(); g.arc(x + c / 2, y + c / 2, c * 0.25, 0, Math.PI * 2); g.stroke();
  }
}

/** la puerta gris del portal */
function portal(g, w, h) {
  g.fillStyle = '#c8cacc';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#8a9aa8';
  g.fillRect(w * 0.15, h * 0.08, w * 0.7, h * 0.55);
  g.strokeStyle = '#9a9c9e';
  g.lineWidth = 3;
  g.strokeRect(2, 2, w - 4, h - 4);
  g.fillStyle = '#5a5c5e';
  g.fillRect(w * 0.8, h * 0.5, 4, 14);
}

// ——— las piezas ———

/** la fachada: la pared, el zócalo de azulejos, la entrada, las pizarras, el letrero, los focos, el toldo y el portal */
function fachada(k) {
  const c = (S0 + S1) / 2;
  k.box(c, 0, Z + 0.15, S1 - S0, 3.9, 0.3, BLANCO);
  k.block(c, Z + 0.15, S1 - S0, 0.3);
  // el zócalo de azulejos de los lados
  for (const [a, b] of [[S0, 47.4], [50.6, S1]]) k.pic((a + b) / 2, 0.45, ZF + 0.006, b - a, 0.9, 0, 1, canvasTex(Math.round((b - a) * 60), 54, azulejos));
  // la entrada abierta con la cafetería dentro y su marco negro
  k.pic(49.0, 1.2, ZF + 0.01, 3.2, 2.4, 0, 1, canvasTex(320, 240, dentro), { glow: 0.3 });
  for (const s of [47.4, 50.6]) k.box(s, 0, ZF + 0.03, 0.1, 2.5, 0.08, 0x2a2a2c);
  // las dos pizarras de los lados
  k.pic(47.75, 1.0, ZF + 0.06, 0.6, 1.4, 0, 1, canvasTex(60, 140, pizarra));
  k.pic(50.25, 1.05, ZF + 0.06, 0.5, 1.2, 0, 1, canvasTex(50, 120, pizarra));
  // el toldo blanco recogido bajo el letrero
  k.box(49.0, 2.5, ZF + 0.25, 3.6, 0.22, 0.5, 0xf2f2ee);
  // el letrero crema y los dos focos negros
  k.box(49.0, 2.75, ZF + 0.05, 3.9, 1.0, 0.12, 0xe8e0c4);
  k.pic(49.0, 3.25, ZF + 0.115, 3.88, 0.98, 0, 1, canvasTex(560, 140, letrero));
  for (const s of [48.0, 50.2]) {
    k.box(s, 3.8, ZF + 0.12, 0.05, 0.05, 0.3, 0x2a2a2c);
    const foco = new THREE.BoxGeometry(0.3, 0.16, 0.22);
    foco.rotateX(0.5);
    foco.translate(s, 3.85, ZF + 0.32);
    k.add(foco, 0x1e1e20);
  }
  // el portal gris con su azulejo
  k.pic(51.45, 1.1, ZF + 0.012, 1.0, 2.2, 0, 1, canvasTex(100, 220, portal));
  k.pic(51.45, 2.45, ZF + 0.012, 0.3, 0.3, 0, 1, canvasTex(30, 30, azulejos));
}

/** las plantas de arriba: la pared crema, la galería cerrada de cada planta, la ventanita, los aires y la azotea */
function plantas(k) {
  paredAlta(k, S0, S1, 3.9, ALTO, Z, CREMA);
  k.box((S0 + S1) / 2, 3.9, ZF + 0.02, S1 - S0, 0.12, 0.08, 0xd2c6aa);
  PLANTAS.forEach((y, i) => {
    galeria(k, 46.95, 50.3, y + 0.15, Z, { sale: 0.65, alto: 2.45 });
    ventana(k, 51.5, y + 0.95, 0.9, 1.25, Z, { carpinteria: '#e8e8e4' });
    if (i % 2 === 0) aire(k, 51.5, y + 0.15, Z);
  });
  barandillaAzotea(k, S0, S1, ALTO, Z);
  // las medianeras lisas de los costados que asoman por encima del bloque del mapa
  for (const s of [S0 - 0.07, S1 + 0.07]) medianera(k, s, 12.2, ALTO + 0.6, 12, Z, 0xdcd0b4);
}

/** las mesas blancas de la acera con sus sillas blancas */
function terraza(k) {
  for (const [s, z] of [[47.8, 1.4], [49.6, 1.4], [51.4, 1.6]]) {
    k.table(s, ZF + z, { w: 0.65, d: 0.65, h: 0.74, top: 0xf2f2ee, leg: 0xd8d8d4 });
    k.chair(s, ZF + z - 0.5, 0, 0xf4f4f0, { legs: 0xe8e8e4 });
    k.chair(s, ZF + z + 0.5, Math.PI, 0xf4f4f0, { legs: 0xe8e8e4 });
    k.block(s, ZF + z, 0.65, 0.65);
  }
}

/** se monta con lo demás de Arrecife Centro */
export function buildCafeSaudade(scene, colliders, map) {
  if (!map?.cafeSaudade) return null;
  const k = new Kit();
  fachada(k);
  plantas(k);
  terraza(k);
  const group = enMarco(k, M, 'cafeSaudade', colliders);
  scene.add(group);
  return { group };
}
