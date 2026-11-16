import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { paveMesh, polyTris, asfalto, picon } from './suelos.js';

/**
 * Alrededor del Tanatorio Arroyo, con la foto de dron que mandó José Manuel: detrás, el aparcamiento
 * grande con los coches en filas (hasta el Hospital Insular); por el lateral de la oficina, la calle con
 * los coches aparcados junto al muro blanco del parque; al otro costado, la franja de jardín con picón,
 * arbustos, pitas y cardones tras un murete blanco; y en la calle de delante, las farolas de dos bolas,
 * las flechas pintadas, las baldosas amarillas de la esquina y el «30» en el suelo. Medidas sobre la foto
 * aérea y el contorno del mapa (sin pisar el hospital, el parque ni las aceras).
 */

// el aparcamiento de detrás, desde la trasera del tanatorio hasta el hospital
const LOT = [[654.8, -48.1], [669.4, -63.3], [664.5, -68.5], [660.5, -74.5], [659.5, -86], [653, -88], [649.6, -81],
  [649.3, -74.6], [645.8, -70.4], [640.5, -59], [651.5, -45.8]];
// marco de sus filas: desde la esquina norte del tanatorio a lo largo de la trasera (u) y alejándose (v)
const T0 = [669.4, -63.3], U = [-0.692, 0.72], V = [-0.726, -0.688];
// la calle del lateral de la oficina, entre el tanatorio y el muro del parque
const SIDE = [[680.0, -53.2], [686.5, -56.5], [689, -61.5], [680, -63.5], [663.5, -75.5], [662, -71.8], [670.4, -63.6]];
const WALL_E = [-0.809, -0.588], WALL_IN = [-0.588, 0.809], WALL_0 = [680, -63.5];
// la franja de jardín del otro costado, con el murete del lado de la calle La Añaza
const GARDEN = [[667.8, -35.2], [654.7, -47.0], [652.5, -44.1], [666.2, -32.9]];
// la calle de delante (Juan de Quesada): de la esquina de La Añaza hacia la rotonda
const QA = [668, -22.7], QD = [0.695, -0.719], QR = [0.719, 0.695];
const CAR_L = 4.6, CAR_W = 2.0;

function inside(poly, x, z) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, az] = poly[i], [bx, bz] = poly[j];
    if ((az > z) !== (bz > z) && x < ax + ((z - az) * (bx - ax)) / (bz - az)) c = !c;
  }
  return c;
}

/** las plazas del aparcamiento: filas paralelas a la trasera, la primera con el morro hacia el edificio */
function lotStalls() {
  const out = [];
  for (const [v, toward] of [[2.6, true], [11.0, false], [15.8, true], [24.2, false]]) {
    for (let u = 1.5; u < 30; u += 2.5) {
      const cx = T0[0] + U[0] * u + V[0] * v, cz = T0[1] + U[1] * u + V[1] * v;
      const h = toward ? [-V[0], -V[1]] : V;
      const ok = [[-1, -1], [1, -1], [1, 1], [-1, 1]].every(([a, b]) => inside(LOT, cx + h[0] * a * CAR_L / 2 + U[0] * b * CAR_W / 2, cz + h[1] * a * CAR_L / 2 + U[1] * b * CAR_W / 2));
      if (ok) out.push([cx, cz, Math.atan2(h[0], h[1])]);
    }
  }
  return out;
}
/** aparcados en fila junto al muro del parque */
function sideStalls() {
  return [4.5, 10, 15.5].map(t => [WALL_0[0] + WALL_E[0] * t + WALL_IN[0] * 1.2, WALL_0[1] + WALL_E[1] * t + WALL_IN[1] * 1.2, Math.atan2(WALL_E[0], WALL_E[1])]);
}
export const TANATORIO_SPOTS = [...lotStalls(), ...sideStalls()];

/** pita */
function agave(k, x, z, s) {
  for (let i = 0; i < 9; i++) k.cyl(x, 0.2, z, 0, 0.05 * s, 0.75 * s, 0x6e8c74, { seg: 4, rx: 0.35 + (i % 3) * 0.22, ry: (i / 9) * Math.PI * 2 });
}

/** cardón: columnas verdes juntas */
function cardon(k, x, z, s) {
  for (let i = 0; i < 8; i++) {
    const a = i * 2.4, d = (0.1 + (i % 4) * 0.11) * s, h = (0.7 + ((i * 7) % 5) * 0.22) * s;
    k.cyl(x + Math.cos(a) * d, 0.2, z + Math.sin(a) * d, 0.07 * s, 0.08 * s, h, 0x5f7f55, { seg: 6 });
  }
}

/** la farola de dos bolas de la calle (las de la foto, con los globos azulados) */
function farola(k, x, z, ry) {
  k.cyl(x, 0.24, z, 0.09, 0.13, 4.2, 0x5a6066, { seg: 10 });
  k.box(x, 4.3, z, 1.3, 0.07, 0.07, 0x5a6066, { ry });
  for (const s of [-1, 1]) {
    const gx = x + Math.cos(ry) * s * 0.62, gz = z - Math.sin(ry) * s * 0.62;
    k.cyl(gx, 4.15, gz, 0.04, 0.04, 0.15, 0x5a6066, { seg: 6 });
    k.ball(gx, 4.62, gz, 0.26, 0xcfe0f2, { seg: 12, list: k.glow });
  }
  k.block(x, z, 0.3, 0.3);
}

