import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * El Rincón de Fajardo, el bar restaurante de la calle Fajardo 37 (centro), con la vista de la calle de Google de
 * julio de 2025 y la de abril de 2011 (solo se miran, no van dentro del juego; la gente no se pone): el bajo del
 * edificio grande forrado de piedra gris en hiladas; la cristalera del bar con sus marcos de aluminio plateado,
 * las dos puertas y el paño del medio con «EL RINCÓN DE FAJARDO» escrito en el cristal, los cristales de arriba
 * con las fotos de los platos y el bar por dentro con su luz cálida; la alarma roja; y más allá, la entrada del
 * garaje con su rejilla de lamas y la señal de prohibido aparcar. La terraza de sillas blancas de las fotos está
 * en una acera ancha que en el juego no hay (la calzada llega a la pared), así que no se pone; las sombrillas
 * llevan marca. El bloque se queda como está; lo de abajo tapa su trozo.
 */

// la cara de la calle Fajardo del edificio (s de este a oeste, desde la esquina con la casa vieja de al lado); la
// vista de la calle pone la cristalera en s 0,3–5,9 y el garaje en s 11,8–14,6 (el rótulo del mapa caía en la casa
// de al lado y Google pone el sitio unos metros más allá, en el garaje)
const M = marco([-146.17, 95.01], [-182.78, 68.42]);
const Z = 0.12, ZF = Z + 0.3, S0 = 0, S1 = 15.2, YP = 3.9, GRIS = 0x8a8c8e, ALU = 0xb8bcc0;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneRinconFajardo(map) {
  map.rinconFajardoSign = null;
  const i = (map.signs || []).findIndex(s => /Rinc.n de Fajardo/.test(s.name) && Math.hypot(s.x + 144.3, s.z - 96.5) < 15);
  if (i >= 0) map.rinconFajardoSign = map.signs.splice(i, 1)[0];
  map.rinconFajardo = true;
}

// ——— lo que se pinta en lienzo ———

/** la piedra gris en hiladas de unos 45 cm, para un trozo de pared de wm × hm metros */
const piedra = (wm, hm) => canvasTex(Math.max(16, Math.round(wm * 40)), Math.max(16, Math.round(hm * 40)), (g, w, h) => {
  g.fillStyle = '#8a8c8e';
  g.fillRect(0, 0, w, h);
  let s = 3;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const fila = h / Math.max(1, Math.round(hm / 0.45));
  for (let y = 0; y < h; y += fila) {
    let x = -r() * w * 0.3;
    while (x < w) {
      const l = 40 * (0.5 + r() * 0.6), v = 128 + Math.floor(r() * 22);
      g.fillStyle = `rgb(${v},${v + 2},${v + 4})`;
      g.fillRect(x + 1, y + 1, l - 2, fila - 2);
      x += l;
    }
  }
  g.fillStyle = 'rgba(0,0,0,.06)';
  for (let i = 0; i < 300; i++) g.fillRect(r() * w, r() * h, 2, 2);
});

/** el bar por el cristal: la luz cálida, la barra, las mesas y la columna */
function dentro(g, w, h, letras) {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, '#d8b888');
  gr.addColorStop(1, '#6a5a4a');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#4a3a2e';
  g.fillRect(0, h * 0.45, w, h * 0.2);
  g.fillStyle = '#e8e0d0';
  for (let x = 0.08; x < 0.95; x += 0.22) g.fillRect(w * x, h * 0.62, w * 0.12, h * 0.04);
  g.fillStyle = '#8a7058';
  g.fillRect(w * 0.45, 0, w * 0.06, h);
  g.fillStyle = 'rgba(200,215,225,.22)';
  g.fillRect(0, 0, w, h);
  if (letras) {
    g.fillStyle = 'rgba(245,245,240,.85)';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `400 ${Math.round(h * 0.05)}px "Segoe UI", Arial, sans-serif`;
    g.fillText('EL RINCÓN DE FAJARDO', w / 2, h * 0.3);
  }
}

