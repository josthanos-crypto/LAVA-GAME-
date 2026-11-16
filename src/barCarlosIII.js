import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * El Bar Carlos III, cocina peruana, en la calle Carlos III 67, en la esquina (Titerroy), con la vista de la calle de
 * Google de julio de 2025 y las fotos de Google Maps de 2023 a 2026 (solo se miran, no van dentro del juego; la gente
 * no se pone): la casa terrera blanca con el zócalo de piedra gris en placas y el alero ancho de arriba; la persiana
 * blanca grande del bar; encima, la banda roja con «Bar Carlos III» en letras de colores y «Perú» en blanco (sin el
 * dibujo del logotipo); el cartel redondo de la azotea con «BAR CARLOS III» alrededor (sin la marca de refresco del
 * medio); la puerta de madera blanca, la ventana de marco blanco, el buzón y la alarma roja. El bloque del mapa se
 * queda como está; lo de abajo tapa su trozo.
 */

// la cara de la calle Carlos III de la manzana (s de oeste a este, hasta la esquina en s 77,3); la vista de la calle
// pone el bar en los últimos 12 m, junto a la esquina (Google lo pone en s 72; el mapa no tenía rótulo)
const M = marco([-429.44, -783.04], [-367.14, -828.83]);
const Z = 0.12, ZF = Z + 0.3, S0 = 65.5, S1 = 77.3, YP = 3.4, BLANCO = 0xf4f4f0;

/** antes de levantar la ciudad: solo la marca de que se monta (el mapa no tenía rótulo suyo) */
export function tuneBarCarlosIII(map) {
  map.barCarlosIII = true;
}

// ——— lo que se pinta en lienzo ———

/** la piedra gris del zócalo, en placas */
function piedra(g, w, h) {
  g.fillStyle = '#8c8e90';
  g.fillRect(0, 0, w, h);
  let s = 19;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let y = 0; y < h; y += h / 3) {
    for (let x = -r() * 40; x < w; x += 40) {
      const v = 128 + Math.floor(r() * 26);
      g.fillStyle = `rgb(${v},${v + 2},${v + 4})`;
      g.fillRect(x + 1, y + 1, 38, h / 3 - 2);
    }
  }
}

/** la persiana blanca de lamas */
function persiana(g, w, h) {
  g.fillStyle = '#e8e8e6';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c8c8c6';
  for (let y = 4; y < h; y += 8) g.fillRect(0, y, w, 2);
  g.fillStyle = '#9a9a98';
  g.fillRect(0, h - 6, w, 6);
}

/** la banda roja con «Bar Carlos III» en letras de colores y «Perú» */
function banda(g, w, h) {
  g.fillStyle = '#d82a2a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4f4f0';
  g.fillRect(w * 0.02, h * 0.15, w * 0.1, h * 0.7);
  g.strokeStyle = '#d82a2a';
  g.lineWidth = 3;
  for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(w * 0.07, h * 0.5); g.lineTo(w * (0.03 + i * 0.02), h * 0.2); g.stroke(); }
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  g.font = `italic 900 ${Math.round(h * 0.62)}px "Arial Black", Arial, sans-serif`;
  const t = 'Bar Carlos III', col = ['#f2d24a', '#6ab04a', '#3a8ad8', '#8a5ac8', '#e87a2a'];
  let x = w * 0.16;
  [...t].forEach((c, i) => { g.fillStyle = col[i % col.length]; g.strokeStyle = '#2a2a2c'; g.lineWidth = 2; g.strokeText(c, x, h * 0.52); g.fillText(c, x, h * 0.52); x += g.measureText(c).width; });
  g.fillStyle = '#f4f4f0';
  g.font = `700 ${Math.round(h * 0.5)}px Georgia, serif`;
  g.textAlign = 'right';
  g.fillText('Perú', w * 0.97, h * 0.55);
}

