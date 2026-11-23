/**
 * Sentidos de circulación y red peatonal, para todo el mapa.
 *
 * - `applyOneWay(map)`: pone en cada calle `ow` = 1 (sentido único, en el orden de sus puntos), −1 (único,
 *   al revés), 0 (doble sentido comprobado) o deja `owPend` = 1 si OpenStreetMap no dice nada de esa calle
 *   (se queda en doble sentido provisional). Los datos salen de `public/map/sentidos.json`
 *   (tools/sentidos.mjs): no se inventa ningún sentido.
 * - `crossings(map)`: los pasos de peatones. Cada uno: { x, z, ux, uz (a lo largo de la calle), half
 *   (medio ancho de calzada), road, real (1 = marcado en OpenStreetMap, 0 = provisional, en la boca de
 *   un cruce) }. Los usan world.js (los pinta), peds.js (se cruza solo por ahí) y traffic.js (se frena).
 * - `Calzada`: ¿este punto está en la calzada de alguna calle con coches?
 */

const CELL = 24;
const cellOf = (x, z) => Math.floor(x / CELL) * 100003 + Math.floor(z / CELL);
const nodeKey = (p) => Math.round(p[0]) + ',' + Math.round(p[1]);

/** dónde va la acera respecto al eje de la calle: su franja es de 2,2 m pegada al bordillo */
export const WALK_OFF = 1.4;

function segIndex(lines) {
  const grid = new Map();
  for (const l of lines) {
    // [carriles, km/h, x0, z0, x1, z1, ...] (tools/sentidos.mjs)
    for (let i = 2; i + 3 < l.length; i += 2) {
      const s = [l[i], l[i + 1], l[i + 2], l[i + 3], l];
      const x0 = Math.floor((Math.min(s[0], s[2]) - 4) / CELL), x1 = Math.floor((Math.max(s[0], s[2]) + 4) / CELL);
      const z0 = Math.floor((Math.min(s[1], s[3]) - 4) / CELL), z1 = Math.floor((Math.max(s[1], s[3]) + 4) / CELL);
      for (let cx = x0; cx <= x1; cx++) for (let cz = z0; cz <= z1; cz++) {
        const k = cx * 100003 + cz;
        if (!grid.has(k)) grid.set(k, []);
        grid.get(k).push(s);
      }
    }
  }
  return grid;
}

/** el tramo de OSM que pasa por (x, z) con el mismo rumbo: +1 a favor, −1 en contra, 0 si no hay
 *  (en hit.line queda la calle de OSM encontrada, con sus carriles y su velocidad) */
const hit = { line: null };
function matchDir(grid, x, z, ux, uz) {
  hit.line = null;
  const list = grid.get(cellOf(x, z));
  if (!list) return 0;
  let best = 0, bd = 3.2;
  for (const [ax, az, bx, bz, line] of list) {
    const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz;
    if (L2 < 0.01) continue;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2));
    const d = Math.hypot(ax + dx * t - x, az + dz * t - z);
    if (d >= bd) continue;
    const dot = (dx * ux + dz * uz) / Math.sqrt(L2);
    if (Math.abs(dot) < 0.8) continue;   // otra calle que cruza
    bd = d;
    best = dot > 0 ? 1 : -1;
    hit.line = line;
  }
  return best;
}

/** marca el sentido de cada calle del mapa con los datos de OpenStreetMap (una sola vez) */
export function applyOneWay(map) {
  const roads = map.roads;
  if (roads._owDone) return roads._owStats;
  roads._owDone = true;
  const data = map.sentidos;
  roads._sen = data;   // semáforos, STOP y cedas de OpenStreetMap, para senales.js
  const stats = { unico: 0, doble: 0, pendiente: 0 };
  roads._owStats = stats;
  const gOne = data ? segIndex(data.one) : null, gTwo = data ? segIndex(data.two) : null;
  for (const r of roads) {
    if (r.ped || r.dirt || r.p.length < 2) continue;
    if (r.glorieta) { r.ow = r.gloFwd ? 1 : -1; r.vmax = 30; stats.unico++; continue; }
    let fwd = 0, back = 0, both = 0, n = 0;
    const lanes = new Map(), vmax = new Map();   // valor → metros de calle con ese dato
    const note = (L) => {
      const l = hit.line;
      if (!l) return;
      if (l[0]) lanes.set(l[0], (lanes.get(l[0]) || 0) + L);
      if (l[1]) vmax.set(l[1], (vmax.get(l[1]) || 0) + L);
    };
    for (let i = 0; i + 1 < r.p.length; i++) {
      const [ax, az] = r.p[i], [bx, bz] = r.p[i + 1];
      const L = Math.hypot(bx - ax, bz - az);
      if (L < 0.5) continue;
      const ux = (bx - ax) / L, uz = (bz - az) / L;
      // tres catas por tramo (los extremos tocan otras calles: se miran algo hacia dentro)
      for (const t of [0.25, 0.5, 0.75]) {
        const x = ax + (bx - ax) * t, z = az + (bz - az) * t;
        n += L;
        const d = gOne ? matchDir(gOne, x, z, ux, uz) : 0;
        if (d > 0) { fwd += L; note(L); } else if (d < 0) { back += L; note(L); }
        else if (gTwo && matchDir(gTwo, x, z, ux, uz)) { both += L; note(L); }
      }
    }
    // carriles y velocidad máxima de OpenStreetMap (los que más metros cubren)
    const top = (m) => [...m].sort((a, b) => b[1] - a[1])[0];
    if (lanes.size && top(lanes)[1] > n * 0.4) { r.lanes = top(lanes)[0]; stats.carriles = (stats.carriles || 0) + 1; }
    if (vmax.size && top(vmax)[1] > n * 0.4) { r.vmaxOsm = top(vmax)[0]; stats.velocidad = (stats.velocidad || 0) + 1; }
    if (fwd > n * 0.6) { r.ow = 1; stats.unico++; }
    else if (back > n * 0.6) { r.ow = -1; stats.unico++; }
    else if (both > n * 0.6) { r.ow = 0; stats.doble++; }
    else { r.ow = 0; r.owPend = 1; stats.pendiente++; }
    r.vmax = r.vmaxOsm || limiteUrbano(r);
  }
  return stats;
}

