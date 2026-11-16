import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, barDentro } from './restaurantesCharco.js';
import { alzarEdificio, cristales, medianera } from './edificioReal.js';

/**
 * El Edificio Aurora, en la calle Parranda de los Buches 16 (pegado a la casa del Jardín de los Presentes), con la
 * cafetería del bajo, con las vistas de la calle de Google de julio de 2025 (solo se miran, no van dentro del juego; la
 * gente no se pone). Google pone ahí «La Tapería Moi&Vane», pero en internet no hay nada de ella y en la foto el nombre
 * no se lee: se pone solo lo que se ve. El edificio es moderno, el bajo y tres plantas (13 m; el bloque del mapa era
 * de una planta, 4 m), forrado de placas de piedra clara color crema rosado: en la primera planta, las ventanas de
 * marco gris oscuro con el cristal que refleja; en la segunda y la tercera, los cuerpos que salen de la pared con las
 * lamas marrones tumbadas delante de las ventanas, sobre su losa gruesa; entre ellos, la franja de la escalera con
 * las rayas hondas. En el bajo, la cafetería con la banda verde de «CAFETERÍA · HAMBURGUESERÍA · BOCATAS · PULGUITAS ·
 * PIZZAS · CROISSANTS · SANDWICHES · PERRITOS CALIENTES · PAPAS» y el letrero alto de canto; delante, la terraza
 * cerrada con los plásticos transparentes y sus tiras blancas, la franja azul oscuro de arriba y la verde de abajo,
 * el toldo gris encima y las mesas de madera dentro; el letrero azul de «16 EDIFICIO AURORA» encima del portal; el
 * centro de estética MAIVE con sus dos puertas de marco verde agua (sin los carteles de las caras) y las tiendas de
 * después.
 */

// la cara de Parranda de los Buches del bloque, de la esquina de Teruel (s 0) hacia el sur, con N hacia la calle
const M = marco([-876.55, -161.31], [-846.38, -89.09]);
const Z = 0.12, ZF = Z + 0.3, YB = 3.8, YP2 = 6.9, TECHO = 13.0, PIEDRA = 0xe8d8c8, LAMA = 0x6a4a3a;
const E0 = 7.8, E1 = 24.4, FONDO = 14;
// los cuerpos de lamas (de s a s) y la franja de la escalera
const CUERPOS = [[9.4, 11.8], [13.3, 17.4], [18.4, 21.6]];
const ESCALERA = [11.8, 13.2];

/** antes de levantar la ciudad: la marca de que se monta y el edificio a su altura */
export function tuneEdificioAurora(map) {
  map.edificioAurora = true;
  alzarEdificio(map, M, E0, E1, FONDO, TECHO, [232, 216, 200]);
}

// ——— lo que se pinta en lienzo ———

/** las placas de piedra clara, con sus juntas */
function placas(g, w, h) {
  g.fillStyle = '#e8d8c8';
  g.fillRect(0, 0, w, h);
  let s = 5;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const pw = 48, ph = 24;
  for (let y = 0; y < h; y += ph) for (let x = 0; x < w; x += pw) {
    const v = Math.floor(r() * 14) - 7;
    g.fillStyle = `rgb(${232 + v},${216 + v},${200 + v})`;
    g.fillRect(x + 1, y + 1, pw - 2, ph - 2);
  }
}

/** la banda verde de la cafetería con lo que sirve, en letra blanca inclinada */
function banda(g, w, h) {
  g.fillStyle = '#2a6a46';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8f0ea';
  g.fillRect(0, 0, w, 3);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 800 ${Math.round(h * 0.6)}px "Arial Narrow", Arial, sans-serif`;
  g.fillText('CAFETERÍA - HAMBURGUESERÍA - BOCATAS - PULGUITAS - PIZZAS - CROISSANTS - SANDWICHES - PERRITOS CALIENTES - PAPAS', w / 2, h * 0.55, w - 10);
}

/** el letrero alto de canto, color crema, con «CAFETERÍA» de arriba abajo */
function letreroCanto(g, w, h) {
  g.fillStyle = '#f0e2b8';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c8a860';
  g.lineWidth = 4;
  g.strokeRect(2, 2, w - 4, h - 4);
  g.fillStyle = '#5a3a2a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(w * 0.55)}px Georgia, serif`;
  const t = 'CAFETERÍA';
  for (let i = 0; i < t.length; i++) g.fillText(t[i], w / 2, h * (0.08 + (i * 0.84) / (t.length - 1)));
}

