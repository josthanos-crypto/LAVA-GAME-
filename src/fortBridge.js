import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { windowGlow } from './realism.js';

/**
 * El Castillo de San Gabriel, en su islote (contorno medido sobre la foto
 * aérea, con el baluarte apuntando al nordeste): muros de sillería de
 * basalto en talud, cordón, parapeto con troneras y cañones, garita en la
 * punta, portada con escudo y bandera. Y el Puente de las Bolas que lleva
 * a él: muretes de piedra con albardilla a los dos lados, el puente
 * levadizo de tablones con sus cadenas y los cuatro pilares rematados con
 * las bolas de piedra que le dan nombre, y farolas de forja.
 */

const CASTLE = [[223, 668], [243, 660.5], [251, 685], [240, 689.5], [227, 689], [223, 668]];
const H = 7.5;            // altura del muro del castillo
const DECK = 0.15;        // piso del puente (sobre la calzada peatonal)

function colored(g, hex, j = 0, seed = 1) {
  const geo = g.index ? g.toNonIndexed() : g;
  const c = new THREE.Color(hex), n = geo.getAttribute('position').count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i += 3) {
    const k = 1 + (j ? Math.sin((i + seed) * 12.9898) * 0.5 * j : 0);
    for (let v = i; v < Math.min(n, i + 3); v++) arr.set([c.r * k, c.g * k, c.b * k], v * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  if (!geo.getAttribute('uv')) geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2), 2));
  return geo;
}
const at = (g, x, y, z, ry = 0) => { if (ry) g.rotateY(ry); g.translate(x, y, z); return g; };

/**
 * mampostería de piedra volcánica: piedras irregulares de tonos distintos con la
 * junta de mortero clara (la del castillo, parda; la de los muros de la calzada, gris)
 */
