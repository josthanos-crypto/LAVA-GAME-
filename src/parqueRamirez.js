import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { windowGlow } from './realism.js';
import { lightSlabs, herringbone, paveMesh, polyTris, bandTris, discTris } from './suelos.js';

/**
 * Parque José Ramírez Cerdá, en el paseo de la Avenida La Marina, como en las
 * fotos de José Manuel: el kiosco de la música (octógono de madera barnizada
 * con puerta en arco y ojos de buey, balcón con barandilla, tejadillo con
 * flecos, pináculos blancos y la cúpula blanca con su medallón), el kiosco
 * verde de los cuadros blancos, el suelo de ladrillo rojizo en espiga con
 * franjas grises, losas claras, la franja rosada junto al muro del mar y las
 * farolas de bola blanca en poste verde. Los dos kioscos sustituyen a sus
 * bloques del mapa (extraData.js les pone skip; el choque se queda).
 */

export const KIOSCO_MUSICA = [76.45, 505.32];
export const KIOSCO_VERDE = [170.99, 468.51];

// orilla (del mapa, un poco hacia tierra) y borde de la acera de la avenida
const SHORE = [[-30, 571.9], [76.2, 517.7], [103.8, 504.7], [113.1, 500.4], [181.9, 468.9], [187.2, 465.9], [200, 459.9]];
const AVENUE = [[-30, 531], [112, 478], [150, 464], [182, 455], [200, 450]];

const WOOD = 0xc4743a, WOOD_DARK = 0x7a4220, WHITE = 0xf3f1ea, STONE = 0x9a948a, GLASS = 0x2a2522;
const GREEN = 0x2e6b3c, POST_GREEN = 0x23452f;

function canvas(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** tablas verticales de madera barnizada */
const planks = () => canvas(128, 64, (g, w, h) => {
  g.fillStyle = '#d0813f';
  g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 16) {
    g.fillStyle = `rgba(90,40,10,${0.08 + (x % 48) / 400})`;
    g.fillRect(x, 0, 16, h);
    g.fillStyle = 'rgba(60,25,8,0.55)';
    g.fillRect(x, 0, 1.5, h);
  }
});
/** barandilla de balaustres (lo transparente se recorta) */
const balusters = () => canvas(64, 64, (g) => {
  g.fillStyle = '#7a3f1d';
  g.fillRect(0, 0, 64, 9);
  g.fillRect(0, 56, 64, 8);
  for (let x = 4; x < 64; x += 16) { g.fillRect(x, 9, 7, 47); g.fillRect(x - 2, 26, 11, 6); }
});
/** calado en arco entre poste y poste */
const valance = () => canvas(128, 64, (g) => {
  g.fillStyle = '#8a4a22';
  g.fillRect(0, 0, 128, 64);
  g.globalCompositeOperation = 'destination-out';
  g.beginPath();
  g.ellipse(64, 64, 56, 44, 0, Math.PI, 0);
  g.fill();
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = '#f3efe4';
  for (let x = 10; x < 128; x += 18) g.fillRect(x, 5, 6, 6);
});
/** flecos festoneados bajo el alero */
const fringe = () => canvas(128, 32, (g) => {
  g.fillStyle = '#7a3f1d';
  g.fillRect(0, 0, 128, 14);
  for (let x = 0; x < 128; x += 21.33) { g.beginPath(); g.arc(x + 10.66, 14, 10.66, 0, Math.PI); g.fill(); }
});
/** cara del kiosco verde: cuadro blanco abajo, celosía blanca arriba, marcos verdes */
const greenFace = () => canvas(128, 160, (g) => {
  g.fillStyle = '#2e6b3c';
  g.fillRect(0, 0, 128, 160);
  g.fillStyle = '#f1f0ea';
  g.fillRect(0, 0, 128, 6); g.fillRect(0, 88, 128, 6); g.fillRect(0, 154, 128, 6);
  g.fillRect(16, 102, 96, 44);
  g.fillStyle = '#2e6b3c';
  g.fillRect(24, 110, 80, 28);
  g.fillStyle = '#f1f0ea';
  g.fillRect(30, 116, 68, 16);
  g.fillStyle = '#28383a';
  g.fillRect(12, 16, 104, 66);
  g.strokeStyle = '#f1f0ea';
  g.lineWidth = 3;
  g.save();
  g.beginPath(); g.rect(12, 16, 104, 66); g.clip();
  for (let k = -80; k < 140; k += 16) {
    g.beginPath(); g.moveTo(12 + k, 16); g.lineTo(12 + k + 66, 82); g.stroke();
    g.beginPath(); g.moveTo(12 + k + 66, 16); g.lineTo(12 + k, 82); g.stroke();
  }
  g.restore();
});

