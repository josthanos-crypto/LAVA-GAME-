import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * El Minimarket Sol Lanzarote, en la calle Coronel Bens, con la foto de Google Maps de septiembre de 2025
 * (solo se mira, no va dentro del juego): la pared blanca, el letrero azul marino con «MINIMARKET SOL
 * LANZAROTE» en letras doradas y su sol de rayos rojos y amarillos, la puerta ancha abierta con las dos
 * hojas de librillo blancas recogidas a los lados, el montante de cristales verdes de encima y la tienda
 * dentro (las baldas, el expositor rojo y los mostradores de chucherías), el letrero redondo de la esquina
 * con el sol, el buzón negro y los carteles de helados y de móviles de la pared (de colores, sin las
 * marcas de la foto). El bloque se queda como está.
 */

// la cara de la calle Coronel Bens (s desde el extremo del norte)
const M = marco([-240.95, 325.77], [-228.7, 377.51]);
const Z = 0.12, S0 = 25.6, S1 = 32.0, ALTO = 3.7, BLANCO = 0xf0eee8, MARINO = 0x1a1e3a;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneMinimarketSol(map) {
  map.minimarketSolSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Minimarket Sol');
  if (i >= 0) map.minimarketSolSign = map.signs.splice(i, 1)[0];
  map.minimarketSol = true;
}

// ——— lo que se pinta en lienzo ———

