import { makeCar, pickModel, BRAND_SHARE } from './carModels.js';

/**
 * Coches aparcados en las calles, medio subidos al bordillo como en las calles
 * estrechas de Arrecife. Solo existen cerca del jugador: al alejarte se
 * recogen y al volver aparecen los mismos en el mismo sitio. Se pueden robar
 * y, si les das un golpe, se desplazan.
 */
const STEP = 13;     // metros entre huecos de aparcamiento
const NEAR = 115;    // radio con coches aparcados alrededor del jugador
const CELL = 60;
const CURB = 0.05;   // altura del bordillo: el coche queda algo ladeado

const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export class ParkedCars {
  constructor(scene, map, { max = 14, colliders = null } = {}) {
    this.scene = scene;
    this.max = max;
    this.colliders = colliders;
    this.spots = [];
    this.grid = new Map();
    this.active = new Map(); // hueco -> coche
    this.tick = 0;
    // donde no se aparca: terrazas de bares y bancos
    const avoid = [
      ...(map.signs || []).filter(s => s.k === 'food').map(s => [s.x + s.nx * 2.6, s.z + s.nz * 2.6]),
      ...(map.benches || []).map(([x, z]) => [x, z]),
    ];
    let id = 0;
    (map.roads || []).forEach((r, ri) => {
      // solo calles normales con sitio para que pase el tráfico al lado
      if (r.ped || r.major || r.p.length < 2 || r.w < 6) return;
      const side = hash(ri * 7.3) < 0.5 ? 1 : -1;
      let total = 0;
      for (let i = 1; i < r.p.length; i++) total += Math.hypot(r.p[i][0] - r.p[i - 1][0], r.p[i][1] - r.p[i - 1][1]);
      let acc = 0, next = 11;
      for (let i = 1; i < r.p.length; i++) {
        const [ax, az] = r.p[i - 1], [bx, bz] = r.p[i];
        const len = Math.hypot(bx - ax, bz - az);
        if (len < 0.01) continue;
        while (next < acc + len && next < total - 11) {
          const t = (next - acc) / len;
          const ux = (bx - ax) / len, uz = (bz - az) / len;
          const off = r.w / 2 + 0.15;
          const x = ax + (bx - ax) * t + uz * off * side;
          const z = az + (bz - az) * t - ux * off * side;
          id++;
          next += STEP;
          if (hash(id * 3.1) > 0.42) continue;
          if (avoid.some(([qx, qz]) => (qx - x) ** 2 + (qz - z) ** 2 < 49)) continue;
          const { type, color } = pickModel(hash(id * 5.7), hash(id * 9.1));
          if (type === 'taxi') continue;
          // sin meterse en fachadas: se prueba el morro, el centro y la zaga
          if (colliders && [-1.5, 0, 1.5].some(o => colliders.circleContacts(x + ux * o, z + uz * o, 1.0).length)) continue;
          const flip = hash(id * 2.3) < 0.5;
          const heading = Math.atan2(ux, uz) + (flip ? Math.PI : 0);
          // la rueda de la acera queda más alta: se inclina hacia la calzada
          const roll = CURB / 1.55 * side * (flip ? -1 : 1);
          // cx, cz: el centro de la calzada a su altura
          const brand = hash(id * 4.7) < BRAND_SHARE;
          const spot = { id, x, z, heading, roll, type, color, brand, taken: false, cx: x - uz * off * side, cz: z + ux * off * side };
          this.spots.push(spot);
          const k = Math.floor(x / CELL) + ',' + Math.floor(z / CELL);
          if (!this.grid.has(k)) this.grid.set(k, []);
          this.grid.get(k).push(spot);
        }
        acc += len;
      }
    });
  }

  /** coches aparcados que hay ahora mismo en la calle */
  get cars() { return [...this.active.values()]; }

  update(dt, px, pz, extra = []) {
    // los que han recibido un golpe se deslizan hasta pararse
    for (const [spot, car] of this.active) slide(spot, car.group, dt, this.colliders);
    for (const e of extra) if (e.mesh && e.kick) slide(e, e.mesh, dt, this.colliders);

    this.tick -= dt;
    if (this.tick > 0) return;
    this.tick = 0.4;
    const want = [];
    const cx = Math.floor(px / CELL), cz = Math.floor(pz / CELL), r = Math.ceil(NEAR / CELL);
    for (let i = -r; i <= r; i++) {
      for (let j = -r; j <= r; j++) {
        for (const s of this.grid.get((cx + i) + ',' + (cz + j)) || []) {
          if (s.taken) continue;
          const d = Math.hypot(s.x - px, s.z - pz);
          if (d < NEAR) want.push([d, s]);
        }
      }
    }
    want.sort((a, b) => a[0] - b[0]);
    const keep = new Set(want.slice(0, this.max).map(w => w[1]));
    for (const [spot, car] of this.active) {
      if (!keep.has(spot)) { this.scene.remove(car.group); this.active.delete(spot); }
    }
    for (const spot of keep) {
      if (this.active.has(spot)) continue;
      const car = makeCar(spot.type, spot.color, { brand: spot.brand });
      car.group.position.set(spot.x, 0.165, spot.z);
      car.group.rotation.set(0, spot.heading, spot.roll);
      car.group.userData.setLights?.(this.night || 0);
      car.spot = spot;
      this.scene.add(car.group);
      this.active.set(spot, car);
    }
    // de lejos, sin llantas ni matrículas
    for (const [spot, car] of this.active) car.group.userData.setDetail?.(Math.hypot(spot.x - px, spot.z - pz) < 70);
  }

  setLights(night) {
    this.night = night;
    for (const car of this.active.values()) car.group.userData.setLights?.(night);
  }

  /** distancia al aparcado más cercano (Infinity si no hay ninguno) */
  nearest(x, z) {
    let bd = Infinity;
    for (const spot of this.active.keys()) bd = Math.min(bd, Math.hypot(spot.x - x, spot.z - z));
    return bd;
  }

  /** robar el aparcado más cercano: el jugador se queda con el mismo coche */
  take(x, z, maxD = 3.6) {
    let best = null, bd = maxD;
    for (const [spot, car] of this.active) {
      const d = Math.hypot(spot.x - x, spot.z - z);
      if (d < bd) { bd = d; best = [spot, car]; }
    }
    if (!best) return null;
    const [spot, car] = best;
    this.active.delete(spot);
    spot.taken = true;
    car.group.rotation.z = 0;
    car.group.userData.setDetail?.(true);
    return {
      mesh: car.group, body: car.body, wheels: car.wheels, dims: car.dims,
      type: spot.type, color: spot.color, brand: spot.brand, x: spot.x, z: spot.z, heading: spot.heading,
    };
  }

  /**
   * choque contra los aparcados (y contra los coches que ha dejado el
   * jugador): el coche del jugador se mide con tres círculos a lo largo
   * (morro, centro y zaga); a pie, con uno. Devuelve la velocidad del golpe.
   */
  collide(body, isCar, extra = []) {
    const probes = isCar ? [[-1.25, 0.95], [0, 1.0], [1.25, 0.95]] : [[0, 0.35]];
    let hit = 0;
    for (const [spot, c] of this.active) hit = Math.max(hit, push(body, probes, spot, c.dims, isCar));
    for (const e of extra) if (e.dims && e.mesh) hit = Math.max(hit, push(body, probes, e, e.dims, isCar));
    return hit;
  }
}

