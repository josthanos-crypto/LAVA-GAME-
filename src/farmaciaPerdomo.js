import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * La Farmacia Perdomo González, en la calle José Pereyra Galviaty 31 (Titerroy, detrás de la estación de
 * guaguas), con las fotos de Google Maps de marzo de 2018 y febrero de 2021 (solo se miran, no van dentro del
 * juego): la casa blanca; el portal de dos hojas blancas con sus ventanitas; la entrada de la farmacia con el
 * marco blanco grueso, las puertas correderas de cristal y la farmacia blanca y luminosa dentro; encima, las
 * letras verdes en relieve de «FARMACIA» y «Perdomo Gonzalez» en gris; a los lados, el portero, la placa del
 * horario y el tablón blanco de las guardias; y la cruz verde de bandera. El bloque se queda como
 * está; lo de abajo tapa su trozo.
 */

// la fachada de la calle José Pereyra Galviaty (s de izquierda a derecha mirándola); el rótulo cae en s 14,5
const F = marco([-341.53, -645.25], [-364.73, -677.8]);
const Z = 0.12, ZF = Z + 0.3, S0 = 9.4, S1 = 19.2, BLANCO = 0xf4f3ef, VERDE = 0x1e8a50;
const P0 = 13.3, P1 = 15.7, PH = 2.45;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneFarmaciaPerdomo(map) {
  map.farmaciaPerdomoSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Farmacia Perdomo Gonzalez');
  if (i >= 0) map.farmaciaPerdomoSign = map.signs.splice(i, 1)[0];
  map.farmaciaPerdomo = true;
}

// ——— lo que se pinta en lienzo ———

/** «FARMACIA» en verde con su sombra (las letras en relieve) y «Perdomo Gonzalez» en gris */
function letras(g, w, h) {
  g.fillStyle = '#f4f3ef';
  g.fillRect(0, 0, w, h);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `900 ${Math.round(h * 0.62)}px "Arial Black", "Segoe UI", Arial, sans-serif`;
  const m = g.measureText('FARMACIA').width, k = Math.min(1, (w * 0.98) / m);
  g.save();
  g.translate(w / 2, h * 0.36);
  g.scale(k, 1);
  g.fillStyle = 'rgba(40,60,50,.35)';
  g.fillText('FARMACIA', 6, 6);
  g.fillStyle = '#1e7a48';
  g.fillText('FARMACIA', 2, 2);
  g.fillStyle = '#2a9a5a';
  g.fillText('FARMACIA', 0, 0);
  g.restore();
  g.fillStyle = '#4a4c50';
  g.font = `400 ${Math.round(h * 0.17)}px "Century Gothic", "Segoe UI", Arial, sans-serif`;
  g.fillText('Perdomo  Gonzalez', w * 0.58, h * 0.86);
}

