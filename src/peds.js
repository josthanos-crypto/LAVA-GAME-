import * as THREE from 'three';
import { buildHuman } from './humanModel.js';
import { randomName } from './dialogue.js';
import { ROUNDABOUTS } from './places.js';

const SKIN = [0xf1d3b8, 0xe8c4a2, 0xd9a882, 0xc28a62, 0x9a6844, 0x6e4a32, 0x4a3022];
const HAIR = [0x1e1712, 0x1e1712, 0x3a2a1c, 0x5a4028, 0x8a6a3a, 0xc8a86a, 0xb04a2a, 0x2a2420];
const GREY = [0x9a9a9a, 0xc8c8c4, 0xe2e0da, 0x6e6c6a];
const EYES = [0x3a2616, 0x2a1a10, 0x4a6a8a, 0x4a6a3a, 0x5a3a20];
const SHIRT = [0xe8e4da, 0x3a5f8a, 0xb84a36, 0x557a4a, 0xd8b030, 0x7a6a9a, 0x2c3e50, 0xf2f2f2, 0x71a3c4, 0x1c1c1e, 0xd88a9a, 0x0d5c63, 0xe2661b];
const SHIRT_F = [0xf2f2f2, 0xd88a9a, 0xe8b4c8, 0x71a3c4, 0xf2d06a, 0x9ad0b8, 0xb84a36, 0x1c1c1e, 0xc8a2e0, 0xe8e4da, 0x2c4f86];
const DRESS = [0xd8271c, 0x1c1c1e, 0x2c4f86, 0xf2d06a, 0x9ad0b8, 0xe87a9a, 0xf2f2f2, 0x6a3a8a, 0x2f6b5a, 0xe2661b];
const SKIRT = [0x1c1c1e, 0x2c3440, 0x34465c, 0xc8b89a, 0x8a2a2a, 0xe8e4da, 0x6b5844];
const PANTS = [0x2c3440, 0x34465c, 0x6b5844, 0x3d4f5c, 0x8a8f96, 0xc8b89a, 0x1e2024, 0x5a6a7a, 0xe8e4da];
const SHOES = [0xf2f2f2, 0x1e1e20, 0x6a4a30, 0x3a4a6a, 0xd8271c];
const SHOES_F = [0xf2f2f2, 0x1e1e20, 0xc8a27a, 0xd8271c, 0xe8b4c8, 0x8a6a4a];
const BAGS = [0x1c1c1e, 0x6a4a30, 0xc8a27a, 0x8a2a2a, 0x2c4f86, 0xe8e4da];
const WALK_Y = 0.19; // a la altura de la acera
const BODY_R = 0.42; // radio para impactos y atropellos
// aparecen entre R0 y R1 metros del jugador; más allá de FAR vuelven a salir cerca
const R0 = 16, R1 = 90, FAR = 110;
const CELL = 40;
const cellKey = (x, z) => Math.floor(x / CELL) * 100003 + Math.floor(z / CELL);

