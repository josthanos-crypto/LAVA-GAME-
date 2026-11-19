import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { paveMesh, polyTris, blackStones, picon, asfalto, bandTris, discTris } from './suelos.js';

/**
 * Castillo de San José (el MIAC), en la loma del puerto, con las fotos de José Manuel:
 * la fortaleza de piedra volcánica marrón con las juntas claras (el muro «moteado»),
 * la fachada recta hacia la explanada con la puerta y las garitas en las esquinas,
 * el tambor redondo hacia el mar, las chimeneas dobles de la azotea, y delante la
 * explanada oscura de callaos con las esculturas de madera, las bolas de piedra,
 * las pitas y las palmeras. El castillo del mapa (map.castles) se quita y se pone
 * este modelo; el desnivel del terreno lo alisa smoothSanJose en terrain.js.
 */

// la portada recta (hacia la explanada, al noroeste) y el tambor hacia el mar
const A = [1616.8, -944.4], B = [1641.7, -957.7];
const U = [0.882, -0.471], N = [-0.471, -0.882];   // a lo largo de la portada y hacia fuera
const C = [1629.3, -951.1], R = 14.0;              // el tambor, centrado en la cuerda de la portada
const H = 8.2;                                      // altura del muro
const STONE = 0x6e543d, JOINT = 0xd9d2c2, DARKROOF = 0x2f2b27, LIGHTSTONE = 0xcfc5b2;

/** un punto en coordenadas de la portada: u a lo largo, v hacia la explanada */
const P = (u, v) => [A[0] + U[0] * u + N[0] * v, A[1] + U[1] * u + N[1] * v];

export const SANJOSE_PALMS = [
  (() => { const [x, z] = P(31, -4); return [x, z, 7.5]; })(),
  (() => { const [x, z] = P(4, 16); return [x, z, 8]; })(),
  (() => { const [x, z] = P(26, 20); return [x, z, 7]; })(),
  // las palmeras de la isleta del parking y del borde (las fotos de la entrada)
  [1577, -965.5, 7.5], [1583.5, -959, 8.5], [1580, -962.5, 9], [1575.5, -959.5, 7], [1584.5, -965, 8],
  [1560, -948.5, 7.5], [1570, -945.5, 8], [1596, -938.5, 7.5],
];

// el complejo anexo del castillo (el restaurante y las salas bajas hacia el mar), tal cual
// está en el mapa: comparte el muro con el castillo (por eso va pegado, no separado)
const ANNEX = [[1647.4, -947.34], [1651.28, -948.51], [1653.38, -948.32], [1654.76, -947.71], [1655.77, -946.34], [1655.55, -942.55], [1656.55, -942.27], [1656.99, -941.47], [1657.69, -938.95], [1657.84, -937.79], [1657.72, -935.7], [1657.57, -934.61], [1656.93, -933.02], [1654.5, -934.25], [1653.76, -933.19], [1652.95, -931.98], [1652.81, -930.85], [1652.32, -928.57], [1652.39, -926.51], [1652.52, -924.04], [1652.33, -921.99], [1651.73, -920.8], [1650.85, -919.62], [1649.29, -918.39], [1647.06, -916.95], [1645.67, -916.6], [1642.27, -916.75], [1640.86, -917.16], [1639.55, -917.84], [1629.53, -913.49], [1628.7, -915.81], [1626.42, -915.71], [1625.48, -919.54], [1609.61, -919.21], [1608.93, -933.87], [1607.31, -946.66], [1612.92, -949.6], [1616.81, -944.37], [1621.42, -934.27], [1624.81, -930.56], [1631.27, -929.16], [1636.6, -930.26], [1641.13, -932.6], [1645.37, -936.46], [1647.92, -941.21]];
const ANNEX_H = 3.7;

// la entrada desde la avenida del puerto: EP(u, v) = u a lo largo de la avenida, v hacia el parking
const E0 = [1553.4, -992.9], EU = [0.679, -0.733], EN = [0.733, 0.679];
const EP = (u, v) => [E0[0] + EU[0] * u + EN[0] * v, E0[1] + EU[1] * u + EN[1] * v];

