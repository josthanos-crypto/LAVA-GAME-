import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { windowGlow } from './realism.js';

/**
 * Edificio Atlántida (Multicines Atlántida, C/ León y Castillo 42), como en la
 * foto de José Manuel: sillería de piedra color arena, arcos altos de cristal
 * oscuro con su carpintería, tiendas abajo, la esquina redonda de cristal de
 * la Calle Real con la calle Emilio Ley, la marquesina curva con las letras
 * azules ATLANTIDA encima, las pancartas verdes de HiperDino entre los arcos y
 * la terraza de delante. Sustituye al bloque del mapa (skip; el choque se queda).
 * Detrás, la nave de los cines con su fachada al Charco: bajo de piedra con
 * soportal, lienzos blancos y el cuerpo central con el ventanal en arco, el
 * escudo redondo y el frontón con tejado a dos aguas.
 */

// esquinas del edificio del mapa: noroeste, noreste, sureste y suroeste (la redonda)
const NW = [68.3, 149.6], NE = [95.9, 139.4], SE = [114.3, 189.3], SW = [86.8, 199.5];
export const ATLANTIDA_CORNER = SW;
const H = 15, R = 5, BAY = 5.2;

function canvasTex(w, h, draw, alpha = false) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  let s = 7;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  draw(g, r);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (alpha) t.premultiplyAlpha = false;
  return t;
}

const PX = 384 / H;   // píxeles por metro en lo alto

/** sillería: hiladas de 60 cm con juntas a matajunta */
function ashlar(g, r, w, h) {
  g.fillStyle = '#8f7f69';
  g.fillRect(0, 0, w, h);
  const bh = 0.6 * PX;
  for (let y = 0, row = 0; y < h; y += bh, row++) {
    for (let x = (row % 2) * -16; x < w; x += 32) {
      const v = (r() - 0.5) * 16;
      g.fillStyle = `rgb(${190 + v},${170 + v},${142 + v})`;
      g.fillRect(x + 1, y + 1, 30, bh - 2);
    }
  }
}

/** un tramo de fachada: arco alto de cristal sobre la tienda de abajo */
const bayTex = () => canvasTex(128, 384, (g, r) => {
  ashlar(g, r, 128, 384);
  const y = (m) => 384 - m * PX;
  // tienda
  g.fillStyle = '#3a3532';
  g.fillRect(18, y(3.0), 92, y(0.15) - y(3.0));
  g.fillStyle = '#1e2328';
  g.fillRect(22, y(2.8), 84, y(0.25) - y(2.8));
  for (let i = 0; i < 6; i++) {
    g.fillStyle = `hsla(${r() * 360},45%,55%,0.35)`;
    g.fillRect(26 + r() * 64, y(1.6 + r() * 0.8), 10 + r() * 10, 18 + r() * 14);
  }
  // arco: marco de piedra, cristal oscuro y carpintería
  const x0 = 22, x1 = 106, rr = (x1 - x0) / 2, bot = y(3.5), top = y(13.2) + rr;
  g.fillStyle = '#7e705d';
  g.beginPath(); g.moveTo(x0 - 5, bot); g.lineTo(x0 - 5, top); g.arc(64, top, rr + 5, Math.PI, 0); g.lineTo(x1 + 5, bot); g.fill();
  const grd = g.createLinearGradient(0, top - rr, 0, bot);
  grd.addColorStop(0, '#2c3a48'); grd.addColorStop(1, '#141a20');
  g.fillStyle = grd;
  g.beginPath(); g.moveTo(x0, bot); g.lineTo(x0, top); g.arc(64, top, rr, Math.PI, 0); g.lineTo(x1, bot); g.fill();
  g.save();
  g.beginPath(); g.moveTo(x0, bot); g.lineTo(x0, top); g.arc(64, top, rr, Math.PI, 0); g.lineTo(x1, bot); g.clip();
  g.fillStyle = '#4d5359';
  for (const x of [x0 + rr * 0.66, 64 - 1.5, x1 - rr * 0.66]) g.fillRect(x, top - rr, 3, bot - top + rr);
  for (let yy = bot - 38; yy > top - rr; yy -= 38) g.fillRect(x0, yy, x1 - x0, 3);
  g.restore();
  // cornisa
  g.fillStyle = '#a8977d';
  g.fillRect(0, 0, 128, 0.7 * PX);
});