/** el letrero azul del portal: «16» y «EDIFICIO AURORA» */
function letrero16(g, w, h) {
  g.fillStyle = '#1e3a8a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4f4f0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(h * 0.42)}px Arial, sans-serif`;
  g.fillText('16', w / 2, h * 0.3);
  g.font = `700 ${Math.round(h * 0.2)}px "Arial Narrow", Arial, sans-serif`;
  g.fillText('EDIFICIO AURORA', w / 2, h * 0.75, w * 0.92);
}

/** el rótulo de MAIVE, en letras finas grises sobre la placa de piedra */
function maive(g, w, h) {
  g.fillStyle = '#e8d8c8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#6a6a6c';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `300 ${Math.round(h * 0.55)}px Arial, sans-serif`;
  g.fillText('MAIVE', w / 2, h * 0.42);
  g.font = `500 ${Math.round(h * 0.16)}px Arial, sans-serif`;
  g.fillText('CENTRO MÉDICO ESTÉTICO', w / 2, h * 0.82, w * 0.9);
}

/** el escaparate de una tienda: el cristal con carteles claros, sin fotos de caras */
function escaparate(fondo) {
  return (g, w, h) => {
    g.fillStyle = '#3a4448';
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,.12)';
    g.fillRect(0, 0, w * 0.3, h);
    g.fillStyle = fondo;
    g.fillRect(w * 0.1, h * 0.12, w * 0.35, h * 0.45);
    g.fillRect(w * 0.55, h * 0.18, w * 0.35, h * 0.3);
    g.fillStyle = 'rgba(40,60,60,.5)';
    for (let y = h * 0.2; y < h * 0.5; y += h * 0.06) g.fillRect(w * 0.14, y, w * 0.27, 2);
  };
}

