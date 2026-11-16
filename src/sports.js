import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Instalaciones deportivas: campos de fútbol de césped artificial con todas
 * sus líneas, porterías con red, banderines, redes de fondo y torres de
 * focos; pistas de tenis y de pádel (cristal y malla) con su red; canchas
 * polideportivas con porterías de fútbol sala y canastas, y vallas de malla.
 *
 * Cada recinto se mide como un rectángulo orientado (el mínimo que cubre el
 * polígono del mapa): u a lo largo, v a lo ancho.
 */

const Y = 0.128;          // suelo de la pista (sobre el terreno)
const YL = Y + 0.006;     // líneas pintadas

// pistas de pádel vistas en la foto aérea (junto a la Ciudad Deportiva) que el mapa no trae
const EXTRA_PADEL = [
  { cx: -333.2, cz: -439.2, ux: 0.378, uz: -0.926 },
  { cx: -322.6, cz: -435.0, ux: 0.378, uz: -0.926 },
];

const hash = (x, z) => {
  const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return s - Math.floor(s);
};

/** rectángulo mínimo que cubre el polígono: centro, eje largo (ux, uz), largo L y ancho S */
export function orientedRect(poly) {
  const pts = poly.length > 1 && poly[0][0] === poly[poly.length - 1][0] && poly[0][1] === poly[poly.length - 1][1] ? poly.slice(0, -1) : poly;
  let best = null;
  for (let i = 0; i < pts.length; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[(i + 1) % pts.length];
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 0.5) continue;
    const ux = (bx - ax) / len, uz = (bz - az) / len;
    let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity;
    for (const [x, z] of pts) {
      const a = x * ux + z * uz, b = -x * uz + z * ux;
      a0 = Math.min(a0, a); a1 = Math.max(a1, a); b0 = Math.min(b0, b); b1 = Math.max(b1, b);
    }
    const area = (a1 - a0) * (b1 - b0);
    if (!best || area < best.area) best = { area, ux, uz, a0, a1, b0, b1 };
  }
  if (!best) return null;
  const ca = (best.a0 + best.a1) / 2, cb = (best.b0 + best.b1) / 2;
  let { ux, uz } = best;
  const cx = ca * ux - cb * uz, cz = ca * uz + cb * ux;
  let L = best.a1 - best.a0, S = best.b1 - best.b0;
  if (L < S) { [L, S] = [S, L]; [ux, uz] = [-uz, ux]; }
  return { cx, cz, ux, uz, L, S };
}

