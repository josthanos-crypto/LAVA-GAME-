import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { paint } from './interiorKit.js';
import { sound } from './sound.js';

/**
 * Perros salchicha: pasean con correa al lado de algunos peatones y otros
 * corretean sueltos por la plaza de las terrazas del Reducto. Patitas cortas
 * a toda velocidad, rabo que no para y algún ladrido. No se les puede hacer
 * daño: si se les echa un coche encima pegan un brinco y se apartan, y las
 * balas no van con ellos.
 */

const Y0 = 0.19;                 // altura de la acera
const COATS = [0x9a4a1e, 0x7e3814, 0x1e1612, 0x5a3420, 0xb0703a, 0x6a5a52, 0x9a4a1e];
const HIPS = [[-0.052, 0.155], [0.052, 0.155], [-0.052, -0.165], [0.052, -0.165]];
const _m = new THREE.Matrix4(), _p = new THREE.Matrix4(), _w = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(0, 0, 0, 'YXZ');
const _v = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1);

function geos() {
  const W = 0xffffff, D = 0x141010, EAR = 0xb4b4b4;
  const part = (g, x, y, z, hex) => { g.translate(x, y, z); return paint(g, hex); };
  // cuerpo largo y bajo, con el cuello
  const trunk = new THREE.CylinderGeometry(0.083, 0.083, 0.44, 14);
  trunk.rotateX(Math.PI / 2);
  const neck = new THREE.CylinderGeometry(0.045, 0.06, 0.14, 10);
  neck.rotateX(-0.75);
  const body = mergeGeometries([
    part(trunk, 0, 0.2, 0, W),
    part(new THREE.SphereGeometry(0.083, 14, 10), 0, 0.2, 0.22, W),
    part(new THREE.SphereGeometry(0.083, 14, 10), 0, 0.2, -0.22, W),
    part(neck, 0, 0.255, 0.27, W),
  ], false);
  // cabeza (su pivote en el cuello) con el hocico largo, la trufa, los ojos y las orejas caídas
  const snout = new THREE.CylinderGeometry(0.032, 0.045, 0.13, 10);
  snout.rotateX(Math.PI / 2);
  const ear = (s) => { const g = new THREE.SphereGeometry(0.058, 10, 8); g.scale(0.28, 1, 0.75); g.rotateZ(s * 0.25); return part(g, s * 0.062, -0.025, 0.0, EAR); };
  const head = mergeGeometries([
    part(new THREE.SphereGeometry(0.068, 14, 10), 0, 0, 0.0, W),
    part(snout, 0, -0.018, 0.085, W),
    part(new THREE.SphereGeometry(0.02, 8, 6), 0, -0.012, 0.152, D),
    part(new THREE.SphereGeometry(0.012, 6, 5), -0.03, 0.022, 0.05, D),
    part(new THREE.SphereGeometry(0.012, 6, 5), 0.03, 0.022, 0.05, D),
    ear(-1), ear(1),
  ], false);
  // pata (pivote arriba) con su pie
  const leg = mergeGeometries([
    part(new THREE.CylinderGeometry(0.024, 0.02, 0.13, 8), 0, -0.065, 0, W),
    part(new THREE.SphereGeometry(0.025, 8, 6).scale(1, 0.6, 1.4), 0, -0.13, 0.01, W),
  ], false);
  // rabo (pivote en la base, hacia atrás y algo para arriba)
  const tailG = new THREE.CylinderGeometry(0.008, 0.022, 0.22, 8);
  tailG.translate(0, 0.11, 0);
  tailG.rotateX(-2.2);
  const tail = paint(tailG, W);
  return { body, head, leg, tail };
}

/** ladrido corto (o un gañido si se ha llevado un susto) */
function bark(dist, yelp = false) {
  if (!sound.live || dist > 40) return;
  const ctx = sound.ctx, t0 = ctx.currentTime;
  const vol = 0.42 / (1 + dist * 0.18);
  const n = yelp ? 1 : 1 + Math.round(Math.random() * 2);
  for (let k = 0; k < n; k++) {
    const t = t0 + k * 0.2;
    const f0 = yelp ? 1500 : 640 + Math.random() * 160;
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f0 * (yelp ? 0.45 : 0.6), t + (yelp ? 0.28 : 0.12));
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = yelp ? 1900 : 1150;
    bp.Q.value = 1.4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (yelp ? 0.32 : 0.14));
    o.connect(bp).connect(g).connect(sound.out);
    o.start(t);
    o.stop(t + 0.4);
  }
}

