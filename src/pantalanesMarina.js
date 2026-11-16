import * as THREE from 'three';
import { Kit } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * Los pantalanes de la Marina Lanzarote, de la A a la L, como en la foto aérea de Google Maps del puerto
 * deportivo (solo se mira, no va dentro del juego): los pantalanes flotantes de hormigón gris claro que salen
 * del paseo hacia la dársena, con sus fingers a los dos lados, las tomas de agua y luz blancas y, amarrados,
 * los veleros y las lanchas. En el mapa son caminos sobre el agua y el juego no los dibujaba: los peatones
 * parecían andar por encima del mar. Las líneas son las del mapa, recortadas donde empieza el agua.
 */

const PANTALANES = {
  A: [[956.21, 178.97], [883.68, 137.77]],
  B: [[966.96, 158.12], [895.44, 117.43]],
  C: [[994.7, 133.56], [914.95, 87.06]],
  D: [[1014.9, 95.49], [936.68, 51.95]],
  E: [[1036.72, 56.82], [960.92, 14.34]],
  F: [[1059.88, 16.31], [986.56, -25.22]],
  G: [[1085.8, -30.13], [1014.42, -69.53]],
  H: [[1099.89, -55.1], [1095.56, -57.46], [1029.47, -93.49]],
  I: [[1142.57, -130.32], [1137.49, -133.17], [1075.72, -167.88]],
  J: [[1162.59, -187.12], [1099.96, -221.66]],
  K: [[1182.83, -231.38], [1177.79, -234.19], [1114.45, -269.58]],
  L: [[1177.79, -234.19], [1199.33, -279.6], [1158.03, -302.41], [1152.61, -292.29], [1123.35, -309.01]],
};

// a la altura del paseo (0,2), por encima de la lámina del agua (0,15) y de su espuma (0,17)
const ARRIBA = 0.22, ANCHO = 2.6, HORMIGON = 0xcfccc4, JUNTA = 0xa8a59e, DEFENSA = 0x2a2a2c;
const BLANCO = 0xf4f4f2, INOX = 0xcfd2d6;
const CASCOS = [0xf4f4f2, 0xf4f4f2, 0xf4f4f2, 0xeceae4, 0x1e3a6a, 0x9aa4ae];

/** un barco amarrado de popa al pantalán: el casco, la cubierta y la cabina, y el palo si es velero */
function barco(k, s, lado, r) {
  const eslora = 7.5 + r() * 4, manga = 2.6 + r() * 0.8, velero = r() < 0.65, z0 = lado * (ANCHO / 2 + 0.35);
  const forma = (f) => new THREE.Shape([[0, -manga * 0.42], [eslora * 0.7, -manga / 2], [eslora, 0], [eslora * 0.7, manga / 2], [0, manga * 0.42]].map(([x, y]) => new THREE.Vector2(x * f - eslora * (f - 1) / 2, y * f)));
  const pieza = (f, alto, y, hex) => {
    const g = new THREE.ExtrudeGeometry(forma(f), { depth: alto, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    g.rotateY(lado > 0 ? -Math.PI / 2 : Math.PI / 2);
    g.translate(s, y, z0);
    k.add(g, hex);
  };
  // el casco y la franja de color de junto a la cubierta
  const color = CASCOS[Math.floor(r() * CASCOS.length)];
  pieza(1, 1.25, -0.35, color);
  pieza(1.012, 0.1, 0.68, color === 0x1e3a6a ? BLANCO : [0x1e3a6a, 0x2a6ab8, 0x1a1a1c][Math.floor(r() * 3)]);
  // la cubierta de teca y la cabina
  k.box(s, 0.9, z0 + lado * eslora * 0.42, manga * 0.62, 0.04, eslora * 0.6, 0xc8a878);
  if (velero) {
    k.box(s, 0.94, z0 + lado * eslora * 0.38, manga * 0.5, 0.45, eslora * 0.3, BLANCO);
    k.box(s, 1.2, z0 + lado * eslora * 0.38, manga * 0.52, 0.1, eslora * 0.22, 0x2a3a4a);
    const alto = 9 + eslora * 0.35;
    k.cyl(s, 0.94, z0 + lado * eslora * 0.48, 0.05, 0.07, alto, INOX, { seg: 6 });
    k.box(s, 2.0, z0 + lado * eslora * 0.33, 0.09, 0.09, eslora * 0.32, INOX);
    k.box(s, 1.95, z0 + lado * eslora * 0.33, 0.24, 0.22, eslora * 0.28, [0x1e3a8a, 0xe8e6e0, 0x2a5a8a][Math.floor(r() * 3)]);
  } else {
    k.box(s, 0.94, z0 + lado * eslora * 0.45, manga * 0.7, 0.75, eslora * 0.42, BLANCO);
    k.box(s, 1.3, z0 + lado * eslora * 0.62, manga * 0.72, 0.3, 0.05, 0x2a3a4a);
  }
}

/** un tramo de pantalán: la losa flotante, sus juntas, las defensas, los fingers, las tomas y los barcos */
function tramo(k, L, conAmarres, semilla) {
  let s0 = semilla;
  const r = () => (s0 = (s0 * 16807) % 2147483647) / 2147483647;
  k.box(L / 2, -0.5, 0, L, ARRIBA + 0.5, ANCHO, HORMIGON);
  for (let s = 2.5; s < L; s += 2.5) k.box(s, ARRIBA, 0, 0.04, 0.006, ANCHO, JUNTA);
  for (const lado of [-1, 1]) k.box(L / 2, ARRIBA - 0.24, lado * (ANCHO / 2 + 0.03), L, 0.16, 0.06, DEFENSA);
  if (!conAmarres) return;
  for (let s = 6; s < L - 2; s += 6) {
    for (const lado of [-1, 1]) {
      // el finger, la toma blanca con su piloto verde y, en el hueco de al lado, un barco (no en todos)
      k.box(s, -0.3, lado * (ANCHO / 2 + 3.6), 0.5, ARRIBA + 0.3, 7.2, HORMIGON);
      if ((Math.round(s / 6) + (lado > 0 ? 0 : 1)) % 2 === 0) {
        k.box(s, ARRIBA, lado * (ANCHO / 2 - 0.25), 0.26, 0.85, 0.26, BLANCO);
        k.box(s, ARRIBA + 0.85, lado * (ANCHO / 2 - 0.25), 0.2, 0.08, 0.2, 0x3ac85a, { list: k.glow });
      }
      if (s + 3 < L - 1 && r() < 0.78) barco(k, s + 3, lado, r);
    }
  }
}

/** se monta con lo demás de Valterra, en su primera fase */
export function buildPantalanesMarina(scene) {
  const group = new THREE.Group();
  group.name = 'pantalanesMarina';
  let semilla = 7;
  for (const [nombre, puntos] of Object.entries(PANTALANES)) {
    for (let i = 0; i < puntos.length - 1; i++) {
      const M = marco(puntos[i], puntos[i + 1]);
      const k = new Kit();
      tramo(k, M.len, M.len > 20, semilla += 1013);
      group.add(enMarco(k, M, 'pantalan' + nombre + i, null));
    }
  }
  scene.add(group);
  return { group };
}
