import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alturaBloque, cristales } from './edificioReal.js';

/**
 * Las casas de la acera de enfrente de Urgencias, en Clavijo y Fajardo (números 20 a 32), con las vistas de la calle
 * de Google de julio de 2025 (solo se miran, no van dentro del juego; la gente no se pone). Es una fila de casas
 * terreras encaladas de dos plantas, de las viviendas del Instituto Social de la Marina (las letras en relieve, ya
 * gastadas, se leen en lo alto de la fachada del sur). Cada casa con su patio delantero de muro bajo y su cancela
 * (verde o de madera), las puertas y ventanas verdes o de madera marrón, el balconcito de arriba con la barandilla
 * verde o la celosía de bloque, las torres de la escalera más altas con su ventana estrecha, algún cuarto acristalado
 * en la azotea, los contadores y los cables negros corridos por lo alto. El bloque del mapa era gris de 6 m.
 */

// la cara de Clavijo y Fajardo del bloque, del norte (s 0, la punta de Cáceres) al sur, N hacia la calle (al oeste)
const M = marco([551.91, -477.63], [507.17, -398.47]);
const Z = 0.12, ZF = Z + 0.3, H = 6.4, HT = 8.6, BLANCO = 0xf4f4f0, VERDE = 0x2a7a3e, MADERA = 0x6a4028;
// las casas, de norte a sur: [desde, ancho, tipo] (A verde con balcón de barandilla, B de madera con celosía,
// C con el cuerpo de delante y la torre, D con la ventana de arco y el cuarto acristalado arriba)
const CASAS = [[0.5, 7.5, 'A'], [8, 7.5, 'A'], [15.5, 7, 'B'], [22.5, 7, 'C'], [29.5, 7.5, 'B'], [37, 7, 'A'],
  [44, 7, 'C'], [51, 7.5, 'B'], [58.5, 7, 'D'], [65.5, 7.5, 'A'], [73, 7, 'D'], [80, 10.5, 'A']];

/** antes de levantar la ciudad: el bloque a la altura de las casas y blanco */
export function tuneCasasMarina(map) {
  if (!alturaBloque(map, 535.3, -434.7, H, [240, 240, 236])) return;
  map.casasMarina = true;
}

// ——— lo que se pinta en lienzo ———

/** la cal con las manchas y los desconchones */
function cal(g, w, h) {
  g.fillStyle = '#f4f4f0';
  g.fillRect(0, 0, w, h);
  let s = 13;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(150,145,135,${0.05 + r() * 0.1})`; g.fillRect(r() * w, h * (0.5 + r() * 0.5), 3 + r() * 20, 2 + r() * 8); }
}

/** la celosía de bloque de cemento blanca */
function celosia(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#9aa4aa';
  const t = h / 2.4;
  for (let y = t * 0.3; y < h - t * 0.5; y += t) for (let x = t * 0.3; x < w - t * 0.5; x += t) { g.beginPath(); g.ellipse(x + t * 0.35, y + t * 0.35, t * 0.28, t * 0.22, 0, 0, Math.PI * 2); g.fill(); }
}

/** la ventana de madera con los cristales y el visillo */
const ventanaVerde = cristales('#2a7a3e', 2, 'rgba(230,226,215,.5)');
const ventanaMadera = cristales('#6a4028', 2, 'rgba(230,226,215,.5)');
const ventanaBlanca = cristales('#f2f2ee', 3, 'rgba(230,232,232,.5)');

/** la puerta verde de cuarterones */
function puertaVerde(g, w, h) {
  g.fillStyle = '#2a7a3e';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#1e5a2e';
  g.lineWidth = 3;
  for (const [x, y, a, b] of [[0.15, 0.08, 0.7, 0.35], [0.15, 0.52, 0.7, 0.4]]) g.strokeRect(w * x, h * y, w * a, h * b);
}

/** la persiana de lamas (blanca o marrón) */
function lamas(color) {
  return (g, w, h) => {
    g.fillStyle = color;
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,.25)';
    for (let y = 5; y < h - 3; y += 5) g.fillRect(3, y, w - 6, 1.5);
    g.fillRect(w / 2 - 1, 0, 2, h);
  };
}

/** la ventana de lamas blanca con el arco de medio punto */
function arco(g, w, h) {
  g.fillStyle = '#f4f4f0';
  g.fillRect(0, 0, w, h);
  const r = w / 2 - 3;
  g.beginPath();
  g.moveTo(3, h - 3); g.lineTo(3, r + 3); g.arc(w / 2, r + 3, r, Math.PI, 0); g.lineTo(w - 3, h - 3); g.closePath();
  g.fillStyle = '#e8e8e4';
  g.fill();
  g.save(); g.clip();
  g.fillStyle = '#9a9a96';
  for (let y = r + 6; y < h - 4; y += 5) g.fillRect(6, y, w - 12, 1.5);
  g.fillRect(w / 2 - 1, 0, 2, h);
  g.restore();
  g.strokeStyle = '#c8c8c4';
  g.lineWidth = 3;
  g.stroke();
}

/** las letras gastadas en relieve del Instituto Social de la Marina */
function letras(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(150,145,135,.55)';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.7)}px Georgia, serif`;
  g.fillText('INSTITUTO SOCIAL DE LA MARINA', w / 2, h / 2, w * 0.98);
}

