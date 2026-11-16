import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { paredAlta, ventana, medianera } from './edificioReal.js';

/**
 * El Jardín Secreto, la cafetería, crepería y zumería de la calle Manolo Millares 6 (centro), en la esquina con Ramón
 * Franco, con la vista de la calle de Google de julio de 2025 (solo se mira, no va dentro del juego; la gente no se
 * pone; las guías dicen que dentro tiene un patio y un jardincito con sombra): la casa antigua de dos plantas, blanca,
 * con la esquina redondeada; en la curva, el letrero verde de «EL JARDÍN SECRETO» con la taza, las tortitas y el vaso
 * dibujados y «Cafetería Crepería Zumería», y el farol; por Manolo Millares, la banda color crema con «Cafetería»,
 * «Pastelería» y «Panadería» en letra roja, la puerta abierta con el local dentro, la puerta de cristal con la
 * cortina, la puerta del 6 con sus lamas, todas de marco verde, los faroles y los cables; arriba, los balcones de
 * barandilla verde con sus ventanas altas de marco verde, las molduras de encima y la cornisa; y por Ramón Franco, la
 * puerta verde, las ventanas de arriba y, después, la tapia blanca del jardín con la palmera asomando. El bloque del
 * mapa (6,2 m) tenía la esquina en punta: se le redondea y la casa sube a su altura (7,6 m). El mapa no tenía rótulo
 * suyo; salió de la lista de cafeterías de Google.
 */

// la cara de Manolo Millares (s de oeste a este, hasta la esquina, en s 35,2) y la de Ramón Franco (s desde la esquina
// hacia el noroeste); Google pone la cafetería en la puerta del 6 (el mapa no tenía rótulo suyo)
const MM = marco([-38.63, 302.91], [-3.75, 297.95]);
const RF = marco([-3.75, 297.95], [-24.2, 275.88]);
const L = MM.len;
const Z = 0.12, ZF = Z + 0.3, YP = 4.0, TECHO = 7.6, YB = 6.2, BLANCO = 0xf2f0ea, VERDE = 0x2a7a4a, FONDO = 9;
// la casa: por Manolo Millares, hasta 12,5 m de la esquina; por Ramón Franco, hasta 11 m; y la tapia del jardín
const H0 = L - 12.5, H1 = 11, T1 = 20;

// la esquina redondeada, en el marco de Manolo Millares: el radio, el centro y los dos puntos donde empieza la curva
const R = 2.2;
const E2 = [RF.U[0] * MM.U[0] + RF.U[1] * MM.U[1], RF.U[0] * MM.N[0] + RF.U[1] * MM.N[1]];
const TH = Math.acos(-E2[0]), TAN = R / Math.tan(TH / 2);
const BI = (() => { const b = [-1 + E2[0], E2[1]], l = Math.hypot(b[0], b[1]); return [b[0] / l, b[1] / l]; })();
const C = [L + BI[0] * R / Math.sin(TH / 2), BI[1] * R / Math.sin(TH / 2)];
const F1 = Math.atan2(0 - C[1], L - TAN - C[0]);
const F2 = Math.atan2(E2[1] * TAN - C[1], L + E2[0] * TAN - C[0]);
const curva = (r, n) => Array.from({ length: n + 1 }, (_, i) => { const f = F1 + (F2 - F1) * i / n; return [C[0] + r * Math.cos(f), C[1] + r * Math.sin(f)]; });

