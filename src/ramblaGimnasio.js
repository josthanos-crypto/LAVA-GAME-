import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Las máquinas de hacer deporte del paseo de la Rambla Medular (Version 149).
 *
 * José Manuel: «la rambla tiene árboles y algunas máquinas para que la gente haga deporte». Son los aparatos de
 * gimnasia al aire libre (los amarillos y verdes de los parques): aquí van seis grupos repartidos a lo largo del
 * paseo, entre los árboles, cada uno con su suelo de caucho y cuatro aparatos (el volante, el de andar, el banco
 * de abdominales y las barras). EL SITIO DE CADA GRUPO NO ES EL REAL: se reparten solos a lo largo de la Rambla.
 * Cuando José Manuel diga dónde están de verdad, se cambian en `SITIOS`.
 */

const GRUPOS = 6;
/** si se sabe dónde están de verdad: [[x, z], …] (el grupo se pone en el punto del paseo más cercano) */
const SITIOS = [];

const AMARILLO = 0xe9b81c, VERDE = 0x2f8a4a, GRIS = 0x8a9096, CAUCHO = 0x8f4638, NEGRO = 0x2a2c2e;

export function buildRamblaGimnasio(scene, colliders, centros) {
  const grupo = new THREE.Group();
  grupo.name = 'ramblaGimnasio';
  if (!centros?.length) { scene.add(grupo); return grupo; }
  const elegidos = SITIOS.length
    ? SITIOS.map(([x, z]) => centros.reduce((m, c) => (Math.hypot(c[0] - x, c[1] - z) < Math.hypot(m[0] - x, m[1] - z) ? c : m)))
    : Array.from({ length: GRUPOS }, (_, k) => centros[Math.floor(centros.length * (k + 0.5) / GRUPOS)]);
  const piezas = [];
  const color = (g, c) => {
    const k = new THREE.Color(c), n = g.getAttribute('position').count, col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { col[i * 3] = k.r; col[i * 3 + 1] = k.g; col[i * 3 + 2] = k.b; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  };
  for (const [cx, cz, ux, uz, libre] of elegidos) {
    // a un lado del paseo, entre dos árboles
    const lado = Math.min(libre - 1.2, 3.6), ox = cx + ux * 4.25 - uz * lado, oz = cz + uz * 4.25 + ux * lado;
    const giro = Math.atan2(-uz, ux);
    /** una pieza en coordenadas del grupo: s a lo largo del paseo, t de través */
    const poner = (g, s, y, t, c) => {
      const ng = g.index ? g.toNonIndexed() : g;
      ng.deleteAttribute('uv');
      ng.rotateY(giro);
      ng.translate(ox + ux * s - uz * t, y, oz + uz * s + ux * t);
      piezas.push(color(ng, c));
    };
    const tubo = (s, t, h, r = 0.05, c = AMARILLO, y0 = 0.14) => poner(new THREE.CylinderGeometry(r, r, h, 6), s, y0 + h / 2, t, c);
    const barra = (s, t, y, largo, c = AMARILLO, alo = true) => { const g = new THREE.CylinderGeometry(0.035, 0.035, largo, 6); g.rotateZ(Math.PI / 2); if (!alo) g.rotateY(Math.PI / 2); poner(g, s, y, t, c); };
    // el suelo de caucho
    poner(new THREE.BoxGeometry(7.4, 0.04, 2.6), 0, 0.14, 0, CAUCHO);
    // 1) el volante: un poste con dos ruedas
    tubo(-2.8, 0, 1.5, 0.07);
    for (const t of [-0.32, 0.32]) { const g = new THREE.TorusGeometry(0.3, 0.035, 5, 14); g.rotateY(Math.PI / 2); poner(g, -2.8 + 0, 1.35, t, VERDE); }
    // 2) el de andar: dos postes, la barra de las manos y los dos pedales colgando
    for (const t of [-0.45, 0.45]) tubo(-1.0, t, 1.35, 0.06);
    barra(-1.0, 0, 1.45, 0.9, AMARILLO, false);
    for (const t of [-0.22, 0.22]) { tubo(-1.0, t, 0.95, 0.03, VERDE, 0.42); poner(new THREE.BoxGeometry(0.42, 0.05, 0.16), -1.0, 0.42, t, NEGRO); }
    // 3) el banco de abdominales: el tablero inclinado y los rodillos de los pies
    { const g = new THREE.BoxGeometry(1.5, 0.07, 0.42); g.rotateZ(0.32); poner(g, 0.9, 0.5, 0, VERDE); }
    tubo(0.25, 0, 0.3, 0.05, GRIS); tubo(1.55, 0, 0.75, 0.05, GRIS);
    barra(1.6, 0, 0.92, 0.6, NEGRO, false);
    // 4) las barras: un marco con dos alturas
    for (const [s, h] of [[2.3, 2.1], [3.3, 2.1], [3.3 + 0.0, 2.1]]) tubo(s, -0.5, h, 0.06);
    tubo(2.3, 0.5, 1.4, 0.06); tubo(3.3, 0.5, 1.4, 0.06);
    barra(2.8, -0.5, 2.1, 1.0, GRIS); barra(2.8, 0.5, 1.35, 1.0, GRIS);
    // el cartel de uso: un poste con una placa
    tubo(-3.5, -1.0, 1.4, 0.04, GRIS);
    poner(new THREE.BoxGeometry(0.5, 0.36, 0.03), -3.5, 1.45, -1.0, 0xf2f2ee);
    // los choques: los postes gordos
    for (const s of [-2.8, -1.0, 2.3, 3.3]) { const x = ox + ux * s, z = oz + uz * s; colliders?.addSegment(x - 0.25, z, x + 0.25, z); }
  }
  const m = new THREE.Mesh(mergeGeometries(piezas, false), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, metalness: 0.15 }));
  m.castShadow = m.receiveShadow = true;
  grupo.add(m);
  grupo.userData.sitios = elegidos.map(c => [Math.round(c[0]), Math.round(c[1])]);
  scene.add(grupo);
  return grupo;
}
