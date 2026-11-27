import * as THREE from 'three';
import { vestirLados } from './navesLados.js';
import './fachadasDibujadas/index.js';

/**
 * Añadidos de Arrecife para Lava Game (vienen de la versión GTA Canarias):
 *  - Marina Lanzarote: pantalán con yates y veleros amarrados.
 *  - Crucero atracado en el Muelle de Los Mármoles, con ventanas que se encienden de noche.
 *  - Nombre del barrio encima de la calle y aviso al cruzar de un barrio a otro.
 *  - HiperDino y MediaMarkt de Argana rehechos como el edificio real.
 *  - Argana y calle Tenderete desde fotos: Repsol, McDonald's, Burger King, Decathlon,
 *    Fuji y Kiwa, Mitsubishi y 928 Hybrid Club, talleres Autoguagua y El Norte, monumento de Titerroy.
 *  - De las versiones anteriores: Cabildo con portada y reloj, naves de Playa Honda
 *    (Cash Diplo, Cash Lee, Baratissimos) y «Av. Mamerto Cabrera» pintado en el asfalto.
 * Se monta sobre window.__game cuando el juego ha cargado. Lo importa main.js, así usa el mismo
 * three.js que el resto del juego (antes venía de jsdelivr como public/extras/arrecife-extras.js).
 */

const SEA_Y = 0.15;

function pointInPoly(poly, x, z) {
  let inn = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inn = !inn;
  }
  return inn;
}

function inSea(sea, x, z) {
  if (!sea || !pointInPoly(sea.outer, x, z)) return false;
  for (const h of sea.holes) if (pointInPoly(h, x, z)) return false;
  return true;
}

/* ---------------- Barrios ---------------- */

// zonas con nombre propio dentro de un barrio grande: mandan sobre las cajas
const PUNTOS = [
  { name: 'El Charco de San Ginés', x: 400, z: 60, r: 140 },
  { name: 'Marina Lanzarote', x: 1150, z: -60, r: 200 },
  { name: 'Puerto Naos', x: 850, z: -300, r: 190 },
  { name: 'Los Mármoles', x: 2150, z: -1150, r: 650 },
  { name: 'El Reducto', x: -560, z: 500, r: 220 },
  { name: 'La Fermina', x: -380, z: 850, r: 160 },
  { name: 'El Cable', x: -1250, z: 650, r: 300 },
];
// las cajas de barrio que usa Lava Game para construir cada zona
const CAJAS = [
  ['Argana Alta', -2617, -1003, -2434, -840],
  ['Maneje', -2200, 472, -3400, -1035],
  ['Titerroy', -1232, -25, -1382, -364],
  ['Altavista', -238, 498, -2080, -495],
  ['Valterra', 100, 1700, -1050, 38],
  ['Arrecife Centro', -950, 894, -178, 900],
  ['San Francisco Javier', -1799, -1036, -582, 432],
  ['Playa Honda', -5320, -2880, -20, 1500],
].map(([name, x0, x1, z0, z1]) => ({ name, x0, x1, z0, z1, area: (x1 - x0) * (z1 - z0) }))
  // donde se solapan, gana la más pequeña (la más concreta)
  .sort((a, b) => a.area - b.area);

function barrioAt(x, z) {
  for (const p of PUNTOS) if (Math.hypot(p.x - x, p.z - z) < p.r) return p.name;
  for (const c of CAJAS) if (x >= c.x0 && x <= c.x1 && z >= c.z0 && z <= c.z1) return c.name;
  return '';
}

/* ---------------- Barcos ---------------- */

/** casco en planta (proa en punta hacia +z), extruido hacia arriba */
function hullGeometry(beam, length, height, bow = 0.3) {
  const s = new THREE.Shape();
  const b = beam / 2, h = length / 2, nb = length * bow;
  s.moveTo(-b, -h + 1);
  s.quadraticCurveTo(-b, -h, -b + 1, -h);
  s.lineTo(b - 1, -h);
  s.quadraticCurveTo(b, -h, b, -h + 1);
  s.lineTo(b, h - nb);
  s.quadraticCurveTo(b * 0.9, h - nb * 0.25, 0, h);
  s.quadraticCurveTo(-b * 0.9, h - nb * 0.25, -b, h - nb);
  s.lineTo(-b, -h + 1);
  const g = new THREE.ExtrudeGeometry(s, { depth: height, bevelEnabled: false, curveSegments: 6 });
  g.rotateX(Math.PI / 2);
  g.translate(0, height, 0);
  return g;
}

/** Marina Lanzarote: pantalán con yates y veleros amarrados */
function buildMarina(scene, map) {
  const sign = (map.signs || []).find(s => /^marina lanzarote$/i.test(s.name));
  if (!sign || !map.sea) return null;
  const group = new THREE.Group();
  group.name = 'marinaLanzarote';
  const rng = (() => { let s = 777; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const deckMat = new THREE.MeshStandardMaterial({ color: 0x9c8a72, roughness: 0.9 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf4f4f2, roughness: 0.4, metalness: 0.1 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x1a2a38, roughness: 0.1, metalness: 0.6 });
  const navy = new THREE.MeshStandardMaterial({ color: 0x1d2b4a, roughness: 0.5 });
  const teak = new THREE.MeshStandardMaterial({ color: 0xb08a5a, roughness: 0.8 });
  const mastMat = new THREE.MeshStandardMaterial({ color: 0xc8ccd0, metalness: 0.8, roughness: 0.3 });
  const lampMat = new THREE.MeshStandardMaterial({ color: 0xfff0c0, emissive: 0xffe8a0, emissiveIntensity: 0 });
  const yachtHull = hullGeometry(3.4, 11, 1.3);
  const sailHull = hullGeometry(3, 10, 1.0, 0.4);

  // pantalán principal en la dársena, al oeste del espigón del rótulo
  const Z0 = -110, X0 = 940, X1 = 1100;
  const main = new THREE.Mesh(new THREE.BoxGeometry(X1 - X0, 0.35, 3), deckMat);
  main.position.set((X0 + X1) / 2, SEA_Y + 0.35, Z0);
  main.receiveShadow = true;
  group.add(main);
  let boats = 0;
  for (let x = X0 + 6; x < X1 - 4; x += 13) {
    for (const side of [-1, 1]) {
      const fz = Z0 + side * 8;
      if (!inSea(map.sea, x, fz) || !inSea(map.sea, x, Z0 + side * 14)) continue;
      const finger = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 12), deckMat);
      finger.position.set(x, SEA_Y + 0.33, fz);
      group.add(finger);
      // un barco a cada lado del dedo, si cabe en el agua
      for (const off of [-3.6, 3.6]) {
        const bx = x + off, bz = Z0 + side * 9.5;
        if (!inSea(map.sea, bx, bz + side * 6) || rng() < 0.15) continue;
        const boat = new THREE.Group();
        const sail = rng() < 0.45;
        boat.add(new THREE.Mesh(sail ? sailHull : yachtHull, rng() < 0.2 ? navy : white));
        const dk = new THREE.Mesh(new THREE.BoxGeometry(sail ? 2.2 : 2.6, 0.12, sail ? 6 : 7), teak);
        dk.position.set(0, sail ? 1.05 : 1.35, -0.5);
        boat.add(dk);
        if (sail) {
          const cab = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 3), white);
          cab.position.set(0, 1.4, -0.4);
          const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 12, 6), mastMat);
          mast.position.set(0, 7, 0.8);
          const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4, 5), mastMat);
          boom.rotation.x = Math.PI / 2;
          boom.position.set(0, 2.3, -1.2);
          boat.add(cab, mast, boom);
        } else {
          const cab = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.2, 4.2), white);
          cab.position.set(0, 2.0, -0.2);
          const win = new THREE.Mesh(new THREE.BoxGeometry(2.66, 0.5, 3.4), glassMat);
          win.position.set(0, 2.2, 0.1);
          const fly = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 2.2), white);
          fly.position.set(0, 2.9, -0.8);
          boat.add(cab, win, fly);
        }
        // la popa mira al pantalán
        boat.position.set(bx, SEA_Y - 0.1, bz);
        boat.rotation.y = side > 0 ? 0 : Math.PI;
        boat.rotation.z = (rng() - 0.5) * 0.03;
        boat.traverse(o => { if (o.isMesh) o.castShadow = true; });
        group.add(boat);
        boats++;
      }
    }
  }
  // farolas del pantalán
  for (let x = X0 + 10; x < X1; x += 30) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3, 6), mastMat);
    pole.position.set(x, SEA_Y + 1.95, Z0 + 1.2);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), lampMat);
    lamp.position.set(x, SEA_Y + 3.55, Z0 + 1.2);
    group.add(pole, lamp);
  }
  scene.add(group);
  return { group, lampMat, boats, cx: (X0 + X1) / 2, cz: Z0 };
}

/** textura de cubiertas de crucero: filas de balcones y ventanas (y su versión encendida) */
function cruiseDeckTex(lit) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle = lit ? '#000' : '#f4f4f2';
  ctx.fillRect(0, 0, 256, 64);
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 16; i++) {
      const on = !lit || ((i * 7 + row * 3) % 5 !== 0);
      ctx.fillStyle = lit ? (on ? '#ffd890' : '#000') : '#26394f';
      ctx.fillRect(i * 16 + 3, row * 32 + 8, 11, 16);
      if (!lit) {
        ctx.fillStyle = '#c9ced4';
        ctx.fillRect(i * 16 + 1, row * 32 + 22, 15, 2);
      }
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Crucero atracado en el Muelle de Los Mármoles */
function buildCrucero(scene, map) {
  if (!map.sea) return null;
  const quay = (map.roads || []).filter(r => /muelle de los m[aá]rmoles/i.test(r.name || ''));
  if (!quay.length) return null;
  const L = 250, B = 30;
  // la cara de levante del muelle: primer punto de agua mirando al este
  let edge = 0;
  for (const z of [-1400, -1325, -1250, -1175, -1100]) {
    let x = 2300;
    while (x < 2700 && !inSea(map.sea, x, z)) x += 2;
    edge = Math.max(edge, x);
  }
  const cz = -1250;
  let cx = edge + B / 2 + 4;
  while (cx < edge + 200 && ![[0, -L / 2], [0, L / 2], [B / 2, 0], [-B / 2, 0]]
    .every(([ox, oz]) => inSea(map.sea, cx + ox, cz + oz))) cx += 4;

  const group = new THREE.Group();
  group.name = 'crucero';
  group.position.set(cx, SEA_Y - 0.15, cz);
  // proa al norte
  group.rotation.y = Math.PI;
  const navy = new THREE.MeshStandardMaterial({ color: 0x14213d, roughness: 0.55 });
  const red = new THREE.MeshStandardMaterial({ color: 0x8a1f1a, roughness: 0.7 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf6f6f4, roughness: 0.45 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f1c2a, roughness: 0.08, metalness: 0.7 });
  const orange = new THREE.MeshStandardMaterial({ color: 0xff7a1a, roughness: 0.6 });
  const blue = new THREE.MeshStandardMaterial({ color: 0x1c6fb8, roughness: 0.3, metalness: 0.2 });

  // casco: obra viva roja bajo la flotación, costado azul marino y franja blanca
  const below = new THREE.Mesh(hullGeometry(B - 1, L - 2, 3, 0.18), red);
  below.position.y = -3;
  const hull = new THREE.Mesh(hullGeometry(B, L, 10, 0.18), navy);
  const band = new THREE.Mesh(hullGeometry(B + 0.1, L - 6, 1.2, 0.18), white);
  band.position.y = 8.8;
  group.add(below, hull, band);

  // cubiertas de camarotes con balcones
  const tex = cruiseDeckTex(false), lit = cruiseDeckTex(true);
  const deckMats = [];
  for (const [w, len, y, oz] of [
    [B - 2, L * 0.72, 10, -8],
    [B - 3, L * 0.68, 13, -10],
    [B - 4, L * 0.62, 16, -12],
    [B - 5, L * 0.55, 19, -14],
    [B - 8, L * 0.42, 22, -20],
  ]) {
    const m = tex.clone(), e = lit.clone();
    m.needsUpdate = e.needsUpdate = true;
    m.repeat.set(len / 30, 1);
    e.repeat.set(len / 30, 1);
    const mat = new THREE.MeshStandardMaterial({
      map: m, emissiveMap: e, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.5,
    });
    deckMats.push(mat);
    const d = new THREE.Mesh(new THREE.BoxGeometry(w, 3, len), [mat, mat, white, white, mat, mat]);
    d.position.set(0, y + 1.5, oz);
    group.add(d);
  }
  // puente de mando a proa, con su cristalera
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(B + 2, 3, 8), white);
  bridge.position.set(0, 23.5, L * 0.21);
  const bridgeWin = new THREE.Mesh(new THREE.BoxGeometry(B + 2.1, 1.2, 1), glassMat);
  bridgeWin.position.set(0, 24, L * 0.21 + 3.6);
  group.add(bridge, bridgeWin);
  // cubierta de piscina, tobogán y chimenea a popa
  const pool = new THREE.Mesh(new THREE.BoxGeometry(10, 0.3, 18), blue);
  pool.position.set(0, 25.2, -10);
  group.add(pool);
  const slide = new THREE.Mesh(new THREE.TorusGeometry(4, 0.6, 8, 20, Math.PI * 1.5),
    new THREE.MeshStandardMaterial({ color: 0xffc21a, roughness: 0.4 }));
  slide.position.set(8, 28, -40);
  slide.rotation.y = 0.6;
  group.add(slide);
  const funnel = new THREE.Mesh(new THREE.BoxGeometry(7, 11, 13), white);
  funnel.position.set(0, 30, -60);
  const funnelTop = new THREE.Mesh(new THREE.BoxGeometry(7.2, 2, 13.2), navy);
  funnelTop.position.set(0, 36, -60);
  group.add(funnel, funnelTop);
  // botes salvavidas naranjas a ambos costados
  const boatGeo = new THREE.CapsuleGeometry(1.2, 6, 4, 8);
  boatGeo.rotateX(Math.PI / 2);
  for (const sx of [-1, 1]) {
    for (let i = 0; i < 9; i++) {
      const lb = new THREE.Mesh(boatGeo, orange);
      lb.position.set(sx * (B / 2 + 0.6), 12, -70 + i * 13);
      group.add(lb);
    }
  }
  // nombre en la proa
  const nc = document.createElement('canvas');
  nc.width = 512; nc.height = 64;
  const nctx = nc.getContext('2d');
  nctx.fillStyle = '#14213d';
  nctx.fillRect(0, 0, 512, 64);
  nctx.fillStyle = '#f6f6f4';
  nctx.font = 'bold 44px "Arial Narrow", Arial';
  nctx.textAlign = 'center';
  nctx.textBaseline = 'middle';
  nctx.fillText('ESTRELLA DEL ATLÁNTICO', 256, 34);
  const ntex = new THREE.CanvasTexture(nc);
  ntex.colorSpace = THREE.SRGBColorSpace;
  for (const sx of [-1, 1]) {
    const name = new THREE.Mesh(new THREE.PlaneGeometry(22, 2.75), new THREE.MeshBasicMaterial({ map: ntex }));
    name.position.set(sx * (B / 2 + 0.05), 6.5, L * 0.28);
    name.rotation.y = sx * Math.PI / 2;
    group.add(name);
  }
  group.traverse(o => { if (o.isMesh) o.castShadow = true; });
  scene.add(group);
  return { group, deckMats, cx, cz };
}

