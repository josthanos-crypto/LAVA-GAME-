import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { contactShadowTexture, plateTexture } from './textures.js';
import { buildHuman } from './humanModel.js';

/**
 * Motos y quads, con marca y modelo inventados (carModels.js, BIKES): la moto naked Tinajo Rayo 650 y el
 * quad Malpaís Jable 450. Piezas sencillas (ruedas, horquilla, depósito, asiento, faros) unidas por
 * material. makeBike devuelve lo mismo que makeCar (group, body, wheels, dims...), así el tráfico, los
 * aparcados y el coche del jugador (car.js) las usan igual. La carrocería se inclina en las curvas (LEAN)
 * y el que va encima se ve (en el tráfico, un piloto con casco; si la llevas tú, tu personaje).
 */

const mat = (color, roughness = 0.5, metalness = 0.1, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
const BLACK = mat(0x141517, 0.6, 0.15);
const RUBBER = mat(0x1a1b1d, 0.92, 0);
const METAL = mat(0x3a3d42, 0.45, 0.6);
const CHROME = mat(0xd8dde2, 0.18, 1);
const SEAT = mat(0x1c1a19, 0.8, 0.02);
const HEAD = mat(0xf4f6ff, 0.1, 0.4, { emissive: 0xfff3d6, emissiveIntensity: 0.5 });
const TAIL = mat(0x7a0d0d, 0.3, 0.1, { emissive: 0xff1a10, emissiveIntensity: 0.45 });
const AMBER = mat(0xc27417, 0.3, 0.1, { emissive: 0xff8a10, emissiveIntensity: 0.15 });
const SHADOW = new THREE.MeshBasicMaterial({ map: contactShadowTexture(), transparent: true, depthWrite: false, opacity: 0.8 });
const PAINTS = new Map();
const paintOf = (hex) => {
  if (!PAINTS.has(hex)) PAINTS.set(hex, mat(hex, 0.32, 0.35));
  return PAINTS.get(hex);
};
const PLATES = [];
function plateMat() {
  if (PLATES.length < 6) {
    const L = 'BCDFGHJKLMNPRSTVWXYZ';
    let t = String(Math.floor(Math.random() * 10000)).padStart(4, '0') + ' ';
    for (let i = 0; i < 3; i++) t += L[Math.floor(Math.random() * L.length)];
    PLATES.push(new THREE.MeshStandardMaterial({ map: plateTexture(t), roughness: 0.35 }));
    return PLATES[PLATES.length - 1];
  }
  return PLATES[Math.floor(Math.random() * PLATES.length)];
}

// ── piezas ──
const box = (w, h, d, x, y, z, rx = 0, ry = 0, rz = 0) => {
  const g = new THREE.BoxGeometry(w, h, d);
  if (rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz)));
  return g.translate(x, y, z);
};
const ball = (r, sx, sy, sz, x, y, z) => new THREE.SphereGeometry(r, 16, 10).scale(sx, sy, sz).translate(x, y, z);
/** tubo de a a b (puntos [x, y, z]) */
function tube(a, b, r, seg = 8) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const L = A.distanceTo(B);
  const g = new THREE.CylinderGeometry(r, r, L, seg);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  g.applyQuaternion(q);
  const m = A.add(B).multiplyScalar(0.5);
  return g.translate(m.x, m.y, m.z);
}
/** eje x: ruedas, cilindros de lado */
const cylX = (r, len, x, y, z, seg = 20) => new THREE.CylinderGeometry(r, r, len, seg).rotateZ(Math.PI / 2).translate(x, y, z);
const cylZ = (r, len, x, y, z, seg = 16) => new THREE.CylinderGeometry(r, r, len, seg).rotateX(Math.PI / 2).translate(x, y, z);

/** junta piezas del mismo material en una sola malla */
function meshOf(geos, m) {
  const g = mergeGeometries(geos.map(x => x.index ? x.toNonIndexed() : x), false);
  const mesh = new THREE.Mesh(g, m);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** rueda: neumático, llanta oscura con radios, buje y disco de freno; gira en su grupo (eje x) */
function wheel({ r, tireW, fat = false, disc = true }) {
  const w = new THREE.Group();
  const tire = fat
    ? meshOf([cylX(r, tireW, 0, 0, 0, 22), cylX(r * 0.92, tireW + 0.02, 0, 0, 0, 22)], RUBBER)
    : meshOf([new THREE.TorusGeometry(r - tireW / 2, tireW / 2, 10, 28).rotateY(Math.PI / 2)], RUBBER);
  const rimR = fat ? r * 0.62 : r - tireW - 0.01;
  const spokes = [];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    spokes.push(box(0.02, rimR * 1.9, 0.035, 0, 0, 0, a, 0, 0));
  }
  w.add(tire, meshOf([cylX(rimR, fat ? tireW * 0.9 : 0.04, 0, 0, 0), ...spokes], METAL), meshOf([cylX(0.05, (fat ? tireW : 0.1) + 0.02, 0, 0, 0, 10)], CHROME));
  if (disc) w.add(meshOf([cylX(r * 0.48, 0.008, 0.06, 0, 0, 20)], CHROME));
  return w;
}

