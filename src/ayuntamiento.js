import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { windowGlow } from './realism.js';
import { lightSlabs, paveMesh, bandTris } from './suelos.js';

/**
 * Ayuntamiento de Arrecife, en la Avenida Vargas frente al mar (al lado de La
 * Recova), como en la foto de José Manuel: fachada blanca con cornisa gris,
 * portada adelantada con el arco de cantería gris, la puerta de madera con su
 * montante en abanico, las letras AYUNTAMIENTO DE ARRECIFE y el escudo encima,
 * dos faroles negros, ventanas altas en arco con carpintería marrón, la
 * torrecilla mirador de la azotea, la acera gris oscuro con dos puntos de recarga
 * para coches eléctricos, tres banderas sobre la portada y, enfrente, en el paseo,
 * una bandera de España grande (las banderas las pone civic.js con map.aytoFlags).
 * Va pegada a la fachada del edificio del mapa (sube a 6,5 m y sin escaparates).
 */

// la fachada de la avenida, de suroeste a noreste (casi recta en el mapa)
const A = [302.9, 380.4], B = [339.9, 345.3];
const MIRADOR = [305.5, 370];
const WALL_H = 7.0, ROOF = 6.5;
const WHITE = 0xf3f1ea, GREY = 0x86827b, STONE = 0x8f8b84, DARK = 0x1d1b1a;

export function tuneAyuntamiento(map) {
  for (const b of map.buildings || []) {
    if (!b.p.some(([x, z]) => Math.hypot(x - A[0], z - A[1]) < 0.5)) continue;
    if (!b.p.some(([x, z]) => Math.hypot(x - B[0], z - B[1]) < 0.5)) continue;
    b.h = ROOF; b.s = 0; b.ownFacade = true;
  }
  // el alcalde, en la entrada: delante de la puerta, un poco a un lado para que se vea
  const F = new Facade(), [x, z] = F.at(F.L / 2 + 1.0, 1.9);
  map.aytoDoor = { x, z, face: Math.atan2(F.nx, F.nz) };
  // banderas (José Manuel): España, Canarias y Europa en mástiles sobre la portada, y enfrente,
  // en el paseo del mar, solo la de España y más grande. row: 0 España, 1 Canarias, 2 Europa
  const sc = F.L / 2;
  map.aytoFlags = [
    ...[-1.4, 0, 1.4].map((ds, k) => { const [fx, fz] = F.at(sc + ds, 0.3); return { x: fx, z: fz, base: 7.7, h: 3.4, row: [1, 0, 2][k], s: 1 }; }),
    (() => { const [fx, fz] = F.at(sc, 17.5); return { x: fx, z: fz, base: 0, h: 12, row: 0, s: 2.2 }; })(),
  ];
}

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** arco de medio punto con las uv de 0 a 1 en su caja */
function archGeo(w, h) {
  const s = new THREE.Shape(), r = w / 2;
  s.moveTo(-r, 0); s.lineTo(r, 0); s.lineTo(r, h - r); s.absarc(0, h - r, r, 0, Math.PI, false); s.lineTo(-r, 0);
  const g = new THREE.ShapeGeometry(s, 12);
  const p = g.getAttribute('position'), uv = g.getAttribute('uv');
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + r) / w, p.getY(i) / h);
  return g;
}

/** puerta de dos hojas de cuarterones con el montante en abanico */
const doorTex = () => canvasTex(128, 256, (g, w, h) => {
  g.fillStyle = '#7b4a26'; g.fillRect(0, 0, w, h);
  const r = w / 2, fan = r;            // el abanico ocupa la parte de arriba
  g.fillStyle = '#2e3a44';
  g.beginPath(); g.arc(r, fan, r - 8, Math.PI, 0); g.fill();
  g.strokeStyle = '#7b4a26'; g.lineWidth = 4;
  for (let k = 1; k < 6; k++) { const a = Math.PI + (k / 6) * Math.PI; g.beginPath(); g.moveTo(r, fan); g.lineTo(r + Math.cos(a) * r, fan + Math.sin(a) * r); g.stroke(); }
  g.fillStyle = '#5e3519'; g.fillRect(0, fan, w, 6); g.fillRect(r - 2, fan, 4, h - fan);
  for (const x0 of [10, r + 8]) {
    for (const [y0, hh] of [[fan + 16, 52], [fan + 80, 36], [fan + 128, 52]]) {
      g.fillStyle = '#5e3519'; g.fillRect(x0, y0, r - 18, hh);
      g.fillStyle = '#8f5a30'; g.fillRect(x0 + 5, y0 + 5, r - 28, hh - 10);
    }
  }
  g.fillStyle = '#c9a24a'; g.fillRect(r - 9, fan + 108, 4, 14); g.fillRect(r + 5, fan + 108, 4, 14);
});

