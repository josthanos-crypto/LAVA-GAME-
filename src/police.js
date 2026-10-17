import * as THREE from 'three';
import { makeCar } from './carModels.js';
import { sound } from './sound.js';

/**
 * Policía Local: nivel de búsqueda de 0 a 5 estrellas. Con estrellas salen
 * patrullas que te persiguen por las calles, te embisten, disparan desde
 * 2 estrellas y te detienen si te paras a su lado. Si les das esquinazo un
 * rato, las estrellas bajan.
 */

const LOSE_TIME = 16;      // segundos sin que te vean para bajar una estrella
const SIGHT = 70;          // metros a los que una patrulla te "ve"
const MAX_CARS = 4;

function wrapAngle(a) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

function makePoliceCar() {
  // berlina de la Policía Local: rotulación a cuadros y barra de luces ya vienen con el modelo
  const car = makeCar('police');
  const g = car.group;
  const y = car.dims.roofY + 0.12;
  const red = new THREE.MeshStandardMaterial({ color: 0x400000, emissive: 0xff1010, emissiveIntensity: 0 });
  const blue = new THREE.MeshStandardMaterial({ color: 0x000040, emissive: 0x1030ff, emissiveIntensity: 0 });
  for (const [sx, m] of [[-0.3, blue], [0.3, red]]) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.1, 0.24), m);
    l.position.set(sx, y, -0.25);
    car.body.add(l);
  }
  // luz real que tiñe el entorno de rojo/azul
  const flash = new THREE.PointLight(0x2040ff, 0, 18, 2);
  flash.position.set(0, y + 0.4, -0.25);
  g.add(flash);
  return { ...car, red, blue, flash };
}

class PoliceCar {
  constructor(scene) {
    const c = makePoliceCar();
    Object.assign(this, c);
    this.mesh = c.group;
    this.mesh.visible = false;
    scene.add(this.mesh);
    this.pos = new THREE.Vector2();
    this.vel = new THREE.Vector2();
    this.heading = 0;
    this.steerVis = 0;
    this.spin = 0;
    this.active = false;
    this.hp = 6;
    this.stuck = 0;
    this.reverseT = 0;
    this.fireT = 1 + Math.random();
    this.route = null;   // nodos del grafo de calles
    this.routeIdx = 0;
    this.routeT = 0;
  }

  /**
   * siguiente punto al que dirigirse: de lejos sigue las calles (A*),
   * de cerca va directo a por ti
   */
  steerTarget(dt, graph, tx, tz) {
    const d = Math.hypot(tx - this.pos.x, tz - this.pos.y);
    if (!graph || d < 28) { this.route = null; return [tx, tz]; }
    this.routeT -= dt;
    if (!this.route || this.routeT <= 0) {
      this.route = graph.path(this.pos.x, this.pos.y, tx, tz);
      this.routeIdx = 0;
      this.routeT = 1.5 + Math.random() * 0.5;
      if (!this.route) return [tx, tz];
    }
    const r = this.route;
    // avanza por la ruta: el punto objetivo va ~10 m por delante
    while (this.routeIdx < r.length - 1 &&
      Math.hypot(graph.x[r[this.routeIdx]] - this.pos.x, graph.z[r[this.routeIdx]] - this.pos.y) < 10) this.routeIdx++;
    const n = r[this.routeIdx];
    return [graph.x[n], graph.z[n]];
  }

  get speed() { return this.vel.length(); }
  forward() { return new THREE.Vector2(Math.sin(this.heading), Math.cos(this.heading)); }

  place(x, z, heading) {
    this.pos.set(x, z);
    this.heading = heading;
    this.vel.set(0, 0);
    this.active = true;
    this.hp = 6;
    this.mesh.visible = true;
    this.body.rotation.set(0, 0, 0);
  }

  disable() {
    this.active = false;
    this.mesh.visible = false;
    this.flash.intensity = 0;
  }