/** la terraza cerrada: plástico transparente con las tiras blancas */
function plastico(g, w, h) {
  g.clearRect(0, 0, w, h);
  g.fillStyle = 'rgba(200,215,220,.22)';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(250,250,250,.9)';
  g.lineWidth = 3;
  for (let x = 0; x <= w; x += w / Math.max(2, Math.round(w / 40))) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (const y of [h * 0.35, h * 0.7]) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** las lamas marrones tumbadas, con el hueco oscuro entre ellas */
function lamas(g, w, h) {
  g.fillStyle = '#2a2420';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#6a4a3a';
  for (let y = 2; y < h; y += 9) g.fillRect(0, y, w, 6);
  g.fillStyle = '#4a4e54';
  for (let x = 0; x <= w; x += w / 3) g.fillRect(Math.min(x, w - 4), 0, 4, h);
}

// ——— las piezas ———

/** el forro de piedra de toda la fachada, con la losa de encima del bajo y la cornisa */
function paredes(k) {
  const c = (E0 + E1) / 2, L = E1 - E0;
  k.box(c, 0, Z + 0.15, L, TECHO, 0.3, PIEDRA);
  k.block(c, Z + 0.15, L, 0.3);
  k.pic(c, (YB + TECHO) / 2, ZF + 0.004, L, TECHO - YB, 0, 1, canvasTex(Math.round(L * 40), Math.round((TECHO - YB) * 40), placas));
  k.box(c, YB - 0.25, ZF + 0.05, L, 0.25, 0.1, 0xdcc8b4);
  k.box(c, TECHO - 0.3, ZF + 0.06, L + 0.1, 0.3, 0.14, 0xdcc8b4);
  // las paredes lisas de los lados (por encima de la casa de la esquina y de la de al lado) y la de detrás
  for (const t of [E0 - 0.07, E1 + 0.07]) medianera(k, t, YB, TECHO, FONDO, Z, 0xe0d0c0);
  k.box(c, YB, -FONDO - 0.07, L, TECHO - YB, 0.12, 0xe0d0c0);
}

/** las plantas: las ventanas de la primera, los cuerpos de lamas de la segunda y la tercera, y la escalera */
function plantas(k) {
  const vidrio = (s, y, w, h, z) => k.pic(s, y + h / 2, z, w, h, 0, 1, canvasTex(Math.round(w * 50), Math.round(h * 50), cristales('#4a4e54', 2, 'rgba(230,214,196,.5)')));
  // la primera planta: ventanas anchas de marco gris oscuro
  for (const [s0, s1] of [[E0 + 0.2, 9.3], ...CUERPOS]) {
    const n = s1 - s0 > 3 ? 2 : 1, w = (s1 - s0 - 0.4 * (n + 1)) / n;
    for (let i = 0; i < n; i++) vidrio(s0 + 0.4 + w / 2 + i * (w + 0.4), YB + 0.6, w, 1.9, ZF + 0.012);
  }
  vidrio(22.9, YB + 0.6, 1.8, 1.9, ZF + 0.012);
  // la parte lisa de al lado de la casa de la esquina, con su ventana en la segunda y la tercera
  for (const y of [YP2 + 0.5, YP2 + 3.4]) vidrio(8.55, y, 1.1, 1.6, ZF + 0.012);
  vidrio(22.9, YP2 + 0.5, 1.8, 1.6, ZF + 0.012);
  vidrio(22.9, YP2 + 3.4, 1.8, 1.6, ZF + 0.012);
  // los cuerpos de lamas: la losa gruesa, la caja que sale y las lamas delante
  for (const [s0, s1] of CUERPOS) {
    const c = (s0 + s1) / 2, w = s1 - s0;
    k.box(c, YP2 - 0.35, ZF + 0.3, w + 0.3, 0.35, 0.6, 0xdcc8b4);
    k.box(c, YP2, ZF + 0.25, w, TECHO - 0.3 - YP2, 0.5, PIEDRA);
    k.pic(c, (YP2 + TECHO - 0.3) / 2, ZF + 0.505, w - 0.3, TECHO - 0.5 - YP2, 0, 1, canvasTex(Math.round(w * 40), 220, lamas));
    k.box(c, TECHO - 0.35, ZF + 0.3, w + 0.3, 0.3, 0.6, 0xdcc8b4);
  }
  // la franja de la escalera con sus rayas hondas
  const [a, b] = ESCALERA;
  for (let y = YB + 0.4; y < TECHO - 0.6; y += 0.62) k.box((a + b) / 2, y, ZF + 0.02, b - a - 0.2, 0.08, 0.04, 0x9a8a7c);
}

/** el bajo: la cafetería con su banda, el letrero de canto, el portal del 16, MAIVE y las tiendas */
function bajo(k) {
  // la cafetería: el bar dentro tras el cristal y la banda verde encima
  k.pic(9.9, 1.3, ZF + 0.012, 3.6, 2.5, 0, 1, canvasTex(360, 250, barDentro), { glow: 0.2 });
  k.box(9.85, 2.85, ZF + 0.05, 4.1, 0.42, 0.1, 0x2a6a46);
  k.pic(9.85, 3.06, ZF + 0.101, 4.1, 0.42, 0, 1, canvasTex(1100, 46, banda));
  k.box(11.6, 4.3, ZF + 0.18, 0.08, 2.0, 0.1, 0xc8a860);
  k.pic(11.6, 5.3, ZF + 0.18, 0.3, 2.0, 1, 0, canvasTex(40, 260, letreroCanto));
  k.pic(11.6, 5.3, ZF + 0.18, 0.3, 2.0, -1, 0, canvasTex(40, 260, letreroCanto));
  // el portal del 16: la puerta de cristal oscura y el letrero azul encima
  k.pic(12.5, 1.25, ZF + 0.012, 1.0, 2.5, 0, 1, canvasTex(60, 150, cristales('#3a3e44', 1, 'rgba(0,0,0,0)')));
  k.box(12.5, 2.75, ZF + 0.03, 1.2, 0.85, 0.05, 0x1e3a8a);
  k.pic(12.5, 3.17, ZF + 0.056, 1.2, 0.85, 0, 1, canvasTex(150, 106, letrero16));
  // MAIVE: las dos puertas de cristal con el marco verde agua, el tejadillo y el rótulo
  for (const s of [14.5, 16.8]) {
    k.pic(s, 1.3, ZF + 0.012, 1.9, 2.6, 0, 1, canvasTex(160, 220, escaparate('#d8e8e4')));
    for (const t of [s - 0.97, s + 0.97]) k.box(t, 0, ZF + 0.02, 0.08, 2.65, 0.06, 0x4a8a7a);
    k.box(s, 2.6, ZF + 0.02, 2.0, 0.08, 0.06, 0x4a8a7a);
  }
  k.box(14.5, 2.75, ZF + 0.3, 2.1, 0.06, 0.6, 0x4a8a7a);
  k.pic(16.8, 3.2, ZF + 0.02, 1.9, 0.6, 0, 1, canvasTex(190, 60, maive));
  // las tiendas de después
  k.pic(20.0, 1.3, ZF + 0.012, 2.6, 2.6, 0, 1, canvasTex(200, 200, escaparate('#e8e2c8')));
  k.box(20.0, 2.75, ZF + 0.02, 2.4, 0.4, 0.05, 0xf2f0ea);
  k.pic(22.9, 1.25, ZF + 0.012, 1.2, 2.5, 0, 1, canvasTex(72, 150, escaparate('#d8d4cc')));
}

/** la terraza cerrada delante de la cafetería, con el toldo gris encima y las mesas dentro */
function terraza(k) {
  const a = E0 + 0.05, b = 12.0, fuera = 2.3, zf = ZF + fuera, alto = 2.5;
  const c = (a + b) / 2, W = b - a;
  // el toldo gris, un poco caído hacia la calle
  const toldo = new THREE.BoxGeometry(W + 0.2, 0.04, fuera + 0.3);
  toldo.rotateX(0.12);
  toldo.translate(c, alto + 0.25, ZF + (fuera + 0.3) / 2);
  k.add(toldo, 0x9a9690);
  // los postes y los marcos blancos
  for (const s of [a, (a + b) / 2, b]) { k.box(s, 0, zf, 0.06, alto, 0.06, 0xf2f2ee); k.block(s, zf, 0.1, 0.1); }
  for (const s of [a, b]) k.box(s, 0, ZF + 0.3, 0.06, alto, 0.06, 0xf2f2ee);
  k.box(c, alto - 0.05, zf, W, 0.06, 0.06, 0xf2f2ee);
  // la franja azul oscuro de arriba y la verde de abajo, por delante y por los lados
  k.box(c, alto - 0.55, zf, W, 0.5, 0.03, 0x1e2a5a);
  k.box(c, 0, zf, W, 0.32, 0.03, 0x2a6a46);
  for (const s of [a, b]) {
    k.box(s, alto - 0.55, ZF + fuera / 2 + 0.15, 0.03, 0.5, fuera - 0.3, 0x1e2a5a);
    k.box(s, 0, ZF + fuera / 2 + 0.15, 0.03, 0.32, fuera - 0.3, 0x2a6a46);
  }
  // los plásticos transparentes con sus tiras blancas
  k.pic(c, 0.32 + (alto - 0.87) / 2, zf + 0.02, W, alto - 0.87, 0, 1, canvasTex(Math.round(W * 40), 64, plastico));
  for (const [s, n] of [[a, -1], [b, 1]]) k.pic(s + n * 0.02, 0.32 + (alto - 0.87) / 2, ZF + fuera / 2 + 0.15, fuera - 0.3, alto - 0.87, n, 0, canvasTex(Math.round(fuera * 40), 64, plastico));
  k.block(c, zf, W, 0.08);
  k.block(a, ZF + fuera / 2 + 0.15, 0.08, fuera - 0.3);
  k.block(b, ZF + fuera / 2 + 0.15, 0.08, fuera - 0.3);
  // las mesas de madera con las sillas oscuras
  for (const s of [9.0, 10.9]) {
    k.table(s, ZF + 1.2, { w: 0.75, d: 0.75, h: 0.75, top: 0x8a5a3a, leg: 0x2a2a2c });
    k.chair(s, ZF + 0.6, 0, 0x2e3a4a, { legs: 0x2a2a2c });
    k.chair(s, ZF + 1.8, Math.PI, 0x2e3a4a, { legs: 0x2a2a2c });
  }
}

/** se monta con lo demás de Arrecife Centro */
export function buildEdificioAurora(scene, colliders, map) {
  if (!map?.edificioAurora) return null;
  const k = new Kit();
  paredes(k);
  plantas(k);
  bajo(k);
  terraza(k);
  const group = enMarco(k, M, 'edificioAurora', colliders);
  scene.add(group);
  return { group };
}
