import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { paveMesh, bandTris, tierraCamino } from './suelos.js';
import { makeCar } from './carModels.js';
import { plateTexture } from './textures.js';
import { recolocarCalles, recolocarCasas, recolocarPunto, escenaReal, choquesReales } from './campoReal.js';

/**
 * El caserío del camino de tierra de las fotos de José Manuel (24 fotos de octubre de 2026): la pista de
 * tierra rojiza que baja entre casas blancas con la lancha "ANMARA UNO" en su remolque junto a la
 * VW California gris, el Skoda delante de la verja negra del 25, la casa de las persianas verdes con la
 * red del trampolín, la casa del balcón oscuro, la nave del portón crema con los palets, el solar sin
 * urbanizar con sus muros de piedra volcánica, las chumberas, el cardón y los postes de madera con el
 * tendido. Cuelga del final este del camino largo del campo (CAMPO_CAMINOS[7], casaCampo.js), con el
 * volcán detrás como en las fotos.
 */

const rect = (x0, z0, x1, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1], [x0, z0]];
const WHITE = 0xf2f0ea, WHITE_F = [244, 242, 236];

// los dos caminos nuevos: la calle del caserío (sigue hacia el sur desde el final del camino del campo)
// y el ramal que sale hacia el este por delante de la nave
const CALLE = { p: [[-1405, -3318], [-1398, -3344], [-1393, -3374], [-1391, -3404], [-1390, -3424]], w: 5 };
const RAMAL = { p: [[-1398, -3344], [-1370, -3348], [-1335, -3352], [-1302, -3354]], w: 4 };
// (Version 145) todo pasa por campoReal.js, que lo pone en su sitio de la foto oficial
export const ANMARA_ROADS = recolocarCalles([CALLE, RAMAL].map(c => ({ name: 'Camino de tierra', w: c.w, major: 0, dirt: 1, p: c.p })));

// las casas: las de las fotos con modelo propio (skip, ownRoof) y las blancas del fondo como las del resto
const BALCON = rect(-1420, -3342, -1406, -3330);     // la casa del balcón oscuro (foto 1)
const VERDE = rect(-1422, -3376, -1407, -3360);      // la casa de las persianas verdes (foto 2)
const NAVE = rect(-1380, -3408, -1354, -3390);       // la nave del portón crema (foto 4)
const CASA25 = rect(-1382, -3368, -1366, -3352);     // la casa de la verja negra del 25 (foto 3)
export const ANMARA_BUILDINGS = recolocarCasas([
  ...[{ p: BALCON, h: 6.2 }, { p: VERDE, h: 6.4 }, { p: NAVE, h: 5 }].map(b => ({ ...b, k: 'gen', skip: true, ownRoof: true })),
  { p: CASA25, h: 5.8, k: 'res', f: WHITE_F },
  { p: rect(-1352, -3344, -1336, -3330), h: 6, k: 'res', f: WHITE_F },
  { p: rect(-1322, -3348, -1306, -3334), h: 3.6, k: 'res', f: [238, 233, 222] },
  { p: rect(-1412, -3310, -1400, -3300), h: 3.4, k: 'res', f: WHITE_F },
]);

/** palmeras junto a las casas del ramal (fotos 20 y 23), para map.extraPalms */
export const ANMARA_PALMS = [[-1362, -3362, 8], [-1340, -3328, 7.5], [-1300, -3360, 7]].map(recolocarPunto);

/** el nombre pintado en el casco, en azul como el de las fotos */
function nombreLancha() {
  return canvasTex(256, 48, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = '#1d4e89';
    g.font = 'bold 30px Arial';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('ANMARA UNO', w / 2, h / 2);
  });
}

