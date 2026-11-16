import * as THREE from 'three';
import { Kit } from './interiorKit.js';
import { byVisit, pick, SANS, chalkboard, classicSign, apron } from './localesCommon.js';

/**
 * El bar de la gasolinera de Maneje (la Moeve de la Carretera San Bartolomé), por fuera y por dentro.
 *
 * Fuera: la fachada del edificio de la tienda con su puerta de cristal, las ventanas, el toldo, el rótulo y, delante,
 * la terraza cerrada con una vallita de metal y sus mesas con sombrilla.
 * Dentro (se entra con F): el bar, con la barra a la izquierda; al fondo, una puerta al comedor; y detrás del
 * comedor, la cancha de bola canaria (el terrero, de arena, con sus tablas, los bancos, las bolas y el bolín).
 * En una mesa del bar hay tres personas (una señora mayor, una chica rubia y un chico rubio de pelo largo): al
 * acercarte se oye lo que dicen (plan.overhear, locales.js).
 *
 * La disposición (la barra, la puerta del fondo, el comedor y la cancha detrás) la describió José Manuel; las medidas
 * son aproximadas. No lleva nombre de negocio: el rótulo dice solo «Bar Restaurante · Bola canaria».
 */

const BASE_EDIFICIO = [-2009, -1532];   // primer punto del edificio de la tienda en el mapa
const ESTACION = [-2020, -1514];        // la marquesina de la gasolinera: la fachada es la que mira a ella
const DS = 6.0;                         // la puerta, a lo largo de la fachada
const PUERTA_W = 1.7;

/** el marco de la fachada: s a lo largo, z hacia fuera */
const frente = { M: null };

function marco(B, A) {
  const len = Math.hypot(A[0] - B[0], A[1] - B[1]);
  const U = [(A[0] - B[0]) / len, (A[1] - B[1]) / len], N = [-U[1], U[0]];
  return { B, len, U, N, W: (s, z) => [B[0] + U[0] * s + N[0] * z, B[1] + U[1] * s + N[1] * z], ry: Math.atan2(N[0], N[1]) };
}

/** antes de levantar la ciudad: elige la fachada que mira a la marquesina y la deja como suya (no se mueve) */
export function prepararGasolineraManeje(map) {
  const b = (map.buildings || []).find(q => q.p && q.p.length >= 4 && Math.hypot(q.p[0][0] - BASE_EDIFICIO[0], q.p[0][1] - BASE_EDIFICIO[1]) < 3);
  if (!b) return null;
  const p = b.p;
  const cerrado = p[0][0] === p[p.length - 1][0] && p[0][1] === p[p.length - 1][1];
  const n = cerrado ? p.length - 1 : p.length;
  let cx = 0, cz = 0;
  for (let i = 0; i < n; i++) { cx += p[i][0] / n; cz += p[i][1] / n; }
  let mejor = null;
  for (let i = 0; i < n; i++) {
    const P = p[i], Q = p[(i + 1) % n], L = Math.hypot(Q[0] - P[0], Q[1] - P[1]);
    if (L < 8) continue;
    const mx = (P[0] + Q[0]) / 2, mz = (P[1] + Q[1]) / 2;
    let nx = (Q[1] - P[1]) / L, nz = -(Q[0] - P[0]) / L;
    if ((mx - cx) * nx + (mz - cz) * nz < 0) { nx = -nx; nz = -nz; }
    const dx = ESTACION[0] - mx, dz = ESTACION[1] - mz, d = Math.hypot(dx, dz) || 1;
    const score = (dx * nx + dz * nz) / d;
    if (!mejor || score > mejor.score) mejor = { P, Q, nx, nz, score };
  }
  if (!mejor) return null;
  // el orden de los puntos para que z mire hacia fuera
  const ux = (mejor.Q[0] - mejor.P[0]), uz = (mejor.Q[1] - mejor.P[1]);
  const [B, A] = (-uz * mejor.nx + ux * mejor.nz) >= 0 ? [mejor.P, mejor.Q] : [mejor.Q, mejor.P];
  b.ownFront = true;
  frente.M = marco(B, A);
  const [x, z] = frente.M.W(DS, 0);
  GASOLINERA_MANEJE.door = { x, z, nx: frente.M.N[0], nz: frente.M.N[1] };
  return frente.M;
}