/* ---------------- HiperDino + MediaMarkt de Argana ---------------- */

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** letras corpóreas de HiperDino sobre fondo transparente, con el punto verde claro de la i */
function hiperDinoLetters(color) {
  return canvasTex(1024, 220, (x, w, h) => {
    x.font = '800 168px "Barlow", Arial, Helvetica, sans-serif';
    x.textBaseline = 'alphabetic';
    const txt = 'HiperDino', tw = x.measureText(txt).width, x0 = (w - tw) / 2, base = h * 0.84;
    x.fillStyle = color;
    x.fillText(txt, x0, base);
    // el punto de la i, verde claro como en el rótulo real
    const iw = x.measureText('i').width, ix = x0 + x.measureText('H').width + iw / 2;
    x.clearRect(ix - iw * 0.6, base - 168 * 0.98, iw * 1.2, 168 * 0.3);
    x.fillStyle = color === '#000000' ? color : '#7cc04f';
    x.beginPath();
    x.arc(ix, base - 168 * 0.83, iw * 0.42, 0, Math.PI * 2);
    x.fill();
  });
}

/** rótulo de MediaMarkt: letras rojas en cursiva y la espiral, sobre caja negra */
function mediaMarktSign() {
  return canvasTex(1024, 200, (x, w, h) => {
    x.fillStyle = '#1b1c1e';
    x.fillRect(0, 0, w, h);
    x.font = 'italic 800 130px "Barlow", Arial, Helvetica, sans-serif';
    x.textBaseline = 'middle';
    x.fillStyle = '#e2001a';
    const cx = w * 0.43, cy = h * 0.52, r = h * 0.3;
    x.textAlign = 'right';
    x.fillText('Media', cx - r - 6, cy);
    x.textAlign = 'left';
    x.fillText('Markt', cx + r + 6, cy);
    // espiral: disco blanco con gajos rojos curvados
    x.fillStyle = '#ffffff';
    x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#e2001a';
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      x.beginPath();
      x.moveTo(cx, cy);
      x.quadraticCurveTo(cx + Math.cos(a + 0.9) * r * 0.7, cy + Math.sin(a + 0.9) * r * 0.7, cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      x.arc(cx, cy, r, a, a + 0.5);
      x.quadraticCurveTo(cx + Math.cos(a + 1.3) * r * 0.55, cy + Math.sin(a + 1.3) * r * 0.55, cx, cy);
      x.fill();
    }
    x.fillStyle = '#ffffff';
    x.beginPath(); x.arc(cx, cy, r * 0.16, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#e2001a';
    x.font = '800 22px Arial, sans-serif';
    x.fillText('®', w * 0.93, h * 0.2);
  });
}

function plateTex(text, bg, fg, italic = false) {
  return canvasTex(512, 96, (x, w, h) => {
    x.fillStyle = bg;
    x.fillRect(0, 0, w, h);
    x.font = `${italic ? 'italic ' : ''}800 62px "Barlow", Arial, sans-serif`;
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillStyle = fg;
    x.fillText(text, w / 2, h * 0.55);
  });
}

/**
 * El edificio compartido de HiperDino y MediaMarkt en Argana, como es de verdad:
 * cristalera abajo, banda beige, fila de ventanas arriba, gran marquesina blanca
 * sobre pilares finos, letras verdes de HiperDino en el tejado y la caja negra de
 * MediaMarkt en la punta sur. Ocupa la misma planta que el que trae el juego
 * (que se oculta), así que sus choques siguen valiendo.
 */
function buildHiperDino(g) {
  // el HiperDino y el MediaMarkt ya vienen en el juego (hiperdinoArgana.js, centroComercialArgana.js): la fachada en
  // la Calle Iguazú y el portón del garaje en Tenderete. Aquí no se rehacen para no taparlos ni duplicarlos.
  return null;
  const old = g.scene.getObjectByName('hiperdinoArgana');
  if (!old) return null;
  const P0 = [-1320.8, -1455.3], P1 = [-1270.3, -1365.2], P2 = [-1360.9, -1432.8];
  const L = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]);
  const D = Math.hypot(P2[0] - P0[0], P2[1] - P0[1]);
  const u = [(P1[0] - P0[0]) / L, (P1[1] - P0[1]) / L];
  // ejes locales: x a lo largo de la fachada, +z hacia dentro, el aparcamiento en -z
  const world = (lx, lz) => [P0[0] + u[0] * lx - u[1] * lz, P0[1] + u[1] * lx + u[0] * lz];
  const group = new THREE.Group();
  group.name = 'hiperdinoMediaMarkt';
  group.position.set(P0[0], 0, P0[1]);
  group.rotation.y = Math.atan2(-u[1], u[0]);

  const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o });
  const white = mat(0xefeeea), beige = mat(0xd9cdb6, { roughness: 0.85 });
  const soffit = mat(0x3c3f43, { roughness: 0.8 }), alu = mat(0xc9cdd1, { metalness: 0.6, roughness: 0.35 });
  const signGrey = mat(0xa7acaf), black = mat(0x1b1c1e, { roughness: 0.5 });
  const glassLow = mat(0x4b5d6a, { metalness: 0.4, roughness: 0.15, emissive: 0xffe2a8, emissiveIntensity: 0 });
  const glassUp = mat(0x3a4a56, { metalness: 0.5, roughness: 0.12, emissive: 0xfff0d0, emissiveIntensity: 0 });
  const doorMat = mat(0x14181b, { metalness: 0.4, roughness: 0.2 });

  const box = (x0, x1, y0, y1, z0, z1, m) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), m);
    b.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    b.castShadow = b.receiveShadow = true;
    group.add(b);
    return b;
  };
  // perfiles repetidos: una sola malla instanciada
  const rods = (m, list) => {
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), m, list.length);
    const o = new THREE.Object3D();
    list.forEach(([x0, x1, y0, y1, z0, z1], i) => {
      o.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
      o.scale.set(x1 - x0, y1 - y0, z1 - z0);
      o.updateMatrix();
      im.setMatrixAt(i, o.matrix);
    });
    group.add(im);
  };
  const plane = (cx, cy, w, h, tex, { z = -0.02, glow = null, transparent = false } = {}) => {
    const m = new THREE.MeshStandardMaterial({
      map: tex, transparent, alphaTest: transparent ? 0.4 : 0, roughness: 0.5,
      emissive: glow ? 0xffffff : 0x000000, emissiveMap: glow ? tex : null, emissiveIntensity: 0,
    });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    p.position.set(cx, cy, z);
    p.rotation.y = Math.PI; // mira al aparcamiento
    group.add(p);
    return m;
  };

  const H = 11, xm = L - 34; // MediaMarkt ocupa la punta sur (a la izquierda vista desde el aparcamiento)
  // muelle de carga en la cara que mira a la Repsol, donde lo dejó José Manuel (Version 86)
  const MU = L * 0.62, mu0 = MU - 7, mu1 = MU + 7;
  box(0, L, 0, H, 0.6, D, white);
  // planta baja: cristalera corrida, cortada por el muelle
  box(0, mu0, 0, 5, 0.3, 0.6, glassLow);
  box(mu1, L, 0, 5, 0.3, 0.6, glassLow);
  const mull = [];
  for (let x = 0; x <= L; x += 1.7) if (x < mu0 || x > mu1) mull.push([x - 0.05, x + 0.05, 0, 5, 0.2, 0.32]);
  for (const y of [0.12, 2.75, 4.95]) mull.push([0, mu0, y - 0.06, y + 0.06, 0.2, 0.32], [mu1, L, y - 0.06, y + 0.06, 0.2, 0.32]);
  // el muelle: paño ciego, portón seccional con su marco, marquesina de chapa, topes y bolardos
  box(mu0, mu1, 0, 5, 0.15, 0.6, beige);
  const doorTex = canvasTex(256, 112, (x, w, h) => {
    x.fillStyle = '#d4d7d9'; x.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += h / 6) {
      x.fillStyle = '#b9bdc0'; x.fillRect(0, y, w, 2);
      x.fillStyle = '#e6e8ea'; x.fillRect(0, y + 2, w, 1);
    }
    x.fillStyle = 'rgba(0,0,0,0.08)';
    for (let i = 0; i < w; i += 6) x.fillRect(i, 0, 1, h);
  });
  plane(MU, 2.3, 10.6, 4.6, doorTex, { z: 0.12 });
  const guide = mat(0x4a4e52), rubber = mat(0x2b2b2b), sheet = mat(0xb9bcbe, { metalness: 0.4 });
  box(MU - 5.6, MU - 5.3, 0, 4.9, -0.05, 0.3, guide);
  box(MU + 5.3, MU + 5.6, 0, 4.9, -0.05, 0.3, guide);
  box(MU - 5.6, MU + 5.6, 4.6, 4.95, -0.05, 0.3, guide);
  box(MU - 5.6, MU + 5.6, 0, 0.12, -0.35, 0.3, rubber); // goma del suelo
  box(MU - 6.9, MU + 6.9, 5.15, 5.3, -3.2, 0.3, sheet);  // marquesina de chapa
  for (const x of [MU - 6.7, MU + 6.7]) box(x - 0.06, x + 0.06, 4.35, 5.15, -2.75, -2.6, mat(0x7d8084));
  for (const x of [MU - 3.6, MU + 3.6]) box(x - 0.28, x + 0.28, 0.75, 1.25, -0.26, 0.12, rubber);
  plane(MU, 5.9, 5.2, 0.62, plateTex('CARGA Y DESCARGA', '#2b2f31', '#f2f0e8'), { z: 0.13 });
  // puerta del personal
  box(MU + 5.9, MU + 6.9, 0, 2.3, 0.08, 0.3, mat(0x6f7275));
  const yellow = mat(0xd8b23a, { roughness: 0.6 });
  for (const x of [MU - 6.6, MU - 4.2, MU + 4.2, MU + 6.6]) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1, 8), yellow);
    b.position.set(x, 0.5, -2.3);
    group.add(b);
    if (g.colliders?.addSegment) {
      const [ax, az] = world(x - 0.12, -2.3), [bx, bz] = world(x + 0.12, -2.3);
      g.colliders.addSegment(ax, az, bx, bz);
    }
  }
  // banda beige y fila de ventanas de arriba
  box(0, L, 5, 7.8, 0.15, 0.6, beige);
  box(0, L, 7.8, 9.7, 0.4, 0.6, glassUp);
  for (let x = 0; x <= L; x += 1.5) mull.push([x - 0.04, x + 0.04, 7.8, 9.7, 0.34, 0.42]);
  box(0, L, 9.7, H, 0.3, 0.6, white);
  rods(alu, mull);

  // marquesina: sale 9 m y sobrepasa el edificio por los dos lados
  const cx0 = -12, cx1 = L + 10, cz = -9;
  box(cx0, cx1, 9.3, 9.42, cz + 0.3, 0.3, soffit);
  box(cx0, cx1, 9.42, 10.6, cz + 0.3, 0.3, white);
  box(cx0, cx1, 9.1, 10.9, cz - 0.3, cz + 0.3, white);
  for (const x of [cx0, cx1]) box(x - 0.3, x + 0.3, 9.1, 10.9, cz, 0.3, white);
  const colMat = mat(0xf3f3ef, { roughness: 0.4 });
  const colGeo = new THREE.CylinderGeometry(0.28, 0.28, 9.3, 14);
  for (let x = cx0 + 2; x <= cx1 - 1; x += (cx1 - cx0 - 3) / 10) {
    const c = new THREE.Mesh(colGeo, colMat);
    c.position.set(x, 4.65, cz + 1.4);
    c.castShadow = true;
    group.add(c);
    if (g.colliders?.addSegment) {
      const [ax, az] = world(x - 0.3, cz + 1.4), [bx, bz] = world(x + 0.3, cz + 1.4);
      g.colliders.addSegment(ax, az, bx, bz);
    }
  }
  // farolas del aparcamiento bajo y junto a la marquesina
  for (const x of [L * 0.25, L * 0.45, L + 6]) {
    box(x - 0.1, x + 0.1, 0, 8, -14, -13.8, black);
    box(x - 0.8, x + 0.8, 8, 8.2, -14.4, -13.4, black);
  }

  // entradas de HiperDino: puertas correderas con su placa
  const hdPlate = plateTex('HiperDino', '#f2f0e9', '#1d5a45');
  for (const x of [L * 0.22, L * 0.42]) {
    box(x - 2.2, x + 2.2, 0, 2.6, 0.12, 0.3, doorMat);
    plane(x, 3.3, 4.2, 0.8, hdPlate, { z: 0.14 });
  }
  // entrada de MediaMarkt: pilar beige y vestíbulo de cristal a toda altura
  box(xm + 3, xm + 10, 0, 9.3, -0.9, 0.6, beige);
  box(xm + 10, xm + 17, 0, 9.0, -1.2, 0.6, glassUp);
  const vm = [];
  for (let x = xm + 10; x <= xm + 17.01; x += 1.4) vm.push([x - 0.05, x + 0.05, 0, 9, -1.3, -1.18]);
  for (const y of [3, 6, 8.95]) vm.push([xm + 10, xm + 17, y - 0.06, y + 0.06, -1.3, -1.18]);
  rods(alu, vm);
  box(xm + 11.6, xm + 15.4, 0, 2.7, -1.36, -1.3, doorMat);
  const mmSmall = plane(xm + 13.5, 3.25, 4.4, 0.75, plateTex('MediaMarkt', '#1b1c1e', '#e2001a', true), { z: -1.4, glow: true });

  // tejado: caja gris con las letras verdes de HiperDino
  const hx0 = L * 0.12, hx1 = L * 0.5;
  box(hx0, hx1, H, H + 2.8, 1, 4.5, signGrey);
  const letters = [];
  const front = hiperDinoLetters('#1d5a45'), back = hiperDinoLetters('#123a2d');
  for (const [z, t] of [[0.95, back], [0.85, back], [0.72, front]]) {
    letters.push(plane((hx0 + hx1) / 2, H + 3.4, hx1 - hx0 + 2, (hx1 - hx0 + 2) * 220 / 1024, t, { z, transparent: true, glow: t === front }));
  }
  // tejado: caja negra de MediaMarkt
  box(xm + 1, L - 1, H, H + 6.4, 0.6, 4.2, black);
  const mm = plane((xm + L) / 2, H + 3.2, L - xm - 3, (L - xm - 3) * 200 / 1024, mediaMarktSign(), { z: 0.55, glow: true });

  // rayas del aparcamiento (iban en el edificio del juego que se oculta), siguiendo su suelo
  const a0 = world(L / 2, D / 2), y0 = g.terrainY ? g.terrainY(a0[0], a0[1]) : 0;
  const floorY = (lx, lz) => {
    if (!g.terrainY) return 0.36;
    const [wx, wz] = world(lx, lz);
    return Math.max(g.terrainY(wx, wz) - y0 + 0.34, 0.34) + 0.02;
  };
  const stripes = [];
  for (let x = 6; x < L - 6; x += 2.55) {
    if (Math.abs(x - L * 0.62) < 8.4) continue;
    for (const [t0, t1] of [[6.2, 11.2], [22, 27], [33.4, 38]]) {
      const y = Math.max(floorY(x, -t0), floorY(x, -t1));
      stripes.push([x - 0.05, x + 0.05, y, y + 0.012, -t1, -t0]);
    }
  }
  rods(mat(0xece9e2, { roughness: 0.9 }), stripes);

  old.visible = false;
  g.scene.add(group);
  const [hx, hz] = world(L / 2, -20);
  return { group, glass: [glassLow, glassUp], signs: [mm, mmSmall, letters[2]], x: hx, z: hz };
}

