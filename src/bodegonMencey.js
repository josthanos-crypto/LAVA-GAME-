import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';
import { ZF, BLANCO, pared, tira } from './rapadurasSur.js';

/**
 * El Bodegón Los Mencey (calle León y Castillo 191, la LZ-1, Altavista) y la casa alta de al lado, con las fotos del
 * sitio de 2021 a 2025 (de dentro: el mural del molino y las pizarras) y las vistas de la calle de Google de julio de
 * 2025 (LZ-1 189, 191 y 193; solo se miran, no van dentro del juego), medidas con el foco bueno de las capturas (475 px).
 * En el mapa era el bloque genérico de 5 m de toda la manzana. De verdad:
 * - la casa alta y estrecha de tres plantas (10,2 y 10,7 m), con las dos ventanas verdes de la izquierda, la blanca de
 *   arriba, el ventanuco y el aparato del aire, y abajo la puerta verde azulada y el azulejo marrón rojizo, que llega
 *   hasta la entrada del bodegón, con la puerta de aluminio del portal, el ventanuco, el buzón y los contadores;
 * - el bodegón, en el bajo de la casa blanca de al lado (9,5 m): la entrada abierta (dentro, las mesas, las sillas de
 *   madera y el mural azul del molino), el toldo marrón claro con el faldón de ondas que sale a la acera, con sus postes,
 *   las mesas de fuera y, arriba, el balcón con la barandilla blanca, las dos puertas de cristal, el letrero de madera
 *   «BODEGÓN LOS MENCEY», la figura de hierro del mencey y el alero grande de arriba.
 */

// la cara de León y Castillo: n hacia el norte desde la esquina sur del bloque del mapa, y la calle al este
const ESQ_S = [396.6, -1409.71], ESQ_N = [409.82, -1490.89];
const UN = [0.16073, -0.987], NE = [0.987, 0.16073];
const P = (n, b = 0) => [ESQ_S[0] + UN[0] * n - NE[0] * b, ESQ_S[1] + UN[1] * n - NE[1] * b];
// la casa alta (en dos tramos de distinta altura) y la del bodegón, medidas en las vistas de la calle
const N0 = 42.85, N1 = 44.46, N2 = 47.4, N3 = 54.4, FONDO = 12;
const ALTO_T1 = 10.22, ALTO_T2 = 10.66, ALTO_B = 9.49;
const F = marco(P(N0), P(N3));
const s = n => n - N0;

/** antes de levantar la ciudad: las dos casas salen del bloque genérico de 5 m */
export function tuneBodegonMencey(map) {
  if (!Array.isArray(map?.buildings)) return;
  const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const r = q => [+q[0].toFixed(2), +q[1].toFixed(2)];
  const b = map.buildings.find(q => !q.skip && !q.edificioReal && Array.isArray(q.p) && q.p.some(p => d(p, ESQ_S) < 0.3) && q.p.some(p => d(p, ESQ_N) < 0.3));
  if (!b) return;
  const iN = b.p.findIndex(p => d(p, ESQ_N) < 0.3);
  const muesca = [P(N3), P(N3, FONDO), P(N0, FONDO), P(N0)].map(r);
  if (b.p[iN + 1] && d(b.p[iN + 1], ESQ_S) < 0.3) b.p.splice(iN + 1, 0, ...muesca);
  else if (iN > 0 && d(b.p[iN - 1], ESQ_S) < 0.3) b.p.splice(iN, 0, ...muesca.reverse());
  else return;
  for (const [n0, n1, h] of [[N0, N1, ALTO_T1], [N1, N2, ALTO_T2], [N2, N3, ALTO_B]]) {
    const p = [P(n0), P(n0, FONDO), P(n1, FONDO), P(n1)].map(r);
    p.push(p[0].slice());
    map.buildings.push({ p, h, k: 'gen', s: 0, f: [242, 242, 238], c: [200, 196, 188], edificioReal: true });
  }
  map.bodegonMencey = true;
}

