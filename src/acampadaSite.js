import * as THREE from 'three';

/**
 * Dónde y cómo se monta la acampada: busca el Parque Islas Canarias (Parque
 * Viejo) en el mapa, el trozo de costa que tiene detrás, levanta allí un
 * muro de piedra junto al agua y planta las casetas, la hoguera y las
 * pancartas. También elige dónde aparca la Policía la tanqueta.
 */

const PARK_NAME = /islas canarias|parque viejo|parque municipal|ram[ií]rez cerd[aá]/i;
const HALF = 26;       // media longitud del muro (m)
const PIECE = 2.4;     // largo de cada tramo de muro

export function pointInPoly(poly, x, z) {
  let inn = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inn = !inn;
  }
  return inn;
}

export function inSea(sea, x, z) {
  if (!sea || !pointInPoly(sea.outer, x, z)) return false;
  for (const h of sea.holes) if (pointInPoly(h, x, z)) return false;
  return true;
}

function centroid(pts) {
  let x = 0, z = 0;
  for (const [px, pz] of pts) { x += px; z += pz; }
  return [x / pts.length, z / pts.length];
}

function nearestCoast(sea, x, z) {
  let best = null;
  for (const ring of [sea.outer, ...sea.holes]) {
    for (let i = 0; i < ring.length - 1; i++) {
      const [ax, az] = ring[i], [bx, bz] = ring[i + 1];
      const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2));
      const px = ax + dx * t, pz = az + dz * t;
      const d = Math.hypot(px - x, pz - z);
      if (!best || d < best.d) best = { ring, i, t, x: px, z: pz, d };
    }
  }
  return best;
}

/** el parque por su nombre; si no, el parque grande más pegado al mar */
function findPark(map) {
  const parks = (map.areas || []).filter(a => (a.k === 'park' || a.k === 'garden') && a.p.length > 3);
  const named = parks.find(a => a.n && PARK_NAME.test(a.n));
  if (named) return named;
  if (!map.sea) return null;
  let best = null, bestScore = Infinity;
  for (const a of parks) {
    const [cx, cz] = centroid(a.p);
    const c = nearestCoast(map.sea, cx, cz);
    if (!c || c.d > 120) continue;
    const score = c.d - Math.min(60, a.p.length);
    if (score < bestScore) { bestScore = score; best = a; }
  }
  return best;
}

/** recorre la costa desde el punto más cercano y devuelve ~2·HALF m de orilla */
function coastStrip(c) {
  const ring = c.ring;
  const n = ring.length - 1;
  const walk = (dir) => {
    const out = [];
    let acc = 0, px = c.x, pz = c.z;
    let i = dir > 0 ? c.i + 1 : c.i;
    for (let k = 0; k < n && acc < HALF; k++) {
      const idx = ((i % n) + n) % n;
      const [qx, qz] = ring[idx];
      const d = Math.hypot(qx - px, qz - pz);
      if (acc + d > HALF) {
        const f = (HALF - acc) / d;
        out.push([px + (qx - px) * f, pz + (qz - pz) * f]);
        break;
      }
      acc += d;
      out.push([qx, qz]);
      px = qx; pz = qz;
      i += dir;
    }
    return out;
  };
  return [...walk(-1).reverse(), [c.x, c.z], ...walk(1)];
}

function resample(line, step) {
  const out = [line[0]];
  let carry = 0;
  for (let i = 0; i < line.length - 1; i++) {
    const [ax, az] = line[i], [bx, bz] = line[i + 1];
    const len = Math.hypot(bx - ax, bz - az);
    let t = step - carry;
    while (t <= len) {
      out.push([ax + (bx - ax) * (t / len), az + (bz - az) * (t / len)]);
      t += step;
    }
    carry = len - (t - step);
  }
  if (out.length < 2) out.push(line[line.length - 1]);
  return out;
}

/**
 * Plano de la acampada: muro (tramos), hacia dónde queda el mar (n),
 * sitios de casetas, de hippies, hoguera, pancartas y la tanqueta.
 */
