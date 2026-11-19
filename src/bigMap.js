import { COL, shortName } from './minimap.js';
import { norm, carSpot, nameScore } from './startPlaces.js';
import { terrainGrid, realHeight } from './terrain.js';

/**
 * Mapa grande (tecla G, tocar el minimapa o «Mapa» en el móvil): Arrecife entero con
 * el norte arriba. Pinchas un punto o buscas una calle o un negocio y el coche aparece
 * allí, en la calzada y mirando a lo largo de la calle. Aprovecha los trozos de mapa
 * del minimapa y solo se vuelve a pintar cuando cambia algo.
 */

const TAP_MOVE = 7;      // px: si el dedo se mueve más, es arrastrar y no pinchar
const TAP_MS = 550;
const K_MAX = 3.2;       // px por metro con el zoom al máximo
const FAR_FROM_ROAD = 90; // m
const LABEL_FROM_K = 0.42;
const BASE_PX = 2560;    // ancho de la imagen de Arrecife entero

const hex = (c) => typeof c === 'number' ? '#' + c.toString(16).padStart(6, '0') : c;
// relieve: color y opacidad según la altura real (m); por debajo de 3 m (la costa y el centro) casi no tiñe
const RELIEF_STOPS = [[0, 0x244a72, 0], [3, 0x3fae7a, 0.38], [10, 0xa8c64a, 0.46], [20, 0xe8c547, 0.52],
  [30, 0xf08c2e, 0.56], [45, 0xd9452b, 0.6], [60, 0x8e2a4a, 0.64]];
const STEEP = [0.04, 0.08];   // cuesta (tanto por uno) desde la que una calle sale amarilla y roja
const FONT = '"Barlow Condensed", "Arial Narrow", Arial, sans-serif';

function niceMeters(m) {
  const p = Math.pow(10, Math.floor(Math.log10(m)));
  const n = m / p;
  return (n >= 5 ? 5 : n >= 2 ? 2 : 1) * p;
}

const fmtDist = (m) => m < 950 ? `a ${Math.round(m / 10) * 10} m` : `a ${(m / 1000).toLocaleString('es', { maximumFractionDigits: 1 })} km`;

export class BigMap {
  /**
   * opts: { minimap, map, places (startPlaces), canGo () => motivo o '', onGo (sitio), onClose }
   */
  constructor(root, { minimap, map, places, canGo, onGo, onClose }) {
    this.root = root;
    this.mm = minimap;
    this.map = map;
    this.sites = places.filter(p => p.at && !p.client);
    this.clients = places.filter(p => p.client);
    this.places = places.filter(p => p.at);
    this.canGo = canGo;
    this.onGo = onGo;
    this.onClose = onClose;
    // con tilde primero: si la misma calle viene de las dos formas, se enseña la buena
    this.roadNames = [...new Set(map.roads.map(r => r.name).filter(Boolean))]
      .sort((a, b) => (b.normalize('NFD').length - b.length) - (a.normalize('NFD').length - a.length));
    this.bounds = map.meta.bounds;
    this.isOpen = false;
    this.cx = 0; this.cz = 0; this.k = 0.5;
    this.me = null;
    this.nav = null;
    this.pick = null;
    this.ptrs = new Map();
    this.tap = null;
    this.near = [];
    this.hits = [];
    this.found = [];
    this.act = -1;
    this.dirty = false;
    this.relief = false;
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const $ = (s) => root.querySelector(s);
    this.cv = $('canvas');
    this.ctx = this.cv.getContext('2d');
    this.q = $('.bm-q');
    this.list = $('.bm-results');
    this.card = $('.bm-card');
    this.goBtn = $('.bm-go');
    this.hint = $('.bm-hint');
    this.scale = $('.bm-scale');
    this.reliefBtn = $('[data-z="relief"]');
    this.bindPointer();
    this.bindUI();
  }

  /* ─── abrir y cerrar ─── */

