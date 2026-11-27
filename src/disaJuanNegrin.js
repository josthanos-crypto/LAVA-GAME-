import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * (Version 183) La gasolinera DISA pequeña de la calle Doctor Juan Negrín. José Manuel: «es una gasolinera pequeña que
 * tiene todo en medio de la carretera; en realidad es como un triángulo y la gasolinera ahí dentro. Solo se echa
 * gasolina dirección Arrecife por el lado derecho».
 *
 * Está en la isleta alargada en cuña entre Doctor Juan Negrín (al norte) y Blas Cabrera Topham (al sur), desde la calle
 * Doctor Gómez Ulla hacia el este (foto aérea: el edificio estrecho «Estación de Servicio Disa» del mapa). Antes la
 * gasolinera genérica de world.js, de 13 × 8,5 m, caía atravesada encima de las dos calles.
 *
 * Aquí: la isleta con su bordillo, la caseta en la punta ancha (oeste), la marquesina estrecha a lo largo y los dos
 * surtidores del lado de Blas Cabrera Topham, la calle que va hacia el centro de Arrecife, y el tótem de precios en la
 * punta estrecha (este). Medidas sacadas de las calzadas del mapa (lo que queda libre entre las dos calles).
 */

// el eje de la isleta (de la punta ancha, junto a Gómez Ulla, a la estrecha) y su lado hacia Blas Cabrera Topham
const O = [-243.7, 16.7];
const U = [0.773, 0.634], N = [-0.634, 0.773];
const LARGO = 28;
// medio ancho libre de la isleta a lo largo del eje (cada 4 m, medido entre los bordes de las dos calzadas)
const MEDIO = [3.8, 4.8, 4.6, 4.2, 3.7, 3.3, 2.9, 2.4];
const medio = (s) => {
  const k = Math.max(0, Math.min(MEDIO.length - 1.001, s / 4));
  const i = Math.floor(k);
  return MEDIO[i] + (MEDIO[i + 1] - MEDIO[i]) * (k - i) - 0.3;
};
const W = (s, l) => [O[0] + U[0] * s + N[0] * l, O[1] + U[1] * s + N[1] * l];
const ROJO = 0xd40f1c;

/** quita la gasolinera genérica de aquí y el edificio estrecho del mapa (los pone esta pieza) */
export function tuneDisaJuanNegrin(map) {
  const [cx, cz] = W(LARGO / 2, 0);
  if (map.fuel) map.fuel = map.fuel.filter(f => !(/disa/i.test(f.brand || '') && Math.hypot(f.x - cx, f.z - cz) < 25));
  for (const b of map.buildings || []) {
    if (!b.p?.length || (b.h || 0) > 5) continue;
    const mx = b.p.reduce((s, q) => s + q[0], 0) / b.p.length, mz = b.p.reduce((s, q) => s + q[1], 0) / b.p.length;
    if (Math.hypot(mx - (-238), mz - 22) < 8) b.skip = true;
  }
}

function caja(geos, s, l, y0, ls, ll, h, rot = 0) {
  const g = new THREE.BoxGeometry(ls, h, ll);
  g.translate(0, h / 2 + y0, 0);
  g.rotateY(Math.atan2(N[0], N[1]) + rot);
  const [x, z] = W(s, l);
  g.translate(x, 0, z);
  geos.push(g.index ? g.toNonIndexed() : g);
}

function malla(geos, mat, sombra = true) {
  const m = new THREE.Mesh(mergeGeometries(geos, false), mat);
  m.castShadow = sombra;
  m.receiveShadow = true;
  return m;
}

