import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Kit para montar por dentro los locales: salas con suelo, techo con plafones
 * y paredes con huecos de puerta o escaparate, y los muebles de siempre
 * (mostradores, mesas, sillas, taburetes, estanterías, sofás, plantas,
 * lámparas, cuadros). Lo fijo se junta en pocas mallas con el color en los
 * vértices y lo que estorba deja su línea de choque.
 *
 * Coordenadas del local: x y z en metros, el suelo en y = 0.
 */

const _c = new THREE.Color();

/** pinta una pieza ya colocada; dim oscurece lo de abajo, como los rincones de una sala */
export function paint(geo, hex, dim = 0) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  for (const a of Object.keys(g.attributes)) if (a !== 'position' && a !== 'normal') g.deleteAttribute(a);
  const pos = g.getAttribute('position'), n = pos.count;
  const col = new Float32Array(n * 3);
  _c.setHex(hex);
  for (let i = 0; i < n; i++) {
    const k = dim ? 1 - dim * (1 - Math.min(1, Math.max(0, pos.getY(i)) / 1.6)) : 1;
    col[i * 3] = _c.r * k; col[i * 3 + 1] = _c.g * k; col[i * 3 + 2] = _c.b * k;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

/** lienzo convertido en textura (rótulos, cartas, cuadros) */
export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// ── suelos de lienzo que se repiten (uno por tipo, compartidos) ──
const FLOOR_SIZE = { wood: 2.4, dark: 2.4, tile: 1.2, terrazo: 2, checker: 1, stone: 2.4, cement: 3 };
const floorCache = new Map();
function floorMaterial(kind) {
  if (floorCache.has(kind)) return floorCache.get(kind);
  const tex = canvasTex(512, 512, (g, W) => {
    const rnd = mulberry(kind.length * 977);
    if (kind === 'wood' || kind === 'dark') {
      const base = kind === 'wood' ? [176, 128, 84] : [74, 52, 40];
      const rows = 8;
      for (let r = 0; r < rows; r++) {
        let x = -rnd() * 300;
        while (x < W) {
          const len = 180 + rnd() * 220, v = (rnd() - 0.5) * 34;
          g.fillStyle = `rgb(${base[0] + v},${base[1] + v * 0.8},${base[2] + v * 0.6})`;
          g.fillRect(x, r * (W / rows), len, W / rows);
          // vetas
          g.strokeStyle = `rgba(40,24,12,${kind === 'wood' ? 0.12 : 0.2})`;
          for (let k = 0; k < 4; k++) {
            const y = r * (W / rows) + 6 + rnd() * (W / rows - 12);
            g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + len * 0.3, y + 3, x + len * 0.6, y - 3, x + len, y); g.stroke();
          }
          g.fillStyle = 'rgba(20,12,6,.55)';
          g.fillRect(x, r * (W / rows), 2, W / rows);
          x += len;
        }
        g.fillStyle = 'rgba(20,12,6,.6)';
        g.fillRect(0, r * (W / rows), W, 2);
      }
    } else if (kind === 'tile' || kind === 'stone') {
      const n = kind === 'tile' ? 2 : 2, s = W / n;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const v = (rnd() - 0.5) * 12;
        g.fillStyle = kind === 'tile' ? `rgb(${226 + v},${218 + v},${204 + v})` : `rgb(${186 + v},${184 + v},${178 + v})`;
        g.fillRect(i * s, j * s, s, s);
        for (let k = 0; k < 300; k++) {
          g.fillStyle = `rgba(${rnd() < 0.5 ? '255,255,255' : '90,80,70'},${0.05 + rnd() * 0.08})`;
          g.fillRect(i * s + rnd() * s, j * s + rnd() * s, 2 + rnd() * 5, 2 + rnd() * 5);
        }
      }
      g.strokeStyle = kind === 'tile' ? 'rgba(150,140,125,.9)' : 'rgba(110,108,104,.9)';
      g.lineWidth = 4;
      for (let i = 0; i <= n; i++) {
        g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, W); g.stroke();
        g.beginPath(); g.moveTo(0, i * s); g.lineTo(W, i * s); g.stroke();
      }
    } else if (kind === 'terrazo') {
      g.fillStyle = '#e6e1d8'; g.fillRect(0, 0, W, W);
      for (let k = 0; k < 2600; k++) {
        const cols = ['#9a948a', '#c8bfb0', '#6e6a64', '#d9c9a8', '#ffffff'];
        g.fillStyle = cols[Math.floor(rnd() * cols.length)];
        g.globalAlpha = 0.5 + rnd() * 0.5;
        g.beginPath(); g.arc(rnd() * W, rnd() * W, 1 + rnd() * 4, 0, Math.PI * 2); g.fill();
      }
      g.globalAlpha = 1;
      g.strokeStyle = 'rgba(160,150,135,.6)'; g.lineWidth = 3;
      g.strokeRect(0, 0, W, W);
    } else if (kind === 'checker') {
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
        g.fillStyle = (i + j) % 2 ? '#1e1f22' : '#eeebe4';
        g.fillRect(i * W / 2, j * W / 2, W / 2, W / 2);
      }
    } else {
      g.fillStyle = '#9a968e'; g.fillRect(0, 0, W, W);
      for (let k = 0; k < 4000; k++) {
        g.fillStyle = `rgba(${rnd() < 0.5 ? '255,255,255' : '40,40,40'},${rnd() * 0.08})`;
        g.fillRect(rnd() * W, rnd() * W, 2, 2);
      }
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  const glossy = kind === 'terrazo' || kind === 'tile' || kind === 'checker' || kind === 'stone';
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: glossy ? 0.35 : 0.7, metalness: 0 });
  floorCache.set(kind, mat);
  return mat;
}