/** antes de levantar la ciudad: la marca de que se monta, la esquina redondeada del bloque y la casa a su altura */
export function tuneElJardinSecreto(map) {
  map.elJardinSecreto = true;
  if (!Array.isArray(map?.buildings)) return;
  const r2 = q => [+q[0].toFixed(2), +q[1].toFixed(2)];
  const arco = curva(R, 8).map(([s, z]) => r2(MM.W(s, z)));
  const punta = MM.W(L, 0), cerca = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.1;
  const b = map.buildings.find(q => !q.skip && Array.isArray(q.p) && q.p.some(v => cerca(v, punta)));
  if (b) {
    const n = b.p.length, cerrado = cerca(b.p[0], b.p[n - 1]);
    const i = b.p.findIndex(v => cerca(v, punta));
    // la punta se cambia por la curva, en el orden del polígono (de la cara de Ramón Franco a la de Manolo Millares, o al revés)
    const ant = b.p[i === 0 ? (cerrado ? n - 2 : n - 1) : i - 1];
    const tramo = Math.hypot(ant[0] - arco[0][0], ant[1] - arco[0][1]) < Math.hypot(ant[0] - arco[8][0], ant[1] - arco[8][1]) ? arco : arco.slice().reverse();
    b.p.splice(i, 1, ...tramo);
    if (cerrado && i === 0) b.p[b.p.length - 1] = tramo[0].slice();
  }
  // la casa: la cara de Manolo Millares, la curva, la cara de Ramón Franco y su fondo
  const p = [MM.W(H0, 0), ...curva(R, 8).map(([s, z]) => MM.W(s, z)), RF.W(H1, 0), RF.W(H1, -FONDO), MM.W(H0, -FONDO)].map(r2);
  p.push(p[0].slice());
  map.buildings.push({ p, h: TECHO, k: 'gen', s: 0, f: [242, 240, 234], c: [214, 210, 202], edificioReal: true });
}

// ——— lo que se pinta en lienzo ———

/** la banda color crema con «Cafetería», «Pastelería» y «Panadería» en letra roja */
function banda(g, w, h) {
  g.fillStyle = '#e8d8a8';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#a88a50';
  g.lineWidth = 3;
  g.strokeRect(1.5, 1.5, w - 3, h - 3);
  for (const x of [w / 3, (2 * w) / 3]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  g.fillStyle = '#b02a2a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 600 ${Math.round(h * 0.62)}px "Segoe Script", "Brush Script MT", Georgia, serif`;
  ['Cafetería', 'Pastelería', 'Panadería'].forEach((t, i) => g.fillText(t, (w / 3) * (i + 0.5), h * 0.55, w / 3.4));
}

/** el letrero verde de la esquina: el nombre, la taza, las tortitas, el vaso y lo que hacen */
function letreroJardin(g, w, h) {
  g.fillStyle = '#2e6a3e';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#e8e2c8';
  g.lineWidth = 4;
  g.strokeRect(6, 6, w - 12, h - 12);
  g.fillStyle = '#efe9d0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.07)}px Georgia, serif`;
  g.fillText('EL', w / 2, h * 0.11);
  g.font = `700 ${Math.round(h * 0.085)}px Georgia, serif`;
  g.fillText('JARDÍN SECRETO', w / 2, h * 0.21, w * 0.86);
  // la taza, las tortitas apiladas y el vaso, dibujados a línea
  g.strokeStyle = '#efe9d0';
  g.lineWidth = 3;
  g.strokeRect(w * 0.16, h * 0.4, w * 0.14, h * 0.12);
  g.beginPath(); g.arc(w * 0.32, h * 0.46, h * 0.035, -1.2, 1.2); g.stroke();
  for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(w * 0.5, h * (0.52 - i * 0.04), w * 0.12, h * 0.025, 0, 0, Math.PI * 2); g.stroke(); }
  g.beginPath(); g.moveTo(w * 0.7, h * 0.36); g.lineTo(w * 0.73, h * 0.53); g.lineTo(w * 0.81, h * 0.53); g.lineTo(w * 0.84, h * 0.36); g.closePath(); g.stroke();
  g.beginPath(); g.moveTo(w * 0.8, h * 0.36); g.lineTo(w * 0.86, h * 0.29); g.stroke();
  g.font = `italic 600 ${Math.round(h * 0.075)}px "Segoe Script", "Brush Script MT", Georgia, serif`;
  g.fillText('Cafetería Crepería', w / 2, h * 0.7, w * 0.86);
  g.fillText('Zumería', w / 2, h * 0.82);
}

