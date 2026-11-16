import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * La Zapatería Tom Smith, en la calle León y Castillo, con las fotos de Google Maps (solo se miran, no van
 * dentro del juego): la planta baja chapada de granito oscuro, el escaparate de la izquierda, la puerta
 * doble de cristal con marco negro y el escaparate grande de la derecha, los dos con la franja negra de
 * abajo y «TOM SMITH» en blanco; dentro, la tienda blanca con las estanterías de zapatos, bolsos y
 * mochilas. Encima, la franja blanca con «TOM SMITH» en letras negras grandes y «ZAPATERIA - PELETERIA»
 * debajo, y la banderola blanca de la esquina. El bloque se queda como está.
 */

// la cara de la calle León y Castillo (s desde el extremo del norte)
const T = marco([51.63, 103.84], [66.26, 143.29]);
const Z = 0.12, S0 = 21.6, S1 = 31.6, H = 3.0, MARCO = 0x1a1a1c;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneTomSmith(map) {
  map.tomSmithSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Tom Smith');
  if (i >= 0) map.tomSmithSign = map.signs.splice(i, 1)[0];
  map.tomSmith = true;
}

// ——— lo que se pinta en lienzo ———

/** el granito oscuro con sus motas claras, en placas */
function granito(g, w, h) {
  g.fillStyle = '#2e2e30';
  g.fillRect(0, 0, w, h);
  let s = 13;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 2500; i++) { const v = 90 + r() * 90; g.fillStyle = `rgba(${v},${v},${v + 4},.45)`; g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2); }
  g.strokeStyle = 'rgba(10,10,12,.7)';
  g.lineWidth = 2;
  for (let y = 0; y < h; y += h / 5) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  for (let x = 0; x < w; x += w / 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
}

/** la tienda por dentro: blanca, con las estanterías de zapatos, bolsos y mochilas */
function tienda(seed) {
  return (g, w, h) => {
    g.fillStyle = '#d8d6d0';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#b8b6b0';
    g.fillRect(0, h * 0.8, w, h * 0.2);
    let s = seed;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    // los muebles de baldas, de madera clara con el fondo en sombra
    for (let x = 0; x < 1; x += 0.25) {
      g.fillStyle = '#c8b898';
      g.fillRect(w * x, h * 0.06, w * 0.24, h * 0.72);
      g.fillStyle = '#8a8478';
      g.fillRect(w * (x + 0.01), h * 0.08, w * 0.22, h * 0.68);
    }
    // las baldas con los zapatos y los bolsos
    for (let y = 0.1; y < 0.75; y += 0.13) {
      g.fillStyle = '#e4dcc8';
      g.fillRect(0, h * (y + 0.1), w, h * 0.015);
      for (let x = 0.02; x < 0.96; x += 0.06 + r() * 0.04) {
        const bolso = r() < 0.4;
        g.fillStyle = ['#c83a3a', '#e8c040', '#2a4a9a', '#3a3a3c', '#a86a3a', '#e88ab0', '#f2f2ee', '#5a8a4a'][Math.floor(r() * 8)];
        if (bolso) g.fillRect(w * x, h * (y + 0.02), w * 0.045, h * 0.08);
        else { g.beginPath(); g.ellipse(w * (x + 0.02), h * (y + 0.085), w * 0.022, h * 0.016, 0, 0, Math.PI * 2); g.fill(); }
      }
    }
    // la mesa baja del medio con las maletas
    g.fillStyle = '#e8dcc0';
    g.fillRect(w * 0.3, h * 0.7, w * 0.4, h * 0.1);
    for (const [x, c] of [[0.34, '#2a4a9a'], [0.46, '#2a7a8a'], [0.58, '#2a4a9a']]) { g.fillStyle = c; g.fillRect(w * x, h * 0.56, w * 0.09, h * 0.16); }
  };
}

/** un escaparate: la tienda detrás del cristal y la franja negra de abajo con el nombre en blanco */
function escaparate(seed, letra, x) {
  return (g, w, h) => {
    tienda(seed)(g, w, h);
    const reflejo = g.createLinearGradient(0, 0, 0, h * 0.84);
    reflejo.addColorStop(0, 'rgba(40,44,50,.35)');
    reflejo.addColorStop(1, 'rgba(255,255,255,.06)');
    g.fillStyle = reflejo;
    g.fillRect(0, 0, w, h * 0.84);
    const yb = h * 0.84;
    g.fillStyle = '#121214';
    g.fillRect(0, yb, w, h - yb);
    g.fillStyle = '#f4f4f2';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `700 ${Math.round((h - yb) * letra)}px "Arial Narrow", Arial, sans-serif`;
    g.fillText('TOM SMITH', w * x, yb + (h - yb) / 2);
  };
}