/** lienzo con trama repetible (malla de valla o red) */
function meshTexture(size, draw) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  draw(g, size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/**
 * constructor de piezas sobre un recinto: todo en coordenadas del recinto
 * (a a lo largo, b a lo ancho) y se pasa al mundo al guardarlo
 */
class Court {
  constructor(B, spec) {
    this.B = B;
    Object.assign(this, spec);
    this.vx = -spec.uz;
    this.vz = spec.ux;
  }
  w(a, b) { return [this.cx + a * this.ux + b * this.vx, this.cz + a * this.uz + b * this.vz]; }

  /** rectángulo plano [a0, a1] × [b0, b1] a la altura y, del color dado */
  rect(a0, a1, b0, b1, y, hex) {
    const P = [this.w(a0, b0), this.w(a1, b0), this.w(a1, b1), this.w(a0, b1)];
    const pos = [], uv = [];
    for (const i of [0, 2, 1, 0, 3, 2]) { pos.push(P[i][0], y, P[i][1]); uv.push(P[i][0] / 1.5, P[i][1] / 1.5); }
    this.B.surf.push(colored(geo(pos, uv), hex));
  }
  /** raya de ancho lw entre dos puntos */
  line(a0, b0, a1, b1, lw = 0.1) {
    const da = a1 - a0, db = b1 - b0, l = Math.hypot(da, db) || 1;
    const na = (-db / l) * lw / 2, nb = (da / l) * lw / 2;
    const P = [this.w(a0 + na, b0 + nb), this.w(a1 + na, b1 + nb), this.w(a1 - na, b1 - nb), this.w(a0 - na, b0 - nb)];
    const pos = [];
    for (const i of [0, 1, 2, 0, 2, 3]) pos.push(P[i][0], YL, P[i][1]);
    this.B.lines.push(geo(pos));
  }
  box(a0, a1, b0, b1, lw) {
    this.line(a0, b0, a1, b0, lw); this.line(a1, b0, a1, b1, lw);
    this.line(a1, b1, a0, b1, lw); this.line(a0, b1, a0, b0, lw);
  }
  arc(a, b, r, t0, t1, lw = 0.1, n = 24) {
    for (let k = 0; k < n; k++) {
      const s0 = t0 + ((t1 - t0) * k) / n, s1 = t0 + ((t1 - t0) * (k + 1)) / n;
      this.line(a + Math.cos(s0) * r, b + Math.sin(s0) * r, a + Math.cos(s1) * r, b + Math.sin(s1) * r, lw);
    }
  }
  /**
   * pieza sólida puesta en (a, b) a la altura y, girada con el recinto
   * (en la pieza, x va a lo largo del recinto y z a lo ancho)
   */
  solid(g, a, y, b, hex, rotY = 0, into = 'metal') {
    const [x, z] = this.w(a, b);
    g.rotateY(rotY - Math.atan2(this.uz, this.ux));
    g.translate(x, y, z);
    this.B[into].push(colored(g, hex));
  }
  /** paño vertical de (a0, b0) a (a1, b1) entre y0 e y1: malla, red o cristal */
  panel(a0, b0, a1, b1, y0, y1, kind, collide = false) {
    const p0 = this.w(a0, b0), p1 = this.w(a1, b1);
    const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
    if (len < 0.05) return;
    const pos = [], uv = [];
    const V = [[p0[0], y0, p0[1], 0, y0], [p1[0], y0, p1[1], len, y0], [p1[0], y1, p1[1], len, y1], [p0[0], y1, p0[1], 0, y1]];
    for (const i of [0, 1, 2, 0, 2, 3]) { pos.push(V[i][0], V[i][1], V[i][2]); uv.push(V[i][3], V[i][4]); }
    this.B[kind].push(geo(pos, uv));
    if (collide) this.B.colliders?.addSegment(p0[0], p0[1], p1[0], p1[1], 'fence');
  }
  post(a, b, h, r = 0.04, hex = 0x2e3a33) {
    this.solid(new THREE.CylinderGeometry(r, r, h, 6), a, h / 2, b, hex);
  }
  /** valla de malla por el contorno [a0, a1] × [b0, b1], con la puerta en mitad del lado b1 */
  fence(a0, a1, b0, b1, h) {
    const sides = [[a0, b0, a1, b0], [a1, b0, a1, b1], [a1, b1, a0, b1], [a0, b1, a0, b0]];
    sides.forEach(([sa, sb, ea, eb], k) => {
      const l = Math.hypot(ea - sa, eb - sb), n = Math.max(1, Math.round(l / 3));
      for (let i = 0; i < n; i++) {
        const t0 = i / n, t1 = (i + 1) / n;
        this.post(sa + (ea - sa) * t0, sb + (eb - sb) * t0, h);
        if (k === 2 && n > 2 && i === Math.floor(n / 2)) continue;
        this.panel(sa + (ea - sa) * t0, sb + (eb - sb) * t0, sa + (ea - sa) * t1, sb + (eb - sb) * t1, Y, h, 'fence', true);
      }
      // barandilla de arriba (los lados van a lo largo o a lo ancho del recinto)
      const along = Math.abs(ea - sa) > Math.abs(eb - sb);
      this.solid(new THREE.BoxGeometry(along ? l : 0.05, 0.05, along ? 0.05 : l), (sa + ea) / 2, h, (sb + eb) / 2, 0x2e3a33);
    });
  }
  /** torre de focos en (a, b) con los proyectores mirando al centro del recinto */
  flood(a, b, h, heads = 2) {
    this.solid(new THREE.CylinderGeometry(0.12, 0.2, h, 8), a, h / 2, b, 0x8a9096);
    const yaw = Math.atan2(-b, -a), ca = Math.cos(yaw), cb = Math.sin(yaw);
    const rows = heads > 2 ? 2 : 1, per = Math.ceil(heads / rows);
    for (let k = 0; k < heads; k++) {
      const off = ((k % per) - (per - 1) / 2) * 1.0;
      const g = new THREE.BoxGeometry(0.3, 0.8, 0.9);
      g.rotateZ(-0.5);
      g.rotateY(-yaw);
      this.solid(g, a + ca * 0.35 - cb * off, h + 0.3 + Math.floor(k / per) * 0.95, b + cb * 0.35 + ca * off, 0xf4f1e6, 0, 'lamps');
    }
  }
}

function geo(pos, uv) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  if (uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}
function colored(g, hex) {
  const geom = g.index ? g.toNonIndexed() : g;
  const c = new THREE.Color(hex), n = geom.getAttribute('position').count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) arr.set([c.r, c.g, c.b], i * 3);
  geom.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  if (!geom.getAttribute('uv')) {
    const p = geom.getAttribute('position');
    const uv = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) { uv[i * 2] = p.getX(i) / 1.5; uv[i * 2 + 1] = p.getZ(i) / 1.5; }
    geom.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  }
  return geom;
}