// ——— las texturas ———

const liso = color => (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); };

/** el azulejo marrón rojizo del bajo de la casa alta */
function azulejo(g, w, h) {
  g.fillStyle = '#5a2e22';
  g.fillRect(0, 0, w, h);
  let sd = 19;
  const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const t = 7;
  for (let y = 0; y < h; y += t) {
    for (let x = 0; x < w; x += t) {
      const k = Math.round(-14 + rnd() * 28);
      g.fillStyle = `rgb(${138 + k},${74 + k / 2},${58 + k / 2})`;
      g.fillRect(x + 0.6, y + 0.6, t - 1.2, t - 1.2);
    }
  }
  g.fillStyle = '#c8b090';
  g.fillRect(0, h * 0.35, w, 1.5);
}

/** el bodegón por dentro: el mural azul del molino, las mesas y las sillas de madera */
function bodegonDentro(g, w, h) {
  g.fillStyle = '#3a2e26';
  g.fillRect(0, 0, w, h);
  // el mural: el cielo azul, el campo, el molino y la gente
  const cielo = g.createLinearGradient(0, h * 0.1, 0, h * 0.5);
  cielo.addColorStop(0, '#4a7ab8');
  cielo.addColorStop(1, '#a8c8e0');
  g.fillStyle = cielo;
  g.fillRect(w * 0.05, h * 0.1, w * 0.9, h * 0.4);
  g.fillStyle = '#c8a870';
  g.fillRect(w * 0.05, h * 0.42, w * 0.9, h * 0.08);
  g.fillStyle = '#3a3a3a';
  g.fillRect(w * 0.66, h * 0.2, w * 0.03, h * 0.24);
  g.strokeStyle = '#3a3a3a';
  g.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + 0.4;
    g.beginPath(); g.moveTo(w * 0.675, h * 0.2); g.lineTo(w * 0.675 + Math.cos(a) * w * 0.08, h * 0.2 + Math.sin(a) * w * 0.08); g.stroke();
  }
  g.fillStyle = '#4a3a5a';
  for (const x of [0.2, 0.27, 0.36]) { g.fillRect(w * x, h * 0.3, w * 0.03, h * 0.14); g.beginPath(); g.arc(w * x + w * 0.015, h * 0.28, w * 0.018, 0, Math.PI * 2); g.fill(); }
  // el suelo de barro, las mesas y las sillas
  g.fillStyle = '#8a5a3a';
  g.beginPath(); g.moveTo(0, h); g.lineTo(w, h); g.lineTo(w * 0.9, h * 0.62); g.lineTo(w * 0.1, h * 0.62); g.closePath(); g.fill();
  g.fillStyle = '#5a3a24';
  for (const x of [0.22, 0.6]) {
    g.fillRect(w * x, h * 0.6, w * 0.2, h * 0.04);
    g.fillRect(w * (x + 0.02), h * 0.64, w * 0.02, h * 0.2);
    g.fillRect(w * (x + 0.16), h * 0.64, w * 0.02, h * 0.2);
  }
  g.fillStyle = '#a8703e';
  for (const x of [0.16, 0.44, 0.54, 0.82]) { g.fillRect(w * x, h * 0.55, w * 0.05, h * 0.3); g.fillRect(w * x, h * 0.68, w * 0.07, h * 0.03); }
}

/** el faldón de ondas del toldo */
function faldon(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c4a08a';
  g.fillRect(0, 0, w, h * 0.55);
  const n = Math.max(4, Math.round(w / (h * 1.2)));
  for (let i = 0; i < n; i++) {
    g.beginPath(); g.arc((w / n) * (i + 0.5), h * 0.55, (w / n) / 2, 0, Math.PI); g.fill();
  }
  g.strokeStyle = '#8a6a58';
  g.lineWidth = 2;
  g.beginPath(); g.moveTo(0, h * 0.12); g.lineTo(w, h * 0.12); g.stroke();
}