/** el cartel redondo de la azotea: el aro blanco con «BAR CARLOS III» y el centro rojo liso */
function redondo(g, w, h) {
  g.fillStyle = '#f4f4f0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#1e1e20';
  g.beginPath(); g.arc(w / 2, h / 2, w * 0.49, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#f4f4f0';
  g.beginPath(); g.arc(w / 2, h / 2, w * 0.45, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#d82a2a';
  g.beginPath(); g.arc(w / 2, h / 2, w * 0.3, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#1e1e20';
  g.font = `900 ${Math.round(w * 0.1)}px "Arial Black", Arial, sans-serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const t = 'BAR CARLOS III';
  [...t].forEach((c, i) => {
    const a = Math.PI * (0.8 + i * 0.1);
    g.save(); g.translate(w / 2 + Math.cos(a) * w * 0.375, h / 2 + Math.sin(a) * w * 0.375); g.rotate(a + Math.PI / 2); g.fillText(c, 0, 0); g.restore();
  });
}

/** la puerta de madera blanca de cuarterones */
function puerta(g, w, h) {
  g.fillStyle = '#ecece8';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(0,0,0,.18)';
  g.lineWidth = 3;
  for (const [y, hh] of [[0.05, 0.4], [0.5, 0.45]]) g.strokeRect(w * 0.15, h * y, w * 0.7, h * hh);
}

/** la ventana de marco blanco */
function ventana(g, w, h) {
  g.fillStyle = '#5a6a74';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.18)';
  g.fillRect(0, 0, w * 0.4, h);
  g.strokeStyle = '#f4f4f0';
  g.lineWidth = 6;
  g.strokeRect(3, 3, w - 6, h - 6);
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
}

// ——— las piezas ———

/** la casa terrera: la pared, el zócalo, el alero, la persiana, la banda, la puerta, la ventana y el cartel redondo */
function fachada(k) {
  const W = S1 - S0, c = (S0 + S1) / 2;
  k.box(c, 0, Z + 0.15, W, YP, 0.3, BLANCO);
  k.block(c, Z + 0.15, W, 0.3);
  k.pic(c, 0.6, ZF + 0.005, W, 1.2, 0, 1, canvasTex(Math.round(W * 40), 48, piedra));
  // el alero ancho de arriba
  k.box(c, YP, Z + 0.45, W + 0.4, 0.22, 0.9, 0xf2f2ee);
  // la persiana del bar y su banda roja
  k.pic(73.6, 1.3, ZF + 0.01, 3.4, 2.6, 0, 1, canvasTex(240, 190, persiana));
  for (const t of [71.9, 75.3]) k.box(t, 0, ZF + 0.02, 0.06, 2.65, 0.06, 0xb8b8b4);
  k.box(73.6, 2.75, ZF + 0.01, 4.4, 0.42, 0.04, 0xd82a2a);
  k.pic(73.6, 2.96, ZF + 0.035, 4.38, 0.4, 0, 1, canvasTex(440, 40, banda));
  // la alarma roja, el buzón, la puerta y la ventana
  k.box(76.4, 2.6, ZF + 0.04, 0.35, 0.22, 0.08, 0xc82a2a);
  k.box(70.6, 1.3, ZF + 0.04, 0.3, 0.38, 0.1, 0x6a6c70);
  k.pic(69.4, 1.1, ZF + 0.01, 0.95, 2.2, 0, 1, canvasTex(90, 210, puerta));
  k.box(69.4, 2.2, ZF + 0.02, 1.05, 0.08, 0.06, 0xe8e8e4);
  k.pic(67.4, 1.6, ZF + 0.01, 1.0, 1.3, 0, 1, canvasTex(100, 130, ventana));
  // el cartel redondo de la azotea, sobre su palo
  k.box(76.0, YP + 0.2, Z + 0.35, 0.08, 1.0, 0.08, 0x3a3a3c);
  k.box(76.0, YP + 1.0, Z + 0.35, 1.3, 1.3, 0.12, 0xf4f4f0);
  k.pic(76.0, YP + 1.65, Z + 0.42, 1.3, 1.3, 0, 1, canvasTex(160, 160, redondo));
}

/** se monta con lo demás de Titerroy */
export function buildBarCarlosIII(scene, colliders, map) {
  if (!map?.barCarlosIII) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, M, 'barCarlosIII', colliders);
  scene.add(group);
  return { group };
}
