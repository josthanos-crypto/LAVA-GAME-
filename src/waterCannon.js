import * as THREE from 'three';

/**
 * Tanqueta de agua de la Policía (camión con cañón en el techo y manguera
 * en la parte de atrás) y el chorro de agua con jabón: partículas con
 * gravedad, burbujas de espuma y manchas de espuma en el suelo.
 */

const M = (color, rough = 0.6, metal = 0.1, extra = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });

function sideLivery() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = '#f4f5f7';
  x.fillRect(0, 0, 1024, 256);
  // franja azul y cuadros amarillos de la Policía
  x.fillStyle = '#1f4fa8';
  x.fillRect(0, 150, 1024, 60);
  for (let i = 0; i < 1024; i += 40) {
    x.fillStyle = (i / 40) % 2 ? '#f2c500' : '#1f4fa8';
    x.fillRect(i, 210, 40, 22);
  }
  x.fillStyle = '#1f4fa8';
  x.font = 'bold 92px "Arial Narrow", Arial';
  x.textAlign = 'center';
  x.fillText('POLICÍA', 512, 118);
  x.fillStyle = '#ffffff';
  x.font = 'bold 34px "Arial Narrow", Arial';
  x.fillText('UNIDAD DE AGUA · ARRECIFE', 512, 192);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function truckWheel(R) {
  const w = new THREE.Group();
  const tire = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.42, 22), M(0x16181b, 0.92));
  tire.rotation.z = Math.PI / 2;
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.55, R * 0.55, 0.44, 12), M(0x8a9098, 0.4, 0.7));
  rim.rotation.z = Math.PI / 2;
  w.add(tire, rim);
  return w;
}

/** camión de 8,6 m con cañón giratorio; devuelve las piezas que se animan */
export function makeWaterTruck() {
  const group = new THREE.Group();
  const body = new THREE.Group();
  group.add(body);
  const white = M(0xf4f5f7, 0.35, 0.15);
  const dark = M(0x23262b, 0.7, 0.3);
  const grille = M(0x2c3036, 0.5, 0.6);
  const glass = M(0x1a2630, 0.08, 0.6, { transparent: true, opacity: 0.85 });
  const livery = new THREE.MeshStandardMaterial({ map: sideLivery(), roughness: 0.4, metalness: 0.1 });

  // chasis y paragolpes
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.45, 8.4), dark);
  chassis.position.set(0, 0.75, 0);
  body.add(chassis);
  const bumper = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.4, 0.3), dark);
  bumper.position.set(0, 0.75, 4.3);
  body.add(bumper);

  // cabina blindada
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.9, 2.0), [livery, livery, white, dark, white, white]);
  cab.position.set(0, 1.95, 3.2);
  body.add(cab);
  const wind = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.75, 0.05), glass);
  wind.position.set(0, 2.35, 4.21);
  wind.rotation.x = -0.12;
  body.add(wind);
  // rejilla antidisturbios delante del parabrisas
  for (let i = 0; i < 9; i++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.8, 0.035), grille);
    bar.position.set(-1.0 + i * 0.25, 2.35, 4.3);
    body.add(bar);
  }
  for (const sx of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.6, 1.0), glass);
    side.position.set(sx * 1.26, 2.4, 3.3);
    body.add(side);
  }

  // cisterna
  const tank = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.1, 5.9), [livery, livery, white, dark, white, white]);
  tank.position.set(0, 2.05, -0.8);
  body.add(tank);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 5.4), white);
  lid.position.set(0, 3.16, -0.8);
  body.add(lid);

  // rotativos
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.14, 0.3), dark);
  bar.position.set(0, 2.98, 3.6);
  body.add(bar);
  const lamps = [];
  for (const sx of [-0.5, 0.5]) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.26),
      new THREE.MeshStandardMaterial({ color: 0x000040, emissive: 0x1030ff, emissiveIntensity: 0.4 }));
    l.position.set(sx, 3.1, 3.6);
    body.add(l);
    lamps.push(l.material);
  }

  // cañón de agua sobre la cabina
  const turret = new THREE.Group();
  turret.position.set(0, 3.15, 2.5);
  body.add(turret);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.4, 16), dark);
  base.position.y = 0.2;
  turret.add(base);
  const pitch = new THREE.Group();
  pitch.position.y = 0.5;
  turret.add(pitch);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 1.6, 12), M(0xd8dde2, 0.3, 0.8));
  barrel.rotation.x = Math.PI / 2;
  barrel.position.z = 0.8;
  pitch.add(barrel);
  const nozzle = new THREE.Object3D();
  nozzle.position.z = 1.65;
  pitch.add(nozzle);

  // carrete de la manguera atrás
  const reel = new THREE.Group();
  reel.position.set(0.7, 1.4, -3.95);
  body.add(reel);
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.6, 16), M(0xf2c500, 0.6));
  drum.rotation.z = Math.PI / 2;
  reel.add(drum);
  const hoseEnd = new THREE.Object3D();
  hoseEnd.position.set(0, -0.3, -0.35);
  reel.add(hoseEnd);

  // ruedas (2 delante, 4 detrás)
  const R = 0.55;
  const wheels = [];
  for (const z of [[0, 2.9], [1, -2.0], [1, -3.2]]) {
    for (const sx of [-1, 1]) {
      const pivot = new THREE.Group();
      const w = truckWheel(R);
      pivot.position.set(sx * 1.08, R, z[1]);
      pivot.add(w);
      group.add(pivot);
      const proxy = {
        rotation: {
          set x(v) { w.rotation.x = v; },
          get x() { return w.rotation.x; },
          set y(v) { if (z[0] === 0) pivot.rotation.y = v; },
          get y() { return pivot.rotation.y; },
        },
      };
      if (z[0] === 0) wheels.unshift(proxy); else wheels.push(proxy);
    }
  }

  group.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  group.userData.setLights = () => {};
  return { group, body, wheels, turret, pitch, nozzle, hoseEnd, lamps };
}

