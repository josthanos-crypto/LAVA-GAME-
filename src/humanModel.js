import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { MAT, B, col, mix, shade, fin, smooth01, welded, skinPart, lathe, box, ell, tube, digit, prober } from './humanParts.js';
import { buildHead } from './humanHead.js';

/**
 * Personas con esqueleto: cadera, columna, cabeza, hombros, codos, caderas y
 * rodillas. Todo el cuerpo es una sola malla con piel (una llamada de dibujo
 * por persona) y los colores van en los vértices: piel, ropa, pelo, ojos...
 *
 * Los pivotes de siempre (legL, legR, armL, armR) siguen ahí: al girarlos,
 * rodillas y codos se doblan solos, así que pasear, correr o caer ya salen
 * con las articulaciones bien.
 *
 * opts: { sex: 'm'|'f', build (0.85–1.25), height, skin, hair, hairStyle,
 *         top, topStyle: 'tshirt'|'tank'|'long'|'jacket'|'none'|'bikini'|'swimsuit', sleeves, inner,
 *         bottom, bottomStyle: 'pants'|'shorts'|'skirt'|'dress'|'swim', shorts,
 *         shoes, shoeStyle: 'sneaker'|'shoe'|'sandal'|'barefoot', shoeAccent, belt,
 *         beard, stubble, cap, capColor, shades, eyes, backpack, bag, watch,
 *         detail: 1 (gente de la calle) | 2 (protagonista: dedos, cordones, bolsillos...) }
 * hairStyle: short | surf | long | rapado | calvo | ponytail | bun | curly
 */

// esqueleto de referencia (persona de 1,78 m; luego se escala a su altura)
const HIP = 0.93, KNEE = 0.5, SPINE = 1.06, SH = 1.43, NECK = 1.47, ELBOW = SH - 0.29;