const plainTex = () => canvasTex(128, 384, (g, r) => ashlar(g, r, 128, 384));

/** la esquina redonda: montantes de cristal oscuro sobre la entrada */
const glassTex = () => canvasTex(64, 384, (g) => {
  const y = (m) => 384 - m * PX;
  g.fillStyle = '#1a222b';
  g.fillRect(0, 0, 64, 384);
  g.fillStyle = '#28323d';
  g.fillRect(0, y(13.5), 64, y(3.6) - y(13.5));
  g.fillStyle = '#56606a';
  for (let x = 0; x < 64; x += 16) g.fillRect(x, y(13.6), 2.5, y(3.6) - y(13.6));
  for (let m = 4.8; m < 13.5; m += 1.6) g.fillRect(0, y(m), 64, 2);
  g.fillStyle = '#b9a78e';
  g.fillRect(0, 0, 64, y(13.6));
  // la entrada: el vestíbulo iluminado con la cafetería al fondo
  g.fillStyle = '#5a4a3d';
  g.fillRect(0, y(3.3), 64, y(0) - y(3.3));
  g.fillStyle = '#e9d6b4';
  g.fillRect(0, y(3.3), 64, 4);
  g.fillStyle = 'rgba(255,228,180,0.8)';
  for (let x = 6; x < 64; x += 16) g.fillRect(x, y(3.05), 7, 3);
  g.fillStyle = '#8d7760';
  g.fillRect(4, y(1.1), 56, y(0.2) - y(1.1));
  g.fillStyle = 'rgba(120,170,200,0.55)';
  g.fillRect(10, y(2.6), 18, y(1.5) - y(2.6));
});

/** letras azules ATLANTIDA (transparente alrededor) */
const lettersTex = () => canvasTex(1024, 128, (g) => {
  g.font = 'bold 104px "Arial Narrow", Arial, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.lineWidth = 8;
  g.strokeStyle = '#e8edf5';
  g.strokeText('ATLANTIDA', 512, 68);
  g.fillStyle = '#3d68b4';
  g.fillText('ATLANTIDA', 512, 68);
}, true);

