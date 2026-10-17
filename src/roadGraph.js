/**
 * Grafo de calles para buscar rutas (A*): cada punto de cada calle de OSM es
 * un nodo y los tramos consecutivos son aristas. Lo usan las patrullas para
 * perseguirte por las calles y las misiones para elegir destinos.
 */

const key = (x, z) => Math.round(x) + ',' + Math.round(z);
const CELL = 40;

class Heap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  push(n, f) {
    const a = this.a;
    a.push([f, n]);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p][0] <= a[i][0]) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.a;
    const top = a[0];
    const last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1, r = l + 1;
        let m = i;
        if (l < a.length && a[l][0] < a[m][0]) m = l;
        if (r < a.length && a[r][0] < a[m][0]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top[1];
  }
}

export class RoadGraph {
  constructor(roads) {
    this.x = [];
    this.z = [];
    this.adj = [];
    this.major = [];
    const ids = new Map();
    const node = (px, pz, major) => {
      const k = key(px, pz);
      let id = ids.get(k);
      if (id === undefined) {
        id = this.x.length;
        ids.set(k, id);
        this.x.push(px);
        this.z.push(pz);
        this.adj.push([]);
        this.major.push(false);
      }
      if (major) this.major[id] = true;
      return id;
    };
    for (const r of roads) {
      if (r.ped || r.p.length < 2) continue;
      let prev = node(r.p[0][0], r.p[0][1], r.major);
      for (let i = 1; i < r.p.length; i++) {
        const cur = node(r.p[i][0], r.p[i][1], r.major);
        if (cur !== prev) {
          const d = Math.hypot(this.x[cur] - this.x[prev], this.z[cur] - this.z[prev]);
          this.adj[prev].push([cur, d]);
          this.adj[cur].push([prev, d]);
        }
        prev = cur;
      }
    }
    // rejilla espacial para buscar el nodo más cercano rápido
    this.grid = new Map();
    for (let i = 0; i < this.x.length; i++) {
      const g = Math.floor(this.x[i] / CELL) + ',' + Math.floor(this.z[i] / CELL);
      if (!this.grid.has(g)) this.grid.set(g, []);
      this.grid.get(g).push(i);
    }
  }

  get size() { return this.x.length; }

  nearest(px, pz) {
    const cx = Math.floor(px / CELL), cz = Math.floor(pz / CELL);
    let best = -1, bd = Infinity;
    for (let r = 0; r < 6 && best < 0; r++) {
      for (let i = -r; i <= r; i++) {
        for (let j = -r; j <= r; j++) {
          if (Math.max(Math.abs(i), Math.abs(j)) !== r) continue;
          for (const n of this.grid.get((cx + i) + ',' + (cz + j)) || []) {
            const d = (this.x[n] - px) ** 2 + (this.z[n] - pz) ** 2;
            if (d < bd) { bd = d; best = n; }
          }
        }
      }
    }
    return best;
  }

  /** ruta de nodos entre dos puntos del mapa (o null) */
  path(ax, az, bx, bz, maxExpand = 6000) {
    const s = this.nearest(ax, az), t = this.nearest(bx, bz);
    if (s < 0 || t < 0) return null;
    if (s === t) return [t];
    const g = new Map([[s, 0]]);
    const from = new Map();
    const open = new Heap();
    const h = (n) => Math.hypot(this.x[n] - this.x[t], this.z[n] - this.z[t]);
    open.push(s, h(s));
    let expanded = 0;
    while (open.size && expanded++ < maxExpand) {
      const n = open.pop();
      if (n === t) {
        const out = [t];
        let c = t;
        while (from.has(c)) { c = from.get(c); out.push(c); }
        return out.reverse();
      }
      const gn = g.get(n);
      for (const [m, d] of this.adj[n]) {
        // las avenidas "cuestan" menos: la policía prefiere ir por ellas
        const ng = gn + d * (this.major[m] ? 0.8 : 1);
        if (ng < (g.get(m) ?? Infinity)) {
          g.set(m, ng);
          from.set(m, n);
          open.push(m, ng + h(m));
        }
      }
    }
    return null;
  }

  /** nodo aleatorio a una distancia entre dmin y dmax de (px, pz) */
  randomNodeAround(px, pz, dmin, dmax, preferMajor = false) {
    for (let k = 0; k < 200; k++) {
      const n = Math.floor(Math.random() * this.x.length);
      if (preferMajor && !this.major[n] && k < 120) continue;
      if (!this.adj[n].length) continue;
      const d = Math.hypot(this.x[n] - px, this.z[n] - pz);
      if (d >= dmin && d <= dmax) return n;
    }
    return Math.floor(Math.random() * this.x.length);
  }
}
