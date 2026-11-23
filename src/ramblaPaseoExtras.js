import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * (Version 166) Lo que se ve en el paseo central de la Rambla Medular en las capturas de Look Around del 23-11-2026
 * (PC de Arrecife, `Downloads\recursos lava game 2026-11-23\centro`, fotos 0558, 0568 y 0578 «Rambla Medular, 30»):
 * el solado rojizo lleva un bordillo blanco a cada lado, hay bancos de madera con patas de hierro y farolas verdes
 * oscuras de brazo largo. Se pone sobre los puntos del paseo que ya saca ramblaArboles.js (`centros`).
 * Solo es adorno: no choca (el banco y la farola son finos y van pegados al borde del paseo).
 * A ojo: la separación de bancos (cada 34 m) y de farolas (cada 25 m); en la realidad no es tan regular.
 */

const BLANCO = 0xe9e7e0, MADERA = 0x7a5233, HIERRO = 0x2b3a30;
const MITAD = 2.0;      // el paseo mide 4 m: el bordillo va en cada borde

export function buildRamblaPaseoExtras(scene, centros) {
  const grupo = new THREE.Group();
  grupo.name = 'ramblaPaseoExtras';
  if (!centros?.length) { scene.add(grupo); return grupo; }
  const piezas = [];
  const pintar = (g, c) => {
    const k = new THREE.Color(c), n = g.getAttribute('position').count, col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { col[i * 3] = k.r; col[i * 3 + 1] = k.g; col[i * 3 + 2] = k.b; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  };
  centros.forEach(([cx, cz, ux, uz], i) => {
    const giro = Math.atan2(-uz, ux);
    /** una pieza: s a lo largo del paseo, t de través */
    const poner = (g, s, y, t, c) => {
      const ng = g.index ? g.toNonIndexed() : g;
      ng.deleteAttribute('uv');
      ng.rotateY(giro);
      ng.translate(cx + ux * s - uz * t, y, cz + uz * s + ux * t);
      piezas.push(pintar(ng, c));
    };
    // bordillos blancos a los dos lados
    for (const t of [-MITAD, MITAD]) poner(new THREE.BoxGeometry(8.6, 0.2, 0.22), 0, 0.2, t, BLANCO);
    // un banco cada 34 m, mirando a la calzada
    if (i % 4 === 1) {
      const t = (i % 8 === 1) ? 1.35 : -1.35;
      poner(new THREE.BoxGeometry(1.7, 0.07, 0.42), 0, 0.5, t, MADERA);
      poner(new THREE.BoxGeometry(1.7, 0.5, 0.06), 0, 0.78, t + Math.sign(t) * 0.2, MADERA);
      for (const s of [-0.7, 0.7]) poner(new THREE.BoxGeometry(0.07, 0.4, 0.4), s, 0.33, t, HIERRO);
    }
    // una farola cada 25 m (cada tres puntos), alternando de lado
    if (i % 3 === 0) {
      const t = (i % 6 === 0) ? 1.7 : -1.7, lado = Math.sign(t);
      poner(new THREE.CylinderGeometry(0.06, 0.09, 5.2, 6), 0, 2.7, t, HIERRO);
      poner(new THREE.BoxGeometry(0.9, 0.07, 0.07), 0, 5.3, t - lado * 0.4, HIERRO);
      poner(new THREE.BoxGeometry(0.42, 0.1, 0.2), 0, 5.22, t - lado * 0.85, 0xd8d8cc);
    }
  });
  const m = new THREE.Mesh(mergeGeometries(piezas, false), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7, metalness: 0.1 }));
  m.castShadow = m.receiveShadow = true;
  grupo.add(m);
  scene.add(grupo);
  return grupo;
}