/** cubos de piezas que comparten material; al final se juntan en una malla por material */
class Pieces {
  constructor(cx, cz) { this.cx = cx; this.cz = cz; this.b = new Map(); }
  /** pieza en coordenadas locales del kiosco (girada phi alrededor del eje) */
  add(key, g, x = 0, y = 0, z = 0, phi = 0) {
    const geo = g.index ? g.toNonIndexed() : g;
    if (phi) geo.rotateY(phi);
    geo.translate(this.cx + x, y, this.cz + z);
    if (!this.b.has(key)) this.b.set(key, []);
    this.b.get(key).push(geo);
  }
  /** pieza pegada a la cara k del octógono (normal a k·45°), a distancia d del centro */
  face(key, g, k, d, y, side = 0) {
    const phi = k * Math.PI / 4, s = Math.sin(phi), c = Math.cos(phi);
    this.add(key, g, s * d + c * side, y, c * d - s * side, phi);
  }
  build(group, mats) {
    for (const [key, geos] of this.b) {
      const m = new THREE.Mesh(mergeGeometries(geos, false), mats[key]);
      m.castShadow = true;
      m.receiveShadow = true;
      group.add(m);
    }
  }
}

const oct = (r, h, open = false) => new THREE.CylinderGeometry(r, r, h, 8, 1, open, Math.PI / 8);
const arch = (w, h) => {
  const s = new THREE.Shape(), r = w / 2;
  s.moveTo(-r, 0); s.lineTo(r, 0); s.lineTo(r, h - r); s.absarc(0, h - r, r, 0, Math.PI, false); s.lineTo(-r, 0);
  return new THREE.ShapeGeometry(s, 8);
};