// ——— las piezas ———

/** el patio delantero: el muro bajo con la cancela y los pilares */
function patio(k, a, b, cancela, color) {
  const D = 1.2, c = (a + b) / 2;
  k.box(c, 0, ZF + D, b - a, 0.9, 0.2, BLANCO);
  k.block(c, ZF + D, b - a, 0.2);
  for (const s of [a + 0.1, b - 0.1]) k.box(s, 0, ZF + D / 2, 0.2, 0.9, D, BLANCO);
  k.box(cancela, 0.05, ZF + D + 0.02, 1.0, 1.0, 0.05, color);
  for (let x = cancela - 0.4; x <= cancela + 0.41; x += 0.13) k.box(x, 0.95, ZF + D + 0.02, 0.04, 0.2, 0.04, color);
  for (const s of [cancela - 0.6, cancela + 0.6]) k.box(s, 0, ZF + D, 0.22, 1.25, 0.22, BLANCO);
}

/** una casa de la fila, del tipo que sea */
function casa(k, a, L, tipo) {
  const b = a + L, c = (a + b) / 2;
  if (tipo === 'A') {
    patio(k, a, b, a + 2.4, VERDE);
    for (const s of [a + 2.0, a + 3.2]) k.pic(s, 1.15, ZF + 0.012, 0.9, 2.2, 0, 1, canvasTex(36, 88, puertaVerde));
    for (const s of [a + 0.9, b - 2.2, b - 1.0]) k.pic(s, 1.6, ZF + 0.012, 0.9, 1.0, 0, 1, canvasTex(36, 40, ventanaVerde));
    k.box(c, 3.0, ZF + 0.45, L - 0.6, 0.18, 0.9, BLANCO);
    k.box(c, 3.95, ZF + 0.88, L - 0.6, 0.05, 0.05, VERDE);
    for (let s = a + 0.4; s < b - 0.3; s += 0.14) k.box(s, 3.18, ZF + 0.88, 0.03, 0.77, 0.03, VERDE);
    for (const s of [a + 2.0, b - 2.0]) k.pic(s, 4.2, ZF + 0.012, 1.0, 1.2, 0, 1, canvasTex(40, 48, ventanaVerde));
  } else if (tipo === 'B') {
    patio(k, a, b, a + 3.0, MADERA);
    k.pic(a + 1.2, 1.15, ZF + 0.012, 0.9, 2.2, 0, 1, canvasTex(36, 88, lamas('#2a7a3e')));
    k.pic(a + 3.0, 1.15, ZF + 0.012, 1.0, 2.1, 0, 1, canvasTex(40, 84, ventanaMadera));
    for (const s of [a + 4.6, b - 1.2]) k.pic(s, 1.6, ZF + 0.012, 0.9, 1.0, 0, 1, canvasTex(36, 40, ventanaMadera));
    k.box(c, 3.0, ZF + 0.45, L - 1.2, 0.18, 0.9, BLANCO);
    k.pic(c, 3.45, ZF + 0.9, L - 1.2, 0.55, 0, 1, canvasTex(Math.round((L - 1.2) * 40), 22, celosia));
    k.pic(a + 1.8, 4.2, ZF + 0.012, 1.0, 1.0, 0, 1, canvasTex(40, 40, lamas('#5a3a2a')));
    k.pic(b - 1.8, 4.2, ZF + 0.012, 1.0, 1.0, 0, 1, canvasTex(40, 40, ventanaVerde));
  } else if (tipo === 'C') {
    // el cuerpo de delante de una planta con las ventanas blancas de tres hojas, y la torre de la escalera
    k.box(c - 1.2, 0, ZF + 0.55, L - 2.6, 3.4, 1.1, BLANCO);
    k.block(c - 1.2, ZF + 0.55, L - 2.6, 1.1);
    for (const s of [a + 1.6, a + 4.0]) k.pic(s, 1.6, ZF + 1.12, 1.3, 1.0, 0, 1, canvasTex(52, 40, ventanaBlanca));
    k.box(b - 1.2, 0, ZF + 0.02, 1.0, 2.2, 0.05, 0x8a8a88);
    k.box(b - 1.2, 0, ZF + 0.6, 1.4, 0.8, 0.8, 0xe8e8e4);
    for (const s of [b - 1.6, b - 0.9]) k.box(s, 0.45, ZF + 1.02, 0.6, 0.4, 0.06, 0xd8d8d4);
    k.box(b - 1.2, H, ZF + 0.15, 2.4, HT - H, 0.3, BLANCO);
    for (const y of [3.6, 6.6]) k.pic(b - 1.2, y + 0.7, ZF + 0.31, 0.6, 1.3, 0, 1, canvasTex(24, 52, ventanaBlanca));
  } else {
    // la pared ciega con la ventana de arco de lamas y el cuarto acristalado de la azotea
    k.pic(a + 2.2, 1.9, ZF + 0.012, 1.3, 2.2, 0, 1, canvasTex(52, 88, arco));
    patio(k, a + 4.2, b, a + 5.6, BLANCO);
    for (let s = a + 4.6; s < b - 0.2; s += 0.32) k.cyl(s, 0.9, ZF + 1.2, 0.07, 0.09, 0.5, 0xf6f6f2, { seg: 6 });
    k.pic(b - 1.4, 1.6, ZF + 0.012, 0.9, 1.0, 0, 1, canvasTex(36, 40, ventanaVerde));
    k.pic(a + 5.6, 4.2, ZF + 0.012, 0.9, 1.0, 0, 1, canvasTex(36, 40, ventanaMadera));
    k.box(a + 2.6, H, ZF - 0.9, 4.4, 2.2, 2.0, 0xe8ecee, { list: k.glass });
    k.box(a + 2.6, H + 2.2, ZF - 0.9, 4.6, 0.1, 2.1, 0xf2f2ee);
    for (let s = a + 0.4; s <= a + 4.81; s += 1.1) k.box(s, H, ZF + 0.08, 0.06, 2.2, 0.06, 0xf2f2ee);
    k.box(a + 2.6, H + 0.9, ZF + 0.08, 4.4, 0.06, 0.06, 0xf2f2ee);
  }
}

