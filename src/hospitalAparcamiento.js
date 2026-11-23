import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { buildAparcamientos } from './aparcamientosTenderete.js';

/**
 * Los aparcamientos del Hospital Doctor José Molina Orosa (Version 140; José Manuel preguntó si el hospital tenía
 * también el parking arreglado: no lo tenía, el suelo era solo la foto aérea).
 *
 * Donde la foto aérea (PNOA) los enseña:
 *  - la franja de delante de la fachada larga, a lo largo del vial de la entrada, con las marquesinas de sombra
 *    sobre la fila de fuera;
 *  - la explanada de abajo, entre la punta sur del hospital, la nave de Remar y la carretera de San Bartolomé.
 * El firme y las plazas los pone aparcamientosTenderete.js (`buildAparcamientos`): no pinta sobre calle, acera ni
 * edificio. La franja de delante se queda corta a propósito por el lado de la ITV, que tiene su valla ahí.
 * El número de plazas es el que cabe, no el real.
 *
 * La fachada del hospital (hospitalMolinaOrosa.js) va de A a B; s a lo largo (0 al norte), z hacia fuera (oeste).
 */

const A = [-1659.3, -1365.4];
const DIR = [0.502, 0.865];                 // a lo largo de la fachada, hacia el sur
const FUERA = [-0.865, 0.502];              // hacia el vial de la entrada
const W = (s, z) => [A[0] + DIR[0] * s + FUERA[0] * z, A[1] + DIR[1] * s + FUERA[1] * z];

const SOLARES = [
  // delante de la fachada: de s 32 a 124, de z 12 a 36 (más allá está la valla de la ITV)
  { nombre: 'aparcamientoHospitalEntrada', centro: W(78, 24), eje: DIR, largo: 46, ancho: 12 },
  // la explanada de abajo, con las filas a lo largo de la carretera
  { nombre: 'aparcamientoHospitalSur', centro: W(188, 36), eje: [0.77, 0.64], largo: 26, ancho: 24 },
];

export function buildAparcamientoHospital(scene, map) {
  const grupo = buildAparcamientos(scene, map, { nombre: 'aparcamientosHospital', solares: SOLARES, zona: [-1780, -1470, -1430, -1110] });

  // las marquesinas de sombra sobre la fila de fuera de la franja de delante (en la foto aérea, de s 60 a 100)
  const piezas = [];
  const caja = (s, z, y, w, h, d, color) => {
    const [x, zz] = W(s, z);
    const g = new THREE.BoxGeometry(w, h, d).toNonIndexed();
    g.rotateY(Math.atan2(-DIR[1], DIR[0]));
    g.translate(x, y + h / 2, zz);
    const c = new THREE.Color(color), n = g.getAttribute('position').count, col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    piezas.push(g);
  };
  for (let s = 60; s < 100; s += 5) {
    caja(s + 2.5, 29.5, 2.5, 5.02, 0.14, 5.6, 0x8d6f5c);            // el techo, en tramos de 5 m
    caja(s + 2.5, 29.5, 2.36, 5.02, 0.14, 0.2, 0x70757a);           // la viga
  }
  for (let s = 60; s <= 100; s += 5) caja(s, 31.6, 0.1, 0.16, 2.4, 0.16, 0x70757a);   // los pilares
  const m = new THREE.Mesh(mergeGeometries(piezas, false), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, side: THREE.DoubleSide }));
  m.name = 'hospitalMarquesinas';
  m.castShadow = m.receiveShadow = true;
  grupo.add(m);
  return grupo;
}
