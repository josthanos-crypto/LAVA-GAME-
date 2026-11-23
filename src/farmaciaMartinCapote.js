import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, barra } from './restaurantesCharco.js';

/**
 * La Farmacia Martín Capote, en la calle Fajardo, con las fotos de Google Maps de 2025 (solo se miran, no
 * van dentro del juego): la planta baja chapada de mármol verde, los dos escaparates de arco con su marco
 * de madera, la puerta de madera en medio con la farmacia dentro y la pizarra de pie en la entrada, los
 * dos faroles de brazo, la placa oscura con «Farmacia Martín Capote 1908», la cornisa blanca y el toldo
 * gris de ondas de encima con sus focos. Lo de dentro de los escaparates va sin las marcas de la foto. La
 * calle llega hasta la pared. El bloque se queda como está.
 */

// la cara de la calle Fajardo (s desde el extremo del noreste)
const F = marco([39.0, 274.9], [-40.3, 195.3]);
const Z = 0.12, S0 = 85.0, S1 = 92.4, H = 3.2, MADERA = 0x6a2e1e;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneFarmaciaMartinCapote(map) {
  map.farmaciaMartinCapoteSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'LCDA. Mercedes Martin Capote');
  if (i >= 0) map.farmaciaMartinCapoteSign = map.signs.splice(i, 1)[0];
  map.farmaciaMartinCapote = true;
}

// ——— lo que se pinta en lienzo ———

