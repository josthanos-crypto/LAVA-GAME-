import { WALK_RISE } from './world.js';

/**
 * ¿Dónde hay acera? Las mismas franjas que dibuja world.js: 2,2 m a cada lado de cada calle,
 * 10 cm por encima de la calzada. La calzada de cualquier otra calle (o una calle peatonal, que va
 * a ras) manda sobre la acera de al lado, como en los cruces. Lo usa el coche del jugador para
 * subirse al bordillo con su suspensión (car.js).
 */
const CELL = 24;
const WALK_W = 2.2;
let grid = null;

export function buildWalkIndex(roads) {
  grid = new Map();
  for (const r of roads) {
    // los caminos de tierra no tienen acera
    const reach = r.w / 2 + (r.ped || r.dirt ? 0 : Math.max(WALK_W, r.aceraL || 0, r.aceraR || 0));
    for (let i = 0; i < r.p.length - 1; i++) {
      const [ax, az] = r.p[i], [bx, bz] = r.p[i + 1];
      const seg = { ax, az, bx, bz, half: r.w / 2, reach, ped: !!(r.ped || r.dirt) };
      const x0 = Math.floor((Math.min(ax, bx) - reach) / CELL), x1 = Math.floor((Math.max(ax, bx) + reach) / CELL);
      const z0 = Math.floor((Math.min(az, bz) - reach) / CELL), z1 = Math.floor((Math.max(az, bz) + reach) / CELL);
      for (let cx = x0; cx <= x1; cx++) {
        for (let cz = z0; cz <= z1; cz++) {
          const k = cx * 100003 + cz;
          if (!grid.has(k)) grid.set(k, []);
          grid.get(k).push(seg);
        }
      }
    }
  }
}

/** cuánto más alto está el suelo aquí que la calzada: WALK_RISE en la acera, 0 en la calle */
export function walkRise(x, z) {
  if (!grid) return 0;
  const list = grid.get(Math.floor(x / CELL) * 100003 + Math.floor(z / CELL));
  if (!list) return 0;
  let walk = false;
  for (const s of list) {
    const dx = s.bx - s.ax, dz = s.bz - s.az, L = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((x - s.ax) * dx + (z - s.az) * dz) / L));
    const d = Math.hypot(s.ax + dx * t - x, s.az + dz * t - z);
    if (d < s.half) return 0;            // en la calzada de alguna calle
    if (!s.ped && d <= s.reach) walk = true;
  }
  return walk ? WALK_RISE : 0;
}
