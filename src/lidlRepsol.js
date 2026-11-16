import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * El Lidl de la Carretera de San Bartolomé y la gasolinera Repsol de al lado, con su lavadero de coches
 * (Version 134, pedido por José Manuel: «arregla también el Lidl y la gasolinera… la gasolinera tiene un lavadero
 * de coches»).
 *
 * Lo que había:
 *  - El cuadrado blanco que se ve en la foto aérea junto a la carretera es la MARQUESINA de la gasolinera, pero en
 *    el mapa (OpenStreetMap) venía como un edificio y el juego levantaba ahí un bloque de tiendas. La gasolinera de
 *    verdad salía aparte, pequeña y genérica, donde cabía.
 *  - El Lidl era una nave genérica de 3,4 m con escaparates de tiendecitas por los cuatro lados.
 *
 * Ahora:
 *  - La marquesina grande en su sitio y con su tamaño (22 × 26 m), sobre pilares, con seis isletas de surtidores y
 *    el poste con el nombre.
 *  - El lavadero: tres boxes de lavado techados, entre la marquesina y el Lidl, donde la foto aérea enseña una
 *    construcción pequeña. El sitio exacto y cómo es de verdad que lo confirme José Manuel: se ha hecho sencillo.
 *  - El Lidl: nave blanca lisa de 7,5 m (por fuera del bloque del mapa, que se deja bajo para el choque) con la
 *    entrada acristalada, su marquesina y el rótulo en la fachada que da a la gasolinera (donde OpenStreetMap pone
 *    el punto de la tienda).
 *
 * Coordenadas del juego: x = (lon + 13,55) · 97398, z = (28,9625 − lat) · 111320.
 */

// la marquesina (planta de OpenStreetMap): centro y sus dos ejes
const MC = [-1413.25, -1026];
const E2 = [-0.764, -0.645];    // a lo largo de la carretera (25,9 m)
const E1 = [-0.647, 0.762];     // de través (21,8 m)
const LARGO = 25.9, ANCHO = 21.8, ALTO_M = 5.4;

// la fachada del Lidl que da a la gasolinera
const W1 = [-1361.2, -1025.2], W2 = [-1397.9, -1056];
const NODO = [-1390, -1049];    // el punto de la tienda en OpenStreetMap
const ALTO_LIDL = 7.5;

// el lavadero
const LAV = [-1387.5, -1026.7];

const centroDe = (p) => { let x = 0, z = 0; for (const q of p) { x += q[0]; z += q[1]; } return [x / p.length, z / p.length]; };

