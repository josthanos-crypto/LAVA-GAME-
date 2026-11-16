import * as THREE from 'three';

/**
 * Casa Fajardo (calle Fajardo 5, Arrecife; «La Casa Grande», antiguo Museo Arqueológico),
 * como en la foto de la fachada (fotos-casa-fajardo/foto-16.jpg y foto-15.jpg): una planta
 * con azotea balaustrada, azulejo blanco-verdoso a soga, franja de damero verde bajo la
 * cornisa, arcos con marco de piedra blanca, puerta central de madera con escalera de granito,
 * verja blanca con pilares y bolas, número 5 y las letras «F R» en la puerta de la verja.
 * Va en el bloque 104 del mapa: se le abre un hueco en la manzana (tuneFajardo) y la casa
 * se levanta en ese hueco.
 */

// huella de la casa (esquinas en metros del juego, en orden)
const A = [-30, 240], B = [-12, 224], C = [-1, 236], D = [-16, 256];
const HOUSE = [A, B, C, D];
const H_ROOF = 6.0, H_WALL = 7.1, FLOOR = 1.2, PLINTH = 1.0;
const BLOCK_ID = [-63.2, 217.2];                // primer vértice del bloque 104
const BLOCK_NOTCH = [
  [-40.25, 195.35], [-63.24, 217.15], [4.83, 297.02], [22.38, 293.08], [36.78, 289.85],
  [39.02, 274.93], [-5.12, 230.62], [-0.22, 235.96], [-15.96, 256.95], [-30.84, 239.95],
  [-12.27, 223.44],
];
const FRONT_FENCE = 1.5;                         // la verja, a metro y medio de la fachada
const CREAM = '#efe5cd', TILE_G = '#2e7d4f', TILE_W = '#eef3ee', WOOD = '#5b3a22', DOOR = '#4e2f1c';
const GREY = '#8f918d', RED = '#9b5a4c', IRON = '#f4f3ee';

const unit = (v) => { const l = Math.hypot(v[0], v[1]); return [v[0] / l, v[1] / l]; };

/** lado de la casa: longitud, dirección y normal hacia fuera */
function edge(P0, P1) {
  const len = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]);
  const dir = unit([P1[0] - P0[0], P1[1] - P0[1]]);
  let nrm = [dir[1], -dir[0]];
  const cx = HOUSE.reduce((s, p) => s + p[0], 0) / 4, cz = HOUSE.reduce((s, p) => s + p[1], 0) / 4;
  const mx = (P0[0] + P1[0]) / 2, mz = (P0[1] + P1[1]) / 2;
  if ((mx - cx) * nrm[0] + (mz - cz) * nrm[1] < 0) nrm = [-nrm[0], -nrm[1]];
  return { P0, len, dir, nrm, a: Math.atan2(nrm[0], nrm[1]) };
}

/** punto a s metros del inicio del lado y d metros hacia fuera */
const at = (e, s, d) => [e.P0[0] + e.dir[0] * s + e.nrm[0] * d, e.P0[1] + e.dir[1] * s + e.nrm[1] * d];

function tex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

const PX_M = 64;   // píxeles por metro en las fachadas

/** hueco en arco: `s` centro, `w` ancho, `bottom` alféizar, `spring` arranque del arco */
function opening(g, X, Y, { s, w, bottom, spring }, kind) {
  const x0 = X(s - w / 2), x1 = X(s + w / 2), r = (x1 - x0) / 2, xc = (x0 + x1) / 2;
  const yc = Y(spring), yb = Y(bottom), fr = 9;
  const arch = (x0a, x1a, ra) => {
    g.beginPath();
    g.moveTo(x0a, yb); g.lineTo(x0a, yc); g.arc(xc, yc, ra, Math.PI, 0); g.lineTo(x1a, yb); g.closePath();
  };
  g.fillStyle = CREAM;
  arch(x0 - fr, x1 + fr, r + fr); g.fill();
  if (kind === 'door') {
    g.fillStyle = DOOR; arch(x0, x1, r); g.fill();
    g.strokeStyle = '#3a2214'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(xc, yc - r); g.lineTo(xc, yb); g.stroke();
    return;
  }
  const grd = g.createLinearGradient(0, yc - r, 0, yb);
  grd.addColorStop(0, '#42586a'); grd.addColorStop(1, '#a9bcc4');
  g.fillStyle = grd; arch(x0, x1, r); g.fill();
  g.fillStyle = WOOD;
  g.fillRect(xc - 3, yc - r, 6, yb - yc + r);
  for (const x of [x0 + (x1 - x0) / 4, x1 - (x1 - x0) / 4]) g.fillRect(x - 2, yc - r * 0.2, 4, yb - yc + r * 0.2);
  for (let y = yb - 14; y > yc; y -= 60) g.fillRect(x0, y, x1 - x0, 3);
}

