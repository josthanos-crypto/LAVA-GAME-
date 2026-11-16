import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, sombrillaGrande } from './restaurantesCharco.js';

/**
 * El Hotel Diamar (hoy Hotel Checkin Diamar), en la avenida Fred Olsen 8, frente a la playa del Reducto (centro), con
 * la foto de calle de Google de junio de 2019 y las fotos del hotel de 2017 a 2025 (solo se miran, no van dentro del
 * juego; la gente no se pone): la planta baja y la entreplanta forradas de granito rosado, con los ventanales grandes
 * de marco blanco arriba y las cristaleras de abajo; las letras grandes de «HOTEL DIAMAR» entre las dos; la entrada
 * de cristal; los tres mástiles con las banderas de Canarias, de España y de Europa; y en la acera, la terraza con
 * las sombrillas rojas, las mesas y la valla negra de barrotes. Los carteles de las marcas que hay en la puerta no se
 * ponen. El edificio de arriba es de color ocre, pero el juego pinta de blanco todos los edificios de su lista de
 * hoteles después de leer el mapa, así que se queda blanco.
 */

// la cara de la avenida del bloque del hotel (s de oeste a este; la entrada queda a la izquierda, como en la foto);
// el rótulo del mapa caía en s 2
const M = marco([-785.09, 412.44], [-771.05, 411.4]);
const Z = 0.12, ZF = Z + 0.3, S0 = -0.2, S1 = 14.25, YP = 6.0;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneHotelDiamar(map) {
  map.hotelDiamarSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Hotel Diamar' && Math.hypot(s.x + 783, s.z - 412.3) < 15);
  if (i >= 0) map.hotelDiamarSign = map.signs.splice(i, 1)[0];
  map.hotelDiamar = true;
}

// ——— lo que se pinta en lienzo ———

/** el granito rosado en placas */
function granito(g, w, h) {
  g.fillStyle = '#b89484';
  g.fillRect(0, 0, w, h);
  let s = 13;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 1200; i++) {
    g.fillStyle = r() < 0.5 ? 'rgba(90,60,52,.35)' : 'rgba(230,210,200,.35)';
    g.fillRect(r() * w, r() * h, 2, 2);
  }
  g.strokeStyle = 'rgba(80,60,55,.35)';
  g.lineWidth = 1;
  for (let y = 0; y <= h; y += h / 10) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** un ventanal de marco blanco con el cristal azulado y el reflejo */
function ventanal(g, w, h) {
  g.fillStyle = '#4a6278';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.18)';
  g.fillRect(0, 0, w * 0.4, h);
  g.strokeStyle = '#f4f4f0';
  g.lineWidth = 6;
  g.strokeRect(3, 3, w - 6, h - 6);
  for (const x of [1 / 3, 2 / 3]) { g.beginPath(); g.moveTo(w * x, 0); g.lineTo(w * x, h); g.stroke(); }
  g.beginPath(); g.moveTo(0, h * 0.35); g.lineTo(w, h * 0.35); g.stroke();
}

/** la cristalera de la planta baja: el bar del hotel dentro */
function cristalera(g, w, h) {
  g.fillStyle = '#3a3634';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8c8a8';
  g.fillRect(0, h * 0.1, w, h * 0.25);
  g.fillStyle = '#6a5040';
  g.fillRect(w * 0.1, h * 0.55, w * 0.8, h * 0.18);
  g.fillStyle = 'rgba(200,215,225,.25)';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d8d8d4';
  g.lineWidth = 4;
  g.strokeRect(2, 2, w - 4, h - 4);
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
}

/** las letras de «HOTEL DIAMAR» */
function letras(g, w, h) {
  g.fillStyle = '#b89484';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8eaee';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.75)}px Georgia, "Times New Roman", serif`;
  g.save(); g.translate(w / 2, h * 0.55); g.scale(Math.min(1, (w * 0.95) / g.measureText('HOTEL   DIAMAR').width), 1);
  g.lineWidth = 3; g.strokeStyle = '#5a6a7a'; g.strokeText('HOTEL   DIAMAR', 0, 0);
  g.fillText('HOTEL   DIAMAR', 0, 0);
  g.restore();
}

