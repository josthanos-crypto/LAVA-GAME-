import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/* ─── utils ─── */
function polyArea(pts) {
  let a = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    a += (pts[j][0] + pts[i][0]) * (pts[j][1] - pts[i][1]);
  }
  return Math.abs(a / 2);
}
function centroid(pts) {
  let x = 0, z = 0;
  for (const [px, pz] of pts) { x += px; z += pz; }
  return [x / pts.length, z / pts.length];
}
function pointInPoly(poly, x, z) {
  let inn = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inn = !inn;
  }
  return inn;
}
function polyShape(pts) {
  const shape = new THREE.Shape();
  shape.moveTo(pts[0][0], -pts[0][1]);
  for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i][0], -pts[i][1]);
  return shape;
}
function flatPoly(pts, y, color) {
  let g;
  try { g = new THREE.ShapeGeometry(polyShape(pts)); } catch { return null; }
  g.rotateX(-Math.PI / 2);
  g.translate(0, y, 0);
  const c = new THREE.Color(color);
  const n = g.getAttribute('position').count;
  const cols = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  return g.toNonIndexed();
}
function offsetPolyline(points, off) {
  const out = [];
  for (let i = 0; i < points.length; i++) {
    const [px, pz] = points[i];
    const [ax, az] = points[Math.max(0, i - 1)];
    const [bx, bz] = points[Math.min(points.length - 1, i + 1)];
    const dx = bx - ax, dz = bz - az;
    const len = Math.hypot(dx, dz) || 1;
    out.push([px + (-dz / len) * off, pz + (dx / len) * off]);
  }
  return out;
}
function lineGeometry(points, y, hw = 0.12) {
  const positions = [], indices = [];
  let vi = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, az] = points[i], [bx, bz] = points[i + 1];
    const dx = bx - ax, dz = bz - az;
    const len = Math.hypot(dx, dz);
    if (len < 0.01) continue;
    const nx = -dz / len, nz = dx / len;
    positions.push(
      ax + nx * hw, y, az + nz * hw, ax - nx * hw, y, az - nz * hw,
      bx + nx * hw, y, bz + nz * hw, bx - nx * hw, y, bz - nz * hw,
    );
    indices.push(vi, vi + 2, vi + 1, vi + 1, vi + 2, vi + 3);
    vi += 4;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}
function rngSeed(s) {
  let x = s | 0;
  return () => { x = (x * 16807) % 2147483647; return x / 2147483647; };
}
function bbox(pts) {
  const xs = pts.map(p => p[0]), zs = pts.map(p => p[1]);
  return [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)];
}
function sampleInPoly(pts, rng, maxTries = 40) {
  const [x0, x1, z0, z1] = bbox(pts);
  for (let i = 0; i < maxTries; i++) {
    const x = x0 + rng() * (x1 - x0), z = z0 + rng() * (z1 - z0);
    if (pointInPoly(pts, x, z)) return [x, z];
  }
  return null;
}
function matStd(o) {
  return new THREE.MeshStandardMaterial({ roughness: 0.9, metalness: 0.02, ...o });
}

/* ─── textures ─── */
function grassTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#4a7a3e';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 8000; i++) {
    const v = Math.random();
    if (v < 0.35) ctx.fillStyle = 'rgba(70,130,55,0.35)';
    else if (v < 0.55) ctx.fillStyle = 'rgba(35,70,30,0.25)';
    else if (v < 0.8) ctx.fillStyle = 'rgba(100,150,60,0.2)';
    else ctx.fillStyle = 'rgba(180,160,70,0.12)'; // hierba seca canaria
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 2.5, 1 + Math.random() * 2);
  }
  // manchas de tierra
  for (let i = 0; i < 18; i++) {
    const x = Math.random() * 256, y = Math.random() * 256, r = 6 + Math.random() * 16;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(120,95,55,0.35)');
    g.addColorStop(1, 'rgba(120,95,55,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.repeat.set(0.12, 0.12);
  tex.anisotropy = 8;
  return tex;
}

function plazaTileTexture() {
  // baldosa canaria / piedra volcánica clara
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#c8bba5';
  ctx.fillRect(0, 0, 256, 256);
  const tile = 32;
  for (let y = 0; y < 256; y += tile) {
    for (let x = 0; x < 256; x += tile) {
      const odd = ((x + y) / tile) % 2;
      const base = odd ? 195 : 180;
      const r = base + Math.floor(Math.random() * 18);
      const g = base - 8 + Math.floor(Math.random() * 14);
      const b = base - 22 + Math.floor(Math.random() * 12);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x + 1, y + 1, tile - 2, tile - 2);
      // micro grain
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(60,45,30,0.08)';
        ctx.fillRect(x + 3 + Math.random() * 26, y + 3 + Math.random() * 26, 1.5, 1.5);
      }
    }
  }
  ctx.strokeStyle = 'rgba(90,75,55,0.4)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i <= 256; i += tile) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.repeat.set(0.35, 0.35);
  tex.anisotropy = 8;
  return tex;
}

function pathTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#b8a888';
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 2000; i++) {
    ctx.fillStyle = Math.random() < 0.5 ? 'rgba(90,70,45,0.15)' : 'rgba(210,195,160,0.15)';
    ctx.fillRect(Math.random() * 128, Math.random() * 128, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.repeat.set(0.5, 0.5);
  return tex;
}

function rubberPlayTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  // suelo de caucho de colores (rojo/verde típico)
  const g = ctx.createLinearGradient(0, 0, 128, 128);
  g.addColorStop(0, '#c45a3a');
  g.addColorStop(0.5, '#3a8a4a');
  g.addColorStop(1, '#c45a3a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 600; i++) {
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.repeat.set(0.25, 0.25);
  return tex;
}

function gardenMulchTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#6a5038';
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 3000; i++) {
    ctx.fillStyle = Math.random() < 0.5 ? 'rgba(40,30,20,0.3)' : 'rgba(140,110,70,0.25)';
    ctx.fillRect(Math.random() * 128, Math.random() * 128, 1 + Math.random() * 3, 1);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.repeat.set(0.2, 0.2);
  return tex;
}

/* ─── furniture ─── */
function makeLamp(x, z, poleMat, lampMat) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 3.6, 6), poleMat);
  pole.position.y = 1.8;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), lampMat);
  head.position.y = 3.7;
  g.add(pole, head);
  g.position.set(x, 0, z);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}

function makePlanter(x, z, s, stone, soil, leaf) {
  const g = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(s, 0.55, s), stone);
  box.position.y = 0.28;
  const dirt = new THREE.Mesh(new THREE.BoxGeometry(s - 0.12, 0.08, s - 0.12), soil);
  dirt.position.y = 0.58;
  g.add(box, dirt);
  // pequeño arbusto
  const bush = new THREE.Mesh(new THREE.SphereGeometry(s * 0.28, 7, 5), leaf);
  bush.position.y = 0.85;
  bush.scale.y = 0.7;
  g.add(bush);
  g.position.set(x, 0, z);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}

function makeVolcanicRock(x, z, s, mat) {
  const g = new THREE.Mesh(
    new THREE.DodecahedronGeometry(s, 0),
    mat,
  );
  g.position.set(x, s * 0.4, z);
  g.rotation.set(Math.random(), Math.random() * Math.PI, Math.random());
  g.scale.set(1 + Math.random() * 0.4, 0.55 + Math.random() * 0.35, 1 + Math.random() * 0.3);
  g.castShadow = true;
  return g;
}

function makeFlowerBed(x, z, w, d, soil, flowerCols) {
  const g = new THREE.Group();
  const bed = new THREE.Mesh(new THREE.BoxGeometry(w, 0.18, d), soil);
  bed.position.y = 0.12;
  g.add(bed);
  const n = Math.floor(w * d * 4);
  for (let i = 0; i < n; i++) {
    const col = flowerCols[i % flowerCols.length];
    const fl = new THREE.Mesh(
      new THREE.SphereGeometry(0.08 + Math.random() * 0.06, 5, 4),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.7 }),
    );
    fl.position.set((Math.random() - 0.5) * w * 0.8, 0.28, (Math.random() - 0.5) * d * 0.8);
    g.add(fl);
  }
  g.position.set(x, 0, z);
  return g;
}

