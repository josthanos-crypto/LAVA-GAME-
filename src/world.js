import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { SegmentGrid } from './collision.js';
import {
  groundTexture, asphaltTexture, sidewalkTexture, pedestrianTexture,
  sandTexture, facadeTexture, groundStrips, barkTexture,
  waterNormalTexture, frondTexture,
} from './textures.js';
import { buildParksAndPlazas } from './parks.js';
import { buildSports } from './sports.js';
import { createSky, createStars, createClouds, oceanMaterial, windowGlow } from './realism.js';
import { isTouchDevice } from './touch.js';
import { applyExtras } from './extraData.js';

export async function loadMap(onProgress) {
  onProgress?.('Descargando mapa de Arrecife…', 10);
  const res = await fetch('map/arrecife.json');
  return applyExtras(await res.json());
}

function matStd(opts) {
  return new THREE.MeshStandardMaterial({ roughness: 0.88, metalness: 0.02, ...opts });
}

/** material PBR a partir de una textura que trae sus mapas (rugosidad/metal + relieve) */
function matPBR(tex, opts = {}, bumpScale = 1.5) {
  const o = tex.userData.orm, b = tex.userData.bump;
  for (const t of [o, b]) if (t) { t.repeat.copy(tex.repeat); t.offset.copy(tex.offset); }
  return new THREE.MeshStandardMaterial({
    map: tex,
    roughnessMap: o || null,
    metalnessMap: o || null,
    bumpMap: b || null,
    bumpScale,
    roughness: 1,
    metalness: 1,
    ...opts,
  });
}

/**
 * Ventanas encendidas por la noche: cada ventana (celda de la textura) decide
 * con un hash de su posición si tiene luz y de qué color (cálida o fría).
 */
function addWindowLights(mat, onRatio = 0.5, strength = 1.6) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uGlow = windowGlow;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uGlow;\nvarying vec3 vWPos;')
      .replace('#include <emissivemap_fragment>', `
        #include <emissivemap_fragment>
        {
          float isWin = texture2D(metalnessMap, vMetalnessMapUv).b;
          vec2 cell = floor(vMapUv * vec2(1.0, 1.0)) + floor(vWPos.xz / 19.0) * 7.0 + floor(vWPos.y / 3.0) * 3.1;
          float r = fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);
          vec3 lamp = mix(vec3(1.0, 0.7, 0.4), vec3(0.78, 0.86, 1.0), step(0.86, r));
          totalEmissiveRadiance += isWin * step(${(1 - onRatio).toFixed(2)}, r) * uGlow * lamp * ${strength.toFixed(2)};
        }
      `);
  };
  mat.customProgramCacheKey = () => 'win' + onRatio + strength;
}

// Flat ribbon along a polyline + discs at joints so corners don't crack open
function roadGeometry(points, width, y) {
  const half = width / 2;
  const positions = [], uvs = [], indices = [];
  let vi = 0, dist = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const [ax, az] = points[i], [bx, bz] = points[i + 1];
    const dx = bx - ax, dz = bz - az;
    const len = Math.hypot(dx, dz);
    if (len < 0.01) continue;
    const nx = -dz / len, nz = dx / len;

    positions.push(
      ax + nx * half, y, az + nz * half,
      ax - nx * half, y, az - nz * half,
      bx + nx * half, y, bz + nz * half,
      bx - nx * half, y, bz - nz * half,
    );
    const v0 = dist / 8, v1 = (dist + len) / 8;
    uvs.push(0, v0, 1, v0, 0, v1, 1, v1);
    indices.push(vi, vi + 2, vi + 1, vi + 1, vi + 2, vi + 3);
    vi += 4;
    dist += len;
  }

  // joint discs
  const DISC = 8;
  for (let i = 1; i < points.length - 1; i++) {
    const [cx, cz] = points[i];
    const center = vi;
    positions.push(cx, y, cz);
    uvs.push(0.5, 0);
    vi++;
    for (let s = 0; s <= DISC; s++) {
      const a = (s / DISC) * Math.PI * 2;
      positions.push(cx + Math.cos(a) * half, y, cz + Math.sin(a) * half);
      uvs.push(0.5, 0);
      vi++;
      if (s > 0) indices.push(center, center + s, center + s + 1);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

/** bordillo: cara vertical de piedra entre la calzada y la acera */
function curbGeometry(points, y0, y1) {
  const positions = [], indices = [];
  let vi = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, az] = points[i], [bx, bz] = points[i + 1];
    if (Math.hypot(bx - ax, bz - az) < 0.05) continue;
    positions.push(ax, y0, az, bx, y0, bz, ax, y1, az, bx, y1, bz);
    indices.push(vi, vi + 1, vi + 2, vi + 1, vi + 3, vi + 2);
    vi += 4;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
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

// thin continuous line ribbon (edge markings)
function lineGeometry(points, y, HW = 0.12) {
  const positions = [], indices = [];
  let vi = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, az] = points[i], [bx, bz] = points[i + 1];
    const dx = bx - ax, dz = bz - az;
    const len = Math.hypot(dx, dz);
    if (len < 0.01) continue;
    const nx = -dz / len, nz = dx / len;
    positions.push(
      ax + nx * HW, y, az + nz * HW, ax - nx * HW, y, az - nz * HW,
      bx + nx * HW, y, bz + nz * HW, bx - nx * HW, y, bz - nz * HW,
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

function centroid(pts) {
  let x = 0, z = 0;
  for (const [px, pz] of pts) { x += px; z += pz; }
  return [x / pts.length, z / pts.length];
}

function ringPath(pts) {
  const p = new THREE.Path();
  p.moveTo(pts[0][0], -pts[0][1]);
  for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], -pts[i][1]);
  return p;
}

function buildSea(scene, map) {
  if (!map.sea) return null;
  const shape = polyShape(map.sea.outer);
  for (const h of map.sea.holes) shape.holes.push(ringPath(h));
  let g;
  try { g = new THREE.ShapeGeometry(shape); } catch { return null; }
  g.rotateX(-Math.PI / 2);
  g.translate(0, 0.15, 0);
  const mat = oceanMaterial(waterNormalTexture());
  const mesh = new THREE.Mesh(g, mat);
  mesh.receiveShadow = true;
  scene.add(mesh);
  // el Charco de San Ginés: misma agua que el mar
  const inland = map.inlandWater || [];
  for (const poly of inland) {
    let wg;
    try { wg = new THREE.ShapeGeometry(polyShape(poly)); } catch { continue; }
    wg.rotateX(-Math.PI / 2);
    wg.translate(0, 0.15, 0);
    const wm = new THREE.Mesh(wg, mat);
    wm.receiveShadow = true;
    scene.add(wm);
  }

  // fondo turquesa del bajío visto a través del agua junto a la costa
  const shallow = [lineGeometry(map.sea.outer, 0.155, 7)];
  for (const h of map.sea.holes) shallow.push(lineGeometry(h, 0.155, 7));
  for (const poly of inland) shallow.push(lineGeometry(poly, 0.155, 4));
  scene.add(new THREE.Mesh(
    mergeGeometries(shallow.map(x => x.toNonIndexed()), false),
    new THREE.MeshBasicMaterial({ color: 0x3fb2b0, transparent: true, opacity: 0.32, depthWrite: false })
  ));
  // espuma en la orilla
  const foam = [lineGeometry(map.sea.outer, 0.17, 0.6)];
  for (const h of map.sea.holes) foam.push(lineGeometry(h, 0.17, 0.6));
  for (const poly of inland) foam.push(lineGeometry(poly, 0.17, 0.35));
  const foamMat = new THREE.MeshBasicMaterial({ color: 0xf2fbff, transparent: true, opacity: 0.55, depthWrite: false });
  scene.add(new THREE.Mesh(mergeGeometries(foam.map(x => x.toNonIndexed()), false), foamMat));
  mat.userData.foamMat = foamMat;
  return mat;
}

function pointInPoly(poly, x, z) {
  let inn = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inn = !inn;
  }
  return inn;
}

