import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * Lolita, la panadería y cafetería («bakery café») de la avenida Doctor Rafael González, en la esquina de
 * la calle Coronel Bens, enfrente de Fresco d'Italia, con la foto de Google Maps (solo se mira, no va
 * dentro del juego): el escaparate grande con «Lolita» en letra de mano blanca arriba, «bakery · café» con
 * la magdalena debajo y otro «lolita» grande esmerilado abajo; los pilares y el zócalo de granito negro;
 * a la izquierda, la entrada con su cristal esmerilado, los dos escalones de granito y el toldo blanco con
 * «bakery · café» en el faldón; y dentro, las paredes blancas con dibujos de tazas y magdalenas, las sillas
 * de madera clara, las mesas negras y la vitrina de los dulces al fondo. Sin terraza: la acera es estrecha
 * y en la foto no la hay. El bloque del mapa se queda.
 */

// la cara sur del bloque, a la avenida (s de oeste a este; Lolita, de s 32,6 a la esquina de Coronel Bens)
const L = marco([-258.2, 497.7], [-215.1, 495.1]);
const Z = 0.15, GRANITO = 0x1c1c1e;

/** antes de levantar la ciudad: fuera el rótulo rojo genérico */
export function tuneLolita(map) {
  map.lolitaSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Lolita');
  if (i >= 0) map.lolitaSign = map.signs.splice(i, 1)[0];
  map.lolita = true;
}

// ——— lo que se pinta en lienzo ———

const MANO = '"Segoe Script", "Lucida Handwriting", "Brush Script MT", cursive';

