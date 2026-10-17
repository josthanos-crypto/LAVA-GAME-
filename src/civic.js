import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { SegmentGrid } from './collision.js';
import { OFFICIAL, HOTELS, SCHOOLS } from './places.js';
import { windowGlow } from './realism.js';

/**
 * Edificios con nombre: organismos oficiales (Cabildo, Ayuntamiento,
 * policías, Correos, hospital, centro de salud y casas de cultura), colegios
 * e institutos y los hotelitos de Arrecife. Cada uno lleva su rótulo en la
 * fachada que da a la calle; los oficiales y los colegios, mástiles con las
 * banderas de España, Canarias y la Unión Europea ondeando con el alisio;
 * Correos, su buzón amarillo; los hoteles, marquesina y letrero en la azotea;
 * los colegios, la señal de «niños» en la calle. Los rótulos lucen de noche.
 */

// rótulo por tipo: fondo, letra, filete
const STYLE = {
  cabildo: ['#f4f1ea', '#1d3c6e', '#1d3c6e'],
  ayto: ['#f4f1ea', '#7a1f1f', '#7a1f1f'],
  policia: ['#1d4f9c', '#ffffff', '#f2f2f2'],
  correos: ['#ffcc00', '#00397a', '#00397a'],
  hospital: ['#0b5aa6', '#ffffff', '#ffffff'],
  urgencias: ['#c8102e', '#ffffff', '#ffffff'],
  salud: ['#ffffff', '#1a7a43', '#1a7a43'],
  cultura: ['#3a2e26', '#f0e2c0', '#c8a96a'],
  school: ['#ffffff', '#0d4e8a', '#f0bf1a'],
  hotel: ['#14181f', '#f2d58a', '#f2d58a'],
};
// color de fachada [r, g, b] por tipo
const FACADE = {
  cabildo: [236, 234, 228], ayto: [244, 238, 226], policia: [236, 238, 240], correos: [240, 236, 226],
  hospital: [232, 236, 238], salud: [238, 240, 236], cultura: [236, 226, 206], school: [236, 220, 178], hotel: [244, 242, 236],
};
const FLAGGED = new Set(['cabildo', 'ayto', 'policia', 'hospital', 'salud', 'cultura', 'school']);
const FLOOR_H = 3.0;
// el alisio sopla del nornordeste: las banderas apuntan al sursuroeste
const WIND = new THREE.Vector2(-0.3, 0.95).normalize();

function pointInPoly(poly, x, z) {
  let inn = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inn = !inn;
  }
  return inn;
}
function distToPoly(poly, x, z) {
  let d = Infinity;
  for (let i = 0; i < poly.length - 1; i++) {
    const [ax, az] = poly[i], [bx, bz] = poly[i + 1];
    const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2));
    d = Math.min(d, Math.hypot(x - ax - dx * t, z - az - dz * t));
  }
  return d;
}
const signedArea = (p) => {
  let s = 0;
  for (let i = 0; i < p.length - 1; i++) s += p[i][0] * p[i + 1][1] - p[i + 1][0] * p[i][1];
  return s / 2;
};

/** lista de sitios con nombre (oficiales, colegios y hoteles) */
function civicList() {
  return [
    ...OFFICIAL.map(o => ({ ...o })),
    ...SCHOOLS.map(s => ({ ...s, k: 'school' })),
    ...HOTELS.map(h => ({ ...h, k: 'hotel', n: `${h.n}  ${'★'.repeat(h.stars || 0)}`.trim() })),
  ];
}

/** edificio que contiene (x, z) o el más cercano a menos de maxD metros */
export function findBuilding(map, x, z, maxD = 35) {
  let best = null, bd = maxD;
  for (const b of map.buildings || []) {
    const p = b.p;
    if (Math.abs(p[0][0] - x) > 160 || Math.abs(p[0][1] - z) > 160) continue;
    if (pointInPoly(p, x, z)) return b;
    const d = distToPoly(p, x, z);
    if (d < bd) { bd = d; best = b; }
  }
  return best;
}

/**
 * busca el edificio de cada sitio y le pone su color de fachada
 * (antes de levantar la ciudad); los guarda en map.civic
 */
export function markCivic(map) {
  const list = civicList();
  for (const c of list) {
    const best = findBuilding(map, c.at[0], c.at[1]);
    if (!best) continue;
    c.b = best;
    best.f = FACADE[c.k] || best.f;
    best.civic = c.k;
  }
  map.civic = list.filter(c => c.b);
  return map.civic;
}

