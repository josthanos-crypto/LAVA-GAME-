import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { sound } from './sound.js';

/**
 * Mobiliario urbano que se puede atropellar: sillas, mesas y sombrillas de las
 * terrazas, bancos y papeleras. Cada pieza es una instancia con su propia
 * física sencilla (sale volando, gira, rebota y se queda tirada en el suelo).
 * A los 90 s, cuando ya no estás cerca, todo vuelve a su sitio.
 */

const G = 9.8;
const GROUND = 0.13;
const RESPAWN_T = 90;
const CELL = 10;

// ── geometrías (centradas en su caja, con color por vértice) ──
function tint(geo, hex) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const c = new THREE.Color(hex);
  const n = g.getAttribute('position').count;
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(a, 3));
  return g;
}
function box(w, h, d, x, y, z, col) { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); return tint(g, col); }
function cyl(r0, r1, h, seg, x, y, z, col) { const g = new THREE.CylinderGeometry(r0, r1, h, seg); g.translate(x, y, z); return tint(g, col); }

function centred(parts) {
  const g = mergeGeometries(parts, false);
  g.computeBoundingBox();
  const bb = g.boundingBox, c = new THREE.Vector3();
  bb.getCenter(c);
  g.translate(-c.x, -c.y, -c.z);
  const s = new THREE.Vector3();
  bb.getSize(s);
  g.computeVertexNormals();
  return { geo: g, half: s.multiplyScalar(0.5) };
}

const WHITE = 0xffffff, LEG = 0x9aa0a6;
const TYPES = {
  // silla de terraza (el color de la resina va por instancia)
  chair: () => centred([
    box(0.44, 0.04, 0.42, 0, 0.46, 0, WHITE),
    box(0.44, 0.38, 0.04, 0, 0.67, -0.2, WHITE),
    ...[[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]].map(([x, z]) => cyl(0.014, 0.014, 0.46, 5, x, 0.23, z, LEG)),
  ]),
  table: () => centred([
    cyl(0.4, 0.4, 0.03, 20, 0, 0.74, 0, 0xf2efe8),
    cyl(0.03, 0.03, 0.7, 8, 0, 0.38, 0, 0xaab0b6),
    cyl(0.2, 0.22, 0.04, 14, 0, 0.02, 0, 0x6a6f75),
  ]),
  umbrella: () => {
    const cone = new THREE.ConeGeometry(1.5, 0.4, 14, 1, true);
    cone.translate(0, 2.3, 0);
    return centred([
      cyl(0.025, 0.025, 2.3, 6, 0, 1.15, 0, 0xc8ccd0),
      cyl(0.22, 0.25, 0.08, 10, 0, 0.04, 0, 0x55595e),
      tint(cone, WHITE),
    ]);
  },
  bench: () => centred([
    ...[0, 1, 2].map(s => box(1.7, 0.04, 0.12, 0, 0.46, -0.15 + s * 0.15, 0x8c5e34)),
    ...[0, 1].map(s => box(1.7, 0.12, 0.04, 0, 0.66 + s * 0.17, 0.21, 0x8c5e34)),
    box(0.05, 0.46, 0.42, -0.75, 0.23, 0, 0x2c3036), box(0.05, 0.46, 0.42, 0.75, 0.23, 0, 0x2c3036),
    box(0.05, 0.55, 0.05, -0.75, 0.7, 0.21, 0x2c3036), box(0.05, 0.55, 0.05, 0.75, 0.7, 0.21, 0x2c3036),
  ]),
  bin: () => centred([
    cyl(0.22, 0.2, 0.8, 12, 0, 0.42, 0, 0x3a5a40),
    cyl(0.24, 0.24, 0.05, 12, 0, 0.84, 0, 0x2c3a2e),
  ]),
};
// masa relativa: cuánto frena el coche y lo lejos que sale
const MASS = { chair: 0.25, table: 0.5, umbrella: 0.4, bench: 1.6, bin: 0.6 };
const RADIUS = { chair: 0.32, table: 0.42, umbrella: 0.35, bench: 0.9, bin: 0.26 };
// a partir de esta velocidad de impacto (m/s) la pieza se hace pedazos
const BREAK = { chair: 19, table: 22, umbrella: 99, bench: 26, bin: 23 };
// altura del centro cuando queda tirada de lado
const LYING = { chair: 0.24, table: 0.4, umbrella: 0.55, bench: 0.36, bin: 0.22 };

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
const _v = new THREE.Vector3(), _up = new THREE.Vector3(), _one = new THREE.Vector3(1, 1, 1);
const _zero = new THREE.Vector3(0, 0, 0), _e = new THREE.Euler();

