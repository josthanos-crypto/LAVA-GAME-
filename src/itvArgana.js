import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { cinta, malla } from './puenteRayas.js';

/**
 * La estación de ITV de Arrecife, en la subida a San Bartolomé (Argana Alta), entre la carretera y el Hospital
 * Doctor José Molina Orosa (Version 137, pedido por José Manuel: «haz la ITV en la subida San Bartolomé»).
 *
 * La nave viene en el mapa de OpenStreetMap (40 × 17 m, cubierta gris azulada en la foto aérea), pero el juego la
 * levantaba como un bloque genérico de tiendas. La foto aérea (PNOA) enseña también las filas de espera pintadas
 * delante de la boca de entrada y una caseta con marquesina verde azulada al lado.
 *
 * Aquí se hace la estación: la nave abierta por las dos puntas con sus TRES LÍNEAS de inspección (se puede cruzar con
 * el coche), los fosos, los rodillos del frenómetro, los números de línea con su semáforo, los rótulos «ITV», la
 * caseta de recepción y las filas de espera con sus flechas.
 *
 * No lleva el nombre de la empresa que la explota ni horarios ni precios: solo «ITV» (no se inventan datos).
 * El sentido de paso (se entra por la punta de arriba, la de las filas pintadas) sale de la foto aérea; que lo
 * confirme José Manuel.
 *
 * Coordenadas del juego: x = (lon + 13,55) · 97398, z = (28,9625 − lat) · 111320.
 */

const C = [-1686.1, -1279.2];              // el centro de la nave (planta de OpenStreetMap)
const U = [-0.769, -0.638];                // a lo largo: de la salida (s = -L) a la entrada (s = +L)
const V = [-0.638, 0.769];                 // de través, hacia la carretera
const L = 19.9, W = 8.65, ALTO = 6.6, BOCA = 4.4;
const LINEAS = [-5.3, 0, 5.3];             // el eje de cada línea de inspección
const P = (s, v) => [C[0] + U[0] * s + V[0] * v, C[1] + U[1] * s + V[1] * v];

const BLANCO = 0xf2f1ec, AZUL = 0x1c4f9c, GRIS = 0x8f9498, HORMIGON = 0x9a9b98, AMARILLO = 0xf2c200, OSCURO = 0x23262a;