function makeFountain(x, z) {
  const g = new THREE.Group();
  const stone = matStd({ color: 0xb8a888, roughness: 0.85 });
  const water = matStd({ color: 0x4a9ec8, roughness: 0.15, metalness: 0.3, transparent: true, opacity: 0.85 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.5, 0.45, 16), stone);
  base.position.y = 0.22;
  const pool = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, 0.15, 16), water);
  pool.position.y = 0.48;
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 1.4, 10), stone);
  pillar.position.y = 1.1;
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.7, 0.25, 12), stone);
  bowl.position.y = 1.85;
  const jet = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 6), water);
  jet.position.y = 2.4;
  g.add(base, pool, pillar, bowl, jet);
  g.position.set(x, 0.12, z);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}

function makeNameSign(name, x, z) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#2a4030';
  ctx.fillRect(0, 0, 512, 128);
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 5;
  ctx.strokeRect(8, 8, 496, 112);
  ctx.fillStyle = '#f0ebe0';
  let size = 32;
  ctx.font = `bold ${size}px "Arial Narrow", Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  while (ctx.measureText(name.toUpperCase()).width > 460 && size > 16) {
    size -= 2;
    ctx.font = `bold ${size}px "Arial Narrow", Arial`;
  }
  ctx.fillText(name.toUpperCase(), 256, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const g = new THREE.Group();
  const board = new THREE.Mesh(
    new THREE.PlaneGeometry(Math.min(8, 2.5 + name.length * 0.18), 1.4),
    new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }),
  );
  board.position.y = 2.0;
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.07, 2.0, 6),
    matStd({ color: 0x4a4035, metalness: 0.3, roughness: 0.6 }),
  );
  pole.position.y = 1.0;
  g.add(pole, board);
  g.position.set(x, 0, z);
  return g;
}

/* ─── playground ─── */
function playgroundSet(group, x, z, rng) {
  const red = matStd({ color: 0xc8452e, roughness: 0.55, metalness: 0.15 });
  const blue = matStd({ color: 0x2a6db5, roughness: 0.55, metalness: 0.15 });
  const yellow = matStd({ color: 0xe0b520, roughness: 0.5, metalness: 0.1 });
  const green = matStd({ color: 0x3e8a4f, roughness: 0.55 });
  const dark = matStd({ color: 0x2a2e32, roughness: 0.7, metalness: 0.4 });
  const add = (geo, mat, px, py, pz, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(px, py, pz);
    m.rotation.set(rx, ry, rz);
    m.castShadow = true;
    group.add(m);
  };
  // columpio
  add(new THREE.BoxGeometry(0.12, 2.4, 0.12), red, x - 1.8, 1.2, z);
  add(new THREE.BoxGeometry(0.12, 2.4, 0.12), red, x + 1.8, 1.2, z);
  add(new THREE.BoxGeometry(3.8, 0.12, 0.12), red, x, 2.4, z);
  add(new THREE.BoxGeometry(0.48, 0.08, 0.32), yellow, x - 0.75, 0.55, z);
  add(new THREE.BoxGeometry(0.48, 0.08, 0.32), yellow, x + 0.75, 0.55, z);
  // cadenas
  add(new THREE.CylinderGeometry(0.02, 0.02, 1.7, 4), dark, x - 0.75, 1.5, z);
  add(new THREE.CylinderGeometry(0.02, 0.02, 1.7, 4), dark, x + 0.75, 1.5, z);
  // tobogán
  add(new THREE.BoxGeometry(1.2, 1.6, 1.2), blue, x + 4.2, 0.8, z + 1.5);
  add(new THREE.BoxGeometry(0.9, 0.12, 2.8), yellow, x + 4.2, 0.9, z + 3.2, 0.55, 0, 0);
  // barandilla
  add(new THREE.BoxGeometry(1.3, 0.6, 0.08), blue, x + 4.2, 1.9, z + 1.0);
  // muelle
  add(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 6), red, x - 4.2, 0.25, z + 1.8);
  add(new THREE.BoxGeometry(0.8, 0.35, 0.4), green, x - 4.2, 0.6, z + 1.8);
  // rocódromo bajo
  add(new THREE.BoxGeometry(1.8, 1.5, 0.35), blue, x + 1.5, 0.75, z - 3.2);
  for (let i = 0; i < 6; i++) {
    add(new THREE.SphereGeometry(0.1, 5, 4), [red, yellow, green][i % 3],
      x + 0.9 + (i % 3) * 0.4, 0.4 + Math.floor(i / 3) * 0.5, z - 3.0);
  }
  // arenero
  const sand = matStd({ color: 0xe8d4a4, roughness: 0.98 });
  add(new THREE.BoxGeometry(3.2, 0.2, 2.4), sand, x - 1, 0.15, z + 4.5);
  add(new THREE.BoxGeometry(3.4, 0.25, 0.12), yellow, x - 1, 0.3, z + 3.3);
  add(new THREE.BoxGeometry(3.4, 0.25, 0.12), yellow, x - 1, 0.3, z + 5.7);
  // balancín
  add(new THREE.BoxGeometry(2.8, 0.12, 0.25), green, x + 5, 0.55, z - 2, 0, 0, 0.12);
  add(new THREE.BoxGeometry(0.35, 0.35, 0.35), red, x + 4, 0.85, z - 2);
  add(new THREE.BoxGeometry(0.35, 0.35, 0.35), blue, x + 6, 0.7, z - 2);
  void rng;
}

/* ─── sports markings ─── */
function pitchExtras(a, group, lines, glassWalls) {
  const [cx, cz] = centroid(a.p);
  const [x0, x1, z0, z1] = bbox(a.p);
  const w = x1 - x0, h = z1 - z0;
  const sport = a.sport || '';

  if (sport === 'soccer' || sport === 'football' || (!sport && Math.max(w, h) > 40)) {
    // líneas de área / centro
    const midZ = (z0 + z1) / 2;
    lines.push(lineGeometry([[x0 + 1, midZ], [x1 - 1, midZ]], 0.15, 0.1));
    // porterías
    const goalMat = matStd({ color: 0xf0f0ea, roughness: 0.5, metalness: 0.3 });
    for (const gx of [x0 + 1.5, x1 - 1.5]) {
      for (const gz of [cz - 2.5, cz + 2.5]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 6), goalMat);
        post.position.set(gx, 1.1, gz);
        post.castShadow = true;
        group.add(post);
      }
      const cross = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 5.2), goalMat);
      cross.position.set(gx, 2.2, cz);
      group.add(cross);
    }
  }
  if (sport === 'tennis' || sport === 'padel') {
    // red
    const netMat = matStd({ color: 0xe8e8e0, roughness: 0.7 });
    const net = new THREE.Mesh(new THREE.BoxGeometry(Math.min(w, h) * 0.9, 0.9, 0.04), netMat);
    net.position.set(cx, 0.55, cz);
    if (w > h) net.rotation.y = Math.PI / 2;
    group.add(net);
  }
  if (sport === 'skateboard') {
    const conc = matStd({ color: 0x9aa0a6, roughness: 0.85 });
    // halfpipe simple
    const ramp1 = new THREE.Mesh(new THREE.BoxGeometry(6, 0.3, 3), conc);
    ramp1.position.set(cx - 3, 0.4, cz);
    ramp1.rotation.z = 0.35;
    const ramp2 = new THREE.Mesh(new THREE.BoxGeometry(6, 0.3, 3), conc);
    ramp2.position.set(cx + 3, 0.4, cz);
    ramp2.rotation.z = -0.35;
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 4, 6),
      matStd({ color: 0x888c92, metalness: 0.8, roughness: 0.3 }));
    rail.rotation.z = Math.PI / 2;
    rail.position.set(cx, 0.45, cz + 4);
    group.add(ramp1, ramp2, rail);
  }
  if (sport === 'padel' || sport === 'tennis') {
    for (let i = 0; i < a.p.length - 1; i++) {
      const [ax, az] = a.p[i], [bx, bz] = a.p[i + 1];
      const len = Math.hypot(bx - ax, bz - az);
      if (len < 0.5) continue;
      const wg = new THREE.BoxGeometry(len, sport === 'padel' ? 3 : 2, 0.06);
      wg.rotateY(-Math.atan2(bz - az, bx - ax));
      wg.translate((ax + bx) / 2, (sport === 'padel' ? 1.5 : 1) + 0.12, (az + bz) / 2);
      glassWalls.push(wg);
    }
  }
  // línea perimetral
  lines.push(lineGeometry(offsetPolyline(a.p, -0.45), 0.145, 0.1));
}

const SPORT_COLOR = {
  padel: 0x2a6db5, tennis: 0x9c5a35, basketball: 0xc47a3d,
  soccer: 0x3e8a4f, football: 0x3e8a4f, multi: 0x4f7d8c, futsal: 0x4f7d8c,
  skateboard: 0x8a9098, boules: 0xb8a878,
};

const FLOWER = [0xc8452e, 0xe0b520, 0xd94f8a, 0xf0f0ea, 0x6a4ab0, 0xff7a45];

/**
 * Parques, plazas, jardines, parques infantiles y canchas — realistas estilo Lanzarote.
 */
export function buildParksAndPlazas(map, scene) {
  // bancos y papeleras de parques y plazas: se pueden atropellar (props.js)
  const props = (map.extraProps ||= []);
  const benchAt = (x, z, rot) => ({ t: 'bench', x, z, a: rot + Math.PI });
  const binAt = (x, z) => ({ t: 'bin', x, z, a: 0 });
  const grassBases = [];
  const plazaBases = [];
  const gardenBases = [];
  const playBases = [];
  const pitchBases = [];
  const pathGeoms = [];
  const lines = [];
  const glassWalls = [];
  const detail = new THREE.Group();
  detail.name = 'parkDetail';
  const playgrounds = new THREE.Group();

  const grassTex = grassTexture();
  const plazaTex = plazaTileTexture();
  const pathTex = pathTexture();
  const rubberTex = rubberPlayTexture();
  const mulchTex = gardenMulchTexture();

  const wood = matStd({ color: 0x9c6b3d, roughness: 0.85 });
  const stone = matStd({ color: 0xa89880, roughness: 0.9 });
  const soil = matStd({ color: 0x6a5038, roughness: 0.95, map: mulchTex });
  const leaf = matStd({ color: 0x3f7a38, roughness: 0.8 });
  const picon = matStd({ color: 0x3a3530, roughness: 0.95 }); // picón volcánico
  const poleMat = matStd({ color: 0x4a4f55, metalness: 0.4, roughness: 0.5 });
  const lampMat = matStd({ color: 0xfff0c8, emissive: 0xffe8a0, emissiveIntensity: 0.15 });

  let areaIdx = 0;
  for (const a of map.areas || []) {
    const rng = rngSeed(1000 + areaIdx * 97 + Math.floor((a.p[0]?.[0] || 0) * 10));
    areaIdx++;
    const m2 = polyArea(a.p);
    const [cx, cz] = centroid(a.p);
    const [x0, x1, z0, z1] = bbox(a.p);

    if (a.k === 'park') {
      // blanco + textura de hierba (el tinte lo da el mapa)
      const tint = rng() > 0.5 ? 0xf2f5e8 : 0xe8f0d8;
      const g = flatPoly(a.p, 0.12, tint);
      if (g) grassBases.push(g);

      // caminos de arena/tierra cruzando el parque
      if (m2 > 400) {
        const pathPts = [];
        const nSeg = m2 > 5000 ? 6 : 3;
        for (let i = 0; i <= nSeg; i++) {
          const t = i / nSeg;
          const px = x0 + (x1 - x0) * (0.15 + t * 0.7) + (rng() - 0.5) * Math.min(12, (x1 - x0) * 0.1);
          const pz = z0 + (z1 - z0) * (0.2 + Math.sin(t * Math.PI) * 0.4 + t * 0.2) + (rng() - 0.5) * 4;
          if (pointInPoly(a.p, px, pz)) pathPts.push([px, pz]);
        }
        if (pathPts.length >= 2) {
          // ribbon path
          const hw = m2 > 8000 ? 1.6 : 1.1;
          for (let i = 0; i < pathPts.length - 1; i++) {
            const [ax, az] = pathPts[i], [bx, bz] = pathPts[i + 1];
            const len = Math.hypot(bx - ax, bz - az);
            if (len < 0.5) continue;
            const pg = new THREE.PlaneGeometry(hw * 2, len);
            pg.rotateX(-Math.PI / 2);
            pg.rotateY(Math.atan2(bx - ax, bz - az));
            pg.translate((ax + bx) / 2, 0.135, (az + bz) / 2);
            pathGeoms.push(pg);
          }
        }
      }

      // bordillo / seto perimetral bajo
      if (m2 > 200) {
        for (let i = 0; i < a.p.length - 1; i += Math.max(1, Math.floor(a.p.length / 24))) {
          const [ax, az] = a.p[i], [bx, bz] = a.p[Math.min(i + 1, a.p.length - 1)];
          const mx = (ax + bx) / 2, mz = (az + bz) / 2;
          if (!pointInPoly(a.p, mx + (bz - az) * 0.02, mz - (bx - ax) * 0.02)) continue;
          const hedge = new THREE.Mesh(
            new THREE.BoxGeometry(Math.min(2.5, Math.hypot(bx - ax, bz - az) * 0.6), 0.55, 0.4),
            leaf,
          );
          hedge.position.set(mx, 0.35, mz);
          hedge.rotation.y = Math.atan2(bx - ax, bz - az);
          hedge.castShadow = true;
          detail.add(hedge);
        }
      }

      // rocas de picón (Lanzarote)
      const nRocks = Math.min(14, Math.max(2, Math.floor(m2 / 800)));
      for (let i = 0; i < nRocks; i++) {
        const pt = sampleInPoly(a.p, rng);
        if (!pt) continue;
        detail.add(makeVolcanicRock(pt[0], pt[1], 0.25 + rng() * 0.45, picon));
      }

      // parterres de flores
      const nBeds = Math.min(6, Math.max(1, Math.floor(m2 / 1500)));
      for (let i = 0; i < nBeds; i++) {
        const pt = sampleInPoly(a.p, rng);
        if (!pt) continue;
        detail.add(makeFlowerBed(pt[0], pt[1], 1.8 + rng() * 1.5, 1.0 + rng(), soil, FLOWER));
      }

      // bancos extras si el parque es grande
      if (m2 > 600) {
        const nBench = Math.min(8, Math.max(2, Math.floor(m2 / 2000)));
        for (let i = 0; i < nBench; i++) {
          const pt = sampleInPoly(a.p, rng);
          if (!pt) continue;
          props.push(benchAt(pt[0], pt[1], rng() * Math.PI * 2));
        }
      }

      // papeleras y farolas
      const nLamps = Math.min(10, Math.max(1, Math.floor(m2 / 1200)));
      for (let i = 0; i < nLamps; i++) {
        const pt = sampleInPoly(a.p, rng);
        if (!pt) continue;
        detail.add(makeLamp(pt[0], pt[1], poleMat, lampMat));
        if (i % 2 === 0) {
          const pt2 = sampleInPoly(a.p, rng);
          if (pt2) props.push(binAt(pt2[0], pt2[1]));
        }
      }

      // mesa de picnic en parques grandes
      if (m2 > 3000) {
        const pt = sampleInPoly(a.p, rng);
        if (pt) {
          const table = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 0.9), wood);
          table.position.set(pt[0], 0.75, pt[1]);
          table.castShadow = true;
          detail.add(table);
          for (const sx of [-0.7, 0.7]) {
            const bench = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.35), wood);
            bench.position.set(pt[0], 0.45, pt[1] + sx);
            detail.add(bench);
          }
        }
      }

      if (a.n) detail.add(makeNameSign(a.n, cx, z0 + 3));

    } else if (a.k === 'plaza') {
      const g = flatPoly(a.p, 0.13, 0xffffff);
      if (g) plazaBases.push(g);

      // patrón radial de adoquines (líneas)
      const nRing = 3;
      for (let r = 1; r <= nRing; r++) {
        const rad = Math.min(x1 - x0, z1 - z0) * 0.15 * r;
        const ring = [];
        for (let i = 0; i <= 24; i++) {
          const ang = (i / 24) * Math.PI * 2;
          const px = cx + Math.cos(ang) * rad, pz = cz + Math.sin(ang) * rad;
          if (pointInPoly(a.p, px, pz)) ring.push([px, pz]);
        }
        if (ring.length > 4) {
          ring.push(ring[0]);
          lines.push(lineGeometry(ring, 0.145, 0.08));
        }
      }

      // fuente central en plazas > 300 m²
      if (m2 > 300) detail.add(makeFountain(cx, cz));

      // jardineras en el perímetro
      for (let i = 0; i < a.p.length - 1; i += Math.max(1, Math.floor(a.p.length / 10))) {
        const [ax, az] = a.p[i];
        const inward = 2.5;
        const dx = cx - ax, dz = cz - az;
        const len = Math.hypot(dx, dz) || 1;
        const px = ax + (dx / len) * inward, pz = az + (dz / len) * inward;
        if (pointInPoly(a.p, px, pz)) {
          detail.add(makePlanter(px, pz, 1.1 + rng() * 0.3, stone, soil, leaf));
        }
      }

      // bancos orientados al centro
      const nBench = Math.min(10, Math.max(3, Math.floor(m2 / 120)));
      for (let i = 0; i < nBench; i++) {
        const ang = (i / nBench) * Math.PI * 2;
        const r = Math.min(x1 - x0, z1 - z0) * 0.28;
        const px = cx + Math.cos(ang) * r, pz = cz + Math.sin(ang) * r;
        if (pointInPoly(a.p, px, pz)) {
          props.push(benchAt(px, pz, ang + Math.PI / 2));
        }
      }

      // farolas
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2 + 0.3;
        const r = Math.min(x1 - x0, z1 - z0) * 0.38;
        const px = cx + Math.cos(ang) * r, pz = cz + Math.sin(ang) * r;
        if (pointInPoly(a.p, px, pz)) detail.add(makeLamp(px, pz, poleMat, lampMat));
      }

      if (a.n) detail.add(makeNameSign(a.n, cx, z0 + 2));

    } else if (a.k === 'garden') {
      const g = flatPoly(a.p, 0.12, 0xe0ead0);
      if (g) gardenBases.push(g);

      // mulch beds
      for (let i = 0; i < Math.min(5, Math.max(1, Math.floor(m2 / 200))); i++) {
        const pt = sampleInPoly(a.p, rng);
        if (!pt) continue;
        detail.add(makeFlowerBed(pt[0], pt[1], 1.4 + rng(), 0.9 + rng() * 0.5, soil, FLOWER));
      }
      // piedras decorativas
      for (let i = 0; i < 4; i++) {
        const pt = sampleInPoly(a.p, rng);
        if (pt) detail.add(makeVolcanicRock(pt[0], pt[1], 0.2 + rng() * 0.3, picon));
      }
      // seto denso
      for (let i = 0; i < a.p.length - 1; i++) {
        if (rng() > 0.55) continue;
        const [ax, az] = a.p[i], [bx, bz] = a.p[i + 1];
        const hedge = new THREE.Mesh(
          new THREE.BoxGeometry(Math.hypot(bx - ax, bz - az) * 0.7, 0.7, 0.35),
          leaf,
        );
        hedge.position.set((ax + bx) / 2, 0.4, (az + bz) / 2);
        hedge.rotation.y = Math.atan2(bx - ax, bz - az);
        detail.add(hedge);
      }
      if (a.n) detail.add(makeNameSign(a.n, cx, cz));

    } else if (a.k === 'playground') {
      const g = flatPoly(a.p, 0.125, 0xffffff);
      if (g) playBases.push(g);
      playgroundSet(playgrounds, cx, cz, rng);
      // valla baja de seguridad
      for (let i = 0; i < a.p.length - 1; i++) {
        const [ax, az] = a.p[i], [bx, bz] = a.p[i + 1];
        const len = Math.hypot(bx - ax, bz - az);
        if (len < 0.4) continue;
        const fence = new THREE.Mesh(
          new THREE.BoxGeometry(len, 1.0, 0.06),
          matStd({ color: 0xd94f3d, roughness: 0.6, metalness: 0.2 }),
        );
        fence.position.set((ax + bx) / 2, 0.55, (az + bz) / 2);
        fence.rotation.y = Math.atan2(bx - ax, bz - az);
        detail.add(fence);
      }
      // banco de padres
      props.push(benchAt(cx - 5, cz, 0.3));
      props.push(binAt(cx - 4, cz + 1.5));

    } else if (a.k === 'pitch') {
      if (a.sportsDone) continue;   // campos, pistas y canchas: sports.js
      if (!a.sport) {
        const w = x1 - x0, h = z1 - z0;
        if (Math.max(w, h) < 28 && Math.min(w, h) < 20) a.sport = 'padel';
        else if (Math.max(w, h) > 50) a.sport = 'soccer';
      }
      const col = SPORT_COLOR[a.sport] || 0x5a7d6e;
      const g = flatPoly(a.p, 0.125, col);
      if (g) pitchBases.push(g);
      pitchExtras(a, detail, lines, glassWalls);
      if (a.n) detail.add(makeNameSign(a.n, cx, z0 + 2));
    }
  }

  // playground nodes sin polígono
  for (const [x, z] of map.playgroundPts || []) {
    const g = flatPoly(
      [[x - 7, z - 6], [x + 7, z - 6], [x + 7, z + 6], [x - 7, z + 6], [x - 7, z - 6]],
      0.125, 0xc45a3a,
    );
    if (g) playBases.push(g);
    playgroundSet(playgrounds, x, z, rngSeed(x * 10 + z));
  }

  const addTextured = (geoms, mapTex, opts = {}) => {
    if (!geoms.length) return;
    const mesh = new THREE.Mesh(
      mergeGeometries(geoms, false),
      matStd({ map: mapTex, vertexColors: true, roughness: opts.roughness ?? 0.92, metalness: 0 }),
    );
    mesh.receiveShadow = true;
    scene.add(mesh);
  };
  const addSolid = (geoms, color, opts = {}) => {
    if (!geoms.length) return;
    const mesh = new THREE.Mesh(
      mergeGeometries(geoms, false),
      matStd({ color, vertexColors: true, roughness: opts.roughness ?? 0.9, metalness: opts.metalness ?? 0 }),
    );
    mesh.receiveShadow = true;
    scene.add(mesh);
  };

  addTextured(grassBases, grassTex, { roughness: 0.95 });
  addTextured(plazaBases, plazaTex, { roughness: 0.88 });
  addTextured(gardenBases, grassTex, { roughness: 0.93 });
  addTextured(playBases, rubberTex, { roughness: 0.85 });
  addSolid(pitchBases, 0xffffff, { roughness: 0.8 });

  if (pathGeoms.length) {
    const mesh = new THREE.Mesh(
      mergeGeometries(pathGeoms, false),
      matStd({ map: pathTex, roughness: 0.95 }),
    );
    mesh.receiveShadow = true;
    scene.add(mesh);
  }
  if (lines.length) {
    scene.add(new THREE.Mesh(
      mergeGeometries(lines.map(g => g.toNonIndexed()), false),
      new THREE.MeshBasicMaterial({ color: 0xf0f0ea }),
    ));
  }
  if (glassWalls.length) {
    scene.add(new THREE.Mesh(
      mergeGeometries(glassWalls, false),
      matStd({ color: 0xbfd8e8, transparent: true, opacity: 0.35, roughness: 0.15, metalness: 0.2 }),
    ));
  }
  scene.add(detail);
  scene.add(playgrounds);
}
