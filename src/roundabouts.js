import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { ROUNDABOUTS, SCULPTURES, islandR } from './places.js';
import { buildHuman } from './humanModel.js';

/**
 * Rotondas de Arrecife: isleta con bordillo, picón negro o rojo, cardones,
 * aloes, tabaibas y piedra volcánica (las palmeras las planta el mundo) y,
 * en el centro, su escultura: las conocidas (Barlovento de César Manrique,
 * el Homenaje a la Vela Latina y el Pescador con el marlín) y, en las demás,
 * juguetes del viento que giran con la brisa, aceros corten, monolitos de
 * basalto o un ancla marinera.
 */

const TOP = 0.3;   // altura de la isleta (por encima de calzada y acera)
const RED = 0xc8261c, YELLOW = 0xf0bf1a, BLUE = 0x1f5fb0, WHITE = 0xf2f0ea, BLACK = 0x18191b;
const TOY = [RED, YELLOW, BLUE, WHITE];

function rng(seed) {
  let s = (seed * 2654435761) % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** pinta una pieza de un color (con algo de variación por cara si j > 0) */
function tinted(g, hex, j = 0, r = Math.random) {
  const geo = g.index ? g.toNonIndexed() : g;
  if (geo.getAttribute('uv')) geo.deleteAttribute('uv');
  const c = new THREE.Color(hex), n = geo.getAttribute('position').count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i += 3) {
    const k = 1 + (j ? (r() - 0.5) * j : 0);
    for (let v = i; v < Math.min(n, i + 3); v++) arr.set([c.r * k, c.g * k, c.b * k], v * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return geo;
}
const place = (g, x, y, z, ry = 0, rx = 0, rz = 0) => {
  if (rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')));
  g.translate(x, y, z);
  return g;
};
const cyl = (r0, r1, h, s = 10) => new THREE.CylinderGeometry(r0, r1, h, s);
const bar = (w, h, d) => new THREE.BoxGeometry(w, h, d);

function piconTexture(base, grains, seed) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = base;
  x.fillRect(0, 0, 256, 256);
  const r = rng(seed);
  for (let i = 0; i < 9000; i++) {
    x.fillStyle = grains[Math.floor(r() * grains.length)];
    x.beginPath();
    x.arc(r() * 256, r() * 256, 0.8 + r() * 2.4, 0, Math.PI * 2);
    x.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// ── plantas y piedras de la isleta ──
function cardon(out, x, z, r) {
  const n = 4 + Math.floor(r() * 5);
  for (let k = 0; k < n; k++) {
    const a = r() * Math.PI * 2, d = r() * 0.35, h = 0.5 + r() * 1.1, rad = 0.08 + r() * 0.05;
    out.push(tinted(place(cyl(rad, rad * 1.05, h, 6), x + Math.cos(a) * d, TOP + h / 2, z + Math.sin(a) * d), 0x5c7c38, 0.18, r));
    out.push(tinted(place(new THREE.SphereGeometry(rad, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2), x + Math.cos(a) * d, TOP + h, z + Math.sin(a) * d), 0x6a8a40, 0.15, r));
  }
}
function aloe(out, x, z, r) {
  const n = 9 + Math.floor(r() * 5), green = r() < 0.5 ? 0x6f8f6a : 0x7c9a5a;
  for (let k = 0; k < n; k++) {
    const L = 0.45 + r() * 0.3;
    const g = new THREE.ConeGeometry(0.06, L, 4);
    g.translate(0, L / 2, 0);
    out.push(tinted(place(g, x, TOP, z, (k / n) * Math.PI * 2 + r() * 0.3, 0.75 + r() * 0.35), green, 0.2, r));
  }
  if (r() < 0.4) {
    // vara con flor naranja
    out.push(tinted(place(cyl(0.015, 0.02, 1.1, 5), x, TOP + 0.55, z), 0x6a7a3a, 0, r));
    out.push(tinted(place(new THREE.ConeGeometry(0.06, 0.28, 6), x, TOP + 1.2, z), 0xe8742a, 0.1, r));
  }
}
function tabaiba(out, x, z, r) {
  const s = 0.3 + r() * 0.3;
  const g = new THREE.IcosahedronGeometry(s, 1);
  g.scale(1, 0.7, 1);
  out.push(tinted(place(g, x, TOP + s * 0.5, z), r() < 0.5 ? 0x7d8f3e : 0x8e9a4a, 0.22, r));
}
function lavaRock(out, x, z, r, red) {
  const s = 0.22 + r() * 0.4;
  const g = new THREE.DodecahedronGeometry(s, 0);
  g.scale(1 + r() * 0.4, 0.55 + r() * 0.3, 1 + r() * 0.3);
  out.push(tinted(place(g, x, TOP + s * 0.2, z, r() * 6), red ? 0x5a3022 : 0x2c2826, 0.25, r));
}

// ── esculturas ──
/** pedestal de basalto; devuelve la altura de arriba */
function pedestal(S, cx, cz, pr, ph, r) {
  S.nature.push(tinted(place(cyl(pr, pr * 1.1, ph, 12), cx, TOP + ph / 2, cz), 0x34302d, 0.14, r));
  S.collide.push([cx, cz, pr * 1.1 + 0.15]);
  return TOP + ph;
}

/** rotor: piezas pintadas que giran en (x, y, z) alrededor de su eje */
function rotor(S, parts, x, y, z, speed, axis = 'y', parent = null) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const m = new THREE.Mesh(mergeGeometries(parts, false), S.mats.paint);
  m.castShadow = true;
  g.add(m);
  (parent || S.group).add(g);
  S.rotors.push({ obj: g, speed, axis });
  return g;
}

/** juguete del viento: copas arriba y un aro con aspas que gira al revés */
function windCups(S, cx, cz, H, r) {
  const b = pedestal(S, cx, cz, 0.55, 0.6, r);
  S.paint.push(tinted(place(cyl(0.06, 0.1, H, 10), cx, b + H / 2, cz), BLACK));
  const off = Math.floor(r() * 4);
  const cups = [tinted(new THREE.SphereGeometry(0.1, 10, 8), RED)];
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2;
    cups.push(tinted(place(cyl(0.022, 0.022, 1.1, 6), Math.cos(a) * 0.55, 0, Math.sin(a) * 0.55, -a, 0, Math.PI / 2), WHITE));
    const cup = new THREE.SphereGeometry(0.24, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    cup.rotateZ(Math.PI / 2);   // la boca mirando de lado, como un anemómetro
    cups.push(tinted(place(cup, Math.cos(a) * 1.1, 0, Math.sin(a) * 1.1, -a + Math.PI / 2), TOY[(k + off) % 4]));
  }
  rotor(S, cups, cx, b + H, cz, 1.7);
  const ring = [tinted(place(new THREE.TorusGeometry(0.8, 0.035, 6, 32), 0, 0, 0, 0, Math.PI / 2), WHITE)];
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    ring.push(tinted(place(bar(0.03, 0.55, 0.95), Math.cos(a) * 0.8, 0, Math.sin(a) * 0.8, -a, 0, 0.5), TOY[(k + off + 1) % 4]));
    ring.push(tinted(place(cyl(0.018, 0.018, 0.8, 5), Math.cos(a) * 0.4, 0, Math.sin(a) * 0.4, -a, 0, Math.PI / 2), BLACK));
  }
  rotor(S, ring, cx, b + H * 0.62, cz, -0.9);
}

/** juguete del viento: hélice de colores con cola que se orienta sola */
function windPropeller(S, cx, cz, H, r) {
  const b = pedestal(S, cx, cz, 0.55, 0.6, r);
  S.paint.push(tinted(place(cyl(0.06, 0.1, H, 10), cx, b + H / 2, cz), BLACK));
  const off = Math.floor(r() * 4);
  const head = rotor(S, [
    tinted(place(new THREE.CapsuleGeometry(0.14, 0.7, 3, 10), 0, 0, 0, 0, Math.PI / 2), WHITE),
    tinted(place(bar(0.03, 0.8, 0.9), 0, 0.2, -0.85, 0, 0.25), TOY[off % 4]),
  ], cx, b + H, cz, 0.18);
  const blades = [tinted(new THREE.SphereGeometry(0.12, 10, 8), RED)];
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    const g = bar(0.16, 1.15, 0.025);
    g.translate(0, 0.62, 0);
    g.rotateY(0.4);
    g.rotateZ(a);
    blades.push(tinted(g, TOY[(k + off) % 4]));
  }
  rotor(S, blades, 0, 0, 0.5, 3.2, 'z', head);
}

/** juguete del viento: espiral de placas de colores que gira despacio */
function windHelix(S, cx, cz, H, r) {
  const b = pedestal(S, cx, cz, 0.55, 0.6, r);
  S.steel.push(place(cyl(0.035, 0.035, H, 8), cx, b + H / 2, cz));
  const plates = [];
  const n = 12, off = Math.floor(r() * 4);
  for (let k = 0; k < n; k++) {
    const y = 0.6 + (k / (n - 1)) * (H - 1.1);
    plates.push(tinted(place(bar(1.0, 0.035, 0.24), 0, y, 0, (k / n) * Math.PI * 1.6), TOY[(k + off) % 4]));
  }
  plates.push(tinted(place(new THREE.SphereGeometry(0.16, 12, 8), 0, H, 0), RED));
  rotor(S, plates, cx, b, cz, 0.85);
}

/** acero corten: tres planchas curvas apoyadas entre sí */
function corten(S, cx, cz, H, r) {
  const b = pedestal(S, cx, cz, 0.9, 0.35, r);
  const a0 = r() * Math.PI;
  for (let k = 0; k < 3; k++) {
    const h = H * (0.7 + 0.3 * r()), w = 0.9 + r() * 0.5;
    const g = new THREE.BoxGeometry(w, h, 0.07, 6, 10, 1);
    const p = g.getAttribute('position');
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i) / w, v = p.getY(i) / h;
      p.setZ(i, p.getZ(i) + 0.35 * u * u + 0.15 * v * v);
    }
    g.computeVertexNormals();
    g.translate(0, h / 2, 0);
    const a = a0 + (k / 3) * Math.PI * 2;
    S.corten.push(tinted(place(g, cx + Math.cos(a) * 0.45, b, cz + Math.sin(a) * 0.45, -a + Math.PI / 2, 0.1), 0x8b4a24, 0.12, r));
  }
}

