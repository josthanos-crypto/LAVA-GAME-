import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * El Bar Costa Rica, en la calle Puerto Rico junto a la esquina con la calle Costa Rica, con la foto de
 * la vista de la calle de Google de julio de 2025 (solo se mira, no va dentro del juego): la casa terrera
 * blanca con el zócalo de piedra oscura escalonado, la ventana grande con la reja gris de volutas, la caja
 * gris del contador, la otra ventana de barrotes, la puerta con su cancela gris y encima el letrero verde
 * oscuro de «Cafetería Costa Rica», las dos ventanitas de después y los cables por la pared. La terraza
 * de sillas de mimbre de la esquina no cabe en la acera del juego: no se pone. El bloque se queda como
 * está.
 */

// la cara de la calle Puerto Rico (s desde el extremo del noroeste; la esquina con Costa Rica en s = C.len)
const C = marco([-176.49, -365.09], [-159.45, -354.37]);
const Z = 0.12, ALTO = 3.7, BLANCO = 0xf2f0ea, GRIS = 0x8a8e90, PIEDRA = 0x34322f;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneBarCostaRica(map) {
  map.barCostaRicaSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Costa Rica');
  if (i >= 0) map.barCostaRicaSign = map.signs.splice(i, 1)[0];
  map.barCostaRica = true;
}

// ——— lo que se pinta en lienzo ———

/** la piedra oscura del zócalo, en sillares de tamaños distintos */
function piedra(g, w, h) {
  g.fillStyle = '#2a2826';
  g.fillRect(0, 0, w, h);
  let s = 17;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const fila = h / 3;
  for (let y = 0; y < h; y += fila) {
    let x = -r() * 40;
    while (x < w) {
      const a = 30 + r() * 60, v = 50 + r() * 30;
      g.fillStyle = `rgb(${v},${v - 2},${v - 5})`;
      g.fillRect(x + 2, y + 2, a - 4, fila - 4);
      x += a;
    }
  }
  for (let i = 0; i < 1200; i++) { g.fillStyle = `rgba(${120 + r() * 60},${118 + r() * 60},${112 + r() * 60},.25)`; g.fillRect(r() * w, r() * h, 1.5, 1.5); }
}

/** una ventana con su reja gris: el cristal oscuro y, si toca, las volutas del medio */
function ventana(volutas, cortina) {
  return (g, w, h) => {
    g.fillStyle = '#d8d8d4';
    g.fillRect(0, 0, w, h);
    const m = w * 0.07;
    const cr = g.createLinearGradient(0, 0, w, h);
    cr.addColorStop(0, '#5a6066');
    cr.addColorStop(1, '#2a2e32');
    g.fillStyle = cr;
    g.fillRect(m, m, w - 2 * m, h - 2 * m);
    if (cortina) { g.fillStyle = '#b84a5a'; g.fillRect(w * 0.15, h * 0.35, w * 0.25, h * 0.4); }
    g.fillStyle = 'rgba(255,255,255,.12)';
    g.fillRect(m, m, w * 0.3, h - 2 * m);
    // los barrotes
    g.strokeStyle = '#9a9ea0';
    g.lineWidth = w * 0.025;
    const n = 7;
    for (let i = 0; i <= n; i++) { const x = m + (w - 2 * m) * i / n; g.beginPath(); g.moveTo(x, m); g.lineTo(x, h - m); g.stroke(); }
    for (const y of [0.12, 0.88]) { g.beginPath(); g.moveTo(m, h * y); g.lineTo(w - m, h * y); g.stroke(); }
    if (volutas) {
      g.lineWidth = w * 0.018;
      for (const y of [0.3, 0.62]) for (let i = 0; i < n; i++) {
        const cx = m + (w - 2 * m) * (i + 0.5) / n, rr = (w - 2 * m) / n * 0.4;
        g.beginPath(); g.arc(cx, h * y, rr, 0, Math.PI * 2); g.stroke();
      }
      g.beginPath(); g.moveTo(w * 0.5, h * 0.4); g.bezierCurveTo(w * 0.3, h * 0.3, w * 0.35, h * 0.55, w * 0.5, h * 0.52); g.bezierCurveTo(w * 0.65, h * 0.55, w * 0.7, h * 0.3, w * 0.5, h * 0.4); g.stroke();
    }
  };
}