/** aspecto de un peatón al azar: hombres y mujeres, jóvenes y mayores, cada uno con su ropa */
export function randomPedLook(rnd = Math.random) {
  const pick = (a) => a[Math.floor(rnd() * a.length) % a.length];
  const female = rnd() < 0.5;
  const old = rnd() < 0.16;
  const look = {
    sex: female ? 'f' : 'm', old,
    skin: pick(SKIN), hair: old ? pick(GREY) : pick(HAIR), eyes: pick(EYES),
    build: 0.9 + rnd() * 0.28 + (old ? 0.06 : 0),
    height: female ? 1.55 + rnd() * 0.2 : 1.66 + rnd() * 0.24,
    inner: pick([0xf2f2f2, 0x1c1c1e, 0xd8d2c4]),
    shades: rnd() < 0.22,
  };
  if (female) {
    look.hairStyle = old ? pick(['short', 'bun', 'curly']) : pick(['long', 'long', 'ponytail', 'bun', 'short', 'curly']);
    const r = rnd();
    look.bottomStyle = r < 0.24 ? 'dress' : r < 0.44 ? 'skirt' : r < 0.6 ? 'shorts' : 'pants';
    look.topStyle = look.bottomStyle === 'dress' ? (rnd() < 0.3 ? 'long' : 'tank') : pick(['tshirt', 'tshirt', 'tank', 'long', 'jacket']);
    look.top = pick(look.bottomStyle === 'dress' ? DRESS : SHIRT_F);
    look.bottom = pick(look.bottomStyle === 'skirt' ? SKIRT : PANTS);
    look.shoeStyle = pick(['sneaker', 'shoe', 'sandal']);
    look.shoes = pick(SHOES_F);
    look.bag = rnd() < 0.35 ? pick(BAGS) : null;
  } else {
    look.hairStyle = old ? pick(['calvo', 'short', 'rapado']) : pick(['short', 'short', 'surf', 'rapado', 'calvo', 'curly']);
    look.beard = rnd() < 0.28;
    look.bottomStyle = rnd() < 0.3 ? 'shorts' : 'pants';
    look.topStyle = pick(['tshirt', 'tshirt', 'tshirt', 'tank', 'long', 'jacket']);
    look.top = pick(SHIRT);
    look.bottom = pick(PANTS);
    look.shoeStyle = pick(['sneaker', 'sneaker', 'shoe', 'sandal']);
    look.shoes = pick(SHOES);
    look.cap = rnd() < 0.18;
    look.capColor = pick(SHIRT);
    look.belt = rnd() < 0.5 ? pick([0x2a1e16, 0x101010, 0x5a3a20]) : null;
  }
  look.backpack = !old && rnd() < 0.12 ? pick(BAGS) : null;
  return look;
}

