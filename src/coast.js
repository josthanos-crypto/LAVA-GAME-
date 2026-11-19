import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { SegmentGrid } from './collision.js';
import { charcoRing } from './zones.js';
import { masonryTexture } from './fortBridge.js';

/** barandilla metálica de cruces (la azul de los puentes del Charco, vídeo 2020 min. 09:45, 14:45, 17:15) */
function xRailing(out, x0, z0, x1, z1, y0, h) {
  const L = Math.hypot(x1 - x0, z1 - z0);
  if (L < 0.4) return;
  const ux = (x1 - x0) / L, uz = (z1 - z0) / L, ry = -Math.atan2(uz, ux);
  const bar = (len, t, x, y, z, tilt = 0) => {
    const g = new THREE.BoxGeometry(len, t, t);
    if (tilt) g.rotateZ(tilt);
    g.rotateY(ry);
    g.translate(x, y, z);
    out.push(g);
  };
  const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
  bar(L, 0.07, mx, y0 + h, mz);
  bar(L, 0.05, mx, y0 + 0.12, mz);
  const n = Math.max(1, Math.round(L / 1.6)), seg = L / n, dh = h - 0.12;
  const diag = Math.hypot(seg, dh), tilt = Math.atan2(dh, seg);
  for (let k = 0; k <= n; k++) {
    const px = x0 + ux * seg * k, pz = z0 + uz * seg * k;
    const post = new THREE.BoxGeometry(0.07, h, 0.07);
    post.translate(px, y0 + h / 2, pz);
    out.push(post);
    if (k === n) break;
    const cx = px + ux * seg / 2, cz = pz + uz * seg / 2;
    bar(diag, 0.035, cx, y0 + 0.12 + dh / 2, cz, tilt);
    bar(diag, 0.035, cx, y0 + 0.12 + dh / 2, cz, -tilt);
  }
}

/**
 * La orilla: el mar y el Charco quedan cerrados para que no se pueda conducir
 * ni andar por el agua. Donde hay paseo, muro bajo encalado con albardilla de
 * basalto, como en la Avenida; en puentes y pasarelas, pretiles a los lados.
 * Las calles y pasarelas que cruzan la orilla quedan abiertas.
 */

const WALL_H = 0.9;   // altura del muro del paseo
const WALL_T = 0.42;  // grosor
const RAIL_H = 0.8;   // pretil de puentes y pasarelas
// el frente marítimo de la ciudad (fuera de aquí la costa es muelle, roca o puerto)
const TOWN = { x0: -1000, x1: 760, z0: -400, z1: 900 };
// puentes y pasarelas con pretil visible (el dique y los pantalanes no lo llevan)
const BRIDGES = { x0: -600, x1: 400, z0: 400, z1: 870 };

function pointInPolyC(poly, x, z) { return pointInPoly(poly, x, z); }
function pointInPoly(poly, x, z) {
  let inn = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inn = !inn;
  }
  return inn;
}

/**
 * Lo mismo que pointInPoly pero rápido en polígonos grandes (el mar tiene unos 1500 puntos y se
 * pregunta millones de veces al arrancar): descarta por la caja y solo mira los lados
 * que cruzan la altura z del punto (se reparten en franjas una sola vez)
 */
function polyTester(poly) {
  const n = poly.length;
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (const [x, z] of poly) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (z < z0) z0 = z; if (z > z1) z1 = z; }
  if (n < 48) return (x, z) => x >= x0 && x <= x1 && z >= z0 && z <= z1 && pointInPoly(poly, x, z);
  const BANDS = 512, bh = (z1 - z0) / BANDS || 1;
  const bands = Array.from({ length: BANDS }, () => []);
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const a = Math.min(poly[i][1], poly[j][1]), b = Math.max(poly[i][1], poly[j][1]);
    const lo = Math.max(0, Math.floor((a - z0) / bh)), hi = Math.min(BANDS - 1, Math.floor((b - z0) / bh));
    for (let k = lo; k <= hi; k++) bands[k].push(i, j);
  }
  return (x, z) => {
    if (x < x0 || x > x1 || z < z0 || z > z1) return false;
    const edges = bands[Math.min(BANDS - 1, Math.floor((z - z0) / bh))];
    let inn = false;
    for (let e = 0; e < edges.length; e += 2) {
      const [xi, zi] = poly[edges[e]], [xj, zj] = poly[edges[e + 1]];
      if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inn = !inn;
    }
    return inn;
  };
}

