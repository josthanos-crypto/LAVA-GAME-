import * as THREE from 'three';
import { charcoRing, ringDist } from './zones.js';

/**
 * La marea del Charco de San Ginés (lo pidió José Manuel con la foto de la marea baja: los barquillos
 * varados en el fango y los chavales con las piraguas). Va con el reloj del juego: llena a las 10 y a las
 * 22, vacía a las 4 y a las 16 (cada 12 horas, para que no salte a medianoche; en la realidad son 12 h y
 * 25 min). Un día del juego son 20 minutos, así que de llena a vacía pasan unos 5 minutos de partida.
 * Solo el Charco: el mar de fuera (el puerto, el Reducto) se queda como está.
 *
 * Con la marea vacía el agua baja RANGO metros y se ve el fondo: fango que baja desde el pie del muro
 * hacia el centro (donde queda una charca grande), piedras sueltas y la parte de abajo del muro, húmeda y
 * con verdín. Los barquillos de la orilla se quedan en el fango, escorados (charco.js), y las piraguas
 * solo reman donde queda agua (piraguas.js).
 * Para probar: &marea=llena, &marea=media o &marea=baja en la dirección.
 */

const PLEAMAR = 10;          // hora de la marea llena (y 12 horas después)
const RANGO = 1.45;          // lo que baja el agua (m)
const AGUA_Y = 0.15;         // el agua del Charco con la marea llena (la de los barquillos, charco.js)
const FONDO_MURO = -0.95;    // el fango al pie del muro
const FONDO_CENTRO = -1.75;  // en el centro: con la marea vacía queda una charca donde reman las piraguas
const HONDO_D = 22;          // a esta distancia del muro ya es el fondo del centro
const MURO_ABAJO = -1.25;    // la parte de abajo del muro, hasta aquí (queda enterrada en el fango)

const estado = { reloj: null, fijo: null, f: 0, grid: null };
{
  const q = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('marea') : null;
  if (q === 'llena' || q === 'alta') estado.fijo = 0;
  else if (q === 'media') estado.fijo = 0.5;
  else if (q === 'baja' || q === 'vacia' || q === 'vacía') estado.fijo = 1;
}

/** el reloj del juego en horas (0–24): lo da locales.hooks.hour, en la segunda fase */
export function ponerReloj(fn) {
  estado.reloj = typeof fn === 'function' ? fn : null;
}

function calcula() {
  if (estado.fijo != null) return estado.fijo;
  const h = estado.reloj?.();
  if (!Number.isFinite(h)) return 0;
  return (1 - Math.cos(2 * Math.PI * (h - PLEAMAR) / 12)) / 2;
}

/** 0 = marea llena, 1 = marea vacía */
export function bajamar() {
  return estado.f;
}

/** cómo está la marea, en palabras (para lo que dice la gente del Charco) */
export function estadoMarea() {
  const f = estado.f;
  if (f < 0.15) return 'llena';
  if (f > 0.85) return 'vacía';
  const h = estado.reloj?.();
  if (estado.fijo != null || !Number.isFinite(h)) return 'a media';
  const fase = (((h - PLEAMAR) % 12) + 12) % 12;
  return fase < 6 ? 'bajando' : 'subiendo';
}

/** el nivel del agua del Charco ahora (el de los barquillos y las piraguas) */
export function nivelCharco() {
  return AGUA_Y - RANGO * estado.f;
}

/** la altura del fondo del Charco en (x, z) */
export function fondoCharco(x, z) {
  const G = estado.grid;
  if (!G) return -99;
  const fx = (x - G.x0) / G.cell, fz = (z - G.z0) / G.cell;
  const i = Math.floor(fx), j = Math.floor(fz);
  if (i < 0 || j < 0 || i >= G.nx - 1 || j >= G.nz - 1) return FONDO_MURO;
  const u = fx - i, v = fz - j, H = G.h, w = G.nx;
  return (H[j * w + i] * (1 - u) + H[j * w + i + 1] * u) * (1 - v) + (H[(j + 1) * w + i] * (1 - u) + H[(j + 1) * w + i + 1] * u) * v;
}

function inPoly(P, x, z) {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    if ((P[i][1] > z) !== (P[j][1] > z) && x < (P[j][0] - P[i][0]) * (z - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0]) c = !c;
  }
  return c;
}

const smooth = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** el fondo: más alto junto al muro y hondo en el centro, con lomos suaves (la charca queda con orillas irregulares) */
function perfil(x, z, d) {
  const ruido = 0.07 * Math.sin(x * 0.11 + 1.3) * Math.cos(z * 0.13 - 0.7) + 0.05 * Math.sin((x + z) * 0.071 + 0.4)
    + 0.03 * Math.cos(x * 0.31 - z * 0.27);
  return FONDO_MURO + (FONDO_CENTRO - FONDO_MURO) * smooth(0, HONDO_D, d) + ruido * Math.min(1, d / 4);
}