// las plazas del parking: en corro alrededor de la isleta de palmeras (morro hacia dentro,
// como en la foto) y una fila en el borde de la avenida; parked.js pinta las rayas
export const SANJOSE_SPOTS = (() => {
  const out = [];
  const IC = [1580, -962];
  for (const deg of [195, 235, 275, 315, 355, 35]) {
    const a = (deg * Math.PI) / 180;
    out.push([IC[0] + Math.cos(a) * 10.4, IC[1] + Math.sin(a) * 10.4, Math.atan2(-Math.cos(a), -Math.sin(a))]);
  }
  const RA = [1561, -979.5], RD = [0.963, 0.267], RN = [0.267, -0.963];
  for (let i = 0; i < 6; i++) {
    out.push([RA[0] + RD[0] * i * 5.6, RA[1] + RD[1] * i * 5.6, Math.atan2(RN[0], RN[1])]);
  }
  return out;
})();

export function tuneCastilloSanJose(map) {
  // fuera el castillo genérico (el anillo de almenas con la torreta): este modelo lo sustituye
  const i = (map.castles || []).findIndex(c => c.p.some(([x, z]) => Math.hypot(x - A[0], z - A[1]) < 2));
  if (i >= 0) map.sanJosePoly = map.castles.splice(i, 1)[0].p;
  // y fuera también los edificios del mapa de la loma: el propio castillo (que salía además
  // como casa blanca), el complejo anexo pegado (que salía como vivienda particular) y la
  // casita blanca suelta de la explanada; el anexo se construye aquí en piedra, como es
  for (const b of map.buildings || []) {
    const near = (px, pz) => b.p.some(([x, z]) => Math.hypot(x - px, z - pz) < 0.6);
    if (near(A[0], A[1]) || near(1577.6, -949.6)) {
      b.skip = true;
      // la altura se deja a juego con el modelo (los tejados siguen siendo pisables)
      b.h = near(1609.61, -919.21) ? 3.7 : near(1577.6, -949.6) ? 0 : 8.2;
    }
  }
}

/** piedra volcánica marrón con las juntas claras (el muro moteado de las fotos) */
function stoneTex() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#c9bfae'; g.fillRect(0, 0, w, h);
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const tones = ['#4e3a29', '#5d4530', '#6e543d', '#7a5f44', '#564633', '#654c35'];
    // hiladas de piedras casi pegadas: la junta clara queda como una red fina, como en las fotos
    const N = 14, c = w / N;
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const x = (i + 0.5) * c + (j % 2 ? c / 2 : 0) + (rnd() - 0.5) * 2;
        const y = (j + 0.5) * c + (rnd() - 0.5) * 2;
        g.fillStyle = tones[Math.floor(rnd() * tones.length)];
        g.beginPath();
        g.ellipse(x % w, y, c * 0.52, c * 0.44, (rnd() - 0.5) * 0.6, 0, Math.PI * 2);
        g.fill();
      }
    }
  });
}

/** bandera de Canarias */
function canariasTex() {
  return canvasTex(96, 64, (g, w, h) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w / 3, h);
    g.fillStyle = '#0033a0'; g.fillRect(w / 3, 0, w / 3, h);
    g.fillStyle = '#ffcc00'; g.fillRect((2 * w) / 3, 0, w / 3, h);
  });
}

/** escultura de madera: dos pies y una viga cruzada (como las de la explanada) */
function madera(k, x, z, ry, s = 1) {
  k.box(x, 0, z, 0.25 * s, 1.9 * s, 0.25 * s, 0x4a3522, { ry });
  k.box(x + Math.cos(ry) * 1.1 * s, 0, z - Math.sin(ry) * 1.1 * s, 0.25 * s, 1.3 * s, 0.25 * s, 0x54402a, { ry });
  const g = new THREE.BoxGeometry(2.6 * s, 0.22 * s, 0.22 * s);
  g.translate(0, 0, 0);
  g.rotateZ(0.42);
  g.rotateY(ry);
  g.translate(x + Math.cos(ry) * 0.5 * s, 1.55 * s, z - Math.sin(ry) * 0.5 * s);
  k.add(g, 0x3e2d1c);
  k.block(x, z, 1.6 * s, 0.8 * s, ry);
}

