import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { buildHuman } from './humanModel.js';

/**
 * La playa del Reducto con vida: arena mojada en la orilla, filas de
 * sombrillas con hamacas y toallas, gente tomando el sol, bañistas con el agua
 * por la cintura, nadadores mar adentro y gente paseando por la orilla.
 * Solo se ve (y se anima) cuando andas cerca.
 */

const SAND_Y = 0.135;
const WATER_Y = 0.15;
const SKIN = [0xf1d3b8, 0xe8c4a2, 0xd9a882, 0xc28a62, 0x9a6844, 0x6e4a32];
const HAIR = [0x1e1712, 0x3a2a1c, 0x5a4028, 0x8a6a3a, 0xc8a86a, 0xb04a2a];
const SWIM = [0xd8271c, 0x2a6db5, 0xf2c500, 0x1c1c1e, 0x0d5c63, 0xe2661b, 0xe8b4c8, 0x3e8a4f, 0xf2f2f2, 0x6a3a8a, 0x71a3c4];
const CANVAS = [0xd94f3d, 0x2a6db5, 0xe0b520, 0x3e8a4f, 0xf2f2f2, 0xe2661b, 0x0d5c63];
const TOWEL = [0xd94f3d, 0x2a6db5, 0xe0b520, 0x3e8a4f, 0xe8b4c8, 0xf2f2f2, 0x71a3c4, 0xe2661b];

function pointInPoly(poly, x, z) {
  let inn = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inn = !inn;
  }
  return inn;
}

function rngSeed(s) { return () => (s = (s * 16807) % 2147483647) / 2147483647; }

/** gente de playa: bañador, bikini o bañador entero, descalzos */
function beachLook(rnd) {
  const pick = (a) => a[Math.floor(rnd() * a.length) % a.length];
  const female = rnd() < 0.5;
  const kid = rnd() < 0.12;
  const look = {
    sex: female ? 'f' : 'm', skin: pick(SKIN), hair: pick(HAIR), shoeStyle: 'barefoot',
    build: 0.88 + rnd() * 0.3, height: kid ? 1.15 + rnd() * 0.25 : (female ? 1.56 + rnd() * 0.18 : 1.68 + rnd() * 0.2),
    bottomStyle: 'swim', bottom: pick(SWIM), top: pick(SWIM), shades: rnd() < 0.35,
  };
  if (female) {
    look.hairStyle = pick(['long', 'ponytail', 'bun', 'short', 'curly']);
    look.topStyle = rnd() < 0.7 ? 'bikini' : 'swimsuit';
    if (look.topStyle === 'swimsuit') look.bottom = look.top;
  } else {
    look.hairStyle = pick(['short', 'surf', 'rapado', 'calvo', 'curly']);
    look.topStyle = 'none';
    look.cap = rnd() < 0.15;
    look.capColor = pick(SWIM);
  }
  return look;
}

/** bordes del polígono de playa que dan al agua y el resto (el paseo) */
function splitShore(poly, inWater) {
  const shore = [], land = [];
  for (let i = 0; i < poly.length - 1; i++) {
    const [ax, az] = poly[i], [bx, bz] = poly[i + 1];
    const L = Math.hypot(bx - ax, bz - az);
    if (L < 0.1) continue;
    const mx = (ax + bx) / 2, mz = (az + bz) / 2, nx = -(bz - az) / L, nz = (bx - ax) / L;
    const wetA = inWater(mx + nx * 3, mz + nz * 3), wetB = inWater(mx - nx * 3, mz - nz * 3);
    if (wetA !== wetB) shore.push({ ax, az, bx, bz, L, ox: wetA ? nx : -nx, oz: wetA ? nz : -nz });
    else land.push({ ax, az, bx, bz, L });
  }
  return { shore, land };
}

/** punto a una distancia a lo largo de una lista de tramos */
function along(segs, d) {
  let acc = 0;
  for (const s of segs) {
    if (d <= acc + s.L) {
      const t = (d - acc) / s.L;
      return { x: s.ax + (s.bx - s.ax) * t, z: s.az + (s.bz - s.az) * t, s };
    }
    acc += s.L;
  }
  const s = segs[segs.length - 1];
  return { x: s.bx, z: s.bz, s };
}

