import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * Mini & Gastón (comidas y postres para llevar), en la calle Manolo Millares, con la foto de Google Maps
 * (solo se mira, no va dentro del juego): el cajón gris oscuro de la planta baja con sus dos ventanas
 * estrechas, el escaparate grande con las mesitas dentro y las jardineras de flores rojas en el alféizar,
 * la puerta de cristal con su montante y el número, el rótulo de letras verde lima «MINI & GASTÓN» con
 * «COMIDAS Y POSTRES PARA LLEVAR» en blanco debajo, y el farol de la pared blanca de al lado. En el juego
 * la calle llega hasta la pared: sin la pizarra de pie ni la maceta de la acera. El bloque se queda.
 */

// la cara sur del bloque, a la calle Manolo Millares (s desde la esquina oeste)
const G = marco([-419.2, 332.5], [-354.5, 327.5]);
const Z = 0.12, S0 = 4.3, S1 = 12.9, ALTO = 3.3, GRIS = 0x2c2d30;

/** antes de levantar la ciudad: fuera el rótulo rojo genérico */
export function tuneMiniGaston(map) {
  map.miniGastonSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Mini y Gastón');
  if (i >= 0) map.miniGastonSign = map.signs.splice(i, 1)[0];
  map.miniGaston = true;
}

// ——— lo que se pinta en lienzo ———

