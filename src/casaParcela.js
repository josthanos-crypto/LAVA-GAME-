import * as THREE from 'three';
import { Kit } from './interiorKit.js';
import { paveMesh, polyTris, discTris, lightSlabs } from './suelos.js';

/**
 * (Version 153) La parcela de la casa de José Manuel, de la casa hacia el sur, en su sitio de verdad.
 *
 * Medida sobre la ortofoto oficial del IGN (PNOA, 4 cm por punto) y los fotogramas de la llegada
 * (recursos\argana alta\argana-alta-frames\IMG_5113, del 9 al 13):
 *  - la parcela va de x = -2010 a -1996,4; la casa arriba (da a la calle) y, al fondo, un bloque blanco en L;
 *  - el garaje es la parte oeste de ese bloque y su puerta seccional mira al OESTE, a la explanada de grava;
 *  - el muro del sur del bloque da a la pista: ahí están las macetas, las garrafas, la mesa, el casco de barca,
 *    los palés y EL ÁRBOL, que queda en la esquina de abajo a la derecha (sureste), no junto a la puerta;
 *  - en medio, el patio de baldosa con la piscina (con su entrada de escalones al norte) y, al este, el jardín.
 * Antes esto era el patio de casaCampo.js girado: la puerta y el árbol caían al revés. Las piezas son las mismas
 * (delfines, busto, tumbonas, pérgola de chapa, cuarto del tejado rosa...), cada una en su sitio.
 */
const rect = (x0, z0, x1, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1], [x0, z0]];
const X0 = -2010, X1 = -1996.4, ZN = -3295, ZS = -3271.8;
const GARAJE = [X0, -3277.8, -2004.8, ZS], PASO = [-2004.8, -3276.6, -2001.2, ZS], CUARTO = [-2001.2, -3279.4, X1, ZS];
const ALTO = 3.1;
const WHITE = 0xf2f0ea, CAL = 0xe9e6de, WOOD = 0x6b5038;

/** los tres cuerpos del bloque del fondo, para el mapa (choques, tejados y minimapa) */
export const PARCELA_EDIFICIOS = [GARAJE, PASO, CUARTO].map(([x0, z0, x1, z1]) => ({ p: rect(x0, z0, x1, z1), h: ALTO, k: 'gen', skip: true, ownRoof: true }));

/**
 * La casa vecina del oeste: el Catastro le da tres plantas y salía más alta que la casa, pero en los fotogramas de la
 * llegada se ve más baja que la terraza. Se queda en una planta alta (las alturas puestas a mano mandan).
 */
export function tuneParcela(map) {
  for (const b of map.buildings) {
    if (b.skip || !b.p) continue;
    const n = b.p.length - 1, cx = b.p.slice(0, n).reduce((t, q) => t + q[0], 0) / n, cz = b.p.slice(0, n).reduce((t, q) => t + q[1], 0) / n;
    if (Math.hypot(cx + 2017, cz + 3305.5) < 7) { b.h = 3.6; b.plantas = 1; }
  }
}

function lienzo(base, [v0, v1], tinte, mpt) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  let s = 53;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  g.fillStyle = base;
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) {
    const v = v0 + r() * (v1 - v0), d = 1 + r() * 2.5;
    g.fillStyle = `rgb(${Math.round(v * tinte[0])},${Math.round(v * tinte[1])},${Math.round(v * tinte[2])})`;
    g.fillRect(r() * 256, r() * 256, d, d);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.userData.mpt = mpt;
  return t;
}
/** la grava gris oscura de delante del garaje (en las fotos no es negra) y el césped del jardín */
const grava = () => lienzo('#55524e', [50, 125], [1, 0.98, 0.95], 1.6);
const cesped = () => lienzo('#5f7a43', [70, 135], [0.72, 1, 0.5], 2);

function suelo(scene, tris, y, tex, color, nombre) {
  const m = paveMesh(tris, y, tex, color);
  if (m) { m.name = nombre; scene.add(m); }
}