function buildBeaches(scene, map) {
  if (!map.beaches?.length) return;
  const bases = [];
  const group = new THREE.Group();
  const rng = (() => { let s = 777; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const POLE = new THREE.MeshStandardMaterial({ color: 0xe8e2d4, roughness: 0.5 });
  const CANVAS = [0xd94f3d, 0x2a6db5, 0xe0b520, 0x3e8a4f];

  map.beaches.forEach((b, bi) => {
    const g = flatPoly(b, 0.135, 0xd9d2c6);
    if (g) bases.push(g);
    // la del Reducto se monta aparte, con su gente (beach.js)
    if (bi === 0 && polyArea(b) > 2000) return;
    const xs = b.map(q => q[0]), zs = b.map(q => q[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs);
    const z0 = Math.min(...zs), z1 = Math.max(...zs);
    let placed = 0;
    for (let tries = 0; tries < 200 && placed < 9; tries++) {
      const x = x0 + rng() * (x1 - x0), z = z0 + rng() * (z1 - z0);
      if (!pointInPoly(b, x, z)) continue;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.1, 6), POLE);
      pole.position.set(x, 1.15, z);
      pole.castShadow = true;
      // sombrilla de tela: cono bajo con 8 gajos
      const shade = new THREE.Mesh(
        new THREE.ConeGeometry(1.3, 0.38, 16, 1, true),
        new THREE.MeshStandardMaterial({ color: CANVAS[placed % CANVAS.length], roughness: 0.85, side: THREE.DoubleSide })
      );
      shade.position.set(x, 2.12, z);
      shade.castShadow = true;
      group.add(pole, shade);
      const towel = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.02, 1.7),
        new THREE.MeshStandardMaterial({ color: CANVAS[(placed + 2) % CANVAS.length], roughness: 0.95 })
      );
      towel.position.set(x + 1.1, 0.15, z + 0.4);
      towel.rotation.y = rng() * Math.PI;
      towel.receiveShadow = true;
      group.add(towel);
      placed++;
    }
  });
  if (bases.length) {
    const sand = sandTexture();
    sand.repeat.set(0.08, 0.08);
    const mesh = new THREE.Mesh(
      mergeGeometries(bases, false),
      matStd({ map: sand, roughness: 0.95, metalness: 0, vertexColors: true })
    );
    mesh.receiveShadow = true;
    scene.add(mesh);
  }
  scene.add(group);
}

function signedArea(pts) {
  let a = 0;
  for (let i = 0; i < pts.length - 1; i++) a += pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1];
  return a / 2;
}

function polyArea(pts) {
  let a = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    a += (pts[j][0] + pts[i][0]) * (pts[j][1] - pts[i][1]);
  }
  return Math.abs(a / 2);
}

function buildCastles(scene, map, colliders, extra = []) {
  const all = [...(map.castles || []), ...extra];
  if (!all.length) return;
  const stone = new THREE.Color(0xb09468);
  const walls = new WallBatch();
  const merlons = [];
  const roofs = [];
  const flags = new THREE.Group();

  for (const c of all) {
    const pts = c.p;
    const big = polyArea(pts) > 8000;
    const H = c.h || (big ? 3.2 : 6);
    colliders.addPolygon(pts);
    const out = signedArea(pts) >= 0 ? 1 : -1;

    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
      const len = Math.hypot(bx - ax, bz - az);
      if (len < 0.3) continue;
      const nx = out * (bz - az) / len, nz = -out * (bx - ax) / len;
      walls.quad(ax, az, bx, bz, 0, H, nx, nz, 0, len / 3, 0, H / 3, stone);
      const ux = (bx - ax) / len, uz = (bz - az) / len;
      for (let d = 0.8; d + 0.7 < len; d += 1.6) {
        const mg = new THREE.BoxGeometry(0.7, 0.55, 0.45);
        mg.rotateY(-Math.atan2(uz, ux));
        mg.translate(ax + ux * (d + 0.35), H + 0.27, az + uz * (d + 0.35));
        merlons.push(mg);
      }
    }
    if (!big) {
      const rg = flatPoly(pts, H, 0x94794f);
      if (rg) roofs.push(rg);
      const [cx, cz] = centroid(pts);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.2, 6),
        new THREE.MeshStandardMaterial({ color: 0x777777, metalness: 0.6, roughness: 0.4 }));
      pole.position.set(cx, H + 1.6, cz);
      const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.7),
        new THREE.MeshStandardMaterial({ color: 0xc8452e, side: THREE.DoubleSide, roughness: 0.9 }));
      flag.position.set(cx + 0.68, H + 2.8, cz);
      flags.add(pole, flag);
    }
  }

  // sillería volcánica: reutiliza el ruido de la acera, teñido de piedra
  const stoneTex = sidewalkTexture(8);
  const wallMesh = new THREE.Mesh(walls.geometry(),
    matPBR(stoneTex, { vertexColors: true, side: THREE.DoubleSide }, 3));
  wallMesh.castShadow = true;
  wallMesh.receiveShadow = true;
  scene.add(wallMesh);
  if (merlons.length) {
    const mm = new THREE.Mesh(mergeGeometries(merlons, false),
      new THREE.MeshStandardMaterial({ color: 0xa8906c, roughness: 0.95 }));
    mm.castShadow = true;
    mm.receiveShadow = true;
    scene.add(mm);
  }
  if (roofs.length) {
    scene.add(new THREE.Mesh(mergeGeometries(roofs, false),
      new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 })));
  }
  scene.add(flags);
}

const FUEL_BRANDS = {
  disa: ['#d40f1c', '#ffffff'],
  repsol: ['#ff7a00', '#003263'],
  shell: ['#fbce07', '#dd1d21'],
  bp: ['#009b3a', '#ffe200'],
  plenergy: ['#00a651', '#ffffff'],
  moeve: ['#00857d', '#e8f5f3'],
};