export function masonryTexture({ mortar, stone, spread, seed = 5, rowH = 22 }) {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = mortar;
  g.fillRect(0, 0, 512, 512);
  let s = seed;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let y = 0; y < 512; y += rowH + Math.floor(r() * 10)) {
    const h = rowH + r() * 14;
    let x = -r() * 30;
    while (x < 512) {
      const w = 26 + r() * 46;
      const v = r();
      const col = stone.map((ch, i) => Math.max(0, Math.min(255, Math.round(ch + (v - 0.5) * spread + (i === 0 ? (r() - 0.5) * 12 : 0)))));
      g.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
      g.beginPath();
      const j = () => (r() - 0.5) * 7;
      g.moveTo(x + 3 + j(), y + 3 + j());
      g.lineTo(x + w * 0.5 + j(), y + 2 + j());
      g.lineTo(x + w - 3 + j(), y + 3 + j());
      g.lineTo(x + w - 2 + j(), y + h * 0.55 + j());
      g.lineTo(x + w - 4 + j(), y + h - 2 + j());
      g.lineTo(x + w * 0.45 + j(), y + h - 1 + j());
      g.lineTo(x + 3 + j(), y + h - 3 + j());
      g.lineTo(x + 2 + j(), y + h * 0.45 + j());
      g.closePath();
      g.fill();
      // poros y brillo de la piedra
      for (let k = 0; k < 4; k++) {
        g.fillStyle = `rgba(0,0,0,${0.08 + r() * 0.1})`;
        g.fillRect(x + 4 + r() * (w - 10), y + 4 + r() * (h - 10), 2 + r() * 3, 2 + r() * 2);
      }
      g.fillStyle = 'rgba(255,255,255,.07)';
      g.fillRect(x + 4, y + 4, w - 10, 2);
      x += w;
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** empedrado de la calzada: losas de basalto oscuro con las juntas más claras */
function cobbleTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#8a8680';
  g.fillRect(0, 0, 512, 512);
  let s = 11;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let y = 0; y < 512; y += 26) {
    let x = -r() * 20 + ((y / 26) % 2) * 12;
    while (x < 512) {
      const w = 22 + r() * 26, h = 22 + r() * 6, v = 52 + Math.floor(r() * 34);
      g.fillStyle = `rgb(${v},${v - 1},${v - 3})`;
      g.beginPath();
      g.ellipse(x + w / 2, y + h / 2, w / 2 - 2, h / 2 - 2, (r() - 0.5) * 0.4, 0, Math.PI * 2);
      g.fill();
      x += w;
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** sillería: bloques de basalto de tonos distintos con su llaga */
function ashlarTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#34302c';
  g.fillRect(0, 0, 256, 256);
  let s = 3;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let y = 0; y < 256; y += 32) {
    let x = -r() * 40;
    while (x < 256) {
      const w = 44 + r() * 40, v = 78 + Math.floor(r() * 40);
      g.fillStyle = `rgb(${v},${v - 4},${v - 9})`;
      g.fillRect(x + 2, y + 2, w - 3, 29);
      x += w;
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** cuadrilátero vertical de (ax, az) a (bx, bz), de y0 a y1, con la base desplazada (talud) */
function wallQuad(ax, az, bx, bz, y0, y1, nx, nz, batter, run) {
  const L = Math.hypot(bx - ax, bz - az);
  const P = [
    [ax + nx * batter, y0, az + nz * batter, run / 2.2, y0 / 2.2],
    [bx + nx * batter, y0, bz + nz * batter, (run + L) / 2.2, y0 / 2.2],
    [ax, y1, az, run / 2.2, y1 / 2.2],
    [bx, y1, bz, (run + L) / 2.2, y1 / 2.2],
  ];
  const front = (bz - az) * nx - (bx - ax) * nz >= 0;
  const order = front ? [0, 2, 1, 1, 2, 3] : [0, 1, 2, 1, 3, 2];
  const pos = [], uv = [];
  for (const i of order) { pos.push(P[i][0], P[i][1], P[i][2]); uv.push(P[i][3], P[i][4]); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

/** cañón de avancarga: caña de hierro con sus anillos y el cascabel, sobre cureña de dos gualderas y cuatro ruedas */
function cannon(out, x, y0, z, nx, nz) {
  const prof = [[0, -0.2], [0.09, -0.18], [0.1, -0.1], [0.05, -0.05], [0.25, 0], [0.27, 0.1], [0.25, 0.55], [0.27, 0.6],
    [0.22, 0.66], [0.2, 1.25], [0.22, 1.3], [0.17, 1.36], [0.15, 2.3], [0.2, 2.36], [0.2, 2.55], [0.1, 2.55], [0.1, 2.45]];
  const barrel = new THREE.LatheGeometry(prof.map(([r, h]) => new THREE.Vector2(r, h)), 14);
  barrel.translate(0, -1.1, 0);
  barrel.rotateZ(-Math.PI / 2 + 0.06);   // a lo largo de +x, un poco levantado
  const trun = new THREE.CylinderGeometry(0.07, 0.07, 0.7, 8).rotateX(Math.PI / 2);
  const ry = -Math.atan2(nz, nx);
  // la boca sale ~0,9 m por fuera del muro: el centro de la caña queda 0,35 m hacia dentro
  const cx = x - nx * 0.35, cz = z - nz * 0.35, cy = y0 + 0.62;
  out.dark.push(colored(at(barrel, cx, cy, cz, ry), 0x2b2d2f));
  out.dark.push(colored(at(trun, cx, cy, cz, ry), 0x2b2d2f));
  // cureña: dos gualderas escalonadas, eje y ruedas macizas
  const bx = x - nx * 0.75, bz = z - nz * 0.75;
  for (const s of [-1, 1]) {
    const cheek = new THREE.BoxGeometry(1.25, 0.42, 0.1).translate(0, 0, s * 0.3);
    out.wood.push(colored(at(cheek, bx, y0 + 0.38, bz, ry), 0x5a3b22, 0.08));
    for (const w of [-0.45, 0.4]) {
      const wheel = new THREE.CylinderGeometry(0.2, 0.2, 0.09, 12).rotateX(Math.PI / 2).translate(w, 0, s * 0.4);
      out.wood.push(colored(at(wheel, bx, y0 + 0.2, bz, ry), 0x4a2f1b));
    }
  }
  const axle = new THREE.BoxGeometry(1.1, 0.12, 0.7);
  out.wood.push(colored(at(axle, bx, y0 + 0.22, bz, ry), 0x4a2f1b));
}

function castle(out, colliders) {
  const p = CASTLE;
  let area = 0;
  for (let i = 0; i < p.length - 1; i++) area += p[i][0] * p[i + 1][1] - p[i + 1][0] * p[i][1];
  const o = area >= 0 ? 1 : -1;
  colliders.addPolygon(p);
  let run = 0;
  for (let i = 0; i < p.length - 1; i++) {
    const [ax, az] = p[i], [bx, bz] = p[i + 1];
    const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L;
    const nx = o * uz, nz = -o * ux;
    out.ashlar.push(colored(wallQuad(ax, az, bx, bz, 0, H, nx, nz, 0.9, run), 0xffffff, 0.08, i));
    run += L;
    // cordón de piedra clara bajo el parapeto
    const cord = new THREE.BoxGeometry(L + 0.3, 0.3, 0.45);
    out.stone.push(colored(at(cord, (ax + bx) / 2 + nx * 0.1, H - 0.35, (az + bz) / 2 + nz * 0.1, -Math.atan2(uz, ux)), 0xb7a68e, 0.05));
    // parapeto con troneras cada 6 m
    const n = Math.max(1, Math.round(L / 6));
    for (let k = 0; k < n; k++) {
      const t0 = k / n + 0.45 / L, t1 = (k + 1) / n - 0.45 / L;
      const seg = (t1 - t0) * L;
      if (seg < 0.5) continue;
      const g = new THREE.BoxGeometry(seg, 1.15, 0.65);
      const mx = ax + ux * L * (t0 + t1) / 2 - nx * 0.3, mz = az + uz * L * (t0 + t1) / 2 - nz * 0.3;
      out.ashlarSolid.push(colored(at(g, mx, H + 0.57, mz, -Math.atan2(uz, ux)), 0xffffff, 0.06, k));
    }
  }
  // terraza (plaza de armas)
  const sh = new THREE.Shape(p.slice(0, -1).map(([x, z]) => new THREE.Vector2(x, -z)));
  const top = new THREE.ShapeGeometry(sh);
  top.rotateX(-Math.PI / 2);
  top.translate(0, H - 0.02, 0);
  out.stone.push(colored(top, 0x8a7b68, 0.04));
  // garita en la punta del baluarte
  const [gx, gz] = p[1];
  const cx = p.slice(0, -1).reduce((s, q) => s + q[0], 0) / 5, cz = p.slice(0, -1).reduce((s, q) => s + q[1], 0) / 5;
  const dl = Math.hypot(gx - cx, gz - cz), dx = (gx - cx) / dl, dz = (gz - cz) / dl;
  const kx = gx + dx * 0.4, kz = gz + dz * 0.4;
  out.ashlarSolid.push(colored(at(new THREE.CylinderGeometry(0.95, 0.55, 1.4, 12), kx, H - 0.9, kz), 0xe6dccb, 0.05));
  out.ashlarSolid.push(colored(at(new THREE.CylinderGeometry(0.9, 0.9, 2.2, 12), kx, H + 1.1, kz), 0xffffff, 0.05));
  out.stone.push(colored(at(new THREE.SphereGeometry(0.98, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), kx, H + 2.2, kz), 0xb7a68e));
  out.stone.push(colored(at(new THREE.SphereGeometry(0.16, 8, 6), kx, H + 3.2, kz), 0x9c8a72));
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.atan2(dz, dx);
    out.dark.push(colored(at(new THREE.BoxGeometry(0.12, 0.7, 0.1), kx + Math.cos(a) * 0.91, H + 1.3, kz + Math.sin(a) * 0.91, -a + Math.PI / 2), 0x111111));
  }
  // portada con escudo en el lienzo norte (el que mira al camino)
  const [ax, az] = p[0], [bx, bz] = p[1];
  const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = o * uz, nz = -o * ux;
  const tx = ax + ux * L * 0.35 + nx * 0.62, tz = az + uz * L * 0.35 + nz * 0.62;
  const ry = Math.atan2(nx, nz);
  const archS = (w, h) => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h - w / 2); s.absarc(0, h - w / 2, w / 2, 0, Math.PI, false); s.lineTo(-w / 2, 0); return s; };
  out.stone.push(colored(at(new THREE.ShapeGeometry(archS(3.2, 4.6), 8), tx, 0, tz, ry), 0xb3a998));
  out.dark.push(colored(at(new THREE.ShapeGeometry(archS(2.3, 3.7), 8), tx + nx * 0.03, 0, tz + nz * 0.03, ry), 0x3a2618));
  out.stone.push(colored(at(new THREE.BoxGeometry(1.1, 1.3, 0.15), tx, 5.4, tz, ry), 0xb3a998));
  const shield = new THREE.Shape();
  shield.moveTo(-0.35, 0.45); shield.lineTo(0.35, 0.45); shield.lineTo(0.35, -0.1); shield.quadraticCurveTo(0.3, -0.45, 0, -0.55); shield.quadraticCurveTo(-0.3, -0.45, -0.35, -0.1); shield.lineTo(-0.35, 0.45);
  out.dark.push(colored(at(new THREE.ShapeGeometry(shield, 6), tx + nx * 0.09, 5.4, tz + nz * 0.09, ry), 0x6e5d43));
  // cañones de hierro en sus cureñas de madera, asomando por las troneras del parapeto
  // (los huecos están cada 6 m, ver el parapeto de arriba); aproximación artística
  let guns = 0;
  for (let i = 0; i < p.length - 1 && guns < 10; i++) {
    const [ax, az] = p[i], [bx, bz] = p[i + 1];
    const L = Math.hypot(bx - ax, bz - az);
    const n = Math.max(1, Math.round(L / 6));
    if (n < 2) continue;
    const ux = (bx - ax) / L, uz = (bz - az) / L, nx = o * uz, nz = -o * ux;
    for (let k = 1; k < n && guns < 10; k++, guns++) {
      const gx = ax + ux * L * k / n, gz = az + uz * L * k / n;
      cannon(out, gx, H, gz, nx, nz);
    }
  }
  // sillares claros en las esquinas, alternando soga y tizón, siguiendo el talud
  for (let i = 0; i < p.length - 1; i++) {
    const prev = p[(i - 1 + p.length - 1) % (p.length - 1)], cur = p[i], next = p[i + 1];
    const n1 = [o * (cur[1] - prev[1]), -o * (cur[0] - prev[0])], n2 = [o * (next[1] - cur[1]), -o * (next[0] - cur[0])];
    const l1 = Math.hypot(...n1) || 1, l2 = Math.hypot(...n2) || 1;
    let qx = n1[0] / l1 + n2[0] / l2, qz = n1[1] / l1 + n2[1] / l2;
    const ql = Math.hypot(qx, qz) || 1;
    qx /= ql; qz /= ql;
    const ang = Math.atan2(next[1] - cur[1], next[0] - cur[0]);
    for (let y = 0.3, k = 0; y < H - 0.5; y += 0.62, k++) {
      const off = 0.9 * 1.15 * (1 - y / H) + 0.06;
      const q = new THREE.BoxGeometry(k % 2 ? 1.1 : 0.7, 0.56, k % 2 ? 0.7 : 1.1);
      out.stone.push(colored(at(q, cur[0] + qx * off, y, cur[1] + qz * off, -ang), 0xc4b49a, 0.07, k + i * 7));
    }
  }
  // espadaña con su campana sobre el lienzo que mira a la calzada
  {
    const [ax2, az2] = p[0], [bx3, bz3] = p[1];
    const L2 = Math.hypot(bx3 - ax2, bz3 - az2), u2x = (bx3 - ax2) / L2, u2z = (bz3 - az2) / L2;
    const n2x = o * u2z, n2z = -o * u2x;
    const ex = ax2 + u2x * 3 - n2x * 0.35, ez = az2 + u2z * 3 - n2z * 0.35;
    const ery = -Math.atan2(u2z, u2x);
    const gable = new THREE.Shape();
    gable.moveTo(-1.15, 0); gable.lineTo(1.15, 0); gable.lineTo(1.15, 2.5); gable.lineTo(0.55, 2.5);
    gable.lineTo(0.55, 2.9); gable.lineTo(-0.55, 2.9); gable.lineTo(-0.55, 2.5); gable.lineTo(-1.15, 2.5); gable.lineTo(-1.15, 0);
    const hole = new THREE.Path();
    hole.moveTo(-0.5, 0.75); hole.lineTo(0.5, 0.75); hole.lineTo(0.5, 1.75); hole.absarc(0, 1.75, 0.5, 0, Math.PI, false); hole.lineTo(-0.5, 0.75);
    gable.holes.push(hole);
    const gg = new THREE.ExtrudeGeometry(gable, { depth: 0.55, bevelEnabled: false, curveSegments: 8 });
    gg.translate(0, 0, -0.275);
    out.stone.push(colored(at(gg, ex, H + 1.15, ez, ery), 0xd9ccb4, 0.04));
    out.stone.push(colored(at(new THREE.BoxGeometry(2.6, 0.18, 0.75), ex, H + 1.15 + 2.5, ez, ery), 0xc4b49a));
    for (const sx of [-0.95, 0.95]) {
      out.stone.push(colored(at(new THREE.SphereGeometry(0.17, 10, 8), ex + u2x * sx, H + 1.15 + 2.78, ez + u2z * sx), 0xc4b49a));
    }
    out.stone.push(colored(at(new THREE.SphereGeometry(0.2, 10, 8), ex, H + 1.15 + 3.12, ez), 0xc4b49a));
    const bell = new THREE.LatheGeometry([[0.02, 0.5], [0.18, 0.46], [0.24, 0.25], [0.3, 0.05], [0.36, 0]].map(([x, y]) => new THREE.Vector2(x, y)), 14);
    out.dark.push(colored(at(bell, ex, H + 1.15 + 1.25, ez), 0x6b4a22));
    out.dark.push(colored(at(new THREE.BoxGeometry(1.0, 0.07, 0.07), ex, H + 1.15 + 1.78, ez, ery), 0x1d1f21));
  }
  // el islote: rocas de lava negra alrededor del castillo
  {
    let seed = 9;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < p.length - 1; i++) {
      const [ax3, az3] = p[i], [bx4, bz4] = p[i + 1];
      const L3 = Math.hypot(bx4 - ax3, bz4 - az3), u3x = (bx4 - ax3) / L3, u3z = (bz4 - az3) / L3;
      const n3x = o * u3z, n3z = -o * u3x;
      for (let d = 0.5; d < L3; d += 1.6 + rnd() * 1.4) {
        const away = 1.4 + rnd() * rnd() * 7;
        const rx = ax3 + u3x * d + n3x * away, rz = az3 + u3z * d + n3z * away;
        if (Math.hypot(rx - 223, rz - 660) < 5) continue;   // la entrada desde la calzada, despejada
        const sz = 0.5 + rnd() * 1.3;
        const rock = new THREE.DodecahedronGeometry(sz, 0);
        rock.scale(1 + rnd() * 0.6, 0.45 + rnd() * 0.35, 1 + rnd() * 0.5);
        rock.rotateY(rnd() * 6.28);
        const c2 = rnd() < 0.25 ? 0x4a3a2e : 0x2a2522;
        out.rock.push(colored(at(rock, rx, -0.15 + rnd() * 0.25, rz), c2, 0.18, Math.round(i * 31 + d)));
      }
    }
  }
  // bandera en la terraza
  out.dark.push(colored(at(new THREE.CylinderGeometry(0.05, 0.06, 6, 8), cx, H + 3, cz), 0xd8d8d8));
  const flag = [[0xc60b1e, 0.75, 1], [0xffc400, 0.25, 0.75], [0xc60b1e, 0, 0.25]];
  for (const [hex, y0, y1] of flag) {
    const g = new THREE.PlaneGeometry(1.8, 1.2 * (y1 - y0), 6, 1);
    const q = g.getAttribute('position');
    for (let i = 0; i < q.count; i++) q.setZ(i, Math.sin((q.getX(i) + 0.9) * 2.4) * 0.12);
    g.computeVertexNormals();
    out.flag.push(colored(at(g, cx + 0.95, H + 5.25 + 1.2 * (y0 + y1) / 2 - 0.6, cz, 0.6), hex));
  }
}

/** el Puente de las Bolas: muretes, puente levadizo, pilares con bolas y farolas */
function bridge(out, roads, colliders) {
  const chain = roads.filter(r => r.bolas);
  const lever = chain.find(r => /bolas/i.test(r.name || ''));
  const lamps = [];
  for (const r of chain) {
    const w = Math.max(r.w, 2.6);
    for (let i = 0; i < r.p.length - 1; i++) {
      const [ax, az] = r.p[i], [bx, bz] = r.p[i + 1];
      const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux;
      const ry = -Math.atan2(uz, ux), mx = (ax + bx) / 2, mz = (az + bz) / 2;
      if (r === lever) {
        // tablones del puente levadizo, de lado a lado
        const n = Math.floor(L / 0.3);
        for (let k = 0; k < n; k++) {
          const t = (k + 0.5) / n;
          out.wood.push(colored(at(new THREE.BoxGeometry(0.26, 0.09, w + 0.5), ax + ux * L * t, DECK + 0.05, az + uz * L * t, ry), 0x6b4b30, 0.18, k));
        }
        // barandilla de madera y cadenas desde lo alto de los pilares del principio
        for (const s of [-1, 1]) {
          const ox = nx * s * (w / 2 + 0.2), oz = nz * s * (w / 2 + 0.2);
          out.wood.push(colored(at(new THREE.BoxGeometry(L, 0.08, 0.08), mx + ox, 1.05, mz + oz, ry), 0x5a3b22));
          out.wood.push(colored(at(new THREE.BoxGeometry(L, 0.06, 0.06), mx + ox, 0.6, mz + oz, ry), 0x5a3b22));
          for (let k = 1; k < 4; k++) out.wood.push(colored(at(new THREE.BoxGeometry(0.08, 1.0, 0.08), ax + ux * L * k / 4 + ox, 0.6, az + uz * L * k / 4 + oz), 0x5a3b22));
          const top = new THREE.Vector3(ax + nx * s * (w / 2 + 0.75), 3.3, az + nz * s * (w / 2 + 0.75));
          const end = new THREE.Vector3(bx + nx * s * (w / 2 + 0.15), DECK + 0.15, bz + nz * s * (w / 2 + 0.15));
          const dir = end.clone().sub(top);
          const ch = new THREE.CylinderGeometry(0.045, 0.045, dir.length(), 6);
          ch.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()));
          const mid = top.clone().add(end).multiplyScalar(0.5);
          out.dark.push(colored(at(ch, mid.x, mid.y, mid.z), 0x1d1f21));
        }
        // los cuatro pilares con sus bolas, a cada lado y a cada punta del levadizo
        for (const [px, pz] of [[ax, az], [bx, bz]]) {
          for (const s of [-1, 1]) {
            const qx = px + nx * s * (w / 2 + 0.75), qz = pz + nz * s * (w / 2 + 0.75);
            out.ashlarSolid.push(colored(at(new THREE.BoxGeometry(1.15, 3.2, 1.15), qx, 1.6, qz, ry), 0xffffff, 0.06));
            out.stone.push(colored(at(new THREE.BoxGeometry(1.45, 0.24, 1.45), qx, 3.32, qz, ry), 0xc2b8a8));
            out.stone.push(colored(at(new THREE.CylinderGeometry(0.28, 0.36, 0.3, 10), qx, 3.58, qz), 0xc2b8a8));
            out.stone.push(colored(at(new THREE.SphereGeometry(0.5, 16, 12), qx, 4.2, qz), 0xd4cabb));
            colliders.addPolygon([[qx - 0.6, qz - 0.6], [qx + 0.6, qz - 0.6], [qx + 0.6, qz + 0.6], [qx - 0.6, qz + 0.6], [qx - 0.6, qz - 0.6]], 'bridge');
          }
        }
        continue;
      }
      // piso de losas y cuerpo de piedra del puente (lo que asoma bajo el agua)
      out.stone.push(colored(at(new THREE.BoxGeometry(L + 0.3, 0.12, w + 0.5), mx, DECK - 0.02, mz, ry), 0xa59d90, 0.05, i));
      out.ashlarSolid.push(colored(at(new THREE.BoxGeometry(L + 0.3, 1.6, w + 0.95), mx, DECK - 0.9, mz, ry), 0xffffff, 0.05, i));
      // muretes de piedra con albardilla clara (se cortan junto a los pilares)
      for (const s of [-1, 1]) {
        const ox = nx * s * (w / 2 + 0.22), oz = nz * s * (w / 2 + 0.22);
        const cut = (q) => (lever && (Math.hypot(q[0] - lever.p[0][0], q[1] - lever.p[0][1]) < 1.6 || Math.hypot(q[0] - lever.p[lever.p.length - 1][0], q[1] - lever.p[lever.p.length - 1][1]) < 1.6));
        let t0 = cut([ax, az]) ? 1.4 / L : 0, t1 = cut([bx, bz]) ? 1 - 1.4 / L : 1;
        if (t1 - t0 < 0.05) continue;
        const sl = (t1 - t0) * L, cx = ax + ux * L * (t0 + t1) / 2 + ox, cz = az + uz * L * (t0 + t1) / 2 + oz;
        out.ashlarSolid.push(colored(at(new THREE.BoxGeometry(sl, 0.8, 0.42), cx, DECK + 0.4, cz, ry), 0xffffff, 0.05, i));
        out.stone.push(colored(at(new THREE.BoxGeometry(sl + 0.04, 0.12, 0.56), cx, DECK + 0.86, cz, ry), 0xc2b8a8));
      }
      if (L > 12) lamps.push([mx + nx * (w / 2 + 0.22), mz + nz * (w / 2 + 0.22)], [mx - nx * (w / 2 + 0.22), mz - nz * (w / 2 + 0.22)]);
    }
  }
  // farolas de forja sobre los muretes
  for (const [x, z] of lamps) {
    out.dark.push(colored(at(new THREE.CylinderGeometry(0.05, 0.07, 2.4, 8), x, DECK + 0.9 + 1.2, z), 0x1d1f21));
    out.dark.push(colored(at(new THREE.ConeGeometry(0.3, 0.25, 4), x, DECK + 0.9 + 2.95, z, Math.PI / 4), 0x1d1f21));
    out.glass.push(colored(at(new THREE.BoxGeometry(0.34, 0.45, 0.34), x, DECK + 0.9 + 2.6, z, Math.PI / 4), 0xffe2a8));
  }
}