/** cruce de los segmentos AB y CD: parámetro t sobre AB y u sobre CD */
function cross(ax, az, bx, bz, cx, cz, dx, dz) {
  const den = (bx - ax) * (dz - cz) - (bz - az) * (dx - cx);
  if (Math.abs(den) < 1e-9) return null;
  const t = ((cx - ax) * (dz - cz) - (cz - az) * (dx - cx)) / den;
  const u = ((cx - ax) * (bz - az) - (cz - az) * (bx - ax)) / den;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? t : null;
}

const inBox = (b, x, z) => x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1;

/** caja de largo L a lo largo de (ux, uz), centrada en (x, y, z) */
function beam(L, h, t, x, y, z, ux, uz) {
  const g = new THREE.BoxGeometry(L, h, t);
  g.rotateY(-Math.atan2(uz, ux));
  g.translate(x, y, z);
  return g;
}

/** quita de [0, 1] los tramos tapados por huecos (círculos) sobre el segmento AB */
function openings(ax, az, bx, bz, holes) {
  const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz) || 1;
  const cuts = [];
  for (const h of holes) {
    const t = ((h.x - ax) * dx + (h.z - az) * dz) / (L * L);
    const px = ax + dx * t, pz = az + dz * t;
    const d = Math.hypot(h.x - px, h.z - pz);
    if (d >= h.r) continue;
    const half = Math.sqrt(h.r * h.r - d * d) / L;
    if (t + half < 0 || t - half > 1) continue;
    cuts.push([Math.max(0, t - half), Math.min(1, t + half)]);
  }
  cuts.sort((a, b) => a[0] - b[0]);
  const keep = [];
  let s = 0;
  for (const [c0, c1] of cuts) {
    if (c0 > s) keep.push([s, c0]);
    s = Math.max(s, c1);
  }
  if (s < 1) keep.push([s, 1]);
  return keep;
}

/**
 * skip: tramos de costa sin muro del paseo (allí está el muro de la misión del
 * Parque Islas Canarias, que cede y deja caer a los jipis al agua: los jipis
 * no chocan con la orilla, el jugador y los coches sí)
 */
