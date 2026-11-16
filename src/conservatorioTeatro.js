import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alturaBloque, alzarEdificio, cristales } from './edificioReal.js';

/**
 * El Conservatorio (Centro Insular de Enseñanzas Musicales, Rambla Medular 67) y el Teatro Víctor Fernández Gopar
 * «El Salinero» (Rambla Medular 65, del Cabildo), con las vistas de la calle de Google de julio de 2025 (solo se miran,
 * no van dentro del juego; la gente no se pone). El mapa tenía los dos bloques grises de 4 y 5 m y lisos.
 * El Conservatorio: el edificio blanco de tres plantas (10,5 m) de la esquina del este, con la balaustrada blanca de la
 * azotea, las molduras de cada planta, las ventanas de cuarterones, la ventana de arco con el balconcito, el portón del
 * garaje con los sillares oscuros a los lados, las letras de «CIEM» y los faroles negros; el ala baja blanca de en medio,
 * metida detrás de su explanada, con la fila de ventanas de cuarterones y la balaustrada; y al oeste, el muro blanco con
 * la reja blanca del patio. El Teatro: el edificio forrado de placas color beis (13 m), con la fila de ventanitas
 * estrechas, el barco dibujado y las letras de «TEATRO VÍCTOR FERNÁNDEZ GOPAR "EL SALINERO"», el gran ventanal oscuro con
 * las barandillas, las rajas altas de cristal y los paneles de los carteles abajo (sin los carteles).
 */

// las caras de la Rambla, del este al oeste, N hacia la calle (al norte)
const T = marco([-439.8, -346.14], [-474.81, -352.74]);
const C1 = marco([-474.81, -352.74], [-509.63, -359.34]);
const C2 = marco([-510.83, -353.94], [-534.84, -358.34]);
const C3 = marco([-534.04, -363.35], [-562.45, -368.75]);
const Z = 0.12, ZF = Z + 0.3, BLANCO = 0xf4f4f0, BEIS = 0xcdb89a, HC = 10.5, HT = 13;

/** antes de levantar la ciudad: los dos bloques a su altura y color, y la parte alta del Conservatorio */
export function tuneConservatorioTeatro(map) {
  const c = alturaBloque(map, -520, -345, 5.2, [244, 244, 240]);
  const t = alturaBloque(map, -458, -337, HT, [205, 184, 154]);
  if (!c || !t) return;
  map.conservatorioTeatro = true;
  alzarEdificio(map, C1, 0, C1.len, 14, HC, [244, 244, 240]);
}

// ——— lo que se pinta en lienzo ———

/** las placas color beis del teatro */
function placas(g, w, h) {
  g.fillStyle = '#cdb89a';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(120,100,76,.45)';
  g.lineWidth = 1.2;
  const t = h / 14;
  for (let y = t; y < h; y += t) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  for (let x = t * 1.4; x < w; x += t * 1.4) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
}

/** el barco y las letras del teatro */
function letrasTeatro(g, w, h) {
  g.fillStyle = '#cdb89a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#2a2a2c';
  const cx = w / 2;
  g.beginPath(); g.moveTo(cx, h * 0.02); g.lineTo(cx - w * 0.06, h * 0.2); g.lineTo(cx + w * 0.06, h * 0.2); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(cx - w * 0.08, h * 0.22); g.quadraticCurveTo(cx, h * 0.34, cx + w * 0.08, h * 0.22); g.fill();
  for (const y of [0.3, 0.34, 0.38]) g.fillRect(cx - w * 0.05, h * y, w * 0.1, h * 0.015);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(h * 0.13)}px "Arial Narrow", Arial, sans-serif`;
  g.fillText('TEATRO', cx, h * 0.52, w * 0.5);
  g.font = `800 ${Math.round(h * 0.1)}px "Arial Narrow", Arial, sans-serif`;
  g.fillText('VÍCTOR FERNÁNDEZ GOPAR', cx, h * 0.7, w * 0.96);
  g.fillText('"EL SALINERO"', cx, h * 0.86, w * 0.6);
}

/** las letras de «CIEM» color teja */
function ciem(g, w, h) {
  g.fillStyle = '#f4f4f0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#a84a2a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 800 ${Math.round(h * 0.6)}px Georgia, serif`;
  g.fillText('CIEM', w / 2, h * 0.42, w * 0.9);
  g.font = `600 ${Math.round(h * 0.12)}px Arial, sans-serif`;
  g.fillText('CENTRO INSULAR DE ENSEÑANZAS MUSICALES', w / 2, h * 0.85, w * 0.96);
}

