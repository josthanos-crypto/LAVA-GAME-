import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alturaBloque, cristales } from './edificioReal.js';

/**
 * La manzana de enfrente del Centro de Salud de Valterra, en la esquina de Cáceres con Clavijo y Fajardo (donde Google
 * pone la Clínica Tosar), con las vistas de la calle de Google de julio de 2025 (solo se miran, no van dentro del
 * juego; la gente no se pone). El mapa la tenía como un bloque gris de 4 m; de verdad son casas de bajo y dos plantas
 * (9,6 m). Por Cáceres, de Pérez Galdós hacia la esquina: el edificio amarillo con el bajo de piedra gris, los tres
 * escaparates grandes de cristal oscuro, las rejillas, el portal blanco del 1 con los buzones y los contadores, y
 * arriba las ventanas pequeñas de madera y las de persiana blanca; y el edificio de la esquina, color crema con las
 * pilastras y el remate escalonado, el bajo de piedra gris con las ventanas de persiana blanca, la puerta de cristal y
 * el letrero de «DANIEL CAMARASA · FISIOTERAPIA-OSTEOPATÍA» (sin el dibujo del logotipo), y arriba las ventanas con la
 * barandilla blanca. Por Clavijo y Fajardo, el mismo edificio crema y después el blanco de los balcones de balaustres,
 * con el portón del garaje, los dos portales y las ventanas de persiana blanca.
 */

// la cara de Cáceres (de Pérez Galdós, s 0, a la esquina de Clavijo) y la de Clavijo y Fajardo (de la esquina hacia el
// norte), las dos con N hacia la calle
const C = marco([517.8, -507.23], [544.51, -491.95]);
const F = marco([544.51, -491.95], [582.38, -558.45]);
const Z = 0.12, ZF = Z + 0.3, H = 9.6, YB = 3.6;
const AMARILLO = 0xe2c27a, CREMA = 0xefd9bf, BLANCO = 0xf2f2ee, PIEDRA = 0x5a5c5e;
// dónde acaba el amarillo por Cáceres, y dónde acaba el crema y el blanco por Clavijo
const AM1 = 16.4, CR1 = 14, BL1 = 40;

/** antes de levantar la ciudad: el bloque a la altura de las casas (blanco, que es lo que más hay) */
export function tuneEsquinaCaceres(map) {
  if (!alturaBloque(map, 545, -510, H, [238, 236, 230])) return;
  map.esquinaCaceres = true;
}

// ——— lo que se pinta en lienzo ———