function buildFuelStations(scene, map, colliders) {
  if (!map.fuel?.length) return;
  const group = new THREE.Group();
  const POST = new THREE.MeshStandardMaterial({ color: 0xd8d8d8, metalness: 0.6, roughness: 0.35 });
  const DARKM = new THREE.MeshStandardMaterial({ color: 0x15181c, roughness: 0.15, metalness: 0.2 });

  const bboxes = map.buildings.map(b => {
    const xs = b.p.map(q => q[0]), zs = b.p.map(q => q[1]);
    return [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs), b.p];
  });
  const insideBuilding = (x, z) => bboxes.some(([x0, x1, z0, z1, poly]) =>
    x > x0 && x < x1 && z > z0 && z < z1 && pointInPoly(poly, x, z));

  for (const f of map.fuel) {
    const dx = Math.sin(f.a), dz = Math.cos(f.a);
    let steps = 0;
    while (insideBuilding(f.x, f.z) && steps++ < 8) { f.x += dx * 2; f.z += dz * 2; }
    const cos = Math.cos(f.a), sin = Math.sin(f.a);
    const corner = (lx, lz) => [f.x + lx * cos + lz * sin, f.z - lx * sin + lz * cos];
    const canopyFits = [[-5.2, -3], [5.2, -3], [-5.2, 3], [5.2, 3], [0, 0]]
      .every(([lx, lz]) => { const [cx2, cz2] = corner(lx, lz); return !insideBuilding(cx2, cz2); });

    const st = new THREE.Group();
    const key = (f.brand || '').toLowerCase().replace(/[^a-z]/g, '');
    const [c1, c2] = FUEL_BRANDS[key] || ['#c8452e', '#ffffff'];

    if (canopyFits) {
      const canopy = new THREE.Mesh(new THREE.BoxGeometry(13, 0.5, 8.5),
        new THREE.MeshStandardMaterial({ color: 0xf2f2ee, roughness: 0.5 }));
      canopy.position.y = 4.6;
      canopy.castShadow = true;
      st.add(canopy);
      // plafones de luz bajo la marquesina
      const under = new THREE.Mesh(new THREE.PlaneGeometry(12, 7.6),
        new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff4e0, emissiveIntensity: 0.6 }));
      under.rotation.x = Math.PI / 2;
      under.position.y = 4.34;
      st.add(under);
      const band = new THREE.Mesh(new THREE.BoxGeometry(13.1, 0.34, 8.6),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(c1), roughness: 0.4 }));
      band.position.y = 4.36;
      st.add(band);
      for (const [px, pz] of [[-5.2, -3], [5.2, -3], [-5.2, 3], [5.2, 3]]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 4.35, 10), POST);
        post.position.set(px, 2.18, pz);
        post.castShadow = true;
        st.add(post);
      }
    }
    for (const ix of canopyFits ? [-2.6, 2.6] : [0]) {
      const isle = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.22, 1.3),
        new THREE.MeshStandardMaterial({ color: 0xbdbdb8, roughness: 0.8 }));
      isle.position.set(ix, 0.11, 0);
      st.add(isle);
      const pump = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.6, 0.55),
        new THREE.MeshStandardMaterial({ color: 0xe8e8e4, roughness: 0.35 }));
      pump.position.set(ix, 1.02, 0);
      pump.castShadow = true;
      st.add(pump);
      const pband = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.34, 0.57),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(c1), roughness: 0.35 }));
      pband.position.set(ix, 1.62, 0);
      st.add(pband);
      const screen = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.58), DARKM);
      screen.position.set(ix, 1.05, 0);
      st.add(screen);
    }
    const tc = document.createElement('canvas');
    tc.width = 256; tc.height = 512;
    const ctx = tc.getContext('2d');
    ctx.scale(2, 2);
    ctx.fillStyle = c1;
    ctx.fillRect(0, 0, 128, 256);
    ctx.fillStyle = c2;
    ctx.fillRect(8, 8, 112, 90);
    ctx.fillStyle = c1;
    let size = 30;
    const name = f.brand.toUpperCase();
    ctx.font = `bold ${size}px "Arial Narrow", Arial`;
    while (ctx.measureText(name).width > 104 && size > 12) {
      size -= 2;
      ctx.font = `bold ${size}px "Arial Narrow", Arial`;
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, 64, 53);
    ctx.fillStyle = '#111';
    ctx.fillRect(10, 112, 108, 110);
    ctx.fillStyle = '#ffb21a';
    ctx.font = 'bold 26px "Courier New", monospace';
    ctx.fillText('1.39', 64, 140);
    ctx.fillText('1.02', 64, 190);
    const ttex = new THREE.CanvasTexture(tc);
    ttex.colorSpace = THREE.SRGBColorSpace;
    const totem = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3.4, 0.4),
      new THREE.MeshStandardMaterial({ map: ttex, emissive: 0xffffff, emissiveMap: ttex, emissiveIntensity: 0.25, roughness: 0.3 }));
    totem.position.set(canopyFits ? 6.8 : 2.4, 1.9, canopyFits ? 3.4 : 0.6);
    totem.castShadow = true;
    st.add(totem);

    st.position.set(f.x, 0.14, f.z);
    st.rotation.y = f.a;
    group.add(st);
    colliders.addPolygon([[f.x - 2, f.z - 1], [f.x + 2, f.z - 1], [f.x + 2, f.z + 1], [f.x - 2, f.z + 1], [f.x - 2, f.z - 1]]);
  }
  scene.add(group);
}

function buildFountains(scene, map) {
  for (const [x, z] of map.fountains || []) {
    const g = new THREE.Group();
    const stone = new THREE.MeshStandardMaterial({ color: 0xcfc5b2, roughness: 0.85 });
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.5, 0.55, 32), stone);
    basin.position.y = 0.28;
    const water = new THREE.Mesh(new THREE.CylinderGeometry(2.05, 2.05, 0.1, 32),
      new THREE.MeshPhysicalMaterial({ color: 0x2a6f86, roughness: 0.05, clearcoat: 1 }));
    water.position.y = 0.5;
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 1.3, 16), stone);
    column.position.y = 1.1;
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.6, 0.25, 24), stone);
    top.position.y = 1.8;
    g.add(basin, water, column, top);
    g.position.set(x, 0.12, z);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    scene.add(g);
  }
}

