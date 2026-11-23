import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alturaBloque, cristales } from './edificioReal.js';

/**
 * El Acuartelamiento Marqués de Herrera, en la calle Doctor Juan Negrín 125, con las vistas de la calle de Google de julio
 * de 2025 y la foto aérea (solo se miran, no van dentro del juego; la gente no se pone). El mapa tenía el bloque gris de
 * 8 m. De verdad es un edificio blanco de dos plantas con las ventanas de carpintería verde, y en medio el cuerpo de la
 * puerta, más alto, con el arco del paso de los coches, los cuatro pináculos, el escudo (aquí solo la placa, sin dibujo),
 * el letrero, el de «TODO POR LA PATRIA» sobre el arco, la barrera roja y blanca con las señales de STOP y de 20,
 * y el mástil con la bandera de España. Por la calle, entre el jardín de palmeras y árboles, el muro alto y
 * macizo, blanco con la balaustrada en relieve sobre el zócalo gris (no se ve a través), con los pilares de remate y las dos garitas blancas a los lados de la entrada.
 */

// la cara de la calle Doctor Juan Negrín, N hacia la calle; la balaustrada va 8,5 m más allá
const M = marco([-1053, -654.3], [-1097.3, -691]);
const Z = 0.12, ZF = Z + 0.3, H = 8.5, BLANCO = 0xf2f2ee, VERDE = 0x3a6a4a, DM = 8.5;

/** antes de levantar la ciudad: el bloque blanco a su altura */
export function tuneCuartelHerrera(map) {
  if (!alturaBloque(map, -1080, -669, H, [242, 242, 238])) return;
  map.cuartelHerrera = true;
}

const ventana = cristales('#3a6a4a', 4, 'rgba(200,215,220,.35)');

/** la bandera de España (rojo, amarillo y rojo, sin escudo) */
function bandera(g, w, h) {
  g.fillStyle = '#c4161c';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f6c400';
  g.fillRect(0, h / 4, w, h / 2);
}

/** la franja roja y amarilla con «TODO POR LA PATRIA» */
function patria(g, w, h) {
  g.fillStyle = '#c4161c';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f6c400';
  g.fillRect(0, h * 0.16, w, h * 0.68);
  g.fillStyle = '#1a1a1a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `500 ${Math.round(h * 0.5)}px Arial, sans-serif`;
  g.fillText('TODO POR LA PATRIA', w / 2, h / 2 + 1, w * 0.9);
}

/** la barrera, a franjas rojas y blancas */
function barrera(g, w, h) {
  for (let x = 0; x < w; x += 10) { g.fillStyle = (x / 10) % 2 ? '#f4f4f0' : '#d42020'; g.fillRect(x, 0, 10, h); }
}

/** el letrero de la puerta, solo con el nombre */
function letrero(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#8a6a2a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.55)}px Georgia, serif`;
  g.fillText('ACUARTELAMIENTO MARQUÉS DE HERRERA', w / 2, h / 2, w * 0.95);
}

/** un árbol del jardín */
function arbol(k, s, z, h) {
  k.cyl(s, 0, z, 0.2, 0.28, h * 0.5, 0x6a5440, { seg: 8 });
  k.ball(s, h * 0.65, z, h * 0.3, 0x4a6a3a);
}

/** una palmera del jardín */
function palmera(k, s, z, h) {
  k.cyl(s, 0, z, 0.25, 0.32, h, 0x7a6248, { seg: 8 });
  for (let i = 0; i < 9; i++) k.box(s, h - 0.1, z, 3.8, 0.05, 0.45, 0x4a7a32, { ry: (i * Math.PI) / 9 });
}

/** el muro macizo con la balaustrada en relieve (no se ve a través) */
function balaustres(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(150,150,145,.35)';
  for (let x = 2; x < w; x += 6) { g.fillRect(x, 2, 1.2, h - 4); g.fillRect(x + 3.2, 2, 1.2, h - 4); }
}

/** una garita blanca con su tejadillo */
function garita(k, s, z) {
  k.box(s, 0, z, 1.3, 3.0, 1.3, BLANCO);
  k.box(s, 3.0, z, 1.5, 0.15, 1.5, 0xe6e6e2);
  k.cyl(s, 3.15, z, 0.05, 0.5, 0.6, BLANCO, { seg: 8 });
  k.box(s, 1.6, z + 0.66, 0.5, 0.6, 0.02, 0x2a2a2a);
}