/** la magdalena: el papel amarillo y la nata rosa */
function magdalena(g, x, y, r) {
  g.fillStyle = '#e8b840';
  g.beginPath(); g.moveTo(x - r * 0.7, y); g.lineTo(x + r * 0.7, y); g.lineTo(x + r * 0.5, y + r); g.lineTo(x - r * 0.5, y + r); g.closePath(); g.fill();
  g.fillStyle = '#f0a0b8';
  g.beginPath(); g.arc(x, y - r * 0.1, r * 0.75, Math.PI, 0); g.fill();
  g.beginPath(); g.arc(x, y - r * 0.55, r * 0.4, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#c8203a';
  g.beginPath(); g.arc(x, y - r * 0.95, r * 0.15, 0, Math.PI * 2); g.fill();
}

/** dentro: la pared blanca con los dibujos, las sillas de madera clara, las mesas negras y la vitrina */
function dentro(g, w, h) {
  g.fillStyle = '#ddd6ca';
  g.fillRect(0, 0, w, h);
  // el suelo claro y los focos del techo
  g.fillStyle = '#c4b8a6';
  g.fillRect(0, h * 0.74, w, h * 0.26);
  g.fillStyle = '#fff8e0';
  for (let x = 0.1; x < 1; x += 0.2) { g.beginPath(); g.arc(w * x, h * 0.06, w * 0.008, 0, Math.PI * 2); g.fill(); }
  // los dibujos negros de la pared: un vaso con pajita, una taza y una magdalena
  g.strokeStyle = '#2a2a2a';
  g.lineWidth = 2;
  for (let x = 0.08; x < 0.9; x += 0.34) {
    g.strokeRect(w * x, h * 0.2, w * 0.035, h * 0.1);
    g.beginPath(); g.moveTo(w * (x + 0.02), h * 0.2); g.lineTo(w * (x + 0.035), h * 0.13); g.stroke();
    g.beginPath(); g.arc(w * (x + 0.1), h * 0.26, w * 0.022, 0, Math.PI); g.stroke();
    g.beginPath(); g.moveTo(w * (x + 0.078), h * 0.26); g.lineTo(w * (x + 0.122), h * 0.26); g.stroke();
    g.beginPath(); g.arc(w * (x + 0.17), h * 0.24, w * 0.02, Math.PI, 0); g.stroke();
    g.strokeRect(w * (x + 0.155), h * 0.24, w * 0.03, h * 0.05);
  }
  // la vitrina de los dulces al fondo
  g.fillStyle = '#d8d0c4';
  g.fillRect(w * 0.55, h * 0.48, w * 0.4, h * 0.2);
  g.fillStyle = 'rgba(200,220,230,.6)';
  g.fillRect(w * 0.55, h * 0.4, w * 0.4, h * 0.1);
  for (let x = 0.57; x < 0.93; x += 0.045) { g.fillStyle = ['#c87a4a', '#f0d8b0', '#7a3a2a', '#f0a0b8'][Math.floor(x * 50) % 4]; g.fillRect(w * x, h * 0.45, w * 0.03, h * 0.035); }
  // las mesas negras y las sillas de madera clara, con alguna persona
  for (let x = 0.06; x < 0.95; x += 0.22) {
    g.fillStyle = '#e0b468';
    g.fillRect(w * x, h * 0.58, w * 0.05, h * 0.06);
    g.fillRect(w * x, h * 0.64, w * 0.008, h * 0.12);
    g.fillRect(w * (x + 0.042), h * 0.64, w * 0.008, h * 0.12);
    g.fillStyle = '#2a2a2c';
    g.fillRect(w * (x + 0.06), h * 0.62, w * 0.1, h * 0.02);
    g.fillRect(w * (x + 0.105), h * 0.64, w * 0.01, h * 0.12);
  }
  g.fillStyle = 'rgba(70,60,56,.7)';
  for (const x of [0.12, 0.5]) { g.beginPath(); g.arc(w * x, h * 0.5, w * 0.018, 0, Math.PI * 2); g.fill(); g.fillRect(w * x - w * 0.025, h * 0.53, w * 0.05, h * 0.12); }
  // el cristal, que oscurece lo de dentro, y su reflejo
  g.fillStyle = 'rgba(40,48,58,.42)';
  g.fillRect(0, 0, w, h);
  const gr = g.createLinearGradient(0, 0, w, h);
  gr.addColorStop(0, 'rgba(255,255,255,.1)');
  gr.addColorStop(0.6, 'rgba(255,255,255,0)');
  gr.addColorStop(1, 'rgba(255,255,255,.08)');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
}

/** el «lolita» grande esmerilado de abajo del cristal */
function esmerilado(g, w, h, x, y, size) {
  g.fillStyle = 'rgba(214,220,220,.85)';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(size)}px ${MANO}`;
  g.fillText('lolita', x, y);
}

/** el escaparate: lo de dentro, con Lolita en blanco arriba, bakery · café y el lolita esmerilado abajo */
function escaparate(g, w, h) {
  dentro(g, w, h);
  g.fillStyle = '#ffffff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.2)}px ${MANO}`;
  g.fillText('Lolita', w * 0.5, h * 0.17);
  g.fillStyle = '#ececec';
  g.font = `600 ${Math.round(h * 0.055)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('bakery', w * 0.4, h * 0.31);
  g.fillText('café', w * 0.6, h * 0.31);
  magdalena(g, w * 0.5, h * 0.3, h * 0.035);
  esmerilado(g, w, h, w * 0.45, h * 0.86, h * 0.22);
}

/** el cristal de la entrada, con su lolita esmerilado */
function puerta(g, w, h) {
  dentro(g, w, h);
  esmerilado(g, w, h, w * 0.5, h * 0.76, h * 0.14);
}

/** el faldón del toldo blanco: bakery · café con la magdalena */
function faldon(g, w, h) {
  g.fillStyle = '#f4f2ec';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#3a3a3a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `600 ${Math.round(h * 0.42)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('bakery', w * 0.3, h * 0.52);
  g.fillText('café', w * 0.72, h * 0.52);
  magdalena(g, w * 0.5, h * 0.48, h * 0.26);
}

// ——— las piezas ———

/** la planta baja de Lolita */
function fachada(k) {
  const e0 = 32.6, e1 = 35.4, v0 = 36.1, v1 = 42.5, H = 3.2;
  // la entrada: el cristal esmerilado, los dos escalones de granito negro y el toldo blanco
  k.pic((e0 + e1) / 2, 1.75, Z, e1 - e0, H - 0.3, 0, 1, canvasTex(256, 270, puerta), { glow: 0.12 });
  for (const s of [e0, e1]) k.box(s, 0, Z + 0.05, 0.1, H, 0.2, GRANITO);
  k.box((e0 + e1) / 2, 0, Z + 0.375, e1 - e0, 0.16, 0.75, GRANITO);
  k.box((e0 + e1) / 2, 0.16, Z + 0.175, e1 - e0, 0.14, 0.35, GRANITO);
  const fuera = 1.25, alto = 3.25, bajo = 2.6, Lt = Math.hypot(fuera, alto - bajo), a = Math.atan2(alto - bajo, fuera);
  const tela = new THREE.BoxGeometry(e1 - e0 + 0.3, 0.03, Lt);
  tela.rotateX(a);
  tela.translate((e0 + e1) / 2, (alto + bajo) / 2, Z + fuera / 2);
  k.add(tela, 0xf2f0ea);
  k.box((e0 + e1) / 2, bajo - 0.36, Z + fuera, e1 - e0 + 0.3, 0.36, 0.02, 0xf2f0ea);
  k.pic((e0 + e1) / 2, bajo - 0.18, Z + fuera + 0.015, e1 - e0 + 0.2, 0.32, 0, 1, canvasTex(320, 40, faldon));
  // el pilar de granito negro y el escaparate grande con su zócalo
  k.box((e1 + v0) / 2, 0, Z + 0.05, v0 - e1, H + 0.3, 0.3, GRANITO);
  k.pic((v0 + v1) / 2, 0.35 + (H - 0.35) / 2, Z, v1 - v0, H - 0.35, 0, 1, canvasTex(768, 340, escaparate), { glow: 0.12 });
  k.box((v0 + v1) / 2, 0, Z + 0.05, v1 - v0, 0.35, 0.2, GRANITO);
  // el pilar de la esquina y la franja oscura de encima de todo
  k.box((v1 + L.len - 0.1) / 2, 0, Z + 0.05, L.len - 0.1 - v1, H + 0.3, 0.3, GRANITO);
  k.box((e0 + L.len - 0.1) / 2, H, Z + 0.05, L.len - 0.1 - e0, 0.3, 0.3, 0x3a3a3c);
}

/** segunda fase, como los demás de este barrio */
export function buildLolita(scene, colliders, map) {
  if (!map?.lolita) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, L, 'lolita', colliders);
  scene.add(group);
  return { group };
}
