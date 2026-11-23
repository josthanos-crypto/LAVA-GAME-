/**
 * Zonas con tratamiento arquitectónico propio. Todo lo que hay aquí es
 * configurable y está etiquetado según su origen:
 *  - 'aproximación artística': elección visual del juego, NO una norma ni un color oficial.
 *  - 'datos del mapa': geometría de OpenStreetMap ya procesada (public/map/arrecife.json).
 *
 * No hay ningún código de color oficial verificado para la carpintería de Arrecife:
 * los colores de abajo son una paleta del juego.
 */
export const ZONES = [
  {
    id: 'charco',
    name: 'Charco de San Ginés',
    // el Charco es la lámina de agua interior que contiene este punto (datos del mapa)
    waterProbe: [320, 140],
    // edificios cuyo centro está a menos de esto de la orilla del Charco
    reach: 55,
    walls: { colors: [[247, 245, 239], [243, 240, 231], [251, 250, 246], [239, 233, 220]], origin: 'aproximación artística' },
    carpentry: {
      // azul en la mayoría de las casas del Charco, alguna verde
      blue: '#2f6cab', blueDark: '#245585', green: '#2f6b4f', greenDark: '#245540', blueShare: 0.75,
      // observado en el vídeo de referencia 2020: azul mayoritario (09:45–16:30) y algo de verde (12:00, 17:00);
      // el tono exacto no es medible en un vídeo comprimido: aproximación artística, sin norma verificada
      origin: 'observación 2020 (vídeo) + tono: aproximación artística',
    },
    plinth: { origin: 'aproximación artística: zócalo de piedra volcánica oscura' },
    quay: { origin: 'observación 2020 (vídeo, 11:00–19:45): pretil bajo de piedra oscura con remate oscuro' },
    // vídeo de referencia 2020 (REFERENCIA_VIDEO_CALLE_REAL.md): barcas por toda la lámina, min. 10:45, 17:30, 19:45
    boats: { count: 28, countTouch: 20, open: 48, openTouch: 30, origin: 'observación 2020 (vídeo) + posición: aproximación artística' },
  },
];

ZONES.push({
  id: 'real',
  name: 'Calle Real (León y Castillo)',
  // vídeo de referencia 2020, min. 00:00–00:10 y 04:45–08:40 (REFERENCIA_VIDEO_CALLE_REAL.md)
  walls: {
    colors: [[246, 244, 238], [238, 229, 208], [228, 216, 192], [234, 218, 178], [216, 213, 206], [244, 238, 226]],
    origin: 'observación 2020: fachadas blancas, crema, beige y piedra clara; tonos: aproximación artística',
  },
  // árboles grandes en el eje de la calle, farolas con cestas de flores y bancos (separaciones: aproximación)
  treeStep: 14, lampStep: 22, benchStep: 28, maxHalf: 9,
  origin: 'observación 2020 (vídeo) + medidas y posiciones: aproximación artística',
});

export const zone = (id) => ZONES.find(z => z.id === id);

function inPoly(P, x, z) {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    if ((P[i][1] > z) !== (P[j][1] > z) && x < (P[j][0] - P[i][0]) * (z - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0]) c = !c;
  }
  return c;
}

/** la orilla del Charco (anillo de agua interior del mapa) o null si el mapa no la trae */
export function charcoRing(map) {
  const z = zone('charco');
  return (map.inlandWater || []).find(p => inPoly(p, z.waterProbe[0], z.waterProbe[1])) || null;
}

/** distancia de (x, z) a la orilla del anillo */
export function ringDist(ring, x, z) {
  let best = Infinity;
  for (let i = 0; i < ring.length - 1; i++) {
    const [ax, az] = ring[i], [bx, bz] = ring[i + 1];
    const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2));
    best = Math.min(best, Math.hypot(ax + dx * t - x, az + dz * t - z));
  }
  return best;
}

