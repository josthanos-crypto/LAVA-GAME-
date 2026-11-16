import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alturaBloque, alzarEdificio, cristales } from './edificioReal.js';

/**
 * El Centro de Salud de Valterra, en la calle Pérez Galdós 90 esquina a Cáceres, con las vistas de la calle de Google
 * de julio de 2025 y la foto aérea (solo se miran, no van dentro del juego; la gente no se pone). El mapa ya tenía su
 * bloque con la forma buena (las dos alas y la plaza de la entrada metida en medio), pero gris oscuro, de 9 m y con
 * ventanas de pisos. De verdad es un edificio de dos plantas color arena con rayas horizontales: arriba, las ventanas
 * estrechas y altas metidas en la pared; abajo, en el ala de Cáceres, las rejillas altas de lamas marrones con marco
 * blanco, y en el ala del sur, la oficina de la Seguridad Social con los ventanales de cristal verde, la persiana gris
 * y su banda blanca. En la plaza, el muro bajo con la verja negra y la puerta, el quiosco verde, los parterres con
 * cactus y palmeras, y al fondo el cuerpo de tres plantas con las ventanas de dos en dos y la entrada de cristal de
 * marco azul. En la acera del ala del sur, las palmeras grandes.
 */

// las caras del bloque del mapa (cada una con N hacia fuera): el ala de Cáceres por Pérez Galdós, los tres lados de la
// plaza (el del ala de Cáceres, el del fondo y el del ala del sur), el ala del sur por Pérez Galdós y la cara de Cáceres
const NORTE = marco([512.54, -498.02], [501.68, -479.09]);
const PLAZA_N = marco([501.68, -479.09], [517.8, -471.73]);
const FONDO = marco([517.8, -471.73], [506.93, -450.69]);
const PLAZA_S = marco([506.93, -450.69], [490.81, -459.81]);
const SUR = marco([490.81, -459.81], [475.03, -433.16]);
const CACERES = marco([538.85, -483.65], [512.54, -498.02]);
// la boca de la plaza, en la línea de la fachada de Pérez Galdós (del ala de Cáceres al ala del sur)
const BOCA = marco([501.68, -479.09], [490.81, -459.81]);
const Z = 0.12, ZF = Z + 0.3, H = 8.4, HF = 11.2, ARENA = 0xcdb89e, ARENA_RGB = [205, 184, 158];
// las palmeras grandes de la acera del ala del sur
const PALMAS = [[4, 9.5, 0.6], [11, 8.2, 2.1], [13, 7.6, 1.2]].map(([s, h, r]) => [...SUR.W(16 + s, 2.6), h, r]);

/** antes de levantar la ciudad: el bloque a su altura y color, el cuerpo del fondo levantado y las palmeras */
export function tuneCentroSaludValterra(map) {
  if (!alturaBloque(map, 522, -484, H, ARENA_RGB)) return;
  map.centroSaludValterra = true;
  alzarEdificio(map, FONDO, 0, FONDO.len, 9, HF, [214, 198, 172]);
  map.extraPalms = map.extraPalms || [];
  map.extraPalms.push(...PALMAS);
}

// ——— lo que se pinta en lienzo ———

/** la pared color arena con las rayas horizontales */
function arena(g, w, h) {
  g.fillStyle = '#cdb89e';
  g.fillRect(0, 0, w, h);
  let s = 3;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(150,128,100,${0.05 + r() * 0.08})`; g.fillRect(r() * w, r() * h, 2 + r() * 6, 2 + r() * 6); }
  g.fillStyle = 'rgba(120,100,78,.45)';
  for (let y = h / 14; y < h; y += h / 14) g.fillRect(0, y, w, 1.5);
}

/** la rejilla alta de lamas marrones con su marco blanco */
function rejilla(g, w, h) {
  g.fillStyle = '#f0ece4';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#6a4a34';
  g.fillRect(4, 4, w - 8, h - 8);
  g.fillStyle = '#4a3222';
  for (let y = 7; y < h - 6; y += 5) g.fillRect(5, y, w - 10, 2);
}

/** la ventana estrecha de arriba, metida en la pared: el cristal oscuro con el marco gris */
function estrecha(g, w, h) {
  g.fillStyle = '#2e3638';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(160,190,200,.25)';
  g.fillRect(3, 3, w - 6, h * 0.4);
  g.strokeStyle = '#6a7272';
  g.lineWidth = 3;
  g.strokeRect(1.5, 1.5, w - 3, h - 3);
  g.beginPath(); g.moveTo(0, h * 0.55); g.lineTo(w, h * 0.55); g.stroke();
}

/** el ventanal de cristal verde de la oficina, con la cortina y los papeles pegados */
function verde(g, w, h) {
  g.fillStyle = '#6a8a72';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(220,235,220,.25)';
  for (let x = 6; x < w; x += 9) g.fillRect(x, 0, 3, h);
  g.fillStyle = '#f2f0e8';
  for (const [x, y] of [[0.2, 0.4], [0.27, 0.62], [0.7, 0.45]]) g.fillRect(w * x, h * y, w * 0.07, h * 0.18);
  g.strokeStyle = '#e8e8e4';
  g.lineWidth = 5;
  g.strokeRect(2.5, 2.5, w - 5, h - 5);
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
}

/** la banda blanca de la oficina de la Seguridad Social (sin el escudo) */
function bandaSS(g, w, h) {
  g.fillStyle = '#f2f0ea';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#3a3a3a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.42)}px Arial, sans-serif`;
  g.fillText('SEGURIDAD SOCIAL', w / 2, h * 0.52, w * 0.9);
}

