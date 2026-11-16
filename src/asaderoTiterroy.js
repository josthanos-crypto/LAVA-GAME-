import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * El Asadero de Pollos Titerroy, en la calle Alcalde Lorenzo Cabrera 19 (Titerroy), con la vista de la calle de
 * Google de julio de 2025 y la foto de la entrada de enero de 2020 (solo se miran, no van dentro del juego; la gente
 * no se pone): el bajo forrado de piedra beige en lajas, con la cornisa roja por encima; el portal marrón oscuro de
 * cuarterones con su barandilla de madera; la puerta grande marrón de dos hojas con las pegatinas rojas; la entrada
 * metida, con su suelo de tarima y las dos puertas oscuras; encima, el letrero de «ASADERO DE POLLOS Titerroy» con
 * el pollo asado y el fuego (sin el teléfono); el escaparate de marco marrón; el cajetín de la luz; y el portal
 * blanco del final con sus escalones. El bloque del mapa se queda como está; lo de abajo tapa su trozo.
 */

// la cara de los impares de la calle (s de oeste a este); la vista de la calle pone el asadero en s 40–48 (Google
// lo pone en s 41; el mapa no tenía rótulo suyo)
const M = marco([-653.06, -684.83], [-592.05, -729.67]);
const Z = 0.12, ZF = Z + 0.3, S0 = 39.6, S1 = 48.6, YP = 3.3, MARRON = 0x4a2e22;

/** antes de levantar la ciudad: solo la marca de que se monta (el mapa no tenía rótulo suyo) */
export function tuneAsaderoTiterroy(map) {
  map.asaderoTiterroy = true;
}

// ——— lo que se pinta en lienzo ———

/** la piedra beige en lajas */
function lajas(g, w, h) {
  g.fillStyle = '#d8c8a8';
  g.fillRect(0, 0, w, h);
  let s = 23;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const fila = h / 30;
  for (let y = 0; y < h; y += fila) {
    let x = -r() * 30;
    while (x < w) {
      const l = 12 + r() * 28, v = r();
      g.fillStyle = v < 0.3 ? '#c8b494' : v < 0.6 ? '#e2d4b8' : v < 0.85 ? '#d2bf9c' : '#b8a284';
      g.fillRect(x, y + 1, l - 1, fila - 1);
      x += l;
    }
  }
}