/** fachada que da a la calle: [ax, az, bx, bz, nx, nz, largo] */
export function streetFace(b, roads) {
  const p = b.p, out = signedArea(p) >= 0 ? 1 : -1;
  let best = null, bs = Infinity;
  for (let i = 0; i < p.length - 1; i++) {
    const [ax, az] = p[i], [bx, bz] = p[i + 1];
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 3.5) continue;
    const nx = out * (bz - az) / len, nz = -out * (bx - ax) / len;
    const mx = (ax + bx) / 2 + nx * 3, mz = (az + bz) / 2 + nz * 3;
    let d = 60;
    roads.forEachNear(mx, mz, 60, (s) => {
      const dx = s.bx - s.ax, dz = s.bz - s.az, l2 = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((mx - s.ax) * dx + (mz - s.az) * dz) / l2));
      d = Math.min(d, Math.hypot(mx - s.ax - dx * t, mz - s.az - dz * t) - s.data.w / 2);
    });
    const score = d - Math.min(len, 20) * 0.15;
    if (score < bs) { bs = score; best = [ax, az, bx, bz, nx, nz, len]; }
  }
  return best;
}

/** atlas de rótulos: una fila por rótulo (1024 × 160 px) */
export function signAtlas(signs, styles = STYLE) {
  const CW = 1024, CH = 160;
  const canvas = document.createElement('canvas');
  canvas.width = CW;
  canvas.height = CH * signs.length;
  const g = canvas.getContext('2d');
  signs.forEach((s, i) => {
    const y = i * CH;
    const [bg, fg, edge] = styles[s.style] || STYLE[s.style] || STYLE.school;
    g.fillStyle = bg;
    g.fillRect(0, y, CW, CH);
    g.strokeStyle = edge;
    g.lineWidth = 8;
    g.strokeRect(10, y + 10, CW - 20, CH - 20);
    let size = 84;
    const text = s.text.toUpperCase();
    const font = (n) => `bold ${n}px "Arial Narrow", "Helvetica Neue", Arial, sans-serif`;
    g.font = font(size);
    while (g.measureText(text).width > CW - 80 && size > 30) g.font = font(size -= 3);
    g.fillStyle = fg;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, CW / 2, y + CH / 2 + 4);
  });
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { tex, rows: signs.length };
}

/**
 * rótulos planos en una sola malla: { text, style, x, y, z, w, h, nx, nz }
 * (STYLE da los colores; un estilo con forma [fondo, letra, filete] nuevo vale igual)
 */
export function signMesh(signs, styles = STYLE) {
  const { tex, rows } = signAtlas(signs, styles);
  const geos = signs.map((s, i) => {
    const g = new THREE.PlaneGeometry(s.w, s.h);
    const uv = g.getAttribute('uv');
    for (let k = 0; k < uv.count; k++) uv.setY(k, 1 - (i + 1 - uv.getY(k)) / rows);
    if (s.double) {
      // banderola: se lee por las dos caras
      const back = g.clone();
      back.rotateY(Math.PI);
      const merged = mergeGeometries([g, back], false);
      merged.rotateY(Math.atan2(s.nx, s.nz));
      merged.translate(s.x, s.y, s.z);
      return merged;
    }
    g.rotateY(Math.atan2(s.nx, s.nz));
    g.translate(s.x, s.y, s.z);
    return g;
  });
  const mat = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0.15, roughness: 0.5 });
  return new THREE.Mesh(mergeGeometries(geos, false), mat);
}