export function buildCoast(scene, map, colliders, { skip = [] } = {}) {
  const sea = map.sea;
  const inland = map.inlandWater || [];
  const beaches = map.beaches || [];
  const seaOuter = sea && polyTester(sea.outer);
  const seaHoles = sea ? sea.holes.map(polyTester) : [];
  const inlandIn = inland.map(polyTester);
  const beachIn = beaches.map(polyTester);
  const inWater = (x, z) =>
    (sea && seaOuter(x, z) && !seaHoles.some(h => h(x, z))) ||
    inlandIn.some(p => p(x, z));
  const onBeach = (x, z) => beachIn.some(b => b(x, z));
  const rings = [...(sea ? [sea.outer, ...sea.holes] : []), ...inland];

  // orilla en una rejilla para encontrar rápido dónde la cruzan las calles
  const shore = new SegmentGrid();
  for (const ring of rings) shore.addPolygon(ring);
  const roads = new SegmentGrid();
  for (const r of map.roads) roads.addPolygon(r.p, r);

  // 1) huecos: cada calle o pasarela que cruza la orilla la deja abierta
  const holes = [];
  for (const r of map.roads) {
    const hw = Math.max(r.w, 3) / 2 + 0.9;
    for (let i = 0; i < r.p.length - 1; i++) {
      const [ax, az] = r.p[i], [bx, bz] = r.p[i + 1];
      const L = Math.hypot(bx - ax, bz - az);
      if (L < 0.01) continue;
      const seen = new Set();
      shore.forEachNear((ax + bx) / 2, (az + bz) / 2, L / 2 + 1, (s) => {
        if (seen.has(s)) return;
        seen.add(s);
        const t = cross(ax, az, bx, bz, s.ax, s.az, s.bx, s.bz);
        if (t === null) return;
        const sl = Math.hypot(s.bx - s.ax, s.bz - s.az) || 1;
        const sin = Math.abs(((bx - ax) * (s.bz - s.az) - (bz - az) * (s.bx - s.ax)) / (L * sl));
        holes.push({ x: ax + (bx - ax) * t, z: az + (bz - az) * t, r: hw / Math.max(0.35, sin) });
      });
    }
  }
  const missionHoles = [];
  for (const line of skip) for (const [x, z] of line) missionHoles.push({ x, z, r: 3.2 });

  // 2) la orilla cerrada, con muro donde hay paseo
  const body = [], caps = [];
  // la orilla del Charco de San Ginés: murete de piedra volcánica (zona piloto, zones.js)
  const cRing = charcoRing(map);
  const cBody = [], cCaps = [];
  let walls = 0;
  for (const ring of rings) {
    const isCharco = ring === cRing;
    for (let i = 0; i < ring.length - 1; i++) {
      const [ax, az] = ring[i], [bx, bz] = ring[i + 1];
      const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz);
      if (L < 0.05) continue;
      const ux = dx / L, uz = dz / L;
      // la orilla se cierra entera (salvo calles y pasarelas); el muro, solo donde no está el de la misión
      for (const [t0, t1] of openings(ax, az, bx, bz, holes)) {
        colliders.addSegment(ax + dx * t0, az + dz * t0, ax + dx * t1, az + dz * t1, 'coast');
      }
      for (const [t0, t1] of openings(ax, az, bx, bz, [...holes, ...missionHoles])) {
        const x0 = ax + dx * t0, z0 = az + dz * t0, x1 = ax + dx * t1, z1 = az + dz * t1;
        const len = (t1 - t0) * L;
        if (len < 0.6) continue;
        const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
        if (!inBox(TOWN, mx, mz)) continue;
        // hacia tierra: el lado que no es agua
        let nx = -uz, nz = ux;
        const wetA = inWater(mx + nx * 2, mz + nz * 2), wetB = inWater(mx - nx * 2, mz - nz * 2);
        if (wetA === wetB) continue;
        if (wetA) { nx = -nx; nz = -nz; }
        if (onBeach(mx + nx * 3, mz + nz * 3) || onBeach(mx, mz)) continue;
        if (!roads.nearestData(mx + nx * 4, mz + nz * 4, 24)) continue;
        const o = WALL_T / 2 + 0.05;
        const cx = mx + nx * o, cz = mz + nz * o;
        (isCharco ? cBody : body).push(beam(len + 0.3, WALL_H, WALL_T, cx, WALL_H / 2, cz, ux, uz));
        (isCharco ? cCaps : caps).push(beam(len + 0.36, 0.09, WALL_T + 0.14, cx, WALL_H + 0.045, cz, ux, uz));
        walls++;
      }
    }
  }

  // 3) puentes y pasarelas sobre el agua: pretiles a los dos lados
  const rails = [], blueRails = [];
  for (const r of map.roads) {
    const hw = Math.max(r.w, 3.2) / 2 + 0.2;
    for (let i = 0; i < r.p.length - 1; i++) {
      const [ax, az] = r.p[i], [bx, bz] = r.p[i + 1];
      const L = Math.hypot(bx - ax, bz - az);
      if (L < 0.5) continue;
      const ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux;
      for (const side of [1, -1]) {
        let run = null;
        const flush = () => {
          if (run && run.length > 1) {
            const [p0, p1] = [run[0], run[run.length - 1]];
            colliders.addSegment(p0[0], p0[1], p1[0], p1[1], 'coast');
            const rl = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
            const mx = (p0[0] + p1[0]) / 2, mz = (p0[1] + p1[1]) / 2;
            // el Puente de las Bolas y la calzada del castillo llevan sus propios muretes (fortBridge.js)
            if (rl > 0.8 && cRing && pointInPolyC(cRing, mx, mz)) {
              xRailing(blueRails, p0[0], p0[1], p1[0], p1[1], 0.2, 0.95);
            } else if (rl > 0.8 && inBox(BRIDGES, mx, mz) && !r.bolas && !r.calzada) {
              rails.push(beam(rl + 0.2, RAIL_H, 0.35, mx, 0.2 + RAIL_H / 2, mz, ux, uz));
            }
          }
          run = null;
        };
        const n = Math.max(2, Math.ceil(L));
        for (let k = 0; k <= n; k++) {
          const t = k / n;
          const x = ax + (bx - ax) * t + nx * hw * side, z = az + (bz - az) * t + nz * hw * side;
          if (inWater(x, z)) (run ||= []).push([x, z]);
          else flush();
        }
        flush();
      }
    }
  }

  const group = new THREE.Group();
  const add = (geos, mat) => {
    if (!geos.length) return;
    const m = new THREE.Mesh(mergeGeometries(geos, false), mat);
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
  };
  // coordenadas de textura del mundo: las piedras no se estiran con el largo de cada tramo
  for (const g of body) {
    const p = g.getAttribute('position'), n = g.getAttribute('normal'), uv = g.getAttribute('uv');
    for (let i = 0; i < p.count; i++) {
      const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
      const u = ay > ax && ay > az ? p.getX(i) : ax > az ? p.getZ(i) : p.getX(i);
      uv.setXY(i, u / 1.8, (ay > ax && ay > az ? p.getZ(i) : p.getY(i)) / 1.8);
    }
  }
  // los muros de la orilla: mampostería de piedra volcánica como el Charco (fotos del paseo de Av. Fred Olsen)
  const stone = masonryTexture({ mortar: '#a9a399', stone: [52, 50, 47], spread: 26, seed: 23, rowH: 26 });
  add(body, new THREE.MeshStandardMaterial({ map: stone, roughness: 0.93, userData: { terrain: 'skirt' } }));
  add(caps, new THREE.MeshStandardMaterial({ color: 0xc9c4b8, roughness: 0.85 }));
  add(rails, new THREE.MeshStandardMaterial({ color: 0x8d8174, roughness: 0.93 }));
  if (cBody.length) {
    // coordenadas de textura del mundo: las piedras no se estiran con el largo de cada tramo
    for (const g of cBody) {
      const p = g.getAttribute('position'), n = g.getAttribute('normal'), uv = g.getAttribute('uv');
      for (let i = 0; i < p.count; i++) {
        const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
        const u = ay > ax && ay > az ? p.getX(i) : ax > az ? p.getZ(i) : p.getX(i);
        uv.setXY(i, u / 1.8, (ay > ax && ay > az ? p.getZ(i) : p.getY(i)) / 1.8);
      }
    }
    // pretil de piedra volcánica negra con las juntas claras y remate de hormigón claro
    // (fotos de José Manuel de la entrada del Charco y de los cines; antes, vídeo 2020: más oscuro)
    const stone = masonryTexture({ mortar: '#a9a399', stone: [52, 50, 47], spread: 26, seed: 23, rowH: 26 });
    add(cBody, new THREE.MeshStandardMaterial({ map: stone, roughness: 0.93, userData: { terrain: 'skirt' } }));
    add(cCaps, new THREE.MeshStandardMaterial({ color: 0xc9c4b8, roughness: 0.85 }));
  }
  if (blueRails.length) {
    add(blueRails, new THREE.MeshStandardMaterial({ color: 0x2f6fc0, roughness: 0.45, metalness: 0.35 }));
  }
  scene.add(group);
  return { group, walls, rails: rails.length, holes: holes.length };
}
