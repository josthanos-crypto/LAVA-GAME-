import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * El Herbolario El Alquimista, en la calle Góngora 56, en la esquina con la calle Colombia (centro), con la vista de
 * la calle de Google de julio de 2025 y las fotos de Google Maps de 2020 a 2026 (solo se miran, no van dentro del
 * juego; la gente no se pone): la planta baja forrada de granito gris; los ventanales grandes de arriba y las
 * ventanas bajas, todos de marco marrón, con las baldas de madera clara y los botes de colores dentro; y entre unos y
 * otras, las bandas amarillas con «El Alquimista» y el alambique dibujado, «Comercio justo · Comercio responsable»
 * y la de «Herbolario» que dobla la esquina (las listas de productos de letra pequeña se dejan en rayas). El bloque
 * se queda como está; lo de abajo tapa su trozo.
 */

// la cara de la calle Colombia (s de norte a sur, hasta la esquina en s 34,6) y la de Góngora (s desde la esquina
// hacia el este); el rótulo del mapa caía en la de Colombia, en s 27,4
const COLOMBIA = marco([-732.48, 52.94], [-716.68, 83.77]);
const GONGORA = marco([-716.68, 83.77], [-677.36, 63.61]);
const Z = 0.12, ZF = Z + 0.3, YP = 4.0, GRANITO = 0x9a9894, MARRON = 0x6a4a32;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneElAlquimista(map) {
  map.elAlquimistaSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'El Alquimista' && Math.hypot(s.x + 719.9, s.z - 77.4) < 15);
  if (i >= 0) map.elAlquimistaSign = map.signs.splice(i, 1)[0];
  map.elAlquimista = true;
}

// ——— lo que se pinta en lienzo ———

/** el granito gris moteado */
function granito(g, w, h) {
  g.fillStyle = '#9a9894';
  g.fillRect(0, 0, w, h);
  let s = 17;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 900; i++) {
    const v = r();
    g.fillStyle = v < 0.4 ? 'rgba(60,58,56,.45)' : v < 0.8 ? 'rgba(200,198,194,.45)' : 'rgba(140,110,100,.4)';
    g.fillRect(r() * w, r() * h, 2, 2);
  }
  g.strokeStyle = 'rgba(70,68,66,.35)';
  g.lineWidth = 1;
  for (let y = 0; y <= h; y += h / 5) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** un ventanal: la tienda dentro con las baldas de madera y los botes, y el reflejo de la calle */
function ventanal(g, w, h) {
  g.fillStyle = '#e8e4d8';
  g.fillRect(0, 0, w, h);
  let s = 3;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const col = ['#e8c84a', '#6ab04a', '#c83a2a', '#3a6ac8', '#f2f2ee', '#e87a2a', '#8a5a3a'];
  for (let y = 0.15; y < 0.95; y += 0.17) {
    g.fillStyle = '#c89a62';
    g.fillRect(0, h * (y + 0.12), w, h * 0.025);
    for (let x = 0.02; x < 0.96; x += 0.035) { g.fillStyle = col[Math.floor(r() * col.length)]; g.fillRect(w * x, h * y, w * 0.025, h * 0.11); }
  }
  g.fillStyle = 'rgba(230,220,200,.35)';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#6a4a32';
  g.lineWidth = 6;
  g.strokeRect(3, 3, w - 6, h - 6);
  for (const x of [0.25, 0.75]) { g.beginPath(); g.moveTo(w * x, 0); g.lineTo(w * x, h); g.stroke(); }
}

