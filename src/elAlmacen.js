import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, hueco, enMarco, WHITE } from './restaurantesCharco.js';

/**
 * El Almacén, el centro cultural que reformó César Manrique (calle José Betancort 33), con el Bar Picasso
 * dentro, sacado de las fotos de internet de Google Maps (solo se miran, no van dentro del juego). En la
 * foto es una casa terrera larga, encalada, con la carpintería verde oscura: puertas de cuarterones, las
 * ventanas altas con las persianas de lamas abajo, la vitrina de los carteles con el logo de colores
 * encima, la celosía verde de listones que sube por encima del tejado y los faroles negros de brazo.
 * El mapa traía la manzana como un bloque de dos plantas con escaparates y los rótulos rojos de El Almacén
 * y del Bar Picasso: la manzana baja a una planta encalada (las casas de al lado también son terreras) y
 * se ponen la fachada y sus cosas por delante.
 */

// la fachada de la calle José Betancort, de la esquina de La Porra (sur) a la de Periodista Viera (norte)
const F = marco([-151.9, 390.2], [-160.4, 363.3]);
const VERDE = 0x24583a, H = 4.8;

/** antes de levantar la ciudad: la manzana a una planta encalada y fuera los dos rótulos genéricos */
export function tuneElAlmacen(map) {
  const dentro = (poly, x, z) => {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [ax, az] = poly[i], [bx, bz] = poly[j];
      if ((az > z) !== (bz > z) && x < ax + ((z - az) * (bx - ax)) / (bz - az)) c = !c;
    }
    return c;
  };
  const b = (map.buildings || []).find(q => !q.skip && dentro(q.p, -170, 385) && dentro(q.p, -158, 372));
  if (b) { b.h = H; b.f = [242, 241, 236]; b.s = 0; }
  map.elAlmacenSigns = [];
  for (const name of ['El Almacén', 'Bar Picasso']) {
    const i = (map.signs || []).findIndex(s => s.name === name);
    if (i >= 0) map.elAlmacenSigns.push(map.signs.splice(i, 1)[0]);
  }
  map.elAlmacen = true;
}

// ——— lo que se pinta en lienzo ———

/** puerta verde oscura de cuarterones con cristales arriba y la persiana de lamas abajo */
function puertaVerde(cristal) {
  return (g, w, h) => {
    g.fillStyle = '#1f4a32';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#16382a';
    g.lineWidth = 5;
    g.strokeRect(3, 3, w - 6, h - 6);
    if (cristal) {
      // los cristales de arriba, dos columnas de cuatro, con los visillos blancos
      const x0 = w * 0.16, y0 = h * 0.08, cw = w * 0.68, ch = h * 0.5;
      g.fillStyle = '#e8e8e2';
      g.fillRect(x0, y0, cw, ch);
      g.fillStyle = '#1f4a32';
      g.fillRect(x0 + cw / 2 - 3, y0, 6, ch);
      for (let i = 1; i < 4; i++) g.fillRect(x0, y0 + (ch * i) / 4 - 3, cw, 6);
      g.fillStyle = 'rgba(40,50,48,.25)';
      g.fillRect(x0, y0, cw / 2 - 3, ch);
    } else {
      g.strokeRect(w * 0.16, h * 0.08, w * 0.68, h * 0.5);
    }
    // la persiana de lamas de abajo
    g.strokeStyle = '#2e5e44';
    g.lineWidth = 3;
    for (let y = h * 0.66; y < h * 0.93; y += 8) { g.beginPath(); g.moveTo(w * 0.16, y); g.lineTo(w * 0.84, y); g.stroke(); }
    g.fillStyle = '#c9b27a';
    g.beginPath(); g.arc(w * 0.82, h * 0.6, 3, 0, Math.PI * 2); g.fill();
  };
}

/** la ventana alta y estrecha: cristal oscuro arriba y lamas abajo, todo verde */
function ventanaVerde(g, w, h) {
  g.fillStyle = '#1f4a32';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#2a3432';
  g.fillRect(w * 0.18, h * 0.06, w * 0.64, h * 0.56);
  g.fillStyle = '#1f4a32';
  for (let i = 1; i < 4; i++) g.fillRect(w * 0.18, h * 0.06 + (h * 0.56 * i) / 4 - 2, w * 0.64, 4);
  g.strokeStyle = '#2e5e44';
  g.lineWidth = 3;
  for (let y = h * 0.68; y < h * 0.95; y += 7) { g.beginPath(); g.moveTo(w * 0.18, y); g.lineTo(w * 0.82, y); g.stroke(); }
}

/** la vitrina de los carteles, con un cartel blanco dentro */
function vitrina(g, w, h) {
  g.fillStyle = '#1f4a32';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8dcd8';
  g.fillRect(w * 0.12, h * 0.08, w * 0.76, h * 0.84);
  g.fillStyle = '#2a2c30';
  for (let y = 0.2; y < 0.8; y += 0.12) g.fillRect(w * 0.2, h * y, w * (0.3 + (y * 7 % 3) * 0.1), 3);
  g.fillStyle = 'rgba(255,255,255,.3)';
  g.fillRect(w * 0.14, h * 0.1, w * 0.2, h * 0.8);
}

