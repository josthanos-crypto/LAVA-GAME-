import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alzarEdificio, cristales, medianera } from './edificioReal.js';

/**
 * La Farmacia Los Robles, en la Rambla Medular 85, pegada al edificio de oficinas del 75 al 83 (src/ramblaMedular75.js),
 * con las vistas de la calle de Google de julio de 2025 (solo se miran, no van dentro del juego; la gente no se pone y
 * la cara del cartel del escaparate tampoco). La casa amarilla de la izquierda, el bajo y dos plantas (10,8 m) con el
 * remate escalonado de lo alto, las ventanitas redondas del lado, las dos puertaventanas con su balconcito de
 * barandilla negra y, en el bajo, la puerta marrón del portal 83, la entrada de la farmacia con las estanterías dentro,
 * el escaparate del 85 y las letras verdes de «FARMACIA» encima; a su lado, el cuerpo bajo de una planta color piedra
 * con las letras verdes grandes de «Farmacia Los Robles», la cruz verde de bandera, los dos escaparates amarillos con
 * los pájaros de papel y los frascos, el cajetín y el telefonillo; y después, el portal 87 con su puerta blanca y el
 * marco de azulejo negro, y el edificio beis de los balcones con el despacho de abogados de cristal azul en el bajo
 * (sin el nombre ni el logotipo). Por encima del cuerpo bajo asoman las paredes lisas de las casas de detrás.
 */

// la acera de la Rambla: el final del edificio de oficinas (FIN), la esquina de la manzana (P1) y el punto siguiente
const FIN = [-884.0, -321.2], P0 = [-878.48, -324.49], P1 = [-893.31, -315.77], P2 = [-910.32, -303.97];
const A = marco(FIN, P1), B = marco(P1, P2);
const Z = 0.12, ZF = Z + 0.3, YB = 4.0, AMARILLO = 0xe0c890, PIEDRA = 0xcfc4b4, BEIS = 0xd8ccb8;
// la casa amarilla de s 0 a 6,5 en A; el cuerpo bajo de 6,5 al final de A y hasta 3,7 en B; el edificio beis después
const AM1 = 6.5, BAJO_B = 3.7, BE1 = 11.2, FONDO = 12, FONDO_BAJO = 11;

/** antes de levantar la ciudad: el cuerpo bajo como muesca en la manzana, y las dos casas a su altura */
export function tuneFarmaciaLosRobles(map) {
  if (!Array.isArray(map?.buildings)) return;
  map.farmaciaLosRobles = true;
  const r = q => [+q[0].toFixed(2), +q[1].toFixed(2)];
  const cerca = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.05;
  // la manzana de la Rambla Medular 75 (si está): en la esquina P1 se le hace la muesca del cuerpo bajo
  const man = map.buildings.find(b => b.edificioReal && Array.isArray(b.p) && b.p.some(q => cerca(q, P1)) && b.p.some(q => cerca(q, P0)));
  if (man) {
    const i = man.p.findIndex(q => cerca(q, P1));
    // la esquina de dentro: el punto de P1 metido FONDO_BAJO metros, por la bisectriz de las dos caras
    const nA = [A.N[0], A.N[1]], nB = [B.N[0], B.N[1]];
    let v = [nA[0] + nB[0], nA[1] + nB[1]];
    const l = Math.hypot(v[0], v[1]);
    v = [v[0] / l, v[1] / l];
    const c = v[0] * nA[0] + v[1] * nA[1];
    const dentro = [P1[0] - (v[0] * FONDO_BAJO) / c, P1[1] - (v[1] * FONDO_BAJO) / c];
    const muesca = [A.W(AM1, 0), A.W(AM1, -FONDO_BAJO), dentro, B.W(BAJO_B, -FONDO_BAJO), B.W(BAJO_B, 0)].map(r);
    man.p.splice(i, 1, ...muesca);
    const bajo = [A.W(AM1, 0), P1, B.W(BAJO_B, 0), B.W(BAJO_B, -FONDO_BAJO), dentro, A.W(AM1, -FONDO_BAJO)].map(r);
    bajo.push(bajo[0].slice());
    map.buildings.push({ p: bajo, h: 4.6, k: 'gen', s: 0, c: [207, 196, 180], edificioReal: true });
  }
  alzarEdificio(map, A, 0, AM1, FONDO, 10.8, [224, 200, 144]);
  alzarEdificio(map, B, BAJO_B, BE1, FONDO, 11.0, [216, 204, 184]);
}