/** banderas: España, Canarias y la UE (una fila cada una) */
export function flagAtlas() {
  const W = 256, H = 170;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H * 3;
  const g = c.getContext('2d');
  g.fillStyle = '#c60b1e'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#ffc400'; g.fillRect(0, H / 4, W, H / 2);
  ['#ffffff', '#0768a9', '#fedd00'].forEach((col, i) => { g.fillStyle = col; g.fillRect((W / 3) * i, H, W / 3 + 1, H); });
  g.fillStyle = '#003399'; g.fillRect(0, 2 * H, W, H);
  g.fillStyle = '#ffcc00';
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2, x = W / 2 + Math.cos(a) * 52, y = 2.5 * H + Math.sin(a) * 52;
    g.beginPath();
    for (let j = 0; j < 10; j++) {
      const r = j % 2 ? 4 : 10, b = -Math.PI / 2 + (j / 10) * Math.PI * 2;
      g.lineTo(x + Math.cos(b) * r, y + Math.sin(b) * r);
    }
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** señal triangular de «niños» (colegio cerca) */
function kidsTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#c8102e';
  g.beginPath(); g.moveTo(64, 6); g.lineTo(124, 116); g.lineTo(4, 116); g.closePath(); g.fill();
  g.fillStyle = '#ffffff';
  g.beginPath(); g.moveTo(64, 24); g.lineTo(110, 108); g.lineTo(18, 108); g.closePath(); g.fill();
  g.fillStyle = '#111111';
  for (const [x, s] of [[52, 1], [74, 0.85]]) {
    g.beginPath(); g.arc(x, 62 - 12 * s, 6 * s, 0, Math.PI * 2); g.fill();
    g.fillRect(x - 5 * s, 62 - 6 * s, 10 * s, 22 * s);
    g.fillRect(x - 6 * s, 84 - 6 * s + 2, 4 * s, 18 * s);
    g.fillRect(x + 2 * s, 84 - 6 * s + 2, 4 * s, 18 * s);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildCivic(scene, map) {
  const list = map.civic || markCivic(map);
  const roads = new SegmentGrid();
  for (const r of map.roads) roads.addPolygon(r.p, r);
  const group = new THREE.Group();
  group.name = 'organismos';

  // primero se decide dónde va cada cosa; luego se pinta el atlas de rótulos
  const signs = [], solids = [], flags = [], kids = [];
  for (const c of list) {
    const face = streetFace(c.b, roads);
    if (!face) continue;
    const [ax, az, bx, bz, nx, nz, len] = face;
    const mx = (ax + bx) / 2, mz = (az + bz) / 2, tx = (bx - ax) / len, tz = (bz - az) / len;
    const tall = c.b.h > 4.5;
    (group.userData.spots ||= []).push({ n: c.n, k: c.k, x: mx, z: mz, nx, nz });
    // rótulo sobre la entrada
    const sh = Math.min(c.k === 'school' || c.k === 'hotel' ? 0.85 : 1.0, (len * 0.8) / 6.4);
    signs.push({ text: c.n, style: c.k, x: mx + nx * 0.07, z: mz + nz * 0.07, y: tall ? FLOOR_H - 0.45 : Math.min(c.b.h - 0.6, 2.6), w: sh * 6.4, h: sh, nx, nz });
    if (c.k === 'hospital') {
      signs.push({ text: 'URGENCIAS', style: 'urgencias', x: mx + nx * 0.07 + tx * len * 0.3, z: mz + nz * 0.07 + tz * len * 0.3, y: 1.2 + sh, w: sh * 4.5, h: sh * 0.7, nx, nz });
    }
    // hoteles: letrero grande en la azotea y marquesina sobre la puerta
    if (c.k === 'hotel') {
      const H = Math.min(1.5, len * 0.12);
      signs.push({ text: c.n, style: 'hotel', x: mx + nx * 0.25, z: mz + nz * 0.25, y: c.b.h + 0.6 + H / 2, w: H * 6.4, h: H, nx, nz, big: true });
      const can = new THREE.BoxGeometry(3.2, 0.14, 1.7);
      can.rotateY(Math.atan2(nx, nz));
      can.translate(mx + nx * 0.85, 2.75, mz + nz * 0.85);
      solids.push([can, 0x1c2027]);
      for (const s of [-1, 1]) {
        const post = new THREE.CylinderGeometry(0.035, 0.035, 2.7, 6);
        post.translate(mx + nx * 1.6 + tx * s * 1.45, 1.35, mz + nz * 1.6 + tz * s * 1.45);
        solids.push([post, 0xb8bcc2]);
      }
    }
    // Correos: buzón amarillo en la acera
    if (c.k === 'correos') {
      const bx0 = mx + nx * 2.2 + tx * 2.5, bz0 = mz + nz * 2.2 + tz * 2.5;
      const box = new THREE.BoxGeometry(0.5, 0.62, 0.4);
      box.rotateY(Math.atan2(nx, nz));
      box.translate(bx0, 1.15, bz0);
      solids.push([box, 0xffcc00]);
      const post = new THREE.CylinderGeometry(0.05, 0.05, 0.85, 8);
      post.translate(bx0, 0.43, bz0);
      solids.push([post, 0x2a2c30]);
    }
    // mástiles con banderas delante de la fachada
    if (FLAGGED.has(c.k)) {
      const ph = c.k === 'school' ? 6 : 7.5;
      const side = Math.min(len * 0.35, 6);
      for (let k = 0; k < 3; k++) {
        const fx = mx + nx * 2.4 + tx * (side + (k - 1) * 1.3), fz = mz + nz * 2.4 + tz * (side + (k - 1) * 1.3);
        const pole = new THREE.CylinderGeometry(0.04, 0.06, ph, 8);
        pole.translate(fx, ph / 2, fz);
        solids.push([pole, 0xeeeeea]);
        const knob = new THREE.SphereGeometry(0.07, 8, 6);
        knob.translate(fx, ph + 0.05, fz);
        solids.push([knob, 0xd6b24a]);
        flags.push({ x: fx, z: fz, y: ph - 0.15, row: k });
      }
    }
    // colegios: señal de «niños» junto a la calle
    if (c.k === 'school') {
      let best = null, bd = 30;
      const qx = mx + nx * 4, qz = mz + nz * 4;
      roads.forEachNear(qx, qz, 30, (s) => {
        const dx = s.bx - s.ax, dz = s.bz - s.az, l2 = dx * dx + dz * dz || 1;
        const t = Math.max(0, Math.min(1, ((qx - s.ax) * dx + (qz - s.az) * dz) / l2));
        const px = s.ax + dx * t, pz = s.az + dz * t, d = Math.hypot(qx - px, qz - pz);
        if (d < bd) { bd = d; best = [px, pz, s.data.w]; }
      });
      if (best) {
        const [px, pz, w] = best;
        const d = Math.hypot(qx - px, qz - pz) || 1;
        const ox = (qx - px) / d, oz = (qz - pz) / d;
        const sx = px + ox * (w / 2 + 0.6), sz = pz + oz * (w / 2 + 0.6);
        const post = new THREE.CylinderGeometry(0.035, 0.035, 2.5, 6);
        post.translate(sx, 1.25, sz);
        solids.push([post, 0x9aa0a6]);
        kids.push({ x: sx - ox * 0.04, z: sz - oz * 0.04, nx: -ox, nz: -oz });
      }
    }
  }

  // rótulos (se encienden de noche)
  if (signs.length) {
    const m = signMesh(signs);
    group.add(m);
    group.userData.signMat = m.material;
  }
  if (solids.length) {
    const geos = solids.map(([g, hex]) => {
      const geo = g.index ? g.toNonIndexed() : g;
      geo.deleteAttribute('uv');
      const c = new THREE.Color(hex), n = geo.getAttribute('position').count;
      const arr = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) arr.set([c.r, c.g, c.b], i * 3);
      geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
      return geo;
    });
    const m = new THREE.Mesh(mergeGeometries(geos, false), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, metalness: 0.3 }));
    m.castShadow = true;
    group.add(m);
  }
  if (kids.length) {
    const tex = kidsTexture();
    const geos = kids.map(k => {
      const g = new THREE.PlaneGeometry(0.75, 0.75);
      g.rotateY(Math.atan2(k.nx, k.nz));
      g.translate(k.x, 2.2, k.z);
      return g;
    });
    group.add(new THREE.Mesh(mergeGeometries(geos, false), new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.6 })));
  }

  // banderas al viento: una malla con todas, movida cada fotograma
  let flagMesh = null, base = null;
  if (flags.length) {
    const FW = 1.5, FH = 1.0, SEG = 12;
    const geos = flags.map(f => {
      const g = new THREE.PlaneGeometry(FW, FH, SEG, 1);
      g.translate(FW / 2, -FH / 2, 0);
      const uv = g.getAttribute('uv');
      for (let k = 0; k < uv.count; k++) uv.setY(k, 1 - (f.row + 1 - uv.getY(k)) / 3);
      g.rotateY(Math.atan2(WIND.y, WIND.x) * -1);
      g.translate(f.x, f.y, f.z);
      return g;
    });
    const geo = mergeGeometries(geos, false);
    base = Float32Array.from(geo.getAttribute('position').array);
    flagMesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: flagAtlas(), side: THREE.DoubleSide, roughness: 0.8 }));
    flagMesh.castShadow = true;
    flagMesh.userData = { flags, FW, SEG };
    group.add(flagMesh);
  }
  scene.add(group);

  let t = 0;
  return {
    group,
    count: list.length,
    update(dt, px, pz) {
      t += dt;
      if (group.userData.signMat) group.userData.signMat.emissiveIntensity = 0.15 + windowGlow.value * 1.8;
      if (!flagMesh) return;
      // solo ondean las que están cerca
      const pos = flagMesh.geometry.getAttribute('position');
      const per = (SEG_PER(flagMesh));
      const { flags: fl, FW } = flagMesh.userData;
      const perpX = -WIND.y, perpZ = WIND.x;
      for (let f = 0; f < fl.length; f++) {
        if (Math.abs(fl[f].x - px) > 250 || Math.abs(fl[f].z - pz) > 250) continue;
        for (let k = f * per; k < (f + 1) * per; k++) {
          const bx = base[k * 3], by = base[k * 3 + 1], bz = base[k * 3 + 2];
          const along = (bx - fl[f].x) * WIND.x + (bz - fl[f].z) * WIND.y;
          const u = Math.max(0, along / FW);
          const wave = Math.sin(t * 5.5 - u * 7 + f) * 0.11 * u;
          pos.setXYZ(k, bx + perpX * wave, by - u * u * 0.06, bz + perpZ * wave);
        }
      }
      pos.needsUpdate = true;
    },
  };
}

/** vértices por bandera en la malla unida */
const SEG_PER = (m) => (m.userData.SEG + 1) * 2;
