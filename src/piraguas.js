import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { buildHuman } from './humanModel.js';
import { waterAt, terrainY, terrainGrid } from './terrain.js';
import { nivelCharco, fondoCharco, estadoMarea } from './marea.js';

/**
 * Los chavales de las piraguas del Charco de San Ginés (foto de José Manuel desde el paseo de los
 * restaurantes, con la marea baja): una fila de piraguas que sigue a la del monitor por la lámina del
 * Charco sorteando los barquillos, y un par de chavales sueltos remando a su aire. Van sentados con las
 * piernas estiradas, chaleco salvavidas y el remo de dos palas, y los brazos reman.
 * En el paseo, junto al muro, el grupo que se prepara con las piraguas en el suelo: con ellos se habla
 * con T (buildPiraguasOrilla, en la segunda fase, porque van con los locales).
 * Las del agua se mueven con el Charco: buildPiraguas engancha su paso al update de charco.js, que
 * main.js ya llama en cada fotograma. Suben y bajan con la marea (marea.js): con la marea vacía solo
 * reman en la charca del centro, y la que se queda en el fango va hasta el agua arrastrando, despacio.
 */

const PAVE_Y = 0.16;           // el paseo
const KAYAK_L = 3.2, SPACING = 4.6, SPEED = 1.25, TURN = 0.7;
// por dónde buscan sitio: la lámina grande del Charco, al oeste del paseo que lo cruza
const BOX = { x0: 375, x1: 556, z0: 108, z1: 245 };
// la orilla de la foto: el paseo de los restaurantes, un poco al oeste de la rampa
const ORILLA_X = 516;
const HULLS = [0xf2f2ee, 0xd8262a, 0xf2f2ee, 0xf2c200, 0x2a6fd6, 0xf2f2ee, 0xe8742a];
const VESTS = [0xf06a1a, 0xe8262a, 0xf2c200, 0xf06a1a, 0x2a6fd6, 0xe8262a];
// los chavales (niños y niñas) y el monitor
const NINOS = [
  { sex: 'm', skin: 0xd9a882, hair: 0x2a1d14, hairStyle: 'short', top: 0x2b6cb0, bottom: 0x1f2a3a, height: 1.42 },
  { sex: 'f', skin: 0xe8c4a2, hair: 0x5a3a22, hairStyle: 'ponytail', top: 0xf2f2f0, bottom: 0x2a2a2e, height: 1.46 },
  { sex: 'm', skin: 0x9a6844, hair: 0x15110e, hairStyle: 'short', top: 0x3a8a4a, bottom: 0x22252a, height: 1.5 },
  { sex: 'f', skin: 0xc28a62, hair: 0x1e1712, hairStyle: 'bun', top: 0xe0b520, bottom: 0x1d2b44, height: 1.38 },
  { sex: 'm', skin: 0xf1d3b8, hair: 0xb07a3a, hairStyle: 'short', top: 0xd94a2a, bottom: 0x2b2b30, height: 1.44 },
  { sex: 'f', skin: 0xd9a882, hair: 0x2a1d14, hairStyle: 'ponytail', top: 0x7a6a9a, bottom: 0x1f2a3a, height: 1.48 },
  { sex: 'm', skin: 0xc8916c, hair: 0x37302b, hairStyle: 'short', top: 0x1d6b6e, bottom: 0x2b2b30, height: 1.4 },
].map(l => ({ eyes: 0x3a2616, topStyle: 'tshirt', bottomStyle: 'pants', shoes: 0x2a2c30, shoeStyle: 'shoe', build: 0.9, ...l }));
const MONITOR = {
  sex: 'm', skin: 0xb07a52, hair: 0x2a1d14, hairStyle: 'short', beard: true, eyes: 0x3a2616, top: 0xd8262a, topStyle: 'tshirt',
  bottom: 0x1f2a3a, bottomStyle: 'pants', shoes: 0x2a2c30, shoeStyle: 'shoe', cap: true, capColor: 0xd8262a, height: 1.78, build: 1.1,
};