/** proxy de rueda como los de makeCar: rotation.x = girar; rotation.y = dirección (si la rueda dirige) */
const proxyOf = (spin, steer = null) => ({
  rotation: {
    set x(v) { spin.rotation.x = v; },
    get x() { return spin.rotation.x; },
    set y(v) { if (steer) steer.rotation.y = v; },
    get y() { return steer ? steer.rotation.y : 0; },
  },
});

// ── la moto: Tinajo Rayo 650 (naked de media cilindrada) ──
function buildMoto(body, paint) {
  const R = 0.31, TW = 0.13;
  const lights = { head: [HEAD], tail: [TAIL] };
  // detrás: basculante, rueda, colín con piloto y matrícula
  const rear = new THREE.Group();
  rear.position.set(0, R, -0.72);
  const rw = wheel({ r: R, tireW: TW + 0.02 });
  rear.add(rw);
  body.add(rear);
  body.add(meshOf([
    box(0.04, 0.05, 0.62, 0.09, 0.37, -0.42, 0.18), box(0.04, 0.05, 0.62, -0.09, 0.37, -0.42, 0.18),
    // chasis multitubular y motor
    tube([0.09, 0.9, 0.46], [0.11, 0.46, -0.1], 0.022), tube([-0.09, 0.9, 0.46], [-0.11, 0.46, -0.1], 0.022),
    tube([0.09, 0.9, 0.46], [0.1, 0.84, -0.2], 0.02), tube([-0.09, 0.9, 0.46], [-0.1, 0.84, -0.2], 0.02),
    tube([0.1, 0.84, -0.2], [0.11, 0.46, -0.1], 0.02), tube([-0.1, 0.84, -0.2], [-0.11, 0.46, -0.1], 0.02),
    // estribos
    tube([0.12, 0.36, -0.16], [0.24, 0.36, -0.16], 0.014), tube([-0.12, 0.36, -0.16], [-0.24, 0.36, -0.16], 0.014),
  ], METAL));
  body.add(meshOf([
    box(0.3, 0.3, 0.38, 0, 0.47, 0.12), box(0.34, 0.08, 0.3, 0, 0.66, 0.16),
    box(0.36, 0.025, 0.28, 0, 0.71, 0.16), box(0.36, 0.025, 0.28, 0, 0.75, 0.16),
    cylX(0.11, 0.38, 0, 0.42, -0.02, 16),
  ], mat(0x4a4d52, 0.55, 0.55)));
  // escape: colectores y silencioso a la derecha, subiendo hacia atrás
  body.add(meshOf([
    tube([0.08, 0.55, 0.3], [0.13, 0.3, 0.05], 0.024), tube([0.13, 0.3, 0.05], [0.16, 0.36, -0.35], 0.03),
    tube([0.16, 0.36, -0.35], [0.17, 0.52, -0.7], 0.065, 14),
  ], CHROME));
  // depósito, tapas laterales y colín de su color
  body.add(meshOf([
    ball(1, 0.17, 0.115, 0.27, 0, 0.92, 0.2), box(0.3, 0.12, 0.2, 0, 0.84, 0.32),
    box(0.22, 0.1, 0.36, 0, 0.82, -0.36, -0.14), box(0.16, 0.08, 0.2, 0, 0.88, -0.62, -0.22),
  ], paint));
  body.add(meshOf([box(0.26, 0.07, 0.5, 0, 0.885, -0.18, -0.04), box(0.2, 0.05, 0.2, 0, 0.93, -0.46, -0.16)], SEAT));
  body.add(meshOf([box(0.14, 0.05, 0.03, 0, 0.9, -0.73)], TAIL));
  body.add(meshOf([box(0.04, 0.03, 0.06, 0.1, 0.8, -0.72), box(0.04, 0.03, 0.06, -0.1, 0.8, -0.72)], AMBER));
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.12), plateMat());
  plate.position.set(0, 0.7, -0.8);
  plate.rotation.set(0.25, Math.PI, 0);
  body.add(plate, meshOf([box(0.03, 0.03, 0.2, 0, 0.76, -0.71, -0.6)], BLACK));
  // delante: horquilla inclinada que gira con el manillar, rueda, faro redondo, cúpula y aleta
  const tilt = new THREE.Group();
  tilt.position.set(0, 0.92, 0.48);
  tilt.rotation.x = -0.35;
  const steer = new THREE.Group();
  tilt.add(steer);
  const fw = wheel({ r: R, tireW: TW });
  const front = new THREE.Group();
  front.position.set(0, -0.648, 0);
  front.add(fw);
  steer.add(front);
  steer.add(meshOf([tube([0.085, 0.04, 0], [0.085, -0.62, 0], 0.024), tube([-0.085, 0.04, 0], [-0.085, -0.62, 0], 0.024)], CHROME));
  steer.add(meshOf([
    box(0.22, 0.04, 0.08, 0, 0.02, 0.02), box(0.22, 0.03, 0.06, 0, -0.13, 0.0),
    // manillar, puños y retrovisores
    tube([0, 0.1, -0.02], [0.36, 0.13, -0.1], 0.013), tube([0, 0.1, -0.02], [-0.36, 0.13, -0.1], 0.013),
    tube([0.27, 0.12, -0.08], [0.31, 0.34, -0.04], 0.007), tube([-0.27, 0.12, -0.08], [-0.31, 0.34, -0.04], 0.007),
  ], METAL));
  steer.add(meshOf([
    cylX(0.019, 0.1, 0.33, 0.125, -0.1, 8), cylX(0.019, 0.1, -0.33, 0.125, -0.1, 8),
    ball(1, 0.05, 0.035, 0.012, 0.31, 0.35, -0.04), ball(1, 0.05, 0.035, 0.012, -0.31, 0.35, -0.04),
    cylZ(0.095, 0.1, 0, -0.06, 0.14, 18),
  ], BLACK));
  steer.add(meshOf([cylZ(0.082, 0.02, 0, -0.06, 0.195, 18)], HEAD));
  steer.add(meshOf([box(0.04, 0.03, 0.05, 0.14, -0.03, 0.12), box(0.04, 0.03, 0.05, -0.14, -0.03, 0.12)], AMBER));
  steer.add(meshOf([
    box(0.2, 0.17, 0.02, 0, 0.1, 0.17, -0.3),                        // cúpula pequeña
    box(0.16, 0.025, 0.42, 0, -0.648 + R + 0.06, 0.02),             // aleta sobre la rueda
  ], paint));
  body.add(tilt);
  const wheels = [{ ...proxyOf(fw, steer), x: 0, z: 0.7 }, { ...proxyOf(rw), x: 0, z: -0.72 }];
  return {
    wheels, lights,
    dims: { width: 0.78, length: 2.1, roofY: 1.15, belt: 0.9, wheelR: R, wheelBase: 1.42, wheelZ: [0.7, -0.72], zf: 1.02, zr: -1.0 },
    seat: { y: 0.92, z: -0.16, lean: 0.38, legs: 0.95, knees: 1.75, arms: 0.75, elbows: 0.35, spread: 0.18 },
  };
}

