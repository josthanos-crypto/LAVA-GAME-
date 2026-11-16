/**
 * La esquina de Calle Guenia con Calle Manolo Millares, como en la foto:
 * el bloque blanco de cinco plantas de la acera del este, con el bajo de
 * comercios —Calzado El Más Barato (la zapatería de Eliseo), la Federación
 * Turística de Lanzarote y dos persianas bajadas— y, en la azotea, el pretil
 * con el arco de medio punto y el pilar escalonado. Enfrente, la hilera de
 * palmeras canarias de la acera de poniente.
 */
import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { fit, SANS, SERIF } from './localesCommon.js';
import { findBuilding } from './civic.js';
import { windowGlow } from './realism.js';

const WHITE = 0xf4f2ec, BLUE = 0x123c9e, DARKBLUE = 0x1b3f7a;
const FRAME = 0x2b3138, GLASS = 0x18262f, SHUTTER = 0x6a7075;

/** las palmeras de la acera de poniente, como en la foto */
export const MILLARES_PALMS = [
  [-753.6, 338.0, 12.4], [-753.9, 342.6, 11.2], [-754.2, 347.1, 12.8],
  [-754.5, 351.6, 10.9], [-754.8, 356.1, 12.1], [-755.1, 360.4, 11.6],
];

const txt = (g, text, x, y, maxW, size, color, weight = '800', family = SANS, style = '') => {
  g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
  fit(g, text, x, y, maxW, size, weight, family, style);
};

/** el rótulo azul de la zapatería, con la franja roja a la izquierda */
const zapateriaSign = () => canvasTex(1024, 190, (g, W, H) => {
  g.fillStyle = '#123c9e'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#c8102e'; g.fillRect(0, 0, W * 0.09, H);
  txt(g, 'CALZADO', W * 0.3, H * 0.34, W * 0.36, H * 0.3, '#ffffff', '700', SANS);
  txt(g, 'EL MÁS BARATO', W * 0.55, H * 0.72, W * 0.72, H * 0.34, '#ffffff', '800', SANS);
  g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = Math.max(3, H * 0.03);
  g.strokeRect(H * 0.06, H * 0.06, W - H * 0.12, H - H * 0.12);
});

/** la banda de la Federación Turística, más pequeña */
const federacionSign = () => canvasTex(1024, 150, (g, W, H) => {
  g.fillStyle = '#1b3f7a'; g.fillRect(0, 0, W, H);
  txt(g, 'FEDERACIÓN TURÍSTICA DE LANZAROTE', W / 2, H * 0.54, W * 0.92, H * 0.44, '#ffffff', '600', SERIF);
});

/** el cristal: el cielo reflejado arriba y el local oscuro abajo */
const shopGlassTex = () => canvasTex(512, 512, (g, W, H) => {
  const grd = g.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, '#9ec2d8');
  grd.addColorStop(0.34, '#5d7789');
  grd.addColorStop(0.55, '#26313a');
  grd.addColorStop(1, '#111920');
  g.fillStyle = grd; g.fillRect(0, 0, W, H);
  // un reflejo sesgado y las estanterías del fondo, muy apagadas
  g.save(); g.globalAlpha = 0.16; g.fillStyle = '#ffffff';
  g.beginPath(); g.moveTo(W * 0.06, H); g.lineTo(W * 0.42, 0); g.lineTo(W * 0.58, 0); g.lineTo(W * 0.22, H);
  g.closePath(); g.fill(); g.restore();
  g.globalAlpha = 0.5; g.fillStyle = '#2a241d';
  for (const y of [0.62, 0.72, 0.82]) g.fillRect(W * 0.06, H * y, W * 0.88, H * 0.035);
  g.globalAlpha = 1;
});

/** el rótulo negro de la tienda de la cara de Guenia */
const deportesSign = () => canvasTex(1024, 140, (g, W, H) => {
  g.fillStyle = '#1a1d20'; g.fillRect(0, 0, W, H);
  txt(g, 'SPORT · CALZADO · ROPA', W / 2, H * 0.54, W * 0.9, H * 0.5, '#f3f1ea', '700', SANS);
});

/** persiana metálica bajada */
const shutterTex = () => canvasTex(512, 512, (g, W, H) => {
  g.fillStyle = '#6a7075'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#565c61';
  for (let y = 0; y < H; y += 26) g.fillRect(0, y, W, 9);
  g.fillStyle = 'rgba(255,255,255,.06)';
  for (let y = 12; y < H; y += 26) g.fillRect(0, y, W, 4);
});