/** tronco por anillos (súper-elipses), con pecho, barriga y espalda */
function torsoGeo(rings, opts, N) {
  const P = 2.5;
  const { bust = 0, belly = 0 } = opts;
  const pos = [], idx = [];
  const ringPts = rings.map(([y, rx, rz, dz = 0]) => {
    const out = [];
    for (let k = 0; k < N; k++) {
      const a = (k / N) * Math.PI * 2;
      const c = Math.cos(a), s = Math.sin(a);
      let x = rx * Math.sign(c) * Math.abs(c) ** (2 / P);
      let z = rz * Math.sign(s) * Math.abs(s) ** (2 / P) + dz;
      if (z > dz) {
        if (bust) z += bust * Math.exp(-(((y - 1.27) / 0.055) ** 2)) * Math.exp(-(((Math.abs(x) - 0.068) / 0.05) ** 2));
        if (belly) z += belly * Math.exp(-(((y - 1.1) / 0.08) ** 2)) * Math.exp(-((x / 0.11) ** 2));
      } else {
        // glúteos
        z -= 0.018 * Math.exp(-(((y - 0.9) / 0.05) ** 2)) * Math.exp(-(((Math.abs(x) - 0.07) / 0.06) ** 2));
      }
      out.push([x, y, z]);
    }
    return out;
  });
  ringPts.forEach(r => r.forEach(v => pos.push(...v)));
  const R = rings.length;
  for (let i = 0; i < R - 1; i++) {
    for (let k = 0; k < N; k++) {
      const a = i * N + k, b = i * N + (k + 1) % N, c = (i + 1) * N + k, d = (i + 1) * N + (k + 1) % N;
      idx.push(a, c, b, b, c, d);
    }
  }
  // tapas
  const bot = pos.length / 3; pos.push(0, rings[0][0] - 0.01, 0);
  const top = pos.length / 3; pos.push(0, rings[R - 1][0] + 0.004, 0);
  for (let k = 0; k < N; k++) {
    idx.push(bot, k, (k + 1) % N);
    idx.push(top, (R - 1) * N + (k + 1) % N, (R - 1) * N + k);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  // la entrepierna por delante no mira tan al suelo (si no, sale una sombra en uve)
  const nr = g.getAttribute('normal'), v = new THREE.Vector3();
  for (let i = 0; i < nr.count; i++) {
    if (pos[i * 3 + 1] > 0.95 || pos[i * 3 + 2] <= 0) continue;
    v.fromBufferAttribute(nr, i);
    v.y = Math.max(v.y, -0.3);
    v.normalize();
    nr.setXYZ(i, v.x, v.y, v.z);
  }
  return g;
}

/** inserta anillos interpolados justo en los bordes de la ropa */
function withCuts(rings, cuts) {
  const out = rings.map(r => [...r]);
  for (const yc of cuts) {
    for (const yy of [yc - 0.0015, yc + 0.0015]) {
      const i = out.findIndex(r => r[0] > yy);
      if (i <= 0) continue;
      const a = out[i - 1], b = out[i], t = (yy - a[0]) / (b[0] - a[0]);
      out.splice(i, 0, [yy, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, (a[3] || 0) + ((b[3] || 0) - (a[3] || 0)) * t]);
    }
  }
  return out;
}

/** radios del tronco a la altura y */
function ringAt(rings, y) {
  const i = rings.findIndex(r => r[0] > y);
  if (i <= 0) return rings[Math.max(0, i)];
  const a = rings[i - 1], b = rings[i], t = (y - a[0]) / (b[0] - a[0]);
  return [y, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

const RINGS_M = [
  [0.83, 0.05, 0.04], [0.86, 0.125, 0.09], [0.9, 0.158, 0.104], [0.95, 0.164, 0.107], [1.0, 0.157, 0.103],
  [1.06, 0.149, 0.099], [1.14, 0.155, 0.103], [1.22, 0.167, 0.11, 0.004], [1.3, 0.175, 0.112, 0.006],
  [1.37, 0.18, 0.106, 0.004], [1.425, 0.178, 0.094], [1.462, 0.152, 0.076], [1.48, 0.075, 0.056], [1.49, 0.02, 0.02],
];
const RINGS_F = [
  [0.83, 0.05, 0.04], [0.86, 0.13, 0.094], [0.9, 0.168, 0.108], [0.95, 0.171, 0.11], [1.0, 0.156, 0.099],
  [1.06, 0.127, 0.087], [1.12, 0.129, 0.089], [1.2, 0.143, 0.096, 0.003], [1.28, 0.15, 0.098, 0.004],
  [1.35, 0.156, 0.094, 0.003], [1.415, 0.158, 0.085], [1.455, 0.132, 0.068], [1.474, 0.066, 0.052], [1.484, 0.02, 0.02],
];

/**
 * placa fina pegada a una superficie (bolsillos, hebilla): la sonda busca la
 * piel o la tela en (x, y) desde delante (dir 1) o desde detrás (dir -1)
 */
function patch(probe, w, h, d, x, y, dir, tilt = 0) {
  const zAt = (xx, yy) => probe(xx, yy, dir * 0.6, 0, 0, -dir)?.z;
  const z0 = zAt(x, y), zx = zAt(x + 0.015, y), zy = zAt(x, y + 0.015);
  if (z0 == null || zx == null || zy == null) return null;
  const tx = new THREE.Vector3(0.015, 0, zx - z0).normalize();
  const ty = new THREE.Vector3(0, 0.015, zy - z0).normalize();
  const n = new THREE.Vector3().crossVectors(tx, ty).normalize();
  if (n.z * dir < 0) n.negate();
  // base derecha: arriba es la vertical sobre el plano de la tela
  const up = new THREE.Vector3(0, 1, 0).addScaledVector(n, -n.y).normalize();
  const right = new THREE.Vector3().crossVectors(up, n);
  const g = new THREE.BoxGeometry(w, h, d);
  g.rotateZ(tilt);
  g.applyMatrix4(new THREE.Matrix4().makeBasis(right, up, n));
  g.translate(x + n.x * (d / 2 - 0.001), y + n.y * (d / 2 - 0.001), z0 + n.z * (d / 2 - 0.001));
  return g;
}

const DEFAULTS = {
  sex: 'm', build: 1, height: 1.78, skin: 0xd8a87c, hair: 0x3a2a1c, hairStyle: 'short',
  top: 0xe8e4da, topStyle: 'tshirt', sleeves: null, inner: 0xf2f2f2, bottom: 0x2e3844, bottomStyle: null,
  shoes: 0xf2f2f2, shoeStyle: 'sneaker', shorts: false, shades: false, beard: false, cap: false, capColor: 0x1c2a44,
  eyes: 0x3a2616, belt: null, backpack: null, bag: null, detail: 1,
};

const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

export function buildHuman(opts = {}) {
  const o = { ...DEFAULTS, ...opts };
  const female = o.sex === 'f';
  const hi = o.detail > 1;
  const bs = o.bottomStyle || (o.shorts ? 'shorts' : 'pants');
  const ts = bs === 'dress' ? (o.topStyle === 'long' ? 'long' : 'tank') : o.topStyle;
  const k = o.build * (female ? 0.9 : 1); // grosor de brazos y piernas
  // bañador: torso al aire, bikini o bañador entero
  const swimTop = ts === 'none' || ts === 'bikini' || ts === 'swimsuit';
  const skin = fin(col(o.skin), 0.55);
  const cloth = (c, r = 0.88) => fin(col(c), r, true);
  const top = cloth(o.top, swimTop ? 0.45 : 0.88);
  const sleeve = cloth(ts === 'jacket' ? o.top : (o.sleeves ?? o.top)), inner = cloth(o.inner);
  const bottom = cloth(bs === 'dress' ? o.top : o.bottom, bs === 'swim' ? 0.45 : 0.9);
  const shoe = fin(col(o.shoes), o.shoeStyle === 'shoe' ? 0.32 : 0.72);
  const parts = [];
  const add = (g, paint, bone) => parts.push(skinPart(g, typeof paint === 'function' ? paint : () => paint, bone));
  const addLathe = (g, bone) => {
    const cs = g.userData.colors;
    parts.push(skinPart(g, (x, y, z, i) => cs[i], bone));
  };
  const SEG = hi ? 14 : 10;

  // ── tronco ──
  const rings = (female ? RINGS_F : RINGS_M).map(([y, rx, rz, dz]) => [y, rx * o.build, rz * (0.6 + 0.4 * o.build) * (o.build > 1.1 ? 1.08 : 1), dz || 0]);
  const hem = ts === 'jacket' ? 0.93 : 0.975;
  const crew = ts === 'tshirt' || ts === 'long';   // cuello redondo, pegado al cuello
  const neckY = crew ? NECK + 0.011 : NECK - 0.012;
  const beltOn = (bs === 'pants' || bs === 'shorts') && o.belt != null;
  const SWIM_HEM = 0.935, BIK0 = 1.205, BIK1 = 1.315, SUIT = 1.36;
  const cuts = [hem, neckY];
  if (!swimTop && bs !== 'dress') cuts.push(hem + 0.014);
  if (beltOn) cuts.push(hem - 0.022);
  if (swimTop) cuts.push(SWIM_HEM, ...(ts === 'bikini' ? [BIK0, BIK1] : ts === 'swimsuit' ? [SUIT] : []));
  const cutRings = withCuts(rings, cuts);
  const torso = torsoGeo(cutRings, { bust: female ? 0.034 : 0, belly: o.build > 1.12 ? (o.build - 1.05) * 0.25 : 0 }, hi ? 28 : 18);
  const beltC = beltOn ? cloth(o.belt, 0.5) : null;
  const topHem = shade(top, 0.84);
  add(torso, (x, y, z) => {
    if (y > neckY) return skin;
    if (swimTop) {
      if (ts === 'swimsuit') return y < SUIT ? top : skin;
      if (ts === 'bikini' && y > BIK0 && y < BIK1) return top;
      return y > SWIM_HEM ? skin : bottom;
    }
    if (ts === 'tank' && ((Math.abs(x) > 0.105 * o.build && y > SH - 0.04) || (z > 0.02 && y > SH - 0.015))) return skin;
    if (bs === 'dress') return top;
    if (y > hem) {
      if (ts === 'jacket' && Math.abs(x) < 0.045 && z > 0) return inner;
      return y < hem + 0.014 ? topHem : top;
    }
    if (beltOn && y > hem - 0.022) return beltC;
    return bottom;
  }, (x, y) => [B.hips, B.spine, smooth01((y - 1.0) / 0.12)]);
  // cuello de la camiseta (canalé)
  if (crew) {
    const [, rx, rz] = ringAt(cutRings, neckY);
    const g = new THREE.TorusGeometry(1, 0.07, 6, hi ? 32 : 20);
    g.rotateX(Math.PI / 2);
    g.scale(rx, 0.09, rz);
    g.translate(0, neckY + 0.002, 0);
    add(g, shade(top, 0.9), B.spine);
  }
  // vaqueros: bolsillos, bragueta y hebilla
  if (hi && (bs === 'pants' || bs === 'shorts')) {
    const probe = prober(torso);
    const seam = shade(bottom, 0.62), pocket = shade(bottom, 0.93);
    for (const sx of [-1, 1]) {
      const back = patch(probe, 0.074 * o.build, 0.082, 0.004, sx * 0.072 * o.build, 0.885, -1, sx * 0.06);
      if (back) add(back, pocket, B.hips);
      const pts = [[0.058, hem - 0.012], [0.085, 0.945], [0.112, 0.922], [0.138, 0.9]]
        .map(([x, y]) => [sx * x * o.build, y, (probe(sx * x * o.build, y, 0.6, 0, 0, -1)?.z ?? 0.1) + 0.0012]);
      add(tube(pts, 0.0016, 10, 4), seam, B.hips);
    }
    const fly = [[0.016, hem - 0.01], [0.016, 0.91], [0.01, 0.889], [0, 0.882]]
      .map(([x, y]) => [x, y, (probe(x, y, 0.6, 0, 0, -1)?.z ?? 0.1) + 0.0012]);
    add(tube(fly, 0.0014, 10, 4), seam, B.hips);
    if (beltOn) {
      const buckle = patch(probe, 0.046, 0.03, 0.008, 0, hem - 0.011, 1);
      if (buckle) add(buckle, fin(col(0xcfc8b8), -0.28), B.hips);
    }
  }

  // falda o vestido: cuelga de la cadera
  if (bs === 'skirt' || bs === 'dress') {
    // el bajo se cierra hacia dentro: no se ve el hueco desde ningún ángulo
    const kb = o.build;
    const prof = [[0.152 * kb, 1.0], [0.172 * kb, 0.93], [0.2 * kb, 0.8], [0.232 * kb, 0.64], [0.246 * kb, 0.56], [0.24 * kb, 0.547], [0.07, 0.552]];
    const g = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)).reverse(), 18);
    g.scale(1, 1, 0.86);
    const lx0 = 0.095 * 1.03 * Math.min(1.1, kb);
    add(g, (x, y) => (y < 0.549 ? shade(bottom, 0.5) : bottom), (x, y) => {
      // el bajo acompaña a la pierna de su lado (el centro se queda con la cadera)
      const w = 0.62 * smooth01((0.93 - y) / 0.3) * smooth01(Math.abs(x) / (lx0 * 1.6));
      return [[B.hips, 1 - w], [x < 0 ? B.legL : B.legR, w]];
    });
  }

  // ── piernas: muslo (cadera) + pierna (rodilla) + calzado ──
  const pants = bs === 'pants';
  const legBands = (part) => {
    if (pants) return part === 'thigh' ? [[-10, bottom]] : [[-0.392, bottom], [-10, shade(bottom, 0.8)]];
    if (bs === 'shorts') return part === 'thigh' ? [[-0.284, bottom], [-0.3, shade(bottom, 0.84)]] : [];
    if (bs === 'swim') return part === 'thigh' ? [[female ? 0.035 : -0.11, bottom]] : [];
    return [];
  };
  for (const [side, legB, kneeB] of [[-1, B.legL, B.kneeL], [1, B.legR, B.kneeR]]) {
    const x0 = side * 0.095 * (female ? 1.03 : 1) * Math.min(1.1, o.build);
    // con pantalón largo el muslo baja ancho y tapa la rodilla
    const thighP = [[0, 0.09], [0.055, 0.075], [0.086, 0.03], [0.09, -0.02], [0.084, -0.12], [0.073, -0.25], [0.062, -0.36], [0.055, -0.42], [0.052, -0.43], [0.038, -0.465], [0, -0.478]]
      .map(([r, y]) => [(pants && y < -0.3 && y > -0.44 ? Math.max(r, 0.057) : r) * k * (female ? 1.05 : 1), y]);
    const tb = legBands('thigh');
    const thigh = lathe(thighP, tb, tb.length && tb[tb.length - 1][0] < -1 ? bottom : skin, { segs: SEG, sz: 0.95 });
    thigh.translate(x0, HIP, 0);
    addLathe(thigh, legB);
    const shinP = [[0, 0.05], [0.04, 0.038], [0.052, 0.005], [0.056, -0.06], [0.06, -0.13], [0.052, -0.22], [0.04, -0.32], [0.033, -0.38], [0.032, -0.41], [0.02, -0.43], [0, -0.435]]
      .map(([r, y]) => [(pants && y < 0.02 && y > -0.42 ? Math.max(r, 0.056) : r) * k, y]);
    const shin = lathe(shinP, legBands('shin'), pants ? shade(bottom, 0.8) : skin, { segs: SEG, sz: 0.95 });
    shin.translate(x0, KNEE, 0);
    addLathe(shin, kneeB);
    addShoe(o, add, { x0, kneeB, hi, skin, shoe, top });
  }

  // ── brazos: hombro (con manga) + antebrazo + mano ──
  const sh = (female ? 0.162 : 0.181) * (0.75 + 0.25 * o.build);
  const longSleeve = ts === 'long' || ts === 'jacket';
  const watch = hi && !longSleeve && o.watch !== false;
  for (const [side, armB, elbB] of [[-1, B.armL, B.elbowL], [1, B.armR, B.elbowR]]) {
    const x0 = side * sh;
    const ka = k * (female ? 0.92 : 1);
    const upP = [[0, 0.028], [0.038, 0.024], [0.056, 0.006], [0.06, -0.018], [0.057, -0.06], [0.052, -0.14], [0.047, -0.22], [0.043, -0.27], [0.042, -0.29], [0.03, -0.32], [0, -0.332]]
      .map(([r, y]) => [r * ka, y]);
    const cutS = female ? -0.09 : -0.13;
    const upBands = ts === 'tank' || swimTop ? [] : longSleeve ? [[-10, sleeve]] : [[cutS + 0.015, sleeve], [cutS, shade(sleeve, 0.86)]];
    const up = lathe(upP, upBands, longSleeve ? sleeve : skin, { segs: SEG, cloth: 1.025 });
    up.translate(x0, SH, 0);
    addLathe(up, armB);
    const foreP = [[0, 0.042], [0.03, 0.034], [0.043, 0.01], [0.045, -0.04], [0.04, -0.12], [0.033, -0.2], [0.029, -0.24], [0.02, -0.255], [0, -0.26]]
      .map(([r, y]) => [r * ka, y]);
    const fore = lathe(foreP, longSleeve ? [[-0.205, sleeve], [-0.225, shade(sleeve, 0.84)]] : [], skin, { segs: SEG });
    if (!longSleeve) {
      // la muñeca se aplana hacia la mano (más ancha que gruesa)
      const q = fore.getAttribute('position');
      for (let i = 0; i < q.count; i++) {
        const w = smooth01((-0.17 - q.getY(i)) / 0.07);
        q.setX(i, q.getX(i) * (1 - 0.3 * w));
        q.setZ(i, q.getZ(i) * (1 + 0.08 * w));
      }
    }
    fore.translate(x0, ELBOW, 0);
    addLathe(fore, elbB);
    addHand(add, { x0, side, elbB, hi, skin, k });
    // reloj en la muñeca izquierda
    if (watch && side < 0) {
      const wy = ELBOW - 0.226, rw = 0.0305 * ka + 0.0025;
      const band = new THREE.CylinderGeometry(rw, rw, 0.017, 16, 1, true);
      band.translate(x0, wy, 0);
      add(band, fin(col(0x1d1e21), 0.6), elbB);
      const face = new THREE.CylinderGeometry(0.0145, 0.0145, 0.006, 18);
      face.rotateZ(Math.PI / 2);
      face.translate(x0 + side * (rw + 0.0015), wy, 0);
      add(face, (x) => (Math.abs(x - x0) > rw + 0.0035 ? fin(col(0x14181d), 0.08) : fin(col(0xbdbdc2), -0.25)), elbB);
    }
  }

  // ── cuello y cabeza ──
  const kn = female ? 0.95 : 1.17;
  const neckG = lathe([[0, 0.17], [0.046 * kn, 0.16], [0.05 * kn, 0.08], [0.054 * kn, 0.0], [0.06 * kn, -0.04], [0, -0.05]], [], skin, { segs: hi ? 16 : 10, sz: 0.95 });
  neckG.translate(0, NECK - 0.07, 0.0);
  const neckW = (x, y) => [B.spine, B.head, smooth01((y - (NECK - 0.03)) / 0.08)];
  addLathe(neckG, neckW);
  buildHead(o, parts, { female, detail: o.detail });

  if (o.backpack != null) {
    const bp = cloth(o.backpack, 0.8);
    const g = box(0.27 * o.build, 0.34, 0.13, 0, 1.2, -0.12 * (0.6 + 0.4 * o.build) - 0.075);
    add(g, bp, B.spine);
    for (const sx of [-1, 1]) add(box(0.04, 0.26, 0.012, sx * 0.1, 1.3, 0.106 * o.build + 0.004, 0.1), shade(bp, 0.7), B.spine);
  }
  if (o.bag != null) {
    add(box(0.07, 0.17, 0.22, sh + 0.075, 0.97, 0.0), cloth(o.bag, 0.6), B.hips);
  }

  // ── esqueleto ──
  const bones = [];
  const bone = (name, x, y, z, parent) => {
    const b = new THREE.Bone();
    b.name = name;
    b.position.set(x, y, z);
    if (parent) parent.add(b);
    bones.push(b);
    return b;
  };
  const hips = bone('hips', 0, HIP, 0);
  const spine = bone('spine', 0, SPINE - HIP, 0, hips);
  const headB = bone('head', 0, NECK - SPINE, 0, spine);
  const armL = bone('armL', -sh, SH - SPINE, 0, spine);
  const elbowL = bone('elbowL', 0, ELBOW - SH, 0, armL);
  const armR = bone('armR', sh, SH - SPINE, 0, spine);
  const elbowR = bone('elbowR', 0, ELBOW - SH, 0, armR);
  const lx = 0.095 * (female ? 1.03 : 1) * Math.min(1.1, o.build);
  const legL = bone('legL', -lx, 0, 0, hips);
  const kneeL = bone('kneeL', 0, KNEE - HIP, 0, legL);
  const legR = bone('legR', lx, 0, 0, hips);
  const kneeR = bone('kneeR', 0, KNEE - HIP, 0, legR);

  const KEEP = ['position', 'normal', 'color', 'rough', 'skinIndex', 'skinWeight'];
  const geo = mergeGeometries(parts.map(g => {
    for (const a of Object.keys(g.attributes)) if (!KEEP.includes(a)) g.deleteAttribute(a);
    return g;
  }), false);
  const mesh = new THREE.SkinnedMesh(geo, MAT);
  mesh.add(hips);
  mesh.updateMatrixWorld(true);
  mesh.bind(new THREE.Skeleton(bones));
  mesh.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.95, 0), 1.2);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  // postura de reposo: brazos algo separados del cuerpo
  armL.rotation.z = -0.075;
  armR.rotation.z = 0.075;
  // rodillas y codos se doblan solos según el giro de cadera y hombro
  const link = (joint, child, fn) => {
    const orig = joint.rotation._onChangeCallback;
    joint.rotation._onChange(() => { orig(); child.rotation.x = fn(joint.rotation.x); });
  };
  const knee = (a) => 0.06 + Math.max(0, a) * 1.15 + Math.max(0, -a - 0.9) * 0.6;
  const elbow = (a) => -(0.14 + (a < 0 && a > -1.5 ? Math.sin((-a / 1.5) * Math.PI) * 0.6 : 0) + Math.max(0, a) * 0.15);
  link(legL, kneeL, knee);
  link(legR, kneeR, knee);
  link(armL, elbowL, elbow);
  link(armR, elbowR, elbow);
  for (const j of [legL, legR, armL, armR]) j.rotation.x = 0;
  // los mayores caminan algo encorvados
  if (o.old) { spine.rotation.x = 0.13; headB.rotation.x = -0.08; }

  const group = new THREE.Group();
  group.add(mesh);
  group.scale.setScalar(o.height / 1.78);
  return { group, mesh, legL, legR, armL, armR, kneeL, kneeR, elbowL, elbowR, spine, head: headB, hips };
}

