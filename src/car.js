import * as THREE from 'three';
import { makeCar, DRIVE } from './carModels.js';
import { terrainY } from './terrain.js';
import { addIndicators } from './carKit.js';
import { walkRise } from './aceras.js';

// cuestas: la gravedad frena subiendo y empuja bajando. Algo exagerada (×1,25), que sumada al relieve x2 del
// dibujo (terrain.js) hace que las cuestas de tierra adentro se noten como se ven
const SLOPE_G = 9.81 * 1.25;
// sin acelerar, el rozamiento de las ruedas (m/s²): en las cuestas suaves el coche acaba parándose
const ROLL = 0.6;
// en los cambios de rasante, a mucha velocidad, el coche se despega del suelo y cae con esta gravedad
const AIR_G = 11;
// suspensión: muelle (rad/s) y amortiguación de la carrocería, y lo rápido que la rueda sube el bordillo
const SPRING = 15, DAMP = 0.3, TIRE = 28;
// turbo salto (los coches con JUMP, como el roadster): sube hasta 20 m y vuelve a caer en unos 4 s, como el
// turbo del coche fantástico. En el aire se puede corregir un poco (acelerar, frenar y girar despacio)
// para caer en un tejado
const JUMP_H = 20, JUMP_G = 9.81;
const AIR_ACCEL = 4, AIR_BRAKE = 9, AIR_TURN = 0.5;
// tejados (tejados.js): se conduce por encima; se sube un escalón de hasta 70 cm, la azotea se pinta a la
// altura del edificio (el coche, 14 cm más abajo que en la calzada) y por encima de 1,2 m sobre la calle solo
// chocan las paredes de los edificios más altos que el coche
const ROOF_STEP = 0.7, ROOF_SINK = 0.14, HIGH = 1.2;

// la tanqueta de agua pesa: acelera poco, gira más abierto y es más ancha
const SPECS = {
  default: { MAX_STEER: 0.62, WHEELBASE: 2.7, ENGINE: 14, BRAKE: 22, MAX_SPEED: 47, RADIUS: 1.25, JUMP: 0, LEAN: 0 },
  tanqueta: { MAX_STEER: 0.55, WHEELBASE: 4.6, ENGINE: 7, BRAKE: 15, MAX_SPEED: 24, RADIUS: 2.1 },
};

export class PlayerCar {
  constructor(scene, x, z, heading, type = 'sport', color = 0xd8271c) {
    // el coche del jugador: el deportivo rotulado de siempre, o el modelo y color
    // que haya elegido en la pantalla de inicio (solo el deportivo lleva la marca)
    const brand = type === 'sport';
    const { group, body, wheels, dims } = makeCar(type, color, { brand });
    this.scene = scene;
    this.dims = dims;
    this.type = type;
    this.color = color;
    this.brand = brand;
    this.mesh = group;
    this.body = body;
    this.wheels = wheels;
    addIndicators(group);
    scene.add(group);

    this.pos = new THREE.Vector2(x, z);
    this.heading = heading;
    this.vel = new THREE.Vector2(0, 0);
    this.steerVis = 0;
    this.wheelSpin = 0;
    this.crashPulse = 0;
    this.resetGround();
    this.setSpecs(this.type);
  }

  // altura sobre el suelo: se recalcula de cero (al empezar o al aparecer en otro sitio)
  resetGround() {
    this.slope = 0;     // pendiente hacia delante (0,1 = sube un 10 %)
    this.y = null;      // altura del coche (m)
    this.vy = 0;
    this.air = 0;       // altura sobre la calle (m): en un salto o en un tejado
    this.gap = 0;       // cuánto va despegado de lo que pisa, calle o tejado (m)
    this.landPulse = 0; // amortiguación al caer
    this.landed = 0;    // fuerza del aterrizaje en este fotograma (0..1), para el sonido
    this.jump = null;   // turbo salto en marcha: { t, T }
  }

  setSpecs(type) {
    // MAX_STEER, WHEELBASE, ENGINE (m/s^2), BRAKE, MAX_SPEED (~170 km/h), RADIUS
    Object.assign(this, SPECS.default, DRIVE[type] || {}, SPECS[type] || {});
  }