/** la cancela gris de la puerta, con la penumbra del bar detrás */
function cancela(g, w, h) {
  g.fillStyle = '#26282a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#4a4440';
  g.fillRect(w * 0.1, h * 0.55, w * 0.8, h * 0.12);
  g.strokeStyle = '#a8acae';
  g.lineWidth = w * 0.03;
  g.strokeRect(w * 0.04, h * 0.02, w * 0.92, h * 0.96);
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
  for (let i = 1; i < 8; i++) { const x = w * i / 8; g.beginPath(); g.moveTo(x, h * 0.35); g.lineTo(x, h * 0.96); g.stroke(); }
  for (const y of [0.35, 0.5, 0.8]) { g.beginPath(); g.moveTo(w * 0.04, h * y); g.lineTo(w * 0.96, h * y); g.stroke(); }
  g.lineWidth = w * 0.02;
  for (const cx of [0.25, 0.75]) { g.beginPath(); g.arc(w * cx, h * 0.2, w * 0.14, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(w * cx, h * 0.2, w * 0.06, 0, Math.PI * 2); g.stroke(); }
}

/** el letrero verde oscuro con «Cafetería» en rojo y «COSTA RICA» */
function letrero(g, w, h) {
  g.fillStyle = '#245a3e';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c8a050';
  g.lineWidth = 4;
  g.strokeRect(3, 3, w - 6, h - 6);
  g.strokeStyle = '#c84a32';
  g.lineWidth = 3;
  g.beginPath(); g.ellipse(w / 2, h / 2, w * 0.44, h * 0.38, 0, 0, Math.PI * 2); g.stroke();
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#f47050';
  g.font = `italic 700 ${Math.round(h * 0.3)}px "Segoe Script", "Brush Script MT", Georgia, serif`;
  g.fillText('Cafetería', w / 2, h * 0.32);
  g.fillStyle = '#f2ead4';
  g.font = `900 ${Math.round(h * 0.3)}px "Arial Black", Arial, sans-serif`;
  g.fillText('COSTA RICA', w / 2, h * 0.66);
}

// ——— las piezas ———

/** el marco claro de una ventana y su repisa */
function hueco(k, a, b, y0, y1) {
  for (const s of [a, b]) k.box(s, y0, Z + 0.09, 0.08, y1 - y0, 0.06, 0xd8d8d4);
  for (const y of [y0 - 0.04, y1 - 0.04]) k.box((a + b) / 2, y, Z + 0.09, b - a + 0.08, 0.08, 0.06, 0xd8d8d4);
  k.box((a + b) / 2, y0 - 0.06, Z + 0.07, b - a + 0.16, 0.05, 0.14, 0xe8e6e0);
}

/** la planta baja de la casa del bar */
function fachada(k) {
  const L = C.len + 0.12, sm = L / 2;
  // la pared blanca y la cornisa
  k.box(sm, 0, Z - 0.05, L, ALTO, 0.1, BLANCO);
  k.box(sm, ALTO - 0.15, Z + 0.05, L, 0.15, 0.2, 0xf6f4ee);
  // el zócalo de piedra oscura, escalonado como en la foto
  for (const [a, b, h] of [[0, 9.9, 1.15], [9.9, 12.6, 1.0], [12.6, L, 0.85]]) {
    k.box((a + b) / 2, 0, Z + 0.02, b - a, h, 0.1, PIEDRA);
    k.pic((a + b) / 2, h / 2, Z + 0.073, b - a, h, 0, 1, canvasTex(Math.round(64 * (b - a)), Math.round(64 * h), piedra));
  }
  // las ventanas: la grande de las volutas, la de barrotes y las dos pequeñas
  const ventanas = [[6.6, 8.2, 1.0, 2.75, true, true], [10.6, 11.8, 1.05, 2.6, false, false], [14.8, 15.4, 1.15, 2.4, false, false], [15.9, 16.5, 1.15, 2.4, false, false]];
  for (const [a, b, y0, y1, vol, cor] of ventanas) {
    k.pic((a + b) / 2, (y0 + y1) / 2, Z + 0.09, b - a, y1 - y0, 0, 1, canvasTex(Math.round(120 * (b - a)), Math.round(120 * (y1 - y0)), ventana(vol, cor)));
    hueco(k, a, b, y0, y1);
  }
  // la caja gris del contador, encima del zócalo
  k.box(9.3, 0.5, Z + 0.15, 1.2, 0.9, 0.22, 0xa8acae);
  k.box(9.3, 1.38, Z + 0.15, 1.24, 0.04, 0.26, GRIS);
  // la puerta con la cancela, el escalón y el letrero de encima
  const a = 12.8, b = 14.0, hp = 2.35;
  k.pic((a + b) / 2, hp / 2, Z + 0.09, b - a, hp, 0, 1, canvasTex(120, 236, cancela), { glow: 0.03 });
  k.box((a + b) / 2, 0, Z + 0.2, b - a + 0.3, 0.1, 0.35, 0x8a8a86);
  k.box((a + b) / 2, 2.55, Z + 0.06, 1.5, 0.62, 0.06, 0x245a3e);
  k.pic((a + b) / 2, 2.86, Z + 0.095, 1.46, 0.58, 0, 1, canvasTex(240, 96, letrero));
  // los cables negros que bajan por la pared
  k.box(9.0, 3.25, Z + 0.02, 8.0, 0.03, 0.03, 0x161618);
}

/** segunda fase, como los demás de este barrio */
export function buildBarCostaRica(scene, colliders, map) {
  if (!map?.barCostaRica) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, C, 'barCostaRica', colliders);
  scene.add(group);
  return { group };
}