/** calcomanía plana sobre el asfalto (flechas, el 30) */
function decal(scene, x, z, w, h, ry, draw, y = 0.155) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({
    map: canvasTex(128, Math.round((128 * h) / w), draw), transparent: true, depthWrite: false, roughness: 0.6,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
  }));
  m.geometry.rotateX(-Math.PI / 2);
  m.geometry.rotateY(ry);
  m.position.set(x, y, z);
  scene.add(m);
}

function arrow(g, w, h) {
  g.fillStyle = '#efefe8';
  g.fillRect(w * 0.42, h * 0.32, w * 0.16, h * 0.64);
  g.beginPath(); g.moveTo(w * 0.5, h * 0.02); g.lineTo(w * 0.82, h * 0.36); g.lineTo(w * 0.18, h * 0.36); g.closePath(); g.fill();
}

function thirty(g, w, h) {
  g.strokeStyle = '#efefe8'; g.lineWidth = w * 0.07;
  g.beginPath(); g.ellipse(w / 2, h / 2, w * 0.44, h * 0.44, 0, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#efefe8'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `800 ${Math.round(h * 0.5)}px "Barlow", Arial, sans-serif`;
  g.fillText('30', w / 2, h * 0.53);
}

export function buildTanatorioEntorno(scene, colliders) {
  for (const [P, name] of [[LOT, 'aparcamientoTanatorio'], [SIDE, 'calleLateralTanatorio']]) {
    const m = paveMesh(polyTris(P), 0.14, asfalto(), 0xffffff);
    if (m) { m.name = name; scene.add(m); }
  }
  const garden = paveMesh(polyTris(GARDEN), 0.2, picon(), 0xffffff);
  if (garden) { garden.name = 'jardinTanatorio'; scene.add(garden); }
  const k = new Kit(), LINE = 0xe9e7e0;
  // las rayas de las plazas
  for (const [x, z, ry] of lotStalls()) {
    for (const s of [-1, 1]) k.box(x + U[0] * s * 1.25, 0.15, z + U[1] * s * 1.25, 0.1, 0.012, CAR_L + 0.4, LINE, { ry, list: k.shell });
  }
  // el murete blanco del jardín, del lado de la calle, con arbustos, pitas y cardones dentro
  const [wa, wb] = [GARDEN[2], GARDEN[3]], wl = Math.hypot(wb[0] - wa[0], wb[1] - wa[1]), wry = Math.atan2(wb[0] - wa[0], wb[1] - wa[1]);
  k.box((wa[0] + wb[0]) / 2, 0.2, (wa[1] + wb[1]) / 2, 0.3, 0.55, wl, 0xf1f0ec, { ry: wry });
  k.box((wa[0] + wb[0]) / 2, 0.75, (wa[1] + wb[1]) / 2, 0.36, 0.05, wl + 0.04, 0xdedbd3, { ry: wry });
  k.seg(wa[0], wa[1], wb[0], wb[1]);
  for (let t = 0.08; t < 0.95; t += 0.13) {
    const x = GARDEN[1][0] + (GARDEN[0][0] - GARDEN[1][0]) * t + (wa[0] - GARDEN[1][0]) * 0.45, z = GARDEN[1][1] + (GARDEN[0][1] - GARDEN[1][1]) * t + (wa[1] - GARDEN[1][1]) * 0.45;
    const i = Math.round(t * 100);
    if (i % 3 === 0) agave(k, x, z, 0.9);
    else if (i % 3 === 1) cardon(k, x, z, 1.1);
    else for (const [dx, dz, r] of [[0, 0, 0.55], [0.35, 0.2, 0.42], [-0.3, -0.2, 0.45]]) k.ball(x + dx, 0.55 + r * 0.5, z + dz, r, 0x4f7a3e, { sy: 0.85, seg: 8 });
  }
  // la calle de delante: farolas de dos bolas en la acera de enfrente, flechas, el 30 y las baldosas amarillas
  for (const a of [6, 19]) farola(k, QA[0] + QD[0] * a + QR[0] * 5.3, QA[1] + QD[1] * a + QR[1] * 5.3, Math.atan2(QD[0], QD[1]) + Math.PI / 2);
  const corner = [QA[0] + QD[0] * 3 - QR[0] * 5.0, QA[1] + QD[1] * 3 - QR[1] * 5.0];
  k.box(corner[0], 0.24, corner[1], 1.8, 0.014, 1.2, 0xe3b52a, { ry: Math.atan2(QD[0], QD[1]), list: k.shell });
  const { group, segs } = k.build('entornoTanatorio');
  scene.add(group);
  for (const sg of segs) colliders.addSegment(...sg);
  const ry = Math.atan2(QD[0], QD[1]);
  for (const [a, side] of [[12, 1], [16, -1]]) {
    // flecha en cada carril, mirando hacia donde va (por la derecha)
    decal(scene, QA[0] + QD[0] * a + QR[0] * 1.8 * side, QA[1] + QD[1] * a + QR[1] * 1.8 * side, 0.9, 3.0, side > 0 ? ry + Math.PI : ry, arrow);
  }
  const L0 = [662.3, -28.3], LD = [-0.774, -0.633];
  decal(scene, L0[0] + LD[0] * 7 - LD[1] * 1.4, L0[1] + LD[1] * 7 + LD[0] * 1.4, 1.6, 1.6, Math.atan2(LD[0], LD[1]), thirty);
}