  forward() { return new THREE.Vector2(Math.sin(this.heading), Math.cos(this.heading)); }

  get speed() { return this.vel.length(); }
  get forwardSpeed() { return this.vel.dot(this.forward()); }

  /**
   * el turbo salto: hacia arriba y, si ibas hacia delante, con un empujón. Se puede caer en un tejado y
   * seguir conduciendo por encima; contra un edificio más alto, el coche choca y resbala por la pared.
   * Devuelve false si ahora no se puede (este coche no lo lleva, o ya está en el aire).
   */
  boost() {
    if (!this.JUMP || this.jump || this.y === null || this.gap > 0.3) return false;
    const T = 2 * Math.sqrt(2 * JUMP_H / JUMP_G);
    const f = this.forward();
    const vf = this.vel.dot(f);
    this.vel.copy(f.multiplyScalar(vf > 1 ? Math.min(this.MAX_SPEED * 0.7, vf + 6) : 0));
    this.vy = Math.sqrt(2 * JUMP_G * JUMP_H);
    this.jump = { t: 0, T };
    return true;
  }

  /** lo que pisa el coche en (x, z): la calle, o la azotea si el coche va a su altura (o por encima) */
  surfaceAt(x, z) {
    const t = terrainY(x, z);
    if (!this.roofs || this.y === null) return t;
    const h = this.roofs.heightAt(x, z);
    return h > 0 && this.y >= t + h - ROOF_SINK - ROOF_STEP ? t + h - ROOF_SINK : t;
  }

  update(dt, input, colliders, bounds) {
    const f = this.forward();
    const right = new THREE.Vector2(f.y, -f.x);
    let vf = this.vel.dot(f);
    let vl = this.vel.dot(right);
    // en pleno turbo salto: el coche vuela y solo se corrige un poco la velocidad y el rumbo
    if (this.jump) {
      this.jump.t += dt;
      const th = input.throttle;
      vf = Math.max(0, Math.min(this.MAX_SPEED * 0.7, vf + (th > 0 ? AIR_ACCEL : th < 0 ? -AIR_BRAKE : 0) * Math.abs(th) * dt));
      if (vf > 0.1) this.heading += input.steer * AIR_TURN * dt;
      this.vel.copy(this.forward().multiplyScalar(vf));
      this.flight(dt, colliders);
      this.afterMove(dt, bounds, vf, 0, 0);
      return;
    }

    // throttle / brake / reverse
    const th = input.throttle;
    if (th > 0) vf += this.ENGINE * (1 - Math.max(0, vf) / this.MAX_SPEED) * dt;
    else if (th < 0) {
      if (vf > 0.5) vf -= this.BRAKE * dt;
      else vf = Math.max(vf - this.ENGINE * 0.55 * dt, -11);
    }
    // cuestas: sin acelerar, el coche rueda cuesta abajo, pero parado no se va solo (lo sujeta el redondeo a 0)
    const hill = SLOPE_G * this.slope / Math.sqrt(1 + this.slope * this.slope) * dt;
    vf -= hill;
    if (th === 0) vf -= Math.sign(vf) * Math.min(Math.abs(vf), ROLL * dt);
    // drag + rolling resistance
    vf -= vf * 0.045 * dt * Math.abs(vf) * 0.09;
    vf *= (1 - 0.35 * dt);
    if (th === 0 && Math.abs(vf) < 0.25 + Math.abs(hill)) vf = 0;

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

    this.collide(dt, colliders);
    this.afterMove(dt, bounds, vf, vl, th);
  }

  /** en el aire: sigue su vuelo y solo le frenan las paredes que quedan por encima (collide) */
  flight(dt, colliders) {
    this.collide(dt, colliders);
  }

