import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * El Kebab Lanzarote, en la avenida Fred Olsen 1 (centro), frente a la playa del Reducto, al lado de la Pizzería
 * Venezia, con la vista de la calle de Google de octubre de 2022 (solo se mira, no va dentro del juego; la gente no
 * se pone): el bajo forrado de granito rosado con sus pilares; el portal del número 1, de madera con cristal y su
 * plaquita azul; la tienda abierta, con el mostrador, el asador del kebab y la pantalla de la carta encendida al
 * fondo, y el cartel rojo de la comida a un lado; la persiana marrón del final; y el toldo pardo grande con
 * «KEBAB LANZAROTE» y las estrellas arriba y «KEBAB» en los dos lados del faldón (lo del medio sale borroso en la
 * foto y se deja liso). El bloque se queda como está.
 */

// la cara de la avenida (s de oeste a este, la de la pizzería); la vista de la calle pone el portal en s 12,2–14,6,
// la tienda en s 14,6–20,1, la persiana hasta s 21,4 y el toldo en s 13,9–21,4 (el rótulo del mapa caía en s 14,4)
const AV = marco([-628.32, 448.43], [-605.05, 455.64]);
const Z = 0.12, ZF = Z + 0.3, S0 = 12.2, S1 = 21.4, YP = 3.6, GRANITO = 0xb89488;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneKebabLanzarote(map) {
  map.kebabLanzaroteSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Kebab Lanzarote' && Math.hypot(s.x + 614.5, s.z - 452.7) < 15);
  if (i >= 0) map.kebabLanzaroteSign = map.signs.splice(i, 1)[0];
  map.kebabLanzarote = true;
}

// ——— lo que se pinta en lienzo ———