/** el alambique dibujado */
function alambique(g, x, y, r) {
  g.strokeStyle = '#3a2a1a';
  g.lineWidth = 2;
  g.beginPath(); g.arc(x, y + r * 0.4, r * 0.6, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(x - r * 0.15, y - r * 0.15); g.lineTo(x - r * 0.15, y - r * 0.9); g.lineTo(x + r * 0.9, y - r * 0.5); g.stroke();
}

/** la banda amarilla de «El Alquimista» */
function bandaAlquimista(g, w, h) {
  g.fillStyle = '#f2c83a';
  g.fillRect(0, 0, w, h);
  alambique(g, w * 0.2, h * 0.5, h * 0.4);
  g.fillStyle = '#3a2a1a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 700 ${Math.round(h * 0.46)}px "Segoe Script", "Brush Script MT", Georgia, serif`;
  g.fillText('El Alquimista', w * 0.5, h * 0.4);
  g.font = `italic 400 ${Math.round(h * 0.17)}px Georgia, serif`;
  g.fillText('Comercio justo · Comercio responsable', w * 0.5, h * 0.82);
  g.fillStyle = 'rgba(58,42,26,.55)';
  for (const x0 of [0.02, 0.83]) for (let y = 0.2; y < 0.85; y += 0.14) g.fillRect(w * x0, h * y, w * 0.13, h * 0.05);
}

/** la banda amarilla de «Herbolario» */
function bandaHerbolario(g, w, h) {
  g.fillStyle = '#f2c83a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#3a2a1a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 700 ${Math.round(h * 0.45)}px "Segoe Script", "Brush Script MT", Georgia, serif`;
  g.fillText('Herbolario', w * 0.5, h * 0.36);
  g.fillStyle = 'rgba(58,42,26,.55)';
  for (let y = 0.62; y < 0.95; y += 0.13) g.fillRect(w * 0.1, h * y, w * 0.8, h * 0.05);
}

// ——— las piezas ———

/** un tramo de la planta baja: el granito, los ventanales de arriba, las ventanas de abajo y las bandas */
function tramo(k, S0, S1, bahias, bandas) {
  const gt = canvasTex(256, 128, granito), vt = canvasTex(240, 120, ventanal);
  k.box((S0 + S1) / 2, 0, Z + 0.15, S1 - S0, YP, 0.3, GRANITO);
  k.pic((S0 + S1) / 2, YP / 2, ZF + 0.002, S1 - S0, YP, 0, 1, gt);
  k.block((S0 + S1) / 2, Z + 0.15, S1 - S0, 0.3);
  for (const [a, b] of bahias) {
    k.pic((a + b) / 2, 2.95, ZF + 0.006, b - a, 1.5, 0, 1, vt, { glow: 0.12 });
    k.pic((a + b) / 2, 0.95, ZF + 0.006, b - a, 1.1, 0, 1, vt, { glow: 0.12 });
    for (const y of [2.18, 0.38]) k.box((a + b) / 2, y, ZF + 0.02, b - a + 0.1, 0.06, 0.12, 0xb8b4ac);
  }
  for (const [a, b, tex] of bandas) {
    k.box((a + b) / 2, 1.62, ZF + 0.012, b - a, 0.5, 0.02, 0xf2c83a);
    k.pic((a + b) / 2, 1.87, ZF + 0.025, b - a - 0.02, 0.48, 0, 1, tex);
  }
}

/** la cara de la calle Colombia: dos bahías hasta la esquina */
function caraColombia(k) {
  tramo(k, 24.0, 34.6, [[24.6, 28.6], [30.0, 34.0]], [
    [24.6, 28.6, canvasTex(420, 50, bandaAlquimista)],
    [30.0, 32.2, canvasTex(230, 50, bandaAlquimista)],
    [32.2, 34.6, canvasTex(250, 50, bandaHerbolario)],
  ]);
}

/** la cara de Góngora: el primer tramo desde la esquina, con la banda de «Herbolario» que dobla */
function caraGongora(k) {
  tramo(k, 0, 4.5, [[0.6, 4.0]], [[0, 2.2, canvasTex(230, 50, bandaHerbolario)]]);
}

/** se monta con lo demás de Arrecife Centro: las dos caras de la esquina */
export function buildElAlquimista(scene, colliders, map) {
  if (!map?.elAlquimista) return null;
  const partes = [];
  for (const [M, nom, hacer] of [[COLOMBIA, 'elAlquimistaColombia', caraColombia], [GONGORA, 'elAlquimistaGongora', caraGongora]]) {
    const k = new Kit();
    hacer(k);
    const group = enMarco(k, M, nom, colliders);
    scene.add(group);
    partes.push(group);
  }
  return { partes };
}
