import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alturaBloque } from './edificioReal.js';
import { tira, lienzoCorrido, juntarLienzos } from './kitFachada.js';

/**
 * El Palacio de Deportes de Arrecife (calle Seguidilla, Argana Alta), con la vista de la calle de Google de julio de 2025
 * (solo se mira; la gente no se pone). Es una caja alta: el zócalo color arena rosada de placas grandes con una fila de
 * ventanitas cuadradas de marco blanco, la cornisa blanca y encima la chapa gris de nervios verticales con los
 * ventanales altos y estrechos. En la fachada de la calle Seguidilla, las letras azules «PALACIO DE DEPORTES ARRECIFE»
 * sobre la cornisa, la rampa con el muro bajo y la barandilla negra, el zócalo de ladrillo del extremo del este y, en la
 * esquina del oeste, la torre de la escalera de cristal con su retícula de acero.
 * Los otros tres lados no se ven en la foto: llevan el zócalo y la chapa, sin ventanas.
 */

const PLANTA = [[-2014.9, -1761.8], [-1988.8, -1704.1], [-2071.3, -1666.7], [-2097.5, -1724.5]];
const CENTRO = [-2037, -1724];
const H = 16, ZOCALO = 5.5, Z = 0.3;
const AZUL = '#1f3f9e';

export function tunePalacioDeportes(map) {
  if (!alturaBloque(map, CENTRO[0], CENTRO[1], H, [190, 193, 194])) return;
  map.palacioDeportes = true;
}

/** las cuatro caras con N hacia fuera; la de la calle Seguidilla va del oeste (s 0) al este */
function caras() {
  return PLANTA.map((a, i) => {
    const b = PLANTA[(i + 1) % PLANTA.length];
    let M = marco(a, b);
    const mid = M.W(M.len / 2, 0), fuera = M.W(M.len / 2, 1);
    if (Math.hypot(fuera[0] - CENTRO[0], fuera[1] - CENTRO[1]) < Math.hypot(mid[0] - CENTRO[0], mid[1] - CENTRO[1])) M = marco(b, a);
    return M;
  });
}

// ——— lienzos ———

function placas(g, w, h) {
  g.fillStyle = '#d9c1b0';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(150,120,105,.45)';
  g.lineWidth = 1.5;
  const fila = h / 9;
  for (let r = 0; r < 9; r++) {
    const y = r * fila;
    g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke();
    for (let x = (r % 2) * (w / 6); x < w; x += w / 3) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + fila); g.stroke(); }
  }
}

function chapa(g, w, h) {
  const v = g.createLinearGradient(0, 0, 0, h);
  v.addColorStop(0, '#c7cacb');
  v.addColorStop(1, '#b3b7b8');
  g.fillStyle = v;
  g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 8) {
    g.fillStyle = 'rgba(90,96,100,.28)'; g.fillRect(x, 0, 2, h);
    g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x + 2, 0, 1, h);
  }
}

function ventanal(g, w, h) {
  g.fillStyle = '#e9ecec';
  g.fillRect(0, 0, w, h);
  const c = g.createLinearGradient(0, 0, w, h);
  c.addColorStop(0, '#6f8796');
  c.addColorStop(1, '#3d4c57');
  g.fillStyle = c;
  g.fillRect(5, 5, w - 10, h - 10);
  g.fillStyle = '#e9ecec';
  for (let y = h / 4; y < h - 5; y += h / 4) g.fillRect(0, y - 2, w, 4);
}

function cuadrada(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#3a4448';
  g.fillRect(5, 5, w - 10, h - 10);
  g.fillStyle = '#f2f2ee';
  g.fillRect(w / 2 - 2, 5, 4, h - 10);
}

function reticula(g, w, h) {
  g.fillStyle = '#5f7685';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(220,230,235,.22)';
  g.beginPath(); g.moveTo(0, h); g.lineTo(w * 0.5, 0); g.lineTo(w * 0.75, 0); g.lineTo(w * 0.25, h); g.fill();
  g.strokeStyle = '#9aa3a8';
  g.lineWidth = 4;
  for (let x = 0; x <= w; x += w / 4) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y <= h; y += h / 8) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

// ——— piezas ———

