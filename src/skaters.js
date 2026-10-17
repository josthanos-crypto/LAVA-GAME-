import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { buildHuman } from './humanModel.js';
import { randomPedLook } from './peds.js';
import { paint } from './interiorKit.js';

/**
 * Gente en patineta: van de lado sobre la tabla por los paseos y las calles
 * peatonales, empujan con un pie, saltan algún bordillo (ollie) y de vez en
 * cuando se la pegan, se levantan sacudiéndose y vuelven a por la tabla.
 * Si les das con el coche salen volando, tabla por un lado y patinador por
 * otro, pero se levantan. En la plaza del Reducto hay dos dando vueltas.
 */

const Y0 = 0.19;
const R0 = 22, R1 = 95, FAR = 125, CELL = 40;
const cellKey = (x, z) => Math.floor(x / CELL) * 100003 + Math.floor(z / CELL);
const NAMES = ['Aday', 'Yeray', 'Ancor', 'Iballa', 'Tanausú', 'Nauzet', 'Chaxiraxi', 'Acoidán', 'Dácil', 'Jonay'];
const OOPS = ['¡Ños, mi tabla!', '¡Casi la clavo!', 'No pasó nada, no pasó nada…', '¡Esa no cuenta!', '¡Fuerte golpe, chacho!'];
const BOARDS = [0xd8271c, 0x18c5b8, 0xf2c41a, 0x2b6cd8, 0x1c1c1e, 0xff7a45, 0x7ac043];
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(0, 0, 0, 'YXZ'), _v = new THREE.Vector3(), _one = new THREE.Vector3(1, 1, 1);
const wrap = (a) => ((a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;

function boardGeos() {
  const W = 0xffffff;
  const piece = (g, x, y, z, hex, rx = 0) => { if (rx) g.rotateX(rx); g.translate(x, y, z); return paint(g, hex); };
  const deck = mergeGeometries([
    piece(new THREE.BoxGeometry(0.21, 0.016, 0.56), 0, 0.083, 0, W),
    piece(new THREE.BoxGeometry(0.2, 0.016, 0.13), 0, 0.1, 0.33, W, -0.32),
    piece(new THREE.BoxGeometry(0.2, 0.016, 0.13), 0, 0.1, -0.33, W, 0.32),
    // lija negra por encima
    piece(new THREE.BoxGeometry(0.2, 0.004, 0.55), 0, 0.093, 0, 0x151515),
  ], false);
  const parts = [];
  for (const z of [-0.2, 0.2]) {
    parts.push(piece(new THREE.BoxGeometry(0.17, 0.03, 0.045), 0, 0.05, z, 0xa0a6ac));
    for (const x of [-0.08, 0.08]) {
      const w = new THREE.CylinderGeometry(0.028, 0.028, 0.032, 12);
      w.rotateZ(Math.PI / 2);
      parts.push(piece(w, x, 0.028, z, 0xece4cc));
    }
  }
  return { deck, gear: mergeGeometries(parts, false) };
}

function skaterLook() {
  const look = randomPedLook();
  look.old = false;
  look.bag = null;
  look.shoeStyle = 'sneaker';
  look.cap = Math.random() < 0.5;
  look.bottomStyle = Math.random() < 0.55 ? 'shorts' : 'pants';
  if (look.topStyle === 'jacket') look.topStyle = 'long';
  if (look.sex === 'f' && look.hairStyle === 'long') look.hairStyle = 'ponytail';
  return look;
}

export class Skaters {
  /** loop: recorrido cerrado [[x, z]...] para los de la plaza */
  constructor(scene, roads, { count = 6, loop = null, loopCount = 2 } = {}) {
    this.scene = scene;
    // por donde se patina: calles peatonales, paseos y aceras de las avenidas
    this.cells = new Map();
    for (const r of roads) {
      if (r.p.length < 2 || !(r.ped || r.major)) continue;
      for (let s = 0; s < r.p.length - 1; s++) {
        const [ax, az] = r.p[s], [bx, bz] = r.p[s + 1];
        if (Math.hypot(bx - ax, bz - az) < 6) continue;
        const k = cellKey((ax + bx) / 2, (az + bz) / 2);
        if (!this.cells.has(k)) this.cells.set(k, []);
        this.cells.get(k).push([r, s]);
      }
    }
    this.loop = loop ? prepLoop(loop) : null;
    const n = count + (loop ? loopCount : 0);
    const G = boardGeos();
    const mk = (g, mat) => {
      const m = new THREE.InstancedMesh(g, mat, n);
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      m.castShadow = true;
      m.frustumCulled = false;
      scene.add(m);
      return m;
    };
    this.decks = mk(G.deck, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5 }));
    this.gear = mk(G.gear, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0.4 }));
    this.list = [];
    for (let i = 0; i < n; i++) {
      this.decks.setColorAt(i, new THREE.Color(BOARDS[i % BOARDS.length]));
      const h = buildHuman(skaterLook());
      h.group.rotation.order = 'YXZ';
      h.group.visible = false;
      scene.add(h.group);
      this.list.push({
        i, ...h, name: NAMES[i % NAMES.length], kind: loop && i >= count ? 'loop' : 'street',
        road: null, seg: 0, t: 0, dir: 1, side: 1, u: Math.random() * 100,
        x: 0, z: 0, heading: 0, speed: 0, cruise: 3.6 + Math.random() * 1.6, goofy: Math.random() < 0.4 ? -1 : 1,
        state: 'ride', timer: 0, trickT: 3 + Math.random() * 6, pushT: 0, air: 0, y: 0,
        board: { x: 0, z: 0, y: 0, heading: 0, pitch: 0, roll: 0, vx: 0, vz: 0, spin: 0 },
        body: { vx: 0, vz: 0, vy: 0, y: 0, spin: 0, tilt: 0 }, visible: false, phase: Math.random() * 6, kick: 0,
      });
    }
    this.decks.instanceColor.needsUpdate = true;
    this.onEvent = null; // ('oops' | 'hit', patinador)
  }

  update(dt, player, ctx = {}) {
    const px = player.pos.x, pz = player.pos.y;
    const fwd = player.heading !== undefined ? [Math.sin(player.heading), Math.cos(player.heading)] : null;
    const t = performance.now() * 0.001;
    for (const s of this.list) {
      if (s.kind === 'loop') {
        const near = Math.hypot(this.loop.cx - px, this.loop.cz - pz) < 150;
        if (!near) { this.hide(s); continue; }
        if (!s.visible) this.show(s);
      } else if (!s.road || Math.hypot(s.x - px, s.z - pz) > FAR) {
        if (!this.spawn(s, px, pz, fwd)) { this.hide(s); continue; }
      }
      this.step(s, dt, t);
      this.hitByCar(s, px, pz, ctx);
      this.draw(s, t);
    }
    this.decks.instanceMatrix.needsUpdate = true;
    this.gear.instanceMatrix.needsUpdate = true;
  }

  hide(s) {
    s.visible = false;
    s.group.visible = false;
    _m.makeScale(0, 0, 0);
    this.decks.setMatrixAt(s.i, _m);
    this.gear.setMatrixAt(s.i, _m);
  }

  show(s) {
    s.visible = true;
    s.group.visible = true;
    s.state = 'ride';
    s.speed = s.cruise;
    s.body.tilt = 0;
  }

  /** aparece en un paseo cerca, pero no de golpe delante de la cámara */
  spawn(s, px, pz, fwd) {
    for (let k = 0; k < 25; k++) {
      const a = Math.random() * Math.PI * 2, d = R0 + Math.random() * (R1 - R0);
      const cell = this.cells.get(cellKey(px + Math.sin(a) * d, pz + Math.cos(a) * d));
      if (!cell) continue;
      const [r, seg] = cell[Math.floor(Math.random() * cell.length)];
      const [ax, az] = r.p[seg], [bx, bz] = r.p[seg + 1];
      const t0 = Math.random(), qx = ax + (bx - ax) * t0, qz = az + (bz - az) * t0;
      const dq = Math.hypot(qx - px, qz - pz);
      if (fwd && dq < 50 && ((qx - px) * fwd[0] + (qz - pz) * fwd[1]) / dq > 0.2) continue;
      Object.assign(s, { road: r, seg, t: t0, dir: Math.random() < 0.5 ? 1 : -1, side: Math.random() < 0.5 ? 1 : -1 });
      this.show(s);
      this.along(s, 0);
      s.heading = s.target;
      Object.assign(s.board, { x: s.x, z: s.z, heading: s.heading, y: 0, pitch: 0, roll: 0 });
      return true;
    }
    s.road = null;
    return false;
  }

  /** avanza dist metros por su calle (o por la vuelta de la plaza) */
  along(s, dist) {
    if (s.kind === 'loop') {
      const L = this.loop;
      s.u = (s.u + dist) % L.len;
      const [x, z, h] = pointAt(L, s.u);
      s.x = x; s.z = z; s.target = h;
      return;
    }
    const pts = s.road.p;
    let a = pts[s.seg], b = pts[s.seg + 1];
    let len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 0.001;
    s.t += (dist * s.dir) / len;
    if (s.t > 1) {
      if (s.seg + 1 < pts.length - 1) { s.seg++; s.t = 0; } else { s.dir = -1; s.t = 1; s.kick = 0.45; }
    } else if (s.t < 0) {
      if (s.seg > 0) { s.seg--; s.t = 1; } else { s.dir = 1; s.t = 0; s.kick = 0.45; }
    }
    a = pts[s.seg]; b = pts[s.seg + 1];
    len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 0.001;
    const ux = (b[0] - a[0]) / len, uz = (b[1] - a[1]) / len;
    const off = s.side * (s.road.ped ? s.road.w * 0.15 : s.road.w / 2 + 1.6);
    s.x = a[0] + (b[0] - a[0]) * s.t - uz * off;
    s.z = a[1] + (b[1] - a[1]) * s.t + ux * off;
    s.target = Math.atan2(ux * s.dir, uz * s.dir);
  }

  step(s, dt, t) {
    const B = s.board, P = s.body;
    if (s.state === 'ride' || s.state === 'push' || s.state === 'ollie') {
      // empuja de vez en cuando para mantener la velocidad
      if (s.state === 'ride' && s.speed < s.cruise * 0.75) { s.state = 'push'; s.timer = 0.9; }
      if (s.state === 'push') {
        s.timer -= dt;
        s.speed += 3.2 * dt;
        if (s.timer <= 0) s.state = 'ride';
      } else s.speed -= 0.35 * dt;
      s.speed = Math.max(0, Math.min(s.cruise * 1.25, s.speed));
      this.along(s, s.speed * dt);
      s.heading += wrap(s.target - s.heading) * Math.min(1, dt * 8);
      if (s.kick > 0) s.kick -= dt; // media vuelta al final del paseo
      // ollie de vez en cuando; uno de cada cinco acaba en el suelo
      s.trickT -= dt;
      if (s.state === 'ride' && s.trickT <= 0) {
        s.state = 'ollie'; s.air = 0; s.trickT = 5 + Math.random() * 9;
        s.fail = Math.random() < 0.2;
      }
      if (s.state === 'ollie') {
        s.air += dt / 0.6;
        if (s.air >= 1) {
          s.air = 0;
          if (s.fail) this.bail(s, Math.sin(s.heading) * s.speed, Math.cos(s.heading) * s.speed, 1.6, 'oops');
          else s.state = 'ride';
        }
      }
      const jump = s.state === 'ollie' ? Math.sin(s.air * Math.PI) : 0;
      s.y = jump * 0.42;
      Object.assign(B, {
        x: s.x, z: s.z, y: s.y, heading: s.heading + (s.kick > 0 ? (0.45 - s.kick) / 0.45 * Math.PI : 0),
        pitch: s.state === 'ollie' ? (s.air < 0.3 ? -0.45 * Math.sin(s.air / 0.3 * Math.PI) : 0) : 0, roll: 0,
      });
      return;
    }
    // por los aires (caída o atropello): patinador por un lado, tabla por otro
    B.vx *= 1 - dt * 0.9; B.vz *= 1 - dt * 0.9;
    B.x += B.vx * dt; B.z += B.vz * dt;
    B.heading += B.spin * dt; B.spin *= 1 - dt * 2;
    B.roll *= 1 - dt * 3; B.pitch *= 1 - dt * 3;
    if (s.state === 'air') {
      P.vy -= 9.8 * dt;
      s.x += P.vx * dt; s.z += P.vz * dt; P.y += P.vy * dt;
      P.vx *= 1 - dt * 0.5; P.vz *= 1 - dt * 0.5;
      s.heading += P.spin * dt;
      P.tilt = Math.min(Math.PI / 2, P.tilt + dt * 5);
      if (P.y <= 0 && P.vy < 0) { P.y = 0; s.state = 'down'; s.timer = 1.6 + Math.random(); }
    } else if (s.state === 'down') {
      s.timer -= dt;
      if (s.timer <= 0) { s.state = 'up'; s.timer = 0.8; }
    } else if (s.state === 'up') {
      // se levanta sacudiéndose
      s.timer -= dt;
      P.tilt = Math.max(0, P.tilt - dt * 2.4);
      if (s.timer <= 0) { s.state = 'fetch'; P.tilt = 0; }
    } else if (s.state === 'fetch') {
      // va andando a por la tabla
      const dx = B.x - s.x, dz = B.z - s.z, d = Math.hypot(dx, dz);
      s.heading = Math.atan2(dx, dz);
      if (d < 0.5) {
        s.state = 'push'; s.timer = 1.2; s.speed = 0.5;
        // vuelve a su recorrido desde donde está la tabla
        if (s.kind === 'street') this.rejoin(s);
        else this.rejoinLoop(s);
      } else { s.x += dx / d * 1.6 * dt; s.z += dz / d * 1.6 * dt; }
    }
    s.y = Math.max(0, P.y);
  }

  /** tras la caída, sigue por su calle desde el punto más cercano */
  rejoin(s) {
    const pts = s.road.p;
    let best = Infinity;
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[i + 1], dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((s.x - ax) * dx + (s.z - az) * dz) / l2));
      const d = Math.hypot(s.x - ax - dx * t, s.z - az - dz * t);
      if (d < best) { best = d; s.seg = i; s.t = t; }
    }
  }

  /** el de la plaza sigue su vuelta desde el punto más cercano */
  rejoinLoop(s) {
    const L = this.loop;
    let best = Infinity;
    for (let i = 0; i < L.pts.length; i++) {
      const [ax, az] = L.pts[i], [bx, bz] = L.pts[(i + 1) % L.pts.length], dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((s.x - ax) * dx + (s.z - az) * dz) / l2));
      const d = Math.hypot(s.x - ax - dx * t, s.z - az - dz * t);
      if (d < best) { best = d; s.u = L.cum[i] + t * Math.sqrt(l2); }
    }
  }

  /** se cae: velocidad del cuerpo (vx, vz, vy); la tabla sale rodando */
  bail(s, vx, vz, vy, why) {
    const B = s.board, P = s.body;
    s.state = 'air';
    P.vx = vx * 0.8; P.vz = vz * 0.8; P.vy = vy; P.y = Math.max(0.05, s.y); P.spin = (Math.random() - 0.5) * 3;
    B.vx = vx * 1.15 + (Math.random() - 0.5); B.vz = vz * 1.15 + (Math.random() - 0.5);
    B.spin = (Math.random() - 0.5) * 9; B.roll = Math.random() < 0.5 ? Math.PI : 0.6;
    s.speed = 0;
    this.onEvent?.(why, s, OOPS[Math.floor(Math.random() * OOPS.length)]);
  }

  hitByCar(s, px, pz, ctx) {
    if (!ctx.driving || (s.state !== 'ride' && s.state !== 'push' && s.state !== 'ollie' && s.state !== 'fetch')) return;
    const dx = s.x - px, dz = s.z - pz, d = Math.hypot(dx, dz);
    if (d > 1.9) return;
    if ((ctx.carSpeed || 0) > 3) {
      const v = ctx.carVel;
      this.bail(s, v.x * 0.9 + dx / (d || 1) * 2, v.y * 0.9 + dz / (d || 1) * 2, 2.6 + ctx.carSpeed * 0.15, 'hit');
    } else if (d > 0.01) {
      s.x = px + dx / d * 1.9; s.z = pz + dz / d * 1.9;
    }
  }

  draw(s, t) {
    const p = s, B = s.board, P = s.body;
    const g = s.group;
    const riding = s.state === 'ride' || s.state === 'push' || s.state === 'ollie';
    const h = g.scale.x;
    // tabla
    _e.set(B.pitch, B.heading, B.roll, 'YXZ');
    _q.setFromEuler(_e);
    _m.compose(_v.set(B.x, Y0 + B.y, B.z), _q, _one);
    this.decks.setMatrixAt(s.i, _m);
    this.gear.setMatrixAt(s.i, _m);
    if (riding) {
      // de lado sobre la tabla; al empujar se gira hacia delante
      const pushing = s.state === 'push';
      const crouch = s.state === 'ollie' ? Math.sin(s.air * Math.PI) * 0.5 : 0.05 + Math.sin(t * 1.3 + s.phase) * 0.04;
      const yaw = pushing ? s.heading - s.goofy * 0.35 : s.heading - s.goofy * Math.PI / 2;
      g.rotation.set(0, yaw, pushing ? 0 : Math.sin(t * 0.8 + s.phase) * 0.04);
      g.position.set(B.x, Y0 + B.y + 0.1 - 0.09 * h - crouch * 0.12, B.z);
      if (pushing) {
        const k = Math.sin((0.9 - s.timer) / 0.9 * Math.PI * 2);
        p.legL.rotation.set(-0.15, 0, -0.06);
        p.kneeL.rotation.x = 0.35;
        p.legR.rotation.set(k * 0.7, 0, 0.06);
        p.armL.rotation.set(-k * 0.5, 0, -0.15);
        p.armR.rotation.set(k * 0.5, 0, 0.15);
      } else {
        p.legL.rotation.set(-0.35 - crouch, 0, -0.27);
        p.kneeL.rotation.x = 0.7 + crouch * 1.6;
        p.legR.rotation.set(-0.35 - crouch, 0, 0.27);
        p.kneeR.rotation.x = 0.7 + crouch * 1.6;
        p.armL.rotation.set(-0.25, 0, -0.8 + Math.sin(t * 1.7 + s.phase) * 0.12);
        p.armR.rotation.set(-0.15, 0, 0.62 + Math.sin(t * 1.4 + s.phase) * 0.1);
      }
      p.spine.rotation.x = 0.12 + crouch * 0.3;
      return;
    }
    p.spine.rotation.x = 0;
    if (s.state === 'fetch') {
      const sw = Math.sin(t * 7 + s.phase) * 0.45;
      g.rotation.set(0, s.heading, 0);
      g.position.set(s.x, Y0, s.z);
      p.legL.rotation.set(sw, 0, 0); p.legR.rotation.set(-sw, 0, 0);
      p.armL.rotation.set(-sw * 0.7, 0, -0.08); p.armR.rotation.set(sw * 0.7, 0, 0.08);
      return;
    }
    // por el suelo: como los peatones que se caen (y luego se levantan)
    g.rotation.set(-P.tilt, s.heading, 0);
    g.position.set(s.x, Y0 + P.y + (P.tilt / (Math.PI / 2)) * 0.12, s.z);
    p.legL.rotation.set(0.3, 0, -0.2); p.legR.rotation.set(-0.2, 0, 0.25);
    p.armL.rotation.set(-0.6, 0, -0.9); p.armR.rotation.set(s.state === 'up' ? -2 + Math.sin(t * 12) * 0.3 : 0.4, 0, 0.9);
  }
}

function prepLoop(pts) {
  const cum = [0];
  for (let i = 1; i <= pts.length; i++) {
    const a = pts[i - 1], b = pts[i % pts.length];
    cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const xs = pts.map(p => p[0]), zs = pts.map(p => p[1]);
  return { pts, cum, len: cum[cum.length - 1], cx: xs.reduce((a, b) => a + b) / xs.length, cz: zs.reduce((a, b) => a + b) / zs.length };
}

function pointAt(L, u) {
  const { pts, cum } = L;
  let i = 0;
  while (i < pts.length - 1 && cum[i + 1] < u) i++;
  const a = pts[i], b = pts[(i + 1) % pts.length];
  const k = (u - cum[i]) / ((cum[i + 1] - cum[i]) || 1);
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, Math.atan2(b[0] - a[0], b[1] - a[1])];
}
