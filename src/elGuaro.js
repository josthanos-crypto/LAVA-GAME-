import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * El Bar Cafetería El Guaro, en la esquina de la calle Caldera de Bandama con Caldera de Taburiente (Google lo pone en
 * Caldera de Bandama 2), con la vista de la calle de Google de julio de 2025 (solo se mira, no va dentro del juego; la
 * gente no se pone; Google solo tiene fotos de dentro y de los platos): la casa terrera blanca con el zócalo de piedra
 * marrón y el alero blanco grueso; por Taburiente, la entrada con la banda del nombre encima (sin los logotipos del
 * refresco de las puntas), las dos ventanas y la puerta con sus escalones de baldosa roja, la ventana de la reja negra
 * y la antena; los dos letreros grandes de canto en el tejado, con «EL GUARO», «COFFEE BREAK» y «BAR CAFETERIA» y las
 * frutas (sin la marca del refresco); por Bandama, los cajetines de la luz y la rejilla; y delante, la terraza con la
 * barandilla negra, el toldo rojo de «Bar El Guaro» sobre sus postes negros y las mesas y sillas blancas. El bloque
 * del mapa se queda como está; lo de abajo tapa su trozo.
 */

// la cara de Taburiente (s de norte a sur: la esquina de Bandama cae en s 46,1) y la de Bandama (s desde la esquina
// hacia el este); la vista de la calle pone la entrada en s 41,9–45,4 (el mapa no tenía rótulo suyo)
const TAB = marco([-969.94, 244.39], [-984.84, 288.02]);
const BAN = marco([-984.84, 288.02], [-976.07, 291.01]);
const Z = 0.12, ZF = Z + 0.3, YP = 4.0, ESQ = 46.1, BLANCO = 0xf2f2ee, NEGRO = 0x1e1e20, ROJO = 0xc8382a;

/** antes de levantar la ciudad: solo la marca de que se monta (el mapa no tenía rótulo suyo) */
export function tuneElGuaro(map) {
  map.elGuaro = true;
}

// ——— lo que se pinta en lienzo ———

/** la piedra marrón del zócalo, en lajas */
function piedra(g, w, h) {
  g.fillStyle = '#8a6a50';
  g.fillRect(0, 0, w, h);
  let s = 23;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const fila = h / 3;
  for (let y = 0; y < h; y += fila) {
    let x = -r() * 40;
    while (x < w) {
      const l = 40 + r() * 50, v = r();
      g.fillStyle = v < 0.3 ? '#7a5a42' : v < 0.6 ? '#9a7a5a' : v < 0.85 ? '#86664c' : '#a8886a';
      g.fillRect(x + 1, y + 1, l - 2, fila - 2);
      x += l;
    }
  }
  for (let i = 0; i < w * h / 30; i++) { g.fillStyle = r() < 0.5 ? 'rgba(40,25,15,.25)' : 'rgba(220,200,170,.2)'; g.fillRect(r() * w, r() * h, 2, 2); }
}