function buildShrubs(scene, map) {
  const spots = [];
  const rng = (() => { let s = 31337; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  for (const a of map.areas || []) {
    if (a.k !== 'park') continue;
    const xs = a.p.map(q => q[0]), zs = a.p.map(q => q[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs);
    const z0 = Math.min(...zs), z1 = Math.max(...zs);
    const n = Math.min(14, Math.max(3, Math.round((x1 - x0) * (z1 - z0) / 250)));
    for (let k = 0; k < n * 3 && spots.filter(s => s[3] === a).length < n; k++) {
      const x = x0 + rng() * (x1 - x0), z = z0 + rng() * (z1 - z0);
      if (pointInPoly(a.p, x, z)) spots.push([x, z, 0.5 + rng() * 0.7, a]);
    }
  }
  for (const [x, z] of map.benches || []) {
    if (rng() < 0.3) spots.push([x + (rng() - 0.5) * 4, z + (rng() - 0.5) * 4, 0.4 + rng() * 0.4, null]);
  }
  if (!spots.length) return;
  // arbusto: icosaedro deformado (silueta irregular, no una bola)
  const geo = new THREE.IcosahedronGeometry(1, 2);
  const pos = geo.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    const k = 0.82 + Math.sin(pos.getX(i) * 9.1 + pos.getZ(i) * 5.3) * 0.1 + Math.cos(pos.getY(i) * 11.7) * 0.08;
    pos.setXYZ(i, pos.getX(i) * k, pos.getY(i) * k * 0.78, pos.getZ(i) * k);
  }
  geo.computeVertexNormals();
  const mesh = new THREE.InstancedMesh(geo,
    new THREE.MeshStandardMaterial({ color: 0x41682f, roughness: 0.9, flatShading: true }), spots.length);
  const m = new THREE.Matrix4();
  spots.forEach(([x, z, s], i) => {
    m.makeScale(s, s, s);
    m.setPosition(x, s * 0.6 + 0.1, z);
    mesh.setMatrixAt(i, m);
  });
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
}

function buildTrafficLights(scene, map) {
  const spots = [];
  const key = p => Math.round(p[0]) + ',' + Math.round(p[1]);
  const degree = new Map();
  for (const r of map.roads) {
    if (r.ped || r.p.length < 2) continue;
    for (const e of [r.p[0], r.p[r.p.length - 1]]) {
      degree.set(key(e), (degree.get(key(e)) || 0) + 1);
    }
  }
  for (const r of map.roads) {
    if (r.ped || !r.major || r.p.length < 2 || spots.length > 130) continue;
    for (const end of [0, 1]) {
      const e = end === 0 ? r.p[0] : r.p[r.p.length - 1];
      if ((degree.get(key(e)) || 0) < 3) continue;
      const n = end === 0 ? r.p[1] : r.p[r.p.length - 2];
      const dx = n[0] - e[0], dz = n[1] - e[1];
      const len = Math.hypot(dx, dz);
      if (len < 8) continue;
      const ux = dx / len, uz = dz / len;
      spots.push([e[0] + ux * 4.2 - uz * (r.w / 2 + 0.7), e[1] + uz * 4.2 + ux * (r.w / 2 + 0.7), Math.atan2(-ux, -uz)]);
    }
  }
  if (!spots.length) return;

  const poleGeo = new THREE.CylinderGeometry(0.06, 0.07, 3.1, 10);
  const poles = new THREE.InstancedMesh(poleGeo,
    new THREE.MeshStandardMaterial({ color: 0x3a3f45, metalness: 0.6, roughness: 0.45 }), spots.length);

  const c = document.createElement('canvas');
  c.width = 64; c.height = 192;
  const ctx = c.getContext('2d');
  ctx.scale(2, 2);
  ctx.fillStyle = '#1a1d20';
  ctx.fillRect(0, 0, 32, 96);
  for (const [i, col] of [['#5a1a14'], ['#5a4a14'], ['#43e05a']].entries()) {
    ctx.fillStyle = col[0];
    ctx.beginPath();
    ctx.arc(16, 18 + i * 30, 9, 0, Math.PI * 2);
    ctx.fill();
  }
  const headTex = new THREE.CanvasTexture(c);
  headTex.colorSpace = THREE.SRGBColorSpace;
  const headGeo = new THREE.BoxGeometry(0.26, 0.78, 0.26);
  const heads = new THREE.InstancedMesh(headGeo,
    new THREE.MeshStandardMaterial({ map: headTex, emissive: 0xffffff, emissiveMap: headTex, emissiveIntensity: 0.9, roughness: 0.3 }), spots.length);

  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  spots.forEach(([x, z, rot], i) => {
    q.setFromAxisAngle(up, rot);
    m.compose(new THREE.Vector3(x, 1.55, z), q, new THREE.Vector3(1, 1, 1));
    poles.setMatrixAt(i, m);
    m.compose(new THREE.Vector3(x, 3.4, z), q, new THREE.Vector3(1, 1, 1));
    heads.setMatrixAt(i, m);
  });
  poles.castShadow = heads.castShadow = true;
  scene.add(poles, heads);
}

const SIGN_STYLE = {
  super: ['#1d7a3e', '#ffffff'],
  food: ['#b03a26', '#fdf3e3'],
  pharma: ['#0e7a4a', '#eafff3'],
  bank: ['#1d3a6b', '#e8eefc'],
  retail: ['#31536b', '#f2ede2'],
  tech: ['#c46a1b', '#fff6e8'],
  gen: ['#3f5666', '#eef2f0'],
};

// real business names from OSM painted onto facade signs — one atlas, one mesh
function buildSigns(map, scene) {
  const signs = map.signs || [];
  if (!signs.length) return;

  const COLS = 4, CW = 512, CH = 72;
  const rows = Math.ceil(signs.length / COLS);
  const canvas = document.createElement('canvas');
  canvas.width = COLS * CW;
  canvas.height = rows * CH;
  const ctx = canvas.getContext('2d');

  signs.forEach((s, i) => {
    const x = (i % COLS) * CW, y = Math.floor(i / COLS) * CH;
    const [bg, fg] = SIGN_STYLE[s.k] || SIGN_STYLE.gen;
    const grad = ctx.createLinearGradient(0, y, 0, y + CH);
    grad.addColorStop(0, bg);
    grad.addColorStop(1, shade(bg, -0.25));
    ctx.fillStyle = grad;
    ctx.fillRect(x + 2, y + 2, CW - 4, CH - 4);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(x + 2, y + 2, CW - 4, 6);
    ctx.fillStyle = fg;
    let size = 38;
    let name = s.name.toUpperCase();
    if (name.length > 26) name = name.slice(0, 25) + '…';
    ctx.font = `bold ${size}px "Arial Narrow", Arial, sans-serif`;
    while (ctx.measureText(name).width > CW - 40 && size > 16) {
      size -= 2;
      ctx.font = `bold ${size}px "Arial Narrow", Arial, sans-serif`;
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 3;
    ctx.fillText(name, x + CW / 2, y + CH / 2 + 2);
    ctx.shadowBlur = 0;
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;

  // cajón de rótulo con grosor (no una pegatina plana)
  const W = 3.6, H = 0.55, Y = 2.62, D = 0.12;
  const positions = [], uvs = [], normals = [], indices = [];
  let vi = 0;
  const quad = (p, uv, n) => {
    positions.push(...p);
    uvs.push(...uv);
    for (let k = 0; k < 4; k++) normals.push(...n);
    indices.push(vi, vi + 1, vi + 2, vi + 1, vi + 3, vi + 2);
    vi += 4;
  };
  signs.forEach((s, i) => {
    const tx = s.nz, tz = -s.nx;
    const ox = s.x + s.nx * (0.05 + D), oz = s.z + s.nz * (0.05 + D);
    const bx = s.x + s.nx * 0.05, bz = s.z + s.nz * 0.05;
    const u0 = (i % COLS) / COLS, u1 = u0 + 1 / COLS;
    const v1 = 1 - Math.floor(i / COLS) / rows, v0 = v1 - 1 / rows;
    quad([
      ox - tx * W / 2, Y - H / 2, oz - tz * W / 2,
      ox + tx * W / 2, Y - H / 2, oz + tz * W / 2,
      ox - tx * W / 2, Y + H / 2, oz - tz * W / 2,
      ox + tx * W / 2, Y + H / 2, oz + tz * W / 2,
    ], [u0, v0, u1, v0, u0, v1, u1, v1], [s.nx, 0, s.nz]);
    // canto superior e inferior (color del borde de la textura)
    const ue = u0 + 0.002;
    quad([
      bx - tx * W / 2, Y + H / 2, bz - tz * W / 2,
      bx + tx * W / 2, Y + H / 2, bz + tz * W / 2,
      ox - tx * W / 2, Y + H / 2, oz - tz * W / 2,
      ox + tx * W / 2, Y + H / 2, oz + tz * W / 2,
    ], [ue, v1 - 0.001, ue, v1 - 0.001, ue, v1 - 0.001, ue, v1 - 0.001], [0, 1, 0]);
    quad([
      ox - tx * W / 2, Y - H / 2, oz - tz * W / 2,
      ox + tx * W / 2, Y - H / 2, oz + tz * W / 2,
      bx - tx * W / 2, Y - H / 2, bz - tz * W / 2,
      bx + tx * W / 2, Y - H / 2, bz + tz * W / 2,
    ], [ue, v0 + 0.001, ue, v0 + 0.001, ue, v0 + 0.001, ue, v0 + 0.001], [0, -1, 0]);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(indices);
  // rótulos retroiluminados: brillan solos por la noche
  const mat = new THREE.MeshStandardMaterial({
    map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.12,
    roughness: 0.35, metalness: 0.0, side: THREE.DoubleSide,
  });
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uGlow = windowGlow;
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uGlow;')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance *= 1.0 + uGlow * 9.0;');
  };
  const mesh = new THREE.Mesh(g, mat);
  mesh.castShadow = true;
  scene.add(mesh);
}

function shade(hex, k) {
  const c = new THREE.Color(hex);
  c.offsetHSL(0, 0, k * 0.5);
  return '#' + c.getHexString();
}

function buildStreetlights(map) {
  const spots = [];
  for (const r of map.roads) {
    if (!r.major) continue;
    let acc = 0, side = 1;
    for (let i = 0; i < r.p.length - 1; i++) {
      const [ax, az] = r.p[i], [bx, bz] = r.p[i + 1];
      const dx = bx - ax, dz = bz - az;
      const len = Math.hypot(dx, dz) || 0.001;
      let d = 28 - acc;
      while (d < len) {
        const t = d / len;
        const off = (r.w / 2 + 1.1) * side;
        // ángulo hacia la calzada para el brazo de la farola
        spots.push([ax + dx * t + (-dz / len) * off, az + dz * t + (dx / len) * off, Math.atan2(dx / len * side, dz / len * side)]);
        side = -side;
        d += 28;
      }
      acc = (acc + len) % 28;
      if (spots.length > 900) break;
    }
    if (spots.length > 900) break;
  }

  const group = new THREE.Group();
  const H = 6.2;
  // báculo: fuste cónico + brazo curvo hacia la calzada
  const fuste = new THREE.CylinderGeometry(0.06, 0.1, H, 10);
  fuste.translate(0, H / 2, 0);
  const brazo = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0, H - 0.3, 0), new THREE.Vector3(0, H + 0.25, 0), new THREE.Vector3(1.3, H + 0.15, 0)), 8, 0.045, 6);
  const base = new THREE.CylinderGeometry(0.16, 0.18, 0.6, 10);
  base.translate(0, 0.3, 0);
  const poleGeo = mergeGeometries([fuste.toNonIndexed(), brazo.toNonIndexed(), base.toNonIndexed()], false);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x3f454b, metalness: 0.7, roughness: 0.4 });
  const poles = new THREE.InstancedMesh(poleGeo, poleMat, spots.length);
  const headGeo = new THREE.BoxGeometry(0.62, 0.1, 0.26);
  headGeo.translate(1.45, H + 0.1, 0);
  const headMat = new THREE.MeshStandardMaterial({
    color: 0x2e3338, emissive: 0xffe8a8, emissiveIntensity: 0, metalness: 0.3, roughness: 0.4,
  });
  const heads = new THREE.InstancedMesh(headGeo, headMat, spots.length);
  // charco de luz en el suelo (se mezcla aditivamente por la noche)
  const glowGeo = new THREE.CircleGeometry(4.2, 24);
  const gc = document.createElement('canvas');
  gc.width = gc.height = 128;
  const gctx = gc.getContext('2d');
  const gg = gctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gg.addColorStop(0, 'rgba(255,255,255,1)');
  gg.addColorStop(0.45, 'rgba(255,255,255,0.45)');
  gg.addColorStop(1, 'rgba(255,255,255,0)');
  gctx.fillStyle = gg;
  gctx.fillRect(0, 0, 128, 128);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffc878, map: new THREE.CanvasTexture(gc), transparent: true, opacity: 0,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const glows = new THREE.InstancedMesh(glowGeo, glowMat, spots.length);

  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const flat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  spots.forEach(([x, z, a], i) => {
    q.setFromAxisAngle(up, a);
    m.compose(new THREE.Vector3(x, 0, z), q, new THREE.Vector3(1, 1, 1));
    poles.setMatrixAt(i, m);
    heads.setMatrixAt(i, m);
    const hx = x + Math.cos(a) * 1.45, hz = z - Math.sin(a) * 1.45;
    m.compose(new THREE.Vector3(hx, 0.21, hz), flat, new THREE.Vector3(1, 1, 1));
    glows.setMatrixAt(i, m);
  });
  poles.castShadow = true;
  group.add(poles, heads, glows);

  // luz real de las farolas más cercanas al jugador: un juego fijo de focos
  // que se recolocan (el número de luces no cambia, así no se recompila nada)
  const lampPos = spots.map(([x, z, a]) => [x + Math.cos(a) * 1.45, z - Math.sin(a) * 1.45]);
  const pool = [];
  for (let i = 0; i < 6; i++) {
    const s = new THREE.SpotLight(0xffc98a, 0, 26, 1.05, 0.75, 1.5);
    s.position.set(0, -50, 0);
    s.target.position.set(0, -60, 0);
    group.add(s, s.target);
    pool.push(s);
  }
  let tick = 0;
  group.userData.updateLamps = (px, pz, night, dt) => {
    const on = THREE.MathUtils.smoothstep(night, 0.3, 0.7);
    tick -= dt;
    if (tick <= 0 && on > 0) {
      tick = 0.4;
      const near = lampPos
        .map((p, i) => [Math.hypot(p[0] - px, p[1] - pz), i])
        .sort((a, b) => a[0] - b[0])
        .slice(0, pool.length);
      near.forEach(([, i], k) => {
        const [lx, lz] = lampPos[i];
        pool[k].position.set(lx, H - 0.05, lz);
        pool[k].target.position.set(lx, 0, lz);
        pool[k].target.updateMatrixWorld();
      });
    }
    for (const s of pool) s.intensity = on * 90;
  };
  group.userData.headMat = headMat;
  group.userData.glowMat = glowMat;
  group.userData.spots = spots;
  return group;
}