  // choques con los edificios: círculos a lo largo del coche (morro, centro y culo) y en
  // pasos cortos, así ni el morro ni el culo se meten en las paredes, tampoco yendo deprisa
  collide(dt, colliders) {
    const { circles } = this.hitShape();
    const steps = Math.min(10, Math.max(1, Math.ceil(this.vel.length() * dt / 0.45)));
    const hs = Math.sin(this.heading), hc = Math.cos(this.heading);
    for (let s = 0; s < steps; s++) {
      this.pos.addScaledVector(this.vel, dt / steps);
      for (let pass = 0; pass < 2; pass++) {
        let hit = false;
        for (const h of circles) {
          const cx = this.pos.x + hs * h.o + hc * h.l, cz = this.pos.y + hc * h.o - hs * h.l;
          // en un salto o en un tejado, solo las paredes de los edificios que sobresalen por encima del coche
          // (al despegar, ni farolas ni bolardos ni muretes frenan el salto)
          const high = this.roofs && (this.jump || this.air > HIGH);
          const contacts = high ? this.roofs.contacts(cx, cz, h.r, this.air + ROOF_STEP) : colliders.circleContacts(cx, cz, h.r);
          for (const c of contacts) {
            hit = true;
            this.pos.x += c.nx * c.depth;
            this.pos.y += c.nz * c.depth;
            const vn = this.vel.x * c.nx + this.vel.y * c.nz;
            // subiendo en el turbo salto, la fachada no le quita la velocidad: trepa por ella y, al pasar el
            // tejado, sigue hacia delante y cae encima; bajando, la pared sí lo frena
            if (vn < 0 && !(this.jump && this.vy > 0)) {
              if (vn < -8) this.crashPulse = 1;
              this.vel.x -= c.nx * vn * 1.25;
              this.vel.y -= c.nz * vn * 1.25;
              this.vel.multiplyScalar(0.86);
            }
          }
        }
        if (!hit) break;
      }
    }
  }

  /** límites del mapa, suelo, suspensión y lo que se ve (ruedas, balanceo, cabeceo) */
  afterMove(dt, bounds, vf, vl, th) {
    // map bounds
    const M = 120;
    if (this.pos.x < bounds.minX - M) { this.pos.x = bounds.minX - M; this.vel.x = Math.abs(this.vel.x) * 0.3; }
    if (this.pos.x > bounds.maxX + M) { this.pos.x = bounds.maxX + M; this.vel.x = -Math.abs(this.vel.x) * 0.3; }
    if (this.pos.y < bounds.minZ - M) { this.pos.y = bounds.minZ - M; this.vel.y = Math.abs(this.vel.y) * 0.3; }
    if (this.pos.y > bounds.maxZ + M) { this.pos.y = bounds.maxZ + M; this.vel.y = -Math.abs(this.vel.y) * 0.3; }

    this.followGround(dt);
    this.suspension(dt);

    // visuals (0.16 = modeled road surface height); la inclinación la pone el terreno al dibujar (terrain.js)
    this.mesh.position.set(this.pos.x, 0.16 + this.air, this.pos.y);
    this.mesh.rotation.y = this.heading;

    this.wheelSpin += vf * dt / (this.dims?.wheelR || 0.34);
    this.wheels.forEach((w, i) => {
      w.rotation.x = this.wheelSpin;
      if (i < 2) w.rotation.y = this.steerVis;
    });

    const latG = (vl * Math.abs(vf)) * 0.004;
    this.crashPulse = Math.max(0, this.crashPulse - dt * 3);
    const sus = this.sus;
    // los coches se balancean hacia fuera de la curva; la moto (LEAN) se inclina hacia dentro, más cuanto más
    // deprisa (parada, recta)
    const roll = this.LEAN ? -this.steerVis * Math.min(1, Math.abs(vf) / 10) * 0.85 : latG * 1.4;
    this.rollVis = (this.rollVis || 0) + (roll - (this.rollVis || 0)) * dt * 6;
    this.body.rotation.z = this.rollVis + (this.LEAN ? 0 : sus.r);
    // en el aire el morro cae un poco; al aterrizar la suspensión se hunde y se recupera.
    // En el turbo salto sube con el morro arriba y baja con el morro abajo
    const nose = this.jump ? Math.max(-0.16, Math.min(0.12, -this.vy * 0.008))
      : -th * 0.02 * Math.min(1, Math.abs(vf) / 8) + Math.min(0.06, this.gap * 0.15) + this.landPulse * 0.035;
    this.noseVis = (this.noseVis || 0) + (nose - (this.noseVis || 0)) * dt * 5;
    this.body.rotation.x = this.noseVis + sus.p;
    this.body.position.y = Math.sin(performance.now() * 0.05) * 0.02 * this.crashPulse - this.landPulse * 0.09 + sus.y;
  }