  open(me, nav) {
    this.isOpen = true;
    this.openStamp = performance.now();
    this.me = me;
    this.nav = nav || null;
    this.root.classList.add('on');
    this.root.setAttribute('aria-hidden', 'false');
    this.measure();
    this.cx = me.x; this.cz = me.z;
    this.k = this.clampK(this.Wc / 1500);
    this.clampCenter();
    this.q.value = '';
    this.showList([]);
    this.setPick(null);
    const why = this.canGo();
    this.say(why ? why + '. Puedes mirar el mapa.' : 'Pincha en el mapa o busca una calle o un negocio', !!why);
    // un instante después, para que la G que abre el mapa no se escriba en el buscador
    if (!document.body.classList.contains('touch')) setTimeout(() => { if (this.isOpen) this.q.focus({ preventScroll: true }); }, 0);
    this.draw();
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    cancelAnimationFrame(this.anim);
    this.root.classList.remove('on');
    this.root.setAttribute('aria-hidden', 'true');
    this.q.blur();
    this.ptrs.clear();
    this.onClose?.();
  }

  go() {
    const p = this.pick;
    if (!p || this.canGo()) return;
    this.close();
    this.onGo(p);
  }

  /* ─── vista ─── */

  measure() {
    this.Wc = this.cv.clientWidth || innerWidth;
    this.Hc = this.cv.clientHeight || innerHeight;
    const b = this.bounds;
    this.kFit = Math.min(this.Wc / (b.maxX - b.minX), this.Hc / (b.maxZ - b.minZ));
  }

  clampK(k) { return Math.max(this.kFit, Math.min(K_MAX, k)); }

  clampCenter() {
    const b = this.bounds;
    this.cx = Math.max(b.minX, Math.min(b.maxX, this.cx));
    this.cz = Math.max(b.minZ, Math.min(b.maxZ, this.cz));
  }

  toWorld(px, py) { return [this.cx + (px - this.Wc / 2) / this.k, this.cz + (py - this.Hc / 2) / this.k]; }
  toScreen(x, z) { return [(x - this.cx) * this.k + this.Wc / 2, (z - this.cz) * this.k + this.Hc / 2]; }

  pan(dx, dy) {
    this.cx -= dx / this.k;
    this.cz -= dy / this.k;
    this.clampCenter();
    this.redraw();
  }

  zoomAt(px, py, f) {
    const [wx, wz] = this.toWorld(px, py);
    this.k = this.clampK(this.k * f);
    this.cx = wx - (px - this.Wc / 2) / this.k;
    this.cz = wz - (py - this.Hc / 2) / this.k;
    this.clampCenter();
    this.redraw();
  }

  flyTo(x, z, k) {
    cancelAnimationFrame(this.anim);
    const to = { x, z, k: this.clampK(k) };
    if (this.reduced) { Object.assign(this, { cx: to.x, cz: to.z, k: to.k }); this.clampCenter(); this.draw(); return; }
    const from = { x: this.cx, z: this.cz, k: this.k }, t0 = performance.now();
    const step = () => {
      const u = Math.min(1, (performance.now() - t0) / 420), e = 1 - Math.pow(1 - u, 3);
      this.cx = from.x + (to.x - from.x) * e;
      this.cz = from.z + (to.z - from.z) * e;
      this.k = from.k * Math.pow(to.k / from.k, e);
      this.clampCenter();
      this.draw();
      if (u < 1 && this.isOpen) this.anim = requestAnimationFrame(step);
    };
    this.anim = requestAnimationFrame(step);
  }

  redraw() {
    if (this.dirty) return;
    this.dirty = true;
    requestAnimationFrame(() => this.draw());
  }

  /* ─── elegir sitio ─── */

  /** la calzada más cercana; null si ahí no hay calle */
  spotFor(at, look, on) {
    const s = carSpot(this.map, at, look, on);
    return s && s.d < FAR_FROM_ROAD ? s : null;
  }

  pickPlace(p) {
    const s = this.spotFor(p.at, p.look, p.on);
    if (!s) return null;
    return { ...s, label: p.label, kind: p.client ? 'Negocio' : 'Sitio', sub: s.name ? 'En ' + s.name : '' };
  }

  pickStreet(name) {
    const key = norm(name);
    const roads = this.map.roads.filter(r => r.name && r.p.length > 1 && norm(r.name) === key);
    const len = (r) => r.p.reduce((s, q, i) => i ? s + Math.hypot(q[0] - r.p[i - 1][0], q[1] - r.p[i - 1][1]) : 0, 0);
    const r = roads.sort((a, b) => (a.ped ? 1 : 0) - (b.ped ? 1 : 0) || len(b) - len(a))[0];
    if (!r) return null;
    // a mitad de la calle (por longitud, no en un cruce) y en esa misma calle
    let half = len(r) / 2, at = r.p[0];
    for (let i = 1; i < r.p.length; i++) {
      const [ax, az] = r.p[i - 1], [bx, bz] = r.p[i], L = Math.hypot(bx - ax, bz - az);
      if (half <= L) { at = [ax + (bx - ax) * half / L, az + (bz - az) * half / L]; break; }
      half -= L;
    }
    const look = r.p[r.p.length - 1];
    const s = r.ped ? this.spotFor(at, look) : this.spotFor(at, look, (x) => x === r);
    if (!s) return null;
    return { ...s, label: name, kind: 'Calle', sub: r.ped && s.name ? 'Es peatonal: el coche sale en ' + s.name : '' };
  }