/** el bloque del fondo: garaje con la puerta al oeste, el paso y el cuarto del tejado de losetas rosas */
function bloque(k) {
  const caja = ([x0, z0, x1, z1], h, techo) => {
    k.box((x0 + x1) / 2, 0, (z0 + z1) / 2, x1 - x0, h, z1 - z0, WHITE, { list: k.shell }).block((x0 + x1) / 2, (z0 + z1) / 2, x1 - x0, z1 - z0);
    k.box((x0 + x1) / 2, h, (z0 + z1) / 2, x1 - x0 + 0.1, 0.08, z1 - z0 + 0.1, techo, { list: k.shell });
  };
  caja(GARAJE, ALTO, CAL);
  caja(PASO, ALTO - 0.15, CAL);
  caja(CUARTO, ALTO - 0.1, 0xd9907e);
  for (let x = CUARTO[0] + 0.3; x < CUARTO[2]; x += 0.6) k.box(x, ALTO - 0.02, (CUARTO[1] + CUARTO[3]) / 2, 0.03, 0.02, CUARTO[3] - CUARTO[1] + 0.1, 0xb8705f, { list: k.shell });
  // la puerta seccional color crema, en la pared del oeste, con sus juntas, el tirador y la rampa de hormigón
  const zP = -3274.35, aP = 3.3;
  k.box(X0 - 0.03, 0.02, zP, 0.06, 2.55, aP, 0xd9d4c6);
  for (let y = 0.52; y < 2.5; y += 0.5) k.box(X0 - 0.07, y, zP, 0.02, 0.03, aP, 0xb9b3a4);
  k.box(X0 - 0.08, 0.95, zP + 0.9, 0.03, 0.06, 0.25, 0x3a3a3a);
  k.box(X0 - 0.95, 0, zP, 1.9, 0.14, aP + 0.5, 0xcfcbc2, { list: k.shell });
  // las dos rejillas de arriba, a la izquierda de la puerta
  for (const z of [-3277.25, -3276.95]) k.box(X0 - 0.03, 2.72, z, 0.04, 0.1, 0.16, 0x2b2b2b);
  // la puerta del cuarto, al patio
  k.box(-1999, 0, CUARTO[1] - 0.04, 0.9, 2.1, 0.1, 0xf4f4f0).box(-1999, 0.05, CUARTO[1] - 0.06, 0.72, 1.95, 0.1, 0x1d2328);
}

/** el muro del sur del bloque, el que da a la pista: las vetas de óxido, la luz de seguridad y todo lo que hay delante */
function muroSur(k, oxido) {
  const z = ZS + 0.04;
  if (oxido) for (const x of [-2006.6, -1999.8]) k.pic(x, ALTO / 2, z, 6.8, ALTO, 0, 1, oxido);
  k.box(-2004, 2.7, ZS + 0.14, 0.3, 0.14, 0.25, 0x2b2b2b).box(-2004, 2.63, ZS + 0.27, 0.42, 0.12, 0.06, 0xdedede);
  const d = (m) => X0 + m;   // metros desde la esquina del garaje, hacia el este
  for (const m of [0.5, 1.1]) k.box(d(m), 0, ZS + 0.4, 0.4, 0.42, 0.4, 0xf4f4f0).ball(d(m), 0.6, ZS + 0.4, 0.18, 0x4f7a3a, { sy: 1.4 });
  for (const m of [1.7, 2.05]) k.cyl(d(m), 0, ZS + 0.45, 0.13, 0.13, 0.42, 0xbfd8a8, { seg: 10 });
  k.box(d(3.8), 0.95, ZS + 0.4, 2.2, 0.06, 0.45, WOOD);
  for (const m of [2.9, 4.7]) k.box(d(m), 0, ZS + 0.4, 0.1, 0.95, 0.1, WOOD).box(d(m) - 0.3, 0, ZS + 0.58, 0.08, 0.95, 0.08, WOOD);
  // el casco de barca de madera con su franja azul, los palés, la hormigonera y los palés azules y amarillos
  k.box(d(6.8), 0, ZS + 0.8, 2.6, 1.35, 0.22, 0x2c3438, { ry: -0.12 }).box(d(6.8), 1.05, ZS + 0.93, 2.5, 0.12, 0.03, 0x2a5aa6, { ry: -0.12 });
  for (let i = 0; i < 3; i++) k.box(d(10.6 + i * 0.5), 0, ZS + 0.25 + i * 0.12, 1.1, 1.05, 0.1, 0x4a3a2c);
  k.cyl(d(12.2), 0.9, ZS + 2.3, 0.42, 0.3, 0.9, 0x6e5a44, { rx: 0.6, seg: 12 }).box(d(12.2), 0, ZS + 2.3, 0.6, 0.5, 0.8, 0x4a3a2c);
  k.box(d(13), 0, ZS + 0.5, 1.25, 1.0, 0.12, 0x7aa6cf).box(d(13), 1.0, ZS + 0.5, 1.25, 0.1, 0.14, 0xd8c23a);
  // el árbol: en la esquina de abajo a la derecha del bloque (lo dijo José Manuel y así sale en la foto oficial)
  const ax = -2001, az = ZS + 1.4;
  k.cyl(ax, 0, az, 0.13, 0.2, 2.1, 0x5a4636, { seg: 7 });
  for (const [dx, dy, dz, r] of [[0, 3.0, 0, 1.6], [-1.4, 2.7, 0.1, 1.25], [1.4, 2.75, 0.2, 1.3], [0.3, 3.75, -0.1, 1.05]]) k.ball(ax + dx, dy, az + dz, r, 0x3f6a34, { seg: 8 });
  k.block((X0 + X1) / 2, ZS + 0.6, X1 - X0, 1.2);
}