/** cara de fachada en su marco local: x a lo largo desde `o`, z hacia fuera */
function face(A, B, nWant) {
  const dx = B[0] - A[0], dz = B[1] - A[1], L = Math.hypot(dx, dz);
  let n = [dz / L, -dx / L];
  if (n[0] * nWant[0] + n[1] * nWant[1] < 0) n = [-n[0], -n[1]];
  const U = [n[1], -n[0]];
  const o = (U[0] * dx + U[1] * dz) > 0 ? A : B;
  return { o, n, U, L };
}

/**
 * El bajo de un tramo: escaparate de cristal oscuro con montantes, como el de
 * la farmacia de al lado, o persiana metálica bajada.
 */
function shopUnit(k, x, w, kind) {
  const h = 3.15, y = 0.14;
  if (kind === 'glass') {
    // el cristal, oscuro y con el cielo reflejado, el zócalo y los montantes
    k.box(x, y, 0.08, w - 0.08, h, 0.1, GLASS, { list: k.shell });
    k.pic(x, y + h / 2, 0.155, w - 0.2, h - 0.08, 0, 1, shopGlassTex());
    k.box(x, 0.0, 0.12, w, 0.18, 0.16, 0x36302a);
    const n = Math.max(2, Math.round(w / 2.3));
    for (let i = 0; i <= n; i++) k.box(x - w / 2 + (w * i) / n, y, 0.15, 0.11, h, 0.17, FRAME);
  } else {
    k.box(x, y, 0.1, w - 0.08, h, 0.1, SHUTTER, { list: k.shell });
    k.pic(x, y + h / 2, 0.17, w - 0.16, h - 0.06, 0, 1, shutterTex());
    for (const dx of [-w / 2 + 0.06, w / 2 - 0.06]) k.box(x + dx, y, 0.15, 0.11, h, 0.17, FRAME);
  }
  k.box(x, y + h, 0.16, w, 0.12, 0.2, FRAME);
}

export function tuneEsquinaMillares(map) {
  const b = findBuilding(map, -730, 340, 25);
  if (!b || !b.p) return;
  b.f = [252, 251, 246];    // estuco blanco, como en la foto
  b.c = [150, 148, 142];
  b.s = 1;
}