  tapAt(px, py) {
    const hit = this.hits.find(h => Math.hypot(h.x - px, h.y - py) < h.r);
    if (hit) { this.setPick(this.pickPlace(hit.p)); return; }
    const [x, z] = this.toWorld(px, py);
    const s = this.spotFor([x, z]);
    if (!s) { this.setPick(null); this.say('Ahí no hay calle: pincha más cerca de una', true); return; }
    this.setPick({ ...s, label: s.name || 'Calle sin nombre', kind: 'Calle', sub: '' });
  }

  setPick(p) {
    this.pick = p;
    this.card.classList.toggle('on', !!p);
    this.hint.classList.toggle('on', !p);
    if (p) {
      const why = this.canGo();
      this.card.querySelector('.bm-kind').textContent = p.kind;
      this.card.querySelector('.bm-name').textContent = p.label;
      const d = this.me ? fmtDist(Math.hypot(p.x - this.me.x, p.z - this.me.z)) : '';
      const alt = terrainGrid() ? `${Math.round(realHeight(p.x, p.z))} m sobre el mar` : '';
      this.card.querySelector('.bm-sub').textContent = [p.sub, d, alt].filter(Boolean).join(' · ');
      this.card.querySelector('.bm-why').textContent = why;
      this.card.classList.toggle('blocked', !!why);
      this.goBtn.disabled = !!why;
    }
    this.redraw();
  }

  say(text, warn = false) {
    this.hint.textContent = text;
    this.hint.classList.toggle('warn', warn);
    if (!this.pick) this.hint.classList.add('on');
  }

  /* ─── buscador ─── */

  suggest(text) {
    const q = norm(text);
    if (!q) return [];
    // también con faltas («macarroni», «tanatoryo»), pero esas salen detrás
    const score = (s) => nameScore(q, s);
    const out = [];
    for (const p of this.places) {
      const s = Math.min(score(p.label), ...p.keys.map(score));
      if (s < 9) out.push({ s: s - (p.client ? 0.6 : 0.3), label: p.label, kind: p.client ? 'Negocio' : 'Sitio', place: p });
    }
    // la misma calle a veces viene escrita con y sin tilde: sale una sola vez
    for (const n of this.roadNames) {
      const s = score(n);
      if (s < 9 && !out.some(o => norm(o.label) === norm(n))) out.push({ s, label: n, kind: 'Calle' });
    }
    return out.sort((a, b) => a.s - b.s || a.label.localeCompare(b.label, 'es')).slice(0, 7);
  }