/* ---------------- Argana y calle Tenderete ---------------- */

/** rectángulo orientado más ajustado a una planta [[x,z],…] */
function rectOf(poly) {
  const p = poly.length > 1 && poly[0][0] === poly[poly.length - 1][0] && poly[0][1] === poly[poly.length - 1][1] ? poly.slice(0, -1) : poly;
  let best = null;
  for (let i = 0; i < p.length; i++) {
    const [ax, az] = p[i], [bx, bz] = p[(i + 1) % p.length];
    const l = Math.hypot(bx - ax, bz - az);
    if (l < 0.5) continue;
    const ux = (bx - ax) / l, uz = (bz - az) / l;
    let u0 = 1e9, u1 = -1e9, n0 = 1e9, n1 = -1e9;
    for (const [x, z] of p) {
      const u = x * ux + z * uz, n = -x * uz + z * ux;
      u0 = Math.min(u0, u); u1 = Math.max(u1, u); n0 = Math.min(n0, n); n1 = Math.max(n1, n);
    }
    const area = (u1 - u0) * (n1 - n0);
    if (!best || area < best.area) {
      const um = (u0 + u1) / 2, nm = (n0 + n1) / 2;
      best = { area, ux, uz, cx: um * ux - nm * uz, cz: um * uz + nm * ux, a: u1 - u0, b: n1 - n0 };
    }
  }
  return best;
}

/**
 * Grupo colocado sobre un rectángulo con la fachada mirando hacia (fx, fz):
 * x local a lo largo de la fachada (−W/2…W/2), la fachada en z = −D/2 mirando a −z.
 */
function framedGroup(rect, fx, fz, name) {
  const fl = Math.hypot(fx, fz) || 1;
  fx /= fl; fz /= fl;
  // de los cuatro lados, el que más mira hacia donde se pide
  const sides = [[rect.ux, rect.uz, rect.b, rect.a], [-rect.ux, -rect.uz, rect.b, rect.a],
    [-rect.uz, rect.ux, rect.a, rect.b], [rect.uz, -rect.ux, rect.a, rect.b]];
  let [nx, nz, W, D] = sides[0], dot = -2;
  for (const s of sides) { const d = s[0] * fx + s[1] * fz; if (d > dot) { dot = d; [nx, nz, W, D] = s; } }
  const group = new THREE.Group();
  group.name = name;
  group.position.set(rect.cx, 0, rect.cz);
  group.rotation.y = Math.atan2(-nx, -nz);
  const world = (lx, lz) => {
    const c = Math.cos(group.rotation.y), s = Math.sin(group.rotation.y);
    return [rect.cx + lx * c + lz * s, rect.cz - lx * s + lz * c];
  };
  return { group, W, D, nx, nz, world };
}

/** utilidades de construcción sobre un grupo */
function kit(group) {
  const mats = new Map();
  const mat = (color, o = {}) => {
    const key = color + JSON.stringify(o);
    if (!mats.has(key)) mats.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...o }));
    return mats.get(key);
  };
  const glow = [];
  return {
    mat, glow,
    box(x0, x1, y0, y1, z0, z1, m) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), typeof m === 'number' ? mat(m) : m);
      b.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
      b.castShadow = b.receiveShadow = true;
      group.add(b);
      return b;
    },
    cyl(x, y0, y1, z, r, m, seg = 12) {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, y1 - y0, seg), typeof m === 'number' ? mat(m) : m);
      c.position.set(x, (y0 + y1) / 2, z);
      c.castShadow = true;
      group.add(c);
      return c;
    },
    /** cartel o fachada pintada mirando a −z (o a +z con back) */
    pic(cx, cy, w, h, tex, { z = -0.02, lit = false, cut = false, back = false, ry = null } = {}) {
      const m = new THREE.MeshStandardMaterial({
        map: tex, transparent: cut, alphaTest: cut ? 0.4 : 0, roughness: 0.6,
        emissive: lit ? 0xffffff : 0x000000, emissiveMap: lit ? tex : null, emissiveIntensity: 0,
      });
      const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
      p.position.set(cx, cy, z);
      p.rotation.y = ry ?? (back ? 0 : Math.PI);
      group.add(p);
      if (lit) glow.push(m);
      return m;
    },
  };
}

/** lienzo de fachada a escala: dibuja en metros (1 m = s px) */
function facadeTex(Wm, Hm, draw, s = 24) {
  const k = Math.min(s, 4096 / Wm, 2048 / Hm);
  return canvasTex(Math.round(Wm * k), Math.round(Hm * k), (x, w, h) => {
    x.scale(k, k);
    draw(x, Wm, Hm);
  });
}

const BARLOW = '"Barlow", Arial, Helvetica, sans-serif';

/** texto centrado en metros */
function txt(x, s, cx, cy, size, color, { weight = 800, italic = false, align = 'center', font = BARLOW } = {}) {
  x.font = `${italic ? 'italic ' : ''}${weight} ${size}px ${font}`;
  x.textAlign = align;
  x.textBaseline = 'middle';
  x.fillStyle = color;
  x.fillText(s, cx, cy);
}

/** cristalera con carpintería, en metros */
function glazing(x, x0, y0, w, h, { frame = '#e9ebec', glass = '#3d4c57', cols = 3, rows = 2, lw = 0.1 } = {}) {
  x.fillStyle = glass;
  x.fillRect(x0, y0, w, h);
  const gr = x.createLinearGradient(x0, y0, x0 + w, y0 + h);
  gr.addColorStop(0, 'rgba(255,255,255,0.18)'); gr.addColorStop(0.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,0.1)');
  x.fillStyle = gr;
  x.fillRect(x0, y0, w, h);
  x.fillStyle = frame;
  for (let i = 0; i <= cols; i++) x.fillRect(x0 + (w - lw) * i / cols, y0, lw, h);
  for (let j = 0; j <= rows; j++) x.fillRect(x0, y0 + (h - lw) * j / rows, w, lw);
}

/** M dorada de McDonald's */
function goldenM(x, cx, cy, w, h, color = '#ffc72c') {
  const r = w / 4, lw = w * 0.13;
  x.strokeStyle = color; x.lineWidth = lw; x.lineCap = 'butt';
  for (const dx of [-r, r]) {
    x.beginPath();
    x.moveTo(cx + dx - r, cy + h / 2);
    x.lineTo(cx + dx - r, cy - h / 2 + r);
    x.arc(cx + dx, cy - h / 2 + r, r, Math.PI, 0);
    x.lineTo(cx + dx + r, cy + h / 2);
    x.stroke();
  }
}

/** listones verticales de madera */
function slats(x, x0, y0, w, h, base = '#8a6a4c', dark = '#5e4530', step = 0.18) {
  x.fillStyle = base;
  x.fillRect(x0, y0, w, h);
  x.fillStyle = dark;
  for (let i = x0; i < x0 + w; i += step) x.fillRect(i, y0, step * 0.32, h);
}

function plantaDe(g, tag) {
  const b = (g.map.buildings || []).find(b => b.arrecifeExtra === tag || b[tag]);
  return b ? rectOf(b.p) : null;
}

/** Repsol de la calle Tenderete: dos marquesinas rojas de seta, otra gris y la tienda oscura */
function buildRepsol(g) {
  const F = [-1193, -1338.9];
  const u = [0.436, 0.9], n = [-0.9, 0.436]; // a lo largo de la calle y hacia la tienda
  const group = new THREE.Group();
  group.name = 'repsolTenderete';
  group.position.set(F[0], 0, F[1]);
  group.rotation.y = Math.atan2(-u[1], u[0]); // x local = u, z local = n
  const K = kit(group);
  const red = K.mat(0xc4473a, { roughness: 0.75 }), redDark = K.mat(0x9a3c32), grey = K.mat(0x8d9194);
  const white = K.mat(0xeeeeea), dark = K.mat(0x2f3134, { roughness: 0.55 });
  const underLight = K.mat(0xf1efe9, { emissive: 0xfff4dc, emissiveIntensity: 0 });
  K.glow.push(underLight);
  // marquesinas de seta: un pilar, losa cuadrada
  for (const ax of [-7, 7]) {
    K.box(ax - 0.6, ax + 0.6, 0, 6.4, -0.6, 0.6, red);
    K.box(ax - 1.6, ax + 1.6, 5.9, 6.4, -1.6, 1.6, redDark);
    K.box(ax - 6, ax + 6, 6.4, 7.3, -6, 6, red);
    K.box(ax - 5.8, ax + 5.8, 6.35, 6.4, -5.8, 5.8, underLight);
    // isletas con surtidores
    for (const iz of [-2.6, 2.6]) {
      K.box(ax - 2.4, ax + 2.4, 0, 0.18, iz - 0.6, iz + 0.6, 0xcfcfcf);
      for (const sx of [-1.2, 1.2]) {
        K.box(ax + sx - 0.35, ax + sx + 0.35, 0.18, 1.9, iz - 0.28, iz + 0.28, white);
        K.box(ax + sx - 0.36, ax + sx + 0.36, 1.5, 1.85, iz - 0.29, iz + 0.29, 0xe4602a);
      }
    }
  }
  // marquesina gris más baja, junto a la tienda
  for (const ax of [-5, 5]) K.box(ax - 0.25, ax + 0.25, 0, 5, 8.5 - 0.25, 8.5 + 0.25, white);
  K.box(-8, 8, 5, 5.4, 6, 11, grey);
  // tienda oscura
  const sx0 = -9, sx1 = 9, sz0 = 11, sz1 = 19;
  K.box(sx0, sx1, 0, 4.6, sz0, sz1, dark);
  K.box(sx0 - 0.2, sx1 + 0.2, 4.6, 5.0, sz0 - 0.2, sz1 + 0.2, K.mat(0x26282a));
  const shop = facadeTex(sx1 - sx0, 4.6, (x, w, h) => {
    x.fillStyle = '#2f3134'; x.fillRect(0, 0, w, h);
    glazing(x, 2, 1.0, 9, 2.6, { frame: '#b9bcbe', glass: '#46525a', cols: 6, rows: 1 });
    glazing(x, 12, 1.0, 3, 2.6, { frame: '#b9bcbe', glass: '#2b3338', cols: 2, rows: 1 });
    x.fillStyle = '#e4602a'; x.fillRect(0, 3.75, w, 0.22);
    txt(x, 'Repsol', w * 0.5, 0.55, 0.62, '#ffffff', { weight: 700 });
  });
  // la fachada mira a la calle (−z local)
  K.pic(0, 2.3, sx1 - sx0, 4.6, shop, { z: sz0 - 0.03 });
  // tótem de precios
  const totem = canvasTex(256, 768, (x, w, h) => {
    x.fillStyle = '#f4f3ef'; x.fillRect(0, 0, w, h);
    // logo: bandas naranja, roja y amarilla
    for (const [c, y] of [['#ff8200', 40], ['#e4002b', 85], ['#ffcd00', 130]]) {
      x.fillStyle = c; x.beginPath(); x.ellipse(w / 2, y, 90, 26, 0, 0, Math.PI * 2); x.fill();
    }
    x.fillStyle = '#ff8200'; x.font = '800 54px ' + BARLOW; x.textAlign = 'center'; x.fillText('Repsol', w / 2, 230);
    const precios = [['Efitec 95', '1,329'], ['Diésel e+', '1,219'], ['Efitec 98', '1,459']];
    precios.forEach(([p, v], i) => {
      x.fillStyle = '#1c1c1c'; x.fillRect(16, 290 + i * 150, w - 32, 128);
      x.fillStyle = '#ffffff'; x.font = '700 28px ' + BARLOW; x.fillText(p, w / 2, 326 + i * 150);
      x.fillStyle = '#ffb000'; x.font = '800 60px ' + BARLOW; x.fillText(v, w / 2, 390 + i * 150);
    });
  });
  K.box(-16.6, -15.4, 0, 8, -7.4, -6.6, white);
  K.pic(-16, 4.6, 1.15, 3.45, totem, { z: -7.42, lit: true });
  group.traverse(o => { if (o.isMesh) o.castShadow = true; });
  const old = g.scene.getObjectByName('gasolineraTenderete');
  if (old) old.visible = false;
  g.scene.add(group);
  return { group, glow: K.glow, x: F[0], z: F[1] };
}

