import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Las tres marquesinas de sombra del aparcamiento del Mercadona de abajo (Version 147).
 *
 * En la ortofoto oficial (PNOA del IGN) se ven tres cubiertas largas y blancas en mitad del aparcamiento, con los
 * coches aparcados debajo. OpenStreetMap las trae como «edificios» y el juego levantaba ahí tres bloques de pisos
 * de 4, 8 y 9 m con sus ventanas y puertas. Aquí se quitan esos bloques y se pone lo que hay de verdad: la cubierta
 * de chapa sobre una fila de pilares en el centro, abierta por los lados, con las plazas pintadas debajo. Se pasa
 * con el coche por debajo; solo chocan los pilares.
 *
 * Coordenadas del juego: x = (lon + 13,55) · 97398, z = (28,9625 − lat) · 111320.
 */

// el centro de cada una en el mapa (para reconocer su bloque)
const CENTROS = [[-1112, -1083.5], [-1098, -1091.5], [-1084.5, -1099]];
const ALTO = 3.3, PLAZA = 2.5;

const centroDe = (p) => {
  const n = p.length - (p[0][0] === p[p.length - 1][0] && p[0][1] === p[p.length - 1][1] ? 1 : 0);
  let x = 0, z = 0;
  for (let i = 0; i < n; i++) { x += p[i][0]; z += p[i][1]; }
  return [x / n, z / n];
};

/** retoques al mapa antes de levantar la ciudad: fuera los tres bloques de pisos */
export function tuneMarquesinasMercadona(map) {
  for (const b of map.buildings || []) {
    if (!b.p || b.p.length < 4 || b.p.length > 6) continue;
    const [cx, cz] = centroDe(b.p);
    if (CENTROS.some(([x, z]) => Math.hypot(cx - x, cz - z) < 6)) { b.skip = true; b.marquesinaMercadona = true; }
  }
}

export function buildMarquesinasMercadona(scene, colliders, map) {
  const grupo = new THREE.Group();
  grupo.name = 'marquesinasMercadona';
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
  let plazas = 0;
  for (const b of map.buildings || []) {
    if (!b.marquesinaMercadona) continue;
    const pts = b.p.slice(0, 4);
    // el eje largo y el ancho
    const lado = (i) => { const a = pts[i], c = pts[(i + 1) % 4]; return Math.hypot(c[0] - a[0], c[1] - a[1]); };
    const i0 = lado(0) > lado(1) ? 0 : 1;
    const a = pts[i0], c = pts[(i0 + 1) % 4], largo = lado(i0), ancho = lado((i0 + 1) % 4);
    const d = [(c[0] - a[0]) / largo, (c[1] - a[1]) / largo];
    const [cx, cz] = centroDe(b.p);
    const P = (s, t) => [cx + d[0] * s - d[1] * t, cz + d[1] * s + d[0] * t];
    // la cubierta, en tramos de 5 m para que siga el suelo, con su canto y la viga del centro
    const n = Math.max(1, Math.round(largo / 5)), tr = largo / n;
    for (let k = 0; k < n; k++) {
      const s = -largo / 2 + (k + 0.5) * tr, [x, z] = P(s, 0);
      caja(x, ALTO, z, tr + 0.02, 0.12, ancho, 0xeef0f0, d);
      caja(x, ALTO - 0.28, z, tr + 0.02, 0.28, 0.3, 0x9aa1a6, d);
      for (const t of [-ancho / 2, ancho / 2]) { const [ex, ez] = P(s, t); caja(ex, ALTO - 0.1, ez, tr + 0.02, 0.24, 0.1, 0xc9ced1, d); }
    }
    // los pilares del centro, cada dos plazas
    for (let s = -largo / 2 + 1.2; s <= largo / 2 - 1; s += PLAZA * 2) {
      const [x, z] = P(s, 0);
      caja(x, 0, z, 0.26, ALTO - 0.28, 0.26, 0x8f969b, d);
      colliders?.addSegment(...P(s - 0.2, 0), ...P(s + 0.2, 0));
    }
    // las plazas de debajo: rayas a los dos lados y la del centro
    for (let s = -largo / 2 + 0.3; s <= largo / 2 - 0.2; s += PLAZA) {
      for (const lado2 of [-1, 1]) { const [x, z] = P(s, lado2 * ancho / 4); caja(x, 0.13, z, 0.1, 0.012, ancho / 2 - 0.3, 0xeceae2, d); }
      plazas += 2;
    }
  }
  if (piezas.length) {
    const m = new THREE.Mesh(mergeGeometries(piezas, false), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7 }));
    m.castShadow = m.receiveShadow = true;
    grupo.add(m);
  }
  grupo.userData.plazas = plazas;
  scene.add(grupo);
  return grupo;
}
