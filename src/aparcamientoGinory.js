import * as THREE from 'three';
import { Kit } from './interiorKit.js';
import { paveMesh, polyTris, asfalto } from './suelos.js';

/**
 * El aparcamiento de enfrente de la antigua Casa Ginory (Charco Vivo), la explanada grande entre la
 * Calle Juan de Quesada, el paseo del Charco y la Avenida Olof Palme (foto de José Manuel desde el
 * lado de Ginory, mirando hacia el Charco, y la foto aérea, donde sale llena de coches).
 * Asfalto, filas de plazas pintadas con sus coches (GINORY_SPOTS, que pasan a map.lotSpots para que
 * parked.js aparque en ellas), las farolas altas de mástil en fila con las guirnaldas de bombillas
 * colgadas de una a otra, el paso de cebra de Juan de Quesada y palmeras en el borde de Olof Palme
 * (GINORY_PALMS, a map.extraPalms). El edificio blanco de la esquina del paseo es de dos plantas (foto y
 * sombra de la foto aérea), no de cinco como venía en el mapa.
 * Y los gorrillas (lo pidió José Manuel): dos aparcacoches con chaleco amarillo reflectante y gorra que
 * van y vienen por los pasillos y se paran mirando a la entrada; se habla con ellos con T y se les puede
 * dar la voluntad (buildGorrillasGinory, en la segunda fase, porque van con los locales).
 */

// la explanada: la acera de Juan de Quesada (noroeste), la curva de arriba, la acera de Olof Palme,
// el paseo del Charco (Avenida César Manrique) y el edificio blanco de la esquina (suroeste)
const LOT = [[583.6, 90.4], [606.8, 65.8], [623.3, 49], [640, 44.5], [656, 51.5], [676, 56], [703, 54],
  [705.5, 115], [688.7, 118.1], [599, 110.4], [598.4, 101.6], [598.6, 93.6]];
const CAR_L = 4.6, STALL = 2.6;
// las filas: z del centro de la plaza y hacia dónde mira el morro (0 = al sur, PI = al norte); por parejas
// espalda con espalda y pasillos de 6 a 8 m entre ellas (en los pasillos van las farolas)
const ROWS = [[57.4, Math.PI], [62.4, 0], [75, Math.PI], [80, 0], [92.6, Math.PI], [97.6, 0], [107.5, 0]];
// las filas de farolas, en el centro de los pasillos
const POLE_ROWS = [[68.7, 628, 694], [86.3, 598, 694], [102.5, 606, 694]];
const POLE_STEP = 16, POLE_H = 10.5, HANG = 9.1, SAG = 0.9;
// el paso de cebra de Juan de Quesada, de la acera de Ginory a la explanada
const ZEBRA = [597, 63.5], ZEBRA_N = [0.714, 0.7];
// hacia dónde miran los gorrillas cuando se paran: a Juan de Quesada, por donde llegan los coches
const FACE_ENTRADA = Math.atan2(-0.7, -0.7);
// los gorrillas: cómo van y por qué pasillo andan (al lado de la fila de farolas, sin pisar las plazas)
const GORRILLAS = [
  {
    name: 'El gorrilla',
    look: {
      sex: 'm', skin: 0xb07a52, hair: 0x1e1712, hairStyle: 'short', eyes: 0x3a2616,
      top: 0x2b3a4a, topStyle: 'tshirt', bottom: 0x3b4a66, bottomStyle: 'pants',
      shoes: 0xe6e6e2, shoeStyle: 'shoe', cap: true, capColor: 0x1d1d1f, height: 1.76, build: 1.08,
    },
    ruta: [[602, 87.8], [646, 87.8], [688, 87.8]],
  },
  {
    name: 'El gorrilla veterano',
    look: {
      sex: 'm', skin: 0x9a6844, hair: 0x8c8580, hairStyle: 'short', beard: true, eyes: 0x3a2616,
      top: 0xd9d4c8, topStyle: 'tshirt', bottom: 0x4a4038, bottomStyle: 'pants',
      shoes: 0x3a2e24, shoeStyle: 'shoe', cap: true, capColor: 0xa82020, shades: true, height: 1.7, build: 1.25,
    },
    ruta: [[634, 70.2], [662, 70.2], [690, 70.2]],
  },
];

function inside(poly, x, z) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, az] = poly[i], [bx, bz] = poly[j];
    if ((az > z) !== (bz > z) && x < ax + ((z - az) * (bx - ax)) / (bz - az)) c = !c;
  }
  return c;
}

/** las plazas que caben enteras en la explanada (y no todas ocupadas: se deja algún hueco) */
function stalls() {
  const out = [];
  let s = 977;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (const [z, h] of ROWS) {
    for (let x = 586; x < 706; x += STALL) {
      const fits = [[-1, -1], [1, -1], [1, 1], [-1, 1]].every(([a, b]) => inside(LOT, x + a * STALL / 2, z + b * (CAR_L / 2 + 0.2)));
      if (fits && r() < 0.65) out.push([x, z, h]);
    }
  }
  return out;
}
export const GINORY_SPOTS = stalls();
// palmeras en el borde de Olof Palme: [x, z, alto, giro]
export const GINORY_PALMS = [[701.8, 64], [702.4, 76], [703, 88], [703.6, 100], [704.2, 111]].map(([x, z], i) => [x, z, 8.2 + (i % 3) * 0.7, i * 1.9]);