/** McDonald's de Argana: fachada verde oscura, paneles blancos con la M, listones y torre */
function buildMcDonalds(g) {
  const rect = plantaDe(g, 'mcdonalds');
  if (!rect) return null;
  const P = [-1217, -1133]; // su aparcamiento
  const F = framedGroup(rect, P[0] - rect.cx, P[1] - rect.cz, 'mcdonaldsReal');
  const { group, W, D } = F;
  const K = kit(group);
  const H = 6.4, wood = 0x6b4430, green = 0x1e3a2b;
  K.box(-W / 2, W / 2, 0, H - 2.4, -D / 2 + 0.3, D / 2, wood);
  K.box(-W / 2 - 0.4, W / 2 + 0.4, H - 2.4, H, -D / 2 - 0.4, D / 2 + 0.4, green);
  K.box(-W / 2 + 0.6, W / 2 - 0.6, H, H + 0.9, -D / 2 + 0.6, D / 2 - 0.6, K.mat(0x7a4a32));
  const lower = facadeTex(W, H - 2.4, (x, w, h) => {
    slats(x, 0, 0, w, h, '#6b4430', '#563626', 0.25);
    glazing(x, w * 0.18, 0.9, w * 0.24, 2.6, { frame: '#2a2a2a', glass: '#2e3a40', cols: 4, rows: 1 });
    glazing(x, w * 0.5, 0.0, w * 0.12, 3.4, { frame: '#2a2a2a', glass: '#27333a', cols: 2, rows: 1 });
    glazing(x, w * 0.66, 0.9, w * 0.26, 2.6, { frame: '#2a2a2a', glass: '#2e3a40', cols: 4, rows: 1 });
  });
  K.pic(0, (H - 2.4) / 2, W, H - 2.4, lower, { z: -D / 2 + 0.27 });
  const fascia = facadeTex(W + 0.8, 2.4, (x, w, h) => {
    x.fillStyle = '#1e3a2b'; x.fillRect(0, 0, w, h);
    const panel = (px, pw, label) => {
      x.fillStyle = '#f4f4f2'; x.fillRect(px, 0, pw, h);
      x.fillStyle = '#1e3a2b'; x.fillRect(px + pw * 0.38, h * 0.18, pw * 0.5, h * 0.64);
      goldenM(x, px + pw * 0.63, h * 0.5, pw * 0.36, h * 0.42);
      x.save(); x.translate(px + pw * 0.2, h * 0.5); x.rotate(-Math.PI / 2);
      txt(x, label, 0, 0, h * 0.13, '#333', { weight: 600 }); x.restore();
    };
    panel(w * 0.2, w * 0.12, 'McAuto');
    slats(x, w * 0.32, 0, w * 0.22, h, '#7a4a32', '#5b3523', 0.3);
    panel(w * 0.54, w * 0.12, 'McAuto');
    txt(x, "McDonald's", w * 0.83, h * 0.52, h * 0.34, '#ffffff', { weight: 700 });
  });
  K.pic(0, H - 1.2, W + 0.8, 2.4, fascia, { z: -D / 2 - 0.42, lit: true });
  // la franja verde da la vuelta al edificio
  K.pic(0, H - 1.2, W + 0.8, 2.4, fascia, { z: D / 2 + 0.42, lit: true, back: true });
  const side = facadeTex(D + 0.8, 2.4, (x, w, h) => {
    x.fillStyle = '#1e3a2b'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#f4f4f2'; x.fillRect(w * 0.08, 0, w * 0.2, h);
    goldenM(x, w * 0.18, h * 0.5, w * 0.12, h * 0.42, '#d9a400');
    txt(x, "McDonald's", w * 0.62, h * 0.52, h * 0.34, '#ffffff', { weight: 700 });
  });
  for (const sx of [-1, 1]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(D + 0.8, 2.4), new THREE.MeshStandardMaterial({ map: side, emissive: 0xffffff, emissiveMap: side, emissiveIntensity: 0, roughness: 0.6 }));
    m.position.set(sx * (W / 2 + 0.42), H - 1.2, 0);
    m.rotation.y = sx * Math.PI / 2;
    group.add(m);
    K.glow.push(m.material);
  }
  // torre con la M en las cuatro caras
  const tx = W / 2 + 4, tz = -D / 2 - 3;
  K.box(tx - 1, tx + 1, 0, 9.5, tz - 1, tz + 1, K.mat(0x7a4a32));
  K.box(tx - 1.1, tx + 1.1, 9.5, 12, tz - 1.1, tz + 1.1, K.mat(0x1e3a2b));
  K.cyl(tx, 12, 15, tz, 0.04, 0xcccccc, 5);
  const mTex = canvasTex(128, 128, (x, w, h) => { x.fillStyle = '#1e3a2b'; x.fillRect(0, 0, w, h); goldenM(x, w / 2, h / 2, w * 0.7, h * 0.6); });
  for (const [ry, ox, oz] of [[Math.PI, 0, -1.13], [0, 0, 1.13], [Math.PI / 2, 1.13, 0], [-Math.PI / 2, -1.13, 0]]) {
    const m = K.pic(tx + ox, 10.75, 2.1, 2.1, mTex, { z: tz + oz, lit: true, ry });
    m.side = THREE.FrontSide;
  }
  g.scene.getObjectByName('mcdonaldsArgana')?.traverse(o => { o.visible = false; });
  g.scene.add(group);
  return { group, glow: K.glow };
}

/** Burger King: madera y gris, cristalera blanca con banda roja y «A LA PARRILLA DESDE 1954» */
function buildBurgerKing(g) {
  const rect = plantaDe(g, 'burgerKing');
  if (!rect) return null;
  const F = framedGroup(rect, -0.639, 0.769, 'burgerKingArgana');
  const { group, W, D } = F;
  const K = kit(group);
  const H = 7;
  K.box(-W / 2, W / 2, 0, H - 1.6, -D / 2, D / 2, 0x7b5a40);
  K.box(-W / 2, W / 2, H - 1.6, H, -D / 2 - 0.2, D / 2, 0xa3a7aa);
  vestirLados(group, W, D, H, 'madera');   // (Version 134) la trasera y los costados, que eran lisos: navesLados.js
  const tex = facadeTex(W, H, (x, w, h) => {
    x.fillStyle = '#a3a7aa'; x.fillRect(0, 0, w, 1.6);
    x.strokeStyle = '#8c9093'; x.lineWidth = 0.04;
    for (let i = 0; i < w; i += 1.25) x.strokeRect(i, 0.05, 1.25, 1.5);
    txt(x, 'A LA PARRILLA DESDE 1954', w * 0.6, 0.85, 0.75, '#ffffff', { weight: 800 });
    // madera a la izquierda con ventanilla del McAuto… del BK
    x.fillStyle = '#7b5a40'; x.fillRect(0, 1.6, w * 0.3, h - 1.6);
    x.fillStyle = '#6a4c35'; for (let y = 1.8; y < h; y += 0.35) x.fillRect(0, y, w * 0.3, 0.04);
    x.fillStyle = '#c8102e'; x.fillRect(0, 3.9, w * 0.3, 0.3);
    glazing(x, w * 0.17, 4.6, 0.8, 0.9, { frame: '#f2f2f2', glass: '#5c6c75', cols: 1, rows: 1 });
    x.fillStyle = '#8b8780'; x.fillRect(w * 0.3, 1.6, w * 0.08, h - 1.6);
    // cristalera central
    glazing(x, w * 0.38, 1.6, w * 0.4, 1.9, { frame: '#f4f4f4', glass: '#323d44', cols: 5, rows: 1 });
    x.fillStyle = '#c8102e'; x.fillRect(w * 0.38, 3.5, w * 0.62, 0.3);
    glazing(x, w * 0.38, 3.8, w * 0.4, h - 3.8, { frame: '#f4f4f4', glass: '#5a4a3c', cols: 5, rows: 1 });
    // listones de madera a la derecha
    x.fillStyle = '#f0ece6'; x.fillRect(w * 0.78, 1.6, w * 0.22, h - 1.6);
    x.fillStyle = '#7a5038'; for (let i = w * 0.78; i < w; i += 0.35) x.fillRect(i, 1.6, 0.2, h - 1.6);
    x.fillStyle = '#c8102e'; x.fillRect(w * 0.78, 3.5, w * 0.22, 0.3);
  });
  const facade = K.pic(0, H / 2, W, H, tex, { z: -D / 2 - 0.22, lit: true });
  // marquesina roja del autoservicio
  K.box(W / 2 - W * 0.3, W / 2 + 1.5, 4.1, 4.4, -D / 2 - 1.2, -D / 2, 0xc8102e);
  g.scene.add(group);
  return { group, glow: K.glow };
}

/** Decathlon: nave gris azulada con el cajón de listones de madera y el logo blanco */
function buildDecathlon(g) {
  const rect = plantaDe(g, 'decathlon');
  if (!rect) return null;
  const F = framedGroup(rect, -0.763, -0.646, 'decathlonArgana');
  const { group, W, D } = F;
  const K = kit(group);
  const H = 9;
  K.box(-W / 2, W / 2, 0, H, -D / 2, D / 2, 0xc6d0d8);
  vestirLados(group, W, D, H, 'chapa');    // (Version 134) la trasera y los costados, que eran lisos: navesLados.js
  K.box(-W / 2, W / 2, H, H + 0.6, -D / 2, -D / 2 + 0.25, 0xd7dde2);
  // cajón de madera sobre la entrada, en el lado izquierdo de la fachada (+x local)
  const bw = Math.min(W * 0.48, 34), bx = W / 2 - bw / 2 - 2;
  K.box(bx - bw / 2, bx + bw / 2, 3.6, H + 2.2, -D / 2 - 1, -D / 2, 0x9a7a58);
  const box = facadeTex(bw, H + 2.2 - 3.6, (x, w, h) => {
    slats(x, 0, 0, w, h, '#a38262', '#7d5f43', 0.22);
    x.strokeStyle = '#ffffff'; x.lineWidth = h * 0.06;
    x.beginPath(); x.ellipse(w * 0.2, h * 0.5, h * 0.16, h * 0.08, -0.5, 0, Math.PI * 2); x.stroke();
    txt(x, 'DECATHLON', w * 0.58, h * 0.52, h * 0.22, '#ffffff', { weight: 800 });
  });
  K.pic(bx, (3.6 + H + 2.2) / 2, bw, H + 2.2 - 3.6, box, { z: -D / 2 - 1.02, lit: true });
  K.box(bx - bw / 2, bx + bw / 2, 3.4, 3.6, -D / 2 - 1, -D / 2, 0x1d4fa0);
  const entry = facadeTex(bw, 3.4, (x, w, h) => {
    x.fillStyle = '#c6d0d8'; x.fillRect(0, 0, w, h);
    glazing(x, w * 0.08, 0, w * 0.5, 3.2, { frame: '#3b4650', glass: '#283c58', cols: 8, rows: 1 });
  });
  K.pic(bx, 1.7, bw, 3.4, entry, { z: -D / 2 - 0.02 });
  // muelle de carga en la trasera
  K.box(W / 2 - 14, W / 2 - 9, 0, 4.2, D / 2, D / 2 + 0.6, 0xf1f1ef);
  K.box(W / 2 - 13.5, W / 2 - 9.5, 0.4, 3.8, D / 2 + 0.6, D / 2 + 0.7, 0xe8e8e8);
  g.scene.add(group);
  return { group, glow: K.glow };
}

/** naves de la calle Tenderete: cada una con su fachada pintada en tramos */
function buildNave(g, tag, name, toward, H, wall, sections, { roof = 'flat', skirt = null } = {}) {
  const rect = plantaDe(g, tag);
  if (!rect) return null;
  const F = framedGroup(rect, toward[0] - rect.cx, toward[1] - rect.cz, name);
  const { group, W, D } = F;
  const K = kit(group);
  K.box(-W / 2, W / 2, 0, H, -D / 2, D / 2, wall);
  if (skirt) K.box(-W / 2 - 0.05, W / 2 + 0.05, 0, 0.9, -D / 2 - 0.05, D / 2 + 0.05, skirt);
  if (roof === 'gable') {
    const s = new THREE.Shape();
    s.moveTo(-D / 2, 0); s.lineTo(0, 2.6); s.lineTo(D / 2, 0); s.lineTo(-D / 2, 0);
    const geo = new THREE.ExtrudeGeometry(s, { depth: W, bevelEnabled: false });
    geo.rotateY(Math.PI / 2);
    geo.translate(-W / 2, H, 0);
    const r = new THREE.Mesh(geo, K.mat(0xc9c4b8));
    r.castShadow = true;
    group.add(r);
  }
  // fachada: tramos de izquierda a derecha vistos desde la calle [ancho relativo, alto (m), dibujo]
  // (mirando a la fachada, la izquierda es +x local)
  const total = sections.reduce((s, q) => s + q[0], 0);
  let x0 = W / 2;
  for (const [rel, hh, draw] of sections) {
    const w = W * rel / total;
    const tex = facadeTex(w, hh, (x, ww, h) => draw(x, ww, h));
    K.pic(x0 - w / 2, hh / 2, w, hh, tex, { z: -D / 2 - 0.03, lit: true });
    x0 -= w;
  }
  g.scene.add(group);
  return { group, glow: K.glow };
}

