import * as THREE from 'three';
import { Kit } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * El varadero del sur de la Marina Lanzarote, con la foto aérea del juego (la del PNOA, donde se ven los
 * cascos), la aérea del puerto deportivo de marzo de 2017 y la de la grúa pórtico de 2018 de Google Maps
 * (solo se miran, no van dentro del juego): en la explanada de detrás de la oficina de la Marina, los
 * barcos sacados del agua sobre sus cunas de acero (dos yates grandes, uno de franjas azules y otro de
 * franjas naranjas, y más allá veleros y lanchas), la grúa pórtico blanca con sus eslingas rojas y un barco
 * colgado, y los dos muelles estrechos y paralelos que entran en el agua para que la grúa saque los barcos.
 * En el juego la explanada era la foto plana y los muelles no estaban (ahí había agua). Los sitios de los
 * barcos y de la grúa son los de la foto aérea del juego; el tamaño de la grúa, a ojo por esa foto.
 */

// los barcos: centro, eslora, manga, hacia dónde mira la proa, si es velero y el color de las franjas
const BARCOS = [
  { c: [1219.3, -276.5], L: 20, M: 5.6, rumbo: [0.517, -0.858], vela: false, franja: 0x1e3a6a },
  { c: [1231.7, -264.3], L: 17, M: 5.0, rumbo: [0.517, -0.858], vela: false, franja: 0xd8642a },
  { c: [1295.6, -281.5], L: 22, M: 6.0, rumbo: [0.88, 0.47], vela: false, franja: 0x1e3a6a },
  { c: [1318.7, -314.8], L: 24, M: 6.5, rumbo: [0.88, 0.48], vela: false, franja: 0x1a1a1c },
  { c: [1314.0, -290.7], L: 20, M: 5.5, rumbo: [0.8, 0.6], vela: false, franja: 0x8a1a1a },
  { c: [1300.7, -263.8], L: 18, M: 5.0, rumbo: [0.85, 0.53], vela: true, franja: 0x1e3a6a },
  { c: [1291.4, -252.9], L: 16, M: 4.8, rumbo: [0.88, 0.47], vela: false, franja: 0x2a6ab8 },
  { c: [1278.6, -275.7], L: 10, M: 3.4, rumbo: [0.9, 0.43], vela: false, franja: 0x2a6ab8 },
  { c: [1254.0, -353.0], L: 13, M: 4.0, rumbo: [0.36, -0.93], vela: true, franja: 0x1a1a1c },
  { c: [1262.0, -351.0], L: 12, M: 3.8, rumbo: [0.36, -0.93], vela: true, franja: 0x1e3a6a },
  { c: [1275.7, -348.6], L: 15, M: 4.4, rumbo: [0.55, -0.83], vela: true, franja: 0x8a1a1a },
  { c: [1295.7, -344.0], L: 9, M: 3.2, rumbo: [0.71, -0.71], vela: false, franja: 0x2a6ab8 },
];
// la grúa pórtico, con el barco colgado, y los dos muelles de la grúa (de la punta en el agua a tierra)
const GRUA = { c: [1252.0, -263.0], rumbo: [0.517, -0.858], L: 18, A: 12, alto: 13 };
const MUELLES = [[[1184.3, -356.4], [1229.3, -331.4]], [[1180.0, -338.6], [1221.4, -311.4]]];
const BLANCO = 0xf2f2f0, CUNA = 0x2a5aa8, HORMIGON = 0xc8c6c0, ROJO = 0xc82a2a, NEGRO = 0x1a1a1c;

/** antes de levantar la ciudad: no hay nada que quitar del mapa */
export function tuneVaraderoMarina(map) {
  map.varaderoMarina = true;
}

/** el marco de una pieza puesta en su centro y mirando hacia «rumbo» (s a lo largo, z de través) */
function marcoEn(c, rumbo) {
  return marco([c[0] - rumbo[0], c[1] - rumbo[1]], [c[0] + rumbo[0], c[1] + rumbo[1]]);
}

/** un casco visto desde arriba (de popa en s -L/2 a proa en +L/2), a la escala f */
function forma(L, M, f) {
  const p = [[-L / 2, -M * 0.42], [L * 0.2, -M / 2], [L / 2, 0], [L * 0.2, M / 2], [-L / 2, M * 0.42]];
  return new THREE.Shape(p.map(([x, y]) => new THREE.Vector2(x * f, y * f)));
}

/** una franja de casco: la forma extruida hacia arriba entre y0 e y0 + alto */
function capa(k, L, M, f, y0, alto, hex, s0 = 0) {
  const g = new THREE.ExtrudeGeometry(forma(L, M, f), { depth: alto, bevelEnabled: false });
  g.rotateX(-Math.PI / 2);
  g.translate(s0, y0, 0);
  k.add(g, hex);
}

