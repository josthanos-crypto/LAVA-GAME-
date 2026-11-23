import * as THREE from 'three';
import { flatPoly } from './world.js';

/**
 * Explanada de la antigua discoteca, enfrente de la Playa del Reducto.
 * Suelo de losas de plaza + el edificio de la discoteca (fachada blanca simple),
 * tal como pide José Manuel. Coordenadas aproximadas junto a la playa del Reducto.
 */

export function buildExplanadaDisco(scene) {
  const group = new THREE.Group();
  group.name = 'explanadaDisco';

  // el terreno de la explanada (losas, frente a la playa)
  const explanada = [
    [-560, 700], [-420, 700], [-420, 820], [-560, 820], [-560, 700],
  ];
  const g = flatPoly(explanada, 0.135, 0xd9d2c6);
  if (g) {
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0xd9d2c6, roughness: 0.9, metalness: 0, vertexColors: true }));
    m.receiveShadow = true;
    group.add(m);
  }

  // el edificio de la antigua discoteca: bloque blanco, sencillo, como el resto de Arrecife
  const disco = [
    [-520, 720], [-460, 720], [-460, 800], [-520, 800], [-520, 720],
  ];
  const gd = flatPoly(disco, 4.5, 0xf0f0ee);
  if (gd) {
    const md = new THREE.Mesh(gd, new THREE.MeshStandardMaterial({ color: 0xf0f0ee, roughness: 0.85, metalness: 0, vertexColors: true }));
    md.castShadow = true; md.receiveShadow = true;
    group.add(md);
    // cubierta plana
    const gc = new THREE.BoxGeometry(60, 0.2, 80);
    gc.translate(0, 4.6, 0);
    const mc = new THREE.Mesh(gc, new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.9 }));
    // encima del edificio (sin esto la losa de 60 x 80 m quedaba a 4,6 m sobre el centro de Arrecife: el «manto»
    // que se veía al volar con el roadster)
    mc.position.set(-490, 0, 760);
    mc.castShadow = true; mc.receiveShadow = true;
    group.add(mc);
  }

  scene.add(group);
  return { group };
}