/** monolito de basalto con dos aros de acero */
function monolith(S, cx, cz, H, r) {
  const b = pedestal(S, cx, cz, 0.8, 0.3, r);
  const g = cyl(0.32, 0.55, H, 4);
  S.nature.push(tinted(place(g, cx, b + H / 2, cz, Math.PI / 4 + r()), 0x2f2b28, 0.12, r));
  S.steel.push(place(new THREE.TorusGeometry(0.85, 0.055, 8, 40), cx, b + H * 0.62, cz, r() * 3, 1.2, 0.3));
  S.steel.push(place(new THREE.TorusGeometry(0.62, 0.045, 8, 36), cx, b + H * 0.45, cz, r() * 3, 1.9, -0.4));
}

/** ancla marinera sobre piedras */
function anchor(S, cx, cz, H, r) {
  const b = pedestal(S, cx, cz, 1.0, 0.25, r);
  const parts = [];
  parts.push(place(cyl(0.09, 0.09, H, 10), 0, H / 2 + 0.3, 0));
  parts.push(place(cyl(0.06, 0.06, H * 0.5, 8), 0, H * 0.9, 0, 0, 0, Math.PI / 2));
  parts.push(place(new THREE.TorusGeometry(0.22, 0.05, 8, 16), 0, H + 0.45, 0));
  const arm = new THREE.TorusGeometry(H * 0.32, 0.085, 8, 20, Math.PI);
  arm.rotateZ(Math.PI);
  parts.push(place(arm, 0, H * 0.32 + 0.3, 0));
  for (const s of [-1, 1]) parts.push(place(new THREE.ConeGeometry(0.2, 0.5, 4), s * H * 0.32, H * 0.32 + 0.45, 0, 0, 0, -s * 0.5));
  const g = mergeGeometries(parts.map(p => { if (p.getAttribute('uv')) p.deleteAttribute('uv'); return p.index ? p.toNonIndexed() : p; }), false);
  S.paint.push(tinted(place(g, cx, b - 0.2, cz, r() * 6, 0, 0.08), 0x1d1f22));
}

