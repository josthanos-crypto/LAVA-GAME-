import * as THREE from 'three';

/**
 * ALDI de San Francisco Javier — Rambla Medular 58 (calle El Forito s/n).
 *
 * Es el primer ALDI de Lanzarote. La planta es la del edificio de OpenStreetMap
 * (way/1368710278), así que la posición y el choque son los reales: no se inventa
 * nada, solo se viste la nave.
 *
 * En el mapa el edificio venía como un bloque genérico de 4 m de alto; aquí se sube a
 * 7,6 m (lo que mide la nave de verdad), se pinta de blanco y se le pone lo que hace
 * que se reconozca: la franja azul corrida, el rótulo en la fachada larga, la entrada
 * con su marquesina y el aparcamiento de delante con las plazas pintadas.
 *
 * La fachada larga da al este (al aparcamiento) y la calle El Forito pasa por detrás.
 * Coordenadas del juego: x = (lon + 13,55) · 97398, z = (28,9625 − lat) · 111320.
 */

/** planta real del edificio (7 puntos, OSM) */
const POLY = [
  [-1167, 75], [-1149, 82], [-1152, 91], [-1147, 93], [-1171, 162], [-1195, 153],
];

export const ALDI = {
  nombre: 'ALDI',
  calle: 'Rambla Medular 58',
  centro: [-1171, 118],
  alto: 7.6,
};

const AZUL = 0x0b3f8f;        // el azul del rótulo
const BLANCO = 0xf3f2ee;      // la nave
const GRIS = 0x8d9295;        // herrajes
const CRISTAL = 0x2c3a42;     // el escaparate de la entrada
const ASFALTO = 0x4c4c4a;

/* ---------------------------------------------------------------- mapa */

/** retoques al mapa antes de levantar la ciudad */
export function tuneAldiSfj(map) {
  for (const b of map.buildings || []) {
    const p = b.p || [];
    if (p.length < 3) continue;
    let cx = 0, cz = 0;
    for (const q of p) { cx += q[0]; cz += q[1]; }
    cx /= p.length; cz /= p.length;
    if (Math.hypot(cx - ALDI.centro[0], cz - ALDI.centro[1]) > 14) continue;
    b.h = ALDI.alto;          // la nave de verdad, no el galpón de 4 m
    b.k = 'super';
    b.s = true;               // planta baja de tienda (escaparate)
    b.f = [244, 244, 241];    // fachada blanca
    b.c = [232, 232, 228];    // cubierta gris clara
  }

  // el cartel de ALDI que traía el mapa cae DENTRO de la nave (el nodo de OSM está en el
  // centro del edificio): se quita y el rótulo se pone en la fachada, donde se ve
  if (Array.isArray(map.signs)) {
    const antes = map.signs.length;
    map.signs = map.signs.filter((s) => s.name !== ALDI.nombre);
    if (map.meta && map.signs.length !== antes) map.meta.signs = map.signs.length;
  }
}

/* ---------------------------------------------------------------- construcción */