export function buildCastilloSanJose(scene, colliders) {
  const tex = stoneTex();
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  const stone = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.93, metalness: 0.02 });
  const geos = [];
  // la textura va en losetas de ~6 m: sin esto, las uv del cilindro la estiraban
  // por todo el contorno y el muro salía a rayas (parecía agua)
  const scaleUV = (g, su, sv) => {
    const uv = g.getAttribute('uv');
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv);
    return g;
  };

  // el tambor: medio cilindro hacia el mar (la portada recta cierra el otro lado)
  const T0 = Math.atan2(-N[0], -N[1]) - Math.PI / 2;
  const drum = scaleUV(new THREE.CylinderGeometry(R, R + 0.9, H, 28, 1, true, T0, Math.PI), 8, 1.4);
  drum.translate(C[0], H / 2, C[1]);
  geos.push(drum);
  // la portada recta, un poco más ancha que la cuerda (rotateY lleva la x del largo hacia U)
  const ry = Math.atan2(U[0], U[1]) + Math.PI / 2;
  const front = scaleUV(new THREE.BoxGeometry(30.5, H, 2.2), 5, 1.4);
  front.rotateY(ry);
  const FM = P(14.1, -0.4);
  front.translate(FM[0], H / 2, FM[1]);
  geos.push(front);
  // el pretil de arriba, algo retranqueado
  const ring = scaleUV(new THREE.CylinderGeometry(R - 0.4, R - 0.4, 1.25, 28, 1, true, T0, Math.PI), 8, 0.25);
  ring.translate(C[0], H + 0.6, C[1]);
  geos.push(ring);
  const fr2 = scaleUV(new THREE.BoxGeometry(30.5, 1.25, 1.6), 5, 0.25);
  fr2.rotateY(ry);
  fr2.translate(FM[0], H + 0.6, FM[1]);
  geos.push(fr2);
  for (const g of geos) {
    const m = new THREE.Mesh(g, stone);
    m.castShadow = true;
    m.receiveShadow = true;
    scene.add(m);
  }

  const k = new Kit();
  // la azotea oscura de picón: medio disco hasta la cuerda de la portada
  const roof = new THREE.CircleGeometry(R - 0.1, 28, Math.atan2(N[1], -N[0]) - Math.PI / 2, Math.PI);
  roof.rotateX(-Math.PI / 2);
  roof.translate(C[0], H + 0.04, C[1]);
  k.add(roof, DARKROOF, { list: k.shell });
  // garitas en las esquinas de la portada y otra mirando al mar
  for (const [u, v] of [[0.8, 0.6], [27.4, 0.6]]) {
    const [gx, gz] = P(u, v);
    k.cyl(gx, H - 1.4, gz, 1.0, 1.0, 2.6, LIGHTSTONE, { seg: 10 });
    k.cyl(gx, H + 1.2, gz, 0.05, 1.25, 1.3, 0x4a4039, { seg: 10 });
  }
  const sea = [C[0] - N[0] * (R - 0.2), C[1] - N[1] * (R - 0.2)];
  k.cyl(sea[0], H - 1.0, sea[1], 0.95, 0.95, 2.4, LIGHTSTONE, { seg: 10 });
  k.cyl(sea[0], H + 1.4, sea[1], 0.05, 1.2, 1.2, 0x4a4039, { seg: 10 });
  // las chimeneas dobles del centro de la azotea
  for (const [du, dv] of [[-1.6, 0], [1.6, 0], [-1.6, -3.6], [1.6, -3.6]]) {
    const [cx, cz] = P(14.1 + du, -5.5 + dv);
    k.box(cx, H, cz, 1.0, 2.4, 1.0, 0xe4ddcc, { ry });
    k.box(cx, H + 2.4, cz, 1.5, 0.22, 1.5, 0x3a332c, { ry });
    k.cyl(cx, H + 2.62, cz, 0.05, 0.62, 0.7, 0xd6cfbd, { seg: 4, ry: ry + Math.PI / 4 });
  }
  // la puerta: recerco de cantería clara, hueco oscuro y dintel
  const [dx, dz] = P(14.1, 0.75);
  k.box(dx, 0, dz, 3.4, 4.0, 0.5, LIGHTSTONE, { ry });
  k.box(dx, 0.05, dz + N[1] * 0.32, 2.2, 3.1, 0.25, 0x17130f, { ry });
  // por el hueco no se pasa: el muro ya corta con los segmentos de abajo
  k.pic(dx + N[0] * 0.75, 4.9, dz + N[1] * 0.75, 4.6, 0.85, N[0], N[1], canvasTex(256, 48, (g, w, h) => {
    g.fillStyle = '#efe9dc'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#3a3025'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `600 ${Math.round(h * 0.56)}px "Barlow", Arial, sans-serif`;
    g.fillText('CASTILLO DE SAN JOSÉ', w / 2, h * 0.55);
  }));
  // bandera canaria en la azotea
  const [fx, fz] = P(14.1, -3);
  k.cyl(fx, H + 1.2, fz, 0.05, 0.07, 4.6, 0x9aa0a6, { seg: 8 });
  k.pic(fx + U[0] * 0.9, H + 5.1, fz + U[1] * 0.9, 1.7, 0.95, N[0], N[1], canariasTex());

  // la explanada de callaos oscuros, con su borde
  const ESPL = [P(-3, 1.2), P(31, 1.2), P(31, 22), P(-3, 22), P(-3, 1.2)];
  const suelo = paveMesh(polyTris(ESPL), 0.16, blackStones(), 0x8f8f8f);
  if (suelo) { suelo.name = 'explanadaSanJose'; scene.add(suelo); }
  // murete bajo por el borde de fuera
  for (const [a, b] of [[P(-3, 22), P(31, 22)], [P(-3, 1.2), P(-3, 22)], [P(31, 1.2), P(31, 22)]]) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), wry = Math.atan2(b[0] - a[0], b[1] - a[1]);
    k.box((a[0] + b[0]) / 2, 0.12, (a[1] + b[1]) / 2, 0.35, 0.55, L, 0x3c352d, { ry: wry });
    k.seg(a[0], a[1], b[0], b[1]);
  }
  // la portada tampoco se atraviesa (las esquinas quedan fuera del anillo del tambor)
  k.seg(...P(-1.2, 0.9), ...P(29.4, 0.9));
  // esculturas de madera, pirámide de bolas de piedra y bolas sueltas
  madera(k, ...P(6, 9), 0.6);
  madera(k, ...P(22, 13), -1.1, 1.15);
  const [bx, bz] = P(13, 15);
  for (const [ox, oz, y] of [[0, 0, 0.3], [0.62, 0, 0.3], [-0.62, 0, 0.3], [0, 0.62, 0.3], [0, -0.62, 0.3], [0.31, 0.31, 0.82], [-0.31, -0.31, 0.82], [0, 0, 1.3]]) {
    k.ball(bx + ox, y, bz + oz, 0.34, 0x8d857a, { seg: 8 });
  }
  k.block(bx, bz, 1.8, 1.8);
  for (let i = 0; i < 6; i++) {
    const [rx, rz] = P(2 + i * 5.6, 19.5);
    k.ball(rx, 0.1, rz, 0.3 + (i % 3) * 0.08, 0x6f675c, { seg: 7 });
  }
  // pitas por el borde de la explanada (como en la foto del atardecer)
  for (let i = 0; i < 7; i++) {
    const [px, pz] = P(0.5 + i * 4.6, 3.1);
    for (let j = 0; j < 7; j++) k.cyl(px, 0.1, pz, 0, 0.05, 0.6, 0x7b9468, { seg: 4, rx: 0.4 + (j % 3) * 0.24, ry: (j / 7) * Math.PI * 2 });
  }
  // rocas de lava por la ladera del mar
  let seed = 3;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 12; i++) {
    const a = -0.8 + rnd() * 2.6;
    const d = R + 3 + rnd() * 14;
    const rx = C[0] - N[0] * Math.cos(a) * d + U[0] * Math.sin(a) * d;
    const rz = C[1] - N[1] * Math.cos(a) * d + U[1] * Math.sin(a) * d;
    k.ball(rx, -0.25, rz, 0.5 + rnd() * 0.9, 0x24201c, { sy: 0.7, seg: 7 });
  }

  // ───── el anexo del castillo, en piedra y pegado (es parte del castillo, no una vivienda) ─────
  const aGeos = [];
  for (let i = 0; i < ANNEX.length; i++) {
    const [ax, az] = ANNEX[i], [bx2, bz2] = ANNEX[(i + 1) % ANNEX.length];
    const L = Math.hypot(bx2 - ax, bz2 - az);
    if (L < 0.8) continue;
    const wry = Math.atan2((bx2 - ax) / L, (bz2 - az) / L) + Math.PI / 2;
    const wall = scaleUV(new THREE.BoxGeometry(L + 0.25, ANNEX_H, 0.42), Math.max(1, L / 6), 0.62);
    wall.rotateY(wry);
    wall.translate((ax + bx2) / 2, ANNEX_H / 2, (az + bz2) / 2);
    aGeos.push(wall);
    // el pretil de la azotea
    const lip = scaleUV(new THREE.BoxGeometry(L + 0.25, 0.5, 0.34), Math.max(1, L / 6), 0.1);
    lip.rotateY(wry);
    lip.translate((ax + bx2) / 2, ANNEX_H + 0.2, (az + bz2) / 2);
    aGeos.push(lip);
  }
  for (const g of aGeos) {
    const m = new THREE.Mesh(g, stone);
    m.castShadow = true;
    m.receiveShadow = true;
    scene.add(m);
  }
  // la azotea oscura de picón del anexo
  const aRoof = paveMesh(polyTris(ANNEX), ANNEX_H + 0.02, picon(), 0x7d766c);
  if (aRoof) { aRoof.name = 'anexoSanJose'; scene.add(aRoof); }
  // puertas oscuras en los paños largos que miran fuera del castillo
  const CC = [1633.8, -938.9];
  for (let i = 0; i < ANNEX.length; i++) {
    const [ax, az] = ANNEX[i], [bx2, bz2] = ANNEX[(i + 1) % ANNEX.length];
    const L = Math.hypot(bx2 - ax, bz2 - az);
    const mx = (ax + bx2) / 2, mz = (az + bz2) / 2;
    if (L < 5.5 || Math.hypot(mx - CC[0], mz - CC[1]) < 17) continue;
    let nx = (bz2 - az) / L, nz = -(bx2 - ax) / L;   // normal hacia fuera del anexo
    if ((CC[0] - mx) * nx + (CC[1] - mz) * nz > 0) { nx = -nx; nz = -nz; }
    const wry = Math.atan2((bx2 - ax) / L, (bz2 - az) / L) + Math.PI / 2;
    k.box(mx + nx * 0.18, 0.05, mz + nz * 0.18, 1.7, 2.5, 0.12, 0x1b1713, { ry: wry });
  }
  colliders.addPolygon(ANNEX);

  // ───── la entrada desde la avenida: cebra, STOP, isletas de piedra, carteles y señales ─────
  const eRy = Math.atan2(EN[0], EN[1]);
  // el paso de cebra sobre la avenida, en la boca de la entrada
  for (let u = -4.4; u <= 4.45; u += 1.1) {
    const [zx, zz] = EP(u, 0);
    k.box(zx, 0.015, zz, 0.55, 0.05, 8.6, 0xe8e6de, { ry: eRy, list: k.shell });
  }
  // el acceso asfaltado hasta el parking
  const acc = paveMesh(bandTris([EP(0, 5.2), EP(0, 30)], 7), 0.06, asfalto(), 0xb9b9b9);
  if (acc) scene.add(acc);
  // STOP pintado en el carril de salida
  const stopTex = canvasTex(192, 96, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = '#e8e6de'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `800 ${Math.round(h * 0.7)}px "Barlow", Arial, sans-serif`;
    g.fillText('STOP', w / 2, h * 0.55);
  });
  stopTex.colorSpace = THREE.SRGBColorSpace;
  const stopGeo = new THREE.PlaneGeometry(2.6, 1.3);
  stopGeo.rotateX(-Math.PI / 2);
  stopGeo.rotateY(Math.atan2(-EN[0], -EN[1]));
  const [spx, spz] = EP(-1.9, 7.6);
  stopGeo.translate(spx, 0.1, spz);
  const stopMesh = new THREE.Mesh(stopGeo, new THREE.MeshBasicMaterial({ map: stopTex, transparent: true, depthWrite: false }));
  scene.add(stopMesh);
  // las dos isletas con murete de piedra volcánica, plantas y rocas
  const isla = (cu, cv) => {
    const [cx, cz] = EP(cu, cv);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const wx = cx + Math.cos(a) * 3.0, wz = cz + Math.sin(a) * 2.3;
      const wry2 = Math.atan2(-Math.sin(a), Math.cos(a)) + Math.PI / 2;
      k.box(wx, 0, wz, 2.0, 0.55, 0.42, 0x453e37, { ry: wry2 });
    }
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.4;
      k.ball(cx + Math.cos(a) * 1.5, 0.35, cz + Math.sin(a) * 1.2, 0.4, 0x5e7b50, { sy: 0.75, seg: 7 });
    }
    k.ball(cx - 0.8, 0.15, cz + 0.4, 0.5, 0x29241f, { sy: 0.7, seg: 7 });
    k.ball(cx + 1.1, 0.12, cz - 0.5, 0.38, 0x332d27, { sy: 0.7, seg: 7 });
    k.block(cx, cz, 6.4, 4.8);
    return [cx, cz];
  };
  isla(-6.2, 9);
  const [ipx, ipz] = isla(6.2, 9);
  // señal de prohibido (sentido contrario) en la isleta derecha
  k.cyl(ipx + 1.2, 0, ipz, 0.045, 0.05, 2.3, 0x8d9298, { seg: 8 });
  k.pic(ipx + 1.2 - EN[0] * 0.06, 2.0, ipz - EN[1] * 0.06, 0.78, 0.78, -EN[0], -EN[1], canvasTex(96, 96, (g, w, h) => {
    g.fillStyle = '#e8e5de'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c3281e'; g.beginPath(); g.arc(w / 2, h / 2, w * 0.46, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#f4f2ec'; g.fillRect(w * 0.16, h * 0.42, w * 0.68, h * 0.16);
  }));
  // el cartel informativo del museo, con sus dos paneles
  const [cix, ciz] = EP(7.8, 13.5);
  k.cyl(cix, 0, ciz, 0.05, 0.06, 2.6, 0x7b8187, { seg: 8 });
  k.pic(cix - EN[0] * 0.07, 1.95, ciz - EN[1] * 0.07, 1.5, 1.05, -EN[0], -EN[1], canvasTex(192, 136, (g, w, h) => {
    g.fillStyle = '#f2efe8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#133d7a'; g.fillRect(0, 0, w, h * 0.24);
    g.fillStyle = '#f2efe8'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `700 ${Math.round(h * 0.13)}px "Barlow", Arial, sans-serif`;
    g.fillText('CASTILLO DE SAN JOSÉ', w / 2, h * 0.12);
    g.fillStyle = '#3b3b3b';
    g.font = `600 ${Math.round(h * 0.1)}px "Barlow", Arial, sans-serif`;
    g.fillText('MIAC · Museo Internacional', w / 2, h * 0.42);
    g.fillText('de Arte Contemporáneo', w / 2, h * 0.56);
    g.fillStyle = '#888';
    g.fillRect(w * 0.12, h * 0.7, w * 0.76, h * 0.05);
    g.fillRect(w * 0.12, h * 0.82, w * 0.55, h * 0.05);
  }));
  // el tótem negro del MIAC
  const [tmx, tmz] = EP(-7.6, 14);
  k.box(tmx, 0, tmz, 1.5, 3.3, 0.45, 0x1c1a19, { ry: eRy });
  const miacTex = canvasTex(96, 192, (g, w, h) => {
    g.fillStyle = '#1c1a19'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#d1261f'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `800 ${Math.round(w * 0.42)}px "Barlow", Arial, sans-serif`;
    g.fillText('MIAC', w / 2, h * 0.18);
    g.fillStyle = '#cfcbc4';
    g.font = `600 ${Math.round(w * 0.14)}px "Barlow", Arial, sans-serif`;
    g.fillText('CASTILLO DE', w / 2, h * 0.4);
    g.fillText('SAN JOSÉ', w / 2, h * 0.5);
  });
  k.pic(tmx - EN[0] * 0.26, 1.1, tmz - EN[1] * 0.26, 1.4, 3.0, -EN[0], -EN[1], miacTex);
  // el monolito de piedra grabado
  const [mox, moz] = EP(5.5, 24);
  k.box(mox, 0, moz, 2.5, 1.35, 0.8, 0x4e463e, { ry: eRy });
  k.pic(mox - EN[0] * 0.44, 0.45, moz - EN[1] * 0.44, 2.2, 0.8, -EN[0], -EN[1], canvasTex(256, 96, (g, w, h) => {
    g.fillStyle = '#4e463e'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#b9b0a3'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `700 ${Math.round(h * 0.2)}px "Barlow", Arial, sans-serif`;
    g.fillText('MUSEO INTERNACIONAL', w / 2, h * 0.26);
    g.fillText('DE ARTE CONTEMPORÁNEO', w / 2, h * 0.52);
    g.fillText('CASTILLO DE SAN JOSÉ', w / 2, h * 0.78);
  }));
  // disco de 20 junto al monolito
  k.cyl(mox + 1.8, 0, moz, 0.045, 0.05, 2.2, 0x8d9298, { seg: 8 });
  k.pic(mox + 1.8 - EN[0] * 0.06, 1.9, moz - EN[1] * 0.06, 0.7, 0.7, -EN[0], -EN[1], canvasTex(96, 96, (g, w, h) => {
    g.fillStyle = '#e8e5de'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f4f2ec'; g.beginPath(); g.arc(w / 2, h / 2, w * 0.46, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#c3281e'; g.lineWidth = w * 0.09;
    g.beginPath(); g.arc(w / 2, h / 2, w * 0.4, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#222'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `800 ${Math.round(h * 0.4)}px "Barlow", Arial, sans-serif`;
    g.fillText('20', w / 2, h * 0.54);
  }));

  // ───── el parking de picón con la isleta de palmeras en medio ─────
  const LOT = [[1556, -987], [1603, -965], [1607, -941], [1584, -932], [1557, -947]];
  const lot = paveMesh(polyTris(LOT), 0.1, picon(), 0xcfcac2);
  if (lot) scene.add(lot);
  // la banda empedrada que cruza hacia la explanada
  const band = paveMesh(bandTris([[1559, -953], [1604, -951]], 2.4), 0.15, blackStones(), 0x9a9a9a);
  if (band) scene.add(band);
  // la isleta central de picón, con su bordillo de piedras
  const IC = [1580, -962];
  const islaC = paveMesh(discTris(IC[0], IC[1], 7.5, 24), 0.2, picon(), 0x968e82);
  if (islaC) scene.add(islaC);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    k.ball(IC[0] + Math.cos(a) * 7.5, 0.12, IC[1] + Math.sin(a) * 7.5, 0.3, 0x55504a, { sy: 0.7, seg: 6 });
  }
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.7;
    k.ball(IC[0] + Math.cos(a) * (2.5 + (i % 3)), 0.3, IC[1] + Math.sin(a) * (2 + (i % 2) * 1.6), 0.38, 0x5e7b50, { sy: 0.8, seg: 7 });
  }
  k.block(IC[0], IC[1], 14, 14);
  // farolas del parking
  for (const [fx2, fz2] of [[1562, -972], [1596, -958], [1586, -937]]) {
    k.cyl(fx2, 0, fz2, 0.07, 0.1, 5.2, 0x3a3f44, { seg: 7 });
    k.ball(fx2, 5.35, fz2, 0.24, 0xfff2cc, { seg: 7 });
  }

  const { group, segs } = k.build('castilloSanJose');
  scene.add(group);
  for (const sg of segs) colliders.addSegment(...sg);
  // el muro del castillo no se atraviesa
  const ring2 = [];
  for (let i = 0; i <= 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    ring2.push([C[0] + Math.cos(a) * (R + 0.6), C[1] + Math.sin(a) * (R + 0.6)]);
  }
  colliders.addPolygon(ring2);
}
