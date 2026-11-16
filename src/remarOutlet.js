import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * El Rastro y Outlet Remar, la nave de muebles de segunda mano de la calle Fajardo 36, en la esquina con Cienfuegos
 * (centro), con la foto de Google Maps de marzo de 2022 y la vista de la calle de julio de 2025 (solo se miran, no
 * van dentro del juego; la gente no se pone): la nave blanca de paredes lisas con su cornisa; en la cara corta de la
 * calle Cienfuegos, el portón grande de madera marrón (abierto en 2022, cerrado en 2025), encima la banda blanca y
 * verde de «OUTLET Remar» (escrito, sin el dibujo del logotipo) y la ventana grande de marco marrón; en la cara larga
 * de la calle Fajardo, las ventanas altas de marco verde, los tres carteles verdes como en 2025 («MUEBLES DE
 * OCASIÓN» con los muebles, «PORTES & MUDANZAS» con el camión y, junto a la esquina, «ESTABLECIMIENTO SOLIDARIO» con
 * la bola del mundo; los teléfonos, la cara del niño y los logotipos de los carteles no se ponen), la puerta de
 * madera marrón y el cajetín del contador. La punta del oeste es la del Bar Guanapay (en localesVarios.js). El
 * bloque se queda como está; lo de abajo tapa su trozo.
 */

// la cara larga de la calle Fajardo (s desde la punta del oeste, que es la del Bar Guanapay, hasta la esquina de
// Cienfuegos, en s 24,8) y la cara corta de Cienfuegos (s desde esa esquina hacia el este; ahí caía el rótulo del mapa)
const LARGA = marco([-141.31, 88.09], [-122.53, 104.3]);
const CORTA = marco([-122.53, 104.3], [-114.7, 104.84]);
const Z = 0.12, ZF = Z + 0.3, YP = 5.4, BLANCO = 0xf4f4f0, VERDE = '#7ac03a';

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneRemarOutlet(map) {
  map.remarOutletSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Outlet Remar' && Math.hypot(s.x + 121, s.z - 104.5) < 15);
  if (i >= 0) map.remarOutletSign = map.signs.splice(i, 1)[0];
  map.remarOutlet = true;
}

// ——— lo que se pinta en lienzo ———

/** la banda de «OUTLET Remar»: blanca con las letras negras y el remate verde de la derecha */
function bandaOutlet(g, w, h) {
  g.fillStyle = '#f6f6f2';
  g.fillRect(0, 0, w, h);
  g.fillStyle = VERDE;
  g.fillRect(w * 0.84, 0, w * 0.16, h);
  g.fillRect(0, 0, w * 0.06, h);
  g.fillStyle = '#1e1e20';
  g.textBaseline = 'middle';
  g.textAlign = 'center';
  g.font = `700 ${Math.round(h * 0.62)}px "Segoe UI", Arial, sans-serif`;
  const t = 'OUTLET Remar', m = g.measureText(t).width, k = Math.min(1, (w * 0.74) / m);
  g.save(); g.translate(w * 0.45, h * 0.54); g.scale(k, 1); g.fillText(t, 0, 0); g.restore();
}

/** un cartel verde con su título y un dibujo debajo */
function cartel(titulo, dibujo) {
  return (g, w, h) => {
    g.fillStyle = '#f2f2ee';
    g.fillRect(0, 0, w, h);
    g.fillStyle = VERDE;
    g.fillRect(3, 3, w - 6, h - 6);
    g.fillStyle = '#1e3a1a';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `800 ${Math.round(h * 0.17)}px "Segoe UI", Arial, sans-serif`;
    const m = g.measureText(titulo).width, k = Math.min(1, (w * 0.9) / m);
    g.save(); g.translate(w / 2, h * 0.16); g.scale(k, 1); g.fillText(titulo, 0, 0); g.restore();
    dibujo(g, w, h);
  };
}

/** los muebles: el sofá, la mesa y las sillas */
function muebles(g, w, h) {
  g.fillStyle = '#e8e8e4';
  g.fillRect(w * 0.06, h * 0.32, w * 0.88, h * 0.58);
  g.fillStyle = '#2a2a2e';
  g.fillRect(w * 0.1, h * 0.55, w * 0.3, h * 0.18);
  g.fillRect(w * 0.1, h * 0.45, w * 0.3, h * 0.1);
  g.fillStyle = '#8a8c90';
  g.fillRect(w * 0.5, h * 0.55, w * 0.38, h * 0.04);
  for (const x of [0.52, 0.62, 0.76, 0.86]) { g.fillStyle = '#4a4a4e'; g.fillRect(w * x - 4, h * 0.45, 8, h * 0.35); }
}

