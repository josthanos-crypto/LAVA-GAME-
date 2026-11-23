import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * La Corona Lanzarote, la bombonería artesanal del centro comercial de la Marina Lanzarote, con la foto de
 * Google Maps de mayo de 2021 (solo se mira, no va dentro del juego; la gente de la foto no se pone): el
 * panel gris claro con el logo redondo blanco de la corona dorada, «La Corona», «Lanzarote» y «Bombonería
 * Artesanal» en dorado, y la cristalera alta de perfiles plateados con la puerta y la tienda dentro, con
 * su luz cálida, las paredes blancas, las baldas de madera clara con las cajas de bombones y el cartel
 * blanco de pie. Va entre Springfield y Sunglass Hut, como en el mapa. El bloque se queda como está.
 */

// la cara que da al paseo de la Marina (s desde el extremo del norte); el rótulo del mapa cae en s 19,4
const C = marco([1171.56, -167.15], [1139.35, -110.34]);
const Z = 0.12, S0 = 16.8, S1 = 22.2, ALTO = 5.6, GRIS = 0xc8cacc, PERFIL = 0xa8acb0;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneLaCorona(map) {
  map.laCoronaSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Bombonería La Corona');
  if (i >= 0) map.laCoronaSign = map.signs.splice(i, 1)[0];
  map.laCorona = true;
}

// ——— lo que se pinta en lienzo ———

/** las placas gris claro del revestimiento con sus juntas */
function placas(g, w, h) {
  g.fillStyle = '#c8cacc';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(120,124,128,.6)';
  g.lineWidth = 2;
  for (let x = 0; x < w; x += w / 4) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y < h; y += h / 3) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** la corona dorada del logo, sobre blanco */
function corona(g, w, h) {
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#b8924a';
  g.lineWidth = w * 0.035;
  g.lineJoin = 'round';
  const y0 = h * 0.7, y1 = h * 0.3;
  g.beginPath();
  g.moveTo(w * 0.18, y0); g.lineTo(w * 0.18, h * 0.42); g.lineTo(w * 0.34, h * 0.55); g.lineTo(w * 0.5, y1);
  g.lineTo(w * 0.66, h * 0.55); g.lineTo(w * 0.82, h * 0.42); g.lineTo(w * 0.82, y0); g.closePath();
  g.stroke();
  g.beginPath(); g.moveTo(w * 0.18, h * 0.62); g.lineTo(w * 0.82, h * 0.62); g.stroke();
  g.fillStyle = '#b8924a';
  for (const [x, y] of [[0.18, 0.4], [0.5, 0.27], [0.82, 0.4]]) { g.beginPath(); g.arc(w * x, h * y, w * 0.035, 0, Math.PI * 2); g.fill(); }
}

/** el nombre en el panel gris: La Corona, Lanzarote y Bombonería Artesanal en dorado */
function nombre(g, w, h) {
  g.fillStyle = '#c8cacc';
  g.fillRect(0, 0, w, h);
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  g.fillStyle = '#3a3230';
  g.font = `600 ${Math.round(h * 0.36)}px Georgia, "Times New Roman", serif`;
  g.fillText('La Corona', w * 0.02, h * 0.3);
  const ancho = g.measureText('La Corona').width;
  g.textAlign = 'right';
  g.font = `600 ${Math.round(h * 0.14)}px Georgia, serif`;
  g.fillText('Lanzarote', w * 0.02 + ancho, h * 0.58);
  g.textAlign = 'left';
  g.fillStyle = '#a8823a';
  g.font = `italic 600 ${Math.round(h * 0.15)}px "Segoe Script", Georgia, serif`;
  g.fillText('Bombonería Artesanal', w * 0.04, h * 0.82);
}

