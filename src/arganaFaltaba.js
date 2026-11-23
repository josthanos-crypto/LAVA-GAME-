import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Lo que faltaba en Argana al comparar el mapa del juego con la ortofoto oficial (PNOA del IGN), calle a calle
 * (Version 147). OpenStreetMap no lo traía y en el juego solo se veía la foto del suelo:
 *
 *  - Las naves largas del desguace de neumáticos de la esquina de detrás del hospital (cuatro cobertizos de chapa
 *    beis). Van como naves bajas del mapa, sin nombre: no se sabe qué empresa es.
 *  - La depuradora de detrás del Decathlon (los depósitos redondos y las balsas que se ven desde la rotonda de la
 *    circunvalación): siete depósitos de hormigón con el agua dentro y la balsa rectangular. Sin rótulo.
 *
 * Para añadir otra nave que falte: una línea en `NAVES` con los dos extremos de su eje, el ancho y la altura,
 * medidos sobre la foto oficial (ver CLAUDE.md, campoReal.js: el servicio WMS del IGN).
 *
 * Coordenadas del juego: x = (lon + 13,55) · 97398, z = (28,9625 − lat) · 111320.
 */

/** naves que faltaban: [x1, z1, x2, z2, ancho, alto] (los dos extremos del eje largo) */
const NAVES = [
  [-1766.5, -1437.5, -1720.3, -1478.9, 8.7, 4.4],
  [-1717.9, -1481.3, -1695.9, -1455.7, 7.7, 4.4],
  [-1757.1, -1426.0, -1716.5, -1461.7, 9.8, 4.4],
  [-1736.1, -1420.4, -1707.4, -1449.8, 10.5, 4.4],
];

/** la depuradora: depósitos redondos [x, z, radio] y la balsa [x, z, largo, ancho, giro en grados] */
const DEPOSITOS = [
  [-1317.1, -1019.3, 7], [-1329.7, -1003, 7], [-1265.4, -981.5, 9.5], [-1283.5, -959.3, 9.5],
  [-1251.2, -963.5, 6.3], [-1264.6, -947.1, 6], [-1249.1, -947.5, 5],
];
const BALSA = [-1300.3, -991.2, 34, 26, -40];

/** retoques al mapa antes de levantar la ciudad: las naves que no venían */
export function tuneArganaFaltaba(map) {
  if (map.arganaFaltaba) return;
  map.arganaFaltaba = true;
  for (const [x1, z1, x2, z2, ancho, alto] of NAVES) {
    const L = Math.hypot(x2 - x1, z2 - z1), nx = -(z2 - z1) / L * ancho / 2, nz = (x2 - x1) / L * ancho / 2;
    const p = [[x1 + nx, z1 + nz], [x2 + nx, z2 + nz], [x2 - nx, z2 - nz], [x1 - nx, z1 - nz]].map(([x, z]) => [+x.toFixed(2), +z.toFixed(2)]);
    p.push(p[0].slice());
    map.buildings.push({ p, h: alto, k: 'industrial', s: false, f: [226, 216, 196], c: [196, 182, 156], edificioReal: true });
  }
}

export function buildArganaFaltaba(scene, colliders) {
  const grupo = new THREE.Group();
  grupo.name = 'arganaFaltaba';
  const hormigon = [], agua = [];
  for (const [x, z, r] of DEPOSITOS) {
    // el vaso de hormigón (abierto por arriba), su pasarela y el agua
    const muro = new THREE.CylinderGeometry(r, r, 1.7, 28, 1, true).toNonIndexed();
    muro.translate(x, 0.85, z);
    hormigon.push(muro);
    const borde = new THREE.RingGeometry(r - 0.35, r + 0.1, 28).toNonIndexed();
    borde.rotateX(-Math.PI / 2); borde.translate(x, 1.7, z);
    hormigon.push(borde);
    const puente = new THREE.BoxGeometry(r * 2, 0.18, 0.9).toNonIndexed();
    puente.rotateY(0.7); puente.translate(x, 1.9, z);
    hormigon.push(puente);
    const disco = new THREE.CircleGeometry(r - 0.3, 28).toNonIndexed();
    disco.rotateX(-Math.PI / 2); disco.translate(x, 1.35, z);
    agua.push(disco);
    const cerco = [];
    for (let k = 0; k <= 12; k++) cerco.push([x + Math.cos(k / 12 * Math.PI * 2) * r, z + Math.sin(k / 12 * Math.PI * 2) * r]);
    colliders?.addPolygon(cerco);
  }
  {
    // la balsa rectangular, partida en tres calles
    const [x, z, largo, ancho, giro] = BALSA, a = giro * Math.PI / 180;
    const pieza = (w, h, d, dy, dz, lista) => { const g = new THREE.BoxGeometry(w, h, d).toNonIndexed(); g.translate(0, dy, dz); g.rotateY(a); g.translate(x, 0, z); lista.push(g); };
    pieza(largo, 1.6, ancho, 0.8, 0, hormigon);
    for (const dz of [-ancho / 3, 0, ancho / 3]) pieza(largo - 1.2, 0.04, ancho / 3 - 1, 1.62, dz, agua);
    const c = Math.cos(a), s = Math.sin(a);
    const esq = [[-largo / 2, -ancho / 2], [largo / 2, -ancho / 2], [largo / 2, ancho / 2], [-largo / 2, ancho / 2], [-largo / 2, -ancho / 2]].map(([u, v]) => [x + c * u + s * v, z - s * u + c * v]);
    colliders?.addPolygon(esq);
  }
  const m1 = new THREE.Mesh(mergeGeometries(hormigon, false), new THREE.MeshStandardMaterial({ color: 0xb9b6ae, roughness: 0.9, side: THREE.DoubleSide }));
  m1.castShadow = m1.receiveShadow = true;
  const m2 = new THREE.Mesh(mergeGeometries(agua, false), new THREE.MeshStandardMaterial({ color: 0x4f6b52, roughness: 0.25, metalness: 0.1 }));
  grupo.add(m1, m2);
  scene.add(grupo);
  return grupo;
}