function mulberry(seed) {
  let t = seed >>> 0;
  return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
}

/** material que brilla del color de cada pieza (plafón blanco cálido, neón rosa...) */
export function glowMaterial(intensity = 1.1) {
  const glow = new THREE.MeshStandardMaterial({ vertexColors: true, emissive: 0xffffff, emissiveIntensity: intensity, roughness: 0.4 });
  glow.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance *= vColor.rgb;');
  };
  glow.customProgramCacheKey = () => 'local-glow';
  return glow;
}

// materiales compartidos por todos los locales
let MATS = null;
function mats() {
  if (MATS) return MATS;
  const glow = glowMaterial();
  MATS = {
    shell: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0 }),
    solid: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, metalness: 0.08 }),
    glow,
    glass: new THREE.MeshStandardMaterial({ color: 0xbfd8e6, transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0.1, depthWrite: false, side: THREE.DoubleSide }),
  };
  return MATS;
}

const WALLS = {
  // pared: [origen x, origen z, dirección x, dirección z, normal x, normal z, largo]
  n: (r) => [r.x0, r.z0, 1, 0, 0, 1, r.x1 - r.x0],
  s: (r) => [r.x0, r.z1, 1, 0, 0, -1, r.x1 - r.x0],
  w: (r) => [r.x0, r.z0, 0, 1, 1, 0, r.z1 - r.z0],
  e: (r) => [r.x1, r.z0, 0, 1, -1, 0, r.z1 - r.z0],
};

export class Kit {
  constructor() {
    this.shell = [];   // suelo, paredes y techo: reciben sombra pero no la echan
    this.solid = [];   // muebles: echan sombra
    this.glow = [];    // plafones, bombillas, neones y ventanas con luz de fuera
    this.glass = [];
    this.floors = new Map();
    this.pics = [];    // { geo, tex, glow } cuadros, cartas, rótulos
    this.segs = [];    // líneas de choque [ax, az, bx, bz]
    this.rooms = [];   // salas para la cámara { x0, z0, x1, z1, h }
  }

  // ── piezas sueltas ──
  box(x, y, z, w, h, d, hex, { ry = 0, list = this.solid, dim = 0 } = {}) {
    const g = new THREE.BoxGeometry(w, h, d);
    g.translate(0, h / 2, 0);
    if (ry) g.rotateY(ry);
    g.translate(x, y, z);
    list.push(paint(g, hex, dim));
    return this;
  }

  cyl(x, y, z, rTop, rBot, h, hex, { seg = 14, list = this.solid, ry = 0, rx = 0 } = {}) {
    const g = new THREE.CylinderGeometry(rTop, rBot, h, seg);
    g.translate(0, h / 2, 0);
    if (rx) g.rotateX(rx);
    if (ry) g.rotateY(ry);
    g.translate(x, y, z);
    list.push(paint(g, hex));
    return this;
  }

