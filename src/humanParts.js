import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Piezas comunes de las personas: el material, los colores con su acabado y
 * el cosido de cada pieza a sus huesos.
 *
 * Cada color puede llevar acabado: rough (rugosidad; en negativo, metal) y
 * cloth (es ropa: abulta un poco y queda mate). Así la piel sale satinada,
 * los ojos y los labios brillan y las hebillas o el reloj son de metal, todo
 * con un solo material y una sola llamada de dibujo por persona.
 */

export const MAT = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.74, metalness: 0.02 });
MAT.onBeforeCompile = (sh) => {
  sh.vertexShader = sh.vertexShader
    .replace('#include <common>', '#include <common>\nattribute float rough;\nvarying float vRough;')
    .replace('#include <begin_vertex>', '#include <begin_vertex>\nvRough = rough;');
  sh.fragmentShader = sh.fragmentShader
    .replace('#include <common>', '#include <common>\nvarying float vRough;')
    .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = abs(vRough);')
    .replace('#include <metalnessmap_fragment>', 'float metalnessFactor = vRough < 0.0 ? 0.85 : metalness;');
};
MAT.customProgramCacheKey = () => 'human-rough';

// huesos del esqueleto (índices)
export const B = { hips: 0, spine: 1, head: 2, armL: 3, elbowL: 4, armR: 5, elbowR: 6, legL: 7, kneeL: 8, legR: 9, kneeR: 10 };

export const col = (hex) => { const c = new THREE.Color(hex); return [c.r, c.g, c.b]; };
const keep = (out, a) => {
  if (a.cloth) out.cloth = true;
  if (a.rough != null) out.rough = a.rough;
  return out;
};
export const mix = (a, b, t) => keep([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t], a);
export const shade = (a, k) => keep([a[0] * k, a[1] * k, a[2] * k], a);
/** color con acabado (rough negativo = metal) */
export const fin = (c, rough, cloth = false) => Object.assign([c[0], c[1], c[2]], cloth ? { rough, cloth } : { rough });
export const smooth01 = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };

/** suaviza una geometría de esfera/cápsula (sin costura de luz) */
export function welded(g) {
  if (g.getAttribute('uv')) g.deleteAttribute('uv');
  g.deleteAttribute('normal');
  const m = mergeVertices(g, 1e-5);
  m.computeVertexNormals();
  return m;
}

/**
 * pinta y "cose" una pieza a uno o dos huesos.
 * paint(x, y, z, i) → color, bone(x, y, z) → [huesoA, huesoB, pesoB] o [[hueso, peso], ...]
 */
export function skinPart(g, paint, bone) {
  const p = g.getAttribute('position'), n = p.count;
  const c = new Float32Array(n * 3), rg = new Float32Array(n);
  const si = new Uint16Array(n * 4), sw = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const res = paint(x, y, z, i);
    c[i * 3] = res[0]; c[i * 3 + 1] = res[1]; c[i * 3 + 2] = res[2];
    rg[i] = res.rough ?? (res.cloth ? 0.88 : 0.58);
    const b = typeof bone === 'number' ? [bone, bone, 0] : bone(x, y, z);
    if (Array.isArray(b[0])) {
      // varios huesos con su peso
      b.slice(0, 4).forEach(([bi, w], j) => { si[i * 4 + j] = bi; sw[i * 4 + j] = w; });
      continue;
    }
    si[i * 4] = b[0]; si[i * 4 + 1] = b[1];
    sw[i * 4] = 1 - b[2]; sw[i * 4 + 1] = b[2];
  }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  g.setAttribute('rough', new THREE.BufferAttribute(rg, 1));
  g.setAttribute('skinIndex', new THREE.BufferAttribute(si, 4));
  g.setAttribute('skinWeight', new THREE.BufferAttribute(sw, 4));
  if (g.getAttribute('uv')) g.deleteAttribute('uv');
  return g;
}

/**
 * perfil torneado [[radio, y]] con franjas de color: bands = [[yCorte, colorPorEncima], ...]
 * de arriba abajo; por debajo del último corte, colorBase. La ropa abulta un poco.
 */
