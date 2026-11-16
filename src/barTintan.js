import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alzarEdificio, paredAlta, ventana, medianera } from './edificioReal.js';

/**
 * El Bar Cafetería Tin-Tan, en la calle Doctor Juan Negrín 72, en la esquina con Castillo de las Coloradas, con la
 * vista de la calle de Google de julio de 2025 y la foto de septiembre de 2017 (solo se miran, no van dentro del
 * juego; la gente no se pone): la casa blanca con el zócalo gris azulado; en la cara de Juan Negrín, la puerta verde
 * de cristal con su marco verde, el escaparate de al lado, los cartelitos pegados, el letrero rojo con «BAR
 * CAFETERIA TIN-TAN» en blanco (sin la marca de refresco que lleva en un lado) y la barandilla negra de la rampa de
 * delante; en la cara de Castillo de las Coloradas, otro letrero rojo de «BAR TIN-TAN» y el cajetín de la luz.
 * Encima, el edificio de verdad (vista de la calle de julio de 2025 mirando hacia arriba; el bloque del mapa era de una
 * planta, 4 m): blanco, el bajo y dos plantas (9,4 m), desde la tienda de compraventa de oro de al lado hasta la
 * esquina y un trozo de Castillo de las Coloradas, con los balcones corridos de losa blanca y barandilla verde de
 * cuarterones en las dos plantas, las puertas y ventanas de marco verde detrás, la aleta blanca entre los dos cuerpos
 * y la cornisa de la azotea. En el bajo de al lado, la fachada negra de la tienda con su puerta y su escaparate y la
 * puerta verde de la gestoría, sin sus letreros (llevan logotipo).
 */

// la cara de Juan Negrín (s desde el oeste hasta la esquina, en s 37,5) y la de Castillo de las Coloradas (s desde
// la esquina hacia el norte); Google pone el bar en la esquina (el mapa no tenía rótulo suyo)
const NEGRIN = marco([-612.99, -312.52], [-584.27, -288.48]);
const COLORADAS = marco([-584.27, -288.48], [-567.49, -310.04]);
const Z = 0.12, ZF = Z + 0.3, YP = 3.6, BLANCO = 0xf4f4f0, VERDE = 0x2a7a4a;
// el edificio de verdad: por Juan Negrín de s 21 a la esquina, con 9 m de fondo (que por Coloradas llegan a s 9), el
// bajo y dos plantas con la azotea a 9,4 m; y el bloque del mapa, de 4 m
const E0 = 21.0, ESQ = 37.45, FONDO = 9, TECHO = 9.4, YB = 4.0, PLANTAS = [3.9, 6.8];

/** antes de levantar la ciudad: la marca de que se monta (el mapa no tenía rótulo suyo) y el edificio a su altura */
export function tuneBarTintan(map) {
  map.barTintan = true;
  alzarEdificio(map, NEGRIN, E0, ESQ, FONDO, TECHO, [244, 244, 240]);
}

// ——— lo que se pinta en lienzo ———

/** el letrero rojo con las letras blancas */
function letrero(lineas) {
  return (g, w, h) => {
    g.fillStyle = '#f2f2ee';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#d82a2a';
    g.fillRect(3, 3, w - 6, h - 6);
    g.fillStyle = '#f4f4f0';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    lineas.forEach(([t, y, tam]) => {
      g.font = `900 ${Math.round(h * tam)}px "Arial Black", Arial, sans-serif`;
      const m = g.measureText(t).width, k = Math.min(1, (w * 0.9) / m);
      g.save(); g.translate(w / 2, h * y); g.scale(k, 1); g.fillText(t, 0, 0); g.restore();
    });
  };
}

/** la puerta verde de cristal con el bar dentro */
function puerta(g, w, h) {
  g.fillStyle = '#3a3634';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8d0c0';
  g.fillRect(w * 0.12, h * 0.08, w * 0.76, h * 0.5);
  g.fillStyle = '#6a5040';
  g.fillRect(w * 0.12, h * 0.4, w * 0.76, h * 0.12);
  g.fillStyle = 'rgba(255,255,255,.12)';
  g.fillRect(0, 0, w * 0.35, h);
  g.strokeStyle = '#2a7a4a';
  g.lineWidth = 8;
  g.strokeRect(4, 4, w - 8, h - 8);
  g.beginPath(); g.moveTo(0, h * 0.62); g.lineTo(w, h * 0.62); g.stroke();
}