// ——— lo que se pinta en lienzo ———

/** las letras verdes de «Farmacia Los Robles», en letra redonda, la segunda parte más clara */
function letrasRobles(g, w, h) {
  g.fillStyle = '#cfc4b4';
  g.fillRect(0, 0, w, h);
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  g.font = `700 ${Math.round(h * 0.7)}px "Trebuchet MS", Arial, sans-serif`;
  g.lineWidth = 3;
  g.strokeStyle = '#0e5a2a';
  g.fillStyle = '#1e9a46';
  g.strokeText('Farmacia', w * 0.02, h * 0.5);
  g.fillText('Farmacia', w * 0.02, h * 0.5);
  const x = w * 0.02 + g.measureText('Farmacia').width;
  g.fillStyle = '#5ac83a';
  g.strokeText('LosRobles', x, h * 0.5);
  g.fillText('LosRobles', x, h * 0.5);
}

/** la banda de «FARMACIA» en verde, en letras separadas */
function letrasFarmacia(g, w, h) {
  g.fillStyle = '#e0c890';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#1e7a3a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(h * 0.8)}px Arial, sans-serif`;
  g.fillText('F A R M A C I A', w / 2, h * 0.55, w * 0.96);
}

/** la cruz verde de la farmacia */
function cruz(g, w, h) {
  g.fillStyle = '#1a1a1a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#2ac85a';
  g.fillRect(w * 0.36, h * 0.1, w * 0.28, h * 0.8);
  g.fillRect(w * 0.1, h * 0.36, w * 0.8, h * 0.28);
}

/** un escaparate amarillo de la farmacia: los frascos, las cajas y los pájaros de papel (sin caras) */
function escaparate(g, w, h) {
  g.fillStyle = '#e8d070';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4f0e4';
  g.fillRect(0, h * 0.72, w, h * 0.28);
  let s = 13;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 9; i++) {
    const x = w * (0.08 + r() * 0.84), y = h * (0.1 + r() * 0.4);
    g.fillStyle = ['#e85a3a', '#3a8ad8', '#f0a030', '#6ac85a'][i % 4];
    g.beginPath(); g.ellipse(x, y, w * 0.035, h * 0.025, -0.3, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(x - w * 0.03, y); g.lineTo(x - w * 0.07, y - h * 0.03); g.lineTo(x - w * 0.05, y + h * 0.01); g.fill();
  }
  for (let i = 0; i < 7; i++) {
    const x = w * (0.15 + i * 0.11), hh = h * (0.12 + r() * 0.12);
    g.fillStyle = i % 2 ? '#f4f4f4' : '#4a8ad0';
    g.fillRect(x, h * 0.72 - hh, w * 0.06, hh);
  }
  g.strokeStyle = '#2a2a2a';
  g.lineWidth = 6;
  g.strokeRect(3, 3, w - 6, h - 6);
}

/** la entrada de la farmacia: las estanterías blancas con las cajas de colores */
function entrada(g, w, h) {
  g.fillStyle = '#e8e4da';
  g.fillRect(0, 0, w, h);
  for (let y = h * 0.15; y < h * 0.85; y += h * 0.14) {
    g.fillStyle = '#c8c0b0';
    g.fillRect(0, y, w, 3);
    for (let x = 4; x < w - 8; x += 9) { g.fillStyle = ['#e85a5a', '#5a9ad8', '#f0c040', '#f4f4f4'][(x + y) % 4 | 0]; g.fillRect(x, y - h * 0.08, 7, h * 0.08); }
  }
  g.fillStyle = '#b89a6a';
  g.fillRect(0, h * 0.85, w, h * 0.15);
  g.strokeStyle = '#2a2a2a';
  g.lineWidth = 6;
  g.strokeRect(3, 3, w - 6, h - 6);
}

