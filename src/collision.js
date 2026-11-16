const CELL = 24;

export class SegmentGrid {
  constructor() { this.cells = new Map(); }

  key(cx, cz) { return cx + ',' + cz; }

  addSegment(ax, az, bx, bz, data = null) {
    const seg = { ax, az, bx, bz, data };
    const minX = Math.floor(Math.min(ax, bx) / CELL);
    const maxX = Math.floor(Math.max(ax, bx) / CELL);
    const minZ = Math.floor(Math.min(az, bz) / CELL);
    const maxZ = Math.floor(Math.max(az, bz) / CELL);
    for (let cx = minX; cx <= maxX; cx++) {
      for (let cz = minZ; cz <= maxZ; cz++) {
        const k = this.key(cx, cz);
        let arr = this.cells.get(k);
        if (!arr) { arr = []; this.cells.set(k, arr); }
        arr.push(seg);
      }
    }
  }

  addPolygon(points, data = null) {
    for (let i = 0; i < points.length - 1; i++) {
      this.addSegment(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], data);
    }
  }

  forEachNear(x, z, r, fn) {
    // con un punto infinito (una cuenta que se ha ido de madre) el bucle de casillas no acabaría nunca y el
    // juego se quedaría colgado: se ignora
    if (!Number.isFinite(x) || !Number.isFinite(z) || !Number.isFinite(r)) {
      if (typeof window !== 'undefined' && !window.__puntoInfinito) window.__puntoInfinito = new Error('punto infinito').stack;
      return;
    }
    const minX = Math.floor((x - r) / CELL);
    const maxX = Math.floor((x + r) / CELL);
    const minZ = Math.floor((z - r) / CELL);
    const maxZ = Math.floor((z + r) / CELL);
    for (let cx = minX; cx <= maxX; cx++) {
      for (let cz = minZ; cz <= maxZ; cz++) {
        const arr = this.cells.get(this.key(cx, cz));
        if (arr) for (const s of arr) fn(s);
      }
    }
  }

  // Circle vs segments: returns contacts { nx, nz, depth }
  // (ignore: los segmentos con ese dato no cuentan, p. ej. la orilla para los jipis; o una función
  // que dice, con el dato, si no cuentan: las paredes de los edificios por debajo del coche, tejados.js)
  circleContacts(x, z, r, ignore) {
    const contacts = [];
    const seen = new Set();
    const skip = typeof ignore === 'function' ? ignore : (d) => ignore && d === ignore;
    this.forEachNear(x, z, r, (s) => {
      if (seen.has(s) || skip(s.data)) return;
      seen.add(s);
      const dx = s.bx - s.ax, dz = s.bz - s.az;
      const len2 = dx * dx + dz * dz;
      let t = len2 > 0 ? ((x - s.ax) * dx + (z - s.az) * dz) / len2 : 0;
      t = Math.max(0, Math.min(1, t));
      const px = s.ax + dx * t, pz = s.az + dz * t;
      let nx = x - px, nz = z - pz;
      const d = Math.hypot(nx, nz);
      if (d < r && d > 1e-6) {
        contacts.push({ nx: nx / d, nz: nz / d, depth: r - d });
      }
    });
    return contacts;
  }

  /** primer choque del tramo a→b con una pared (de 0 a 1); 1 si no hay nada en medio */
  rayHit(ax, az, bx, bz, skip) {
    const dx = bx - ax, dz = bz - az;
    let best = 1;
    const seen = new Set();
    this.forEachNear((ax + bx) / 2, (az + bz) / 2, Math.hypot(dx, dz) / 2 + 1, (s) => {
      if (seen.has(s) || (skip && skip.has(s.data))) return;
      seen.add(s);
      const ex = s.bx - s.ax, ez = s.bz - s.az;
      const den = dx * ez - dz * ex;
      if (Math.abs(den) < 1e-9) return;
      const t = ((s.ax - ax) * ez - (s.az - az) * ex) / den;
      const u = ((s.ax - ax) * dz - (s.az - az) * dx) / den;
      if (t >= 0 && t < best && u >= 0 && u <= 1) best = t;
    });
    return best;
  }

  nearestData(x, z, r) {
    let best = null, bestD = r;
    const seen = new Set();
    this.forEachNear(x, z, r, (s) => {
      if (seen.has(s) || !s.data) return;
      seen.add(s);
      const dx = s.bx - s.ax, dz = s.bz - s.az;
      const len2 = dx * dx + dz * dz;
      let t = len2 > 0 ? ((x - s.ax) * dx + (z - s.az) * dz) / len2 : 0;
      t = Math.max(0, Math.min(1, t));
      const d = Math.hypot(x - (s.ax + dx * t), z - (s.az + dz * t));
      if (d < bestD) { bestD = d; best = s.data; }
    });
    return best;
  }
}
