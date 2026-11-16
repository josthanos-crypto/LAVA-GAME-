import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, SERIF } from './restaurantesCharco.js';

/**
 * La Rústica (bar, restaurante y pizzería), en la esquina de la calle Blas Cabrera Felipe, con la foto de
 * noche de Google Maps (solo se mira, no va dentro del juego): la planta baja de cristal entre pilares de
 * madera oscura, el faldón negro con «TAPAS · PIZZA · PASTA» en letras blancas encendidas, el letrero de la
 * esquina con «LA RUSTICA» y la franja roja de «BAR · RESTAURANTE · PIZZERIA», los focos, y dentro el
 * comedor con los arcos, la barra, las guirnaldas de bombillas y el cochecito rojo antiguo del escaparate
 * de la esquina. El bloque del mapa (de siete plantas) se queda; esto va por delante de su planta baja.
 */

// la cara sur del bloque, a la calle Blas Cabrera Felipe (s desde la esquina oeste; La Rústica, en la del este)
const R = marco([-110.6, 570.0], [-71.4, 549.4]);
const MADERA = 0x3a2418, Z = 0.15;

/** antes de levantar la ciudad: fuera el rótulo rojo genérico */
export function tuneLaRustica(map) {
  map.laRusticaSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'La Rustica');
  if (i >= 0) map.laRusticaSign = map.signs.splice(i, 1)[0];
  map.laRustica = true;
}

// ——— lo que se pinta en lienzo ———

