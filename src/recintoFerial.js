import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { buildAparcamientos } from './aparcamientosTenderete.js';
import { Calzada } from './sentidos.js';

/**
 * (Version 157) El Recinto Ferial de Arrecife, junto a la rotonda de la Vela Latina, al oeste del Cabildo.
 *
 * En el mapa venía como un bloque de 9,5 m con ventanas de pisos que tapaba también el aparcamiento. José Manuel
 * dijo que no es un edificio sino el sitio de las fiestas: el Recinto Ferial (Avenida Fred Olsen, donde se monta el
 * escenario del Carnaval). Medido sobre la ortofoto oficial del IGN:
 *  - arriba, la cubierta gris (unos 32 × 22 m): aquí es una cubierta sobre pilares con el fondo cerrado y la tarima
 *    del escenario debajo, sin rótulos (no se sabe cómo es por dentro: no se inventa nada más);
 *  - debajo, hacia el sur, el aparcamiento al aire libre, con sus filas y sus coches.
 * `tuneRecintoFerial(map)` deja el bloque del mapa en la planta de la cubierta (sin sus fachadas de pisos) y apunta
 * los coches en `map.lotSpots`; `buildRecintoFerial` levanta la cubierta y pinta el aparcamiento.
 */
const CUBIERTA = [[-1384.2, 537.0], [-1352.2, 533.0], [-1345.8, 552.4], [-1372.4, 560.5]];
const ALTO = 7.2;
const BLOQUE = [-1351, 582];     // el centro del bloque que traía el mapa
const APARCAMIENTO = { nombre: 'aparcamientoRecintoFerial', centro: [-1357, 593], eje: [0.26, 0.966], largo: 29, ancho: 16 };
const hash = (n) => { const v = Math.sin(n * 33.7 + 9.2) * 43758.5453; return v - Math.floor(v); };

export function tuneRecintoFerial(map) {
  for (const b of map.buildings || []) {
    if (!b.p || b.skip) continue;
    const n = b.p.length - 1, cx = b.p.slice(0, n).reduce((t, q) => t + q[0], 0) / n, cz = b.p.slice(0, n).reduce((t, q) => t + q[1], 0) / n;
    if (Math.hypot(cx - BLOQUE[0], cz - BLOQUE[1]) > 18) continue;
    b.pAntes = b.p; b.hAntes = b.h;
    b.p = [...CUBIERTA, CUBIERTA[0]];
    b.h = ALTO; b.skip = true; b.ownRoof = true; b.recintoFerial = true;
  }
  if (!Array.isArray(map.lotSpots)) return;
  const calz = new Calzada(map.roads);
  const { centro: c, eje: A, largo } = APARCAMIENTO, B = [-A[1], A[0]];
  for (let a = -largo + 0.6 + 1.25, k = 0; a < largo - 1.5; a += 2.5, k++) {
    for (const [b, sentido] of [[-13.5, 1], [-2.5, -1], [2.5, 1]]) {
      if (hash(k * 3 + b) > 0.75) continue;
      const x = c[0] + A[0] * a + B[0] * b, z = c[1] + A[1] * a + B[1] * b;
      if (calz.roadAt(x, z, 3)) continue;
      map.lotSpots.push([+x.toFixed(2), +z.toFixed(2), Math.atan2(B[0] * sentido, B[1] * sentido)]);
    }
  }
}

export function buildRecintoFerial(scene, colliders, map) {
  const grupo = new THREE.Group();
  grupo.name = 'recintoFerial';
  const piezas = [];
  const caja = (x, y, z, w, h, d, color, ry = 0) => {
    const g = new THREE.BoxGeometry(w, h, d, Math.max(1, Math.round(w / 4)), 1, Math.max(1, Math.round(d / 4))).toNonIndexed();
    g.rotateY(ry);
    g.translate(x, y + h / 2, z);
    const c = new THREE.Color(color), n = g.getAttribute('position').count, col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    piezas.push(g);
  };
  const [TL, TR, BR, BL] = CUBIERTA;
  const medio = (p, q, t = 0.5) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  const giro = (p, q) => Math.atan2(q[0] - p[0], q[1] - p[1]);
  const largo = (p, q) => Math.hypot(q[0] - p[0], q[1] - p[1]);
  // la cubierta: una losa gris algo inclinada no hace falta; plana, con su canto
  const forma = new THREE.Shape(CUBIERTA.map(([x, z]) => new THREE.Vector2(x, z)));
  const techo = new THREE.ExtrudeGeometry(forma, { depth: 0.5, bevelEnabled: false });
  techo.rotateX(Math.PI / 2);
  techo.translate(0, ALTO, 0);
  const mTecho = new THREE.Mesh(techo, new THREE.MeshStandardMaterial({ color: 0x9aa3a8, roughness: 0.8, side: THREE.DoubleSide }));
  mTecho.castShadow = mTecho.receiveShadow = true;
  grupo.add(mTecho);
  // el fondo cerrado (lado norte) y los pilares de los otros tres lados
  const cn = medio(TL, TR);
  caja(cn[0], 0, cn[1], 0.3, ALTO - 0.5, largo(TL, TR), 0xdedbd3, giro(TL, TR));
  colliders?.addSegment(TL[0], TL[1], TR[0], TR[1]);
  for (const [p, q] of [[TR, BR], [BR, BL], [BL, TL]]) {
    for (const t of [0, 1 / 3, 2 / 3]) {
      const [x, z] = medio(p, q, t);
      caja(x, 0, z, 0.5, ALTO - 0.5, 0.5, 0xcfd2d4);
      colliders?.addSegment(x - 0.3, z, x + 0.3, z); colliders?.addSegment(x, z - 0.3, x, z + 0.3);
    }
  }
  // la tarima del escenario, pegada al fondo
  const e0 = medio(TL, BL, 0.3), e1 = medio(TR, BR, 0.3), ec = medio(medio(TL, TR), medio(e0, e1));
  caja(ec[0], 0, ec[1], largo(TL, BL) * 0.3, 1.3, largo(TL, TR) - 3, 0x2b2d30, giro(TL, TR));
  colliders?.addSegment(e0[0], e0[1], e1[0], e1[1]);
  const m = new THREE.Mesh(mergeGeometries(piezas, false), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 }));
  m.castShadow = m.receiveShadow = true;
  grupo.add(m);
  scene.add(grupo);
  buildAparcamientos(scene, map, { nombre: 'recintoFerialAparcamiento', solares: [APARCAMIENTO], zona: [-1420, -1300, 500, 660] });
  return grupo;
}