/**
 * Velocidad máxima en ciudad cuando OpenStreetMap no la trae (Reglamento General de Circulación, reforma de 2021,
 * RD 970/2020): 20 km/h en las calles de plataforma única (sin acera separada), 30 en las de un carril por sentido
 * y 50 en las de dos o más carriles por sentido. Las carreteras grandes de fuera, 50 (travesía).
 */
export function limiteUrbano(r) {
  if (r.ped) return 20;
  const lanes = r.lanes || (r.ow ? (r.w >= 9 ? 2 : 1) : (r.w >= 12 ? 4 : 2));
  const porSentido = r.ow ? lanes : lanes / 2;
  return porSentido >= 2 || r.w > 9.5 ? 50 : 30;
}

/** índice de calzadas (calles con coches) para preguntar si un punto pisa el asfalto */
export class Calzada {
  constructor(roads) {
    this.grid = new Map();
    for (const r of roads) {
      if (r.ped || r.dirt || r.p.length < 2) continue;
      const half = r.w / 2;
      for (let i = 0; i + 1 < r.p.length; i++) {
        const [ax, az] = r.p[i], [bx, bz] = r.p[i + 1];
        const s = [ax, az, bx, bz, half, r];
        const x0 = Math.floor((Math.min(ax, bx) - half - 1) / CELL), x1 = Math.floor((Math.max(ax, bx) + half + 1) / CELL);
        const z0 = Math.floor((Math.min(az, bz) - half - 1) / CELL), z1 = Math.floor((Math.max(az, bz) + half + 1) / CELL);
        for (let cx = x0; cx <= x1; cx++) for (let cz = z0; cz <= z1; cz++) {
          const k = cx * 100003 + cz;
          if (!this.grid.has(k)) this.grid.set(k, []);
          this.grid.get(k).push(s);
        }
      }
    }
  }

  /** la calle cuya calzada pisa (x, z), o null; margin > 0 ensancha la calzada, < 0 la estrecha */
  roadAt(x, z, margin = 0, skip = null) {
    const list = this.grid.get(cellOf(x, z));
    if (!list) return null;
    for (const [ax, az, bx, bz, half, r] of list) {
      if (r === skip) continue;
      const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2));
      if (Math.hypot(ax + dx * t - x, az + dz * t - z) < half + margin) return r;
    }
    return null;
  }
}

/**
 * Los pasos de peatones del mapa (se calculan una vez).
 * 1) Los marcados en OpenStreetMap que caen sobre una calle con coches: reales.
 * 2) En la boca de cada calle que llega a un cruce de tres o más brazos, a la altura por la que sigue
 *    la acera de la calle que cruza: provisionales (por jugabilidad), salvo que ya haya uno real al lado.
 */
