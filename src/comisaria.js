import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { OFFICIAL } from './places.js';

/**
 * Comisaría de Policía Nacional, en su sitio de verdad: calle Mastelero esquina con la
 * Vía Medular (sede.policia.gob.es), con la foto de José Manuel: edificio blanco de dos
 * plantas con las bandas corridas de ventanas grises, la entrada central de cristal con
 * su marquesina blanca y el rótulo «COMISARIA DE POLICIA», la bandera de España encima,
 * el patio delantero enlosado con la rampa de barandilla azul y la valla metálica gris
 * con su puerta corredera abierta. Va en el edificio de verdad de la comisaría nueva
 * (OpenStreetMap, 28.96627 N −13.5408 O), el bloque en diagonal entre Mastelero y la
 * Vía Medular, con su fachada larga mirando a Mastelero (b.ownFacade); el rótulo
 * genérico de civic.js se quita.
 */

// la fachada del edificio real que da a la calle Mastelero (la calle queda al noreste;
// con este orden de A a B la normal de la fachada cae hacia la calle)
const A = [920.17, -421.19], B = [901.03, -405.73];
const LEN = Math.hypot(B[0] - A[0], B[1] - A[1]);
const U = [(B[0] - A[0]) / LEN, (B[1] - A[1]) / LEN];
const N = [U[1], -U[0]];   // hacia la calle (suroeste)
// las cajas llevan el ancho (w) a lo largo de la fachada: rotateY gira la x hacia U con este ángulo
const RY = Math.atan2(U[0], U[1]) + Math.PI / 2;
const H = 7.4;
const VF = 4.8;   // la valla, a esta distancia de la fachada (la calle queda a unos 12 m)
const WHITE = 0xf1efe9, FRAME = 0x8d9298, GLASS = 0x3a4650, FENCE = 0x7d8288, BLUE = 0x2456a5;

const P = (u, v) => [A[0] + U[0] * u + N[0] * v, A[1] + U[1] * u + N[1] * v];

export function tuneComisaria(map) {
  for (const b of map.buildings || []) {
    if (!b.p.some(([x, z]) => Math.hypot(x - A[0], z - A[1]) < 0.5)) continue;
    if (!b.p.some(([x, z]) => Math.hypot(x - B[0], z - B[1]) < 0.5)) continue;
    b.h = H; b.s = 0; b.ownFacade = true;
  }
  // el rótulo y las banderas genéricas de civic.js: este modelo trae los suyos
  // (markCivic ya corrió desde extraData.js, así que también se quita de map.civic)
  const i = OFFICIAL.findIndex(o => /Comisaría/.test(o.n));
  if (i >= 0) OFFICIAL.splice(i, 1);
  const j = (map.civic || []).findIndex(c => /Comisaría/.test(c.n || ''));
  if (j >= 0) map.civic.splice(j, 1);
}