// ── lo que se pinta en lienzo ──
function futbol(g, W, H) {
  g.fillStyle = '#2f7a3a'; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#e8f2e8'; g.lineWidth = 4; g.strokeRect(16, 16, W - 32, H - 32);
  g.beginPath(); g.moveTo(W / 2, 16); g.lineTo(W / 2, H - 16); g.stroke();
  g.beginPath(); g.arc(W / 2, H / 2, 40, 0, Math.PI * 2); g.stroke();
}

function bandera(g, W, H) {
  g.fillStyle = '#f4f4f0'; g.fillRect(0, 0, W / 3, H);
  g.fillStyle = '#1f56b8'; g.fillRect(W / 3, 0, W / 3, H);
  g.fillStyle = '#f2cf1d'; g.fillRect(2 * W / 3, 0, W / 3, H);
}

// ── la fachada y la terraza ──
function mesaTerraza(k, s, z) {
  k.table(s, z, { w: 0.8, d: 0.8, h: 0.74, top: 0xe9e4d8, leg: 0x3a3d40 });
  for (const [ds, dz, ry] of [[0, -0.62, 0], [0, 0.62, Math.PI], [-0.62, 0, Math.PI / 2], [0.62, 0, -Math.PI / 2]]) {
    k.chair(s + ds, z + dz, ry, 0x4d7a56, { legs: 0x3a3d40 });
  }
  // la sombrilla: el palo y la tela crema
  k.cyl(s, 0, z, 0.025, 0.025, 2.25, 0x8a8e92, { seg: 6 });
  const g = new THREE.ConeGeometry(1.1, 0.32, 10, 1, true);
  g.translate(s, 2.25 + 0.16, z);
  k.add(g, 0xe9dcc0);
}

function fachada(k, len) {
  const Z = 0.12;
  // la pared lisa de la planta baja, por delante de lo genérico, con el zócalo gris
  k.box(len / 2, 0, Z, len - 0.3, 3.5, 0.24, 0xf1ece0);
  k.box(len / 2, 0, Z + 0.03, len - 0.3, 0.9, 0.24, 0x8a8c8e);
  k.block(len / 2, Z, len - 0.3, 0.24);
  const alu = 0x2a2c30;
  // la puerta de cristal doble
  const d0 = DS - PUERTA_W / 2, d1 = DS + PUERTA_W / 2, dh = 2.35;
  k.glass.push(new THREE.PlaneGeometry(PUERTA_W, dh).translate(DS, dh / 2, Z + 0.14));
  for (const s of [d0, d1]) k.box(s, 0, Z + 0.14, 0.08, dh + 0.06, 0.1, alu);
  k.box(DS, dh, Z + 0.14, PUERTA_W + 0.16, 0.09, 0.1, alu);
  k.box(DS, 0, Z + 0.14, 0.05, dh, 0.1, alu);
  for (const s of [-1, 1]) k.box(DS + s * 0.12, 0.85, Z + 0.22, 0.03, 0.5, 0.05, 0xc8ccd0);
  k.box(DS, 0.02, 0.7, PUERTA_W * 0.9, 0.02, 0.7, 0x2a2420, { list: k.shell });   // el felpudo
  // las dos ventanas grandes, a cada lado
  for (const s of [2.6, len - 2.6]) {
    const w = 2.4, y0 = 0.95, y1 = 2.45;
    k.glass.push(new THREE.PlaneGeometry(w, y1 - y0).translate(s, (y0 + y1) / 2, Z + 0.14));
    for (const e of [-w / 2, w / 2]) k.box(s + e, y0 - 0.04, Z + 0.14, 0.07, y1 - y0 + 0.08, 0.09, alu);
    k.box(s, y0 - 0.04, Z + 0.14, w + 0.08, 0.07, 0.09, alu);
    k.box(s, y1, Z + 0.14, w + 0.08, 0.07, 0.09, alu);
    k.box(s, y0, Z + 0.14, 0.04, y1 - y0, 0.07, alu);
    k.box(s, y0 - 0.1, Z + 0.2, w + 0.3, 0.06, 0.2, 0xe6e0d2);
  }
  // el toldo a rayas verdes y crema sobre la puerta y las ventanas
  const t0 = 1.0, t1 = len - 1.0, yP = 3.05, yF = 2.55, FUERA = 1.7, Lt = Math.hypot(FUERA, yP - yF), n = 12, w = (t1 - t0) / n;
  for (let i = 0; i < n; i++) {
    const g = new THREE.BoxGeometry(w, 0.03, Lt);
    g.rotateX(Math.atan2(yP - yF, FUERA));
    g.translate(t0 + w * (i + 0.5), (yP + yF) / 2, Z + 0.12 + FUERA / 2);
    k.add(g, i % 2 ? 0xefe6cf : 0x2f7a4a);
    k.box(t0 + w * (i + 0.5), yF - 0.2, Z + 0.12 + FUERA, w, 0.2, 0.025, i % 2 ? 0xefe6cf : 0x2f7a4a);
  }
  for (const s of [t0, t1]) k.box(s, yF + 0.05, Z + 0.12, 0.05, 0.5, FUERA, 0x8a8e92);
  // faroles de pared a los lados de la puerta
  for (const s of [d0 - 0.5, d1 + 0.5]) k.box(s, 2.55, Z + 0.3, 0.16, 0.2, 0.16, 0xfff1cf, { list: k.glow });
  // la pizarra de pie junto a la puerta
  k.box(d1 + 1.1, 0, 1.0, 0.62, 0.95, 0.04, 0x5a3a22, { ry: 0.25 });
  k.block(d1 + 1.1, 1.0, 0.7, 0.2);
}