function dashGeometry(points, y) {
  const positions = [], indices = [];
  let vi = 0;
  const DASH = 3, GAP = 4, HW = 0.07;
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, az] = points[i], [bx, bz] = points[i + 1];
    const dx = bx - ax, dz = bz - az;
    const len = Math.hypot(dx, dz);
    if (len < DASH) continue;
    const ux = dx / len, uz = dz / len;
    const nx = -uz, nz = ux;
    for (let d = 1; d + DASH < len; d += DASH + GAP) {
      const x0 = ax + ux * d, z0 = az + uz * d;
      const x1 = ax + ux * (d + DASH), z1 = az + uz * (d + DASH);
      positions.push(
        x0 + nx * HW, y, z0 + nz * HW, x0 - nx * HW, y, z0 - nz * HW,
        x1 + nx * HW, y, z1 + nz * HW, x1 - nx * HW, y, z1 - nz * HW,
      );
      indices.push(vi, vi + 2, vi + 1, vi + 1, vi + 2, vi + 3);
      vi += 4;
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

const PALETTES = {
  res: [[1, 1, 0.98], [0.99, 0.97, 0.92], [1, 0.99, 0.96], [0.96, 0.94, 0.88], [0.85, 0.95, 1], [1, 0.9, 0.76], [0.8, 0.93, 1], [1, 0.86, 0.68], [0.87, 1, 0.88], [1, 0.82, 0.8], [0.95, 0.88, 1]],
  gen: [[0.98, 0.93, 0.82], [0.92, 0.86, 0.74], [1, 0.96, 0.86], [0.86, 0.84, 0.78], [1, 0.88, 0.7], [0.85, 0.94, 0.98]],
  industrial: [[0.78, 0.79, 0.81], [0.72, 0.74, 0.77], [0.85, 0.83, 0.78]],
  church: [[1, 0.94, 0.8]],
};

const FLOOR_H = 3.0;
const WINDOW_W = 4.0;
const ATLAS_W = 16.0; // ground-floor atlas covers 16m (4 cells of 4m)

class WallBatch {
  constructor() {
    this.positions = []; this.normals = []; this.uvs = []; this.cols = []; this.indices = [];
    this.vi = 0;
  }
  quad(ax, az, bx, bz, y0, y1, nx, nz, u0, u1, v0, v1, color) {
    this.positions.push(ax, y0, az, bx, y0, bz, ax, y1, az, bx, y1, bz);
    for (let k = 0; k < 4; k++) {
      this.normals.push(nx, 0, nz);
      this.cols.push(color.r, color.g, color.b);
    }
    this.uvs.push(u0, v0, u1, v0, u0, v1, u1, v1);
    // orden de vértices coherente con la normal: la cara delantera mira hacia (nx, nz)
    // (los contornos de OSM vienen en los dos sentidos; si no, una de cada diez
    // casas salía con las paredes del revés, negras)
    const v = this.vi;
    if ((bz - az) * nx - (bx - ax) * nz >= 0) this.indices.push(v, v + 2, v + 1, v + 1, v + 2, v + 3);
    else this.indices.push(v, v + 1, v + 2, v + 1, v + 3, v + 2);
    this.vi += 4;
  }
  /** da la vuelta a las caras del último cuadrilátero */
  flipLast() {
    const n = this.indices.length;
    const [a, b, c, d, e, f] = this.indices.slice(n - 6);
    this.indices.splice(n - 6, 6, a, c, b, d, f, e);
  }
  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.normals, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uvs, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.cols, 3));
    g.setIndex(this.indices);
    return g;
  }
}