function caraLisa(k, L) {
  const zp = Z + 0.01;
  tira(k, 0, L, 0, Z / 2, H, Z, 0xc4c7c8);
  k.block(L / 2, Z / 2, L, Z);
  lienzoCorrido(k, 0, L, 0, ZOCALO, zp, PLACAS);
  lienzoCorrido(k, 0, L, ZOCALO + 0.3, H, zp, CHAPA);
  tira(k, 0, L, ZOCALO, Z + 0.12, 0.3, 0.25, 0xf2f2ee, k.solid);
  tira(k, 0, L, H - 0.35, Z + 0.06, 0.35, 0.12, 0xdcdedd, k.solid);
}

/** la fachada de la calle Seguidilla */
function seguidilla(k, L) {
  const zp = Z + 0.012;
  for (let s = 12; s < L - 3; s += 2.6) k.pic(s, 4.35, zp, 0.85, 0.85, 0, 1, CUADRADA);
  for (let s = 13; s < L - 4; s += 9) k.pic(s, 10.6, zp, 1.5, 8.2, 0, 1, VENTANAL);
  // el zócalo de ladrillo del extremo del este
  tira(k, 72, L, 0, Z + 0.03, 2.4, 0.06, 0x8d4f3f, k.solid);
  // la rampa: el muro bajo y la barandilla negra
  tira(k, 10, 64, 0, Z + 2.2, 0.6, 0.25, 0xe2ddd4, k.solid);
  k.block(37, Z + 2.2, 54, 0.25);
  for (let s = 10; s <= 64; s += 1.5) k.box(s, 0.6, Z + 2.2, 0.05, 0.95, 0.05, 0x1c1c1c);
  tira(k, 10, 64, 1.5, Z + 2.2, 0.05, 0.07, 0x1c1c1c, k.solid);
  // la torre de la escalera, de cristal, en la esquina del oeste
  const t0 = 0, t1 = 7.5, fondo = 3.6, alto = 12.5;
  k.box((t0 + t1) / 2, 0, Z + fondo / 2, t1 - t0, 0.25, fondo, 0x9aa3a8, { list: k.shell });
  k.box((t0 + t1) / 2, alto, Z + fondo / 2, t1 - t0 + 0.2, 0.45, fondo + 0.2, 0xd0d4d6);
  k.pic((t0 + t1) / 2, alto / 2, Z + fondo, t1 - t0, alto, 0, 1, RETICULA, { glow: 0.06 });
  k.pic(t0, alto / 2, Z + fondo / 2, fondo, alto, -1, 0, RETICULA, { glow: 0.06 });
  k.pic(t1, alto / 2, Z + fondo / 2, fondo, alto, 1, 0, RETICULA, { glow: 0.06 });
  k.block((t0 + t1) / 2, Z + fondo / 2, t1 - t0, fondo);
}

/** las letras azules sobre la cornisa: van con fondo transparente, aparte del Kit */
function letras(L) {
  const tex = canvasTex(1536, 96, (g, w, h) => {
    g.fillStyle = AZUL;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `700 ${Math.round(h * 0.82)}px Arial, sans-serif`;
    g.fillText('PALACIO DE DEPORTES ARRECIFE', w / 2, h * 0.54, w * 0.98);
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(22, 1.4), new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.3, roughness: 0.5 }));
  m.position.set(Math.min(L - 12, 54), ZOCALO + 1.15, Z + 0.25);
  return m;
}

let PLACAS, CHAPA, VENTANAL, CUADRADA, RETICULA;

export function buildPalacioDeportes(scene, colliders, map) {
  if (!map?.palacioDeportes) return null;
  PLACAS = canvasTex(160, 180, placas);
  CHAPA = canvasTex(160, 320, chapa);
  VENTANAL = canvasTex(48, 256, ventanal);
  CUADRADA = canvasTex(48, 48, cuadrada);
  RETICULA = canvasTex(128, 256, reticula);
  const lados = caras();
  // la cara de la calle Seguidilla es la que da al sur (la de z mayor)
  const iCalle = lados.reduce((best, M, i) => (M.W(M.len / 2, 0)[1] > lados[best].W(lados[best].len / 2, 0)[1] ? i : best), 0);
  const grupos = lados.map((M, i) => {
    const k = new Kit();
    caraLisa(k, M.len);
    if (i === iCalle) seguidilla(k, M.len);
    juntarLienzos(k);
    const g = enMarco(k, M, 'palacioDeportes' + i, colliders);
    if (i === iCalle) g.add(letras(M.len));
    scene.add(g);
    return g;
  });
  return grupos;
}