/** varios aspectos repetibles (para la galería de pruebas) */
export function samplePedLooks(n, seed = 1) {
  let t = seed >>> 0;
  const rnd = () => { t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
  return Array.from({ length: n }, () => randomPedLook(rnd));
}

const POOL_GEO = new THREE.CircleGeometry(1, 20);
POOL_GEO.rotateX(-Math.PI / 2);

function buildPedMesh() {
  const look = randomPedLook();
  const h = buildHuman(look);
  // giro primero (rumbo) y luego inclinación local (caer de espaldas)
  h.group.rotation.order = 'YXZ';
  h.old = look.old;
  return h;
}

/**
 * Peatones con estados: pasean, charlan contigo, huyen cuando hay tiros y
 * caen si les disparas o les atropellas (salen despedidos según la
 * velocidad del coche).
 */
export class Peds {
  constructor(scene, roads, { count = 90 } = {}) {
    this.scene = scene;
    // caminan por todas las calles; las peatonales y las avenidas, más concurridas
    this.roads = roads.filter(r => r.p.length >= 2);
    this.pedRoads = this.roads.filter(r => r.ped || r.major);
    // tramos por casillas, para salir cerca del jugador (los anillos de las
    // rotondas no: su acera de dentro es la isleta)
    this.cells = new Map();
    const ring = (r) => ROUNDABOUTS.some(([cx, cz, rr, w]) =>
      r.p.every(([x, z]) => Math.abs(Math.hypot(x - cx, z - cz) - rr) < w / 2 + 2.5));
    for (const r of this.roads) {
      if (ring(r)) continue;
      for (let s = 0; s < r.p.length - 1; s++) {
        const [ax, az] = r.p[s], [bx, bz] = r.p[s + 1];
        const key = cellKey((ax + bx) / 2, (az + bz) / 2);
        if (!this.cells.has(key)) this.cells.set(key, []);
        this.cells.get(key).push([r, s]);
      }
    }
    this.colliders = null;
    this.onEvent = null; // (tipo, peatón) → 'runover' | 'bumped'
    this.peds = [];
    for (let i = 0; i < count; i++) {
      const m = buildPedMesh();
      m.group.visible = false;
      scene.add(m.group);
      this.peds.push({
        ...m, name: randomName(), road: null, seg: 0, t: 0, dir: 1, side: 1,
        speed: m.old ? 0.7 + Math.random() * 0.25 : 1.1 + Math.random() * 0.7, phase: Math.random() * 10,
        state: 'walk', timer: 0, x: 0, z: 0, heading: 0,
        vx: 0, vz: 0, vy: 0, y: WALK_Y, spin: 0, air: false, pool: null,
      });
    }
  }

  /**
   * sale cerca del jugador, pero no de golpe delante de la cámara;
   * fwd: hacia dónde mira el jugador [x, z]
   */
  spawnNear(p, px, pz, fwd) {
    p.state = 'walk';
    p.air = false;
    p.group.rotation.x = 0;
    if (p.pool) p.pool.visible = false;
    this.unpair(p);
    const hidden = (x, z) => {
      const d = Math.hypot(x - px, z - pz);
      return d > 45 || !fwd || ((x - px) * fwd[0] + (z - pz) * fwd[1]) / (d || 1) < 0.2;
    };
    // a veces sale acompañado: se une a otro que ya pasea (parejas y amigos)
    if (Math.random() < 0.32 && this.joinSomeone(p, px, pz, hidden)) return;
    for (let tries = 0; tries < 60; tries++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.sqrt(R0 * R0 + Math.random() * (R1 * R1 - R0 * R0));
      const cell = this.cells.get(cellKey(px + Math.sin(a) * d, pz + Math.cos(a) * d));
      if (!cell) continue;
      const [r, seg] = cell[Math.floor(Math.random() * cell.length)];
      // las calles peatonales (Calle Real, paseos) se llenan; las avenidas, bastante; el resto, menos
      if (Math.random() > (r.ped ? 1 : r.major ? 0.35 : 0.12)) continue;
      const [ax, az] = r.p[seg], [bx, bz] = r.p[seg + 1];
      const t0 = Math.random();
      const qx = ax + (bx - ax) * t0, qz = az + (bz - az) * t0;
      const dq = Math.hypot(qx - px, qz - pz);
      if (dq < R0 - 4 || dq > R1 + 15 || !hidden(qx, qz)) continue;
      p.road = r;
      p.seg = seg;
      p.t = t0;
      p.pause = 6 + Math.random() * 30;
      p.dir = Math.random() < 0.5 ? 1 : -1;
      p.side = Math.random() < 0.5 ? 1 : -1;
      p.lane = 0;
      p.name = randomName();
      p.group.visible = true;
      return;
    }
    p.group.visible = false;
    p.road = null;
  }

  /** se une a alguien que ya pasea (y que no esté a la vista a dos pasos) */
  joinSomeone(p, px, pz, hidden) {
    const free = this.peds.filter(q => q !== p && q.road && q.state === 'walk' && !q.leader && !q.mate && q.group.visible);
    if (!free.length) return false;
    const L = free[Math.floor(Math.random() * free.length)];
    if (Math.hypot(L.x - px, L.z - pz) < R0 || !hidden(L.x, L.z)) return false;
    p.leader = L;
    L.mate = p;
    Object.assign(p, { road: L.road, seg: L.seg, t: L.t, dir: L.dir, side: L.side, speed: L.speed, lane: 0.68 });
    p.name = randomName();
    p.group.visible = true;
    return true;
  }

  /** deshace la pareja (si alguno se va, se asusta o cae) */
  unpair(p) {
    if (p.leader) { if (p.leader.mate === p) p.leader.mate = null; p.leader = null; }
    if (p.mate) { if (p.mate.leader === p) p.mate.leader = null; p.mate = null; }
  }

  /** peatón más cercano con el que se puede hablar */
  nearestTalkable(x, z, r = 3) {
    let best = null, bd = r;
    for (const p of this.peds) {
      if (!p.road || p.state === 'down' || p.state === 'flee') continue;
      const d = Math.hypot(p.x - x, p.z - z);
      if (d < bd) { bd = d; best = p; }
    }
    return best;
  }

  /** primer peatón que cruza el rayo (origen, dirección normalizada) */
  hitTest(ox, oz, dx, dz, range) {
    let best = null, bt = range;
    for (const p of this.peds) {
      if (!p.road || p.state === 'down' || !p.group.visible) continue;
      const rx = p.x - ox, rz = p.z - oz;
      const t = rx * dx + rz * dz;
      if (t < 0 || t > bt) continue;
      const off = Math.abs(rx * dz - rz * dx);
      if (off < BODY_R) { bt = t; best = p; }
    }
    return best ? { ped: best, dist: bt } : null;
  }

  /** derriba a un peatón con un impulso horizontal (vx, vz) y vertical vy */
  knock(p, vx, vz, vy) {
    p.state = 'down';
    p.timer = 45;
    p.air = true;
    p.vx = vx; p.vz = vz; p.vy = vy;
    p.y = WALK_Y;
    p.spin = (Math.random() - 0.5) * 8;
    for (const limb of [p.legL, p.legR, p.armL, p.armR]) limb.rotation.x = (Math.random() - 0.5) * 1.6;
  }

  shoot(p, dx, dz) {
    this.knock(p, dx * 1.2, dz * 1.2, 0.6);
  }

  /** los que estén cerca de (x, z) salen corriendo; devuelve cuántos */
  scare(x, z, radius = 35) {
    let n = 0;
    for (const p of this.peds) {
      if (!p.road || p.state === 'down') continue;
      if (Math.hypot(p.x - x, p.z - z) > radius) continue;
      p.state = 'flee';
      p.timer = 9 + Math.random() * 6;
      const d = Math.hypot(p.x - x, p.z - z) || 1;
      p.vx = (p.x - x) / d;
      p.vz = (p.z - z) / d;
      n++;
    }
    return n;
  }

  bloodPool(p) {
    if (!p.pool) {
      p.pool = new THREE.Mesh(POOL_GEO, new THREE.MeshStandardMaterial({
        color: 0x4a0606, roughness: 0.2, transparent: true, opacity: 0.85, depthWrite: false,
        polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
      }));
      this.scene.add(p.pool);
    }
    p.pool.visible = true;
    p.pool.position.set(p.x, WALK_Y - 0.01, p.z);
    p.pool.scale.setScalar(0.05);
  }

  /**
   * ctx: { driving, carSpeed, carVel (Vector2) } — si vas en coche rápido,
   * los peatones que toques salen volando
   */
  update(dt, player, ctx = {}) {
    const px = player.pos.x, pz = player.pos.y;
    const t = performance.now() * 0.001;
    const fast = ctx.driving && ctx.carSpeed > 4;

    // al empezar salen ya repartidos por todas partes (la pantalla de carga lo tapa)
    const fwd = this.started && player.heading !== undefined ? [Math.sin(player.heading), Math.cos(player.heading)] : null;
    this.started = true;
    for (const p of this.peds) {
      if (!p.road) { this.spawnNear(p, px, pz, fwd); continue; }

      if (p.state === 'down') { this.unpair(p); this.updateDown(p, dt, px, pz); continue; }
      if (p.state === 'flee') this.unpair(p);

      if (p.state === 'talk') {
        p.heading = Math.atan2(px - p.x, pz - p.z);
        for (const limb of [p.legL, p.legR]) limb.rotation.x = 0;
        p.armL.rotation.x = Math.sin(t * 3) * 0.25 - 0.2;
        p.armR.rotation.x = 0;
      } else if (p.state === 'flee') {
        p.timer -= dt;
        let nx = p.x + p.vx * 5.2 * dt, nz = p.z + p.vz * 5.2 * dt;
        if (this.colliders) {
          for (const c of this.colliders.circleContacts(nx, nz, 0.4)) {
            nx += c.nx * c.depth; nz += c.nz * c.depth;
            // resbala por la pared en vez de quedarse pegado
            const vn = p.vx * c.nx + p.vz * c.nz;
            p.vx -= c.nx * vn; p.vz -= c.nz * vn;
            const l = Math.hypot(p.vx, p.vz) || 1; p.vx /= l; p.vz /= l;
          }
        }
        p.x = nx; p.z = nz;
        p.heading = Math.atan2(p.vx, p.vz);
        const swing = Math.sin(t * 13 + p.phase) * 0.8;
        p.legL.rotation.x = swing; p.legR.rotation.x = -swing;
        p.armL.rotation.x = -swing; p.armR.rotation.x = swing;
        if (p.timer <= 0 && Math.hypot(p.x - px, p.z - pz) > 45) { p.road = null; p.group.visible = false; continue; }
      } else if (p.leader) {
        // acompañante: camina al lado del otro y, cuando se paran, charlan
        const L = p.leader;
        if (L.state === 'walk') {
          Object.assign(p, { road: L.road, seg: L.seg, t: L.t, dir: L.dir, side: L.side, state: 'walk' });
          this.place(p, t);
        } else if (L.state === 'idle' || L.state === 'talk') {
          p.state = 'idle';
          p.heading = Math.atan2(L.x - p.x, L.z - p.z);
          for (const limb of [p.legL, p.legR]) limb.rotation.x = 0;
          p.armL.rotation.x = -0.15;
          p.armR.rotation.x = Math.sin(t * 2.6 + p.phase) * 0.22 - 0.3;
        } else {
          this.unpair(p);
        }
      } else if (p.state === 'idle') {
        // parados un rato: mirando un escaparate, el móvil o charlando
        p.timer -= dt;
        for (const limb of [p.legL, p.legR]) limb.rotation.x = 0;
        p.armL.rotation.x = -0.1 + Math.sin(t * 0.7 + p.phase) * 0.06;
        p.armR.rotation.x = p.phone ? -1.1 : p.mate ? Math.sin(t * 2.2 + p.phase) * 0.25 - 0.3 : -0.1;
        if (p.timer <= 0) { p.state = 'walk'; p.pause = 10 + Math.random() * 40; }
      } else {
        this.walk(p, dt, t);
        p.pause -= dt;
        if (p.pause <= 0 && p.state === 'walk') {
          p.state = 'idle';
          p.timer = 3 + Math.random() * 9;
          // con compañía se paran a charlar cara a cara; si no, móvil o escaparate
          p.phone = !p.mate && Math.random() < 0.4;
          if (p.mate) p.heading = Math.atan2(p.mate.x - p.x, p.mate.z - p.z);
          else p.heading += (Math.random() < 0.5 ? 1 : -1) * Math.PI / 2;
        }
      }

      // coche del jugador: atropello si va rápido, empujón si va despacio
      const dpx = p.x - px, dpz = p.z - pz;
      const dp = Math.hypot(dpx, dpz);
      if (ctx.driving && dp < 2.0) {
        if (fast) {
          const v = ctx.carVel;
          this.knock(p, v.x * 0.9 + (dpx / (dp || 1)) * 2, v.y * 0.9 + (dpz / (dp || 1)) * 2, 2.5 + ctx.carSpeed * 0.18);
          this.onEvent?.('runover', p);
          continue;
        }
        if (dp > 0.01) {
          p.x += (dpx / dp) * (2.0 - dp);
          p.z += (dpz / dp) * (2.0 - dp);
          if (p.state === 'walk' && Math.random() < 0.02) this.onEvent?.('bumped', p);
        }
      } else if (!ctx.driving && dp < 0.7 && dp > 0.01) {
        p.x += (dpx / dp) * (0.7 - dp);
        p.z += (dpz / dp) * (0.7 - dp);
      }
      if (dp > FAR) { this.spawnNear(p, px, pz, fwd); continue; }

      p.group.position.set(p.x, WALK_Y + (p.state === 'walk' ? Math.abs(Math.sin(t * p.speed * 5.2 + p.phase)) * 0.025 : 0), p.z);
      p.group.rotation.y = p.heading;
      p.group.rotation.x = 0;
    }
  }

  walk(p, dt, t) {
    const pts = p.road.p;
    const a = pts[p.seg], b = pts[p.seg + 1];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 0.001;
    p.t += (p.speed * p.dir * dt) / len;
    if (p.t > 1) {
      if (p.seg + 1 < pts.length - 1) { p.seg++; p.t = 0; }
      else { p.dir = -1; p.t = 1; }
    } else if (p.t < 0) {
      if (p.seg > 0) { p.seg--; p.t = 1; }
      else { p.dir = 1; p.t = 0; }
    }
    this.place(p, t);
  }

  /** coloca al peatón en su punto de la calle y le mueve piernas y brazos */
  place(p, t) {
    const pts = p.road.p;
    const a = pts[p.seg], b = pts[p.seg + 1];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 0.001;
    const ux = (b[0] - a[0]) / len, uz = (b[1] - a[1]) / len;
    // por la acera, algo apartados del bordillo (hay coches medio subidos);
    // en calle peatonal caminan por en medio con algo de dispersión.
    // El acompañante va un paso más hacia dentro.
    const off = p.side * ((p.road.ped ? p.road.w * 0.2 : p.road.w / 2 + 1.4) + (p.lane || 0));
    p.x = a[0] + (b[0] - a[0]) * p.t - uz * off;
    p.z = a[1] + (b[1] - a[1]) * p.t + ux * off;
    p.heading = Math.atan2(ux * p.dir, uz * p.dir);
    const swing = Math.sin(t * p.speed * 5.2 + p.phase) * 0.45;
    p.legL.rotation.x = swing;
    p.legR.rotation.x = -swing;
    p.armL.rotation.x = -swing * 0.75;
    p.armR.rotation.x = swing * 0.75;
  }

  updateDown(p, dt, px, pz) {
    if (p.air) {
      p.vy -= 9.8 * dt;
      p.x += p.vx * dt; p.z += p.vz * dt; p.y += p.vy * dt;
      p.vx *= 1 - dt * 0.6; p.vz *= 1 - dt * 0.6;
      p.heading += p.spin * dt;
      if (this.colliders) {
        for (const c of this.colliders.circleContacts(p.x, p.z, 0.4)) {
          p.x += c.nx * c.depth; p.z += c.nz * c.depth;
          const vn = p.vx * c.nx + p.vz * c.nz;
          if (vn < 0) { p.vx -= c.nx * vn * 1.4; p.vz -= c.nz * vn * 1.4; }
        }
      }
      const fall = Math.min(1, (WALK_Y + 1.2 - Math.max(p.y, WALK_Y)) / 1.2);
      p.group.rotation.x = -Math.PI / 2 * Math.max(fall, 0.35);
      if (p.y <= WALK_Y && p.vy < 0) {
        if (p.vy < -4) { p.vy *= -0.25; p.y = WALK_Y; } // rebote en el asfalto
        else { p.air = false; p.y = WALK_Y; this.bloodPool(p); }
      }
      p.group.position.set(p.x, p.y + 0.12, p.z);
      p.group.rotation.y = p.heading;
      return;
    }
    p.group.rotation.x = -Math.PI / 2;
    p.group.position.set(p.x, WALK_Y + 0.12, p.z);
    if (p.pool && p.pool.scale.x < 0.9) p.pool.scale.setScalar(Math.min(0.9, p.pool.scale.x + dt * 0.12));
    p.timer -= dt;
    // desaparece cuando ya no lo ves
    if (p.timer <= 0 && Math.hypot(p.x - px, p.z - pz) > 60) { p.road = null; p.group.visible = false; if (p.pool) p.pool.visible = false; }
  }
}
