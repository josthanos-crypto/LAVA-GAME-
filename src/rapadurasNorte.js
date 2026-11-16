import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco, trocear } from './restaurantesCharco.js';
import { cristales, alzarEdificio, alturaBloque } from './edificioReal.js';
import { paveMesh, polyTris, lightSlabs } from './suelos.js';
import { Z, ZF, BLANCO, VERDE, GRIS, MARRON_OSC, bloques, desconchada, pared, pretil, puerta, ventana, tira, tierraParda } from './rapadurasSur.js';

/**
 * Las Rapaduras (Altavista), la mitad norte de la franja entre León y Castillo y la calle Cádiz: de la casa de León y
 * Castillo 176 hasta el edificio de la esquina de la calle del Donante de Sangre, con las vistas de la calle de Google de
 * julio de 2025 (León y Castillo 178 y 184, calle Cádiz 25 y 31) y la foto aérea de GRAFCAN de 2024-2026 (solo se miran,
 * no van dentro del juego). El juego tenía ahí el edificio del tejado rojo de 6 m, liso, y lo demás era la foto aérea
 * borrosa del suelo. De verdad:
 * - el solar grande de tierra, abierto a las dos calles;
 * - el edificio blanco de tres plantas (el del tejado rojo), con los balcones de barandilla marrón, la puerta de reja y
 *   las ventanas marrones, y delante la acera alta con su escalón;
 * - la fila de casas terreras viejas de León y Castillo, desconchadas, con las puertas verdes, las rejas y una pintada
 *   de gris malva;
 * - por la calle Cádiz, la casa vieja de la puerta verde grande y la puerta gris (las pintadas no se ponen), la casa
 *   blanca de al lado, el muro de bloques y el muro blanco con la cancela verde del jardín;
 * - el edificio gris de bloques sin enfoscar, de dos plantas, y el jardín con la higuera y los arbustos;
 * - y las ruinas de detrás, con los escombros, entre tierra y matojos.
 */

// el edificio de tres plantas: su cara sur (al solar) y la del oeste (a León y Castillo)
const RS = marco([336.5, -909.0], [348.3, -907.4]);
const RW = marco([338.0, -919.9], [336.5, -909.0]);
const RN = marco([349.7, -918.3], [338.0, -919.9]);
const RE = marco([348.3, -907.4], [349.7, -918.3]);
const ALTO = 9.5;
// la fila de casas viejas de León y Castillo (s del norte al sur, N al oeste), de 11 m de fondo
const LO = marco([340.5, -938.0], [338.0, -919.9]);
// la calle Cádiz: las dos casas (s del sur al norte, N al este) y los muros del jardín
const CG = marco([365.88, -920.0], [368.75, -938.3]);
const CW = marco([363.69, -906.0], [365.88, -920.0]);
const GS = marco([348.3, -907.4], [363.69, -906.0]);
// el edificio gris de bloques
const GRISES = [[351.0, -915.0], [357.5, -915.0], [357.5, -926.0], [351.0, -926.0]];
// los suelos: la tierra de toda la mitad norte y la acera alta de delante de las casas de León y Castillo
const SOLAR = [[329.8, -882.0], [359.9, -882.0], [368.75, -938.3], [357.0, -938.3], [343.0, -940.8], [339.5, -939.0], [337.55, -926.7], [330.45, -885.5]];
const ACERA = [[334.5, -909.0], [336.5, -909.0], [338.0, -919.9], [340.5, -938.0], [339.4, -938.0], [337.54, -926.66], [336.38, -919.9]];
const BORDE = [[334.5, -909.0], [336.38, -919.9], [337.54, -926.66], [339.4, -938.0]];

/** antes de levantar la ciudad: el edificio a sus tres plantas y las casas nuevas en el mapa */
export function tuneRapadurasNorte(map) {
  if (!Array.isArray(map?.buildings)) return;
  const blanco = [236, 236, 232], azotea = [206, 202, 194];
  alturaBloque(map, 343, -913, ALTO, blanco);
  alzarEdificio(map, LO, 0, LO.len, 11, 3.4, blanco, azotea);
  alzarEdificio(map, CG, 0, 6.68, 8.4, 3.4, blanco, azotea);
  alzarEdificio(map, CG, 6.68, CG.len, 9, 3.4, blanco, azotea);
  map.buildings.push({ p: [...GRISES, GRISES[0]].map(q => q.slice()), h: 6.2, k: 'gen', s: 0, f: [150, 148, 142], c: [140, 138, 132], edificioReal: true });
  map.rapadurasNorte = true;
}