  /** conducción tipo arcade hacia un objetivo, con marcha atrás si se atasca */
  drive(dt, tx, tz, colliders, aggressive) {
    if (this.hp <= 0) { this.vel.multiplyScalar(1 - dt * 2); this.integrate(dt, colliders); return; }
    const f = this.forward();
    const toX = tx - this.pos.x, toZ = tz - this.pos.y;
    const dist = Math.hypot(toX, toZ);
    let diff = wrapAngle(Math.atan2(toX, toZ) - this.heading);
    let throttle = dist > 8 ? 1 : (aggressive ? 0.8 : 0.2);
    // con ruta, el objetivo es un punto de paso: no frenar al llegar a él
    if (this.route && dist <= 8) throttle = 0.9;
    if (this.reverseT > 0) {
      this.reverseT -= dt;
      throttle = -1;
      diff = -diff;
    }
    const vf = this.vel.dot(f);
    if (throttle > 0 && Math.abs(vf) < 1.2 && dist > 8) this.stuck += dt; else this.stuck = 0;
    if (this.stuck > 1.6) { this.reverseT = 1.1; this.stuck = 0; }

    const right = new THREE.Vector2(f.y, -f.x);
    let fwd = vf;
    let lat = this.vel.dot(right);
    const maxV = aggressive ? 40 : 30;
    if (throttle > 0) fwd += 15 * throttle * (1 - Math.max(0, fwd) / maxV) * dt;
    else fwd = Math.max(fwd - 12 * dt, -9);
    fwd *= 1 - 0.3 * dt;
    // frena en las curvas cerradas
    if (Math.abs(diff) > 0.9 && fwd > 12) fwd -= 18 * dt;
    const steer = THREE.MathUtils.clamp(diff * 2.2, -1, 1);
    this.steerVis += (steer * 0.6 - this.steerVis) * Math.min(1, dt * 8);
    if (Math.abs(fwd) > 0.1) this.heading += (fwd / 2.7) * Math.tan(this.steerVis) * dt;
    lat *= Math.max(0, 1 - 6 * dt);
    const nf = this.forward();
    this.vel.copy(nf).multiplyScalar(fwd).addScaledVector(new THREE.Vector2(nf.y, -nf.x), lat);
    this.integrate(dt, colliders);
  }

  integrate(dt, colliders) {
    this.pos.addScaledVector(this.vel, dt);
    for (const c of colliders.circleContacts(this.pos.x, this.pos.y, 1.25)) {
      this.pos.x += c.nx * c.depth;
      this.pos.y += c.nz * c.depth;
      const vn = this.vel.x * c.nx + this.vel.y * c.nz;
      if (vn < 0) { this.vel.x -= c.nx * vn * 1.2; this.vel.y -= c.nz * vn * 1.2; this.vel.multiplyScalar(0.85); }
    }
    this.mesh.position.set(this.pos.x, 0.16, this.pos.y);
    this.mesh.rotation.y = this.heading;
    for (let i = 0; i < 2; i++) this.wheels[i].rotation.y = this.steerVis;
    this.spin += this.vel.dot(this.forward()) * dt / 0.34;
    for (const w of this.wheels) w.rotation.x = this.spin;
  }
}

export class Police {
  constructor(scene, roads, colliders, graph = null) {
    this.scene = scene;
    this.graph = graph;
    this.roads = roads.filter(r => !r.ped && r.p.length >= 2);
    this.colliders = colliders;
    this.cars = [];
    for (let i = 0; i < MAX_CARS; i++) this.cars.push(new PoliceCar(scene));
    this.wanted = 0;
    this.lostT = 0;
    this.bustT = 0;
    this.spawnT = 0;
    this.onShoot = null;   // (car) → la patrulla dispara al jugador
    this.onBusted = null;
    this.onSpotted = null; // primera vez que te ven
    this.onHitPlayer = null; // embestida (fuerza)
    this.siren = null;
  }

  add(n) {
    const before = this.wanted;
    this.wanted = Math.min(5, this.wanted + n);
    this.lostT = 0;
    if (before === 0 && this.wanted > 0) this.onSpotted?.();
  }

  clear() {
    this.wanted = 0;
    this.lostT = 0;
    this.bustT = 0;
    for (const c of this.cars) c.disable();
  }

  /** punto de calle a 90–160 m del jugador para que aparezca una patrulla */
  spawnPoint(px, pz) {
    if (this.graph?.size) {
      const g = this.graph;
      const n = g.randomNodeAround(px, pz, 90, 160, true);
      return [g.x[n], g.z[n], Math.atan2(px - g.x[n], pz - g.z[n])];
    }
    for (let k = 0; k < 40; k++) {
      const r = this.roads[Math.floor(Math.random() * this.roads.length)];
      const i = Math.floor(Math.random() * (r.p.length - 1));
      const [ax, az] = r.p[i], [bx, bz] = r.p[i + 1];
      const d = Math.hypot(ax - px, az - pz);
      if (d > 90 && d < 160) return [ax, az, Math.atan2(px - ax, pz - az) + (Math.random() - 0.5) * 0.4, bx, bz];
    }
    return null;
  }

  /** impacto de bala en una patrulla (rayo origen/dirección) */
  hitTest(ox, oz, dx, dz, range) {
    let best = null, bt = range;
    for (const c of this.cars) {
      if (!c.active) continue;
      const rx = c.pos.x - ox, rz = c.pos.y - oz;
      const t = rx * dx + rz * dz;
      if (t < 0 || t > bt) continue;
      if (Math.abs(rx * dz - rz * dx) < 1.3) { bt = t; best = c; }
    }
    return best ? { car: best, dist: bt } : null;
  }

  damage(car) {
    car.hp -= 1;
    if (car.hp === 0) {
      // patrulla inutilizada: humo negro simulado oscureciendo la carrocería
      const darken = (m) => {
        if (!m?.color || m === car.red || m === car.blue) return m;
        const c = m.clone();
        c.color.multiplyScalar(0.3);
        return c;
      };
      // la carrocería lleva varios materiales (pintura, plásticos, cristales)
      car.body.traverse(o => {
        if (!o.isMesh) return;
        o.material = Array.isArray(o.material) ? o.material.map(darken) : darken(o.material);
      });
      this.add(1);
    }
  }