/** chaleco salvavidas: cerrado, grueso, con el cuello */
function chaleco(parts, build, hex) {
  const mat = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.75 });
  const sx = 0.2 * build, sz = 0.16 * build;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.05, 0.46, 18), mat);
  body.scale.set(sx, 1, sz);
  body.position.y = 0.03;
  parts.spine.add(body);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.09 * build, 0.035, 6, 14), mat);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.3;
  parts.spine.add(collar);
}

/** sentado en la piragua: piernas estiradas hacia delante, el cuerpo un poco echado y los brazos al remo */
function sentado(h) {
  h.legL?.rotation.set(-1.45, 0, -0.12);
  h.legR?.rotation.set(-1.45, 0, 0.12);
  h.kneeL?.rotation.set(0.2, 0, 0);
  h.kneeR?.rotation.set(0.2, 0, 0);
  h.spine?.rotation.set(0.12, 0, 0);
}
function brazos(h, f) {
  h.armL?.rotation.set(-1.05 - f * 0.25, 0, -0.32);
  h.armR?.rotation.set(-1.05 + f * 0.25, 0, 0.32);
  h.elbowL?.rotation.set(-0.55, 0, 0);
  h.elbowR?.rotation.set(-0.55, 0, 0);
}

/** la piragua: casco alargado, la bañera oscura y su brazola */
function kayakGeometry(hex) {
  const parts = [];
  const tint = (g, c) => {
    const geo = g.index ? g.toNonIndexed() : g;
    const col = new THREE.Color(c), n = geo.getAttribute('position').count, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) a.set([col.r, col.g, col.b], i * 3);
    geo.setAttribute('color', new THREE.BufferAttribute(a, 3));
    if (geo.getAttribute('uv')) geo.deleteAttribute('uv');
    parts.push(geo);
  };
  const hull = new THREE.SphereGeometry(1, 20, 10);
  hull.scale(0.31, 0.17, KAYAK_L / 2);
  tint(hull, hex);
  const pit = new THREE.CylinderGeometry(0.2, 0.2, 0.02, 16);
  pit.scale(1, 1, 1.9);
  pit.translate(0, 0.165, -0.05);
  tint(pit, 0x1b1c1e);
  const rim = new THREE.TorusGeometry(0.21, 0.025, 6, 18);
  rim.rotateX(Math.PI / 2);
  rim.scale(1, 1, 1.9);
  rim.translate(0, 0.18, -0.05);
  tint(rim, 0x2a2c30);
  return mergeGeometries(parts, false);
}

/** el remo de dos palas, en su pivote (gira para meter una pala y luego la otra) */
function remo(hex) {
  const g = new THREE.Group();
  const dark = new THREE.MeshStandardMaterial({ color: 0x2a2c30, roughness: 0.5 });
  const blade = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.5 });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 2.1, 6), dark);
  shaft.rotation.z = Math.PI / 2;
  g.add(shaft);
  for (const s of [-1, 1]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.17), blade);
    b.position.x = s * 1.1;
    g.add(b);
  }
  return g;
}

/** materiales de la gente que flota (a nivel del agua, como los barquillos): copias, sin tocar los de los peatones */
function aNivel(root, cache) {
  root.traverse((o) => {
    if (!o.isMesh) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    const out = mats.map((m) => {
      if (!cache.has(m)) {
        const c = m.clone();
        if (Object.prototype.hasOwnProperty.call(m, 'onBeforeCompile')) c.onBeforeCompile = m.onBeforeCompile;
        if (Object.prototype.hasOwnProperty.call(m, 'customProgramCacheKey')) c.customProgramCacheKey = m.customProgramCacheKey;
        c.userData = { ...c.userData, terrain: 'level' };
        cache.set(m, c);
      }
      return cache.get(m);
    });
    o.material = Array.isArray(o.material) ? out : out[0];
  });
}

