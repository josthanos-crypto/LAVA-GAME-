/**
 * Minimapa tipo GPS: gira con el coche (lo que tienes delante queda arriba),
 * fondo azul, nombres de calles pequeños y, durante una misión, la ruta que
 * tienes que seguir iluminada con el color de la misión.
 *
 * Se dibuja a la resolución real de la pantalla (nítido también en el móvil)
 * y por trozos de mapa, así cada fotograma solo se pinta lo que cae cerca.
 */

const TILE = 250; // m

const COL = {
  land: '#244a72',
  sea: '#0e2843',
  shore: '#3f79ad',
  sand: '#33597f',
  park: '#29655f',
  building: '#2f5b88',
  casing: '#15304c',
  ped: '#5d84ab',
  minor: '#88a7c7',
  major: '#c6d8ea',
  label: '#f3f8fd',
  labelStroke: '#0f2338',
};

// en un mapa tan pequeño, "C/ Real" se lee mejor que "Calle Real"
const ABBR = [
  [/^Calle /, 'C/ '], [/^Avenida /, 'Av. '], [/^Carretera /, 'Ctra. '], [/^Plaza /, 'Pza. '],
  [/^Camino /, 'Cno. '], [/^Pasaje /, 'Pje. '], [/^Paseo /, 'P.º '], [/^Callej[oó]n /, 'Cjón. '],
];
const shortName = (n) => ABBR.reduce((s, [re, to]) => s.replace(re, to), n);

const GLYPH = { acampada: '★', reparto: 'R', carrera: 'C', esquinazo: 'E' };

function hexColor(c) { return typeof c === 'number' ? '#' + c.toString(16).padStart(6, '0') : c; }

function segDist(px, pz, a, b) {
  const dx = b[0] - a[0], dz = b[1] - a[1];
  const l2 = dx * dx + dz * dz;
  const t = l2 ? Math.max(0, Math.min(1, ((px - a[0]) * dx + (pz - a[1]) * dz) / l2)) : 0;
  return Math.hypot(px - (a[0] + dx * t), pz - (a[1] + dz * t));
}

class Tiles {
  constructor() { this.m = new Map(); }
  at(x, z) {
    const k = Math.floor(x / TILE) + ',' + Math.floor(z / TILE);
    let t = this.m.get(k);
    if (!t) {
      t = { building: new Path2D(), park: new Path2D(), sand: new Path2D(), ped: new Path2D(), minor: new Path2D(), major: new Path2D(), labels: [] };
      this.m.set(k, t);
    }
    return t;
  }
  around(x, z, r, out) {
    out.length = 0;
    const x0 = Math.floor((x - r) / TILE), x1 = Math.floor((x + r) / TILE);
    const z0 = Math.floor((z - r) / TILE), z1 = Math.floor((z + r) / TILE);
    for (let i = x0; i <= x1; i++) {
      for (let j = z0; j <= z1; j++) {
        const t = this.m.get(i + ',' + j);
        if (t) out.push(t);
      }
    }
    return out;
  }
}

export class Minimap {
  constructor(canvas, map, graph) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.graph = graph;
    this.tiles = new Tiles();
    this.near = [];
    this.R = 160;        // metros desde el coche hasta el borde
    this.T = [1, 0, 0, 1, 0, 0];
    this.route = null;
    this.routeIdx = 0;
    this.routeTo = null;
    this.routeT = -99;
    this.shown = new Set();
    this.widths = new Map();
    // cuando llega la letra del juego, se vuelven a medir los nombres
    document.fonts?.ready?.then(() => this.widths.clear());