/** el chapado de piedra gris oscura del bajo */
function piedra(g, w, h) {
  g.fillStyle = '#5a5c5e';
  g.fillRect(0, 0, w, h);
  let s = 9;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  g.strokeStyle = 'rgba(40,40,42,.6)';
  g.lineWidth = 1.5;
  const fila = h / 9;
  for (let y = 0, i = 0; y < h; y += fila, i++) {
    g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke();
    for (let x = (i % 2) * 22; x < w; x += 44) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + fila); g.stroke(); }
  }
  for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '30,30,32' : '120,120,118'},.25)`; g.fillRect(r() * w, r() * h, 2, 2); }
}

/** la ventana de persiana de lamas blanca, de dos hojas */
function persianaBlanca(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#b8b8b4';
  for (let y = 5; y < h - 4; y += 5) g.fillRect(4, y, w - 8, 1.5);
  g.fillStyle = '#d8d8d4';
  g.fillRect(w / 2 - 1.5, 0, 3, h);
}

/** la ventana de arriba con la barandilla blanca de barrotes */
function barandilla(g, w, h) {
  g.fillStyle = '#3a4248';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(220,226,230,.35)';
  g.fillRect(4, 4, w / 2 - 6, h * 0.5);
  g.strokeStyle = '#f2f2ee';
  g.lineWidth = 4;
  g.strokeRect(2, 2, w - 4, h - 4);
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h * 0.55); g.stroke();
  g.lineWidth = 3;
  g.beginPath(); g.moveTo(0, h * 0.55); g.lineTo(w, h * 0.55); g.stroke();
  for (let x = 6; x < w; x += 8) { g.beginPath(); g.moveTo(x, h * 0.55); g.lineTo(x, h); g.stroke(); }
}

/** la ventanita de madera con la cuadrícula blanca */
function madera(g, w, h) {
  g.fillStyle = '#6a4a30';
  g.fillRect(0, 0, w * 0.35, h);
  g.fillStyle = '#3a4248';
  g.fillRect(w * 0.35, 0, w * 0.65, h);
  g.strokeStyle = '#f2f2ee';
  g.lineWidth = 3;
  g.strokeRect(1.5, 1.5, w - 3, h - 3);
  for (const x of [0.58, 0.8]) { g.beginPath(); g.moveTo(w * x, 0); g.lineTo(w * x, h); g.stroke(); }
  for (const y of [0.35, 0.68]) { g.beginPath(); g.moveTo(w * 0.35, h * y); g.lineTo(w, h * y); g.stroke(); }
}

/** el escaparate grande de cristal oscuro con el marco blanco */
function escaparate(g, w, h) {
  g.fillStyle = '#2e4648';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(200,220,220,.12)';
  g.fillRect(w * 0.15, 0, w * 0.2, h);
  g.strokeStyle = '#e8e8e4';
  g.lineWidth = 5;
  g.strokeRect(2.5, 2.5, w - 5, h - 5);
}

/** el letrero de la fisioterapia (sin el dibujo del logotipo) */
function camarasa(g, w, h) {
  g.fillStyle = '#eceae6';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#2a2a2c';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(h * 0.42)}px Arial, sans-serif`;
  g.fillText('DANIEL CAMARASA', w * 0.56, h * 0.36, w * 0.8);
  g.font = `600 ${Math.round(h * 0.2)}px Arial, sans-serif`;
  g.fillText('FISIOTERAPIA · OSTEOPATÍA', w * 0.56, h * 0.76, w * 0.8);
}

/** la puerta de cristal y aluminio blanco con la cuadrícula */
const puertaBlanca = cristales('#f2f2ee', 2, 'rgba(210,214,216,.3)');

// ——— las piezas ———

/** la pared de una casa de s0 a s1: el bajo de piedra con su banda blanca y las plantas del color que se diga */
function casa(k, s0, s1, color, conPiedra = true) {
  const c = (s0 + s1) / 2, L = s1 - s0;
  k.box(c, 0, Z + 0.15, L, H, 0.3, color);
  k.block(c, Z + 0.15, L, 0.3);
  if (conPiedra) {
    k.pic(c, YB / 2, ZF + 0.004, L, YB, 0, 1, canvasTex(Math.round(L * 20), 72, piedra));
    k.box(c, YB, ZF + 0.08, L, 0.3, 0.16, 0xf2f2ee);
  }
  k.box(c, H - 0.25, ZF + 0.06, L, 0.25, 0.14, color === AMARILLO ? 0xd0b06a : 0xe2ccb0);
}