/** la puerta marrón del portal 83 */
function puertaMarron(g, w, h) {
  g.fillStyle = '#4a2a20';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#32180f';
  g.lineWidth = 4;
  for (const y of [0.08, 0.5]) g.strokeRect(w * 0.15, h * y, w * 0.7, h * 0.36);
}

/** la puerta blanca del portal 87, con los cuarterones */
function puertaBlanca(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#cfcfca';
  g.lineWidth = 4;
  g.beginPath(); g.arc(w / 2, h * 0.22, w * 0.28, Math.PI, 0); g.stroke();
  for (const y of [0.35, 0.6]) g.strokeRect(w * 0.18, h * y, w * 0.64, h * 0.2);
}

/** el despacho de abogados: el cristal con la banda azul (sin el nombre ni el logotipo) */
function despacho(g, w, h) {
  g.fillStyle = '#3a4a58';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.14)';
  g.fillRect(0, 0, w * 0.35, h);
  g.fillStyle = '#1e3a9a';
  g.fillRect(w * 0.1, h * 0.12, w * 0.32, h * 0.76);
  g.fillStyle = '#f4f4f0';
  for (let y = h * 0.35; y < h * 0.8; y += h * 0.06) g.fillRect(w * 0.14, y, w * 0.18, 2);
}

/** la banda azul de encima del despacho */
function bandaDespacho(g, w, h) {
  g.fillStyle = '#1e3a9a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8c860';
  g.fillRect(0, h * 0.08, w, 3);
  g.fillStyle = '#f4f4f0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 700 ${Math.round(h * 0.34)}px Arial, sans-serif`;
  g.fillText('DESPACHO DE ABOGADOS', w / 2, h * 0.6, w * 0.9);
}

// ——— las piezas ———

/** la casa amarilla: el bajo de la farmacia, las dos plantas con sus balcones y el remate escalonado */
function casaAmarilla(k) {
  const c = AM1 / 2, TE = 10.8;
  k.box(c, 0, Z + 0.15, AM1, TE, 0.3, AMARILLO);
  k.block(c, Z + 0.15, AM1, 0.3);
  k.box(c, 0, ZF + 0.01, AM1, 3.3, 0.02, 0xd8d0c0);
  // el portal 83, la entrada de la farmacia y el escaparate del 85, con la tira de madera encima
  k.pic(0.8, 1.15, ZF + 0.025, 0.95, 2.3, 0, 1, canvasTex(60, 140, puertaMarron));
  k.pic(2.75, 1.25, ZF + 0.025, 1.7, 2.5, 0, 1, canvasTex(120, 170, entrada), { glow: 0.2 });
  k.pic(4.85, 1.35, ZF + 0.025, 2.0, 2.3, 0, 1, canvasTex(140, 160, escaparate), { glow: 0.1 });
  k.box(c, 2.62, ZF + 0.06, AM1, 0.1, 0.1, 0xb07a4a);
  k.pic(3.4, 3.15, ZF + 0.03, 4.2, 0.4, 0, 1, canvasTex(420, 40, letrasFarmacia));
  // las ventanitas redondas del lado
  for (const y of [5.0, 7.5, 9.8]) {
    k.cyl(0.75, y, ZF + 0.01, 0.32, 0.32, 0.04, 0xf0eee8, { rx: Math.PI / 2, seg: 16 });
    k.cyl(0.75, y, ZF + 0.04, 0.24, 0.24, 0.02, 0x4a5866, { rx: Math.PI / 2, seg: 16 });
  }
  // las dos puertaventanas con el balconcito de losa y la barandilla negra
  for (const [y, w] of [[4.0, 3.4], [7.3, 2.6]]) {
    k.pic(3.6, y + 1.15, ZF + 0.012, w - 0.4, 2.1, 0, 1, canvasTex(160, 120, cristales('#f2f2ee', 4, 'rgba(210,210,214,.6)')));
    k.box(3.6, y - 0.35, ZF + 0.35, w + 0.4, 0.3, 0.7, 0xe8d8a8);
    k.box(3.6, y + 0.85, ZF + 0.62, w + 0.3, 0.04, 0.04, 0x1a1a1a);
    for (let x = 3.6 - w / 2 - 0.1; x <= 3.6 + w / 2 + 0.11; x += 0.12) k.box(x, y - 0.05, ZF + 0.62, 0.02, 0.9, 0.02, 0x1a1a1a);
  }
  // el remate escalonado de lo alto
  k.box(c, TE - 1.2, ZF + 0.05, AM1 - 0.6, 0.12, 0.1, 0xe8d8a8);
  k.box(c, TE - 0.7, ZF + 0.08, AM1 - 1.0, 0.12, 0.14, 0xe8d8a8);
  k.box(c, TE, Z + 0.15, AM1 - 1.6, 0.5, 0.3, AMARILLO);
  // la pared lisa del lado del cuerpo bajo y la de detrás
  medianera(k, AM1 + 0.07, 4.6, TE, FONDO, Z, 0xe8ddc0);
  k.box(c, 8.2, -FONDO - 0.07, AM1, TE - 8.2, 0.12, 0xe8ddc0);
}