/** la calzada al castillo: suelo empedrado sobre el agua y muros de mampostería gris con su albardilla */
function causeway(out, roads) {
  for (const r of roads.filter(q => q.calzada)) {
    const w = Math.max(r.w, 3.2);
    for (let i = 0; i < r.p.length - 1; i++) {
      const [ax, az] = r.p[i], [bx, bz] = r.p[i + 1];
      const L = Math.hypot(bx - ax, bz - az);
      if (L < 0.3) continue;
      const ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux;
      const ry = -Math.atan2(uz, ux), mx = (ax + bx) / 2, mz = (az + bz) / 2;
      out.cobble.push(colored(at(new THREE.BoxGeometry(L + 0.6, 0.1, w), mx, DECK, mz, ry), 0xffffff, 0.03, i));
      out.wallSolid.push(colored(at(new THREE.BoxGeometry(L + 0.6, 1.7, w + 1.1), mx, DECK - 0.92, mz, ry), 0xd8d2c8, 0.04, i));
      for (const sd of [-1, 1]) {
        const ox = nx * sd * (w / 2 + 0.27), oz = nz * sd * (w / 2 + 0.27);
        out.wallSolid.push(colored(at(new THREE.BoxGeometry(L + 0.55, 1.05, 0.54), mx + ox, DECK + 0.52, mz + oz, ry), 0xffffff, 0.04, i * 2 + sd));
        out.stone.push(colored(at(new THREE.BoxGeometry(L + 0.58, 0.1, 0.62), mx + ox, DECK + 1.09, mz + oz, ry), 0xd6d1c7, 0.03));
      }
    }
  }
}

