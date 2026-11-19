import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, trocear, sueloTex } from './restaurantesCharco.js';
import { paveMesh, polyTris, picon } from './suelos.js';

/**
 * La gasolinera Plenergy Arrecife I (de bajo coste), en el solar del triángulo entre León y Castillo, Blasco Ibáñez y el
 * paseo de Calderón de la Barca (Altavista), con las vistas de la calle de Google de julio de 2025 desde cinco sitios y
 * las fotos del sitio de noviembre de 2025 (solo se miran, no van dentro del juego). Es nueva: la foto aérea del juego
 * (y la de Google y la de GRAFCAN) todavía tienen ahí el aparcamiento de tierra, y el mapa le ponía una gasolinera de
 * las genéricas, que se quita. De verdad:
 * - todo el solar es ahora la explanada de hormigón gris claro, con las plazas de aparcar pintadas por el lado de Blasco
 *   Ibáñez y la salida a esa calle;
 * - la marquesina blanca, de unos 9 × 20 m, a lo largo (medida con las vistas de la calle), con seis pilares blancos,
 *   tres isletas con su surtidor, las luces de debajo, el nombre «Plenergy» en gris oscuro por el lado de León y Castillo
 *   y los dos discos negros en las esquinas de ese lado;
 * - la caseta blanca de cobro al lado oeste de la marquesina, con «Plenergy» hacia Blasco Ibáñez y las dos máquinas de
 *   pagar hacia la explanada; la valla blanca de chapa al sur de la caseta, y el talud de picón negro con la valla de
 *   malla por fuera;
 * - el muro bajo blanco con la malla encima a lo largo del paseo, el bordillo blanco por León y Castillo, el poste de los
 *   precios (los de la foto), la flecha azul de la entrada, la caja negra de la esquina y, en la punta del sur, el
 *   jardín de picón con los cactus.
 */

// la marquesina: s de oeste a este (0 a 9,07) y z de su lado sur (0) hacia el norte (negativo, hasta −20,1)
const C = marco([273.4, -825.2], [282.4, -824.1]);
const ANCHO = 9.07, LARGO = 20.1, ALTO = 5.0, CANTO = 1.0;
const BLANCO = 0xf4f4f2, OSCURO = 0x3c3f44;
// el suelo: la explanada, el talud de picón del noroeste y el jardín de la punta del sur (en metros del mapa)
const PATIO = [[272.3, -850.3], [296.7, -844.7], [291.45, -824.85], [288.0, -808.0], [278.8, -808.0], [268.7, -828.5], [271.3, -828.5], [271.8, -836.9], [271.8, -842.8]];
const TALUD = [[256.8, -853.7], [272.3, -850.3], [271.8, -842.8], [271.8, -836.9], [271.3, -828.5], [268.7, -828.5], [262.1, -841.8], [258.0, -851.0]];
const JARDIN = [[278.8, -808.0], [288.0, -808.0], [286.8, -802.0], [285.2, -795.0]];

/** antes de levantar la ciudad: se quita la gasolinera genérica del mapa y se marca la de verdad */
export function tunePlenergyAltavista(map) {
  if (Array.isArray(map.fuel)) map.fuel = map.fuel.filter(f => !(/plenergy/i.test(f.brand || '') && Math.hypot(f.x - 275.8, f.z + 824.3) < 15));
  map.plenergyAltavista = true;
}

/** letras gris oscuro sobre el blanco (o sobre el fondo que se diga) */
function letras(texto, color = '#3c3f44', fondo = '#f4f4f2') {
  return (g, w, h) => {
    g.fillStyle = fondo;
    g.fillRect(0, 0, w, h);
    g.fillStyle = color;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `800 ${Math.round(h * 0.78)}px "Arial Rounded MT Bold", "Arial Black", Arial, sans-serif`;
    g.fillText(texto, w / 2, h * 0.54, w * 0.96);
  };
}