/** unas frutas y la copa, como en los letreros */
function frutas(g, x, y, r) {
  g.fillStyle = '#f2a02a';
  g.beginPath(); g.arc(x - r * 0.9, y + r * 0.3, r * 0.7, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#f8d878';
  g.beginPath(); g.arc(x - r * 0.9, y + r * 0.3, r * 0.5, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#d82a3a';
  g.beginPath(); g.moveTo(x + r * 0.1, y - r * 0.2); g.quadraticCurveTo(x + r, y - r * 0.6, x + r * 0.7, y + r * 0.6); g.quadraticCurveTo(x + r * 0.2, y + r, x + r * 0.1, y - r * 0.2); g.fill();
  g.fillStyle = '#7ab83a';
  g.beginPath(); g.arc(x, y + r * 0.8, r * 0.5, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3a8a2a';
  g.beginPath(); g.ellipse(x + r * 0.4, y - r * 0.7, r * 0.5, r * 0.2, -0.6, 0, Math.PI * 2); g.fill();
}

/** el letrero grande del tejado: las frutas, «EL GUARO», la cinta verde y «BAR CAFETERIA» */
function letrero(g, w, h) {
  g.fillStyle = '#f6f4ee';
  g.fillRect(0, 0, w, h);
  const naranja = g.createLinearGradient(0, 0, w, 0);
  naranja.addColorStop(0, 'rgba(240,150,60,.0)');
  naranja.addColorStop(0.5, 'rgba(240,150,60,.25)');
  naranja.addColorStop(1, 'rgba(240,150,60,.0)');
  g.fillStyle = naranja;
  g.fillRect(0, h * 0.15, w, h * 0.7);
  frutas(g, w * 0.1, h * 0.45, h * 0.25);
  frutas(g, w * 0.9, h * 0.45, h * 0.25);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `900 ${Math.round(h * 0.42)}px Georgia, "Times New Roman", serif`;
  const t = 'EL GUARO', m = g.measureText(t).width, k = Math.min(1, (w * 0.62) / m);
  g.save(); g.translate(w / 2, h * 0.36); g.scale(k, 1);
  g.lineWidth = 6; g.strokeStyle = '#f6f4ee'; g.strokeText(t, 0, 0);
  g.fillStyle = '#1e1e20'; g.fillText(t, 0, 0);
  g.restore();
  // la cinta verde de «COFFEE BREAK»
  g.fillStyle = '#2a8a3a';
  g.save(); g.translate(w * 0.55, h * 0.64); g.rotate(-0.08);
  g.fillRect(-w * 0.17, -h * 0.07, w * 0.34, h * 0.14);
  g.fillStyle = '#f6f4ee';
  g.font = `700 ${Math.round(h * 0.1)}px Arial, sans-serif`;
  g.fillText('COFFEE BREAK', 0, 0);
  g.restore();
  g.fillStyle = '#1e1e20';
  g.font = `700 ${Math.round(h * 0.1)}px Georgia, serif`;
  g.fillText('• BAR CAFETERIA •', w / 2, h * 0.84);
  g.strokeStyle = '#c8382a';
  g.lineWidth = 4;
  g.strokeRect(2, 2, w - 4, h - 4);
}

/** la banda de encima de la entrada: las frutas, las etiquetas verdes y la placa de «EL GUARO» */
function banda(g, w, h) {
  g.fillStyle = '#f6f4ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c8382a';
  g.fillRect(0, 0, w * 0.12, h);
  g.fillRect(w * 0.88, 0, w * 0.12, h);
  for (const x of [0.2, 0.8]) frutas(g, w * x, h * 0.45, h * 0.3);
  g.fillStyle = '#2a8a3a';
  for (const x of [0.33, 0.67]) g.fillRect(w * x - w * 0.07, h * 0.3, w * 0.14, h * 0.4);
  g.fillStyle = '#f6f4ee';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.18)}px Arial, sans-serif`;
  for (const x of [0.33, 0.67]) { g.fillText('COFFEE BREAK', w * x, h * 0.42); g.fillText('BAR CAFETERIA', w * x, h * 0.6); }
  g.fillStyle = '#3a2a1e';
  g.fillRect(w * 0.42, h * 0.15, w * 0.16, h * 0.7);
  g.fillStyle = '#f6f4ee';
  g.font = `900 ${Math.round(h * 0.42)}px Georgia, serif`;
  g.fillText('EL GUARO', w / 2, h * 0.52, w * 0.15);
}

/** una ventana del bar, oscura, con su marco blanco */
function ventana(g, w, h) {
  g.fillStyle = '#2e2a28';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(200,220,230,.18)';
  g.fillRect(0, 0, w * 0.4, h);
  g.fillStyle = '#c84a3a';
  g.fillRect(w * 0.2, h * 0.3, w * 0.6, h * 0.12);
  g.strokeStyle = '#f2f2ee';
  g.lineWidth = 5;
  g.strokeRect(2, 2, w - 4, h - 4);
}

/** la puerta abierta con los escalones de baldosa roja */
function puerta(g, w, h) {
  g.fillStyle = '#3a302a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#a84a32';
  for (let i = 0; i < 3; i++) g.fillRect(0, h * (0.78 + i * 0.075), w, h * 0.06);
  g.fillStyle = 'rgba(255,230,190,.2)';
  g.fillRect(w * 0.2, h * 0.1, w * 0.6, h * 0.5);
  g.strokeStyle = '#f2f2ee';
  g.lineWidth = 5;
  g.strokeRect(2, 2, w - 4, h - 4);
}

/** la baldosa roja del bajo de las ventanas */
function baldosa(g, w, h) {
  g.fillStyle = '#a8442a';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(60,20,10,.45)';
  g.lineWidth = 1;
  for (let x = 0; x < w; x += 12) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y < h; y += 12) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** la reja negra de la ventana */
function reja(g, w, h) {
  g.fillStyle = '#4a4a4c';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#1e1e20';
  for (let x = 0; x < w; x += 10) g.fillRect(x, 0, 3, h);
  g.fillRect(0, 0, w, 4);
  g.fillRect(0, h - 4, w, 4);
}

/** el faldón del toldo con «Bar El Guaro» */
function faldon(g, w, h) {
  g.fillStyle = '#c8382a';
  g.fillRect(0, 0, w, h * 0.7);
  for (let x = 0; x < w; x += 30) { g.beginPath(); g.arc(x + 15, h * 0.7, 15, 0, Math.PI); g.fill(); }
  g.fillStyle = '#f6f4ee';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.55)}px Georgia, "Times New Roman", serif`;
  g.fillText('Bar        El  Guaro', w / 2, h * 0.4);
}

// ——— las piezas ———

/** la cara de Taburiente: la pared, el zócalo, el alero, la entrada, la reja, la antena y los letreros */
function caraTaburiente(k) {
  const S0 = 37.5, S1 = ESQ + 0.3, c = (S0 + S1) / 2, L = S1 - S0;
  k.box(c, 0, Z + 0.15, L, YP, 0.3, BLANCO);
  k.block(c, Z + 0.15, L, 0.3);
  k.pic(c, 0.63, ZF + 0.004, L, 1.26, 0, 1, canvasTex(Math.round(L * 60), 76, piedra));
  // el alero blanco grueso, de la reja hasta la esquina
  k.box((39.0 + S1) / 2, 2.9, ZF + 0.4, S1 - 39.0, 0.85, 0.8, 0xf4f4f0);
  // la ventana de la reja negra
  k.pic(38.9, 2.0, ZF + 0.01, 1.75, 0.75, 0, 1, canvasTex(170, 70, reja));
  // la entrada: la banda del nombre, la caja de la persiana, las ventanas, la puerta y la baldosa roja
  k.box(43.65, 0, ZF + 0.05, 3.6, 2.2, 0.1, 0xe8e6e0);
  k.pic(43.65, 0.275, ZF + 0.105, 3.5, 0.55, 0, 1, canvasTex(300, 48, baldosa));
  for (const s of [42.4, 44.8]) k.pic(s, 1.35, ZF + 0.105, 0.95, 1.6, 0, 1, canvasTex(90, 150, ventana), { glow: 0.1 });
  k.pic(43.3, 1.075, ZF + 0.11, 0.9, 2.15, 0, 1, canvasTex(90, 210, puerta), { glow: 0.1 });
  k.box(43.65, 2.2, ZF + 0.08, 3.6, 0.2, 0.25, 0x9a9a98);
  k.box(43.65, 2.4, ZF + 0.03, 3.6, 0.36, 0.06, 0xf6f4ee);
  k.pic(43.65, 2.58, ZF + 0.065, 3.58, 0.34, 0, 1, canvasTex(600, 56, banda));
  // la lucecita y la antena de la derecha
  k.box(45.2, 2.95, ZF + 0.05, 0.2, 0.15, 0.1, 0x8a8a88);
  const antena = new THREE.CylinderGeometry(0.28, 0.28, 0.05, 16);
  antena.rotateX(Math.PI / 2);
  antena.rotateY(0.5);
  antena.translate(45.95, 2.2, ZF + 0.25);
  k.add(antena, 0xe8e8e4);
  // los dos letreros grandes de canto en el tejado: el del norte mira hacia el norte, el de la esquina hacia el sur
  for (const [s, n] of [[40.5, -1], [ESQ - 0.1, 1]]) {
    k.box(s, 3.15, ZF + 0.55, 0.14, 1.1, 3.4, 0xf6f4ee);
    k.pic(s + n * 0.075, 3.7, ZF + 0.55, 3.38, 1.08, n, 0, canvasTex(420, 136, letrero));
    k.pic(s - n * 0.075, 3.7, ZF + 0.55, 3.38, 1.08, -n, 0, canvasTex(420, 136, letrero));
  }
}

/** la cara de Bandama: la pared, el zócalo, el alero, los cajetines de la luz y la rejilla */
function caraBandama(k) {
  const S0 = 0, S1 = 9.27, c = (S0 + S1) / 2, L = S1 - S0;
  k.box(c, 0, Z + 0.15, L, YP, 0.3, BLANCO);
  k.block(c, Z + 0.15, L, 0.3);
  k.pic(c, 0.63, ZF + 0.004, L, 1.26, 0, 1, canvasTex(Math.round(L * 60), 76, piedra));
  k.box(c - 0.4, 2.9, ZF + 0.4, L - 0.8, 0.85, 0.8, 0xf4f4f0);
  for (const s of [2.6, 3.5]) k.box(s, 0.75, ZF + 0.06, 0.6, 0.7, 0.12, 0xf2f2ee);
  k.box(5.6, 2.6, ZF + 0.05, 0.25, 0.25, 0.12, 0xd8742a);
  for (let i = 0; i < 4; i++) k.box(7.0 + i * 0.22, 2.3, ZF + 0.01, 0.12, 0.35, 0.02, 0x2a2a2c);
}

/** la terraza de Taburiente: la barandilla negra, el toldo rojo sobre sus postes y las mesas */
function terraza(k) {
  const a = 38.3, b = 46.5, z0 = ZF + 1.0, z1 = ZF + 3.9, alto = 2.3, c = (a + b) / 2, zc = (z0 + z1) / 2;
  // los postes negros y el toldo, un poco inclinado hacia la calle
  for (const s of [a, c, b]) for (const z of [z0, z1]) { k.box(s, 0, z, 0.07, z === z0 ? alto + 0.2 : alto, 0.07, NEGRO); k.block(s, z, 0.1, 0.1); }
  const lona = new THREE.BoxGeometry(b - a + 0.2, 0.04, z1 - z0 + 0.3);
  lona.rotateX(Math.atan2(0.2, z1 - z0));
  lona.translate(c, alto + 0.1, zc);
  k.add(lona, 0xc8b8a0);
  k.box(c, alto - 0.42, z1 + 0.16, b - a + 0.2, 0.42, 0.03, ROJO);
  k.pic(c, alto - 0.21, z1 + 0.18, b - a + 0.2, 0.42, 0, 1, canvasTex(820, 42, faldon));
  for (const s of [a - 0.1, b + 0.1]) k.box(s, alto - 0.3, zc, 0.03, 0.3, z1 - z0 + 0.3, ROJO);
  // la barandilla negra por delante y por los lados, con la entrada junto a la pared
  const valla = (x0, zA, x1, zB) => {
    const w = Math.abs(x1 - x0) + 0.05, d = Math.abs(zB - zA) + 0.05, xm = (x0 + x1) / 2, zm = (zA + zB) / 2;
    k.box(xm, 0.95, zm, w, 0.05, d, NEGRO);
    k.box(xm, 0.08, zm, w, 0.04, d, NEGRO);
    const n = Math.round(Math.max(w, d) / 0.12);
    for (let i = 0; i <= n; i++) { const t = i / n; k.box(x0 + (x1 - x0) * t, 0.08, zA + (zB - zA) * t, 0.025, 0.87, 0.025, NEGRO); }
    k.block(xm, zm, w + 0.05, d + 0.05);
  };
  valla(a, z1, b, z1);
  valla(a, z0 + 1.0, a, z1);
  valla(b, z0 + 1.0, b, z1);
  // las mesas blancas y las sillas blancas de plástico
  for (const s of [39.4, 41.4, 43.4, 45.4]) {
    k.table(s, zc + 0.3, { w: 0.7, d: 0.7, h: 0.74, top: 0xeeeeea, leg: 0xb8b8b4 });
    k.chair(s - 0.5, zc + 0.3, Math.PI / 2, 0xf2f2ee, { legs: 0xe8e8e4 });
    k.chair(s + 0.5, zc + 0.3, -Math.PI / 2, 0xf2f2ee, { legs: 0xe8e8e4 });
  }
}

/** se monta con lo demás de Arrecife Centro: las dos caras de la esquina y la terraza */
export function buildElGuaro(scene, colliders, map) {
  if (!map?.elGuaro) return null;
  const partes = [];
  for (const [M, nom, hacer] of [[TAB, 'elGuaroTaburiente', (k) => { caraTaburiente(k); terraza(k); }], [BAN, 'elGuaroBandama', caraBandama]]) {
    const k = new Kit();
    hacer(k);
    const group = enMarco(k, M, nom, colliders);
    scene.add(group);
    partes.push(group);
  }
  return { partes };
}
