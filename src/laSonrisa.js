import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * La Pizzería La Sonrisa (restaurante, pizzería y freiduría), en la avenida de la Mancomunidad, en la esquina con la
 * calle Democracia (centro), con la vista de la calle de Google de julio de 2025 y las fotos de Google Maps de 2026
 * (solo se miran, no van dentro del juego; la gente no se pone): el bajo pintado de azul con las rayas blancas, las
 * cristaleras de marco azul y la puerta; la banda azul de arriba con «LA SONRISA» y «Restaurante - Pizzería -
 * Freiduría» en blanco; el tejadillo de cristal de marco azul por encima; y la terraza cerrada de delante: el
 * armazón blanco, los paneles bajos con el paisaje de la costa con el volcán y las casas de colores, el gran «LA
 * SONRISA» en letras rojas con borde blanco encima de la entrada, y las mesas oscuras con las sillas negras. El
 * bloque se queda como está.
 */

// la cara de la avenida del bloque de la esquina (s de oeste a este; la esquina con Democracia cae en s 12); la
// vista de la calle pone el local en s 6,1–12 y la terraza delante (en la foto llega casi al bordillo; aquí
// se queda en 3,4 m para no pisar la calzada) (el rótulo del mapa caía en s 6,5)
const M = marco([-380.64, 511.69], [-368.82, 509.49]);
const Z = 0.12, ZF = Z + 0.3, S0 = 6.1, S1 = 12.0, AZUL = 0x2a4a9a, BLANCO = 0xf2f2ee, FUERA = 3.4;

/** antes de levantar la ciudad: fuera el rótulo genérico (y su terraza genérica) */
export function tuneLaSonrisa(map) {
  map.laSonrisaSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'La Sonrisa' && Math.hypot(s.x + 374.3, s.z - 510.5) < 15);
  if (i >= 0) map.laSonrisaSign = map.signs.splice(i, 1)[0];
  map.laSonrisa = true;
}

// ——— lo que se pinta en lienzo ———

/** el bajo azul con las rayas blancas */
function rayas(g, w, h) {
  g.fillStyle = '#2a4a9a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f2f2ee';
  for (let y = h * 0.1; y < h; y += h / 7) g.fillRect(0, y, w, h * 0.03);
}

/** la banda azul con «LA SONRISA» y «Restaurante - Pizzería - Freiduría» */
function banda(g, w, h) {
  g.fillStyle = '#2a4a9a';
  g.fillRect(0, 0, w, h);
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  g.fillStyle = '#d82a2a';
  g.font = `900 ${Math.round(h * 0.5)}px Georgia, "Times New Roman", serif`;
  g.fillText('LA SONRISA', w * 0.02, h * 0.55);
  const a = g.measureText('LA SONRISA').width;
  g.fillStyle = '#f4f4f0';
  g.font = `400 ${Math.round(h * 0.55)}px Georgia, "Times New Roman", serif`;
  const t = 'Restaurante - Pizzería - Freiduría', m = g.measureText(t).width, k = Math.min(1, (w * 0.95 - a - w * 0.06) / m);
  g.save(); g.translate(w * 0.06 + a, h * 0.55); g.scale(k, 1); g.fillText(t, 0, 0); g.restore();
}

/** las cristaleras de marco azul: el comedor dentro */
function cristalera(g, w, h) {
  g.fillStyle = '#4a4440';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8e0d0';
  g.fillRect(0, 0, w, h * 0.2);
  g.fillStyle = '#7a5a3a';
  for (const x of [0.15, 0.55]) g.fillRect(w * x, h * 0.55, w * 0.25, h * 0.06);
  g.fillStyle = 'rgba(210,225,235,.22)';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#2a4a9a';
  g.lineWidth = 6;
  g.strokeRect(3, 3, w - 6, h - 6);
  for (const x of [1 / 3, 2 / 3]) { g.beginPath(); g.moveTo(w * x, 0); g.lineTo(w * x, h); g.stroke(); }
}

