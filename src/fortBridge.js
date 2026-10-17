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
    out.stone.push(colored(at(cord, (ax + bx) / 2 + nx * 0.1, H - 0.35, (az + bz) / 2 + nz * 0.1, -Math.atan2(uz, ux)), 0x9c9284, 0.05));
    // parapeto con troneras cada 6 m
    const n = Math.max(1, Math.round(L / 6));
    for (let k = 0; k < n; k++) {
      const t0 = k / n + 0.45 / L, t1 = (k + 1) / n - 0.45 / L;
      const seg = (t1 - t0) * L;
      if (seg < 0.5) continue;
      const g = new THREE.BoxGeometry(seg, 1.15, 0.65);
      const mx = ax + ux * L * (t0 + t1) / 2 - nx * 0.3, mz = az + uz * L * (t0 + t1) / 2 - nz * 0.3;
      out.ashlarSolid.push(colored(at(g, mx, H + 0.57, mz, -Math.atan2(uz, ux)), 0xd8d0c4, 0.06, k));
    }
  }
  // terraza (plaza de armas)
  const sh = new THREE.Shape(p.slice(0, -1).map(([x, z]) => new THREE.Vector2(x, -z)));
  const top = new THREE.ShapeGeometry(sh);
  top.rotateX(-Math.PI / 2);
  top.translate(0, H - 0.02, 0);
  out.stone.push(colored(top, 0x7d756b, 0.04));
  // garita en la punta del baluarte
  const [gx, gz] = p[1];
  const cx = p.slice(0, -1).reduce((s, q) => s + q[0], 0) / 5, cz = p.slice(0, -1).reduce((s, q) => s + q[1], 0) / 5;
  const dl = Math.hypot(gx - cx, gz - cz), dx = (gx - cx) / dl, dz = (gz - cz) / dl;
  const kx = gx + dx * 0.4, kz = gz + dz * 0.4;
  out.ashlarSolid.push(colored(at(new THREE.CylinderGeometry(0.95, 0.55, 1.4, 12), kx, H - 0.9, kz), 0xbcb2a4, 0.05));
  out.ashlarSolid.push(colored(at(new THREE.CylinderGeometry(0.9, 0.9, 2.2, 12), kx, H + 1.1, kz), 0xd8d0c4, 0.05));
  out.stone.push(colored(at(new THREE.SphereGeometry(0.98, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), kx, H + 2.2, kz), 0xc9c0b2));
  out.stone.push(colored(at(new THREE.SphereGeometry(0.16, 8, 6), kx, H + 3.2, kz), 0x9c9284));
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
  // cañones asomando por las troneras del lienzo este
  const [ex, ez] = p[1], [fx, fz] = p[2];
  const EL = Math.hypot(fx - ex, fz - ez), eux = (fx - ex) / EL, euz = (fz - ez) / EL, enx = o * euz, enz = -o * eux;
  for (const t of [0.33, 0.66]) {
    const x0 = ex + eux * EL * t - enx * 1.6, z0 = ez + euz * EL * t - enz * 1.6;
    const barrel = new THREE.CylinderGeometry(0.16, 0.22, 2.2, 10);
    barrel.rotateZ(Math.PI / 2 - 0.08);
    out.dark.push(colored(at(barrel, x0, H + 0.75, z0, -Math.atan2(enz, enx)), 0x1d1f21));
    out.wood.push(colored(at(new THREE.BoxGeometry(1.3, 0.45, 0.8), x0 - enx * 0.4, H + 0.3, z0 - enz * 0.4, -Math.atan2(enz, enx)), 0x5a3b22, 0.1));
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

export function buildFortBridge(scene, map, colliders) {
  const group = new THREE.Group();
  group.name = 'castilloPuente';
  const out = { ashlar: [], ashlarSolid: [], stone: [], dark: [], wood: [], flag: [], glass: [] };
  castle(out, colliders);
  bridge(out, map.roads, colliders);
  const tex = ashlarTexture();
  const add = (geos, mat, shadow = true) => {
    if (!geos.length) return null;
    const m = new THREE.Mesh(mergeGeometries(geos.map(g => (g.index ? g.toNonIndexed() : g)), false), mat);
    m.castShadow = shadow;
    m.receiveShadow = true;
    group.add(m);
    return m;
  };
  // sillería con coordenadas de textura planas (las cajas usan las suyas, a escala)
  const boxUV = (geos) => geos.map(g => {
    const p = g.getAttribute('position'), n = g.getAttribute('normal'), uv = g.getAttribute('uv');
    for (let i = 0; i < p.count; i++) {
      const ax = Math.abs(n.getX(i)), az = Math.abs(n.getZ(i));
      const u = ax > az ? p.getZ(i) : p.getX(i);
      uv.setXY(i, u / 2.2, p.getY(i) / 2.2);
    }
    return g;
  });
  add(out.ashlar, new THREE.MeshStandardMaterial({ map: tex, vertexColors: true, roughness: 0.92, side: THREE.DoubleSide }));
  add(boxUV(out.ashlarSolid), new THREE.MeshStandardMaterial({ map: tex, vertexColors: true, roughness: 0.92 }));
  add(out.stone, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, side: THREE.DoubleSide }));
  add(out.dark, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.35, side: THREE.DoubleSide }));
  add(out.wood, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 }));
  add(out.flag, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, side: THREE.DoubleSide }));
  const lampMat = new THREE.MeshStandardMaterial({ vertexColors: true, emissive: 0xffc870, emissiveIntensity: 0.1, roughness: 0.3 });
  add(out.glass, lampMat, false);
  scene.add(group);
  return {
    group,
    update() { lampMat.emissiveIntensity = 0.1 + windowGlow.value * 3; },
  };
}