export function planSite(map, graph, colliders) {
  // el sitio de verdad del Parque Islas Canarias (junto al Gran Hotel); si no, el que encaje del mapa
  const ref = map.places?.parqueIslasCanarias;
  const park = ref ? null : findPark(map);
  let cx, cz;
  if (ref) [cx, cz] = ref;
  else if (park) [cx, cz] = centroid(park.p);
  else { cx = 0; cz = 0; }
  let wallLine, nx, nz;
  const coast = map.sea ? nearestCoast(map.sea, cx, cz) : null;
  if (coast && coast.d < 200) {
    nx = coast.x - cx; nz = coast.z - cz;
    const l = Math.hypot(nx, nz) || 1;
    nx /= l; nz /= l;
    if (!inSea(map.sea, coast.x + nx * 3, coast.z + nz * 3)) {
      // el centro del parque queda raro: normal del propio tramo de costa
      const [ax, az] = coast.ring[coast.i], [bx, bz] = coast.ring[coast.i + 1];
      const tl = Math.hypot(bx - ax, bz - az) || 1;
      nx = -(bz - az) / tl; nz = (bx - ax) / tl;
      if (!inSea(map.sea, coast.x + nx * 3, coast.z + nz * 3)) { nx = -nx; nz = -nz; }
    }
    // el muro va 1,2 m tierra adentro de la orilla
    wallLine = resample(coastStrip(coast), PIECE).map(([x, z]) => [x - nx * 1.2, z - nz * 1.2]);
    cx = coast.x - nx * 14; cz = coast.z - nz * 14;
  } else {
    nx = 0; nz = 1;
    wallLine = [];
    for (let u = -HALF; u <= HALF; u += PIECE) wallLine.push([cx + u, cz + 12]);
  }
  const tx = -nz, tz = nx; // a lo largo del muro
  const free = (x, z, r) => !inSea(map.sea, x, z) && !colliders.circleContacts(x, z, r).length;
  const spread = (count, dmin, dmax, gap, taken) => {
    const out = [];
    for (let k = 0; k < count * 30 && out.length < count; k++) {
      const u = (Math.random() * 2 - 1) * (HALF - 4);
      const d = dmin + Math.random() * (dmax - dmin);
      const [wx, wz] = wallAt(u);
      const x = wx - nx * d, z = wz - nz * d;
      if (!free(x, z, gap * 0.4)) continue;
      if ([...taken, ...out].some(p => Math.hypot(p[0] - x, p[1] - z) < gap)) continue;
      out.push([x, z]);
    }
    return out;
  };
  const wallAt = (u) => {
    const i = Math.max(0, Math.min(wallLine.length - 1, Math.round(u / PIECE + (wallLine.length - 1) / 2)));
    return wallLine[i];
  };

  const fire = [wallAt(0)[0] - nx * 9, wallAt(0)[1] - nz * 9];
  const tents = spread(11, 9, 22, 4.4, [fire]);
  const banners = spread(3, 15, 21, 6, [fire, ...tents]);
  const people = spread(10, 2.5, 8, 1.8, [fire]);

  // la tanqueta aparcada en una calle cercana
  let truck = { x: cx - nx * 45, z: cz - nz * 45, heading: Math.atan2(tx, tz) };
  if (graph?.size) {
    for (let k = 0; k < 40; k++) {
      const node = graph.randomNodeAround(cx, cz, 75, 140, k < 25);
      const nb = graph.adj[node]?.[0]?.[0];
      if (nb === undefined || inSea(map.sea, graph.x[node], graph.z[node])) continue;
      truck = { x: graph.x[node], z: graph.z[node], heading: Math.atan2(graph.x[nb] - graph.x[node], graph.z[nb] - graph.z[node]) };
      break;
    }
  }
  return {
    name: park?.n || 'Parque Islas Canarias', cx, cz, nx, nz, tx, tz,
    wallLine, fire, tents, banners, people, truck,
  };
}

/* ─── atrezo ─── */

const TENT_COLORS = [0xff7a2e, 0x18c5b8, 0x8a4fd8, 0xf2c500, 0x3e8a4f, 0xe0457b, 0x2f7fd8];
let tieDye = null;
function tieDyeTexture() {
  if (tieDye) return tieDye;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  const cols = ['#ff4f6d', '#ffb02e', '#ffe14d', '#3ed39a', '#3aa8ff', '#9b5cff'];
  for (let r = 180; r > 0; r -= 12) {
    x.fillStyle = cols[(r / 12) % cols.length];
    x.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.1) {
      const rr = r + Math.sin(a * 6 + r * 0.05) * 10;
      x.lineTo(128 + Math.cos(a) * rr, 128 + Math.sin(a) * rr);
    }
    x.fill();
  }
  tieDye = new THREE.CanvasTexture(c);
  tieDye.colorSpace = THREE.SRGBColorSpace;
  return tieDye;
}

export function makeTent(i) {
  const g = new THREE.Group();
  const dyed = i % 3 === 0;
  const cloth = new THREE.MeshStandardMaterial({
    color: dyed ? 0xffffff : TENT_COLORS[i % TENT_COLORS.length], map: dyed ? tieDyeTexture() : null, roughness: 0.85, side: THREE.DoubleSide,
  });
  if (i % 2) {
    // caseta canadiense (tejado a dos aguas)
    const s = new THREE.Shape();
    s.moveTo(-1.1, 0); s.lineTo(1.1, 0); s.lineTo(0, 1.35); s.lineTo(-1.1, 0);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 2.4, bevelEnabled: false });
    geo.translate(0, 0, -1.2);
    g.add(new THREE.Mesh(geo, cloth));
  } else {
    // iglú
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1.25, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), cloth);
    dome.scale.set(1, 0.85, 1.2);
    g.add(dome);
  }
  const door = new THREE.Mesh(new THREE.CircleGeometry(0.42, 12, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0x1c1712 }));
  door.position.set(0, 0.02, i % 2 ? 1.21 : 1.49);
  door.scale.y = i % 2 ? 1.6 : 1.3;
  g.add(door);
  g.userData.door = door;
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

