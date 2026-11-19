import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { calleRealLayout } from './zones.js';
import { windowGlow } from './realism.js';

/**
 * Calle Real (León y Castillo), según el vídeo de referencia de 2020 (min. 04:45–08:40):
 * adoquín gris de fachada a fachada (como en las fotos de José Manuel), farolas grises con cestas de flores y bancos.
 * Los árboles del eje van con los demás árboles (cityDetail.js). Medidas: aproximación artística.
 */

const PAVE_Y = 0.137;

function slabTexture() {
  // adoquín gris de unos 25 × 12 cm a matajunta, de varios tonos (fotos de José Manuel de la Calle Real y del Pollo)
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#56534f';
  g.fillRect(0, 0, 512, 512);
  let s = 41;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let row = 0; row < 32; row++) {
    const off = row % 2 ? 16 : 0;
    for (let col = -1; col < 16; col++) {
      const x = col * 32 + off, y = row * 16;
      const v = 118 + (r() - 0.5) * 46 + (r() < 0.12 ? 26 : 0);
      g.fillStyle = `rgb(${v},${v - 2},${v - 5})`;
      g.fillRect(x + 1.5, y + 1.5, 29, 13);
      g.fillStyle = 'rgba(255,255,255,0.06)';
      g.fillRect(x + 2, y + 2, 27, 3);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function paving(strips) {
  const pos = [], uv = [];
  const up = (P, Q, R) => ((Q[0] - P[0]) * (R[1] - P[1]) - (Q[1] - P[1]) * (R[0] - P[0])) < 0;
  for (const s of strips) {
    const A = [s.ax + s.nx * s.wl, s.az + s.nz * s.wl], B = [s.bx + s.nx * s.wl, s.bz + s.nz * s.wl];
    const C = [s.bx - s.nx * s.wr, s.bz - s.nz * s.wr], D = [s.ax - s.nx * s.wr, s.az - s.nz * s.wr];
    for (const [P, Q, R] of [[A, B, C], [A, C, D]]) {
      for (const [x, z] of (up(P, Q, R) ? [P, Q, R] : [P, R, Q])) { pos.push(x, PAVE_Y, z); uv.push(x / 4, z / 4); }
    }
  }
  if (!pos.length) return null;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({
    map: slabTexture(), roughness: 0.88, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
  }));
  m.receiveShadow = true;
  return m;
}

/** farola gris de fuste fino con su linterna y una cesta de flores rojas colgada (vídeo 05:00, 06:30, 07:15) */
function lamps(list) {
  if (!list.length) return { meshes: [], mat: null };
  const pole = mergeGeometries([
    new THREE.CylinderGeometry(0.06, 0.09, 4.6, 8).translate(0, 2.3, 0),
    new THREE.CylinderGeometry(0.14, 0.18, 0.2, 8).translate(0, 0.1, 0),
    new THREE.CylinderGeometry(0.03, 0.03, 0.7, 6).rotateZ(Math.PI / 2).translate(0.32, 3.2, 0),
  ]);
  const head = new THREE.CylinderGeometry(0.2, 0.12, 0.42, 8).translate(0, 4.75, 0);
  const basket = new THREE.SphereGeometry(0.32, 10, 8).scale(1, 0.7, 1).translate(0.62, 2.95, 0);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x8a8f94, roughness: 0.5, metalness: 0.5 });
  const headMat = new THREE.MeshStandardMaterial({ color: 0xeeeae0, emissive: 0xffd9a0, emissiveIntensity: 0, roughness: 0.4 });
  const flowerMat = new THREE.MeshStandardMaterial({ color: 0xc8312a, roughness: 0.85 });
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), upv = new THREE.Vector3(0, 1, 0), one = new THREE.Vector3(1, 1, 1);
  const meshes = [[pole, poleMat], [head, headMat], [basket, flowerMat]].map(([geo, mat]) => {
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach(([x, z], i) => {
      q.setFromAxisAngle(upv, (i * 2.399) % (Math.PI * 2));
      im.setMatrixAt(i, m.compose(new THREE.Vector3(x, PAVE_Y, z), q, one));
    });
    im.castShadow = true;
    return im;
  });
  return { meshes, mat: headMat };
}

/** banco de listones de madera con patas de fundición */
function benches(list) {
  if (!list.length) return [];
  const wood = [], iron = [];
  for (const y of [0.45, 0.48]) wood.push(new THREE.BoxGeometry(1.8, 0.04, 0.12).translate(0, y, y === 0.45 ? -0.12 : 0.04));
  wood.push(new THREE.BoxGeometry(1.8, 0.04, 0.12).translate(0, 0.47, 0.2));
  for (const y of [0.65, 0.8]) wood.push(new THREE.BoxGeometry(1.8, 0.1, 0.03).translate(0, y, 0.3));
  for (const x of [-0.75, 0.75]) iron.push(new THREE.BoxGeometry(0.06, 0.85, 0.5).translate(x, 0.42, 0.08));
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), upv = new THREE.Vector3(0, 1, 0), one = new THREE.Vector3(1, 1, 1);
  return [[mergeGeometries(wood), 0x7a5232], [mergeGeometries(iron), 0x2a2c2e]].map(([geo, hex]) => {
    const im = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: hex, roughness: 0.8, metalness: hex === 0x2a2c2e ? 0.5 : 0 }), list.length);
    list.forEach(([x, z, ry], i) => {
      q.setFromAxisAngle(upv, ry + Math.PI / 2);
      im.setMatrixAt(i, m.compose(new THREE.Vector3(x, PAVE_Y, z), q, one));
    });
    im.castShadow = true;
    return im;
  });
}

export function buildCalleReal(scene, map) {
  const lay = calleRealLayout(map);
  if (!lay.strips.length) return null;
  const group = new THREE.Group();
  group.name = 'calleReal';
  const pave = paving(lay.strips);
  if (pave) group.add(pave);
  const L = lamps(lay.lamps);
  for (const m of L.meshes) group.add(m);
  for (const m of benches(lay.benches)) group.add(m);
  scene.add(group);
  return {
    group,
    counts: { strips: lay.strips.length, trees: lay.trees.length, lamps: lay.lamps.length, benches: lay.benches.length },
    update() { if (L.mat) L.mat.emissiveIntensity = windowGlow.value * 5; },
  };
}