/** el letrero de madera del bodegón: «BODEGÓN LOS MENCEY» tallado */
function letreroMadera(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#7a4a2a';
  g.beginPath();
  g.moveTo(w * 0.08, h * 0.1); g.lineTo(w * 0.6, h * 0.02); g.lineTo(w * 0.95, h * 0.2);
  g.lineTo(w * 0.9, h * 0.92); g.lineTo(w * 0.4, h * 0.98); g.lineTo(w * 0.05, h * 0.8); g.closePath();
  g.fill();
  g.strokeStyle = '#5a3418';
  g.lineWidth = 2;
  for (let y = 0.2; y < 0.9; y += 0.15) { g.beginPath(); g.moveTo(w * 0.1, h * y); g.lineTo(w * 0.9, h * (y + 0.03)); g.stroke(); }
  g.fillStyle = '#2a1a0e';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `bold ${Math.round(h * 0.2)}px Georgia, serif`;
  g.fillText('BODEGÓN', w * 0.5, h * 0.28, w * 0.8);
  g.font = `bold ${Math.round(h * 0.16)}px Georgia, serif`;
  g.fillText('LOS', w * 0.5, h * 0.5, w * 0.5);
  g.font = `bold ${Math.round(h * 0.2)}px Georgia, serif`;
  g.fillText('MENCEY', w * 0.5, h * 0.72, w * 0.8);
}

/** una puerta de cuarterones del color que se diga */
function puertaColor(color, linea) {
  return (g, w, h) => {
    g.fillStyle = color;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = linea;
    g.lineWidth = 3;
    for (const [y0, y1] of [[0.06, 0.3], [0.36, 0.6], [0.66, 0.94]]) g.strokeRect(w * 0.15, h * y0, w * 0.7, h * (y1 - y0));
  };
}

/** la puerta de aluminio blanco del portal, con el cristal */
function puertaPortal(g, w, h) {
  g.fillStyle = '#f0f0ec';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#3a4048';
  g.fillRect(w * 0.15, h * 0.08, w * 0.7, h * 0.5);
  g.strokeStyle = '#d8d8d4';
  g.lineWidth = 2;
  g.strokeRect(w * 0.15, h * 0.64, w * 0.7, h * 0.3);
}

/** cristales con la carpintería verde */
function verde(hojas) {
  return cristales('#3a8a4a', hojas, 'rgba(235,232,225,.4)');
}

// ——— las piezas ———

const tx = (w, h, fn) => canvasTex(Math.max(16, Math.min(1024, Math.round(w * 60))), Math.max(16, Math.round(h * 60)), fn);
/** un hueco de n0 a n1 y de y0 a y1 */
const hu = (k, n0, n1, y0, y1, fn, borde, z = ZF + 0.05) => hueco(k, s((n0 + n1) / 2), y0, n1 - n0, y1 - y0, tx(n1 - n0, y1 - y0, fn), { borde, z });
/** una caja pegada a la fachada de n0 a n1 y de y0 a y1, que sale «sale» m */
const caja = (k, n0, n1, y0, y1, sale, color) => k.box(s((n0 + n1) / 2), y0, ZF + sale / 2, n1 - n0, y1 - y0, sale, color);

