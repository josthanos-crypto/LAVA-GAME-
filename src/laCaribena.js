import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, barDentro } from './restaurantesCharco.js';

/**
 * La Caribeña, el bar de la calle Doctor Juan Negrín, con la foto de Google Maps de agosto de 2025 (solo
 * se mira, no va dentro del juego): la casa terrera blanca con el pretil azul cobalto y su frontón
 * redondo en medio, la cornisa azul, los dos cierres blancos de la izquierda, las ventanas y la puerta de
 * marco azul con los carteles pegados, el hueco de la puerta con el bar dentro y los apliques blancos de
 * debajo del pretil. La terraza de la foto (con su barandilla negra y las sombrillas blancas) está en la
 * calzada; en el juego la calle es de coches hasta la pared y no se pone. El bloque se queda.
 */

// la cara de la calle Doctor Juan Negrín (s desde el extremo del este)
const C = marco([-277.7, -14.8], [-285.6, -21.4]);
const Z = 0.12, AZUL = 0x1e4ab8, BLANCO = 0xf4f2ec;

/** antes de levantar la ciudad: fuera el rótulo rojo genérico */
export function tuneLaCaribena(map) {
  map.laCaribenaSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'La Caribeña');
  if (i >= 0) map.laCaribenaSign = map.signs.splice(i, 1)[0];
  map.laCaribena = true;
}

// ——— lo que se pinta en lienzo ———

/** un cierre blanco de lamas */
function cierre(g, w, h) {
  g.fillStyle = '#eceae4';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(0,0,0,.1)';
  for (let y = 0; y < h; y += 7) g.fillRect(0, y, w, 2);
}

/** una ventana con los carteles de colores pegados por dentro */
function ventana(seed) {
  return (g, w, h) => {
    g.fillStyle = '#3a3c40';
    g.fillRect(0, 0, w, h);
    let s = seed;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const c = ['#f2e030', '#e83a3a', '#3aa8e0', '#f2f2ee', '#7ac040', '#f08a30'];
    for (let i = 0; i < 6; i++) { g.fillStyle = c[Math.floor(r() * c.length)]; g.fillRect(w * (0.08 + r() * 0.5), h * (0.1 + r() * 0.55), w * 0.35, h * 0.2); }
    g.fillStyle = 'rgba(255,255,255,.12)';
    g.fillRect(0, 0, w * 0.4, h);
  };
}

/** la placa de encima de la puerta: La Caribeña con su palmera */
function placa(g, w, h) {
  g.fillStyle = '#f8f4e8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#1e4ab8';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 700 ${Math.round(h * 0.5)}px Georgia, serif`;
  g.fillText('La Caribeña', w * 0.56, h * 0.55);
  g.fillStyle = '#3a8a3a';
  for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(w * 0.1, h * 0.3, w * 0.06, h * 0.08, i * 0.6, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#8a5a3a';
  g.fillRect(w * 0.095, h * 0.3, w * 0.012, h * 0.55);
}

// ——— las piezas ———

/** un hueco con marco azul: lo de dentro y el marco */
function hueco(k, s, w, y0, h, tex) {
  k.box(s, y0 - 0.06, Z + 0.02, w + 0.24, h + 0.18, 0.04, AZUL);
  k.pic(s, y0 + h / 2, Z + 0.045, w, h, 0, 1, tex);
}

/** la fachada de la casa terrera */
function fachada(k) {
  const L = C.len, ALTO = 3.3;
  // la pared blanca, el zócalo gris y las pilastras azules de los extremos
  k.box(L / 2, 0, Z - 0.05, L - 0.1, ALTO, 0.1, BLANCO);
  k.box(L / 2, 0, Z + 0.01, L - 0.1, 0.25, 0.04, 0x6a6c70);
  for (const s of [0.2, L - 0.2]) k.box(s, 0, Z + 0.02, 0.3, ALTO, 0.06, AZUL);
  // los dos cierres blancos de la izquierda
  for (const s of [1.2, 2.6]) hueco(k, s, 1.2, 0.3, 2.3, canvasTex(96, 180, cierre));
  // las ventanas con carteles y la puerta abierta, con su placa encima
  hueco(k, 4.1, 1.0, 0.9, 1.7, canvasTex(96, 160, ventana(7)));
  hueco(k, 5.6, 1.2, 0.3, 2.3, canvasTex(160, 256, barDentro));
  k.box(5.6, 2.82, Z + 0.05, 1.5, 0.36, 0.04, 0x2a2a2a);
  k.pic(5.6, 3.0, Z + 0.075, 1.44, 0.32, 0, 1, canvasTex(288, 64, placa));
  hueco(k, 7.1, 1.0, 0.9, 1.7, canvasTex(96, 160, ventana(23)));
  hueco(k, 8.7, 1.2, 0.3, 2.3, canvasTex(96, 180, cierre));
  // la cornisa azul y el pretil azul con su frontón redondo en medio
  k.box(L / 2, ALTO, Z + 0.05, L - 0.1, 0.12, 0.2, AZUL);
  k.box(L / 2, ALTO + 0.12, Z - 0.02, L - 0.1, 0.9, 0.14, AZUL);
  const fronton = new THREE.CylinderGeometry(1.0, 1.0, 0.12, 24, 1, false, -Math.PI / 2, Math.PI);
  fronton.rotateX(-Math.PI / 2);
  fronton.translate(5.6, ALTO + 0.72, Z - 0.03);
  k.add(fronton, AZUL);
  // los apliques blancos de debajo del pretil
  for (const s of [1.9, 5.6, 8.0]) k.box(s, ALTO - 0.35, Z + 0.08, 0.22, 0.14, 0.16, 0xf8f8f4, { list: k.glow });
}

/** segunda fase, como los demás de este barrio */
export function buildLaCaribena(scene, colliders, map) {
  if (!map?.laCaribena) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, C, 'laCaribena', colliders);
  scene.add(group);
  return { group };
}
