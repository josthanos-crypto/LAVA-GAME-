import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { SegmentGrid } from './collision.js';
import { PLACES, CALLE_REAL } from './places.js';
import { findBuilding, streetFace, signMesh } from './civic.js';
import { buildHuman } from './humanModel.js';
import { windowGlow } from './realism.js';

/**
 * Los comercios con nombre: los de la Calle Real (del mar hacia dentro,
 * alternando aceras), los Cines Atlántida con su marquesina de bombillas,
 * el Charco Vivo (antigua Casa Ginory) y la tiendita del chino del Charco,
 * con su género en la puerta, farolillos rojos y la dueña en la entrada:
 * allí se puede hacer un parón (refresco y pipas, y la salud al cien).
 */

// rótulos de marca: fondo, letra, filete
const BRAND = {
  caixa: ['#0b7cb3', '#ffffff', '#0b7cb3'],
  farmacia: ['#13843c', '#ffffff', '#13843c'],
  vodafone: ['#e60000', '#ffffff', '#e60000'],
  sabor: ['#7a1f1f', '#f6d36b', '#f6d36b'],
  perfume: ['#111111', '#d9b45e', '#d9b45e'],
  segsocial: ['#1d3c6e', '#ffffff', '#ffffff'],
  mall: ['#2b2f36', '#ffffff', '#e8742a'],
  endesa: ['#0a3d7a', '#ffffff', '#ffffff'],
  cine: ['#6e0f12', '#ffd86b', '#ffd86b'],
  ginory: ['#2f4f3a', '#efe4c6', '#c9b27a'],
  bazar: ['#c8102e', '#ffdd33', '#ffdd33'],
};
const styleOf = (name) => {
  const n = name.toLowerCase();
  if (n.includes('farmacia')) return 'farmacia';
  if (n.includes('caixa')) return 'caixa';
  if (n.includes('vodafone')) return 'vodafone';
  if (n.includes('sabor')) return 'sabor';
  if (n.includes('parfum')) return 'perfume';
  if (n.includes('seguridad')) return 'segsocial';
  if (n.includes('mall')) return 'mall';
  if (n.includes('endesa')) return 'endesa';
  return 'mall';
};

function colored(g, hex) {
  const geo = g.index ? g.toNonIndexed() : g;
  if (geo.getAttribute('uv')) geo.deleteAttribute('uv');
  const c = new THREE.Color(hex), n = geo.getAttribute('position').count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) arr.set([c.r, c.g, c.b], i * 3);
  geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return geo;
}
const at = (g, x, y, z, ry = 0) => { if (ry) g.rotateY(ry); g.translate(x, y, z); return g; };

/** fachadas de la Calle Real que dan a la calle, ordenadas desde el mar */
function calleRealFaces(map) {
  const real = map.roads.filter(r => r.ped && /le[oó]n y castillo/i.test(r.name || '')).sort((a, b) => b.p.length - a.p.length)[0];
  if (!real) return [];
  // largo acumulado a lo largo de la calle
  const P = real.p, acc = [0];
  for (let i = 1; i < P.length; i++) acc.push(acc[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const project = (x, z) => {
    let best = { d: Infinity };
    for (let i = 0; i < P.length - 1; i++) {
      const [ax, az] = P[i], [bx, bz] = P[i + 1], dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2));
      const px = ax + dx * t, pz = az + dz * t, d = Math.hypot(x - px, z - pz);
      if (d < best.d) best = { d, s: acc[i] + t * Math.sqrt(l2), side: Math.sign(dx * (z - az) - dz * (x - ax)), ux: dx / Math.sqrt(l2), uz: dz / Math.sqrt(l2) };
    }
    return best;
  };
  const faces = [];
  for (const b of map.buildings) {
    const p = b.p;
    if (Math.abs(p[0][0] - 110) > 140 || Math.abs(p[0][1] - 280) > 220) continue;
    let area = 0;
    for (let i = 0; i < p.length - 1; i++) area += p[i][0] * p[i + 1][1] - p[i + 1][0] * p[i][1];
    const o = area >= 0 ? 1 : -1;
    for (let i = 0; i < p.length - 1; i++) {
      const [ax, az] = p[i], [bx, bz] = p[i + 1];
      const L = Math.hypot(bx - ax, bz - az);
      if (L < 5) continue;
      const mx = (ax + bx) / 2, mz = (az + bz) / 2, nx = o * (bz - az) / L, nz = -o * (bx - ax) / L;
      const pr = project(mx, mz);
      // pegada a la calle, paralela a ella y mirándola
      if (pr.d > real.w / 2 + 4.5) continue;
      if (Math.abs((bx - ax) / L * pr.ux + (bz - az) / L * pr.uz) < 0.8) continue;
      const toward = project(mx + nx * 2, mz + nz * 2);
      if (toward.d > pr.d) continue;
      faces.push({ s: pr.s, side: pr.side, x: mx, z: mz, nx, nz, len: L, b });
    }
  }
  faces.sort((a, b) => a.s - b.s);
  return faces;
}