/** antes de levantar la ciudad: las plazas para parked.js, las palmeras y el edificio blanco de la esquina */
export function tuneAparcamientoGinory(map) {
  map.lotSpots?.push(...GINORY_SPOTS);
  map.extraPalms = map.extraPalms || [];
  map.extraPalms.push(...GINORY_PALMS);
  const b = (map.buildings || []).find(q => !q.skip && inside(q.p, 590, 97) && inside(q.p, 570, 101));
  if (b) { b.h = 8.5; b.f = [244, 242, 236]; }
}

/** farola de mástil alta (foto): poste galvanizado fino, con el brazo y los dos focos arriba */
function mastil(k, x, z) {
  const POLE = 0xaab0b6;
  k.cyl(x, 0, z, 0.2, 0.22, 0.35, 0x5d6166, { seg: 10 });
  k.cyl(x, 0.35, z, 0.075, 0.12, POLE_H - 0.35, POLE, { seg: 10 });
  k.box(x, POLE_H - 0.1, z, 1.5, 0.08, 0.08, POLE);
  for (const s of [-1, 1]) k.box(x + s * 0.7, POLE_H - 0.3, z, 0.22, 0.2, 0.3, 0x3a3e43);
  k.block(x, z, 0.45, 0.45);
}

/** guirnalda colgada entre dos postes: cable que cae en curva y bombillas cada poco */
function guirnalda(k, ax, az, bx, bz) {
  const n = 16, pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push([ax + (bx - ax) * t, HANG - SAG * 4 * t * (1 - t), az + (bz - az) * t]);
  }
  for (let i = 0; i < n; i++) {
    const [x0, y0, z0] = pts[i], [x1, y1, z1] = pts[i + 1];
    const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0, L = Math.hypot(dx, dy, dz);
    k.cyl(x0, y0, z0, 0.012, 0.012, L, 0x2a2c2e, { seg: 4, rx: Math.acos(dy / L), ry: Math.atan2(dx, dz) });
    k.ball(x0 + dx / 2, y0 + dy / 2 - 0.08, z0 + dz / 2, 0.055, 0xffd27a, { seg: 6, list: k.glow });
  }
}

export function buildAparcamientoGinory(scene, colliders) {
  const group = new THREE.Group();
  group.name = 'aparcamientoGinory';
  const pave = paveMesh(polyTris(LOT), 0.14, asfalto(), 0xe0dcd6);
  if (pave) group.add(pave);
  const k = new Kit(), LINE = 0xe9e7e0;
  // las rayas de las plazas: las dos de los lados de cada una
  for (const [x, z, h] of GINORY_SPOTS) {
    for (const s of [-1, 1]) k.box(x + s * STALL / 2, 0.16, z, 0.1, 0.015, CAR_L + 0.3, LINE, { ry: h, list: k.shell });
  }
  // las farolas en fila por los pasillos, con la guirnalda de una a la siguiente
  for (const [z, x0, x1] of POLE_ROWS) {
    let prev = null;
    for (let x = x0; x <= x1; x += POLE_STEP) {
      if (!inside(LOT, x, z)) { prev = null; continue; }
      mastil(k, x, z);
      if (prev) guirnalda(k, prev, z, x, z);
      prev = x;
    }
  }
  // el paso de cebra de Juan de Quesada: bandas a lo largo de la calle, de acera a acera
  const ry = Math.atan2(ZEBRA_N[0], ZEBRA_N[1]);
  for (let s = -3.6; s <= 3.61; s += 0.9) k.box(ZEBRA[0] + ZEBRA_N[0] * s, 0.165, ZEBRA[1] + ZEBRA_N[1] * s, 3.0, 0.012, 0.45, 0xf1f0ec, { ry, list: k.shell });
  const built = k.build('cosasAparcamientoGinory');
  group.add(built.group);
  for (const sg of built.segs) colliders.addSegment(...sg);
  scene.add(group);
  return group;
}

/**
 * el torso del muñeco (buildHuman, build 1,05) por fuera de la camiseta: [altura sobre la columna, medio ancho,
 * medio fondo]; de la cadera a los hombros
 */
const TORSO = [
  [-0.24, 0.175, 0.118], [-0.12, 0.172, 0.118], [0.07, 0.181, 0.122], [0.19, 0.193, 0.133],
  [0.23, 0.202, 0.137], [0.31, 0.207, 0.129], [0.39, 0.205, 0.113], [0.43, 0.178, 0.095],
];

/**
 * chaleco reflectante amarillo de los de verdad: cerrado y amarillo entero, por delante, por detrás y por
 * los hombros hasta el cuello, con las bandas grises (dos alrededor y dos que suben por delante y por detrás
 * hasta los hombros). Pegado al torso: una malla con los anillos del perfil cada 2 cm
 */