/** el local por la puerta abierta: las paredes claras, el reloj, los cuadros y la luz */
function dentro(g, w, h) {
  g.fillStyle = '#e8dcc4';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c8b494';
  g.fillRect(0, h * 0.62, w, h * 0.38);
  g.strokeStyle = '#3a3634';
  g.lineWidth = 3;
  g.beginPath(); g.arc(w * 0.55, h * 0.22, w * 0.12, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#6a5040';
  for (const [x, y] of [[0.2, 0.3], [0.75, 0.38]]) g.fillRect(w * x, h * y, w * 0.14, h * 0.1);
  g.fillStyle = '#7a5a40';
  g.fillRect(w * 0.15, h * 0.62, w * 0.7, h * 0.05);
  g.fillStyle = '#4a3a2e';
  for (const x of [0.2, 0.75]) g.fillRect(w * x, h * 0.67, 4, h * 0.25);
  g.fillStyle = 'rgba(0,0,0,.15)';
  g.fillRect(0, 0, w, h);
}

/** la puerta de cristal con la cortina blanca */
function cortina(g, w, h) {
  g.fillStyle = '#d8d8d2';
  g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 9) { g.fillStyle = x % 18 ? 'rgba(255,255,255,.55)' : 'rgba(150,150,145,.35)'; g.fillRect(x, 0, 5, h); }
  g.strokeStyle = '#2a7a4a';
  g.lineWidth = 8;
  g.strokeRect(4, 4, w - 8, h - 8);
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
}

/** la puerta del 6: las dos hojas verdes con el cristal de arriba y las lamas */
function lamas(g, w, h) {
  g.fillStyle = '#2a7a4a';
  g.fillRect(0, 0, w, h);
  for (const x of [0.07, 0.55]) {
    g.fillStyle = '#c8ccc8';
    g.fillRect(w * x, h * 0.05, w * 0.38, h * 0.2);
    g.fillStyle = '#e8e8e2';
    for (const y0 of [0.3, 0.55]) { g.fillRect(w * x, h * y0, w * 0.38, h * 0.21); }
    g.fillStyle = 'rgba(80,80,80,.45)';
    for (const y0 of [0.3, 0.55]) for (let y = y0; y < y0 + 0.2; y += 0.025) g.fillRect(w * x, h * y, w * 0.38, 2);
    g.strokeStyle = 'rgba(0,0,0,.3)';
    g.lineWidth = 2;
    g.strokeRect(w * x, h * 0.8, w * 0.38, h * 0.16);
  }
  g.fillStyle = '#1e5a3a';
  g.fillRect(w / 2 - 2, 0, 4, h);
}

/** el tronco de la palmera, con sus anillos */
function tronco(g, w, h) {
  g.fillStyle = '#7a6448';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(40,30,20,.35)';
  for (let y = 0; y < h; y += 8) g.fillRect(0, y, w, 3);
}

// ——— las piezas ———

/** una puerta en la fachada: el hueco con su lienzo, el marco verde grueso y la moldura de arriba */
function puerta(k, s, w, h, tex, glow = 0) {
  k.pic(s, h / 2, ZF + 0.01, w, h, 0, 1, tex, glow ? { glow } : undefined);
  for (const t of [s - w / 2 - 0.09, s + w / 2 + 0.09]) k.box(t, 0, ZF + 0.04, 0.18, h + 0.1, 0.08, VERDE);
  k.box(s, h + 0.05, ZF + 0.04, w + 0.36, 0.2, 0.08, VERDE);
  k.box(s, h + 0.25, ZF + 0.05, 0.2, 0.18, 0.1, VERDE);
  k.box(s, 0, ZF + 0.1, w + 0.2, 0.08, 0.2, 0xc8c4bc);
}

/** un farol de pared, con su brazo */
function farol(k, s, y) {
  k.box(s, y + 0.25, ZF + 0.18, 0.04, 0.04, 0.32, 0x2a2a24);
  k.box(s, y - 0.12, ZF + 0.34, 0.2, 0.3, 0.2, 0x3a3428);
  k.box(s, y - 0.08, ZF + 0.34, 0.15, 0.22, 0.15, 0xf2e2b0);
  k.box(s, y + 0.18, ZF + 0.34, 0.26, 0.06, 0.26, 0x2a2a24);
}

/** una ventana alta de arriba: el marco verde, el balconcito de barandilla verde y la moldura de encima */
function ventanaBalcon(k, s) {
  const y = 4.55, w = 1.05, h = 2.0;
  ventana(k, s, y, w, h, Z, { carpinteria: '#2a7a4a', alfeizar: 0xe8e6e0 });
  for (const t of [s - w / 2 - 0.07, s + w / 2 + 0.07]) k.box(t, y, ZF + 0.03, 0.12, h, 0.06, VERDE);
  // el balconcito: la losa y la barandilla verde de barrotes
  k.box(s, y - 0.12, ZF + 0.15, w + 0.4, 0.1, 0.3, 0xe8e6e0);
  for (const yy of [y + 0.05, y + 0.9]) k.box(s, yy, ZF + 0.28, w + 0.3, 0.04, 0.04, VERDE);
  for (let t = s - w / 2 - 0.12; t <= s + w / 2 + 0.13; t += 0.11) k.box(t, y, ZF + 0.28, 0.025, 0.92, 0.025, VERDE);
  // la moldura de encima, un poco saliente
  k.box(s, y + h + 0.12, ZF + 0.05, w + 0.6, 0.12, 0.12, 0xe8e6e0);
  k.box(s, y + h + 0.24, ZF + 0.03, w + 0.45, 0.08, 0.08, 0xe8e6e0);
}