/** la cara de Cáceres: el edificio amarillo y el crema de la esquina */
function caraCaceres(k) {
  const L = C.len;
  casa(k, 0, AM1, AMARILLO);
  // los tres escaparates del bajo, las rejillas y el portal del 1 con los buzones y los contadores
  for (const [s, w] of [[2.4, 3.2], [6.2, 3.2], [10.0, 3.4]]) k.pic(s, 1.55, ZF + 0.012, w, 2.8, 0, 1, canvasTex(Math.round(w * 30), 84, escaparate));
  for (const s of [2.4, 5.0, 8.2, 13.4]) k.box(s, 3.15, ZF + 0.02, 0.8, 0.22, 0.04, 0xe8e2d4);
  k.pic(14.6, 1.25, ZF + 0.014, 1.2, 2.4, 0, 1, canvasTex(48, 96, puertaBlanca));
  for (const s of [12.6, 13.2]) k.box(s, 1.55, ZF + 0.08, 0.4, 0.4, 0.12, 0xeceae6);
  k.box(12.9, 0.7, ZF + 0.08, 1.0, 0.6, 0.15, 0xeceae6);
  // arriba, las ventanitas de madera y las de persiana blanca, con su recerco salido
  for (const [s, y, w, h, tex] of [[1.6, 4.4, 1.0, 1.2, madera], [5.0, 4.4, 1.0, 1.2, madera], [8.6, 4.4, 1.2, 1.3, madera], [13.6, 4.4, 1.2, 1.3, madera],
    [1.8, 7.2, 1.1, 1.0, persianaBlanca], [5.2, 7.2, 1.1, 1.0, persianaBlanca], [8.8, 7.2, 1.1, 1.0, persianaBlanca], [13.6, 7.2, 1.3, 1.0, persianaBlanca]]) {
    k.pic(s, y + h / 2, ZF + 0.01, w, h, 0, 1, canvasTex(Math.round(w * 40), Math.round(h * 40), tex));
    k.box(s, y - 0.08, ZF + 0.06, w + 0.2, 0.08, 0.14, 0xd0b06a);
  }
  // el edificio crema de la esquina
  casa(k, AM1, L, CREMA);
  for (const s of [AM1 + 0.2, AM1 + 5.6, L - 3.4, L - 0.2]) k.box(s, YB + 0.3, ZF + 0.12, 0.6, H - YB - 0.3, 0.2, 0xe8d0b4);
  k.pic(AM1 + 1.3, 1.25, ZF + 0.014, 1.3, 2.5, 0, 1, canvasTex(52, 100, cristales('#c8c0b0', 1, 'rgba(200,215,225,.3)')), { glow: 0.1 });
  k.pic(AM1 + 4.6, 1.9, ZF + 0.014, 3.0, 1.4, 0, 1, canvasTex(180, 84, camarasa));
  for (const s of [L - 5.0, L - 1.9]) k.pic(s, 1.7, ZF + 0.014, 1.4, 1.2, 0, 1, canvasTex(56, 48, persianaBlanca));
  k.pic(L - 3.0, 3.1, ZF + 0.03, 3.4, 0.62, 0, 1, canvasTex(220, 40, camarasa));
  for (const y of [4.3, 7.0]) for (const s of [AM1 + 2.9, AM1 + 8.0, L - 1.8]) {
    k.pic(s, y + 0.9, ZF + 0.012, 1.4, 1.8, 0, 1, canvasTex(56, 72, barandilla));
    k.box(s, y - 0.06, ZF + 0.08, 1.7, 0.12, 0.2, 0xe2ccb0);
  }
}

