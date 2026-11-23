import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * La Pescadería Municipal, en la esquina de su manzana junto al paseo de la avenida César Manrique, con la
 * foto de Google Maps de enero de 2025 (solo se mira, no va dentro del juego): la entrada blanca con sus
 * pilastras, las puertas y el montante de cristal de marco blanco, el arco moldurado de encima, el
 * rótulo dorado «PESCADERÍA MUNICIPAL», el medallón redondo y el pretil escalonado con sus cornisas, y a
 * la vuelta de la esquina las dos ventanas altas de marco blanco. Google Maps da la pescadería como
 * cerrada, pero el edificio y su rótulo siguen ahí. El resto de la manzana se queda como estaba.
 */

// la cara del sureste, a la avenida (s desde la esquina del norte), y la de la vuelta (s hasta la esquina)
const F = marco([341.6, 339.0], [351.2, 324.9]);
const V = marco([308.7, 303.3], [341.6, 339.0]);
const Z = 0.15, BLANCO = 0xf4f2ec, SOMBRA = 0xe2dfd6;

/** antes de levantar la ciudad: fuera el rótulo rojo genérico */
export function tunePescaderia(map) {
  map.pescaderiaSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Pescaderia Municipal');
  if (i >= 0) map.pescaderiaSign = map.signs.splice(i, 1)[0];
  map.pescaderia = true;
}

// ——— lo que se pinta en lienzo ———

/** el rótulo dorado sobre lo blanco: PESCADERÍA arriba, MUNICIPAL debajo */
function rotulo(g, w, h) {
  g.fillStyle = '#f4f2ec';
  g.fillRect(0, 0, w, h);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.34)}px Georgia, "Times New Roman", serif`;
  for (const [txt, y] of [['PESCADERÍA', 0.3], ['MUNICIPAL', 0.74]]) {
    g.fillStyle = '#6a5228';
    g.fillText(txt, w / 2 + 2, h * y + 2);
    g.fillStyle = '#c8a050';
    g.fillText(txt, w / 2, h * y);
  }
}

/** el medallón: el aro gris y el escudo azul y blanco */
function medallon(g, w, h) {
  g.fillStyle = '#f4f2ec';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#8a8c90';
  g.beginPath(); g.arc(w / 2, h / 2, w * 0.48, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#e8eef4';
  g.beginPath(); g.arc(w / 2, h / 2, w * 0.38, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3a6ab0';
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; g.beginPath(); g.arc(w / 2 + Math.cos(a) * w * 0.22, h / 2 + Math.sin(a) * w * 0.22, w * 0.06, 0, Math.PI * 2); g.fill(); }
  g.beginPath(); g.arc(w / 2, h / 2, w * 0.1, 0, Math.PI * 2); g.fill();
}

/** el cristal de las puertas y ventanas, con el interior vacío y claro */
function cristal(g, w, h) {
  g.fillStyle = '#9aa4aa';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c8ccc8';
  g.fillRect(0, h * 0.7, w, h * 0.3);
  g.fillStyle = 'rgba(255,255,255,.3)';
  g.fillRect(0, 0, w * 0.35, h);
}

// ——— las piezas ———

/** una pilastra blanca con su basa y su capitel */
function pilastra(k, s, alto) {
  k.box(s, 0, Z + 0.12, 0.42, alto, 0.24, BLANCO);
  k.box(s, 0, Z + 0.15, 0.52, 0.3, 0.3, SOMBRA);
  k.box(s, alto - 0.2, Z + 0.16, 0.56, 0.2, 0.32, BLANCO);
}

/** un hueco de cristal con marco blanco y sus montantes */
function vidriera(k, s0, s1, y0, y1, hojas) {
  const tex = canvasTex(96, 160, cristal);
  k.pic((s0 + s1) / 2, (y0 + y1) / 2, Z + 0.01, s1 - s0, y1 - y0, 0, 1, tex);
  for (let i = 0; i <= hojas; i++) k.box(s0 + (s1 - s0) * i / hojas, y0, Z + 0.04, 0.07, y1 - y0, 0.06, BLANCO);
  for (const y of [y0, y1 - 0.06]) k.box((s0 + s1) / 2, y, Z + 0.04, s1 - s0, 0.07, 0.06, BLANCO);
}

/** la entrada de la esquina: pilastras, cristaleras, arco, rótulo, medallón y pretil escalonado */
function entrada(k) {
  const s0 = 0.12, s1 = 4.92, sm = (s0 + s1) / 2;
  k.box(sm, 0, Z - 0.05, s1 - s0, 5.9, 0.1, BLANCO);
  vidriera(k, s0 + 0.55, s1 - 0.55, 0.12, 2.95, 3);
  vidriera(k, s0 + 0.55, s1 - 0.55, 3.05, 3.65, 3);
  for (const s of [s0 + 0.25, s1 - 0.25]) pilastra(k, s, 4.6);
  // el arco moldurado de encima del montante
  const arco = new THREE.RingGeometry(1.75, 1.88, 32, 1, 0, Math.PI);
  arco.translate(sm, 3.75, Z + 0.06);
  k.add(arco, SOMBRA);
  // el rótulo dorado y el medallón
  k.pic(sm, 4.35, Z + 0.01, 3.4, 0.9, 0, 1, canvasTex(480, 128, rotulo));
  k.pic(sm, 5.35, Z + 0.01, 0.6, 0.6, 0, 1, canvasTex(96, 96, medallon));
  // las cornisas y el pretil escalonado
  k.box(sm, 4.6, Z + 0.15, s1 - s0 + 0.2, 0.14, 0.32, SOMBRA);
  k.box(sm, 5.9, Z + 0.1, s1 - s0 + 0.2, 0.16, 0.3, SOMBRA);
  k.box(sm, 6.06, Z, s1 - s0 - 1.2, 0.5, 0.2, BLANCO);
  k.box(sm, 6.56, Z + 0.05, s1 - s0 - 1.0, 0.12, 0.28, SOMBRA);
}

/** a la vuelta de la esquina: la pared blanca con las dos ventanas altas y sus pilastras */
function vuelta(k) {
  const e = V.len;
  k.box(e - 2.9, 0, Z - 0.05, 5.6, 5.9, 0.1, BLANCO);
  for (const [a, b] of [[0.8, 2.3], [3.1, 4.6]]) vidriera(k, e - b, e - a, 0.5, 3.0, 2);
  for (const s of [0.35, 2.7, 5.0]) pilastra(k, e - s, 4.6);
  k.box(e - 2.9, 4.6, Z + 0.15, 5.8, 0.14, 0.32, SOMBRA);
  k.box(e - 2.9, 5.9, Z + 0.1, 5.8, 0.16, 0.3, SOMBRA);
}

/** segunda fase, como los demás de este barrio */
export function buildPescaderia(scene, colliders, map) {
  if (!map?.pescaderia) return null;
  const group = new THREE.Group();
  group.name = 'pescaderia';
  const kF = new Kit();
  entrada(kF);
  const kV = new Kit();
  vuelta(kV);
  group.add(enMarco(kF, F, 'pescaderiaEntrada', colliders), enMarco(kV, V, 'pescaderiaVuelta', colliders));
  scene.add(group);
  return { group };
}