/** la fachada de Manolo Millares: el bajo, las puertas, la banda, los faroles, los balcones y la cornisa */
function caraMillares(k) {
  const a = H0, b = L - TAN, c = (a + b) / 2, d = x => L - x;
  k.box(c, 0, Z + 0.15, b - a, YP, 0.3, BLANCO);
  k.block(c, Z + 0.15, b - a, 0.3);
  paredAlta(k, a, b, YP, TECHO, Z, BLANCO);
  k.box(c, 0, ZF + 0.005, b - a, 0.35, 0.02, 0xd8d2c6);
  // las tres puertas de marco verde: la abierta, la de la cortina y la del 6
  puerta(k, d(4.9), 1.3, 2.7, canvasTex(130, 270, dentro), 0.25);
  puerta(k, d(7.3), 1.2, 2.7, canvasTex(120, 270, cortina));
  puerta(k, d(10.3), 1.3, 2.7, canvasTex(130, 270, lamas));
  k.box(d(10.3), 3.15, ZF + 0.06, 0.25, 0.16, 0.02, 0x2a2a2c);
  // la banda de la cafetería y los faroles
  k.box(d(6.1), 3.0, ZF + 0.03, 5.0, 0.45, 0.06, 0xd8c898);
  k.pic(d(6.1), 3.225, ZF + 0.065, 4.96, 0.43, 0, 1, canvasTex(600, 52, banda));
  for (const t of [3.7, 6.1, 8.6]) farol(k, d(t), 2.6);
  // los cables corridos por encima del bajo
  for (const y of [3.6, 3.68, 3.75]) k.box(c, y, ZF + 0.05, b - a, 0.035, 0.035, 0x2a2a2c);
  // arriba: los tres balcones encima de las puertas y la cornisa
  for (const t of [4.9, 7.3, 10.3]) ventanaBalcon(k, d(t));
  k.box(c, TECHO - 0.35, ZF + 0.08, b - a, 0.14, 0.16, 0xe8e6e0);
  k.box(c, TECHO - 0.2, ZF + 0.12, b - a, 0.2, 0.24, 0xeeece6);
  // la pared lisa del costado del oeste, que asoma por encima del bloque del mapa
  medianera(k, a - 0.07, YB, TECHO, FONDO, Z, 0xeeece6);
}

/** la esquina redondeada: la pared curva, la cornisa, los cables, el letrero verde y el farol */
function esquina(k) {
  const n = 12, df = (F2 - F1) / n;
  const tramo = (r, y, h, d, hex) => {
    for (let i = 0; i < n; i++) {
      const f = F1 + df * (i + 0.5), largo = Math.abs(df) * (r + d / 2) + 0.04;
      const g = new THREE.BoxGeometry(largo, h, d);
      g.rotateY(-(f + Math.PI / 2));
      g.translate(C[0] + r * Math.cos(f), y + h / 2, C[1] + r * Math.sin(f));
      k.add(g, hex);
    }
  };
  tramo(R + 0.27, 0, TECHO, 0.3, BLANCO);
  tramo(R + 0.42, 0, 0.35, 0.04, 0xd8d2c6);
  tramo(R + 0.5, TECHO - 0.35, 0.14, 0.16, 0xe8e6e0);
  tramo(R + 0.54, TECHO - 0.2, 0.2, 0.24, 0xeeece6);
  for (const y of [3.6, 3.68, 3.75]) tramo(R + 0.47, y, 0.035, 0.035, 0x2a2a2c);
  for (const [s, z] of curva(R + 0.27, 6)) k.block(s, z, 0.6, 0.6);
  // el letrero verde, plano, en el medio de la curva, y el farol de encima
  const fm = (F1 + F2) / 2, nx = Math.cos(fm), nz = Math.sin(fm);
  const px = C[0] + (R + 0.47) * nx, pz = C[1] + (R + 0.47) * nz;
  const tabla = new THREE.BoxGeometry(1.3, 1.45, 0.05);
  tabla.rotateY(-(fm + Math.PI / 2));
  tabla.translate(px, 2.65, pz);
  k.add(tabla, 0x1e4a2a);
  k.pic(px + nx * 0.03, 2.65, pz + nz * 0.03, 1.26, 1.41, nx, nz, canvasTex(220, 245, letreroJardin));
  const f2 = fm + 0.35, qx = C[0] + (R + 0.42) * Math.cos(f2), qz = C[1] + (R + 0.42) * Math.sin(f2);
  k.box(qx, 3.55, qz, 0.2, 0.3, 0.2, 0x3a3428);
  k.box(qx, 3.59, qz, 0.15, 0.22, 0.15, 0xf2e2b0);
  k.box(qx, 3.85, qz, 0.26, 0.06, 0.26, 0x2a2a24);
}