/** una bandera: franjas verticales (Canarias), horizontales (España) o azul con el círculo (Europa) */
function bandera(tipo) {
  return (g, w, h) => {
    if (tipo === 'canarias') {
      ['#f4f4f0', '#1e5ab8', '#f2c82a'].forEach((c, i) => { g.fillStyle = c; g.fillRect(w * i / 3, 0, w / 3 + 1, h); });
    } else if (tipo === 'espana') {
      g.fillStyle = '#c8202a'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#f2c82a'; g.fillRect(0, h * 0.25, w, h * 0.5);
    } else {
      g.fillStyle = '#1e3a9a'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#f2d24a';
      for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.beginPath(); g.arc(w / 2 + Math.cos(a) * h * 0.3, h / 2 + Math.sin(a) * h * 0.3, h * 0.04, 0, Math.PI * 2); g.fill(); }
    }
  };
}

// ——— las piezas ———

/** el bajo y la entreplanta de granito, los ventanales, las letras, la entrada y las banderas */
function fachada(k) {
  const W = S1 - S0, c = (S0 + S1) / 2;
  k.box(c, 0, Z + 0.15, W, YP, 0.3, 0xb89484);
  k.pic(c, YP / 2, ZF + 0.002, W, YP, 0, 1, canvasTex(512, 220, granito));
  k.block(c, Z + 0.15, W, 0.3);
  // la entreplanta: cinco ventanales grandes
  const vt = canvasTex(180, 120, ventanal);
  for (let i = 0; i < 5; i++) k.pic(S0 + 0.5 + i * 2.8 + 1.2, 4.6, ZF + 0.006, 2.3, 1.8, 0, 1, vt);
  // las letras de «HOTEL DIAMAR»
  k.pic(c, 3.25, ZF + 0.01, 10.5, 0.75, 0, 1, canvasTex(840, 60, letras));
  // abajo: la entrada de cristal y las cristaleras del bar
  const ct = canvasTex(160, 180, cristalera);
  k.pic(2.0, 1.3, ZF + 0.006, 2.2, 2.6, 0, 1, ct, { glow: 0.2 });
  for (const s of [5.2, 8.0, 10.8]) k.pic(s, 1.3, ZF + 0.006, 2.2, 2.6, 0, 1, ct, { glow: 0.2 });
  k.box(2.0, 2.65, ZF + 0.25, 2.6, 0.12, 0.5, 0xd8d8d4);
  // los tres mástiles con sus banderas
  const ang = 0.8, largo = 2.8, y0 = 5.6;
  for (const [s, tipo] of [[4.0, 'canarias'], [6.4, 'espana'], [8.8, 'europa']]) {
    const palo = new THREE.BoxGeometry(0.05, largo, 0.05);
    palo.rotateX(ang);
    palo.translate(s, y0 + largo / 2 * Math.cos(ang), ZF + largo / 2 * Math.sin(ang));
    k.add(palo, 0xd8d8d4);
    k.pic(s + 0.47, y0 + largo * Math.cos(ang) - 0.32, ZF + largo * Math.sin(ang), 0.9, 0.6, 0, 1, canvasTex(90, 60, bandera(tipo)));
  }
}

/** la terraza de la acera: la valla negra de barrotes, las mesas y las sombrillas rojas */
function terraza(k) {
  const t0 = 4.0, t1 = 14.0, z1 = ZF + 2.6;
  for (let s = t0; s <= t1 + 0.01; s += 0.12) k.box(s, 0, z1, 0.03, 0.9, 0.03, 0x1e1e20);
  for (const y of [0.05, 0.88]) k.box((t0 + t1) / 2, y, z1, t1 - t0, 0.04, 0.05, 0x1e1e20);
  k.block((t0 + t1) / 2, z1, t1 - t0, 0.1);
  for (const s of [6.0, 9.0, 12.0]) sombrillaGrande(k, s, ZF + 1.3, 0xc82a2a);
  for (const [s, z] of [[5.0, 1.3], [7.2, 1.3], [10.2, 1.3], [13.0, 1.3]]) {
    k.table(s, ZF + z, { w: 0.7, d: 0.7, h: 0.75, top: 0x2a2a2e, leg: 0x2a2a2e });
    k.chair(s - 0.52, ZF + z, Math.PI / 2, 0x5a5e66, { legs: 0x3a3c40 });
    k.chair(s + 0.52, ZF + z, -Math.PI / 2, 0x5a5e66, { legs: 0x3a3c40 });
    k.block(s, ZF + z, 0.7, 0.7);
  }
}

/** se monta con lo demás de Arrecife Centro */
export function buildHotelDiamar(scene, colliders, map) {
  if (!map?.hotelDiamar) return null;
  const k = new Kit();
  fachada(k);
  terraza(k);
  const group = enMarco(k, M, 'hotelDiamar', colliders);
  scene.add(group);
  return { group };
}
