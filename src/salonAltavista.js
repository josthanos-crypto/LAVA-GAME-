import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco, sombrillaGrande, trocear } from './restaurantesCharco.js';
import { cristales, galeria, barandillaAzotea, aire } from './edificioReal.js';
import { paveMesh, polyTris, lightSlabs } from './suelos.js';

/**
 * La Cafetería - Salón Recreativo ALTAVISTA, en la calle Calderón de la Barca 4 (la cara sur de la manzana del Bar Los
 * Arrieros, la que da al aparcamiento de la gasolinera Plenergy), con la foto del local de octubre de 2024 y las vistas
 * de la calle de Google de 2014, 2022 y 2025 (solo se miran, no van dentro del juego; la gente no se pone).
 * El mapa tenía toda esa cara como la pared lisa de 6 m del bloque, con ventanas repetidas. De verdad:
 * - el salón es una casa de dos plantas color crema con las molduras beis: abajo, la cristalera de la cafetería, la
 *   puerta blanca del portal con su montante de medio punto y la cristalera de las apuestas con los paneles rojos;
 *   arriba, dos ventanas con barandilla blanca y el ojo de buey en medio; en la azotea, el rótulo rojo «CAFETERÍA», el
 *   redondo «ALTAVISTA» y el grande «SALÓN RECREATIVO»; delante, la terraza con las sombrillas crema;
 * - hacia el oeste, la casa de la reja blanca, la del garaje blanco y la de la puerta verde con las galerías verdes
 *   (de tres plantas);
 * - hacia el este, la pared blanca con el zócalo gris hasta la esquina de León y Castillo, y delante el paseo de losetas
 *   con el parterre, los árboles y los bancos.
 */

// la cara sur de la manzana, de la esquina del oeste (s 0, calle Blasco Ibáñez) a la de León y Castillo; N hacia el sur
const M = marco([248.9, -864.3], [297.5, -853.3]);
const Z = 0.12, ZF = Z + 0.3;
// el salón, medido en la vista de la calle de 2014: de s 21,1 a 30,4, con el cuerpo del medio de 24,1 a 26,2
const S0 = 21.1, S1 = 30.4, SC = (S0 + S1) / 2, MED0 = 24.1, MED1 = 26.2;
const CREMA = 0xf1e6c2, BEIS = 0xd6bf8e, BLANCO = 0xf2f1ec, GRIS = 0x8c8e8e, VERDE = 0x2f7a3e, ROJO = 0xb3202a;
// la casa de la puerta verde, de tres plantas, y su alto
const VERDE0 = 7.6, VERDE1 = 13.8, HVERDE = 9.2;

/** antes de levantar la ciudad */
export function tuneSalonAltavista(map) {
  map.salonAltavista = true;
}

/** un rótulo rojo con las letras blancas y el borde granate */
function rotuloRojo(lineas, { cursiva = true, borde = '#7a121a' } = {}) {
  return (g, w, h) => {
    g.fillStyle = '#b3202a';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = borde;
    g.lineWidth = Math.max(4, h * 0.06);
    g.strokeRect(3, 3, w - 6, h - 6);
    g.fillStyle = '#ffffff';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    lineas.forEach(([texto, y, t]) => {
      g.font = `${cursiva ? 'italic ' : ''}800 ${Math.round(h * t)}px "Arial Black", Arial, sans-serif`;
      g.fillText(texto, w / 2, h * y, w * 0.9);
    });
  };
}