/** la lancha blanca "ANMARA UNO" sobre su remolque, matrícula 8814 LPL (fotos 1 a 3) */
function lancha(k, x, z) {
  // el remolque: dos largueros grises, el eje con sus ruedas y la lanza hacia la calle
  for (const s of [-0.7, 0.7]) k.box(x + s, 0.42, z, 0.1, 0.1, 4.6, 0x8a8f94);
  k.box(x, 0.42, z - 2.5, 0.08, 0.1, 0.9, 0x8a8f94, { ry: 0 });
  k.box(x, 0.35, z - 3.1, 0.3, 0.25, 0.4, 0x6a6f74);
  for (const s of [-0.95, 0.95]) {
    const w = new THREE.CylinderGeometry(0.28, 0.28, 0.18, 10);
    w.rotateZ(Math.PI / 2);
    w.translate(x + s, 0.28, z + 0.4);
    k.add(w, 0x1a1a1a);
  }
  k.pic(x, 0.5, z + 2.31, 0.52, 0.11, 0, 1, plateTexture('8814 LPL'));
  // el casco: blanco con la proa en cuña, el motor fueraborda oscuro y el parabrisas
  k.box(x, 0.52, z + 0.3, 1.7, 0.95, 3.4, 0xf4f3ef);
  for (const s of [-1, 1]) {
    const g = new THREE.BoxGeometry(0.95, 0.95, 1.9);
    g.translate(0, 0.475, -0.95);
    g.rotateY(s * 0.42);
    g.translate(x + s * 0.42, 0.52, z - 1.25);
    k.add(g, 0xf4f3ef);
  }
  k.box(x, 0.52, z - 2.35, 0.5, 0.8, 0.5, 0xe9e7e1);
  k.box(x, 1.42, z - 1.1, 1.2, 0.08, 1.6, 0xe9e7e1);
  k.box(x, 1.47, z + 1.05, 0.26, 0.9, 0.5, 0x23262a);     // el fueraborda
  k.cyl(x, 1.1, z + 1.35, 0.05, 0.05, 0.5, 0x23262a, { seg: 6 });
  k.box(x, 1.5, z - 0.45, 1.1, 0.35, 0.05, 0x9ec4de);     // el parabrisas
  const tex = nombreLancha();
  k.pic(x - 0.86, 1.05, z - 0.3, 1.5, 0.28, -1, 0, tex);
  k.pic(x + 0.86, 1.05, z - 0.3, 1.5, 0.28, 1, 0, tex);
  k.block(x, z, 2, 5.2);
}

/** la casa blanca de dos plantas con el balcón de barandilla oscura (foto 1) */
function casaBalcon(k) {
  const [x0, z0, x1, z1] = [-1420, -3342, -1406, -3330], cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, H = 6.2;
  k.box(cx, 0, cz, x1 - x0, H, z1 - z0, WHITE, { list: k.shell });
  for (const [x, z, w, d] of [[cx, z0 + 0.12, x1 - x0, 0.24], [cx, z1 - 0.12, x1 - x0, 0.24], [x0 + 0.12, cz, 0.24, z1 - z0], [x1 - 0.12, cz, 0.24, z1 - z0]]) {
    k.box(x, H, z, w, 0.4, d, WHITE, { list: k.shell });
  }
  // el balcón del este, con el suelo volado y la barandilla oscura de barrotes
  const bz = cz, bx = x1 + 0.7;
  k.box(bx, 3.05, bz, 1.5, 0.14, 4.2, WHITE);
  for (const s of [-2.08, 2.08]) k.box(bx, 3.19, bz + s, 1.44, 0.95, 0.05, 0x2a2d31);
  k.box(bx + 0.72, 3.19, bz, 0.05, 0.95, 4.2, 0x2a2d31);
  for (let i = -5; i <= 5; i++) k.box(bx + 0.7, 3.19, bz + i * 0.4, 0.03, 0.9, 0.03, 0x2a2d31);
  k.box(x1 + 0.02, 3.3, bz, 0.08, 2.1, 1.3, 0x3a3f36);     // la puerta del balcón
  for (const z of [z0 + 2.2, z1 - 2.2]) {
    k.box(x1 + 0.04, 1.1, z, 0.1, 1.3, 1.1, 0x2e3a2f);
    k.box(x1 + 0.06, 1.2, z, 0.1, 1.1, 0.9, 0x161a1c);
  }
  k.box(x1 + 0.04, 0, cz + 3.6, 0.1, 2.2, 1.1, 0x4a4238);  // la puerta de la calle
  k.block(cx, cz, x1 - x0, z1 - z0);
}

