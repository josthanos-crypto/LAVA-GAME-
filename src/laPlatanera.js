import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * La Platanera, el supermercado bio de la calle Nicolás Martín Cabrera, junto a la esquina, con las fotos
 * de Google Maps de 2025 (solo se miran, no van dentro del juego): el letrero verde con la palmera
 * amarilla y «La Platanera» en letras blancas, la tienda abierta de lado a lado con las baldas de madera
 * llenas, las plantas de arriba y los cestos, el marco negro de la persiana, los pilares de granito gris,
 * los dos focos negros de encima, el cartel de bandera verde «SUPERMERCADO BIO» y la puerta de cristal de
 * la derecha. El bloque se queda como está.
 */

// la cara sur del bloque, a la calle (s desde la esquina del oeste)
const P = marco([84.1, 289.7], [104.7, 282.4]);
const Z = 0.15, VERDE = 0x1e7a4a, GRANITO = 0x8a8c8e, NEGRO = 0x1c1c1e;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneLaPlatanera(map) {
  map.laPlataneraSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'La Platanera (bio)');
  if (i >= 0) map.laPlataneraSign = map.signs.splice(i, 1)[0];
  map.laPlatanera = true;
}

// ——— lo que se pinta en lienzo ———

/** la palmera amarilla del letrero */
function palmera(g, x, y, r) {
  g.fillStyle = '#e8c040';
  g.fillRect(x - r * 0.07, y - r * 0.1, r * 0.14, r * 1.0);
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * (0.1 + i * 0.13);
    g.beginPath(); g.ellipse(x + Math.cos(a) * r * 0.45, y + Math.sin(a) * r * 0.35, r * 0.45, r * 0.12, a, 0, Math.PI * 2); g.fill();
  }
}

/** el letrero verde: la palmera y La Platanera */
function letrero(g, w, h) {
  g.fillStyle = '#1e7a4a';
  g.fillRect(0, 0, w, h);
  palmera(g, h * 0.75, h * 0.48, h * 0.6);
  g.fillStyle = '#f4f4ee';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.font = `500 ${Math.round(h * 0.56)}px Georgia, "Times New Roman", serif`;
  g.fillText('La Platanera', h * 1.5, h * 0.56);
}

/** el cartel de bandera: SUPERMERCADO en blanco y BIO grande en amarillo */
function bandera(g, w, h) {
  g.fillStyle = '#1e7a4a';
  g.fillRect(0, 0, w, h);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#f4f4ee';
  g.font = `700 ${Math.round(h * 0.17)}px Arial, sans-serif`;
  g.fillText('SUPERMERCADO', w / 2, h * 0.3);
  g.fillStyle = '#f0c030';
  g.font = `800 ${Math.round(h * 0.44)}px Arial, sans-serif`;
  g.fillText('BIO', w / 2, h * 0.66);
}

/** por la tienda abierta: el suelo de madera clara, las baldas llenas, las plantas y los cestos */
function tienda(g, w, h) {
  g.fillStyle = '#efe8dc';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8c09a';
  g.fillRect(0, h * 0.78, w, h * 0.22);
  let s = 17;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const c = ['#c84a2a', '#e8c040', '#3a8a4a', '#f2f2ee', '#8a5a3a', '#e8823a', '#5a7ac8'];
  for (const [x0, x1] of [[0.02, 0.4], [0.58, 0.98]]) {
    for (let y = 0.22; y < 0.78; y += 0.11) {
      g.fillStyle = '#b08a5a';
      g.fillRect(w * x0, h * y, w * (x1 - x0), h * 0.012);
      for (let x = x0; x < x1 - 0.02; x += 0.025) { g.fillStyle = c[Math.floor(r() * c.length)]; g.fillRect(w * x, h * y - h * 0.07, w * 0.02, h * 0.07); }
    }
  }
  // el pasillo del medio, las plantas de arriba y los cestos del suelo
  g.fillStyle = '#cdbb9a';
  g.fillRect(w * 0.4, h * 0.3, w * 0.18, h * 0.48);
  g.fillStyle = '#4a8a3a';
  for (let x = 0.05; x < 1; x += 0.12) { g.beginPath(); g.arc(w * x, h * 0.13, w * 0.03, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#c8a46a';
  for (const x of [0.62, 0.7]) { g.beginPath(); g.ellipse(w * x, h * 0.86, w * 0.035, h * 0.06, 0, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#fff8e8';
  for (let x = 0.15; x < 0.9; x += 0.18) { g.beginPath(); g.arc(w * x, h * 0.04, w * 0.008, 0, Math.PI * 2); g.fill(); }
}

/** la puerta de cristal de la derecha */
function cristal(g, w, h) {
  g.fillStyle = '#6a7074';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.25)';
  g.fillRect(0, 0, w * 0.4, h);
}

// ——— las piezas ———

/** la planta baja de La Platanera */
function fachada(k) {
  const a0 = 0.8, a1 = 5.0, H = 2.7;
  // la tienda abierta, con el marco negro de la persiana recogida
  k.pic((a0 + a1) / 2, H / 2, Z, a1 - a0, H, 0, 1, canvasTex(512, 330, tienda), { glow: 0.2 });
  for (const s of [a0, a1]) k.box(s, 0, Z + 0.03, 0.1, H, 0.08, NEGRO);
  k.box((a0 + a1) / 2, 0, Z + 0.1, a1 - a0, 0.06, 0.2, 0x9a9c9e);
  // los pilares de granito gris
  for (const [s, w] of [[0.4, 0.6], [5.3, 0.55]]) k.box(s, 0, Z + 0.06, w, 3.6, 0.16, GRANITO);
  // la puerta de cristal de la derecha
  k.box(6.3, 0, Z + 0.02, 1.4, 2.6, 0.04, 0x8a8e92);
  k.pic(6.3, 1.25, Z + 0.045, 1.2, 2.4, 0, 1, canvasTex(96, 192, cristal));
  // el letrero verde, la cornisa de piedra y los dos focos negros
  k.box((a0 + a1) / 2, 2.72, Z + 0.08, a1 - a0 + 0.2, 0.66, 0.12, VERDE);
  k.pic((a0 + a1) / 2, 3.05, Z + 0.145, a1 - a0, 0.6, 0, 1, canvasTex(560, 80, letrero));
  k.box(3.6, 3.6, Z + 0.12, 7.4, 0.2, 0.3, 0xb8b4ac);
  for (const s of [1.6, 4.2]) {
    k.box(s, 3.5, Z + 0.25, 0.04, 0.04, 0.5, NEGRO);
    k.box(s, 3.42, Z + 0.5, 0.18, 0.1, 0.14, NEGRO);
  }
  // el cartel de bandera SUPERMERCADO BIO, de canto a la fachada
  k.box(5.3, 2.62, Z + 0.55, 0.12, 0.72, 0.8, VERDE);
  for (const nx of [1, -1]) k.pic(5.3 + nx * 0.065, 2.98, Z + 0.55, 0.78, 0.7, nx, 0, canvasTex(160, 144, bandera));
}

/** segunda fase, como los demás de este barrio */
export function buildLaPlatanera(scene, colliders, map) {
  if (!map?.laPlatanera) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, P, 'laPlatanera', colliders);
  scene.add(group);
  return { group };
}