/** los paneles bajos de la terraza: la costa con el volcán, el mar y las casas de colores */
function paisaje(g, w, h) {
  const cielo = g.createLinearGradient(0, 0, 0, h * 0.5);
  cielo.addColorStop(0, '#7ab0e0');
  cielo.addColorStop(1, '#c8e0f0');
  g.fillStyle = cielo;
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#6a7a8a';
  g.beginPath(); g.moveTo(w * 0.55, h * 0.5); g.lineTo(w * 0.72, h * 0.18); g.lineTo(w * 0.78, h * 0.2); g.lineTo(w * 0.95, h * 0.5); g.fill();
  g.fillStyle = '#2a6aa8';
  g.fillRect(0, h * 0.5, w, h * 0.5);
  let s = 12;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const col = ['#e87a3a', '#f2d24a', '#e84a6a', '#f2f2ee', '#d8a070', '#c84a2a'];
  for (const [x0, x1] of [[0, 0.3], [0.32, 0.5]]) {
    for (let i = 0; i < 40; i++) {
      g.fillStyle = col[Math.floor(r() * col.length)];
      g.fillRect(w * (x0 + r() * (x1 - x0)), h * (0.35 + r() * 0.5), w * 0.02, h * 0.08);
    }
    g.fillStyle = '#4a8a3a';
    for (let i = 0; i < 10; i++) { g.beginPath(); g.arc(w * (x0 + r() * (x1 - x0)), h * (0.5 + r() * 0.4), h * 0.06, 0, Math.PI * 2); g.fill(); }
  }
}

/** las letras rojas de «LA SONRISA» con borde blanco y las rayitas de los lados */
function letras(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8e8e4';
  for (const y of [0.35, 0.55, 0.75]) { g.fillRect(0, h * y, w * 0.12, h * 0.05); g.fillRect(w * 0.88, h * y, w * 0.12, h * 0.05); }
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `900 ${Math.round(h * 0.72)}px Georgia, "Times New Roman", serif`;
  const t = 'LA SONRISA', m = g.measureText(t).width, k = Math.min(1, (w * 0.74) / m);
  g.save(); g.translate(w / 2, h * 0.56); g.scale(k, 1);
  g.lineWidth = h * 0.08; g.strokeStyle = '#a81a1a'; g.strokeText(t, 0, 0);
  g.fillStyle = '#d82a2a'; g.fillText(t, 0, 0);
  g.restore();
}

// ——— las piezas ———

/** la fachada azul: el bajo de rayas, las cristaleras, la banda y el tejadillo de cristal */
function fachada(k) {
  const rt = canvasTex(128, 160, rayas);
  for (const [a, b] of [[S0, 6.3], [8.3, 8.5], [10.5, 10.7], [11.8, S1]]) {
    k.box((a + b) / 2, 0, Z + 0.15, b - a, 2.6, 0.3, AZUL);
    k.pic((a + b) / 2, 1.3, ZF + 0.005, b - a, 2.6, 0, 1, rt);
  }
  k.block((S0 + S1) / 2, Z + 0.15, S1 - S0, 0.3);
  const ct = canvasTex(180, 150, cristalera);
  for (const [a, b] of [[6.3, 8.3], [8.5, 10.5], [10.7, 11.8]]) k.pic((a + b) / 2, 1.3, Z + 0.04, b - a, 2.6, 0, 1, ct, { glow: 0.2 });
  // la banda azul con el nombre
  k.box((S0 + S1) / 2, 2.6, Z + 0.2, S1 - S0, 0.55, 0.4, AZUL);
  k.pic((S0 + S1) / 2, 2.875, Z + 0.405, S1 - S0 - 0.04, 0.5, 0, 1, canvasTex(640, 54, banda));
  // el tejadillo de cristal de marco azul
  const fuera = 1.1, y0 = 4.4, y1 = 3.15, largo = Math.hypot(fuera, y0 - y1), pend = Math.atan2(y0 - y1, fuera);
  const vid = new THREE.PlaneGeometry(S1 - S0, largo);
  vid.rotateX(pend - Math.PI / 2);
  vid.translate((S0 + S1) / 2, (y0 + y1) / 2, Z + 0.4 + fuera / 2);
  k.glass.push(vid);
  for (let i = 0; i <= 6; i++) {
    const s = S0 + (S1 - S0) * i / 6, viga = new THREE.BoxGeometry(0.06, 0.06, largo);
    viga.rotateX(pend);
    viga.translate(s, (y0 + y1) / 2, Z + 0.4 + fuera / 2);
    k.add(viga, AZUL);
  }
  k.box((S0 + S1) / 2, y1 - 0.04, Z + 0.4 + fuera, S1 - S0, 0.08, 0.08, AZUL);
  k.box((S0 + S1) / 2, 3.15, Z + 0.25, S1 - S0, 1.3, 0.1, 0x1e3a7a);
}

