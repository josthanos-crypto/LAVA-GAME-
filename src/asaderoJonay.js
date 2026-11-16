import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';
import { Z, ZF, BLANCO, MARRON_OSC, pared } from './rapadurasSur.js';

/**
 * El Asadero de Pollos JONAY ALTAVISTA, en la esquina de la calle Chafarís con la calle Ángel Ganivet (Altavista), con
 * las fotos del local de junio de 2023 y las vistas de la calle de Google de julio de 2025 (Chafarís 55 y 57, Ángel
 * Ganivet 39; solo se miran, no van dentro del juego). El mapa tenía la esquina como el bloque genérico de 9 m con las
 * ventanas repetidas. De verdad es una casa de tres plantas:
 * - abajo, de ladrillo visto con la franja gris de encima: por Chafarís, la puerta blanca del portal y las puertas de
 *   cristal del asadero en la esquina, con el letrero vertical; por Ángel Ganivet, el cartel grande amarillo («ASADERO DE
 *   POLLOS / JONAY / ALTAVISTA / COMIDAS PREPARADAS PARA LLEVAR · POSTRES · ENSALADAS»; sin la marca del refresco, sin
 *   las fotos de la comida y sin los teléfonos), el aparato del aire y la puerta blanca de lamas con su tejadillo;
 * - la primera planta blanca, con el balcón de la esquina de barandilla de madera oscura y las macetas, y las ventanas
 *   de persiana de madera marrón con su moldura;
 * - la segunda planta blanca, con la terraza de la esquina y el pretil.
 */

// la cara de Chafarís (de la punta del sur a la esquina; N al este) y la de Ángel Ganivet (de la esquina hacia el oeste;
// N al norte): son dos lados enteros del bloque del mapa
const JE = marco([-38.29, -981.07], [-42.35, -989.51]);
const JN = marco([-42.35, -989.51], [-74.29, -974.12]);
const LARGO_N = 15;
const P1 = 3.1, P2 = 6.1, ALTO = 9.0;

/** antes de levantar la ciudad */
export function tuneAsaderoJonay(map) {
  map.asaderoJonay = true;
}

/** el ladrillo visto rojizo con las llagas claras */
function ladrillo(g, w, h) {
  g.fillStyle = '#d8cbb8';
  g.fillRect(0, 0, w, h);
  let s = 5;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const bw = 14, bh = 4;
  for (let y = 0, f = 0; y < h; y += bh, f++) {
    for (let x = (f % 2) * -bw / 2; x < w; x += bw) {
      const v = r();
      g.fillStyle = `rgb(${Math.round(160 + v * 30)},${Math.round(88 + v * 22)},${Math.round(58 + v * 16)})`;
      g.fillRect(x + 0.6, y + 0.6, bw - 1.2, bh - 1.2);
    }
  }
}

/** el cartel grande del asadero: amarillo con el borde rojo y las letras rojas */
function cartel(g, w, h) {
  const fondo = g.createLinearGradient(0, 0, 0, h);
  fondo.addColorStop(0, '#f6d23a');
  fondo.addColorStop(1, '#f2b81e');
  g.fillStyle = fondo;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c4161c';
  g.lineWidth = h * 0.05;
  g.strokeRect(h * 0.03, h * 0.03, w - h * 0.06, h - h * 0.06);
  g.fillStyle = '#c4161c';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 800 ${Math.round(h * 0.13)}px "Arial Black", Arial, sans-serif`;
  g.fillText('ASADERO DE POLLOS', w * 0.5, h * 0.17, w * 0.8);
  g.fillStyle = '#7a1418';
  g.font = `900 ${Math.round(h * 0.28)}px "Arial Black", Arial, sans-serif`;
  g.fillText('JONAY', w * 0.5, h * 0.43, w * 0.6);
  g.font = `800 ${Math.round(h * 0.13)}px "Arial Black", Arial, sans-serif`;
  g.fillText('ALTAVISTA', w * 0.5, h * 0.63, w * 0.5);
  g.fillStyle = '#c4161c';
  g.fillRect(h * 0.08, h * 0.74, w - h * 0.16, h * 0.15);
  g.fillStyle = '#ffffff';
  g.font = `700 ${Math.round(h * 0.09)}px Arial, sans-serif`;
  g.fillText('COMIDAS PREPARADAS PARA LLEVAR · POSTRES · ENSALADAS', w * 0.5, h * 0.815, w * 0.88);
}

/** el letrero vertical de la esquina */
function letrero(g, w, h) {
  g.fillStyle = '#f6d23a';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c4161c';
  g.lineWidth = w * 0.06;
  g.strokeRect(w * 0.04, w * 0.04, w - w * 0.08, h - w * 0.08);
  g.fillStyle = '#c4161c';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(w * 0.14)}px "Arial Black", Arial, sans-serif`;
  g.fillText('ASADERO', w / 2, h * 0.16, w * 0.86);
  g.fillText('DE POLLOS', w / 2, h * 0.27, w * 0.86);
  g.fillStyle = '#7a1418';
  g.font = `900 ${Math.round(w * 0.22)}px "Arial Black", Arial, sans-serif`;
  g.fillText('JONAY', w / 2, h * 0.5, w * 0.9);
  g.font = `800 ${Math.round(w * 0.13)}px "Arial Black", Arial, sans-serif`;
  g.fillText('ALTAVISTA', w / 2, h * 0.72, w * 0.86);
}

