import * as THREE from 'three';

/**
 * (Version 154) La rotonda de la Calle Tenderete junto a la Repsol y el HiperDino, como es de verdad (fotograma 172
 * del recorrido de José Manuel y ortofoto del IGN): isleta de adoquín rojo con un aro blanco y, en el centro, una
 * jardinera blanca con forma de concha. Antes llevaba una escultura inventada.
 *
 * La llama roundabouts.js (escultura `concha` de la lista SCULPTURES de places.js), que le pasa sus dos ayudas:
 * `tinted(geometría, color)` y `place(geometría, x, y, z)`. Devuelve el radio que ocupa (no se planta nada dentro).
 */
const BLANCO = 0xeeeae0, ADOQUIN = 0x9c4d3c;

export function concha(S, cx, cz, ri, TOP, { tinted, place }) {
  // el adoquín rojo de la isleta y el aro blanco de dentro
  const anillo = (r0, r1, y, color) => {
    const g = new THREE.RingGeometry(r0, r1, 40, 1);
    g.rotateX(-Math.PI / 2);
    S.nature.push(tinted(place(g, cx, y, cz), color));
  };
  anillo(2.5, ri - 0.3, TOP + 0.012, ADOQUIN);
  anillo(2.2, 2.5, TOP + 0.016, BLANCO);
  anillo(0, 2.2, TOP + 0.014, 0xb9b5ab);
  // la concha: un cuenco blanco de gajos, macizo (pared de fuera, borde y pared de dentro)
  const perfil = [[0.02, 0], [0.95, 0], [1.2, 0.32], [1.75, 0.95], [2.05, 1.3], [1.92, 1.34], [1.6, 1.0], [1.05, 0.5], [0.02, 0.4]]
    .map(([r, y]) => new THREE.Vector2(r, y));
  const g = new THREE.LatheGeometry(perfil, 36);
  const p = g.getAttribute('position');
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), k = 1 + 0.07 * Math.cos(Math.atan2(z, x) * 12) * Math.min(1, p.getY(i) / 0.6);
    p.setXYZ(i, x * k, p.getY(i), z * k);
  }
  g.computeVertexNormals();
  S.paint.push(tinted(place(g, cx, TOP + 0.02, cz), BLANCO));
  S.collide.push([cx, cz, 2.1]);
  return ri;
}