/** Barlovento (César Manrique): mástil de hierro con piezas de colores y veleta arriba */
function barlovento(S, cx, cz, r) {
  const H = 8.6;
  const b = pedestal(S, cx, cz, 1.1, 0.7, r);
  S.paint.push(tinted(place(cyl(0.1, 0.2, H, 10), cx, b + H / 2, cz), BLACK));
  const P = (g, hex, x, y, z, ry = 0, rx = 0, rz = 0) => S.paint.push(tinted(place(g, cx + x, b + y, cz + z, ry, rx, rz), hex));
  // piezas grandes de chapa pintada, soldadas al mástil a distintas alturas
  P(cyl(1.5, 1.5, 0.08, 32), RED, 0.7, 2.4, 0, 0.3, 0, Math.PI / 2);
  P(cyl(1.5, 1.5, 0.08, 32), BLACK, 0.74, 2.4, 0, 0.3, 0, Math.PI / 2 + 0.002);
  P(new THREE.TorusGeometry(1.2, 0.11, 8, 28, Math.PI * 1.25), WHITE, -0.4, 3.9, 0.2, 0.6, 0, 0.4);
  P(bar(2.6, 0.12, 0.12), BLACK, 0.4, 4.7, 0, 0.3, 0, 0.5);
  P(new THREE.ConeGeometry(0.95, 2.4, 3), BLUE, -0.95, 5.4, 0, 0.9, 0, Math.PI / 2);
  P(cyl(0.85, 0.85, 0.08, 28), YELLOW, 0.6, 6.4, 0.1, 1.2, Math.PI / 2, 0);
  P(bar(0.12, 2.3, 0.12), BLACK, -0.45, 6.9, 0.2, 0, 0.4, -0.5);
  P(new THREE.TorusGeometry(0.65, 0.08, 8, 24), RED, 0, 7.6, 0, 0.3, 0.6, 0);
  P(bar(1.3, 0.9, 0.06), WHITE, 0.2, 1.5, -0.5, 2.0, 0.1, 0.2);
  const vane = [
    tinted(place(bar(1.8, 0.05, 0.05), 0, 0, 0), BLACK),
    tinted(place(new THREE.ConeGeometry(0.16, 0.4, 4), 1.0, 0, 0, 0, 0, -Math.PI / 2), RED),
    tinted(place(bar(0.04, 0.5, 0.5), -0.85, 0, 0), WHITE),
  ];
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    const cup = new THREE.SphereGeometry(0.18, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    cup.rotateZ(Math.PI / 2);
    vane.push(tinted(place(cup, Math.cos(a) * 0.55, 0.45, Math.sin(a) * 0.55, -a + Math.PI / 2), TOY[k]));
  }
  rotor(S, vane, cx, b + H + 0.1, cz, 1.1);
}