/** el comedor visto por el cristal: paredes claras con arcos, las mesas, la barra con las botellas y las guirnaldas */
function comedor(conCoche) {
  return (g, w, h) => {
    g.fillStyle = '#e8d8b8';
    g.fillRect(0, 0, w, h);
    // los arcos del fondo
    g.fillStyle = '#c8a878';
    for (let x = w * 0.08; x < w; x += w * 0.28) {
      g.beginPath(); g.moveTo(x, h * 0.75); g.lineTo(x, h * 0.35); g.arc(x + w * 0.09, h * 0.35, w * 0.09, Math.PI, 0); g.lineTo(x + w * 0.18, h * 0.75); g.fill();
    }
    // la barra con las baldas de botellas
    g.fillStyle = '#6a4a30';
    g.fillRect(w * 0.55, h * 0.55, w * 0.4, h * 0.2);
    for (let y = 0.2; y < 0.5; y += 0.1) for (let x = 0.58; x < 0.93; x += 0.015) { g.fillStyle = ['#3a5a2a', '#d8c08a', '#8a2a22', '#e8e8e0'][Math.floor(x * 200) % 4]; g.fillRect(w * x, h * y, w * 0.008, h * 0.06); }
    // las mesas oscuras con la gente en sombra
    g.fillStyle = '#3a2a22';
    for (let x = 0.05; x < 0.5; x += 0.14) { g.fillRect(w * x, h * 0.7, w * 0.1, h * 0.03); g.fillRect(w * x + w * 0.045, h * 0.72, w * 0.01, h * 0.2); }
    g.fillStyle = 'rgba(40,30,26,.55)';
    for (let x = 0.08; x < 0.5; x += 0.14) { g.beginPath(); g.arc(w * x, h * 0.6, w * 0.022, 0, Math.PI * 2); g.fill(); g.fillRect(w * x - w * 0.025, h * 0.62, w * 0.05, h * 0.1); }
    // las guirnaldas de bombillas que cuelgan del techo
    g.fillStyle = '#fff2c0';
    for (let t = 0; t < 1; t += 0.03) { const x = w * t, y = h * (0.1 + 0.06 * Math.sin(t * 12)); g.beginPath(); g.arc(x, y, 3, 0, Math.PI * 2); g.fill(); }
    // el cochecito rojo antiguo del escaparate
    if (conCoche) {
      const cx = w * 0.7, cy = h * 0.78, cw = w * 0.36, ch = h * 0.24;
      g.fillStyle = '#c82a22';
      g.beginPath(); g.ellipse(cx, cy, cw / 2, ch / 2.2, 0, Math.PI, 0); g.fill();
      g.fillRect(cx - cw / 2, cy, cw, ch * 0.32);
      g.fillStyle = '#9ac0d0';
      g.beginPath(); g.ellipse(cx, cy - ch * 0.12, cw * 0.26, ch * 0.22, 0, Math.PI, 0); g.fill();
      g.fillStyle = '#fff6c8';
      for (const sx of [-0.36, 0.36]) { g.beginPath(); g.arc(cx + cw * sx, cy + ch * 0.08, ch * 0.08, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = '#f2f2f2';
      g.fillRect(cx - cw * 0.12, cy + ch * 0.18, cw * 0.24, ch * 0.08);
      g.fillStyle = '#1a1a1a';
      for (const sx of [-0.33, 0.33]) g.fillRect(cx + cw * sx - cw * 0.06, cy + ch * 0.3, cw * 0.12, ch * 0.16);
    }
    const luz = g.createRadialGradient(w / 2, h * 0.3, 10, w / 2, h * 0.3, w * 0.8);
    luz.addColorStop(0, 'rgba(255,220,160,.25)');
    luz.addColorStop(1, 'rgba(255,220,160,0)');
    g.fillStyle = luz;
    g.fillRect(0, 0, w, h);
  };
}

/** el faldón negro con TAPAS · PIZZA · PASTA */
function faldon(g, w, h) {
  g.fillStyle = '#141414';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#fafaf4';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(h * 0.56)}px "Arial Black", Arial, sans-serif`;
  g.fillText('TAPAS - PIZZA - PASTA', w / 2, h * 0.55);
}

/** el letrero de la esquina: LA RUSTICA y la franja roja de debajo */
function letrero(g, w, h) {
  g.fillStyle = '#141414';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#fafaf4';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.42)}px ${SERIF}`;
  g.fillText('LA RUSTICA', w / 2, h * 0.36);
  g.fillStyle = '#c8202a';
  g.fillRect(w * 0.06, h * 0.68, w * 0.88, h * 0.22);
  g.fillStyle = '#fafaf4';
  g.font = `700 ${Math.round(h * 0.15)}px Arial, sans-serif`;
  g.fillText('BAR · RESTAURANTE · PIZZERIA', w / 2, h * 0.79);
}

// ——— las piezas ———

/** la planta baja de La Rústica, de s 33,4 a la esquina */
function rustica(k) {
  const s0 = 33.4, s1 = R.len - 0.1, H = 3.3;
  // los cristales con el comedor detrás, entre los pilares de madera
  const pil = [s0, 36.8, 40.2, s1];
  for (let i = 0; i < pil.length - 1; i++) {
    const a = pil[i] + 0.15, b = pil[i + 1] - 0.15;
    k.pic((a + b) / 2, H / 2 + 0.1, Z, b - a, H - 0.2, 0, 1, canvasTex(512, 256, comedor(i === pil.length - 2)), { glow: 0.35 });
    k.box((a + b) / 2, 0.95, Z + 0.06, b - a, 0.04, 0.04, 0x2a2a2a);
  }
  for (const s of pil) k.box(s, 0, Z + 0.05, 0.3, H + 0.9, 0.3, MADERA);
  // el escalón y el zócalo oscuro
  k.box((s0 + s1) / 2, 0, Z + 0.4, s1 - s0, 0.12, 0.5, 0x2a2a2c);
  // el faldón negro que sale, con las letras encendidas, y la fila de focos debajo
  k.box((s0 + 40.2) / 2, H + 0.1, Z + 0.3, 40.2 - s0, 0.8, 0.5, 0x141414);
  k.pic((s0 + 40.2) / 2, H + 0.5, Z + 0.555, 40.2 - s0 - 0.3, 0.7, 0, 1, canvasTex(1024, 96, faldon), { glow: 1 });
  for (let s = s0 + 0.6; s < 40; s += 1.3) k.ball(s, H + 0.05, Z + 0.45, 0.05, 0xfff2cc, { list: k.glow, seg: 6 });
  // el letrero de la esquina, encima del escaparate del coche
  k.box((40.2 + s1) / 2, H + 0.1, Z + 0.3, s1 - 40.2, 1.1, 0.5, 0x141414);
  k.pic((40.2 + s1) / 2, H + 0.65, Z + 0.555, s1 - 40.2 - 0.3, 1.0, 0, 1, canvasTex(512, 128, letrero), { glow: 1 });
  // el sillón de mimbre de la puerta
  k.box(s0 + 0.9, 0.42, Z + 1.1, 0.7, 0.08, 0.6, 0xb08a4a);
  k.box(s0 + 0.9, 0.42, Z + 0.82, 0.7, 0.6, 0.06, 0xb08a4a);
  for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) k.box(s0 + 0.9 + a * 0.3, 0, Z + 1.1 + b * 0.25, 0.04, 0.42, 0.04, 0x7a5a2a);
  k.block(s0 + 0.9, Z + 1.0, 0.7, 0.7);
}

/** segunda fase, como los demás de este barrio */
export function buildLaRustica(scene, colliders, map) {
  if (!map?.laRustica) return null;
  const k = new Kit();
  rustica(k);
  const group = enMarco(k, R, 'laRustica', colliders);
  scene.add(group);
  return { group };
}
