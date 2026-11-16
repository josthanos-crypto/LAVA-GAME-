import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * El Restaurante Casa Víctor, en la esquina de la calle Esperanza con Luis Morote (centro), con la vista de la calle
 * de Google de julio de 2025 (solo se mira, no va dentro del juego; la gente de la foto no se pone): el edificio
 * color ocre con el bajo forrado de placas gris claro y la cornisa gris corrida; en la esquina (que en la foto es
 * un chaflán; en el juego la esquina es viva y la entrada va pegada a ella), la entrada de marco gris oscuro con
 * las puertas de cristal abiertas, el comedor dentro, las dos macetas de aloe y, encima, de esquina, el letrero
 * redondo blanco y negro con «Casa Víctor» y la olla; en la cara de Luis Morote, la otra
 * puerta y la banderola blanca de borde de cuadros rojos; en la cara de la calle Esperanza, el escaparate con los
 * carteles del menú, la placa azul de la calle, la puerta metálica gris y la otra banderola. El bloque se queda
 * como está (se le pone la fachada color ocre); lo de abajo tapa su trozo.
 */

const ESQ = [-70.76, 492.05], ESTE = [-26.94, 467.92], SUR = [-64.6, 534.6];
// la cara de la calle Esperanza (s desde la esquina hacia el sur) y la de Luis Morote (s desde el este; la esquina
// cae en s 50,0)
const ESPERANZA = marco(ESQ, SUR);
const MOROTE = marco(ESTE, ESQ);
const Z = 0.12, ZF = Z + 0.3, PLACA = 0xd4d4d0, OCRE = 0xdcb880, CORNISA = 0x9a9a98, YP = 2.7, YC = 3.3;

/** antes de levantar la ciudad: fuera el rótulo genérico (y su terraza genérica) y la fachada del bloque, ocre */
export function tuneCasaVictor(map) {
  map.casaVictorSign = null;
  const i = (map.signs || []).findIndex(s => /^Casa V.ctor$/.test(s.name));
  if (i >= 0) map.casaVictorSign = map.signs.splice(i, 1)[0];
  const cerca = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.4;
  for (const b of map.buildings || []) {
    const p = b.p || [];
    if (p.some(q => cerca(q, ESQ)) && p.some(q => cerca(q, ESTE))) b.f = [222, 188, 132];
  }
  map.casaVictor = true;
}

// ——— lo que se pinta en lienzo ———

/** las placas gris claro del bajo */
function placas(g, w, h) {
  g.fillStyle = '#d4d4d0';
  g.fillRect(0, 0, w, h);
  let s = 3;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 500; i++) { const v = 190 + r() * 40; g.fillStyle = `rgb(${v},${v},${v - 4})`; g.fillRect(r() * w, r() * h, 2, 2); }
  g.fillStyle = 'rgba(0,0,0,.14)';
  for (let x = 0; x < w; x += w / 4) g.fillRect(x, 0, 2, h);
  for (let y = 0; y < h; y += h / 4) g.fillRect(0, y, w, 2);
}

/** el comedor por la puerta: el suelo de barro, las mesas oscuras y la luz */
function comedor(g, w, h) {
  g.fillStyle = '#3a3230';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8d8b8';
  g.fillRect(w * 0.3, h * 0.05, w * 0.4, h * 0.03);
  g.fillStyle = '#a85a3a';
  g.fillRect(0, h * 0.7, w, h * 0.3);
  g.strokeStyle = 'rgba(0,0,0,.25)';
  for (let x = 0; x < w; x += w / 6) { g.beginPath(); g.moveTo(x, h * 0.7); g.lineTo(x - w * 0.1, h); g.stroke(); }
  g.fillStyle = '#1e1a18';
  for (const x of [0.2, 0.6]) { g.fillRect(w * x, h * 0.5, w * 0.25, h * 0.04); g.fillRect(w * (x + 0.11), h * 0.54, w * 0.03, h * 0.18); }
}