// ── el quad: Malpaís Jable 450 ──
function buildQuad(body, paint) {
  const R = 0.29, TW = 0.22, X = 0.47;
  const lights = { head: [HEAD], tail: [TAIL] };
  const wheels = [];
  const steers = [];
  for (const [z, front] of [[0.6, true], [-0.58, false]]) {
    for (const sx of [1, -1]) {
      const w = wheel({ r: R, tireW: TW, fat: true, disc: false });
      w.scale.x = sx;
      const piv = new THREE.Group();
      piv.position.set(sx * X, R, z);
      piv.add(w);
      body.add(piv);
      if (front) steers.push(piv);
      wheels.push({ ...proxyOf(w, front ? piv : null), x: sx * X, z });
    }
  }
  // chasis, bajos y brazos de suspensión
  body.add(meshOf([
    box(0.42, 0.2, 1.15, 0, 0.42, 0),
    tube([0.18, 0.42, 0.55], [X - 0.12, R, 0.6], 0.025), tube([-0.18, 0.42, 0.55], [-X + 0.12, R, 0.6], 0.025),
    tube([0.18, 0.4, -0.5], [X - 0.12, R, -0.58], 0.03), tube([-0.18, 0.4, -0.5], [-X + 0.12, R, -0.58], 0.03),
    // parrillas de delante y de detrás, y estribos
    box(0.62, 0.025, 0.025, 0, 0.84, 0.98), box(0.62, 0.025, 0.025, 0, 0.84, 0.72), box(0.025, 0.025, 0.28, 0.3, 0.84, 0.85), box(0.025, 0.025, 0.28, -0.3, 0.84, 0.85),
    box(0.025, 0.025, 0.28, 0.1, 0.84, 0.85), box(0.025, 0.025, 0.28, -0.1, 0.84, 0.85),
    box(0.7, 0.025, 0.025, 0, 0.88, -0.98), box(0.7, 0.025, 0.025, 0, 0.88, -0.66), box(0.025, 0.025, 0.34, 0.34, 0.88, -0.82), box(0.025, 0.025, 0.34, -0.34, 0.88, -0.82),
    box(0.025, 0.025, 0.34, 0.12, 0.88, -0.82), box(0.025, 0.025, 0.34, -0.12, 0.88, -0.82),
    box(0.22, 0.03, 0.34, 0.33, 0.36, -0.02), box(0.22, 0.03, 0.34, -0.33, 0.36, -0.02),
  ], BLACK));
  body.add(meshOf([box(0.28, 0.24, 0.36, 0, 0.5, -0.02), cylX(0.1, 0.32, 0, 0.62, 0.1, 14)], mat(0x4a4d52, 0.55, 0.55)));
  body.add(meshOf([tube([0.12, 0.5, -0.2], [0.24, 0.62, -0.78], 0.04, 12), tube([0.24, 0.62, -0.78], [0.25, 0.66, -0.92], 0.055, 12)], CHROME));
  // guardabarros, morro y depósito de su color
  body.add(meshOf([
    box(1.12, 0.06, 0.62, 0, 0.66, 0.58), box(0.2, 0.18, 0.5, X, 0.58, 0.58, 0, 0, -0.5), box(0.2, 0.18, 0.5, -X, 0.58, 0.58, 0, 0, 0.5),
    box(0.5, 0.22, 0.3, 0, 0.62, 0.86, 0.3), box(0.4, 0.16, 0.36, 0, 0.8, 0.26, -0.1),
    box(1.12, 0.06, 0.6, 0, 0.7, -0.56), box(0.2, 0.18, 0.48, X, 0.62, -0.56, 0, 0, -0.5), box(0.2, 0.18, 0.48, -X, 0.62, -0.56, 0, 0, 0.5),
  ], paint));
  body.add(meshOf([box(0.34, 0.11, 0.62, 0, 0.84, -0.22)], SEAT));
  body.add(meshOf([cylZ(0.055, 0.03, 0.15, 0.66, 1.01, 14), cylZ(0.055, 0.03, -0.15, 0.66, 1.01, 14)], HEAD));
  body.add(meshOf([box(0.12, 0.05, 0.02, 0.4, 0.68, -0.87), box(0.12, 0.05, 0.02, -0.4, 0.68, -0.87)], TAIL));
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.12), plateMat());
  plate.position.set(0, 0.6, -0.88);
  plate.rotation.y = Math.PI;
  body.add(plate);
  // manillar: gira con las ruedas de delante
  const steer = new THREE.Group();
  steer.position.set(0, 0.86, 0.42);
  steer.add(meshOf([tube([0, 0, 0], [0, 0.16, -0.06], 0.025), tube([0, 0.16, -0.06], [0.37, 0.18, -0.1], 0.014), tube([0, 0.16, -0.06], [-0.37, 0.18, -0.1], 0.014)], METAL));
  steer.add(meshOf([cylX(0.02, 0.11, 0.33, 0.18, -0.1, 8), cylX(0.02, 0.11, -0.33, 0.18, -0.1, 8)], BLACK));
  body.add(steer);
  // las dos ruedas de delante y el manillar giran a la vez
  const fl = wheels[0], fr = wheels[1];
  for (const wp of [fl, fr]) {
    const own = wp.rotation;
    wp.rotation = {
      set x(v) { own.x = v; },
      get x() { return own.x; },
      set y(v) { own.y = v; steer.rotation.y = v * 0.8; },
      get y() { return own.y; },
    };
  }
  return {
    wheels, lights,
    dims: { width: 1.18, length: 2.02, roofY: 1.05, belt: 0.82, wheelR: R, wheelBase: 1.18, wheelZ: [0.6, -0.58], zf: 1.02, zr: -1.0 },
    seat: { y: 0.9, z: -0.2, lean: 0.12, legs: 1.15, knees: 1.45, arms: 0.95, elbows: 0.3, spread: 0.32 },
  };
}

