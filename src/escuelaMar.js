import * as THREE from 'three';
import { Kit } from './interiorKit.js';
import { windowBay, bikeLane } from './escuelaPesca.js';
import { paveMesh, polyTris, piconRojo, lightSlabs } from './suelos.js';

/**
 * La trasera de la Escuela de Pesca, la que da al mar (foto de José Manuel desde la Avenida Olof Palme,
 * mirando al norte): la fachada blanca con aletas y ventanales oscuros y la barandilla de la azotea, el
 * muelle de hormigón entre el edificio y el agua con su barandilla, la pasarela que baja al pantalán
 * flotante y, amarrados, dos barcos naranjas (lo que pidió José Manuel) y una lancha blanca, con la fila
 * de boyas blancas. En el paseo de Olof Palme, el carril bici rojo, el picón rojo con cardones y las
 * piedras grandes de la orilla. Medidas sobre la foto aérea (el pantalán y los barcos se ven en ella).
 */

const WHITE = 0xf1f1ee, WATER_Y = 0.15, TOP = 11.2;
// la fachada de atrás: de la esquina sur (A) a la del este (B); hacia fuera, el mar
const A = [743.14, -18.55], B = [785.72, -51.99], N_BACK = [0.617, 0.786];
// el borde del agua detrás del edificio (contorno del mar del mapa)
const QUAY_EDGE = [[743.6, -9.2], [751.1, -12.4], [769.1, -28.6], [818.5, -64.7]];
// el pantalán: sale del muelle hacia el sureste (foto aérea)
const P0 = [766.4, -26.2], DIR = [0.55, 0.835], P_LEN = 34;
// la orilla del paseo de Olof Palme (contorno del mar) y el carril bici que sigue la avenida
const SHORE = [[724.2, 75.8], [720.2, 28.7], [722, 15.9], [726.2, 5.7], [743.6, -9.2]];
const LANE_S = [[715, -14], [715.4, -3], [716.3, 15], [717.7, 38.7], [720, 75]];
const PICON = [[716.8, -3], [717.7, 15], [719.1, 38.7], [721.4, 75], [724.2, 75.8], [720.2, 28.7], [722, 15.9], [726.2, 5.7], [736.4, -3]];

/** la fachada de atrás: bajo con ventanas corridas y la puerta grande del varadero, dos plantas de ventanales con aletas */
function backFacade(L) {
  const k = new Kit(), n = Math.round(L / 3.6), bay = L / n;
  k.box(L / 2, 0, 0.01, L, 3.25, 0.02, WHITE, { list: k.shell });
  k.box(L / 2, 3.2, 0.3, L, 0.72, 0.6, WHITE);
  k.box(L / 2, 3.92, 0.25, L, 0.8, 0.5, WHITE).box(L / 2, 6.5, 0.25, L, 1.25, 0.5, WHITE).box(L / 2, 9.7, 0.25, L, TOP - 9.7, 0.5, WHITE);
  k.box(L / 2, 4.72, 0.18, L, 4.98, 0.36, WHITE, { list: k.shell });
  const door = Math.round(n * 0.45);
  for (let i = 0; i <= n; i++) k.box(Math.min(L - 0.15, Math.max(0.15, i * bay)), 3.92, 0.3, 0.3, TOP - 3.92, 0.6, WHITE);
  for (let i = 0; i < n; i++) {
    const x0 = i * bay + 0.15, x1 = (i + 1) * bay - 0.15;
    for (const [y0, h] of [[4.72, 1.78], [7.75, 1.95]]) windowBay(k, x0, x1, y0, h, 3, 0.38);
    if (i === door) k.box((x0 + x1) / 2, 0, 0.05, x1 - x0 - 0.2, 2.9, 0.06, 0x3d4650);   // portón del varadero
    else windowBay(k, x0 + 0.2, x1 - 0.2, 1.0, 1.9, 3, 0.04);
  }
  // barandilla de la azotea
  for (let x = 0.2; x < L; x += 1.6) k.box(x, TOP, 0.2, 0.05, 1.0, 0.05, 0xe6e6e2);
  k.box(L / 2, TOP + 0.95, 0.2, L, 0.06, 0.08, 0xe6e6e2).box(L / 2, TOP + 0.5, 0.2, L, 0.04, 0.04, 0xe6e6e2);
  return k;
}