function buildBuildings(map, colliders, scene) {
  const roofGeoms = [];
  const upper = new WallBatch();   // window floors
  const parapet = new WallBatch(); // remate de azotea
  const cornice = new WallBatch(); // cornisa saliente sobre la planta baja
  const bands = { shop: new WallBatch(), res: new WallBatch(), ind: new WallBatch() };
  const color = new THREE.Color();
  const pcolor = new THREE.Color();
  const roof = new THREE.Color();
  const white = new THREE.Color(1, 1, 0.97);

  const isletCastles = [];
  const SG = [171, 1300];
  const sgHoles = (map.sea?.holes || []).filter(h => {
    const [hx, hz] = centroid(h);
    return Math.hypot(hx - SG[0], hz - SG[1]) < 250;
  });
  for (const b of map.buildings) {
    const pts = b.p;
    colliders.addPolygon(pts);
    if (b.skip) continue;   // tiene su propio modelo (la iglesia de San Ginés)

    if (sgHoles.length) {
      const [bcx, bcz] = centroid(pts);
      if (sgHoles.some(h => pointInPoly(h, bcx, bcz))) {
        isletCastles.push({ name: 'Castillo de San Gabriel', p: pts, h: Math.max(b.h, 5) });
        continue;
      }
    }

    if (b.c) {
      roof.setRGB(b.c[0] / 255, b.c[1] / 255, b.c[2] / 255).convertSRGBToLinear();
      color.copy(roof).lerp(white, 0.62);
    } else {
      const pal = PALETTES[b.k] || PALETTES.gen;
      const base = pal[Math.floor(Math.abs(pts[0][0] * 7 + pts[0][1] * 13)) % pal.length];
      color.setRGB(base[0], base[1], base[2]);
      roof.copy(color).multiplyScalar(0.82);
    }
    if (b.f) {
      color.setRGB(b.f[0] / 255, b.f[1] / 255, b.f[2] / 255).convertSRGBToLinear().lerp(white, 0.25);
    }

    const hasUpper = b.h > 4.5;
    const hb = hasUpper ? FLOOR_H : b.h;
    const ground = b.s ? bands.shop : (b.k === 'industrial' ? bands.ind : bands.res);
    const atlasShift = (Math.abs(Math.floor(pts[0][0] * 3 + pts[0][1] * 5)) % 4) * 4;
    // OSM mezcla polígonos horarios y antihorarios: la normal siempre hacia fuera
    const out = signedArea(pts) >= 0 ? 1 : -1;
    let run = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
      const len = Math.hypot(bx - ax, bz - az);
      if (len < 0.05) continue;
      const nx = out * (bz - az) / len, nz = -out * (bx - ax) / len;

      ground.quad(ax, az, bx, bz, 0, hb, nx, nz,
        (run + atlasShift) / ATLAS_W, (run + atlasShift + len) / ATLAS_W, 0, 1, color);

      if (hasUpper) {
        const rows = Math.max(1, Math.round((b.h - hb) / FLOOR_H));
        upper.quad(ax, az, bx, bz, hb, b.h, nx, nz,
          run / WINDOW_W, (run + len) / WINDOW_W, 0, rows, color);
        // cornisa: banda que sobresale 12 cm entre planta baja y primera
        const o = 0.12;
        pcolor.copy(color).multiplyScalar(0.96);
        cornice.quad(ax + nx * o, az + nz * o, bx + nx * o, bz + nz * o, hb - 0.08, hb + 0.14, nx, nz, 0, 1, 0, 1, pcolor);
        cornice.quad(ax, az, bx, bz, hb + 0.14, hb + 0.14, 0, 0, 0, 1, 0, 1, pcolor);
        cornice.positions.splice(-12, 12,
          ax, hb + 0.14, az, bx, hb + 0.14, bz, ax + nx * o, hb + 0.14, az + nz * o, bx + nx * o, hb + 0.14, bz + nz * o);
        cornice.normals.splice(-12, 12, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
        // la cara de arriba de la cornisa, mirando al cielo
        if (nz * (bx - ax) - nx * (bz - az) < 0) cornice.flipLast();
      }
      pcolor.copy(color).multiplyScalar(0.92);
      parapet.quad(ax, az, bx, bz, b.h, b.h + 0.6, nx, nz, 0, 1, 0, 1, pcolor);
      // cara interior del pretil (se ve desde edificios más altos)
      parapet.quad(bx - nx * 0.2, bz - nz * 0.2, ax - nx * 0.2, az - nz * 0.2, b.h, b.h + 0.6, -nx, -nz, 0, 1, 0, 1, pcolor);
      run += len;
    }

    const shape = new THREE.Shape();
    shape.moveTo(pts[0][0], -pts[0][1]);
    for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i][0], -pts[i][1]);
    let rg;
    try { rg = new THREE.ShapeGeometry(shape); } catch { continue; }
    rg.rotateX(-Math.PI / 2);
    rg.translate(0, b.h, 0);
    const rc = rg.getAttribute('position').count;
    const rcols = new Float32Array(rc * 3);
    for (let i = 0; i < rc; i++) {
      rcols[i * 3] = roof.r; rcols[i * 3 + 1] = roof.g; rcols[i * 3 + 2] = roof.b;
    }
    rg.setAttribute('color', new THREE.BufferAttribute(rcols, 3));
    roofGeoms.push(rg.toNonIndexed());
  }

  const facade = facadeTexture();
  const upperMat = matPBR(facade, { vertexColors: true, side: THREE.DoubleSide, emissive: 0x000000 }, 2.2);
  addWindowLights(upperMat, 0.45, 1.8);
  const upperMesh = new THREE.Mesh(upper.geometry(), upperMat);
  upperMesh.castShadow = true;
  upperMesh.receiveShadow = true;
  scene.add(upperMesh);

  const parapetMesh = new THREE.Mesh(
    parapet.geometry(),
    matStd({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.92 })
  );
  parapetMesh.castShadow = true;
  parapetMesh.receiveShadow = true;
  scene.add(parapetMesh);

  if (cornice.vi) {
    const corniceMesh = new THREE.Mesh(cornice.geometry(),
      matStd({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.85 }));
    corniceMesh.castShadow = true;
    corniceMesh.receiveShadow = true;
    scene.add(corniceMesh);
  }

  const strips = groundStrips();
  for (const key of ['shop', 'res', 'ind']) {
    const mat = matPBR(strips[key], { vertexColors: true, side: THREE.DoubleSide, emissive: 0x000000 }, 1.6);
    // escaparates encendidos al anochecer (casi todos los comercios)
    addWindowLights(mat, key === 'shop' ? 0.85 : 0.35, key === 'shop' ? 0.45 : 0.9);
    const mesh = new THREE.Mesh(bands[key].geometry(), mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
  }

  // azoteas: grava/hormigón con algo de textura
  const roofTex = pedestrianTexture(4);
  roofTex.repeat.set(0.12, 0.12);
  const roofs = new THREE.Mesh(
    mergeGeometries(roofGeoms, false),
    matPBR(roofTex, { vertexColors: true }, 0.8)
  );
  roofs.castShadow = true;
  roofs.receiveShadow = true;
  scene.add(roofs);
  return isletCastles;
}

