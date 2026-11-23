import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { windowGlow } from './realism.js';

/**
 * Entrada del Charco de San Ginés, como en la foto de José Manuel: el estanque
 * entre el paseo (Avenida César Manrique) y el puente de la Avenida Olof
 * Palme, que lo une con el mar. Muros curvos de piedra volcánica negra con
 * llagas claras y remate de hormigón claro, el agua verdosa, las barandillas
 * azules del puente, el esqueleto blanco de ballena junto al puente, las
 * farolas azules altas como mástiles y palmeras (map.extraPalms).
 * El estanque sale de la foto aérea: el mapa no lo traía como agua.
 */

// esquinas del estanque: noroeste, noreste, sureste (en el puente) y suroeste (en el puente)
const NW = [427, 222], NE = [466, 217.5], SE = [466, 244.2], SW = [427, 272.4];
const CURVE = 6;          // radio de las esquinas del lado del paseo
const TOP = 0.9, WATER = 0.35, THICK = 0.5;
export const ENTRADA_PALMS = [[414, 231], [416.5, 246], [411.5, 239.5]];
const SKELETON = [421.6, 257];
const MASTS = [[423.5, 224], [470, 215.5], [470.2, 240.5], [423.2, 268], [446, 215.5]];

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const norm = (v) => { const L = Math.hypot(v[0], v[1]); return [v[0] / L, v[1] / L]; };

/** el contorno del muro: del puente al oeste, esquinas redondas en el paseo, y vuelta al puente al este */
function outline() {
  const pts = [SW];
  const round = (P, from, to) => {
    const a = norm(sub(from, P)), b = norm(sub(to, P));
    const t0 = [P[0] + a[0] * CURVE, P[1] + a[1] * CURVE], t1 = [P[0] + b[0] * CURVE, P[1] + b[1] * CURVE];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8, u = 1 - t;
      // curva de Bézier por la esquina: se acerca mucho a un cuarto de círculo
      pts.push([u * u * t0[0] + 2 * u * t * P[0] + t * t * t1[0], u * u * t0[1] + 2 * u * t * P[1] + t * t * t1[1]]);
    }
  };
  round(NW, SW, NE);
  round(NE, NW, SE);
  pts.push(SE);
  return pts;
}

