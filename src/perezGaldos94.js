import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';

/**
 * La cara de Pérez Galdós (números 91 a 95) de la manzana de la esquina de Cáceres con Clavijo y Fajardo, enfrente del
 * centro de salud, con las vistas de la calle de Google de julio de 2025 (solo se miran, no van dentro del juego; la
 * gente no se pone). Va después de la esquina de Cáceres, que ya pone el bloque a 9,6 m. Del norte hacia Cáceres: el
 * bloque de pisos blanco de bajo y dos plantas, con el remate escalonado por tramos, los cuerpos de balcones que
 * salen con la losa y los balaustres blancos, las ventanas de persiana de lamas blanca, los portales metidos con la
 * puerta blanca de cristal, las rejillas de abajo y el número 94; y en la esquina de Cáceres, el edificio amarillo que
 * da la vuelta, con el bajo de piedra gris, los dos escaparates de cristal verdoso, la puerta de cristal, la
 * plataforma con la barandilla de tubo y, arriba, las ventanas de persiana blanca y las de barrotes.
 */

// la cara de Pérez Galdós del bloque, del norte (s 0) a la esquina de Cáceres, N hacia la calle (al oeste)
const M = marco([549.6, -562.85], [517.8, -507.23]);
const Z = 0.12, ZF = Z + 0.3, H = 9.6, YB = 3.6, BLANCO = 0xf2f2ee, AMARILLO = 0xe2c27a;
// donde empieza el amarillo de la esquina, y los tramos del bloque blanco (cada uno con su portal y su cuerpo de balcones)
const AM0 = 52;
const TRAMOS = [0, 13, 26, 39];

/** antes de levantar la ciudad: solo la marca (la altura del bloque la pone la esquina de Cáceres) */
export function tunePerezGaldos94(map) {
  if (!map?.esquinaCaceres) return;
  map.perezGaldos94 = true;
}

// ——— lo que se pinta en lienzo ———

/** la ventana de persiana de lamas blanca, de dos o tres hojas */
function persiana(hojas) {
  return (g, w, h) => {
    g.fillStyle = '#f4f4f0';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#b4b4b0';
    for (let y = 5; y < h - 4; y += 5) g.fillRect(4, y, w - 8, 1.5);
    g.fillStyle = '#d4d4d0';
    for (let i = 1; i < hojas; i++) g.fillRect((w * i) / hojas - 1.5, 0, 3, h);
    g.strokeStyle = '#dcdcd8';
    g.lineWidth = 3;
    g.strokeRect(1.5, 1.5, w - 3, h - 3);
  };
}

/** el chapado de piedra gris oscura del bajo del amarillo */
function piedra(g, w, h) {
  g.fillStyle = '#5a5c5e';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(40,40,42,.6)';
  g.lineWidth = 1.5;
  const fila = h / 9;
  for (let y = 0, i = 0; y < h; y += fila, i++) {
    g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke();
    for (let x = (i % 2) * 22; x < w; x += 44) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + fila); g.stroke(); }
  }
}

/** el escaparate de cristal verdoso con el marco blanco */
function verdoso(g, w, h) {
  g.fillStyle = '#3e6a66';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(210,235,230,.15)';
  g.fillRect(w * 0.1, 0, w * 0.25, h);
  g.strokeStyle = '#e8e8e4';
  g.lineWidth = 5;
  g.strokeRect(2.5, 2.5, w - 5, h - 5);
}

/** la ventana de barrotes blancos de arriba del amarillo */
function barrotes(g, w, h) {
  g.fillStyle = '#3a4248';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#f2f2ee';
  g.lineWidth = 3;
  g.strokeRect(1.5, 1.5, w - 3, h - 3);
  for (let x = 5; x < w; x += 6) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
}

const ventanaBalcon = cristales('#e4e4e0', 3, 'rgba(230,226,215,.45)');
const puerta = cristales('#f2f2ee', 1, 'rgba(210,214,216,.3)');

// ——— las piezas ———

/** un tramo de 13 m del bloque blanco: portal, ventanas de persiana, el cuerpo de balcones y el remate */
function tramo(k, t) {
  // el portal metido con la puerta blanca de cristal
  k.box(t + 1.2, 0, ZF + 0.01, 1.6, 2.7, 0.03, 0xd8d8d4);
  k.pic(t + 1.2, 1.25, ZF + 0.03, 1.0, 2.4, 0, 1, canvasTex(40, 96, puerta));
  for (const x of [t + 0.32, t + 2.08]) k.box(x, 0, ZF + 0.25, 0.16, 2.9, 0.5, BLANCO);
  k.box(t + 1.2, 2.75, ZF + 0.25, 1.92, 0.18, 0.5, BLANCO);
  // abajo, las ventanas de persiana de tres hojas y las rejillas
  for (const s of [t + 3.9, t + 6.9, t + 10.4]) k.pic(s, 1.7, ZF + 0.012, 1.7, 1.1, 0, 1, canvasTex(68, 44, persiana(3)));
  k.pic(t + 8.7, 0.35, ZF + 0.012, 1.4, 0.3, 0, 1, canvasTex(56, 12, persiana(1)));
  // el cuerpo de balcones que sale, con sus dos ventanas grandes por planta y los balaustres
  const b0 = t + 5.0, b1 = t + 10.6, bc = (b0 + b1) / 2, BW = b1 - b0;
  k.box(bc, 3.3, ZF + 0.55, BW, H - 3.3 + 0.35, 1.1, BLANCO);
  k.block(bc, ZF + 0.55, BW, 1.1);
  for (const y of [3.6, 6.6]) {
    for (const s of [b0 + 1.4, b1 - 1.4]) {
      k.pic(s, y + 1.2, ZF + 1.12, 2.2, 1.0, 0, 1, canvasTex(88, 40, ventanaBalcon));
      for (let x = s - 0.95; x <= s + 0.96; x += 0.24) k.cyl(x, y, ZF + 1.15, 0.06, 0.08, 0.7, 0xf6f6f2, { seg: 6 });
      k.box(s, y + 0.7, ZF + 1.15, 2.1, 0.08, 0.14, 0xf6f6f2);
    }
  }
  // arriba, las ventanas de persiana de los lados y el remate escalonado
  for (const y of [4.6, 7.4]) for (const s of [t + 3.2, t + 11.8]) k.pic(s, y + 0.6, ZF + 0.012, 1.0, 1.1, 0, 1, canvasTex(40, 44, persiana(2)));
  k.box(t + 2.5, H, ZF, 5.0, 0.2, 0.3, BLANCO);
  k.box(t + 11.8, H, ZF, 2.4, 0.35, 0.3, BLANCO);
}

