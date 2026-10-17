import * as THREE from 'three';
import { randomTrafficCar } from './carModels.js';

const N_CARS = 26;

function endKey(p) { return Math.round(p[0]) + ',' + Math.round(p[1]); }

export class Traffic {
  constructor(scene, roads) {
    this.roads = roads.filter(r => !r.ped);
    // graph: endpoint key -> [{road, fromStart}]
    this.graph = new Map();
    for (const r of this.roads) {
      if (r.p.length < 2) continue;
      const a = endKey(r.p[0]), b = endKey(r.p[r.p.length - 1]);
      if (!this.graph.has(a)) this.graph.set(a, []);
      if (!this.graph.has(b)) this.graph.set(b, []);
      this.graph.get(a).push({ road: r, reverse: false });
      this.graph.get(b).push({ road: r, reverse: true });
    }

    this.cars = [];
    for (let i = 0; i < N_CARS; i++) {
      const { group, type, color, brand } = randomTrafficCar();
      group.visible = false;
      scene.add(group);
      this.cars.push({ mesh: group, type, color, brand, road: null, seg: 0, t: 0, reverse: false, speed: 8, x: 0, z: 0, heading: 0, stopped: 0 });
    }
  }

  // roba el coche más cercano: lo quita del tráfico y devuelve su modelo
  jackNearest(x, z, maxD = 4) {
    let best = null, bd = maxD;
    for (const c of this.cars) {
      if (!c.road) continue;
      const d = Math.hypot(c.x - x, c.z - z);
      if (d < bd) { bd = d; best = c; }
    }
    if (!best) return null;
    const info = { type: best.type, color: best.color, brand: best.brand, x: best.x, z: best.z, heading: best.heading };
    best.road = null;
    best.mesh.visible = false;
    return info;
  }

  /** el conductor frena en seco y se queda parado unos segundos (disparos, choques) */
  panic(car, seconds = 8) {
    car.stopped = Math.max(car.stopped, seconds);
  }

  spawnNear(car, px, pz) {
    for (let tries = 0; tries < 30; tries++) {
      const r = this.roads[Math.floor(Math.random() * this.roads.length)];
      const [x, z] = r.p[0];
      const d = Math.hypot(x - px, z - pz);
      if (d > 120 && d < 450) {
        car.road = r;
        car.reverse = Math.random() < 0.5;
        car.seg = 0;
        car.t = Math.random();
        car.speed = (r.major ? 11 : 7) * (0.85 + Math.random() * 0.3);
        car.stopped = 0;
        car.mesh.visible = true;
        return;
      }
    }
    car.mesh.visible = false;
    car.road = null;
  }

  pathPoint(car, segIdx) {
    const pts = car.road.p;
    return car.reverse ? pts[pts.length - 1 - segIdx] : pts[segIdx];
  }

  advance(car, dt) {
    const pts = car.road.p;
    const nSegs = pts.length - 1;
    let remaining = car.speed * dt;
    let guard = 0;
    while (remaining > 0 && guard++ < 12) {
      const a = this.pathPoint(car, car.seg);
      const b = this.pathPoint(car, car.seg + 1);
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 0.001;
      const distLeft = (1 - car.t) * len;
      if (remaining < distLeft) {
        car.t += remaining / len;
        remaining = 0;
      } else {
        remaining -= distLeft;
        car.seg++;
        car.t = 0;
        if (car.seg >= nSegs) {
          const endPt = car.reverse ? car.road.p[0] : car.road.p[car.road.p.length - 1];
          const options = this.graph.get(endKey(endPt)) || [];
          const usable = options.filter(o => o.road !== car.road);
          const next = usable.length ? usable[Math.floor(Math.random() * usable.length)]
            : options[0];
          if (!next) { car.road = null; return; }
          car.road = next.road;
          car.reverse = next.reverse;
          car.seg = 0;
          car.t = 0;
          car.speed = (car.road.major ? 11 : 7) * (0.85 + Math.random() * 0.3);
        }
      }
    }
    const a = this.pathPoint(car, car.seg);
    const b = this.pathPoint(car, car.seg + 1);
    const lane = car.road.w * 0.22;
    const dx = b[0] - a[0], dz = b[1] - a[1];
    const len = Math.hypot(dx, dz) || 0.001;
    const nx = -dz / len, nz = dx / len;
    car.x = a[0] + dx * car.t - nx * lane;
    car.z = a[1] + dz * car.t - nz * lane;
    car.heading = Math.atan2(dx, dz);
  }

  update(dt, player) {
    const px = player.pos.x, pz = player.pos.y;
    for (const car of this.cars) {
      if (!car.road) { this.spawnNear(car, px, pz); continue; }

      if (car.stopped > 0) car.stopped -= dt;
      else this.advance(car, dt);
      if (!car.road) continue;

      const d = Math.hypot(car.x - px, car.z - pz);
      if (d > 650) { this.spawnNear(car, px, pz); continue; }

      // bump player
      if (d < 2.6) {
        let nx = px - car.x, nz = pz - car.z;
        const nd = Math.hypot(nx, nz) || 1;
        nx /= nd; nz /= nd;
        const push = (2.6 - d);
        player.pos.x += nx * push * 0.7;
        player.pos.y += nz * push * 0.7;
        const vn = player.vel.x * nx + player.vel.y * nz;
        if (vn < 0) {
          player.vel.x -= nx * vn * 1.4;
          player.vel.y -= nz * vn * 1.4;
          player.vel.multiplyScalar(0.8);
          if (vn < -6) { player.crashPulse = 1; this.panic(car, 6); }
        }
      }

      car.mesh.position.set(car.x, 0.16, car.z);
      car.mesh.rotation.y = car.heading;
      // lejos: sin detalles; muy lejos: ni se dibuja
      car.mesh.visible = d < 330;
      car.mesh.userData.setDetail?.(d < 70);
    }
  }
}