function whiteNave(x, w, h, { skirt = '#2e5c9a', door = true } = {}) {
  x.fillStyle = '#f2f1ec'; x.fillRect(0, 0, w, h);
  x.fillStyle = skirt; x.fillRect(0, h - 0.9, w, 0.9);
  if (door) {
    x.fillStyle = '#c8c0b0'; x.fillRect(w * 0.15, h - 4.6, 4, 4.6);
    x.fillStyle = '#b3aa98'; for (let y = h - 4.6; y < h; y += 0.3) x.fillRect(w * 0.15, y, 4, 0.05);
  }
  x.fillStyle = '#5b5248';
  x.fillRect(w * 0.55, h - 3.4, 1, 0.9);
  x.fillRect(w * 0.7, h - 3.4, 1, 0.9);
}

/** punto más cercano de una calle con nombre, para que las fachadas la miren */
function nearestOn(g, re, x, z) {
  let best = null;
  for (const r of g.map.roads || []) {
    if (!re.test(r.name || '')) continue;
    for (let i = 1; i < r.p.length; i++) {
      const [ax, az] = r.p[i - 1], [bx, bz] = r.p[i];
      const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2));
      const px = ax + dx * t, pz = az + dz * t, d = Math.hypot(px - x, pz - z);
      if (!best || d < best.d) best = { d, x: px, z: pz };
    }
  }
  return best ? [best.x, best.z] : [x - 1, z];
}

function buildTenderete(g) {
  const out = [];
  const calle = tag => {
    const b = (g.map.buildings || []).find(b => b.arrecifeExtra === tag);
    if (!b) return [0, 0];
    const r = rectOf(b.p);
    return nearestOn(g, /tenderete/i, r.cx, r.cz);
  };
  const up = calle('mitsubishi'), up2 = calle('talleres');
  // Fuji y Kiwa, junto a la rotonda del HiperDino
  out.push(buildNave(g, 'fujiKiwa', 'tendereteFujiKiwa', calle('fujiKiwa'), 8, 0xf1efe9, [
    [1, 8, (x, w, h) => {
      x.fillStyle = '#f1efe9'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#1b1b1b'; x.beginPath(); x.arc(w * 0.5, 3.2, 2.6, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#c8102e'; x.beginPath(); x.arc(w * 0.5, 3.2, 2.6, Math.PI * 1.05, Math.PI * 1.95); x.lineTo(w * 0.5, 3.2); x.fill();
      txt(x, 'FUJI', w * 0.5, 3.5, 1.3, '#ffffff', { weight: 800 });
      txt(x, 'RESTAURANTE', w * 0.5, 4.5, 0.42, '#ffffff', { weight: 700 });
      x.fillStyle = '#2b2b2b'; x.fillRect(w * 0.08, 6.3, w * 0.84, 0.5);
      txt(x, 'BARBACOA · TEPPANYAKI · WOK', w * 0.5, 6.55, 0.32, '#ffffff', { weight: 700 });
      glazing(x, w * 0.65, 6.8, w * 0.28, 1.2, { frame: '#dddddd', glass: '#3a3f44', cols: 2, rows: 1 });
    }],
    [1, 8, (x, w, h) => {
      x.fillStyle = '#f1efe9'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#8dc63f'; x.fillRect(w * 0.12, 2.6, w * 0.3, 2.8);
      txt(x, 'KIWA', w * 0.27, 1.4, 1.1, '#6aa32e', { weight: 800 });
      txt(x, 'VETERINARIO · PELUQUERÍA · LAVAMASCOTAS', w * 0.55, 0.5, 0.32, '#333', { weight: 700 });
      // portada de piedra con frontón
      x.fillStyle = '#4b4f52';
      x.fillRect(w * 0.5, 2.2, 0.5, 5.8); x.fillRect(w * 0.5 + 3.5, 2.2, 0.5, 5.8);
      x.beginPath(); x.moveTo(w * 0.5 - 0.4, 2.3); x.lineTo(w * 0.5 + 2, 1.2); x.lineTo(w * 0.5 + 4.4, 2.3); x.closePath(); x.fill();
      glazing(x, w * 0.5 + 0.5, 4.2, 3, 3.8, { frame: '#e6e6e6', glass: '#5b6b5c', cols: 2, rows: 1 });
      x.fillStyle = '#b6d77a'; x.beginPath(); x.arc(w * 0.85, 5, 1, 0, Math.PI * 2); x.fill();
    }],
    [0.8, 8, (x, w, h) => {
      x.fillStyle = '#f1efe9'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#4b4f52'; x.fillRect(w * 0.3, 2.4, 0.4, 5.6); x.fillRect(w * 0.3 + 3.2, 2.4, 0.4, 5.6);
      x.beginPath(); x.moveTo(w * 0.3 - 0.4, 2.5); x.lineTo(w * 0.3 + 1.8, 1.4); x.lineTo(w * 0.3 + 4, 2.5); x.closePath(); x.fill();
      x.fillStyle = '#d6d0c4'; x.fillRect(w * 0.3 + 0.4, 3.6, 2.8, 4.4);
    }],
  ].reverse())); // escritos de la rotonda hacia arriba; en la calle Fuji queda a la derecha
  // Mitsubishi Motors y 928 Hybrid Club
  out.push(buildNave(g, 'mitsubishi', 'tendereteMitsubishi', up, 7, 0x2a2b2d, [
    [1.1, 7, (x, w, h) => {
      x.fillStyle = '#232426'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#2d2e30'; for (let i = 0; i < w; i += 0.6) for (let j = 1.2; j < h; j += 0.6) x.fillRect(i + 0.02, j + 0.02, 0.56, 0.56);
      txt(x, 'MITSUBISHI MOTORS', w * 0.45, 0.65, 0.6, '#3a3b3e', { weight: 700 });
      // paño de azulejo gris con el rótulo
      x.fillStyle = '#c9cbcd'; x.fillRect(w * 0.42, 1.6, w * 0.26, h - 1.6);
      x.strokeStyle = '#aeb1b3'; x.lineWidth = 0.03;
      for (let i = w * 0.42; i < w * 0.68; i += 0.6) for (let j = 1.6; j < h; j += 0.6) x.strokeRect(i, j, 0.6, 0.6);
      x.fillStyle = '#f2f2f2'; x.fillRect(w * 0.45, 2.3, w * 0.2, 0.9);
      x.fillStyle = '#e60012'; x.fillRect(w * 0.45, 3.05, w * 0.2, 0.15);
      x.fillStyle = '#e60012';
      for (let k = 0; k < 3; k++) { x.save(); x.translate(w * 0.47, 2.75); x.rotate(k * 2.094); x.beginPath(); x.moveTo(0, 0); x.lineTo(-0.12, -0.2); x.lineTo(0, -0.4); x.lineTo(0.12, -0.2); x.fill(); x.restore(); }
      txt(x, 'MITSUBISHI MOTORS', w * 0.565, 2.75, 0.32, '#333', { weight: 700 });
      glazing(x, w * 0.08, 3.4, w * 0.28, 2.2, { frame: '#1d1d1d', glass: '#4a545b', cols: 2, rows: 1 });
      glazing(x, w * 0.46, 3.9, w * 0.14, 1.8, { frame: '#1d1d1d', glass: '#4a545b', cols: 1, rows: 1 });
      glazing(x, w * 0.71, 2.8, w * 0.24, 4.2, { frame: '#f2f2f2', glass: '#cfd6da', cols: 4, rows: 2 });
    }],
    [1, 7, (x, w, h) => {
      whiteNave(x, w, h, { skirt: '#1b1b1b', door: false });
      x.fillStyle = '#151515'; x.fillRect(w * 0.55, 2.6, 3.4, h - 2.6);
      txt(x, '928°', w * 0.5, 1.1, 1.1, '#151515', { weight: 800 });
      txt(x, 'HYBRID CLUB', w * 0.5, 1.95, 0.34, '#151515', { weight: 700 });
      x.strokeStyle = '#151515'; x.lineWidth = 0.08; x.beginPath(); x.arc(w * 0.25, 4.4, 1.1, 0, Math.PI * 2); x.stroke();
      txt(x, 'NO LIMITS · NO RULES', w * 0.25, 4.4, 0.2, '#151515', { weight: 700 });
    }],
  ], { roof: 'flat' }));
  // talleres: Autoguagua y El Norte (AD), naves blancas con zócalo azul
  out.push(buildNave(g, 'talleres', 'tendereteTalleres', up2, 6, 0xf2f1ec, [
    [1, 7, (x, w, h) => {
      whiteNave(x, w, h);
      x.fillStyle = '#3d3a36'; x.fillRect(w * 0.3, 0.2, w * 0.45, 2);
      x.fillStyle = '#d9d4ca'; x.beginPath(); x.moveTo(w * 0.3, 2.2); x.lineTo(w * 0.42, 0.2); x.lineTo(w * 0.3, 0.2); x.fill();
      txt(x, 'TALLER', w * 0.62, 0.65, 0.38, '#f2f1ec', { weight: 700 });
      txt(x, 'AUTOGUAGUA', w * 0.55, 1.5, 0.62, '#f2f1ec', { weight: 800, italic: true });
    }],
    [1, 7, (x, w, h) => {
      x.fillStyle = '#c3c6c8'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#1f4f86'; x.fillRect(0, h - 0.9, w, 0.9); x.fillRect(0, 2.4, w, 0.5);
      x.fillStyle = '#f7f7f7'; x.fillRect(w * 0.3, 0.1, w * 0.45, 2.3);
      x.strokeStyle = '#1f4f86'; x.lineWidth = 0.08; x.strokeRect(w * 0.3, 0.1, w * 0.45, 2.3);
      txt(x, 'El Norte', w * 0.56, 0.95, 0.9, '#2f6db5', { weight: 800 });
      txt(x, 'Taller Mecánico', w * 0.56, 1.75, 0.36, '#1f2f4a', { weight: 700 });
      txt(x, '928 811 906', w * 0.38, 1.9, 0.22, '#1f2f4a', { weight: 700 });
      x.fillStyle = '#d0302a'; x.beginPath(); x.moveTo(w * 0.12, 2.2); x.lineTo(w * 0.24, 2.2); x.lineTo(w * 0.18, 3.6); x.fill();
      x.fillStyle = '#1f4f86'; x.fillRect(w * 0.6, 3.2, 4.4, h - 3.2);
      x.fillStyle = '#ffffff'; x.font = `800 2px ${BARLOW}`; x.textAlign = 'center'; x.fillText('ad', w * 0.6 + 2.2, 5.6);
      x.fillStyle = '#d0302a'; x.beginPath(); x.arc(w * 0.6 + 1.7, 5.05, 0.32, 0, Math.PI * 2); x.fill();
    }],
    [1.2, 7, (x, w, h) => whiteNave(x, w, h)],
  ], { roof: 'gable' }));
  return out.filter(Boolean);
}

/** monumento «Barrio de Titerroy» junto al paso bajo la Circunvalación */
function buildTiterroy(g) {
  const group = new THREE.Group();
  group.name = 'monumentoTiterroy';
  group.position.set(-1019.3, 0, -1069);
  // la placa mira a la calle Tenderete
  group.rotation.y = Math.atan2(0.858, -0.513);
  const K = kit(group);
  K.box(-1.8, 1.8, 0, 0.9, -0.7, 0.7, 0xf3f3f0);
  const bronze = K.mat(0x3b3430, { metalness: 0.5, roughness: 0.5 });
  K.box(-0.25, 0.25, 0.9, 3.6, 0.12, 0.42, bronze);
  K.box(-1.3, 1.1, 1.6, 3.4, -0.12, 0.12, bronze);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), bronze);
  ball.position.set(0, 3.95, 0.27);
  group.add(ball);
  const plate = canvasTex(256, 192, (x, w, h) => {
    x.fillStyle = '#3b3430'; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#8c8070'; x.lineWidth = 6; x.strokeRect(8, 8, w - 16, h - 16);
    x.fillStyle = '#e8e2d6'; x.font = '700 30px Georgia, serif'; x.textAlign = 'center';
    x.fillText('BARRIO', w / 2, 62); x.fillText('DE', w / 2, 102); x.fillText('TITERROY', w / 2, 142);
  });
  K.pic(-0.1, 2.5, 2.3, 1.7, plate, { z: -0.13 });
  g.scene.add(group);
  return { group, x: -1019.3, z: -1069 };
}

/* ---------------- Paso inferior de la Circunvalación ---------------- */

/**
 * Puente de la Circunvalación sobre la calle que va de la rotonda de Tenderete a Titerroy.
 * arrecife-mapa.js abre la trinchera en el terreno; aquí va el tablero (a la altura que
 * tenía la carretera), los muros blancos de la boca y una superficie para que el coche
 * siga por arriba si viene por la Circunvalación y pase por debajo si viene por la calle.
 */