/* ─── partículas ─── */

function dotTexture(soft) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(soft ? 0.5 : 0.7, 'rgba(255,255,255,0.8)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

class Pool {
  constructor(scene, max, color, size, opacity, tex) {
    this.max = max;
    this.n = 0;
    this.p = new Float32Array(max * 3);
    this.v = new Float32Array(max * 3);
    this.life = new Float32Array(max);
    this.geo = new THREE.BufferGeometry();
    this.attr = new THREE.BufferAttribute(new Float32Array(max * 3), 3);
    this.attr.setUsage(THREE.DynamicDrawUsage);
    this.geo.setAttribute('position', this.attr);
    this.geo.setDrawRange(0, 0);
    this.points = new THREE.Points(this.geo, new THREE.PointsMaterial({
      color, size, map: tex, transparent: true, opacity, depthWrite: false, sizeAttenuation: true,
    }));
    this.points.frustumCulled = false;
    scene.add(this.points);
  }

  add(x, y, z, vx, vy, vz, life) {
    if (this.n >= this.max) return;
    const i = this.n++;
    this.p[i * 3] = x; this.p[i * 3 + 1] = y; this.p[i * 3 + 2] = z;
    this.v[i * 3] = vx; this.v[i * 3 + 1] = vy; this.v[i * 3 + 2] = vz;
    this.life[i] = life;
  }

  kill(i) {
    const last = --this.n;
    if (i === last) return;
    this.p.copyWithin(i * 3, last * 3, last * 3 + 3);
    this.v.copyWithin(i * 3, last * 3, last * 3 + 3);
    this.life[i] = this.life[last];
  }

  /** mueve todo; hit(x,y,z,vx,vz) devuelve true si la partícula se queda ahí */
  update(dt, gravity, drag, hit) {
    const { p, v } = this;
    for (let i = this.n - 1; i >= 0; i--) {
      this.life[i] -= dt;
      v[i * 3 + 1] -= gravity * dt;
      const k = 1 - drag * dt;
      v[i * 3] *= k; v[i * 3 + 2] *= k;
      p[i * 3] += v[i * 3] * dt;
      p[i * 3 + 1] += v[i * 3 + 1] * dt;
      p[i * 3 + 2] += v[i * 3 + 2] * dt;
      if (this.life[i] <= 0 || hit(i, p[i * 3], p[i * 3 + 1], p[i * 3 + 2], v[i * 3], v[i * 3 + 2])) this.kill(i);
    }
    this.attr.array.set(p.subarray(0, this.n * 3));
    this.attr.needsUpdate = true;
    this.geo.setDrawRange(0, this.n);
  }
}

const FOAM_MAX = 90;

export class WaterJet {
  constructor(scene) {
    this.water = new Pool(scene, 1400, 0xdff4ff, 0.42, 0.75, dotTexture(false));
    this.foam = new Pool(scene, 700, 0xffffff, 0.75, 0.85, dotTexture(true));
    this.acc = 0;
    // manchas de espuma en el suelo
    const disc = new THREE.CircleGeometry(1, 14);
    disc.rotateX(-Math.PI / 2);
    this.decals = new THREE.InstancedMesh(disc, new THREE.MeshBasicMaterial({ color: 0xf6fbff, transparent: true, opacity: 0.7, depthWrite: false }), FOAM_MAX);
    this.decals.count = 0;
    this.decals.frustumCulled = false;
    this.decalLife = new Float32Array(FOAM_MAX);
    this.decalPos = new Float32Array(FOAM_MAX * 3);
    this.decalNext = 0;
    scene.add(this.decals);
    this.m = new THREE.Matrix4();
    this.objects = [this.water.points, this.foam.points, this.decals];
  }

  /** chorro continuo: origen, dirección unitaria, velocidad, partículas/s */
  spray(o, d, speed, rate, spread, dt) {
    this.acc += rate * dt;
    while (this.acc >= 1) {
      this.acc -= 1;
      const s = speed * (0.92 + Math.random() * 0.16);
      const jx = (Math.random() - 0.5) * spread, jy = (Math.random() - 0.5) * spread, jz = (Math.random() - 0.5) * spread;
      const f = Math.random() * dt; // repartidas a lo largo del fotograma
      const vx = (d.x + jx) * s, vy = (d.y + jy) * s, vz = (d.z + jz) * s;
      this.water.add(o.x + vx * f, o.y + vy * f, o.z + vz * f, vx, vy, vz, 2.2);
      if (Math.random() < 0.22) this.foam.add(o.x, o.y, o.z, vx * 0.55, vy * 0.55 + 1, vz * 0.55, 2.6);
    }
  }

  /** salpicón (alguien cae al agua, se rompe el muro...) */
  burst(x, y, z, n, up = 5, wide = 3) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.random() * wide;
      this.foam.add(x, y, z, Math.cos(a) * r, up * (0.5 + Math.random()), Math.sin(a) * r, 1.4 + Math.random());
    }
  }

  stamp(x, z, size) {
    const i = this.decalNext;
    this.decalNext = (this.decalNext + 1) % FOAM_MAX;
    this.decals.count = Math.max(this.decals.count, i + 1);
    this.decalLife[i] = 30;
    this.decalPos.set([x, size, z], i * 3);
  }

  /** hit(x,y,z,vx,vz,kind) → true para absorber la partícula; ground(x,z) → 'sea' | 'land' */
  update(dt, hit, ground) {
    const onWater = (x, y, z, vx, vz, kind) => {
      if (hit(x, y, z, vx, vz, kind)) return true;
      if (y > 0.18) return false;
      if (ground(x, z) === 'land' && kind === 0 && Math.random() < 0.035) this.stamp(x, z, 0.5 + Math.random() * 0.9);
      return true;
    };
    this.water.update(dt, 9.8, 0.04, (i, x, y, z, vx, vz) => onWater(x, y, z, vx, vz, 0));
    this.foam.update(dt, 4.5, 1.6, (i, x, y, z, vx, vz) => onWater(x, y, z, vx, vz, 1));
    for (let i = 0; i < this.decals.count; i++) {
      if (this.decalLife[i] <= 0) continue;
      this.decalLife[i] -= dt;
      const s = this.decalPos[i * 3 + 1] * Math.min(1, this.decalLife[i] / 8);
      this.m.makeScale(Math.max(0.001, s), 1, Math.max(0.001, s));
      this.m.setPosition(this.decalPos[i * 3], 0.2, this.decalPos[i * 3 + 2]);
      this.decals.setMatrixAt(i, this.m);
    }
    this.decals.instanceMatrix.needsUpdate = true;
  }

  get busy() { return this.water.n + this.foam.n > 0; }
}
