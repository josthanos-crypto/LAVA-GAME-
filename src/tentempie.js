import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';
import { ZF, BLANCO, MARRON_OSC, pared, tira } from './rapadurasSur.js';

/**
 * La Hamburguesería Tentempié, en la esquina de la calle Granada con la calle Virgilio Cabrera (Altavista), con la vista
 * de la calle de Google de julio de 2025 (Granada 36; las fotos del sitio son solo de la comida; solo se miran, no van
 * dentro del juego). En el mapa la esquina era parte del bloque genérico de 9 m de toda la manzana. De verdad es una casa
 * rosa de dos plantas: abajo, la terraza cerrada con la lona crema y las ventanas de plástico, la puerta de madera y los
 * toldos marrones; arriba, el balcón de barandilla de madera oscura en aspa, las persianas marrones y el aparato del
 * aire; por Virgilio Cabrera, la barandilla negra de la acera. Como en la foto no se ve el nombre, no se le pone rótulo.
 */

// la esquina del bloque del mapa y los dos lados de la casa: 13,5 m por Granada y 19 m por Virgilio Cabrera
const ESQ = [125.18, -1575.05];
const UN = [0.1606, -0.987], UE = [0.987, 0.1606];
const POR_GRANADA = 13.5, POR_VIRGILIO = 19.0, ALTO = 6.5;
const Y = [ESQ[0] + UN[0] * POR_GRANADA, ESQ[1] + UN[1] * POR_GRANADA];
const X = [ESQ[0] + UE[0] * POR_VIRGILIO, ESQ[1] + UE[1] * POR_VIRGILIO];
const DENTRO = [X[0] + UN[0] * POR_GRANADA, X[1] + UN[1] * POR_GRANADA];
// la cara de Granada (s del norte a la esquina; N al oeste) y la de Virgilio Cabrera (s de la esquina al este; N al sur)
const CG = marco(Y, ESQ);
const CV = marco(ESQ, X);
const ROSA = 0xe9c3b5;

/** antes de levantar la ciudad: la esquina sale del bloque de 9 m y va como casa propia de dos plantas */
export function tuneTentempie(map) {
  if (!Array.isArray(map?.buildings)) return;
  const cerca = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.05;
  const r = q => [+q[0].toFixed(2), +q[1].toFixed(2)];
  const b = map.buildings.find(q => !q.skip && !q.edificioReal && Array.isArray(q.p) && q.p.some(p => cerca(p, ESQ)));
  if (!b) return;
  const i = b.p.findIndex(p => cerca(p, ESQ));
  b.p.splice(i, 1, r(X), r(DENTRO), r(Y));
  if (i === 0) b.p[b.p.length - 1] = r(X).slice();
  const casa = [ESQ, X, DENTRO, Y].map(r);
  casa.push(casa[0].slice());
  map.buildings.push({ p: casa, h: ALTO, k: 'gen', s: 0, f: [233, 195, 181], c: [206, 202, 194], edificioReal: true });
  map.tentempie = true;
}

/** la barandilla de madera oscura en aspa */
function aspas(g, w, h) {
  g.fillStyle = 'rgba(0,0,0,0)';
  g.clearRect(0, 0, w, h);
  g.fillStyle = '#e9c3b5';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#3a2a22';
  g.lineWidth = Math.max(4, h * 0.08);
  g.strokeRect(2, 2, w - 4, h - 4);
  const n = Math.max(1, Math.round(w / h));
  for (let i = 0; i < n; i++) {
    const x0 = (w / n) * i, x1 = (w / n) * (i + 1);
    g.beginPath(); g.moveTo(x0, 0); g.lineTo(x1, h); g.moveTo(x1, 0); g.lineTo(x0, h); g.stroke();
    g.beginPath(); g.moveTo(x1, 0); g.lineTo(x1, h); g.stroke();
  }
}

