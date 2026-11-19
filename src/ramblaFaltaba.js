import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { buildAparcamientos } from './aparcamientosTenderete.js';
import { buildRotulosEmpresas } from './parqueComercialEmpresas.js';

/**
 * Lo que faltaba a lo largo de la Rambla Medular al comparar el mapa del juego con la ortofoto oficial (PNOA del
 * IGN) (Version 148). OpenStreetMap no lo traía y en el juego solo se veía la foto del suelo:
 *
 *  - Junto a la Comisaría de la Policía Nacional (calles Timón, Velacho y Escotilla): la nave gris de la esquina
 *    con la Rambla (Electrofube, según Google Maps), las 21 casetas del solar de detrás (sin nombre), el edificio
 *    oscuro de la rotonda de la avenida de Naos (sin nombre) y el local blanco del muelle (Cuatro Hojas, según
 *    Google Maps). La comisaría ya estaba y está en su sitio.
 *  - El cuartel del principio de la Rambla (Acuartelamiento Marqués de Herrera): los edificios del lado de la
 *    circunvalación, que no venían. Lisos y sin rótulo.
 *  - El aparcamiento de verdad del ALDI: está al SUR de la tienda (entre la calle El Forito y la Rambla), con su
 *    marquesina larga de sombra. Era lo que quedaba pendiente de preguntar a José Manuel.
 *
 * LOS NOMBRES SALEN DEL MAPA DE GOOGLE MAPS (17/11/2026): José Manuel tiene que repasarlos (lista `ROTULOS`).
 * Para añadir otra nave que falte: una línea en `NAVES` con los dos extremos de su eje, el ancho y la altura.
 *
 * Coordenadas del juego: x = (lon + 13,55) · 97398, z = (28,9625 − lat) · 111320.
 */

/** edificios con su planta medida sobre la foto: [puntos, alto, tipo, color de fachada] */
const PLANTAS = [
  [[[772.2, -468.6], [793.2, -486.2], [814.2, -443.4], [805.8, -439.8]], 6, 'industrial', [214, 216, 218]],      // Electrofube
  [[[924.8, -304.8], [939.4, -299.8], [942.2, -286.6], [933.2, -278.2], [919.8, -286.6]], 5, 'industrial', [86, 88, 92]],
  [[[990, -523], [1003, -532], [1010, -516], [999, -508]], 4, 'gen', [244, 243, 238]],                           // Cuatro Hojas
];

/** naves alargadas: [x1, z1, x2, z2, ancho, alto, tipo] — el cuartel */
const NAVES = [
  [-1242.7, -664.6, -1200.9, -629.8, 7.5, 4, 'industrial'],
  [-1233.9, -680, -1218.5, -695, 6.5, 4, 'industrial'],
  [-1222.9, -711.9, -1208.2, -727.3, 7, 4, 'industrial'],
  [-1210.8, -704.2, -1197.2, -720, 6.5, 4, 'industrial'],
  [-1192.1, -733.9, -1154.7, -705.3, 10, 4.4, 'gen'],
  [-1189.9, -644.8, -1158, -684.4, 12, 4.4, 'industrial'],
  [-1217.4, -621, -1203.8, -610.7, 12, 4.4, 'gen'],
  [-1242.7, -642.2, -1230.2, -632.7, 9, 4.4, 'gen'],
  [-1250.4, -634.9, -1227.3, -616.2, 5, 3.4, 'industrial'],
  [-1196.5, -616.2, -1182.2, -630.5, 6.5, 4, 'industrial'],
];

// las casetas del solar de detrás de la comisaría: una cuadrícula de 7 × 3
const CASETAS = { o: [864.6, -503.6], u: [0.522, 0.853], v: [-0.768, 0.64], filas: 7, columnas: 3, paso: [7.3, 11], lado: 6.4, alto: 3 };

/** los rótulos (Google Maps): [nombre, x, z] */
export const ROTULOS = [
  ['Electrofube', 795, -465],
  ['Cuatro Hojas', 998, -522],
  ['Cofarca Lanzarote', 914.7, -501],
  ['Efectos Navales San Ginés', 972, -434],
  ['Pinturas & Decoraciones de León', 785, -408],
  ['Inoxnaval Lanzarote', 769.5, -333],
  ['Bodegas Torres', 843, -574],
];