/** el panel de los carteles, sin los carteles: el marco rojo y el fondo blanco */
function panel(g, w, h) {
  g.fillStyle = '#b83a32';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f2f0ea';
  g.fillRect(4, h * 0.12, w - 8, h * 0.84);
  g.fillStyle = 'rgba(60,60,70,.15)';
  for (let y = h * 0.2; y < h * 0.9; y += h * 0.12) g.fillRect(8, y, w - 16, 3);
}

/** la ventana de cuarterones blanca */
const cuarterones = cristales('#f2f2ee', 2, 'rgba(225,225,215,.4)');
const ventanalOscuro = cristales('#3a2e26', 3, 'rgba(160,175,185,.2)');

// ——— las piezas ———

/** la balaustrada blanca de la azotea, a lo largo de L */
function balaustrada(k, L, y) {
  k.box(L / 2, y, ZF + 0.05, L, 0.12, 0.35, BLANCO);
  for (let s = 0.2; s < L - 0.1; s += 0.28) k.cyl(s, y + 0.12, ZF + 0.05, 0.06, 0.08, 0.6, 0xf8f8f4, { seg: 6 });
  k.box(L / 2, y + 0.72, ZF + 0.05, L, 0.1, 0.35, BLANCO);
  for (let s = 0; s <= L; s += 3.4) k.box(s, y, ZF + 0.05, 0.4, 0.95, 0.4, BLANCO);
}

/** la parte alta del Conservatorio, en la esquina del este */
function conservatorio(k) {
  const L = C1.len;
  k.box(L / 2, 0, Z + 0.15, L, HC, 0.3, BLANCO);
  k.block(L / 2, Z + 0.15, L, 0.3);
  for (const y of [3.4, 6.6]) k.box(L / 2, y, ZF + 0.08, L, 0.18, 0.2, 0xe8e8e2);
  balaustrada(k, L, HC);
  for (const y of [1.0, 4.2, 7.4]) for (let s = 3; s < L - 2; s += 3.6) {
    if (y === 1.0 && s > 8 && s < 13) continue;
    k.pic(s, y + 0.8, ZF + 0.012, 0.75, 1.5, 0, 1, canvasTex(30, 60, cuarterones));
  }
  k.pic(14, 5.2, ZF + 0.012, 1.1, 1.8, 0, 1, canvasTex(44, 72, cuarterones));
  k.cyl(14, 6.1, ZF + 0.015, 0.55, 0.55, 0.03, 0xe8e8e2, { seg: 16, rx: Math.PI / 2 });
  for (let s = 13.4; s <= 14.61; s += 0.15) k.box(s, 4.3, ZF + 0.4, 0.04, 0.6, 0.04, 0xf2f2ee);
  k.box(14, 4.25, ZF + 0.25, 1.4, 0.08, 0.5, 0xe8e8e2);
  // el portón del garaje con los sillares oscuros a los lados
  k.box(10.5, 0, ZF + 0.02, 3.6, 2.8, 0.05, 0xd8d8d4);
  for (const s of [8.5, 12.5]) for (let y = 0; y < 2.9; y += 0.5) k.box(s + (y % 1 ? 0.1 : 0), y, ZF + 0.08, 0.5, 0.45, 0.15, 0x2a2a2c);
  k.pic(3.6, 3.0, ZF + 0.02, 2.4, 1.4, 0, 1, canvasTex(160, 90, ciem));
  for (const s of [1.4, L - 5]) { k.box(s, 2.6, ZF + 0.25, 0.3, 0.45, 0.3, 0x1a1a1a); k.box(s, 2.5, ZF + 0.12, 0.05, 0.1, 0.25, 0x1a1a1a); }
}

