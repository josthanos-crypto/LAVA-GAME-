import * as THREE from 'three';
import { flatPoly } from './world.js';

/**
 * Aeropuerto de Lanzarote (ACE): aproximación artística junto al borde
 * suroeste de Arrecife. Terminal blanca y pistas. No se conecta con
 * OpenStreetMap; es el aeropuerto tal como se ve desde la ciudad.
 */

export function buildAeropuerto(scene) {
  const group = new THREE.Group();
  group.name = 'aeropuerto';

  // pistas (asfalto, dos pistas en V suave)
  const pistas = [
    [-6200, 1600], [-5600, 1750], [-5600, 1820], [-6200, 1670], [-6200, 1600],
    [-5800, 1500], [-5200, 1650], [-5200, 1720], [-5800, 1570], [-5800, 1500],
  ];
  for (const poly of [pistas.slice(0, 5), pistas.slice(5)]) {
    const g = flatPoly(poly, 0.1, 0x5a5a58);
    if (g) {
      const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0x5a5a58, roughness: 0.9, metalness: 0, vertexColors: true }));
      m.receiveShadow = true;
      group.add(m);
    }
  }

  // terminal del aeropuerto: bloque blanco grande con cubierta plana
  const terminal = [
    [-5450, 1680], [-5050, 1680], [-5050, 1880], [-5450, 1880], [-5450, 1680],
  ];
  const gt = flatPoly(terminal, 9, 0xf2f2f0);
  if (gt) {
    const mt = new THREE.Mesh(gt, new THREE.MeshStandardMaterial({ color: 0xf2f2f0, roughness: 0.85, metalness: 0, vertexColors: true }));
    mt.castShadow = true; mt.receiveShadow = true;
    group.add(mt);
    const gc = new THREE.BoxGeometry(400, 0.25, 200);
    gc.translate(0, 9.25, 0);
    const mc = new THREE.Mesh(gc, new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.9 }));
    // encima de la terminal (sin esto la losa de 400 x 200 m quedaba a 9 m sobre el centro de Arrecife)
    mc.position.set(-5250, 0, 1780);
    mc.castShadow = true; mc.receiveShadow = true;
    group.add(mc);
    // torre de control
    const torre = new THREE.BoxGeometry(6, 10, 6);
    const mtorre = new THREE.Mesh(torre, new THREE.MeshStandardMaterial({ color: 0xf2f2f0, roughness: 0.85 }));
    mtorre.position.set(-5250, 5, 1830);
    mtorre.castShadow = true; mtorre.receiveShadow = true;
    group.add(mtorre);
    const vidrio = new THREE.BoxGeometry(5.4, 2.5, 5.4);
    const mvidrio = new THREE.Mesh(vidrio, new THREE.MeshStandardMaterial({ color: 0x8da9c4, roughness: 0.3, metalness: 0.5 }));
    mvidrio.position.set(-5250, 10.5, 1830);
    mvidrio.castShadow = true; mvidrio.receiveShadow = true;
    group.add(mvidrio);
  }

  scene.add(group);
  return { group };
}
