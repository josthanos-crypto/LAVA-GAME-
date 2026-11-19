import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * La Pescadería Lanzapesca, en la calle Pérez Galdós 55 (local 2), con la foto de Google Maps de octubre de
 * 2026 (solo se mira, no va dentro del juego; la gente de la foto no se pone): el frente de aluminio blanco
 * con la puerta de «Local 2» y el escaparate, los dos con la reja de rombos echada por dentro y las cajas
 * de la pescadería al fondo; encima, el letrero blanco de «Pescadería Lanzapesca · Pescado de la isla» y el
 * montante de cristal con los peces blancos pegados; en el escaparate, el cartel azul del horario; y a la
 * derecha, la pilastra de granito gris que la separa del local de al lado. El bloque se queda como está.
 */

// la fachada de Pérez Galdós (s desde la esquina del norte); el rótulo del mapa cae en s 31,4
const P = marco([308.81, -199.72], [331.79, -232.25]);
const Z = 0.12, S0 = 29.0, S1 = 33.4, BLANCO = 0xf4f4f2;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneLanzapesca(map) {
  map.lanzapescaSign = null;
  const i = (map.signs || []).findIndex(s => /Lanzapesca/.test(s.name));
  if (i >= 0) map.lanzapescaSign = map.signs.splice(i, 1)[0];
  map.lanzapesca = true;
}

// ——— lo que se pinta en lienzo ———

/** el letrero blanco: «PESCADERÍA» en arco, «Lanzapesca» en azul y rojo con su pez, y «Pescado de la isla» */
function letrero(g, w, h) {
  g.fillStyle = '#f6f7f8';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c8ccd2';
  g.lineWidth = 4;
  g.strokeRect(2, 2, w - 4, h - 4);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#1e4fa8';
  g.font = `900 ${Math.round(h * 0.2)}px "Arial Black", Arial, sans-serif`;
  g.fillText('PESCADERÍA', w * 0.5, h * 0.18);
  let tam = h * 0.32;
  g.font = `italic 900 ${Math.round(tam)}px "Arial Black", Arial, sans-serif`;
  g.textAlign = 'left';
  const ancho = g.measureText('Lanzapesca').width;
  if (ancho > w * 0.68) { tam *= (w * 0.68) / ancho; g.font = `italic 900 ${Math.round(tam)}px "Arial Black", Arial, sans-serif`; }
  const a1 = g.measureText('Lanza').width, a2 = g.measureText('pesca').width, x0 = w * 0.6 - (a1 + a2) / 2;
  g.fillStyle = '#1e4fa8';
  g.fillText('Lanza', x0, h * 0.48);
  g.fillStyle = '#d0302a';
  g.fillText('pesca', x0 + a1, h * 0.48);
  g.textAlign = 'center';
  // el pez del logo, entre el nombre y el lema
  g.fillStyle = '#2a8ad0';
  g.beginPath(); g.ellipse(w * 0.12, h * 0.48, w * 0.06, h * 0.12, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.moveTo(w * 0.17, h * 0.48); g.lineTo(w * 0.22, h * 0.36); g.lineTo(w * 0.22, h * 0.6); g.closePath(); g.fill();
  g.fillStyle = '#1e4fa8';
  g.font = `italic 600 ${Math.round(h * 0.17)}px Georgia, serif`;
  g.fillText('Pescado de la isla', w * 0.5, h * 0.8);
}

/** el montante de cristal con los peces blancos pegados */
function montante(g, w, h) {
  g.fillStyle = '#5a6672';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.12)';
  g.fillRect(0, 0, w * 0.4, h);
  g.fillStyle = '#f2f2f0';
  for (const [x, y, e] of [[0.3, 0.3, 1], [0.55, 0.55, 0.9], [0.7, 0.8, 1.1]]) {
    g.beginPath(); g.ellipse(w * x, h * y, w * 0.1 * e, h * 0.08 * e, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(w * (x + 0.09 * e), h * y); g.lineTo(w * (x + 0.16 * e), h * (y - 0.07)); g.lineTo(w * (x + 0.16 * e), h * (y + 0.07)); g.closePath(); g.fill();
  }
}

/** el cristal con la reja de rombos echada por dentro y las cajas del fondo; con o sin el cartel del horario */
function reja(cartel, rotulo) {
  return (g, w, h) => {
    g.fillStyle = '#4a5560';
    g.fillRect(0, 0, w, h);
    // las cajas blancas apiladas del fondo
    g.fillStyle = '#c8ccd0';
    for (let y = h * 0.45; y < h; y += h * 0.07) g.fillRect(w * 0.15, y, w * 0.6, h * 0.055);
    // la reja de rombos (de escamas), en gris claro
    g.strokeStyle = 'rgba(200,200,195,.75)';
    g.lineWidth = 2;
    const p = w / 7;
    for (let y = 0; y < h + p; y += p * 0.7) for (let x = ((y / (p * 0.7)) % 2) * p / 2 - p; x < w + p; x += p) { g.beginPath(); g.arc(x, y, p / 2, 0, Math.PI); g.stroke(); }
    // el reflejo de la calle en la parte de arriba
    const r = g.createLinearGradient(0, 0, 0, h * 0.4);
    r.addColorStop(0, 'rgba(210,220,230,.4)');
    r.addColorStop(1, 'rgba(210,220,230,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, w, h * 0.4);
    if (rotulo) {
      g.fillStyle = '#f2f2f0';
      g.font = `700 ${Math.round(w * 0.14)}px Arial, sans-serif`;
      g.textAlign = 'center';
      g.fillText('Local 2', w * 0.5, h * 0.2);
    }
    if (cartel) {
      // el cartel azul del horario (el texto no se lee de lejos: rayas)
      g.fillStyle = '#eaf2fa';
      g.fillRect(w * 0.2, h * 0.18, w * 0.55, h * 0.28);
      g.fillStyle = '#2a6ac8';
      g.fillRect(w * 0.2, h * 0.18, w * 0.55, h * 0.06);
      g.fillStyle = '#d0302a';
      g.fillRect(w * 0.3, h * 0.26, w * 0.35, h * 0.03);
      g.fillStyle = '#2a4a8a';
      for (let y = 0.32; y < 0.44; y += 0.035) g.fillRect(w * 0.27, h * y, w * 0.41, h * 0.012);
    }
  };
}

/** el granito gris de la pilastra */
function granito(g, w, h) {
  g.fillStyle = '#8e9094';
  g.fillRect(0, 0, w, h);
  let s = 9;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 1200; i++) { const v = 90 + r() * 110; g.fillStyle = `rgb(${v},${v},${v + 3})`; g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2); }
  g.fillStyle = 'rgba(60,60,64,.5)';
  for (let y = h / 5; y < h; y += h / 5) g.fillRect(0, y, w, 1);
}