/** la tienda por el cristal: la luz cálida, las paredes blancas, las baldas de madera y las cajas */
function tienda(conCartel) {
  return (g, w, h) => {
    g.fillStyle = '#f4ead8';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#d8c4a0';
    g.fillRect(0, h * 0.86, w, h * 0.14);
    // las baldas de madera clara con las cajas de bombones
    g.fillStyle = '#d8b888';
    g.fillRect(w * 0.08, h * 0.15, w * 0.84, h * 0.6);
    g.fillStyle = '#f8f2e6';
    g.fillRect(w * 0.12, h * 0.18, w * 0.76, h * 0.54);
    let s = 7;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let y = 0.24; y < 0.7; y += 0.12) {
      g.fillStyle = '#c8a070';
      g.fillRect(w * 0.12, h * (y + 0.07), w * 0.76, h * 0.015);
      for (let x = 0.15; x < 0.84; x += 0.09) { g.fillStyle = ['#ffffff', '#5a3a2a', '#c8a070', '#e8d8c0'][Math.floor(r() * 4)]; g.fillRect(w * x, h * (y + 0.02), w * 0.07, h * 0.05); }
    }
    // el mostrador
    g.fillStyle = '#e8dcc8';
    g.fillRect(w * 0.2, h * 0.7, w * 0.6, h * 0.16);
    if (conCartel) {
      g.fillStyle = '#ffffff';
      g.fillRect(w * 0.1, h * 0.58, w * 0.42, h * 0.3);
      g.fillStyle = '#3a3230';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = `600 ${Math.round(h * 0.06)}px Georgia, serif`;
      g.fillText('La Corona', w * 0.31, h * 0.7);
    }
    g.fillStyle = 'rgba(255,255,255,.14)';
    g.fillRect(0, 0, w * 0.3, h);
  };
}

// ——— las piezas ———

/** la bombonería: el panel gris, el logo, el nombre y la cristalera */
function fachada(k) {
  const sm = (S0 + S1) / 2, yC = 3.1;
  k.box(sm, 0, Z - 0.05, S1 - S0, ALTO, 0.1, GRIS);
  k.pic(sm, (yC + ALTO) / 2, Z + 0.004, S1 - S0, ALTO - yC, 0, 1, canvasTex(320, 148, placas));
  // el logo redondo blanco con la corona y el nombre al lado
  const r = 0.44, sL = S0 + 1.0, yL = 3.8;
  const disco = new THREE.CylinderGeometry(r, r, 0.05, 32);
  disco.rotateX(Math.PI / 2);
  disco.translate(sL, yL, Z + 0.025);
  k.add(disco, 0xffffff);
  k.pic(sL, yL, Z + 0.055, r * 1.4, r * 1.4, 0, 1, canvasTex(128, 128, corona));
  k.pic(sL + 1.95, yL - 0.02, Z + 0.01, 3.2, 0.95, 0, 1, canvasTex(420, 124, nombre));
  // la cristalera: el cristal de la izquierda, la puerta y el de la derecha
  const a = S0 + 0.2, b = S0 + 1.9, c = S0 + 3.1, d = S1 - 0.2;
  k.pic((a + b) / 2, yC / 2, Z + 0.01, b - a, yC, 0, 1, canvasTex(120, 220, tienda(true)), { glow: 0.12 });
  k.pic((b + c) / 2, yC / 2, Z + 0.01, c - b, yC, 0, 1, canvasTex(90, 230, tienda(false)), { glow: 0.12 });
  k.pic((c + d) / 2, yC / 2, Z + 0.01, d - c, yC, 0, 1, canvasTex(160, 220, tienda(false)), { glow: 0.12 });
  for (const s of [a, b, c, d]) k.box(s, 0, Z + 0.04, 0.07, yC, 0.08, PERFIL);
  for (const y of [0, yC - 0.06]) k.box((a + d) / 2, y, Z + 0.04, d - a, 0.06, 0.08, PERFIL);
  k.box((b + c) / 2, 2.45, Z + 0.04, c - b, 0.05, 0.08, PERFIL);
  k.box(b + 0.12, 0.9, Z + 0.1, 0.03, 0.6, 0.03, 0xd8d8d4);
  // la luz rectangular del techo de la entrada
  k.box(S0 + 2.4, 4.85, Z + 0.05, 0.4, 0.08, 0.12, 0xe8e8e4);
}

/** se monta con lo demás de Valterra, en su primera fase */
export function buildLaCorona(scene, colliders, map) {
  if (!map?.laCorona) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, C, 'laCorona', colliders);
  scene.add(group);
  return { group };
}
