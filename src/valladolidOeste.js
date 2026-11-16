import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco } from './restaurantesCharco.js';
import { cristales, alzarEdificio, alturaBloque } from './edificioReal.js';
import { Z, ZF, BLANCO, MARRON_OSC, desconchada, pared, pretil, puerta, ventana, tira } from './rapadurasSur.js';

/**
 * La fila de casas del lado oeste de la calle Valladolid (Altavista), la que da por detrás al campo de tierra, con las
 * vistas de la calle de Google de julio de 2025 (Valladolid 13, 16, 19 y 23; solo se miran, no van dentro del juego). El
 * juego tenía ahí un bloque genérico de 9 m con ventanas por todos lados. De verdad, de sur a norte:
 * - el edificio de pisos color melocotón, con los miradores de cristal, las persianas blancas y las rejas blancas;
 * - la casa blanca de dos plantas con el balcón de barandilla blanca, los dos farolillos y, abajo, la oficina con el
 *   rótulo «LOGOS» (el nombre en letras azules, sin el dibujo de la marca);
 * - la casa crema con la ventana de contraventanas marrones;
 * - las casas terreras: la beis con la puerta de madera, la del zócalo de azulejo rojo con la puerta de cristal, y la
 *   de la ventana del marco verde;
 * - y la trasera blanca y lisa que da al campo, con el costado desconchado del final.
 */

// la línea de las fachadas, de la punta del sur a la del norte (N hacia la calle, al este), y el fondo del bloque
const V = marco([420.0, -821.0], [448.0, -875.0]);
const FONDO = 14.76;
const PISOS = 11, DOS = 6.5, BAJA = 3.6;
const MELOCOTON = 0xe9cdb0, CREMA = 0xefe0c4;

/** antes de levantar la ciudad: el bloque genérico baja a una planta y encima van los pisos y la casa de dos plantas */
export function tuneValladolidOeste(map) {
  if (!Array.isArray(map?.buildings)) return;
  alturaBloque(map, 427.5, -851.5, BAJA, [236, 236, 232]);
  const azotea = [206, 202, 194];
  alzarEdificio(map, V, 0, 24, FONDO, PISOS, [233, 205, 176], azotea);
  alzarEdificio(map, V, 24, 39, FONDO, DOS, [236, 236, 232], azotea);
  map.valladolidOeste = true;
}