/** la casa cúbica de las persianas verdes, el muro bajo y la red negra del trampolín (foto 2) */
function casaVerde(k, scene) {
  const [x0, z0, x1, z1] = [-1422, -3376, -1407, -3360], cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, H = 6.4;
  k.box(cx, 0, cz, x1 - x0, H, z1 - z0, WHITE, { list: k.shell });
  for (const [x, z, w, d] of [[cx, z0 + 0.12, x1 - x0, 0.24], [cx, z1 - 0.12, x1 - x0, 0.24], [x0 + 0.12, cz, 0.24, z1 - z0], [x1 - 0.12, cz, 0.24, z1 - z0]]) {
    k.box(x, H, z, w, 0.4, d, WHITE, { list: k.shell });
  }
  // las ventanas con sus persianas verdes abatibles a los lados, arriba y abajo de la cara de la calle
  for (const y of [1.3, 4.3]) {
    for (const z of [z0 + 3.2, z1 - 3.2]) {
      k.box(x1 + 0.04, y, z, 0.1, 1.25, 1.05, 0x161a1c);
      for (const s of [-0.85, 0.85]) k.box(x1 + 0.05, y - 0.03, z + s, 0.08, 1.3, 0.55, 0x2e6b3a);
    }
  }
  for (const z of [z0 + 3.4, z1 - 3.4]) {
    k.box(cx, 4.3, z0 - 0.04 + (z > cz ? z1 - z0 + 0.08 : 0), 1.05, 1.25, 0.1, 0x161a1c);
  }
  k.box(x1 + 0.04, 0, cz, 0.1, 2.2, 1.1, 0x3a4a3c);
  k.block(cx, cz, x1 - x0, z1 - z0);
  // el patio delantero con el muro bajo encalado y, dentro, el trampolín con su red negra
  const px1 = x1 + 5;
  k.box((x1 + px1) / 2, 0, z0 + 0.15, px1 - x1, 1.05, 0.3, WHITE, { list: k.shell });
  k.box(px1 - 0.15, 0, cz, 0.3, 1.05, z1 - z0, WHITE, { list: k.shell });
  k.box((x1 + px1) / 2, 0, z1 - 0.15, px1 - x1, 1.05, 0.3, WHITE, { list: k.shell });
  k.seg(x1, z0, px1, z0).seg(px1, z0, px1, z1).seg(px1, z1, x1, z1);
  const tx = x1 + 2.5, tz = cz, R = 1.5;
  const aro = new THREE.TorusGeometry(R, 0.06, 6, 20);
  aro.rotateX(Math.PI / 2);
  aro.translate(tx, 0.85, tz);
  k.add(aro, 0x15171a);
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + Math.PI / 4;
    k.box(tx + Math.cos(a) * R * 0.9, 0, tz + Math.sin(a) * R * 0.9, 0.07, 0.85, 0.07, 0x15171a);
    k.box(tx + Math.cos(a) * R, 0.85, tz + Math.sin(a) * R, 0.06, 1.8, 0.06, 0x15171a);
  }
  const lona = new THREE.CircleGeometry(R - 0.08, 20);
  lona.rotateX(-Math.PI / 2);
  lona.translate(tx, 0.86, tz);
  k.add(lona, 0x1c1e22);
  const net = new THREE.Mesh(
    new THREE.CylinderGeometry(R, R, 1.8, 16, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x111316, transparent: true, opacity: 0.35, side: THREE.DoubleSide, roughness: 0.9 }),
  );
  net.position.set(tx, 1.75, tz);
  net.name = 'redTrampolin';
  scene.add(net);
}