/** una piragua con su remero: el grupo mira hacia +z, el agua en y = 0 */
function piragua(look, hullHex, vestHex, geoCache, matCache) {
  const group = new THREE.Group();
  if (!geoCache.has(hullHex)) geoCache.set(hullHex, kayakGeometry(hullHex));
  const kayak = new THREE.Mesh(geoCache.get(hullHex), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.45, userData: { terrain: 'level' } }));
  kayak.castShadow = true;
  group.add(kayak);
  const h = buildHuman(look);
  chaleco(h, look.build, vestHex);
  sentado(h);
  brazos(h, 0);
  const hip = 0.93 * look.height / 1.78;
  h.group.position.set(0, 0.12 - hip, -0.08);
  group.add(h.group);
  aNivel(h.group, matCache);
  const paddle = remo(hullHex === 0xf2f2ee ? 0xd8262a : 0xf2f2ee);
  paddle.position.set(0, 0.12 + 0.4 * look.height / 1.45, 0.32);
  aNivel(paddle, matCache);
  group.add(paddle);
  return { group, human: h, paddle, phase: Math.random() * 6 };
}

/** ¿queda agua para remar en (x, z)? (con la marea vacía, solo en la charca del centro) */
const hondo = (x, z) => fondoCharco(x, z) < nivelCharco() - 0.3;

/** ¿agua libre alrededor? (y lejos de los barquillos); fondo = que además cubra para remar */
function libre(x, z, r, boats, rb, fondo = true) {
  if (!waterAt(x, z) || (fondo && !hondo(x, z))) return false;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    if (!waterAt(x + Math.cos(a) * r, z + Math.sin(a) * r)) return false;
  }
  return boats.every(b => Math.hypot(b.x - x, b.z - z) > rb);
}

/** el camino hasta el destino; si sale del fango (varado), solo se mira que no haya muro ni barquillos */
function camino(ax, az, bx, bz, boats, fondo = true) {
  const L = Math.hypot(bx - ax, bz - az), n = Math.ceil(L / 3);
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    if (!libre(ax + (bx - ax) * t, az + (bz - az) * t, 5, boats, 3.4, fondo)) return false;
  }
  return true;
}

/** el que va delante (el monitor o un chaval suelto): de un sitio libre a otro, girando poco a poco */
function remero(x, z, boats, rnd) {
  const p = { x, z, heading: rnd() * Math.PI * 2, target: null, trail: [[x, z]], seco: false };
  const pick = () => {
    // varado en el fango, se busca más lejos (la charca del centro)
    const R = p.seco ? 220 : 110;
    for (let k = 0; k < 40; k++) {
      const tx = Math.max(BOX.x0, Math.min(BOX.x1, p.x + (rnd() - 0.5) * R));
      const tz = Math.max(BOX.z0, Math.min(BOX.z1, p.z + (rnd() - 0.5) * R));
      if (Math.hypot(tx - p.x, tz - p.z) < 15) continue;
      if (libre(tx, tz, 7, boats, 5) && camino(p.x, p.z, tx, tz, boats, !p.seco)) return [tx, tz];
    }
    return null;
  };
  p.step = (dt) => {
    p.seco = !hondo(p.x, p.z);
    // si no encuentra sitio, vuelve a mirar al rato (no en cada fotograma)
    p.espera = Math.max(0, (p.espera || 0) - dt);
    if (!p.target && !p.espera) {
      p.target = pick();
      if (!p.target) p.espera = 1.5;
    }
    // sin sitio adonde ir: a flote, da vueltas despacio; en el fango, quieto hasta que vuelva el agua
    if (!p.target) { if (!p.seco) p.heading += TURN * dt; return; }
    const dx = p.target[0] - p.x, dz = p.target[1] - p.z, d = Math.hypot(dx, dz);
    if (d < 3) { p.target = null; return; }
    let diff = Math.atan2(dx, dz) - p.heading;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    p.heading += Math.max(-TURN * dt, Math.min(TURN * dt, diff));
    const hx = Math.sin(p.heading), hz = Math.cos(p.heading);
    // si delante se acaba el agua o hay un barquillo, otro destino
    if (!libre(p.x + hx * 4, p.z + hz * 4, 2, boats, 2.6, !p.seco)) { p.target = null; p.heading += TURN * dt * 3; return; }
    // por el fango, arrastrando la piragua hasta el agua: despacio
    const v = SPEED * (Math.abs(diff) > 0.6 ? 0.5 : 1) * (p.seco ? 0.35 : 1);
    p.x += hx * v * dt;
    p.z += hz * v * dt;
    const [lx, lz] = p.trail[p.trail.length - 1];
    if (Math.hypot(p.x - lx, p.z - lz) > 0.3) {
      p.trail.push([p.x, p.z]);
      if (p.trail.length > 120) p.trail.shift();
    }
  };
  return p;
}