export function lathe(profile, bands, base, { segs = 10, sx = 1, sz = 1, cloth = 1.05 } = {}) {
  const colorAt = (y) => { for (const [yb, c] of bands) if (y > yb) return c; return base; };
  const isCloth = (y) => colorAt(y).cloth;
  const pts = [];
  const rAt = (y) => {
    for (let i = 0; i < profile.length - 1; i++) {
      const [r0, y0] = profile[i], [r1, y1] = profile[i + 1];
      if ((y <= y0 && y >= y1)) return r0 + (r1 - r0) * ((y - y0) / (y1 - y0 || 1));
    }
    return 0;
  };
  // perfil con los bordes de cada prenda bien marcados
  const cuts = bands.map(b => b[0]).filter(yb => yb < profile[0][1] && yb > profile[profile.length - 1][1]);
  const all = [...profile.map(([r, y]) => [r, y])];
  for (const yb of cuts) {
    const r = rAt(yb);
    all.push([r, yb + 0.0015], [r, yb - 0.0015]);
  }
  all.sort((a, b) => b[1] - a[1]);
  for (const [r, y] of all) {
    const k = isCloth(y) && r > 0 ? cloth : 1;
    pts.push(new THREE.Vector2(Math.max(0, r * k), y));
  }
  // LatheGeometry gira de abajo arriba: le damos los puntos al revés
  const g = new THREE.LatheGeometry(pts.reverse(), segs);
  g.applyMatrix4(new THREE.Matrix4().makeScale(sx, 1, sz));
  const p = g.getAttribute('position');
  const c = [];
  for (let i = 0; i < p.count; i++) c.push(colorAt(p.getY(i)));
  g.userData.colors = c;
  return g;
}

export function box(w, h, d, x, y, z, rx = 0, ry = 0, rz = 0) {
  const g = new THREE.BoxGeometry(w, h, d);
  if (rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz)));
  g.translate(x, y, z);
  return g;
}

// esferas unidad ya soldadas, por resolución (se copian y se deforman)
const SPHERES = new Map();

/** elipsoide de radio r escalado (sx, sy, sz), girado (rx, ry, rz) y llevado a (x, y, z) */
export function ell(r, sx, sy, sz, x, y, z, ws = 12, hs = 8, rx = 0, ry = 0, rz = 0) {
  const key = ws * 1000 + hs;
  if (!SPHERES.has(key)) SPHERES.set(key, welded(new THREE.SphereGeometry(1, ws, hs)));
  const g = SPHERES.get(key).clone();
  g.scale(r * sx, r * sy, r * sz);
  if (rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz)));
  g.translate(x, y, z);
  return g;
}

/** tubo fino por una curva suave de puntos [x, y, z] (cejas, pestañas, costuras) */
export function tube(pts, r, n = 8, rs = 4) {
  const curve = new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
  const g = new THREE.TubeGeometry(curve, n, r, rs, false);
  g.deleteAttribute('uv');
  return g;
}

/** cápsula de radio r y largo L que sale de (x, y, z) hacia abajo, girada (rx, rz) en su base */
export function digit(r, L, x, y, z, rx, rz, segs = 7) {
  const g = new THREE.CapsuleGeometry(r, L, 2, segs);
  g.translate(0, -L / 2, 0);
  g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, 0, rz)));
  g.translate(x, y, z);
  return welded(g);
}

/**
 * sonda de superficie: lanza un rayo contra la geometría y devuelve dónde la
 * toca (para posar costuras, cordones o rasgos de la cara sobre la pieza)
 */
export function prober(geo) {
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
  mesh.updateMatrixWorld();
  const ray = new THREE.Raycaster();
  const o = new THREE.Vector3(), d = new THREE.Vector3();
  /** desde (x, y, z) en la dirección (dx, dy, dz): el punto tocado o null */
  return (x, y, z, dx, dy, dz) => {
    ray.set(o.set(x, y, z), d.set(dx, dy, dz).normalize());
    const hit = ray.intersectObject(mesh, false)[0];
    return hit ? hit.point : null;
  };
}