// ── el piloto del tráfico: una persona cualquiera con casco ──
const SKINS = [0xf1d3b8, 0xe8c4a2, 0xd9a882, 0xc28a62, 0x8d5a3b];
const TOPS = [0x22262c, 0x2c4f86, 0xd8271c, 0x6b6f75, 0xe8e4da, 0x2f5a3a, 0xc8a27a];
const HELMETS = [0x111214, 0xf2f2f2, 0xd8271c, 0x2c5cc5, 0xf2c500, 0x6b6f75];
const pickOf = (a) => a[Math.floor(Math.random() * a.length)];

/** casco: se pone en la cabeza (hueso head) de un muñeco de humanModel.js */
export function makeHelmet(color = pickOf(HELMETS)) {
  const g = new THREE.Group();
  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.15, 18, 12).scale(1, 1.02, 1.12), mat(color, 0.25, 0.25));
  const visor = new THREE.Mesh(new THREE.SphereGeometry(0.152, 18, 8, -1.05, 2.1, 1.05, 0.62).scale(1, 1.02, 1.12), mat(0x0d1014, 0.08, 0.6));
  shell.position.y = visor.position.y = 0.13;
  shell.position.z = visor.position.z = 0.01;
  visor.rotation.y = 0;
  g.add(shell, visor);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.name = 'casco';
  return g;
}