/** casco visto desde arriba (proa en +z), extruido hacia abajo desde la borda */
function hullShape(len, beam) {
  const s = new THREE.Shape(), h = len / 2, b = beam / 2;
  s.moveTo(0, h);
  s.quadraticCurveTo(b * 1.05, h * 0.35, b, -h * 0.2);
  s.lineTo(b * 0.92, -h);
  s.lineTo(-b * 0.92, -h);
  s.lineTo(-b, -h * 0.2);
  s.quadraticCurveTo(-b * 1.05, h * 0.35, 0, h);
  return s;
}

/** un barco: casco de color con la franja de arriba, cubierta, y cabina o motor fuera borda */
function boat(k, { len, beam, color, band, cabin }) {
  const s = hullShape(len, beam), D = 1.0;
  const hull = new THREE.ExtrudeGeometry(s, { depth: D, bevelEnabled: false, curveSegments: 10 });
  hull.rotateX(Math.PI / 2);
  hull.translate(0, 0.65, 0);
  // el casco va aparte, con algo de brillo propio: a la sombra el naranja se quedaba marrón
  const hullMesh = new THREE.Mesh(hull, new THREE.MeshStandardMaterial({ color, roughness: 0.5, emissive: color, emissiveIntensity: 0.22 }));
  hullMesh.castShadow = true;
  const strip = new THREE.ExtrudeGeometry(s, { depth: 0.16, bevelEnabled: false, curveSegments: 10 });
  strip.rotateX(Math.PI / 2);
  strip.scale(1.02, 1, 1.01);
  strip.translate(0, 0.67, 0);
  k.add(strip, band);
  const deck = new THREE.ShapeGeometry(s, 8);
  deck.rotateX(-Math.PI / 2);
  deck.scale(0.9, 1, 0.92);
  deck.translate(0, 0.6, 0);
  k.add(deck, 0xd8d4c8);
  if (cabin) {
    const cw = beam * 0.62, cl = len * 0.3, cz = -len * 0.05;
    k.box(0, 0.6, cz, cw, 1.25, cl, WHITE);
    k.box(0, 1.15, cz, cw + 0.03, 0.42, cl * 0.8, 0x232a31).box(0, 1.15, cz + cl / 2, cw * 0.86, 0.42, 0.03, 0x232a31);
    k.box(0, 1.85, cz, cw + 0.15, 0.06, cl + 0.25, WHITE);
    k.cyl(0, 1.91, cz - cl * 0.25, 0.03, 0.03, 1.3, 0xd8dade, { seg: 6 }).ball(0, 3.25, cz - cl * 0.25, 0.07, 0xf3f0e0);
  } else {
    k.box(0, 0.6, -len / 2 + 0.1, 0.36, 0.8, 0.4, 0x23262a);           // motor fuera borda
    for (const z of [0.4, -0.9]) k.box(0, 0.6, z, beam * 0.8, 0.08, 0.32, 0xe6e2d6);   // bancadas
  }
  return hullMesh;
}