  ball(x, y, z, r, hex, { sx = 1, sy = 1, sz = 1, list = this.solid, seg = 10 } = {}) {
    const g = new THREE.SphereGeometry(r, seg, Math.max(6, seg - 3));
    g.scale(sx, sy, sz);
    g.translate(x, y, z);
    list.push(paint(g, hex));
    return this;
  }

  /** pieza ya colocada a mano */
  add(geo, hex, { list = this.solid, dim = 0 } = {}) { list.push(paint(geo, hex, dim)); return this; }

  seg(ax, az, bx, bz) { this.segs.push([ax, az, bx, bz]); return this; }

  /** rectángulo que no se atraviesa (mostrador, mesa, estantería), girado ry */
  block(x, z, w, d, ry = 0) {
    const c = Math.cos(ry), s = Math.sin(ry);
    const pt = (u, v) => [x + u * c + v * s, z - u * s + v * c];
    const P = [pt(-w / 2, -d / 2), pt(w / 2, -d / 2), pt(w / 2, d / 2), pt(-w / 2, d / 2)];
    for (let i = 0; i < 4; i++) this.seg(...P[i], ...P[(i + 1) % 4]);
    return this;
  }

  /** plano con textura (cuadro, carta, rótulo) mirando hacia (nx, nz) */
  pic(x, y, z, w, h, nx, nz, tex, { glow = 0 } = {}) {
    const g = new THREE.PlaneGeometry(w, h);
    g.rotateY(Math.atan2(nx, nz));
    g.translate(x + nx * 0.012, y, z + nz * 0.012);
    this.pics.push({ geo: g, tex, glow });
    return this;
  }