/** un punto a cierta distancia por detrás en la estela del que va delante (para la fila) */
function enEstela(trail, back, x, z) {
  let d = 0, px = x, pz = z;
  for (let i = trail.length - 1; i >= 0; i--) {
    const [qx, qz] = trail[i], seg = Math.hypot(px - qx, pz - qz);
    if (d + seg >= back) {
      const t = (back - d) / (seg || 1);
      const fx = px + (qx - px) * t, fz = pz + (qz - pz) * t;
      return [fx, fz, Math.atan2(px - qx, pz - qz)];
    }
    d += seg;
    px = qx; pz = qz;
  }
  return null;
}

/**
 * las piraguas del agua: la fila del monitor y los sueltos. charco = lo que devuelve buildCharco
 * (sus barquillos y su update, que main.js ya llama en cada fotograma)
 */
export function buildPiraguas(scene, { charco = null, touch = false } = {}) {
  if (!charco?.update) return null;
  const boats = charco.boats || [];
  let seed = 4242;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  // donde arrancan: agua libre cerca de la orilla de los restaurantes
  const start = (x, z) => {
    for (let k = 0; k < 200; k++) {
      const tx = x + (rnd() - 0.5) * 50, tz = z + rnd() * 50;
      if (libre(tx, tz, 7, boats, 5)) return [tx, tz];
    }
    return null;
  };
  const s0 = start(ORILLA_X, 125), s1 = start(450, 150), s2 = start(500, 200);
  if (!s0) return null;
  const group = new THREE.Group();
  group.name = 'piraguasCharco';
  const geoCache = new Map(), matCache = new Map();
  const fleet = [];
  // la fila: el monitor delante y los chavales detrás, en su estela
  const lead = remero(...s0, boats, rnd);
  const nFila = touch ? 2 : 4;
  fleet.push({ ...piragua(MONITOR, 0xd8262a, 0xd8262a, geoCache, matCache), lead });
  for (let i = 0; i < nFila; i++) fleet.push({ ...piragua(NINOS[i], HULLS[(i + 2) % HULLS.length], VESTS[i], geoCache, matCache), follow: lead, back: SPACING * (i + 1) });
  // y dos sueltos remando a su aire (en el móvil, ninguno)
  if (!touch) {
    for (const [s, i] of [[s1, 5], [s2, 6]]) if (s) fleet.push({ ...piragua(NINOS[i], HULLS[i % HULLS.length], VESTS[i % VESTS.length], geoCache, matCache), lead: remero(...s, boats, rnd) });
  }
  // un rato de remo antes de empezar, para que la fila salga ya estirada y los sueltos repartidos
  for (const f of fleet) if (f.lead) for (let i = 0; i < (f.lead === lead ? 300 : 60); i++) f.lead.step(0.1);
  for (const f of fleet) {
    const p = f.lead || enEstela(f.follow.trail, f.back, f.follow.x, f.follow.z) || [lead.x, lead.z];
    f.group.position.set(p.x ?? p[0], nivelCharco(), p.z ?? p[1]);
    group.add(f.group);
  }
  scene.add(group);

  let last = null;
  const step = (t, px, pz) => {
    const dt = last == null ? 0 : Math.min(0.1, Math.max(0, t - last));
    last = t;
    const near = Math.hypot(px - 470, pz - 170) < 420;
    group.visible = near;
    if (!near || !dt) return;
    for (const f of fleet) if (f.lead) f.lead.step(dt);
    const agua = nivelCharco();
    for (const f of fleet) {
      let x, z, heading, moving = true;
      if (f.lead) ({ x, z, heading } = f.lead);
      else {
        const e = enEstela(f.follow.trail, f.back, f.follow.x, f.follow.z);
        if (!e) { moving = false; [x, z] = [f.group.position.x, f.group.position.z]; heading = f.group.rotation.y; }
        else [x, z, heading] = e;
      }
      // con la marea vacía, la que se queda sin agua va por el fango: sin remar y sin cabecear
      const apoyo = fondoCharco(x, z) + 0.1, seca = apoyo > agua;
      // el remo: una pala y luego la otra, y los brazos con él; la piragua cabecea un poco
      f.phase += dt * (moving && !seca ? 3.1 : 0.8);
      const s = Math.sin(f.phase);
      f.paddle.rotation.set(0, Math.cos(f.phase) * 0.28, s * 0.55);
      brazos(f.human, s);
      f.group.position.set(x, Math.max(agua + Math.sin(t * 1.3 + f.phase) * 0.02, apoyo), z);
      f.group.rotation.set(0, heading + (seca ? 0 : Math.sin(f.phase) * 0.03), seca ? 0 : Math.sin(t * 0.9 + f.phase) * 0.03);
    }
  };
  const up = charco.update;
  charco.update = function (t, px, pz) {
    up.call(this, t, px, pz);
    step(t, px, pz);
  };
  return { group, fleet };
}