// el aparcamiento del ALDI: centro, eje largo y medias medidas
const ALDI = { centro: [-1200.4, 204], eje: [-0.249, 0.968], largo: 42, ancho: 11 };

const cerrar = (p) => { const q = p.map(([x, z]) => [+x.toFixed(2), +z.toFixed(2)]); q.push(q[0].slice()); return q; };

/** retoques al mapa antes de levantar la ciudad: los edificios que no venían */
export function tuneRamblaFaltaba(map) {
  if (map.ramblaFaltaba) return;
  map.ramblaFaltaba = true;
  const poner = (p, h, k, f = [232, 230, 224]) => map.buildings.push({ p: cerrar(p), h, k, s: false, f, c: [188, 190, 192], edificioReal: true });
  for (const [p, h, k, f] of PLANTAS) poner(p, h, k, f);
  for (const [x1, z1, x2, z2, ancho, alto, k] of NAVES) {
    const L = Math.hypot(x2 - x1, z2 - z1), nx = -(z2 - z1) / L * ancho / 2, nz = (x2 - x1) / L * ancho / 2;
    poner([[x1 + nx, z1 + nz], [x2 + nx, z2 + nz], [x2 - nx, z2 - nz], [x1 - nx, z1 - nz]], alto, k);
  }
  const { o, u, v, filas, columnas, paso, lado, alto } = CASETAS, h = lado / 2;
  for (let i = 0; i < filas; i++) for (let j = 0; j < columnas; j++) {
    const s = 3.6 + paso[0] * i, t = 5.5 + paso[1] * j, cx = o[0] + u[0] * s + v[0] * t, cz = o[1] + u[1] * s + v[1] * t;
    poner([[-h, -h], [h, -h], [h, h], [-h, h]].map(([a, b]) => [cx + u[0] * a + v[0] * b, cz + u[1] * a + v[1] * b]), alto, 'industrial', [226, 218, 200]);
  }
}

export function buildRamblaFaltaba(scene, colliders, map) {
  const grupo = new THREE.Group();
  grupo.name = 'ramblaFaltaba';
  // el aparcamiento del ALDI: firme y plazas, y la marquesina larga del centro
  grupo.userData.aldi = buildAparcamientos(scene, map, { nombre: 'aparcamientoAldiSur', solares: [{ nombre: 'aldiSur', ...ALDI }], zona: [-1245, -1160, 150, 262] });
  const piezas = [];
  const caja = (x, y, z, w, h, d, color, dir) => {
    const g = new THREE.BoxGeometry(w, h, d).toNonIndexed();
    g.rotateY(Math.atan2(-dir[1], dir[0]));
    g.translate(x, y + h / 2, z);
    const c = new THREE.Color(color), n = g.getAttribute('position').count, col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    piezas.push(g);
  };
  const { centro, eje } = ALDI, LARGO = 60, ANCHO = 6, ALTO = 3.2;
  for (let s = -LARGO / 2 + 2.5; s < LARGO / 2; s += 5) {
    const x = centro[0] + eje[0] * s, z = centro[1] + eje[1] * s;
    caja(x, ALTO, z, 5.02, 0.12, ANCHO, 0xeef0f0, eje);
    caja(x, ALTO - 0.26, z, 5.02, 0.26, 0.28, 0x9aa1a6, eje);
    caja(x, 0, z, 0.24, ALTO - 0.26, 0.24, 0x8f969b, eje);
    colliders?.addSegment(x - 0.2, z, x + 0.2, z);
  }
  if (piezas.length) {
    const m = new THREE.Mesh(mergeGeometries(piezas, false), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7 }));
    m.castShadow = m.receiveShadow = true;
    grupo.add(m);
  }
  scene.add(grupo);
  grupo.userData.rotulos = buildRotulosEmpresas(scene, map, ROTULOS, [700, 1030, -600, -270], 'rotulosComisaria').userData.puestos;
  return grupo;
}