/** una puerta verde, de una hoja o de dos */
function puertaVerde(g, w, h) {
  g.fillStyle = '#3f8a52';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#2c6a3c';
  g.lineWidth = Math.max(3, w * 0.04);
  const hojas = w > h * 0.55 ? 2 : 1;
  for (let i = 0; i < hojas; i++) {
    const x0 = (w / hojas) * i;
    g.strokeRect(x0 + w * 0.06 / hojas, h * 0.06, w / hojas - w * 0.12 / hojas, h * 0.4);
    g.strokeRect(x0 + w * 0.06 / hojas, h * 0.52, w / hojas - w * 0.12 / hojas, h * 0.4);
  }
}

/** la puerta de reja de hierro marrón, con el cristal oscuro detrás */
function puertaReja(g, w, h) {
  g.fillStyle = '#2a2624';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#6a4430';
  g.lineWidth = Math.max(3, w * 0.03);
  for (let x = w * 0.08; x < w; x += w / 9) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (const y of [0.05, 0.5, 0.95]) { g.beginPath(); g.moveTo(0, h * y); g.lineTo(w, h * y); g.stroke(); }
  g.strokeRect(1, 1, w - 2, h - 2);
}

/** la pared gris malva de una de las casas viejas */
function malva(g, w, h) {
  desconchada(g, w, h);
  g.fillStyle = 'rgba(150,138,150,0.55)';
  g.fillRect(0, 0, w, h);
}

/** un balcón: la losa, la barandilla de madera marrón de travesaños y sus postes */
function balcon(k, s0, s1, y, sale = 0.8) {
  const c = (s0 + s1) / 2, w = s1 - s0, zc = ZF + sale / 2;
  k.box(c, y - 0.14, zc, w, 0.14, sale, 0xe2e0da);
  k.box(c, y + 0.95, ZF + sale - 0.04, w, 0.07, 0.08, 0x6a4430);
  for (const yy of [0.3, 0.55, 0.8]) k.box(c, y + yy, ZF + sale - 0.04, w, 0.05, 0.04, 0x6a4430);
  for (const s of [s0 + 0.04, s1 - 0.04]) k.box(s, y, zc, 0.06, 1.0, sale, 0x6a4430);
  for (let s = s0 + 1.2; s < s1 - 0.6; s += 1.2) k.box(s, y, ZF + sale - 0.04, 0.06, 1.0, 0.06, 0x6a4430);
}

/** una ventana marrón alta (de las que dan al balcón) */
function ventanaAlta(k, s, y, w = 1.0, h = 2.1) {
  hueco(k, s, y, w, h, canvasTex(Math.round(w * 70), Math.round(h * 70), cristales('#6a4430', 2, 'rgba(200,190,170,.45)')), { borde: MARRON_OSC, z: ZF });
}

/** el pretil del edificio de tres plantas */
function pretilAlto(k, s0, s1) {
  k.box((s0 + s1) / 2, ALTO, ZF - 0.12, s1 - s0, 0.8, 0.24, BLANCO);
  k.box((s0 + s1) / 2, ALTO + 0.8, ZF - 0.1, s1 - s0 + 0.04, 0.06, 0.3, 0xdcdad4);
}

/** la cara sur del edificio de tres plantas, la que da al solar */
function edificioSur(k) {
  pared(k, 0, RS.len, ALTO);
  pretilAlto(k, 0, RS.len);
  ventana(k, 2.5, 1.0, 1.1, 1.2, true);
  puerta(k, 6.0, 1.0, 2.3);
  ventana(k, 9.0, 1.0, 1.1, 1.2, true);
  ventana(k, 2.5, 4.1, 1.1, 1.2);
  balcon(k, 6.3, 10.6, 3.1);
  ventanaAlta(k, 7.4, 3.1);
  ventanaAlta(k, 9.5, 3.1);
  for (const s of [2.5, 6.0, 9.0]) ventana(k, s, 7.2, 1.1, 1.2);
}

/** la cara oeste del edificio de tres plantas, a León y Castillo: la puerta de reja y los dos balcones */
function edificioOeste(k) {
  pared(k, 0, RW.len, ALTO);
  pretilAlto(k, 0, RW.len);
  hueco(k, 3.0, 0, 1.2, 2.35, canvasTex(120, 235, puertaReja), { borde: MARRON_OSC, z: ZF });
  ventana(k, 7.5, 1.0, 1.2, 1.2);
  k.box(7.5, 1.0, ZF + 0.03, 1.2, 1.2, 0.03, 0x7a5236);
  balcon(k, 1.4, 7.6, 3.1);
  ventanaAlta(k, 3.0, 3.1);
  ventanaAlta(k, 6.0, 3.1);
  ventana(k, 9.5, 4.1, 1.0, 1.2);
  balcon(k, 1.4, 5.2, 6.2, 0.7);
  ventanaAlta(k, 3.2, 6.2);
  ventana(k, 7.0, 7.2, 1.0, 1.2);
  ventana(k, 9.5, 7.2, 1.0, 1.2);
}

