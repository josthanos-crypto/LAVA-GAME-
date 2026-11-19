import * as THREE from 'three';

const smooth = THREE.MathUtils.smoothstep;
const lerp = THREE.MathUtils.lerp;

// el volcán está de verdad lejos, hacia Timanfaya (oeste-noroeste); se dibuja más cerca
// y a escala para que quepa en la vista, con el mismo tamaño y dirección aparentes
// (Version 149) El ancla estaba en (-5800, -2300), pegada a Playa Honda: desde Arrecife se veía bien, pero dentro de
// Playa Honda el volcán y sus conos de al lado caían encima de la zona industrial y del aeropuerto y tapaban las
// naves. Ahora está tres veces más lejos en la misma dirección y se dibuja tres veces más grande (LEJOS): desde
// Arrecife se ve igual que antes y desde Playa Honda queda al fondo, fuera del pueblo.
const LEJOS = 3;
const ANCHOR = new THREE.Vector3(-5800 * LEJOS, -70, -2300 * LEJOS);
const DRAW_DIST = 2500;
const RADIUS = 1900, HEIGHT = 820;

function hash(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise(a, b) {
  const ia = Math.floor(a), ib = Math.floor(b), fa = a - ia, fb = b - ib;
  const u = fa * fa * (3 - 2 * fa), v = fb * fb * (3 - 2 * fb);
  return lerp(lerp(hash(ia, ib), hash(ia + 1, ib), u), lerp(hash(ia, ib + 1), hash(ia + 1, ib + 1), u), v);
}

/** cono con cráter, laderas rugosas y colores de picón (negro, ocre y rojo óxido) */
function coneGeometry(R, H, segs, seed) {
  const prof = [[1, 0], [0.86, 0.1], [0.66, 0.3], [0.47, 0.58], [0.32, 0.84], [0.22, 0.98], [0.18, 1], [0.13, 0.9], [0.06, 0.82]];
  const pts = prof.map(([r, y]) => new THREE.Vector2(r * R, y * H));
  const g = new THREE.LatheGeometry(pts, segs);
  const pos = g.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  const base = new THREE.Color(0x4a3024), mid = new THREE.Color(0x2a1d19), top = new THREE.Color(0x7a3820);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const a = Math.atan2(z, x), h = y / H;
    const n = noise(a * 6 + seed, h * 5) - 0.5;
    const gully = Math.pow(Math.abs(Math.sin(a * 9 + seed + noise(a * 3, h * 2) * 2)), 6) * 0.06;
    const k = 1 + n * 0.16 - gully * (h > 0.15 && h < 0.95 ? 1 : 0);
    pos.setXYZ(i, x * k, y * (1 + n * 0.06), z * k);
    c.copy(mid).lerp(base, smooth(0.35 - h, 0, 0.3)).lerp(top, smooth(h, 0.62, 0.95) * 0.85);
    c.multiplyScalar(0.8 + noise(a * 14 + seed, h * 9) * 0.4);
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

/** ríos de lava bajando por la ladera: cintas pegadas a la superficie */
function lavaRivers(R, H, n, seed) {
  const verts = [], idx = [];
  for (let k = 0; k < n; k++) {
    let a = seed + k * (Math.PI * 2 / n) + hash(k, seed) * 0.6;
    const w0 = 0.035 + hash(seed, k) * 0.025;
    const len = 0.45 + hash(k * 3, seed) * 0.35;
    const steps = 18;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const h = lerp(0.98, 1 - len, t);
      const r = lerp(0.22, 0.22 + (1 - 0.22) * len * 1.05, t);
      a += (noise(k * 7 + t * 4, seed) - 0.5) * 0.06;
      const w = w0 * (1 - t * 0.75) * R;
      const cx = Math.cos(a) * r * R * 1.012, cz = Math.sin(a) * r * R * 1.012, y = h * H + 6;
      const tx = -Math.sin(a) * w, tz = Math.cos(a) * w;
      verts.push(cx - tx, y, cz - tz, cx + tx, y, cz + tz);
      if (s) { const b = verts.length / 3 - 4; idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2); }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  g.setIndex(idx);
  return g;
}

function puffTexture() {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const ctx = cv.getContext('2d');
  for (let i = 0; i < 9; i++) {
    const x = 64 + (hash(i, 1) - 0.5) * 50, y = 64 + (hash(i, 2) - 0.5) * 50, r = 26 + hash(i, 3) * 26;
    const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(255,255,255,.55)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, 128, 128);
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function glowTexture() {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const ctx = cv.getContext('2d');
  const gr = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,220,150,1)');
  gr.addColorStop(0.25, 'rgba(255,110,30,.75)');
  gr.addColorStop(1, 'rgba(255,40,0,0)');
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Volcán al fondo: humo de día y cráter y ríos de lava al rojo de noche.
 * Se ve desde toda la ciudad (no le afecta la niebla; lleva su propia calima).
 */
export class Volcano {
  constructor(scene, { touch = false } = {}) {
    this.group = new THREE.Group();
    this.group.name = 'volcano';
    const segs = touch ? 48 : 80;
    this.bodyMat = new THREE.MeshLambertMaterial({ vertexColors: true, fog: false });
    const main = new THREE.Mesh(coneGeometry(RADIUS, HEIGHT, segs, 1.3), this.bodyMat);
    const side = new THREE.Mesh(coneGeometry(RADIUS * 0.55, HEIGHT * 0.5, segs >> 1, 4.1), this.bodyMat);
    side.position.set(RADIUS * 0.2, 0, RADIUS * 1.15);
    const side2 = new THREE.Mesh(coneGeometry(RADIUS * 0.42, HEIGHT * 0.36, segs >> 1, 7.7), this.bodyMat);
    side2.position.set(RADIUS * 0.4, 0, -RADIUS * 1.05);
    this.group.add(main, side, side2);

    this.lavaMat = new THREE.MeshBasicMaterial({
      color: 0xff5a14, fog: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
      side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -4,
    });
    this.group.add(new THREE.Mesh(lavaRivers(RADIUS, HEIGHT, 5, 0.7), this.lavaMat));

    const glowMap = glowTexture();
    this.glowMat = new THREE.SpriteMaterial({ map: glowMap, fog: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    this.glow = new THREE.Sprite(this.glowMat);
    this.glow.position.set(0, HEIGHT * 1.02, 0);
    this.glow.scale.set(RADIUS * 0.75, RADIUS * 0.5, 1);
    this.group.add(this.glow);

    // columna de humo: bocanadas que suben, crecen y se deshacen con el viento
    const puff = puffTexture();
    this.puffs = [];
    const n = touch ? 9 : 16;
    for (let i = 0; i < n; i++) {
      const m = new THREE.SpriteMaterial({ map: puff, fog: false, transparent: true, depthWrite: false, color: 0xf4f1ec });
      const s = new THREE.Sprite(m);
      s.userData.phase = i / n;
      s.userData.spin = (hash(i, 9) - 0.5) * 0.4;
      this.group.add(s);
      this.puffs.push(s);
    }
    this.group.traverse(o => { o.castShadow = false; o.receiveShadow = false; o.frustumCulled = false; });
    this.group.renderOrder = -1;
    scene.add(this.group);
    this._v = new THREE.Vector3();
    this._c = new THREE.Color();
    this._smoke = new THREE.Color();
  }

  update(camera, night, t, fogColor) {
    const g = this.group;
    const d = this._v.copy(ANCHOR).sub(camera.position);
    const k = DRAW_DIST / d.length();
    g.position.copy(camera.position).addScaledVector(d, k);
    g.scale.setScalar(k * LEJOS);

    // calima del aire: de día azulada, al anochecer se funde con el cielo
    this.bodyMat.emissive.copy(fogColor || this._c.setHex(0x9fb4c6)).multiplyScalar(lerp(0.3, 0.06, night));
    this.bodyMat.emissive.lerp(this._c.setHex(0x2a0a04), night * 0.8);

    const flicker = 0.85 + Math.sin(t * 2.3) * 0.08 + Math.sin(t * 5.1) * 0.05;
    this.lavaMat.color.setHex(0x3a0c04).lerp(this._c.setHex(0xff5a14), smooth(night, 0.15, 0.8));
    this.lavaMat.color.multiplyScalar(flicker);
    this.glowMat.opacity = (0.12 + smooth(night, 0.1, 0.8) * 0.85) * flicker;

    const smokeDay = this._smoke.setHex(0xf4f1ec).lerp(this._c.setHex(0x5a2a1a), night);
    for (const s of this.puffs) {
      const life = (t * 0.018 + s.userData.phase) % 1;
      s.position.set(life * RADIUS * 0.55, HEIGHT * (1.02 + life * 1.2), -life * RADIUS * 0.12);
      const sc = RADIUS * (0.2 + life * 0.8);
      s.scale.set(sc, sc, 1);
      s.material.rotation = s.userData.spin * life * 6;
      s.material.color.copy(smokeDay).lerp(this._c.setHex(0xff7a3a), night * (1 - life) * 0.6);
      s.material.opacity = Math.sin(Math.PI * Math.min(1, life * 1.15)) * lerp(0.95, 0.6, night);
    }
  }
}