/** la persiana gris de chapa */
function persiana(g, w, h) {
  g.fillStyle = '#9a9c9a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#7e807e';
  for (let y = 3; y < h; y += 5) g.fillRect(0, y, w, 1.5);
}

/** la ventana de dos hojas del cuerpo del fondo */
const pareja = cristales('#3a4a4a', 2, 'rgba(225,225,215,.35)');

// ——— las piezas ———

/** la pared color arena de una cara entera, de 0 a la altura dada */
function pared(k, L, h) {
  k.box(L / 2, 0, Z + 0.15, L, h, 0.3, ARENA);
  k.block(L / 2, Z + 0.15, L, 0.3);
  k.pic(L / 2, h / 2, ZF + 0.003, L, h, 0, 1, canvasTex(Math.round(L * 14), Math.round(h * 14), arena));
  k.box(L / 2, h - 0.25, ZF + 0.04, L, 0.25, 0.1, 0xc4ae92);
}

/** las ventanas estrechas de arriba, metidas en la pared con su hueco */
function estrechas(k, desde, hasta, paso) {
  for (let s = desde; s <= hasta + 0.01; s += paso) {
    k.box(s, 4.85, ZF + 0.04, 0.8, 0.12, 0.14, 0xc4ae92);
    k.pic(s, 5.85, ZF + 0.01, 0.6, 1.9, 0, 1, canvasTex(30, 95, estrecha));
  }
}

/** el ala de Cáceres por Pérez Galdós y la cara de Cáceres: ventanas estrechas arriba y rejillas de lamas abajo */
function alaRejillas(k, L, hueco) {
  pared(k, L, H);
  estrechas(k, 1.6, L - 1.6, 2.1);
  for (let s = 1.6; s <= L - 1.6 + 0.01; s += 2.1) {
    if (hueco && hueco(s)) continue;
    k.pic(s, 1.95, ZF + 0.012, 0.85, 2.3, 0, 1, canvasTex(42, 115, rejilla));
  }
}

/** el ala del sur: las ventanas de arriba y la oficina de la Seguridad Social abajo */
function alaSur(k) {
  const L = SUR.len;
  pared(k, L, H);
  estrechas(k, 1.8, L - 1.8, 2.2);
  for (const s of [5.0, 8.6, 18.6, 22.2, 26.6]) {
    k.pic(s, 1.85, ZF + 0.012, 3.2, 1.9, 0, 1, canvasTex(160, 95, verde), { glow: 0.08 });
    k.box(s, 0.85, ZF + 0.06, 3.4, 0.1, 0.2, 0xe4dccc);
    k.box(s, 3.0, ZF + 0.05, 3.3, 0.3, 0.08, 0xf0ece4);
  }
  k.pic(12.6, 1.4, ZF + 0.012, 2.6, 2.8, 0, 1, canvasTex(104, 112, persiana));
  k.box(12.6, 2.9, ZF + 0.04, 3.0, 0.2, 0.2, 0x8a8c8a);
  k.pic(13.6, 3.3, ZF + 0.03, 4.6, 0.45, 0, 1, canvasTex(276, 27, bandaSS));
  // el poste de la P del aparcamiento, junto a la plaza
  k.cyl(1.2, 0, ZF + 1.8, 0.04, 0.04, 2.5, 0x9a9a98, { seg: 8 });
  k.box(1.2, 2.1, ZF + 1.82, 0.45, 0.5, 0.03, 0x1f5ab4);
}

/** la boca de la plaza: el muro bajo con la verja negra, la puerta, el quiosco verde y la papelera */
function boca(k) {
  const L = BOCA.len, p0 = L / 2 - 1.9, p1 = L / 2 + 1.9;
  for (const [a, b] of [[0, p0], [p1, L]]) {
    const c = (a + b) / 2;
    k.box(c, 0, 0.15, b - a, 0.9, 0.3, ARENA);
    k.block(c, 0.15, b - a, 0.3);
    k.box(c, 1.9, 0.15, b - a, 0.05, 0.05, 0x1a1a1a);
    for (let s = a + 0.15; s < b; s += 0.14) k.box(s, 0.9, 0.15, 0.025, 1.0, 0.025, 0x1a1a1a);
    for (const s of [a + 0.2, b - 0.2]) k.box(s, 0, 0.15, 0.45, 1.6, 0.45, 0xd8c8b0);
  }
  // la puerta de la verja, abierta hacia dentro
  for (const s of [p0 + 0.2, p1 - 0.2]) k.box(s, 0, -1.0, 0.05, 1.9, 1.9, 0x1a1a1a);
  // el quiosco verde, delante del muro de la izquierda (sin los carteles de la lotería)
  const q = p0 - 2.6;
  k.box(q, 0, 1.4, 2.0, 2.3, 1.6, 0x2e6a3e);
  k.pic(q, 1.55, 2.205, 1.6, 0.9, 0, 1, canvasTex(80, 45, cristales('#2e6a3e', 2, 'rgba(230,236,230,.3)')));
  k.box(q, 2.3, 1.4, 2.5, 0.12, 2.0, 0x2e6a3e);
  k.cyl(q, 2.42, 1.4, 0.2, 1.3, 0.3, 0x3a7a4a, { seg: 4 });
  k.block(q, 1.4, 2.0, 1.6);
  k.cyl(p1 + 0.6, 0, 0.7, 0.25, 0.22, 0.9, 0x2a2a2a, { seg: 10 });
}