/** la cara de Clavijo y Fajardo: el edificio crema de la esquina y el blanco de los balcones */
function caraClavijo(k) {
  casa(k, 0, CR1, CREMA);
  // el remate escalonado por tramos y las pilastras
  for (const [a, b, h] of [[0, 4.2, 0.5], [4.2, 7.0, 0.2], [7.0, 11.2, 0.5], [11.2, CR1, 0.25]]) k.box((a + b) / 2, H, ZF + 0.02, b - a, h, 0.3, 0xe2ccb0);
  for (const s of [0.2, 4.2, 7.0, 11.2, CR1 - 0.2]) k.box(s, YB + 0.3, ZF + 0.12, 0.5, H - YB - 0.3, 0.2, 0xe8d0b4);
  k.pic(2.4, 3.05, ZF + 0.02, 2.4, 0.5, 0, 1, canvasTex(160, 34, camarasa));
  for (const [s, w] of [[2.2, 1.3], [5.6, 1.3], [9.1, 2.2], [12.6, 1.3]]) {
    k.pic(s, 1.7, ZF + 0.014, w, 1.2, 0, 1, canvasTex(Math.round(w * 40), 48, persianaBlanca));
    for (const y of [4.3, 7.0]) {
      k.pic(s, y + 0.9, ZF + 0.012, w + 0.1, 1.8, 0, 1, canvasTex(Math.round(w * 40), 72, barandilla));
      k.box(s, y - 0.06, ZF + 0.08, w + 0.4, 0.12, 0.2, 0xe2ccb0);
    }
  }
  // la señal de stop de la esquina
  k.cyl(-0.6, 0, ZF + 1.4, 0.04, 0.04, 2.3, 0x9a9a98, { seg: 8 });
  k.cyl(-0.6, 2.3, ZF + 1.42, 0.32, 0.32, 0.03, 0xc82a2a, { seg: 8, rx: Math.PI / 2 });
  // el edificio blanco de los balcones de balaustres
  casa(k, CR1, BL1, BLANCO, false);
  k.box((CR1 + BL1) / 2, 0, ZF + 0.02, BL1 - CR1, 0.3, 0.06, 0xd8d4cc);
  k.pic(CR1 + 2.0, 1.4, ZF + 0.012, 3.0, 2.6, 0, 1, canvasTex(120, 104, persianaBlanca));
  for (const s of [CR1 + 6.6, BL1 - 4.6]) {
    k.box(s, 0, ZF + 0.02, 1.4, 2.6, 0.06, 0xe4e4e0);
    k.pic(s, 1.25, ZF + 0.06, 1.0, 2.3, 0, 1, canvasTex(40, 92, puertaBlanca));
  }
  for (const s of [CR1 + 4.6, CR1 + 9.2, CR1 + 12.0, CR1 + 15.4, CR1 + 18.6, BL1 - 2.2]) k.pic(s, 1.7, ZF + 0.012, 1.4, 1.2, 0, 1, canvasTex(56, 48, persianaBlanca));
  // los balcones de en medio, metidos, con la losa y los balaustres; y las ventanas de persiana de los lados
  const b0 = CR1 + 8.6, b1 = CR1 + 17.4, bc = (b0 + b1) / 2;
  for (const y of [3.4, 6.4]) {
    k.box(bc, y, ZF + 0.5, b1 - b0, 0.22, 1.0, 0xf2f2ee);
    for (let s = b0 + 0.2; s < b1 - 0.1; s += 0.32) k.cyl(s, y + 0.22, ZF + 0.95, 0.07, 0.09, 0.75, 0xf4f4f0, { seg: 6 });
    k.box(bc, y + 0.97, ZF + 0.95, b1 - b0, 0.1, 0.18, 0xf2f2ee);
    for (const s of [b0 + 2.0, b1 - 2.0]) k.pic(s, y + 1.4, ZF + 0.012, 1.8, 1.9, 0, 1, canvasTex(72, 76, cristales('#e4e4e0', 2, 'rgba(230,226,215,.5)')));
    for (const s of [CR1 + 2.6, CR1 + 6.6, BL1 - 6.0, BL1 - 2.2]) k.pic(s, y + 1.6, ZF + 0.012, 1.3, 1.1, 0, 1, canvasTex(52, 44, persianaBlanca));
  }
  k.box(bc, H - 0.1, ZF + 0.35, b1 - b0, 0.06, 0.7, 0xf0f0ec);
}

/** se monta con lo demás de Valterra */
export function buildEsquinaCaceres(scene, colliders, map) {
  if (!map?.esquinaCaceres) return null;
  const grupos = [[C, 'esquinaCaceresC', caraCaceres], [F, 'esquinaCaceresF', caraClavijo]].map(([m, n, f]) => {
    const k = new Kit();
    f(k);
    const g = enMarco(k, m, n, colliders);
    scene.add(g);
    return g;
  });
  return { group: grupos[0], grupos };
}
