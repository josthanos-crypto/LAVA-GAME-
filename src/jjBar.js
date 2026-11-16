import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alzarEdificio, paredAlta, ventana, medianera } from './edificioReal.js';

/**
 * J&J Bar Cafetería, en la calle México 35 (centro), con la vista de la calle de Google de julio de 2025 (solo se
 * mira, no va dentro del juego; la gente no se pone; Google solo tiene fotos de los platos): el bajo forrado de
 * granito oscuro del edificio de los balcones; la puerta grande abierta del bar con la barra blanca, los taburetes y
 * el suelo rojo dentro, y encima su tejadillo gris; a la izquierda, el comedor un poco más alto, con la ventana y la
 * puerta abierta a las mesas, y la rejilla del aire debajo; el letrero blanco de bandera, las cajitas de la alarma y
 * los papelitos; a la derecha, el portal de reja blanca; y al principio, la puerta blanca del garaje. El nombre del bar
 * no se lee en la foto y no se pone; la pegatina naranja de la marca, tampoco. Encima, el edificio de verdad (vista de
 * la calle mirando hacia arriba): color crema, el bajo y dos plantas (9,6 m; el bloque del mapa era de 5 m), con tres
 * cuerpos de balcones metidos con barandilla de hierro oscuro labrado en cada planta, la franja blanca de la escalera
 * con sus dos ventanitas, los apliques de luz y el remate ondulado de la azotea.
 */

// la cara de la calle México (s desde la esquina de Huesca hacia el norte); la vista de la calle pone la puerta del
// bar en s 26,8–28,6 (Google pone el bar en s 26,8; el mapa no tenía rótulo suyo)
const M = marco([-695.64, 27.43], [-724.64, -29]);
const Z = 0.12, ZF = Z + 0.3, YP = 5.0, S0 = 19.4, S1 = 31.0, ALTO = 3.2;
// el edificio de verdad: de s 22,5 a 34,5, el bajo y dos plantas de 2,9 m, con la azotea a 9,6 m
const E0 = 22.5, E1 = 34.5, TECHO = 9.6, CREMA = 0xe6d6bc, HIERRO = 0x3a2a24;
const CUERPOS = [[22.6, 25.8], [25.9, 29.0], [30.6, 34.4]];

/** antes de levantar la ciudad: la marca de que se monta (el mapa no tenía rótulo suyo) y el edificio a su altura */
export function tuneJjBar(map) {
  map.jjBar = true;
  // el edificio a su altura de verdad (el bloque del mapa es más bajo)
  alzarEdificio(map, M, E0, E1, 12, TECHO, [230, 214, 188]);
}

// ——— lo que se pinta en lienzo ———

/** el granito oscuro moteado, en placas */
function granito(g, w, h) {
  g.fillStyle = '#3a3a3c';
  g.fillRect(0, 0, w, h);
  let s = 17;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < w * h / 40; i++) {
    g.fillStyle = r() < 0.5 ? 'rgba(20,20,22,.6)' : r() < 0.7 ? 'rgba(150,150,150,.5)' : 'rgba(90,90,92,.6)';
    g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
  }
  g.strokeStyle = 'rgba(15,15,15,.6)';
  g.lineWidth = 1.5;
  const pw = w / 15, ph = h / 5;
  for (let x = 0; x <= w; x += pw) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y <= h; y += ph) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** el bar por la puerta: la barra blanca, los taburetes, las botellas y el suelo rojo */
function barra(g, w, h) {
  g.fillStyle = '#5a4c40';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8c070';
  g.fillRect(w * 0.15, h * 0.1, w * 0.7, h * 0.08);
  g.fillStyle = '#3a2e26';
  g.fillRect(0, h * 0.24, w, h * 0.2);
  for (let x = 8; x < w - 8; x += 9) { g.fillStyle = ['#8a5a30', '#3a6a3a', '#c8a050', '#8a2a2a'][(x / 9) % 4 | 0]; g.fillRect(x, h * 0.27, 5, h * 0.12); }
  g.fillStyle = '#ece8e0';
  g.fillRect(w * 0.3, h * 0.5, w * 0.7, h * 0.3);
  g.fillStyle = '#c8c4bc';
  g.fillRect(w * 0.3, h * 0.5, w * 0.7, h * 0.04);
  g.fillStyle = '#a8442a';
  g.fillRect(0, h * 0.82, w, h * 0.18);
  g.strokeStyle = 'rgba(60,20,10,.5)';
  g.lineWidth = 1;
  for (let x = 0; x < w; x += 14) { g.beginPath(); g.moveTo(x, h * 0.82); g.lineTo(x, h); g.stroke(); }
  g.strokeStyle = '#1e1e20';
  g.lineWidth = 3;
  for (const x of [0.4, 0.62, 0.84]) { g.beginPath(); g.moveTo(w * x, h * 0.62); g.lineTo(w * x, h * 0.9); g.stroke(); g.fillStyle = '#1e1e20'; g.fillRect(w * x - 7, h * 0.6, 14, 4); }
  g.strokeStyle = '#e8e8e4';
  g.lineWidth = 6;
  g.strokeRect(3, 3, w - 6, h - 6);
}

