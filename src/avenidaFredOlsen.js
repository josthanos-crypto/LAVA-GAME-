import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { WALK_RISE } from './world.js';
import { sueloConFoto } from './reductoFoto.js';

/**
 * (Version 158) La Avenida Fred Olsen, a lo largo de la Playa del Reducto, comparada con la foto aérea oficial del IGN
 * (José Manuel: «continúa con la avenida Fred Olsen»; es zona de mucho paso). Lo que la foto enseña y no estaba:
 *  - el carril bici rojo del lado del mar, entre la calzada y el paseo, de la rotonda del Barlovento hacia el este
 *    hasta donde se acaba el rojo (x ≈ -756), con su raya del medio;
 *  - los bancos blancos de junto al carril, uno cada 16 m (en la foto son rectángulos blancos junto a cada palmera;
 *    **no se ha visto a pie de calle cómo son**: aquí son un banco blanco sencillo);
 *  - en la arena: la torre blanca del socorrista, las dos pasarelas de madera que bajan del paseo (la primera con
 *    su tarima) y las palmeras sueltas de la playa que faltaban;
 *  - el suelo de esa franja, con la foto oficial a 0,2 m por punto (`public/reducto/avenida.jpg`, `avenida-m.jpg`).
 * Medido todo sobre la ortofoto (PNOA, © Instituto Geográfico Nacional de España, CC BY 4.0; WMS del IGN, 17/11/2026).
 */
const FRANJA = { x0: -1040, x1: -430, z0: 380, z1: 560 };
// el eje de la calzada del lado del mar, de oeste a este (del mapa)
const EJE = [[-1056, 504], [-1051, 500], [-1038, 492], [-1033, 488], [-1027, 485], [-1022, 482], [-1015, 478], [-1004, 474],
  [-993, 468], [-968, 458], [-888, 428], [-879, 425], [-871, 423], [-861, 421], [-851, 420], [-839, 419], [-826, 419],
  [-798, 419], [-756, 422.8]];
// del eje de la calzada al centro del carril bici, y su anchura: las palmeras de la acera quedan entre la calzada y
// el carril, como en la foto
const CARRIL = { fuera: 8.3, ancho: 2.6 };
const TORRE = [-669.5, 488.5];
const PASARELAS = [
  { de: [-624.5, 471], a: [-632.5, 500], tarima: [-622, 486.5, 6, 5] },
  { de: [-536.5, 500], a: [-545, 525] },
];
const PALMERAS = [[-591.5, 485], [-592.5, 492], [-580, 489], [-582.5, 494.5], [-548, 496.5], [-541, 499], [-552.5, 504],
  [-547.5, 500], [-531, 505], [-528, 509], [-521, 503], [-520, 511], [-513, 509], [-504, 504], [-628, 470], [-631, 475.5]];

export function tuneAvenidaFredOlsen(map) {
  if (map.avenidaFredOlsen) return;
  map.avenidaFredOlsen = true;
  map.groundHoles = [...(map.groundHoles || []), { ...FRANJA }];
  // las palmeras de la arena que no estén ya (ni entre los árboles del mapa ni entre las puestas a mano)
  const hay = [...(map.trees || []), ...(map.extraPalms || [])];
  const nuevas = PALMERAS.filter(([x, z]) => !hay.some(t => Math.hypot(t[0] - x, t[1] - z) < 4.5));
  map.extraPalms = [...(map.extraPalms || []), ...nuevas.map(([x, z], i) => [x, z, 7 + (i % 3) * 0.8, i * 1.3])];
}

/** puntos a lo largo del eje cada `paso` m, desplazados `fuera` m hacia el mar: [x, z, ux, uz, s] */
function recorrer(paso, fuera) {
  const out = [];
  let s = 0, next = 0;
  for (let i = 1; i < EJE.length; i++) {
    const [ax, az] = EJE[i - 1], [bx, bz] = EJE[i], L = Math.hypot(bx - ax, bz - az);
    const ux = (bx - ax) / L, uz = (bz - az) / L;
    let nx = -uz, nz = ux; if (nz < 0) { nx = -nx; nz = -nz; }      // hacia el mar (sur)
    for (; next <= s + L; next += paso) { const t = next - s; out.push([ax + ux * t + nx * fuera, az + uz * t + nz * fuera, ux, uz, next]); }
    s += L;
  }
  return out;
}

function carrilBici(grupo) {
  const y = 0.14 + WALK_RISE + 0.012, hw = CARRIL.ancho / 2;
  const P = recorrer(2, CARRIL.fuera), rojo = [], blanco = [];
  const tira = (arr, a, b, medio) => {
    const n = (q) => [-q[3], q[2]];
    const [na, nb] = [n(a), n(b)];
    const A0 = [a[0] + na[0] * medio, a[1] + na[1] * medio], A1 = [a[0] - na[0] * medio, a[1] - na[1] * medio];
    const B0 = [b[0] + nb[0] * medio, b[1] + nb[1] * medio], B1 = [b[0] - nb[0] * medio, b[1] - nb[1] * medio];
    for (const q of [A0, B0, A1, A1, B0, B1]) arr.push(q[0], 0, q[1]);
  };
  for (let i = 1; i < P.length; i++) {
    tira(rojo, P[i - 1], P[i], hw);
    if (i % 3 === 0) tira(blanco, P[i - 1], P[i], 0.06);
  }
  const malla = (pos, color, dy) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const nrm = new Float32Array(pos.length); for (let i = 1; i < nrm.length; i += 3) nrm[i] = 1;
    g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, roughness: 0.9, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -3 - dy, polygonOffsetUnits: -3 - dy }));
    m.position.y = y + dy * 0.004;
    m.receiveShadow = true;
    return m;
  };
  const r = malla(rojo, 0x9a3b30, 0); r.name = 'carrilBiciFredOlsen';
  grupo.add(r, malla(blanco, 0xe9e6dc, 1));
}