/** la persiana blanca de lamas */
function persianaBlanca(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#cfcfca';
  g.lineWidth = 2;
  for (let y = 4; y < h; y += 7) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** las contraventanas marrones de lamas, de dos hojas */
function contraventana(g, w, h) {
  g.fillStyle = '#6a4430';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#4e3122';
  g.lineWidth = 2;
  for (let y = 5; y < h; y += 7) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.lineWidth = 4;
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
}

/** el rótulo de la oficina: blanco con «LOGOS» en azul */
function rotuloLogos(g, w, h) {
  g.fillStyle = '#f6f6f4';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#1e4fa0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(h * 0.5)}px "Arial Black", Arial, sans-serif`;
  g.fillText('LOGOS', w / 2, h * 0.45, w * 0.86);
  g.fillRect(w * 0.15, h * 0.78, w * 0.7, h * 0.04);
}

/** el azulejo rojo del zócalo */
function azulejo(g, w, h) {
  g.fillStyle = '#b4502e';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d8c8b8';
  g.lineWidth = 1.5;
  for (let x = 0; x < w; x += 12) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y < h; y += 12) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** un mirador de cristal con el marco blanco, saliente */
function mirador(k, s, y, w = 2.4, h = 2.3, sale = 0.6) {
  k.box(s, y - 0.12, ZF + sale / 2, w + 0.2, 0.12, sale, 0xf2e6d0);
  k.box(s, y + h, ZF + sale / 2, w + 0.2, 0.25, sale, 0xf2e6d0);
  for (const x of [s - w / 2, s + w / 2]) k.box(x, y, ZF + sale / 2, 0.1, h, sale, 0xf2f2ee);
  k.pic(s, y + h / 2, ZF + sale + 0.004, w, h, 0, 1, canvasTex(Math.round(w * 60), Math.round(h * 60), cristales('#f2f2ee', 3, 'rgba(225,220,205,.55)')));
}

/** una ventana blanca con persiana y reja blanca */
function ventanaBlanca(k, s, y, w = 1.0, h = 1.3, reja = true) {
  hueco(k, s, y, w, h, canvasTex(Math.round(w * 60), Math.round(h * 60), cristales('#f2f2ee', 2)), { borde: 0xf2f2ee, z: ZF });
  k.pic(s, y + h - 0.2, ZF + 0.03, w, 0.4, 0, 1, canvasTex(60, 24, persianaBlanca));
  if (reja) for (const yy of [0.25, 0.5, 0.75]) k.box(s, y + h * yy, ZF + 0.1, w, 0.025, 0.025, 0xf2f2ee);
}

/** el edificio de pisos color melocotón (s 0 a 24) */
function pisos(k) {
  pared(k, 0, 24, PISOS, (g, w, h) => { g.fillStyle = '#e9cdb0'; g.fillRect(0, 0, w, h); });
  k.box(12, PISOS, ZF - 0.12, 24, 0.7, 0.24, MELOCOTON);
  k.box(12, PISOS + 0.7, ZF - 0.1, 24.04, 0.06, 0.3, 0xf2e6d0);
  // abajo: el portal de cristal, la puerta blanca de lamas, las ventanas con reja y los buzones
  hueco(k, 9.0, 0, 1.4, 2.4, canvasTex(84, 144, cristales('#f2f2ee', 2, 'rgba(90,80,70,.3)')), { borde: 0xf2f2ee, z: ZF });
  hueco(k, 7.2, 0, 0.9, 2.2, canvasTex(54, 132, persianaBlanca), { borde: 0xf2f2ee, z: ZF });
  for (const s of [2.0, 4.6, 12.0, 14.0, 16.4, 21.0]) ventanaBlanca(k, s, 0.9, 0.9, 1.5);
  k.box(18.6, 1.1, ZF + 0.08, 1.0, 0.6, 0.14, 0xb8b4ac);
  // arriba: los miradores y las ventanas con persiana, en las tres plantas
  for (const y of [3.4, 6.4]) {
    mirador(k, 4.0, y);
    mirador(k, 17.5, y);
    for (const s of [8.0, 10.2, 12.4, 21.6]) ventanaBlanca(k, s, y + 0.4, 0.9, 1.5, y < 5);
  }
  for (const s of [3.0, 6.0, 9.5, 13.0, 17.0, 21.0]) ventanaBlanca(k, s, 9.4, 0.9, 1.2, false);
}

/** la casa blanca de dos plantas con el balcón y la oficina de LOGOS (s 24 a 39) */
function casaLogos(k) {
  pared(k, 24, 39, DOS);
  pretil(k, 24, 39, DOS);
  ventanaBlanca(k, 26.0, 0.9, 1.0, 1.2, false);
  hueco(k, 29.0, 0, 1.0, 2.25, canvasTex(60, 135, cristales('#f2f2ee', 1, 'rgba(240,240,236,.85)')), { borde: 0xf2f2ee, z: ZF });
  hueco(k, 32.6, 0, 1.0, 2.3, canvasTex(60, 138, cristales('#2a2a2c', 1, 'rgba(40,40,44,.6)')), { borde: 0x2a2a2c, z: ZF });
  k.pic(35.4, 1.7, ZF + 0.03, 2.0, 0.9, 0, 1, canvasTex(240, 108, rotuloLogos));
  k.box(30.6, 1.3, ZF + 0.07, 0.35, 0.45, 0.1, 0xe2e2de);
  // arriba: el balcón de barandilla blanca, la puerta y la ventana, y los dos farolillos
  k.box(34.0, 3.05, ZF + 0.45, 8.0, 0.15, 0.9, 0xe8e6e0);
  k.box(34.0, 3.2, ZF + 0.86, 8.0, 0.25, 0.08, BLANCO);
  k.box(34.0, 4.12, ZF + 0.86, 8.0, 0.06, 0.08, BLANCO);
  for (let s = 30.2; s <= 37.9; s += 0.5) k.box(s, 3.45, ZF + 0.86, 0.04, 0.67, 0.04, BLANCO);
  hueco(k, 34.5, 3.2, 2.4, 2.1, canvasTex(144, 126, cristales('#f2f2ee', 3)), { borde: 0xf2f2ee, z: ZF });
  ventanaBlanca(k, 27.5, 4.0, 1.0, 1.2, false);
  for (const s of [32.6, 36.4]) {
    k.box(s, 4.9, ZF + 0.1, 0.06, 0.25, 0.2, 0x2a2a2c);
    k.box(s, 4.65, ZF + 0.2, 0.18, 0.3, 0.18, 0x3a3a3c);
  }
}

/** la casa crema y las terreras (s 39 al final) */
function terreras(k) {
  pared(k, 39, 43, BAJA, (g, w, h) => { g.fillStyle = '#efe0c4'; g.fillRect(0, 0, w, h); });
  pared(k, 43, V.len, BAJA);
  pretil(k, 39, V.len, BAJA);
  // la casa crema: la ventana de contraventanas marrones y la puerta
  hueco(k, 40.4, 0.9, 1.1, 1.2, canvasTex(66, 72, contraventana), { borde: MARRON_OSC, z: ZF });
  puerta(k, 42.2, 0.9);
  // la beis con la puerta de madera y la ventana de contraventanas
  k.box(45.2, 0, ZF + 0.02, 4.4, BAJA - 0.6, 0.04, CREMA);
  hueco(k, 44.2, 0.9, 1.1, 1.2, canvasTex(66, 72, contraventana), { borde: MARRON_OSC, z: ZF + 0.04 });
  hueco(k, 46.4, 0, 1.0, 2.25, canvasTex(60, 135, contraventana), { borde: MARRON_OSC, z: ZF + 0.04 });
  // la del zócalo de azulejo rojo, con la puerta de cristal marrón y la ventana
  k.pic(50.2, 0.6, ZF + 0.01, 5.4, 1.2, 0, 1, canvasTex(270, 60, azulejo));
  hueco(k, 49.3, 0, 1.1, 2.3, canvasTex(66, 138, cristales('#6a4430', 2, 'rgba(60,50,40,.35)')), { borde: MARRON_OSC, z: ZF + 0.02 });
  ventana(k, 51.2, 1.0, 1.4, 1.2);
  hueco(k, 54.0, 0.9, 1.1, 1.2, canvasTex(66, 72, contraventana), { borde: MARRON_OSC, z: ZF });
  // la de la ventana del marco verde
  hueco(k, 56.6, 0.9, 1.0, 1.2, canvasTex(60, 72, cristales('#3f8a52', 2)), { borde: 0x2c6a3c, z: ZF });
  puerta(k, 58.6, 0.9);
}

/** se monta con lo demás */
export function buildValladolidOeste(scene, colliders, map) {
  if (!map?.valladolidOeste) return null;
  const k = new Kit();
  pisos(k);
  casaLogos(k);
  terreras(k);
  const grupos = [enMarco(k, V, 'valladolidOeste', colliders)];
  // la trasera que da al campo, los costados de la punta y los que asoman por encima de los vecinos
  for (const [s0, s1, h, n] of [[0, 24, PISOS, 'Pisos'], [24, 39, DOS, 'Logos'], [39, V.len, BAJA, 'Terreras']]) {
    grupos.push(tira(V.W(s1, -FONDO), V.W(s0, -FONDO), h, 'valladolidOesteAtras' + n, colliders));
  }
  grupos.push(tira(V.W(0, -FONDO), V.W(0, 0), PISOS, 'valladolidOesteSur', colliders));
  grupos.push(tira(V.W(24, 0), V.W(24, -FONDO), PISOS, 'valladolidOesteLadoPisos', colliders));
  grupos.push(tira(V.W(39, 0), V.W(39, -FONDO), DOS, 'valladolidOesteLadoLogos', colliders));
  grupos.push(tira(V.W(V.len, 0), V.W(V.len, -FONDO), BAJA, 'valladolidOesteNorte', colliders));
  for (const g of grupos) scene.add(g);
  return { grupos };
}