/** la postura de ir montado: piernas a los estribos, manos al manillar y algo echado hacia delante */
export function ridePose(p, seat) {
  p.legL.rotation.set(-seat.legs, 0, -seat.spread);
  p.legR.rotation.set(-seat.legs, 0, seat.spread);
  p.kneeL.rotation.set(seat.knees, 0, 0);
  p.kneeR.rotation.set(seat.knees, 0, 0);
  p.spine.rotation.set(seat.lean, 0, 0);
  p.armL.rotation.set(-seat.arms, 0, -0.22);
  p.armR.rotation.set(-seat.arms, 0, 0.22);
  if (p.elbowL) p.elbowL.rotation.set(-seat.elbows, 0, 0);
  if (p.elbowR) p.elbowR.rotation.set(-seat.elbows, 0, 0);
}

function trafficRider(body, seat) {
  const p = buildHuman({
    sex: Math.random() < 0.8 ? 'm' : 'f', skin: pickOf(SKINS), top: pickOf(TOPS), topStyle: Math.random() < 0.5 ? 'jacket' : 'long',
    bottom: Math.random() < 0.6 ? 0x2c3440 : 0x1c1c1e, bottomStyle: 'pants', shoes: 0x1e1e20, hairStyle: 'short', height: 1.75, detail: 0,
  });
  ridePose(p, seat);
  p.head.add(makeHelmet());
  p.group.position.set(0, seat.y - 0.93, seat.z);
  body.add(p.group);
  return p;
}

/**
 * monta una moto o un quad. kind: 'moto' | 'quad'. rider: con piloto (tráfico).
 * Devuelve lo mismo que makeCar (carModels.js).
 */
export function makeBike(kind, color, { rider = false } = {}) {
  const group = new THREE.Group();
  const body = new THREE.Group();
  group.add(body);
  const paint = paintOf(color);
  const B = kind === 'quad' ? buildQuad(body, paint) : buildMoto(body, paint);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(B.dims.width + 0.35, B.dims.length + 0.3), SHADOW);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.012;
  shadow.renderOrder = 1;
  group.add(shadow);
  // aparcada, la moto se apoya en la pata de cabra
  if (kind === 'moto') body.rotation.z = 0.12;
  const ud = group.userData;
  ud.bike = B.seat;          // main.js: la postura y el sitio del que va encima
  ud.body = body;
  ud.paint = paint;
  if (rider) ud.rider = trafficRider(body, B.seat);
  ud.setLights = (night) => {
    for (const m of B.lights.head) m.emissiveIntensity = night * 2.9;
    for (const m of B.lights.tail) m.emissiveIntensity = night * 2.05;
  };
  return { group, body, wheels: B.wheels, headlights: B.lights.head, taillights: B.lights.tail, dims: B.dims, model: kind, brand: false };
}