export function crossings(map) {
  const roads = map.roads;
  if (roads._pasos) return roads._pasos;
  const out = [];
  const near = (x, z, d) => out.some(c => Math.abs(c.x - x) < d && Math.abs(c.z - z) < d && Math.hypot(c.x - x, c.z - z) < d);
  const cars = roads.filter(r => !r.ped && !r.dirt && !r.glorieta && r.p.length >= 2);
  const calz = new Calzada(roads);
  // las bocas de los cruces: donde la acera de la calle que cruza sigue al otro lado de esta
  const ends = new Map();
  for (const r of roads) {
    if (r.ped || r.dirt || r.p.length < 2) continue;
    for (const end of [0, 1]) {
      const k = nodeKey(end ? r.p[r.p.length - 1] : r.p[0]);
      if (!ends.has(k)) ends.set(k, []);
      ends.get(k).push(r);
    }
  }
  const mouths = [];
  for (const r of cars) {
    for (const end of [0, 1]) {
      const pts = end ? [...r.p].reverse() : r.p;
      const arms = ends.get(nodeKey(pts[0]));
      if (!arms || arms.length < 3) continue;
      // hasta dónde llega la calzada de las otras calles del cruce, medido a lo largo de esta
      let reach = 0;
      for (const a of arms) if (a !== r) reach = Math.max(reach, a.w / 2);
      (r._reach ||= [0, 0])[end] = reach;
      if (arms.some(a => a.glorieta)) continue;
      const want = reach + WALK_OFF;
      let acc = 0, spot = null;
      for (let i = 0; i + 1 < pts.length && !spot; i++) {
        const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
        const L = Math.hypot(bx - ax, bz - az);
        if (acc + L >= want && L > 0.01) {
          const t = (want - acc) / L;
          spot = { x: ax + (bx - ax) * t, z: az + (bz - az) * t, ux: (bx - ax) / L, uz: (bz - az) / L };
        }
        acc += L;
      }
      if (!spot || acc < want + 6) continue;   // calle demasiado corta para un paso
      if (calz.roadAt(spot.x, spot.z, 0.3, r)) continue;
      mouths.push({ ...spot, half: r.w / 2, road: r, real: 0, end });
    }
  }
  // los de OpenStreetMap: si caen en la boca de un cruce, ese paso queda como real (colocado donde
  // empalma con las aceras del juego); si no, van en su sitio, a mitad de calle
  const grid = new Map();
  for (const r of cars) {
    for (let i = 0; i + 1 < r.p.length; i++) {
      const [ax, az] = r.p[i], [bx, bz] = r.p[i + 1];
      const x0 = Math.floor((Math.min(ax, bx) - 4) / CELL), x1 = Math.floor((Math.max(ax, bx) + 4) / CELL);
      const z0 = Math.floor((Math.min(az, bz) - 4) / CELL), z1 = Math.floor((Math.max(az, bz) + 4) / CELL);
      for (let cx = x0; cx <= x1; cx++) for (let cz = z0; cz <= z1; cz++) {
        const k = cx * 100003 + cz;
        if (!grid.has(k)) grid.set(k, []);
        grid.get(k).push([ax, az, bx, bz, r]);
      }
    }
  }
  const mid = [];
  for (const [x, z] of map.sentidos?.cross || []) {
    let best = null, bd = 3;
    for (const [ax, az, bx, bz, r] of grid.get(cellOf(x, z)) || []) {
      const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz;
      if (L2 < 1) continue;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2));
      const d = Math.hypot(ax + dx * t - x, az + dz * t - z);
      if (d < bd) { bd = d; const L = Math.sqrt(L2); best = { x: ax + dx * t, z: az + dz * t, ux: dx / L, uz: dz / L, half: r.w / 2, road: r, real: 1 }; }
    }
    if (!best) continue;
    const m = mouths.find(q => q.road === best.road && Math.hypot(q.x - best.x, q.z - best.z) < 13);
    if (m) m.real = 1; else mid.push(best);
  }
  for (const c of mid) {
    if (near(c.x, c.z, 7) || calz.roadAt(c.x, c.z, 0.5, c.road)) continue;
    out.push(c);
  }
  // primero las bocas reales y luego las provisionales, sin repetir
  for (const real of [1, 0]) {
    for (const c of mouths) {
      if (c.real !== real || near(c.x, c.z, real ? 5 : 8)) continue;
      out.push(c);
    }
  }
  roads._pasos = out;
  return out;
}

/** rejilla de pasos para buscarlos rápido: at(x, z, d) → el paso a menos de d metros, o null */
export class PasoIndex {
  constructor(list) {
    this.list = list;
    this.grid = new Map();
    for (const c of list) {
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
        const k = cellOf(c.x + i * CELL, c.z + j * CELL);
        if (!this.grid.has(k)) this.grid.set(k, []);
        this.grid.get(k).push(c);
      }
    }
  }

  at(x, z, d = 3) {
    const list = this.grid.get(cellOf(x, z));
    if (!list) return null;
    let best = null, bd = d;
    for (const c of list) {
      const dd = Math.hypot(c.x - x, c.z - z);
      if (dd < bd) { bd = dd; best = c; }
    }
    return best;
  }

  /** el paso cuya franja (2 m a cada lado de su eje, a lo ancho de la calzada y sus aceras) contiene (x, z) */
  on(x, z, tol = 2.2, road = null) {
    const list = this.grid.get(cellOf(x, z));
    if (!list) return null;
    for (const c of list) {
      if (road && c.road !== road) continue;
      const rx = x - c.x, rz = z - c.z;
      const along = rx * c.ux + rz * c.uz, lat = rz * c.ux - rx * c.uz;
      if (Math.abs(along) < tol && Math.abs(lat) < c.half + 2.6) return c;
    }
    return null;
  }
}