/** los cristales de arriba: dos con las fotos de los platos y los demás con el reflejo del cielo */
function arriba(g, w, h) {
  g.fillStyle = '#9aaab4';
  g.fillRect(0, 0, w, h);
  const n = 6, p = w / n;
  for (let i = 0; i < n; i++) {
    if (i === 0 || i === 3) {
      g.fillStyle = '#f2ece0';
      g.fillRect(i * p + 4, 4, p - 8, h - 8);
      g.fillStyle = i === 0 ? '#d88a3a' : '#b84a2a';
      g.beginPath(); g.ellipse(i * p + p * 0.5, h * 0.55, p * 0.32, h * 0.28, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#6a9a3a';
      g.beginPath(); g.ellipse(i * p + p * 0.62, h * 0.45, p * 0.1, h * 0.1, 0, 0, Math.PI * 2); g.fill();
    } else {
      g.fillStyle = 'rgba(255,255,255,.18)';
      g.fillRect(i * p + 4, 4, (p - 8) * 0.4, h - 8);
    }
  }
}

/** la entrada del garaje, abierta, con la rampa de rayas */
function garaje(g, w, h) {
  g.fillStyle = '#2a2a2c';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8d8d4';
  g.fillRect(0, 0, w, h * 0.35);
  g.save();
  g.translate(0, h * 0.62);
  g.rotate(-0.1);
  for (const [c, t] of [['#c82a2a', 0.05], ['#f2f2ee', 0.04], ['#1e1e20', 0.06]]) { g.fillStyle = c; g.fillRect(0, 0, w * 1.2, h * t); g.translate(0, h * t); }
  g.restore();
  g.fillStyle = '#e8c82a';
  g.beginPath(); g.moveTo(w * 0.3, h); g.lineTo(w, h * 0.72); g.lineTo(w, h * 0.76); g.lineTo(w * 0.42, h); g.fill();
}

/** la rejilla de lamas de encima del garaje */
function lamas(g, w, h) {
  g.fillStyle = '#9a8a74';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#6a5a48';
  for (let y = 3; y < h; y += 7) g.fillRect(0, y, w, 3);
  g.fillStyle = '#8a8c8e';
  for (const x of [0.33, 0.66]) g.fillRect(w * x - 2, 0, 4, h);
}

/** la señal de prohibido aparcar */
function senal(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c82a2a';
  g.beginPath(); g.arc(w / 2, h * 0.42, w * 0.38, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#2a5ab8';
  g.beginPath(); g.arc(w / 2, h * 0.42, w * 0.28, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#c82a2a';
  g.lineWidth = w * 0.08;
  g.beginPath(); g.moveTo(w * 0.3, h * 0.24); g.lineTo(w * 0.7, h * 0.6); g.stroke();
}

// ——— las piezas ———

/** el bajo de piedra, la cristalera del bar y el garaje */
function fachada(k) {
  // la piedra: a los lados de la cristalera, entre el bar y el garaje, encima de todo y al final
  const trozos = [[S0, 0.3, 0, YP], [5.9, 11.8, 0, YP], [0.3, 5.9, 3.1, YP], [11.8, 14.6, 2.9, YP], [14.6, S1, 0, YP]];
  for (const [a, b, y0, y1] of trozos) {
    k.box((a + b) / 2, y0, Z + 0.15, b - a, y1 - y0, 0.3, GRIS);
    k.pic((a + b) / 2, (y0 + y1) / 2, ZF + 0.005, b - a, y1 - y0, 0, 1, piedra(b - a, y1 - y0));
  }
  k.block((S0 + S1) / 2, Z + 0.15, S1 - S0, 0.3);
  // la cristalera: las dos puertas, el paño del medio con el nombre y los cristales de arriba
  k.pic(1.175, 1.1, Z + 0.04, 1.75, 2.2, 0, 1, canvasTex(160, 200, (g, w, h) => dentro(g, w, h, false)), { glow: 0.3 });
  k.pic(3.1, 1.1, Z + 0.04, 2.1, 2.2, 0, 1, canvasTex(400, 420, (g, w, h) => dentro(g, w, h, true)), { glow: 0.3 });
  k.pic(5.025, 1.1, Z + 0.04, 1.75, 2.2, 0, 1, canvasTex(160, 200, (g, w, h) => dentro(g, w, h, false)), { glow: 0.3 });
  k.pic(3.1, 2.65, Z + 0.04, 5.6, 0.86, 0, 1, canvasTex(480, 74, arriba));
  // los marcos de aluminio
  for (const t of [0.3, 1.18, 2.05, 2.15, 4.05, 4.15, 5.02, 5.9]) k.box(t, 0, Z + 0.1, 0.06, 3.1, 0.1, ALU);
  for (const y of [0, 2.2, 3.06]) k.box(3.1, y, Z + 0.1, 5.6, 0.06, 0.1, ALU);
  for (const t of [0.3 + 5.6 / 6, 0.3 + 5.6 / 3, 0.3 + 5.6 / 2, 0.3 + 5.6 * 2 / 3, 0.3 + 5.6 * 5 / 6]) k.box(t, 2.2, Z + 0.1, 0.05, 0.86, 0.1, ALU);
  // los tiradores de las puertas
  for (const t of [1.08, 1.28, 4.92, 5.12]) k.box(t, 0.9, Z + 0.17, 0.03, 0.5, 0.03, ALU);
  // la alarma roja y la placa blanca
  k.box(8.0, 2.55, ZF + 0.02, 0.32, 0.22, 0.06, 0xc82a2a);
  k.box(8.9, 0.9, ZF + 0.01, 0.55, 0.42, 0.02, 0xece8e0);
  // el garaje: la entrada abierta, la rejilla de lamas de encima y la señal
  k.pic(13.2, 1.2, Z + 0.02, 2.8, 2.4, 0, 1, canvasTex(240, 210, garaje));
  k.pic(13.2, 2.65, ZF + 0.005, 2.8, 0.5, 0, 1, canvasTex(240, 44, lamas));
  for (const t of [11.8, 14.6]) k.box(t, 0, Z + 0.15, 0.12, 2.9, 0.3, 0x7a7c7e);
  k.pic(11.4, 1.85, ZF + 0.012, 0.3, 0.4, 0, 1, canvasTex(48, 64, senal));
}

/** se monta con lo demás de Arrecife Centro */
export function buildRinconFajardo(scene, colliders, map) {
  if (!map?.rinconFajardo) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, M, 'rinconFajardo', colliders);
  scene.add(group);
  return { group };
}