/** empuja al jugador fuera de la caja del coche parado y le pasa parte del golpe */
function push(body, probes, o, dims, isCar) {
  const dx0 = o.x - body.pos.x, dz0 = o.z - body.pos.y;
  if (dx0 * dx0 + dz0 * dz0 > 64) return 0;
  const fx = Math.sin(body.heading), fz = Math.cos(body.heading);
  const hl = dims.length / 2 + 0.03, hw = dims.width / 2 + 0.03;
  const sx = Math.sin(o.heading), sz = Math.cos(o.heading);
  let hit = 0, kn = null;
  for (const [off, r] of probes) {
    const px = body.pos.x + fx * off, pz = body.pos.y + fz * off;
    // al sistema del coche parado (a lo largo / a lo ancho)
    const rx = px - o.x, rz = pz - o.z;
    const along = rx * sx + rz * sz, side = rx * sz - rz * sx;
    const ca = Math.max(-hl, Math.min(hl, along)), cs = Math.max(-hw, Math.min(hw, side));
    let na = along - ca, ns = side - cs;
    let d = Math.hypot(na, ns);
    if (d >= r) continue;
    if (d < 1e-4) {
      // dentro: sale por el lado más cercano
      if (hl - Math.abs(along) < hw - Math.abs(side)) { na = Math.sign(along) || 1; ns = 0; } else { na = 0; ns = Math.sign(side) || 1; }
      d = 0;
    } else { na /= d; ns /= d; }
    const depth = r - d;
    const wx = na * sx + ns * sz, wz = na * sz - ns * sx; // de vuelta al mundo
    body.pos.x += wx * depth;
    body.pos.y += wz * depth;
    if (!body.vel) continue;
    const vn = body.vel.x * wx + body.vel.y * wz;
    if (vn >= 0) continue;
    hit = Math.max(hit, -vn);
    body.vel.x -= wx * vn * 1.3;
    body.vel.y -= wz * vn * 1.3;
    body.vel.multiplyScalar(isCar ? 0.82 : 0.9);
    if (-vn >= hit) kn = [wx, wz, along * ns - side * na];
  }
  // con el coche, el aparcado se lleva parte del golpe y se desplaza (un empujón por choque)
  if (isCar && hit > 2 && kn) {
    const k = o.kick || (o.kick = { vx: 0, vz: 0, w: 0 });
    k.vx -= kn[0] * hit * 0.22;
    k.vz -= kn[1] * hit * 0.22;
    k.w += kn[2] * hit * 0.04;
  }
  return hit;
}

function slide(o, mesh, dt, colliders) {
  const k = o.kick;
  if (!k) return;
  o.x += k.vx * dt;
  o.z += k.vz * dt;
  o.heading += k.w * dt;
  const f = Math.max(0, 1 - 3.2 * dt);
  k.vx *= f; k.vz *= f; k.w *= f;
  // contra las fachadas se para en seco
  for (const c of colliders?.circleContacts(o.x, o.z, 1.0) || []) {
    o.x += c.nx * c.depth;
    o.z += c.nz * c.depth;
    const vn = k.vx * c.nx + k.vz * c.nz;
    if (vn < 0) { k.vx -= c.nx * vn; k.vz -= c.nz * vn; }
    k.w *= 0.5;
  }
  mesh.position.x = o.x;
  mesh.position.z = o.z;
  mesh.rotation.y = o.heading;
  if (Math.abs(k.vx) + Math.abs(k.vz) + Math.abs(k.w) < 0.02) o.kick = null;
}