/** la fila de casas terreras viejas de León y Castillo (del norte al sur) */
function casasViejas(k) {
  pared(k, 0, 5.0, 3.4);
  pared(k, 5.0, 9.5, 3.4, malva);
  pared(k, 9.5, LO.len, 3.4);
  pretil(k, 0, LO.len, 3.4);
  k.box(LO.len / 2, 0, ZF + 0.02, LO.len, 0.6, 0.06, GRIS);
  hueco(k, 2.5, 0, 1.0, 2.25, canvasTex(100, 225, puertaVerde), { borde: 0x2c6a3c, z: ZF });
  puerta(k, 6.3, 0.9, 2.2);
  ventana(k, 8.2, 1.0, 0.9, 1.1, true);
  hueco(k, 11.0, 0, 1.0, 2.25, canvasTex(100, 225, puertaVerde), { borde: 0x2c6a3c, z: ZF });
  ventana(k, 12.8, 1.0, 0.9, 1.1, true);
  ventana(k, 15.5, 1.0, 0.9, 1.1, true);
  puerta(k, 17.2, 0.9, 2.2);
}

/** por la calle Cádiz: la casa vieja de la puerta verde grande y la gris, y la casa blanca de al lado */
function casasCadiz(k) {
  pared(k, 0, 6.68, 3.4);
  pared(k, 6.68, CG.len, 3.4);
  pretil(k, 0, CG.len, 3.4);
  k.box(4.5, 3.9, ZF - 0.12, 2.4, 0.5, 0.24, BLANCO);
  hueco(k, 3.1, 0, 1.7, 2.4, canvasTex(170, 240, puertaVerde), { borde: 0x2c6a3c, z: ZF });
  hueco(k, 5.4, 0, 0.9, 2.15, canvasTex(90, 215, (g, w, h) => { g.fillStyle = '#a8aaa8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8a8c8a'; g.lineWidth = 3; g.strokeRect(w * 0.12, h * 0.06, w * 0.76, h * 0.88); }), { borde: 0x9a9c9a, z: ZF });
  puerta(k, 10.0);
  ventana(k, 12.5, 1.0, 1.0, 1.1, true);
  ventana(k, 16.0, 1.0, 1.0, 1.1, true);
}

/** el muro blanco con la cancela verde del jardín y el muro de bloques, por la calle Cádiz */
function murosCadiz(k) {
  pared(k, 0, 6.0, 2.4);
  k.box(3.75, 0, ZF + 0.04, 2.5, 2.2, 0.06, VERDE);
  for (let s = 2.6; s < 5.0; s += 0.16) k.box(s, 0.1, ZF + 0.09, 0.03, 2.0, 0.03, 0x2c6a3c);
  pared(k, 6.0, CW.len, 2.2, bloques);
}

/** un árbol del jardín, de copa de bolas */
function arbol(k, x, z, h, ancho, sd) {
  k.cyl(x, 0.18, z, 0.12, 0.2, h * 0.45, 0x6a5440, { seg: 8 });
  const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 12; i++) {
    k.ball(x + (r() - 0.5) * ancho, h * (0.5 + r() * 0.4), z + (r() - 0.5) * ancho, ancho * (0.22 + r() * 0.12), [0x3e6a2e, 0x4a7a36, 0x56863c][i % 3], { seg: 7 });
  }
}

/** el jardín, las ruinas de detrás (escombros y trozos de muro) y los matojos del solar (en metros del mapa) */
function jardinYRuinas(k) {
  arbol(k, 356.0, -909.5, 4.5, 4.2, 11);
  arbol(k, 361.0, -911.0, 3.2, 2.6, 23);
  arbol(k, 352.5, -912.0, 3.6, 2.8, 37);
  let s = 53;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 9; i++) {
    const x = 351.5 + r() * 6, z = -937.5 + r() * 11;
    k.ball(x, 0.15, z, 0.5 + r() * 0.6, [0x9a948a, 0xb8b0a2, 0x7a766e][i % 3], { sx: 1.3, sy: 0.45, sz: 1.1, seg: 7 });
  }
  for (const [x, z, w, h] of [[352.0, -931.5, 0.25, 1.4], [355.2, -936.8, 2.4, 0.25]]) k.box(x, 0.15, z, w, 0.9 + r() * 0.6, h, 0x8e8a82);
  // los matojos del solar grande y de las ruinas
  for (let i = 0; i < 260; i++) {
    const x = 331 + r() * 36, z = -938 + r() * 56;
    const enSolar = z > -906 && x > 331 + (z + 882) * -0.17 && x < 359.5 + (-882 - z) * 0.155;
    const enRuina = z < -926.5 && z > -937.5 && x > 351.5 && x < 357.5;
    if (!enSolar && !enRuina) continue;
    const t = 0.2 + r() * 0.35, verde = r() < 0.5;
    k.ball(x, 0.2, z, t, verde ? 0x7a8a3a : 0xa8925a, { sx: 1.3, sy: 0.55, sz: 1.2, seg: 7 });
  }
}