function totemTex() {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = '#d40f1c'; x.fillRect(0, 0, 128, 256);
  x.fillStyle = '#ffffff'; x.fillRect(8, 8, 112, 90);
  x.fillStyle = '#d40f1c'; x.font = 'bold 34px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText('DISA', 64, 53);
  x.fillStyle = '#111'; x.fillRect(10, 112, 108, 110);
  x.fillStyle = '#ffb21a'; x.font = 'bold 26px "Courier New", monospace';
  x.fillText('1.39', 64, 140); x.fillText('1.02', 64, 190);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildDisaJuanNegrin(scene, colliders) {
  const group = new THREE.Group();
  group.name = 'disaJuanNegrin';
  const Y = 0.14;   // la calzada
  // la isleta: losa de hormigón con su bordillo, siguiendo la cuña
  const pts = [];
  for (let s = 0; s <= LARGO; s += 2) pts.push(W(s, -medio(s)));
  for (let s = LARGO; s >= 0; s -= 2) pts.push(W(s, medio(s)));
  const shape = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  const losa = new THREE.ExtrudeGeometry(shape, { depth: 0.15, bevelEnabled: false });
  losa.rotateX(-Math.PI / 2);
  losa.translate(0, Y, 0);
  group.add(malla([losa], new THREE.MeshStandardMaterial({ color: 0xc9c6bf, roughness: 0.85 }), false));
  const top = Y + 0.15;

  const blanco = [], rojo = [], gris = [], oscuro = [];
  // la caseta en la punta ancha
  caja(blanco, 3.5, 0, top, 5, 5.2, 3.0);
  caja(rojo, 3.5, 0, top + 3.0, 5.2, 5.4, 0.45);
  caja(oscuro, 3.5, medio(3.5) - 1.75, top + 0.2, 3.2, 0.06, 2.0);   // el escaparate, al lado de los surtidores
  // la marquesina estrecha a lo largo, con sus cuatro postes en el medio
  const m0 = 9, m1 = 21, ancho = 5.6;
  caja(blanco, (m0 + m1) / 2, 0.3, top + 4.2, m1 - m0, ancho, 0.45);
  caja(rojo, (m0 + m1) / 2, 0.3, top + 4.0, m1 - m0 + 0.1, ancho + 0.1, 0.25);
  for (const s of [m0 + 1, m1 - 1]) for (const l of [-1.2, 1.2]) caja(gris, s, l, top, 0.28, 0.28, 4.0);
  // los dos surtidores, del lado de Blas Cabrera Topham (la que va hacia el centro de Arrecife)
  const lp = Math.min(medio(12), medio(18)) - 1.2;
  for (const s of [12.5, 17.5]) {
    caja(gris, s, lp, top, 3.4, 1.1, 0.2);
    caja(blanco, s, lp, top + 0.2, 0.9, 0.55, 1.6);
    caja(rojo, s, lp, top + 1.55, 0.92, 0.57, 0.3);
    caja(oscuro, s, lp + 0.02, top + 0.75, 0.5, 0.58, 0.4);
  }
  group.add(malla(blanco, new THREE.MeshStandardMaterial({ color: 0xf2f2ee, roughness: 0.5 })));
  group.add(malla(rojo, new THREE.MeshStandardMaterial({ color: ROJO, roughness: 0.4 })));
  group.add(malla(gris, new THREE.MeshStandardMaterial({ color: 0xbdbdb8, metalness: 0.4, roughness: 0.45 })));
  group.add(malla(oscuro, new THREE.MeshStandardMaterial({ color: 0x15181c, roughness: 0.15, metalness: 0.2 })));
  // la luz de debajo de la marquesina (se ve de noche)
  const luz = new THREE.Mesh(new THREE.PlaneGeometry(m1 - m0 - 0.6, ancho - 0.6),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff4e0, emissiveIntensity: 0.6 }));
  luz.geometry.rotateX(Math.PI / 2);                 // tumbada, mirando hacia abajo
  luz.geometry.rotateY(Math.atan2(N[0], N[1]));      // a lo largo de la isleta
  const [lx, lz] = W((m0 + m1) / 2, 0.3);
  luz.position.set(lx, top + 3.99, lz);
  group.add(luz);
  // el tótem de precios en la punta estrecha, mirando a quien llega por Blas Cabrera Topham
  const tex = totemTex();
  const totem = new THREE.Mesh(new THREE.BoxGeometry(1.3, 3.0, 0.35),
    new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.25, roughness: 0.3 }));
  const [tx, tz] = W(25.5, 0);
  totem.position.set(tx, top + 1.5, tz);
  totem.rotation.y = Math.atan2(-U[0], -U[1]);
  totem.castShadow = true;
  group.add(totem);
  scene.add(group);

  // choques: la caseta, los surtidores y el tótem (la isleta es baja y se puede pisar)
  const rect = (s, l, ls, ll) => {
    const c = [W(s - ls / 2, l - ll / 2), W(s + ls / 2, l - ll / 2), W(s + ls / 2, l + ll / 2), W(s - ls / 2, l + ll / 2)];
    colliders?.addPolygon?.([...c, c[0]]);
  };
  rect(3.5, 0, 5, 5.2);
  for (const s of [12.5, 17.5]) rect(s, lp, 1.0, 0.6);
  rect(25.5, 0, 0.4, 1.3);
  return group;
}