/** pancarta vertical de HiperDino: blanca con el borde verde, el dino arriba y el nombre en vertical */
const bannerTex = () => canvasTex(96, 384, (g) => {
  g.fillStyle = '#f4f3e8';
  g.fillRect(0, 0, 96, 384);
  g.fillStyle = '#1f7f3a';
  g.fillRect(0, 0, 96, 6); g.fillRect(0, 378, 96, 6); g.fillRect(0, 0, 6, 384); g.fillRect(90, 0, 6, 384);
  g.fillStyle = '#e8c21e';
  g.beginPath(); g.ellipse(48, 46, 30, 24, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#2f9a45';
  g.beginPath(); g.ellipse(52, 42, 22, 15, -0.3, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#ffffff';
  g.beginPath(); g.arc(60, 36, 5, 0, Math.PI * 2); g.fill();
  g.save();
  g.translate(50, 230);
  g.rotate(-Math.PI / 2);
  g.font = 'bold 50px Arial, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#1f7f3a';
  g.fillText('HiperDino', 0, 0);
  g.font = 'bold 15px Arial, sans-serif';
  g.fillStyle = '#c9a412';
  g.fillText('Supermercado', 0, 30);
  g.restore();
});

/** pared vertical de A a B con la textura repetida en tramos enteros; normal hacia fuera */
function wall(A, B, tiles) {
  const L = Math.hypot(B[0] - A[0], B[1] - A[1]);
  const g = new THREE.PlaneGeometry(L, H);
  const uv = g.getAttribute('uv');
  for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * tiles);
  g.rotateY(Math.atan2(-(B[1] - A[1]), B[0] - A[0]));
  g.translate((A[0] + B[0]) / 2, H / 2, (A[1] + B[1]) / 2);
  return g;
}

export function tuneAtlantida(map) {
  const [cx, cz] = [(NW[0] + SE[0]) / 2, (NW[1] + SE[1]) / 2];
  for (const b of map.buildings || []) {
    const n = b.p.length - 1;
    const bx = b.p.slice(0, n).reduce((s, q) => s + q[0], 0) / n, bz = b.p.slice(0, n).reduce((s, q) => s + q[1], 0) / n;
    if (Math.hypot(bx - cx, bz - cz) < 2) { b.skip = true; b.atlantida = true; }
    // la nave de los cines, detrás: más alta, blanca y sin escaparates (la fachada del Charco va en cines())
    if (Math.hypot(bx - 125.3, bz - 156.9) < 2) { b.h = 10; b.s = 0; b.c = [238, 236, 230]; b.cines = true; }
  }
  // terraza delante de la fachada de Emilio Ley: mesas redondas con sillas de madera
  const P = (map.extraProps ||= []);
  const u = [(SE[0] - SW[0]) / 29.3, (SE[1] - SW[1]) / 29.3], n = [u[1], -u[0]];
  for (const t of [9, 13, 17]) {
    const x = SW[0] + u[0] * t - n[0] * 2.4, z = SW[1] + u[1] * t - n[1] * 2.4;
    P.push({ t: 'table', x, z, a: 0 });
    for (const s of [-1, 1]) P.push({ t: 'chair', x: x + u[0] * 0.7 * s, z: z + u[1] * 0.7 * s, a: Math.atan2(-u[0] * s, -u[1] * s), c: 0x6b4a2e });
  }
}

// la fachada de los cines que da al Charco: de la esquina sur (CS) a la norte (CN), mirando al agua
const CS = [154.7, 174.4], CN = [136.2, 124.5];

/** bajo de piedra gris con los huecos del soportal (un tramo de 3 m × 3,6 m) */
const porticoTex = () => canvasTex(96, 116, (g, r) => {
  g.fillStyle = '#8a8378'; g.fillRect(0, 0, 96, 116);
  for (let y = 0; y < 116; y += 14) for (let x = (y / 14 % 2) * -12; x < 96; x += 24) {
    const v = (r() - 0.5) * 12;
    g.fillStyle = `rgb(${164 + v},${157 + v},${146 + v})`; g.fillRect(x + 1, y + 1, 22, 12);
  }
  g.fillStyle = '#eceae4'; g.fillRect(16, 16, 64, 96);
  g.fillStyle = '#1d2329'; g.fillRect(20, 20, 56, 92);
  g.fillStyle = 'rgba(255,220,160,0.25)'; g.fillRect(24, 70, 48, 30);
  g.fillStyle = '#eceae4'; g.fillRect(46, 20, 4, 92); g.fillRect(20, 60, 56, 3);
});

/** el ventanal en arco de cristal oscuro con sus montantes */
const archGlassTex = () => canvasTex(128, 192, (g) => {
  const grd = g.createLinearGradient(0, 0, 0, 192);
  grd.addColorStop(0, '#34485a'); grd.addColorStop(1, '#141b22');
  g.fillStyle = grd; g.fillRect(0, 0, 128, 192);
  g.fillStyle = '#5b6168';
  for (let x = 0; x < 128; x += 16) g.fillRect(x, 0, 3, 192);
  for (let y = 40; y < 192; y += 30) g.fillRect(0, y, 128, 2);
});

function cines(group) {
  const L = Math.hypot(CN[0] - CS[0], CN[1] - CS[1]);
  const ux = (CN[0] - CS[0]) / L, uz = (CN[1] - CS[1]) / L, nx = -uz, nz = ux;   // n: hacia el agua (este)
  const rot = Math.atan2(nx, nz);
  // todo va 0,35 m por fuera de la pared del bloque, para tapar sus ventanas y repisas
  const place = (g, s, y, d) => { d += 0.35; g.rotateY(rot); g.translate(CS[0] + ux * s + nx * d, y, CS[1] + uz * s + nz * d); return g; };
  const solid = [], white = 0xf1efe9, grey = 0x8f8a82;
  // caja de ancho w, alto h y fondo t con la base en y y la cara de atrás en d
  const box = (s, y, d, w, h, t, hex, rz = 0) => {
    const g = new THREE.BoxGeometry(w, h, t);
    if (rz) g.rotateZ(rz);
    const q = place(g, s, y + h / 2, d + t / 2).toNonIndexed();
    q.deleteAttribute('uv');
    const c = new THREE.Color(hex), arr = new Float32Array(q.getAttribute('position').count * 3);
    for (let i = 0; i < arr.length; i += 3) arr.set([c.r, c.g, c.b], i);
    q.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    solid.push(q);
  };
  const S0 = 15, S1 = 31, SC = (S0 + S1) / 2, W = S1 - S0, D = 1.3;
  // lienzo blanco, cornisa gris sobre el bajo y albardilla arriba
  box(L / 2, 0, 0.02, L, 10.2, 0.12, white);
  box(L / 2, 3.6, 0.14, L, 0.35, 0.3, grey);
  box(L / 2, 10.0, 0.06, L + 0.1, 0.2, 0.26, grey);
  // el cuerpo del centro, adelantado, con su frontón y el tejado a dos aguas hacia dentro
  box(SC, 3.95, 0.14, W, 7.05, D, white);
  const pedH = 3, half = W / 2, slope = Math.atan2(pedH, half), edge = Math.hypot(half, pedH);
  const tri = new THREE.Shape();
  tri.moveTo(-half, 0); tri.lineTo(half, 0); tri.lineTo(0, pedH); tri.lineTo(-half, 0);
  const ped = place(new THREE.ShapeGeometry(tri), SC, 11.0, 0.14 + D).toNonIndexed();
  ped.deleteAttribute('uv');
  const pc = new THREE.Color(white), parr = new Float32Array(ped.getAttribute('position').count * 3);
  for (let i = 0; i < parr.length; i += 3) parr.set([pc.r, pc.g, pc.b], i);
  ped.setAttribute('color', new THREE.BufferAttribute(parr, 3));
  solid.push(ped);
  for (const k of [-1, 1]) {
    box(SC + k * half / 2, 11.0 + pedH / 2 - 0.225, 0.14 + D - 0.275, edge + 0.3, 0.25, 0.35, grey, -k * slope);
    box(SC + k * half / 2, 11.0 + pedH / 2 - 0.195, -18, edge + 0.3, 0.15, 19, 0xa29d94, -k * slope);
  }
  // soportal: marquesina blanca con canto gris sobre pilares
  box(SC, 3.3, 0.14 + D, W, 0.4, 2.2, white);
  box(SC, 3.25, 0.14 + D + 2.2, W, 0.12, 0.08, grey);
  for (let i = 0; i < 5; i++) {
    const p = new THREE.CylinderGeometry(0.2, 0.2, 3.3, 10);
    const q = place(p, S0 + 0.6 + i * (W - 1.2) / 4, 1.65, 0.14 + D + 1.9).toNonIndexed();
    q.deleteAttribute('uv');
    const c = new THREE.Color(white), arr = new Float32Array(q.getAttribute('position').count * 3);
    for (let j = 0; j < arr.length; j += 3) arr.set([c.r, c.g, c.b], j);
    q.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    solid.push(q);
  }
  // el bajo de piedra con los huecos, el ventanal en arco y el escudo redondo de arriba
  const low = new THREE.PlaneGeometry(L, 3.6);
  const luv = low.getAttribute('uv');
  for (let i = 0; i < luv.count; i++) luv.setX(i, luv.getX(i) * Math.round(L / 3));
  place(low, L / 2, 1.8, 0.15);
  const lowT = porticoTex(); lowT.wrapS = THREE.RepeatWrapping;
  const archW = 9.2, archH = 8.2, ar = archW / 2, sh = new THREE.Shape();
  sh.moveTo(-ar, 0); sh.lineTo(ar, 0); sh.lineTo(ar, archH - ar); sh.absarc(0, archH - ar, ar, 0, Math.PI, false); sh.lineTo(-ar, 0);
  const arch = new THREE.ShapeGeometry(sh, 16);
  const ap = arch.getAttribute('position'), auv = arch.getAttribute('uv');
  for (let i = 0; i < ap.count; i++) auv.setXY(i, (ap.getX(i) + ar) / archW, ap.getY(i) / archH);
  place(arch, SC, 4.35, 0.14 + D + 0.02);
  const frame = new THREE.ShapeGeometry(sh, 16);
  frame.scale(1.08, 1.04, 1);
  place(frame, SC, 4.2, 0.14 + D + 0.01);
  const ring = place(new THREE.RingGeometry(0.55, 0.78, 28), SC, 11.3, 0.14 + D + 0.04);
  const disc = place(new THREE.CircleGeometry(0.55, 28), SC, 11.3, 0.14 + D + 0.035);
  const meshes = [
    new THREE.Mesh(mergeGeometries(solid, false), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, side: THREE.DoubleSide })),
    new THREE.Mesh(low, new THREE.MeshStandardMaterial({ map: lowT, roughness: 0.85 })),
    new THREE.Mesh(arch, new THREE.MeshStandardMaterial({ map: archGlassTex(), roughness: 0.25, metalness: 0.3 })),
    new THREE.Mesh(frame, new THREE.MeshStandardMaterial({ color: 0x9a958c, roughness: 0.8 })),
    new THREE.Mesh(ring, new THREE.MeshStandardMaterial({ color: 0xe8e5de, roughness: 0.6 })),
    new THREE.Mesh(disc, new THREE.MeshStandardMaterial({ color: 0x7d7a74, roughness: 0.6 })),
  ];
  for (const m of meshes) { m.castShadow = true; m.receiveShadow = true; group.add(m); }
}