function umbrella(group, x, z, color, mats) {
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.2, 6), mats.pole);
  pole.position.set(x, SAND_Y + 1.1, z);
  // tela en gajos: cono bajo y un remate
  const cloth = new THREE.Mesh(new THREE.ConeGeometry(1.25, 0.42, 8, 1, true), new THREE.MeshStandardMaterial({ color, roughness: 0.85, side: THREE.DoubleSide }));
  cloth.position.set(x, SAND_Y + 2.12, z);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), mats.pole);
  tip.position.set(x, SAND_Y + 2.36, z);
  for (const m of [pole, cloth]) m.castShadow = true;
  group.add(pole, cloth, tip);
}

function lounger(x, z, rot, color) {
  // hamaca de tumbona: lona inclinada en la cabecera sobre patas de aluminio
  const parts = [];
  const bed = new THREE.BoxGeometry(0.62, 0.05, 1.3);
  bed.translate(0, 0.32, 0.25);
  const back = new THREE.BoxGeometry(0.62, 0.05, 0.62);
  back.rotateX(-0.75);
  back.translate(0, 0.52, -0.62);
  parts.push(bed, back);
  const g = mergeGeometries(parts, false);
  g.rotateY(rot);
  g.translate(x, SAND_Y, z);
  const legs = new THREE.BoxGeometry(0.66, 0.3, 0.04);
  const l1 = legs.clone(); l1.translate(0, 0.15, 0.8); l1.rotateY(rot); l1.translate(x, SAND_Y, z);
  const l2 = legs.clone(); l2.translate(0, 0.15, -0.3); l2.rotateY(rot); l2.translate(x, SAND_Y, z);
  return { cloth: g, frame: [l1, l2], color };
}