/** triángulo con panza (vela): esquinas A, B, C y bolsa hacia n */
function sail(A, B, C, belly, N = 10) {
  const pos = [], idx = [];
  const n = new THREE.Vector3().subVectors(B, A).cross(new THREE.Vector3().subVectors(C, A)).normalize();
  const row = [];
  for (let i = 0; i <= N; i++) {
    row.push([]);
    for (let j = 0; j <= N - i; j++) {
      const u = i / N, v = j / N, w = 1 - u - v;
      const p = new THREE.Vector3().addScaledVector(A, w).addScaledVector(B, u).addScaledVector(C, v);
      p.addScaledVector(n, belly * 27 * u * v * w);
      row[i].push(pos.length / 3);
      pos.push(p.x, p.y, p.z);
    }
  }
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N - i; j++) {
      idx.push(row[i][j], row[i + 1][j], row[i][j + 1]);
      if (j < N - i - 1) idx.push(row[i + 1][j], row[i + 1][j + 1], row[i][j + 1]);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Homenaje a la Vela Latina: barquillo con su vela latina y foque, todo de corten */
function velaLatina(S, cx, cz, r) {
  const b = pedestal(S, cx, cz, 3.2, 0.6, r);
  const yaw = 0.6, cy = Math.cos(yaw), sy = Math.sin(yaw);
  // de coordenadas del barco (x babor-estribor, z proa) al mundo
  const V = (x, y, z) => new THREE.Vector3(cx + x * cy + z * sy, b + y, cz - x * sy + z * cy);
  const hull = new THREE.SphereGeometry(1, 24, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  hull.scale(1.5, 1.1, 5.2);
  S.corten.push(tinted(place(hull, cx, b + 1.15, cz, yaw), 0x7e4322, 0.08, r));
  S.corten.push(tinted(place(bar(2.6, 0.12, 9.6), cx, b + 1.12, cz, yaw), 0x6e3a1e, 0, r));
  // mástil algo caído hacia proa y entena larga cruzada
  const mast = cyl(0.13, 0.2, 9.5, 10);
  S.corten.push(tinted(place(mast, V(0, 0, 1).x, b + 1.1 + 4.75, V(0, 0, 1).z, yaw, 0.06), 0x7a4020, 0, r));
  const A = V(0, 2.2, 5.6), B = V(0, 15.2, -4.6), C = V(0, 1.9, -4.2);
  const yard = new THREE.Vector3().subVectors(B, A);
  const yg = cyl(0.09, 0.07, yard.length(), 8);
  yg.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), yard.clone().normalize()));
  const mid = A.clone().add(B).multiplyScalar(0.5);
  S.corten.push(tinted(place(yg, mid.x, mid.y, mid.z), 0x6e3a1e, 0, r));
  S.sails.push(tinted(sail(A, B, C, 0.9), 0x8f4c25, 0.1, r));
  S.sails.push(tinted(sail(V(0, 2.0, 7.6), V(0, 8.4, 1.4), V(0, 1.9, 1.6), 0.45), 0x8a4724, 0.1, r));
}