function chaleco(parts, build) {
  const f = build / 1.05, SEG = 64;
  const amarillo = new THREE.Color(0xf2dc12), gris = new THREE.Color(0xc4c8cc);
  const perfil = (y) => {
    let k = 0;
    while (k < TORSO.length - 2 && y > TORSO[k + 1][0]) k++;
    const [y0, a0, b0] = TORSO[k], [y1, a1, b1] = TORSO[k + 1], t = Math.min(1, Math.max(0, (y - y0) / (y1 - y0)));
    return [a0 + (a1 - a0) * t, b0 + (b1 - b0) * t];
  };
  const anillo = (y, a, b, dz = 0) => Array.from({ length: SEG }, (_, i) => {
    const t = (i / SEG) * Math.PI * 2;
    return [Math.sin(t) * a * f, y, (Math.cos(t) * b + dz) * f];
  });
  const rings = [];
  for (let y = -0.24; y < 0.4301; y += 0.02) rings.push(anillo(y, ...perfil(y)));
  // el cuello redondo, encima de los hombros
  rings.push(anillo(0.45, 0.08, 0.075, 0.01));
  // las bandas: dos alrededor de la cintura y dos que suben por delante y por detrás hasta los hombros
  const banda = (x, y) => (y > -0.155 && y < -0.105) || (y > -0.035 && y < 0.015) || (y > 0.015 && Math.abs(Math.abs(x) / f - 0.09) < 0.022);
  const pos = [], col = [];
  for (let r = 0; r < rings.length - 1; r++) {
    for (let i = 0; i < SEG; i++) {
      const A = rings[r][i], B = rings[r][(i + 1) % SEG], C = rings[r + 1][(i + 1) % SEG], D = rings[r + 1][i];
      const c = banda((A[0] + B[0] + C[0] + D[0]) / 4, (A[1] + B[1] + C[1] + D[1]) / 4) ? gris : amarillo;
      for (const P of [A, B, C, A, C, D]) { pos.push(...P); col.push(c.r, c.g, c.b); }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, side: THREE.DoubleSide }));
  m.castShadow = true;
  parts.spine.add(m);
}

/** va y viene por su pasillo; en cada punto se para un rato mirando a la entrada, a ver quién llega */
function patrulla(ruta) {
  let i = 1, dir = 1, wait = Math.random() * 4;
  return (n, dt) => {
    if (wait > 0) { wait -= dt; n.walking = false; return; }
    const [tx, tz] = ruta[i], dx = tx - n.x, dz = tz - n.z, d = Math.hypot(dx, dz);
    if (d < 0.1) {
      wait = 2.5 + Math.random() * 4;
      n.face = FACE_ENTRADA + (Math.random() - 0.5) * 0.9;
      i += dir;
      if (i >= ruta.length || i < 0) { dir = -dir; i += dir * 2; }
      return;
    }
    n.walking = true;
    n.face = Math.atan2(dx, dz);
    const step = Math.min(d, 1.15 * dt);
    n.x += (dx / d) * step;
    n.z += (dz / d) * step;
  };
}

/** lo que dicen: lo de siempre de los aparcacoches del Charco */
function charla(name) {
  return ({ me, key, visits }) => {
    const nino = key === 'iria' ? 'mi niña' : 'mi niño';
    if (visits === 0) {
      return [
        { who: name, text: `¡Ven, ven, ven, ${nino}! Échalo pa'cá, que ahí cabe de sobra.` },
        { who: me, text: '¿Aquí está bien?', player: true },
        { who: name, text: 'Clavado. Tú tranquilo, que yo te lo vigilo. La voluntad, lo que tú veas.' },
      ];
    }
    if (visits === 1) {
      return [
        { who: name, text: '¡Dale, dale, dale... para, para! Así, perfecto. Ni un rasguño.' },
      ];
    }
    return [
      { who: name, text: 'Aquí enfrente de Ginory no se escapa un hueco. A estas horas se llena todo con la gente del Charco.' },
    ];
  };
}

/** los dos gorrillas, en la segunda fase (addStreetNpc es de los locales); se habla con ellos con T */
export function buildGorrillasGinory(locales) {
  return GORRILLAS.map(({ name, look, ruta }) => locales.addStreetNpc({
    name,
    look,
    at: ruta[0],
    face: FACE_ENTRADA,
    pose: 'stand',
    dress: (parts) => chaleco(parts, look.build),
    move: patrulla(ruta),
    talk: charla(name),
    offer: {
      label: 'Darle la voluntad',
      price: 1,
      talk: (v) => [
        { who: v.me, text: "Toma, pa'l cafelito.", player: true },
        { who: name, text: v.paid ? '¡Gracias! Vete tranquilo, que aquí no se acerca nadie.' : 'Déjalo, déjalo, hoy invito yo. ¡Ya me darás otro día!' },
      ],
      apply: (v) => v.toast('El gorrilla te vigila el coche'),
    },
  }));
}
