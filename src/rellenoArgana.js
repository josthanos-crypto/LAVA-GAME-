import { buildWalkIndex } from './aceras.js';
import { RELLENO_CALLES, RELLENO_CASAS } from './barrios/argana-alta/rellenoDatos.js';
import { CAMPO_ROADS, CAMPO_BUILDINGS } from './casaCampo.js';
import { ANMARA_ROADS, ANMARA_BUILDINGS } from './caminoAnmara.js';

// el campo de arriba entra en el mapa más tarde (extraData.js, desde world.js): se cuenta ya aquí
const CAMPO_CALLES = [...CAMPO_ROADS, ...ANMARA_ROADS];
const CAMPO_CASAS = [...CAMPO_BUILDINGS, ...ANMARA_BUILDINGS];
const enZona = (p) => p.some(([x, z]) => x > -2800 && x < -900 && z > -2770 && z < -1950);

/**
 * La franja de Argana Alta que faltaba: el mapa se cortaba a la altura de la Calle Luján Pérez y de ahí al campo
 * de arriba (las calles y casas sacadas de las fotos de José Manuel, campoDatos.js) quedaban 300 m de arena que
 * no existen. Aquí entran las calles y casas de OpenStreetMap de esa franja (rellenoDatos.js), menos lo que ya
 * esté en el mapa: una calle que va casi entera pegada a otra que ya existe, o una casa que pisa otra casa o una
 * calle. Las calles nuevas se enganchan a las de antes para que el GPS y el tráfico las usen.
 */
const DUPLICADA = 14;       // m: a menos de esto de una calle que ya está, el punto cuenta como repetido
const ENGANCHE = 2.5;       // m: un vértice tan cerca de otro de una calle se junta con él
const ENGANCHE_PUNTA = 9;   // m: una punta suelta tan cerca de una calle se mete en ella

const segDist = (x, z, [ax, az], [bx, bz]) => {
  const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz;
  const t = l2 ? Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2)) : 0;
  const px = ax + dx * t, pz = az + dz * t;
  return { d: Math.hypot(x - px, z - pz), px, pz };
};

/** lo más cerca de (x, z) entre las calles: { d, road, i (tramo), px, pz } */
function nearestRoad(roads, x, z) {
  let best = { d: Infinity };
  for (const road of roads) {
    const p = road.p;
    for (let i = 0; i < p.length - 1; i++) {
      const s = segDist(x, z, p[i], p[i + 1]);
      if (s.d < best.d) best = { ...s, road, i };
    }
  }
  return best;
}

/** puntos cada ~4 m a lo largo de una línea */
function sample(p) {
  const out = [];
  for (let i = 0; i < p.length - 1; i++) {
    const [ax, az] = p[i], [bx, bz] = p[i + 1];
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 4));
    for (let k = 0; k < n; k++) out.push([ax + (bx - ax) * k / n, az + (bz - az) * k / n]);
  }
  out.push(p[p.length - 1]);
  return out;
}

const bbox = (p) => p.reduce((b, [x, z]) => [Math.min(b[0], x), Math.min(b[1], z), Math.max(b[2], x), Math.max(b[3], z)],
  [Infinity, Infinity, -Infinity, -Infinity]);

const inside = ([x, z], p) => {
  let c = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, zi] = p[i], [xj, zj] = p[j];
    if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c;
  }
  return c;
};
const centre = (p) => p.reduce((a, [x, z]) => [a[0] + x / p.length, a[1] + z / p.length], [0, 0]);

/** dos casas se pisan: alguna esquina o el centro de una cae dentro de la otra (con 1 m de holgura en las cajas) */
function overlaps(p, [x0, z0, x1, z1], q, [a0, b0, a1, b1]) {
  if (x0 > a1 + 1 || x1 < a0 - 1 || z0 > b1 + 1 || z1 < b0 - 1) return false;
  return p.some((v) => inside(v, q)) || q.some((v) => inside(v, p)) || inside(centre(p), q) || inside(centre(q), p);
}

function addRoads(map) {
  const before = [...map.roads, ...CAMPO_CALLES].filter((r) => enZona(r.p));
  const fresh = RELLENO_CALLES
    .filter((c) => {
      const pts = sample(c.p);
      const rep = pts.filter(([x, z]) => nearestRoad(before, x, z).d < DUPLICADA).length;
      return rep / pts.length < 0.6;
    })
    .map((c) => ({ ...c, p: c.p.map((q) => [...q]) }));

  const verts = before.flatMap((r) => r.p);
  for (const road of fresh) {
    road.p = road.p.map(([x, z]) => {
      const v = verts.find(([vx, vz]) => Math.hypot(vx - x, vz - z) < ENGANCHE);
      return v ? [v[0], v[1]] : [x, z];
    });
    for (const end of [0, road.p.length - 1]) {
      const [x, z] = road.p[end];
      if (verts.some(([vx, vz]) => vx === x && vz === z)) continue;
      const n = nearestRoad(before, x, z);
      if (n.d > ENGANCHE_PUNTA) continue;
      const at = [+n.px.toFixed(1), +n.pz.toFixed(1)];
      n.road.p.splice(n.i + 1, 0, at);
      verts.push(at);
      road.p[end] = [...at];
    }
  }
  map.roads.push(...fresh);
  return fresh.length;
}

function addHouses(map) {
  const others = [...map.buildings, ...CAMPO_CASAS].filter((b) => b.p && enZona(b.p)).map((b) => ({ p: b.p, box: bbox(b.p) }));
  const roads = [...map.roads, ...CAMPO_CALLES].filter((r) => enZona(r.p));
  const fresh = RELLENO_CASAS.filter(({ p }) => {
    const box = bbox(p);
    if (others.some((o) => overlaps(p, box, o.p, o.box))) return false;
    // en Argana las fachadas van a ras de la acera: solo fuera la casa que se mete de verdad en la calzada
    return p.every(([x, z]) => {
      const n = nearestRoad(roads, x, z);
      return n.d > (n.road?.w ?? 0) / 2 - 1.5;
    });
  });
  map.buildings.push(...fresh.map(({ h, p }) => ({ h, k: 'res', p })));
  return fresh.length;
}

export function tuneRellenoArgana(map) {
  if (map.rellenoArgana) return;
  map.rellenoArgana = { calles: addRoads(map) };
  map.rellenoArgana.casas = addHouses(map);
  map.groundFine = [...(map.groundFine || []), { x0: -2750, x1: -950, z0: -2720, z1: -2050 }];
  buildWalkIndex(map.roads);
}