/** portería: postes, larguero, marco de atrás y red (ancho gw, alto gh, fondo gd) en el fondo a = ea */
function goal(C, ea, gw, gh, gd, striped = false) {
  const s = Math.sign(ea);
  const white = 0xf4f4f0, red = 0xc8261c;
  for (const sb of [-1, 1]) {
    if (striped) {
      for (let k = 0; k < 5; k++) C.solid(new THREE.BoxGeometry(0.08, gh / 5, 0.08), ea, (k + 0.5) * (gh / 5), sb * gw / 2, k % 2 ? white : red);
    } else C.solid(new THREE.CylinderGeometry(0.06, 0.06, gh, 8), ea, gh / 2, sb * gw / 2, white);
    // tirante inclinado de atrás, del larguero al suelo
    C.solid(new THREE.CylinderGeometry(0.025, 0.025, Math.hypot(gd, gh), 5).rotateZ(Math.atan2(s * gd, gh)), ea + s * gd / 2, gh / 2, sb * gw / 2, 0xd8d8d2);
  }
  if (striped) {
    for (let k = 0; k < 5; k++) C.solid(new THREE.BoxGeometry(0.08, 0.08, gw / 5), ea, gh, (k - 2) * (gw / 5), k % 2 ? white : red);
  } else C.solid(new THREE.CylinderGeometry(0.06, 0.06, gw, 8).rotateX(Math.PI / 2), ea, gh, 0, white);
  C.solid(new THREE.CylinderGeometry(0.03, 0.03, gw, 6).rotateX(Math.PI / 2), ea + s * gd, 0.05, 0, 0xd8d8d2);
  // red: fondo, laterales y techo
  C.panel(ea + s * gd, -gw / 2, ea + s * gd, gw / 2, Y, gh * 0.8, 'net');
  for (const sb of [-1, 1]) C.panel(ea, sb * gw / 2, ea + s * gd, sb * gw / 2, Y, gh, 'net');
  const top = [C.w(ea, -gw / 2), C.w(ea, gw / 2), C.w(ea + s * gd, gw / 2), C.w(ea + s * gd, -gw / 2)];
  const pos = [], uv = [];
  const Vt = [[top[0], gh, 0, 0], [top[1], gh, gw, 0], [top[2], gh * 0.8, gw, gd], [top[3], gh * 0.8, 0, gd]];
  for (const i of [0, 1, 2, 0, 2, 3]) { pos.push(Vt[i][0][0], Vt[i][1], Vt[i][0][1]); uv.push(Vt[i][2], Vt[i][3]); }
  C.B.net.push(geo(pos, uv));
}

