import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * La Ferretería N4, en la calle Coronel Bens junto a la esquina de Igualdad, con las fotos de Google Maps
 * (solo se miran, no van dentro del juego): el friso rojo de lado a lado con «FERRETERÍA» y el cuadro azul
 * y rojo del N4, la tira de carteles de pintura encima de la puerta, la puerta abierta de hojas de madera
 * marrón con sus carteles y la tienda dentro (las baldas llenas y las cajas fuertes), el cierre de reja
 * plegado, el escaparate oscuro con las herramientas y la franja roja de encima, y el zócalo de granito.
 * Las marcas de los carteles de la foto no se ponen: solo colores. El bloque se queda como está.
 */

// la cara este del bloque, a Coronel Bens (s desde la esquina del norte, hacia el sur)
const F = marco([-244.7, 362.1], [-251.3, 325.5]);
const Z = 0.15, ROJO = 0xd8202a, MADERA = 0x6a3e22, GRANITO = 0x8a8c8e;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneFerreteriaN4(map) {
  map.ferreteriaN4Sign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Ferreteria N4');
  if (i >= 0) map.ferreteriaN4Sign = map.signs.splice(i, 1)[0];
  map.ferreteriaN4 = true;
}

// ——— lo que se pinta en lienzo ———

/** el friso rojo: FERRETERÍA y, justo detrás, el cuadro del N4 */
function friso(g, w, h) {
  g.fillStyle = '#d8202a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f8f8f4';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(h * 0.56)}px "Arial Black", Arial, sans-serif`;
  const x0 = w * 0.03;
  g.fillText('FERRETERÍA', x0, h * 0.54);
  // el cuadro del N4: blanco con la N azul y el 4 rojo
  const x = x0 + g.measureText('FERRETERÍA').width + h * 0.25, y = h * 0.14, s = h * 0.72;
  g.fillStyle = '#f8f8f4';
  g.fillRect(x, y, s * 1.3, s);
  g.font = `900 ${Math.round(s * 0.9)}px "Arial Black", Arial, sans-serif`;
  g.fillStyle = '#1e4aa8';
  g.fillText('N', x + s * 0.08, y + s * 0.54);
  g.fillStyle = '#d8202a';
  g.fillText('4', x + s * 0.68, y + s * 0.5);
}

/** carteles de colores sin marcas, como los de pintura de la puerta */
function carteles(seed) {
  return (g, w, h) => {
    g.fillStyle = '#f2f2ee';
    g.fillRect(0, 0, w, h);
    let s = seed;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const c = ['#e8402a', '#2a5ab8', '#f0c030', '#3a9a4a', '#f2f2ee', '#e87a2a'];
    const n = Math.max(1, Math.round(w / h * 1.4));
    for (let i = 0; i < n; i++) {
      g.fillStyle = c[Math.floor(r() * c.length)];
      g.fillRect(w * i / n + 3, 3, w / n - 6, h - 6);
      g.fillStyle = '#f8f8f4';
      g.beginPath(); g.ellipse(w * (i + 0.5) / n, h * 0.55, w / n * 0.25, h * 0.22, 0, 0, Math.PI * 2); g.fill();
    }
  };
}

/** por la puerta: la tienda con las baldas llenas y las cajas fuertes */
function tienda(g, w, h) {
  g.fillStyle = '#d8d4cc';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#a89a88';
  g.fillRect(0, h * 0.82, w, h * 0.18);
  let s = 5;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let y = 0.15; y < 0.8; y += 0.12) for (let x = 0.02; x < 0.98; x += 0.04) { g.fillStyle = ['#c84a2a', '#2a5ab8', '#e8c040', '#5a5a5e', '#f2f2ee'][Math.floor(r() * 5)]; g.fillRect(w * x, h * y, w * 0.03, h * 0.08); }
  g.fillStyle = '#3a3a3e';
  for (const y of [0.5, 0.66]) g.fillRect(w * 0.2, h * y, w * 0.25, h * 0.14);
}

/** el escaparate oscuro con las herramientas */
function escaparate(g, w, h) {
  g.fillStyle = '#2a2c30';
  g.fillRect(0, 0, w, h);
  let s = 9;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 40; i++) { g.fillStyle = ['#e8a030', '#c8302a', '#3a7ac8', '#d8d8d4', '#4a9a4a'][Math.floor(r() * 5)]; g.fillRect(w * r(), h * (0.4 + r() * 0.55), w * 0.05, h * 0.08); }
  g.fillStyle = 'rgba(255,255,255,.12)';
  g.fillRect(0, 0, w * 0.35, h);
}

// ——— las piezas ———

/** la planta baja de la ferretería */
function fachada(k) {
  const s0 = 3.8, s1 = 11.2, sm = (s0 + s1) / 2;
  k.box(sm, 0, Z - 0.05, s1 - s0, 3.7, 0.1, 0xeeece6);
  // la puerta abierta: la tienda dentro, las dos hojas de madera con sus carteles y la tira de carteles de encima
  k.pic(5.55, 1.15, Z + 0.01, 2.0, 2.3, 0, 1, canvasTex(192, 220, tienda), { glow: 0.15 });
  for (const s of [4.3, 6.8]) {
    k.box(s, 0, Z + 0.06, 0.5, 2.3, 0.06, MADERA);
    k.pic(s, 1.35, Z + 0.095, 0.4, 1.3, 0, 1, canvasTex(64, 208, carteles(Math.round(s * 7))));
  }
  k.pic(5.55, 2.6, Z + 0.02, 3.1, 0.5, 0, 1, canvasTex(372, 60, carteles(29)));
  // el cierre de reja plegado
  k.box(7.25, 0, Z + 0.08, 0.3, 2.9, 0.12, 0x1e1e20);
  // el escaparate con su franja roja de encima y el zócalo de granito
  k.box(9.35, 0, Z + 0.03, 3.6, 0.6, 0.1, GRANITO);
  k.pic(9.35, 1.5, Z + 0.02, 3.3, 1.8, 0, 1, canvasTex(330, 180, escaparate), { glow: 0.06 });
  k.box(9.35, 2.4, Z + 0.04, 3.4, 0.45, 0.06, ROJO);
  for (const s of [7.6, 11.1]) k.box(s, 0.6, Z + 0.05, 0.1, 1.85, 0.08, 0x1e1e20);
  // el friso rojo de lado a lado
  k.box(sm, 2.95, Z + 0.08, s1 - s0, 0.72, 0.14, ROJO);
  k.pic(sm, 3.31, Z + 0.155, s1 - s0 - 0.1, 0.68, 0, 1, canvasTex(1024, 96, friso));
}

/** segunda fase, como los demás de este barrio */
export function buildFerreteriaN4(scene, colliders, map) {
  if (!map?.ferreteriaN4) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, F, 'ferreteriaN4', colliders);
  scene.add(group);
  return { group };
}