/** el patio: muros, cancela, baldosa, piscina con su entrada, jardín, pérgola de chapa, busto, tumbonas y delfines */
function patio(k, scene, delfin) {
  // el muro del oeste (de la casa a la cancela) y el del este
  for (const [x, za, zb, h] of [[X0 + 0.15, ZN, -3281, 2.5], [X1 - 0.15, ZN, CUARTO[1], 2.2]]) {
    k.box(x, 0, (za + zb) / 2, 0.3, h, zb - za, WHITE, { list: k.shell }).box(x, h, (za + zb) / 2, 0.36, 0.06, zb - za, CAL).seg(x, za, x, zb);
  }
  // la cancela, entre el muro y el garaje: cerrada pero pasable a pie
  k.box(X0 + 0.15, 0, -3279.4, 0.08, 1.9, 3.2, 0x2e3b33);
  // suelos: baldosa alrededor de la piscina y hasta el bloque; césped al este; el redondel gris del jardín
  suelo(scene, polyTris([[X0 + 0.3, ZN], [-2001.6, ZN], [-2001.6, PASO[1]], [GARAJE[2], PASO[1]], [GARAJE[2], GARAJE[1]], [X0 + 0.3, GARAJE[1]]]), 0.2, lightSlabs(), 0xcfcdc8, 'patioCasaReal');
  suelo(scene, polyTris(rect(-2001.6, ZN, X1 - 0.3, CUARTO[1]).slice(0, 4)), 0.19, cesped(), 0xffffff, 'jardinCasaReal');
  suelo(scene, discTris(-1998.1, -3292.7, 1.6, 20), 0.22, lightSlabs(), 0xb3b1ac, 'redondelCasaReal');
  // la piscina, con el borde blanco y la entrada de escalones al norte
  const pool = (x0, z0, x1, z1, borde) => {
    k.box((x0 + x1) / 2, 0.2, (z0 + z1) / 2, x1 - x0 + borde * 2, 0.06, z1 - z0 + borde * 2, 0xf4f4f0, { list: k.shell });
    k.box((x0 + x1) / 2, 0.22, (z0 + z1) / 2, x1 - x0, 0.05, z1 - z0, 0x3d9ad6, { list: k.glow });
  };
  pool(-2007.05, -3289.3, -2002.55, -3282.55, 0.35);
  pool(-2005.4, -3291.5, -2004.2, -3289.5, 0.3);
  k.block(-2004.8, -3285.9, 4.8, 7);
  // el busto en su peana, las tumbonas y las macetas
  k.box(-2001.95, 0.2, -3281.5, 0.42, 0.95, 0.42, 0xf2f2ee).ball(-2001.95, 1.45, -3281.5, 0.17, 0xf6f6f2, { sy: 1.15 }).box(-2001.95, 1.15, -3281.5, 0.5, 0.22, 0.26, 0xf6f6f2);
  for (const x of [-2008.6, -2007.6]) k.box(x, 0.2, -3292.6, 0.62, 0.32, 1.9, 0x8a6a48);
  for (const [x, z, r] of [[-2009.1, -3282.2, 0.5], [-2002.3, -3294.2, 0.45], [-1997.2, -3294.2, 0.6], [-2003.4, -3277.4, 0.5]]) {
    k.cyl(x, 0.2, z, 0.22, 0.18, 0.45, 0x5a4334).ball(x, 0.75 + r * 0.6, z, r, 0x4c7a3c, { sy: 1.1 });
  }
  // la jardinera redonda blanca del jardín y las matas de junto al garaje, que asoman por encima del muro
  k.cyl(-1999.4, 0.19, -3283, 0.7, 0.7, 0.4, 0xf4f4f0, { seg: 16 }).ball(-1999.4, 0.8, -3283, 0.5, 0x4c7a3c, { sy: 0.9 });
  for (const [x, z, r] of [[-2008.2, -3279.2, 1.1], [-2006.6, -3279.0, 0.9]]) k.ball(x, 1.5, z, r, 0x41683a, { sy: 1.2, seg: 8 });
  // la pérgola de chapa oxidada, contra el muro del este
  const gx0 = -1999.3, gx1 = X1 - 0.4, gz0 = -3290.4, gz1 = -3284.4;
  for (const [x, z] of [[gx0, gz0], [gx0, gz1], [gx1, gz0], [gx1, gz1]]) k.box(x, 0, z, 0.12, 2.5, 0.12, 0x6b4a32);
  k.box((gx0 + gx1) / 2, 2.5, (gz0 + gz1) / 2, gx1 - gx0 + 0.3, 0.06, gz1 - gz0 + 0.4, 0x9a5a32, { list: k.shell });
  for (let z = gz0; z <= gz1; z += 0.5) k.box((gx0 + gx1) / 2, 2.56, z, gx1 - gx0 + 0.3, 0.03, 0.04, 0x7d4627, { list: k.shell });
  // los delfines, por dentro de los muros
  if (delfin) {
    const dl = delfin(false), dr = delfin(true);
    for (const z of [-3287.5, -3284.5]) k.pic(X0 + 0.32, 1.4, z, 1.6, 0.9, 1, 0, dr);
    for (const z of [-3293.5, -3281.2]) k.pic(X1 - 0.32, 1.35, z, 1.7, 0.95, -1, 0, dl);
    k.pic(-2007.4, 1.6, GARAJE[1] - 0.04, 1.4, 0.8, 0, -1, dl);
  }
}