export class Props {
  constructor(scene, list, colliders) {
    this.colliders = colliders;
    this.items = [];
    this.grid = new Map();
    this.moving = new Set();
    this.disturbed = new Set();
    this.meshes = {};
    this.onHit = null; // (fuerza 0..1, tipo) → sonido

    const byType = {};
    for (const p of list) (byType[p.t] ||= []).push(p);
    for (const [t, arr] of Object.entries(byType)) {
      const { geo, half } = TYPES[t]();
      const mesh = new THREE.InstancedMesh(geo,
        new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.15, side: t === 'umbrella' ? THREE.DoubleSide : THREE.FrontSide }),
        arr.length);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;
      this.meshes[t] = mesh;
      arr.forEach((p, i) => {
        const it = {
          t, mesh, idx: i, half, r: RADIUS[t], mass: MASS[t],
          x0: p.x, z0: p.z, a0: p.a || 0,
          pos: new THREE.Vector3(), quat: new THREE.Quaternion(), vel: new THREE.Vector3(), spin: new THREE.Vector3(),
          broken: false, rest: 0,
        };
        this.reset(it);
        mesh.setColorAt(i, new THREE.Color(p.c ?? WHITE));
        this.items.push(it);
        const k = this.key(p.x, p.z);
        (this.grid.get(k) || this.grid.set(k, []).get(k)).push(it);
      });
      mesh.instanceColor.needsUpdate = true;
      scene.add(mesh);
    }
    this.debris = new Debris(scene);
    this.calm = 0;
  }

  key(x, z) { return Math.floor(x / CELL) + ',' + Math.floor(z / CELL); }

  reset(it) {
    it.pos.set(it.x0, GROUND + it.half.y, it.z0);
    it.quat.setFromAxisAngle(_up.set(0, 1, 0), it.a0);
    it.vel.set(0, 0, 0);
    it.spin.set(0, 0, 0);
    it.broken = false;
    it.rest = 0;
    this.write(it);
  }

  write(it) {
    _m.compose(it.pos, it.quat, it.broken ? _zero : _one);
    it.mesh.setMatrixAt(it.idx, _m);
    it.mesh.instanceMatrix.needsUpdate = true;
  }

  /** lo que hay cerca de (x, z) */
  near(x, z, fn) {
    const cx = Math.floor(x / CELL), cz = Math.floor(z / CELL);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
      const arr = this.grid.get((cx + i) + ',' + (cz + j));
      if (arr) for (const it of arr) fn(it);
    }
  }

  /**
   * actor: { x, z, vx, vz, r, car } — el coche del jugador (o el jugador a pie).
   * Devuelve cuánto hay que frenar al coche (0..1).
   */
  update(dt, actor) {
    let drag = 0;
    if (actor) {
      const sp = Math.hypot(actor.vx, actor.vz);
      this.near(actor.x, actor.z, (it) => {
        if (it.broken) return;
        const dx = it.pos.x - actor.x, dz = it.pos.z - actor.z;
        const d = Math.hypot(dx, dz);
        if (d > it.r + actor.r || it.pos.y > it.half.y + GROUND + 1.2) return;
        // velocidad relativa de entrada
        const nx = d > 1e-3 ? dx / d : 1, nz = d > 1e-3 ? dz / d : 0;
        const rel = (actor.vx - it.vel.x) * nx + (actor.vz - it.vel.z) * nz;
        if (rel <= 0.3 && d > (it.r + actor.r) * 0.6) return;
        if (actor.car) this.smash(it, actor, nx, nz, sp);
        else this.kick(it, actor, nx, nz, sp);
        if (actor.car) drag += it.mass * 0.05;
      });
    }

    for (const it of this.moving) this.step(it, dt);

    // todo vuelve a su sitio cuando llevas un rato lejos
    if (this.disturbed.size) {
      this.calm += dt;
      if (this.calm > RESPAWN_T) {
        this.calm = RESPAWN_T - 5;
        for (const it of [...this.disturbed]) {
          if (actor && Math.hypot(it.x0 - actor.x, it.z0 - actor.z) < 70) continue;
          if (Math.hypot(it.pos.x - (actor?.x ?? 1e9), it.pos.z - (actor?.z ?? 1e9)) < 70) continue;
          this.moving.delete(it);
          this.disturbed.delete(it);
          this.reset(it);
        }
      }
    }
    this.debris.update(dt);
    return Math.min(0.5, drag);
  }

  wake(it) {
    this.moving.add(it);
    this.disturbed.add(it);
    it.rest = 0;
    this.calm = 0;
  }

  smash(it, a, nx, nz, sp) {
    const k = 1 / (0.6 + it.mass);
    // sale despedido con la velocidad del coche más un empujón hacia fuera
    const side = 0.35 + Math.random() * 0.35;
    const fly = Math.min(0.85, k * 0.7) * (0.8 + Math.random() * 0.35);
    it.vel.set(
      (a.vx * (1 - side) + nx * sp * side) * fly,
      (1.5 + sp * (0.2 + Math.random() * 0.15)) * Math.min(1.3, k),
      (a.vz * (1 - side) + nz * sp * side) * fly,
    );
    // vueltas de campana alrededor de un eje horizontal, cruzado a la marcha
    it.spin.set(a.vz, 0, -a.vx).normalize().multiplyScalar(sp * (0.5 + Math.random() * 0.6) * Math.min(1.5, k))
      .add(_v.set(Math.random() - 0.5, (Math.random() - 0.5) * 2, Math.random() - 0.5).multiplyScalar(sp * 0.3));
    it.pos.x += nx * 0.2; it.pos.z += nz * 0.2;
    this.wake(it);
    this.onHit?.(Math.min(1, sp / 25) * (0.5 + it.mass * 0.4), it.t);
    if (sp > BREAK[it.t]) {
      it.broken = true;
      this.debris.burst(it, sp);
      this.write(it);
      this.moving.delete(it);
    }
  }

  kick(it, a, nx, nz, sp) {
    const k = 1 / (0.4 + it.mass);
    const push = Math.max(1.2, sp) * k;
    it.vel.set(nx * push * 1.4, (0.8 + Math.random()) * k, nz * push * 1.4);
    it.spin.set((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 3).multiplyScalar(k);
    this.wake(it);
    this.onHit?.(0.15 * k, it.t);
  }

  step(it, dt) {
    it.vel.y -= G * dt;
    it.pos.addScaledVector(it.vel, dt);
    const ang = it.spin.length();
    if (ang > 1e-4) {
      _q.setFromAxisAngle(_v.copy(it.spin).divideScalar(ang), ang * dt);
      it.quat.premultiply(_q).normalize();
    }
    // paredes de los edificios
    if (this.colliders && Math.hypot(it.vel.x, it.vel.z) > 0.2) {
      for (const c of this.colliders.circleContacts(it.pos.x, it.pos.z, it.r)) {
        it.pos.x += c.nx * c.depth; it.pos.z += c.nz * c.depth;
        const vn = it.vel.x * c.nx + it.vel.z * c.nz;
        if (vn < 0) { it.vel.x -= 1.5 * vn * c.nx; it.vel.z -= 1.5 * vn * c.nz; }
      }
    }
    // ¿apoyada de pie o tumbada? altura del centro según cómo caiga
    _up.set(0, 1, 0).applyQuaternion(it.quat);
    // una sombrilla volcada no se queda de pie
    const upright = it.t !== 'umbrella' && Math.abs(_up.y) > 0.6;
    const lying = upright ? it.half.y : LYING[it.t];
    const floor = GROUND + lying;
    if (it.pos.y <= floor) {
      it.pos.y = floor;
      if (it.vel.y < -2) {
        // rebote con traqueteo
        it.vel.y *= -0.32;
        it.vel.x *= 0.7; it.vel.z *= 0.7;
        it.spin.multiplyScalar(0.65);
        it.spin.x += (Math.random() - 0.5) * 2; it.spin.z += (Math.random() - 0.5) * 2;
        if (it.vel.y > 1.2) this.onHit?.(Math.min(0.5, it.vel.y * 0.08), it.t);
      } else {
        it.vel.y = 0;
        const f = Math.max(0, 1 - 9 * dt);
        it.vel.x *= f; it.vel.z *= f;
        it.spin.multiplyScalar(Math.max(0, 1 - 9 * dt));
        // se asienta en su postura estable más cercana: de pie, patas arriba o de lado
        const tgt = upright ? _v.set(0, Math.sign(_up.y), 0) : _v.set(_up.x, 0, _up.z).normalize();
        _q2.setFromUnitVectors(_up, tgt).multiply(it.quat);
        it.quat.slerp(_q2, Math.min(1, 6 * dt));
        if (Math.hypot(it.vel.x, it.vel.z) < 0.05 && it.spin.length() < 0.05) {
          it.rest += dt;
          if (it.rest > 0.6) this.moving.delete(it);
        }
      }
    }
    this.write(it);
  }
}

