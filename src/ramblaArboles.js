import * as THREE from 'three';
import { Calzada } from './sentidos.js';
import { isTouchDevice } from './touch.js';
import { cinta, malla } from './puenteRayas.js';

/**
 * Los árboles y el paseo del centro de la Rambla Medular (Version 148).
 *
 * En la ortofoto oficial (PNOA del IGN) la Rambla lleva, de punta a punta, un paseo central con dos filas de árboles
 * de copa redonda entre las dos calzadas. En el juego ese centro era solo la foto del suelo, sin un árbol: era lo
 * que más se notaba al recorrerla. Aquí se planta sola, siguiendo el mapa: por cada tramo de calzada llamado «Rambla
 * Medular» se busca la calzada de enfrente y, si entre las dos queda sitio, se pone el paseo en el centro y un árbol
 * a cada lado (uno solo donde es estrecho). No se planta sobre calzada ni en las rotondas.
 *
 * El número y el sitio exacto de cada árbol no son los reales (son cada 8,5 m); la forma, la fila doble y el paseo, sí.
 */

const PASO = 8.5;          // un árbol cada tantos metros
const ACERA = 2.6;         // lo que se deja libre junto a cada calzada

export function buildRamblaArboles(scene, colliders, map) {
  const grupo = new THREE.Group();
  grupo.name = 'ramblaArboles';
  const ramblas = (map.roads || []).filter(r => /rambla medular/i.test(r.name || '') && r.p?.length > 1);
  const calz = new Calzada(map.roads);
  const segs = [];
  ramblas.forEach((r, ri) => {
    for (let i = 0; i < r.p.length - 1; i++) {
      const a = r.p[i], b = r.p[i + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len > 0.5) segs.push({ ri, a, len, u: [(b[0] - a[0]) / len, (b[1] - a[1]) / len], w: r.w || 7 });
    }
  });
  /** la calzada de enfrente: el punto más cercano de otro tramo de la Rambla, de través y en paralelo */
  const enfrente = (x, z, ri, ux, uz) => {
    let mejor = null;
    for (const s of segs) {
      if (s.ri === ri || Math.abs(s.u[0] * ux + s.u[1] * uz) < 0.8) continue;
      const t = Math.max(0, Math.min(s.len, (x - s.a[0]) * s.u[0] + (z - s.a[1]) * s.u[1]));
      const qx = s.a[0] + s.u[0] * t, qz = s.a[1] + s.u[1] * t, d = Math.hypot(qx - x, qz - z);
      if (d < 10 || d > 60 || Math.abs((qx - x) * ux + (qz - z) * uz) / d > 0.4) continue;
      if (!mejor || d < mejor.d) mejor = { d, qx, qz, w: s.w, ri: s.ri };
    }
    return mejor;
  };

  const arboles = [], paseo = [];
  ramblas.forEach((r, ri) => {
    let tramo = [], resto = 0;
    const cortar = () => { if (tramo.length > 1) cinta(paseo, tramo, () => 0.13, 2, false); tramo = []; };
    for (let i = 0; i < r.p.length - 1; i++) {
      const a = r.p[i], b = r.p[i + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len < 0.5) continue;
      const ux = (b[0] - a[0]) / len, uz = (b[1] - a[1]) / len;
      for (let s = resto; s < len; s += PASO) {
        const x = a[0] + ux * s, z = a[1] + uz * s, o = enfrente(x, z, ri, ux, uz);
        // cada pareja de calzadas se hace una sola vez: desde la que va antes en el mapa
        if (!o || o.ri < ri) { cortar(); continue; }
        const mx = (x + o.qx) / 2, mz = (z + o.qz) / 2, nx = (o.qx - x) / o.d, nz = (o.qz - z) / o.d;
        const libre = o.d / 2 - ((r.w || 7) + o.w) / 4 - ACERA;
        if (libre < 0.8 || calz.roadAt(mx, mz, 1.5)) { cortar(); continue; }
        const lados = libre >= 3.2 ? [-Math.min(libre - 0.6, 5), Math.min(libre - 0.6, 5)] : [0];
        for (const t of lados) {
          const tx = mx + nx * t, tz = mz + nz * t;
          if (!calz.roadAt(tx, tz, 1.2)) arboles.push([tx, tz]);
        }
        if (libre >= 3.2) tramo.push([mx, mz]); else cortar();
      }
      resto = (resto + Math.ceil(Math.max(0, len - resto) / PASO) * PASO) - len;
    }
    cortar();
  });

  // el paseo del centro: una franja de 4 m de solado rojizo, como en la foto
  const suelo = malla(paseo, new THREE.MeshStandardMaterial({ color: 0xb08f78, roughness: 0.9, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }));
  if (suelo) { suelo.name = 'ramblaPaseo'; suelo.receiveShadow = true; grupo.add(suelo); }

  // los árboles: tronco y copa redonda, todos en dos mallas (en el móvil, uno de cada dos y la copa más sencilla)
  const movil = isTouchDevice();
  const lista = movil ? arboles.filter((_, i) => i % 2 === 0) : arboles;
  if (lista.length) {
    const tronco = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.16, 0.24, 1, 5, 1, true), new THREE.MeshStandardMaterial({ color: 0x6a5a48, roughness: 0.95 }), lista.length);
    const copa = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, movil ? 0 : 1), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, flatShading: true }), lista.length);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
    lista.forEach(([x, z], i) => {
      const k = Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1;      // siempre igual para cada sitio
      const alto = 2.6 + k * 1.1, radio = 2.3 + ((k * 7) % 1) * 1.1;
      m.compose(new THREE.Vector3(x, alto / 2, z), q, new THREE.Vector3(1, alto, 1));
      tronco.setMatrixAt(i, m);
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), k * 6.28);
      m.compose(new THREE.Vector3(x, alto + radio * 0.55, z), q, new THREE.Vector3(radio, radio * 0.78, radio));
      copa.setMatrixAt(i, m);
      q.identity();
      copa.setColorAt(i, c.setRGB(0.20 + k * 0.07, 0.36 + ((k * 3) % 1) * 0.09, 0.17 + k * 0.05, THREE.SRGBColorSpace));
      colliders?.addSegment(x - 0.2, z, x + 0.2, z);
    });
    tronco.castShadow = copa.castShadow = true;
    tronco.name = 'ramblaTroncos'; copa.name = 'ramblaCopas';
    grupo.add(tronco, copa);
  }
  grupo.userData.arboles = lista.length;
  scene.add(grupo);
  return grupo;
}