/** la persiana marrón de lamas */
function persiana(g, w, h) {
  g.fillStyle = '#6a4430';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#4e3122';
  g.lineWidth = 2;
  for (let y = 4; y < h; y += 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** la puerta de madera con el cristal arriba */
function puertaMadera(g, w, h) {
  g.fillStyle = '#6a4a32';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#2a2a2c';
  g.fillRect(w * 0.15, h * 0.08, w * 0.7, h * 0.42);
  g.strokeStyle = '#4e3122';
  g.lineWidth = 3;
  g.strokeRect(w * 0.15, h * 0.58, w * 0.7, h * 0.34);
}

/** la lona crema de la terraza, con las ventanas de plástico */
function lona(g, w, h) {
  g.fillStyle = '#e8dcc0';
  g.fillRect(0, 0, w, h);
  const n = Math.max(1, Math.round(w / (h * 1.2)));
  for (let i = 0; i < n; i++) {
    const x0 = (w / n) * i + w * 0.03, ww = w / n - w * 0.06;
    g.fillStyle = 'rgba(150,170,185,0.85)';
    g.fillRect(x0, h * 0.12, ww, h * 0.48);
    g.fillStyle = 'rgba(255,255,255,0.25)';
    g.fillRect(x0 + ww * 0.1, h * 0.14, ww * 0.15, h * 0.44);
  }
}

/** la cara de la calle Granada, con la terraza cerrada */
function caraGranada(k) {
  const L = CG.len;
  pared(k, 0, L, ALTO, (g, w, h) => { g.fillStyle = '#e9c3b5'; g.fillRect(0, 0, w, h); });
  k.box(L / 2, ALTO, ZF - 0.12, L, 0.5, 0.24, ROSA);
  k.box(L / 2, ALTO + 0.5, ZF - 0.1, L + 0.04, 0.06, 0.3, 0xdcd0c8);
  // abajo: la puerta de madera, la cristalera de dentro y los toldos marrones
  hueco(k, 9.0, 0, 1.0, 2.3, canvasTex(60, 138, puertaMadera), { borde: 0x4e3122, z: ZF });
  hueco(k, 4.5, 0.4, 3.2, 2.0, canvasTex(192, 120, cristales('#f2f2ee', 3, 'rgba(70,60,50,.35)')), { borde: 0xf2f2ee, z: ZF });
  for (const [s, w] of [[4.5, 3.6], [9.6, 2.6]]) {
    k.box(s, 2.75, ZF + 0.35, w, 0.08, 0.7, 0x8a5a2a);
    k.box(s, 2.55, ZF + 0.7, w, 0.25, 0.04, 0x8a5a2a);
  }
  // la terraza cerrada con la lona, de la esquina hacia el norte
  const t0 = 1.0, t1 = L - 0.2, fondo = 2.4;
  k.pic((t0 + t1) / 2, 1.1, ZF + fondo, t1 - t0, 2.2, 0, 1, canvasTex(Math.round((t1 - t0) * 40), 88, lona));
  k.box((t0 + t1) / 2, 0, ZF + fondo - 0.03, t1 - t0, 2.2, 0.04, 0xe8dcc0);
  for (const s of [t0, t1]) k.pic(s, 1.1, ZF + fondo / 2, fondo, 2.2, s === t0 ? -1 : 1, 0, canvasTex(96, 88, lona));
  for (const s of [t0, t1]) k.box(s, 0, ZF + fondo / 2, 0.04, 2.2, fondo, 0xe8dcc0);
  k.box((t0 + t1) / 2, 2.2, ZF + fondo / 2, t1 - t0 + 0.1, 0.12, fondo + 0.05, 0xd8ccb0);
  k.block((t0 + t1) / 2, ZF + fondo / 2, t1 - t0, fondo);
  // arriba: el balcón de barandilla en aspa, las persianas y el aparato del aire
  k.box(L / 2, 3.15, ZF + 0.5, L - 1.0, 0.15, 1.0, 0xf2f2ee);
  k.pic(L / 2, 3.75, ZF + 0.99, L - 1.0, 0.9, 0, 1, canvasTex(Math.round((L - 1) * 40), 36, aspas));
  for (const s of [2.5, 6.5, 10.5]) hueco(k, s, 3.5, 1.2, 1.9, canvasTex(72, 114, persiana), { borde: MARRON_OSC, z: ZF });
  k.box(8.4, 4.3, ZF + 0.18, 0.8, 0.55, 0.3, 0xe8e8e4);
}

/** la cara de la calle Virgilio Cabrera, con la barandilla negra de la acera */
function caraVirgilio(k) {
  const L = CV.len;
  pared(k, 0, L, ALTO, (g, w, h) => { g.fillStyle = '#e9c3b5'; g.fillRect(0, 0, w, h); });
  k.box(L / 2, ALTO, ZF - 0.12, L, 0.5, 0.24, ROSA);
  for (const s of [3.0, 9.0, 15.0]) {
    hueco(k, s, 1.0, 1.2, 1.2, canvasTex(72, 72, persiana), { borde: MARRON_OSC, z: ZF });
    hueco(k, s, 3.8, 1.2, 1.2, canvasTex(72, 72, persiana), { borde: MARRON_OSC, z: ZF });
  }
  hueco(k, 12.0, 0, 1.0, 2.2, canvasTex(60, 132, puertaMadera), { borde: 0x4e3122, z: ZF });
  // la barandilla negra de la acera, en la esquina
  const b0 = 0.3, b1 = 5.5, zb = 2.8;
  for (const y of [0.15, 1.0]) k.box((b0 + b1) / 2, y, zb, b1 - b0, 0.05, 0.05, 0x1e1e20);
  for (let s = b0; s <= b1 + 0.01; s += 0.14) k.box(s, 0.15, zb, 0.025, 0.85, 0.025, 0x1e1e20);
  for (const s of [b0, b1]) k.box(s, 0, zb, 0.06, 1.05, 0.06, 0x1e1e20);
  k.block((b0 + b1) / 2, zb, b1 - b0, 0.1);
}

/** se monta con lo demás */
export function buildTentempie(scene, colliders, map) {
  if (!map?.tentempie) return null;
  const kg = new Kit(), kv = new Kit();
  caraGranada(kg);
  caraVirgilio(kv);
  const grupos = [enMarco(kg, CG, 'tentempieGranada', colliders), enMarco(kv, CV, 'tentempieVirgilio', colliders)];
  // las medianeras lisas de los vecinos de 9 m que asoman por encima de la casa
  grupos.push(tira(DENTRO, X, 9, 'tentempieMedianeraEste', colliders));
  grupos.push(tira(Y, DENTRO, 9, 'tentempieMedianeraNorte', colliders));
  for (const g of grupos) scene.add(g);
  return { grupos };
}