/** la fachada de Ramón Franco: la puerta verde, las ventanas de arriba, la cornisa y la tapia del jardín con la palmera */
function caraRamonFranco(k) {
  const a = TAN, b = H1, c = (a + b) / 2;
  k.box(c, 0, Z + 0.15, b - a, YP, 0.3, BLANCO);
  k.block(c, Z + 0.15, b - a, 0.3);
  paredAlta(k, a, b, YP, TECHO, Z, BLANCO);
  k.box(c, 0, ZF + 0.005, b - a, 0.35, 0.02, 0xd8d2c6);
  puerta(k, 5.6, 1.1, 2.6, canvasTex(110, 260, lamas));
  for (const s of [5.6, 9.0]) ventanaBalcon(k, s);
  for (const y of [3.6, 3.68]) k.box(c, y, ZF + 0.05, b - a, 0.035, 0.035, 0x2a2a2c);
  k.box(c, TECHO - 0.35, ZF + 0.08, b - a, 0.14, 0.16, 0xe8e6e0);
  k.box(c, TECHO - 0.2, ZF + 0.12, b - a, 0.2, 0.24, 0xeeece6);
  // la pared lisa del costado que da al jardín
  medianera(k, b + 0.07, YB, TECHO, FONDO, Z, 0xeeece6);
  // la tapia blanca del jardín, con su remate
  const tc = (b + T1) / 2;
  k.box(tc, 0, Z + 0.15, T1 - b, 3.3, 0.3, BLANCO);
  k.box(tc, 3.3, Z + 0.15, T1 - b + 0.1, 0.12, 0.4, 0xe8e6e0);
  k.block(tc, Z + 0.15, T1 - b, 0.3);
  // la palmera del jardín, asomando por encima de la tapia (encima del bloque del mapa)
  const ps = 14.5, pz = -3.5, alto = 9.5;
  const t = new THREE.CylinderGeometry(0.2, 0.28, alto - YB, 10);
  t.translate(ps, YB + (alto - YB) / 2, pz);
  k.pics.push({ geo: t, tex: canvasTex(32, 128, tronco), glow: 0 });
  for (let i = 0; i < 11; i++) {
    const ang = (i / 11) * Math.PI * 2, caida = 0.25 + (i % 3) * 0.15;
    const hoja = new THREE.BoxGeometry(2.8, 0.04, 0.45);
    hoja.translate(1.35, 0, 0);
    hoja.rotateZ(-caida);
    hoja.rotateY(ang);
    hoja.translate(ps, alto, pz);
    k.add(hoja, i % 2 ? 0x3a7a2a : 0x2e6a24);
  }
}

/** se monta con lo demás de Arrecife Centro: la cara de Manolo Millares con la esquina, y la de Ramón Franco */
export function buildElJardinSecreto(scene, colliders, map) {
  if (!map?.elJardinSecreto) return null;
  const partes = [];
  const millares = (k) => { caraMillares(k); esquina(k); };
  for (const [M, nom, hacer] of [[MM, 'elJardinSecretoMillares', millares], [RF, 'elJardinSecretoRamonFranco', caraRamonFranco]]) {
    const k = new Kit();
    hacer(k);
    const group = enMarco(k, M, nom, colliders);
    scene.add(group);
    partes.push(group);
  }
  return { partes };
}