/** Pescador con marlín: el pescador tira de la caña y el marlín salta del agua (acero) */
function marlin(S, cx, cz, r) {
  const b = pedestal(S, cx, cz, 2.6, 0.7, r);
  // olas de acero a los pies del marlín
  for (let k = 0; k < 9; k++) {
    const a = r() * Math.PI * 2, d = 0.6 + r() * 1.2;
    const g = new THREE.ConeGeometry(0.25 + r() * 0.2, 0.8 + r() * 1.3, 5);
    S.steel.push(place(g, cx + 1.6 + Math.cos(a) * d, b + 0.4, cz + Math.sin(a) * d, r() * 3, (r() - 0.5) * 0.6, (r() - 0.5) * 0.6));
  }
  // el pescador, de 6 m, echado hacia atrás y con los brazos arriba
  const h = buildHuman({ sex: 'm', height: 6.2, build: 1.08, hairStyle: 'short', cap: true, topStyle: 'long', bottomStyle: 'pants', shoeStyle: 'shoe' });
  h.mesh.material = S.mats.steel;
  h.legL.rotation.x = 0.28;
  h.legR.rotation.x = -0.2;
  h.armL.rotation.x = -2.0;
  h.armR.rotation.x = -1.7;
  h.spine.rotation.x = -0.18;
  h.head.rotation.x = -0.25;
  h.group.position.set(cx - 1.7, b, cz);
  h.group.rotation.y = Math.PI / 2;   // mirando al marlín (+x)
  S.group.add(h.group);
  h.group.updateMatrixWorld(true);
  const hand = h.elbowR.localToWorld(new THREE.Vector3(0, -0.27, 0.03));
  // caña curvada y sedal hasta la boca del marlín
  const tip = new THREE.Vector3(cx + 2.2, b + 9.6, cz);
  const rod = new THREE.QuadraticBezierCurve3(hand, new THREE.Vector3(hand.x + 1.2, hand.y + 3.2, cz), tip);
  S.steel.push(new THREE.TubeGeometry(rod, 16, 0.05, 6, false));
  // marlín saltando, con el morro al cielo
  const fish = new THREE.Group();
  const body = new THREE.SphereGeometry(1, 20, 12);
  const bp = body.getAttribute('position');
  for (let i = 0; i < bp.count; i++) {
    const z = bp.getZ(i), k = z < 0 ? 1 + z * 0.75 : 1 - z * 0.25;
    bp.setXYZ(i, bp.getX(i) * 0.28 * k, bp.getY(i) * 0.42 * k, z * 1.9);
  }
  body.computeVertexNormals();
  const parts = [body];
  const bill = new THREE.ConeGeometry(0.055, 1.5, 8);
  bill.rotateX(Math.PI / 2);
  parts.push(place(bill, 0, 0.05, 2.55));
  parts.push(sail(new THREE.Vector3(0, 0.3, 1.1), new THREE.Vector3(0, 1.25, 0.2), new THREE.Vector3(0, 0.25, -0.9), 0, 6));
  for (const s of [-1, 1]) {
    parts.push(sail(new THREE.Vector3(0, 0, -1.7), new THREE.Vector3(0, s * 1.1, -2.6), new THREE.Vector3(0, s * 0.25, -2.2), 0, 4));
    parts.push(place(bar(0.6, 0.03, 0.18), s * 0.38, -0.12, 0.8, s * 0.5, 0, s * 0.4));
  }
  const fg = mergeGeometries(parts.map(p => { if (p.getAttribute('uv')) p.deleteAttribute('uv'); return p.index ? p.toNonIndexed() : p; }), false);
  const fm = new THREE.Mesh(fg, S.mats.steelDouble);
  fm.castShadow = true;
  fish.add(fm);
  fish.position.set(cx + 1.8, b + 4.4, cz + 0.3);
  fish.rotation.set(-1.05, Math.PI / 2 + 0.25, 0.2, 'YXZ');
  S.group.add(fish);
  fish.updateMatrixWorld(true);
  const mouth = fish.localToWorld(new THREE.Vector3(0, 0.05, 1.9));
  S.steel.push(new THREE.TubeGeometry(new THREE.LineCurve3(tip, mouth), 1, 0.012, 4, false));
}

