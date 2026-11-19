import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { rebajarTramo, medianera } from './edificioReal.js';

/**
 * El Bar Er Cuchitrí de Jose Luis, el bar de tapas de la calle Argentina 32 (centro), con la vista de la calle de
 * Google de julio de 2025 y la foto de marzo de 2025 (solo se miran, no van dentro del juego; la gente no se pone):
 * la casa terrera blanca encalada; la puerta estrecha de madera azul verdosa, gastada, con su marco del mismo color;
 * encima, el letrero de tablas de madera con «Terraza», «ER CUCHITRÍ» y «de Jose Luis» en blanco y el pez dibujado
 * en azul claro; las placas y la pegatina de la alarma junto a la puerta; los cajetines blancos de la luz; y al lado,
 * el portón verde de cuarterones del garaje con su escalón, y el zócalo gris del vecino. La placa naranja de la
 * guía de bares lleva marca y no se pone. Encima, como en la vista de la calle mirando hacia arriba: la casa es
 * terrera, de una planta (4 m), con el pretil liso, los cables negros corridos por lo alto de la fachada y la antena;
 * el bloque del mapa es la manzana entera y mide 6 m, así que se le hace una muesca en el tramo de la casa y lo que
 * queda detrás asoma como el cuarto blanco de la azotea, liso, con la chimenea.
 */

// la cara de la calle Argentina (s de oeste a este); la vista de la calle pone la puerta del bar en s 20,1 y el
// portón verde en s 24,7 (Google pone el bar en s 22; el mapa no tenía rótulo suyo)
const M = marco([-475.42, 72.88], [-442.78, 57.35]);
const Z = 0.12, ZF = Z + 0.3, YP = 4.0, S0 = 16.5, S1 = 27.5, BLANCO = 0xf2f2ee;
// el fondo de la casa terrera y la altura del bloque del mapa que queda detrás
const FONDO = 5.5, YB = 6.0;

/** antes de levantar la ciudad: la marca de que se monta (el mapa no tenía rótulo suyo) y la casa a su altura */
export function tuneErCuchitri(map) {
  map.erCuchitri = true;
  rebajarTramo(map, M, S0, S1, FONDO, YP, [242, 242, 238]);
}

// ——— lo que se pinta en lienzo ———