/** mano: con detalle, palma y cinco dedos algo curvados; si no, manopla con pulgar */
function addHand(add, { x0, side, elbB, hi, skin, k }) {
  const hy = ELBOW - 0.25;
  if (!hi) {
    add(ell(1, 0.021 * k, 0.074, 0.043, x0, hy - 0.06, 0.006, 8, 6), skin, elbB);
    const thumb = new THREE.CapsuleGeometry(0.0115, 0.035, 2, 5);
    thumb.rotateX(0.55);
    thumb.translate(x0 - side * 0.006, hy - 0.035, 0.04);
    add(welded(thumb), skin, elbB);
    return;
  }
  const kk = Math.sqrt(k);
  add(ell(1, 0.0178 * k, 0.047, 0.04, x0, hy - 0.04, 0.004, 14, 10), skin, elbB);
  // índice, corazón, anular y meñique (del pulgar hacia atrás)
  const F = [[0.026, 0.041, -0.04], [0.009, 0.047, -0.012], [-0.008, 0.044, 0.015], [-0.024, 0.035, 0.045]];
  for (const [fz, len, spread] of F) {
    add(digit(0.0085 * kk, len, x0 - side * 0.002, hy - 0.076, 0.004 + fz, spread, -side * 0.2), skin, elbB);
  }
  add(digit(0.0098 * kk, 0.032, x0 - side * 0.007, hy - 0.03, 0.033, -0.32, -side * 0.3), skin, elbB);
}

