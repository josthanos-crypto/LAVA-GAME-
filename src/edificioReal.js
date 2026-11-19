import * as THREE from 'three';
import { canvasTex } from './interiorKit.js';

/**
 * Lo que hace falta para que el edificio de encima de un local sea como el de la foto, no solo el bajo: levantarlo a
 * su altura de verdad dentro del mapa (si es más alto que el bloque) y pintarle las plantas de arriba con sus
 * ventanas, sus galerías cerradas, sus balcones y la barandilla de la azotea. Todo en el marco de la fachada de la
 * pieza (s a lo largo, z hacia la calle, y hacia arriba), como lo demás del Kit.
 */

/**
 * Levanta el edificio a su altura de verdad: un bloque propio de s0 a s1, con `fondo` metros hacia dentro, que el
 * juego dibuja con su color y su azotea. Va encima del bloque del mapa (que es más bajo): la fachada de delante la
 * tapa la pieza y por los lados se ve la medianera que sobresale, como en la calle.
 */
export function alzarEdificio(map, M, s0, s1, fondo, h, f, c = [214, 210, 202]) {
  if (!Array.isArray(map?.buildings)) return;
  const p = [M.W(s0, 0), M.W(s1, 0), M.W(s1, -fondo), M.W(s0, -fondo)].map(q => [+q[0].toFixed(2), +q[1].toFixed(2)]);
  p.push(p[0].slice());
  map.buildings.push({ p, h, k: 'gen', s: 0, f, c, edificioReal: true });
}

/** la pared lisa de las plantas de arriba, de y0 a y1 */
export function paredAlta(k, s0, s1, y0, y1, Z, hex) {
  k.box((s0 + s1) / 2, y0, Z + 0.15, s1 - s0, y1 - y0, 0.3, hex);
  k.block((s0 + s1) / 2, Z + 0.15, s1 - s0, 0.3);
}