function buildPasoTenderete(g) {
  if (!g.terrainY || !g.player?.roofs?.cells) return null;
  const C = [-995.8, -1016.3];
  const h = [0.766, -0.645], n = [-h[1], h[0]]; // a lo largo de la Circunvalación y de la calle
  const L = 50, W = 28; // tablero: largo por la carretera, ancho por la calle
  const at = (lx, lz) => [C[0] + h[0] * lx + n[0] * lz, C[1] + h[1] * lx + n[1] * lz];
  // altura de la carretera justo fuera de la trinchera, a cada lado; el tablero va en rampa entre las dos
  // (sobre las dos calzadas, que van a unos 5,5 m del eje)
  const [Ya, Yb] = [-27, 27].map(lx => [-5.5, 5.5].reduce((s, lz) => s + g.terrainY(...at(lx, lz)), 0) / 2);
  const deckY = lx => Ya + (Yb - Ya) * (lx + 27) / 54 + 0.03;
  const floorAt = (lx, lz) => g.terrainY(...at(lx, lz));

  const group = new THREE.Group();
  group.name = 'pasoTenderete';
  group.position.set(C[0], 0, C[1]);
  group.rotation.y = Math.atan2(-h[1], h[0]); // x local = h, z local = n
  // el tablero en su propio grupo, inclinado con la carretera; dentro, el piso está en y = 0
  const deck = new THREE.Group();
  deck.position.y = deckY(0);
  deck.rotation.z = Math.atan2(Yb - Ya, 54);
  group.add(deck);
  const Y = 0;
  const K = kit(deck), KG = kit(group);
  const concrete = K.mat(0xd9d6cf, { roughness: 0.9 }), white = K.mat(0xf1efe9, { roughness: 0.85 });
  const asphalt = K.mat(0x3a3c3f, { roughness: 0.95 }), soffit = K.mat(0x8e8b85, { roughness: 0.95 });
  const level = [];
  // tablero
  level.push(K.box(-L / 2, L / 2, Y - 1.3, Y - 0.25, -W / 2, W / 2, soffit));
  level.push(K.box(-L / 2, L / 2, Y - 0.25, Y, -W / 2, W / 2, asphalt));
  // vigas de borde blancas (lo que se ve desde la calle) y pretiles
  for (const s of [-1, 1]) {
    level.push(K.box(-L / 2, L / 2, Y - 1.5, Y + 0.25, s * W / 2 - 0.4, s * W / 2 + 0.4, white));
    level.push(K.box(-L / 2, L / 2, Y, Y + 0.95, s * (W / 2 - 0.25) - 0.15, s * (W / 2 - 0.25) + 0.15, concrete));
  }
  // mediana y marcas viales
  level.push(K.box(-L / 2, L / 2, Y, Y + 0.8, -0.3, 0.3, concrete));
  const marks = [];
  for (const lz of [-W / 2 + 1.2, -1.2, 1.2, W / 2 - 1.2]) marks.push([-L / 2, L / 2, Y + 0.005, Y + 0.02, lz - 0.08, lz + 0.08]);
  for (const lz of [-W / 4 - 0.6, W / 4 + 0.6]) for (let lx = -L / 2 + 1; lx < L / 2; lx += 9) marks.push([lx, lx + 4.5, Y + 0.005, Y + 0.02, lz - 0.08, lz + 0.08]);
  for (const [x0, x1, y0, y1, z0, z1] of marks) level.push(K.box(x0, x1, y0, y1, z0, z1, 0xf2f2ee));
  // muros de la boca a los dos lados de la calle, del fondo de la trinchera al tablero
  const wallQuad = (a, b, yb, ytA, ytB, m) => {
    const [ax, az] = a, [bx, bz] = b;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute([ax, yb, az, bx, yb, bz, bx, ytB, bz, ax, ytA, az], 3));
    geo.setIndex([0, 1, 2, 0, 2, 3]);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, m);
    group.add(mesh);
    level.push(mesh);
  };
  const wallMat = KG.mat(0xf3f1ec, { roughness: 0.9, side: THREE.DoubleSide });
  const base = Math.min(floorAt(0, 0), floorAt(0, -W / 2), floorAt(0, W / 2)) - 0.6;
  for (const sx of [-6.5, 6.5]) {
    const top = deckY(sx);
    wallQuad([sx, -W / 2], [sx, W / 2], base, top - 1.3, top - 1.3, wallMat);
    // aletas: bajan desde el tablero hasta el terreno de fuera
    for (const sz of [-1, 1]) {
      const z0 = sz * W / 2, z1 = sz * (W / 2 + 12), x1 = sx * 1.9;
      wallQuad([sx, z0], [x1, z1], base, top - 0.2, floorAt(x1, z1) + 0.8, wallMat);
    }
  }
  // farolas bajo el puente
  const lamps = [];
  for (const lz of [-7, 0, 7]) {
    const m = K.mat(0xfff3d6, { emissive: 0xffe2a8, emissiveIntensity: 0 });
    level.push(K.box(-1.2, 1.2, Y - 1.42, Y - 1.3, lz - 0.2, lz + 0.2, m));
    lamps.push(m);
  }
  // el tablero no sigue el relieve: va a su altura absoluta, y el shader le resta la del
  // jugador. Three.js no lo sabe y lo daría por fuera de cámara: se dibuja siempre.
  for (const o of level) {
    o.material.userData = { ...o.material.userData, terrain: 'level' };
    o.frustumCulled = false;
  }

  // superficie para el coche: losetas sobre el tablero con su altura respecto al terreno
  // (losetas pequeñas: su altura se mide sobre el terreno y en los taludes cambia deprisa)
  const roofs = g.player.roofs, Pc = 24, step = 1.25;
  let tiles = 0;
  for (let lx = -L / 2 + step / 2; lx < L / 2; lx += step) {
    for (let lz = -W / 2 + step / 2; lz < W / 2; lz += step) {
      const [cx, cz] = at(lx, lz), s = g.terrainY(cx, cz), top = deckY(lx);
      if (top - s < 0.02) continue; // fuera de la trinchera el terreno ya está a su altura
      const p = [at(lx - step / 2, lz - step / 2), at(lx + step / 2, lz - step / 2), at(lx + step / 2, lz + step / 2), at(lx - step / 2, lz + step / 2)];
      p.push(p[0]);
      const xs = p.map(q => q[0]), zs = p.map(q => q[1]);
      const item = { p, h: top - s + 0.14, x0: Math.min(...xs), x1: Math.max(...xs), z0: Math.min(...zs), z1: Math.max(...zs) };
      for (let a = Math.floor(item.x0 / Pc); a <= Math.floor(item.x1 / Pc); a++) {
        for (let b = Math.floor(item.z0 / Pc); b <= Math.floor(item.z1 / Pc); b++) {
          const key = a + ',' + b;
          if (!roofs.cells.has(key)) roofs.cells.set(key, []);
          roofs.cells.get(key).push(item);
        }
      }
      tiles++;
    }
  }
  g.scene.add(group);
  return { group, lamps, tiles, Y: deckY(0), x: C[0], z: C[1] };
}

/* ---------------- Cabildo y Playa Honda (de las versiones anteriores) ---------------- */

/** Cabildo de Lanzarote: planta alta blanca con balaustrada, portada de piedra y torre del reloj */
function buildCabildo(g) {
  const ALTA = [[-1272, 456.5], [-1237.8, 453.3], [-1233.2, 504.3], [-1267.4, 507.5], [-1270.5, 473.7]];
  const H0 = 8.6, H1 = 12.4;
  const group = new THREE.Group();
  group.name = 'cabildoLanzarote';
  const K = kit(group);
  const white = K.mat(0xf4f2ec, { roughness: 0.85 }), stone = K.mat(0xd2c6a3, { roughness: 0.9 });
  // planta alta extruida
  const shape = new THREE.Shape(ALTA.map(([x, z]) => new THREE.Vector2(x, -z)));
  const geo = new THREE.ExtrudeGeometry(shape, { depth: H1 - H0, bevelEnabled: false });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, H0, 0);
  const alta = new THREE.Mesh(geo, white);
  alta.castShadow = alta.receiveShadow = true;
  group.add(alta);
  // ventanas y balaustrada en cada lado de la planta alta
  const win = canvasTex(256, 96, (x, w, h) => {
    x.fillStyle = '#f4f2ec'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) { x.fillStyle = '#3d4a52'; x.fillRect(14 + i * 62, 22, 36, 52); x.fillStyle = '#e2ddd0'; x.fillRect(10 + i * 62, 74, 44, 6); }
  });
  win.wrapS = THREE.RepeatWrapping;
  const rail = canvasTex(256, 64, (x, w, h) => {
    x.fillStyle = '#f4f2ec'; x.fillRect(0, 0, w, 10); x.fillRect(0, h - 10, w, 10);
    for (let i = 8; i < w; i += 22) { x.beginPath(); x.ellipse(i, h / 2, 6, h / 2 - 10, 0, 0, Math.PI * 2); x.fill(); }
  });
  rail.wrapS = THREE.RepeatWrapping;
  // orientación de la planta para sacar las normales hacia fuera
  let area = 0;
  for (let i = 0; i < ALTA.length; i++) { const [a, b] = ALTA[i], [c, d] = ALTA[(i + 1) % ALTA.length]; area += a * d - c * b; }
  const sgn = area > 0 ? 1 : -1;
  for (let i = 0; i < ALTA.length; i++) {
    const [ax, az] = ALTA[i], [bx, bz] = ALTA[(i + 1) % ALTA.length];
    const L = Math.hypot(bx - ax, bz - az), nx = sgn * (bz - az) / L, nz = -sgn * (bx - ax) / L;
    const ry = Math.atan2(nx, nz);
    for (const [tex, y0, h, off, glow] of [[win, H0, H1 - H0, 0.06, true], [rail, H1, 0.95, 0.06, false]]) {
      const t = tex.clone(); t.needsUpdate = true; t.repeat.set(Math.max(1, Math.round(L / 6)), 1);
      const m = new THREE.MeshStandardMaterial({ map: t, transparent: !glow, alphaTest: glow ? 0 : 0.4, side: THREE.DoubleSide, roughness: 0.8 });
      const p = new THREE.Mesh(new THREE.PlaneGeometry(L, h), m);
      p.position.set((ax + bx) / 2 + nx * off, y0 + h / 2, (az + bz) / 2 + nz * off);
      p.rotation.y = ry;
      group.add(p);
    }
  }
  // portada de piedra con frontón y arco, mirando a la plaza (sur)
  const bi = [-1272.4, 496.3], yi = [-1299.5, 498.8];
  const fl = Math.hypot(yi[0] - bi[0], yi[1] - bi[1]), u = [(yi[0] - bi[0]) / fl, (yi[1] - bi[1]) / fl];
  const p = [u[1], -u[0]]; // hacia la plaza, al sur
  const portal = new THREE.Group();
  portal.position.set((bi[0] + yi[0]) / 2, 0, (bi[1] + yi[1]) / 2);
  portal.rotation.y = Math.atan2(-p[0], -p[1]); // −z local mira a la plaza
  group.add(portal);
  const P = kit(portal);
  P.box(-3.25, 3.25, 0, 12.2, -2, 0, stone);
  const ped = new THREE.Shape([new THREE.Vector2(-3.4, 0), new THREE.Vector2(3.4, 0), new THREE.Vector2(0, 2.6)]);
  const pg = new THREE.ExtrudeGeometry(ped, { depth: 2, bevelEnabled: false });
  pg.translate(0, 12.2, -2);
  const pm = new THREE.Mesh(pg, stone); pm.castShadow = true; portal.add(pm);
  P.box(-3.5, 3.5, 12, 12.3, -2.1, 0.1, white);
  const arch = canvasTex(128, 256, (x, w, h) => {
    x.fillStyle = '#d2c6a3'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#2e3a42'; x.beginPath(); x.moveTo(14, h); x.lineTo(14, w / 2); x.arc(w / 2, w / 2, w / 2 - 14, Math.PI, 0); x.lineTo(w - 14, h); x.fill();
    x.strokeStyle = '#efe8d6'; x.lineWidth = 3; for (let y = 70; y < h; y += 40) { x.beginPath(); x.moveTo(14, y); x.lineTo(w - 14, y); x.stroke(); }
    x.beginPath(); x.moveTo(w / 2, 14); x.lineTo(w / 2, h); x.stroke();
  });
  P.pic(0, 3.6 + 3.6, 3.6, 7.2, arch, { z: -2.03 });
  P.box(-2.3, 2.3, 0, 0.5, -3.2, -2, white);
  // torre del reloj, al este de la portada y metida en el edificio
  const tx = -7.2, tz = 2.5;
  P.box(tx - 2.1, tx + 2.1, 0, 15.6, tz - 2.1, tz + 2.1, stone);
  P.box(tx - 2.35, tx + 2.35, 15.6, 16.05, tz - 2.35, tz + 2.35, white);
  const clock = canvasTex(128, 128, (x, w, h) => {
    x.fillStyle = '#f7f3e8'; x.beginPath(); x.arc(64, 64, 60, 0, Math.PI * 2); x.fill();
    x.strokeStyle = '#2b2b2b'; x.lineWidth = 4; x.stroke();
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; x.fillStyle = '#2b2b2b'; x.fillRect(64 + Math.cos(a) * 48 - 2, 64 + Math.sin(a) * 48 - 2, 4, 4); }
    x.lineWidth = 5; x.beginPath(); x.moveTo(64, 64); x.lineTo(64, 28); x.stroke();
    x.lineWidth = 4; x.beginPath(); x.moveTo(64, 64); x.lineTo(92, 64); x.stroke();
  });
  for (const [ry, ox, oz] of [[Math.PI, 0, -2.13], [0, 0, 2.13], [Math.PI / 2, 2.13, 0], [-Math.PI / 2, -2.13, 0]]) {
    const m = new THREE.Mesh(new THREE.CircleGeometry(0.95, 32), new THREE.MeshStandardMaterial({ map: clock, roughness: 0.6 }));
    m.position.set(tx + ox, 14.2, tz + oz);
    m.rotation.y = ry;
    portal.add(m);
  }
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), white);
    b.position.set(tx + sx * 2.1, 16.55, tz + sz * 2.1);
    portal.add(b);
  }
  g.scene.add(group);
  return { group, x: -1286, z: 505 };
}

/** naves de Playa Honda junto a la avenida Mamerto Cabrera */
function buildNavesPlayaHonda(g) {
  const naves = [
    // [nombre, x centro, z0, z1, ancho, alto, pared, zócalo, líneas del rótulo, color rótulo, fondo rótulo]
    ['cashDiplo', -3751, 529, 539, 14, 5.5, 0xeef0f2, '#1d6fb8', ['CASH', 'DIPLO'], '#ffffff', '#1d6fb8', 'SUPERMERCADO'],
    ['cashLee', -3678, 526, 536, 14, 5.5, 0xf2f3f4, '#c8102e', ['CASH', 'LEE'], '#ffffff', '#c8102e', 'ALIMENTACIÓN · BAZAR'],
    ['baratissimos', -3653, 530, 540, 12, 5.2, 0xf5e4dc, '#e2007a', ['BARATISSIMOS'], '#ffffff', '#e2007a', 'TODO A BUEN PRECIO'],
  ];
  const out = [];
  for (const [name, cx, z0, z1, w, h, wall, skirt, lines, fg, bg, sub] of naves) {
    const group = new THREE.Group();
    group.name = name;
    // la fachada mira a la avenida, al norte (−z)
    group.position.set(cx, 0, (z0 + z1) / 2);
    const K = kit(group);
    const d = z1 - z0;
    K.box(-w / 2, w / 2, 0, h, -d / 2, d / 2, wall);
    K.box(-w / 2 - 0.2, w / 2 + 0.2, h, h + 0.35, -d / 2 - 0.2, d / 2 + 0.2, 0xe6e6e1);
    const tex = facadeTex(w, h, (x, W, H) => {
      x.fillStyle = '#' + wall.toString(16).padStart(6, '0'); x.fillRect(0, 0, W, H);
      x.fillStyle = skirt; x.fillRect(0, H - 0.6, W, 0.6);
      x.fillStyle = bg; x.fillRect(0.6, 0.35, W - 1.2, 1.5);
      if (lines.length === 2) {
        txt(x, lines[0], W * 0.32, 1.1, 0.95, fg, { weight: 800 });
        txt(x, lines[1], W * 0.66, 1.1, 0.95, '#ffd400', { weight: 800 });
      } else txt(x, lines[0], W / 2, 1.1, 0.85, fg, { weight: 800 });
      txt(x, sub, W / 2, 2.25, 0.36, '#333', { weight: 700 });
      glazing(x, W * 0.08, 2.6, W * 0.5, H - 3.2, { frame: '#2a2a2a', glass: '#3e4a52', cols: 4, rows: 1 });
      x.fillStyle = '#20262a'; x.fillRect(W * 0.66, 2.6, 2.4, H - 3.2);
    });
    K.pic(0, h / 2, w, h, tex, { z: -d / 2 - 0.03, lit: true });
    g.scene.add(group);
    out.push({ group, glow: K.glow });
  }
  return out;
}

