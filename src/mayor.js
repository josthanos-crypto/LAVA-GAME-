import * as THREE from 'three';
import { OFFICIAL } from './places.js';
import { streetFace } from './civic.js';
import { SegmentGrid } from './collision.js';

/** el alcalde de Arrecife: camisa azul clara, pantalón azul marino y chaleco reflectante */
const LOOK = {
  sex: 'm', skin: 0xc8916c, hair: 0x37302b, hairStyle: 'short', beard: true, eyes: 0x3a2616,
  top: 0xaecbe8, topStyle: 'long', bottom: 0x1f2d55, bottomStyle: 'pants', belt: 0x4a2e1a,
  shoes: 0x7a4a26, shoeStyle: 'shoe', height: 1.74, build: 1.34,
};

function inPoly(P, x, z) {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    if ((P[i][1] > z) !== (P[j][1] > z) && x < (P[j][0] - P[i][0]) * (z - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0]) c = !c;
  }
  return c;
}

function segDist(x, z, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2));
  return Math.hypot(ax + dx * t - x, az + dz * t - z);
}

function roadDist(roads, x, z) {
  let best = Infinity;
  for (const r of roads) {
    if (r.ped && r.w < 3) continue;
    for (let i = 0; i < r.p.length - 1; i++) {
      const [ax, az] = r.p[i], [bx, bz] = r.p[i + 1];
      if (Math.abs(ax - x) > 80 && Math.abs(bx - x) > 80) continue;
      best = Math.min(best, segDist(x, z, ax, az, bx, bz));
    }
  }
  return best;
}

/** en la acera, delante de la fachada del ayuntamiento que da a la calle */
function frontSpot(map) {
  const [ax, az] = OFFICIAL.find(o => o.k === 'ayto').at;
  const b = map.civic?.find(c => c.k === 'ayto')?.b
    || (map.buildings || []).find(q => q.p && inPoly(q.p, ax, az))
    || (map.buildings || []).reduce((best, q) => {
      if (!q.p) return best;
      const cx = q.p.reduce((s, v) => s + v[0], 0) / q.p.length, cz = q.p.reduce((s, v) => s + v[1], 0) / q.p.length;
      const d = Math.hypot(cx - ax, cz - az);
      return !best || d < best.d ? { q, d } : best;
    }, null)?.q;
  if (!b) return { x: ax, z: az, face: 0 };
  // la misma fachada en la que va el rótulo del Ayuntamiento: junto a la entrada
  const grid = new SegmentGrid();
  for (const r of map.roads) grid.addPolygon(r.p, r);
  const f = streetFace(b, grid);
  if (f) {
    const [fx, fz, gx, gz, nx, nz, len] = f;
    const tx = (gx - fx) / len, tz = (gz - fz) / len;
    const side = Math.min(1.4, len * 0.2);
    return { x: (fx + gx) / 2 + nx * 1.15 + tx * side, z: (fz + gz) / 2 + nz * 1.15 + tz * side, face: Math.atan2(nx, nz) };
  }
  let best = null;
  for (let i = 0; i < b.p.length - 1; i++) {
    const [px, pz] = b.p[i], [qx, qz] = b.p[i + 1];
    const L = Math.hypot(qx - px, qz - pz);
    if (L < 4) continue;
    let nx = (qz - pz) / L, nz = -(qx - px) / L;
    const mx = (px + qx) / 2, mz = (pz + qz) / 2;
    if (inPoly(b.p, mx + nx * 0.5, mz + nz * 0.5)) { nx = -nx; nz = -nz; }
    const d = roadDist(map.roads, mx + nx * 2, mz + nz * 2);
    if (!best || d < best.d) best = { d, x: mx + nx * 1.7, z: mz + nz * 1.7, face: Math.atan2(nx, nz) };
  }
  return best;
}

function backText() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#d6ff2a';
  g.fillRect(0, 0, 512, 128);
  g.fillStyle = '#1b1b1b';
  g.font = '800 96px "Arial Black", Arial, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('ALCALDE', 256, 68);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** chaleco reflectante abierto por delante, con sus bandas grises y ALCALDE a la espalda */
function vest(parts, build) {
  const neon = new THREE.MeshStandardMaterial({ color: 0xc8f51c, emissive: 0x4a5c00, emissiveIntensity: 0.35, roughness: 0.7, side: THREE.DoubleSide });
  const band = new THREE.MeshStandardMaterial({ color: 0xc9ccd0, roughness: 0.35, metalness: 0.3, side: THREE.DoubleSide });
  const sx = 0.19 * build, sz = 0.148 * build;
  const open = 0.55;
  const shell = (h, y, mat, r = 1) => {
    const g = new THREE.CylinderGeometry(r, r * 1.04, h, 28, 1, true, open, Math.PI * 2 - open * 2);
    g.scale(sx, 1, sz);
    const m = new THREE.Mesh(g, mat);
    m.position.y = y;
    parts.spine.add(m);
    return m;
  };
  shell(0.56, 0.02, neon);
  shell(0.05, -0.13, band, 1.012);
  shell(0.05, -0.02, band, 1.012);
  // tirantes de los hombros, también con banda
  for (const s of [-1, 1]) {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.03, sz * 2.05), neon);
    strap.position.set(s * sx * 0.5, 0.3, 0);
    parts.spine.add(strap);
    const v = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.36, 0.006), band);
    v.position.set(s * sx * 0.48, 0.1, sz * 1.02);
    v.rotation.y = s * 0.2;
    parts.spine.add(v);
  }
  const label = new THREE.Mesh(new THREE.PlaneGeometry(sx * 1.55, sx * 0.4), new THREE.MeshStandardMaterial({ map: backText(), roughness: 0.7 }));
  label.position.set(0, 0.15, -sz * 1.07);
  label.rotation.y = Math.PI;
  parts.spine.add(label);
}

/** pone al alcalde en la puerta del Ayuntamiento; se habla con él con T */
export function buildMayor(map, locales) {
  // en la entrada del Ayuntamiento (ayuntamiento.js); si no, delante de su fachada
  const spot = map.aytoDoor || frontSpot(map);
  return locales.addStreetNpc({
    name: 'El alcalde',
    look: LOOK,
    at: [spot.x, spot.z],
    face: spot.face,
    pose: 'stand',
    dress: (parts) => vest(parts, LOOK.build),
    talk: ({ me, key, visits }) => {
      const welcome = key === 'iria' ? 'bienvenida' : 'bienvenido';
      if (visits === 0) {
        return [
          { who: 'El alcalde', text: `¡Buenas, ${me}! ${welcome[0].toUpperCase() + welcome.slice(1)} al Ayuntamiento de Arrecife.` },
          { who: me, text: 'Buenas, señor alcalde. ¡Qué bonito está esto!', player: true },
          { who: 'El alcalde', text: 'Date una vuelta por el Charco de San Ginés y cruza el Puente de las Bolas hasta el castillo.' },
        ];
      }
      if (visits === 1) {
        return [
          { who: 'El alcalde', text: '¿Ya fuiste al Castillo de San Gabriel? Desde la calzada se ve todo el frente de la ciudad.' },
        ];
      }
      return [
        { who: 'El alcalde', text: 'Dicen que hay piedras de lava escondidas por las puertas de los negocios. ¡A ver cuántas encuentras!' },
      ];
    },
  });
}