/** el cartel de acero oxidado del Museo de Historia de Arrecife, a la entrada del puente */
function museumSign(group, roads) {
  const chain = roads.filter(r => r.bolas);
  if (!chain.length) return;
  const ends = chain.flatMap(r => [r.p[0], r.p[r.p.length - 1]]);
  const town = ends.reduce((a, b) => (b[1] < a[1] ? b : a));
  const other = ends.reduce((a, b) => (Math.hypot(b[0] - town[0], b[1] - town[1]) > Math.hypot(a[0] - town[0], a[1] - town[1]) ? b : a));
  const L = Math.hypot(other[0] - town[0], other[1] - town[1]) || 1;
  const ux = (other[0] - town[0]) / L, uz = (other[1] - town[1]) / L, nx = -uz, nz = ux;
  const W = 3.4, Hh = 2.3;
  const c = document.createElement('canvas');
  c.width = 680; c.height = 460;
  const g = c.getContext('2d');
  // la silueta: el castillo con su espadaña
  g.beginPath();
  g.moveTo(0, 460); g.lineTo(0, 70); g.lineTo(60, 70); g.lineTo(60, 40); g.lineTo(470, 40); g.lineTo(470, 60);
  g.lineTo(520, 60); g.lineTo(520, 10); g.lineTo(600, 10); g.lineTo(600, 60); g.lineTo(680, 60); g.lineTo(680, 460); g.closePath();
  const rust = g.createLinearGradient(0, 0, 680, 460);
  rust.addColorStop(0, '#a5552a'); rust.addColorStop(0.5, '#86401e'); rust.addColorStop(1, '#b0602e');
  g.fillStyle = rust;
  g.fill();
  let sd = 3;
  const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  g.save(); g.clip();
  for (let k = 0; k < 900; k++) {
    g.fillStyle = r() < 0.5 ? `rgba(40,16,6,${r() * 0.25})` : `rgba(190,100,50,${r() * 0.18})`;
    g.fillRect(r() * 680, r() * 460, 2 + r() * 10, 1 + r() * 5);
  }
  g.restore();
  g.clearRect(540, 22, 40, 34);   // el hueco de la campana
  g.fillStyle = '#ece3cf';
  g.font = '600 74px Georgia, "Times New Roman", serif';
  g.textBaseline = 'alphabetic';
  g.fillText('MUSEO DE', 150, 170);
  g.font = '600 96px Georgia, "Times New Roman", serif';
  g.fillText('HISTORIA', 128, 285);
  g.font = '600 50px Georgia, "Times New Roman", serif';
  g.fillText('DE  ARRECIFE', 150, 370);
  // la torre de la H, como en el cartel de verdad
  g.fillRect(52, 120, 18, 260); g.fillRect(100, 120, 18, 260); g.fillRect(52, 230, 66, 16);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const mat = new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.5, roughness: 0.85, metalness: 0, side: THREE.DoubleSide });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(W, Hh), mat);
  const sx = town[0] - ux * 4 + nx * 3.2, sz = town[1] - uz * 4 + nz * 3.2;
  sign.position.set(sx, DECK + 0.25 + Hh / 2, sz);
  sign.rotation.y = Math.atan2(-ux, -uz) + 0.35;
  sign.castShadow = true;
  group.add(sign);
  const feet = new THREE.Mesh(new THREE.BoxGeometry(W * 0.9, 0.25, 0.4), new THREE.MeshStandardMaterial({ color: 0x4a4440, roughness: 0.9 }));
  feet.position.set(sx, DECK + 0.12, sz);
  feet.rotation.y = sign.rotation.y;
  group.add(feet);
}

