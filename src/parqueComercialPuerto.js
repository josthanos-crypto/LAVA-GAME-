import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { cinta, malla } from './puenteRayas.js';
import { buildAparcamientos } from './aparcamientosTenderete.js';
import { buildRotulosEmpresas } from './parqueComercialEmpresas.js';

/**
 * El parque comercial de la salida de Arrecife hacia Costa Teguise (Parque Industrial Arrecife Puerto: las calles
 * Océano Atlántico, Pacífico e Índico y la Carretera de los Mármoles). Version 141, pedido por José Manuel: «hazme el
 * parque comercial donde está IKEA… Electron, canchas de pádel… y un montón de empresas que hay ahí».
 *
 * Lo que se sabe y se hace aquí:
 *  - IKEA: la nave de la esquina de la calle Océano Índico con la Carretera de los Mármoles (su dirección oficial es
 *    «Parque Industrial Arrecife Puerto, Carretera de los Mármoles s/n»; es la nave con placas solares de la foto
 *    aérea). Era un bloque genérico: ahora es la caja azul con las letras amarillas, la entrada y sus aparcamientos.
 *  - Electron: la nave donde el mapa pone su rótulo, con el nombre en grande en las dos caras que dan a la calle.
 *  - Las canchas de pádel que enseña la foto aérea detrás de Electron: seis pistas con su cristal, su malla y su red.
 *  - Los aparcamientos de delante de las naves (aparcamientosTenderete.js: no pinta sobre calle, acera ni edificio).
 * (Version 142) Las demás empresas: sus nombres salen del mapa de Google Maps y cada una lleva un cartel sencillo en
 * su nave (parqueComercialEmpresas.js). Son datos de internet: José Manuel tiene que repasar la lista.
 *
 * Coordenadas del juego: x = (lon + 13,55) · 97398, z = (28,9625 − lat) · 111320.
 */

const IKEA_EN = [1441, -1359];             // un punto de dentro de la nave de IKEA
const ELECTRON_EN = [1032, -1123];
const ALTO_IKEA = 10;
const AZUL_IKEA = 0x0058a3, AMARILLO_IKEA = '#ffda1a';

const centroDe = (p) => { let x = 0, z = 0; const n = p.length - 1; for (let i = 0; i < n; i++) { x += p[i][0]; z += p[i][1]; } return [x / n, z / n]; };
const cercaDe = (b, pt, r) => { if (!b.p || b.p.length < 4) return false; const [x, z] = centroDe(b.p); return Math.hypot(x - pt[0], z - pt[1]) < r; };

/** retoques al mapa antes de levantar la ciudad */
export function tuneParqueComercialPuerto(map) {
  for (const b of map.buildings || []) {
    if (cercaDe(b, IKEA_EN, 8)) {
      // el bloque del mapa se deja bajo y liso (da el choque); la caja azul la pone build por fuera, porque el juego
      // pinta ventanas de pisos en todo edificio de más de 4,5 m
      b.h = 4.4; b.k = 'industrial'; b.s = false; b.f = [0, 88, 163]; b.c = [190, 196, 201]; b.ikea = true;
    } else if (cercaDe(b, ELECTRON_EN, 8)) b.electron = true;
  }
  // el rótulo genérico de Electron se quita: va pintado en grande en la nave
  if (Array.isArray(map.signs)) map.signs = map.signs.filter(s => !(s.name === 'Electron' && Math.hypot(s.x - 1061, s.z + 1123) < 20));
}