// ——— las piezas ———

/** un marco de aluminio blanco alrededor de un hueco */
function marcoAlu(k, a, b, y0, y1) {
  for (const s of [a, b]) k.box(s, y0, Z + 0.07, 0.09, y1 - y0, 0.08, BLANCO);
  for (const y of [y0, y1 - 0.09]) k.box((a + b) / 2, y, Z + 0.07, b - a, 0.09, 0.08, BLANCO);
}

/** la pescadería: el frente blanco, la puerta, el escaparate, el letrero, el montante y la pilastra */
function fachada(k) {
  const d0 = S0 + 0.1, d1 = S0 + 1.5, e0 = S0 + 1.5, e1 = S1 - 0.7, yH = 2.5, yT = 3.15;
  // la puerta de «Local 2» y el escaparate con el cartel del horario
  k.pic((d0 + d1) / 2, yH / 2, Z + 0.02, d1 - d0, yH, 0, 1, canvasTex(120, 220, reja(false, true)), { glow: 0.04 });
  k.pic((e0 + e1) / 2, (yH + 0.15) / 2 + 0.075, Z + 0.02, e1 - e0, yH - 0.15, 0, 1, canvasTex(200, 220, reja(true, false)), { glow: 0.04 });
  marcoAlu(k, d0, d1, 0, yH);
  marcoAlu(k, e0, e1, 0.15, yH);
  k.box((e0 + e1) / 2, 0, Z + 0.05, e1 - e0, 0.15, 0.1, BLANCO);
  // el letrero encima de la puerta y el montante con los peces encima del escaparate
  k.pic((d0 + d1) / 2 + 0.3, (yH + yT) / 2 + 0.05, Z + 0.06, d1 - d0 + 0.6, yT - yH - 0.05, 0, 1, canvasTex(260, 120, letrero));
  k.pic((e0 + e1) / 2 + 0.3, (yH + yT) / 2 + 0.05, Z + 0.02, e1 - e0 - 0.6, yT - yH - 0.05, 0, 1, canvasTex(160, 120, montante));
  marcoAlu(k, d0, e1, yH, yT + 0.1);
  // la pilastra de granito de la derecha, que separa del local de al lado
  k.box(S1 - 0.35, 0, Z + 0.06, 0.7, yT + 0.4, 0.14, 0x8e9094);
  k.pic(S1 - 0.35, (yT + 0.4) / 2, Z + 0.135, 0.7, yT + 0.4, 0, 1, canvasTex(60, 280, granito));
  // el zócalo de granito
  k.box((S0 + S1) / 2, 0, Z + 0.04, S1 - S0, 0.12, 0.12, 0x7a7c80);
}

/** se monta con lo demás de Arrecife Centro */
export function buildLanzapesca(scene, colliders, map) {
  if (!map?.lanzapesca) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, P, 'lanzapesca', colliders);
  scene.add(group);
  return { group };
}