/** el pantalán: pasarela desde el muelle, tablero flotante con cornamusas y defensas, y los barcos */
function pontoon() {
  const k = new Kit(), W = 2.4, DECK = WATER_Y + 0.2;
  // rellano en el borde del muelle con dos escalones y la pasarela que baja, con barandillas
  k.box(0, 0, -3.2, 2.6, 0.75, 2.0, 0xbab7af).box(0, 0, -4.45, 2.6, 0.5, 0.5, 0xbab7af).box(0, 0, -4.95, 2.6, 0.25, 0.5, 0xbab7af);
  const rampL = 6.2, a = Math.atan2(0.75 - DECK, rampL);
  for (const side of [-1, 0, 1]) {
    const g = new THREE.BoxGeometry(side ? 0.05 : 1.3, side ? 0.05 : 0.08, rampL);
    g.rotateX(a);
    g.translate(side * 0.65, (0.75 + DECK) / 2 + (side ? 0.95 : 0), -2.2 + rampL / 2);
    k.add(g, side ? 0xc9ccd0 : 0x9a9c9e);
  }
  for (let t = 0; t <= 1.001; t += 0.25) for (const side of [-1, 1]) k.box(side * 0.65, 0.75 - (0.75 - DECK) * t, -2.2 + rampL * t, 0.04, 0.95, 0.04, 0xc9ccd0);
  // el tablero flotante con sus flotadores oscuros y cornamusas
  const z0 = 4.0;
  k.box(0, WATER_Y - 0.25, z0 + P_LEN / 2, W, 0.25, P_LEN, 0x3a3d40);
  k.box(0, WATER_Y, z0 + P_LEN / 2, W, 0.2, P_LEN, 0xdcdcd6);
  k.box(0, WATER_Y + 0.2, z0 + P_LEN / 2, W + 0.1, 0.03, P_LEN + 0.1, 0xcfcfca);
  for (let z = z0 + 2; z < z0 + P_LEN; z += 4) for (const side of [-1, 1]) k.box(side * (W / 2 - 0.12), DECK, z, 0.12, 0.1, 0.35, 0x5a5d60);
  k.seg(-W / 2, z0, -W / 2, z0 + P_LEN).seg(W / 2, z0, W / 2, z0 + P_LEN).seg(-W / 2, z0 + P_LEN, W / 2, z0 + P_LEN);
  // amarrados: el barco naranja con cabina a la izquierda, la lancha blanca y el naranja abierto a la derecha
  const moored = [
    [-W / 2 - 1.6, z0 + 11, { len: 7.6, beam: 2.6, color: 0xffa23e, band: WHITE, cabin: true }],
    [W / 2 + 1.5, z0 + 17, { len: 6.8, beam: 2.4, color: 0xf2f2ee, band: 0x1f4e8a, cabin: true }],
    [W / 2 + 1.3, z0 + 28, { len: 5.4, beam: 2.1, color: 0xff9a30, band: WHITE, cabin: false }],
  ];
  const boats = moored.map(([x, z, spec]) => {
    const b = new Kit();
    const hull = boat(b, spec);
    const { group } = b.build('barco');
    group.add(hull);
    // la borda queda ~0,8 m por encima del agua
    group.position.set(x, WATER_Y + 0.15, z);
    for (const dz of [-1.5, 1.5]) k.cyl(Math.sign(x) * (W / 2 + 0.12), WATER_Y + 0.1, z + dz, 0.12, 0.12, 0.5, WHITE, { seg: 8 });   // defensas
    return group;
  });
  return { k, boats };
}

/** cardón: columnas verdes juntas, de distinta altura */
function cardon(k, x, z, s) {
  for (let i = 0; i < 9; i++) {
    const a = i * 2.4, d = (0.1 + (i % 4) * 0.12) * s, h = (0.8 + ((i * 7) % 5) * 0.25) * s;
    k.cyl(x + Math.cos(a) * d, 0.2, z + Math.sin(a) * d, 0.08 * s, 0.09 * s, h, 0x5f7f55, { seg: 7 });
    k.ball(x + Math.cos(a) * d, 0.2 + h, z + Math.sin(a) * d, 0.08 * s, 0x5f7f55, { seg: 6 });
  }
  k.block(x, z, 0.8 * s, 0.8 * s);
}

