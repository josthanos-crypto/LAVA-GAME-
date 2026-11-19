import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { zone, charcoRing, ringDist, charcoPromenade } from './zones.js';
import { windowGlow } from './realism.js';
import { nivelCharco, fondoCharco } from './marea.js';

/**
 * Charco de San Ginés (zona piloto). Lo que se ve aquí sale del vídeo de referencia de 2020
 * (REFERENCIA_VIDEO_CALLE_REAL.md, min. 09:45–20:15): barcas blancas, azules y verdes por toda la
 * lámina, farolas altas pintadas de azul y pavimento ocre con franja gris junto al pretil.
 * Las posiciones son aproximación artística (zones.js).
 * Las barcas suben y bajan con la marea (marea.js): con la marea vacía, las que se quedan sin agua
 * descansan en el fango, escoradas, como en la foto de José Manuel.
 */

const PAVE_Y = 0.16;
// [casco, franja]: cascos blancos con franja de color y algunos pintados enteros (vídeo 10:45, 17:30, 19:45)
const HULLS = [
  [0xf2f0ea, 0x2f5f8a], [0xf2f0ea, 0x2f6b4f], [0x2a5f9e, 0xf2f0ea], [0xf2f0ea, 0xb03a2e],
  [0x3e8a4f, 0xf2f0ea], [0xf2f0ea, 0x1f3f6a], [0xf2f0ea, 0xe0b520], [0x1f4f7a, 0xe8e2d4],
];

function inPoly(P, x, z) {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    if ((P[i][1] > z) !== (P[j][1] > z) && x < (P[j][0] - P[i][0]) * (z - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0]) c = !c;
  }
  return c;
}

function paint(g, hex) {
  const geo = g.index ? g.toNonIndexed() : g;
  const c = new THREE.Color(hex), n = geo.getAttribute('position').count;
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) a.set([c.r, c.g, c.b], i * 3);
  geo.setAttribute('color', new THREE.BufferAttribute(a, 3));
  for (const k of Object.keys(geo.attributes)) if (!['position', 'normal', 'color'].includes(k)) geo.deleteAttribute(k);
  return geo;
}

/** barquillo de 4,5 m: casco, franja de color, interior de madera y dos bancos */
function boatGeometry([hull, band]) {
  const s = new THREE.Shape();
  s.moveTo(0, 2.25);
  s.quadraticCurveTo(0.85, 1.0, 0.8, -1.5);
  s.lineTo(0.6, -2.2);
  s.lineTo(-0.6, -2.2);
  s.lineTo(-0.8, -1.5);
  s.quadraticCurveTo(-0.85, 1.0, 0, 2.25);
  const body = new THREE.ExtrudeGeometry(s, { depth: 0.7, bevelEnabled: false, curveSegments: 8 });
  body.rotateX(Math.PI / 2);
  body.translate(0, 0.5, 0);
  const stripe = new THREE.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: false, curveSegments: 8 });
  stripe.rotateX(Math.PI / 2);
  stripe.scale(1.025, 1, 1.012);
  stripe.translate(0, 0.46, 0);
  const deck = new THREE.ShapeGeometry(s, 6);
  deck.rotateX(-Math.PI / 2);
  deck.scale(0.88, 1, 0.9);
  deck.translate(0, 0.505, 0);
  const seat = new THREE.BoxGeometry(1.4, 0.06, 0.3).translate(0, 0.6, -0.2);
  const seat2 = new THREE.BoxGeometry(1.2, 0.06, 0.3).translate(0, 0.6, -1.4);
  return mergeGeometries([paint(body, hull), paint(stripe, band), paint(deck, 0x8a6240), paint(seat, 0x6e4a2e), paint(seat2, 0x6e4a2e)]);
}