/** piedras volcánicas negras irregulares con llagas claras (4 m × 1 m de muro) */
function stoneTex() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#9a958d';
  g.fillRect(0, 0, 256, 64);
  let s = 11;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  // piedras irregulares de 5 o 6 lados, por hiladas, con algún tono más claro
  for (let y = 0; y < 64; y += 16) {
    for (let x = -12 + r() * 8; x < 256; x += 20 + r() * 12) {
      const w = 16 + r() * 12, h = 12 + r() * 5, v = 46 + r() * 40, n = 5 + (r() < 0.5 ? 1 : 0);
      const cx = x + w / 2, cy = y + 8 + (r() - 0.5) * 3;
      g.fillStyle = `rgb(${v},${v - 1},${v - 3})`;
      g.beginPath();
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + r() * 0.5;
        const px = cx + Math.cos(a) * w / 2 * (0.8 + r() * 0.25), py = cy + Math.sin(a) * h / 2 * (0.8 + r() * 0.25);
        if (k) g.lineTo(px, py); else g.moveTo(px, py);
      }
      g.fill();
      g.fillStyle = 'rgba(255,255,255,0.06)';
      g.fillRect(cx - w / 4, cy - h / 3, w / 2, 2);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** cara vertical a lo largo de la línea, de y0 a y1, con la textura por metros */
function face(line, off, y0, y1, flip) {
  const pos = [], uv = [];
  let d = 0;
  const P = line.map((p, i) => {
    const a = line[Math.max(0, i - 1)], b = line[Math.min(line.length - 1, i + 1)];
    const [nx, nz] = norm([-(b[1] - a[1]), b[0] - a[0]]);
    return [p[0] + nx * off, p[1] + nz * off];
  });
  for (let i = 0; i < P.length - 1; i++) {
    const A = P[i], B = P[i + 1], L = Math.hypot(B[0] - A[0], B[1] - A[1]);
    const u0 = d / 4, u1 = (d + L) / 4;
    d += L;
    const q = [[A[0], y0, A[1], u0, y0], [B[0], y0, B[1], u1, y0], [B[0], y1, B[1], u1, y1], [A[0], y1, A[1], u0, y1]];
    const tri = flip ? [0, 2, 1, 0, 3, 2] : [0, 1, 2, 0, 2, 3];
    for (const k of tri) { pos.push(q[k][0], q[k][1], q[k][2]); uv.push(q[k][3], q[k][4]); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

/** caja de largo de A a B (a lo largo), alto h con la base en y, ancho w */
function beam(A, B, y, h, w) {
  const L = Math.hypot(B[0] - A[0], B[1] - A[1]);
  const g = new THREE.BoxGeometry(L, h, w);
  g.rotateY(Math.atan2(-(B[1] - A[1]), B[0] - A[0]));
  g.translate((A[0] + B[0]) / 2, y + h / 2, (A[1] + B[1]) / 2);
  return g;
}

/** barandilla azul de tubo: pasamanos, barra media y postes cada 1,5 m */
function railing(out, A, B, y0 = 0) {
  out.push(beam(A, B, y0 + 1.0, 0.06, 0.06), beam(A, B, y0 + 0.55, 0.04, 0.04));
  const L = Math.hypot(B[0] - A[0], B[1] - A[1]), n = Math.max(1, Math.round(L / 1.5));
  for (let i = 0; i <= n; i++) {
    const x = A[0] + (B[0] - A[0]) * i / n, z = A[1] + (B[1] - A[1]) * i / n;
    const p = new THREE.CylinderGeometry(0.03, 0.03, 1.0, 6);
    p.translate(x, y0 + 0.5, z);
    out.push(p);
  }
}

/** esqueleto de ballena: columna en arco sobre dos patas, costillas colgando y el cráneo */
function skeleton(out) {
  const [x0, z0] = SKELETON;
  const pts = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20, a = -5 + t * 10;
    pts.push(new THREE.Vector3(0, 0.6 + 3.1 * Math.sin(t * Math.PI) ** 0.8, a));
  }
  const spine = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.16, 8, false);
  const parts = [spine];
  for (let i = 3; i <= 15; i++) {
    const t = i / 20, y = 0.6 + 3.1 * Math.sin(t * Math.PI) ** 0.8, z = -5 + t * 10;
    const len = 1.9 * Math.sin(t * Math.PI) + 0.3;
    const rib = new THREE.TorusGeometry(0.75, 0.05, 5, 12, Math.PI);
    rib.scale(1, len / 0.75, 1);
    rib.rotateZ(Math.PI);
    rib.translate(0, y, z);
    parts.push(rib);
  }
  const skull = new THREE.ConeGeometry(0.45, 1.6, 8);
  skull.rotateX(Math.PI / 2 + 0.3);
  skull.translate(0, 0.9, 5.4);
  parts.push(skull);
  for (const t of [0.04, 0.92]) {
    const z = -5 + t * 10, h = 0.6 + 3.1 * Math.sin(t * Math.PI) ** 0.8;
    const leg = new THREE.CylinderGeometry(0.14, 0.2, h, 8);
    leg.translate(0, h / 2, z);
    parts.push(leg);
  }
  for (const g of parts) {
    const q = g.index ? g.toNonIndexed() : g;
    q.deleteAttribute('uv');
    q.rotateY(0.07);
    q.translate(x0, 0, z0);
    out.push(q);
  }
}

/** farola azul alta como un mástil: crucetas blancas y el foco arriba */
function mast(out, glow, x, z) {
  const p = new THREE.CylinderGeometry(0.08, 0.13, 9, 8); p.translate(x, 4.5, z); out.blue.push(p);
  for (const [y, w] of [[8.2, 1.3], [7.4, 0.8]]) out.white.push(beam([x - w / 2, z], [x + w / 2, z], y, 0.07, 0.07));
  const lamp = new THREE.BoxGeometry(0.32, 0.5, 0.32); lamp.translate(x, 9.2, z); out.white.push(lamp);
  const bulb = new THREE.SphereGeometry(0.14, 8, 6); bulb.translate(x, 8.9, z); glow.push(bulb);
}

export function buildCharcoEntrada(scene, colliders) {
  const group = new THREE.Group();
  group.name = 'charcoEntrada';
  const line = outline();
  const tex = stoneTex();
  // muro: cara de fuera hasta el suelo, cara de dentro hasta el agua; remate claro encima
  const stone = [face(line, -THICK / 2, 0, TOP, true), face(line, THICK / 2, WATER - 0.1, TOP, false)];
  const cap = [];
  for (let i = 0; i < line.length - 1; i++) cap.push(beam(line[i], line[i + 1], TOP, 0.12, THICK + 0.14));
  // agua
  const shape = new THREE.Shape(line.map(([x, z]) => new THREE.Vector2(x, -z)));
  const water = new THREE.ShapeGeometry(shape);
  water.rotateX(-Math.PI / 2);
  water.translate(0, WATER, 0);
  // barandillas azules del puente (a los dos lados de la avenida sobre el canal) y la del muelle de levante
  const blue = [];
  railing(blue, SW, SE);
  railing(blue, [461.8, 263.3], [479.8, 250.3]);
  railing(blue, [466, 224], [466, 238], TOP + 0.12);
  const out = { blue, white: [] }, glow = [];
  for (const [x, z] of MASTS) mast(out, glow, x, z);
  const bones = [];
  skeleton(bones);
  const mats = {
    stone: new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }),
    cap: new THREE.MeshStandardMaterial({ color: 0xc9c4b8, roughness: 0.85 }),
    water: new THREE.MeshStandardMaterial({ color: 0x3f8f86, roughness: 0.12, metalness: 0.15, transparent: true, opacity: 0.88 }),
    blue: new THREE.MeshStandardMaterial({ color: 0x4aa3e6, roughness: 0.4, metalness: 0.2 }),
    white: new THREE.MeshStandardMaterial({ color: 0xf2efe6, roughness: 0.6 }),
    glow: new THREE.MeshStandardMaterial({ color: 0xfffaf0, emissive: 0xfff0c8, emissiveIntensity: 0.05 }),
  };
  const add = (geos, mat, shadow = true) => {
    const m = new THREE.Mesh(mergeGeometries(geos.map(g => (g.index ? g.toNonIndexed() : g)), false), mat);
    m.castShadow = shadow;
    m.receiveShadow = true;
    group.add(m);
  };
  add(stone, mats.stone);
  add(cap, mats.cap);
  add([water], mats.water, false);
  add(out.blue, mats.blue);
  add([...out.white.map(g => { const q = g.toNonIndexed(); q.deleteAttribute('uv'); return q; }), ...bones.map(g => { if (g.getAttribute('uv')) g.deleteAttribute('uv'); return g; })], mats.white);
  add(glow, mats.glow, false);
  // no se puede entrar en el agua: el estanque entero choca
  colliders.addPolygon([...line, line[0]]);
  scene.add(group);
  return { group, update() { mats.glow.emissiveIntensity = 0.05 + windowGlow.value * 4; } };
}