  update(dt, player, ctx) {
    const px = player.pos.x, pz = player.pos.y;
    const t = performance.now() * 0.001;
    const want = Math.min(MAX_CARS, this.wanted === 0 ? 0 : this.wanted <= 1 ? 1 : this.wanted);

    // aparecer / retirar patrullas
    const active = this.cars.filter(c => c.active);
    this.spawnT -= dt;
    if (active.length < want && this.spawnT <= 0) {
      const sp = this.spawnPoint(px, pz);
      const free = this.cars.find(c => !c.active);
      if (sp && free) { free.place(sp[0], sp[1], sp[2]); this.spawnT = 2.5; }
    }
    if (this.wanted === 0) {
      for (const c of active) if (Math.hypot(c.pos.x - px, c.pos.y - pz) > 60 || c.hp <= 0) c.disable();
    }

    let seen = false, nearest = Infinity;
    for (const c of this.cars) {
      if (!c.active) continue;
      const d = Math.hypot(c.pos.x - px, c.pos.y - pz);
      if (this.wanted > 0) {
        // anticipa hacia dónde vas (corta el paso)
        const lead = Math.min(1.2, d / 30);
        const [tx, tz] = c.steerTarget(dt, this.graph, px + player.vel.x * lead, pz + player.vel.y * lead);
        c.drive(dt, tx, tz, this.colliders, this.wanted >= 3);
      } else {
        c.drive(dt, c.pos.x + Math.sin(c.heading) * 50, c.pos.y + Math.cos(c.heading) * 50, this.colliders, false);
      }
      if (d > 600) c.disable();
      if (c.hp > 0) { if (d < SIGHT) seen = true; nearest = Math.min(nearest, d); }

      // rotativos alternos
      const on = this.wanted > 0 && c.hp > 0;
      const ph = Math.floor(t * 6) % 2;
      c.red.emissiveIntensity = on && ph ? 6 : 0;
      c.blue.emissiveIntensity = on && !ph ? 6 : 0;
      c.flash.color.setHex(ph ? 0xff2020 : 0x2040ff);
      c.flash.intensity = on ? 25 : 0;

      // choque con el jugador
      if (d < 2.8) {
        const nx = (px - c.pos.x) / (d || 1), nz = (pz - c.pos.y) / (d || 1);
        const push = 2.8 - d;
        player.pos.x += nx * push * 0.6;
        player.pos.y += nz * push * 0.6;
        const rel = (c.vel.x - player.vel.x) * nx + (c.vel.y - player.vel.y) * nz;
        if (rel > 4) {
          player.vel.x += nx * rel * 0.8;
          player.vel.y += nz * rel * 0.8;
          c.vel.multiplyScalar(0.5);
          this.onHitPlayer?.(rel);
        }
      }

      // disparos desde la patrulla a partir de 2 estrellas
      if (this.wanted >= 2 && c.hp > 0 && d < 32) {
        c.fireT -= dt;
        if (c.fireT <= 0) { c.fireT = 0.7 + Math.random() * 0.9; this.onShoot?.(c, d); }
      }
    }

    if (this.wanted > 0) {
      // detención: patrulla pegada y tú parado
      if (nearest < 6 && ctx.playerSpeed < 1.5) {
        this.bustT += dt;
        if (this.bustT > 2) { this.bustT = 0; this.onBusted?.(); }
      } else this.bustT = Math.max(0, this.bustT - dt);
      // darles esquinazo
      if (seen) this.lostT = 0;
      else {
        this.lostT += dt;
        if (this.lostT > LOSE_TIME) { this.wanted -= 1; this.lostT = 0; }
      }
    }
    this.updateSiren(this.wanted > 0 && nearest < 220, nearest);
    return { seen, nearest, bustProgress: this.bustT / 2 };
  }

  /** sirena sintetizada (sube y baja), más fuerte cuanto más cerca */
  updateSiren(on, dist) {
    const ctx = sound.ctx;
    if (!ctx) return;
    if (!this.siren) {
      if (!on) return;
      const osc = ctx.createOscillator();
      osc.type = 'square';
      const gain = ctx.createGain();
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 1800;
      osc.connect(lp).connect(gain).connect(sound.out);
      gain.gain.value = 0;
      osc.start();
      this.siren = { osc, gain };
    }
    const { osc, gain } = this.siren;
    const tt = ctx.currentTime;
    osc.frequency.setTargetAtTime(Math.sin(tt * 2.2) > 0 ? 960 : 720, tt, 0.05);
    const vol = on ? Math.max(0, 0.13 * (1 - dist / 220)) : 0;
    gain.gain.setTargetAtTime(vol, tt, 0.2);
  }
}
