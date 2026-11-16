import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alturaBloque, paredAlta, ventana as ventanaAlta } from './edificioReal.js';

/**
 * El Bar Cafetería El Telamon, en la calle La Rosa 19 (Valterra), con la vista de la calle de Google de julio de 2025 y
 * la foto de la entrada de junio de 2021 (solo se miran, no van dentro del juego; la gente no se pone): la casa blanca
 * con el zócalo de plaqueta color ladrillo y el balcón corrido de barandilla verde encima; el hueco ancho del bar con
 * el marco y el dintel de chapa marrón y la hoja plegada a un lado (con su cartel pegado), y dentro la barra azul, las
 * botellas, las mesas y las sillas blancas; los dos barriles negros con la tapa de madera que hacen de mesa en la
 * puerta y el taburete; el letrero de bandera blanco con «BAR CAFETERÍA» en rojo y el barco Telamón varado pintado
 * con su nombre; los cajetines de la luz y los cables; el buzón negro, el número 19 y la puerta verde del portal; y
 * al otro lado, el zócalo gris, la puerta de aluminio y el armario blanco del contador. Las pegatinas de las marcas de
 * la alarma y de la luz no se ponen. Encima, el edificio de verdad (vista de la calle mirando hacia arriba): blanco,
 * el bajo y tres plantas (12,3 m; el bloque del mapa era de 6 m), con los dos balcones corridos de barandilla verde de
 * la primera y la segunda planta, sus puertas de marco verde, las ventanas de marco verde de la derecha, las de
 * madera oscura de la izquierda y la tercera planta con sus ventanas; la manzana entera sube a esa altura.
 */

// la cara de la calle La Rosa (s de sur a norte desde la esquina del sur del bloque); la vista de la calle pone el
// hueco del bar en s 5,1–9,6 (Google pone el bar en s 9,4; el mapa no tenía rótulo suyo)
const M = marco([294.63, -244.4], [316.05, -274.31]);
const Z = 0.12, ZF = Z + 0.3, YP = 6.0, S0 = 0, S1 = 16.0, BLANCO = 0xf2f2ee, MARRON = 0x5a3a2a;
// el edificio de verdad: el bajo (3,45 m) y tres plantas de 2,9 m, con la azotea a 12,3 m
const ALTO = 12.3, VERDE = 0x1e5a3a;

/** antes de levantar la ciudad: la marca de que se monta (el mapa no tenía rótulo suyo) y la manzana a su altura */
export function tuneElTelamon(map) {
  map.elTelamon = true;
  // la manzana a su altura de verdad (casas de tres y cuatro plantas) y encalada
  alturaBloque(map, ...M.W(8, -4), ALTO, [242, 241, 236]);
}

// ——— lo que se pinta en lienzo ———

/** la plaqueta color ladrillo del zócalo */
function plaqueta(g, w, h) {
  g.fillStyle = '#c87a5a';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(240,220,200,.55)';
  g.lineWidth = 1;
  const fila = h / 14;
  for (let i = 0; i <= 14; i++) {
    const y = i * fila;
    g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke();
    for (let x = i % 2 ? 9 : 0; x < w; x += 18) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + fila); g.stroke(); }
  }
}

/** el zócalo gris de bloques */
function bloques(g, w, h) {
  g.fillStyle = '#9a9a96';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(60,60,60,.35)';
  g.lineWidth = 1;
  for (let y = 0; y < h; y += h / 3) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  for (let x = 0; x < w; x += 30) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
}