/** la farmacia por las puertas: el techo blanco con los focos, las baldas blancas y el mostrador */
function dentro(g, w, h) {
  g.fillStyle = '#ecebe6';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#fbfbf8';
  g.fillRect(0, 0, w, h * 0.16);
  g.fillStyle = '#fff4d8';
  for (const x of [0.2, 0.4, 0.6, 0.8]) for (const y of [0.05, 0.11]) { g.beginPath(); g.arc(w * x, h * y, 3, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#c8c0b4';
  g.fillRect(0, h * 0.82, w, h * 0.18);
  // las baldas de los lados con los productos de colores
  const col = ['#e8e8e8', '#c8d8e8', '#f0c8c8', '#d8e8c8', '#f4e0b0'];
  for (const [x0, x1] of [[0, 0.22], [0.78, 1]]) {
    g.fillStyle = '#f6f6f4';
    g.fillRect(w * x0, h * 0.2, w * (x1 - x0), h * 0.62);
    for (let y = 0.25; y < 0.78; y += 0.09) {
      for (let x = x0 + 0.01; x < x1 - 0.02; x += 0.03) { g.fillStyle = col[Math.floor((x * 97 + y * 31) % 5)]; g.fillRect(w * x, h * y, w * 0.022, h * 0.06); }
    }
  }
  // el mostrador del fondo y la mesita blanca del medio
  g.fillStyle = '#d8d4cc';
  g.fillRect(w * 0.32, h * 0.55, w * 0.36, h * 0.12);
  g.fillStyle = '#5a5654';
  g.fillRect(w * 0.45, h * 0.32, w * 0.1, h * 0.23);
  g.fillStyle = '#f8f8f6';
  g.fillRect(w * 0.44, h * 0.7, w * 0.12, h * 0.04);
  g.fillRect(w * 0.47, h * 0.74, w * 0.06, h * 0.1);
}

/** el portal de dos hojas blancas con las ventanitas oscuras arriba */
function portal(g, w, h) {
  g.fillStyle = '#f6f5f1';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(0,0,0,.18)';
  g.lineWidth = 2;
  g.strokeRect(2, 2, w - 4, h - 4);
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
  g.fillStyle = '#2a2a2c';
  for (const x of [0.08, 0.56]) g.fillRect(w * x, h * 0.06, w * 0.36, h * 0.2);
  for (const x of [0.08, 0.56]) for (const y of [0.34, 0.62]) g.strokeRect(w * x, h * y, w * 0.36, h * 0.24);
}

/** la placa de cristal del horario */
function horario(g, w, h) {
  g.fillStyle = '#e8ece8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#1e8a50';
  g.font = `700 ${Math.round(h * 0.16)}px "Segoe UI", Arial, sans-serif`;
  g.textAlign = 'center';
  g.fillText('HORARIO', w / 2, h * 0.25);
  g.fillStyle = '#4a4c50';
  for (let y = 0.4; y < 0.9; y += 0.12) g.fillRect(w * 0.2, h * y, w * 0.6, h * 0.03);
}

// ——— las piezas ———

/** la planta baja: la pared blanca, el portal, la entrada de la farmacia, las letras y la cruz */
function fachada(k) {
  const pm = (P0 + P1) / 2;
  // la pared blanca del bajo, por delante de lo genérico del bloque (con los huecos del portal y de la entrada)
  for (const [s0, s1, y0] of [[S0, 9.9, 0], [11.5, P0 - 0.25, 0], [P1 + 0.25, S1, 0], [9.9, 11.5, 2.4], [P0 - 0.25, P1 + 0.25, PH + 0.3]]) {
    k.box((s0 + s1) / 2, y0, Z + 0.15, s1 - s0, 3.95 - y0, 0.3, BLANCO);
  }
  k.block((S0 + S1) / 2, Z + 0.15, S1 - S0, 0.3);
  // el portal de dos hojas blancas
  k.pic(10.7, 1.2, Z + 0.05, 1.6, 2.4, 0, 1, canvasTex(120, 180, portal));
  k.box(10.7, 0, Z + 0.15, 1.7, 0.08, 0.3, 0xd8d6d0);
  // la entrada: el fondo de la farmacia, el marco blanco grueso y las puertas de cristal
  k.pic(pm, PH / 2, Z + 0.02, P1 - P0, PH, 0, 1, canvasTex(260, 230, dentro), { glow: 0.3 });
  for (const s of [P0 - 0.12, P1 + 0.12]) k.box(s, 0, ZF + 0.02, 0.26, PH + 0.3, 0.3, BLANCO);
  k.box(pm, PH, ZF + 0.02, P1 - P0 + 0.5, 0.3, 0.3, BLANCO);
  k.glass.push(new THREE.PlaneGeometry(P1 - P0, PH).translate(pm, PH / 2, Z + 0.2));
  k.box(pm, 0, Z + 0.2, 0.04, PH, 0.04, 0xb8bab8);
  k.box(pm, PH - 0.2, Z + 0.24, 0.5, 0.14, 0.12, 0x3a3a3c);
  // el portero, la placa del horario y el tablón blanco de las guardias
  k.box(12.65, 0.95, ZF + 0.03, 0.22, 0.42, 0.06, 0x7a7c80);
  k.pic(12.25, 1.45, ZF + 0.01, 0.34, 0.5, 0, 1, canvasTex(68, 100, horario));
  k.box(16.5, 1.2, ZF + 0.04, 0.5, 0.62, 0.08, 0xe8e8e4);
  k.box(16.5, 1.26, ZF + 0.085, 0.4, 0.5, 0.01, 0xb8bcc0);
  // encima, las letras verdes y el nombre
  k.pic(pm + 0.1, 3.2, ZF + 0.03, 3.9, 0.95, 0, 1, canvasTex(620, 150, letras));
  // la cruz verde de bandera, con su brazo
  const sc = 18.3, yc = 3.0, zc = ZF + 0.55;
  k.box(sc, yc + 0.28, ZF + 0.2, 0.06, 0.06, 0.45, 0x5a5c60);
  k.box(sc, yc, zc, 0.12, 0.66, 0.22, VERDE);
  k.box(sc, yc + 0.22, zc, 0.12, 0.22, 0.66, VERDE);
}

/** se monta con lo demás de Titerroy */
export function buildFarmaciaPerdomo(scene, colliders, map) {
  if (!map?.farmaciaPerdomo) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, F, 'farmaciaPerdomo', colliders);
  scene.add(group);
  return { group };
}