export function buildBeach(scene, map, { few = false } = {}) {
  // en móvil, algo menos de gente (cada persona es una malla con piel)
  const N = few ? { sun: 18, bath: 14, swim: 4, walk: 6 } : { sun: 34, bath: 26, swim: 6, walk: 12 };
  const beach = map.beaches?.[0];
  if (!beach) return null;
  const sea = map.sea;
  const inWater = (x, z) => (sea && pointInPoly(sea.outer, x, z) && !sea.holes.some(h => pointInPoly(h, x, z)));
  const { shore, land } = splitShore(beach, inWater);
  if (!shore.length) return null;
  const rnd = rngSeed(2024);
  const group = new THREE.Group();
  group.name = 'playa';
  const mats = {
    pole: new THREE.MeshStandardMaterial({ color: 0xe8e2d4, roughness: 0.5, metalness: 0.3 }),
    frame: new THREE.MeshStandardMaterial({ color: 0xd0d4d8, roughness: 0.4, metalness: 0.6 }),
    white: new THREE.MeshStandardMaterial({ color: 0xf2f0ea, roughness: 0.7 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x9a7448, roughness: 0.85 }),
  };

  // ── arena mojada: franja oscura y brillante a lo largo de la orilla ──
  const wet = [];
  for (const s of shore) {
    const n = Math.max(1, Math.round(s.L / 2));
    for (let k = 0; k < n; k++) {
      const t0 = k / n, t1 = (k + 1) / n;
      const x0 = s.ax + (s.bx - s.ax) * t0, z0 = s.az + (s.bz - s.az) * t0;
      const x1 = s.ax + (s.bx - s.ax) * t1, z1 = s.az + (s.bz - s.az) * t1;
      // de la orilla 5 m hacia dentro, con el borde interior ondulado
      const w0 = 4 + Math.sin(x0 * 0.21 + z0 * 0.13) * 1.2, w1 = 4 + Math.sin(x1 * 0.21 + z1 * 0.13) * 1.2;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute([
        x0, SAND_Y + 0.004, z0, x1, SAND_Y + 0.004, z1,
        x0 - s.ox * w0, SAND_Y + 0.004, z0 - s.oz * w0, x1 - s.ox * w1, SAND_Y + 0.004, z1 - s.oz * w1,
      ], 3));
      g.setAttribute('wet', new THREE.Float32BufferAttribute([1, 1, 0, 0], 1));
      g.setIndex([0, 2, 1, 1, 2, 3]);
      wet.push(g);
    }
  }
  if (wet.length) {
    const wg = mergeGeometries(wet, false);
    wg.computeVertexNormals();
    // 'wet' hace de opacidad: oscura en el agua, se funde hacia la arena seca
    const wm = new THREE.MeshStandardMaterial({ color: 0x6a5a42, roughness: 0.6, metalness: 0.0, transparent: true, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
    wm.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float wet;\nvarying float vWet;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvWet = wet;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vWet;')
        .replace('#include <dithering_fragment>', '#include <dithering_fragment>\ngl_FragColor.a *= 0.12 + 0.6 * vWet;');
    };
    const wmesh = new THREE.Mesh(wg, wm);
    wmesh.receiveShadow = true;
    group.add(wmesh);
  }

  // ── a lo largo de la playa: d = distancia sobre la orilla; hacia dentro, la arena seca ──
  const total = shore.reduce((a, s) => a + s.L, 0);
  const depthAt = (x, z, ox, oz) => {
    // cuánta arena hay hacia tierra desde la orilla (hasta salir del polígono)
    let d = 0;
    while (d < 90 && pointInPoly(beach, x - ox * (d + 1), z - oz * (d + 1))) d += 1;
    return d;
  };

  // sombrillas, toallas, hamacas y gente tomando el sol
  const lounge = [];
  const sunbathers = [];
  const towels = [];
  const humans = [];
  for (let d = 10; d < total - 8; d += 7 + rnd() * 5) {
    const p = along(shore, d);
    const depth = depthAt(p.x, p.z, p.s.ox, p.s.oz);
    if (depth < 18) continue;
    for (const frac of [0.38, 0.6]) {
      if (rnd() < 0.25) continue;
      const dd = depth * frac + (rnd() - 0.5) * 3;
      const ux = p.x - p.s.ox * dd + (rnd() - 0.5) * 2, uz = p.z - p.s.oz * dd + (rnd() - 0.5) * 2;
      if (!pointInPoly(beach, ux, uz)) continue;
      umbrella(group, ux, uz, CANVAS[Math.floor(rnd() * CANVAS.length)], mats);
      // mirando al mar
      const face = Math.atan2(p.s.ox, p.s.oz);
      const kind = rnd();
      for (const side of [-1, 1]) {
        if (side === 1 && rnd() < 0.35) continue;
        const sx = ux + Math.cos(face) * side * 0.85, sz = uz - Math.sin(face) * side * 0.85;
        // respaldo hacia tierra; la gente con los pies hacia el mar
        if (kind < 0.45) {
          lounge.push(lounger(sx, sz, face, CANVAS[Math.floor(rnd() * CANVAS.length)]));
          if (rnd() < 0.6) sunbathers.push({ x: sx, z: sz, face, y: SAND_Y + 0.36, tilt: 0.25, bed: true });
        } else {
          towels.push({ x: sx, z: sz, rot: face + (rnd() - 0.5) * 0.3, c: TOWEL[Math.floor(rnd() * TOWEL.length)] });
          if (rnd() < 0.7) sunbathers.push({ x: sx, z: sz, face, y: SAND_Y + 0.02, tilt: 0 });
        }
      }
    }
  }
  // tumbonas y toallas en dos mallas
  if (lounge.length) {
    const byColor = new Map();
    const frames = [];
    for (const l of lounge) {
      if (!byColor.has(l.color)) byColor.set(l.color, []);
      byColor.get(l.color).push(l.cloth);
      frames.push(...l.frame);
    }
    for (const [c, gs] of byColor) {
      const m = new THREE.Mesh(mergeGeometries(gs, false), new THREE.MeshStandardMaterial({ color: c, roughness: 0.85 }));
      m.castShadow = true; m.receiveShadow = true;
      group.add(m);
    }
    const fm = new THREE.Mesh(mergeGeometries(frames, false), mats.frame);
    fm.castShadow = true;
    group.add(fm);
  }
  if (towels.length) {
    const byColor = new Map();
    for (const t of towels) {
      const g = new THREE.BoxGeometry(0.75, 0.012, 1.75);
      g.rotateY(t.rot);
      g.translate(t.x, SAND_Y + 0.01, t.z);
      if (!byColor.has(t.c)) byColor.set(t.c, []);
      byColor.get(t.c).push(g);
    }
    for (const [c, gs] of byColor) {
      const m = new THREE.Mesh(mergeGeometries(gs, false), new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 }));
      m.receiveShadow = true;
      group.add(m);
    }
  }
  for (const s of sunbathers.slice(0, N.sun)) {
    const h = buildHuman(beachLook(rnd));
    h.group.rotation.order = 'YXZ';
    // tumbados boca arriba (o boca abajo en la toalla), cabeza hacia la sombrilla
    const prone = !s.bed && rnd() < 0.3;
    h.group.rotation.set(prone ? Math.PI / 2 : -Math.PI / 2 + s.tilt, prone ? s.face + Math.PI : s.face, 0);
    // los pies (el origen del muñeco) hacia el mar
    const off = 0.85;
    h.group.position.set(s.x + Math.sin(s.face) * off, s.y + 0.11, s.z + Math.cos(s.face) * off);
    h.armL.rotation.z = -0.25; h.armR.rotation.z = 0.25;
    group.add(h.group);
    humans.push({ h, kind: 'sun', phase: rnd() * 10 });
  }

  // ── socorrista, duchas y chiringuito ──
  {
    const p = along(shore, total * 0.42);
    const depth = depthAt(p.x, p.z, p.s.ox, p.s.oz);
    const tx = p.x - p.s.ox * Math.min(12, depth * 0.3), tz = p.z - p.s.oz * Math.min(12, depth * 0.3);
    const tower = new THREE.Group();
    const legGeo = new THREE.BoxGeometry(0.12, 2.2, 0.12);
    for (const [lx, lz] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) {
      const l = new THREE.Mesh(legGeo, mats.white); l.position.set(lx, 1.1, lz); tower.add(l);
    }
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 1.8), mats.white);
    cab.position.y = 2.8;
    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.12, 2.1), new THREE.MeshStandardMaterial({ color: 0xd8271c, roughness: 0.7 }));
    roof.position.y = 3.5;
    const cross = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.02), new THREE.MeshBasicMaterial({ color: 0xd8271c }));
    cross.position.set(0, 2.9, 0.91);
    const cross2 = cross.clone(); cross2.scale.set(0.28, 3.6, 1);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.45), new THREE.MeshStandardMaterial({ color: 0x2fbf4f, side: THREE.DoubleSide }));
    flag.position.set(0.4, 4.7, 0);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.6, 6), mats.pole);
    pole.position.set(0, 4.3, 0);
    tower.add(cab, roof, cross, cross2, flag, pole);
    tower.position.set(tx, SAND_Y, tz);
    tower.rotation.y = Math.atan2(p.s.ox, p.s.oz);
    tower.traverse(o => { if (o.isMesh) o.castShadow = true; });
    group.add(tower);
    // el socorrista, de pie junto a la torre mirando al mar
    const lg = buildHuman({ sex: 'm', skin: 0xc28a62, hair: 0x1e1712, hairStyle: 'short', topStyle: 'tank', top: 0xd8271c, bottomStyle: 'swim', bottom: 0xd8271c, shoeStyle: 'barefoot', cap: true, capColor: 0xd8271c, shades: true });
    lg.group.position.set(tx + p.s.ox * 1.8, SAND_Y, tz + p.s.oz * 1.8);
    lg.group.rotation.y = tower.rotation.y;
    lg.armL.rotation.z = -0.35; lg.armR.rotation.z = 0.35;
    group.add(lg.group);
  }
  // duchas junto al paseo
  for (const f of [0.2, 0.55, 0.85]) {
    const p = along(land.length ? land : shore, (land.length ? land.reduce((a, s) => a + s.L, 0) : total) * f);
    const sh = new THREE.Group();
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.3, 0.16), mats.frame);
    post.position.y = 1.15;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.06), mats.frame);
    arm.position.set(0.22, 2.25, 0);
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 1.2), mats.wood);
    base.position.y = 0.04;
    sh.add(post, arm, base);
    sh.position.set(p.x, SAND_Y, p.z + 3);
    group.add(sh);
  }
  // chiringuito con su terraza, en la arena pegado al paseo
  {
    const L = land.length ? land : shore;
    const p = along(L, L.reduce((a, s) => a + s.L, 0) * 0.62);
    // un poco hacia la arena
    const q = along(shore, total * 0.55);
    const vx = q.x - p.x, vz = q.z - p.z, vl = Math.hypot(vx, vz) || 1;
    const bx = p.x + (vx / vl) * 8, bz = p.z + (vz / vl) * 8;
    const bar = new THREE.Group();
    const hut = new THREE.Mesh(new THREE.BoxGeometry(6, 2.6, 3.6), new THREE.MeshStandardMaterial({ color: 0xf2efe6, roughness: 0.85 }));
    hut.position.y = 1.3;
    const counter = new THREE.Mesh(new THREE.BoxGeometry(6.2, 1.1, 0.5), mats.wood);
    counter.position.set(0, 0.55, 2.0);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.25, 5.2), new THREE.MeshStandardMaterial({ color: 0x2a6db5, roughness: 0.7 }));
    roof.position.y = 2.75;
    const c = document.createElement('canvas');
    c.width = 512; c.height = 96;
    const x = c.getContext('2d');
    x.fillStyle = '#0d5c63'; x.fillRect(0, 0, 512, 96);
    x.fillStyle = '#f4c542'; x.font = 'italic 800 46px "Barlow Condensed", "Arial Narrow", Arial, sans-serif';
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('CHIRINGUITO EL REDUCTO', 256, 50);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.1), new THREE.MeshBasicMaterial({ map: tex }));
    sign.position.set(0, 3.4, 2.62);
    bar.add(hut, counter, roof, sign);
    // terraza: mesas con sombrilla pequeña
    for (let i = 0; i < 4; i++) {
      const tx = -3 + i * 2, tz = 4.6;
      const table = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 12), mats.white);
      table.position.set(tx, 0.74, tz);
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.72, 6), mats.frame);
      leg.position.set(tx, 0.36, tz);
      bar.add(table, leg);
      umbrella(bar, tx, tz, CANVAS[i % CANVAS.length], mats);
    }
    bar.position.set(bx, SAND_Y, bz);
    bar.rotation.y = Math.atan2(vx, vz);
    bar.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    group.add(bar);
  }

  // ── en el agua: bañistas de pie y nadadores ──
  for (let i = 0; i < N.bath; i++) {
    const p = along(shore, 12 + rnd() * (total - 24));
    const out = 4 + rnd() * 16;
    const x = p.x + p.s.ox * out + (rnd() - 0.5) * 4, z = p.z + p.s.oz * out + (rnd() - 0.5) * 4;
    if (!inWater(x, z)) continue;
    const h = buildHuman(beachLook(rnd));
    h.group.rotation.order = 'YXZ';
    h.group.rotation.y = rnd() * Math.PI * 2;
    // más hondo cuanto más lejos de la orilla
    const depth = Math.min(1.05, 0.35 + out * 0.04);
    h.group.position.set(x, WATER_Y - depth, z);
    group.add(h.group);
    humans.push({ h, kind: 'bath', x, z, base: WATER_Y - depth, phase: rnd() * 10 });
  }
  for (let i = 0; i < N.swim; i++) {
    const p = along(shore, 20 + rnd() * (total - 40));
    const out = 24 + rnd() * 26;
    const x = p.x + p.s.ox * out, z = p.z + p.s.oz * out;
    if (!inWater(x, z)) continue;
    const h = buildHuman(beachLook(rnd));
    h.group.rotation.order = 'YXZ';
    group.add(h.group);
    // nadan de lado a lado, paralelos a la orilla
    const ux = (p.s.bx - p.s.ax) / p.s.L, uz = (p.s.bz - p.s.az) / p.s.L;
    humans.push({ h, kind: 'swim', x, z, ux, uz, u: 0, span: 25 + rnd() * 30, dir: rnd() < 0.5 ? 1 : -1, phase: rnd() * 10 });
  }
  // paseando por la orilla
  for (let i = 0; i < N.walk; i++) {
    const h = buildHuman(beachLook(rnd));
    h.group.rotation.order = 'YXZ';
    group.add(h.group);
    humans.push({ h, kind: 'walk', d: rnd() * total, dir: rnd() < 0.5 ? 1 : -1, speed: 0.9 + rnd() * 0.5, off: 1.5 + rnd() * 3, phase: rnd() * 10 });
  }

  group.traverse(o => { if (o.isMesh && !o.isSkinnedMesh) o.receiveShadow = true; });
  scene.add(group);

  // centro de la playa, para saber si estás cerca
  const cx = beach.reduce((a, p) => a + p[0], 0) / beach.length, cz = beach.reduce((a, p) => a + p[1], 0) / beach.length;
  let shown = true;
  return {
    group,
    update(dt, px, pz) {
      const near = Math.hypot(px - cx, pz - cz) < 480;
      if (near !== shown) { group.visible = near; shown = near; }
      if (!near) return;
      const t = performance.now() * 0.001;
      for (const p of humans) {
        const h = p.h;
        if (p.kind === 'bath') {
          // de pie en el agua: se mecen con las olas y mueven los brazos
          h.group.position.y = p.base + Math.sin(t * 1.3 + p.phase) * 0.05;
          h.armL.rotation.z = -0.5 - Math.sin(t * 0.9 + p.phase) * 0.3;
          h.armR.rotation.z = 0.5 + Math.sin(t * 0.8 + p.phase) * 0.3;
        } else if (p.kind === 'swim') {
          p.u += dt * 0.55 * p.dir;
          if (Math.abs(p.u) > p.span / 2) { p.dir = -p.dir; p.u = Math.sign(p.u) * p.span / 2; }
          const x = p.x + p.ux * p.u, z = p.z + p.uz * p.u;
          // crol: tumbados boca abajo, brazos en molino y patada
          h.group.rotation.set(Math.PI / 2, Math.atan2(p.ux * p.dir, p.uz * p.dir), 0);
          h.group.position.set(x, WATER_Y - 0.08 + Math.sin(t * 2 + p.phase) * 0.02, z);
          const a = t * 3.2 + p.phase;
          h.armL.rotation.x = -((a % (Math.PI * 2)) );
          h.armR.rotation.x = -(((a + Math.PI) % (Math.PI * 2)));
          h.legL.rotation.x = Math.sin(a * 2) * 0.25;
          h.legR.rotation.x = -Math.sin(a * 2) * 0.25;
        } else if (p.kind === 'walk') {
          p.d += p.speed * p.dir * dt;
          if (p.d < 5 || p.d > total - 5) { p.dir = -p.dir; p.d = Math.max(5, Math.min(total - 5, p.d)); }
          const q = along(shore, p.d);
          const ux = (q.s.bx - q.s.ax) / q.s.L, uz = (q.s.bz - q.s.az) / q.s.L;
          h.group.position.set(q.x - q.s.ox * p.off, SAND_Y + 0.01, q.z - q.s.oz * p.off);
          h.group.rotation.set(0, Math.atan2(ux * p.dir, uz * p.dir), 0);
          const sw = Math.sin(t * p.speed * 5.2 + p.phase) * 0.45;
          h.legL.rotation.x = sw; h.legR.rotation.x = -sw;
          h.armL.rotation.x = -sw * 0.7; h.armR.rotation.x = sw * 0.7;
        }
      }
    },
  };
}