/** calzado; con detalle, suela con entresuela, cordones, franja lateral y talón */
function addShoe(o, add, { x0, kneeB, hi, skin, shoe, top }) {
  const ankle = KNEE - 0.42;
  const style = o.shoeStyle;
  const barefoot = style === 'barefoot', sandal = style === 'sandal', sneaker = style === 'sneaker';
  const sole = barefoot ? shade(skin, 0.9) : sneaker ? fin(col(0xf4f4f0), 0.7) : sandal ? col(0x3a2a1c) : fin(shade(col(o.shoes), 0.55), 0.6);
  const upper = new THREE.CapsuleGeometry(0.047, 0.15, hi ? 5 : 3, hi ? 14 : 8);
  upper.rotateX(Math.PI / 2);
  {
    const q = upper.getAttribute('position');
    for (let i = 0; i < q.count; i++) {
      const z = q.getZ(i), y = q.getY(i);
      const t = Math.max(0, z / 0.122);
      const yy = y * 0.86 * (1 - 0.38 * t) - (y < 0 ? 0 : 0.012 * t);
      // planta plana sobre el suelo
      q.setY(i, Math.max(yy, -0.044));
    }
  }
  upper.translate(x0, 0.052, 0.047);
  const up = welded(upper);
  add(up, (x, y, z) => {
    if (barefoot) return y < 0.012 ? sole : skin;
    if (y < 0.026) return sole;
    if (!sandal) return y > ankle + 0.015 && z < 0.0 ? shade(shoe, 0.85) : shoe;
    // sandalia: pie al aire con dos tiras
    return Math.abs(z - 0.07) < 0.018 || Math.abs(z - 0.0) < 0.014 ? shoe : skin;
  }, kneeB);
  if (!hi || barefoot || sandal) return;

  // zapatilla: entresuela blanca y piso de goma (el zapato lleva la suela pintada)
  if (sneaker) {
    const solePts = [[0, 0.025], [0.95, 0.025], [1.0, 0.02], [1.0, 0.006], [0.97, 0.0], [0, 0.0]];
    const s = lathe(solePts, [[0.007, fin(col(0xf3f2ee), 0.65)]], fin(col(0x8d8a84), 0.9), { segs: 22, sx: 0.049, sz: 0.12 });
    const q = s.getAttribute('position');
    for (let i = 0; i < q.count; i++) {
      const z = q.getZ(i);
      q.setX(i, q.getX(i) * (1 + 0.07 * smooth01(z / 0.09) - 0.08 * smooth01(-z / 0.1)));
    }
    s.translate(x0, 0, 0.047);
    const sc = s.userData.colors;
    add(s, (x, y, z, i) => sc[i], kneeB);
  }

  // cordones sobre el empeine, siguiendo su inclinación
  const probe = prober(up);
  const topAt = (z) => probe(x0, 0.4, z, 0, -1, 0)?.y;
  const lace = sneaker ? (lum(shoe) > 0.4 ? fin(col(0xf6f6f2), 0.8) : fin(col(0x3b3c40), 0.8)) : fin(shade(col(o.shoes), 0.4), 0.6);
  for (const lz of [0.028, 0.05, 0.072, 0.094]) {
    const y0 = topAt(lz), y1 = topAt(lz + 0.01), ym = topAt(lz - 0.01);
    if (y0 == null || y1 == null || ym == null) continue;
    add(box(0.03, 0.0032, 0.0055, x0, y0 + 0.0012, lz, -Math.atan2(y1 - ym, 0.02)), lace, kneeB);
  }
  if (!sneaker) return;
  // franja lateral y lengüeta del talón
  const accent = o.shoeAccent != null ? fin(col(o.shoeAccent), 0.6) : lum(shoe) > 0.4 ? fin(shade(top, 1), 0.6) : fin(col(0xf2f2ee), 0.6);
  for (const sx of [-1, 1]) {
    const hit = probe(x0 + sx * 0.3, 0.046, 0.05, -sx, 0, 0);
    if (hit) add(box(0.0025, 0.011, 0.072, hit.x + sx * 0.0008, 0.046, 0.05, 0.22), accent, kneeB);
  }
  const heel = probe(x0, 0.082, -0.4, 0, 0, 1);
  if (heel) add(box(0.024, 0.026, 0.006, x0, 0.082, heel.z - 0.0015), accent, kneeB);
}