/** dibuja en el lienzo repitiendo por los bordes (para que la textura no tenga costuras) */
function envolver(size, x, y, r, fn) {
  for (const dx of [-size, 0, size]) {
    for (const dy of [-size, 0, size]) {
      if (x + dx + r < 0 || x + dx - r > size || y + dy + r < 0 || y + dy - r > size) continue;
      fn(x + dx, y + dy);
    }
  }
}

/** el fango: casi blanco, que el color lo ponen los vértices (seco junto al muro, oscuro y mojado hacia el centro) */
function texturaFango() {
  const S = 256, c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = '#d6d0c6';
  g.fillRect(0, 0, S, S);
  let s = 91;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const mancha = (n, rmin, rmax, color) => {
    for (let i = 0; i < n; i++) {
      const x = r() * S, y = r() * S, rad = rmin + r() * (rmax - rmin), col = color();
      envolver(S, x, y, rad, (px, py) => {
        const gr = g.createRadialGradient(px, py, 0, px, py, rad);
        gr.addColorStop(0, col);
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr;
        g.fillRect(px - rad, py - rad, rad * 2, rad * 2);
      });
    }
  };
  // manchas de humedad
  mancha(70, 8, 38, () => { const v = 140 + r() * 70; return `rgba(${v},${v - 6},${v - 14},0.5)`; });
  // verdín
  mancha(22, 4, 14, () => 'rgba(88,118,58,0.4)');
  // grano, piedrecillas y trozos de concha
  for (let i = 0; i < 2600; i++) {
    const v = 120 + r() * 120;
    g.fillStyle = `rgb(${v},${v - 5},${v - 12})`;
    g.fillRect(r() * S, r() * S, 1 + r() * 2, 1 + r() * 2);
  }
  for (let i = 0; i < 90; i++) {
    const v = 40 + r() * 50, x = r() * S, y = r() * S, a = 1.5 + r() * 3.5, b = 1 + r() * 2.5, rot = r() * 3;
    envolver(S, x, y, a, (px, py) => {
      g.fillStyle = `rgb(${v},${v - 2},${v - 4})`;
      g.beginPath();
      g.ellipse(px, py, a, b, rot, 0, Math.PI * 2);
      g.fill();
    });
  }
  g.fillStyle = 'rgba(246,242,232,0.85)';
  for (let i = 0; i < 40; i++) g.fillRect(r() * S, r() * S, 2, 1.5);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** la parte de abajo del muro: piedra volcánica en hiladas, seca arriba, mojada y con verdín abajo */
function texturaMuro() {
  const S = 256, c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = '#24211f';
  g.fillRect(0, 0, S, S);
  let s = 53;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const rows = 5, rh = S / rows;
  for (let k = 0; k < rows; k++) {
    let x = -r() * 60;
    while (x < S) {
      const w = 34 + r() * 52, v = 52 + r() * 30;
      g.fillStyle = `rgb(${v},${v - 3},${v - 6})`;
      const y = k * rh + 3, h = rh - 6;
      for (const dx of [0, S]) {
        g.beginPath();
        g.roundRect(x + 2 - dx, y, w - 4, h, 7);
        g.fill();
      }
      x += w;
    }
  }
  // poros de la piedra
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(15,13,12,${0.25 + r() * 0.35})`;
    g.fillRect(r() * S, r() * S, 1 + r() * 2, 1 + r() * 2);
  }
  // arriba, seca y más clara; en medio, mojada; abajo, el verdín (lo de más abajo queda en el fango)
  const gr = g.createLinearGradient(0, 0, 0, S);
  gr.addColorStop(0, 'rgba(200,195,185,0.10)');
  gr.addColorStop(0.3, 'rgba(0,0,0,0)');
  gr.addColorStop(0.45, 'rgba(10,12,10,0.30)');
  gr.addColorStop(0.58, 'rgba(52,84,36,0.55)');
  gr.addColorStop(0.78, 'rgba(46,74,30,0.75)');
  gr.addColorStop(1, 'rgba(20,24,16,0.8)');
  g.fillStyle = gr;
  g.fillRect(0, 0, S, S);
  // churretes de verdín y lapas
  for (let i = 0; i < 60; i++) {
    const x = r() * S, y = S * (0.45 + r() * 0.2), h = 10 + r() * 30;
    g.fillStyle = `rgba(60,96,40,${0.25 + r() * 0.3})`;
    g.fillRect(x, y, 2 + r() * 3, h);
  }
  for (let i = 0; i < 80; i++) {
    g.fillStyle = `rgba(210,205,190,${0.5 + r() * 0.4})`;
    g.beginPath();
    g.arc(r() * S, S * (0.5 + r() * 0.3), 1 + r() * 1.6, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.ClampToEdgeWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** el fondo en cuadrícula: alturas (para fondoCharco) y la malla del fango */
function fondo(ring, cell) {
  const xs = ring.map(q => q[0]), zs = ring.map(q => q[1]);
  const x0 = Math.min(...xs) - cell, z0 = Math.min(...zs) - cell;
  const nx = Math.ceil((Math.max(...xs) + cell - x0) / cell) + 1, nz = Math.ceil((Math.max(...zs) + cell - z0) / cell) + 1;
  const h = new Float32Array(nx * nz), d = new Float32Array(nx * nz), inside = new Uint8Array(nx * nz);
  for (let j = 0; j < nz; j++) {
    for (let i = 0; i < nx; i++) {
      const x = x0 + i * cell, z = z0 + j * cell, k = j * nx + i;
      inside[k] = inPoly(ring, x, z) ? 1 : 0;
      d[k] = inside[k] ? ringDist(ring, x, z) : 0;
      h[k] = perfil(x, z, d[k]);
    }
  }
  estado.grid = { x0, z0, nx, nz, cell, h };
  // la malla: las celdas de dentro y las que tocan la orilla (lo que sobresale queda bajo el paseo)
  const pos = new Float32Array(nx * nz * 3), uv = new Float32Array(nx * nz * 2), col = new Float32Array(nx * nz * 3);
  const seco = new THREE.Color(0xa09481), medio = new THREE.Color(0x766b5c), mojado = new THREE.Color(0x4d4840), tmp = new THREE.Color();
  for (let k = 0; k < nx * nz; k++) {
    const x = x0 + (k % nx) * cell, z = z0 + Math.floor(k / nx) * cell;
    pos.set([x, h[k], z], k * 3);
    uv.set([x / 5, z / 5], k * 2);
    const w = smooth(0, 6, d[k]), m = smooth(6, 20, d[k] + 3 * Math.sin(x * 0.09 + z * 0.05));
    tmp.copy(seco).lerp(medio, w).lerp(mojado, m);
    col.set([tmp.r, tmp.g, tmp.b], k * 3);
  }
  const idx = [];
  for (let j = 0; j < nz - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const cx = x0 + (i + 0.5) * cell, cz = z0 + (j + 0.5) * cell;
      if (!inPoly(ring, cx, cz) && ringDist(ring, cx, cz) > cell) continue;
      const a = j * nx + i, b = a + 1, c = a + nx, e = c + 1;
      idx.push(a, c, b, b, c, e);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

/** la parte de abajo del muro, por toda la orilla, con un remate que se mete bajo el muro de arriba */
function muroBajo(ring) {
  const pos = [], uv = [];
  let along = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [ax, az] = ring[i], [bx, bz] = ring[i + 1];
    const L = Math.hypot(bx - ax, bz - az);
    if (L < 0.05) continue;
    const ux = (bx - ax) / L, uz = (bz - az) / L;
    // la normal hacia el agua
    let nx = -uz, nz = ux;
    if (!inPoly(ring, (ax + bx) / 2 + nx, (az + bz) / 2 + nz)) { nx = -nx; nz = -nz; }
    const o = 0.03, A = [ax + nx * o, az + nz * o], B = [bx + nx * o, bz + nz * o];
    const u0 = along / 2.4, u1 = (along + L) / 2.4, top = 0.02;
    const quad = (P, Q, R, T, uvs) => {
      pos.push(...P, ...Q, ...R, ...P, ...R, ...T);
      uv.push(...uvs[0], ...uvs[1], ...uvs[2], ...uvs[0], ...uvs[2], ...uvs[3]);
    };
    quad([A[0], MURO_ABAJO, A[1]], [B[0], MURO_ABAJO, B[1]], [B[0], top, B[1]], [A[0], top, A[1]], [[u0, 0], [u1, 0], [u1, 1], [u0, 1]]);
    // el remate: hacia tierra, por debajo del muro que ya había
    const C = [bx - nx * 0.8, bz - nz * 0.8], D = [ax - nx * 0.8, az - nz * 0.8];
    quad([A[0], top, A[1]], [B[0], top, B[1]], [C[0], top, C[1]], [D[0], top, D[1]], [[u0, 0.99], [u1, 0.99], [u1, 0.99], [u0, 0.99]]);
    along += L;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.computeVertexNormals();
  return geo;
}

/** piedras sueltas por el fango, más junto al muro */
function piedras(ring, n) {
  const xs = ring.map(q => q[0]), zs = ring.map(q => q[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), z0 = Math.min(...zs), z1 = Math.max(...zs);
  const mat = new THREE.MeshStandardMaterial({ color: 0x2f2b28, roughness: 0.95, flatShading: true, userData: { terrain: 'level' } });
  const im = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), mat, n);
  let s = 313, k = 0;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3();
  for (let tries = 0; tries < n * 40 && k < n; tries++) {
    const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0);
    if (!inPoly(ring, x, z)) continue;
    const d = ringDist(ring, x, z);
    if (d < 0.6 || d > 14 || r() > 1.2 - d / 14) continue;
    const size = 0.15 + r() * 0.4;
    sc.set(size * (0.9 + r() * 0.5), size * (0.5 + r() * 0.3), size * (0.9 + r() * 0.6));
    e.set(r() * 0.6, r() * Math.PI * 2, r() * 0.6);
    p.set(x, fondoCharco(x, z) - size * 0.15, z);
    im.setMatrixAt(k++, m.compose(p, q.setFromEuler(e), sc));
  }
  im.count = k;
  im.castShadow = true;
  im.receiveShadow = true;
  im.frustumCulled = false;
  return im;
}

/**
 * el fondo, el muro de abajo y las piedras, y la marea en marcha: engancha su paso al update del Charco
 * (charco = lo que devuelve buildCharco; main.js ya lo llama en cada fotograma). Va antes que buildPiraguas.
 */
export function buildMarea(scene, map, charco, { touch = false } = {}) {
  const ring = charcoRing(map);
  if (!ring || !charco?.update) return null;
  estado.f = calcula();
  const group = new THREE.Group();
  group.name = 'mareaCharco';
  const fango = new THREE.Mesh(fondo(ring, touch ? 5 : 3), new THREE.MeshStandardMaterial({
    map: texturaFango(), vertexColors: true, roughness: 0.6, metalness: 0, userData: { terrain: 'level' },
  }));
  fango.receiveShadow = true;
  fango.frustumCulled = false;
  const muro = new THREE.Mesh(muroBajo(ring), new THREE.MeshStandardMaterial({
    map: texturaMuro(), roughness: 0.85, side: THREE.DoubleSide, userData: { terrain: 'level' },
  }));
  muro.receiveShadow = true;
  muro.frustumCulled = false;
  const rocas = piedras(ring, touch ? 40 : 110);
  group.add(fango, muro, rocas);
  scene.add(group);

  // el agua del Charco (la pone la costa: su malla es la del anillo) y las franjas de orilla que lo bordean
  const xs = ring.map(q => q[0]), zs = ring.map(q => q[1]);
  const bx0 = Math.min(...xs), bx1 = Math.max(...xs), bz0 = Math.min(...zs), bz1 = Math.max(...zs);
  const cx = (bx0 + bx1) / 2, cz = (bz0 + bz1) / 2;
  let agua = null, franjas = null;
  const busca = () => {
    franjas = [];
    const box = new THREE.Box3();
    scene.traverse((o) => {
      if (!o.isMesh || o.isInstancedMesh || o.material?.userData?.terrain !== 'level' || o.parent === group) return;
      if (!agua && o.material.isMeshPhysicalMaterial) {
        box.setFromObject(o);
        if (Math.abs(box.min.x - bx0) < 2 && Math.abs(box.max.x - bx1) < 2 && Math.abs(box.min.z - bz0) < 2 && Math.abs(box.max.z - bz1) < 2) agua = o;
        return;
      }
      // las franjas de espuma y de agua clara de toda la costa: se bajan solo sus vértices del Charco
      if (o.material.isMeshBasicMaterial && o.material.transparent) {
        const p = o.geometry.getAttribute('position'), ids = [], y0 = [];
        for (let i = 0; i < p.count; i++) {
          const x = p.getX(i), z = p.getZ(i);
          if (x < bx0 - 3 || x > bx1 + 3 || z < bz0 - 3 || z > bz1 + 3) continue;
          // la franja cruza la orilla: también su borde de tierra (si no, queda en rampa hasta el fango)
          if (!inPoly(ring, x, z) && ringDist(ring, x, z) > 6) continue;
          ids.push(i);
          y0.push(p.getY(i));
        }
        if (ids.length) franjas.push({ p, ids, y0 });
      }
    });
  };
  let puesto = 0;
  const paso = (px, pz) => {
    estado.f = calcula();
    if (franjas == null) busca();
    const off = -RANGO * estado.f;
    if (Math.abs(off - puesto) > 0.003) {
      if (agua) agua.position.y = off;
      for (const { p, ids, y0 } of franjas) {
        ids.forEach((i, n) => p.setY(i, y0[n] + off));
        p.needsUpdate = true;
      }
      puesto = off;
    }
    const near = Math.hypot(px - cx, pz - cz) < 700;
    group.visible = near && estado.f > 0.02;
    // el fango no asoma hasta que el agua baja de su altura: mientras, ni se dibuja
    fango.visible = rocas.visible = estado.f > 0.45;
  };
  const up = charco.update;
  charco.update = function (t, px, pz) {
    paso(px, pz);
    return up.call(this, t, px, pz);
  };
  return { group, ring };
}