/** el toldo inclinado del bodegón, con su faldón y sus postes */
function toldo(k, n0, n1) {
  const ySal = 3.95, yFuera = 2.9, sale = 3.0, c = s((n0 + n1) / 2), w = n1 - n0;
  const ang = Math.atan2(ySal - yFuera, sale), largo = Math.hypot(ySal - yFuera, sale);
  const geo = new THREE.BoxGeometry(w, 0.04, largo);
  geo.rotateX(ang);
  geo.translate(c, (ySal + yFuera) / 2, ZF + sale / 2);
  k.add(geo, 0xc4a08a);
  k.box(c, yFuera - 0.5, ZF + sale + 0.02, w, 0.5, 0.02, 0xc4a08a);
  k.pic(c, yFuera - 0.25, ZF + sale + 0.035, w, 0.5, 0, 1, canvasTex(Math.round(w * 40), 20, faldon));
  for (const x of [s(n0) + 0.05, s(n1) - 0.05]) {
    k.box(x, 0, ZF + sale - 0.05, 0.06, yFuera, 0.06, 0x4a3a2e);
    k.block(x, ZF + sale - 0.05, 0.12, 0.12);
  }
  k.box(c, yFuera - 0.05, ZF + sale - 0.05, w, 0.05, 0.05, 0x4a3a2e);
  // las mesas y las sillas de madera de debajo
  for (const x of [s(n0) + 1.5, s(n0) + 3.6]) {
    k.table(x, ZF + 1.6, { w: 0.8, d: 0.8, top: 0xd8d0c0, leg: 0x3a2a20 });
    k.chair(x - 0.62, ZF + 1.6, Math.PI / 2, 0x9a6a3a);
    k.chair(x + 0.62, ZF + 1.6, -Math.PI / 2, 0x9a6a3a);
  }
}

/** la figura de hierro del mencey, hecha de varillas: la cabeza, el manto, el brazo y el bastón */
function mencey(k, n, y, z) {
  const x = s(n), hierro = 0x2a2624, v = (x0, y0, x1, y1) => {
    const L = Math.hypot(x1 - x0, y1 - y0), g = new THREE.CylinderGeometry(0.018, 0.018, L, 5);
    g.rotateZ(-Math.atan2(x1 - x0, y1 - y0));
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, z);
    k.add(g, hierro);
  };
  v(x + 0.32, y, x + 0.32, y + 3.8);
  v(x - 0.1, y + 3.1, x + 0.32, y + 2.9);
  v(x - 0.12, y + 3.2, x - 0.35, y + 0.2);
  v(x + 0.12, y + 3.2, x + 0.22, y + 0.2);
  v(x - 0.35, y + 0.2, x + 0.22, y + 0.2);
  v(x - 0.12, y + 3.2, x + 0.12, y + 3.2);
  k.ball(x, y + 3.45, z, 0.16, hierro, { sx: 0.8, sz: 0.25, seg: 10 });
}

/** la casa alta y estrecha de al lado */
function casaAlta(k) {
  pared(k, s(N0), s(N1), ALTO_T1, liso('#f2f2ee'));
  pared(k, s(N1), s(N2), ALTO_T2, liso('#f2f2ee'));
  // abajo: la puerta verde azulada y el azulejo (hasta la entrada del bodegón) con la puerta del portal, el ventanuco,
  // el buzón y los contadores
  hu(k, 43.33, 44.28, 0, 2.11, puertaColor('#2e6e6a', '#24585a'), 0x24585a, ZF + 0.03);
  caja(k, 44.58, 48.51, 0, 3.17, 0.06, 0x8a4a3a);
  k.pic(s(46.545), 1.585, ZF + 0.062, 48.51 - 44.58, 3.17, 0, 1, tx(48.51 - 44.58, 3.17, azulejo));
  hu(k, 45.37, 46.25, 0, 2.05, puertaPortal, 0xf0f0ec, ZF + 0.07);
  hu(k, 46.26, 46.81, 0.46, 1.48, cristales('#5a3a24', 1), 0x5a3a24, ZF + 0.07);
  caja(k, 46.47, 46.85, 1.58, 2.05, 0.12, 0x8a3a2a);
  for (const n of [45.02, 47.67]) caja(k, n - 0.22, n + 0.22, 0.3, 0.6, 0.12, 0xeaeae6);
  hu(k, 45.42, 46.25, 3.17, 3.6, cristales('#f0f0ec', 1), 0xf0f0ec, ZF + 0.07);
  // arriba: las dos ventanas verdes, la blanca, el aparato del aire y la antena
  for (const [y0, y1] of [[4.13, 5.07], [6.99, 7.96]]) hu(k, 42.87, 43.83, y0, y1, verde(2), 0x3a8a4a, ZF);
  hu(k, 45.32, 46.24, 6.72, 7.66, cristales('#f2f2ee', 2), 0xf2f2ee, ZF);
  caja(k, 46.95, 47.35, 8.84, 9.38, 0.3, 0xe4e4e0);
  caja(k, N0, N1, ALTO_T1 - 0.2, ALTO_T1, 0.1, 0xe8e8e4);
  caja(k, N1, N2, ALTO_T2 - 0.2, ALTO_T2, 0.1, 0xe8e8e4);
  k.cyl(s(47.1), ALTO_T2, ZF - 0.2, 0.02, 0.02, 0.9, 0x6a6a6a, { seg: 5 });
}