/** la cara de Pérez Galdós entera */
function fachada(k) {
  const L = M.len;
  // el bloque blanco
  k.box(AM0 / 2, 0, Z + 0.15, AM0, H, 0.3, BLANCO);
  k.block(AM0 / 2, Z + 0.15, AM0, 0.3);
  for (const t of TRAMOS) tramo(k, t);
  k.box(48.5, 2.6, ZF + 0.06, 0.3, 0.2, 0.04, 0x3a3a3a);
  // la papelera verde y la señal de 40 de la acera
  k.cyl(36.8, 0, ZF + 2.4, 0.04, 0.04, 2.3, 0x9a9a98, { seg: 8 });
  k.cyl(36.8, 2.3, ZF + 2.42, 0.28, 0.28, 0.03, 0xc82a2a, { seg: 20, rx: Math.PI / 2 });
  k.cyl(36.8, 2.3, ZF + 2.44, 0.21, 0.21, 0.03, 0xf4f4f2, { seg: 20, rx: Math.PI / 2 });
  // el amarillo de la esquina de Cáceres
  const c = (AM0 + L) / 2, A = L - AM0;
  k.box(c, 0, Z + 0.15, A, H, 0.3, AMARILLO);
  k.block(c, Z + 0.15, A, 0.3);
  k.pic(c, YB / 2, ZF + 0.004, A, YB, 0, 1, canvasTex(Math.round(A * 20), 72, piedra));
  k.box(c, YB, ZF + 0.08, A, 0.3, 0.16, 0xf2f2ee);
  for (const s of [AM0 + 2.4, L - 2.3]) k.pic(s, 1.6, ZF + 0.012, 3.4, 2.7, 0, 1, canvasTex(136, 108, verdoso));
  k.pic(AM0 + 2.4, 2.4, ZF + 0.02, 1.4, 0.5, 0, 1, canvasTex(56, 20, persiana(1)));
  k.pic(AM0 + 5.6, 1.3, ZF + 0.012, 1.4, 2.5, 0, 1, canvasTex(56, 100, cristales('#d8d8d4', 2, 'rgba(200,215,225,.3)')), { glow: 0.1 });
  for (const s of [AM0 + 4.4, AM0 + 7.2]) k.box(s, 3.3, ZF + 0.03, 0.9, 0.2, 0.04, 0xe8e2d4);
  for (const [s, w, tex] of [[AM0 + 1.0, 1.2, barrotes], [AM0 + 3.8, 1.5, barrotes], [AM0 + 6.0, 0.6, barrotes], [AM0 + 9.6, 1.6, barrotes]]) {
    k.pic(s, 5.0, ZF + 0.012, w, 1.1, 0, 1, canvasTex(Math.round(w * 40), 44, tex));
    k.pic(s, 7.8, ZF + 0.012, w, 1.1, 0, 1, canvasTex(Math.round(w * 40), 44, persiana(2)));
  }
  for (const [a, b, h] of [[AM0, AM0 + 4.6, 0.5], [AM0 + 4.6, AM0 + 7.2, 0.2], [AM0 + 7.2, L, 0.5]]) k.box((a + b) / 2, H, ZF, b - a, h, 0.3, 0xd0b06a);
  // la plataforma de la esquina con la barandilla de tubo
  const p0 = AM0 + 4.2;
  k.box((p0 + L) / 2, 0, ZF + 1.0, L - p0, 0.25, 2.0, 0xc8c4bc);
  k.box((p0 + L) / 2, 1.0, ZF + 2.0, L - p0, 0.05, 0.05, 0x9a9a98);
  for (let s = p0; s <= L; s += 1.6) k.box(s, 0.25, ZF + 2.0, 0.05, 0.8, 0.05, 0x9a9a98);
}

/** se monta con lo demás de Valterra */
export function buildPerezGaldos94(scene, colliders, map) {
  if (!map?.perezGaldos94) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, M, 'perezGaldos94', colliders);
  scene.add(group);
  return { group };
}