/** el letrero de tablas de madera con el nombre y el pez */
function letrero(g, w, h) {
  const tablas = 6, alto = h / tablas;
  let s = 7;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < tablas; i++) {
    let x = 0;
    while (x < w) {
      const l = w * (0.25 + r() * 0.4), v = r();
      g.fillStyle = v < 0.3 ? '#6a3a26' : v < 0.6 ? '#7a4a30' : v < 0.85 ? '#8a5a3a' : '#5a3020';
      g.fillRect(x, i * alto + 1, l - 2, alto - 2);
      x += l;
    }
  }
  g.fillStyle = '#7ac0c8';
  g.textAlign = 'right';
  g.textBaseline = 'middle';
  g.font = `400 ${Math.round(h * 0.12)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('Terraza', w * 0.88, h * 0.26);
  g.strokeStyle = '#f4f4f0';
  g.lineWidth = 3;
  g.beginPath(); g.moveTo(w * 0.12, h * 0.27); g.lineTo(w * 0.62, h * 0.27); g.stroke();
  g.fillStyle = '#f4f4f0';
  g.textAlign = 'center';
  g.font = `700 ${Math.round(h * 0.27)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('ER CUCHITRÍ', w * 0.5, h * 0.46);
  g.textAlign = 'right';
  g.font = `700 ${Math.round(h * 0.13)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('de Jose Luis', w * 0.9, h * 0.68);
  // el pez dibujado en azul claro, con su línea larga
  g.strokeStyle = '#7ac0c8';
  g.lineWidth = 2;
  g.beginPath(); g.ellipse(w * 0.22, h * 0.76, w * 0.08, h * 0.08, -0.3, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(w * 0.15, h * 0.72); g.lineTo(w * 0.09, h * 0.66); g.lineTo(w * 0.1, h * 0.82); g.closePath(); g.stroke();
  g.beginPath(); g.moveTo(w * 0.3, h * 0.77); g.bezierCurveTo(w * 0.45, h * 0.95, w * 0.6, h * 0.7, w * 0.92, h * 0.86); g.stroke();
}

/** la puerta de madera azul verdosa, gastada */
function puerta(g, w, h) {
  g.fillStyle = '#2a5a5a';
  g.fillRect(0, 0, w, h);
  let s = 11;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 300; i++) {
    g.fillStyle = r() < 0.5 ? 'rgba(20,40,40,.35)' : 'rgba(120,160,150,.25)';
    g.fillRect(r() * w, r() * h, 1 + r() * 2, 3 + r() * 10);
  }
  g.strokeStyle = 'rgba(0,0,0,.35)';
  g.lineWidth = 3;
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
  for (const x of [0.08, 0.56]) g.strokeRect(w * x, h * 0.06, w * 0.36, h * 0.88);
}

/** el portón verde de cuarterones del garaje */
function porton(g, w, h) {
  g.fillStyle = '#1e7a3a';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(0,0,0,.35)';
  g.lineWidth = 2;
  const cols = 8, filas = 9;
  for (let c = 0; c < cols; c++) for (let f = 0; f < filas; f++) g.strokeRect(w * (0.03 + c * 0.12), h * (0.04 + f * 0.105), w * 0.1, h * 0.085);
  g.lineWidth = 4;
  for (const x of [0.25, 0.5, 0.75]) { g.beginPath(); g.moveTo(w * x, 0); g.lineTo(w * x, h); g.stroke(); }
}

/** el zócalo gris del vecino */
function zocalo(g, w, h) {
  g.fillStyle = '#8a8c8e';
  g.fillRect(0, 0, w, h);
  let s = 3;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 300; i++) { g.fillStyle = r() < 0.5 ? 'rgba(60,60,60,.3)' : 'rgba(200,200,200,.25)'; g.fillRect(r() * w, r() * h, 2, 2); }
}

// ——— las piezas ———

/** la casa encalada: la pared, la puerta del bar, el letrero, las placas, los cajetines y el portón verde */
function fachada(k) {
  k.box((S0 + S1) / 2, 0, Z + 0.15, S1 - S0, YP, 0.3, BLANCO);
  k.block((S0 + S1) / 2, Z + 0.15, S1 - S0, 0.3);
  // la puerta azul verdosa con su marco
  k.pic(20.1, 1.25, ZF + 0.01, 1.0, 2.5, 0, 1, canvasTex(90, 220, puerta), { glow: 0.05 });
  for (const t of [19.5, 20.7]) k.box(t, 0, ZF + 0.02, 0.16, 2.6, 0.06, 0x2a6a66);
  k.box(20.1, 2.55, ZF + 0.02, 1.36, 0.14, 0.06, 0x2a6a66);
  k.box(20.1, 0, ZF + 0.06, 1.3, 0.1, 0.2, 0x8a7a6a);
  // el letrero de tablas de madera, encima de la puerta
  k.box(20.0, 2.75, ZF + 0.03, 2.5, 1.25, 0.06, 0x6a3a26);
  k.pic(20.0, 3.375, ZF + 0.065, 2.48, 1.23, 0, 1, canvasTex(300, 150, letrero));
  // las placas y la pegatina de la alarma, y los cajetines de la luz
  k.box(21.0, 2.2, ZF + 0.02, 0.32, 0.3, 0.02, 0x1e1e20);
  k.box(21.0, 1.85, ZF + 0.02, 0.4, 0.26, 0.03, 0x5a4a3a);
  k.box(21.0, 1.6, ZF + 0.02, 0.35, 0.2, 0.02, 0xc8a070);
  k.box(21.1, 0.8, ZF + 0.05, 0.6, 0.6, 0.12, 0xece8e0);
  k.box(22.3, 0.85, ZF + 0.05, 0.5, 0.45, 0.12, 0xece8e0);
  k.box(22.2, 2.75, ZF + 0.05, 0.25, 0.35, 0.1, 0xe8e4dc);
  // el portón verde del garaje con su escalón
  k.pic(24.7, 1.4, ZF + 0.01, 2.8, 2.6, 0, 1, canvasTex(280, 260, porton));
  for (const t of [23.25, 26.15]) k.box(t, 0.1, ZF + 0.02, 0.1, 2.7, 0.06, 0x1e6a32);
  k.box(24.7, 2.7, ZF + 0.02, 3.0, 0.1, 0.06, 0x1e6a32);
  k.box(24.7, 0, ZF + 0.1, 2.9, 0.12, 0.3, 0xa8a49c);
  // el zócalo gris del vecino, al final
  k.pic(26.85, 0.9, ZF + 0.006, 1.3, 1.8, 0, 1, canvasTex(60, 80, zocalo));
}

/** lo de arriba: el pretil, los cables, la antena y lo que asoma detrás de la azotea */
function arriba(k) {
  const c = (S0 + S1) / 2, zb = Z + 0.3 - FONDO;
  // el pretil liso y los dos cables negros corridos por lo alto, con su caja de empalme
  k.box(c, YP - 0.12, ZF + 0.03, S1 - S0, 0.12, 0.08, 0xe8e6e0);
  for (const y of [YP - 0.42, YP - 0.5]) k.box(c, y, ZF + 0.035, S1 - S0, 0.035, 0.035, 0x1e1e20);
  k.box(22.0, YP - 0.52, ZF + 0.05, 0.3, 0.12, 0.08, 0x2a2a2c);
  k.box(22.25, 2.95, ZF + 0.03, 0.03, 0.55, 0.03, 0x1e1e20);
  // la antena de la izquierda, en el tejado
  k.cyl(17.2, YP, Z - 0.6, 0.025, 0.025, 2.4, 0x9a9a9a, { seg: 6 });
  k.box(17.2, YP + 2.0, Z - 0.6, 0.8, 0.03, 0.03, 0x9a9a9a);
  // las paredes lisas de lo que queda detrás (el cuarto de la azotea y los vecinos), con la chimenea
  k.box(c, YP, zb, S1 - S0, YB - YP, 0.12, BLANCO);
  for (const t of [S0 + 0.06, S1 - 0.06]) medianera(k, t, YP, YB, FONDO, Z, 0xeeeeea);
  k.box(c, YB - 0.1, zb + 0.04, S1 - S0, 0.1, 0.12, 0xe8e6e0);
  k.box(24.6, YB, zb - 0.7, 0.8, 1.1, 0.8, BLANCO);
  k.box(24.6, YB + 1.1, zb - 0.7, 1.0, 0.1, 1.0, 0xd8d6d0);
  k.cyl(25.6, YB, zb - 0.5, 0.15, 0.15, 0.7, 0xc8c8c4, { seg: 10 });
}

/** se monta con lo demás de Arrecife Centro */
export function buildErCuchitri(scene, colliders, map) {
  if (!map?.erCuchitri) return null;
  const k = new Kit();
  fachada(k);
  arriba(k);
  const group = enMarco(k, M, 'erCuchitri', colliders);
  scene.add(group);
  return { group };
}