/** el escaparate con los cartelitos pegados */
function escaparate(g, w, h) {
  g.fillStyle = '#3a3e42';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.14)';
  g.fillRect(0, 0, w * 0.35, h);
  const carteles = [[0.1, 0.15, '#f2f2ee'], [0.55, 0.12, '#f2d24a'], [0.15, 0.55, '#f2f2ee'], [0.6, 0.5, '#e87a9a']];
  for (const [x, y, c] of carteles) { g.fillStyle = c; g.fillRect(w * x, h * y, w * 0.3, h * 0.25); }
  g.strokeStyle = '#f2f2ee';
  g.lineWidth = 5;
  g.strokeRect(2, 2, w - 4, h - 4);
}

/** el zócalo gris azulado */
function zocalo(g, w, h) {
  g.fillStyle = '#8a94a0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.08)';
  for (let x = 0; x < w; x += 30) g.fillRect(x, 0, 1, h);
}

// ——— las piezas ———

/** la cara de Juan Negrín: la pared, el zócalo, la puerta, el escaparate, el letrero y la barandilla */
function caraNegrin(k) {
  const s0 = 31.0, s1 = 37.45;
  k.box((s0 + s1) / 2, 0, Z + 0.15, s1 - s0, YP, 0.3, BLANCO);
  k.block((s0 + s1) / 2, Z + 0.15, s1 - s0, 0.3);
  k.pic((s0 + s1) / 2, 0.5, ZF + 0.004, s1 - s0, 1.0, 0, 1, canvasTex(260, 40, zocalo));
  // la puerta verde y el escaparate de al lado
  k.pic(36.0, 1.15, ZF + 0.01, 1.1, 2.3, 0, 1, canvasTex(110, 230, puerta), { glow: 0.2 });
  k.pic(34.2, 1.4, ZF + 0.01, 1.6, 1.6, 0, 1, canvasTex(160, 160, escaparate));
  k.box(36.0, 0, ZF + 0.25, 1.4, 0.15, 0.5, 0xc8c4bc);
  // el letrero rojo de «BAR CAFETERIA TIN-TAN»
  k.box(35.6, 2.55, ZF + 0.03, 2.2, 0.75, 0.08, 0xd82a2a);
  k.pic(35.6, 2.925, ZF + 0.075, 2.18, 0.73, 0, 1, canvasTex(300, 100, letrero([['BAR', 0.2, 0.2], ['CAFETERIA', 0.47, 0.22], ['TIN-TAN', 0.78, 0.3]])));
  // la barandilla negra de la rampa, delante de la puerta
  const zb = ZF + 1.3;
  for (let s = 32.0; s <= 35.21; s += 0.8) k.box(s, 0, zb, 0.05, 1.0, 0.05, 0x1e1e20);
  for (const y of [0.45, 0.97]) k.box(33.6, y, zb, 3.2, 0.05, 0.05, 0x1e1e20);
  for (let s = 32.2; s < 35.2; s += 0.15) k.box(s, 0.1, zb, 0.02, 0.85, 0.02, 0x1e1e20);
  k.box(32.0, 0.97, ZF + 0.7, 0.05, 0.05, 1.2, 0x1e1e20);
  k.block(33.6, zb, 3.2, 0.1);
}

/** la cara de Castillo de las Coloradas: el zócalo, el otro letrero rojo y el cajetín */
function caraColoradas(k) {
  const s0 = 0, s1 = 4.0;
  k.box((s0 + s1) / 2, 0, Z + 0.15, s1 - s0, YP, 0.3, BLANCO);
  k.block((s0 + s1) / 2, Z + 0.15, s1 - s0, 0.3);
  k.pic((s0 + s1) / 2, 0.5, ZF + 0.004, s1 - s0, 1.0, 0, 1, canvasTex(160, 40, zocalo));
  k.box(1.2, 2.4, ZF + 0.03, 1.8, 0.6, 0.08, 0xd82a2a);
  k.pic(1.2, 2.7, ZF + 0.075, 1.78, 0.58, 0, 1, canvasTex(240, 80, letrero([['BAR TIN-TAN', 0.52, 0.42]])));
  k.box(2.6, 1.4, ZF + 0.04, 0.5, 0.6, 0.12, 0xe8e6e0);
  k.box(3.3, 2.1, ZF + 0.02, 0.45, 0.28, 0.03, 0x1e3a8a);
}