/** ventana alta en arco: marco marrón, cristal con el cielo, cuarterón de lamas abajo */
const windowTex = () => canvasTex(96, 192, (g, w, h) => {
  g.fillStyle = '#6b4a2e'; g.fillRect(0, 0, w, h);
  const grd = g.createLinearGradient(0, 0, 0, h * 0.62);
  grd.addColorStop(0, '#a9c0cf'); grd.addColorStop(1, '#4b5f6e');
  g.fillStyle = grd; g.fillRect(9, 9, w - 18, h * 0.62 - 9);
  g.fillStyle = '#6b4a2e';
  g.fillRect(w / 2 - 2, 0, 4, h * 0.62); g.fillRect(0, w / 2, w, 4);
  g.fillStyle = '#5a3c24'; g.fillRect(0, h * 0.62, w, 6);
  for (let y = h * 0.62 + 12; y < h - 8; y += 7) { g.fillStyle = '#7d5a3a'; g.fillRect(12, y, w - 24, 4); }
});

/** letras de bronce y el escudo */
const lettersTex = () => canvasTex(1024, 96, (g, w, h) => {
  g.font = 'bold 66px Georgia, "Times New Roman", serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = 'rgba(40,25,10,0.35)';
  g.fillText('AYUNTAMIENTO DE ARRECIFE', w / 2 + 3, h / 2 + 3);
  g.fillStyle = '#8e6b3a';
  g.fillText('AYUNTAMIENTO DE ARRECIFE', w / 2, h / 2);
});

/** marco de la fachada: s a lo largo (desde A), y arriba, d hacia la calle */
class Facade {
  constructor() {
    const L = Math.hypot(B[0] - A[0], B[1] - A[1]);
    Object.assign(this, { L, ux: (B[0] - A[0]) / L, uz: (B[1] - A[1]) / L });
    this.nx = this.uz; this.nz = -this.ux;   // hacia la avenida (sureste)
    if (this.nx < 0) { this.nx = -this.nx; this.nz = -this.nz; }
    this.solid = []; this.tex = new Map();
  }
  at(s, d) { return [A[0] + this.ux * s + this.nx * d, A[1] + this.uz * s + this.nz * d]; }
  /** pieza (mirando a +z en su sitio) llevada a la fachada */
  place(g, s, y, d) {
    const [x, z] = this.at(s, d);
    g.rotateY(Math.atan2(this.nx, this.nz));
    g.translate(x, y, z);
    return g;
  }
  box(s, y, d, w, h, t, hex) {
    const g = this.place(new THREE.BoxGeometry(w, h, t), s, y + h / 2, d + t / 2).toNonIndexed();
    g.deleteAttribute('uv');
    const c = new THREE.Color(hex), arr = new Float32Array(g.getAttribute('position').count * 3);
    for (let i = 0; i < arr.length; i += 3) arr.set([c.r, c.g, c.b], i);
    g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    this.solid.push(g);
  }
  flat(key, g, s, y, d) {
    if (!this.tex.has(key)) this.tex.set(key, []);
    this.tex.get(key).push(this.place(g, s, y, d).toNonIndexed());
  }
}

function lantern(F, s, glass) {
  F.box(s, 4.25, 0.14, 0.06, 0.06, 0.75, DARK);
  F.box(s, 3.95, 0.72, 0.34, 0.06, 0.34, DARK);
  F.box(s, 4.0, 0.74, 0.3, 0.46, 0.3, DARK);
  const g = new THREE.BoxGeometry(0.24, 0.38, 0.24);
  glass.push(F.place(g, s, 4.23, 0.89).toNonIndexed());
  const cap = new THREE.ConeGeometry(0.26, 0.28, 4);
  cap.rotateY(Math.PI / 4);
  glass.push(F.place(cap, s, 4.6, 0.89).toNonIndexed());
}

