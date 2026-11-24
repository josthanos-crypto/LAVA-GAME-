import * as THREE from 'three';

/**
 * (Version 168) La acera norte de la Rambla Medular a la altura del 34-36, antes de la rotonda del Teatro, como en
 * la captura de Look Around del 23-11-2026 (PC de Arrecife, `Downloads\recursos lava game 2026-11-23\centro`, foto
 * 0606 «Rambla Medular, 34-36», mirando al oeste): una fila de palmeras en la acera y, detrás, un muro blanco
 * largo (el de las pistas y el solar que se ven en la foto aérea del juego). Antes ahí no había nada.
 * El muro choca. Las palmeras van por `map.extraPalms`, como las demás.
 * A ojo: dónde empieza y acaba el muro, su altura (2,2 m) y el sitio de cada palmera.
 */

// la línea del muro (x, z), a unos 8,7 m del eje de la calzada norte; la calzada queda al sur
const MURO = [[-301.3, -441.5], [-308.8, -437.6], [-332.2, -421.9], [-349.8, -408.2]];
const CALLE = [-327.1, -414.9];        // un punto del eje de la calzada, para saber de qué lado está
const ALTO = 2.2, GRUESO = 0.25, HASTA_ACERA = 1.7, CADA = 8.4;

function tramos() {
  const out = [];
  for (let i = 1; i < MURO.length; i++) {
    const a = MURO[i - 1], b = MURO[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    let nx = -uz, nz = ux;
    if ((CALLE[0] - a[0]) * nx + (CALLE[1] - a[1]) * nz < 0) { nx = -nx; nz = -nz; }
    out.push({ a, b, L, ux, uz, nx, nz });
  }
  return out;
}

/** las palmeras de la acera (antes de montar el mapa) */
export function tuneRamblaMuroNorte(map) {
  const puestas = [];
  let resto = CADA / 2, k = 0;
  for (const t of tramos()) {
    let s = resto;
    for (; s < t.L; s += CADA, k++) {
      puestas.push([+(t.a[0] + t.ux * s + t.nx * HASTA_ACERA).toFixed(1), +(t.a[1] + t.uz * s + t.nz * HASTA_ACERA).toFixed(1), 6.4 + (k * 3 % 4) * 0.5, (k * 1.7) % (Math.PI * 2)]);
    }
    resto = s - t.L;
  }
  map.extraPalms = [...(map.extraPalms || []), ...puestas];
  map.ramblaMuroNorte = { palmeras: puestas.length };
}

export function buildRamblaMuroNorte(scene, colliders, map) {
  const grupo = new THREE.Group();
  grupo.name = 'ramblaMuroNorte';
  const blanco = new THREE.MeshStandardMaterial({ color: 0xf1efe8, roughness: 0.9 });
  const zocalo = new THREE.MeshStandardMaterial({ color: 0xcfcbc2, roughness: 0.95 });
  let largo = 0;
  for (const t of tramos()) {
    const cx = (t.a[0] + t.b[0]) / 2, cz = (t.a[1] + t.b[1]) / 2, giro = Math.atan2(t.ux, t.uz);
    const pared = new THREE.Mesh(new THREE.BoxGeometry(GRUESO, ALTO, t.L + GRUESO), blanco);
    pared.position.set(cx, ALTO / 2, cz);
    const pie = new THREE.Mesh(new THREE.BoxGeometry(GRUESO + 0.06, 0.35, t.L + GRUESO), zocalo);
    pie.position.set(cx, 0.175, cz);
    pared.rotation.y = pie.rotation.y = giro;
    pared.castShadow = pared.receiveShadow = true;
    grupo.add(pared, pie);
    colliders?.addSegment?.(t.a[0], t.a[1], t.b[0], t.b[1]);
    largo += t.L;
  }
  grupo.userData.cuenta = { metros: Math.round(largo), palmeras: map?.ramblaMuroNorte?.palmeras || 0 };
  scene.add(grupo);
  return grupo;
}
