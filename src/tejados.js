import { SegmentGrid } from './collision.js';

/**
 * Los tejados, para conducir por encima (se sube con el turbo salto del roadster): cada edificio del mapa
 * con su altura. La azotea está a la altura del edificio sobre la calle (el pretil de 60 cm no frena:
 * se puede bajar por el borde y caer a la calle o a un tejado más bajo).
 *  - heightAt: altura de la azotea sobre la calle en un punto (0 si no hay edificio)
 *  - contacts: choques solo con las paredes de los edificios que sobresalen por encima del coche
 */
const CELL = 24;
const key = (cx, cz) => cx + ',' + cz;

function pointInPoly(poly, x, z) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

export class Roofs {
  constructor(buildings) {
    this.cells = new Map();
    this.walls = new SegmentGrid();
    for (const b of buildings) {
      if (!b.p || b.p.length < 4 || !(b.h > 1)) continue;
      const xs = b.p.map(q => q[0]), zs = b.p.map(q => q[1]);
      const r = { p: b.p, h: b.h, x0: Math.min(...xs), x1: Math.max(...xs), z0: Math.min(...zs), z1: Math.max(...zs) };
      for (let cx = Math.floor(r.x0 / CELL); cx <= Math.floor(r.x1 / CELL); cx++) {
        for (let cz = Math.floor(r.z0 / CELL); cz <= Math.floor(r.z1 / CELL); cz++) {
          const k = key(cx, cz);
          if (!this.cells.has(k)) this.cells.set(k, []);
          this.cells.get(k).push(r);
        }
      }
      this.walls.addPolygon(b.p, b.h);
    }
  }

  heightAt(x, z) {
    const arr = this.cells.get(key(Math.floor(x / CELL), Math.floor(z / CELL)));
    let h = 0;
    if (arr) {
      for (const r of arr) {
        if (r.h > h && x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1 && pointInPoly(r.p, x, z)) h = r.h;
      }
    }
    return h;
  }

  /** above: altura del coche sobre la calle; las paredes de los edificios más bajos que eso + un escalón no cuentan */
  contacts(x, z, r, above) {
    return this.walls.circleContacts(x, z, r, (h) => h <= above);
  }
}
