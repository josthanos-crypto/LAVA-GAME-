import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { buildAparcamientos } from './aparcamientosTenderete.js';
import { buildRotulosEmpresas } from './parqueComercialEmpresas.js';

/**
 * El Centro Comercial Argana y las dos naves de enfrente: Deko Hogar y Kiwoko (Version 143).
 *
 * José Manuel: «Encima de la gasolinera, en la carretera Arrecife–San Bartolomé, está el centro comercial de
 * Argana; pasando la carretera, haciendo esquina, está una de las tiendas de chinos, "seco hogar" creo que se llama».
 *
 * En el mapa (OpenStreetMap) no venía NINGUNO de los tres edificios: en el juego ahí solo se veía la foto del suelo.
 * Las plantas están medidas sobre la foto aérea (PNOA) y el mapa de Google Maps (mirado el 17/11/2026), y cuadran
 * entre sí a menos de 2 m:
 *  - Argana Centro Comercial: la nave de las placas solares entre la calle Iguazú y la calle José López Betancort
 *    (116 × 52 m), con la entrada y el aparcamiento hacia la rotonda.
 *  - Deko Hogar: la nave larga del otro lado de la calle Iguazú (121 × 26 m). Es, casi seguro, la «seco hogar» de
 *    José Manuel: una tienda de hogar, cruzando la calle desde el centro comercial y haciendo esquina con la
 *    carretera. EL NOMBRE SALE DE GOOGLE MAPS: que lo confirme.
 *  - Kiwoko (tienda de animales): la nave pegada por detrás a la de Deko Hogar (56 × 30 m).
 * Las tiendas de dentro del centro comercial (Worten, Toy Planet, Optimus…) también salen de Google Maps: llevan un
 * cartel sencillo con su nombre, sin logotipos. Que José Manuel repase la lista.
 *
 * Cómo está hecho: `tuneCcArgana` mete los tres bloques en el mapa, bajos y lisos (dan el choque, el tejado y salen
 * en el minimapa); `buildCcArgana` levanta por fuera la nave de verdad de cada uno, con su cubierta, la entrada y
 * los rótulos, y pinta el aparcamiento. Es el mismo método del Lidl y de IKEA (el juego pone ventanas de pisos a
 * todo bloque de más de 4,5 m).
 *
 * Coordenadas del juego: x = (lon + 13,55) · 97398, z = (28,9625 − lat) · 111320.
 */

// los dos ejes de la manzana: A a lo largo de la calle Iguazú (hacia arriba), B de través (hacia López Betancort)
const A = [0.6289, -0.7776], B = [0.7776, 0.6289];
const P = (o, a, b) => [+(o[0] + A[0] * a + B[0] * b).toFixed(2), +(o[1] + A[1] * a + B[1] * b).toFixed(2)];

/** las tres naves: esquina de abajo-izquierda (hacia la rotonda y hacia la calle Iguazú), largo, ancho y alto */
const NAVES = {
  cc: { o: [-1441, -1131], largo: 116, ancho: 51.7, alto: 9, pared: 0xeeeeea, zocalo: 0x8b9094, remate: 0x5a6068 },
  deko: { o: [-1520.03, -1107.6], largo: 120.8, ancho: 25.8, alto: 7, pared: 0xf1f0ec, zocalo: 0x8b9094, remate: 0xb9bdc0 },
  kiwoko: { o: [-1543.36, -1126.47], largo: 55.9, ancho: 29.7, alto: 7, pared: 0xefeee9, zocalo: 0x8b9094, remate: 0xb9bdc0 },
};

/** las tiendas del centro comercial que salen en Google Maps, con el punto donde las pone */
export const TIENDAS_CC = [
  ['Worten', -1425.7, -1136.3],
  ['Toy Planet', -1402.7, -1133.7],
  ['Statum Café', -1390.5, -1115.2],
  ['Optimus Arrecife', -1392.3, -1153.6],
  ['Musical Panchito', -1381.7, -1167.2],
  ['Books & Papers', -1388.5, -1183.2],
  ['OLA Zapatería', -1374.1, -1190.4],
];