/** la nave del portón basculante crema, con los palets de madera, las macetas y las garrafas (foto 4) */
function nave(k) {
  const [x0, z0, x1, z1] = [-1380, -3408, -1354, -3390], cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, H = 5;
  k.box(cx, 0, cz, x1 - x0, H, z1 - z0, 0xdcd6c8, { list: k.shell });
  k.box(cx, H, cz, x1 - x0 + 0.2, 0.3, z1 - z0 + 0.2, 0xcac4b6, { list: k.shell });
  // el portón en la cara que mira al camino, con sus lamas horizontales
  k.box(x0 - 0.04, 0, cz, 0.12, 3.8, 5, 0xe8dcc0);
  for (let y = 0.5; y < 3.8; y += 0.55) k.box(x0 - 0.1, y, cz, 0.04, 0.05, 4.8, 0xd4c8aa);
  k.box(x0 - 0.04, 0, cz + 4.2, 0.1, 2.2, 1, 0x8a8478);
  k.block(cx, cz, x1 - x0, z1 - z0);
  // los palets apilados contra la fachada, dos montones de alturas distintas
  for (const [px, pz, n] of [[x0 - 1.4, cz - 3.4, 6], [x0 - 1.3, cz - 4.9, 3]]) {
    for (let i = 0; i < n; i++) {
      k.box(px, i * 0.16, pz, 1.2, 0.05, 1.0, 0x9a7b55);
      for (const s of [-0.5, 0, 0.5]) k.box(px, i * 0.16 + 0.05, pz + s * 0.9, 1.2, 0.09, 0.09, 0x8a6c48);
    }
    k.block(px, pz, 1.3, 1.1);
  }
  // las macetas con sus plantas y las garrafas azules junto a la puerta
  for (const [px, pz] of [[x0 - 1, cz + 2.2], [x0 - 1, cz + 2.9]]) {
    k.cyl(px, 0, pz, 0.16, 0.12, 0.3, 0xb06a4a, { seg: 8 });
    k.ball(px, 0.32, pz, 0.26, 0x4f7a3a, { sy: 1.1, seg: 7 });
  }
  for (let i = 0; i < 3; i++) k.box(x0 - 0.6, 0, cz + 5.2 + i * 0.35, 0.26, 0.42, 0.26, 0x7ab6d8);
}

/** la verja negra del número 25, con el cartel de la alarma, en el muro blanco de la casa (foto 3) */
function verja25(k) {
  const x = -1386, z0 = -3368, z1 = -3352, gz0 = -3362.2, gz1 = -3358.2;
  k.box(x, 0, (z0 + gz0) / 2, 0.3, 2.1, gz0 - z0, WHITE, { list: k.shell });
  k.box(x, 0, (gz1 + z1) / 2, 0.3, 2.1, z1 - gz1, WHITE, { list: k.shell });
  for (const z of [gz0 - 0.2, gz1 + 0.2]) k.box(x, 0, z, 0.45, 2.35, 0.45, WHITE);
  // la hoja negra de chapa, con su remate
  k.box(x, 0, (gz0 + gz1) / 2, 0.08, 2.0, gz1 - gz0, 0x1b1d20);
  k.box(x, 2.0, (gz0 + gz1) / 2, 0.1, 0.08, gz1 - gz0 + 0.1, 0x1b1d20);
  k.seg(x, z0, x, z1);
  const num = canvasTex(64, 64, (g, w, h) => {
    g.fillStyle = '#f4f2ec'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#23262a'; g.font = 'bold 40px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('25', w / 2, h / 2 + 2);
  });
  k.pic(x - 0.24, 1.6, gz0 - 0.2, 0.28, 0.28, -1, 0, num);
  const alarma = canvasTex(96, 96, (g, w, h) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#1f4fa8'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6);
    g.fillStyle = '#c8352a'; g.font = 'bold 26px Arial'; g.textAlign = 'center';
    g.fillText('ALARMA', w / 2, 40);
    g.fillStyle = '#1f4fa8'; g.font = 'bold 14px Arial';
    g.fillText('CONECTADA', w / 2, 66);
  });
  k.pic(x - 0.17, 1.45, z1 - 1.2, 0.42, 0.42, -1, 0, alarma);
}

/** muro canario bajo encalado con pilares y sus bolas de adorno (fotos 1, 3 y 21) */
function muroBolas(k, x, z0, z1) {
  k.box(x, 0, (z0 + z1) / 2, 0.28, 1.15, z1 - z0, WHITE, { list: k.shell });
  for (let z = z0; z <= z1 + 0.01; z += (z1 - z0) / Math.max(1, Math.round((z1 - z0) / 4))) {
    k.box(x, 0, z, 0.45, 1.5, 0.45, WHITE);
    k.ball(x, 1.62, z, 0.2, 0xe6e2d8, { seg: 8 });
  }
  k.seg(x, z0 - 0.2, x, z1 + 0.2);
}

/** poste de madera del tendido, como los del campo; devuelve la punta para los cables */
function poste(k, x, z) {
  k.cyl(x, 0, z, 0.1, 0.14, 8, 0x5a4636, { seg: 7 });
  k.box(x, 7.3, z, 1.6, 0.12, 0.12, 0x4a3a2c);
  for (const s of [-0.7, 0.7]) k.cyl(x + s, 7.42, z, 0.04, 0.05, 0.16, 0xd8d8d0, { seg: 6 });
  k.seg(x - 0.15, z, x + 0.15, z);
  return [x, 7.5, z];
}