/** kiosco de la música: unos 11 m con el alero y 10 m hasta la punta de la cúpula */
function kioscoMusica(group) {
  const P = new Pieces(...KIOSCO_MUSICA);
  const R = 3.75, ap = R * Math.cos(Math.PI / 8), top = 3.3;
  P.add('stone', oct(R + 0.2, 0.35), 0, 0.175);
  P.add('planks', oct(R, top - 0.35), 0, 0.35 + (top - 0.35) / 2);
  for (let k = 0; k < 8; k++) {
    const a = (k + 0.5) * Math.PI / 4;
    P.add('dark', new THREE.BoxGeometry(0.24, top - 0.35, 0.24), Math.sin(a) * R, 0.35 + (top - 0.35) / 2, Math.cos(a) * R);
    if (k === 0 || k === 4) {
      // puerta en arco con su marco
      P.face('dark', arch(1.55, 2.55), k, ap + 0.02, 0.35);
      P.face('door', arch(1.25, 2.4), k, ap + 0.04, 0.35);
    } else {
      // ojo de buey con su aro, arquillo encima y cuarterón debajo
      P.face('dark', new THREE.RingGeometry(0.42, 0.56, 20), k, ap + 0.03, 2.05);
      P.face('glass', new THREE.CircleGeometry(0.42, 20), k, ap + 0.02, 2.05);
      P.face('dark', new THREE.PlaneGeometry(1.1, 0.75), k, ap + 0.02, 0.95);
      P.face('planks', new THREE.PlaneGeometry(0.9, 0.55), k, ap + 0.04, 0.95);
    }
  }
  // cornisa, suelo del balcón y barandilla
  P.add('dark', oct(R + 0.3, 0.22), 0, top - 0.05);
  P.add('dark', oct(4.6, 0.24), 0, top + 0.18);
  P.add('rail', oct(4.45, 0.95, true), 0, top + 0.3 + 0.475);
  P.add('dark', oct(4.5, 0.08, true), 0, top + 1.27);
  // postes, calado entre postes, techo, alero con flecos, pináculos y cúpula
  const y0 = top + 0.3, y1 = 6.05;
  for (let k = 0; k < 8; k++) {
    const a = (k + 0.5) * Math.PI / 4;
    P.add('dark', new THREE.BoxGeometry(0.2, y1 - y0, 0.2), Math.sin(a) * 4.3, (y0 + y1) / 2, Math.cos(a) * 4.3);
  }
  P.add('valance', oct(4.32, 0.75, true), 0, y1 - 0.375);
  P.add('planks', oct(R - 0.6, y1 - y0), 0, (y0 + y1) / 2);
  P.add('dark', new THREE.CylinderGeometry(3.7, 5.3, 0.55, 8, 1, false, Math.PI / 8), 0, y1 + 0.275);
  P.add('fringe', oct(5.32, 0.42, true), 0, y1 - 0.15);
  for (let k = 0; k < 16; k++) {
    const a = k * Math.PI / 8, r = 4.75;
    P.add('white', new THREE.SphereGeometry(0.11, 8, 6), Math.sin(a) * r, y1 + 0.32, Math.cos(a) * r);
    P.add('white', new THREE.ConeGeometry(0.08, 0.5, 6), Math.sin(a) * r, y1 + 0.64, Math.cos(a) * r);
  }
  const prof = [];
  for (let i = 0; i <= 14; i++) {
    const t = i / 14, a = t * Math.PI / 2;
    prof.push(new THREE.Vector2(Math.max(0.001, 3.7 * Math.cos(a)), 3.3 * Math.sin(a) + 0.35 * t ** 6));
  }
  P.add('dome', new THREE.LatheGeometry(prof, 28), 0, y1 + 0.55);
  // medallón de madera en la cúpula, hacia el paseo y hacia la avenida
  for (const phi of [Math.PI * 1.5, Math.PI * 0.5]) {
    const lift = 0.34, rr = 3.56, yy = y1 + 0.55 + 1.12;
    const d = new THREE.CircleGeometry(0.52, 20); d.rotateX(-lift);
    const ring = new THREE.RingGeometry(0.52, 0.64, 20); ring.rotateX(-lift);
    P.add('dark', ring, Math.sin(phi) * rr, yy, Math.cos(phi) * rr, phi);
    d.translate(0, 0, 0.01);
    P.add('door', d, Math.sin(phi) * rr, yy, Math.cos(phi) * rr, phi);
  }
  const plank = planks(); plank.repeat.set(8, 1);
  const rail = balusters(); rail.repeat.set(8 * 12 / 4, 1);
  const val = valance(); val.repeat.set(8, 1);
  const fr = fringe(); fr.repeat.set(16, 1);
  const cut = (map) => new THREE.MeshStandardMaterial({ map, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.6 });
  P.build(group, {
    stone: new THREE.MeshStandardMaterial({ color: STONE, roughness: 0.9 }),
    planks: new THREE.MeshStandardMaterial({ map: plank, roughness: 0.55, side: THREE.DoubleSide }),
    dark: new THREE.MeshStandardMaterial({ color: WOOD_DARK, roughness: 0.6, side: THREE.DoubleSide }),
    door: new THREE.MeshStandardMaterial({ color: WOOD, roughness: 0.55 }),
    glass: new THREE.MeshStandardMaterial({ color: GLASS, roughness: 0.2, metalness: 0.3 }),
    white: new THREE.MeshStandardMaterial({ color: WHITE, roughness: 0.7 }),
    dome: new THREE.MeshStandardMaterial({ color: WHITE, roughness: 0.75, side: THREE.DoubleSide }),
    rail: cut(rail), valance: cut(val), fringe: cut(fr),
  });
}