/** canasta: poste tras el fondo, brazo, tablero y aro (en el fondo a = ea, mirando a la pista) */
function hoop(C, ea) {
  const s = Math.sign(ea);
  C.solid(new THREE.CylinderGeometry(0.09, 0.11, 3.3, 8), ea + s * 1.4, 1.65, 0, 0x1f4f8a);
  C.solid(new THREE.BoxGeometry(1.3, 0.1, 0.1), ea + s * 0.75, 3.3, 0, 0x1f4f8a);
  C.solid(new THREE.BoxGeometry(0.05, 1.05, 1.8), ea + s * 0.1, 3.45, 0, 0xf4f4f0);
  C.solid(new THREE.BoxGeometry(0.06, 0.45, 0.59), ea + s * 0.07, 3.3, 0, 0xc8261c);
  C.solid(new THREE.TorusGeometry(0.23, 0.02, 6, 16).rotateX(Math.PI / 2), ea - s * 0.18, 3.05, 0, 0xe0661c);
  const net = new THREE.CylinderGeometry(0.23, 0.15, 0.4, 10, 1, true);
  C.solid(net, ea - s * 0.18, 2.85, 0, 0xf4f4f0);
}

// ── recintos ──
function football(C) {
  const big = C.L > 85;
  const mL = big ? 3 : 2, mS = big ? 2.5 : 1.6;
  const FL = C.L - 2 * mL, FS = C.S - 2 * mS, hl = FL / 2, hs = FS / 2;
  const k = Math.max(0.55, Math.min(1, FS / 68));
  C.rect(-C.L / 2, C.L / 2, -C.S / 2, C.S / 2, Y - 0.002, 0x2c6633);
  // franjas del corte del césped
  const n = Math.max(6, Math.round(FL / 5.5 / 2) * 2);
  for (let i = 0; i < n; i++) C.rect(-hl + (FL * i) / n, -hl + (FL * (i + 1)) / n, -hs, hs, Y, i % 2 ? 0x3a8a3e : 0x337c37);
  const lw = big ? 0.12 : 0.1;
  C.box(-hl, hl, -hs, hs, lw);
  C.line(0, -hs, 0, hs, lw);
  C.arc(0, 0, 9.15 * k, 0, Math.PI * 2, lw, 40);
  C.arc(0, 0, 0.15, 0, Math.PI * 2, 0.3, 8);
  const pd = 16.5 * k, pw = Math.min(40.3 * k, FS - 4) / 2, gd = 5.5 * k, gwid = 18.32 * k / 2, ps = 11 * k;
  for (const s of [-1, 1]) {
    const e = s * hl;
    C.box(Math.min(e, e - s * pd), Math.max(e, e - s * pd), -pw, pw, lw);
    C.box(Math.min(e, e - s * gd), Math.max(e, e - s * gd), -gwid, gwid, lw);
    C.arc(e - s * ps, 0, 0.12, 0, Math.PI * 2, 0.24, 8);
    // media luna fuera del área
    const t = Math.acos(Math.min(1, (pd - ps) / (9.15 * k)));
    C.arc(e - s * ps, 0, 9.15 * k, s > 0 ? Math.PI - t : -t, s > 0 ? Math.PI + t : t, lw, 16);
    for (const sb of [-1, 1]) {
      C.arc(e, sb * hs, 1, s > 0 ? (sb > 0 ? Math.PI : Math.PI / 2) : (sb > 0 ? -Math.PI / 2 : 0), s > 0 ? (sb > 0 ? 1.5 * Math.PI : Math.PI) : (sb > 0 ? 0 : Math.PI / 2), lw, 6);
      // banderín de córner
      C.post(e, sb * hs, 1.5, 0.02, 0xf2f2ee);
      C.solid(new THREE.BoxGeometry(0.02, 0.35, 0.45), e, 1.32, sb * hs + 0.22, 0xf0bf1a);
    }
    goal(C, e, big ? 7.32 : 6, big ? 2.44 : 2, big ? 2 : 1.5);
    // red alta de fondo para que no se escape el balón
    const nb = Math.min(hs, 18);
    C.panel(e + s * (mL - 0.4), -nb, e + s * (mL - 0.4), nb, Y, 6, 'fence');
    for (let i = 0; i <= 4; i++) C.post(e + s * (mL - 0.4), -nb + (2 * nb * i) / 4, 6, 0.07);
  }
  // torres de focos en las esquinas
  const fh = big ? 20 : 13;
  for (const s of [-1, 1]) for (const sb of [-1, 1]) C.flood(s * (C.L / 2 + 1.5), sb * (C.S / 2 + 1.5), fh, big ? 4 : 2);
  // banquillos
  for (const s of [-1, 1]) {
    C.solid(new THREE.BoxGeometry(4, 0.08, 0.9), s * 6, 1.9, -C.S / 2 + 0.6, 0x2e5c9a);
    C.solid(new THREE.BoxGeometry(4, 1.9, 0.06), s * 6, 0.95, -C.S / 2 + 0.15, 0x2e5c9a);
    C.solid(new THREE.BoxGeometry(3.8, 0.45, 0.4), s * 6, 0.25, -C.S / 2 + 0.45, 0xd8d8d2);
  }
}