/** un barco: el casco (la obra viva más estrecha abajo), la franja, la cubierta, la cabina y el palo si es velero */
function barco(k, b, y0, { cuna = true } = {}) {
  const { L, M, vela, franja } = b;
  const base = y0 + (cuna ? 0.9 : 0);
  if (vela) k.box(0, base - 0.9, 0, L * 0.3, 1.0, 0.25, 0x3a3a3c);
  capa(k, L, M, 0.55, base, 0.6, 0x9aa4ae, L * 0.02);
  capa(k, L, M, 0.85, base + 0.6, 0.6, BLANCO);
  capa(k, L, M, 1, base + 1.2, 1.1, BLANCO);
  capa(k, L, M, 1.01, base + 2.0, 0.18, franja);
  k.box(-L * 0.05, base + 2.3, 0, L * 0.6, 0.05, M * 0.6, 0xc8a878);
  if (vela) {
    k.box(-L * 0.08, base + 2.3, 0, L * 0.3, 0.5, M * 0.5, BLANCO);
    k.cyl(L * 0.08, base + 2.3, 0, 0.07, 0.09, 10 + L * 0.5, 0xcfd2d6, { seg: 6 });
    k.box(-L * 0.12, base + 3.4, 0, L * 0.38, 0.1, 0.1, 0xcfd2d6);
  } else {
    k.box(-L * 0.08, base + 2.3, 0, L * 0.42, 1.1, M * 0.7, BLANCO);
    k.box(-L * 0.08 + L * 0.21 - 0.05, base + 2.7, 0, 0.1, 0.5, M * 0.66, 0x2a3a4a);
    k.box(-L * 0.15, base + 3.4, 0, L * 0.26, 0.9, M * 0.56, BLANCO);
    k.box(-L * 0.15, base + 3.75, 0, L * 0.27, 0.35, M * 0.57, franja === 0xd8642a ? 0x2a3a4a : franja);
  }
  if (!cuna) return;
  // la cuna de acero: los puntales con sus zapatas y las dos vigas de debajo
  for (const s of [-L * 0.3, L * 0.15]) {
    k.box(s, y0, 0, 0.3, 0.9, M * 0.5, CUNA);
    for (const lado of [-1, 1]) k.box(s, y0, lado * M * 0.42, 0.25, 1.8, 0.25, CUNA);
  }
  k.block(0, 0, L * 0.9, M);
}

/** la grúa pórtico: las cuatro patas sobre sus carros de ruedas, las vigas de arriba y las eslingas rojas */
function grua(k) {
  const { L, A, alto } = GRUA;
  for (const s of [-L / 2, L / 2]) for (const z of [-A / 2, A / 2]) {
    k.box(s, 1.3, z, 0.9, alto - 1.3, 0.9, BLANCO);
    k.box(s, 0.5, z, 3.2, 0.8, 1.1, BLANCO);
    for (const ds of [-1, 1]) k.cyl(s + ds, 0, z, 0.5, 0.5, 0.45, NEGRO, { seg: 12, rx: Math.PI / 2 });
    k.block(s, z, 3.2, 1.2);
  }
  for (const z of [-A / 2, A / 2]) k.box(0, alto, z, L + 1, 1.3, 1.0, BLANCO);
  k.box(L / 2, alto - 0.3, 0, 1.0, 1.6, A + 1, BLANCO);
  k.box(-L / 2, alto + 0.6, 0, 0.8, 0.7, A + 1, BLANCO);
  for (const s of [-L * 0.28, L * 0.25]) for (const z of [-A / 2 + 0.5, A / 2 - 0.5]) {
    k.box(s, alto - 0.2, z * 0.98, 0.3, 0.6, 0.3, 0x4a4a4c);
    k.box(s, 3.4, z * 0.6, 0.16, alto - 3.6, 0.08, ROJO);
  }
  barco(k, { L: 16, M: 4.8, vela: false, franja: 0x1e3a6a }, 1.6, { cuna: false });
}

/** un muelle de la grúa: la losa de hormigón con el canto y las defensas */
function muelle(k, L) {
  k.box(L / 2, -0.6, 0, L, 0.9, 3.6, HORMIGON);
  for (let s = 4; s < L; s += 4) k.box(s, 0.3, 0, 0.04, 0.005, 3.6, 0xa8a6a0);
  for (const lado of [-1, 1]) for (let s = 2; s < L; s += 6) k.box(s, -0.4, lado * 1.86, 0.4, 0.6, 0.12, NEGRO);
  for (const lado of [-1, 1]) for (let s = 3; s < L; s += 12) k.cyl(s, 0.3, lado * 1.5, 0.12, 0.15, 0.4, 0x3a3a3c, { seg: 8 });
}

/** se monta con lo demás de Valterra, en su primera fase */
export function buildVaraderoMarina(scene, colliders, map) {
  if (!map?.varaderoMarina) return null;
  const group = new THREE.Group();
  group.name = 'varaderoMarina';
  BARCOS.forEach((b, i) => {
    const k = new Kit();
    barco(k, b, 0);
    group.add(enMarco(k, marcoEn(b.c, b.rumbo), 'barcoVaradero' + i, colliders));
  });
  const kg = new Kit();
  grua(kg);
  group.add(enMarco(kg, marcoEn(GRUA.c, GRUA.rumbo), 'gruaVaradero', colliders));
  MUELLES.forEach(([a, b], i) => {
    const M = marco(a, b), k = new Kit();
    muelle(k, M.len);
    group.add(enMarco(k, M, 'muelleGrua' + i, null));
  });
  scene.add(group);
  return { group };
}