export function buildAyuntamiento(scene) {
  const group = new THREE.Group();
  group.name = 'ayuntamiento';
  const F = new Facade(), L = F.L, sc = L / 2;
  // lienzo blanco con zócalo, cornisa gris y albardilla (tapa la fachada del bloque genérico)
  F.box(L / 2, 0, 0.02, L, WALL_H, 0.12, WHITE);
  F.box(L / 2, 0, 0.1, L, 0.25, 0.08, GREY);
  F.box(L / 2, 5.4, 0.1, L + 0.2, 0.32, 0.28, GREY);
  F.box(L / 2, WALL_H - 0.1, 0.06, L + 0.1, 0.14, 0.24, GREY);
  // la portada adelantada, más alta, con su cornisa
  F.box(sc, 0, 0.14, 7.6, 7.7, 0.32, WHITE);
  F.box(sc, 6.05, 0.4, 7.9, 0.3, 0.2, GREY);
  F.box(sc, 7.6, 0.42, 7.8, 0.14, 0.12, GREY);
  // arco de cantería, hueco y puerta
  F.flat('stone', archGeo(4.4, 5.1), sc, 0, 0.47);
  F.flat('dark', archGeo(2.9, 4.35), sc, 0, 0.48);
  F.flat('door', archGeo(2.5, 4.15), sc, 0, 0.5);
  // paños de piedra a los lados con su ventanuco y repisas
  for (const k of [-1, 1]) {
    F.box(sc + k * 2.95, 0, 0.46, 1.45, 4.3, 0.06, STONE);
    F.box(sc + k * 2.95, 1.1, 0.52, 0.55, 2.2, 0.02, DARK);
    for (const y of [1.0, 3.35]) F.box(sc + k * 2.95, y, 0.5, 1.55, 0.12, 0.22, STONE);
  }
  F.flat('letters', new THREE.PlaneGeometry(5.6, 0.52), sc, 5.62, 0.47);
  // escudo
  const shield = new THREE.Shape();
  shield.moveTo(-0.25, 0.3); shield.lineTo(0.25, 0.3); shield.lineTo(0.25, -0.05); shield.quadraticCurveTo(0.25, -0.3, 0, -0.38); shield.quadraticCurveTo(-0.25, -0.3, -0.25, -0.05); shield.lineTo(-0.25, 0.3);
  F.flat('bronze', new THREE.ShapeGeometry(shield), sc, 6.85, 0.48);
  // ventanas altas en arco, menos donde está la portada
  for (let s = 3; s < L - 2; s += 4.6) {
    if (Math.abs(s - sc) < 6) continue;
    F.flat('frame', archGeo(1.75, 3.45), s, 0.45, 0.15);
    F.flat('window', archGeo(1.5, 3.25), s, 0.55, 0.16);
  }
  // dos puntos de recarga para coches eléctricos en el borde de la acera, a la derecha de la portada
  for (const s of [sc + 7, sc + 9.5]) {
    F.box(s, 0.2, 3.3, 0.5, 0.12, 0.38, 0x5b5d60);
    F.box(s, 0.32, 3.36, 0.36, 1.38, 0.26, 0xe9ebec);
    F.box(s, 1.7, 3.34, 0.4, 0.06, 0.3, 0x3c3f43);
    F.box(s, 1.08, 3.62, 0.22, 0.28, 0.012, 0x1d2a2e);
    F.box(s, 1.42, 3.62, 0.3, 0.05, 0.012, 0x34a853);
    F.box(s + 0.12, 0.55, 3.62, 0.08, 0.36, 0.05, 0x2a2c2f);
  }
  const glass = [];
  for (const k of [-1, 1]) lantern(F, sc + k * 3.95, glass);
  // torrecilla mirador de la azotea: base blanca, cristalera con montantes, cornisa y tejadillo
  const [mx, mz] = MIRADOR, oct = (r, h, open) => new THREE.CylinderGeometry(r, r, h, 8, 1, open, Math.PI / 8);
  const mir = [];
  const put = (g, y) => { g.translate(mx, y, mz); mir.push(g); return g; };
  put(oct(1.75, 0.7), ROOF + 0.35);
  put(oct(1.62, 0.15), ROOF + 2.55);
  const cap = put(new THREE.ConeGeometry(1.85, 0.8, 8, 1, false, Math.PI / 8), ROOF + 3.03);
  const glassT = canvasTex(64, 64, (g) => {
    g.fillStyle = '#2f3d48'; g.fillRect(0, 0, 64, 64);
    g.fillStyle = '#6b4a2e'; g.fillRect(0, 0, 6, 64); g.fillRect(29, 0, 4, 64); g.fillRect(0, 0, 64, 5); g.fillRect(0, 59, 64, 5);
  });
  glassT.wrapS = THREE.RepeatWrapping; glassT.repeat.set(8, 1);
  const mirGlass = oct(1.55, 1.8, true);
  mirGlass.translate(mx, ROOF + 1.6, mz);

  const add = (geos, mat, shadow = true) => {
    const m = new THREE.Mesh(mergeGeometries(geos, false), mat);
    m.castShadow = shadow; m.receiveShadow = true; group.add(m); return m;
  };
  add(F.solid, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 }));
  const plain = (hex, extra = {}) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.8, ...extra });
  const mats = {
    stone: plain(STONE), dark: plain(0x262220), bronze: plain(0x8e6b3a, { metalness: 0.5, roughness: 0.45 }), frame: plain(0x5a3c24),
    door: new THREE.MeshStandardMaterial({ map: doorTex(), roughness: 0.6 }),
    window: new THREE.MeshStandardMaterial({ map: windowTex(), roughness: 0.35 }),
    letters: new THREE.MeshStandardMaterial({ map: lettersTex(), transparent: true, alphaTest: 0.3, metalness: 0.4, roughness: 0.5 }),
  };
  for (const [key, geos] of F.tex) add(geos, mats[key], false);
  const lampMat = new THREE.MeshStandardMaterial({ color: 0xf6e7c0, emissive: 0xffd890, emissiveIntensity: 0.05, roughness: 0.4 });
  add(glass, lampMat, false);
  add([mir[0], mir[1]], plain(WHITE));
  add([cap], plain(0x4a3a2c));
  add([mirGlass], new THREE.MeshStandardMaterial({ map: glassT, roughness: 0.3, metalness: 0.2, side: THREE.DoubleSide }));
  // acera de losas gris oscuro delante de la fachada
  const walk = paveMesh(bandTris([F.at(0, 2.1), F.at(L, 2.1)], 3.8), 0.27, lightSlabs(), 0x77736e);
  if (walk) group.add(walk);
  scene.add(group);
  return { group, update() { lampMat.emissiveIntensity = 0.05 + windowGlow.value * 3; } };
}
