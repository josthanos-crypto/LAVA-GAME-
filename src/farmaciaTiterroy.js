import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * La Farmacia Titerroy (la del farmacéutico José Enrique Gómez López), en la avenida Hernández Pacheco 13, con
 * las fotos de Google Maps de agosto de 2019 y abril de 2022 (solo se miran, no van dentro del juego; la gente
 * de la foto no se pone): la casa blanca; la banda blanca del letrero bajo la cornisa, con «farmacia» y
 * «titerroy» en verde y la rayita que los separa; debajo, el frente de aluminio blanco con el escaparate de la
 * izquierda, las puertas correderas de cristal en medio y el escaparate de la derecha, con los carteles de
 * colores (sin las marcas de la foto) y la farmacia dentro; el escalón de granito, el portero y el cajetín de
 * la izquierda, el tablón de la derecha; y la cruz verde de bandera. El bloque se queda como está; lo de
 * abajo tapa su trozo.
 */

// la fachada de la avenida Hernández Pacheco (s de izquierda a derecha mirándola), donde la pone Google Maps
// (s 54); el rótulo del mapa estaba unos 70 m más allá, en la calle Gusa, y se quita
const F = marco([-882.82, -597.05], [-829.77, -658.32]);
const Z = 0.12, ZF = Z + 0.3, S0 = 50.7, S1 = 57.3, BLANCO = 0xf4f3ef, VERDE = 0x1e7a50, ALU = 0xe8e8e6;
const V0 = 51.5, V1 = 52.7, P1 = 54.9, V2 = 56.1, YB = 2.95;

/** antes de levantar la ciudad: fuera el rótulo genérico (el que estaba mal puesto en la calle Gusa) */
export function tuneFarmaciaTiterroy(map) {
  map.farmaciaTiterroySign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Farmacia titerroy');
  if (i >= 0) map.farmaciaTiterroySign = map.signs.splice(i, 1)[0];
  map.farmaciaTiterroy = true;
}

// ——— lo que se pinta en lienzo ———

/** la banda blanca con «farmacia» y «titerroy» en verde y la rayita de en medio */
function letrero(g, w, h) {
  g.fillStyle = '#f6f6f2';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#1e7a50';
  g.textBaseline = 'alphabetic';
  g.textAlign = 'left';
  g.font = `400 ${Math.round(h * 0.78)}px "Segoe UI", "Trebuchet MS", Arial, sans-serif`;
  g.fillText('farmacia', w * 0.08, h * 0.76);
  g.font = `400 ${Math.round(h * 0.5)}px "Segoe UI", "Trebuchet MS", Arial, sans-serif`;
  g.fillText('titerroy', w * 0.67, h * 0.76);
  g.fillStyle = '#d8dad6';
  g.fillRect(w * 0.615, h * 0.12, 3, h * 0.76);
}

/** un escaparate: los carteles de colores y las baldas de la farmacia detrás */
function escaparate(semilla) {
  return (g, w, h) => {
    g.fillStyle = '#e4e6e2';
    g.fillRect(0, 0, w, h);
    let s = semilla;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const col = ['#f0d8d0', '#d8e8f0', '#f4e8c8', '#d8f0e0', '#e8e0f0', '#f8f8f6'];
    g.fillStyle = '#f6f6f4';
    g.fillRect(0, h * 0.15, w, h * 0.7);
    for (let y = 0.2; y < 0.8; y += 0.1) for (let x = 0.03; x < 0.95; x += 0.07) { g.fillStyle = col[Math.floor(r() * 6)]; g.fillRect(w * x, h * y, w * 0.05, h * 0.07); }
    // los carteles pegados: uno grande y dos etiquetas naranjas
    g.fillStyle = ['#f2c8b8', '#c8e0f0'][semilla % 2];
    g.fillRect(w * 0.2, h * 0.25, w * 0.55, h * 0.4);
    g.fillStyle = '#fbfbf8';
    g.fillRect(w * 0.26, h * 0.3, w * 0.43, h * 0.12);
    g.fillStyle = '#f08a2a';
    for (const y of [0.7, 0.8]) g.fillRect(w * 0.1, h * y, w * 0.18, h * 0.07);
    g.fillStyle = 'rgba(255,255,255,.22)';
    g.fillRect(0, 0, w * 0.35, h);
  };
}

/** la farmacia por las puertas: las baldas, el mostrador y la luz del fondo */
function dentro(g, w, h) {
  g.fillStyle = '#e8e8e4';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#fbfbf8';
  g.fillRect(0, 0, w, h * 0.14);
  g.fillStyle = '#fff4d8';
  for (const x of [0.25, 0.5, 0.75]) { g.beginPath(); g.arc(w * x, h * 0.07, 3, 0, Math.PI * 2); g.fill(); }
  const col = ['#f0d0d0', '#d0e0f0', '#f0e8c0', '#d0f0d8', '#ffffff'];
  for (let y = 0.2; y < 0.7; y += 0.09) for (let x = 0.05; x < 0.95; x += 0.05) { g.fillStyle = col[Math.floor((x * 131 + y * 17) % 5)]; g.fillRect(w * x, h * y, w * 0.035, h * 0.06); }
  g.fillStyle = '#d8d4cc';
  g.fillRect(w * 0.15, h * 0.62, w * 0.7, h * 0.12);
  g.fillStyle = '#c8c4bc';
  g.fillRect(0, h * 0.85, w, h * 0.15);
}