/** el logo de colores: el abanico en semicírculo con los rayos de colores, sobre la pared blanca */
function logo(g, w, h) {
  g.fillStyle = '#f2f1ec';
  g.fillRect(0, 0, w, h);
  const cols = ['#d8342a', '#f08a1e', '#f2c21a', '#4aa83a', '#1f8ad0', '#2a3a9a', '#8a3aa0'];
  const cx = w / 2, cy = h * 0.92, r = Math.min(w / 2, h) * 0.95;
  for (let i = 0; i < cols.length; i++) {
    const a0 = Math.PI + (i * Math.PI) / cols.length, a1 = Math.PI + ((i + 1) * Math.PI) / cols.length;
    g.fillStyle = cols[i];
    g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, a0, a1); g.closePath(); g.fill();
  }
  g.fillStyle = '#f2f1ec';
  g.beginPath(); g.arc(cx, cy, r * 0.32, Math.PI, 0); g.fill();
}

// ——— las piezas ———

/** el farol negro de brazo de forja (los de la calle) */
function farolForja(k, s, y) {
  k.box(s, y - 0.25, 0.04, 0.12, 0.5, 0.06, 0x1d1d1f);
  k.box(s, y + 0.1, 0.3, 0.04, 0.04, 0.52, 0x1d1d1f);
  k.box(s, y - 0.12, 0.22, 0.03, 0.3, 0.03, 0x1d1d1f);
  k.box(s, y + 0.12 - 0.42, 0.56, 0.22, 0.3, 0.22, 0xf3e2b8, { list: k.glow });
  for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) k.box(s + a * 0.12, y - 0.3, 0.56 + b * 0.12, 0.025, 0.34, 0.025, 0x1d1d1f);
  k.cyl(s, y + 0.02, 0.56, 0.03, 0.2, 0.16, 0x1d1d1f, { seg: 4, ry: Math.PI / 4 });
  k.box(s, y - 0.36, 0.56, 0.18, 0.04, 0.18, 0x1d1d1f);
}

/** la celosía verde de listones verticales, con la visera de listones a media altura y la puerta detrás */
function celosia(k, s, w) {
  k.pic(s, 1.2, 0.03, w - 0.3, 2.4, 0, 1, canvasTex(96, 240, puertaVerde(false)));
  for (let x = -w / 2; x <= w / 2 + 0.001; x += 0.09) k.box(s + x, 0, 0.18, 0.045, H + 0.35, 0.07, VERDE);
  k.box(s, H + 0.3, 0.18, w + 0.1, 0.06, 0.1, VERDE);
  // la visera de listones que sale a 2,3 m
  for (let x = -w / 2; x <= w / 2 + 0.001; x += 0.09) k.box(s + x, 2.25, 0.4, 0.04, 0.05, 0.5, VERDE);
  k.box(s, 2.25, 0.62, w + 0.1, 0.06, 0.06, VERDE);
  k.block(s, 0.18, w, 0.2);
}

/** la fachada de El Almacén por delante de la pared del mapa, de s 0 a 28 */
function fachada(k) {
  const L = F.len;
  // el encalado de la fachada, con el remate de arriba
  k.box(L / 2, 0, 0.025, L, H, 0.05, WHITE);
  k.box(L / 2, H - 0.12, 0.08, L, 0.14, 0.12, 0xe8e6e0);
  // del sur al norte: puerta, ventanas y la puerta de cristales, la vitrina con el logo, la celosía y más huecos
  hueco(k, 1.6, 0, 1.3, 2.5, canvasTex(160, 300, puertaVerde(false)), { borde: VERDE });
  for (const s of [3.4, 4.9]) hueco(k, s, 0.35, 0.75, 2.1, canvasTex(80, 240, ventanaVerde), { borde: VERDE });
  farolForja(k, 6.4, 3.4);
  hueco(k, 7.9, 0, 0.95, 2.6, canvasTex(112, 312, puertaVerde(true)), { borde: VERDE });
  hueco(k, 9.4, 1.0, 0.65, 0.95, canvasTex(80, 120, vitrina), { borde: VERDE });
  k.pic(9.4, 2.22, 0.06, 0.5, 0.3, 0, 1, canvasTex(100, 60, logo));
  celosia(k, 10.9, 1.7);
  for (const [s, puerta] of [[13.1, false], [14.6, true], [16.1, false], [17.6, false], [19.1, true], [20.6, false], [22.1, false], [23.6, true], [25.1, false], [26.6, false]]) {
    if (puerta) hueco(k, s, 0, 0.95, 2.45, canvasTex(112, 296, puertaVerde(true)), { borde: VERDE });
    else hueco(k, s, 0.35, 0.75, 2.05, canvasTex(80, 232, ventanaVerde), { borde: VERDE });
  }
  farolForja(k, 21.35, 3.4);
}

/** segunda fase, como los demás de este barrio */
export function buildElAlmacen(scene, colliders, map) {
  if (!map?.elAlmacen) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, F, 'elAlmacen', colliders);
  scene.add(group);
  return { group };
}
