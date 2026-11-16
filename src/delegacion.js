import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';

/**
 * Delegación del Gobierno (la oficina de Extranjería), en la calle Blas Cabrera Felipe,
 * al lado del casino y frente a la pescadería del muelle («el mollito»), con la foto de
 * José Manuel: el edificio blanco almenado tipo castillete, el balcón canario verde
 * cerrado con su tejadillo, la portada de cantería gris con los dos arcos y el escudo,
 * las tres banderas inclinadas (España, Canarias y Europa) y el ala derecha más baja
 * con sus ventanitas. Va pegado a la fachada del edificio del mapa.
 */

// la fachada que da a Blas Cabrera Felipe, de oeste a este
const A = [-112.2, 585.4], B = [-74.7, 565.8];
const LEN = Math.hypot(B[0] - A[0], B[1] - A[1]);
const U = [(B[0] - A[0]) / LEN, (B[1] - A[1]) / LEN];
const N = [U[1], -U[0]];   // hacia la calle (noroeste)
// las cajas llevan el ancho (w) a lo largo de la fachada: rotateY gira la x hacia U con este ángulo
const RY = Math.atan2(U[0], U[1]) + Math.PI / 2;
const WALL_H = 9.0, TOWER_H = 11.0;
const WHITE = 0xfcfaf4, STONE = 0x9a958c, GREEN = 0x1e4d33, DARKGLASS = 0x222e38;

const P = (u, v) => [A[0] + U[0] * u + N[0] * v, A[1] + U[1] * u + N[1] * v];

export function tuneDelegacion(map) {
  for (const b of map.buildings || []) {
    if (!b.p.some(([x, z]) => Math.hypot(x - A[0], z - A[1]) < 0.5)) continue;
    if (!b.p.some(([x, z]) => Math.hypot(x - B[0], z - B[1]) < 0.5)) continue;
    b.h = WALL_H; b.s = 0; b.ownFacade = true;
  }
}

/** almenas a lo largo de una línea de la fachada */
function almenas(k, u0, u1, v, y, ry = RY) {
  for (let u = u0 + 0.35; u + 0.9 < u1; u += 1.6) {
    const [x, z] = P(u + 0.45, v);
    k.box(x, y, z, 1.0, 0.8, 0.38, WHITE, { ry });
  }
}

const flagTex = (draw) => canvasTex(96, 64, draw);
const FLAGS = [
  flagTex((g, w, h) => {   // España
    g.fillStyle = '#c60b1e'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffc400'; g.fillRect(0, h / 4, w, h / 2);
  }),
  flagTex((g, w, h) => {   // Canarias
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w / 3, h);
    g.fillStyle = '#0033a0'; g.fillRect(w / 3, 0, w / 3, h);
    g.fillStyle = '#ffcc00'; g.fillRect((2 * w) / 3, 0, w / 3, h);
  }),
  flagTex((g, w, h) => {   // Europa
    g.fillStyle = '#003399'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffcc00';
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      g.beginPath(); g.arc(w / 2 + Math.cos(a) * 16, h / 2 + Math.sin(a) * 16, 2.6, 0, Math.PI * 2); g.fill();
    }
  }),
];

/** el balcón canario verde cerrado, con sus cristales y el tejadillo */
const balconTex = () => canvasTex(256, 96, (g, w, h) => {
  g.fillStyle = '#1e4d33'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#9fb6c4';
  for (let i = 0; i < 6; i++) g.fillRect(8 + i * 42, 10, 30, 50);
  g.fillStyle = '#14361f';
  for (let i = 0; i < 6; i++) { g.fillRect(8 + i * 42 + 13, 10, 3, 50); g.fillRect(8 + i * 42, 33, 30, 3); }
  g.fillStyle = '#173c26'; g.fillRect(0, 64, w, 32);
  g.fillStyle = '#0f2b1a';
  for (let i = 0; i < 16; i++) g.fillRect(4 + i * 16, 68, 7, 24);
});

