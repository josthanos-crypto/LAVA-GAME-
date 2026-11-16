import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * La Clínica Dental Plata & Reguera, en la avenida Coll, con la foto de Google Maps de mayo de 2025 (solo
 * se mira, no va dentro del juego): el edificio blanco de tres plantas entero, con sus tres ventanas de
 * madera por planta (cada una con su montante y los cristales azulados), el logo dorado de la concha con
 * «Plata & Reguera» e «IMPLANTOLOGÍA & ESTÉTICA DENTAL» encima de la planta baja, las cristaleras de
 * madera de abajo con la sala dentro y la placa pequeña de la puerta. El bloque del mapa tiene la misma
 * altura que el de la foto: la fachada se viste de arriba abajo.
 */

// la cara de la avenida Coll (s de oeste a este)
const P = marco([241.3, 414.3], [249.9, 409.8]);
const Z = 0.12, BLANCO = 0xf4f4f0, MADERA = 0x8a4a28, ALTO = 9.3;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tunePlataReguera(map) {
  map.plataRegueraSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Plata & Reguera');
  if (i >= 0) map.plataRegueraSign = map.signs.splice(i, 1)[0];
  map.plataReguera = true;
}

// ——— lo que se pinta en lienzo ———

/** una ventana de madera: el marco, el montante de arriba y los cristales con el cielo */
function ventana(g, w, h) {
  g.fillStyle = '#8a4a28';
  g.fillRect(0, 0, w, h);
  const cielo = g.createLinearGradient(0, 0, w, h);
  cielo.addColorStop(0, '#5a7ab0');
  cielo.addColorStop(1, '#2a3a5a');
  g.fillStyle = cielo;
  const b = w * 0.07;
  g.fillRect(b, b, w - 2 * b, h * 0.25 - b);
  for (const [x0, x1] of [[b, w * 0.33], [w * 0.37, w * 0.63], [w * 0.67, w - b]]) g.fillRect(x0, h * 0.25 + b * 0.5, x1 - x0, h * 0.75 - b * 1.5);
  g.fillStyle = 'rgba(255,255,255,.18)';
  g.fillRect(b, h * 0.25, w * 0.2, h * 0.7);
}

/** la cristalera de abajo: la madera, la sala clara y el reflejo de la calle */
function cristalera(g, w, h) {
  g.fillStyle = '#8a4a28';
  g.fillRect(0, 0, w, h);
  const b = w * 0.06;
  g.fillStyle = '#4a5058';
  g.fillRect(b, b, w - 2 * b, h - 2 * b);
  g.fillStyle = '#d8d4cc';
  g.fillRect(b, h * 0.55, w - 2 * b, h * 0.4);
  g.fillStyle = '#e8e4dc';
  g.fillRect(w * 0.3, h * 0.6, w * 0.4, h * 0.18);
  g.fillStyle = 'rgba(160,190,220,.35)';
  g.fillRect(b, b, w - 2 * b, h * 0.45);
  g.fillStyle = '#8a4a28';
  g.fillRect(w * 0.48, b, w * 0.04, h - 2 * b);
}

/** el rótulo: la concha dorada y el nombre con lo que hacen */
function rotulo(g, w, h) {
  g.fillStyle = '#f4f4f0';
  g.fillRect(0, 0, w, h);
  const x = h * 0.55, y = h * 0.52, r = h * 0.42;
  g.fillStyle = '#c89a4a';
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#f4f4f0';
  g.lineWidth = r * 0.08;
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * (1.1 + i * 0.1);
    g.beginPath(); g.moveTo(x, y + r * 0.7); g.lineTo(x + Math.cos(a) * r * 0.95, y + Math.sin(a) * r * 0.95 + r * 0.35); g.stroke();
  }
  g.fillStyle = '#2a3a5a';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.font = `600 ${Math.round(h * 0.42)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('Plata & Reguera', h * 1.15, h * 0.36);
  g.font = `700 ${Math.round(h * 0.2)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('IMPLANTOLOGÍA & ESTÉTICA DENTAL', h * 1.15, h * 0.78);
}

/** la placa pequeña de la puerta */
function placa(g, w, h) {
  g.fillStyle = '#e8e8e4';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c89a4a';
  g.beginPath(); g.arc(w / 2, h * 0.3, w * 0.18, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#5a5a5a';
  for (let y = 0.55; y < 0.9; y += 0.1) g.fillRect(w * 0.15, h * y, w * 0.7, h * 0.03);
}

// ——— las piezas ———

/** la fachada entera de la clínica */
function fachada(k) {
  const L = P.len, sm = L / 2;
  k.box(sm, 0, Z - 0.05, L - 0.1, ALTO, 0.1, BLANCO);
  const cols = [L * 0.2, L * 0.5, L * 0.8], tv = canvasTex(96, 128, ventana);
  // las dos plantas de arriba, con tres ventanas de madera cada una
  for (const y0 of [3.7, 6.6]) for (const s of cols) {
    k.pic(s, y0 + 1.05, Z + 0.01, 1.85, 2.1, 0, 1, tv);
    k.box(s, y0 - 0.06, Z + 0.06, 1.95, 0.06, 0.12, 0xe8e6e0);
  }
  // la planta baja: las tres cristaleras de madera
  for (const s of cols) k.pic(s, 1.25, Z + 0.01, 2.2, 2.5, 0, 1, canvasTex(128, 144, cristalera), { glow: 0.08 });
  // el rótulo de encima de la planta baja, sobre las dos primeras cristaleras
  k.pic(L * 0.45, 2.95, Z + 0.01, 5.2, 0.62, 0, 1, canvasTex(640, 76, rotulo));
  // la placa de la puerta, entre la segunda y la tercera cristalera
  k.pic(L * 0.66, 1.6, Z + 0.02, 0.32, 0.42, 0, 1, canvasTex(64, 84, placa));
  // el remate de arriba
  k.box(sm, ALTO - 0.2, Z + 0.05, L - 0.05, 0.2, 0.2, 0xe8e6e0);
}

/** segunda fase, como los demás de este barrio */
export function buildPlataReguera(scene, colliders, map) {
  if (!map?.plataReguera) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, P, 'plataReguera', colliders);
  scene.add(group);
  return { group };
}