/** la barandilla verde de cuarterones del balcón corrido, de s0 a s1, a la altura y, en z */
function barandillaVerde(k, s0, s1, y, z) {
  const c = (s0 + s1) / 2, w = s1 - s0;
  for (const [yy, h] of [[y + 0.9, 0.08], [y + 0.5, 0.05], [y + 0.1, 0.05]]) k.box(c, yy, z, w, h, 0.07, VERDE);
  for (let t = s0; t <= s1 + 0.01; t += w / Math.max(1, Math.round(w / 0.55))) k.box(t, y, z, 0.06, 0.98, 0.07, VERDE);
  // el fondo blanco de los cuarterones de abajo
  k.box(c, y + 0.15, z - 0.03, w, 0.35, 0.02, 0xf0f0ec);
}

/** un balcón corrido: la losa blanca que sale de la pared y su barandilla verde */
function balcon(k, s0, s1, y, sale = 0.85) {
  const c = (s0 + s1) / 2;
  k.box(c, y - 0.2, ZF + sale / 2, s1 - s0, 0.2, sale, 0xeeeeea);
  k.box(c, y - 0.24, ZF + sale - 0.02, s1 - s0, 0.04, 0.06, 0xd8d8d4);
  barandillaVerde(k, s0 + 0.05, s1 - 0.05, y, ZF + sale - 0.05);
  // los costados, también de barandilla: los tres largueros y el barrote de en medio
  for (const t of [s0 + 0.04, s1 - 0.04]) {
    for (const [yy, h] of [[y + 0.9, 0.08], [y + 0.5, 0.05], [y + 0.1, 0.05]]) k.box(t, yy, ZF + sale / 2, 0.06, h, sale - 0.1, VERDE);
    k.box(t, y, ZF + sale / 2, 0.06, 0.98, 0.06, VERDE);
  }
}

/** las plantas de arriba por Juan Negrín: los dos cuerpos con sus balcones y sus huecos de marco verde */
function plantasNegrin(k) {
  const c = (E0 + ESQ) / 2;
  paredAlta(k, E0, ESQ, YP, TECHO, Z, BLANCO);
  for (const y of PLANTAS) {
    balcon(k, E0 + 0.6, 30.9, y);
    balcon(k, 31.3, ESQ - 0.3, y);
    for (const [s, w, h] of [[23.6, 2.0, 2.15], [27.6, 1.2, 2.15], [29.6, 1.2, 1.4], [33.0, 1.3, 2.15], [35.6, 1.3, 1.4]]) {
      ventana(k, s, y + (h < 2 ? 0.7 : 0.05), w, h, Z, { carpinteria: '#2a7a4a', hojas: w > 1.5 ? 3 : 2, alfeizar: 0xeeeeea });
      for (const t of [s - w / 2 - 0.06, s + w / 2 + 0.06]) k.box(t, y + (h < 2 ? 0.7 : 0.05), ZF + 0.03, 0.1, h, 0.06, VERDE);
    }
  }
  // la aleta blanca entre los dos cuerpos y la cornisa de la azotea
  k.box(31.1, YP, ZF + 0.45, 0.25, TECHO - YP, 0.9, 0xeeeeea);
  k.box(c, TECHO - 0.3, ZF + 0.1, ESQ - E0, 0.3, 0.2, 0xeeeeea);
  // los cables negros corridos por encima del bajo
  for (const y of [3.45, 3.52]) k.box(c, y, ZF + 0.05, ESQ - E0, 0.03, 0.03, 0x1e1e20);
  // las paredes lisas que asoman por encima de los vecinos (por fuera de las caras del bloque levantado, que el juego
  // pinta con ventanas): el costado del oeste y la de atrás
  medianera(k, E0 - 0.07, YB, TECHO, FONDO, Z, 0xeeeeea);
  k.box(c, YB, -FONDO - 0.07, ESQ - E0, TECHO - YB, 0.12, 0xeeeeea);
}