/** los cables colgando entre postes seguidos */
function cables(scene, tops) {
  const wires = new THREE.Group();
  wires.name = 'cablesAnmara';
  const mat = new THREE.MeshBasicMaterial({ color: 0x2a2a2a });
  for (let i = 0; i < tops.length - 1; i++) {
    const a = new THREE.Vector3(...tops[i]), b = new THREE.Vector3(...tops[i + 1]);
    if (a.distanceTo(b) > 70) continue;
    for (const s of [-0.7, 0.7]) {
      const A = a.clone().add(new THREE.Vector3(s, 0, 0)), B = b.clone().add(new THREE.Vector3(s, 0, 0));
      const curve = new THREE.QuadraticBezierCurve3(A, A.clone().lerp(B, 0.5).add(new THREE.Vector3(0, -0.9, 0)), B);
      wires.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 8, 0.015, 3, false), mat));
    }
  }
  scene.add(wires);
}

/** chumbera: palas verdes planas en abanico (fotos 9 y 21) */
function chumbera(k, x, z, n = 6) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + x * 0.7;
    k.ball(x + Math.cos(a) * 0.35, 0.35 + (i % 3) * 0.3, z + Math.sin(a) * 0.35, 0.42, 0x5f8a4e, { sx: 0.25, sy: 1.1, seg: 7 });
  }
  k.ball(x, 0.2, z, 0.3, 0x55804a, { sy: 0.7, seg: 6 });
}

/** cardón canario: columnas verticales apretadas (foto 17) */
function cardon(k, x, z) {
  for (let i = 0; i < 7; i++) {
    const a = i * 2.39, r = i ? 0.35 + (i % 3) * 0.18 : 0;
    k.cyl(x + Math.cos(a) * r, 0, z + Math.sin(a) * r, 0.1, 0.13, 1.3 + ((i * 7) % 5) * 0.28, 0x3f7047, { seg: 6 });
  }
  k.block(x, z, 1.4, 1.4);
}

/** pino bajo de los bordes del camino (fotos 5 y 13) */
function pino(k, x, z) {
  k.cyl(x, 0, z, 0.1, 0.14, 1.6, 0x5a4636, { seg: 6 });
  k.cyl(x, 1.3, z, 0.02, 1.4, 2.2, 0x3a5c38, { seg: 7 });
  k.cyl(x, 2.9, z, 0.02, 1.0, 1.7, 0x40663c, { seg: 7 });
}

/** roca volcánica grande suelta (fotos 7, 15 y 22) */
function roca(k, x, z, r) {
  const g = new THREE.DodecahedronGeometry(r, 0);
  g.scale(1.2, 0.75, 1);
  g.rotateY(x * 1.3);
  g.translate(x, r * 0.45, z);
  k.add(g, 0x3a3532);
  k.block(x, z, r * 2, r * 1.7);
}

/** restos de muro de piedra volcánica del solar sin urbanizar (fotos 5 y 8) */
function muroPiedra(k, ax, az, bx, bz) {
  const L = Math.hypot(bx - ax, bz - az), n = Math.round(L / 0.55);
  for (let i = 0; i <= n; i++) {
    const t = i / n, h = 0.5 + Math.sin(i * 3.1 + ax) * 0.2;
    for (let y = 0; y < h; y += 0.3) {
      k.ball(ax + (bx - ax) * t + Math.sin(i * 7 + y * 13) * 0.1, y + 0.12, az + (bz - az) * t, 0.32, 0x3a3532, { sx: 1.3, sy: 0.6, seg: 5 });
    }
  }
  k.seg(ax, az, bx, bz);
}