/** la persiana de madera marrón de lamas, medio subida */
function persianaMadera(g, w, h) {
  g.fillStyle = '#2a2826';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#7a5236';
  g.fillRect(0, 0, w, h * 0.7);
  g.strokeStyle = '#5a3a26';
  g.lineWidth = 2;
  for (let y = 4; y < h * 0.7; y += 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.lineWidth = 3;
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
}

/** la puerta blanca de lamas del garaje */
function lamasBlancas(g, w, h) {
  g.fillStyle = '#f0f0ec';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#cfcfca';
  g.lineWidth = 2;
  for (let y = 4; y < h; y += 7) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.lineWidth = 3;
  for (const x of [w / 3, (2 * w) / 3]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
}

/** el bajo de ladrillo con la franja gris, de s0 a s1 */
function bajoLadrillo(k, s0, s1) {
  const w = s1 - s0, c = (s0 + s1) / 2;
  k.pic(c, P1 / 2, ZF + 0.006, w, P1, 0, 1, canvasTex(Math.min(1024, Math.round(w * 40)), Math.round(P1 * 40), ladrillo));
  k.box(c, P1 - 0.15, ZF + 0.02, w, 0.18, 0.08, 0x8a8c8c);
}

/** una ventana de persiana de madera, con el alféizar y la moldura blancos */
function ventanaMadera(k, s, y, w = 1.1, h = 1.2) {
  hueco(k, s, y, w, h, canvasTex(Math.round(w * 60), Math.round(h * 60), persianaMadera), { borde: MARRON_OSC, z: ZF });
  k.box(s, y + h + 0.08, ZF + 0.06, w + 0.5, 0.1, 0.14, 0xf4f4f0);
}

/** un balcón de esquina: la losa blanca, la barandilla de madera oscura y las macetas */
function balcon(k, s0, s1, y, sale, conMacetas) {
  const c = (s0 + s1) / 2, w = s1 - s0;
  k.box(c, y - 0.16, ZF + sale / 2, w, 0.16, sale, 0xf2f2ee);
  k.box(c, y + 0.9, ZF + sale - 0.05, w, 0.08, 0.1, 0x3a2a20);
  for (let s = s0 + 0.1; s <= s1; s += 0.13) k.box(s, y, ZF + sale - 0.05, 0.05, 0.9, 0.05, 0x3a2a20);
  if (conMacetas) for (let s = s0 + 0.4; s < s1 - 0.2; s += 0.9) {
    k.box(s, y + 0.98, ZF + sale - 0.05, 0.6, 0.22, 0.25, 0xb4502e);
    k.ball(s, y + 1.25, ZF + sale - 0.05, 0.22, 0x4a7a36, { sx: 1.4, sy: 0.8, sz: 1.0, seg: 7 });
  }
}

/** la cara de la calle Chafarís (s de la punta del sur a la esquina) */
function caraChafaris(k) {
  const L = JE.len;
  pared(k, 0, L, ALTO, (g, w, h) => { g.fillStyle = '#f2f2ee'; g.fillRect(0, 0, w, h); });
  bajoLadrillo(k, 0, L);
  k.box(L / 2, ALTO, ZF - 0.12, L, 0.6, 0.24, BLANCO);
  hueco(k, 1.6, 0, 0.95, 2.2, canvasTex(57, 132, cristales('#f2f2ee', 1, 'rgba(240,240,236,.85)')), { borde: 0xf2f2ee, z: ZF });
  hueco(k, 7.3, 0, 2.2, 2.45, canvasTex(132, 147, cristales('#f2f2ee', 2, 'rgba(70,60,50,.3)')), { borde: 0xf2f2ee, z: ZF });
  k.pic(L - 0.45, 2.75, ZF + 0.35, 0.6, 1.4, 0, 1, canvasTex(80, 186, letrero));
  k.box(L - 0.45, 2.75 - 0.7, ZF + 0.18, 0.06, 0.06, 0.34, 0x5a5a5a);
  // la esquina: el pilar que junta las dos caras (ladrillo abajo, blanco arriba)
  k.box(L + 0.21, 0, 0.21, 0.42, P1, 0.42, 0xa8613f);
  k.box(L + 0.21, P1, 0.21, 0.42, ALTO + 0.6 - P1, 0.42, 0xf2f2ee);
  ventanaMadera(k, 2.6, P1 + 0.8);
  balcon(k, 5.4, L + 1.42, P1, 1.0, true);
  hueco(k, 7.2, P1, 1.0, 2.1, canvasTex(60, 126, cristales('#6a4430', 2)), { borde: MARRON_OSC, z: ZF });
  ventanaMadera(k, 2.6, P2 + 0.8);
  balcon(k, 6.4, L + 1.22, P2, 0.8, false);
  hueco(k, 7.8, P2, 1.0, 2.1, canvasTex(60, 126, cristales('#f2f2ee', 2)), { borde: 0xf2f2ee, z: ZF });
}

/** la cara de la calle Ángel Ganivet (s de la esquina hacia el oeste) */
function caraGanivet(k) {
  pared(k, 0, LARGO_N, ALTO, (g, w, h) => { g.fillStyle = '#f2f2ee'; g.fillRect(0, 0, w, h); });
  bajoLadrillo(k, 0, LARGO_N);
  k.box(LARGO_N / 2, ALTO, ZF - 0.12, LARGO_N, 0.6, 0.24, BLANCO);
  // el cartel grande y el aparato del aire
  k.pic(3.6, 2.15, ZF + 0.03, 4.8, 1.45, 0, 1, canvasTex(640, 194, cartel));
  k.box(6.9, 1.9, ZF + 0.18, 0.8, 0.55, 0.3, 0xe8e8e4);
  // la puerta blanca de lamas con el tejadillo
  hueco(k, 10.6, 0, 2.5, 2.5, canvasTex(150, 150, lamasBlancas), { borde: 0x8a8c8c, z: ZF });
  k.box(10.6, 2.62, ZF + 0.25, 2.9, 0.2, 0.5, 0xf4f4f0);
  // arriba: el balcón de la esquina y las ventanas de persiana de madera
  balcon(k, -0.42, 4.0, P1, 1.0, true);
  hueco(k, 2.0, P1, 1.0, 2.1, canvasTex(60, 126, cristales('#6a4430', 2)), { borde: MARRON_OSC, z: ZF });
  for (const s of [6.4, 9.6, 12.8]) ventanaMadera(k, s, P1 + 0.8);
  balcon(k, -0.42, 3.0, P2, 0.8, false);
  for (const s of [6.4, 9.6, 12.8]) ventanaMadera(k, s, P2 + 0.8, 1.0, 1.1);
}

/** se monta con lo demás */
export function buildAsaderoJonay(scene, colliders, map) {
  if (!map?.asaderoJonay) return null;
  const ke = new Kit(), kn = new Kit();
  caraChafaris(ke);
  caraGanivet(kn);
  const grupos = [enMarco(ke, JE, 'asaderoJonayChafaris', colliders), enMarco(kn, JN, 'asaderoJonayGanivet', colliders)];
  for (const g of grupos) scene.add(g);
  return { grupos };
}