function tennis(C) {
  const CL = 23.77, CW = 10.97, hl = CL / 2, hw = CW / 2, hs = 8.23 / 2;
  const AL = Math.max(C.L, 34), AW = Math.max(C.S, 17);
  const clay = hash(C.cx, C.cz) < 0.35;
  C.rect(-AL / 2, AL / 2, -AW / 2, AW / 2, Y - 0.002, clay ? 0xa84f2c : 0x3d7a5c);
  C.rect(-hl - 0.3, hl + 0.3, -hw - 0.3, hw + 0.3, Y, clay ? 0xb85a33 : 0x2d5fa0);
  C.box(-hl, hl, -hw, hw, 0.05);
  C.line(-hl, -hs, hl, -hs, 0.05); C.line(-hl, hs, hl, hs, 0.05);
  C.line(-6.4, -hs, -6.4, hs, 0.05); C.line(6.4, -hs, 6.4, hs, 0.05);
  C.line(-6.4, 0, 6.4, 0, 0.05);
  C.line(-hl, 0, -hl + 0.3, 0, 0.05); C.line(hl, 0, hl - 0.3, 0, 0.05);
  // red con su banda blanca y postes
  for (const sb of [-1, 1]) C.post(0, sb * (hw + 0.914), 1.07, 0.04, 0x1d3b2a);
  C.panel(0, -hw - 0.9, 0, hw + 0.9, Y + 0.02, 1.0, 'net');
  C.solid(new THREE.BoxGeometry(0.05, 0.06, CW + 1.8), 0, 0.98, 0, 0xf4f4f0);
  C.fence(-AL / 2, AL / 2, -AW / 2, AW / 2, 3.6);
  for (const s of [-1, 1]) for (const sb of [-1, 1]) C.flood(s * (AL / 2 - 4), sb * (AW / 2 + 0.6), 8.5, 1);
}