  /**
   * el coche sobre el terreno: la pendiente entre el morro y el culo (para la gravedad de las cuestas,
   * la cámara y el motor) y la altura, que sigue el suelo salvo en los cambios de rasante a mucha
   * velocidad, donde el suelo baja más deprisa de lo que cae el coche y este despega un poco
   */
  followGround(dt) {
    const f = this.forward(), d = this.dims || {};
    const zf = d.zf ?? 2.2, zr = d.zr ?? -2.2;
    const x = this.pos.x, z = this.pos.y;
    // lo que pisa (calle o azotea) en el centro, el morro y el culo; si el morro o el culo quedan fuera del
    // tejado (o en otro más alto), no cuentan para la cuesta: así el coche no se tuerce en el borde
    const hc = this.surfaceAt(x, z);
    const near = (h) => (Math.abs(h - hc) < 2 ? h : hc);
    const hf = near(this.surfaceAt(x + f.x * zf, z + f.y * zf)), hb = near(this.surfaceAt(x + f.x * zr, z + f.y * zr));
    const ground = (hf + hb + 2 * hc) / 4;
    const street = terrainY(x, z);
    this.slope = (hf - hb) / (zf - zr);
    this.landed = 0;
    this.landPulse = Math.max(0, this.landPulse - dt * 3.5);
    // al empezar o tras un salto de sitio (mapa, entrar en otro coche...), directo al suelo
    if (this.y === null || this.y < ground - 4 || dt <= 0) {
      this.y = ground;
      this.vy = 0;
      this.ground = ground;
      this.air = this.y - street;
      this.gap = 0;
      return;
    }
    // a qué velocidad sube o baja el suelo bajo el coche (un escalón de tejado no cuenta: no lanza el coche)
    const step = ground - this.ground;
    const vg = Math.abs(step) > 0.3 ? 0 : step / dt;
    this.ground = ground;
    this.vy -= (this.jump ? JUMP_G : AIR_G) * dt;
    this.y += this.vy * dt;
    if (this.y <= ground) {
      const hit = vg - this.vy;   // velocidad con la que cae contra el suelo
      if (this.jump) {
        // el turbo amortigua la caída: se hunde la suspensión, suena el golpe y a seguir
        this.jump = null;
        this.landPulse = 0.85;
        this.landed = 0.8;
        this.crashPulse = Math.max(this.crashPulse, 0.25);
      } else if (this.gap > 0.05 && hit > 2) {
        this.landPulse = Math.min(1, hit / 6);
        this.landed = Math.min(1, hit / 9);
        this.crashPulse = Math.max(this.crashPulse, Math.min(0.6, hit / 12));
      }
      this.y = ground;
      this.vy = vg;
    }
    this.gap = this.y - ground;
    this.air = this.y - street;
  }

