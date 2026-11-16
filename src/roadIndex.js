/**
 * Índice de calzadas por casillas: ¿cae este punto sobre el asfalto de alguna calle?
 *
 * Lo usan las palmeras y los árboles (world.js, cityDetail.js) para no plantarse en medio de la
 * calle, y los peatones (peds.js) para no pasear por la calzada de la otra mitad de una avenida.
 * Las calles peatonales no cuentan (por ahí sí se anda y hay laureles en el eje); los caminos de
 * tierra sí, salvo que se pida lo contrario.
 */
export function makeRoadIndex(roads, { margin = 0.5, cell = 24, skipPed = true, skipDirt = false } = {}) {
  const grid = new Map();
  const key = (cx, cz) => cx * 100003 + cz;
  for (const r of roads || []) {
    if (!r || !r.p || r.p.length < 2) continue;
    if (skipPed && r.ped) continue;
    if (skipDirt && r.dirt) continue;
    const half = (r.w || 6) / 2 + margin;
    for (let i = 0; i < r.p.length - 1; i++) {
      const [ax, az] = r.p[i], [bx, bz] = r.p[i + 1];
      const x0 = Math.floor((Math.min(ax, bx) - half) / cell), x1 = Math.floor((Math.max(ax, bx) + half) / cell);
      const z0 = Math.floor((Math.min(az, bz) - half) / cell), z1 = Math.floor((Math.max(az, bz) + half) / cell);
      for (let cx = x0; cx <= x1; cx++) {
        for (let cz = z0; cz <= z1; cz++) {
          const k = key(cx, cz);
          let list = grid.get(k);
          if (!list) grid.set(k, (list = []));
          list.push([ax, az, bx, bz, half, r]);
        }
      }
    }
  }

  /** distancia al borde de la calzada más cercana (negativa: dentro del asfalto); Infinity si no hay */
  const dist = (x, z) => {
    const list = grid.get(key(Math.floor(x / cell), Math.floor(z / cell)));
    if (!list) return Infinity;
    let best = Infinity;
    for (const [ax, az, bx, bz, half] of list) {
      const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2));
      const d = Math.hypot(ax + dx * t - x, az + dz * t - z) - half;
      if (d < best) best = d;
    }
    return best;
  };

  /** la calle cuyo asfalto pisa el punto (o null) */
  const roadAt = (x, z) => {
    const list = grid.get(key(Math.floor(x / cell), Math.floor(z / cell)));
    if (!list) return null;
    for (const [ax, az, bx, bz, half, r] of list) {
      const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2));
      if (Math.hypot(ax + dx * t - x, az + dz * t - z) < half) return r;
    }
    return null;
  };

  return { onRoad: (x, z) => dist(x, z) < 0, dist, roadAt };
}