export class Dachshunds {
  /**
   * peds: los peatones (algunos sacan el perro); plaza: polígono [[x, z]...]
   * donde corretean los sueltos
   */
  constructor(scene, peds, { leashed = 8, free = 3, plaza = null, colliders = null } = {}) {
    this.peds = peds;
    this.colliders = colliders;
    this.plaza = plaza;
    const G = geos();
    const n = leashed + (plaza ? free : 0);
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75 });
    const mk = (g, k) => {
      const m = new THREE.InstancedMesh(g, mat, k);
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      m.castShadow = true;
      m.frustumCulled = false;
      scene.add(m);
      return m;
    };
    this.body = mk(G.body, n);
    this.head = mk(G.head, n);
    this.legs = mk(G.leg, n * 4);
    this.tail = mk(G.tail, n);
    // correas: un segmento por perro
    this.leashGeo = new THREE.BufferGeometry();
    this.leashGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 6), 3));
    this.leashes = new THREE.LineSegments(this.leashGeo, new THREE.LineBasicMaterial({ color: 0xc8261c }));
    this.leashes.frustumCulled = false;
    scene.add(this.leashes);

    this.dogs = [];
    const pool = peds.peds;
    for (let i = 0; i < n; i++) {
      const coat = new THREE.Color(COATS[i % COATS.length]);
      for (const m of [this.body, this.head, this.tail]) m.setColorAt(i, coat);
      for (let k = 0; k < 4; k++) this.legs.setColorAt(i * 4 + k, coat);
      const owner = i < leashed ? pool[(i * 11 + 5) % pool.length] : null;
      this.dogs.push({
        i, owner, x: 0, z: 0, y: 0, heading: 0, speed: 0, phase: Math.random() * 10, wag: 1,
        visible: false, hop: 0, hx: 0, hz: 0, sniff: 0, barkT: 3 + Math.random() * 8, sit: 0,
        target: null, waitT: 0, side: Math.random() < 0.5 ? 1 : -1, size: 0.92 + Math.random() * 0.16,
      });
    }
    for (const m of [this.body, this.head, this.legs, this.tail]) if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }

  /** ctx: { driving, carSpeed, carVel } como para los peatones */
  update(dt, player, ctx = {}) {
    const px = player.pos.x, pz = player.pos.y;
    const t = performance.now() * 0.001;
    const leash = this.leashGeo.getAttribute('position');
    for (const d of this.dogs) {
      if (d.owner) this.followOwner(d, dt, t);
      else this.roam(d, dt, px, pz);
      if (d.visible) this.dodge(d, dt, px, pz, ctx);
      this.place(d, dt, t, leash);
    }
    leash.needsUpdate = true;
    for (const m of [this.body, this.head, this.legs, this.tail]) m.instanceMatrix.needsUpdate = true;
  }

  /** con correa: trota al lado del dueño, se sienta cuando él se para */
  followOwner(d, dt, t) {
    const o = d.owner;
    if (!o.road || !o.group.visible) { d.visible = false; return; }
    const ox = o.x, oz = o.z, fx = Math.sin(o.heading), fz = Math.cos(o.heading);
    // un poco adelantado y a un lado, olisqueando
    const lead = o.state === 'walk' ? 0.75 : o.state === 'flee' ? 1.4 : 0.55;
    const wob = Math.sin(t * 0.7 + d.phase) * 0.25;
    const tx = ox + fx * lead - fz * d.side * (0.55 + wob), tz = oz + fz * lead + fx * d.side * (0.55 + wob);
    if (!d.visible || Math.hypot(tx - d.x, tz - d.z) > 6) { d.x = tx; d.z = tz; d.heading = o.heading; }
    d.visible = true;
    this.steer(d, dt, tx, tz, o.state === 'flee' ? 6 : 2.6);
    const still = o.state !== 'walk' && o.state !== 'flee';
    d.sit += ((still && d.speed < 0.3 ? 1 : 0) - d.sit) * Math.min(1, dt * 3);
    d.wag = o.state === 'down' ? 0.3 : 1;
    d.leash = true;
    // si el dueño se cae, se queda a su lado ladrando
    if (o.state === 'down' && (d.barkT -= dt) <= 0) { d.barkT = 1.2 + Math.random(); d.barkNow = true; }
  }

  /** sueltos por la plaza: van de un sitio a otro, se paran a olisquear y se persiguen */
  roam(d, dt, px, pz) {
    const P = this.plaza;
    const near = Math.hypot(P.cx - px, P.cz - pz) < 140;
    if (!near) { d.visible = false; return; }
    if (!d.visible) {
      const [x, z] = randomIn(P);
      d.x = x; d.z = z; d.visible = true;
    }
    d.leash = false;
    if (!d.target || Math.hypot(d.target[0] - d.x, d.target[1] - d.z) < 0.4) {
      if ((d.waitT -= dt) > 0) { this.steer(d, dt, d.x, d.z, 0); d.sit += (1 - d.sit) * Math.min(1, dt * 2); return; }
      // a veces se va detrás de otro perro
      const other = this.dogs.find(q => q !== d && !q.owner && q.visible && Math.random() < 0.3);
      d.target = other ? [other.x + (Math.random() - 0.5), other.z + (Math.random() - 0.5)] : randomIn(P);
      d.run = Math.random() < 0.35;
      d.waitT = 1 + Math.random() * 4;
    }
    d.sit += (0 - d.sit) * Math.min(1, dt * 4);
    this.steer(d, dt, d.target[0], d.target[1], d.run ? 3.4 : 1.6);
    d.wag = 1;
  }

  /** se mueve hacia (tx, tz) girando como un perro, sin atravesar paredes */
  steer(d, dt, tx, tz, vmax) {
    const dx = tx - d.x, dz = tz - d.z, dist = Math.hypot(dx, dz);
    const want = dist > 0.08 ? Math.min(vmax, dist * 2.2) : 0;
    d.speed += (want - d.speed) * Math.min(1, dt * 6);
    if (dist > 0.05) {
      const h = Math.atan2(dx, dz);
      const diff = ((h - d.heading + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
      d.heading += diff * Math.min(1, dt * 7);
    }
    d.x += Math.sin(d.heading) * d.speed * dt;
    d.z += Math.cos(d.heading) * d.speed * dt;
    if (this.colliders) {
      for (const c of this.colliders.circleContacts(d.x, d.z, 0.2)) { d.x += c.nx * c.depth; d.z += c.nz * c.depth; }
    }
  }

  /** ni coches ni personas: brinco hacia un lado y a seguir */
  dodge(d, dt, px, pz, ctx) {
    const dx = d.x - px, dz = d.z - pz, dist = Math.hypot(dx, dz) || 0.01;
    if (ctx.driving) {
      const v = ctx.carVel, sp = ctx.carSpeed || 0;
      const coming = sp > 1.5 && (v.x * -dx + v.y * -dz) / (dist * sp) > 0.2;
      if (d.hop <= 0 && dist < 2.6 + sp * 0.22 && (coming || dist < 2.2)) {
        // salta hacia el lado del que no viene el coche
        let sx = -v.y, sz = v.x;
        const l = Math.hypot(sx, sz) || 1;
        sx /= l; sz /= l;
        if (sx * dx + sz * dz < 0) { sx = -sx; sz = -sz; }
        if (sp < 1.5) { sx = dx / dist; sz = dz / dist; }
        d.hop = 0.42; d.hx = sx; d.hz = sz;
        bark(dist, true);
      }
      // aunque no le dé tiempo, nunca queda debajo
      if (dist < 1.9) { d.x = px + dx / dist * 1.9; d.z = pz + dz / dist * 1.9; }
    } else if (dist < 0.55) {
      d.x = px + dx / dist * 0.55; d.z = pz + dz / dist * 0.55;
    }
    if (d.hop > 0) {
      d.hop -= dt;
      d.x += d.hx * 5 * dt; d.z += d.hz * 5 * dt;
      if (this.colliders) for (const c of this.colliders.circleContacts(d.x, d.z, 0.2)) { d.x += c.nx * c.depth; d.z += c.nz * c.depth; }
    }
    d.y = d.hop > 0 ? Math.sin((1 - d.hop / 0.42) * Math.PI) * 0.4 : 0;
    // de vez en cuando le ladra a quien pase cerca
    d.barkT -= dt;
    if (d.barkNow || (d.barkT <= 0 && dist < 9 && !ctx.driving)) {
      d.barkNow = false;
      d.barkT = 6 + Math.random() * 10;
      d.yap = 0.35;
      bark(dist);
    }
    if (d.yap > 0) d.yap -= dt;
  }

  place(d, dt, t, leash) {
    const i = d.i;
    if (!d.visible) {
      _m.makeScale(0, 0, 0);
      this.body.setMatrixAt(i, _m); this.head.setMatrixAt(i, _m); this.tail.setMatrixAt(i, _m);
      for (let k = 0; k < 4; k++) this.legs.setMatrixAt(i * 4 + k, _m);
      leash.setXYZ(i * 2, 0, -50, 0); leash.setXYZ(i * 2 + 1, 0, -50, 0);
      return;
    }
    const run = Math.min(1, d.speed / 2.5);
    d.phase += d.speed * dt * 9;
    const bob = Math.abs(Math.sin(d.phase * 2)) * 0.012 * run;
    // sentado: el culete abajo y la cabeza arriba
    _e.set(-0.32 * d.sit, d.heading, 0, 'YXZ');
    _q.setFromEuler(_e);
    _s.setScalar(d.size);
    _m.compose(_v.set(d.x, Y0 + d.y + bob - d.sit * 0.03, d.z), _q, _s);
    this.body.setMatrixAt(i, _m);
    // cabeza: olisquea el suelo al andar despacio y da un respingo al ladrar
    const sniff = d.speed > 0.2 && d.speed < 2 ? 0.35 + Math.sin(t * 3 + d.phase) * 0.15 : 0;
    _p.makeRotationFromEuler(_e.set(sniff - (d.yap > 0 ? 0.4 : 0) - d.sit * 0.2, Math.sin(t * 0.9 + d.phase) * 0.3, 0, 'YXZ'));
    _p.setPosition(0, 0.3 + d.sit * 0.04, 0.32);
    this.head.setMatrixAt(i, _w.multiplyMatrices(_m, _p));
    // rabo: no para
    _p.makeRotationFromEuler(_e.set(0, Math.sin(t * (10 + d.wag * 6) + d.phase) * 0.6 * d.wag, 0, 'YXZ'));
    _p.setPosition(0, 0.23, -0.29);
    this.tail.setMatrixAt(i, _w.multiplyMatrices(_m, _p));
    // patitas cortas a toda velocidad (sentado: las de atrás dobladas)
    HIPS.forEach(([hx, hz], k) => {
      const sw = Math.sin(d.phase * 2 + (k === 0 || k === 3 ? 0 : Math.PI)) * 0.75 * run;
      const sat = d.sit * (k >= 2 ? -1.2 : 0.15);
      _p.makeRotationX(sw + sat);
      _p.setPosition(hx, 0.17, hz);
      this.legs.setMatrixAt(i * 4 + k, _w.multiplyMatrices(_m, _p));
    });
    // correa: de la mano del dueño al cuello
    if (d.leash && d.owner) {
      const o = d.owner, s = (o.group.scale.x || 1);
      const fx = Math.sin(o.heading), fz = Math.cos(o.heading);
      const hx = o.x - fz * d.side * 0.24 * s + fx * 0.08, hz = o.z + fx * d.side * 0.24 * s + fz * 0.08;
      leash.setXYZ(i * 2, hx, o.group.position.y + 0.82 * s, hz);
      leash.setXYZ(i * 2 + 1, d.x + Math.sin(d.heading) * 0.27 * d.size, Y0 + d.y + 0.27 * d.size, d.z + Math.cos(d.heading) * 0.27 * d.size);
    } else {
      leash.setXYZ(i * 2, 0, -50, 0); leash.setXYZ(i * 2 + 1, 0, -50, 0);
    }
  }
}

/** punto al azar dentro de un polígono */
function randomIn(P) {
  for (let k = 0; k < 40; k++) {
    const x = P.x0 + Math.random() * (P.x1 - P.x0), z = P.z0 + Math.random() * (P.z1 - P.z0);
    if (inside(P.pts, x, z)) return [x, z];
  }
  return [P.cx, P.cz];
}

export function inside(pts, x, z) {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, zi] = pts[i], [xj, zj] = pts[j];
    if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c;
  }
  return c;
}

/** zona de paseo: polígono con su caja y su centro */
export function area(pts) {
  const xs = pts.map(p => p[0]), zs = pts.map(p => p[1]);
  return {
    pts, x0: Math.min(...xs), x1: Math.max(...xs), z0: Math.min(...zs), z1: Math.max(...zs),
    cx: xs.reduce((a, b) => a + b, 0) / xs.length, cz: zs.reduce((a, b) => a + b, 0) / zs.length,
  };
}