/** el granito rosado en placas (el mismo de la pizzería) */
function granito(g, w, h) {
  g.fillStyle = '#b89488';
  g.fillRect(0, 0, w, h);
  let s = 9;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 700; i++) {
    g.fillStyle = r() < 0.5 ? 'rgba(90,60,55,.35)' : 'rgba(230,210,200,.35)';
    g.fillRect(r() * w, r() * h, 2, 2);
  }
  g.strokeStyle = 'rgba(80,60,55,.4)';
  g.lineWidth = 1;
  for (let y = 0; y <= h; y += h / 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** la tienda por dentro: el mostrador, el asador y la pantalla de la carta */
function tienda(g, w, h) {
  g.fillStyle = '#3a3230';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8d0c0';
  g.fillRect(0, 0, w, h * 0.12);
  // la pantalla de la carta encendida
  g.fillStyle = '#1a1a1c';
  g.fillRect(w * 0.18, h * 0.16, w * 0.5, h * 0.24);
  g.fillStyle = '#e8ecf2';
  g.fillRect(w * 0.2, h * 0.18, w * 0.46, h * 0.2);
  for (let y = 0; y < 3; y++) for (let x = 0; x < 4; x++) {
    g.fillStyle = ['#d8a03a', '#c83a2a', '#4a6ab8'][(x + y) % 3];
    g.fillRect(w * (0.215 + x * 0.112), h * (0.195 + y * 0.062), w * 0.09, h * 0.045);
  }
  // el asador del kebab
  g.fillStyle = '#5a5a5e';
  g.fillRect(w * 0.76, h * 0.2, w * 0.1, h * 0.38);
  g.fillStyle = '#a8683a';
  g.beginPath(); g.moveTo(w * 0.77, h * 0.24); g.lineTo(w * 0.85, h * 0.24); g.lineTo(w * 0.83, h * 0.54); g.lineTo(w * 0.79, h * 0.54); g.fill();
  // el mostrador
  g.fillStyle = '#c8c4bc';
  g.fillRect(0, h * 0.6, w, h * 0.06);
  g.fillStyle = '#6a5a4a';
  g.fillRect(0, h * 0.66, w, h * 0.24);
  g.fillStyle = '#8a7a6a';
  g.fillRect(0, h * 0.9, w, h * 0.1);
  g.fillStyle = 'rgba(0,0,0,.15)';
  g.fillRect(0, 0, w, h);
}

/** el cartel rojo de la comida */
function poster(g, w, h) {
  const gr = g.createLinearGradient(0, 0, w, h);
  gr.addColorStop(0, '#d83a2a');
  gr.addColorStop(1, '#5a1a14');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8b86a';
  g.beginPath(); g.ellipse(w * 0.5, h * 0.62, w * 0.36, h * 0.12, -0.4, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#7ab04a';
  g.beginPath(); g.ellipse(w * 0.45, h * 0.58, w * 0.18, h * 0.05, -0.4, 0, Math.PI * 2); g.fill();
}

/** el portal del número 1: madera con cristal */
function portal(g, w, h) {
  g.fillStyle = '#6a4a32';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#4a5a62';
  g.fillRect(w * 0.12, h * 0.06, w * 0.76, h * 0.5);
  g.fillStyle = 'rgba(255,255,255,.14)';
  g.fillRect(w * 0.12, h * 0.06, w * 0.28, h * 0.5);
  g.strokeStyle = 'rgba(0,0,0,.35)';
  g.lineWidth = 3;
  g.strokeRect(w * 0.15, h * 0.62, w * 0.7, h * 0.32);
}

/** la persiana marrón */
function persiana(g, w, h) {
  g.fillStyle = '#7a5a40';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#5a4030';
  for (let y = 4; y < h; y += 8) g.fillRect(0, y, w, 2);
}

/** la tela del toldo, vista desde la calle: «KEBAB LANZAROTE» con las estrellas */
function telaToldo(g, w, h) {
  g.fillStyle = '#8a6a58';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(70,50,40,.5)';
  g.beginPath(); g.ellipse(w * 0.5, h * 0.48, w * 0.26, h * 0.36, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#f4ece0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 900 ${Math.round(h * 0.34)}px "Arial Black", Arial, sans-serif`;
  g.fillText('KEBAB', w * 0.5, h * 0.45);
  g.font = `900 ${Math.round(h * 0.13)}px "Arial Black", Arial, sans-serif`;
  g.fillText('LANZAROTE', w * 0.5, h * 0.72);
  for (let i = 0; i < 5; i++) {
    const cx = w * (0.44 + i * 0.03), cy = h * 0.18, rr = h * 0.04;
    g.beginPath();
    for (let j = 0; j < 10; j++) { const a = -Math.PI / 2 + j * Math.PI / 5, q = j % 2 ? rr * 0.45 : rr; g.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); }
    g.closePath(); g.fill();
  }
}

/** el faldón: «KEBAB» en los dos lados y liso en medio */
function faldon(g, w, h) {
  g.fillStyle = '#7a4a3a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4ece0';
  g.textBaseline = 'middle';
  g.font = `900 ${Math.round(h * 0.7)}px "Arial Black", Arial, sans-serif`;
  g.textAlign = 'left';
  g.fillText('KEBAB', w * 0.02, h * 0.55);
  g.textAlign = 'right';
  g.fillText('KEBAB', w * 0.98, h * 0.55);
}

// ——— las piezas ———

/** el bajo de granito, el portal, la tienda, la persiana y el toldo */
function fachada(k) {
  const gt = canvasTex(64, 192, granito);
  const trozos = [[S0, 12.55, 0, YP], [13.95, 14.9, 0, YP], [12.55, 13.95, 2.45, YP], [14.9, 16.06, 0, YP], [16.06, 18.5, 2.5, YP],
    [18.5, 18.56, 0, YP], [19.44, 20.1, 0, YP], [20.1, S1, 2.5, YP], [18.56, 19.44, 2.5, YP]];
  for (const [a, b, y0, y1] of trozos) {
    k.box((a + b) / 2, y0, Z + 0.15, b - a, y1 - y0, 0.3, GRANITO);
    k.pic((a + b) / 2, (y0 + y1) / 2, ZF + 0.005, b - a, y1 - y0, 0, 1, gt);
  }
  k.block((S0 + S1) / 2, Z + 0.15, S1 - S0, 0.3);
  // el portal del 1 y su plaquita azul
  k.pic(13.25, 1.225, Z + 0.04, 1.4, 2.45, 0, 1, canvasTex(120, 210, portal));
  k.box(13.25, 2.62, ZF + 0.01, 0.16, 0.14, 0.02, 0x2a5ab8);
  // la tienda abierta, el cartel rojo y la persiana
  k.pic(17.28, 1.25, Z + 0.04, 2.44, 2.5, 0, 1, canvasTex(240, 250, tienda), { glow: 0.25 });
  k.pic(19.0, 1.25, Z + 0.04, 0.88, 2.5, 0, 1, canvasTex(90, 250, poster));
  k.pic(20.75, 1.25, Z + 0.04, 1.3, 2.5, 0, 1, canvasTex(130, 250, persiana));
  // el toldo pardo con su faldón y los dos palos blancos
  const s0 = 13.95, s1 = 21.38, fuera = 2.6, yP = 3.45, yF = 2.75, largo = Math.hypot(fuera, yP - yF);
  const tela = new THREE.BoxGeometry(s1 - s0, 0.03, largo);
  tela.rotateX(Math.atan2(yP - yF, fuera));
  tela.translate((s0 + s1) / 2, (yP + yF) / 2, ZF + fuera / 2);
  k.add(tela, 0x8a6a58);
  // el letrero de arriba, pintado en una lámina pegada encima de la tela inclinada
  const pend = Math.atan2(yP - yF, fuera), lam = new THREE.PlaneGeometry(4.2, largo * 0.85);
  lam.rotateX(pend - Math.PI / 2);
  lam.translate(17.6, (yP + yF) / 2 + 0.02 * Math.cos(pend), ZF + fuera / 2 + 0.02 * Math.sin(pend));
  k.pics.push({ geo: lam, tex: canvasTex(420, 230, telaToldo), glow: 0 });
  k.box((s0 + s1) / 2, yF - 0.32, ZF + fuera, s1 - s0, 0.32, 0.03, 0x7a4a3a);
  k.pic((s0 + s1) / 2, yF - 0.16, ZF + fuera + 0.02, s1 - s0 - 0.02, 0.3, 0, 1, canvasTex(700, 30, faldon));
  k.box((s0 + s1) / 2, yF - 0.04, ZF + fuera - 0.05, s1 - s0, 0.06, 0.08, 0xe8e6e0);
  for (const s of [s0 + 0.15, s1 - 0.4]) {
    k.cyl(s, 0, ZF + fuera - 0.1, 0.03, 0.03, yF - 0.3, 0xe8e6e0, { seg: 8 });
    k.block(s, ZF + fuera - 0.1, 0.1, 0.1);
  }
}

/** se monta con lo demás de Arrecife Centro */
export function buildKebabLanzarote(scene, colliders, map) {
  if (!map?.kebabLanzarote) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, AV, 'kebabLanzarote', colliders);
  scene.add(group);
  return { group };
}