/** lo que dicen los de la orilla */
function charlaChaval({ me, visits }) {
  if (visits === 0) {
    const m = estadoMarea();
    const hoy = m === 'vacía' ? 'Con la marea vacía solo queda agua en el centro del Charco, pero se rema igual.'
      : m === 'llena' ? 'Con la marea llena da gusto: se puede ir por todo el Charco.' : 'Hoy toca vuelta por el Charco.';
    return [
      { who: 'Chaval de las piraguas', text: '¡Ey! Somos de la escuela de piragüismo. ' + hoy },
      { who: me, text: m === 'vacía' ? '¿Y cómo llegáis hasta el agua?' : '¿Y con la marea baja?', player: true },
      { who: 'Chaval de las piraguas', text: '¡Pues a cargar la piragua por el fango hasta el agua! Luego remar es lo fácil.' },
    ];
  }
  if (visits === 1) return [{ who: 'Chaval de las piraguas', text: '¿Ves la fila de piraguas? Son los de mi grupo. El de rojo, delante, es el monitor.' }];
  return [{ who: 'Chaval de las piraguas', text: 'Lo difícil es pasar entre los barquillos sin rozar ninguno. ¡Eso es de nivel pro!' }];
}
function charlaMonitor({ me, visits }) {
  if (visits === 0) {
    return [
      { who: 'El monitor', text: 'Chalecos bien abrochados y en fila detrás de mí, que el Charco está lleno de barquillos.' },
      { who: me, text: '¿Puedo apuntarme algún día?', player: true },
      { who: 'El monitor', text: '¡Claro! Aquí rema gente de todas las edades. Ven una tarde y te dejamos una piragua.' },
    ];
  }
  if (visits === 1) return [{ who: 'El monitor', text: 'Con la marea alta se rema mejor, pero con la baja aprenden a llevar la piragua entre todos.' }];
  return [{
    who: 'El monitor',
    text: `Ahora la marea está ${estadoMarea()}. Se vacía del todo a las cuatro, de madrugada y por la tarde, y se llena a las diez, por la mañana y por la noche.`,
  }];
}