/** el redondo del nombre: el aro rojo, el fondo crema y «ALTAVISTA» en rojo */
function redondo(g, w, h) {
  g.fillStyle = '#b3202a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4ead0';
  g.beginPath();
  g.arc(w / 2, h / 2, w * 0.4, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#b3202a';
  g.lineWidth = w * 0.03;
  g.beginPath();
  g.arc(w / 2, h / 2, w * 0.31, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = '#b3202a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(h * 0.13)}px "Arial Black", Arial, sans-serif`;
  g.fillText('ALTAVISTA', w / 2, h / 2, w * 0.56);
}

/** la persiana enrollable blanca del garaje, de lamas */
function lamas(g, w, h) {
  g.fillStyle = '#eceae4';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c8c6c0';
  g.lineWidth = 2;
  for (let y = 6; y < h; y += 9) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** la rejilla de ventilación de encima de las cristaleras */
function rejilla(g, w, h) {
  g.fillStyle = '#d8d6d0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#8a8884';
  for (let y = 3; y < h - 2; y += 6) g.fillRect(3, y, w - 6, 2);
}

/** la puerta blanca del portal, de cuarterones con el arco de arriba */
function puertaPortal(g, w, h) {
  g.fillStyle = '#f6f6f2';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d0d0ca';
  g.lineWidth = 3;
  g.strokeRect(w * 0.15, h * 0.32, w * 0.7, h * 0.25);
  g.strokeRect(w * 0.15, h * 0.62, w * 0.7, h * 0.3);
  g.beginPath();
  g.moveTo(w * 0.15, h * 0.27);
  g.lineTo(w * 0.15, h * 0.14);
  g.quadraticCurveTo(w * 0.5, h * 0.02, w * 0.85, h * 0.14);
  g.lineTo(w * 0.85, h * 0.27);
  g.closePath();
  g.stroke();
}

/** la puerta verde de la casa del oeste, con su arco en el cuarterón */
function puertaVerde(g, w, h) {
  g.fillStyle = '#2f7a3e';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#225c2e';
  g.lineWidth = 4;
  g.strokeRect(w * 0.14, h * 0.5, w * 0.72, h * 0.4);
  g.beginPath();
  g.moveTo(w * 0.14, h * 0.44);
  g.lineTo(w * 0.14, h * 0.2);
  g.quadraticCurveTo(w * 0.5, h * 0.04, w * 0.86, h * 0.2);
  g.lineTo(w * 0.86, h * 0.44);
  g.closePath();
  g.stroke();
}

/** una barandilla blanca de barrotes en un balconcito con su losa beis */
function balconcito(k, s0, s1, y) {
  const c = (s0 + s1) / 2, w = s1 - s0;
  k.box(c, y - 0.1, ZF + 0.2, w + 0.2, 0.1, 0.4, BEIS);
  k.box(c, y + 0.92, ZF + 0.36, w + 0.04, 0.05, 0.05, BLANCO);
  k.box(c, y + 0.05, ZF + 0.36, w + 0.04, 0.04, 0.04, BLANCO);
  for (let s = s0; s <= s1 + 0.01; s += 0.11) k.box(s, y, ZF + 0.36, 0.03, 0.94, 0.03, BLANCO);
  for (const s of [s0, s1]) k.box(s, y, ZF + 0.18, 0.04, 0.94, 0.36, BLANCO);
}

/** el edificio del salón entero: el volumen, las molduras, los huecos, la azotea y los rótulos */
function salon(k) {
  const W = S1 - S0, FONDO = 9;
  // el volumen de la casa (más alto que el bloque del mapa), con la azotea a 6,9 m y el pretil
  k.box(SC, 0, (ZF - FONDO) / 2, W, 6.9, FONDO + ZF, CREMA);
  k.box(SC, 6.9, ZF - 0.15, W, 0.8, 0.3, CREMA);
  k.box(SC, 6.9, -FONDO + 0.15, W, 0.8, 0.3, CREMA);
  for (const s of [S0 + 0.15, S1 - 0.15]) k.box(s, 6.9, (ZF - FONDO) / 2, 0.3, 0.8, FONDO + ZF, CREMA);
  k.box(SC, 7.7, ZF - 0.15, W + 0.1, 0.1, 0.36, BEIS);
  // el cuerpo del medio, un poco saliente y más alto, con su remate
  k.box((MED0 + MED1) / 2, 0, ZF + 0.04, MED1 - MED0, 8.35, 0.1, CREMA);
  k.box((MED0 + MED1) / 2, 8.35, ZF - 0.1, MED1 - MED0 + 0.16, 0.12, 0.4, BEIS);
  // la moldura de la primera planta y la cornisa de arriba, beis y salientes
  k.box(SC, 3.9, ZF + 0.12, W + 0.1, 0.35, 0.24, BEIS);
  k.box(SC, 6.4, ZF + 0.14, W + 0.1, 0.35, 0.28, BEIS);
  // el zócalo gris de abajo, en los trozos de pared
  for (const [a, b] of [[S0, 21.48], [23.73, 24.66], [25.82, 26.81], [29.99, S1]]) k.box((a + b) / 2, 0, ZF + 0.02, b - a, 0.55, 0.06, GRIS);

  // abajo: la cristalera de la cafetería, la puerta del portal con el montante y la cristalera de las apuestas
  hueco(k, 22.6, 0, 2.25, 2.75, canvasTex(270, 330, cristales('#f2f2ee', 3, 'rgba(120,110,95,.35)')), { borde: BLANCO, z: ZF });
  hueco(k, 25.24, 0, 1.12, 2.4, canvasTex(112, 240, puertaPortal), { borde: BLANCO, z: ZF + 0.09 });
  hueco(k, 25.24, 2.62, 1.0, 0.5, canvasTex(160, 80, cristales('#f2f2ee', 1)), { borde: BEIS, z: ZF + 0.09 });
  hueco(k, 28.4, 0, 3.18, 2.75, canvasTex(380, 330, cristales('#f2f2ee', 4, 'rgba(60,50,50,.25)')), { borde: BLANCO, z: ZF });
  // los paneles rojos de las dos hojas de los lados de la cristalera de las apuestas
  for (const s of [27.2, 29.6]) k.box(s, 0.05, ZF + 0.06, 0.74, 2.6, 0.03, ROJO);
  k.pic(28.4, 3.12, ZF + 0.05, 2.9, 0.55, 0, 1, canvasTex(580, 110, rotuloRojo([['SPORTIUM', 0.38, 0.5], ['APUESTAS DEPORTIVAS', 0.8, 0.2]])));
  // las rejillas de encima, los buzones, el timbre rojo de la alarma
  k.pic(22.47, 3.5, ZF + 0.02, 0.45, 0.3, 0, 1, canvasTex(60, 40, rejilla));
  k.pic(28.14, 3.62, ZF + 0.02, 0.5, 0.26, 0, 1, canvasTex(60, 32, rejilla));
  for (const s of [24.0, 24.38]) k.box(s, 1.35, ZF + 0.06, 0.32, 0.36, 0.12, 0x8a8c8e);
  k.cyl(26.4, 3.35, ZF, 0.16, 0.16, 0.08, 0xc0302a, { rx: Math.PI / 2, seg: 16 });

  // arriba: las dos ventanas con la barandilla blanca y el ojo de buey del medio
  hueco(k, 22.76, 4.35, 1.94, 1.65, canvasTex(230, 200, cristales('#f2f2ee', 4)), { borde: BLANCO, z: ZF });
  balconcito(k, 21.7, 23.82, 4.35);
  hueco(k, 28.08, 4.35, 2.35, 1.65, canvasTex(280, 200, cristales('#f2f2ee', 4)), { borde: BLANCO, z: ZF });
  balconcito(k, 26.82, 29.34, 4.35);
  k.cyl(25.2, 4.7, ZF + 0.04, 0.5, 0.5, 0.1, BEIS, { rx: Math.PI / 2, seg: 28 });
  k.cyl(25.2, 4.7, ZF + 0.04, 0.38, 0.38, 0.13, 0x2c3640, { rx: Math.PI / 2, seg: 28 });

  // la azotea: la reja blanca de la izquierda y los rótulos
  barandillaAzotea(k, S0 + 0.3, MED0 - 0.2, 7.8, Z);
  k.box(22.6, 6.78, ZF + 0.12, 2.3, 0.78, 0.14, 0x7a121a);
  k.pic(22.6, 7.17, ZF + 0.2, 2.24, 0.72, 0, 1, canvasTex(448, 144, rotuloRojo([['CAFETERÍA', 0.53, 0.58]])), { glow: 0.25 });
  k.cyl(25.15, 7.9, ZF + 0.12, 0.75, 0.75, 0.1, ROJO, { rx: Math.PI / 2, seg: 32 });
  k.pic(25.15, 7.9, ZF + 0.23, 1.04, 1.04, 0, 1, canvasTex(256, 256, redondo), { glow: 0.25 });
  k.box(28.4, 6.78, ZF + 0.12, 3.9, 1.25, 0.16, 0x7a121a);
  k.pic(28.4, 7.4, ZF + 0.21, 3.82, 1.18, 0, 1, canvasTex(640, 198, rotuloRojo([['SALÓN', 0.3, 0.34], ['RECREATIVO', 0.7, 0.42]])), { glow: 0.25 });
}

/** las casas del oeste: la de la puerta verde (tres plantas), la del garaje y la de la reja blanca */
function casasOeste(k) {
  // la pared blanca de toda la tira (tapa las ventanas repetidas del bloque)
  k.box(S0 / 2, 0, Z + 0.15, S0, 6.05, 0.3, BLANCO);
  k.block(S0 / 2, Z + 0.15, S0, 0.3);
  // la primera casa, de la esquina de Blasco Ibáñez: puerta, ventana y las dos ventanas de arriba
  hueco(k, 3.2, 0, 0.95, 2.2, canvasTex(96, 220, puertaPortal), { borde: BLANCO, z: ZF });
  for (const [s, y, w, h] of [[5.6, 1.0, 1.2, 1.2], [2.6, 3.7, 1.2, 1.2], [5.6, 3.7, 1.2, 1.2]]) {
    hueco(k, s, y, w, h, canvasTex(120, 120, cristales('#4a4e52', 2)), { borde: 0xe8e4dc, z: ZF });
  }
  // la casa de la puerta verde: tres plantas, la reja verde, los buzones, la ventana grande verde y la galería de arriba
  k.box((VERDE0 + VERDE1) / 2, 0, (ZF - 8) / 2, VERDE1 - VERDE0, HVERDE, 8 + ZF, BLANCO);
  k.box((VERDE0 + VERDE1) / 2, HVERDE, ZF - 0.15, VERDE1 - VERDE0 + 0.08, 0.12, 0.34, 0xe2dfd8);
  hueco(k, 11.9, 0, 0.92, 2.2, canvasTex(92, 220, puertaVerde), { borde: 0x225c2e, z: ZF });
  hueco(k, 13.05, 1.0, 0.95, 1.1, canvasTex(96, 110, cristales('#f2f2ee', 2)), { borde: VERDE, z: ZF });
  for (let s = 12.62; s <= 13.5; s += 0.11) k.box(s, 0.98, ZF + 0.1, 0.025, 1.16, 0.025, VERDE);
  for (const y of [1.0, 1.55, 2.12]) k.box(13.05, y, ZF + 0.1, 0.98, 0.03, 0.03, VERDE);
  for (const s of [10.2, 10.55]) k.box(s, 1.3, ZF + 0.06, 0.3, 0.34, 0.1, 0xeeeeea);
  hueco(k, 11.2, 3.5, 3.4, 1.9, canvasTex(340, 190, cristales('#2f7a3e', 4)), { borde: VERDE, z: ZF });
  k.box(11.2, 3.08, ZF + 0.02, 3.4, 0.42, 0.04, 0xdcdad4);
  galeria(k, 9.4, 13.2, 6.3, Z, { sale: 0.55, alto: 2.3, color: VERDE });
  // la casa del garaje: la persiana blanca de lamas, la ventanita de arriba y el aire
  hueco(k, 15.6, 0, 2.4, 2.5, canvasTex(240, 250, lamas), { borde: 0xe2e0da, z: ZF });
  hueco(k, 15.8, 3.7, 1.1, 1.2, canvasTex(110, 120, cristales('#4a4e52', 2)), { borde: 0xe8e4dc, z: ZF });
  aire(k, 14.5, 3.3, Z);
  // la casa de la reja blanca: el murete con la reja encima, la cancela y la ventana de arriba
  k.box(19.95, 0, ZF + 0.05, 2.0, 1.0, 0.1, 0xeeeeea);
  for (let s = 19.0; s <= 20.92; s += 0.12) k.box(s, 1.0, ZF + 0.1, 0.03, 0.95, 0.03, BLANCO);
  k.box(19.95, 1.92, ZF + 0.1, 2.0, 0.05, 0.05, BLANCO);
  hueco(k, 18.25, 0, 1.2, 1.95, canvasTex(120, 195, (g, w, h) => {
    g.fillStyle = '#3a3e40';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#f2f2ee';
    for (let x = 4; x < w; x += 12) g.fillRect(x, 0, 4, h);
    g.fillRect(0, 0, w, 6);
    g.fillRect(0, h * 0.5, w, 5);
  }), { borde: BLANCO, z: ZF });
  hueco(k, 19.5, 3.7, 1.3, 1.2, canvasTex(130, 120, cristales('#f2f2ee', 2)), { borde: 0xe8e4dc, z: ZF });
}

/** la pared del este: blanca con el zócalo gris hasta la esquina de León y Castillo, con la puerta verde */
function paredEste(k) {
  const L = M.len, w = L - S1, c = (S1 + L) / 2;
  k.box(c, 0, Z + 0.15, w, 6.05, 0.3, BLANCO);
  k.block(c, Z + 0.15, w, 0.3);
  k.box(c, 0, ZF + 0.02, w, 1.1, 0.06, GRIS);
  k.box(c, 5.85, ZF + 0.06, w, 0.2, 0.15, 0xe2e2de);
  k.box(47.6, 0, ZF + 0.05, 1.0, 2.3, 0.06, VERDE);
  for (const y of [0.7, 1.5]) k.box(47.6, y, ZF + 0.09, 0.8, 0.03, 0.02, 0x245e30);
}

/** la terraza de delante del salón: sombrillas crema, mesas y sillas grises y la pizarra de caballete */
function terraza(k) {
  for (const s of [22.2, 25.2]) sombrillaGrande(k, s, 3.3, 0xeee8d8);
  for (const [s, z] of [[21.2, 2.4], [23.3, 2.5], [21.8, 4.3], [24.5, 4.4]]) {
    k.table(s, z, { w: 0.7, d: 0.7, h: 0.74, top: 0x6a6c70, leg: 0x3a3c40 });
    k.chair(s - 0.55, z, Math.PI / 2, 0x4a4c50, { legs: 0x3a3c40 });
    k.chair(s + 0.55, z, -Math.PI / 2, 0x4a4c50, { legs: 0x3a3c40 });
  }
  // la pizarra de caballete, de madera con la cara negra (sin letras)
  for (const lado of [-1, 1]) {
    const tabla = new THREE.BoxGeometry(0.62, 1.05, 0.04);
    tabla.translate(0, 0.525, 0);
    tabla.rotateX(-lado * 0.2);
    tabla.translate(25.9, 0, 1.8 + lado * 0.11);
    k.add(tabla, 0xb88a4a);
    const cara = new THREE.BoxGeometry(0.52, 0.86, 0.045);
    cara.translate(0, 0.56, 0);
    cara.rotateX(-lado * 0.2);
    cara.translate(25.9, 0, 1.8 + lado * 0.115);
    k.add(cara, 0x262826);
  }
  k.block(25.9, 1.8, 0.62, 0.5);
}

/** un árbol del paseo: tronco alto y la copa de bolas */
function arbol(k, s, z, h, sd) {
  k.cyl(s, 0, z, 0.14, 0.22, h * 0.55, 0x6a5440, { seg: 8 });
  const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 14; i++) {
    k.ball(s + (r() - 0.5) * h * 0.4, h * (0.55 + r() * 0.35), z + (r() - 0.5) * h * 0.35, h * (0.08 + r() * 0.05), [0x3e6a2e, 0x4a7a36, 0x56863c][i % 3], { seg: 7 });
  }
  k.block(s, z, 0.4, 0.4);
}

/** una farola gris de brazo curvo */
function farola(k, s, z, h) {
  k.cyl(s, 0, z, 0.07, 0.1, h, 0x9aa0a4, { seg: 8 });
  k.box(s, h - 0.05, z + 0.5, 0.06, 0.06, 1.0, 0x9aa0a4);
  k.box(s, h - 0.18, z + 1.0, 0.22, 0.14, 0.45, 0x6a6e72);
  k.block(s, z, 0.25, 0.25);
}

/** el paseo de delante: el parterre con su bordillo, los árboles, los bancos y las farolas */
function paseo(k) {
  const [p0, p1, q0, q1] = [38.0, 51.0, 4.8, 7.6];
  const c = (p0 + p1) / 2, zc = (q0 + q1) / 2;
  for (const z of [q0, q1]) k.box(c, 0, z, p1 - p0, 0.32, 0.16, 0xc4beb2);
  for (const s of [p0, p1]) k.box(s, 0, zc, 0.16, 0.32, q1 - q0, 0xc4beb2);
  k.box(c, 0, zc, p1 - p0 - 0.16, 0.26, q1 - q0 - 0.16, 0x4a3a2e);
  k.block(c, zc, p1 - p0, q1 - q0);
  arbol(k, 49.0, 6.2, 7.5, 31);
  arbol(k, 41.5, 6.2, 5.0, 57);
  for (const s of [34.4, 36.6]) {
    k.box(s, 0, 6.2, 1.6, 0.45, 0.5, 0xe2ddd2);
    k.block(s, 6.2, 1.6, 0.5);
  }
  farola(k, 19.2, 0.95, 6.5);
  farola(k, 44.5, 4.3, 6.5);
}

/** se monta con lo demás */
export function buildSalonAltavista(scene, colliders, map) {
  if (!map?.salonAltavista) return null;
  const k = new Kit();
  salon(k);
  casasOeste(k);
  paredEste(k);
  terraza(k);
  paseo(k);
  const group = enMarco(k, M, 'salonAltavista', colliders);
  scene.add(group);
  // el suelo de losetas claras de la acera ancha y el paseo, de la casa del garaje a León y Castillo
  const suelo = paveMesh(trocear(polyTris([M.W(13.8, 0.3), M.W(51.5, 0.3), M.W(51.5, 8.6), M.W(13.8, 8.6)]), 1.5), 0.18, lightSlabs(), 0xe6dccb);
  if (suelo) { suelo.name = 'salonAltavistaSuelo'; scene.add(suelo); }
  return { group, suelo };
}