function padel(C) {
  const hl = 10, hw = 5;
  C.rect(-hl - 0.6, hl + 0.6, -hw - 0.6, hw + 0.6, Y - 0.002, 0x3a4048);
  C.rect(-hl, hl, -hw, hw, Y, hash(C.cx, C.cz) < 0.3 ? 0x2f7a4a : 0x2b63b5);
  C.line(-6.95, -hw, -6.95, hw, 0.05); C.line(6.95, -hw, 6.95, hw, 0.05);
  C.line(-6.95, 0, 6.95, 0, 0.05);
  // red
  for (const sb of [-1, 1]) C.post(0, sb * (hw - 0.05), 0.92, 0.04, 0x1c1c1e);
  C.panel(0, -hw, 0, hw, Y + 0.02, 0.88, 'net');
  C.solid(new THREE.BoxGeometry(0.04, 0.05, 2 * hw), 0, 0.88, 0, 0xf4f4f0);
  // fondos de cristal (3 m) con malla hasta 4 m; laterales: cristal escalonado y malla
  for (const s of [-1, 1]) {
    C.panel(s * hl, -hw, s * hl, hw, Y, 3, 'glass', true);
    C.panel(s * hl, -hw, s * hl, hw, 3, 4, 'fence');
    for (const sb of [-1, 1]) {
      C.panel(s * hl, sb * hw, s * (hl - 2), sb * hw, Y, 3, 'glass', true);
      C.panel(s * hl, sb * hw, s * (hl - 2), sb * hw, 3, 4, 'fence');
      C.panel(s * (hl - 2), sb * hw, s * (hl - 4), sb * hw, Y, 2, 'glass', true);
      C.panel(s * (hl - 2), sb * hw, s * (hl - 4), sb * hw, 2, 3, 'fence');
      // malla del medio, con la puerta junto a la red
      C.panel(s * (hl - 4), sb * hw, s * 1.2, sb * hw, Y, 3, 'fence', true);
      for (let a = 0; a <= hl; a += 2) C.post(s * a, sb * hw, a > hl - 2.5 ? 4 : 3, 0.045, 0x1c1c1e);
    }
    for (let b = -hw; b <= hw; b += 2.5) C.post(s * hl, b, 4, 0.045, 0x1c1c1e);
  }
  for (const s of [-1, 1]) for (const sb of [-1, 1]) C.flood(s * 7, sb * (hw + 0.7), 6.5, 1);
}

function multi(C) {
  const CL = Math.min(C.L - 2, 40), CW = Math.min(C.S - 2, 20), hl = CL / 2, hw = CW / 2;
  C.rect(-C.L / 2, C.L / 2, -C.S / 2, C.S / 2, Y - 0.002, 0x3f7f6c);
  C.rect(-hl, hl, -hw, hw, Y, 0x2f6aa8);
  C.box(-hl, hl, -hw, hw, 0.08);
  C.line(0, -hw, 0, hw, 0.08);
  C.arc(0, 0, Math.min(3, hw * 0.3), 0, Math.PI * 2, 0.08, 28);
  const ga = Math.min(6, hw * 0.6);
  for (const s of [-1, 1]) {
    const e = s * hl;
    // área de portería (la "D") y punto de penalti
    C.arc(e, 0, ga, s > 0 ? Math.PI / 2 : -Math.PI / 2, s > 0 ? 1.5 * Math.PI : Math.PI / 2, 0.08, 20);
    C.arc(e - s * ga, 0, 0.1, 0, Math.PI * 2, 0.2, 6);
    goal(C, e, 3, 2, 1, true);
    hoop(C, e);
  }
  C.fence(-C.L / 2, C.L / 2, -C.S / 2, C.S / 2, 3.2);
  for (const s of [-1, 1]) for (const sb of [-1, 1]) C.flood(s * (C.L / 2 - 2), sb * (C.S / 2 + 0.6), 9, 1);
}

/** qué hay en cada recinto: el deporte del mapa o, si no lo dice, por su tamaño */
function kindOf(sport, L, S) {
  if (sport === 'soccer' || sport === 'football') return 'football';
  if (sport === 'tennis') return 'tennis';
  if (sport === 'padel') return 'padel';
  if (['multi', 'futsal', 'basketball', 'handball'].includes(sport)) return 'multi';
  if (sport) return null;
  if (L > 50) return 'football';
  if (L >= 17 && L <= 22.5 && S <= 12) return 'padel';
  if (L > 22.5 && L <= 27 && S <= 13) return 'tennis';
  if (L > 22.5) return 'multi';
  return null;
}