/** el letrero redondo: el aro negro, «Casa Víctor» en letra de mano y la olla humeando */
function redondo(g, w, h) {
  const c = w / 2, r = w * 0.48;
  g.fillStyle = '#dcb880';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#1e1e1e';
  g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#f4f2ec';
  g.beginPath(); g.arc(c, c, r * 0.9, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#1e1e1e';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 700 ${Math.round(w * 0.12)}px "Segoe Script", "Brush Script MT", Georgia, serif`;
  const m = g.measureText('Casa Víctor').width, k = Math.min(1, (r * 1.45) / m);
  g.save(); g.translate(c, c - r * 0.45); g.scale(k, 1); g.fillText('Casa Víctor', 0, 0); g.restore();
  // la olla con su tapa y el humo
  g.beginPath(); g.ellipse(c, c + r * 0.25, r * 0.45, r * 0.3, 0, 0, Math.PI); g.fill();
  g.fillRect(c - r * 0.48, c + r * 0.12, r * 0.96, r * 0.14);
  g.fillRect(c - r * 0.6, c + r * 0.14, r * 0.12, r * 0.06);
  g.fillRect(c + r * 0.48, c + r * 0.14, r * 0.12, r * 0.06);
  g.beginPath(); g.arc(c, c + r * 0.08, r * 0.2, Math.PI, 0); g.fill();
  g.strokeStyle = '#1e1e1e';
  g.lineWidth = w * 0.015;
  for (const d of [-0.15, 0, 0.15]) { g.beginPath(); g.moveTo(c + d * r, c - r * 0.18); g.quadraticCurveTo(c + (d + 0.08) * r, c - r * 0.26, c + d * r, c - r * 0.34); g.stroke(); }
}

/** la banderola blanca de borde de cuadros rojos con el logo y «Comida casera» */
function banderola(g, w, h) {
  g.fillStyle = '#f6f4ee';
  g.fillRect(0, 0, w, h);
  const t = w / 12;
  for (let i = 0; i < 12; i++) for (const [x, y] of [[i * t, 0], [i * t, h - t], [0, i * t], [w - t, i * t]]) {
    if (i % 2 === 0) { g.fillStyle = '#c82a2a'; g.fillRect(x, y, t, t); }
  }
  const c = w / 2;
  g.fillStyle = '#1e1e1e';
  g.beginPath(); g.arc(c, h * 0.38, w * 0.2, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#f6f4ee';
  g.beginPath(); g.arc(c, h * 0.38, w * 0.17, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#1e1e1e';
  g.beginPath(); g.ellipse(c, h * 0.42, w * 0.09, w * 0.06, 0, 0, Math.PI); g.fill();
  g.font = `italic 700 ${Math.round(h * 0.09)}px "Segoe Script", Georgia, serif`;
  g.textAlign = 'center';
  g.fillText('Comida casera', c, h * 0.75);
}

/** los carteles blancos del menú en el escaparate */
function menus(g, w, h) {
  g.fillStyle = '#4a4440';
  g.fillRect(0, 0, w, h);
  for (const [x, y] of [[0.08, 0.1], [0.52, 0.1], [0.08, 0.55], [0.52, 0.55]]) {
    g.fillStyle = '#f6f2e8';
    g.fillRect(w * x, h * y, w * 0.38, h * 0.38);
    g.fillStyle = '#b8b0a0';
    for (let k = 0; k < 6; k++) g.fillRect(w * (x + 0.04), h * (y + 0.06 + k * 0.05), w * 0.3, h * 0.015);
  }
}

// ——— las piezas ———

/** un tramo de bajo: las placas grises, el ocre de encima y la cornisa, con huecos [s0, s1, alto] */
function bajo(k, S0, S1, huecos, pt) {
  let s = S0;
  for (const [a, b, alto] of [...huecos, [S1, S1, 0]]) {
    if (a > s) {
      k.box((s + a) / 2, 0, Z + 0.15, a - s, YP, 0.3, PLACA);
      k.pic((s + a) / 2, YP / 2, ZF + 0.005, a - s, YP, 0, 1, pt);
    }
    if (b > a) k.box((a + b) / 2, alto, Z + 0.15, b - a, YP - alto, 0.3, PLACA);
    s = b;
  }
  k.box((S0 + S1) / 2, YP, Z + 0.15, S1 - S0, YC - YP, 0.3, OCRE);
  k.box((S0 + S1) / 2, YC, Z + 0.15, S1 - S0, 0.22, 0.55, CORNISA);
  k.block((S0 + S1) / 2, Z + 0.15, S1 - S0, 0.3);
}

/** la cara de Luis Morote: el bajo, la otra puerta abierta y la banderola */
function caraMorote(k, pt) {
  bajo(k, 41.0, 50.0, [[44.3, 45.4, 2.4]], pt);
  k.pic(44.85, 1.2, Z + 0.02, 1.1, 2.4, 0, 1, canvasTex(100, 220, comedor), { glow: 0.15 });
  for (const s of [44.3, 45.4]) k.box(s, 0, ZF + 0.01, 0.08, 2.45, 0.06, 0xb8bab8);
  k.box(46.6, 3.0, ZF + 0.3, 0.05, 0.05, 0.6, 0x3a3a3c);
  k.pic(46.6, 2.55, ZF + 0.55, 0.65, 0.75, 1, 0, canvasTex(120, 140, banderola));
  k.pic(46.6, 2.55, ZF + 0.55, 0.65, 0.75, -1, 0, canvasTex(120, 140, banderola));
}

/** la cara de la calle Esperanza: la entrada de la esquina con el letrero redondo, el bajo, el escaparate de los
 * menús, la placa azul, la puerta gris y la banderola */
function caraEsperanza(k, pt) {
  bajo(k, 0, 9.0, [[0.12, 1.5, 2.5], [2.3, 3.4, 0.9], [4.4, 5.6, 2.3]], pt);
  // la entrada: el comedor, el marco gris oscuro, las dos hojas de cristal abiertas y las macetas de aloe
  k.pic(0.81, 1.25, Z + 0.02, 1.38, 2.5, 0, 1, canvasTex(160, 240, comedor), { glow: 0.2 });
  for (const s of [0.16, 1.46]) k.box(s, 0, ZF - 0.05, 0.14, 2.6, 0.2, 0x4a4c50);
  k.box(0.81, 2.45, ZF - 0.05, 1.45, 0.15, 0.2, 0x4a4c50);
  for (const s of [0.32, 1.3]) k.box(s, 0.05, ZF + 0.15, 0.05, 2.35, 0.36, 0x4a4c50);
  for (const s of [-0.05, 1.7]) {
    k.cyl(s, 0, ZF + 0.25, 0.16, 0.12, 0.3, 0xb85a3a, { seg: 10 });
    for (let a = 0; a < 6; a++) k.box(s, 0.3, ZF + 0.25, 0.04, 0.35, 0.12, 0x5a8a4a, { ry: a });
  }
  // el letrero redondo de esquina, mirando hacia el cruce
  k.pic(-0.35, YC + 0.75, ZF + 0.35, 1.0, 1.0, -0.569, 0.822, canvasTex(220, 220, redondo));
  k.box(2.85, 0, Z + 0.15, 1.1, 0.9, 0.3, PLACA);
  k.pic(2.85, 1.6, Z + 0.06, 1.1, 1.4, 0, 1, canvasTex(120, 150, menus));
  for (const y of [0.9, 2.3]) k.box(2.85, y, ZF + 0.01, 1.15, 0.05, 0.06, 0xb8bab8);
  k.box(1.75, 2.0, ZF + 0.02, 0.3, 0.22, 0.03, 0x2a5ab8);
  k.box(2.0, 1.85, ZF + 0.02, 0.14, 0.18, 0.03, 0xe8701e);
  k.box(5.0, 0, Z + 0.1, 1.2, 2.3, 0.06, 0x8a8c8e);
  for (let y = 0.2; y < 2.2; y += 0.2) k.box(5.0, y, Z + 0.14, 1.1, 0.03, 0.02, 0x6a6c6e);
  k.box(1.9, 3.0, ZF + 0.3, 0.05, 0.05, 0.6, 0x3a3a3c);
  k.pic(1.9, 2.55, ZF + 0.55, 0.65, 0.75, 1, 0, canvasTex(120, 140, banderola));
  k.pic(1.9, 2.55, ZF + 0.55, 0.65, 0.75, -1, 0, canvasTex(120, 140, banderola));
}

/** se monta con lo demás de Arrecife Centro: las dos caras de la esquina */
export function buildCasaVictor(scene, colliders, map) {
  if (!map?.casaVictor) return null;
  const pt = canvasTex(160, 120, placas);
  const partes = [];
  for (const [M, nombre, hacer] of [[MOROTE, 'casaVictorMorote', caraMorote], [ESPERANZA, 'casaVictorEsperanza', caraEsperanza]]) {
    const k = new Kit();
    hacer(k, pt);
    const group = enMarco(k, M, nombre, colliders);
    scene.add(group);
    partes.push(group);
  }
  return { partes };
}