// ——— las piezas ———

/** el bajo: la pared, el letrero con su cornisa, el frente de aluminio, el escalón, los cajetines y la cruz */
function fachada(k) {
  const sm = (S0 + S1) / 2;
  // la pared blanca del bajo por delante de lo genérico, con el hueco del frente
  for (const [s0, s1, y0, y1] of [[S0, V0 - 0.15, 0, 4.0], [V2 + 0.15, S1, 0, 4.0], [V0 - 0.15, V2 + 0.15, YB, 4.0]]) {
    k.box((s0 + s1) / 2, y0, Z + 0.15, s1 - s0, y1 - y0, 0.3, BLANCO);
  }
  k.block(sm, Z + 0.15, S1 - S0, 0.3);
  // la banda del letrero y la cornisa de encima
  k.pic(sm, YB + 0.38, ZF + 0.01, S1 - S0 - 0.3, 0.68, 0, 1, canvasTex(640, 68, letrero));
  k.box(sm, YB + 0.75, ZF + 0.08, S1 - S0, 0.16, 0.2, BLANCO);
  k.box(sm, YB + 0.72, ZF + 0.02, S1 - S0 - 0.1, 0.04, 0.06, 0xdcdcd8);
  // el frente de aluminio blanco: los dos escaparates, las puertas y el montante de arriba
  k.pic((V0 + V1) / 2, 1.5, Z + 0.06, V1 - V0, 2.1, 0, 1, canvasTex(120, 210, escaparate(7)), { glow: 0.12 });
  k.pic((P1 + V2) / 2, 1.5, Z + 0.06, V2 - P1, 2.1, 0, 1, canvasTex(120, 210, escaparate(12)), { glow: 0.12 });
  k.pic((V1 + P1) / 2, 1.3, Z + 0.04, P1 - V1, 2.3, 0, 1, canvasTex(220, 230, dentro), { glow: 0.25 });
  k.glass.push(new THREE.PlaneGeometry(V2 - V0, 2.3).translate((V0 + V2) / 2, 0.45 + 1.15, Z + 0.12));
  for (const s of [V0, V1, P1, V2]) k.box(s, 0.45, Z + 0.12, 0.1, YB - 0.45, 0.12, ALU);
  k.box((V1 + P1) / 2, 0.45, Z + 0.13, 0.04, 2.3, 0.05, 0xb8bab8);
  for (const y of [0.45, 2.75]) k.box((V0 + V2) / 2, y, Z + 0.12, V2 - V0 + 0.1, 0.1, 0.12, ALU);
  k.box((V0 + V2) / 2, 2.85, Z + 0.1, V2 - V0, YB - 2.85, 0.1, BLANCO);
  for (const [a, b] of [[V0, V1], [P1, V2]]) k.box((a + b) / 2, 0.45, Z + 0.1, b - a, 0.4, 0.1, ALU);
  k.box((V1 + P1) / 2, 0.42, Z + 0.1, P1 - V1, 0.05, 0.1, 0x8a8c90);
  // el escalón de granito gris
  k.box((V0 + V2) / 2, 0, Z + 0.55, V2 - V0 + 0.6, 0.42, 1.1, 0x9a9c9c);
  k.block((V0 + V2) / 2, Z + 0.55, V2 - V0 + 0.6, 1.1);
  // el portero y el cajetín de la izquierda, el tablón de la derecha
  k.box(51.1, 1.3, ZF + 0.04, 0.24, 0.5, 0.08, 0xc8cac8);
  k.box(51.1, 2.95, ZF + 0.04, 0.34, 0.26, 0.08, 0xc82a2a);
  k.box(56.75, 1.6, ZF + 0.04, 0.32, 0.4, 0.06, 0xe8e8e4);
  // la cruz verde de bandera (en la foto va en la primera planta; aquí la casa es de una, y va al lado del letrero)
  const sc = S1 + 0.35, yc = 2.55;
  k.box(sc, yc + 0.5, ZF + 0.15, 0.06, 0.06, 0.4, 0x5a5c60);
  k.box(sc, yc, ZF + 0.5, 0.14, 1.1, 0.3, VERDE);
  k.box(sc, yc + 0.4, ZF + 0.5, 0.14, 0.3, 0.75, VERDE);
}

/** se monta con lo demás de Titerroy */
export function buildFarmaciaTiterroy(scene, colliders, map) {
  if (!map?.farmaciaTiterroy) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, F, 'farmaciaTiterroy', colliders);
  scene.add(group);
  return { group };
}
