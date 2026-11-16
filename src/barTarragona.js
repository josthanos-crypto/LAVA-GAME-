import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, barDentro } from './restaurantesCharco.js';
import { paredAlta, cristales } from './edificioReal.js';

/**
 * El Bar Cafetería Tarragona, en la calle La Rosa (Valterra), en el bajo del edificio alto blanco de la acera oeste,
 * cerca de la esquina con Lérida, con las vistas de la calle de Google de julio de 2025 (solo se miran, no van dentro
 * del juego; la gente no se pone). La entrada un poco más alta que la acera, con los escalones, la barandilla negra y
 * las macetas; la persiana metálica subida; encima, el letrero negro con «BAR CAFETERÍA» en rojo, «Tarragona» en letra
 * blanca y la banda roja de «ESPECIALIDAD EN TAPAS VARIADAS»; al lado, las ventanas de marco verde con reja, las
 * rejillas marrones de ventilación abajo y, más al sur, los ventanales con la reja blanca. Encima, el edificio entero
 * (el bloque del mapa ya mide 18,6 m): blanco, con las ventanas de contraventanas marrones y los balcones de losa
 * blanca con barandilla negra. El mapa no tenía rótulo suyo; salió de la lista de bares de Google.
 */

// la cara de La Rosa del bloque, de la esquina del norte (s 0) hacia Lérida, N hacia la calle (al este)
const M = marco([326.39, -283.81], [364.84, -333.72]);
const Z = 0.12, ZF = Z + 0.3, YB = 3.6, TECHO = 18.6, BLANCO = 0xf2f2ee, S0 = 26, S1 = 50;

/** antes de levantar la ciudad: la marca de que se monta (el edificio ya tiene su altura) */
export function tuneBarTarragona(map) {
  map.barTarragona = true;
}

// ——— lo que se pinta en lienzo ———