/** la fila entera: la pared encalada, las casas, la torre del norte, los cables y las letras */
function fila(k) {
  const L = M.len;
  k.box(L / 2, 0, Z + 0.15, L, H, 0.3, BLANCO);
  k.block(L / 2, Z + 0.15, L, 0.3);
  k.pic(L / 2, H / 2, ZF + 0.003, L, H, 0, 1, canvasTex(Math.round(L * 10), 64, cal));
  k.box(L / 2, H - 0.12, ZF + 0.05, L, 0.12, 0.1, 0xe8e8e4);
  for (const [a, w, t] of CASAS) casa(k, a, w, t);
  // los cables negros corridos por lo alto, con sus combas
  for (let s = 0; s < L - 3; s += 6) k.box(s + 3, H - 0.6 - (s % 12 ? 0.15 : 0), ZF + 0.04, 6, 0.03, 0.03, 0x1a1a1a);
  // las letras gastadas del Instituto Social de la Marina, en lo alto de la casa del sur
  k.pic(L - 6.5, H - 0.9, ZF + 0.01, 10.5, 0.55, 0, 1, canvasTex(630, 33, letras));
}

/** se monta con lo demás de Valterra */
export function buildCasasMarina(scene, colliders, map) {
  if (!map?.casasMarina) return null;
  const k = new Kit();
  fila(k);
  const group = enMarco(k, M, 'casasMarina', colliders);
  scene.add(group);
  return { group };
}