function buildPalms(map) {
  const spots = [];
  const rng = (() => { let s = 1234; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();

  for (const [x, z] of map.trees || []) {
    spots.push([x, z, 5 + rng() * 3, rng() * Math.PI * 2]);
  }
  for (const a of map.areas || []) {
    if (a.k !== 'park') continue;
    const xs = a.p.map(q => q[0]), zs = a.p.map(q => q[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs);
    const z0 = Math.min(...zs), z1 = Math.max(...zs);
    const n = Math.min(10, Math.max(2, Math.round((x1 - x0) * (z1 - z0) / 400)));
    for (let k = 0; k < n; k++) {
      spots.push([x0 + rng() * (x1 - x0), z0 + rng() * (z1 - z0), 4 + rng() * 3, rng() * Math.PI * 2]);
    }
  }

  for (const r of map.roads) {
    if (!r.major) continue;
    for (let i = 1; i < r.p.length - 1; i += 2) {
      if (rng() > 0.3) continue;
      const [ax, az] = r.p[i - 1], [bx, bz] = r.p[i];
      const dx = bx - ax, dz = bz - az;
      const len = Math.hypot(dx, dz) || 1;
      const side = rng() > 0.5 ? 1 : -1;
      const off = r.w / 2 + 2.5 + rng() * 2;
      spots.push([bx + (-dz / len) * off * side, bz + (dx / len) * off * side, 4.5 + rng() * 2.5, rng() * Math.PI * 2]);
      if (spots.length >= 700) break;
    }
    if (spots.length >= 700) break;
  }

  const group = new THREE.Group();
  // tronco de palmera canaria: engrosado en la base, ligeramente curvo
  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 1, 12, 6);
  const tp = trunkGeo.getAttribute('position');
  for (let i = 0; i < tp.count; i++) {
    const y = tp.getY(i) + 0.5;
    tp.setX(i, tp.getX(i) + Math.sin(y * 2.4) * 0.05);
    const bulge = y < 0.12 ? 1 + (0.12 - y) * 3 : 1;
    tp.setX(i, tp.getX(i) * bulge);
    tp.setZ(i, tp.getZ(i) * bulge);
  }
  trunkGeo.computeVertexNormals();
  const bark = barkTexture();
  bark.repeat.set(2, 5);
  const trunkMat = matStd({ map: bark, color: 0xd8bc94, roughness: 0.95, bumpMap: bark, bumpScale: 2 });
  const trunk = new THREE.InstancedMesh(trunkGeo, trunkMat, spots.length);

  // corona: 14 frondas arqueadas (planos curvos con hoja recortada)
  const leafParts = [];
  for (let i = 0; i < 14; i++) {
    const L = 3.4 + (i % 3) * 0.35;
    const leaf = new THREE.PlaneGeometry(1.7, L, 2, 8);
    leaf.translate(0, L / 2, 0);
    const lp = leaf.getAttribute('position');
    for (let k = 0; k < lp.count; k++) {
      const t = lp.getY(k) / L;
      // arco: sube y cae por su peso; un poco de "V" en la sección
      lp.setZ(k, -t * t * L * 0.62 + Math.abs(lp.getX(k)) * 0.25);
      lp.setY(k, lp.getY(k) * (1 - t * 0.25));
    }
    const tilt = i < 5 ? -0.25 : (i < 10 ? 0.35 : 0.85);
    leaf.rotateX(-Math.PI / 2 + 0.9 - tilt);
    leaf.rotateY((i / 14) * Math.PI * 2 + (i % 2) * 0.2);
    leafParts.push(leaf);
  }
  const leafGeo = mergeGeometries(leafParts, false);
  leafGeo.computeVertexNormals();
  const leafMat = matStd({
    map: frondTexture(), alphaTest: 0.45, side: THREE.DoubleSide,
    color: 0xb8c890, roughness: 0.7, metalness: 0,
  });
  const leaves = new THREE.InstancedMesh(leafGeo, leafMat, spots.length);
  // cogollo / dátiles
  const budGeo = new THREE.SphereGeometry(0.42, 10, 8);
  budGeo.scale(1, 0.8, 1);
  const buds = new THREE.InstancedMesh(budGeo, matStd({ color: 0x8a6a3a, roughness: 0.95 }), spots.length);

  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const col = new THREE.Color();
  spots.forEach(([x, z, h, rot], i) => {
    q.setFromAxisAngle(up, rot);
    m.compose(new THREE.Vector3(x, h / 2, z), q, new THREE.Vector3(1, h, 1));
    trunk.setMatrixAt(i, m);
    const s = 0.85 + (h - 4) * 0.06;
    m.compose(new THREE.Vector3(x, h, z), q, new THREE.Vector3(s, s, s));
    leaves.setMatrixAt(i, m);
    buds.setMatrixAt(i, m);
    col.setHSL(0.22 + Math.sin(i * 1.7) * 0.03, 0.4, 0.55 + Math.cos(i * 2.3) * 0.08);
    leaves.setColorAt(i, col);
  });
  trunk.castShadow = leaves.castShadow = true;
  trunk.receiveShadow = leaves.receiveShadow = true;
  group.add(trunk, leaves, buds);
  group.userData.leaves = leaves;
  return group;
}

export function buildWorld(scene, map, onProgress, renderer) {
  const colliders = new SegmentGrid();
  const roadNames = new SegmentGrid();
  const ortho = map.meta.ortho;

  onProgress?.('Asfaltando calles…', 35);
  for (const r of map.roads) {
    if (r.name) roadNames.addPolygon(r.p, r.name);
  }

  const roadGeoms = [], dashGeoms = [], edgeGeoms = [], walkGeoms = [], pedGeoms = [], curbGeoms = [];
  for (const r of map.roads) {
    if (r.ped) {
      pedGeoms.push(roadGeometry(r.p, r.w, 0.13));
      continue;
    }
    const y = 0.14 + (r.major ? 0.02 : 0);
    roadGeoms.push(roadGeometry(r.p, r.w, y));
    // acera elevada sobre la calzada, con bordillo de piedra
    const walkY = y + 0.05;
    walkGeoms.push(roadGeometry(offsetPolyline(r.p, r.w / 2 + 1.1), 2.2, walkY));
    walkGeoms.push(roadGeometry(offsetPolyline(r.p, -r.w / 2 - 1.1), 2.2, walkY));
    curbGeoms.push(curbGeometry(offsetPolyline(r.p, r.w / 2), y - 0.02, walkY));
    curbGeoms.push(curbGeometry(offsetPolyline(r.p, -r.w / 2).reverse(), y - 0.02, walkY));
    if (r.major) {
      dashGeoms.push(dashGeometry(r.p, y + 0.012));
      edgeGeoms.push(lineGeometry(offsetPolyline(r.p, r.w / 2 - 0.35), y + 0.01, 0.08));
      edgeGeoms.push(lineGeometry(offsetPolyline(r.p, -r.w / 2 + 0.35), y + 0.01, 0.08));
    }
  }
  const maxAniso = renderer ? renderer.capabilities.getMaxAnisotropy() : 8;
  if (pedGeoms.length) {
    const pedTex = pedestrianTexture(maxAniso);
    pedTex.repeat.set(0.35, 0.35);
    const pedMesh = new THREE.Mesh(
      mergeGeometries(pedGeoms.map(g => g.toNonIndexed()), false),
      matPBR(pedTex, {}, 1.2)
    );
    pedMesh.receiveShadow = true;
    scene.add(pedMesh);
  }
  const asphalt = asphaltTexture(maxAniso);
  asphalt.repeat.set(0.3, 0.3);
  const roadMesh = new THREE.Mesh(
    mergeGeometries(roadGeoms.map(g => g.toNonIndexed()), false),
    matPBR(asphalt, {}, 1.0)
  );
  roadMesh.receiveShadow = true;
  scene.add(roadMesh);

  const walkTex = sidewalkTexture(maxAniso);
  walkTex.repeat.set(0.5, 0.5);
  const walkMesh = new THREE.Mesh(
    mergeGeometries(walkGeoms.map(g => g.toNonIndexed()), false),
    matPBR(walkTex, {}, 1.4)
  );
  walkMesh.receiveShadow = true;
  scene.add(walkMesh);
  if (curbGeoms.length) {
    const curbMesh = new THREE.Mesh(
      mergeGeometries(curbGeoms.map(g => g.toNonIndexed()), false),
      matStd({ color: 0xa9a49a, roughness: 0.8, side: THREE.DoubleSide })
    );
    curbMesh.receiveShadow = true;
    scene.add(curbMesh);
  }

  // pasos de cebra donde una calle desemboca en un cruce
  const degree = new Map();
  const key = p => Math.round(p[0]) + ',' + Math.round(p[1]);
  for (const r of map.roads) {
    if (r.ped || r.p.length < 2) continue;
    for (const e of [r.p[0], r.p[r.p.length - 1]]) {
      degree.set(key(e), (degree.get(key(e)) || 0) + 1);
    }
  }
  const zebra = [];
  let zebraCount = 0;
  for (const r of map.roads) {
    if (r.ped || r.p.length < 2 || zebraCount > 260) continue;
    for (const end of [0, 1]) {
      const e = end === 0 ? r.p[0] : r.p[r.p.length - 1];
      if ((degree.get(key(e)) || 0) < 3) continue;
      const n = end === 0 ? r.p[1] : r.p[r.p.length - 2];
      const dx = n[0] - e[0], dz = n[1] - e[1];
      const len = Math.hypot(dx, dz);
      if (len < 9) continue;
      const ux = dx / len, uz = dz / len;
      const px = -uz, pz = ux;
      const half = (r.w - 1.4) / 2;
      for (let s = 0; s < 6; s++) {
        const d = 5 + s * 0.9;
        const cx = e[0] + ux * d, cz = e[1] + uz * d;
        const g = new THREE.PlaneGeometry(half * 2, 0.45);
        g.rotateX(-Math.PI / 2);
        g.rotateY(Math.atan2(-pz, px));
        g.translate(cx, 0.185, cz);
        zebra.push(g);
      }
      zebraCount++;
    }
  }
  // pintura vial: reflectante, algo gastada
  const paintMat = new THREE.MeshStandardMaterial({
    color: 0xe6e6dc, roughness: 0.55, metalness: 0,
    map: asphalt, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
  });
  paintMat.onBeforeCompile = (sh) => {
    // el asfalto se transparenta por la pintura desgastada
    sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>', `
      vec4 aT = texture2D(map, vMapUv * 3.0);
      float wear = smoothstep(0.18, 0.32, dot(aT.rgb, vec3(0.333)));
      diffuseColor.rgb = mix(diffuseColor.rgb * 0.55, diffuseColor.rgb, wear * 0.5 + 0.5);
    `);
  };
  if (zebra.length) {
    const zg = mergeGeometries(zebra, false);
    scene.add(new THREE.Mesh(zg, paintMat));
  }
  for (const arr of [dashGeoms, edgeGeoms]) {
    if (!arr.length) continue;
    const g = mergeGeometries(arr.map(x => x.toNonIndexed()), false);
    // uvs de mundo para que el desgaste no se repita
    const p = g.getAttribute('position');
    const uv = new Float32Array(p.count * 2);
    for (let i = 0; i < p.count; i++) { uv[i * 2] = p.getX(i) * 0.25; uv[i * 2 + 1] = p.getZ(i) * 0.25; }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    const mesh = new THREE.Mesh(g, paintMat);
    mesh.receiveShadow = true;
    scene.add(mesh);
  }

  const streetlights = buildStreetlights(map);
  scene.add(streetlights);

  if (ortho) {
    onProgress?.('Colocando la foto aérea…', 45);
    const loader = new THREE.TextureLoader();
    const w = (ortho.x1 - ortho.x0) / 2;
    const h = (ortho.z1 - ortho.z0) / 2;
    // en el móvil, fotos de 2048 px (las de 4096 pueden tumbar Safari en el iPhone)
    const dir = isTouchDevice() ? 'ortho-m' : 'ortho';
    for (let qy = 0; qy < 2; qy++) {
      for (let qx = 0; qx < 2; qx++) {
        const file = `q${qx}${qy}.jpg`;
        const tex = loader.load(`${dir}/${file}`, undefined, undefined, () => {
          // si no está la versión ligera, se usa la grande
          if (dir !== 'ortho') loader.load(`ortho/${file}`, (full) => { tex.image = full.image; tex.needsUpdate = true; });
        });
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = maxAniso;
        const plane = new THREE.Mesh(
          new THREE.PlaneGeometry(w, h),
          matStd({ map: tex, roughness: 1, metalness: 0 })
        );
        plane.rotation.x = -Math.PI / 2;
        plane.position.set(ortho.x0 + w * (qx + 0.5), 0.1, ortho.z0 + h * (qy + 0.5));
        plane.receiveShadow = true;
        scene.add(plane);
      }
    }
  }

  onProgress?.('Levantando Arrecife…', 55);
  const isletCastles = buildBuildings(map, colliders, scene);
  buildSigns(map, scene);
  onProgress?.('Plazas, parques y canchas…', 68);
  // campos, pistas y canchas antes que los parques (que pintan lo que quede)
  buildSports(map, scene, colliders);
  buildParksAndPlazas(map, scene);
  onProgress?.('Mar, playa y castillos…', 72);
  const seaMat = buildSea(scene, map);
  buildBeaches(scene, map);
  buildCastles(scene, map, colliders, isletCastles);
  buildTrafficLights(scene, map);
  onProgress?.('Gasolineras, bancos y jardines…', 78);
  buildFuelStations(scene, map, colliders);
  buildFountains(scene, map);
  buildShrubs(scene, map);

  onProgress?.('Plantando palmeras…', 75);
  const palms = buildPalms(map);
  scene.add(palms);

  const b = map.meta.bounds;
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry((b.maxX - b.minX) + 3000, (b.maxZ - b.minZ) + 3000),
    matStd({
      map: groundTexture(maxAniso),
      roughness: 0.98,
      metalness: 0,
      polygonOffset: true,
      polygonOffsetFactor: 2,
      polygonOffsetUnits: 2,
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set((b.minX + b.maxX) / 2, 0, (b.minZ + b.maxZ) / 2);
  ground.receiveShadow = true;
  scene.add(ground);

  const animate = (time) => {
    if (seaMat) {
      seaMat.userData.time.value = time;
      const fm = seaMat.userData.foamMat;
      if (fm) fm.opacity = 0.45 + Math.sin(time * 0.9) * 0.15;
    }
  };

  return {
    colliders,
    roadNames,
    animate,
    streetlights,
    noAO: [palms.userData.leaves, streetlights.children[2]],
    streetHeadMat: streetlights?.userData?.headMat || null,
    streetGlowMat: streetlights?.userData?.glowMat || null,
  };
}

export function setupLights(scene, bounds) {
  const sky = createSky(scene);
  const stars = createStars(scene);
  const clouds = createClouds(scene);
  // calima suave canaria
  scene.fog = new THREE.FogExp2(0xc9dbe6, 0.00042);

  const hemi = new THREE.HemisphereLight(0xb8dcff, 0xb89a72, 0.4);
  scene.add(hemi);

  // sol atlántico (luz cálida de Lanzarote)
  const sun = new THREE.DirectionalLight(0xffe2b0, 3.0);
  sun.position.set(90, 170, 110);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  sun.shadow.camera.left = -150;
  sun.shadow.camera.right = 150;
  sun.shadow.camera.top = 150;
  sun.shadow.camera.bottom = -150;
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 700;
  sun.shadow.bias = -0.0003;
  sun.shadow.normalBias = 0.04;
  sun.shadow.radius = 2.5;
  scene.add(sun, sun.target);

  // relleno azul del cielo (luz rebotada desde el lado opuesto al sol)
  const fill = new THREE.DirectionalLight(0xa8c8e8, 0.25);
  fill.position.set(-80, 40, -60);
  scene.add(fill);

  return { sun, hemi, fill, sky, stars, clouds, cloudsMat: clouds.material };
}