/** el bar por dentro: la barra azul, las botellas, las mesas y las sillas blancas */
function bar(g, w, h) {
  g.fillStyle = '#ecebe6';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8d4cc';
  g.fillRect(0, h * 0.82, w, h * 0.18);
  g.strokeStyle = 'rgba(0,0,0,.08)';
  for (let x = 0; x < w; x += 20) { g.beginPath(); g.moveTo(x, h * 0.82); g.lineTo(x - 20, h); g.stroke(); }
  // las baldas de las botellas
  g.fillStyle = '#7a6a5a';
  for (const y of [0.18, 0.3]) g.fillRect(w * 0.08, h * y, w * 0.5, 3);
  for (let x = w * 0.1; x < w * 0.56; x += 7) { g.fillStyle = ['#5a3a20', '#2a5a2a', '#c8a050', '#8a2a2a', '#e8e0d0'][Math.round(x) % 5]; g.fillRect(x, h * 0.12, 4, h * 0.06); g.fillRect(x + 2, h * 0.24, 4, h * 0.06); }
  // la barra azul curvada
  g.fillStyle = '#1e6ab8';
  g.beginPath(); g.moveTo(0, h * 0.5); g.quadraticCurveTo(w * 0.35, h * 0.44, w * 0.6, h * 0.52); g.lineTo(w * 0.6, h * 0.72); g.lineTo(0, h * 0.74); g.closePath(); g.fill();
  g.fillStyle = '#e8e6e0';
  g.fillRect(0, h * 0.48, w * 0.6, h * 0.025);
  // la nevera de los refrescos al fondo y la puerta de atrás con luz
  g.fillStyle = '#2a4a8a';
  g.fillRect(w * 0.66, h * 0.2, w * 0.07, h * 0.45);
  g.fillStyle = '#fafaf6';
  g.fillRect(w * 0.82, h * 0.15, w * 0.12, h * 0.55);
  // las mesas y las sillas blancas
  for (const [x, y] of [[0.22, 0.66], [0.6, 0.7], [0.85, 0.74]]) {
    g.fillStyle = '#d8d8d4';
    g.fillRect(w * (x - 0.08), h * y, w * 0.16, h * 0.025);
    g.fillStyle = '#4a4a4c';
    g.fillRect(w * x - 1, h * (y + 0.025), 3, h * 0.1);
    g.fillStyle = '#f6f6f2';
    for (const dx of [-0.11, 0.11]) g.fillRect(w * (x + dx) - 6, h * (y - 0.02), 12, h * 0.12);
  }
  g.fillStyle = 'rgba(0,0,0,.12)';
  g.fillRect(0, 0, w, h);
}

/** la chapa marrón del dintel y de la hoja, en cuarterones */
function chapa(g, w, h) {
  g.fillStyle = '#5a3a2a';
  g.fillRect(0, 0, w, h);
  const n = Math.max(1, Math.round(w / h / 1.4));
  for (let i = 0; i < n; i++) {
    const x0 = (w / n) * i, x1 = x0 + w / n;
    g.fillStyle = 'rgba(120,80,60,.45)';
    g.beginPath(); g.moveTo(x0 + 3, 3); g.lineTo(x1 - 3, 3); g.lineTo((x0 + x1) / 2, h / 2); g.closePath(); g.fill();
    g.fillStyle = 'rgba(30,18,12,.35)';
    g.beginPath(); g.moveTo(x0 + 3, h - 3); g.lineTo(x1 - 3, h - 3); g.lineTo((x0 + x1) / 2, h / 2); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(20,12,8,.6)';
    g.lineWidth = 2;
    g.strokeRect(x0 + 2, 2, w / n - 4, h - 4);
  }
}

/** la hoja plegada, con el rectángulo blanco y el cartel amarillo pegado */
function hoja(g, w, h) {
  chapa(g, w, h);
  g.strokeStyle = '#f2f2ee';
  g.lineWidth = 4;
  g.strokeRect(w * 0.3, h * 0.12, w * 0.4, h * 0.08);
  g.fillStyle = '#f2c84a';
  g.fillRect(w * 0.35, h * 0.4, w * 0.35, h * 0.2);
  g.fillStyle = '#c84a2a';
  for (let y = 0.43; y < 0.58; y += 0.04) g.fillRect(w * 0.38, h * y, w * 0.28, 3);
}

/** el letrero de bandera: «BAR CAFETERÍA» en rojo y el barco Telamón varado */
function letrero(g, w, h) {
  g.fillStyle = '#f6f4ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c8282a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.13)}px Georgia, "Times New Roman", serif`;
  g.fillText('BAR', w / 2, h * 0.12);
  g.fillText('CAFETERÍA', w / 2, h * 0.27, w * 0.92);
  // el mar y el barco escorado, oxidado
  g.fillStyle = '#5a8ab0';
  g.fillRect(w * 0.04, h * 0.66, w * 0.92, h * 0.28);
  g.fillStyle = '#c8d8e4';
  g.fillRect(w * 0.04, h * 0.4, w * 0.92, h * 0.26);
  g.save(); g.translate(w * 0.5, h * 0.62); g.rotate(-0.12);
  g.fillStyle = '#3a3a3c';
  g.beginPath(); g.moveTo(-w * 0.44, -h * 0.08); g.lineTo(w * 0.42, -h * 0.12); g.lineTo(w * 0.36, h * 0.08); g.lineTo(-w * 0.38, h * 0.08); g.closePath(); g.fill();
  g.fillStyle = '#8a4a2a';
  g.fillRect(-w * 0.38, h * 0.01, w * 0.76, h * 0.06);
  g.fillStyle = '#6a6a6a';
  g.fillRect(-w * 0.1, -h * 0.2, w * 0.18, h * 0.1);
  g.fillStyle = '#f6f4ee';
  g.font = `700 ${Math.round(h * 0.07)}px Georgia, serif`;
  g.fillText('EL TELAMON', 0, -h * 0.02, w * 0.6);
  g.restore();
  g.strokeStyle = '#8a8a86';
  g.lineWidth = 3;
  g.strokeRect(2, 2, w - 4, h - 4);
}