const SLOGANS = ['PAZ, AMOR Y MOJO PICÓN', 'NO NOS MOVERÁN', 'MÁS SURF, MENOS CURRO', 'ABRAZA UN BURGADO', 'ARRECIFE ZEN'];
export function makeBanner(i) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 144;
  const x = c.getContext('2d');
  x.fillStyle = '#f3ead6';
  x.fillRect(0, 0, 512, 144);
  x.fillStyle = ['#d8271c', '#1f6fd8', '#2f8a3e', '#8a4fd8', '#e07a00'][i % 5];
  x.font = 'bold 52px "Comic Sans MS", "Marker Felt", "Arial Narrow", Arial';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  const text = SLOGANS[i % SLOGANS.length];
  let size = 52;
  while (x.measureText(text).width > 480 && size > 26) { size -= 2; x.font = `bold ${size}px "Comic Sans MS", "Marker Felt", Arial`; }
  x.save();
  x.translate(256, 74);
  x.rotate(-0.03);
  x.fillText(text, 0, 0);
  x.restore();
  // símbolo de la paz en la esquina
  x.strokeStyle = '#2a2a2a';
  x.lineWidth = 5;
  x.beginPath(); x.arc(470, 30, 18, 0, Math.PI * 2); x.stroke();
  x.beginPath(); x.moveTo(470, 12); x.lineTo(470, 48); x.moveTo(470, 30); x.lineTo(457, 43); x.moveTo(470, 30); x.lineTo(483, 43); x.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const g = new THREE.Group();
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.2, 8, 1), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, side: THREE.DoubleSide }));
  cloth.position.y = 2.1;
  g.add(cloth);
  const wood = new THREE.MeshStandardMaterial({ color: 0x8a6440, roughness: 0.9 });
  for (const sx of [-2.15, 2.15]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 2.8, 6), wood);
    pole.position.set(sx, 1.4, 0);
    g.add(pole);
  }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}

export function makeCampfire() {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: 0x5a3a22, roughness: 0.95 });
  for (let i = 0; i < 4; i++) {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 1.1, 6), wood);
    log.rotation.set(Math.PI / 2 - 0.35, (i / 4) * Math.PI * 2, 0);
    log.position.y = 0.3;
    g.add(log);
  }
  const stones = new THREE.MeshStandardMaterial({ color: 0x3a3530, roughness: 0.95 });
  for (let i = 0; i < 9; i++) {
    const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16, 0), stones);
    const a = (i / 9) * Math.PI * 2;
    s.position.set(Math.cos(a) * 0.75, 0.12, Math.sin(a) * 0.75);
    g.add(s);
  }
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d');
  const gr = x.createRadialGradient(32, 40, 0, 32, 36, 30);
  gr.addColorStop(0, 'rgba(255,240,180,1)');
  gr.addColorStop(0.4, 'rgba(255,150,40,0.85)');
  gr.addColorStop(1, 'rgba(255,60,0,0)');
  x.fillStyle = gr;
  x.fillRect(0, 0, 64, 64);
  const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  flame.scale.set(1.2, 1.6, 1);
  flame.position.y = 0.8;
  g.add(flame);
  g.userData.flame = flame;
  return g;
}

/** tramo de muro de piedra entre a y b, con su remate */
export function makeWallPiece(a, b) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const g = new THREE.Group();
  const shade = 0.85 + Math.random() * 0.15;
  const stone = new THREE.MeshStandardMaterial({ color: new THREE.Color(0xb3a48c).multiplyScalar(shade), roughness: 0.92 });
  const cap = new THREE.MeshStandardMaterial({ color: 0xd8cfbf, roughness: 0.8 });
  const wall = new THREE.Mesh(new THREE.BoxGeometry(len + 0.05, 1.0, 0.5), stone);
  wall.position.y = 0.5;
  const top = new THREE.Mesh(new THREE.BoxGeometry(len + 0.1, 0.12, 0.62), cap);
  top.position.y = 1.06;
  g.add(wall, top);
  g.position.set((a[0] + b[0]) / 2, 0, (a[1] + b[1]) / 2);
  g.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]) + Math.PI / 2;
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  g.userData.stone = stone;
  return g;
}
