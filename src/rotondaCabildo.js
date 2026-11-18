import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * (Version 160) La rotonda grande de entrada a Arrecife, junto al Cabildo (donde se juntan la Rambla Medular, Manolo
 * Millares y la LZ-2), como en la captura de Street View de José Manuel (`recursos\SUBIDA EL CAVILDO`) y la ortofoto
 * del IGN: una isleta de picón negro de 75 m de ancho, sin escultura, con tres palmeras juntas al norte y tres
 * corros de matas bajas. No venía en la lista de rotondas (places.js), así que el centro era solo la foto del suelo.
 *
 *  - `tuneRotondaCabildo(map)`: las tres palmeras (`map.extraPalms`, las planta el mundo).
 *  - `buildRotondaCabildo(scene)`: el bordillo, el picón y las matas. No choca: se puede cruzar por encima.
 */
const C = [-1217, 362], RI = 37.6, TOP = 0.3;
const PALMERAS = [[-1231.3, 345.5, 6.4], [-1221.3, 345.5, 5.6], [-1214.5, 340, 7]];
// corros de matas: centro y medio ancho a lo largo de x y de z
const MATAS = [[-1231, 372.5, 9, 6.5], [-1216, 380, 5, 4.5], [-1195, 359, 5, 8.5]];

const hash = (n) => { const v = Math.sin(n * 78.233 + 9.1) * 43758.5453; return v - Math.floor(v); };

export function tuneRotondaCabildo(map) {
  map.extraPalms = map.extraPalms || [];
  const hay = [...(map.trees || []), ...map.extraPalms];
  PALMERAS.forEach(([x, z, h], i) => {
    if (!hay.some(t => Math.hypot(t[0] - x, t[1] - z) < 4)) map.extraPalms.push([x, z, h, i * 1.7]);
  });
}

function picon() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#2b2725'; g.fillRect(0, 0, 256, 256);
  const tonos = ['#1b1816', '#3a3431', '#453b35', '#141110', '#4f3528'];
  for (let k = 0; k < 2600; k++) {
    g.fillStyle = tonos[Math.floor(hash(k) * tonos.length)];
    g.fillRect(hash(k + 0.3) * 256, hash(k + 0.7) * 256, 1 + hash(k + 0.9) * 2.2, 1 + hash(k + 0.5) * 2.2);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildRotondaCabildo(scene) {
  const group = new THREE.Group();
  group.name = 'rotondaCabildo';
  const [cx, cz] = C;
  // el picón: anillos de 5 m para que siga el terreno
  const disco = new THREE.RingGeometry(0.01, RI - 0.3, 56, 8);
  disco.rotateX(-Math.PI / 2);
  disco.translate(cx, TOP - 0.01, cz);
  const p = disco.getAttribute('position'), uv = disco.getAttribute('uv');
  for (let k = 0; k < p.count; k++) uv.setXY(k, p.getX(k) / 3, p.getZ(k) / 3);
  const suelo = new THREE.Mesh(disco, new THREE.MeshStandardMaterial({ map: picon(), roughness: 0.97 }));
  suelo.receiveShadow = true;
  group.add(suelo);
  // el bordillo de hormigón y su cara de arriba
  const bordillo = new THREE.CylinderGeometry(RI, RI + 0.04, TOP + 0.1, 72, 1, true);
  bordillo.translate(cx, (TOP - 0.1) / 2, cz);
  const labio = new THREE.RingGeometry(RI - 0.34, RI, 72, 1);
  labio.rotateX(-Math.PI / 2);
  labio.translate(cx, TOP + 0.005, cz);
  const gris = new THREE.Mesh(mergeGeometries([bordillo, labio].map(g => g.toNonIndexed()), false), new THREE.MeshStandardMaterial({ color: 0xcfcbc1, roughness: 0.9 }));
  gris.receiveShadow = true;
  group.add(gris);
  // las matas bajas (verde apagado, como se ven desde la carretera)
  const matas = [], color = new THREE.Color();
  MATAS.forEach(([mx, mz, ax, az], i) => {
    const n = Math.round(ax * az * 0.34);
    for (let k = 0; k < n; k++) {
      const a = hash(i * 31 + k) * Math.PI * 2, d = Math.sqrt(hash(i * 17 + k * 1.3));
      const s = 0.35 + hash(i * 7 + k * 2.1) * 0.55;
      const g = new THREE.IcosahedronGeometry(s, 1);
      g.scale(1.25, 0.6, 1.25);
      g.translate(mx + Math.cos(a) * d * ax, TOP + s * 0.32, mz + Math.sin(a) * d * az);
      color.set([0x6f7a3c, 0x7d8545, 0x5c6a34, 0x8a8a52][k % 4]).multiplyScalar(0.85 + hash(k * 3.7 + i) * 0.3);
      const n3 = g.getAttribute('position').count, col = new Float32Array(n3 * 3);
      for (let v = 0; v < n3; v++) col.set([color.r, color.g, color.b], v * 3);
      g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      matas.push(g);
    }
  });
  const verde = new THREE.Mesh(mergeGeometries(matas, false), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }));
  verde.castShadow = true;
  verde.receiveShadow = true;
  group.add(verde);
  scene.add(group);
  return group;
}