/** el sol de la tienda: el círculo amarillo y los rayos rojos y naranjas como pinceladas */
function sol(g, x, y, r) {
  const rayos = ['#d8282a', '#f08a1a', '#e8c020'];
  for (let i = 0; i < 14; i++) {
    const a = i / 14 * Math.PI * 2 + 0.2, l = r * (1.3 + (i % 3) * 0.25);
    g.strokeStyle = rayos[i % 3];
    g.lineWidth = r * 0.22;
    g.lineCap = 'round';
    g.beginPath(); g.moveTo(x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7); g.quadraticCurveTo(x + Math.cos(a + 0.25) * l * 0.9, y + Math.sin(a + 0.25) * l * 0.9, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  g.fillStyle = '#f2c41a';
  g.beginPath(); g.arc(x, y, r * 0.7, 0, Math.PI * 2); g.fill();
}

/** el letrero azul marino: el sol a la izquierda, MINIMARKET y SOL LANZAROTE en dorado, la pincelada roja */
function letrero(g, w, h) {
  g.fillStyle = '#1a1e3a';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#e8e8e4';
  g.lineWidth = 6;
  g.strokeRect(3, 3, w - 6, h - 6);
  sol(g, h * 0.6, h * 0.45, h * 0.22);
  g.fillStyle = '#f2f2ee';
  g.font = `italic 700 ${Math.round(h * 0.11)}px "Segoe Script", Georgia, serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('SOL', h * 0.6, h * 0.8);
  g.fillText('LANZAROTE', h * 0.6, h * 0.9);
  // la pincelada roja y amarilla del otro lado
  g.fillStyle = '#d8282a';
  g.beginPath(); g.moveTo(w - h * 0.9, h * 0.1); g.quadraticCurveTo(w - h * 0.2, h * 0.3, w - h * 0.5, h * 0.9); g.quadraticCurveTo(w - h * 0.6, h * 0.5, w - h * 0.9, h * 0.1); g.fill();
  g.fillStyle = '#f2c41a';
  g.beginPath(); g.arc(w - h * 0.35, h * 0.6, h * 0.16, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#e8a83a';
  g.font = `900 ${Math.round(h * 0.36)}px "Arial Black", Arial, sans-serif`;
  g.fillText('MINIMARKET', w * 0.5, h * 0.3);
  g.fillText('SOL LANZAROTE', w * 0.5, h * 0.72);
}

/** la tienda por la puerta abierta: las baldas llenas, el expositor rojo, los mostradores y el techo */
function tienda(g, w, h) {
  g.fillStyle = '#d8d8d2';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#9a9a96';
  g.fillRect(0, h * 0.85, w, h * 0.15);
  let s = 11;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  // las baldas del fondo llenas de cosas
  for (let y = 0.12; y < 0.7; y += 0.1) {
    g.fillStyle = '#b8b8b4';
    g.fillRect(w * 0.15, h * (y + 0.08), w * 0.7, h * 0.01);
    for (let x = 0.16; x < 0.84; x += 0.025) { g.fillStyle = ['#e83a2a', '#2a6ad8', '#f2c41a', '#3a9a4a', '#f2f2ee', '#8a3ab8', '#e87a2a'][Math.floor(r() * 7)]; g.fillRect(w * x, h * (y + 0.02), w * 0.02, h * 0.06); }
  }
  // el expositor de pie de la izquierda y la columna de chucherías
  g.fillStyle = '#3a3a3e';
  g.fillRect(w * 0.06, h * 0.55, w * 0.14, h * 0.32);
  for (let i = 0; i < 12; i++) { g.fillStyle = ['#e85a8a', '#f2c41a', '#3ac8e8'][i % 3]; g.fillRect(w * (0.07 + (i % 4) * 0.03), h * (0.58 + Math.floor(i / 4) * 0.08), w * 0.02, h * 0.05); }
  g.fillStyle = '#e8e4dc';
  g.fillRect(w * 0.24, h * 0.5, w * 0.12, h * 0.37);
  g.fillStyle = '#c83a3a';
  g.fillRect(w * 0.25, h * 0.52, w * 0.1, h * 0.08);
  // el expositor rojo de latas de la derecha
  g.strokeStyle = '#d82a2a';
  g.lineWidth = w * 0.012;
  g.strokeRect(w * 0.6, h * 0.42, w * 0.16, h * 0.45);
  for (let y = 0.5; y < 0.86; y += 0.08) { g.beginPath(); g.moveTo(w * 0.6, h * y); g.lineTo(w * 0.76, h * y); g.stroke(); }
  // la nevera de los helados y la penumbra del techo
  g.fillStyle = '#e8eaec';
  g.fillRect(w * 0.82, h * 0.55, w * 0.16, h * 0.32);
  g.fillStyle = 'rgba(20,20,24,.35)';
  g.fillRect(0, 0, w, h * 0.1);
}

/** el montante de encima de la puerta: los marcos blancos, los cristales verdes y los carteles pegados */
function montante(g, w, h) {
  g.fillStyle = '#f0f0ec';
  g.fillRect(0, 0, w, h);
  const huecos = [[0.02, 0.18, '#3a4a4a'], [0.2, 0.44, '#1e7a4a'], [0.46, 0.7, '#2a3a3a'], [0.72, 0.98, '#1e7a4a']];
  for (const [a, b, c] of huecos) {
    g.fillStyle = c;
    g.fillRect(w * a, h * 0.08, w * (b - a), h * 0.84);
    g.fillStyle = 'rgba(255,255,255,.18)';
    g.fillRect(w * a, h * 0.08, w * (b - a) * 0.4, h * 0.84);
  }
  g.fillStyle = '#e83a6a';
  g.fillRect(w * 0.57, h * 0.15, w * 0.06, h * 0.7);
  g.fillStyle = '#3a8ae8';
  g.fillRect(w * 0.5, h * 0.3, w * 0.05, h * 0.5);
}

/** las hojas de librillo blancas recogidas: las tablillas con su sombra */
function librillo(g, w, h) {
  g.fillStyle = '#eceae4';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(120,120,116,.45)';
  for (let x = 0; x < w; x += w / 6) g.fillRect(x, 0, 2, h);
  g.strokeStyle = 'rgba(150,150,146,.5)';
  g.lineWidth = 2;
  g.beginPath(); g.moveTo(0, h * 0.2); g.lineTo(w, h * 0.45); g.moveTo(0, h * 0.7); g.lineTo(w, h * 0.45); g.stroke();
}

/** el cartel de los helados: el azul y el naranja con los polos y los conos de colores, sin marca */
function cartelHelados(g, w, h) {
  g.fillStyle = '#2a6ad8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f08a2a';
  g.fillRect(0, h * 0.45, w, h * 0.55);
  let s = 5;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 18; i++) {
    const x = w * (0.1 + (i % 4) * 0.25), y = h * (0.12 + Math.floor(i / 4) * 0.18);
    g.fillStyle = ['#f2e8d8', '#6a3a22', '#e84a8a', '#f2c41a', '#3ac87a'][Math.floor(r() * 5)];
    g.fillRect(x - w * 0.06, y - h * 0.05, w * 0.12, h * 0.09);
    g.fillStyle = '#d8b888';
    g.fillRect(x - w * 0.012, y + h * 0.04, w * 0.024, h * 0.04);
  }
}

/** el cartel marrón del helado de chocolate y el azul de los móviles, sin marcas */
function cartelChocolate(g, w, h) {
  g.fillStyle = '#4a2a1a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#7a4a2a';
  g.beginPath(); g.ellipse(w * 0.4, h * 0.5, w * 0.3, h * 0.3, -0.4, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#e8d8b8';
  g.fillRect(w * 0.65, h * 0.6, w * 0.06, h * 0.3);
}
function cartelMoviles(g, w, h) {
  g.fillStyle = '#1e5ab8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#2a8a4a';
  g.beginPath(); g.ellipse(w * 0.5, h * 0.75, w * 0.3, h * 0.25, 0, Math.PI, 0); g.fill();
  g.beginPath(); g.arc(w * 0.5, h * 0.42, w * 0.14, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#f2f2ee';
  g.fillRect(w * 0.1, h * 0.08, w * 0.8, h * 0.08);
}

/** la cara del letrero redondo de la esquina: el sol y el nombre alrededor */
function redondo(g, w, h) {
  g.fillStyle = '#f4f4f2';
  g.fillRect(0, 0, w, h);
  sol(g, w / 2, h * 0.5, w * 0.17);
  g.fillStyle = '#1a1e3a';
  g.font = `900 ${Math.round(h * 0.11)}px "Arial Black", Arial, sans-serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('MINIMARKET', w / 2, h * 0.1);
  g.fillText('SOL LANZAROTE', w / 2, h * 0.92);
}

// ——— las piezas ———

/** la planta baja del minimarket */
function fachada(k) {
  const sm = (S0 + S1) / 2;
  k.box(sm, 0, Z - 0.05, S1 - S0, ALTO, 0.1, BLANCO);
  // la puerta ancha abierta con la tienda dentro, el montante y las hojas de librillo
  const a = 26.9, b = 30.7, hp = 2.2, hm = 2.85;
  k.pic((a + b) / 2, hp / 2, Z + 0.004, b - a, hp, 0, 1, canvasTex(380, 220, tienda), { glow: 0.06 });
  k.pic((a + b) / 2, (hp + hm) / 2, Z + 0.01, b - a, hm - hp, 0, 1, canvasTex(380, 66, montante), { glow: 0.03 });
  k.box((a + b) / 2, hp - 0.04, Z + 0.03, b - a, 0.08, 0.06, 0xf0f0ec);
  for (const s of [a + 0.16, b - 0.16]) {
    k.box(s, 0, Z + 0.13, 0.3, hm, 0.22, 0xeceae4);
    k.pic(s, hm / 2, Z + 0.245, 0.3, hm, 0, 1, canvasTex(48, 280, librillo));
  }
  k.box((a + b) / 2, hm, Z + 0.04, b - a + 0.1, 0.1, 0.12, 0xf0f0ec);
  // el letrero azul marino
  k.box(sm, 2.98, Z + 0.06, 4.6, 0.62, 0.1, MARINO);
  k.pic(sm, 3.29, Z + 0.115, 4.56, 0.58, 0, 1, canvasTex(640, 82, letrero));
  // a la izquierda: el cartel de los helados, el buzón negro y la pegatina redonda
  k.pic(26.25, 1.85, Z + 0.01, 0.75, 1.15, 0, 1, canvasTex(96, 148, cartelHelados));
  k.box(26.3, 0.95, Z + 0.08, 0.32, 0.36, 0.16, 0x1a1a1c);
  k.box(26.3, 0.55, Z + 0.02, 0.3, 0.3, 0.02, 0xe8e4dc);
  // a la derecha: los carteles de la pared
  k.pic(31.35, 1.95, Z + 0.01, 0.95, 0.55, 0, 1, canvasTex(120, 70, cartelChocolate));
  k.pic(31.2, 1.0, Z + 0.01, 0.55, 0.85, 0, 1, canvasTex(70, 108, cartelMoviles));
  k.box(31.0, 2.45, Z + 0.02, 0.45, 0.32, 0.03, 0x2a2a2e);
  // el letrero redondo de la esquina, de canto hacia la calle
  const r = 0.36, sR = 31.2, yR = 2.95, fuera = Z + 0.15 + r;
  const disco = new THREE.CylinderGeometry(r, r, 0.12, 28);
  disco.rotateZ(Math.PI / 2);
  disco.translate(sR, yR, fuera);
  k.add(disco, 0xf4f4f2);
  for (const n of [1, -1]) k.pic(sR + n * 0.061, yR, fuera, r * 1.38, r * 1.38, n, 0, canvasTex(128, 128, redondo), { glow: 0.12 });
  k.box(sR, yR + r - 0.02, Z + 0.08, 0.04, 0.04, 0.2, 0x2a2a2a);
  // los cables de arriba
  k.box(sm, 3.55, Z + 0.02, S1 - S0, 0.03, 0.03, 0x161618);
}

/** segunda fase, como los demás de este barrio */
export function buildMinimarketSol(scene, colliders, map) {
  if (!map?.minimarketSol) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, M, 'minimarketSol', colliders);
  scene.add(group);
  return { group };
}
