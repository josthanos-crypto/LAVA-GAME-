import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { cinta, malla } from './puenteRayas.js';

/**
 * El bazar de la esquina de la carretera de San Bartolomé con la calle Tomás Morales (Argana Alta), frente al
 * Centro Comercial de Argana (Version 136, pedido por José Manuel: «pasando la carretera, haciendo esquina, está
 * una de las tiendas de chinos»).
 *
 * En la foto aérea (PNOA) hay ahí una nave de cubierta oscura, de unos 21 × 18 m, pegada a la fábrica Dos Cabras,
 * con coches aparcados delante. En el mapa de OpenStreetMap no venía, así que en el juego la esquina estaba vacía.
 *
 * Se levanta la nave en su sitio: paredes claras, cubierta oscura, la banda roja del rótulo en las dos caras que
 * dan a la calle, el escaparate con la puerta y las plazas de delante.
 *
 * EL NOMBRE NO ESTÁ CONFIRMADO: José Manuel cree que se llama «Seco Hogar», pero no está seguro y no se ha podido
 * comprobar. El rótulo dice solo «BAZAR» y lo que vende. Cuando lo confirme, se cambia en NOMBRE.
 *
 * Coordenadas del juego: x = (lon + 13,55) · 97398, z = (28,9625 − lat) · 111320.
 */

const NOMBRE = 'BAZAR';                     // el nombre de verdad, cuando se confirme
const LEMA = 'HOGAR · MENAJE · JUGUETES · PAPELERÍA · FERRETERÍA';

// la planta, medida sobre la foto aérea (la cara de la calle Tomás Morales, 2 m metida para dejar la acera)
const PLANTA = [[-1532.9, -1029.6], [-1518.2, -1044.4], [-1505.4, -1032.5], [-1519.6, -1017.0]];
const CARRETERA = 1, CALLE = 2;             // los lados que dan a la carretera y a la calle
const ALTO = 6.5;