/** el cuerpo bajo de la farmacia, de AM1 hasta el final de A: las letras, la cruz y el primer escaparate */
function bajoA(k) {
  const s0 = AM1, s1 = A.len, c = (s0 + s1) / 2, L = s1 - s0;
  k.box(c, 0, Z + 0.15, L, 4.6, 0.3, PIEDRA);
  k.block(c, Z + 0.15, L, 0.3);
  k.box(c, 2.62, ZF + 0.06, L, 0.1, 0.1, 0xb07a4a);
  k.pic(s0 + 2.1, 1.45, ZF + 0.025, 2.4, 2.2, 0, 1, canvasTex(170, 160, escaparate), { glow: 0.1 });
  k.box(s0 + 3.9, 1.0, ZF + 0.03, 0.22, 0.55, 0.05, 0xb8b8b4);
  k.box(s1 - 0.6, 0.6, ZF + 0.04, 0.55, 0.8, 0.08, 0xe8e6e0);
  // la cruz verde de bandera, con su brazo
  k.box(s0 + 0.35, 2.9, ZF + 0.3, 0.06, 0.06, 0.6, 0x2a2a2a);
  k.pic(s0 + 0.35, 3.0, ZF + 0.65, 0.7, 0.7, 1, 0, canvasTex(64, 64, cruz), { glow: 0.6 });
  k.pic(s0 + 0.35, 3.0, ZF + 0.65, 0.7, 0.7, -1, 0, canvasTex(64, 64, cruz), { glow: 0.6 });
  k.box(s0 + 0.35, 1.4, ZF + 0.06, 0.1, 2.7, 0.06, 0x1e5a2e);
  // las letras grandes, que siguen en el tramo de B
  k.pic(c + 0.4, 3.45, ZF + 0.03, L - 0.4, 0.95, 0, 1, canvasTex(Math.round(L * 80), 80, (g, w, h) => {
    letrasRobles(g, (w * (L + BAJO_B - 0.4)) / (L - 0.4), h);
  }));
  // el pretil y la pared lisa de detrás, por encima del cuerpo bajo
  k.box(c, 4.45, ZF + 0.02, L, 0.15, 0.06, 0xbfb4a4);
}

