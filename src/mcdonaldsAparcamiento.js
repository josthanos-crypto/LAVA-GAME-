import * as THREE from 'three';
import { Calzada } from './sentidos.js';
import { paveMaterial, asfalto } from './suelos.js';
import { cinta, malla } from './puenteRayas.js';

/**
 * El aparcamiento del McDonald's de Argana (Version 134, pedido por José Manuel: «el McDonald's se ve mal»).
 *
 * Lo que había (en mcdonaldsArgana.js): una losa de asfalto con su altura calculada a mano. El juego le sumaba
 * otra vez la altura del terreno y la losa quedaba levantada y torcida, tapando la acera, el paso de cebra y la
 * boca de la rotonda de al lado.
 *
 * Ahora es un suelo plano que sube con el terreno como todo lo demás, un poco por debajo de la calzada, y no se
 * pinta donde hay calle o acera. Mismo solar y mismas plazas que antes.
 *
 * M(s, t) da el punto del solar (s a lo largo de la fachada, t hacia el fondo); el rectángulo es s0…s1 · t0…t1.
 */
const Y_ASFALTO = 0.12;   // entre el suelo de la foto (0,10) y las calzadas (0,14)

export function buildAparcamientoMcDonalds(scene, roads, M, { s0, s1, t0, t1, plaza }) {
  const calz = roads ? new Calzada(roads) : null;
  const enCalle = (x, z) => !!calz?.roadAt(x, z, 2.8);   // la calzada y su acera
  const rejilla = (ta, tb, y) => {
    const ns = Math.ceil((s1 - s0) / 2), nt = Math.max(1, Math.ceil((tb - ta) / 2)), pos = [], uv = [];
    const pt = (i, j) => M(s0 + (s1 - s0) * i / ns, ta + (tb - ta) * j / nt);
    for (let i = 0; i < ns; i++) for (let j = 0; j < nt; j++) {
      const q = [pt(i, j), pt(i + 1, j + 1), pt(i, j + 1), pt(i, j), pt(i + 1, j), pt(i + 1, j + 1)];
      if (q.some(([x, z]) => enCalle(x, z))) continue;
      for (const [x, z] of q) { pos.push(x, y, z); uv.push(x / 4, -z / 4); }
    }
    if (!pos.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals();
    return g;
  };
  const tex = asfalto();
  const poner = (g, color, name) => {
    if (!g) return;
    const mat = paveMaterial(tex, color);
    mat.side = THREE.DoubleSide;
    const m = new THREE.Mesh(g, mat);
    m.name = name; m.receiveShadow = true; scene.add(m);
  };
  poner(rejilla(t0 + 2.5, t1, Y_ASFALTO), 0xffffff, 'mcdonaldsAparcamiento');
  poner(rejilla(t0, t0 + 2.5, Y_ASFALTO + 0.005), 0xcfccc3, 'mcdonaldsAcera');
  // las plazas: una raya de 5 m cada «plaza» metros, donde no hay calle
  const pos = [];
  for (let s = s0 + 2; s < s1 - 2; s += plaza) {
    const pts = [0, 1, 2, 3].map(k => M(s, t1 - 8.8 + k * 5 / 3));
    if (pts.some(([x, z]) => enCalle(x, z))) continue;
    cinta(pos, pts, () => Y_ASFALTO + 0.012, 0.05, false);
  }
  const rayas = malla(pos, new THREE.MeshStandardMaterial({ color: 0xeceae2, roughness: 0.85, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  if (rayas) { rayas.name = 'mcdonaldsPlazas'; scene.add(rayas); }
}