  // ── la sala ──
  /**
   * sala rectangular con suelo, techo, rodapié y cuatro paredes que miran
   * hacia dentro (desde fuera no tapan). open: huecos por pared
   * { n, s, e, w: [[desde, hasta, tipo]] } medidos desde la esquina de menor x
   * (paredes n y s) o de menor z (e y w). Tipos: 'door' (paso de 2,25 m),
   * 'arch' (paso hasta el techo), 'glass' (escaparate que no se atraviesa),
   * 'hole' (hueco de escaparate sin cristal: el de la sala de enfrente),
   * 'window' (ventana con la luz de la calle, a media altura).
   */
  room(x0, z0, x1, z1, { h = 3.1, wall = 0xefe8dc, floor = 'wood', ceil = 0xf6f3ee, base = 0x5a4a3c, open = {}, lights = 'panel', walls = 'nsew', camera = true } = {}) {
    const r = { x0, z0, x1, z1, h };
    if (camera) this.rooms.push(r);
    // suelo (con textura que se repite) y techo
    const fg = new THREE.PlaneGeometry(x1 - x0, z1 - z0);
    fg.rotateX(-Math.PI / 2);
    fg.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
    const uv = fg.getAttribute('uv'), pos = fg.getAttribute('position'), size = FLOOR_SIZE[floor] || 2;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / size, pos.getZ(i) / size);
    if (!this.floors.has(floor)) this.floors.set(floor, []);
    this.floors.get(floor).push(fg);
    const cg = new THREE.PlaneGeometry(x1 - x0, z1 - z0);
    cg.rotateX(Math.PI / 2);
    cg.translate((x0 + x1) / 2, h, (z0 + z1) / 2);
    this.shell.push(paint(cg, ceil));
    // plafones cuadrados repartidos (o ninguno si la sala lleva lámparas colgadas)
    if (lights === 'panel') {
      const nx = Math.max(1, Math.round((x1 - x0) / 3.2)), nz = Math.max(1, Math.round((z1 - z0) / 3.2));
      for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
        const px = x0 + (x1 - x0) * (i + 0.5) / nx, pz = z0 + (z1 - z0) * (j + 0.5) / nz;
        this.box(px, h - 0.03, pz, 0.62, 0.03, 0.62, 0xfff4e2, { list: this.glow });
      }
    }
    for (const side of walls) {
      const [ox, oz, dx, dz, nx, nz, L] = WALLS[side](r);
      const holes = (open[side] || []).slice().sort((a, b) => a[0] - b[0]);
      let s = 0;
      const solidPart = (a, b) => {
        if (b - a < 0.01) return;
        this.wallQuad(ox, oz, dx, dz, nx, nz, a, b, 0, h, wall);
        this.seg(ox + dx * a, oz + dz * a, ox + dx * b, oz + dz * b);
        // rodapié
        const g = new THREE.BoxGeometry(b - a, 0.1, 0.025);
        g.rotateY(Math.atan2(nx, nz));
        g.translate(ox + dx * (a + b) / 2 + nx * 0.012, 0.05, oz + dz * (a + b) / 2 + nz * 0.012);
        this.shell.push(paint(g, base));
      };
      for (const [a, b, kind = 'door'] of holes) {
        solidPart(s, a);
        // 'hole': el mismo hueco que un escaparate pero sin cristal (lo pone la sala de al lado)
        const top = kind === 'arch' ? h : kind === 'glass' || kind === 'hole' ? Math.min(h, 2.7) : 2.25;
        const bottom = kind === 'window' ? 0.95 : 0;
        if (top < h) this.wallQuad(ox, oz, dx, dz, nx, nz, a, b, top, h, wall);
        if (bottom > 0) {
          this.wallQuad(ox, oz, dx, dz, nx, nz, a, b, 0, bottom, wall);
          this.seg(ox + dx * a, oz + dz * a, ox + dx * b, oz + dz * b);
        }
        if (kind === 'glass' || kind === 'window') this.pane(ox, oz, dx, dz, nx, nz, a, b, bottom, top, kind === 'window');
        else if (kind === 'door') this.frame(ox, oz, dx, dz, nx, nz, a, b, top);
        s = b;
      }
      solidPart(s, L);
    }
    return r;
  }

  /** trozo de pared plano que mira hacia (nx, nz) */
  wallQuad(ox, oz, dx, dz, nx, nz, a, b, y0, y1, hex) {
    const g = new THREE.PlaneGeometry(b - a, y1 - y0);
    g.rotateY(Math.atan2(nx, nz));
    g.translate(ox + dx * (a + b) / 2, (y0 + y1) / 2, oz + dz * (a + b) / 2);
    this.shell.push(paint(g, hex, 0.18));
  }

  /** marco de puerta (jambas y dintel) */
  frame(ox, oz, dx, dz, nx, nz, a, b, top, hex = 0x4a3a2e) {
    const ry = Math.atan2(nx, nz);
    for (const s of [a, b]) this.box(ox + dx * s + nx * 0.03, 0, oz + dz * s + nz * 0.03, 0.09, top, 0.08, hex, { ry });
    this.box(ox + dx * (a + b) / 2 + nx * 0.03, top - 0.04, oz + dz * (a + b) / 2 + nz * 0.03, b - a + 0.09, 0.09, 0.08, hex, { ry });
  }

  /** cristal (escaparate) o ventana con la claridad de la calle detrás */
  pane(ox, oz, dx, dz, nx, nz, a, b, y0, y1, outside) {
    const ry = Math.atan2(nx, nz), mx = ox + dx * (a + b) / 2, mz = oz + dz * (a + b) / 2;
    if (outside) {
      // la calle no se ve: una luz de día lechosa, como un cristal al sol
      this.box(mx - nx * 0.03, y0, mz - nz * 0.03, b - a, y1 - y0, 0.02, 0xdfeaf2, { ry, list: this.glow });
    } else {
      const g = new THREE.PlaneGeometry(b - a, y1 - y0);
      g.rotateY(ry);
      g.translate(mx, (y0 + y1) / 2, mz);
      this.glass.push(g);
    }
    // perfiles de aluminio
    const al = 0x8f969c;
    this.box(mx, y0, mz, b - a, 0.05, 0.06, al, { ry });
    this.box(mx, y1 - 0.05, mz, b - a, 0.05, 0.06, al, { ry });
    const n = Math.max(1, Math.round((b - a) / 1.6));
    for (let i = 0; i <= n; i++) {
      const s = a + (b - a) * i / n;
      this.box(ox + dx * s, y0, oz + dz * s, 0.05, y1 - y0, 0.06, al, { ry });
    }
    this.seg(ox + dx * a, oz + dz * a, ox + dx * b, oz + dz * b);
  }

  // ── muebles ──
  table(x, z, { w = 0.8, d = 0.8, h = 0.76, top = 0xf2efe8, leg = 0x2e2a26, round = false, cloth = null } = {}) {
    if (round) {
      this.cyl(x, h - 0.03, z, w / 2, w / 2, 0.03, cloth ?? top, { seg: 22 });
      this.cyl(x, 0, z, 0.035, 0.035, h - 0.03, leg, { seg: 8 });
      this.cyl(x, 0, z, 0.22, 0.25, 0.03, leg, { seg: 14 });
    } else {
      this.box(x, h - 0.035, z, w, 0.035, d, top);
      if (cloth) this.box(x, h - 0.2, z, w + 0.04, 0.2, d + 0.04, cloth);
      else for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) this.box(x + sx * (w / 2 - 0.05), 0, z + sz * (d / 2 - 0.05), 0.045, h - 0.035, 0.045, leg);
    }
    this.block(x, z, w * 0.9, d * 0.9);
    return this;
  }

  /** silla mirando hacia ry (respaldo detrás) */
  chair(x, z, ry, hex = 0x5a4636, { seat = 0.46, legs = 0x2e2a26 } = {}) {
    const fx = Math.sin(ry), fz = Math.cos(ry);
    this.box(x, seat - 0.04, z, 0.44, 0.04, 0.42, hex, { ry });
    this.box(x - fx * 0.2, seat, z - fz * 0.2, 0.44, 0.42, 0.04, hex, { ry });
    for (const [u, v] of [[-0.18, -0.17], [0.18, -0.17], [-0.18, 0.17], [0.18, 0.17]]) {
      const c = Math.cos(ry), s = Math.sin(ry);
      this.box(x + u * c + v * s, 0, z - u * s + v * c, 0.035, seat - 0.04, 0.035, legs, { ry });
    }
    return this;
  }

  stool(x, z, hex = 0x2a2c30, { h = 0.76, top = 0x7a2a22 } = {}) {
    this.cyl(x, 0, z, 0.03, 0.03, h - 0.06, hex, { seg: 8 });
    this.cyl(x, 0.28, z, 0.17, 0.17, 0.02, hex, { seg: 12 });
    this.cyl(x, h - 0.06, z, 0.19, 0.19, 0.07, top, { seg: 16 });
    return this;
  }

  /** mostrador: frente, encimera y zócalo; (x, z) es el centro, ry hacia el cliente */
  counter(x, z, w, d, ry, { h = 1.05, front = 0x6a4a36, top = 0xe8e2d8, kick = 0x2a2420 } = {}) {
    this.box(x, 0, z, w, 0.1, d - 0.08, kick, { ry });
    this.box(x, 0.1, z, w, h - 0.14, d, front, { ry });
    this.box(x, h - 0.04, z, w + 0.06, 0.04, d + 0.08, top, { ry });
    this.block(x, z, w, d, ry);
    return this;
  }

  /** estantería contra la pared mirando hacia ry; items(kit, x, y, z, ancho, ry) rellena cada balda */
  shelf(x, z, w, ry, { h = 2.1, d = 0.38, hex = 0xd8cbb4, rows = 5, items = null } = {}) {
    const fx = Math.sin(ry), fz = Math.cos(ry);
    this.box(x - fx * (d / 2 - 0.01), 0, z - fz * (d / 2 - 0.01), w, h, 0.02, hex, { ry });
    for (const s of [-1, 1]) {
      const c = Math.cos(ry), sn = Math.sin(ry), u = s * (w / 2 - 0.01);
      this.box(x + u * c, 0, z - u * sn, 0.025, h, d, hex, { ry });
    }
    for (let i = 0; i < rows; i++) {
      const y = 0.08 + i * (h - 0.12) / (rows - 1);
      this.box(x, y, z, w, 0.025, d, hex, { ry });
      if (items && i < rows - 1) items(this, x + fx * 0.02, y + 0.025, z + fz * 0.02, w - 0.08, ry, i);
    }
    this.block(x, z, w, d, ry);
    return this;
  }

  sofa(x, z, w, ry, hex = 0x5a6670) {
    const fx = Math.sin(ry), fz = Math.cos(ry);
    this.box(x, 0, z, w, 0.42, 0.82, hex, { ry });
    this.box(x - fx * 0.32, 0.42, z - fz * 0.32, w, 0.42, 0.18, hex, { ry });
    for (const s of [-1, 1]) {
      const c = Math.cos(ry), sn = Math.sin(ry), u = s * (w / 2 - 0.09);
      this.box(x + u * c, 0.42, z - u * sn, 0.18, 0.2, 0.82, hex, { ry });
    }
    this.block(x, z, w, 0.82, ry);
    return this;
  }

  /** planta en maceta; flowers: color de las flores (buganvilla, lirios...) */
  plant(x, z, { h = 1.2, pot = 0xc8b8a0, leaf = 0x2f6b3a, flowers = null, r = 0.42 } = {}) {
    this.cyl(x, 0, z, r * 0.62, r * 0.48, 0.42, pot, { seg: 14 });
    const rnd = mulberry(Math.round(x * 31 + z * 17) >>> 0);
    for (let i = 0; i < 7; i++) {
      const a = rnd() * Math.PI * 2, d = rnd() * r * 0.55, y = 0.5 + rnd() * (h - 0.6);
      this.ball(x + Math.cos(a) * d, y, z + Math.sin(a) * d, r * (0.45 + rnd() * 0.3), leaf, { seg: 8 });
    }
    if (flowers) for (let i = 0; i < 14; i++) {
      const a = rnd() * Math.PI * 2, d = r * (0.3 + rnd() * 0.6), y = 0.6 + rnd() * (h - 0.5);
      this.ball(x + Math.cos(a) * d, y, z + Math.sin(a) * d, 0.07 + rnd() * 0.05, flowers, { seg: 6 });
    }
    this.block(x, z, r * 1.1, r * 1.1);
    return this;
  }

  /** lámpara colgada: cable, pantalla y bombilla que brilla */
  pendant(x, z, ceilH, { drop = 0.85, shade = 0x22262a, r = 0.22, bulb = 0xffe2b0 } = {}) {
    const y = ceilH - drop;
    this.cyl(x, y + 0.2, z, 0.006, 0.006, drop - 0.2, 0x111111, { seg: 4 });
    const g = new THREE.ConeGeometry(r, 0.24, 18, 1, true);
    g.translate(x, y + 0.12, z);
    this.solid.push(paint(g, shade));
    this.ball(x, y + 0.04, z, 0.07, bulb, { list: this.glow });
    return this;
  }

  rug(x, z, w, d, ry, hex) { return this.box(x, 0.003, z, w, 0.012, d, hex, { ry, list: this.shell }); }

  /** monta las mallas del local (glow: material propio para lo que brilla, si se quiere encender y apagar) */
  build(name, { glow = null } = {}) {
    const M = mats();
    const group = new THREE.Group();
    group.name = name;
    const add = (geos, mat, shadow) => {
      if (!geos.length) return;
      const m = new THREE.Mesh(mergeGeometries(geos, false), mat);
      m.castShadow = shadow;
      m.receiveShadow = true;
      group.add(m);
    };
    add(this.shell, M.shell, false);
    add(this.solid, M.solid, true);
    add(this.glow, glow || M.glow, false);
    if (this.glass.length) {
      const m = new THREE.Mesh(mergeGeometries(this.glass, false), M.glass);
      m.renderOrder = 2;
      group.add(m);
    }
    for (const [kind, geos] of this.floors) {
      const m = new THREE.Mesh(mergeGeometries(geos, false), floorMaterial(kind));
      m.receiveShadow = true;
      group.add(m);
    }
    for (const p of this.pics) {
      const mat = new THREE.MeshStandardMaterial({ map: p.tex, roughness: 0.55, ...(p.glow ? { emissive: 0xffffff, emissiveMap: p.tex, emissiveIntensity: p.glow } : {}) });
      const m = new THREE.Mesh(p.geo, mat);
      m.receiveShadow = true;
      group.add(m);
    }
    return { group, segs: this.segs, rooms: this.rooms };
  }
}