/** el comedor por la ventana y la puerta abierta: las mesas y las sillas de madera */
function comedor(g, w, h) {
  g.fillStyle = '#d8d0c4';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#7a5a40';
  g.fillRect(0, h * 0.85, w, h * 0.15);
  g.fillStyle = '#4a3020';
  for (const x of [0.15, 0.6]) { g.fillRect(w * x, h * 0.55, w * 0.25, h * 0.05); g.fillRect(w * x + 3, h * 0.6, 3, h * 0.25); g.fillRect(w * (x + 0.25) - 6, h * 0.6, 3, h * 0.25); }
  g.fillStyle = '#5a3a26';
  for (const x of [0.1, 0.42, 0.55, 0.88]) g.fillRect(w * x, h * 0.45, w * 0.05, h * 0.4);
  g.fillStyle = 'rgba(255,255,255,.18)';
  g.fillRect(0, 0, w * 0.5, h);
  g.strokeStyle = '#f2f2ee';
  g.lineWidth = 5;
  g.strokeRect(2, 2, w - 4, h - 4);
  g.beginPath(); g.moveTo(w * 0.52, 0); g.lineTo(w * 0.52, h); g.stroke();
  // la hoja de madera abierta de la puerta
  g.fillStyle = '#6a3a24';
  g.fillRect(w * 0.53, h * 0.02, w * 0.08, h * 0.96);
}