function lienzo(w, h, pinta) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  pinta(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** la planta sin el punto repetido, el sentido hacia fuera y sus lados (a, d = dirección, n = normal hacia fuera, len) */
function lados(b) {
  const pts = b.p.slice(0, -1);
  let area = 0;
  for (let i = 0; i < pts.length; i++) { const a = pts[i], c = pts[(i + 1) % pts.length]; area += a[0] * c[1] - c[0] * a[1]; }
  const fuera = area >= 0 ? 1 : -1;
  return pts.map((a, i) => {
    const c = pts[(i + 1) % pts.length], len = Math.hypot(c[0] - a[0], c[1] - a[1]) || 1;
    const d = [(c[0] - a[0]) / len, (c[1] - a[1]) / len];
    return { a, b: c, len, d, n: [fuera * d[1], -fuera * d[0]], m: [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2] };
  });
}

export function buildParqueComercialPuerto(scene, colliders, map) {
  const grupo = new THREE.Group();
  grupo.name = 'parqueComercialPuerto';
  const piezas = [];
  /** caja de color: w a lo largo de dir, d de través; (x, z) el centro e y la base */
  const caja = (x, y, z, w, h, d, color, dir) => {
    const g = new THREE.BoxGeometry(w, h, d).toNonIndexed();
    g.rotateY(Math.atan2(-dir[1], dir[0]));
    g.translate(x, y + h / 2, z);
    const c = new THREE.Color(color), n = g.getAttribute('position').count, col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    piezas.push(g);
  };
  const cartel = (x, y, z, w, h, n, tex, brilla = 0) => {
    const g = new THREE.PlaneGeometry(w, h);
    g.rotateY(Math.atan2(n[0], n[1]));
    g.translate(x, y, z);
    grupo.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: brilla })));
  };

  // ───────────── IKEA: la caja azul, las letras amarillas y la entrada ─────────────
  const ikea = (map.buildings || []).find(b => b.ikea);
  if (ikea) {
    const L = lados(ikea).filter(l => l.len > 0.5);
    for (const l of L) {
      // la pared, en paños de 12 m como mucho para que siga el suelo
      const n = Math.max(1, Math.ceil(l.len / 12)), tr = l.len / n;
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) * tr, x = l.a[0] + l.d[0] * t + l.n[0] * 0.12, z = l.a[1] + l.d[1] * t + l.n[1] * 0.12;
        caja(x, 0, z, tr + 0.2, ALTO_IKEA, 0.2, AZUL_IKEA, l.d);
        caja(x + l.n[0] * 0.03, 0, z + l.n[1] * 0.03, tr + 0.24, 0.5, 0.24, 0x40464c, l.d);
      }
    }
    // la cubierta
    {
      const forma = new THREE.Shape(ikea.p.slice(0, -1).map(([x, z]) => new THREE.Vector2(x, z)));
      const g = new THREE.ShapeGeometry(forma);
      g.rotateX(Math.PI / 2);
      g.translate(0, ALTO_IKEA - 0.1, 0);
      const techo = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0xc4cad0, roughness: 0.9, side: THREE.DoubleSide }));
      techo.receiveShadow = true;
      grupo.add(techo);
    }
    const letras = lienzo(512, 192, (c, w, h) => {
      c.fillStyle = '#0058a3'; c.fillRect(0, 0, w, h);
      c.fillStyle = AMARILLO_IKEA; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.font = '900 168px Arial Black, Arial, Helvetica, sans-serif';
      c.fillText('IKEA', w / 2, h / 2 + 8);
    });
    // las letras, en las dos caras más largas (la de la Carretera de los Mármoles y la de la calle Océano Índico)
    const largas = L.slice().sort((p, q) => q.len - p.len).slice(0, 3);
    for (const l of largas) cartel(l.m[0] + l.n[0] * 0.3, ALTO_IKEA - 2.6, l.m[1] + l.n[1] * 0.3, 16, 6, l.n, letras, 0.3);
    // la entrada, en la segunda cara más larga: cristalera, marquesina amarilla y los carros
    const e = largas[1] || largas[0];
    const E = (f, al) => [e.m[0] + e.n[0] * f + e.d[0] * al, e.m[1] + e.n[1] * f + e.d[1] * al];
    const cx = -e.len / 2 + 12;      // hacia una punta de la cara, para no tapar las letras
    caja(E(0.3, cx)[0], 0, E(0.3, cx)[1], 14, 3.6, 0.2, 0x1f2c36, e.d);
    for (let i = 0; i <= 7; i++) { const [x, z] = E(0.42, cx - 7 + i * 2); caja(x, 0, z, 0.1, 3.6, 0.1, 0xd9dcde, e.d); }
    caja(E(2.2, cx)[0], 3.7, E(2.2, cx)[1], 16, 0.35, 4.2, 0xffda1a, e.d);
    for (const al of [-7.6, 7.6]) { const [x, z] = E(4.0, cx + al); caja(x, 0, z, 0.2, 3.7, 0.2, 0xd9dcde, e.d); }
    for (let i = 0; i < 5; i++) { const [x, z] = E(1.2, cx + 10 + i * 0.5); caja(x, 0.25, z, 0.45, 0.75, 0.9, 0xb9bcbe, e.d); }
  }

  // ───────────── Electron: el nombre en grande en las dos caras que dan a la calle ─────────────
  const electron = (map.buildings || []).find(b => b.electron);
  if (electron) {
    const tex = lienzo(1024, 160, (c, w, h) => {
      c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#c8102e'; c.fillRect(0, h - 14, w, 14);
      c.fillStyle = '#14233f'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.font = 'bold 118px Arial, Helvetica, sans-serif';
      c.fillText('ELECTRON', w / 2, h / 2 - 4);
    });
    const alto = electron.h || 8;
    for (const l of lados(electron).sort((p, q) => q.len - p.len).slice(0, 2)) {
      cartel(l.m[0] + l.n[0] * 0.25, alto - 1.8, l.m[1] + l.n[1] * 0.25, 19.2, 3, l.n, tex, 0.2);
    }
  }

  // ───────────── las canchas de pádel (las de la foto aérea, detrás de Electron) ─────────────
  {
    const LARGO = [-0.19, 0.982], ANCHO = [0.982, 0.19];     // el largo de las pistas (20 m) y el ancho (10 m)
    const pistas = [];
    for (const k of [-11, 0, 11]) pistas.push({ c: [1048.4 + ANCHO[0] * k, -1222.6 + ANCHO[1] * k], color: 0x2e7d4f });   // las verdes
    for (const k of [-6, 6]) pistas.push({ c: [1048.4 + ANCHO[0] * k, -1246.3 + ANCHO[1] * k], color: 0xb5553c });         // las de color teja
    pistas.push({ c: [1032.6, -1195.3], color: 0x2a6fb5 });                                                                   // la azul
    const suelo = [], rayas = [], cristal = [], reja = [], rejaUv = [];
    const quad = (out, a, b, y0, y1) => out.push(a[0], y0, a[1], b[0], y0, b[1], b[0], y1, b[1], a[0], y0, a[1], b[0], y1, b[1], a[0], y1, a[1]);
    for (const p of pistas) {
      const Q = (l, a) => [p.c[0] + LARGO[0] * l + ANCHO[0] * a, p.c[1] + LARGO[1] * l + ANCHO[1] * a];
      // el suelo, en losas de 5 m
      const col = new THREE.Color(p.color);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) {
        const q = [Q(-10 + i * 5, -5 + j * 5), Q(-10 + i * 5, j * 5), Q(-5 + i * 5, -5 + j * 5), Q(-5 + i * 5, -5 + j * 5), Q(-10 + i * 5, j * 5), Q(-5 + i * 5, j * 5)];
        for (const [x, z] of q) suelo.push(x, 0.13, z, col.r, col.g, col.b);
      }
      // las rayas: el contorno, las de saque (a 6,95 m de la red) y la del centro
      const raya = (l0, a0, l1, a1) => { const n = Math.max(2, Math.ceil(Math.hypot(l1 - l0, a1 - a0) / 2.5)), pts = []; for (let i = 0; i <= n; i++) pts.push(Q(l0 + (l1 - l0) * i / n, a0 + (a1 - a0) * i / n)); cinta(rayas, pts, () => 0.145, 0.03, false); };
      raya(-10, -5, 10, -5); raya(10, -5, 10, 5); raya(10, 5, -10, 5); raya(-10, 5, -10, -5);
      raya(-6.95, -5, -6.95, 5); raya(6.95, -5, 6.95, 5); raya(-6.95, 0, 6.95, 0);
      // la red y sus postes
      const [nx, nz] = Q(0, 0);
      caja(nx, 0.13, nz, 10, 0.9, 0.04, 0x1d1f21, ANCHO);
      caja(nx, 1.0, nz, 10, 0.05, 0.05, 0xf2f2f2, ANCHO);
      // los fondos de cristal (3 m), los laterales de cristal (4 m) y de malla, y los postes
      for (const s of [-1, 1]) {
        quad(cristal, Q(s * 10, -5), Q(s * 10, 5), 0.13, 3.1);
        for (const a of [-5, 5]) {
          quad(cristal, Q(s * 10, a), Q(s * 6, a), 0.13, 3.1);
          quad(reja, Q(s * 6, a), Q(s * 0.8, a), 0.13, 3.1); rejaUv.push(0, 0, 2, 0, 2, 1, 0, 0, 2, 1, 0, 1);
        }
        quad(reja, Q(s * 10, -5), Q(s * 10, 5), 3.1, 4.1); rejaUv.push(0, 0, 4, 0, 4, 0.35, 0, 0, 4, 0.35, 0, 0.35);
      }
      for (const l of [-10, -6, 6, 10]) for (const a of [-5, 5]) { const [x, z] = Q(l, a); caja(x, 0.13, z, 0.1, l === 10 || l === -10 ? 4 : 3, 0.1, 0x3a4046, ANCHO); }
      // el choque: los cuatro lados de la pista
      colliders?.addSegment(...Q(-10, -5), ...Q(10, -5)); colliders?.addSegment(...Q(10, -5), ...Q(10, 5));
      colliders?.addSegment(...Q(10, 5), ...Q(-10, 5)); colliders?.addSegment(...Q(-10, 5), ...Q(-10, -5));
    }
    {
      const g = new THREE.BufferGeometry(), n = suelo.length / 6, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { pos.set(suelo.slice(i * 6, i * 6 + 3), i * 3); col.set(suelo.slice(i * 6 + 3, i * 6 + 6), i * 3); }
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      g.computeVertexNormals();
      const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }));
      m.name = 'padelSuelo'; m.receiveShadow = true;
      grupo.add(m);
    }
    const mr = malla(rayas, new THREE.MeshStandardMaterial({ color: 0xf4f4f0, roughness: 0.8, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }));
    if (mr) { mr.name = 'padelRayas'; grupo.add(mr); }
    {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(cristal, 3));
      g.computeVertexNormals();
      const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0xbfe3ee, transparent: true, opacity: 0.22, roughness: 0.1, side: THREE.DoubleSide, depthWrite: false }));
      m.name = 'padelCristal';
      grupo.add(m);
    }
    {
      const tex = lienzo(128, 128, (c, w, h) => {
        c.clearRect(0, 0, w, h);
        c.strokeStyle = '#3a4046'; c.lineWidth = 3;
        for (let x = 0; x <= w; x += 12.8) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
        for (let y = 0; y <= h; y += 12.8) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
      });
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(reja, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(rejaUv, 2));
      g.computeVertexNormals();
      const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.7 }));
      m.name = 'padelMalla';
      grupo.add(m);
    }
  }

  const cuerpo = new THREE.Mesh(mergeGeometries(piezas, false), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7 }));
  cuerpo.castShadow = cuerpo.receiveShadow = true;
  grupo.add(cuerpo);
  scene.add(grupo);

  // ───────────── los aparcamientos de delante de las naves ─────────────
  const aparca = buildAparcamientos(scene, map, {
    nombre: 'aparcamientosParquePuerto',
    zona: [820, 1560, -1470, -980],
    solares: [
      // la franja de delante de Electron y las naves de al lado, a lo largo de la calle Océano Atlántico
      { nombre: 'aparcamientoOceanoAtlantico', centro: [1134, -1104], eje: [0.933, -0.358], largo: 62, ancho: 9 },
      // los de IKEA: el de la esquina de arriba y la franja de la calle Océano Índico
      { nombre: 'aparcamientoIkeaEsquina', centro: [1351, -1352], eje: [0.73, -0.68], largo: 22, ancho: 17 },
      { nombre: 'aparcamientoIkeaIndico', centro: [1385, -1300], eje: [0.652, 0.758], largo: 28, ancho: 9 },
      // el del Lidl de al lado
      { nombre: 'aparcamientoLidlPuerto', centro: [1367, -1270], eje: [0.565, 0.825], largo: 20, ancho: 9 },
    ],
  });
  grupo.userData.plazas = aparca.userData.plazas;
  // los rótulos de las demás empresas del parque, cada uno en su nave (parqueComercialEmpresas.js)
  grupo.userData.rotulos = buildRotulosEmpresas(scene, map).userData.puestos;
  return grupo;
}