/** adoquín del paseo: ocre en hileras de ladrillo, o la franja de losas grises junto al pretil */
function paveTexture(gray) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = gray ? '#7f7b76' : '#8a7052';
  g.fillRect(0, 0, 256, 256);
  let s = gray ? 31 : 17;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const bw = gray ? 64 : 32, bh = gray ? 64 : 16;
  for (let y = 0; y < 256; y += bh) {
    const off = ((y / bh) % 2) * (bw / 2);
    for (let x = -bw; x < 256; x += bw) {
      const v = (r() - 0.5) * (gray ? 18 : 30);
      g.fillStyle = gray ? `rgb(${138 + v},${134 + v},${128 + v})` : `rgb(${176 + v},${140 + v * 0.8},${100 + v * 0.6})`;
      g.fillRect(x + off + 1, y + 1, bw - 2, bh - 2);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** franjas de paseo a lo largo del pretil: banda gris (0,5–1,5 m) y ocre (1,5–3,2 m) */
function promenadeStrips(strips) {
  const tris = { gray: [], ochre: [] };
  for (const s of strips) {
    for (const [key, o0, o1] of [['gray', 0.5, 1.5], ['ochre', 1.5, 3.2]]) {
      const A = [s.ax + s.nx * o0, s.az + s.nz * o0], B = [s.bx + s.nx * o0, s.bz + s.nz * o0];
      const C = [s.bx + s.nx * o1, s.bz + s.nz * o1], D = [s.ax + s.nx * o1, s.az + s.nz * o1];
      // que cada triángulo mire al cielo, sea cual sea el sentido del tramo
      const up = (P, Q, R) => ((Q[0] - P[0]) * (R[1] - P[1]) - (Q[1] - P[1]) * (R[0] - P[0])) < 0;
      for (const [P, Q, R] of [[A, B, C], [A, C, D]]) tris[key].push(...(up(P, Q, R) ? [P, Q, R] : [P, R, Q]));
    }
  }
  const meshes = [];
  for (const key of ['gray', 'ochre']) {
    const T = tris[key];
    if (!T.length) continue;
    const pos = [], uv = [];
    for (const [x, z] of T) { pos.push(x, PAVE_Y, z); uv.push(x / 3, z / 3); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({
      map: paveTexture(key === 'gray'), roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    }));
    m.receiveShadow = true;
    meshes.push(m);
  }
  return meshes;
}

/** farolas altas de fuste azul claro con su linterna (vídeo 10:30–19:45) */
function blueLamps(lamps) {
  if (!lamps.length) return { meshes: [], mat: null };
  const pole = new THREE.CylinderGeometry(0.07, 0.11, 6.2, 8).translate(0, 3.1, 0);
  const arm = new THREE.CylinderGeometry(0.035, 0.035, 0.9, 6).rotateZ(Math.PI / 2).translate(0.42, 6.0, 0);
  const base = new THREE.CylinderGeometry(0.16, 0.2, 0.25, 8).translate(0, 0.12, 0);
  const poleGeo = mergeGeometries([pole, arm, base]);
  const headGeo = new THREE.CylinderGeometry(0.16, 0.24, 0.32, 8).translate(0.86, 5.82, 0);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x4f93d1, roughness: 0.45, metalness: 0.4 });
  const headMat = new THREE.MeshStandardMaterial({ color: 0xf2efe6, emissive: 0xffd9a0, emissiveIntensity: 0, roughness: 0.4 });
  const poles = new THREE.InstancedMesh(poleGeo, poleMat, lamps.length);
  const heads = new THREE.InstancedMesh(headGeo, headMat, lamps.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), one = new THREE.Vector3(1, 1, 1);
  lamps.forEach(([x, z, face], i) => {
    // el brazo hacia el agua
    q.setFromAxisAngle(up, face - Math.PI / 2);
    m.compose(new THREE.Vector3(x, 0.15, z), q, one);
    poles.setMatrixAt(i, m);
    heads.setMatrixAt(i, m);
  });
  poles.castShadow = true;
  return { meshes: [poles, heads], mat: headMat };
}