/** la terraza cerrada: el armazón blanco, los paneles del paisaje, las letras grandes y las mesas */
function terraza(k) {
  const zf = ZF + FUERA, t0 = 5.95, t1 = 12.15;
  // los postes y las vigas blancas
  for (const s of [t0, 8.0, 10.0, t1]) { k.box(s, 0, zf, 0.12, 2.4, 0.12, BLANCO); k.block(s, zf, 0.14, 0.14); }
  k.box((t0 + t1) / 2, 2.3, zf, t1 - t0, 0.14, 0.14, BLANCO);
  for (const s of [t0, t1]) k.box(s, 2.3, ZF + FUERA / 2, 0.12, 0.12, FUERA, BLANCO);
  for (let i = 1; i < 8; i++) k.box(t0 + (t1 - t0) * i / 8, 2.42, ZF + FUERA / 2, 0.05, 0.05, FUERA, BLANCO);
  // los paneles bajos con el paisaje, por delante y por los lados, con la entrada en medio
  const pz = canvasTex(400, 70, paisaje);
  for (const [a, b] of [[t0, 8.6], [9.6, t1]]) {
    k.box((a + b) / 2, 0, zf, b - a, 1.0, 0.05, BLANCO);
    k.pic((a + b) / 2, 0.5, zf + 0.03, b - a, 0.96, 0, 1, pz);
    k.block((a + b) / 2, zf, b - a, 0.1);
  }
  for (const [s, nx] of [[t0, -1], [t1, 1]]) {
    k.box(s, 0, ZF + FUERA / 2, 0.05, 1.0, FUERA, BLANCO);
    k.pic(s + nx * 0.03, 0.5, ZF + FUERA / 2, FUERA, 0.96, nx, 0, pz);
    k.block(s, ZF + FUERA / 2, 0.1, FUERA);
  }
  // el gran «LA SONRISA» encima de la viga, a la izquierda de la entrada
  k.box(7.9, 2.45, zf - 0.04, 3.6, 0.75, 0.06, BLANCO);
  k.pic(7.9, 2.82, zf, 3.58, 0.73, 0, 1, canvasTex(500, 100, letras));
  // las mesas oscuras y las sillas negras
  for (const [s, z] of [[7.0, 1.2], [9.0, 1.2], [11.0, 1.2], [7.0, 2.5], [11.0, 2.5]]) {
    k.table(s, ZF + z, { w: 0.7, d: 0.7, h: 0.75, top: 0x2a2a2e, leg: 0x1e1e20 });
    k.chair(s - 0.52, ZF + z, Math.PI / 2, 0x1e1e20, { legs: 0x1e1e20 });
    k.chair(s + 0.52, ZF + z, -Math.PI / 2, 0x1e1e20, { legs: 0x1e1e20 });
    k.block(s, ZF + z, 0.7, 0.7);
  }
}

/** se monta con lo demás de Arrecife Centro */
export function buildLaSonrisa(scene, colliders, map) {
  if (!map?.laSonrisa) return null;
  const k = new Kit();
  fachada(k);
  terraza(k);
  const group = enMarco(k, M, 'laSonrisa', colliders);
  scene.add(group);
  return { group };
}