/** marca b.zone ('charco' o 'real') en los edificios de cada zona; devuelve cuántos */
export function markZones(map) {
  let n = 0;
  const ring = charcoRing(map);
  if (ring) {
    const z = zone('charco');
    for (const b of map.buildings || []) {
      if (b.skip || b.civic) continue;
      const cx = b.p.reduce((s, q) => s + q[0], 0) / b.p.length, cz = b.p.reduce((s, q) => s + q[1], 0) / b.p.length;
      if (inPoly(ring, cx, cz)) continue;
      if (ringDist(ring, cx, cz) < z.reach) { b.zone = 'charco'; n++; }
    }
  }
  // la Calle Real: los edificios con fachada a la calle llevan comercio en la planta baja (vídeo 04:45–08:40)
  const axis = calleRealAxis(map);
  if (axis) {
    for (const b of map.buildings || []) {
      if (b.skip || b.civic || b.zone) continue;
      if (b.p.some(([x, z]) => ringDist(axis, x, z) < 10)) { b.zone = 'real'; b.s = true; n++; }
    }
  }
  return n;
}

/** el eje de la Calle Real (la peatonal más larga de León y Castillo) */
export function calleRealAxis(map) {
  const real = (map.roads || []).filter(r => r.ped && /le[oó]n y castillo/i.test(r.name || '')).sort((a, b) => b.p.length - a.p.length)[0];
  return real ? real.p : null;
}

/**
 * Calle Real: tramos de pavimento de fachada a fachada, árboles en el eje, farolas y bancos.
 * Los anchos salen de los edificios del mapa; lo demás es aproximación artística sobre lo visto en el vídeo.
 */
export function calleRealLayout(map) {
  if (map._realLayout) return map._realLayout;
  const out = { strips: [], trees: [], lamps: [], benches: [] };
  map._realLayout = out;
  const P = calleRealAxis(map);
  if (!P) return out;
  const cfg = zone('real');
  const roads = map.roads || [];
  const near = (map.buildings || []).filter(b => b.p.some(([x, z]) => ringDist(P, x, z) < 30));
  const built = (x, z) => near.some(b => inPoly(b.p, x, z));
  const reach = (x, z, nx, nz) => {
    for (let d = 1; d <= cfg.maxHalf; d += 0.5) if (built(x + nx * d, z + nz * d)) return Math.max(2.5, d - 0.35);
    return cfg.maxHalf;
  };
  let along = 0;
  for (let i = 0; i < P.length - 1; i++) {
    const [ax, az] = P[i], [bx, bz] = P[i + 1];
    const L = Math.hypot(bx - ax, bz - az);
    if (L < 0.5) continue;
    const ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux;
    // en trozos de 4 m, cada uno con su ancho hasta las fachadas de cada lado
    const n = Math.max(1, Math.round(L / 4));
    for (let k = 0; k < n; k++) {
      const t0 = k / n, t1 = (k + 1) / n, tm = (t0 + t1) / 2;
      const mx = ax + (bx - ax) * tm, mz = az + (bz - az) * tm;
      // las calles con coches que cruzan la Calle Real se quedan con su asfalto (vídeo 06:15)
      if (nearRoadAxis(roads, mx, mz, 1.5, true)) continue;
      out.strips.push({
        ax: ax + (bx - ax) * t0, az: az + (bz - az) * t0, bx: ax + (bx - ax) * t1, bz: az + (bz - az) * t1,
        nx, nz, wl: reach(mx, mz, nx, nz), wr: reach(mx, mz, -nx, -nz),
      });
    }
    for (let d = (cfg.treeStep - (along % cfg.treeStep)) % cfg.treeStep; d < L; d += cfg.treeStep) {
      const x = ax + ux * d, z = az + uz * d;
      const k = Math.round((along + d) / cfg.treeStep);
      if (nearRoadAxis(roads, x, z, 3, true) || built(x, z)) continue;
      out.trees.push([x, z]);
      // un banco a cada lado del árbol, cada dos árboles (vídeo 04:45, 05:45)
      if (k % 2 === 0) {
        for (const s of [-1, 1]) {
          const bx2 = x + ux * 2.6 * s, bz2 = z + uz * 2.6 * s;
          if (!built(bx2, bz2)) out.benches.push([bx2, bz2, Math.atan2(ux, uz)]);
        }
      }
      // farolas en un lado, alternando acera, cada ~3 árboles
      if (k % 3 === 1) {
        const side = k % 2 ? 1 : -1;
        const w = reach(x, z, nx * side, nz * side);
        const lx = x + nx * side * Math.max(2.2, w - 1.2), lz = z + nz * side * Math.max(2.2, w - 1.2);
        if (!built(lx, lz)) out.lamps.push([lx, lz]);
      }
    }
    along += L;
  }
  return out;
}