/** cristales de ventana con el visillo y el reflejo, con la carpintería del color que se diga */
export function cristales(carpinteria = '#f2f2ee', hojas = 2, visillo = 'rgba(230,226,215,.55)') {
  return (g, w, h) => {
    const cielo = g.createLinearGradient(0, 0, 0, h);
    cielo.addColorStop(0, '#5a6a78');
    cielo.addColorStop(1, '#2e363e');
    g.fillStyle = cielo;
    g.fillRect(0, 0, w, h);
    g.fillStyle = visillo;
    g.fillRect(0, 0, w, h * 0.55);
    g.fillStyle = 'rgba(255,255,255,.13)';
    g.beginPath(); g.moveTo(0, h); g.lineTo(w * 0.35, 0); g.lineTo(w * 0.55, 0); g.lineTo(w * 0.2, h); g.fill();
    g.strokeStyle = carpinteria;
    g.lineWidth = Math.max(3, w * 0.04);
    g.strokeRect(1.5, 1.5, w - 3, h - 3);
    for (let i = 1; i < hojas; i++) { const x = (w / hojas) * i; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  };
}

/** una ventana metida en la pared, con su alféizar y, si se pide, la reja o la persiana */
export function ventana(k, s, y, w, h, Z, { carpinteria = '#f2f2ee', hojas = 2, alfeizar = 0xe8e4dc, persiana = 0 } = {}) {
  const zf = Z + 0.3;
  k.pic(s, y + h / 2, zf + 0.008, w, h, 0, 1, canvasTex(Math.round(w * 60), Math.round(h * 60), cristales(carpinteria, hojas)));
  k.box(s, y - 0.06, zf + 0.04, w + 0.16, 0.06, 0.12, alfeizar);
  if (persiana) {
    k.box(s, y + h - persiana, zf + 0.015, w, persiana, 0.02, 0xd8d4c8);
  }
}

/**
 * Una galería cerrada (el balcón cerrado con aluminio de los edificios de Arrecife): la losa, el peto de barrotes
 * blancos tumbados, las ventanas correderas encima y la losa de arriba, saliendo `sale` metros de la pared.
 */
export function galeria(k, s0, s1, y, Z, { sale = 0.7, alto = 2.6, color = 0xf4f4f0, peto = 'barrotes' } = {}) {
  const zf = Z + 0.3, c = (s0 + s1) / 2, w = s1 - s0, zc = zf + sale / 2;
  k.box(c, y - 0.12, zc, w + 0.1, 0.14, sale + 0.05, 0xe8e4dc);
  k.box(c, y + alto, zc, w + 0.1, 0.12, sale + 0.05, 0xe8e4dc);
  for (const t of [s0, s1]) k.box(t, y, zc, 0.08, alto, sale, color);
  // el peto: barrotes tumbados blancos o una pared baja
  const zp = zf + sale;
  if (peto === 'barrotes') {
    for (let i = 0; i < 6; i++) k.box(c, y + 0.08 + i * 0.15, zp, w, 0.06, 0.05, color);
    k.box(c, y, zp - 0.02, w, 0.95, 0.02, 0x9aa0a6);
  } else {
    k.box(c, y, zp - 0.04, w, 0.95, 0.1, color);
  }
  // las correderas de cristal de encima
  const n = Math.max(2, Math.round(w / 0.9));
  k.pic(c, y + 0.95 + (alto - 0.95) / 2, zp + 0.01, w - 0.1, alto - 0.95, 0, 1, canvasTex(Math.round(w * 50), Math.round((alto - 0.95) * 50), cristales('#f4f4f0', n)));
  // los costados de cristal
  for (const t of [s0 + 0.04, s1 - 0.04]) {
    const lado = new THREE.PlaneGeometry(sale - 0.05, alto - 0.95);
    lado.rotateY(t < c ? -Math.PI / 2 : Math.PI / 2);
    lado.translate(t + (t < c ? -0.045 : 0.045), y + 0.95 + (alto - 0.95) / 2, zc);
    k.pics.push({ geo: lado, tex: canvasTex(40, 60, cristales('#f4f4f0', 1)), glow: 0 });
  }
  k.block(c, zc, w, sale);
}

/** la barandilla blanca de barrotes de la azotea, en el borde de la fachada */
export function barandillaAzotea(k, s0, s1, y, Z, color = 0xf4f4f0) {
  const zf = Z + 0.3, c = (s0 + s1) / 2;
  k.box(c, y, Z + 0.15, s1 - s0, 0.25, 0.3, 0xe8e4dc);
  k.box(c, y + 1.0, zf - 0.1, s1 - s0, 0.06, 0.08, color);
  for (let s = s0 + 0.05; s <= s1; s += 0.14) k.box(s, y + 0.25, zf - 0.1, 0.04, 0.75, 0.04, color);
}

/** un aparato del aire acondicionado colgado de la fachada */
export function aire(k, s, y, Z) {
  const zf = Z + 0.3;
  k.box(s, y, zf + 0.16, 0.8, 0.55, 0.3, 0xe8e8e4);
  const v = new THREE.CylinderGeometry(0.18, 0.18, 0.02, 16);
  v.rotateX(Math.PI / 2);
  v.translate(s - 0.1, y + 0.27, zf + 0.32);
  k.add(v, 0x7a7a78);
}

/**
 * La medianera lisa de un costado que asoma por encima del vecino (el juego le pinta ventanas a todas las caras del
 * bloque, y las paredes de los lados no las tienen): de y0 a y1, `fondo` metros hacia dentro desde la fachada.
 */
export function medianera(k, s, y0, y1, fondo, Z, hex = 0xe8e6e0) {
  k.box(s, y0, Z + 0.3 - fondo / 2, 0.12, y1 - y0, fondo + 0.02, hex);
}

/**
 * Pone a su altura de verdad (y, si se da, a su color) el bloque del mapa en el que cae el punto (x, z), cuando la
 * manzana entera es más baja o más alta que lo que trae el mapa. Devuelve el bloque, o null si no lo encuentra.
 */
export function alturaBloque(map, x, z, h, f) {
  const dentro = (p) => {
    let c = false;
    for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
      const [ax, az] = p[i], [bx, bz] = p[j];
      if ((az > z) !== (bz > z) && x < ax + ((z - az) * (bx - ax)) / (bz - az)) c = !c;
    }
    return c;
  };
  const b = (map?.buildings || []).find(q => !q.skip && !q.edificioReal && Array.isArray(q.p) && dentro(q.p));
  if (!b) return null;
  b.h = h;
  if (f) b.f = f;
  return b;
}

/**
 * Rebaja un tramo de la fachada cuando la casa de verdad es más baja que el bloque del mapa y los vecinos sí son
 * altos: al bloque se le hace una muesca de s0 a s1 y `fondo` metros hacia dentro (la fachada del marco M tiene que
 * ser un lado entero del bloque, de M.W(0, 0) a M.W(M.len, 0)), y en la muesca va una casa propia de altura h y
 * color f. Devuelve true si lo ha hecho.
 */
export function rebajarTramo(map, M, s0, s1, fondo, h, f, c = [214, 210, 202]) {
  const cerca = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.05;
  const A = M.W(0, 0), B = M.W(M.len, 0);
  const r = q => [+q[0].toFixed(2), +q[1].toFixed(2)];
  for (const b of map?.buildings || []) {
    if (b.skip || !Array.isArray(b.p)) continue;
    const n = b.p.length;
    for (let i = 0; i < n - 1; i++) {
      const p = b.p[i], q = b.p[i + 1];
      let muesca;
      if (cerca(p, A) && cerca(q, B)) muesca = [M.W(s0, 0), M.W(s0, -fondo), M.W(s1, -fondo), M.W(s1, 0)];
      else if (cerca(p, B) && cerca(q, A)) muesca = [M.W(s1, 0), M.W(s1, -fondo), M.W(s0, -fondo), M.W(s0, 0)];
      else continue;
      b.p.splice(i + 1, 0, ...muesca.map(r).filter(m => !cerca(m, p) && !cerca(m, q)));
      const casa = [M.W(s0, 0), M.W(s1, 0), M.W(s1, -fondo), M.W(s0, -fondo)].map(r);
      casa.push(casa[0].slice());
      map.buildings.push({ p: casa, h, k: 'gen', s: 0, f, c, edificioReal: true });
      return true;
    }
  }
  return false;
}