/** retoques al mapa antes de levantar la ciudad */
export function tuneLidlRepsol(map) {
  for (const b of map.buildings || []) {
    if (!b.p || b.p.length < 3) continue;
    const [cx, cz] = centroDe(b.p.slice(0, -1));
    // la marquesina no es un edificio: fuera el bloque de tiendas
    if (Math.hypot(cx - MC[0], cz - MC[1]) < 4) b.skip = true;
    // el Lidl: nave blanca alta y lisa
    if (Math.hypot(cx + 1363.5, cz + 1071) < 14 && b.p.length > 8) {
      // el bloque del mapa se deja bajo y liso (da el choque); la nave blanca de 7,5 m la pone buildLidlRepsol
      // por fuera, porque el juego pinta ventanas de pisos en todo edificio de más de 4,5 m
      b.h = 4.4;
      b.k = 'industrial';
      b.s = false;
      b.f = [244, 244, 240];
      b.c = [205, 207, 208];
      b.lidl = true;
    }
  }
  // la gasolinera genérica de al lado se quita: la pone buildLidlRepsol en su sitio
  if (Array.isArray(map.fuel)) map.fuel = map.fuel.filter(f => Math.hypot(f.x - MC[0], f.z - MC[1]) > 45);
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

export function buildLidlRepsol(scene, colliders, map) {
  const grupo = new THREE.Group();
  grupo.name = 'lidlRepsol';
  const piezas = [];
  /** caja de color: w a lo largo de (dx, dz), h de alto, d de fondo; (x, z) su centro e y su base */
  const caja = (x, y, z, w, h, d, color, dir = E2) => {
    const g = new THREE.BoxGeometry(w, h, d).toNonIndexed();
    g.rotateY(Math.atan2(-dir[1], dir[0]));
    g.translate(x, y + h / 2, z);
    const c = new THREE.Color(color), n = g.getAttribute('position').count, col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    piezas.push(g);
  };
  /** cartel plano mirando hacia (nx, nz) */
  const cartel = (x, y, z, w, h, nx, nz, tex, brilla = 0) => {
    const g = new THREE.PlaneGeometry(w, h);
    g.rotateY(Math.atan2(nx, nz));
    g.translate(x, y, z);
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: brilla }));
    grupo.add(m);
  };
  const BLANCO = 0xf1f0ec, GRIS = 0x9a9fa3, NARANJA = 0xff8200, ROJO = 0xe1251b, AZUL = 0x0a2d6e, OSCURO = 0x2a2e33;

  // ───────────── la gasolinera ─────────────
  const P = (a, b) => [MC[0] + E2[0] * a + E1[0] * b, MC[1] + E2[1] * a + E1[1] * b];
  // la marquesina: losa blanca con el canto de colores
  caja(MC[0], ALTO_M, MC[1], LARGO, 0.7, ANCHO, BLANCO);
  caja(MC[0], ALTO_M + 0.12, MC[1], LARGO + 0.12, 0.2, ANCHO + 0.12, NARANJA);
  caja(MC[0], ALTO_M + 0.32, MC[1], LARGO + 0.14, 0.1, ANCHO + 0.14, ROJO);
  // pilares y, a su pie, las isletas con dos surtidores cada una
  for (const b of [-6.6, 0, 6.6]) {
    for (const a of [-6.5, 6.5]) {
      const [x, z] = P(a, b);
      caja(x, 0, z, 0.45, ALTO_M, 0.45, BLANCO);
      caja(x, 0, z, 6.4, 0.18, 1.3, 0xc9c6bd);                    // la isleta
      for (const s of [-1.9, 1.9]) {
        const [sx, sz] = P(a + s, b);
        caja(sx, 0.18, sz, 1.0, 1.75, 0.55, BLANCO);              // el surtidor
        caja(sx, 1.25, sz, 1.02, 0.42, 0.57, OSCURO);             // su pantalla
        caja(sx, 1.93, sz, 1.06, 0.16, 0.6, NARANJA);
      }
      for (const s of [-3.0, 3.0]) { const [bx, bz] = P(a + s, b); caja(bx, 0.18, bz, 0.14, 0.75, 0.14, 0xf2c200); }   // bolardos
    }
  }
  // el poste con el nombre, junto a la carretera
  {
    const [x, z] = P(-LARGO / 2 - 3, ANCHO / 2 + 2.5);
    caja(x, 0, z, 2.2, 7.2, 0.5, BLANCO);
    caja(x, 7.2, z, 2.3, 0.25, 0.55, NARANJA);
    const tex = lienzo(256, 512, (c, w, h) => {
      c.fillStyle = '#f4f3ef'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#ff8200'; c.fillRect(0, 0, w, 150);
      c.fillStyle = '#e1251b'; c.fillRect(0, 118, w, 32);
      c.fillStyle = '#0a2d6e'; c.font = 'bold 50px Arial, Helvetica, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('REPSOL', w / 2, 62);
      c.fillStyle = '#0a2d6e'; c.font = 'bold 40px Arial, Helvetica, sans-serif';
      c.fillText('LAVADO', w / 2, 230);
      c.fillStyle = '#c9c6bd';
      for (let i = 0; i < 3; i++) c.fillRect(24, 300 + i * 66, w - 48, 44);   // los paneles de precios, sin números
    });
    for (const s of [1, -1]) cartel(x + E1[0] * 0.27 * s, 3.9, z + E1[1] * 0.27 * s, 2.1, 6.2, E1[0] * s, E1[1] * s, tex, 0.15);
  }

  // ───────────── el lavadero: tres boxes techados ─────────────
  const D = [(W2[0] - W1[0]) / Math.hypot(W2[0] - W1[0], W2[1] - W1[1]), (W2[1] - W1[1]) / Math.hypot(W2[0] - W1[0], W2[1] - W1[1])];   // a lo largo del Lidl
  const NF = [D[1], -D[0]];       // hacia la gasolinera
  const BOX = 4.2, FONDO = 6.4, NB = 3;
  const L = (a, b) => [LAV[0] + D[0] * a + NF[0] * b, LAV[1] + D[1] * a + NF[1] * b];
  caja(LAV[0], 0, LAV[1], NB * BOX + 0.6, 0.06, FONDO + 0.4, 0x8d8f8e, D);                 // la solera
  caja(LAV[0], 3.5, LAV[1], NB * BOX + 0.9, 0.35, FONDO + 1.2, BLANCO, D);                 // la cubierta
  caja(LAV[0], 3.5, LAV[1], NB * BOX + 1.0, 0.16, FONDO + 1.3, 0x1976d2, D);               // su canto azul
  for (let i = 0; i <= NB; i++) {
    const [x, z] = L(-NB * BOX / 2 + i * BOX, 0);
    caja(x, 0, z, 0.16, 3.5, FONDO, 0xe9eef2, D);                                          // tabiques
    colliders?.addSegment(...L(-NB * BOX / 2 + i * BOX, -FONDO / 2), ...L(-NB * BOX / 2 + i * BOX, FONDO / 2));
  }
  for (let i = 0; i < NB; i++) {
    const [x, z] = L(-NB * BOX / 2 + (i + 0.5) * BOX, -FONDO / 2 + 0.25);
    caja(x, 0, z, BOX - 0.2, 3.5, 0.14, 0xdfe6ea, D);                                      // el fondo de cada box
    const [mx, mz] = L(-NB * BOX / 2 + (i + 0.5) * BOX + 1.5, -FONDO / 2 + 0.6);
    caja(mx, 0.9, mz, 0.5, 1.2, 0.3, 0x1976d2, D);                                         // la máquina de fichas
    const [rx, rz] = L(-NB * BOX / 2 + (i + 0.5) * BOX, 0);
    caja(rx, 0.062, rz, 1.2, 0.02, 3.6, 0x55585a, D);                                      // la rejilla del desagüe
  }
  colliders?.addSegment(...L(-NB * BOX / 2, -FONDO / 2), ...L(NB * BOX / 2, -FONDO / 2));
  {
    const tex = lienzo(512, 96, (c, w, h) => {
      c.fillStyle = '#1976d2'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#ffffff'; c.font = 'bold 62px Arial, Helvetica, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('LAVADO DE COCHES', w / 2, h / 2 + 3);
    });
    const [x, z] = L(0, FONDO / 2 + 0.68);
    cartel(x, 3.95, z, NB * BOX + 0.8, 0.85, NF[0], NF[1], tex, 0.2);
  }
  // dos aspiradores al lado
  for (const a of [NB * BOX / 2 + 2.2, NB * BOX / 2 + 4.6]) {
    const [x, z] = L(a, -1.5);
    caja(x, 0, z, 0.55, 1.5, 0.45, 0xf2c200, D);
    caja(x, 1.5, z, 0.2, 0.9, 0.2, GRIS, D);
  }

  // ───────────── el Lidl: la nave blanca, la entrada, la marquesina y el rótulo ─────────────
  const lidl = (map?.buildings || []).find(q => q.lidl);
  if (lidl) {
    const pts = lidl.p[0][0] === lidl.p[lidl.p.length - 1][0] && lidl.p[0][1] === lidl.p[lidl.p.length - 1][1] ? lidl.p.slice(0, -1) : lidl.p;
    let area = 0;
    for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; area += a[0] * b[1] - b[0] * a[1]; }
    const fuera = area >= 0 ? 1 : -1;
    // las paredes: un paño blanco por cada lado de la planta, con el remate gris arriba
    let puerta = null;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len < 0.3) continue;
      const d = [(b[0] - a[0]) / len, (b[1] - a[1]) / len], n = [fuera * d[1], -fuera * d[0]];
      const mx = (a[0] + b[0]) / 2 + n[0] * 0.1, mz = (a[1] + b[1]) / 2 + n[1] * 0.1;
      caja(mx, 0, mz, len + 0.2, ALTO_LIDL, 0.16, 0xf3f3ef, d);
      caja(mx + n[0] * 0.03, ALTO_LIDL - 0.5, mz + n[1] * 0.03, len + 0.26, 0.55, 0.2, 0xc9cdd0, d);
      caja(mx + n[0] * 0.03, 0, mz + n[1] * 0.03, len + 0.26, 0.4, 0.2, 0x8f9498, d);
      // el lado donde OpenStreetMap pone la tienda: ahí va la entrada
      const t = Math.max(0, Math.min(1, ((NODO[0] - a[0]) * d[0] + (NODO[1] - a[1]) * d[1]) / len));
      const dist = Math.hypot(a[0] + d[0] * len * t - NODO[0], a[1] + d[1] * len * t - NODO[1]);
      if (len > 20 && (!puerta || dist < puerta.dist)) puerta = { dist, a, d, n, len, t };
    }
    // la cubierta
    {
      const forma = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, z)));
      const g = new THREE.ShapeGeometry(forma);
      g.rotateX(Math.PI / 2);
      g.translate(0, ALTO_LIDL - 0.25, 0);
      const techo = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0xb9bdc0, roughness: 0.9, side: THREE.DoubleSide }));
      techo.receiveShadow = true;
      grupo.add(techo);
    }
    if (puerta) {
      const { a, d, n, len, t } = puerta;
      const ancho = 14, s0 = Math.max(ancho / 2 + 2, Math.min(len - ancho / 2 - 2, len * t - 2));
      const x = a[0] + d[0] * s0 + n[0] * 0.18, z = a[1] + d[1] * s0 + n[1] * 0.18;
      const F = (f, al = 0) => [x + n[0] * f + d[0] * al, z + n[1] * f + d[1] * al];
      caja(F(0.08)[0], 0, F(0.08)[1], ancho, 3.3, 0.16, 0x27333c, d);                       // la cristalera
      for (let i = 0; i <= 7; i++) { const [px, pz] = F(0.18, -ancho / 2 + i * ancho / 7); caja(px, 0, pz, 0.1, 3.3, 0.1, GRIS, d); }
      caja(F(0.18)[0], 2.3, F(0.18)[1], ancho, 0.1, 0.1, GRIS, d);
      caja(F(1.7)[0], 3.4, F(1.7)[1], ancho + 1.6, 0.28, 3.2, 0xd9dcde, d);                 // la marquesina
      for (const al of [-ancho / 2 - 0.4, ancho / 2 + 0.4]) { const [px, pz] = F(3.1, al); caja(px, 0, pz, 0.16, 3.4, 0.16, GRIS, d); }
      // los carros, a un lado de la puerta
      for (let i = 0; i < 4; i++) { const [px, pz] = F(1.0, ancho / 2 + 2 + i * 0.5); caja(px, 0.25, pz, 0.45, 0.75, 0.9, 0xb9bcbe, d); }
      const logo = lienzo(256, 256, (c, w, h) => {
        c.fillStyle = '#0050aa'; c.fillRect(0, 0, w, h);
        c.fillStyle = '#e60a14'; c.beginPath(); c.arc(w / 2, h / 2, 112, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#fff000'; c.beginPath(); c.arc(w / 2, h / 2, 100, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#0050aa'; c.font = 'bold 84px Arial, Helvetica, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('Lidl', w / 2, h / 2 + 4);
      });
      cartel(F(0.12)[0], 5.4, F(0.12)[1], 3, 3, n[0], n[1], logo, 0.2);
    }
  }

  const malla = new THREE.Mesh(mergeGeometries(piezas, false), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7 }));
  malla.castShadow = malla.receiveShadow = true;
  grupo.add(malla);
  scene.add(grupo);
  return grupo;
}