/** fachada de azulejo blanco-verdoso con franja de damero, cornisa y balaustrada */
function facadeTex(len, hgt, openings = []) {
  const W = Math.round(len * PX_M), H = Math.round(hgt * PX_M);
  return tex(W, H, (g) => {
    const X = (s) => (s * W) / len, Y = (y) => H - (y * H) / hgt;
    g.fillStyle = '#dfe9e4'; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(120,150,140,0.35)'; g.lineWidth = 1;
    for (let y = 0, row = 0; y < hgt; y += 0.3, row++) {
      g.beginPath(); g.moveTo(0, Y(y)); g.lineTo(W, Y(y)); g.stroke();
      for (let x = (row % 2) * 0.3; x < len; x += 0.6) {
        g.beginPath(); g.moveTo(X(x), Y(y)); g.lineTo(X(x), Y(y + 0.3)); g.stroke();
      }
    }
    g.fillStyle = GREY; g.fillRect(0, Y(PLINTH), W, Y(0) - Y(PLINTH));
    g.fillStyle = RED; g.fillRect(0, Y(PLINTH + 0.15), W, Y(PLINTH) - Y(PLINTH + 0.15));
    for (let x = 0, k = 0; x < len; x += 0.2, k++) {
      for (const [y, c] of [[5.0, 0], [5.2, 1], [5.4, 0]]) {
        g.fillStyle = (k + c) % 2 ? TILE_W : TILE_G;
        g.fillRect(X(x), Y(y + 0.2), (0.2 * W) / len, Y(y) - Y(y + 0.2));
      }
    }
    g.fillStyle = CREAM; g.fillRect(0, Y(5.95), W, Y(5.6) - Y(5.95));
    g.fillStyle = '#c9bca3'; g.fillRect(0, Y(5.62), W, 4);
    g.fillStyle = '#f2ebd9'; g.fillRect(0, Y(H_WALL), W, Y(5.95) - Y(H_WALL));
    g.fillStyle = '#7d7566';
    for (let x = 0.35; x < len; x += 0.55) {
      g.beginPath(); g.ellipse(X(x), Y(6.5), 0.13 * PX_M, 0.2 * PX_M, 0, 0, Math.PI * 2); g.fill();
    }
    for (const o of openings) opening(g, X, Y, o, o.kind);
  });
}

/** la verja: barrotes blancos con puntas, transparentes alrededor */
function fenceTex(len) {
  const W = Math.round(len * 100), H = 240;
  return tex(W, H, (g) => {
    g.fillStyle = IRON;
    const y = (m) => H - m * 100;
    for (let x = 0.04; x < len; x += 0.1) {
      g.fillRect(x * 100, y(2.0), 3, 2.0 * 100);
      g.beginPath(); g.moveTo(x * 100 - 4, y(2.0)); g.lineTo(x * 100 + 1, y(2.3)); g.lineTo(x * 100 + 6, y(2.0)); g.fill();
    }
    g.fillRect(0, y(0.35), W, 4); g.fillRect(0, y(1.6), W, 4);
  });
}

function numberTex() {
  return tex(128, 160, (g) => {
    g.fillStyle = '#1d1d1d'; g.fillRect(0, 0, 128, 160);
    g.fillStyle = '#f5f5f0'; g.font = 'bold 110px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('5', 64, 84);
  });
}

function monogramTex() {
  return tex(256, 128, (g) => {
    g.font = 'bold 84px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineWidth = 10; g.strokeStyle = '#7a6f63'; g.strokeText('F R', 128, 66);
    g.fillStyle = '#fbfbf7'; g.fillText('F R', 128, 66);
  });
}

function mesh(geo, mat) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

/** la fachada principal, su lado y su fondo; la verja y la escalera van en la calle */
export function tuneFajardo(map) {
  const i = (map.buildings || []).findIndex(b => Math.abs(b.p[0][0] - BLOCK_ID[0]) < 0.1 && Math.abs(b.p[0][1] - BLOCK_ID[1]) < 0.1);
  if (i >= 0) map.buildings[i].p = [...BLOCK_NOTCH, BLOCK_NOTCH[0]];
  map.buildings.push({ p: [...HOUSE, A], h: H_ROOF, s: 0, skip: true, fajardo: true });
}