function terraza(k, len) {
  const S0 = 0.9, S1 = len - 0.9, ZF = 3.7, ZB = 0.4, G0 = DS - 1.0, G1 = DS + 1.0;
  // el suelo de la terraza
  k.box((S0 + S1) / 2, 0, (ZB + ZF) / 2, S1 - S0, 0.06, ZF - ZB, 0xb9b2a4, { list: k.shell });
  const poste = (s, z) => k.cyl(s, 0, z, 0.03, 0.035, 1.0, 0x4a4f54, { seg: 6 });
  const baranda = (a0, b0, a1, b1) => {
    const L = Math.hypot(a1 - a0, b1 - b0), n = Math.max(1, Math.round(L / 1.2)), ry = Math.atan2(a1 - a0, b1 - b0) + Math.PI / 2;
    for (let i = 0; i <= n; i++) poste(a0 + (a1 - a0) * i / n, b0 + (b1 - b0) * i / n);
    for (const y of [0.95, 0.5, 0.12]) k.box((a0 + a1) / 2, y - 0.015, (b0 + b1) / 2, L, 0.03, 0.03, 0x4a4f54, { ry });
    // barrotes de la vallita
    const m = Math.round(L / 0.16);
    for (let i = 1; i < m; i++) k.box(a0 + (a1 - a0) * i / m, 0.1, b0 + (b1 - b0) * i / m, 0.015, 0.85, 0.015, 0x4a4f54);
    k.seg(a0, b0, a1, b1);
  };
  // la vallita de metal: delante (con el paso frente a la puerta) y a los lados
  baranda(S0, ZF, G0, ZF);
  baranda(G1, ZF, S1, ZF);
  baranda(S0, ZB + 0.3, S0, ZF);
  baranda(S1, ZB + 0.3, S1, ZF);
  // las mesas con sombrilla a cada lado del paso
  for (const [s, z] of [[2.5, 1.4], [3.9, 2.75], [len - 2.5, 1.4], [len - 3.9, 2.75]]) mesaTerraza(k, s, z);
}

/** se monta con lo demás de Maneje */
export function buildGasolineraManeje(scene, colliders) {
  const M = frente.M;
  if (!M) return null;
  const k = new Kit();
  fachada(k, M.len);
  terraza(k, M.len);
  const { group, segs } = k.build('gasolineraManeje');
  group.position.set(M.B[0], 0, M.B[1]);
  group.rotation.y = M.ry;
  scene.add(group);
  for (const [as, az, bs, bz] of segs) colliders?.addSegment(...M.W(as, az), ...M.W(bs, bz));
  return { group };
}

// ── por dentro ──
const MESA_BAR = [3.7, -1.0];