/** la pantalla del surtidor: negra con la raya roja encendida (sin números) */
function pantalla(g, w, h) {
  g.fillStyle = '#16181a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8302a';
  for (let i = 0; i < 3; i++) g.fillRect(w * (0.12 + i * 0.27), h * 0.42, w * 0.2, h * 0.16);
  g.fillStyle = '#3ac25a';
  g.fillRect(w * 0.86, h * 0.2, w * 0.06, h * 0.14);
}

/** la pantallita de la máquina de pagar */
function pantallaPago(g, w, h) {
  g.fillStyle = '#20364a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#4a8ac8';
  g.fillRect(w * 0.08, h * 0.1, w * 0.84, h * 0.2);
  g.fillStyle = '#c8d8e8';
  for (let y = 0.42; y < 0.9; y += 0.16) g.fillRect(w * 0.12, h * y, w * 0.6, h * 0.06);
}

/** el poste de los precios: arriba el nombre y debajo los dos precios rojos de la foto */
function precios(g, w, h) {
  g.fillStyle = '#6a6e72';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4f4f2';
  g.fillRect(w * 0.06, h * 0.04, w * 0.88, h * 0.2);
  g.fillStyle = '#3c3f44';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(h * 0.11)}px "Arial Rounded MT Bold", "Arial Black", Arial, sans-serif`;
  g.fillText('Plenergy', w / 2, h * 0.145, w * 0.84);
  for (const [y, p] of [[0.36, '1.079'], [0.6, '1.089']]) {
    g.fillStyle = '#121314';
    g.fillRect(w * 0.08, h * (y - 0.09), w * 0.84, h * 0.18);
    g.fillStyle = '#ff3a2a';
    g.font = `700 ${Math.round(h * 0.13)}px "Courier New", monospace`;
    g.fillText(p, w / 2, h * y, w * 0.8);
  }
}

/** la flecha blanca de la señal azul */
function flecha(g, w, h) {
  g.fillStyle = '#1f5fb8';
  g.beginPath();
  g.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#ffffff';
  g.lineWidth = w * 0.06;
  g.beginPath();
  g.arc(w / 2, h / 2, w * 0.45, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = '#ffffff';
  g.translate(w / 2, h / 2);
  g.rotate(-Math.PI * 0.75);
  g.fillRect(-w * 0.06, -h * 0.05, w * 0.12, h * 0.32);
  g.beginPath();
  g.moveTo(-w * 0.2, -h * 0.05);
  g.lineTo(w * 0.2, -h * 0.05);
  g.lineTo(0, -h * 0.3);
  g.closePath();
  g.fill();
}

/** la chapa blanca ondulada de la valla, de rayas tumbadas */
function chapa(g, w, h) {
  g.fillStyle = '#eceeec';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c9ccca';
  for (let y = 4; y < h; y += 10) g.fillRect(0, y, w, 3);
}

/** el hormigón gris claro de la explanada, con las juntas cada 6 m */
function hormigon() {
  return sueloTex(256, 6, (g, r, n) => {
    g.fillStyle = '#c6c5c0';
    g.fillRect(0, 0, n, n);
    for (let i = 0; i < 3000; i++) {
      const v = 175 + r() * 50;
      g.fillStyle = `rgb(${Math.round(v)},${Math.round(v - 1)},${Math.round(v - 5)})`;
      g.fillRect(r() * n, r() * n, 1 + r() * 2, 1 + r() * 2);
    }
    for (let i = 0; i < 6; i++) {
      g.fillStyle = 'rgba(90,85,80,0.06)';
      g.beginPath();
      g.arc(r() * n, r() * n, 10 + r() * 30, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = 'rgba(80,80,78,0.55)';
    g.fillRect(0, 0, n, 1.5);
    g.fillRect(0, 0, 1.5, n);
  });
}

/** un disco negro con el aro blanco, de canto hacia el este y el oeste */
function disco(k, s, y, z, r) {
  for (const [rr, g, hex] of [[r, 0.1, 0x1e2124], [r * 0.8, 0.12, 0xf4f4f2], [r * 0.68, 0.14, 0x1e2124]]) {
    k.cyl(s - g / 2, y, z, rr, rr, g, hex, { rx: Math.PI / 2, ry: Math.PI / 2, seg: 28 });
  }
}

/** un surtidor, con sus dos caras hacia los coches (norte y sur) */
function surtidor(k, s, z) {
  k.box(s, 0.2, z, 1.0, 2.15, 0.5, 0xe6e8ea);
  for (const lado of [-1, 1]) {
    k.box(s, 0.85, z + lado * 0.26, 0.8, 0.9, 0.03, 0x4a4e54);
    k.pic(s, 1.95, z + lado * 0.265, 0.8, 0.32, 0, lado, canvasTex(160, 64, pantalla), { glow: 0.5 });
  }
  k.box(s, 2.35, z, 1.06, 0.2, 0.56, OSCURO);
  for (const ds of [-0.53, 0.53]) {
    k.box(s + ds, 0.9, z, 0.06, 1.0, 0.3, 0x1e1e20);
    k.box(s + ds * 1.08, 0.5, z, 0.05, 0.9, 0.05, 0x1e1e20);
  }
}

/** la marquesina con sus pilares, las luces, las isletas con los surtidores, el nombre y los discos */
function marquesina(k) {
  const cs = ANCHO / 2, cz = -LARGO / 2;
  k.box(cs, ALTO, cz, ANCHO, CANTO, LARGO, BLANCO);
  k.box(cs, ALTO + CANTO, cz, ANCHO - 0.3, 0.06, LARGO - 0.3, 0xd8d8d4);
  for (let s = 1.5; s < ANCHO - 1; s += 3) for (let z = -2.2; z > -LARGO + 1; z -= 3.4) k.box(s, ALTO - 0.03, z, 1.2, 0.03, 0.6, 0xffffff, { list: k.glow });
  for (const z of [-3, -10, -17]) {
    for (const s of [0.8, 8.3]) {
      k.box(s, 0, z, 0.4, ALTO, 0.4, BLANCO);
      k.block(s, z, 0.45, 0.45);
    }
    k.box(cs, 0, z, 6.7, 0.2, 1.1, 0xb8b8b4);
    k.box(cs, 0.2, z, 6.7, 0.02, 1.1, 0xd4d4d0);
    k.block(cs, z, 6.7, 1.1);
    surtidor(k, cs, z);
  }
  // el nombre por el lado de León y Castillo, hacia el norte, y los discos de las dos esquinas de ese lado
  k.pic(ANCHO + 0.01, ALTO + 0.5, -13.5, 6.2, 0.82, 1, 0, canvasTex(620, 82, letras('Plenergy')));
  for (const z of [-0.6, -LARGO + 0.6]) {
    k.box(ANCHO - 0.6, ALTO + CANTO, z, 0.12, 0.7, 0.12, 0x9a9ea2);
    disco(k, ANCHO - 0.6, ALTO + CANTO + 1.3, z, 0.65);
  }
}

/** la caseta de cobro, al oeste de la marquesina */
function caseta(k) {
  const s0 = -3.4, s1 = -0.4, z0 = -17.3, z1 = -11.8, cs = (s0 + s1) / 2, cz = (z0 + z1) / 2;
  k.box(cs, 0, cz, s1 - s0, 3.0, z1 - z0, BLANCO);
  k.box(cs, 3.0, cz, s1 - s0 + 0.12, 0.15, z1 - z0 + 0.12, 0xe2e2de);
  k.block(cs, cz, s1 - s0, z1 - z0);
  k.pic(s0 - 0.005, 2.05, cz, 4.4, 0.9, -1, 0, canvasTex(440, 90, letras('Plenergy')));
  for (const s of [cs - 0.7, cs + 0.7]) {
    k.box(s, 0, z1 + 0.15, 0.7, 1.75, 0.3, 0x5a5e64);
    k.pic(s, 1.35, z1 + 0.31, 0.5, 0.36, 0, 1, canvasTex(100, 72, pantallaPago), { glow: 0.35 });
    k.box(s, 0.95, z1 + 0.32, 0.3, 0.1, 0.04, 0x222428);
  }
  k.box(cs, 0, z0 - 0.03, 0.9, 2.1, 0.05, 0xb8bcc0);
}

/** el poste de los precios, la flecha de la entrada y la caja negra de la esquina (pasados al marco de la marquesina) */
function sueltos(k) {
  // el poste de los precios, por León y Castillo, con su parterre de picón
  k.box(19.07, 0, -5.45, 1.6, 0.25, 1.2, 0x2b2927);
  k.box(19.07, 0, -5.45, 0.35, 4.6, 1.3, 0x6a6e72);
  for (const lado of [-1, 1]) k.pic(19.07 + lado * 0.18, 2.6, -5.45, 1.2, 3.6, lado, 0, canvasTex(120, 360, precios), { glow: 0.3 });
  k.block(19.07, -5.45, 0.4, 1.3);
  // la señal azul de la entrada
  k.cyl(18.27, 0, -13.6, 0.04, 0.04, 2.2, 0x9aa0a4, { seg: 8 });
  k.pic(18.27 + 0.05, 2.0, -13.6, 0.6, 0.6, 1, 0, canvasTex(120, 120, flecha));
  k.block(18.27, -13.6, 0.2, 0.2);
  // la caja negra de la esquina, en su isleta blanca
  k.box(13.42, 0, 8.53, 1.2, 0.15, 2.4, 0xe8e8e4);
  k.box(13.42, 0.15, 8.53, 0.6, 1.9, 0.45, 0x1e1f22);
  k.pic(13.42 - 0.31, 1.45, 8.53, 0.3, 0.2, -1, 0, canvasTex(60, 40, pantallaPago), { glow: 0.3 });
  k.block(13.42, 8.53, 1.2, 2.4);
}

/** un tramo de valla o de muro entre dos puntos del mapa */
function tramo(A, B, nombre, colliders, hacer) {
  const M = marco(A, B), k = new Kit();
  hacer(k, M.len);
  return enMarco(k, M, nombre, colliders);
}

/** la valla blanca de chapa, de 2 m, con sus postes */
function vallaChapa(k, L) {
  k.box(L / 2, 0, 0, L, 2.0, 0.05, 0xeceeec);
  for (const n of [1, -1]) k.pic(L / 2, 1.0, n * 0.03, L, 2.0, 0, n, canvasTex(Math.max(64, Math.round(L * 40)), 80, chapa));
  for (let s = 0; s <= L + 0.01; s += 2.4) k.box(Math.min(s, L), 0, 0, 0.12, 2.05, 0.12, 0xf4f4f2);
  k.block(L / 2, 0, L, 0.15);
}

/** el muro bajo blanco con la malla encima (o la malla sola, si muro = 0) */
function muroMalla(k, L, muro = 0.9) {
  if (muro) {
    k.box(L / 2, 0, 0, L, muro, 0.25, BLANCO);
    k.box(L / 2, muro, 0, L + 0.04, 0.05, 0.3, 0xe2e2de);
  }
  const y0 = muro + 0.05, alto = 1.25;
  for (let s = 0; s <= L + 0.01; s += 2.5) k.box(Math.min(s, L), y0, 0, 0.05, alto, 0.05, 0x8a8e90);
  for (const y of [0.05, 0.45, 0.85, 1.22]) k.box(L / 2, y0 + y, 0, L, 0.02, 0.02, 0x9a9ea0);
  for (let s = 0.25; s < L; s += 0.5) k.box(s, y0, 0, 0.012, alto, 0.012, 0xa8acae);
  k.block(L / 2, 0, L, 0.3);
}

/** el bordillo blanco bajo */
function bordillo(k, L, alto = 0.55) {
  k.box(L / 2, 0, 0, L, alto, 0.3, BLANCO);
  k.block(L / 2, 0, L, 0.3);
}

/** los cactus del jardín de la punta: columnas y bolas doradas */
function cactus(k) {
  const pos = [[282.0, -804.0, 1.6], [284.6, -803.2, 1.1], [283.4, -799.6, 1.8], [285.4, -806.0, 1.3]];
  for (const [x, z, h] of pos) {
    k.cyl(x, 0.2, z, 0.16, 0.2, h, 0x4f7a3a, { seg: 9 });
    k.cyl(x + 0.25, 0.2 + h * 0.4, z, 0.1, 0.12, h * 0.4, 0x4f7a3a, { seg: 8 });
  }
  for (const [x, z] of [[280.6, -806.4], [286.6, -805.0], [284.2, -801.0], [282.8, -806.8]]) k.ball(x, 0.4, z, 0.3, 0xc8a83a, { sy: 0.8, seg: 10 });
}

/** se monta con lo demás */
export function buildPlenergyAltavista(scene, colliders, map) {
  if (!map?.plenergyAltavista) return null;
  const k = new Kit();
  marquesina(k);
  caseta(k);
  sueltos(k);
  const grupos = [enMarco(k, C, 'plenergyAltavista', colliders)];
  // las vallas y los muros
  grupos.push(tramo([271.3, -828.5], [271.8, -836.9], 'plenergyChapa', colliders, vallaChapa));
  grupos.push(tramo([270.9, -828.3], [271.7, -828.3], 'plenergyPilar', colliders, (kk) => {
    kk.box(0.4, 0, 0, 0.5, 1.4, 0.5, BLANCO);
    kk.box(0.4, 0.5, 0.27, 0.36, 0.45, 0.06, 0xb8bcc0);
    kk.block(0.4, 0, 0.5, 0.5);
  }));
  grupos.push(tramo([271.8, -842.8], [272.3, -850.3], 'plenergyMuroCaseta', colliders, (kk, L) => muroMalla(kk, L)));
  grupos.push(tramo([272.3, -850.25], [296.0, -844.86], 'plenergyMuroPaseo', colliders, (kk, L) => muroMalla(kk, L)));
  grupos.push(tramo([256.8, -853.7], [258.0, -851.0], 'plenergyMalla1', colliders, (kk, L) => muroMalla(kk, L, 0)));
  grupos.push(tramo([258.0, -851.0], [262.1, -841.8], 'plenergyMalla2', colliders, (kk, L) => muroMalla(kk, L, 0)));
  grupos.push(tramo([262.1, -841.8], [268.7, -828.5], 'plenergyMalla3', colliders, (kk, L) => muroMalla(kk, L, 0)));
  grupos.push(tramo([293.87, -834.0], [291.45, -824.85], 'plenergyBordillo1', colliders, bordillo));
  grupos.push(tramo([291.45, -824.85], [288.0, -808.0], 'plenergyBordillo2', colliders, bordillo));
  grupos.push(tramo([278.8, -808.0], [288.0, -808.0], 'plenergyJardin', colliders, (kk, L) => kk.box(L / 2, 0, 0, L, 0.2, 0.18, 0xd8d8d4)));
  // las plazas de aparcar pintadas por el lado de Blasco Ibáñez
  grupos.push(tramo([268.7, -828.5], [278.8, -808.0], 'plenergyPlazas', null, (kk) => {
    for (let s = 0.6; s < 21.5; s += 2.5) kk.box(s, 0.2, -2.75, 0.1, 0.02, 4.9, 0xf2f2f0);
  }));
  // los cactus, en metros del mapa
  const kc = new Kit();
  cactus(kc);
  grupos.push(kc.build('plenergyCactus').group);
  for (const g of grupos) scene.add(g);
  // los suelos: la explanada de hormigón, el talud de picón y el jardín de la punta
  const suelos = [
    ['plenergySuelo', PATIO, 0.2, hormigon(), 0xe0dfda],
    ['plenergyTalud', TALUD, 0.22, picon(), 0xffffff],
    ['plenergyJardinSuelo', JARDIN, 0.22, picon(), 0xffffff],
  ].map(([nombre, poly, y, tex, color]) => {
    const m = paveMesh(trocear(polyTris(poly), 1.5), y, tex, color);
    if (m) { m.name = nombre; scene.add(m); }
    return m;
  });
  return { grupos, suelos };
}
