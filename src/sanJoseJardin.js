import * as THREE from 'three';
import { Calzada } from './sentidos.js';
import { terrainY } from './terrain.js';
import { isTouchDevice } from './touch.js';

/**
 * El jardín de picón del Castillo de San José (Version 149).
 *
 * En la ortofoto oficial (PNOA del IGN) toda la loma del castillo, entre la carretera y el mar y alrededor del
 * aparcamiento, es un jardín de picón negro salpicado de matas redondas (verdes y pajizas) y alguna palmera. En el
 * juego ese suelo era solo la foto, plana. Aquí se ponen las matas, de bulto: redondas y bajas, repartidas por la
 * loma sin pisar la carretera, el aparcamiento, la explanada ni el castillo, y solo donde hay tierra (no en el mar).
 * El número y el sitio exacto de cada mata no son los reales.
 */

const ZONA = { x0: 1470, x1: 1700, z0: -1075, z1: -890 };
const CASTILLO = [1629.3, -951.1], ANEXO = [1593, -955], APARCAMIENTO = [1634, -1006];

export function buildSanJoseJardin(scene, map) {
  const calz = new Calzada(map.roads);
  const dentro = (poly, x, z) => {
    let d = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, zi] = poly[i], [xj, zj] = poly[j];
      if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) d = !d;
    }
    return d;
  };
  const casas = (map.buildings || []).filter(b => b.p?.some(([x, z]) => x > ZONA.x0 - 20 && x < ZONA.x1 + 20 && z > ZONA.z0 - 20 && z < ZONA.z1 + 20));
  const paso = isTouchDevice() ? 13 : 8.5, sitios = [];
  for (let x = ZONA.x0; x < ZONA.x1; x += paso) for (let z = ZONA.z0; z < ZONA.z1; z += paso) {
    const k = Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1, k2 = (k * 7.13) % 1;
    const px = x + (k - 0.5) * paso * 0.9, pz = z + (k2 - 0.5) * paso * 0.9;
    // solo en la loma: del lado del mar de la carretera (la carretera va de (1470, -905) a (1640, -1075))
    if ((px - 1470) + (pz + 905) < 6) continue;
    if (Math.hypot(px - CASTILLO[0], pz - CASTILLO[1]) < 34 || Math.hypot(px - ANEXO[0], pz - ANEXO[1]) < 15) continue;
    if (Math.hypot(px - APARCAMIENTO[0], pz - APARCAMIENTO[1]) < 40) continue;
    if (calz.roadAt(px, pz, 5) || casas.some(b => dentro(b.p, px, pz))) continue;
    if (terrainY(px, pz) < 2.2) continue;      // el mar y la orilla
    sitios.push([px, pz, k, k2]);
  }
  const matas = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, flatShading: true }), sitios.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
  sitios.forEach(([x, z, k, k2], i) => {
    const r = 0.9 + k * 1.3;
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), k2 * 6.28);
    m.compose(new THREE.Vector3(x, r * 0.32, z), q, new THREE.Vector3(r, r * 0.55, r));
    matas.setMatrixAt(i, m);
    // dos de cada tres, verdes; el resto, pajizas
    if (k2 < 0.66) c.setRGB(0.26 + k * 0.08, 0.38 + k2 * 0.1, 0.2, THREE.SRGBColorSpace); else c.setRGB(0.46 + k * 0.08, 0.44 + k * 0.06, 0.27, THREE.SRGBColorSpace);
    matas.setColorAt(i, c);
  });
  matas.name = 'sanJoseJardin';
  matas.castShadow = true;
  matas.userData.matas = sitios.length;
  scene.add(matas);
  return matas;
}
