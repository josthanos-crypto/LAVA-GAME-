import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';

/**
 * El parque infantil del dinosaurio, frente al tanatorio, cruzando la calle Juan de
 * Quesada, en el rincón peatonal junto a la Avenida Olof Palme, con la foto de José
 * Manuel: el suelo de caucho de colores (verde, azul, rojo y naranja en manchas),
 * el dinosaurio verde grande con su lengua roja, las estructuras de postes de acero
 * con los paneles naranjas para trepar, los pajaritos amarillos subidos a sus postes,
 * los bancos y las palmeras alrededor.
 */

const X0 = 681, Z0 = -7, X1 = 697, Z1 = 5;
const CX = (X0 + X1) / 2, CZ = (Z0 + Z1) / 2;

export const DINO_PALMS = [[679.5, -9.5, 7], [698.8, -8, 8], [698.8, 6.5, 7]];

/** el suelo de caucho con las manchas de colores de la foto */
function sueloTex() {
  return canvasTex(512, 384, (g, w, h) => {
    g.fillStyle = '#4da04f'; g.fillRect(0, 0, w, h);
    let seed = 11;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const blob = (color, n, rMin, rMax) => {
      g.fillStyle = color;
      for (let i = 0; i < n; i++) {
        const x = rnd() * w, y = rnd() * h, r = rMin + rnd() * (rMax - rMin);
        g.beginPath();
        g.ellipse(x, y, r, r * (0.55 + rnd() * 0.5), rnd() * 3, 0, Math.PI * 2);
        g.fill();
      }
    };
    blob('#2f7fb8', 7, 40, 85);
    blob('#c84b35', 5, 30, 60);
    blob('#e0892f', 4, 24, 48);
    blob('#6fc06a', 8, 22, 55);
  });
}

/** pajarito amarillo subido a su poste */
function pajaro(k, x, z, ry) {
  k.cyl(x, 0.05, z, 0.05, 0.06, 2.3, 0x8d9298, { seg: 8 });
  k.ball(x, 2.5, z, 0.3, 0xf2c21a, { sx: 1.35, sy: 0.95 });
  k.ball(x + Math.sin(ry) * 0.32, 2.72, z + Math.cos(ry) * 0.32, 0.18, 0xf2c21a);
  k.cyl(x + Math.sin(ry) * 0.5, 2.68, z + Math.cos(ry) * 0.5, 0.01, 0.07, 0.16, 0xe0892f, { seg: 6, rx: Math.PI / 2, ry });
  k.ball(x + Math.sin(ry) * 0.38 + Math.cos(ry) * 0.1, 2.78, z + Math.cos(ry) * 0.38 - Math.sin(ry) * 0.1, 0.045, 0x24262a);
  k.box(x - Math.sin(ry) * 0.42, 2.42, z - Math.cos(ry) * 0.42, 0.26, 0.1, 0.3, 0xdca80f, { ry });
}

/** el dinosaurio verde de la foto: panza clara, lengua roja, lunares y cresta */
function dino(k, x, z, ry) {
  const F = (du, dv) => [x + Math.sin(ry) * du + Math.cos(ry) * dv, z + Math.cos(ry) * du - Math.sin(ry) * dv];
  const GREEN = 0x3fae4a, DARK = 0x2c8a39, BELLY = 0x9ed45e;
  // patas
  for (const [du, dv] of [[-0.55, 0.45], [-0.55, -0.45], [0.55, 0.5], [0.55, -0.5]]) {
    const [px, pz] = F(du, dv);
    k.cyl(px, 0, pz, 0.2, 0.24, 0.75, GREEN, { seg: 8 });
  }
  // cuerpo y panza
  const [bx, bz] = F(0, 0);
  k.ball(bx, 1.25, bz, 1.0, GREEN, { sx: 1.0, sy: 0.95, sz: 1.35, seg: 12 });
  const [vx, vz] = F(0.45, 0);
  k.ball(vx, 1.0, vz, 0.78, BELLY, { sx: 0.85, sy: 0.8, sz: 1.1, seg: 10 });
  // cola
  for (const [t, r] of [[0.9, 0.5], [1.5, 0.34], [2.0, 0.2]]) {
    const [tx, tz] = F(-0.4 - t * 0.25, -t);
    k.ball(tx, 0.55 + t * 0.1, tz, r, GREEN, { seg: 8 });
  }
  // cabeza grande con los ojos saltones y la boca abierta
  const [hx, hz] = F(0.15, 1.35);
  k.ball(hx, 2.5, hz, 0.78, GREEN, { sx: 0.95, sy: 0.9, sz: 1.05, seg: 12 });
  const [mx, mz] = F(0.35, 1.95);
  k.ball(mx, 2.25, mz, 0.42, DARK, { sx: 0.8, sy: 0.5, sz: 0.8, seg: 8 });
  const [lx, lz] = F(0.42, 2.1);
  k.box(lx, 2.1, lz, 0.4, 0.07, 0.5, 0xc8352c, { ry });
  for (const s of [-0.3, 0.3]) {
    const [ex, ez] = F(s, 1.6);
    k.ball(ex, 2.95, ez, 0.2, 0xffffff, { seg: 8 });
    const [px2, pz2] = F(s, 1.76);
    k.ball(px2, 2.97, pz2, 0.08, 0x24262a, { seg: 6 });
  }
  // cresta y lunares
  for (const [t, r] of [[0.6, 0.14], [0.1, 0.17], [-0.45, 0.14]]) {
    const [cx2, cz2] = F(0, t + 0.6);
    k.ball(cx2, 3.2 - Math.abs(t) * 0.5, cz2, r, DARK, { seg: 6 });
  }
  for (const [du, dv, y] of [[-0.6, 0.5, 1.7], [0.6, 0.2, 1.8], [-0.3, -0.7, 1.4], [0.5, -0.9, 1.2], [-0.15, 1.25, 2.85]]) {
    const [sx2, sz2] = F(du, dv);
    k.ball(sx2, y, sz2, 0.11, DARK, { seg: 6 });
  }
  k.block(x, z, 2.4, 2.8, ry);
}

