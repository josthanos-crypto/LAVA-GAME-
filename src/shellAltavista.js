import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco, trocear, sueloTex } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';
import { paveMesh, polyTris } from './suelos.js';
import { Z, ZF, BLANCO, pared } from './rapadurasSur.js';

/**
 * La gasolinera Shell de León y Castillo 194 (la LZ-1, Altavista) y la Cafetería Parque de Limpieza de al lado, con las
 * fotos del sitio de 2020 a 2026 y las vistas de la calle de Google de julio de 2025 (León y Castillo 157 y la LZ-1 194;
 * solo se miran, no van dentro del juego). El mapa le ponía una gasolinera de las genéricas, que se quita (solo era de
 * adorno), y la cafetería no estaba. De verdad:
 * - la marquesina grande, blanca por debajo, con el canto amarillo y la raya roja y el nombre «Shell» en rojo por el
 *   lado de la calle (sin el dibujo de la concha), los pilares blancos, las tres isletas con sus surtidores y las luces;
 * - la tienda blanca del fondo, con el escaparate, la puerta y el letrero «TIENDA»;
 * - el poste de los precios, amarillo y rojo, junto a la calle (sin precios puestos);
 * - la explanada de hormigón;
 * - la cafetería, la casa blanca de dos plantas entre la gasolinera y el autolavado, con la terraza de toldo rojo y
 *   barandilla roja, las mesas y la balconada de arriba.
 */

// la marquesina: s del norte al sur (0 a 26,6), z del borde de la calle (0) hacia el fondo (negativo, hasta −15,5)
const K = marco([373.0, -1117.2], [368.5, -1091.0]);
const LARGO = 26.6, ANCHO = 15.5, ALTO = 5.2, CANTO = 1.0;
// la cara de la tienda (el lado oeste del bloque del fondo; s del norte al sur)
const TI = marco([390.68, -1125.62], [384.6, -1090.1]);
// la cafetería: su cara a la calle (s del norte al sur), la del norte y la del sur
const CAF = [[372.5, -1083.0], [383.0, -1083.0], [381.5, -1072.5], [372.5, -1072.5]];
const CW = marco([372.5, -1083.0], [372.5, -1072.5]);
const CN = marco([383.0, -1083.0], [372.5, -1083.0]);
const CS = marco([372.5, -1072.5], [381.5, -1072.5]);
// la explanada de la gasolinera
const PATIO = [[362.4, -1072.0], [372.5, -1072.0], [372.5, -1083.5], [383.2, -1083.5], [384.35, -1088.37], [384.6, -1090.1],
  [390.68, -1125.62], [371.5, -1124.0], [370.97, -1120.9]];
const AMARILLO = 0xf6c518, ROJO = 0xd8262a;

/** antes de levantar la ciudad: se quita la Shell genérica y se pone la casa de la cafetería en el mapa */
export function tuneShellAltavista(map) {
  if (Array.isArray(map.fuel)) map.fuel = map.fuel.filter(f => !(/shell/i.test(f.brand || '') && Math.hypot(f.x - 373.2, f.z + 1107.4) < 15));
  if (Array.isArray(map.buildings)) map.buildings.push({ p: [...CAF, CAF[0]].map(q => q.slice()), h: 6.6, k: 'gen', s: 0, f: [240, 240, 236], c: [206, 202, 194], edificioReal: true });
  map.shellAltavista = true;
}

/** el canto de la marquesina: amarillo, con la raya roja abajo y el nombre en rojo si se pide */
function canto(nombre) {
  return (g, w, h) => {
    g.fillStyle = '#f6c518';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#d8262a';
    g.fillRect(0, h * 0.78, w, h * 0.22);
    if (!nombre) return;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `800 ${Math.round(h * 0.6)}px "Arial Rounded MT Bold", "Arial Black", Arial, sans-serif`;
    g.fillText('Shell', w * 0.82, h * 0.4, w * 0.25);
  };
}