/** trozos de plástico, madera y metal que saltan al romperse algo */
class Debris {
  constructor(scene) {
    this.N = 260;
    const geo = new THREE.BoxGeometry(1, 1, 1);
    this.mesh = new THREE.InstancedMesh(geo,
      new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0.1 }), this.N);
    this.mesh.castShadow = true;
    this.mesh.frustumCulled = false;
    this.p = Array.from({ length: this.N }, () => ({
      pos: new THREE.Vector3(), vel: new THREE.Vector3(), q: new THREE.Quaternion(),
      spin: new THREE.Vector3(), s: new THREE.Vector3(), life: 0,
    }));
    for (let i = 0; i < this.N; i++) {
      this.mesh.setMatrixAt(i, _m.makeScale(0, 0, 0));
      this.mesh.setColorAt(i, new THREE.Color(0xffffff));
    }
    this.next = 0;
    this.live = 0;
    scene.add(this.mesh);
  }

  burst(it, sp) {
    const col = new THREE.Color();
    it.mesh.getColorAt(it.idx, col);
    const n = it.t === 'bench' ? 16 : 11;
    const big = Math.max(it.half.x, it.half.z);
    for (let k = 0; k < n; k++) {
      const i = this.next;
      this.next = (this.next + 1) % this.N;
      const d = this.p[i];
      d.pos.copy(it.pos).add(_v.set((Math.random() - 0.5) * big, (Math.random() - 0.3) * it.half.y, (Math.random() - 0.5) * big));
      d.vel.copy(it.vel).multiplyScalar(0.6 + Math.random() * 0.6)
        .add(_v.set((Math.random() - 0.5) * sp * 0.4, Math.random() * sp * 0.25, (Math.random() - 0.5) * sp * 0.4));
      d.q.setFromEuler(_e.set(Math.random() * 6, Math.random() * 6, Math.random() * 6));
      d.spin.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(18);
      const len = 0.08 + Math.random() * big * 0.7;
      d.s.set(len, 0.03 + Math.random() * 0.05, 0.06 + Math.random() * 0.16);
      d.life = 6 + Math.random() * 4;
      // las patas son de metal: algunos trozos grises
      this.mesh.setColorAt(i, k % 4 === 3 ? new THREE.Color(0x9aa0a6) : col);
    }
    this.mesh.instanceColor.needsUpdate = true;
    this.live = 10;
  }

  update(dt) {
    if (this.live <= 0) return;
    this.live -= dt;
    for (let i = 0; i < this.N; i++) {
      const d = this.p[i];
      if (d.life <= 0) continue;
      d.life -= dt;
      d.vel.y -= G * dt;
      d.pos.addScaledVector(d.vel, dt);
      const floor = GROUND + d.s.y * 0.5;
      if (d.pos.y < floor) {
        d.pos.y = floor;
        if (d.vel.y < -1.5) { d.vel.y *= -0.3; d.spin.multiplyScalar(0.5); } else d.vel.y = 0;
        d.vel.x *= 0.82; d.vel.z *= 0.82;
        d.spin.multiplyScalar(0.8);
      }
      const a = d.spin.length();
      if (a > 0.01) d.q.premultiply(_q.setFromAxisAngle(_v.copy(d.spin).divideScalar(a), a * dt));
      const fade = d.life < 1 ? Math.max(0, d.life) : 1;
      _m.compose(d.pos, d.q, _v.copy(d.s).multiplyScalar(fade));
      this.mesh.setMatrixAt(i, _m);
      this.live = Math.max(this.live, d.life);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}

/** sonido de golpe: ruido filtrado (plástico, madera o metal) */
export function makeHitSound() {
  let buf = null, last = 0;
  return (strength, type) => {
    const ctx = sound.ctx;
    if (!sound.live || strength < 0.03) return;
    const now = ctx.currentTime;
    if (now - last < 0.04) return;
    last = now;
    if (!buf) {
      buf = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = 0.8 + Math.random() * 0.5;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = { chair: 1800, table: 900, umbrella: 1200, bench: 420, bin: 650, car: 260 }[type] || 900;
    bp.Q.value = type === 'table' || type === 'bin' ? 6 : 1.6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(Math.min(0.9, strength * 1.4), now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    src.connect(bp).connect(g).connect(sound.out);
    src.start(now);
  };
}

/** dónde va cada pieza: terrazas de bares y cafeterías, bancos y papeleras */
export function propLayout(map) {
  const out = [];
  const CHAIR = [0xb8bcc0, 0x2b2f33, 0xd8d2c4, 0x5a4636, 0x8a9096, 0xb03a2e];
  const SHADE = [0xe8e2d0, 0x2a4d6e, 0xd8cdb4, 0x8c2f2a, 0x3c6e47];
  (map.signs || []).filter(s => s.k === 'food').forEach((s, si) => {
    const tx = s.nz, tz = -s.nx;
    const cx = s.x + s.nx * 2.6, cz = s.z + s.nz * 2.6;
    const face = Math.atan2(s.nx, s.nz);
    const cc = CHAIR[si % CHAIR.length];
    for (const off of [-1.4, 1.4]) {
      const mx = cx + tx * off, mz = cz + tz * off;
      out.push({ t: 'table', x: mx, z: mz, a: si });
      for (const co of [-0.75, 0.75]) {
        out.push({
          t: 'chair', x: mx + s.nx * co, z: mz + s.nz * co,
          a: face + (co > 0 ? Math.PI : 0) + (Math.sin(si * 7 + off * 3 + co) * 0.25), c: cc,
        });
      }
    }
    out.push({ t: 'umbrella', x: cx, z: cz, a: 0, c: SHADE[si % SHADE.length] });
  });
  let n = 0;
  for (const [x, z, a] of map.benches || []) {
    out.push({ t: 'bench', x, z, a: a || 0 });
    if (n++ % 2 === 0) out.push({ t: 'bin', x: x + Math.cos(a || 0) * 1.3, z: z - Math.sin(a || 0) * 1.3, a: 0 });
  }
  for (const p of map.extraProps || []) out.push(p);
  return out;
}