/** estructura de trepar: postes de acero con paneles naranjas y barras */
function trepador(k, x, z, ry, L = 3.6) {
  const F = (du, dv) => [x + Math.cos(ry) * du + Math.sin(ry) * dv, z - Math.sin(ry) * du + Math.cos(ry) * dv];
  const STEEL = 0x9ba1a8, ORANGE = 0xe8702a;
  for (const [du, dv] of [[-L / 2, -0.7], [L / 2, -0.7], [-L / 2, 0.7], [L / 2, 0.7]]) {
    const [px, pz] = F(du, dv);
    k.cyl(px, 0, pz, 0.06, 0.07, 2.3, STEEL, { seg: 8 });
  }
  // barras de arriba (escalera horizontal)
  for (const dv of [-0.7, 0.7]) {
    const [ax, az] = F(0, dv);
    k.box(ax, 2.25, az, L, 0.08, 0.08, STEEL, { ry });
  }
  for (let du = -L / 2 + 0.4; du < L / 2; du += 0.45) {
    const [ax, az] = F(du, 0);
    k.box(ax, 2.25, az, 0.06, 0.06, 1.4, STEEL, { ry });
  }
  // paneles naranjas de trepar en los extremos, con sus agarres
  for (const du of [-L / 2, L / 2]) {
    const [ax, az] = F(du, 0);
    k.box(ax, 0.25, az, 0.09, 2.0, 1.35, ORANGE, { ry });
    for (let i = 0; i < 5; i++) {
      const [gx, gz] = F(du + (du > 0 ? 0.08 : -0.08), -0.45 + (i % 3) * 0.45);
      k.ball(gx, 0.6 + i * 0.35, gz, 0.07, 0xf5e9dc, { seg: 6 });
    }
  }
  k.block(x, z, L + 0.4, 1.8, ry);
}

export function buildParqueDino(scene, colliders) {
  // el suelo de caucho con su bordillo
  const tex = sueloTex();
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(X1 - X0, Z1 - Z0),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.92, metalness: 0 }),
  );
  floor.geometry.rotateX(-Math.PI / 2);
  floor.position.set(CX, 0.14, CZ);
  floor.receiveShadow = true;
  floor.name = 'sueloParqueDino';
  scene.add(floor);

  const k = new Kit();
  for (const [a, b] of [
    [[X0, Z0], [X1, Z0]], [[X1, Z0], [X1, Z1]], [[X1, Z1], [X0, Z1]], [[X0, Z1], [X0, Z0]],
  ]) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ry = Math.atan2(b[0] - a[0], b[1] - a[1]);
    k.box((a[0] + b[0]) / 2, 0.0, (a[1] + b[1]) / 2, 0.25, 0.22, L, 0xcdc8bd, { ry, list: k.shell });
  }

  dino(k, 686.5, -2.2, 0.8);
  trepador(k, 692.6, 1.6, 0.35);
  trepador(k, 684.5, 2.6, -0.9, 2.6);
  pajaro(k, 694.3, -4.2, 2.2);
  pajaro(k, 690.0, -5.0, 2.8);
  pajaro(k, 682.8, -4.4, 1.6);

  // bancos y papelera por el borde
  for (const [x, z, ry] of [[683.5, 4.2, Math.PI], [691.5, 4.2, Math.PI]]) {
    k.box(x, 0.42, z, 1.8, 0.08, 0.5, 0x7a5a38, { ry });
    k.box(x, 0.78, z + 0.26, 1.8, 0.45, 0.07, 0x7a5a38, { ry });
    for (const s of [-0.7, 0.7]) k.box(x + s, 0.05, z, 0.1, 0.4, 0.45, 0x4c4f54, { ry });
    k.block(x, z, 1.9, 0.7, ry);
  }
  k.cyl(695.8, 0.1, 3.8, 0.28, 0.24, 0.75, 0x5a6066, { seg: 10 });
  k.block(695.8, 3.8, 0.6, 0.6);

  const { group, segs } = k.build('parqueDino');
  scene.add(group);
  for (const sg of segs) colliders.addSegment(...sg);
}