/** la puerta del garaje: la reja de arriba y la chapa blanca */
function garaje(g, w, h) {
  g.fillStyle = '#ecece8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#4a4a4c';
  g.fillRect(w * 0.04, h * 0.04, w * 0.92, h * 0.4);
  g.strokeStyle = '#ecece8';
  g.lineWidth = 2;
  for (let x = w * 0.04; x < w; x += 8) { g.beginPath(); g.moveTo(x, h * 0.04); g.lineTo(x, h * 0.44); g.stroke(); }
  for (let y = h * 0.04; y < h * 0.44; y += 8) { g.beginPath(); g.moveTo(w * 0.04, y); g.lineTo(w * 0.96, y); g.stroke(); }
  g.strokeStyle = 'rgba(0,0,0,.15)';
  for (let y = h * 0.5; y < h; y += 10) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** la rejilla del aire, de lamas */
function rejilla(g, w, h) {
  g.fillStyle = '#2a2a2c';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#5a5a5c';
  for (let y = 6; y < h - 4; y += 7) g.fillRect(4, y, w - 8, 3);
}

/** el portal de reja blanca */
function portal(g, w, h) {
  g.fillStyle = '#5a4a40';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4f4f0';
  for (let x = 4; x < w; x += 10) g.fillRect(x, 0, 3, h);
  for (const y of [0.02, 0.35, 0.65, 0.95]) g.fillRect(0, h * y, w, 6);
  g.fillRect(0, 0, 5, h);
  g.fillRect(w - 5, 0, 5, h);
}

// ——— las piezas ———

/** el bajo de granito, el garaje, el comedor, la puerta del bar, el letrero de bandera y el portal */
function fachada(k) {
  const c = (S0 + S1) / 2, L = S1 - S0;
  k.box(c, 0, Z + 0.15, L, YP, 0.3, 0xece4d6);
  k.block(c, Z + 0.15, L, 0.3);
  k.pic(c, ALTO / 2, ZF + 0.004, L, ALTO, 0, 1, canvasTex(1160, 320, granito));
  // el canto gris del voladizo de los balcones, encima del bajo
  k.box(c, ALTO, ZF + 0.2, L, 0.25, 0.4, 0x8a8682);
  // la puerta del garaje
  k.pic(20.7, 1.575, ZF + 0.01, 2.2, 3.15, 0, 1, canvasTex(180, 250, garaje));
  // el comedor, más alto que la acera: la ventana y la puerta abierta, y la rejilla del aire debajo
  k.pic(24.0, 2.15, ZF + 0.01, 2.4, 2.0, 0, 1, canvasTex(220, 180, comedor), { glow: 0.15 });
  k.box(23.05, 0.45, ZF + 0.04, 0.95, 0.95, 0.1, 0x2a2a2c);
  k.pic(23.05, 0.925, ZF + 0.095, 0.9, 0.9, 0, 1, canvasTex(80, 80, rejilla));
  k.box(24.6, 0.55, ZF + 0.08, 1.6, 0.6, 0.16, 0xd8d6d0);
  // la puerta grande del bar, abierta, con su escalón y el tejadillo gris
  k.pic(27.7, 1.55, ZF + 0.01, 1.8, 2.2, 0, 1, canvasTex(180, 220, barra), { glow: 0.12 });
  k.box(27.7, 0, ZF + 0.15, 1.9, 0.45, 0.3, 0xd8d0c4);
  k.box(27.7, 2.75, ZF + 0.2, 2.0, 0.35, 0.4, 0xc8c8c4);
  // las cajitas de la alarma y los papelitos de al lado
  k.box(25.7, 2.95, ZF + 0.03, 0.25, 0.2, 0.08, 0x8a8a88);
  k.box(26.2, 2.9, ZF + 0.03, 0.4, 0.28, 0.1, 0xe87a2a);
  for (const [s, y] of [[25.9, 2.4], [25.9, 2.1]]) k.box(s, y, ZF + 0.012, 0.25, 0.2, 0.01, 0xf2f2ee);
  // el letrero blanco de bandera, a la derecha de la puerta (no se lee en la foto)
  k.box(29.0, 3.0, ZF + 0.4, 0.1, 0.9, 0.55, 0xf4f4f0);
  k.box(29.0, 3.0, ZF + 0.4, 0.11, 0.1, 0.56, 0xd85a2a);
  k.box(29.0, 3.6, ZF + 0.06, 0.06, 0.06, 0.12, 0x6a6a6a);
  // el portal de reja blanca, con su placa
  k.pic(30.0, 1.275, ZF + 0.01, 0.9, 2.15, 0, 1, canvasTex(90, 210, portal));
  k.box(30.0, 0, ZF + 0.1, 1.0, 0.45, 0.2, 0xd8d0c4);
  k.box(30.0, 2.75, ZF + 0.02, 0.4, 0.12, 0.02, 0xd8d8d4);
}

/** una barandilla de hierro oscuro labrado, de s0 a s1, en el borde del balcón */
function barandilla(k, s0, s1, y, z) {
  const c = (s0 + s1) / 2, w = s1 - s0;
  for (const yy of [y + 0.05, y + 0.95]) k.box(c, yy, z, w, 0.05, 0.05, HIERRO);
  for (let s = s0 + 0.06; s < s1; s += 0.11) k.box(s, y + 0.1, z, 0.02, 0.85, 0.02, HIERRO);
  for (let s = s0 + 0.2; s < s1 - 0.1; s += 0.33) k.box(s, y + 0.38, z + 0.01, 0.16, 0.28, 0.025, HIERRO);
  for (const s of [s0 + 0.03, c, s1 - 0.03]) k.box(s, y, z, 0.07, 1.0, 0.07, HIERRO);
}

/** las dos plantas de arriba: los balcones metidos de hierro, la franja de la escalera y el remate ondulado */
function plantas(k) {
  const c = (E0 + E1) / 2;
  paredAlta(k, E0, E1, YP, TECHO, Z, CREMA);
  k.box(c, ALTO, Z + 0.15, E1 - E0, YP - ALTO, 0.3, CREMA);
  // la franja blanca de la escalera con sus dos ventanitas
  k.box(29.8, ALTO, ZF + 0.02, 1.6, TECHO - ALTO, 0.04, 0xf2efe8);
  for (const y of [4.2, 7.1]) ventana(k, 29.8, y, 0.8, 0.75, Z + 0.06, { carpinteria: '#e8e4dc' });
  for (const y of [3.4, 6.3]) {
    for (const [a, b] of CUERPOS) {
      const m = (a + b) / 2, w = b - a;
      // el fondo oscuro del balcón metido, con las dos puertaventanas
      k.box(m, y + 0.15, ZF + 0.005, w - 0.2, 2.45, 0.02, 0x6a625a);
      for (const t of [a + w * 0.28, b - w * 0.28]) ventana(k, t, y + 0.25, 0.85, 2.05, Z + 0.02, { carpinteria: '#3a2a20' });
      // la losa del balcón, los pilares de los lados y la barandilla
      k.box(m, y, ZF + 0.05, w + 0.1, 0.18, 0.3, 0xdccdb2);
      for (const t of [a, b]) k.box(t, y + 0.15, ZF + 0.02, 0.12, 2.6, 0.14, CREMA);
      barandilla(k, a + 0.06, b - 0.06, y + 0.18, ZF + 0.15);
      // el aplique de luz de la pared del fondo
      k.box(m, y + 2.2, ZF + 0.06, 0.12, 0.16, 0.1, 0xe8e4dc);
    }
  }
  // el remate ondulado de la azotea, más alto en medio
  k.box(c, TECHO, Z + 0.15, E1 - E0, 0.45, 0.3, CREMA);
  k.box(28.5, TECHO + 0.45, Z + 0.15, 4.0, 0.3, 0.3, CREMA);
  k.box(c, TECHO - 0.12, ZF + 0.08, E1 - E0, 0.12, 0.16, 0xd8ccb4);
  // las medianeras lisas que asoman por encima de las casas de al lado
  // (por fuera de las caras del bloque levantado, que el juego pinta con ventanas)
  for (const t of [E0 - 0.07, E1 + 0.07]) medianera(k, t, 5.0, TECHO + 0.45, 12, Z, 0xe8ddc8);
}

/** se monta con lo demás de Arrecife Centro */
export function buildJjBar(scene, colliders, map) {
  if (!map?.jjBar) return null;
  const k = new Kit();
  fachada(k);
  plantas(k);
  const group = enMarco(k, M, 'jjBar', colliders);
  scene.add(group);
  return { group };
}