  showList(items) {
    this.found = items;
    this.act = items.length ? 0 : -1;
    this.list.replaceChildren(...items.map((it, i) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.i = i;
      b.setAttribute('role', 'option');
      const name = document.createElement('b');
      name.textContent = it.label;
      const tag = document.createElement('small');
      tag.textContent = it.kind;
      tag.className = it.kind === 'Negocio' ? 'biz' : '';
      b.append(name, tag);
      li.append(b);
      return li;
    }));
    this.list.classList.toggle('on', items.length > 0);
    this.markActive();
  }

  markActive() {
    this.list.querySelectorAll('button').forEach((b, i) => b.classList.toggle('act', i === this.act));
  }

  choose(it) {
    if (!it) return;
    const p = it.place ? this.pickPlace(it.place) : this.pickStreet(it.label);
    this.showList([]);
    this.q.value = it.label;
    this.q.blur();
    if (!p) { this.setPick(null); this.say('No encuentro una calzada para el coche ahí', true); return; }
    this.setPick(p);
    this.flyTo(p.x, p.z, Math.max(this.k, 1.2));
  }

  bindUI() {
    const r = this.root;
    r.querySelector('.bm-close').addEventListener('click', () => this.close());
    this.goBtn.addEventListener('click', () => this.go());
    r.querySelector('.bm-zoom').addEventListener('click', (e) => {
      const z = e.target.closest('button')?.dataset.z;
      if (z === 'in') this.zoomAt(this.Wc / 2, this.Hc / 2, 1.7);
      else if (z === 'out') this.zoomAt(this.Wc / 2, this.Hc / 2, 1 / 1.7);
      else if (z === 'me' && this.me) this.flyTo(this.me.x, this.me.z, Math.max(this.k, 1));
      else if (z === 'relief') this.toggleRelief();
    });
    this.q.addEventListener('input', () => this.showList(this.suggest(this.q.value)));
    this.q.addEventListener('focus', () => { if (this.q.value) this.showList(this.suggest(this.q.value)); });
    this.q.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!this.found.length) return;
        this.act = (this.act + (e.key === 'ArrowDown' ? 1 : -1) + this.found.length) % this.found.length;
        this.markActive();
      } else if (e.key === 'Enter') {
        const it = this.found[this.act] || this.suggest(this.q.value)[0];
        if (it) this.choose(it);
        else this.say(`No encuentro «${this.q.value.trim()}»: prueba con otra calle o un negocio`, true);
      } else if (e.key === 'Escape') {
        if (this.found.length) this.showList([]);
        else this.close();
      }
    });
    this.list.addEventListener('pointerdown', (e) => e.preventDefault()); // que no se pierda el foco antes del clic
    this.list.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (b) this.choose(this.found[+b.dataset.i]);
    });
    // va antes que las teclas del juego (captura) y se queda la tecla: si no, la misma G
    // que cierra el mapa lo volvería a abrir
    addEventListener('keydown', (e) => {
      // la pulsación que acaba de abrir el mapa no lo cierra
      if (!this.isOpen || e.target === this.q || e.timeStamp <= this.openStamp) return;
      const k = e.key.toLowerCase();
      e.stopImmediatePropagation();
      if (k === 'escape' || k === 'g') { e.preventDefault(); this.close(); }
      else if (k === 'enter' && this.pick) this.go();
      else if (k === 'r') this.toggleRelief();
      else if (k === '+' || k === '=') this.zoomAt(this.Wc / 2, this.Hc / 2, 1.5);
      else if (k === '-') this.zoomAt(this.Wc / 2, this.Hc / 2, 1 / 1.5);
    }, true);
    addEventListener('resize', () => { if (this.isOpen) { this.measure(); this.k = this.clampK(this.k); this.redraw(); } });
  }

  bindPointer() {
    const cv = this.cv;
    const local = (e) => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    cv.addEventListener('pointerdown', (e) => {
      cv.setPointerCapture?.(e.pointerId);
      const [x, y] = local(e);
      this.ptrs.set(e.pointerId, { x, y });
      this.tap = this.ptrs.size === 1 ? { x, y, t: performance.now(), moved: false } : null;
      if (this.found.length) this.showList([]);
      this.q.blur();
      cancelAnimationFrame(this.anim);
    });
    cv.addEventListener('pointermove', (e) => {
      const p = this.ptrs.get(e.pointerId);
      if (!p) return;
      const [x, y] = local(e);
      if (this.ptrs.size === 1) {
        if (this.tap && Math.hypot(x - this.tap.x, y - this.tap.y) > TAP_MOVE) this.tap.moved = true;
        if (!this.tap || this.tap.moved) this.pan(x - p.x, y - p.y);
        else return;
      } else if (this.ptrs.size === 2) {
        const [a, b] = [...this.ptrs.values()];
        const m0 = [(a.x + b.x) / 2, (a.y + b.y) / 2], d0 = Math.hypot(a.x - b.x, a.y - b.y);
        p.x = x; p.y = y;
        const m1 = [(a.x + b.x) / 2, (a.y + b.y) / 2], d1 = Math.hypot(a.x - b.x, a.y - b.y);
        this.pan(m1[0] - m0[0], m1[1] - m0[1]);
        if (d0 > 10) this.zoomAt(m1[0], m1[1], d1 / d0);
      }
      p.x = x; p.y = y;
    });
    const up = (e) => {
      if (!this.ptrs.delete(e.pointerId)) return;
      const t = this.tap;
      this.tap = null;
      if (t && !t.moved && e.type === 'pointerup' && performance.now() - t.t < TAP_MS) this.tapAt(...local(e));
    };
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.zoomAt(...local(e), Math.exp(-e.deltaY * (e.deltaMode ? 0.05 : 0.0016)));
    }, { passive: false });
    cv.addEventListener('dblclick', (e) => e.preventDefault());
  }

  /* ─── dibujo ─── */

  /** mar, manzanas y calles (sin nombres); k en px de la pantalla por metro */
  paintBase(ctx, k, cx, cz, W, H, dpr, tiles) {
    const lw = (m, px) => Math.max(m, px * dpr / k);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = COL.land;
    ctx.fillRect(0, 0, W, H);
    ctx.setTransform(k, 0, 0, k, W / 2 - cx * k, H / 2 - cz * k);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = COL.sea;
    ctx.fill(this.mm.sea, 'evenodd');
    ctx.strokeStyle = COL.shore;
    ctx.lineWidth = lw(2, 1.3);
    ctx.stroke(this.mm.sea);
    const pass = (key, style, width, fill) => {
      ctx[fill ? 'fillStyle' : 'strokeStyle'] = style;
      if (!fill) ctx.lineWidth = width;
      for (const t of tiles) fill ? ctx.fill(t[key]) : ctx.stroke(t[key]);
    };
    pass('sand', COL.sand, 0, true);
    pass('park', COL.park, 0, true);
    pass('building', COL.building, 0, true);
    pass('minor', COL.casing, lw(9, 3.4));
    pass('major', COL.casing, lw(14, 5));
    pass('ped', COL.ped, lw(3, 1.1));
    pass('minor', COL.minor, lw(6, 2.1));
    pass('major', COL.major, lw(10, 3.3));
  }

  /** Arrecife entero pintado una vez: con el zoom lejos se usa esta imagen (va fluido en el móvil) */
  farImage(dpr) {
    if (this.far) return this.far;
    const b = this.bounds, w = b.maxX - b.minX, h = b.maxZ - b.minZ;
    const k = BASE_PX / Math.max(w, h);
    const c = document.createElement('canvas');
    c.width = Math.ceil(w * k);
    c.height = Math.ceil(h * k);
    const all = this.mm.tiles.around((b.minX + b.maxX) / 2, (b.minZ + b.maxZ) / 2, Math.max(w, h), []);
    this.paintBase(c.getContext('2d'), k, (b.minX + b.maxX) / 2, (b.minZ + b.maxZ) / 2, c.width, c.height, dpr, all);
    // pintar un lienzo dentro de otro es lento; como imagen de la tarjeta gráfica va mucho más rápido
    this.far = { img: null, k };
    createImageBitmap(c).then((img) => { this.far.img = img; if (this.isOpen) this.redraw(); }).catch(() => {});
    return this.far;
  }

  /* ─── relieve: alturas y cuestas ─── */

  toggleRelief() {
    this.relief = !this.relief && !!terrainGrid();
    this.reliefBtn.setAttribute('aria-pressed', String(this.relief));
    this.root.classList.toggle('relief', this.relief);
    if (this.relief) this.say('Cuanto más cálido el color, más alto. Las calles amarillas y rojas tienen cuesta');
    this.redraw();
  }

  /**
   * el relieve de Arrecife pintado una vez con las alturas reales del IGN: color según la altura, sombra
   * de colina (luz del noroeste, con las cuestas resaltadas para que se vean) y curvas de nivel cada 5 m
   */
  reliefImage() {
    if (this.reliefImg !== undefined) return this.reliefImg;
    this.reliefImg = null;
    const t = terrainGrid();
    if (!t) return null;
    const S = document.body.classList.contains('touch') ? 2 : 3;   // píxeles por celda de 10 m
    const W = t.nx * S, H = t.nz * S, g = t.grid;
    const hs = new Float32Array(W * H);
    for (let j = 0; j < H; j++) {
      const fz = Math.min(t.nz - 1, Math.max(0, (j + 0.5) / S - 0.5)), j0 = Math.min(t.nz - 2, Math.floor(fz)), v = fz - j0;
      for (let i = 0; i < W; i++) {
        const fx = Math.min(t.nx - 1, Math.max(0, (i + 0.5) / S - 0.5)), i0 = Math.min(t.nx - 2, Math.floor(fx)), u = fx - i0;
        const a = j0 * t.nx + i0, b = a + t.nx;
        hs[j * W + i] = Math.max(0, (g[a] * (1 - u) + g[a + 1] * u) * (1 - v) + (g[b] * (1 - u) + g[b + 1] * u) * v - t.off);
      }
    }
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const cx = c.getContext('2d'), img = cx.createImageData(W, H), px = img.data;
    const cellM = t.cell / S, L = [-0.55, 0.63, -0.55];   // luz del noroeste (el norte es z negativa)
    for (let j = 1; j < H - 1; j++) {
      for (let i = 1; i < W - 1; i++) {
        const k = j * W + i, h = hs[k];
        if (h <= 0) continue;
        let s = 1;
        while (s < RELIEF_STOPS.length - 1 && RELIEF_STOPS[s][0] < h) s++;
        const [h0, c0, a0] = RELIEF_STOPS[s - 1], [h1, c1, a1] = RELIEF_STOPS[s];
        const f = Math.min(1, Math.max(0, (h - h0) / (h1 - h0)));
        const ch = (sh) => ((c0 >> sh) & 255) * (1 - f) + ((c1 >> sh) & 255) * f;
        // sombra: normal con la pendiente x4, para que hasta las cuestas suaves se noten
        const dx = (hs[k + 1] - hs[k - 1]) / (2 * cellM) * 4, dz = (hs[k + W] - hs[k - W]) / (2 * cellM) * 4;
        const lit = (-dx * L[0] + L[1] - dz * L[2]) / Math.hypot(dx, 1, dz) / L[1];
        const shade = Math.min(1.3, Math.max(0.65, lit));   // sin manchas negras en los taludes
        const o = k * 4;
        px[o] = Math.min(255, ch(16) * shade);
        px[o + 1] = Math.min(255, ch(8) * shade);
        px[o + 2] = Math.min(255, ch(0) * shade);
        px[o + 3] = 255 * Math.min(0.85, a0 * (1 - f) + a1 * f + Math.abs(1 - shade) * 0.3);
        // curva de nivel donde cambia el tramo de 5 m (más marcada cada 25 m)
        const band = Math.floor(h / 5);
        if (band !== Math.floor(hs[k + 1] / 5) || band !== Math.floor(hs[k + W] / 5)) {
          const strong = Math.floor(Math.max(h, hs[k + 1], hs[k + W]) / 5) % 5 === 0;
          px[o] = px[o + 1] = px[o + 2] = 255;
          px[o + 3] = strong ? 220 : 120;
        }
      }
    }
    cx.putImageData(img, 0, 0);
    createImageBitmap(c).then((bmp) => {
      this.reliefImg = { img: bmp, x: t.x0, z: t.z0, w: t.nx * t.cell, h: t.nz * t.cell };
      if (this.isOpen) this.redraw();
    }).catch(() => {});
    return null;
  }

  /** las calles con cuesta (real), a trozos de ~10 m: amarillas desde el 4 % y rojas desde el 8 % */
  steepPaths() {
    if (this.steep) return this.steep;
    const paths = [new Path2D(), new Path2D()];
    for (const r of this.map.roads) {
      if (r.ped) continue;
      for (let k = 0; k + 1 < r.p.length; k++) {
        const [ax, az] = r.p[k], [bx, bz] = r.p[k + 1], len = Math.hypot(bx - ax, bz - az);
        const n = Math.max(1, Math.round(len / 10));
        for (let s = 0; s < n; s++) {
          const x0 = ax + (bx - ax) * s / n, z0 = az + (bz - az) * s / n;
          const x1 = ax + (bx - ax) * (s + 1) / n, z1 = az + (bz - az) * (s + 1) / n;
          const grade = Math.abs(realHeight(x1, z1) - realHeight(x0, z0)) / (len / n);
          const p = grade >= STEEP[1] ? paths[1] : grade >= STEEP[0] ? paths[0] : null;
          if (p) { p.moveTo(x0, z0); p.lineTo(x1, z1); }
        }
      }
    }
    return (this.steep = paths);
  }

  drawRelief(ctx, k, W, H, dpr) {
    ctx.setTransform(k, 0, 0, k, W / 2 - this.cx * k, H / 2 - this.cz * k);
    const r = this.reliefImage();
    if (r) {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(r.img, r.x, r.z, r.w, r.h);
    }
    const [soft, hard] = this.steepPaths();
    const lw = (m, px) => Math.max(m, px * dpr / k);
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(16,7,3,.8)';
    ctx.lineWidth = lw(9, 5.5);
    ctx.stroke(soft);
    ctx.stroke(hard);
    ctx.lineWidth = lw(6, 3.2);
    ctx.strokeStyle = '#ffe14d';
    ctx.stroke(soft);
    ctx.strokeStyle = '#ff2d55';
    ctx.stroke(hard);
  }

  draw() {
    this.dirty = false;
    if (!this.isOpen) return;
    const cv = this.cv, ctx = this.ctx;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = Math.round(this.Wc * dpr), H = Math.round(this.Hc * dpr);
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    const k = this.k * dpr;

    const reach = Math.max(this.Wc, this.Hc) / 2 / this.k + 120;
    const tiles = this.mm.tiles.around(this.cx, this.cz, reach, this.near);
    const far = this.farImage(dpr);
    if (far.img && k <= far.k * 1.4) {
      const b = this.bounds, s = k / far.k;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = COL.land;
      ctx.fillRect(0, 0, W, H);
      ctx.imageSmoothingQuality = 'high';
      ctx.setTransform(s, 0, 0, s, (b.minX - this.cx) * k + W / 2, (b.minZ - this.cz) * k + H / 2);
      ctx.drawImage(far.img, 0, 0);
    } else {
      this.paintBase(ctx, k, this.cx, this.cz, W, H, dpr, tiles);
    }
    if (this.relief) this.drawRelief(ctx, k, W, H, dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // ningún nombre debajo del buscador, los botones, la leyenda o la ficha del sitio
    const base = this.cv.getBoundingClientRect();
    const boxes = [...this.root.querySelectorAll('.bm-top > *, .bm-zoom, .bm-foot, .bm-card.on, .bm-hint.on')].map((el) => {
      const b = el.getBoundingClientRect();
      return [b.left - base.left - 4, b.top - base.top - 4, b.right - base.left + 4, b.bottom - base.top + 4];
    });
    this.hits = [];
    this.drawMe(boxes);
    if (this.pick) this.drawPick(boxes);
    if (this.nav) this.drawNav();
    this.drawClients(boxes);
    this.drawSites(boxes);
    if (this.k > LABEL_FROM_K) this.drawStreets(tiles, boxes);
    this.drawScale();
  }

  overlaps(box, boxes) {
    return boxes.some(o => box[0] < o[2] && box[2] > o[0] && box[1] < o[3] && box[3] > o[1]);
  }

  textOut(text, x, y, size, weight, fill, align = 'center') {
    const ctx = this.ctx;
    ctx.font = `${weight} ${size}px ${FONT}`;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3.2;
    ctx.strokeStyle = COL.labelStroke;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = fill;
    ctx.fillText(text, x, y);
  }

  inView(x, y, m = 20) { return x > -m && y > -m && x < this.Wc + m && y < this.Hc + m; }

  /** tú: flecha naranja con halo */
  drawMe(boxes) {
    const ctx = this.ctx, me = this.me;
    if (!me) return;
    const [x, y] = this.toScreen(me.x, me.z);
    if (!this.inView(x, y)) return;
    const g = ctx.createRadialGradient(x, y, 2, x, y, 26);
    g.addColorStop(0, 'rgba(255,120,30,.55)');
    g.addColorStop(1, 'rgba(255,120,30,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI - me.heading);
    ctx.beginPath();
    ctx.moveTo(0, -11);
    ctx.lineTo(8, 8.5);
    ctx.lineTo(0, 4.2);
    ctx.lineTo(-8, 8.5);
    ctx.closePath();
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.fillStyle = '#ff6a12';
    ctx.fill();
    ctx.restore();
    boxes.push([x - 14, y - 14, x + 14, y + 14]);
  }

  /** donde aparecerá el coche: chincheta de lava y una flechita hacia donde mirará */
  drawPick(boxes) {
    const ctx = this.ctx, p = this.pick;
    const [x, y] = this.toScreen(p.x, p.z);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI - p.heading);
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(5.5, -14);
    ctx.lineTo(-5.5, -14);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();
    ctx.beginPath();
    ctx.arc(x, y, 11, 0, Math.PI * 2);
    const g = ctx.createLinearGradient(x, y - 11, x, y + 11);
    g.addColorStop(0, '#ffc233');
    g.addColorStop(1, '#ff4d0f');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 3.6, 0, Math.PI * 2);
    ctx.fillStyle = '#1a0a03';
    ctx.fill();
    boxes.push([x - 16, y - 24, x + 16, y + 16]);
  }

  drawNav() {
    const ctx = this.ctx, n = this.nav;
    const [x, y] = this.toScreen(n.x, n.z);
    if (!this.inView(x, y)) return;
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fillStyle = hex(n.color);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 13, 0, Math.PI * 2);
    ctx.strokeStyle = hex(n.color);
    ctx.stroke();
  }

  /** negocios de los clientes: cuadradito de su color con su letra y, de cerca, su nombre */
  drawClients(boxes) {
    const ctx = this.ctx, named = this.k > 0.9;
    for (const p of this.clients) {
      const [x, y] = this.toScreen(p.spot[0], p.spot[1]);
      if (!this.inView(x, y)) continue;
      const s = 7.5;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x - s, y - s, s * 2, s * 2, 4);
      else ctx.rect(x - s, y - s, s * 2, s * 2);
      ctx.fillStyle = hex(p.color);
      ctx.fill();
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = `800 ${p.glyph.length > 1 ? 9 : 12}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.glyph, x, y + 0.5);
      this.hits.push({ x, y, r: 16, p });
      const box = [x - s - 1, y - s - 1, x + s + 1, y + s + 1];
      if (named) {
        ctx.font = `700 13px ${FONT}`;
        const w = ctx.measureText(p.label).width;
        const lb = [x + s + 3, y - 8, x + s + 7 + w, y + 8];
        if (!this.overlaps(lb, boxes)) {
          this.textOut(p.label, x + s + 5, y, 13, 700, '#ffe2b8', 'left');
          boxes.push(lb);
        }
      }
      boxes.push(box);
    }
  }

  /** sitios conocidos: rombo naranja y el nombre en mayúsculas */
  drawSites(boxes) {
    const ctx = this.ctx;
    for (const p of this.sites) {
      const [x, y] = this.toScreen(p.at[0], p.at[1]);
      if (!this.inView(x, y, 60)) continue;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#ffb340';
      ctx.fillRect(-5, -5, 10, 10);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#1a0a03';
      ctx.strokeRect(-5, -5, 10, 10);
      ctx.restore();
      this.hits.push({ x, y, r: 16, p });
      const text = p.label.toUpperCase();
      ctx.font = `800 13px ${FONT}`;
      const w = ctx.measureText(text).width;
      const box = [x + 9, y - 9, x + 13 + w, y + 9];
      if (this.overlaps(box, boxes)) continue;
      this.textOut(text, x + 11, y, 13, 800, '#ffffff', 'left');
      boxes.push(box, [x - 7, y - 7, x + 7, y + 7]);
    }
  }

  /** nombres de calles a lo largo de la calle, sin pisarse ni quedar boca abajo */
  drawStreets(tiles, boxes) {
    const ctx = this.ctx;
    const fs = this.k > 1.4 ? 13 : 12;
    ctx.font = `600 ${fs}px ${FONT}`;
    const cand = [];
    for (const t of tiles) {
      for (const L of t.labels) {
        if (!L.major && this.k < 0.75) continue;
        const [x, y] = this.toScreen(L.x, L.z);
        if (!this.inView(x, y, -10)) continue;
        cand.push({ L, x, y, score: (L.major ? 0 : 1) + Math.hypot(x - this.Wc / 2, y - this.Hc / 2) / this.Wc });
      }
    }
    cand.sort((a, b) => a.score - b.score);
    const per = new Map();
    let shown = 0;
    for (const { L, x, y } of cand) {
      if (shown >= 70) break;
      const n = per.get(L.name) || 0;
      if (n >= 2) continue;
      const text = shortName(L.name);
      const w = ctx.measureText(text).width;
      let ux = L.dx, uy = L.dz;
      if (ux < 0) { ux = -ux; uy = -uy; }
      const hw = w / 2 + 3, hh = fs * 0.62;
      const ex = Math.abs(ux) * hw + Math.abs(uy) * hh, ey = Math.abs(uy) * hw + Math.abs(ux) * hh;
      const box = [x - ex, y - ey, x + ex, y + ey];
      if (this.overlaps(box, boxes)) continue;
      boxes.push(box);
      per.set(L.name, n + 1);
      shown++;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.atan2(uy, ux));
      this.textOut(text, 0, 0, fs, 600, COL.label);
      ctx.restore();
    }
  }

  drawScale() {
    const m = niceMeters(110 / this.k);
    this.scale.style.setProperty('--w', Math.round(m * this.k) + 'px');
    this.scale.querySelector('span').textContent = m >= 1000 ? m / 1000 + ' km' : m + ' m';
  }
}