/** el ala baja de en medio, con la balaustrada y la fila de ventanas de cuarterones */
function alaBaja(k) {
  const L = C2.len;
  k.box(L / 2, 0, Z + 0.15, L, 5.2, 0.3, BLANCO);
  k.block(L / 2, Z + 0.15, L, 0.3);
  k.box(L / 2, 4.0, ZF + 0.1, L, 0.2, 0.25, 0xe8e8e2);
  balaustrada(k, L, 4.3);
  for (let s = 1.6; s < L - 1; s += 2.4) k.pic(s, 2.2, ZF + 0.012, 1.3, 1.1, 0, 1, canvasTex(52, 44, cuarterones));
  for (const s of [4, L - 4]) { k.box(s, 2.9, ZF + 0.25, 0.3, 0.45, 0.3, 0x1a1a1a); k.box(s, 2.8, ZF + 0.12, 0.05, 0.1, 0.25, 0x1a1a1a); }
}

/** el muro blanco con la reja blanca del patio del oeste */
function patio(k) {
  const L = C3.len;
  k.box(L / 2, 0, Z + 0.15, L, 1.5, 0.3, BLANCO);
  k.block(L / 2, Z + 0.15, L, 0.3);
  k.box(L / 2, 2.8, ZF, L, 0.06, 0.06, 0xf4f4f2);
  for (let s = 0.1; s < L; s += 0.18) k.box(s, 1.5, ZF, 0.04, 1.3, 0.04, 0xf4f4f2);
  for (let s = 0; s <= L; s += 3.2) k.box(s, 1.5, ZF, 0.14, 1.4, 0.14, 0xf4f4f2);
}

/** el teatro */
function teatro(k) {
  const L = T.len;
  k.box(L / 2, 0, Z + 0.15, L, HT, 0.3, BEIS);
  k.block(L / 2, Z + 0.15, L, 0.3);
  k.pic(L / 2, HT / 2, ZF + 0.004, L, HT, 0, 1, canvasTex(Math.round(L * 12), Math.round(HT * 12), placas));
  for (let s = 2; s < 13; s += 1.6) k.box(s, HT - 3.2, ZF + 0.01, 0.4, 1.8, 0.03, 0x2a2a2c);
  k.pic(9, 6.2, ZF + 0.012, 9, 5.4, 0, 1, canvasTex(450, 270, letrasTeatro));
  // el gran ventanal oscuro con las barandillas y los paneles de los carteles
  const v = 24, VW = 11;
  k.pic(v, 8.2, ZF + 0.012, VW, 7.2, 0, 1, canvasTex(330, 216, ventanalOscuro), { glow: 0.1 });
  for (const y of [5.6, 9.2]) {
    k.box(v, y + 1.0, ZF + 0.3, VW, 0.05, 0.05, 0xd8d8d4);
    for (let s = v - VW / 2; s <= v + VW / 2; s += 0.3) k.box(s, y, ZF + 0.3, 0.03, 1.0, 0.03, 0xd8d8d4);
  }
  for (let s = v - VW / 2 + 1; s < v + VW / 2; s += 2.0) k.pic(s, 2.4, ZF + 0.02, 1.8, 2.6, 0, 1, canvasTex(60, 88, panel));
  for (const s of [L - 4, L - 1.8]) k.pic(s, 6.5, ZF + 0.012, 0.9, 8, 0, 1, canvasTex(30, 260, ventanalOscuro));
}

/** se monta con lo de la Rambla Medular */
export function buildConservatorioTeatro(scene, colliders, map) {
  if (!map?.conservatorioTeatro) return null;
  const grupos = [[T, 'teatroSalinero', teatro], [C1, 'conservatorio', conservatorio], [C2, 'conservatorioAla', alaBaja], [C3, 'conservatorioPatio', patio]].map(([m, n, f]) => {
    const k = new Kit();
    f(k);
    const g = enMarco(k, m, n, colliders);
    scene.add(g);
    return g;
  });
  return { group: grupos[0], grupos };
}