/** el mármol verde con sus vetas claras */
function marmol(g, w, h) {
  g.fillStyle = '#7a9a8e';
  g.fillRect(0, 0, w, h);
  let s = 31;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 2000; i++) { g.fillStyle = `rgba(${150 + r() * 80},${180 + r() * 60},${170 + r() * 60},${0.15 + r() * 0.2})`; g.fillRect(r() * w, r() * h, 2 + r() * 3, 1 + r() * 2); }
  g.strokeStyle = 'rgba(220,235,228,.25)';
  for (let i = 0; i < 30; i++) {
    g.lineWidth = 1 + r() * 2;
    g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y);
    for (let j = 0; j < 4; j++) { x += (r() - 0.5) * w * 0.2; y += (r() - 0.3) * h * 0.2; g.lineTo(x, y); }
    g.stroke();
  }
  g.strokeStyle = 'rgba(30,50,44,.4)';
  g.lineWidth = 2;
  for (let y = 0; y < h; y += h / 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** un escaparate de arco: el mármol de alrededor, el marco de madera y dentro los productos y las flores */
function escaparate(seed) {
  return (g, w, h) => {
    marmol(g, w, h);
    const m = w * 0.08, r = (w - 2 * m) / 2, top = m + r;
    const arco = () => { g.beginPath(); g.moveTo(m, h - m); g.lineTo(m, top); g.arc(w / 2, top, r, Math.PI, 0); g.lineTo(w - m, h - m); g.closePath(); };
    // lo de dentro: el fondo de flores y hojas, los productos y la repisa
    g.save(); arco(); g.clip();
    g.fillStyle = '#e8dcc8';
    g.fillRect(0, 0, w, h);
    let s = seed;
    const rr = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 40; i++) { g.fillStyle = ['#3a6a4a', '#c87a3a', '#d8b860', '#8a4a5a', '#f2f0ea'][Math.floor(rr() * 5)]; g.beginPath(); g.ellipse(rr() * w, rr() * h * 0.7, w * 0.06, h * 0.03, rr() * 3, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#f4f2ee';
    g.fillRect(w * 0.25, h * 0.4, w * 0.5, h * 0.3);
    for (let i = 0; i < 5; i++) { g.fillStyle = ['#d8504a', '#e8a040', '#4a8ac8', '#9a5ab8', '#3a9a6a'][i]; g.fillRect(w * (0.3 + i * 0.085), h * 0.52, w * 0.06, h * 0.14); }
    g.fillStyle = '#e87a2a';
    g.fillRect(m, h * 0.84, w - 2 * m, h * 0.1);
    g.fillStyle = 'rgba(255,255,255,.18)';
    g.fillRect(0, 0, w * 0.35, h);
    g.restore();
    // el marco de madera del arco
    g.strokeStyle = '#6a2e1e';
    g.lineWidth = w * 0.045;
    arco(); g.stroke();
  };
}

/** por la puerta: el mostrador, las estanterías de madera y la lámpara */
function dentro(g, w, h) {
  g.fillStyle = '#d8ccb4';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#7a4a30';
  for (let x = 0.05; x < 1; x += 0.3) g.fillRect(w * x, h * 0.15, w * 0.22, h * 0.55);
  let s = 3;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let y = 0.2; y < 0.66; y += 0.08) for (let x = 0.07; x < 0.97; x += 0.05) if (((x - 0.05) % 0.3) < 0.2) { g.fillStyle = ['#f2f2ee', '#3a8a5a', '#e8a0a8', '#5a8ac8'][Math.floor(r() * 4)]; g.fillRect(w * x, h * y, w * 0.035, h * 0.05); }
  g.fillStyle = '#b89a78';
  g.fillRect(0, h * 0.78, w, h * 0.22);
  g.fillStyle = '#fff4d0';
  g.beginPath(); g.arc(w / 2, h * 0.08, w * 0.06, 0, Math.PI * 2); g.fill();
}

/** la placa oscura con el nombre y el año */
function placa(g, w, h) {
  g.fillStyle = '#3a3e3c';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#b8b0a0';
  g.lineWidth = 3;
  g.strokeRect(4, 4, w - 8, h - 8);
  g.fillStyle = '#e8e2d4';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.13)}px Georgia, serif`;
  ['FARMACIA', 'MARTÍN', 'CAPOTE', '1908'].forEach((t, i) => g.fillText(t, w / 2, h * (0.2 + i * 0.2)));
}

/** el faldón del toldo: gris con las ondas de abajo */
function ondas(g, w, h) {
  g.fillStyle = '#8a8e92';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#6a6e72';
  for (let x = 0; x < w; x += h * 1.4) { g.beginPath(); g.arc(x + h * 0.7, h, h * 0.7, Math.PI, 0); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,.15)';
  for (let x = 0; x < w; x += h * 1.4) g.fillRect(x, 0, 2, h);
}

// ——— las piezas ———

/** un farol de brazo, como los de la foto */
function farol(k, s) {
  barra(k, [s, 2.15, Z + 0.02], [s, 2.15, Z + 0.3], 0.025, 0x3a2a1e);
  k.box(s, 1.82, Z + 0.32, 0.18, 0.3, 0.18, 0xffe2a8, { list: k.glow });
  k.box(s, 2.12, Z + 0.32, 0.24, 0.06, 0.24, 0x5a3a22);
  k.box(s, 1.78, Z + 0.32, 0.2, 0.04, 0.2, 0x5a3a22);
}

/** la planta baja de la farmacia */
function fachada(k) {
  const sm = (S0 + S1) / 2;
  // el mármol verde de toda la planta baja y el zócalo
  k.box(sm, 0, Z - 0.05, S1 - S0, H, 0.1, 0x7a9a8e);
  k.pic(sm, H / 2, Z + 0.004, S1 - S0, H, 0, 1, canvasTex(512, 220, marmol));
  // los dos escaparates de arco
  for (const [s, seed] of [[S0 + 1.2, 7], [S1 - 1.2, 19]]) k.pic(s, 1.5, Z + 0.02, 1.8, 2.3, 0, 1, canvasTex(160, 204, escaparate(seed)), { glow: 0.1 });
  // la puerta de madera con lo de dentro, el escalón y la pizarra de pie
  k.box(sm, 0, Z + 0.02, 1.9, 2.7, 0.06, MADERA);
  k.pic(sm, 1.3, Z + 0.055, 1.6, 2.5, 0, 1, canvasTex(128, 200, dentro), { glow: 0.15 });
  k.box(sm, 0, Z + 0.2, 2.1, 0.08, 0.4, 0x8a5a44);
  // los dos faroles de brazo y la placa
  farol(k, S0 + 2.55);
  farol(k, S1 - 2.55);
  k.pic(S0 + 2.55, 1.15, Z + 0.02, 0.5, 0.65, 0, 1, canvasTex(100, 130, placa));
  // la cornisa blanca de encima y el toldo gris de ondas con sus focos
  k.box(sm, H, Z + 0.1, S1 - S0 + 0.3, 0.3, 0.3, 0xf0eee8);
  const fuera = 1.1, alto = 4.1, bajo = 3.55, L = Math.hypot(fuera, alto - bajo), a = Math.atan2(alto - bajo, fuera);
  const tela = new THREE.BoxGeometry(S1 - S0, 0.03, L);
  tela.rotateX(a);
  tela.translate(sm, (alto + bajo) / 2, Z + fuera / 2);
  k.add(tela, 0x9a9ea2);
  k.box(sm, bajo - 0.3, Z + fuera, S1 - S0, 0.3, 0.02, 0x8a8e92);
  k.pic(sm, bajo - 0.15, Z + fuera + 0.015, S1 - S0, 0.3, 0, 1, canvasTex(740, 30, ondas));
  for (const s of [S0 + 1.2, sm, S1 - 1.2]) k.box(s, 3.32, Z + 0.35, 0.16, 0.1, 0.16, 0x2a2a2a);
}

/** segunda fase, como los demás de este barrio */
export function buildFarmaciaMartinCapote(scene, colliders, map) {
  if (!map?.farmaciaMartinCapote) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, F, 'farmaciaMartinCapote', colliders);
  scene.add(group);
  return { group };
}