/** el bajo y el arco de la esquina */
export function buildEsquinaMillares(scene, map) {
  const b = findBuilding(map, -730, 340, 25);
  if (!b || !b.p) return { update() {} };
  const P = b.p;
  // las dos caras que dan a la calle: la del sur (Manolo Millares) y la del
  // oeste (Guenia); se buscan por la forma del polígono
  let south = null, west = null;
  for (let i = 0; i < P.length - 1; i++) {
    const A = P[i], B = P[i + 1];
    const L = Math.hypot(B[0] - A[0], B[1] - A[1]);
    if (L < 5) continue;
    const mx = (A[0] + B[0]) / 2, mz = (A[1] + B[1]) / 2;
    if (mz > 350 && L > 12) south = face(A, B, [0, 1]);
    if (mx < -740 && L > 40) west = { A, B, L };
  }
  if (!south) return { update() {} };
  const group = new THREE.Group();
  group.name = 'esquinaMillares';
  const lit = [];

  // ── la cara de Manolo Millares ──
  {
    const k = new Kit();
    const L = south.L;
    // los comercios del bajo, empezando por la zapatería en la esquina:
    // zapatería, la Federación y dos persianas bajadas
    const wZap = 5.4, wFed = 4.6, rest = L - wZap - wFed - 0.4;
    const wShut = Math.max(2.4, rest / 2);
    shopUnit(k, 0.2 + wZap / 2, wZap, 'glass');
    shopUnit(k, 0.2 + wZap + wFed / 2, wFed, 'glass');
    shopUnit(k, 0.2 + wZap + wFed + 0.2 + wShut / 2, wShut, 'shutter');
    shopUnit(k, 0.2 + wZap + wFed + 0.2 + wShut + 0.1 + wShut / 2, wShut, 'shutter');
    // la banda azul pequeña de la Federación
    k.box(0.2 + wZap + wFed / 2, 3.2, 0.16, wFed, 0.62, 0.16, DARKBLUE);
    k.pic(0.2 + wZap + wFed / 2, 3.51, 0.25, wFed - 0.08, 0.54, 0, 1, federacionSign(), { glow: 0.12 });
    // el rótulo grande de la zapatería, en la esquina como en la foto
    k.box(0.2 + wZap / 2, 3.15, 0.18, wZap, 1.1, 0.2, BLUE);
    k.pic(0.2 + wZap / 2, 3.7, 0.28, wZap - 0.1, 1.0, 0, 1, zapateriaSign(), { glow: 0.2 });
    // cornisa de la planta baja
    k.box(L / 2, 4.3, 0.14, L, 0.16, 0.3, 0xf7f5ef);
    const g = k.build('esquina Millares · Manolo Millares').group;
    g.position.set(south.o[0], 0, south.o[1]);
    g.rotation.y = Math.atan2(south.n[0], south.n[1]);
    group.add(g);
    g.traverse(o => { if (o.material?.emissiveMap) lit.push(o.material); });
  }

  // ── la cara de Guenia, el tramo de la esquina ──
  if (west) {
    // con el giro de esta cara el kit avanza en +x hacia el sur, así que se
    // ancla en la esquina y se monta hacia el norte, en x negativa
    const corner = west.A[1] > west.B[1] ? west.A : west.B; // punta sur = esquina
    const s = face(corner, west.A[1] > west.B[1] ? west.B : west.A, [-1, 0]);
    const k = new Kit();
    const L = Math.min(14, s.L);
    shopUnit(k, -0.2 - 3.1, 5.6, 'glass');
    shopUnit(k, -6.0 - 2.6, 4.8, 'glass');
    shopUnit(k, -11.0 - 1.6, 2.8, 'shutter');
    k.box(-L / 2, 3.28, 0.16, L, 0.5, 0.14, WHITE);
    // el rótulo de la tienda de deportes que hay en esta cara
    k.box(-3.3, 3.22, 0.19, 5.4, 0.62, 0.16, 0x1a1d20);
    k.pic(-3.3, 3.53, 0.26, 5.3, 0.54, 0, 1, deportesSign(), { glow: 0.12 });
    k.box(-L / 2, 4.3, 0.14, L, 0.16, 0.3, 0xf7f5ef);
    const g = k.build('esquina Millares · Guenia').group;
    g.position.set(corner[0] + s.n[0] * 0.12, 0, corner[1] + s.n[1] * 0.12);
    g.rotation.y = Math.atan2(s.n[0], s.n[1]);
    group.add(g);
    g.traverse(o => { if (o.material?.emissiveMap) lit.push(o.material); });
  }

  // ── la azotea: pretil, el arco y el pilar escalonado de su derecha ──
  {
    const H = b.h || 15.5, aw = 6.6, ah = 4.4, t = 0.5;
    const mat = new THREE.MeshStandardMaterial({ color: WHITE, roughness: 0.85 });
    const ry = Math.atan2(south.n[0], south.n[1]);
    const at = (u) => [south.o[0] + south.U[0] * u, south.o[1] + south.U[1] * u];
    const put = (mesh, u, y = H) => {
      const [px, pz] = at(u);
      mesh.position.set(px + south.n[0] * 0.22, y, pz + south.n[1] * 0.22);
      mesh.rotation.y = ry;
      group.add(mesh);
    };
    // pretil corrido del terrado (para que el arco no flote solo)
    const par = new THREE.Mesh(new THREE.BoxGeometry(Math.min(14, south.L), 0.95, 0.28), mat);
    par.castShadow = true;
    put(par, Math.min(14, south.L) / 2, H + 0.475);
    // el muro del arco, con el ojo redondeado y los hombros escalonados
    const shape = new THREE.Shape();
    shape.moveTo(0, 0); shape.lineTo(aw, 0); shape.lineTo(aw, ah); shape.lineTo(0, ah); shape.lineTo(0, 0);
    const hole = new THREE.Path();
    const r = aw * 0.27, cx = aw / 2, cy = 0.55;
    hole.moveTo(cx - r, cy);
    hole.lineTo(cx - r, ah * 0.46);
    hole.absarc(cx, ah * 0.46, r, Math.PI, 0, true);
    hole.lineTo(cx + r, cy);
    hole.lineTo(cx - r, cy);
    shape.holes.push(hole);
    const arch = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false }), mat);
    arch.castShadow = true;
    // el arco va en el tercio de poniente de la fachada, como en la foto
    put(arch, Math.min(12.5, south.L) - aw / 2);
    // pilar macizo escalonado a su derecha, más alto que el muro
    for (const [w, hh] of [[2.1, 5.8], [1.3, 6.6]]) {
      const pil = new THREE.Mesh(new THREE.BoxGeometry(w, hh, 0.55), mat);
      pil.castShadow = true;
      put(pil, Math.min(12.5, south.L) + aw / 2 + 1.5, H + hh / 2);
    }
  }

  scene.add(group);
  return {
    group,
    update() {
      const n = windowGlow.value;
      for (const m of lit) m.emissiveIntensity = 0.1 + n * 1.6;
    },
  };
}