/** «Av. Mamerto Cabrera» pintado en el asfalto y su placa azul */
function buildPinturaMamerto(g) {
  const C = [-3600, 517];
  const roads = (g.map.roads || []).filter(r => /mamerto cabrera/i.test(r.name || '') && r.p.length > 1);
  if (!roads.length) return null;
  let best = null;
  for (const r of roads) for (let i = 1; i < r.p.length; i++) {
    const [ax, az] = r.p[i - 1], [bx, bz] = r.p[i], L = Math.hypot(bx - ax, bz - az);
    if (L < 20) continue;
    const mx = (ax + bx) / 2, mz = (az + bz) / 2, dd = Math.hypot(mx - C[0], mz - C[1]);
    if (!best || dd < best.dd) best = { dd, mx, mz, dx: (bx - ax) / L, dz: (bz - az) / L, w: r.w || 8 };
  }
  if (!best) return null;
  const group = new THREE.Group();
  group.name = 'pinturaMamerto';
  const paint = canvasTex(1024, 160, (x, w, h) => {
    const s = 'AV. MAMERTO CABRERA';
    x.font = `800 110px ${BARLOW}`;
    const size = Math.min(110, 110 * w * 0.94 / x.measureText(s).width);
    x.font = `800 ${size}px ${BARLOW}`; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = 'rgba(245,245,240,0.92)'; x.fillText(s, w / 2, h / 2);
  });
  const mat = new THREE.MeshBasicMaterial({ map: paint, transparent: true, depthWrite: false, opacity: 0.85 });
  for (const side of [-1, 1]) {
    const off = best.w / 4 * side;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(11, 1.7), mat);
    m.rotation.x = -Math.PI / 2;
    m.rotation.z = -Math.atan2(best.dx, best.dz) + Math.PI / 2 + (side > 0 ? Math.PI : 0);
    m.position.set(best.mx - best.dz * off, 0.27, best.mz + best.dx * off);
    m.renderOrder = 2;
    group.add(m);
  }
  // placa azul en la acera
  const sx = best.mx - best.dz * (best.w / 2 + 1.4), sz = best.mz + best.dx * (best.w / 2 + 1.4);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.7, 8), new THREE.MeshStandardMaterial({ color: 0x9aa1a6, metalness: 0.6, roughness: 0.4 }));
  post.position.set(sx, 1.35, sz);
  const plate = canvasTex(512, 128, (x, w, h) => {
    x.fillStyle = '#1d4fa0'; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#ffffff'; x.lineWidth = 6; x.strokeRect(8, 8, w - 16, h - 16);
    x.fillStyle = '#ffffff'; x.font = `700 40px ${BARLOW}`; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('Avda. Mamerto Cabrera', w / 2, h / 2);
  });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.4), new THREE.MeshStandardMaterial({ map: plate, side: THREE.DoubleSide, roughness: 0.5 }));
  sign.position.set(sx, 2.55, sz);
  sign.rotation.y = Math.atan2(best.dx, best.dz) + Math.PI / 2;
  group.add(post, sign);
  g.scene.add(group);
  return { group };
}

/* ---------------- Norte de Arrecife ---------------- */

/**
 * Las calles y casas reales del norte (arrecife-norte-datos.js) las mete arrecife-mapa.js en el
 * mapa antes de que el juego lo levante. Lo que el juego no hace solo:
 * - los caminos de tierra: solo pinta los suyos de la casa del campo; los nuevos se dibujan
 *   aquí con el mismo material de tierra y sus roderas;
 * - el suelo del campo (tierraCampo) es una malla de 15 m que en las cuestas queda por encima
 *   del asfalto: donde van las calles nuevas se rehace a 3 m y un poco hundida bajo la calzada;
 * - las matas y piedras del campo que caían encima de las calles y casas nuevas se quitan.
 */
function norteArrecife(g) {
  const calles = (g.map.roads || []).filter(r => r.norte && r.p?.length > 1);
  if (!calles.length) return null;
  const casas = (g.map.buildings || []).filter(b => b.norte && b.p?.length > 2);

  // tramos de calle nueva por celdas de 20 m
  const celdas = new Map(), key = (i, j) => i * 100003 + j;
  for (const r of calles) for (let k = 1; k < r.p.length; k++) {
    const a = r.p[k - 1], b = r.p[k], m = r.w / 2 + 4;
    for (let i = Math.floor((Math.min(a[0], b[0]) - m) / 20); i <= Math.floor((Math.max(a[0], b[0]) + m) / 20); i++)
      for (let j = Math.floor((Math.min(a[1], b[1]) - m) / 20); j <= Math.floor((Math.max(a[1], b[1]) + m) / 20); j++) {
        if (!celdas.has(key(i, j))) celdas.set(key(i, j), []);
        celdas.get(key(i, j)).push([a, b, r]);
      }
  }
  /** la calle nueva que pisa (x, z), contando `extra` metros de acera */
  const enCalle = (x, z, extra = 0) => {
    for (const [a, b, r] of celdas.get(key(Math.floor(x / 20), Math.floor(z / 20))) || []) {
      const dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz;
      const u = l2 ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / l2)) : 0;
      if (Math.hypot(x - a[0] - dx * u, z - a[1] - dz * u) < r.w / 2 + extra) return r;
    }
    return null;
  };
  const cajas = casas.map(b => {
    const xs = b.p.map(q => q[0]), zs = b.p.map(q => q[1]);
    return [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs), b.p];
  });
  const enCasa = (x, z) => cajas.some(([x0, z0, x1, z1, p]) => x > x0 - 1 && x < x1 + 1 && z > z0 - 1 && z < z1 + 1 && dentroDe(p, x, z));

  // caminos de tierra, como los del juego: banda de tierra y dos roderas más claras
  const camino = g.scene.getObjectByName('caminoTierra');
  let caminos = 0;
  if (camino) {
    const mt = camino.material, mpt = mt.map?.userData?.mpt || 3;
    let rod = null;
    camino.parent.traverse(o => { if (!rod && o.isMesh && o.material?.map && o.material.color?.getHex() === 0xe8dccf) rod = o.material; });
    if (!rod) { rod = mt.clone(); rod.color.setHex(0xe8dccf); }
    const remuestrea = p => {
      const out = [p[0]];
      for (let k = 1; k < p.length; k++) {
        const [ax, az] = p[k - 1], [bx, bz] = p[k], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 3));
        for (let i = 1; i <= n; i++) out.push([ax + (bx - ax) * i / n, az + (bz - az) * i / n]);
      }
      return out;
    };
    const banda = (p, w, y, pos, uv) => {
      for (let s = 0; s < p.length - 1; s++) {
        const [ox, oz] = p[s], [ax, az] = p[s + 1], l = Math.hypot(ax - ox, az - oz);
        if (l < 0.01) continue;
        const cx = -(az - oz) / l * w / 2, cz = (ax - ox) / l * w / 2;
        const f = [ox + cx, oz + cz], u = [ax + cx, az + cz], d = [ax - cx, az - cz], q = [ox - cx, oz - cz];
        for (const [a, r, t] of [[f, u, d], [f, d, q]]) {
          const ccw = (r[0] - a[0]) * (t[1] - a[1]) - (r[1] - a[1]) * (t[0] - a[0]) < 0;
          for (const [x, z] of ccw ? [a, r, t] : [a, t, r]) { pos.push(x, y, z); uv.push(x / mpt, -z / mpt); }
        }
      }
    };
    const malla = (pos, uv, mat, nombre) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, mat);
      m.name = nombre;
      m.receiveShadow = true;
      camino.parent.add(m);
    };
    const pos = [], uv = [], rpos = [], ruv = [];
    for (const r of calles) {
      if (!r.dirt) continue;
      const p = remuestrea(r.p);
      banda(p, r.w, 0.12, pos, uv);
      for (const lado of [-0.85, 0.85]) {
        const q = p.map(([x, z], v) => {
          const [ax, az] = p[Math.max(0, v - 1)], [bx, bz] = p[Math.min(p.length - 1, v + 1)], l = Math.hypot(bx - ax, bz - az) || 1;
          return [x - (bz - az) / l * lado, z + (bx - ax) / l * lado];
        });
        banda(q, 0.45, 0.125, rpos, ruv);
      }
      caminos++;
    }
    if (pos.length) { malla(pos, uv, mt, 'caminoTierraNorte'); malla(rpos, ruv, rod, 'roderasNorte'); }
  }

  // el suelo del campo, más fino donde hay calles o casas nuevas
  let fino = null;
  const campo = g.scene.getObjectByName('tierraCampo');
  const X0 = -2700, X1 = 0, Z0 = -3700, Z1 = -2385, S = 15; // la caja del campo del juego
  const nx = Math.ceil((X1 - X0) / S), nz = Math.ceil((Z1 - Z0) / S);
  const geo = campo?.geometry;
  if (geo?.index && geo.attributes.position.count === (nx + 1) * (nz + 1)) {
    let bx0 = Infinity, bz0 = Infinity, bx1 = -Infinity, bz1 = -Infinity;
    for (const q of [...calles.flatMap(r => r.p), ...casas.flatMap(b => b.p)]) {
      if (q[0] < X0 || q[0] > X1 || q[1] < Z0 || q[1] > Z1) continue;
      bx0 = Math.min(bx0, q[0]); bz0 = Math.min(bz0, q[1]); bx1 = Math.max(bx1, q[0]); bz1 = Math.max(bz1, q[1]);
    }
    if (bx0 < bx1) {
      const p0 = Math.max(0, Math.floor((bx0 - 20 - X0) / S)), p1 = Math.min(nx, Math.ceil((bx1 + 20 - X0) / S));
      const d0 = Math.max(0, Math.floor((bz0 - 20 - Z0) / S)), d1 = Math.min(nz, Math.ceil((bz1 + 20 - Z0) / S));
      // fuera de la malla gruesa las celdas de esa caja (6 índices por celda, por filas)
      const idx = geo.index.array, keep = [];
      for (let c = 0; c < idx.length / 6; c++) {
        const d = Math.floor(c / nx), p = c % nx;
        if (d >= d0 && d < d1 && p >= p0 && p < p1) continue;
        for (let k = 0; k < 6; k++) keep.push(idx[c * 6 + k]);
      }
      geo.setIndex(keep);
      // la fina copia el color de la gruesa (bilineal) y se hunde bajo las calles nuevas
      const col = geo.attributes.color, uv0 = geo.attributes.uv, o = X0 / uv0.getX(0);
      const fila = (v, v0, v1, n) => { const i = Math.min(n - 1, Math.max(0, Math.floor((v - v0) / S))), a = v0 + i * S, b = Math.min(v1, a + S); return [i, (v - a) / (b - a)]; };
      const colorEn = (x, z) => {
        const [p, fx] = fila(x, X0, X1, nx), [d, fz] = fila(z, Z0, Z1, nz), w = nx + 1;
        const v = [d * w + p, d * w + p + 1, (d + 1) * w + p, (d + 1) * w + p + 1], k = [(1 - fx) * (1 - fz), fx * (1 - fz), (1 - fx) * fz, fx * fz];
        return [0, 1, 2].map(c => v.reduce((s, vi, i) => s + col.getComponent(vi, c) * k[i], 0));
      };
      const xa = X0 + p0 * S, xb = Math.min(X1, X0 + p1 * S), za = Z0 + d0 * S, zb = Math.min(Z1, Z0 + d1 * S), F = 3;
      const cx = Math.ceil((xb - xa) / F), cz = Math.ceil((zb - za) / F);
      const pos = [], uv = [], cs = [], ix = [];
      for (let j = 0; j <= cz; j++) for (let i = 0; i <= cx; i++) {
        const x = Math.min(xb, xa + i * F), z = Math.min(zb, za + j * F);
        pos.push(x, enCalle(x, z, 2.5) ? -0.15 : 0.06, z);
        uv.push(x / o, -z / o);
        cs.push(...colorEn(x, z));
      }
      for (let j = 0; j < cz; j++) for (let i = 0; i < cx; i++) {
        const m = j * (cx + 1) + i, n = m + cx + 1;
        ix.push(m, n, n + 1, m, n + 1, m + 1);
      }
      const gf = new THREE.BufferGeometry();
      gf.setIndex(ix);
      gf.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      gf.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      gf.setAttribute('color', new THREE.Float32BufferAttribute(cs, 3));
      gf.computeVertexNormals();
      fino = new THREE.Mesh(gf, campo.material);
      fino.name = 'tierraCampoFina';
      fino.receiveShadow = true;
      campo.parent.add(fino);
    }
  }

  // matas y piedras del campo encima de lo nuevo
  let quitadas = 0;
  const m4 = new THREE.Matrix4(), v = new THREE.Vector3(), cero = new THREE.Matrix4().makeScale(0, 0, 0);
  for (const nombre of ['matojosCampo', 'piedrasCampo']) {
    const im = g.scene.getObjectByName(nombre);
    if (!im?.isInstancedMesh) continue;
    for (let i = 0; i < im.count; i++) {
      im.getMatrixAt(i, m4);
      v.setFromMatrixPosition(m4);
      if (enCalle(v.x, v.z, 1.5) || enCasa(v.x, v.z)) { im.setMatrixAt(i, cero); quitadas++; }
    }
    im.instanceMatrix.needsUpdate = true;
  }
  return { calles: calles.length, casas: casas.length, caminos, fino: !!fino, quitadas, enCalle };
}

