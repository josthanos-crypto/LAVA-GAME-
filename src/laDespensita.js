import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * La Despensita (café y migas), en la esquina de la calle Emilio Ley con García de Hita, con la foto de
 * Google Maps (solo se mira, no va dentro del juego): la casa blanca de molduras color mostaza, la puerta
 * de la esquina abierta con el café encendido dentro (las guirnaldas, las baldas y la barra), el letrero
 * blanco «LA DESPENSITA · Café y Migas» encima, el zócalo mostaza, la puerta verde de la calle Emilio Ley
 * y, a la vuelta, en García de Hita, las dos ventanas cerradas con su marco mostaza y la farola de brazo
 * negra de la esquina. En el mapa la esquina no tiene chaflán: la puerta va en la punta de la cara de
 * Emilio Ley. Las calles llegan hasta la pared: sin el barril con taburetes de la acera. El bloque se queda.
 */

// la cara de Emilio Ley (s desde la esquina, hacia el oeste) y la de García de Hita (s hasta la esquina)
const E = marco([110.0, 198.2], [89.4, 205.6]);
const G = marco([139.0, 269.1], [110.0, 198.2]);
const Z = 0.12, ALTO = 3.5, MOSTAZA = 0xd8a850, BLANCO = 0xf2f0ea;

/** antes de levantar la ciudad: fuera el rótulo rojo genérico */
export function tuneLaDespensita(map) {
  map.laDespensitaSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'La Despensita');
  if (i >= 0) map.laDespensitaSign = map.signs.splice(i, 1)[0];
  map.laDespensita = true;
}

// ——— lo que se pinta en lienzo ———

/** por la puerta: el café encendido, con las guirnaldas, las baldas y la barra de madera */
function dentro(g, w, h) {
  g.fillStyle = '#3a2a20';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#6a4a32';
  g.fillRect(0, h * 0.4, w, h * 0.35);
  g.fillStyle = '#a88a6a';
  g.fillRect(0, h * 0.78, w, h * 0.22);
  // las baldas con los tarros
  for (const y of [0.3, 0.42]) {
    g.fillStyle = '#8a6a4a';
    g.fillRect(w * 0.1, h * y, w * 0.8, h * 0.012);
    for (let x = 0.12; x < 0.88; x += 0.08) { g.fillStyle = ['#d8b070', '#a8c070', '#e8e0d0', '#c86a3a'][Math.floor(x * 31) % 4]; g.fillRect(w * x, h * y - h * 0.05, w * 0.05, h * 0.05); }
  }
  // la barra
  g.fillStyle = '#7a5434';
  g.fillRect(w * 0.15, h * 0.6, w * 0.7, h * 0.18);
  // las guirnaldas de bombillas
  g.fillStyle = '#ffe8a8';
  for (let t = 0; t < 1; t += 0.06) { g.beginPath(); g.arc(w * t, h * (0.08 + 0.04 * Math.sin(t * 9)), 3, 0, Math.PI * 2); g.fill(); }
  const luz = g.createRadialGradient(w / 2, h * 0.3, 4, w / 2, h * 0.3, w);
  luz.addColorStop(0, 'rgba(255,210,140,.35)');
  luz.addColorStop(1, 'rgba(255,210,140,0)');
  g.fillStyle = luz;
  g.fillRect(0, 0, w, h);
}

