import * as THREE from 'three';

/**
 * (Version 168) Los dos contenedores de la entrada del parking de los médicos del Hospital Insular, como en la
 * captura de Look Around del 23-11-2026 (PC de Arrecife, `Downloads\recursos lava game 2026-11-23\centro`, foto
 * 0765 «Calle Juan de Quesada», mirando al norte): a la derecha de la entrada, en la acera del chaflán, uno verde
 * de tapa redondeada y otro gris oscuro. Chocan (son dos cajas pequeñas fuera de los carriles).
 * El buzón amarillo, el cartel y las isletas rojas y blancas de esa foto ya estaban (hospitalInsular.js y
 * parkingMedicos.js). Los bolardos verdes no se ponen: caerían en el carril de salida del parking del juego.
 */

// [x, z, color, ancho, alto]
const CONTENEDORES = [
  [780.8, -116.3, 0x2f8f58, 1.25, 1.35],
  [779.5, -115.5, 0x3d4046, 1.15, 1.15],
];
const GIRO = Math.atan2(0.84, -0.54);   // a lo largo del chaflán de la acera

export function buildContenedoresHospital(scene, colliders) {
  const grupo = new THREE.Group();
  grupo.name = 'contenedoresHospital';
  for (const [x, z, color, ancho, alto] of CONTENEDORES) {
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
    const caja = new THREE.Mesh(new THREE.BoxGeometry(ancho, alto, ancho * 0.85), mat);
    caja.position.set(0, 0.14 + alto / 2, 0);
    // la tapa: medio cilindro tumbado, con la panza hacia arriba
    const tapa = new THREE.Mesh(new THREE.CylinderGeometry(ancho * 0.425, ancho * 0.425, ancho, 10, 1, false, 0, Math.PI), mat);
    tapa.rotation.z = Math.PI / 2;
    tapa.position.set(0, 0.14 + alto, 0);
    const c = new THREE.Group();
    c.add(caja, tapa);
    c.position.set(x, 0, z);
    c.rotation.y = GIRO;
    caja.castShadow = tapa.castShadow = true;
    grupo.add(c);
    const r = ancho / 2;
    if (colliders?.addSegment) {
      colliders.addSegment(x - r, z - r, x + r, z - r);
      colliders.addSegment(x + r, z - r, x + r, z + r);
      colliders.addSegment(x + r, z + r, x - r, z + r);
      colliders.addSegment(x - r, z + r, x - r, z - r);
    }
  }
  scene.add(grupo);
  return grupo;
}