/** la casa del bodegón */
function casaBodegon(k) {
  pared(k, s(N2), s(N3), ALTO_B, liso('#f2f2ee'));
  // abajo: la entrada abierta del bodegón
  hu(k, 48.6, 54.2, 0, 3.4, bodegonDentro, 0x5a3a24);
  // arriba: el balcón con la barandilla blanca, las dos puertas de cristal, el letrero de madera y la figura de hierro
  caja(k, 47.73, N3, 3.99, 4.78, 0.6, 0xf4f4f0);
  const zr = ZF + 0.55, a = s(47.75), b = s(N3 - 0.02);
  k.box((a + b) / 2, 5.4, zr, b - a, 0.05, 0.05, BLANCO);
  for (const y of [5.0, 5.2]) k.box((a + b) / 2, y, zr, b - a, 0.03, 0.03, BLANCO);
  for (let x = a; x <= b; x += (b - a) / 8) k.box(x, 4.78, zr, 0.04, 0.65, 0.04, BLANCO);
  for (const [n0, n1] of [[48.58, 49.76], [51.93, 53.12]]) hu(k, n0, n1, 4.8, 6.37, cristales('#f2f2ee', 2), 0xf2f2ee, ZF);
  k.box(s(52.85), 4.0, ZF + 0.66, 1.1, 1.6, 0.05, 0x7a4a2a);
  k.pic(s(52.85), 4.8, ZF + 0.69, 1.1, 1.6, 0, 1, canvasTex(110, 160, letreroMadera));
  mencey(k, 53.7, 4.25, ZF + 0.12);
  // el alero grande de arriba
  caja(k, N2, N3, 7.7, ALTO_B, 0.8, 0xf2f2ee);
}

/** se monta con lo demás */
export function buildBodegonMencey(scene, colliders, map) {
  if (!map?.bodegonMencey) return null;
  const k = new Kit();
  casaAlta(k);
  casaBodegon(k);
  toldo(k, 48.5, 54.35);
  const grupos = [enMarco(k, F, 'bodegonMencey', colliders)];
  // las paredes lisas de los lados y de atrás que asoman por encima de las casas de al lado y del bloque de 5 m
  const lisa = (A, B, alto, nombre) => tira(A, B, alto, nombre, colliders, (kk, L) => pared(kk, 0, L, alto, liso('#ecebe6'), -0.25));
  grupos.push(lisa(P(N0, FONDO), P(N0), ALTO_T1, 'bodegonLadoSur'));
  grupos.push(lisa(P(N2), P(N2, FONDO), ALTO_T2, 'bodegonCasaAltaNorte'));
  grupos.push(lisa(P(N1, FONDO), P(N0, FONDO), ALTO_T1, 'bodegonTraseraAlta1'));
  grupos.push(lisa(P(N2, FONDO), P(N1, FONDO), ALTO_T2, 'bodegonTraseraAlta2'));
  grupos.push(lisa(P(N3, FONDO), P(N2, FONDO), ALTO_B, 'bodegonTrasera'));
  for (const g of grupos) scene.add(g);
  return { grupos };
}