/** el letrero: el pollo asado sobre el fuego y «ASADERO DE POLLOS Titerroy» */
function letrero(g, w, h) {
  g.fillStyle = '#f2ece0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c82a1a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f2ece0';
  g.fillRect(w * 0.03, h * 0.08, w * 0.94, h * 0.84);
  // el fuego y el pollo de la izquierda
  const gr = g.createLinearGradient(0, h, 0, 0);
  gr.addColorStop(0, '#e8401a');
  gr.addColorStop(1, '#f2c02a');
  g.fillStyle = gr;
  g.fillRect(w * 0.03, h * 0.08, w * 0.3, h * 0.84);
  g.fillStyle = '#a85a2a';
  g.beginPath(); g.ellipse(w * 0.18, h * 0.55, w * 0.1, h * 0.25, 0.3, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#c8783a';
  g.beginPath(); g.ellipse(w * 0.16, h * 0.5, w * 0.06, h * 0.15, 0.3, 0, Math.PI * 2); g.fill();
  // las letras
  g.fillStyle = '#c82a1a';
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  g.font = `900 ${Math.round(h * 0.24)}px "Arial Black", Arial, sans-serif`;
  g.fillText('ASADERO', w * 0.36, h * 0.3);
  const a = g.measureText('ASADERO').width;
  g.font = `700 ${Math.round(h * 0.16)}px Arial, sans-serif`;
  g.fillText('de POLLOS', w * 0.38 + a, h * 0.32);
  g.fillStyle = '#2a1e16';
  g.font = `italic 900 ${Math.round(h * 0.42)}px Georgia, serif`;
  g.fillText('Titerroy', w * 0.42, h * 0.68);
}

/** una puerta marrón: de cuarterones (portal) o de dos hojas con rejilla y pegatinas */
function puerta(tipo) {
  return (g, w, h) => {
    g.fillStyle = '#4a2e22';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(0,0,0,.4)';
    g.lineWidth = 3;
    if (tipo === 'portal') {
      for (const [y, hh] of [[0.05, 0.25], [0.35, 0.28], [0.68, 0.27]]) for (const x of [0.1, 0.55]) g.strokeRect(w * x, h * y, w * 0.35, h * hh);
      g.fillStyle = '#c8a050';
      g.fillRect(w * 0.85, h * 0.5, w * 0.05, h * 0.04);
    } else {
      g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
      g.strokeStyle = 'rgba(200,200,200,.35)';
      g.lineWidth = 1;
      for (const x0 of [0.08, 0.56]) for (let x = x0; x < x0 + 0.36; x += 0.04) { g.beginPath(); g.moveTo(w * x, h * 0.3); g.lineTo(w * x, h * 0.45); g.stroke(); }
      g.fillStyle = '#d82a2a';
      for (const x of [0.2, 0.68]) { g.fillRect(w * x, h * 0.52, w * 0.12, h * 0.06); }
      g.fillStyle = '#8a8a8a';
      for (const x0 of [0.08, 0.56]) g.fillRect(w * x0, h * 0.88, w * 0.36, h * 0.06);
    }
  };
}

/** la entrada metida: oscura, con las dos puertas al fondo */
function entrada(g, w, h) {
  g.fillStyle = '#2a201a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#1a1412';
  g.fillRect(w * 0.06, h * 0.08, w * 0.38, h * 0.82);
  g.fillRect(w * 0.54, h * 0.12, w * 0.4, h * 0.78);
  g.fillStyle = 'rgba(255,255,255,.08)';
  g.fillRect(w * 0.08, h * 0.12, w * 0.12, h * 0.5);
  g.fillStyle = '#d82a2a';
  g.fillRect(w * 0.3, h * 0.35, w * 0.05, h * 0.08);
  g.fillStyle = '#c8b494';
  g.fillRect(0, h * 0.9, w, h * 0.1);
}

/** el escaparate de marco marrón, con la luz amarilla dentro */
function escaparate(g, w, h) {
  g.fillStyle = '#e8d890';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c8b870';
  g.fillRect(w * 0.1, h * 0.55, w * 0.8, h * 0.08);
  g.fillStyle = 'rgba(255,255,255,.2)';
  g.fillRect(0, 0, w * 0.3, h);
  g.strokeStyle = '#4a2e22';
  g.lineWidth = 7;
  g.strokeRect(3, 3, w - 6, h - 6);
}

/** el portal blanco del final, abierto, con sus escalones */
function portalBlanco(g, w, h) {
  g.fillStyle = '#ecece8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8d8d4';
  for (let i = 0; i < 3; i++) g.fillRect(0, h * (0.82 + i * 0.06), w, h * 0.04);
  g.fillStyle = '#c8c8c4';
  g.fillRect(w * 0.55, h * 0.4, w * 0.3, h * 0.25);
}

// ——— las piezas ———

/** el bajo de lajas con todos sus huecos */
function fachada(k) {
  const W = S1 - S0, c = (S0 + S1) / 2;
  k.box(c, 0, Z + 0.15, W, YP, 0.3, 0xd8c8a8);
  k.block(c, Z + 0.15, W, 0.3);
  k.pic(c, YP / 2, ZF + 0.003, W, YP, 0, 1, canvasTex(Math.round(W * 50), 165, lajas));
  // la cornisa roja de encima
  k.box(c, YP, ZF + 0.05, W, 0.14, 0.14, 0xc82a1a);
  // el portal marrón de cuarterones con su barandilla
  k.pic(40.5, 1.15, ZF + 0.01, 0.95, 2.3, 0, 1, canvasTex(90, 220, puerta('portal')));
  for (const s of [40.05, 40.95]) k.box(s, 0, ZF + 0.25, 0.05, 0.85, 0.05, MARRON);
  k.box(40.5, 0.8, ZF + 0.25, 0.95, 0.05, 0.05, MARRON);
  for (let s = 40.15; s < 40.9; s += 0.15) k.box(s, 0, ZF + 0.25, 0.03, 0.8, 0.03, MARRON);
  // la puerta grande marrón de dos hojas
  k.pic(42.2, 1.2, ZF + 0.01, 1.6, 2.4, 0, 1, canvasTex(150, 220, puerta('grande')));
  // la entrada metida con su tarima, y el letrero de encima
  k.pic(44.15, 1.2, ZF + 0.008, 1.6, 2.4, 0, 1, canvasTex(150, 220, entrada));
  k.box(44.15, 0, ZF + 0.1, 1.6, 0.06, 0.4, 0xc8a878);
  k.box(44.2, 2.55, ZF + 0.08, 1.8, 0.55, 0.12, 0xc82a1a);
  k.pic(44.2, 2.825, ZF + 0.145, 1.78, 0.53, 0, 1, canvasTex(320, 96, letrero));
  // el escaparate y el cajetín de la luz
  k.pic(46.3, 1.4, ZF + 0.01, 1.5, 1.9, 0, 1, canvasTex(140, 180, escaparate), { glow: 0.2 });
  k.box(45.45, 1.0, ZF + 0.04, 0.4, 0.5, 0.1, 0xe8e6e0);
  // el portal blanco del final
  k.pic(47.9, 1.25, ZF + 0.01, 1.0, 2.5, 0, 1, canvasTex(90, 230, portalBlanco));
  k.box(47.9, 1.45, ZF + 0.04, 0.35, 0.45, 0.1, 0xe8e6e0);
}

/** se monta con lo demás de Titerroy */
export function buildAsaderoTiterroy(scene, colliders, map) {
  if (!map?.asaderoTiterroy) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, M, 'asaderoTiterroy', colliders);
  scene.add(group);
  return { group };
}