/** el poste de los precios: amarillo y rojo, con el nombre arriba y las filas de los precios apagadas */
function poste(g, w, h) {
  g.fillStyle = '#f6c518';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8262a';
  g.fillRect(0, 0, w, h * 0.16);
  g.fillStyle = '#ffffff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(h * 0.09)}px "Arial Rounded MT Bold", "Arial Black", Arial, sans-serif`;
  g.fillText('Shell', w / 2, h * 0.08, w * 0.86);
  for (let i = 0; i < 4; i++) {
    g.fillStyle = '#1a1a1c';
    g.fillRect(w * 0.1, h * (0.22 + i * 0.17), w * 0.8, h * 0.12);
    g.fillStyle = '#3a2a24';
    g.fillRect(w * 0.45, h * (0.24 + i * 0.17), w * 0.4, h * 0.08);
  }
}

/** la pantalla del surtidor */
function pantalla(g, w, h) {
  g.fillStyle = '#16181a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8402a';
  for (let i = 0; i < 3; i++) g.fillRect(w * (0.12 + i * 0.27), h * 0.42, w * 0.2, h * 0.16);
}

/** letras rojas sobre amarillo */
function letrero(texto) {
  return (g, w, h) => {
    g.fillStyle = '#f6c518';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#d8262a';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `800 ${Math.round(h * 0.62)}px "Arial Black", Arial, sans-serif`;
    g.fillText(texto, w / 2, h * 0.55, w * 0.9);
  };
}