/** el rótulo: MINI & GASTÓN en verde lima y debajo, en blanco, lo que venden */
function rotulo(g, w, h) {
  g.fillStyle = '#2c2d30';
  g.fillRect(0, 0, w, h);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#c4dc3a';
  g.font = `600 ${Math.round(h * 0.42)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('MINI & GASTÓN', w / 2, h * 0.36);
  g.fillStyle = '#f2f2ee';
  g.font = `500 ${Math.round(h * 0.2)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('COMIDAS Y POSTRES PARA LLEVAR', w / 2, h * 0.76);
}

/** por el escaparate: la pared clara, el mostrador, las mesitas con sus sillas y el reflejo */
function dentro(g, w, h) {
  g.fillStyle = '#d8d0c0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#efe6c8';
  g.fillRect(w * 0.05, h * 0.12, w * 0.5, h * 0.5);
  g.fillStyle = '#b8a888';
  g.fillRect(0, h * 0.78, w, h * 0.22);
  // el mostrador y la vitrina del fondo
  g.fillStyle = '#5a4a3a';
  g.fillRect(w * 0.6, h * 0.48, w * 0.36, h * 0.3);
  g.fillStyle = 'rgba(210,225,232,.6)';
  g.fillRect(w * 0.6, h * 0.38, w * 0.36, h * 0.1);
  // las mesitas blancas con las sillas oscuras
  for (const x of [0.12, 0.34]) {
    g.fillStyle = '#f2f2ee';
    g.fillRect(w * x, h * 0.6, w * 0.12, h * 0.025);
    g.fillRect(w * (x + 0.055), h * 0.62, w * 0.01, h * 0.16);
    g.fillStyle = '#2a2a2c';
    for (const dx of [-0.04, 0.13]) { g.fillRect(w * (x + dx), h * 0.5, w * 0.01, h * 0.28); g.fillRect(w * (x + dx), h * 0.64, w * 0.05, h * 0.015); }
  }
  // el reflejo de la calle en el cristal
  const gr = g.createLinearGradient(0, 0, w, h);
  gr.addColorStop(0, 'rgba(255,255,255,.22)');
  gr.addColorStop(0.5, 'rgba(255,255,255,0)');
  gr.addColorStop(1, 'rgba(255,255,255,.15)');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
}

/** una ventana estrecha: el cristal con la persiana blanca de dentro */
function estrecha(g, w, h) {
  g.fillStyle = '#c8ccce';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#eceae4';
  for (let y = h * 0.1; y < h * 0.6; y += h * 0.05) g.fillRect(w * 0.1, y, w * 0.8, h * 0.03);
  g.fillStyle = 'rgba(255,255,255,.2)';
  g.fillRect(0, 0, w * 0.4, h);
}

/** la puerta de cristal: el pasillo del fondo */
function puerta(g, w, h) {
  g.fillStyle = '#4a4c50';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#9a9c9e';
  g.fillRect(w * 0.15, h * 0.1, w * 0.7, h * 0.65);
  g.fillStyle = 'rgba(255,255,255,.18)';
  g.fillRect(0, 0, w * 0.45, h);
}

// ——— las piezas ———

/** una jardinera estrecha de alféizar con flores rojas */
function jardinera(k, s, y, w) {
  k.box(s, y, Z + 0.16, w, 0.16, 0.18, 0x5a3a2a);
  let sd = Math.round(s * 31);
  const r = () => (sd = (sd * 16807 + 3) % 2147483647) / 2147483647;
  for (let i = 0; i < Math.round(w * 8); i++) k.ball(s - w / 2 + 0.06 + r() * (w - 0.12), y + 0.2 + r() * 0.08, Z + 0.16, 0.06, i % 3 ? 0x4a7a32 : 0xd8303a, { seg: 5 });
}

/** el cajón gris oscuro de Mini & Gastón */
function fachada(k) {
  const sm = (S0 + S1) / 2;
  k.box(sm, 0, Z - 0.05, S1 - S0, ALTO, 0.1, GRIS);
  // las dos ventanas estrechas
  for (const s of [5.0, 6.1]) {
    k.box(s, 0.8, Z + 0.01, 0.72, 1.85, 0.04, 0x1e1f22);
    k.pic(s, 1.72, Z + 0.035, 0.62, 1.75, 0, 1, canvasTex(48, 136, estrecha));
  }
  // el escaparate grande, su marco y las jardineras del alféizar
  k.box(9.3, 0.5, Z + 0.01, 4.3, 2.3, 0.04, 0x1e1f22);
  k.pic(9.3, 1.65, Z + 0.035, 4.1, 2.1, 0, 1, canvasTex(512, 262, dentro), { glow: 0.1 });
  k.box(9.3, 0.5, Z + 0.06, 4.3, 0.06, 0.16, 0x1e1f22);
  for (const s of [8.0, 10.6]) jardinera(k, s, 0.56, 1.0);
  // la puerta de cristal con su montante y el número de encima
  k.box(12.1, 0, Z + 0.01, 1.1, 2.75, 0.04, 0x1e1f22);
  k.pic(12.1, 1.15, Z + 0.035, 0.94, 2.2, 0, 1, canvasTex(64, 150, puerta));
  k.pic(12.1, 2.48, Z + 0.035, 0.94, 0.4, 0, 1, canvasTex(64, 28, estrecha));
  k.box(12.1, 2.82, Z + 0.02, 0.36, 0.14, 0.03, 0xe8e8e4);
  // el rótulo encima del escaparate
  k.pic(9.3, 2.98, Z + 0.006, 4.6, 0.56, 0, 1, canvasTex(640, 78, rotulo));
  // el farol de la pared blanca de al lado
  k.box(3.4, 2.75, Z + 0.06, 0.04, 0.04, 0.2, 0x1a1a1a);
  k.box(3.4, 2.38, Z + 0.2, 0.18, 0.3, 0.18, 0xfff0c8, { list: k.glow });
  k.box(3.4, 2.68, Z + 0.2, 0.24, 0.05, 0.24, 0x1a1a1a);
  k.box(3.4, 2.34, Z + 0.2, 0.2, 0.04, 0.2, 0x1a1a1a);
}

/** segunda fase, como los demás de este barrio */
export function buildMiniGaston(scene, colliders, map) {
  if (!map?.miniGaston) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, G, 'miniGaston', colliders);
  scene.add(group);
  return { group };
}