/** el bajo de al lado del bar: la tienda de fachada negra y la puerta verde de la gestoría (sin sus letreros) */
function bajoVecinos(k) {
  const a = E0, b = 31.0, c = (a + b) / 2;
  k.box(c, 0, Z + 0.15, b - a, YP, 0.3, BLANCO);
  k.block(c, Z + 0.15, b - a, 0.3);
  k.pic(c, 0.5, ZF + 0.004, b - a, 1.0, 0, 1, canvasTex(400, 40, zocalo));
  // la tienda: el panel negro, la puerta de cristal y el escaparate
  k.box(25.0, 0, ZF + 0.02, 4.6, 3.1, 0.05, 0x1e1e20);
  k.box(25.0, 2.7, ZF + 0.05, 4.6, 0.04, 0.04, 0xc8a050);
  k.pic(23.9, 1.15, ZF + 0.05, 1.2, 2.3, 0, 1, canvasTex(110, 230, puerta), { glow: 0.15 });
  k.pic(26.3, 1.45, ZF + 0.05, 1.6, 1.5, 0, 1, canvasTex(160, 150, escaparate), { glow: 0.1 });
  // la gestoría: la puerta verde de cristal, el pilar de piedra marrón y el aire acondicionado de encima
  k.pic(29.0, 1.15, ZF + 0.02, 1.1, 2.3, 0, 1, canvasTex(110, 230, puerta), { glow: 0.1 });
  k.box(30.4, 0, ZF + 0.03, 0.5, 2.4, 0.06, 0x6a4a3a);
  k.box(28.6, 2.95, ZF + 0.18, 0.8, 0.55, 0.3, 0xe8e8e4);
}

/** las plantas de arriba por Castillo de las Coloradas, hasta donde llega el fondo del edificio */
function plantasColoradas(k) {
  const a = 4.0, b = FONDO;
  k.box((a + b) / 2, 0, Z + 0.15, b - a, YP, 0.3, BLANCO);
  k.block((a + b) / 2, Z + 0.15, b - a, 0.3);
  k.pic((a + b) / 2, 0.5, ZF + 0.004, b - a, 1.0, 0, 1, canvasTex(200, 40, zocalo));
  // la ventana de marco verde del bajo
  ventana(k, 6.3, 1.0, 1.5, 1.4, Z, { carpinteria: '#2a7a4a', alfeizar: 0xeeeeea });
  paredAlta(k, 0, b, YP, TECHO, Z, BLANCO);
  for (const y of PLANTAS) {
    balcon(k, 0.3, 5.6, y);
    for (const [s, w, h] of [[1.6, 1.3, 2.15], [4.2, 1.2, 1.4], [7.4, 1.0, 1.2]]) {
      ventana(k, s, y + (h < 2 ? 0.7 : 0.05), w, h, Z, { carpinteria: '#2a7a4a', alfeizar: 0xeeeeea });
      for (const t of [s - w / 2 - 0.06, s + w / 2 + 0.06]) k.box(t, y + (h < 2 ? 0.7 : 0.05), ZF + 0.03, 0.1, h, 0.06, VERDE);
    }
  }
  k.box(b / 2, TECHO - 0.3, ZF + 0.1, b, 0.3, 0.2, 0xeeeeea);
}

/** se monta con lo demás de Arrecife Centro: las dos caras de la esquina */
export function buildBarTintan(scene, colliders, map) {
  if (!map?.barTintan) return null;
  const partes = [];
  const negrin = (k) => { caraNegrin(k); bajoVecinos(k); plantasNegrin(k); };
  const coloradas = (k) => { caraColoradas(k); plantasColoradas(k); };
  for (const [M, nom, hacer] of [[NEGRIN, 'barTintanNegrin', negrin], [COLORADAS, 'barTintanColoradas', coloradas]]) {
    const k = new Kit();
    hacer(k);
    const group = enMarco(k, M, nom, colliders);
    scene.add(group);
    partes.push(group);
  }
  return { partes };
}