export function buildAtlantida(scene) {
  const group = new THREE.Group();
  group.name = 'atlantida';
  // la esquina suroeste, redondeada con radio R
  const uW = [(NW[0] - SW[0]) / Math.hypot(NW[0] - SW[0], NW[1] - SW[1]), (NW[1] - SW[1]) / Math.hypot(NW[0] - SW[0], NW[1] - SW[1])];
  const uS = [(SE[0] - SW[0]) / Math.hypot(SE[0] - SW[0], SE[1] - SW[1]), (SE[1] - SW[1]) / Math.hypot(SE[0] - SW[0], SE[1] - SW[1])];
  const tW = [SW[0] + uW[0] * R, SW[1] + uW[1] * R], tS = [SW[0] + uS[0] * R, SW[1] + uS[1] * R];
  const C = [SW[0] + (uW[0] + uS[0]) * R, SW[1] + (uW[1] + uS[1]) * R];
  // el arco corto de tW a tS (el que da a la esquina)
  const aS = Math.atan2(tS[0] - C[0], tS[1] - C[1]), aW = Math.atan2(tW[0] - C[0], tW[1] - C[1]);
  let a0 = aW, da = aS - aW;
  da = ((da % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  if (da > Math.PI) { a0 = aS; da = Math.PI * 2 - da; }
  // paredes: wall(A, B) mira a la derecha de A → B, así que se recorre con la calle a la derecha
  const lenOf = (A, B) => Math.hypot(B[0] - A[0], B[1] - A[1]);
  const front = [wall(tS, SE, Math.round(lenOf(SE, tS) / BAY)), wall(NW, tW, Math.round(lenOf(tW, NW) / BAY))];
  const back = [wall(NE, NW, Math.round(lenOf(NW, NE) / BAY)), wall(SE, NE, Math.round(lenOf(NE, SE) / BAY))];
  const corner = new THREE.CylinderGeometry(R, R, H, 20, 1, true, a0, da);
  const cuv = corner.getAttribute('uv');
  for (let i = 0; i < cuv.count; i++) cuv.setX(i, cuv.getX(i) * 6);
  corner.translate(C[0], H / 2, C[1]);
  const mat = (map, extra = {}) => new THREE.MeshStandardMaterial({ map, roughness: 0.8, ...extra });
  const bayT = bayTex(), plainT = plainTex(), glassT = glassTex();
  const meshes = [
    new THREE.Mesh(mergeGeometries(front, false), mat(bayT)),
    new THREE.Mesh(mergeGeometries(back, false), mat(plainT)),
    new THREE.Mesh(corner, mat(glassT, { roughness: 0.35, metalness: 0.25, side: THREE.DoubleSide })),
  ];
  // azotea
  const pts = [NW, NE, SE];
  for (let i = 0; i <= 12; i++) {
    const a = a0 + (da * i) / 12;
    pts.push([C[0] + Math.sin(a) * R, C[1] + Math.cos(a) * R]);
  }
  const shape = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  const roof = new THREE.ShapeGeometry(shape);
  roof.rotateX(-Math.PI / 2);
  roof.translate(0, H, 0);
  meshes.push(new THREE.Mesh(roof, new THREE.MeshStandardMaterial({ color: 0x9b958b, roughness: 0.95, side: THREE.DoubleSide })));
  // marquesina curva de la entrada y las letras encima
  const canopy = new THREE.CylinderGeometry(R + 1.9, R + 1.9, 0.5, 24, 1, false, a0 + 0.12, da - 0.24);
  canopy.translate(C[0], 3.45, C[1]);
  meshes.push(new THREE.Mesh(canopy, new THREE.MeshStandardMaterial({ color: 0xcbbb9f, roughness: 0.8 })));
  const lt = lettersTex();
  const letters = new THREE.CylinderGeometry(R + 1.6, R + 1.6, 0.85, 24, 1, true, a0 + 0.2, da - 0.4);
  letters.translate(C[0], 4.15, C[1]);
  const lettersMat = new THREE.MeshStandardMaterial({ map: lt, transparent: true, alphaTest: 0.3, roughness: 0.5, emissive: 0x3d68b4, emissiveMap: lt, emissiveIntensity: 0 });
  meshes.push(new THREE.Mesh(letters, lettersMat));
  // pilares de sillería a los dos lados del cristal y tres escalones curvos bajo la marquesina (foto de la entrada)
  const piers = [];
  for (const [P, u, n] of [[tW, uW, [uW[1], -uW[0]]], [tS, uS, [-uS[1], uS[0]]]]) {
    const g = new THREE.BoxGeometry(1.4, H, 0.5);
    g.rotateY(Math.atan2(-u[1], u[0]));
    g.translate(P[0] + u[0] * 0.7 + n[0] * 0.25, H / 2, P[1] + u[1] * 0.7 + n[1] * 0.25);
    piers.push(g);
  }
  meshes.push(new THREE.Mesh(mergeGeometries(piers, false), mat(plainT)));
  const steps = [];
  for (let i = 0; i < 3; i++) {
    const r = R + 1.6 - i * 0.45;
    const g = new THREE.CylinderGeometry(r, r, 0.16, 24, 1, false, a0 + 0.12, da - 0.24);
    g.translate(C[0], 0.2 + 0.08 + i * 0.16, C[1]);
    steps.push(g);
  }
  meshes.push(new THREE.Mesh(mergeGeometries(steps, false), new THREE.MeshStandardMaterial({ color: 0xb9b2a6, roughness: 0.85 })));
  // pancartas de HiperDino entre los arcos de las dos fachadas
  const bt = bannerTex(), banners = [];
  for (const [A, B] of [[tS, SE], [NW, tW]]) {
    const L = lenOf(A, B), n = Math.round(L / BAY), ux = (B[0] - A[0]) / L, uz = (B[1] - A[1]) / L, nx = -uz, nz = ux;
    for (let k = 1; k < n; k += 2) {
      const t = k * (L / n);
      const g = new THREE.PlaneGeometry(1.0, 3.8);
      g.rotateY(Math.atan2(nx, nz));
      g.translate(A[0] + ux * t + nx * 0.35, 8.2, A[1] + uz * t + nz * 0.35);
      banners.push(g);
    }
  }
  meshes.push(new THREE.Mesh(mergeGeometries(banners, false), new THREE.MeshStandardMaterial({ map: bt, roughness: 0.7, side: THREE.DoubleSide })));
  for (const m of meshes) { m.castShadow = true; m.receiveShadow = true; group.add(m); }
  // y la fachada de los cines que da al Charco (foto de José Manuel)
  cines(group);
  scene.add(group);
  return { group, update() { lettersMat.emissiveIntensity = windowGlow.value * 1.6; } };
}