/** coche aparcado con su caja de choque; plate cambia la matrícula por la de las fotos */
function aparcado(scene, colliders, type, color, x, z, ry, name, { plate = null, hideAds = false, hl = 2.2 } = {}) {
  const c = makeCar(type, color);
  if (hideAds) c.group.traverse(o => { if (o.isMesh && o.geometry?.type === 'PlaneGeometry' && Math.abs(Math.abs(o.rotation.y) - Math.PI / 2) < 1e-6) o.visible = false; });
  if (plate) {
    const mat = new THREE.MeshStandardMaterial({ map: plateTexture(plate), roughness: 0.35 });
    c.group.traverse(o => { if (o.isMesh && o.geometry?.parameters?.width === 0.52 && o.geometry.parameters.height === 0.11) o.material = mat; });
  }
  c.group.position.set(x, 0.16, z);
  c.group.rotation.y = ry;
  c.group.name = name;
  scene.add(c.group);
  const [hw, hd] = Math.abs(Math.sin(ry)) > 0.5 ? [hl, 1] : [1, hl];
  for (const [a, b, e, f] of [[-hw, -hd, hw, -hd], [hw, -hd, hw, hd], [hw, hd, -hw, hd], [-hw, hd, -hw, -hd]]) colliders.addSegment(x + a, z + b, x + e, z + f);
}

export function buildCaminoAnmara(sceneDeVerdad, choquesDeVerdad) {
  const scene = escenaReal(sceneDeVerdad), colliders = choquesReales(choquesDeVerdad);
  // la pista de tierra con sus rodadas, como los caminos del campo (la tierra de debajo ya la pone casaCampo)
  const tierraTex = tierraCamino();
  for (const R of [CALLE, RAMAL]) {
    const road = paveMesh(bandTris(R.p, R.w), 0.12, tierraTex, 0xffffff);
    if (road) { road.name = 'caminoAnmara'; scene.add(road); }
    for (const off of [-0.85, 0.85]) {
      const line = R.p.map(([x, z], i) => {
        const [ax, az] = R.p[Math.max(0, i - 1)], [bx, bz] = R.p[Math.min(R.p.length - 1, i + 1)];
        const L = Math.hypot(bx - ax, bz - az) || 1;
        return [x - (bz - az) / L * off, z + (bx - ax) / L * off];
      });
      const rut = paveMesh(bandTris(line, 0.45), 0.125, tierraTex, 0xe8dccf);
      if (rut) scene.add(rut);
    }
  }
  const k = new Kit();
  casaBalcon(k);
  casaVerde(k, scene);
  nave(k);
  verja25(k);
  lancha(k, -1402.9, -3347);
  muroBolas(k, -1408, -3330, -3319);
  muroBolas(k, -1388, -3351, -3348.2);
  // el solar sin urbanizar entre la casa del 25 y la nave: muros de piedra volcánica a medio caer
  muroPiedra(k, -1384, -3376, -1366, -3378);
  muroPiedra(k, -1366, -3378, -1364, -3388);
  muroPiedra(k, -1385, -3340, -1372, -3336);
  // las chumberas junto a los muros, el cardón del cruce y los pinos del borde
  chumbera(k, -1404.8, -3333);
  chumbera(k, -1387.2, -3349);
  chumbera(k, -1384.5, -3410, 5);
  cardon(k, -1388.5, -3418);
  pino(k, -1426, -3352);
  pino(k, -1413, -3392);
  pino(k, -1332, -3340);
  // las rocas volcánicas grandes de los bordes
  roca(k, -1410, -3312, 0.8);
  roca(k, -1377.5, -3338, 0.65);
  roca(k, -1398.5, -3428, 0.9);
  roca(k, -1348, -3362, 0.7);
  roca(k, -1296, -3350, 0.75);
  // los postes de madera con el tendido: calle abajo y a lo largo del ramal
  cables(scene, [poste(k, -1391, -3322), poste(k, -1388.5, -3356), poste(k, -1386.5, -3390), poste(k, -1386, -3420)]);
  cables(scene, [poste(k, -1390.5, -3340), poste(k, -1362, -3343), poste(k, -1330, -3347), poste(k, -1302, -3350)]);
  const { group, segs } = k.build('caminoAnmara');
  scene.add(group);
  for (const sg of segs) colliders.addSegment(...sg);
  // la VW California gris claro junto a la lancha, el Skoda gris delante de la verja del 25 y
  // el coche blanco aparcado junto a la nave
  aparcado(scene, colliders, 'van', 0xb8bec4, -1402.6, -3356.5, Math.PI, 'vwCalifornia', { hideAds: true, hl: 2.9 });
  aparcado(scene, colliders, 'estate', 0x8a8f94, -1390.3, -3360.2, Math.PI / 2, 'skoda25', { plate: '0572 MCX' });
  aparcado(scene, colliders, 'hatch', 0xf2f2f2, -1385.2, -3386, Math.PI, 'cocheNave');
}