/** el resto del cuerpo bajo en B, el portal 87 y el edificio beis con el despacho de abogados */
function tramoB(k) {
  const L = BAJO_B;
  k.box(L / 2, 0, Z + 0.15, L, 4.6, 0.3, PIEDRA);
  k.block(L / 2, Z + 0.15, L, 0.3);
  k.box(L / 2, 2.62, ZF + 0.06, L, 0.1, 0.1, 0xb07a4a);
  k.pic(1.65, 1.45, ZF + 0.025, 2.6, 2.2, 0, 1, canvasTex(180, 160, escaparate), { glow: 0.1 });
  k.box(L / 2, 4.45, ZF + 0.02, L, 0.15, 0.06, 0xbfb4a4);
  // la segunda parte de las letras verdes, cortadas del mismo letrero que empieza en A
  const LA = A.len - AM1 - 0.4;
  k.pic(L / 2 - 0.2, 3.45, ZF + 0.03, L - 0.4, 0.95, 0, 1, canvasTex(Math.round(L * 80), 80, (g, w, h) => {
    const total = (w * (LA + L - 0.4)) / (L - 0.4);
    g.translate(-(total - w), 0);
    letrasRobles(g, total, h);
  }));
  // el edificio beis de los balcones
  const s0 = BAJO_B, c = (s0 + BE1) / 2, W = BE1 - s0, TE = 11.0;
  k.box(c, 0, Z + 0.15, W, TE, 0.3, BEIS);
  k.block(c, Z + 0.15, W, 0.3);
  // el portal 87 con el marco de azulejo negro, el despacho de abogados y su banda azul
  k.box(s0 + 0.85, 0, ZF + 0.02, 1.5, 2.8, 0.05, 0x1e1e20);
  k.pic(s0 + 0.85, 1.2, ZF + 0.05, 1.0, 2.4, 0, 1, canvasTex(60, 144, puertaBlanca));
  k.pic(s0 + 4.6, 1.5, ZF + 0.025, 5.6, 2.5, 0, 1, canvasTex(300, 140, despacho));
  k.box(s0 + 4.6, 2.85, ZF + 0.06, 5.8, 0.75, 0.08, 0x1e3a9a);
  k.pic(s0 + 4.6, 3.22, ZF + 0.101, 5.8, 0.75, 0, 1, canvasTex(400, 52, bandaDespacho));
  // las dos plantas: el cuerpo de cristal que sale con su losa y las ventanas de al lado
  for (const y of [YB + 0.5, YB + 3.6]) {
    k.box(s0 + 3.5, y - 0.3, ZF + 0.4, 4.6, 0.3, 0.8, 0xc8b8a0);
    k.pic(s0 + 3.5, y + 0.95, ZF + 0.012, 4.2, 1.8, 0, 1, canvasTex(210, 90, cristales('#f2f2ee', 4, 'rgba(225,225,228,.55)')));
    k.pic(s0 + 6.8, y + 0.95, ZF + 0.012, 0.9, 1.8, 0, 1, canvasTex(54, 108, cristales('#f2f2ee', 1, 'rgba(225,225,228,.55)')));
  }
  k.box(c, TE - 0.2, ZF + 0.03, W, 0.2, 0.08, 0xc8b8a0);
  // las paredes lisas de los lados que asoman por encima de las casas de al lado, y la de detrás
  medianera(k, s0 - 0.07, 4.6, TE, FONDO, Z, 0xe0d4c0);
  medianera(k, BE1 + 0.07, 8.2, TE, FONDO, Z, 0xe0d4c0);
  k.box(c, 8.2, -FONDO - 0.07, W, TE - 8.2, 0.12, 0xe0d4c0);
}

/** se monta con lo demás de Arrecife Centro */
export function buildFarmaciaLosRobles(scene, colliders, map) {
  if (!map?.farmaciaLosRobles) return null;
  const ka = new Kit();
  casaAmarilla(ka);
  bajoA(ka);
  const ga = enMarco(ka, A, 'farmaciaLosRobles', colliders);
  scene.add(ga);
  const kb = new Kit();
  tramoB(kb);
  const gb = enMarco(kb, B, 'farmaciaLosRoblesB', colliders);
  scene.add(gb);
  return { group: ga, b: gb };
}