export function buildFajardo(scene) {
  const group = new THREE.Group();
  group.name = 'casaFajardo';
  const front = edge(B, C), side = edge(C, D), back1 = edge(A, B), back2 = edge(D, A);
  const frontDoor = 8.15;
  const winsFront = [2.0, 5.2, 11.1, 14.3].map(s => ({ s, w: 1.3, bottom: 1.6, spring: 4.0, kind: 'win' }));
  const doorOpen = { s: frontDoor, w: 1.9, bottom: FLOOR, spring: 3.0, kind: 'door' };
  const winsSide = [3.5, 8.5, 15.5].map(s => ({ s, w: 1.3, bottom: 1.6, spring: 4.0, kind: 'win' }));

  const wallMat = (map) => new THREE.MeshStandardMaterial({ map, roughness: 0.8 });
  const panel = (e, offset, texMap, len) => {
    const g = new THREE.PlaneGeometry(len, H_WALL);
    g.rotateY(e.a);
    const c = at(e, len / 2, offset);
    g.translate(c[0], H_WALL / 2, c[1]);
    return mesh(g, wallMat(texMap));
  };
  const OFF = 0.12;   // las paredes van un poco fuera de la manzana para no parpadear
  group.add(panel(front, OFF, facadeTex(front.len, H_WALL, [doorOpen, ...winsFront]), front.len));
  group.add(panel(side, OFF, facadeTex(side.len, H_WALL, winsSide), side.len));
  group.add(panel(back1, OFF, facadeTex(back1.len, H_WALL), back1.len));
  group.add(panel(back2, OFF, facadeTex(back2.len, H_WALL), back2.len));

  const roofGeo = new THREE.ShapeGeometry(new THREE.Shape(HOUSE.map(([x, z]) => new THREE.Vector2(x, -z))));
  roofGeo.rotateX(-Math.PI / 2);
  roofGeo.translate(0, H_ROOF, 0);
  group.add(mesh(roofGeo, new THREE.MeshStandardMaterial({ color: 0x9b958b, roughness: 0.95, side: THREE.DoubleSide })));

  const pinnacleMat = new THREE.MeshStandardMaterial({ color: 0xf2ebd9, roughness: 0.7 });
  for (const s of [0.6, 5.5, 10.8, 15.7]) {
    const g = new THREE.ConeGeometry(0.22, 0.5, 8);
    g.rotateY(front.a);
    const c = at(front, s, OFF + 0.2);
    g.translate(c[0], H_WALL + 0.25, c[1]);
    group.add(mesh(g, pinnacleMat));
  }

  // la escalera de granito (seis peldaños hasta el suelo de la casa)
  const graniteMat = new THREE.MeshStandardMaterial({ color: 0x9a9891, roughness: 0.9 });
  for (let k = 0; k < 6; k++) {
    const top = (k + 1) * (FLOOR / 6), depth = 0.22;
    const g = new THREE.BoxGeometry(2.2, top, depth);
    g.rotateY(front.a);
    const c = at(front, frontDoor, OFF + depth * (5 - k) + depth / 2);
    g.translate(c[0], top / 2, c[1]);
    group.add(mesh(g, graniteMat));
  }

  // verja blanca: tramos, puerta en el centro y pilares con bola
  const fenceMat = new THREE.MeshStandardMaterial({ map: null, color: IRON, roughness: 0.5, side: THREE.DoubleSide, alphaTest: 0.5, transparent: false });
  const gateL = frontDoor - 1.6, gateR = frontDoor + 1.6;
  const segs = [[0, gateL], [gateR, front.len]];
  for (const [s0, s1] of segs) {
    const len = s1 - s0;
    const m = fenceMat.clone();
    m.map = fenceTex(len);
    const g = new THREE.PlaneGeometry(len, 2.3);
    g.rotateY(front.a);
    const c = at(front, s0 + len / 2, FRONT_FENCE);
    g.translate(c[0], 2.3 / 2 - 0.05, c[1]);
    group.add(mesh(g, m));
    const lowG = new THREE.BoxGeometry(len, 0.9, 0.3);
    lowG.rotateY(front.a);
    const lc = at(front, s0 + len / 2, FRONT_FENCE);
    lowG.translate(lc[0], 0.45, lc[1]);
    group.add(mesh(lowG, new THREE.MeshStandardMaterial({ color: GREY, roughness: 0.9 })));
  }
  const gateG = new THREE.PlaneGeometry(gateR - gateL, 2.3);
  const gm = fenceMat.clone(); gm.map = fenceTex(gateR - gateL);
  gateG.rotateY(front.a);
  const gc = at(front, frontDoor, FRONT_FENCE);
  gateG.translate(gc[0], 2.3 / 2 - 0.05, gc[1]);
  group.add(mesh(gateG, gm));
  const monoG = new THREE.PlaneGeometry(0.6, 0.3);
  monoG.rotateY(front.a);
  const mc = at(front, frontDoor, FRONT_FENCE + 0.02);
  monoG.translate(mc[0], 2.15, mc[1]);
  group.add(mesh(monoG, new THREE.MeshStandardMaterial({ map: monogramTex(), transparent: true, alphaTest: 0.3, roughness: 0.6 })));

  const pillarMat = new THREE.MeshStandardMaterial({ color: 0xf5f3ee, roughness: 0.7 });
  for (const s of [0, front.len, gateL, gateR]) {
    const g = new THREE.BoxGeometry(0.45, 2.1, 0.45);
    g.rotateY(front.a);
    const c = at(front, s, FRONT_FENCE);
    g.translate(c[0], 1.05, c[1]);
    group.add(mesh(g, pillarMat));
    const b = new THREE.SphereGeometry(0.26, 14, 10);
    const bc = at(front, s, FRONT_FENCE);
    b.translate(bc[0], 2.36, bc[1]);
    group.add(mesh(b, pillarMat));
  }
  const numG = new THREE.PlaneGeometry(0.22, 0.27);
  numG.rotateY(front.a);
  const nc = at(front, gateL, FRONT_FENCE + 0.23);
  numG.translate(nc[0], 1.55, nc[1]);
  group.add(mesh(numG, new THREE.MeshStandardMaterial({ map: numberTex(), roughness: 0.6 })));

  scene.add(group);
  return { group };
}