/** el hormigón de la explanada */
function hormigon() {
  return sueloTex(256, 6, (g, r, n) => {
    g.fillStyle = '#b8b6b0';
    g.fillRect(0, 0, n, n);
    for (let i = 0; i < 2600; i++) {
      const v = 160 + r() * 50;
      g.fillStyle = `rgb(${Math.round(v)},${Math.round(v - 1)},${Math.round(v - 5)})`;
      g.fillRect(r() * n, r() * n, 1 + r() * 2, 1 + r() * 2);
    }
    for (let i = 0; i < 6; i++) {
      g.fillStyle = 'rgba(70,66,60,0.1)';
      g.beginPath();
      g.arc(r() * n, r() * n, 10 + r() * 26, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = 'rgba(80,80,78,0.5)';
    g.fillRect(0, 0, n, 1.5);
    g.fillRect(0, 0, 1.5, n);
  });
}

/** un surtidor blanco con el copete rojo, de cara a los dos lados */
function surtidor(k, s, z) {
  k.box(s, 0.2, z, 0.55, 2.1, 1.0, 0xf0f0ee);
  k.box(s, 2.3, z, 0.6, 0.3, 1.05, ROJO);
  k.box(s, 1.3, z, 0.57, 0.12, 1.02, AMARILLO);
  for (const lado of [-1, 1]) k.pic(s + lado * 0.29, 1.75, z, 0.8, 0.3, lado, 0, canvasTex(160, 60, pantalla), { glow: 0.5 });
  for (const dz of [-0.52, 0.52]) k.box(s, 0.9, z + dz, 0.3, 1.0, 0.06, 0x1e1e20);
}

/** la marquesina, los pilares, las isletas y el poste de los precios */
function marquesina(k) {
  const cs = LARGO / 2, cz = -ANCHO / 2;
  k.box(cs, ALTO, cz, LARGO, CANTO, ANCHO, BLANCO);
  k.box(cs, ALTO + CANTO, cz, LARGO - 0.3, 0.06, ANCHO - 0.3, 0xd8d8d4);
  for (let s = 2.5; s < LARGO - 1; s += 3.4) for (let z = -2.5; z > -ANCHO + 1; z -= 3.4) k.box(s, ALTO - 0.03, z, 1.2, 0.03, 0.6, 0xffffff, { list: k.glow });
  // el canto amarillo con la raya roja por los cuatro lados, y el nombre por el de la calle
  k.pic(cs, ALTO + CANTO / 2, 0.012, LARGO, CANTO, 0, 1, canvasTex(1600, 60, canto(true)));
  k.pic(cs, ALTO + CANTO / 2, -ANCHO - 0.012, LARGO, CANTO, 0, -1, canvasTex(1600, 60, canto(false)));
  for (const [s, n] of [[0, -1], [LARGO, 1]]) k.pic(s + n * 0.012, ALTO + CANTO / 2, cz, ANCHO, CANTO, n, 0, canvasTex(900, 60, canto(false)));
  // las tres isletas con sus surtidores y los pilares en las puntas
  for (const s of [6.0, 13.3, 20.6]) {
    k.box(s, 0, -7.5, 1.2, 0.2, 8.0, 0xc8c6c0);
    k.block(s, -7.5, 1.2, 8.0);
    for (const z of [-3.9, -11.1]) {
      k.box(s, 0.2, z, 0.4, ALTO - 0.2, 0.4, BLANCO);
      k.block(s, z, 0.45, 0.45);
    }
    for (const z of [-5.8, -9.2]) surtidor(k, s, z);
  }
  // el poste de los precios, junto a la calle, al sur de la marquesina
  const ps = LARGO + 3.4, pz = 0.3;
  k.box(ps, 0, pz, 1.3, 0.3, 0.6, 0x9a9890);
  k.box(ps, 0.3, pz, 1.2, 6.0, 0.35, AMARILLO);
  for (const n of [1, -1]) k.pic(ps, 3.3, pz + n * 0.18, 1.1, 5.8, 0, n, canvasTex(110, 580, poste), { glow: 0.2 });
  k.block(ps, pz, 1.3, 0.6);
}

/** la tienda del fondo: el escaparate, la puerta y el letrero */
function tienda(k) {
  const L = TI.len;
  pared(k, 0, L, 8.0, (g, w, h) => { g.fillStyle = '#f2f2ee'; g.fillRect(0, 0, w, h); });
  hueco(k, 27.0, 0, 6.0, 2.8, canvasTex(360, 168, cristales('#f2f2ee', 4, 'rgba(200,60,50,.25)')), { borde: 0xd8d8d4, z: ZF });
  hueco(k, 31.6, 0, 1.6, 2.6, canvasTex(96, 156, cristales('#f2f2ee', 2, 'rgba(60,60,60,.3)')), { borde: 0xd8d8d4, z: ZF });
  k.pic(28.5, 3.4, ZF + 0.04, 4.0, 0.8, 0, 1, canvasTex(400, 80, letrero('TIENDA')), { glow: 0.2 });
  k.box(L / 2, 4.3, ZF + 0.03, L, 0.4, 0.06, AMARILLO);
  k.box(L / 2, 4.2, ZF + 0.03, L, 0.12, 0.06, ROJO);
  for (const s of [4, 8, 12, 16, 20, 24, 28, 32]) hueco(k, s, 5.4, 1.1, 1.2, canvasTex(66, 72, cristales('#f2f2ee', 2)), { borde: 0xe2e0da, z: ZF });
}

/** la cafetería: la terraza con el toldo rojo y la barandilla roja, las mesas y la balconada de arriba */
function cafeteria(k) {
  const L = CW.len;
  pared(k, 0, L, 6.6, (g, w, h) => { g.fillStyle = '#f2f2ee'; g.fillRect(0, 0, w, h); });
  k.box(L / 2, 6.6, ZF - 0.12, L, 0.5, 0.24, BLANCO);
  hueco(k, 4.0, 0, 4.4, 2.6, canvasTex(264, 156, cristales('#f2f2ee', 4, 'rgba(70,60,50,.3)')), { borde: 0xf2f2ee, z: ZF });
  hueco(k, 7.6, 0, 1.0, 2.4, canvasTex(60, 144, cristales('#f2f2ee', 1, 'rgba(70,60,50,.3)')), { borde: 0xf2f2ee, z: ZF });
  // el toldo rojo de la terraza, con el faldón y el nombre
  k.box(L / 2, 2.9, ZF + 1.8, L - 0.6, 0.06, 3.6, 0xd2442c);
  k.pic(L / 2, 2.72, ZF + 3.62, L - 0.6, 0.36, 0, 1, canvasTex(600, 36, (g, w, h) => {
    g.fillStyle = '#d2442c'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `800 ${Math.round(h * 0.7)}px Arial, sans-serif`;
    g.fillText('CAFETERÍA', w / 2, h * 0.55, w * 0.5);
  }));
  for (const s of [0.5, L - 0.5]) k.box(s, 0, ZF + 3.5, 0.08, 2.9, 0.08, 0x8a8c8e);
  // la barandilla roja de la terraza y las mesas
  k.box(L / 2, 0.95, ZF + 3.55, L - 1.2, 0.06, 0.06, 0xc8202a);
  for (let s = 0.7; s < L - 0.5; s += 0.16) k.box(s, 0.1, ZF + 3.55, 0.025, 0.85, 0.025, 0xc8202a);
  for (const s of [0.6, L - 0.6]) k.box(s, 0, ZF + 1.8, 0.06, 1.0, 3.5, 0xc8202a);
  k.block(L / 2, ZF + 3.55, L - 1.2, 0.1);
  for (const s of [2.2, 5.2, 8.2]) {
    k.table(s, ZF + 1.9, { w: 0.7, d: 0.7, h: 0.74, top: 0xe8e4dc, leg: 0x6a6c70 });
    k.chair(s - 0.55, ZF + 1.9, Math.PI / 2, 0x6a6c70, { legs: 0x4a4c50 });
    k.chair(s + 0.55, ZF + 1.9, -Math.PI / 2, 0x6a6c70, { legs: 0x4a4c50 });
  }
  // arriba: la balconada blanca con las ventanas
  k.box(L / 2, 3.35, ZF + 0.4, L - 1.0, 0.12, 0.8, 0xe8e6e0);
  k.box(L / 2, 4.3, ZF + 0.78, L - 1.0, 0.05, 0.05, 0xf4f4f0);
  for (let s = 0.6; s < L - 0.5; s += 0.14) k.box(s, 3.45, ZF + 0.78, 0.025, 0.85, 0.025, 0xf4f4f0);
  for (const s of [2.5, 5.2, 7.9]) hueco(k, s, 3.5, 1.2, 1.9, canvasTex(72, 114, cristales('#f2f2ee', 2)), { borde: 0xe2e0da, z: ZF });
}

/** una cara lisa de la cafetería, con una ventana */
function cafeteriaLado(k, L) {
  pared(k, 0, L, 6.6, (g, w, h) => { g.fillStyle = '#f0f0ec'; g.fillRect(0, 0, w, h); });
  k.box(L / 2, 6.6, ZF - 0.12, L, 0.5, 0.24, BLANCO);
  hueco(k, L / 2, 3.8, 1.1, 1.2, canvasTex(66, 72, cristales('#f2f2ee', 2)), { borde: 0xe2e0da, z: ZF });
}

/** se monta con lo demás */
export function buildShellAltavista(scene, colliders, map) {
  if (!map?.shellAltavista) return null;
  const grupos = [];
  const montar = (M, nombre, hacer) => { const k = new Kit(); hacer(k); grupos.push(enMarco(k, M, nombre, colliders)); };
  montar(K, 'shellAltavista', marquesina);
  montar(TI, 'shellAltavistaTienda', tienda);
  montar(CW, 'cafeteriaParqueLimpieza', cafeteria);
  montar(CN, 'cafeteriaParqueLimpiezaNorte', (k) => cafeteriaLado(k, CN.len));
  montar(CS, 'cafeteriaParqueLimpiezaSur', (k) => cafeteriaLado(k, CS.len));
  for (const g of grupos) scene.add(g);
  const suelo = paveMesh(trocear(polyTris(PATIO), 1.5), 0.2, hormigon(), 0xffffff);
  if (suelo) { suelo.name = 'shellAltavistaSuelo'; scene.add(suelo); }
  return { grupos, suelo };
}