const GENERIC = [windCups, corten, windPropeller, monolith, windHelix, anchor];

export function buildRoundabouts(scene, colliders) {
  const mats = {
    nature: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92 }),
    paint: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.42, metalness: 0.3 }),
    corten: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0.35 }),
    sails: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0.35, side: THREE.DoubleSide }),
    steel: new THREE.MeshStandardMaterial({ color: 0xd2d6db, roughness: 0.26, metalness: 0.95 }),
    steelDouble: new THREE.MeshStandardMaterial({ color: 0xd2d6db, roughness: 0.26, metalness: 0.95, side: THREE.DoubleSide }),
  };
  const S = { group: new THREE.Group(), mats, nature: [], paint: [], corten: [], sails: [], steel: [], rotors: [], collide: [] };
  S.group.name = 'rotondas';
  const piconGeo = [[], []];
  const known = new Map(SCULPTURES.map(s => [s.at.join(','), s.k]));

  ROUNDABOUTS.forEach((ra, i) => {
    const [cx, cz] = ra, ri = islandR(ra), r = rng(i + 11);
    const kind = known.get(`${cx},${cz}`);
    const red = !kind && i % 3 === 1;
    // bordillo y picón
    const segs = Math.max(24, Math.min(72, Math.round(ri * 5)));
    const curb = new THREE.CylinderGeometry(ri, ri + 0.04, TOP + 0.08, segs, 1, true);
    S.nature.push(tinted(place(curb, cx, (TOP - 0.08) / 2, cz), 0xd9d5cc));
    const lip = new THREE.RingGeometry(ri - 0.32, ri, segs, 1);
    lip.rotateX(-Math.PI / 2);
    S.nature.push(tinted(place(lip, cx, TOP + 0.005, cz), 0xc9c4b9));
    const disc = new THREE.CircleGeometry(ri - 0.3, segs);
    disc.rotateX(-Math.PI / 2);
    disc.translate(cx, TOP - 0.01, cz);
    const p = disc.getAttribute('position'), uv = disc.getAttribute('uv');
    for (let k = 0; k < p.count; k++) uv.setXY(k, p.getX(k) / 2.5, p.getZ(k) / 2.5);
    piconGeo[red ? 1 : 0].push(disc);

    // escultura del centro
    let core = 1.4;
    if (kind === 'barlovento') { barlovento(S, cx, cz, r); core = 1.6; }
    else if (kind === 'vela') { velaLatina(S, cx, cz, r); core = 6.5; }
    else if (kind === 'marlin') { marlin(S, cx, cz, r); core = 4.2; }
    else {
      const H = Math.min(6.5, 2.6 + ri * 0.32);
      GENERIC[i % GENERIC.length](S, cx, cz, H, r);
      core = ri < 3 ? 0.9 : 1.6;
    }

    // plantas y piedras alrededor (sin pisar el corro de palmeras)
    const n = Math.min(36, Math.round(ri * ri * 0.22));
    for (let k = 0; k < n; k++) {
      const a = r() * Math.PI * 2;
      const d = core + 0.4 + Math.sqrt(r()) * Math.max(0, ri - 0.9 - core - 0.4);
      if (d > ri - 0.6) continue;
      if (ri >= 6 && Math.abs(d - ri * 0.7) < 1.1) continue;
      const x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
      const t = r();
      if (t < 0.3) cardon(S.nature, x, z, r);
      else if (t < 0.55) aloe(S.nature, x, z, r);
      else if (t < 0.75) tabaiba(S.nature, x, z, r);
      else lavaRock(S.nature, x, z, r, red);
    }
  });

  const add = (geos, mat, shadow = true) => {
    if (!geos.length) return;
    const m = new THREE.Mesh(mergeGeometries(geos.map(g => (g.index ? g.toNonIndexed() : g)), false), mat);
    m.castShadow = shadow;
    m.receiveShadow = true;
    S.group.add(m);
  };
  add(S.nature, mats.nature);
  add(S.paint, mats.paint);
  add(S.corten, mats.corten);
  add(S.sails, mats.sails);
  add(S.steel.map(g => { if (g.getAttribute('uv')) g.deleteAttribute('uv'); return g; }), mats.steel);
  const picon = [
    new THREE.MeshStandardMaterial({ map: piconTexture('#2a2624', ['#1a1715', '#3a3330', '#463a33', '#120f0e', '#5a2f22'], 7), roughness: 0.97 }),
    new THREE.MeshStandardMaterial({ map: piconTexture('#6b3424', ['#4e2418', '#80412c', '#3a1b12', '#9a5236', '#2a2420'], 9), roughness: 0.97 }),
  ];
  piconGeo.forEach((geos, k) => {
    if (!geos.length) return;
    const m = new THREE.Mesh(mergeGeometries(geos, false), picon[k]);
    m.receiveShadow = true;
    S.group.add(m);
  });
  // los pedestales paran a los coches (la isleta es baja: se puede pisar)
  for (const [x, z, rad] of S.collide) {
    const N = 10;
    for (let k = 0; k < N; k++) {
      const a0 = (k / N) * Math.PI * 2, a1 = ((k + 1) / N) * Math.PI * 2;
      colliders.addSegment(x + Math.cos(a0) * rad, z + Math.sin(a0) * rad, x + Math.cos(a1) * rad, z + Math.sin(a1) * rad, 'sculpture');
    }
  }
  scene.add(S.group);

  return {
    group: S.group,
    count: ROUNDABOUTS.length,
    /** el viento mueve los juguetes (solo los que están cerca) */
    update(dt, px, pz) {
      for (const ro of S.rotors) {
        const o = ro.obj;
        if (Math.abs(o.position.x - px) > 400 && o.parent === S.group) continue;
        o.rotation[ro.axis] += ro.speed * dt;
      }
    },
  };
}