/**
 * cuánto queda el suelo que se ve por encima del relieve fino en cada punto (en el paseo del Charco):
 * la malla gruesa del suelo (terrain 'ground', cuadros de 15 m) va recta entre sus vértices y, en la rampa
 * del paseo hacia el agua, queda hasta 0,7 m más alta que el relieve que siguen la gente y las cosas
 * pequeñas. Sin esto, las piraguas del suelo no se veían y los chavales tenían los pies enterrados.
 * (También la usa localesCharco.js para la terraza del Leito de Proa.)
 */
export function sobreSuelo(scene, pts) {
  const out = pts.map(() => 0);
  const cell = terrainGrid()?.cell || 10;
  scene.updateMatrixWorld();
  scene.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || o.material?.userData?.terrain !== 'ground') return;
    const pos = o.geometry.getAttribute('position'), idx = o.geometry.index;
    if (!pos) return;
    // la altura de un vértice del suelo, como la sube la tarjeta gráfica (con lo que se baja en las hondonadas)
    const seg = o.material.userData.terrainSeg, sag = seg ? seg * seg * 0.325 : 0;
    const alto = (x, y, z) => {
      let h = terrainY(x, z);
      if (sag) {
        const lap = terrainY(x + cell, z) + terrainY(x - cell, z) + terrainY(x, z + cell) + terrainY(x, z - cell) - 4 * h;
        h -= Math.max(0, lap) / (cell * cell) * sag;
      }
      return y + h;
    };
    const v = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
    const n = idx ? idx.count : pos.count;
    // la caja de los puntos, pasada a las coordenadas de la malla (el suelo de la ciudad va girado): así se
    // descartan rápido los triángulos lejos de los puntos sin mover cada vértice
    const px0 = Math.min(...pts.map(p => p[0])), px1 = Math.max(...pts.map(p => p[0]));
    const pz0 = Math.min(...pts.map(p => p[1])), pz1 = Math.max(...pts.map(p => p[1]));
    const inv = new THREE.Matrix4().copy(o.matrixWorld).invert(), lb = new THREE.Box3(), q = new THREE.Vector3();
    for (const x of [px0, px1]) for (const z of [pz0, pz1]) for (const y of [-500, 500]) lb.expandByPoint(q.set(x, y, z).applyMatrix4(inv));
    const fuera = (a, b, c, lo, hi) => (a < lo && b < lo && c < lo) || (a > hi && b > hi && c > hi);
    for (let t = 0; t < n; t += 3) {
      const ia = idx ? idx.getX(t) : t, ib = idx ? idx.getX(t + 1) : t + 1, ic = idx ? idx.getX(t + 2) : t + 2;
      if (fuera(pos.getX(ia), pos.getX(ib), pos.getX(ic), lb.min.x, lb.max.x)) continue;
      if (fuera(pos.getY(ia), pos.getY(ib), pos.getY(ic), lb.min.y, lb.max.y)) continue;
      if (fuera(pos.getZ(ia), pos.getZ(ib), pos.getZ(ic), lb.min.z, lb.max.z)) continue;
      [ia, ib, ic].forEach((i, c) => v[c].fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld));
      const [A, B, C] = v;
      const minX = Math.min(A.x, B.x, C.x), maxX = Math.max(A.x, B.x, C.x), minZ = Math.min(A.z, B.z, C.z), maxZ = Math.max(A.z, B.z, C.z);
      pts.forEach(([x, z], k) => {
        if (x < minX || x > maxX || z < minZ || z > maxZ) return;
        const d = (B.z - C.z) * (A.x - C.x) + (C.x - B.x) * (A.z - C.z);
        if (Math.abs(d) < 1e-9) return;
        const l1 = ((B.z - C.z) * (x - C.x) + (C.x - B.x) * (z - C.z)) / d;
        const l2 = ((C.z - A.z) * (x - C.x) + (A.x - C.x) * (z - C.z)) / d;
        const l3 = 1 - l1 - l2;
        if (l1 < -1e-6 || l2 < -1e-6 || l3 < -1e-6) return;
        const surf = l1 * alto(A.x, A.y, A.z) + l2 * alto(B.x, B.y, B.z) + l3 * alto(C.x, C.y, C.z);
        out[k] = Math.max(out[k], surf - terrainY(x, z));
      });
    }
  });
  return out;
}