export function buildDelegacion(scene, colliders) {
  const k = new Kit();
  // el paño blanco de la fachada, por delante del muro del mapa
  const [fx, fz] = P(LEN / 2, 0.12);
  k.box(fx, 0, fz, LEN, WALL_H, 0.26, WHITE, { ry: RY, list: k.shell });
  // el cuerpo alto (castillete) en la mitad este, con sus almenas
  const twU0 = 24, twU1 = LEN;
  const [tx, tz] = P((twU0 + twU1) / 2, -4.8);
  k.box(tx, WALL_H, tz, twU1 - twU0, TOWER_H - WALL_H, 10.2, WHITE, { ry: RY, list: k.shell });
  almenas(k, twU0, twU1, 0.1, TOWER_H);
  almenas(k, twU0, twU1, -9.7, TOWER_H);
  for (let v = -9.2; v < -0.4; v += 1.6) {
    for (const uu of [twU0 + 0.25, twU1 - 0.25]) {
      const [x, z] = P(uu, v);
      k.box(x, TOWER_H, z, 0.38, 0.8, 1.0, WHITE, { ry: RY });
    }
  }
  // el ala oeste, más baja, también almenada
  almenas(k, 0, twU0, 0.1, WALL_H);

  // la portada de cantería con los dos arcos
  const pu = 33, pw = 8.6;
  const [px, pz] = P(pu, 0.55);
  k.box(px, 0, pz, pw, 4.7, 1.1, STONE, { ry: RY });
  k.box(px, 4.7, pz, pw + 0.5, 0.45, 1.35, 0x7a756c, { ry: RY });
  for (const du of [-2.05, 2.05]) {
    const [ax, az] = P(pu + du, 1.12);
    k.box(ax, 0.02, az, 2.3, 2.6, 0.2, 0x1a1713, { ry: RY });
    k.cyl(ax, 2.6, az, 1.15, 1.15, 0.2, 0x1a1713, { seg: 14, rx: Math.PI / 2, ry: RY });
  }
  const [es, ez] = P(pu, 1.2);
  k.pic(es, 3.6, ez, 1.1, 1.4, N[0], N[1], canvasTex(64, 80, (g, w, h) => {
    g.fillStyle = '#7a756c'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c9a24a'; g.beginPath();
    g.moveTo(w / 2, h - 8); g.lineTo(10, h - 26); g.lineTo(10, 12); g.lineTo(w - 10, 12); g.lineTo(w - 10, h - 26); g.closePath(); g.fill();
    g.fillStyle = '#9d2933'; g.fillRect(16, 18, w - 32, 22);
  }));
  // por los arcos no se pasa (el muro del mapa sigue detrás): escalón de la entrada
  const [sx, sz] = P(pu, 1.9);
  k.box(sx, 0, sz, pw + 1.2, 0.16, 1.6, 0xb9b2a6, { ry: RY, list: k.shell });

  // el balcón canario verde sobre la portada, con el tejadillo
  const [bx, bz] = P(pu, 1.3);
  k.box(bx, 5.35, bz, 9.2, 0.35, 1.5, 0x173c26, { ry: RY });
  const btex = balconTex();
  const bodyY = 5.7, bodyH = 2.3;
  k.box(bx, bodyY, bz, 9.2, bodyH, 1.4, GREEN, { ry: RY });
  const [bfx, bfz] = P(pu, 2.02);
  k.pic(bfx, bodyY + bodyH / 2, bfz, 9.1, bodyH, N[0], N[1], btex);
  for (const du of [-4.56, 4.56]) {
    const [lx, lz] = P(pu + du, 1.3);
    k.pic(lx + U[0] * (du > 0 ? 0.02 : -0.02), bodyY + bodyH / 2, lz + U[1] * (du > 0 ? 0.02 : -0.02), 1.4, bodyH, du > 0 ? U[0] : -U[0], du > 0 ? U[1] : -U[1], btex);
  }
  // tejadillo de teja
  k.box(bx, bodyY + bodyH, bz, 9.6, 0.18, 1.9, 0x8a5a38, { ry: RY });
  k.box(bx, bodyY + bodyH + 0.16, bz - N[1] * 0.3, 9.6, 0.14, 1.3, 0x7a4e30, { ry: RY });
  // ménsulas
  for (const du of [-3.8, -1.3, 1.3, 3.8]) {
    const [mx, mz] = P(pu + du, 0.75);
    k.box(mx, 4.95, mz, 0.3, 0.4, 1.1, 0x173c26, { ry: RY });
  }

  // las tres banderas inclinadas sobre el tejadillo del balcón
  for (const [i, du] of [[-2.4, 0], [0, 1], [2.4, 2]].map(([d, i]) => [i, d])) {
    const [gx, gz] = P(pu + du, 1.6);
    const g = new THREE.CylinderGeometry(0.035, 0.045, 2.6, 6);
    g.translate(0, 1.3, 0);
    g.rotateX(0.7);
    g.rotateY(Math.atan2(N[0], N[1]));
    g.translate(gx, bodyY + bodyH + 0.1, gz);
    k.add(g, 0xb9bcc0);
    const tipY = bodyY + bodyH + 0.1 + 2.6 * Math.cos(0.7);
    const [tx2, tz2] = [gx + N[0] * 2.6 * Math.sin(0.7), gz + N[1] * 2.6 * Math.sin(0.7)];
    k.pic(tx2, tipY - 0.55, tz2, 1.25, 0.85, N[0], N[1], FLAGS[i]);
  }

  // ventanas: el ala baja con dos plantas de ventanitas y el castillete con las suyas
  const win = (u, y, w = 1.3, h = 1.7) => {
    const [x, z] = P(u, 0.14);
    k.box(x, y - 0.09, z, w + 0.3, h + 0.26, 0.1, 0xffffff, { ry: RY, list: k.shell });
    k.box(x, y, z, w, h, 0.14, DARKGLASS, { ry: RY, list: k.shell });
  };
  for (const u of [3.5, 9, 14.5, 20]) { win(u, 2.1); win(u, 5.7); }
  for (const u of [26.5, 39.5]) { win(u, 2.1); win(u, 5.7); }
  for (const u of [27.5, 33, 38.5]) win(u, 9.4, 1.1, 1.0);

  // la placa de la oficina, junto a la portada
  const [qx, qz] = P(pu + 5.6, 0.3);
  k.pic(qx, 2.1, qz, 1.5, 1.0, N[0], N[1], canvasTex(192, 128, (g, w, h) => {
    g.fillStyle = '#efece3'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#8a857c'; g.lineWidth = 4; g.strokeRect(4, 4, w - 8, h - 8);
    g.fillStyle = '#333'; g.textAlign = 'center';
    g.font = '600 17px "Barlow", Arial, sans-serif';
    g.fillText('DELEGACIÓN', w / 2, 38);
    g.fillText('DEL GOBIERNO', w / 2, 60);
    g.font = '500 14px "Barlow", Arial, sans-serif';
    g.fillText('Oficina de Extranjería', w / 2, 92);
  }));

  const { group, segs } = k.build('delegacionGobierno');
  scene.add(group);
  for (const sg of segs) colliders.addSegment(...sg);
  // la portada sobresale: que no se atraviese por los lados
  k.segs.length = 0;
  const q0 = P(pu - pw / 2, 1.15), q1 = P(pu + pw / 2, 1.15);
  colliders.addSegment(q0[0], q0[1], q1[0], q1[1]);
}
