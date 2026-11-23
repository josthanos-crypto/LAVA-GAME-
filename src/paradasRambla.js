import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * Las paradas de guagua de la Rambla Medular, cada una en el sitio que le da Google Maps y como sale en las vistas de la
 * calle de Google de julio de 2025 (solo se miran, no van dentro del juego; la gente no se pone). No son todas iguales:
 * - Rambla Medular 7: el tótem gris de información con la pantalla y la placa solar encima.
 * - Rambla Medular 35, a un lado y al otro: solo el poste gris, entre las palmeras.
 * - Rambla Medular 17A: la marquesina verde con el techo curvo, el cristal detrás y el banco, el tótem con la placa solar
 *   y la papelera verde.
 * - Rambla Medular 101 (Rambla / Triana, junto a los Juzgados): la marquesina de hormigón blanco sobre sus patas,
 *   la columna de piedra volcánica, el panel blanco del fondo, el banco de piedra, la papelera y el poste alto.
 * Las paradas que ya iban con otra pieza (la Estación de Guaguas, el Centro Comercial Arrecife y el IES Blas Cabrera) no
 * se repiten aquí.
 */

// cada parada: la línea del fondo de la acera (6 m), N hacia la calle; la parada va en medio (s 3)
const P7 = marco([871.51, -389.65], [876.44, -386.25]);
const P35A = marco([519.76, -642.91], [525.11, -640.19]);
const P35B = marco([506.38, -609.67], [500.92, -612.16]);
const P17A = marco([-603.07, -373.75], [-609.07, -373.65]);
const P101 = marco([-1042.72, -181.64], [-1040.29, -187.12]);
const GRIS = 0x9a9c9c, VERDE = 0x3a8a72;

/** antes de levantar la ciudad: nada que tocar en el mapa, solo se marca */
export function tuneParadasRambla(map) {
  map.paradasRambla = true;
}

/** la pantallita del tótem */
function pantalla(g, w, h) {
  g.fillStyle = '#1e2a2a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#8ad0a8';
  for (let y = h * 0.15; y < h * 0.9; y += h * 0.14) g.fillRect(w * 0.12, y, w * (0.4 + ((y * 7) % 30) / 100), h * 0.05);
}

/** la placa solar */
function solar(g, w, h) {
  g.fillStyle = '#1a2a44';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#8a9ab0';
  for (let x = 0; x <= w; x += w / 6) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y <= h; y += h / 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** la piedra volcánica de la columna */
function piedra(g, w, h) {
  g.fillStyle = '#3a3634';
  g.fillRect(0, 0, w, h);
  let s = 41;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 120; i++) { const v = 40 + r() * 40; g.fillStyle = `rgb(${v},${v - 3},${v - 6})`; g.fillRect(r() * w, r() * h, 4 + r() * 8, 3 + r() * 6); }
}

/** el poste gris de la parada */
function poste(k, s, z, h = 3) {
  k.cyl(s, 0, z, 0.05, 0.05, h, GRIS, { seg: 8 });
}

/** el tótem de información con la placa solar */
function totem(k, s, z) {
  k.box(s, 0, z, 0.35, 2.3, 0.25, 0xa8aaa8);
  k.pic(s, 1.55, z + 0.13, 0.26, 0.5, 0, 1, canvasTex(26, 50, pantalla), { glow: 0.3 });
  k.box(s, 2.3, z, 0.08, 0.4, 0.08, GRIS);
  k.pic(s, 2.75, z, 1.0, 0.6, 0, 1, canvasTex(60, 36, solar));
  k.box(s, 2.75, z - 0.02, 1.02, 0.62, 0.02, GRIS);
}

/** la papelera */
function papelera(k, s, z, color) {
  k.cyl(s, 0, z, 0.05, 0.05, 0.6, GRIS, { seg: 6 });
  k.cyl(s, 0.6, z, 0.22, 0.2, 0.5, color, { seg: 12 });
}

/** Rambla 17A: la marquesina verde */
function marquesinaVerde(k) {
  for (const s of [1.2, 4.8]) for (const z of [0.4, 1.6]) k.box(s, 0, z, 0.1, 2.4, 0.1, VERDE);
  k.box(3, 2.4, 1.0, 4.2, 0.08, 1.8, VERDE);
  k.box(3, 2.45, 1.0, 4.0, 0.12, 1.4, 0x4a9a82);
  k.box(3, 0.2, 0.4, 3.5, 2.0, 0.04, 0xc8dcd8, { list: k.glass });
  k.box(3, 0.45, 0.65, 3.4, 0.06, 0.4, 0xb8bcbc);
  totem(k, 5.6, 1.9);
  papelera(k, 6.4, 2.1, 0x3a7a52);
}

/** Rambla 101: la marquesina de hormigón blanco con la columna de piedra */
function marquesinaHormigon(k) {
  const BL = 0xe8e6e0;
  k.box(3, 2.5, 1.0, 5.6, 0.25, 2.0, BL);
  k.box(3, 2.3, 1.95, 5.4, 0.25, 0.06, 0x8a5a44);
  for (const s of [0.6, 1.4]) k.box(s, 0, 1.6, 0.25, 2.5, 0.25, BL);
  k.box(4.4, 0, 0.9, 0.7, 2.5, 0.7, 0x3a3634);
  k.pic(4.4, 1.25, 1.26, 0.7, 2.5, 0, 1, canvasTex(28, 100, piedra));
  k.box(2.4, 0.3, 0.3, 2.4, 1.6, 0.1, 0xf4f4f0);
  k.box(2.4, 0, 0.7, 2.0, 0.45, 0.5, 0x9a948a);
  k.box(5.4, 0, 1.6, 0.6, 0.45, 0.4, 0xb8b2a8);
  papelera(k, -0.2, 1.6, 0x3a6a42);
  poste(k, 6.2, 2.0, 4.5);
}

/** se monta con lo de la Rambla Medular */
export function buildParadasRambla(scene, colliders, map) {
  if (!map?.paradasRambla) return null;
  const montar = (M, nombre, hacer) => {
    const k = new Kit();
    hacer(k);
    const g = enMarco(k, M, nombre, colliders);
    scene.add(g);
    return g;
  };
  return {
    rambla7: montar(P7, 'paradaRambla7', (k) => totem(k, 3, 2.0)),
    rambla35a: montar(P35A, 'paradaRambla35a', (k) => poste(k, 3, 2.1)),
    rambla35b: montar(P35B, 'paradaRambla35b', (k) => poste(k, 3, 2.1)),
    rambla17a: montar(P17A, 'paradaRambla17a', marquesinaVerde),
    rambla101: montar(P101, 'paradaRambla101', marquesinaHormigon),
  };
}