/** kiosco verde de la cafetería: octógono de 5 m con cuadros blancos, celosía y cupulín */
function kioscoVerde(group) {
  const P = new Pieces(...KIOSCO_VERDE);
  const R = 2.55, h = 2.5;
  P.add('stone', oct(R + 0.2, 0.25), 0, 0.125);
  P.add('face', oct(R, h), 0, 0.25 + h / 2);
  for (let k = 0; k < 8; k++) {
    const a = (k + 0.5) * Math.PI / 4;
    P.add('white', new THREE.BoxGeometry(0.13, h, 0.13), Math.sin(a) * R, 0.25 + h / 2, Math.cos(a) * R);
  }
  const yr = 0.25 + h;
  P.add('white', oct(3.15, 0.2, true), 0, yr + 0.05);
  P.add('green', new THREE.CylinderGeometry(1.0, 3.15, 0.75, 8, 1, false, Math.PI / 8), 0, yr + 0.15 + 0.375);
  P.add('white', oct(0.98, 0.32), 0, yr + 0.9 + 0.16);
  P.add('green', new THREE.SphereGeometry(0.95, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0, yr + 1.22);
  P.add('white', new THREE.SphereGeometry(0.13, 8, 6), 0, yr + 2.25);
  P.add('white', new THREE.ConeGeometry(0.07, 0.45, 6), 0, yr + 2.55);
  const ft = greenFace(); ft.repeat.set(8, 1);
  P.build(group, {
    stone: new THREE.MeshStandardMaterial({ color: STONE, roughness: 0.9 }),
    face: new THREE.MeshStandardMaterial({ map: ft, roughness: 0.6 }),
    white: new THREE.MeshStandardMaterial({ color: WHITE, roughness: 0.6, side: THREE.DoubleSide }),
    green: new THREE.MeshStandardMaterial({ color: GREEN, roughness: 0.55 }),
  });
}

/** la línea a d metros de otra (d > 0: a la derecha según se avanza) */
function offsetLine(line, d) {
  return line.map((p, i) => {
    const a = line[Math.max(0, i - 1)], b = line[Math.min(line.length - 1, i + 1)];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [p[0] - (b[1] - a[1]) / L * d, p[1] + (b[0] - a[0]) / L * d];
  });
}

/** los puntos de una línea cada 'step' metros */
function along(line, step, from = 0) {
  const out = [];
  let left = from;
  for (let i = 0; i < line.length - 1; i++) {
    const [ax, az] = line[i], [bx, bz] = line[i + 1];
    const L = Math.hypot(bx - ax, bz - az);
    for (let t = left; t <= L; t += step) out.push([ax + (bx - ax) * t / L, az + (bz - az) * t / L]);
    left = (left - L) % step;
    if (left < 0) left += step;
  }
  return out;
}

function paving(group) {
  // losas claras de la avenida al mar (por debajo de jardines, parque infantil y caminos del mapa)
  const base = paveMesh(polyTris([...AVENUE, ...SHORE.slice().reverse()]), 0.11, lightSlabs());
  // ladrillo en espiga: la banda larga, la que cruza hacia el mar, la del kiosco a la avenida y el redondel del kiosco
  const [kx, kz] = KIOSCO_MUSICA;
  const tris = [
    ...bandTris([[-30, 545], [kx - 7.5, 511.5]], 7),
    ...bandTris([[-3, 521], [11, 552]], 7),
    ...bandTris([[69, 487], [kx - 1, kz - 6]], 8.5),
    ...discTris(kx, kz, 8.5, 40),
  ];
  const red = paveMesh(tris, 0.139, herringbone());
  // franja rosada pegada al muro del mar
  const pink = paveMesh(bandTris(offsetLine(SHORE, -1.6), 2.2), 0.14, herringbone(), 0xffd2c8);
  for (const m of [base, red, pink]) if (m) group.add(m);
}

/** farolas de bola blanca en poste verde, a lo largo del muro del mar y a los lados del kiosco */
function lamps(group) {
  const clear = ([x, z]) => [KIOSCO_MUSICA, KIOSCO_VERDE].every(([kx, kz]) => Math.hypot(x - kx, z - kz) > 7);
  const spots = along(offsetLine(SHORE, -4.2), 17, 6).filter(clear);
  const [kx, kz] = KIOSCO_MUSICA;
  spots.push([kx - 9, kz - 6.5], [kx + 9, kz - 6.5]);
  const posts = [], globes = [];
  for (const [x, z] of spots) {
    const base = new THREE.CylinderGeometry(0.16, 0.2, 0.6, 10); base.translate(x, 0.3, z);
    const post = new THREE.CylinderGeometry(0.06, 0.08, 3.6, 8); post.translate(x, 2.4, z);
    const cup = new THREE.CylinderGeometry(0.14, 0.08, 0.18, 10); cup.translate(x, 4.25, z);
    posts.push(base, post, cup);
    const g = new THREE.SphereGeometry(0.27, 14, 10); g.translate(x, 4.6, z);
    globes.push(g);
  }
  const postMesh = new THREE.Mesh(mergeGeometries(posts, false), new THREE.MeshStandardMaterial({ color: POST_GREEN, roughness: 0.5, metalness: 0.3 }));
  postMesh.castShadow = true;
  const globeMat = new THREE.MeshStandardMaterial({ color: 0xfbfaf4, emissive: 0xfff0c8, emissiveIntensity: 0.05, roughness: 0.3 });
  group.add(postMesh, new THREE.Mesh(mergeGeometries(globes, false), globeMat));
  return { mat: globeMat, count: spots.length };
}

export function buildParqueRamirez(scene) {
  const group = new THREE.Group();
  group.name = 'parqueRamirezCerda';
  paving(group);
  kioscoMusica(group);
  kioscoVerde(group);
  const L = lamps(group);
  scene.add(group);
  return {
    group,
    lamps: L.count,
    update() { L.mat.emissiveIntensity = 0.05 + windowGlow.value * 4; },
  };
}