/** el letrero blanco: LA DESPENSITA y Café y Migas, a mano, con su recuadro */
function letrero(g, w, h) {
  g.fillStyle = '#f6f4ee';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#2a2a2a';
  g.lineWidth = 3;
  g.strokeRect(6, 6, w - 12, h - 12);
  g.fillStyle = '#1e1e1e';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.4)}px "Segoe Print", "Comic Sans MS", cursive`;
  g.fillText('LA DESPENSITA', w / 2, h * 0.4);
  g.font = `400 ${Math.round(h * 0.24)}px "Segoe Script", "Segoe Print", cursive`;
  g.fillText('Café y Migas', w / 2, h * 0.76);
}

/** una ventana cerrada: el panel blanco de dentro, con sus junquillos */
function cerrada(g, w, h) {
  g.fillStyle = '#eceae2';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c8c4b8';
  g.lineWidth = 3;
  g.strokeRect(w * 0.08, h * 0.05, w * 0.84, h * 0.9);
}

/** la puerta verde, de cuarterones */
function verde(g, w, h) {
  g.fillStyle = '#2a7a4a';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#1e5a36';
  g.lineWidth = 5;
  for (const [y, b] of [[0.05, 0.4], [0.5, 0.45]]) g.strokeRect(w * 0.12, h * y, w * 0.76, h * b);
}

// ——— las piezas ———

/** la pared blanca de la planta baja con su zócalo mostaza, de s0 a s1 */
function pared(k, s0, s1) {
  k.box((s0 + s1) / 2, 0, Z - 0.05, s1 - s0, ALTO, 0.1, BLANCO);
  k.box((s0 + s1) / 2, 0, Z + 0.01, s1 - s0, 0.45, 0.04, MOSTAZA);
}

/** la cara de Emilio Ley: la puerta de la esquina con el letrero, el zócalo y la puerta verde */
function caraEmilioLey(k) {
  pared(k, 0.12, 6.5);
  // la puerta de la esquina, con su marco mostaza, abierta
  k.box(0.95, 0, Z + 0.02, 1.5, 2.65, 0.04, MOSTAZA);
  k.pic(0.95, 1.2, Z + 0.045, 1.2, 2.4, 0, 1, canvasTex(128, 256, dentro), { glow: 0.3 });
  // el letrero de encima
  k.box(1.05, 2.78, Z + 0.02, 1.9, 0.62, 0.04, 0x2a2a2a);
  k.pic(1.05, 3.09, Z + 0.045, 1.84, 0.56, 0, 1, canvasTex(330, 100, letrero));
  // la puerta verde, con su marco mostaza
  k.box(5.1, 0, Z + 0.02, 1.3, 2.45, 0.04, MOSTAZA);
  k.pic(5.1, 1.1, Z + 0.045, 1.0, 2.2, 0, 1, canvasTex(100, 220, verde));
}

/** la cara de García de Hita junto a la esquina: las dos ventanas cerradas y la farola de brazo */
function caraGarciaDeHita(k) {
  const L = G.len;
  pared(k, L - 6.2, L - 0.12);
  for (const s of [L - 1.9, L - 4.3]) {
    k.box(s, 0.85, Z + 0.02, 1.25, 1.85, 0.04, MOSTAZA);
    k.pic(s, 1.775, Z + 0.045, 0.95, 1.55, 0, 1, canvasTex(96, 156, cerrada));
    k.box(s, 0.8, Z + 0.06, 1.35, 0.06, 0.14, MOSTAZA);
  }
  // la farola negra de brazo, junto a la esquina
  const s = L - 0.7;
  k.box(s, 3.3, Z + 0.35, 0.05, 0.05, 0.7, 0x1a1a1a);
  k.box(s, 3.15, Z + 0.68, 0.36, 0.1, 0.24, 0x1a1a1a);
  k.box(s, 3.08, Z + 0.68, 0.28, 0.04, 0.18, 0xfff0c8, { list: k.glow });
}

/** segunda fase, como los demás de este barrio */
export function buildLaDespensita(scene, colliders, map) {
  if (!map?.laDespensita) return null;
  const group = new THREE.Group();
  group.name = 'laDespensita';
  const kE = new Kit();
  caraEmilioLey(kE);
  const kG = new Kit();
  caraGarciaDeHita(kG);
  group.add(enMarco(kE, E, 'despensitaEmilioLey', colliders), enMarco(kG, G, 'despensitaGarciaDeHita', colliders));
  scene.add(group);
  return { group };
}