/** el letrero negro de «BAR CAFETERÍA Tarragona» con la banda roja de las tapas */
function letrero(g, w, h) {
  g.fillStyle = '#1c1c1e';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c82a2a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(h * 0.17)}px Arial, sans-serif`;
  g.fillText('BAR CAFETERÍA', w * 0.68, h * 0.16);
  g.fillStyle = '#f4f4f0';
  g.font = `italic 700 ${Math.round(h * 0.42)}px "Brush Script MT", "Segoe Script", Georgia, serif`;
  g.fillText('Tarragona', w * 0.5, h * 0.48, w * 0.92);
  g.fillStyle = '#c82a2a';
  g.fillRect(0, h * 0.74, w, h * 0.2);
  g.fillStyle = '#f4f4f0';
  g.font = `800 ${Math.round(h * 0.13)}px Arial, sans-serif`;
  g.fillText('ESPECIALIDAD EN TAPAS VARIADAS', w / 2, h * 0.84, w * 0.94);
}

/** una ventana de marco verde con la reja negra */
function ventanaVerde(g, w, h) {
  g.fillStyle = '#3a4650';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.12)';
  g.fillRect(0, 0, w * 0.3, h);
  g.strokeStyle = '#2a7a5a';
  g.lineWidth = 6;
  g.strokeRect(3, 3, w - 6, h - 6);
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
  g.strokeStyle = '#1a1a1a';
  g.lineWidth = 2;
  for (let x = 8; x < w; x += 10) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
}

/** el ventanal con la reja blanca de cuadros */
function ventanalReja(g, w, h) {
  barDentro(g, w, h);
  g.strokeStyle = '#f2f2ee';
  g.lineWidth = 4;
  for (let x = 0; x <= w; x += w / 8) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (const y of [0.05, 0.35, 0.65, 0.95]) { g.beginPath(); g.moveTo(0, h * y); g.lineTo(w, h * y); g.stroke(); }
}

/** las rejillas marrones de ventilación */
function rejilla(g, w, h) {
  g.fillStyle = '#5a3a2a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#3a2418';
  for (let y = 3; y < h - 2; y += 5) g.fillRect(2, y, w - 4, 2);
}

/** la ventana de las plantas con las contraventanas de lamas marrones */
function contraventanas(g, w, h) {
  g.fillStyle = '#5a3a2a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#3a2418';
  for (let y = 4; y < h - 3; y += 5) g.fillRect(3, y, w - 6, 2);
  g.strokeStyle = '#3a2418';
  g.lineWidth = 3;
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
}

// ——— las piezas ———

/** el bajo: la entrada del bar, las ventanas verdes y los ventanales con reja */
function bajo(k) {
  const c = (S0 + S1) / 2, L = S1 - S0;
  k.box(c, 0, Z + 0.15, L, YB, 0.3, BLANCO);
  k.block(c, Z + 0.15, L, 0.3);
  // la entrada del bar: los escalones, la persiana subida, la barandilla negra y las macetas
  const e = 33.5;
  for (let i = 0; i < 3; i++) k.box(e, i * 0.17, ZF + 1.2 - i * 0.35, 2.6, 0.17, 0.4 + i * 0.35, 0xb8a890);
  k.pic(e, 1.75, ZF + 0.014, 2.4, 2.0, 0, 1, canvasTex(160, 140, barDentro), { glow: 0.25 });
  for (const t of [e - 1.25, e + 1.25]) k.box(t, 0, ZF + 0.02, 0.12, 2.9, 0.12, 0xe4e0d8);
  k.box(e, 2.75, ZF + 0.03, 2.6, 0.25, 0.14, 0x8a8a88);
  k.box(e + 0.9, 0.95, ZF + 0.9, 0.04, 0.04, 1.6, 0x1a1a1a);
  for (const z of [ZF + 0.2, ZF + 1.6]) k.box(e + 0.9, 0.5, z, 0.04, 0.95, 0.04, 0x1a1a1a);
  for (const [s, z] of [[e - 0.9, ZF + 0.5], [e - 0.5, ZF + 1.1]]) { k.cyl(s, 0.5, z, 0.2, 0.15, 0.35, 0x9a5a3a, { seg: 10 }); k.ball(s, 1.05, z, 0.28, 0x3e7a3a); }
  // el letrero de bandera negro, un poco inclinado hacia la calle
  k.box(e - 0.2, YB - 0.15, ZF + 0.6, 2.8, 1.1, 0.06, 0x1c1c1e);
  k.pic(e - 0.2, YB + 0.4, ZF + 0.64, 2.8, 1.1, 0, 1, canvasTex(300, 118, letrero));
  // las ventanas de marco verde con reja y las rejillas marrones de abajo
  for (const s of [28.0, 30.4, 37.4, 39.8]) {
    k.pic(s, 1.9, ZF + 0.012, 1.9, 1.9, 0, 1, canvasTex(110, 110, ventanaVerde));
    k.pic(s, 0.45, ZF + 0.012, 1.6, 0.5, 0, 1, canvasTex(80, 25, rejilla));
  }
  // los ventanales con la reja blanca de más al sur
  for (const s of [43.2, 47.0]) k.pic(s, 1.6, ZF + 0.012, 3.4, 2.6, 0, 1, canvasTex(200, 150, ventanalReja), { glow: 0.1 });
  for (const s of [43.2, 47.0]) k.pic(s, 0.2, ZF + 0.012, 3.2, 0.3, 0, 1, canvasTex(120, 12, rejilla));
  k.box(c, YB - 0.1, ZF + 0.04, L, 0.12, 0.08, 0xe4e0d8);
}

/** las plantas de arriba: las ventanas de contraventanas marrones y los balcones con barandilla negra */
function plantas(k) {
  paredAlta(k, S0, S1, YB, TECHO, Z, BLANCO);
  for (let y = YB + 0.8, p = 0; y < TECHO - 2; y += 3.0, p++) {
    for (const s of [28.5, 33.5, 38.5, 43.5, 47.5]) {
      const balcon = (s === 33.5 || s === 43.5) && p % 2 === 1;
      if (balcon) {
        k.pic(s, y + 1.1, ZF + 0.01, 1.4, 2.2, 0, 1, canvasTex(70, 110, cristales('#5a3a2a', 2, 'rgba(236,232,222,.5)')));
        k.box(s, y - 0.1, ZF + 0.45, 2.4, 0.18, 0.9, 0xeceae4);
        k.box(s, y + 0.9, ZF + 0.86, 2.4, 0.04, 0.04, 0x1a1a1a);
        for (let x = s - 1.15; x <= s + 1.16; x += 0.13) k.box(x, y + 0.08, ZF + 0.86, 0.025, 0.82, 0.025, 0x1a1a1a);
      } else {
        k.pic(s, y + 1.1, ZF + 0.01, 1.1, 1.5, 0, 1, canvasTex(56, 76, contraventanas));
        k.box(s, y + 0.3, ZF + 0.05, 1.3, 0.06, 0.12, 0xe4e0d8);
      }
    }
  }
}

/** se monta con lo demás de Valterra */
export function buildBarTarragona(scene, colliders, map) {
  if (!map?.barTarragona) return null;
  const k = new Kit();
  bajo(k);
  plantas(k);
  const group = enMarco(k, M, 'barTarragona', colliders);
  scene.add(group);
  return { group };
}