export function buildEscuelaMar(scene, colliders) {
  const place = (k, origin, n, name) => {
    const { group, segs } = k.build(name);
    const ex = [n[1], -n[0]];
    group.position.set(origin[0], 0, origin[1]);
    group.rotation.y = Math.atan2(n[0], n[1]);
    scene.add(group);
    const w = (x, z) => [origin[0] + ex[0] * x + n[0] * z, origin[1] + ex[1] * x + n[1] * z];
    for (const [ax, az, bx, bz] of segs) colliders.addSegment(...w(ax, az), ...w(bx, bz));
    return group;
  };
  place(backFacade(Math.hypot(B[0] - A[0], B[1] - A[1])), A, N_BACK, 'escuelaPescaTrasera');
  // el muelle de hormigón entre el edificio y el agua, con la barandilla en el borde (menos en la pasarela)
  const slab = paveMesh(polyTris([A, B, ...QUAY_EDGE.slice().reverse()]), 0.2, lightSlabs(), 0xc9c5bd);
  if (slab) { slab.name = 'muelleEscuela'; scene.add(slab); }
  const rail = new Kit();
  for (let i = 0; i < QUAY_EDGE.length - 1; i++) {
    const [ax, az] = QUAY_EDGE[i], [bx, bz] = QUAY_EDGE[i + 1], len = Math.hypot(bx - ax, bz - az);
    for (let t = 0; t < len; t += 1.8) {
      const x = ax + ((bx - ax) * t) / len, z = az + ((bz - az) * t) / len;
      if (Math.hypot(x - P0[0], z - P0[1]) < 1.6) continue;
      rail.box(x, 0.2, z, 0.05, 1.0, 0.05, 0xd9dcdf);
      const x2 = ax + ((bx - ax) * Math.min(len, t + 1.8)) / len, z2 = az + ((bz - az) * Math.min(len, t + 1.8)) / len;
      if (Math.hypot(x2 - P0[0], z2 - P0[1]) < 1.6) continue;
      const g = new THREE.BoxGeometry(0.05, 0.05, Math.hypot(x2 - x, z2 - z));
      g.rotateY(Math.atan2(x2 - x, z2 - z));
      for (const y of [0.6, 1.17]) rail.add(g.clone().translate((x + x2) / 2, y, (z + z2) / 2), 0xd9dcdf);
      rail.seg(x, z, x2, z2);
    }
  }
  const r = rail.build('barandillaMuelleEscuela');
  scene.add(r.group);
  for (const sg of r.segs) colliders.addSegment(...sg);
  // el pantalán con los barcos (x a lo ancho, z hacia fuera)
  const { k: pk, boats } = pontoon();
  const pg = place(pk, P0, DIR, 'pantalanEscuela');
  for (const b of boats) pg.add(b);
  // la fila de boyas blancas delante
  const buoys = new Kit();
  for (let i = 0; i <= 16; i++) buoys.ball(752 + i * 1.5, WATER_Y + 0.05, 2 + i * 0.62, 0.17, 0xf4f4f0, { seg: 8 });
  scene.add(buoys.build('boyasEscuela').group);
  // el paseo de Olof Palme: carril bici rojo, picón rojo con cardones y piedras grandes en la orilla
  const walk = new Kit();
  bikeLane(walk, LANE_S);
  const ground = paveMesh(polyTris(PICON), 0.2, piconRojo(), 0xffffff);
  if (ground) { ground.name = 'piconPaseoOlofPalme'; scene.add(ground); }
  for (const [x, z, s] of [[722.5, 9.5, 1.1], [720.4, 22, 0.9], [719.6, 33, 1.0], [720.4, 48, 1.15], [721.4, 62, 0.95], [728, 1.2, 1.0]]) cardon(walk, x, z, s);
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < SHORE.length - 1; i++) {
    const [ax, az] = SHORE[i], [bx, bz] = SHORE[i + 1], len = Math.hypot(bx - ax, bz - az);
    for (let t = 0.5; t < len; t += 1.3 + rnd() * 0.6) {
      const x = ax + ((bx - ax) * t) / len, z = az + ((bz - az) * t) / len, s = 0.6 + rnd() * 0.8;
      const g = new THREE.IcosahedronGeometry(s, 1);
      g.scale(1, 0.7, 0.9);
      g.rotateY(rnd() * 3);
      walk.add(g.translate(x + (rnd() - 0.3) * 0.8, 0.1 + s * 0.2, z), rnd() < 0.5 ? 0x99948e : 0x7c7772);
    }
  }
  const wg = walk.build('paseoOlofPalme');
  scene.add(wg.group);
  for (const sg of wg.segs) colliders.addSegment(...sg);
}