/** retoques al mapa antes de levantar la ciudad: los tres bloques que no venían */
export function tuneCcArgana(map) {
  if (map.ccArgana) return;
  map.ccArgana = true;
  for (const [id, n] of Object.entries(NAVES)) {
    const p = [P(n.o, 0, 0), P(n.o, n.largo, 0), P(n.o, n.largo, n.ancho), P(n.o, 0, n.ancho)];
    p.push(p[0].slice());
    // bajo y liso: la nave de verdad la pone buildCcArgana por fuera
    map.buildings.push({ p, h: 4.4, k: 'industrial', s: false, f: [238, 238, 234], c: [190, 194, 198], edificioReal: true, naveArgana: id });
  }
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

/** un rótulo de letras sobre una banda de color */
function letrero(texto, fondo, tinta, sub) {
  return lienzo(1024, 160, (c, w, h) => {
    c.fillStyle = fondo; c.fillRect(0, 0, w, h);
    c.fillStyle = tinta; c.textAlign = 'center'; c.textBaseline = 'middle';
    let px = sub ? 92 : 112;
    c.font = `bold ${px}px Arial, Helvetica, sans-serif`;
    while (px > 30 && c.measureText(texto).width > w - 50) { px -= 4; c.font = `bold ${px}px Arial, Helvetica, sans-serif`; }
    c.fillText(texto, w / 2, sub ? h * 0.4 : h / 2 + 4);
    if (sub) { c.font = 'bold 34px Arial, Helvetica, sans-serif'; c.fillText(sub, w / 2, h * 0.82); }
  });
}

/** las placas solares de la cubierta del centro comercial, como en la foto aérea */
function placasTex() {
  const t = lienzo(128, 128, (c, w, h) => {
    c.fillStyle = '#aeb3b8'; c.fillRect(0, 0, w, h);
    for (let y = 6; y < h; y += 32) {
      c.fillStyle = '#27405f'; c.fillRect(4, y, w - 8, 22);
      c.strokeStyle = '#5d7796'; c.lineWidth = 1;
      for (let x = 4; x <= w - 4; x += 15) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 22); c.stroke(); }
      c.beginPath(); c.moveTo(4, y + 11); c.lineTo(w - 4, y + 11); c.stroke();
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** el escaparate: cristal oscuro con sus montantes */
function cristalTex(largo) {
  return lienzo(Math.min(2048, Math.round(largo * 32)), 128, (c, w, h) => {
    c.fillStyle = '#26323b'; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,.09)'; c.fillRect(0, 0, w, h * 0.4);
    c.fillStyle = '#d5d9dc';
    const n = Math.max(2, Math.round(largo / 2.4));
    for (let i = 0; i <= n; i++) c.fillRect(Math.min(w - 4, i * w / n - 2), 0, 4, h);
    c.fillRect(0, 0, w, 5); c.fillRect(0, h - 8, w, 8); c.fillRect(0, h * 0.68, w, 3);
  });
}

/** los lados de una planta con su normal hacia fuera */
function lados(b) {
  const p = b.p, cerrado = p[0][0] === p[p.length - 1][0] && p[0][1] === p[p.length - 1][1];
  const pts = cerrado ? p.slice(0, -1) : p;
  let area = 0;
  for (let i = 0; i < pts.length; i++) { const a = pts[i], c = pts[(i + 1) % pts.length]; area += a[0] * c[1] - c[0] * a[1]; }
  const fuera = area >= 0 ? 1 : -1;
  return pts.map((a, i) => {
    const c = pts[(i + 1) % pts.length], len = Math.hypot(c[0] - a[0], c[1] - a[1]) || 1;
    const d = [(c[0] - a[0]) / len, (c[1] - a[1]) / len];
    return { a, b: c, len, d, n: [fuera * d[1], -fuera * d[0]], m: [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2] };
  });
}

/** el lado más largo que mira hacia `hacia` (un vector) */
const ladoHacia = (L, hacia) => L.filter(l => l.n[0] * hacia[0] + l.n[1] * hacia[1] > 0.8).sort((p, q) => q.len - p.len)[0];

export function buildCcArgana(scene, colliders, map) {
  const grupo = new THREE.Group();
  grupo.name = 'ccArgana';
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
  /** un rótulo colgado de un lado: `al` = metros desde el centro del lado, `y` = altura del centro */
  const rotulo = (l, al, y, w, h, tex, brilla = 0.22) => cartel(l.m[0] + l.d[0] * al + l.n[0] * 0.24, y, l.m[1] + l.d[1] * al + l.n[1] * 0.24, w, h, l.n, tex, brilla);
  /** una cristalera en un lado, con su marquesina si se pide */
  const cristalera = (l, al, ancho, alto, marquesina) => {
    cartel(l.m[0] + l.d[0] * al + l.n[0] * 0.22, alto / 2 + 0.25, l.m[1] + l.d[1] * al + l.n[1] * 0.22, ancho, alto, l.n, cristalTex(ancho), 0.05);
    if (!marquesina) return;
    const F = (f, a2) => [l.m[0] + l.d[0] * (al + a2) + l.n[0] * f, l.m[1] + l.d[1] * (al + a2) + l.n[1] * f];
    const trozos = Math.max(1, Math.ceil(ancho / 8)), tr = (ancho + 1.6) / trozos;
    for (let i = 0; i < trozos; i++) { const [x, z] = F(2.0, -(ancho + 1.6) / 2 + (i + 0.5) * tr); caja(x, alto + 0.45, z, tr, 0.3, 3.6, marquesina, l.d); }
    for (let i = 0; i <= trozos; i++) { const [x, z] = F(3.6, -(ancho + 1.6) / 2 + i * tr); caja(x, 0, z, 0.18, alto + 0.45, 0.18, 0xd9dcde, l.d); }
  };

  const hechas = {};
  for (const b of map.buildings || []) {
    const n = NAVES[b.naveArgana];
    if (!n || b.skip) continue;
    const L = lados(b).filter(l => l.len > 0.5);
    for (const l of L) {
      // la pared, en paños de 12 m como mucho para que siga el suelo
      const k = Math.max(1, Math.ceil(l.len / 12)), tr = l.len / k;
      for (let i = 0; i < k; i++) {
        const t = (i + 0.5) * tr, x = l.a[0] + l.d[0] * t + l.n[0] * 0.1, z = l.a[1] + l.d[1] * t + l.n[1] * 0.1;
        caja(x, 0, z, tr + 0.2, n.alto, 0.16, n.pared, l.d);
        caja(x + l.n[0] * 0.03, 0, z + l.n[1] * 0.03, tr + 0.24, 0.5, 0.2, n.zocalo, l.d);
        caja(x + l.n[0] * 0.03, n.alto - 0.6, z + l.n[1] * 0.03, tr + 0.24, 0.6, 0.2, n.remate, l.d);
      }
    }
    hechas[b.naveArgana] = { b, n, L };
  }

  /** la cubierta: una rejilla de 10 m que sigue el suelo; (a0..a1, b0..b1) en metros desde la esquina de la nave */
  const cubierta = (n, a0, a1, b0, b1, mat, repite) => {
    const na = Math.max(1, Math.ceil((a1 - a0) / 10)), nb = Math.max(1, Math.ceil((b1 - b0) / 10));
    const pos = [], uv = [], idx = [];
    for (let j = 0; j <= nb; j++) for (let i = 0; i <= na; i++) {
      const a = a0 + (a1 - a0) * i / na, bb = b0 + (b1 - b0) * j / nb, [x, z] = P(n.o, a, bb);
      pos.push(x, n.alto - 0.12, z);
      uv.push(repite ? bb / repite : i / na, repite ? a / repite : j / nb);
    }
    for (let j = 0; j < nb; j++) for (let i = 0; i < na; i++) {
      const p0 = j * (na + 1) + i, p1 = p0 + 1, p2 = p0 + na + 1, p3 = p2 + 1;
      idx.push(p0, p2, p1, p1, p2, p3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat);
    m.receiveShadow = true;
    grupo.add(m);
  };
  const gris = new THREE.MeshStandardMaterial({ color: 0xc3c7ca, roughness: 0.9, side: THREE.DoubleSide });

  // ───────────── Argana Centro Comercial ─────────────
  if (hechas.cc) {
    const { n, L } = hechas.cc;
    // la cubierta: el cuerpo de la entrada, claro; el resto, con las placas solares
    cubierta(n, 0, 30, 0, n.ancho, gris);
    cubierta(n, 30, n.largo, 0, n.ancho, new THREE.MeshStandardMaterial({ map: placasTex(), roughness: 0.6, metalness: 0.2, side: THREE.DoubleSide }), 8);
    const nombre = letrero('ARGANA', '#2c3138', '#ffffff', 'CENTRO COMERCIAL');
    // la fachada de la entrada, hacia el aparcamiento y la rotonda
    const frente = ladoHacia(L, [-A[0], -A[1]]);
    if (frente) {
      cristalera(frente, 0, 26, 3.6, 0x5a6068);
      rotulo(frente, 0, n.alto - 2.3, 17, 2.7, nombre, 0.3);
    }
    // las dos caras largas: el nombre cerca de la esquina de la entrada y escaparates debajo
    for (const hacia of [[-B[0], -B[1]], B]) {
      const l = ladoHacia(L, hacia);
      if (!l) continue;
      // el lado se recorre de una punta a otra: `signo` lleva hacia la esquina de la entrada
      const signo = (l.d[0] * A[0] + l.d[1] * A[1]) > 0 ? -1 : 1;
      rotulo(l, signo * (l.len / 2 - 14), n.alto - 2.3, 15, 2.4, nombre, 0.3);
      cristalera(l, signo * (l.len / 2 - 22), 36, 2.5, null);      // bajos: encima van los carteles de las tiendas
    }
  }

  // ───────────── Deko Hogar ─────────────
  if (hechas.deko) {
    const { n, L } = hechas.deko;
    cubierta(n, 0, n.largo, 0, n.ancho, new THREE.MeshStandardMaterial({ color: 0xe4e6e6, roughness: 0.85, side: THREE.DoubleSide }));
    const nombre = letrero('DEKO HOGAR', '#f4f3ee', '#1d2f55');
    // la cara de la calle Iguazú (donde Google pone la tienda) y la punta que da a la carretera
    const calle = ladoHacia(L, B);
    if (calle) {
      const signo = (calle.d[0] * A[0] + calle.d[1] * A[1]) > 0 ? 1 : -1;
      // el punto de la tienda cae a 57 m de la esquina de abajo: ahí van la puerta y el rótulo
      const al = signo * (57 - n.largo / 2);
      cristalera(calle, al, 22, 3.2, 0xb9bdc0);
      rotulo(calle, al, n.alto - 1.9, 14, 2.2, nombre, 0.25);
    }
    const punta = ladoHacia(L, [-A[0], -A[1]]);
    if (punta) rotulo(punta, 0, n.alto - 1.9, 12, 1.9, nombre, 0.25);
  }

  // ───────────── Kiwoko ─────────────
  if (hechas.kiwoko) {
    const { n, L } = hechas.kiwoko;
    cubierta(n, 0, n.largo, 0, n.ancho, gris);
    const nombre = letrero('KIWOKO', '#f4f3ee', '#1d2f55', 'MUNDO ANIMAL');
    // la punta que da a la carretera de San Bartolomé y la cara de atrás, que da a su aparcamiento
    const punta = ladoHacia(L, [-A[0], -A[1]]);
    if (punta) { rotulo(punta, 0, n.alto - 2, 11, 2.3, nombre, 0.25); cristalera(punta, 0, 14, 3.2, 0xb9bdc0); }
    const atras = ladoHacia(L, [-B[0], -B[1]]);
    if (atras) rotulo(atras, 0, n.alto - 2, 11, 2.3, nombre, 0.25);
  }

  if (piezas.length) {
    const m = new THREE.Mesh(mergeGeometries(piezas, false), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75 }));
    m.castShadow = m.receiveShadow = true;
    grupo.add(m);
  }
  scene.add(grupo);

  // el aparcamiento del centro comercial, entre la fachada de la entrada y la rotonda
  const cc = NAVES.cc;
  const [px, pz] = P(cc.o, -33, cc.ancho / 2);
  grupo.userData.aparcamiento = buildAparcamientos(scene, map, {
    nombre: 'aparcamientoCcArgana',
    solares: [{ nombre: 'ccArgana', centro: [px, pz], eje: A, largo: 29, ancho: 28 }],
    zona: [-1500, -1370, -1150, -1040],
  });
  // los carteles de las tiendas de dentro, en la pared que tienen más cerca
  grupo.userData.tiendas = buildRotulosEmpresas(scene, map, TIENDAS_CC, [-1450, -1320, -1230, -1090], 'ccArganaTiendas').userData.puestos;
  return grupo;
}
