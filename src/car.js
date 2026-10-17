import * as THREE from 'three';
import { makeCar, DRIVE } from './carModels.js';

// la tanqueta de agua pesa: acelera poco, gira más abierto y es más ancha
const SPECS = {
  default: { MAX_STEER: 0.62, WHEELBASE: 2.7, ENGINE: 14, BRAKE: 22, MAX_SPEED: 47, RADIUS: 1.25 },
  tanqueta: { MAX_STEER: 0.55, WHEELBASE: 4.6, ENGINE: 7, BRAKE: 15, MAX_SPEED: 24, RADIUS: 2.1 },
};

export class PlayerCar {
  constructor(scene, x, z, heading) {
    // el deportivo del jugador va rotulado: es el coche que más se ve
    const { group, body, wheels, dims } = makeCar('sport', 0xd8271c, { brand: true });
    this.scene = scene;
    this.dims = dims;
    this.type = 'sport';
    this.color = 0xd8271c;
    this.brand = true;
    this.mesh = group;
    this.body = body;
    this.wheels = wheels;
    scene.add(group);

    this.pos = new THREE.Vector2(x, z);
    this.heading = heading;
    this.vel = new THREE.Vector2(0, 0);
    this.steerVis = 0;
    this.wheelSpin = 0;
    this.crashPulse = 0;
    this.setSpecs(this.type);
  }

  setSpecs(type) {
    // MAX_STEER, WHEELBASE, ENGINE (m/s^2), BRAKE, MAX_SPEED (~170 km/h), RADIUS
    Object.assign(this, SPECS.default, DRIVE[type] || {}, SPECS[type] || {});
  }

  forward() { return new THREE.Vector2(Math.sin(this.heading), Math.cos(this.heading)); }

  get speed() { return this.vel.length(); }
  get forwardSpeed() { return this.vel.dot(this.forward()); }

  update(dt, input, colliders, bounds) {
    const f = this.forward();
    const right = new THREE.Vector2(f.y, -f.x);
    let vf = this.vel.dot(f);
    let vl = this.vel.dot(right);

    // throttle / brake / reverse
    const th = input.throttle;
    if (th > 0) vf += this.ENGINE * (1 - Math.max(0, vf) / this.MAX_SPEED) * dt;
    else if (th < 0) {
      if (vf > 0.5) vf -= this.BRAKE * dt;
      else vf = Math.max(vf - this.ENGINE * 0.55 * dt, -11);
    }
    // drag + rolling resistance
    vf -= vf * 0.045 * dt * Math.abs(vf) * 0.09;
    vf *= (1 - 0.35 * dt);
    if (th === 0 && Math.abs(vf) < 0.25) vf = 0;

    // steering (less lock at speed)
    const lock = this.MAX_STEER / (1 + Math.abs(vf) * 0.045);
    const target = input.steer * lock;
    this.steerVis += (target - this.steerVis) * Math.min(1, dt * 8);
    if (Math.abs(vf) > 0.1) {
      this.heading += (vf / this.WHEELBASE) * Math.tan(this.steerVis) * dt;
    }

    // lateral grip (drift on handbrake)
    const grip = input.handbrake ? 1.6 : 7.5;
    vl *= Math.max(0, 1 - grip * dt);
    if (input.handbrake) vf *= (1 - 0.55 * dt);

    const nf = this.forward();
    const nright = new THREE.Vector2(nf.y, -nf.x);
    this.vel.copy(nf.multiplyScalar(vf)).addScaledVector(nright, vl);

    this.pos.addScaledVector(this.vel, dt);

    // building collisions
    const contacts = colliders.circleContacts(this.pos.x, this.pos.y, this.RADIUS);
    for (const c of contacts) {
      this.pos.x += c.nx * c.depth;
      this.pos.y += c.nz * c.depth;
      const vn = this.vel.x * c.nx + this.vel.y * c.nz;
      if (vn < 0) {
        if (vn < -8) this.crashPulse = 1;
        this.vel.x -= c.nx * vn * 1.25;
        this.vel.y -= c.nz * vn * 1.25;
        this.vel.multiplyScalar(0.86);
      }
    }

    // map bounds
    const M = 120;
    if (this.pos.x < bounds.minX - M) { this.pos.x = bounds.minX - M; this.vel.x = Math.abs(this.vel.x) * 0.3; }
    if (this.pos.x > bounds.maxX + M) { this.pos.x = bounds.maxX + M; this.vel.x = -Math.abs(this.vel.x) * 0.3; }
    if (this.pos.y < bounds.minZ - M) { this.pos.y = bounds.minZ - M; this.vel.y = Math.abs(this.vel.y) * 0.3; }
    if (this.pos.y > bounds.maxZ + M) { this.pos.y = bounds.maxZ + M; this.vel.y = -Math.abs(this.vel.y) * 0.3; }

    // visuals (0.16 = modeled road surface height)
    this.mesh.position.set(this.pos.x, 0.16, this.pos.y);
    this.mesh.rotation.y = this.heading;

    this.wheelSpin += vf * dt / (this.dims?.wheelR || 0.34);
    this.wheels.forEach((w, i) => {
      w.rotation.x = this.wheelSpin;
      if (i < 2) w.rotation.y = this.steerVis;
    });

    const latG = (vl * Math.abs(vf)) * 0.004;
    this.crashPulse = Math.max(0, this.crashPulse - dt * 3);
    this.body.rotation.z += ((latG * 1.4) - this.body.rotation.z) * dt * 6;
    this.body.rotation.x += ((-th * 0.02 * Math.min(1, Math.abs(vf) / 8)) - this.body.rotation.x) * dt * 5;
    this.body.position.y = Math.sin(performance.now() * 0.05) * 0.02 * this.crashPulse;
  }

  placeAt(x, z, heading) {
    this.pos.set(x, z);
    this.heading = heading;
    this.vel.set(0, 0);
  }

  // deja el coche actual aparcado y devuelve su ficha para poder volver a entrar
  detach() {
    return {
      mesh: this.mesh, body: this.body, wheels: this.wheels, dims: this.dims,
      type: this.type, color: this.color, brand: this.brand,
      x: this.pos.x, z: this.pos.y, heading: this.heading,
      reach: this.type === 'tanqueta' ? 6 : undefined,
    };
  }

  // toma posesión de un coche (aparcado o robado)
  adopt(entry) {
    if (entry.mesh) {
      this.mesh = entry.mesh;
      this.body = entry.body;
      this.wheels = entry.wheels;
      this.dims = entry.dims;
    } else {
      const { group, body, wheels, dims } = makeCar(entry.type, entry.color, { brand: entry.brand });
      this.mesh = group;
      this.body = body;
      this.wheels = wheels;
      this.dims = dims;
      this.scene.add(group);
    }
    this.type = entry.type;
    this.color = entry.color;
    this.brand = !!entry.brand;
    this.setSpecs(this.type);
    this.placeAt(entry.x, entry.z, entry.heading);
    this.mesh.position.set(entry.x, 0.16, entry.z);
    this.mesh.rotation.y = entry.heading;
  }
}