function bancos(piezas, colliders) {
  const y = 0.14 + WALK_RISE;
  for (const [x, z, ux, uz, s] of recorrer(16, CARRIL.fuera + CARRIL.ancho / 2 + 0.9)) {
    if (s < 8) continue;
    const ry = Math.atan2(ux, uz);
    const caja = (w, h, d, yy, color) => {
      const g = new THREE.BoxGeometry(w, h, d).toNonIndexed();
      g.rotateY(ry); g.translate(x, y + yy + h / 2, z);
      const c = new THREE.Color(color), n = g.getAttribute('position').count, col = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
      g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      piezas.push(g);
    };
    caja(0.6, 0.45, 2.0, 0, 0xf1efe8);
    colliders?.addSegment(x - ux, z - uz, x + ux, z + uz);
  }
}

function torreSocorrista(piezas, colliders) {
  const [x, z] = TORRE;
  const caja = (dx, y, dz, w, h, d, color, rx = 0) => {
    const g = new THREE.BoxGeometry(w, h, d).toNonIndexed();
    if (rx) g.rotateX(rx);
    g.translate(x + dx, y + h / 2, z + dz);
    const c = new THREE.Color(color), n = g.getAttribute('position').count, col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    piezas.push(g);
  };
  const B = 0xf4f4f0;
  for (const [dx, dz] of [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]]) caja(dx, 0.1, dz, 0.16, 2.3, 0.16, B);
  caja(0, 2.3, 0, 3.2, 0.14, 3.2, B);                                   // la plataforma
  caja(0, 2.44, -0.5, 2.4, 1.9, 1.9, B);                                // la caseta
  caja(0, 3.0, 0.46, 1.6, 0.8, 0.04, 0x26323a);                         // la ventana que mira al mar
  caja(0, 4.34, -0.3, 3.3, 0.12, 2.9, B);                               // el techo, con vuelo
  for (const dx of [-1.55, 1.55]) caja(dx, 2.44, 0.9, 0.06, 0.9, 1.3, B);   // la baranda
  caja(0, 2.44, 1.56, 3.1, 0.9, 0.06, B);
  caja(-0.9, 1.0, 3.7, 0.9, 0.1, 5.0, B, -0.47);                        // la rampa que baja a la arena
  colliders?.addSegment(x - 1.4, z - 1.4, x + 1.4, z - 1.4); colliders?.addSegment(x + 1.4, z - 1.4, x + 1.4, z + 1.4);
  colliders?.addSegment(x + 1.4, z + 1.4, x - 1.4, z + 1.4); colliders?.addSegment(x - 1.4, z + 1.4, x - 1.4, z - 1.4);
}

function pasarelas(piezas) {
  const MADERA = 0xb89a6e, y = 0.17;
  const tabla = (cx, cz, w, d, ry, color = MADERA) => {
    const g = new THREE.BoxGeometry(w, 0.06, d).toNonIndexed();
    g.rotateY(ry); g.translate(cx, y, cz);
    const c = new THREE.Color(color), n = g.getAttribute('position').count, col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    piezas.push(g);
  };
  for (const p of PASARELAS) {
    const L = Math.hypot(p.a[0] - p.de[0], p.a[1] - p.de[1]), n = Math.ceil(L / 3), ry = Math.atan2(p.a[0] - p.de[0], p.a[1] - p.de[1]);
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      tabla(p.de[0] + (p.a[0] - p.de[0]) * t, p.de[1] + (p.a[1] - p.de[1]) * t, 2.0, L / n + 0.02, ry, i % 2 ? MADERA : 0xb0926a);
    }
    if (p.tarima) tabla(p.tarima[0], p.tarima[1], p.tarima[2], p.tarima[3], ry, 0xa8a49a);
  }
}

export function buildAvenidaFredOlsen(scene, colliders) {
  const grupo = new THREE.Group();
  grupo.name = 'avenidaFredOlsen';
  sueloConFoto(scene, FRANJA, 'avenida', 'sueloFredOlsen');
  carrilBici(grupo);
  const piezas = [];
  bancos(piezas, colliders);
  torreSocorrista(piezas, colliders);
  pasarelas(piezas);
  const m = new THREE.Mesh(mergeGeometries(piezas, false), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 }));
  m.castShadow = m.receiveShadow = true;
  grupo.add(m);
  scene.add(grupo);
  return grupo;
}