export function nearRoadAxis(roads, x, z, extra, carsOnly) {
  for (const r of roads) {
    if (carsOnly && r.ped) continue;
    for (let i = 0; i < r.p.length - 1; i++) {
      const [ax, az] = r.p[i], [bx, bz] = r.p[i + 1];
      const d = r.w / 2 + extra;
      if (Math.min(ax, bx) - d > x || Math.max(ax, bx) + d < x || Math.min(az, bz) - d > z || Math.max(az, bz) + d < z) continue;
      const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2));
      if (Math.hypot(ax + dx * t - x, az + dz * t - z) < d) return true;
    }
  }
  return false;
}

/**
 * Paseo de la orilla del Charco (vídeo de referencia 2020, min. 10:00–19:45): sitios para
 * palmeras y farolas azules en fila, y tramos de pavimento ocre con franja gris junto al pretil.
 * Las posiciones exactas son aproximación artística: el vídeo no da medidas.
 */
export function charcoPromenade(map) {
  if (map._charcoProm) return map._charcoProm;
  const ring = charcoRing(map);
  const out = { palms: [], lamps: [], strips: [] };
  map._charcoProm = out;
  if (!ring) return out;
  const roads = map.roads || [];
  const sea = map.sea;
  const wet = (x, z) => inPoly(ring, x, z) || (!!sea && inPoly(sea.outer, x, z) && !sea.holes.some(h => inPoly(h, x, z)));
  const built = (x, z) => (map.buildings || []).some(b => Math.abs(b.p[0][0] - x) < 90 && Math.abs(b.p[0][1] - z) < 90 && inPoly(b.p, x, z));
  const urban = (x, z) => nearRoadAxis(roads, x, z, 24, false);
  let along = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [ax, az] = ring[i], [bx, bz] = ring[i + 1];
    const L = Math.hypot(bx - ax, bz - az);
    if (L < 0.5) continue;
    const ux = (bx - ax) / L, uz = (bz - az) / L;
    let nx = -uz, nz = ux;
    const mx = (ax + bx) / 2, mz = (az + bz) / 2;
    if (inPoly(ring, mx + nx * 2, mz + nz * 2)) { nx = -nx; nz = -nz; }
    // tramo de pavimento: de la cara interior del pretil a 3,1 m hacia tierra
    const sx = mx + nx * 1.8, sz = mz + nz * 1.8;
    if (L > 1.5 && !wet(sx, sz) && !built(sx, sz) && urban(sx, sz) && !nearRoadAxis(roads, sx, sz, 1.6, true)) {
      out.strips.push({ ax, az, bx, bz, nx, nz, L });
    }
    for (let d = (9 - (along % 9)) % 9; d < L; d += 9) {
      const px = ax + ux * d + nx * 3.6, pz = az + uz * d + nz * 3.6;
      const k = Math.round((along + d) / 9);
      if (wet(px, pz) || built(px, pz) || !urban(px, pz) || nearRoadAxis(roads, px, pz, 1.4, true)) continue;
      if (k % 3 === 1) {
        const lx = ax + ux * d + nx * 1.5, lz = az + uz * d + nz * 1.5;
        if (!wet(lx, lz) && !built(lx, lz)) out.lamps.push([lx, lz, Math.atan2(-nx, -nz)]);
      } else {
        out.palms.push([px, pz]);
      }
    }
    along += L;
  }
  return out;
}