/** antes de levantar la ciudad: fuera el bloque genérico */
export function tuneItvArgana(map) {
  for (const b of map.buildings || []) {
    if (!b.p || b.p.length < 4) continue;
    let x = 0, z = 0;
    for (const q of b.p.slice(0, -1)) { x += q[0]; z += q[1]; }
    x /= b.p.length - 1; z /= b.p.length - 1;
    if (Math.hypot(x - C[0], z - C[1]) < 4) b.skip = true;
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

/** el dintel de cada boca: banda azul con «ITV» y el número de cada línea sobre su hueco, con el semáforo en verde */
function dintel(alReves) {
  return lienzo(1024, 128, (c, w, h) => {
    c.fillStyle = '#1c4f9c'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#ffffff'; c.fillRect(0, h - 6, w, 6);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    const orden = alReves ? [3, 2, 1] : [1, 2, 3];
    orden.forEach((n, i) => {
      const x = w * (0.5 + (LINEAS[i] / (2 * W)));
      c.fillStyle = '#ffffff'; c.font = 'bold 30px Arial, Helvetica, sans-serif';
      c.fillText('LÍNEA', x - 26, h * 0.3);
      c.font = 'bold 74px Arial, Helvetica, sans-serif';
      c.fillText(String(n), x - 26, h * 0.68);
      c.fillStyle = '#101214'; c.fillRect(x + 22, 22, 34, 84);
      c.fillStyle = '#3a1512'; c.beginPath(); c.arc(x + 39, 44, 12, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#35e06a'; c.beginPath(); c.arc(x + 39, 84, 12, 0, Math.PI * 2); c.fill();
    });
  });
}

/** el rótulo grande: blanco con «ITV» en azul y el nombre completo */
function rotulo() {
  return lienzo(1024, 160, (c, w, h) => {
    c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#1c4f9c'; c.fillRect(0, 0, w, 10); c.fillRect(0, h - 10, w, 10);
    c.textBaseline = 'middle';
    c.textAlign = 'left'; c.font = 'bold 120px Arial, Helvetica, sans-serif'; c.fillText('ITV', 34, h / 2 + 4);
    c.font = 'bold 44px Arial, Helvetica, sans-serif';
    c.fillText('INSPECCIÓN TÉCNICA', 300, h * 0.36);
    c.fillText('DE VEHÍCULOS', 300, h * 0.68);
  });
}

export function buildItvArgana(scene, colliders) {
  const grupo = new THREE.Group();
  grupo.name = 'itvArgana';
  const piezas = [];
  /** caja de color con la base en y: w a lo largo de dir, d de través */
  const caja = (s, v, y, w, h, d, color, dir = U) => {
    const [x, z] = P(s, v);
    const g = new THREE.BoxGeometry(w, h, d).toNonIndexed();
    g.rotateY(Math.atan2(-dir[1], dir[0]));
    g.translate(x, y + h / 2, z);
    const c = new THREE.Color(color), n = g.getAttribute('position').count, col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    piezas.push(g);
  };
  const cartel = (s, v, y, w, h, n, tex, brilla = 0) => {
    const [x, z] = P(s, v);
    const g = new THREE.PlaneGeometry(w, h);
    g.rotateY(Math.atan2(n[0], n[1]));
    g.translate(x, y, z);
    grupo.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: brilla })));
  };
  const muro = (s0, v0, s1, v1) => colliders?.addSegment(...P(s0, v0), ...P(s1, v1));
  const menosU = [-U[0], -U[1]], menosV = [-V[0], -V[1]];

  // ───────────── la nave ─────────────
  // las dos paredes largas, en cuatro paños (así siguen el suelo), con zócalo gris y franja azul
  for (const lado of [-1, 1]) {
    for (let k = 0; k < 4; k++) {
      const s = -L + (k + 0.5) * (2 * L / 4);
      caja(s, lado * W, 0, 2 * L / 4 + 0.02, ALTO, 0.25, BLANCO);
      caja(s, lado * (W + 0.02), 0, 2 * L / 4 + 0.02, 0.6, 0.3, GRIS);
      caja(s, lado * (W + 0.02), ALTO - 1.5, 2 * L / 4 + 0.02, 0.5, 0.3, AZUL);
      // ventanas altas corridas
      caja(s, lado * (W + 0.03), 3.4, 2 * L / 4 - 2.2, 0.9, 0.3, 0x35434d);
      // la cubierta (una vez)
      if (lado > 0) caja(s, 0, ALTO, 2 * L / 4 + 0.02, 0.3, 2 * W + 0.9, 0xb7c0c8);
    }
    muro(-L, lado * W, L, lado * W);
  }
  // las dos puntas: pilares entre las bocas y el dintel con los números de línea
  const pilares = [-W + 0.2, -(BOCA / 2 + 0.45), BOCA / 2 + 0.45, W - 0.2];
  for (const punta of [-1, 1]) {
    const s = punta * L;
    for (const v of pilares) { caja(s, v, 0, 0.45, ALTO - 1.9, 0.9, BLANCO); muro(s, v - 0.45, s, v + 0.45); }
    for (const v of pilares) caja(s + punta * 0.25, v, 0, 0.14, 1.1, 0.14, AMARILLO);       // protecciones amarillas
    caja(s, 0, ALTO - 1.9, 0.45, 1.9, 2 * W + 0.5, BLANCO);
    cartel(s + punta * 0.24, 0, ALTO - 1.0, 2 * W, 1.5, punta > 0 ? U : menosU, dintel(punta < 0), 0.25);
  }
  // por dentro: suelo de hormigón, y en cada línea las rayas amarillas, el foso y los rodillos del frenómetro.
  // Todo lo que va tumbado en el suelo se pone en trozos de 4 m como mucho: así sube con el terreno igual que el suelo
  // (una pieza larga solo se apoya en sus puntas y lo pequeño se hundía por debajo)
  const tira = (s0, s1, v, y, h, d, color) => {
    const n = Math.max(1, Math.ceil((s1 - s0) / 4)), l = (s1 - s0) / n;
    for (let i = 0; i < n; i++) caja(s0 + (i + 0.5) * l, v, y, l + 0.01, h, d, color);
  };
  for (let k = 0; k < 4; k++) tira(-L, L, -W + (k + 0.5) * (2 * W / 4), 0.09, 0.03, 2 * W / 4 + 0.01, HORMIGON);
  for (const v of LINEAS) {
    for (const d of [-1.55, 1.55]) tira(-L + 0.5, L - 0.5, v + d, 0.12, 0.012, 0.12, AMARILLO);
    tira(-6.5, 2.5, v, 0.12, 0.014, 0.95, OSCURO);                 // el foso
    for (const d of [-0.56, 0.56]) tira(-6.5, 2.5, v + d, 0.12, 0.05, 0.08, AMARILLO);   // su reborde
    for (const d of [-0.95, 0.95]) {                                // los rodillos, uno por rueda
      caja(9.5, v + d, 0.12, 1.1, 0.016, 0.8, 0x4c4f52);
      caja(9.5, v + d, 0.13, 0.9, 0.016, 0.6, 0x1b1d1f);
    }
    caja(13.5, v + 1.9, 0.12, 0.5, 1.25, 0.4, 0xd9dcde);            // el regloscopio de las luces
    for (const s of [-12, 0, 12]) caja(s, v, ALTO - 0.45, 2.4, 0.08, 0.25, 0xfff4d8);   // las luces del techo
  }
  // la cabina de los inspectores, entre dos líneas
  caja(-11, 2.65, 0.12, 3.2, 2.5, 0.9, 0xe3e6e8);
  caja(-11, 2.65, 1.3, 3.0, 0.9, 0.95, 0x35434d);

  // el rótulo grande, en la pared que da a la carretera y sobre la cubierta, en la punta de la entrada
  cartel(0, W + 0.2, ALTO - 0.4, 12.8, 2.0, V, rotulo(), 0.2);
  cartel(L + 0.26, 0, ALTO + 1.15, 9.6, 1.5, U, rotulo(), 0.2);
  caja(L, 0, ALTO, 0.3, 2.0, 10, 0xd9dcde);

  // ───────────── la caseta de recepción, con su marquesina verde azulada ─────────────
  {
    const s = 8.2, v = 21.3;
    caja(s, v, 0, 6, 3, 4, BLANCO);
    caja(s, v, 3, 8.4, 0.25, 6.4, 0x2a9d9a);
    caja(s, v + 2.02, 1.0, 3.6, 1.3, 0.1, 0x35434d);
    for (const [a, b] of [[-4, -3], [4, -3], [-4, 3], [4, 3]]) caja(s + a, v + b, 0, 0.14, 3, 0.14, GRIS);
    muro(s - 3, v - 2, s + 3, v - 2); muro(s + 3, v - 2, s + 3, v + 2); muro(s + 3, v + 2, s - 3, v + 2); muro(s - 3, v + 2, s - 3, v - 2);
  }
  // el poste con el rótulo, hacia la carretera
  {
    const s = -L - 6, v = W + 15;
    caja(s, v, 0, 0.35, 6.2, 0.35, GRIS);
    caja(s, v, 4.4, 4.2, 1.8, 0.3, BLANCO, V);
    const tex = lienzo(384, 160, (c, w, h) => {
      c.fillStyle = '#1c4f9c'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#ffffff'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.font = 'bold 130px Arial, Helvetica, sans-serif'; c.fillText('ITV', w / 2, h / 2 + 6);
    });
    cartel(s - 0.17, v, 5.3, 4.0, 1.66, menosU, tex, 0.25);
    cartel(s + 0.17, v, 5.3, 4.0, 1.66, U, tex, 0.25);
  }

  // ───────────── la explanada: las filas de espera y las flechas ─────────────
  const blanco = [], flechas = [];
  const linea = (s0, v0, s1, v1, hw = 0.06) => {
    const n = Math.max(2, Math.ceil(Math.hypot(s1 - s0, v1 - v0) / 2)), pts = [];
    for (let i = 0; i <= n; i++) pts.push(P(s0 + (s1 - s0) * i / n, v0 + (v1 - v0) * i / n));
    cinta(blanco, pts, () => 0.125, hw, false);
  };
  for (const v of [-7.95, -2.65, 2.65, 7.95]) linea(L + 1.5, v, L + 27, v);          // las filas de la entrada
  for (const v of [-7.95, -2.65, 2.65, 7.95]) linea(-L - 1.5, v, -L - 9, v);         // la salida
  for (const v of LINEAS) {
    linea(L + 2.2, v - 2.2, L + 2.2, v + 2.2, 0.15);                                   // la línea de «espere»
    for (const s of [L + 9, L + 20, -L - 5]) {                                        // flechas en el sentido de paso
      const at = (f, d) => { const [x, z] = P(s - f, v + d); return [x, 0.128, z]; };
      flechas.push(...at(1.3, 0), ...at(0.2, 0.6), ...at(0.2, -0.6));
      flechas.push(...at(0.2, 0.17), ...at(-1.2, 0.17), ...at(-1.2, -0.17), ...at(0.2, 0.17), ...at(-1.2, -0.17), ...at(0.2, -0.17));
    }
  }
  const pintura = new THREE.MeshStandardMaterial({ color: 0xeceae2, roughness: 0.85, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  for (const [pos, nombre] of [[blanco, 'itvArganaRayas'], [flechas, 'itvArganaFlechas']]) {
    const m = malla(pos, pintura);
    if (m) { m.name = nombre; grupo.add(m); }
  }

  const m = new THREE.Mesh(mergeGeometries(piezas, false), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75, side: THREE.DoubleSide }));
  m.castShadow = m.receiveShadow = true;
  grupo.add(m);
  scene.add(grupo);
  return grupo;
}