  /**
   * suspensión: cada rueda mira si pisa acera (10 cm más alta que la calzada, aceras.js) y sube con
   * ella; la carrocería la sigue con muelle y amortiguador: sube, cabecea si solo suben las de
   * delante y se inclina si solo suben las de un lado. Pegar el bordillo deprisa da un golpe.
   */
  suspension(dt) {
    const sus = this.sus || (this.sus = { y: 0, vy: 0, p: 0, vp: 0, r: 0, vr: 0, h: [] });
    const d = this.dims || {};
    const hs = Math.sin(this.heading), hc = Math.cos(this.heading);
    const wz = d.wheelZ || [1.35, -1.3], hw = (d.width || 1.8) / 2 - 0.15;
    // las ruedas del modelo (o cuatro esquinas, si el vehículo no las tiene a mano)
    const ws = this.wheels.filter(w => w.pivot);
    const pts = ws.length ? ws.map(w => [w.x, w.z]) : [[hw, wz[0]], [-hw, wz[0]], [hw, wz[1]], [-hw, wz[1]]];
    let F = 0, R = 0, L = 0, Rt = 0, nF = 0, nR = 0, nL = 0, nRt = 0, bump = 0;
    const speed = Math.abs(this.forwardSpeed);
    pts.forEach(([lx, lz], i) => {
      const x = this.pos.x + hs * lz + hc * lx, z = this.pos.y + hc * lz - hs * lx;
      const target = this.air > HIGH ? 0 : walkRise(x, z);   // en un tejado no hay aceras
      const h0 = sus.h[i] ?? target;
      if (target > h0 + 0.05) bump = Math.max(bump, speed);
      const h = h0 + (target - h0) * Math.min(1, dt * TIRE);
      sus.h[i] = h;
      if (ws[i]) ws[i].pivot.position.y = ws[i].base + h;
      if (lz > 0) { F += h; nF++; } else { R += h; nR++; }
      if (lx > 0) { L += h; nL++; } else { Rt += h; nRt++; }
    });
    F /= nF || 1; R /= nR || 1; L /= nL || 1; Rt /= nRt || 1;
    const ty = (F + R) / 2;
    const tp = -(F - R) / Math.max(1, wz[0] - wz[1]);
    const tr = (L - Rt) / Math.max(0.8, 2 * hw);
    // el golpe del bordillo: la carrocería salta un poco, suena y el coche pierde algo de velocidad
    if (bump > 2.5) {
      sus.vy += Math.min(0.7, bump * 0.035);
      this.landed = Math.max(this.landed, Math.min(0.55, bump / 22));
      this.crashPulse = Math.max(this.crashPulse, Math.min(0.3, bump / 45));
      this.vel.multiplyScalar(1 - Math.min(0.1, bump * 0.005));
    }
    const n = Math.max(1, Math.ceil(dt / 0.016)), h = dt / n;
    const step = (x, v, t) => { v += (SPRING * SPRING * (t - x) - 2 * DAMP * SPRING * v) * h; return [x + v * h, v]; };
    for (let k = 0; k < n; k++) {
      [sus.y, sus.vy] = step(sus.y, sus.vy, ty);
      [sus.p, sus.vp] = step(sus.p, sus.vp, tp);
      [sus.r, sus.vr] = step(sus.r, sus.vr, tr);
    }
  }

  /**
   * círculos de choque según el modelo: unos grandes a lo largo del coche y uno pequeño en
   * cada esquina, para que al girar contra una pared tampoco entren las esquinas.
   * o: hacia delante, l: hacia un lado (m)
   */
  hitShape() {
    if (this._hit?.dims === this.dims && this._hit.R === this.RADIUS) return this._hit;
    const d = this.dims || {};
    const zf = d.zf ?? 2.2, zr = d.zr ?? -2.2, hw = (d.width || 1.8) / 2;
    const r = Math.min(this.RADIUS, hw + 0.12);
    const span = Math.max(0, zf - zr - 2 * r);
    const n = Math.max(1, Math.ceil(span / (r * 1.2)) + 1);
    const circles = Array.from({ length: n }, (_, i) => ({ o: zr + r + (n > 1 ? span * i / (n - 1) : span / 2), l: 0, r }));
    const rc = Math.min(0.3, hw * 0.4);
    for (const o of [zr + rc, zf - rc]) for (const l of [hw - rc, rc - hw]) circles.push({ o, l, r: rc });
    this._hit = { dims: this.dims, R: this.RADIUS, r, circles };
    return this._hit;
  }

  placeAt(x, z, heading) {
    this.pos.set(x, z);
    this.heading = heading;
    this.vel.set(0, 0);
    this.resetGround();
  }

  // deja el coche actual aparcado y devuelve su ficha para poder volver a entrar
  detach() {
    this.mesh.position.y = 0.16;
    // la moto se queda apoyada en la pata de cabra
    if (this.LEAN) this.body.rotation.z = 0.12;
    // si lo dejas encima de la acera, se queda a su altura
    this.body.position.y = this.sus?.y || 0;
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
      // si era un coche del trafico, su conductor se baja (ahora conduces tu)
      this.mesh.getObjectByName('conductorNPC')?.removeFromParent();
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
    addIndicators(this.mesh);
    this.sus = null;   // la suspensión vuelve a mirar el suelo con el coche nuevo
    this.type = entry.type;
    this.color = entry.color;
    this.brand = !!entry.brand;
    this.setSpecs(this.type);
    this.placeAt(entry.x, entry.z, entry.heading);
    this.mesh.position.set(entry.x, 0.16, entry.z);
    this.mesh.rotation.y = entry.heading;
  }
}
