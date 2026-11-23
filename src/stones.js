import * as THREE from 'three';
import { store } from './save.js';

const KEY = 'lava.stones';
const SHOW_DIST = 160;
const REWARD = 100;
const ALL_BONUS = 1000;
const EXTRA_COUNT = 14;
const EXTRA_SPACING = 260;

function loadTaken() {
  try { return new Set(JSON.parse(store.get(KEY) || '[]')); } catch { return new Set(); }
}
function saveTaken(set) {
  store.set(KEY, JSON.stringify([...set]));
}

function crackTexture() {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = '#ffb040';
  ctx.lineCap = 'round';
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 18; i++) {
    let x = rnd() * 128, y = rnd() * 128;
    ctx.lineWidth = 3 + rnd() * 4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let s = 0; s < 6; s++) { x += (rnd() - 0.5) * 40; y += (rnd() - 0.5) * 40; ctx.lineTo(x, y); }
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function glowTexture() {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 64;
  const ctx = cv.getContext('2d');
  const gr = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,200,120,1)');
  gr.addColorStop(0.3, 'rgba(255,110,30,.6)');
  gr.addColorStop(1, 'rgba(255,60,0,0)');
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(cv);
}

function rockGeometry() {
  const g = new THREE.IcosahedronGeometry(0.42, 1);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const k = 0.82 + (Math.sin(x * 19 + y * 7) * 0.5 + 0.5) * 0.3;
    p.setXYZ(i, x * k * 1.15, y * k * 0.8, z * k);
  }
  g.computeVertexNormals();
  return g;
}

function inPoly(x, z, P) {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const [xi, zi] = P[i], [xj, zj] = P[j];
    if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c;
  }
  return c;
}

function inBuilding(map, x, z) {
  return (map.buildings || []).some(b => b.p && Math.abs(b.p[0][0] - x) < 120 && Math.abs(b.p[0][1] - z) < 120 && inPoly(x, z, b.p));
}

/** sitios fijos repartidos por la ciudad: en la acera de calles con nombre, separados entre sí */
function streetSpots(map, avoid) {
  const o = map.meta.ortho;
  const roads = map.roads
    .filter(r => r.name && r.name.length > 3 && !r.major && !r.ped && r.p.length >= 2)
    .map((r, i) => ({ r, h: Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1 }))
    .sort((a, b) => a.h - b.h);
  const out = [];
  for (const { r } of roads) {
    if (out.length >= EXTRA_COUNT) break;
    const i = Math.max(1, Math.floor(r.p.length / 2));
    const [ax, az] = r.p[i - 1], [bx, bz] = r.p[i];
    const mx = (ax + bx) / 2, mz = (az + bz) / 2;
    if (Math.abs(mx) > o.x1 * 0.55 || Math.abs(mz) > o.z1 * 0.55) continue;
    const near = [...out, ...avoid].some(s => Math.hypot(s.x - mx, s.z - mz) < EXTRA_SPACING);
    if (near) continue;
    const l = Math.hypot(bx - ax, bz - az) || 1;
    const side = (r.w || 6) / 2 + 1.2;
    const sides = [1, -1].map(k => ({ x: mx - (bz - az) / l * side * k, z: mz + (bx - ax) / l * side * k }));
    const ok = sides.find(p => !inBuilding(map, p.x, p.z));
    if (ok) out.push({ id: 'c:' + r.name, ...ok });
  }
  return out;
}

/**
 * Piedras de lava escondidas, como los paquetes ocultos de GTA: brillan en naranja y
 * dan dinero al cogerlas. Una delante de la puerta de cada negocio cliente y el resto
 * repartidas por las calles. Las ya cogidas se recuerdan.
 */
export class LavaStones {
  constructor(scene, map, doors, { onPick, onAll } = {}) {
    this.onPick = onPick;
    this.onAll = onAll;
    this.taken = loadTaken();
    const doorSpots = doors.map(d => ({ id: 'n:' + d.name, x: d.x + d.nx * 1.9, z: d.z + d.nz * 1.9 }));
    this.spots = [...doorSpots, ...streetSpots(map, doorSpots)];
    this.total = this.spots.length;

    const crack = crackTexture();
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x3a1a10, roughness: 0.85, metalness: 0, emissive: 0xff6a1a, emissiveMap: crack, emissiveIntensity: 4,
    });
    const glowMat = new THREE.SpriteMaterial({ map: glowTexture(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    const geo = rockGeometry();
    this.items = [];
    this.root = new THREE.Group();
    this.root.name = 'lava-stones';
    scene.add(this.root);
    for (const s of this.spots) {
      if (this.taken.has(s.id)) continue;
      const g = new THREE.Group();
      const rock = new THREE.Mesh(geo, rockMat);
      const glow = new THREE.Sprite(glowMat);
      glow.scale.set(2.8, 2.8, 1);
      g.add(rock, glow);
      g.position.set(s.x, 0.85, s.z);
      g.visible = false;
      this.root.add(g);
      this.items.push({ ...s, g, rock, phase: Math.random() * 6 });
    }
  }

  get count() { return this.spots.filter(s => this.taken.has(s.id)).length; }

  update(t, x, z, { car, blocked }) {
    const r = car ? 3.4 : 1.7;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      const d = Math.hypot(it.x - x, it.z - z);
      it.g.visible = d < SHOW_DIST;
      if (!it.g.visible) continue;
      it.g.position.y = 0.85 + Math.sin(t * 2 + it.phase) * 0.12;
      it.rock.rotation.y = t * 1.2 + it.phase;
      it.rock.rotation.x = Math.sin(t * 0.7 + it.phase) * 0.3;
      if (blocked || d > r) continue;
      this.root.remove(it.g);
      this.items.splice(i, 1);
      this.taken.add(it.id);
      saveTaken(this.taken);
      this.onPick?.(this.count, this.total, REWARD);
      if (this.count === this.total) this.onAll?.(ALL_BONUS);
    }
  }
}