/**
 * el grupo de la orilla (segunda fase): en el paseo, junto al muro del Charco, dos chavales y el
 * monitor con dos piraguas en el suelo; uno lleva el remo. Se habla con ellos con T.
 */
export function buildPiraguasOrilla(scene, locales) {
  // el borde del agua bajando desde el paseo
  let edge = null;
  for (let z = 96; z < 135; z += 0.5) if (waterAt(ORILLA_X, z)) { edge = z; break; }
  if (edge == null) return null;
  const zz = edge - 2.6, face = 0;   // mirando al agua (al sur)
  const group = new THREE.Group();
  group.name = 'piraguasOrilla';
  const geoCache = new Map();
  const kayaks = [[0, 0xf2f2ee], [-1.0, 0xd8262a]];
  const people = [
    [NINOS[0], -2.2, 0, 'Chaval de las piraguas', charlaChaval, VESTS[0], true],
    [NINOS[3], 0.4, -0.3, 'Chaval de las piraguas', charlaChaval, VESTS[3], false],
    [MONITOR, 3.6, -0.6, 'El monitor', charlaMonitor, 0xd8262a, false],
  ];
  // la altura del suelo que se ve en cada sitio (el paseo baja en rampa hacia el agua)
  const suelo = sobreSuelo(scene, [
    ...kayaks.map(([dz]) => [ORILLA_X - 6.4, zz - 0.3 + dz]),
    ...people.map(([, dx, dz]) => [ORILLA_X + dx, zz + dz]),
  ]).map(h => Math.max(PAVE_Y, h));
  // las dos piraguas en el suelo del paseo, una al lado de otra, a la izquierda del grupo
  for (const [n, [dz, hex]] of kayaks.entries()) {
    if (!geoCache.has(hex)) geoCache.set(hex, kayakGeometry(hex));
    const k = new THREE.Mesh(geoCache.get(hex), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.45 }));
    k.position.set(ORILLA_X - 6.4, suelo[n] + 0.13, zz - 0.3 + dz);
    k.rotation.y = Math.PI / 2;
    k.castShadow = true;
    // pequeñas y a ras de suelo: que no las descarte el recorte de lo que no se ve (con el relieve se equivoca)
    k.frustumCulled = false;
    group.add(k);
  }
  scene.add(group);
  const npcs = people.map(([look, dx, dz, name, talk, vest, paddle], n) => locales.addStreetNpc({
    name,
    look,
    at: [ORILLA_X + dx, zz + dz],
    face: face + dx * 0.08,
    pose: 'stand',
    // los pies en el suelo que se ve (addStreetNpc los pone a 0,22 m si no)
    y: Math.max(0, suelo[kayaks.length + n] - 0.21),
    dress: (parts) => {
      chaleco(parts, look.build, vest);
      if (paddle) {
        // el remo de pie, al lado
        const r = remo(0xd8262a);
        r.rotation.z = Math.PI / 2;
        r.position.set(0.34, 1.05, 0.08);
        parts.group.add(r);
      }
    },
    talk,
  }));
  return { group, npcs };
}