function dentroDe(p, x, z) {
  let c = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, zi] = p[i], [xj, zj] = p[j];
    if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c;
  }
  return c;
}

/* ---------------- Choques con el tráfico ---------------- */

/**
 * El tráfico va sobre raíles: al chocar, el juego solo hacía rebotar al jugador y el otro
 * coche se quedaba clavado. Aquí, el coche golpeado sale del tráfico y pasa a ser un coche
 * suelto (la lista de coches que deja el jugador, g.parkedCars), que el juego ya sabe empujar,
 * hacer patinar y chocar contra fachadas: sale despedido con el golpe, gira y se arrastra.
 * Si un coche despedido da contra otro del tráfico, ese también sale volando, y los que
 * vienen detrás frenan ante el accidente. Los siniestros se recogen al alejarse.
 */
function setupChoques(g) {
  const tr = g.traffic, loose = g.parkedCars;
  if (!tr?.update || !Array.isArray(loose) || !g.makeCar) return null;
  const wrecks = [];
  const R = 2.7;          // distancia entre centros a la que se tocan dos coches
  const MIN_HIT = 4;      // m/s de velocidad de cierre para que sea un choque y no un roce

  /** el coche del tráfico deja los raíles y se convierte en coche suelto con un empujón */
  function wreck(car, vx, vz, spin) {
    let made;
    try { made = g.makeCar(car.type, car.color, { brand: car.brand }); } catch { return null; }
    const w = {
      mesh: made.group, body: made.body, wheels: made.wheels, dims: made.dims,
      type: car.type, color: car.color, brand: car.brand,
      x: car.x, z: car.z, heading: car.heading,
      kick: { vx, vz, w: spin }, siniestro: true, t: 0,
    };
    made.group.position.set(car.x, 0.16, car.z);
    made.group.rotation.y = car.heading;
    made.group.userData.setLights?.(0);
    g.scene.add(made.group);
    loose.push(w);
    wrecks.push(w);
    // el del tráfico desaparece y el juego lo vuelve a sacar lejos
    car.road = null;
    car.mesh.visible = false;
    return w;
  }

  const speedOf = car => [Math.sin(car.heading) * car.v, Math.cos(car.heading) * car.v];

  function check(dt, player) {
    const driving = g.getMode?.() === 'car';
    const p = driving ? g.player : null;
    // el golpe suena con el mismo ruido que los choques del juego, más flojo cuanto más lejos
    const oido = (driving ? g.player : g.onFoot)?.pos;
    const bang = (x, z, f) => {
      const d = oido ? Math.hypot(x - oido.x, z - oido.y) : 0;
      if (d < 60) g.props?.onHit?.(Math.min(1, f) * (1 - d / 60), 'car');
    };
    for (const car of tr.cars) {
      if (!car.road) continue;
      const [cvx, cvz] = speedOf(car);
      // contra el coche del jugador
      if (p && !(p.air > 1.5)) {
        const dx = car.x - p.pos.x, dz = car.z - p.pos.y, d = Math.hypot(dx, dz);
        if (d < R + 0.6) {
          const nx = dx / (d || 1), nz = dz / (d || 1);
          const close = (p.vel.x - cvx) * nx + (p.vel.y - cvz) * nz; // velocidad con la que se acercan
          if (close > MIN_HIT) {
            // golpe de lado o de esquina: el otro coche gira
            const side = Math.sin(car.heading) * nz - Math.cos(car.heading) * nx;
            wreck(car, cvx * 0.4 + nx * close * 0.75, cvz * 0.4 + nz * close * 0.75, side * close * 0.18 + (Math.random() - 0.5) * 0.6);
            // y el jugador se lleva su parte: frena y rebota
            p.vel.x -= nx * close * 0.55;
            p.vel.y -= nz * close * 0.55;
            p.crashPulse = 1;
            bang(car.x, car.z, close / 14);
            continue;
          }
        }
      }
      // contra un coche despedido que todavía va lanzado
      for (const w of wrecks) {
        if (!w.kick) continue;
        const dx = car.x - w.x, dz = car.z - w.z, d = Math.hypot(dx, dz);
        if (d > R) continue;
        const nx = dx / (d || 1), nz = dz / (d || 1);
        const close = (w.kick.vx - cvx) * nx + (w.kick.vz - cvz) * nz;
        if (close < MIN_HIT * 0.6) continue;
        const side = Math.sin(car.heading) * nz - Math.cos(car.heading) * nx;
        wreck(car, cvx * 0.4 + nx * close * 0.6, cvz * 0.4 + nz * close * 0.6, side * close * 0.2);
        bang(car.x, car.z, close / 16);
        w.kick.vx -= nx * close * 0.5;
        w.kick.vz -= nz * close * 0.5;
        break;
      }
    }
    // el juego frena a los coches empujados enseguida (rozamiento 3,2/s): a los siniestros les
    // devolvemos parte para que se arrastren unos metros (queda en 1,3/s)
    const keep = (1 - 1.3 * dt) / Math.max(0.05, 1 - 3.2 * dt);
    for (const w of wrecks) if (w.kick) { w.kick.vx *= keep; w.kick.vz *= keep; w.kick.w *= keep; }
    // siniestros contra siniestros: se reparten el golpe
    for (let i = 0; i < wrecks.length; i++) for (let j = i + 1; j < wrecks.length; j++) {
      const a = wrecks[i], b = wrecks[j];
      if (!a.kick && !b.kick) continue;
      const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz);
      if (d > R || d < 1e-3) continue;
      const nx = dx / d, nz = dz / d;
      const avx = a.kick?.vx || 0, avz = a.kick?.vz || 0, bvx = b.kick?.vx || 0, bvz = b.kick?.vz || 0;
      const close = (avx - bvx) * nx + (avz - bvz) * nz;
      const push = (R - d) / 2;
      a.x -= nx * push; a.z -= nz * push; b.x += nx * push; b.z += nz * push;
      if (close <= 0) continue;
      a.kick ||= { vx: 0, vz: 0, w: 0 }; b.kick ||= { vx: 0, vz: 0, w: 0 };
      a.kick.vx -= nx * close * 0.5; a.kick.vz -= nz * close * 0.5;
      b.kick.vx += nx * close * 0.5; b.kick.vz += nz * close * 0.5;
    }
    // recoger los siniestros parados que quedan lejos (o muy viejos)
    const me = (driving ? g.player : g.onFoot) || g.player;
    const px = me.pos.x, pz = me.pos.y;
    for (let i = wrecks.length - 1; i >= 0; i--) {
      const w = wrecks[i];
      w.t += dt;
      const far = Math.hypot(w.x - px, w.z - pz);
      const gone = loose.indexOf(w) < 0; // el jugador se lo ha llevado
      if (gone || (!w.kick && ((w.t > 45 && far > 90) || far > 400))) {
        if (!gone) { loose.splice(loose.indexOf(w), 1); g.scene.remove(w.mesh); }
        wrecks.splice(i, 1);
      }
    }
  }

  const update0 = tr.update;
  tr.update = function (dt, player) {
    try { check(dt, player); } catch (e) { console.warn('Choques:', e); }
    return update0.call(this, dt, player);
  };
  // los que vienen detrás frenan ante el accidente en vez de atravesarlo
  const target0 = tr.targetSpeed;
  tr.targetSpeed = function (car, player) {
    let target = target0.call(this, car, player);
    if (!wrecks.length) return target;
    const hx = Math.sin(car.heading), hz = Math.cos(car.heading);
    for (const w of wrecks) {
      const rx = w.x - car.x, rz = w.z - car.z;
      if (Math.abs(rx) > 16 || Math.abs(rz) > 16) continue;
      const along = rx * hx + rz * hz;
      if (along <= 0 || along > 15) continue;
      if (Math.abs(rx * hz - rz * hx) < 2.4) target = Math.min(target, Math.max(0, (along - 5.5) * 1.4));
    }
    return target;
  };
  return { wrecks };
}

/**
 * El juego levanta el relieve en el shader de sus materiales; los nuestros tienen
 * que llevar el mismo parche o se quedan enterrados o flotando en las cuestas.
 */
function patchTerrain(g, roots) {
  // el juego pone el parche en el prototipo de su MeshStandardMaterial (que no es el nuestro):
  // se toma de un material estándar suyo sin parche propio (los que lo tienen añaden más cosas)
  let ref = null;
  g.scene.traverse(o => {
    if (!ref && o.isMesh && !Array.isArray(o.material) && o.material?.isMeshStandardMaterial
      && !Object.prototype.hasOwnProperty.call(o.material, 'onBeforeCompile')) ref = o.material;
  });
  ref ||= g.scene.getObjectByName('hiperdinoAcera')?.material;
  if (!ref) return 0;
  let n = 0;
  for (const root of roots) {
    root?.traverse(o => {
      if (!o.isMesh) return;
      for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
        if (m.__terreno) continue;
        m.onBeforeCompile = ref.onBeforeCompile;
        if (ref.customProgramCacheKey) m.customProgramCacheKey = ref.customProgramCacheKey;
        m.__terreno = true;
        m.needsUpdate = true;
        n++;
      }
    });
  }
  return n;
}

/* ---------------- Montaje ---------------- */

/** 0 de día, 1 de noche, según el reloj del HUD */
function nightFromClock() {
  const t = document.getElementById('clock')?.textContent || '12:00';
  const [h, m] = t.split(':').map(Number);
  const hh = h + (m || 0) / 60;
  if (hh >= 21 || hh < 6) return 1;
  if (hh >= 19) return (hh - 19) / 2;
  if (hh < 7.5) return (7.5 - hh) / 1.5;
  return 0;
}

function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove('on'), 1800);
}

function mount(g) {
  const marina = buildMarina(g.scene, g.map);
  const crucero = buildCrucero(g.scene, g.map);
  const hiperdino = buildHiperDino(g);
  // cada edificio por separado: si uno falla, los demás siguen
  const intenta = (nombre, f) => { try { return f(); } catch (e) { console.warn('Añadido ' + nombre + ':', e); return null; } };
  const repsol = intenta('Repsol', () => buildRepsol(g));
  const argana = [
    repsol,
    intenta('McDonald\'s', () => buildMcDonalds(g)),
    intenta('Burger King', () => buildBurgerKing(g)),
    intenta('Decathlon', () => buildDecathlon(g)),
    ...(intenta('Tenderete', () => buildTenderete(g)) || []),
  ].filter(Boolean);
  const titerroy = intenta('Titerroy', () => buildTiterroy(g));
  const paso = intenta('paso inferior', () => buildPasoTenderete(g));
  const cabildo = intenta('Cabildo', () => buildCabildo(g));
  const playaHonda = intenta('naves de Playa Honda', () => buildNavesPlayaHonda(g)) || [];
  const mamerto = intenta('Mamerto Cabrera', () => buildPinturaMamerto(g));
  const glowArgana = [...argana, ...playaHonda].flatMap(a => a.glow || []);
  intenta('relieve', () => patchTerrain(g, [hiperdino?.group, titerroy?.group, paso?.group, cabildo?.group, mamerto?.group,
    ...argana.map(a => a.group), ...playaHonda.map(a => a.group)]));
  const choques = intenta('choques', () => setupChoques(g));
  const norte = intenta('norte de Arrecife', () => norteArrecife(g));
  g.extras = { marina, crucero, hiperdino, argana, titerroy, paso, cabildo, playaHonda, mamerto, choques, norte, barrioAt };
  const hints = [
    marina && { x: marina.cx, z: marina.cz, name: 'Marina Lanzarote', r: 110 },
    hiperdino && { x: hiperdino.x, z: hiperdino.z, name: 'HiperDino · MediaMarkt Argana', r: 70 },
    repsol && { x: repsol.x, z: repsol.z, name: 'Repsol · calle Tenderete', r: 35 },
    titerroy && { x: titerroy.x, z: titerroy.z, name: 'Barrio de Titerroy', r: 40 },
    cabildo && { x: cabildo.x, z: cabildo.z, name: 'Cabildo de Lanzarote', r: 60 },
    paso && { x: paso.x, z: paso.z, name: 'Paso inferior de la Circunvalación', r: 30 },
    crucero && { x: crucero.cx - 40, z: crucero.cz, name: 'Muelle de Los Mármoles · crucero atracado', r: 160 },
  ].filter(Boolean);
  let lastHint = '', lastHintT = 0, seen = false;

  setInterval(() => {
    const a = g.getMode?.() === 'car' ? g.player : g.onFoot;
    const p = a?.pos;
    if (!p) return;
    // el juego pinta «Arrecife · <barrio>» con esto
    const b = barrioAt(p.x, p.y);
    if (b !== window.__barrio) {
      if (b && seen) toast(b);
      window.__barrio = b;
    }
    seen = true;
    const now = performance.now() / 1000;
    for (const h of hints) {
      if (Math.hypot(h.x - p.x, h.z - p.y) < h.r && (h.name !== lastHint || now - lastHintT > 40)) {
        lastHint = h.name;
        lastHintT = now;
        toast(h.name);
        break;
      }
    }
    const night = nightFromClock();
    if (marina) marina.lampMat.emissiveIntensity = night * 2.2;
    if (crucero) for (const m of crucero.deckMats) m.emissiveIntensity = night * 1.6;
    if (hiperdino) {
      for (const m of hiperdino.glass) m.emissiveIntensity = night * 0.9;
      for (const m of hiperdino.signs) m.emissiveIntensity = night * 1.4;
    }
    for (const m of glowArgana) m.emissiveIntensity = night * 0.45;
    // bajo el puente hay luz también de día
    if (paso) for (const m of paso.lamps) m.emissiveIntensity = 0.5 + night;
  }, 400);
}

const wait = setInterval(() => {
  const g = window.__game;
  if (!g?.scene || !g.map) return;
  clearInterval(wait);
  try { mount(g); } catch (e) { console.warn('Añadidos de Arrecife:', e); }
}, 500);