/** la puerta verde del portal */
function puertaVerde(g, w, h) {
  g.fillStyle = '#1e4a32';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(0,0,0,.4)';
  g.lineWidth = 3;
  g.beginPath(); g.arc(w / 2, h * 0.2, w * 0.32, Math.PI, 0); g.stroke();
  g.strokeRect(w * 0.18, h * 0.2, w * 0.64, h * 0.32);
  g.strokeRect(w * 0.18, h * 0.6, w * 0.64, h * 0.32);
  g.fillStyle = '#c8b070';
  g.fillRect(w * 0.82, h * 0.5, 4, 8);
}

// ——— las piezas ———

/** la casa: la pared, los zócalos, el balcón corrido, el bar, el letrero, el portal y lo del contador */
function fachada(k) {
  const c = (S0 + S1) / 2, L = S1 - S0;
  k.box(c, 0, Z + 0.15, L, YP, 0.3, BLANCO);
  k.block(c, Z + 0.15, L, 0.3);
  // el zócalo gris del principio y la plaqueta color ladrillo del resto
  k.pic(2.15, 0.6, ZF + 0.004, 4.3, 1.2, 0, 1, canvasTex(260, 72, bloques));
  k.pic((4.3 + S1) / 2, 0.7, ZF + 0.004, S1 - 4.3, 1.4, 0, 1, canvasTex(700, 84, plaqueta));
  // la puerta de aluminio y el armario blanco del contador
  k.box(1.2, 0, ZF + 0.02, 0.95, 2.2, 0.05, 0xd8dce0);
  k.box(1.2, 0.1, ZF + 0.05, 0.75, 2.0, 0.02, 0x8a98a4);
  k.box(3.0, 0.45, ZF + 0.05, 0.55, 1.45, 0.14, 0xf4f4f0);
  // el balcón corrido de la primera planta, con la barandilla verde
  const b0 = 4.3, b1 = 13.2, bc = (b0 + b1) / 2;
  k.box(bc, 3.45, ZF + 0.5, b1 - b0, 0.3, 1.0, 0xf4f4f0);
  k.box(bc, 4.65, ZF + 0.98, b1 - b0, 0.05, 0.05, 0x1e5a3a);
  for (let s = b0 + 0.05; s <= b1; s += 0.13) k.box(s, 3.75, ZF + 0.98, 0.025, 0.9, 0.025, 0x1e5a3a);
  for (const s of [b0, b1]) {
    k.box(s, 4.65, ZF + 0.5, 0.05, 0.05, 1.0, 0x1e5a3a);
    for (let z = ZF + 0.08; z < ZF + 0.98; z += 0.13) k.box(s, 3.75, z, 0.025, 0.9, 0.025, 0x1e5a3a);
  }
  // el hueco del bar: el bar por dentro, el marco y el dintel de chapa y la hoja plegada
  k.pic(7.35, 1.15, ZF + 0.01, 4.4, 2.3, 0, 1, canvasTex(440, 230, bar), { glow: 0.25 });
  k.box(7.35, 2.3, ZF + 0.03, 4.6, 0.6, 0.08, MARRON);
  k.pic(7.35, 2.6, ZF + 0.075, 4.58, 0.58, 0, 1, canvasTex(460, 58, chapa));
  for (const s of [5.1, 9.6]) k.box(s, 0, ZF + 0.03, 0.12, 2.9, 0.1, MARRON);
  k.box(5.75, 0, ZF + 0.12, 1.25, 2.3, 0.05, MARRON);
  k.pic(5.75, 1.15, ZF + 0.15, 1.23, 2.28, 0, 1, canvasTex(120, 230, hoja));
  // los dos barriles negros con la tapa de madera y el taburete
  for (const s of [6.9, 9.0]) {
    k.cyl(s, 0, ZF + 0.45, 0.3, 0.3, 0.95, 0x1e1e20, { seg: 16 });
    k.cyl(s, 0.95, ZF + 0.45, 0.38, 0.38, 0.05, 0x7a4a2a, { seg: 18 });
    k.block(s, ZF + 0.45, 0.6, 0.6);
  }
  k.cyl(9.35, 0, ZF + 0.95, 0.03, 0.03, 0.7, 0x8a8a88, { seg: 6 });
  k.cyl(9.35, 0.7, ZF + 0.95, 0.18, 0.18, 0.05, 0x2a2a2c, { seg: 12 });
  // el letrero de bandera, al sur del hueco
  k.box(4.5, 2.3, ZF + 0.45, 0.1, 1.0, 0.75, 0xf6f4ee);
  k.pic(4.555, 2.8, ZF + 0.45, 0.73, 0.98, 1, 0, canvasTex(120, 160, letrero));
  k.pic(4.445, 2.8, ZF + 0.45, 0.73, 0.98, -1, 0, canvasTex(120, 160, letrero));
  // los cajetines de la luz y los cables
  for (const [s, y, w] of [[11.5, 2.85, 0.4], [12.1, 2.9, 0.25], [15.3, 2.95, 0.45]]) k.box(s, y, ZF + 0.06, w, 0.4, 0.12, 0xece8e0);
  for (const y of [3.3, 3.38]) k.box(c, y, ZF + 0.04, L, 0.03, 0.03, 0x2a2a2c);
  // el buzón negro, el número 19 y la puerta verde del portal
  k.box(13.35, 1.75, ZF + 0.08, 0.45, 0.45, 0.16, 0x1e1e20);
  k.box(14.25, 2.55, ZF + 0.02, 0.28, 0.2, 0.02, 0x2a5aa8);
  k.box(14.25, 0, ZF + 0.02, 1.25, 2.35, 0.04, BLANCO);
  k.pic(14.25, 1.12, ZF + 0.05, 1.05, 2.25, 0, 1, canvasTex(100, 220, puertaVerde));
}