/** la fachada, el cuerpo de la puerta, el jardín y la balaustrada de la calle */
function fachada(k) {
  const L = M.len, c = L / 2, EW = 10;
  k.box(c, 0, Z + 0.15, L, H, 0.3, BLANCO);
  k.block(c, Z + 0.15, L, 0.3);
  k.box(c, 0, ZF + 0.02, L, 0.8, 0.06, 0xd8d8d4);
  k.box(c, H - 0.3, ZF + 0.08, L, 0.3, 0.2, 0xe6e6e2);
  // las ventanas de carpintería verde de las dos plantas
  for (const y of [1.2, 4.6]) {
    for (let s = 2; s < L - 1.5; s += 2.6) {
      if (Math.abs(s - c) < EW / 2 + 0.8) continue;
      k.pic(s, y + 1.0, ZF + 0.012, 1.3, 1.7, 0, 1, canvasTex(52, 68, ventana));
      k.box(s, y + 0.1, ZF + 0.08, 1.5, 0.08, 0.15, 0xe6e6e2);
    }
  }
  // el cuerpo de la puerta: más alto, salido, con el arco del paso, los pináculos, el escudo y el letrero
  const T = H + 2.5;
  for (const ds of [-EW / 2 + 1.2, EW / 2 - 1.2]) k.box(c + ds, 0, ZF + 0.6, 2.4, T - 1, 1.2, BLANCO);
  k.box(c, 3.6, ZF + 0.6, EW - 4.8, T - 4.6, 1.2, BLANCO);
  k.box(c, 0, ZF + 0.05, EW - 4.8, 3.6, 0.1, 0x3a3a3a);
  for (const ds of [-EW / 2 + 0.2, -1.6, 1.6, EW / 2 - 0.2]) {
    k.box(c + ds, 0, ZF + 1.25, 0.45, T + (Math.abs(ds) < 2 ? 1.2 : 0.4), 0.45, BLANCO);
    k.cyl(c + ds, T + (Math.abs(ds) < 2 ? 1.2 : 0.4), ZF + 1.25, 0.05, 0.22, 0.9, BLANCO, { seg: 8 });
  }
  k.box(c, T - 2.2, ZF + 1.25, 1.6, 1.8, 0.1, 0xe8e2d0);
  k.box(c, T - 1.9, ZF + 1.31, 1.0, 1.2, 0.06, 0xb89a5a);
  k.pic(c, 5.0, ZF + 1.52, EW - 1.5, 0.5, 0, 1, canvasTex(600, 34, letrero));
  // encima del arco, el letrero de «TODO POR LA PATRIA» en la franja roja y amarilla (foto de la entrada)
  k.pic(c, 4.1, ZF + 1.53, 5.0, 0.55, 0, 1, canvasTex(500, 56, patria));
  // la barrera roja y blanca, el poste amarillo y las señales de STOP y de 20
  k.box(c - 2.9, 0, ZF + 2.2, 0.35, 1.0, 0.35, 0xf0c428);
  k.pic(c - 0.3, 0.95, ZF + 2.2, 5.0, 0.12, 0, 1, canvasTex(100, 6, barrera));
  k.box(c + 2.9, 0, ZF + 2.4, 0.07, 2.6, 0.07, 0x9a9c9c);
  k.cyl(c + 2.9, 2.35, ZF + 2.45, 0.32, 0.32, 0.02, 0xc81e1e, { seg: 8, rx: Math.PI / 2 });
  k.pic(c + 2.9, 2.35, ZF + 2.47, 0.5, 0.2, 0, 1, canvasTex(50, 20, (g, w, h) => { g.fillStyle = '#c81e1e'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = `700 ${h * 0.8}px Arial`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('STOP', w / 2, h / 2); }));
  k.pic(c + 2.9, 1.65, ZF + 2.45, 0.55, 0.55, 0, 1, canvasTex(56, 56, (g, w) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(w / 2, w / 2, w / 2, 0, 7); g.fill(); g.strokeStyle = '#c81e1e'; g.lineWidth = w * 0.12; g.beginPath(); g.arc(w / 2, w / 2, w * 0.42, 0, 7); g.stroke(); g.fillStyle = '#111'; g.font = `700 ${w * 0.42}px Arial`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('20', w / 2, w / 2); }));
  for (const ds of [-3.4, 3.4]) k.pic(c + ds, 6.2, ZF + 1.22, 1.1, 1.5, 0, 1, canvasTex(44, 60, ventana));
  // el mástil con la bandera
  k.cyl(c, T, ZF + 0.2, 0.06, 0.06, 7, 0xe8e8e4, { seg: 8 });
  k.pic(c + 1.1, T + 6.0, ZF + 0.2, 2.0, 1.3, 0, 1, canvasTex(60, 40, bandera));
  // el jardín con las palmeras y los árboles
  for (const s of [5, 14, L - 14, L - 5]) arbol(k, s, DM - 3, 9);
  for (const s of [9, c - 9, c + 9, L - 9]) palmera(k, s, DM - 4.5, 7);
  // el paso de la entrada, en rampa hacia el arco
  k.box(c, 0, (ZF + DM) / 2, EW - 4.8, 0.05, DM - ZF, 0x5a5a58);
  // el muro alto y macizo de la calle, con la balaustrada en relieve sobre el zócalo gris y los pilares; la entrada en medio, con las garitas
  const P0 = c - 4.5, P1 = c + 4.5;
  for (const [p, q] of [[-4, P0], [P1, L + 4]]) {
    const m = (p + q) / 2;
    k.box(m, 0, DM, q - p, 0.9, 0.5, 0x8a8c8c);
    k.block(m, DM, q - p, 0.5);
    k.box(m, 0.9, DM, q - p, 1.4, 0.4, BLANCO);
    k.pic(m, 1.6, DM + 0.21, q - p, 1.2, 0, 1, canvasTex(Math.round((q - p) * 20), 24, balaustres));
    k.box(m, 2.3, DM, q - p, 0.15, 0.5, 0xe6e6e2);
    for (let s = p; s <= q + 0.01; s += 4.5) {
      k.box(s, 0, DM, 0.7, 2.75, 0.7, BLANCO);
      k.box(s, 2.75, DM, 0.85, 0.15, 0.85, 0xe6e6e2);
    }
  }
  for (const s of [P0 - 1.2, P1 + 1.2]) garita(k, s, DM + 0.2);
}

/** se monta con lo demás */
export function buildCuartelHerrera(scene, colliders, map) {
  if (!map?.cuartelHerrera) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, M, 'cuartelHerrera', colliders);
  scene.add(group);
  return { group };
}