/**
 * monta las instalaciones; devuelve las áreas que ya ha resuelto
 * (el resto, como el skate o la petanca, lo pinta parks.js)
 */
export function buildSports(map, scene, colliders, { extraCourts = [] } = {}) {
  const fenceTex = meshTexture(64, (g, n) => {
    g.strokeStyle = 'rgba(64,78,70,1)';
    g.lineWidth = 6;
    g.beginPath();
    g.moveTo(0, 0); g.lineTo(n, n); g.moveTo(n, 0); g.lineTo(0, n);
    g.stroke();
  });
  const netTex = meshTexture(32, (g, n) => {
    g.strokeStyle = 'rgba(245,245,240,1)';
    g.lineWidth = 2;
    g.strokeRect(1, 1, n - 2, n - 2);
  });
  fenceTex.repeat.set(1 / 0.16, 1 / 0.16);
  netTex.repeat.set(1 / 0.1, 1 / 0.1);
  const B = { surf: [], lines: [], metal: [], fence: [], net: [], glass: [], lamps: [], colliders };
  const done = new Set();
  const list = [];
  for (const a of map.areas || []) {
    if (a.k !== 'pitch') continue;
    const r = orientedRect(a.p);
    if (!r) continue;
    const kind = kindOf(a.sport || '', r.L, r.S);
    if (!kind) continue;
    done.add(a);
    a.sportsDone = true;
    list.push([kind, r]);
  }
  for (const c of [...EXTRA_PADEL, ...extraCourts]) list.push([c.kind || 'padel', { L: 20, S: 10, ...c }]);
  for (const [kind, r] of list) {
    const C = new Court(B, r);
    ({ football, tennis, padel, multi })[kind](C);
  }

  const group = new THREE.Group();
  group.name = 'deportes';
  const add = (geos, mat, { shadow = false, receive = true } = {}) => {
    if (!geos.length) return null;
    const m = new THREE.Mesh(mergeGeometries(geos.map(g => (g.index ? g.toNonIndexed() : g)), false), mat);
    m.castShadow = shadow;
    m.receiveShadow = receive;
    group.add(m);
    return m;
  };
  const grain = meshTexture(128, (g, n) => {
    g.fillStyle = '#d8d8d8';
    g.fillRect(0, 0, n, n);
    for (let i = 0; i < 2600; i++) {
      const v = 180 + Math.floor(Math.random() * 75);
      g.fillStyle = `rgb(${v},${v},${v})`;
      g.fillRect(Math.random() * n, Math.random() * n, 1.4, 1.4);
    }
  });
  add(B.surf, new THREE.MeshStandardMaterial({ vertexColors: true, map: grain, roughness: 0.9 }));
  add(B.lines, new THREE.MeshStandardMaterial({ color: 0xf2f2ec, roughness: 0.75, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  add(B.metal, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.45, metalness: 0.45 }), { shadow: true });
  // malla semitransparente: de lejos queda como un velo gris, de cerca se ven los rombos
  add(B.fence, new THREE.MeshStandardMaterial({ map: fenceTex, transparent: true, depthWrite: false, side: THREE.DoubleSide, roughness: 0.6, metalness: 0.4 }));
  add(B.net, new THREE.MeshStandardMaterial({ map: netTex, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.8 }));
  add(B.glass, new THREE.MeshStandardMaterial({ color: 0xd6e8f0, transparent: true, opacity: 0.2, roughness: 0.05, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false }), { receive: false });
  add(B.lamps, new THREE.MeshStandardMaterial({ vertexColors: true, emissive: 0xfff2d0, emissiveIntensity: 0.25, roughness: 0.4 }), { shadow: true });
  scene.add(group);
  return { group, done, count: list.length };
}
