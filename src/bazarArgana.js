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

// (Version 155) En el vídeo del recorrido de José Manuel (recursos, IMG_5153, fotograma 39) esta nave, la de al lado
// de Dos Cabras, es MultiMotor: fachada gris oscura con cristalera, el nombre en rojo y la banda naranja
// «COMPRAMOS TU COCHE PAGO INMEDIATO». La tienda de hogar que él recordaba es Deko Hogar (ccArgana.js).
const NOMBRE = 'MultiMotor';
const LEMA = 'COMPRAMOS TU COCHE · PAGO INMEDIATO';
const WEB = 'multimotor.net';

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

/** la banda del rótulo: gris oscura con el nombre en rojo, la web debajo y, a la derecha, el bloque naranja */
function rotulo(largo) {
  return lienzo(Math.round(largo * 48), 96, (c, w, h) => {
    c.fillStyle = '#3c4148'; c.fillRect(0, 0, w, h);
    c.textBaseline = 'middle'; c.textAlign = 'left';
    c.fillStyle = '#e3262b'; c.font = 'bold 50px Arial, Helvetica, sans-serif';
    c.fillText(NOMBRE, 22, h * 0.36);
    c.fillStyle = '#ffffff'; c.font = 'bold 24px Arial, Helvetica, sans-serif';
    c.fillText(WEB, 60, h * 0.8);
    const x0 = Math.max(w * 0.52, 22 + 300);
    c.fillStyle = '#f0832a'; c.fillRect(x0, 0, w - x0, h * 0.62);
    c.fillStyle = '#ffffff'; c.font = 'bold 22px Arial, Helvetica, sans-serif'; c.textAlign = 'center';
    const [l1, l2] = LEMA.split(' · ');
    c.fillText(l1, (x0 + w) / 2, h * 0.2); c.fillText(l2, (x0 + w) / 2, h * 0.44);
  });
}

/** la cristalera de la exposición: cristal oscuro con los coches de dentro (siluetas, sin marcas) */
function escaparate(largo, puerta) {
  return lienzo(Math.round(largo * 40), 128, (c, w, h) => {
    c.fillStyle = '#27313a'; c.fillRect(0, 0, w, h);
    const colores = ['#d8dbde', '#9aa3ab', '#b23a32', '#2f4f7a', '#e6e2d6'];
    for (let x = 30, k = 0; x < w - 150; x += 190, k++) {
      c.fillStyle = colores[k % colores.length];
      c.beginPath(); c.roundRect(x, h - 58, 150, 30, 10); c.fill();
      c.beginPath(); c.roundRect(x + 30, h - 80, 86, 28, 12); c.fill();
      c.fillStyle = '#12171c'; c.beginPath(); c.arc(x + 34, h - 26, 12, 0, 7); c.arc(x + 118, h - 26, 12, 0, 7); c.fill();
    }
    c.fillStyle = 'rgba(255,255,255,.10)'; c.fillRect(0, 0, w, h * 0.35);
    c.fillStyle = '#d9dcde';
    for (let x = 0; x <= w; x += w / Math.max(2, Math.round(largo / 2.4))) c.fillRect(Math.min(w - 4, x - 2), 0, 4, h);
    c.fillRect(0, 0, w, 5); c.fillRect(0, h - 8, w, 8);
    if (puerta) {
      const px = w * 0.5 - 44;
      c.fillStyle = '#1d262d'; c.fillRect(px, 8, 88, h - 8);
      c.fillStyle = '#d9dcde'; c.fillRect(px - 3, 4, 4, h); c.fillRect(px + 87, 4, 4, h); c.fillRect(px + 42, 8, 4, h);
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
    caja(...[F(-0.1)[0], 0, F(-0.1)[1]], len, ALTO, 0.2, (i === CARRETERA || i === CALLE) ? 0x4a4f56 : 0xe9e8e3, d);                     // la pared
    caja(F(0.02)[0], 0, F(0.02)[1], len + 0.1, 0.45, 0.24, 0x7d8286, d);                   // el zócalo
    caja(F(0.02)[0], ALTO - 0.25, F(0.02)[1], len + 0.3, 0.3, 0.3, 0x4a4d51, d);           // el remate
    colliders?.addSegment(a[0], a[1], b[0], b[1]);
    if (i !== CARRETERA && i !== CALLE) continue;
    // la banda del rótulo y el escaparate, en las dos caras que dan a la calle
    cartel(F(0.03)[0], ALTO - 1.35, F(0.03)[1], len - 0.6, 2.0, n, rotulo(len - 0.6), 0.25);
    const ancho = i === CARRETERA ? len - 3 : len - 7;
    cartel(F(0.04)[0], 1.85, F(0.04)[1], ancho, 2.9, n, escaparate(ancho, i === CARRETERA), 0.06);
    if (i === CARRETERA) {
      caja(F(1.3)[0], 3.45, F(1.3)[1], 5.2, 0.16, 2.6, 0x3c4148, d);                       // la marquesina de la puerta
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