export function buildComisaria(scene, colliders) {
  const k = new Kit();
  const DOOR = LEN / 2;   // la entrada, centrada en la fachada

  // el paño blanco de la fachada, por delante del muro del edificio del mapa
  const [fpx, fpz] = P(LEN / 2, 0.1);
  k.box(fpx, 0, fpz, LEN, H, 0.22, WHITE, { ry: RY, list: k.shell });
  // las bandas y la cristalera van POR DELANTE del paño blanco (su cara está en v 0,21)
  const bx = (u, y, w, h, hex, list, dv = 0.3) => {
    const [x, z] = P(u, dv);
    k.box(x, y, z, w, h, 0.16, hex, { ry: RY, list });
  };
  // las dos bandas corridas de ventanas grises, cortadas por la entrada
  for (const y of [1.15, 4.35]) {
    for (const [u0, u1] of y > 2 ? [[1.2, LEN - 1.2]] : [[1.2, DOOR - 3.6], [DOOR + 3.6, LEN - 1.2]]) {
      const w = u1 - u0;
      bx((u0 + u1) / 2, y - 0.14, w + 0.34, 1.78, FRAME, k.shell, 0.3);
      bx((u0 + u1) / 2, y, w, 1.5, GLASS, k.shell, 0.27);
      // montantes
      for (let u = u0 + 1.5; u < u1 - 0.5; u += 1.9) bx(u, y, 0.09, 1.5, FRAME, k.shell, 0.31);
    }
  }
  // la entrada: cristalera oscura con sus montantes, escalones y marquesina blanca con el rótulo
  const [ex, ez] = P(DOOR, 0.3);
  k.box(ex, 0, ez, 6.4, 3.1, 0.3, GLASS, { ry: RY, list: k.shell });
  for (const du of [-2.1, -0.7, 0.7, 2.1]) bx(DOOR + du, 1.5, 0.1, 3.0, FRAME, k.shell, 0.48);
  for (let i = 0; i < 3; i++) {
    const [qx, qz] = P(DOOR, 0.45 + i * 0.42);
    k.box(qx, 0.36 - i * 0.12, qz, 7.0 - i * 0.5, 0.12, 0.45, 0xc9c5bc, { ry: RY, list: k.shell });
  }
  const [mx, mz] = P(DOOR, 1.35);
  k.box(mx, 3.25, mz, 7.6, 0.28, 3.0, WHITE, { ry: RY });
  for (const du of [-3.2, 3.2]) {
    const [px, pz] = P(DOOR + du, 2.5);
    k.cyl(px, 0, pz, 0.07, 0.07, 3.25, FRAME, { seg: 8 });
  }
  const [sx, sz] = P(DOOR, 0.35);
  k.pic(sx, 3.95, sz, 6.8, 0.75, N[0], N[1], canvasTex(512, 56, (g, w, h) => {
    g.fillStyle = '#f1efe9'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1d3f8a'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `700 ${Math.round(h * 0.58)}px "Barlow", Arial, sans-serif`;
    g.fillText('COMISARIA DE POLICIA', w / 2, h * 0.55);
  }));
  // la bandera de España en su mástil del patio delantero (así no tapa el rótulo)
  const [fx, fz] = P(DOOR - 6.5, 2.9);
  k.cyl(fx, 0, fz, 0.05, 0.07, 7.8, 0xb9bcc0, { seg: 8 });
  k.pic(fx + U[0] * 0.95, 6.9, fz + U[1] * 0.95, 1.8, 1.1, N[0], N[1], canvasTex(96, 64, (g, w, h) => {
    g.fillStyle = '#c60b1e'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffc400'; g.fillRect(0, h / 4, w, h / 2);
  }));

  // la rampa con la barandilla azul, a la derecha de la entrada
  const rampRy = RY;
  const rg = new THREE.BoxGeometry(5.6, 0.14, 1.5);
  rg.rotateZ(-0.12);
  rg.rotateY(rampRy);
  const [rpx, rpz] = P(DOOR + 6.2, 1.1);
  rg.translate(rpx, 0.42, rpz);
  k.add(rg, 0xc9c5bc, { list: k.shell });
  for (const dv of [0.45, 1.75]) {
    for (let du = -2.4; du <= 2.4; du += 1.2) {
      const [hx, hz] = P(DOOR + 6.2 + du, dv);
      k.cyl(hx, 0.1, hz, 0.035, 0.035, 0.95 - du * 0.1, BLUE, { seg: 6 });
    }
    const hg = new THREE.BoxGeometry(5.4, 0.07, 0.07);
    hg.rotateZ(-0.12);
    hg.rotateY(rampRy);
    const [hx, hz] = P(DOOR + 6.2, dv);
    hg.translate(hx, 1.25, hz);
    k.add(hg, BLUE);
  }

  // el patio delantero enlosado
  const [yx, yz] = P(LEN / 2, 2.5);
  k.box(yx, -0.04, yz, LEN + 4, 0.12, 5.0, 0xc2bdb2, { ry: RY, list: k.shell });

  // la valla metálica gris con el zócalo y la puerta corredera abierta frente a la entrada
  const GATE0 = DOOR - 4.2, GATE1 = DOOR + 4.2;
  for (const [u0, u1] of [[0.4, GATE0], [GATE1, LEN - 0.4]]) {
    const [wx, wz] = P((u0 + u1) / 2, VF);
    k.box(wx, 0, wz, u1 - u0, 0.35, 0.22, 0xb5b0a6, { ry: RY });
    for (let u = u0 + 0.6; u < u1; u += 2.4) {
      const [px2, pz2] = P(u, VF);
      k.box(px2, 0.3, pz2, 0.09, 1.75, 0.09, FENCE, { ry: RY });
    }
    for (const y of [0.75, 1.9]) {
      const [hx2, hz2] = P((u0 + u1) / 2, VF);
      k.box(hx2, y, hz2, u1 - u0, 0.08, 0.05, FENCE, { ry: RY });
    }
    for (let u = u0 + 0.35; u < u1; u += 0.33) {
      const [vx2, vz2] = P(u, VF);
      k.box(vx2, 0.42, vz2, 0.045, 1.45, 0.03, FENCE, { ry: RY });
    }
    const a0 = P(u0, VF), a1 = P(u1, VF);
    k.seg(a0[0], a0[1], a1[0], a1[1]);
  }
  // la hoja corredera, recogida a un lado (sin pasarse de la esquina del edificio)
  const [gx, gz] = P(GATE1 + 3.7, VF - 0.45);
  k.box(gx, 0, gz, 7.0, 0.3, 0.14, 0xb5b0a6, { ry: RY });
  for (let du = -3.3; du <= 3.3; du += 0.36) k.box(gx + U[0] * du, 0.3, gz + U[1] * du, 0.05, 1.5, 0.04, FENCE, { ry: RY });
  for (const y of [0.3, 1.8]) k.box(gx, y, gz, 7.0, 0.09, 0.06, FENCE, { ry: RY });

  const { group, segs } = k.build('comisariaPolicia');
  scene.add(group);
  for (const sg of segs) colliders.addSegment(...sg);
}
