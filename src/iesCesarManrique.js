import { Kit } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alturaBloque } from './edificioReal.js';
import { tira } from './kitFachada.js';

/**
 * El IES César Manrique (calle Doctor Puigvert; el muro largo da a la calle Timanfaya, que el mapa llama Juan Luzardo),
 * con la vista de la calle de Google de julio de 2025 (solo se mira). Desde la calle se ve el muro blanco con la valla
 * verde de malla encima, el jardín de picón con árboles y, al fondo, el edificio crema de cuatro plantas. El mapa lo
 * tenía de 6,4 m: se sube a 12,5 m y se pinta de crema. Las fachadas de dentro del recinto no se ven desde la calle y
 * se quedan con las ventanas del mapa.
 */

const H = 12.5;
// el muro, por la acera de la calle Timanfaya (6 m hacia dentro desde el centro de la calle)
const MURO = marco([-1042.1, -374.2], [-981.1, -322.0]);
const ARBOLES = [8, 17, 26, 37, 46, 55].map((s, i) => MURO.W(s, -(9 + (i % 2) * 6)));
const VERDE = 0x2f6a3c;

export function tuneIesCesarManrique(map) {
  if (!alturaBloque(map, -1004, -426, H, [228, 216, 188])) return;
  map.iesCesarManrique = true;
  map.trees = map.trees || [];
  for (const p of ARBOLES) map.trees.push(p);
}

/** el muro blanco con la valla verde de malla */
function muro(k, L) {
  tira(k, 0, L, 0, 0, 1.4, 0.3, 0xf0efe9);
  k.block(L / 2, 0, L, 0.3);
  tira(k, 0, L, 1.4, 0, 0.06, 0.36, 0xdedcd4, k.solid);
  for (const y of [1.5, 3.0]) tira(k, 0, L, y, 0, 0.05, 0.05, VERDE, k.solid);
  for (let s = 0.1; s < L; s += 0.22) k.box(s, 1.46, 0, 0.02, 1.56, 0.02, VERDE);
  for (let s = 0; s <= L; s += 2.6) k.box(s, 1.46, 0, 0.07, 1.65, 0.07, VERDE);
}

export function buildIesCesarManrique(scene, colliders, map) {
  if (!map?.iesCesarManrique) return null;
  const k = new Kit();
  muro(k, MURO.len);
  const g = enMarco(k, MURO, 'iesCesarManriqueMuro', colliders);
  scene.add(g);
  return g;
}