    const shape = (path, pts) => {
      path.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) path.lineTo(pts[i][0], pts[i][1]);
      path.closePath();
    };
    const centre = (pts) => pts.reduce((s, p) => [s[0] + p[0] / pts.length, s[1] + p[1] / pts.length], [0, 0]);

    // el mar es un polígono con islotes como huecos
    this.sea = new Path2D();
    if (map.sea) {
      shape(this.sea, map.sea.outer);
      for (const h of map.sea.holes || []) shape(this.sea, h);
      for (const w of map.inlandWater || []) shape(this.sea, w);
    }
    for (const b of map.buildings || []) { const [x, z] = centre(b.p); shape(this.tiles.at(x, z).building, b.p); }
    for (const a of map.areas || []) {
      const kind = a.k === 'plaza' ? 'sand' : 'park';
      const [x, z] = centre(a.p);
      shape(this.tiles.at(x, z)[kind], a.p);
    }
    for (const b of map.beaches || []) { const [x, z] = centre(b); shape(this.tiles.at(x, z).sand, b); }

    for (const r of map.roads || []) {
      if (r.p.length < 2) continue;
      this.addLine(r.p, r.ped ? 'ped' : (r.major ? 'major' : 'minor'));
      if (r.name) this.addLabels(r);
    }
  }

  /** calle troceada por zonas del mapa (tramos de 100 m como mucho) */
  addLine(points, cls) {
    let last = null;
    for (let i = 0; i < points.length - 1; i++) {
      const [ax, az] = points[i], [bx, bz] = points[i + 1];
      const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 100));
      for (let s = 0; s < n; s++) {
        const x0 = ax + (bx - ax) * s / n, z0 = az + (bz - az) * s / n;
        const x1 = ax + (bx - ax) * (s + 1) / n, z1 = az + (bz - az) * (s + 1) / n;
        const t = this.tiles.at((x0 + x1) / 2, (z0 + z1) / 2);
        if (t !== last) { t[cls].moveTo(x0, z0); last = t; }
        t[cls].lineTo(x1, z1);
      }
    }
  }

  /** sitios donde puede ir el nombre de una calle: uno cada 150 m */
  addLabels(r) {
    const p = r.p;
    const acc = [0];
    for (let i = 1; i < p.length; i++) acc.push(acc[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
    const L = acc[acc.length - 1];
    if (L < 35) return;
    const at = (s) => {
      let i = 1;
      while (i < p.length - 1 && acc[i] < s) i++;
      const t = (s - acc[i - 1]) / Math.max(1e-6, acc[i] - acc[i - 1]);
      return [p[i - 1][0] + (p[i][0] - p[i - 1][0]) * t, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * t];
    };
    const spots = L < 180 ? [L / 2] : [];
    for (let s = 75; s < L - 40; s += 150) spots.push(s);
    for (const s of spots) {
      const [x, z] = at(s);
      const a = at(Math.max(0, s - 14)), b = at(Math.min(L, s + 14));
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      this.tiles.at(x, z).labels.push({
        name: r.name, text: shortName(r.name), x, z,
        dx: (b[0] - a[0]) / len, dz: (b[1] - a[1]) / len, major: !!r.major,
      });
    }
  }

  toScreen(x, z) {
    const [a, b, c, d, e, f] = this.T;
    return [a * x + c * z + e, b * x + d * z + f];
  }

  /* ─── ruta GPS ─── */

  updateRoute(s) {
    const nav = s.nav;
    if (!nav || !this.graph) { this.route = null; this.routeTo = null; return; }
    const same = this.routeTo && Math.hypot(nav.x - this.routeTo[0], nav.z - this.routeTo[1]) < 4;
    if (same) {
      const off = this.route ? this.trim(s.x, s.z) : Infinity;
      // te has salido de la ruta: se recalcula (como mucho cada segundo y medio)
      if (off < 22 || s.t - this.routeT < 1.5) return;
    }
    this.routeT = s.t;
    this.routeTo = [nav.x, nav.z];
    const g = this.graph;
    const nodes = g.path(s.x, s.z, nav.x, nav.z, 40000);
    if (!nodes) { this.route = null; return; }
    this.route = nodes.map(n => [g.x[n], g.z[n]]);
    this.route.push([nav.x, nav.z]);
    this.routeIdx = 0;
    this.trim(s.x, s.z);
  }

  /** tramo de la ruta más cercano al coche; devuelve lo lejos que estás de ella */
  trim(px, pz) {
    const pts = this.route;
    let best = Infinity, bi = this.routeIdx;
    const end = Math.min(pts.length - 1, this.routeIdx + 40);
    for (let i = this.routeIdx; i < end; i++) {
      const d = segDist(px, pz, pts[i], pts[i + 1]);
      if (d < best) { best = d; bi = i; }
    }
    this.routeIdx = bi;
    return pts.length < 2 ? Math.hypot(px - pts[0][0], pz - pts[0][1]) : best;
  }

  routePath(px, pz) {
    const pts = this.route, i = this.routeIdx;
    const path = new Path2D();
    if (pts.length < 2) return null;
    // empieza justo donde estás, no en el cruce de atrás
    const a = pts[i], b = pts[i + 1];
    const dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz;
    const t = l2 ? Math.max(0, Math.min(1, ((px - a[0]) * dx + (pz - a[1]) * dz) / l2)) : 0;
    path.moveTo(a[0] + dx * t, a[1] + dz * t);
    for (let k = i + 1; k < pts.length; k++) path.lineTo(pts[k][0], pts[k][1]);
    return path;
  }

  /* ─── dibujo ─── */

  /**
   * s = { x, z, heading, speed, t, street, nav: {x, z, color}, checkpoints,
   *       givers: [{x, z, color, kind}], police: [{pos}], places: [{x, z, color, glyph}] }
   */
  draw(s) {
    const cv = this.canvas, ctx = this.ctx;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = Math.max(64, Math.round((cv.clientWidth || 200) * dpr));
    if (cv.width !== W) { cv.width = W; cv.height = W; }
    const r = W / 2;

    // cuanto más rápido vas, más lejos ves
    const wantR = 150 + Math.min(1, (s.speed || 0) / 32) * 130;
    this.R += (wantR - this.R) * Math.min(1, (s.dt || 0.016) * 2);
    const k = r / this.R;
    // el coche un poco por debajo del centro: se ve más lo que tienes delante
    const cx = r, cy = r * 1.22;
    const ch = Math.cos(s.heading), sh = Math.sin(s.heading);
    // mundo → pantalla: delante = arriba y la derecha de la cámara = derecha
    const a = -k * ch, b = -k * sh, c = k * sh, d = -k * ch;
    this.T = [a, b, c, d, cx - (a * s.x + c * s.z), cy - (b * s.x + d * s.z)];
    const lw = (m, px) => Math.max(m, px * dpr / k);

    this.updateRoute(s);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = COL.land;
    ctx.fillRect(0, 0, W, W);

    ctx.setTransform(...this.T);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = COL.sea;
    ctx.fill(this.sea, 'evenodd');
    ctx.strokeStyle = COL.shore;
    ctx.lineWidth = lw(3, 1.2);
    ctx.stroke(this.sea);

    const tiles = this.tiles.around(s.x, s.z, this.R * 1.25 + 120, this.near);
    const pass = (key, style, width, fill) => {
      ctx[fill ? 'fillStyle' : 'strokeStyle'] = style;
      if (!fill) ctx.lineWidth = width;
      for (const t of tiles) fill ? ctx.fill(t[key]) : ctx.stroke(t[key]);
    };
    pass('sand', COL.sand, 0, true);
    pass('park', COL.park, 0, true);
    pass('building', COL.building, 0, true);
    pass('minor', COL.casing, lw(10, 4.4));
    pass('major', COL.casing, lw(15, 6.4));
    pass('ped', COL.ped, lw(4, 1.6));
    pass('minor', COL.minor, lw(7, 2.8));
    pass('major', COL.major, lw(11, 4.4));

    // ruta iluminada
    const nav = s.nav;
    const navCol = nav ? hexColor(nav.color) : null;
    if (this.route) {
      const path = this.routePath(s.x, s.z);
      if (path) {
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = navCol;
        ctx.lineWidth = lw(20, 10);
        ctx.stroke(path);
        ctx.globalAlpha = 1;
        ctx.lineWidth = lw(9, 4.6);
        ctx.stroke(path);
        // rayitas que avanzan hacia el destino
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = lw(3, 1.5);
        const dash = lw(10, 5), gap = lw(16, 8);
        ctx.setLineDash([dash, gap]);
        ctx.lineDashOffset = -((s.t * 24) % (dash + gap));
        ctx.stroke(path);
        ctx.setLineDash([]);
      }
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.drawLabels(s, tiles, r, dpr);

    // puntos de control que quedan (carrera)
    for (const p of s.checkpoints || []) {
      const [x, y] = this.toScreen(p[0], p[1]);
      if (Math.hypot(x - r, y - r) > r - 6 * dpr) continue;
      ctx.beginPath();
      ctx.arc(x, y, 3.2 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = navCol || '#18c5b8';
      ctx.fill();
      ctx.lineWidth = 1.2 * dpr;
      ctx.strokeStyle = '#0f2338';
      ctx.stroke();
    }

    // policía (luces rojas y azules)
    const blink = Math.floor(s.t * 4) % 2;
    for (const p of s.police || []) {
      const [x, y] = this.toScreen(p.pos.x, p.pos.y);
      if (Math.hypot(x - r, y - r) > r - 5 * dpr) continue;
      ctx.beginPath();
      ctx.arc(x, y, 4 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = blink ? '#ff3b30' : '#2f7bff';
      ctx.fill();
    }

    // encargos disponibles (columnas de luz)
    // locales de los clientes: cuadradito de su color con su inicial (solo los que caen dentro)
    for (const p of s.places || []) this.placeBlip(p, r, dpr);
    for (const g of s.givers || []) this.blip(g.x, g.z, hexColor(g.color), GLYPH[g.kind] || '!', r, dpr, 6.5);

    // destino de la misión, con pulso
    if (nav) {
      const p = this.blip(nav.x, nav.z, navCol, '', r, dpr, 6);
      if (!p.edge) {
        const ph = (s.t * 1.2) % 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, (7 + ph * 9) * dpr, 0, Math.PI * 2);
        ctx.strokeStyle = navCol;
        ctx.globalAlpha = 1 - ph;
        ctx.lineWidth = 2 * dpr;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    this.drawPlayer(cx, cy, dpr);
    this.drawNorth(r, dpr);

    // borde del color de la misión mientras el GPS está activo
    ctx.beginPath();
    ctx.arc(r, r, r - 1.6 * dpr, 0, Math.PI * 2);
    ctx.lineWidth = 3.2 * dpr;
    ctx.strokeStyle = navCol || 'rgba(160,200,240,0.35)';
    ctx.stroke();
  }

  /** local de un cliente: cuadrado redondeado con su letra */
  placeBlip(p, r, dpr) {
    const ctx = this.ctx;
    const [x, y] = this.toScreen(p.x, p.z);
    const size = 5.5 * dpr;
    if (Math.hypot(x - r, y - r) > r - size - 3 * dpr) return;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x - size, y - size, size * 2, size * 2, 3 * dpr);
    else ctx.rect(x - size, y - size, size * 2, size * 2);
    ctx.fillStyle = hexColor(p.color);
    ctx.fill();
    ctx.lineWidth = 1.4 * dpr;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 ${Math.round(size * (p.glyph.length > 1 ? 1.1 : 1.5))}px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.glyph, x, y + 0.5 * dpr);
  }

  /** icono en el mapa; si cae fuera, se queda pegado al borde señalando hacia dónde está */
  blip(wx, wz, color, glyph, r, dpr, size) {
    const ctx = this.ctx;
    let [x, y] = this.toScreen(wx, wz);
    const dx = x - r, dy = y - r, dist = Math.hypot(dx, dy);
    const max = r - (size + 4) * dpr;
    const edge = dist > max;
    if (edge) {
      x = r + dx / dist * max;
      y = r + dy / dist * max;
      // flechita hacia fuera
      const ux = dx / dist, uy = dy / dist;
      const tx = x + ux * (size + 3.5) * dpr, ty = y + uy * (size + 3.5) * dpr;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(x + ux * size * dpr - uy * 3.5 * dpr, y + uy * size * dpr + ux * 3.5 * dpr);
      ctx.lineTo(x + ux * size * dpr + uy * 3.5 * dpr, y + uy * size * dpr - ux * 3.5 * dpr);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(x, y, size * dpr, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 1.6 * dpr;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    if (glyph) {
      ctx.fillStyle = '#10141a';
      ctx.font = `800 ${Math.round(size * 1.35 * dpr)}px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(glyph, x, y + 0.5 * dpr);
    }
    return { x, y, edge };
  }

  /** nombres de calles: pequeños, a lo largo de la calle y sin pisarse */
  drawLabels(s, tiles, r, dpr) {
    const ctx = this.ctx;
    const small = r < 80 * dpr;
    const fs = Math.round((small ? 9 : 11) * dpr);
    const max = small ? 3 : 6;
    ctx.font = `600 ${fs}px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`;
    const [a, b, c, d] = this.T;
    const cand = [];
    for (const t of tiles) {
      for (const L of t.labels) {
        const [x, y] = this.toScreen(L.x, L.z);
        const fromC = Math.hypot(x - r, y - r);
        if (fromC > r - 8 * dpr) continue;
        let score = Math.hypot(x - r, y - r * 1.22) / r;
        if (L.major) score -= 0.35;
        if (L.name === s.street) score -= 2;
        if (this.shown.has(L)) score -= 0.5; // que no bailen de un fotograma a otro
        cand.push({ L, x, y, score });
      }
    }
    cand.sort((p, q) => p.score - q.score);
    const boxes = [[r - 10 * dpr, r * 1.22 - 12 * dpr, r + 10 * dpr, r * 1.22 + 12 * dpr]]; // la flecha del coche
    const names = new Set();
    const shown = new Set();
    for (const { L, x, y } of cand) {
      if (shown.size >= max) break;
      if (names.has(L.name)) continue;
      let w = this.widths.get(fs + L.text);
      if (w === undefined) { w = ctx.measureText(L.text).width; this.widths.set(fs + L.text, w); }
      // dirección de la calle en pantalla, sin que el texto quede boca abajo
      let ux = a * L.dx + c * L.dz, uy = b * L.dx + d * L.dz;
      const ul = Math.hypot(ux, uy) || 1;
      ux /= ul; uy /= ul;
      if (ux < 0) { ux = -ux; uy = -uy; }
      const hw = w / 2 + 2 * dpr, hh = fs * 0.62;
      const ex = Math.abs(ux) * hw + Math.abs(uy) * hh, ey = Math.abs(uy) * hw + Math.abs(ux) * hh;
      const box = [x - ex, y - ey, x + ex, y + ey];
      // entero dentro del círculo y sin pisar otro nombre
      if (Math.hypot(x - r, y - r) + Math.max(ex, ey) > r - 4 * dpr) continue;
      if (boxes.some(o => box[0] < o[2] && box[2] > o[0] && box[1] < o[3] && box[3] > o[1])) continue;
      boxes.push(box);
      names.add(L.name);
      shown.add(L);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.atan2(uy, ux));
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 3 * dpr;
      ctx.strokeStyle = COL.labelStroke;
      ctx.strokeText(L.text, 0, 0);
      ctx.fillStyle = COL.label;
      ctx.fillText(L.text, 0, 0);
      ctx.restore();
    }
    this.shown = shown;
  }

  drawPlayer(x, y, dpr) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dpr, dpr);
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(6.5, 7);
    ctx.lineTo(0, 3.5);
    ctx.lineTo(-6.5, 7);
    ctx.closePath();
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0f2338';
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();
  }

  drawNorth(r, dpr) {
    const ctx = this.ctx;
    // el norte del mapa es -Z
    const [, , c, d] = this.T;
    let nx = -c, ny = -d;
    const l = Math.hypot(nx, ny) || 1;
    nx /= l; ny /= l;
    const x = r + nx * (r - 10 * dpr), y = r + ny * (r - 10 * dpr);
    ctx.beginPath();
    ctx.arc(x, y, 7 * dpr, 0, Math.PI * 2);
    ctx.fillStyle = '#0f2338';
    ctx.fill();
    ctx.fillStyle = '#f4c542';
    ctx.font = `800 ${Math.round(10 * dpr)}px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', x, y + 0.5 * dpr);
  }
}