function lienzo(w, h, pinta) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  pinta(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** la banda del rótulo: roja, con el nombre en amarillo y lo que vende en blanco */
function rotulo(largo) {
  return lienzo(Math.round(largo * 48), 72, (c, w, h) => {
    c.fillStyle = '#c8102e'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#ffd400'; c.fillRect(0, h - 5, w, 5);
    c.textBaseline = 'middle';
    c.fillStyle = '#ffd400'; c.font = 'bold 54px Arial, Helvetica, sans-serif'; c.textAlign = 'left';
    c.fillText(NOMBRE, 22, h / 2 + 1);
    const x0 = 22 + c.measureText(NOMBRE).width + 30;
    c.fillStyle = '#ffffff'; c.font = 'bold 26px Arial, Helvetica, sans-serif';
    let texto = LEMA;
    while (texto.length > 6 && c.measureText(texto).width > w - x0 - 16) texto = texto.slice(0, texto.lastIndexOf(' · '));
    c.fillText(texto, x0, h / 2 + 2);
  });
}

/** el escaparate: cristal con lo que se ve dentro (estanterías de colores), sin marcas */
function escaparate(largo, puerta) {
  return lienzo(Math.round(largo * 40), 128, (c, w, h) => {
    c.fillStyle = '#2b3740'; c.fillRect(0, 0, w, h);
    const colores = ['#e0452f', '#f2b705', '#2f8fd0', '#3aa655', '#d86aa8', '#f4f1e8', '#f28c28', '#7a5cc0'];
    let k = 7;
    for (let y = 18; y < h - 26; y += 26) {
      c.fillStyle = '#56606a'; c.fillRect(0, y + 20, w, 3);
      for (let x = 4; x < w - 4; x += 14) { k = (k * 31 + 11) % 97; c.fillStyle = colores[k % colores.length]; c.fillRect(x, y + 20 - 8 - (k % 9), 10, 8 + (k % 9)); }
    }
    c.fillStyle = 'rgba(255,255,255,.10)'; c.fillRect(0, 0, w, h * 0.35);
    c.fillStyle = '#d9dcde';
    for (let x = 0; x <= w; x += w / Math.max(2, Math.round(largo / 2.4))) c.fillRect(Math.min(w - 4, x - 2), 0, 4, h);
    c.fillRect(0, 0, w, 5); c.fillRect(0, h - 8, w, 8);
    if (puerta) {
      const px = w * 0.5 - 44;
      c.fillStyle = '#1d262d'; c.fillRect(px, 8, 88, h - 8);
      c.fillStyle = '#d9dcde'; c.fillRect(px - 3, 4, 4, h); c.fillRect(px + 87, 4, 4, h); c.fillRect(px + 42, 8, 4, h);
      c.fillStyle = '#ffd400'; c.fillRect(px + 30, h * 0.5, 8, 4); c.fillRect(px + 50, h * 0.5, 8, 4);
    }
  });
}

export function buildBazarArgana(scene, colliders) {
  const grupo = new THREE.Group();
  grupo.name = 'bazarArgana';
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
  const cartel = (x, y, z, w, h, n, tex, brilla = 0) => {
    const g = new THREE.PlaneGeometry(w, h);
    g.rotateY(Math.atan2(n[0], n[1]));
    g.translate(x, y, z);
    grupo.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: brilla })));
  };

  let area = 0;
  for (let i = 0; i < 4; i++) { const a = PLANTA[i], b = PLANTA[(i + 1) % 4]; area += a[0] * b[1] - b[0] * a[1]; }
  const fuera = area >= 0 ? 1 : -1;
  const rayas = [];
  for (let i = 0; i < 4; i++) {
    const a = PLANTA[i], b = PLANTA[(i + 1) % 4], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const d = [(b[0] - a[0]) / len, (b[1] - a[1]) / len], n = [fuera * d[1], -fuera * d[0]];
    const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
    const F = (f, al = 0) => [mx + n[0] * f + d[0] * al, mz + n[1] * f + d[1] * al];
    caja(...[F(-0.1)[0], 0, F(-0.1)[1]], len, ALTO, 0.2, 0xe9e8e3, d);                     // la pared
    caja(F(0.02)[0], 0, F(0.02)[1], len + 0.1, 0.45, 0.24, 0x7d8286, d);                   // el zócalo
    caja(F(0.02)[0], ALTO - 0.25, F(0.02)[1], len + 0.3, 0.3, 0.3, 0x4a4d51, d);           // el remate
    colliders?.addSegment(a[0], a[1], b[0], b[1]);
    if (i !== CARRETERA && i !== CALLE) continue;
    // la banda del rótulo y el escaparate, en las dos caras que dan a la calle
    cartel(F(0.03)[0], ALTO - 1.15, F(0.03)[1], len - 0.6, 1.5, n, rotulo(len - 0.6), 0.25);
    const ancho = i === CARRETERA ? len - 3 : len - 7;
    cartel(F(0.04)[0], 1.85, F(0.04)[1], ancho, 2.9, n, escaparate(ancho, i === CARRETERA), 0.06);
    if (i === CARRETERA) {
      caja(F(1.3)[0], 3.45, F(1.3)[1], 5.2, 0.16, 2.6, 0xc8102e, d);                       // la marquesina de la puerta
      // las plazas de delante: seis rayas en batería
      for (let k = -3; k <= 3; k++) {
        const p0 = F(0.9, k * 2.5), p1 = F(5.6, k * 2.5);
        cinta(rayas, [p0, [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], p1], () => 0.125, 0.05, false);
      }
    }
  }
  // la cubierta oscura, como en la foto aérea, con dos máquinas de aire
  {
    const forma = new THREE.Shape(PLANTA.map(([x, z]) => new THREE.Vector2(x, z)));
    const g = new THREE.ShapeGeometry(forma);
    g.rotateX(Math.PI / 2);
    g.translate(0, ALTO - 0.12, 0);
    const techo = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0x3f4347, roughness: 0.9, side: THREE.DoubleSide }));
    techo.receiveShadow = true;
    grupo.add(techo);
    const cx = PLANTA.reduce((s, p) => s + p[0], 0) / 4, cz = PLANTA.reduce((s, p) => s + p[1], 0) / 4;
    caja(cx + 3, ALTO - 0.1, cz + 2, 2.2, 0.9, 1.4, 0xb9bcb8, [0.707, 0.707]);
    caja(cx - 4, ALTO - 0.1, cz - 1, 1.6, 0.7, 1.2, 0xb9bcb8, [0.707, 0.707]);
  }
  const m = new THREE.Mesh(mergeGeometries(piezas, false), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75 }));
  m.castShadow = m.receiveShadow = true;
  grupo.add(m);
  const mr = malla(rayas, new THREE.MeshStandardMaterial({ color: 0xeceae2, roughness: 0.85, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  if (mr) { mr.name = 'bazarArganaPlazas'; grupo.add(mr); }
  scene.add(grupo);
  return grupo;
}