/** carteles de cine inventados (formas y colores, sin títulos reales) */
function posterTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 192;
  const g = c.getContext('2d');
  const pal = [['#1b2a4a', '#f2b33d'], ['#4a1b2a', '#3df2c8'], ['#1d3b22', '#f25a3d']];
  pal.forEach(([bg, fg], i) => {
    const x = i * 85;
    const gr = g.createLinearGradient(0, 0, 0, 192);
    gr.addColorStop(0, bg); gr.addColorStop(1, '#000');
    g.fillStyle = gr; g.fillRect(x + 2, 2, 81, 188);
    g.fillStyle = fg;
    g.beginPath(); g.arc(x + 42, 70, 26, 0, Math.PI * 2); g.fill();
    g.fillRect(x + 14, 130, 56, 8); g.fillRect(x + 22, 146, 40, 5);
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildShops(scene, map, colliders) {
  const roads = new SegmentGrid();
  for (const r of map.roads) roads.addPolygon(r.p, r);
  const group = new THREE.Group();
  group.name = 'comercios';
  const signs = [], solid = [], glow = [], crosses = [];

  // Calle Real: un comercio cada tanto, alternando aceras
  const faces = calleRealFaces(map);
  const names = CALLE_REAL.filter(n => !/cines/i.test(n));
  const total = faces.length ? faces[faces.length - 1].s - faces[0].s : 0;
  let last = -Infinity, lastSide = 0, k = 0;
  // donde el mapa ya trae el rótulo de una tienda (Santander, Ale-Hop...), no se pisa
  const taken = (x, z) => (map.signs || []).some(q => Math.hypot(q.x - x, q.z - z) < 4.5);
  for (const f of faces) {
    if (k >= names.length) break;
    if (taken(f.x, f.z)) continue;
    const want = faces[0].s + (total * k) / names.length;
    if (f.s < want || f.s - last < 18) continue;
    if (f.side === lastSide && faces.some(g => g.side !== lastSide && g.s >= f.s && g.s - f.s < 12)) continue;
    const name = names[k++];
    const st = styleOf(name);
    const h = 0.62, w = Math.min(f.len * 0.85, 5.2);
    signs.push({ text: name, style: st, x: f.x + f.nx * 0.08, z: f.z + f.nz * 0.08, y: 2.62, w, h, nx: f.nx, nz: f.nz });
    if (st === 'farmacia') crosses.push(f);
    last = f.s; lastSide = f.side;
  }
  // cruz verde de farmacia en banderola (encendida siempre)
  for (const f of crosses) {
    const tx = -f.nz, tz = f.nx, ry = Math.atan2(f.nx, f.nz);
    const ox = f.x + f.nx * 0.75 + tx * (f.len * 0.42 - 0.3), oz = f.z + f.nz * 0.75 + tz * (f.len * 0.42 - 0.3);
    solid.push(colored(at(new THREE.BoxGeometry(0.06, 0.06, 0.75), ox - f.nx * 0.4, 3.75, oz - f.nz * 0.4, ry), 0x2a2c30));
    glow.push(colored(at(new THREE.BoxGeometry(0.75, 0.25, 0.12), ox, 3.75, oz, ry + Math.PI / 2), 0x19c35a));
    glow.push(colored(at(new THREE.BoxGeometry(0.25, 0.75, 0.12), ox, 3.75, oz, ry + Math.PI / 2), 0x19c35a));
  }

  // Cines Atlántida: rótulo grande, marquesina con bombillas y carteleras
  const cineB = findBuilding(map, ...PLACES.cinesAtlantida);
  const cf = cineB && streetFace(cineB, roads);
  if (cf) {
    const [ax, az, bx, bz, nx, nz, len] = cf;
    const mx = (ax + bx) / 2, mz = (az + bz) / 2, ry = Math.atan2(nx, nz), tx = -nz, tz = nx;
    const mw = Math.min(len * 0.8, 7);
    signs.push({ text: 'CINES ATLÁNTIDA', style: 'cine', x: mx + nx * 0.95, z: mz + nz * 0.95, y: 4.1, w: mw, h: mw / 6.4, nx, nz });
    solid.push(colored(at(new THREE.BoxGeometry(mw, 0.45, 1.8), mx + nx * 0.9, 3.45, mz + nz * 0.9, ry), 0x5a0d10));
    for (let i = 0; i < 14; i++) {
      const t = (i / 13 - 0.5) * (mw - 0.3);
      glow.push(colored(at(new THREE.SphereGeometry(0.07, 6, 4), mx + nx * 1.82 + tx * t, 3.3, mz + nz * 1.82 + tz * t), 0xffe6a0));
    }
    const pg = [];
    for (const s of [-1, 1]) {
      const g = new THREE.PlaneGeometry(1.1, 1.6);
      const uv = g.getAttribute('uv');
      for (let i = 0; i < uv.count; i++) uv.setX(i, (uv.getX(i) + (s < 0 ? 0 : 2)) / 3);
      pg.push(at(g, mx + nx * 0.07 + tx * s * (mw / 2 - 0.8), 1.5, mz + nz * 0.07 + tz * s * (mw / 2 - 0.8), ry));
    }
    const tex = posterTexture();
    const posters = new THREE.Mesh(mergeGeometries(pg, false), new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0.35 }));
    group.add(posters);
  }

  // Charco Vivo: la antigua Casa Ginory
  const gB = findBuilding(map, ...PLACES.casaGinory);
  const gf = gB && streetFace(gB, roads);
  if (gf) {
    const [ax, az, bx, bz, nx, nz, len] = gf;
    const w = Math.min(len * 0.85, 6.4);
    signs.push({ text: 'CHARCO VIVO · ANTIGUA CASA GINORY', style: 'ginory', x: (ax + bx) / 2 + nx * 0.08, z: (az + bz) / 2 + nz * 0.08, y: 2.7, w, h: w / 6.4, nx, nz });
  }

  // la tiendita del chino del Charco
  let shop = null;
  const sB = findBuilding(map, 201, 32);
  const sf = sB && streetFace(sB, roads);
  if (sf) {
    const [ax, az, bx, bz, nx, nz, len] = sf;
    const mx = (ax + bx) / 2, mz = (az + bz) / 2, ry = Math.atan2(nx, nz), tx = -nz, tz = nx;
    const w = Math.min(len * 0.8, 4.6);
    signs.push({ text: 'ALIMENTACIÓN · BAZAR', style: 'bazar', x: mx + nx * 0.08, z: mz + nz * 0.08, y: 2.75, w, h: w / 6.4, nx, nz });
    // toldo rojo, farolillos y género en la puerta
    solid.push(colored(at(new THREE.BoxGeometry(w + 0.6, 0.1, 1.3), mx + nx * 0.65, 2.35, mz + nz * 0.65, ry), 0xb3121f));
    for (const s of [-1, 1]) {
      const lx = mx + nx * 1.1 + tx * s * (w / 2 - 0.2), lz = mz + nz * 1.1 + tz * s * (w / 2 - 0.2);
      glow.push(colored(at(new THREE.SphereGeometry(0.24, 10, 8).scale(1, 1.25, 1), lx, 1.95, lz), 0xe0201c));
      solid.push(colored(at(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 8), lx, 2.27, lz), 0xd9a520));
      solid.push(colored(at(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 8), lx, 1.63, lz), 0xd9a520));
    }
    // flotadores, cubos de playa y la nevera de refrescos
    const gx = mx + nx * 0.8 - tx * (w / 2 + 0.2), gz = mz + nz * 0.8 - tz * (w / 2 + 0.2);
    [0xff5a8a, 0x2bb3e8, 0xf2c41a].forEach((hex, i) => {
      const ring = new THREE.TorusGeometry(0.32, 0.12, 8, 18);
      solid.push(colored(at(ring, gx, 0.35 + i * 0.25, gz), hex));
    });
    [0xe8742a, 0x2b8be8, 0x3ac06a].forEach((hex, i) => {
      solid.push(colored(at(new THREE.CylinderGeometry(0.13, 0.1, 0.22, 10), gx + tx * 0.7 + nx * 0.2 * i, 0.3, gz + tz * 0.7 + nz * 0.2 * i), hex));
    });
    const fx = mx + nx * 0.45 + tx * (w / 2 + 0.1), fz = mz + nz * 0.45 + tz * (w / 2 + 0.1);
    solid.push(colored(at(new THREE.BoxGeometry(0.75, 1.8, 0.7), fx, 0.9, fz, ry), 0xf2f2f2));
    glow.push(colored(at(new THREE.BoxGeometry(0.6, 1.3, 0.02), fx + nx * 0.36, 1.0, fz + nz * 0.36, ry), 0x7fc8f0));
    // la dueña, en la puerta
    const keeper = buildHuman({ sex: 'f', skin: 0xe8c9a0, hair: 0x15110e, hairStyle: 'bun', top: 0xc8261c, topStyle: 'tshirt', bottom: 0x1c1c1e, bottomStyle: 'pants', shoes: 0x1c1c1e, eyes: 0x1a120c, height: 1.58 });
    keeper.group.position.set(mx + nx * 0.9 + tx * 0.6, 0.19, mz + nz * 0.9 + tz * 0.6);
    keeper.group.rotation.y = ry;
    keeper.armL.rotation.x = -0.25;
    keeper.armR.rotation.x = -0.25;
    group.add(keeper.group);
    shop = { x: mx + nx * 2, z: mz + nz * 2, keeper };
  }

  group.userData.spots = signs.map(s => ({ n: s.text, x: s.x, z: s.z, nx: s.nx, nz: s.nz }));
  const signM = signs.length ? signMesh(signs, BRAND) : null;
  if (signM) group.add(signM);
  const add = (geos, mat) => {
    if (!geos.length) return null;
    const m = new THREE.Mesh(mergeGeometries(geos, false), mat);
    m.castShadow = true;
    group.add(m);
    return m;
  };
  add(solid, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.15 }));
  // brillo del color de cada pieza (farolillo rojo, cruz verde, bombillas cálidas)
  const glowMat = new THREE.MeshStandardMaterial({ vertexColors: true, emissive: 0xffffff, emissiveIntensity: 0.25, roughness: 0.4 });
  glowMat.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance *= vColor.rgb;');
  };
  glowMat.customProgramCacheKey = () => 'tinted-glow';
  add(glow, glowMat);
  scene.add(group);
  void colliders;

  let t = 0;
  return {
    group,
    shop,
    /** ¿estás en la puerta de la tiendita? */
    nearShop: (x, z) => !!shop && Math.hypot(x - shop.x, z - shop.z) < 4.5,
    update(dt) {
      t += dt;
      if (signM) signM.material.emissiveIntensity = 0.15 + windowGlow.value * 1.8;
      glowMat.emissiveIntensity = 0.35 + windowGlow.value * 2.2;
      // la dueña se mueve un poco (barre la puerta, se cruza de brazos)
      if (shop) shop.keeper.armR.rotation.x = -0.25 + Math.sin(t * 0.8) * 0.15;
    },
  };
}
