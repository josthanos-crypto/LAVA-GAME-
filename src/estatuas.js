import * as THREE from 'three';
import { buildHuman } from './humanModel.js';

/**
 * Estatuas de la calle. La de Heraclio Niz Mesa, «el Pollo de Arrecife»: de
 * bronce verdoso, a tamaño natural y sin peana, en el tramo final de la Calle
 * Real (León y Castillo), unos 25 m calle adentro desde la avenida, pegada a
 * la acera de levante (sitio marcado por José Manuel). Gorra de plato,
 * guerrera abrochada con cinturón y bolsillos, riéndose, con el brazo
 * derecho tendido y el izquierdo caído; la placa negra en el suelo.
 */

export const POLLO = [174.9, 429.7];
// mira hacia el centro de la calle (al oeste-suroeste)
const FACE = Math.atan2(-0.93, 0.367);

const LOOK = {
  sex: 'm', skin: 0xc8916c, hair: 0x37302b, hairStyle: 'short', beard: false, eyes: 0x3a2616,
  top: 0x55605a, topStyle: 'long', bottom: 0x55605a, bottomStyle: 'pants', belt: null,
  shoes: 0x202020, shoeStyle: 'shoe', height: 1.72, build: 1.45, detail: 2,
};

const PATINA = 0x4f9a86;

/** la guerrera, el cinturón, los bolsillos, el cuello alto y la gorra (en medidas del muñeco, sin escalar) */
function uniform(group, mat) {
  const add = (g, x, y, z, rx = 0, ry = 0) => {
    const m = new THREE.Mesh(g, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, 0);
    m.castShadow = true;
    group.add(m);
    return m;
  };
  // faldón de la guerrera hasta medio muslo y el cinturón
  const skirt = add(new THREE.CylinderGeometry(0.245, 0.262, 0.2, 20, 1, true), 0, 0.95, 0);
  skirt.scale.set(1, 1, 0.62);
  const belt = add(new THREE.CylinderGeometry(0.247, 0.247, 0.055, 20), 0, 1.04, 0);
  belt.scale.set(1, 1, 0.6);
  add(new THREE.BoxGeometry(0.07, 0.06, 0.02), 0, 1.04, 0.15);
  // bolsillos de pecho y del faldón, con su tapa
  for (const s of [-1, 1]) {
    add(new THREE.BoxGeometry(0.095, 0.105, 0.018), s * 0.095, 1.27, 0.145);
    add(new THREE.BoxGeometry(0.105, 0.03, 0.026), s * 0.095, 1.325, 0.146);
    add(new THREE.BoxGeometry(0.12, 0.12, 0.02), s * 0.13, 0.94, 0.165);
    add(new THREE.BoxGeometry(0.13, 0.03, 0.028), s * 0.13, 1.005, 0.166);
  }
  // botones de la tapeta
  for (const y of [1.12, 1.2, 1.28, 1.36]) add(new THREE.SphereGeometry(0.011, 6, 4), 0, y, 0.152);
  // cuello alto
  add(new THREE.CylinderGeometry(0.068, 0.075, 0.055, 14), 0, 1.475, 0.005);
  // gorra de plato: copa, cinta, visera y escudo
  const crown = add(new THREE.CylinderGeometry(0.125, 0.11, 0.085, 20), 0, 1.75, 0.0);
  crown.scale.set(1, 1, 1.1);
  const band = add(new THREE.CylinderGeometry(0.111, 0.111, 0.03, 20), 0, 1.712, 0.0);
  band.scale.set(1, 1, 1.1);
  const visor = add(new THREE.CylinderGeometry(0.1, 0.1, 0.012, 16, 1, false, -Math.PI / 2, Math.PI), 0, 1.703, 0.07, 0.28);
  visor.scale.set(1.05, 1, 0.75);
  add(new THREE.CylinderGeometry(0.018, 0.018, 0.01, 10), 0, 1.752, 0.135, Math.PI / 2 - 0.1);
}

/** postura de la estatua: se ríe con el brazo derecho tendido, como enseñando la calle */
function pose(p) {
  p.armR.rotation.set(-0.5, 0, 0.85);
  p.elbowR.rotation.set(-0.65, 0, 0);
  p.armL.rotation.set(0.05, 0, -0.1);
  p.elbowL.rotation.set(-0.2, 0, 0);
  p.legR.rotation.z = 0.06;
  p.legL.rotation.z = -0.06;
  p.spine.rotation.set(-0.04, 0.1, 0);
}

export function buildEstatuas(scene, colliders) {
  const group = new THREE.Group();
  group.name = 'estatuas';
  const p = buildHuman(LOOK);
  // bronce: los colores del muñeco pasan a grises (claros en la tela, oscuros en zapatos y pelo)
  const c = p.mesh.geometry.getAttribute('color');
  for (let i = 0; i < c.count; i++) {
    const l = 0.2126 * c.getX(i) + 0.7152 * c.getY(i) + 0.0722 * c.getZ(i);
    const v = 0.7 + 0.45 * Math.min(1, l * 1.6);
    c.setXYZ(i, v, v, v);
  }
  c.needsUpdate = true;
  p.mesh.material = new THREE.MeshStandardMaterial({ vertexColors: true, color: PATINA, metalness: 0.35, roughness: 0.36 });
  p.mesh.castShadow = true;
  uniform(p.group, new THREE.MeshStandardMaterial({ color: 0x4a917e, metalness: 0.35, roughness: 0.4 }));
  pose(p);
  p.group.position.set(POLLO[0], 0.14, POLLO[1]);
  p.group.rotation.y = FACE;
  group.add(p.group);
  // la placa negra en el suelo, delante y a su derecha (a la izquierda según se le mira)
  const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.28), new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.35, metalness: 0.4 }));
  const fx = Math.sin(FACE), fz = Math.cos(FACE);
  plaque.position.set(POLLO[0] + fx * 0.9 - fz * 0.55, 0.15, POLLO[1] + fz * 0.9 + fx * 0.55);
  plaque.rotation.y = FACE;
  group.add(plaque);
  const r = 0.4, [x, z] = POLLO;
  colliders.addPolygon([[x - r, z - r], [x + r, z - r], [x + r, z + r], [x - r, z + r], [x - r, z - r]]);
  scene.add(group);
  return group;
}