export function buildFortBridge(scene, map, colliders) {
  const group = new THREE.Group();
  group.name = 'castilloPuente';
  const out = { ashlar: [], ashlarSolid: [], stone: [], dark: [], wood: [], flag: [], glass: [], rock: [], cobble: [], wallSolid: [] };
  castle(out, colliders);
  bridge(out, map.roads, colliders);
  causeway(out, map.roads);
  museumSign(group, map.roads);
  const tex = masonryTexture({ mortar: '#c4ae8e', stone: [156, 132, 106], spread: 52, seed: 5 });
  const greyTex = masonryTexture({ mortar: '#ece7de', stone: [168, 163, 155], spread: 46, seed: 17, rowH: 18 });
  const cobTex = cobbleTexture();
  const add = (geos, mat, shadow = true) => {
    if (!geos.length) return null;
    const m = new THREE.Mesh(mergeGeometries(geos.map(g => (g.index ? g.toNonIndexed() : g)), false), mat);
    m.castShadow = shadow;
    m.receiveShadow = true;
    group.add(m);
    return m;
  };
  // sillería con coordenadas de textura planas (las cajas usan las suyas, a escala)
  const boxUV = (geos, k = 2.2) => geos.map(g => {
    const p = g.getAttribute('position'), n = g.getAttribute('normal'), uv = g.getAttribute('uv');
    for (let i = 0; i < p.count; i++) {
      const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
      if (ay > ax && ay > az) { uv.setXY(i, p.getX(i) / k, p.getZ(i) / k); continue; }
      const u = ax > az ? p.getZ(i) : p.getX(i);
      uv.setXY(i, u / k, p.getY(i) / k);
    }
    return g;
  });
  // de noche, los focos de abajo iluminan los muros del castillo
  const castleMat = new THREE.MeshStandardMaterial({ map: tex, vertexColors: true, roughness: 0.92, side: THREE.DoubleSide, emissive: 0xffb36b, emissiveMap: tex, emissiveIntensity: 0 });
  const castleSolid = new THREE.MeshStandardMaterial({ map: tex, vertexColors: true, roughness: 0.92, emissive: 0xffb36b, emissiveMap: tex, emissiveIntensity: 0 });
  add(out.ashlar, castleMat);
  add(boxUV(out.ashlarSolid), castleSolid);
  add(boxUV(out.wallSolid, 2.6), new THREE.MeshStandardMaterial({ map: greyTex, vertexColors: true, roughness: 0.93 }));
  add(boxUV(out.cobble, 3.2), new THREE.MeshStandardMaterial({ map: cobTex, vertexColors: true, roughness: 0.95 }), false);
  add(out.rock, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.97, flatShading: true }));
  const stoneMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, side: THREE.DoubleSide, emissive: 0xffb36b, emissiveIntensity: 0 });
  add(out.stone, stoneMat);
  add(out.dark, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.35, side: THREE.DoubleSide }));
  add(out.wood, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 }));
  add(out.flag, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, side: THREE.DoubleSide }));
  const lampMat = new THREE.MeshStandardMaterial({ vertexColors: true, emissive: 0xffc870, emissiveIntensity: 0.1, roughness: 0.3 });
  add(out.glass, lampMat, false);
  scene.add(group);
  return {
    group,
    update() {
      lampMat.emissiveIntensity = 0.1 + windowGlow.value * 3;
      castleMat.emissiveIntensity = castleSolid.emissiveIntensity = windowGlow.value * 0.42;
      stoneMat.emissiveIntensity = windowGlow.value * 0.12;
    },
  };
}