/** cuadrilátero horizontal (en el plano x·z) a una altura dada */
function quadXZ(corners, y) {
  const g = new THREE.BufferGeometry();
  const v = [];
  for (const p of corners) v.push(p[0], y, p[1]);
  const idx = [];
  for (let i = 1; i < corners.length - 1; i++) idx.push(0, i, i + 1);
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** el rótulo: ALDI en blanco sobre azul, con la raya clara de la marca */
function aldiLogoTexture() {
  const c = document.createElement('canvas');
  c.width = 640; c.height = 120;
  const x = c.getContext('2d');
  x.fillStyle = '#0b3f8f';
  x.fillRect(0, 0, 640, 120);
  x.fillStyle = '#8ecae6';
  x.fillRect(0, 112, 640, 5);
  x.fillStyle = '#ffffff';
  x.font = 'bold 92px Arial, Helvetica, sans-serif';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText('ALDI', 320, 58);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function buildAldiSfj(scene) {
  const group = new THREE.Group();
  group.name = 'aldiSanFranciscoJavier';

  const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0.05, ...extra });

  // --- ejes de la nave: U a lo largo de la fachada larga, N hacia el aparcamiento ---
  const A = [-1147, 93];
  const B = [-1171, 162];
  const LEN = Math.hypot(B[0] - A[0], B[1] - A[1]);
  const U = [(B[0] - A[0]) / LEN, (B[1] - A[1]) / LEN];
  const N = [U[1], -U[0]];                       // hacia fuera (el aparcamiento, al este)
  const P = (u, v) => [A[0] + U[0] * u + N[0] * v, A[1] + U[1] * u + N[1] * v];
  const giro = -Math.atan2(U[1], U[0]);          // deja el +X de la caja a lo largo de U
  const haciaFuera = Math.atan2(N[0], N[1]);     // deja el +Z del plano mirando a N

  // --- la franja azul corrida, vuelta entera por la fachada ---
  const banda = [];
  for (let i = 0; i < POLY.length; i++) {
    const a = POLY[i], b = POLY[(i + 1) % POLY.length];
    const dx = b[0] - a[0], dz = b[1] - a[1];
    const len = Math.hypot(dx, dz);
    if (len < 0.4) continue;
    const nx = dz / len, nz = -dx / len;
    const g = new THREE.BoxGeometry(len + 0.05, 1.6, 0.24);
    g.rotateY(-Math.atan2(dz, dx));
    g.translate((a[0] + b[0]) / 2 + nx * 0.1, 5.55, (a[1] + b[1]) / 2 + nz * 0.1);
    banda.push(g);
  }
  for (const g of banda) group.add(new THREE.Mesh(g, std(AZUL, { roughness: 0.7 })));

  // --- el aparcamiento de delante (asfalto) ---
  const asfalto = new THREE.Mesh(
    quadXZ([P(1.5, 2.4), P(LEN - 1.5, 2.4), P(LEN - 1.5, 12.5), P(1.5, 12.5)], 0.085),
    std(ASFALTO, { roughness: 0.95, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
  );
  asfalto.receiveShadow = true;
  group.add(asfalto);

  // --- las plazas pintadas ---
  const pintura = std(0xe8e8e2, { roughness: 0.9 });
  const PLAZA = 2.7;
  const primera = 6.2;
  const cuantas = 10;
  for (let i = 0; i <= cuantas; i++) {
    const [x, z] = P(primera + i * PLAZA, 7.2);
    const g = new THREE.BoxGeometry(0.13, 0.03, 5.0);
    g.rotateY(giro);
    g.translate(x, 0.1, z);
    group.add(new THREE.Mesh(g, pintura));
  }
  {
    const [x, z] = P(primera + (cuantas * PLAZA) / 2, 9.6);
    const g = new THREE.BoxGeometry(cuantas * PLAZA + 0.13, 0.03, 0.13);
    g.rotateY(giro);
    g.translate(x, 0.1, z);
    group.add(new THREE.Mesh(g, pintura));
  }

  // --- la entrada: escaparate oscuro, marquesina blanca y el rótulo encima ---
  const U_ENT = LEN * 0.34;
  {
    const [x, z] = P(U_ENT, 0.12);
    const g = new THREE.BoxGeometry(8.4, 3.0, 0.25);
    g.rotateY(giro);
    g.translate(x, 1.55, z);
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: CRISTAL, roughness: 0.18, metalness: 0.55 }));
    group.add(m);
  }
  {   // la marquesina
    const [x, z] = P(U_ENT, 1.5);
    const g = new THREE.BoxGeometry(9.6, 0.32, 3.0);
    g.rotateY(giro);
    g.translate(x, 3.62, z);
    const m = new THREE.Mesh(g, std(BLANCO, { roughness: 0.6 }));
    m.castShadow = true;
    group.add(m);
  }
  {   // el rótulo grande en la fachada, por delante de la franja
    const [x, z] = P(U_ENT, 0.32);
    const g = new THREE.PlaneGeometry(8.4, 1.575);
    g.rotateY(haciaFuera);
    g.translate(x, 5.55, z);
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({
      map: aldiLogoTexture(), roughness: 0.45, metalness: 0.1,
      emissive: 0x0b3f8f, emissiveIntensity: 0.18, side: THREE.DoubleSide,
    }));
    group.add(m);
  }
  {   // segundo rótulo, más pequeño, en el testero que se ve desde la Rambla
    const a = POLY[0], b = POLY[1];
    const dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz);
    const nx = dz / len, nz = -dx / len;
    const g = new THREE.PlaneGeometry(5.6, 1.05);
    g.rotateY(-Math.atan2(dz, dx) + Math.PI / 2);
    g.translate((a[0] + b[0]) / 2 + nx * 0.32, 5.6, (a[1] + b[1]) / 2 + nz * 0.32);
    group.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({
      map: aldiLogoTexture(), roughness: 0.45, metalness: 0.1, side: THREE.DoubleSide,
    })));
  }

  // --- el carro de la compra aparcado: el cobertizo metálico junto a la puerta ---
  {
    const [x, z] = P(U_ENT + 7.4, 1.9);
    const postes = std(GRIS, { roughness: 0.55, metalness: 0.6 });
    for (const [du, dv] of [[-1.5, -0.9], [1.5, -0.9], [-1.5, 0.9], [1.5, 0.9]]) {
      const [px, pz] = P(U_ENT + 7.4 + du, 1.9 + dv);
      const g = new THREE.BoxGeometry(0.09, 2.1, 0.09);
      g.translate(px, 1.05, pz);
      group.add(new THREE.Mesh(g, postes));
    }
    const t = new THREE.BoxGeometry(3.3, 0.1, 2.1);
    t.rotateY(giro);
    t.translate(x, 2.15, z);
    group.add(new THREE.Mesh(t, std(BLANCO, { roughness: 0.6 })));
  }

  // --- el peto de la cubierta: el borde blanco que remata la nave ---
  for (let i = 0; i < POLY.length; i++) {
    const a = POLY[i], b = POLY[(i + 1) % POLY.length];
    const dx = b[0] - a[0], dz = b[1] - a[1];
    const len = Math.hypot(dx, dz);
    if (len < 0.4) continue;
    const nx = dz / len, nz = -dx / len;
    const g = new THREE.BoxGeometry(len + 0.05, 0.55, 0.3);
    g.rotateY(-Math.atan2(dz, dx));
    g.translate((a[0] + b[0]) / 2 + nx * 0.12, ALDI.alto - 0.2, (a[1] + b[1]) / 2 + nz * 0.12);
    group.add(new THREE.Mesh(g, std(BLANCO, { roughness: 0.75 })));
  }

  scene.add(group);
  return group;
}