/** el camión de la mudanza y la gente cargando */
function camion(g, w, h) {
  g.fillStyle = '#e8eef2';
  g.fillRect(w * 0.52, h * 0.32, w * 0.42, h * 0.58);
  g.fillStyle = '#f4f4f2';
  g.fillRect(w * 0.62, h * 0.45, w * 0.28, h * 0.3);
  g.fillRect(w * 0.55, h * 0.55, w * 0.08, h * 0.2);
  g.fillStyle = '#2a2a2e';
  for (const x of [0.6, 0.84]) { g.beginPath(); g.arc(w * x, h * 0.78, h * 0.05, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#2a3a2a';
  for (let i = 0; i < 5; i++) { const x = w * (0.08 + i * 0.08); g.fillRect(x, h * 0.55, w * 0.025, h * 0.25); g.beginPath(); g.arc(x + w * 0.012, h * 0.5, h * 0.04, 0, Math.PI * 2); g.fill(); }
}

/** la bola del mundo y los cuadritos de colores */
function mundo(g, w, h) {
  g.fillStyle = '#3a7ac8';
  g.beginPath(); g.arc(w * 0.2, h * 0.65, h * 0.22, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#5aa83a';
  g.beginPath(); g.ellipse(w * 0.18, h * 0.6, h * 0.1, h * 0.07, 0.5, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 4; i++) { g.fillStyle = ['#c83a2a', '#e8c84a', '#8a5a3a', '#d8d4cc'][i]; g.fillRect(w * (0.42 + i * 0.13), h * 0.5, w * 0.11, h * 0.25); }
}

/** una ventana alta de marco verde (o marrón), con el cristal oscuro y la cortina */
function ventana(marcoColor) {
  return (g, w, h) => {
    g.fillStyle = '#3a4448';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#6a6458';
    g.fillRect(w * 0.06, h * 0.12, w * 0.88, h * 0.76);
    g.fillStyle = 'rgba(255,255,255,.12)';
    g.fillRect(0, 0, w * 0.35, h);
    g.strokeStyle = marcoColor;
    g.lineWidth = 6;
    g.strokeRect(3, 3, w - 6, h - 6);
    for (const x of [0.25, 0.75]) { g.beginPath(); g.moveTo(w * x, 0); g.lineTo(w * x, h); g.stroke(); }
  };
}

/** la puerta de madera marrón de dos hojas */
function puertaMadera(g, w, h) {
  g.fillStyle = '#7a4a2a';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(0,0,0,.3)';
  g.lineWidth = 2;
  for (let x = 6; x < w; x += 8) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  g.lineWidth = 4;
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
}

/** el portón grande de madera marrón, de dos hojas con tablas */
function porton(g, w, h) {
  g.fillStyle = '#6a4228';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(0,0,0,.28)';
  g.lineWidth = 2;
  for (let x = 6; x < w; x += 9) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  g.lineWidth = 5;
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
  g.fillStyle = '#2a2a2c';
  for (const x of [0.46, 0.54]) g.fillRect(w * x - 2, h * 0.5, 4, h * 0.08);
}

// ——— las piezas ———

/** la pared blanca lisa, de s0 a s1, con su cornisa (los huecos van pintados encima, en la cara) */
function pared(k, S0, S1) {
  k.box((S0 + S1) / 2, 0, Z + 0.15, S1 - S0, YP, 0.3, BLANCO);
  k.block((S0 + S1) / 2, Z + 0.15, S1 - S0, 0.3);
  k.box((S0 + S1) / 2, YP - 0.25, ZF + 0.04, S1 - S0, 0.25, 0.1, 0xe8e8e4);
}

/** la cara larga de la calle Fajardo */
function caraLarga(k) {
  const S1 = 24.8;
  const altas = [[1.2, 5.4], [9.6, 13.6], [16.2, 19.4]];
  pared(k, 0, S1);
  const vt = canvasTex(200, 60, ventana('#2a6a3a'));
  for (const [a, b] of altas) k.pic((a + b) / 2, 3.95, ZF + 0.005, b - a, 0.9, 0, 1, vt);
  // los tres carteles verdes
  const carteles = [
    [4.4, 4.0, cartel('MUEBLES DE OCASIÓN', muebles)],
    [11.4, 4.6, cartel('PORTES & MUDANZAS', camion)],
    [17.9, 3.6, cartel('ESTABLECIMIENTO SOLIDARIO', mundo)],
  ];
  for (const [s, w, dib] of carteles) {
    k.box(s, 2.0, ZF + 0.01, w, 1.25, 0.03, 0xf2f2ee);
    k.pic(s, 2.625, ZF + 0.03, w - 0.02, 1.23, 0, 1, canvasTex(Math.round(w * 90), 110, dib));
  }
  // la puerta de madera y el cajetín
  k.pic(18.05, 1.2, ZF + 0.005, 1.3, 2.4, 0, 1, canvasTex(120, 220, puertaMadera));
  k.box(18.05, 0, ZF + 0.08, 1.5, 0.12, 0.3, 0xd8d4cc);
  k.box(19.6, 1.0, ZF + 0.04, 0.45, 0.6, 0.1, 0xe8e6e0);
}

/** la cara corta de Cienfuegos: el portón de madera, la banda de «OUTLET Remar» y la ventana grande */
function caraCorta(k) {
  const S1 = 7.85;
  pared(k, 0, S1);
  k.pic(2.9, 1.45, ZF + 0.005, 3.0, 2.9, 0, 1, canvasTex(260, 250, porton));
  for (const t of [1.4, 4.4]) k.box(t, 0, ZF + 0.02, 0.1, 2.9, 0.06, 0x4a3020);
  k.box(2.9, 2.9, ZF + 0.02, 3.1, 0.08, 0.08, 0x4a3020);
  k.box(2.9, 3.0, ZF + 0.01, 3.8, 0.6, 0.03, 0xf6f6f2);
  k.pic(2.9, 3.3, ZF + 0.03, 3.78, 0.58, 0, 1, canvasTex(380, 58, bandaOutlet));
  k.pic(2.9, 4.4, ZF + 0.005, 3.0, 1.1, 0, 1, canvasTex(240, 90, ventana('#6a4a2a')));
}

/** se monta con lo demás de Arrecife Centro: las dos caras de la nave */
export function buildRemarOutlet(scene, colliders, map) {
  if (!map?.remarOutlet) return null;
  const partes = [];
  for (const [M, nom, hacer] of [[LARGA, 'remarOutletFajardo', caraLarga], [CORTA, 'remarOutletCienfuegos', caraCorta]]) {
    const k = new Kit();
    hacer(k);
    const group = enMarco(k, M, nom, colliders);
    scene.add(group);
    partes.push(group);
  }
  return { partes };
}