/** la plaza por dentro: los parterres con cactus y las dos palmeras pequeñas */
function plaza(k) {
  for (const [s, z] of [[4.5, -5.5], [17.5, -5.5], [4.5, -11.5], [17.5, -11.5]]) {
    k.box(s, 0, z, 3.4, 0.5, 3.4, 0xd8c8b0);
    k.block(s, z, 3.4, 3.4);
    k.box(s, 0.5, z, 3.0, 0.04, 3.0, 0x3a2e24);
    for (const [ds, dz, h] of [[-0.8, 0.6, 1.6], [0.5, -0.4, 2.2], [0.9, 0.9, 1.2]]) {
      k.cyl(s + ds, 0.5, z + dz, 0.16, 0.18, h, 0x4a7a4a, { seg: 8 });
      k.cyl(s + ds + 0.25, 0.5 + h * 0.4, z + dz, 0.1, 0.1, h * 0.5, 0x4a7a4a, { seg: 8 });
    }
  }
  for (const s of [8.5, 13.5]) {
    k.cyl(s, 0, -8.5, 0.18, 0.22, 4.2, 0x7a6248, { seg: 8 });
    for (let i = 0; i < 6; i++) k.box(s, 4.0, -8.5, 2.6, 0.05, 0.35, 0x3e6a2e, { ry: (i * Math.PI) / 6 });
  }
}

/** el cuerpo del fondo de la plaza: tres plantas con las ventanas de dos en dos y la entrada de cristal azul */
function fondo(k) {
  const L = FONDO.len;
  pared(k, L, HF);
  for (const y of [4.6, 7.8]) for (const s of [2.6, 6.4, 10.2, 14.0, 17.8, 21.4]) {
    if (s > L - 1) continue;
    k.pic(s, y + 0.9, ZF + 0.01, 1.3, 1.5, 0, 1, canvasTex(52, 60, pareja));
    k.box(s, y + 0.1, ZF + 0.05, 1.5, 0.1, 0.15, 0xe4dccc);
  }
  // la entrada: el marco azul, la cristalera y la marquesina
  const e = L / 2;
  k.box(e, 0, ZF + 0.02, 5.2, 3.0, 0.08, 0x1f4aa0);
  k.pic(e, 1.45, ZF + 0.065, 4.8, 2.7, 0, 1, canvasTex(190, 108, cristales('#1f4aa0', 4, 'rgba(210,225,235,.25)')), { glow: 0.12 });
  k.box(e, 3.0, ZF + 0.9, 6.0, 0.18, 1.8, 0xf0ece4);
  for (const s of [3.0, L - 3.0]) k.pic(s, 1.6, ZF + 0.012, 2.4, 1.6, 0, 1, canvasTex(96, 64, verde));
}

/** el lado de una de las alas que da a la plaza: ventanas estrechas arriba y una ventana verde abajo */
function ladoPlaza(k, L) {
  pared(k, L, H);
  estrechas(k, 2.0, L - 2.0, 2.4);
  for (let s = 3; s < L - 2; s += 5) k.pic(s, 1.8, ZF + 0.012, 2.2, 1.6, 0, 1, canvasTex(88, 64, verde));
}

/** se monta con lo demás de Valterra */
export function buildCentroSaludValterra(scene, colliders, map) {
  if (!map?.centroSaludValterra) return null;
  const piezas = [
    [NORTE, 'centroSaludNorte', k => alaRejillas(k, NORTE.len)],
    [CACERES, 'centroSaludCaceres', k => alaRejillas(k, CACERES.len, s => Math.abs(s - 15) < 1)],
    [SUR, 'centroSaludSur', alaSur],
    [PLAZA_N, 'centroSaludPlazaN', k => ladoPlaza(k, PLAZA_N.len)],
    [PLAZA_S, 'centroSaludPlazaS', k => ladoPlaza(k, PLAZA_S.len)],
    [FONDO, 'centroSaludFondo', fondo],
    [BOCA, 'centroSaludBoca', k => { boca(k); plaza(k); }],
  ];
  const grupos = piezas.map(([m, n, f]) => {
    const k = new Kit();
    f(k);
    const g = enMarco(k, m, n, colliders);
    scene.add(g);
    return g;
  });
  return { group: grupos[0], grupos };
}
