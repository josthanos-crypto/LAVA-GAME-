import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alturaBloque, cristales } from './edificioReal.js';

/**
 * El IES Blas Cabrera Felipe, en la avenida Alcalde Ginés de la Hoz 57 (cerca de la Rambla Medular), con las vistas de la
 * calle de Google de julio de 2025 y la foto aérea (solo se miran, no van dentro del juego; la gente no se pone). El mapa
 * tenía el bloque gris oscuro de 4 m. De verdad es un edificio blanco de tres plantas (10,5 m) con las filas de ventanas de
 * aluminio, metido detrás del aparcamiento; y en la avenida, el muro blanco con la reja blanca encima, la puerta de reja
 * de dos hojas, la marquesina azul de la parada de guaguas con su banco y la papelera.
 */

// la cara del edificio que mira a la avenida, N hacia la avenida; el muro de la calle va 23,5 m más allá
const M = marco([-593.24, -534.49], [-612.56, -560.34]);
const Z = 0.12, ZF = Z + 0.3, H = 10.5, BLANCO = 0xf4f4f0, DM = 23.5;

/** antes de levantar la ciudad: el bloque a sus tres plantas y blanco */
export function tuneIesBlasCabrera(map) {
  if (!alturaBloque(map, -615, -530, H, [244, 244, 240])) return;
  map.iesBlasCabrera = true;
}

const ventana = cristales('#c8c8c4', 3, 'rgba(225,230,232,.4)');

/** la fachada del edificio y el muro de la avenida */
function fachada(k) {
  const L = M.len;
  k.box(L / 2, 0, Z + 0.15, L, H, 0.3, BLANCO);
  k.block(L / 2, Z + 0.15, L, 0.3);
  for (const y of [1.0, 4.4, 7.8]) {
    k.box(L / 2, y - 0.15, ZF + 0.06, L, 0.12, 0.15, 0xe6e6e2);
    for (let s = 2; s < L - 1; s += 2.8) k.pic(s, y + 0.75, ZF + 0.012, 1.9, 1.4, 0, 1, canvasTex(76, 56, ventana));
  }
  k.box(L / 2, H - 0.2, ZF + 0.05, L, 0.2, 0.15, 0xe6e6e2);
  // el muro blanco de la avenida con la reja blanca encima y la puerta
  const a = -15, b = 45, c = (a + b) / 2, P = 20;
  for (const [p, q] of [[a, P - 1.6], [P + 1.6, b]]) {
    const m = (p + q) / 2;
    k.box(m, 0, DM, q - p, 1.3, 0.3, BLANCO);
    k.block(m, DM, q - p, 0.3);
    k.box(m, 2.7, DM, q - p, 0.05, 0.05, 0xf2f2f0);
    for (let s = p + 0.1; s < q; s += 0.16) k.box(s, 1.3, DM, 0.035, 1.4, 0.035, 0xf2f2f0);
    for (let s = p; s <= q; s += 3) k.box(s, 1.3, DM, 0.12, 1.5, 0.12, 0xf2f2f0);
  }
  for (const s of [P - 1.6, P + 1.6]) k.box(s, 0, DM, 0.4, 2.9, 0.4, BLANCO);
  for (let s = P - 1.4; s < P + 1.4; s += 0.14) k.box(s, 0.1, DM, 0.035, 2.4, 0.035, 0xf2f2f0);
  k.box(P, 2.5, DM, 3.2, 0.06, 0.06, 0xf2f2f0);
  // la marquesina azul de la parada de guaguas, el banco y la papelera, en la acera
  const pz = DM + 1.6, ps = 32;
  for (const s of [ps - 1.6, ps + 1.6]) k.box(s, 0, pz, 0.1, 2.5, 0.1, 0x2a4aa0);
  k.box(ps, 2.5, pz, 4.2, 0.12, 1.6, 0x3a6ac8);
  k.box(ps, 0.45, pz - 0.3, 3.6, 0.08, 0.5, 0xf2f2f0);
  k.box(ps - 3, 0, pz + 0.2, 0.06, 2.4, 0.06, 0x8a8a88);
  k.box(ps - 3, 2.1, pz + 0.22, 0.5, 0.45, 0.03, 0x1f4aa0);
  k.box(ps + 6, 0, pz + 0.4, 0.45, 0.85, 0.35, 0x2a2a2a);
}

/** se monta con lo de la Rambla Medular */
export function buildIesBlasCabrera(scene, colliders, map) {
  if (!map?.iesBlasCabrera) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, M, 'iesBlasCabrera', colliders);
  scene.add(group);
  return { group };
}
