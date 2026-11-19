import * as THREE from 'three';
import { Kit } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * El dique de abrigo de la Marina Lanzarote, por el lado del mar abierto, con la foto aérea del puerto
 * deportivo de marzo de 2017, la foto aérea del juego y la del monolito de enero de 2023 de Google Maps
 * (solo se miran, no van dentro del juego): entre la calle del dique y el mar, el muro blanco que corre por
 * encima de la escollera, las farolas blancas de dos brazos en fila por dentro del muro y los bloques
 * oscuros de la escollera que bajan hasta el agua. En el juego el dique era la foto plana y el mar llegaba
 * hasta la calle sin nada en medio. El muro va paralelo a la orilla del mapa, a la distancia que se mide en
 * la foto aérea del juego (unos 17 m de escollera).
 */

// la orilla del mar del dique, sacada del mapa: del norte de la plaza a la explanada del varadero
const ORILLAS = [
  [[1034.3, 259.3], [1088.9, 156.3], [1157.6, 11.4], [1181.4, -32.1]],
  [[1195.0, -56.8], [1231.8, -111.7], [1286.4, -174.9], [1342.8, -242.6], [1377.8, -301.6], [1389.5, -337.7]],
];
const ESCOLLERA = 17, ALTO = 1.3, BLANCO = 0xf0eeea, ROCA = [0x4a4540, 0x5a544c, 0x3e3a36, 0x645c52];

/** antes de levantar la ciudad: no hay nada que quitar del mapa */
export function tuneDiqueMarina(map) {
  map.diqueMarina = true;
}

/** la línea del muro: la orilla metida hacia tierra (las esquinas, por la media de las dos normales) */
function lineaMuro(orilla) {
  const n = [];
  for (let i = 0; i < orilla.length - 1; i++) {
    const [a, b] = [orilla[i], orilla[i + 1]], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    n.push([(b[1] - a[1]) / L, -(b[0] - a[0]) / L]);
  }
  return orilla.map((p, i) => {
    const m = i === 0 ? n[0] : i === orilla.length - 1 ? n[n.length - 1] : [(n[i - 1][0] + n[i][0]) / 2, (n[i - 1][1] + n[i][1]) / 2];
    const l = Math.hypot(m[0], m[1]);
    return [p[0] + (m[0] / l) * ESCOLLERA, p[1] + (m[1] / l) * ESCOLLERA];
  });
}

/** un tramo: el muro con su albardilla, las farolas de dos brazos y los bloques de la escollera hasta el agua */
function tramo(k, L, semilla) {
  let s0 = semilla;
  const r = () => (s0 = (s0 * 16807) % 2147483647) / 2147483647;
  k.box(L / 2, 0, 0.25, L + 0.5, ALTO, 0.5, BLANCO);
  k.box(L / 2, ALTO, 0.25, L + 0.5, 0.08, 0.62, 0xdcd8d0);
  for (let s = 0; s < L; s += 6) k.box(s, 0.02, 0.51, 0.02, ALTO - 0.04, 0.01, 0xd0ccc4);
  k.seg(0, 0, L, 0);
  // las farolas, por dentro del muro
  for (let s = 12; s < L - 4; s += 30) {
    k.cyl(s, 0, -1.2, 0.08, 0.11, 8, BLANCO, { seg: 8 });
    k.box(s, 7.9, -1.2, 0.08, 0.08, 1.6, BLANCO);
    for (const lado of [-1, 1]) {
      k.box(s, 7.75, -1.2 + lado * 0.8, 0.28, 0.14, 0.5, 0xe8e6e2);
      k.box(s, 7.7, -1.2 + lado * 0.8, 0.22, 0.04, 0.4, 0xfff0d0, { list: k.glow });
    }
    k.block(s, -1.2, 0.3, 0.3);
  }
  // los bloques de la escollera, del pie del muro (altos) al agua (más bajos y medio hundidos)
  for (let s = 1; s < L; s += 2.3) {
    for (let z = 1.9; z < ESCOLLERA + 2; z += 2.2 + r() * 0.6) {
      const t = z / ESCOLLERA, lado = 1.4 + r() * 0.9;
      const y = 0.1 - t * 1.6 - lado * 0.5 + r() * 0.2;
      k.box(s + (r() - 0.5) * 1.2, y, z + (r() - 0.5) * 0.6, lado, lado * (0.7 + r() * 0.3), lado, ROCA[Math.floor(r() * ROCA.length)], { ry: r() * Math.PI });
    }
  }
}

/** se monta con lo demás de Valterra, en su primera fase */
export function buildDiqueMarina(scene, colliders, map) {
  if (!map?.diqueMarina) return null;
  const group = new THREE.Group();
  group.name = 'diqueMarina';
  let semilla = 11;
  ORILLAS.forEach((orilla, j) => {
    const muro = lineaMuro(orilla);
    for (let i = 0; i < muro.length - 1; i++) {
      // el marco va de un punto al siguiente con z hacia el mar (la orilla queda a la derecha yendo al sur)
      const M = marco(muro[i], muro[i + 1]), k = new Kit();
      tramo(k, M.len, semilla += 977);
      group.add(enMarco(k, M, `dique${j}_${i}`, colliders));
    }
  });
  scene.add(group);
  return { group };
}