/** la explanada de grava de delante del garaje y del muro del sur, y lo que hay tirado al oeste (fotogramas 9 a 13) */
function explanada(k, scene) {
  suelo(scene, polyTris([[-2015.5, -3281], [X0 - 0.15, -3281], [X0 - 0.15, ZS + 0.15], [X1, ZS + 0.15], [-1994.6, -3268.4], [-2003, -3266], [-2012, -3262], [-2019, -3263.5], [-2018.5, -3271]]),
    0.13, grava(), 0xffffff, 'gravaGaraje');
  // el murete de bloques caído, las matas secas y el montón de arena clara con piedras
  k.box(-2019.6, 0, -3279.6, 5.2, 0.45, 0.25, 0x9a958c, { ry: 1.25 });
  k.box(-2017.2, 0, -3276.6, 1.1, 0.22, 0.5, 0xa9a59c, { ry: 0.4 });
  for (const [x, z, r] of [[-2016.4, -3281.6, 0.7], [-2018.2, -3283.2, 0.9], [-2021, -3277.4, 0.6], [-2013.4, -3282.4, 0.55]]) k.ball(x, 0.25, z, r, 0x6f7248, { sy: 0.7, seg: 7 });
  k.ball(-2021.5, 0, -3268.5, 2.2, 0xcbbf9f, { sx: 1.3, sy: 0.3, seg: 9 });
  for (let i = 0; i < 9; i++) k.ball(-2022.2 + Math.sin(i * 2.1) * 1.3, 0.5 + (i % 2) * 0.08, -3268.8 + Math.cos(i * 1.7) * 1.1, 0.16 + (i % 3) * 0.06, 0x6a5a4c, { sx: 1.2, sy: 0.8, seg: 5 });
}

export function buildParcela(scene, colliders, { delfin, oxido } = {}) {
  const k = new Kit();
  bloque(k);
  muroSur(k, oxido?.());
  patio(k, scene, delfin);
  explanada(k, scene);
  const { group, segs } = k.build('casaParcela');
  scene.add(group);
  for (const sg of segs) colliders.addSegment(...sg);
  return group;
}