export function buildCharco(scene, map, { touch = false } = {}) {
  const ring = charcoRing(map);
  if (!ring) return null;
  const cfg = zone('charco').boats;
  const edgeN = touch ? cfg.countTouch : cfg.count;
  const openN = touch ? cfg.openTouch : cfg.open;
  const group = new THREE.Group();
  group.name = 'charco';
  // las barcas flotan: se quedan al nivel del agua aunque el terreno de la orilla suba (terrain.js)
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, side: THREE.DoubleSide, userData: { terrain: 'level' } });
  const geos = HULLS.map(boatGeometry);

  // perímetro de la orilla; los grupos de barcas amarradas, repartidos por él
  const segs = [];
  let per = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [ax, az] = ring[i], [bx, bz] = ring[i + 1];
    const L = Math.hypot(bx - ax, bz - az);
    if (L < 0.5) continue;
    segs.push({ ax, az, bx, bz, L, s0: per });
    per += L;
  }
  const at = (d) => {
    d = ((d % per) + per) % per;
    const s = segs.find(q => d >= q.s0 && d < q.s0 + q.L) || segs[segs.length - 1];
    const t = (d - s.s0) / s.L;
    const ux = (s.bx - s.ax) / s.L, uz = (s.bz - s.az) / s.L;
    let nx = -uz, nz = ux;
    const x = s.ax + (s.bx - s.ax) * t, z = s.az + (s.bz - s.az) * t;
    if (!inPoly(ring, x + nx * 3, z + nz * 3)) { nx = -nx; nz = -nz; }
    return { x, z, nx, nz };
  };
  // todas las barcas de un mismo casco van en una sola malla instanciada (una llamada de dibujo por color)
  const boats = [];
  let k = 0;
  const place = (x, z, ry) => {
    // heel: lo que se escora en el fango con la marea vacía (a un lado o a otro)
    boats.push({ x, z, ry, v: k % geos.length, phase: k * 1.3, heel: (k % 2 ? 1 : -1) * (0.1 + (k % 5) * 0.03) });
    k++;
  };
  const clusters = 4, perCluster = Math.ceil(edgeN / clusters);
  for (let c = 0, n = 0; c < clusters && n < edgeN; c++) {
    const d0 = per * (0.08 + c / clusters);
    for (let j = 0; j < perCluster && n < edgeN; j++, n++) {
      const p = at(d0 + j * 3.1);
      const off = 3.4 + (j % 2) * 0.6;
      const x = p.x + p.nx * off, z = p.z + p.nz * off;
      if (!inPoly(ring, x, z)) continue;
      // la proa hacia el muro, un poco torcida, como quedan amarradas
      place(x, z, Math.atan2(-p.nx, -p.nz) + Math.sin(n * 2.3) * 0.18);
    }
  }
  // fondeadas por el resto del Charco (el vídeo las muestra por toda la lámina)
  const xs = ring.map(q => q[0]), zs = ring.map(q => q[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), z0 = Math.min(...zs), z1 = Math.max(...zs);
  let seed = 77;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const open = [];
  for (let tries = 0; tries < 4000 && open.length < openN; tries++) {
    const x = x0 + rnd() * (x1 - x0), z = z0 + rnd() * (z1 - z0);
    if (!inPoly(ring, x, z) || ringDist(ring, x, z) < 9) continue;
    if (open.some(([ox, oz]) => Math.hypot(ox - x, oz - z) < 7.5)) continue;
    open.push([x, z]);
    place(x, z, rnd() * Math.PI * 2);
  }

  const fleets = geos.map((geo, v) => {
    const list = boats.filter(b => b.v === v);
    const im = new THREE.InstancedMesh(geo, mat, Math.max(1, list.length));
    im.count = list.length;
    im.castShadow = !touch;
    group.add(im);
    return { im, list };
  });
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(0, 0, 0, 'YXZ');
  const _p = new THREE.Vector3(), _s = new THREE.Vector3(1.15, 1.15, 1.15);
  const pose = (t) => {
    const agua = nivelCharco();
    for (const { im, list } of fleets) {
      list.forEach((b, i) => {
        const flota = agua - 0.02 + Math.sin(t * 1.1 + b.phase) * 0.035;
        // la quilla en el fango (con la marea vacía): se queda ahí, escorada; g = 0 flotando, 1 varada
        const apoyo = fondoCharco(b.x, b.z) + 0.18;
        const g = Math.max(0, Math.min(1, (apoyo - flota) / 0.2 + 0.5));
        _e.set(0, b.ry, Math.sin(t * 0.9 + b.phase) * 0.03 * (1 - g) + b.heel * g);
        _q.setFromEuler(_e);
        _p.set(b.x, Math.max(flota, apoyo), b.z);
        im.setMatrixAt(i, _m.compose(_p, _q, _s));
      });
      im.instanceMatrix.needsUpdate = true;
    }
  };
  pose(0);
  let posado = nivelCharco();

  // el paseo: franja de pavimento junto al pretil y farolas azules (las palmeras van con las demás, world.js)
  const prom = charcoPromenade(map);
  for (const m of promenadeStrips(prom.strips)) group.add(m);
  const lamps = blueLamps(prom.lamps);
  for (const m of lamps.meshes) group.add(m);

  scene.add(group);
  const [cx, cz] = ring.reduce((s, q) => [s[0] + q[0] / ring.length, s[1] + q[1] / ring.length], [0, 0]);
  return {
    group,
    boats,
    count: k,
    lamps: prom.lamps.length,
    strips: prom.strips.length,
    palms: prom.palms.length,
    update(t, px, pz) {
      if (lamps.mat) lamps.mat.emissiveIntensity = windowGlow.value * 5;
      const near = Math.hypot(px - cx, pz - cz) < 700;
      group.visible = near;
      if (!near) return;
      // en el móvil quedan quietas (sin coste por fotograma); solo se recolocan cuando la marea ha cambiado
      if (!touch) pose(t);
      else if (Math.abs(nivelCharco() - posado) > 0.03) {
        pose(t);
        posado = nivelCharco();
      }
    },
  };
}