const chico = { sex: 'm', skin: 0xe8c9a6, hair: 0xe2c46c, hairStyle: 'long', top: 0x2f4a6a, topStyle: 'tshirt', bottom: 0x4a4a4e, bottomStyle: 'shorts', shoes: 0xf2f2f2, height: 1.8 };
const chica = { sex: 'f', skin: 0xf0d3b8, hair: 0xe9cf80, hairStyle: 'long', top: 0xd8707e, topStyle: 'tank', bottom: 0x3a4a68, bottomStyle: 'shorts', shoes: 0xf2f2f2, height: 1.66 };
const abuela = { sex: 'f', skin: 0xe2bfa0, hair: 0xd9d6d0, hairStyle: 'bun', top: 0x7a5a78, topStyle: 'long', bottom: 0x3a3a44, bottomStyle: 'skirt', shoes: 0x3a2e28, shoeStyle: 'shoe', height: 1.52, build: 1.05 };

export const GASOLINERA_MANEJE = {
  id: 'gasolinera-maneje',
  name: 'el bar de la gasolinera',
  glyph: 'Ba',
  color: 0x3aa86a,
  ownFront: true,
  door: {},
  sign: {
    size: [4.6, 0.95], y: 3.85, px: [1024, 212], edge: 0x1c2a22,
    draw: classicSign({ bg: '#1d4a35', fg: '#f4ecd6', line: '#d9b25a', title: 'BAR RESTAURANTE', sub: 'Bola canaria', serif: false }),
  },
  light: { sun: 0xffe6c8, exposure: 0.85 },
  build(k, { canvasTex }) {
    const H = 3.2;
    const seats = [];
    /** silla con asiento libre para sentarse (T), mirando hacia la mesa */
    const silla = (x, z, ry, mx, mz, hex = 0x5a4636) => {
      k.chair(x, z, ry, hex);
      seats.push({ at: [x, z], face: ry, seat: 0.46, plate: [mx, 0.78, mz] });
    };

    // ═══ el bar ═══
    k.room(-5, -3, 5, 4, {
      h: H, floor: 'tile', wall: 0xe9dcc2, ceil: 0xf4efe4, base: 0x6a4a30, lights: 'panel',
      open: {
        s: [[0.7, 4.3, 'window'], [5.9, 7.6, 'door'], [8.2, 9.5, 'window']],
        n: [[4.1, 5.9, 'door']],
        e: [[1.0, 3.0, 'window'], [4.2, 6.0, 'window']],
      },
    });
    // la barra, a la izquierda según se entra, con el botellero detrás
    k.counter(-3.5, -0.5, 4.8, 0.8, Math.PI / 2, { front: 0x5a3a22, top: 0x2e2a28, h: 1.1 });
    k.box(-4.78, 0, -0.5, 0.5, 0.95, 5.0, 0x3a2416);
    for (let r = 0; r < 3; r++) {
      k.box(-4.85, 1.3 + r * 0.45, -0.5, 0.3, 0.03, 5.0, 0xffd9a0, { list: k.glow });
      for (let i = 0; i < 22; i++) k.cyl(-4.85, 1.33 + r * 0.45, -2.8 + i * 0.22, 0.035, 0.035, 0.28, [0x3a1418, 0x2f4a1a, 0x7a5a1a, 0xc8c8c8, 0x1a3a5a][(i + r) % 5], { seg: 8 });
    }
    for (let i = 0; i < 3; i++) {
      const z = -1.8 + i * 0.5;
      k.cyl(-3.45, 1.1, z, 0.03, 0.03, 0.38, 0xd8dcdf, { seg: 8 }).box(-3.45, 1.4, z, 0.05, 0.2, 0.05, [0xd8271c, 0x1c7a3e, 0xf2c41a][i]);
    }
    k.box(-3.5, 1.1, 0.9, 0.5, 0.4, 0.55, 0xb8bcc0).box(-3.5, 1.5, 0.9, 0.3, 0.1, 0.3, 0x2a2c30);   // la cafetera
    k.box(-3.5, 1.1, 1.5, 0.4, 0.26, 0.4, 0x2a2a2e);                                                 // la caja
    for (const z of [-2.3, -1.4, -0.5, 0.4, 1.3]) k.stool(-2.7, z);
    // la nevera de cristal de las bebidas
    k.box(-1.9, 0, -2.62, 0.8, 1.9, 0.6, 0xd8dcdf).box(-1.9, 0.15, -2.3, 0.7, 1.6, 0.02, 0xbfe0ff, { list: k.glow });
    k.block(-1.9, -2.62, 0.8, 0.6);
    // la tele del fútbol y la pizarra
    k.box(4.0, 1.7, -2.95, 1.5, 0.85, 0.08, 0x111111);
    k.pic(4.0, 2.12, -2.9, 1.4, 0.78, 0, 1, canvasTex(512, 288, futbol), { glow: 0.6 });
    k.pic(1.9, 1.75, -2.96, 1.2, 0.9, 0, 1, canvasTex(480, 360, chalkboard('Bar · Comedor', ['#EN EL BAR', 'Cañas · Cafés · Bocadillos', '#AL FONDO', 'El comedor y, detrás,', 'la cancha de bola canaria'])));
    for (const z of [-2.0, -0.5, 1.0]) k.pendant(-3.0, z, H, { drop: 0.8, shade: 0x5a3a22 });
    // la mesa de los tres (T1) y otra libre
    const [tx, tz] = MESA_BAR;
    k.table(tx, tz, { w: 1.0, round: true, top: 0x5a3a22, leg: 0x2a2c30 });
    for (const [x, z] of [[-0.25, -0.2], [0.1, 0.15], [0.3, -0.1]]) {
      k.cyl(tx + x, 0.74, tz + z, 0.04, 0.032, 0.07, 0xf4f1e8, { seg: 10 });
    }
    k.cyl(tx, 0.74, tz + 0.05, 0.12, 0.12, 0.02, 0xe9e5da, { seg: 14 });
    silla(tx, tz + 0.78, Math.PI, tx, tz);                              // la libre, de cara a ellos
    k.chair(tx, tz - 0.78, 0, 0x5a4636).chair(tx - 0.78, tz, Math.PI / 2, 0x5a4636).chair(tx + 0.78, tz, -Math.PI / 2, 0x5a4636);
    const t2 = [3.7, 2.0];
    k.table(t2[0], t2[1], { w: 0.9, round: true, top: 0x5a3a22, leg: 0x2a2c30 });
    silla(t2[0], t2[1] - 0.78, 0, ...t2); silla(t2[0], t2[1] + 0.78, Math.PI, ...t2);
    silla(t2[0] - 0.78, t2[1], Math.PI / 2, ...t2); silla(t2[0] + 0.78, t2[1], -Math.PI / 2, ...t2);
    k.pendant(tx, tz, H, { drop: 0.85 }).pendant(t2[0], t2[1], H, { drop: 0.85 });
    k.plant(-4.4, 3.4, { h: 1.4 }).plant(4.4, 3.5, { h: 1.3 });

    // ═══ el comedor (a la puerta del fondo) ═══
    k.room(-4.5, -9.5, 4.5, -3, {
      h: 3.0, floor: 'wood', wall: 0xefe3cc, ceil: 0xf6f1e6, base: 0x6a4a30, lights: 'panel',
      open: { s: [[3.6, 5.4, 'door']], n: [[3.6, 5.4, 'door']], w: [[1.5, 3.5, 'window']], e: [[1.5, 3.5, 'window']] },
    });
    for (const [x, z] of [[-2.8, -4.6], [2.8, -4.6], [-2.8, -7.6], [2.8, -7.6]]) {
      k.table(x, z, { w: 0.9, d: 0.9, top: 0xf2efe8, cloth: 0xe8dcc0 });
      k.cyl(x, 0.77, z, 0.04, 0.03, 0.14, 0x7aa05a, { seg: 8 });
      silla(x, z - 0.75, 0, x, z); silla(x, z + 0.75, Math.PI, x, z);
      silla(x - 0.75, z, Math.PI / 2, x, z); silla(x + 0.75, z, -Math.PI / 2, x, z);
      k.pendant(x, z, 3.0, { drop: 0.8, shade: 0xc89a5a });
    }
    k.shelf(-4.3, -6.1, 2.4, Math.PI / 2, {
      h: 1.9, rows: 4, hex: 0x8a6a48,
      items: (kk, x, y, z, w) => { for (let i = 0; i < 6; i++) kk.cyl(x, y, z - w / 2 + 0.2 + i * (w - 0.4) / 5, 0.1, 0.1, 0.03, i % 2 ? 0xf2f0ea : 0xd9c9a8, { seg: 12 }); },
    });
    k.pic(4.46, 1.75, -4.4, 1.3, 1.0, -1, 0, canvasTex(520, 400, chalkboard('Comedor', ['#PLATOS DEL DÍA', 'Guisos y carnes de la casa', 'Pescado según el día', '#PARA ACABAR', 'Postres caseros · Café'])));
    k.plant(-3.8, -3.6, { h: 1.3 }).plant(3.8, -3.6, { h: 1.3 });

    // ═══ la cancha de bola canaria (detrás del comedor) ═══
    k.room(-5, -24.5, 5, -9.5, {
      h: 4.6, floor: 'arena', wall: 0xe6dcc6, ceil: 0xdfeaf2, base: 0x8a6a48, lights: null,
      open: { s: [[4.1, 5.9, 'door']] },
    });
    k.box(0, 4.57, -17, 9.6, 0.03, 14.4, 0xdbeefc, { list: k.glow });   // la claridad del cielo por arriba
    // las tablas del terrero (abierto por el lado de la puerta)
    const TB = 0x7a5a38;
    k.box(-2.5, 0, -17.4, 0.12, 0.32, 12.0, TB).box(2.5, 0, -17.4, 0.12, 0.32, 12.0, TB).box(0, 0, -23.4, 5.12, 0.32, 0.12, TB);
    k.block(-2.5, -17.4, 0.12, 12.0).block(2.5, -17.4, 0.12, 12.0).block(0, -23.4, 5.12, 0.12);
    // las rayas del terrero
    for (const z of [-12.2, -17.4, -22.6]) k.rug(0, z, 4.88, 0.07, 0, 0xf2eee0);
    // las bolas (de madera, de colores) y el bolín
    const bolas = [[-1.2, -13.4, 0x8a3a22], [-0.4, -14.6, 0x8a3a22], [0.9, -13.0, 0x2a4a7a], [1.4, -15.2, 0x2a4a7a], [-0.8, -19.5, 0x8a3a22], [0.6, -20.8, 0x2a4a7a]];
    for (const [x, z, c] of bolas) k.ball(x, 0.09, z, 0.085, c, { seg: 12 });
    k.ball(0.2, 0.04, -21.8, 0.035, 0xf2d21a, { seg: 8 });
    // bancos a los dos lados y el expositor de bolas
    for (const x of [-3.8, 3.8]) for (const z of [-13.5, -17.4, -21.3]) {
      k.box(x, 0, z, 0.45, 0.46, 2.3, 0x6a4a30);
      k.block(x, z, 0.45, 2.3);
    }
    k.box(4.7, 0, -11.2, 0.4, 0.9, 1.4, 0x6a4a30);
    for (let i = 0; i < 4; i++) k.ball(4.7, 0.98, -11.7 + i * 0.35, 0.085, i % 2 ? 0x2a4a7a : 0x8a3a22, { seg: 10 });
    k.block(4.7, -11.2, 0.4, 1.4);
    // el marcador de pizarra y la bandera de Canarias
    k.pic(0, 2.3, -24.46, 3.2, 1.4, 0, 1, canvasTex(640, 280, (g, W, Hh) => {
      g.fillStyle = '#4a2f1a'; g.fillRect(0, 0, W, Hh);
      g.fillStyle = '#1f2a24'; g.fillRect(12, 12, W - 24, Hh - 24);
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = '#f6d36b'; g.font = `800 56px ${SANS}`; g.fillText('BOLA CANARIA', W / 2, 62);
      g.fillStyle = '#f2efe6'; g.font = `700 34px ${SANS}`; g.fillText('Equipo A   ·   Equipo B', W / 2, 150);
      g.font = `800 64px ${SANS}`; g.fillText('3  —  2', W / 2, 220);
    }));
    k.pic(4.96, 2.4, -16, 1.8, 1.2, -1, 0, canvasTex(300, 200, bandera));
    k.plant(-4.4, -10.3, { h: 1.6 }).plant(4.4, -22.9, { h: 1.6 });

    return {
      spawn: [1.75, 2.7, Math.PI], exit: [1.75, 3.55],
      seats,
      overhear: {
        at: MESA_BAR, r: 3.3, cool: 60,
        lines: [
          { who: 'Chico rubio', text: 'Te lo dije que se la iba a follar.' },
          { who: 'Señora mayor', text: '¡¿Qué?! ¡Ay, madre mía…!', shock: ['Señora mayor'] },
          { who: 'Chica rubia', text: 'Pero solo fue una vez.', shock: ['Señora mayor'] },
        ],
      },
      npcs: [
        {
          name: 'Camarero', at: [-4.3, -0.5], face: Math.PI / 2, pose: 'counter',
          look: { sex: 'm', skin: 0xd9a882, hair: 0x2a1d14, hairStyle: 'short', top: 0xf2f2ee, topStyle: 'tshirt', bottom: 0x1c1c1e, bottomStyle: 'pants', shoes: 0x1e1e20, shoeStyle: 'shoe', height: 1.74 },
          dress: (p) => apron(p, 0x1c1c1e, false),
          greet: () => pick(['¡Buenas! Pasa, pasa.', '¡Hola! ¿Qué te pongo?']),
          talk: byVisit([
            (c) => [
              { who: 'Camarero', text: 'Aquí tienes el bar. Al fondo está el comedor, y detrás del comedor, la cancha de bola canaria.' },
              { who: c.me, text: '¿Se puede ver jugar?', player: true },
              { who: 'Camarero', text: 'Claro, pasa y mira. Pero no pises el terrero con las bolas en juego.' },
            ],
            (c) => [
              { who: 'Camarero', text: 'Con la gasolina en el depósito y un café en el cuerpo, ya puedes seguir.' },
              { who: c.me, text: 'Eso hago, gracias.', player: true },
            ],
          ]),
        },
        { name: 'Parroquiano', at: [-2.7, 0.4], face: -Math.PI / 2, pose: 'sit', seat: 0.72, detail: 1, look: { sex: 'm', skin: 0xc28a62, hair: 0x3a2a1c, hairStyle: 'short', beard: true, top: 0x557a4a, topStyle: 'tshirt', bottom: 0x34465c, bottomStyle: 'shorts', shoes: 0xf2f2f2, height: 1.78 } },
        { name: 'Chico rubio', at: [MESA_BAR[0], MESA_BAR[1] - 0.78], face: 0, pose: 'sit', detail: 1, look: chico },
        { name: 'Señora mayor', at: [MESA_BAR[0] - 0.78, MESA_BAR[1]], face: Math.PI / 2, pose: 'sit', detail: 1, look: abuela },
        { name: 'Chica rubia', at: [MESA_BAR[0] + 0.78, MESA_BAR[1]], face: -Math.PI / 2, pose: 'sit', detail: 1, look: chica },
        {
          name: 'Jugador', at: [-1.0, -12.6], face: Math.PI, pose: 'stand', detail: 1,
          look: { sex: 'm', skin: 0xd2a07c, hair: 0xc8c4bc, hairStyle: 'short', top: 0x3f6a8a, topStyle: 'tshirt', bottom: 0x6a6258, bottomStyle: 'shorts', shoes: 0xf2f2f2, height: 1.74 },
          talk: byVisit([
            (c) => [
              { who: 'Jugador', text: 'Esto es bola canaria: se tira la bola lo más cerca posible del bolín.' },
              { who: c.me, text: '¿Y quién gana?', player: true },
              { who: 'Jugador', text: 'El equipo cuya bola queda más arrimada. Mirando se aprende enseguida.' },
            ],
            (c) => [
              { who: 'Jugador', text: 'Pisa la arena con cuidado, que el terrero hay que dejarlo parejo.' },
              { who: c.me, text: 'Voy con ojo.', player: true },
            ],
          ]),
        },
        { name: '', at: [1.4, -13.8], face: Math.PI, pose: 'stand', detail: 1, look: { sex: 'm', skin: 0xc8946c, hair: 0x2a2a2a, hairStyle: 'rapado', top: 0xb8372c, topStyle: 'tshirt', bottom: 0x3a3a3e, bottomStyle: 'shorts', shoes: 0xf2f2f2, height: 1.8 } },
      ],
    };
  },
};