/** las plantas de arriba: la pared blanca, el segundo balcón corrido, las puertas y ventanas verdes y la tercera planta */
function plantas(k) {
  paredAlta(k, S0, S1, YP, ALTO, Z, BLANCO);
  // detrás de los dos balcones corridos, la puerta y la ventana de marco verde de cada planta
  for (const y of [3.75, 6.65]) {
    ventanaAlta(k, 6.6, y + 0.1, 0.9, 2.1, Z, { carpinteria: '#1e5a3a', hojas: 2 });
    ventanaAlta(k, 10.2, y + 0.6, 1.4, 1.4, Z, { carpinteria: '#1e5a3a', hojas: 3 });
  }
  // el segundo balcón corrido, igual que el de la primera planta
  const b0 = 4.3, b1 = 13.2, bc = (b0 + b1) / 2;
  k.box(bc, 6.35, ZF + 0.5, b1 - b0, 0.3, 1.0, 0xf4f4f0);
  k.box(bc, 7.55, ZF + 0.98, b1 - b0, 0.05, 0.05, VERDE);
  for (let s = b0 + 0.05; s <= b1; s += 0.13) k.box(s, 6.65, ZF + 0.98, 0.025, 0.9, 0.025, VERDE);
  for (const s of [b0, b1]) {
    k.box(s, 7.55, ZF + 0.5, 0.05, 0.05, 1.0, VERDE);
    for (let z = ZF + 0.08; z < ZF + 0.98; z += 0.13) k.box(s, 6.65, z, 0.025, 0.9, 0.025, VERDE);
  }
  // las ventanas de marco verde de la derecha y las de madera oscura de la izquierda, en cada planta
  for (const y of [4.3, 7.2, 10.1]) {
    ventanaAlta(k, 14.6, y + 0.3, 0.8, 1.6, Z, { carpinteria: '#1e5a3a', hojas: 1 });
    ventanaAlta(k, 2.2, y + 0.5, 1.1, 1.2, Z, { carpinteria: '#3a2a1e' });
  }
  // la tercera planta: dos ventanas de marco verde encima de los balcones
  for (const s of [6.6, 10.2]) ventanaAlta(k, s, 10.6, 1.2, 1.3, Z, { carpinteria: '#1e5a3a' });
  // los cables que cruzan la fachada a la altura de la primera planta y el pretil de la azotea
  for (const y of [3.42, 3.5]) k.box((S0 + S1) / 2, y, ZF + 0.04, S1 - S0, 0.03, 0.03, 0x2a2a2c);
  k.box((S0 + S1) / 2, ALTO, Z + 0.15, S1 - S0, 0.5, 0.3, 0xece8e0);
}

/** se monta con lo demás de Valterra */
export function buildElTelamon(scene, colliders, map) {
  if (!map?.elTelamon) return null;
  const k = new Kit();
  fachada(k);
  plantas(k);
  const group = enMarco(k, M, 'elTelamon', colliders);
  scene.add(group);
  return { group };
}