/** se monta con lo demás */
export function buildRapadurasNorte(scene, colliders, map) {
  if (!map?.rapadurasNorte) return null;
  const grupos = [];
  const montar = (M, nombre, hacer) => { const k = new Kit(); hacer(k); grupos.push(enMarco(k, M, nombre, colliders)); };
  montar(RS, 'rapadurasEdificioSur', edificioSur);
  montar(RW, 'rapadurasEdificioOeste', edificioOeste);
  montar(LO, 'rapadurasCasasViejas', casasViejas);
  montar(CG, 'rapadurasCasasCadiz', casasCadiz);
  montar(CW, 'rapadurasMurosCadiz', murosCadiz);
  montar(GS, 'rapadurasMuroJardin', (k) => pared(k, 0, GS.len, 2.4));
  // las caras de los lados y de atrás (tapan las ventanas que el juego pinta en todas las caras)
  grupos.push(tira(RN.B, RN.W(RN.len, 0), ALTO, 'rapadurasEdificioNorte', colliders));
  grupos.push(tira(RE.B, RE.W(RE.len, 0), ALTO, 'rapadurasEdificioEste', colliders, (k, L) => {
    pared(k, 0, L, ALTO, desconchada, -0.25);
    for (const y of [4.1, 7.2]) hueco(k, 5.5, y, 0.8, 1.0, canvasTex(56, 70, cristales('#6a4430', 1)), { borde: MARRON_OSC, z: 0.05 });
  }));
  grupos.push(tira(LO.W(LO.len, -11), LO.W(0, -11), 3.4, 'rapadurasCasasViejasAtras', colliders));
  grupos.push(tira(LO.W(0, -11), LO.W(0, 0), 3.4, 'rapadurasCasasViejasNorte', colliders));
  grupos.push(tira(CG.W(6.68, -8.4), CG.W(0, -8.4), 3.4, 'rapadurasCasaVerdeAtras', colliders));
  grupos.push(tira(CG.W(CG.len, -9), CG.W(6.68, -9), 3.4, 'rapadurasCasaBlancaAtras', colliders));
  grupos.push(tira(CG.W(CG.len, 0), CG.W(CG.len, -9), 3.4, 'rapadurasCasaBlancaNorte', colliders));
  grupos.push(tira([351.0, -915.0], [357.5, -915.0], 6.2, 'rapadurasGrisSur', colliders, (k, L) => {
    pared(k, 0, L, 6.2, bloques);
    k.box(L / 2, 5.6, Z + 0.32, L, 0.6, 0.04, BLANCO);
    for (const [s, y] of [[1.6, 3.6], [4.6, 3.6], [3.2, 1.2]]) k.box(s, y, Z + 0.32, 0.7, 0.8, 0.03, 0x2a2826);
  }));
  grupos.push(tira([351.0, -926.0], [351.0, -915.0], 6.2, 'rapadurasGrisOeste', colliders, (k, L) => pared(k, 0, L, 6.2, bloques, -0.25)));
  grupos.push(tira([357.5, -926.0], [351.0, -926.0], 6.2, 'rapadurasGrisNorte', colliders, (k, L) => pared(k, 0, L, 6.2, bloques, -0.25)));
  grupos.push(tira([357.5, -915.0], [357.5, -926.0], 6.2, 'rapadurasGrisEste', colliders, (k, L) => pared(k, 0, L, 6.2, bloques, -0.25)));
  // el bordillo de la acera alta, con su escalón
  for (let i = 0; i < BORDE.length - 1; i++) {
    grupos.push(tira(BORDE[i + 1], BORDE[i], 0.34, 'rapadurasBordillo' + i, null, (k, L) => {
      k.box(L / 2, 0, -0.05, L, 0.34, 0.1, 0xc8c4bc);
      k.box(L / 2, 0, 0.18, L, 0.17, 0.36, 0xd0ccc4);
    }));
  }
  const kj = new Kit();
  jardinYRuinas(kj);
  grupos.push(kj.build('rapadurasJardinRuinas').group);
  for (const g of grupos) scene.add(g);
  // los suelos: la tierra y la acera alta de losetas
  const suelos = [
    ['rapadurasTierraNorte', SOLAR, 0.18, tierraParda(), 0xffffff],
    ['rapadurasAceraAlta', ACERA, 0.34, lightSlabs(), 0xe2dccc],
  ].map(([nombre, poly, y, tex, color]) => {
    const m = paveMesh(trocear(polyTris(poly), 1.5), y, tex, color);
    if (m) { m.name = nombre; scene.add(m); }
    return m;
  });
  return { grupos, suelos };
}