/** la franja blanca de encima: TOM SMITH grande, con su sombra, y ZAPATERIA - PELETERIA */
function rotulo(g, w, h) {
  g.fillStyle = '#f4f4f2';
  g.fillRect(0, 0, w, h);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `900 ${Math.round(h * 0.5)}px "Arial Black", Arial, sans-serif`;
  g.fillStyle = 'rgba(0,0,0,.25)';
  g.fillText('TOM SMITH', w / 2 + h * 0.03, h * 0.38 + h * 0.04);
  g.fillStyle = '#1a1a1e';
  g.fillText('TOM SMITH', w / 2, h * 0.38);
  g.font = `700 ${Math.round(h * 0.17)}px Arial, sans-serif`;
  const t = 'ZAPATERIA  -  PELETERIA'.split('').join(String.fromCharCode(8202));
  g.fillText(t, w / 2, h * 0.8);
}

/** la banderola blanca de la esquina */
function banderola(g, w, h) {
  g.fillStyle = '#f4f4f2';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c8c8c4';
  g.lineWidth = 3;
  g.strokeRect(2, 2, w - 4, h - 4);
  g.fillStyle = '#1a1a1e';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `900 ${Math.round(h * 0.42)}px "Arial Black", Arial, sans-serif`;
  const m = g.measureText('TOM SMITH').width;
  if (m > w * 0.88) g.font = `900 ${Math.round(h * 0.42 * w * 0.88 / m)}px "Arial Black", Arial, sans-serif`;
  g.fillText('TOM SMITH', w / 2, h * 0.52);
}

// ——— las piezas ———

/** el marco negro de un hueco */
function marcoNegro(k, a, b, y0, y1) {
  for (const s of [a, b]) k.box(s, y0, Z + 0.03, 0.08, y1 - y0, 0.08, MARCO);
  for (const y of [y0, y1 - 0.08]) k.box((a + b) / 2, y, Z + 0.03, b - a, 0.08, 0.08, MARCO);
}

/** la planta baja de la zapatería */
function fachada(k) {
  const sm = (S0 + S1) / 2;
  // el granito oscuro de toda la planta baja y las dos pilastras de los lados
  k.box(sm, 0, Z - 0.05, S1 - S0, H, 0.1, 0x2e2e30);
  k.pic(sm, H / 2, Z + 0.004, S1 - S0, H, 0, 1, canvasTex(640, 192, granito));
  for (const s of [S0 + 0.25, S1 - 0.25]) k.box(s, 0, Z + 0.05, 0.5, H, 0.12, 0x2e2e30);
  // el escaparate de la izquierda, la puerta doble y el escaparate grande de la derecha
  const a = S0 + 0.6, b = S0 + 3.7, c = S0 + 5.5, d = S1 - 0.6, y0 = 0.12, y1 = H - 0.15;
  k.pic((a + b) / 2, (y0 + y1) / 2, Z + 0.01, b - a, y1 - y0, 0, 1, canvasTex(256, 200, escaparate(7, 0.55, 0.3)), { glow: 0.05 });
  k.pic((b + c) / 2, (y0 + y1) / 2, Z + 0.01, c - b, y1 - y0, 0, 1, canvasTex(160, 240, tienda(29)), { glow: 0.05 });
  k.pic((c + d) / 2, (y0 + y1) / 2, Z + 0.01, d - c, y1 - y0, 0, 1, canvasTex(320, 180, escaparate(17, 0.7, 0.62)), { glow: 0.05 });
  marcoNegro(k, a, b, y0, y1);
  marcoNegro(k, c, d, y0, y1);
  // la puerta: el marco, la junta del medio y los tiradores
  marcoNegro(k, b, c, y0, y1);
  k.box((b + c) / 2, y0, Z + 0.035, 0.06, y1 - y0, 0.06, MARCO);
  for (const s of [(b + c) / 2 - 0.12, (b + c) / 2 + 0.12]) k.box(s, 0.9, Z + 0.08, 0.03, 0.5, 0.03, 0xb8b8b4);
}

/** la franja blanca del rótulo y la banderola */
function rotulos(k) {
  const sm = (S0 + S1) / 2, y0 = H, y1 = 4.3;
  k.box(sm, y0, Z + 0.09, S1 - S0, y1 - y0, 0.28, 0xf4f4f2);
  k.pic(sm, (y0 + y1) / 2, Z + 0.235, S1 - S0 - 0.1, y1 - y0 - 0.05, 0, 1, canvasTex(1024, 132, rotulo));
  // la banderola, de canto hacia la calle
  const s = S0 + 0.2, yb = 2.95, hb = 0.42, fuera = 0.85;
  k.box(s, yb, Z + 0.2 + fuera / 2, 0.06, hb, fuera, 0xf4f4f2);
  for (const n of [1, -1]) k.pic(s + n * 0.031, yb + hb / 2, Z + 0.2 + fuera / 2, fuera - 0.04, hb - 0.04, n, 0, canvasTex(200, 100, banderola));
  k.box(s, yb + 0.1, Z + 0.1, 0.04, 0.04, 0.2, MARCO);
}

/** segunda fase, como los demás de este barrio */
export function buildTomSmith(scene, colliders, map) {
  if (!map?.tomSmith) return null;
  const k = new Kit();
  fachada(k);
  rotulos(k);
  const group = enMarco(k, T, 'tomSmith', colliders);
  scene.add(group);
  return { group };
}
